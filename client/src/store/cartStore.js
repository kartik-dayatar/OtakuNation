import { create } from 'zustand';

const useCartStore = create((set, get) => ({
    items: [],

    addItem: (product, selectedSize) => {
        const items = get().items;
        const existingIndex = items.findIndex(
            (item) => item.id === product.id && item.selectedSize === selectedSize
        );

        if (existingIndex > -1) {
            const updated = [...items];
            updated[existingIndex] = {
                ...updated[existingIndex],
                quantity: updated[existingIndex].quantity + 1,
            };
            set({ items: updated });
        } else {
            set({ items: [...items, { ...product, selectedSize, quantity: 1 }] });
        }
    },

    removeItem: (id, selectedSize) => {
        set((state) => ({
            items: state.items.filter(
                (item) => !(item.id === id && item.selectedSize === selectedSize)
            ),
        }));
    },

    updateQuantity: (id, selectedSize, quantity) => {
        if (quantity <= 0) {
            get().removeItem(id, selectedSize);
            return;
        }
        set((state) => ({
            items: state.items.map((item) =>
                item.id === id && item.selectedSize === selectedSize
                    ? { ...item, quantity }
                    : item
            ),
        }));
    },

    getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
    },

    getCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
    },

    clearCart: () => set({ items: [] }),
}));

export default useCartStore;
