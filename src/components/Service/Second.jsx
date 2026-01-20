import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import HouseChart from "../../assets/img/mortgage.png";
import waveBg from "../../assets/img/wave/wave2.png";
import GetPreApprovedModal from "../homepage/GetPreApprovedModal";

const Second = () => {
  const { t, i18n } = useTranslation("mort2");

  const [active, setActive] = useState("borrow");
  const [feature, setFeature] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state

  // 4 steps = 25% each
  const progress = feature * 25;
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
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          {/* TITLE */}
          <h2
            className="text-center text-3xl md:text-5xl font-bold text-black mb-8"
            style={dmSans}
          >
            {t("title")}
          </h2>

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
            {["borrow", "estimate", "check"].map((mode) => (
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

          {/* IMAGE */}
          <div className="w-full flex justify-center mb-10">
            <img
              src={HouseChart}
              alt={t("imageAlt")}
              className="w-56 sm:w-72 md:w-80 object-contain drop-shadow-xl"
            />
          </div>

          {/* --- DESKTOP VIEW (Horizontal Bar) --- */}
          <div className="hidden lg:block mb-6">
            <div className="w-full max-w-4xl mx-auto h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-2 bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="hidden lg:flex w-full relative z-20 justify-between max-w-4xl mx-auto text-left gap-4">
            {[1, 2, 3, 4].map((num) => (
              <div
                key={num}
                onClick={() => setFeature(num)}
                className={`cursor-pointer transition-all duration-300 ${
                  feature === num ? "scale-[1.05]" : ""
                }`}
              >
                <p className={`text-xs mb-1 ${feature === num ? "text-[var(--color-primary)]" : "text-gray-400"}`}>
                  {t(`features.${num}.label`)}
                </p>
                <h3 className={`text-lg font-semibold ${feature === num ? "text-[var(--color-primary)]" : "text-black"}`}>
                  {t(`features.${num}.title`)}
                </h3>
              </div>
            ))}
          </div>

          {/* --- MOBILE VIEW (Vertical Timeline like screenshot) --- */}
          <div className="lg:hidden relative max-w-xs mx-auto">
            {/* Vertical Gray Line */}
            <div className="absolute left-2 top-2 bottom-4 w-1.5 bg-gray-200 rounded-full"></div>

            {/* Vertical Green Progress Line */}
            <div
              className="absolute left-2 top-2 w-1.5 bg-green-500 rounded-full transition-all duration-500 ease-out"
              style={{ height: `${(feature / 4) * 100}%` }}
            ></div>

            <div className="flex flex-col gap-8 pl-8">
              {[1, 2, 3, 4].map((num) => (
                <div
                  key={num}
                  onClick={() => setFeature(num)}
                  className="cursor-pointer relative"
                >
                  <p
                    className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                      feature >= num ? "text-black" : "text-gray-400"
                    }`}
                  >
                    {t(`features.${num}.label`)}
                  </p>
                  <h3
                    className={`text-xl font-bold transition-colors duration-300 ${
                      feature === num
                        ? "text-[var(--color-primary)]"
                        : "text-gray-500"
                    }`}
                  >
                    {t(`features.${num}.title`)}
                  </h3>
                </div>
              ))}
            </div>
          </div>

          {/* CTA BUTTON - Now opens the modal */}
          <div className="flex justify-center z-20 relative mt-12 px-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="
                w-full
                max-w-[420px] sm:max-w-[480px] md:max-w-[420px]
                px-8 sm:px-12
                py-4
                bg-[var(--color-primary)]
                text-white
                text-base sm:text-lg
                rounded-xl
                shadow-lg
                hover:opacity-90
                transition-opacity
              "
              style={dmSans}
            >
              {t("cta")}
            </button>
          </div>

          {/* DISCLAIMER */}
          <p
            className="text-center mt-6 text-xs sm:text-sm text-[var(--color-primary)] italic px-6"
            style={dmSans}
          >
            {t("disclaimer")}
          </p>
        </div>
      </section>

      {/* MODAL - Rendered outside the section for proper overlay & z-index */}
      <GetPreApprovedModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default Second;