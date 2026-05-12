import React from "react";
import { useBlogContext } from "../../context/BlogContext";
import { FiArrowLeft } from "react-icons/fi";

// Sub-components Import
import Ai1 from "../AII/Ai1";
import Ai2 from "../AII/Ai2";
import Ai3 from "../AII/Ai3";

const Ai = () => {
  const { setSelectedBlogId ,selectedBlogId } = useBlogContext();

  return (
    <div className="w-full animate-fadeIn relative">
      {/* GLOBAL BACK BUTTON */}
      <div className="fixed top-24 left-4 z-50 md:top-6 md:left-6">
        <button 
          onClick={() => setSelectedBlogId(null)} // ID null karte hi Page3 wapis aa jayega
          // className="bg-white/90 backdrop-blur-sm p-3 px-5 rounded-full shadow-lg flex items-center gap-2 text-[#5C039B] font-bold border border-purple-100 hover:bg-purple-50 transition-all"
        >
          {/* <FiArrowLeft size={20} /> Back */}
        </button>
      </div>

      {/* Sections render honge */}
      <Ai1 selectedBlogId={selectedBlogId} />
      <Ai2 />
      <Ai3 />
    </div>
  );
};

export default Ai;