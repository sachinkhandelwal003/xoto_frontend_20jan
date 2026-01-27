import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Check, ChevronDown, X, AlertCircle, Loader2, AlertTriangle, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = "https://xoto.ae"; 

// --- COUNTRY CODES ---
const countryCodes = [
  { code: "+971", flag: "🇦🇪", name: "UAE", maxDigits: 9 }, 
  { code: "+91", flag: "🇮🇳", name: "India", maxDigits: 10 },
  { code: "+1", flag: "🇺🇸", name: "USA", maxDigits: 10 },
  { code: "+44", flag: "🇬🇧", name: "UK", maxDigits: 10 },
  { code: "+966", flag: "🇸🇦", name: "KSA", maxDigits: 9 },
  { code: "+974", flag: "🇶🇦", name: "Qatar", maxDigits: 8 },
  { code: "+973", flag: "🇧🇭", name: "Bahrain", maxDigits: 8 },
  { code: "+965", flag: "🇰🇼", name: "Kuwait", maxDigits: 8 },
  { code: "+968", flag: "🇴🇲", name: "Oman", maxDigits: 8 },
  { code: "+61", flag: "🇦🇺", name: "Australia", maxDigits: 9 },
  { code: "+1", flag: "🇨🇦", name: "Canada", maxDigits: 10 },
];

// --- TOAST COMPONENT ---
const Toast = ({ message, type, onClose }) => {
    useEffect(() => { const timer = setTimeout(onClose, 5000); return () => clearTimeout(timer); }, [onClose]);
    const styles = type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800';
    const icon = type === 'error' ? <AlertTriangle size={20} className="text-red-600 mt-0.5 flex-shrink-0" /> : <Check size={20} className="text-green-600 mt-0.5 flex-shrink-0" />;
    return (
        <div className={`fixed top-6 right-6 z-50 flex items-start p-4 mb-4 border rounded-lg shadow-xl ${styles}`} style={{ maxWidth: '350px', width: '100%' }}>
            <div className="mr-3">{icon}</div>
            <div className="flex-1"><p className="text-sm font-semibold leading-snug break-words">{message}</p></div>
            <button onClick={onClose} type="button" className="ml-3 rounded-lg p-1.5 hover:bg-black/5 inline-flex h-8 w-8 items-center justify-center"><X size={16} /></button>
        </div>
    );
};

