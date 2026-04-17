import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/useAuth';
import { orderApi } from '../utils/api';
import { Package, MapPin, User, LogOut, ChevronRight, ShoppingBag, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'details'

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    if (user?.id) {
      setLoading(true);
      setError(null);
      orderApi.getHistory(user.id)
        .then(res => {
          setOrders(res.data || []);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching orders:', err);
          setError('Failed to load your orders. Please try again.');
          setLoading(false);
        });
    }
  }, [user, isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Profile Header */}
      <header className="bg-gradient-to-r from-giva-sand/40 to-giva-pink/10 border-b border-giva-sand/50">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-giva-dark mb-2">My Account</h1>
              <p className="text-giva-dark/60 uppercase tracking-wider text-[10px] font-bold">
                Welcome back, {user?.name}
              </p>
            </motion.div>
            <motion.button 
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-red-500 hover:bg-red-50 px-6 py-3 rounded-full transition border border-red-200"
            >
              <LogOut size={14} /> Sign Out
            </motion.button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <div className="space-y-2 lg:sticky lg:top-20">
              <motion.button 
                onClick={() => setActiveTab('orders')}
                whileHover={{ x: 4 }}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition font-bold text-xs uppercase tracking-widest ${
                  activeTab === 'orders' 
                    ? 'bg-giva-dark text-white shadow-md' 
                    : 'hover:bg-gray-50 text-gray-600 border border-transparent hover:border-gray-200'
                }`}
              >
                <Package size={18} /> My Orders
              </motion.button>
              <motion.button 
                onClick={() => setActiveTab('details')}
                whileHover={{ x: 4 }}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition font-bold text-xs uppercase tracking-widest ${
                  activeTab === 'details' 
                    ? 'bg-giva-dark text-white shadow-md' 
                    : 'hover:bg-gray-50 text-gray-600 border border-transparent hover:border-gray-200'
                }`}
              >
                <User size={18} /> Account Details
              </motion.button>
              <div className="pt-8 mt-8 border-t border-gray-100">
                <Link 
                  to="/" 
                  className="text-[10px] uppercase tracking-widest font-bold text-giva-pink hover:text-giva-dark transition inline-flex items-center gap-1"
                >
                  Continue Shopping →
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-3">
            {activeTab === 'orders' ? (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="mb-8">
                  <h3 className="text-2xl font-serif font-bold text-giva-dark mb-2">Order History</h3>
                  <p className="text-sm text-gray-600">({orders.length} {orders.length === 1 ? 'order' : 'orders'})</p>
                </div>
                
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
                  >
                    <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </motion.div>
                )}

                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="h-24 bg-gradient-to-r from-gray-50 to-gray-100 animate-pulse rounded-2xl" 
                      />
                    ))}
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order, idx) => (
                      <motion.div 
                        key={order.order_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group border border-gray-200 rounded-2xl p-6 hover:border-giva-pink hover:bg-gradient-to-r hover:from-giva-pink/5 to-transparent transition-all"
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-14 h-14 bg-gradient-to-br from-giva-sand to-giva-pink/20 rounded-xl flex items-center justify-center text-giva-pink shadow-sm">
                              <ShoppingBag size={22} />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-giva-pink uppercase tracking-tighter mb-1">
                                {order.status || 'Pending'}
                              </p>
                              <h4 className="font-bold text-sm text-giva-dark">{order.order_id}</h4>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(order.date).toLocaleDateString('en-IN', { 
                                  day: 'numeric', 
                                  month: 'short', 
                                  year: 'numeric' 
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 w-full md:w-auto justify-between border-t md:border-t-0 pt-4 md:pt-0">
                            <div className="text-right">
                              <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Total</p>
                              <p className="font-bold text-lg text-giva-dark">₹{(order.billing?.total || order.total || 0).toLocaleString('en-IN')}</p>
                            </div>
                            <ChevronRight size={20} className="text-gray-300 group-hover:text-giva-pink transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20 bg-gradient-to-br from-giva-sand/20 to-giva-pink/10 rounded-3xl border border-giva-sand/30"
                  >
                    <Package className="mx-auto text-giva-pink/30 mb-4" size={56} />
                    <p className="text-gray-400 font-serif italic text-lg mb-6">You haven't made any sparkle yours yet.</p>
                    <Link 
                      to="/" 
                      className="inline-block bg-giva-dark text-white px-8 py-3 rounded-full text-[10px] uppercase tracking-widest font-bold hover:shadow-lg transition"
                    >
                      Start Shopping
                    </Link>
                  </motion.div>
                )}
              </motion.section>
            ) : (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-giva-sand/20 to-white rounded-3xl border border-giva-sand/30 p-8 md:p-12"
              >
                <h3 className="text-2xl font-serif font-bold text-giva-dark mb-8">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-2 tracking-wider">Full Name</label>
                    <p className="text-lg text-giva-dark font-medium border-b-2 border-giva-pink/20 pb-3">{user?.name || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-2 tracking-wider">Email Address</label>
                    <p className="text-lg text-giva-dark font-medium border-b-2 border-giva-pink/20 pb-3">{user?.email || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-2 tracking-wider">Phone Number</label>
                    <p className="text-lg text-giva-dark font-medium border-b-2 border-giva-pink/20 pb-3">{user?.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-2 tracking-wider">Default Address</label>
                    <div className="flex items-start gap-2 text-gray-600 mt-2 border-b-2 border-giva-pink/20 pb-3">
                      <MapPin size={16} className="mt-1 flex-shrink-0 text-giva-pink" />
                      <p className="text-sm leading-relaxed">
                        {user?.address || "No address saved. Add one during your next checkout."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-12 pt-8 border-t border-giva-sand/50">
                  <h4 className="text-sm font-bold text-giva-dark mb-4 uppercase tracking-wider">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <Link 
                      to="/" 
                      className="p-3 border border-giva-pink/30 rounded-lg text-center hover:bg-giva-pink/5 transition text-[10px] font-bold text-giva-pink uppercase tracking-wider"
                    >
                      Continue Shopping
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="p-3 border border-red-200 rounded-lg text-center hover:bg-red-50 transition text-[10px] font-bold text-red-600 uppercase tracking-wider"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </motion.section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}