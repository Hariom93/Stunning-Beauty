import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Loader2 } from 'lucide-react';
import ProductCard from './ProductCard';
import { useStoreProducts } from '../hooks/useAdminApi';

const SALE_DURATION = 8 * 60 * 60; // 8 hours in seconds

const FlashSale = () => {
  const [timeLeft, setTimeLeft] = useState(SALE_DURATION);
  const { data, isLoading } = useStoreProducts({ limit: 4, trending: true });
  const products = data?.products || [];

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : SALE_DURATION));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const hh = String(Math.floor(timeLeft / 3600)).padStart(2, '0');
  const mm = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');

  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white dark:bg-slate-850 p-6 rounded shadow-sm border border-slate-200/60 dark:border-slate-800/80 flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
      <div className="bg-white dark:bg-slate-850 p-6 rounded shadow-sm border border-slate-200/60 dark:border-slate-800/80">
        
        {/* Deal Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3.5 flex-wrap">
            <h2 className="text-[#0f1111] dark:text-slate-100 text-xl sm:text-2xl font-black">
              Today's Deals (Flash Sale)
            </h2>
            <div className="flex items-center gap-1.5 text-xs font-black bg-red-105 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-2 py-1 rounded shadow-sm select-none border border-red-100 dark:border-red-900/30">
              <Clock className="w-3.5 h-3.5" />
              <span>Ends in {hh}:{mm}:{ss}</span>
            </div>
          </div>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-black text-[#007185] dark:text-cyan-400 hover:text-[#c45500] hover:underline"
          >
            See all deals
          </Link>
        </div>

        {/* Deal Products Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {products.map((product, i) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="h-full"
            >
              <ProductCard product={product} isFlash />
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default FlashSale;
