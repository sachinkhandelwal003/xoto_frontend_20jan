import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import houseimage from "../../assets/img/home/houseimage1.png";
import wave1 from "../../assets/img/wave/waveint2.png";

// Import your icons
import interior from "../../assets/img/icons123/interior.png";
import exterior from "../../assets/img/icons123/extterior.png";
import landscaping from "../../assets/img/icons123/landscaping.png";
import virtual from "../../assets/img/icons123/virtual.png";
import image from "../../assets/img/icons123/image.png";
import smart from "../../assets/img/icons123/smart.png";

const HomeDesign = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("home1");

  // Configuration for the floating cards
  // Note: Positions use percentages so they stay relative to the image size
  // const hotspots = [
  //   {
  //     key: "exterior",
  //     icon: exterior,
  //     link: "/aiPlanner/exterior",
  //     position: "top-[10%] right-[10%] sm:right-[20%]  s lg:top-[10%] lg:right-[20%]", 
  //   },
  //   {
  //     key: "interior",
  //     icon: interior,
  //     link: "/aiPlanner/interior",
  //     position: "top-[42%] right-[-5%] sm:right-[0%] lg:top-[37%] lg:-right-[5%]",
  //   },
  //   {
  //     key: "furniture",
  //     icon: smart,
  //     link: "/aiPlanner/furniture",
  //     position: "bottom-[22%] right-[2%] sm:right-[5%] lg:bottom-[33%] lg:-right-[-5%]",
  //   },
  //   {
  //     key: "landscaping",
  //     icon: landscaping,
  //     link: "/aiPlanner/landscape",
  //     position: "bottom-[-2%] left-[50%] -translate-x-1/2 lg:bottom-[2%] lg:left-[50%]",
  //   },
  //   {
  //     key: "image",
  //     icon: image,
  //     link: "/aiPlanner/image",
  //     position: "bottom-[20%] left-[-2%] sm:left-[0%] lg:bottom-[28%] lg:-left-[2%]",
  //   },
  //   {
  //     key: "virtual",
  //     icon: virtual,
  //     link: "/aiPlanner/virtual",
  //     position: "top-[25%] left-[-2%] sm:left-[0%] lg:top-[36%] lg:-left-[-2%]",
  //   },
  // ];
const hotspots = [
  {
    key: "exterior",
    icon: exterior,
    link: "/",
    position:
      "top-[16%] right-[18%] sm:top-[10%] sm:right-[12%] lg:top-[12%] lg:right-[18%]",
  },
  {
    key: "interior",
    icon: interior,
    link: "/aiPlanner/interior",
    position:
      "top-[40%] right-[0%] sm:top-[38%] sm:right-[5%] lg:top-[36%] lg:right-[5%]",
  },
  {
    key: "furniture",
    icon: smart,
    link: "/",
    position:
      "bottom-[34%] right-[2%] sm:bottom-[28%] sm:right-[8%] lg:bottom-[32%] lg:right-[12%]",
  },
  {
    key: "landscaping",
    icon: landscaping,
    link: "/aiPlanner/landscape",
    position:
      "bottom-[7%] left-1/2 -translate-x-1/2 sm:bottom-[8%] lg:bottom-[2%]",
  },
  {
    key: "image",
    icon: image,
    link: "/",
    position:
      "bottom-[30%] left-[-2%] sm:bottom-[30%] sm:left-[8%] lg:bottom-[28%] lg:left-[-2%]",
  },
  {
    key: "virtual",
    icon: virtual,
    link: "/",
    position:
      "top-[36%] left-[-1%] sm:top-[30%] sm:left-[8%] lg:top-[38%] lg:left-[6%]",
  },
];

  return (
    <section className="relative  bg-[var(--color-body)]  overflow-hidden pt-12  lg:pt-12">
      
      {/* Background Decor (Wave) - Kept exactly as requested */}
  {/* WAVE BACKGROUND */}
 <div
    className="
      absolute
      left-0
      right-0
      -bottom-16
      z-0
      xl:block
    "
  >
    <img
      src={wave1}
      alt="wave-bg"
      className="
        w-full
        object-cover
        pointer-events-none
        select-none
      "
    />
  </div>


      <div className="max-w-[1540px] mx-auto px-4 sm:px-12 lg:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-10">
          
          {/* --- LEFT CONTENT --- */}
          {/* Centered on mobile, Left aligned on Desktop */}
          <div className="flex flex-col items-center lg:items-start lg:ps-10 text-center lg:text-left space-y-6 lg:space-y-8 z-20">
            
            {/* Responsive Title Font */}
            <h2 className="heading-light text-black ">
              {t("homeDesign.title1")} <br />
              <span>{t("homeDesign.title2")}</span>
            </h2>

            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-lg lg:max-w-xl leading-relaxed">
              {t("homeDesign.description")}
            </p>

            <Link
              to="/schedule/estimate"
              className="bg-[var(--color-primary)] text-white px-10 py-3 sm:px-14 sm:py-3.5 text-base sm:text-lg rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {t("homeDesign.cta")}
            </Link>
          </div>

          {/* --- RIGHT IMAGE & HOTSPOTS --- */}
          <div className="relative flex justify-center items-center mt-4 pb-10  lg:mt-0">
            {/* Image Container */}
            <div className="relative w-full max-w-[450px] sm:max-w-[500px] lg:max-w-[850px] aspect-square flex items-center justify-center">
              
              {/* Main House Image */}
              <img
                src={houseimage}
                alt="3D House Model"
                className="w-full h-full object-contain drop-shadow-2xl z-10 relative scale-110 lg:scale-135 transition-transform duration-700 hover:scale-[1.15] lg:hover:scale-[1.4]"
              />

              {/* Hotspot Buttons */}
              {hotspots.map((spot, index) => (
                <button
                  key={spot.key}
                  onClick={() => navigate(spot.link)}
                  className={`
                    absolute ${spot.position}
                    z-20 flex items-center 
                    gap-2 lg:gap-3 
                    bg-white 
                    
                    /* Responsive Padding */
                    pr-2 pl-1 py-1 
                    sm:pr-3 sm:pl-1.5 sm:py-1.5
                    lg:pr-4 lg:pl-1.5 lg:py-1.5 
                    
                    rounded-full shadow-[0_4px_15px_rgb(0,0,0,0.1)] lg:shadow-[0_8px_30px_rgb(0,0,0,0.12)] 
                    border border-gray-100
                    
                    /* Scale down on mobile to fit screen */
                    transform transition-all duration-300 hover:scale-110 hover:shadow-xl
                    scale-[0.8] sm:scale-90 lg:scale-100
                    
                    group cursor-pointer animate-in fade-in zoom-in duration-500 fill-mode-both
                  `}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {/* Icon Circle - Responsive Size */}
                  <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-sm shrink-0 group-hover:rotate-12 transition-transform">
                    <img
                      src={spot.icon}
                      alt={spot.key}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 object-contain brightness-0 invert"
                    />
                  </div>

                  {/* Text - Responsive Font Size */}
                  <span className="text-[10px] sm:text-xs lg:text-sm font-bold text-gray-800 whitespace-nowrap">
                    {t(`homeDesign.hotspots.${spot.key}`, spot.key.charAt(0).toUpperCase() + spot.key.slice(1))}
                  </span>
                </button>
              ))}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HomeDesign;