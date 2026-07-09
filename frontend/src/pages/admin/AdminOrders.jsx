import { useState, useEffect, useMemo } from 'react';
import { adminApi } from '../../utils/adminApi';

const STATUS_OPTIONS = ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const loadOrders = () => {
    setLoading(true);
    adminApi.getOrders()
      .then((res) => setOrders(res.data))
      .catch((err) => console.error('Load orders error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadOrders(); }, []);

  const getOrderTotal = (order) => {
    if (order.billing?.total) return order.billing.total;
    return order.total || 0;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const filtered = useMemo(() => {
    let list = orders;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        o.order_id?.toLowerCase().includes(q) ||
        o.user_name?.toLowerCase().includes(q) ||
        o.user_id?.toLowerCase().includes(q)
      );
    }
    if (statusFilter) {
      list = list.filter(o => o.status === statusFilter);
    }

    return [...list].sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'total') {
        return (getOrderTotal(a) - getOrderTotal(b)) * order;
      }
      if (sortBy === 'customer') {
        return a.user_name?.toLowerCase().localeCompare(b.user_name?.toLowerCase() || '') * order;
      }
      if (sortBy === 'status') {
        return a.status?.localeCompare(b.status || '') * order;
      }
      return (new Date(a.date).getTime() - new Date(b.date).getTime()) * order;
    });
  }, [orders, search, statusFilter, sortBy, sortOrder]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error('Status update error:', err);
      alert('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <div className="admin-loading"><div className="admin-spinner" /></div>;
  }

  return (
    <div style={{ animation: 'adminFadeIn 0.5s ease-out' }}>
      <div className="admin-page-header">
        <div className="admin-page-title">
          <h1>Order Management</h1>
          <p>Monitor and process your premium customer orders.</p>
        </div>
        <div className="admin-page-actions">
          <button className="admin-btn admin-btn-secondary" onClick={loadOrders}>
            <span>🔄</span> Refresh Orders
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        <div className="admin-table-header">
          <span className="admin-table-title">Recent Transactions ({filtered.length})</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div className="admin-search-bar">
              <span>🔍</span>
              <input 
                placeholder="Search by ID or customer..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>
            <select 
              className="admin-filter-select" 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              className="admin-filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">Sort by Date</option>
              <option value="total">Sort by Total</option>
              <option value="customer">Sort by Customer</option>
              <option value="status">Sort by Status</option>
            </select>
            <button
              className="admin-btn admin-btn-secondary"
              onClick={() => setSortOrder((prev) => prev === 'asc' ? 'desc' : 'asc')}
              style={{ whiteSpace: 'nowrap' }}
            >
              {sortOrder === 'asc' ? 'Asc' : 'Desc'}
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total Value</th>
                <th>Placed On</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <>
                  <tr key={order.order_id}>
                    <td>
                      <span style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: 13, color: 'var(--admin-gold)' }}>
                        {order.order_id}
                      </span>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{order.user_name}</div>
                        <div style={{ fontSize: 11, color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>{order.user_id}</div>
                      </div>
                    </td>
                    <td>
                      <span className="admin-badge customer-role">
                        {order.items?.length || 0} {order.items?.length === 1 ? 'Item' : 'Items'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--admin-text)' }}>
                        ₹{getOrderTotal(order).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 13, color: 'var(--admin-text-muted)' }}>
                        {formatDate(order.date)}
                      </span>
                    </td>
                    <td>
                      <select
                        className="admin-filter-select"
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                        disabled={updatingId === order.order_id}
                        style={{
                          fontSize: 12,
                          padding: '6px 12px',
                          fontWeight: 700,
                          borderRadius: '20px',
                          border: 'none',
                          cursor: 'pointer',
                          background: order.status === 'Delivered' ? 'rgba(16, 185, 129, 0.1)' :
                                     order.status === 'Cancelled' ? 'rgba(239, 68, 68, 0.1)' :
                                     order.status === 'Shipped' ? 'rgba(139, 92, 246, 0.1)' :
                                     order.status === 'Processing' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                          color: order.status === 'Delivered' ? 'var(--admin-success)' :
                                 order.status === 'Cancelled' ? 'var(--admin-danger)' :
                                 order.status === 'Shipped' ? 'var(--admin-purple)' :
                                 order.status === 'Processing' ? 'var(--admin-warning)' : 'var(--admin-info)',
                        }}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      <button
                        className="admin-btn-icon"
                        onClick={() => setExpandedOrder(expandedOrder === order.order_id ? null : order.order_id)}
                        title="View details"
                        style={{ background: expandedOrder === order.order_id ? 'var(--admin-bg)' : 'transparent', border: 'none' }}
                      >
                        {expandedOrder === order.order_id ? '▲' : '▼'}
                      </button>
                    </td>
                  </tr>
                  {expandedOrder === order.order_id && (
                    <tr key={`${order.order_id}-detail`}>
                      <td colSpan="7" style={{ background: 'var(--admin-surface-hover)', padding: '24px 32px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 32 }}>
                          <div className="admin-card" style={{ background: '#fff' }}>
                            <div className="admin-card-header">
                              <span className="admin-card-title">Order Items</span>
                            </div>
                            <div className="admin-card-body">
                              {order.items?.map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < order.items.length - 1 ? '1px solid var(--admin-border-light)' : 'none', fontSize: 14 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 40, height: 40, background: 'var(--admin-bg)', borderRadius: 8 }}></div>
                                    <div>
                                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                                      <div style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>Quantity: {item.quantity}</div>
                                    </div>
                                  </div>
                                  <span style={{ fontWeight: 700 }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="admin-card" style={{ background: '#fff' }}>
                            <div className="admin-card-header">
                              <span className="admin-card-title">Summary</span>
                            </div>
                            <div className="admin-card-body">
                              {order.billing ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>₹{order.billing.subtotal?.toLocaleString('en-IN')}</span></div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tax (GST)</span><span>₹{order.billing.gst?.toLocaleString('en-IN')}</span></div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Shipping</span><span>₹{order.billing.shipping?.toLocaleString('en-IN')}</span></div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Discount</span><span style={{ color: 'var(--admin-success)', fontWeight: 600 }}>-₹{order.billing.discount?.toLocaleString('en-IN')}</span></div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, borderTop: '2px solid var(--admin-bg)', paddingTop: 12, marginTop: 4, fontSize: 16 }}><span>Total</span><span style={{ color: 'var(--admin-gold)' }}>₹{order.billing.total?.toLocaleString('en-IN')}</span></div>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>₹{order.subtotal?.toLocaleString('en-IN')}</span></div>
                                  {order.promo_used && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Promo ({order.promo_used})</span><span style={{ color: 'var(--admin-success)', fontWeight: 600 }}>-₹{order.discount?.toLocaleString('en-IN')}</span></div>}
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, borderTop: '2px solid var(--admin-bg)', paddingTop: 12, marginTop: 4, fontSize: 16 }}><span>Total</span><span style={{ color: 'var(--admin-gold)' }}>₹{order.total?.toLocaleString('en-IN')}</span></div>
                                  {order.payment_method && <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--admin-text-muted)', fontSize: 12, marginTop: 8 }}><span>Payment Method</span><span>{order.payment_method}</span></div>}
                                </div>
                              )}
                              <div style={{ marginTop: 24 }}>
                                <button className="admin-btn admin-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                                  Print Invoice
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
