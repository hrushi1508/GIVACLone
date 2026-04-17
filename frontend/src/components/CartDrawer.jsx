import { useState } from 'react';
import { useCart } from '../store/useCart';
import { X, Trash2, ShoppingBag, Truck, ShieldCheck } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../store/useAuth'; // Added to get real user data
import NotificationPopup from './NotificationPopup';

export default function CartDrawer({ isOpen, onClose }) {
  const { cart, removeItem, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [popup, setPopup] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  // --- BILLING LOGIC ---
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const gst = Math.round(subtotal * 0.03); // Jewelry GST is usually 3%
  const shipping = subtotal > 999 || subtotal === 0 ? 0 : 99; // Free shipping over ₹999
  const total = subtotal + gst + shipping;

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      setPopup({
        isOpen: true,
        title: 'Login Required',
        message: 'Please login to complete your purchase and start your journey.',
        type: 'info'
      });
      return;
    }

    try {
      const order = {
        user_id: user.id,
        email: user.email,
        items: cart,
        billing: {
          subtotal,
          gst,
          shipping,
          total
        },
        date: new Date().toISOString()
      };
      
      const response = await api.post('/checkout', order);
      setPopup({
        isOpen: true,
        title: 'Sparkle on its way!',
        message: `Order Placed Successfully! Order ID: ${response.data.order_id}`,
        type: 'success',
        onConfirm: () => {
          clearCart();
          onClose();
        }
      });
    } catch (err) {
      console.error(err);
      setPopup({
        isOpen: true,
        title: 'Something went wrong',
        message: 'Checkout failed. Our goldsmiths are looking into it.',
        type: 'error'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-giva-pink" />
            <h2 className="text-xl font-serif">Your Bag</h2>
            <span className="bg-giva-sand text-giva-pink text-[10px] font-bold px-2 py-1 rounded-full">
              {cart.length} ITEMS
            </span>
          </div>
          <X className="cursor-pointer hover:rotate-90 transition-transform" onClick={onClose} />
        </div>

        {/* Scrollable Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <ShoppingBag size={48} className="mb-4" />
              <p className="font-serif italic">Your bag is empty...</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-4 group">
                <div className="w-20 h-24 bg-giva-sand rounded-lg overflow-hidden flex-shrink-0">
                  <img src={item.image} className="w-full h-full object-cover mix-blend-multiply" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-sm text-giva-dark leading-tight">{item.name}</h4>
                      <Trash2 
                        size={16} 
                        className="text-gray-300 cursor-pointer hover:text-red-500 transition-colors"
                        onClick={() => removeItem(item.id)}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-giva-dark">₹{item.price.toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Billing Section */}
        <div className="bg-giva-sand/30 p-6 space-y-3 border-t">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Order Summary</h3>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-medium text-giva-dark">₹{subtotal.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">GST (3%)</span>
            <span className="font-medium text-giva-dark">₹{gst.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Shipping</span>
            <span className={`font-medium ${shipping === 0 ? 'text-green-600' : 'text-giva-dark'}`}>
              {shipping === 0 ? 'FREE' : `₹${shipping}`}
            </span>
          </div>

          <div className="flex justify-between text-lg font-bold pt-3 border-t border-dashed border-gray-300">
            <span className="font-serif">Total</span>
            <span className="text-giva-pink">₹{total.toLocaleString()}</span>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-between py-2 text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
            <div className="flex items-center gap-1">
              <Truck size={12} /> Fast Delivery
            </div>
            <div className="flex items-center gap-1">
              <ShieldCheck size={12} /> Certified Quality
            </div>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-giva-dark text-white py-4 rounded-xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-black transition-all disabled:bg-gray-200 disabled:text-gray-400"
          >
            {isAuthenticated ? 'Place Order' : 'Login to Checkout'}
          </button>
        </div>
      </div>

      <NotificationPopup 
        {...popup} 
        onClose={() => setPopup({ ...popup, isOpen: false })} 
      />
    </div>
  );
}