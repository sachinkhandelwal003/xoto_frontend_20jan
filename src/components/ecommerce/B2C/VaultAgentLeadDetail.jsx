import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../../manageApi/utils/custom.apiservice';
import { Button, message, Progress, Spin, Modal, Input } from 'antd';
import {
  ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined,
  UserOutlined, HomeOutlined, DollarOutlined, FileTextOutlined,
  EyeOutlined, PhoneOutlined, MailOutlined, WhatsAppOutlined,
  FilePdfOutlined, FileImageOutlined, EnvironmentOutlined,
  CheckOutlined, StopOutlined, EditOutlined,
} from '@ant-design/icons';

const fmt     = (n) => (n ? Number(n).toLocaleString('en-AE') : '—');
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const isPdf   = (url) => url?.toLowerCase()?.includes('.pdf');
const PRIMARY = '#5c039c';

const STATUS_OPTIONS = ['New', 'Contacted', 'Qualified', 'Collecting Documentation', 'Disbursed'];

const STATUS_CONFIG = {
  'New':                    { color: '#6b7280', bg: '#f3f4f6', border: '#d1d5db' },
  'Contacted':              { color: '#3b82f6', bg: '#eff6ff', border: '#93c5fd' },
  'Qualified':              { color: '#8b5cf6', bg: '#f5f3ff', border: '#c4b5fd' },
  'Collecting Documentation': { color: '#f59e0b', bg: '#fffbeb', border: '#fcd34d' },
  'Disbursed':              { color: '#10b981', bg: '#ecfdf5', border: '#6ee7b7' },
};

/* ── SectionCard ── */
const SectionCard = ({ icon, title, children, extra }) => (
  <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f3f4f6', background: '#fafafa' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 32, height: 32, borderRadius: 8, background: PRIMARY, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16 }}>{icon}</span>
        <span style={{ fontWeight: 600, fontSize: 15, color: '#1f2937' }}>{title}</span>
      </div>
      {extra}
    </div>
    <div style={{ padding: '20px' }}>{children}</div>
  </div>
);

/* ── InfoRow ── */
const InfoRow = ({ label, value, icon }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
    {icon && <span style={{ color: '#6b7280', fontSize: 15 }}>{icon}</span>}
    <span style={{ color: '#4b5563', minWidth: 120, fontSize: 14 }}>{label}</span>
    <span style={{ color: '#111827', fontWeight: 500, flex: 1, textAlign: 'right', fontSize: 14 }}>{value || '—'}</span>
  </div>
);

/* ── StatBox ── */
const StatBox = ({ label, value, color }) => (
  <div style={{ textAlign: 'center', padding: '14px 10px', borderRadius: 10, background: '#f9fafb', border: '1px solid #e5e7eb', flex: 1 }}>
    <div style={{ fontSize: 26, fontWeight: 700, color }}>{value}</div>
    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{label}</div>
  </div>
);

