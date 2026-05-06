"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { useTranslation } from "react-i18next";
import waveint5 from "../../assets/img/wave/waveint5.png"; 


export default function Partners() {
  
  const { t } = useTranslation("buy4");

  // Define the logos array
const logos = [
  { icon: "https://xotostaging.s3.me-central-1.amazonaws.com/properties/1777634402520-0bfe197a-1eb7-4f3e-857b-595593d71d1b.png", name: "National Bank of Fujairah" },
  { icon: "https://xotostaging.s3.me-central-1.amazonaws.com/properties/1777634705455-0002ec34-e883-4970-a3cc-6f33938eede6.png", name: "United Arab Bank" },
  { icon: "https://xotostaging.s3.me-central-1.amazonaws.com/properties/1777634860202-05b977de-f84b-4637-8345-9a33dd25936f.png", name: "Standard Chartered" },
  { icon: "https://xotostaging.s3.me-central-1.amazonaws.com/properties/1777635393936-5d36d8c0-39cb-4e88-83a6-4e36c75ca5ea.png", name: "Ajman Bank" },
  { icon: "https://xotostaging.s3.me-central-1.amazonaws.com/properties/1777635458816-72f71d2a-44fc-4c7c-a761-434da9cf60a8.png", name: "Emirates Islamic" },
  { icon: "https://xotostaging.s3.me-central-1.amazonaws.com/properties/1777635560035-983ddc3b-8dad-48f5-b5ca-648158f6e339.png", name: "Emirates NBD" },
  { icon: "https://xotostaging.s3.me-central-1.amazonaws.com/properties/1777635664202-16008193-f1d0-489b-98a7-6e10b7408b77.png", name: "First Abu Dhabi Bank" },
  { icon: "https://xotostaging.s3.me-central-1.amazonaws.com/properties/1777635748575-b0d21192-853b-4294-a507-6535689cc5d9.png", name: "Arab Bank" },
  { icon: "https://xotostaging.s3.me-central-1.amazonaws.com/properties/1777635836118-c81b929a-e87a-439b-b958-06cd204a802b.png", name: "Sharjah Islamic Bank" },
  { icon: "https://xotostaging.s3.me-central-1.amazonaws.com/properties/1777635748575-b0d21192-853b-4294-a507-6535689cc5d9.png", name: "Arab Bank" },
  { icon: "https://xotostaging.s3.me-central-1.amazonaws.com/properties/1777635926571-c588e02d-7ce1-4644-a487-a8c53fe6e14a.png", name: "DIB" },
  { icon: "https://xotostaging.s3.me-central-1.amazonaws.com/properties/1777635748575-b0d21192-853b-4294-a507-6535689cc5d9.png", name: "Arab Bank" },
  { icon: "https://xotostaging.s3.me-central-1.amazonaws.com/properties/1777635995995-c67161d9-7915-4a73-8533-76bff1b4f839.png", name: "ADIB" },
  { icon: "https://xotostaging.s3.me-central-1.amazonaws.com/properties/1777636055717-d9cdc373-1dcb-42a2-81ae-32a33ed22a30.png", name: "HSBC" },
  { icon: "https://xotostaging.s3.me-central-1.amazonaws.com/properties/1777636162753-ed4fc4bf-8f11-46f0-a9fc-87c465adf1c1.png", name: "Mashreq" },
  { icon: "https://xotostaging.s3.me-central-1.amazonaws.com/properties/1777636252792-f3a3b2be-e5a3-471d-892d-54c986daf19f.png", name: "Bank of Baroda" },
  { icon: "https://xotostaging.s3.me-central-1.amazonaws.com/properties/1777636312740-f7596794-fb67-4cd0-b971-4453059e61ab.png", name: "Commercial Bank Of Dubai" },
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