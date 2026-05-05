// import React, { useState, useEffect } from 'react';
// import { apiService } from "../../manageApi/utils/custom.apiservice";
// import toast, { Toaster } from 'react-hot-toast';
// import {
//   FaMoneyBillWave, FaPhoneAlt, FaWhatsapp, FaEnvelope,
//   FaCheckCircle, FaInfoCircle, FaTimes, FaCalendarAlt,
//   FaArrowRight, FaCalculator
// } from 'react-icons/fa';

// const PRODUCTS = [
//   { id: '3yr', label: '3yr Fixed', rate: 3.99 },
//   { id: '5yr', label: '5yr Fixed', rate: 4.19 },
//   { id: 'var', label: 'Variable', rate: 7.0 },
// ];

// const LOCATIONS = [
//   'Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman',
//   'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain', 'Al Ain',
// ];

// const COUNTRIES = [
//   { code: 'AE', dialCode: '+971', maxLength: 9, name: 'UAE' },
//   { code: 'IN', dialCode: '+91', maxLength: 10, name: 'India' },
//   { code: 'SA', dialCode: '+966', maxLength: 9, name: 'Saudi Arabia' },
//   { code: 'US', dialCode: '+1', maxLength: 10, name: 'USA' },
//   { code: 'GB', dialCode: '+44', maxLength: 10, name: 'UK' },
//   { code: 'PK', dialCode: '+92', maxLength: 10, name: 'Pakistan' },
//   { code: 'QA', dialCode: '+974', maxLength: 8, name: 'Qatar' },
// ];

// const MIN_SALARY = 10000;
// const DSR = 0.5;
// const getStressRate = (years) => {
//   if (years <= 15) return 3.17;
//   if (years <= 17) return 3.41;
//   if (years <= 20) return 3.68;
//   return 3.98;
// };

// const formatCurrency = (value) =>
//   new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

// const calculateEMI = (principal, annualRate, years) => {
//   if (principal <= 0 || annualRate <= 0 || years <= 0) return 0;
//   const r = annualRate / 100 / 12;
//   const n = years * 12;
//   return Math.round(principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
// };

// const calculatePropertyPrice = (maxEMI, annualRate, years) => {
//   if (maxEMI <= 0) return 0;
//   const r = annualRate / 100 / 12;
//   const n = years * 12;
//   const loanAmount = maxEMI * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
//   return Math.round((loanAmount / 0.85) * 0.92);
// };

// // ─── Modal Wrapper ───────────────────────────────────────────────────────────
// const ModalWrapper = ({ isOpen, onClose, title, subtitle, children }) => {
//   useEffect(() => {
//     document.body.style.overflow = isOpen ? 'hidden' : 'unset';
//     return () => { document.body.style.overflow = 'unset'; };
//   }, [isOpen]);

//   if (!isOpen) return null;
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} style={{ fontFamily: '"DM Sans", sans-serif' }}>
//       <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
//         <div className="relative p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
//           <div>
//             <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h2>
//             {subtitle && <p className="text-sm text-slate-500 font-medium mt-1">{subtitle}</p>}
//           </div>
//           <button onClick={onClose} className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition"><FaTimes size={20} /></button>
//         </div>
//         <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
//       </div>
//     </div>
//   );
// };

// // ─── Loan Summary Modal ──────────────────────────────────────────────────────
// const LoanSummaryModal = ({ isOpen, onClose, data }) => {
//   const downpayment = data.affordability * 0.15;
//   const transactionCosts = data.affordability * 0.055;
//   return (
//     <ModalWrapper isOpen={isOpen} onClose={onClose} title="Cost & Affordability Breakdown" subtitle="Detailed breakdown of your costs">
//       <div className="space-y-5">
//         <div className="space-y-3">
//           <div className="flex justify-between text-slate-600 font-medium"><span>Downpayment (15%)</span><span className="font-semibold text-slate-800">{formatCurrency(downpayment)}</span></div>
//           <div className="flex justify-between text-slate-600 font-medium"><span>Transaction costs (5.5%)</span><span className="font-semibold text-slate-800">{formatCurrency(transactionCosts)}</span></div>
//           <div className="pt-3 border-t border-slate-200 flex justify-between text-lg font-bold text-purple-900"><span>Total Upfront Cost</span><span>{formatCurrency(downpayment + transactionCosts)}</span></div>
//         </div>
//         <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 text-center">
//           <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">Maximum Home Price</p>
//           <p className="text-3xl font-bold text-purple-700 tracking-tight">{formatCurrency(data.affordability * 0.85)}</p>
//         </div>
//         <div className="flex justify-between items-center py-3 px-4 bg-slate-50 rounded-xl border border-slate-100">
//           <span className="text-slate-600 font-medium">Estimated Monthly EMI</span>
//           <span className="font-bold text-xl text-emerald-600">{formatCurrency(data.monthly)}</span>
//         </div>
//         <div className="space-y-2">
//           <div className="flex gap-3 items-start p-3 bg-blue-50 text-blue-800 rounded-xl text-xs font-medium leading-relaxed"><FaInfoCircle className="mt-0.5 shrink-0" /><p>Includes a buffer for potential rate increases.</p></div>
//           <div className="flex gap-3 items-start p-3 bg-amber-50 text-amber-800 rounded-xl text-xs font-medium leading-relaxed"><span className="shrink-0 font-bold">ⓘ</span><p>Most home loans in the UAE have terms up to 25 years, based on your age.</p></div>
//         </div>
//         <button onClick={onClose} className="w-full bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition shadow-lg shadow-purple-200">Got it</button>
//       </div>
//     </ModalWrapper>
//   );
// };

// // ─── Pre-Approval Modal ──────────────────────────────────────────────────────
// const PreApprovalModal = ({ isOpen, onClose, calculatorData }) => {
//   const [step, setStep] = useState('form');
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '', selectedCountry: COUNTRIES[0], email: '', foundProperty: 'no', location: '' });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (formData.phone.length !== formData.selectedCountry.maxLength) { toast.error(`Please enter a valid ${formData.selectedCountry.maxLength}-digit number for ${formData.selectedCountry.name}.`); return; }
//     setLoading(true);
//     const toastId = toast.loading('Submitting your application...');
//     try {
//       const payload = { type: "mortgage", lead_sub_type: "pre_approval", name: { first_name: formData.firstName, last_name: formData.lastName }, mobile: { country_code: formData.selectedCountry.dialCode, number: formData.phone }, email: formData.email, has_property: formData.foundProperty === 'yes', preferred_city: formData.location || "", mortgage: { monthly_income: calculatorData.monthlyIncome, monthly_debt: calculatorData.monthlyDebt } };
//       const res = await apiService.post('/property/lead/', payload);
//       if (res.success || res.status === 200 || res.status === 201) { toast.success('Application submitted!', { id: toastId }); setStep('success'); }
//       else toast.error(res.message || "Something went wrong.", { id: toastId });
//     } catch { toast.error("Network error. Please check your connection.", { id: toastId }); }
//     finally { setLoading(false); }
//   };

