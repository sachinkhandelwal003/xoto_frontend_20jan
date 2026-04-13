// src/components/Vault/VaultLeadDocuments.jsx
import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Upload, FileText, CheckCircle, Loader2,
  ArrowLeft, AlertCircle, Trash2, CloudUpload, Eye,
  ShieldCheck, XCircle, X,
} from "lucide-react";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const PURPLE = "#5C039B";

const DOCUMENT_TYPES = [
  { key: "emirates_id_front",  label: "Emirates ID Front",  category: "identity",  required: true },
  { key: "emirates_id_back",   label: "Emirates ID Back",   category: "identity",  required: true },
  { key: "passport",           label: "Passport",           category: "identity",  required: true },
  { key: "visa",               label: "Visa",               category: "identity",  required: false },
  { key: "bank_statements",    label: "Bank Statements",    category: "financial", required: true },
  { key: "salary_certificate", label: "Salary Certificate", category: "financial", required: true },
  { key: "payslips",           label: "Payslips",           category: "financial", required: false },
];

const CATEGORY_LABELS = { identity: "Identity Documents", financial: "Financial Documents" };

const GROUPED = DOCUMENT_TYPES.reduce((acc, doc) => {
  if (!acc[doc.category]) acc[doc.category] = [];
  acc[doc.category].push(doc);
  return acc;
}, {});

const parseDocsArray = (arr) => {
  if (!Array.isArray(arr)) return {};
  return arr.reduce((acc, doc) => {
    const key = doc.documentType || doc.document_type;
    if (!key) return acc;
    acc[key] = {
      _id:             doc._id || doc.id || "",
      fileUrl:         doc.fileUrl         || doc.file_url    || "",
      fileName:        doc.fileName        || doc.file_name   || "",
      fileSizeMb:      doc.fileSizeMb      || doc.file_size_mb || 0,
      mimeType:        doc.mimeType        || "",
      verified:        doc.verificationStatus === "verified",
      status:          doc.verificationStatus || "pending",
      rejectionReason: doc.rejectionReason || null,
    };
    return acc;
  }, {});
};

