import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShieldCheck, Truck, RotateCcw, Heart, Sparkles, ArrowRight } from 'lucide-react';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import AddedToCartToast from '../components/AddedToCartToast';
import ProductModal from '../components/ProductModal';
import { useAuth } from '../store/useAuth';
import { useCart } from '../store/useCart';
import Testimonials from '../components/Testimonials';
import NewsletterSignup from '../components/NewsletterSignup';
import GiftingRelation from '../components/GiftingRelation';
import { Zap, Flame, Clock } from 'lucide-react';


// Destructure onAuthRequired (passed from App.js)
export default function Home({ layout, onAuthRequired }) { 
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Notification States
  const [showToast, setShowToast] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState(null);

  // Modal States
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { isAuthenticated, user } = useAuth();
  const cart = useCart((state) => state.cart);
  const prevCartRef = useRef([]);

  // --- Modal Control ---
  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // --- Cart Notification Logic ---
  useEffect(() => {
    if (isAuthenticated && cart.length > 0) {
      let updatedItem = null;
      let isAlreadyInBag = false;

      cart.forEach((item) => {
        const prevItem = prevCartRef.current.find((p) => p.id === item.id);
        if (!prevItem || item.quantity > prevItem.quantity) {
          updatedItem = item;
          isAlreadyInBag = !!prevItem;
        }
      });

      if (updatedItem) {
        setLastAddedItem({
          ...updatedItem,
          isAlreadyInBag,
          count: updatedItem.quantity,
          toastId: Date.now()
        });
        
        setShowToast(false);
        setTimeout(() => setShowToast(true), 10);
        const timer = setTimeout(() => setShowToast(false), 2500);
        prevCartRef.current = JSON.parse(JSON.stringify(cart));
        return () => clearTimeout(timer);
      }
    }
    prevCartRef.current = JSON.parse(JSON.stringify(cart));
  }, [cart, isAuthenticated]);

  // --- Fetching Logic ---
  useEffect(() => {
    api.get('/products').then(res => {
      setProducts(res.data);
      setLoading(false);
    });
  }, []);

  const featuredProducts = products.slice(0, 8);
  const trendingProducts = products.filter(p => p.isTrending).slice(0, 4);
  const newLaunches = products.filter(p => p.isNew).slice(0, 4);
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 5).slice(0, 4);

  
  const trustBadges = [
    { icon: ShieldCheck, label: '100% Authentic', desc: 'Certified Jewelry' },
    { icon: Truck, label: 'Free Shipping', desc: 'On orders over ₹5000' },
    { icon: RotateCcw, label: '30-Day Returns', desc: 'No questions asked' },
    { icon: Heart, label: 'Lifetime Care', desc: 'Free cleaning & repairs' }
  ];

  return (
    <div className="bg-white">
      {/* 1. Notifications & Modal Overlays */}
      <AddedToCartToast 
        isVisible={showToast} 
        product={lastAddedItem} 
        onClose={() => setShowToast(false)} 
      />

      <ProductModal 
        isOpen={isModalOpen}
        product={selectedProduct}
        onClose={handleCloseModal}
        isAuthenticated={isAuthenticated}
      />

      {/* 2. Welcome Banner (if authenticated) */}
      {isAuthenticated && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-r from-giva-dark to-giva-dark/80 text-white py-3 text-center font-medium tracking-wide"
        >
          Welcome back, <span className="font-bold text-giva-pink">{user.name}</span>! ✨ Continue your jewelry journey.
        </motion.div>
      )}

      {/* 3. HERO SECTION - Luxury & Premium */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          {/* Pink/Rose gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-giva-sand via-white to-giva-pink/10" />
          
          {/* Cloudinary Hero Image - Luxury jewelry showcase */}
          <img 
            src="https://res.cloudinary.com/dv32wfpfq/image/upload/q_auto,f_auto,w_1200,h_800,c_fill/giva/hero/luxury-jewelry-showcase"
            alt="Luxury Jewelry Collection"
            className="w-full h-full object-cover opacity-30"
          />
          
          {/* Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/20 to-giva-pink/10" />
        </div>

        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-5">
          <div className="absolute top-20 right-10 w-72 h-72 bg-giva-pink/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-giva-gold/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-[11px] uppercase tracking-[0.2em] text-giva-pink font-bold mb-4 flex items-center justify-center gap-2">
              <Sparkles size={14} /> Luxury Jewelry Crafted for You
            </p>
            
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-giva-dark mb-6 leading-tight">
              {layout?.hero?.title || "Timeless Elegance, Modern Style"}
            </h1>
            
            <p className="text-lg md:text-xl text-giva-dark/70 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
              {layout?.hero?.subtitle || "Discover exquisite handcrafted jewelry pieces that celebrate your unique beauty. From everyday classics to statement pieces, find your perfect sparkle."}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate('/search?q=rings')}
                className="px-8 py-4 bg-giva-dark text-white font-semibold tracking-wide uppercase hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                Explore Collection <ArrowRight size={18} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate('/category/rings')}
                className="px-8 py-4 border-2 border-giva-dark text-giva-dark font-semibold tracking-wide uppercase hover:bg-giva-sand transition-all"
              >
                View by Category
              </motion.button>
            </div>

            {/* Search Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="max-w-md mx-auto"
            >
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Search for rings, earrings, necklaces..."
                  className="w-full px-6 py-4 border-b-2 border-giva-dark/20 bg-white/50 backdrop-blur-sm outline-none focus:border-giva-pink transition-colors text-center text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const query = e.currentTarget.value.trim();
                      if (query) {
                        navigate(`/search?q=${encodeURIComponent(query)}`);
                      }
                    }
                  }}
                />
                <p className="text-[10px] text-giva-dark/50 mt-2">Press Enter to search</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 4. TRUST BADGES */}
      <section className="bg-gradient-to-r from-giva-sand/30 to-giva-pink/10 border-y border-giva-sand/50">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {trustBadges.map((badge, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                {/* Badge Icon Container with gradient background */}
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-giva-sand to-giva-pink/20 mb-4 shadow-sm group-hover:shadow-md transition-shadow">
                  {/* Background accent image layer */}
                  <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-10 transition-opacity"
                    style={{
                      backgroundImage: `url('https://res.cloudinary.com/dv32wfpfq/image/upload/q_auto,f_auto,w_80,h_80,c_fill/giva/badge/${['authentic', 'shipping', 'returns', 'care'][idx]}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                  <badge.icon size={32} className="text-giva-pink relative z-10" />
                </div>
                <h3 className="font-semibold text-giva-dark mb-1">{badge.label}</h3>
                <p className="text-sm text-giva-dark/60">{badge.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4B. TODAY'S TRENDING */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-b border-giva-sand/50">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
        >
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-giva-pink font-bold mb-3 flex items-center gap-2">
              <Flame size={14} className="fill-giva-pink animate-pulse" /> What's Hot Now
            </p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-giva-dark">
              Today's Trending
            </h2>
          </div>
          <p className="text-gray-500 max-w-xs text-sm italic">
            "Jewelry that Everyone is Talking About. Be the first to own the season's favorites."
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
          {trendingProducts.map((p, idx) => (
            <ProductCard
              key={p.id}
              product={p} 
              isAuthenticated={isAuthenticated} 
              onOpenModal={() => handleOpenModal(p)}
              onAuthRequired={onAuthRequired}
            />
          ))}
        </div>
      </section>

      {/* 5. FEATURED COLLECTIONS */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-[11px] uppercase tracking-[0.2em] text-giva-pink font-bold mb-3">
            Curated Selection
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-giva-dark mb-4">
            Featured Pieces
          </h2>
          <div className="w-20 h-1 bg-giva-gold mx-auto" />
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-4/5 bg-giva-sand rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
            {featuredProducts.map((p, idx) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <ProductCard
                  product={p} 
                  isAuthenticated={isAuthenticated} 
                  onOpenModal={() => handleOpenModal(p)}
                  onAuthRequired={onAuthRequired}
                />
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <button
            onClick={() => navigate('/search')}
            className="inline-flex items-center gap-2 px-8 py-4 border-2 border-giva-dark text-giva-dark font-semibold tracking-wide uppercase hover:bg-giva-sand transition-all"
          >
            View All Products <ArrowRight size={18} />
          </button>
        </motion.div>
      </section>

      {/* 5B. BEST SELLERS SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-giva-sand/50">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-[11px] uppercase tracking-[0.2em] text-giva-pink font-bold mb-3">
            Customer Favorites
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-giva-dark mb-4">
            Best Sellers
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover the pieces our customers love most. Handpicked bestsellers that celebrate timeless elegance.
          </p>
          <div className="w-20 h-1 bg-giva-gold mx-auto mt-6" />
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-4/5 bg-giva-sand rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
            {products.slice(2, 6).map((p, idx) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <ProductCard
                  product={p} 
                  isAuthenticated={isAuthenticated} 
                  onOpenModal={() => handleOpenModal(p)}
                  onAuthRequired={onAuthRequired}
                />
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <button
            onClick={() => navigate('/category/rings')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-giva-pink text-white font-semibold tracking-wide uppercase hover:shadow-lg transition-all"
          >
            Explore Best Sellers <ArrowRight size={18} />
          </button>
        </motion.div>
      </section>

      {/* 5C. GIFTING BY RELATION */}
      <GiftingRelation />

      {/* 5D. NEW LAUNCHES */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-giva-sand/50">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
        >
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-giva-pink font-bold mb-3 flex items-center gap-2">
              <Clock size={14} className="animate-pulse" /> Just Arrived
            </p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-giva-dark">
              New Launches
            </h2>
          </div>
          <button
            onClick={() => navigate('/search?q=new')}
            className="text-sm font-bold uppercase tracking-widest text-giva-pink hover:text-giva-dark transition-colors flex items-center gap-2"
          >
            Explore All New <ArrowRight size={16} />
          </button>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
          {newLaunches.map((p, idx) => (
            <ProductCard
              key={p.id}
              product={p} 
              isAuthenticated={isAuthenticated} 
              onOpenModal={() => handleOpenModal(p)}
              onAuthRequired={onAuthRequired}
            />
          ))}
        </div>
      </section>

      {/* 5E. MOSTLY OUT OF STOCK - Urgency Section */}
      <section className="bg-gradient-to-b from-white to-giva-sand/10 py-20 border-t border-giva-sand/50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-[11px] uppercase tracking-[0.2em] text-red-500 font-bold mb-3 flex items-center justify-center gap-2">
              <Zap size={14} className="fill-red-500" /> Limited Availability
            </p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-giva-dark mb-4">
              Mostly Out of Stock
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Grab these rare designs before they're gone forever. Our most sought-after pieces are flying off the shelves.
            </p>
            <div className="w-20 h-1 bg-red-400 mx-auto mt-6" />
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
            {lowStockProducts.map((p, idx) => (
              <div key={p.id} className="relative">
                <ProductCard
                  product={p} 
                  isAuthenticated={isAuthenticated} 
                  onOpenModal={() => handleOpenModal(p)}
                  onAuthRequired={onAuthRequired}
                />
                <div className="absolute top-2 right-2 z-30">
                  <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                    Only {p.stock} left
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <Testimonials />

      {/* 7. NEWSLETTER SIGNUP */}
      <NewsletterSignup />
    </div>
  );
}