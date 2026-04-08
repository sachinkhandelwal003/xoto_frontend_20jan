// src/components/Vault/AgentOnboard.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Mail, Phone, Lock, MapPin, AlertCircle, ChevronRight,
  ChevronLeft, Check, Loader2, CreditCard, Users, FileText,
  ShieldCheck, Banknote, Calendar, Globe, Heart, Plus, Trash2, MessageSquare, ChevronDown
} from "lucide-react";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const STEPS = ["Personal Info", "Address & Emergency", "Identity Documents", "Bank Details"];

// 🔹 Country Data
const countryData = [
  { name: "UAE", code: "+971", iso: "ae" },
  { name: "India", code: "+91", iso: "in" },
  { name: "USA / Canada", code: "+1", iso: "us" },
  { name: "UK", code: "+44", iso: "gb" },
  { name: "Saudi Arabia", code: "+966", iso: "sa" },
  { name: "Qatar", code: "+974", iso: "qa" },
  { name: "Bahrain", code: "+973", iso: "bh" },
  { name: "Kuwait", code: "+965", iso: "kw" },
  { name: "Oman", code: "+968", iso: "om" },
  { name: "Pakistan", code: "+92", iso: "pk" },
  { name: "Egypt", code: "+20", iso: "eg" }
];

const initialForm = {
  first_name: "", last_name: "", email: "", phone_number: "",
  country_code: "+971", password: "", confirmPassword: "", maritalStatus: "", numberOfDependents: 0,
  nationality: "", dateOfBirth: "", gender: "",
  languagePreference: "English", communicationPreference: "WhatsApp",
  dependents: [],
  address: { building: "", apartment: "", area: "", city: "", poBox: "", country: "" },
  emergencyContact: { name: "", relationship: "", phone: "" },
  emiratesId: { number: "", issuanceDate: "", expiryDate: "", frontImageUrl: "", backImageUrl: "" },
  passport: { number: "", countryOfIssue: "", issueDate: "", expiryDate: "", imageUrl: "" },
  visa: { number: "", residencyStatus: "", sponsor: "", expiryDate: "", imageUrl: "" },
  bankDetails: { beneficiaryName: "", bankName: "", accountNumber: "", iban: "", swiftCode: "", accountType: "" },
};

/* ── Reusable Field Wrapper ── */
const Field = ({ label, icon: Icon, error, children, className = "" }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">
      {Icon && <Icon size={12} className="text-purple-700 flex-shrink-0" />}
      {label}
    </label>
    {children}
    {error && (
      <p className="flex items-center gap-1 text-xs text-red-500">
        <AlertCircle size={11} />{error}
      </p>
    )}
  </div>
);

/* ── Reusable Input ── */
const Input = ({ error, className = "", ...props }) => (
  <input
    className={`w-full px-3 py-2.5 text-sm border rounded-lg outline-none bg-white text-gray-800
      placeholder-gray-400 transition-all
      ${error ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"}
      ${className}`}
    {...props}
  />
);

/* ── Reusable Select ── */
const Select = ({ error, children, className = "", ...props }) => (
  <select
    className={`w-full px-3 py-2.5 text-sm border rounded-lg outline-none bg-white text-gray-800
      cursor-pointer appearance-none transition-all
      ${error ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"}
      ${className}`}
    {...props}
  >
    {children}
  </select>
);

/* ── Section Title ── */
const SectionTitle = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-gray-100">
    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
      <Icon size={15} className="text-purple-700" />
    </div>
    <span className="text-base font-bold text-gray-800">{title}</span>
  </div>
);

