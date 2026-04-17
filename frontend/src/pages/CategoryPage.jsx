import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Star, ShoppingBag } from 'lucide-react';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import { useAuth } from '../store/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { getCategoryNameFromSlug } from '../utils/category';

export default function CategoryPage({ onAuthRequired }) {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // Sub-category navigation data
  const subCategoryData = {
    forMen: [
      { name: "Rings", slug: "rings" },
      { name: "Bracelets", slug: "bracelets" },
      { name: "Silver Chains", slug: "silver-chains" },
      { name: "Watches", slug: "watches" },
      { name: "Men's Jewelry", slug: "mens-jewelry" }
    ],
    forWomen: [
      { name: "Necklaces", slug: "necklaces" },
      { name: "Earrings", slug: "earrings" },
      { name: "Rings", slug: "rings" },
      { name: "Bangles", slug: "bangles" },
      { name: "Mangalsutras", slug: "mangalsutras" },
      { name: "Nose Pins", slug: "nose-pins" },
      { name: "Anklets", slug: "anklets" },
      { name: "Sets", slug: "sets" }
    ],
    forKids: [
      { name: "Kids Jewelry", slug: "kids-jewelry" },
      { name: "Rings", slug: "rings" },
      { name: "Bracelets", slug: "bracelets" },
      { name: "Pendants", slug: "pendants" }
    ],
    others: [
      { name: "Personalised", slug: "personalised" },
      { name: "Perfumes", slug: "perfumes" },
      { name: "Coins", slug: "coins" },
      { name: "Gift Cards", slug: "gift-cards" },
      { name: "Gold Jewelry", slug: "gold-jewelry" },
      { name: "Occasions", slug: "occasions" }
    ]
  };

  const isMainCategory = subCategoryData[slug];
  const subCategories = subCategoryData[slug] || [];
  const selectedSubCategory = searchParams.get('subcategory') || '';

  const handleSubCategoryClick = (subSlug) => {
    const newParams = new URLSearchParams(searchParams);
    if (subSlug) {
      newParams.set('subcategory', subSlug);
    } else {
      newParams.delete('subcategory');
    }
    setSearchParams(newParams);
  };

  const categoryName = getCategoryNameFromSlug(slug);
  const priceRange = searchParams.get('price_range') || '';

  useEffect(() => {
    setLoading(true);
    const params = {};
    
    // 1. Determining main relationship group
    const relationMap = {
      'forMen': 'Him',
      'forWomen': 'Her',
      'forKids': 'Kids'
    };

    if (selectedSubCategory) {
      // If a sub-category is selected (like Rings in Men's)
      params.category = getCategoryNameFromSlug(selectedSubCategory);
      if (relationMap[slug]) {
        params.relation = relationMap[slug];
      }
    } else if (isMainCategory && relationMap[slug]) {
      // Main category (Men/Women/Kids) without sub-category
      // Use the new BACKEND RELATION filter
      params.relation = relationMap[slug];
    } else {
      // Standard category (e.g., /category/rings)
      params.category = categoryName;
    }
    
    if (priceRange) params.price_range = priceRange;

    api.get('/products', { params })
      .then((res) => {
        setProducts(res.data);
        setIsEmpty(res.data.length === 0);
        setLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setIsEmpty(true);
        setLoading(false);
      });
  }, [categoryName, priceRange, selectedSubCategory, isMainCategory, subCategories]);

  return (
    <div className="min-h-screen bg-white text-giva-dark pb-20">
      <header className="relative bg-[#fffafd] overflow-hidden">
        {/* Fancy Background Elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-giva-pink/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-giva-sand/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[10px] uppercase font-black text-giva-pink tracking-[0.4em] mb-4">
              Collection / {categoryName}
            </p>
            
            <div className="flex flex-col lg:flex-row justify-between items-end gap-8">
              <div className="max-w-3xl">
                <h1 className="text-5xl lg:text-7xl font-serif font-black text-giva-dark leading-tight mb-6">
                  {categoryName}
                </h1>
                <p className="text-lg text-gray-500 font-light leading-relaxed">
                  Discover our exclusive curation of {categoryName.toLowerCase()} pieces. from timeless classics to modern must-haves, 
                  each design is crafted to bring out your inner brilliance.
                </p>
              </div>

              {priceRange && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-giva-dark text-white px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 shadow-xl"
                >
                  <Search size={14} />
                  Range: ₹{priceRange}
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </header>


      {/* Sub-category Navigation Bar */}
      {isMainCategory && (
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-20 z-40 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center space-x-10 py-5 overflow-x-auto no-scrollbar">
              <button
                onClick={() => handleSubCategoryClick('')}
                className={`whitespace-nowrap text-[10px] uppercase tracking-[0.2em] font-bold transition-all ${
                  !selectedSubCategory 
                    ? 'text-giva-pink' 
                    : 'text-gray-400 hover:text-giva-dark'
                }`}
              >
                Show All
              </button>
              {subCategories.map((subCategory) => (
                <button
                  key={subCategory.slug}
                  onClick={() => handleSubCategoryClick(subCategory.slug)}
                  className={`whitespace-nowrap text-[10px] uppercase tracking-[0.2em] font-bold transition-all relative ${
                    selectedSubCategory === subCategory.slug 
                      ? 'text-giva-pink' 
                      : 'text-gray-400 hover:text-giva-dark'
                  }`}
                >
                  {subCategory.name}
                  {selectedSubCategory === subCategory.slug && (
                    <motion.div layoutId="underline" className="absolute -bottom-2 left-0 right-0 h-0.5 bg-giva-pink" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </nav>
      )}

      <main className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="aspect-[4/5] rounded-2xl bg-gray-50 animate-pulse" />
            ))}
          </div>
        ) : isEmpty ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-[3rem] bg-gradient-to-br from-giva-sand/10 to-giva-pink/5 p-20 text-center border border-dashed border-giva-pink/20"
          >
            <ShoppingBag className="mx-auto text-giva-pink/20 mb-6" size={64} />
            <h3 className="text-2xl font-serif text-giva-dark mb-4">No treasures found... yet</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-10">We couldn't find any products in this specific filter. Try broadening your search or exploring our other collections.</p>
            <button 
              onClick={() => { handleSubCategoryClick(''); setSearchParams({}); }}
              className="bg-giva-dark text-white px-10 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest hover:shadow-xl transition"
            >
              Clear All Filters
            </button>
          </motion.div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16"
          >
            <AnimatePresence mode='popLayout'>
              {products.map((product, idx) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <ProductCard 
                    product={product} 
                    onOpenModal={() => handleOpenModal(product)}
                    onAuthRequired={onAuthRequired}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      <ProductModal 
        isOpen={isModalOpen}
        product={selectedProduct}
        onClose={handleCloseModal}
        isAuthenticated={isAuthenticated}
        onAuthRequired={onAuthRequired}
      />
    </div>
  );
}
