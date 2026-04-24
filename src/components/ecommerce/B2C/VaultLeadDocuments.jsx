import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiService } from '../../../manageApi/utils/custom.apiservice';
import { message } from 'antd';
import {
  ArrowLeft, Upload, CheckCircle2,
  Loader2, FileText, X, RefreshCw,
  ShieldCheck, ShieldAlert,
} from 'lucide-react';

/* ── Fonts ──────────────────────────────────────────────────── */
const FontInjector = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
    .ld-root, .ld-root * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
    .ld-back:hover       { background: #eff6ff !important; color: #2563eb !important; border-color: #bfdbfe !important; }
    .ld-drop:hover, .ld-drop.over { border-color: #2563eb !important; background: #eff6ff !important; }
    .ld-remove:hover     { color: #ef4444 !important; background: #fef2f2 !important; border-color: #fecaca !important; }
    .ld-upload-btn:not(:disabled):hover { background: #1d4ed8 !important; }
    @keyframes ld-spin { to { transform: rotate(360deg); } }
    @keyframes ld-fade { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
    .ld-card { animation: ld-fade 0.2s ease both; }
  `}</style>
);

/* ── Shared styles ────────────────────────────────────────────── */
const badgeBase = {
  fontSize: 10.5,
  fontWeight: 700,
  padding: '2px 7px',
  borderRadius: 999,
  whiteSpace: 'nowrap',
  flexShrink: 0,
  border: '1px solid transparent',
};

/* ── Document Schema ───────────────────────────────────────── */
const DOC_SCHEMA = {
  identity: {
    label: 'Identity Documents',
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
    docs: [
      { type: 'emirates_id_front', label: 'Emirates ID — Front', required: true  },
      { type: 'emirates_id_back',  label: 'Emirates ID — Back',  required: true  },
      { type: 'passport',          label: 'Passport',            required: true  },
      { type: 'visa',              label: 'UAE Visa',            required: false },
    ],
  },
  financial: {
    label: 'Financial Documents',
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    docs: [
      { type: 'bank_statements',    label: 'Bank Statements (6 months)', required: true  },
      { type: 'salary_certificate', label: 'Salary Certificate',         required: true  },
      { type: 'payslips',           label: 'Payslips (6 months)',         required: false },
    ],
  },
};

const fmtSize   = (b) => b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / (1024 * 1024)).toFixed(2)} MB`;
const fmtSizeMb = (b) => parseFloat((b / (1024 * 1024)).toFixed(3));

/* ── Single Document Card ───────────────────────────────────── */
const DocCard = ({
  doc,
  category,
  categoryMeta,
  leadId,
  existingDoc,
  onUploadSuccess,
  role,
}) => {
  const fileRef = useRef(null);
  const [file, setFile]         = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [errMsg, setErrMsg]     = useState('');

  const [status, setStatus] = useState(existingDoc ? 'success' : 'idle');
  const uploadedFileName = existingDoc?.fileName || existingDoc?.originalName || '';

  // Upload mutation
  const { mutate: upload, isLoading: uploading } = useMutation({
    mutationFn: async (f) => {
      const form = new FormData();
      form.append('file', f);
      form.append('entityType', 'Lead');
      form.append('entityId', leadId);

      const uploadRes = await apiService.post('/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const fileUrl = uploadRes?.url || uploadRes?.file?.url;

      return apiService.post(`/vault/lead/documents/${leadId}`, {
        entityType:       'Lead',
        entityId:         leadId,
        documentType:     doc.type,
        documentCategory: category,
        fileUrl,
        fileName:         f.name,
        fileSizeMb:       fmtSizeMb(f.size),
        mimeType:         f.type,
      });
    },
    onSuccess: () => {
      setStatus('success');
      onUploadSuccess?.();
    },
    onError: (e) => {
      setStatus('error');
      setErrMsg(e?.response?.data?.message || 'Upload failed. Please try again.');
    },
  });

  // Verify mutation
  const documentId = existingDoc?._id || existingDoc?.documentId;
  const [verifyStatus, setVerifyStatus] = useState(
    existingDoc ? (existingDoc.isVerified ? 'verified' : 'unverified') : null
  );

  const { mutate: verifyDoc, isLoading: verifying } = useMutation({
    mutationFn: async ({ isVerified, qualityScore, reason }) => {
      const body = { isVerified };
      if (isVerified && qualityScore !== undefined) body.qualityScore = qualityScore;
      else if (!isVerified && reason) body.reason = reason;
      return apiService.put(`/vault/lead/documents/advisor/verify/${documentId}`, body);
    },
    onSuccess: (data, variables) => {
      setVerifyStatus(variables.isVerified ? 'verified' : 'unverified');
      onUploadSuccess?.();
    },
    onError: (e) => {
      message.error(e?.response?.data?.message || 'Verification failed');
    },
  });

  const showVerify = role === 26 && status === 'success' && documentId;

  const pick  = (f) => { if (f) { setFile(f); setStatus('idle'); setErrMsg(''); } };
  const clear = ()  => { setFile(null); setStatus('idle'); setErrMsg(''); };

  return (
    <div
      className="ld-card"
      style={{
        background: '#fff', borderRadius: 14, padding: '16px 18px',
        border: status === 'success' ? '1.5px solid #bbf7d0'
              : status === 'error'   ? '1.5px solid #fecaca'
              : '1px solid #e8edf5',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'border 0.2s',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: categoryMeta.bg, border: `1.5px solid ${categoryMeta.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FileText size={13} style={{ color: categoryMeta.color }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{doc.label}</p>
            <p style={{ margin: '1px 0 0', fontSize: 10.5, color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace" }}>{doc.type}</p>
          </div>
        </div>
        {doc.required ? (
          <span style={{ ...badgeBase, background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }}>Required</span>
        ) : (
          <span style={{ ...badgeBase, background: '#f8fafc', color: '#64748b', borderColor: '#e2e8f0' }}>Optional</span>
        )}
      </div>

      {/* Success + verification */}
      {status === 'success' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <CheckCircle2 size={15} style={{ color: '#16a34a', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: '#15803d' }}>Uploaded successfully</p>
              <p style={{ margin: '1px 0 0', fontSize: 11.5, color: '#4ade80', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {file?.name || uploadedFileName || 'Document on file'}
              </p>
            </div>
            <button onClick={clear} title="Replace file" style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid #bbf7d0', background: '#fff', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <RefreshCw size={11} />
            </button>
          </div>

          {showVerify && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              {verifyStatus === 'verified' ? (
                <span style={{ fontSize: 12, fontWeight: 600, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ShieldCheck size={14} /> Verified
                </span>
              ) : (
                <button
                  onClick={() => verifyDoc({ isVerified: true, qualityScore: 85 })}
                  disabled={verifying}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '4px 10px', borderRadius: 6, border: '1px solid #bbf7d0',
                    background: '#f0fdf4', color: '#16a34a', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.14s',
                  }}
                >
                  {verifying ? <Loader2 size={12} style={{ animation: 'ld-spin 0.8s linear infinite' }} /> : <ShieldCheck size={14} />}
                  Verify
                </button>
              )}
              {verifyStatus === 'unverified' && (
                <button
                  onClick={() => {
                    const reason = prompt('Rejection reason (e.g. blurry, missing info):');
                    if (reason) verifyDoc({ isVerified: false, reason });
                  }}
                  disabled={verifying}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '4px 10px', borderRadius: 6, border: '1px solid #fecaca',
                    background: '#fef2f2', color: '#dc2626', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <X size={13} /> Reject
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div style={{ padding: '9px 12px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', marginBottom: 10 }}>
          <p style={{ margin: 0, fontSize: 12, color: '#dc2626', fontWeight: 600 }}>{errMsg}</p>
        </div>
      )}

      {/* File preview (selected, not yet uploaded) */}
      {status !== 'success' && file && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: 10 }}>
          <FileText size={14} style={{ color: '#64748b', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
            <p style={{ margin: '1px 0 0', fontSize: 11, color: '#94a3b8' }}>{fmtSize(file.size)}</p>
          </div>
          <button className="ld-remove" onClick={clear} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.14s', flexShrink: 0 }}>
            <X size={11} />
          </button>
        </div>
      )}

      {/* Drop zone */}
      {status !== 'success' && !file && (
        <div
          className={`ld-drop ${dragOver ? 'over' : ''}`}
          style={{ border: '1.5px dashed #e2e8f0', borderRadius: 10, padding: '18px 12px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s' }}
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); pick(e.dataTransfer.files[0]); }}
        >
          <Upload size={16} style={{ color: '#94a3b8', marginBottom: 6 }} />
          <p style={{ margin: 0, fontSize: 12, color: '#64748b', fontWeight: 500 }}>Drop or <span style={{ color: '#2563eb', fontWeight: 700 }}>browse</span></p>
          <p style={{ margin: '3px 0 0', fontSize: 10.5, color: '#b0b8cc' }}>PDF · JPG · PNG · DOC — max 10 MB</p>
          <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" style={{ display: 'none' }} onChange={e => pick(e.target.files[0])} />
        </div>
      )}

      {/* Upload button */}
      {status !== 'success' && file && (
        <button className="ld-upload-btn" onClick={() => upload(file)} disabled={uploading}
          style={{
            width: '100%', padding: '9px', borderRadius: 9, border: 'none',
            background: uploading ? '#93c5fd' : '#2563eb', color: '#fff',
            fontSize: 13, fontWeight: 700, cursor: uploading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            transition: 'background 0.15s', marginTop: 4,
          }}>
          {uploading ? <><Loader2 size={14} style={{ animation: 'ld-spin 0.8s linear infinite' }} /> Uploading…</>
          : <><Upload size={14} /> Upload</>}
        </button>
      )}
    </div>
  );
};

/* ── Main Page ─────────────────────────────────────────────── */
const VaultLeadDocuments = () => {
  const { leadId } = useParams();
  const navigate   = useNavigate();

  // Replace with your actual auth role extraction
  const role = 26;

  const { data: leadData, isLoading: leadLoading } = useQuery({
    queryKey: ['leadDetail', leadId],
    queryFn:  () => apiService.get(`/vault/lead/${leadId}`),
    enabled:  !!leadId,
  });

  const { data: docsData, isLoading: docsLoading, refetch: refetchDocs } = useQuery({
    queryKey: ['leadDocuments', leadId],
    queryFn:  () => apiService.get(`/vault/lead/documents/${leadId}`),
    enabled:  !!leadId,
  });

  const lead         = leadData?.data || leadData;
  const existingDocs = docsData?.data?.documents || docsData?.data || docsData?.documents || [];
  const isLoading    = leadLoading || docsLoading;

  const allDocs = Object.values(DOC_SCHEMA).flatMap(c => c.docs);
  const reqDocs = allDocs.filter(d => d.required);
  const uploadedReqCount = reqDocs.filter(d =>
    existingDocs.some(e => e.documentType === d.type)
  ).length;

  return (
    <div className="ld-root" style={{ padding: '32px 36px', minHeight: '100vh', background: '#f4f7fb' }}>
      <FontInjector />

      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button className="ld-back" onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 14px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, color: '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <ArrowLeft size={15} /> Back
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>Upload Documents</h1>
            {lead && !leadLoading && (
              <p style={{ margin: '3px 0 0', fontSize: 13, color: '#64748b' }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: '#94a3b8' }}>{lead.leadId || leadId}</span>
                {lead.customerInfo?.fullName && <span style={{ marginLeft: 8, fontWeight: 600, color: '#334155' }}>· {lead.customerInfo.fullName}</span>}
              </p>
            )}
          </div>
        </div>

        {!isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: '#64748b' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
              {existingDocs.length} uploaded
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626', display: 'inline-block' }} />
              {reqDocs.length - uploadedReqCount} required remaining
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#94a3b8', display: 'inline-block' }} />
              {allDocs.length - reqDocs.length} optional
            </span>
          </div>
        )}
      </div>

      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 80, gap: 12 }}>
          <Loader2 size={28} style={{ color: '#2563eb', animation: 'ld-spin 0.8s linear infinite' }} />
          <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>Loading documents…</p>
        </div>
      )}

      {!isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {Object.entries(DOC_SCHEMA).map(([catKey, catMeta]) => (
            <div key={catKey}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: catMeta.color, flexShrink: 0 }} />
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#334155' }}>{catMeta.label}</h2>
                <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
                <span style={{ fontSize: 11.5, color: '#94a3b8', whiteSpace: 'nowrap' }}>
                  {catMeta.docs.filter(d => d.required).length} required · {catMeta.docs.filter(d => !d.required).length} optional
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                {catMeta.docs.map((doc, i) => {
                  const existingDoc = existingDocs.find(e => e.documentType === doc.type) || null;
                  return (
                    <div key={doc.type} style={{ animationDelay: `${i * 0.05}s` }}>
                      <DocCard
                        doc={doc}
                        category={catKey}
                        categoryMeta={catMeta}
                        leadId={leadId}
                        existingDoc={existingDoc}
                        onUploadSuccess={refetchDocs}
                        role={role}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VaultLeadDocuments;