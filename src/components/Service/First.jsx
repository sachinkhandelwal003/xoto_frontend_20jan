import React from "react";
import { useTranslation } from "react-i18next";
import CTAButtons from "./CTAButtons.jsx";
import herobg from "../../assets/img/serviceimg1.png";

/* Inject DM Sans font inside component */
const dmSans = {
  fontFamily: "'DM Sans', sans-serif",
}; 

export default function HomeLoanHero() {
  const { t, i18n } = useTranslation("mort1");

  // RTL only for text direction, NOT alignment
  const isRTL = i18n.language === "fa";

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="relative bg-cover bg-center w-full h-140 text-center"
      style={{ backgroundImage: `url(${herobg})`, ...dmSans }}
    >
      {/* Bottom shapes */}
      <div className="absolute bottom-0 left-0 w-70 h-10 bg-[var(--color-body)] z-[5] clip-left-shape"></div>
      <div className="absolute bottom-0 right-0 w-70 h-10 bg-[var(--color-body)] z-[5] clip-right-shape"></div>

      {/* Custom clip paths */}
      <style>{`
        .clip-left-shape {
          clip-path: polygon(0 0, 55% 0, 100% 100%, 0% 100%);
        }
        .clip-right-shape {
          clip-path: polygon(47% 0, 100% 0, 100% 100%, 0% 100%);
        }
      `}</style>

      <div className="hero-overlay p-8 md:p-16" style={dmSans}>
        <div className="max-w-6xl mx-auto text-white py-20 md:py-28 text-center">
          
          {/* HERO TITLE */}
          <h1
            className="text-3xl md:text-6xl heading-light font-extrabold"
            style={{ lineHeight: "1.4", ...dmSans }}
          >
            {t("title")}
          </h1>

          {/* HERO DESCRIPTION */}
          <p
            className="mt-4 md:w-3/4 mx-auto text-sm md:text-2xl paragraph-light font-semibold"
            style={dmSans}
          >
            {t("description.line1")}
            <br />
            {t("description.line2")}
          </p>

          {/* CTA */}
          <div className="mt-8 flex justify-center">
            <CTAButtons />
          </div>

        </div>
      </div>
    </section>
  );
}
