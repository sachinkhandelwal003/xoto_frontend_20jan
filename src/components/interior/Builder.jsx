"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import heImage from "../../assets/img/he.png";
import wave2 from "../../assets/img/wave/wave2.png";
import { Link } from "react-router-dom";

export default function InteractiveBuilderSection() {
  const { t } = useTranslation("interior2");

  return (
    <section className="relative bg-[var(--color-body)] py-16 md:py-24 overflow-hidden">

      {/* Bottom Wave */}
      <div className="absolute bottom-[-180px] sm:bottom-[-180px] md:bottom-[-100px] lg:bottom-[-605px] left-0 w-full z-0 overflow-hidden">
        <img
          src={wave2}
          alt=""
          className="w-full scale-[1.4] sm:scale-[1.2] md:scale-[1.05] lg:scale-100 pointer-events-none select-none"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-8">

          {/* LEFT */}
          <div className="space-y-6 text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl heading-dark-1 text-black">
              {t("title.line1")}{" "}
              <span>{t("title.line2")}</span>
            </h2>

            <p className="text-lg sm:text-xl md:text-2xl paragraph-light-1 text-[#547593] max-w-lg mx-auto lg:mx-0">
              {t("description")}
            </p>

            <Link to="/aiPlanner/interior">
              <button className="inline-flex items-center justify-center rounded-md bg-[#5C039B] px-10 sm:px-14 py-3 sm:py-4 text-lg sm:text-xl font-semibold text-white shadow-xl transition-all hover:bg-purple-700 hover:shadow-2xl hover:-translate-y-1 mx-auto lg:mx-0">
                {t("button")}
              </button>
            </Link>
          </div>

          {/* RIGHT */}
          <div className="flex justify-center mt-6 lg:mt-0 lg:justify-end">
            <img
              src={heImage}
              alt={t("imageAlt")}
              className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg drop-shadow-2xl"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
