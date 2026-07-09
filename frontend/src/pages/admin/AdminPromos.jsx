import { useState, useEffect } from 'react';
import { adminApi } from '../../utils/adminApi';

const EMPTY_PROMO = {
  code: '', description: '', discount_type: 'percentage',
  value: '', min_purchase: '', max_discount: '', active: true,
};

export default function AdminPromos() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPromo, setEditPromo] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_PROMO });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const loadPromos = () => {
    setLoading(true);
    adminApi.getPromos()
      .then((res) => setPromos(res.data))
      .catch((err) => console.error('Load promos error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPromos(); }, []);

  const openCreate = () => {
    setEditPromo(null);
    setForm({ ...EMPTY_PROMO });
    setModalOpen(true);
  };

  const openEdit = (promo) => {
    setEditPromo(promo);
    setForm({
      code: promo.code, description: promo.description || '',
      discount_type: promo.discount_type || 'percentage',
      value: promo.value, min_purchase: promo.min_purchase || 0,
      max_discount: promo.max_discount || '', active: promo.active !== false,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.value) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        value: Number(form.value),
        min_purchase: Number(form.min_purchase) || 0,
        max_discount: form.max_discount ? Number(form.max_discount) : undefined,
      };
      if (editPromo) {
        await adminApi.updatePromo(editPromo.id, payload);
      } else {
        await adminApi.createPromo(payload);
      }
      setModalOpen(false);
      loadPromos();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save promo');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (promoId) => {
    try {
      const res = await adminApi.togglePromo(promoId);
      setPromos(prev => prev.map(p => p.id === promoId ? { ...p, active: res.data.active } : p));
    } catch (err) {
      alert('Failed to toggle promo');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminApi.deletePromo(deleteId);
      setDeleteId(null);
      loadPromos();
    } catch (err) {
      alert('Failed to delete promo');
    }
  };

  if (loading) {
    return <div className="admin-loading"><div className="admin-spinner" /></div>;
  }

  return (
    <div style={{ animation: 'adminFadeIn 0.5s ease-out' }}>
      <div className="admin-page-header">
        <div className="admin-page-title">
          <h1>Promotions & Vouchers</h1>
          <p>Create and manage discount codes for your premium customers.</p>
        </div>
        <div className="admin-page-actions">
          <button className="admin-btn admin-btn-gold" onClick={openCreate}>
            <span style={{ fontSize: '1.2rem' }}>+</span> Create New Promo
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        <div className="admin-table-header">
          <span className="admin-table-title">Available Offers ({promos.length})</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Promo Code</th>
                <th>Description</th>
                <th>Type</th>
                <th>Value</th>
                <th>Criteria</th>
                <th>Cap</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span style={{
                      fontWeight: 800, letterSpacing: '0.08em',
                      fontFamily: 'monospace', fontSize: 13,
                      color: 'var(--admin-gold)',
                      background: 'rgba(197, 160, 89, 0.05)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: '1px dashed rgba(197, 160, 89, 0.3)'
                    }}>
                      {p.code}
                    </span>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--admin-text-muted)', maxWidth: 220 }}>
                    {p.description || 'No description provided'}
                  </td>
                  <td>
                    <span className="admin-badge" style={{
                      background: p.discount_type === 'percentage' ? 'rgba(139, 92, 246, 0.08)' : 'rgba(59, 130, 246, 0.08)',
                      color: p.discount_type === 'percentage' ? 'var(--admin-purple)' : 'var(--admin-info)',
                      fontWeight: 700
                    }}>
                      {p.discount_type === 'percentage' ? 'PERCENT' : 'FIXED'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--admin-text)' }}>
                    {p.discount_type === 'percentage' ? `${p.value}%` : `₹${p.value.toLocaleString('en-IN')}`}
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--admin-text-muted)' }}>
                    Min: ₹{p.min_purchase?.toLocaleString('en-IN')}
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--admin-text-muted)' }}>
                    {p.max_discount ? `₹${p.max_discount.toLocaleString('en-IN')}` : 'No Cap'}
                  </td>
                  <td>
                    <label className="admin-toggle">
                      <input type="checkbox" checked={p.active !== false} onChange={() => handleToggle(p.id)} />
                      <span className="admin-toggle-slider" />
                    </label>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="admin-btn-icon" onClick={() => openEdit(p)} title="Edit">✏️</button>
                      <button 
                        className="admin-btn-icon" 
                        onClick={() => setDeleteId(p.id)} 
                        title="Delete" 
                        style={{ color: 'var(--admin-danger)', background: 'rgba(239, 68, 68, 0.05)', border: 'none' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <span className="admin-modal-title">{editPromo ? 'Edit Promo Code' : 'Create Promo Code'}</span>
              <button className="admin-btn-icon" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Promo Code *</label>
                  <input className="admin-form-input" value={form.code}
                    onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="GIVA10" style={{ letterSpacing: '0.1em', fontWeight: 600 }} />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Discount Type</label>
                  <select className="admin-form-select" value={form.discount_type}
                    onChange={e => setForm({ ...form, discount_type: e.target.value })}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Description</label>
                <input className="admin-form-input" value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="10% off on your first order" />
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Discount Value *</label>
                  <input className="admin-form-input" type="number" value={form.value}
                    onChange={e => setForm({ ...form, value: e.target.value })}
                    placeholder={form.discount_type === 'percentage' ? '10' : '500'} />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Min Purchase (₹)</label>
                  <input className="admin-form-input" type="number" value={form.min_purchase}
                    onChange={e => setForm({ ...form, min_purchase: e.target.value })} placeholder="1000" />
                </div>
              </div>
              {form.discount_type === 'percentage' && (
                <div className="admin-form-group">
                  <label className="admin-form-label">Max Discount (₹) — optional cap</label>
                  <input className="admin-form-input" type="number" value={form.max_discount}
                    onChange={e => setForm({ ...form, max_discount: e.target.value })} placeholder="500" />
                </div>
              )}
              <label className="admin-form-checkbox" style={{ marginTop: 8 }}>
                <input type="checkbox" checked={form.active}
                  onChange={e => setForm({ ...form, active: e.target.checked })} />
                <span>Active</span>
              </label>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editPromo ? 'Update Promo' : 'Create Promo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="admin-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="admin-modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <span className="admin-modal-title">Delete Promo Code</span>
              <button className="admin-btn-icon" onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <div className="admin-modal-body">
              <p style={{ color: 'var(--admin-text-muted)', fontSize: 14 }}>
                Are you sure you want to delete this promo code?
              </p>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="admin-btn admin-btn-danger" onClick={handleDelete}>Delete Promo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
