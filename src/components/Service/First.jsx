import React from "react";
import { useTranslation } from "react-i18next";
import CTAButtons from "./CTAButtons.jsx";

/* 👇 YAHAN PAR APNA NAYA FONT NAAM DAALEN (e.g., 'Poppins', 'Roboto', 'Inter') */
const customFontStyles = {
  fontFamily: "dm-sans, sans-serif", // <-- Yahan par apna font-family daalna hai
};

export default function HomeLoanHero() {
  const { t, i18n } = useTranslation("mort1");

  // RTL only for text direction, NOT alignment
  const isRTL = i18n.language === "fa";

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      // Changed h-140 to min-h-[60vh] to make the container responsive
      className="relative hero-bg bg-cover bg-center w-full min-h-[60vh] md:min-h-[80vh] flex items-center justify-center text-center overflow-hidden"
      style={customFontStyles} // 
    >
      {/* Optional: Added a subtle dark overlay so white text is always readable over the image */}
      <div className="absolute inset-0 bg-black/30 z-[1]"></div>

      {/* Bottom shapes - removed conflicting w-70 h-10 classes since your CSS already handles width/height */}
      <div className="clip-left-shape"></div>
      <div className="clip-right-shape"></div>

      <style>{`
        .hero-bg {
          background-image: url("https://xotostaging.s3.me-central-1.amazonaws.com/properties/1770010679861-serviceimg1.png");
        }

        .clip-left-shape {
          position: absolute;
          bottom: -1px; left: 0;
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
          bottom: -1px; right: 0;
          width: 30vw;
          max-width: 320px;                                            
          min-width: 120px;
          height: clamp(28px, 3.5vw, 48px);
          background: var(--color-body);
          z-index: 5;
          clip-path: polygon(47% 0, 100% 0, 100% 100%, 0% 100%);
        }
      `}</style>

      {/* Main Content Container */}
      <div className="relative z-[2] w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-white">
        
        {/* HERO TITLE - Made responsive with clamp() */}
        <h1
          className="heading-light font-semibold drop-shadow-lg"
          style={{ fontSize: 'clamp(32px, 5vw, 54px)', lineHeight: '1.2' }}
        >
          {t("title")}
        </h1>

        {/* HERO DESCRIPTION - Fixed invalid classes and made text size responsive */}
        <p className="mt-4 md:mt-6  block text-md sm:text-xl md:text-lg max-w-3xl mx-auto px-2  drop-shadow-md">
          {t("description.line1")}
          <br className="hidden sm:block" />
          {t("description.line2")}
        </p>

        {/* CTA */}
        <div className=" mt-8 md:mt-10 flex justify-center font-xl">
          <CTAButtons />
        </div>

      </div>
    </section>
  );
}