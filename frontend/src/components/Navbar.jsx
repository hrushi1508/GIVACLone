import { ShoppingBag, Search, User, Heart, LogOut, Home } from 'lucide-react';
import { useCart } from '../store/useCart.js';
import { useAuth } from '../store/useAuth.js';
import { useNavigate, Link } from 'react-router-dom';
import { useWishlist } from '../store/useWishlist';

export default function Navbar({ onSearch, onLoginClick }) {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  /**
   * DATA ISOLATION SELECTORS:
   * These strictly return 0 if not authenticated.
   * Because your store clearCart/clearWishlist is called on logout, 
   * User B will never see User A's data.
   */
  const cartCount = useCart((state) => {
    return isAuthenticated && user ? state.cart.reduce((acc, item) => acc + item.quantity, 0) : 0;
  });
  
  const wishlistCount = useWishlist((state) => {
    return isAuthenticated && user ? state.wishlist.length : 0;
  });

  const handleSearchSubmit = (val) => {
    if (val.trim()) {
      navigate(`/search?q=${val}`);
    }
  };

  /**
   * SECURE LOGOUT:
   * Triggers the useAuth logout which clears the JWT token,
   * wipes local memory, and resets the window location.
   */
  const handleLogout = () => {
    logout(); 
    navigate('/');
  };

  // Helper for protected icon clicks
  const handleProtectedNavigation = (path) => {
    if (!isAuthenticated) {
      onLoginClick();
    } else {
      navigate(path);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* 1. Navigation Links */}
        <div className="flex-1 hidden md:flex items-center space-x-6 text-xs uppercase tracking-[0.2em] font-semibold">
          <Link to="/" className="flex items-center gap-2 hover:text-giva-pink transition group">
            <Home size={16} className="group-hover:scale-110 transition-transform" />
            <span>Home</span>
          </Link>
          <button onClick={() => navigate('/search?q=Rings')} className="hover:text-giva-pink transition uppercase">Rings</button>
          <button onClick={() => navigate('/search?q=Earrings')} className="hover:text-giva-pink transition uppercase">Earrings</button>
        </div>

        {/* 2. Logo */}
        <Link to="/" className="text-3xl font-serif tracking-tighter font-bold flex-1 text-center select-none text-giva-dark">
          GIVA
        </Link>

        {/* 3. Icons & Private Actions */}
        <div className="flex-1 flex justify-end items-center space-x-6">
          
          {/* Search Bar */}
          <div className="relative flex items-center bg-gray-100 px-4 py-2 rounded-full group focus-within:bg-gray-200 transition-colors">
            <Search size={16} className="text-gray-400" />
            <input 
              type="text"
              placeholder="Search Jewellery..."
              className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-32 lg:w-48 outline-none"
              onChange={(e) => handleSearchSubmit(e.target.value)}
            />
          </div>
          
          {/* USER DATA ISOLATION: Shows Identity only if Auth */}
          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-4 group relative border-r border-gray-100 pr-4">
                <Link to="/profile" className="flex items-center gap-2">
                  <div className="hidden lg:flex flex-col items-end">
                    <span className="text-[9px] uppercase text-gray-400 tracking-tighter">My Account</span>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-giva-pink">
                      {user.name?.split(' ')[0]}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-giva-sand flex items-center justify-center border border-gray-200 shadow-sm">
                    <User size={18} className="text-giva-dark" />
                  </div>
                </Link>

                <button 
                  onClick={handleLogout}
                  title="Logout"
                  className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button 
                onClick={onLoginClick}
                className="flex items-center gap-2 hover:text-giva-pink transition border-r border-gray-100 pr-4"
              >
                <User size={20} />
                <span className="hidden sm:block text-[10px] uppercase tracking-widest font-bold">Login</span>
              </button>
            )}
          </div>

          {/* PRIVATE WISHLIST: Only shows count if authenticated */}
          <button 
            onClick={() => handleProtectedNavigation('/wishlist')}
            className="relative group p-1"
          >
            <Heart 
              size={20} 
              className={`transition ${isAuthenticated && wishlistCount > 0 ? 'text-giva-pink fill-giva-pink' : 'group-hover:text-giva-pink text-gray-600'}`} 
            />
            {isAuthenticated && wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-giva-pink text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in">
                {wishlistCount}
              </span>
            )}
          </button>
          
          {/* PRIVATE SHOPPING BAG: Isolated count for current token only */}
          <button 
            className="relative cursor-pointer group p-1"
            onClick={() => handleProtectedNavigation('/cart')}
          >
            <ShoppingBag size={20} className="group-hover:text-giva-pink transition text-gray-600" />
            {isAuthenticated && cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-giva-pink text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}