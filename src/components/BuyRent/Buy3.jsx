import React, { useState, useEffect, useMemo } from "react";
import { X, User, Mail, Phone, Globe, Briefcase, MapPin } from "lucide-react";
import { notification, Select } from "antd"; // Antd Select
import { Country, State, City } from "country-state-city"; // Location Package
import { apiService } from "../../manageApi/utils/custom.apiservice";
import { useTranslation } from "react-i18next";
import bgImage from "../../assets/img/buy3bg.png";
import Bedicon from "../../assets/img/buy/Vector.png";
import Bathicon from "../../assets/img/buy/Bath.png";
import Squareicon from "../../assets/img/buy/Square Meters.png";
import favoriteicon from "../../assets/img/buy/Favorited.png";
import popularicon from "../../assets/img/buy/Group 860.png";

const { Option } = Select;

// 1. Strict Phone Length Rules
const PHONE_LENGTH_RULES = {
  "971": 9, "91": 10, "966": 9, "1": 10, "44": 10, "61": 9,
};

const Property = () => {
  const { t } = useTranslation("buy3");
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [api, contextHolder] = notification.useNotification();

  // 2. Form State (Added location fields)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    country_code: "971", 
    mobile: "",
    occupation: "",
    location_country: null,
    state: null,
    city: null,
    preferred_contact: "whatsapp",
  });

  const [errors, setErrors] = useState({});

  // 3. Location Data States
  const [countriesList] = useState(Country.getAllCountries());
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);

  // 4. Memoized Phone Country Codes
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

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setFetchLoading(true);

        // Correct endpoint (no extra /api/)
        const res = await apiService.get("/property/marketplace");

        console.log("Marketplace API Response:", res);

        if (res.success && res.data && Array.isArray(res.data.properties)) {
          const transformed = res.data.properties.map((item) => ({
            id: item._id,
            price: item.price
              ? `${item.currency || "AED"} ${Number(item.price).toLocaleString()}`
              : "Price on Request",
            period: item.propertyType === "rent" ? "/month" : "",
            name: item.propertyName || "Luxury Property",
            location: item.area && item.city ? `${item.area}, ${item.city}` : "Dubai, UAE",
            beds: item.bedrooms || 0,
            bathrooms: item.bathrooms || 0,
            area: item.builtUpArea
              ? `${item.builtUpArea} ${item.builtUpAreaUnit || "sqft"}`
              : "N/A",
            imgUrl: item.photos?.[0] || item.mainLogo || "https://via.placeholder.com/400x300?text=No+Image",
          }));

          setProperties(transformed);
        } else {
          throw new Error("Invalid API response format");
        }
      } catch (err) {
        console.error("Error fetching properties:", err);
        openNotification("error", "Failed to Load Properties", "Please try again later.");
        setProperties([]);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // --- HANDLERS ---

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCountryCodeChange = (value) => {
    const limit = PHONE_LENGTH_RULES[value] || 15;
    setFormData((prev) => ({ ...prev, country_code: value, mobile: prev.mobile.slice(0, limit) }));
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    const maxLength = PHONE_LENGTH_RULES[formData.country_code] || 15;
    const validatedValue = value.slice(0, maxLength);
    setFormData((prev) => ({ ...prev, mobile: validatedValue }));
    if (errors.mobile) setErrors((prev) => ({ ...prev, mobile: "" }));
  };

  // Location Handlers
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

  const openNotification = (type, title, description) => {
    api[type]({ message: title, description: description, placement: "topRight" });
  };

  // --- VALIDATION & SUBMIT ---

  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    if (!formData.first_name.trim()) { newErrors.first_name = "Required"; isValid = false; }
    if (!formData.last_name.trim()) { newErrors.last_name = "Required"; isValid = false; }
    if (!formData.email.trim()) { newErrors.email = "Required"; isValid = false; }
    else if (!/\S+@\S+\.\S+/.test(formData.email)) { newErrors.email = "Invalid email"; isValid = false; }

    const requiredLength = PHONE_LENGTH_RULES[formData.country_code];
    if (!formData.mobile.trim()) { newErrors.mobile = "Required"; isValid = false; }
    else if (requiredLength && formData.mobile.length !== requiredLength) {
      newErrors.mobile = `Enter ${requiredLength} digits`;
      isValid = false;
    }

    if (!formData.occupation.trim()) { newErrors.occupation = "Required"; isValid = false; }
    if (!formData.location_country) { newErrors.location_country = "Country Required"; isValid = false; }
    if (!formData.state) { newErrors.state = "State Required"; isValid = false; }
    if (citiesList.length > 0 && !formData.city) { newErrors.city = "City Required"; isValid = false; }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    // Resolve Names
    const countryName = Country.getCountryByCode(formData.location_country)?.name || "";
    const stateName = State.getStateByCodeAndCountry(formData.state, formData.location_country)?.name || formData.state;
    const finalLocationString = `${formData.city || stateName}, ${stateName}, ${countryName}`;

    const payload = {
      type: "schedule_visit",
      name: { first_name: formData.first_name.trim(), last_name: formData.last_name.trim() },
      mobile: { country_code: formData.country_code, number: formData.mobile },
      email: formData.email.toLowerCase().trim(),
      occupation: formData.occupation,
      location: finalLocationString,
      city: formData.city, 
      preferred_city: formData.city || stateName,
      preferred_contact: formData.preferred_contact,
    };

    try {
      const res = await apiService.post("/property/lead", payload);
      if (res.success) {
        openNotification("success", "Request Submitted", t("toast.success"));
        setOpenModal(false);
        setFormData({
          first_name: "", last_name: "", email: "", country_code: "971", mobile: "",
          occupation: "", location_country: null, state: null, city: null, preferred_contact: "whatsapp",
        });
        setErrors({});
      }
    } catch (err) {
      openNotification("error", "Submission Failed", err.response?.data?.message || t("toast.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <div
        className="min-h-screen py-10 md:py-16 px-4 sm:px-6 lg:px-12 bg-cover bg-center relative font-dm"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="max-w-7xl mx-auto mb-10 md:mb-14">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h2 className="font-dm font-semibold text-[36px] md:text-[60px] leading-[1.1] tracking-[-0.03em] text-white max-w-[515px] w-full text-left">
              {t("heading.title")}
            </h2>

            <p className="text-white font-medium text-[18px] md:text-[24px] leading-[1.4] max-w-[454px] w-full text-left md:text-right">
              {t("heading.subtitle")}
            </p>
          </div>
        </div>

        {fetchLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#5C039B]"></div>
          </div>
        ) : properties.length === 0 ? (
          <p className="text-center text-white text-xl py-10">
            No properties available at the moment
          </p>
        ) : (
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            {properties.map((deal) => (
              <PropertyCard
                key={deal.id}
                deal={deal}
                onClick={() => setOpenModal(true)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-2xl bg-gradient-to-br from-white via-purple-50 to-violet-50 rounded-3xl shadow-2xl overflow-hidden border border-purple-100 max-h-[95vh] flex flex-col">
            <button
              onClick={() => setOpenModal(false)}
              className="absolute top-4 right-4 z-20 bg-gradient-to-r from-red-500 to-pink-500 text-white w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-lg"
            >
              <X size={20} />
            </button>

            <div className="bg-gradient-to-r from-purple-600 to-violet-600 p-6 md:p-8 text-center shrink-0">
              <h3 className="text-2xl md:text-4xl font-bold text-white mb-2 md:mb-3">
                {t("modal.title")}
              </h3>
              <p className="text-purple-100 text-base md:text-lg font-medium">
                {t("modal.subtitle")}
              </p>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                
                {/* Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="relative">
                    <input name="first_name" value={formData.first_name} onChange={handleChange} placeholder={t("form.firstName")} className={`premium-input pl-12 ${errors.first_name ? 'border-red-500 bg-red-50' : ''}`} />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600"><User size={20} /></div>
                    {errors.first_name && <p className="text-red-500 text-xs mt-1 absolute">{errors.first_name}</p>}
                  </div>
                  <div className="relative">
                    <input name="last_name" value={formData.last_name} onChange={handleChange} placeholder={t("form.lastName")} className={`premium-input pl-12 ${errors.last_name ? 'border-red-500 bg-red-50' : ''}`} />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600"><User size={20} /></div>
                    {errors.last_name && <p className="text-red-500 text-xs mt-1 absolute">{errors.last_name}</p>}
                  </div>
                </div>

                <div className="relative">
                  <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder={t("form.email")} className={`premium-input pl-12 ${errors.email ? 'border-red-500 bg-red-50' : ''}`} />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600"><Mail size={20} /></div>
                  {errors.email && <p className="text-red-500 text-xs mt-1 absolute">{errors.email}</p>}
                </div>

                {/* Phone & Country Code */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative w-full sm:w-32 h-[50px]">
                    <Select
                        value={formData.country_code}
                        onChange={handleCountryCodeChange}
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) => option.children.props?.children[1]?.props?.children[1]?.toLowerCase().includes(input.toLowerCase()) || option.value.includes(input)}
                        className="w-full h-full custom-select-property"
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

                  <div className="relative flex-1">
                    <input name="mobile" type="text" inputMode="numeric" value={formData.mobile} onChange={handlePhoneChange} placeholder={`${t("form.phone")} (${PHONE_LENGTH_RULES[formData.country_code] || 15} digits)`} className={`premium-input pl-12 h-[50px] ${errors.mobile ? 'border-red-500 bg-red-50' : ''}`} />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600"><Phone size={20} /></div>
                    {errors.mobile && <p className="text-red-500 text-xs mt-1 absolute bottom-[-18px]">{errors.mobile}</p>}
                  </div>
                </div>

                {/* Occupation */}
                <div className="relative">
                  <input name="occupation" value={formData.occupation} onChange={handleChange} placeholder={t("form.occupation")} className={`premium-input pl-12 ${errors.occupation ? 'border-red-500 bg-red-50' : ''}`} />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600"><Briefcase size={20} /></div>
                  {errors.occupation && <p className="text-red-500 text-xs mt-1 absolute">{errors.occupation}</p>}
                </div>

                {/* Location Dropdowns */}
                <div className="space-y-4">
                    {/* Country */}
                    <div className="relative">
                        <Select
                            placeholder="Select Country"
                            showSearch
                            optionFilterProp="children"
                            onChange={handleLocationCountryChange}
                            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                            className={`w-full custom-select-property ${errors.location_country ? "border-red-500 rounded-[0.75rem]" : ""}`}
                            dropdownMatchSelectWidth={false}
                        >
                            {countriesList.map((country) => (
                                <Option key={country.isoCode} value={country.isoCode}>{country.name}</Option>
                            ))}
                        </Select>
                        {errors.location_country && <p className="text-red-500 text-xs mt-3 absolute">{errors.location_country}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 md:mt-6 p-3">
                        {/* State */}
                        <div className="relative">
                            <Select
                                placeholder="Select State"
                                showSearch
                                optionFilterProp="children"
                                onChange={handleLocationStateChange}
                                disabled={!statesList.length}
                                filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                                className={`w-full custom-select-property ${errors.state ? "border-red-500 rounded-[0.75rem]" : ""}`}
                            >
                                {statesList.map((state) => (
                                    <Option key={state.isoCode} value={state.isoCode}>{state.name}</Option>
                                ))}
                            </Select>
                            {errors.state && <p className="text-red-500 text-xs mt-2 absolute">{errors.state}</p>}
                        </div>

                        {/* City */}
                        <div className="relative">
                            <Select
                                placeholder="Select City"
                                showSearch
                                optionFilterProp="children"
                                onChange={handleLocationCityChange}
                                disabled={!citiesList.length}
                                filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                                className={`w-full custom-select-property ${errors.city ? "border-red-500 rounded-[0.75rem]" : ""}`}
                            >
                                {citiesList.map((city) => (
                                    <Option key={city.name} value={city.name}>{city.name}</Option>
                                ))}
                            </Select>
                            {errors.city && <p className="text-red-500 text-xs mt-3 absolute">{errors.city}</p>}
                        </div>
                    </div>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white py-4 md:py-5 rounded-xl text-lg font-bold hover:shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2">
                 {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : t("actions.submit")}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for Antd Select */}
      <style jsx global>{`
        .premium-input {
          width: 100%;
          padding: 0.8rem 1rem 0.8rem 3rem;
          border-radius: 0.75rem;
          border: 2px solid #e9d5ff;
          background: white;
          outline: none;
          font-size: 1rem;
          transition: all 0.3s;
        }
        @media (min-width: 768px) {
          .premium-input { padding: 1rem 1.25rem 1rem 3rem; }
        }
        .premium-input:focus {
          border-color: #9333ea;
          box-shadow: 0 0 0 4px rgba(147, 51, 234, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f3e8ff; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #9333ea; border-radius: 4px; }

        /* Antd Select Styles */
        .custom-select-property .ant-select-selector {
          border-radius: 0.75rem !important; 
          border: 2px solid #e9d5ff !important; 
          height: 100% !important;
          min-height: 50px !important; 
          display: flex !important;
          align-items: center !important;
          padding-left: 12px !important;
          box-shadow: none !important;
        }
        .custom-select-property .ant-select-selector:hover {
          border-color: #9333ea !important;
        }
        .custom-select-property.ant-select-focused .ant-select-selector {
          border-color: #9333ea !important;
          box-shadow: 0 0 0 4px rgba(147, 51, 234, 0.1) !important;
        }
      `}</style>
    </>
  );
};

function PropertyCard({ deal, onClick }) {
  return (
    <div className="bg-white rounded-[16px] shadow-[0_10px_30px_rgba(0,0,0,0.12)] overflow-hidden w-full max-w-[396px] mb-6 transition-transform duration-300 hover:scale-[1.02]">
      <div className="relative">
        <img src={deal.imgUrl} alt={deal.name} className="h-[200px] md:h-[230px] w-full object-cover" />
        {/* Always show popular badge on all cards */}
        <img
          src={popularicon}
          alt="Popular"
          className="absolute left-0 bottom-[-16px] w-[100px] md:w-[124.22px] h-auto"
        />
      </div>

      <div className="p-5 md:p-[24px] bg-gradient-to-b from-[#F7F6F9] to-white">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-end gap-[4px]">
            <span className="font-dm font-semibold text-[18px] md:text-[20px] leading-tight text-[#5C039B]">{deal.price}</span>
            <span className="font-dm font-medium text-[13px] md:text-[14px] text-[#6B7280]">{deal.period}</span>
          </div>
          <img src={favoriteicon} alt="Favorite" className="w-[45px] md:w-[52.77px] h-auto cursor-pointer" />
        </div>

        <h3 className="text-[16px] leading-[24px] font-semibold text-[#111827]">{deal.name}</h3>
        <p className="mt-1 text-[14px] leading-[20px] font-medium text-[#6B7280] opacity-90">{deal.location}</p>

        <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-5 text-[12px] md:text-[13px] text-[#374151]">
          <div className="flex items-center gap-2">
            <img src={Bedicon} alt="Beds" className="h-[14px] md:h-[16px]" />
            {deal.beds} Beds
          </div>
          <div className="flex items-center gap-2">
            <img src={Bathicon} alt="Bath" className="h-[14px] md:h-[16px]" />
            {deal.bathrooms} Bath
          </div>
          <div className="flex items-center gap-2">
            <img src={Squareicon} alt="Area" className="h-[14px] md:h-[16px]" />
            {deal.area}
          </div>
        </div>

        <button
          onClick={onClick}
          className="w-full mt-6 h-[44px] md:h-[48px] bg-[#5C039B] text-white rounded-[24px] font-semibold text-[15px] md:text-[16px] transition-all hover:bg-white hover:text-[#6A00D4] border-2 border-transparent hover:border-[#6A00D4]"
        >
          Show Details
        </button>
      </div>
    </div>
  );
}

export default Property;