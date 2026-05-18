import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom"; // 🚀 Import Navigate
import HouseChart from "../../assets/img/new 1.png";
import waveBg from "../../assets/img/wave/wave2.png";
import GetPreApprovedModal from "../homepage/GetPreApprovedModal";

const Second = () => {
  const { t, i18n } = useTranslation("mort2");
  const navigate = useNavigate(); // 🚀 Hook initialize kiya
  const [active, setActive] = useState("borrow");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isRTL = i18n.language === "fa";
  const dmSans = { fontFamily: "'DM Sans', sans-serif" };

  // 🚀 Navigation function
  const handleCalculatorRedirect = () => {
    navigate("/mortgages/calculator");
  };

  return (
    <>
      <section
        dir={isRTL ? "rtl" : "ltr"}
        className="relative w-full py-12 lg:py-15 bg-[var(--color-body)] overflow-hidden"
      >
        {/* BACKGROUND WAVE */}
        <div className="absolute bottom-0 left-0 w-full z-0 pointer-events-none translate-y-1/4 lg:translate-y-1/2">
          <img
            src={waveBg}
            alt="wave-bg"
            className="w-full h-auto object-cover opacity-90"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          
          {/* 1. MODE BUTTONS */}
          {/* <div className="flex justify-center mb-12">
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
              {["borrow", "estimate"].map((mode) => (
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
                    border transition-all duration-200 ease-out
                 hover:bg-[var(--color-primary)]
          hover:border-[#5C039B]
          hover:shadow-lg
                  `}
                  style={dmSans}
                >
                  {t(`modes.${mode}`)}
                </button>
              ))}
            </div>
          </div> */}

          {/* 2. MAIN CONTENT ROW */}
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 mb-16">
            
            <div className={`w-full lg:w-3/5 text-center ${isRTL ? "lg:text-right" : "lg:text-left"}`}>
              <h2
                className="text-3xl sm:text-5xl lg:text-6xl font-semibold text-gray-900 leading-tight mb-6"
                style={dmSans}
              >
                {t("title")}
              </h2>
              <p 
                className="text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
                style={dmSans}
              >
                {t("description")}
              </p>
            </div>

            <div className="w-full lg:w-2/5 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[320px] sm:max-w-[420px] lg:max-w-none">
                <img
                  src={HouseChart}
                  alt={t("imageAlt")}
                  className="w-full h-auto drop-shadow-2xl animate-float transition-transform duration-500 hover:scale-105 cursor-pointer"
                  onClick={handleCalculatorRedirect} // 🚀 Image par click karne se bhi calculator par jaye
                />
              </div>
            </div>
          </div>

          {/* 3. BOTTOM CTA SECTION */}
          <div className="flex flex-col items-center space-y-6">
            <button
              onClick={handleCalculatorRedirect} // 🚀 Ye button ab sidha calculator page par bhejega
              className="w-full max-w-[500px] py-4 sm:py-5 bg-[#5C039B] text-white text-xl sm:text-2xl font-bold rounded-2xl shadow-[0_10px_25px_-5px_rgba(92,3,155,0.4)] hover:bg-[#4a027d] hover:-translate-y-1 active:scale-[0.98] transition-all duration-300"
              style={dmSans}
            >
              {t("cta")}
            </button>
            
            {/* Modal open karne ke liye ek alag chhota link de sakte ho ya is disclaimer ko clickeable bana sakte ho */}
            <p
              className="text-base sm:text-lg text-[#5C039B] font-medium italic text-center max-w-lg cursor-pointer hover:underline"
              style={dmSans}
              onClick={() => setIsModalOpen(true)} // 🚀 Pre-approved modal ab yahan se open hoga
            >
              {t("disclaimer")}
            </p>
          </div>

        </div>
      </section>

      <GetPreApprovedModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default Second;