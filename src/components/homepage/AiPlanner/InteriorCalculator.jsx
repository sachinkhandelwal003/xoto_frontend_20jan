import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const InteriorEstimatorComingSoon = () => { 
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setTimeout(() => {
      setSubscribed(true);
      setLoading(false);
      setEmail("");

      setTimeout(() => setSubscribed(false), 5000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 font-sans flex items-center justify-center p-4 relative overflow-hidden">


      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500 rounded-full blur-3xl opacity-10 animate-pulse delay-500 transform -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Main Card */}
      <motion.div

        className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-white/20"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Back Arrow - Top Most Left */}
<button
  onClick={() => navigate("/")}
  className="absolute top-5 left-3 z-50 flex items-center justify-center w-10 h-10 rounded-full   transition"
>
  <ArrowLeft className="w-9 h-14 text-purple-700" />
</button>

        <div className="h-4 bg-gradient-to-r from-purple-600 via-purple-800 to-indigo-900" />

        <div className="p-8 md:p-12">

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-900 to-purple-700 flex items-center justify-center shadow-lg">
              <i className="fas fa-home text-white text-2xl"></i>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-10">
            <motion.div
              className="inline-block mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-indigo-50 px-5 py-2 rounded-full border border-purple-100">
                <span className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" />
                <span className="text-purple-800 font-bold tracking-widest text-xs uppercase">
                  Coming Soon
                </span>
                <span className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" />
              </div>
            </motion.div>

            <motion.h1
              className="text-3xl md:text-5xl font-bold text-gray-900 mb-4"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <span className="block">Good Things</span>
              <span className="block">Take Time</span>
            </motion.h1>

            <motion.h2
              className="text-xl md:text-3xl font-bold bg-gradient-to-r from-purple-900 to-indigo-900 bg-clip-text text-transparent"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Interior Estimator
            </motion.h2>
          </div>

      

          {/* Interior Preview */}
          <motion.div
            className="mt-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <div className="relative rounded-xl overflow-hidden shadow-lg border-2 border-white">
              <img
                src="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1470&q=80"
                alt="Luxury Interior"
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-4">
                <div className="text-white">
                  <p className="text-xs opacity-90">
                    Dubai Luxury Interior Estimation
                  </p>
                  <p className="text-lg font-bold">
                    Precision design planning
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            className="text-center mt-8 pt-6 border-t border-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          >
            <p className="text-gray-600 text-sm">
              📍 Dubai, UAE • Premium Real Estate Solutions
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Crafting the most advanced interior estimation tool
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default InteriorEstimatorComingSoon;