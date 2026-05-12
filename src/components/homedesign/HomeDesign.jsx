import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Images aur Wave backgrounds
import houseimage from "../../assets/img/home/houseimage3.png";
import wave1 from "../../assets/img/wave/waveint2.png";

// Icons
import interior from "../../assets/img/icons123/iconn2.png";
import exterior from "../../assets/img/icons123/interior.png";
import landscaping from "../../assets/img/icons123/iconn3.png";
import virtual from "../../assets/img/icons123/iconn1.png";
import image from "../../assets/img/icons123/iconn4.png";
import smart from "../../assets/img/icons123/icon5.png";

const HomeDesign = () => {
  const navigate = useNavigate();
  // 'home6' namespace call kar rahe hain jahan aapka naya data hai
  const { t } = useTranslation("home6");

  // Hotspots ki positioning aur unke respective links/icons
  const hotspots = [
    {
      key: "exterior",
      icon: exterior,
      link: "/Property",
      position: "top-[35%] right-[5%]",
    },
    {
      key: "interior",
      icon: interior,
      link: "/services/interior",
      position: "top-[35%] left-[-5%]",
    },
    {
      key: "furniture",
      icon: smart,
      link: "/ecommerce/b2c",
      position: "bottom-[5%] right-[10%]",
    },
    {
      key: "landscaping",
      icon: landscaping,
      link: "/landscaping",
      position: "bottom-[28%] left-[-8%]",
    },
    {
      key: "image",
      icon: image,
      link: "/mortgage/services",
     position: "top-[58%] right-[2%]",
    },
    {
      key: "virtual",
      icon: virtual,
      link: "/mortgage/services",
      position: "top-[10%] right-[15%]",
    },
  ];

  return (
    <section className="relative bg-[var(--color-body)] overflow-hidden pt-12 lg:pt-12">
      
      {/* --- BACKGROUND WAVE --- */}
      <div className="absolute left-0 right-0 -bottom-16 z-0 xl:block">
        <img
          src={wave1}
          alt="wave-bg"
          className="w-full object-cover pointer-events-none select-none"
        />
      </div>

      <div className="max-w-[1540px] mx-auto px-4 sm:px-12 lg:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-10 mt-10 md:mt-20">
          
          {/* --- LEFT CONTENT (Text Section) --- */}
          <div className="flex flex-col items-center lg:items-start lg:ps-10 text-center lg:text-left space-y-6 lg:space-y-8 z-20">
            
            {/* Heading in 3 lines matching the design */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-black leading-tight">
              {t("homeDesign.title1")} <br />
              {t("homeDesign.title2")} <br />
              <span className="font-semibold text-black">{t("homeDesign.title3")}</span>
            </h2>

        <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-600 max-w-lg lg:max-w-2xl leading-relaxed">
  {t("homeDesign.description")}
</p>

            {/* CTA Button agar aapko wapas chahiye toh isko uncomment kar sakte hain */}
            {/* <Link
              to="/schedule/estimate"
              className="bg-[var(--color-primary)] text-white px-10 py-3 sm:px-14 sm:py-3.5 text-base sm:text-lg rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {t("homeDesign.cta")}
            </Link> */}
          </div>

          {/* --- RIGHT CONTENT (Image & Hotspots) --- */}
          <div className="relative flex justify-center items-center mt-4 pb-10 lg:mt-0">
            <div className="relative w-full max-w-[450px] sm:max-w-[500px] lg:max-w-[850px] aspect-square flex items-center justify-center">
              
              {/* Center House Image */}
              <img
                src={houseimage}
                alt="3D House Model"
                className="w-full h-full object-contain drop-shadow-2xl z-10 relative scale-110 lg:scale-135 transition-transform duration-700 hover:scale-[1.15] lg:hover:scale-[1.4]"
              />

              {/* Dynamic Hotspot Buttons */}
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
                    
                    /* Animation & Scale */
                    transform transition-all duration-300 hover:scale-110 hover:shadow-xl
                    scale-[0.8] sm:scale-90 lg:scale-100
                    
                    group cursor-pointer animate-in fade-in zoom-in duration-500 fill-mode-both
                  `}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {/* Icon Design */}
                  <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-sm shrink-0 group-hover:rotate-12 transition-transform">
                    <img
                      src={spot.icon}
                      alt={spot.key}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 object-contain brightness-0 invert"
                    />
                  </div>

                  {/* Hotspot Text */}
                  <span className="text-[10px] sm:text-xs lg:text-sm font-bold text-gray-800 whitespace-pre-line">
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