import React, { useState } from "react";
import Imagemain from "../../assets/img/buy.jpg";
import { notification } from 'antd';
import { useTranslation } from "react-i18next";
import { apiService } from "../../manageApi/utils/custom.apiservice";
import {
  X,
  ArrowRight,
  Phone,
  Mail,
  MessageCircle,
  Globe,
  User,       // Added for Name
  BedDouble,  // Added for Bedrooms
  Home,       // Added for Listing Type
  Building2,  // Added for City/Project
  MapPin,     // Added for Area
  Banknote,   // Added for Price
  FileText    // Added for Description
} from "lucide-react";

export default function HeroSection() {
  const { t } = useTranslation("buy1");
  const [openModal, setOpenModal] = useState(false);
  const [actionType, setActionType] = useState("Buy");
  const [loading, setLoading] = useState(false);
  
  const [api, contextHolder] = notification.useNotification();

  // Country codes for Dubai, India, Russia
  const countryCodes = [
    { code: "+971", country: "UAE" },
    { code: "+91", country: "IN" },
    { code: "+7", country: "RU" },
  ];

  const [buyForm, setBuyForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    country_code: "+971",
    mobile: "",
    desired_bedrooms: "",
    preferred_contact: "whatsapp",
  });
const lengthMap = {
    "+971": 9,  // UAE
    "+91": 10,  // India
    "+7": 10,   // Russia (Standard mobile is 10)
  };
  const [sellForm, setSellForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    country_code: "+971",
    mobile: "",
    listing_type: "",
    city: "",
    area: "",
    project_name: "",
    bedroom_config: "",
    price: "",
    description: "",
    preferred_contact: "call",
  });

  const handleOpenModal = (type) => {
    setActionType(type);
    setOpenModal(true);
  };

 const handleBuyChange = (e) => {
    const { name, value } = e.target;
    if (name === "mobile") {
      const numericValue = value.replace(/\D/g, "");
      // Get limit based on current country_code in buyForm
      const limit = lengthMap[buyForm.country_code] || 15;
      setBuyForm((prev) => ({ ...prev, [name]: numericValue.slice(0, limit) }));
    } else if (name === "country_code") {
      // When country changes, trim the existing number if it's too long
      const newLimit = lengthMap[value] || 15;
      setBuyForm((prev) => ({ 
        ...prev, 
        [name]: value, 
        mobile: prev.mobile.slice(0, newLimit) 
      }));
    } else {
      setBuyForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSellChange = (e) => {
    const { name, value } = e.target;
    if (name === "mobile") {
      const numericValue = value.replace(/\D/g, "");
      // Get limit based on current country_code in sellForm
      const limit = lengthMap[sellForm.country_code] || 15;
      setSellForm((prev) => ({ ...prev, [name]: numericValue.slice(0, limit) }));
    } else if (name === "country_code") {
      // When country changes, trim the existing number if it's too long
      const newLimit = lengthMap[value] || 15;
      setSellForm((prev) => ({ 
        ...prev, 
        [name]: value, 
        mobile: prev.mobile.slice(0, newLimit) 
      }));
    } else {
      setSellForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const openNotification = (type, title, description) => {
    api[type]({
      message: title,
      description: description,
      placement: 'topRight',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const currentForm = actionType === "Buy" ? buyForm : sellForm;
    
    if (!currentForm.mobile || currentForm.mobile.length < 5) {
       openNotification('error', 'Validation Error', t("Please enter a valid mobile number"));
       setLoading(false);
       return;
    }

    const payload =
      actionType === "Buy"
        ? {
            type: "buy",
            name: {
              first_name: buyForm.first_name.trim(),
              last_name: buyForm.last_name.trim(),
            },
            mobile: { 
                country_code: buyForm.country_code,
                number: buyForm.mobile 
            },
            email: buyForm.email.toLowerCase().trim(),
            desired_bedrooms: buyForm.desired_bedrooms,
            preferred_contact: buyForm.preferred_contact,
          }
        : {
            type: "sell",
            name: {
              first_name: sellForm.first_name.trim(),
              last_name: sellForm.last_name.trim(),
            },
            mobile: { 
                country_code: sellForm.country_code,
                number: sellForm.mobile 
            },
            email: sellForm.email.toLowerCase().trim(),
            listing_type: sellForm.listing_type,
            city: sellForm.city,
            area: sellForm.area,
            project_name: sellForm.project_name,
            bedroom_config: sellForm.bedroom_config,
            price: Number(sellForm.price) || undefined,
            description: sellForm.description,
            preferred_contact: sellForm.preferred_contact,
          };

    try {
      const response = await apiService.post("/property/lead", payload);

      if (response.success) {
        openNotification(
            'success', 
            'Request Submitted Successfully', 
            t("toast.success", { name: actionType === "Buy" ? buyForm.first_name : sellForm.first_name })
        );

        setOpenModal(false);

        if (actionType === "Buy") {
          setBuyForm({
            first_name: "",
            last_name: "",
            email: "",
            country_code: "+971",
            mobile: "",
            desired_bedrooms: "",
            preferred_contact: "whatsapp",
          });
        } else {
          setSellForm({
            first_name: "",
            last_name: "",
            email: "",
            country_code: "+971",
            mobile: "",
            listing_type: "",
            city: "",
            area: "",
            project_name: "",
            bedroom_config: "",
            price: "",
            description: "",
            preferred_contact: "call",
          });
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

      {/* HERO SECTION */}
      <section className="relative w-full overflow-hidden font-dm h-140">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${Imagemain})` }}
        >
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

            <button
              onClick={() => handleOpenModal("Buy")}
              className="px-10 py-4 bg-transparent border-2 border-white text-white font-extrabold rounded-lg shadow-md hover:bg-[#5C039B] hover:border-[#5C039B] hover:scale-105 transition-all"
            >
              {t("hero.buttons.find")}
            </button>

            <button
              onClick={() => handleOpenModal("Sell")}
              className="px-10 py-4 bg-transparent border-2 border-white text-white font-extrabold rounded-lg shadow-md hover:bg-[#5C039B] hover:border-[#5C039B] hover:scale-105 transition-all"
            >
              {t("hero.buttons.sell")}
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-72 h-12 bg-[var(--color-body)] z-[3] clip-left-shape" />
        <div className="absolute bottom-0 right-0 w-72 h-12 bg-[var(--color-body)] z-[3] clip-right-shape" />
        <style jsx>{`
          .clip-left-shape {
            clip-path: polygon(0 0, 55% 0, 100% 100%, 0% 100%);
          }
          .clip-right-shape {
            clip-path: polygon(47% 0, 100% 0, 100% 100%, 0% 100%);
          }
        `}</style>
      </section>

      {/* PREMIUM MODAL */}
      {openModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-white via-blue-50 to-purple-50 max-w-4xl w-full rounded-3xl shadow-2xl relative max-h-[90vh] overflow-hidden border border-white/20">
            <button
              onClick={() => setOpenModal(false)}
              className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white w-10 h-10 rounded-full text-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg z-20"
            >
              <X size={24} />
            </button>

            <div className="p-8 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 border-b border-white/10">
              <div className="flex flex-col items-center mb-6">
                <div className="flex bg-gradient-to-r from-blue-600 to-purple-600 p-1 rounded-2xl shadow-lg mb-6">
                {["Buy", "Sell"].map((type) => (
                    <button
                    key={type}
                    onClick={() => setActionType(type)}
                    className={`px-10 py-4 rounded-xl font-bold transition-all duration-300 ${
                        actionType === type
                        ? "bg-white text-gray-900 shadow-lg"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                    >
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
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                        <input
                        name="first_name"
                        value={actionType === "Buy" ? buyForm.first_name : sellForm.first_name}
                        onChange={actionType === "Buy" ? handleBuyChange : handleSellChange}
                        placeholder={t("form.firstName")}
                        required
                        className="premium-input pl-12"
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600">
                           <User size={20} />
                        </div>
                    </div>
                    <div className="relative">
                        <input
                        name="last_name"
                        value={actionType === "Buy" ? buyForm.last_name : sellForm.last_name}
                        onChange={actionType === "Buy" ? handleBuyChange : handleSellChange}
                        placeholder={t("form.lastName")}
                        required
                        className="premium-input pl-12"
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600">
                           <User size={20} />
                        </div>
                    </div>
                    </div>

                    <div className="relative">
                    <input
                        name="email"
                        type="email"
                        value={actionType === "Buy" ? buyForm.email : sellForm.email}
                        onChange={actionType === "Buy" ? handleBuyChange : handleSellChange}
                        placeholder={t("form.email")}
                        required
                        className="premium-input pl-12"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600">
                        <Mail size={20} />
                    </div>
                    </div>

                    {/* MOBILE INPUT WITH COUNTRY CODE */}
                    <div className="flex gap-3">
                        <div className="relative w-32">
                            <select
                                name="country_code"
                                value={actionType === "Buy" ? buyForm.country_code : sellForm.country_code}
                                onChange={actionType === "Buy" ? handleBuyChange : handleSellChange}
                                className="premium-input pl-10 pr-2 appearance-none cursor-pointer"
                                style={{ backgroundImage: 'none' }} 
                            >
                                {countryCodes.map((item) => (
                                    <option key={item.code} value={item.code}>
                                        {item.code} ({item.country})
                                    </option>
                                ))}
                            </select>
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 pointer-events-none">
                                <Globe size={18} />
                            </div>
                        </div>

                        <div className="relative flex-1">
                            <input
                                name="mobile"
                                type="text"
                                inputMode="numeric"
                                value={actionType === "Buy" ? buyForm.mobile : sellForm.mobile}
                                onChange={actionType === "Buy" ? handleBuyChange : handleSellChange}
                                placeholder={t("form.phone")}
                                required
                                className="premium-input pl-12"
                            />
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600">
                                <Phone size={20} />
                            </div>
                        </div>
                    </div>

                    {actionType === "Buy" ? (
                    <>
                        <div className="relative">
                        <input
                            name="desired_bedrooms"
                            value={buyForm.desired_bedrooms}
                            onChange={handleBuyChange}
                            placeholder={t("form.bedrooms")}
                            required
                            className="premium-input pl-12"
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600">
                           <BedDouble size={20} />
                        </div>
                        </div>

                        <div>
                        <p className="text-gray-700 font-semibold mb-4 text-lg">
                            {t("form.preferredContactTitle")}
                        </p>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                            { value: "call", icon: <Phone size={18} />, label: t("form.contact.call") },
                            { value: "whatsapp", icon: <MessageCircle size={18} />, label: t("form.contact.whatsapp") },
                            { value: "email", icon: <Mail size={18} />, label: t("form.contact.email") },
                            ].map(({ value, icon, label }) => (
                            <label key={value} className="relative">
                                <input
                                type="radio"
                                name="preferred_contact"
                                value={value}
                                checked={buyForm.preferred_contact === value}
                                onChange={handleBuyChange}
                                className="sr-only peer"
                                />
                                <div className="p-4 rounded-xl border-2 border-gray-200 bg-white cursor-pointer transition-all duration-300 hover:border-blue-400 hover:shadow-md peer-checked:border-blue-600 peer-checked:bg-gradient-to-r peer-checked:from-blue-50 peer-checked:to-purple-50 peer-checked:shadow-lg">
                                <div className="flex flex-col items-center gap-2">
                                    <div className={`p-2 rounded-full ${buyForm.preferred_contact === value ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}>
                                    {icon}
                                    </div>
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
                        {[
                            { name: "listing_type", placeholder: t("form.sell.listing_type"), icon: <Home size={20} /> },
                            { name: "city", placeholder: t("form.sell.city"), icon: <Building2 size={20} /> },
                            { name: "area", placeholder: t("form.sell.area"), icon: <MapPin size={20} /> },
                            { name: "project_name", placeholder: t("form.sell.project_name"), icon: <Building2 size={20} /> },
                            { name: "bedroom_config", placeholder: t("form.sell.bedroom_config"), icon: <BedDouble size={20} /> },
                            { name: "price", placeholder: t("form.sell.price"), icon: <Banknote size={20} /> },
                        ].map(({ name, placeholder, icon }) => (
                            <div key={name} className="relative">
                            <input
                                name={name}
                                value={sellForm[name]}
                                onChange={handleSellChange}
                                placeholder={placeholder}
                                className="premium-input pl-12"
                            />
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600">
                                {icon}
                            </div>
                            </div>
                        ))}
                        </div>

                        <div className="relative">
                        <textarea
                            name="description"
                            value={sellForm.description}
                            onChange={handleSellChange}
                            placeholder={t("form.sell.description")}
                            rows={4}
                            className="premium-input pl-12 pt-4 resize-none"
                        />
                        <div className="absolute left-4 top-6 transform text-blue-600">
                           <FileText size={20} />
                        </div>
                        </div>
                    </>
                    )}

                    {/* Checkboxes */}
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

                    <button
                    type="submit"
                    disabled={loading}
                    className="group w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-5 rounded-xl text-xl font-bold hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                    {loading ? (
                        <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        {t("form.processing")}
                        </>
                    ) : (
                        <>
                        {actionType === "Buy" ? t("form.submit.buy") : t("form.submit.sell")}
                        <ArrowRight className="group-hover:translate-x-2 transition-transform" size={20} />
                        </>
                    )}
                    </button>
                </form>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
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

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #7c3aed);
        }
      `}</style>
    </>
  );
}