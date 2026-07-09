import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/useAuth';
import { authApi } from '../../utils/api';
import './admin.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuth((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.login({ email, password });
      const { user, token } = res.data;

      if (!user.is_admin) {
        setError('Access denied. Admin privileges required.');
        setLoading(false);
        return;
      }

      login(user, token);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-brand">
          <div className="login-icon">G</div>
          <h1>GIVA <span style={{ color: 'var(--admin-gold)' }}>Admin</span></h1>
          <p>Sign in to access your premium dashboard</p>
        </div>

        {error && <div className="admin-login-error">{error}</div>}

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label className="admin-form-label">Email Address</label>
            <input
              id="admin-email"
              type="email"
              className="admin-form-input"
              placeholder="admin@giva.co"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              className="admin-form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            id="admin-login-btn"
            type="submit"
            className="admin-login-btn"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Secure Sign In'}
          </button>
        </form>

        <div className="admin-login-footer">
          <a href="/">← Return to GIVA Store</a>
        </div>
      </div>
    </div>
  );
}
