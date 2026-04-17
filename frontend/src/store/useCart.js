import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api'; 

export const useCart = create(
  (set, get) => ({
    cart: [],
    
    // 1. Load Data from Backend (Used when User A or B logs in)
    setCart: (items) => set({ cart: items }),

    // 2. Add to Cart with Backend Sync
    addToCart: async (product, userId = null) => {
      const currentCart = get().cart;
      
      // Optimistic Update
      const existing = currentCart.find(item => item.id === product.id);
      if (existing) {
        set({
          cart: currentCart.map(item =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          )
        });
      } else {
        set({ cart: [...currentCart, { ...product, quantity: 1 }] });
      }

      // Sync with Backend for specific User ID
      if (userId) {
        try {
          await api.post('/cart/add', { 
            user_id: userId, 
            product: product 
          });
        } catch (err) {
          console.error("Cart Add Sync Failed:", err);
        }
      }
    },

    // 3. Remove Item with Backend Sync
    removeItem: async (id, userId = null) => {
      set((state) => ({
        cart: state.cart.filter(item => item.id !== id)
      }));

      if (userId) {
        try {
          await api.post('/cart/remove', { 
            user_id: userId, 
            product_id: id 
          });
        } catch (err) {
          console.error("Cart Remove Sync Failed:", err);
        }
      }
    },

    // 4. Update Quantity (Already has your logic)
    updateQuantity: async (productId, newQty, userId = null) => {
      const currentCart = get().cart;
      const itemToUpdate = currentCart.find(i => i.id === productId);
      if (!itemToUpdate) return;

      const oldQty = itemToUpdate.quantity;

      set((state) => ({
        cart: state.cart.map((item) =>
          item.id === productId ? { ...item, quantity: newQty } : item
        ),
      }));
    
      if (userId) {
        try {
          const action = newQty > oldQty ? 'increment' : 'decrement';
          await api.post('/cart/update', {
            user_id: userId,
            product_id: productId,
            action: action
          });
        } catch (err) {
          console.error("Quantity Sync Failed:", err);
        }
      }
    },

    // 5. Critical for Isolation: Clear Memory on Logout
    clearCart: () => set({ cart: [] }),
  })
);