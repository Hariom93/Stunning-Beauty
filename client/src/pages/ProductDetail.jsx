import React, { useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star, ShoppingCart, Heart, Share2, Truck,
  ShieldCheck, RotateCcw, ChevronRight, Plus, Minus, Loader2, AlertCircle, CheckCircle
} from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { useProductDetail, useProductReviews, useCreateReview, useMyOrders } from '../hooks/useAdminApi';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);
  const { user, token } = useContext(AuthContext);

  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  // Review form states
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  // Fetch product data
  const { data: productData, isLoading, isError, error } = useProductDetail(id);
  const product = productData?.product;
  const relatedProducts = productData?.relatedProducts || [];

  // Fetch reviews
  const { data: reviews = [], isLoading: reviewsLoading } = useProductReviews(product?._id);

  // Submit review mutation
  const submitReviewMutation = useCreateReview();

  // Fetch user orders to verify purchase
  const { data: orders = [] } = useMyOrders();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center text-slate-400">
        <AlertCircle className="w-10 h-10 text-rose-500" />
        <p className="font-semibold text-lg text-slate-800 dark:text-slate-200">Product not found</p>
        <p className="text-sm max-w-md">{error?.response?.data?.error || error?.message || 'The product you are looking for does not exist or has been removed.'}</p>
        <Link to="/products" className="btn-primary mt-4">Back to Shop</Link>
      </div>
    );
  }

  // Related images fallback
  const images = product.images?.length > 0 ? product.images.map(img => img.url) : [product.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'];

  const savings = product.price - (product.discountPrice > 0 ? product.discountPrice : product.price);
  const activePrice = product.discountPrice > 0 ? product.discountPrice : product.price;

  // Verify if current user can write a review (has a delivered order containing this product)
  const hasPurchased = orders.some(o => 
    o.orderStatus === 'Delivered' && 
    o.items?.some(item => (item.product?._id || item.product) === product._id)
  );

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await submitReviewMutation.mutateAsync({
        productId: product._id,
        rating,
        title,
        comment
      });
      setTitle('');
      setComment('');
      setRating(5);
    } catch {
      // Handled in hooks
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-900 dark:text-slate-100">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8">
        <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/products" className="hover:text-indigo-600 transition-colors">Products</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="hover:text-indigo-600 transition-colors capitalize">{product.category?.name || 'Category'}</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[200px]">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image gallery */}
        <div>
          <motion.div
            key={activeImg}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-square rounded-3xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-4 shadow-sm flex items-center justify-center p-4"
          >
            <img src={images[activeImg]} alt={product.title} className="max-h-full max-w-full object-contain" />
          </motion.div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`w-20 h-20 rounded-xl overflow-hidden border-2 bg-white dark:bg-slate-800 flex-shrink-0 transition-all ${activeImg === i ? 'border-indigo-500' : 'border-slate-200 dark:border-slate-700'}`}
              >
                <img src={img} alt="" className="w-full h-full object-contain p-1" />
              </button>
            ))}
          </div>
        </div>

        {/* Product info */}
        <div>
          {product.newArrival && (
            <span className="inline-block mb-3 px-3 py-1 text-xs font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full">
              New Arrival
            </span>
          )}
          {product.bestSeller && (
            <span className="inline-block mb-3 ml-2 px-3 py-1 text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full">
              Best Seller
            </span>
          )}

          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white mb-3 leading-tight">
            {product.title}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className={`w-5 h-5 ${s <= Math.round(product.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`} />
              ))}
            </div>
            <span className="font-bold text-slate-800 dark:text-white">{product.rating ? product.rating.toFixed(1) : 'No ratings'}</span>
            <span className="text-slate-500 text-sm">({product.reviewCount || 0} reviews)</span>
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-2xl p-5 mb-6 border border-slate-100 dark:border-slate-800">
            <div className="flex items-end gap-3 mb-1">
              <span className="text-4xl font-black text-slate-900 dark:text-white">
                ₹{activePrice.toLocaleString('en-IN')}
              </span>
              {product.discountPrice > 0 && (
                <span className="text-xl text-slate-400 line-through mb-1">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
              )}
              {product.discountPrice > 0 && (
                <span className="text-sm font-bold bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full mb-1">
                  {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                </span>
              )}
            </div>
            {savings > 0 && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                You save ₹{savings.toLocaleString('en-IN')}!
              </p>
            )}
            <p className="text-xs text-slate-400 mt-2">Inclusive of all taxes</p>
          </div>

          {/* Description */}
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">{product.description}</p>

          {/* Specifications list if exists */}
          {product.specifications?.length > 0 && (
            <div className="mb-6 border-t border-b border-slate-200 dark:border-slate-700 py-4">
              <p className="text-sm font-bold mb-2">Product Specifications</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {product.specifications.map((spec, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="text-slate-400 uppercase font-semibold">{spec.name}</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Quantity:</span>
            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors">
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-bold text-slate-900 dark:text-white">{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} className="px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {product.stock <= 10 && (
              <span className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-2.5 py-1 rounded-full">
                Only {product.stock} items left in stock!
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <button
              onClick={() => addToCart(product, quantity)}
              disabled={product.stock === 0}
              className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-5 h-5" />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-rose-300 text-rose-500 rounded-xl font-semibold hover:bg-rose-50 transition-colors cursor-pointer">
              <Heart className="w-5 h-5" />
              Wishlist
            </button>
            <button className="px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Truck, title: 'Free Delivery', desc: 'Orders ₹999+' },
              { icon: ShieldCheck, title: 'Secure', desc: '100% Guaranteed' },
              { icon: RotateCcw, title: 'Easy Returns', desc: '30-day policy' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center text-center bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 gap-1 border border-slate-100 dark:border-slate-800">
                <Icon className="w-5 h-5 text-indigo-500" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{title}</p>
                <p className="text-[10px] text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews section */}
      <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Summary & New Review Form */}
        <div className="lg:col-span-1 space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Customer Reviews</h2>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`w-4 h-4 ${s <= Math.round(product.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-250'}`} />
                ))}
              </div>
              <span className="text-sm font-bold">{product.rating ? product.rating.toFixed(1) : '0'} out of 5</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{reviews.length} customer ratings</p>
          </div>

          {/* Write a Review section */}
          {token && hasPurchased ? (
            <div className="bg-slate-55 bg-slate-50 dark:bg-slate-900/50 p-6 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mb-4 uppercase tracking-wider">Write a Product Review</h3>
              
              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Rating Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Overall Rating</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        onMouseEnter={() => setHoverRating(s)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star className={`w-6 h-6 ${s <= (hoverRating || rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Headline</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What's most important to know?"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-400 text-slate-900 dark:text-slate-100"
                  />
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Written Review *</label>
                  <textarea
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    placeholder="Write your feedback here..."
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-400 text-slate-900 dark:text-slate-100 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitReviewMutation.isPending}
                  className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2"
                >
                  {submitReviewMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Submit Review
                </button>
              </form>
            </div>
          ) : token && !hasPurchased ? (
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
              <p className="text-xs text-slate-500 font-medium">To write a review, you must purchase this item first.</p>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
              <p className="text-xs text-slate-500 font-medium">
                Please <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Sign In</Link> to write a review.
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Reviews List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">Top Customer Reviews</h3>
          
          {reviewsLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-indigo-500 animate-spin" /></div>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8 bg-slate-50 dark:bg-slate-850 rounded-2xl">No reviews yet for this product. Be the first to share your thoughts!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <motion.div
                  key={r._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {r.user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{r.user?.name || 'Anonymous User'}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    {r.verifiedPurchase && (
                      <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`} />
                      ))}
                    </div>
                    {r.title && <span className="text-xs font-bold text-slate-800 dark:text-white">{r.title}</span>}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{r.comment}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
