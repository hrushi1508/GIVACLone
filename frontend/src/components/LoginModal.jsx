import { useState } from 'react';
import { X, Mail, Lock, User, Loader2 } from 'lucide-react';
import { authApi } from '../utils/api';
import { useAuth } from '../store/useAuth';
import NotificationPopup from './NotificationPopup';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginModal({ isOpen, onClose }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  const login = useAuth((state) => state.login);

  if (!isOpen) return null;

  const validate = () => {
    const { email, password, name } = formData;
    if (!email || !EMAIL_RE.test(email)) return 'Please enter a valid email address.';
    if (!password || password.length < 8) return 'Password must be at least 8 characters.';
    if (isRegister && !name.trim()) return 'Please enter your full name.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      if (isRegister) {
        await authApi.register(formData);
        setIsRegister(false);
        setFormData({ email: '', password: '', name: '' });
        setPopup({
          isOpen: true,
          title: 'Account Created!',
          message: 'Welcome to the GIVA family. Please login with your new credentials.',
          type: 'success'
        });
      } else {
        const res = await authApi.login({
          email: formData.email,
          password: formData.password
        });
        if (res.data.token && res.data.user) {
          login(res.data.user, res.data.token);
          onClose();
        } else {
          setError('Invalid server response');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsRegister(!isRegister);
    setError('');
    setFormData({ email: '', password: '', name: '' });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isRegister ? 'Register' : 'Login'}
    >
      <div className="bg-white w-full max-w-md rounded-2xl p-8 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 hover:rotate-90 transition-transform text-gray-400 hover:text-black"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <h2 className="text-3xl font-serif text-center mb-2">
          {isRegister ? 'Join GIVA' : 'Welcome Back'}
        </h2>
        <p className="text-gray-500 text-center text-sm mb-8">
          {isRegister ? 'Start your sparkling journey today.' : 'Please enter your details to login.'}
        </p>

        {error && (
          <div role="alert" className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {isRegister && (
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={18} aria-hidden="true" />
              <input
                type="text"
                placeholder="Full Name"
                className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-xl focus:ring-1 focus:ring-giva-pink outline-none transition"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                autoComplete="name"
                required
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={18} aria-hidden="true" />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-xl focus:ring-1 focus:ring-giva-pink outline-none transition"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              autoComplete="email"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={18} aria-hidden="true" />
            <input
              type="password"
              placeholder={isRegister ? 'Password (min. 8 characters)' : 'Password'}
              className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-xl focus:ring-1 focus:ring-giva-pink outline-none transition"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-giva-dark text-white py-4 rounded-xl uppercase tracking-widest text-xs font-bold hover:bg-black transition-colors shadow-lg active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-500">
          {isRegister ? 'Already have an account?' : 'New to GIVA?'}{' '}
          <button
            type="button"
            onClick={switchMode}
            className="text-giva-pink font-bold hover:underline"
          >
            {isRegister ? 'Login here' : 'Register now'}
          </button>
        </p>
      </div>

      <NotificationPopup
        {...popup}
        onClose={() => setPopup({ ...popup, isOpen: false })}
      />
    </div>
  );
}
