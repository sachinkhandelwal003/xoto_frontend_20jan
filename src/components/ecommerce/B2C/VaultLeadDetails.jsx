import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../../manageApi/utils/custom.apiservice';
import {
  ArrowLeft, User, Home, Briefcase, Loader2, AlertCircle,
  FileText, Eye, RefreshCw,
} from 'lucide-react';

/* ── Fonts ──────────────────────────────────────────────────────────────────── */
const FontInjector = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
    .ld-root, .ld-root * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
    .ld-back:hover { background: #f0f7ff !important; color: #2563eb !important; border-color: #bfdbfe !important; }
    .ld-file-item:hover { background: #f0f7ff !important; border-color: #bfdbfe !important; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .ld-dl-btn:hover { background: #eff6ff !important; border-color: #bfdbfe !important; color: #2563eb !important; }
    @keyframes ld-spin { to { transform: rotate(360deg); } }
    @keyframes ld-fade { from { opacity:0; transform:translateY(8px);} to { opacity:1; transform:translateY(0);} }
    .ld-animate { animation: ld-fade 0.22s ease both; }
  `}</style>
);

/* ── Status Config ──────────────────────────────────────────────────────────── */
const STATUS_MAP = {
  'New':                      { bg: '#eff6ff', color: '#1d4ed8', dot: '#3b82f6', border: '#bfdbfe' },
  'Contacted':                { bg: '#fffbeb', color: '#92400e', dot: '#f59e0b', border: '#fde68a' },
  'Qualified':                { bg: '#f0fdf4', color: '#166534', dot: '#22c55e', border: '#bbf7d0' },
  'Collecting Documentation': { bg: '#faf5ff', color: '#581c87', dot: '#a855f7', border: '#e9d5ff' },
  'Disbursed':                { bg: '#f0f9ff', color: '#075985', dot: '#0ea5e9', border: '#bae6fd' },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] || { bg: '#f8fafc', color: '#475569', dot: '#94a3b8', border: '#e2e8f0' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 999, background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontSize: 12, fontWeight: 600 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.dot }} />
      {status || 'Unknown'}
    </span>
  );
};

/* ── Info Row ───────────────────────────────────────────────────────────────── */
const InfoRow = ({ label, value, last }) => (
  <div style={{ padding: '10px 0', borderBottom: last ? 'none' : '1px solid #f1f5f9' }}>
    <p style={{ margin: '0 0 3px', fontSize: 10.5, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
    <p style={{ margin: 0, fontSize: 13, fontWeight: value ? 500 : 400, color: value ? '#1e293b' : '#cbd5e1', fontFamily: "'JetBrains Mono', monospace", wordBreak: 'break-word' }}>
      {value ?? '—'}
    </p>
  </div>
);

/* ── Panel Card ─────────────────────────────────────────────────────────────── */
const Panel = ({ icon: Icon, label, accent, children }) => (
  <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8edf5', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }} className="ld-animate">
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #f1f5f9' }}>
      <div style={{ width: 32, height: 32, borderRadius: 9, background: `${accent}12`, border: `1.5px solid ${accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={15} style={{ color: accent }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>{label}</span>
    </div>
    {children}
  </div>
);

/* ── Document Type Label Map ────────────────────────────────────────────────── */
const DOC_TYPE_LABELS = {
  emirates_id_front:  'Emirates ID (Front)',
  emirates_id_back:   'Emirates ID (Back)',
  passport:           'Passport',
  visa:               'Visa',
  bank_statements:    'Bank Statements',
  salary_certificate: 'Salary Certificate',
  payslips:           'Payslips',
  trade_license:      'Trade License',
  tenancy_contract:   'Tenancy Contract',
  title_deed:         'Title Deed',
  noc:                'NOC Letter',
};

const formatDocType = (type) => {
  if (!type) return 'Document';
  return DOC_TYPE_LABELS[type] || type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

/* ── MIME / file type → badge config ───────────────────────────────────────── */
const getMimeConfig = (mimeType, fileName) => {
  if (mimeType) {
    if (mimeType === 'application/pdf')  return { bg: '#FCEBEB', color: '#A32D2D', label: 'PDF' };
    if (mimeType.startsWith('image/'))   return { bg: '#FAEEDA', color: '#854F0B', label: 'IMG' };
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return { bg: '#EAF3DE', color: '#3B6D11', label: 'XLS' };
    if (mimeType.includes('word') || mimeType.includes('document'))     return { bg: '#E6F1FB', color: '#185FA5', label: 'DOC' };
  }
  if (fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const MAP = {
      pdf:  { bg: '#FCEBEB', color: '#A32D2D', label: 'PDF' },
      jpg:  { bg: '#FAEEDA', color: '#854F0B', label: 'IMG' },
      jpeg: { bg: '#FAEEDA', color: '#854F0B', label: 'IMG' },
      png:  { bg: '#FAEEDA', color: '#854F0B', label: 'IMG' },
      webp: { bg: '#FAEEDA', color: '#854F0B', label: 'IMG' },
      xlsx: { bg: '#EAF3DE', color: '#3B6D11', label: 'XLS' },
      xls:  { bg: '#EAF3DE', color: '#3B6D11', label: 'XLS' },
      csv:  { bg: '#EAF3DE', color: '#3B6D11', label: 'CSV' },
      docx: { bg: '#E6F1FB', color: '#185FA5', label: 'DOC' },
      doc:  { bg: '#E6F1FB', color: '#185FA5', label: 'DOC' },
    };
    if (MAP[ext]) return MAP[ext];
  }
  return { bg: '#F1EFE8', color: '#5F5E5A', label: 'FILE' };
};

/* ── Verification Status Badge ──────────────────────────────────────────────── */
const VERIFY_MAP = {
  verified: { bg: '#f0fdf4', color: '#166534', dot: '#22c55e' },
  pending:  { bg: '#fffbeb', color: '#92400e', dot: '#f59e0b' },
  rejected: { bg: '#fef2f2', color: '#991b1b', dot: '#ef4444' },
};

const VerifyBadge = ({ status }) => {
  const s = VERIFY_MAP[status] || VERIFY_MAP.pending;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, background: s.bg, color: s.color, fontSize: 11, fontWeight: 600 }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending'}
    </span>
  );
};

/* ── Category grouping config ───────────────────────────────────────────────── */
const CATEGORY_CONFIG = {
  identity:  { label: 'Identity Documents',  accent: '#2563eb', bg: '#eff6ff' },
  financial: { label: 'Financial Documents', accent: '#16a34a', bg: '#f0fdf4' },
  property:  { label: 'Property Documents',  accent: '#9333ea', bg: '#faf5ff' },
  other:     { label: 'Other Documents',     accent: '#64748b', bg: '#f8fafc' },
};

/* ── Shared panel wrapper style ─────────────────────────────────────────────── */
const panelStyle = {
  background: '#fff',
  borderRadius: 16,
  border: '1px solid #e8edf5',
  padding: '20px 24px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
};

/* ── Documents Panel ────────────────────────────────────────────────────────── */
const DocumentsList = ({ leadId }) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['leadDocuments', leadId],
    queryFn: () => apiService.get(`/vault/lead/documents/${leadId}`),
    enabled: !!leadId,
  });

  // API returns { success: true, data: [...] }
  const documents = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];

  if (isLoading) {
    return (
      <div style={{ ...panelStyle, marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
          <Loader2 size={18} style={{ color: '#2563eb', animation: 'ld-spin 0.8s linear infinite' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...panelStyle, marginTop: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '24px 0' }}>
          <AlertCircle size={20} style={{ color: '#ef4444' }} />
          <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Failed to load documents</p>
          <button onClick={() => refetch()} style={{ padding: '5px 14px', background: '#f1f5f9', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Group documents by category
  const grouped = documents.reduce((acc, doc) => {
    const cat = doc.documentCategory || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(doc);
    return acc;
  }, {});

  const categoryOrder = ['identity', 'financial', 'property', 'other'];

  return (
    <div style={{ ...panelStyle, marginTop: 24 }} className="ld-animate">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <FileText size={16} style={{ color: '#94a3b8', flexShrink: 0 }} />
        <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>Uploaded Documents</span>
        {documents.length > 0 && (
          <span style={{ fontSize: 12, fontWeight: 500, background: '#f1f5f9', color: '#64748b', padding: '3px 10px', borderRadius: 999 }}>
            {documents.length}
          </span>
        )}
      </div>

      {/* Empty State */}
      {documents.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '40px 0' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={20} style={{ color: '#cbd5e1' }} />
          </div>
          <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>No documents uploaded yet</p>
          <p style={{ margin: 0, fontSize: 12, color: '#cbd5e1' }}>Documents will appear here once uploaded</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {categoryOrder.map(cat => {
            const docs = grouped[cat];
            if (!docs || docs.length === 0) return null;
            const catCfg = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.other;

            return (
              <div key={cat}>
                {/* Category Label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: catCfg.accent, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {catCfg.label}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, background: catCfg.bg, color: catCfg.accent, padding: '1px 8px', borderRadius: 999 }}>
                    {docs.length}
                  </span>
                  <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
                </div>

                {/* Document Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 10 }}>
                  {docs.map((doc, i) => {
                    const cfg      = getMimeConfig(doc.mimeType, doc.fileName);
                    const docLabel = formatDocType(doc.documentType);
                    const sizeMb   = doc.fileSizeMb != null
                      ? doc.fileSizeMb < 1
                        ? `${(doc.fileSizeMb * 1024).toFixed(0)} KB`
                        : `${doc.fileSizeMb.toFixed(1)} MB`
                      : doc.formattedFileSize || '';

                    return (
                      <div
                        key={doc._id || doc.documentId || i}
                        className="ld-file-item"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '12px 14px',
                          borderRadius: 12,
                          background: '#fff',
                          border: '1px solid #e8edf5',
                          transition: 'all 0.2s ease',
                          cursor: 'default',
                        }}
                      >
                        {/* File type badge */}
                        <div style={{
                          width: 42,
                          height: 42,
                          borderRadius: 10,
                          background: cfg.bg,
                          color: cfg.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 700,
                          flexShrink: 0,
                          letterSpacing: '0.05em',
                        }}>
                          {cfg.label}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={docLabel}>
                            {docLabel}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <VerifyBadge status={doc.verificationStatus} />
                            {sizeMb && (
                              <span style={{ fontSize: 11, color: '#94a3b8' }}>{sizeMb}</span>
                            )}
                          </div>
                        </div>

                        {/* View */}
                        {doc.fileUrl && (
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ld-dl-btn"
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              border: '1px solid #e2e8f0',
                              background: '#f8fafc',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#64748b',
                              textDecoration: 'none',
                              flexShrink: 0,
                              transition: 'all 0.15s ease',
                            }}
                            title={`View ${docLabel}`}
                          >
                            <Eye size={14} />
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
  );
};

/* ── Main Detail Page ───────────────────────────────────────────────────────── */
const VaultLeadDetail = () => {
  const { leadId } = useParams();
  const navigate   = useNavigate();

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['leadDetail', leadId],
    queryFn: () => apiService.get(`/vault/lead/${leadId}`),
    enabled: !!leadId,
  });

  const lead = data?.data || data;

  const showDocs = lead
    ? (lead.referralType && lead.referralType !== 'Referral Only') || lead.currentStatus === 'Collecting Documentation'
    : false;

  const fmtAED = (n) => n ? `AED ${Number(n).toLocaleString('en-AE', { maximumFractionDigits: 0 })}` : null;

  return (
    <div className="ld-root" style={{ padding: '32px 36px', minHeight: '100vh', background: '#f4f7fb' }}>
      <FontInjector />

      {/* ── Top Bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            className="ld-back"
            onClick={() => navigate(-1)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 14px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, color: '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <ArrowLeft size={15} /> Back
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Lead Details
            </h1>
            {lead && (
              <p style={{ margin: '3px 0 0', fontSize: 12, color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace" }}>
                {lead.leadId || leadId}
              </p>
            )}
          </div>
        </div>

        {lead && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <StatusBadge status={lead.currentStatus} />
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              style={{ width: 34, height: 34, borderRadius: 9, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s', opacity: isFetching ? 0.5 : 1 }}
            >
              <RefreshCw size={14} style={{ animation: isFetching ? 'ld-spin 0.8s linear infinite' : 'none' }} />
            </button>
          </div>
        )}
      </div>

      {/* ── Loading ── */}
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0', gap: 14 }}>
          <Loader2 size={32} style={{ color: '#2563eb', animation: 'ld-spin 0.8s linear infinite' }} />
          <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>Loading lead details…</p>
        </div>
      )}

      {/* ── Error ── */}
      {error && !isLoading && (
        <div style={{ padding: 28, background: '#fff', border: '1px solid #fecaca', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center', maxWidth: 420, margin: '60px auto' }}>
          <AlertCircle size={32} style={{ color: '#ef4444' }} />
          <p style={{ margin: 0, fontWeight: 700, color: '#dc2626', fontSize: 16 }}>Failed to load lead</p>
          <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>Could not fetch details for this lead. Please try again.</p>
          <button onClick={() => refetch()} style={{ padding: '9px 24px', background: '#dc2626', border: 'none', borderRadius: 9, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Try Again
          </button>
        </div>
      )}

      {/* ── Content ── */}
      {lead && !isLoading && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18, alignItems: 'start' }}>
            <Panel icon={User} label="Customer Info" accent="#2563eb">
              <InfoRow label="Full Name"       value={lead.customerInfo?.fullName} />
              <InfoRow label="Email"           value={lead.customerInfo?.email} />
              <InfoRow label="Mobile"          value={lead.customerInfo?.mobileNumber} />
              <InfoRow label="WhatsApp"        value={lead.customerInfo?.whatsappNumber} />
              <InfoRow label="Nationality"     value={lead.customerInfo?.nationality} />
              <InfoRow label="Marital Status"  value={lead.customerInfo?.maritalStatus} />
              <InfoRow label="Employer"        value={lead.customerInfo?.employer} />
              <InfoRow label="Monthly Salary"  value={fmtAED(lead.customerInfo?.monthlySalary)} last />
            </Panel>

            <Panel icon={Home} label="Property Details" accent="#16a34a">
              <InfoRow label="Type"            value={[lead.propertyDetails?.propertyType, lead.propertyDetails?.propertySubtype].filter(Boolean).join(' — ') || null} />
              <InfoRow label="Property Value"  value={fmtAED(lead.propertyDetails?.propertyValue)} />
              <InfoRow label="Down Payment"    value={fmtAED(lead.propertyDetails?.downPaymentAmount)} />
              <InfoRow label="Building"        value={lead.propertyDetails?.propertyAddress?.building} />
              <InfoRow label="Area"            value={lead.propertyDetails?.propertyAddress?.area} />
              <InfoRow label="City"            value={lead.propertyDetails?.propertyAddress?.city} />
              <InfoRow label="Property Age"    value={lead.propertyDetails?.propertyAgeYears ? `${lead.propertyDetails.propertyAgeYears} yrs` : null} />
              <InfoRow label="Off-Plan"        value={lead.propertyDetails?.isOffPlan != null ? (lead.propertyDetails.isOffPlan ? 'Yes' : 'No') : null} last />
            </Panel>

            <Panel icon={Briefcase} label="Loan Requirements" accent="#9333ea">
              <InfoRow label="Loan Amount"          value={fmtAED(lead.propertyDetails?.loanAmountRequired)} />
              <InfoRow label="Tenure"               value={lead.loanRequirements?.preferredTenureYears ? `${lead.loanRequirements.preferredTenureYears} Years` : null} />
              <InfoRow label="Rate Type"            value={lead.loanRequirements?.preferredInterestRateType} />
              <InfoRow label="Preferred Banks"      value={lead.loanRequirements?.preferredBanks?.join(', ')} />
              <InfoRow label="Special Requirements" value={lead.loanRequirements?.specialRequirements} />
              <InfoRow label="Referral Type"        value={lead.referralType} />
              <InfoRow label="Notes to Xoto"        value={lead.notesToXoto} last />
            </Panel>
          </div>

          {showDocs && <DocumentsList leadId={lead._id || leadId} />}
        </>
      )}
    </div>
  );
};

export default VaultLeadDetail;