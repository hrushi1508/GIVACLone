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

// Components
import LoginModal from './components/LoginModal';
import { useAuth } from './store/useAuth';

function App() {
  const [layout, setLayout] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  
  // Get authentication state from our store
  const { isAuthenticated, user } = useAuth();
  const setCart = useCart((state) => state.setCart);

  useEffect(() => {
    api.get('/layout')
      .then(res => setLayout(res.data))
      .catch(err => console.error("Layout Error:", err));
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

  const fetchWishlist = useWishlist(state => state.fetchWishlist);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchWishlist(user.id);
    }
  }, [isAuthenticated, user, fetchWishlist]);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-white text-giva-dark">
        {layout?.announcement && (
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

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;