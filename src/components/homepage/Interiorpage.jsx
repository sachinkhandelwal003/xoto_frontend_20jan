import React, { useState } from 'react';
import { motion } from 'framer-motion';

const InteriorEstimatorComingSoon = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSubscribed(true);
      setLoading(false);
      setEmail('');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans overflow-hidden">
      {/* Navigation Bar */}
      <nav className="flex justify-between items-center px-6 md:px-12 py-6 bg-white shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-900 to-purple-700 flex items-center justify-center">
            <span className="text-white font-bold text-lg">RE</span>
          </div>
          <span className="text-xl font-bold text-gray-800">Dubai<span className="text-purple-900">Estate</span></span>
        </div>
        <div className="hidden md:flex space-x-8">
          <a href="#" className="text-gray-700 hover:text-purple-900 font-medium transition">Properties</a>
          <a href="#" className="text-gray-700 hover:text-purple-900 font-medium transition">Services</a>
          <a href="#" className="text-gray-700 hover:text-purple-900 font-medium transition">About</a>
          <a href="#" className="text-gray-700 hover:text-purple-900 font-medium transition">Contact</a>
        </div>
        <div className="md:hidden">
          <button className="text-gray-700">
            <i className="fas fa-bars text-xl"></i>
          </button>
        </div>
      </nav>

      <main className="flex flex-col lg:flex-row items-center justify-between px-6 md:px-12 py-12 lg:py-24">
        {/* Left Content */}
        <motion.div 
          className="lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-block mb-6 px-4 py-2 bg-purple-50 rounded-full">
            <span className="text-purple-900 font-medium text-sm">Coming Soon</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Good Things Take Time<span className="block text-purple-900 mt-2">Interior Estimator</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl">
            We're crafting a revolutionary interior estimation tool specifically designed for Dubai's luxury real estate market. Get precise cost estimates, material suggestions, and design insights.
          </p>
          
          <div className="space-y-6 mb-10">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                <i className="fas fa-check text-purple-900"></i>
              </div>
              <p className="text-gray-700">Accurate cost estimation for interiors based on Dubai market rates</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                <i className="fas fa-check text-purple-900"></i>
              </div>
              <p className="text-gray-700">Material & finish recommendations from premium suppliers</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                <i className="fas fa-check text-purple-900"></i>
              </div>
              <p className="text-gray-700">3D visualization of interior designs before implementation</p>
            </div>
          </div>
          
          {/* Email Subscription Form */}
          <div className="max-w-xl">
            <p className="text-gray-700 mb-4 font-medium">Be the first to know when we launch</p>
            
            {subscribed ? (
              <motion.div 
                className="p-4 bg-green-50 border border-green-200 rounded-xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <i className="fas fa-check text-green-600"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Thank you for subscribing!</h3>
                    <p className="text-gray-600">We'll notify you as soon as the Interior Estimator launches.</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-grow px-5 py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  className="px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:opacity-90 disabled:opacity-70"
                  style={{ backgroundColor: '#5C039B' }}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <i className="fas fa-spinner fa-spin mr-2"></i> Processing...
                    </span>
                  ) : (
                    <span>Notify Me <i className="fas fa-arrow-right ml-2"></i></span>
                  )}
                </button>
              </form>
            )}
            
            <p className="text-gray-500 text-sm mt-3">We respect your privacy. No spam, ever.</p>
          </div>
          
          {/* Countdown Timer */}
          <div className="mt-12">
            <p className="text-gray-700 mb-4 font-medium">Launching in</p>
            <div className="flex space-x-4 md:space-x-6">
              {[
                { value: '28', label: 'Days' },
                { value: '12', label: 'Hours' },
                { value: '45', label: 'Minutes' },
                { value: '22', label: 'Seconds' }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-xl bg-white shadow-md border border-gray-100">
                    <span className="text-2xl md:text-3xl font-bold text-gray-900">{item.value}</span>
                  </div>
                  <span className="text-gray-600 text-sm mt-2">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Image */}
        <motion.div 
          className="lg:w-1/2 relative flex justify-center lg:justify-end"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="relative w-full max-w-2xl">
            {/* Main Image Container */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                alt="Luxury Dubai Interior"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              
              {/* Overlay Text */}
              <div className="absolute bottom-8 left-8 text-white">
                <p className="text-sm font-medium mb-1">Dubai Luxury Villa Interior</p>
                <p className="text-2xl font-bold">Palm Jumeirah Residence</p>
              </div>
            </div>
            
            {/* Floating Card */}
            <motion.div 
              className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-2xl max-w-xs"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <i className="fas fa-ruler-combined text-xl" style={{ color: '#5C039B' }}></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Precision Estimation</h3>
                  <p className="text-gray-600 text-sm">AI-powered calculations</p>
                </div>
              </div>
              <p className="text-gray-700">Our tool will provide accurate cost breakdowns for every room with Dubai-specific pricing.</p>
            </motion.div>
            
            {/* Floating Badge */}
            <div className="absolute -top-4 -right-4 bg-white rounded-2xl px-5 py-3 shadow-xl">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                  <i className="fas fa-star text-yellow-500"></i>
                </div>
                <span className="font-bold text-gray-900">Premium</span>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-8 border-t border-gray-200 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-900 to-purple-700 flex items-center justify-center">
                <span className="text-white font-bold">RE</span>
              </div>
              <span className="text-lg font-bold text-gray-800">Dubai<span className="text-purple-900">Estate</span></span>
            </div>
            <p className="text-gray-600 mt-2 text-sm">Premium real estate services in Dubai since 2010</p>
          </div>
          
          <div className="flex space-x-6">
            <a href="#" className="text-gray-600 hover:text-purple-900">
              <i className="fab fa-facebook-f text-xl"></i>
            </a>
            <a href="#" className="text-gray-600 hover:text-purple-900">
              <i className="fab fa-twitter text-xl"></i>
            </a>
            <a href="#" className="text-gray-600 hover:text-purple-900">
              <i className="fab fa-instagram text-xl"></i>
            </a>
            <a href="#" className="text-gray-600 hover:text-purple-900">
              <i className="fab fa-linkedin-in text-xl"></i>
            </a>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
          <p>© 2023 DubaiEstate. All rights reserved. | Downtown Dubai, Burj Khalifa District, UAE</p>
        </div>
      </footer>
    </div>
  );
};

export default InteriorEstimatorComingSoon;