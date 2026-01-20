import React from "react";
import bgImage from "../../assets/img/top-view-dubai 2.jpg";
import { useTranslation } from "react-i18next";

const Article1 = () => {
  const { t } = useTranslation("article1");

  return (
    <section
      className="
        relative
        w-full
        min-h-[70vh] lg:min-h-[80vh]
        bg-cover bg-center
        flex items-center justify-center
        overflow-hidden
      "
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <div className="relative z-10 text-center px-6">
        <h1
          className="
            text-white font-bold
            text-3xl sm:text-4xl md:text-5xl lg:text-[50px]
            leading-tight lg:leading-[76px]
            drop-shadow-xl
          "
        >
          {t("title.line1")}
          <br />
          {t("title.line2")}
        </h1>

        <p
          className="
            mt-4 text-white font-semibold
            text-base sm:text-lg md:text-xl
            drop-shadow-lg
          "
        >
          {t("subtitle")}
        </p>
      </div>

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
    </section>
  );
};

export default Article1;