//   if (step === 'success') return (
//     <ModalWrapper isOpen={isOpen} onClose={onClose} title="Request Sent!">
//       <div className="text-center py-6">
//         <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"><FaCheckCircle size={40} /></div>
//         <h2 className="text-xl font-bold text-slate-800 mb-2">Thank You!</h2>
//         <p className="text-slate-500 mb-8 font-medium px-4 leading-relaxed">Your pre-approval request has been submitted. Our advisors will contact you within 24 hours.</p>
//         <button onClick={onClose} className="w-full bg-purple-600 text-white py-4 rounded-xl font-semibold">Return to Dashboard</button>
//       </div>
//     </ModalWrapper>
//   );

//   return (
//     <ModalWrapper isOpen={isOpen} onClose={onClose} title="Get Pre-Approved" subtitle="Start your property journey today.">
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div className="grid grid-cols-2 gap-4">
//           <div><label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wide">First Name *</label><input required type="text" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} placeholder="e.g. Rahul" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition font-medium" /></div>
//           <div><label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wide">Last Name *</label><input required type="text" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} placeholder="e.g. Sharma" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition font-medium" /></div>
//         </div>
//         <div>
//           <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wide">Phone *</label>
//           <div className="flex border border-slate-200 rounded-xl bg-slate-50 focus-within:ring-2 focus-within:ring-purple-500 transition overflow-hidden">
//             <div className="flex items-center pl-3 pr-2 bg-slate-100/80 border-r border-slate-200">
//               <img src={`https://flagcdn.com/w20/${formData.selectedCountry.code.toLowerCase()}.png`} alt={formData.selectedCountry.code} className="w-5 h-auto mr-1.5 rounded-[2px]" />
//               <select value={formData.selectedCountry.code} onChange={e => setFormData({ ...formData, selectedCountry: COUNTRIES.find(c => c.code === e.target.value), phone: '' })} className="bg-transparent font-semibold text-slate-700 outline-none text-sm cursor-pointer w-[54px]">{COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.dialCode}</option>)}</select>
//             </div>
//             <input required type="tel" value={formData.phone} onChange={e => { const v = e.target.value.replace(/\D/g, ''); if (v.length <= formData.selectedCountry.maxLength) setFormData({ ...formData, phone: v }); }} placeholder="XX XXX XXXX" className="w-full p-4 bg-transparent outline-none font-medium" />
//           </div>
//         </div>
//         <div><label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wide">Email *</label><input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="you@example.com" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition font-medium" /></div>
//         <div>
//           <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1 uppercase tracking-wide">Found a property? *</label>
//           <div className="flex gap-4">
//             <label className="flex-1 flex items-center justify-center gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition font-medium text-sm"><input type="radio" name="fp" checked={formData.foundProperty === 'yes'} onChange={() => setFormData({ ...formData, foundProperty: 'yes' })} className="accent-purple-600" /> Yes</label>
//             <label className="flex-1 flex items-center justify-center gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition font-medium text-sm"><input type="radio" name="fp" checked={formData.foundProperty === 'no'} onChange={() => setFormData({ ...formData, foundProperty: 'no' })} className="accent-purple-600" /> No</label>
//           </div>
//         </div>
//         {formData.foundProperty === 'yes' && (
//           <div><label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wide">Location *</label><select required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition font-medium"><option value="">Select emirate</option>{LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}</select></div>
//         )}
//         <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer mt-4"><input required type="checkbox" className="mt-1 accent-purple-600" /><span className="text-xs text-slate-500 leading-relaxed font-medium">I agree to receive newsletters and marketing communications. I accept the Terms of Service and Privacy Policy.</span></label>
//         <button type="submit" disabled={loading} className="w-full bg-[#5C039B] text-white py-4 rounded-xl font-semibold hover:bg-[#4a027d] transition shadow-lg shadow-purple-200 mt-2 disabled:opacity-70 flex justify-center items-center">{loading ? 'Submitting...' : 'Submit Application →'}</button>
//       </form>
//     </ModalWrapper>
//   );
// };

// // ─── Contact Modal ───────────────────────────────────────────────────────────
// const ContactModal = ({ isOpen, onClose }) => {
//   const [step, setStep] = useState('schedule');
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [selectedTime, setSelectedTime] = useState(null);
//   const [firstName, setFirstName] = useState('');
//   const [lastName, setLastName] = useState('');
//   const [phone, setPhone] = useState('');
//   const [country, setCountry] = useState(COUNTRIES[0]);
//   const dates = [{ day: 'MON' }, { day: 'TUE' }, { day: 'WED' }, { day: 'THU' }, { day: 'FRI' }];
//   const times = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'];

//   if (step === 'success') return (
//     <ModalWrapper isOpen={isOpen} onClose={onClose} title="Meeting Booked!">
//       <div className="text-center py-6">
//         <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6"><FaCalendarAlt size={32} /></div>
//         <p className="text-slate-500 font-medium mb-8 px-4 leading-relaxed">Your consultation has been secured. We've sent a calendar invite to your email.</p>
//         <button onClick={onClose} className="w-full bg-purple-600 text-white py-4 rounded-xl font-semibold">Done</button>
//       </div>
//     </ModalWrapper>
//   );

//   if (step === 'details') return (
//     <ModalWrapper isOpen={isOpen} onClose={() => setStep('schedule')} title="Your Details" subtitle="Step 2 of 2">
//       <form onSubmit={e => { e.preventDefault(); if (phone.length !== country.maxLength) { toast.error(`Please enter a valid ${country.maxLength}-digit number`); return; } setStep('success'); }} className="space-y-4">
//         <div className="grid grid-cols-2 gap-4">
//           <div><label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wide">First Name</label><input required type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-medium" /></div>
//           <div><label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wide">Last Name</label><input required type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-medium" /></div>
//         </div>
//         <div>
//           <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wide">Phone</label>
//           <div className="flex border border-slate-200 rounded-xl bg-slate-50 focus-within:ring-2 focus-within:ring-purple-500 transition overflow-hidden">
//             <div className="flex items-center pl-3 pr-2 bg-slate-100/80 border-r border-slate-200">
//               <img src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`} alt={country.code} className="w-5 h-auto mr-1.5 rounded-[2px]" />
//               <select value={country.code} onChange={e => { setCountry(COUNTRIES.find(c => c.code === e.target.value)); setPhone(''); }} className="bg-transparent font-semibold text-slate-700 outline-none text-sm cursor-pointer w-[54px]">{COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.dialCode}</option>)}</select>
//             </div>
//             <input required type="tel" value={phone} onChange={e => { const v = e.target.value.replace(/\D/g, ''); if (v.length <= country.maxLength) setPhone(v); }} placeholder="XX XXX XXXX" className="w-full p-4 bg-transparent outline-none font-medium" />
//           </div>
//         </div>
//         <div className="flex gap-3 pt-4">
//           <button type="button" onClick={() => setStep('schedule')} className="flex-1 py-4 rounded-xl font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition">Back</button>
//           <button type="submit" className="flex-1 bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition shadow-lg shadow-purple-200">Confirm →</button>
//         </div>
//       </form>
//     </ModalWrapper>
//   );

