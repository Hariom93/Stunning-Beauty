import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const slides = [
  {
    id: 1,
    title: 'Up to 50% OFF on Premium Fashion',
    subtitle: 'Step into the season with brand new styles from Nike, Levi\'s and more.',
    cta: 'Shop Fashion',
    link: '/products?cat=fashion',
    badge: '🔥 Hot Deal',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80',
  },
  {
    id: 2,
    title: 'Next-Gen Electronics & Workstations',
    subtitle: 'Unbeatable prices on M3 MacBooks, Sony WH-1000XM5, and the latest iPhones.',
    cta: 'Explore Tech',
    link: '/products?cat=electronics',
    badge: '⚡ New Arrivals',
    imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1600&q=80',
  },
  {
    id: 3,
    title: 'Transform Your Living Space',
    subtitle: 'Premium ergonomic chairs, minimal decor, and smart LED accent lighting.',
    cta: 'Shop Home',
    link: '/products?cat=home',
    badge: '✨ Trending Now',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&q=80',
  },
];

const HeroBanner = () => {
  const [current, setCurrent] = useState(0);
  const [isAuto, setIsAuto] = useState(true);

  useEffect(() => {
    if (!isAuto) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, [isAuto]);

  const prev = () => {
    setIsAuto(false);
    setCurrent(c => (c - 1 + slides.length) % slides.length);
  };
  
  const next = () => {
    setIsAuto(false);
    setCurrent(c => (c + 1) % slides.length);
  };

  return (
    <section className="relative w-full h-[240px] sm:h-[380px] md:h-[480px] lg:h-[550px] bg-slate-200 dark:bg-slate-900 overflow-hidden select-none">
      
      {/* Slider Carousel */}
      <AnimatePresence mode="wait">
        {slides.map((slide, idx) =>
          idx === current ? (
            <motion.div
              key={slide.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 w-full h-full"
            >
              {/* Background Image (Full Brightness) */}
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className="w-full h-full object-cover object-center"
              />

              {/* Black Tint Overlay for Readability (Only on the left for text block overlay) */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent z-[5]" />

              {/* Text Block Content */}
              <div className="absolute inset-0 z-10 flex flex-col justify-center h-full px-6 sm:px-12 md:px-20 max-w-xl md:max-w-2xl text-white">
                <motion.span
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="inline-block mb-2 sm:mb-4 px-3 py-1 bg-amber-500/90 text-slate-950 text-xs font-black rounded w-fit select-none"
                >
                  {slide.badge}
                </motion.span>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight drop-shadow-md mb-2 sm:mb-4"
                >
                  {slide.title}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="text-xs sm:text-sm md:text-base text-slate-205/90 drop-shadow-sm line-clamp-2 md:line-clamp-none mb-4 sm:mb-6"
                >
                  {slide.subtitle}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="flex gap-3"
                >
                  <Link 
                    to={slide.link} 
                    className="px-4 py-2 sm:px-6 sm:py-2.5 bg-[#febd69] hover:bg-[#f3a847] text-slate-900 text-xs sm:text-sm font-black rounded shadow transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {slide.cta}
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          ) : null
        )}
      </AnimatePresence>

      {/* Signature Amazon Fade Mask: Smoothly blends the bottom portion of the banner with homepage background */}
      <div className="absolute bottom-0 left-0 w-full h-32 sm:h-44 md:h-64 bg-gradient-to-t from-[#eaeded] dark:from-slate-955 via-[#eaeded]/60 dark:via-slate-950/60 to-transparent z-[8] pointer-events-none" />

      {/* Controls */}
      <button 
        onClick={prev} 
        className="absolute left-2 sm:left-4 top-[40%] sm:top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-12 sm:h-12 hover:bg-black/10 hover:border border-white/20 rounded flex items-center justify-center text-white transition-all cursor-pointer"
      >
        <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>
      <button 
        onClick={next} 
        className="absolute right-2 sm:right-4 top-[40%] sm:top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-12 sm:h-12 hover:bg-black/10 hover:border border-white/20 rounded flex items-center justify-center text-white transition-all cursor-pointer"
      >
        <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setIsAuto(false);
              setCurrent(i);
            }}
            className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
              i === current ? 'w-6 sm:w-8 bg-[#febd69]' : 'w-1.5 sm:w-2 bg-white/40 hover:bg-white/80'
            }`}
          />
        ))}
      </div>

    </section>
  );
};

export default HeroBanner;
