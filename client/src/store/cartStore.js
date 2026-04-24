import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users';

/**
 * Cart Store — Hybrid local-first + backend sync.
 *
 * GUESTS   → items live only in Zustand memory (lost on page refresh).
 * LOGGED IN → after login, local items are merged into the DB via /cart/sync.
 *             Subsequent add/remove/update calls hit the API directly so the
 *             cart is persisted cross-device.
 *
 * The `token` parameter accepted by mutating actions allows callers to pass
 * `useAuthStore.getState().token` without creating a circular import.
 */
const useCartStore = create((set, get) => ({
    items:   [],
    loading: false,
    error:   null,

    // ── Helpers ───────────────────────────────────────
    _authHeader: (token) => ({ Authorization: `Bearer ${token}` }),

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
            // Normalise: map DB cart items to the shape the UI expects
            const items = data.map((item) => ({
                _cartItemId: item._id,                   // subdocument _id
                id:          item.product?._id,
                name:        item.product?.name,
                price:       item.product?.price,
                comparePrice:item.product?.comparePrice,
                image:       item.product?.images?.find((i) => i.isPrimary)?.url
                             || item.product?.images?.[0]?.url
                             || null,
                slug:        item.product?.slug,
                stockQuantity: item.product?.stockQuantity,
                sizes:       item.product?.sizes?.map((s) => s.sizeLabel) || [],
                selectedSize: item.sizeLabel,
                quantity:    item.quantity,
            }));
            set({ items, loading: false });
        } catch {
            set({ loading: false });
        }
    },

    // ─────────────────────────────────────────────────
    // Sync local (guest) cart items to backend on login
    // ─────────────────────────────────────────────────
    syncToBackend: async (token) => {
        if (!token) return;
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
                _cartItemId: item._id,
                id:          item.product?._id,
                name:        item.product?.name,
                price:       item.product?.price,
                comparePrice:item.product?.comparePrice,
                image:       item.product?.images?.find((i) => i.isPrimary)?.url
                             || item.product?.images?.[0]?.url
                             || null,
                slug:        item.product?.slug,
                stockQuantity: item.product?.stockQuantity,
                sizes:       item.product?.sizes?.map((s) => s.sizeLabel) || [],
                selectedSize: item.sizeLabel,
                quantity:    item.quantity,
            }));
            set({ items, loading: false });
        } catch {
            set({ loading: false });
        }
    },

    // ─────────────────────────────────────────────────
    // Add item — hits backend if logged in, else local only
    // ─────────────────────────────────────────────────
    addItem: async (product, selectedSize, token) => {
        if (token) {
            // Logged in — persist to DB
            try {
                const { data } = await axios.post(
                    `${API_URL}/cart`,
                    { productId: product.id, sizeLabel: selectedSize || null, quantity: 1 },
                    { headers: get()._authHeader(token) }
                );
                const items = data.map((item) => ({
                    _cartItemId: item._id,
                    id:          item.product?._id,
                    name:        item.product?.name,
                    price:       item.product?.price,
                    comparePrice:item.product?.comparePrice,
                    image:       item.product?.images?.find((i) => i.isPrimary)?.url
                                 || item.product?.images?.[0]?.url
                                 || null,
                    slug:        item.product?.slug,
                    stockQuantity: item.product?.stockQuantity,
                    sizes:       item.product?.sizes?.map((s) => s.sizeLabel) || [],
                    selectedSize: item.sizeLabel,
                    quantity:    item.quantity,
                }));
                set({ items });
            } catch (err) {
                console.error('addItem error', err);
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
        }
    },

    // ─────────────────────────────────────────────────
    // Remove item
    // ─────────────────────────────────────────────────
    removeItem: async (id, selectedSize, token, cartItemId) => {
        if (token && cartItemId) {
            try {
                const { data } = await axios.delete(
                    `${API_URL}/cart/${cartItemId}`,
                    { headers: get()._authHeader(token) }
                );
                const items = data.map((item) => ({
                    _cartItemId: item._id,
                    id:          item.product?._id,
                    name:        item.product?.name,
                    price:       item.product?.price,
                    comparePrice:item.product?.comparePrice,
                    image:       item.product?.images?.find((i) => i.isPrimary)?.url
                                 || item.product?.images?.[0]?.url
                                 || null,
                    slug:        item.product?.slug,
                    stockQuantity: item.product?.stockQuantity,
                    sizes:       item.product?.sizes?.map((s) => s.sizeLabel) || [],
                    selectedSize: item.sizeLabel,
                    quantity:    item.quantity,
                }));
                set({ items });
            } catch (err) {
                console.error('removeItem error', err);
            }
        } else {
            set((state) => ({
                items: state.items.filter(
                    (item) => !(item.id === id && item.selectedSize === selectedSize)
                ),
            }));
        }
    },

    // ─────────────────────────────────────────────────
    // Update quantity
    // ─────────────────────────────────────────────────
    updateQuantity: async (id, selectedSize, quantity, token, cartItemId) => {
        if (token && cartItemId) {
            try {
                const { data } = await axios.put(
                    `${API_URL}/cart/${cartItemId}`,
                    { quantity },
                    { headers: get()._authHeader(token) }
                );
                const items = data.map((item) => ({
                    _cartItemId: item._id,
                    id:          item.product?._id,
                    name:        item.product?.name,
                    price:       item.product?.price,
                    comparePrice:item.product?.comparePrice,
                    image:       item.product?.images?.find((i) => i.isPrimary)?.url
                                 || item.product?.images?.[0]?.url
                                 || null,
                    slug:        item.product?.slug,
                    stockQuantity: item.product?.stockQuantity,
                    sizes:       item.product?.sizes?.map((s) => s.sizeLabel) || [],
                    selectedSize: item.sizeLabel,
                    quantity:    item.quantity,
                }));
                set({ items });
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
        }
    },

    // ─────────────────────────────────────────────────
    // Clear cart (e.g. after order placed)
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
    },

    // ─────────────────────────────────────────────────
    // Pure computed helpers
    // ─────────────────────────────────────────────────
    getTotal: () => get().items.reduce((t, item) => t + item.price * item.quantity, 0),
    getCount: () => get().items.reduce((c, item) => c + item.quantity, 0),
}));

export default useCartStore;
