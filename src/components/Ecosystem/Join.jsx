import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { notification } from "antd"; // Import Ant Design notification
import { apiService } from "../../manageApi/utils/custom.apiservice";

import joinImage from "../../assets/img/join.png";
import wave1 from "../../assets/img/wave/waveint5.png";

const PartnerEcosystemSection = () => {
  const { t } = useTranslation("partnerForm");
  const COUNTRY_CONFIG = {
  "+971": { country: "UAE", digits: 9, startsWith: /^5/ },
  "+91": { country: "India", digits: 10, startsWith: /^[6-9]/ },
};
  
  // 1. Initialize Ant Design Notification
  const [api, contextHolder] = notification.useNotification();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    stakeholder: "",
    countryCode: "+971",
    contact: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  // 2. Helper to trigger notification
  const openNotification = (type, title, description) => {
    api[type]({
      message: title,
      description: description,
      placement: "topRight",
      showProgress: true,
      pauseOnHover: true,
    });
  };

 const handleChange = (e) => {
  const { name, value } = e.target;

  // ✅ CONTACT: digits-only + max length per country
  if (name === "contact") {
    const digitsOnly = value.replace(/\D/g, "");
    const maxDigits = COUNTRY_CONFIG[formData.countryCode].digits;

    if (digitsOnly.length > maxDigits) return;

    setFormData((prev) => ({ ...prev, contact: digitsOnly }));
    return;
  }

  setFormData((prev) => ({ ...prev, [name]: value }));
};


 const validateForm = () => {
  const config = COUNTRY_CONFIG[formData.countryCode];

  if (!formData.firstName.trim()) return false;
  if (!formData.lastName.trim()) return false;
  if (!formData.company.trim()) return false;
  if (!formData.stakeholder) return false;
  if (!formData.message.trim()) return false;

  if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) return false;

  // ✅ phone length check
  if (!formData.contact || formData.contact.length !== config.digits)
    return false;

  // ✅ phone starting digit check
  if (!config.startsWith.test(formData.contact)) return false;

  return true;
};
  const handleSubmit = async (e) => {
    e.preventDefault();

   if (!validateForm()) {
  openNotification("error", "Validation Error", t("toast.invalid"));
  return;
}
    setLoading(true);

    const payload = {
      type: "partner",
      name: {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
      },
      email: formData.email.toLowerCase().trim(),
      company: formData.company.trim(),
      stakeholder_type: formData.stakeholder,
      mobile: {
        country_code: formData.countryCode,
        number: formData.contact,
      },
      message: formData.message.trim(),
    };

    try {
      const res = await apiService.post("/property/lead", payload);
      if (res.success) {
        // 3. Success Notification
        openNotification(
          "success",
          "Thank You!",
          "Your request to join the XOTO Partner Ecosystem has been submitted successfully. Our team will contact you shortly."
        );

        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          company: "",
          stakeholder: "",
          countryCode: "+971",
          contact: "",
          message: "",
        });
      }
    } catch (err) {
      openNotification(
        "error",
        "Submission Failed",
        err.response?.data?.message || t("toast.error")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 4. Render the notification context holder */}
      {contextHolder}

      <section className="w-full relative bg-[var(--color-body)] py-16 md:py-20 px-4 md:px-12 z-10 overflow-hidden">
        
        {/* WAVE BACKGROUND */}
        <div className="absolute top-[-40px] sm:top-[-80px] lg:top-[-150px] left-0 w-full z-0 ">
          <img
            src={wave1}
            alt=""
            className="w-full h-auto object-cover scale-[1.6] sm:scale-[1.3] lg:scale-100 -ml-[30%] sm:-ml-[15%] lg:ml-0 pointer-events-none select-none"
          />
        </div>

        <div className="relative z-20 max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          
          {/* LEFT CONTENT */}
          <div className="flex flex-col">
            {/* Desktop Title */}
            <h2 className="hidden lg:block text-2xl md:text-5xl font-semibold text-black">
              {t("hero.titleDesktop")}
            </h2>

            {/* Mobile Title (Centered) */}
            <h2 className="block lg:hidden text-3xl font-semibold text-black mb-6 text-center">
              {t("hero.titleMobile")}
            </h2>

            {/* Image (Hidden on Mobile) */}
            <img
              src={joinImage}
              alt="People collaborating"
              className="hidden md:block w-full max-w-md mt-4 md:mt-8 mx-auto md:mx-0"
            />
          </div>

          {/* FORM CONTAINER */}
          <div className="bg-white shadow-2xl rounded-2xl md:p-10 p-5 w-full max-w-full">
            <form className="space-y-4 md:space-y-5" onSubmit={handleSubmit}>

              {/* FIRST & LAST NAME (Always 2 Columns) */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="w-full min-w-0">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    {t("form.firstName.label")} *
                  </label>
                  <input
                    name="firstName"
                    placeholder={t("form.firstName.placeholder")}
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div className="w-full min-w-0">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    {t("form.lastName.label")} *
                  </label>
                  <input
                    name="lastName"
                    placeholder={t("form.lastName.placeholder")}
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              {/* EMAIL & COMPANY (Always 2 Columns) */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="w-full min-w-0">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    {t("form.email.label")} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder={t("form.email.placeholder")}
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div className="w-full min-w-0">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    {t("form.company.label")} *
                  </label>
                  <input
                    name="company"
                    placeholder={t("form.company.placeholder")}
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              {/* STAKEHOLDER & CONTACT (Always 2 Columns) */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="w-full min-w-0">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    {t("form.stakeholder.label")} *
                  </label>
                  <select
                    name="stakeholder"
                    value={formData.stakeholder}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-1 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                  >
                    <option value="">{t("form.stakeholder.select")}</option>
                    <option value="Business Associate">{t("form.stakeholder.business")}</option>
                    <option value="Execution Partner">{t("form.stakeholder.execution")}</option>
                    <option value="Developer">{t("form.stakeholder.developer")}</option>
                    <option value="Investor">{t("form.stakeholder.investor")}</option>
                  </select>
                </div>

                <div className="w-full min-w-0">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    {t("form.phone.label")} *
                  </label>

                  {/* Phone Input Group */}
                  <div className="flex gap-1 md:gap-2">
                    {/* COUNTRY CODE - Smaller on mobile */}
                    <select
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={handleChange}
                      className="w-[70px] md:w-[80px] h-[38px] md:h-10 border border-gray-300 rounded-md px-1 text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                    >
                      <option value="+971">+971</option>
                      <option value="+91">+91</option>
                    </select>

                    {/* PHONE NUMBER */}
                    <input
                      name="contact"
                      placeholder={t("form.phone.placeholder")}
                      value={formData.contact}
                      onChange={handleChange}
                      className="w-full h-[38px] md:h-10 border border-gray-300 rounded-md px-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* MESSAGE */}
              <div className="w-full min-w-0">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                  {t("form.message.label")} *
                </label>
                <textarea
                  name="message"
                  rows="3"
                  placeholder={t("form.message.placeholder")}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                />
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[var(--color-primary)] text-white font-semibold rounded-md shadow-md hover:bg-purple-800 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    {t("form.submitting")}
                  </>
                ) : (
                  t("form.submit")
                )}
              </button>

            </form>
          </div>

        </div>
      </section>
    </>
  );
};

export default PartnerEcosystemSection;