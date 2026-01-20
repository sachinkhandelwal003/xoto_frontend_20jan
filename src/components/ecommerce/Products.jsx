import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { 
  FiEye, FiShoppingCart, FiHeart, 
  FiShare2, FiStar, FiChevronLeft, FiChevronRight 
} from "react-icons/fi";
import { MdLocalOffer } from "react-icons/md";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { motion } from 'framer-motion';
import { useProducts } from "../../context/ProductContext"; // Context API Logic

// Custom Arrows (UI Same)
const NextArrow = ({ onClick }) => (
  <button onClick={onClick} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-[var(--color-primary)] p-3 rounded-md text-white shadow-lg hover:opacity-90 transition-all">
    <FiChevronRight className="text-xl" />
  </button>
);

const PrevArrow = ({ onClick }) => (
  <button onClick={onClick} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-[var(--color-primary)] p-3 rounded-md text-white shadow-lg hover:opacity-90 transition-all">
    <FiChevronLeft className="text-xl" />
  </button>
);

// Product Card Component (Mapping API Fields to Your UI)
const ProductCard = ({ product, onAddToCart }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  
  const mainImage = product.photos?.[0] || "https://placehold.co/800";
  const discount = product.price > product.discountedPrice ? Math.round((1 - product.discountedPrice / product.price) * 100) : 0;
  
  return (
    <div className="group relative bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 h-full">
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {product.isFeatured && <span className="bg-[var(--color-primary)] text-white px-3 py-1 rounded-md text-xs font-bold uppercase">FEATURED</span>}
        {discount > 0 && <span className="bg-red-500 text-white px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1"><MdLocalOffer className="text-xs" /> {discount}% OFF</span>}
      </div>

      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        <button onClick={() => setIsLiked(!isLiked)} className="bg-white p-2 rounded-md shadow-md hover:bg-gray-50 transition-all">
          <FiHeart className={`text-lg ${isLiked ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
        </button>
        <button className="bg-white p-2 rounded-md shadow-md hover:bg-gray-50 transition-all">
          <FiShare2 className="text-lg text-gray-600" />
        </button>
      </div>

      <div className="h-64 bg-gray-100 overflow-hidden cursor-pointer" onClick={() => navigate(`/ecommerce/product/${product._id}`)}>
        <img src={mainImage} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500 uppercase">{product.category?.name}</span>
          <div className="flex items-center text-amber-500">
            <FiStar className="fill-current" />
            <span className="ml-1 text-sm font-semibold">4.8</span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.brandName?.brandName} | {product.originCountry || 'UAE'}</p>

        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-2xl font-bold text-gray-900">AED{product.discountedPrice}</span>
            <span className="ml-2 text-sm text-gray-400 line-through">AED{product.price}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate(`/ecommerce/product/${product._id}`)} className="bg-[var(--color-primary)] text-white font-semibold py-3 px-2 rounded-md hover:opacity-90 transition-all flex items-center justify-center gap-2">
            <FiEye /> View
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onAddToCart(product)} className="flex-1 bg-gray-900 text-white py-3 rounded-md hover:bg-black transition-all flex items-center justify-center gap-2">
            <FiShoppingCart /> Add
          </motion.button>
        </div>
      </div>
    </div>
  );
};

const Products = () => {
  const { t } = useTranslation("ecommerce");
  const navigate = useNavigate();
  const { products, loading } = useProducts(); // API Data
  const [showCartNotification, setShowCartNotification] = useState(false);

  // --- SECTIONS LOGIC ---
  const newArrivals = products.slice(0, 4);
  const latestCollection = products.slice(4, 8).length > 0 ? products.slice(4, 8) : products.slice(0, 4);
  const electronicsProducts = products.filter(p => p.category?.name === "ELECTRONICS").slice(0, 4);
  const completeCollection = products.slice(0, 8); // Complete Collection Section Data

  const handleAddToCart = () => {
    setShowCartNotification(true);
    setTimeout(() => setShowCartNotification(false), 3000);
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-[#7c3aed] font-bold text-xl uppercase tracking-widest italic">Loading XOTO...</div>;

  return (
    <div className="bg-gray-50">
      {showCartNotification && (
        <div className="fixed top-6 right-6 z-50">
          <div className="bg-green-600 text-white px-6 py-4 rounded-md shadow-2xl flex items-center gap-3">
            <span className="font-semibold">Item added successfully!</span>
          </div>
        </div>
      )}

      {/* Hero Banner (Same Design) */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=2070&q=80" alt="Hero" className="w-full h-full object-cover transform scale-110" />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <h1 className="heading-light">{t("experience.title.prefix")} <span className="text-[var(--color-primary)]">{t("experience.title.brand")}</span> {t("experience.title.suffix")}</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">{t("experience.subtitle")}</p>
          <motion.button whileHover={{ scale: 1.05 }} onClick={() => navigate("/ecommerce/filter")} className="px-10 py-4 bg-[var(--color-primary)] text-white text-lg font-bold rounded-md">Shop Now</motion.button>
        </div>
      </section>

      {/* Row 1: New Arrivals (Grid) */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 uppercase border-l-4 border-[var(--color-primary)] pl-4">New Arrivals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {newArrivals.map((product) => <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />)}
          </div>
        </div>
      </section>

      {/* Row 2: Latest Collection (Grid) */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 uppercase border-l-4 border-[var(--color-primary)] pl-4">Latest Collection</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {latestCollection.map((product) => <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />)}
          </div>
        </div>
      </section>

      {/* Row 3: Electronics (Grid) */}
      {electronicsProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 uppercase border-l-4 border-[var(--color-primary)] pl-4">Electronics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {electronicsProducts.map((product) => <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />)}
            </div>
          </div>
        </section>
      )}

      {/* Row 4: Complete Collection (Real API Data Map) */}
      <section className="py-16 bg-white border-t">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Browse Our <span className="text-[var(--color-primary)]">Complete</span> Collection</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Discover furniture for every room, style, and budget</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {completeCollection.map((product) => (
              <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>

          <motion.button whileHover={{ scale: 1.05 }} onClick={() => navigate('/ecommerce/filter')} className="px-10 py-4 bg-[var(--color-primary)] text-white font-bold rounded-md">
            View All Products
          </motion.button>
        </div>
      </section>
    </div>
  );
};

export default Products;