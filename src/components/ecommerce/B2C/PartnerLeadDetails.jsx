import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const PRIMARY = "#5c039c";

/* ── Fonts ── */
const FontInjector = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
    .pld-root, .pld-root * { box-sizing: border-box; font-family: 'DM Sans', sans-serif; }
    @keyframes pld-spin  { to { transform: rotate(360deg); } }
    @keyframes pld-fade  { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .pld-animate { animation: pld-fade 0.25s ease both; }
    .pld-back:hover { background: #f5f0ff !important; color: ${PRIMARY} !important; border-color: #d8b4fe !important; }
    .pld-doc-card:hover { border-color: #c4b5fd !important; box-shadow: 0 4px 16px rgba(92,3,156,0.08) !important; transform: translateY(-2px); }
    .pld-view-btn:hover { background: ${PRIMARY} !important; color: #fff !important; }
  `}</style>
);

/* ── Spinner ── */
const Spinner = () => (
  <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f5ff" }}>
    <div style={{ width: 36, height: 36, borderRadius: "50%", border: `3px solid #e9d5ff`, borderTopColor: PRIMARY, animation: "pld-spin 0.7s linear infinite" }} />
  </div>
);

/* ── Status badge for verification ── */
const VERIFY_MAP = {
  verified: { bg: "#f0fdf4", color: "#166534", dot: "#22c55e", label: "Verified" },
  pending:  { bg: "#fffbeb", color: "#92400e", dot: "#f59e0b", label: "Pending"  },
  rejected: { bg: "#fef2f2", color: "#991b1b", dot: "#ef4444", label: "Rejected" },
};
const VerifyBadge = ({ status }) => {
  const s = VERIFY_MAP[status] || VERIFY_MAP.pending;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 999, background: s.bg, color: s.color, fontSize: 11, fontWeight: 600 }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot }} />
      {s.label}
    </span>
  );
};

/* ── Doc Type label ── */
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

/* ── MIME → badge ── */
const getMime = (mime, name = "") => {
  if (mime === "application/pdf" || name.endsWith(".pdf")) return { bg: "#fef2f2", color: "#991b1b", label: "PDF" };
  if (mime?.startsWith("image/") || /\.(jpg|jpeg|png|webp)$/i.test(name)) return { bg: "#fefce8", color: "#854d0e", label: "IMG" };
  return { bg: "#f1f5f9", color: "#475569", label: "FILE" };
};

/* ── Info Row ── */
const InfoRow = ({ label, value, mono, last }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "9px 0", borderBottom: last ? "none" : "1px solid #f3f4f6", gap: 12 }}>
    <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500, flexShrink: 0 }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: 500, color: value ? "#111827" : "#d1d5db", textAlign: "right", fontFamily: mono ? "'DM Mono', monospace" : "inherit", wordBreak: "break-word" }}>
      {value || "—"}
    </span>
  </div>
);

