import React, { useState } from 'react';
import { apiService } from '../../../manageApi/utils/custom.apiservice';
import { User, Home, FileText, Briefcase, Plus, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

// Full initial state matching the Mongoose schema
const initialFormState = {
  customerInfo: {
    fullName: '', preferredName: '', email: '', mobileNumber: '', alternativePhone: '',
    whatsappNumber: '', dateOfBirth: '', nationality: 'UAE', maritalStatus: 'Single',
    numberOfDependents: '', occupation: '', employer: '', monthlySalary: '',
  },
  propertyDetails: {
    propertyType: 'Ready', propertySubtype: 'Apartment', propertyValue: '', downPaymentAmount: '',
    loanAmountRequired: '', propertyAddress: { building: '', area: '', city: 'Dubai' },
    propertyAgeYears: '', isOffPlan: false, completionDate: '',
  },
  loanRequirements: {
    preferredTenureYears: 25, preferredInterestRateType: 'Fixed', preferredBanks: [],
    feeFinancingPreference: true, lifeInsurancePreference: true, propertyInsurancePreference: true,
    specialRequirements: '',
  },
  referralType: 'Referral Only', notesToXoto: '',
};

// --- REUSABLE UI COMPONENTS ---
const SectionCard = ({ title, description, icon: Icon, children }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center">
      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4 text-blue-600">
        <Icon size={20} />
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500 font-medium">{description}</p>
      </div>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const InputField = ({ label, required, suffix, ...props }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative flex items-center rounded-lg bg-white border border-slate-300 transition-all focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 shadow-sm">
      <input 
        className="flex-1 px-3.5 py-2.5 outline-none text-slate-900 placeholder-slate-400 bg-transparent w-full text-[15px]" 
        required={required}
        {...props} 
      />
      {suffix && <div className="px-3.5 py-2.5 text-slate-500 text-sm font-semibold border-l border-slate-200 bg-slate-50 rounded-r-lg">{suffix}</div>}
    </div>
  </div>
);

const SelectField = ({ label, required, options, ...props }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select 
      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all bg-white shadow-sm text-[15px] text-slate-900"
      required={required}
      {...props}
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const CheckboxField = ({ label, ...props }) => (
  <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
    <input type="checkbox" className="h-4.5 w-4.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500" {...props} />
    <span className="text-sm font-semibold text-slate-700">{label}</span>
  </label>
);

// --- MAIN COMPONENT ---
const VaultCreateLeads = () => {
  const [form, setForm] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [bankInput, setBankInput] = useState('');
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', msg: '' }

  const handleChange = (section, field, value, subfield = null) => {
    setForm((prev) => ({
      ...prev,
      [section]: subfield 
        ? { ...prev[section], [field]: { ...prev[section][field], [subfield]: value } }
        : { ...prev[section], [field]: value }
    }));
  };

  const handleTopLevelChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const addBank = () => {
    if (bankInput.trim() && !form.loanRequirements.preferredBanks.includes(bankInput.trim())) {
      setForm((prev) => ({
        ...prev, loanRequirements: { ...prev.loanRequirements, preferredBanks: [...prev.loanRequirements.preferredBanks, bankInput.trim()] }
      }));
      setBankInput('');
    }
  };

  const removeBank = (index) => {
    setForm((prev) => ({
      ...prev, loanRequirements: { ...prev.loanRequirements, preferredBanks: prev.loanRequirements.preferredBanks.filter((_, i) => i !== index) }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Native form validation support
    setStatus(null);
    setLoading(true);

    try {
      const payload = {
        ...form,
        customerInfo: {
          ...form.customerInfo,
          dateOfBirth: form.customerInfo.dateOfBirth ? new Date(form.customerInfo.dateOfBirth).toISOString() : null,
          numberOfDependents: form.customerInfo.numberOfDependents ? Number(form.customerInfo.numberOfDependents) : 0,
          monthlySalary: form.customerInfo.monthlySalary ? Number(form.customerInfo.monthlySalary) : null,
        },
        propertyDetails: {
          ...form.propertyDetails,
          propertyValue: Number(form.propertyDetails.propertyValue),
          downPaymentAmount: form.propertyDetails.downPaymentAmount ? Number(form.propertyDetails.downPaymentAmount) : null,
          loanAmountRequired: form.propertyDetails.loanAmountRequired ? Number(form.propertyDetails.loanAmountRequired) : null,
          propertyAgeYears: form.propertyDetails.propertyAgeYears ? Number(form.propertyDetails.propertyAgeYears) : null,
          completionDate: form.propertyDetails.completionDate ? new Date(form.propertyDetails.completionDate).toISOString() : null,
        },
        loanRequirements: {
          ...form.loanRequirements,
          preferredTenureYears: Number(form.loanRequirements.preferredTenureYears),
        },
      };

      await apiService.post('/vault/lead/create', payload);
      setStatus({ type: 'success', msg: 'Lead created successfully!' });
      setForm(initialFormState);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Lead creation error:', err);
      setStatus({ type: 'error', msg: err?.response?.data?.message || err.message || 'Failed to create lead' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create New Lead</h1>
          <p className="mt-2 text-slate-500 font-medium">Enter details below to generate a new mortgage lead in the vault.</p>
        </div>

        {status && (
          <div className={`p-4 mb-6 rounded-lg border flex items-start ${status.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-emerald-600" /> : <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-red-600" />}
            <span className="font-semibold">{status.msg}</span>
            <button type="button" onClick={() => setStatus(null)} className="ml-auto"><X size={18} className="opacity-60 hover:opacity-100" /></button>
          </div>
        )}

        {/* FORM WRAPPER FOR NATIVE VALIDATION */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <SectionCard title="Customer Information" description="Personal and employment details" icon={User}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <InputField label="Full Name" required placeholder="Omar Hassan" value={form.customerInfo.fullName} onChange={(e) => handleChange('customerInfo', 'fullName', e.target.value)} />
              <InputField label="Preferred Name" placeholder="Omar" value={form.customerInfo.preferredName} onChange={(e) => handleChange('customerInfo', 'preferredName', e.target.value)} />
              <InputField label="Email Address" type="email" required placeholder="omar@example.com" value={form.customerInfo.email} onChange={(e) => handleChange('customerInfo', 'email', e.target.value)} />
              <InputField label="Mobile Number" type="tel" required placeholder="+971 XX XXX XXXX" value={form.customerInfo.mobileNumber} onChange={(e) => handleChange('customerInfo', 'mobileNumber', e.target.value)} />
              <InputField label="Alternative Phone" type="tel" placeholder="+971 XX XXX XXXX" value={form.customerInfo.alternativePhone} onChange={(e) => handleChange('customerInfo', 'alternativePhone', e.target.value)} />
              <InputField label="WhatsApp Number" type="tel" placeholder="+971 XX XXX XXXX" value={form.customerInfo.whatsappNumber} onChange={(e) => handleChange('customerInfo', 'whatsappNumber', e.target.value)} />
              <InputField label="Date of Birth" type="date" required value={form.customerInfo.dateOfBirth} onChange={(e) => handleChange('customerInfo', 'dateOfBirth', e.target.value)} />
              <InputField label="Nationality" required placeholder="UAE" value={form.customerInfo.nationality} onChange={(e) => handleChange('customerInfo', 'nationality', e.target.value)} />
              <SelectField label="Marital Status" required options={['Single', 'Married', 'Divorced', 'Widowed']} value={form.customerInfo.maritalStatus} onChange={(e) => handleChange('customerInfo', 'maritalStatus', e.target.value)} />
              <InputField label="Dependents" type="number" min="0" placeholder="0" value={form.customerInfo.numberOfDependents} onChange={(e) => handleChange('customerInfo', 'numberOfDependents', e.target.value)} />
              <InputField label="Occupation" placeholder="Senior Manager" value={form.customerInfo.occupation} onChange={(e) => handleChange('customerInfo', 'occupation', e.target.value)} />
              <InputField label="Employer" placeholder="Company Name" value={form.customerInfo.employer} onChange={(e) => handleChange('customerInfo', 'employer', e.target.value)} />
              <InputField label="Monthly Salary" type="number" min="0" suffix="AED" placeholder="35000" value={form.customerInfo.monthlySalary} onChange={(e) => handleChange('customerInfo', 'monthlySalary', e.target.value)} />
            </div>
          </SectionCard>

          <SectionCard title="Property Details" description="Information about the asset" icon={Home}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <SelectField label="Property Type" required options={['Ready', 'Off-plan', 'Commercial']} value={form.propertyDetails.propertyType} onChange={(e) => handleChange('propertyDetails', 'propertyType', e.target.value)} />
              <SelectField label="Property Subtype" options={['Apartment', 'Villa', 'Townhouse', 'Penthouse']} value={form.propertyDetails.propertySubtype} onChange={(e) => handleChange('propertyDetails', 'propertySubtype', e.target.value)} />
              <InputField label="Property Value" type="number" required min="0" suffix="AED" placeholder="2500000" value={form.propertyDetails.propertyValue} onChange={(e) => handleChange('propertyDetails', 'propertyValue', e.target.value)} />
              <InputField label="Down Payment" type="number" min="0" suffix="AED" placeholder="500000" value={form.propertyDetails.downPaymentAmount} onChange={(e) => handleChange('propertyDetails', 'downPaymentAmount', e.target.value)} />
              <InputField label="Loan Required" type="number" min="0" suffix="AED" placeholder="2000000" value={form.propertyDetails.loanAmountRequired} onChange={(e) => handleChange('propertyDetails', 'loanAmountRequired', e.target.value)} />
              <InputField label="Building" placeholder="Palm Tower" value={form.propertyDetails.propertyAddress.building} onChange={(e) => handleChange('propertyDetails', 'propertyAddress', e.target.value, 'building')} />
              <InputField label="Area" placeholder="Palm Jumeirah" value={form.propertyDetails.propertyAddress.area} onChange={(e) => handleChange('propertyDetails', 'propertyAddress', e.target.value, 'area')} />
              <InputField label="City" placeholder="Dubai" value={form.propertyDetails.propertyAddress.city} onChange={(e) => handleChange('propertyDetails', 'propertyAddress', e.target.value, 'city')} />
              <InputField label="Property Age" type="number" min="0" suffix="YRS" placeholder="3" value={form.propertyDetails.propertyAgeYears} onChange={(e) => handleChange('propertyDetails', 'propertyAgeYears', e.target.value)} />
              <InputField label="Completion Date" type="date" value={form.propertyDetails.completionDate} onChange={(e) => handleChange('propertyDetails', 'completionDate', e.target.value)} />
              <div className="flex items-center lg:col-span-2 pt-2">
                <CheckboxField label="This is an Off-Plan Property" checked={form.propertyDetails.isOffPlan} onChange={(e) => handleChange('propertyDetails', 'isOffPlan', e.target.checked)} />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Loan Requirements" description="Financing preferences" icon={Briefcase}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <InputField label="Preferred Tenure" type="number" min="1" max="35" suffix="YRS" placeholder="25" value={form.loanRequirements.preferredTenureYears} onChange={(e) => handleChange('loanRequirements', 'preferredTenureYears', e.target.value)} />
              <SelectField label="Interest Rate Type" options={['Fixed', 'Variable']} value={form.loanRequirements.preferredInterestRateType} onChange={(e) => handleChange('loanRequirements', 'preferredInterestRateType', e.target.value)} />
              
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Preferred Banks</label>
                <div className="flex gap-2 max-w-lg">
                  <div className="relative flex-1 rounded-lg border border-slate-300 bg-white overflow-hidden focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 shadow-sm">
                    <input 
                      type="text" className="w-full px-3.5 py-2.5 outline-none text-slate-900 text-[15px]" placeholder="e.g., Emirates NBD" 
                      value={bankInput} onChange={(e) => setBankInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBank())} 
                    />
                  </div>
                  <button type="button" onClick={addBank} className="px-4 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-semibold transition-colors flex items-center shadow-sm">
                    <Plus size={18} className="mr-1"/> Add
                  </button>
                </div>
                {form.loanRequirements.preferredBanks.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {form.loanRequirements.preferredBanks.map((bank, idx) => (
                      <span key={idx} className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-md text-sm font-bold flex items-center shadow-sm">
                        {bank}
                        <button type="button" onClick={() => removeBank(idx)} className="ml-2 hover:text-red-600 hover:bg-white rounded-full p-0.5 transition-colors"><X size={14}/></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <CheckboxField label="Include Fee Financing" checked={form.loanRequirements.feeFinancingPreference} onChange={(e) => handleChange('loanRequirements', 'feeFinancingPreference', e.target.checked)} />
                <CheckboxField label="Opt for Life Insurance" checked={form.loanRequirements.lifeInsurancePreference} onChange={(e) => handleChange('loanRequirements', 'lifeInsurancePreference', e.target.checked)} />
                <CheckboxField label="Opt for Property Insurance" checked={form.loanRequirements.propertyInsurancePreference} onChange={(e) => handleChange('loanRequirements', 'propertyInsurancePreference', e.target.checked)} />
              </div>

              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Special Requirements</label>
                <textarea 
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all bg-white shadow-sm resize-none text-[15px]" 
                  rows="2" placeholder="Any special needs (e.g., early settlement flexibility)" 
                  value={form.loanRequirements.specialRequirements} onChange={(e) => handleChange('loanRequirements', 'specialRequirements', e.target.value)} 
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Referral & Notes" description="Internal details" icon={FileText}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <SelectField label="Referral Type" required options={['Referral Only', 'Referral + Docs']} value={form.referralType} onChange={(e) => handleTopLevelChange('referralType', e.target.value)} />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notes to Xoto Team</label>
                <textarea 
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all bg-white shadow-sm resize-none text-[15px]" 
                  rows="3" placeholder="Additional context about this lead..." 
                  value={form.notesToXoto} onChange={(e) => handleTopLevelChange('notesToXoto', e.target.value)} 
                />
              </div>
            </div>
          </SectionCard>

          {/* ACTIONS */}
          <div className="flex items-center justify-end pt-4 pb-12 border-t border-slate-200">
            <button 
              type="submit" 
              disabled={loading} 
              className="px-10 py-3.5 bg-blue-600 text-white text-[15px] font-bold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-600/30 disabled:bg-slate-400 transition-all shadow-md flex items-center justify-center min-w-[200px]"
            >
              {loading ? <><Loader2 className="animate-spin mr-2 h-5 w-5" /> Processing...</> : 'Save Lead Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VaultCreateLeads;