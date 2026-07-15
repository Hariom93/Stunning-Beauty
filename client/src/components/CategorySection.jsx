import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { useCategories } from '../hooks/useAdminApi';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

const CategorySection = () => {
  const { data: categories = [], isLoading, isError } = useCategories();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mt-8 sm:-mt-16 md:-mt-24 lg:-mt-32">
      {/* Grid container */}
      {isLoading ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-10 shadow flex items-center justify-center min-h-[200px] border border-slate-100 dark:border-slate-700">
          <Loader2 className="w-8 h-8 text-[#e47911] animate-spin" />
          <span className="ml-2 text-sm text-slate-505 font-medium">Loading categories...</span>
        </div>
      ) : isError ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow flex flex-col items-center justify-center min-h-[200px] border border-slate-100 dark:border-slate-700 text-slate-400">
          <AlertCircle className="w-8 h-8 text-rose-500 mb-2" />
          <p className="text-sm font-semibold">Failed to load categories</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow text-center min-h-[150px] flex items-center justify-center border border-slate-100 dark:border-slate-700 text-slate-400">
          <p className="text-sm">No categories found in database.</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {categories.map((cat) => (
            <motion.div 
              key={cat._id} 
              variants={cardVariants}
              className="group"
            >
              <Link
                to={`/products?cat=${cat.slug}`}
                className="bg-white dark:bg-slate-850 p-3.5 sm:p-5 rounded shadow-sm hover:shadow-md border border-slate-200/60 dark:border-slate-800/80 flex flex-col h-[200px] sm:h-[300px] transition-all select-none group-hover:-translate-y-1"
              >
                {/* Card Title */}
                <h3 className="text-[#0f1111] dark:text-slate-100 text-sm sm:text-lg font-black tracking-tight mb-1.5 sm:mb-3 line-clamp-1 capitalize">
                  {cat.name}
                </h3>

                {/* Card Image Cover */}
                <div className="flex-grow w-full h-28 sm:h-44 overflow-hidden rounded bg-slate-50 dark:bg-slate-900/50 relative">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                </div>

                {/* Card Link (Amazon Signature Link Color) */}
                <div className="mt-2.5 pt-0.5 sm:mt-4 sm:pt-1 flex items-center gap-1 text-[10px] sm:text-xs font-black text-[#007185] dark:text-cyan-400 group-hover:text-[#c45500] transition-colors">
                  Shop now
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
};

export default CategorySection;
