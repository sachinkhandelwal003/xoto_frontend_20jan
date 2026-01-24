import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { notification, Select } from "antd"; 
import { Country } from "country-state-city"; 
import { apiService } from "../../manageApi/utils/custom.apiservice";

import joinImage from "../../assets/img/join.png";
import wave1 from "../../assets/img/wave/waveint5.png";

const { Option } = Select;

const PHONE_LENGTH_RULES = {
  "971": 9, "91": 10, "966": 9, "1": 10, "44": 10, "61": 9,
};

const PartnerEcosystemSection = () => {
  const { t } = useTranslation("partnerForm");
  const [api, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", company: "",
    stakeholder: "", countryCode: "971", contact: "", message: "",
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
    api[type]({ message: title, description: description, placement: "topRight" });
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

    if (!formData.firstName.trim()) { newErrors.firstName = "First Name required"; isValid = false; }
    if (!formData.lastName.trim()) { newErrors.lastName = "Last Name required"; isValid = false; }
    if (!formData.email.trim()) { newErrors.email = "Email required"; isValid = false; }
    else if (!/\S+@\S+\.\S+/.test(formData.email)) { newErrors.email = "Invalid email"; isValid = false; }

    const requiredLength = PHONE_LENGTH_RULES[formData.countryCode];
    if (!formData.contact.trim()) { newErrors.contact = "Phone required"; isValid = false; }
    else if (requiredLength && formData.contact.length !== requiredLength) {
      newErrors.contact = `Enter ${requiredLength} digits`;
      isValid = false;
    }

    if (!formData.company.trim()) { newErrors.company = "Company required"; isValid = false; }
    if (!formData.stakeholder) { newErrors.stakeholder = "Stakeholder required"; isValid = false; }
    if (!formData.message.trim()) { newErrors.message = "Message required"; isValid = false; }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    const payload = {
      type: "partner",
      name: { first_name: formData.firstName.trim(), last_name: formData.lastName.trim() },
      email: formData.email.toLowerCase().trim(),
      company: formData.company.trim(),
      stakeholder_type: formData.stakeholder,
      mobile: { country_code: formData.countryCode, number: formData.contact },
      message: formData.message.trim(),
    };

    try {
      const res = await apiService.post("/property/lead", payload);
      if (res?.success || res?.status === 200 || res?.status === 201) {
        openNotification("success", "Success", "Your request has been submitted!");
        setFormData({ firstName: "", lastName: "", email: "", company: "", stakeholder: "", countryCode: "971", contact: "", message: "" });
        setErrors({});
      }
    } catch (err) {
      openNotification("error", "Failed", err.response?.data?.message || "Server Error");
    } finally {
      setLoading(false);
    }
  };

  // Common Input Class
  const inputClass = `w-full h-[42px] border rounded-md px-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 bg-white transition-all flex items-center`;
  const errorClass = "border-red-500 focus:ring-red-200";
  const normalClass = "border-gray-300";

  return (
    <>
      {contextHolder}
      <section className="w-full relative bg-[var(--color-body)] py-16 md:py-20 px-4 md:px-12 z-10 overflow-hidden">
        
        <div className="absolute top-[-40px] sm:top-[-80px] lg:top-[-150px] left-0 w-full z-0 ">
          <img src={wave1} alt="" className="w-full h-auto object-cover scale-[1.6] sm:scale-[1.3] lg:scale-100 -ml-[30%] sm:-ml-[15%] lg:ml-0 pointer-events-none select-none" />
        </div>

        <div className="relative z-20 max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div className="flex flex-col">
            <h2 className="hidden lg:block text-2xl md:text-5xl font-semibold text-black">{t("hero.titleDesktop")}</h2>
            <h2 className="block lg:hidden text-3xl font-semibold text-black mb-6 text-center">{t("hero.titleMobile")}</h2>
            <img src={joinImage} alt="Join" className="hidden md:block w-full max-w-md mt-4 md:mt-8 mx-auto md:mx-0" />
          </div>

          <div className="bg-white shadow-2xl rounded-2xl md:p-10 p-5 w-full max-w-full">
            <form className="space-y-4 md:space-y-5" onSubmit={handleSubmit}>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="w-full min-w-0 relative">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t("form.firstName.label")} *</label>
                  <input name="firstName" placeholder={t("form.firstName.placeholder")} value={formData.firstName} onChange={handleChange} className={`${inputClass} ${errors.firstName ? errorClass : normalClass}`} />
                  {errors.firstName && <span className="text-red-500 text-[10px] absolute -bottom-4 left-0">{errors.firstName}</span>}
                </div>
                <div className="w-full min-w-0 relative">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t("form.lastName.label")} *</label>
                  <input name="lastName" placeholder={t("form.lastName.placeholder")} value={formData.lastName} onChange={handleChange} className={`${inputClass} ${errors.lastName ? errorClass : normalClass}`} />
                  {errors.lastName && <span className="text-red-500 text-[10px] absolute -bottom-4 left-0">{errors.lastName}</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="w-full min-w-0 relative">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t("form.email.label")} *</label>
                  <input type="email" name="email" placeholder={t("form.email.placeholder")} value={formData.email} onChange={handleChange} className={`${inputClass} ${errors.email ? errorClass : normalClass}`} />
                  {errors.email && <span className="text-red-500 text-[10px] absolute -bottom-4 left-0">{errors.email}</span>}
                </div>
                <div className="w-full min-w-0 relative">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t("form.company.label")} *</label>
                  <input name="company" placeholder={t("form.company.placeholder")} value={formData.company} onChange={handleChange} className={`${inputClass} ${errors.company ? errorClass : normalClass}`} />
                  {errors.company && <span className="text-red-500 text-[10px] absolute -bottom-4 left-0">{errors.company}</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="w-full min-w-0 relative">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t("form.stakeholder.label")} *</label>
                  <select name="stakeholder" value={formData.stakeholder} onChange={handleChange} className={`${inputClass} ${errors.stakeholder ? errorClass : normalClass}`}>
                    <option value="">{t("form.stakeholder.select")}</option>
                    <option value="Business Associate">{t("form.stakeholder.business")}</option>
                    <option value="Execution Partner">{t("form.stakeholder.execution")}</option>
                    <option value="Developer">{t("form.stakeholder.developer")}</option>
                    <option value="Investor">{t("form.stakeholder.investor")}</option>
                  </select>
                  {errors.stakeholder && <span className="text-red-500 text-[10px] absolute -bottom-4 left-0">{errors.stakeholder}</span>}
                </div>

                {/* --- MOBILE FIELD: RESPONSIVE WIDTH --- */}
                <div className="w-full min-w-0 relative">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t("form.phone.label")} *</label>
                  
                  {/* Added items-center to fix vertical alignment */}
                  <div className="flex gap-2 w-full h-[42px] items-center">
                    
                    {/* Changed width: 90px on Mobile, 110px on Desktop (sm) */}
                    <div className="w-[90px] sm:w-[110px] flex-shrink-0 h-full">
                        <Select
                            value={formData.countryCode}
                            onChange={handleCountryCodeChange}
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) => option.children.props?.children[1]?.props?.children[1]?.toLowerCase().includes(input.toLowerCase()) || option.value.includes(input)}
                            className="w-full custom-select-partner h-full"
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

                    <div className="flex-1 h-full">
                       <input 
                         name="contact" 
                         placeholder={t("form.phone.placeholder")} 
                         value={formData.contact} 
                         onChange={handlePhoneChange} 
                         className={`w-full h-full border rounded-md px-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 bg-white ${errors.contact ? "border-red-500" : "border-gray-300"}`} 
                       />
                    </div>
                  </div>
                  {errors.contact && <span className="text-red-500 text-[10px] absolute -bottom-4 left-0">{errors.contact}</span>}
                </div>
              </div>

              <div className="w-full min-w-0 relative">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t("form.message.label")} *</label>
                <textarea name="message" rows="3" placeholder={t("form.message.placeholder")} value={formData.message} onChange={handleChange} className={`w-full border rounded-md px-3 py-2 text-sm outline-none resize-none focus:ring-2 focus:ring-purple-500 bg-white ${errors.message ? "border-red-500" : "border-gray-300"}`} />
                {errors.message && <span className="text-red-500 text-[10px] absolute -bottom-4 left-0">{errors.message}</span>}
              </div>

              <button type="submit" disabled={loading} className="w-full py-3 bg-[var(--color-primary)] text-white font-semibold rounded-md shadow-md hover:bg-purple-800 transition-colors flex items-center justify-center gap-2 mt-4">
                {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : t("form.submit")}
              </button>

            </form>
          </div>
        </div>
      </section>

      <style jsx global>{`
        /* Consistent Select Styling */
        .custom-select-partner .ant-select-selector {
          border-radius: 0.375rem !important; /* Tailwind rounded-md */
          border-color: #d1d5db !important; /* Tailwind gray-300 */
          height: 42px !important; /* Forced exact height */
          display: flex !important;
          align-items: center !important;
          padding-left: 8px !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          background-color: white !important;
        }
        .custom-select-partner .ant-select-selector:hover {
          border-color: #a855f7 !important; /* purple-500 */
        }
        .custom-select-partner.ant-select-focused .ant-select-selector {
          border-color: #a855f7 !important;
          box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.2) !important;
        }
        .custom-select-partner .ant-select-selection-item {
            display: flex !important;
            align-items: center !important;
            line-height: 1 !important;
        }
      `}</style>
    </>
  );
};

export default PartnerEcosystemSection;