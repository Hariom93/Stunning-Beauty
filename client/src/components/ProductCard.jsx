import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Star, Eye, Sparkles, TrendingUp } from 'lucide-react';
import { CartContext } from '../context/CartContext';

const RatingStars = ({ rating }) => (
  <div className="flex gap-0.5 select-none">
    {[1, 2, 3, 4, 5].map(s => (
      <Star
        key={s}
        className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-700'}`}
      />
    ))}
  </div>
);

const ProductCard = ({ product, isFlash = false }) => {
  const { addToCart } = useContext(CartContext);
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  // Map database model fields to UI fields
  const _id = product._id;
  const name = product.title || product.name;
  const image = product.thumbnail || product.image;
  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const originalPrice = product.discountPrice > 0 ? product.price : null;
  const discount = product.discountPrice > 0 ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : null;
  const rating = product.rating || 0;
  const reviewCount = product.reviewCount || 0;
  const badge = product.badge || (product.bestSeller ? 'Best Seller' : product.newArrival ? 'New Arrival' : product.trending ? 'Trending' : null);

  // Calculate savings for Flipkart styling
  const savings = originalPrice ? originalPrice - price : 0;

  // Mock delivery date
  const getMockDeliveryDate = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2); // 2 days delivery
    return `FREE Delivery by ${days[tomorrow.getDay()]}, ${months[tomorrow.getMonth()]} ${tomorrow.getDate()}`;
  };

  const getBadgeDetails = () => {
    if (!badge) return null;
    const cleanBadge = badge.toLowerCase();
    if (cleanBadge.includes('seller')) {
      return {
        text: badge,
        classes: 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black shadow-sm border border-amber-300/35',
        icon: <Star className="w-3 h-3 fill-slate-950 stroke-none" />
      };
    }
    if (cleanBadge.includes('new') || cleanBadge.includes('arrival')) {
      return {
        text: badge,
        classes: 'bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 font-black shadow-sm border border-teal-300/35',
        icon: <Sparkles className="w-3 h-3 text-slate-950" />
      };
    }
    if (cleanBadge.includes('trend')) {
      return {
        text: badge,
        classes: 'bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black shadow-sm border border-pink-400/35',
        icon: <TrendingUp className="w-3 h-3 text-white" />
      };
    }
    return {
      text: badge,
      classes: 'bg-slate-800/90 text-white font-bold',
      icon: null
    };
  };

  const badgeDetails = getBadgeDetails();

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div
      className="group relative bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-850 hover:border-transparent shadow-sm hover:shadow-2xl flex flex-col justify-between h-full p-3.5 sm:p-4.5 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 select-none"
    >
      {/* Badges / Category Labels (Vibrant look) */}
      <div className="absolute top-3.5 left-3.5 z-10 flex flex-col gap-1.5 pointer-events-none">
        {badgeDetails && (
          <span className={`text-[9px] uppercase tracking-wider px-2 py-1 rounded-lg flex items-center gap-1 ${badgeDetails.classes}`}>
            {badgeDetails.icon}
            {badgeDetails.text}
          </span>
        )}
      </div>

      {/* Floating Wishlist & Quick View Actions (Shopify layout) */}
      <div className="absolute top-3.5 right-3.5 z-10 flex flex-col gap-2">
        {/* Wishlist toggle */}
        <button
          onClick={handleWishlistToggle}
          className={`w-8 h-8 rounded-full border border-slate-200/60 dark:border-slate-850 flex items-center justify-center shadow-md cursor-pointer transition-all duration-300 ${
            isWishlisted 
              ? 'bg-rose-500 text-white border-transparent' 
              : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-200 hover:text-rose-500'
          }`}
          title="Wishlist"
        >
          <Heart className={`w-4 h-4 transition-transform duration-300 ${isWishlisted ? 'fill-current scale-110' : 'scale-100'}`} />
        </button>

        {/* Quick view button */}
        <Link
          to={`/products/${_id}`}
          className="w-8 h-8 bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-850 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-200 shadow-md hover:text-amber-500 transition-colors opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          title="Quick View"
        >
          <Eye className="w-4 h-4" />
        </Link>
      </div>

      {/* Image container: Centered and square fitting (Shopify zoom look) */}
      <Link to={`/products/${_id}`} className="block h-36 sm:h-48 w-full flex-shrink-0 overflow-hidden bg-white dark:bg-slate-950 rounded-2xl mb-2 sm:mb-4.5 flex items-center justify-center relative border border-slate-50 dark:border-slate-850/30">
        <img
          src={image}
          alt={name}
          className="max-h-full max-w-full object-contain p-2 group-hover:scale-106 transition-transform duration-500 ease-out"
          onError={e => { e.target.src = 'https://via.placeholder.com/400x300?text=Product'; }}
        />
      </Link>

      {/* Card body */}
      <div className="flex flex-col flex-grow">
        {/* Title */}
        <Link to={`/products/${_id}`} className="block mb-1 sm:mb-2">
          <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
            {name}
          </h3>
        </Link>

        {/* Rating and review counts (Meesho modern capsule look) */}
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-3">
          <div className="bg-slate-50 dark:bg-slate-850/60 px-2 py-0.5 rounded-full flex items-center gap-1 border border-slate-100/50 dark:border-slate-800/30">
            {/* Show 5 stars on desktop/tablet, but show 1 star pill on mobile */}
            <div className="hidden sm:flex items-center gap-0.5">
              <RatingStars rating={rating} />
            </div>
            <div className="flex sm:hidden items-center gap-0.5 select-none">
              <span className="text-[9px] font-black text-amber-500">{rating ? rating.toFixed(1) : '0.0'}</span>
              <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
            </div>
          </div>
          <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wide">
            ({reviewCount?.toLocaleString()})
          </span>
        </div>

        {/* Pricing details (Flipkart style with green saving badge) */}
        <div className="mb-2 sm:mb-3.5">
          <div className="flex items-baseline flex-wrap gap-1.5">
            <span className="text-base sm:text-lg font-black text-slate-950 dark:text-white">
              ₹{price?.toLocaleString('en-IN')}
            </span>
            {originalPrice && (
              <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 line-through">
                ₹{originalPrice?.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Flipkart/Meesho inspired Savings Pill */}
          {discount && (
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mt-1.5">
              <span className="text-[8px] sm:text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 px-1.5 py-0.5 rounded-md">
                {discount}% OFF
              </span>
              {savings > 0 && (
                <span className="text-[8px] sm:text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  Save ₹{savings?.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Mock delivery text */}
        <p className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-semibold leading-normal mb-2.5 sm:mb-4.5">
          {getMockDeliveryDate()}
        </p>

        {/* Add to Cart button (Shopify hover transition to glowing amber) */}
        <button
          onClick={() => addToCart(product)}
          className="mt-auto w-full py-2 sm:py-2.5 bg-slate-950 dark:bg-slate-800 hover:bg-gradient-to-r hover:from-amber-400 hover:via-amber-500 hover:to-orange-500 text-white hover:text-slate-950 font-extrabold text-[10px] sm:text-xs rounded-xl sm:rounded-2xl flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer transition-all duration-300 shadow-sm border border-slate-900/50 hover:border-transparent hover:shadow-glow hover:scale-[1.02] active:scale-[0.98]"
        >
          <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
