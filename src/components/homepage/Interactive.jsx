import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import wave2 from "../../assets/img/wave/wave2.png";
import interImage from "../../assets/img/inter.png";

export default function InteractiveBuilderSection() {
  const { t } = useTranslation("interactive");

  return (
    <section className="relative bg-[var(--color-body)] pt-16 lg:pt-24 overflow-hidden ">
      {/* Wave */}
      <div className="absolute left-0 w-full bottom-[-120px] lg:bottom-[-540px]">
        <img src={wave2} alt="" className="w-full pointer-events-none" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        {/* Text */}
        <div className="space-y-6 text-center lg:text-left">
          <h2
            className="
              font-semibold
              text-[32px] leading-[38px]
              md:text-[44px] md:leading-[52px]
              lg:text-[56px] lg:leading-[60px]
              text-black
              max-w-[540px]
              mx-auto lg:mx-0
              text-center lg:text-left
            "
          >
            {t("titleLine1")} <br />
            {t("titleLine2")}
          </h2>

          <p
            className="
              font-medium
              text-[20px] leading-[28px]
              md:text-[22px] md:leading-[30px]
              lg:text-[24px] lg:leading-[33px]
              text-[#547593]
              max-w-[551px]
              mx-auto lg:mx-0
              text-center lg:text-left
            "
          >
            {t("descriptionLine1")} <br />
            {t("descriptionLine2")}
          </p>

          <Link
            to="/aiPlanner/landscape"
            className="flex justify-center lg:justify-start"
          >
            <button
              className="
                h-[60px]
                min-w-[315px]
                px-[40px]
                bg-[#5C039B]
                rounded-[8px]
                shadow-[0px_8px_20px_rgba(92,3,155,0.25)]
                flex items-center justify-center
              "
            >
              <span
                className="
                  font-normal
                  text-[24px]
                  leading-[24px]
                  text-white
                "
              >
                {t("button")}
              </span>
            </button>
          </Link>
        </div>

        {/* Image */}
        <div className="relative flex justify-center lg:justify-end mt-8 lg:mt-0">
          <img
            src={interImage}
            alt={t("imageAlt")}
            className="
              w-[95%]
              max-w-[360px]
              sm:max-w-[420px]
              lg:w-[140%]
              lg:max-w-none
              drop-shadow-2xl
              lg:translate-x-24
            "
          />
        </div>
      </div>
    </section>
  );
}
