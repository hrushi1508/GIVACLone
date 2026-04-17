import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../store/useCart.js';
import SafeImage from './SafeImage'; 
import { useAuth } from '../store/useAuth.js';
import { useWishlist } from '../store/useWishlist.js';
import { Heart, Star, ShoppingBag, Eye } from 'lucide-react'; 

export default function ProductCard({ product, onOpenModal, onAuthRequired }) {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { toggleWishlist, wishlist } = useWishlist();
  const cart = useCart((state) => state.cart);
  const addToCart = useCart((state) => state.addToCart);

  const isFavorite = isAuthenticated && wishlist.some(item => item.id === product.id);
  const cartItem = isAuthenticated && user 
    ? cart.find(item => item.id === product.id && item.userId === user.id) 
    : null;

  const handleWishlist = (e) => {
    e.stopPropagation(); 
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    toggleWishlist(user.id, product);
  };

  const handleAddClick = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    addToCart(product, user?.id);
  };

  const handleViewDetails = (e) => {
    e.stopPropagation();
    navigate(`/product/${product.id}`);
  };

  const rating = (product.rating || 4.5);
  const isNew = product.isNew || false;
  const isSale = product.discount || false;

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      onClick={() => navigate(`/product/${product.id}`)}
      className="group relative cursor-pointer"
    >
      <div className="relative aspect-[4/5] bg-giva-sand overflow-hidden rounded-lg shadow-md group-hover:shadow-xl transition-shadow">
        
        {/* Badges */}
        <div className="absolute top-3 left-3 z-20 space-y-2 flex flex-col">
          {isNew && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-giva-dark text-white text-[9px] font-bold px-2.5 py-1 rounded-full"
            >
              NEW
            </motion.span>
          )}
          {isSale && (
            <span className="bg-red-500 text-white text-[9px] font-bold px-2.5 py-1 rounded-full">
              {isSale}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <motion.button 
          onClick={handleWishlist}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="absolute top-3 right-3 z-20 p-2.5 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-300"
        >
          <Heart 
            size={18} 
            className={`transition-colors duration-300 ${
              isFavorite 
                ? "fill-red-500 text-red-500" 
                : "text-gray-400 hover:text-red-500"
            }`} 
          />
        </motion.button>

        {/* Cart Count Badge */}
        {isAuthenticated && cartItem && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-12 right-3 z-20 bg-giva-pink text-white text-[9px] font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1"
          >
            <ShoppingBag size={10} />
            <span>{cartItem.quantity}</span>
          </motion.div>
        )}

        {/* Image */}
        <SafeImage 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Quick View Button */}
        <motion.button 
          onClick={(e) => {
            e.stopPropagation();
            onOpenModal?.();
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
        >
          <Eye size={20} className="text-giva-pink" />
        </motion.button>
        
        {/* Add to Bag Button */}
        <motion.button 
          onClick={handleAddClick}
          whileHover={{ y: -2 }}
          className="absolute bottom-0 z-10 w-full bg-giva-dark text-white py-3 text-[10px] font-bold uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg"
        >
          {isAuthenticated && cartItem ? "Add Another" : "Add to Bag"}
        </motion.button>
      </div>

      {/* Product Info */}
      <motion.div 
        className="pt-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <p className="text-[10px] uppercase tracking-widest text-giva-pink font-bold mb-1">
          {product.category}
        </p>
        <h3 className="font-semibold text-sm text-giva-dark line-clamp-2 mb-2 group-hover:text-giva-pink transition-colors">
          {product.name}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                className={`${i < Math.floor(rating) ? 'fill-giva-gold text-giva-gold' : 'text-gray-200'}`}
              />
            ))}
          </div>
          <span className="text-[10px] text-gray-500">({Math.floor(Math.random() * 200) + 10})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-giva-dark">₹{product.price?.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="text-[10px] text-gray-400 line-through">₹{product.originalPrice?.toLocaleString()}</span>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}