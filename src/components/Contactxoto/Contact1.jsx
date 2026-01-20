import React from "react";
import Picture from "../../assets/img/contactheroo.png";
import { useTranslation } from "react-i18next";

const ContactHero = () => {
  const { t, i18n } = useTranslation("contact");

  const isRTL = ["ar", "ur", "fa"].includes(i18n.language);

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="relative bg-cover bg-center flex items-center justify-center text-white
                 min-h-[450px] sm:min-h-[550px] md:min-h-[650px] lg:min-h-[600px]"
      style={{ backgroundImage: `url(${Picture})` }}
    >
      {/* Content */}
      <div className="relative z-10 text-center max-w-3xl px-4 sm:px-6">
        <h1 className="font-bold mb-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
          {t("title")}
        </h1>

        <p className="text-base sm:text-lg md:text-xl leading-relaxed font-semibold">
          {t("description")}
        </p>
      </div>

      {/* Bottom clipped shapes */}
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

export default ContactHero;
