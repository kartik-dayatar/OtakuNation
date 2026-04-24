import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const useArticleStore = create((set, get) => ({
    articles: [],
    loading: false,
    error: null,

    fetchArticles: async () => {
        if (get().loading || get().articles.length > 0) return;

        set({ loading: true, error: null });
        try {
            const { data } = await axios.get(`${API_URL}/articles`);
            set({ articles: data, loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to fetch articles.', loading: false });
        }
    },

    // Utilities to easily separate news and blogs
    getNews: () => {
        return get().articles.filter(a => a.type === 'news');
    },

    getBlogs: () => {
        return get().articles.filter(a => a.type === 'blog');
    }
}));

export default useArticleStore;
