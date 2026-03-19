import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import HouseChart from "../../assets/img/new 1.png";
import waveBg from "../../assets/img/wave/wave2.png";
import GetPreApprovedModal from "../homepage/GetPreApprovedModal";

const Second = () => {
  const { t, i18n } = useTranslation("mort2");

  const [active, setActive] = useState("borrow");
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state

  const isRTL = i18n.language === "fa";

  const dmSans = { fontFamily: "'DM Sans', sans-serif" };

  return (
    <>
      <section
        dir={isRTL ? "rtl" : "ltr"}
        className={`relative w-full py-12 pb-32 bg-[var(--color-body)] overflow-hidden ${
          isRTL ? "text-right" : "text-left"
        }`}
      >
        {/* BACKGROUND WAVE - Responsive Positioning */}
        <div
          className="
            absolute
            bottom-[-80px]     /* default → mobile */
            sm:bottom-[-120px] /* ≥ 640px */
            md:bottom-[-80px]  /* ≥ 768px */
            lg:bottom-[-600px] /* ≥ 1024px */
            left-0 w-full z-0 pointer-events-none
          "
        >
          <img
            src={waveBg}
            alt="wave-bg"
            className="w-full h-auto object-cover opacity-90"
          />
        </div>

        {/* CONTENT CONTAINER */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 top-4">


          {/* MODE BUTTONS (Gradient Container) */}
          <div
            className="
              flex flex-nowrap sm:flex-wrap
              overflow-x-auto sm:overflow-visible scrollbar-hide
              gap-2 sm:gap-3
              bg-[linear-gradient(to_right,#03AAF4,#64EF0A)]
              p-4 sm:p-6 lg:p-2
              rounded-xl
              w-full sm:w-auto
              max-w-full sm:max-w-max
              mx-auto
              items-center
            "
          >
            {["borrow", "estimate", ].map((mode) => (
              <button
                key={mode}
                onClick={() => setActive(mode)}
                className={`
                  flex-shrink-0
                  px-4 sm:px-6
                  py-2.5 sm:py-3
                  text-sm sm:text-base
                  font-medium text-white
                  rounded-xl whitespace-nowrap
                  border-1 transition-all duration-200 ease-out
                  ${
                    active === mode
                      ? "bg-[var(--color-primary)] border-transparent shadow-md sm:shadow-lg sm:scale-[1.03]"
                      : "bg-transparent border-white hover:bg-[#5C039B] hover:border-transparent"
                  }
                `}
              >
                {t(`modes.${mode}`)}
              </button>
            ))}
          </div>

         {/* --- TOP ROW (Text & Image) --- */}
         <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 lg:px-8 relative top-6 ">
            
    {/* LEFT SIDE: Text */}
    <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left z-20 ">
      
      <h2
  className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.15] mb-6 whitespace-pre-line"
  style={dmSans}
>
  {t("title")}
</h2>

      {/* Subtitle / Description */}
      <p 
        className="text-base sm:text-lg text-gray-600 max-w-md leading-relaxed" 
        style={dmSans}
      >
        {t("description")} 
      </p>

    </div>

    {/* RIGHT SIDE: House Image */}
    <div className="w-full lg:w-1/2 relative flex justify-center lg:justify-end z-20 relative top-10 right-20">
      <img
        src={HouseChart}
        alt={t("imageAlt")}
        className="w-full max-w-[350px] sm:max-w-[450px] lg:max-w-[500px] object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
      />
    </div>

  </div>

          {/* --- BOTTOM ROW (Calculate Button & Disclaimer) --- */}
        <div className="w-full flex flex-col items-center justify-center z-20 relative top-8">
  <div className="w-full max-w-[380px] sm:max-w-[480px] lg:max-w-[600px]">

    {/* CTA BUTTON */}
    <div className="w-full flex justify-center ">
  <button
    onClick={() => setIsModalOpen(true)}
    className="w-[500px] py-3 bg-[#5C039B] text-white text-xl sm:text-2xl font-semibold rounded-xl shadow-lg hover:bg-purple-900 hover:-translate-y-1 transition-all duration-300 whitespace-nowrap"
    style={dmSans}
  >
    {t("cta")}
  </button>
</div>

    {/* DISCLAIMER */}
    <p
      className="mt-4 text-lg lg:text-lg text-[#5C039B] italic text-center px-4"
      style={dmSans}
    >
      {t("disclaimer")}
    </p>

  </div>
</div>

        </div>
      </section>

      {/* MODAL - Rendered outside the section for proper overlay */}
      <GetPreApprovedModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default Second;