import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/orders';

const useOrderStore = create((set, get) => ({
    orders: [],
    loading: false,
    error: null,

    fetchMyOrders: async (token) => {
        if (!token) return;
        set({ loading: true, error: null });
        try {
            const { data } = await axios.get(`${API_URL}/mine`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            set({ orders: data, loading: false });
        } catch (err) {
            set({ 
                error: err.response?.data?.message || 'Failed to fetch orders', 
                loading: false 
            });
        }
    },

    clearOrders: () => set({ orders: [] })
}));

export default useOrderStore;
