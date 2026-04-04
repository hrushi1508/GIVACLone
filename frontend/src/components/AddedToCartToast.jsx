import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export default function AddedToCartToast({ isVisible, product, onClose }) {
  const isDuplicate = product?.isAlreadyInBag;

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          // Use the unique timestamp instead of Math.random()
          key={product?.toastId || 'toast'} 
          initial={{ opacity: 0, y: -20, x: '-50%' }}
          animate={{ opacity: 1, y: 20, x: '-50%' }}
          exit={{ opacity: 0, y: -20, x: '-50%' }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed top-10 left-1/2 z-[999] w-[95%] max-w-sm bg-white shadow-2xl rounded-full border border-gray-100 p-2 pl-4 flex items-center gap-3"
        >
          <div className={`p-1.5 rounded-full ${isDuplicate ? 'bg-amber-50' : 'bg-green-50'}`}>
            {isDuplicate ? (
              <AlertCircle className="text-amber-500" size={18} />
            ) : (
              <CheckCircle className="text-green-500" size={18} />
            )}
          </div>
          
          <div className="flex-1 overflow-hidden">
            <p className={`text-[9px] uppercase tracking-[0.2em] font-bold ${isDuplicate ? 'text-amber-600' : 'text-gray-400'}`}>
              {isDuplicate ? "Already in Bag" : "Added to Bag"}
            </p>
            <h4 className="text-xs font-serif text-giva-dark truncate pr-2">
              {product?.name}
            </h4>
          </div>

          <div className="flex items-center gap-2 pr-2">
            <span className="bg-giva-sand text-giva-dark text-[10px] font-black px-3 py-1 rounded-full">
              {product?.count || 1}
            </span>
            <button 
              onClick={onClose}
              className="p-1 text-gray-300 hover:text-gray-500 transition"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}