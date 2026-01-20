import { useState } from "react";
import { FiX, FiChevronDown } from "react-icons/fi";
// 1. Import toast and Toaster
import toast, { Toaster } from "react-hot-toast";

export default function GetPreApprovedModal({ open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    foundProperty: "No",
    location: "Dubai",
    contact: [],
    marketing: false,
    terms: false,
  });

  const COUNTRY_CONFIG = {
    UAE: { code: "+971", flag: "https://flagcdn.com/w20/ae.png", digits: 9, fullName: "United Arab Emirates" },
    India: { code: "+91", flag: "https://flagcdn.com/w20/in.png", digits: 10, fullName: "India" },
    "Saudi Arabia": { code: "+966", flag: "https://flagcdn.com/w20/sa.png", digits: 9, fullName: "Saudi Arabia" },
    UK: { code: "+44", flag: "https://flagcdn.com/w20/gb.png", digits: 10, fullName: "United Kingdom" },
    Australia: { code: "+61", flag: "https://flagcdn.com/w20/au.png", digits: 9, fullName: "Australia" },
  };

  const [country, setCountry] = useState("UAE");

  if (!open) return null;

  const toggleContact = (v) => {
    setForm((p) => ({
      ...p,
      contact: p.contact.includes(v)
        ? p.contact.filter((x) => x !== v)
        : [...p.contact, v],
    }));
  };

  const handlePhoneChange = (e) => {
    const onlyDigits = e.target.value.replace(/\D/g, "");
    const maxLength = COUNTRY_CONFIG[country].digits;
    setForm({ ...form, phone: onlyDigits.slice(0, maxLength) });
  };

  const handleSubmit = async () => {
    // 2. Changed alert to toast.error
    if (!form.name || !form.phone || !form.email || !form.terms) {
      toast.error("Please fill all required fields.");
      return;
    }

    setLoading(true);
    const nameParts = form.name.trim().split(" ");
    const first_name = nameParts[0];
    const last_name = nameParts.slice(1).join(" ") || " ";

    const payload = {
      type: "mortgage",
      lead_sub_type: "pre_approval",
      name: { first_name, last_name },
      mobile: {
        country_code: COUNTRY_CONFIG[country].code,
        number: form.phone,
      },
      email: form.email,
      has_property: form.foundProperty === "Yes",
      preferred_city: form.location,
      preferred_contact: form.contact[0]?.toLowerCase() || "whatsapp",
      terms_accepted: form.terms,
      marketing_consent: form.marketing,
      country: COUNTRY_CONFIG[country].fullName,
      status: "submit",
    };

    try {
      const response = await fetch("https://xoto.ae/api/property/lead/create-mortgage-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (response.ok) {
        // 3. Success Toast
        toast.success("Success! Lead Created.");
        setTimeout(() => onClose(), 1500); // Small delay so they see the success toast
      } else {
        toast.error(result.message || "Something went wrong");
      }
    } catch (error) {
      console.error("API Error:", error);
      toast.error("Submission failed. Check internet or CORS.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 overflow-y-auto">
      {/* 4. Toaster component (doesn't affect UI layout) */}
      <Toaster position="top-center" reverseOrder={false} />
      
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* ... Rest of your UI code remains exactly the same ... */}
        <div className="relative w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden text-black max-h-[95vh] md:max-h-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[#f4f1ff] via-white to-[#e9fbff]" />
          <div className="relative bg-white rounded-3xl px-5 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 overflow-y-auto">
            <button onClick={onClose} className="absolute right-4 top-4 sm:right-6 sm:top-6 p-2 rounded-full hover:bg-gray-100">
              <FiX className="text-xl" />
            </button>

            <h2 className="text-xl sm:text-2xl font-bold text-left mb-6 sm:mb-8">Let's get started</h2>

            <div className="space-y-5 sm:space-y-6 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-left mb-1 font-medium">Name <span className="text-red-500">*</span></label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    placeholder="E.g.: John Doe"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-left mb-1 font-medium">Phone number <span className="text-red-500">*</span></label>
                  <div className="flex rounded-xl border border-gray-300 overflow-hidden">
                    <div className="relative flex items-center bg-gray-100 border-r px-2">
                      <img src={COUNTRY_CONFIG[country].flag} className="w-5 mr-1" alt={country} />
                      <select
                        value={country}
                        onChange={(e) => { setCountry(e.target.value); setForm({ ...form, phone: "" }); }}
                        className="bg-transparent pr-6 outline-none appearance-none text-sm"
                      >
                        {Object.keys(COUNTRY_CONFIG).map((c) => (
                          <option key={c} value={c}>{COUNTRY_CONFIG[c].code}</option>
                        ))}
                      </select>
                      <FiChevronDown className="absolute right-1 text-xs opacity-60 pointer-events-none" />
                    </div>
                    <input
                      value={form.phone}
                      onChange={handlePhoneChange}
                      placeholder={`Enter ${COUNTRY_CONFIG[country].digits} digit number`}
                      className="flex-1 px-4 py-3 outline-none"
                      inputMode="numeric"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-left mb-1 font-medium">Email <span className="text-red-500">*</span></label>
                <input
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  placeholder="E.g.: john@gmail.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-left mb-2 font-medium">Have you found a property? <span className="text-red-500">*</span></label>
                <div className="flex gap-6">
                  {["Yes", "No"].map((v) => (
                    <label key={v} className="flex items-center gap-2">
                      <input type="radio" checked={form.foundProperty === v} onChange={() => setForm({ ...form, foundProperty: v })} /> {v}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium">Where is the property located? <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select
                    value={form.location}
                    onChange={(e) => setForm({...form, location: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 appearance-none outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Dubai">Dubai</option>
                    <option value="Abu Dhabi">Abu Dhabi</option>
                    <option value="Sharjah">Sharjah</option>
                  </select>
                  <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-left mb-2 font-medium">How do you prefer to be contacted?</label>
                <div className="flex gap-6 flex-wrap">
                  {["Call", "WhatsApp", "Email"].map((v) => (
                    <label key={v} className="flex items-center gap-2">
                      <input type="checkbox" checked={form.contact.includes(v)} onChange={() => toggleContact(v)} /> {v}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-2">
                  <input type="checkbox" checked={form.marketing} onChange={(e) => setForm({...form, marketing: e.target.checked})} />
                  <span>I agree to receive newsletters and marketing communications.</span>
                </label>
                <label className="flex items-start gap-2">
                  <input type="checkbox" checked={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.checked })} />
                  <span>I accept the <span className="underline">Terms</span> & <span className="underline">Privacy Policy</span> <span className="text-red-500">*</span></span>
                </label>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full mt-4 bg-[#5C039B] hover:bg-purple-800 disabled:bg-gray-400 text-white py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition"
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}