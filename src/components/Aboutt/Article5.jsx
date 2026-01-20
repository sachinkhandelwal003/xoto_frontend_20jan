import React from "react";
import greenHouse from "../../assets/img/house-with-lot-windows-bed-with-sofa-it_1103290-30179 1.png";
import waveBottom from "../../assets/img/1.png";
import { useTranslation } from "react-i18next";

const Article5 = () => {
  const { t } = useTranslation("article5");

  return (
    <section className="relative bg-gradient-to-b from-white to-[#F8FDF8] overflow-hidden">
      {/* Green wave */}
      <img
        src={waveBottom}
        alt=""
        className="absolute bottom-0 left-0 w-full pointer-events-none opacity-70 z-10
                   translate-y-32 sm:translate-y-48 lg:translate-y-[500px]"
      />

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* HEADING */}
        <div className="text-center mt-10">
          <h2 className="font-semibold text-black heading-dark-1 mt-5">
            {t("title.line1")}
            <br className="hidden lg:block" />
            <span className="block mt-2">{t("title.line2")}</span>
          </h2>
        </div>

        {/* IMAGE + TEXT */}
        <div
          className="grid grid-cols-1 lg:grid-cols-2
                     gap-12 lg:gap-20
                     items-center
                     max-w-6xl mx-auto
                     my-16 sm:my-20"
        >
          {/* IMAGE */}
          <div className="flex justify-center">
            <img
              src={greenHouse}
              alt="Sustainable modern home"
              className="
                w-full max-w-[320px]
                sm:max-w-[120px]
                md:max-w-[520px]
                lg:max-w-[627px]
                object-contain lg:object-contain
              "
            />
          </div>

          {/* TEXT */}
          <div
            className="
              w-full
              max-w-none sm:max-w-xl
              mx-auto lg:mx-0
              text-center lg:text-left
              space-y-5
              font-medium
              text-[#547593]
            "
          >
            <p className="text-sm leading-relaxed sm:text-base sm:leading-7 lg:text-lg lg:leading-8">
              {t("paragraphs.p1")}
            </p>

            <p className="text-sm leading-relaxed sm:text-base sm:leading-7 lg:text-lg lg:leading-8">
              {t("paragraphs.p2")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Article5;
