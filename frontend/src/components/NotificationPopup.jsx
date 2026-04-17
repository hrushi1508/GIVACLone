import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info, HelpCircle } from 'lucide-react';

export default function NotificationPopup({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info', 
  onConfirm, 
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  showCancel = false
}) {
  const icons = {
    success: <CheckCircle2 size={40} className="text-green-500" />,
    error: <AlertCircle size={40} className="text-red-500" />,
    info: <Info size={40} className="text-giva-pink" />,
    confirm: <HelpCircle size={40} className="text-blue-500" />
  };

  const colors = {
    success: 'bg-green-50',
    error: 'bg-red-50',
    info: 'bg-giva-sand/30',
    confirm: 'bg-blue-50'
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl overflow-hidden"
        >
          {/* Header Icon */}
          <div className={`flex justify-center mb-6`}>
            <div className={`p-4 rounded-full ${colors[type]}`}>
              {icons[type]}
            </div>
          </div>

          {/* Text Content */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-serif font-bold text-giva-dark mb-2">
              {title}
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {showCancel && (
              <button
                onClick={onClose}
                className="flex-1 py-4 border border-gray-200 text-gray-400 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-gray-50 transition-all"
              >
                {cancelLabel}
              </button>
            )}
            <button
              onClick={() => {
                if (onConfirm) onConfirm();
                onClose();
              }}
              className={`flex-1 py-4 ${type === 'error' ? 'bg-red-500' : 'bg-giva-dark'} text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:shadow-lg active:scale-95 transition-all`}
            >
              {confirmLabel}
            </button>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-300 hover:text-giva-dark transition-colors"
          >
            <X size={20} />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
