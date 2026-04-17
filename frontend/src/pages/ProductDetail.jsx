import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Heart, ShoppingBag, ArrowLeft, Share2, Shield, Truck, RotateCcw, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import SafeImage from '../components/SafeImage';
import { useAuth } from '../store/useAuth';
import { useCart } from '../store/useCart';
import { useWishlist } from '../store/useWishlist';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { toggleWishlist, wishlist } = useWishlist();
  const addToCart = useCart((state) => state.addToCart);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [mainImage, setMainImage] = useState(null);

  useEffect(() => {
    api.get('/products')
      .then(res => {
        const found = res.data.find(p => p.id === parseInt(id));
        if (found) {
          setProduct(found);
          setMainImage(found.image);
        } else {
          setError('Product not found');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load product');
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    addToCart(product, quantity);
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    toggleWishlist(user.id, product);
  };

  const isFavorite = isAuthenticated && wishlist.some(item => item.id === product?.id);
  const rating = product?.rating || 4.5;

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="aspect-[4/5] bg-giva-sand rounded-lg animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-100 rounded-lg animate-pulse" />
              <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
              <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 mb-6">{error || 'Product not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-giva-dark text-white rounded-full font-semibold text-sm uppercase tracking-wider hover:shadow-lg transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const sizes = ['XS', 'S', 'M', 'L', 'XL'];
  const materials = ['Gold', 'Silver', 'Rose Gold', 'Platinum'];
  const trustBadges = [
    { icon: Shield, label: '100% Authentic', desc: 'Certified Jewelry' },
    { icon: Truck, label: 'Free Shipping', desc: 'On orders over ₹5000' },
    { icon: RotateCcw, label: '30-Day Returns', desc: 'No questions asked' }
  ];

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <motion.button
          onClick={() => navigate(-1)}
          whileHover={{ x: -4 }}
          className="flex items-center gap-2 text-giva-pink hover:text-giva-dark transition font-semibold text-sm uppercase tracking-wider"
        >
          <ArrowLeft size={18} /> Back
        </motion.button>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="aspect-[4/5] bg-giva-sand rounded-lg overflow-hidden shadow-lg">
              <SafeImage
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Wishlist Button */}
            <motion.button
              onClick={handleWishlist}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-3 border-2 border-gray-200 rounded-lg flex items-center justify-center gap-2 font-semibold text-sm hover:border-red-500 transition"
            >
              <Heart size={18} className={isFavorite ? 'fill-red-500 text-red-500' : ''} />
              {isFavorite ? 'In Wishlist' : 'Add to Wishlist'}
            </motion.button>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-widest text-giva-pink font-bold mb-2">
                {product.category}
              </p>
              <h1 className="text-4xl font-serif font-bold text-giva-dark mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={`${i < Math.floor(rating) ? 'fill-giva-gold text-giva-gold' : 'text-gray-200'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">(245 reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-4 pb-6 border-b-2 border-gray-100">
                <span className="text-3xl font-bold text-giva-dark">₹{product.price?.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="text-lg text-gray-400 line-through">₹{product.originalPrice?.toLocaleString()}</span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed mb-8">
              {product.description || 'Exquisite handcrafted jewelry piece. Made with premium materials and exceptional attention to detail.'}
            </p>

            {/* Size Selection */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-giva-dark mb-4">Select Size</label>
              <div className="flex gap-3 flex-wrap">
                {sizes.map(size => (
                  <motion.button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      selectedSize === size
                        ? 'bg-giva-dark text-white'
                        : 'border-2 border-gray-200 text-giva-dark hover:border-giva-pink'
                    }`}
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Material Selection */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-giva-dark mb-4">Material</label>
              <div className="grid grid-cols-2 gap-3">
                {materials.map(material => (
                  <motion.button
                    key={material}
                    onClick={() => setSelectedMaterial(material)}
                    whileHover={{ scale: 1.02 }}
                    className={`p-3 rounded-lg font-semibold transition border-2 ${
                      selectedMaterial === material
                        ? 'bg-giva-dark text-white border-giva-dark'
                        : 'border-gray-200 text-giva-dark hover:border-giva-pink'
                    }`}
                  >
                    {material}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-8 flex items-center gap-4">
              <label className="text-sm font-semibold text-giva-dark">Quantity:</label>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-50 transition"
                >
                  −
                </button>
                <span className="px-4 py-2 font-semibold text-giva-dark">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-50 transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <motion.button
              onClick={handleAddToCart}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-giva-dark text-white font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 hover:shadow-lg transition mb-4"
            >
              <ShoppingBag size={20} />
              Add to Bag
            </motion.button>

            {/* Share Button */}
            <button className="w-full py-3 border-2 border-gray-200 text-giva-dark font-semibold rounded-lg flex items-center justify-center gap-2 hover:border-giva-pink transition">
              <Share2 size={18} />
              Share This Product
            </button>
          </motion.div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-3 gap-6 py-12 border-t border-b border-gray-100 mb-16">
          {trustBadges.map((badge, idx) => (
            <div key={idx} className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-giva-sand mb-3">
                <badge.icon size={24} className="text-giva-pink" />
              </div>
              <h3 className="font-semibold text-sm text-giva-dark">{badge.label}</h3>
              <p className="text-xs text-gray-600">{badge.desc}</p>
            </div>
          ))}
        </div>

        {/* Reviews Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-serif font-bold text-giva-dark mb-8">Customer Reviews</h2>
          <div className="space-y-6">
            {[1, 2, 3].map(idx => (
              <motion.div key={idx} className="border border-gray-100 rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-giva-dark">Customer {idx}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className="fill-giva-gold text-giva-gold" />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">2 weeks ago</span>
                </div>
                <p className="text-gray-600 text-sm">
                  Beautiful piece! The quality is exceptional and the craftsmanship is evident. Highly recommend!
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Related Products */}
        <div>
          <h2 className="text-2xl font-serif font-bold text-giva-dark mb-8">You Might Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(idx => (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                className="group cursor-pointer"
              >
                <div className="aspect-[4/5] bg-giva-sand rounded-lg overflow-hidden mb-3 group-hover:shadow-lg transition">
                  <div className="w-full h-full bg-gradient-to-br from-giva-sand to-giva-pink/10" />
                </div>
                <p className="text-[10px] uppercase tracking-widest text-giva-pink font-bold mb-1">Similar Item</p>
                <p className="font-semibold text-sm text-giva-dark">Related Product {idx}</p>
                <p className="font-bold text-giva-dark mt-2">₹{(3000 + idx * 500).toLocaleString()}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
