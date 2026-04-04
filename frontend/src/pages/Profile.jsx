import { useEffect, useState } from 'react';
import { useAuth } from '../store/useAuth';
import { orderApi } from '../utils/api';
import { Package, MapPin, User, LogOut, ChevronRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'details'

  useEffect(() => {
    if (user?.id) {
      orderApi.getHistory(user.id)
        .then(res => {
          setOrders(res.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-white">
      {/* Profile Header */}
      <header className="bg-giva-sand py-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-end">
          <div>
            <h1 className="text-4xl font-serif mb-2 text-giva-dark">My Account</h1>
            <p className="text-gray-500 uppercase tracking-widest text-[10px] font-bold">
              Welcome back, {user?.name}
            </p>
          </div>
          <button 
            onClick={logout}
            className="mt-6 md:mt-0 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-red-500 hover:bg-red-50 px-4 py-2 rounded-full transition"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-64 space-y-2">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition font-bold text-xs uppercase tracking-widest ${activeTab === 'orders' ? 'bg-giva-dark text-white' : 'hover:bg-gray-50 text-gray-500'}`}
            >
              <Package size={18} /> My Orders
            </button>
            <button 
              onClick={() => setActiveTab('details')}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition font-bold text-xs uppercase tracking-widest ${activeTab === 'details' ? 'bg-giva-dark text-white' : 'hover:bg-gray-50 text-gray-500'}`}
            >
              <User size={18} /> Account Details
            </button>
            <div className="pt-8 mt-8 border-t border-gray-100">
              <Link to="/" className="text-[10px] uppercase tracking-widest font-bold text-giva-pink hover:underline">
                Continue Shopping →
              </Link>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1">
            {activeTab === 'orders' ? (
              <section>
                <h3 className="text-xl font-serif mb-8">Order History ({orders.length})</h3>
                
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-50 animate-pulse rounded-2xl" />)}
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.order_id} className="group border border-gray-100 rounded-2xl p-6 hover:border-giva-pink transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-giva-sand rounded-full flex items-center justify-center text-giva-pink">
                            <ShoppingBag size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-giva-pink uppercase tracking-tighter mb-1">
                              {order.status}
                            </p>
                            <h4 className="font-bold text-sm">{order.order_id}</h4>
                            <p className="text-xs text-gray-400">{new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0">
                          <div className="text-right">
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Total Amount</p>
                            <p className="font-bold text-giva-dark">₹{order.total.toLocaleString()}</p>
                          </div>
                          <ChevronRight size={20} className="text-gray-300 group-hover:text-giva-pink transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-gray-50 rounded-3xl">
                    <Package className="mx-auto text-gray-200 mb-4" size={48} />
                    <p className="text-gray-400 font-serif italic">You haven't made any sparkle yours yet.</p>
                    <Link to="/" className="inline-block mt-6 bg-giva-dark text-white px-8 py-3 rounded-full text-[10px] uppercase tracking-widest font-bold">Shop Now</Link>
                  </div>
                )}
              </section>
            ) : (
              <section className="bg-gray-50 rounded-3xl p-8 md:p-12">
                <h3 className="text-xl font-serif mb-8">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Full Name</label>
                    <p className="text-giva-dark font-medium border-b border-gray-200 pb-2">{user?.name}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Email Address</label>
                    <p className="text-giva-dark font-medium border-b border-gray-200 pb-2">{user?.email}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Phone Number</label>
                    <p className="text-giva-dark font-medium border-b border-gray-200 pb-2">{user?.phone || '+91 98765 43210'}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Default Address</label>
                    <div className="flex items-start gap-2 text-gray-600 mt-1">
                      <MapPin size={14} className="mt-1 flex-shrink-0" />
                      <p className="text-sm leading-relaxed">
                        {user?.address || "No address saved. Add one during your next checkout."}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}