import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users';

/**
 * Wishlist Store — Backend-first persistence.
 *
 * GUESTS    → items live only in Zustand memory (no localStorage, no DB).
 * LOGGED IN → items are always read from and written to MongoDB.
 *             The backend is the single source of truth; we never cache
 *             the wishlist in localStorage to prevent cross-user leakage.
 *
 * On every page load with an existing token, fetchWishlist() is called
 * at the bottom of this file to restore the user's wishlist from DB.
 *
 * `token` must be passed in by the caller (from useAuthStore.getState().token)
 * to avoid circular imports.
 */
const useWishlistStore = create((set, get) => ({
    items:   [],   // array of populated product objects
    loading: false,

    _authHeader: (token) => ({ Authorization: `Bearer ${token}` }),

    // ─────────────────────────────────────────────────
    // Fetch wishlist from backend.
    // Called on page load (if token exists) and after login.
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
            // Guest — local memory only (not persisted anywhere)
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
    // isWishlisted — works for both local objects and DB refs
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

    // ─────────────────────────────────────────────────
    // Clear wishlist from memory on logout.
    // The DB copy is preserved — fetchWishlist() restores
    // it on the next login.
    // ─────────────────────────────────────────────────
    clearWishlist: () => set({ items: [] }),

    getCount: () => get().items.length,
}));

// On app load: if a valid token exists, fetch the wishlist fresh
// from the backend. This restores the wishlist after a page refresh
// for already-logged-in users. The backend is the source of truth;
// we never persist the wishlist to localStorage.
const initialToken = localStorage.getItem('on_token');
if (initialToken) {
    useWishlistStore.getState().fetchWishlist(initialToken);
}

export default useWishlistStore;
