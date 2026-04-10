"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { useTranslation } from "react-i18next";
// import ADIB from "../../assets/xoto_partners/xoto_logo1.png";
import Ajman from "../../assets/xoto_partners/xoto_logo2.png";
import DIB from "../../assets/xoto_partners/xoto_logo3.png";
// import FAB from "../../assets/xoto_partners/xoto_logo4.png";
import HSBC from "../../assets/xoto_partners/xoto_logo5.png";
import Mashreq from "../../assets/xoto_partners/xoto_logo6.png";
import NBF from "../../assets/xoto_partners/xoto_logo7.png";
import RAK from "../../assets/xoto_partners/xoto_logo8.png";
import SC from "../../assets/xoto_partners/xoto_logo9.png";
import SIB from "../../assets/xoto_partners/xoto_logo10.png";
import UAB from "../../assets/xoto_partners/xoto_logo11.png";


// import partner6 from '../../assets/xoto_partners/xoto_logo6.png';
// import partner7 from '../../assets/xoto_partners/xoto_logo7.png';
// import partner8 from '../../assets/xoto_partners/xoto_logo8.png';
// import partner9 from '../../assets/xoto_partners/xoto_logo9.png';
// import partner10 from '../../assets/xoto_partners/xoto_logo10.png';
// import partner11 from '../../assets/xoto_partners/xoto_logo11.png';
import waveint5 from "../../assets/img/wave/waveint5.png"; 


export default function TrustPresenceSection() {
  const { t } = useTranslation("buy4");

  // Define the logos array
const logos = [
  // { icon: ADIB, name: "ADIB" },
  { icon: Ajman, name: "Ajman Bank" },
  { icon: DIB, name: "DIB" },
  // { icon: FAB, name: "FAB" },
  { icon: HSBC, name: "HSBC" },
  { icon: Mashreq, name: "Mashreq Bank" },
  { icon: NBF, name: "NBF Bank" },
  { icon: RAK, name: "RAK Bank" },
  { icon: SC, name: "Standard Chartered" },
  { icon: SIB, name: "SIB" },
  { icon: UAB, name: "UAB" },
];


  return (
    <section className="relative w-full py-16 md:py-20 lg:py-24 overflow-hidden bg-[var(--color-body)]">
      
      {/* Background Wave */}
      <div className="absolute bottom-90 left-0 w-full z-0 pointer-events-none select-none">
        <img src={waveint5} alt="" className="w-full object-cover" />
      </div>

      {/* Title */}
      <h2
        className="text-center text-3xl sm:text-4xl md:text-5xl mb-12 md:mb-16 relative z-20 heading-dark-1"
        style={{ color: "var(--color-black)" }}
      >
        {t("title")}
      </h2>

      {/* Swiper */}
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
      w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40
      rounded-full border border-green-300
      flex items-center justify-center
      shadow-xl 
      transition-all duration-300 ease-out
      hover:scale-115
    "
  >
 <img
  src={logo.icon}
  alt={logo.name}
  className="
    max-w-[75%] max-h-[95%]
    sm:max-w-[80%] sm:max-h-[90%]
    md:max-w-[75%] md:max-h-[95%]
    object-contain
    transition-all duration-300
    group-hover:scale-110
  "
/>

    <div className="absolute inset-0 rounded-full bg-purple-200/30 blur-2xl opacity-0  transition"></div>
  </div>
</SwiperSlide>

               ))}
             </Swiper>
           </div>
    </section>
  );
}