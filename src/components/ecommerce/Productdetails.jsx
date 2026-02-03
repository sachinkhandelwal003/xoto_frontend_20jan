import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaChevronLeft,
  FaChevronRight,
  FaShoppingCart,
  FaShoppingBag,
  FaStar,
  FaPlus,
  FaMinus,
  FaCube,
  FaTruck,
  FaShieldAlt,
  FaSyncAlt,
  FaCreditCard,
  FaBoxOpen
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheck } from "react-icons/fi";
import { message } from "antd";

/* ---------- COLOR MAP ---------- */
const COLOR_MAP = {
  "Natural Oak": "#D2B48C",
  "Walnut Brown": "#5D4037",
  "White Wash": "#F5F5F5",
  "Black": "#000000",
  "Grey": "#808080",
  "Beige": "#F5F5DC",
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
  const [expandedSection, setExpandedSection] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [adding, setAdding] = useState(false);

  /* ---------- CONSTANTS ---------- */
  const BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "https://xoto.ae";

  const CUSTOMER_ID = "65f1aa88e8b4f12a9c654321";

  /* ---------- FETCH PRODUCT ---------- */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${BASE_URL}/api/products/get-product-by-id?id=${id}`
        );

        if (res.data?.success) {
          setProduct(res.data.data);
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
  const images =
    variantImages.length > 0 ? variantImages : product.photos;

  const price = product.price;
  const salePrice = product.discountedPrice;
  const discountPercent = Math.round(
    ((price - salePrice) / price) * 100
  );

  /* ---------- ADD TO CART (POST API) ---------- */
  const handleAddToCart = async () => {
  if (!pincode) {
    message.warning("Please enter pincode");
    return;
  }

  try {
    setAdding(true);

    const unitPrice = product.discountedPrice;
    const totalPrice = unitPrice * quantity; // 🔥 MULTIPLIED PRICE

    const payload = {
      productId: product._id,
      customerId: CUSTOMER_ID,
      productColorId: product.ProductColors?.[selectedVariant]?._id,
      price: totalPrice,        // ✅ multiplied amount
      quantity: quantity,       // ✅ actual quantity
      pincode: pincode,
    };

    const res = await axios.post(
      `${BASE_URL}/api/products/add-to-cart-by-customer`,
      payload,
      { headers: { "Content-Type": "application/json" } }
    );

    console.log("ADD TO CART RESPONSE ✅", res.data);

    message.success(
      `${quantity} item(s) added | Total: AED ${totalPrice}`
    );
  } catch (err) {
    console.error(err);
    message.error(
      err.response?.data?.message || "Add to cart failed"
    );
  } finally {
    setAdding(false);
  }
};


  const toggleSection = (key) =>
    setExpandedSection((prev) => (prev === key ? null : key));

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* IMAGE SECTION */}
          <div>
            <div className="relative aspect-[4/3] bg-white rounded-xl overflow-hidden shadow">
              <img
                src={images[activeImageIndex]}
                className="w-full h-full object-cover"
              />

              <button
                onClick={() =>
                  setActiveImageIndex((i) =>
                    i === 0 ? images.length - 1 : i - 1
                  )
                }
                className="absolute left-4 top-1/2 bg-white p-2 rounded-full"
              >
                <FaChevronLeft />
              </button>

              <button
                onClick={() =>
                  setActiveImageIndex((i) =>
                    i === images.length - 1 ? 0 : i + 1
                  )
                }
                className="absolute right-4 top-1/2 bg-white p-2 rounded-full"
              >
                <FaChevronRight />
              </button>

              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-red-500 text-white px-3 py-1 text-xs rounded">
                  {discountPercent}% OFF
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 object-cover rounded cursor-pointer border ${
                    idx === activeImageIndex
                      ? "border-purple-600"
                      : "border-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* DETAILS */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">{product.name}</h1>

            <div className="flex items-center gap-2">
              <span className="bg-purple-600 text-white px-2 py-1 rounded text-sm">
                4.8 <FaStar className="inline ml-1" />
              </span>
              <span className="text-gray-500 text-sm">
                Premium Quality
              </span>
            </div>

            <div className="bg-purple-50 p-5 rounded-xl">
              <div className="flex items-end gap-4">
                <span className="text-4xl font-bold">
                  AED {salePrice}
                </span>
                <span className="line-through text-gray-400">
                  AED {price}
                </span>
              </div>
            </div>

            {/* COLOR SELECT */}
            {product.ProductColors?.length > 0 && (
              <div>
                <p className="font-bold mb-3">Select Color</p>
                <div className="flex gap-4">
                  {product.ProductColors.map((c, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedVariant(idx);
                        setActiveImageIndex(0);
                      }}
                      className={`w-12 h-12 rounded ${
                        selectedVariant === idx
                          ? "ring-2 ring-black"
                          : ""
                      }`}
                      style={{
                        backgroundColor:
                          COLOR_MAP[c.colourName] || "#ddd",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ACTIONS */}
            <div className="flex items-center gap-4">
              <div className="flex border rounded">
                <button
                  onClick={() =>
                    setQuantity((q) => Math.max(1, q - 1))
                  }
                  className="p-3"
                >
                  <FaMinus />
                </button>
                <span className="px-4 font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-3"
                >
                  <FaPlus />
                </button>
              </div>

              <input
                type="text"
                placeholder="Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="border px-4 py-3 rounded w-40"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                disabled={adding}
                onClick={handleAddToCart}
                className={`py-4 rounded font-bold text-white ${
                  adding ? "bg-gray-400" : "bg-purple-600"
                }`}
              >
                <FaShoppingCart /> Add to Cart
              </button>

              <button className="py-4 rounded font-bold bg-black text-white">
                <FaShoppingBag /> Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
