import React, { useState, useEffect } from 'react';
// 🚀 Custom API Service Import
import { apiService } from "../../manageApi/utils/custom.apiservice";
// 🚀 Toast Notifications Import
import toast, { Toaster } from 'react-hot-toast';
import {
  FaHome,
  FaMoneyBillWave,
  FaPhoneAlt,
  FaWhatsapp,
  FaEnvelope,
  FaCheckCircle,
  FaInfoCircle,
  FaTimes,
  FaCalendarAlt,
  FaArrowRight,
  FaCalculator
} from 'react-icons/fa';

// --- Constants & Data ---
const PRODUCTS = [
  { id: '3yr', label: '3.99% · 3yr Fixed', rate: 3.99 },
  { id: '5yr', label: '4.19% · 5yr Fixed', rate: 4.19 },
  { id: 'var', label: '7.00% Variable', rate: 7.0 },
];

const LOCATIONS = [
  'Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman',
  'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain', 'Al Ain',
];

// 🚀 Country Codes with Max Lengths for Validation
const COUNTRIES = [
  { code: 'AE', dialCode: '+971', maxLength: 9, name: 'UAE' },
  { code: 'IN', dialCode: '+91', maxLength: 10, name: 'India' },
  { code: 'SA', dialCode: '+966', maxLength: 9, name: 'Saudi Arabia' },
  { code: 'US', dialCode: '+1', maxLength: 10, name: 'USA' },
  { code: 'GB', dialCode: '+44', maxLength: 10, name: 'UK' },
  { code: 'PK', dialCode: '+92', maxLength: 10, name: 'Pakistan' },
  { code: 'QA', dialCode: '+974', maxLength: 8, name: 'Qatar' },
];

const MIN_SALARY = 10000;
const DSR = 0.5;
const STRESS_RATE = 6.5;

// --- Helpers ---
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const calculateEMI = (principal, annualRate, years) => {
  if (principal <= 0 || annualRate <= 0 || years <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  const months = years * 12;
  return Math.round(principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1));
};

const calculateAffordability = (maxEMI, stressRate, years) => {
  if (maxEMI <= 0) return 0;
  const monthlyRate = stressRate / 100 / 12;
  const months = years * 12;
  return Math.round(maxEMI * (Math.pow(1 + monthlyRate, months) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, months)));
};