// --- HERO SECTION ---
const HeroSection = ({ step }) => {
    let title = "The right mortgage for your property!";
    if (step === 2) title = "Let's get to know you!";
    if (step === 3) title = "You are almost done!";
    return (
      <div className="hidden lg:flex flex-col w-5/12 bg-gray-50 p-12 justify-center sticky top-0 h-screen overflow-hidden">
        <div className="max-w-md mx-auto w-full z-10">
          <h1 className="text-5xl font-extrabold text-gray-900 leading-[1.15] mb-12 tracking-tight">{title}</h1>
          <div className="relative w-full aspect-square bg-[#F0F0F0] rounded-[3rem] flex items-center justify-center shadow-inner">
             <div className="relative w-48 h-80 bg-white rounded-[2.5rem] border-[6px] border-gray-800 shadow-2xl transform -rotate-12 flex flex-col items-center pt-4 overflow-hidden z-20">
                <div className="w-16 h-4 bg-gray-100 rounded-full mb-4"></div>
                <div className="w-full px-4 space-y-3">
                    <div className="h-2 w-full bg-gray-100 rounded"></div>
                    <div className="h-8 w-full bg-blue-50 rounded border border-blue-100"></div>
                    <div className="h-2 w-2/3 bg-gray-100 rounded"></div>
                    <div className="h-8 w-full bg-gray-50 rounded border border-gray-100"></div>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
};

// --- PROGRESS BAR ---
const ProgressBar = ({ currentStep, percentages }) => {
    const renderBar = (stepIndex) => {
        let width = 0;
        if (currentStep > stepIndex) width = 100;
        else if (currentStep === stepIndex) width = percentages[stepIndex] || 0;
        
        return (
            <div className="h-1.5 flex-1 rounded-full bg-gray-200 overflow-hidden">
                <div className="h-full bg-black transition-all duration-500 ease-out" style={{ width: `${width}%` }}></div>
            </div>
        );
    };

    return (
        <div className="flex space-x-3 mb-8 w-full max-w-3xl">
            {renderBar(1)}
            {renderBar(2)}
            {renderBar(3)}
        </div>
    );
};

// --- INPUT COMPONENTS ---
const RadioCard = ({ label, name, value, checked, onChange, width = "w-full" }) => (
    <label className={`cursor-pointer border rounded-md px-4 py-3.5 flex items-center justify-between transition-all bg-white hover:border-gray-400 ${checked ? 'border-black ring-1 ring-black' : 'border-gray-300'} ${width}`}>
      <span className="text-base text-gray-800 font-normal">{label}</span>
      <input type="radio" name={name} className="hidden" checked={checked} onChange={() => onChange(value)} />
      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${checked ? 'border-black' : 'border-gray-300'}`}>
        {checked && <div className="w-2.5 h-2.5 bg-black rounded-full"></div>}
      </div>
    </label>
);

const ErrorMsg = ({ msg }) => ( msg ? <p className="text-red-500 text-sm mt-1 flex items-center"><AlertCircle size={14} className="mr-1"/> {msg}</p> : null );

const SuffixInput = ({ label, value, onChange, placeholder, suffix, error }) => (
    <div className="w-full">
      <label className="block text-lg font-bold text-gray-900 mb-3">{label}</label>
      <div className={`flex items-center border rounded-md overflow-hidden transition-all bg-white ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black'}`}>
        <input type="number" className="flex-1 px-4 py-3.5 outline-none text-gray-900 placeholder-gray-400 w-full" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
        {suffix && <div className="bg-white border-l border-gray-300 px-4 py-3 text-gray-500 text-sm font-medium tracking-wide">{suffix}</div>}
      </div>
      {error && <p className="text-red-500 text-sm mt-1 flex items-center"><AlertCircle size={14} className="mr-1"/> {error}</p>}
    </div>
);

const TextInput = ({ label, value, onChange, placeholder, error }) => (
    <div className="w-full">
      {label && <label className="block text-lg font-bold text-gray-900 mb-3">{label}</label>}
      <input type="text" className={`w-full px-4 py-3.5 border rounded-md outline-none transition-all placeholder-gray-400 ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus:ring-1 focus:ring-black focus:border-black'}`} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
       {error && <p className="text-red-500 text-sm mt-1 flex items-center"><AlertCircle size={14} className="mr-1"/> {error}</p>}
    </div>
);

const SelectInput = ({ label, value, onChange, options, placeholder, error }) => (
    <div className="w-full">
      <label className="block text-lg font-bold text-gray-900 mb-3">{label}</label>
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)} className={`w-full appearance-none border rounded-md px-4 py-3.5 outline-none bg-white text-gray-900 transition-all ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus:border-black focus:ring-1 focus:ring-black'}`}>
            <option value="" disabled>{placeholder}</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none"><ChevronDown className="w-4 h-4 text-gray-500" /></div>
      </div>
      {error && <p className="text-red-500 text-sm mt-1 flex items-center"><AlertCircle size={14} className="mr-1"/> {error}</p>}
    </div>
);

