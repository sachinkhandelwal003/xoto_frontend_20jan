// src/components/Vault/VaultPartners.jsx
import { useState } from "react";
import PhoneInput from "react-phone-number-input";
import {
  Building2, User, Users, MapPin, CreditCard,
  Percent, FileText, KeyRound, ChevronRight, ChevronLeft,
  CheckCircle2, Loader2, Copy, AlertCircle, ListPlus, Users as UsersIcon
} from "lucide-react";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import PartnerList from "./PartnerList";

// ─── Step definitions ───────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Company",     icon: Building2  },
  { id: 2, label: "Primary",     icon: User       },
  { id: 3, label: "Secondary",   icon: Users      },
  { id: 4, label: "Address",     icon: MapPin     },
  { id: 5, label: "Bank",        icon: CreditCard },
  { id: 6, label: "Commission",  icon: Percent    },
  { id: 7, label: "Agreement",   icon: FileText   },
  { id: 8, label: "Credentials", icon: KeyRound   },
];

const INIT = {
  companyName: "", legalEntityType: "LLC", tradeLicenseNumber: "",
  tradeLicenseIssueDate: "", tradeLicenseExpiryDate: "", isOffline_aggrement: "",
  taxRegistrationNumber: "", dbaName: "", website: "",
  yearEstablished: "", numberOfBranches: "", role: "",

  primaryName: "", primaryDesignation: "", primaryEmail: "",
  primaryPhone: "", primaryAltPhone: "",
  primaryWhatsapp: "", primaryEmiratesId: "",

  secondaryName: "", secondaryDesignation: "", secondaryEmail: "",
   secondaryPhone: "",
  secondaryWhatsapp: "", secondaryEmiratesId: "",

  billBuilding: "", billFloor: "", billArea: "", billCity: "Dubai",
  billPoBox: "", billCountry: "UAE",
  sameAsShipping: false,
  shipBuilding: "", shipFloor: "", shipArea: "", shipCity: "Dubai",
  shipPoBox: "", shipCountry: "UAE",

  bankBeneficiary: "", bankName: "", bankAccount: "", bankIban: "",
  bankSwift: "", bankBranch: "", bankAccountType: "Business Current",

  tier1Max: "5000000", tier1Pct: "75", tier1Desc: "For loans up to 5M AED",
  tier2Min: "5000001", tier2Pct: "80", tier2Desc: "For loans above 5M AED",
  paymentTerms: "Net 30 days after disbursement",
  calculationBasis: "Percentage of Xoto's bank commission",

  agreementType: "Commercial Partnership Agreement",
  agreementStart: "", agreementEnd: "", autoRenew: true,
  signedByXoto: "Xoto Prophet LLC", signedByPartner: "",
  signedDate: "", documentUrl: "",

  username: "", password: "", confirmPassword: "",
  email: "", // root email for login
};

// ─── required fields per step ────────────────────────────────────────────────
const REQUIRED = {
  1: ["companyName","tradeLicenseNumber","tradeLicenseIssueDate","tradeLicenseExpiryDate"],
  2: ["primaryName","primaryDesignation","primaryEmail","primaryPhone","primaryEmiratesId"],
  3: [],
  4: ["billBuilding","billArea","billCity","billCountry"],
  5: ["bankBeneficiary","bankName","bankAccount","bankIban","bankSwift"],
  6: ["tier1Max","tier1Pct","tier2Min","tier2Pct","paymentTerms"],
  7: ["agreementType","agreementStart","agreementEnd","signedByXoto","signedByPartner","signedDate"],
  8: ["email","username","password","confirmPassword"],
};

