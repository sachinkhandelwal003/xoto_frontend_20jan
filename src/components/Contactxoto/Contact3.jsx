"use client";

import React, { useState } from "react";
import { notification } from "antd";
import { apiService } from "../../manageApi/utils/custom.apiservice";
import Image from "../../assets/img/Image2.jpg";
import { useTranslation } from "react-i18next";

const countryCodes = [
  { value: "+91", label: "+91" },
  { value: "+971", label: "+971" },
  { value: "+966", label: "+966" },
  { value: "+1", label: "+1" },
  { value: "+44", label: "+44" },
  { value: "+61", label: "+61" },
];

export default function QuickEnquiry() {
  const { t } = useTranslation("contact3");

  const [api, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    country_code: "+971",
    number: "",
    message: "",
  });

  const openNotification = (type, title, description) => {
    api[type]({
      message: title,
      description,
      placement: "topRight",
      showProgress: true,
      pauseOnHover: true,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleCountryCode = (e) => {
    setFormData((p) => ({ ...p, country_code: e.target.value }));
  };

  const handleNumber = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 15);
    setFormData((p) => ({ ...p, number: value }));
  };

  const validateForm = () => {
    if (!formData.first_name.trim()) return t("validation.firstName");
    if (!formData.last_name.trim()) return t("validation.lastName");
    if (!formData.email.includes("@")) return t("validation.email");
    if (formData.number.length < 8) return t("validation.mobile");
    if (!formData.message.trim()) return t("validation.message");
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      openNotification("error", t("notification.errorTitle"), error);
      return;
    }

    setLoading(true);

    try {
      await apiService.post("/property/lead", {
        type: "enquiry",
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
      });

      openNotification(
        "success",
        t("notification.successTitle"),
        t("notification.successMessage")
      );

      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        country_code: "+971",
        number: "",
        message: "",
      });
    } catch (err) {
      openNotification(
        "error",
        t("notification.errorTitle"),
        t("notification.errorMessage")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}

      <section
        className="relative bg-cover bg-center py-14 sm:py-16 md:py-20 lg:py-24 text-white overflow-hidden"
        style={{ backgroundImage: `url(${Image})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-800/80 to-blue-500/70"></div>

        <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-10 px-5 sm:px-6 lg:px-8">
          {/* LEFT */}
          <div className="w-full md:w-1/2 text-center md:text-left mt-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-4 leading-snug">
              {t("title")}
            </h2>

            <p className="text-base sm:text-lg md:text-xl text-gray-200 leading-relaxed">
              {t("description")}
            </p>
          </div>

          {/* FORM */}
          <div className="w-full md:max-w-xl bg-white rounded-xl shadow-xl p-6 sm:p-8 md:p-10 text-gray-800">
            <form onSubmit={onSubmit} className="space-y-4 md:space-y-5">
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium mb-1">
                    {t("form.firstName")}*
                  </label>
                  <input
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full border rounded-md px-2 py-2 md:py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium mb-1">
                    {t("form.lastName")}*
                  </label>
                  <input
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full border rounded-md px-2 py-2 md:py-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium mb-1">
                    {t("form.email")}*
                  </label>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border rounded-md px-2 py-2 md:py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium mb-1">
                    {t("form.mobile")}*
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.country_code}
                      onChange={handleCountryCode}
                      className="w-[80px] border rounded-md px-1 py-2"
                    >
                      {countryCodes.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <input
                      value={formData.number}
                      onChange={handleNumber}
                      className="w-full border rounded-md px-2 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium mb-1">
                  {t("form.message")}*
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#5C039B] text-white py-3 rounded-md font-semibold"
              >
                {loading ? t("buttons.submitting") : t("buttons.submit")}
              </button>
            </form>

            <p className="text-center text-xs text-gray-500 mt-4">
              {t("privacy")}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
