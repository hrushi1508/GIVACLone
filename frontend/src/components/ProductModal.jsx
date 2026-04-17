import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, ShieldCheck, Truck, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../store/useCart';
import { useAuth } from '../store/useAuth';

export default function ProductModal({ isOpen, product, onClose, isAuthenticated, onAuthRequired }) {
  const { cart, addToCart, updateQuantity, removeItem } = useCart();
  const { user } = useAuth();

  if (!product) return null;

  // PRIVACY GUARD: Only look for cart items if the user is actually authenticated
  const cartItem = isAuthenticated ? cart.find((item) => item.id === product.id) : null;

  const handleProtectedAction = (actionFn) => {
    if (!isAuthenticated) {
      onAuthRequired(); 
      return;
    }
    actionFn();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] overflow-y-auto"
          >
            <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-white/80 rounded-full hover:bg-white shadow-md">
              <X size={20} />
            </button>

            {/* Image Side */}
            <div className="w-full md:w-1/2 bg-giva-sand">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover mix-blend-multiply" />
            </div>

            {/* Content Side */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
              <p className="text-giva-pink font-bold uppercase text-[10px] tracking-[0.3em] mb-2">
                {product.category}
              </p>
              
              <h2 className="text-3xl font-serif text-giva-dark mb-2 leading-tight">{product.name}</h2>
              
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center bg-green-50 px-2 py-1 rounded gap-1">
                  <span className="text-xs font-bold text-green-700">{product.rating}</span>
                  <Star size={12} className="fill-green-700 text-green-700" />
                </div>
                <span className="text-gray-400 text-xs">| 100+ Reviews</span>
              </div>

              <p className="text-3xl font-bold text-giva-dark mb-6">₹{product.price.toLocaleString('en-IN')}</p>

              {/* Privacy: Metadata only visible to logged in users */}
              {isAuthenticated && (
                <div className="mb-4 flex items-center gap-2 text-[10px] text-giva-pink font-bold uppercase tracking-widest animate-fade-in">
                   <ShoppingBag size={12} /> 
                   {cartItem ? `You have ${cartItem.quantity} of this in your bag` : "Exclusive Price for You"}
                </div>
              )}

              <div className="border-t border-b border-gray-100 py-6 mb-8">
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-3">Description</h4>
                <p className="text-gray-600 text-sm leading-relaxed font-light">
                  {product.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                  <ShieldCheck size={16} className="text-giva-pink" /> Authenticity Cert.
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                  <Truck size={16} className="text-giva-pink" /> Fast Shipping
                </div>
              </div>

              {/* --- ACTION SECTION --- */}
              <div className="mt-auto">
                {!cartItem ? (
                  <button 
                    onClick={() => handleProtectedAction(() => addToCart(product, user?.id))}
                    className="w-full bg-giva-dark text-white py-5 rounded-sm font-bold uppercase tracking-[0.2em] text-xs hover:bg-black transition-all flex items-center justify-center gap-2"
                  >
                    Add to Bag
                  </button>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between bg-gray-50 rounded-sm border border-gray-100 p-1">
                      <button 
                        onClick={() => handleProtectedAction(() => updateQuantity(product.id, Math.max(1, cartItem.quantity - 1), user?.id))}
                        className="p-3 hover:bg-white hover:shadow-sm transition-all rounded-sm text-giva-dark"
                      >
                        <Minus size={16} />
                      </button>
                      
                      <span className="font-bold text-sm text-giva-dark">
                        {cartItem.quantity} in Bag
                      </span>
                      
                      <button 
                        onClick={() => handleProtectedAction(() => updateQuantity(product.id, cartItem.quantity + 1, user?.id))}
                        className="p-3 hover:bg-white hover:shadow-sm transition-all rounded-sm text-giva-dark"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <button 
                      onClick={() => handleProtectedAction(() => removeItem(product.id, user?.id))}
                      className="w-full flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={14} /> Remove Item
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}