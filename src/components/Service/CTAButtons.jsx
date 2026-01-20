import React from "react";
import { useState } from "react";
import { useTranslation  } from "react-i18next";
import { useNavigate } from "react-router-dom";
import GetPreApprovedModal from "../homepage/GetPreApprovedModal";
export default function CTAButtons() {
  const { t, i18n } = useTranslation("mort1");
  const isRTL = i18n.language === "fa";
  const navigate = useNavigate();
const [openPreApproved, setOpenPreApproved] = useState(false);
  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="
        flex flex-row items-center
        justify-center
        gap-3 sm:gap-4
        w-full max-w-full
      "
    >
      {/* PRIMARY BUTTON */}
    {/* PRIMARY BUTTON → OPEN MODAL */}
        <button
          onClick={() => setOpenPreApproved(true)}
          className="
            flex-1 sm:flex-none
            px-3 sm:px-8
            py-2.5 sm:py-3
            bg-[var(--color-primary)]
            text-white
            rounded-lg
            shadow-md
            transition-all duration-300
            whitespace-nowrap
          "
        >
          {t("cta.preApproved")}
        </button>
      {/* OUTLINE                        BUTTON */}

      {/* OUTLINE BUTTON */}
      <button
        onClick={() => navigate("/mortgages")}
        className="
          flex-1 sm:flex-none
          px-3 sm:px-8
          py-2.5 sm:py-3
          border-1 border-white/70
          text-white
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