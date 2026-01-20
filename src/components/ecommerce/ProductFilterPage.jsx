import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Tag, Button, Typography, Affix, Drawer } from 'antd';
import { VideoCameraOutlined, StarFilled, FilterOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import Filters from './Filters';
import ProductGrid from './ProductGrid';

const { Content } = Layout;

const ProductFilterPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);

  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sortOption, setSortOption] = useState('most-popular');

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  const BASE_URL = "https://xoto.ae";

  // Fetch Metadata (Categories + Brands)
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          fetch(`${BASE_URL}/api/products/get-all-category?limit=100`),
          fetch(`${BASE_URL}/api/products/get-all-brand?limit=100`)
        ]);
        const catJson = await catRes.json();
        const brandJson = await brandRes.json();

        if (catJson.success) setCategories(catJson.data);
        if (brandJson.success) setBrands(brandJson.data);
      } catch (err) {
        console.error("Metadata fetch error:", err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch Products with filters
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      let query = `${BASE_URL}/api/products/get-all-products?page=1&limit=20`;

      if (selectedCategories.length > 0) query += `&category_id=${selectedCategories.join(',')}`;
      if (selectedBrands.length > 0) query += `&brand_id=${selectedBrands.join(',')}`;
      if (priceRange[0] > 0) query += `&min_price=${priceRange[0]}`;
      if (priceRange[1] < 50000) query += `&max_price=${priceRange[1]}`;

      const res = await fetch(query);
      const json = await res.json();
      if (json.success) {
        setProducts(json.data.products);
      }
    } catch (err) {
      console.error("Product fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategories, selectedBrands, priceRange]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange([0, 50000]);
  };

  // Responsive check (you can also use useMediaQuery hook if you want)
  const isMobile = window.innerWidth < 992;

  return (
    <Layout style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <Content style={{ padding: '0 12px sm:0 16px md:0 24px' }}>

        {/* ────────────── HERO BANNER ────────────── */}
        <div
          className="relative rounded-xl sm:rounded-2xl overflow-hidden mb-6 sm:mb-8 mt-4 sm:mt-6 shadow-xl sm:shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #420183ff 0%, #764ba2 100%)',
            height: isMobile ? '260px' : '340px md:400px',
          }}
        >
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
            <Tag
              color="gold"
              style={{
                fontSize: isMobile ? '12px' : '14px',
                fontWeight: 'bold',
                padding: isMobile ? '3px 10px' : '4px 12px'
              }}
            >
              New Collection
            </Tag>
          </div>

          <div className="relative z-10 h-full flex flex-col md:flex-row items-center justify-between p-6 sm:p-8 md:p-16">
            <div className="max-w-2xl text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 md:mb-4">
                  Discover Your <span className="text-yellow-300">Perfect</span> Space
                </h1>
                <p className={`text-base ${isMobile ? 'sm:text-lg' : 'md:text-xl'} text-white/90 mb-6 md:mb-8 max-w-xl mx-auto md:mx-0`}>
                  AI-curated furniture collections that blend modern design with timeless elegance.
                  Transform your home with pieces that tell your story.
                </p>

                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <Button
                    size="large"
                    className="!bg-white !text-black font-bold px-6 sm:px-8 h-10 sm:h-12 rounded-lg border-2 border-transparent transition-all duration-300 ease-out hover:!bg-transparent hover:!backdrop-blur-md hover:!text-white hover:!border-white"
                  >
                    Shop New Arrivals
                  </Button>

                  <div className="relative inline-block">
                    <span className="absolute -top-3 -right-2 bg-gray-500 text-white text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded-full shadow-md z-10">
                      Upcoming
                    </span>
                    <Button
                      size="large"
                      disabled
                      className="!bg-white/10 !border-2 !border-white/30 !text-white font-bold px-6 sm:px-8 h-10 sm:h-12 rounded-lg backdrop-blur-md"
                    >
                      <VideoCameraOutlined className="mr-1 sm:mr-2" />
                      AR Preview
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Featured Image - only on large screens */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-64 h-64 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl opacity-50"></div>
                <img
                  src="https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500&auto=format&fit=crop"
                  alt="Featured Furniture"
                  className="relative w-72 h-72 object-cover rounded-2xl shadow-2xl"
                  style={{ transform: 'rotate(3deg)' }}
                />
                <div
                  className="absolute -bottom-4 -right-4 bg-white p-4 rounded-xl shadow-2xl"
                  style={{ transform: 'rotate(-2deg)' }}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">4.8</div>
                    <div className="flex items-center justify-center">
                      {[...Array(5)].map((_, i) => (
                        <StarFilled key={i} className="text-yellow-500 text-sm" />
                      ))}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Customer Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ────────────── MAIN CONTENT ────────────── */}
        <div className="relative">
          {/* Desktop Sidebar (only visible on large screens) */}
          {showFilters && !isMobile && (
            <div className="hidden lg:block lg:sticky lg:top-4 lg:w-72 lg:pr-6">
              <Filters
                categories={categories}
                brands={brands}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                selectedBrands={selectedBrands}
                setSelectedBrands={setSelectedBrands}
                mobileFiltersOpen={mobileFiltersOpen}
                setMobileFiltersOpen={setMobileFiltersOpen}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                resetFilters={resetFilters}
              />
            </div>
          )}

          {/* Product Grid - full width on mobile or when filters hidden */}
          <div className={`${showFilters && !isMobile ? 'lg:ml-72' : ''} transition-all duration-300`}>
            <ProductGrid
              products={products}
              loading={loading}
              showFilters={showFilters}
              sortOption={sortOption}
              setSortOption={setSortOption}
            />
          </div>

          {/* Mobile Filters Drawer */}
          <Drawer
            title="Filters"
            placement="left"
            onClose={() => setMobileFiltersOpen(false)}
            open={mobileFiltersOpen}
            width="85%"
          >
            <Filters
              categories={categories}
              brands={brands}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              selectedBrands={selectedBrands}
              setSelectedBrands={setSelectedBrands}
              mobileFiltersOpen={mobileFiltersOpen}
              setMobileFiltersOpen={setMobileFiltersOpen}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              resetFilters={resetFilters}
            />
          </Drawer>

          {/* Floating filter button (mobile + when sidebar hidden on desktop) */}
          {(isMobile || !showFilters) && (
            <Affix offsetBottom={24}>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Button
                  type="primary"
                  size="large"
                  icon={<FilterOutlined />}
                  onClick={() => {
                    if (isMobile) {
                      setMobileFiltersOpen(true);
                    } else {
                      setShowFilters(true);
                    }
                  }}
                  style={{
                    height: 52,
                    borderRadius: 50,
                    boxShadow: '0 4px 20px rgba(92, 3, 155, 0.3)',
                    background: '#5C039B',
                    border: 'none',
                    fontWeight: 600,
                    padding: '0 20px',
                  }}
                >
                  {isMobile ? "Filters" : "Show Filters"}
                </Button>
              </motion.div>
            </Affix>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default ProductFilterPage;