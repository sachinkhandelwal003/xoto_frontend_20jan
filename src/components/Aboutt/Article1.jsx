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
      {/* <di" /> */}

      {/* Content */}
      <div className="relative z-10 text-center px-6">
<h1
  className="text-white font-bold flex font-semibold flex-col items-center gap-1 sm:gap-2 drop-shadow-xl text-center"
  style={{ 
    fontSize: 'clamp(30px, 8vw, 54px)', // Mobile pe 30px, Laptop pe 54px tak auto-scale hoga
    lineHeight: '1.2' 
  }}
>
  <span className="block">{t("title.line1")}</span>
  <span className="block">{t("title.line2")}</span>
</h1>

        <p
          className="
            mt-4 text-white font-large
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
    </section>
  );
};

export default Article1;
