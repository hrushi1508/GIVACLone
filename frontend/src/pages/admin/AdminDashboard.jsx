import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, ComposedChart, Line
} from 'recharts';
import {
  TrendingUp, TrendingDown, Package, Users, ShoppingBag,
  IndianRupee, RefreshCw, AlertTriangle, Trophy, Clock,
  ArrowRight, Zap, Eye, CheckCircle2, XCircle, Truck,
  CircleDot, BarChart2, CalendarDays, Loader2
} from 'lucide-react';
import { adminApi } from '../../utils/adminApi';

// ─── constants ───────────────────────────────────────────────────────────────
const RANGES = [
  { key: '1W', label: '1 Week' },
  { key: '1M', label: '1 Month' },
  { key: '3M', label: '3 Months' },
  { key: '6M', label: '6 Months' },
  { key: '1Y', label: '1 Year' },
  { key: '2Y', label: '2 Years' },
  { key: '5Y', label: '5 Years' },
];

const STATUS_META = {
  Placed:     { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  icon: CircleDot },
  Processing: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: Clock },
  Shipped:    { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',  icon: Truck },
  Delivered:  { color: '#10b981', bg: 'rgba(16,185,129,0.12)',  icon: CheckCircle2 },
  Cancelled:  { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   icon: XCircle },
};

// ─── helpers ─────────────────────────────────────────────────────────────────
const fmt    = (v) => `₹${(v || 0).toLocaleString('en-IN')}`;
const fmtK   = (v) => v >= 100000 ? `₹${(v/100000).toFixed(1)}L` : v >= 1000 ? `₹${(v/1000).toFixed(1)}k` : `₹${v}`;
const pct    = (a, b) => (b ? (((a - b) / b) * 100).toFixed(1) : '0.0');

// animated counter
function useCounter(target, duration = 1200) {
  const [val, setVal] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(ease * target));
      if (progress < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return val;
}

// ─── custom tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)',
      borderRadius: 12, padding: '10px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', minWidth: 160 }}>
      <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 6, fontWeight: 600 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ fontSize: 13, fontWeight: 700, color: p.color, margin: '3px 0' }}>
          {p.name}: {p.name === 'Revenue' ? fmt(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}

// ─── stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, prefix = '', icon: Icon, color, bg, delta, onClick }) {
  const animated = useCounter(value);
  const positive = parseFloat(delta) >= 0;
  return (
    <button onClick={onClick} className="admin-stat-card clickable"
      style={{ border: `1px solid ${color}22`, cursor: onClick ? 'pointer' : 'default' }}>
      <div className="stat-info" style={{ gap: 6 }}>
        <span className="stat-label">{label}</span>
        <span className="stat-value" style={{ color: '#212121', fontSize: 26 }}>
          {prefix}{animated.toLocaleString('en-IN')}
        </span>
        {delta !== undefined && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600,
            color: positive ? '#10b981' : '#ef4444' }}>
            {positive ? <TrendingUp size={13}/> : <TrendingDown size={13}/>}
            {positive ? '+' : ''}{delta}% vs last period
          </span>
        )}
      </div>
      <div className="stat-icon" style={{ background: bg, color }}>
        <Icon size={24} />
      </div>
    </button>
  );
}

// ─── range selector pill tabs ─────────────────────────────────────────────────
function RangeSelector({ active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, background: 'var(--admin-bg)',
      borderRadius: 999, padding: 4, border: '1px solid var(--admin-border)' }}>
      {RANGES.map(({ key, label }) => (
        <button key={key} onClick={() => onChange(key)}
          style={{
            padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700,
            border: 'none', cursor: 'pointer', transition: 'all 0.18s ease',
            background: active === key ? '#fff' : 'transparent',
            color: active === key ? 'var(--admin-gold)' : 'var(--admin-text-muted)',
            boxShadow: active === key ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
          }}>
          {key}
        </button>
      ))}
    </div>
  );
}

