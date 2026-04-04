import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useCart } from './useCart'; 
import { useWishlist } from './useWishlist';

export const useAuth = create(
  persist(
    (set) => ({
      user: null,
      token: null, // New: Store the JWT from Flask
      isAuthenticated: false,
      
      // Updated login to receive and store the token
      login: (userData, token) => set({ 
        user: userData, 
        token: token,
        isAuthenticated: true 
      }),

      logout: () => {
        // 1. Reset Auth & Token State
        set({ user: null, token: null, isAuthenticated: false });

        // 2. Clear In-Memory Stores Immediately 
        // This ensures User B doesn't see User A's items in the React state
        useCart.getState().clearCart?.(); 
        useWishlist.getState().clearWishlist?.();

        // 3. Clear all persisted data from LocalStorage
        localStorage.removeItem('giva-auth'); 
        localStorage.removeItem('token'); // Clear the explicit token if stored separately
        
        // Remove persist keys for other stores
        localStorage.removeItem('giva-cart');     
        localStorage.removeItem('giva-wishlist'); 

        // 4. Hard Reset
        // This reloads the app, forcing the "App.js" useEffect to see 
        // that isAuthenticated is false, keeping everything empty.
        window.location.href = "/"; 
      }
    }),
    { 
      name: 'giva-auth',
      // Optional: If you use a custom storage or want to filter what is saved
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);