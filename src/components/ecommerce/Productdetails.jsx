import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaChevronLeft, FaChevronRight, FaShoppingCart, FaShoppingBag, FaStar, FaPlus, FaMinus, FaCube, FaTruck, FaShieldAlt, FaSyncAlt, FaCreditCard, FaRulerCombined, FaWeight, FaBoxOpen } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { FiInfo, FiCheck, FiPackage } from 'react-icons/fi';
import { message } from 'antd';

// Color Hex Mapping - Screenshot jesa dikhne ke liye
const COLOR_MAP = {
  "Natural Oak": "#D2B48C",
  "Walnut Brown": "#5D4037",
  "White Wash": "#F5F5F5",
  "Black": "#000000",
  "Grey": "#808080",
  "Beige": "#F5F5DC"
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // API States
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [expandedSection, setExpandedSection] = useState(null);
  const [showARModal, setShowARModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(0);

  // --- 1. FETCH PRODUCT BY ID ---
  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`https://xoto.ae/api/products/get-product-by-id?id=${id}`);
        if (res.data.success && res.data.data) {
          setProduct(res.data.data);
        } else {
          message.error("Product not found");
        }
      } catch (error) {
        console.error("Error fetching product details", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProductDetails();
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center text-purple-600 font-bold">Loading Premium Details...</div>;
  if (!product) return <div className="h-screen flex items-center justify-center">Product Not Found</div>;

  // --- 2. DATA MAPPING (Backend to UI) ---
  const variantImages = product.ProductColors?.[selectedVariant]?.photos || [];
  const displayImages = variantImages.length > 0 ? variantImages : product.photos;
  
  const price = product.price;
  const salePrice = product.discountedPrice;
  const discountPercentage = Math.round(((price - salePrice) / price) * 100);

  const handleAddToCart = () => {
    alert(`Added ${quantity} × ${product.name} to cart!`);
  };

  const toggleSection = (section) => setExpandedSection(prev => prev === section ? null : section);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mt-10">
        
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        >
          {/* LEFT: Image Gallery */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="relative aspect-[4/3] bg-white rounded-2xl overflow-hidden shadow-xl mb-4 border border-gray-100">
              <motion.img
                key={displayImages[activeImageIndex]}
                src={displayImages[activeImageIndex]}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              />
              
              <button onClick={() => setActiveImageIndex(prev => (prev === 0 ? displayImages.length - 1 : prev - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg hover:text-purple-600 transition-all"><FaChevronLeft/></button>
              <button onClick={() => setActiveImageIndex(prev => (prev === displayImages.length - 1 ? 0 : prev + 1))}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg hover:text-purple-600 transition-all"><FaChevronRight/></button>

              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isFeatured && <span className="bg-[#5C309B] text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">Featured</span>}
                <span className="bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">{discountPercentage}% OFF</span>
              </div>

              <button onClick={() => setShowARModal(true)} className="absolute bottom-4 right-4 bg-[#5C039B] text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg hover:scale-105 transition-transform">
                <FaCube /> View in AR
              </button>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {displayImages.map((img, index) => (
                <button key={index} onClick={() => setActiveImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${activeImageIndex === index ? 'border-purple-600 shadow-md scale-105' : 'border-gray-200 hover:border-purple-400'}`}>
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div className="flex-1 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3 uppercase tracking-widest text-xs font-bold text-purple-600">
                <span>{product.brandName?.brandName}</span>
                <span>•</span>
                <span>{product.category?.name}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">{product.name}</h1>
              
              <div className="flex items-center gap-3 mt-4">
                <div className="flex items-center bg-[#5C039B] text-white px-3 py-1 rounded-lg">
                  <span className="font-bold">4.8</span> <FaStar className="ml-1" />
                </div>
                <span className="text-gray-500 text-sm">Authentic Luxury Piece</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6">
              <div className="flex items-end gap-4 mb-2">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Offer Price</p>
                  <p className="text-4xl font-bold text-gray-900">AED {salePrice.toLocaleString()}</p>
                </div>
                <p className="text-xl text-gray-400 line-through mb-1">AED {price.toLocaleString()}</p>
                <div className="ml-auto">
                  <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold shadow-sm">Save {discountPercentage}%</span>
                </div>
              </div>
              <p className="text-xs text-gray-500">*Exclusive of shipping fees</p>
            </div>

            {/* COLOR SELECTOR LOGIC - AS PER SCREENSHOT */}
            {product.ProductColors?.length > 0 && (
              <div>
                <p className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">Select Color</p>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {product.ProductColors.map((color, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => { setSelectedVariant(idx); setActiveImageIndex(0); }}
                      className={`group flex flex-col items-center gap-2 transition-all`}
                    >
                      <div className={`relative w-20 h-20 rounded-2xl  p-1.5 transition-all ${selectedVariant === idx ? 'border-gray-900 shadow-lg scale-105' : 'border-gray-100 hover:border-gray-300'}`}>
                        {/* SOLID COLOR BOX */}
                        <div 
                          className="w-full h-full rounded-xl " 
                          style={{ backgroundColor: COLOR_MAP[color.colourName] || "#E5E7EB" }} 
                        />
                        {selectedVariant === idx && (
                          <div >
                          </div>
                        )}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-tight ${selectedVariant === idx ? 'text-gray-900' : 'text-gray-400'}`}>
                        {color.colourName}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-xl bg-white overflow-hidden shadow-sm">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-4 hover:bg-gray-100 transition-colors"><FaMinus/></button>
                  <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-4 hover:bg-gray-100 transition-colors"><FaPlus/></button>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-3 min-w-[280px]">
                  <button onClick={handleAddToCart} className="bg-[#5C039B] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 shadow-md">
                    <FaShoppingCart /> Add to Cart
                  </button>
                  <button className="bg-black text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 shadow-md">
                    <FaShoppingBag /> Buy Now
                  </button>
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <FaTruck className="text-purple-600 w-5 h-5" />
                <div>
                  <p className="font-bold text-gray-900">Check Delivery</p>
                  <p className="text-xs text-gray-500">Usually delivers in {product.returnPolicyDays} working days</p>
                </div>
              </div>
              <div className="flex gap-2">
                <input type="text" placeholder="Enter Pincode" className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500" />
                <button className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold">Check</button>
              </div>
            </div>

            {/* Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: <FaShieldAlt/>, label: `${product.warrantyYears}yr Warranty` },
                { icon: <FaSyncAlt/>, label: `${product.returnPolicyDays} Days Return` },
                { icon: <FaCreditCard/>, label: 'EMI Available' },
                { icon: <FaBoxOpen/>, label: product.assemblyRequired ? 'Assembly Req' : 'Ready to Use' }
              ].map((item, i) => (
                <div key={i} className="bg-white p-3 rounded-xl border border-gray-200 text-center">
                  <div className="text-purple-600 text-lg mb-1 flex justify-center">{item.icon}</div>
                  <p className="text-[10px] font-bold uppercase text-gray-600">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* BOTTOM SECTIONS */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[
              { 
                key: 'description', title: 'Product Story', icon: '📝', 
                content: <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                  <div className="bg-purple-50 p-4 rounded-xl italic text-gray-600 text-sm border-l-4 border-purple-600">Care: {product.careInstructions}</div>
                </div>
              },
              { 
                key: 'specifications', title: 'Specifications', icon: '📋',
                content: <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Finish', value: product.finish },
                    { label: 'Origin', value: product.originCountry },
                    { label: 'Assembly', value: product.assemblyRequired ? 'Required' : 'Pre-assembled' },
                    { label: 'Tools Provided', value: product.assemblyToolsProvided ? 'Yes' : 'No' }
                  ].map(spec => (
                    <div key={spec.label} className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">{spec.label}</span>
                      <span className="font-bold">{spec.value}</span>
                    </div>
                  ))}
                </div>
              },
              { 
                key: 'features', title: 'Key Highlights', icon: '⭐',
                content: <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {product.keyFeatures?.map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-sm font-medium">
                      <FiCheck className="text-green-500"/> <span>{feat}</span>
                    </div>
                  ))}
                </div>
              }
            ].map(section => (
              <div key={section.key} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <button onClick={() => toggleSection(section.key)} className="w-full flex justify-between items-center p-6 hover:bg-gray-50 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{section.icon}</span>
                    <span className="font-bold text-gray-900">{section.title}</span>
                  </div>
                  {expandedSection === section.key ? <FaMinus/> : <FaPlus/>}
                </button>
                <AnimatePresence>
                  {expandedSection === section.key && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="px-6 pb-6 border-t pt-4 overflow-hidden">
                      {section.content}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="bg-black rounded-2xl p-6 text-white shadow-xl">
              <h3 className="text-xl font-bold mb-4">Guaranteed Quality</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#5C039B] rounded-full flex items-center justify-center font-bold">X</div>
                  <div>
                    <p className="font-bold">XOTO Verified</p>
                    <p className="text-xs text-gray-400">Premium Materials Only</p>
                  </div>
                </div>
                <p className="text-3xl font-bold mt-4">AED {salePrice.toLocaleString()}</p>
                <button className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-100 transition-all active:scale-95">Download Brochure</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;