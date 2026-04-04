// src/components/Vault/AgentOnboard.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Mail, Phone, Lock, MapPin, AlertCircle, ChevronRight,
  ChevronLeft, Check, Loader2, CreditCard, Users, FileText,
  ShieldCheck, Banknote, Calendar, Globe, Heart, Plus, Trash2
} from "lucide-react";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const STEPS = ["Personal Info", "Address & Emergency", "Identity Documents", "Bank Details"];

const countryCodes = ["+971", "+91", "+1", "+44", "+966", "+974", "+973", "+965", "+968"];

const initialForm = {
  first_name: "", last_name: "", email: "", phone_number: "",
  country_code: "+971", password: "", maritalStatus: "", numberOfDependents: 0,
  nationality: "", dateOfBirth: "", gender: "",
  dependents: [],
  address: { building: "", apartment: "", area: "", city: "", country: "" },
  emergencyContact: { name: "", relationship: "", phone: "" },
  emiratesIdNumber: "", emiratesIdExpiryDate: "", emiratesIdFrontImage: "", emiratesIdBackImage: "",
  passportNumber: "", passportExpiryDate: "", passportImage: "",
  visaNumber: "", visaExpiryDate: "", visaImage: "",
  beneficiaryName: "", bankName: "", accountNumber: "", iban: "", swiftCode: "", accountType: "",
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
  const navigate = useNavigate();

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
    const e = {};
    if (step === 0) {
      if (!form.first_name) e.first_name = "Required";
      if (!form.last_name) e.last_name = "Required";
      if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
      if (!form.phone_number) e.phone_number = "Required";
      if (!form.password || form.password.length < 6) e.password = "Min 6 characters";
      if (!form.gender) e.gender = "Required";
      if (!form.dateOfBirth) e.dateOfBirth = "Required";
      if (!form.nationality) e.nationality = "Required";
      if (!form.maritalStatus) e.maritalStatus = "Required";
    }
    if (step === 1) {
      if (!form.address.city) e["address.city"] = "Required";
      if (!form.address.country) e["address.country"] = "Required";
      if (!form.emergencyContact.name) e["emergencyContact.name"] = "Required";
      if (!form.emergencyContact.phone) e["emergencyContact.phone"] = "Required";
      if (!form.emergencyContact.relationship) e["emergencyContact.relationship"] = "Required";
    }
    if (step === 2) {
      if (!form.emiratesIdNumber) e.emiratesIdNumber = "Required";
      if (!form.emiratesIdExpiryDate) e.emiratesIdExpiryDate = "Required";
    }
    if (step === 3) {
      if (!form.bankName) e.bankName = "Required";
      if (!form.accountNumber) e.accountNumber = "Required";
      if (!form.iban) e.iban = "Required";
      if (!form.beneficiaryName) e.beneficiaryName = "Required";
      if (!form.accountType) e.accountType = "Required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
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
      };
      await apiService.post("/vault/agent/admin/onboard-freelance", payload);
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
          <p className="text-sm text-gray-500 mb-7">The agent has been successfully registered in the system.</p>
          <div className="flex gap-3">
            <button
              onClick={() => { setForm(initialForm); setStep(0); setSuccess(false); }}
              className="flex-1 py-2.5 text-sm font-600 font-semibold border-2 border-purple-700 text-purple-700 rounded-lg hover:bg-purple-50 transition"
            >
              Onboard Another
            </button>
            <button
              onClick={() => navigate("/dashboard/vault-admin/agent-list")}
              className="flex-1 py-2.5 text-sm font-semibold bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition"
            >
              View Agents
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-5 md:p-8">
      <div className="max-w-3xl mx-auto">

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Onboard New Agent</h1>
          <p className="text-sm text-gray-500 mt-1">Fill in all required details to register a new freelance agent.</p>
        </div>

        {/* Step Progress Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5 overflow-x-auto">
          <div className="flex items-center min-w-max">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all
                    ${i < step ? "bg-purple-700 text-white" : i === step ? "bg-purple-700 text-white" : "bg-gray-100 text-gray-400"}`}>
                    {i < step ? <Check size={13} /> : i + 1}
                  </div>
                  <span className={`text-xs font-semibold whitespace-nowrap transition-colors
                    ${i === step ? "text-purple-700" : i < step ? "text-gray-600" : "text-gray-400"}`}>
                    {s}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-12 h-0.5 mx-3 rounded-full flex-shrink-0 transition-colors
                    ${i < step ? "bg-purple-700" : "bg-gray-200"}`} />
                )}
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
        <div className="bg-white rounded-xl border border-gray-200 p-6">

          {/* ── STEP 0: Personal Info ── */}
          {step === 0 && (
            <div>
              <SectionTitle icon={User} title="Personal Information" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="First Name" icon={User} error={errors.first_name}>
                  <Input error={errors.first_name} placeholder="Ahmed" value={form.first_name} onChange={e => set("first_name", e.target.value)} />
                </Field>
                <Field label="Last Name" icon={User} error={errors.last_name}>
                  <Input error={errors.last_name} placeholder="Al Mansoori" value={form.last_name} onChange={e => set("last_name", e.target.value)} />
                </Field>
                <Field label="Email" icon={Mail} error={errors.email}>
                  <Input error={errors.email} type="email" placeholder="agent@example.com" value={form.email} onChange={e => set("email", e.target.value)} />
                </Field>
                <Field label="Password" icon={Lock} error={errors.password}>
                  <Input error={errors.password} type="password" placeholder="Min 6 characters" value={form.password} onChange={e => set("password", e.target.value)} />
                </Field>
                <Field label="Phone Number" icon={Phone} error={errors.phone_number}>
                  <div className="flex gap-2">
                    <select
                      className="px-2 py-2.5 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 flex-shrink-0"
                      value={form.country_code} onChange={e => set("country_code", e.target.value)}
                    >
                      {countryCodes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <Input error={errors.phone_number} placeholder="501234567" value={form.phone_number} onChange={e => set("phone_number", e.target.value)} />
                  </div>
                </Field>
                <Field label="Gender" icon={User} error={errors.gender}>
                  <Select error={errors.gender} value={form.gender} onChange={e => set("gender", e.target.value)}>
                    <option value="">Select gender</option>
                    <option>Male</option><option>Female</option>
                  </Select>
                </Field>
                <Field label="Date of Birth" icon={Calendar} error={errors.dateOfBirth}>
                  <Input error={errors.dateOfBirth} type="date" value={form.dateOfBirth} onChange={e => set("dateOfBirth", e.target.value)} />
                </Field>
                <Field label="Nationality" icon={Globe} error={errors.nationality}>
                  <Input error={errors.nationality} placeholder="UAE" value={form.nationality} onChange={e => set("nationality", e.target.value)} />
                </Field>
                <Field label="Marital Status" icon={Heart} error={errors.maritalStatus}>
                  <Select error={errors.maritalStatus} value={form.maritalStatus} onChange={e => set("maritalStatus", e.target.value)}>
                    <option value="">Select status</option>
                    <option>Single</option><option>Married</option><option>Divorced</option><option>Widowed</option>
                  </Select>
                </Field>
                <Field label="Number of Dependents" icon={Users}>
                  <Input type="number" min={0} value={form.numberOfDependents} onChange={e => set("numberOfDependents", e.target.value)} />
                </Field>
              </div>

              {/* Dependents */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Users size={14} className="text-purple-700" /> Dependents
                  </span>
                  <button
                    onClick={addDependent}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition"
                  >
                    <Plus size={12} /> Add Dependent
                  </button>
                </div>
                {form.dependents.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-lg">No dependents added yet</p>
                )}
                {form.dependents.map((dep, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-3">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-semibold text-gray-600">Dependent {i + 1}</span>
                      <button onClick={() => removeDependent(i)} className="text-red-400 hover:text-red-600 transition">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <Input placeholder="Name" value={dep.name} onChange={e => setDependent(i, "name", e.target.value)} />
                      <Input placeholder="Age" type="number" value={dep.age} onChange={e => setDependent(i, "age", e.target.value)} />
                      <Input placeholder="Relationship" value={dep.relationship} onChange={e => setDependent(i, "relationship", e.target.value)} />
                      <Input placeholder="Location" value={dep.location} onChange={e => setDependent(i, "location", e.target.value)} />
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
                  <Input placeholder="Marina Heights" value={form.address.building} onChange={e => setNested("address", "building", e.target.value)} />
                </Field>
                <Field label="Apartment">
                  <Input placeholder="Apartment 1204" value={form.address.apartment} onChange={e => setNested("address", "apartment", e.target.value)} />
                </Field>
                <Field label="Area">
                  <Input placeholder="Dubai Marina" value={form.address.area} onChange={e => setNested("address", "area", e.target.value)} />
                </Field>
                <Field label="City" error={errors["address.city"]}>
                  <Input error={errors["address.city"]} placeholder="Dubai" value={form.address.city} onChange={e => setNested("address", "city", e.target.value)} />
                </Field>
                <Field label="Country" error={errors["address.country"]}>
                  <Input error={errors["address.country"]} placeholder="UAE" value={form.address.country} onChange={e => setNested("address", "country", e.target.value)} />
                </Field>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <SectionTitle icon={ShieldCheck} title="Emergency Contact" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Contact Name" error={errors["emergencyContact.name"]}>
                    <Input error={errors["emergencyContact.name"]} placeholder="Khalid Al Mansoori" value={form.emergencyContact.name} onChange={e => setNested("emergencyContact", "name", e.target.value)} />
                  </Field>
                  <Field label="Relationship" error={errors["emergencyContact.relationship"]}>
                    <Input error={errors["emergencyContact.relationship"]} placeholder="Father" value={form.emergencyContact.relationship} onChange={e => setNested("emergencyContact", "relationship", e.target.value)} />
                  </Field>
                  <Field label="Phone" error={errors["emergencyContact.phone"]}>
                    <Input error={errors["emergencyContact.phone"]} placeholder="+971503334455" value={form.emergencyContact.phone} onChange={e => setNested("emergencyContact", "phone", e.target.value)} />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Emirates ID Number" error={errors.emiratesIdNumber}>
                    <Input error={errors.emiratesIdNumber} placeholder="784-1990-1234567-8" value={form.emiratesIdNumber} onChange={e => set("emiratesIdNumber", e.target.value)} />
                  </Field>
                  <Field label="Expiry Date" error={errors.emiratesIdExpiryDate}>
                    <Input error={errors.emiratesIdExpiryDate} type="date" value={form.emiratesIdExpiryDate} onChange={e => set("emiratesIdExpiryDate", e.target.value)} />
                  </Field>
                  <Field label="Front Image URL">
                    <Input placeholder="https://..." value={form.emiratesIdFrontImage} onChange={e => set("emiratesIdFrontImage", e.target.value)} />
                  </Field>
                  <Field label="Back Image URL">
                    <Input placeholder="https://..." value={form.emiratesIdBackImage} onChange={e => set("emiratesIdBackImage", e.target.value)} />
                  </Field>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <SectionTitle icon={FileText} title="Passport" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Passport Number">
                    <Input placeholder="A12345678" value={form.passportNumber} onChange={e => set("passportNumber", e.target.value)} />
                  </Field>
                  <Field label="Expiry Date">
                    <Input type="date" value={form.passportExpiryDate} onChange={e => set("passportExpiryDate", e.target.value)} />
                  </Field>
                  <Field label="Passport Image URL" className="sm:col-span-2">
                    <Input placeholder="https://..." value={form.passportImage} onChange={e => set("passportImage", e.target.value)} />
                  </Field>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <SectionTitle icon={Globe} title="Visa" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Visa Number">
                    <Input placeholder="VISA-987654" value={form.visaNumber} onChange={e => set("visaNumber", e.target.value)} />
                  </Field>
                  <Field label="Expiry Date">
                    <Input type="date" value={form.visaExpiryDate} onChange={e => set("visaExpiryDate", e.target.value)} />
                  </Field>
                  <Field label="Visa Image URL" className="sm:col-span-2">
                    <Input placeholder="https://..." value={form.visaImage} onChange={e => set("visaImage", e.target.value)} />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Bank Details ── */}
          {step === 3 && (
            <div>
              <SectionTitle icon={Banknote} title="Bank Details" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Beneficiary Name" error={errors.beneficiaryName}>
                  <Input error={errors.beneficiaryName} placeholder="Ahmed Al Mansoori" value={form.beneficiaryName} onChange={e => set("beneficiaryName", e.target.value)} />
                </Field>
                <Field label="Bank Name" error={errors.bankName}>
                  <Input error={errors.bankName} placeholder="ADCB" value={form.bankName} onChange={e => set("bankName", e.target.value)} />
                </Field>
                <Field label="Account Number" error={errors.accountNumber}>
                  <Input error={errors.accountNumber} placeholder="98765432109876" value={form.accountNumber} onChange={e => set("accountNumber", e.target.value)} />
                </Field>
                <Field label="IBAN" error={errors.iban}>
                  <Input error={errors.iban} placeholder="AE123456789012345678902" value={form.iban} onChange={e => set("iban", e.target.value)} />
                </Field>
                <Field label="SWIFT Code">
                  <Input placeholder="ADCBAEAD" value={form.swiftCode} onChange={e => set("swiftCode", e.target.value)} />
                </Field>
                <Field label="Account Type" error={errors.accountType}>
                  <Select error={errors.accountType} value={form.accountType} onChange={e => set("accountType", e.target.value)}>
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
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border border-gray-200 bg-white text-gray-600 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition"
            >
              <ChevronLeft size={15} /> Back
            </button>
          ) : <div />}

          {step < STEPS.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition"
            >
              Continue <ChevronRight size={15} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Submitting...</>
                : <><Check size={15} /> Onboard Agent</>}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}