export default function VaultPartners() {
  // ─── Mode toggle (onboard or list) ──────────────────────────────────────
  const [mode, setMode] = useState("onboard"); // "onboard" or "list"

  // ─── Onboarding state ───────────────────────────────────────────────────
  const [step, setStep]       = useState(1);
  const [form, setForm]       = useState(INIT);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [apiError, setApiErr] = useState("");

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => { const n={...e}; delete n[k]; return n; }); };

  // ─── Validation ─────────────────────────────────────────────────────────
  const validate = (s) => {
    const e = {};
    REQUIRED[s].forEach(k => { if (!String(form[k]).trim()) e[k] = "Required"; });
    if (s === 2 && form.primaryEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.primaryEmail)) e.primaryEmail = "Invalid email";
    if (s === 8) {
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
      if (form.password && form.password.length < 6) e.password = "Min 6 characters";
      if (form.confirmPassword !== form.password) e.confirmPassword = "Passwords don't match";
    }
    return e;
  };

  const next = () => {
    const e = validate(step);
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep(s => s + 1);
  };

  const back = () => { setErrors({}); setStep(s => s - 1); };

  // ─── Submit using apiService ─────────────────────────────────────────────
  const submit = async () => {
    const e = validate(8);
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    setLoading(true);
    setApiErr("");

    const payload = {
      companyName: form.companyName,
      legalEntityType: form.legalEntityType,
      tradeLicenseNumber: form.tradeLicenseNumber,
      tradeLicenseIssueDate: form.tradeLicenseIssueDate,
      tradeLicenseExpiryDate: form.tradeLicenseExpiryDate,
      isOffline_aggrement: form.isOffline_aggrement || form.agreementStart,
      taxRegistrationNumber: form.taxRegistrationNumber,
      dbaName: form.dbaName,
      website: form.website,
      yearEstablished: Number(form.yearEstablished),
      numberOfBranches: Number(form.numberOfBranches),
      role: form.role,
      email: form.email, // root email
      primaryContact: {
        name: form.primaryName,
        designation: form.primaryDesignation,
        email: form.primaryEmail,
        phone: form.primaryPhone,
        alternativePhone: form.primaryAltPhone,
        whatsappNumber: form.primaryWhatsapp,
        emiratesId: form.primaryEmiratesId,
      },
      secondaryContact: {
        name: form.secondaryName,
        designation: form.secondaryDesignation,
        email: form.secondaryEmail,
        countryCode: form.secondaryCountryCode,
        phone: form.secondaryPhone,
        whatsappNumber: form.secondaryWhatsapp,
        emiratesId: form.secondaryEmiratesId,
      },
      billingAddress: {
        buildingName: form.billBuilding,
        floorUnit: form.billFloor,
        area: form.billArea,
        city: form.billCity,
        poBox: form.billPoBox,
        country: form.billCountry,
      },
      shippingAddress: form.sameAsShipping
        ? {
            buildingName: form.billBuilding,
            floorUnit: form.billFloor,
            area: form.billArea,
            city: form.billCity,
            poBox: form.billPoBox,
            country: form.billCountry,
          }
        : {
            buildingName: form.shipBuilding,
            floorUnit: form.shipFloor,
            area: form.shipArea,
            city: form.shipCity,
            poBox: form.shipPoBox,
            country: form.shipCountry,
          },
      bankDetails: {
        beneficiaryName: form.bankBeneficiary,
        bankName: form.bankName,
        accountNumber: form.bankAccount,
        iban: form.bankIban,
        swiftCode: form.bankSwift,
        branchName: form.bankBranch,
        accountType: form.bankAccountType,
      },
      commissionConfiguration: {
        tier1: {
          loanAmountMax: Number(form.tier1Max),
          commissionPercentage: Number(form.tier1Pct),
          description: form.tier1Desc,
        },
        tier2: {
          loanAmountMin: Number(form.tier2Min),
          commissionPercentage: Number(form.tier2Pct),
          description: form.tier2Desc,
        },
        paymentTerms: form.paymentTerms,
        calculationBasis: form.calculationBasis,
      },
      agreementDetails: {
        agreementType: form.agreementType,
        startDate: form.agreementStart,
        endDate: form.agreementEnd,
        autoRenew: form.autoRenew,
        signedByXoto: form.signedByXoto,
        signedByPartner: form.signedByPartner,
        signedDate: form.signedDate,
        documentUrl: form.documentUrl,
      },
      username: form.username,
      password: form.password,
    };

    try {
      const response = await apiService.post("/vault/partner/create", payload);
      if (response?.success || response?.data) {
        setDone(true);
      } else {
        throw new Error(response?.message || "Something went wrong");
      }
    } catch (err) {
      setApiErr(err.message || "API Error");
    } finally {
      setLoading(false);
    }
  };

  // ─── Success screen ──────────────────────────────────────────────────────
  if (done) return (
    <div style={{ minHeight: "100vh", background: "#f8f7fc", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "52px 48px", textAlign: "center", maxWidth: 440, boxShadow: "0 8px 40px rgba(92,3,155,.1)" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <CheckCircle2 size={32} color="#16a34a" />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1a0030", margin: "0 0 8px" }}>Partner Created!</h2>
        <p style={{ fontSize: 13.5, color: "#888", lineHeight: 1.6, margin: "0 0 28px" }}>
          <strong>{form.companyName}</strong> has been onboarded. Login credentials have been sent to <strong>{form.email || form.primaryEmail}</strong>.
        </p>
        <button style={s.btnPrimary} onClick={() => { setForm(INIT); setStep(1); setDone(false); }}>
          Add Another Partner
        </button>
      </div>
    </div>
  );

  // ─── Shared input helpers for onboarding form ───────────────────────────
  const inp = (key, placeholder, type = "text", opts = {}) => (
    <input
      type={type}
      placeholder={placeholder}
      value={form[key]}
      onChange={e => set(key, e.target.value)}
      style={{ ...s.input, ...(errors[key] ? s.inputErr : {}), ...(opts.style || {}) }}
      {...(opts.min ? { min: opts.min } : {})}
    />
  );

  const sel = (key, options) => (
    <select value={form[key]} onChange={e => set(key, e.target.value)} style={{ ...s.input, ...(errors[key] ? s.inputErr : {}) }}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  const grp = (key, label, child, req = false) => (
    <div>
      <label style={s.label}>{label}{req && <span style={{ color: "#5C039B" }}> *</span>}</label>
      {child}
      {errors[key] && <p style={s.errMsg}>{errors[key]}</p>}
    </div>
  );

  const phoneInput = (key, label, req = false) => (
  <div>
    <label style={s.label}>
      {label}{req && <span style={{ color: "#5C039B" }}> *</span>}
    </label>

    <PhoneInput
      international
      defaultCountry="AE" // ya "IN" agar India default chahiye
      value={form[key]}
      onChange={(value) => set(key, value)}
      style={{
        ...s.input,
        padding: "6px 10px",
        ...(errors[key] ? s.inputErr : {})
      }}
    />

    {errors[key] && <p style={s.errMsg}>{errors[key]}</p>}
  </div>
);

  // ─── Step content for onboarding ─────────────────────────────────────────
  const stepContent = {
    1: (
      <>
        <div style={s.grid2}>
          {grp("companyName",         "Legal Company Name",             inp("companyName",         "e.g. Dubai Real Estate Brokers LLC"), true)}
          {grp("legalEntityType",     "Legal Entity Type",              sel("legalEntityType",     ["LLC","FZE","PJSC","Sole Proprietorship","Partnership"]))}
          {grp("tradeLicenseNumber",  "Trade License Number",           inp("tradeLicenseNumber",  "e.g. 1234567"), true)}
          {grp("taxRegistrationNumber","Tax Registration Number (TRN)", inp("taxRegistrationNumber","TRN-987654321"))}
          {grp("tradeLicenseIssueDate","License Issue Date",            inp("tradeLicenseIssueDate","", "date"), true)}
          {grp("tradeLicenseExpiryDate","License Expiry Date",          inp("tradeLicenseExpiryDate","", "date"), true)}
          {grp("isOffline_aggrement", "Offline Agreement Date",         inp("isOffline_aggrement", "", "date"))}
          {grp("dbaName",             "DBA / Trade Name",               inp("dbaName",             "e.g. DREB Properties"))}
          {grp("website",             "Website",                        inp("website",             "www.example.ae"))}
          {grp("yearEstablished",     "Year Established",               inp("yearEstablished",     "e.g. 2015", "number"))}
          {grp("numberOfBranches",    "Number of Branches",             inp("numberOfBranches",    "e.g. 3", "number"))}
          {grp("role",                "Role ID",                        inp("role",                "MongoDB ObjectId"))}
        </div>
      </>
    ),

    2: (
      <div style={s.grid2}>
        {grp("primaryName",        "Full Name",          inp("primaryName",        "Mohammed Ali"), true)}
        {grp("primaryDesignation", "Designation",        inp("primaryDesignation", "Managing Director"), true)}
        {grp("primaryEmail",       "Email Address",      inp("primaryEmail",       "mohammed@company.ae", "email"), true)}
        {grp("primaryEmiratesId",  "Emirates ID",        inp("primaryEmiratesId",  "784-1980-1234567-8"), true)}
        {phoneInput("primaryPhone", "Phone Number", true)}
{phoneInput("primaryAltPhone", "Alternative Phone")}
        {grp("primaryWhatsapp",    "WhatsApp Number",    inp("primaryWhatsapp",    "50 123 4567"))}
      </div>
    ),

    3: (
      <>
        <div style={s.infoBox}>
          <AlertCircle size={15} color="#0369a1" style={{ flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: 12.5, color: "#0369a1", lineHeight: 1.5 }}>Secondary contact is optional but recommended for operational continuity.</p>
        </div>
        <div style={s.grid2}>
          {grp("secondaryName",        "Full Name",     inp("secondaryName",        "Fatima Hassan"))}
          {grp("secondaryDesignation", "Designation",   inp("secondaryDesignation", "Operations Manager"))}
          {grp("secondaryEmail",       "Email Address", inp("secondaryEmail",       "fatima@company.ae", "email"))}
          {grp("secondaryEmiratesId",  "Emirates ID",   inp("secondaryEmiratesId",  "784-1985-8765432-1"))}
          {phoneInput("secondaryPhone", "Phone Number")}
          {grp("secondaryWhatsapp",    "WhatsApp Number",inp("secondaryWhatsapp",   "50 123 4567"))}
        </div>
      </>
    ),

    4: (
      <>
        <p style={s.sectionLabel}>Billing Address</p>
        <div style={{ ...s.grid2, marginBottom: 24 }}>
          {grp("billBuilding", "Building Name", inp("billBuilding","Boulevard Plaza"), true)}
          {grp("billFloor",    "Floor / Unit",  inp("billFloor",   "Level 15, Office 1502"))}
          {grp("billArea",     "Area",          inp("billArea",    "Downtown Dubai"), true)}
          {grp("billCity",     "City",          inp("billCity",    "Dubai"), true)}
          {grp("billPoBox",    "PO Box",        inp("billPoBox",   "12345"))}
          {grp("billCountry",  "Country",       sel("billCountry", ["UAE","Saudi Arabia","Bahrain","Oman","Kuwait","Qatar"]), true)}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <input type="checkbox" id="sameAddr" checked={form.sameAsShipping} onChange={e => {
            const v = e.target.checked;
            set("sameAsShipping", v);
            if (v) { set("shipBuilding", form.billBuilding); set("shipFloor", form.billFloor); set("shipArea", form.billArea); set("shipCity", form.billCity); set("shipPoBox", form.billPoBox); set("shipCountry", form.billCountry); }
          }} style={{ width: 15, height: 15, accentColor: "#5C039B" }} />
          <label htmlFor="sameAddr" style={{ fontSize: 13, fontWeight: 600, color: "#555", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Copy size={13} /> Shipping address same as billing
          </label>
        </div>

        {!form.sameAsShipping && (
          <>
            <p style={s.sectionLabel}>Shipping Address</p>
            <div style={s.grid2}>
              {grp("shipBuilding","Building Name", inp("shipBuilding","Boulevard Plaza"))}
              {grp("shipFloor",   "Floor / Unit",  inp("shipFloor",   "Level 15, Office 1502"))}
              {grp("shipArea",    "Area",          inp("shipArea",    "Downtown Dubai"))}
              {grp("shipCity",    "City",          inp("shipCity",    "Dubai"))}
              {grp("shipPoBox",   "PO Box",        inp("shipPoBox",   "12345"))}
              {grp("shipCountry", "Country",       sel("shipCountry", ["UAE","Saudi Arabia","Bahrain","Oman","Kuwait","Qatar"]))}
            </div>
          </>
        )}
      </>
    ),

    5: (
      <div style={s.grid2}>
        {grp("bankBeneficiary",  "Beneficiary Name",  inp("bankBeneficiary", "Company legal name"), true)}
        {grp("bankName",         "Bank Name",         inp("bankName",        "e.g. Emirates NBD"), true)}
        {grp("bankAccount",      "Account Number",    inp("bankAccount",     "12345678901234"), true)}
        {grp("bankIban",         "IBAN",              inp("bankIban",        "AE123456789012345678901"), true)}
        {grp("bankSwift",        "SWIFT / BIC Code",  inp("bankSwift",       "e.g. EBILAEAD"), true)}
        {grp("bankBranch",       "Branch Name",       inp("bankBranch",      "e.g. Downtown Branch"))}
        {grp("bankAccountType",  "Account Type",      sel("bankAccountType", ["Business Current","Business Savings","Personal Current","Personal Savings"]))}
      </div>
    ),

    6: (
      <>
        <p style={s.sectionLabel}>Tier 1 — Up to 5M AED</p>
        <div style={{ ...s.grid2, marginBottom: 24 }}>
          {grp("tier1Max",  "Max Loan Amount (AED)", inp("tier1Max",  "5000000",  "number"), true)}
          {grp("tier1Pct",  "Commission %",          inp("tier1Pct",  "75",       "number"), true)}
          {grp("tier1Desc", "Description",           inp("tier1Desc", "For loans up to 5M AED"))}
        </div>
        <p style={s.sectionLabel}>Tier 2 — Above 5M AED</p>
        <div style={{ ...s.grid2, marginBottom: 24 }}>
          {grp("tier2Min",  "Min Loan Amount (AED)", inp("tier2Min",  "5000001",  "number"), true)}
          {grp("tier2Pct",  "Commission %",          inp("tier2Pct",  "80",       "number"), true)}
          {grp("tier2Desc", "Description",           inp("tier2Desc", "For loans above 5M AED"))}
        </div>
        <p style={s.sectionLabel}>Terms</p>
        <div style={s.grid2}>
          {grp("paymentTerms",     "Payment Terms",      inp("paymentTerms",     "Net 30 days after disbursement"), true)}
          {grp("calculationBasis", "Calculation Basis",  inp("calculationBasis", "Percentage of Xoto's bank commission"))}
        </div>
      </>
    ),

    7: (
      <div style={s.grid2}>
        {grp("agreementType",    "Agreement Type",      inp("agreementType",    "Commercial Partnership Agreement"), true)}
        {grp("agreementStart",   "Start Date",          inp("agreementStart",   "", "date"), true)}
        {grp("agreementEnd",     "End Date",            inp("agreementEnd",     "", "date"), true)}
        {grp("signedDate",       "Date Signed",         inp("signedDate",       "", "date"), true)}
        {grp("signedByXoto",     "Signed By (Xoto)",    inp("signedByXoto",     "Xoto Prophet LLC"), true)}
        {grp("signedByPartner",  "Signed By (Partner)", inp("signedByPartner",  "Company legal name"), true)}
        {grp("documentUrl",      "Agreement Document URL", inp("documentUrl",   "https://storage.xoto.com/agreements/…"))}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input type="checkbox" id="autoRenew" checked={form.autoRenew} onChange={e => set("autoRenew", e.target.checked)} style={{ width: 15, height: 15, accentColor: "#5C039B" }} />
          <label htmlFor="autoRenew" style={{ fontSize: 13, fontWeight: 600, color: "#555", cursor: "pointer" }}>Auto-renew agreement</label>
        </div>
      </div>
    ),

    8: (
      <>
        <div style={s.infoBox}>
          <AlertCircle size={15} color="#0369a1" style={{ flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: 12.5, color: "#0369a1", lineHeight: 1.5 }}>These credentials will be sent to the partner's primary contact email upon account creation.</p>
        </div>
        <div style={s.grid2}>
          {grp("email",           "Login Email Address",   inp("email",           "partner@company.com", "email"), true)}
          {grp("username",        "Username",              inp("username",        "e.g. dubaire_brokers"), true)}
          {grp("password",        "Password",              inp("password",        "Min 6 characters", "password"), true)}
          {grp("confirmPassword", "Confirm Password",      inp("confirmPassword", "Re-enter password", "password"), true)}
        </div>
        {apiError && (
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, padding: "12px 14px", marginTop: 20 }}>
            <AlertCircle size={15} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ margin: 0, fontSize: 12.5, color: "#dc2626", lineHeight: 1.5 }}>{apiError}</p>
          </div>
        )}
      </>
    ),
  };

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  // ─── Render based on mode ────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .vp *, .vp *::before, .vp *::after { box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
        .vp input:focus, .vp select:focus, .vp textarea:focus {
          outline: none; border-color: #5C039B !important;
          box-shadow: 0 0 0 3px rgba(92,3,155,0.08);
        }
        .vp input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0.5; cursor: pointer; }
        .step-pill:hover { background: #f4f0fc !important; }
      `}</style>

      <div className="vp" style={{ padding: "28px 32px", background: "#f8f7fc", minHeight: "100vh" }}>
        {/* Mode Toggle Dropdown */}
        

        {mode === "onboard" ? (
          // ─── Onboarding Wizard ──────────────────────────────────────────
          <>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 21, fontWeight: 700, color: "#1a0030", margin: 0 }}>Onboard New Partner</h1>
              <p style={{ fontSize: 13, color: "#aaa", margin: "4px 0 0" }}>Fill in all sections to create a partner account</p>
            </div>

            <div style={{ height: 4, background: "#ede8f7", borderRadius: 4, marginBottom: 28, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "#5C039B", borderRadius: 4, transition: "width .4s ease" }} />
            </div>

            <div style={{ display: "flex", gap: 6, marginBottom: 28, flexWrap: "wrap" }}>
              {STEPS.map(({ id, label, icon: Icon }) => {
                const active    = id === step;
                const completed = id < step;
                return (
                  <div key={id} className="step-pill" style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 14px", borderRadius: 20,
                    border: `1.5px solid ${active ? "#5C039B" : completed ? "#c4b5e8" : "#e5dff5"}`,
                    background: active ? "#5C039B" : completed ? "#f4f0fc" : "#fff",
                    color: active ? "#fff" : completed ? "#5C039B" : "#aaa",
                    fontSize: 12.5, fontWeight: 600, cursor: "default", transition: "all .15s",
                  }}>
                    {completed ? <CheckCircle2 size={13} /> : <Icon size={13} />}
                    {label}
                  </div>
                );
              })}
            </div>

            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #ede8f7", overflow: "hidden" }}>
              <div style={{ padding: "20px 28px 18px", borderBottom: "1px solid #f0ebf7", display: "flex", alignItems: "center", gap: 12 }}>
                {(() => { const { icon: Icon, label } = STEPS[step - 1]; return (
                  <>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f4f0fc", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={17} color="#5C039B" />
                    </div>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: "#1a0030", margin: 0 }}>
                        Step {step} of {STEPS.length} — {label === "Primary" ? "Primary Contact" : label === "Secondary" ? "Secondary Contact" : label === "Bank" ? "Bank Details" : label + " Information"}
                      </p>
                      <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>
                        {step === 1 && "Company registration and licensing details"}
                        {step === 2 && "Main point of contact for this partner"}
                        {step === 3 && "Backup contact person (optional)"}
                        {step === 4 && "Billing and shipping address details"}
                        {step === 5 && "Bank account for commission payments"}
                        {step === 6 && "Commission tiers and payment terms"}
                        {step === 7 && "Commercial agreement details"}
                        {step === 8 && "Platform login credentials"}
                      </p>
                    </div>
                  </>
                ); })()}
              </div>

              <div style={{ padding: "28px 28px 8px" }}>
                {stepContent[step]}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 28px 24px" }}>
                <button
                  onClick={back}
                  disabled={step === 1}
                  style={{ ...s.btnSecondary, opacity: step === 1 ? 0.35 : 1, cursor: step === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6 }}
                >
                  <ChevronLeft size={15} /> Back
                </button>
                <span style={{ fontSize: 12, color: "#ccc" }}>{step} / {STEPS.length}</span>
                {step < STEPS.length ? (
                  <button onClick={next} style={{ ...s.btnPrimary, display: "flex", alignItems: "center", gap: 6 }}>
                    Next <ChevronRight size={15} />
                  </button>
                ) : (
                  <button onClick={submit} disabled={loading} style={{ ...s.btnPrimary, display: "flex", alignItems: "center", gap: 8, opacity: loading ? .7 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
                    {loading ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Creating…</> : <><CheckCircle2 size={15} /> Create Partner</>}
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          // ─── Partner List View ──────────────────────────────────────────
          <PartnerList />
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = {
  grid2:       { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px" },
  label:       { display: "block", fontSize: 12.5, fontWeight: 600, color: "#555", marginBottom: 5 },
  input:       { width: "100%", padding: "9px 12px", border: "1.5px solid #e5dff5", borderRadius: 9, fontSize: 13.5, color: "#1a0030", background: "#faf8ff" },
  inputErr:    { borderColor: "#ef4444 !important" },
  errMsg:      { fontSize: 11.5, color: "#ef4444", margin: "4px 0 0" },
  sectionLabel:{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#5C039B", marginBottom: 12, display: "block" },
  btnPrimary:  { padding: "10px 22px", background: "#5C039B", color: "#fff", border: "none", borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: "pointer" },
  btnSecondary:{ padding: "10px 18px", border: "1.5px solid #e0d8f0", borderRadius: 10, background: "#fff", fontSize: 13.5, fontWeight: 600, color: "#666" },
  infoBox:     { display: "flex", gap: 10, alignItems: "flex-start", background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 10, padding: "12px 14px", marginBottom: 20 },
};