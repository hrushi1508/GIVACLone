import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import api from '../utils/api';
import { Search, X } from 'lucide-react';
import { useAuth } from '../store/useAuth';

export default function SearchPage({ onAuthRequired }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || "";
  const category = searchParams.get('category') || "";
  const priceRange = searchParams.get('price_range') || "";
  const searchBy = searchParams.get('search_by') || 'all';
  const sortBy = searchParams.get('sort_by') || 'name';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { isAuthenticated } = useAuth();

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (category) params.append('category', category);
    if (priceRange) params.append('price_range', priceRange);
    if (searchBy !== 'all') params.append('search_by', searchBy);
    if (sortBy !== 'name') params.append('sort_by', sortBy);

    api.get(`/products?${params.toString()}`)
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [query, category, priceRange, searchBy, sortBy]);

  const updateSearchParams = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  const categories = ['Rings', 'Earrings', 'Necklaces', 'Bracelets', 'Anklets', 'Nose Pins'];

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <header className="bg-gradient-to-b from-giva-sand/20 to-white py-12 border-b border-giva-sand/50">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-giva-pink font-bold mb-3">Search Results</p>
          <h1 className="text-4xl font-serif font-bold text-giva-dark mb-2 flex items-center gap-3">
            <Search size={28} className="text-giva-pink" />
            {query ? `Results for "${query}"` : category ? category : "Explore Jewellery"}
          </h1>
          {priceRange && (
            <p className="text-sm text-giva-dark/60 mt-2">Price Range: ₹{priceRange}</p>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className={`${showMobileFilters ? 'block' : 'hidden'
            } lg:block lg:col-span-1 relative`}>
            {/* Mobile close button */}
            <button
              onClick={() => setShowMobileFilters(false)}
              className="lg:hidden absolute -top-10 right-0 p-2 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            {/* Filters Container */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white lg:bg-gray-50 p-6 lg:p-0 rounded-2xl lg:rounded-none border lg:border-0 border-gray-100"
            >
              <div className="flex justify-between items-center mb-6 lg:mb-8">
                <h3 className="text-lg font-semibold text-giva-dark">Filters</h3>
                {(category || searchBy !== 'all' || sortBy !== 'name') && (
                  <button
                    onClick={clearAllFilters}
                    className="text-[10px] uppercase tracking-widest font-bold text-giva-pink hover:text-giva-dark transition"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="space-y-8">
                {/* Category Filter */}
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-3">Category</label>
                  <div className="space-y-2">
                    <button
                      onClick={() => updateSearchParams('category', '')}
                      className={`block w-full text-left px-3 py-2 rounded-lg transition text-sm ${!category
                        ? 'bg-giva-pink/10 text-giva-pink font-semibold'
                        : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      All Categories
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => updateSearchParams('category', cat)}
                        className={`block w-full text-left px-3 py-2 rounded-lg transition text-sm ${category === cat
                          ? 'bg-giva-pink/10 text-giva-pink font-semibold'
                          : 'text-gray-600 hover:bg-gray-100'
                          }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search By Filter */}
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-3">Search By</label>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All Fields' },
                      { value: 'name', label: 'Name' },
                      { value: 'description', label: 'Description' },
                      { value: 'category', label: 'Category' }
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => updateSearchParams('search_by', option.value)}
                        className={`block w-full text-left px-3 py-2 rounded-lg transition text-sm ${searchBy === option.value
                          ? 'bg-giva-pink/10 text-giva-pink font-semibold'
                          : 'text-gray-600 hover:bg-gray-100'
                          }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort By Filter */}
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-3">Sort By</label>
                  <div className="space-y-2">
                    {[
                      { value: 'name', label: 'Name (A-Z)' },
                      { value: 'price_asc', label: 'Price (Low to High)' },
                      { value: 'price_desc', label: 'Price (High to Low)' },
                      { value: 'rating', label: 'Rating' }
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => updateSearchParams('sort_by', option.value)}
                        className={`block w-full text-left px-3 py-2 rounded-lg transition text-sm ${sortBy === option.value
                          ? 'bg-giva-pink/10 text-giva-pink font-semibold'
                          : 'text-gray-600 hover:bg-gray-100'
                          }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden mb-6 w-full py-2 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Show Filters
            </button>

            {/* Results Count */}
            <div className="mb-6 pb-6 border-b border-gray-100">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-giva-dark">{products.length}</span> products
              </p>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[4/5] bg-gray-100 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
                {products.map(p => <ProductCard
                  key={p.id}
                  product={p}
                  onOpenModal={() => handleOpenModal(p)}
                  onAuthRequired={onAuthRequired}
                />)}
              </div>
            ) : (
              <div className="text-center py-20">
                <Search className="mx-auto text-gray-200 mb-4" size={48} />
                <p className="text-gray-400 font-serif italic text-lg mb-4">
                  No results found {query ? `for "${query}"` : ''}
                </p>
                <button
                  onClick={clearAllFilters}
                  className="inline-block mt-2 text-[10px] uppercase tracking-widest font-bold text-giva-pink border-b border-giva-pink pb-1 hover:text-giva-dark transition"
                >
                  Clear Filters & Try Again
                </button>
              </div>
            )}
          </main>
        </div>

        <ProductModal
          isOpen={isModalOpen}
          product={selectedProduct}
          onClose={handleCloseModal}
          isAuthenticated={isAuthenticated}
          onAuthRequired={onAuthRequired}
        />
      </div>
    </div>
  );
}