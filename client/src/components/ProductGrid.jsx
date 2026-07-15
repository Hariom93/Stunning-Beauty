import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import { SlidersHorizontal, Loader2, AlertCircle } from 'lucide-react';
import { useStoreProducts } from '../hooks/useAdminApi';

const SORT_OPTIONS = [
  { label: 'Featured', value: '' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Top Rated', value: 'rating' },
];

const ProductGrid = ({ category = '', query = '', featured = false, trending = false, bestSeller = false, newArrival = false }) => {
  const [sort, setSort] = useState('');

  // Setup params for store search
  const params = {
    limit: 8,
  };
  if (category) params.category = category;
  if (query) params.keyword = query;
  if (featured) params.featured = true;
  if (trending) params.trending = true;
  if (bestSeller) params.bestSeller = true;
  if (newArrival) params.newArrival = true;

  if (sort) {
    if (sort === 'price_asc') params.sort = 'price';
    if (sort === 'price_desc') params.sort = '-price';
    if (sort === 'rating') params.sort = '-rating';
  }

  // Fetch using the store products query hook
  const { data, isLoading, isError, error } = useStoreProducts(params);
  const products = data?.products || [];

  return (
    <div>
      {/* Sort bar */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{products.length}</span> products
        </p>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-400"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-2 py-12 text-slate-400 text-sm">
          <AlertCircle className="w-6 h-6 text-rose-500" />
          <p>Failed to load products: {error.response?.data?.error || error.message}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">
          No products found.
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6"
        >
          {products.map((product, i) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default ProductGrid;
