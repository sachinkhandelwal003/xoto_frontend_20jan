import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../../manageApi/utils/custom.apiservice';
import {
  Button, Tag, message, Progress, Spin, Modal
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  UserOutlined,
  HomeOutlined,
  DollarOutlined,
  FileTextOutlined,
  EyeOutlined,
  PhoneOutlined,
  MailOutlined,
  WhatsAppOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';

/* ─── Helpers ─────────────────────────────────────────── */
const fmt = (n) => (n ? Number(n).toLocaleString('en-AE') : '—');
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';
const isPdf = (url) => url?.toLowerCase()?.includes('.pdf');

const PRIMARY_COLOR = '#5c039c';

/* ─── Sub-components ──────────────────────────────────── */

const SectionCard = ({ icon, title, children, extra }) => (
  <div style={{
    background: '#fff',
    borderRadius: 12,
    border: '1px solid #e5e7eb',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    overflow: 'hidden',
  }}>
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 20px',
      borderBottom: '1px solid #f3f4f6',
      background: '#fafafa',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          width: 32, height: 32, borderRadius: 8,
          background: PRIMARY_COLOR,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 16,
        }}>{icon}</span>
        <span style={{ fontWeight: 600, fontSize: 15, color: '#1f2937' }}>
          {title}
        </span>
      </div>
      {extra}
    </div>
    <div style={{ padding: '20px' }}>{children}</div>
  </div>
);

const InfoRow = ({ label, value, icon }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 0',
    borderBottom: '1px solid #f3f4f6',
  }}>
    {icon && <span style={{ color: '#6b7280', fontSize: 15 }}>{icon}</span>}
    <span style={{ color: '#4b5563', minWidth: 120, fontSize: 14 }}>{label}</span>
    <span style={{ color: '#111827', fontWeight: 500, flex: 1, textAlign: 'right', fontSize: 14 }}>
      {value || '—'}
    </span>
  </div>
);

const StatBox = ({ label, value, color }) => (
  <div style={{
    textAlign: 'center',
    padding: '14px 10px',
    borderRadius: 10,
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    flex: 1,
  }}>
    <div style={{ fontSize: 26, fontWeight: 700, color }}>
      {value}
    </div>
    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
      {label}
    </div>
  </div>
);

/* ─── Document Card ───────────────────────────────────── */
const DocCard = ({ doc, onView }) => {
  const fileUrl = doc.fileUrl || doc.url || doc.documentUrl || doc.file_url;
  const fileName = doc.fileName || doc.file_name || doc.name || 'Unnamed Document';
  const docType = doc.documentType || doc.document_type || doc.type;
  const status = doc.status || doc.verification_status;
  const uploadedAt = doc.uploadedAt || doc.created_at || doc.createdAt;

  const statusColor = status === 'Verified' ? '#10b981' : status === 'Rejected' ? '#ef4444' : '#f59e0b';

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: 12,
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      height: '100%',
    }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 10, flexShrink: 0,
          background: isPdf(fileUrl) ? '#fef2f2' : '#f3e8ff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, color: isPdf(fileUrl) ? '#ef4444' : PRIMARY_COLOR,
        }}>
          {isPdf(fileUrl) ? <FilePdfOutlined /> : <FileImageOutlined />}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 600, fontSize: 14, color: '#1f2937',
            lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {fileName}
          </div>
          {docType && (
            <div style={{ fontSize: 12, color: PRIMARY_COLOR, marginTop: 4 }}>
              {docType}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {status && (
          <span style={{
            fontSize: 12, fontWeight: 600, color: statusColor,
            background: statusColor === '#10b981' ? '#ecfdf5' : statusColor === '#ef4444' ? '#fef2f2' : '#fffbeb',
            padding: '3px 10px', borderRadius: 20,
          }}>
            {status}
          </span>
        )}
        {uploadedAt && (
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            {fmtDate(uploadedAt)}
          </span>
        )}
      </div>

      <button
        onClick={() => onView(doc)}
        disabled={!fileUrl}
        style={{
          marginTop: 'auto',
          width: '100%',
          padding: '10px 0',
          background: fileUrl ? PRIMARY_COLOR : '#e5e7eb',
          color: fileUrl ? '#fff' : '#9ca3af',
          border: 'none',
          borderRadius: 8,
          fontWeight: 600,
          fontSize: 14,
          cursor: fileUrl ? 'pointer' : 'not-allowed',
        }}
      >
        <EyeOutlined style={{ marginRight: 6 }} /> View Document
      </button>
    </div>
  );
};