/* ── Section Card ── */
const SectionCard = ({ title, icon, accent = PRIMARY, children }) => (
  <div className="pld-animate" style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid #f3f4f6" }}>
      <div style={{ width: 32, height: 32, borderRadius: 9, background: `${accent}15`, border: `1.5px solid ${accent}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
        {icon}
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: "#1f2937" }}>{title}</span>
    </div>
    {children}
  </div>
);

/* ── Format AED ── */
const fmtAED = (n) => n ? `AED ${Number(n).toLocaleString("en-AE", { maximumFractionDigits: 0 })}` : null;

/* ── MAIN ── */
const PartnerLeadDetails = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [lead,      setLead]      = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [leadRes, docRes] = await Promise.all([
          apiService.get(`/vault/lead/admin/${id}`),
          apiService.get(`/vault/lead/documents/${id}`),
        ]);
        setLead(leadRes?.data?.data || leadRes?.data || null);
        const docs = Array.isArray(docRes?.data) ? docRes.data
          : Array.isArray(docRes?.data?.data) ? docRes.data.data
          : [];
        setDocuments(docs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <><FontInjector /><Spinner /></>;
  if (!lead)   return <div className="pld-root" style={{ padding: 40, color: "#6b7280" }}>No lead found.</div>;

  const ci = lead.customerInfo    || {};
  const pd = lead.propertyDetails || {};
  const lr = lead.loanRequirements || {};

  /* Group docs by category */
  const grouped = documents.reduce((acc, doc) => {
    const cat = doc.documentCategory || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(doc);
    return acc;
  }, {});
  const catOrder = ["identity", "financial", "property", "other"];
  const catLabels = { identity: "Identity", financial: "Financial", property: "Property", other: "Other" };
  const catColors = { identity: "#2563eb", financial: "#16a34a", property: "#9333ea", other: "#64748b" };

  return (
    <div className="pld-root" style={{ minHeight: "100vh", background: "#f8f5ff", padding: "28px 32px" }}>
      <FontInjector />

      {/* ── Top bar ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            className="pld-back"
            onClick={() => navigate(-1)}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 14px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer", transition: "all 0.15s", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
          >
            ← Back
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>Lead Details</h1>
            {lead.leadId && (
              <p style={{ margin: "3px 0 0", fontSize: 12, color: "#9ca3af", fontFamily: "'DM Mono', monospace" }}>{lead.leadId}</p>
            )}
          </div>
        </div>

        {/* Status pill */}
        {lead.currentStatus && (
          <span style={{ padding: "6px 16px", borderRadius: 999, background: "#f5f0ff", color: PRIMARY, fontSize: 12, fontWeight: 700, border: `1px solid #d8b4fe` }}>
            {lead.currentStatus}
          </span>
        )}
      </div>

      {/* ── 3 column info grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>

        <SectionCard title="Customer Info" icon="👤" accent="#2563eb">
          <InfoRow label="Full Name"      value={ci.fullName} />
          <InfoRow label="Email"          value={ci.email} />
          <InfoRow label="Mobile"         value={ci.mobileNumber} mono />
          <InfoRow label="WhatsApp"       value={ci.whatsappNumber} mono />
          <InfoRow label="Nationality"    value={ci.nationality} />
          <InfoRow label="Marital Status" value={ci.maritalStatus} />
          <InfoRow label="Employer"       value={ci.employer} />
          <InfoRow label="Monthly Salary" value={fmtAED(ci.monthlySalary)} mono last />
        </SectionCard>

        <SectionCard title="Property Details" icon="🏠" accent="#16a34a">
          <InfoRow label="Type"           value={[pd.propertyType, pd.propertySubtype].filter(Boolean).join(" — ") || null} />
          <InfoRow label="Property Value" value={fmtAED(pd.propertyValue)} mono />
          <InfoRow label="Down Payment"   value={fmtAED(pd.downPaymentAmount)} mono />
          <InfoRow label="Building"       value={pd.propertyAddress?.building} />
          <InfoRow label="Area"           value={pd.propertyAddress?.area} />
          <InfoRow label="City"           value={pd.propertyAddress?.city} />
          <InfoRow label="Property Age"   value={pd.propertyAgeYears ? `${pd.propertyAgeYears} yrs` : null} />
          <InfoRow label="Off-Plan"       value={pd.isOffPlan != null ? (pd.isOffPlan ? "Yes" : "No") : null} last />
        </SectionCard>

        <SectionCard title="Loan Requirements" icon="💼" accent={PRIMARY}>
          <InfoRow label="Loan Amount"    value={fmtAED(pd.loanAmountRequired)} mono />
          <InfoRow label="Tenure"         value={lr.preferredTenureYears ? `${lr.preferredTenureYears} Years` : null} />
          <InfoRow label="Rate Type"      value={lr.preferredInterestRateType} />
          <InfoRow label="Preferred Banks" value={lr.preferredBanks?.join(", ")} />
          <InfoRow label="Special Req."   value={lr.specialRequirements} />
          <InfoRow label="Referral Type"  value={lead.referralType} />
          <InfoRow label="Notes"          value={lead.notesToXoto} last />
        </SectionCard>
      </div>

      {/* ── Documents ── */}
      <div className="pld-animate" style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid #f3f4f6" }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "#fef3c7", border: "1.5px solid #fde68a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>📄</div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1f2937" }}>Uploaded Documents</span>
          {documents.length > 0 && (
            <span style={{ fontSize: 12, fontWeight: 500, background: "#f1f5f9", color: "#64748b", padding: "2px 10px", borderRadius: 999 }}>{documents.length}</span>
          )}
        </div>

        {documents.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af", fontSize: 14 }}>
            No documents uploaded yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {catOrder.map(cat => {
              const docs = grouped[cat];
              if (!docs?.length) return null;
              const accent = catColors[cat] || "#64748b";
              return (
                <div key={cat}>
                  {/* Category label */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.08em" }}>{catLabels[cat]} Documents</span>
                    <span style={{ fontSize: 11, fontWeight: 600, background: `${accent}15`, color: accent, padding: "1px 8px", borderRadius: 999 }}>{docs.length}</span>
                    <div style={{ flex: 1, height: 1, background: "#f1f5f9" }} />
                  </div>

                  {/* Doc cards grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
                    {docs.map((doc, i) => {
                      const mime    = getMime(doc.mimeType, doc.fileName);
                      const label   = fmtDocType(doc.documentType);
                      const sizeMb  = doc.fileSizeMb != null
                        ? doc.fileSizeMb < 1 ? `${(doc.fileSizeMb * 1024).toFixed(0)} KB` : `${doc.fileSizeMb.toFixed(1)} MB`
                        : doc.formattedFileSize || "";
                      const fileUrl = doc.fileUrl || doc.url || "";

                      return (
                        <div
                          key={doc._id || i}
                          className="pld-doc-card"
                          style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: "#fff", border: "1px solid #e5e7eb", transition: "all 0.2s ease", cursor: "default" }}
                        >
                          {/* File type badge */}
                          <div style={{ width: 42, height: 42, borderRadius: 10, background: mime.bg, color: mime.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, letterSpacing: "0.04em" }}>
                            {mime.label}
                          </div>

                          {/* Info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 600, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={label}>
                              {label}
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                              <VerifyBadge status={doc.verificationStatus} />
                              {sizeMb && <span style={{ fontSize: 11, color: "#9ca3af" }}>{sizeMb}</span>}
                            </div>
                          </div>

                          {/* View button */}
                          {fileUrl && (
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="pld-view-btn"
                              style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", textDecoration: "none", flexShrink: 0, transition: "all 0.15s", fontSize: 14 }}
                              title="View Document"
                            >
                              👁
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