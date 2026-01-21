"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { notification } from 'antd';
import { apiService } from "../../manageApi/utils/custom.apiservice";
import helloImage from "../../assets/img/hello.jpg";
import { useTranslation } from "react-i18next";

const countryCodes = [
  { value: "+91", label: "+91 IND" },
  { value: "+971", label: "+971 UAE" },
  { value: "+966", label: "+966 KSA" },
  { value: "+1", label: "+1 US" },
  { value: "+44", label: "+44 UK" },
  { value: "+61", label: "+61 AU" },
];

export default function Consultation() {
  const { t, i18n } = useTranslation("consultation");
  const [loading, setLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    country_code: "+971",
    number: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCountryCode = (value) => {
    setFormData((prev) => ({ ...prev, country_code: value }));
  };

  const handleNumber = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 15);
    setFormData((prev) => ({ ...prev, number: value }));
  };

  const openNotification = (type, title, description) => {
    api[type]({
      message: title,
      description: description,
      placement: 'topRight',
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      type: "consultation",
      consultant_type: "landscape",
      name: {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
      },
      mobile: {
        country_code: formData.country_code,
        number: formData.number,
      },
      email: formData.email.trim().toLowerCase(),
      message: formData.message.trim(),
    };

    try {
      await apiService.post("/property/lead", payload);
      openNotification(
        "success",
        "Thank You!",
        "Your consultation request has been submitted successfully."
      );
      setFormData({
        first_name: "", last_name: "", email: "",
        country_code: "+971", number: "", message: "",
      });
    } catch (err) {
      openNotification("error", "Submission Failed", err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-gray-900">
      {contextHolder}

      <img
        src={helloImage}
        alt={t("imageAlt")}
        className="absolute inset-0 h-full w-full object-cover opacity-70"
      />

      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgba(92, 3, 155, 0.85) 20%, rgba(3, 164, 244, 0.85) 95%)",
        }}
      />

      <div className="relative z-10 mx-auto flex flex-col lg:flex-row items-center lg:items-start justify-center lg:justify-start max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-16 gap-12 lg:gap-20">
        
        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-xl text-white text-center lg:text-left"
        >
          <h2 className={`mt-9 text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight`}>
            {t("title")}
          </h2>
          <p className="mt-5 text-xl md:text-2xl paragraph-light-1">
            {t("description")}
          </p>
        </motion.div>

        {/* Form */}
       <motion.div
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, delay: 0.3 }}
  className="w-full max-w-2xl"
>
  <div className="rounded-2xl bg-white p-5 sm:p-8 shadow-2xl">
    <form onSubmit={onSubmit} className="space-y-4">
      
      {/* Name Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t("form.firstName")}*</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:border-purple-500"
            placeholder={t("form.firstName")}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t("form.lastName")}*</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:border-purple-500"
            placeholder={t("form.lastName")}
          />
        </div>
      </div>

      {/* Email Section */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">{t("form.email")}*</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:border-purple-500"
          placeholder={t("form.email")}
        />
      </div>

      {/* Mobile Number Section */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">{t("form.mobile")}*</label>
        <div className="flex flex-row items-center gap-2 w-full flex-nowrap">
          <select
            value={formData.country_code}
            onChange={(e) => handleCountryCode(e.target.value)}
            className="w-[100px] sm:w-[130px] flex-shrink-0 rounded-xl border border-gray-300 px-2 py-2.5 text-sm bg-gray-50 outline-none focus:border-purple-500"
          >
            {countryCodes.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={formData.number}
            onChange={handleNumber}
            className="flex-1 min-w-0 rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:border-purple-500"
            placeholder={t("form.mobile")}
          />
        </div>
      </div>

      {/* Message Section */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">{t("form.message")}*</label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:border-purple-500 resize-none"
          placeholder={t("form.message")}
        />
      </div>

      {/* ACTION BUTTONS - SIDE BY SIDE */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        {/* Submit Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-purple-700 to-purple-900 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg transition-all disabled:opacity-70 flex items-center justify-center text-center leading-tight"
        >
          {loading ? t("buttons.submitting") : t("buttons.submit")}
        </motion.button>

        {/* WhatsApp Button */}
        <motion.a
          whileTap={{ scale: 0.98 }}
          href={`https://wa.me/+971509180967`} // Yahan apna WhatsApp number daalein
          target="_blank"
          rel="noopener noreferrer"
          className="w-full rounded-xl bg-[#25D366] py-3.5 text-sm sm:text-base font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 text-center leading-tight"
        >
          <svg 
            className="w-5 h-5 fill-current flex-shrink-0" 
            viewBox="0 0 24 24"
          >
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.3 1.592 5.448 0 9.886-4.438 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.834-.981z"/>
          </svg>
          WhatsApp
        </motion.a>
      </div>

    </form>

    <p className="text-center text-xs text-gray-500 mt-4 px-2">
      {t("privacy")}
    </p>
  </div>
</motion.div>
      </div>
    </section>
  );
}