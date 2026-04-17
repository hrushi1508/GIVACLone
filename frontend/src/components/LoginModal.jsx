import { useState } from 'react';
import { X, Mail, Lock, User } from 'lucide-react';
import { authApi } from '../utils/api';
import { useAuth } from '../store/useAuth';
import NotificationPopup from './NotificationPopup';

export default function LoginModal({ isOpen, onClose }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [popup, setPopup] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  
  // Get the login function from useAuth
  const login = useAuth((state) => state.login);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        await authApi.register(formData);
        setIsRegister(false);
        setFormData({ email: '', password: '', name: '' }); // Clear form
        setPopup({
          isOpen: true,
          title: 'Account Created! 🎉',
          message: 'Welcome to the GIVA family. Please login with your new credentials to start shopping.',
          type: 'success'
        });
      } else {
        const res = await authApi.login({ 
          email: formData.email, 
          password: formData.password 
        });

        /**
         * CRITICAL CHANGE FOR USER ISOLATION:
         * We now pass both the user object AND the JWT token.
         * This token allows the API interceptor to identify User A vs User B.
         */
        if (res.data.token && res.data.user) {
          login(res.data.user, res.data.token);
          onClose();
        } else {
          setError('Invalid server response');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-8 relative shadow-2xl">
        <button 
          onClick={onClose} 
          className="absolute right-4 top-4 hover:rotate-90 transition-transform text-gray-400 hover:text-black"
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
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Full Name"
                className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-xl focus:ring-1 focus:ring-giva-pink outline-none transition"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-xl focus:ring-1 focus:ring-giva-pink outline-none transition"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-xl focus:ring-1 focus:ring-giva-pink outline-none transition"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <button className="w-full bg-giva-dark text-white py-4 rounded-xl uppercase tracking-widest text-xs font-bold hover:bg-black transition-colors shadow-lg active:scale-95">
            {isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-500">
          {isRegister ? 'Already have an account?' : 'New to GIVA?'} {' '}
          <button 
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }} 
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