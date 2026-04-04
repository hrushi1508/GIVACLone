import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import Collection from '../components/Collection';
import AddedToCartToast from '../components/AddedToCartToast';
import ProductModal from '../components/ProductModal';
import { useAuth } from '../store/useAuth';
import { useCart } from '../store/useCart';

// Destructure onAuthRequired (passed from App.js)
export default function Home({ layout, onAuthRequired }) { 
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
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
    setLoading(true);
    api.get(`/products?q=${search}`).then(res => {
      setProducts(res.data);
      setLoading(false);
    });
  }, [search]);

  return (
    <>
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

      {/* 2. Welcome Banner */}
      {isAuthenticated && (
        <div className='bg-giva-dark text-white py-2 text-[10px] uppercase tracking-widest text-center font-bold'>
          Welcome back, {user.name}! ✨
        </div>
      )}

      {/* 3. Hero Header */}
      <header className="py-20 text-center bg-giva-sand">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-serif mb-4 italic text-giva-dark leading-tight">
            {layout?.hero?.title || "Fine Jewelry for Every Occasion"}
          </h2>
          <p className="text-sm tracking-[0.3em] uppercase text-gray-500 font-medium">
            {layout?.hero?.subtitle || 'Explore our Collection'}
          </p>
          <input 
            type="text" 
            placeholder="Search your sparkle..." 
            className="mt-8 border-b border-gray-300 bg-transparent py-2 outline-none text-center w-64 focus:border-giva-pink transition-all text-lg"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <Collection />

      {/* 4. Main Product Grid */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-gray-100 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
            {products.map(p => (
              <ProductCard 
                key={p.id} 
                product={p} 
                isAuthenticated={isAuthenticated} 
                // Pass the modal opener function
                onOpenModal={() => handleOpenModal(p)}
                // Pass the auth required function (to open LoginModal)
                onAuthRequired={onAuthRequired}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}