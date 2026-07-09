import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

export const useWishlist = create(
  persist(
    (set, get) => ({
      wishlist: [],
      loading: false,

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

      toggleWishlist: async (userId, product) => {
        const currentWishlist = get().wishlist;
        const isExist = currentWishlist.find(item => item.id === product.id);

        if (isExist) {
          set({ wishlist: currentWishlist.filter(item => item.id !== product.id) });
        } else {
          set({ wishlist: [...currentWishlist, product] });
        }

        try {
          await api.post('/wishlist/toggle', {
            user_id: userId,
            product_id: product.id
          });
        } catch (err) {
          set({ wishlist: currentWishlist });
          console.error("Failed to sync wishlist to server", err);
        }
      },

      clearWishlist: () => set({ wishlist: [], loading: false }),
    }),
    {
      name: 'giva-wishlist',
      partialize: (state) => ({ wishlist: state.wishlist }),
    }
  )
);
