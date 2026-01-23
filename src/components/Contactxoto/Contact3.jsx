"use client";

import React, { useState, useMemo } from "react";
import { notification, Select } from "antd";
import { apiService } from "../../manageApi/utils/custom.apiservice";
import Image from "../../assets/img/Image2.jpg";
import { useTranslation } from "react-i18next";
import { Country } from "country-state-city"; 

const { Option } = Select;

// 1. Strict Phone Length Rules
const PHONE_LENGTH_RULES = {
  "971": 9,  // UAE
  "91": 10,  // India
  "966": 9,  // KSA
  "1": 10,   // US
  "44": 10,  // UK
  "61": 9,   // Australia
};

export default function QuickEnquiry() {
  const { t } = useTranslation("contact3");
  const [api, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // 2. Form State
  const [formData, setFormData] = useState({
    first_name: "", last_name: "", email: "", country_code: "971", number: "", message: "",
  });

  // 3. Memoized Phone Country Codes
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

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCountryCodeChange = (value) => {
    const limit = PHONE_LENGTH_RULES[value] || 15;
    setFormData((prev) => ({ ...prev, country_code: value, number: prev.number.slice(0, limit) }));
  };

  const handleNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    const maxLength = PHONE_LENGTH_RULES[formData.country_code] || 15;
    const validatedValue = value.slice(0, maxLength);
    setFormData((prev) => ({ ...prev, number: validatedValue }));
    if (errors.number) setErrors((prev) => ({ ...prev, number: "" }));
  };

  // --- VALIDATION ---
  const validateForm = () => {
    let newErrors = {};
    let firstErrorMessage = null; 

    const setError = (field, message) => {
      newErrors[field] = message;
      if (!firstErrorMessage) firstErrorMessage = message;
    };

    if (!formData.first_name.trim()) setError("first_name", t("validation.firstName") || "First Name required");
    if (!formData.last_name.trim()) setError("last_name", t("validation.lastName") || "Last Name required");
    
    if (!formData.email.trim()) {
       setError("email", t("validation.email") || "Email required");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
       setError("email", "Invalid email format");
    }

    const requiredLength = PHONE_LENGTH_RULES[formData.country_code];
    if (!formData.number.trim()) {
       setError("number", t("validation.mobile") || "Mobile required");
    } else if (requiredLength && formData.number.length !== requiredLength) {
       setError("number", `Enter ${requiredLength} digits`);
    }

    if (!formData.message.trim()) setError("message", t("validation.message") || "Message required");

    setErrors(newErrors);
    return firstErrorMessage; 
  };

  // --- SUBMIT FUNCTION (RESTORED) ---
  const onSubmit = async (e) => {
    e.preventDefault();

    // 1. Validation Check
    const validationError = validateForm();
    if (validationError) {
      openNotification("error", t("notification.errorTitle") || "Validation Error", validationError);
      return;
    }

    setLoading(true);

    // 2. API Call
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

      // 3. Success Handling
      openNotification(
        "success",
        t("notification.successTitle") || "Success",
        t("notification.successMessage") || "Enquiry submitted successfully!"
      );

      // Reset Form
      setFormData({
        first_name: "", last_name: "", email: "",
        country_code: "971", number: "", message: "",
      });
      setErrors({});
    } catch (err) {
      // 4. Error Handling
      openNotification(
        "error",
        t("notification.errorTitle") || "Error",
        err.response?.data?.message || t("notification.errorMessage") || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  // --- HEIGHT FIX: 42px Explicit ---
  const inputClass = `w-full h-[42px] border rounded-md px-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 bg-white transition-all flex items-center border-gray-300`;
  const errorClass = `border-red-500 focus:ring-red-200`;

  return (
    <>
      {contextHolder}

      <section className="relative bg-cover bg-center py-14 sm:py-16 md:py-20 lg:py-24 text-white overflow-hidden" style={{ backgroundImage: `url(${Image})` }}>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-800/80 to-blue-500/70"></div>

        <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-10 px-5 sm:px-6 lg:px-8">
          
          <div className="w-full md:w-1/2 text-center md:text-left mt-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-4 leading-snug">{t("title")}</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-200 leading-relaxed">{t("description")}</p>
          </div>

          <div className="w-full md:max-w-xl bg-white rounded-xl shadow-xl p-6 sm:p-8 md:p-10 text-gray-800">
            <form onSubmit={onSubmit} className="space-y-4 md:space-y-5">
              
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="relative">
                  <label className="block text-xs md:text-sm font-medium mb-1">{t("form.firstName")}*</label>
                  <input name="first_name" value={formData.first_name} onChange={handleChange} className={`${inputClass} ${errors.first_name ? errorClass : ""}`} />
                </div>
                <div className="relative">
                  <label className="block text-xs md:text-sm font-medium mb-1">{t("form.lastName")}*</label>
                  <input name="last_name" value={formData.last_name} onChange={handleChange} className={`${inputClass} ${errors.last_name ? errorClass : ""}`} />
                </div>
              </div>

              {/* Email */}
              <div className="relative">
                  <label className="block text-xs md:text-sm font-medium mb-1">{t("form.email")}*</label>
                  <input name="email" value={formData.email} onChange={handleChange} className={`${inputClass} ${errors.email ? errorClass : ""}`} />
              </div>

              {/* --- FIXED MOBILE SECTION --- */}
              <div className="relative">
                <label className="block text-xs md:text-sm font-medium mb-1">{t("form.mobile")}*</label>
                
                {/* Parent Div: Height 42px fix + items-stretch */}
                <div className="flex w-full h-[42px] gap-2 items-stretch">
                  
                  {/* Select Wrapper */}
                  <div className="w-[90px] sm:w-[110px] h-full flex-shrink-0">
                      <Select
                          value={formData.country_code}
                          onChange={handleCountryCodeChange}
                          showSearch
                          optionFilterProp="children"
                          filterOption={(input, option) => option.children.props?.children[1]?.props?.children[1]?.toLowerCase().includes(input.toLowerCase()) || option.value.includes(input)}
                          className="w-full h-full custom-select-enquiry"
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

                  {/* Input Wrapper */}
                  <div className="flex-1 h-full">
                      <input
                        name="number"
                        value={formData.number}
                        onChange={handleNumberChange}
                        className={`w-full h-full border rounded-md px-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 ${errors.number ? "border-red-500" : "border-gray-300"}`}
                      />
                  </div>
                </div>
              </div>
              {/* ---------------------------- */}

              <div className="relative">
                <label className="block text-xs md:text-sm font-medium mb-1">{t("form.message")}*</label>
                <textarea name="message" value={formData.message} onChange={handleChange} rows={4} className={`w-full border rounded-md px-2 py-2 text-sm outline-none resize-none focus:ring-2 focus:ring-purple-500 ${errors.message ? "border-red-500" : "border-gray-300"}`} />
              </div>

              <button type="submit" disabled={loading} className="w-full bg-[#5C039B] text-white py-3 rounded-md font-semibold mt-4 hover:bg-purple-800 transition-colors shadow-md flex items-center justify-center gap-2">
                {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : t("buttons.submit")}
              </button>
            </form>

            <p className="text-center text-xs text-gray-500 mt-4">{t("privacy")}</p>
          </div>
        </div>
      </section>

      {/* FIXED CSS FOR EXACT HEIGHT MATCHING */}
      <style jsx global>{`
        .custom-select-enquiry .ant-select-selector {
          border-radius: 0.375rem !important; /* rounded-md */
          border-color: #d1d5db !important; /* border-gray-300 */
          
          /* FORCE 42px HEIGHT */
          height: 42px !important; 
          min-height: 42px !important;
          max-height: 42px !important;
          
          display: flex !important;
          align-items: center !important;
          padding-left: 4px !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          box-sizing: border-box !important;
        }
        
        .custom-select-enquiry .ant-select-selector:hover {
          border-color: #a855f7 !important;
        }
        
        .custom-select-enquiry.ant-select-focused .ant-select-selector {
          border-color: #a855f7 !important;
          box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.2) !important;
        }
        
        /* Vertically Center Content */
        .custom-select-enquiry .ant-select-selection-item {
            display: flex !important;
            align-items: center !important;
            line-height: 42px !important;
        }
      `}</style>
    </>
  );
}