// --- LOCATION AUTOCOMPLETE ---
const LocationAutocomplete = ({ value, onChange, error }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [allLocations, setAllLocations] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const wrapperRef = useRef(null);

    const fallbackLocations = [ "Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain", "Al Ain", "Downtown Dubai", "Dubai Marina", "Palm Jumeirah" ];

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await fetch(`${BASE_URL}/api/mortgages/get-all-uae-states`);
                if (!response.ok) throw new Error("Network response was not ok");
                const result = await response.json();
                let locationData = [];
                if (Array.isArray(result)) locationData = result;
                else if (result.data && Array.isArray(result.data)) locationData = result.data;

                const mappedLocations = locationData.map(item => {
                    if (typeof item === 'string') return item;
                    return item.name || item.state_name || item.city_name || item.value || null;
                }).filter(Boolean);

                setAllLocations(mappedLocations.length > 0 ? mappedLocations : fallbackLocations);
            } catch (err) { setAllLocations(fallbackLocations); }
        };
        fetchLocations();
        const handleClickOutside = (event) => { if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setShowDropdown(false); };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleInputChange = (e) => {
        const userInput = e.target.value;
        onChange(userInput);
        if (userInput.length > 0) {
            const filtered = allLocations.filter(loc => loc.toLowerCase().includes(userInput.toLowerCase()));
            setSuggestions(filtered);
            setShowDropdown(true);
        } else { setShowDropdown(false); }
    };

    const handleSelect = (loc) => { onChange(loc); setShowDropdown(false); };

    return (
        <div className="w-full relative" ref={wrapperRef}>
             <label className="block text-xl font-bold text-gray-900 mb-4">Where is the property located?</label>
             <div className="relative">
                <input type="text" className={`w-full px-4 py-3.5 border rounded-md outline-none transition-all placeholder-gray-400 ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus:ring-1 focus:ring-black focus:border-black'}`} placeholder="Search by area (e.g., Dubai Marina)" value={value} onChange={handleInputChange} onFocus={() => value && setShowDropdown(true)}/>
                <div className="absolute right-3 top-3.5 text-gray-400"><MapPin size={20} /></div>
             </div>
             {showDropdown && suggestions.length > 0 && (
                 <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                     {suggestions.map((loc, index) => (<div key={index} onClick={() => handleSelect(loc)} className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-gray-700 font-medium transition-colors border-b border-gray-100 last:border-0">{loc}</div>))}
                 </div>
             )}
             {showDropdown && suggestions.length === 0 && value && (<div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4 text-sm text-gray-500">No locations found.</div>)}
             {error && <p className="text-red-500 text-sm mt-1 flex items-center"><AlertCircle size={14} className="mr-1"/> {error}</p>}
        </div>
    );
};

// --- STEP COMPONENTS ---
const Step1 = ({ formData, handleChange, errors }) => (
  <div className="space-y-7 animate-fade-in">
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-4">What would you like to do?</h3>
      <div className="flex flex-col sm:flex-row gap-4">
        <RadioCard label="I want to buy a home" name="intent" value="buy" checked={formData.intent === 'buy'} onChange={(val) => handleChange('intent', val)} />
        <RadioCard label="I want to refinance" name="intent" value="refinance" checked={formData.intent === 'refinance'} onChange={(val) => handleChange('intent', val)} />
      </div>
      <ErrorMsg msg={errors.intent} />
    </div>

    {formData.intent === 'buy' && (
      <>
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Have you found a property yet?</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <RadioCard label="Yes" name="propFound" value="yes" checked={formData.propertyFound === 'yes'} onChange={(val) => handleChange('propertyFound', val)} />
            <RadioCard label="No" name="propFound" value="no" checked={formData.propertyFound === 'no'} onChange={(val) => handleChange('propertyFound', val)} />
          </div>
          <ErrorMsg msg={errors.propertyFound} />
        </div>
        <SuffixInput label={formData.propertyFound === 'yes' ? "What is the property price?" : "What's your budget?"} placeholder="0" suffix="AED" value={formData.propertyPrice} onChange={(val) => handleChange('propertyPrice', val)} error={errors.propertyPrice} />
        <LocationAutocomplete value={formData.location} onChange={(val) => handleChange('location', val)} error={errors.location} />
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Do you already have a mortgage?</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <RadioCard label="Yes" name="hasMort" value="yes" checked={formData.hasMortgage === 'yes'} onChange={(val) => handleChange('hasMortgage', val)} />
            <RadioCard label="No" name="hasMort" value="no" checked={formData.hasMortgage === 'no'} onChange={(val) => handleChange('hasMortgage', val)} />
          </div>
          <ErrorMsg msg={errors.hasMortgage} />
        </div>
      </>
    )}

    {formData.intent === 'refinance' && (
      <>
          <SelectInput label="Which bank is your mortgage with?" placeholder="Select Bank" value={formData.bankName} onChange={(val) => handleChange('bankName', val)} options={["Abu Dhabi Commercial Bank", "Emirates NBD", "Dubai Islamic Bank", "FAB", "Mashreq"]} error={errors.bankName} />
          <SuffixInput label="What's your home worth today?" placeholder="0" suffix="AED" value={formData.homeValue} onChange={(val) => handleChange('homeValue', val)} error={errors.homeValue} />
          <SuffixInput label="How much is left on your loan?" placeholder="0" suffix="AED" value={formData.loanBalance} onChange={(val) => handleChange('loanBalance', val)} error={errors.loanBalance} />
      </>
    )}
  </div>
);

const Step2 = ({ formData, handleChange, errors }) => (
  <div className="space-y-7 animate-fade-in">
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-4">What is your residency status?</h3>
      <div className="flex flex-col gap-3">
          <div className='flex flex-col sm:flex-row gap-3'>
              <RadioCard label="UAE Resident (expat)" name="residency" value="uae-resident" checked={formData.residency === 'uae-resident'} onChange={(val) => handleChange('residency', val)} />
              <RadioCard label="UAE National" name="residency" value="uae-national" checked={formData.residency === 'uae-national'} onChange={(val) => handleChange('residency', val)} />
          </div>
          <RadioCard label="Non-resident" name="residency" value="non-resident" checked={formData.residency === 'non-resident'} onChange={(val) => handleChange('residency', val)} />
      </div>
      <ErrorMsg msg={errors.residency} />
    </div>
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-4">What is your employment type?</h3>
      <div className="flex flex-col sm:flex-row gap-4">
        <RadioCard label="Salaried" name="employment" value="salaried" checked={formData.employment === 'salaried'} onChange={(val) => handleChange('employment', val)} />
        <RadioCard label="Self-employed" name="employment" value="self-employed" checked={formData.employment === 'self-employed'} onChange={(val) => handleChange('employment', val)} />
      </div>
      <ErrorMsg msg={errors.employment} />
    </div>
    <SuffixInput label="What is your monthly income?" placeholder="77,777" suffix="AED" value={formData.income} onChange={(val) => handleChange('income', val)} error={errors.income} />
    <SuffixInput label="What is your age?" placeholder="30" suffix="YEARS" value={formData.age} onChange={(val) => handleChange('age', val)} error={errors.age} />
  </div>
);

const Step3 = ({ formData, handleChange, errors }) => {
  const selectedCountry = countryCodes.find(c => c.code === formData.countryCode) || countryCodes[0];
  const placeholder = "0".repeat(selectedCountry.maxDigits).replace(/(.{3})/g, '$1 ').trim();

  return (
    <div className="space-y-7 animate-fade-in">
      <div className="bg-white rounded-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">One step left before you view your mortgage options</h3>
          <div className="mb-6"><label className="block text-base font-semibold text-gray-800 mb-2">Full Name</label><TextInput placeholder="Enter your full name" value={formData.fullName} onChange={(val) => handleChange('fullName', val)} error={errors.fullName} /></div>
          <div className="mb-6"><label className="block text-base font-semibold text-gray-800 mb-2">Email Address</label><TextInput placeholder="Enter your email address" value={formData.email} onChange={(val) => handleChange('email', val)} error={errors.email} /></div>
          <div className="mb-8"><label className="block text-base font-semibold text-gray-800 mb-2">Phone Number</label><div className={`flex border rounded-md overflow-hidden bg-white transition-all ${errors.phone ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus-within:ring-1 focus-within:ring-black focus-within:border-black'}`}><div className="bg-white border-r border-gray-300 flex items-center min-w-[100px] hover:bg-gray-50 relative"><select value={formData.countryCode} onChange={(e) => handleChange('countryCode', e.target.value)} className="appearance-none bg-transparent w-full py-3.5 pl-3 pr-8 outline-none text-gray-900 font-medium cursor-pointer z-10">{countryCodes.map((country) => (<option key={country.code} value={country.code}>{country.flag} {country.code}</option>))}</select><ChevronDown size={14} className="text-gray-500 absolute right-2 z-0" /></div><input type="number" className="flex-1 px-4 py-3.5 outline-none text-gray-900 w-full" placeholder={placeholder} value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} /></div>{errors.phone && <p className="text-red-500 text-sm mt-1 flex items-center"><AlertCircle size={14} className="mr-1"/> {errors.phone}</p>}</div>
          <p className="text-gray-500 leading-relaxed text-sm">While we review your details, feel free to explore your dashboard and check out different mortgage options tailored for you!</p>
      </div>
    </div>
  );
};
 
// --- Modal Component ---
const SuccessModal = ({ email, navigate }) => {
  useEffect(() => {
      const timer = setTimeout(() => {
          navigate('/mortgages-product');
      }, 5000);
      return () => clearTimeout(timer);
  }, [navigate]);

  const handleContinue = () => {
      navigate('/mortgages-product');
  };

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full text-center shadow-2xl relative">
              <button onClick={handleContinue} className="absolute top-4 right-4 text-gray-400 hover:text-black">
                  <X size={20} />
              </button>
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-6 mx-auto shadow-xl">
                  <Check className="text-white w-8 h-8" strokeWidth={3} />
              </div>
              <p className="text-gray-500 mb-3 text-lg">Congratulations</p>
              <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Thank you! Your application has been submitted successfully!</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                  We have created your account, and the password has been sent to your registered email.
              </p>
              <div className="bg-gray-100 px-6 py-4 rounded-lg w-full flex items-center justify-center space-x-3 mb-8">
                  <div className="text-gray-500 text-xl">✉️</div>
                  <span className="text-gray-900 font-medium text-lg">{email || "yourname@example.com"}</span>
              </div>
              <button 
                  onClick={handleContinue}
                  type="button" 
                  className="bg-black text-white px-10 py-3.5 rounded-full font-bold text-lg hover:bg-gray-800 transition-colors shadow-lg w-full"
              >
                  Continue
              </button>
              <p className="text-xs text-gray-400 mt-6">Redirecting to home in 5 seconds...</p>
          </div>
      </div>
  );
};

// --- MAIN COMPONENT ---
const MortgageWizard = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Initialize with empty strings
  const [formData, setFormData] = useState({
    intent: '', propertyFound: '', propertyPrice: '', location: '', hasMortgage: '',
    bankName: '', homeValue: '', loanBalance: '', residency: '', employment: '', income: '', age: '',
    fullName: '', email: '', countryCode: '+971', phone: ''
  });

  const triggerToast = (message, type = 'error') => setToast({ message, type });
  const closeToast = () => setToast(null);

  const handleChange = (field, value) => {
    if (field === 'countryCode') {
        const newCountry = countryCodes.find(c => c.code === value);
        if (formData.phone.length > newCountry.maxDigits) {
            setFormData(prev => ({ ...prev, countryCode: value, phone: prev.phone.slice(0, newCountry.maxDigits) }));
            return;
        }
    }
    if (field === 'phone') {
        const selectedCountry = countryCodes.find(c => c.code === formData.countryCode) || countryCodes[0];
        if (!/^\d*$/.test(value)) return;
        if (value.length > selectedCountry.maxDigits) return;
    }
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors({ ...errors, [field]: null });
  };

  // 🔥 CALCULATE PROGRESS PERCENTAGES 🔥
  const getStepPercentages = () => {
    const pcts = {};

    // --- STEP 1 CALCULATION ---
    let s1Total = 1; // intent always there
    let s1Filled = formData.intent ? 1 : 0;
    
    if (formData.intent === 'buy') {
        s1Total += 4; // propertyFound, propertyPrice, location, hasMortgage
        if(formData.propertyFound) s1Filled++;
        if(formData.propertyPrice) s1Filled++;
        if(formData.location) s1Filled++;
        if(formData.hasMortgage) s1Filled++;
    } else if (formData.intent === 'refinance') {
        s1Total += 3; // bankName, homeValue, loanBalance
        if(formData.bankName) s1Filled++;
        if(formData.homeValue) s1Filled++;
        if(formData.loanBalance) s1Filled++;
    }
    pcts[1] = Math.round((s1Filled / s1Total) * 100);

    // --- STEP 2 CALCULATION ---
    // residency, employment, income, age
    let s2Total = 4;
    let s2Filled = 0;
    if(formData.residency) s2Filled++;
    if(formData.employment) s2Filled++;
    if(formData.income) s2Filled++;
    if(formData.age) s2Filled++;
    pcts[2] = Math.round((s2Filled / s2Total) * 100);

    // --- STEP 3 CALCULATION ---
    // fullName, email, phone
    let s3Total = 3;
    let s3Filled = 0;
    if(formData.fullName) s3Filled++;
    if(formData.email) s3Filled++;
    if(formData.phone) s3Filled++;
    pcts[3] = Math.round((s3Filled / s3Total) * 100);

    return pcts;
  };

  const percentages = getStepPercentages();

  const validateStep = (currentStep) => {
    let newErrors = {};
    let isValid = true;

    if (currentStep === 1) {
        if (!formData.intent) newErrors.intent = "Please select an option";
        if (formData.intent === 'buy') {
            if (!formData.propertyFound) newErrors.propertyFound = "Please choose an option";
            if (!formData.propertyPrice) newErrors.propertyPrice = "Price/Budget is required";
            if (!formData.location) newErrors.location = "Location is required";
            if (!formData.hasMortgage) newErrors.hasMortgage = "Please choose an option";
        } else if (formData.intent === 'refinance') {
            if (!formData.bankName) newErrors.bankName = "Please select a bank";
            if (!formData.homeValue) newErrors.homeValue = "Home value is required";
            if (!formData.loanBalance) newErrors.loanBalance = "Loan balance is required";
        }
    }
    if (currentStep === 2) {
        if (!formData.residency) newErrors.residency = "Please select residency status";
        if (!formData.employment) newErrors.employment = "Please select employment type";
        if (!formData.income) newErrors.income = "Monthly income is required";
        if (!formData.age) newErrors.age = "Age is required";
        else if (formData.age < 21 || formData.age > 65) newErrors.age = "Age must be between 21 and 65";
    }
    if (currentStep === 3) {
        if (!formData.fullName) newErrors.fullName = "Full name is required";
        if (!formData.email) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Please enter a valid email address";
        
        const selectedCountry = countryCodes.find(c => c.code === formData.countryCode) || countryCodes[0];
        if (!formData.phone) newErrors.phone = "Phone number is required";
        else if (formData.phone.length !== selectedCountry.maxDigits) newErrors.phone = `Phone number must be exactly ${selectedCountry.maxDigits} digits`;
    }

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        isValid = false;
    }
    return isValid;
  };

  const submitFormData = async () => {
    setIsLoading(true);
    
    // 🔥 FIXED: Split name into parts and Handle Empty Last Name
    const nameParts = formData.fullName.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "."; // Sends "." if empty

    const safeInt = (val) => { const parsed = parseInt(val, 10); return isNaN(parsed) ? 0 : parsed; };

    let payload = {
        type: "mortgage",
        has_property: true, 
        occupation: formData.employment === 'salaried' ? "Salaried" : "Self-Employed",
        monthly_income: safeInt(formData.income),
        age: safeInt(formData.age),
        name: { first_name: firstName, last_name: lastName },
        email: formData.email,
        mobile: { country_code: formData.countryCode, number: formData.phone },
        preferred_contact: "whatsapp",
        residency_status: formData.residency === 'non-resident' ? "non_resident" : "resident"
    };

    if (formData.intent === 'buy') {
        payload.lead_sub_type = "home_loan";
        payload.has_property = formData.propertyFound === 'yes';
        payload.price = safeInt(formData.propertyPrice);
        payload.city = "Dubai"; 
        payload.area = formData.location;
        payload.has_existing_mortgage = formData.hasMortgage === 'yes';
    } else {
        payload.lead_sub_type = "refinance";
        payload.price = safeInt(formData.homeValue);
        payload.budget = `${formData.loanBalance} remaining`;
        payload.country = "UAE";
        payload.bank_name = formData.bankName;
    }

    try {
        const response = await fetch(`${BASE_URL}/api/property/lead/create-mortgage-lead`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (response.ok && result.success) {
            const leadId = result.data.lead._id;
            const appId = result.data.mortgageApplication?.application_id || result.data.mortgage_application?.application_id;
            const customerId = result.data.lead.customer_id || result.data.lead.customerId;

            localStorage.setItem("mortgage_lead_id", leadId);
            if(appId) localStorage.setItem("mortgage_app_id", appId);
            if(customerId) localStorage.setItem("customer_id", customerId);

            setStep((prev) => prev + 1); 
            setErrors({});
        } else {
            triggerToast(result.message || "Something went wrong.", 'error');
        }
    } catch (error) {
        triggerToast("Network error.", 'error');
    } finally {
        setIsLoading(false);
    }
  };

  const handleNext = () => { if (validateStep(step)) { if (step === 3) submitFormData(); else { setStep((prev) => prev + 1); setErrors({}); } } };
  const handleBack = () => { setStep((prev) => Math.max(prev - 1, 1)); setErrors({}); };

  return (
    <div className="flex min-h-screen bg-white font-sans text-[#1a1a1a]">
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
      {step === 4 && <SuccessModal email={formData.email} navigate={navigate} />}
      <HeroSection step={step} />
      <div className="flex-1 flex flex-col">
        <div className="w-full max-w-3xl mx-auto pt-16 px-8 lg:px-0">
            <ProgressBar currentStep={step} percentages={percentages} />
        </div>
        <div className="w-full max-w-3xl mx-auto flex-1 px-8 lg:px-0 pb-16 flex flex-col">
          <div className="mt-2 flex-1">
            {step === 1 && <Step1 formData={formData} handleChange={handleChange} errors={errors} />}
            {step === 2 && <Step2 formData={formData} handleChange={handleChange} errors={errors} />}
            {step === 3 && <Step3 formData={formData} handleChange={handleChange} errors={errors} />}
          </div>
          <div className="flex justify-between items-center mt-12 pt-0">
            {step > 1 ? (
            <button type="button" onClick={handleBack} disabled={isLoading} className="flex items-center text-gray-600 font-semibold px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"><ChevronLeft className="w-5 h-5 mr-2" />Back</button>
            ) : <div></div>}
            <button type="button" onClick={handleNext} disabled={isLoading} className="bg-gray-600 text-white px-12 py-3.5 rounded-md font-bold text-lg hover:bg-black transition-colors shadow-sm flex items-center justify-center disabled:bg-gray-400">
            {isLoading ? <><Loader2 className="animate-spin mr-2 h-5 w-5" /> Processing...</> : (step === 3 ? 'Explore mortgages' : 'Next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MortgageWizard;