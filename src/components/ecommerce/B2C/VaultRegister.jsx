import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Mail, Phone, Lock, Eye, EyeOff,
  CheckCircle2, Loader2, AlertCircle, ArrowLeft, Calendar, Globe
} from "lucide-react";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const EMPTY = {
  first_name: "",
  last_name: "",
  email: "",
  country_code: "+971",
  phone_number: "",
  password: "",
  confirmPassword: "",
  maritalStatus: "",
  nationality: "",
  dateOfBirth: "",
  gender: "",
};

export default function VaultRegister() {
  const navigate = useNavigate();
  const [form, setForm]         = useState(EMPTY);
  const [errors, setErrors]     = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);
  const [apiError, setApiError] = useState("");

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  };

  const validate = () => {
    const e = {};
    if (!form.first_name.trim())    e.first_name    = "Required";
    if (!form.last_name.trim())     e.last_name     = "Required";
    if (!form.email.trim())         e.email         = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (!form.phone_number.trim())  e.phone_number  = "Required";
    if (!form.password)             e.password      = "Required";
    else if (form.password.length < 6) e.password   = "Min 6 characters";
    if (!form.confirmPassword)      e.confirmPassword = "Required";
    else if (form.confirmPassword !== form.password) e.confirmPassword = "Passwords don't match";
    if (!form.maritalStatus)        e.maritalStatus = "Required";
    if (!form.nationality.trim())   e.nationality   = "Required";
    if (!form.dateOfBirth)          e.dateOfBirth   = "Required";
    if (!form.gender)               e.gender        = "Required";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setApiError("");
    try {
      const payload = {
        first_name:    form.first_name.trim(),
        last_name:     form.last_name.trim(),
        email:         form.email.trim(),
        phone_number:  form.phone_number.trim(),
        country_code:  form.country_code,
        password:      form.password,
        agentType:     "FreelanceAgent",   // hardcoded
        maritalStatus: form.maritalStatus,
        nationality:   form.nationality.trim(),
        dateOfBirth:   form.dateOfBirth,
        gender:        form.gender,
      };
      // Using apiService instead of fetch
      const response = await apiService.post("/vault/agent/signup", payload);
      // Assuming apiService returns the response data directly or { success: true, data: ... }
      if (response?.success || response?.data) {
        setDone(true);
      } else {
        throw new Error(response?.message || "Registration failed");
      }
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Success ──────────────────────────────────────────────────────────────
  if (done) return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <CheckCircle2 size={32} color="#16a34a" />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1a0030", margin: "0 0 8px" }}>Registration Successful!</h2>
          <p style={{ fontSize: 13.5, color: "#888", lineHeight: 1.7, margin: "0 0 28px" }}>
            Your account has been created. You can now log in to <strong>Xoto Vault</strong>.
          </p>
          <button style={s.btnPrimary} onClick={() => navigate("/login")}>
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const grp = (key, label, child, req = true) => (
    <div>
      <label style={s.label}>{label}{req && <span style={{ color: "#5C039B" }}> *</span>}</label>
      {child}
      {errors[key] && <p style={s.errMsg}>{errors[key]}</p>}
    </div>
  );

  const inp = (key, placeholder, type = "text") => (
    <div style={{ position: "relative" }}>
      <input
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={e => set(key, e.target.value)}
        style={{ ...s.input, ...(errors[key] ? { borderColor: "#ef4444" } : {}) }}
      />
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .vr * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
        .vr input:focus, .vr select:focus {
          outline: none;
          border-color: #5C039B !important;
          box-shadow: 0 0 0 3px rgba(92,3,155,0.08);
        }
        .vr input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0.4; cursor: pointer; }
        .vr-btn:hover { background: #4a0280 !important; }
      `}</style>

      <div className="vr" style={s.page}>
        <div style={s.card}>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <button
              onClick={() => navigate(-1)}
              style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#888", fontSize: 13, padding: 0, marginBottom: 20 }}
            >
              <ArrowLeft size={15} /> Back
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg, #5C039B, #03A4F4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <User size={22} color="#fff" />
              </div>
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1a0030", margin: 0 }}>Create Vault Account</h1>
                <p style={{ fontSize: 12.5, color: "#aaa", margin: 0 }}>Register as a Freelance Agent on Xoto Vault</p>
              </div>
            </div>
          </div>

          {/* API Error */}
          {apiError && (
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, padding: "12px 14px", marginBottom: 20 }}>
              <AlertCircle size={15} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ margin: 0, fontSize: 13, color: "#dc2626", lineHeight: 1.5 }}>{apiError}</p>
            </div>
          )}

          {/* ── Personal Info ─────────────────────────────────────── */}
          <p style={s.sectionLabel}>Personal Information</p>
          <div style={{ ...s.grid2, marginBottom: 20 }}>
            {grp("first_name", "First Name",
              <div style={{ position: "relative" }}>
                <User size={14} color="#ccc" style={s.inputIcon} />
                <input
                  placeholder="Ahmed"
                  value={form.first_name}
                  onChange={e => set("first_name", e.target.value)}
                  style={{ ...s.input, paddingLeft: 36, ...(errors.first_name ? { borderColor: "#ef4444" } : {}) }}
                />
              </div>
            )}
            {grp("last_name", "Last Name",
              <div style={{ position: "relative" }}>
                <User size={14} color="#ccc" style={s.inputIcon} />
                <input
                  placeholder="Al Mansoori"
                  value={form.last_name}
                  onChange={e => set("last_name", e.target.value)}
                  style={{ ...s.input, paddingLeft: 36, ...(errors.last_name ? { borderColor: "#ef4444" } : {}) }}
                />
              </div>
            )}
            {grp("gender", "Gender",
              <select
                value={form.gender}
                onChange={e => set("gender", e.target.value)}
                style={{ ...s.input, ...(errors.gender ? { borderColor: "#ef4444" } : {}) }}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            )}
            {grp("dateOfBirth", "Date of Birth",
              <div style={{ position: "relative" }}>
                <Calendar size={14} color="#ccc" style={s.inputIcon} />
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={e => set("dateOfBirth", e.target.value)}
                  style={{ ...s.input, paddingLeft: 36, ...(errors.dateOfBirth ? { borderColor: "#ef4444" } : {}) }}
                />
              </div>
            )}
            {grp("maritalStatus", "Marital Status",
              <select
                value={form.maritalStatus}
                onChange={e => set("maritalStatus", e.target.value)}
                style={{ ...s.input, ...(errors.maritalStatus ? { borderColor: "#ef4444" } : {}) }}
              >
                <option value="">Select status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            )}
            {grp("nationality", "Nationality",
              <div style={{ position: "relative" }}>
                <Globe size={14} color="#ccc" style={s.inputIcon} />
                <input
                  placeholder="e.g. UAE"
                  value={form.nationality}
                  onChange={e => set("nationality", e.target.value)}
                  style={{ ...s.input, paddingLeft: 36, ...(errors.nationality ? { borderColor: "#ef4444" } : {}) }}
                />
              </div>
            )}
          </div>

          {/* ── Contact Info ──────────────────────────────────────── */}
          <p style={s.sectionLabel}>Contact Information</p>
          <div style={{ ...s.grid2, marginBottom: 20 }}>
            {grp("email", "Email Address",
              <div style={{ position: "relative" }}>
                <Mail size={14} color="#ccc" style={s.inputIcon} />
                <input
                  type="email"
                  placeholder="ahmed@example.com"
                  value={form.email}
                  onChange={e => set("email", e.target.value)}
                  style={{ ...s.input, paddingLeft: 36, ...(errors.email ? { borderColor: "#ef4444" } : {}) }}
                />
              </div>
            )}
            {grp("phone_number", "Phone Number",
              <div style={{ display: "flex", gap: 8 }}>
                <select
                  value={form.country_code}
                  onChange={e => set("country_code", e.target.value)}
                  style={{ ...s.input, width: 90, flexShrink: 0 }}
                >
                  {["+971","+966","+1","+44","+91","+20","+973","+968"].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div style={{ flex: 1, position: "relative" }}>
                  <Phone size={14} color="#ccc" style={s.inputIcon} />
                  <input
                    placeholder="50 123 4567"
                    value={form.phone_number}
                    onChange={e => set("phone_number", e.target.value)}
                    style={{ ...s.input, paddingLeft: 36, width: "100%", ...(errors.phone_number ? { borderColor: "#ef4444" } : {}) }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── Password ──────────────────────────────────────────── */}
          <p style={s.sectionLabel}>Set Password</p>
          <div style={{ ...s.grid2, marginBottom: 28 }}>
            {grp("password", "Password",
              <div style={{ position: "relative" }}>
                <Lock size={14} color="#ccc" style={s.inputIcon} />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={e => set("password", e.target.value)}
                  style={{ ...s.input, paddingLeft: 36, paddingRight: 38, ...(errors.password ? { borderColor: "#ef4444" } : {}) }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#aaa", padding: 0, display: "flex" }}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            )}
            {grp("confirmPassword", "Confirm Password",
              <div style={{ position: "relative" }}>
                <Lock size={14} color="#ccc" style={s.inputIcon} />
                <input
                  type={showConf ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={e => set("confirmPassword", e.target.value)}
                  style={{ ...s.input, paddingLeft: 36, paddingRight: 38, ...(errors.confirmPassword ? { borderColor: "#ef4444" } : {}) }}
                />
                <button
                  type="button"
                  onClick={() => setShowConf(v => !v)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#aaa", padding: 0, display: "flex" }}
                >
                  {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            className="vr-btn"
            onClick={handleSubmit}
            disabled={loading}
            style={{ ...s.btnPrimary, width: "100%", justifyContent: "center", opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading
              ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Creating Account…</>
              : <><CheckCircle2 size={16} /> Create Account</>
            }
          </button>

          <p style={{ textAlign: "center", fontSize: 13, color: "#aaa", marginTop: 16 }}>
            Already have an account?{" "}
            <span
              onClick={() => navigate("/vault/login")}
              style={{ color: "#5C039B", fontWeight: 600, cursor: "pointer" }}
            >
              Sign in
            </span>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

const s = {
  page:         { minHeight: "100vh", background: "#f8f7fc", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px" },
  card:         { background: "#fff", borderRadius: 20, padding: "36px 36px 28px", width: "100%", maxWidth: 680, border: "1px solid #ede8f7", boxShadow: "0 8px 32px rgba(92,3,155,.07)" },
  grid2:        { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px" },
  label:        { display: "block", fontSize: 12.5, fontWeight: 600, color: "#555", marginBottom: 6 },
  input:        { width: "100%", padding: "10px 12px", border: "1.5px solid #e5dff5", borderRadius: 10, fontSize: 13.5, color: "#1a0030", background: "#faf8ff", transition: "border-color .15s" },
  inputIcon:    { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" },
  errMsg:       { fontSize: 11.5, color: "#ef4444", margin: "4px 0 0" },
  sectionLabel: { fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#5C039B", marginBottom: 12, display: "block" },
  btnPrimary:   { display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", background: "#5C039B", color: "#fff", border: "none", borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "background .15s" },
};