// --- Reusable UI Components ---
const ModalWrapper = ({ isOpen, onClose, title, subtitle, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" 
      onClick={onClose}
      style={{ fontFamily: '"DM Sans", sans-serif' }}
    >
      <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="relative p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h2>
            {subtitle && <p className="text-sm text-slate-500 font-medium mt-1">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition">
            <FaTimes size={20} />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

// --- Functional Modals ---
const LoanSummaryModal = ({ isOpen, onClose, data }) => {
  const downpayment = data.affordability * 0.15;
  const transactionCosts = data.affordability * 0.055;
  const upfrontCost = downpayment + transactionCosts;
  const youCanBorrow = data.affordability * 0.85;

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Loan Summary" subtitle="Detailed breakdown of your costs">
      <div className="space-y-5">
        <div className="space-y-3">
          <div className="flex justify-between text-slate-600 font-medium">
            <span>Downpayment (15%)</span>
            <span className="font-semibold text-slate-800">{formatCurrency(downpayment)}</span>
          </div>
          <div className="flex justify-between text-slate-600 font-medium">
            <span>Transaction costs (5.5%)</span>
            <span className="font-semibold text-slate-800">{formatCurrency(transactionCosts)}</span>
          </div>
          <div className="pt-3 border-t border-slate-200 flex justify-between text-lg font-bold text-purple-900">
            <span>Total Upfront Cost</span>
            <span>{formatCurrency(upfrontCost)}</span>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 text-center">
          <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">Estimated Borrowing Limit</p>
          <p className="text-3xl font-bold text-purple-700 tracking-tight">{formatCurrency(youCanBorrow)}</p>
        </div>

        <div className="flex justify-between items-center py-3 px-4 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-slate-600 font-medium">Monthly payment</span>
          <span className="font-bold text-xl text-emerald-600">{formatCurrency(data.monthly)}</span>
        </div>

        <div className="space-y-2">
          <div className="flex gap-3 items-start p-3 bg-blue-50 text-blue-800 rounded-xl text-xs font-medium leading-relaxed">
            <FaInfoCircle className="mt-0.5 shrink-0" />
            <p>Calculator assumes stress test of 3-month EIBOR + 2%.</p>
          </div>
          <div className="flex gap-3 items-start p-3 bg-amber-50 text-amber-800 rounded-xl text-xs font-medium leading-relaxed">
            <span className="shrink-0 font-bold">ⓘ</span>
            <p>Maximum mortgage term in UAE is 25 years up to age 65 (or 70 for self-employed).</p>
          </div>
        </div>

        <button onClick={onClose} className="w-full bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition shadow-lg shadow-purple-200">
          Got it
        </button>
      </div>
    </ModalWrapper>
  );
};

const PreApprovalModal = ({ isOpen, onClose, calculatorData }) => {
  const [step, setStep] = useState('form');
  const [loading, setLoading] = useState(false);
  
  // 🚀 Updated State to handle Country Code separately
  const [formData, setFormData] = useState({ 
    name: '', 
    phone: '', 
    selectedCountry: COUNTRIES[0], // Defaults to UAE
    email: '', 
    foundProperty: 'no', 
    location: '', 
    consent: false 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 🚀 Extra Validation before hitting API
    if (formData.phone.length !== formData.selectedCountry.maxLength) {
      toast.error(`Please enter a valid ${formData.selectedCountry.maxLength}-digit number for ${formData.selectedCountry.name}.`);
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Submitting your application...');

    try {
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const payload = {
        type: "mortgage",
        lead_sub_type: "pre_approval",
        name: {
          first_name: firstName,
          last_name: lastName
        },
        // 🚀 Dynamic Country Code mapping
        mobile: {
          country_code: formData.selectedCountry.dialCode,
          number: formData.phone
        },
        email: formData.email,
        has_property: formData.foundProperty === 'yes',
        preferred_city: formData.location || "",
        
        mortgage: {
          monthly_income: calculatorData.monthlyIncome,
          monthly_debt: calculatorData.monthlyDebt,
          loan_tenure: calculatorData.loanTenure,
          property_value: calculatorData.propertyValue,
          downpayment: calculatorData.downpayment,
          loan_amount: calculatorData.loanAmount,
          interest_rate: calculatorData.rate,
          loan_duration: calculatorData.loanDuration,
          affordability: calculatorData.affordability,
          monthly_emi: calculatorData.monthlyEMI,
          employment_type: calculatorData.employment,
          residency_status: calculatorData.residency,
          has_existing_loan: false
        }
      };

      const res = await apiService.post('/property/lead/create-mortgage-lead', payload); 
      
      if (res.success || res.status === 200 || res.status === 201) {
        toast.success('Application submitted successfully!', { id: toastId });
        setStep('success');
      } else {
        toast.error(res.message || "Something went wrong. Please try again.", { id: toastId });
      }
    } catch (error) {
      console.error("Lead submit error:", error);
      toast.error("Network error. Please check your connection.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e) => {
    // 🚀 Block letters, only allow numbers up to max length
    const value = e.target.value.replace(/\D/g, ''); 
    if (value.length <= formData.selectedCountry.maxLength) {
      setFormData({ ...formData, phone: value });
    }
  };

  const handleCountryChange = (e) => {
    const country = COUNTRIES.find(c => c.code === e.target.value);
    setFormData({ ...formData, selectedCountry: country, phone: '' }); // Clear phone on country change
  };

  if (step === 'success') {
    return (
      <ModalWrapper isOpen={isOpen} onClose={onClose} title="Request Sent!">
        <div className="text-center py-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle size={40} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">Thank You!</h2>
          <p className="text-slate-500 mb-8 font-medium px-4 leading-relaxed">Your pre-approval request has been submitted. Our advisors will contact you within 24 hours.</p>
          <button onClick={onClose} className="w-full bg-purple-600 text-white py-4 rounded-xl font-semibold">Return to Dashboard</button>
        </div>
      </ModalWrapper>
    );
  }

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Get Pre-Approved" subtitle="Start your property journey today.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wide">Name *</label>
            <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Full name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition font-medium" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wide">Phone *</label>
            {/* 🚀 Dynamic Country Selector & Phone Input */}
            <div className="flex border border-slate-200 rounded-xl bg-slate-50 focus-within:ring-2 focus-within:ring-purple-500 transition overflow-hidden">
              <div className="flex items-center pl-3 pr-2 bg-slate-100/80 border-r border-slate-200">
                <img 
                  src={`https://flagcdn.com/w20/${formData.selectedCountry.code.toLowerCase()}.png`} 
                  alt={formData.selectedCountry.code} 
                  className="w-5 h-auto mr-1.5 rounded-[2px]"
                />
                <select 
                  value={formData.selectedCountry.code} 
                  onChange={handleCountryChange}
                  className="bg-transparent font-semibold text-slate-700 outline-none text-sm cursor-pointer w-[54px]"
                >
                  {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.dialCode}</option>)}
                </select>
              </div>
              <input 
                required 
                type="tel" 
                value={formData.phone} 
                onChange={handlePhoneChange} 
                placeholder={`XX XXX XXXX`} 
                className="w-full p-4 bg-transparent outline-none font-medium" 
              />
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wide">Email *</label>
          <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="you@example.com" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition font-medium" />
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1 uppercase tracking-wide">Found a property? *</label>
          <div className="flex gap-4">
            <label className="flex-1 flex items-center justify-center gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition font-medium text-sm">
              <input type="radio" name="fp" checked={formData.foundProperty === 'yes'} onChange={() => setFormData({...formData, foundProperty: 'yes'})} className="accent-purple-600" /> Yes
            </label>
            <label className="flex-1 flex items-center justify-center gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition font-medium text-sm">
              <input type="radio" name="fp" checked={formData.foundProperty === 'no'} onChange={() => setFormData({...formData, foundProperty: 'no'})} className="accent-purple-600" /> No
            </label>
          </div>
        </div>
        
        {formData.foundProperty === 'yes' && (
          <div className="animate-in fade-in slide-in-from-top-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wide">Location *</label>
            <select required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition font-medium">
              <option value="">Select emirate</option>
              {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>
        )}
        
        <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer mt-4">
          <input required type="checkbox" className="mt-1 accent-purple-600" />
          <span className="text-xs text-slate-500 leading-relaxed font-medium">I agree to receive newsletters and marketing communications. I accept the Terms of Service and Privacy Policy.</span>
        </label>
        
        <button type="submit" disabled={loading} className="w-full bg-[#5C039B] text-white py-4 rounded-xl font-semibold hover:bg-[#4a027d] transition shadow-lg shadow-purple-200 mt-2 disabled:opacity-70 flex justify-center items-center">
          {loading ? 'Submitting...' : 'Submit Application →'}
        </button>
      </form>
    </ModalWrapper>
  );
};

const ContactModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState('schedule');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  
  // 🚀 Dynamic Phone State for Contact Modal too
  const [contactPhone, setContactPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);

  const dates = [
    { day: 'MON', date: 12, month: 'Apr' }, { day: 'TUE', date: 13, month: 'Apr' },
    { day: 'WED', date: 14, month: 'Apr' }, { day: 'THU', date: 15, month: 'Apr' },
    { day: 'FRI', date: 16, month: 'Apr' },
  ];
  const times = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'];

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); 
    if (value.length <= selectedCountry.maxLength) {
      setContactPhone(value);
    }
  };

  const handleCountryChange = (e) => {
    const country = COUNTRIES.find(c => c.code === e.target.value);
    setSelectedCountry(country);
    setContactPhone('');
  };

  if (step === 'success') {
    return (
      <ModalWrapper isOpen={isOpen} onClose={onClose} title="Meeting Booked!">
        <div className="text-center py-6">
          <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCalendarAlt size={32} />
          </div>
          <p className="text-slate-500 font-medium mb-8 px-4 leading-relaxed">Your consultation has been secured. We've sent a calendar invite to your email.</p>
          <button onClick={onClose} className="w-full bg-purple-600 text-white py-4 rounded-xl font-semibold">Done</button>
        </div>
      </ModalWrapper>
    );
  }

  if (step === 'details') {
    return (
      <ModalWrapper isOpen={isOpen} onClose={() => setStep('schedule')} title="Your Details" subtitle="Step 2 of 2">
        <form onSubmit={(e) => { 
          e.preventDefault(); 
          if(contactPhone.length !== selectedCountry.maxLength){
            toast.error(`Please enter a valid ${selectedCountry.maxLength}-digit number`);
            return;
          }
          setStep('success'); 
        }} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wide">Name</label>
            <input required type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-medium" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wide">Phone</label>
            {/* 🚀 Dynamic Country Selector & Phone Input */}
            <div className="flex border border-slate-200 rounded-xl bg-slate-50 focus-within:ring-2 focus-within:ring-purple-500 transition overflow-hidden">
              <div className="flex items-center pl-3 pr-2 bg-slate-100/80 border-r border-slate-200">
                <img 
                  src={`https://flagcdn.com/w20/${selectedCountry.code.toLowerCase()}.png`} 
                  alt={selectedCountry.code} 
                  className="w-5 h-auto mr-1.5 rounded-[2px]"
                />
                <select 
                  value={selectedCountry.code} 
                  onChange={handleCountryChange}
                  className="bg-transparent font-semibold text-slate-700 outline-none text-sm cursor-pointer w-[54px]"
                >
                  {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.dialCode}</option>)}
                </select>
              </div>
              <input 
                required 
                type="tel" 
                value={contactPhone} 
                onChange={handlePhoneChange} 
                placeholder={`XX XXX XXXX`} 
                className="w-full p-4 bg-transparent outline-none font-medium" 
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setStep('schedule')} className="flex-1 py-4 rounded-xl font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition">Back</button>
            <button type="submit" className="flex-1 bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition shadow-lg shadow-purple-200">Confirm →</button>
          </div>
        </form>
      </ModalWrapper>
    );
  }

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Book a Call" subtitle="Step 1 of 2 - Choose a time">
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-3 ml-1 uppercase tracking-wide">Select Date</p>
          <div className="grid grid-cols-5 gap-2">
            {dates.map((d, idx) => (
              <button key={idx} onClick={() => setSelectedDate(idx)} className={`p-3 text-center border-2 rounded-xl transition ${selectedDate === idx ? 'border-purple-600 bg-purple-50' : 'border-slate-100 hover:border-purple-200'}`}>
                <div className={`text-[10px] font-bold ${selectedDate === idx ? 'text-purple-600' : 'text-slate-400'}`}>{d.day}</div>
                <div className={`text-xl font-bold ${selectedDate === idx ? 'text-purple-700' : 'text-slate-700'}`}>{d.date}</div>
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-3 ml-1 uppercase tracking-wide">Select Time</p>
          <div className="grid grid-cols-3 gap-3">
            {times.map((t, idx) => (
              <button key={idx} onClick={() => setSelectedTime(idx)} className={`py-3 text-sm font-semibold text-center border-2 rounded-xl transition ${selectedTime === idx ? 'border-purple-600 bg-purple-600 text-white' : 'border-slate-100 text-slate-600 hover:border-purple-200'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => setStep('details')} disabled={selectedDate === null || selectedTime === null} className={`w-full py-4 rounded-xl font-semibold transition ${selectedDate !== null && selectedTime !== null ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 hover:bg-purple-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
          Continue →
        </button>
      </div>
    </ModalWrapper>
  );
};

// --- Main Dashboard Component ---
export default function PerfectMortgageCalculator() {
  const [activeTab, setActiveTab] = useState('affordability');
  
  const [residency, setResidency] = useState('UAE Resident');
  const [employment, setEmployment] = useState('salaried');
  const [monthlyIncome, setMonthlyIncome] = useState(25000);
  const [monthlyDebt, setMonthlyDebt] = useState(0);
  const [loanTenure, setLoanTenure] = useState(25);
  
  const [propertyValue, setPropertyValue] = useState(1500000);
  const [downpayment, setDownpayment] = useState(300000);
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0]);
  const [loanDuration, setLoanDuration] = useState(25);
  
  const [modals, setModals] = useState({ summary: false, preapproval: false, contact: false });
  const openModal = (type) => setModals({ ...modals, [type]: true });
  const closeModal = (type) => setModals({ ...modals, [type]: false });
  
  const disposableIncome = monthlyIncome - monthlyDebt;
  const maxEMI = disposableIncome * DSR;
  const isEligible = monthlyIncome >= MIN_SALARY && maxEMI > 0;
  const affordability = isEligible ? calculateAffordability(maxEMI, STRESS_RATE, loanTenure) : 0;
  const monthlyPayment = isEligible ? Math.round(maxEMI) : 0;
  
  const loanAmount = Math.max(0, propertyValue - downpayment);
  const monthlyEMI = calculateEMI(loanAmount, selectedProduct.rate, loanDuration);

  const calculatorData = {
    monthlyIncome, monthlyDebt, loanTenure, propertyValue, downpayment,
    loanAmount, rate: selectedProduct.rate, loanDuration, affordability,
    monthlyEMI, employment, residency
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-800" style={{ fontFamily: '"DM Sans", sans-serif' }}>
      <Toaster position="top-center" reverseOrder={false} />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');`}</style>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-3">
            Mortgage<span className="text-[#5C039B]">Pro</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg">Smart property financing for the UAE market</p>
        </div>
        
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white rounded-[2rem] p-8 shadow-xl shadow-purple-900/5 border border-slate-100">
            <div className="flex p-1.5 bg-slate-100/80 rounded-[1.25rem] mb-8">
              <button onClick={() => setActiveTab('affordability')} className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold transition-all ${activeTab === 'affordability' ? 'bg-white text-[#5C039B] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <FaCalculator /> Affordability Calculator
              </button>
              <button onClick={() => setActiveTab('mortgage')} className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold transition-all ${activeTab === 'mortgage' ? 'bg-white text-[#5C039B] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <FaMoneyBillWave /> Mortgages Calculator
              </button>
            </div>
            
            {activeTab === 'affordability' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1">Residency</label>
                    <select value={residency} onChange={(e) => setResidency(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 font-medium outline-none transition">
                      <option>UAE Resident</option><option>UAE National</option><option>Non-Resident</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1">Employment</label>
                    <select value={employment} onChange={(e) => setEmployment(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 font-medium outline-none transition">
                      <option value="salaried">Employed</option>
                      <option value="self_employed">Self-Employed</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1">Monthly Income (AED)</label>
                    <input type="number" value={monthlyIncome} onChange={(e) => setMonthlyIncome(Number(e.target.value))} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 font-medium outline-none transition" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1">Monthly Debts (AED)</label>
                    <input type="number" value={monthlyDebt} onChange={(e) => setMonthlyDebt(Number(e.target.value))} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 font-medium outline-none transition" />
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-end">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1">Loan Tenure</label>
                    <span className="font-bold text-xl text-purple-600">{loanTenure} <span className="text-sm font-medium text-slate-500">Yrs</span></span>
                  </div>
                  <input type="range" min={1} max={25} value={loanTenure} onChange={(e) => setLoanTenure(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600" />
                  <div className="flex justify-between text-xs font-medium text-slate-400"><span>1 year</span><span>25 years</span></div>
                </div>
              </div>
            )}
            
            {activeTab === 'mortgage' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1">Select Rate Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {PRODUCTS.map((product) => (
                      <button key={product.id} onClick={() => setSelectedProduct(product)} className={`p-4 text-xs font-semibold border-2 rounded-xl transition ${selectedProduct.id === product.id ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'}`}>
                        {product.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1">Property Value (AED)</label>
                    <input type="number" value={propertyValue} onChange={(e) => setPropertyValue(Number(e.target.value))} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 font-medium outline-none transition" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                       <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1">Downpayment</label>
                       <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">{((downpayment / propertyValue) * 100).toFixed(0)}%</span>
                    </div>
                    <input type="number" value={downpayment} onChange={(e) => setDownpayment(Number(e.target.value))} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 font-medium outline-none transition" />
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-end">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1">Loan Duration</label>
                    <span className="font-bold text-xl text-purple-600">{loanDuration} <span className="text-sm font-medium text-slate-500">Yrs</span></span>
                  </div>
                  <input type="range" min={1} max={25} value={loanDuration} onChange={(e) => setLoanDuration(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600" />
                  <div className="flex justify-between text-xs font-medium text-slate-400"><span>1 year</span><span>25 years</span></div>
                </div>
              </div>
            )}
          </div>
          
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-purple-900/20 relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <p className="text-purple-300 font-semibold uppercase tracking-wider text-xs mb-6">
                  {activeTab === 'affordability' ? 'Your Buying Power' : 'Cost Breakdown'}
                </p>
                
                {activeTab === 'affordability' ? (
                  isEligible ? (
                    <div>
                      <p className="text-purple-200 text-sm font-medium mb-1">Max Property Price</p>
                      <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight text-white">{formatCurrency(affordability)}</h2>
                      <div className="border-t border-purple-800/50 pt-6 flex justify-between items-center">
                        <div>
                          <p className="text-purple-300 text-xs font-semibold mb-1 uppercase tracking-wide">Monthly EMI Limit</p>
                          <p className="text-xl font-bold text-white">{formatCurrency(monthlyPayment)}</p>
                        </div>
                        <button onClick={() => openModal('summary')} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2">
                          Breakdown <FaArrowRight />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-sm">
                      <div className="text-amber-300 font-bold mb-2 flex items-center gap-2">⚠️ Eligibility Issue</div>
                      <p className="text-sm text-purple-100 font-medium">Minimum salary requirement of AED {MIN_SALARY.toLocaleString()} is not met.</p>
                    </div>
                  )
                ) : (
                  <div>
                    <p className="text-purple-200 text-sm font-medium mb-1">Monthly Installment</p>
                    <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight text-white">{formatCurrency(monthlyEMI)}</h2>
                    <div className="border-t border-purple-800/50 pt-6 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-purple-300 text-xs font-semibold mb-1 uppercase tracking-wide">Total Loan</p>
                        <p className="text-xl font-bold text-white">{formatCurrency(loanAmount)}</p>
                      </div>
                      <div>
                        <p className="text-purple-300 text-xs font-semibold mb-1 uppercase tracking-wide">Interest Rate</p>
                        <p className="text-xl font-bold text-white">{selectedProduct.rate}%</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-purple-900/5 border border-slate-100 space-y-4">
              <button onClick={() => openModal('preapproval')} className="w-full bg-[#5C039B] text-white py-4 rounded-xl font-semibold text-lg  transition shadow-lg shadow-purple-200 flex justify-center items-center gap-2">
                Get Pre-Approved <FaArrowRight className="text-sm" />
              </button>
              
              <div className="grid grid-cols-2 gap-4">
                {/* <button onClick={() => openModal('contact')} className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 hover:border-purple-200 py-3.5 rounded-xl font-semibold transition">
                  <FaPhoneAlt size={14} /> Call Me
                </button>
                <button onClick={() => openModal('contact')} className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-600 border border-slate-200 hover:border-emerald-200 py-3.5 rounded-xl font-semibold transition">
                  <FaWhatsapp size={16} /> WhatsApp
                </button> */}
              </div>
            </div>
            
          
          </div>
        </div>
      </div>
      
      <LoanSummaryModal isOpen={modals.summary} onClose={() => closeModal('summary')} data={{ affordability, monthly: monthlyPayment }} />
      <PreApprovalModal isOpen={modals.preapproval} onClose={() => closeModal('preapproval')} calculatorData={calculatorData} />
      <ContactModal isOpen={modals.contact} onClose={() => closeModal('contact')} />
    </div>
  );
}