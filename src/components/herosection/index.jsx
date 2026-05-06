import React from "react";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import calender from "../../assets/icons/Homeicons/Calendar.png";
import clock from "../../assets/icons/Homeicons/Clock.png";
import gurantee from "../../assets/icons/Homeicons/Guarantee.png";
import map from "../../assets/icons/Homeicons/Map-pin.png";
import flag from "../../assets/img/home/flaggg1.png";
import layer from "../../assets/img/home/Layer1.png";

const icons = [gurantee, clock, map, calender];

const HeroSection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("home");
  const features = t("hero.features", { returnObjects: true });
const videoRef = useRef(null);

useEffect(() => {
  if (videoRef.current) {
    videoRef.current.play().catch(() => {
      
    });
  }
}, []);
  return (
    <section className="relative w-full min-h-[80vh] overflow-hidden flex items-center justify-center text-white pt-24 pb-16 md:pt-28 md:pb-20 xl:pt-32 xl:pb-24">

      {/* UAE FLAG — scales down on mobile */}
     <div className="absolute top-[1px] left-0 z-10 
  w-[90px] 
  sm:w-[110px] 
  md:w-[150px] 
  lg:w-[190px] 
  xl:w-[230px] 
  pointer-events-none">
  
  <img 
    src={flag} 
    alt="UAE Flag" 
    className="w-full h-auto object-contain"
  />
</div>

      {/* EXCLUSIVE DEALS LAYER — scales down on mobile */}
  <div className="absolute 
  top-[0px] 
  sm:top-[20px] 
  md:top-[-10px] 
  right-8
  z-10 
  w-[28px] 
  sm:w-[50px] 
  md:w-[70px] 
  lg:w-[90px] 
  xl:w-[110px] 
  cursor-pointer"
>
  <img 
    src="https://xotostaging.s3.me-central-1.amazonaws.com/properties/1777723555826-Group%20%282%29.png" 
    alt="Exclusive Deals" 
    className="w-full h-auto object-contain"
    onClick={() => navigate("/Property#buy3")}
  />
</div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 z-[1]" />

      {/* Background Video */}
   <video
  ref={videoRef}
  autoPlay
  loop
  muted={true}
  playsInline
  preload="auto"
  disablePictureInPicture
  controls={false}
  className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
>
  <source
    src="https://xotostaging.s3.me-central-1.amazonaws.com/properties/1776514026285-1768043300370-mortgage2+%282%29.mp4"
    type="video/mp4"
  />
</video>

      {/* ── MAIN CONTENT ── */}
      <div className="relative z-[2] w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col items-center text-center gap-8 sm:gap-10">
        <div className="w-full space-y-4 sm:space-y-6">

          {/* Heading */}
          <h1
            className="heading-light w-full text-center flex flex-col items-center gap-1 sm:gap-2"
            style={{ fontSize: 'clamp(28px, 6vw, 54px)', lineHeight: '1.15' }}
          >
            <span className="block">{t("hero.title1")}</span>
            <span className="block">{t("hero.title2")}</span>
          </h1>

          {/* Description */}
          <p className="block text-sm sm:text-base md:text-lg max-w-3xl mx-auto px-2">
            {t("hero.description")}
          </p>

          {/* CTA Buttons */}
          <div className="pt-2 sm:pt-4 w-full">
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
              <Link
                to="/mortgage/services"
                className="whitespace-nowrap text-center border border-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-md hover:bg-[#5C039B] hover:text-white hover:border-[#5C039B] transition text-xs sm:text-sm md:text-base"
              >
                {t("hero.buttons.loan")}
              </Link>
              <Link
                to="/Property"
                className="whitespace-nowrap text-center border border-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-md hover:bg-[#5C039B] hover:text-white hover:border-[#5C039B] transition text-xs sm:text-sm md:text-base"
              >
                {t("hero.buttons.explore")}
              </Link>
              <Link
                to="/aiPlanner"
                className="whitespace-nowrap text-center border border-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-md hover:bg-[#5C039B] hover:text-white hover:border-[#5C039B] transition text-xs sm:text-sm md:text-base"
              >
                {t("hero.buttons.design")}
              </Link>
            </div>
          </div>

          {/* Features grid */}
          <div className="mt-6 sm:mt-8 mx-auto grid grid-cols-2 gap-4 sm:gap-6 md:gap-8 w-fit">
            {features.map((item, i) => (
              <div key={i} className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[var(--color-primary)] rounded-full flex items-center justify-center flex-shrink-0">
                  <img src={icons[i]} className="w-4 h-4 sm:w-5 sm:h-5" alt="" />
                </div>
                <span className="font-semibold text-sm sm:text-base md:text-lg text-left leading-snug">
                  {item.line1}
                  <br />
                  {item.line2}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Bottom decorative shapes */}
      <div className="home-clip-left" />
      <div className="home-clip-right" />

      <style>{`
        .home-clip-left {
          position: absolute;
          bottom: -1px; left: 0;
          width: 30vw;
          max-width: 320px;
          min-width: 120px;
          height: clamp(28px, 3.5vw, 48px);
          background: var(--color-body);
          z-index: 5;
          clip-path: polygon(0 0, 55% 0, 100% 100%, 0% 100%);
        }
        .home-clip-right {
          position: absolute;
          bottom: -1px; right: 0;
          width: 30vw;
          max-width: 320px;
          min-width: 120px;
          height: clamp(28px, 3.5vw, 48px);
          background: var(--color-body);
          z-index: 5;
          clip-path: polygon(47% 0, 100% 0, 100% 100%, 0% 100%);
        }
        @media (min-width: 360px) {
          .xs\\:text-\\[2\\.25rem\\] { font-size: 2.25rem !important; }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;