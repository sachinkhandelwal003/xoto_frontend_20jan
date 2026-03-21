import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FiEye,
  FiShoppingCart,
  FiHeart,
  FiShare2,
  FiStar,
} from "react-icons/fi";
import { MdLocalOffer } from "react-icons/md";
import { motion } from "framer-motion";
import { apiService } from "../../manageApi/utils/custom.apiservice";
import { useProducts } from "../../context/ProductContext";
import { toast } from "react-toastify";

/* ------------------ PRODUCT CARD ------------------ */
const ProductCard = ({ product, onAddToCart, adding }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);

  const mainImage = product.photos?.[0] || "https://placehold.co/800";

  const discount =
    product.price > 0 && product.discountedPrice > 0 &&
    product.price > product.discountedPrice
      ? Math.round((1 - product.discountedPrice / product.price) * 100)
      : 0;

  // ✅ Name truncate — 2 lines max
  const truncate = (str, n) =>
    str?.length > n ? str.slice(0, n) + "..." : str;

  return (
    <div className="relative bg-white rounded-xl overflow-hidden border border-gray-100 
                    hover:shadow-xl transition-all duration-300 flex flex-col h-full">

      {/* TAGS */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {product.isFeatured && (
          <span className="bg-purple-600 text-white px-2 py-0.5 text-xs font-bold rounded">
            FEATURED
          </span>
        )}
        {discount > 0 && (
          <span className="bg-red-500 text-white px-2 py-0.5 text-xs font-bold flex items-center gap-1 rounded">
            <MdLocalOffer /> {discount}% OFF
          </span>
        )}
      </div>

      {/* ACTIONS */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="bg-white p-1.5 rounded-full shadow hover:shadow-md transition"
        >
          <FiHeart
            size={16}
            className={isLiked ? "text-red-500 fill-red-500" : "text-gray-500"}
          />
        </button>
        <button className="bg-white p-1.5 rounded-full shadow hover:shadow-md transition">
          <FiShare2 size={16} className="text-gray-500" />
        </button>
      </div>

      {/* IMAGE — fixed height */}
      <div
        className="h-52 bg-gray-100 cursor-pointer overflow-hidden flex-shrink-0"
        onClick={() => navigate(`/ecommerce/product/${product._id}`)}
      >
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition duration-300"
        />
      </div>

      {/* CONTENT */}
      <div className="p-4 flex flex-col flex-1">

        {/* Category + Rating */}
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-400 uppercase tracking-wide truncate max-w-[120px]">
            {product.category?.name || "—"}
          </span>
          <div className="flex items-center text-amber-400 flex-shrink-0">
            <FiStar size={12} className="fill-current" />
            <span className="ml-1 text-xs font-semibold text-gray-600">4.8</span>
          </div>
        </div>

        {/* Product Name — fixed 2 lines */}
        <h3 className="font-bold text-gray-800 text-sm leading-snug mb-1 line-clamp-2 min-h-[40px]">
          {product.name}
        </h3>

        {/* Brand */}
        <p className="text-xs text-gray-400 mb-3 truncate">
          {product.brandName?.brandName || "—"} · {product.originCountry || "UAE"}
        </p>

        {/* Price */}
        <div className="mb-4 mt-auto">
          {product.discountedPrice > 0 ? (
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-purple-700">
                AED {Number(product.discountedPrice).toFixed(2)}
              </span>
              {discount > 0 && (
                <span className="text-sm line-through text-gray-400">
                  AED {Number(product.price).toFixed(2)}
                </span>
              )}
            </div>
          ) : (
            <span className="text-xl font-bold text-purple-700">
              AED {Number(product.price).toFixed(2)}
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.04 }}
            onClick={() => navigate(`/ecommerce/product/${product._id}`)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2.5 
                       rounded-lg flex items-center gap-1.5 text-sm font-medium
                       transition duration-200 flex-shrink-0"
          >
            <FiEye size={14} /> View
          </motion.button>

          <motion.button
            whileHover={{ scale: adding ? 1 : 1.04 }}
            disabled={adding}
            onClick={() => onAddToCart(product)}
            className={`flex-1 px-3 py-2.5 rounded-lg flex items-center justify-center 
                        gap-1.5 text-sm font-medium transition duration-200
                        ${adding
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-gray-900 hover:bg-black text-white"
                        }`}
          >
            {adding ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent 
                                rounded-full animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <FiShoppingCart size={14} /> Add to Cart
              </>
            )}
          </motion.button>
        </div>

      </div>
    </div>
  );
};

/* ------------------ MAIN COMPONENT ------------------ */
const Products = () => {
  const { t } = useTranslation("ecommerce");
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const { user, token } = useSelector((state) => state.auth);

  const [addingId, setAddingId] = useState(null);

  /* -------- ADD TO CART -------- */
  const handleAddToCart = async (product) => {

    // ✅ Login check
    if (!token || !user) {
      toast.error("Please login to add items to cart");
      navigate("/user/login");
      return;
    }

    setAddingId(product._id);

    try {
      const payload = {
        productId: product._id,
        customerId: user._id || user.id,
        price: product.discountedPrice > 0
          ? product.discountedPrice
          : product.price,
        quantity: 1,
      };

      // Color attach karo agar hai
      if (product.ProductColors?.[0]?._id) {
        payload.productColorId = product.ProductColors[0]._id;
      }

      await apiService.post("/products/cart/add", payload);

      toast.success("Added to cart! 🛒");

    } catch (err) {
      toast.error(err?.message || "Failed to add to cart");
    } finally {
      setAddingId(null);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent 
                          rounded-full animate-spin" />
          <p className="text-purple-600 font-semibold">Loading XOTO...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">

      {/* HERO */}
      <section className="py-24 relative text-white text-center">
        <img
          src="https://images.unsplash.com/photo-1618220179428-22790b461013"
          className="absolute inset-0 w-full h-full object-cover"
          alt="hero"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10">
          <h1 className="text-4xl font-bold">
            {t("experience.title.prefix")}{" "}
            <span className="text-purple-400">
              {t("experience.title.brand")}
            </span>{" "}
            {t("experience.title.suffix")}
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/ecommerce/filter")}
            className="mt-8 px-10 py-4 bg-purple-600 hover:bg-purple-700 
                       rounded-xl font-bold transition duration-200"
          >
            Shop Now
          </motion.button>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold uppercase">New Arrivals</h2>
          <button
            onClick={() => navigate("/ecommerce/cart")}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 
                       text-white px-5 py-2.5 rounded-xl font-medium transition duration-200"
          >
            <FiShoppingCart /> View Cart
          </button>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-xl font-medium">No products available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                adding={addingId === product._id}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default Products;