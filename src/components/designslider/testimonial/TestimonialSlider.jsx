import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { useTranslation } from "react-i18next";

import home from "../../../assets/img/logo/logohome.png";
import connect from "../../../assets/img/logo/logoconnect.png";
import blitz from "../../../assets/img/logo/logoblitz.png";
import grid from "../../../assets/img/logo/logogrid.png";
import vault from "../../../assets/img/logo/logovault.png";
import aaImage from "../../../assets/img/aa.jpg";

const EcosystemSlider = () => {
  const { t } = useTranslation("home4");

  const ecosystemData = [
    { logo: home, key: "home" },
    { logo: connect, key: "connect" },
    { logo: blitz, key: "blitz" },
    { logo: grid, key: "grid" },
    { logo: vault, key: "vault" },
  ];

  return (
    <section className="relative w-full bg-[var(--color-body)] py-10 sm:py-12 md:py-16 lg:py-20 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img src={aaImage} alt="City" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-8xl mx-auto">
        {/* Title */}
        <h2 className="text-center text-white mb-10 drop-shadow-xl heading-light">
          {t("title")}
        </h2>

        {/* Swiper */}
        <Swiper
          modules={[Pagination, Navigation, Autoplay]}
          pagination={{
            clickable: true,
            bulletActiveClass:
              "swiper-pagination-bullet-active !bg-white !opacity-100",
            bulletClass:
              "swiper-pagination-bullet !bg-white/50 !w-2 !h-2 md:!w-3 md:!h-3",
          }}
          autoplay={{
            delay: 4500,
            disableOnInteraction: false,
          }}
          centeredSlides
          loop
          grabCursor
          // Reduced spaceBetween values here
          breakpoints={{
            320: { slidesPerView: 1.05, spaceBetween: 10 },
            480: { slidesPerView: 1.1, spaceBetween: 15 },
            640: { slidesPerView: 1.15, spaceBetween: 20 },
            768: { slidesPerView: 1.25, spaceBetween: 25 },
            1024: { slidesPerView: 1.35, spaceBetween: 30 },
            1280: { slidesPerView: 1.45, spaceBetween: 40 },
            1536: { slidesPerView: 1.5, spaceBetween: 40 },
          }}
          className="!pb-16"
        >
          {ecosystemData.map((item, index) => (
            <SwiperSlide key={index}>
              {({ isActive }) => (
                <div
                  className={`
                    group relative flex flex-row items-center justify-start text-left
                    rounded-[2rem] sm:rounded-[3rem] md:rounded-[4rem]
                    min-h-[180px] sm:min-h-[220px] lg:min-h-[240px]
                    w-full mx-auto
                    max-w-[340px] xs:max-w-[400px] sm:max-w-[580px]
                    md:max-w-[720px] lg:max-w-[880px] xl:max-w-[950px]
                    px-4 py-4 sm:px-8 sm:py-8 md:px-10 md:py-10
                    transition-all duration-500 ease-out shadow-xl border border-white/10
                    ${
                      isActive
                        ? "scale-100 bg-gradient-to-br from-[#500286] via-black to-[#500286] text-white"
                        : "scale-95 bg-gradient-to-br from-[#500286] via-black to-[#500286] text-gray-300 opacity-80"
                    }
                  `}
                >
                  {/* Logo - Left Side */}
                  <div className="flex-shrink-0 flex items-center justify-center w-[100px] sm:w-[160px] md:w-[200px]">
                    <img
                      src={item.logo}
                      alt="Logo"
                      className={`
                        object-contain transition-all duration-300
                        w-[90px] h-[55px]
                        xs:w-[110px] xs:h-[65px]
                        sm:w-[150px] sm:h-[90px]
                        md:w-[185px] md:h-[110px]
                        lg:w-[205px] lg:h-[122px]
                        ${isActive ? "scale-105" : "scale-100"}
                      `}
                    />
                  </div>

                  {/* Description - Right Side */}
                  <div className="flex flex-col flex-1 pl-3 sm:pl-6 md:pl-8">
                    <p className="leading-snug sm:leading-relaxed font-bold text-[12px] xs:text-[13px] sm:text-[15px] md:text-[16px] lg:text-[18px]">
                      {t(`descriptions.${item.key}`)}
                    </p>
                  </div>
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="swiper-pagination !static !bottom-0 !mt-4" />
      </div>
    </section>
  );
};

export default EcosystemSlider;