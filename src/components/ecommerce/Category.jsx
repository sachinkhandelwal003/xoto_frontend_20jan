import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';

const BASE_URL = 'https://xoto.ae';

const Category = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      console.log('📡 Starting API fetch from:', `${BASE_URL}/api/products/get-all-category?limit=100`);

      try {
        const response = await fetch(`${BASE_URL}/api/products/get-all-category?limit=100`);
        
        console.log('📡 Response status:', response.status, response.statusText);
        console.log('📡 Response OK?', response.ok);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();
        console.log('📡 Raw API response:', json);

        // Extract the array from { data: [...] }
        const apiCategories = json.data || [];

        console.log('📡 Number of categories received:', apiCategories.length);
        console.log('📡 First few items:', apiCategories.slice(0, 2));

        const formatted = apiCategories.map((cat, index) => {
          const name = cat.name || 'Category';

          return {
            id: cat._id || index + 1,
            name: name,
            // No image in API → using placeholder (replace with real image URL logic later)
            icon: (
              <img
                src="https://via.placeholder.com/64?text=Category"
                alt={name}
                className="w-full h-full object-contain"
              />
            ),
            color: getOriginalColor(index),
            isNew: false,
            isDeal: false,
          };
        });

        // Add "See More" at the end (same as original)
        formatted.push({
          id: 999,
          name: "See More",
          icon: <FaPlus />,
          color: "from-gray-700 to-gray-500",
        });

        console.log('📡 Final formatted categories count:', formatted.length);
        setCategories(formatted);
      } catch (err) {
        console.error('❌ Fetch failed:', err.message);
        console.error('❌ Full error:', err);
      } finally {
        setLoading(false);
        console.log('⏱ Fetch process completed');
      }
    };

    fetchCategories();
  }, []);

  // Original color cycle preserved
  const getOriginalColor = (index) => {
    const colors = [
      "from-[var(--color-primary)] to-pink-500",
      "from-blue-500 to-cyan-400",
      "from-emerald-500 to-teal-400",
      "from-amber-500 to-orange-400",
      "from-rose-500 to-pink-400",
      "from-indigo-500 to-purple-400",
      "from-violet-500 to-purple-400",
      "from-gray-600 to-gray-400",
      "from-fuchsia-500 to-pink-400",
      "from-green-500 to-emerald-400",
      "from-red-500 to-orange-400",
      "from-red-500 to-pink-500",
      "from-purple-600 to-blue-500",
    ];
    return colors[index % colors.length];
  };

  const handleCategoryClick = (categoryName) => {
    const slug = categoryName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
    navigate(`/ecommerce/filter?category=${slug}`);
  };

  if (loading) {
    return (
      <div className='bg-[var(--color-body)]'>
        <div className="max-w-7xl mx-auto px-4 py-16 bg-[var(--color-body)]">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Shop by <span className="text-[var(--color-primary)]">Category</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Loading categories...</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="w-[140px] h-[140px] bg-white rounded-2xl border border-gray-100 shadow-sm" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-[var(--color-body)]'>
      <div className="max-w-7xl mx-auto px-4 py-16 bg-[var(--color-body)]">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Shop by <span className="text-[var(--color-primary)]">Category</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Browse through our carefully curated furniture categories
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-6">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => handleCategoryClick(category.name)}
              whileHover={{ y: -5, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative"
            >
              <div className="relative group flex flex-col items-center justify-center p-4 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all duration-300 w-[140px] h-[140px] shrink-0">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 shrink-0 overflow-hidden`}>
                  <div className="text-white text-2xl w-full h-full flex items-center justify-center">
                    {category.icon}
                  </div>
                </div>

                <div className="h-10 flex items-center justify-center">
                  <span className="text-[12px] sm:text-sm font-semibold text-gray-800 group-hover:text-[var(--color-primary)] transition-colors text-center leading-tight line-clamp-2">
                    {category.name}
                  </span>
                </div>

                {(category.isNew || category.isDeal) && (
                  <div className={`absolute -top-1 -right-1 ${category.isDeal ? 'bg-red-500' : 'bg-[var(--color-primary)]'} text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm`}>
                    {category.isDeal ? 'HOT' : 'NEW'}
                  </div>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Category;