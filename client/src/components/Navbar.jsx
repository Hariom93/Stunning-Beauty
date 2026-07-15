import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Heart, Search, Menu, X, User, Package,
  LogOut, ChevronDown, Zap, LayoutDashboard, MapPin, Globe,
  TrendingUp, Sparkles, ShoppingBag
} from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { useCategories } from '../hooks/useAdminApi';

// Language translation dictionary for hybrid UI
const translations = {
  EN: {
    logoSphere: "Sphere",
    deliverTo: "Deliver to",
    india: "India",
    searchPlaceholder: "Search products, brands and more...",
    allCategories: "All categories",
    trending: "Trending Searches",
    popularCategories: "Popular Categories",
    welcome: "Welcome,",
    user: "User",
    adminDashboard: "Admin Dashboard",
    profile: "Your Profile",
    orders: "Your Orders",
    wishlist: "Your Wishlist",
    signOut: "Sign Out",
    signIn: "Sign In",
    cart: "Cart",
    allCategoriesBtn: "All Categories",
    dealsStore: "Deals Store",
    hotClearance: "Hot Clearance",
    accountProfile: "Account profile",
    helpQuickLinks: "Help & Quick Links",
    allProducts: "All Products",
    registerAccount: "Register Account",
  },
  HI: {
    logoSphere: "स्फेयर",
    deliverTo: "को भेजें",
    india: "भारत",
    searchPlaceholder: "उत्पाद, ब्रांड और बहुत कुछ खोजें...",
    allCategories: "सभी श्रेणियां",
    trending: "ट्रेंडिंग सर्च",
    popularCategories: "लोकप्रिय श्रेणियां",
    welcome: "स्वागत है,",
    user: "उपयोगकर्ता",
    adminDashboard: "एडमिन डैशबोर्ड",
    profile: "आपकी प्रोफ़ाइल",
    orders: "आपके ऑर्डर",
    wishlist: "आपकी विशलिस्ट",
    signOut: "लॉग आउट",
    signIn: "लॉग इन",
    cart: "कार्ट",
    allCategoriesBtn: "सभी श्रेणियां",
    dealsStore: "डील्स स्टोर",
    hotClearance: "हॉट क्लीयरेंस",
    accountProfile: "खाता प्रोफ़ाइल",
    helpQuickLinks: "सहायता और लिंक",
    allProducts: "सभी उत्पाद",
    registerAccount: "नया खाता बनाएं",
  }
};

