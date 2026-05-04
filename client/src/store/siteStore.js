import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const useSiteStore = create((set, get) => ({
    settings: {},
    loading: false,
    error: null,

    // Specific typed states derived from settings mapping
    heroSlides: [],
    statsData: [],
    whyUsData: [],
    testimonials: [],

    fetchSettings: async () => {
        // Prevent concurrent or duplicate fetches if already loaded
        if (get().loading || Object.keys(get().settings).length > 0) return;

        set({ loading: true, error: null });
        try {
            const { data } = await axios.get('http://localhost:5000/api/settings/public-settings');
            
            set({ 
                settings: data,
                heroSlides:   data.heroSlides   || [],
                statsData:    data.statsData    || [],
                whyUsData:    data.whyUsData    || [],
                testimonials: data.testimonials || [],
                loading: false 
            });
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to fetch site settings.', loading: false });
        }
    },
}));

export default useSiteStore;
