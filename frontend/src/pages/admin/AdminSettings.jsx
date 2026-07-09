import { useState, useEffect } from 'react';
import { adminApi } from '../../utils/adminApi';

export default function AdminSettings() {
  const [layout, setLayout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    adminApi.getLayout()
      .then((res) => setLayout(res.data))
      .catch((err) => console.error('Load layout error:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await adminApi.updateLayout(layout);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Failed to save layout');
    } finally {
      setSaving(false);
    }
  };

  const updateHero = (key, val) => {
    setLayout(prev => ({ ...prev, hero: { ...prev.hero, [key]: val } }));
  };

  const setFeatureFlag = (flag, value) => {
    setLayout(prev => ({ ...prev, [flag]: value }));
  };

  const openPreview = () => setPreviewOpen(true);
  const closePreview = () => setPreviewOpen(false);

  const updateCategory = (index, key, val) => {
    setLayout(prev => {
      const cats = [...(prev.categories || [])];
      cats[index] = { ...cats[index], [key]: val };
      return { ...prev, categories: cats };
    });
  };

  const addCategory = () => {
    setLayout(prev => ({
      ...prev,
      categories: [...(prev.categories || []), { name: '', img: '' }],
    }));
  };

  const removeCategory = (index) => {
    setLayout(prev => ({
      ...prev,
      categories: (prev.categories || []).filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return <div className="admin-loading"><div className="admin-spinner" /></div>;
  }

  if (!layout) {
    return <div className="admin-empty"><p>Failed to load layout settings</p></div>;
  }

  return (
    <div style={{ animation: 'adminFadeIn 0.5s ease-out' }}>
      <div className="admin-page-header">
        <div className="admin-page-title">
          <h1>Storefront Configuration</h1>
          <p>Customize your brand identity and homepage appearance.</p>
        </div>
        <div className="admin-page-actions" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {saved && (
            <span style={{
              color: 'var(--admin-success)', fontSize: 14, fontWeight: 700,
              background: 'rgba(16, 185, 129, 0.08)', padding: '6px 12px', borderRadius: '50px',
              animation: 'adminFadeIn 0.3s ease',
            }}>
              ✓ Successfully Saved
            </span>
          )}
          <button className="admin-btn admin-btn-secondary" onClick={openPreview}>
            Preview Changes
          </button>
          <button className="admin-btn admin-btn-gold" onClick={handleSave} disabled={saving}>
            {saving ? 'Publishing...' : 'Publish Changes'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div className="admin-card">
          <div className="admin-card-header">
            <span className="admin-card-title">🧩 Page Visibility</span>
          </div>
          <div className="admin-card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
              <label className="admin-form-checkbox">
                <input
                  type="checkbox"
                  checked={layout.announcementEnabled ?? true}
                  onChange={(e) => setFeatureFlag('announcementEnabled', e.target.checked)}
                />
                Announcement Bar
              </label>
              <label className="admin-form-checkbox">
                <input
                  type="checkbox"
                  checked={layout.hero?.enabled ?? true}
                  onChange={(e) => updateHero('enabled', e.target.checked)}
                />
                Hero Banner
              </label>
              <label className="admin-form-checkbox">
                <input
                  type="checkbox"
                  checked={layout.collectionsEnabled ?? true}
                  onChange={(e) => setFeatureFlag('collectionsEnabled', e.target.checked)}
                />
                Featured Collections
              </label>
            </div>
          </div>
        </div>
        {/* Announcement Bar */}
        <div className="admin-card">
          <div className="admin-card-header">
            <span className="admin-card-title">📢 Brand Announcement Bar</span>
            <label className="admin-form-checkbox" style={{ justifySelf: 'end' }}>
              <input
                type="checkbox"
                checked={layout.announcementEnabled ?? true}
                onChange={(e) => setFeatureFlag('announcementEnabled', e.target.checked)}
              />
              Enabled
            </label>
          </div>
          <div className="admin-card-body">
            <div className="admin-form-group">
              <label className="admin-form-label">Global Notification Text</label>
              <input
                className="admin-form-input"
                value={layout.announcement || ''}
                onChange={e => setLayout({ ...layout, announcement: e.target.value })}
                placeholder="✨ Special Offer: Flat 10% Off on your first order ✨"
              />
            </div>
            <div style={{ marginTop: 16 }}>
              <label className="admin-form-label" style={{ fontSize: 11, marginBottom: 8, display: 'block' }}>Live Preview</label>
              <div style={{
                padding: '12px 24px', borderRadius: 8,
                background: '#212121', color: 'white', textAlign: 'center',
                fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                {layout.announcement || 'No announcement content'}
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="admin-card">
          <div className="admin-card-header">
            <span className="admin-card-title">🖼️ Premium Hero Banner</span>
          </div>
          <div className="admin-card-body">
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Main Headline</label>
                <input className="admin-form-input" value={layout.hero?.title || ''} onChange={e => updateHero('title', e.target.value)} placeholder="Designed for The Spotlight" />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Supportive Subtitle</label>
                <input className="admin-form-input" value={layout.hero?.subtitle || ''} onChange={e => updateHero('subtitle', e.target.value)} placeholder="The Anushka Sharma Silver Collection" />
              </div>
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Background Image (URL)</label>
                <input className="admin-form-input" value={layout.hero?.image || ''} onChange={e => updateHero('image', e.target.value)} placeholder="https://..." />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Primary Action Text</label>
                <input className="admin-form-input" value={layout.hero?.cta || ''} onChange={e => updateHero('cta', e.target.value)} placeholder="Explore Collection" />
              </div>
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Action URL</label>
                <input className="admin-form-input" value={layout.hero?.ctaUrl || ''} onChange={e => updateHero('ctaUrl', e.target.value)} placeholder="/collection" />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Text Alignment</label>
                <select className="admin-form-select" value={layout.hero?.align || 'left'} onChange={e => updateHero('align', e.target.value)}>
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>
            
            {layout.hero?.image && (
              <div style={{ marginTop: 24 }}>
                <label className="admin-form-label" style={{ fontSize: 11, marginBottom: 8, display: 'block' }}>Desktop Preview</label>
                <div style={{
                  borderRadius: 16, overflow: 'hidden',
                  position: 'relative', height: 200,
                  backgroundImage: `url(${layout.hero.image})`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  boxShadow: 'inset 0 0 100px rgba(0,0,0,0.3)',
                  border: '1px solid var(--admin-border)'
                }}>
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(90deg, rgba(0,0,0,0.7) 0%, transparent 60%)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    padding: '0 40px', gap: 8,
                  }}>
                    <span style={{ fontSize: 24, fontWeight: 700, color: 'white', fontFamily: '"Playfair Display", serif' }}>
                      {layout.hero.title}
                    </span>
                    <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)' }}>
                      {layout.hero.subtitle}
                    </span>
                    <span style={{
                      marginTop: 12, display: 'inline-block', width: 'fit-content',
                      padding: '8px 24px', borderRadius: 4, fontSize: 12, fontWeight: 700,
                      background: 'var(--admin-gold)', color: '#fff',
                      textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>
                      {layout.hero.cta}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="admin-card">
          <div className="admin-card-header">
            <span className="admin-card-title">📂 Featured Collections</span>
            <button className="admin-btn admin-btn-sm admin-btn-secondary" onClick={addCategory}>+ New Collection</button>
          </div>
          <div className="admin-card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 16 }}>
              {(layout.categories || []).map((cat, i) => (
                <div key={i} className="admin-card" style={{ 
                  background: 'var(--admin-bg)', 
                  padding: 16, 
                  display: 'flex', 
                   gap: 16,
                  alignItems: 'center',
                  border: '1px solid var(--admin-border-light)'
                }}>
                  <div style={{ 
                    width: 60, height: 60, borderRadius: 12, 
                    overflow: 'hidden', flexShrink: 0,
                    background: '#fff', border: '1px solid var(--admin-border)'
                  }}>
                    {cat.img ? (
                      <img src={cat.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-text-dim)' }}>📸</div>
                    )}
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input
                      className="admin-form-input"
                      value={cat.name}
                      onChange={e => updateCategory(i, 'name', e.target.value)}
                      placeholder="Collection Name"
                      style={{ padding: '8px 12px' }}
                    />
                    <input
                      className="admin-form-input"
                      value={cat.img}
                      onChange={e => updateCategory(i, 'img', e.target.value)}
                      placeholder="Image Asset URL"
                      style={{ padding: '8px 12px', fontSize: 12 }}
                    />
                  </div>
                  <button
                    className="admin-btn-icon"
                    onClick={() => removeCategory(i)}
                    style={{ color: 'var(--admin-danger)', background: 'transparent', border: 'none' }}
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {previewOpen && (
        <div className="admin-modal-overlay" onClick={closePreview}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <span className="admin-modal-title">Live Page Preview</span>
              <button className="admin-btn-icon" onClick={closePreview}>✕</button>
            </div>
            <div className="admin-modal-body" style={{ gap: 24 }}>
              {layout.announcementEnabled !== false && (
                <div style={{ padding: '14px 18px', borderRadius: 14, background: '#111827', color: '#fff', textAlign: 'center', fontSize: 13, fontWeight: 700 }}>
                  {layout.announcement || 'Announcement will appear here'}
                </div>
              )}

              {layout.hero?.enabled !== false && (
                <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.12)' }}>
                  <div style={{ position: 'relative', minHeight: 260, backgroundImage: layout.hero?.image ? `url(${layout.hero.image})` : 'linear-gradient(135deg, #f3f4f6, #e5e7eb)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,23,42,0.64), rgba(15,23,42,0.12))' }} />
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', padding: '32px', textAlign: layout.hero?.align || 'left' }}>
                      <h2 style={{ margin: 0, color: '#fff', fontSize: 28, fontWeight: 800, fontFamily: '"Playfair Display", serif' }}>{layout.hero?.title || 'Your hero headline goes here'}</h2>
                      <p style={{ margin: '14px 0 0', maxWidth: 560, color: 'rgba(255,255,255,0.88)', fontSize: 15 }}>{layout.hero?.subtitle || 'A short supportive line to explain the value proposition.'}</p>
                      <a href={layout.hero?.ctaUrl || '#'} style={{ display: 'inline-flex', marginTop: 20, padding: '12px 24px', borderRadius: 9999, background: '#c5a059', color: '#fff', fontWeight: 700, textDecoration: 'none', width: 'fit-content' }}>
                        {layout.hero?.cta || 'Explore Collection'}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {layout.collectionsEnabled !== false && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Featured Collections</h3>
                    <span style={{ fontSize: 13, color: 'var(--admin-text-muted)' }}>{(layout.categories || []).length} entries</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                    {(layout.categories || []).slice(0, 6).map((cat, i) => (
                      <div key={i} style={{ borderRadius: 18, overflow: 'hidden', border: '1px solid var(--admin-border-light)', minHeight: 160, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#fff' }}>
                        <div style={{ height: 110, background: cat.img ? `url(${cat.img}) center/cover` : '#f3f4f6' }} />
                        <div style={{ padding: '14px 16px' }}>
                          <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{cat.name || 'Unnamed Collection'}</h4>
                        </div>
                      </div>
                    ))}
                    {(layout.categories || []).length === 0 && (
                      <div style={{ gridColumn: '1 / -1', padding: 24, borderRadius: 18, border: '1px dashed var(--admin-border)', color: 'var(--admin-text-muted)', textAlign: 'center' }}>
                        Add a featured collection to preview it here.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={closePreview}>Close Preview</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