//   return (
//     <ModalWrapper isOpen={isOpen} onClose={onClose} title="Book a Call" subtitle="Step 1 of 2 - Choose a time">
//       <div className="space-y-6">
//         <div>
//           <p className="text-xs font-semibold text-slate-500 mb-3 ml-1 uppercase tracking-wide">Select Date</p>
//           <div className="grid grid-cols-5 gap-2">
//             {dates.map((d, i) => (
//               <button key={i} onClick={() => setSelectedDate(i)} className={`p-3 text-center border-2 rounded-xl transition ${selectedDate === i ? 'border-purple-600 bg-purple-50' : 'border-slate-100 hover:border-purple-200'}`}>
//                 <div className={`text-sm font-bold ${selectedDate === i ? 'text-purple-600' : 'text-slate-600'}`}>{d.day}</div>
//               </button>
//             ))}
//           </div>
//         </div>
//         <div>
//           <p className="text-xs font-semibold text-slate-500 mb-3 ml-1 uppercase tracking-wide">Select Time</p>
//           <div className="grid grid-cols-3 gap-3">
//             {times.map((t, i) => (
//               <button key={i} onClick={() => setSelectedTime(i)} className={`py-3 text-sm font-semibold text-center border-2 rounded-xl transition ${selectedTime === i ? 'border-purple-600 bg-purple-600 text-white' : 'border-slate-100 text-slate-600 hover:border-purple-200'}`}>{t}</button>
//             ))}
//           </div>
//         </div>
//         <button onClick={() => setStep('details')} disabled={selectedDate === null || selectedTime === null} className={`w-full py-4 rounded-xl font-semibold transition ${selectedDate !== null && selectedTime !== null ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 hover:bg-purple-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>Continue →</button>
//       </div>
//     </ModalWrapper>
//   );
// };

// // ─── Main Component ──────────────────────────────────────────────────────────
// export default function PerfectMortgageCalculator() {
//   const [activeTab, setActiveTab] = useState('affordability');
//   const [residency, setResidency] = useState('UAE Resident');
//   const [employment, setEmployment] = useState('');
//   const [monthlyIncome, setMonthlyIncome] = useState(25000);
//   const [monthlyDebt, setMonthlyDebt] = useState('');
//   const [loanTenure, setLoanTenure] = useState(25);
//   const [propertyValue, setPropertyValue] = useState(1500000);
//   const [downpayment, setDownpayment] = useState(300000);
//   const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0]);
//   const [loanDuration, setLoanDuration] = useState(25);
//   const [modals, setModals] = useState({ summary: false, preapproval: false, contact: false });

//   const openModal = (type) => setModals({ ...modals, [type]: true });
//   const closeModal = (type) => setModals({ ...modals, [type]: false });

//   const safeIncome = Number(monthlyIncome) || 0;
//   const safeDebt = Number(monthlyDebt) || 0;
//   const safePropVal = Number(propertyValue) || 0;
//   const safeDownpayment = Number(downpayment) || 0;
//   const maxEMI = safeIncome * DSR - safeDebt;
//   const isEligible = safeIncome >= MIN_SALARY && maxEMI > 0;
//   const stressRate = getStressRate(loanTenure);
//   const affordability = isEligible ? calculatePropertyPrice(maxEMI, stressRate, loanTenure) : 0;
//   const monthlyPayment = isEligible ? Math.round(maxEMI) : 0;
//   const loanAmount = Math.max(0, safePropVal - safeDownpayment);
//   const monthlyEMI = calculateEMI(loanAmount, selectedProduct.rate, loanDuration);
//   const calculatorData = { monthlyIncome: safeIncome, monthlyDebt: safeDebt, loanTenure, propertyValue: safePropVal, downpayment: safeDownpayment, loanAmount, rate: selectedProduct.rate, loanDuration, affordability, monthlyEMI, employment, residency };

//   return (
//     <div className="min-h-screen bg-slate-50 p-4 md:p-10 text-slate-800" style={{ fontFamily: '"DM Sans", sans-serif' }}>
//       <Toaster position="top-center" reverseOrder={false} />
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');
//         input[type=range] { -webkit-appearance: none; appearance: none; height: 6px; border-radius: 999px; background: #E2E8F0; outline: none; cursor: pointer; }
//         input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #7C3AED; border: 3px solid #fff; box-shadow: 0 2px 8px rgba(124,58,237,0.4); cursor: pointer; }
//         input[type=range]::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; background: #7C3AED; border: 3px solid #fff; box-shadow: 0 2px 8px rgba(124,58,237,0.4); cursor: pointer; border: 3px solid white; }
//         input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
//         .field-input { width: 100%; padding: 13px 16px; background: #F8FAFC; border: 1.5px solid #E9EEF5; border-radius: 14px; font-size: 15px; font-weight: 600; color: #1E293B; outline: none; box-sizing: border-box; transition: border-color 0.2s, box-shadow 0.2s; font-family: inherit; }
//         .field-input:focus { border-color: #7C3AED; box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }
//         select.field-input { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%2394A3B8' d='M6 8L0 0h12z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; }
//       `}</style>

//       <div className="max-w-6xl mx-auto">
//         {/* ── FIX 1: 3-col grid, items-stretch so all columns same height ── */}
//         <div className="grid lg:grid-cols-12 gap-8 items-stretch">

//           {/* Col 1 — Heading: flex column, justify-center so text vertically centers inside card height */}
//           <div className="lg:col-span-5 flex flex-col justify-center">
//             {/* FIX: text-4xl + leading-tight makes heading fit in ~2 lines */}
//             <h1 className="text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
//               Discover Your True Buying Power
//             </h1>
//             <p className="text-slate-500 mt-4 text-base font-medium leading-relaxed">
//               Smart property financing for the UAE market.
//             </p>
//           </div>

//           {/* Col 2 — Form Card */}
//           {/* FIX 2: More padding (p-8), bigger gap between sections */}
//           <div className="lg:col-span-4 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">

//             {/* Tab Toggle */}
//             <div className="flex p-1.5 bg-slate-100 rounded-[1.25rem] mb-8">
//               <button onClick={() => setActiveTab('affordability')} className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all ${activeTab === 'affordability' ? 'bg-white text-[#5C039B] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
//                 <FaCalculator size={13} /> Buying Power
//               </button>
//               <button onClick={() => setActiveTab('mortgage')} className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all ${activeTab === 'mortgage' ? 'bg-white text-[#5C039B] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
//                 <FaMoneyBillWave size={13} /> EMI Planner
//               </button>
//             </div>

