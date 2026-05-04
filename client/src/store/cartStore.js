import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users';

/**
 * Cart Store — Hybrid local-first + backend sync.
 *
 * GUESTS   → items live in Zustand memory + localStorage (on_cart).
 * LOGGED IN → after login, local items are merged into the DB via /cart/sync.
 *             Subsequent add/remove/update calls hit the API directly.
 *
 * USER ISOLATION:
 * - on_last_user in localStorage tracks which user's cart is stored.
 * - If a DIFFERENT user logs in, localStorage cart is wiped before sync
 *   so they never see another user's items.
 * - On logout, in-memory items are cleared via resetCartState(), but
 *   localStorage cart is kept so the same user gets it back on next login.
 */
const savedCart = () => {
    try {
        const data = localStorage.getItem('on_cart');
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

const useCartStore = create((set, get) => ({
    items:   savedCart(),
    loading: false,
    error:   null,

    // ── Helpers ───────────────────────────────────────
    _authHeader: (token) => ({ Authorization: `Bearer ${token}` }),
    _persist: () => {
        localStorage.setItem('on_cart', JSON.stringify(get().items));
    },

    // ─────────────────────────────────────────────────
    // Fetch cart from backend (called after login)
    // ─────────────────────────────────────────────────
    fetchCart: async (token) => {
        if (!token) return;
        try {
            set({ loading: true });
            const { data } = await axios.get(`${API_URL}/cart`, {
                headers: get()._authHeader(token),
            });
            const items = data.map((item) => ({
                _cartItemId:  item._id,
                id:           item.product?._id,
                name:         item.product?.name,
                price:        item.product?.price,
                comparePrice: item.product?.comparePrice,
                image:        item.product?.images?.find((i) => i.isPrimary)?.url
                              || item.product?.images?.[0]?.url
                              || null,
                slug:         item.product?.slug,
                stockQuantity: item.product?.stockQuantity,
                sizes:        item.product?.sizes?.map((s) => s.sizeLabel) || [],
                selectedSize: item.sizeLabel,
                quantity:     item.quantity,
            }));
            set({ items, loading: false });
            get()._persist();
        } catch {
            set({ loading: false });
        }
    },

    // ─────────────────────────────────────────────────
    // Sync local (guest) cart to backend on login.
    //
    // user    — the newly logged-in user object.
    // isGuest — true only when the user was browsing as a
    //           guest (no token) and is now logging in for
    //           the first time in this session. In all other
    //           cases (re-login, page refresh) we just fetch
    //           fresh from the backend to avoid doubling qtys.
    // ─────────────────────────────────────────────────
    syncToBackend: async (token, user, isGuest = false) => {
        if (!token) return;

        // ── USER ISOLATION ────────────────────────────
        if (user?._id) {
            const lastUserId = localStorage.getItem('on_last_user');
            if (lastUserId && lastUserId !== String(user._id)) {
                // A different user is logging in — discard the previous
                // user's cart so this user starts clean.
                localStorage.removeItem('on_cart');
                set({ items: [] });
            }
            localStorage.setItem('on_last_user', String(user._id));
        }

        // ── RE-LOGIN / PAGE-REFRESH ───────────────────
        // If the user was already logged in before (not a fresh
        // guest session), always fetch from backend. The backend
        // is the single source of truth for logged-in users and
        // we must NOT sync localStorage items back up (that would
        // double quantities because syncCart sums them).
        if (!isGuest) {
            await get().fetchCart(token);
            return;
        }

        // ── GUEST → LOGIN MERGE ───────────────────────
        // User was browsing as guest and just logged in.
        // Push any locally added guest items to the backend.
        const localItems = get().items;

        if (localItems.length === 0) {
            await get().fetchCart(token);
            return;
        }

        try {
            set({ loading: true });
            const payload = localItems.map((item) => ({
                productId: item.id,
                sizeLabel: item.selectedSize || null,
                quantity:  item.quantity,
            }));
            const { data } = await axios.post(
                `${API_URL}/cart/sync`,
                { items: payload },
                { headers: get()._authHeader(token) }
            );
            const items = data.map((item) => ({
                _cartItemId:  item._id,
                id:           item.product?._id,
                name:         item.product?.name,
                price:        item.product?.price,
                comparePrice: item.product?.comparePrice,
                image:        item.product?.images?.find((i) => i.isPrimary)?.url
                              || item.product?.images?.[0]?.url
                              || null,
                slug:         item.product?.slug,
                stockQuantity: item.product?.stockQuantity,
                sizes:        item.product?.sizes?.map((s) => s.sizeLabel) || [],
                selectedSize: item.sizeLabel,
                quantity:     item.quantity,
            }));
            set({ items, loading: false });
            get()._persist();
        } catch {
            set({ loading: false });
        }
    },

    // ─────────────────────────────────────────────────
    // Add item — hits backend if logged in, else local only
    // ─────────────────────────────────────────────────
    addItem: async (product, selectedSize, token) => {
        if (token) {
            // ── Optimistic update ─────────────────────
            // Write to memory + localStorage immediately so if the user
            // logs out before the API responds, the item is not lost.
            const currentItems = get().items;
            const existingIdx = currentItems.findIndex(
                (item) => item.id === (product.id || product._id) && item.selectedSize === selectedSize
            );
            let optimisticItems;
            if (existingIdx > -1) {
                optimisticItems = currentItems.map((item, i) =>
                    i === existingIdx ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                optimisticItems = [...currentItems, {
                    id:           product.id || product._id,
                    name:         product.name,
                    price:        product.price,
                    comparePrice: product.comparePrice,
                    image:        product.image || product.images?.find((i) => i.isPrimary)?.url || product.images?.[0]?.url || null,
                    slug:         product.slug,
                    stockQuantity: product.stockQuantity,
                    sizes:        product.sizes,
                    selectedSize,
                    quantity:     1,
                }];
            }
            set({ items: optimisticItems });
            get()._persist();

            // ── Persist to backend ────────────────────
            // API call immediately saves to DB. Response replaces
            // the optimistic data with server-confirmed data (including _cartItemId).
            try {
                const { data } = await axios.post(
                    `${API_URL}/cart`,
                    { productId: product.id || product._id, sizeLabel: selectedSize || null, quantity: 1 },
                    { headers: get()._authHeader(token) }
                );
                const items = data.map((item) => ({
                    _cartItemId:  item._id,
                    id:           item.product?._id,
                    name:         item.product?.name,
                    price:        item.product?.price,
                    comparePrice: item.product?.comparePrice,
                    image:        item.product?.images?.find((i) => i.isPrimary)?.url
                                  || item.product?.images?.[0]?.url
                                  || null,
                    slug:         item.product?.slug,
                    stockQuantity: item.product?.stockQuantity,
                    sizes:        item.product?.sizes?.map((s) => s.sizeLabel) || [],
                    selectedSize: item.sizeLabel,
                    quantity:     item.quantity,
                }));
                set({ items });
                get()._persist();
            } catch (err) {
                console.error('addItem error', err);
                // Optimistic update already applied — item stays in UI and localStorage
            }
        } else {
            // Guest — local only
            const items = get().items;
            const existingIdx = items.findIndex(
                (item) => item.id === product.id && item.selectedSize === selectedSize
            );
            if (existingIdx > -1) {
                const updated = [...items];
                updated[existingIdx] = { ...updated[existingIdx], quantity: updated[existingIdx].quantity + 1 };
                set({ items: updated });
            } else {
                set({ items: [...items, { ...product, selectedSize, quantity: 1 }] });
            }
            get()._persist();
        }
    },

    // ─────────────────────────────────────────────────
    // Remove item
    // ─────────────────────────────────────────────────
    removeItem: async (id, selectedSize, token, cartItemId) => {
        if (token && cartItemId) {
            // ── Optimistic update ─────────────────────
            // Remove from memory + localStorage immediately so the UI
            // responds instantly, regardless of API latency.
            const snapshot = get().items; // keep for potential rollback
            set((state) => ({
                items: state.items.filter(
                    (item) => !(item.id === id && item.selectedSize === selectedSize)
                ),
            }));
            get()._persist();

            // ── Persist to backend ────────────────────
            try {
                const { data } = await axios.delete(
                    `${API_URL}/cart/${cartItemId}`,
                    { headers: get()._authHeader(token) }
                );
                // Replace with authoritative server state (includes all _cartItemIds)
                const items = data.map((item) => ({
                    _cartItemId:  item._id,
                    id:           item.product?._id,
                    name:         item.product?.name,
                    price:        item.product?.price,
                    comparePrice: item.product?.comparePrice,
                    image:        item.product?.images?.find((i) => i.isPrimary)?.url
                                  || item.product?.images?.[0]?.url
                                  || null,
                    slug:         item.product?.slug,
                    stockQuantity: item.product?.stockQuantity,
                    sizes:        item.product?.sizes?.map((s) => s.sizeLabel) || [],
                    selectedSize: item.sizeLabel,
                    quantity:     item.quantity,
                }));
                set({ items });
                get()._persist();
            } catch (err) {
                console.error('removeItem error', err);
                // Optimistic removal already applied — do not roll back
                // (user already sees it gone; restoring would be confusing).
            }
        } else {
            set((state) => ({
                items: state.items.filter(
                    (item) => !(item.id === id && item.selectedSize === selectedSize)
                ),
            }));
            get()._persist();
        }
    },

    // ─────────────────────────────────────────────────
    // Update quantity
    // ─────────────────────────────────────────────────
    updateQuantity: async (id, selectedSize, quantity, token, cartItemId) => {
        if (token && cartItemId) {
            // ── Optimistic update ─────────────────────
            if (quantity <= 0) {
                // Treat as remove
                get().removeItem(id, selectedSize, token, cartItemId);
                return;
            }
            set((state) => ({
                items: state.items.map((item) =>
                    item.id === id && item.selectedSize === selectedSize
                        ? { ...item, quantity }
                        : item
                ),
            }));
            get()._persist();

            // ── Persist to backend ────────────────────
            try {
                const { data } = await axios.put(
                    `${API_URL}/cart/${cartItemId}`,
                    { quantity },
                    { headers: get()._authHeader(token) }
                );
                const items = data.map((item) => ({
                    _cartItemId:  item._id,
                    id:           item.product?._id,
                    name:         item.product?.name,
                    price:        item.product?.price,
                    comparePrice: item.product?.comparePrice,
                    image:        item.product?.images?.find((i) => i.isPrimary)?.url
                                  || item.product?.images?.[0]?.url
                                  || null,
                    slug:         item.product?.slug,
                    stockQuantity: item.product?.stockQuantity,
                    sizes:        item.product?.sizes?.map((s) => s.sizeLabel) || [],
                    selectedSize: item.sizeLabel,
                    quantity:     item.quantity,
                }));
                set({ items });
                get()._persist();
            } catch (err) {
                console.error('updateQuantity error', err);
            }
        } else {
            if (quantity <= 0) {
                get().removeItem(id, selectedSize, null, null);
                return;
            }
            set((state) => ({
                items: state.items.map((item) =>
                    item.id === id && item.selectedSize === selectedSize
                        ? { ...item, quantity }
                        : item
                ),
            }));
            get()._persist();
        }
    },

    // ─────────────────────────────────────────────────
    // Clear cart — ONLY called after a successful order.
    // Hits the backend to empty the DB cart, clears memory
    // and localStorage.
    // ─────────────────────────────────────────────────
    clearCart: async (token) => {
        if (token) {
            try {
                await axios.delete(`${API_URL}/cart`, {
                    headers: get()._authHeader(token),
                });
            } catch (err) {
                console.error('clearCart error', err);
            }
        }
        set({ items: [] });
        localStorage.removeItem('on_cart');
    },

    // ─────────────────────────────────────────────────
    // Reset in-memory state on logout.
    // Clears Zustand items so the logged-out UI shows an
    // empty cart, but localStorage (on_cart) is preserved
    // as an anonymous guest cart for the same user if they
    // log back in.
    // ─────────────────────────────────────────────────
    resetCartState: () => {
        set({ items: [] });
    },

    // ─────────────────────────────────────────────────
    // Pure computed helpers
    // ─────────────────────────────────────────────────
    getTotal: () => get().items.reduce((t, item) => t + item.price * item.quantity, 0),
    getCount: () => get().items.reduce((c, item) => c + item.quantity, 0),
}));

// On app load: if a valid token exists, fetch the cart fresh
// from the backend. The backend is the source of truth for
// logged-in users. We do NOT call syncToBackend here because
// that would merge localStorage items into the backend and
// double quantities (since syncCart now sums quantities).
const initialToken = localStorage.getItem('on_token');
if (initialToken) {
    useCartStore.getState().fetchCart(initialToken);
}

export default useCartStore;
