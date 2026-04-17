import { create } from 'zustand';
import axios from 'axios';

const useProductStore = create((set, get) => ({
    products: [],
    categories: [],
    animeSeries: [],
    loading: false,
    loadingCategories: false,

    fetchProducts: async (params = {}) => {
        set({ loading: true });
        try {
            const queryParams = new URLSearchParams();
            
            // Add limit and page defaults
            queryParams.append('limit', params.limit || 100);
            if (params.page) queryParams.append('page', params.page);
            
            // Add filters
            if (params.category && params.category !== 'all') queryParams.append('category', params.category);
            if (params.status && params.status !== 'all') queryParams.append('status', params.status);
            if (params.sort) queryParams.append('sort', params.sort);
            if (params.search) queryParams.append('search', params.search);
            if (params.adminView) queryParams.append('adminView', params.adminView);

            const { data } = await axios.get(`http://localhost:5000/api/products?${queryParams.toString()}`);
            set({ products: data.products, loading: false });
        } catch (err) {
            console.error('Error fetching products:', err);
            set({ loading: false });
        }
    },

    fetchCategories: async () => {
        set({ loadingCategories: true });
        try {
            const { data } = await axios.get('http://localhost:5000/api/categories');
            set({ categories: data, loadingCategories: false });
        } catch (err) {
            console.error('Error fetching categories:', err);
            set({ loadingCategories: false });
        }
    },

    fetchAnimeSeries: async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/series');
            set({ animeSeries: data });
        } catch (err) {
            console.error('Error fetching anime series:', err);
        }
    },

    // Get product by ID (legacy or obj id)
    getProductById: (id) => {
        return get().products.find((p) => p.id == id || p.legacyId == id);
    },

    // Get products by Category
    getProductsByCategory: (category) => {
        if (category === 'all') return get().products;
        return get().products.filter((p) => p.category === category);
    },

    // Get Trending Products
    getTrendingProducts: () => {
        return get().products.filter((p) => p.bestSeller || p.featured).slice(0, 8);
    },

    // Get New Arrivals
    getNewArrivals: () => {
        return get().products.filter((p) => p.newArrival).slice(0, 4);
    },

    // Admin: Add Product calls API
    addProduct: async (productData) => {
        try {
            const isFormData = productData instanceof FormData;
            const { data } = await axios.post('http://localhost:5000/api/products', productData, {
                 headers: { 
                     Authorization: `Bearer ${localStorage.getItem('on_token')}`,
                     'Content-Type': isFormData ? 'multipart/form-data' : 'application/json'
                 }
            });
            set((state) => ({ products: [data, ...state.products] }));
            get().fetchProducts();
            return data;
        } catch(err) {
            console.error(err);
            throw err;
        }
    },

    // Admin: Update Product calls API
    updateProduct: async (id, productData) => {
        try {
            const isFormData = productData instanceof FormData;
            const { data } = await axios.put(`http://localhost:5000/api/products/${id}`, productData, {
                headers: { 
                    Authorization: `Bearer ${localStorage.getItem('on_token')}`,
                    'Content-Type': isFormData ? 'multipart/form-data' : 'application/json'
                }
            });
            set((state) => ({
                products: state.products.map((p) => p.id == id ? data : p)
            }));
            get().fetchProducts();
            return data;
        } catch(err) {
             console.error(err);
             throw err;
        }
    },

    // Admin: Delete Product calls API
    deleteProduct: async (id) => {
        try {
             await axios.delete(`http://localhost:5000/api/products/${id}`, {
                 headers: { Authorization: `Bearer ${localStorage.getItem('on_token')}` }
             });
             set((state) => ({
                 products: state.products.filter((p) => p.id != id)
             }));
        } catch(err) {
             console.error(err);
        }
    },

    // User: Add Review
    addReview: async (productId, review) => {
         try {
             await axios.post(`http://localhost:5000/api/products/${productId}/reviews`, review, {
                  headers: { Authorization: `Bearer ${localStorage.getItem('on_token')}` }
             });
             // refetch to get updated rating logic
             get().fetchProducts();
         } catch(err) {
             console.error(err);
         }
    }
}));

export default useProductStore;
