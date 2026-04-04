import { useEffect, useState } from 'react';
import { orderApi } from '../utils/api';
import { useAuth } from '../store/useAuth';
import { Package, ChevronRight } from 'lucide-react';

export default function OrderHistory() {
  const user = useAuth((state) => state.user);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user) {
      orderApi.getHistory(user.id).then((res) => setOrders(res.data));
    }
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h2 className="text-3xl font-serif mb-8">My Orders</h2>
      {orders.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-2xl">
          <Package className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-400">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.order_id} className="border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-giva-pink uppercase tracking-widest mb-1">{order.status}</p>
                <h4 className="font-bold text-lg">{order.order_id}</h4>
                <p className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
              </div>
              <div className="text-right flex items-center gap-6">
                <div>
                  <p className="text-xs text-gray-400 uppercase">Amount</p>
                  <p className="font-bold">₹{order.total}</p>
                </div>
                <ChevronRight className="text-gray-300" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}