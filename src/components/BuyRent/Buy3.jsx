// src/components/property/Property.jsx
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
import { notification } from "antd";
import { apiService } from "../../manageApi/utils/custom.apiservice";
import { useTranslation } from "react-i18next";
import bgImage from "../../assets/img/buy3bg.png";
import Bedicon from "../../assets/img/buy/Vector.png";
import Bathicon from "../../assets/img/buy/Bath.png";
import Squareicon from "../../assets/img/buy/Square Meters.png";
import favoriteicon from "../../assets/img/buy/Favorited.png";
import popularicon from "../../assets/img/buy/Group 860.png";

const Property = () => {
  const { t } = useTranslation("buy3");
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

  // Fetch real properties from marketplace API
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
          first_name: "", last_name: "", email: "", country_code: "+971",
          mobile: "", occupation: "", location: "", preferred_contact: "whatsapp",
        });
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
                    type="email"
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
                        <option key={item.code} value={item.code}>{item.code}</option>
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
                  className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white py-4 md:py-5 rounded-xl text-lg font-bold hover:shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
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
          .premium-input { padding: 1rem 1.25rem 1rem 3rem; }
        }
        .premium-input:focus {
          border-color: #9333ea;
          box-shadow: 0 0 0 4px rgba(147, 51, 234, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f3e8ff; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #9333ea; border-radius: 4px; }
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