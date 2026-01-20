import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
 FaBed, FaChair, FaUtensils, 
  FaDoorClosed, FaShoePrints, FaBook, 
  FaTv, FaRecycle, FaUsers, FaPlus, FaFire
} from 'react-icons/fa';
import Art from '../../assets/xotoicon/artificialgrasscarpet.png'
import Tiles from '../../assets/xotoicon/Tiles.png'
import floor from '../../assets/xotoicon/Flooring.png'
import gazib from '../../assets/xotoicon/gazibos&pergolas.png'
import Outdoor from '../../assets/xotoicon/outdoorsofaset.png'
import Curtains from '../../assets/xotoicon/Curtains.png'
import Tv from '../../assets/xotoicon/Tvunits.png'
import Plant from '../../assets/xotoicon/Artificialplants.png'
import Grill from '../../assets/xotoicon/Grill.png'
import Lights from '../../assets/xotoicon/Lights.png'
import Swimmingpool from '../../assets/xotoicon/Swimmingpool.png'
import Barunits from '../../assets/xotoicon/Barunits.png'
import newarrivals from '../../assets/xotoicon/newarrivals.png'
const Category = () => {
  const navigate = useNavigate();

  const categories = [
    { id: 1, name: "New Arrivals", icon: <img src={newarrivals} alt="New Arrivals" />, isNew: true, color: "from-[var(--color-primary)] to-pink-500" },
    { id: 2, name: "Artificial grass carpet", icon: <img src={Art} alt="Artificial grass carpet" />, color: "from-blue-500 to-cyan-400" },
    { id: 3, name: "Tiles", icon: <img src={Tiles} alt="Tiles" />, color: "from-emerald-500 to-teal-400" },
    { id: 4, name: "Flooring", icon: <img src={floor} alt="Flooring" />, color: "from-amber-500 to-orange-400" },
    { id: 5, name: "Gazibos & Pergolas", icon: <img src={gazib}  alt='gazibos&pergolas'/>, color: "from-rose-500 to-pink-400" },
    { id: 6, name: "Outdoor Sofa set", icon: <img src={Outdoor} alt="Outdoor Sofa set" />, color: "from-indigo-500 to-purple-400" },
    { id: 7, name: "Curtains", icon: <img src={Curtains} alt="Curtains" />, color: "from-violet-500 to-purple-400" },
    { id: 8, name: "TV Units", icon: <img src={Tv} alt="TV Units" />, color: "from-gray-600 to-gray-400" },
    { id: 9, name: "Artificial Plants", icon: <img src={Plant} alt="Artificial Plants" />, color: "from-fuchsia-500 to-pink-400" },
    { id: 10, name: "BBQ & Grill", icon: <img src={Grill} alt="BBQ & Grill" />, color: "from-green-500 to-emerald-400" },
    // { id: 11, name: "Fountains", icon: <FaCouch />, color: "from-yellow-500 to-amber-400" },
    { id: 12, name: "Lights", icon: <img src={Lights} alt="Lights" />, color: "from-red-500 to-orange-400" },
    { id: 13, name: "Swimming Pool & Accesories", icon: <img src={Swimmingpool} alt="Swimming Pool & Accesories" />, isDeal: true, color: "from-red-500 to-pink-500" },
    { id: 14, name: "Bar Units  ", icon: <img src={Barunits} alt="Bar Units" />, color: "from-purple-600 to-blue-500" },
    { id: 15, name: "See More", icon: <FaPlus />, color: "from-gray-700 to-gray-500" },
  ];

  const handleCategoryClick = (categoryName) => {
    navigate(`/ecommerce/filter?category=${categoryName.toLowerCase().replace(/\s+/g, '-')}`);
  };

  return (
    <div className='bg-[var(--color-body)]'>
    <div className="max-w-7xl mx-auto px-4 py-16 bg-[var(--color-body)]">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Shop by <span className="text-[var(--color-primary)]">Category</span>
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Browse through our carefully curated furniture categories
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-6">
        {categories.map((category) => (
          <motion.button
            key={category.id}
            onClick={() => handleCategoryClick(category.name)}
            whileHover={{ y: -5, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative"
          >
            {/* <div className="flex flex-col items-center p-4 bg-white rounded-xl hover:shadow-2xl transition-all duration-300 border border-gray-100"> */}
          <div className="relative group flex flex-col items-center justify-center p-4 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all duration-300 w-[140px] h-[140px] shrink-0">
  
  {/* Icon Container - Iska size fixed hai */}
  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 shrink-0`}>
    <div className="text-white text-2xl">
      {category.icon}
    </div>
  </div>
  
  {/* Category Name - Fixed container height taaki card stretch na ho */}
  <div className="h-10 flex items-center justify-center">
    <span className="text-[12px] sm:text-sm font-semibold text-gray-800 group-hover:text-[var(--color-primary)] transition-colors text-center leading-tight line-clamp-2">
      {category.name}
    </span>
  </div>
  
  {/* Badges */}
  {(category.isNew || category.isDeal) && (
    <div className={`absolute -top-1 -right-1 ${category.isDeal ? 'bg-red-500' : 'bg-[var(--color-primary)]'} text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm`}>
      {category.isDeal ? 'HOT' : 'NEW'}
    </div>
  )}
</div>
          </motion.button>
        ))}
      </div>
    </div>
    </div>
  );
};

export default Category;