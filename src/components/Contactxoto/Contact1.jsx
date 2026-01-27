import React from "react";
import Picture from "../../assets/img/contactheroo.png";
import { useTranslation, Trans } from "react-i18next";

const ContactHero = () => {
  const { t, i18n } = useTranslation("contact");

  // RTL language support check
  const isRTL = ["ar", "ur", "fa"].includes(i18n.language);

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="relative bg-cover bg-center flex items-center justify-center text-white
                 min-h-[450px] sm:min-h-[550px] md:min-h-[650px] lg:min-h-[600px]"
      style={{ 
        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${Picture})` 
      }}
    >
      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl px-4 sm:px-6">
        <h1 className="font-bold mb-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight">
          {/* Yahan Trans component use karne se JSON wala <br/> tag chalne lagega */}
          <Trans i18nKey="title" ns="contact">
            {t("title")}
          </Trans>
        </h1>

        <p className="text-base sm:text-lg md:text-xl leading-relaxed font-semibold opacity-90">
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
          clip-path: polygon(45% 0, 100% 0, 100% 100%, 0% 100%);
        }
      `}</style>
    </section>
  );
};

export default ContactHero;