import { ShoppingBag, Search, User, Heart, LogOut, Home, ChevronDown } from 'lucide-react';
import { useCart } from '../store/useCart.js';
import { useAuth } from '../store/useAuth.js';
import { useNavigate, Link } from 'react-router-dom';
import { useWishlist } from '../store/useWishlist';
import { useState, useEffect, useRef } from 'react';

export default function Navbar({ onLoginClick }) {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [hoveredDropdown, setHoveredDropdown] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const dropdownRef = useRef(null);
  const dropdownTimeoutRef = useRef(null);
  const itemTimeoutRef = useRef(null);

  // Close dropdown when mouse leaves with delay
  useEffect(() => {
    const handleMouseLeave = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
        if (itemTimeoutRef.current) clearTimeout(itemTimeoutRef.current);
        setHoveredDropdown(null);
        setHoveredItem(null);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
      if (itemTimeoutRef.current) clearTimeout(itemTimeoutRef.current);
    };
  }, []);

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
      navigate(`/search?q=${encodeURIComponent(val.trim())}`);
    }
  };

  const handleSearchInputKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearchSubmit(event.currentTarget.value);
    }
  };

  const navigateToCategory = (slug, range) => {
    if (range) {
      navigate(`/category/${slug}?price_range=${encodeURIComponent(range)}`);
    } else {
      navigate(`/category/${slug}`);
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

  const getPriceRanges = (priceRange) => priceRange.split(',').map((range) => range.trim());

  const navbarData = [
    {
      "title": "Categories",
      "key": "categories",
      "items": [
        { "name": "Rings", "slug": "rings", "priceRange": "0-1000,1001-5000,5001-15000,15001-50000" },
        { "name": "Earrings", "slug": "earrings", "priceRange": "0-500,501-2000,2001-8000,8001-25000" },
        { "name": "Pendants", "slug": "pendants", "priceRange": "0-300,301-1000,1001-5000,5001-15000" },
        { "name": "Necklaces", "slug": "necklaces", "priceRange": "0-2000,2001-10000,10001-30000,30001-100000" },
        { "name": "Bangles", "slug": "bangles", "priceRange": "0-1000,1001-5000,5001-15000,15001-40000" },
        { "name": "Bracelets", "slug": "bracelets", "priceRange": "0-500,501-2000,2001-8000,8001-30000" },
        { "name": "Anklets", "slug": "anklets", "priceRange": "0-300,301-1000,1001-5000,5001-20000" },
        { "name": "Nose Pins", "slug": "nose-pins", "priceRange": "0-200,201-500,501-2000,2001-5000" },
        { "name": "Toe Rings", "slug": "toe-rings", "priceRange": "0-200,201-500,501-2000,2001-8000" },
        { "name": "Mangalsutras", "slug": "mangalsutras", "priceRange": "0-5000,5001-20000,20001-50000,50001-200000" },
        { "name": "Silver Chains", "slug": "silver-chains", "priceRange": "0-500,501-2000,2001-8000,8001-25000" },
        { "name": "Sets", "slug": "sets", "priceRange": "0-3000,3001-10000,10001-30000,30001-150000" }
      ]
    },

    {
      "title": "Men",
      "key": "forMen",
      "items": [
        { "name": "Rings", "slug": "rings", "priceRange": "0-1000,1001-5000,5001-15000,15001-50000" },
        { "name": "Bracelets", "slug": "bracelets", "priceRange": "0-500,501-2000,2001-8000,8001-30000" },
        { "name": "Silver Chains", "slug": "silver-chains", "priceRange": "0-500,501-2000,2001-8000,8001-25000" },
        { "name": "Watches", "slug": "watches", "priceRange": "0-2000,2001-10000,10001-30000,30001-100000" },
        { "name": "Men's Jewelry", "slug": "mens-jewelry", "priceRange": "0-500,501-3000,3001-10000,10001-75000" }
      ]
    },

    {
      "title": "Women",
      "key": "forWomen",
      "items": [
        { "name": "Necklaces", "slug": "necklaces", "priceRange": "0-2000,2001-10000,10001-30000,30001-100000" },
        { "name": "Earrings", "slug": "earrings", "priceRange": "0-500,501-2000,2001-8000,8001-25000" },
        { "name": "Rings", "slug": "rings", "priceRange": "0-1000,1001-5000,5001-15000,15001-50000" },
        { "name": "Bangles", "slug": "bangles", "priceRange": "0-1000,1001-5000,5001-15000,15001-40000" },
        { "name": "Mangalsutras", "slug": "mangalsutras", "priceRange": "0-5000,5001-20000,20001-50000,50001-200000" },
        { "name": "Nose Pins", "slug": "nose-pins", "priceRange": "0-200,201-500,501-2000,2001-5000" },
        { "name": "Anklets", "slug": "anklets", "priceRange": "0-300,301-1000,1001-5000,5001-20000" },
        { "name": "Sets", "slug": "sets", "priceRange": "0-3000,3001-10000,10001-30000,30001-150000" }
      ]
    },

    {
      "title": "Kids",
      "key": "forKids",
      "items": [
        { "name": "Kids Jewelry", "slug": "kids-jewelry", "priceRange": "0-200,201-500,501-2000,2001-10000" },
        { "name": "Rings", "slug": "rings", "priceRange": "0-200,201-500,501-2000,2001-5000" },
        { "name": "Bracelets", "slug": "bracelets", "priceRange": "0-150,151-500,501-1500,1501-3000" },
        { "name": "Pendants", "slug": "pendants", "priceRange": "0-100,101-300,301-1000,1001-2000" }
      ]
    },

    {
      "title": "Others",
      "key": "others",
      "items": [
        { "name": "Personalised", "slug": "personalised", "priceRange": "0-1000,1001-5000,5001-15000,15001-50000" },
        { "name": "Perfumes", "slug": "perfumes", "priceRange": "0-200,201-500,501-2000,2001-5000" },
        { "name": "Coins", "slug": "coins", "priceRange": "0-100,101-300,301-1000,1001-10000" },
        { "name": "Gift Cards", "slug": "gift-cards", "priceRange": "0-500,501-2000,2001-5000,5001-10000" },
        { "name": "Gold Jewelry", "slug": "gold-jewelry", "priceRange": "0-10000,10001-30000,30001-100000,100001-500000" },
        {
          "name": "Occasions",
          "slug": "occasions",
          "priceRange": "0-500,501-3000,3001-10000,10001-200000",
          "subItems": [
            { "name": "Wedding Collection", "slug": "wedding", "priceRange": "0-2000,2001-10000,10001-30000,30001-200000" },
            { "name": "Festive Collection", "slug": "festive", "priceRange": "0-1000,1001-5000,5001-15000,15001-100000" },
            { "name": "Daily Wear", "slug": "daily-wear", "priceRange": "0-300,301-1000,1001-5000,5001-50000" }
          ]
        }
      ]
    }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* 1. Navigation Links */}
        <div className="flex-1 hidden md:flex items-center space-x-6 text-xs uppercase tracking-[0.2em] font-semibold">
          <Link to="/" className="flex items-center gap-2 hover:text-giva-pink transition group">
            <Home size={16} className="group-hover:scale-110 transition-transform" />
            <span>Home</span>
          </Link>
          
          {/* Navigation Dropdowns */}
          <div className="flex items-center space-x-6" ref={dropdownRef}>
            {navbarData.map((section) => (
              <div 
                key={section.key} 
                className="relative"
                onMouseEnter={() => {
                  if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
                  setHoveredDropdown(section.key);
                }}
                onMouseLeave={() => {
                  dropdownTimeoutRef.current = setTimeout(() => {
                    setHoveredDropdown(null);
                    setHoveredItem(null);
                  }, 300); // 300ms delay
                }}
              >
                <button 
                  onClick={() => navigate(`/category/${section.key}`)}
                  className="flex items-center gap-2 hover:text-giva-pink transition text-xs uppercase tracking-[0.2em] font-semibold"
                >
                  <span>{section.title}</span>
                  <ChevronDown size={14} className={`transition-transform ${hoveredDropdown === section.key ? 'rotate-180' : ''}`} />
                </button>
                
                {hoveredDropdown === section.key && (
                  <div className="absolute top-full mt-2 bg-white/90 border border-white/60 backdrop-blur-xl rounded-2xl shadow-2xl py-3 min-w-[420px] z-50 ring-1 ring-white/20">
                    <div className="space-y-1">
                      {section.items.map((item) => (
                        <div
                          key={item.slug}
                          className="relative"
                          onMouseEnter={() => {
                            if (itemTimeoutRef.current) clearTimeout(itemTimeoutRef.current);
                            setHoveredItem(item.slug);
                          }}
                          onMouseLeave={() => {
                            itemTimeoutRef.current = setTimeout(() => {
                              setHoveredItem(null);
                            }, 200);
                          }}
                        >
                          <button
                            onClick={() => navigateToCategory(item.slug)}
                            className="w-full text-left px-4 py-2 text-xs uppercase tracking-[0.1em] font-medium hover:bg-white/30 hover:text-giva-pink transition"
                          >
                            {item.name}
                          </button>

                          {hoveredItem === item.slug && (
                            <div className="absolute left-full top-0 ml-2 w-[220px] bg-white/90 border border-white/60 backdrop-blur-xl rounded-2xl shadow-2xl p-3 z-50 ring-1 ring-white/20">
                              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2">Price ranges</p>
                              <div className="space-y-1">
                                {getPriceRanges(item.priceRange).map((range) => (
                                  <button
                                    key={range}
                                    onClick={() => navigateToCategory(item.slug, range)}
                                    className="w-full text-left text-[11px] rounded-full px-3 py-2 bg-white/10 hover:bg-giva-pink hover:text-white transition"
                                  >
                                    ₹{range}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {item.subItems && (
                            <div className="ml-4 space-y-1">
                              {item.subItems.map((subItem) => (
                                <div
                                  key={subItem.slug}
                                  className="relative"
                                  onMouseEnter={() => {
                                    if (itemTimeoutRef.current) clearTimeout(itemTimeoutRef.current);
                                    setHoveredItem(subItem.slug);
                                  }}
                                  onMouseLeave={() => {
                                    itemTimeoutRef.current = setTimeout(() => {
                                      setHoveredItem(null);
                                    }, 200);
                                  }}
                                >
                                  <button
                                    onClick={() => navigateToCategory(subItem.slug)}
                                    className="w-full text-left px-4 py-1 text-xs tracking-[0.1em] font-medium hover:bg-gray-50 hover:text-giva-pink transition text-gray-600"
                                  >
                                    • {subItem.name}
                                  </button>

                                  {hoveredItem === subItem.slug && (
                                    <div className="absolute left-full top-0 ml-2 w-[220px] bg-white/90 border border-white/60 backdrop-blur-xl rounded-2xl shadow-2xl p-3 z-50 ring-1 ring-white/20">
                                      <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2">Price ranges</p>
                                      <div className="space-y-1">
                                        {getPriceRanges(subItem.priceRange).map((range) => (
                                          <button
                                            key={range}
                                            onClick={() => navigateToCategory(subItem.slug, range)}
                                            className="w-full text-left text-[11px] rounded-full px-3 py-2 bg-white/10 hover:bg-giva-pink hover:text-white transition"
                                          >
                                            ₹{range}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
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
              value={searchInput}
              className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-32 lg:w-48 outline-none"
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchInputKeyDown}
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