"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

import wave1 from "../../assets/img/wave/waveint2.png";
import wave2 from "../../assets/img/wave/wave2.png";

import building from "../../assets/icons/Homeicons/building.png";
import rental from "../../assets/icons/Homeicons/rental.png";
import sale from "../../assets/icons/Homeicons/sale.png";

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

export default function TrustPresenceSection() {
  const { t } = useTranslation("home5"); // ✅ NEW namespace added

  const logos = [
      { icon: partner1 },
      { icon: partner2 },
      { icon: partner3 },
      { icon: partner4 },
      { icon: partner5 },
      { icon: partner6 },
      { icon: partner7 },
      { icon: partner8 },
      { icon: partner9 },
      { icon: partner10 },
      { icon: partner11 },
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

      {/* Title */}
      <h2
        className="text-center text-3xl sm:text-4xl md:text-5xl mb-12 md:mb-16 relative z-20 heading-dark-1"
        style={{ color: "var(--color-black)" }}
      >
        {t("title")}
      </h2>

      {/* Swiper Logos */}
      <div className="relative w-screen -mx-[calc((100vw-100%)/2)] mb-16 md:mb-20">
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

      {/* Three Cards */}
      <div className="grid grid-cols-1 mt-20 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4 pt-20 relative z-10">
        {/* Card 1 */}
        <a
          href="/landscaping"
          className="
            block cursor-pointer bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 lg:p-10
            shadow-xl shadow-purple-400 hover:shadow-2xl hover:shadow-purple-500
            transition-all duration-300 hover:-translate-y-3 border border-white/50
          "
        >
          <div className="w-30 h-30  flex align-center justify-center mx-auto mb-4 ">
            <img src={building} alt="" className="" />
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 text-center">
            {t("cards.card1.title")}
          </h3>
          <p className="text-sm sm:text-base text-gray-600 text-center">
            {t("cards.card1.desc")}
          </p>
        </a>

        {/* Card 2 */}
        <a
          href="/marketplace"
          className="
            block cursor-pointer bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 lg:p-10
            shadow-xl shadow-purple-400 hover:shadow-2xl hover:shadow-purple-500
            transition-all duration-300 hover:-translate-y-3 border border-white/50
          "
        >
          <div className="w-30 h-30  flex align-center justify-center mx-auto mb-4">
            <img src={sale} alt="" />
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 text-center">
            {t("cards.card2.title")}
          </h3>
          <p className="text-sm sm:text-base text-gray-600 text-center">
            {t("cards.card2.desc")}
          </p>
        </a>

        {/* Card 3 */}
        <a
          href="/marketplace"
          className="
            block cursor-pointer bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 lg:p-10
            shadow-xl shadow-purple-400 hover:shadow-2xl hover:shadow-purple-500
            transition-all duration-300 hover:-translate-y-3 border border-white/50
          "
        >
          <div className="w-30 h-30  flex align-center justify-center mx-auto mb-4 ">
            <img src={rental} alt="" />
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 text-center">
            {t("cards.card3.title")}
          </h3>
          <p className="text-sm sm:text-base text-gray-600 text-center">
            {t("cards.card3.desc")}
          </p>
        </a>
      </div>
    </section>
  );
}
