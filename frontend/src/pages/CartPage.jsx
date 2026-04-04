import { useCart } from '../store/useCart';
import { useAuth } from '../store/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShieldCheck, Truck, ArrowLeft } from 'lucide-react';
import api from '../utils/api';
import { useState } from 'react';
export default function CartPage() {
  const { cart, removeItem, updateQuantity, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);

  // --- BILLING LOGIC ---
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const gst = Math.round(subtotal * 0.03); 
  const shipping = subtotal > 999 || subtotal === 0 ? 0 : 99;
  const finalTotal = subtotal + gst + shipping - discount;

  // --- QUANTITY HANDLERS ---
  const incrementQty = (id, currentQty) => {
    updateQuantity(id, currentQty + 1, user?.id); 
  };

  const decrementQty = (id, currentQty) => {
    if (currentQty > 1) {
      updateQuantity(id, currentQty - 1, user?.id); 
    }
  };

  // --- NEW REMOVE HANDLER (Backend Sync) ---
  const handleRemove = async (productId) => {
    // 1. Immediate UI update
    removeItem(productId);

    // 2. Sync with Backend if logged in
    if (isAuthenticated && user?.id) {
      try {
        await api.post('/cart/remove', {
          user_id: user.id,
          product_id: productId
        });
      } catch (err) {
        console.error("Failed to sync removal with server:", err);
      }
    }
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      alert("Please login to place your order.");
      return;
    }

    try {
      const orderData = {
        user_id: user.id,
        items: cart,
        billing: { subtotal, gst, shipping, discount, total: finalTotal },
        date: new Date().toISOString(),
        status: "Processing"
      };

      const res = await api.post('/checkout', orderData);
      alert(`✨ Sparkle is on its way! Order ID: ${res.data.order_id}`);
      clearCart();
      navigate('/profile'); 
    } catch (err) {
      alert("Checkout failed. Please try again.");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-32 px-6 text-center">
        <div className="bg-giva-sand w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trash2 className="text-giva-pink" size={32} />
        </div>
        <h1 className="text-3xl font-serif mb-4">Your bag is feeling light</h1>
        <p className="text-gray-500 mb-10">Add some sparkle to your collection today.</p>
        <Link to="/" className="bg-giva-dark text-white px-12 py-4 uppercase text-xs font-bold tracking-widest hover:bg-black transition">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-16 px-6 lg:px-12">
      <div className="flex items-center gap-4 mb-12">
        <Link to="/" className="text-gray-400 hover:text-giva-dark transition">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-4xl font-serif">Shopping Bag</h1>
        <span className="text-sm text-gray-400 mt-2 font-medium">({cart.length} Items)</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-16">
        {/* LEFT: Item List */}
        <div className="lg:col-span-2 space-y-8">
          {cart.map(item => (
            <div key={item.id} className="flex gap-6 border-b border-gray-100 pb-8 group">
              <div className="w-32 h-40 bg-giva-sand rounded-xl overflow-hidden flex-shrink-0">
                <img src={item.image} className="w-full h-full object-cover mix-blend-multiply transition-transform group-hover:scale-105" />
              </div>
              
              <div className="flex-1 flex flex-col justify-between py-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-serif text-giva-dark">{item.name}</h3>
                    <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Product ID: {item.id}</p>
                  </div>
                  
                  {/* FUNCTIONAL TRASH BUTTON */}
                  <button 
                    onClick={() => handleRemove(item.id)} 
                    className="text-gray-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-all duration-300"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="flex justify-between items-end">
                  <div className="flex items-center border border-gray-200 rounded-full px-2 py-1 bg-white">
                    <button 
                      onClick={() => decrementQty(item.id, item.quantity)} 
                      className={`p-1 transition-colors ${item.quantity > 1 ? 'hover:text-giva-pink text-giva-dark' : 'text-gray-300 cursor-not-allowed'}`}
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center font-bold text-sm select-none">{item.quantity}</span>
                    <button 
                      onClick={() => incrementQty(item.id, item.quantity)} 
                      className="p-1 hover:text-giva-pink text-giva-dark transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <p className="text-lg font-bold text-giva-dark italic">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT: Summary & Billing (Keep existing logic) */}
        <div className="space-y-6">
          <div className="bg-giva-sand/40 p-8 rounded-3xl sticky top-28 border border-white">
            <h3 className="text-2xl font-serif mb-8">Order Summary</h3>
            <div className="space-y-4 mb-8">
               <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-bold text-giva-dark">₹{subtotal.toLocaleString()}</span>
              </div>
              {/* ... Rest of your billing JSX ... */}
              <div className="flex justify-between text-gray-600">
                <span>GST (3%)</span>
                <span className="font-bold text-giva-dark">₹{gst.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={`font-bold ${shipping === 0 ? 'text-green-600' : 'text-giva-dark'}`}>
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span className="font-bold">- ₹{discount}</span>
                </div>
              )}
            </div>

            {/* Promo Code Input */}
            <div className="flex gap-2 mb-8">
              <input 
                type="text" 
                placeholder="PROMO CODE" 
                className="flex-1 bg-white border border-gray-100 rounded-lg px-4 py-2 text-xs tracking-widest uppercase outline-none focus:border-giva-pink"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <button 
                onClick={() => promoCode === "GIVA10" ? setDiscount(Math.round(subtotal * 0.1)) : alert("Invalid Code")}
                className="text-[10px] font-bold text-giva-pink uppercase border-b border-giva-pink"
              >
                Apply
              </button>
            </div>

            <div className="border-t border-dashed border-gray-300 pt-6 flex justify-between items-end mb-8">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Amount</p>
                <p className="text-3xl font-bold text-giva-pink">₹{finalTotal.toLocaleString()}</p>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              className="w-full bg-giva-dark text-white py-5 rounded-2xl uppercase text-xs font-bold tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-black/10"
            >
              {isAuthenticated ? "Complete Order" : "Login to Checkout"}
            </button>
            
            {/* Trust Badges */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center text-center p-3 bg-white/50 rounded-xl">
                <Truck size={18} className="text-gray-400 mb-2" />
                <p className="text-[8px] font-bold uppercase tracking-widest text-gray-500">Fast Delivery</p>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-white/50 rounded-xl">
                <ShieldCheck size={18} className="text-gray-400 mb-2" />
                <p className="text-[8px] font-bold uppercase tracking-widest text-gray-500">Authentic</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}