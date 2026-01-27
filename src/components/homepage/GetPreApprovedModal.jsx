import { useState, useMemo } from "react";
import { FiX, FiChevronDown } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import { Select } from "antd"; 
import { Country, State, City } from "country-state-city"; 

const { Option } = Select;

// 1. Strict Phone Length Rules
const PHONE_LENGTH_RULES = {
  "971": 9,  // UAE
  "91": 10,  // India
  "966": 9,  // KSA
  "1": 10,   // US
  "44": 10,  // UK
  "61": 9,   // Australia
};

export default function GetPreApprovedModal({ open, onClose }) {
  const [loading, setLoading] = useState(false);
  
  // 2. Errors State
  const [errors, setErrors] = useState({});

  // 3. Form State
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    foundProperty: "No",
    contact: [],
    marketing: false,
    terms: false,
    country_code: "971", 
    location_country: null, 
    state: null,           
    city: null             
  });

  // 4. Location Data States
  const [countriesList] = useState(Country.getAllCountries());
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);

  // 5. Memoized Country Options for Phone Code
  const phoneCountryOptions = useMemo(() => {
    const priorityIsoCodes = ["AE", "IN", "SA", "US", "GB", "AU"];
    return Country.getAllCountries().map((country) => ({
      name: country.name,
      code: country.phonecode,
      iso: country.isoCode,
    })).sort((a, b) => {
      const aPriority = priorityIsoCodes.includes(a.iso);
      const bPriority = priorityIsoCodes.includes(b.iso);
      if (aPriority && !bPriority) return -1;
      if (!aPriority && bPriority) return 1;
      return a.name.localeCompare(b.name);
    });
  }, []);

  if (!open) return null;

  // --- HANDLERS ---

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleCountryCodeChange = (value) => {
    const limit = PHONE_LENGTH_RULES[value] || 15;
    setForm((prev) => ({ ...prev, country_code: value, phone: prev.phone.slice(0, limit) }));
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    const maxLength = PHONE_LENGTH_RULES[form.country_code] || 15;
    const validatedValue = value.slice(0, maxLength);
    setForm((prev) => ({ ...prev, phone: validatedValue }));
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
  };

  // Location Cascade Handlers
  const handleLocationCountryChange = (isoCode) => {
    const updatedStates = State.getStatesOfCountry(isoCode);
    setStatesList(updatedStates);
    setCitiesList([]);
    setForm((prev) => ({ ...prev, location_country: isoCode, state: null, city: null }));
    if (errors.location_country) setErrors((prev) => ({ ...prev, location_country: "" }));
  };

  const handleLocationStateChange = (stateCode) => {
    const updatedCities = City.getCitiesOfState(form.location_country, stateCode);
    setCitiesList(updatedCities);
    setForm((prev) => ({ ...prev, state: stateCode, city: null }));
    if (errors.state) setErrors((prev) => ({ ...prev, state: "" }));
  };

  const handleLocationCityChange = (cityName) => {
    setForm((prev) => ({ ...prev, city: cityName }));
    if (errors.city) setErrors((prev) => ({ ...prev, city: "" }));
  };

  const toggleContact = (v) => {
    setForm((p) => ({
      ...p, contact: p.contact.includes(v) ? p.contact.filter((x) => x !== v) : [...p.contact, v],
    }));
  };

  // --- VALIDATION ---
  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    if (!form.name.trim()) { newErrors.name = "Full Name is required"; isValid = false; }
    
    if (!form.email.trim()) { newErrors.email = "Email is required"; isValid = false; }
    else if (!/\S+@\S+\.\S+/.test(form.email)) { newErrors.email = "Invalid email format"; isValid = false; }

    const requiredLength = PHONE_LENGTH_RULES[form.country_code];
    if (!form.phone.trim()) { newErrors.phone = "Phone is required"; isValid = false; }
    else if (requiredLength && form.phone.length !== requiredLength) {
      newErrors.phone = `Enter exactly ${requiredLength} digits`;
      isValid = false;
    }

    if (!form.location_country) { newErrors.location_country = "Country is required"; isValid = false; }
    if (!form.state) { newErrors.state = "State is required"; isValid = false; }
    if (citiesList.length > 0 && !form.city) { newErrors.city = "City is required"; isValid = false; }

    if (!form.terms) { toast.error("Please accept the Terms & Privacy Policy"); isValid = false; }

    setErrors(newErrors);
    return isValid;
  };

  // --- SUBMIT ---
  const handleSubmit = async () => {
    if (!validateForm()) return;

    const submittedEmails = JSON.parse(localStorage.getItem("submitted_leads") || "[]");
    if (submittedEmails.includes(form.email.toLowerCase().trim())) {
      toast.error("You have already submitted a request recently.");
      return;
    }

    setLoading(true);

    const nameParts = form.name.trim().split(/\s+/);
    const first_name = nameParts[0];
    const last_name = nameParts.length > 1 ? nameParts.slice(1).join(" ") : first_name;

    const selectedCountryData = Country.getCountryByCode(form.location_country);
    const countryName = selectedCountryData ? selectedCountryData.name : "";
    
    const selectedStateData = State.getStateByCodeAndCountry(form.state, form.location_country);
    const stateName = selectedStateData ? selectedStateData.name : form.state;

    const payload = {
      type: "mortgage",
      lead_sub_type: "pre_approval",
      name: { first_name, last_name },
      mobile: { country_code: form.country_code, number: form.phone },
      email: form.email.toLowerCase().trim(),
      has_property: form.foundProperty === "Yes",
      country: countryName,
      state: stateName,
      city: form.city, 
      preferred_city: form.city || stateName, 
      preferred_contact: form.contact[0]?.toLowerCase() || "whatsapp",
      terms_accepted: form.terms,
      marketing_consent: form.marketing,
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
        const updatedEmails = [...submittedEmails, form.email.toLowerCase().trim()];
        localStorage.setItem("submitted_leads", JSON.stringify(updatedEmails));
        toast.success("Success! Lead Created.");
        
        // --- DATA RESET LOGIC ---
        setForm({
          name: "", phone: "", email: "", foundProperty: "No", contact: [],
          marketing: false, terms: false, country_code: "971", 
          location_country: null, state: null, city: null 
        });

        setTimeout(() => onClose(), 1500);
      } else {
        let errorMessage = "Something went wrong";
        if (result.errors && Array.isArray(result.errors) && result.errors.length > 0) {
           errorMessage = result.errors[0].message || result.errors[0].msg;
        } else if (result.message) {
           errorMessage = result.message;
        }
        
        if (response.status === 400 && errorMessage.toLowerCase().includes("already")) {
           toast.error("You already have created a lead within last 30 days.");
        } else {
           toast.error(errorMessage);
        }
      }
    } catch (error) {
      console.error("API Error:", error);
      toast.error("Submission failed. Check internet connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 overflow-y-auto">
      <Toaster position="top-center" reverseOrder={false} />
      
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden text-black max-h-[95vh] md:max-h-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[#f4f1ff] via-white to-[#e9fbff]" />
          <div className="relative bg-white rounded-3xl px-5 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 overflow-y-auto">
            <button onClick={onClose} className="absolute right-4 top-4 sm:right-6 sm:top-6 p-2 rounded-full hover:bg-gray-100">
              <FiX className="text-xl" />
            </button>

            <h2 className="text-xl sm:text-2xl font-bold text-left mb-6 sm:mb-8">Let's get started</h2>

            <div className="space-y-5 sm:space-y-6 text-sm">
              
              {/* Name & Phone Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-left mb-1 font-medium"> Full Name <span className="text-red-500">*</span></label>
                  <input
                    value={form.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="E.g.: John Doe"
                    className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-purple-500 ${errors.name ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-left mb-1 font-medium">Phone number <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    <div className="w-[110px] sm:w-[130px] flex-shrink-0">
                      <Select
                        value={form.country_code}
                        onChange={handleCountryCodeChange}
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) => 
                          option.children.props?.children[1]?.props?.children[1]?.toLowerCase().includes(input.toLowerCase()) || 
                          option.value.includes(input)
                        }
                        className="w-full custom-select-modal"
                        style={{ width: '100%' }}
                        dropdownMatchSelectWidth={300}
                      >
                        {phoneCountryOptions.map((item) => (
                          <Option key={item.iso} value={item.code}>
                            <div className="flex items-center">
                              <img 
                                src={`https://flagcdn.com/w20/${item.iso.toLowerCase()}.png`} 
                                srcSet={`https://flagcdn.com/w40/${item.iso.toLowerCase()}.png 2x`} 
                                width="20" alt={item.name} 
                                style={{ marginRight: 8, borderRadius: 2, objectFit: 'cover' }} 
                              />
                              <span>+{item.code}</span>
                            </div>
                          </Option>
                        ))}
                      </Select>
                    </div>
                    <div className="flex-1">
                      <input
                        value={form.phone}
                        onChange={handlePhoneChange}
                        placeholder="Mobile Number"
                        className={`w-full px-4 py-3 h-[46px] rounded-xl border outline-none focus:ring-2 focus:ring-purple-500 ${errors.phone ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                        inputMode="numeric"
                      />
                    </div>
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-left mb-1 font-medium">Email <span className="text-red-500">*</span></label>
                <input
                  value={form.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="E.g.: john@gmail.com"
                  className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-purple-500 ${errors.email ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* LOCATION SECTION */}
              <div>
                 <label className="block text-left mb-2 font-medium">Property Location <span className="text-red-500">*</span></label>
                 <div className="space-y-4">
                    <div>
                      <Select
                        placeholder="Select Country"
                        showSearch
                        optionFilterProp="children"
                        onChange={handleLocationCountryChange}
                        className={`w-full custom-select-modal ${errors.location_country ? "border-red-500" : ""}`}
                        style={{ width: '100%' }}
                        filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                      >
                        {countriesList.map((country) => (
                          <Option key={country.isoCode} value={country.isoCode}>{country.name}</Option>
                        ))}
                      </Select>
                      {errors.location_country && <p className="text-red-500 text-xs mt-1">{errors.location_country}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Select
                            placeholder="State / Region"
                            showSearch
                            optionFilterProp="children"
                            onChange={handleLocationStateChange}
                            disabled={!statesList.length}
                            className={`w-full custom-select-modal ${errors.state ? "border-red-500" : ""}`}
                            style={{ width: '100%' }}
                            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                          >
                            {statesList.map((state) => (
                              <Option key={state.isoCode} value={state.isoCode}>{state.name}</Option>
                            ))}
                          </Select>
                          {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                        </div>

                        <div>
                          <Select
                            placeholder="City"
                            showSearch
                            optionFilterProp="children"
                            onChange={handleLocationCityChange}
                            disabled={!citiesList.length}
                            className={`w-full custom-select-modal ${errors.city ? "border-red-500" : ""}`}
                            style={{ width: '100%' }}
                            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                          >
                            {citiesList.map((city) => (
                              <Option key={city.name} value={city.name}>{city.name}</Option>
                            ))}
                          </Select>
                          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                        </div>
                    </div>
                 </div>
              </div>

              <div>
                <label className="block text-left mb-2 font-medium">Have you found a property? <span className="text-red-500">*</span></label>
                <div className="flex gap-6">
                  {["Yes", "No"].map((v) => (
                    <label key={v} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={form.foundProperty === v} onChange={() => setForm({ ...form, foundProperty: v })} /> {v}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-left mb-2 font-medium">How do you prefer to be contacted?</label>
                <div className="flex gap-6 flex-wrap">
                  {["Call", "WhatsApp", "Email"].map((v) => (
                    <label key={v} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.contact.includes(v)} onChange={() => toggleContact(v)} /> {v}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.marketing} onChange={(e) => setForm({...form, marketing: e.target.checked})} />
                  <span>I agree to receive newsletters and marketing communications.</span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
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

      <style jsx global>{`
        .custom-select-modal .ant-select-selector {
          border-radius: 0.75rem !important; 
          border-color: #d1d5db !important; 
          height: 46px !important;
          padding-top: 6px !important;
        }
        .custom-select-modal .ant-select-selector:hover {
          border-color: #a855f7 !important; 
        }
        .custom-select-modal.ant-select-focused .ant-select-selector {
          border-color: #a855f7 !important;
          box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.2) !important;
        }
      `}</style>
    </div>
  );
}