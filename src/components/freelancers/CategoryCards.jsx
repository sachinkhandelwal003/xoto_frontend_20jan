import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTools, FaSearch, FaBolt, FaPhone } from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";

const CategoryCards = ({ categoryId }) => {
  const navigate = useNavigate();

  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryName, setCategoryName] = useState("Category");

  useEffect(() => {
    if (!categoryId) {
      setLoading(false);
      return;
    }

    const fetchSubs = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `https://kotiboxglobaltech.online/api/freelancer/subcategory?category=${categoryId}`
        );

        if (data.success && Array.isArray(data.subcategories)) {
          setSubcategories(data.subcategories);
          setCategoryName(data.subcategories[0]?.category?.name || "Category");
        } else {
          setError("No sub-categories found");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load sub-categories");
      } finally {
        setLoading(false);
      }
    };

    fetchSubs();
  }, [categoryId]);

  const handleSubClick = (subId, subName) => {
    navigate(
      `/sawtar/freelancer/browse-subcategory/${subId}`
    );
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.5 },
    }),
    hover: { scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" },
  };

  if (!categoryId) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No category selected.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="w-full bg-gradient-to-r from-[#1A132F] to-[#3A1D4D] py-16 px-4 sm:px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Find Trusted <span className="text-[#D26C44]">{categoryName}</span> Professionals
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            Connect with skilled service providers for all your {categoryName.toLowerCase()} needs
          </p>
        </div>
      </div>

      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {subcategories.map((sub, idx) => (
              <motion.div
                key={sub._id}
                className="group rounded-xl bg-white p-5 flex flex-col items-center justify-center h-full cursor-pointer shadow-sm hover:shadow-md transition-all border border-gray-100"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                custom={idx}
                whileHover="hover"
                onClick={() => handleSubClick(sub._id, sub.name)}
              >
                <div className="bg-gray-100 p-3 rounded-full mb-3 group-hover:bg-indigo-50 transition-colors">
                  <FaTools className="text-gray-700 text-xl group-hover:text-indigo-600 transition-colors" />
                </div>
                <h3 className="text-gray-800 font-medium text-sm text-center">
                  {sub.name}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CategoryCards;
