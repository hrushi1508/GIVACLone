import axios from 'axios';
import { useAuth } from '../store/useAuth'; // Import your auth store

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- 1. REQUEST INTERCEPTOR (The Passport) ---
// This ensures every private call carries the JWT "ID Card"
api.interceptors.request.use(
  (config) => {
    // Get the current token from the Zustand store
    const token = useAuth.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- 2. RESPONSE INTERCEPTOR (The Security Guard) ---
// This handles session expiry or invalid tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Session expired. Wiping data and redirecting...");
      // Flag the expiry so the home page can show a toast on reload
      sessionStorage.setItem('giva_session_expired', '1');
      useAuth.getState().logout();
    }
    return Promise.reject(error);
  }
);

// --- 3. API ENDPOINTS ---

export const authApi = {
  login: (credentials) => api.post('/login', credentials),
  register: (userData) => api.post('/register', userData),
};

export const orderApi = {
  // Routes now protected by the Bearer token attached above
  getHistory: (userId) => api.get(`/my-orders/${userId}`),
  checkout: (orderData) => api.post('/checkout', orderData),
};

export const cartApi = {
  getCart: (userId) => api.get(`/cart/${userId}`),
  updateQuantity: (data) => api.post('/cart/update', data),
  remove: (data) => api.post('/cart/remove', data),
  add: (data) => api.post('/cart/add', data),
};

export const wishlistApi = {
  getWishlist: (userId) => api.get(`/wishlist/${userId}`),
  toggle: (data) => api.post('/wishlist/toggle', data),
};

export const shopApi = {
  getLayout: () => api.get('/layout'),
  getProducts: (params) => api.get('/products', { params }),
  validatePromo: (data) => api.post('/validate-promo', data),
};

export default api;