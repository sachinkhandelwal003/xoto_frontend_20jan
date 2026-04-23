// src/ecommerce/B2C/PartnerLeadDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import {
  ArrowLeft, Loader2, CheckCircle, XCircle, AlertCircle,
  User, Mail, Phone, MessageSquare, Globe, Heart, Briefcase,
  DollarSign, Home, Building, MapPin, Calendar, Layers,
  CreditCard, Clock, Star, FileText, RefreshCw, Shield,
  TrendingUp, File, Eye, ChevronRight,
} from "lucide-react";

/* ══════════════════════════
   XOTO THEME TOKENS
══════════════════════════ */
const T = {
  primary:     "#5C039B",
  primaryLight:"#7C3AED",
  primaryBg:   "#FAF5FF",
  primaryBorder:"#E9D5FF",
  bg:          "#F4F1FA",
  card:        "#FFFFFF",
  border:      "#EDE9F4",
  text:        "#1E0B3B",
  textSub:     "#6B5B87",
  textMuted:   "#A89BC2",
  success:     "#059669",
  successBg:   "#ECFDF5",
  successBorder:"#A7F3D0",
  warning:     "#D97706",
  warningBg:   "#FFFBEB",
  error:       "#DC2626",
  errorBg:     "#FEF2F2",
  errorBorder: "#FECACA",
};

const STATUS_OPTIONS = [
  "New",
  "Contacted",
  "Qualified",
  "Collecting Documentation",
  "Disbursed",
];

const STATUS_STYLE = {
  "New":                      { bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
  "Contacted":                { bg: "#FFF7ED", color: "#D97706", border: "#FED7AA" },
  "Qualified":                { bg: "#F0FDF4", color: "#059669", border: "#A7F3D0" },
  "Collecting Documentation": { bg: T.primaryBg, color: T.primary, border: T.primaryBorder },
  "Disbursed":                { bg: "#ECFDF5", color: "#065F46", border: "#6EE7B7" },
};

/* ══════════════════════════
   GLOBAL STYLES
══════════════════════════ */
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

    .xoto-root, .xoto-root * {
      box-sizing: border-box;
      font-family: 'Inter', sans-serif;
    }

    @keyframes xoto-spin {
      to { transform: rotate(360deg); }
    }
    @keyframes xoto-fade {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .xoto-fade { animation: xoto-fade 0.3s ease both; }

    /* ── Card hover ── */
    .xoto-card-hover:hover {
      border-color: ${T.primaryBorder} !important;
      box-shadow: 0 4px 20px rgba(92,3,155,0.08) !important;
      transform: translateY(-1px);
      transition: all 0.2s ease;
    }

    /* ── Status btn ── */
    .xoto-status-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 11px 14px;
      border-radius: 10px;
      cursor: pointer;
      border: 1.5px solid ${T.border};
      background: #fff;
      transition: all 0.15s ease;
      text-align: left;
    }
    .xoto-status-btn:hover {
      border-color: ${T.primaryBorder} !important;
      background: ${T.primaryBg} !important;
    }

    /* ── Back btn ── */
    .xoto-back:hover {
      background: ${T.primaryBg} !important;
      color: ${T.primary} !important;
      border-color: ${T.primaryBorder} !important;
    }

    /* ── Doc card ── */
    .xoto-doc:hover {
      border-color: ${T.primaryBorder} !important;
      box-shadow: 0 4px 16px rgba(92,3,155,0.07) !important;
    }

    /* ── View btn ── */
    .xoto-view:hover {
      background: ${T.primary} !important;
      color: #fff !important;
      border-color: ${T.primary} !important;
    }

    .xoto-textarea:focus {
      outline: none;
      border-color: ${T.primary} !important;
      box-shadow: 0 0 0 3px rgba(92,3,155,0.1) !important;
    }

    /* ══ RESPONSIVE GRIDS ══ */
    .info-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 20px;
    }
    .status-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    .doc-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 10px;
    }

    @media (max-width: 1100px) {
      .info-grid { grid-template-columns: repeat(2, 1fr) !important; }
    }
    @media (max-width: 768px) {
      .info-grid    { grid-template-columns: 1fr !important; }
      .status-grid  { grid-template-columns: 1fr !important; }
      .doc-grid     { grid-template-columns: 1fr !important; }
      .xoto-topbar  { flex-direction: column !important; align-items: flex-start !important; }
      .xoto-root    { padding: 14px !important; }
      .xoto-section { padding: 16px !important; }
    }
  `}</style>
);

/* ══════════════════════════
   SUBCOMPONENTS
══════════════════════════ */

const Spinner = () => (
  <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg }}>
    <div style={{ textAlign: "center" }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", border: `3px solid ${T.primaryBorder}`, borderTopColor: T.primary, animation: "xoto-spin 0.7s linear infinite", margin: "0 auto 12px" }} />
      <p style={{ fontSize: 13, color: T.textMuted, fontWeight: 500 }}>Loading lead details…</p>
    </div>
  </div>
);

const VERIFY_MAP = {
  verified: { bg: "#ECFDF5", color: "#059669", label: "Verified" },
  pending:  { bg: "#FFF7ED", color: "#D97706", label: "Pending"  },
  rejected: { bg: "#FEF2F2", color: "#DC2626", label: "Rejected" },
};
const VerifyBadge = ({ status }) => {
  const s = VERIFY_MAP[status?.toLowerCase()] || VERIFY_MAP.pending;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 99, background: s.bg, color: s.color, fontSize: 11, fontWeight: 600 }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color }} />
      {s.label}
    </span>
  );
};

const DOC_LABELS = {
  emirates_id_front:  "Emirates ID (Front)",
  emirates_id_back:   "Emirates ID (Back)",
  passport:           "Passport",
  visa:               "Visa",
  bank_statements:    "Bank Statements",
  salary_certificate: "Salary Certificate",
  payslips:           "Payslips",
};
const fmtDocType = (t) => DOC_LABELS[t] || (t || "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

const getMime = (mime, name = "") => {
  if (mime === "application/pdf" || (name || "").endsWith(".pdf")) return { bg: "#FEF2F2", color: "#DC2626", label: "PDF" };
  if (mime?.startsWith("image/") || /\.(jpg|jpeg|png|webp)$/i.test(name || "")) return { bg: "#FFF7ED", color: "#D97706", label: "IMG" };
  return { bg: "#F1F5F9", color: "#475569", label: "FILE" };
};

/* ── Section Card ── */
const SCard = ({ title, icon: Icon, accent = T.primary, children }) => (
  <div className="xoto-fade xoto-card-hover xoto-section"
    style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "20px 22px", boxShadow: "0 1px 6px rgba(92,3,155,0.04)", transition: "all 0.2s" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingBottom: 14, borderBottom: `1px solid ${T.border}` }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: `${accent}15`, border: `1.5px solid ${accent}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={16} color={accent} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{title}</span>
    </div>
    {children}
  </div>
);

