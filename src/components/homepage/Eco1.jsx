import React from "react";
import { useTranslation } from "react-i18next";
import waveBg from "../../assets/img/wave/waveint4.png";

// Images
import solarLighting from "../../assets/img/light.png";
import lowWaterPlant from "../../assets/img/chowk.png";
import ecoMaterials from "../../assets/img/plant.png";
import automatedControl from "../../assets/img/tab.png";
import futureReady from "../../assets/img/men.png";

export default function EcoSmartLiving() {
  const { t } = useTranslation("interior7");

  const features = [
    {
      title: "features.smartClimate.title",
      text: "features.smartClimate.text",
      gradient: true,
    },
    {
      title: "features.lighting.title",
      text: "features.lighting.text",
      image: solarLighting,
    },
    {
      title: "features.materials.title",
      text: "features.materials.text",
      image: lowWaterPlant,
    },
    {
      title: "features.water.title",
      text: "features.water.text",
      image: ecoMaterials,
    },
    {
      title: "features.automation.title",
      text: "features.automation.text",
      image: automatedControl,
    },
    {
      title: "features.future.title",
      text: "features.future.text",
      image: futureReady,
    },
  ];

  return (
    <section className="relative w-full overflow-hidden pb-20 bg-white min-h-screen">
      {/* Wave */}
      <div className="absolute -bottom-[15px] md:-bottom-[140px] lg:-bottom-[90px] left-0 w-full z-0 pointer-events-none">
  <img
    src={waveBg}
    alt="wave-bg"
    className="w-full object-cover opacity-90"
  />
</div>


      <div className="relative z-10 text-center mt-16 px-4 md:px-6">
        <h1 className="text-3xl md:text-5xl card-heading-1 text-black font-bold">
          {t("heading")}
        </h1>

        <p className="mt-4 text-[#547593] paragraph-light-1 max-w-3xl mx-auto text-base md:text-lg">
          {t("description")}
        </p>

        <h2 className="text-2xl md:text-3xl font-semibold mt-12 text-black">
          {t("subheading")}
        </h2>

        {/* FEATURES GRID */}
        <div className="mt-14 w-full max-w-6xl mx-auto flex justify-center">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-6 md:gap-x-12 lg:gap-20">
            
            {/* 1. Gradient Card */}
            <div className="flex justify-center">
              <div className="group rounded-full p-[8px] ring-4 ring-transparent hover:ring-[#5C039B] active:ring-[#5C039B] transition-all duration-300">
                <div className="w-[140px] h-[140px] md:w-[200px] md:h-[200px] rounded-full flex flex-col items-center justify-center text-center text-white bg-gradient-to-br from-purple-600 via-blue-500 to-cyan-400 shadow-xl group-hover:scale-105 transition-all px-2 md:px-4">
                  <span className="text-xs md:text-sm font-bold leading-tight">
                    {t(features[0].title)}
                  </span>
                  <p className="text-[9px] md:text-[11px] mt-1 md:mt-2 opacity-90 leading-tight">
                    {t(features[0].text)}
                  </p>
                </div>
              </div>
            </div>

            {/* Remaining Image Cards */}
            {features.slice(1).map((item, i) => (
              <div key={i} className="flex justify-center">
                <div className="group rounded-full p-[8px] ring-4 ring-transparent hover:ring-[#5C039B] active:ring-[#5C039B] transition-all duration-300">
                  <div
                    className="w-[140px] h-[140px] md:w-[200px] md:h-[200px] rounded-full bg-cover bg-center shadow-lg group-hover:scale-105 transition-all overflow-hidden relative"
                    style={{ backgroundImage: `url(${item.image})` }}
                  >
                    <div className="bg-black/40 w-full h-full flex flex-col items-center justify-center px-2 text-center text-white">
                      <span className="text-sm md:text-xl font-semibold leading-tight">
                        {t(item.title)}
                      </span>
                      {/* Optional Text */}
                      {/* <span className="text-[10px] md:text-xs mt-1 opacity-90">{t(item.text)}</span> */}
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