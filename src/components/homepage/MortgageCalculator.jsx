import React, { useState } from 'react';
import { apiService } from "../../manageApi/utils/custom.apiservice";
import toast, { Toaster } from 'react-hot-toast';
import { FaArrowRight, FaCheckCircle, FaTimes, FaInfoCircle } from 'react-icons/fa';

// --- Constants ---
const PRODUCTS = [
  { id: '3yr', label: '3.99% · 3yr Fixed', rate: 3.99 },
  { id: '5yr', label: '4.19% · 5yr Fixed', rate: 4.19 },
  { id: 'var', label: '7.00% Variable', rate: 7.0 },
];

const LOCATIONS = [
  'Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman',
  'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain', 'Al Ain',
];

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

const getStressRate = (years) => {
  if (years <= 15) return 3.17;
  if (years <= 17) return 3.41;
  if (years <= 20) return 3.68;
  return 3.98;
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-AE', {
    style: 'currency', currency: 'AED',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(value);

const calculateEMI = (principal, annualRate, years) => {
  if (principal <= 0 || annualRate <= 0 || years <= 0) return 0;
  const mr = annualRate / 100 / 12;
  const m = years * 12;
  return Math.round(principal * mr * Math.pow(1 + mr, m) / (Math.pow(1 + mr, m) - 1));
};

const calculatePropertyPrice = (maxEMI, annualRate, years) => {
  if (maxEMI <= 0) return 0;
  const mr = annualRate / 100 / 12;
  const m = years * 12;
  const loanAmount = maxEMI * (Math.pow(1 + mr, m) - 1) / (mr * Math.pow(1 + mr, m));
  return Math.round((loanAmount / 0.85) * 0.92);
};

// --- Slider Input Component ---
const SliderField = ({ label, value, onChange, min, max, step, prefix = 'AED', showSlider = true }) => (
  <div className="mb-5">
    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
      {label}
    </label>
    <div className="flex items-center border border-gray-200 rounded-xl bg-white px-3 py-2.5 gap-2">
      <span className="text-gray-400 font-semibold text-sm">{prefix}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 outline-none text-sm font-semibold text-gray-800 bg-transparent"
      />
    </div>
    {showSlider && (
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-2 accent-purple-600 h-1 rounded-full"
      />
    )}
  </div>
);

// --- Pre-Approval Modal ---
const PreApprovalModal = ({ isOpen, onClose, calculatorData }) => {
  const [step, setStep] = useState('form');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', phone: '',
    selectedCountry: COUNTRIES[0], email: '',
    foundProperty: 'no', location: '', consent: false,
  });

  if (!isOpen) return null;

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= formData.selectedCountry.maxLength)
      setFormData({ ...formData, phone: value });
  };

  const handleCountryChange = (e) => {
    const country = COUNTRIES.find(c => c.code === e.target.value);
    setFormData({ ...formData, selectedCountry: country, phone: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.phone.length !== formData.selectedCountry.maxLength) {
      toast.error(`Please enter a valid ${formData.selectedCountry.maxLength}-digit number for ${formData.selectedCountry.name}.`);
      return;
    }
    setLoading(true);
    const toastId = toast.loading('Submitting your application...');
    try {
      const payload = {
        type: 'mortgage', lead_sub_type: 'pre_approval',
        name: { first_name: formData.firstName, last_name: formData.lastName },
        mobile: { country_code: formData.selectedCountry.dialCode, number: formData.phone },
        email: formData.email,
        has_property: formData.foundProperty === 'yes',
        preferred_city: formData.location || '',
        mortgage: { monthly_income: calculatorData.monthlyIncome, monthly_debt: calculatorData.monthlyDebt },
      };
      const res = await apiService.post('/property/lead/', payload);
      if (res.success || res.status === 200 || res.status === 201) {
        toast.success('Application submitted!', { id: toastId });
        setStep('success');
      } else {
        toast.error(res.message || 'Something went wrong.', { id: toastId });
      }
    } catch {
      toast.error('Network error. Please try again.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
      style={{ fontFamily: '"DM Sans", sans-serif' }}
    >
      <div
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {step === 'success' ? 'Request Sent!' : 'Get Pre-Approved'}
            </h2>
            {step !== 'success' && <p className="text-xs text-gray-400 mt-0.5">Start your property journey today.</p>}
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition">
            <FaTimes size={18} />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {step === 'success' ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Thank You!</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Your pre-approval request has been submitted. Our advisors will contact you within 24 hours.
              </p>
              <button onClick={onClose} className="w-full bg-purple-700 text-white py-3.5 rounded-xl font-semibold text-sm">
                Return to Dashboard
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="grid grid-cols-2 gap-3">
                {['firstName', 'lastName'].map((field, i) => (
                  <div key={field}>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      {i === 0 ? 'First Name' : 'Last Name'} *
                    </label>
                    <input
                      required type="text"
                      value={formData[field]}
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                      placeholder={i === 0 ? 'e.g. Rahul' : 'e.g. Sharma'}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                ))}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Phone *</label>
                <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-gray-50 focus-within:ring-2 focus-within:ring-purple-500">
                  <div className="flex items-center pl-3 pr-2 bg-gray-100 border-r border-gray-200 gap-1.5">
                    <img
                      src={`https://flagcdn.com/w20/${formData.selectedCountry.code.toLowerCase()}.png`}
                      alt="" className="w-5 rounded-sm"
                    />
                    <select
                      value={formData.selectedCountry.code}
                      onChange={handleCountryChange}
                      className="bg-transparent text-xs font-bold text-gray-700 outline-none cursor-pointer w-14"
                    >
                      {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.dialCode}</option>)}
                    </select>
                  </div>
                  <input
                    required type="tel" value={formData.phone}
                    onChange={handlePhoneChange} placeholder="XX XXX XXXX"
                    className="flex-1 px-4 py-3 bg-transparent outline-none text-sm font-medium"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Email *</label>
                <input
                  required type="email" value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Found Property */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Found a property? *</label>
                <div className="flex gap-3">
                  {['yes', 'no'].map(opt => (
                    <label key={opt} className={`flex-1 flex items-center justify-center gap-2 py-2.5 border-2 rounded-xl text-sm font-semibold cursor-pointer transition ${formData.foundProperty === opt ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-500'}`}>
                      <input type="radio" name="fp" checked={formData.foundProperty === opt} onChange={() => setFormData({ ...formData, foundProperty: opt })} className="hidden" />
                      {opt === 'yes' ? 'Yes' : 'No'}
                    </label>
                  ))}
                </div>
              </div>

              {formData.foundProperty === 'yes' && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Location *</label>
                  <select
                    required value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select emirate</option>
                    {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                </div>
              )}

              {/* Consent */}
              <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer">
                <input
                  required type="checkbox"
                  checked={formData.consent}
                  onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                  className="mt-0.5 accent-purple-600"
                />
                <span className="text-[11px] text-gray-400 leading-relaxed font-medium">
                  I agree to receive newsletters and marketing communications. I accept the Terms of Service and Privacy Policy.
                </span>
              </label>

              <button
                type="submit" disabled={loading}
                className="w-full bg-[#5C039B] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-purple-900 transition disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? 'Submitting...' : <> Submit Application <FaArrowRight className="text-xs" /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---
export default function MortgageCalculator() {
  const [activeTab, setActiveTab] = useState('affordability');

  // Affordability inputs
  const [annualIncome, setAnnualIncome] = useState(120000);
  const [totalDeposit, setTotalDeposit] = useState(65000);
  const [monthlyDebts, setMonthlyDebts] = useState(450);
  const [loanTenure, setLoanTenure] = useState(25);

  // Mortgage inputs
  const [propertyValue, setPropertyValue] = useState(1500000);
  const [downpayment, setDownpayment] = useState(300000);
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0]);
  const [loanDuration, setLoanDuration] = useState(25);

  // Modal
  const [showModal, setShowModal] = useState(false);

  // --- Calculations ---
  const monthlyIncome = Number(annualIncome) / 12 || 0;
  const safeDebt = Number(monthlyDebts) || 0;
  const safeDeposit = Number(totalDeposit) || 0;
  const maxEMI = monthlyIncome * DSR - safeDebt;
  const isEligible = monthlyIncome >= MIN_SALARY && maxEMI > 0;
  const stressRate = getStressRate(loanTenure);
  const affordability = isEligible ? calculatePropertyPrice(maxEMI, stressRate, loanTenure) : 0;
  const estimatedEMI = isEligible ? calculateEMI(affordability * 0.85, stressRate, loanTenure) : 0;

  const safePropVal = Number(propertyValue) || 0;
  const safeDown = Number(downpayment) || 0;
  const loanAmount = Math.max(0, safePropVal - safeDown);
  const monthlyEMI = calculateEMI(loanAmount, selectedProduct.rate, loanDuration);
  const ltv = safePropVal > 0 ? Math.round((loanAmount / safePropVal) * 100) : 0;

  const calculatorData = {
    monthlyIncome, monthlyDebt: safeDebt,
  };

  return (
    <div
      className="min-h-screen bg-gray-50 flex items-center justify-center p-6"
      style={{ fontFamily: '"DM Sans", sans-serif' }}
    >
      <Toaster position="top-center" />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* ── 3-Column Card ── */}
      <div className="w-full max-w-7xl bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-3">

        {/* ── COL 1: Hero ── */}
        <div className="bg-white px-8 py-10 flex flex-col justify-center gap-5 border-r border-gray-100">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 inline-block" />
            Empowering Your Future
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Discover Your True{' '}
            <span className="text-purple-700">Buying Power</span>
          </h1>

          {/* Body */}
          <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
            Our sophisticated algorithms analyze your financial profile to give you a precise
            mortgage estimate in seconds. Clear, transparent, and built for you.
          </p>

          {/* Avatars */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex">
              {['#a78bfa', '#8b5cf6', '#7c3aed'].map((bg, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ background: bg, marginLeft: i === 0 ? 0 : -8 }}
                >
                  {['R', 'S', 'A'][i]}
                </div>
              ))}
            </div>
            <span className="text-[11px] text-gray-400 font-semibold">Trusted by 10K+ Home Buyers</span>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-2 mt-2">
            {[
              { key: 'affordability', label: 'Affordability' },
              { key: 'mortgage', label: 'Mortgage' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${activeTab === tab.key
                    ? 'bg-purple-700 text-white'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── COL 2: Inputs ── */}
        <div className="bg-white px-8 py-10 border-r border-gray-100">
          <h2 className="text-base font-bold text-gray-800 mb-6">Calculation Inputs</h2>

          {activeTab === 'affordability' ? (
            <>
              <SliderField
                label="Annual Household Income"
                value={annualIncome}
                onChange={setAnnualIncome}
                min={10000} max={1000000} step={1000}
              />
              {/* <SliderField
                label="Total Deposit"
                value={totalDeposit}
                onChange={setTotalDeposit}
                min={0} max={500000} step={1000}
              /> */}
              <SliderField
                label="Monthly Debts"
                value={monthlyDebts}
                onChange={setMonthlyDebts}
                min={0} max={50000} step={100}
                showSlider={false}
              />

              {/* Tenure */}
              <div className="mb-5">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Loan Tenure</label>
                  <span className="text-sm font-bold text-purple-700">{loanTenure} Yrs</span>
                </div>
                <input
                  type="range" min={5} max={25} step={1} value={loanTenure}
                  onChange={(e) => setLoanTenure(Number(e.target.value))}
                  className="w-full accent-purple-600 h-1"
                />
                <div className="flex justify-between text-[10px] text-gray-300 mt-1"><span>5 yrs</span><span>25 yrs</span></div>
              </div>
            </>
          ) : (
            <>
              {/* Rate selector */}
              <div className="mb-5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Rate Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {PRODUCTS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProduct(p)}
                      className={`py-2.5 text-[11px] font-bold border-2 rounded-xl transition ${selectedProduct.id === p.id
                          ? 'border-purple-600 bg-purple-50 text-purple-700'
                          : 'border-gray-100 text-gray-400 hover:border-purple-200'
                        }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <SliderField
                label="Property Value (AED)"
                value={propertyValue}
                onChange={setPropertyValue}
                min={200000} max={10000000} step={10000}
              />
              <SliderField
                label="Downpayment (AED)"
                value={downpayment}
                onChange={setDownpayment}
                min={0} max={2000000} step={10000}
              />

              {/* Duration */}
              <div className="mb-5">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Loan Duration</label>
                  <span className="text-sm font-bold text-purple-700">{loanDuration} Yrs</span>
                </div>
                <input
                  type="range" min={1} max={25} step={1} value={loanDuration}
                  onChange={(e) => setLoanDuration(Number(e.target.value))}
                  className="w-full accent-purple-600 h-1"
                />
                <div className="flex justify-between text-[10px] text-gray-300 mt-1"><span>1 yr</span><span>25 yrs</span></div>
              </div>
            </>
          )}

          <button
            onClick={() => setShowModal(true)}
            className="w-full bg-[#5C039B] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-purple-900 transition flex items-center justify-center gap-2 mt-2"
          >
            Recalculate Power <FaArrowRight className="text-xs" />
          </button>
        </div>

        {/* ── COL 3: Result ── */}
        <div
          className="px-8 py-10 flex flex-col justify-between"
          style={{ background: 'linear-gradient(145deg, #3b0764 0%, #1e1b4b 100%)' }}
        >
          <div>
            {/* Top label */}
            <p className="text-[10px] font-bold uppercase tracking-widest text-purple-300 mb-1">
              {activeTab === 'affordability' ? 'Maximum Loan Amount' : 'Monthly Installment'}
            </p>

            {/* Big number */}
            {activeTab === 'affordability' ? (
              isEligible ? (
                <p className="text-4xl font-black text-white tracking-tight mb-6">
                  {formatCurrency(affordability)}
                </p>
              ) : (
                <div className="bg-white/10 border border-white/20 rounded-2xl p-4 mb-6">
                  <p className="text-red-300 font-bold text-sm mb-1">Eligibility Issue</p>
                  <p className="text-purple-200 text-xs">Minimum salary AED {MIN_SALARY.toLocaleString()} not met.</p>
                </div>
              )
            ) : (
              <p className="text-4xl font-black text-white tracking-tight mb-6">
                {formatCurrency(monthlyEMI)}
              </p>
            )}

            {/* Divider */}
            <div className="border-t border-white/10 mb-5" />

            {/* Stats grid */}
            <div className="flex flex-col gap-4">
              {activeTab === 'affordability' ? (
                <>
                  <div className="flex justify-between items-center">
                    <p className="text-[12px] font-bold text-purple-300/70 uppercase tracking-widest">
                      Estimated Repayment
                    </p>
                    <p className="text-base font-bold text-emerald-100">
                      {isEligible ? `${formatCurrency(estimatedEMI)}/mo` : '—'}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[12px] font-bold text-purple-300/70 uppercase tracking-widest mb-1">Interest Rate</p>
                    <p className="text-base font-bold text-white">{stressRate.toFixed(2)}%</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[12px] font-bold text-purple-300/70 uppercase tracking-widest mb-1">Loan Term</p>
                    <p className="text-base font-bold text-white">{loanTenure} Years</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[12px] font-bold text-purple-300/70 uppercase tracking-widest mb-1">Max LTV</p>
                    <p className="text-base font-bold text-white">85%</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <p className="text-[12px] font-bold text-purple-300/70 uppercase tracking-widest mb-1">Total Loan</p>
                    <p className="text-base font-bold text-emerald-100">{formatCurrency(loanAmount)}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[12px] font-bold text-purple-300/70 uppercase tracking-widest mb-1">Interest Rate</p>
                    <p className="text-base font-bold text-white">{selectedProduct.rate}%</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[12px] font-bold text-purple-300/70 uppercase tracking-widest mb-1">Loan Term</p>
                    <p className="text-base font-bold text-white">{loanDuration} Years</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[12px] font-bold text-purple-300/70 uppercase tracking-widest mb-1">Loan to Value</p>
                    <p className="text-base font-bold text-white">{ltv}%</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bottom CTA */}
          <button
            onClick={() => setShowModal(true)}
            className="mt-8 w-full flex items-center justify-between bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold px-4 py-3.5 rounded-xl transition"
          >
            <span>View Full Amortization Schedule</span>
            <FaArrowRight className="text-xs" />
          </button>
        </div>
      </div>

      {/* Pre-Approval Modal */}
      <PreApprovalModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        calculatorData={calculatorData}
      />
    </div>
  );
}