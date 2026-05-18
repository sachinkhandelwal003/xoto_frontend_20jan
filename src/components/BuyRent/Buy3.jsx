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
import waveint4 from "../../assets/img/wave/wavebuy.png";
import bedicon from "../../assets/img/buy/icon-bed.png";
import tubicon from "../../assets/img/buy/icon-tub.png";
import layouticon from "../../assets/img/buy/icon-layout.png";
import favroiteicon from "../../assets/img/buy/Frame 1618873262.png";

import {
  parsePhoneNumberFromString,
  validatePhoneNumberLength,
} from "libphonenumber-js";


const { Option } = Select;
const HOT_PROPERTIES_LIMIT = 6;
const HOT_PROPERTIES_CACHE_KEY = "xoto_hot_properties";

const readCachedHotProperties = () => {
  try {
    const cached = localStorage.getItem(HOT_PROPERTIES_CACHE_KEY);
    const parsed = cached ? JSON.parse(cached) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const extractProperties = (res) => {
  const candidates = [
    res?.data,
    res?.data?.data,
    res?.data?.properties,
    res?.properties,
  ];

  return candidates.find(Array.isArray) || [];
};

const transformProperty = (item) => ({
  id: item._id || item.id,
  imgUrl: item.photos?.architecture?.[0] || item.photos?.interior?.[0] || item.photos?.other?.[0] || item.mainLogo || "https://via.placeholder.com/400x300?text=No+Image",
  title: item.propertyName || "Unnamed Property",
  price: item.price ? `${item.currency || "AED"} ${Number(item.price).toLocaleString()}` : "Price on Request",
  location: item.area && item.city ? `${item.area}, ${item.city}` : "Dubai, UAE",
  bedrooms: item.bedrooms || 0,
  bathrooms: item.bathrooms || 0,
  bedroomType: item.bedroomType || "",   // ✅ yeh add karo
  area: item.builtUpArea ? `${item.builtUpArea} ${item.builtUpAreaUnit || "sqft"}` : "N/A",
  tag: item.propertySubType || item.transactionType || "Sell",
  liked: false,
});

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


const Property = () => {
  const { t } = useTranslation("buy3");
const [openModal, setOpenModal] = useState(false);
const [loading, setLoading] = useState(false);
const [selectedProperty, setSelectedProperty] = useState(null);
  const [properties, setProperties] = useState(() => readCachedHotProperties());
  const [fetchLoading, setFetchLoading] = useState(() => readCachedHotProperties().length === 0);
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
  if (openModal) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }

  return () => {
    document.body.style.overflow = "auto";
  };
}, [openModal]);

