import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function CollectionComponent() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/collections')
      .then(res => {
        setCategories(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center gap-8 py-16 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="w-24 h-24 rounded-full bg-gray-50 animate-pulse flex-shrink-0" />
        ))}
      </div>
    );
  }

  return (
    <section className="py-14 bg-white border-b border-gray-50">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-3xl font-serif text-giva-dark italic tracking-tight">Shop by Category</h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Swipe to explore</p>
        </div>
        
        <div className="flex overflow-x-auto pb-6 gap-8 no-scrollbar snap-x snap-mandatory scroll-smooth">
          {categories.map((category) => (
            <motion.div
              key={category.id}
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate(`/search?q=${category.name}`)}
              className="flex-shrink-0 w-28 sm:w-32 flex flex-col items-center cursor-pointer snap-start group"
            >
              {/* Circular Frame - Forced to be a perfect circle with hidden overflow */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-transparent group-hover:border-giva-pink transition-all duration-500 shadow-sm">
                <img 
                  src={category.image} 
                  alt={category.name} 
                  // CRITICAL: w-full h-full + object-cover ensures it fills the circle entirely
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              
              <p className="mt-5 text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-center text-gray-500 group-hover:text-giva-dark transition-colors duration-300">
                {category.name}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}