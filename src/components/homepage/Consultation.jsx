"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { notification, Select } from 'antd';
import { Country } from "country-state-city";
import { apiService } from "../../manageApi/utils/custom.apiservice";
import helloImage from "../../assets/img/hello.jpg";
import { useTranslation } from "react-i18next";

const { Option } = Select;

const PHONE_LENGTH_RULES = {
  "971": 9, "91": 10, "966": 9, "1": 10, "44": 10, "61": 9,
};

export default function Consultation() {
  const { t } = useTranslation("consultation");
  const [loading, setLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  // 1. Errors State Add kiya
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    country_code: "971", 
    number: "",
    message: "",
  });

  const countryOptions = useMemo(() => {
    const priorityIsoCodes = ["AE", "IN", "SA", "US", "GB", "AU"]; 
    return Country.getAllCountries().map((country) => ({
      name: country.name, code: country.phonecode, iso: country.isoCode,
    })).sort((a, b) => {
      // Sorting logic same as before
      const aPriority = priorityIsoCodes.includes(a.iso);
      const bPriority = priorityIsoCodes.includes(b.iso);
      if (aPriority && !bPriority) return -1;
      if (!aPriority && bPriority) return 1;
      return a.name.localeCompare(b.name);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // 2. Typing karte waqt error hatana
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCountryCodeChange = (value) => {
    const limit = PHONE_LENGTH_RULES[value] || 15;
    setFormData((prev) => ({ 
      ...prev, country_code: value, number: prev.number.slice(0, limit)
    }));
  };

  const handleNumber = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    const maxLength = PHONE_LENGTH_RULES[formData.country_code] || 15;
    const validatedValue = value.slice(0, maxLength);
    
    setFormData((prev) => ({ ...prev, number: validatedValue }));
    
    // Number type karte waqt error hatana
    if (errors.number) {
      setErrors((prev) => ({ ...prev, number: "" }));
    }
  };

  const openNotification = (type, title, description) => {
    api[type]({ message: title, description: description, placement: 'topRight' });
  };

  // 3. Validation Function
  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    if (!formData.first_name.trim()) {
      newErrors.first_name = t("form.firstName") + " is required";
      isValid = false;
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = t("form.lastName") + " is required";
      isValid = false;
    }
    if (!formData.email.trim()) {
      newErrors.email = t("form.email") + " is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }
    
    const requiredLength = PHONE_LENGTH_RULES[formData.country_code];
    if (!formData.number.trim()) {
      newErrors.number = "Mobile number is required";
      isValid = false;
    } else if (requiredLength && formData.number.length !== requiredLength) {
      newErrors.number = `Enter exactly ${requiredLength} digits`;
      isValid = false;
    }

    if (!formData.message.trim()) {
      newErrors.message = t("form.message") + " is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // 4. Pehle Validate karein, agar fail hua to yahin ruk jayein
    if (!validateForm()) {
      openNotification("error", "Validation Error", "Please fill all required fields correctly.");
      return; 
    }

    setLoading(true);

    const payload = {
      type: "consultation",
      consultant_type: "landscape",
      name: { first_name: formData.first_name.trim(), last_name: formData.last_name.trim() },
      mobile: { country_code: formData.country_code, number: formData.number },
      email: formData.email.trim().toLowerCase(),
      message: formData.message.trim(),
    };

    try {
      await apiService.post("/property/lead", payload);
      openNotification("success", "Thank You!", "Your consultation request has been submitted successfully.");
      setFormData({ first_name: "", last_name: "", email: "", country_code: "971", number: "", message: "" });
      setErrors({}); // Reset errors on success
    } catch (err) {
      // API Error handling logic same as before
      const errorData = err.response?.data;
      let errorMessage = "Something went wrong. Please try again.";
      if (Array.isArray(errorData?.errors) && errorData.errors.length > 0) {
        errorMessage = errorData.errors[0].message || errorData.errors[0].msg;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }
      openNotification("error", "Submission Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-gray-900">
      {contextHolder}
      <img src={helloImage} alt={t("imageAlt")} className="absolute inset-0 h-full w-full object-cover opacity-70" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(92, 3, 155, 0.85) 20%, rgba(3, 164, 244, 0.85) 95%)" }} />

      <div className="relative z-10 mx-auto flex flex-col lg:flex-row items-center lg:items-start justify-center lg:justify-start max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-16 gap-12 lg:gap-20">
        
        <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="max-w-xl text-white text-center lg:text-left">
          <h2 className={`mt-9 text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight`}>{t("title")}</h2>
          <p className="mt-5 text-xl md:text-2xl paragraph-light-1">{t("description")}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="w-full max-w-2xl">
          <div className="rounded-2xl bg-white p-5 sm:p-8 shadow-2xl">
            <form onSubmit={onSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{t("form.firstName")}*</label>
                  <input 
                    type="text" name="first_name" value={formData.first_name} onChange={handleChange} 
                    className={`w-full rounded-xl border px-4 py-2.5 outline-none focus:border-purple-500 ${errors.first_name ? "border-red-500 bg-red-50" : "border-gray-300"}`} 
                    placeholder={t("form.firstName")} 
                  />
                  {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{t("form.lastName")}*</label>
                  <input 
                    type="text" name="last_name" value={formData.last_name} onChange={handleChange} 
                    className={`w-full rounded-xl border px-4 py-2.5 outline-none focus:border-purple-500 ${errors.last_name ? "border-red-500 bg-red-50" : "border-gray-300"}`} 
                    placeholder={t("form.lastName")} 
                  />
                  {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t("form.email")}*</label>
                <input 
                  type="email" name="email" value={formData.email} onChange={handleChange} 
                  className={`w-full rounded-xl border px-4 py-2.5 outline-none focus:border-purple-500 ${errors.email ? "border-red-500 bg-red-50" : "border-gray-300"}`} 
                  placeholder={t("form.email")} 
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t("form.mobile")}*</label>
                <div className="flex flex-row items-center gap-2 w-full flex-nowrap">
                  <div className="w-[120px] sm:w-[140px] flex-shrink-0">
                    <Select
                      value={formData.country_code}
                      onChange={handleCountryCodeChange}
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) => 
                        option.children.props?.children[1]?.props?.children[1]?.toLowerCase().includes(input.toLowerCase()) || 
                        option.value.includes(input)
                      }
                      className="w-full h-[46px] custom-select-consultation"
                      style={{ width: '100%' }}
                      dropdownMatchSelectWidth={300}
                    >
                      {countryOptions.map((item) => (
                        <Option key={item.iso} value={item.code}>
                          <div className="flex items-center">
                            <img src={`https://flagcdn.com/w20/${item.iso.toLowerCase()}.png`} srcSet={`https://flagcdn.com/w40/${item.iso.toLowerCase()}.png 2x`} width="20" alt={item.name} style={{ marginRight: 8, borderRadius: 2, objectFit: 'cover' }} />
                            <span>+{item.code}</span>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </div>
                  <div className="flex-1">
                    <input 
                        type="text" value={formData.number} onChange={handleNumber} 
                        className={`w-full rounded-xl border px-4 py-2.5 outline-none focus:border-purple-500 h-[46px] ${errors.number ? "border-red-500 bg-red-50" : "border-gray-300"}`} 
                        placeholder={t("form.mobile")} 
                    />
                  </div>
                </div>
                {errors.number && <p className="text-red-500 text-xs mt-1">{errors.number}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t("form.message")}*</label>
                <textarea 
                  name="message" value={formData.message} onChange={handleChange} rows={4} 
                  className={`w-full rounded-xl border px-4 py-2.5 outline-none focus:border-purple-500 resize-none ${errors.message ? "border-red-500 bg-red-50" : "border-gray-300"}`} 
                  placeholder={t("form.message")} 
                />
                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full rounded-xl bg-gradient-to-r from-purple-700 to-purple-900 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg transition-all disabled:opacity-70 flex items-center justify-center text-center leading-tight">
                  {loading ? t("buttons.submitting") : t("buttons.submit")}
                </motion.button>

                <motion.a whileTap={{ scale: 0.98 }} href={`https://wa.me/971509180967`} target="_blank" rel="noopener noreferrer" className="w-full rounded-xl bg-[#25D366] py-3.5 text-sm sm:text-base font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 text-center leading-tight">
                  <svg className="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.3 1.592 5.448 0 9.886-4.438 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.834-.981z"/></svg>
                  WhatsApp
                </motion.a>
              </div>

            </form>
            <p className="text-center text-xs text-gray-500 mt-4 px-2">{t("privacy")}</p>
          </div>
        </motion.div>
      </div>
      
      <style jsx global>{`
        .custom-select-consultation .ant-select-selector {
          border-radius: 0.75rem !important; 
          border-color: #d1d5db !important; 
          height: 46px !important;
          padding-top: 6px !important;
          background-color: #f9fafb !important;
        }
        .custom-select-consultation .ant-select-selector:hover {
          border-color: #a855f7 !important;
        }
        .custom-select-consultation.ant-select-focused .ant-select-selector {
          border-color: #a855f7 !important;
          box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.2) !important;
        }
      `}</style>
    </section>
  );
}