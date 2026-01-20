// src/components/home/OurProperty.jsx
import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Globe,
  Briefcase,
  MapPin,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import { notification } from "antd";
import { apiService } from "../../manageApi/utils/custom.apiservice";
import { useTranslation } from "react-i18next";
import "swiper/css";
import "swiper/css/navigation";

// Assets
import waveint4 from "../../assets/img/wave/waveint.png";
import bedicon from "../../assets/img/buy/icon-bed.png";
import tubicon from "../../assets/img/buy/icon-tub.png";
import layouticon from "../../assets/img/buy/icon-layout.png";
import favroiteicon from "../../assets/img/buy/Frame 1618873262.png";

const OurProperty = () => {
  const { t } = useTranslation("buy5");
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [api, contextHolder] = notification.useNotification();

  const countryCodes = [
    { code: "+971", country: "UAE" },
    { code: "+91", country: "IN" },
    { code: "+7", country: "RU" },
  ];

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    country_code: "+971",
    mobile: "",
    occupation: "",
    location: "",
    preferred_contact: "whatsapp",
  });

  // Fetch properties from the correct endpoint
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setFetchLoading(true);

        // IMPORTANT: Use this version to avoid double /api/api/
        const res = await apiService.get("/property/marketplace");

        // Alternative versions (only use one at a time):
        // const res = await apiService.get("property/marketplace");
        // const res = await apiService.get("/api/property/marketplace");

        console.log("Marketplace API full response:", res);

        if (res.success && res.data && Array.isArray(res.data.properties)) {
          const transformedProperties = res.data.properties.map((item) => ({
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

          console.log("Transformed Property Cards:", transformedProperties);
          setProperties(transformedProperties.slice(0, 9));
        } else {
          throw new Error("Invalid response format from marketplace API");
        }
      } catch (err) {
        console.error("❌ Error fetching marketplace properties:", err);
        openNotification(
          "error",
          "Failed to Load Properties",
          "Please try again later."
        );
        setProperties([]); // fallback
      } finally {
        setFetchLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "mobile") {
      const numericValue = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const openNotification = (type, title, description) => {
    api[type]({
      message: title,
      description: description,
      placement: "topRight",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.mobile || formData.mobile.length < 5) {
      openNotification("error", "Validation Error", t("Please enter a valid mobile number"));
      setLoading(false);
      return;
    }

    const payload = {
      type: "schedule_visit",
      name: { first_name: formData.first_name.trim(), last_name: formData.last_name.trim() },
      mobile: { country_code: formData.country_code, number: formData.mobile },
      email: formData.email.toLowerCase().trim(),
      occupation: formData.occupation,
      location: formData.location,
      preferred_contact: formData.preferred_contact,
    };

    try {
      const res = await apiService.post("/property/lead", payload);
      if (res.success) {
        openNotification("success", "Request Submitted", t("toast.success"));
        setOpenModal(false);
        setFormData({
          first_name: "", last_name: "", email: "", mobile: "",
          country_code: "+971", occupation: "", location: "", preferred_contact: "whatsapp",
        });
      }
    } catch (err) {
      openNotification("error", "Submission Failed", err.response?.data?.message || t("toast.error"));
    } finally {
      setLoading(false);
    }
  };

  const PropertyCard = ({ property }) => (
    <div className="w-full max-w-[393px] mx-auto h-[519px] bg-white rounded-[24px] shadow-[0px_20px_40px_rgba(0,0,0,0.12)] overflow-hidden relative">
      <div className="h-[240px] relative">
        <img src={property.image} alt={property.title} className="w-full h-full object-cover" />
        <span className={`absolute top-4 left-4 text-xs font-medium px-3 py-1 rounded-md ${property.tag === "Sell" ? "bg-[#E8F0FF] text-[#2563EB]" : "bg-[#E9FFF3] text-[#16A34A]"}`}>
          {property.tag}
        </span>
        <button className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-md">
          <img src={favroiteicon} alt="favorite" className="w-10 h-10" />
        </button>
      </div>
      <div className="p-6">
        <h3 className="font-medium text-[16px] leading-[24px] text-[rgba(0,0,0,0.6)] font-dm">
          {property.title}
        </h3>
        <div className="flex items-start justify-between">
          <p className="text-[20px] leading-[28px] font-medium text-[#0F172A] font-dm">{property.price}</p>
          <span className="px-3 py-[2px] text-[12px] leading-[18px] rounded-full bg-[#E8F0FF] text-[#2563EB] mt-[2px] font-dm">
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
          onClick={() => setOpenModal(true)} 
          className="w-full mt-8 h-[48px] rounded-lg bg-[#5C039B] text-white text-[16px] font-medium transition-transform hover:scale-[1.02]"
        >
          Show Details
        </button>
      </div>
    </div>
  );

  return (
    <>
      {contextHolder}
      <section className="relative pt-10 pb-20 md:pb-40 bg-[var(--color-body)] overflow-hidden z-20">
        <img 
          src={waveint4} 
          alt="" 
          className="absolute -bottom-[150px] md:-bottom-[350px] left-0 w-full object-cover" 
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
                      <PropertyCard property={p} />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              {/* Desktop Grid */}
              <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10 justify-items-center">
                {properties.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            </>
          )}

          <div className="flex justify-center mt-12 md:mt-16 relative z-20">
            <button
              onClick={() => navigate("/properties")}
              className="bg-[#5C039B] text-white px-8 md:px-10 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
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
              className="absolute top-4 right-4 z-30 bg-red-500 text-white w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center hover:scale-110 transition-all"
            >
              <X size={20} />
            </button>
            <div className="bg-gradient-to-r from-purple-600 to-violet-600 p-6 md:p-8 text-center shrink-0">
              <h3 className="text-2xl md:text-3xl font-bold text-white">{t("modal.title")}</h3>
              <p className="text-purple-100">{t("modal.subtitle")}</p>
            </div>
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="relative">
                    <input 
                      name="first_name" 
                      value={formData.first_name} 
                      onChange={handleChange} 
                      placeholder={t("form.firstName")} 
                      required 
                      className="premium-input pl-12" 
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600">
                      <User size={20} />
                    </div>
                  </div>
                  <div className="relative">
                    <input 
                      name="last_name" 
                      value={formData.last_name} 
                      onChange={handleChange} 
                      placeholder={t("form.lastName")} 
                      required 
                      className="premium-input pl-12" 
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600">
                      <User size={20} />
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <input 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    placeholder={t("form.email")} 
                    required 
                    className="premium-input pl-12" 
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600">
                    <Mail size={20} />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative w-full sm:w-32">
                    <select 
                      name="country_code" 
                      value={formData.country_code} 
                      onChange={handleChange} 
                      className="premium-input pl-10 pr-2 appearance-none cursor-pointer"
                    >
                      {countryCodes.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.code}
                        </option>
                      ))}
                    </select>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-600 pointer-events-none">
                      <Globe size={18} />
                    </div>
                  </div>
                  <div className="relative flex-1">
                    <input 
                      name="mobile" 
                      type="text" 
                      inputMode="numeric" 
                      value={formData.mobile} 
                      onChange={handleChange} 
                      placeholder={t("form.phone")} 
                      required 
                      className="premium-input pl-12" 
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600">
                      <Phone size={20} />
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <input 
                    name="occupation" 
                    value={formData.occupation} 
                    onChange={handleChange} 
                    placeholder={t("form.occupation")} 
                    required 
                    className="premium-input pl-12" 
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600">
                    <Briefcase size={20} />
                  </div>
                </div>

                <div className="relative">
                  <input 
                    name="location" 
                    value={formData.location} 
                    onChange={handleChange} 
                    placeholder={t("form.location")} 
                    required 
                    className="premium-input pl-12" 
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600">
                    <MapPin size={20} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 text-white py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-purple-700 transition font-bold"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    t("actions.submit")
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
          padding: 0.8rem 1rem 0.8rem 3rem;
          border-radius: 0.75rem;
          border: 2px solid #e9d5ff;
          background: white;
          outline: none;
          font-size: 1rem;
          transition: all 0.3s;
        }
        @media (min-width: 768px) {
          .premium-input {
            padding: 1rem 1.25rem 1rem 3rem;
          }
        }
        .premium-input:focus {
          border-color: #9333ea;
          box-shadow: 0 0 0 4px rgba(147, 51, 234, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f3e8ff;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #9333ea;
          border-radius: 4px;
        }
        .font-dm {
          font-family: 'DM Sans', sans-serif;
        }
      `}</style>
    </>
  );
};

export default OurProperty;