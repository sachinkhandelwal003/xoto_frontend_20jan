"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function HeroSectionInterior() {
  const { t } = useTranslation("interior1");

  return (
    <div
      // Added min-h to make sure the background covers enough space
      className="relative w-full min-h-[70vh] md:min-h-[80vh] flex items-center justify-center bg-cover bg-center bg-no-repeat hero-bg-interior"
    >
      {/* Overlay: Isse white text humesha clear dikhega chahe background image light ho */}
  

      {/* Bottom clipping shapes */}
      <div className="absolute bottom-0 left-0 w-72 h-12 bg-[var(--color-body)] z-[3] clip-left-shape" />
      <div className="absolute bottom-0 right-0 w-72 h-12 bg-[var(--color-body)] z-[3] clip-right-shape" />

      <style>{`
        .hero-bg-interior {
          background-image: url("https://xotostaging.s3.me-central-1.amazonaws.com/properties/1770010584911-mainbgg.png");
        }
        .clip-left-shape {
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
        .clip-right-shape {
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
      `}</style>
      
      {/* Main Content (z-10 ensures it stays above the black overlay) */}
      <div className="relative z-10 px-4 sm:px-6 md:px-10 lg:px-16 w-full max-w-5xl mx-auto text-center">

        {/* FIX: Title - Mobile pe 4xl (nice 2 lines), Tablet 5xl, PC 6xl. Font medium for elegant look */}
        <h1 className="mb-4 md:mb-6 text-white text-4xl sm:text-5xl md:text-6xl font-medium  drop-shadow-lg leading-[1.15]">
          {t("title")}
        </h1>

        {/* FIX: Description - Removed invalid 'font-xl', made text responsive */}
        <p className="mb-8 sm:mb-10 text-sm sm:text-base md:text-xl text-white/95 drop-shadow-md max-w-3xl mx-auto leading-relaxed">
          {t("description")}
        </p>

        {/* Buttons (Same inline layout as you requested) */}
        <div className="flex flex-row items-center justify-center gap-2 sm:gap-6 mx-auto w-full px-2 sm:px-0">
          
          <Link to="/estimate/calculator/interior" className="flex-1 sm:flex-none">
            <button className="w-full group inline-flex items-center justify-center gap-1.5 sm:gap-3  rounded-md bg-transparent border-2 px-2 sm:px-6 py-3 sm:py-4 text-[13px] sm:text-xl font-medium text-white shadow-xl transition-all hover:bg-[#5C039B] hover:text-white hover:border-[#5C039B] transition ">
              <span>{t("buttons.estimate")}</span>
              <ArrowRight className="h-4 w-4 sm:h-6 sm:w-6 group-hover:translate-x-1" />
            </button>
          </Link>

          <Link to="/ecommerce/b2c" className="flex-1 sm:flex-none">
            <button className="w-full bg-transparent hover:bg-[#5C039B] hover:text-white hover:border-[#5C039B] text-white px-2 sm:px-8 py-3 sm:py-4 rounded-md text-[13px] sm:text-lg font-medium shadow-xl transition-all flex items-center justify-center border-2  hover:border-[#5C039B] whitespace-nowrap">
              {t("buttons.store")}
            </button>
          </Link>
          
        </div>

      </div>
    </div>
  );
}