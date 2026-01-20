"use client";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import wave1 from "../../assets/img/wave/waveint2.png";
// import round from "../../assets/img/round231.mp4";
import rating from "../../assets/icons/Homeicons/rating.png";
import partner from "../../assets/img/ecosystem/finance.png";
import vector from "../../assets/img/ecosystem/business.png";
import dollar from "../../assets/img/ecosystem/stratagic.png";
import finance from "../../assets/img/ecosystem/vector.png";
import target from "../../assets/img/ecosystem/dev.png";

const BuiltForEveryone = () => {
  const { t } = useTranslation("builtForEveryone");

  const cards = [
    { icon: vector, title: t("cards.business.title"), desc: t("cards.commonDesc") },
    { icon: rating, title: t("cards.contractors.title"), desc: t("cards.commonDesc") },
    { icon: partner, title: t("cards.execution.title"), desc: t("cards.commonDesc") },
    { icon: dollar, title: t("cards.strategic.title"), desc: t("cards.commonDesc") },
    { icon: target, title: t("cards.developers.title"), desc: t("cards.commonDesc") },
    { icon: finance, title: t("cards.financial.title"), desc: t("cards.commonDesc") }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [cardsToShow, setCardsToShow] = useState(2);

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
  }, [cardsToShow, cards.length]);

  return (
    <section className="relative bg-[var(--color-body)] overflow-hidden py-3 px-4 sm:px-6 lg:px-8">
      <div className="absolute bottom-[-20px] sm:bottom-[-50px] md:bottom-[-80px] lg:bottom-[-130px] left-0 w-full z-20 pointer-events-none">
        <img
          src={wave1}
          alt=""
          className="w-[180%] sm:w-[165%] md:w-[150%] lg:w-full -ml-[20%] sm:-ml-[12%] md:-ml-[8%] lg:ml-0 scale-[1.6] sm:scale-[1.4] md:scale-[1.2] lg:scale-100 pointer-events-none select-none"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <h2 className="text-center mb-12 lg:mb-16 heading-light" style={{ color: "var(--color-black)" }}>
          {t("title")}
        </h2>

        <div className="flex flex-col lg:flex-row items-center justify-between ">
          <div className="w-full lg:w-1/2 flex justify-start items-start mb-10 lg:mb-25">
            <div className="relative w-60 h-60 sm:w-100 sm:h-100 lg:w-110 lg:h-110 mx-auto">
              <video src={"https://xotostaging.s3.me-central-1.amazonaws.com/properties/1768044487658-round231.mp4"} autoPlay loop muted playsInline className="w-full object-contain" />
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start">
            <div className="relative w-full max-w-sm lg:max-w-2xl overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out gap-4"
                style={{
                  /* FIXED MATH: We must add the 16px (gap-4) to the 100% width calculation */
                  transform: isMobile 
                    ? `translateX(calc(-${currentIndex} * (100% + 16px)))` 
                    : `translateX(-${currentIndex * (100 / cardsToShow)}%)`
                }}
              >
                {cards.map((card, index) => (
                  <div
                    key={index}
                    className={`flex-shrink-0 bg-white rounded-xl p-6 transition-all duration-300 ${
                      index >= currentIndex && index < currentIndex + cardsToShow
                        ? "shadow-xl scale-100 opacity-100"
                        : "opacity-70 scale-95"
                    }`}
                    style={{
                      width: isMobile
                        ? "100%"
                        : `calc(${100 / cardsToShow}% - 12px)` /* Adjusted for gap */
                    }}
                  >
                    <div className="flex justify-between items-center mb-4 ">
                      <h3 className="text-xl card-heading">{card.title}</h3>
                      <div className="bg-[var(--color-primary)] p-2 rounded-full">
                        <img src={card.icon} alt="" className="w-6 h-6" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed ">
                      {card.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-30 flex gap-3 mt-8 mb-16 sm:mb-0">
              <button
                onClick={prevSlide}
                className="p-3 rounded-sm border border-gray-300 bg-white text-black hover:bg-[#5c039b] hover:text-white transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="p-3 rounded-sm border border-gray-300 bg-white text-black hover:bg-[#5c039b] hover:text-white transition"
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