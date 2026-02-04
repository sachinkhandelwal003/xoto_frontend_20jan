import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  FiEye,
  FiShoppingCart,
  FiHeart,
  FiShare2,
  FiStar,
} from "react-icons/fi";
import { MdLocalOffer } from "react-icons/md";
import { motion } from "framer-motion";
import axios from "axios";
import { useProducts } from "../../context/ProductContext";

/* ------------------ PRODUCT CARD ------------------ */
const ProductCard = ({ product, onAddToCart, adding }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);

  const mainImage = product.photos?.[0] || "https://placehold.co/800";
  const discount =
    product.price > product.discountedPrice
      ? Math.round((1 - product.discountedPrice / product.price) * 100)
      : 0;

  return (
    <div className="bg-white rounded-xl overflow-hidden border hover:shadow-2xl transition h-full">
      {/* TAGS */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {product.isFeatured && (
          <span className="bg-purple-600 text-white px-3 py-1 text-xs font-bold rounded">
            FEATURED
          </span>
        )}
        {discount > 0 && (
          <span className="bg-red-500 text-white px-3 py-1 text-xs font-bold flex items-center gap-1 rounded">
            <MdLocalOffer /> {discount}% OFF
          </span>
        )}
      </div>

      {/* ACTIONS */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="bg-white p-2 rounded shadow"
        >
          <FiHeart
            className={isLiked ? "text-red-500 fill-red-500" : "text-gray-600"}
          />
        </button>
        <button className="bg-white p-2 rounded shadow">
          <FiShare2 />
        </button>
      </div>

      {/* IMAGE */}
      <div
        className="h-64 bg-gray-100 cursor-pointer"
        onClick={() => navigate(`/ecommerce/product/${product._id}`)}
      >
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-110 transition"
        />
      </div>

      {/* CONTENT */}
      <div className="p-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-500 uppercase">
            {product.category?.name}
          </span>
          <div className="flex items-center text-amber-500">
            <FiStar className="fill-current" />
            <span className="ml-1 text-sm font-semibold">4.8</span>
          </div>
        </div>

        <h3 className="font-bold text-lg mb-2">{product.name}</h3>

        <p className="text-sm text-gray-500 mb-4">
          {product.brandName?.brandName} | {product.originCountry || "UAE"}
        </p>

        <div className="mb-5">
          <span className="text-2xl font-bold">
            AED {product.discountedPrice}
          </span>
          <span className="ml-2 text-sm line-through text-gray-400">
            AED {product.price}
          </span>
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate(`/ecommerce/product/${product._id}`)}
            className="bg-purple-600 text-white px-4 py-3 rounded flex items-center gap-2"
          >
            <FiEye /> View
          </motion.button>

          <motion.button
            whileHover={{ scale: adding ? 1 : 1.05 }}
            disabled={adding}
            onClick={() => onAddToCart(product)}
            className={`flex-1 px-4 py-3 rounded flex items-center justify-center gap-2 ${
              adding
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gray-900 hover:bg-black"
            } text-white`}
          >
            {adding ? "Adding..." : <><FiShoppingCart /> Add</>}
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

  const [addingId, setAddingId] = useState(null);
  const [toast, setToast] = useState(false);

  // ✅ SAFE BASE URL (NO ENV BREAK)
  const BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "htps://xoto.ae";

  const CUSTOMER_ID = "65f1aa88e8b4f12a9c654321";
  const PINCODE = "305001";

  /* -------- ADD TO CART (POST) -------- */
  const handleAddToCart = async (product) => {
    setAddingId(product._id);

    try {
      const payload = {
        productId: product._id,
        customerId: CUSTOMER_ID,
        price: product.discountedPrice,
        quantity: 1,
        pincode: PINCODE,
      };

      // send color only if exists
      if (product.colors?.[0]?._id) {
        payload.productColorId = product.colors[0]._id;
      }

      const res = await axios.post(
        `${BASE_URL}/api/products/add-to-cart-by-customer`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("ADD TO CART SUCCESS ✅", res.data);
      setToast(true);
      setTimeout(() => setToast(false), 2500);
    } catch (err) {
      console.error("ADD TO CART ERROR ❌", err.response?.data || err);
      alert(err.response?.data?.message || "Add to cart failed");
    } finally {
      setAddingId(null);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-purple-600 font-bold text-xl">
        Loading XOTO...
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {toast && (
        <div className="fixed top-6 right-6 bg-green-600 text-white px-6 py-4 rounded shadow-xl z-50">
          Item added to cart!
        </div>
      )}

      {/* HERO */}
      <section className="py-24 relative text-white text-center">
        <img
          src="https://images.unsplash.com/photo-1618220179428-22790b461013"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10">
          <h1 className="text-4xl font-bold">
            {t("experience.title.prefix")}{" "}
            <span className="text-purple-500">
              {t("experience.title.brand")}
            </span>{" "}
            {t("experience.title.suffix")}
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/ecommerce/filter")}
            className="mt-8 px-10 py-4 bg-purple-600 rounded font-bold"
          >
            Shop Now
          </motion.button>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-8 uppercase">New Arrivals</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.slice(0, 8).map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              adding={addingId === product._id}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Products;
