import { motion } from 'framer-motion';
import { useCart } from '../store/useCart.js';
import SafeImage from './SafeImage'; 
import { useAuth } from '../store/useAuth.js';
import { useWishlist } from '../store/useWishlist.js';
import { Heart, Star, ShoppingBag } from 'lucide-react'; 

export default function ProductCard({ product, onOpenModal, onAuthRequired }) {
  const { isAuthenticated, user } = useAuth();
  const { toggleWishlist, wishlist } = useWishlist();
  const cart = useCart((state) => state.cart);
  const addToCart = useCart((state) => state.addToCart);

  // 1. Logic: Only check favorites/cart if user is logged in
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
    addToCart(product);
  };

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      onClick={onOpenModal}
      className="group relative cursor-pointer"
    >
      <div className="relative aspect-[4/5] bg-giva-sand overflow-hidden rounded-sm">
        
        {/* PRIVACY: Heart only fills if authenticated */}
        <button 
          onClick={handleWishlist}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/50 backdrop-blur-sm hover:bg-white transition-all duration-300 shadow-sm"
        >
          <Heart 
            size={18} 
            className={`transition-colors duration-300 ${
              isFavorite 
                ? "fill-red-500 text-red-500" 
                : "text-gray-400 hover:text-red-500"
            }`} 
          />
        </button>

        {/* PRIVACY: Quantity Badge - Only visible if logged in and item exists in cart */}
        {isAuthenticated && cartItem && (
          <div className="absolute top-3 left-3 z-20 bg-giva-pink text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1 animate-in fade-in zoom-in">
            <ShoppingBag size={10} />
            <span>{cartItem.quantity} IN BAG</span>
          </div>
        )}

        <SafeImage 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
        />
        
        <button 
          onClick={handleAddClick}
          className="absolute bottom-0 z-10 w-full bg-white/95 py-4 text-[10px] font-bold uppercase tracking-[0.2em] opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
        >
          {isAuthenticated && cartItem ? "Add Another" : "Add to Bag"}
        </button>
      </div>

      <div className="mt-4 text-center px-2">
        <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-1">{product.category}</p>
        
        <h3 className="font-serif text-base text-giva-dark leading-tight truncate">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-center gap-1 mt-1">
          <Star size={10} className="fill-yellow-400 text-yellow-400" />
          <span className="text-[10px] text-gray-500 font-bold">{product.rating}</span>
        </div>

        <p className="text-giva-pink font-semibold mt-1 text-sm">
          ₹{product.price.toLocaleString('en-IN')}
        </p>
      </div>
    </motion.div>
  );
}