import { create } from 'zustand';
import api from '../utils/api';

export const useWishlist = create((set, get) => ({
  wishlist: [],
  loading: false,

  // 1. Fetch from Backend
  // This is called in App.js or Home.jsx when a user logs in.
  // The backend uses the Token to ensure User A only gets A's data.
  fetchWishlist: async (userId) => {
    if (!userId) return;
    set({ loading: true });
    try {
      const res = await api.get(`/wishlist/${userId}`);
      set({ wishlist: res.data, loading: false });
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      set({ loading: false });
    }
  },

  // 2. Toggle Logic (Optimistic + Backend Sync)
  toggleWishlist: async (userId, product) => {
    const currentWishlist = get().wishlist;
    const isExist = currentWishlist.find(item => item.id === product.id);

    // --- OPTIMISTIC UPDATE ---
    // Update UI immediately so it feels fast for the user
    if (isExist) {
      set({ wishlist: currentWishlist.filter(item => item.id !== product.id) });
    } else {
      set({ wishlist: [...currentWishlist, product] });
    }

    // --- BACKEND SYNC ---
    try {
      await api.post('/wishlist/toggle', { 
        user_id: userId, 
        product_id: product.id 
      });
    } catch (err) {
      // Rollback UI if the server request fails
      set({ wishlist: currentWishlist });
      console.error("Failed to sync wishlist to server", err);
    }
  },

  // 3. CRITICAL FOR USER ISOLATION
  // This is called by useAuth.logout() to ensure User B starts with an empty array.
  clearWishlist: () => {
    set({ wishlist: [], loading: false });
  }
}));