import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, Clock } from 'lucide-react';
import api from '../utils/api';

export default function SearchBar({ className = "" }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(recent);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions as user types
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    api.get('/products', { params: { q: query } })
      .then(res => {
        const uniqueNames = [...new Set(res.data.map(p => p.name))].slice(0, 5);
        setSuggestions(uniqueNames);
        setLoading(false);
      })
      .catch(() => {
        setSuggestions([]);
        setLoading(false);
      });
  }, [query]);

  const handleSearch = (searchQuery) => {
    if (!searchQuery.trim()) return;

    // Save to recent searches
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const updated = [searchQuery, ...recent.filter(q => q !== searchQuery)].slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    setRecentSearches(updated);

    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    setQuery('');
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  };

  const trendingSearches = ['Rings', 'Earrings', 'Necklaces', 'Bracelets'];

  return (
    <div ref={searchRef} className={`relative w-full ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search for jewelry..."
          className="w-full px-4 py-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:border-giva-pink transition bg-white"
        />
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setSuggestions([]);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          >
            {/* Suggestions */}
            {(query.trim().length > 0 && suggestions.length > 0) && (
              <div className="border-b border-gray-100">
                <p className="px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-gray-500">
                  Suggestions
                </p>
                {suggestions.map((suggestion) => (
                  <motion.button
                    key={suggestion}
                    onClick={() => handleSearch(suggestion)}
                    whileHover={{ x: 4 }}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700 transition"
                  >
                    <Search size={14} className="text-gray-400" />
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Recent Searches */}
            {query.trim().length === 0 && recentSearches.length > 0 && (
              <div className="border-b border-gray-100">
                <p className="px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-gray-500">
                  Recent
                </p>
                {recentSearches.map((search) => (
                  <motion.button
                    key={search}
                    onClick={() => handleSearch(search)}
                    whileHover={{ x: 4 }}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700 transition"
                  >
                    <Clock size={14} className="text-gray-400" />
                    {search}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Trending Searches */}
            {query.trim().length === 0 && recentSearches.length === 0 && (
              <div>
                <p className="px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-gray-500">
                  Trending Now
                </p>
                {trendingSearches.map((trend) => (
                  <motion.button
                    key={trend}
                    onClick={() => handleSearch(trend)}
                    whileHover={{ x: 4 }}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700 transition"
                  >
                    <TrendingUp size={14} className="text-giva-pink" />
                    {trend}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Loading State */}
            {loading && query.trim().length > 0 && (
              <div className="px-4 py-3 text-center text-sm text-gray-500">
                Searching...
              </div>
            )}

            {/* No Results */}
            {query.trim().length > 0 && suggestions.length === 0 && !loading && (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-gray-500 mb-3">No products found</p>
                <button
                  onClick={() => handleSearch(query)}
                  className="text-[10px] uppercase tracking-widest font-bold text-giva-pink hover:text-giva-dark transition"
                >
                  Search Anyway →
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
