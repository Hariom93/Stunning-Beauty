import React from 'react';
import HeroBanner from '../components/HeroBanner';
import CategorySection from '../components/CategorySection';
import FlashSale from '../components/FlashSale';
import ProductGrid from '../components/ProductGrid';
import TestimonialCard from '../components/TestimonialCard';
import NewsletterForm from '../components/NewsletterForm';

const Home = () => {
  return (
    <div className="bg-[#eaeded] dark:bg-slate-950 min-h-screen pb-16 space-y-6 sm:space-y-8">
      {/* 1. Hero Banner Carousel */}
      <HeroBanner />

      {/* 2. Overlapping Categories Cards */}
      <CategorySection />

      {/* 3. Deals Section (Flash Sale) */}
      <FlashSale />

      {/* 4. Featured Products Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-850 p-6 rounded shadow-sm border border-slate-200/60 dark:border-slate-800/80">
          <h2 className="text-[#0f1111] dark:text-slate-100 text-xl sm:text-2xl font-black mb-6">
            Featured Products
          </h2>
          <ProductGrid featured />
        </div>
      </section>

      {/* 5. Customer Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-850 p-6 rounded shadow-sm border border-slate-200/60 dark:border-slate-800/80">
          <h2 className="text-[#0f1111] dark:text-slate-100 text-xl sm:text-2xl font-black mb-6">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TestimonialCard
              quote="Amazing quality and fast delivery! Extremely satisfied with the purchase."
              author="Riya Sharma"
              rating={5}
            />
            <TestimonialCard
              quote="The best shopping experience I've had online. Customer service is prompt."
              author="Amit Patel"
              rating={4}
            />
            <TestimonialCard
              quote="Love the UI, feels premium. Very easy to find products and checkout."
              author="Sneha Gupta"
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* 6. Newsletter Subscription Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-850 p-6 rounded shadow-sm border border-slate-200/60 dark:border-slate-800/80">
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
};

export default Home;
