import React, { useState, useEffect, useMemo } from "react";
import {
  X, User, Mail, Phone, Globe, Briefcase, MapPin,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import { notification, Select } from "antd"; // Antd Select
import { Country, State, City } from "country-state-city"; // Location Package
import { apiService } from "../../manageApi/utils/custom.apiservice";
import {
  parsePhoneNumberFromString,
  validatePhoneNumberLength,
} from "libphonenumber-js";

import { useTranslation } from "react-i18next";
import "swiper/css";
import "swiper/css/navigation";

// Assets
import waveint4 from "../../assets/img/wave/waveint.png";
import bedicon from "../../assets/img/buy/icon-bed.png";
import tubicon from "../../assets/img/buy/icon-tub.png";
import layouticon from "../../assets/img/buy/icon-layout.png";
import favroiteicon from "../../assets/img/buy/Frame 1618873262.png";

const { Option } = Select;

// 1. Strict Phone Length Rules
const PHONE_LENGTH_RULES = {
  "971": 9, "91": 10, "966": 9, "1": 10, "44": 10, "61": 9,
};

const validatePhone = (countryCode, mobile) => {
  if (!mobile) return "Mobile is required";

  const fullNumber = `+${countryCode}${mobile}`;
  const phoneNumber = parsePhoneNumberFromString(fullNumber);

  if (!phoneNumber) {
    return "Invalid mobile number";
  }

  // Length validation (proper way)
  const lengthError = validatePhoneNumberLength(
    phoneNumber.nationalNumber,
    phoneNumber.country
  );

  if (lengthError === "TOO_SHORT") return "Number is too short";
  if (lengthError === "TOO_LONG") return "Number is too long";

  // Structural validation
  if (!phoneNumber.isValid()) {
    return "Invalid mobile number for selected country";
  }

  // Block landlines
  if (phoneNumber.getType() === "FIXED_LINE") {
    return "Landline numbers are not allowed";
  }

  // UAE-specific rule (real one)
  if (countryCode === "971" && !/^(50|52|54|55|56|58)/.test(mobile)) {
    return "Invalid UAE mobile prefix";
  }

  return ""; // ✅ valid
};


const OurProperty = () => {
  const { t } = useTranslation("buy5");
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [api, contextHolder] = notification.useNotification();
  const [selectedProperty, setSelectedProperty] = useState(null);

  // 2. Form State (Added location fields)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    country_code: "971", 
    mobile: "",
    occupation: "",
    // Location Fields
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

  // Fetch properties
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setFetchLoading(true);
const res = await apiService.get("/property/get-all-properties", {
  page: 1,
  limit: 10,
  isFeatured: false
});

if (res && Array.isArray(res.data)) {

  const list = res.data;

  const limited = list.slice(0, 3); // ✅ only 3

  const transformedProperties = limited.map((item) => ({
    id: item._id,
    image: item.photos?.[0] || item.mainLogo || "https://via.placeholder.com/400x300?text=No+Image",
    title: item.propertyName || "Unnamed Property",
    price: item.price
      ? `${item.currency || "AED"} ${Number(item.price).toLocaleString()}`
      : "Price on Request",
    location: item.area && item.city ? `${item.area}, ${item.city}` : "Dubai, UAE",
    bedrooms: item.bedrooms || 0,
    bathrooms: item.bathrooms || 0,
    area: item.builtUpArea
      ? `${item.builtUpArea} ${item.builtUpAreaUnit || "sqft"}`
      : "N/A",
    tag: item.propertyType === "rent" ? "Rent" : "Sell",
    liked: false,
  }));

  setProperties(transformedProperties);
}
      } catch (err) {
        console.error("❌ Error fetching marketplace properties:", err);
        openNotification("error", "Failed to Load Properties", "Please try again later.");
      } finally {
        setFetchLoading(false);
      }
    };
    fetchProperties();
  }, []);


