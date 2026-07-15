import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { CartContext } from '../context/CartContext';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useContext(CartContext);

  const getPrice = (p) => p.discountPrice > 0 ? p.discountPrice : p.price;
  const subtotal = cartItems.reduce((sum, item) => sum + getPrice(item.product) * item.quantity, 0);
  const shipping = subtotal > 999 ? 0 : 99;
  const discount = Math.round(subtotal * 0.05);
  const total = subtotal + shipping - discount;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-3">Your cart is empty</h2>
          <p className="text-slate-500 mb-8">Looks like you haven't added anything yet.</p>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Start Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="section-heading text-slate-900 dark:text-white">Shopping Cart</h1>
        <button onClick={clearCart} className="text-sm text-rose-500 hover:text-rose-700 font-medium transition-colors">
          Clear all
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {cartItems.map(item => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-4 flex gap-4 border border-slate-100 dark:border-slate-700 shadow-sm"
              >
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 flex-shrink-0">
                  <img src={item.product.thumbnail || item.product.image} alt={item.product.title || item.product.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.id}`} className="font-semibold text-slate-800 dark:text-white text-sm line-clamp-2 hover:text-indigo-600 transition-colors">
                    {item.product.title || item.product.name}
                  </Link>
                  {item.product.category && (
                    <span className="text-xs text-slate-400 capitalize">{item.product.category?.name || item.product.category}</span>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 mt-3">
                    <div>
                      <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                        ₹{getPrice(item.product)?.toLocaleString()}
                      </span>
                      {item.product.discountPrice > 0 && (
                        <span className="text-xs text-slate-400 line-through ml-2">
                          ₹{item.product.price?.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 self-start sm:self-auto">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-bold text-sm text-slate-900 dark:text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center ml-2 hover:bg-rose-100 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order summary */}
        <div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm sticky top-24">
            <h2 className="font-extrabold text-lg text-slate-900 dark:text-white mb-5">Order Summary</h2>

            <div className="space-y-3 mb-5">
              {[
                ['Subtotal', `₹${subtotal.toLocaleString()}`],
                ['Shipping', shipping === 0 ? 'FREE' : `₹${shipping}`],
                ['Discount (5%)', `-₹${discount.toLocaleString()}`],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">{label}</span>
                  <span className={`font-semibold ${label === 'Discount (5%)' ? 'text-emerald-500' : val === 'FREE' ? 'text-emerald-500' : 'text-slate-800 dark:text-white'}`}>
                    {val}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mb-6">
              <div className="flex justify-between font-extrabold text-lg text-slate-900 dark:text-white">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
              {shipping === 0 && (
                <p className="text-xs text-emerald-500 mt-1">🎉 You qualify for free shipping!</p>
              )}
            </div>

            {/* Coupon */}
            <div className="flex gap-2 mb-5">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Coupon code"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:border-indigo-400"
                />
              </div>
              <button className="px-4 py-2.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-sm font-semibold rounded-xl hover:bg-indigo-200 transition-colors">
                Apply
              </button>
            </div>

            <Link to="/checkout" className="btn-primary w-full flex items-center justify-center gap-2">
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link to="/products" className="block text-center text-sm text-indigo-600 dark:text-indigo-400 mt-4 hover:underline">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
