import { useWishlist } from '../store/useWishlist';
import { useCart } from '../store/useCart';
import { useAuth } from '../store/useAuth';
import { ShoppingBag, Heart, Trash2 } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

export default function Wishlist() {
  const { wishlist, toggleWishlist } = useWishlist();
  const { user, isAuthenticated } = useAuth();
  const addToCart = useCart((state) => state.addToCart);

  // --- PRIVACY GUARD ---
  // If User B tries to access this page while logged out, redirect them.
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // --- SECURE REMOVE HANDLER ---
  const handleRemove = async (product) => {
    // We use toggleWishlist from the store because it already has 
    // the logic to remove if the item exists and sync with the backend.
    if (user?.id) {
      await toggleWishlist(user.id, product);
    }
  };

  // --- SECURE MOVE TO CART ---
  const handleMoveToCart = async (product) => {
    if (user?.id) {
      // 1. Add to User A's specific backend cart
      await addToCart(product, user.id);
      // 2. Remove from User A's specific backend wishlist
      await toggleWishlist(user.id, product);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="bg-giva-sand py-16 text-center">
        <Heart className="mx-auto text-giva-pink mb-4" fill="#E8A2A8" size={32} />
        <h1 className="text-4xl font-serif text-giva-dark">My Wishlist</h1>
        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mt-2">
          Exclusive Collection for {user?.name?.split(' ')[0]}
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {wishlist.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-400 font-serif italic text-xl mb-8">
              Your wishlist is currently empty.
            </p>
            <Link 
              to="/" 
              className="bg-giva-dark text-white px-10 py-4 rounded-full text-xs uppercase tracking-widest font-bold hover:bg-black transition"
            >
              Explore Jewelry
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {wishlist.map((product) => (
              <div key={product.id} className="group relative border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-500">
                {/* Product Image */}
                <div className="aspect-[4/5] overflow-hidden bg-gray-50">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* SECURE REMOVE BUTTON */}
                  <button 
                    onClick={() => handleRemove(product)}
                    className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-400 hover:text-red-500 transition shadow-sm z-10"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Details */}
                <div className="p-5">
                  <p className="text-[10px] uppercase tracking-widest text-giva-pink font-bold mb-1">
                    {product.category}
                  </p>
                  <h3 className="font-serif text-lg mb-2 truncate">{product.name}</h3>
                  <p className="font-bold text-giva-dark mb-4">₹{product.price.toLocaleString('en-IN')}</p>
                  
                  <button 
                    onClick={() => handleMoveToCart(product)}
                    className="w-full flex items-center justify-center gap-2 bg-giva-dark text-white py-3 rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-black transition"
                  >
                    <ShoppingBag size={14} /> Move to Bag
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}