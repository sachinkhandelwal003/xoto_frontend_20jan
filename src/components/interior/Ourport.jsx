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
  const { t } = useTranslation("interior4");

  const scrollRef = useRef(null);
  const [activeBtn, setActiveBtn] = useState(0);

  const scrollLeft = () => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.firstChild?.offsetWidth || 280;
      scrollRef.current.scrollBy({
        left: -(cardWidth + 24),
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.firstChild?.offsetWidth || 280;
      scrollRef.current.scrollBy({
        left: cardWidth + 24,
        behavior: "smooth",
      });
    }
  };

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
    // FIX 1: Padding bottom ko 'pb-12 sm:pb-16' kar diya (bohot kam kar diya)
    <section className="relative w-full bg-[var(--color-body)] pt-12 pb-12 sm:pt-16 sm:pb-16 overflow-hidden">
      
      {/* Heading */}
      <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="heading-dark-1 text-3xl sm:text-4xl md:text-5xl text-center text-black font-semibold">
          {t("title")}
        </h2>
      </div>

      {/* Horizontal Scroller Container */}
      <div className="relative w-full z-20 mt-10 sm:mt-12 flex flex-col items-center">
        
        {/* FIX 2: Scroll container ki bottom padding 'pb-12' se 'pb-8' kar di */}
        <div
          ref={scrollRef}
          className="flex w-full gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-8 snap-x snap-mandatory"
          style={{ 
            paddingLeft: "calc(50vw - 8rem)", 
            paddingRight: "calc(50vw - 8rem)", 
            overflowY: "visible" 
          }}
        >
          {services.map((service, index) => (
            <div
              key={index}
              className="flex-none w-64 sm:w-72 md:w-80 
              bg-white rounded-3xl p-8
              flex flex-col items-center justify-center text-center 
              transition-all duration-300 hover:scale-105 snap-center"
              style={{ boxShadow: "0 8px 24px rgba(92,3,155,0.12)" }}
            >
              <div className="w-20 h-20 rounded-full bg-[#5C039B] flex items-center justify-center mb-6 shadow-lg shrink-0">
                <img src={service.icon} alt={t(service.title)} className="w-10 h-10 object-contain" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 leading-snug">
                {t(service.title)}
              </h3>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4 mt-2 relative z-30">
          <button
            onClick={() => { scrollLeft(); setActiveBtn("left"); }}
            className={`p-3 rounded-md border shadow-sm transition-all duration-300 ${
              activeBtn === "left"
                ? "bg-[var(--color-primary)] text-white border-transparent"
                : "bg-white border-gray-200 text-[#5C039B] hover:bg-[var(--color-primary)] hover:text-white"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => { scrollRight(); setActiveBtn("right"); }}
            className={`p-3 rounded-md border shadow-sm transition-all duration-300 ${
              activeBtn === "right"
                ? "bg-[var(--color-primary)] text-white border-transparent"
                : "bg-white border-gray-200 text-[#5C039B] hover:bg-[var(--color-primary)] hover:text-white"
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* FIX 3: Wave ko aur tight position de di hai */}
      <div className="absolute left-0 w-full z-0 pointer-events-none select-none bottom-0 sm:-bottom-4 md:-bottom-10">
        <img src={waveint2} alt="wave-bg" className="w-full object-cover" />
      </div>

      {/* Global Style to hide scrollbar */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

    </section>
  );
}