useEffect(() => {
  const fetchProperties = async () => {
    try {
      if (properties.length === 0) setFetchLoading(true);
      const res = await apiService.get("/properties/hot", { limit: HOT_PROPERTIES_LIMIT });
      const list = extractProperties(res).slice(0, HOT_PROPERTIES_LIMIT);
      const transformedProperties = list.map(transformProperty);

      setProperties(transformedProperties);
      localStorage.setItem(HOT_PROPERTIES_CACHE_KEY, JSON.stringify(transformedProperties));
    } catch (err) {
      console.error("Error fetching hot properties:", err);
      openNotification("error", "Failed to Load Properties", "Please try again later.");
      if (properties.length === 0) setProperties([]);
    } finally {
      setFetchLoading(false);
    }
  };

  fetchProperties();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  // ✅ phoneObj wali line bilkul hata do — zaroorat nahi yahan
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
const phoneError = validatePhone(
  formData.country_code,
  formData.mobile
);

if (phoneError) {
  newErrors.mobile = phoneError;
  isValid = false;
}


    // if (!formData.occupation.trim()) { newErrors.occupation = "Required"; isValid = false; }
    // if (!formData.location_country) { newErrors.location_country = "Country Required"; isValid = false; }
    // if (!formData.state) { newErrors.state = "State Required"; isValid = false; }
    // if (citiesList.length > 0 && !formData.city) { newErrors.city = "City Required"; isValid = false; }

    setErrors(newErrors);
    return isValid;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;
    if (!selectedProperty) {
    openNotification("error", "No Property Selected", "Please select a property first");
    return;
  }

  setLoading(true);

  // ✅ phoneObj yahan define karo
  const phoneObj = parsePhoneNumberFromString(
    `+${formData.country_code}${formData.mobile}`
  );

  const countryName = Country.getCountryByCode(formData.location_country)?.name || "";
  const stateName = State.getStateByCodeAndCountry(formData.state, formData.location_country)?.name || formData.state;
  const finalLocationString = `${formData.city || stateName}, ${stateName}, ${countryName}`;

const payload = {
  enquiry_type: "hot_property",
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
      <div id="buy3"
        className="min-h-screen bg-[var(--color-body)]  py-10 md:py-26 px-4 sm:px-6 lg:px-12 bg-cover bg-center relative overflow-hidden font-dm "
        // style={{ backgroundImage: `url(${bgImage})` }} 
      >
          <div className="absolute -bottom-10 sm:-bottom-20 lg:-bottom-38 left-0 w-full z-0 pointer-events-none select-none ">
        <img src={waveint4} alt="Decorative wave" className="w-full object-cover" />
      </div>
        <div className="max-w-7xl mx-auto mb-10 md:mb-14">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h2 className="font-dm font-semibold text-[36px] md:text-[60px] leading-[40px] md:leading-[55px] tracking-[-0.03em] text-[#020202] max-w-[515px] w-full text-left">
  {t("heading.title")}
</h2>

            <p className=" text-[#020202] font-medium text-[20px] md:text-[24px] leading-[30px] md:leading-[33px] max-w-[454px] w-full text-left md:text-left font-[DM_Sans]">
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
    onClick={() => {
      setSelectedProperty(deal);
      setOpenModal(true);
    }}
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
                {/* <div className="relative">
                  <input name="occupation" value={formData.occupation} onChange={handleChange} placeholder={t("form.occupation")} className={`premium-input pl-12 ${errors.occupation ? 'border-red-500 bg-red-50' : ''}`} />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600"><Briefcase size={20} /></div>
                  {errors.occupation && <p className="text-red-500 text-xs mt-1 absolute">{errors.occupation}</p>}
                </div> */}

                {/* Location Dropdowns */}
                <div className="space-y-4">
                    {/* Country */}
                    {/* <div className="relative">
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
                    </div> */}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 md:mt-6 p-3">
                        {/* State */}
                        {/* <div className="relative">
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
                        </div> */}

                        {/* City */}
                        {/* <div className="relative">
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
                        </div> */}
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
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [isFavourited, setIsFavourited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  // Check if already favourited on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const savedFavs = JSON.parse(localStorage.getItem("customer_favourites") || "[]");
    if (savedFavs.includes(deal.id)) {
      setIsFavourited(true);
    }
  }, [deal.id]);

  // Scroll lock — image modal
  useEffect(() => {
    if (imageModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [imageModalOpen]);

  // ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && imageModalOpen) setImageModalOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [imageModalOpen]);

  // ── Heart click handler ──────────────────────────────────────────────────
  const handleFavouriteClick = async (e) => {
    e.stopPropagation(); // card click se alag rakho

    const token = localStorage.getItem("token");

    // Login nahi hai → redirect
    if (!token) {
      window.location.href = "/user/login"; // apna login route daalo
      return;
    }

    if (favLoading) return;
    setFavLoading(true);

    try {
 const res = await apiService.post("/properties/favourites/toggle", {
  property_id: deal.id,
});

      if (res.success) {
        const newState = res.isFavourited;
        setIsFavourited(newState);

        // localStorage mein bhi sync karo
        const savedFavs = JSON.parse(localStorage.getItem("customer_favourites") || "[]");
        const updated = newState
          ? [...new Set([...savedFavs, deal.id])]
          : savedFavs.filter((id) => id !== deal.id);
        localStorage.setItem("customer_favourites", JSON.stringify(updated));
      }
    } catch (err) {
      console.error("Favourite toggle failed:", err);
    } finally {
      setFavLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-[10px] shadow-[0_4px_24px_rgba(0,0,0,0.10)] overflow-visible w-full max-w-[390px] mb-6 transition-transform duration-300 hover:scale-[1.02] z-10">

        {/* Image Section */}
        <div className="relative rounded-t-[10px] overflow-hidden">
          <img
            src={deal.imgUrl}
            alt={deal.title}
            className="h-[200px] md:h-[230px] w-full object-cover rounded-t-[10px] cursor-pointer"
            onClick={() => setImageModalOpen(true)}
          />

          {/* Popular badge */}
          <div className="absolute top-3 left-3 bg-white text-[#2F73F2] text-[12px] font-semibold px-3 py-1 rounded-[5px] shadow-sm">
            Popular
          </div>

          {/* ── Heart / Favourite icon ── */}
          <button
            onClick={handleFavouriteClick}
            disabled={favLoading}
            className="absolute top-3 right-3 bg-white w-[34px] h-[34px] rounded-[5px] flex items-center justify-center shadow-sm cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95"
          >
            {favLoading ? (
              // Loading spinner
              <div className="w-4 h-4 border-2 border-[#5C039B] border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                // filled = liked, outline = not liked
                fill={isFavourited ? "#5C039B" : "none"}
                stroke="#5C039B"
                strokeWidth="2"
                className="transition-all duration-200"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            )}
          </button>
        </div>

        {/* Content Section */}
        <div className="p-5 md:p-[20px]">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-[16px] font-semibold text-[#111827] leading-snug">{deal.title}</h3>
            <span className="shrink-0 text-[11px] font-medium text-[#5C039B] bg-[#F3E8FF] px-2 py-[3px] rounded-full">
              {deal.location?.split(",")[1]?.trim() || "Dubai"}
            </span>
          </div>

          <div className="flex items-end gap-[4px] mb-4">
            <span className="font-bold text-[20px] text-[#111827]">{deal.price}</span>
          </div>

          <div className="border-t border-[#F3F4F6] mb-4" />

          <div className="flex items-center gap-5 text-[13px] text-[#374151] mb-5">
            {deal.bedroomType === "studio" ? (
              <div className="flex items-center gap-2">
                <img src={bedicon} alt="Studio" className="h-[16px] w-[16px]" />
                <span className="font-semibold text-[#5C039B]">Studio</span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <img src={bedicon} alt="Beds" className="h-[16px] w-[16px]" />
                  <span>{deal.bedrooms} <span className="text-[#9CA3AF]">Bedrooms</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <img src={tubicon} alt="Bath" className="h-[16px] w-[16px]" />
                  <span>{deal.bathrooms} <span className="text-[#9CA3AF]">Bathroom</span></span>
                </div>
              </>
            )}
            <div className="flex items-center gap-2">
              <img src={layouticon} alt="Area" className="h-[16px] w-[16px]" />
              <span>{deal.area} <span className="text-[#9CA3AF]">Living Area</span></span>
            </div>
          </div>

          <button
            onClick={onClick}
            className="w-full h-[48px] bg-[#5C039B] text-white rounded-[30px] font-semibold text-[15px] transition-all hover:bg-[#4a0280]"
          >
            Show Details
          </button>
        </div>
      </div>

      {/* Image Lightbox Modal */}
      {imageModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <button
              onClick={() => setImageModalOpen(false)}
              className="absolute -top-4 -right-4 z-20 bg-gradient-to-r from-red-500 to-pink-500 text-white w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-lg"
            >
              <X size={18} />
            </button>
            <img
              src={deal.imgUrl}
              alt={deal.title}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />
            <p className="text-center text-white/80 text-sm mt-3">{deal.title}</p>
          </div>
        </div>
      )}
    </>
  );
}

export default Property;
