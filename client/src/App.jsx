  import React, { lazy, Suspense, useState } from 'react';
  import { Routes, Route, Outlet, useLocation, useOutlet } from 'react-router-dom';
  import { AnimatePresence, motion } from 'framer-motion';
  import Navbar from './components/Navbar';
  import Footer from './components/Footer';
  import ScrollToTop from './components/ScrollToTop';
  import { Loader2 } from 'lucide-react';
  import { Toaster } from 'react-hot-toast';

  const PageLoader = () => (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
    </div>
  );

  const lazyWithSuspense = (importFn) => {
    const LazyComponent = lazy(importFn);
    return (props) => (
      <Suspense fallback={<PageLoader />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };

  // Lazy-load all pages
  const Home = lazyWithSuspense(() => import('./pages/Home'));
  const Products = lazyWithSuspense(() => import('./pages/Products'));
  const ProductDetail = lazyWithSuspense(() => import('./pages/ProductDetail'));
  const Cart = lazyWithSuspense(() => import('./pages/Cart'));
  const Checkout = lazyWithSuspense(() => import('./pages/Checkout'));
  const Wishlist = lazyWithSuspense(() => import('./pages/Wishlist'));
  const Login = lazyWithSuspense(() => import('./pages/Login'));
  const Register = lazyWithSuspense(() => import('./pages/Register'));
  const Profile = lazyWithSuspense(() => import('./pages/Profile'));
  const Orders = lazyWithSuspense(() => import('./pages/Orders'));
  const OrderTracking = lazyWithSuspense(() => import('./pages/OrderTracking'));
  const NotFound = lazyWithSuspense(() => import('./pages/NotFound'));

  // Admin pages
  const AdminLayout = lazy(() => import('./components/AdminLayout'));
  const AdminDashboard = lazyWithSuspense(() => import('./pages/AdminDashboard'));
  const AdminProducts = lazyWithSuspense(() => import('./pages/AdminProducts'));
  const AdminCategories = lazyWithSuspense(() => import('./pages/AdminCategories'));
  const AdminBrands = lazyWithSuspense(() => import('./pages/AdminBrands'));
  const AdminCoupons = lazyWithSuspense(() => import('./pages/AdminCoupons'));
  const AdminBanners = lazyWithSuspense(() => import('./pages/AdminBanners'));
  const AdminOrders = lazyWithSuspense(() => import('./pages/AdminOrders'));
  const AdminUsers = lazyWithSuspense(() => import('./pages/AdminUsers'));
  const AdminAnalytics = lazyWithSuspense(() => import('./pages/AdminAnalytics'));
  const AdminSettings = lazyWithSuspense(() => import('./pages/AdminSettings'));

  const AnimatedOutlet = () => {
    const o = useOutlet();
    const [outlet] = useState(o);
    return <>{outlet}</>;
  };

  const PublicLayout = () => {
    const location = useLocation();
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-x-hidden">
        <Navbar />
        <main className="flex-grow overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
              className="w-full"
            >
              <AnimatedOutlet />
            </motion.div>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    );
  };

  const App = () => {
    return (
      <>
        <ScrollToTop />
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          {/* Public Routes with Navbar/Footer */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderTracking />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Admin Routes — protected inside AdminLayout via AdminGuard */}
          <Route path="/admin" element={
            <Suspense fallback={<PageLoader />}>
              <AdminLayout />
            </Suspense>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="brands" element={<AdminBrands />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </>
    );
  };

  export default App;
