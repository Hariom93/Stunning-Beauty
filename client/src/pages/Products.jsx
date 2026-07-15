import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X, Loader2, AlertCircle } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useStoreProducts, useCategories } from '../hooks/useAdminApi';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State variables for filters
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [activeCatId, setActiveCatId] = useState('');
  const [sort, setSort] = useState('');
  const [priceMax, setPriceMax] = useState(200000);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  // Fetch categories list
  const { data: categories = [], isLoading: catsLoading } = useCategories();

  // Handle URL query parameters on mount or change
  useEffect(() => {
    const catSlug = searchParams.get('cat');
    if (catSlug && categories.length > 0) {
      const match = categories.find(c => c.slug === catSlug || c.name.toLowerCase() === catSlug.toLowerCase());
      if (match) {
        setActiveCatId(match._id);
      }
    } else if (!catSlug) {
      setActiveCatId('');
    }

    const q = searchParams.get('q');
    if (q) {
      setSearch(q);
    }
  }, [searchParams, categories]);

  // Construct API query parameters
  const apiParams = {
    page,
    limit: 12,
    'price[lte]': priceMax,
  };

  if (search.trim()) {
    apiParams.keyword = search.trim();
  }
  if (activeCatId) {
    apiParams.category = activeCatId;
  }
  if (sort) {
    // Sort mapping: 
    // price_asc -> price
    // price_desc -> -price
    // rating -> -rating
    if (sort === 'price_asc') apiParams.sort = 'price';
    if (sort === 'price_desc') apiParams.sort = '-price';
    if (sort === 'rating') apiParams.sort = '-rating';
  }

  // Fetch store products dynamically
  const { data, isLoading, isError, error } = useStoreProducts(apiParams);
  const products = data?.products || [];
  const totalPages = data?.pages || 1;

  const handlePageChange = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync category click back to URL slug
  const handleCategoryClick = (cat) => {
    if (cat === 'all') {
      setActiveCatId('');
      searchParams.delete('cat');
    } else {
      setActiveCatId(cat._id);
      searchParams.set('cat', cat.slug);
    }
    setPage(1);
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-heading text-slate-900 dark:text-white">All Products</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          {isLoading ? 'Loading catalog...' : `Discover our collection (${data?.total || 0} items found)`}
        </p>
      </div>

      {/* Search & controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
              if (e.target.value.trim()) {
                searchParams.set('q', e.target.value);
              } else {
                searchParams.delete('q');
              }
              setSearchParams(searchParams);
            }}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-400 transition-all text-slate-900 dark:text-slate-100"
          />
          {search && (
            <button onClick={() => {
              setSearch('');
              searchParams.delete('q');
              setSearchParams(searchParams);
              setPage(1);
            }} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>
        <select 
          value={sort} 
          onChange={e => { setSort(e.target.value); setPage(1); }} 
          className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none text-slate-700 dark:text-slate-200"
        >
          <option value="">Sort: Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Filter panel */}
      {filtersOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 mb-6"
        >
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
              Max Price: ₹{priceMax.toLocaleString('en-IN')}
            </p>
            <input
              type="range"
              min={100}
              max={200000}
              step={500}
              value={priceMax}
              onChange={e => { setPriceMax(Number(e.target.value)); setPage(1); }}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>
        </motion.div>
      )}

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap mb-8">
        <button
          onClick={() => handleCategoryClick('all')}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-all cursor-pointer ${
            !activeCatId
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300'
          }`}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat._id}
            onClick={() => handleCategoryClick(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-all cursor-pointer ${
              activeCatId === cat._id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center text-slate-400">
          <AlertCircle className="w-10 h-10 text-rose-500" />
          <p className="font-semibold text-lg text-slate-800 dark:text-slate-200">Failed to load catalog</p>
          <p className="text-sm max-w-md">{error.response?.data?.error || error.message || 'An unexpected error occurred.'}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">No products found</p>
          <p className="text-sm">Try a different search query or expand your filters.</p>
        </div>
      ) : (
        <div className="space-y-12">
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p, i) => (
              <motion.div key={p._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-6">
              <button
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                    page === p
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={page === totalPages}
                onClick={() => handlePageChange(page + 1)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Products;
