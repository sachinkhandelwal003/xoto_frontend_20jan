"use client";
import { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { notification, Select } from "antd"; 
import { Country, State, City } from "country-state-city"; 
import { apiService } from "../../manageApi/utils/custom.apiservice"; 
import wave1 from "../../assets/img/wave/waveint2.png";
import wave2 from "../../assets/img/wave/wave2.png";
import GetPreApprovedModal from "../homepage/GetPreApprovedModal";

const { Option } = Select;

const dmSans = { fontFamily: "'DM Sans', sans-serif" };

// 1. Strict Phone Length Rules
const PHONE_LENGTH_RULES = {
  "971": 9, "91": 10, "966": 9, "1": 10, "44": 10, "61": 9,
};

export default function Sixth() {
  const { t } = useTranslation("mort6");
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const [errors, setErrors] = useState({});

  // 2. Updated Form State (Added location fields)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "971", 
    phone: "",
    lookingFor: "",
    budget: "",
    location_country: null, // New
    state: null,           // New
    city: null             // New
  });

  // 3. Location Data States
  const [countriesList] = useState(Country.getAllCountries());
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);

  // 4. Phone Country Codes (Memoized)
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

  // --- HANDLERS ---

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCountryCodeChange = (value) => {
    const limit = PHONE_LENGTH_RULES[value] || 15;
    setFormData((prev) => ({ ...prev, countryCode: value, phone: prev.phone.slice(0, limit) }));
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    const maxLength = PHONE_LENGTH_RULES[formData.countryCode] || 15;
    const validatedValue = value.slice(0, maxLength);
    setFormData((prev) => ({ ...prev, phone: validatedValue }));
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
  };

  // --- NEW LOCATION HANDLERS ---
  const handleLocationCountryChange = (isoCode) => {
    const updatedStates = State.getStatesOfCountry(isoCode);
    setStatesList(updatedStates);
    setCitiesList([]);
    setFormData((prev) => ({ ...prev, location_country: isoCode, state: null, city: null }));
    if (errors.location_country) setErrors((prev) => ({ ...prev, location_country: "" }));
  };

  const handleLocationStateChange = (stateCode) => {
    const updatedCities = City.getCitiesOfState(formData.location_country, stateCode);
    setCitiesList(updatedCities);
    setFormData((prev) => ({ ...prev, state: stateCode, city: null }));
    if (errors.state) setErrors((prev) => ({ ...prev, state: "" }));
  };

  const handleLocationCityChange = (cityName) => {
    setFormData((prev) => ({ ...prev, city: cityName }));
    if (errors.city) setErrors((prev) => ({ ...prev, city: "" }));
  };

  // --- VALIDATION ---
  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    if (!formData.firstName.trim()) { newErrors.firstName = "First Name is required"; isValid = false; }
    if (!formData.lastName.trim()) { newErrors.lastName = "Last Name is required"; isValid = false; }
    
    if (!formData.email.trim()) { newErrors.email = "Email is required"; isValid = false; }
    else if (!/\S+@\S+\.\S+/.test(formData.email)) { newErrors.email = "Invalid email"; isValid = false; }

    const requiredLength = PHONE_LENGTH_RULES[formData.countryCode];
    if (!formData.phone.trim()) { newErrors.phone = "Phone is required"; isValid = false; }
    else if (requiredLength && formData.phone.length !== requiredLength) {
      newErrors.phone = `Enter ${requiredLength} digits`;
      isValid = false;
    }

    if (!formData.lookingFor) { newErrors.lookingFor = "Please select an option"; isValid = false; }
    
    // Location Validation
    if (!formData.location_country) { newErrors.location_country = "Country is required"; isValid = false; }
    if (!formData.state) { newErrors.state = "State is required"; isValid = false; }
    if (citiesList.length > 0 && !formData.city) { newErrors.city = "City is required"; isValid = false; }
    
    if (!formData.budget.trim()) { newErrors.budget = "Budget is required"; isValid = false; }

    setErrors(newErrors);
    return isValid;
  };

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
        api.error({ message: "Validation Error", description: "Please fill all fields correctly." });
        return;
    }

    setLoading(true);

    const payload = {
      type: "Mortgage-deal",
      name: { first_name: formData.firstName, last_name: formData.lastName },
      email: formData.email.toLowerCase().trim(),
      company: "Individual",
      mobile: { country_code: formData.countryCode, number: formData.phone },
      stakeholder_type: "Investor",
      
      // Sending City in Message as per original structure requirement
      message: `Looking For: ${formData.lookingFor}, City: ${formData.city}, Country: ${formData.location_country}, Budget: ${formData.budget}`,
    };

    try {
      const res = await apiService.post("/property/lead", payload);
      if (res?.success || res?.status === 200) {
        api.success({ message: "Success", description: "Inquiry Submitted!" });
        setFormData({ firstName: "", lastName: "", email: "", countryCode: "971", phone: "", lookingFor: "", budget: "", location_country: null, state: null, city: null });
        setErrors({});
      }
    } catch (err) {
      const errorData = err.response?.data;
      let errorMessage = "Server Error";
      if (Array.isArray(errorData?.errors) && errorData.errors.length > 0) {
        errorMessage = errorData.errors[0].message || errorData.errors[0].msg;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }
      api.error({ message: "Failed", description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <div className="relative min-h-screen bg-gradient-to-br from-[#F8F4FF] via-[#F4EEFF] to-[#E9F1FF] overflow-hidden" style={dmSans}>
        
        <img src={wave2} className="absolute top-15 w-full -translate-y-2/3 opacity-90" alt="" />
        <img src={wave1} className="absolute bottom-0 w-full translate-y-2/4 opacity-90" alt="" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-10 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 ">

          {/* LEFT CONTENT */}
          <div className="w-full lg:max-w-[600px] text-center lg:text-left space-y-6 mx-auto lg:mx-0 lg:ms-10">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0F172A] leading-tight lg:leading-extratight">
              {t("hero.title")}
            </h1>
            <p className="text-base sm:text-lg text-[#5A7BA1] leading-tight max-w-[360px] mx-auto lg:mx-0">
              {t("hero.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2 items-center lg:items-start justify-center lg:justify-start">
              <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto px-8 py-4 bg-[#5C039B] hover:bg-[#4a027c] rounded-xl text-white font-semibold text-base shadow-lg transition">
                {t("hero.primaryCta")}
              </button>

              <button onClick={() => window.open("https://wa.me/919785408712", "_blank")} className="w-full sm:w-auto px-8 py-4 border-2 border-[#5C039B] text-[#5C039B] rounded-xl font-semibold text-base hover:bg-[#5C039B] hover:text-white transition">
                {t("hero.secondaryCta")}
              </button>
            </div>
          </div>

          {/* FORM */}
          <div className="bg-white rounded-3xl shadow-2xl p-5 md:p-8 space-y-5 w-full">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-2">{t("form.heading")}</h3>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="w-full min-w-0">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t("form.firstName")}*</label>
                  <input name="firstName" value={formData.firstName} onChange={handleChange} className={`w-full px-2 py-2 md:px-4 md:py-3 text-sm md:text-base border rounded-xl outline-none transition ${errors.firstName ? "border-red-500 bg-red-50" : "border-gray-300 focus:ring-2 focus:ring-purple-500"}`} />
                  {errors.firstName && <span className="text-red-500 text-[10px]">{errors.firstName}</span>}
                </div>
                <div className="w-full min-w-0">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t("form.lastName")}*</label>
                  <input name="lastName" value={formData.lastName} onChange={handleChange} className={`w-full px-2 py-2 md:px-4 md:py-3 text-sm md:text-base border rounded-xl outline-none transition ${errors.lastName ? "border-red-500 bg-red-50" : "border-gray-300 focus:ring-2 focus:ring-purple-500"}`} />
                   {errors.lastName && <span className="text-red-500 text-[10px]">{errors.lastName}</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="w-full min-w-0">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t("form.email")}*</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className={`w-full px-2 py-2 md:px-4 md:py-3 text-sm md:text-base border rounded-xl outline-none transition ${errors.email ? "border-red-500 bg-red-50" : "border-gray-300 focus:ring-2 focus:ring-purple-500"}`} />
                  {errors.email && <span className="text-red-500 text-[10px]">{errors.email}</span>}
                </div>

                <div className="w-full min-w-0">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t("form.phone")}*</label>
                  <div className="flex gap-1 md:gap-2">
                    <div className="w-[80px] md:w-[110px] flex-shrink-0">
                        <Select value={formData.countryCode} onChange={handleCountryCodeChange} showSearch optionFilterProp="children" filterOption={(input, option) => option.children.props?.children[1]?.props?.children[1]?.toLowerCase().includes(input.toLowerCase()) || option.value.includes(input)} className="w-full h-full custom-select-mort6" style={{ width: '100%' }} dropdownMatchSelectWidth={300}>
                            {phoneCountryOptions.map((item) => (
                            <Option key={item.iso} value={item.code}>
                                <div className="flex items-center">
                                <img src={`https://flagcdn.com/w20/${item.iso.toLowerCase()}.png`} srcSet={`https://flagcdn.com/w40/${item.iso.toLowerCase()}.png 2x`} width="20" alt={item.name} style={{ marginRight: 6, borderRadius: 2 }} />
                                <span className="text-xs md:text-sm">+{item.code}</span>
                                </div>
                            </Option>
                            ))}
                        </Select>
                    </div>
                    <input name="phone" value={formData.phone} onChange={handlePhoneChange} className={`w-full px-2 py-2 md:px-4 md:py-3 text-sm md:text-base border rounded-xl outline-none transition ${errors.phone ? "border-red-500 bg-red-50" : "border-gray-300 focus:ring-2 focus:ring-purple-500"}`} />
                  </div>
                  {errors.phone && <span className="text-red-500 text-[10px]">{errors.phone}</span>}
                </div>
              </div>

              {/* Looking For & Country */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="relative w-full min-w-0">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t("form.lookingFor")}*</label>
                  <div className="relative">
                    <select name="lookingFor" value={formData.lookingFor} onChange={handleChange} className={`w-full px-2 py-2 md:px-4 md:py-3 text-sm md:text-base border rounded-xl appearance-none pr-6 md:pr-10 outline-none ${errors.lookingFor ? "border-red-500 bg-red-50" : "border-gray-300 focus:ring-2 focus:ring-purple-500"}`}>
                      <option value="">{t("form.select")}</option>
                      <option value="homeLoan">{t("form.options.homeLoan")}</option>
                      <option value="refinance">{t("form.options.refinance")}</option>
                      <option value="personalLoan">{t("form.options.personalLoan")}</option>
                    </select>
                    <ChevronDown className="absolute right-1 md:right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                  {errors.lookingFor && <span className="text-red-500 text-[10px]">{errors.lookingFor}</span>}
                </div>

                {/* Country Select */}
                <div className="w-full min-w-0">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Country*</label>
                  <Select placeholder="Select Country" showSearch optionFilterProp="children" onChange={handleLocationCountryChange} className={`w-full custom-select-mort6 ${errors.location_country ? "border-red-500" : ""}`} filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}>
                    {countriesList.map((country) => (
                      <Option key={country.isoCode} value={country.isoCode}>{country.name}</Option>
                    ))}
                  </Select>
                  {errors.location_country && <span className="text-red-500 text-[10px]">{errors.location_country}</span>}
                </div>
              </div>

              {/* State & City */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="w-full min-w-0">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">State*</label>
                  <Select placeholder="Select State" showSearch optionFilterProp="children" onChange={handleLocationStateChange} disabled={!statesList.length} className={`w-full custom-select-mort6 ${errors.state ? "border-red-500" : ""}`} filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}>
                    {statesList.map((state) => (
                      <Option key={state.isoCode} value={state.isoCode}>{state.name}</Option>
                    ))}
                  </Select>
                  {errors.state && <span className="text-red-500 text-[10px]">{errors.state}</span>}
                </div>

                <div className="w-full min-w-0">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t("form.city")}*</label>
                  <Select placeholder="Select City" showSearch optionFilterProp="children" onChange={handleLocationCityChange} disabled={!citiesList.length} className={`w-full custom-select-mort6 ${errors.city ? "border-red-500" : ""}`} filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}>
                    {citiesList.map((city) => (
                      <Option key={city.name} value={city.name}>{city.name}</Option>
                    ))}
                  </Select>
                  {errors.city && <span className="text-red-500 text-[10px]">{errors.city}</span>}
                </div>
              </div>

              <div className="w-full min-w-0">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{t("form.budget")}*</label>
                <input name="budget" value={formData.budget} onChange={handleChange} className={`w-full px-2 py-2 md:px-4 md:py-3 text-sm md:text-base border rounded-xl outline-none transition ${errors.budget ? "border-red-500 bg-red-50" : "border-gray-300 focus:ring-2 focus:ring-purple-500"}`} />
                 {errors.budget && <span className="text-red-500 text-[10px]">{errors.budget}</span>}
              </div>

              <button type="submit" disabled={loading} className="w-full py-3 md:py-4 text-sm md:text-lg bg-[#5C039B] hover:bg-[#5B21B6] text-white rounded-xl font-semibold shadow-lg transition flex justify-center items-center">
                {loading ? "Submitting..." : t("form.submit")}
              </button>
            </form>
          </div>

        </div>
      </div>

      <GetPreApprovedModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <style jsx global>{`
        .custom-select-mort6 .ant-select-selector {
          border-radius: 0.75rem !important; 
          border-color: #d1d5db !important; 
          height: 100% !important;
          min-height: 38px !important;
          display: flex !important;
          align-items: center !important;
          padding-left: 8px !important;
        }
        @media (min-width: 768px) {
             .custom-select-mort6 .ant-select-selector {
                 min-height: 48px !important;
             }
        }
        .custom-select-mort6 .ant-select-selector:hover {
          border-color: #8b5cf6 !important;
        }
        .custom-select-mort6.ant-select-focused .ant-select-selector {
          border-color: #8b5cf6 !important;
          box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2) !important;
        }
      `}</style>
    </>
  );
}