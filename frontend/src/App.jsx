import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import api from './utils/api.js';
import { useWishlist } from './store/useWishlist';
import { useCart } from './store/useCart';

import { cartApi, wishlistApi } from './utils/api';

// Pages
import Home from './pages/Home';
import Profile from './pages/Profile';
import CartPage from './pages/CartPage';
import Wishlist from './pages/Wishlist';
import SearchPage from './pages/SearchPage';
import CategoryPage from './pages/CategoryPage';
import ProductDetail from './pages/ProductDetail';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPromos from './pages/admin/AdminPromos';
import AdminSettings from './pages/admin/AdminSettings';

// Components
import LoginModal from './components/LoginModal';
import ErrorBoundary from './components/ErrorBoundary';
import NotFound from './pages/NotFound';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import { useAuth } from './store/useAuth';

function App() {
  const [layout, setLayout] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [showExpiredToast, setShowExpiredToast] = useState(false);
  
  // Get authentication state from our store
  const { isAuthenticated, user } = useAuth();
  const setCart = useCart((state) => state.setCart);

  useEffect(() => {
    api.get('/layout')
      .then(res => setLayout(res.data))
      .catch(err => console.error("Layout Error:", err));
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem('giva_session_expired')) {
      sessionStorage.removeItem('giva_session_expired');
      setShowExpiredToast(true);
      setTimeout(() => setShowExpiredToast(false), 5000);
    }
  }, []);
  useEffect(() => {
    // Whenever the user logs in, go get their data from the server
    if (isAuthenticated && user?.id) {
      
      // 1. Fetch Cart from Flask
      cartApi.getCart(user.id)
        .then(res => setCart(res.data))
        .catch(err => console.error("Failed to load cart", err));
        
    }
  }, [isAuthenticated, user?.id, setCart]);

  // Helper component for protected routes to keep code clean
  const ProtectedRoute = ({ children }) => {
    useEffect(() => {
      if (!isAuthenticated) {
        setIsLoginOpen(true);
      }
    }, []);

    if (!isAuthenticated) {
      // If not logged in, redirect home
      return <Navigate to="/" replace />;
    }
    return children;
  };

  // Admin protected route — requires authentication AND is_admin flag
  const AdminProtectedRoute = ({ children }) => {
    if (!isAuthenticated || !user?.is_admin) {
      return <Navigate to="/admin/login" replace />;
    }
    return children;
  };

  const fetchWishlist = useWishlist(state => state.fetchWishlist);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchWishlist(user.id);
    }
  }, [isAuthenticated, user, fetchWishlist]);

  return (
    <ErrorBoundary>
    <Router>
      {showExpiredToast && (
        <div
          role="alert"
          className="fixed bottom-6 right-6 z-[9999] bg-gray-900 text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom"
        >
          <span className="text-sm">Your session has expired. Please log in again.</span>
          <button
            onClick={() => setShowExpiredToast(false)}
            aria-label="Dismiss notification"
            className="text-gray-400 hover:text-white ml-2 text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}
      <Routes>
        {/* ============ ADMIN ROUTES (no Navbar/Footer) ============ */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="promos" element={<AdminPromos />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* ============ CUSTOMER ROUTES ============ */}
        <Route
          path="*"
          element={
            <div className="flex flex-col min-h-screen bg-white text-giva-dark">
              {layout?.announcement && layout?.announcementEnabled !== false && (
                <div className="bg-giva-dark text-white text-[10px] uppercase tracking-[0.2em] py-2 text-center font-bold">
                  {layout.announcement}
                </div>
              )}

              <Navbar onLoginClick={() => setIsLoginOpen(true)} />

              <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

              <main className="flex-grow">
                <Routes>
                  {/* PUBLIC ROUTE */}
                  <Route path="/" element={<Home 
                    layout={layout} 
                    // Pass the function to open the login modal
                    onAuthRequired={() => setIsLoginOpen(true)} 
                  />} />

                  {/* PROTECTED ROUTES: Only accessible if isAuthenticated is true */}
                  <Route 
                    path="/cart" 
                    element={<ProtectedRoute><CartPage user={user} onAuthRequired={() => setIsLoginOpen(true)} /></ProtectedRoute>} 
                  />

                  <Route 
                    path="/profile" 
                    element={<ProtectedRoute><Profile user={user} /></ProtectedRoute>} 
                  />

                  <Route 
                    path="/wishlist" 
                    element={<ProtectedRoute><Wishlist user={user} /></ProtectedRoute>} 
                  />

                  <Route path="/search" element={<SearchPage onAuthRequired={() => setIsLoginOpen(true)} />} />
                  <Route path="/category/:slug" element={<CategoryPage onAuthRequired={() => setIsLoginOpen(true)} />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />

                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>

              <Footer />
            </div>
          }
        />
      </Routes>
    </Router>
    </ErrorBoundary>
  );
}

export default App;