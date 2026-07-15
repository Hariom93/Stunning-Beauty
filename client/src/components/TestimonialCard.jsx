import React from 'react';
import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const TestimonialCard = ({ quote, author, rating = 5, role = 'Verified Buyer' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-shadow duration-300"
  >
    <Quote className="w-8 h-8 text-indigo-200 dark:text-indigo-800 mb-4" />
    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-5">"{quote}"</p>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
          {author[0]}
        </div>
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{author}</p>
          <p className="text-xs text-slate-400">{role}</p>
        </div>
      </div>
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map(s => (
          <Star key={s} className={`w-4 h-4 ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-600'}`} />
        ))}
      </div>
    </div>
  </motion.div>
);

export default TestimonialCard;
