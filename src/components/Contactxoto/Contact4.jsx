import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Picture1 from "../../assets/img/image3.png";
import Picture2 from "../../assets/img/Image4.png";
import wave2 from "../../assets/img/wave/wave2.png";
import { apiService } from "../../manageApi/utils/custom.apiservice"; 
import toast, { Toaster } from "react-hot-toast"; // ✅ Import Toast

export default function PartnerForm() {
  const { t } = useTranslation("contact4");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    organization: "",
    email: "",
    partnerType: "",
    proposal: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validate = () => {
    let err = {};

    if (!formData.first_name.trim()) err.first_name = "First name is required";
    if (!formData.last_name.trim()) err.last_name = "Last name is required";

    if (!formData.organization.trim())
      err.organization = t("validation.organization");

    if (!formData.email.trim()) {
      err.email = t("validation.emailRequired");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      err.email = t("validation.emailInvalid");
    }

    if (!formData.partnerType)
      err.partnerType = t("validation.partnerType");

    if (!formData.proposal.trim())
      err.proposal = t("validation.proposal");

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
        toast.error("Please fill all required fields correctly."); // ✅ Error Toast
        return;
    }

    setLoading(true);

    const payload = {
      type: "partner",
      name: {
        first_name: formData.first_name,
        last_name: formData.last_name,
      },
      email: formData.email,
      stakeholder_type: formData.partnerType,
      message: `Organization: ${formData.organization}\n\nProposal: ${formData.proposal}`,
    };

    try {
      const response = await apiService.post("/property/lead", payload);

      if (response.success || response.data) {
        // ✅ Success Toast
        toast.success(t("notification.success") || "Partner request submitted successfully!");
        
        setFormData({
          first_name: "",
          last_name: "",
          organization: "",
          email: "",
          partnerType: "",
          proposal: "",
        });
      } else {
        toast.error("Submission failed. Please try again."); // ✅ Error Toast
      }
    } catch (error) {
      console.error("API Error:", error);
      toast.error("Something went wrong. Please check your connection."); // ✅ Error Toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full bg-[var(--color-body)] flex flex-col items-center py-10 overflow-hidden">
      {/* ✅ Toaster Component Added Here */}
      <Toaster position="top-center" reverseOrder={false} />

      <div className="w-full flex flex-col items-center relative z-10">
        <div className="w-full flex justify-center px-4">
          <div className="max-w-7xl w-full p-0 sm:p-6 md:p-8 flex flex-col md:flex-row gap-10 md:gap-16">
            
            {/* LEFT SIDE CONTENT */}
            <div className="md:w-1/2 relative flex flex-col gap-4 md:gap-6 text-center md:text-left">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-black leading-tight">
                {t("title.line1")} <br /> {t("title.line2")}
              </h2>

              <p className="text-[#547593] font-medium text-base sm:text-lg">
                {t("subtitle.line1")}
                <br className="hidden sm:block" />
                {t("subtitle.line2")}
              </p>

              <div
                className="hidden md:block w-full h-56 sm:h-64 md:h-80 bg-center bg-no-repeat bg-contain absolute bottom-[-75px]"
                style={{ backgroundImage: `url(${Picture1})` }}
              />
            </div>

            {/* RIGHT SIDE FORM */}
            <div className="md:w-1/2 w-full flex flex-col gap-8">
              <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 border border-gray-200">
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  
                  {/* Name Fields */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full">
                      <label className="text-sm font-medium">First Name*</label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        placeholder="First Name"
                        className={`border rounded-md p-3 w-full focus:outline-none focus:ring-2 ${
                          errors.first_name
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-purple-500"
                        }`}
                      />
                      {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
                    </div>
                    <div className="w-full">
                      <label className="text-sm font-medium">Last Name*</label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        placeholder="Last Name"
                        className={`border rounded-md p-3 w-full focus:outline-none focus:ring-2 ${
                          errors.last_name
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-purple-500"
                        }`}
                      />
                      {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
                    </div>
                  </div>

                  {/* Organization */}
                  <div>
                    <label className="text-sm font-medium">
                      {t("form.organization")}*
                    </label>
                    <input
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleChange}
                      placeholder={t("placeholders.organization")}
                      className={`border rounded-md p-3 w-full focus:outline-none focus:ring-2 ${
                        errors.organization
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-purple-500"
                      }`}
                    />
                    {errors.organization && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.organization}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-sm font-medium">
                      {t("form.email")}*
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t("placeholders.email")}
                      className={`border rounded-md p-3 w-full focus:outline-none focus:ring-2 ${
                        errors.email
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-purple-500"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Partner Type */}
                  <div>
                    <label className="text-sm font-medium">
                      {t("form.partnerType")}*
                    </label>
                    <select
                      name="partnerType"
                      value={formData.partnerType}
                      onChange={handleChange}
                      className={`border rounded-md p-3 w-full bg-white focus:outline-none focus:ring-2 ${
                        errors.partnerType
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-purple-500"
                      }`}
                    >
                      <option value="">{t("options.select")}</option>
                      <option value="Business Associate">{t("options.business") || "Business Associate"}</option>
                      <option value="Execution Partner">{t("options.execution") || "Execution Partner"}</option>
                      <option value="Strategic Alliances">{t("options.alliance") || "Strategic Alliances"}</option>
                      <option value="Developers">{t("options.developers") || "Developers"}</option>
                      <option value="Financial Institution">{t("options.finance") || "Financial Institution"}</option>
                    </select>
                    {errors.partnerType && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.partnerType}
                      </p>
                    )}
                  </div>

                  {/* Proposal */}
                  <div>
                    <label className="text-sm font-medium">
                      {t("form.proposal")}*
                    </label>
                    <textarea
                      name="proposal"
                      rows="3"
                      value={formData.proposal}
                      onChange={handleChange}
                      placeholder={t("placeholders.proposal")}
                      className={`border rounded-md p-3 w-full focus:outline-none focus:ring-2 resize-none ${
                        errors.proposal
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-purple-500"
                      }`}
                    />
                    {errors.proposal && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.proposal}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#5C039B] text-white py-3 rounded-md font-medium hover:bg-opacity-90 transition disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      t("buttons.submit")
                    )}
                  </button>
                </form>
              </div>

              <div className="md:hidden w-full flex justify-center">
                <img
                  src={Picture1}
                  alt="Collaboration"
                  className="w-full max-w-sm object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CHAT SECTION */}
        <div className="w-full flex justify-center px-4 mt-10">
          <div className="max-w-6xl w-full bg-gradient-to-t from-[#03A4F4] to-[#5C039B] text-white rounded-2xl shadow-xl flex flex-col md:flex-row gap-8 px-6 py-8 md:px-8">
            <div className="md:w-1/2 flex flex-col justify-center text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
                {t("chat.title")}
              </h2>
              <p className="text-base md:text-lg mb-6">
                {t("chat.description")}
              </p>
              <button className="bg-[#5C039B] border border-white/20 px-6 py-3 rounded-md font-semibold hover:bg-white hover:text-[#5C039B] transition-colors shadow-lg">
                {t("chat.button")}
              </button>
            </div>

            <div className="md:w-1/2 flex justify-center items-end">
              <img
                src={Picture2}
                alt="xobia"
                className="w-64 sm:w-72 md:w-80 object-contain md:translate-y-8"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[-400px] md:bottom-[-600px] left-0 w-full z-0 pointer-events-none">
        <img
          src={wave2}
          alt=""
          className="w-full scale-[2.5] md:scale-[1.4] select-none opacity-50 md:opacity-100"
        />
      </div>
    </div>
  );
}