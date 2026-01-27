"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { notification, Select } from "antd";
import { useTranslation } from "react-i18next";
import { Country } from "country-state-city"; 
import { apiService } from "../../manageApi/utils/custom.apiservice";
import helloImage from "../../assets/img/hello.jpg";

// --- IMPORT VALIDATION FUNCTIONS ---
import { validatePhoneNumberLength, parsePhoneNumberFromString } from 'libphonenumber-js';

const { Option } = Select;

export default function ConsultationSection() {
  const { t } = useTranslation("book");
  const [loading, setLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    country_code: "91", // Default to India or UAE as needed
    number: "",
    message: "",
  });

  // Prepare Country List
  const countryOptions = useMemo(() => {
    const priorityIsoCodes = ["AE", "IN", "SA", "US", "GB", "AU"];
    return Country.getAllCountries().map((country) => ({
      name: country.name,
      code: country.phonecode,
      iso: country.isoCode,
    })).sort((a, b) => {
      const aPriority = priorityIsoCodes.includes(a.iso);
      const bPriority = priorityIsoCodes.includes(b.iso);
      if (aPriority && !bPriority) return -1;
      if (!aPriority && bPriority) return 1;
      return a.name.localeCompare(b.name);
    });
  }, []);

  // --- UPDATED & FIXED VALIDATION LOGIC ---
  const validateLiveNumber = (phoneValue, countryCode) => {
    if (!phoneValue) return "";

    const fullNumber = `+${countryCode}${phoneValue}`;
    const phoneNumber = parsePhoneNumberFromString(fullNumber);

    // 1. Length Check
    const lengthError = validatePhoneNumberLength(fullNumber);
    if (lengthError === 'TOO_SHORT') return "Number is too short";
    if (lengthError === 'TOO_LONG') return "Number is too long";

    // 2. Validity Check
    if (!phoneNumber || !phoneNumber.isValid()) {
        return "Invalid mobile number";
    }

    // 3. RELAXED TYPE CHECK (Fix for valid numbers showing error)
    // Hum strictly 'MOBILE' check nahi karenge. 
    // Hum sirf ye check karenge ki ye LANDLINE to nahi hai na.
    const type = phoneNumber.getType();
    
    // Agar number explicitly FIXED_LINE (Landline) hai, tabhi roko.
    // Baaki cases (Mobile, FixedOrMobile, Unknown) ko allow karo.
    if (type === 'FIXED_LINE') {
        return "Landline numbers are not allowed";
    }

    return ""; // No Error (Valid)
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCountryCodeChange = (value) => {
    setFormData((prev) => ({ ...prev, country_code: value }));
    
    if (formData.number) {
        const errorMsg = validateLiveNumber(formData.number, value);
        setErrors(prev => ({ ...prev, number: errorMsg }));
    }
  };

  const handleNumber = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Only digits
    
    setFormData((prev) => ({ ...prev, number: value }));

    const errorMsg = validateLiveNumber(value, formData.country_code);
    setErrors(prev => ({ ...prev, number: errorMsg }));
  };

  const openNotification = (type, title, description) => {
    api[type]({ message: title, description, placement: "topRight" });
  };

  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    if (!formData.first_name.trim()) newErrors.first_name = t("errors.firstName") || "First Name is required";
    if (!formData.last_name.trim()) newErrors.last_name = t("errors.lastName") || "Last Name is required";
    
    if (!formData.email.trim()) {
      newErrors.email = t("errors.email") || "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid Email Format";
    }

    if (!formData.number.trim()) {
      newErrors.number = t("errors.mobile") || "Mobile is required";
      isValid = false;
    } else {
       const mobileError = validateLiveNumber(formData.number, formData.country_code);
       if (mobileError) {
           newErrors.number = mobileError;
           isValid = false;
       }
    }

    if (!formData.message.trim()) newErrors.message = t("errors.message") || "Message is required";

    if (Object.keys(newErrors).length > 0) isValid = false;

    setErrors(newErrors);
    return isValid;
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      openNotification("error", t("errors.validationTitle") || "Validation Error", "Please fill all fields correctly.");
      return;
    }

    setLoading(true);

    const payload = {
      type: "consultation",
      consultant_type: "interior",
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
      openNotification("success", t("success.title"), t("success.message"));
      setFormData({
        first_name: "", last_name: "", email: "",
        country_code: "91", number: "", message: "",
      });
      setErrors({}); 
    } catch (err) {
      const errorData = err.response?.data;
      let errorMessage = t("errors.submit") || "Something went wrong";

      if (Array.isArray(errorData?.errors) && errorData.errors.length > 0) {
        errorMessage = errorData.errors[0].message || errorData.errors[0].msg;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }

      openNotification("error", t("errors.submitTitle"), errorMessage);
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
        
        {/* Left Side: Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-xl text-white text-center lg:text-left"
        >
          <h2 className={`mt-9 text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight`}>
            {t("title")}
          </h2>
          <p className="mt-5 text-lg md:text-2xl opacity-90">
            {t("description")}
          </p>
        </motion.div>

        {/* Right Side: Form */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full max-w-lg"
        >
          <div className="rounded-2xl bg-white p-5 sm:p-8 shadow-2xl">
            <form onSubmit={onSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 mb-1">{t("form.firstName")}*</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className={`w-full rounded-xl border px-4 h-[46px] outline-none transition-all ${errors.first_name ? "border-red-500 bg-red-50" : "border-gray-300 focus:border-purple-500"}`}
                    placeholder={t("form.firstName")}
                  />
                  {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 mb-1">{t("form.lastName")}*</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className={`w-full rounded-xl border px-4 h-[46px] outline-none transition-all ${errors.last_name ? "border-red-500 bg-red-50" : "border-gray-300 focus:border-purple-500"}`}
                    placeholder={t("form.lastName")}
                  />
                  {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-1">{t("form.email")}*</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full rounded-xl border px-4 h-[46px] outline-none transition-all ${errors.email ? "border-red-500 bg-red-50" : "border-gray-300 focus:border-purple-500"}`}
                  placeholder={t("form.email")}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* ----- MOBILE SECTION ----- */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-1">{t("form.mobile")}*</label>
                <div className="flex w-full gap-2">
                  
                  {/* Country Selector */}
                  <div className="w-[125px] shrink-0">
                    <Select
                      value={formData.country_code}
                      onChange={handleCountryCodeChange}
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) => 
                        option.children.props?.children[1]?.props?.children[1]?.toLowerCase().includes(input.toLowerCase()) || 
                        option.value.includes(input)
                      }
                      className="w-full custom-select-consultation"
                      popupMatchSelectWidth={300}
                    >
                      {countryOptions.map((item) => (
                        <Option key={item.iso} value={item.code}>
                          <div className="flex items-center">
                            <img 
                              src={`https://flagcdn.com/w20/${item.iso.toLowerCase()}.png`} 
                              srcSet={`https://flagcdn.com/w40/${item.iso.toLowerCase()}.png 2x`} 
                              width="20" 
                              alt={item.name} 
                              style={{ marginRight: 8, borderRadius: 2, objectFit: 'cover' }} 
                            />
                            <span>+{item.code}</span>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </div>

                  {/* Mobile Input */}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={formData.number}
                      onChange={handleNumber}
                      className={`w-full rounded-xl border px-4 h-[46px] outline-none transition-all ${errors.number ? "border-red-500 bg-red-50" : "border-gray-300 focus:border-purple-500"}`}
                      placeholder={t("form.mobile")}
                    />
                  </div>
                </div>
                {errors.number && <p className="text-red-500 text-xs mt-1 animate-pulse font-medium">{errors.number}</p>}
              </div>
              {/* ---------------------------------- */}

              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-1">{t("form.message")}*</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full rounded-xl border px-4 py-2.5 outline-none transition-all resize-none ${errors.message ? "border-red-500 bg-red-50" : "border-gray-300 focus:border-purple-500"}`}
                  placeholder={t("form.message")}
                />
                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-purple-700 to-indigo-900 py-3.5 text-lg font-bold text-white shadow-lg disabled:opacity-70 transition-all"
              >
                {loading ? t("buttons.submitting") : t("buttons.submit")}
              </motion.button>

              <p className="text-center text-xs text-gray-400 mt-2 px-2">
                {t("privacy")}
              </p>
            </form>
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        .custom-select-consultation .ant-select-selector {
          border-radius: 0.75rem !important;
          border-color: #d1d5db !important;
          height: 46px !important;
          display: flex !important;
          align-items: center !important;
          background-color: white !important;
          box-shadow: none !important;
        }
        .custom-select-consultation .ant-select-selection-item {
          display: flex !important;
          align-items: center !important;
          line-height: 1 !important;
        }
        .custom-select-consultation:hover .ant-select-selector {
          border-color: #a855f7 !important;
        }
        .custom-select-consultation.ant-select-focused .ant-select-selector {
          border-color: #a855f7 !important;
          box-shadow: 0 0 0 1px #a855f7 !important;
          outline: none !important;
        }
      `}</style>
    </section>
  );
}