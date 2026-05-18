"use client";
import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { notification, Select } from "antd"; 
import { Country } from "country-state-city"; 
import { apiService } from "../../manageApi/utils/custom.apiservice"; 

import GrowImage from "../../assets/img/Grow.png";
import wave1 from "../../assets/img/wave/wave1.png";

const { Option } = Select;

const PHONE_LENGTH_RULES = {
  "971": 9, "91": 10, "966": 9, "1": 10, "44": 10, "61": 9,
};

const CtaSection = () => {
  const { t } = useTranslation("cta");

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
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "", email: "", company: "", countryCode: "971", contact: "", inquiryType: "", message: "",
  });

  const phoneCountryOptions = useMemo(() => {
    const priorityIsoCodes = ["AE", "IN", "SA", "US", "GB", "AU"];
    return Country.getAllCountries().map((country) => ({
      name: country.name, code: country.phonecode, iso: country.isoCode,
    })).sort((a, b) => {
      const aPriority = priorityIsoCodes.includes(a.iso);
      const bPriority = priorityIsoCodes.includes(b.iso);
      if (aPriority && !bPriority) return -1;
      if (!aPriority && bPriority) return 1;
      return a.name.localeCompare(b.name);
    });
  }, []);

  const openNotification = (type, title, description) => {
    api[type]({ message: title, description, placement: "topRight" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCountryCodeChange = (value) => {
    const limit = PHONE_LENGTH_RULES[value] || 15;
    setFormData((prev) => ({ ...prev, countryCode: value, contact: prev.contact.slice(0, limit) }));
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    const maxLength = PHONE_LENGTH_RULES[formData.countryCode] || 15;
    const validatedValue = value.slice(0, maxLength);
    setFormData((prev) => ({ ...prev, contact: validatedValue }));
    if (errors.contact) setErrors((prev) => ({ ...prev, contact: "" }));
  };

  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    if (!formData.name.trim()) { newErrors.name = "Name is required"; isValid = false; }
    if (!formData.email.trim()) { newErrors.email = "Email is required"; isValid = false; }
    else if (!/\S+@\S+\.\S+/.test(formData.email)) { newErrors.email = "Invalid email"; isValid = false; }

    const requiredLength = PHONE_LENGTH_RULES[formData.countryCode];
    if (!formData.contact.trim()) { newErrors.contact = "Phone is required"; isValid = false; }
    else if (requiredLength && formData.contact.length !== requiredLength) {
      newErrors.contact = `Enter ${requiredLength} digits`;
      isValid = false;
    }

    if (!formData.company.trim()) { newErrors.company = "Company is required"; isValid = false; }
    if (!formData.inquiryType) { newErrors.inquiryType = "Inquiry Type is required"; isValid = false; }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    const nameParts = formData.name.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || ".";
    const finalStakeholder = STAKEHOLDER_MAP[formData.inquiryType] || "Investor";

    const payload = {
      type: "partner", 
      name: { first_name: firstName, last_name: lastName },
      email: formData.email.toLowerCase().trim(),
      company: formData.company.trim(), 
      mobile: { country_code: formData.countryCode, number: formData.contact },
      stakeholder_type: finalStakeholder, 
      message: formData.message.trim() || "Inquiry from CTA Section",
    };

    try {
      const res = await apiService.post("/property/lead", payload);
      if (res?.success || res?.data?.success || res?.status === 200) {
        openNotification("success", "Success", "Your inquiry has been submitted!");
        setOpenModal(false);
        setFormData({ name: "", email: "", company: "", countryCode: "971", contact: "", inquiryType: "", message: "" });
        setErrors({});
      }
    } catch (err) {
      const errorMsg = err.response?.data?.errors?.[0]?.message || "Validation Error";
      openNotification("error", "Failed", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // --- STYLING ---
  // Using explicit height [42px] and flex alignment
  const inputClass = `w-full h-[42px] border px-4 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 bg-white transition-all flex items-center text-sm border-gray-300`;
  const errorBorder = "border-red-500";

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

      {/* MODAL */}
      {openModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-2xl relative animate-fadeIn overflow-y-auto max-h-[95vh]">
            <button onClick={() => setOpenModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-red-500 text-2xl">×</button>
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">{t("modal.title")}</h2>

            <form className="space-y-4" onSubmit={handleSubmit}>
              
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t("form.name")} *</label>
                <input name="name" className={`${inputClass} ${errors.name ? errorBorder : ""}`} placeholder={t("form.namePlaceholder")} value={formData.name} onChange={handleChange} />
                {errors.name && <span className="text-red-500 text-xs absolute -bottom-4 left-0">{errors.name}</span>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{t("form.email")}</label>
                  <input type="email" name="email" className={`${inputClass} ${errors.email ? errorBorder : ""}`} placeholder="Email" value={formData.email} onChange={handleChange} />
                  {errors.email && <span className="text-red-500 text-xs absolute -bottom-4 left-0">{errors.email}</span>}
                </div>
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Company *</label>
                  <input name="company" className={`${inputClass} ${errors.company ? errorBorder : ""}`} placeholder="Company Name" value={formData.company} onChange={handleChange} />
                  {errors.company && <span className="text-red-500 text-xs absolute -bottom-4 left-0">{errors.company}</span>}
                </div>
              </div>

              {/* --- PHONE FIELD FIX --- */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t("form.phone")} *</label>
                
                {/* 1. Flex container with explicit height 42px */}
                <div className="flex w-full h-[42px] gap-2">
                  
                  {/* 2. Select Container */}
                  <div className="w-[90px] sm:w-[110px] h-full flex-shrink-0">
                    <Select
                        value={formData.countryCode}
                        onChange={handleCountryCodeChange}
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) => option.children.props?.children[1]?.props?.children[1]?.toLowerCase().includes(input.toLowerCase()) || option.value.includes(input)}
                        className="w-full h-full custom-select-cta"
                        dropdownMatchSelectWidth={300}
                    >
                        {phoneCountryOptions.map((item) => (
                        <Option key={item.iso} value={item.code}>
                            <div className="flex items-center">
                            <img src={`https://flagcdn.com/w20/${item.iso.toLowerCase()}.png`} srcSet={`https://flagcdn.com/w40/${item.iso.toLowerCase()}.png 2x`} width="20" alt={item.name} style={{ marginRight: 6, borderRadius: 2 }} />
                            <span className="text-xs">+{item.code}</span>
                            </div>
                        </Option>
                        ))}
                    </Select>
                  </div>

                  {/* 3. Input Field with explicit h-full (42px) */}
                  <div className="flex-1 h-full">
                    <input 
                      type="tel" 
                      name="contact" 
                      className={`w-full h-full border px-4 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 bg-white text-sm ${errors.contact ? "border-red-500" : "border-gray-300"}`} 
                      placeholder="Phone Number" 
                      value={formData.contact} 
                      onChange={handlePhoneChange} 
                    />
                  </div>
                </div>
                {errors.contact && <span className="text-red-500 text-xs absolute -bottom-4 left-0">{errors.contact}</span>}
              </div>
              {/* ----------------------- */}

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t("form.inquiry")} *</label>
                <select name="inquiryType" className={`${inputClass} ${errors.inquiryType ? errorBorder : ""}`} value={formData.inquiryType} onChange={handleChange}>
                  <option value="">{t("form.select")}</option>
                  {(t("form.options", { returnObjects: true }) || []).map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
                {errors.inquiryType && <span className="text-red-500 text-xs absolute -bottom-4 left-0">{errors.inquiryType}</span>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t("form.message")}</label>
                <textarea name="message" className="w-full border border-gray-300 px-4 py-2 rounded-lg outline-none resize-none focus:ring-2 focus:ring-purple-500 text-sm" rows="2" placeholder={t("form.messagePlaceholder")} value={formData.message} onChange={handleChange} />
              </div>

              <button type="submit" disabled={loading} className="w-full bg-[#5C039B] hover:bg-[#4a027d] py-3 rounded-lg text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2 mt-4">
                {loading ? <div className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></div> : t("form.submit")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FIXED CSS FOR ANT DESIGN SELECT */}
      <style jsx global>{`
        /* Target the Selector Box */
        .custom-select-cta .ant-select-selector {
          border-radius: 0.5rem !important; /* Matches rounded-lg */
          border: 1px solid #d1d5db !important; /* Matches border-gray-300 */
          height: 42px !important; /* EXACT PIXEL HEIGHT MATCH */
          display: flex !important;
          align-items: center !important;
          padding-left: 4px !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          background-color: white !important;
        }

        .custom-select-cta .ant-select-selector:hover {
          border-color: #a855f7 !important; 
        }

        .custom-select-cta.ant-select-focused .ant-select-selector {
          border-color: #a855f7 !important;
          box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.2) !important;
        }

        /* Center the flag and code vertically */
        .custom-select-cta .ant-select-selection-item {
            display: flex !important;
            align-items: center !important;
            line-height: 1 !important;
        }
      `}</style>
    </>
  );
};

export default CtaSection;