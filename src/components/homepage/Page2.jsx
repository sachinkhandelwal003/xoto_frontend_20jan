  import React, { useState, useEffect, useMemo } from "react";
  import img4 from "../../assets/img/IMG9.png";
  import toast, { Toaster } from "react-hot-toast";
  import { Select } from "antd"; // Ant Design Select
  import { Country, State, City } from "country-state-city"; // Location Package
  import { apiService } from "../../manageApi/utils/custom.apiservice";

  const { Option } = Select;
  const FALLBACK_IMAGE = "/assets/img/fallback-property.jpg";

  // 1. Strict Phone Length Rules
  const PHONE_LENGTH_RULES = {
    "971": 9,  // UAE
    "91": 10,  // India
    "966": 9,  // KSA
    "1": 10,   // US
    "44": 10,  // UK
    "61": 9,   // Australia
  };

  const Page2 = () => {
    const [properties, setProperties] = useState([]);
    const [visibleCount, setVisibleCount] = useState(6);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [loadingProperties, setLoadingProperties] = useState(true);

    const LOAD_STEP = 3;

    // 2. Errors State
    const [errors, setErrors] = useState({});

    // 3. Form State (Added location fields)
    const [formData, setFormData] = useState({
      first_name: "",
      last_name: "",
      email: "",
      country_code: "971", 
      mobile: "",
      occupation: "",
      // Location breakdown
      location_country: null,
      state: null,
      city: null,
      preferred_contact: "whatsapp"
    });

    // 4. Location Data States
    const [countriesList] = useState(Country.getAllCountries());
    const [statesList, setStatesList] = useState([]);
    const [citiesList, setCitiesList] = useState([]);

    // 5. Memoized Phone Country Codes
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

    useEffect(() => {
      const fetchProperties = async () => {
        setLoadingProperties(true);
        try {
          const response = await apiService.get(
            "/property/get-all-properties?page=1&limit=30&isFeatured=false"
          );
          if (response?.success && Array.isArray(response.data)) {
            setProperties(response.data);
          } else {
            toast.error("Unexpected response from server");
          }
        } catch (err) {
          console.error("API Error:", err);
          toast.error("Failed to load properties");
        } finally {
          setLoadingProperties(false);
        }
      };
      fetchProperties();
    }, []);

    const handleLoadMore = () => {
      setVisibleCount((prev) => Math.min(properties.length, prev + LOAD_STEP));
    };

    // --- HANDLERS ---

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    // Phone Handlers
    const handleCountryCodeChange = (value) => {
      const limit = PHONE_LENGTH_RULES[value] || 15;
      setFormData((prev) => ({ ...prev, country_code: value, mobile: prev.mobile.slice(0, limit) }));
    };

    const handlePhoneChange = (e) => {
      const value = e.target.value.replace(/\D/g, "");
      const maxLength = PHONE_LENGTH_RULES[formData.country_code] || 15;
      const validatedValue = value.slice(0, maxLength);
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

    // --- VALIDATION ---
    const validateForm = () => {
      let newErrors = {};
      let isValid = true;

      if (!formData.first_name.trim()) { newErrors.first_name = "First Name is required"; isValid = false; }
      if (!formData.last_name.trim()) { newErrors.last_name = "Last Name is required"; isValid = false; }
      
      if (!formData.email.trim()) { newErrors.email = "Email is required"; isValid = false; }
      else if (!/\S+@\S+\.\S+/.test(formData.email)) { newErrors.email = "Invalid email format"; isValid = false; }

      const requiredLength = PHONE_LENGTH_RULES[formData.country_code];
      if (!formData.mobile.trim()) { newErrors.mobile = "Mobile is required"; isValid = false; }
      else if (requiredLength && formData.mobile.length !== requiredLength) {
        newErrors.mobile = `Enter exactly ${requiredLength} digits`;
        isValid = false;
      }

      if (!formData.occupation.trim()) { newErrors.occupation = "Occupation is required"; isValid = false; }
      
      // Location Validation
      if (!formData.location_country) { newErrors.location_country = "Country is required"; isValid = false; }
      if (!formData.state) { newErrors.state = "State is required"; isValid = false; }
      if (citiesList.length > 0 && !formData.city) { newErrors.city = "City is required"; isValid = false; }

      setErrors(newErrors);
      return isValid;
    };

    // --- SUBMIT ---
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!validateForm()) {
          toast.error("Please fill all fields correctly.");
          return;
      }

      setFormLoading(true);

      // Resolve Location Names
      const countryName = Country.getCountryByCode(formData.location_country)?.name || "";
      const stateName = State.getStateByCodeAndCountry(formData.state, formData.location_country)?.name || formData.state;
      const finalLocationString = `${formData.city || stateName}, ${stateName}, ${countryName}`;

      const payload = {
        type: "schedule_visit",
        name: {
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim()
        },
        mobile: { 
          country_code: formData.country_code,
          number: formData.mobile 
        },
        email: formData.email.toLowerCase().trim(),
        occupation: formData.occupation.trim(),
        location: finalLocationString, // Sending formatted string as API expects
        preferred_contact: formData.preferred_contact
      };

      try {
        const res = await apiService.post("/property/lead", payload);
        if (res.success) {
          toast.success("Visit scheduled! We'll contact you shortly.");
          setIsModalOpen(false);
          setFormData({
            first_name: "", last_name: "", email: "", country_code: "971", mobile: "",
            occupation: "", location_country: null, state: null, city: null, preferred_contact: "whatsapp"
          });
          setErrors({});
        }
      } catch (err) {
        const errorData = err.response?.data;
        let errorMessage = "Failed to schedule visit. Try again.";
        if (Array.isArray(errorData?.errors) && errorData.errors.length > 0) {
          errorMessage = errorData.errors[0].message || errorData.errors[0].msg;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        }
        toast.error(errorMessage);
      } finally {
        setFormLoading(false);
      }
    };

    const displayedProperties = properties.slice(0, visibleCount);

    return (
      <div className="w-full font-dm">
        <Toaster position="top-center" />

        {/* HEADER */}
        <section
          className="relative bg-cover bg-center min-h-[620px] flex items-center justify-center text-white"
          style={{ backgroundImage: `url(${img4})` }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 text-center px-4 max-w-3xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold">
              XOTO Properties
            </h1>
            <p className="mt-4 text-base sm:text-lg leading-relaxed">
              Get in touch with our luxury real estate experts.
              <br />
              We're here to help you with all your property needs.
            </p>
          </div>
          <div className="absolute bottom-0 left-0 w-70 h-10 bg-[var(--color-body)] z-[5] clip-left-shape border-none"></div>
          <div className="absolute bottom-0 right-0 w-70 h-10 bg-[var(--color-body)] z-[5] clip-right-shape border-none"></div>

          <style>{`
            .clip-left-shape { clip-path: polygon(0 0, 55% 0, 100% 100%, 0% 100%); }
            .clip-right-shape { clip-path: polygon(47% 0, 100% 0, 100% 100%, 0% 100%); }
          `}</style>
        </section>

        {/* PROPERTIES */}
        <section className="py-16 bg-[var(--color-body)] flex flex-col items-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl text-black font-semibold mb-10">
            Our Properties
          </h2>

          {loadingProperties ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading properties...</p>
            </div>
          ) : displayedProperties.length === 0 ? (
            <p className="text-center text-gray-600 py-12">No properties found</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-[92%] sm:w-[90%] md:w-[80%]">
              {displayedProperties.map((property) => (
                <div
                  key={property._id}
                  className="bg-white rounded-[22px] shadow-xl border border-gray-200 hover:shadow-2xl transition overflow-hidden"
                >
                  <img
                    src={property.photos?.[0] || property.mainLogo || FALLBACK_IMAGE}
                    alt={property.propertyName}
                    className="w-full h-[220px] object-cover"
                    onError={(e) => (e.target.src = FALLBACK_IMAGE)}
                  />
                  <div className="p-5 bg-gradient-to-b from-white to-[#f5f1ff]">
                    <h3 className="text-xl font-semibold">{property.propertyName || "Luxury Property"}</h3>
                    <p className="text-[#7800C8] font-bold text-lg mt-1">
                      {property.currency || "AED"} {Number(property.price)?.toLocaleString() || "Price on Request"}
                    </p>
                    <p className="text-gray-600 text-sm mt-2">{property.area || "Dubai Marina"}</p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="w-full mt-6 py-3 bg-[var(--color-primary)] hover:bg-white hover:text-[#5C039B] border-2 border-transparent hover:border-[#5C039B] text-white font-medium rounded-md transition"
                    >
                      Schedule Visit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {visibleCount < properties.length && !loadingProperties && (
            <button
              onClick={handleLoadMore}
              className="mt-12 px-10 py-3 rounded-md bg-[#5C039B] text-white font-medium hover:bg-[#4b0281] transition"
            >
              Load More
            </button>
          )}
        </section>

        {/* MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
            <div className="relative w-full max-w-2xl bg-gradient-to-br from-white via-purple-50 to-violet-50 rounded-3xl shadow-2xl overflow-hidden border border-purple-100">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 z-20 bg-gradient-to-r from-red-500 to-pink-500 text-white w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="bg-gradient-to-r from-purple-600 to-violet-600 p-8 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  Schedule Property Visit
                </h2>
                <p className="text-purple-100 text-lg font-medium">
                  Fill in your details and we'll arrange a private viewing for you!
                </p>
              </div>

              <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <input
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        placeholder="First Name"
                        className={`premium-input pl-12 ${errors.first_name ? 'border-red-500 bg-red-50' : ''}`}
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      </div>
                      {errors.first_name && <p className="text-red-500 text-xs mt-1 absolute">{errors.first_name}</p>}
                    </div>

                    <div className="relative">
                      <input
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        placeholder="Last Name"
                        className={`premium-input pl-12 ${errors.last_name ? 'border-red-500 bg-red-50' : ''}`}
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      </div>
                      {errors.last_name && <p className="text-red-500 text-xs mt-1 absolute">{errors.last_name}</p>}
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Your Email Address"
                      className={`premium-input pl-12 ${errors.email ? 'border-red-500 bg-red-50' : ''}`}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1 absolute">{errors.email}</p>}
                  </div>

                  {/* MOBILE INPUT WITH FLAGS */}
                  <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative w-full sm:w-[140px] flex-shrink-0 h-[50px]">
                          <Select
                              value={formData.country_code}
                              onChange={handleCountryCodeChange}
                              showSearch
                              optionFilterProp="children"
                              filterOption={(input, option) => 
                                  option.children.props?.children[1]?.props?.children[1]?.toLowerCase().includes(input.toLowerCase()) || 
                                  option.value.includes(input)
                              }
                              className="w-full h-full custom-select-page2"
                              style={{ width: '100%' }}
                              dropdownMatchSelectWidth={300}
                          >
                              {phoneCountryOptions.map((item) => (
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
                          <input
                          name="mobile"
                          type="text"
                          inputMode="numeric"
                          value={formData.mobile}
                          onChange={handlePhoneChange}
                          placeholder="Phone Number"
                          className={`premium-input pl-12 h-[50px] ${errors.mobile ? 'border-red-500 bg-red-50' : ''}`}
                          />
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                          </div>
                          {errors.mobile && <p className="text-red-500 text-xs mt-1 absolute bottom-[-18px]">{errors.mobile}</p>}
                      </div>
                  </div>

                  <div className="relative">
                    <input
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleChange}
                      placeholder="Your Occupation"
                      className={`premium-input pl-12 ${errors.occupation ? 'border-red-500 bg-red-50' : ''}`}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    {errors.occupation && <p className="text-red-500 text-xs mt-1 absolute">{errors.occupation}</p>}
                  </div>

                  {/* LOCATION DROPDOWNS (Replaces old text input) */}
                  <div className="space-y-4">
                      {/* Country Select */}
                      <div className="relative">
                          <Select
                              placeholder="Select Country"
                              showSearch
                              optionFilterProp="children"
                              onChange={handleLocationCountryChange}
                              filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                              className={`w-full custom-select-page2 ${errors.location_country ? "border-red-500 rounded-[0.75rem]" : ""}`}
                              dropdownMatchSelectWidth={false}
                          >
                              {countriesList.map((country) => (
                                  <Option key={country.isoCode} value={country.isoCode}>{country.name}</Option>
                              ))}
                          </Select>
                          {errors.location_country && <p className="text-red-500 text-xs mt-1 absolute">{errors.location_country}</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* State Select */}
                          <div className="relative">
                              <Select
                                  placeholder="Select State"
                                  showSearch
                                  optionFilterProp="children"
                                  onChange={handleLocationStateChange}
                                  disabled={!statesList.length}
                                  filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                                  className={`w-full custom-select-page2 ${errors.state ? "border-red-500 rounded-[0.75rem]" : ""}`}
                              >
                                  {statesList.map((state) => (
                                      <Option key={state.isoCode} value={state.isoCode}>{state.name}</Option>
                                  ))}
                              </Select>
                              {errors.state && <p className="text-red-500 text-xs mt-1 absolute">{errors.state}</p>}
                          </div>

                          {/* City Select */}
                          <div className="relative">
                              <Select
                                  placeholder="Select City"
                                  showSearch
                                  optionFilterProp="children"
                                  onChange={handleLocationCityChange}
                                  disabled={!citiesList.length}
                                  filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                                  className={`w-full custom-select-page2 ${errors.city ? "border-red-500 rounded-[0.75rem]" : ""}`}
                              >
                                  {citiesList.map((city) => (
                                      <Option key={city.name} value={city.name}>{city.name}</Option>
                                  ))}
                              </Select>
                              {errors.city && <p className="text-red-500 text-xs mt-1 absolute">{errors.city}</p>}
                          </div>
                      </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-2xl border border-purple-100">
                    <p className="text-purple-800 font-bold text-lg mb-4 text-center">How should we contact you?</p>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { value: "call", label: "Phone Call", icon: "📞" },
                        { value: "whatsapp", label: "WhatsApp", icon: "💬" },
                        { value: "email", label: "Email", icon: "✉️" }
                      ].map(({ value, label, icon }) => (
                        <label key={value} className="relative">
                          <input
                            type="radio"
                            name="preferred_contact"
                            value={value}
                            checked={formData.preferred_contact === value}
                            onChange={handleChange}
                            className="sr-only peer"
                          />
                          <div className="p-4 rounded-xl border-2 border-purple-200 bg-white cursor-pointer transition-all duration-300 hover:border-purple-400 hover:shadow-md peer-checked:border-purple-600 peer-checked:bg-gradient-to-r peer-checked:from-purple-50 peer-checked:to-violet-50 peer-checked:shadow-lg">
                            <div className="flex flex-col items-center gap-2">
                              <div className={`text-2xl ${formData.preferred_contact === value ? 'text-purple-600' : 'text-purple-400'}`}>
                                {icon}
                              </div>
                              <span className="text-sm font-medium text-purple-800">{label}</span>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={formLoading}
                    className="group w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white py-5 rounded-xl text-lg font-bold hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-violet-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative flex items-center justify-center gap-3">
                      {formLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Scheduling Visit...
                        </>
                      ) : (
                        <>
                          Schedule Property Visit
                          <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </>
                      )}
                    </span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        <style>{`
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
            border-color: #8b5cf6;
            box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
            transform: translateY(-1px);
          }
          .custom-scrollbar::-webkit-scrollbar { width: 8px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #8b5cf6, #7c3aed); border-radius: 4px; }
          
          /* Antd Select Styles */
          .custom-select-page2 .ant-select-selector {
            border-radius: 0.75rem !important; 
            border: 2px solid #e2e8f0 !important; 
            height: 100% !important;
            min-height: 50px !important; 
            display: flex !important;
            align-items: center !important;
            padding-left: 8px !important;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
          }
          .custom-select-page2 .ant-select-selector:hover {
            border-color: #8b5cf6 !important;
          }
          .custom-select-page2.ant-select-focused .ant-select-selector {
            border-color: #8b5cf6 !important;
            box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1) !important;
          }
        `}</style>
      </div>
    );
  };

  export default Page2;