/* ─── Main Component ──────────────────────────────────── */
const VaultAgentLeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lead, setLead] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [docsLoading, setDocsLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  /* Fetch Lead */
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const res = await apiService.get(`/vault/lead/admin/${id}`);
        setLead(res?.data?.data || res?.data || null);
      } catch {
        message.error('Failed to load lead details.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  /* Fetch Documents */
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setDocsLoading(true);
        const res = await apiService.get(`/vault/lead/documents/${id}`);
        const raw = res?.data;
        const docs = Array.isArray(raw) ? raw
          : Array.isArray(raw?.data) ? raw.data
          : Array.isArray(raw?.documents) ? raw.documents
          : Array.isArray(raw?.data?.documents) ? raw.data.documents
          : [];
        setDocuments(docs);
      } catch (err) {
        console.error('Failed to fetch documents:', err);
      } finally {
        setDocsLoading(false);
      }
    })();
  }, [id]);

  const openDocumentModal = (doc) => {
    const fileUrl = doc.fileUrl || doc.url || doc.documentUrl || doc.file_url;
    if (!fileUrl) {
      message.warning('File URL not available');
      return;
    }
    setSelectedDocument({ ...doc, fileUrl });
    setIsModalOpen(true);
    setModalLoading(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDocument(null);
    setModalLoading(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <h2>Lead not found</h2>
        <Button type="primary" onClick={() => navigate(-1)} style={{ background: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}>
          Go Back
        </Button>
      </div>
    );
  }

  const ci = lead.customerInfo || {};
  const pd = lead.propertyDetails || {};
  const dc = lead.documentCollection || {};
  const si = lead.sourceInfo || {};

  const propertyAddress = [
    pd.propertyAddress?.building,
    pd.propertyAddress?.area,
    pd.propertyAddress?.city,
  ].filter(Boolean).join(', ');

  return (
    <>
      <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '32px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* Back Button */}
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            style={{ marginBottom: 24, background: '#fff', borderColor: '#d1d5db' }}
          >
            Back to Vault Leads
          </Button>

          {/* Client & Loan Info */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20, marginBottom: 24 }}>
            <SectionCard icon={<UserOutlined />} title="Client Information">
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1f2937' }}>
                  {ci.fullName || '—'}
                </div>
                {ci.preferredName && <div style={{ color: '#6b7280', marginTop: 4 }}>"{ci.preferredName}"</div>}
              </div>
              <InfoRow icon={<MailOutlined />} label="Email" value={ci.email} />
              <InfoRow icon={<PhoneOutlined />} label="Mobile" value={ci.mobileNumber} />
              {ci.whatsappNumber && <InfoRow icon={<WhatsAppOutlined />} label="WhatsApp" value={ci.whatsappNumber} />}
              <InfoRow icon={<DollarOutlined />} label="Monthly Salary" value={ci.monthlySalary ? `AED ${fmt(ci.monthlySalary)}` : null} />
              <InfoRow label="Nationality" value={ci.nationality} />
              {ci.maritalStatus && <InfoRow label="Marital Status" value={ci.maritalStatus} />}
            </SectionCard>

            <SectionCard icon={<DollarOutlined />} title="Loan Summary">
              <InfoRow label="Loan Amount" value={`AED ${fmt(pd.loanAmountRequired || lead.loanAmount)}`} />
              <InfoRow label="Property Value" value={`AED ${fmt(pd.propertyValue)}`} />
              <InfoRow label="Down Payment" value={`AED ${fmt(pd.downPaymentAmount)}`} />
            </SectionCard>
          </div>

          {/* Property Details */}
          {(propertyAddress || pd.propertyType) && (
            <div style={{ marginBottom: 24 }}>
              <SectionCard icon={<HomeOutlined />} title="Property Details">
                <InfoRow icon={<EnvironmentOutlined style={{color: '#6b7280'}} />} label="Address" value={propertyAddress} />
                {pd.propertyType && <InfoRow label="Property Type" value={pd.propertyType} />}
                {pd.completionDate && <InfoRow label="Completion Date" value={fmtDate(pd.completionDate)} />}
              </SectionCard>
            </div>
          )}

          {/* Document Collection */}
          <div style={{ marginBottom: 24 }}>
            <SectionCard
              icon={<FileTextOutlined />}
              title="Document Collection"
              extra={docsLoading && <Spin size="small" />}
            >
              <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
                <StatBox label="Uploaded" value={dc.documentsUploaded ?? documents.length ?? 0} color={PRIMARY_COLOR} />
                <StatBox label="Verified" value={dc.documentsVerified ?? 0} color="#10b981" />
                <StatBox label="Pending" value={dc.documentsPending ?? 0} color="#f59e0b" />
                <StatBox label="Rejected" value={dc.documentsRejected ?? 0} color="#ef4444" />
              </div>

              {dc.collectionPercentage !== undefined && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 14, color: '#4b5563' }}>Collection Progress</span>
                    <span style={{ fontWeight: 600, color: PRIMARY_COLOR }}>
                      {dc.collectionPercentage}%
                    </span>
                  </div>
                  <Progress percent={dc.collectionPercentage} strokeColor={PRIMARY_COLOR} />
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
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Spin size="large" />
                </div>
              ) : documents.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: 16,
                }}>
                  {documents.map((doc, index) => (
                    <DocCard key={doc._id || index} doc={doc} onView={openDocumentModal} />
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
                  No documents uploaded yet.
                </div>
              )}
            </SectionCard>
          </div>

          {/* Notes */}
          {lead.notesToXoto && (
            <SectionCard icon={<FileTextOutlined />} title="Notes from Agent">
              <p style={{ color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                {lead.notesToXoto}
              </p>
            </SectionCard>
          )}

        </div>
      </div>

      {/* Document Preview Modal */}
      <Modal
        title="Document Preview"
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        width={1050}
        centered
        destroyOnClose
      >
        <div style={{ minHeight: 620, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {modalLoading && <Spin size="large" style={{ position: 'absolute' }} />}

          {selectedDocument && (
            isPdf(selectedDocument.fileUrl) ? (
              <iframe
                src={selectedDocument.fileUrl}
                style={{ width: '100%', height: 620, border: 'none' }}
                onLoad={() => setModalLoading(false)}
              />
            ) : (
              <img
                src={selectedDocument.fileUrl}
                alt="preview"
                style={{ maxHeight: 620, maxWidth: '100%', objectFit: 'contain' }}
                onLoad={() => setModalLoading(false)}
              />
            )
          )}
        </div>
      </Modal>
    </>
  );
};

export default VaultAgentLeadDetail;