//             {/* ── Buying Power Tab ── */}
//             {activeTab === 'affordability' && (
//               <div className="space-y-5">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Residency</label>
//                     <select value={residency} onChange={e => setResidency(e.target.value)} className="field-input">
//                       <option>UAE Resident</option><option>UAE National</option><option>Non-Resident</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Employment</label>
//                     <select value={employment} onChange={e => setEmployment(e.target.value)} className="field-input">
//                       <option value="">Select type</option>
//                       <option value="salaried">Salaried</option>
//                       <option value="self_employed">Self-Employed</option>
//                     </select>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Monthly Income (AED)</label>
//                     <input type="number" value={monthlyIncome} onChange={e => setMonthlyIncome(e.target.value)} placeholder="0" className="field-input" />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Monthly Debts (AED)</label>
//                     <input type="number" value={monthlyDebt} onChange={e => setMonthlyDebt(e.target.value)} placeholder="Optional" className="field-input" />
//                   </div>
//                 </div>

//                 {/* Slider */}
//                 <div className="pt-2">
//                   <div className="flex justify-between items-center mb-3">
//                     <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loan Tenure</label>
//                     <span className="text-lg font-bold text-purple-600">{loanTenure} <span className="text-sm font-medium text-slate-400">Yrs</span></span>
//                   </div>
//                   <input type="range" min={5} max={25} value={loanTenure} onChange={e => setLoanTenure(Number(e.target.value))} className="w-full" style={{ accentColor: '#7C3AED' }} />
//                   <div className="flex justify-between text-xs font-medium text-slate-300 mt-2"><span>5 Yrs</span><span>25 Yrs</span></div>
//                 </div>
//               </div>
//             )}

//             {/* ── EMI Planner Tab ── */}
//             {activeTab === 'mortgage' && (
//               <div className="space-y-5">

//                 {/* FIX 3: Rate buttons — 3 in a row, bigger & cleaner */}
//                 <div>
//                   <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Select Rate Type</label>
//                   <div className="grid grid-cols-3 gap-3">
//                     {PRODUCTS.map(p => (
//                       <button key={p.id} onClick={() => setSelectedProduct(p)}
//                         style={{ padding: '14px 8px', border: selectedProduct.id === p.id ? '2px solid #7C3AED' : '1.5px solid #E9EEF5', borderRadius: 14, background: selectedProduct.id === p.id ? '#F5F0FF' : '#F8FAFC', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center', transition: 'all 0.15s' }}>
//                         <div style={{ fontSize: 17, fontWeight: 800, color: selectedProduct.id === p.id ? '#7C3AED' : '#475569', lineHeight: 1.2 }}>{p.rate}%</div>
//                         <div style={{ fontSize: 11, fontWeight: 600, color: selectedProduct.id === p.id ? '#9061F9' : '#94A3B8', marginTop: 3 }}>{p.label}</div>
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Property Value (AED)</label>
//                     <input type="number" value={propertyValue} onChange={e => setPropertyValue(e.target.value)} placeholder="0" className="field-input" />
//                   </div>
//                   <div>
//                     <div className="flex justify-between items-center mb-2">
//                       <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Downpayment</label>
//                       <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
//                         {safePropVal > 0 ? ((safeDownpayment / safePropVal) * 100).toFixed(0) : 0}%
//                       </span>
//                     </div>
//                     <input type="number" value={downpayment} onChange={e => setDownpayment(e.target.value)} placeholder="0" className="field-input" />
//                   </div>
//                 </div>

//                 <div className="pt-2">
//                   <div className="flex justify-between items-center mb-3">
//                     <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loan Duration</label>
//                     <span className="text-lg font-bold text-purple-600">{loanDuration} <span className="text-sm font-medium text-slate-400">Yrs</span></span>
//                   </div>
//                   <input type="range" min={1} max={25} value={loanDuration} onChange={e => setLoanDuration(Number(e.target.value))} className="w-full" style={{ accentColor: '#7C3AED' }} />
//                   <div className="flex justify-between text-xs font-medium text-slate-300 mt-2"><span>1 Yr</span><span>25 Yrs</span></div>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Col 3 — Result Card */}
//           <div className="lg:col-span-3">
//             <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-purple-900/20 relative overflow-hidden flex flex-col justify-between h-full">
//               <div className="absolute -top-20 -right-20 w-56 h-56 bg-white opacity-[0.04] rounded-full" />
//               <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white opacity-[0.03] rounded-full" />

//               <div className="relative z-10">
//                 <p className="text-purple-300 font-bold uppercase tracking-widest text-xs mb-6">
//                   {activeTab === 'affordability' ? 'Your Buying Power' : 'Cost Breakdown'}
//                 </p>

//                 {activeTab === 'affordability' ? (
//                   isEligible ? (
//                     <div>
//                       <p className="text-purple-200 text-sm font-medium mb-1">Max Property Price</p>
//                       <h2 className="text-2xl font-bold mb-2 tracking-tight">{formatCurrency(affordability)}</h2>
//                       <p className="text-purple-400 text-xs font-medium mb-8">Based on 50% DSR stress rate</p>
//                       <div className="border-t border-purple-800/50 pt-6  justify-between items-center">
//                         <div>
//                           <p className="text-purple-300 text-xs font-semibold mb-1 uppercase tracking-wide">Monthly EMI</p>
//                           <p className="text-2xl font-bold">{formatCurrency(monthlyPayment)}</p>
//                         </div>
//                         <button onClick={() => openModal('summary')} className="bg-white/10 hover:bg-white/20 px-4 py-2.5 mt-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 border border-white/10">
//                           Breakdown <FaArrowRight size={11} />
//                         </button>
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="bg-white/10 border border-white/20 rounded-2xl p-6">
//                       <div className="font-bold mb-2 text-sm">⚠️ Eligibility Issue</div>
//                       <p className="text-sm text-purple-100 font-medium">Minimum salary of AED {MIN_SALARY.toLocaleString()} is required.</p>
//                     </div>
//                   )
//                 ) : (
//                   <div>
//                     <p className="text-purple-200 text-sm font-medium mb-1">Monthly Installment</p>
//                     <h2 className="text-4xl font-bold mb-2 tracking-tight">{formatCurrency(monthlyEMI)}</h2>
//                     <p className="text-purple-400 text-xs font-medium mb-8">At {selectedProduct.rate}% interest rate</p>
//                     <div className="border-t border-purple-800/50 pt-6 grid grid-cols-2 gap-4">
//                       <div>
//                         <p className="text-purple-300 text-xs font-semibold mb-1 uppercase tracking-wide">Total Loan</p>
//                         <p className="text-xl font-bold">{formatCurrency(loanAmount)}</p>
//                       </div>
//                       <div>
//                         <p className="text-purple-300 text-xs font-semibold mb-1 uppercase tracking-wide">Rate</p>
//                         <p className="text-xl font-bold">{selectedProduct.rate}%</p>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <button onClick={() => openModal('preapproval')}
//                 className="relative z-10 mt-8 w-full bg-white text-[#5C039B] py-4 rounded-xl font-bold text-base hover:bg-slate-50 transition shadow-lg flex justify-center items-center gap-2">
//                 Get Pre-Approved <FaArrowRight size={13} />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       <LoanSummaryModal isOpen={modals.summary} onClose={() => closeModal('summary')} data={{ affordability, monthly: monthlyPayment }} />
//       <PreApprovalModal isOpen={modals.preapproval} onClose={() => closeModal('preapproval')} calculatorData={calculatorData} />
//       <ContactModal isOpen={modals.contact} onClose={() => closeModal('contact')} />
//     </div>
//   );
// }










