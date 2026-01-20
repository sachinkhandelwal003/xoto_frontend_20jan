import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Picture1 from "../../assets/img/image3.png";
import Picture2 from "../../assets/img/Image4.png";
import wave2 from "../../assets/img/wave/wave2.png";

export default function PartnerForm() {
  const { t } = useTranslation("contact4");

  const [formData, setFormData] = useState({
    organization: "",
    email: "",
    partnerType: "",
    proposal: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let err = {};

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      alert(t("notification.success"));
      console.log(formData);
    }
  };

  return (
    <div className="relative w-full bg-[var(--color-body)] flex flex-col items-center py-10 overflow-hidden">
      <div className="w-full flex flex-col items-center relative z-10">
        <div className="w-full flex justify-center px-4">
          <div className="max-w-7xl w-full p-0 sm:p-6 md:p-8 flex flex-col md:flex-row gap-10 md:gap-16">
            {/* LEFT */}
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

            {/* RIGHT */}
            <div className="md:w-1/2 w-full flex flex-col gap-8">
              <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 border border-gray-200">
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
                      <option value="Business Associates">
                        {t("options.business")}
                      </option>
                      <option value="Execution Partner">
                        {t("options.execution")}
                      </option>
                      <option value="Strategic Alliances">
                        {t("options.alliance")}
                      </option>
                      <option value="Developers">
                        {t("options.developers")}
                      </option>
                      <option value="Financial Institution">
                        {t("options.finance")}
                      </option>
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

                  <button
                    type="submit"
                    className="bg-[#5C039B] text-white py-3 rounded-md font-medium hover:bg-opacity-90 transition"
                  >
                    {t("buttons.submit")}
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

        {/* CHAT */}
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
