"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import mainbgImage from "../../assets/img/logo/mainbgg.png";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function HeroSectionInterior() {
  const { t } = useTranslation("interior1");

  return (
    <div
      className="relative w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${mainbgImage})` }}
    >
      {/* Bottom clipping shapes */}
      <div className="absolute bottom-0 left-0 w-72 h-12 bg-[var(--color-body)] z-[3] clip-left-shape" />
      <div className="absolute bottom-0 right-0 w-72 h-12 bg-[var(--color-body)] z-[3] clip-right-shape" />

      <style>{`
        .clip-left-shape {
          clip-path: polygon(0 0, 55% 0, 100% 100%, 0% 100%);
        }
        .clip-right-shape {
          clip-path: polygon(47% 0, 100% 0, 100% 100%, 0% 100%);
        }
      `}</style>
      <div className="relative z-10 px-4 sm:px-6 md:px-10 lg:px-16 py-28 md:py-40">
        <div className="max-w-4xl text-center mx-auto">

          <h1 className="mb-6 heading-light">
            {t("title")}
          </h1>

          <p className="mb-8 paragraph-light text-white">
            {t("description")}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 mx-auto">
            <Link to="/estimate/calculator/interior">
              <button className="group inline-flex items-center gap-3 rounded-md bg-[#5C039B] px-6 py-4 text-xl font-semibold text-white shadow-xl transition-all hover:bg-purple-700 hover:shadow-2xl hover:-translate-y-1">
                <span>{t("buttons.estimate")}</span>
                <ArrowRight className="h-7 w-7 group-hover:translate-x-1" />
              </button>
            </Link>

            <Link to="/ecommerce/b2c">
              <button className="bg-transparent hover:bg-white/10 text-white px-8 py-4 rounded-md text-lg font-bold shadow-xl transition-all flex items-center border-2 border-white/30 hover:border-white">
                {t("buttons.store")}
              </button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