import React, { useState, useEffect } from 'react';
import { apiService } from "../../manageApi/utils/custom.apiservice";
import toast, { Toaster } from 'react-hot-toast';
// import wave2 from "../../assets/img/wave/wave2.png";
import wave1 from "../../assets/img/wave/waveint2.png";
import {
  FaMoneyBillWave, FaPhoneAlt, FaWhatsapp, FaEnvelope,
  FaCheckCircle, FaInfoCircle, FaTimes, FaCalendarAlt,
  FaArrowRight, FaCalculator
} from 'react-icons/fa';

const PRODUCTS = [
  { id: '3yr', label: '3yr Fixed', rate: 3.99 },
  { id: '5yr', label: '5yr Fixed', rate: 4.19 },
  { id: 'var', label: 'Variable', rate: 7.0 },
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
  new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

const calculateEMI = (principal, annualRate, years) => {
  if (principal <= 0 || annualRate <= 0 || years <= 0) return 0;
  const r = annualRate / 100 / 12;
  const n = years * 12;
  return Math.round(principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
};

const calculatePropertyPrice = (maxEMI, annualRate, years) => {
  if (maxEMI <= 0) return 0;
  const r = annualRate / 100 / 12;
  const n = years * 12;
  const loanAmount = maxEMI * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
  return Math.round((loanAmount / 0.85) * 0.92);
};

// ─── Modal Wrapper ───────────────────────────────────────────────────────────
const ModalWrapper = ({ isOpen, onClose, title, subtitle, children }) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} style={{ fontFamily: '"DM Sans", sans-serif' }}>
      <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="relative p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h2>
            {subtitle && <p className="text-sm text-slate-500 font-medium mt-1">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition"><FaTimes size={20} /></button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

// ─── Loan Summary Modal ──────────────────────────────────────────────────────
const LoanSummaryModal = ({ isOpen, onClose, data }) => {
  const downpayment = data.affordability * 0.15;
  const transactionCosts = data.affordability * 0.055;
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Cost & Affordability Breakdown" subtitle="Detailed breakdown of your costs">
      <div className="space-y-5">
        <div className="space-y-3">
          <div className="flex justify-between text-slate-600 font-medium"><span>Downpayment (15%)</span><span className="font-semibold text-slate-800">{formatCurrency(downpayment)}</span></div>
          <div className="flex justify-between text-slate-600 font-medium"><span>Transaction costs (5.5%)</span><span className="font-semibold text-slate-800">{formatCurrency(transactionCosts)}</span></div>
          <div className="pt-3 border-t border-slate-200 flex justify-between text-lg font-bold text-purple-900"><span>Total Upfront Cost</span><span>{formatCurrency(downpayment + transactionCosts)}</span></div>
        </div>
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 text-center">
          <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">Maximum Home Price</p>
          <p className="text-3xl font-bold text-purple-700 tracking-tight">{formatCurrency(data.affordability * 0.85)}</p>
        </div>
        <div className="flex justify-between items-center py-3 px-4 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-slate-600 font-medium">Estimated Monthly EMI</span>
          <span className="font-bold text-xl text-emerald-600">{formatCurrency(data.monthly)}</span>
        </div>
        <div className="space-y-2">
          <div className="flex gap-3 items-start p-3 bg-blue-50 text-blue-800 rounded-xl text-xs font-medium leading-relaxed"><FaInfoCircle className="mt-0.5 shrink-0" /><p>Includes a buffer for potential rate increases.</p></div>
          <div className="flex gap-3 items-start p-3 bg-amber-50 text-amber-800 rounded-xl text-xs font-medium leading-relaxed"><span className="shrink-0 font-bold">ⓘ</span><p>Most home loans in the UAE have terms up to 25 years, based on your age.</p></div>
        </div>
        <button onClick={onClose} className="w-full bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition shadow-lg shadow-purple-200">Got it</button>
      </div>
    </ModalWrapper>
  );
};

// ─── Pre-Approval Modal ──────────────────────────────────────────────────────
const PreApprovalModal = ({ isOpen, onClose, calculatorData }) => {
  const [step, setStep] = useState('form');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    firstName: '', 
    lastName: '', 
    phone: '', 
    selectedCountry: COUNTRIES[0], 
    email: '', 
    foundProperty: 'no', 
    location: '',
    gender: 'Male',
    dateOfBirth: '',
    nationality: COUNTRIES[0].name,
    maritalStatus: 'Single'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate phone number
    if (formData.phone.length !== formData.selectedCountry.maxLength) { 
      toast.error(`Please enter a valid ${formData.selectedCountry.maxLength}-digit number for ${formData.selectedCountry.name}.`); 
      return; 
    }
    
    // Validate date of birth
    if (!formData.dateOfBirth) {
      toast.error('Please enter your date of birth');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Submitting your application...');
    
    try {
      // Prepare payload for your new API endpoint
      const payload = {
        customerInfo: {
          fullName: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          mobileNumber: formData.phone,
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
          nationality: formData.nationality,
          maritalStatus: formData.maritalStatus,
          occupation: calculatorData.employment || 'Not specified',
          monthlySalary: calculatorData.monthlyIncome,
          numberOfDependents: 0
        },
        propertyDetails: {
          propertyType: formData.foundProperty === 'yes' ? 'Ready' : 'Off-plan',
          propertySubtype: 'Apartment',
          propertyValue: calculatorData.propertyValue || 0,
          downPaymentAmount: calculatorData.downpayment || 0,
          loanAmountRequired: calculatorData.loanAmount || 0,
          propertyAddress: {
            area: formData.location || '',
            city: formData.location || 'Dubai'
          },
          isOffPlan: formData.foundProperty === 'no'
        },
        loanRequirements: {
          preferredTenureYears: calculatorData.loanDuration || 25,
          preferredInterestRateType: calculatorData.rate === 3.99 || calculatorData.rate === 4.19 ? 'Fixed' : 'Variable',
          feeFinancingPreference: true,
          lifeInsurancePreference: true,
          propertyInsurancePreference: true
        },
        notesToXoto: `Lead from mortgage calculator. Residency: ${calculatorData.residency}. Employment: ${calculatorData.employment || 'Not specified'}. Monthly Income: ${calculatorData.monthlyIncome} AED. Monthly Debt: ${calculatorData.monthlyDebt} AED. Selected Property Value: ${calculatorData.propertyValue} AED. Downpayment: ${calculatorData.downpayment} AED.`
      };

      // Make API call to your new endpoint
      const response = await apiService.post('/vault/lead/website', payload);
      
      if (response.success || response.status === 200 || response.status === 201) { 
        toast.success(response.message || 'Application submitted successfully!', { id: toastId }); 
        setStep('success'); 
      } else {
        toast.error(response.message || "Something went wrong.", { id: toastId });
      }
    } catch (error) {
      console.error('Lead submission error:', error);
      toast.error(error.response?.data?.message || "Network error. Please check your connection.", { id: toastId });
    } finally { 
      setLoading(false); 
    }
  };

  if (step === 'success') return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Application Received!">
      <div className="text-center py-6">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"><FaCheckCircle size={40} /></div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Thank You, {formData.firstName}!</h2>
        <p className="text-slate-500 mb-8 font-medium px-4 leading-relaxed">Your mortgage application has been submitted successfully. Our dedicated mortgage advisors will contact you within 24 hours to discuss your options.</p>
        <button onClick={onClose} className="w-full bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition">Return to Calculator</button>
      </div>
    </ModalWrapper>
  );

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Get Pre-Approved" subtitle="Complete your details to start your property journey">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wide">First Name *</label>
            <input required type="text" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} placeholder="e.g. John" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition font-medium" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wide">Last Name *</label>
            <input required type="text" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} placeholder="e.g. Smith" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition font-medium" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wide">Gender *</label>
            <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-medium">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wide">Date of Birth *</label>
            <input required type="date" value={formData.dateOfBirth} onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-medium" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wide">Nationality *</label>
          <select value={formData.nationality} onChange={e => setFormData({ ...formData, nationality: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-medium">
            {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wide">Marital Status *</label>
          <select value={formData.maritalStatus} onChange={e => setFormData({ ...formData, maritalStatus: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-medium">
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Divorced">Divorced</option>
            <option value="Widowed">Widowed</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wide">Phone *</label>
          <div className="flex border border-slate-200 rounded-xl bg-slate-50 focus-within:ring-2 focus-within:ring-purple-500 transition overflow-hidden">
            <div className="flex items-center pl-3 pr-2 bg-slate-100/80 border-r border-slate-200">
              <img src={`https://flagcdn.com/w20/${formData.selectedCountry.code.toLowerCase()}.png`} alt={formData.selectedCountry.code} className="w-5 h-auto mr-1.5 rounded-[2px]" />
              <select value={formData.selectedCountry.code} onChange={e => setFormData({ ...formData, selectedCountry: COUNTRIES.find(c => c.code === e.target.value), phone: '' })} className="bg-transparent font-semibold text-slate-700 outline-none text-sm cursor-pointer w-[54px]">
                {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.dialCode}</option>)}
              </select>
            </div>
            <input required type="tel" value={formData.phone} onChange={e => { const v = e.target.value.replace(/\D/g, ''); if (v.length <= formData.selectedCountry.maxLength) setFormData({ ...formData, phone: v }); }} placeholder="XX XXX XXXX" className="w-full p-4 bg-transparent outline-none font-medium" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wide">Email *</label>
          <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="you@example.com" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition font-medium" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1 uppercase tracking-wide">Found a property? *</label>
          <div className="flex gap-4">
            <label className="flex-1 flex items-center justify-center gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition font-medium text-sm">
              <input type="radio" name="fp" checked={formData.foundProperty === 'yes'} onChange={() => setFormData({ ...formData, foundProperty: 'yes' })} className="accent-purple-600" /> Yes
            </label>
            <label className="flex-1 flex items-center justify-center gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition font-medium text-sm">
              <input type="radio" name="fp" checked={formData.foundProperty === 'no'} onChange={() => setFormData({ ...formData, foundProperty: 'no' })} className="accent-purple-600" /> No
            </label>
          </div>
        </div>

        {formData.foundProperty === 'yes' && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wide">Preferred Location *</label>
            <select required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-medium">
              <option value="">Select emirate</option>
              {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>
        )}

        {/* Display Calculator Summary */}
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
          <p className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-2">Your Mortgage Summary</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-slate-600">Monthly Income:</span><span className="font-semibold">{formatCurrency(calculatorData.monthlyIncome)}</span></div>
            <div className="flex justify-between"><span className="text-slate-600">Property Value:</span><span className="font-semibold">{formatCurrency(calculatorData.propertyValue)}</span></div>
            <div className="flex justify-between"><span className="text-slate-600">Downpayment:</span><span className="font-semibold">{formatCurrency(calculatorData.downpayment)}</span></div>
            <div className="flex justify-between"><span className="text-slate-600">Loan Amount:</span><span className="font-semibold">{formatCurrency(calculatorData.loanAmount)}</span></div>
            <div className="flex justify-between"><span className="text-slate-600">Monthly EMI:</span><span className="font-semibold text-purple-700">{formatCurrency(calculatorData.monthlyEMI)}</span></div>
          </div>
        </div>

        <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer mt-4">
          <input required type="checkbox" className="mt-1 accent-purple-600" />
          <span className="text-xs text-slate-500 leading-relaxed font-medium">I agree to receive newsletters and marketing communications. I accept the Terms of Service and Privacy Policy.</span>
        </label>

        <button type="submit" disabled={loading} className="w-full bg-[#5C039B] text-white py-4 rounded-xl font-semibold hover:bg-[#4a027d] transition shadow-lg shadow-purple-200 mt-2 disabled:opacity-70 flex justify-center items-center gap-2">
          {loading ? 'Submitting...' : 'Submit Application →'}
        </button>
      </form>
    </ModalWrapper>
  );
};

// ─── Contact Modal ───────────────────────────────────────────────────────────
const ContactModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState('schedule');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState(COUNTRIES[0]);
  const dates = [{ day: 'MON' }, { day: 'TUE' }, { day: 'WED' }, { day: 'THU' }, { day: 'FRI' }];
  const times = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'];

  if (step === 'success') return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Meeting Booked!">
      <div className="text-center py-6">
        <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6"><FaCalendarAlt size={32} /></div>
        <p className="text-slate-500 font-medium mb-8 px-4 leading-relaxed">Your consultation has been secured. We've sent a calendar invite to your email.</p>
        <button onClick={onClose} className="w-full bg-purple-600 text-white py-4 rounded-xl font-semibold">Done</button>
      </div>
    </ModalWrapper>
  );

  if (step === 'details') return (
    <ModalWrapper isOpen={isOpen} onClose={() => setStep('schedule')} title="Your Details" subtitle="Step 2 of 2">
      <form onSubmit={e => { e.preventDefault(); if (phone.length !== country.maxLength) { toast.error(`Please enter a valid ${country.maxLength}-digit number`); return; } setStep('success'); }} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wide">First Name</label><input required type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-medium" /></div>
          <div><label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wide">Last Name</label><input required type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-medium" /></div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wide">Phone</label>
          <div className="flex border border-slate-200 rounded-xl bg-slate-50 focus-within:ring-2 focus-within:ring-purple-500 transition overflow-hidden">
            <div className="flex items-center pl-3 pr-2 bg-slate-100/80 border-r border-slate-200">
              <img src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`} alt={country.code} className="w-5 h-auto mr-1.5 rounded-[2px]" />
              <select value={country.code} onChange={e => { setCountry(COUNTRIES.find(c => c.code === e.target.value)); setPhone(''); }} className="bg-transparent font-semibold text-slate-700 outline-none text-sm cursor-pointer w-[54px]">{COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.dialCode}</option>)}</select>
            </div>
            <input required type="tel" value={phone} onChange={e => { const v = e.target.value.replace(/\D/g, ''); if (v.length <= country.maxLength) setPhone(v); }} placeholder="XX XXX XXXX" className="w-full p-4 bg-transparent outline-none font-medium" />
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <button type="button" onClick={() => setStep('schedule')} className="flex-1 py-4 rounded-xl font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition">Back</button>
          <button type="submit" className="flex-1 bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition shadow-lg shadow-purple-200">Confirm →</button>
        </div>
      </form>
    </ModalWrapper>
  );

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Book a Call" subtitle="Step 1 of 2 - Choose a time">
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-3 ml-1 uppercase tracking-wide">Select Date</p>
          <div className="grid grid-cols-5 gap-2">
            {dates.map((d, i) => (
              <button key={i} onClick={() => setSelectedDate(i)} className={`p-3 text-center border-2 rounded-xl transition ${selectedDate === i ? 'border-purple-600 bg-purple-50' : 'border-slate-100 hover:border-purple-200'}`}>
                <div className={`text-sm font-bold ${selectedDate === i ? 'text-purple-600' : 'text-slate-600'}`}>{d.day}</div>
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-3 ml-1 uppercase tracking-wide">Select Time</p>
          <div className="grid grid-cols-3 gap-3">
            {times.map((t, i) => (
              <button key={i} onClick={() => setSelectedTime(i)} className={`py-3 text-sm font-semibold text-center border-2 rounded-xl transition ${selectedTime === i ? 'border-purple-600 bg-purple-600 text-white' : 'border-slate-100 text-slate-600 hover:border-purple-200'}`}>{t}</button>
            ))}
          </div>
        </div>
        <button onClick={() => setStep('details')} disabled={selectedDate === null || selectedTime === null} className={`w-full py-4 rounded-xl font-semibold transition ${selectedDate !== null && selectedTime !== null ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 hover:bg-purple-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>Continue →</button>
      </div>
    </ModalWrapper>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function PerfectMortgageCalculator() {
  const [activeTab, setActiveTab] = useState('affordability');
  const [residency, setResidency] = useState('UAE Resident');
  const [employment, setEmployment] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState(25000);
  const [monthlyDebt, setMonthlyDebt] = useState('');
  const [loanTenure, setLoanTenure] = useState(25);
  const [propertyValue, setPropertyValue] = useState(1500000);
  const [downpayment, setDownpayment] = useState(300000);
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0]);
  const [loanDuration, setLoanDuration] = useState(25);
  const [modals, setModals] = useState({ summary: false, preapproval: false, contact: false });

  const openModal = (type) => setModals({ ...modals, [type]: true });
  const closeModal = (type) => setModals({ ...modals, [type]: false });

  const safeIncome = Number(monthlyIncome) || 0;
  const safeDebt = Number(monthlyDebt) || 0;
  const safePropVal = Number(propertyValue) || 0;
  const safeDownpayment = Number(downpayment) || 0;
  const maxEMI = safeIncome * DSR - safeDebt;
  const isEligible = safeIncome >= MIN_SALARY && maxEMI > 0;
  const stressRate = getStressRate(loanTenure);
  const affordability = isEligible ? calculatePropertyPrice(maxEMI, stressRate, loanTenure) : 0;
  const monthlyPayment = isEligible ? Math.round(maxEMI) : 0;
  const loanAmount = Math.max(0, safePropVal - safeDownpayment);
  const monthlyEMI = calculateEMI(loanAmount, selectedProduct.rate, loanDuration);
  const calculatorData = { 
    monthlyIncome: safeIncome, 
    monthlyDebt: safeDebt, 
    loanTenure, 
    propertyValue: safePropVal, 
    downpayment: safeDownpayment, 
    loanAmount, 
    rate: selectedProduct.rate, 
    loanDuration, 
    affordability, 
    monthlyEMI, 
    employment, 
    residency 
  };

  return (
    <div className="relative  bg-[var(--color-body)] p-4 md:p-10 text-slate-800 overflow-hidden" style={{ fontFamily: '"DM Sans", sans-serif' }}>
<img 
  src={wave1} 
  className="absolute bottom-0 pointer-events-none"
  style={{ 
    width: '100vw',
    left: '50%',
    transform: 'translateX(-50%) translateY(30%)',
    minWidth: '100%'
  }}  
  alt="" 
/>
      <Toaster position="top-center" reverseOrder={false} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');
        input[type=range] { -webkit-appearance: none; appearance: none; height: 6px; border-radius: 999px; background: #E2E8F0; outline: none; cursor: pointer; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #7C3AED; border: 3px solid #fff; box-shadow: 0 2px 8px rgba(124,58,237,0.4); cursor: pointer; }
        input[type=range]::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; background: #7C3AED; border: 3px solid #fff; box-shadow: 0 2px 8px rgba(124,58,237,0.4); cursor: pointer; border: 3px solid white; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        .field-input { width: 100%; padding: 13px 16px; background: #F8FAFC; border: 1.5px solid #E9EEF5; border-radius: 14px; font-size: 15px; font-weight: 600; color: #1E293B; outline: none; box-sizing: border-box; transition: border-color 0.2s, box-shadow 0.2s; font-family: inherit; }
        .field-input:focus { border-color: #7C3AED; box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }
        select.field-input { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%2394A3B8' d='M6 8L0 0h12z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; }
      `}</style>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* ── FIX 1: 3-col grid, items-stretch so all columns same height ── */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          {/* Col 1 — Heading */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <h1 className="text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
              Discover Your True Buying Power
            </h1>
            <p className="text-slate-500 mt-4 text-base font-medium leading-relaxed">
              Smart property financing for the UAE market.
            </p>
          </div>

          {/* Col 2 — Form Card */}
          <div className="lg:col-span-4 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            {/* Tab Toggle */}
            <div className="flex p-1.5 bg-slate-100 rounded-[1.25rem] mb-8">
              <button onClick={() => setActiveTab('affordability')} className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all ${activeTab === 'affordability' ? 'bg-white text-[#5C039B] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                <FaCalculator size={13} /> Buying Power
              </button>
              <button onClick={() => setActiveTab('mortgage')} className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all ${activeTab === 'mortgage' ? 'bg-white text-[#5C039B] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                <FaMoneyBillWave size={13} /> EMI Planner
              </button>
            </div>

            {/* Buying Power Tab */}
            {activeTab === 'affordability' && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Residency</label>
                    <select value={residency} onChange={e => setResidency(e.target.value)} className="field-input">
                      <option>UAE Resident</option><option>UAE National</option><option>Non-Resident</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Employment</label>
                    <select value={employment} onChange={e => setEmployment(e.target.value)} className="field-input">
                      <option value="">Select type</option>
                      <option value="salaried">Salaried</option>
                      <option value="self_employed">Self-Employed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Monthly Income (AED)</label>
                    <input type="number" value={monthlyIncome} onChange={e => setMonthlyIncome(e.target.value)} placeholder="0" className="field-input" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Monthly Debts (AED)</label>
                    <input type="number" value={monthlyDebt} onChange={e => setMonthlyDebt(e.target.value)} placeholder="Optional" className="field-input" />
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loan Tenure</label>
                    <span className="text-lg font-bold text-purple-600">{loanTenure} <span className="text-sm font-medium text-slate-400">Yrs</span></span>
                  </div>
                  <input type="range" min={5} max={25} value={loanTenure} onChange={e => setLoanTenure(Number(e.target.value))} className="w-full" style={{ accentColor: '#7C3AED' }} />
                  <div className="flex justify-between text-xs font-medium text-slate-300 mt-2"><span>5 Yrs</span><span>25 Yrs</span></div>
                </div>
              </div>
            )}

            {/* EMI Planner Tab */}
            {activeTab === 'mortgage' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Select Rate Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {PRODUCTS.map(p => (
                      <button key={p.id} onClick={() => setSelectedProduct(p)}
                        style={{ padding: '14px 8px', border: selectedProduct.id === p.id ? '2px solid #7C3AED' : '1.5px solid #E9EEF5', borderRadius: 14, background: selectedProduct.id === p.id ? '#F5F0FF' : '#F8FAFC', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center', transition: 'all 0.15s' }}>
                        <div style={{ fontSize: 17, fontWeight: 800, color: selectedProduct.id === p.id ? '#7C3AED' : '#475569', lineHeight: 1.2 }}>{p.rate}%</div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: selectedProduct.id === p.id ? '#9061F9' : '#94A3B8', marginTop: 3 }}>{p.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Property Value (AED)</label>
                    <input type="number" value={propertyValue} onChange={e => setPropertyValue(e.target.value)} placeholder="0" className="field-input" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Downpayment</label>
                      <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                        {safePropVal > 0 ? ((safeDownpayment / safePropVal) * 100).toFixed(0) : 0}%
                      </span>
                    </div>
                    <input type="number" value={downpayment} onChange={e => setDownpayment(e.target.value)} placeholder="0" className="field-input" />
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loan Duration</label>
                    <span className="text-lg font-bold text-purple-600">{loanDuration} <span className="text-sm font-medium text-slate-400">Yrs</span></span>
                  </div>
                  <input type="range" min={1} max={25} value={loanDuration} onChange={e => setLoanDuration(Number(e.target.value))} className="w-full" style={{ accentColor: '#7C3AED' }} />
                  <div className="flex justify-between text-xs font-medium text-slate-300 mt-2"><span>1 Yr</span><span>25 Yrs</span></div>
                </div>
              </div>
            )}
          </div>

          {/* Col 3 — Result Card */}
          <div className="lg:col-span-3">
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-purple-900/20 relative overflow-hidden flex flex-col justify-between h-full">
              <div className="absolute -top-20 -right-20 w-56 h-56 bg-white opacity-[0.04] rounded-full" />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white opacity-[0.03] rounded-full" />

              <div className="relative z-10">
                <p className="text-purple-300 font-bold uppercase tracking-widest text-xs mb-6">
                  {activeTab === 'affordability' ? 'Your Buying Power' : 'Cost Breakdown'}
                </p>

                {activeTab === 'affordability' ? (
                  isEligible ? (
                    <div>
                      <p className="text-purple-200 text-sm font-medium mb-1">Max Property Price</p>
                      <h2 className="text-2xl font-bold mb-2 tracking-tight">{formatCurrency(affordability)}</h2>
                      <p className="text-purple-400 text-xs font-medium mb-8">Based on 50% DSR stress rate</p>
                      <div className="border-t border-purple-800/50 pt-6 justify-between items-center">
                        <div>
                          <p className="text-purple-300 text-xs font-semibold mb-1 uppercase tracking-wide">Monthly EMI</p>
                          <p className="text-2xl font-bold">{formatCurrency(monthlyPayment)}</p>
                        </div>
                        <button onClick={() => openModal('summary')} className="bg-white/10 hover:bg-white/20 px-4 py-2.5 mt-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 border border-white/10">
                          Breakdown <FaArrowRight size={11} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/10 border border-white/20 rounded-2xl p-6">
                      <div className="font-bold mb-2 text-sm">⚠️ Eligibility Issue</div>
                      <p className="text-sm text-purple-100 font-medium">Minimum salary of AED {MIN_SALARY.toLocaleString()} is required.</p>
                    </div>
                  )
                ) : (
                  <div>
                    <p className="text-purple-200 text-sm font-medium mb-1">Monthly Installment</p>
                    <h2 className="text-4xl font-bold mb-2 tracking-tight">{formatCurrency(monthlyEMI)}</h2>
                    <p className="text-purple-400 text-xs font-medium mb-8">At {selectedProduct.rate}% interest rate</p>
                    <div className="border-t border-purple-800/50 pt-6 flex flex-col gap-3">
                      <div>
                        <p className="text-purple-300 text-xs font-semibold mb-1 uppercase tracking-wide">Total Loan</p>
                        <p className="text-xl font-bold">{formatCurrency(loanAmount)}</p>
                      </div>
                      <div>
                        <p className="text-purple-300 text-xs font-semibold mb-1 uppercase tracking-wide">Rate</p>
                        <p className="text-xl font-bold">{selectedProduct.rate}%</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button onClick={() => openModal('preapproval')}
                className="relative z-10 mt-8 w-full bg-white text-[#5C039B] py-4 rounded-xl font-bold text-base hover:bg-slate-50 transition shadow-lg flex justify-center items-center gap-2">
                Get Pre-Approved <FaArrowRight size={13} />
              </button>
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