export default function VaultAgentOnboard() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const selectedCountry = countryData.find(c => c.code === form.country_code) || countryData[0];

  const set = (field, value) => {
    setForm(p => ({ ...p, [field]: value }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: null }));
  };

  const setNested = (parent, field, value) => {
    setForm(p => ({ ...p, [parent]: { ...p[parent], [field]: value } }));
    if (errors[`${parent}.${field}`]) setErrors(p => ({ ...p, [`${parent}.${field}`]: null }));
  };

  const addDependent = () =>
    setForm(p => ({ ...p, dependents: [...p.dependents, { name: "", age: "", relationship: "", location: "" }] }));

  const removeDependent = (i) =>
    setForm(p => ({ ...p, dependents: p.dependents.filter((_, idx) => idx !== i) }));

  const setDependent = (i, field, value) =>
    setForm(p => {
      const deps = [...p.dependents];
      deps[i] = { ...deps[i], [field]: value };
      return { ...p, dependents: deps };
    });

  const validate = () => {
    setErrors({});
    return true;
  };

  const handleNext = () => { if (validate()) setStep(s => s + 1); };
  const handleBack = () => { setStep(s => Math.max(0, s - 1)); setErrors({}); };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        ...form,
        numberOfDependents: Number(form.numberOfDependents),
        dependents: form.dependents.map(d => ({ ...d, age: Number(d.age) })),
        agentType: "PartnerAffiliatedAgent",
        commissionEligible: true,
        commissionPercentage: 45,
        isProfileComplete: true,
        isPhoneVerified: true,
        isEmailVerified: true,
        isActive: true,
        affiliationStatus: "verified",
        affiliationVerifiedAt: new Date().toISOString()
      };

      await apiService.post("/vault/agent/partner/onboard-affiliate", payload);
      setSuccess(true);
    } catch (err) {
      setErrors({ submit: err?.message || "Failed to onboard agent. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  /* ── Success Screen ── */
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-10 max-w-sm w-full text-center shadow-sm border border-gray-100">
          <div className="w-14 h-14 rounded-full bg-purple-700 flex items-center justify-center mx-auto mb-5">
            <Check size={26} className="text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Agent Onboarded!</h2>
          <p className="text-sm text-gray-500 mb-7">The affiliated agent has been successfully registered.</p>
          <div className="flex gap-3">
            <button onClick={() => { setForm(initialForm); setStep(0); setSuccess(false); }} className="flex-1 py-2.5 text-sm font-semibold border-2 border-purple-700 text-purple-700 rounded-lg hover:bg-purple-50 transition">
              Onboard Another
            </button>
            <button onClick={() => navigate("/dashboard/vault-admin/agent-list")} className="flex-1 py-2.5 text-sm font-semibold bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition">
              View Agents
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900">Onboard Affiliated Agent</h1>
          <p className="text-sm text-gray-500 mt-1">Register a new agent under your partnership network.</p>
        </div>

        {/* Step Progress Bar */}
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-5 mb-5">
          <div className="flex items-center w-full">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all
                    ${i < step ? "bg-purple-700 text-white" : i === step ? "bg-purple-700 text-white" : "bg-gray-100 text-gray-400"}`}>
                    {i < step ? <Check size={14} /> : i + 1}
                  </div>
                  <div className="flex flex-col hidden sm:flex">
                    <span className={`text-xs text-gray-400 font-medium`}>Step {i + 1}</span>
                    <span className={`text-sm font-semibold whitespace-nowrap transition-colors
                      ${i === step ? "text-purple-700" : i < step ? "text-gray-700" : "text-gray-400"}`}>
                      {s}
                    </span>
                  </div>
                </div>
                {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-4 rounded-full transition-colors ${i < step ? "bg-purple-700" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Error Banner */}
        {errors.submit && (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl mb-4 text-sm text-red-700">
            <AlertCircle size={15} className="flex-shrink-0" />{errors.submit}
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">

          {/* ── STEP 0: Personal Info ── */}
          {step === 0 && (
            <div>
              <SectionTitle icon={User} title="Personal Information" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="First Name" icon={User}>
                  <Input placeholder="Fatima" value={form.first_name} onChange={e => set("first_name", e.target.value)} />
                </Field>
                <Field label="Last Name" icon={User}>
                  <Input placeholder="Hassan" value={form.last_name} onChange={e => set("last_name", e.target.value)} />
                </Field>
                <Field label="Email" icon={Mail}>
                  <Input type="email" placeholder="agent@example.com" value={form.email} onChange={e => set("email", e.target.value)} />
                </Field>
                
                <Field label="Phone Number" icon={Phone}>
                  <div className="flex gap-2">
                    {/* Dropdown Container */}
                    <div 
                      className="relative flex-shrink-0" 
                      tabIndex={0} 
                      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setIsDropdownOpen(false); }}
                    >
                      <div
                        className={`flex items-center gap-2 px-3 py-2.5 text-sm border rounded-lg bg-white cursor-pointer transition-colors w-[100px] sm:w-[110px]
                          ${isDropdownOpen ? "border-purple-500 ring-2 ring-purple-100" : "border-gray-200 hover:border-purple-300"}`}
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      >
                        <img src={`https://flagcdn.com/w20/${selectedCountry.iso}.png`} alt={selectedCountry.name} className="w-5 h-3.5 object-cover rounded-sm shadow-sm" />
                        <span className="font-medium text-gray-700 flex-1">{form.country_code}</span>
                        <ChevronDown size={14} className={`text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                      </div>
                      
                      {isDropdownOpen && (
                        <div className="absolute top-full left-0 mt-1.5 w-60 bg-white border border-gray-100 shadow-xl rounded-xl z-50 max-h-64 overflow-y-auto py-1">
                          {countryData.map(c => (
                            <button
                              key={c.code}
                              type="button"
                              className={`flex items-center justify-between w-full px-4 py-2.5 text-sm text-left transition-colors
                                ${form.country_code === c.code ? "bg-purple-50" : "hover:bg-gray-50"}`}
                              onClick={() => {
                                set("country_code", c.code);
                                setIsDropdownOpen(false);
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <img src={`https://flagcdn.com/w20/${c.iso}.png`} alt={c.name} className="w-5 h-3.5 object-cover rounded-sm shadow-sm" />
                                <span className={`font-medium ${form.country_code === c.code ? "text-purple-700" : "text-gray-700"}`}>
                                  {c.name}
                                </span>
                              </div>
                              <span className="text-gray-400 text-xs font-medium">{c.code}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <Input 
                      type="tel" 
                      placeholder={selectedCountry.code === "+971" ? "501234567" : "Enter number"} 
                      value={form.phone_number} 
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, ''); 
                        set("phone_number", val);
                      }} 
                    />
                  </div>
                </Field>

                <Field label="Password" icon={Lock}>
                  <Input type="password" placeholder="Min 6 characters" value={form.password} onChange={e => set("password", e.target.value)} />
                </Field>
                <Field label="Confirm Password" icon={Lock}>
                  <Input type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} />
                </Field>
                <Field label="Gender" icon={User}>
                  <Select value={form.gender} onChange={e => set("gender", e.target.value)}>
                    <option value="">Select gender</option>
                    <option>Male</option><option>Female</option>
                  </Select>
                </Field>
                <Field label="Date of Birth" icon={Calendar}>
                  <Input type="date" value={form.dateOfBirth} max={new Date().toISOString().split("T")[0]} onChange={e => set("dateOfBirth", e.target.value)} />
                </Field>
                <Field label="Nationality" icon={Globe}>
                  <Input placeholder="UAE" value={form.nationality} onChange={e => set("nationality", e.target.value)} />
                </Field>
                <Field label="Marital Status" icon={Heart}>
                  <Select value={form.maritalStatus} onChange={e => set("maritalStatus", e.target.value)}>
                    <option value="">Select status</option>
                    <option>Single</option><option>Married</option><option>Divorced</option><option>Widowed</option>
                  </Select>
                </Field>
                <Field label="Language Preference" icon={MessageSquare}>
                  <Input placeholder="English" value={form.languagePreference} onChange={e => set("languagePreference", e.target.value)} />
                </Field>
                <Field label="Comm. Preference" icon={Phone}>
                  <Select value={form.communicationPreference} onChange={e => set("communicationPreference", e.target.value)}>
                    <option>WhatsApp</option><option>Email</option><option>Phone Call</option>
                  </Select>
                </Field>
                <Field label="Number of Dependents" icon={Users}>
                  <Input type="number" min={0} value={form.numberOfDependents} onChange={e => set("numberOfDependents", e.target.value)} />
                </Field>
              </div>

              {/* 🔹 UPDATED: Dependents (Now using Dropdowns to prevent Enum errors) */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Users size={14} className="text-purple-700" /> Dependents
                  </span>
                  <button onClick={addDependent} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition">
                    <Plus size={12} /> Add Dependent
                  </button>
                </div>
                {form.dependents.length === 0 && <p className="text-xs text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-lg">No dependents added yet</p>}
                {form.dependents.map((dep, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-3">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-semibold text-gray-600">Dependent {i + 1}</span>
                      <button onClick={() => removeDependent(i)} className="text-red-400 hover:text-red-600 transition"><Trash2 size={14} /></button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <Input placeholder="Name" value={dep.name} onChange={e => setDependent(i, "name", e.target.value)} />
                      <Input placeholder="Age" type="number" value={dep.age} onChange={e => setDependent(i, "age", e.target.value)} />
                      
                      {/* 🔹 Replaced Free Text with Dropdown for Relationship */}
                      <Select value={dep.relationship} onChange={e => setDependent(i, "relationship", e.target.value)}>
                        <option value="">Select Relationship</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Son">Son</option>
                        <option value="Daughter">Daughter</option>
                        <option value="Parent">Parent</option>
                      </Select>

                      {/* 🔹 Replaced Free Text with Dropdown for Location */}
                      <Select value={dep.location} onChange={e => setDependent(i, "location", e.target.value)}>
                        <option value="">Select Location</option>
                        <option value="In UAE">In UAE</option>
                        <option value="Outside UAE">Outside UAE</option>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 1: Address & Emergency ── */}
          {step === 1 && (
            <div>
              <SectionTitle icon={MapPin} title="Address" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <Field label="Building">
                  <Input placeholder="Al Shafa Towers" value={form.address.building} onChange={e => setNested("address", "building", e.target.value)} />
                </Field>
                <Field label="Apartment">
                  <Input placeholder="Apartment 805" value={form.address.apartment} onChange={e => setNested("address", "apartment", e.target.value)} />
                </Field>
                <Field label="Area">
                  <Input placeholder="Al Nahda" value={form.address.area} onChange={e => setNested("address", "area", e.target.value)} />
                </Field>
                <Field label="City">
                  <Input placeholder="Dubai" value={form.address.city} onChange={e => setNested("address", "city", e.target.value)} />
                </Field>
                <Field label="PO Box">
                  <Input placeholder="12345" value={form.address.poBox} onChange={e => setNested("address", "poBox", e.target.value)} />
                </Field>
                <Field label="Country">
                  <Input placeholder="UAE" value={form.address.country} onChange={e => setNested("address", "country", e.target.value)} />
                </Field>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <SectionTitle icon={ShieldCheck} title="Emergency Contact" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Contact Name">
                    <Input placeholder="Ahmed Hassan" value={form.emergencyContact.name} onChange={e => setNested("emergencyContact", "name", e.target.value)} />
                  </Field>
                  <Field label="Relationship">
                    <Input placeholder="Husband" value={form.emergencyContact.relationship} onChange={e => setNested("emergencyContact", "relationship", e.target.value)} />
                  </Field>
                  <Field label="Phone">
                    <Input placeholder="+971501004467" value={form.emergencyContact.phone} onChange={e => setNested("emergencyContact", "phone", e.target.value)} />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Identity Documents ── */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <SectionTitle icon={CreditCard} title="Emirates ID" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Emirates ID Number">
                    <Input placeholder="784-1995-8765432-1" value={form.emiratesId.number} onChange={e => setNested("emiratesId", "number", e.target.value)} />
                  </Field>
                  <Field label="Issuance Date">
                    <Input type="date" value={form.emiratesId.issuanceDate} onChange={e => setNested("emiratesId", "issuanceDate", e.target.value)} />
                  </Field>
                  <Field label="Expiry Date">
                    <Input type="date" value={form.emiratesId.expiryDate} onChange={e => setNested("emiratesId", "expiryDate", e.target.value)} />
                  </Field>
                  <Field label="Front Image URL">
                    <Input placeholder="https://..." value={form.emiratesId.frontImageUrl} onChange={e => setNested("emiratesId", "frontImageUrl", e.target.value)} />
                  </Field>
                  <Field label="Back Image URL" className="sm:col-span-2">
                    <Input placeholder="https://..." value={form.emiratesId.backImageUrl} onChange={e => setNested("emiratesId", "backImageUrl", e.target.value)} />
                  </Field>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <SectionTitle icon={FileText} title="Passport" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Passport Number">
                    <Input placeholder="P98765432" value={form.passport.number} onChange={e => setNested("passport", "number", e.target.value)} />
                  </Field>
                  <Field label="Country of Issue">
                    <Input placeholder="UAE" value={form.passport.countryOfIssue} onChange={e => setNested("passport", "countryOfIssue", e.target.value)} />
                  </Field>
                  <Field label="Issue Date">
                    <Input type="date" value={form.passport.issueDate} onChange={e => setNested("passport", "issueDate", e.target.value)} />
                  </Field>
                  <Field label="Expiry Date">
                    <Input type="date" value={form.passport.expiryDate} onChange={e => setNested("passport", "expiryDate", e.target.value)} />
                  </Field>
                  <Field label="Passport Image URL" className="sm:col-span-2">
                    <Input placeholder="https://..." value={form.passport.imageUrl} onChange={e => setNested("passport", "imageUrl", e.target.value)} />
                  </Field>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <SectionTitle icon={Globe} title="Visa" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Visa Number">
                    <Input placeholder="VISA-FATIMA-001" value={form.visa.number} onChange={e => setNested("visa", "number", e.target.value)} />
                  </Field>
                  <Field label="Residency Status">
                    <Input placeholder="Resident" value={form.visa.residencyStatus} onChange={e => setNested("visa", "residencyStatus", e.target.value)} />
                  </Field>
                  <Field label="Sponsor Name">
                    <Input placeholder="Elite Financial Services" value={form.visa.sponsor} onChange={e => setNested("visa", "sponsor", e.target.value)} />
                  </Field>
                  <Field label="Expiry Date">
                    <Input type="date" value={form.visa.expiryDate} onChange={e => setNested("visa", "expiryDate", e.target.value)} />
                  </Field>
                  <Field label="Visa Image URL" className="sm:col-span-2">
                    <Input placeholder="https://..." value={form.visa.imageUrl} onChange={e => setNested("visa", "imageUrl", e.target.value)} />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Bank Details ── */}
          {step === 3 && (
            <div>
              <SectionTitle icon={Banknote} title="Bank Details" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Beneficiary Name">
                  <Input placeholder="Fatima Hassan" value={form.bankDetails.beneficiaryName} onChange={e => setNested("bankDetails", "beneficiaryName", e.target.value)} />
                </Field>
                <Field label="Bank Name">
                  <Input placeholder="Emirates NBD" value={form.bankDetails.bankName} onChange={e => setNested("bankDetails", "bankName", e.target.value)} />
                </Field>
                <Field label="Account Number">
                  <Input placeholder="12345678901234" value={form.bankDetails.accountNumber} onChange={e => setNested("bankDetails", "accountNumber", e.target.value)} />
                </Field>
                <Field label="IBAN">
                  <Input placeholder="AE38044..." value={form.bankDetails.iban} onChange={e => setNested("bankDetails", "iban", e.target.value)} />
                </Field>
                <Field label="SWIFT Code">
                  <Input placeholder="EBILAEAD" value={form.bankDetails.swiftCode} onChange={e => setNested("bankDetails", "swiftCode", e.target.value)} />
                </Field>
                <Field label="Account Type">
                  <Select value={form.bankDetails.accountType} onChange={e => setNested("bankDetails", "accountType", e.target.value)}>
                    <option value="">Select type</option>
                    <option>Savings</option><option>Current</option><option>Fixed Deposit</option>
                  </Select>
                </Field>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-4">
          {step > 0 ? (
            <button onClick={handleBack} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border border-gray-200 bg-white text-gray-600 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition">
              <ChevronLeft size={15} /> Back
            </button>
          ) : <div />}

          {step < STEPS.length - 1 ? (
            <button onClick={handleNext} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition">
              Continue <ChevronRight size={15} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <><Loader2 size={15} className="animate-spin" /> Submitting...</> : <><Check size={15} /> Onboard Agent</>}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}