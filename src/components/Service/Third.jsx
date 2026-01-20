import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import logo from "../../assets/img/xoto vault.png";
import maskgroup from "../../assets/img/Maskgroup1.png";
import rentimg from "../../assets/img/rental-home1.png";
import personimg from "../../assets/img/rent-person.png";

const dmSans = {
  fontFamily: "'DM Sans', sans-serif",
};

export default function Third() {
  const { t } = useTranslation("mort3");
  const [step, setStep] = useState(1);

  // PROGRESS BAR WIDTH (desktop only)
  const progressWidth = ((step - 1) / 3) * 100;

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        backgroundImage: `url(${maskgroup})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        ...dmSans,
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-800/85 via-purple-700/45 to-cyan-500/30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-16 md:py-24">

        {/* TITLE (2 lines – SAME UI) */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 -mt-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-white font-bold leading-tight text-center md:text-left">
            {t("title.line1")} <br />
            {t("title.line2")}
          </h2>

          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-[#5C039B] flex items-center justify-center shadow-xl">
            <img src={logo} className="h-20" alt="logo" />
          </div>
        </div>

        {/* DESKTOP TIMELINE */}
        <div className="relative hidden md:block w-full mt-20">

          {/* PROGRESS LINE */}
          <div className="relative w-full h-[4px] rounded-full bg-white/30">
            <div
              className="h-full bg-gradient-to-r from-[#03A4F4] to-[#64EF0A] rounded-full transition-all duration-500"
              style={{ width: `${progressWidth}%` }}
            />
          </div>

          {/* TIMELINE ICONS */}
          <div className="absolute -top-14 left-0 w-full flex justify-between px-10">

            {/* STEP 1 */}
            <div className="w-28 h-28 flex justify-center">
              <button
                onClick={() => setStep(1)}
                className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 
                ${step >= 1 ? "bg-[#5C039B] scale-110 shadow-xl" : "bg-gray-500/50"}`}
              >
                <img src={rentimg} className="w-14 h-14" />
              </button>
            </div>

            {/* STEP 2 */}
            <div className="w-28 h-28 flex justify-center items-center">
              <button
                onClick={() => setStep(2)}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 
                ${step >= 2 ? "bg-[#5C039B] scale-110 shadow-xl" : "bg-gray-500/50"}`}
              >
                <img src={personimg} className="w-10 h-10" />
              </button>
            </div>

            {/* STEP 3 */}
            <div className="w-28 h-28 flex justify-center items-center">
              <button
                onClick={() => setStep(3)}
                className={`w-12 h-12 rounded-full transition-all duration-300 
                ${step >= 3 ? "bg-[#5C039B] scale-110 shadow-xl" : "bg-gray-500/50"}`}
              />
            </div>

            {/* STEP 4 */}
            <div className="w-28 h-28 flex justify-center items-center">
              <button
                onClick={() => setStep(4)}
                className={`w-12 h-12 rounded-full transition-all duration-300 
                ${step >= 4 ? "bg-[#5C039B] scale-110 shadow-xl" : "bg-gray-500/50"}`}
              />
            </div>
          </div>

          {/* STEP CONTENT */}
          <div className="grid grid-cols-4 gap-10 mt-24">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} onClick={() => setStep(s)} className="cursor-pointer text-center">
                <span className="text-green-300 font-semibold">
                  {t(`steps.${s}.label`)}
                </span>
                <h3 className="text-white font-semibold text-lg mt-2">
                  {t(`steps.${s}.title`)}
                </h3>
                <p className="text-white/70 text-sm mt-2">
                  {t(`steps.${s}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* MOBILE TIMELINE */}
        <div className="md:hidden mt-20 px-6 relative">
          <div className="absolute left-10 top-4 bottom-0 w-[3px] bg-white/40" />

          <div className="flex flex-col gap-14">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="relative flex gap-6 items-start">
                <div
                  onClick={() => setStep(s)}
                  className={`z-10 rounded-full
                  ${step >= s ? "bg-[#5C039B] shadow-xl" : "bg-gray-500/50"}
                  ${s === 1 ? "w-14 h-14" : s === 2 ? "w-12 h-12" : "w-10 h-10"}`}
                >
                  {s === 1 && <img src={rentimg} className="w-8 h-8 mx-auto mt-3" />}
                  {s === 2 && <img src={personimg} className="w-6 h-6 mx-auto mt-3" />}
                </div>

                <div onClick={() => setStep(s)} className="flex flex-col">
                  <span className="text-green-300 font-semibold text-sm">
                    {t(`steps.${s}.label`)}
                  </span>
                  <h3 className="text-white font-semibold text-lg mt-1">
                    {t(`steps.${s}.title`)}
                  </h3>
                  <p className="text-white/70 text-sm mt-1">
                    {t(`steps.${s}.desc`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
