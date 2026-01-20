import React from "react";
import roomImage from "../../assets/img/ui-ux-design_1197721-139046 1.png";
import { useTranslation } from "react-i18next";

const Article4 = () => {
  const { t } = useTranslation("article4");

  return (
    <section className="w-full overflow-hidden bg-gradient-to-b from-[#00A7FF] via-[#296EF0] to-[#5C1BB0] py-10 sm:py-10">
      <div
        className="
          mx-auto max-w-7xl
          px-6 sm:px-10 lg:px-14
          flex flex-col lg:flex-row
          items-center lg:items-center
          gap-12 lg:gap-20
          text-white
        "
      >
        {/* LEFT CONTENT */}
        <div className="w-full lg:w-1/2 max-w-xl">
          <h2
            className="
              font-semibold tracking-tight
              text-3xl sm:text-4xl md:text-5xl lg:text-[60px]
              leading-tight lg:leading-[55px]
            "
          >
            {t("title")}
          </h2>

          <p
            className="
              mt-6 sm:mt-8
              font-medium
              text-base sm:text-lg md:text-xl lg:text-[24px]
              leading-relaxed lg:leading-[33px]
              max-w-[520px]
            "
          >
            {t("description")}
          </p>
        </div>

        {/* RIGHT IMAGE */}
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
          <img
            src={roomImage}
            alt="3D Room"
            className="
              w-[260px] sm:w-[320px] md:w-[420px] lg:w-[520px]
              object-contain
            "
          />
        </div>
      </div>
    </section>
  );
};

export default Article4;
