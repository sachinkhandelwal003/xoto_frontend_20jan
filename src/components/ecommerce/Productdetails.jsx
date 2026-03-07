import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiService } from "../../manageApi/utils/custom.apiservice";
import {
  FaChevronLeft,
  FaChevronRight,
  FaShoppingCart,
  FaShoppingBag,
  FaStar,
  FaPlus,
  FaMinus,
  FaShieldAlt,
  FaSyncAlt,
  FaInfoCircle,
  FaTools
} from "react-icons/fa";

import { motion, AnimatePresence } from "framer-motion";
import { message } from "antd";

/* ---------- COLOR MAP ---------- */
const COLOR_MAP = {
  "Natural Oak": "#D2B48C",
  "Walnut Brown": "#5D4037",
  "White Wash": "#F5F5F5",
  "Black": "#000000",
  "Grey": "#808080",
  "Beige": "#F5F5DC",
  "Beige/White": "#F5F5DC",
};

const ProductDetails = () => {

  const { id } = useParams();
  const navigate = useNavigate();

  /* ---------- STATES ---------- */

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState("");

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [expandedSection, setExpandedSection] = useState("description");

  const [selectedVariant, setSelectedVariant] = useState(0);
  const [adding, setAdding] = useState(false);

  const CUSTOMER_ID = "65f1aa88e8b4f12a9c654321";

  /* ---------- FETCH PRODUCT ---------- */

  useEffect(() => {

    const fetchProduct = async () => {

      try {

        setLoading(true);

        const res = await apiService.get(
          "/products/get-product-by-id",
          { id }
        );

        if (res?.success) {
          setProduct(res.data);
        } else {
          message.error("Product not found");
        }

      } catch (err) {

        console.error(err);
        message.error("Failed to load product");

      } finally {

        setLoading(false);

      }

    };

    if (id) fetchProduct();

  }, [id]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center text-purple-600 font-bold">
        Loading Product...
      </div>
    );

  if (!product)
    return (
      <div className="h-screen flex items-center justify-center">
        Product Not Found
      </div>
    );

  /* ---------- DERIVED DATA ---------- */

  const variantImages =
    product.ProductColors?.[selectedVariant]?.photos || [];

  const images = variantImages.length > 0
    ? variantImages
    : product.photos;

  const originalPrice = product.price;
  const salePrice = product.salePrice;
  const discountPercent = product.marginValue;

  /* ---------- ACTIONS ---------- */

  const handleAddToCart = async () => {

    if (!pincode) {
      message.warning("Please enter pincode");
      return;
    }

    try {

      setAdding(true);

      const totalPrice = salePrice * quantity;

      const payload = {
        productId: product._id,
        customerId: CUSTOMER_ID,
        productColorId: product.ProductColors?.[selectedVariant]?._id,
        price: totalPrice,
        quantity,
        pincode
      };

      await apiService.post(
        "/products/add-to-cart-by-customer",
        payload
      );

      message.success(
        `${quantity} item(s) added | Total: AED ${totalPrice.toFixed(2)}`
      );

    } catch (err) {

      message.error(
        err.response?.data?.message || "Add to cart failed"
      );

    } finally {

      setAdding(false);

    }

  };

  const toggleSection = (key) =>
    setExpandedSection((prev) =>
      prev === key ? null : key
    );

  return (

    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-4 py-10">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* IMAGE SECTION */}

          <div>

            <div className="relative aspect-square bg-white rounded-xl overflow-hidden shadow-sm">

              <AnimatePresence mode="wait">

                <motion.img
                  key={images[activeImageIndex]}
                  src={images[activeImageIndex]}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full object-contain p-4"
                />

              </AnimatePresence>

              <button
                onClick={() =>
                  setActiveImageIndex((i) =>
                    i === 0 ? images.length - 1 : i - 1
                  )
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-3 rounded-full shadow-md"
              >
                <FaChevronLeft />
              </button>

              <button
                onClick={() =>
                  setActiveImageIndex((i) =>
                    i === images.length - 1 ? 0 : i + 1
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-3 rounded-full shadow-md"
              >
                <FaChevronRight />
              </button>

              {discountPercent > 0 && (
                <div className="absolute top-4 left-4">
                  <span className="bg-red-500 text-white px-3 py-1 text-sm font-bold rounded">
                    {discountPercent}% OFF
                  </span>
                </div>
              )}

            </div>

            <div className="flex gap-3 mt-4 overflow-x-auto pb-2">

              {images.map((img, idx) => (

                <img
                  key={idx}
                  src={img}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 ${
                    idx === activeImageIndex
                      ? "border-purple-600"
                      : "border-transparent"
                  }`}
                />

              ))}

            </div>

          </div>

          {/* DETAILS */}

          <div className="space-y-6">

            <div>

              <p className="text-purple-600 font-semibold uppercase text-sm">
                {product.brandName?.brandName}
              </p>

              <h1 className="text-4xl font-bold text-gray-900 mt-1">
                {product.name}
              </h1>

              <p className="text-gray-500 mt-2">
                Category: {product.category?.name}
              </p>

            </div>

            <div className="flex items-center gap-4">

              <div className="flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                4.8 <FaStar className="ml-1" />
              </div>

              <span className="text-gray-600 text-sm font-medium">
                {product.quantity > 0
                  ? `In Stock (${product.quantity})`
                  : "Out of Stock"}
              </span>

            </div>

            <div className="bg-white p-6 rounded-2xl border shadow-sm">

              <div className="flex items-baseline gap-3">

                <span className="text-4xl font-black">
                  {product.currency} {salePrice}
                </span>

                {originalPrice > salePrice && (
                  <span className="text-xl line-through text-gray-400">
                    {product.currency} {originalPrice}
                  </span>
                )}

              </div>

              <p className="text-sm text-green-600 mt-1">
                Inclusive of all taxes
              </p>

            </div>

            {/* ADD TO CART */}

            <button
              disabled={adding}
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700"
            >
              <FaShoppingCart />
              {adding ? "Adding..." : "Add to Cart"}
            </button>

          </div>

        </div>

      </div>

    </div>

  );

};

export default ProductDetails;