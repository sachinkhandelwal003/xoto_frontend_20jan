import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import jjjImage from "../../assets/img/jjj.png";
import wave1 from "../../assets/img/wave/wave1.png";

const WhyPartnerSection = () => {
  const { t } = useTranslation("whyPartner");
  const [active, setActive] = useState(1);

  const features = [
    { id: 1, title: t("features.1.title"), desc: t("features.1.desc") },
    { id: 2, title: t("features.2.title"), desc: t("features.2.desc") },
    { id: 3, title: t("features.3.title"), desc: t("features.3.desc") },
    { id: 4, title: t("features.4.title"), desc: t("features.4.desc") },
  ];

  const progressWidth = `${(active / features.length) * 100}%`;
  const progressHeight = `${(active / features.length) * 100}%`;

  return (
    <section className="relative w-full bg-white overflow-hidden py-20">
      {/* WAVE */}
      <div className="absolute bottom-[-20px] md:bottom-[-200px] left-0 w-full z-0">
        <img
          src={wave1}
          alt=""
          className="w-full min-w-[130%] md:min-w-full scale-[1.7] md:scale-100 pointer-events-none select-none"
        />
      </div>

      {/* HEADING */}
      <div className="text-center mb-10 relative z-10">
        <h2 className="text-4xl md:text-5xl font-semibold text-black heading-dark-1">
          {t("title")} <span className="text-black">XOTO?</span>
        </h2>
      </div>

      {/* IMAGE */}
      <div className="flex justify-center mb-16 relative z-10">
        <img
          src={jjjImage}
          alt="XOTO platform illustration"
          className="w-[380px] md:w-[480px] drop-shadow-2xl"
        />
      </div>

      {/* ========= DESKTOP HORIZONTAL PROGRESS ========= */}
      <div className="hidden md:flex justify-center mb-6 relative z-10">
        <div className="relative w-[85%] h-[8px] bg-gray-200 rounded-full">
          <div
            className="absolute left-0 top-0 h-[8px] bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500"
            style={{ width: progressWidth }}
          />
        </div>
      </div>

      {/* ========= DESKTOP FEATURES ========= */}
      <div className="hidden md:flex relative z-10 justify-center items-start max-w-7xl mx-auto px-6 mb-20 space-x-10">
        {features.map((item) => (
          <div
            key={item.id}
            onClick={() => setActive(item.id)}
            className="w-[22%] cursor-pointer"
          >
            <p className="text-xs text-gray-400 mb-1">
              {t("featureLabel", { id: item.id })}
            </p>

            <h3
              className={`text-2xl font-bold transition-all duration-300 ${
                active === item.id
                  ? "text-[var(--color-text-secondary)]"
                  : "text-gray-400"
              }`}
            >
              {item.title}
            </h3>

            <p
              className={`text-md mt-2 transition-opacity duration-300 ${
                active === item.id ? "text-slate-600" : "text-gray-300"
              }`}
            >
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* ========= MOBILE VERSION ========= */}
      <div className="md:hidden block relative z-10 px-6 mb-12">
        <div className="flex gap-5">
          {/* VERTICAL PROGRESS (LEFT) */}
          <div className="relative w-[6px] bg-gray-200 rounded-full">
           <div
  className="absolute left-0 top-0 w-full bg-gradient-to-b from-green-400 to-green-500 rounded-full transition-all duration-500"
  style={{ height: progressHeight }}
/>

          </div>

          {/* FEATURES */}
          <div className="flex flex-col gap-8 w-full">
            {features.map((item) => (
              <div
                key={item.id}
                onClick={() => setActive(item.id)}
                className="cursor-pointer"
              >
                <p className="text-xs text-gray-400 mb-1">
                  {t("featureLabel", { id: item.id })}
                </p>

                <h3
                  className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                    active === item.id
                      ? "text-[var(--color-text-secondary)]"
                      : "text-gray-400"
                  }`}
                >
                  {item.title}
                </h3>

                <p
                  className={`text-sm leading-relaxed transition-colors duration-300 ${
                    active === item.id ? "text-slate-600" : "text-gray-300"
                  }`}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyPartnerSection;
