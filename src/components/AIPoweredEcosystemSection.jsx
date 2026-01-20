"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next"; // ✅ Added i18n hook

import Pool from "./../assets/img/home/Pool.png";
import wavemap from "./../assets/img/wavee.png";

export default function HomeJourneySection() {
  const [mobileView, setMobileView] = useState("both");

  const { t } = useTranslation("home2"); // ✅ Using home2 namespace

  return (
    <section className="relative w-full min-h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src={Pool}
          alt={t("homeJourney.imageAlt.background")} // ✅ i18n ALT text
          className="w-full h-full object-cover"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center min-h-screen px-6 py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full">
          {/* LEFT TEXT */}
          <div
            className={`text-white max-w-2xl transition-all duration-300
              ${mobileView === "image" ? "hidden" : "block"}
              text-center lg:text-left mx-auto lg:mx-0
            `}
          >
            <h1
              className="heading-light"
              style={{ color: "var(--color-black)" }}
            >
              {t("homeJourney.title")} {/* ✅ i18n Title */}
            </h1>

            <p className="button-text text-black mt-6 max-w-lg mx-auto lg:mx-0">
              {t("homeJourney.description")} {/* ✅ i18n Description */}
            </p>
          </div>

          {/* RIGHT IMAGE */}
          <div className="relative w-full max-w-xl lg:max-w-3xl p-4 rounded-2xl">
            <div className="rounded-xl overflow-hidden flex justify-center">
              <img
                src={wavemap}
                alt={t("homeJourney.imageAlt.map")} // ✅ i18n ALT text
                className="w-100 object-cover block"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
