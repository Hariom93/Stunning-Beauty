import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={submitHandler} className="flex max-w-xl mx-auto mb-6">
      <input
        type="text"
        placeholder="Search products..."
        className="flex-1 border border-gray-300 dark:border-gray-600 rounded-l px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button
        type="submit"
        className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-r"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
