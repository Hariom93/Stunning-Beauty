import React from 'react';
import { useContext } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { Link } from 'react-router-dom';

const WISHLIST_ITEMS = [
  { _id: 'p6', name: 'MacBook Air M3', price: 114900, originalPrice: 119900, discount: 4, rating: 4.9, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80', category: 'electronics' },
  { _id: 'f3', name: 'Apple iPad Pro 12.9"', price: 89999, originalPrice: 109900, discount: 18, rating: 4.9, image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&q=80', category: 'electronics' },
];

const Wishlist = () => {
  const { addToCart } = useContext(CartContext);

  if (WISHLIST_ITEMS.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-8xl mb-6">💖</div>
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-3">Your wishlist is empty</h2>
        <p className="text-slate-500 mb-8">Save your favorite items here for later.</p>
        <Link to="/products" className="btn-primary inline-flex items-center gap-2">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="section-heading text-slate-900 dark:text-white mb-8">
        My Wishlist <span className="text-slate-400 font-normal text-xl">({WISHLIST_ITEMS.length})</span>
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {WISHLIST_ITEMS.map((product, i) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-lg transition-shadow group"
          >
            <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-900">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <button className="absolute top-3 right-3 w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center shadow-md hover:bg-rose-600 transition-colors">
                <Trash2 className="w-3.5 h-3.5 text-white" />
              </button>
              {product.discount && (
                <span className="absolute top-3 left-3 text-xs font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full">-{product.discount}%</span>
              )}
            </div>
            <div className="p-4">
              <Link to={`/products/${product._id}`} className="font-semibold text-slate-800 dark:text-white text-sm line-clamp-2 hover:text-indigo-600 transition-colors mb-2 block">
                {product.name}
              </Link>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-lg font-extrabold text-slate-900 dark:text-white">₹{product.price.toLocaleString()}</span>
                {product.originalPrice && <span className="text-sm text-slate-400 line-through">₹{product.originalPrice.toLocaleString()}</span>}
              </div>
              <button
                onClick={() => addToCart(product)}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 hover:from-indigo-600 hover:to-purple-700 transition-all"
              >
                <ShoppingCart className="w-4 h-4" /> Move to Cart
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