export const Navbar = () => {
  const { cartCount } = useContext(CartContext);
  const { token, user, logout, loading } = useContext(AuthContext);
  const { data: categories = [] } = useCategories();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('cat') || 'all');

  // Language and dropdown states
  const [currentLang, setCurrentLang] = useState(localStorage.getItem('lang') || 'EN');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const searchRef = useRef(null);

  // Refs for tracking hover dropdown timeouts
  const profileTimeoutRef = useRef(null);
  const langTimeoutRef = useRef(null);

  // Clean timeout on unmount
  useEffect(() => {
    return () => {
      if (profileTimeoutRef.current) clearTimeout(profileTimeoutRef.current);
      if (langTimeoutRef.current) clearTimeout(langTimeoutRef.current);
    };
  }, []);

  // Translation helper
  const t = (key) => {
    return translations[currentLang]?.[key] || translations['EN'][key] || key;
  };

  // Keep search query in sync with URL search queries
  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
    setSelectedCategory(searchParams.get('cat') || 'all');
  }, [searchParams]);

  // Close search suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dropdown hover actions
  const showProfileDropdown = () => {
    if (profileTimeoutRef.current) clearTimeout(profileTimeoutRef.current);
    setProfileDropdownOpen(true);
  };

  const hideProfileDropdown = () => {
    profileTimeoutRef.current = setTimeout(() => {
      setProfileDropdownOpen(false);
    }, 150);
  };

  const showLangDropdown = () => {
    if (langTimeoutRef.current) clearTimeout(langTimeoutRef.current);
    setLangDropdownOpen(true);
  };

  const hideLangDropdown = () => {
    langTimeoutRef.current = setTimeout(() => {
      setLangDropdownOpen(false);
    }, 150);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchFocused(false);

    let path = '/products';
    const params = [];

    if (searchQuery.trim()) {
      params.push(`q=${encodeURIComponent(searchQuery.trim())}`);
    }
    if (selectedCategory && selectedCategory !== 'all') {
      params.push(`cat=${encodeURIComponent(selectedCategory)}`);
    }

    if (params.length > 0) {
      path += `?${params.join('&')}`;
    }

    navigate(path);
  };

  const handleTrendingClick = (keyword) => {
    setSearchQuery(keyword);
    setSearchFocused(false);
    navigate(`/products?q=${encodeURIComponent(keyword)}`);
  };

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  // Category emojis & formatting details
  const categoryMeta = {
    'skincare': { icon: '🧴', color: 'text-amber-400' },
    'makeup': { icon: '💄', color: 'text-rose-450' },
    'haircare': { icon: '💇', color: 'text-purple-400' },
    'fragrance': { icon: '✨', color: 'text-emerald-400' },
    'body': { icon: '🧼', color: 'text-cyan-400' },
    'wellness': { icon: '🌿', color: 'text-teal-400' },
    'tools': { icon: '🖌️', color: 'text-orange-400' },
    'sets': { icon: '🎁', color: 'text-indigo-400' },
  };

  const getCategoryMeta = (slug) => {
    const cleanSlug = slug.toLowerCase();
    for (const key in categoryMeta) {
      if (cleanSlug.includes(key)) return categoryMeta[key];
    }
    return { icon: '📦', color: 'text-slate-400' };
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-[80] glass-navbar shadow-lg transition-all duration-300">
        {/* Upper Header Row */}
        <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 flex items-center justify-between gap-4">

          {/* Logo & Hamburg Menu */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Burger toggle for mobile sidebar */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-800/60 transition-colors text-slate-100 cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Stunning Beauty Logo */}
            <Link
              to="/"
              onClick={() => {
                if (window.location.pathname === '/') {
                  window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                  });
                }
              }}
              className="flex items-center gap-2 group select-none py-1 touch-manipulation"
            >
              <img
                src="/logo.png"
                alt="Stunning Beauty Logo"
                className="h-12 sm:h-14 w-auto object-contain lg:group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
          </div>

          {/* Delivery Location Widget */}
          <div className="hidden md:flex items-center gap-2.5 bg-slate-800/40 hover:bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-700/30 hover:border-slate-600/50 cursor-pointer transition-all duration-200 select-none">
            <div className="relative">
              <MapPin className="w-5 h-5 text-amber-400" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-400 rounded-full deals-dot-glow" />
            </div>
            <div className="flex flex-col text-left leading-tight">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{t('deliverTo')}</span>
              <span className="text-xs font-bold text-white">{t('india')}</span>
            </div>
          </div>

          {/* Search Bar - Combined Flipkart dropdown + Meesho trending panel */}
          <div ref={searchRef} className="hidden sm:block flex-grow max-w-xl relative">
            <form onSubmit={handleSearchSubmit} className="flex items-center bg-slate-800/80 border border-slate-700 rounded-2xl overflow-hidden search-glow transition-all duration-200">

              {/* Category selector */}
              <div className="bg-slate-700/40 border-r border-slate-700/80 px-3 flex items-center gap-1">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent text-slate-200 text-xs font-semibold outline-none py-2.5 cursor-pointer pr-1"
                >
                  <option value="all" className="bg-slate-900 text-white">{t('allCategories')}</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.slug} className="bg-slate-900 text-white capitalize">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Input field */}
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full px-4 py-2.5 bg-transparent text-white outline-none text-xs font-medium placeholder-slate-400"
              />

              {/* Search button */}
              <button
                type="submit"
                className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 px-5.5 py-2.5 transition-all duration-200 flex items-center justify-center cursor-pointer font-bold border-l border-slate-700/50"
              >
                <Search className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              </button>
            </form>

            {/* Meesho Style Suggestions Drawer */}
            <AnimatePresence>
              {searchFocused && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 mt-2 bg-slate-900/98 backdrop-blur-md border border-slate-800 text-slate-100 rounded-2xl shadow-2xl overflow-hidden z-[90] p-4.5"
                >
                  {/* Trending Panel */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2.5">
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-extrabold uppercase tracking-wide text-slate-300">{t('trending')}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(currentLang === 'EN'
                        ? ['Wireless Earbuds', 'Smart Watches', 'Sneakers', 'Hoodies', 'Air Purifiers', 'Gaming Laptop']
                        : ['वायरलेस ईयरबड्स', 'स्मार्ट वॉच', 'स्नीकर्स', 'हुडी', 'एयर प्यूरीफायर', 'गेमिंग लैपटॉप']
                      ).map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handleTrendingClick(item)}
                          className="bg-slate-800/80 hover:bg-slate-700 text-xs px-3 py-1.5 rounded-xl border border-slate-700/40 hover:text-amber-300 transition-colors cursor-pointer font-medium"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Popular Categories Grid */}
                  <div>
                    <div className="flex items-center gap-2 mb-2.5">
                      <Sparkles className="w-4 h-4 text-rose-400" />
                      <span className="text-xs font-extrabold uppercase tracking-wide text-slate-300">{t('popularCategories')}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.slice(0, 4).map((cat) => {
                        const meta = getCategoryMeta(cat.slug);
                        return (
                          <Link
                            key={cat._id}
                            to={`/products?cat=${cat.slug}`}
                            onClick={() => setSearchFocused(false)}
                            className="flex items-center gap-2.5 bg-slate-800/40 hover:bg-slate-800/90 p-2 rounded-xl transition-all border border-slate-800/60 hover:border-slate-700/50"
                          >
                            <span className="text-lg">{meta.icon}</span>
                            <span className="text-xs font-bold capitalize text-slate-200">{cat.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Action Icons Panel */}
          <div className="flex items-center gap-3 sm:gap-4.5 flex-shrink-0">

            {/* Language Selector (Clean look with click dropdown) */}
            <div
              className="relative hidden lg:block"
              onMouseEnter={showLangDropdown}
              onMouseLeave={hideLangDropdown}
            >
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 bg-slate-800/20 hover:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/40 cursor-pointer transition-all text-slate-300"
              >
                <Globe className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-200">{currentLang}</span>
                <ChevronDown className="w-3 h-3 text-slate-500 mt-0.5" />
              </button>

              <AnimatePresence>
                {langDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 mt-2 w-40 bg-slate-900 border border-slate-800 text-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 py-1.5"
                  >
                    <button
                      onClick={() => {
                        setCurrentLang('EN');
                        localStorage.setItem('lang', 'EN');
                        setLangDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between w-full text-left px-4 py-2 text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer ${currentLang === 'EN' ? 'text-amber-400' : 'text-slate-300'}`}
                    >
                      <span>English (EN)</span>
                      {currentLang === 'EN' && <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />}
                    </button>
                    <button
                      onClick={() => {
                        setCurrentLang('HI');
                        localStorage.setItem('lang', 'HI');
                        setLangDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between w-full text-left px-4 py-2 text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer ${currentLang === 'HI' ? 'text-amber-400' : 'text-slate-300'}`}
                    >
                      <span>हिन्दी (HI)</span>
                      {currentLang === 'HI' && <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Account Dropdown */}
            {!loading && token ? (
              <div
                className="relative"
                onMouseEnter={showProfileDropdown}
                onMouseLeave={hideProfileDropdown}
              >
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 bg-slate-800/40 hover:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/30 hover:border-slate-600/50 cursor-pointer transition-all select-none"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-[10px] font-black text-slate-900 border border-slate-800 shadow">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="hidden md:flex flex-col text-left leading-none">
                    <span className="text-[10px] text-slate-400">{t('welcome')}</span>
                    <span className="text-xs font-bold text-white mt-0.5 flex items-center gap-0.5">
                      {user?.name?.split(' ')[0] || t('user')}
                      <ChevronDown className="w-3 h-3 text-slate-500" />
                    </span>
                  </div>
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 text-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 py-2.5"
                    >
                      <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/40">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('accountProfile')}</p>
                        <p className="font-extrabold text-sm truncate text-white mt-0.5">{user?.name || t('user')}</p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email}</p>
                      </div>
                      <div className="py-1 px-2 space-y-0.5">
                        {user?.role === 'Admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-xl text-slate-300 hover:bg-slate-800 hover:text-amber-400 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-amber-400" />
                            {t('adminDashboard')}
                          </Link>
                        )}
                        <Link
                          to="/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-xl text-slate-300 hover:bg-slate-800 hover:text-amber-400 transition-colors"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          {t('profile')}
                        </Link>
                        <Link
                          to="/orders"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-xl text-slate-300 hover:bg-slate-800 hover:text-amber-400 transition-colors"
                        >
                          <Package className="w-4 h-4 text-slate-400" />
                          {t('orders')}
                        </Link>
                        <Link
                          to="/wishlist"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-xl text-slate-300 hover:bg-slate-800 hover:text-amber-400 transition-colors"
                        >
                          <Heart className="w-4 h-4 text-slate-400" />
                          {t('wishlist')}
                        </Link>
                      </div>
                      <div className="border-t border-slate-800/80 mt-1.5 pt-1.5 px-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full text-left px-3 py-2 text-xs font-bold rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          {t('signOut')}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 px-3.5 py-1.5 rounded-xl border border-slate-700/40 cursor-pointer transition-all select-none"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-200">{t('signIn')}</span>
              </Link>
            )}

            {/* Wishlist Heart Icon */}
            <Link
              to="/wishlist"
              className="p-2.5 rounded-xl hover:bg-slate-800/60 flex items-center justify-center relative text-slate-200 hover:text-rose-400 transition-all cursor-pointer"
            >
              <Heart className="w-5 h-5 stroke-[2]" />
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="flex items-center gap-1.5 bg-gradient-to-tr from-indigo-950 to-slate-900 hover:from-indigo-900 hover:to-slate-800 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer transition-all relative text-white"
            >
              <div className="relative flex items-center">
                <ShoppingBag className="w-5 h-5 text-white" />
                <AnimatePresence mode="popLayout">
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      className="absolute -top-2.5 -right-2 bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center leading-none shadow"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <span className="hidden lg:block text-xs font-bold">{t('cart')}</span>
            </Link>

          </div>
        </div>

        {/* Mobile Search Row */}
        <div className="bg-slate-950/80 backdrop-blur-md px-4 pb-3 pt-0.5 sm:hidden border-t border-slate-800/40">
          <form onSubmit={handleSearchSubmit} className="flex w-full items-center bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-inner">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full px-3.5 py-2.5 bg-transparent text-white outline-none text-xs font-medium placeholder-slate-400"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 px-4 py-2.5 transition-colors flex items-center justify-center cursor-pointer font-bold border-l border-slate-700/50"
            >
              <Search className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            </button>
          </form>
        </div>

        {/* Lower Sub-Navigation Header */}
        <div className="border-t border-slate-800 bg-slate-900/90 text-white py-2 px-4 sm:px-6 overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-bold gap-4 whitespace-nowrap">

            {/* Left Nav links */}
            <div className="flex items-center gap-5">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="flex items-center gap-1.5 hover:text-amber-300 px-1 py-0.5 rounded cursor-pointer transition-colors text-white"
              >
                <Menu className="w-4 h-4 stroke-[2.5]" />
                <span className="font-extrabold uppercase tracking-wide">{t('allCategoriesBtn')}</span>
              </button>

              <NavLink to="/products" end className={({ isActive }) => `nav-link-hover py-0.5 transition-colors ${isActive ? 'text-amber-400' : 'text-slate-300 hover:text-white'}`}>
                {t('dealsStore')}
              </NavLink>

              {/* Category Links with Emojis */}
              {categories.slice(0, 5).map((cat) => {
                const meta = getCategoryMeta(cat.slug);
                return (
                  <NavLink
                    key={cat._id}
                    to={`/products?cat=${cat.slug}`}
                    className={({ isActive }) => `flex items-center gap-1.5 nav-link-hover py-0.5 transition-colors capitalize ${isActive ? 'text-amber-400 font-extrabold' : 'text-slate-300 hover:text-white'}`}
                  >
                    <span>{meta.icon}</span>
                    <span>{cat.name}</span>
                  </NavLink>
                );
              })}
            </div>

            {/* Right side highlights */}
            <div className="flex items-center gap-4">
              <Link
                to="/products?q=sale"
                className="flex items-center gap-1.5 bg-gradient-to-r from-rose-500/10 to-rose-600/10 hover:from-rose-500/20 hover:to-rose-600/20 border border-rose-500/30 px-3 py-1 rounded-xl transition-all duration-200"
              >
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full deals-dot-glow" />
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-rose-400">{t('hotClearance')}</span>
              </Link>
            </div>

          </div>
        </div>
      </header>

      {/* Slide-in Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/80 z-[100] backdrop-blur-sm"
            />

            {/* Sidebar content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 left-0 w-80 h-full bg-slate-900 text-slate-100 shadow-2xl z-[101] flex flex-col overflow-hidden border-r border-slate-800"
            >
              {/* Sidebar Header with Gradient profile panel */}
              <div className="bg-gradient-to-tr from-slate-950 to-indigo-950 border-b border-slate-800 p-5 flex items-center justify-between">
                <Link
                  to={token ? "/profile" : "/login"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3.5 hover:opacity-90 transition-opacity"
                >
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-500 flex items-center justify-center font-black text-white shadow-inner">
                    {token ? user?.name?.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{t('accountProfile')}</span>
                    <span className="font-extrabold text-sm text-white mt-0.5">
                      {token ? `${t('welcome')} ${user?.name?.split(' ')[0]}` : `${t('welcome')} ${t('signIn')}`}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white p-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sidebar Body */}
              <div className="flex-grow overflow-y-auto py-5 px-5 space-y-6">

                {/* Language selection in Mobile sidebar */}
                <div className="border-b border-slate-850 pb-5">
                  <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-3">Language / भाषा</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setCurrentLang('EN');
                        localStorage.setItem('lang', 'EN');
                      }}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border text-center transition-all ${currentLang === 'EN'
                        ? 'bg-amber-400 text-slate-950 border-transparent shadow'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                    >
                      English (EN)
                    </button>
                    <button
                      onClick={() => {
                        setCurrentLang('HI');
                        localStorage.setItem('lang', 'HI');
                      }}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border text-center transition-all ${currentLang === 'HI'
                        ? 'bg-amber-400 text-slate-950 border-transparent shadow'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                    >
                      हिन्दी (HI)
                    </button>
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-3">Shop by Category</h3>
                  <div className="space-y-2">
                    <Link
                      to="/products"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl text-slate-200 hover:bg-slate-800 hover:text-white transition-all"
                    >
                      <span>📦</span>
                      <span>{t('allProducts')}</span>
                    </Link>
                    {categories.map((cat) => {
                      const meta = getCategoryMeta(cat.slug);
                      return (
                        <Link
                          key={cat._id}
                          to={`/products?cat=${cat.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl text-slate-200 hover:bg-slate-800 hover:text-white transition-all capitalize"
                        >
                          <span className="text-sm">{meta.icon}</span>
                          <span>{cat.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Account & Settings */}
                <div className="border-t border-slate-850 pt-5">
                  <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-3">{t('helpQuickLinks')}</h3>
                  <div className="space-y-2">
                    {token ? (
                      <>
                        <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl text-slate-200 hover:bg-slate-800 hover:text-white transition-all">{t('profile')}</Link>
                        <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl text-slate-200 hover:bg-slate-800 hover:text-white transition-all">{t('orders')}</Link>
                        <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl text-slate-200 hover:bg-slate-800 hover:text-white transition-all">{t('wishlist')}</Link>
                        <button
                          onClick={() => {
                            handleLogout();
                            setMobileMenuOpen(false);
                          }}
                          className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-extrabold rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all cursor-pointer"
                        >
                          {t('signOut')}
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl text-slate-200 hover:bg-slate-800 hover:text-white transition-all">{t('signIn')}</Link>
                        <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl text-slate-200 hover:bg-slate-800 hover:text-white transition-all">{t('registerAccount')}</Link>
                      </>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Adjust height spacer dynamically to prevent content overlap */}
      <div className="h-[154px] sm:h-[102px] lg:h-[96px]" />
    </>
  );
};

export default Navbar;
