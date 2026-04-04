import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import api from '../utils/api';
import { Search } from 'lucide-react';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || "";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Fetch specifically based on the URL query
    api.get(`/products?q=${query}`)
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [query]);

  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="bg-gray-50 py-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-2 font-bold">Search Results</p>
          <h1 className="text-3xl font-serif flex items-center gap-3">
            <Search size={24} className="text-giva-pink" />
            {query ? `Showing results for "${query}"` : "Explore All Jewellery"}
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-gray-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-32">
            <p className="text-gray-400 font-serif italic text-xl">
              We couldn't find anything matching "{query}".
            </p>
            <button 
              onClick={() => window.history.back()}
              className="mt-6 text-[10px] uppercase tracking-widest font-bold text-giva-pink border-b border-giva-pink pb-1"
            >
              Try a different search
            </button>
          </div>
        )}
      </main>
    </div>
  );
}