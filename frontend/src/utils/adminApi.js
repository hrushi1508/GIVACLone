import api from './api';

export const adminApi = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),
  getRevenue: (range) => api.get('/admin/revenue', { params: { range } }),

  // Products
  getProducts: () => api.get('/admin/products'),
  createProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),

  // Orders
  getOrders: () => api.get('/admin/orders'),
  updateOrderStatus: (orderId, status) => api.put(`/admin/orders/${orderId}/status`, { status }),

  // Users
  getUsers: () => api.get('/admin/users'),
  updateUserRole: (userId, isAdmin) => api.put(`/admin/users/${userId}/role`, { is_admin: isAdmin }),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),

  // Promos
  getPromos: () => api.get('/admin/promos'),
  createPromo: (data) => api.post('/admin/promos', data),
  updatePromo: (id, data) => api.put(`/admin/promos/${id}`, data),
  deletePromo: (id) => api.delete(`/admin/promos/${id}`),
  togglePromo: (id) => api.patch(`/admin/promos/${id}/toggle`),

  // Layout
  getLayout: () => api.get('/admin/layout'),
  updateLayout: (data) => api.put('/admin/layout', data),
};

export default adminApi;
