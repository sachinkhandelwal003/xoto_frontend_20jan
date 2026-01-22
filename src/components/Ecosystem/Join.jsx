import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { notification } from "antd"; 
import { apiService } from "../../manageApi/utils/custom.apiservice";

import joinImage from "../../assets/img/join.png";
import wave1 from "../../assets/img/wave/waveint5.png";

const PartnerEcosystemSection = () => {
  const { t } = useTranslation("partnerForm");
  const COUNTRY_CONFIG = {
    "+971": { country: "UAE", digits: 9, startsWith: /^5/ },
    "+91": { country: "India", digits: 10, startsWith: /^[6-9]/ },
  };
  
  const [api, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);

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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submit Clicked!"); // Yeh console check karo

    // Validation Check (Simplified for testing)
    if (!formData.firstName || !formData.email || !formData.contact) {
      openNotification("error", "Error", "Please fill required fields (Name, Email, Contact)");
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

    console.log("Payload Sending:", payload);

    try {
      const res = await apiService.post("/property/lead", payload);
      console.log("API Response:", res);

      // Sab tarah ke response handling
      if (res?.success || res?.data?.success || res?.status === 200 || res?.status === 201) {
        openNotification("success", "Success", "Your request has been submitted!");
        setFormData({
          firstName: "", lastName: "", email: "", company: "",
          stakeholder: "", countryCode: "+971", contact: "", message: "",
        });
      }
    } catch (err) {
      console.error("API Error:", err);
      openNotification("error", "Failed", err.response?.data?.message || "Server Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
          
          <div className="flex flex-col">
            <h2 className="hidden lg:block text-2xl md:text-5xl font-semibold text-black">{t("hero.titleDesktop")}</h2>
            <h2 className="block lg:hidden text-3xl font-semibold text-black mb-6 text-center">{t("hero.titleMobile")}</h2>
            <img src={joinImage} alt="Join" className="hidden md:block w-full max-w-md mt-4 md:mt-8 mx-auto md:mx-0" />
          </div>

          {/* FORM CONTAINER (SAME UI) */}
          <div className="bg-white shadow-2xl rounded-2xl md:p-10 p-5 w-full max-w-full">
            <form className="space-y-4 md:space-y-5" onSubmit={handleSubmit}>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="w-full min-w-0">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t("form.firstName.label")} *</label>
                  <input name="firstName" placeholder={t("form.firstName.placeholder")} value={formData.firstName} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>
                <div className="w-full min-w-0">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t("form.lastName.label")} *</label>
                  <input name="lastName" placeholder={t("form.lastName.placeholder")} value={formData.lastName} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="w-full min-w-0">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t("form.email.label")} *</label>
                  <input type="email" name="email" placeholder={t("form.email.placeholder")} value={formData.email} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>
                <div className="w-full min-w-0">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t("form.company.label")} *</label>
                  <input name="company" placeholder={t("form.company.placeholder")} value={formData.company} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="w-full min-w-0">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t("form.stakeholder.label")} *</label>
                  <select name="stakeholder" value={formData.stakeholder} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-1 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white">
                    <option value="">{t("form.stakeholder.select")}</option>
                    <option value="Business Associate">{t("form.stakeholder.business")}</option>
                    <option value="Execution Partner">{t("form.stakeholder.execution")}</option>
                    <option value="Developer">{t("form.stakeholder.developer")}</option>
                    <option value="Investor">{t("form.stakeholder.investor")}</option>
                  </select>
                </div>
                <div className="w-full min-w-0">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t("form.phone.label")} *</label>
                  <div className="flex gap-1 md:gap-2">
                    <select name="countryCode" value={formData.countryCode} onChange={handleChange} className="w-[70px] md:w-[80px] h-[38px] md:h-10 border border-gray-300 rounded-md px-1 text-sm bg-white">
                      <option value="+971">+971</option>
                      <option value="+91">+91</option>
                    </select>
                    <input name="contact" placeholder={t("form.phone.placeholder")} value={formData.contact} onChange={handleChange} className="w-full h-[38px] md:h-10 border border-gray-300 rounded-md px-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                  </div>
                </div>
              </div>

              <div className="w-full min-w-0">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t("form.message.label")} *</label>
                <textarea name="message" rows="3" placeholder={t("form.message.placeholder")} value={formData.message} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none" />
              </div>

              <button type="submit" disabled={loading} className="w-full py-3 bg-[var(--color-primary)] text-white font-semibold rounded-md shadow-md hover:bg-purple-800 transition-colors flex items-center justify-center gap-2">
                {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : t("form.submit")}
              </button>

            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default PartnerEcosystemSection;