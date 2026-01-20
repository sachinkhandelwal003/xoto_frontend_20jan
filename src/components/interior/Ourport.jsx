import waveint2 from "../../assets/img/service/wave4.png";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import construction from "../../assets/img/service/construction-worker.png";
import electrical from "../../assets/img/service/electrical.png";
import kitchen from "../../assets/img/service/kitchen123.png";
import lamp from "../../assets/img/service/lamp.png";
import wall from "../../assets/img/service/wall.png";
import wardrobe from "../../assets/img/service/wardrobe123.png";
import frushing from "../../assets/img/service/furshing.png";
import falsi from "../../assets/img/service/falsi.png";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ServicesPortfolio() {
  // 🔥 IMPORTANT: interior4 namespace
  const { t } = useTranslation("interior4");

  const scrollRef = useRef(null);
  const [activeBtn, setActiveBtn] = useState(0);

  const scrollLeft = () => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.firstChild?.offsetWidth || 280;
      scrollRef.current.scrollBy({
        left: -(cardWidth + 25),
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.firstChild?.offsetWidth || 280;
      scrollRef.current.scrollBy({
        left: cardWidth + 25,
        behavior: "smooth",
      });
    }
  };

  // ❌ UI change नहीं, सिर्फ keys
  const services = [
    { title: "services.kitchen", icon: kitchen },
    { title: "services.wardrobe", icon: wardrobe },
      { title: "services.lighting", icon: lamp },
    { title: "services.electrical", icon: electrical },
    { title: "services.civil", icon: construction },
     { title: "services.falsi", icon: falsi },
    { title: "services.wall", icon: wall },
        { title: "services.frushing", icon: frushing },
         
  ];

  return (
    <section className="relative w-full overflow-hidden bg-[var(--color-body)] py-20 sm:py-24">
      {/* Heading */}
      <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="heading-dark-1 sm:text-4xl md:text-5xl text-center text-black">
          {/* 🔥 interior4.json → title */}
          {t("title")}
        </h2>
      </div>

      {/* Horizontal Scroller */}
      <div className="relative w-full px-4 sm:pl-16 z-20 mt-16 flex flex-col gap-4">
        <div
          ref={scrollRef}
          className="flex gap-5 sm:gap-8 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pb-10"
        >
          {services.map((service, index) => (
            <div
              key={index}
              className="flex-none w-72 sm:w-72 md:w-80 
              bg-white rounded-3xl p-8 sm:p-8 
              flex flex-col items-center text-center 
              transition-all duration-300 hover:scale-105 hover:shadow-2xl snap-center"
              style={{ boxShadow: "0 12px 28px rgba(92,3,155,0.5)" }}
            >
              <div className="w-20 h-20 rounded-full bg-[#5C039B] flex items-center justify-center mb-6 shadow-lg">
                <img
                  src={service.icon}
                  alt={t(service.title)}
                  className="w-12 h-12"
                />
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                {t(service.title)}
                
              </h3>
            </div>
          ))}
        </div>

        {/* Scroll Buttons */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={() => {
              scrollLeft();
              setActiveBtn("left");
            }}
            className={`p-3 rounded-sm border transition ${
              activeBtn === "left"
                ? "bg-[var(--color-primary)] text-white border-transparent"
                : "bg-white border-gray-300 hover:bg-[var(--color-primary)] hover:text-white"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              scrollRight();
              setActiveBtn("right");
            }}
            className={`p-3 rounded-sm border transition ${
              activeBtn === "right"
                ? "bg-[var(--color-primary)] text-white border-transparent"
                : "bg-white border-gray-300 hover:bg-[var(--color-primary)] hover:text-white"
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Wave */}
      <div className="absolute -bottom-20 sm:-bottom-24 w-full z-0 pointer-events-none select-none">
        <img src={waveint2} alt="wave-bg" className="w-full object-cover" />
      </div>
    </section>
  );
}
