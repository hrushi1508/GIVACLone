import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const relations = [
  { 
    id: 'her', 
    name: 'For Her', 
    query: 'Her', 
    imgUrl: '/assets/gifting/for_her.png', 
    color: 'bg-pink-50', 
    textColor: 'text-pink-600',
    description: 'Perfect for that special someone'
  },
  { 
    id: 'mom', 
    name: 'For Mom', 
    query: 'Mom', 
    imgUrl: '/assets/gifting/for_mom.png', 
    color: 'bg-amber-50', 
    textColor: 'text-amber-600',
    description: 'Celebrate the woman who does it all'
  },
  { 
    id: 'bestie', 
    name: 'For Bestie', 
    query: 'Bestie', 
    imgUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=800&auto=format&fit=crop', 
    color: 'bg-indigo-50', 
    textColor: 'text-indigo-600',
    description: 'A token for your partner in crime'
  },
  { 
    id: 'sister', 
    name: 'For Sister', 
    query: 'Sister', 
    imgUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop', 
    color: 'bg-teal-50', 
    textColor: 'text-teal-600',
    description: 'For the one who knows you best'
  },
  { 
    id: 'him', 
    name: 'For Him', 
    query: 'Him', 
    imgUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop', 
    color: 'bg-slate-50', 
    textColor: 'text-slate-600',
    description: 'Elegant choices for the modern man'
  }
];

export default function GiftingRelation() {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-[11px] uppercase tracking-[0.2em] text-giva-pink font-bold mb-3">
            The Art of Gifting
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-giva-dark mb-4">
            Selection Based on Relation
          </h2>
          <div className="w-20 h-1 bg-giva-gold mx-auto" />
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {relations.map((rel, idx) => (
            <motion.div
              key={rel.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -10 }}
              transition={{ delay: idx * 0.1, type: 'spring', stiffness: 300 }}
              viewport={{ once: true }}
              onClick={() => navigate(`/search?q=${rel.query}`)}
              className="group cursor-pointer"
            >
              <div className={`${rel.color} rounded-2xl p-8 h-full flex flex-col items-center text-center transition-all duration-300 border border-transparent group-hover:border-giva-pink/20 group-hover:shadow-2xl group-hover:shadow-giva-pink/5 relative overflow-hidden`}>
                {/* Decorative background circle */}
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md mb-6 group-hover:scale-110 transition-transform duration-500 relative z-10">
                  <img 
                    src={rel.imgUrl} 
                    alt={rel.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                
                <h3 className="text-xl font-bold text-giva-dark mb-2 relative z-10">{rel.name}</h3>
                <p className="text-sm text-gray-500 font-light leading-snug relative z-10">{rel.description}</p>
                
                <motion.div 
                  className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${rel.textColor}`}>
                    Explore More +
                  </span>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
