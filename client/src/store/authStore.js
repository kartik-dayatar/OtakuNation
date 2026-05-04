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
            // Detect if user was browsing as a guest (no prior token).
            // isGuest=true → merge any guest cart items into backend.
            // isGuest=false → just fetch fresh from backend (prevents qty doubling).
            const wasGuest = !localStorage.getItem('on_token');
            localStorage.setItem('on_token', data.token);
            localStorage.setItem('on_user',  JSON.stringify(data.user));
            set({ token: data.token, user: data.user, loading: false });
            await useCartStore.getState().syncToBackend(data.token, data.user, wasGuest);
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
        localStorage.removeItem('on_wishlist');
        set({ token: null, user: null, error: null });
        // Clear in-memory cart (items: []) so the logged-out UI is empty.
        // localStorage cart (on_cart) is intentionally preserved as a
        // guest cart for the same user if they log back in. A different
        // user's stale cart is handled by the user-isolation check in
        // cartStore.syncToBackend() at their next login.
        useCartStore.getState().resetCartState();
        // Clear wishlist from memory and localStorage.
        useWishlistStore.getState().clearWishlist();
    },

    // ── Forgot/Reset Password ────────────────────────
    forgotPassword: async (email) => {
        set({ loading: true, error: null });
        try {
            const { data } = await axios.post(`${API_URL}/forgot-password`, { email });
            set({ loading: false });
            return { success: true, message: data.message };
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to send reset link';
            set({ loading: false, error: msg });
            return { success: false, message: msg };
        }
    },

    resetPassword: async (token, password) => {
        set({ loading: true, error: null });
        try {
            const { data } = await axios.post(`${API_URL}/reset-password/${token}`, { password });
            set({ loading: false });
            return { success: true, message: data.message };
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to reset password';
            set({ loading: false, error: msg });
            return { success: false, message: msg };
        }
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

    updateAddress: async (addrId, addressData) => {
        set({ loading: true, error: null });
        try {
            const { data } = await axios.put(`${API_URL}/addresses/${addrId}`, addressData, { headers: get().getAuthHeader() });
            const user = get().user;
            const updatedUser = { ...user, addresses: data };
            localStorage.setItem('on_user', JSON.stringify(updatedUser));
            set({ user: updatedUser, loading: false });
            return { success: true, addresses: data };
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update address';
            set({ loading: false, error: msg });
            return { success: false, message: msg };
        }
    },

    setDefaultAddress: async (addrId) => {
        set({ loading: true, error: null });
        try {
            const { data } = await axios.patch(`${API_URL}/addresses/${addrId}/default`, {}, { headers: get().getAuthHeader() });
            const user = get().user;
            const updatedUser = { ...user, addresses: data };
            localStorage.setItem('on_user', JSON.stringify(updatedUser));
            set({ user: updatedUser, loading: false });
            return { success: true, addresses: data };
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to set default address';
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
