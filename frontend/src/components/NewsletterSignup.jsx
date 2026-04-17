import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Check } from 'lucide-react';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setEmail('');
      setSubmitted(true);
      setLoading(false);
      
      // Reset after 3 seconds
      setTimeout(() => setSubmitted(false), 3000);
    }, 800);
  };

  return (
    <section className="bg-giva-dark text-white py-20">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Stay Elegant, Stay Updated
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto mb-10">
            Subscribe to our exclusive newsletter for early access to new collections, special offers, and insider tips on jewelry care.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="relative flex-1">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={loading}
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 focus:border-giva-pink outline-none text-white placeholder-white/50 transition-colors disabled:opacity-50"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
              className="px-8 py-4 bg-giva-pink hover:bg-giva-dark/20 text-giva-dark font-semibold tracking-wide uppercase transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitted ? (
                <>
                  <Check size={18} /> Thank You!
                </>
              ) : loading ? (
                <span className="animate-pulse">Subscribing...</span>
              ) : (
                'Subscribe'
              )}
            </motion.button>
          </form>

          <p className="text-white/60 text-sm mt-6">
            No spam, just sparkle. Unsubscribe anytime.
          </p>

          {submitted && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-giva-pink font-semibold mt-4"
            >
              Welcome to the GIVA family! ✨
            </motion.p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