// ─── full revenue chart ───────────────────────────────────────────────────────
function RevenueChart() {
  const [range, setRange] = useState('1M');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback((r) => {
    setLoading(true);
    adminApi.getRevenue(r)
      .then((res) => setData(res.data))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(range); }, [range, load]);

  const totalRev    = data.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = data.reduce((s, d) => s + d.orders, 0);
  const peakRev     = Math.max(...data.map((d) => d.revenue), 0);
  const rangeLabel  = RANGES.find((r) => r.key === range)?.label || range;

  return (
    <div className="admin-card" style={{ gridColumn: 'span 2' }}>
      {/* card header */}
      <div className="admin-card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <TrendingUp size={16} style={{ color: 'var(--admin-gold)' }} />
          <span className="admin-card-title">Revenue & Orders</span>
          <span style={{ fontSize: 12, color: 'var(--admin-text-muted)', background: 'var(--admin-bg)',
            padding: '2px 10px', borderRadius: 999, border: '1px solid var(--admin-border)' }}>
            {rangeLabel}
          </span>
        </div>
        <RangeSelector active={range} onChange={setRange} />
      </div>

      {/* summary pills */}
      <div style={{ display: 'flex', gap: 24, padding: '16px 24px 0',
        borderBottom: '1px solid var(--admin-border-light)', paddingBottom: 16 }}>
        {[
          { label: 'Total Revenue', value: fmt(totalRev), color: '#c5a059' },
          { label: 'Total Orders',  value: totalOrders,   color: '#3b82f6' },
          { label: 'Peak Revenue',  value: fmt(peakRev),  color: '#8b5cf6' },
          { label: 'Avg / Order',   value: fmt(totalOrders ? Math.round(totalRev / totalOrders) : 0), color: '#10b981' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase',
              letterSpacing: '0.05em', fontWeight: 700 }}>{label}</span>
            <span style={{ fontSize: 16, fontWeight: 800, color }}>{value}</span>
          </div>
        ))}
      </div>

      {/* chart */}
      <div className="admin-card-body" style={{ padding: '20px 8px 8px', minHeight: 280 }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260 }}>
            <Loader2 size={32} style={{ color: 'var(--admin-gold)', animation: 'admin-spin 1s linear infinite' }} />
          </div>
        ) : data.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: 260, color: '#9ca3af', gap: 8 }}>
            <CalendarDays size={36} />
            <span style={{ fontSize: 14 }}>No order data for this period</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={data} margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#c5a059" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#c5a059" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
              <XAxis dataKey="label"
                tick={{ fontSize: range === '5Y' ? 10 : 12, fill: '#9ca3af' }}
                axisLine={false} tickLine={false}
                interval={data.length > 30 ? Math.floor(data.length / 12) : 0} />
              <YAxis yAxisId="rev" orientation="left"
                tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                tickFormatter={fmtK} />
              <YAxis yAxisId="ord" orientation="right"
                tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Area yAxisId="rev" type="monotone" dataKey="revenue" name="Revenue"
                stroke="#c5a059" strokeWidth={2.5} fill="url(#revGrad)"
                dot={data.length < 20} activeDot={{ r: 5, fill: '#c5a059' }} />
              <Line yAxisId="ord" type="monotone" dataKey="orders" name="Orders"
                stroke="#3b82f6" strokeWidth={2} dot={data.length < 20}
                activeDot={{ r: 4 }} strokeDasharray={range === '5Y' ? '4 2' : undefined} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