useEffect(() => {
  if (openModal) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }

  return () => {
    document.body.style.overflow = "auto";
  };
}, [openModal]);


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
    const phoneObj = parsePhoneNumberFromString(
  `+${formData.country_code}${formData.mobile}`
);

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

  const phoneError = validatePhone(formData.country_code, formData.mobile);
  if (phoneError) { newErrors.mobile = phoneError; isValid = false; }

  setErrors(newErrors);
  return isValid;
};

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;
  setLoading(true);

  const payload = {
    enquiry_type: "sell",
    property_id: selectedProperty?.id,
    first_name: formData.first_name.trim(),
    last_name: formData.last_name.trim(),
    phone_number: formData.mobile,
    country_code: `+${formData.country_code}`,
    email: formData.email.toLowerCase().trim(),
  };

  try {
    const res = await apiService.post("/gridlead/website-lead", payload);
    if (res.success) {
      openNotification("success", "Request Submitted", t("toast.success"));
      setOpenModal(false);
      setFormData({
        first_name: "", last_name: "", email: "",
        country_code: "971", mobile: "",
        occupation: "", location_country: null, state: null, city: null,
        preferred_contact: "whatsapp",
      });
      setErrors({});
      setSelectedProperty(null);
    }
  } catch (err) {
    openNotification("error", "Submission Failed", err.response?.data?.message || t("toast.error"));
  } finally {
    setLoading(false);
  }
};

// ── OurProperty se PEHLE paste karo ──────────────────────────────────────────

const FALLBACK_IMAGE = "https://via.placeholder.com/400x300?text=No+Image";

