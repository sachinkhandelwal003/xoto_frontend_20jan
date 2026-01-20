"use client";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import GrowImage from "../../assets/img/Grow.png";
import wave1 from "../../assets/img/wave/wave1.png";

const CtaSection = () => {
  const { t } = useTranslation("cta");

  const [openModal, setOpenModal] = useState(false);
  const [toast, setToast] = useState(null);

  const [name, setName] = useState("");
  const [inquiryType, setInquiryType] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim() || !inquiryType.trim()) {
      setToast(t("toast.error"));
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setToast(
      t("toast.success", {
        name,
        inquiryType,
      })
    );

    setOpenModal(false);
    setName("");
    setInquiryType("");

    setTimeout(() => setToast(null), 3500);
  };

  return (
    <>
      <section className="relative w-full flex justify-center items-center py-12 px-4 sm:px-6 md:h-[450px]">
        
        {/* BACKGROUND WAVE */}
        <div className="absolute bottom-[-20px] lg:bottom-[-70px] left-0 w-full z-0 overflow-hidden">
          <img
            src={wave1}
            alt=""
            className="w-full min-w-[140%] -ml-[20%] scale-[1.8] lg:scale-100 lg:min-w-full lg:ml-0 pointer-events-none select-none"
          />
        </div>

        {/* MAIN BANNER CONTAINER 
            Responsive Layout:
            - Mobile: flex-col (Vertical stack: Text -> Button -> Image)
            - Desktop: md:block (allows absolute positioning of image on right)
        */}
        <div className="max-w-6xl w-full relative banner-gradient-color1 rounded-2xl text-white flex flex-col md:block items-center p-8 md:p-14 shadow-2xl overflow-hidden z-10">
          
          {/* CONTENT (Text & Button) */}
          <div className="w-full md:w-2/3 relative z-10 text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-extrabold leading-snug heading-light mb-6">
              {t("title")}
            </h2>

            <button
              onClick={() => setOpenModal(true)}
              className="bg-[#5C039B] px-8 py-4 rounded-lg font-bold text-white shadow-lg hover:bg-[#4a027d] transition-transform transform hover:scale-105"
            >
              {t("ctaButton")}
            </button>
          </div>

          {/* IMAGE CONTAINER
             - Mobile: Relative flow (mt-8), Centered (mx-auto). Matches your mobile screenshot.
             - Desktop: Absolute position (bottom-0 right-0).
          */}
          <div className="mt-8 md:mt-0 md:absolute md:bottom-0 md:right-0 z-0 w-full md:w-auto flex justify-center md:block">
            <img
              src={GrowImage}
              alt="Growth"
              className="object-contain h-56 md:h-[350px] drop-shadow-2xl md:translate-y-2" 
            />
          </div>

        </div>
      </section>

      {/* MODAL */}
      {openModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[9999] p-4">
          <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl relative animate-fadeIn">
            <button
              onClick={() => setOpenModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-red-500 text-2xl transition-colors"
            >
              ×
            </button>

            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
              {t("modal.title")}
            </h2>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t("form.name")} *</label>
                <input
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition"
                  placeholder={t("form.namePlaceholder")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t("form.email")}</label>
                <input
                  type="email"
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition"
                  placeholder={t("form.emailPlaceholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t("form.phone")}</label>
                <div className="flex gap-3">
                  <select className="border border-gray-300 px-3 py-3 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 outline-none">
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+91">🇮🇳 +91</option>
                  </select>
                  <input
                    type="tel"
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition"
                    placeholder={t("form.phonePlaceholder")}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {t("form.inquiry")} *
                </label>
                <select
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                  value={inquiryType}
                  onChange={(e) => setInquiryType(e.target.value)}
                >
                  <option value="">{t("form.select")}</option>
                  {(t("form.options", { returnObjects: true }) || []).map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {t("form.message")}
                </label>
                <textarea
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition resize-none"
                  rows="3"
                  placeholder={t("form.messagePlaceholder")}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#5C039B] hover:bg-[#4a027d] py-4 rounded-lg text-white font-bold text-lg shadow-lg transition-colors"
              >
                {t("form.submit")}
              </button>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-[#5C039B] text-white px-6 py-4 rounded-xl shadow-2xl whitespace-pre-line text-sm font-medium z-[9999] animate-bounce">
          {toast}
        </div>
      )}
    </>
  );
};

export default CtaSection;