/* ── DocCard ── */
const DocCard = ({ doc, onView }) => {
  const fileUrl    = doc.fileUrl || doc.url || doc.documentUrl || doc.file_url;
  const fileName   = doc.fileName || doc.file_name || doc.name || 'Unnamed Document';
  const docType    = doc.documentType || doc.document_type || doc.type;
  const status     = doc.status || doc.verification_status;
  const uploadedAt = doc.uploadedAt || doc.created_at || doc.createdAt;
  const statusColor = status === 'Verified' ? '#10b981' : status === 'Rejected' ? '#ef4444' : '#f59e0b';

  return (
    <div style={{
      background: '#fff',
      border: `1px solid ${status === 'Verified' ? '#6ee7b7' : status === 'Rejected' ? '#fca5a5' : '#e5e7eb'}`,
      borderRadius: 12, padding: 16,
      display: 'flex', flexDirection: 'column', gap: 12, height: '100%',
    }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: 10, flexShrink: 0, background: isPdf(fileUrl) ? '#fef2f2' : '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: isPdf(fileUrl) ? '#ef4444' : PRIMARY }}>
          {isPdf(fileUrl) ? <FilePdfOutlined /> : <FileImageOutlined />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#1f2937', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{fileName}</div>
          {docType && <div style={{ fontSize: 12, color: PRIMARY, marginTop: 4 }}>{docType}</div>}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {status && (
          <span style={{ fontSize: 12, fontWeight: 600, color: statusColor, background: statusColor === '#10b981' ? '#ecfdf5' : statusColor === '#ef4444' ? '#fef2f2' : '#fffbeb', padding: '3px 10px', borderRadius: 20 }}>
            {status}
          </span>
        )}
        {uploadedAt && <span style={{ fontSize: 12, color: '#6b7280' }}>{fmtDate(uploadedAt)}</span>}
      </div>
      {status === 'Rejected' && doc.rejectionReason && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#dc2626' }}>
          <strong>Reason:</strong> {doc.rejectionReason}
        </div>
      )}
      <button
        onClick={() => onView(doc)}
        disabled={!fileUrl}
        style={{
          marginTop: 'auto', width: '100%', padding: '10px 0',
          background: fileUrl ? PRIMARY : '#e5e7eb',
          color: fileUrl ? '#fff' : '#9ca3af',
          border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14,
          cursor: fileUrl ? 'pointer' : 'not-allowed',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}
      >
        <EyeOutlined /> View Document
      </button>
    </div>
  );
};

/* ── Main ── */
const VaultAgentLeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lead, setLead]           = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [docsLoading, setDocsLoading] = useState(false);

  // Status update
  const [leadStatus, setLeadStatus]       = useState('');
  const [statusNote, setStatusNote]       = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Preview modal
  const [selectedDoc, setSelectedDoc]   = useState(null);
  const [modalOpen, setModalOpen]       = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Action states inside modal
  const [verifying, setVerifying]       = useState(false);
  const [rejecting, setRejecting]       = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [qualityScore, setQualityScore] = useState(95);

  const [docStatusOverrides, setDocStatusOverrides] = useState({});

  const fetchLead = async () => {
    try {
      setLoading(true);
      const res = await apiService.get(`/vault/lead/admin/${id}`);
      const data = res?.data?.data || res?.data || null;
      setLead(data);
          const status = data?.currentStatus || data?.status;

      // Lead ka current status set karo
      if (data?.status) setLeadStatus(data.status);
    } catch { message.error('Failed to load lead details.'); }
    finally { setLoading(false); }
  };

  const fetchDocs = async () => {
    try {
      setDocsLoading(true);
      const res = await apiService.get(`/vault/lead/documents/${id}`);
      const raw = res?.data;
      const docs = Array.isArray(raw) ? raw
        : Array.isArray(raw?.data) ? raw.data
        : Array.isArray(raw?.documents) ? raw.documents
        : Array.isArray(raw?.data?.documents) ? raw.data.documents : [];
      setDocuments(docs);
      setSelectedDoc(prev => {
  if (!prev) return prev;
  const docId = prev._id || prev.id;
  const updated = docs.find(d => (d._id || d.id) === docId);
  if (!updated) return prev;
  
  // ✅ Agar prev mein already Verified/Rejected hai toh server se overwrite mat karo
  const prevStatus = prev.status || prev.verification_status;
  const serverStatus = updated.status || updated.verification_status;
  const finalStatus = (prevStatus === 'Verified' || prevStatus === 'Rejected') 
    ? prevStatus 
    : serverStatus;

  return { 
    ...updated, 
    fileUrl: prev.fileUrl,
    status: finalStatus,
    verification_status: finalStatus,
  };
});
    } catch (err) { console.error(err); }
    finally { setDocsLoading(false); }
  };

  useEffect(() => { if (id) { fetchLead(); fetchDocs(); } }, [id]);

  // ── Status Update Handler ──
  const handleStatusUpdate = async () => {
    if (!leadStatus) { message.warning('Please select a status'); return; }
    try {
      setStatusUpdating(true);
      await apiService.put(`/vault/lead/admin/${id}/status`, {
        status: leadStatus,
        notes: statusNote.trim() || undefined,
      });
      message.success(`Status updated to "${leadStatus}"`);
      setStatusNote('');
      await fetchLead();
    } catch (err) {
      message.error(err?.response?.data?.message || 'Status update failed');
    } finally { setStatusUpdating(false); }
  };

const openModal = (doc) => {
  const fileUrl = doc.fileUrl || doc.url || doc.documentUrl || doc.file_url;
  if (!fileUrl) { message.warning('File URL not available'); return; }
  const docId = doc._id || doc.id;
  const freshDoc = documents.find(d => (d._id || d.id) === docId) || doc;
  
  // ✅ Agar pehle verify/reject hua hai toh override lagao
  const override = docStatusOverrides[docId];
  setSelectedDoc({ ...freshDoc, fileUrl, ...(override || {}) });
  
  setModalOpen(true);
  setModalLoading(true);
  setShowRejectInput(false);
  setRejectReason('');
  setQualityScore(95);
}; 

  const closeModal = () => {
    setModalOpen(false);
    setSelectedDoc(null);
    setShowRejectInput(false);
    setRejectReason('');
  };

 const handleVerify = async () => {
  const docId = selectedDoc?._id || selectedDoc?.id;
  if (!docId) { message.warning('Document ID not found'); return; }
  try {
    setVerifying(true);
    await apiService.post(`/vault/lead/documents/${docId}/verify`, { qualityScore });
    message.success('Document verified!');
    // ✅ Override save karo
    setDocStatusOverrides(prev => ({ ...prev, [docId]: { status: 'Verified', verification_status: 'Verified' } }));
    setSelectedDoc(prev => ({ ...prev, status: 'Verified', verification_status: 'Verified' }));
    await fetchDocs();
  } catch (err) {
    message.error(err?.response?.data?.message || 'Verification failed');
  } finally { setVerifying(false); }
};

const handleReject = async () => {
  if (!rejectReason.trim()) { message.warning('Please enter a rejection reason'); return; }
  const docId = selectedDoc?._id || selectedDoc?.id;
  if (!docId) { message.warning('Document ID not found'); return; }
  try {
    setRejecting(true);
    await apiService.post(`/vault/lead/documents/${docId}/reject`, { reason: rejectReason });
    message.success('Document rejected.');
    // ✅ Override save karo
    setDocStatusOverrides(prev => ({ ...prev, [docId]: { status: 'Rejected', verification_status: 'Rejected', rejectionReason: rejectReason } }));
    setSelectedDoc(prev => ({ ...prev, status: 'Rejected', verification_status: 'Rejected', rejectionReason: rejectReason }));
    setShowRejectInput(false);
    await fetchDocs();
  } catch (err) {
    message.error(err?.response?.data?.message || 'Rejection failed');
  } finally { setRejecting(false); }
};

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <Spin size="large" />
    </div>
  );

  if (!lead) return (
    <div style={{ padding: 60, textAlign: 'center' }}>
      <h2>Lead not found</h2>
      <Button type="primary" onClick={() => navigate(-1)} style={{ background: PRIMARY, borderColor: PRIMARY }}>Go Back</Button>
    </div>
  );

  const ci = lead.customerInfo || {};
  const pd = lead.propertyDetails || {};
  const dc = lead.documentCollection || {};
  const propertyAddress = [pd.propertyAddress?.building, pd.propertyAddress?.area, pd.propertyAddress?.city].filter(Boolean).join(', ');
  const docStatus = selectedDoc?.status || selectedDoc?.verification_status;
  const savedStatus    = lead?.currentStatus || lead?.status;