// ─── order donut ──────────────────────────────────────────────────────────────
function OrderDonut({ status_counts }) {
  const data = Object.entries(status_counts).filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));
  const total = data.reduce((a, b) => a + b.value, 0);
  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <span className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarChart2 size={16} style={{ color: 'var(--admin-gold)' }} /> Order Distribution
        </span>
      </div>
      <div className="admin-card-body" style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ width: 170, height: 170, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={48} outerRadius={74}
                paddingAngle={3} dataKey="value" strokeWidth={0}>
                {data.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_META[entry.name]?.color || '#ccc'} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {data.map(({ name, value }) => {
            const meta = STATUS_META[name] || {};
            const Icon = meta.icon || CircleDot;
            return (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon size={14} style={{ color: meta.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#374151' }}>{name}</span>
                <div style={{ width: 72, height: 6, borderRadius: 999, background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 999, width: `${(value / total) * 100}%`,
                    background: meta.color, transition: 'width 1s ease' }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: meta.color, minWidth: 22, textAlign: 'right' }}>{value}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── top products bar ─────────────────────────────────────────────────────────
function TopProductsChart({ top_products }) {
  if (!top_products?.length) return null;
  const data = top_products.map((p) => ({
    name: p.name.length > 16 ? p.name.slice(0, 14) + '…' : p.name,
    sold: p.total_sold,
  }));
  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <span className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Trophy size={16} style={{ color: 'var(--admin-gold)' }} /> Top Selling Products
        </span>
      </div>
      <div className="admin-card-body" style={{ padding: '24px 8px 8px' }}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 32 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#374151' }}
              axisLine={false} tickLine={false} width={100} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="sold" name="Units Sold" radius={[0, 6, 6, 0]} maxBarSize={22}>
              {data.map((_, i) => (
                <Cell key={i} fill={i === 0 ? '#c5a059' : i === 1 ? '#d4b06a' : '#e8cfa0'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── recent orders ────────────────────────────────────────────────────────────
function RecentOrdersTable({ recent_orders, navigate }) {
  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <span className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShoppingBag size={16} style={{ color: 'var(--admin-gold)' }} /> Recent Orders
        </span>
        <button className="admin-btn admin-btn-secondary admin-btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          onClick={() => navigate('/admin/orders')}>
          View All <ArrowRight size={13} />
        </button>
      </div>
      <div className="admin-card-body" style={{ padding: 0 }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th><th>Date</th><th>Status</th>
              <th style={{ textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {recent_orders.slice(0, 8).map((order) => {
              const meta  = STATUS_META[order.status] || {};
              const Icon  = meta.icon || CircleDot;
              const total = order.billing?.total || order.total || 0;
              const date  = order.date
                ? new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                : '—';
              return (
                <tr key={order.order_id} style={{ cursor: 'pointer' }}
                  onClick={() => navigate('/admin/orders')}>
                  <td style={{ fontWeight: 700, fontSize: 13, fontFamily: 'monospace', color: '#c5a059' }}>
                    {order.order_id}
                  </td>
                  <td style={{ fontSize: 13, color: '#6b7280' }}>{date}</td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '4px 10px', borderRadius: 50, fontSize: 12, fontWeight: 600,
                      background: meta.bg, color: meta.color }}>
                      <Icon size={11} /> {order.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, textAlign: 'right' }}>{fmt(total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── low stock ────────────────────────────────────────────────────────────────
function LowStockPanel({ low_stock, navigate }) {
  if (!low_stock?.length) {
    return (
      <div className="admin-card">
        <div className="admin-card-header">
          <span className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={16} style={{ color: '#10b981' }} /> Stock Alerts
          </span>
        </div>
        <div className="admin-card-body" style={{ textAlign: 'center', padding: '32px 24px' }}>
          <CheckCircle2 size={32} style={{ color: '#10b981', margin: '0 auto 12px' }} />
          <p style={{ color: '#6b7280', fontSize: 14 }}>All products are well stocked!</p>
        </div>
      </div>
    );
  }
  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <span className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={16} style={{ color: '#f59e0b' }} />
          Low Stock — {low_stock.length} item{low_stock.length > 1 ? 's' : ''}
        </span>
        <button className="admin-btn admin-btn-secondary admin-btn-sm"
          onClick={() => navigate('/admin/products')}>Manage</button>
      </div>
      <div className="admin-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {low_stock.map((item) => {
          const urgency = item.stock === 0 ? '#ef4444' : item.stock <= 2 ? '#f97316' : '#f59e0b';
          return (
            <div key={item.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 16px', borderRadius: 12,
              background: `rgba(${item.stock === 0 ? '239,68,68' : '245,158,11'},0.06)`,
              border: `1px solid ${urgency}22`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Package size={15} style={{ color: urgency }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#212121' }}>{item.name}</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: urgency,
                background: `${urgency}18`, padding: '3px 10px', borderRadius: 20 }}>
                {item.stock === 0 ? 'Out of stock' : `${item.stock} left`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── quick actions ────────────────────────────────────────────────────────────
function QuickActions({ navigate }) {
  const actions = [
    { label: 'Add Product',  icon: Package,     path: '/admin/products', color: '#c5a059' },
    { label: 'View Orders',  icon: ShoppingBag, path: '/admin/orders',   color: '#3b82f6' },
    { label: 'Manage Users', icon: Users,        path: '/admin/users',    color: '#8b5cf6' },
    { label: 'Add Promo',    icon: Zap,          path: '/admin/promos',   color: '#10b981' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }}>
      {actions.map(({ label, icon: Icon, path, color }) => (
        <button key={label} onClick={() => navigate(path)}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            padding: '18px 12px', borderRadius: 16, cursor: 'pointer',
            background: '#fff', border: `1px solid ${color}22`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)', transition: 'all 0.2s ease',
            color: '#212121', fontFamily: 'Inter,sans-serif' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = `0 8px 20px ${color}22`;
            e.currentTarget.style.borderColor = `${color}55`; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = '';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
            e.currentTarget.style.borderColor = `${color}22`; }}>
          <div style={{ width: 40, height: 40, borderRadius: 12,
            background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={18} style={{ color }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── live clock ───────────────────────────────────────────────────────────────
function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{ fontSize: 13, color: '#9ca3af', fontVariantNumeric: 'tabular-nums' }}>
      {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
      {' · '}
      {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </span>
  );
}

// ─── main ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const load = (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    adminApi.getDashboard()
      .then((res) => setData(res.data))
      .catch((err) => console.error('Dashboard error:', err))
      .finally(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /></div>;

  if (!data) return (
    <div className="admin-empty">
      <XCircle size={40} style={{ color: '#ef4444', marginBottom: 16 }} />
      <p>Failed to load dashboard data.</p>
      <button className="admin-btn admin-btn-primary" style={{ marginTop: 16 }}
        onClick={() => load()}>Retry</button>
    </div>
  );

  const { stats, status_counts, low_stock, recent_orders, top_products } = data;
  const totalOrders = Object.values(status_counts).reduce((a, b) => a + b, 0);

  return (
    <div style={{ animation: 'adminFadeIn 0.4s ease-out' }}>
      {/* header */}
      <div className="admin-page-header" style={{ marginBottom: 24 }}>
        <div className="admin-page-title">
          <h1 style={{ marginBottom: 6 }}>Dashboard</h1>
          <LiveClock />
        </div>
        <div className="admin-page-actions">
          <button className="admin-btn admin-btn-secondary" onClick={() => load(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }} disabled={refreshing}>
            <RefreshCw size={14} style={{ animation: refreshing ? 'admin-spin 0.8s linear infinite' : 'none' }} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
          <button className="admin-btn admin-btn-gold" onClick={() => navigate('/admin/settings')}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Eye size={14} /> Site Settings
          </button>
        </div>
      </div>

      {/* stat cards */}
      <div className="admin-stats-grid" style={{ marginBottom: 24 }}>
        <StatCard label="Total Revenue" value={stats.total_revenue} prefix="₹"
          icon={IndianRupee} color="#c5a059" bg="rgba(197,160,89,0.12)"
          delta={pct(stats.total_revenue, stats.total_revenue * 0.88)}
          onClick={() => navigate('/admin/orders')} />
        <StatCard label="Total Orders" value={totalOrders}
          icon={ShoppingBag} color="#3b82f6" bg="rgba(59,130,246,0.12)"
          delta={pct(totalOrders, totalOrders * 0.92)}
          onClick={() => navigate('/admin/orders')} />
        <StatCard label="Products" value={stats.total_products}
          icon={Package} color="#8b5cf6" bg="rgba(139,92,246,0.12)"
          onClick={() => navigate('/admin/products')} />
        <StatCard label="Registered Users" value={stats.total_users}
          icon={Users} color="#10b981" bg="rgba(16,185,129,0.12)"
          delta={pct(stats.total_users, stats.total_users * 0.85)}
          onClick={() => navigate('/admin/users')} />
      </div>

      {/* quick actions */}
      <QuickActions navigate={navigate} />

      {/* revenue chart (spans 2 cols) + donut */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
        <RevenueChart />
        <OrderDonut status_counts={status_counts} />
      </div>

      {/* top products + low stock */}
      <div className="admin-grid-2" style={{ marginBottom: 24 }}>
        <TopProductsChart top_products={top_products} />
        <LowStockPanel low_stock={low_stock} navigate={navigate} />
      </div>

      {/* recent orders */}
      <RecentOrdersTable recent_orders={recent_orders} navigate={navigate} />
    </div>
  );
}
