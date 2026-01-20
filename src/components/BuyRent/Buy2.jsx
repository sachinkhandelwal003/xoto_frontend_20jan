import React, { useState } from "react";
import avatarSrc from "../../assets/img/girlimage.png";
import waveint4 from "../../assets/img/wave/waveint4.png";
import { useTranslation } from "react-i18next";

export default function WhatAreYouLookingFor() {
  const { t } = useTranslation("buy2");
  const [activeTab, setActiveTab] = useState("rent");

  const tabContent = {
    rent: {
      title: t("tabs.rent.title"),
      text: t("tabs.rent.text"),
    },
    buy: {
      title: t("tabs.buy.title"),
      text: t("tabs.buy.text"),
    },
    sell: {
      title: t("tabs.sell.title"),
      text: t("tabs.sell.text"),
    },
  };

  return (
    <section className="relative bg-[var(--color-body)] overflow-hidden pt-15">
      {/* BOTTOM WAVE */}
      <div className="absolute -bottom-10 sm:-bottom-20 lg:-bottom-48 left-0 w-full z-0 pointer-events-none select-none">
        <img src={waveint4} alt="Decorative wave" className="w-full object-cover" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* HEADING */}
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-bold text-[#020202] text-3xl sm:text-4xl lg:text-5xl leading-tight">
            {t("heading.title")}
          </h2>

          <p className="mt-4 text-[16px] sm:text-[18px] lg:text-[20px] text-[#547593]">
            {t("heading.subtitle")}
          </p>

          {/* TABS */}
          <div className="mt-8 flex justify-center">
            <div className="rounded-xl p-1 bg-gradient-to-b from-[#03A4F4] to-[#64EF0A] max-w-[380px] sm:max-w-none mx-auto">
              <div className="flex flex-row items-center justify-center gap-2 sm:gap-5 px-2 py-1">

                {["rent", "buy", "sell"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`
                      whitespace-nowrap rounded-lg px-6 sm:px-10 py-3 sm:py-4 
                      text-sm sm:text-base font-semibold shadow-md transition-all 
                      ${
                        activeTab === tab
                          ? "bg-[#5C039B] text-white"
                          : "bg-white/10 text-white border border-white/40 hover:bg-[#5C039B] hover:text-white"
                      }
                    `}
                  >
                    {t(`buttons.${tab}`)}
                  </button>
                ))}

              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="max-w-5xl mx-auto mt-10 lg:mt-14 grid grid-cols-2 gap-4 sm:gap-6 lg:gap-13 items-center">
          <div className="max-w-[320px] lg:max-w-2xl flex flex-col mt-10 md:mt-8 lg:mt-0 lg:justify-center lg:ml-[150px]">
            <h1 className="font-semibold text-[#000000] text-[25px] lg:text-[29px] leading-[32px] text-left">
              {tabContent[activeTab].title}
            </h1>
            <p className="font-bold text-[#547593] mt-4 text-[18px] lg:text-[18px] text-left">
              {tabContent[activeTab].text}
            </p>
          </div>

          <div className="w-full flex mx-4 sm:mx-8 lg:mx-0 justify-center lg:justify-end mt-6 lg:mt-0">
            <img
              src={avatarSrc}
              alt="Xobia assistant"
              className="max-w-[180px] sm:max-w-[220px] md:max-w-sm lg:max-w-md"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
