import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="text-slate-300 mt-16 font-sans">

      {/* 1. Back to Top Bar */}
      <button
        onClick={scrollToTop}
        className="w-full bg-[#37475a] hover:bg-[#485769] text-white text-xs font-bold py-4 text-center border-0 transition-colors cursor-pointer select-none"
      >
        Back to top
      </button>

      {/* 2. Main Directory (Amazon Deep Slate Color) */}
      <div className="bg-[#232f3e] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand & About */}
          <div>
            <Link to="/" className="flex items-center mb-5 select-none">
              <img src="/logo.png" alt="Stunning Beauty Logo" className="h-16 w-auto object-contain" />
            </Link>
            <p className="text-xs leading-relaxed text-slate-350 mb-6">
              Your premium destination for fashion, electronics, and lifestyle products. Curated with care, delivered with speed.
            </p>
            <div className="flex gap-2">
              {['FB', 'TW', 'IG', 'YT'].map((soc) => (
                <a
                  key={soc}
                  href="#"
                  className="w-8 h-8 bg-slate-800 hover:bg-[#e47911] hover:text-white rounded flex items-center justify-center text-xs font-bold text-slate-300 transition-colors"
                >
                  {soc}
                </a>
              ))}
            </div>
          </div>

          {/* Shop Categories Sitemap */}
          <div>
            <h3 className="font-extrabold text-sm text-white mb-4">Shop Categories</h3>
            <ul className="space-y-2 text-xs">
              {[
                { label: 'All Products', to: '/products' },
                { label: 'Electronics', to: '/products?cat=electronics' },
                { label: 'Fashion & Clothing', to: '/products?cat=fashion' },
                { label: 'Home & Kitchen Decor', to: '/products?cat=home' },
                { label: 'Books Store', to: '/products?cat=books' },
                { label: 'Sports & Outdoors', to: '/products?cat=sports' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-slate-300 hover:text-[#febd69] hover:underline transition-all">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help & Support Sitemap */}
          <div>
            <h3 className="font-extrabold text-sm text-white mb-4">Help & Support</h3>
            <ul className="space-y-2 text-xs">
              {[
                'Your Account', 'Returns Centre', '100% Purchase Protection',
                'Help & FAQ', 'Shipping Rates & Policies', 'Customer Service'
              ].map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-300 hover:text-[#febd69] hover:underline transition-all">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="font-extrabold text-sm text-white mb-4">Contact Stunning Beauty</h3>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#febd69] mt-0.5 flex-shrink-0" />
                <span className="text-slate-300 leading-normal">
                  12 Commerce Road, Outer Ring Road, Bengaluru, KA 560001
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#febd69] flex-shrink-0" />
                <a href="tel:+918001234567" className="text-slate-300 hover:text-[#febd69] hover:underline">
                  +91 800 123 4567
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#febd69] flex-shrink-0" />
                <a href="mailto:support@stunningbeauty.in" className="text-slate-300 hover:text-[#febd69] hover:underline">
                  support@stunningbeauty.in
                </a>
              </li>
            </ul>

            <div className="mt-5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">We Accept</p>
              <div className="flex gap-1.5 flex-wrap">
                {['Visa', 'Mastercard', 'UPI', 'Net Banking', 'Cash on Delivery'].map((method) => (
                  <span key={method} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold">
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Bottom Legal Bar (Amazon Solid Dark Color) */}
      <div className="bg-[#131921] py-6 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-slate-400">© 2026 Stunning Beauty by Vandana Jain. All rights reserved. </p>
          <div className="flex gap-4 flex-wrap">
            {['Conditions of Use', 'Privacy Notice', 'Interest-Based Ads'].map((item) => (
              <a key={item} href="#" className="text-slate-400 hover:text-white hover:underline transition-all">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
