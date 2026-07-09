import { useState, useEffect, useMemo } from 'react';
import { adminApi } from '../../utils/adminApi';
import { useAuth } from '../../store/useAuth';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [deleteId, setDeleteId] = useState(null);
  const currentUser = useAuth((s) => s.user);

  const loadUsers = () => {
    setLoading(true);
    adminApi.getUsers()
      .then((res) => setUsers(res.data))
      .catch((err) => console.error('Load users error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  const filtered = useMemo(() => {
    let list = users;
    if (search) {
      const q = search.toLowerCase();
      list = users.filter(u =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.id?.toLowerCase().includes(q)
      );
    }

    return [...list].sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'email') {
        return a.email?.toLowerCase().localeCompare(b.email?.toLowerCase() || '') * order;
      }
      if (sortBy === 'role') {
        const left = a.is_admin ? 'admin' : 'customer';
        const right = b.is_admin ? 'admin' : 'customer';
        return left.localeCompare(right) * order;
      }
      if (sortBy === 'orders') {
        return (Number(a.order_count || 0) - Number(b.order_count || 0)) * order;
      }
      return (new Date(a.joined_date).getTime() - new Date(b.joined_date).getTime()) * order;
    });
  }, [users, search, sortBy, sortOrder]);

  const handleRoleToggle = async (userId, currentIsAdmin) => {
    try {
      await adminApi.updateUserRole(userId, !currentIsAdmin);
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, is_admin: !currentIsAdmin, role: !currentIsAdmin ? 'admin' : 'customer' } : u
      ));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update role');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminApi.deleteUser(deleteId);
      setDeleteId(null);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete user');
    }
  };

  if (loading) {
    return <div className="admin-loading"><div className="admin-spinner" /></div>;
  }

  return (
    <div style={{ animation: 'adminFadeIn 0.5s ease-out' }}>
      <div className="admin-page-header">
        <div className="admin-page-title">
          <h1>User Management</h1>
          <p>Manage your customer base and administrative access.</p>
        </div>
        <div className="admin-page-actions">
          <button className="admin-btn admin-btn-secondary" onClick={loadUsers}>
            <span>🔄</span> Refresh Users
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        <div className="admin-table-header">
          <span className="admin-table-title">Customer Database ({filtered.length} Users)</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div className="admin-search-bar">
              <span>🔍</span>
              <input 
                placeholder="Search by name, email, or ID..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>
            <select
              className="admin-filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Sort by Name</option>
              <option value="email">Sort by Email</option>
              <option value="joined_date">Sort by Join Date</option>
              <option value="role">Sort by Role</option>
              <option value="orders">Sort by Orders</option>
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
                <th>Member</th>
                <th>Contact Info</th>
                <th>Registration</th>
                <th>Activity</th>
                <th>Role</th>
                <th>Admin Access</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: '50%',
                          background: u.is_admin
                            ? 'linear-gradient(135deg, var(--admin-gold), var(--admin-gold-light))'
                            : 'var(--admin-bg)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, fontWeight: 700,
                          color: u.is_admin ? '#fff' : 'var(--admin-text-muted)',
                          flexShrink: 0,
                          boxShadow: u.is_admin ? '0 4px 10px rgba(197, 160, 89, 0.2)' : 'none',
                          border: u.is_admin ? 'none' : '1px solid var(--admin-border)'
                        }}>
                          {u.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name || 'Member'}</div>
                          <div style={{ fontSize: 11, color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>{u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{u.email}</div>
                      <div style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{u.phone || 'No phone'}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13, color: 'var(--admin-text)' }}>{u.joined_date || '-'}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 700, color: u.order_count > 0 ? 'var(--admin-gold)' : 'var(--admin-text-muted)' }}>
                          {u.order_count}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--admin-text-dim)' }}>Orders</span>
                      </div>
                    </td>
                    <td>
                      <span className={`admin-badge ${u.is_admin ? 'admin-role' : 'customer-role'}`} style={{ 
                        background: u.is_admin ? 'rgba(197, 160, 89, 0.1)' : 'rgba(0,0,0,0.03)',
                        color: u.is_admin ? 'var(--admin-gold)' : 'var(--admin-text-muted)',
                        padding: '4px 12px',
                        fontWeight: 700
                      }}>
                        {u.is_admin ? 'Admin' : 'Customer'}
                      </span>
                    </td>
                    <td>
                      <label className="admin-toggle" title={isSelf ? 'Cannot change own role' : 'Toggle admin status'}>
                        <input
                          type="checkbox"
                          checked={u.is_admin || false}
                          onChange={() => handleRoleToggle(u.id, u.is_admin)}
                          disabled={isSelf}
                        />
                        <span className="admin-toggle-slider" />
                      </label>
                    </td>
                    <td>
                      {!isSelf && (
                        <button
                          className="admin-btn-icon"
                          onClick={() => setDeleteId(u.id)}
                          title="Delete user"
                          style={{ color: 'var(--admin-danger)', background: 'rgba(239, 68, 68, 0.05)', border: 'none' }}
                        >
                          🗑️
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="admin-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="admin-modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <span className="admin-modal-title">Delete User</span>
              <button className="admin-btn-icon" onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <div className="admin-modal-body">
              <p style={{ color: 'var(--admin-text-muted)', fontSize: 14 }}>
                Are you sure? This will also remove their cart and wishlist data. Orders will be preserved.
              </p>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="admin-btn admin-btn-danger" onClick={handleDelete}>Delete User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
