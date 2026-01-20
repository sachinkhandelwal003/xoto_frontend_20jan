import React from "react";
import { useTranslation } from "react-i18next";
import waveBg from "../../assets/img/wave/wave2.png";

// images
import solarLighting from "../../assets/img/solar.png";
import lowWaterPlant from "../../assets/img/jungle.png";
import ecoMaterials from "../../assets/img/wooden.png";
import automatedControl from "../../assets/img/mobile.png";
import futureReady from "../../assets/img/something.png";

export default function EcoSmartLiving() {
  const { t } = useTranslation("scape1");

  const features = [
    {
      type: "smart",
      title: "features.smartIrrigation.title",
      text: "features.smartIrrigation.text",
      gradient: true,
    },
    {
      title: "features.solarLighting",
      image: solarLighting,
    },
    {
      title: "features.lowWaterPlant",
      image: lowWaterPlant,
    },
    {
      title: "features.ecoMaterials",
      image: ecoMaterials,
    },
    {
      title: "features.automatedControl",
      image: automatedControl,
    },
    {
      title: "features.futureReady",
      image: futureReady,
    },
  ];

  return (
    <section className="relative w-full overflow-hidden pb-20 bg-white">
      {/* Wave */}
   <div className="absolute -bottom-[60px] sm:-bottom-[80px] md:-bottom-[580px] left-0 w-full z-0 pointer-events-none">
  <img src={waveBg} alt="wave" className="w-full object-cover" />
</div>



      <div className="relative z-10 text-center mt-16 px-4 md:px-6">
        {/* Heading */}
        <h1 className="font-semibold text-3xl md:text-[60px] md:leading-[48px] text-[#020202]">
          {t("heading")}
        </h1>

        {/* Description */}
        <p className="mt-4 text-base md:text-[24px] md:leading-[33px] text-[#547593] max-w-[968px] mx-auto">
          {t("description")}
        </p>

        {/* Subheading */}
        <h2 className="mt-10 font-semibold text-2xl md:text-[31px] md:leading-[55px] text-[#020202]">
          {t("subheading")}
        </h2>

        {/* Features Grid */}
        <div className="mt-14 w-full max-w-6xl mx-auto flex justify-center">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-6 md:gap-x-12 lg:gap-20">
            
            {/* 1. Smart Irrigation (Gradient Card) */}
            <div className="flex justify-center">
              <div className="group rounded-full p-[8px] ring-4 ring-transparent hover:ring-[#5C039B] active:ring-[#5C039B] transition-all duration-300">
                <div className="w-[140px] h-[140px] md:w-[200px] md:h-[200px] rounded-full flex flex-col items-center justify-center text-center text-white bg-gradient-to-br from-purple-600 via-blue-500 to-cyan-400 shadow-xl group-hover:scale-105 transition-all px-2 md:px-4">
                  <span className="text-xs md:text-lg font-bold leading-tight">
                    {t(features[0].title)}
                  </span>
                  <p className="text-[9px] md:text-[11px] mt-1 md:mt-2 opacity-90 leading-tight">
                    {t(features[0].text)}
                  </p>
                </div>
              </div>
            </div>

            {/* Remaining Features (Image Cards) */}
            {features.slice(1).map((item, i) => (
              <div key={i} className="flex justify-center">
                <div className="group rounded-full p-[8px] ring-4 ring-transparent hover:ring-[#5C039B] active:ring-[#5C039B] transition-all duration-300">
                  <div
                    className="w-[140px] h-[140px] md:w-[200px] md:h-[200px] rounded-full bg-cover bg-center shadow-lg group-hover:scale-105 transition-all overflow-hidden relative"
                    style={{ backgroundImage: `url(${item.image})` }}
                  >
                    {/* Dark Overlay for text readability */}
                    <div className="bg-black/40 w-full h-full flex flex-col items-center justify-center px-2 md:px-4 text-center text-white">
                      <span className="text-sm md:text-xl font-semibold leading-tight">
                        {t(item.title)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
          </div>
        </div>
      </div>
    </section>
  );
}