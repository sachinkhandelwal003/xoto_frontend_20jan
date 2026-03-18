"use client";

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

// Wave Backgrounds
import wave1 from "../../assets/img/wave/waveint2.png";
import wave2 from "../../assets/img/wave/wave2.png";

// Partner Logos
import partner1 from '../../assets/xoto_partners/xoto_logo1.png';
import partner2 from '../../assets/xoto_partners/xoto_logo2.png';
import partner3 from '../../assets/xoto_partners/xoto_logo3.png';
import partner4 from '../../assets/xoto_partners/xoto_logo4.png';
import partner5 from '../../assets/xoto_partners/xoto_logo5.png';
import partner6 from '../../assets/xoto_partners/xoto_logo6.png';
import partner7 from '../../assets/xoto_partners/xoto_logo7.png';
import partner8 from '../../assets/xoto_partners/xoto_logo8.png';
import partner9 from '../../assets/xoto_partners/xoto_logo9.png';
import partner10 from '../../assets/xoto_partners/xoto_logo10.png';
import partner11 from '../../assets/xoto_partners/xoto_logo11.png';

// House & Hotspot Icons
import houseimage from "../../assets/img/home/houseimage1.png";
import interior from "../../assets/img/icons123/interior.png";
import exterior from "../../assets/img/icons123/extterior.png"; // Spelling exactly as provided
import landscaping from "../../assets/img/icons123/landscaping.png";
import virtual from "../../assets/img/icons123/virtual.png";
import image from "../../assets/img/icons123/image.png";
import smart from "../../assets/img/icons123/smart.png";

