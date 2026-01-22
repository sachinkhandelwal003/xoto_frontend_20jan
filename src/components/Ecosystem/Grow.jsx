"use client";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { notification } from "antd"; 
import { apiService } from "../../manageApi/utils/custom.apiservice"; 

import GrowImage from "../../assets/img/Grow.png";
import wave1 from "../../assets/img/wave/wave1.png";

const CtaSection = () => {
  const { t } = useTranslation("cta");

  const COUNTRY_CONFIG = {
    "+971": { digits: 9 },
    "+91": { digits: 10 },
  };

  const STAKEHOLDER_MAP = {
    "Buying Property": "Investor",
    "Selling Property": "Investor",
    "Partner with us": "Business Associate",
    "Investor": "Investor",
    "Developer": "Developer",
    "Execution Partner": "Execution Partner"
  };

  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false); 
  const [api, contextHolder] = notification.useNotification(); 

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "", // Added this
    countryCode: "+971", 
    contact: "",
    inquiryType: "",
    message: "",
  });

  const openNotification = (type, title, description) => {
    api[type]({
      message: title,
      description: description,
      placement: "topRight",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "contact") {
      const digitsOnly = value.replace(/\D/g, "");
      const maxDigits = COUNTRY_CONFIG[formData.countryCode].digits;
      if (digitsOnly.length > maxDigits) return;
      setFormData((prev) => ({ ...prev, contact: digitsOnly }));
      return;
    }

    if (name === "countryCode") {
      setFormData((prev) => ({ ...prev, countryCode: value, contact: "" }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredDigits = COUNTRY_CONFIG[formData.countryCode].digits;
    
    if (!formData.name.trim() || !formData.company.trim()) {
      openNotification("error", "Error", "Name and Company are required");
      return;
    }
    if (formData.contact.length !== requiredDigits) {
      openNotification("error", "Error", `Phone must be ${requiredDigits} digits`);
      return;
    }

    setLoading(true);

    const nameParts = formData.name.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || ".";

    const finalStakeholder = STAKEHOLDER_MAP[formData.inquiryType] || "Investor";

    const payload = {
      type: "partner", 
      name: { first_name: firstName, last_name: lastName },
      email: formData.email.toLowerCase().trim() || "no-email@provided.com",
      company: formData.company.trim(), // Sending company now
      mobile: {
        country_code: formData.countryCode,
        number: formData.contact,
      },
      stakeholder_type: finalStakeholder, 
      message: formData.message.trim() || "Inquiry from CTA Section",
    };

    try {
      const res = await apiService.post("/property/lead", payload);
      
      if (res?.success || res?.data?.success || res?.status === 200) {
        openNotification("success", "Success", "Your inquiry has been submitted!");
        setOpenModal(false);
        setFormData({
          name: "", email: "", company: "", countryCode: "+971", contact: "", inquiryType: "", message: "",
        });
      }
    } catch (err) {
      console.error("API Error:", err.response?.data);
      const errorMsg = err.response?.data?.errors?.[0]?.message || "Validation Error";
      openNotification("error", "Failed", `Field "${err.response?.data?.errors?.[0]?.field}": ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <section className="relative w-full flex justify-center items-center py-12 px-4 sm:px-6 md:h-[450px]">
        <div className="absolute bottom-[-20px] lg:bottom-[-70px] left-0 w-full z-0 overflow-hidden">
          <img src={wave1} alt="" className="w-full min-w-[140%] -ml-[20%] scale-[1.8] lg:scale-100 lg:min-w-full lg:ml-0 pointer-events-none select-none" />
        </div>

        <div className="max-w-6xl w-full relative banner-gradient-color1 rounded-2xl text-white flex flex-col md:block items-center p-8 md:p-14 shadow-2xl overflow-hidden z-10">
          <div className="w-full md:w-2/3 relative z-10 text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-extrabold leading-snug heading-light mb-6">{t("title")}</h2>
            <button onClick={() => setOpenModal(true)} className="bg-[#5C039B] px-8 py-4 rounded-lg font-bold text-white shadow-lg hover:bg-[#4a027d] transition-transform transform hover:scale-105">
              {t("ctaButton")}
            </button>
          </div>
          <div className="mt-8 md:mt-0 md:absolute md:bottom-0 md:right-0 z-0 w-full md:w-auto flex justify-center md:block">
            <img src={GrowImage} alt="Growth" className="object-contain h-56 md:h-[350px] drop-shadow-2xl md:translate-y-2" />
          </div>
        </div>
      </section>

      {openModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[9999] p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-2xl relative animate-fadeIn overflow-y-auto max-h-[95vh]">
            <button onClick={() => setOpenModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-red-500 text-2xl">×</button>
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">{t("modal.title")}</h2>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t("form.name")} *</label>
                <input name="name" className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder={t("form.namePlaceholder")} value={formData.name} onChange={handleChange} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{t("form.email")}</label>
                  <input type="email" name="email" className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Email" value={formData.email} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Company *</label>
                  <input name="company" className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Company Name" value={formData.company} onChange={handleChange} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t("form.phone")} *</label>
                <div className="flex gap-2">
                  <select name="countryCode" value={formData.countryCode} onChange={handleChange} className="border border-gray-300 px-2 py-2 rounded-lg bg-white outline-none">
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+91">🇮🇳 +91</option>
                  </select>
                  <input type="tel" name="contact" className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Phone Number" value={formData.contact} onChange={handleChange} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t("form.inquiry")} *</label>
                <select name="inquiryType" className="w-full border border-gray-300 px-4 py-2 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 outline-none" value={formData.inquiryType} onChange={handleChange}>
                  <option value="">{t("form.select")}</option>
                  {(t("form.options", { returnObjects: true }) || []).map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t("form.message")}</label>
                <textarea name="message" className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none" rows="2" placeholder={t("form.messagePlaceholder")} value={formData.message} onChange={handleChange} />
              </div>

              <button type="submit" disabled={loading} className="w-full bg-[#5C039B] hover:bg-[#4a027d] py-3 rounded-lg text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2">
                {loading ? <div className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></div> : t("form.submit")}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CtaSection;