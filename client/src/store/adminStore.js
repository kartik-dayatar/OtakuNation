import { create } from 'zustand';
import axios from 'axios';
import useAuthStore from './authStore';

const API_ADMIN = 'http://localhost:5000/api/admin';
const API_CATEGORIES = 'http://localhost:5000/api/categories';
const API_SERIES = 'http://localhost:5000/api/series';

const useAdminStore = create((set, get) => ({
    stats: {
        revenue: 0,
        orders: 0,
        pendingOrders: 0,
        customers: 0,
        lowStockItems: 0
    },
    settings: {
        storeName: 'OtakuNation',
        contactEmail: 'support@otakunation.com',
        phone: '+91 999 999 9999',
        currency: 'INR',
        taxRate: '18',
        theme: 'System',
        enableReviews: true,
        maintenanceMode: false
    },
    categories: [],
    series: [],
    orders: [],
    customers: [],
    loading: false,
    error: null,

    fetchDashboardStats: async () => {
        set({ loading: true, error: null });
        try {
            const { data } = await axios.get(`${API_ADMIN}/stats`, {
                headers: useAuthStore.getState().getAuthHeader()
            });
            set({ stats: data, loading: false });
        } catch (err) {
            set({ loading: false, error: err.response?.data?.message || 'Failed to fetch stats' });
        }
    },

    fetchSettings: async () => {
        set({ loading: true, error: null });
        try {
            const { data } = await axios.get(`${API_ADMIN}/settings`, {
                headers: useAuthStore.getState().getAuthHeader()
            });
            set({ settings: data, loading: false });
        } catch (err) {
            set({ loading: false, error: err.response?.data?.message || 'Failed to fetch settings' });
        }
    },

    updateSettings: async (updates) => {
        set({ loading: true, error: null });
        try {
            await axios.put(`${API_ADMIN}/settings`, updates, {
                headers: useAuthStore.getState().getAuthHeader()
            });
            // Update local state instantly based on payload
            set((state) => ({ settings: { ...state.settings, ...updates }, loading: false }));
        } catch (err) {
            set({ loading: false, error: err.response?.data?.message || 'Failed to update settings' });
            throw err;
        }
    },

    fetchCategoriesAndSeries: async () => {
        try {
            const [catsRes, seriesRes] = await Promise.all([
                axios.get(API_CATEGORIES),
                axios.get(API_SERIES)
            ]);
            set({ categories: catsRes.data, series: seriesRes.data });
        } catch (err) {
            set({ error: 'Failed to fetch taxonomies' });
        }
    },

    fetchOrders: async () => {
        set({ loading: true, error: null });
        try {
            const { data } = await axios.get('http://localhost:5000/api/orders', {
                headers: useAuthStore.getState().getAuthHeader()
            });
            // Map DB array to mock data shape
            const mappedOrders = data.orders.map(o => {
                 const orderDate = new Date(o.createdAt);
                 return {
                    id: o.orderNumber,
                    dbId: o._id,
                    date: orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    time: orderDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    customer: o.user ? `${o.user.firstName} ${o.user.lastName}` : 'Guest',
                    email: o.user ? o.user.email : 'N/A',
                    total: o.totalAmount,
                    payment: o.paymentStatus === 'paid' ? 'Paid' : (o.paymentStatus === 'refunded' ? 'Refunded' : 'Unpaid'),
                    fulfillment: o.status.charAt(0).toUpperCase() + o.status.slice(1) // Pending, Processing, Delivered, Cancelled
                 };
            });
            set({ orders: mappedOrders, loading: false });
        } catch (err) {
            set({ loading: false, error: err.response?.data?.message || 'Failed to fetch orders' });
        }
    },

    fetchCustomers: async () => {
        set({ loading: true, error: null });
        try {
            const { data } = await axios.get('http://localhost:5000/api/users', {
                headers: useAuthStore.getState().getAuthHeader()
            });
            // Map DB array to mock data shape
            const mappedCustomers = data.filter(u => u.role === 'customer').map((u, index) => {
                const joinedDate = new Date(u.createdAt);
                
                // Randomly assign one of the mock colors for avatar
                const colors = ['#4f46e5', '#6b7280', '#16a34a', '#9ca3af', '#eab308'];
                
                return {
                    id: u._id,
                    name: `${u.firstName} ${u.lastName}`,
                    email: u.email,
                    orders: 0, // In reality, we'd need an aggregate query, but we stub this for UI format
                    spent: 0,
                    joined: joinedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    status: u.isActive ? 'Active' : 'Inactive',
                    color: colors[index % colors.length]
                };
            });
            set({ customers: mappedCustomers, loading: false });
        } catch (err) {
            set({ loading: false, error: err.response?.data?.message || 'Failed to fetch customers' });
        }
    }
}));

export default useAdminStore;
