import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { notification, Select } from 'antd';
import { useTranslation } from "react-i18next";
import { apiService } from "../../manageApi/utils/custom.apiservice";
import { Country, State, City } from "country-state-city";
import {
  X, ArrowRight, Phone, Mail, MessageCircle, User, BedDouble,
  Home, Building2, MapPin, Banknote, FileText
} from "lucide-react";
import { isValidPhoneNumber } from "libphonenumber-js";

const { Option } = Select;

const validatePhone = (countryCode, mobile) => {
  try {
    const fullNumber = `+${countryCode}${mobile}`;
    return isValidPhoneNumber(fullNumber);
  } catch {
    return false;
  }
};

const PHONE_LENGTH_RULES = {
  "971": 9, "91": 10, "7": 10, "1": 10, "44": 10,
};

export default function HeroSection({ openSellModal, setOpenSellModal }) {
  const navigate = useNavigate();
  const { t } = useTranslation("buy1");
  const openModal = openSellModal;
  const setOpenModal = setOpenSellModal;

  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingAccepted, setMarketingAccepted] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    if (openModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [openModal]);

  const countryOptions = useMemo(() => {
    const priorityIsoCodes = ["AE", "IN", "RU", "US", "GB"];
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

  const [sellStates, setSellStates] = useState([]);
  const [sellCities, setSellCities] = useState([]);

  const [sellForm, setSellForm] = useState({
    first_name: "", last_name: "", email: "", country_code: "971", mobile: "",
    listing_type: "", location_country: null, state: null, city: null,
    area: "", project_name: "", bedroom_config: "", price: "", description: "",
    preferred_contact: "call",
  });

  const handleSellChange = (e) => {
    const { name, value } = e.target;
    if (name === "mobile") {
      const numericValue = value.replace(/\D/g, "");
      const limit = PHONE_LENGTH_RULES[sellForm.country_code] || 15;
      setSellForm((prev) => ({ ...prev, [name]: numericValue.slice(0, limit) }));
    } else {
      setSellForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSellCountryChange = (value) => {
    const limit = PHONE_LENGTH_RULES[value] || 15;
    setSellForm((prev) => ({ ...prev, country_code: value, mobile: prev.mobile.slice(0, limit) }));
  };

  const handleSellLocationCountry = (isoCode) => {
    const updatedStates = State.getStatesOfCountry(isoCode);
    setSellStates(updatedStates);
    setSellCities([]);
    setSellForm((prev) => ({ ...prev, location_country: isoCode, state: null, city: null }));
  };

  const handleSellLocationState = (stateCode) => {
    const updatedCities = City.getCitiesOfState(sellForm.location_country, stateCode);
    setSellCities(updatedCities);
    setSellForm((prev) => ({ ...prev, state: stateCode, city: null }));
  };

  const handleSellLocationCity = (cityName) => {
    setSellForm((prev) => ({ ...prev, city: cityName }));
  };

  const openNotification = (type, title, description) => {
    api[type]({ message: title, description: description, placement: 'topRight' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const isPhoneValid = validatePhone(sellForm.country_code, sellForm.mobile);
    if (!isPhoneValid) {
      openNotification("error", "Validation Error", "Please enter a valid phone number for selected country");
      setLoading(false);
      return;
    }

    if (!sellForm.location_country) {
      openNotification("error", "Validation Error", "Please select a country");
      setLoading(false);
      return;
    }
    if (!sellForm.state) {
      openNotification("error", "Validation Error", "Please select a state");
      setLoading(false);
      return;
    }
    if (sellCities.length > 0 && !sellForm.city) {
      openNotification("error", "Validation Error", "Please select a city");
      setLoading(false);
      return;
    }

    const countryName = Country.getCountryByCode(sellForm.location_country)?.name || "";
    const stateName = State.getStateByCodeAndCountry(sellForm.state, sellForm.location_country)?.name || sellForm.state;
    const cityName = sellForm.city || stateName;

    const payload = {
      first_name: sellForm.first_name.trim(),
      last_name: sellForm.last_name.trim(),
      phone_number: sellForm.mobile,
      country_code: `+${sellForm.country_code}`,
      email: sellForm.email.toLowerCase().trim(),
      enquiry_type: "sell",
      preferred_contact: sellForm.preferred_contact,
      message: sellForm.description || undefined,
      requirements: {
        property_type: sellForm.listing_type || undefined,
        location_preferences: [
          {
            area: [cityName, stateName, countryName].filter(Boolean).join(", "),
            priority: 1,
          },
        ],
        bedrooms: sellForm.bedroom_config ? Number(sellForm.bedroom_config) : undefined,
        budget_min: Number(sellForm.price) || undefined,
        additional_notes: [
          sellForm.project_name && `Project: ${sellForm.project_name}`,
          sellForm.area && `Area/Locality: ${sellForm.area}`,
        ]
          .filter(Boolean)
          .join(" | ") || undefined,
      },
    };

    try {
      const response = await apiService.post("/gridlead/website-lead", payload);
      if (response.success) {
        openNotification(
          "success",
          "Request Submitted Successfully",
          t("toast.success", { name: sellForm.first_name })
        );
        setOpenModal(false);
        setSellForm({
          first_name: "", last_name: "", email: "", country_code: "971", mobile: "",
          listing_type: "", location_country: null, state: null, city: null,
          area: "", project_name: "", bedroom_config: "", price: "", description: "",
          preferred_contact: "call",
        });
        setSellStates([]);
        setSellCities([]);
        setTermsAccepted(false);
        setMarketingAccepted(false);
      }
    } catch (err) {
      console.error("Lead submission error:", err);
      openNotification("error", "Submission Failed", t("toast.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}

      {/* ── HERO SECTION ── */}
      <section className="relative w-full overflow-hidden font-dm h-140 bg-[var(--color-body)]">

        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat hero-bg-image">
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
          <h1
            className="mx-auto mb-8 max-w-5xl heading-light flex flex-col items-center gap-2 sm:gap-4 text-center"
            style={{ fontSize: 'clamp(28px, 8vw, 54px)', lineHeight: '1.15' }}
          >
            <span>{t("hero.title.line1")}</span>
            <span>{t("hero.title.line2")}</span>
          </h1>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
            <button
              onClick={() => navigate("/Property#rent")}
              className="px-5 sm:px-10 py-3 sm:py-4 text-sm sm:text-base bg-transparent border-2 border-white text-white font-extrabold rounded-lg shadow-md hover:bg-[#5C039B] hover:border-[#5C039B] hover:scale-105 transition-all"
            >
              {t("hero.buttons.rent")}
            </button>
            <button
              onClick={() => navigate("/Property#rent")}
              className="px-5 sm:px-10 py-3 sm:py-4 text-sm sm:text-base bg-transparent border-2 border-white text-white font-extrabold rounded-lg shadow-md hover:bg-[#5C039B] hover:border-[#5C039B] hover:scale-105 transition-all"
            >
              {t("hero.buttons.find")}
            </button>
            <button
              onClick={() => setOpenModal(true)}
              className="px-5 sm:px-10 py-3 sm:py-4 text-sm sm:text-base bg-transparent border-2 border-white text-white font-extrabold rounded-lg shadow-md hover:bg-[#5C039B] hover:border-[#5C039B] hover:scale-105 transition-all"
            >
              {t("hero.buttons.sell")}
            </button>
          </div>
        </div>

        <div className="clip-shape-left" />
        <div className="clip-shape-right" />
        <style jsx>{`
          .clip-shape-left {
            position: absolute;
            bottom: -1px;
            left: 0;
            width: 30vw;
            max-width: 320px;
            min-width: 120px;
            height: clamp(28px, 3.5vw, 48px);
            background: #f2ebf7;
            z-index: 3;
            clip-path: polygon(0 0, 55% 0, 100% 100%, 0% 100%);
          }
          .clip-shape-right {
            position: absolute;
            bottom: -1px;
            right: 0;
            width: 30vw;
            max-width: 320px;
            min-width: 120px;
            height: clamp(28px, 3.5vw, 48px);
            background: #f2ebf7;
            z-index: 3;
            clip-path: polygon(47% 0, 100% 0, 100% 100%, 0% 100%);
            box-shadow: 0 -3px 0 white;
          }
        `}</style>
      </section>

      {/* ── MODAL ── */}
      {openModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-gradient-to-br from-white via-blue-50 to-purple-50 w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl relative max-h-[95vh] overflow-hidden flex flex-col border border-white/20">

            {/* Close button */}
            <button
              onClick={() => setOpenModal(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg z-20"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="p-5 sm:p-8 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 border-b border-white/10 flex-shrink-0">
              <div className="flex flex-col items-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent mb-2 text-center">
                  {t("modal.sell.title")}
                </h2>
                <p className="text-gray-600 text-center text-sm sm:text-base md:text-lg font-medium max-w-2xl px-2">
                  {t("modal.sell.desc")}
                </p>
              </div>
            </div>

            {/* Scrollable form body */}
            <div className="p-4 sm:p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">

                {/* Name row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="relative">
                    <input
                      name="first_name"
                      value={sellForm.first_name}
                      onChange={handleSellChange}
                      placeholder={`${t("form.firstName")} *`}
                      required
                      className="premium-input pl-12"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600"><User size={18} /></div>
                  </div>
                  <div className="relative">
                    <input
                      name="last_name"
                      value={sellForm.last_name}
                      onChange={handleSellChange}
                      placeholder={`${t("form.lastName")} *`}
                      required
                      className="premium-input pl-12"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600"><User size={18} /></div>
                  </div>
                </div>

                {/* Email */}
                <div className="relative">
                  <input
                    name="email"
                    type="email"
                    value={sellForm.email}
                    onChange={handleSellChange}
                    placeholder={t("form.email")}
                    required
                    className="premium-input pl-12"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600"><Mail size={18} /></div>
                </div>

                {/* Phone */}
                <div className="flex flex-col xs:flex-row gap-3 items-stretch xs:items-center">
                  <div className="w-full xs:w-[130px] sm:w-[140px] flex-shrink-0" style={{ height: 50 }}>
                    <Select
                      value={sellForm.country_code}
                      onChange={handleSellCountryChange}
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.children.props?.children[1]?.props?.children[1]?.toLowerCase().includes(input.toLowerCase()) ||
                        option.value.includes(input)
                      }
                      className="w-full h-full custom-select-hero"
                      dropdownMatchSelectWidth={280}
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
                  <div className="relative flex-1">
                    <input
                      name="mobile"
                      type="text"
                      inputMode="numeric"
                      value={sellForm.mobile}
                      onChange={handleSellChange}
                      placeholder={`${t("form.phone")} *`}
                      required
                      className="premium-input pl-12"
                      style={{ height: 50 }}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600"><Phone size={18} /></div>
                  </div>
                </div>

                {/* ── SELL FIELDS ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

                  {/* Listing type */}
                  <div className="relative">
                    <input
                      name="listing_type"
                      value={sellForm.listing_type}
                      onChange={handleSellChange}
                      placeholder={t("form.sell.listing_type")}
                      className="premium-input pl-12"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600"><Home size={18} /></div>
                  </div>

                  {/* Country */}
                  <Select
                    placeholder="Select Country"
                    showSearch
                    optionFilterProp="children"
                    onChange={handleSellLocationCountry}
                    filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                    className="w-full custom-select-hero"
                    style={{ height: 52 }}
                    dropdownMatchSelectWidth={false}
                  >
                    {countryOptions.map((country) => (
                      <Option key={country.iso} value={country.iso}>{country.name}</Option>
                    ))}
                  </Select>

                  {/* State */}
                  <Select
                    placeholder="Select State"
                    showSearch
                    optionFilterProp="children"
                    onChange={handleSellLocationState}
                    disabled={!sellStates.length}
                    filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                    className="w-full custom-select-hero"
                    style={{ height: 52 }}
                  >
                    {sellStates.map((state) => (
                      <Option key={state.isoCode} value={state.isoCode}>{state.name}</Option>
                    ))}
                  </Select>

                  {/* City */}
                  <Select
                    placeholder={t("form.sell.city")}
                    showSearch
                    optionFilterProp="children"
                    onChange={handleSellLocationCity}
                    disabled={!sellCities.length}
                    filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                    className="w-full custom-select-hero"
                    style={{ height: 52 }}
                  >
                    {sellCities.map((city) => (
                      <Option key={city.name} value={city.name}>{city.name}</Option>
                    ))}
                  </Select>

                  {/* Area */}
                  <div className="relative">
                    <input
                      name="area"
                      value={sellForm.area}
                      onChange={handleSellChange}
                      placeholder={t("form.sell.area")}
                      className="premium-input pl-12"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600"><MapPin size={18} /></div>
                  </div>

                  {/* Project name */}
                  <div className="relative">
                    <input
                      name="project_name"
                      value={sellForm.project_name}
                      onChange={handleSellChange}
                      placeholder={t("form.sell.project_name")}
                      className="premium-input pl-12"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600"><Building2 size={18} /></div>
                  </div>

                  {/* Bedroom config */}
                  <div className="relative">
                    <input
                      name="bedroom_config"
                      value={sellForm.bedroom_config}
                      onChange={handleSellChange}
                      placeholder={t("form.sell.bedroom_config")}
                      className="premium-input pl-12"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600"><BedDouble size={18} /></div>
                  </div>

                  {/* Price */}
                  <div className="relative">
                    <input
                      type="number"
                      name="price"
                      value={sellForm.price}
                      onChange={handleSellChange}
                      placeholder={t("form.sell.price")}
                      className="premium-input pl-12"
                      onWheel={(e) => e.target.blur()}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600"><Banknote size={18} /></div>
                  </div>
                </div>

                {/* Description */}
                <div className="relative">
                  <textarea
                    name="description"
                    value={sellForm.description}
                    onChange={handleSellChange}
                    placeholder={t("form.sell.description")}
                    rows={4}
                    className="premium-input pl-12 pt-4 resize-none"
                  />
                  <div className="absolute left-4 top-5 text-blue-600"><FileText size={18} /></div>
                </div>

                {/* Preferred contact */}
                <div>
                  <p className="text-gray-700 font-semibold mb-3 text-base sm:text-lg">{t("form.preferredContactTitle")}</p>
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    {[
                      { value: "call",     icon: <Phone size={16} />,         label: t("form.contact.call")     },
                      { value: "whatsapp", icon: <MessageCircle size={16} />, label: t("form.contact.whatsapp") },
                      { value: "email",    icon: <Mail size={16} />,          label: t("form.contact.email")    },
                    ].map(({ value, icon, label }) => (
                      <label key={value} className="relative cursor-pointer">
                        <input
                          type="radio"
                          name="preferred_contact"
                          value={value}
                          checked={sellForm.preferred_contact === value}
                          onChange={handleSellChange}
                          className="sr-only peer"
                        />
                        <div className="p-2 sm:p-4 rounded-xl border-2 border-gray-200 bg-white transition-all duration-300 hover:border-blue-400 peer-checked:border-blue-600 peer-checked:bg-gradient-to-r peer-checked:from-blue-50 peer-checked:to-purple-50 peer-checked:shadow-lg">
                          <div className="flex flex-col items-center gap-1 sm:gap-2">
                            <div className={`p-1.5 sm:p-2 rounded-full ${sellForm.preferred_contact === value ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}>
                              {icon}
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-center leading-tight">{label}</span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3 pt-2">
                  <label className="flex items-start gap-3 text-gray-700 text-xs sm:text-sm p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-0.5 w-4 h-4 flex-shrink-0 cursor-pointer"
                      checked={marketingAccepted}
                      onChange={(e) => setMarketingAccepted(e.target.checked)}
                    />
                    <span>{t("checkbox.marketing")}</span>
                  </label>
                  <label className="flex items-start gap-3 text-gray-700 text-xs sm:text-sm p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      className="mt-0.5 w-4 h-4 flex-shrink-0 cursor-pointer"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                    />
                    <span>{t("checkbox.terms")}</span>
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || !termsAccepted || !marketingAccepted}
                  className="group w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 sm:py-5 rounded-xl text-base sm:text-xl font-bold hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      {t("form.processing")}
                    </>
                  ) : (
                    <>
                      {t("form.submit.sell")}
                      <ArrowRight className="group-hover:translate-x-2 transition-transform" size={18} />
                    </>
                  )}
                </button>

              </form>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .hero-bg-image {
          background-image: url("https://xotostaging.s3.me-central-1.amazonaws.com/properties/1770010905007-buy.jpg");
        }

        .clip-shape-left {
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 30vw;
          max-width: 320px;
          min-width: 120px;
          height: clamp(28px, 3.5vw, 48px);
          background: var(--color-body);
          z-index: 3;
          clip-path: polygon(0 0, 55% 0, 100% 100%, 0% 100%);
        }
        .clip-shape-right {
          position: absolute;
          bottom: -1px;
          right: 0;
          width: 30vw;
          max-width: 320px;
          min-width: 120px;
          height: clamp(28px, 3.5vw, 48px);
          background: var(--color-body);
          z-index: 3;
          clip-path: polygon(47% 0, 100% 0, 100% 100%, 0% 100%);
          box-shadow: 0 -3px 0 white;
        }

        .premium-input {
          width: 100%;
          padding: 0.875rem 1.25rem 0.875rem 3rem;
          border-radius: 0.75rem;
          border: 2px solid #e2e8f0;
          background: white;
          outline: none;
          font-size: 0.9375rem;
          transition: all 0.3s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .premium-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59,130,246,0.1);
          transform: translateY(-1px);
        }
        .premium-input::placeholder { color: #94a3b8; }

        @media (min-width: 360px) {
          .xs\\:flex-row { flex-direction: row !important; }
          .xs\\:w-\\[130px\\] { width: 130px !important; }
          .xs\\:items-center { align-items: center !important; }
        }

        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: linear-gradient(to bottom,#3b82f6,#8b5cf6); border-radius: 4px; }

        .custom-select-hero .ant-select-selector {
          border-radius: 0.75rem !important;
          border: 2px solid #e2e8f0 !important;
          height: 100% !important;
          min-height: 50px !important;
          display: flex !important;
          align-items: center !important;
          padding-left: 8px !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05) !important;
        }
        .custom-select-hero .ant-select-selector:hover { border-color: #3b82f6 !important; }
        .custom-select-hero.ant-select-focused .ant-select-selector {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 4px rgba(59,130,246,0.1) !important;
        }

        @media (max-width: 480px) {
          .premium-input { font-size: 0.875rem; }
        }
      `}</style>
    </>
  );
}