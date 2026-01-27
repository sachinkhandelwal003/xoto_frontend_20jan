import React, { useState, useMemo } from "react";
import Imagemain from "../../assets/img/buy.jpg";
import { notification, Select } from 'antd';
import { useTranslation } from "react-i18next";
import { apiService } from "../../manageApi/utils/custom.apiservice";
import { Country, State, City } from "country-state-city"; 
import {
  X, ArrowRight, Phone, Mail, MessageCircle, Globe, User, BedDouble, 
  Home, Building2, MapPin, Banknote, FileText
} from "lucide-react";
import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js";


const { Option } = Select;

const validatePhone = (countryCode, mobile) => {
  try {
    const fullNumber = `+${countryCode}${mobile}`;
    return isValidPhoneNumber(fullNumber);
  } catch {
    return false;
  }
};


// 1. Strict Phone Length Rules
const PHONE_LENGTH_RULES = {
  "971": 9, "91": 10, "7": 10, "1": 10, "44": 10,
};

export default function HeroSection() {
  const { t } = useTranslation("buy1");
  const [openModal, setOpenModal] = useState(false);
  const [actionType, setActionType] = useState("Buy");
  const [loading, setLoading] = useState(false);
  
  const [api, contextHolder] = notification.useNotification();

  // 2. Prepare Country Data (Memoized)
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

  // 3. Location States for Sell Form
  const [sellStates, setSellStates] = useState([]);
  const [sellCities, setSellCities] = useState([]);

  const [buyForm, setBuyForm] = useState({
    first_name: "", last_name: "", email: "", country_code: "971", mobile: "", desired_bedrooms: "", preferred_contact: "whatsapp",
  });

  const [sellForm, setSellForm] = useState({
    first_name: "", last_name: "", email: "", country_code: "971", mobile: "", 
    listing_type: "", 
    location_country: null, // New
    state: null,           // New
    city: null,            // New (Replaces manual city input)
    area: "", project_name: "", bedroom_config: "", price: "", description: "", preferred_contact: "call",
  });

  const handleOpenModal = (type) => {
    setActionType(type);
    setOpenModal(true);
  };

  // --- BUY FORM HANDLERS ---
  const handleBuyChange = (e) => {
    const { name, value } = e.target;
    if (name === "mobile") {
      const numericValue = value.replace(/\D/g, "");
      const limit = PHONE_LENGTH_RULES[buyForm.country_code] || 15;
      setBuyForm((prev) => ({ ...prev, [name]: numericValue.slice(0, limit) }));
    } else {
      setBuyForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleBuyCountryChange = (value) => {
    const limit = PHONE_LENGTH_RULES[value] || 15;
    setBuyForm((prev) => ({ ...prev, country_code: value, mobile: prev.mobile.slice(0, limit) }));
  };

  // --- SELL FORM HANDLERS ---
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

  // --- NEW LOCATION HANDLERS (SELL) ---
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

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const currentForm = actionType === "Buy" ? buyForm : sellForm;
    
  const isPhoneValid = validatePhone(
  currentForm.country_code,
  currentForm.mobile
);

if (!isPhoneValid) {
  openNotification(
    "error",
    "Validation Error",
    "Please enter a valid phone number for selected country"
  );
  setLoading(false);
  return;
}


    // Sell Form Location Validation
    if (actionType === "Sell") {
        if (!sellForm.location_country) {
            openNotification('error', 'Validation Error', "Please select a country");
            setLoading(false); return;
        }
        if (!sellForm.state) {
            openNotification('error', 'Validation Error', "Please select a state");
            setLoading(false); return;
        }
        if (sellCities.length > 0 && !sellForm.city) {
            openNotification('error', 'Validation Error', "Please select a city");
            setLoading(false); return;
        }
    }

    // Resolve Names for Sell Form
    let sellLocationData = {};
    if (actionType === "Sell") {
        const countryName = Country.getCountryByCode(sellForm.location_country)?.name || "";
        const stateName = State.getStateByCodeAndCountry(sellForm.state, sellForm.location_country)?.name || sellForm.state;
        
        sellLocationData = {
            city: sellForm.city || stateName, // Use City if available, else State
            country: countryName,
            state: stateName
        };
    }

    const payload =
      actionType === "Buy"
        ? {
            type: "buy",
            name: { first_name: buyForm.first_name.trim(), last_name: buyForm.last_name.trim() },
            mobile: { country_code: buyForm.country_code, number: buyForm.mobile },
            email: buyForm.email.toLowerCase().trim(),
            desired_bedrooms: buyForm.desired_bedrooms,
            preferred_contact: buyForm.preferred_contact,
          }
        : {
            type: "sell",
            name: { first_name: sellForm.first_name.trim(), last_name: sellForm.last_name.trim() },
            mobile: { country_code: sellForm.country_code, number: sellForm.mobile },
            email: sellForm.email.toLowerCase().trim(),
            listing_type: sellForm.listing_type,
            
            // Location Data
            city: sellLocationData.city,
            // (You can pass country/state in description or separate fields if backend supports)
            description: `${sellForm.description} \n\n[Location: ${sellLocationData.city}, ${sellLocationData.state}, ${sellLocationData.country}]`,

            area: sellForm.area,
            project_name: sellForm.project_name,
            bedroom_config: sellForm.bedroom_config,
            price: Number(sellForm.price) || undefined,
            preferred_contact: sellForm.preferred_contact,
          };

    try {
      const response = await apiService.post("/property/lead", payload);

      if (response.success) {
        openNotification('success', 'Request Submitted Successfully', t("toast.success", { name: actionType === "Buy" ? buyForm.first_name : sellForm.first_name }));
        setOpenModal(false);

        if (actionType === "Buy") {
          setBuyForm({ first_name: "", last_name: "", email: "", country_code: "971", mobile: "", desired_bedrooms: "", preferred_contact: "whatsapp" });
        } else {
          setSellForm({ first_name: "", last_name: "", email: "", country_code: "971", mobile: "", listing_type: "", location_country: null, state: null, city: null, area: "", project_name: "", bedroom_config: "", price: "", description: "", preferred_contact: "call" });
        }
      }
    } catch (err) {
      console.error("Lead submission error:", err);
      openNotification('error', 'Submission Failed', t("toast.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}

      <section className="relative w-full overflow-hidden font-dm h-140">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${Imagemain})` }}>
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
          <h1 className="mx-auto mb-8 max-w-5xl heading-light">
            {t("hero.title.line1")} <br />
            {t("hero.title.line2")}
          </h1>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            <button className="px-10 py-4 bg-[#5C039B] text-white font-extrabold rounded-lg shadow-md hover:bg-[#5C039B] hover:scale-105 transition-all">
              {t("hero.buttons.rent")}
            </button>

            <button onClick={() => handleOpenModal("Buy")} className="px-10 py-4 bg-transparent border-2 border-white text-white font-extrabold rounded-lg shadow-md hover:bg-[#5C039B] hover:border-[#5C039B] hover:scale-105 transition-all">
              {t("hero.buttons.find")}
            </button>

            <button onClick={() => handleOpenModal("Sell")} className="px-10 py-4 bg-transparent border-2 border-white text-white font-extrabold rounded-lg shadow-md hover:bg-[#5C039B] hover:border-[#5C039B] hover:scale-105 transition-all">
              {t("hero.buttons.sell")}
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-72 h-12 bg-[var(--color-body)] z-[3] clip-left-shape" />
        <div className="absolute bottom-0 right-0 w-72 h-12 bg-[var(--color-body)] z-[3] clip-right-shape" />
        <style jsx>{`
          .clip-left-shape { clip-path: polygon(0 0, 55% 0, 100% 100%, 0% 100%); }
          .clip-right-shape { clip-path: polygon(47% 0, 100% 0, 100% 100%, 0% 100%); }
        `}</style>
      </section>

      {/* PREMIUM MODAL */}
      {openModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-white via-blue-50 to-purple-50 max-w-4xl w-full rounded-3xl shadow-2xl relative max-h-[90vh] overflow-hidden border border-white/20">
            <button onClick={() => setOpenModal(false)} className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white w-10 h-10 rounded-full text-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg z-20">
              <X size={24} />
            </button>

            <div className="p-8 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 border-b border-white/10">
              <div className="flex flex-col items-center mb-6">
                <div className="flex bg-gradient-to-r from-blue-600 to-purple-600 p-1 rounded-2xl shadow-lg mb-6">
                {["Buy", "Sell"].map((type) => (
                    <button key={type} onClick={() => setActionType(type)} className={`px-10 py-4 rounded-xl font-bold transition-all duration-300 ${actionType === type ? "bg-white text-gray-900 shadow-lg" : "text-white/80 hover:text-white hover:bg-white/10"}`}>
                    {type.toUpperCase()}
                    </button>
                ))}
                </div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent mb-2">
                  {actionType === "Sell" ? t("modal.sell.title") : t("modal.buy.title")}
                </h2>
                <p className="text-gray-600 text-center text-lg font-medium max-w-2xl">
                   {actionType === "Sell" ? t("modal.sell.desc") : t("modal.buy.desc")}
                </p>
              </div>
            </div>

            <div className="p-8 overflow-y-auto max-h-[60vh] custom-scrollbar">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Common Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                        <input name="first_name" value={actionType === "Buy" ? buyForm.first_name : sellForm.first_name} onChange={actionType === "Buy" ? handleBuyChange : handleSellChange} placeholder={t("form.firstName")} required className="premium-input pl-12" />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600"><User size={20} /></div>
                    </div>
                    <div className="relative">
                        <input name="last_name" value={actionType === "Buy" ? buyForm.last_name : sellForm.last_name} onChange={actionType === "Buy" ? handleBuyChange : handleSellChange} placeholder={t("form.lastName")} required className="premium-input pl-12" />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600"><User size={20} /></div>
                    </div>
                    </div>

                    <div className="relative">
                        <input name="email" type="email" value={actionType === "Buy" ? buyForm.email : sellForm.email} onChange={actionType === "Buy" ? handleBuyChange : handleSellChange} placeholder={t("form.email")} required className="premium-input pl-12" />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600"><Mail size={20} /></div>
                    </div>

                    {/* MOBILE INPUT WITH ANTD SELECT */}
                    <div className="flex gap-3 items-center">
                        <div className="w-[140px] flex-shrink-0 h-[50px]">
                            <Select
                                value={actionType === "Buy" ? buyForm.country_code : sellForm.country_code}
                                onChange={actionType === "Buy" ? handleBuyCountryChange : handleSellCountryChange}
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) => option.children.props?.children[1]?.props?.children[1]?.toLowerCase().includes(input.toLowerCase()) || option.value.includes(input)}
                                className="w-full h-full custom-select-hero"
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
                        <div className="relative flex-1">
                            <input name="mobile" type="text" inputMode="numeric" value={actionType === "Buy" ? buyForm.mobile : sellForm.mobile} onChange={actionType === "Buy" ? handleBuyChange : handleSellChange} placeholder={t("form.phone")} required className="premium-input pl-12 h-[50px]" />
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600"><Phone size={20} /></div>
                        </div>
                    </div>

                    {actionType === "Buy" ? (
                    <>
                        <div className="relative">
                        <input name="desired_bedrooms" value={buyForm.desired_bedrooms} onChange={handleBuyChange} placeholder={t("form.bedrooms")} required className="premium-input pl-12" />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600"><BedDouble size={20} /></div>
                        </div>

                        <div>
                        <p className="text-gray-700 font-semibold mb-4 text-lg">{t("form.preferredContactTitle")}</p>
                        <div className="grid grid-cols-3 gap-4">
                            {[{ value: "call", icon: <Phone size={18} />, label: t("form.contact.call") }, { value: "whatsapp", icon: <MessageCircle size={18} />, label: t("form.contact.whatsapp") }, { value: "email", icon: <Mail size={18} />, label: t("form.contact.email") }].map(({ value, icon, label }) => (
                            <label key={value} className="relative">
                                <input type="radio" name="preferred_contact" value={value} checked={buyForm.preferred_contact === value} onChange={handleBuyChange} className="sr-only peer" />
                                <div className="p-4 rounded-xl border-2 border-gray-200 bg-white cursor-pointer transition-all duration-300 hover:border-blue-400 hover:shadow-md peer-checked:border-blue-600 peer-checked:bg-gradient-to-r peer-checked:from-blue-50 peer-checked:to-purple-50 peer-checked:shadow-lg">
                                <div className="flex flex-col items-center gap-2">
                                    <div className={`p-2 rounded-full ${buyForm.preferred_contact === value ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}>{icon}</div>
                                    <span className="text-sm font-medium">{label}</span>
                                </div>
                                </div>
                            </label>
                            ))}
                        </div>
                        </div>
                    </>
                    ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Standard Sell Fields */}
                            <div className="relative">
                                <input name="listing_type" value={sellForm.listing_type} onChange={handleSellChange} placeholder={t("form.sell.listing_type")} className="premium-input pl-12" />
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600"><Home size={20} /></div>
                            </div>

                            {/* --- LOCATION DROPDOWNS (REPLACING MANUAL CITY) --- */}
                            
                            {/* Country Select */}
                            <div className="relative">
                                <Select
                                    placeholder="Select Country"
                                    showSearch
                                    optionFilterProp="children"
                                    onChange={handleSellLocationCountry}
                                    filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                                    className="w-full h-[52px] custom-select-hero"
                                    dropdownMatchSelectWidth={false}
                                >
                                    {countryOptions.map((country) => (
                                        <Option key={country.iso} value={country.iso}>{country.name}</Option>
                                    ))}
                                </Select>
                            </div>

                            {/* State Select */}
                            <div className="relative">
                                <Select
                                    placeholder="Select State"
                                    showSearch
                                    optionFilterProp="children"
                                    onChange={handleSellLocationState}
                                    disabled={!sellStates.length}
                                    filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                                    className="w-full h-[52px] custom-select-hero"
                                >
                                    {sellStates.map((state) => (
                                        <Option key={state.isoCode} value={state.isoCode}>{state.name}</Option>
                                    ))}
                                </Select>
                            </div>

                            {/* City Select */}
                            <div className="relative">
                                <Select
                                    placeholder={t("form.sell.city")}
                                    showSearch
                                    optionFilterProp="children"
                                    onChange={handleSellLocationCity}
                                    disabled={!sellCities.length}
                                    filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                                    className="w-full h-[52px] custom-select-hero"
                                >
                                    {sellCities.map((city) => (
                                        <Option key={city.name} value={city.name}>{city.name}</Option>
                                    ))}
                                </Select>
                            </div>

                            {/* --- END LOCATION DROPDOWNS --- */}

                            <div className="relative">
                                <input name="area" value={sellForm.area} onChange={handleSellChange} placeholder={t("form.sell.area")} className="premium-input pl-12" />
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600"><MapPin size={20} /></div>
                            </div>
                            <div className="relative">
                                <input name="project_name" value={sellForm.project_name} onChange={handleSellChange} placeholder={t("form.sell.project_name")} className="premium-input pl-12" />
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600"><Building2 size={20} /></div>
                            </div>
                            <div className="relative">
                                <input name="bedroom_config" value={sellForm.bedroom_config} onChange={handleSellChange} placeholder={t("form.sell.bedroom_config")} className="premium-input pl-12" />
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600"><BedDouble size={20} /></div>
                            </div>
                           <div className="relative">
    <input 
        type="number"  // Yahan change kiya hai
        name="price" 
        value={sellForm.price} 
        onChange={handleSellChange} 
        placeholder={t("form.sell.price")} 
        className="premium-input pl-12" 
        onWheel={(e) => e.target.blur()} // Mouse scroll se number change hona rokne ke liye
    />
    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600">
        <Banknote size={20} />
    </div>
</div>
                        </div>
                        <div className="relative">
                        <textarea name="description" value={sellForm.description} onChange={handleSellChange} placeholder={t("form.sell.description")} rows={4} className="premium-input pl-12 pt-4 resize-none" />
                        <div className="absolute left-4 top-6 transform text-blue-600"><FileText size={20} /></div>
                        </div>
                    </>
                    )}

                    <div className="space-y-4 pt-4">
                    <label className="flex items-start gap-3 text-gray-700 text-sm p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
                        <input type="checkbox" className="mt-1" />
                        <span>{t("checkbox.marketing")}</span>
                    </label>
                    <label className="flex items-start gap-3 text-gray-700 text-sm p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
                        <input type="checkbox" required className="mt-1" />
                        <span>{t("checkbox.terms")}</span>
                    </label>
                    </div>

                    <button type="submit" disabled={loading} className="group w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-5 rounded-xl text-xl font-bold hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3">
                    {loading ? (<><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>{t("form.processing")}</>) : (<>{actionType === "Buy" ? t("form.submit.buy") : t("form.submit.sell")}<ArrowRight className="group-hover:translate-x-2 transition-transform" size={20} /></>)}
                    </button>
                </form>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .premium-input {
          width: 100%;
          padding: 1rem 1.25rem 1rem 3rem;
          border-radius: 0.75rem;
          border: 2px solid #e2e8f0;
          background: white;
          outline: none;
          font-size: 1rem;
          transition: all 0.3s;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        .premium-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
          transform: translateY(-1px);
        }
        .premium-input::placeholder {
          color: #94a3b8;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #3b82f6, #8b5cf6); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: linear-gradient(to bottom, #2563eb, #7c3aed); }

        /* Antd Select Styles - Consistent for both Phone & Location */
        .custom-select-hero .ant-select-selector {
          border-radius: 0.75rem !important; 
          border: 2px solid #e2e8f0 !important; 
          height: 100% !important;
          min-height: 50px !important; 
          display: flex !important;
          align-items: center !important;
          padding-left: 8px !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
        }
        .custom-select-hero .ant-select-selector:hover {
          border-color: #3b82f6 !important;
        }
        .custom-select-hero.ant-select-focused .ant-select-selector {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
        }
      `}</style>
    </>
  );
}