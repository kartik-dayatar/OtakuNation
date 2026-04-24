import { create } from 'zustand';
import axios from 'axios';
import useCartStore from './cartStore';
import useWishlistStore from './wishlistStore';


const API_URL = 'http://localhost:5000/api/users';

// Helper: load initial state from localStorage
const loadAuth = () => {
    try {
        const token = localStorage.getItem('on_token');
        const user  = JSON.parse(localStorage.getItem('on_user') || 'null');
        return { token, user };
    } catch {
        return { token: null, user: null };
    }
};

const useAuthStore = create((set, get) => ({
    ...loadAuth(),
    loading: false,
    error:   null,

    // ── Register ────────────────────────────────────
    register: async ({ firstName, lastName, email, password }) => {
        set({ loading: true, error: null });
        try {
            const { data } = await axios.post(`${API_URL}/register`, {
                firstName, lastName, email, password,
            });
            localStorage.setItem('on_token', data.token);
            localStorage.setItem('on_user',  JSON.stringify(data.user));
            set({ token: data.token, user: data.user, loading: false });
            return { success: true };
        } catch (err) {
            const msg = err.response?.data?.message || 'Registration failed';
            set({ loading: false, error: msg });
            return { success: false, message: msg };
        }
    },

    // ── Login ────────────────────────────────────────
    login: async ({ email, password }) => {
        set({ loading: true, error: null });
        try {
            const { data } = await axios.post(`${API_URL}/login`, { email, password });
            localStorage.setItem('on_token', data.token);
            localStorage.setItem('on_user',  JSON.stringify(data.user));
            set({ token: data.token, user: data.user, loading: false });
            // Sync local guest cart to backend, then fetch wishlist
            await useCartStore.getState().syncToBackend(data.token);
            await useWishlistStore.getState().fetchWishlist(data.token);
            return { success: true, user: data.user };
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed';
            set({ loading: false, error: msg });
            return { success: false, message: msg };
        }
    },


    // ── Admin Login ──────────────────────────────────
    adminLogin: async ({ email, password }) => {
        set({ loading: true, error: null });
        try {
            const { data } = await axios.post(`${API_URL}/admin/login`, { email, password });
            localStorage.setItem('on_token', data.token);
            localStorage.setItem('on_user',  JSON.stringify(data.user));
            set({ token: data.token, user: data.user, loading: false });
            return { success: true, user: data.user };
        } catch (err) {
            const msg = err.response?.data?.message || 'Admin login failed';
            set({ loading: false, error: msg });
            return { success: false, message: msg };
        }
    },

    // ── Logout ───────────────────────────────────────
    logout: () => {
        localStorage.removeItem('on_token');
        localStorage.removeItem('on_user');
        set({ token: null, user: null, error: null });
        // Clear local cart and wishlist memory on logout
        useCartStore.getState().clearCart(null);
        useWishlistStore.getState().clearWishlist();
    },

    // ── Profile and Addresses ────────────────────────
    fetchProfile: async () => {
        set({ loading: true, error: null });
        try {
            const { data } = await axios.get(`${API_URL}/profile`, { headers: get().getAuthHeader() });
            localStorage.setItem('on_user', JSON.stringify(data));
            set({ user: data, loading: false });
            return { success: true, user: data };
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to fetch profile';
            set({ loading: false, error: msg });
            return { success: false, message: msg };
        }
    },

    updateProfile: async (profileData) => {
        set({ loading: true, error: null });
        try {
            const { data } = await axios.put(`${API_URL}/profile`, profileData, { headers: get().getAuthHeader() });
            localStorage.setItem('on_user', JSON.stringify(data));
            set({ user: data, loading: false });
            return { success: true, user: data };
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update profile';
            set({ loading: false, error: msg });
            return { success: false, message: msg };
        }
    },

    addAddress: async (addressData) => {
        set({ loading: true, error: null });
        try {
            const { data } = await axios.post(`${API_URL}/addresses`, addressData, { headers: get().getAuthHeader() });
            const user = get().user;
            const updatedUser = { ...user, addresses: data };
            localStorage.setItem('on_user', JSON.stringify(updatedUser));
            set({ user: updatedUser, loading: false });
            return { success: true, addresses: data };
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to add address';
            set({ loading: false, error: msg });
            return { success: false, message: msg };
        }
    },

    deleteAddress: async (addrId) => {
        set({ loading: true, error: null });
        try {
            const { data } = await axios.delete(`${API_URL}/addresses/${addrId}`, { headers: get().getAuthHeader() });
            const user = get().user;
            const updatedUser = { ...user, addresses: data };
            localStorage.setItem('on_user', JSON.stringify(updatedUser));
            set({ user: updatedUser, loading: false });
            return { success: true, addresses: data };
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to delete address';
            set({ loading: false, error: msg });
            return { success: false, message: msg };
        }
    },


    // ── Helpers ──────────────────────────────────────
    isLoggedIn:  () => !!get().token,
    isAdmin:     () => get().user?.role === 'admin',
    isCustomer:  () => get().user?.role === 'customer',
    getAuthHeader: () => ({ Authorization: `Bearer ${get().token}` }),

    clearError: () => set({ error: null }),
}));

export default useAuthStore;
