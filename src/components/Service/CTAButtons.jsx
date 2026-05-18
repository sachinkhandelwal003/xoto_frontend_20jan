import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import GetPreApprovedModal from "../homepage/GetPreApprovedModal";

export default function CTAButtons() {
  const { t, i18n } = useTranslation("mort1");
  const isRTL = i18n.language === "fa";
  const navigate = useNavigate();
  const [openPreApproved, setOpenPreApproved] = useState(false);

  // ✅ Modal open hone par body scroll lock hoga
  useEffect(() => {
    if (openPreApproved) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    // cleanup
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [openPreApproved]);

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="
        flex flex-row items-center
        justify-center
        gap-2 sm:gap-4
        w-full max-w-full
        px-2 sm:px-0
      "
    >
      {/* PRIMARY BUTTON */}
      <button
        onClick={() => setOpenPreApproved(true)}
        className="
          flex-1 sm:flex-none
          px-2 sm:px-8
          py-2.5 sm:py-3
          bg-transparent
          text-white
          font-normal sm:font-medium
          text-xs sm:text-base
          rounded-lg
          border border-white/70
          shadow-md
          transition-all duration-300
          hover:bg-[var(--color-primary)]
          hover:border-[#5C039B]
          hover:shadow-lg
          whitespace-nowrap
        "
      >
        {t("cta.preApproved")}
      </button>

      {/* OUTLINE BUTTON */}
      <button
        onClick={() => navigate("/mortgages/calculator")}
        className="
          flex-1 sm:flex-none
          px-2 sm:px-8
          py-2.5 sm:py-3
          border border-white/70
          text-white
          font-normal sm:font-medium
          text-xs sm:text-base
          rounded-lg
          transition-all duration-300
          hover:bg-[var(--color-primary)]
          hover:border-[#5C039B]
          hover:shadow-lg
          whitespace-nowrap
        "
      >
        {t("cta.calculate")}
      </button>

      {/* PRE-APPROVED MODAL */}
      <GetPreApprovedModal
        open={openPreApproved}
        onClose={() => setOpenPreApproved(false)}
      />
    </div>
  );
}