export default function TrustPresenceSection() {
  const navigate = useNavigate();
  // Dono namespaces load kar rahe hain taaki "home5" (Trust ke liye) 
  // aur "home1" (House Design ke liye) dono ka text mil jaye.
  const { t } = useTranslation(["home5", "home1"]); 

  const logos = [
      { icon: partner1 }, { icon: partner2 }, { icon: partner3 },
      { icon: partner4 }, { icon: partner5 }, { icon: partner6 },
      { icon: partner7 }, { icon: partner8 }, { icon: partner9 },
      { icon: partner10 }, { icon: partner11 },
  ];

  const hotspots = [
    {
      key: "exterior",
      icon: exterior,
      link: "/aiPlanner/exterior",
      position: "top-[16%] right-[18%] sm:top-[10%] sm:right-[12%] lg:top-[12%] lg:right-[18%]",
    },
    {
      key: "interior",
      icon: interior,
      link: "/aiPlanner/interior",
      position: "top-[40%] right-[0%] sm:top-[38%] sm:right-[5%] lg:top-[36%] lg:right-[5%]",
    },
    {
      key: "furniture",
      icon: smart,
      link: "/aiPlanner/furniture",
      position: "bottom-[34%] right-[2%] sm:bottom-[28%] sm:right-[8%] lg:bottom-[32%] lg:right-[12%]",
    },
    {
      key: "landscaping",
      icon: landscaping,
      link: "/aiPlanner/landscape",
      position: "bottom-[7%] left-1/2 -translate-x-1/2 sm:bottom-[8%] lg:bottom-[2%]",
    },
    {
      key: "image",
      icon: image,
      link: "/aiPlanner/enhance",
      position: "bottom-[30%] left-[-2%] sm:bottom-[30%] sm:left-[8%] lg:bottom-[28%] lg:left-[-2%]",
    },
    {
      key: "virtual",
      icon: virtual,
      link: "/aiPlanner/virtual",
      position: "top-[36%] left-[-1%] sm:top-[30%] sm:left-[8%] lg:top-[38%] lg:left-[6%]",
    },
  ];

  return (
    <section className="relative w-full py-16 md:py-20 lg:py-24 overflow-hidden bg-[var(--color-body)]">
      
      {/* Background Top Wave */}
      <div className="absolute top-[-120px] sm:top-[-180px] md:top-[-260px] lg:top-[-420px] xl:top-[-550px] left-0 w-full z-0">
        <img
          src={wave2}
          alt=""
          className="w-[180%] sm:w-[160%] md:w-[150%] lg:w-full mx-auto scale-[1.6] sm:scale-[1.4] md:scale-[1.2] lg:scale-100 pointer-events-none select-none"
        />
      </div>

      {/* Background Bottom Wave */}
      <div className="absolute bottom-[-40px] sm:bottom-[-70px] md:bottom-[-100px] lg:bottom-[-100px] xl:bottom-[-100px] left-0 w-full z-0 overflow-hidden">
        <img
          src={wave1}
          alt=""
          className="w-[180%] sm:w-[165%] md:w-[150%] lg:w-full mx-auto scale-[1.6] sm:scale-[1.4] md:scale-[1.2] lg:scale-100 pointer-events-none select-none"
        />
      </div>

      {/* Trust Section Title */}
      <h2
        className="text-center text-3xl sm:text-4xl md:text-5xl mb-12 md:mb-16 relative z-20 heading-dark-1"
        style={{ color: "var(--color-black)" }}
      >
        {t("title", { ns: "home5" })}
      </h2>

      {/* Swiper Logos */}
      <div className="relative w-screen -mx-[calc((100vw-100%)/2)] mb-16 md:mb-20 z-10">
        <Swiper
          modules={[Autoplay]}
          slidesPerView={7}
          spaceBetween={40}
          loop={true}
          speed={3000}
          autoplay={{
            disableOnInteraction: false,
            reverseDirection: true,
          }}
          centeredSlides={true}
          className="!overflow-visible"
        >
          {logos.concat(logos).map((logo, index) => (
            <SwiperSlide
              key={index}
              className="!w-auto flex justify-center transition-all duration-500 ease-out"
            >
              <div
                className="
                  relative group bg-[var(--color-body)] cursor-pointer
                  w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-48 lg:h-48
                  rounded-full border border-green-300
                  flex items-center justify-center
                  shadow-xl 
                  transition-all duration-300 ease-out
                  hover:scale-125
                "
              >
                <img
                  src={logo.icon}
                  alt="Logo"
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain transition-all duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 rounded-full bg-purple-200/30 blur-2xl opacity-0 group-hover:opacity-100 transition"></div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* --- NEW HOUSE DESIGN SECTION (Replaced the 3 Cards) --- */}
      <div className="max-w-[1540px] mx-auto px-4 sm:px-12 lg:px-6 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-10 mt-10 md:mt-20">
          
          {/* --- LEFT CONTENT --- */}
          <div className="flex flex-col items-center lg:items-start lg:ps-10 text-center lg:text-left space-y-6 lg:space-y-8">
            <h2 className="heading-light text-black">
              {t("homeDesign.title1", { ns: "home1" })} <br />
              <span>{t("homeDesign.title2", { ns: "home1" })}</span>
            </h2>

            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-lg lg:max-w-xl leading-relaxed">
              {t("homeDesign.description", { ns: "home1" })}
            </p>

            <Link
              to="/schedule/estimate"
              className="bg-[var(--color-primary)] text-white px-10 py-3 sm:px-14 sm:py-3.5 text-base sm:text-lg rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 inline-block"
            >
              {t("homeDesign.cta", { ns: "home1" })}
            </Link>
          </div>

          {/* --- RIGHT IMAGE & HOTSPOTS --- */}
          <div className="relative flex justify-center items-center mt-4 pb-10 lg:mt-0">
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
                  {/* Icon Circle */}
                  <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-sm shrink-0 group-hover:rotate-12 transition-transform">
                    <img
                      src={spot.icon}
                      alt={spot.key}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 object-contain brightness-0 invert"
                    />
                  </div>

                  {/* Text */}
                  <span className="text-[10px] sm:text-xs lg:text-sm font-bold text-gray-800 whitespace-nowrap">
                    {t(`homeDesign.hotspots.${spot.key}`, { 
                      ns: "home1", 
                      defaultValue: spot.key.charAt(0).toUpperCase() + spot.key.slice(1) 
                    })}
                  </span>
                </button>
              ))}

            </div>
          </div>

        </div>
      </div>

    </section>
  );
}