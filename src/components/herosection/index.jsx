import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import calender from "../../assets/icons/Homeicons/Calendar.png";
import clock from "../../assets/icons/Homeicons/Clock.png";
import gurantee from "../../assets/icons/Homeicons/Guarantee.png";
import map from "../../assets/icons/Homeicons/Map-pin.png";
import video from "../../assets/video/mortgage2.mp4";

const icons = [gurantee, clock, map, calender];

const HeroSection = () => {
  const { t } = useTranslation("home");

  const features = t("hero.features", { returnObjects: true });

  return (
    <section className="relative w-full overflow-hidden flex items-center justify-center text-white py-20 md:py-28 xl:py-36">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 z-[1]" />

      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src={"https://xotostaging.s3.me-central-1.amazonaws.com/properties/1768043300370-mortgage2.mp4"} type="video/mp4" />
      </video>

      {/* Content */}
      <div className="relative z-[2] w-full max-w-7xl mx-auto px-4 lg:px-12 flex flex-col items-center lg:items-start text-center lg:text-left gap-10">
        <div className="max-w-3xl space-y-6">
          {/* Heading */}
          <h1 className="heading-light">
            {t("hero.title1")}
            <span>
              <br />
              {t("hero.title2")}
            </span>
          </h1>

          {/* Description */}
          <p className="paragraph-light-1 text-lg">{t("hero.description")}</p>

          {/* Buttons */}
          <div className="flex flex-row gap-4 justify-center lg:justify-start pt-4">
            <Link
              to="/aiPlanner"
              className="bg-[var(--color-primary)] px-8 py-3 rounded-md shadow-lg"
            >
              {t("hero.buttons.design")}
            </Link>

            <Link
              to="/marketplace"
              className="border-2 border-white px-8 py-3 rounded-md hover:bg-white hover:text-black transition"
            >
              {t("hero.buttons.explore")}
            </Link>
          </div>

          {/* Features */}
          <div className="mt-6 md:max-w-[460px] grid grid-cols-2 gap-6 ">
            {features.map((item, i) => (
              <div key={i} className="flex items-center gap-3  ">
                <div className="w-10 h-10 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                  <img src={icons[i]} className="w-5 h-5" alt="" />
                </div>
                <span className="font-semibold text-lg">
                  {item.line1}
                  <br />
                  {item.line2}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-70 h-10 bg-[var(--color-body)] z-[5] clip-left-shape border-none "></div>
      <div className="absolute bottom-0 right-0 w-70 h-10  bg-[var(--color-body)] z-[5] clip-right-shape border-none"></div>

      {/* Custom clip paths */}
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