const savedStatusCfg = STATUS_CONFIG[savedStatus] || STATUS_CONFIG['New'];



  return (
    <>
      <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '32px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 24, background: '#fff', borderColor: '#d1d5db' }}>
            Back to Vault Leads
          </Button>

          {/* Client & Loan */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20, marginBottom: 24 }}>
            <SectionCard icon={<UserOutlined />} title="Client Information">
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1f2937' }}>{ci.fullName || '—'}</div>
                {ci.preferredName && <div style={{ color: '#6b7280', marginTop: 4 }}>"{ci.preferredName}"</div>}
              </div>
              <InfoRow icon={<MailOutlined />}      label="Email"          value={ci.email} />
              <InfoRow icon={<PhoneOutlined />}     label="Mobile"         value={ci.mobileNumber} />
              {ci.whatsappNumber && <InfoRow icon={<WhatsAppOutlined />} label="WhatsApp" value={ci.whatsappNumber} />}
              <InfoRow icon={<DollarOutlined />}    label="Monthly Salary" value={ci.monthlySalary ? `AED ${fmt(ci.monthlySalary)}` : null} />
              <InfoRow                              label="Nationality"    value={ci.nationality} />
              {ci.maritalStatus && <InfoRow         label="Marital Status" value={ci.maritalStatus} />}
            </SectionCard>

            <SectionCard icon={<DollarOutlined />} title="Loan Summary">
              <InfoRow label="Loan Amount"    value={`AED ${fmt(pd.loanAmountRequired || lead.loanAmount)}`} />
              <InfoRow label="Property Value" value={`AED ${fmt(pd.propertyValue)}`} />
              <InfoRow label="Down Payment"   value={`AED ${fmt(pd.downPaymentAmount)}`} />
            </SectionCard>
          </div>

          {/* ── Lead Status Update ── */}
          <div style={{ marginBottom: 24 }}>
            <SectionCard
              icon={<EditOutlined />}
              title="Lead Status"
              extra={
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  color: savedStatusCfg .color,
                  background: savedStatusCfg.bg,
                  border: `1px solid ${savedStatusCfg.border}`,
                  padding: '4px 12px', borderRadius: 20,
                }}>
                  {leadStatus || 'Not Set'}
                </span>
              }
            >
              {/* Status buttons */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                {STATUS_OPTIONS.map(opt => {
                  const cfg = STATUS_CONFIG[opt];
                  const isActive = leadStatus === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => setLeadStatus(opt)}
                      style={{
                        padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        border: `1.5px solid ${isActive ? cfg.color : '#e5e7eb'}`,
                        background: isActive ? cfg.bg : '#fff',
                        color: isActive ? cfg.color : '#6b7280',
                        transition: 'all 0.15s',
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
{savedStatus && (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 14px', borderRadius: 8,
    background: savedStatusCfg.bg,
    border: `1px solid ${savedStatusCfg.border}`,
    marginBottom: 16,
  }}>
    <div style={{ width: 10, height: 10, borderRadius: '50%', background: savedStatusCfg.color, flexShrink: 0 }} />
    <span style={{ fontSize: 13, color: '#6b7280' }}>Current Status:</span>
    <span style={{ fontSize: 13, fontWeight: 700, color: savedStatusCfg.color }}>
      {savedStatus}
    </span>
  </div>
)}

            {/* Notes + Update button — stacked */}
<div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
  <Input.TextArea
    placeholder="Add a note (optional)..."
    value={statusNote}
    onChange={e => setStatusNote(e.target.value)}
    rows={2}
    style={{ width: '100%', resize: 'none', fontSize: 14 }}
  />
  <button
    onClick={handleStatusUpdate}
    disabled={statusUpdating || !leadStatus}
    style={{
      width: '100%', padding: '10px 0', borderRadius: 8, border: 'none',
      fontWeight: 700, fontSize: 14,
      background: statusUpdating || !leadStatus ? '#e5e7eb' : PRIMARY,
      color: statusUpdating || !leadStatus ? '#9ca3af' : '#fff',
      cursor: statusUpdating || !leadStatus ? 'not-allowed' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    }}
  >
    {statusUpdating ? <Spin size="small" /> : 'Update Status'}
  </button>
</div>
            </SectionCard>
          </div>

          {/* Property */}
          {(propertyAddress || pd.propertyType) && (
            <div style={{ marginBottom: 24 }}>
              <SectionCard icon={<HomeOutlined />} title="Property Details">
                <InfoRow icon={<EnvironmentOutlined style={{ color: '#6b7280' }} />} label="Address" value={propertyAddress} />
                {pd.propertyType    && <InfoRow label="Property Type"    value={pd.propertyType} />}
                {pd.completionDate  && <InfoRow label="Completion Date"  value={fmtDate(pd.completionDate)} />}
              </SectionCard>
            </div>
          )}

          {/* Documents */}
          <div style={{ marginBottom: 24 }}>
            <SectionCard icon={<FileTextOutlined />} title="Document Collection" extra={docsLoading && <Spin size="small" />}>
              <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
                <StatBox label="Uploaded" value={dc.documentsUploaded ?? documents.length ?? 0}                                                                                    color={PRIMARY}   />
                <StatBox label="Verified" value={dc.documentsVerified ?? documents.filter(d => (d.status || d.verification_status) === 'Verified').length}                        color="#10b981"   />
                <StatBox label="Pending"  value={dc.documentsPending  ?? documents.filter(d => { const s = d.status || d.verification_status; return !s || s === 'Pending'; }).length} color="#f59e0b" />
                <StatBox label="Rejected" value={dc.documentsRejected ?? documents.filter(d => (d.status || d.verification_status) === 'Rejected').length}                        color="#ef4444"   />
              </div>

              {dc.collectionPercentage !== undefined && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 14, color: '#4b5563' }}>Collection Progress</span>
                    <span style={{ fontWeight: 600, color: PRIMARY }}>{dc.collectionPercentage}%</span>
                  </div>
                  <Progress percent={dc.collectionPercentage} strokeColor={PRIMARY} />
                </div>
              )}

              {dc.readyForSubmission && (
                <div style={{ color: '#10b981', fontWeight: 600, marginBottom: 20 }}>
                  <CheckCircleOutlined /> Ready for Submission
                </div>
              )}

              <div style={{ marginBottom: 16, fontWeight: 600, color: '#374151' }}>
                Available Documents ({documents.length})
              </div>

              {docsLoading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}><Spin size="large" /></div>
              ) : documents.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                  {documents.map((doc, i) => (
                    <DocCard key={doc._id || i} doc={doc} onView={openModal} />
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>No documents uploaded yet.</div>
              )}
            </SectionCard>
          </div>

          {lead.notesToXoto && (
            <SectionCard icon={<FileTextOutlined />} title="Notes from Agent">
              <p style={{ color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{lead.notesToXoto}</p>
            </SectionCard>
          )}
        </div>
      </div>

      {/* ── Document Preview Modal ── */}
      <Modal
        open={modalOpen}
        onCancel={closeModal}
        footer={null}
        width={1050}
        centered
        destroyOnClose
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 40 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>
                {selectedDoc?.fileName || selectedDoc?.file_name || 'Document Preview'}
              </div>
              {selectedDoc?.documentType && (
                <div style={{ fontSize: 12, color: PRIMARY, marginTop: 2 }}>{selectedDoc.documentType}</div>
              )}
            </div>
            {docStatus && (() => {
              const cfg = { Verified: { color: '#10b981', bg: '#ecfdf5' }, Rejected: { color: '#ef4444', bg: '#fef2f2' }, Pending: { color: '#f59e0b', bg: '#fffbeb' } };
              const c = cfg[docStatus] || { color: '#6b7280', bg: '#f3f4f6' };
              return <span style={{ fontSize: 12, fontWeight: 700, color: c.color, background: c.bg, padding: '4px 12px', borderRadius: 20 }}>{docStatus}</span>;
            })()}
          </div>
        }
      >
        <div style={{ minHeight: 560, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', borderRadius: 8, overflow: 'hidden' }}>
          {modalLoading && <Spin size="large" style={{ position: 'absolute', zIndex: 2 }} />}
          {selectedDoc && (
            isPdf(selectedDoc.fileUrl)
              ? <iframe src={selectedDoc.fileUrl} style={{ width: '100%', height: 560, border: 'none', display: 'block' }} onLoad={() => setModalLoading(false)} title="pdf-preview" />
              : <img src={selectedDoc.fileUrl} alt="preview" style={{ maxHeight: 560, maxWidth: '100%', objectFit: 'contain' }} onLoad={() => setModalLoading(false)} />
          )}
        </div>

        <div style={{ marginTop: 16, padding: '16px 0 4px', borderTop: '1px solid #f3f4f6' }}>
          {docStatus === 'Verified' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontWeight: 600 }}>
              <CheckCircleOutlined /> Document is already Verified
            </div>
          )}
          {docStatus === 'Rejected' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', fontWeight: 600 }}>
              <CloseCircleOutlined /> Document is Rejected
              {selectedDoc?.rejectionReason && <span style={{ fontWeight: 400, color: '#6b7280', fontSize: 13 }}>— {selectedDoc.rejectionReason}</span>}
            </div>
          )}
          {docStatus !== 'Verified' && docStatus !== 'Rejected' && !showRejectInput && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 14px' }}>
                <span style={{ fontSize: 13, color: '#374151', fontWeight: 500, whiteSpace: 'nowrap' }}>Quality Score</span>
                <input
                  type="number" min={0} max={100} value={qualityScore}
                  onChange={e => setQualityScore(Math.min(100, Math.max(0, Number(e.target.value))))}
                  style={{ width: 60, padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, fontWeight: 700, color: PRIMARY, textAlign: 'center', outline: 'none' }}
                />
                <span style={{ fontSize: 12, color: '#6b7280' }}>/100</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                <button onClick={() => setShowRejectInput(true)} style={{ padding: '9px 20px', borderRadius: 8, border: '1.5px solid #fca5a5', background: '#fef2f2', color: '#ef4444', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <StopOutlined /> Reject
                </button>
                <button onClick={handleVerify} disabled={verifying} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: verifying ? '#e5e7eb' : '#10b981', color: verifying ? '#9ca3af' : '#fff', fontWeight: 700, fontSize: 13, cursor: verifying ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {verifying ? <Spin size="small" /> : <><CheckOutlined /> Verify</>}
                </button>
              </div>
            </div>
          )}
          {showRejectInput && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Input placeholder="Enter rejection reason..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} onPressEnter={handleReject} style={{ flex: 1 }} autoFocus />
              <button onClick={handleReject} disabled={rejecting || !rejectReason.trim()} style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: rejecting || !rejectReason.trim() ? '#e5e7eb' : '#ef4444', color: rejecting || !rejectReason.trim() ? '#9ca3af' : '#fff', fontWeight: 700, fontSize: 13, cursor: rejecting || !rejectReason.trim() ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
                {rejecting ? <Spin size="small" /> : 'Confirm Reject'}
              </button>
              <button onClick={() => { setShowRejectInput(false); setRejectReason(''); }} style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default VaultAgentLeadDetail;