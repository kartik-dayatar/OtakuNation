import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users';

/**
 * Wishlist Store — Hybrid local-first + backend sync.
 *
 * GUESTS   → wishlist items live only in Zustand memory.
 * LOGGED IN → items are synced to/from MongoDB via the /wishlist endpoints.
 *
 * `token` must be passed in from useAuthStore.getState().token by the caller
 * to avoid circular imports.
 */
const useWishlistStore = create((set, get) => ({
    items:   [],  // array of populated product objects
    loading: false,

    _authHeader: (token) => ({ Authorization: `Bearer ${token}` }),

    // ─────────────────────────────────────────────────
    // Fetch wishlist from backend (called after login)
    // ─────────────────────────────────────────────────
    fetchWishlist: async (token) => {
        if (!token) return;
        try {
            set({ loading: true });
            const { data } = await axios.get(`${API_URL}/wishlist`, {
                headers: get()._authHeader(token),
            });
            set({ items: data, loading: false });
        } catch {
            set({ loading: false });
        }
    },

    // ─────────────────────────────────────────────────
    // Toggle product in/out of wishlist
    // ─────────────────────────────────────────────────
    toggleItem: async (product, token) => {
        if (token) {
            // Logged in — persist via API
            try {
                const { data } = await axios.post(
                    `${API_URL}/wishlist/toggle`,
                    { productId: product.id || product._id },
                    { headers: get()._authHeader(token) }
                );
                // data.wishlist is an array of populated product docs
                set({ items: data.wishlist });
                return data.wishlisted;
            } catch (err) {
                console.error('toggleWishlist error', err);
                return null;
            }
        } else {
            // Guest — local only
            const items = get().items;
            const exists = items.find((p) => p.id === product.id || p._id === product._id);
            if (exists) {
                set({ items: items.filter((p) => p.id !== product.id && p._id !== product._id) });
                return false;
            } else {
                set({ items: [...items, product] });
                return true;
            }
        }
    },

    // ─────────────────────────────────────────────────
    // isWishlisted — works for both local product objects and DB refs
    // ─────────────────────────────────────────────────
    isWishlisted: (id) => {
        return get().items.some(
            (p) => p.id === id || p._id?.toString() === id?.toString()
        );
    },

    // ─────────────────────────────────────────────────
    // Remove item
    // ─────────────────────────────────────────────────
    removeItem: async (id, token) => {
        if (token) {
            await get().toggleItem({ id }, token);
        } else {
            set((state) => ({
                items: state.items.filter((p) => p.id !== id && p._id !== id),
            }));
        }
    },

    // Clear on logout
    clearWishlist: () => set({ items: [] }),

    getCount: () => get().items.length,
}));

export default useWishlistStore;
