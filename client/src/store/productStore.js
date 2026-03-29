import { create } from 'zustand';
import { products as initialProducts } from '../data/products';

const useProductStore = create((set, get) => ({
    products: initialProducts,

    // Get product by ID
    getProductById: (id) => {
        return get().products.find((p) => p.id === parseInt(id));
    },

    // Get products by Category
    getProductsByCategory: (category) => {
        if (category === 'all') return get().products;
        return get().products.filter((p) => p.category === category);
    },

    // Get Trending Products
    getTrendingProducts: () => {
        return get().products.filter((p) => p.badge).slice(0, 8);
    },

    // Get New Arrivals
    getNewArrivals: () => {
        // Sort by ID descending (assuming higher ID = newer) or just slice last inserted
        return [...get().products].sort((a, b) => b.id - a.id).slice(0, 4);
    },

    // Admin: Add Product
    addProduct: (newProduct) => {
        set((state) => {
            const nextId = state.products.length > 0
                ? Math.max(...state.products.map(p => p.id)) + 1
                : 1;

            const productWithId = {
                ...newProduct,
                id: nextId,
                reviews: 0,
                rating: 0
            };
            return { products: [productWithId, ...state.products] };
        });
    },

    // Admin: Update Product
    updateProduct: (id, updatedFields) => {
        set((state) => ({
            products: state.products.map((p) =>
                p.id === parseInt(id) ? { ...p, ...updatedFields } : p
            )
        }));
    },

    // Admin: Delete Product
    deleteProduct: (id) => {
        set((state) => ({
            products: state.products.filter((p) => p.id !== parseInt(id))
        }));
    }
}));

export default useProductStore;
