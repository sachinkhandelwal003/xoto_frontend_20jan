import React, { useState } from 'react';
import {
  FaShoppingBag,
  FaHeart,
  FaTimes,
  FaChevronRight,
  FaMapMarkerAlt,
  FaShippingFast,
  FaTicketAlt,
  FaMinus,
  FaPlus,
  FaTrash,
  FaArrowLeft,
  FaShieldAlt,
  FaCreditCard,
  FaTruck,
  FaStar
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Button,
  Divider,
  CircularProgress
} from '@mui/material';

// DUMMY DATA
const dummyCart = {
  items: [
    {
      _id: "1",
      product: {
        _id: "p1",
        name: "Premium Wireless Headphones",
        images: [{ url: "/images/headphones.jpg", is_primary: true }],
      },
      product_type: "Electronics",
      price_per_unit: 2999,
      quantity: 1
    },
    {
      _id: "2",
      product: {
        _id: "p2",
        name: "Organic Cotton T-Shirt",
        images: [{ url: "/images/tshirt.jpg", is_primary: true }],
      },
      product_type: "Apparel",
      price_per_unit: 799,
      quantity: 2
    }
  ],
  total_amount: 4597
};

const SHIPPING_COST = 499;
const DISCOUNT_MULTIPLIER = 1.67;

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(dummyCart);
  const [updatingItems, setUpdatingItems] = useState(new Set());

  const handleQuantityUpdate = (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    setUpdatingItems(prev => new Set(prev).add(itemId));
    
    setTimeout(() => {
      setCart(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item._id === itemId ? { ...item, quantity: newQuantity } : item
        ),
        total_amount: prev.items.reduce((sum, item) => 
          sum + (item._id === itemId ? newQuantity * item.price_per_unit : item.quantity * item.price_per_unit)
        , 0)
      }));
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }, 500);
  };

  const handleRemoveItem = (itemId) => {
    setUpdatingItems(prev => new Set(prev).add(itemId));
    setTimeout(() => {
      setCart(prev => ({
        ...prev,
        items: prev.items.filter(item => item._id !== itemId),
        total_amount: prev.items
          .filter(item => item._id !== itemId)
          .reduce((sum, item) => sum + item.quantity * item.price_per_unit, 0)
      }));
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }, 500);
  };

  if (cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <FaShoppingBag className="text-6xl text-gray-300 mb-6 mx-auto" />
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-8 text-lg">
            Looks like you haven't added any products to your cart yet.
          </p>
          <button
            onClick={() => navigate('/ecommerce/b2c')}
            className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
            aria-label="Start shopping"
          >
            Start Shopping
          </button>
        </motion.div>
      </div>
    );
  }

  const calculateSavings = (item) => {
    const originalPrice = item.price_per_unit * DISCOUNT_MULTIPLIER;
    return (originalPrice - item.price_per_unit) * item.quantity;
  };

  const totalSavings = cart.items.reduce((sum, item) => sum + calculateSavings(item), 0);
  const subtotal = cart.total_amount;
  const total = subtotal + SHIPPING_COST;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <style jsx>{`
        :root {
          --color-primary: #5C039B;
          --color-btn-primary: #5C039B;
          --color-btn-hover: #4A0380;
        }
        .btn-purple {
          background-color: var(--color-btn-primary);
        }
        .btn-purple:hover {
          background-color: var(--color-btn-hover);
        }
        .text-purple {
          color: var(--color-primary);
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/ecommerce/b2c')}
              className="flex items-center text-purple-600 hover:text-purple-700 transition-colors font-medium"
            >
              <FaArrowLeft className="mr-2" />
              Continue Shopping
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <div className="w-24"></div>
          </div>

          <Box sx={{ width: '100%', mb: 6 }}> 
            <Stepper activeStep={0} alternativeLabel>
              {['Cart', 'Shipping', 'Payment', 'Confirmation'].map((label) => (
                <Step key={label}>
                  <StepLabel sx={{ '& .MuiStepLabel-label': { fontSize: '0.875rem', fontWeight: 600 } }}>
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {cart.items.length} {cart.items.length === 1 ? 'Item' : 'Items'} in Cart
                </h2>
                <p className="text-gray-600">Review your items and proceed to checkout</p>
              </div>
              <Chip
                label={`Total: AED${total.toLocaleString('en-IN')}`}
                sx={{ backgroundColor: '#5C039B', color: 'white', fontWeight: 600 }}
              />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <FaMapMarkerAlt className="text-purple-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Delivery Address</h3>
                    <p className="text-gray-600">Bangalore, Karnataka - 560001</p>
                  </div>
                </div>
                <button className="text-purple-600 font-medium hover:underline">Change</button>
              </div>
            </motion.div>

            <AnimatePresence>
              {cart.items.map((item, index) => {
                const isUpdating = updatingItems.has(item._id);
                return (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-sm overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                        <div className="md:col-span-3">
                          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                              <FaShoppingBag className="text-4xl text-purple-600" />
                            </div>
                            {item.quantity > 1 && (
                              <div className="absolute top-2 right-2 bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                                {item.quantity}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="md:col-span-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                            {item.product.name}
                          </h3>
                          <div className="flex items-center space-x-4 mb-4">
                            <Chip label={item.product_type} size="small" sx={{ backgroundColor: '#5C039B', color: 'white' }} />
                            <div className="flex items-center text-yellow-500">
                              <span className="text-sm font-medium">4.5</span>
                              <FaStar className="h-3 w-3 ml-1" />
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 mb-4">
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                className="p-2 hover:bg-gray-100 disabled:opacity-50"
                                onClick={() => handleQuantityUpdate(item._id, item.quantity - 1)}
                                disabled={isUpdating || item.quantity <= 1}
                              >
                                <FaMinus className="h-3 w-3" />
                              </button>
                              <span className="px-4 py-2 border-x border-gray-300 font-medium min-w-[3rem] text-center">
                                {isUpdating ? '...' : item.quantity}
                              </span>
                              <button
                                className="p-2 hover:bg-gray-100"
                                onClick={() => handleQuantityUpdate(item._id, item.quantity + 1)}
                                disabled={isUpdating}
                              >
                                <FaPlus className="h-3 w-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => handleRemoveItem(item._id)}
                              disabled={isUpdating}
                              className="text-red-600 hover:text-red-700 flex items-center space-x-2 text-sm px-3 py-2 rounded-lg hover:bg-red-50"
                            >
                              {isUpdating ? <CircularProgress size={12} /> : <FaTrash className="h-4 w-4" />}
                              <span>Remove</span>
                            </button>
                          </div>

                          <div className="flex items-center text-gray-600 text-sm">
                            <FaShippingFast className="h-4 w-4 mr-2 text-purple-600" />
                            <span>Delivery by {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="md:col-span-3 text-right">
                          <div className="space-y-2">
                            <p className="text-2xl font-bold text-gray-900">
                              AED{(item.price_per_unit * item.quantity).toLocaleString('en-IN')}
                            </p>
                            <p className="text-sm text-gray-500 line-through">
                              AED{Math.round(item.price_per_unit * DISCOUNT_MULTIPLIER * item.quantity).toLocaleString('en-IN')}
                            </p>
                            <p className="text-green-600 text-sm font-medium">
                              Save AED{Math.round(calculateSavings(item)).toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="sticky top-6 space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-900">Order Summary</h3>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cart.items.length} items)</span>
                    <span>AED{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Total Savings</span>
                    <span>-AED{Math.round(totalSavings).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>AED{SHIPPING_COST.toLocaleString('en-IN')}</span>
                  </div>
                  <Divider />
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total Amount</span>
                    <span>AED{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/ecommerce/checkout')}
                  sx={{
                    backgroundColor: '#5C039B',
                    padding: '12px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    '&:hover': { backgroundColor: '#4A0380' }
                  }}
                >
                  Proceed to Checkout
                </Button>

                <button className="w-full mt-3 border border-purple-600 text-purple-600 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-purple-600 hover:text-white transition-all font-medium">
                  <FaTicketAlt />
                  <span>Apply Coupon Code</span>
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h4 className="font-semibold mb-3 text-gray-900">Payment Security</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <FaCreditCard className="h-5 w-5 text-purple-600" />
                    <span className="text-sm">SSL Secure Payment</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <FaShieldAlt className="h-5 w-5 text-green-500" />
                    <span className="text-sm">100% Payment Protection</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <FaTruck className="h-5 w-5 text-purple-600" />
                    <span className="text-sm">Free Returns & Exchange</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;