/* ── Info Row ── */
const IRow = ({ icon: Icon, label, value, mono, last }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: last ? "none" : `1px solid ${T.border}`, gap: 8, flexWrap: "wrap" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
      {Icon && <Icon size={12} color={T.textMuted} />}
      <span style={{ fontSize: 12, color: T.textMuted, fontWeight: 500 }}>{label}</span>
    </div>
    <span style={{ fontSize: 13, fontWeight: 500, color: value ? T.text : T.border, textAlign: "right", fontFamily: mono ? "monospace" : "inherit", wordBreak: "break-word", maxWidth: "58%" }}>
      {value || "—"}
    </span>
  </div>
);

const fmtAED = (n) => n ? `AED ${Number(n).toLocaleString("en-AE", { maximumFractionDigits: 0 })}` : null;

/* ══════════════════════════
   MAIN COMPONENT
══════════════════════════ */
const PartnerLeadDetails = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [lead,       setLead]       = useState(null);
  const [documents,  setDocuments]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [selectedStatus, setSelectedStatus] = useState("");
  const [reason,         setReason]         = useState("");
  const [updating,       setUpdating]       = useState(false);
  const [updateMsg,      setUpdateMsg]       = useState(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        setFetchError("");
        const [leadRes, docRes] = await Promise.all([
          apiService.get(`/vault/lead/${id}`),
          apiService.get(`/vault/lead/documents/${id}`),
        ]);
        const leadData = leadRes?.data?.data || leadRes?.data || null;
        setLead(leadData);
        if (leadData?.currentStatus) setSelectedStatus(leadData.currentStatus);

        const docs =
          Array.isArray(docRes?.data)              ? docRes.data :
          Array.isArray(docRes?.data?.data)        ? docRes.data.data :
          Array.isArray(docRes?.data?.documents)   ? docRes.data.documents : [];
        setDocuments(docs);
      } catch (err) {
        setFetchError(err?.response?.data?.message || "Failed to load lead");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === lead?.currentStatus) return;
    setUpdating(true);
    setUpdateMsg(null);
    try {
      await apiService.put(`/vault/lead/${id}/status`, {
        currentStatus: selectedStatus,
        status:        selectedStatus,
        reason:        reason.trim() || undefined,
      });
      setLead((p) => ({ ...p, currentStatus: selectedStatus }));
      setUpdateMsg({ type: "success", text: `Status updated to "${selectedStatus}"` });
      setReason("");
    } catch (err) {
      setUpdateMsg({ type: "error", text: err?.response?.data?.message || "Update failed" });
    } finally {
      setUpdating(false);
      setTimeout(() => setUpdateMsg(null), 5000);
    }
  };

  if (loading) return <><GlobalStyle /><Spinner /></>;

  if (fetchError) return (
    <div className="xoto-root" style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24 }}>
      <GlobalStyle />
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: T.errorBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <AlertCircle size={28} color={T.error} />
      </div>
      <p style={{ color: T.error, fontSize: 14, fontWeight: 500, textAlign: "center" }}>{fetchError}</p>
      <button onClick={() => navigate(-1)}
        style={{ padding: "10px 22px", background: T.primary, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
        Go Back
      </button>
    </div>
  );

  if (!lead) return <div className="xoto-root" style={{ padding: 40, color: T.textMuted }}><GlobalStyle />No lead found.</div>;

  const ci = lead.customerInfo     || {};
  const pd = lead.propertyDetails  || {};
  const lr = lead.loanRequirements || {};

  const grouped   = documents.reduce((acc, doc) => {
    const cat = doc.documentCategory || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(doc);
    return acc;
  }, {});
  const catOrder  = ["identity", "financial", "property", "other"];
  const catLabels = { identity: "Identity", financial: "Financial", property: "Property", other: "Other" };
  const catColors = { identity: "#2563EB", financial: "#059669", property: T.primary, other: "#64748B" };

  const curSt = STATUS_STYLE[lead.currentStatus] || { bg: "#F3F4F6", color: "#6B7280", border: "#E5E7EB" };
  const canUpdate = !updating && selectedStatus && selectedStatus !== lead.currentStatus;

  return (
    <div className="xoto-root" style={{ minHeight: "100vh", background: T.bg, padding: "24px 28px" }}>
      <GlobalStyle />

      {/* ══ TOP BAR ══ */}
      <div className="xoto-topbar xoto-fade" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, gap: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="xoto-back" onClick={() => navigate(-1)}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, fontWeight: 600, color: T.textSub, cursor: "pointer", transition: "all 0.15s", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <ArrowLeft size={15} /> Back
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: T.text }}>Lead Details</h1>
            {lead.leadId && (
              <p style={{ margin: "2px 0 0", fontSize: 11, color: T.textMuted, fontFamily: "monospace" }}>{lead.leadId}</p>
            )}
          </div>
        </div>

        {lead.currentStatus && (
          <span style={{ padding: "6px 16px", borderRadius: 99, background: curSt.bg, color: curSt.color, fontSize: 12, fontWeight: 700, border: `1.5px solid ${curSt.border}`, whiteSpace: "nowrap" }}>
            {lead.currentStatus}
          </span>
        )}
      </div>

      {/* ══ INFO GRID: 3 → 2 → 1 col ══ */}
      <div className="info-grid">

        {/* Customer Info */}
        <SCard title="Customer Info" icon={User} accent="#2563EB">
          <IRow icon={User}          label="Full Name"      value={ci.fullName} />
          <IRow icon={Mail}          label="Email"          value={ci.email} />
          <IRow icon={Phone}         label="Mobile"         value={ci.mobileNumber} mono />
          <IRow icon={MessageSquare} label="WhatsApp"       value={ci.whatsappNumber} mono />
          <IRow icon={Globe}         label="Nationality"    value={ci.nationality} />
          <IRow icon={Heart}         label="Marital Status" value={ci.maritalStatus} />
          <IRow icon={Briefcase}     label="Employer"       value={ci.employer} />
          <IRow icon={DollarSign}    label="Monthly Salary" value={fmtAED(ci.monthlySalary)} mono last />
        </SCard>

        {/* Property Details */}
        <SCard title="Property Details" icon={Home} accent="#059669">
          <IRow icon={Layers}     label="Type"           value={[pd.propertyType, pd.propertySubtype].filter(Boolean).join(" — ") || null} />
          <IRow icon={DollarSign} label="Property Value" value={fmtAED(pd.propertyValue)} mono />
          <IRow icon={CreditCard} label="Down Payment"   value={fmtAED(pd.downPaymentAmount)} mono />
          <IRow icon={Building}   label="Building"       value={pd.propertyAddress?.building} />
          <IRow icon={MapPin}     label="Area"           value={pd.propertyAddress?.area} />
          <IRow icon={MapPin}     label="City"           value={pd.propertyAddress?.city} />
          <IRow icon={Clock}      label="Property Age"   value={pd.propertyAgeYears ? `${pd.propertyAgeYears} yrs` : null} />
          <IRow icon={Star}       label="Off-Plan"       value={pd.isOffPlan != null ? (pd.isOffPlan ? "Yes" : "No") : null} last />
        </SCard>

        {/* Loan Requirements */}
        <SCard title="Loan Requirements" icon={TrendingUp} accent={T.primary}>
          <IRow icon={DollarSign} label="Loan Amount"     value={fmtAED(pd.loanAmountRequired)} mono />
          <IRow icon={Calendar}   label="Tenure"          value={lr.preferredTenureYears ? `${lr.preferredTenureYears} Years` : null} />
          <IRow icon={TrendingUp} label="Rate Type"       value={lr.preferredInterestRateType} />
          <IRow icon={Building}   label="Preferred Banks" value={lr.preferredBanks?.join(", ")} />
          <IRow icon={FileText}   label="Special Req."    value={lr.specialRequirements} />
          <IRow icon={Shield}     label="Referral Type"   value={lead.referralType} />
          <IRow icon={FileText}   label="Notes"           value={lead.notesToXoto} last />
        </SCard>
      </div>

      {/* ══ STATUS UPDATE CARD ══ */}
      <div className="xoto-fade xoto-section"
        style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "20px 22px", marginBottom: 20, boxShadow: "0 1px 6px rgba(92,3,155,0.04)" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingBottom: 14, borderBottom: `1px solid ${T.border}`, flexWrap: "wrap" }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: `${T.primary}15`, border: `1.5px solid ${T.primaryBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <RefreshCw size={16} color={T.primary} />
          </div>
          <div>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Update Lead Status</span>
            {lead.currentStatus && (
              <p style={{ margin: "2px 0 0", fontSize: 12, color: T.textMuted }}>
                Current status: <strong style={{ color: curSt.color }}>{lead.currentStatus}</strong>
              </p>
            )}
          </div>
        </div>

        {/* 2-col grid */}
        <div className="status-grid">

          {/* Left — Status options */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: T.textSub, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Select New Status</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {STATUS_OPTIONS.map((status) => {
                const sc  = STATUS_STYLE[status] || { bg: "#F3F4F6", color: "#6B7280", border: "#E5E7EB" };
                const sel = selectedStatus === status;
                return (
                  <button key={status} className="xoto-status-btn" onClick={() => setSelectedStatus(status)}
                    style={{ border: sel ? `2px solid ${sc.color}` : `1.5px solid ${T.border}`, background: sel ? sc.bg : T.card }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 9, height: 9, borderRadius: "50%", background: sel ? sc.color : T.border, flexShrink: 0, transition: "background 0.15s" }} />
                      <span style={{ fontSize: 13, fontWeight: sel ? 600 : 400, color: sel ? sc.color : T.textSub }}>
                        {status}
                      </span>
                    </div>
                    {sel && <CheckCircle size={15} color={sc.color} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right — Reason + Submit */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: T.textSub, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Reason <span style={{ color: T.textMuted, fontWeight: 400, textTransform: "none" }}>(optional)</span>
              </p>
              <textarea className="xoto-textarea"
                placeholder="Enter reason for status change..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={7}
                style={{ width: "100%", padding: "12px 14px", border: `1.5px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.text, resize: "vertical", fontFamily: "Inter, sans-serif", transition: "all 0.15s", outline: "none", background: T.primaryBg, lineHeight: 1.6 }}
              />
            </div>

            {/* Feedback */}
            {updateMsg && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, background: updateMsg.type === "success" ? T.successBg : T.errorBg, border: `1px solid ${updateMsg.type === "success" ? T.successBorder : T.errorBorder}` }}>
                {updateMsg.type === "success"
                  ? <CheckCircle size={15} color={T.success} />
                  : <XCircle    size={15} color={T.error} />}
                <span style={{ fontSize: 13, fontWeight: 500, color: updateMsg.type === "success" ? "#065F46" : "#991B1B" }}>
                  {updateMsg.text}
                </span>
              </div>
            )}

            {/* Submit Button */}
            <button onClick={handleStatusUpdate} disabled={!canUpdate}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px 20px", background: canUpdate ? `linear-gradient(135deg, ${T.primary}, ${T.primaryLight})` : T.border, border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, color: canUpdate ? "#fff" : T.textMuted, cursor: canUpdate ? "pointer" : "not-allowed", transition: "all 0.2s", boxShadow: canUpdate ? `0 4px 14px rgba(92,3,155,0.3)` : "none" }}>
              {updating
                ? <><Loader2 size={15} style={{ animation: "xoto-spin 0.7s linear infinite" }} /> Updating…</>
                : <><RefreshCw size={14} /> Update Status</>}
            </button>

            {selectedStatus === lead.currentStatus && selectedStatus && (
              <p style={{ fontSize: 12, color: T.textMuted, textAlign: "center", margin: 0 }}>
                Select a different status to update
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ══ DOCUMENTS ══ */}
      <div className="xoto-fade xoto-section"
        style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "20px 22px", boxShadow: "0 1px 6px rgba(92,3,155,0.04)" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingBottom: 14, borderBottom: `1px solid ${T.border}`, flexWrap: "wrap" }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "#FFF7ED", border: "1.5px solid #FED7AA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <File size={16} color="#D97706" />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Uploaded Documents</span>
          {documents.length > 0 && (
            <span style={{ fontSize: 12, fontWeight: 600, background: T.primaryBg, color: T.primary, padding: "2px 10px", borderRadius: 99, border: `1px solid ${T.primaryBorder}` }}>
              {documents.length}
            </span>
          )}
        </div>

        {documents.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: T.primaryBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <FileText size={22} color={T.primaryBorder} />
            </div>
            <p style={{ color: T.textMuted, fontSize: 14, fontWeight: 500 }}>No documents uploaded yet</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {catOrder.map(cat => {
              const docs   = grouped[cat];
              if (!docs?.length) return null;
              const accent = catColors[cat] || "#64748B";
              return (
                <div key={cat}>
                  {/* Category label */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {catLabels[cat]} Documents
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 600, background: `${accent}15`, color: accent, padding: "1px 8px", borderRadius: 99 }}>{docs.length}</span>
                    <div style={{ flex: 1, height: 1, background: T.border, minWidth: 16 }} />
                  </div>

                  {/* Doc cards */}
                  <div className="doc-grid">
                    {docs.map((doc, i) => {
                      const mime    = getMime(doc.mimeType, doc.fileName);
                      const label   = fmtDocType(doc.documentType);
                      const sizeMb  = doc.fileSizeMb != null
                        ? doc.fileSizeMb < 1 ? `${(doc.fileSizeMb * 1024).toFixed(0)} KB` : `${doc.fileSizeMb.toFixed(1)} MB`
                        : doc.formattedFileSize || "";
                      const fileUrl = doc.fileUrl || doc.url || "";
                      return (
                        <div key={doc._id || i} className="xoto-doc"
                          style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: T.card, border: `1px solid ${T.border}`, transition: "all 0.2s" }}>
                          {/* Type badge */}
                          <div style={{ width: 44, height: 44, borderRadius: 10, background: mime.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <File size={18} color={mime.color} />
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={label}>
                              {label}
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                              <VerifyBadge status={doc.verificationStatus} />
                              {sizeMb && (
                                <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 500 }}>{sizeMb}</span>
                              )}
                              <span style={{ fontSize: 11, background: mime.bg, color: mime.color, padding: "1px 7px", borderRadius: 99, fontWeight: 600 }}>
                                {mime.label}
                              </span>
                            </div>
                          </div>

                          {fileUrl && (
                            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="xoto-view"
                              style={{ width: 34, height: 34, borderRadius: 9, border: `1px solid ${T.border}`, background: T.primaryBg, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", flexShrink: 0, transition: "all 0.15s" }}
                              title="View Document">
                              <Eye size={14} color={T.primary} />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerLeadDetails;