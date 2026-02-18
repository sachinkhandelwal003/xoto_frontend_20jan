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
  "Beige/White": "#F5F5DC", // Added based on your product data
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

  /* ---------- CONSTANTS ---------- */
  const BASE_URL ="https://xoto.ae";
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
//now 
    if (id) fetchProduct();
  }, [id, BASE_URL]);

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
  // Handle primary photo and variant photos
  const variantImages = product.ProductColors?.[selectedVariant]?.photos || [];
  const images = variantImages.length > 0 ? variantImages : product.photos;

  // Price Calculation from your specific JSON
  const originalPrice = product.price;
  const salePrice = product.salePrice; // This is the 493.9 from your JSON
  const discountPercent = product.marginValue; // Using the margin/discount field

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
        quantity: quantity,
        pincode: pincode,
      };

      await axios.post(
        `${BASE_URL}/api/products/add-to-cart-by-customer`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      message.success(`${quantity} item(s) added | Total: AED ${totalPrice.toFixed(2)}`);
    } catch (err) {
      message.error(err.response?.data?.message || "Add to cart failed");
    } finally {
      setAdding(false);
    }
  };

  const toggleSection = (key) =>
    setExpandedSection((prev) => (prev === key ? null : key));

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
                onClick={() => setActiveImageIndex((i) => (i === 0 ? images.length - 1 : i - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-md transition-all"
              >
                <FaChevronLeft />
              </button>

              <button
                onClick={() => setActiveImageIndex((i) => (i === images.length - 1 ? 0 : i + 1))}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-md transition-all"
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
                  className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 transition-all ${
                    idx === activeImageIndex ? "border-purple-600 scale-105" : "border-transparent opacity-70"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* DETAILS SECTION */}
          <div className="space-y-6">
            <div>
              <p className="text-purple-600 font-semibold tracking-wide uppercase text-sm">
                {product.brandName?.brandName}
              </p>
              <h1 className="text-4xl font-bold text-gray-900 mt-1">{product.name}</h1>
              <p className="text-gray-500 mt-2">Category: {product.category?.name}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                4.8 <FaStar className="ml-1" />
              </div>
              <span className="text-gray-400">|</span>
              <span className="text-sm text-gray-600 font-medium">
                {product.quantity > 0 ? `In Stock (${product.quantity} units)` : "Out of Stock"}
              </span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-gray-900">
                  {product.currency} {salePrice}
                </span>
                {originalPrice > salePrice && (
                  <span className="text-xl text-gray-400 line-through">
                    {product.currency} {originalPrice}
                  </span>
                )}
              </div>
              <p className="text-sm text-green-600 mt-1 font-medium">Inclusive of all taxes</p>
            </div>

            {/* COLOR VARIANT SELECTOR */}
            {product.ProductColors?.length > 0 && (
              <div>
                <p className="font-bold text-gray-800 mb-3">Available Colors</p>
                <div className="flex gap-4">
                  {product.ProductColors.map((c, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedVariant(idx);
                        setActiveImageIndex(0);
                      }}
                      title={c.colourName}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedVariant === idx ? "border-purple-600 scale-110 shadow-lg" : "border-gray-200"
                      }`}
                      style={{ backgroundColor: COLOR_MAP[c.colourName] || "#ddd" }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* QUANTITY & PINCODE */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-4 hover:bg-gray-50 text-gray-600"
                >
                  <FaMinus />
                </button>
                <span className="px-6 font-bold text-lg min-w-[60px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-4 hover:bg-gray-50 text-grey-600"
                >
                  <FaPlus />
                </button>
              </div>

              <div className="relative flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="Enter Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full border-2 border-gray-200 px-4 py-3.5 rounded-xl focus:border-purple-600 outline-none transition-all"
                />
              </div>
            </div>

            {/* MAIN ACTIONS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                disabled={adding}
                onClick={handleAddToCart}
                className={`flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-white transition-all transform active:scale-95 ${
                  adding ? "bg-gray-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200"
                }`}
              >
                <FaShoppingCart /> {adding ? "Adding..." : "Add to Cart"}
              </button>

              <button className="flex items-center justify-center gap-3 py-4 rounded-xl font-bold bg-gray-900 text-white hover:bg-black transition-all transform active:scale-95 shadow-lg shadow-gray-200">
                <FaShoppingBag /> Buy Now
              </button>
            </div>

            {/* ACCORDION SECTIONS (Description, Care, etc) */}
            <div className="border-t pt-6 space-y-2">
              {[
                { id: "description", label: "Description", icon: <FaInfoCircle />, content: product.description },
                { id: "care", label: "Care Instructions", icon: <FaSyncAlt />, content: product.careInstructions },
                { id: "warranty", label: "Warranty & Policy", icon: <FaShieldAlt />, content: `${product.warrantyYears} Year Warranty | ${product.returnPolicyDays} Days Return Policy` },
                { id: "assembly", label: "Assembly Info", icon: <FaTools />, content: product.assemblyRequired ? "Professional assembly required. Tools are provided in the package." : "No assembly required." }
              ].map((section) => (
                <div key={section.id} className="border-b border-gray-100 pb-2">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between py-3 text-left font-bold text-gray-800"
                  >
                    <span className="flex items-center gap-2">
                      {section.icon} {section.label}
                    </span>
                    {expandedSection === section.id ? <FaMinus size={12}/> : <FaPlus size={12}/>}
                  </button>
                  <AnimatePresence>
                    {expandedSection === section.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="text-gray-600 text-sm leading-relaxed pb-4 whitespace-pre-line">
                          {section.content}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;