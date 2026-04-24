import { create } from 'zustand';
import axios from 'axios';
import useAuthStore from './authStore';

const API_URL = 'http://localhost:5000/api';

const useSiteStore = create((set, get) => ({
    settings: {}, // Store flat settings map
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
            const { data } = await axios.get(`${API_URL}/settings`);
            
            set({ 
                settings: data,
                heroSlides:   data.hero_slides   || [],
                statsData:    data.stats_data    || [],
                whyUsData:    data.why_us_data   || [],
                testimonials: data.testimonials  || [],
                loading: false 
            });
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to fetch site settings.', loading: false });
        }
    },
}));

export default useSiteStore;
