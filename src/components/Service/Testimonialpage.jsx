'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import wave1 from "../../assets/img/wave/waveint2.png";
import wave2 from "../../assets/img/wave/wave2.png";
import building from "../../assets/icons/Homeicons/building.png";
import rental from "../../assets/icons/Homeicons/rental.png";
import sale from "../../assets/icons/Homeicons/sale.png";
import company1 from "../../assets/img/home/companylogo1.png";
import company2 from "../../assets/img/home/companylogo2.png";
import company3 from "../../assets/img/home/companylogo3.png";

export default function Testimonialpage() {

  const logos = [
    { icon: company1 },
    { icon: company2 },
    { icon: company3 },
    { icon: company1 },
    { icon: company2 },
    { icon: company3 },
    { icon: company1 },
    { icon: company2 },
    { icon: company3 },
  ];

  return (
    <section className="relative w-full py-16 md:py-20 lg:py-12 overflow-hidden bg-[var(--color-body)]">

    

   <div
  className="
    absolute
    bottom-[-10px]
    md:bottom-[-60px]
    lg:bottom-[-80px]

    sm:right-[-200px]     /* mobile shift */
    md:left-0          /* center on md+ */

    w-full
    overflow-hidden
    z-0
    pointer-events-none
    select-none
  "
>
  <img
    src={wave1}
    alt=""
    className="
      w-full
      h-auto
      object-cover
      scale-x-125 md:scale-x-110 lg:scale-x-100
    "
  />
</div>


      {/* Title */}
      <h2 className="text-center text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-900 mb-12 md:mb-16 relative z-20">
Our Partners      </h2>

      {/* Swiper */}
      <div className="relative w-screen -mx-[calc((100vw-100%)/2)] mb-16 md:mb-20">
        <Swiper
          modules={[Autoplay]}
          slidesPerView={7}
          spaceBetween={40}
          loop={true}
          speed={3000}
          autoplay={{
            // delay: 0,
            disableOnInteraction: false,
            reverseDirection: true,
          }}
          centeredSlides={true}
          className="!overflow-visible"
          onProgress={(swiper) => {
            swiper.slides.forEach((slide) => {
              const slideProgress = slide.progress;
              const scale = 1 - Math.min(Math.abs(slideProgress * 0.55), 0.8);
              const opacity = 1 - Math.min(Math.abs(slideProgress * 0.35), 0.6);

              slide.style.transform = `scale(${scale})`;
              slide.style.opacity = opacity;
            });
          }}
          onSetTranslate={(swiper) => {
            swiper.slides.forEach((slide) => {
              const slideProgress = slide.progress;
              const scale = 1 - Math.min(Math.abs(slideProgress * 0.25), 0.4);
              const opacity = 1 - Math.min(Math.abs(slideProgress * 0.35), 0.6);

              slide.style.transform = `scale(${scale})`;
              slide.style.opacity = opacity;
            });
          }}
        >

          {logos.concat(logos).map((logo, index) => (
            <SwiperSlide
              key={index}
              className="!w-auto flex justify-center transition-all duration-500 ease-out"
            >
              {/* HOVER-SCALE CIRCLE */}
              <div
                className="
                  relative group bg-white cursor-pointer
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

                {/* Glow effect */}
                <div className="absolute inset-0 rounded-full bg-purple-200/30 blur-2xl opacity-0 group-hover:opacity-100 transition duration-300"></div>
              </div>

            </SwiperSlide>
          ))}

        </Swiper>
      </div>

      
    </section>
  );
}
