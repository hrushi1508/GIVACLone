import { useState, useEffect, useMemo } from 'react';
import { adminApi } from '../../utils/adminApi';
import ImageUploader from '../../components/ImageUploader';

const CATEGORIES = [
  'Rings', 'Earrings', 'Necklaces', 'Bracelets', 'Anklets', 'Pendants',
  'Nose Pins', 'Toe Rings', 'Bangles', 'Silver Chains', 'Watches',
  'Mangalsutras', 'Sets', 'Personalised', 'Coins', "Men's Jewelry", "Kids Jewelry",
];

const EMPTY_PRODUCT = {
  name: '', price: '', category: 'Rings', description: '',
  stock: '', rating: '', image: '', isTrending: false, isNew: true, relations: [],
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_PRODUCT });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const loadProducts = () => {
    setLoading(true);
    adminApi.getProducts()
      .then((res) => setProducts(res.data))
      .catch((err) => console.error('Load products error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadProducts(); }, []);

  const filtered = useMemo(() => {
    let list = products;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q));
    }
    if (catFilter) {
      list = list.filter(p => p.category === catFilter);
    }

    const sorted = [...list].sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'price') {
        return (Number(a.price) - Number(b.price)) * order;
      }
      if (sortBy === 'stock') {
        return (Number(a.stock) - Number(b.stock)) * order;
      }
      if (sortBy === 'rating') {
        return (Number(a.rating) - Number(b.rating)) * order;
      }
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase()) * order;
    });

    return sorted;
  }, [products, search, catFilter, sortBy, sortOrder]);

  const openCreate = () => {
    setEditProduct(null);
    setForm({ ...EMPTY_PRODUCT });
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setForm({
      name: product.name, price: product.price, category: product.category || 'Rings',
      description: product.description || '', stock: product.stock || 0,
      rating: product.rating || 0, image: product.image || '',
      isTrending: product.isTrending || false, isNew: product.isNew || false,
      relations: product.relations || [],
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock) || 0,
        rating: Number(form.rating) || 0,
      };
      if (editProduct) {
        await adminApi.updateProduct(editProduct.id, payload);
      } else {
        await adminApi.createProduct(payload);
      }
      setModalOpen(false);
      loadProducts();
    } catch (err) {
      console.error('Save error:', err);
      alert(err.response?.data?.error || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminApi.deleteProduct(deleteId);
      setDeleteId(null);
      loadProducts();
      setSelectedIds(prev => prev.filter(id => id !== deleteId));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete product');
    }
  };

  const toggleSelect = (productId) => {
    setSelectedIds((prev) => prev.includes(productId)
      ? prev.filter((id) => id !== productId)
      : [...prev, productId]);
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      if (prev.length === filtered.length) return [];
      return filtered.map((product) => product.id);
    });
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    const confirmed = window.confirm(`Delete ${selectedIds.length} selected product${selectedIds.length > 1 ? 's' : ''}?`);
    if (!confirmed) return;

    setBulkDeleting(true);
    try {
      await Promise.all(selectedIds.map((id) => adminApi.deleteProduct(id)));
      loadProducts();
      setSelectedIds([]);
    } catch (err) {
      console.error('Bulk delete error:', err);
      alert('Some products could not be deleted. Please try again.');
    } finally {
      setBulkDeleting(false);
    }
  };

  if (loading) {
    return <div className="admin-loading"><div className="admin-spinner" /></div>;
  }

  return (
    <div style={{ animation: 'adminFadeIn 0.5s ease-out' }}>
      <div className="admin-page-header">
        <div className="admin-page-title">
          <h1>Product Management</h1>
          <p>Organize and manage your premium jewelry collection.</p>
        </div>
        <div className="admin-page-actions">
          <button className="admin-btn admin-btn-gold" onClick={openCreate}>
            <span style={{ fontSize: '1.2rem' }}>+</span> Add New Product
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        <div className="admin-table-header">
          <span className="admin-table-title">Inventory ({filtered.length} Items)</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div className="admin-search-bar">
              <span>🔍</span>
              <input 
                placeholder="Search by name or category..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>
            <select 
              className="admin-filter-select" 
              value={catFilter} 
              onChange={(e) => setCatFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              className="admin-filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="stock">Sort by Stock</option>
              <option value="rating">Sort by Rating</option>
            </select>
            <button
              className="admin-btn admin-btn-secondary"
              onClick={() => setSortOrder((prev) => prev === 'asc' ? 'desc' : 'asc')}
              style={{ whiteSpace: 'nowrap' }}
            >
              {sortOrder === 'asc' ? 'Asc' : 'Desc'}
            </button>
            <button
              className="admin-btn admin-btn-danger"
              onClick={handleBulkDelete}
              disabled={!selectedIds.length || bulkDeleting}
            >
              {bulkDeleting ? 'Deleting...' : `Delete Selected (${selectedIds.length})`}
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 42 }}>
                  <label className="admin-form-checkbox" style={{ margin: 0 }}>
                    <input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={toggleSelectAll} />
                  </label>
                </th>
                <th>Product Details</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <label className="admin-form-checkbox" style={{ margin: 0 }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(p.id)}
                        onChange={() => toggleSelect(p.id)}
                      />
                    </label>
                  </td>
                  <td>
                    <div className="product-cell">
                      <img 
                        src={p.image || 'https://via.placeholder.com/40'} 
                        alt="" 
                        className="product-thumb" 
                        style={{ width: 44, height: 44, borderRadius: 10 }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</span>
                        <span style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>ID: {p.id}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="admin-badge customer-role">{p.category}</span>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--admin-text)' }}>
                    ₹{p.price?.toLocaleString('en-IN')}
                  </td>
                  <td>
                    <span style={{
                      color: p.stock < 5 ? 'var(--admin-danger)' : 'var(--admin-text)',
                      fontWeight: p.stock < 5 ? 700 : 500,
                      background: p.stock < 5 ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
                      padding: p.stock < 5 ? '4px 8px' : '0',
                      borderRadius: 4
                    }}>
                      {p.stock}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ color: '#fbbf24' }}>★</span>
                      <span style={{ fontWeight: 600 }}>{p.rating}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {p.isTrending && <span className="admin-badge active" style={{ fontSize: 11 }}>Trending</span>}
                      {p.isNew && <span className="admin-badge placed" style={{ fontSize: 11 }}>New</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="admin-btn-icon" onClick={() => openEdit(p)} title="Edit">✏️</button>
                      <button 
                        className="admin-btn-icon" 
                        onClick={() => setDeleteId(p.id)} 
                        title="Delete" 
                        style={{ color: 'var(--admin-danger)', background: 'rgba(239, 68, 68, 0.05)' }}
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
              <span className="admin-modal-title">{editProduct ? 'Edit Product' : 'Add New Product'}</span>
              <button className="admin-btn-icon" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-group">
                <label className="admin-form-label">Product Name *</label>
                <input className="admin-form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Silver Rose Ring" />
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Price (₹) *</label>
                  <input className="admin-form-input" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="2499" />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Category</label>
                  <select className="admin-form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Description</label>
                <textarea className="admin-form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Product description..." />
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Stock</label>
                  <input className="admin-form-input" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Rating</label>
                  <input className="admin-form-input" type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })} />
                </div>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Product Image</label>
                {form.image && (
                  <img
                    src={form.image}
                    alt="Product preview"
                    style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }}
                  />
                )}
                <input
                  className="admin-form-input"
                  value={form.image}
                  onChange={e => setForm({ ...form, image: e.target.value })}
                  placeholder="Paste image URL or upload below"
                  style={{ marginBottom: 8 }}
                />
                <ImageUploader
                  onImageUpload={({ url }) => setForm(prev => ({ ...prev, image: url }))}
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Relations (comma separated)</label>
                <input className="admin-form-input" value={form.relations?.join(', ')} onChange={e => setForm({ ...form, relations: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="Her, Mom, Sister" />
              </div>
              <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
                <label className="admin-form-checkbox">
                  <input type="checkbox" checked={form.isTrending} onChange={e => setForm({ ...form, isTrending: e.target.checked })} />
                  <span>Trending</span>
                </label>
                <label className="admin-form-checkbox">
                  <input type="checkbox" checked={form.isNew} onChange={e => setForm({ ...form, isNew: e.target.checked })} />
                  <span>New Arrival</span>
                </label>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editProduct ? 'Update Product' : 'Create Product'}
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
              <span className="admin-modal-title">Delete Product</span>
              <button className="admin-btn-icon" onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <div className="admin-modal-body">
              <p style={{ color: 'var(--admin-text-muted)', fontSize: 14 }}>
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="admin-btn admin-btn-danger" onClick={handleDelete}>Delete Product</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