/* ── Reject Modal ────────────────────────────────────────────────────────────── */
const RejectModal = ({ doc, onClose, onConfirm, loading }) => {
  const [reason, setReason] = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "18px 20px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <XCircle size={18} color="#DC2626" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#111827" }}>Reject Document</p>
              <p style={{ margin: 0, fontSize: 12, color: "#6B7280" }}>{doc.label}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 4 }}><X size={18} /></button>
        </div>
        {/* Body */}
        <div style={{ padding: 20 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
            Rejection Reason <span style={{ color: "#DC2626" }}>*</span>
          </label>
          <textarea
            rows={4} value={reason} onChange={e => setReason(e.target.value)}
            placeholder="e.g. Document is blurry, please upload a clear copy…"
            style={{ width: "100%", padding: "10px 12px", fontSize: 13, color: "#111827", border: "1.5px solid #E5E7EB", borderRadius: 10, resize: "none", outline: "none", fontFamily: "inherit", boxSizing: "border-box", background: "#F9FAFB" }}
          />
        </div>
        {/* Footer */}
        <div style={{ padding: "0 20px 20px", display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 10, background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 9, fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer" }}>
            Cancel
          </button>
          <button
            onClick={() => reason.trim() && onConfirm(reason.trim())}
            disabled={!reason.trim() || loading}
            style={{ flex: 1, padding: 10, background: loading ? "#FCA5A5" : "#DC2626", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 600, color: "#fff", cursor: !reason.trim() || loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: !reason.trim() ? 0.6 : 1 }}
          >
            {loading ? <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Rejecting…</> : "Confirm Reject"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Main Page ───────────────────────────────────────────────────────────────── */
export default function VaultLeadDocuments() {
  const { leadId } = useParams();
  const navigate   = useNavigate();

  const [existingDocs,  setExistingDocs]  = useState({});
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [docStates,     setDocStates]     = useState({});
  const [rejectModal,   setRejectModal]   = useState(null); // { docKey, docLabel, documentId }
  const [actionLoading, setActionLoading] = useState({});   // { [docKey]: 'verifying'|'rejecting' }
  const fileInputRefs = useRef({});

  const fetchDocs = async (showLoader = true) => {
    if (showLoader) setLoadingStatus(true);
    try {
      const res = await apiService.get(`/vault/lead/documents/${leadId}`);
      const arr = Array.isArray(res?.data) ? res.data : [];
      setExistingDocs(parseDocsArray(arr));
    } catch (err) {
      console.error("Failed to fetch docs", err);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => { if (leadId) fetchDocs(); }, [leadId]);

  const updateDoc = (type, patch) =>
    setDocStates(prev => ({ ...prev, [type]: { ...(prev[type] || {}), ...patch } }));

  const handleFileSelect = (docType, file) => {
    if (!file) return;
    updateDoc(docType, { file, status: "idle", message: "" });
  };

  /* ── Upload ── */
  const handleUpload = async (docConfig) => {
    const { key: documentType, category: documentCategory } = docConfig;
    const state = docStates[documentType];
    if (!state?.file) { updateDoc(documentType, { message: "Please select a file first", status: "error" }); return; }
    if (existingDocs[documentType]?.verified) { updateDoc(documentType, { message: "Already verified, cannot re-upload.", status: "error" }); return; }

    updateDoc(documentType, { status: "uploading", message: "" });
    try {
      const formData = new FormData();
      formData.append("file", state.file);
      const uploadRes  = await apiService.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      const fileData   = uploadRes?.data?.file || uploadRes?.file;
      const fileUrl    = fileData?.url || "";
      const fileName   = fileData?.originalName || state.file.name;
      const mimeType   = fileData?.mimeType     || state.file.type;
      const fileSizeMb = parseFloat(((fileData?.size || state.file.size) / (1024 * 1024)).toFixed(2));
      if (!fileUrl) throw new Error("File URL not returned from upload API");
      await apiService.post(`/vault/lead/documents/${leadId}`, { entityType: "Lead", entityId: leadId, documentType, documentCategory, fileUrl, fileName, fileSizeMb, mimeType });
      updateDoc(documentType, { status: "success", message: "Uploaded successfully", fileUrl });
      await fetchDocs(false);
    } catch (err) {
      updateDoc(documentType, { status: "error", message: err?.response?.data?.message || err?.message || "Upload failed" });
    }
  };

  /* ── Verify ── */
  /* ── Verify ── */
const handleVerify = async (docKey, documentId) => {
  if (!documentId) return;
  setActionLoading(prev => ({ ...prev, [docKey]: "verifying" }));
  try {
    // ✅ Correct endpoint with qualityScore in body
    await apiService.post(`/vault/lead/documents/${documentId}/verify`, {
      qualityScore: 95  // Default score; you could make this dynamic if needed
    });
    await fetchDocs(false);
  } catch (err) {
    console.error("Verify failed", err);
    alert("Verification failed: " + (err?.response?.data?.message || err.message));
  } finally {
    setActionLoading(prev => { const n = { ...prev }; delete n[docKey]; return n; });
  }
};

/* ── Reject ── */
/* ── Reject ── */
const handleReject = async (reason) => {
  const { docKey, documentId } = rejectModal;
  setActionLoading(prev => ({ ...prev, [docKey]: "rejecting" }));
  try {
    await apiService.post(`/vault/lead/documents/${documentId}/reject`, {
      reason: reason
    });
    setRejectModal(null);
    // Clear local upload state so re-upload UI appears
    setDocStates(prev => {
      const next = { ...prev };
      delete next[docKey];
      return next;
    });
    await fetchDocs(false);
  } catch (err) {
    console.error("Reject failed", err);
    alert("Rejection failed: " + (err?.response?.data?.message || err.message));
  } finally {
    setActionLoading(prev => { const n = { ...prev }; delete n[docKey]; return n; });
  }
};

  const handleRemove = (docType) => {
    setDocStates(prev => { const n = { ...prev }; delete n[docType]; return n; });
    if (fileInputRefs.current[docType]) fileInputRefs.current[docType].value = "";
  };

  const totalRequired   = DOCUMENT_TYPES.filter(d => d.required).length;
  const completedCount  = DOCUMENT_TYPES.filter(d => existingDocs[d.key]?.verified || docStates[d.key]?.status === "success").length;
  const progressPercent = totalRequired ? Math.round((completedCount / totalRequired) * 100) : 0;

  if (loadingStatus) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F9FAFB" }}>
      <Loader2 size={32} color={PURPLE} style={{ animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB", padding: "28px 24px" }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {rejectModal && (
        <RejectModal
          doc={{ label: rejectModal.docLabel }}
          onClose={() => setRejectModal(null)}
          onConfirm={handleReject}
          loading={actionLoading[rejectModal.docKey] === "rejecting"}
        />
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
        <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "#fff", border: "1px solid #E5E7EB", borderRadius: 9, fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer" }}>
          <ArrowLeft size={15} /> Back
        </button>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 }}>Upload Documents</h1>
          <p style={{ fontSize: 13, color: "#6B7280", marginTop: 3 }}>
            Lead ID: <span style={{ color: PURPLE, fontWeight: 600 }}>{leadId}</span>
            &nbsp;·&nbsp;<span style={{ color: "#059669", fontWeight: 600 }}>{completedCount}</span>/{totalRequired} required
          </p>
        </div>
      </div>

      {/* Progress */}
      <div style={{ background: "#fff", borderRadius: 12, padding: "14px 20px", marginBottom: 24, border: "1px solid #E5E7EB" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Upload Progress</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: PURPLE }}>{progressPercent}%</span>
        </div>
        <div style={{ height: 8, background: "#F3F4F6", borderRadius: 99 }}>
          <div style={{ height: 8, background: `linear-gradient(90deg, ${PURPLE}, #8B5CF6)`, borderRadius: 99, width: `${progressPercent}%`, transition: "width 0.4s ease" }} />
        </div>
      </div>

      {/* Categories */}
      {Object.entries(GROUPED).map(([category, docs]) => (
        <div key={category} style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 4, height: 20, background: PURPLE, borderRadius: 99 }} />
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}>{CATEGORY_LABELS[category]}</h2>
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            {docs.map((docConfig) => {
              const existing       = existingDocs[docConfig.key];
              const documentId     = existing?._id;
              const isVerified     = existing?.verified;
              const isPending      = existing && !isVerified && existing.status !== "rejected";
              const isRejected     = existing?.status === "rejected";
              const localState     = docStates[docConfig.key] || {};
              const isUploading    = localState.status === "uploading";
              const isLocalSuccess = localState.status === "success";
              const isError        = localState.status === "error";
              const hasLocalFile   = !!localState.file;
              const isVerifying    = actionLoading[docConfig.key] === "verifying";
              const isRejecting    = actionLoading[docConfig.key] === "rejecting";
              const isActioning    = isVerifying || isRejecting;

              const borderColor = isVerified ? "#A7F3D0" : isRejected || isError ? "#FECACA" : isPending ? "#FDE68A" : isLocalSuccess ? "#A7F3D0" : hasLocalFile ? "#DDD6FE" : "#E5E7EB";

              return (
                <div key={docConfig.key} style={{ background: "#fff", border: `1.5px solid ${borderColor}`, borderRadius: 14, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", transition: "border-color 0.2s" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>

                    {/* Left: icon + info */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: isVerified || isLocalSuccess ? "#ECFDF5" : isRejected || isError ? "#FEF2F2" : isPending ? "#FFFBEB" : "#FAF5FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {isVerified || isLocalSuccess ? <CheckCircle size={18} color="#059669" />
                          : isRejected || isError ? <AlertCircle size={18} color="#DC2626" />
                          : isPending ? <Loader2 size={18} color="#D97706" />
                          : <FileText size={18} color={PURPLE} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: 0 }}>
                          {docConfig.label}{docConfig.required && <span style={{ color: "#DC2626", marginLeft: 4 }}>*</span>}
                        </p>
                        {existing && (
                          <div style={{ marginTop: 5, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                            <FileText size={12} color="#6B7280" />
                            <span style={{ fontSize: 12, color: "#374151" }}>
                              {existing.fileName}{existing.fileSizeMb ? ` · ${existing.fileSizeMb < 1 ? (existing.fileSizeMb * 1024).toFixed(0) + " KB" : existing.fileSizeMb.toFixed(1) + " MB"}` : ""}
                            </span>
                            {existing.fileUrl && <a href={existing.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: PURPLE, display: "flex", alignItems: "center" }}><Eye size={13} /></a>}
                            {isVerified && <span style={{ fontSize: 11, fontWeight: 600, background: "#ECFDF5", color: "#059669", padding: "2px 8px", borderRadius: 99 }}>✓ Verified</span>}
                            {isPending  && <span style={{ fontSize: 11, fontWeight: 600, background: "#FFFBEB", color: "#D97706", padding: "2px 8px", borderRadius: 99 }}>⏳ Pending Review</span>}
                            {isRejected && <span style={{ fontSize: 11, fontWeight: 600, background: "#FEF2F2", color: "#DC2626", padding: "2px 8px", borderRadius: 99 }}>✕ Rejected</span>}
                          </div>
                        )}
                        {isRejected && existing?.rejectionReason && <p style={{ fontSize: 12, color: "#DC2626", margin: "4px 0 0", fontWeight: 500 }}>Reason: {existing.rejectionReason}</p>}
                        {hasLocalFile && !isVerified && !isLocalSuccess && <p style={{ fontSize: 12, color: "#6B7280", margin: "2px 0 0" }}>{localState.file.name} · {(localState.file.size / (1024 * 1024)).toFixed(2)} MB</p>}
                        {isLocalSuccess && <p style={{ fontSize: 12, color: "#059669", margin: "2px 0 0", fontWeight: 500 }}>✓ Uploaded — pending verification</p>}
                        {isError        && <p style={{ fontSize: 12, color: "#DC2626", margin: "2px 0 0", fontWeight: 500 }}>✕ {localState.message}</p>}
                      </div>
                    </div>

                    {/* Right: action buttons */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>

                      {/* ── VERIFY + REJECT — show when doc uploaded but not yet verified ── */}
                      {existing && !isVerified && documentId && (
                        <>
                          <button
                            onClick={() => handleVerify(docConfig.key, documentId)}
                            disabled={isActioning}
                            style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 13px", background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#059669", cursor: isActioning ? "not-allowed" : "pointer", opacity: isActioning && !isVerifying ? 0.5 : 1, whiteSpace: "nowrap" }}
                          >
                            {isVerifying ? <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Verifying…</> : <><ShieldCheck size={13} /> Verify</>}
                          </button>

                          <button
                            onClick={() => setRejectModal({ docKey: docConfig.key, docLabel: docConfig.label, documentId })}
                            disabled={isActioning}
                            style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 13px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#DC2626", cursor: isActioning ? "not-allowed" : "pointer", opacity: isActioning && !isRejecting ? 0.5 : 1, whiteSpace: "nowrap" }}
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </>
                      )}

                      {/* Verified lock */}
                      {isVerified && <span style={{ padding: "7px 13px", background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#059669" }}>🔒 Locked</span>}

                      {/* Upload controls */}
                      {!isVerified && !isLocalSuccess && (
                        <>
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png" ref={el => (fileInputRefs.current[docConfig.key] = el)} style={{ display: "none" }} onChange={e => handleFileSelect(docConfig.key, e.target.files[0])} />
                          <button onClick={() => fileInputRefs.current[docConfig.key]?.click()} disabled={isUploading} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 13px", background: "#FAF5FF", border: "1px solid #DDD6FE", borderRadius: 8, fontSize: 12, fontWeight: 600, color: PURPLE, cursor: "pointer", opacity: isUploading ? 0.5 : 1, whiteSpace: "nowrap" }}>
                            {existing ? "Re-upload" : "Choose File"}
                          </button>
                          {hasLocalFile && (
                            <button onClick={() => handleUpload(docConfig)} disabled={isUploading} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", background: PURPLE, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#fff", cursor: "pointer", opacity: isUploading ? 0.7 : 1, whiteSpace: "nowrap" }}>
                              {isUploading ? <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Uploading…</> : <><CloudUpload size={13} /> Upload</>}
                            </button>
                          )}
                          {hasLocalFile && !isUploading && (
                            <button onClick={() => handleRemove(docConfig.key)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, cursor: "pointer" }}>
                              <Trash2 size={13} color="#DC2626" />
                            </button>
                          )}
                        </>
                      )}

                      {isLocalSuccess && localState.fileUrl && (
                        <a href={localState.fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 13px", background: "#F0FDF4", border: "1px solid #A7F3D0", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#059669", textDecoration: "none" }}>
                          <Eye size={13} /> View
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Drag & Drop */}
                  {!hasLocalFile && !isVerified && !isLocalSuccess && (
                    <div
                      onClick={() => fileInputRefs.current[docConfig.key]?.click()}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(docConfig.key, f); }}
                      style={{ marginTop: 14, border: "1.5px dashed #DDD6FE", borderRadius: 10, padding: "16px 12px", textAlign: "center", cursor: "pointer", background: "#FAFAFF" }}
                    >
                      <Upload size={20} color="#A78BFA" style={{ margin: "0 auto 6px" }} />
                      <p style={{ fontSize: 12, color: "#7C3AED", fontWeight: 500, margin: 0 }}>{existing ? "Drag & drop to re-upload" : "Click or drag & drop to select file"}</p>
                      <p style={{ fontSize: 11, color: "#9CA3AF", margin: "3px 0 0" }}>PDF, JPG, PNG supported · Max 10 MB</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* All Done */}
      {completedCount === totalRequired && totalRequired > 0 && (
        <div style={{ marginTop: 8, padding: "18px 24px", background: "#ECFDF5", border: "1.5px solid #A7F3D0", borderRadius: 14, display: "flex", alignItems: "center", gap: 14 }}>
          <CheckCircle size={28} color="#059669" />
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#065F46", margin: 0 }}>All Required Documents Uploaded!</p>
            <p style={{ fontSize: 13, color: "#047857", margin: "2px 0 0" }}>All {totalRequired} required documents submitted for verification.</p>
          </div>
        </div>
      )}
    </div>
  );
}