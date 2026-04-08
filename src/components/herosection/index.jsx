import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import calender from "../../assets/icons/Homeicons/Calendar.png";
import clock from "../../assets/icons/Homeicons/Clock.png";
import gurantee from "../../assets/icons/Homeicons/Guarantee.png";
import map from "../../assets/icons/Homeicons/Map-pin.png";

const icons = [gurantee, clock, map, calender];

const HeroSection = () => {
  const { t } = useTranslation("home");

  const features = t("hero.features", { returnObjects: true });

  return (
    <section className="relative w-full min-h-[80vh] overflow-hidden flex items-center justify-center text-white pt-24 pb-16 md:pt-28 md:pb-20 xl:pt-32 xl:pb-24">
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 z-[1]" />

      {/* Background Video */}
      <video
        autoPlay
        loop 
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source
          src="https://xotostaging.s3.me-central-1.amazonaws.com/properties/1768043300370-mortgage2.mp4"
          type="video/mp4"
        />
      </video>

      {/* Content — fully centered */}
      <div className="relative z-[2] w-full  max-w-6xl mx-auto  lg:px-12 flex flex-col items-center text-center gap-10">
        
        <div className="w-full space-y-6">
          
          {/* Heading - Responsive wrapping (Mobile par wrap, Desktop par exactly 2 lines) */}
      <h1 className="heading-light w-full text-center leading-tight text-3xl sm:text-4xl md:text-5xl lg:text-6xl px-2 flex flex-col items-center">
  
  {/* First Line */}
  <span className="block">
    {t("hero.title1")}
  </span>

  {/* Second Line */}
  <span className="block">
    {t("hero.title2")}
  </span>

</h1>

          {/* Description */}
          <p className="paragraph-light-1 text-lg max-w-3xl mx-auto">
            {t("hero.description")}
          </p>

          {/* Buttons — centered */}
          <div className="pt-4 w-full">
            <div className="flex flex-wrap justify-center gap-4">

              {/* Loan Button */}
              <Link
                to="/mortgages"
                className="whitespace-nowrap w-auto text-center border border-white px-6 py-3 rounded-md hover:bg-[#5C039B] hover:text-white hover:border-[#5C039B] transition text-sm sm:text-base"
              >
                {t("hero.buttons.loan")}
              </Link>

              {/* Explore Button */}
              <Link
                to="/Property"
                className="whitespace-nowrap w-auto text-center border border-white px-6 py-3 rounded-md hover:bg-[#5C039B] hover:text-white hover:border-[#5C039B] transition text-sm sm:text-base"
              >
                {t("hero.buttons.explore")}
              </Link>

              {/* AI Planner Button */}
              <Link
                to="/aiPlanner"
                className="whitespace-nowrap w-auto text-center border border-white px-6 py-3 rounded-md hover:bg-[#5C039B] hover:text-white hover:border-[#5C039B] transition text-sm sm:text-base"
              >
                {t("hero.buttons.design")}
              </Link>

            </div>
          </div>

          {/* Features — centered grid */}
          <div className="mt-8 mx-auto grid grid-cols-2 gap-8 w-fit">
            {features.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--color-primary)] rounded-full flex items-center justify-center flex-shrink-0">
                  <img src={icons[i]} className="w-5 h-5" alt="" />
                </div>
                <span className="font-semibold text-lg text-left">
                  {item.line1}
                  <br />
                  {item.line2}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Bottom decorative shapes */}
      <div className="absolute bottom-0 left-0 w-70 h-10 bg-[var(--color-body)] z-[5] clip-left-shape" />
      <div className="absolute bottom-0 right-0 w-70 h-10 bg-[var(--color-body)] z-[5] clip-right-shape" />

      {/* Clip path styles */}
      <style>{`
        .clip-left-shape {
          clip-path: polygon(0 0, 55% 0, 100% 100%, 0% 100%);
        }
        .clip-right-shape {
          clip-path: polygon(47% 0, 100% 0, 100% 100%, 0% 100%);
        }
      `}</style>
    </section>
  );
};

export default HeroSection;