import React from "react";
import { useTranslation } from "react-i18next";
import CTAButtons from "./CTAButtons.jsx";

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
      className="relative hero-bg bg-cover bg-center w-full h-140 text-center"
      style={dmSans} 
    >
      {/* Bottom shapes */}
      <div className="absolute bottom-0 left-0 w-70 h-10 bg-[var(--color-body)] z-[5] clip-left-shape"></div>
      <div className="absolute bottom-0 right-0 w-70 h-10 bg-[var(--color-body)] z-[5] clip-right-shape"></div>

      <style>{`
        /* Your original image URL is back here */
        .hero-bg {
          background-image: url("https://xotostaging.s3.me-central-1.amazonaws.com/properties/1770010679861-serviceimg1.png");
        }

        .clip-left-shape {
          position: absolute;
          bottom: 0; left: 0;
          width: 30vw;
          max-width: 320px;
          min-width: 120px;
          height: clamp(28px, 3.5vw, 48px);
          background: var(--color-body);
          z-index: 5;
          clip-path: polygon(0 0, 55% 0, 100% 100%, 0% 100%);
        }
        
        .clip-right-shape {
          position: absolute;
          bottom: 0; right: 0;
          width: 30vw;
          max-width: 320px;
          min-width: 120px;
          height: clamp(28px, 3.5vw, 48px);
          background: var(--color-body);
          z-index: 5;
          clip-path: polygon(47% 0, 100% 0, 100% 100%, 0% 100%);
        }
        
        @media (min-width: 360px) {
          .xs\\:text-\\[2\\.25rem\\] { font-size: 2.25rem !important; }
        }
      `}</style>

      <div className="hero-overlay p-8 md:p-16">
        <div className="max-w-6xl mx-auto text-white py-20 md:py-28 text-center">
          
          {/* HERO TITLE */}
          <h1
            className="heading-light font-bold"
            style={{ fontSize: '54px', lineHeight: '1.4' }}
          >
            {t("title")}
          </h1>

          {/* HERO DESCRIPTION */}
          <p className="mt-4 md:w-3/4 mx-auto text-sm md:text-2xl paragraph-light font-xl">
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