import React from 'react';

const FlashSaleCarousel = () => {
  return (
    <section className="my-8">
      <h2 className="text-2xl font-bold mb-4">Flash Sale</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Placeholder product cards */}
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="p-4 border rounded shadow hover:shadow-lg transition-shadow">
            <div className="bg-gray-200 h-32 mb-2"></div>
            <p className="text-center font-medium">Product {i}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FlashSaleCarousel;