function PropertyCard({ property, onShowDetails }) {
  const [isFavourited, setIsFavourited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  // localStorage se check karo on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const saved = JSON.parse(localStorage.getItem("customer_favourites") || "[]");
    if (saved.includes(property.id)) setIsFavourited(true);
  }, [property.id]);

  const handleFavouriteClick = async (e) => {
    e.stopPropagation();
    if (!localStorage.getItem("token")) { window.location.href = "/user/login"; return; }
    if (favLoading) return;
    setFavLoading(true);
    try {
      const res = await apiService.post("/properties/favourites/toggle", { property_id: property.id });
      if (res.success) {
        setIsFavourited(res.isFavourited);
        const saved = JSON.parse(localStorage.getItem("customer_favourites") || "[]");
        const updated = res.isFavourited
          ? [...new Set([...saved, property.id])]
          : saved.filter((id) => id !== property.id);
        localStorage.setItem("customer_favourites", JSON.stringify(updated));
      }
    } catch (err) { console.error("Favourite toggle failed:", err); }
    finally { setFavLoading(false); }
  };

  return (
    <div className="w-full max-w-[393px] mx-auto h-[519px] bg-white rounded-[24px] shadow-[0px_20px_40px_rgba(0,0,0,0.12)] overflow-hidden relative transition-transform duration-300 hover:scale-[1.02]">
      <div className="h-[240px] relative">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover"
          onError={(e) => (e.target.src = FALLBACK_IMAGE)}
        />
        <span className={`absolute top-4 left-4 text-xs font-medium px-3 py-1 rounded-md ${property.tag === "Sell" ? "bg-[#E8F0FF] text-[#2563EB]" : "bg-[#E9FFF3] text-[#16A34A]"}`}>
          {property.tag}
        </span>

        {/* ── Heart button — fav API wala ── */}
        <button
          onClick={handleFavouriteClick}
          disabled={favLoading}
          className="absolute top-4 right-4 w-9 h-9 rounded-md bg-white flex items-center justify-center shadow-md hover:scale-110 transition-transform duration-200 active:scale-95"
          style={{ border: "none", cursor: "pointer" }}
        >
          {favLoading ? (
            <div className="w-4 h-4 border-2 border-[#5C039B] border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg
              width="16" height="16" viewBox="0 0 24 24"
              fill={isFavourited ? "#5C039B" : "none"}
              stroke="#5C039B" strokeWidth="2"
              style={{ transition: "fill 0.2s" }}
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          )}
        </button>
      </div>

      <div className="p-6">
        <h3 className="font-medium text-[16px] leading-[24px] text-[rgba(0,0,0,0.6)] font-dm">
          {property.title}
        </h3>
        <div className="flex items-start justify-between">
          <p className="text-[20px] leading-[28px] font-bold text-[#0F172A] font-dm">{property.price}</p>
          <span className="px-3 py-[2px] text-[12px] leading-[18px] rounded-full bg-[#E8F0FF] text-[#2563EB] mt-[2px] font-dm truncate max-w-[120px]">
            {property.location}
          </span>
        </div>
        <div className="mt-6 flex justify-between">
          <div className="w-1/3 text-center">
            <div className="flex items-center justify-center gap-2">
              <img src={bedicon} alt="bed" className="w-5 h-5" />
              <span className="text-[16px] font-medium text-[#0F172A] font-dm">{property.bedrooms}</span>
            </div>
            <span className="mt-1 block text-[14px] md:text-[16px] leading-[18px] text-[rgba(0,0,0,0.6)] font-dm">Bedrooms</span>
          </div>
          <div className="w-1/3 text-center">
            <div className="flex items-center justify-center gap-2">
              <img src={tubicon} alt="bath" className="w-5 h-5" />
              <span className="text-[16px] font-medium text-[#0F172A] font-dm">{property.bathrooms}</span>
            </div>
            <span className="mt-1 block text-[14px] md:text-[16px] leading-[18px] text-[rgba(0,0,0,0.6)] font-dm">Bathroom</span>
          </div>
          <div className="w-1/3 text-center">
            <div className="flex items-center justify-center gap-2">
              <img src={layouticon} alt="area" className="w-5 h-5" />
              <span className="text-[16px] font-medium text-[#0F172A] font-dm">{property.area}</span>
            </div>
            <span className="mt-1 block text-[14px] md:text-[16px] leading-[18px] text-[rgba(0,0,0,0.6)] font-dm">Living Area</span>
          </div>
        </div>
        <button
          onClick={onShowDetails}
          className="w-full mt-8 h-[48px] rounded-lg bg-[#5C039B] text-white text-[16px] font-medium transition-transform hover:scale-[1.02] active:scale-95"
        >
          Show Details
        </button>
      </div>
    </div>
  );
}

  return (
    <>
      {contextHolder}
      <section className="relative pt-10 pb-20 md:pb-40 bg-[var(--color-body)] overflow-hidden z-20 font-dm">
        <img 
          src={waveint4} 
          alt="" 
          className="absolute -bottom-[150px] md:-bottom-[350px] left-0 w-full object-cover pointer-events-none" 
        />
        <div className="max-w-7xl mx-auto px-5">
          <h2 className="text-center card-heading-1 mb-10 md:mb-16 text-3xl md:text-5xl">
            {t("heading.title")}
          </h2>

          {fetchLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#5C039B]"></div>
            </div>
          ) : properties.length === 0 ? (
            <p className="text-center text-gray-500 py-10 text-xl">
              No properties available at the moment.
            </p>
          ) : (
            <>
              {/* Mobile Swiper */}
              <div className="block md:hidden">
                <Swiper
                  modules={[Navigation, Autoplay]}
                  slidesPerView={1}
                  spaceBetween={20}
                  autoplay={{ delay: 3500 }}
                  loop
                >
                  {properties.map((p) => (
  <SwiperSlide key={p.id}>
    <PropertyCard
      property={p}
      onShowDetails={() => { setSelectedProperty(p); setOpenModal(true); }}
    />
  </SwiperSlide>
))}
                </Swiper>
              </div>

              {/* Desktop Grid */}
              <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10 justify-items-center">
               {properties.map((p) => (
  <PropertyCard
    key={p.id}
    property={p}
    onShowDetails={() => { setSelectedProperty(p); setOpenModal(true); }}
  />
))}
              </div>
            </>
          )}

          <div className="flex justify-center mt-12 md:mt-16 relative z-20">
            <button
              onClick={() => navigate("/properties")}
              className="bg-[#5C039B] text-white px-8 md:px-10 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all hover:bg-[#4b0281]"
            >
              {t("actions.viewMore")}
            </button>
          </div>
        </div>
      </section>

      {/* MODAL */}
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-2xl bg-gradient-to-br from-white via-purple-50 to-violet-50 rounded-3xl shadow-2xl overflow-hidden border border-purple-100 max-h-[90vh] flex flex-col">
            <button
              onClick={() => setOpenModal(false)}
              className="absolute top-4 right-4 z-30 bg-red-500 text-white w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-lg"
            >
              <X size={20} />
            </button>
            <div className="bg-gradient-to-r from-purple-600 to-violet-600 p-6 md:p-8 text-center shrink-0">
              <h3 className="text-2xl md:text-3xl font-bold text-white">{t("modal.title")}</h3>
              <p className="text-purple-100 mt-2">{t("modal.subtitle")}</p>
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
                        className="w-full h-full custom-select-ourproperty"
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

                {/* <div className="relative">
                  <input name="occupation" value={formData.occupation} onChange={handleChange} placeholder={t("form.occupation")} className={`premium-input pl-12 ${errors.occupation ? 'border-red-500 bg-red-50' : ''}`} />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600"><Briefcase size={20} /></div>
                  {errors.occupation && <p className="text-red-500 text-xs mt-1 absolute">{errors.occupation}</p>}
                </div> */}

                {/* Location Dropdowns */}
                {/* <div className="space-y-4">
                    <div className="relative">
                        <Select
                            placeholder="Select Country"
                            showSearch
                            optionFilterProp="children"
                            onChange={handleLocationCountryChange}
                            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                            className={`w-full custom-select-ourproperty ${errors.location_country ? "border-red-500 rounded-[0.75rem]" : ""}`}
                            dropdownMatchSelectWidth={false}
                        >
                            {countriesList.map((country) => (
                                <Option key={country.isoCode} value={country.isoCode}>{country.name}</Option>
                            ))}
                        </Select>
                        {errors.location_country && <p className="text-red-500 text-xs mt-3 absolute">{errors.location_country}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                        <div className="relative">
                            <Select
                                placeholder="Select State"
                                showSearch
                                optionFilterProp="children"
                                onChange={handleLocationStateChange}
                                disabled={!statesList.length}
                                filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                                className={`w-full custom-select-ourproperty ${errors.state ? "border-red-500 rounded-[0.75rem]" : ""}`}
                            >
                                {statesList.map((state) => (
                                    <Option key={state.isoCode} value={state.isoCode}>{state.name}</Option>
                                ))}
                            </Select>
                            {errors.state && <p className="text-red-500 text-xs mt-3 absolute">{errors.state}</p>}
                        </div>

                        <div className="relative">
                            <Select
                                placeholder="Select City"
                                showSearch
                                optionFilterProp="children"
                                onChange={handleLocationCityChange}
                                disabled={!citiesList.length}
                                filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                                className={`w-full custom-select-ourproperty ${errors.city ? "border-red-500 rounded-[0.75rem]" : ""}`}
                            >
                                {citiesList.map((city) => (
                                    <Option key={city.name} value={city.name}>{city.name}</Option>
                                ))}
                            </Select>
                            {errors.city && <p className="text-red-500 text-xs mt-3 absolute">{errors.city}</p>}
                        </div>
                    </div>
                </div> */}

                <button type="submit" disabled={loading} className="w-full bg-[#5C039B] text-white py-4 md:py-5 rounded-xl text-lg font-bold hover:bg-[#4b0281] hover:scale-[1.01] transition-all flex items-center justify-center gap-2 shadow-lg">
                  {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : t("actions.submit")}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS */}
      <style jsx global>{`
        .premium-input {
          width: 100%;
          padding: 0.8rem 1rem 0.8rem 3rem;
          border-radius: 0.75rem;
          border: 1px solid #d1d5db;
          background: white;
          outline: none;
          font-size: 1rem;
          transition: all 0.3s;
        }
        @media (min-width: 768px) {
          .premium-input { padding: 1rem 1.25rem 1rem 3rem; }
        }
        .premium-input:focus {
          border-color: #5C039B;
          box-shadow: 0 0 0 4px rgba(92, 3, 155, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f3e8ff; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #5C039B; border-radius: 4px; }

        /* Antd Select Styles */
        .custom-select-ourproperty .ant-select-selector {
          border-radius: 0.75rem !important; 
          border: 1px solid #d1d5db !important; 
          height: 100% !important;
          min-height: 50px !important; 
          display: flex !important;
          align-items: center !important;
          padding-left: 12px !important;
          box-shadow: none !important;
        }
        .custom-select-ourproperty .ant-select-selector:hover {
          border-color: #5C039B !important;
        }
        .custom-select-ourproperty.ant-select-focused .ant-select-selector {
          border-color: #5C039B !important;
          box-shadow: 0 0 0 4px rgba(92, 3, 155, 0.1) !important;
        }
        .font-dm { font-family: 'DM Sans', sans-serif; }
      `}</style>
    </>
  );
};

export default OurProperty;