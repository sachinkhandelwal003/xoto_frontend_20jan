import React, { useState, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { apiService } from "../../manageApi/utils/custom.apiservice";
import { Select } from "antd"; 
import { Country, State, City } from "country-state-city"; // Location Package

import waveint6 from "../../assets/img/wave/waveint6.png";
import waveint from "../../assets/img/wave/waveint4.png";
import image from "../../assets/img/bggg.png";

const { Option } = Select;

/* ---------------- COUNTRY CONFIG ---------------- */
const COUNTRY_CONFIG = {
  "971": { country: "UAE", digits: 9, startsWith: /^5/ },
  "91": { country: "India", digits: 10, startsWith: /^[6-9]/ },
};

const getPhoneConfig = (code) => {
  return COUNTRY_CONFIG[code] || { country: "Unknown", digits: 10, startsWith: /^\d/ }; 
};

export default function HeroSection() {
  const { t } = useTranslation("buy7");

  /* ---------------- STATE ---------------- */
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "971", 
    phone: "",
    lookingFor: "",
    budget: "",
    // Location Fields
    location_country: null,
    state: null,
    city: null
  });

  const [loading, setLoading] = useState(false);

  // Location Data States
  const [countriesList] = useState(Country.getAllCountries());
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);

  // Memoized Phone Codes (Priority Sorting)
  const phoneCountryOptions = useMemo(() => {
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

  /* ---------------- HANDLERS ---------------- */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Phone Handlers
  const handleCountryCodeChange = (value) => {
    setForm((prev) => ({ ...prev, countryCode: value, phone: "" }));
  };

  const handlePhoneChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, "");
    const config = getPhoneConfig(form.countryCode);
    const max = config.digits || 15;
    if (digitsOnly.length > max) return;
    setForm((prev) => ({ ...prev, phone: digitsOnly }));
  };

  // --- LOCATION HANDLERS ---
  const handleLocationCountryChange = (isoCode) => {
    const updatedStates = State.getStatesOfCountry(isoCode);
    setStatesList(updatedStates);
    setCitiesList([]);
    setForm((prev) => ({ ...prev, location_country: isoCode, state: null, city: null }));
  };

  const handleLocationStateChange = (stateCode) => {
    const updatedCities = City.getCitiesOfState(form.location_country, stateCode);
    setCitiesList(updatedCities);
    setForm((prev) => ({ ...prev, state: stateCode, city: null }));
  };

  const handleLocationCityChange = (cityName) => {
    setForm((prev) => ({ ...prev, city: cityName }));
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { countryCode, phone } = form;
    const config = getPhoneConfig(countryCode);

    // Validation
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.location_country) {
      toast.error(t("error")); // "Please fill all required fields"
      return;
    }

    if (COUNTRY_CONFIG[countryCode] && phone.length !== config.digits) {
      toast.error(`${config.country} phone number must be ${config.digits} digits`);
      return;
    }

    setLoading(true);

    // Resolve Names
    const countryName = Country.getCountryByCode(form.location_country)?.name || "";
    const stateName = State.getStateByCodeAndCountry(form.state, form.location_country)?.name || "";

    try {
      const res = await apiService.post("/property/lead", {
        type: form.lookingFor ? form.lookingFor.toLowerCase() : "inquiry",
        name: {
          first_name: form.firstName.trim(),
          last_name: form.lastName.trim(),
        },
        mobile: {
          country_code: form.countryCode,
          number: form.phone,
        },
        email: form.email.trim().toLowerCase(),
        
        // Location Data
        country: countryName,
        state: stateName,
        preferred_city: form.city || stateName, // Use City if available
        
        budget: form.budget,
      });

      if (res?.success) {
        toast.success(t("success"));
        setForm({
          firstName: "", lastName: "", email: "", countryCode: "971", phone: "",
          lookingFor: "", budget: "", location_country: null, state: null, city: null
        });
      }
    } catch {
      toast.error(t("genericError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" />

      <section className="relative w-full bg-[var(--color-body)] py-16 overflow-hidden">
        <div className="absolute top-0 left-0 w-full z-0">
          <img src={waveint6} alt="" className="w-full" />
        </div>
        <div className="absolute -bottom-30 left-0 w-full z-0">
          <img src={waveint} alt="" className="w-full" />
        </div>

        <div className="max-w-8xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* LEFT CONTENT */}
          <div className="z-20 flex flex-col gap-[20px]">
            <h1 className="font-['DM_Sans'] font-semibold text-[60px] leading-[48px] tracking-[-0.03em] text-[#020202] max-w-[494px] ml-20">
              {t("heroTitle")}
            </h1>
            <p className="font-['DM_Sans'] font-semibold text-[24px] leading-[33px] text-[#547593] max-w-[482px] ml-20">
              {t("heroSub")}
            </p>
            <img src={image} alt="" className="w-full max-w-[590px] mt-[24px]" />
          </div>

          {/* RIGHT FORM */}
          <div className="z-20">
            <div className="bg-white shadow-[0_0_30px_rgba(92,3,155,0.3)] rounded-3xl p-8 max-w-lg mx-auto border border-purple-100">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{t("formTitle")}</h2>
              <p className="text-gray-700 mb-8">{t("formSub")}</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Name */}
                <div className="grid grid-cols-2 gap-4">
                  <input name="firstName" value={form.firstName} onChange={handleChange} placeholder={t("firstName")} className="w-full px-5 py-4 rounded-xl border border-gray-300" />
                  <input name="lastName" value={form.lastName} onChange={handleChange} placeholder={t("lastName")} className="w-full px-5 py-4 rounded-xl border border-gray-300" />
                </div>

                {/* Email */}
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder={t("email")} className="w-full px-5 py-4 rounded-xl border border-gray-300" />

                {/* Phone with Antd Select */}
                <div className="flex gap-3">
                  <div className="w-[120px] flex-shrink-0">
                    <Select
                        value={form.countryCode}
                        onChange={handleCountryCodeChange}
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) => option.children.props?.children[1]?.props?.children[1]?.toLowerCase().includes(input.toLowerCase()) || option.value.includes(input)}
                        className="w-full h-full custom-select-hero7"
                        dropdownMatchSelectWidth={300}
                    >
                        {phoneCountryOptions.map((item) => (
                        <Option key={item.iso} value={item.code}>
                            <div className="flex items-center">
                            <img src={`https://flagcdn.com/w20/${item.iso.toLowerCase()}.png`} srcSet={`https://flagcdn.com/w40/${item.iso.toLowerCase()}.png 2x`} width="20" alt={item.name} style={{ marginRight: 8, borderRadius: 2 }} />
                            <span>+{item.code}</span>
                            </div>
                        </Option>
                        ))}
                    </Select>
                  </div>
                  <input type="tel" name="phone" value={form.phone} onChange={handlePhoneChange} placeholder={`Phone (${getPhoneConfig(form.countryCode).digits} digits)`} className="flex-1 px-5 py-4 rounded-xl border border-gray-300" />
                </div>

                {/* Country (Dynamic) & Looking For */}
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    placeholder="Select Country"
                    showSearch
                    optionFilterProp="children"
                    onChange={handleLocationCountryChange}
                    filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                    className="w-full custom-select-hero7"
                  >
                    {countriesList.map((country) => (
                      <Option key={country.isoCode} value={country.isoCode}>{country.name}</Option>
                    ))}
                  </Select>

                  <select name="lookingFor" value={form.lookingFor} onChange={handleChange} className="w-full px-5 py-4 rounded-xl border border-gray-300 bg-white">
                    <option value="">{t("lookingFor")}</option>
                    <option value="Buy">Buy</option>
                    <option value="Sell">Sell</option>
                    <option value="Rent">Rent</option>
                  </select>
                </div>

                {/* State & City (Dynamic) */}
                <div className="grid grid-cols-2 gap-4 mb-10">
                    <Select
                        placeholder="State"
                        showSearch
                        optionFilterProp="children"
                        onChange={handleLocationStateChange}
                        disabled={!statesList.length}
                        filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                        className="w-full custom-select-hero7"
                    >
                        {statesList.map((state) => (
                            <Option key={state.isoCode} value={state.isoCode}>{state.name}</Option>
                        ))}
                    </Select>

                    <Select
                        placeholder="City"
                        showSearch
                        optionFilterProp="children"
                        onChange={handleLocationCityChange}
                        disabled={!citiesList.length}
                        filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                        className="w-full custom-select-hero7"
                    >
                        {citiesList.map((city) => (
                            <Option key={city.name} value={city.name}>{city.name}</Option>
                        ))}
                    </Select>
                </div>

                {/* Budget */}
                <input name="budget" value={form.budget} onChange={handleChange} placeholder={t("budget")} className="w-full px-5 py-4 rounded-xl border border-gray-300" />

                <button type="submit" disabled={loading} className="w-full bg-[var(--color-primary)] text-white font-bold py-5 rounded-xl transition hover:opacity-90">
                  {loading ? t("submitting") : t("submit")}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Global CSS for Antd Select to Match Inputs */}
      <style jsx global>{`
        .custom-select-hero7 .ant-select-selector {
          border-radius: 0.75rem !important; /* rounded-xl */
          border-color: #d1d5db !important; /* border-gray-300 */
          height: 100% !important;
          min-height: 58px !important; /* Matches py-4 inputs approx */
          display: flex !important;
          align-items: center !important;
          padding-left: 12px !important;
        }
        .custom-select-hero7 .ant-select-selector:hover {
          border-color: #9ca3af !important; 
        }
        .custom-select-hero7.ant-select-focused .ant-select-selector {
          border-color: #9ca3af !important;
          box-shadow: none !important;
        }
      `}</style>
    </>
  );
}