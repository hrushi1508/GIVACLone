import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/useAuth';
import './admin.css';

const NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { path: '/admin/products', label: 'Products', icon: '💎' },
  { path: '/admin/orders', label: 'Orders', icon: '📦' },
  { path: '/admin/users', label: 'Users', icon: '👥' },
  { path: '/admin/promos', label: 'Promo Codes', icon: '🏷️' },
  { path: '/admin/settings', label: 'Site Settings', icon: '⚙️' },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const activeRoute = NAV_ITEMS.find((item) =>
    item.path === location.pathname ||
    (item.path !== '/admin' && location.pathname.startsWith(item.path))
  );

  const userInitials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'A';

  return (
    <div className="admin-root">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="admin-sidebar-brand">
          <div className="brand-icon">G</div>
          <span className="brand-text">GIVA <span style={{ color: 'var(--admin-gold)' }}>Admin</span></span>
        </div>

        <nav className="admin-sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className="nav-icon" style={{ fontSize: '1.2rem' }}>{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-nav-item" onClick={handleLogout} style={{ color: 'var(--admin-danger)' }}>
            <span className="nav-icon">🚪</span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="admin-header-left">
            <button
              className="admin-btn-icon"
              style={{ border: 'none', background: 'transparent', fontSize: '20px' }}
              onClick={() => {
                if (window.innerWidth <= 768) {
                  setMobileOpen(!mobileOpen);
                } else {
                  setCollapsed(!collapsed);
                }
              }}
              title="Toggle sidebar"
            >
              {collapsed ? '→' : '☰'}
            </button>
            <div className="admin-header-title">
              {activeRoute?.label || 'Dashboard'}
            </div>
          </div>

          <div className="admin-header-right">
            <div className="admin-header-user">
              <div className="user-avatar">{userInitials}</div>
              <div className="user-info">
                <span className="user-name">{user?.name || 'Admin'}</span>
                <span className="user-role">Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="admin-content">
          <Outlet />
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="admin-mobile-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.1)',
            backdropFilter: 'blur(4px)',
            zIndex: 35,
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}
    </div>
  );
}
