import { create } from 'zustand';

const useWishlistStore = create((set, get) => ({
    items: [], // array of product objects

    toggleItem: (product) => {
        const items = get().items;
        const exists = items.find((p) => p.id === product.id);
        if (exists) {
            set({ items: items.filter((p) => p.id !== product.id) });
        } else {
            set({ items: [...items, product] });
        }
    },

    isWishlisted: (id) => {
        return get().items.some((p) => p.id === id);
    },

    removeItem: (id) => {
        set((state) => ({ items: state.items.filter((p) => p.id !== id) }));
    },

    getCount: () => get().items.length,
}));

export default useWishlistStore;
