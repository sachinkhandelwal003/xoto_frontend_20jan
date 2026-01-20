"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import wave1 from "../../assets/img/wave/wave1.png";
// import round from "../../assets/img/round231.mp4";
import rating from "../../assets/icons/Homeicons/rating.png";
import partner from "../../assets/icons/Homeicons/partners.png";
import vector from "../../assets/icons/Homeicons/Vector.png";
import dollar from "../../assets/icons/Homeicons/dollar.png";
import finance from "../../assets/icons/Homeicons/finance.png";
import target from "../../assets/icons/Homeicons/target.png";

const BuiltForEveryone = () => {
  const { t } = useTranslation("home3");

  const cards = [
    { icon: rating, titleKey: "customers.title", descKey: "customers.desc" },
    { icon: vector, titleKey: "business.title", descKey: "business.desc" },
    { icon: partner, titleKey: "execution.title", descKey: "execution.desc" },
    { icon: dollar, titleKey: "alliances.title", descKey: "alliances.desc" },
    { icon: target, titleKey: "developers.title", descKey: "developers.desc" },
    { icon: finance, titleKey: "finance.title", descKey: "finance.desc" },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [cardsToShow, setCardsToShow] = useState(2);
  const [activeBtn, setActiveBtn] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setCardsToShow(mobile ? 1 : 2);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const nextSlide = () => {
    const maxIndex = cards.length - cardsToShow;
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
  };

  const prevSlide = () => {
    const maxIndex = cards.length - cardsToShow;
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  };

  useEffect(() => {
    const autoSlide = setInterval(() => {
      const maxIndex = cards.length - cardsToShow;
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 3000);

    return () => clearInterval(autoSlide);
  }, [cardsToShow]);

  return (
    <section className="relative  overflow-hidden py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-body)]">
      {/* Wave */}
      <div className="absolute bottom-[-20px] sm:bottom-[-50px] md:bottom-[-80px] lg:bottom-[-130px] xl:bottom-[-160px] left-0 w-full z-0  ">
        <img
          src={wave1}
          alt=""
          className="w-[180%] sm:w-[165%] md:w-[150%] lg:w-full -ml-[20%] sm:-ml-[12%] md:-ml-[8%] lg:ml-0 scale-[1.6] sm:scale-[1.4] md:scale-[1.2] lg:scale-100"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto  ">
        <h2
          className="text-center mb-6 lg:mb-16 heading-light"
          style={{ color: "var(--color-black)" }}
        >
          {t("title")}
        </h2>

        <div className="flex flex-col lg:flex-row items-center justify-between">
          {/* Video */}
          <div className="w-full lg:w-1/2 flex justify-start items-start mb-10 lg:mb-25">
            <div className="relative w-60 h-60 sm:w-100 sm:h-100 lg:w-110 lg:h-110 mx-auto">
              <video
                src={"https://xotostaging.s3.me-central-1.amazonaws.com/properties/1768044487658-round231.mp4"}
                autoPlay
                loop
                muted
                playsInline
                className="w-full object-contain"
              />
            </div>
          </div>

          {/* Slider */}
    <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start">
  {/* The "Window": This MUST have overflow-hidden and a defined width */}
  <div className="relative w-full max-w-sm lg:max-w-2xl overflow-hidden rounded-xl">
    <div
      className="flex transition-transform duration-500 ease-in-out"
      style={{
        // Using translateX with exact 100% units works best when children are also 100%
        transform: `translateX(-${
          isMobile
            ? currentIndex * 100
            : currentIndex * (100 / cardsToShow)
        }%)`,
      }}
    >
      {cards.map((card, index) => (
        <div
          key={index}
          className="flex-shrink-0 w-full" 
          style={{
            // On mobile, width is exactly 100% of the parent 'Window'
            width: isMobile ? "100%" : `${100 / cardsToShow}%`,
            padding: "0 4px", // Tiny horizontal padding to prevent cards touching
          }}
        >
          {/* Content Card: This is where the white background and shadow live */}
          <div
            className={`bg-white rounded-xl p-6 h-full transition-all duration-300 ${
              index === currentIndex
                ? "shadow-xl opacity-100"
                : "opacity-70"
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800 leading-tight">
                {t(card.titleKey)}
              </h3>
              <div className="bg-[var(--color-primary)] p-2 rounded-full shrink-0 ml-2">
                <img src={card.icon} alt="" className="w-6 h-6" />
              </div>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              {t(card.descKey)}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* Arrows Section */}
  <div className="flex gap-3 mt-8">
    <button
      onClick={() => { prevSlide(); setActiveBtn("left"); }}
      className={`p-3 rounded-sm border transition-all duration-300 ${
        activeBtn === "left" 
          ? "bg-[var(--color-primary)] text-white" 
          : "bg-white text-black hover:bg-gray-100"
      }`}
    >
      <ChevronLeft className="w-5 h-5" />
    </button>
    <button
      onClick={() => { nextSlide(); setActiveBtn("right"); }}
      className={`p-3 rounded-sm border transition-all duration-300 ${
        activeBtn === "right" 
          ? "bg-[var(--color-primary)] text-white" 
          : "bg-white text-black hover:bg-gray-100"
      }`}
    >
      <ChevronRight className="w-5 h-5" />
    </button>
  </div>
</div>
        </div>
      </div>
    </section>
  );
};

export default BuiltForEveryone;
