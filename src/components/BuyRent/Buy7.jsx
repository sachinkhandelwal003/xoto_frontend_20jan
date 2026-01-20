import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { apiService } from "../../manageApi/utils/custom.apiservice";

import waveint6 from "../../assets/img/wave/waveint6.png";
import waveint from "../../assets/img/wave/waveint4.png";
import image from "../../assets/img/bggg.png";

/* ---------------- COUNTRY CONFIG ---------------- */

const COUNTRY_CONFIG = {
  "+971": { country: "UAE", digits: 9, startsWith: /^5/ },
  "+91": { country: "India", digits: 10, startsWith: /^[6-9]/ },
};


export default function HeroSection() {
  const { t } = useTranslation("buy7");

  /* ---------------- STATE ---------------- */

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "+971", // ✅ DEFAULT UAE
    phone: "",
    country: "",
    lookingFor: "",
    city: "Dubai",
    budget: "",
  });

  const [loading, setLoading] = useState(false);

  /* ---------------- HANDLERS ---------------- */

  const handleChange = (e) => {
    const { name, value } = e.target;

    // ✅ VALIDATION 1: digits only for phone
  if (name === "phone") {
    const digitsOnly = value.replace(/\D/g, "");
    const maxDigits = COUNTRY_CONFIG[form.countryCode].digits;

    // block extra digits
    if (digitsOnly.length > maxDigits) return;

    setForm((prev) => ({ ...prev, phone: digitsOnly }));
    return;
  }

  setForm((prev) => ({ ...prev, [name]: value }));
};
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { countryCode, phone } = form;
    const config = COUNTRY_CONFIG[countryCode];

    // ✅ VALIDATION 2: empty fields
    if (Object.values(form).some((v) => !v.toString().trim())) {
      toast.error(t("error"));
      return;
    }

    // ✅ VALIDATION 3: length check
    if (phone.length !== config.digits) {
      toast.error(
        `${config.country} phone number must be ${config.digits} digits`
      );
      return;
    }

    // ✅ VALIDATION 4: starting digit check
    if (!config.startsWith.test(phone)) {
      toast.error(
        countryCode === "+971"
          ? "UAE numbers must start with 5"
          : "Indian numbers must start with 6, 7, 8, or 9"
      );
      return;
    }

    setLoading(true);

    try {
      const res = await apiService.post("/property/lead", {
        type: form.lookingFor.toLowerCase(),
        name: {
          first_name: form.firstName.trim(),
          last_name: form.lastName.trim(),
        },
        mobile: {
          country_code: form.countryCode,
          number: form.phone,
        },
        email: form.email.trim().toLowerCase(),
        country: form.country === "Dubai" ? "UAE" : form.country,
        preferred_city: form.city,
        budget: form.budget,
      });

      if (res?.success) {
        toast.success(t("success"));
        setForm({
          firstName: "",
          lastName: "",
          email: "",
          countryCode: "+971", // reset to UAE
          phone: "",
          country: "",
          lookingFor: "",
          city: "Dubai",
          budget: "",
        });
      }
    } catch {
      toast.error(t("genericError"));
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <>
      <Toaster position="top-center" />

      <section className="relative w-full bg-[var(--color-body)] py-16 overflow-hidden">
        {/* Background waves */}
        <div className="absolute top-0 left-0 w-full z-0">
          <img src={waveint6} alt="" className="w-full" />
        </div>
        <div className="absolute -bottom-30 left-0 w-full z-0">
          <img src={waveint} alt="" className="w-full" />
        </div>

        <div className="max-w-8xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* LEFT CONTENT */}
          <div className="z-20 flex flex-col gap-[20px]">
            <h1 className="font-['DM_Sans'] font-semibold text-[60px] leading-[48px] tracking-[-0.03em] text-[#020202] max-w-[494px] ml-20">
              {t("heroTitle")}
            </h1>

            <p className="font-['DM_Sans'] font-semibold text-[24px] leading-[33px] text-[#547593] max-w-[482px] ml-20">
              {t("heroSub")}
            </p>

            <img src={image} alt="" className="w-full max-w-[590px] mt-[24px]" />
          </div>

          {/* RIGHT FORM */}
          <div className="z-20">
            <div className="bg-white shadow-[0_0_30px_rgba(92,3,155,0.3)] rounded-3xl p-8 max-w-lg mx-auto border border-purple-100">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {t("formTitle")}
              </h2>
              <p className="text-gray-700 mb-8">{t("formSub")}</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div className="grid grid-cols-2 gap-4">
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder={t("firstName")}
                    className="w-full px-5 py-4 rounded-xl border border-gray-300"
                  />
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder={t("lastName")}
                    className="w-full px-5 py-4 rounded-xl border border-gray-300"
                  />
                </div>

                {/* Email */}
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder={t("email")}
                  className="w-full px-5 py-4 rounded-xl border border-gray-300"
                />

                {/* Phone */}
                <div className="grid grid-cols-3 gap-3">
                  <select
                    name="countryCode"
                    value={form.countryCode} // ✅ controlled
                    onChange={(e) =>
                      setForm({
                        ...form,
                        countryCode: e.target.value,
                        phone: "",
                      })
                    }
                    className="px-4 py-4 rounded-xl border border-gray-300"
                  >
                    <option value="+91">+91</option>
                    <option value="+971">+971</option>
                  </select>

                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder={
                      form.countryCode === "+971"
                        ? "9 digit number"
                        : "10 digit number"
                    }
                    className="col-span-2 px-5 py-4 rounded-xl border border-gray-300"
                  />
                </div>

                {/* Country & Looking For */}
                <div className="grid grid-cols-2 gap-4">
                  <select
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    className="w-full px-5 py-4 rounded-xl border border-gray-300"
                  >
                    <option value="">{t("country")}</option>
                    <option value="India">India</option>
                    <option value="Dubai">UAE</option>
                  </select>

                  <select
                    name="lookingFor"
                    value={form.lookingFor}
                    onChange={handleChange}
                    className="w-full px-5 py-4 rounded-xl border border-gray-300"
                  >
                    <option value="">{t("lookingFor")}</option>
                    <option value="Buy">Buy</option>
                    <option value="Sell">Sell</option>
                    <option value="Rent">Rent</option>
                  </select>
                </div>

                {/* City */}
                <select
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full px-5 py-4 rounded-xl border border-gray-300"
                >
                  <option value="">{t("city")}</option>
                  <option>Pune</option>
                  <option>Mumbai</option>
                  <option>Bangalore</option>
                  <option>Dubai</option>
                  <option>Abu Dhabi</option>
                </select>

                {/* Budget */}
                <input
                  name="budget"
                  value={form.budget}
                  onChange={handleChange}
                  placeholder={t("budget")}
                  className="w-full px-5 py-4 rounded-xl border border-gray-300"
                />

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[var(--color-primary)] text-white font-bold py-5 rounded-xl"
                >
                  {loading ? t("submitting") : t("submit")}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
