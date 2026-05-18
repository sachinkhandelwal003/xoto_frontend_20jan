  // src/pages/Leads/VaultAgentLeadViewAdvisor.jsx
  import { useState, useEffect } from "react";
  import { useParams, useNavigate } from "react-router-dom";
  import { Spin, message, Slider, InputNumber } from "antd";
  import {
    ChevronLeft, User, Mail, Phone, Home, DollarSign, FileText,
    Eye, AlertCircle, RefreshCw, CheckCircle, XCircle, AlertTriangle,
    Layers, BarChart2, Shield, Activity, Check, Copy, Info,
    MapPin, Calendar, Hash, FilePlus, ClipboardList, Upload,
    TrendingUp, Percent, MessageSquare, ExternalLink, Clock,
    Zap, GitBranch, CreditCard, Globe, Target, Link, Edit2, Save, X,
    Calculator, PieChart, Heart, ShieldCheck, ArrowRight
  } from "lucide-react";
  import { apiService } from "../../../manageApi/utils/custom.apiservice";

  // ─── Design Tokens ─────────────────────────────────────────────────────────
  const C = {
    primary: "#5C039B",
    primaryMid: "#7C3AED",
    primaryLight: "#9333EA",
    primaryGlow: "rgba(92,3,155,0.12)",
    primarySoft: "#F5F0FF",
    primaryBord: "#E9D5FF",
    green: "#10B981",
    greenSoft: "#ECFDF5",
    greenBord: "#A7F3D0",
    red: "#EF4444",
    redSoft: "#FEF2F2",
    redBord: "#FECACA",
    amber: "#F59E0B",
    amberSoft: "#FFFBEB",
    amberBord: "#FDE68A",
    blue: "#3B82F6",
    blueSoft: "#EFF6FF",
    gray: "#6B7280",
    grayLight: "#F9FAFB",
    grayBord: "#E5E7EB",
    text: "#111827",
    textSub: "#374151",
    textMuted: "#9CA3AF",
    white: "#FFFFFF",
    bg: "#F4F0FA",
  };

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const show = (v) => (v !== null && v !== undefined && v !== "") ? v : null;
  const fmt = (n) => n ? Number(n).toLocaleString("en-AE") : "—";
  const fmtDate = (s) => { try { return s ? new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : null; } catch { return null; } };
  const fmtDT = (s) => { try { return s ? new Date(s).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : null; } catch { return null; } };
  const boolLabel = (v) => v === true ? "Yes" : v === false ? "No" : null;
  const isPdf = (url) => url?.toLowerCase()?.includes(".pdf");
  const capWords = (s) => s ? s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : null;

  // ─── DBR Calculation Function ──────────────────────────────────────────────
  const calculateDBR = (monthlySalary, otherIncome, existingEMIs, creditCardPayments, proposedLoanEMI, isUAENational = false) => {
    const totalMonthlyIncome = (monthlySalary || 0) + (otherIncome || 0);
    const totalLiabilities = (existingEMIs || 0) + (creditCardPayments || 0);
    const totalCommitments = (proposedLoanEMI || 0) + totalLiabilities;
    const maxAllowedDBR = isUAENational ? 55 : 50;
    const dbrPercentage = totalMonthlyIncome > 0 ? (totalCommitments / totalMonthlyIncome) * 100 : 0;
    
    let status = "Eligible";
    if (dbrPercentage > maxAllowedDBR) status = "Ineligible";
    else if (dbrPercentage > maxAllowedDBR - 5) status = "Borderline";
    
    const maxEMIPossible = (totalMonthlyIncome * maxAllowedDBR / 100) - totalLiabilities;
    
    return {
      totalMonthlyIncome,
      totalLiabilities,
      totalCommitments,
      dbrPercentage: Math.round(dbrPercentage * 100) / 100,
      maxAllowedDBR,
      status,
      maxEMIPossible: Math.max(0, maxEMIPossible),
      isEligible: status === "Eligible"
    };
  };

  // ─── EMI Calculation ───────────────────────────────────────────────────────
  const calculateEMI = (principal, annualRate, tenureYears) => {
    if (!principal || principal <= 0) return 0;
    const monthlyRate = annualRate / 100 / 12;
    const months = tenureYears * 12;
    if (monthlyRate === 0) return principal / months;
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) /
      (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(emi);
  };

  // ─── LTV Calculation ───────────────────────────────────────────────────────
  const calculateLTV = (propertyValue, loanAmount, isNonResident = false) => {
    if (!propertyValue || propertyValue <= 0) return { ltv: 0, maxLTV: 85, status: "N/A" };
    const ltv = (loanAmount / propertyValue) * 100;
    let maxLTV = 85;
    if (isNonResident) maxLTV = 75;
    if (propertyValue > 5000000) maxLTV = 80;
    
    let status = "Eligible";
    if (ltv > maxLTV) status = "Ineligible";
    else if (ltv > maxLTV - 5) status = "Borderline";
    
    return { ltv: Math.round(ltv * 100) / 100, maxLTV, status };
  };

  // ─── Status config ─────────────────────────────────────────────────────────
  const STATUS_CFG = {
    "New": { bg: "#EFF6FF", color: "#1D4ED8", border: "#93C5FD" },
    "Assigned": { bg: C.primarySoft, color: C.primary, border: C.primaryBord },
    "Contacted": { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" },
    "Qualified": { bg: "#EEF2FF", color: "#4338CA", border: "#C7D2FE" },
    "Collecting Documentation": { bg: C.amberSoft, color: "#B45309", border: C.amberBord },
    "Documents Complete": { bg: "#ECFEFF", color: "#0E7490", border: "#A5F3FC" },
    "Application Opened": { bg: "#FFF5F3", color: "#C2410C", border: C.redBord },
    "Not Proceeding": { bg: C.redSoft, color: C.red, border: C.redBord },
    "Disbursed": { bg: C.greenSoft, color: C.green, border: C.greenBord },
  };

  const STATUS_OPTIONS = [
    "New", "Contacted", "Qualified", "Collecting Documentation",
    "Documents Complete", "Application Opened", "Disbursed", "Not Proceeding",
  ];

  // ══════════════════════════════════════════════════════════════════════════
  export default function VaultAgentLeadViewAdvisor() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [lead, setLead] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [docsLoading, setDocsLoading] = useState(false);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("overview");
    const [leadStatus, setLeadStatus] = useState("");
    const [statusNote, setStatusNote] = useState("");
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [rejecting, setRejecting] = useState(false);
    const [showRejectInput, setShowRejectInput] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [qualityScore, setQualityScore] = useState(95);
    const [docOverrides, setDocOverrides] = useState({});
    const [flashMsg, setFlashMsg] = useState({ type: "", text: "" });

    // ── DBR/LTV Calculator State ────────────────────────────────────────────
    const [eligibilityInputs, setEligibilityInputs] = useState({
      monthlySalary: 0,
      otherIncome: 0,
      existingEMIs: 0,
      creditCardPayments: 0,
      propertyValue: 0,
      requestedLoanAmount: 0,
      interestRate: 4.0,
      tenureYears: 25,
    });
    const [eligibilityResult, setEligibilityResult] = useState(null);
    const [ltvResult, setLtvResult] = useState(null);
    const [calculating, setCalculating] = useState(false);

    // ── Edit Modal State ────────────────────────────────────────────────────
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editSaving, setEditSaving] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [editFormOriginal, setEditFormOriginal] = useState({});

    const flash = (type, text) => {
      setFlashMsg({ type, text });
      setTimeout(() => setFlashMsg({ type: "", text: "" }), 4000);
    };

    // ── Fetch ─────────────────────────────────────────────────────────────
    const fetchLead = async () => {
      try {
        setLoading(true); setError("");
        const res = await apiService.get(`/vault/lead/${id}`);
        const data = res?.data?.data || res?.data || null;
        setLead(data);
        setLeadStatus(data?.currentStatus || "");
        
        // Initialize eligibility inputs from lead data
        const ci = data?.customerInfo || {};
        const pd = data?.propertyDetails || {};
        const lr = data?.loanRequirements || {};
        
        setEligibilityInputs({
          monthlySalary: ci.monthlySalary || 0,
          otherIncome: 0,
          existingEMIs: 0,
          creditCardPayments: 0,
          propertyValue: pd.propertyValue || 0,
          requestedLoanAmount: pd.loanAmountRequired || 0,
          interestRate: 4.0,
          tenureYears: lr.preferredTenureYears || 25,
        });
        
        // Calculate initial eligibility
        calculateEligibilityFromInputs({
          monthlySalary: ci.monthlySalary || 0,
          otherIncome: 0,
          existingEMIs: 0,
          creditCardPayments: 0,
          propertyValue: pd.propertyValue || 0,
          requestedLoanAmount: pd.loanAmountRequired || 0,
          interestRate: 4.0,
          tenureYears: lr.preferredTenureYears || 25,
        }, ci.nationality === "UAE National" || ci.nationality === "Emirati");
        
      } catch (err) {
        setError(err?.response?.data?.message || err.message || "Failed to load lead");
      } finally {
        setLoading(false);
      }
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
      } catch { /* silent */ }
      finally { setDocsLoading(false); }
    };

    useEffect(() => { if (id) { fetchLead(); fetchDocs(); } }, [id]);

    // ── Eligibility Calculation ─────────────────────────────────────────────
    const calculateEligibilityFromInputs = (inputs, isUAENational) => {
      const proposedEMI = calculateEMI(inputs.requestedLoanAmount, inputs.interestRate, inputs.tenureYears);
      const dbr = calculateDBR(
        inputs.monthlySalary, inputs.otherIncome, 
        inputs.existingEMIs, inputs.creditCardPayments, 
        proposedEMI, isUAENational
      );
      const ltv = calculateLTV(inputs.propertyValue, inputs.requestedLoanAmount, !isUAENational);
      
      setEligibilityResult({ ...dbr, proposedEMI });
      setLtvResult(ltv);
    };

    const handleEligibilityInputChange = (field, value) => {
      const newInputs = { ...eligibilityInputs, [field]: value };
      setEligibilityInputs(newInputs);
      const isUAENational = lead?.customerInfo?.nationality === "UAE National" || lead?.customerInfo?.nationality === "Emirati";
      calculateEligibilityFromInputs(newInputs, isUAENational);
    };

    const saveEligibilityToLead = async () => {
      setCalculating(true);
      try {
        await apiService.post(`/vault/lead/${id}/calculate-eligibility`, {
          monthlySalary: eligibilityInputs.monthlySalary,
          otherIncome: eligibilityInputs.otherIncome,
          existingEMIs: eligibilityInputs.existingEMIs,
          creditCardPayments: eligibilityInputs.creditCardPayments,
          propertyValue: eligibilityInputs.propertyValue,
          requestedLoanAmount: eligibilityInputs.requestedLoanAmount,
          dbrPercentage: eligibilityResult?.dbrPercentage,
          dbrStatus: eligibilityResult?.status,
          ltv: ltvResult?.ltv,
          isEligible: eligibilityResult?.isEligible && ltvResult?.status === "Eligible",
        });
        flash("success", "Eligibility data saved to lead");
        fetchLead();
      } catch (err) {
        flash("error", err?.response?.data?.message || "Failed to save eligibility");
      } finally {
        setCalculating(false);
      }
    };

    // ── Open Edit Modal ────────────────────────────────────────────────────
    const openEditModal = () => {
      if (!lead) return;
      const ci = lead.customerInfo || {};
      const pd = lead.propertyDetails || {};
      const pa = pd.propertyAddress || {};
      const lr = lead.loanRequirements || {};
      const initialForm = {
        fullName: ci.fullName ?? "",
        preferredName: ci.preferredName ?? "",
        email: ci.email ?? "",
        mobileNumber: ci.mobileNumber ?? "",
        alternativePhone: ci.alternativePhone ?? "",
        whatsappNumber: ci.whatsappNumber ?? "",
        nationality: ci.nationality ?? "",
        maritalStatus: ci.maritalStatus ?? "",
        numberOfDependents: ci.numberOfDependents ?? "",
        occupation: ci.occupation ?? "",
        employer: ci.employer ?? "",
        monthlySalary: ci.monthlySalary ?? "",
        propertyType: pd.propertyType ?? "",
        propertySubtype: pd.propertySubtype ?? "",
        propertyValue: pd.propertyValue ?? "",
        loanAmountRequired: pd.loanAmountRequired ?? "",
        downPaymentAmount: pd.downPaymentAmount ?? "",
        propertyAgeYears: pd.propertyAgeYears ?? "",
        isOffPlan: pd.isOffPlan ?? false,
        building: pa.building ?? "",
        area: pa.area ?? "",
        city: pa.city ?? "",
        preferredTenureYears: lr.preferredTenureYears ?? "",
        preferredInterestRateType: lr.preferredInterestRateType ?? "",
        preferredBanks: lr.preferredBanks?.join(", ") ?? "",
        feeFinancingPreference: lr.feeFinancingPreference ?? false,
        lifeInsurancePreference: lr.lifeInsurancePreference ?? false,
        propertyInsurancePreference: lr.propertyInsurancePreference ?? false,
        specialRequirements: lr.specialRequirements ?? "",
        notesToXoto: lead.notesToXoto ?? "",
      };
      setEditForm(initialForm);
      setEditFormOriginal(initialForm);
      setEditModalOpen(true);
    };

    const handleEditChange = (key, value) => {
      setEditForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleEditSave = async () => {
      setEditSaving(true);
      try {
        const num = (v) => (v !== "" && v !== null && v !== undefined) ? Number(v) : undefined;
        const orig = editFormOriginal;
        const isDiff = (key) => String(editForm[key]) !== String(orig[key] ?? "");
        const isBoolDiff = (key) => editForm[key] !== orig[key];

        const ciKeys = ["fullName","preferredName","email","mobileNumber","alternativePhone","whatsappNumber","nationality","maritalStatus","numberOfDependents","occupation","employer","monthlySalary"];
        const ciDirty = ciKeys.some(isDiff);
        const ci = ciDirty ? {} : null;
        if (ciDirty) {
          if (isDiff("fullName")) ci.fullName = editForm.fullName;
          if (isDiff("preferredName")) ci.preferredName = editForm.preferredName;
          if (isDiff("email")) ci.email = editForm.email;
          if (isDiff("mobileNumber")) ci.mobileNumber = editForm.mobileNumber;
          if (isDiff("alternativePhone")) ci.alternativePhone = editForm.alternativePhone;
          if (isDiff("whatsappNumber")) ci.whatsappNumber = editForm.whatsappNumber;
          if (isDiff("nationality")) ci.nationality = editForm.nationality;
          if (isDiff("maritalStatus")) ci.maritalStatus = editForm.maritalStatus;
          if (isDiff("numberOfDependents")) ci.numberOfDependents = num(editForm.numberOfDependents);
          if (isDiff("occupation")) ci.occupation = editForm.occupation;
          if (isDiff("employer")) ci.employer = editForm.employer;
          if (isDiff("monthlySalary")) ci.monthlySalary = num(editForm.monthlySalary);
        }

        const pdScalarKeys = ["propertyType","propertySubtype","propertyValue","loanAmountRequired","downPaymentAmount","propertyAgeYears"];
        const addrKeys = ["building","area","city"];
        const pdDirty = pdScalarKeys.some(isDiff) || isBoolDiff("isOffPlan") || addrKeys.some(isDiff);
        const pd = pdDirty ? {} : null;
        if (pdDirty) {
          if (isDiff("propertyType")) pd.propertyType = editForm.propertyType;
          if (isDiff("propertySubtype")) pd.propertySubtype = editForm.propertySubtype;
          if (isDiff("propertyValue")) pd.propertyValue = num(editForm.propertyValue);
          if (isDiff("loanAmountRequired")) pd.loanAmountRequired = num(editForm.loanAmountRequired);
          if (isDiff("downPaymentAmount")) pd.downPaymentAmount = num(editForm.downPaymentAmount);
          if (isDiff("propertyAgeYears")) pd.propertyAgeYears = num(editForm.propertyAgeYears);
          if (isBoolDiff("isOffPlan")) pd.isOffPlan = editForm.isOffPlan;
          if (addrKeys.some(isDiff)) {
            const addr = {};
            if (isDiff("building")) addr.building = editForm.building;
            if (isDiff("area")) addr.area = editForm.area;
            if (isDiff("city")) addr.city = editForm.city;
            pd.propertyAddress = addr;
          }
        }

        const lrScalarKeys = ["preferredTenureYears","preferredInterestRateType","preferredBanks","specialRequirements"];
        const lrBoolKeys = ["feeFinancingPreference","lifeInsurancePreference","propertyInsurancePreference"];
        const lrDirty = lrScalarKeys.some(isDiff) || lrBoolKeys.some(isBoolDiff);
        const lr = lrDirty ? {} : null;
        if (lrDirty) {
          if (isDiff("preferredTenureYears")) lr.preferredTenureYears = num(editForm.preferredTenureYears);
          if (isDiff("preferredInterestRateType")) lr.preferredInterestRateType = editForm.preferredInterestRateType;
          if (isDiff("preferredBanks")) lr.preferredBanks = editForm.preferredBanks.split(",").map(s => s.trim()).filter(Boolean);
          if (isDiff("specialRequirements")) lr.specialRequirements = editForm.specialRequirements;
          if (isBoolDiff("feeFinancingPreference")) lr.feeFinancingPreference = editForm.feeFinancingPreference;
          if (isBoolDiff("lifeInsurancePreference")) lr.lifeInsurancePreference = editForm.lifeInsurancePreference;
          if (isBoolDiff("propertyInsurancePreference")) lr.propertyInsurancePreference = editForm.propertyInsurancePreference;
        }

        const payload = {};
        if (ci) payload.customerInfo = ci;
        if (pd) payload.propertyDetails = pd;
        if (lr) payload.loanRequirements = lr;
        if (isDiff("notesToXoto")) payload.notesToXoto = editForm.notesToXoto;

        if (Object.keys(payload).length === 0) {
          flash("error", "No changes to save");
          setEditSaving(false);
          return;
        }

        const res = await apiService.put(`/vault/lead/advisor/lead/${id}/info`, payload);
        const updatedData = res?.data?.data || res?.data || null;

        setLead((prev) => {
          if (!prev) return prev;
          const next = { ...prev };
          if (payload.customerInfo) next.customerInfo = { ...(prev.customerInfo || {}), ...payload.customerInfo };
          if (payload.propertyDetails) next.propertyDetails = { ...(prev.propertyDetails || {}), ...payload.propertyDetails };
          if (payload.loanRequirements) next.loanRequirements = { ...(prev.loanRequirements || {}), ...payload.loanRequirements };
          if (payload.notesToXoto !== undefined) next.notesToXoto = payload.notesToXoto;
          
          // Update eligibility inputs with new data
          if (payload.customerInfo?.monthlySalary !== undefined) {
            setEligibilityInputs(prev => ({ ...prev, monthlySalary: payload.customerInfo.monthlySalary }));
          }
          if (payload.loanRequirements?.preferredTenureYears !== undefined) {
            setEligibilityInputs(prev => ({ ...prev, tenureYears: payload.loanRequirements.preferredTenureYears }));
          }
          if (payload.propertyDetails?.propertyValue !== undefined) {
            setEligibilityInputs(prev => ({ ...prev, propertyValue: payload.propertyDetails.propertyValue }));
          }
          if (payload.propertyDetails?.loanAmountRequired !== undefined) {
            setEligibilityInputs(prev => ({ ...prev, requestedLoanAmount: payload.propertyDetails.loanAmountRequired }));
          }
          
          return updatedData ? { ...next, ...updatedData } : next;
        });

        flash("success", "Changes saved successfully");
        setEditModalOpen(false);
      } catch (err) {
        flash("error", err?.response?.data?.message || "Failed to save changes");
      } finally {
        setEditSaving(false);
      }
    };

    // ── Status Update ─────────────────────────────────────────────────────
    const handleStatusUpdate = async () => {
      if (!leadStatus) { flash("error", "Please select a status"); return; }
      try {
        setStatusUpdating(true);
        await apiService.put(`/vault/lead/admin/${id}/status`, {
          status: leadStatus,
          notes: statusNote.trim() || undefined,
        });
        flash("success", `Status updated to "${leadStatus}"`);
        setStatusNote("");
        await fetchLead();
      } catch (err) {
        flash("error", err?.response?.data?.message || "Status update failed");
      } finally {
        setStatusUpdating(false);
      }
    };

    // ── Document modal ─────────────────────────────────────────────────────
    const openDocModal = (doc) => {
      const fileUrl = doc.fileUrl || doc.url || doc.documentUrl || doc.file_url;
      if (!fileUrl) { message.warning("File URL not available"); return; }
      const docId = doc._id || doc.id;
      const override = docOverrides[docId];
      setSelectedDoc({ ...doc, fileUrl, ...(override || {}) });
      setModalOpen(true);
      setModalLoading(true);
      setShowRejectInput(false);
      setRejectReason("");
      setQualityScore(95);
    };

    const closeDocModal = () => { setModalOpen(false); setSelectedDoc(null); setShowRejectInput(false); };

    const handleVerifyDoc = async () => {
      const docId = selectedDoc?._id || selectedDoc?.id;
      if (!docId) return;
      setVerifying(true);
      try {
        await apiService.post(`/vault/lead/documents/${docId}/verify`, { qualityScore });
        const ov = { status: "Verified", verification_status: "Verified" };
        setDocOverrides((p) => ({ ...p, [docId]: ov }));
        setSelectedDoc((p) => ({ ...p, ...ov }));
        flash("success", "Document verified!");
        await fetchDocs();
      } catch (err) {
        flash("error", err?.response?.data?.message || "Verification failed");
      } finally { setVerifying(false); }
    };

    const handleRejectDoc = async () => {
      if (!rejectReason.trim()) { flash("error", "Please enter a rejection reason"); return; }
      const docId = selectedDoc?._id || selectedDoc?.id;
      if (!docId) return;
      setRejecting(true);
      try {
        await apiService.post(`/vault/lead/documents/${docId}/reject`, { reason: rejectReason });
        const ov = { status: "Rejected", verification_status: "Rejected", rejectionReason: rejectReason };
        setDocOverrides((p) => ({ ...p, [docId]: ov }));
        setSelectedDoc((p) => ({ ...p, ...ov }));
        setShowRejectInput(false);
        flash("success", "Document rejected.");
        await fetchDocs();
      } catch (err) {
        flash("error", err?.response?.data?.message || "Rejection failed");
      } finally { setRejecting(false); }
    };

    // ── Loading / Error ────────────────────────────────────────────────────
    if (loading) return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: C.primarySoft, border: `2px solid ${C.primaryBord}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <RefreshCw size={24} color={C.primary} style={{ animation: "spin 1s linear infinite" }} />
        </div>
        <p style={{ color: C.gray, fontSize: 14, fontWeight: 500 }}>Loading lead details...</p>
      </div>
    );

    if (error || !lead) return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: C.redSoft, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <AlertCircle size={28} color={C.red} />
        </div>
        <p style={{ color: "#B91C1C", marginBottom: 20, fontSize: 15, fontWeight: 600 }}>{error || "Lead not found"}</p>
        <button onClick={() => navigate(-1)} style={{ padding: "10px 24px", background: C.primary, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <ChevronLeft size={16} /> Go Back
        </button>
      </div>
    );

    // ── Destructure API response ──────────────────────────────────────────
    const ci = lead.customerInfo || {};
    const pd = lead.propertyDetails || {};
    const pa = pd.propertyAddress || {};
    const dc = lead.documentCollection || {};
    const si = lead.sourceInfo || {};
    const at = lead.assignedTo || {};
    const sla = lead.sla || {};
    const lr = lead.loanRequirements || {};
    const cv = lead.conversionInfo || {};
    const ci2 = lead.commissionInfo || {};
    const dup = lead.duplicateCheck || {};

    const currentStatus = lead.currentStatus || "New";
    const statusCfg = STATUS_CFG[currentStatus] || STATUS_CFG["New"];
    const propertyAddr = [pa.building, pa.area, pa.city].filter(Boolean).join(", ");
    const docsUploaded = dc.documentsUploaded ?? documents.length;
    const docsVerified = dc.documentsVerified ?? documents.filter((d) => (d.status || d.verification_status) === "Verified").length;
    const docsPending = dc.documentsPending ?? documents.filter((d) => { const s = d.status || d.verification_status; return !s || s === "Pending"; }).length;
    const docsRejected = dc.documentsRejected ?? documents.filter((d) => (d.status || d.verification_status) === "Rejected").length;
    const docsRequired = dc.totalDocumentsRequired ?? 7;
    const isSlaBreached = sla.breached === true;
    const isUAENational = ci.nationality === "UAE National" || ci.nationality === "Emirati";

    const TABS = [
      { id: "overview", label: "Overview", icon: Layers },
      { id: "property", label: "Property", icon: Home },
      { id: "documents", label: "Documents", icon: FileText },
      { id: "financial", label: "Financial & Eligibility", icon: Calculator },
      { id: "status", label: "Status", icon: ClipboardList },
      { id: "system", label: "System", icon: Shield },
    ];

    // ─────────────────────────────────────────────────────────────────────
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', sans-serif" }}>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg) } }
          @keyframes fadeUp { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
          @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
          @keyframes slideUp { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
          .pd-tab:hover { background: ${C.primaryGlow} !important; color: ${C.primary} !important; }
          .eligibility-card { transition: all 0.3s ease; }
          .eligibility-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(92,3,155,0.12); }
        `}</style>

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>

          {/* ── Back ── */}
          <button
            onClick={() => navigate(-1)}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20, padding: "8px 16px", background: C.white, border: `1px solid ${C.grayBord}`, borderRadius: 10, fontSize: 13, fontWeight: 600, color: C.textSub, cursor: "pointer", transition: "all .2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.primaryBord; e.currentTarget.style.color = C.primary; e.currentTarget.style.background = C.primarySoft; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.grayBord; e.currentTarget.style.color = C.textSub; e.currentTarget.style.background = C.white; }}
          >
            <ChevronLeft size={15} /> Back to Vault Leads
          </button>

          {/* ── Flash ── */}
          {flashMsg.text && (
            <div style={{ marginBottom: 16, padding: "10px 16px", borderRadius: 10, fontSize: 13, display: "flex", alignItems: "center", gap: 8, background: flashMsg.type === "success" ? C.greenSoft : C.redSoft, color: flashMsg.type === "success" ? "#065F46" : "#991B1B", border: `1px solid ${flashMsg.type === "success" ? C.greenBord : C.redBord}` }}>
              {flashMsg.type === "success" ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
              {flashMsg.text}
            </div>
          )}

          {/* ── SLA Breach banner ── */}
          {isSlaBreached && (
            <div style={{ marginBottom: 14, padding: "10px 16px", borderRadius: 10, fontSize: 13, display: "flex", alignItems: "center", gap: 8, background: C.redSoft, color: "#991B1B", border: `1px solid ${C.redBord}`, fontWeight: 600 }}>
              <AlertTriangle size={15} /> SLA Breached — This lead requires immediate attention
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════
              PROFILE HEADER
          ════════════════════════════════════════════════════════════ */}
          <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.grayBord}`, marginBottom: 16, overflow: "hidden", boxShadow: "0 2px 16px rgba(92,3,155,0.06)", animation: "fadeUp .4s ease" }}>
            <div style={{ height: 5, background: `linear-gradient(90deg, ${C.primary}, ${C.primaryMid}, ${C.primaryLight})` }} />
            <div style={{ display: "flex", alignItems: "flex-start", gap: 20, padding: "24px 28px 22px", flexWrap: "wrap" }}>
              <div style={{ width: 76, height: 76, borderRadius: 18, background: C.primarySoft, border: `2px solid ${C.primaryBord}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <User size={32} color={C.primary} />
              </div>

              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0, letterSpacing: "-.4px" }}>{ci.fullName || "—"}</h1>
                  {ci.preferredName && <StatusPill bg={C.primarySoft} color={C.primary} label={`"${ci.preferredName}"`} />}
                  <StatusPill bg={statusCfg.bg} color={statusCfg.color} label={currentStatus} dot />
                  {lead.referralType && <StatusPill bg="#F0F9FF" color="#0369A1" label={lead.referralType} />}
                  {lead.loanAmountRange && <StatusPill bg={C.amberSoft} color="#B45309" label={lead.loanAmountRange} />}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 18px" }}>
                  <InfoChip icon={Mail} value={ci.email} />
                  <InfoChip icon={Phone} value={ci.mobileNumber} />
                  <InfoChip icon={MapPin} value={propertyAddr || null} />
                  <InfoChip icon={DollarSign} value={pd.loanAmountRequired ? `Loan: AED ${fmt(pd.loanAmountRequired)}` : pd.propertyValue ? `Property: AED ${fmt(pd.propertyValue)}` : null} />
                  <InfoChip icon={Calendar} value={lead.createdAt ? `Created ${fmtDate(lead.createdAt)}` : null} />
                </div>
              </div>

              <div style={{ flexShrink: 0, textAlign: "right", minWidth: 150, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                <button
                  className="edit-btn"
                  onClick={openEditModal}
                  style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", background: `linear-gradient(135deg, ${C.primary}, ${C.primaryMid})`, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all .2s", boxShadow: "0 2px 12px rgba(92,3,155,0.25)" }}
                >
                  <Edit2 size={14} /> Edit Lead
                </button>
                {at.advisorName ? (
                  <div><div style={{ fontSize: 10, color: C.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>Assigned To</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{at.advisorName}</div></div>
                ) : (
                  <div style={{ fontSize: 12, color: C.amber, background: C.amberSoft, padding: "4px 10px", borderRadius: 8 }}>⚠ No Advisor Assigned</div>
                )}
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════
              STATS ROW
          ════════════════════════════════════════════════════════════ */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 16 }}>
            <StatTile icon={DollarSign} color={C.primary} label="Loan Amount" value={pd.loanAmountRequired ? `AED ${fmt(pd.loanAmountRequired)}` : "—"} />
            <StatTile icon={TrendingUp} color={C.green} label="Property Value" value={pd.propertyValue ? `AED ${fmt(pd.propertyValue)}` : "—"} />
            <StatTile icon={FileText} color="#0891B2" label="Documents" value={`${docsUploaded} / ${docsRequired}`} />
            <StatTile icon={Percent} color={C.amber} label="Collection" value={`${dc.collectionPercentage ?? 0}%`} />
            <StatTile icon={Heart} color={eligibilityResult?.isEligible && ltvResult?.status === "Eligible" ? C.green : eligibilityResult?.status === "Borderline" ? C.amber : C.red} label="Eligibility" value={eligibilityResult?.isEligible && ltvResult?.status === "Eligible" ? "Eligible" : eligibilityResult?.status === "Borderline" ? "Borderline" : "Check Required"} />
          </div>

          {/* ════════════════════════════════════════════════════════════
              TABS
          ════════════════════════════════════════════════════════════ */}
          <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.grayBord}`, padding: "4px 6px", display: "flex", gap: 2, marginBottom: 16, overflowX: "auto" }}>
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className="pd-tab"
                  onClick={() => setActiveTab(tab.id)}
                  style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 10, border: "none", background: active ? C.primarySoft : "transparent", color: active ? C.primary : C.gray, fontWeight: active ? 700 : 500, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", transition: "all .2s", borderBottom: active ? `2px solid ${C.primary}` : "2px solid transparent" }}
                >
                  <Icon size={14} /> {tab.label}
                  {tab.id === "documents" && documents.length > 0 && (
                    <span style={{ background: C.primarySoft, color: C.primary, fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 99, border: `1px solid ${C.primaryBord}` }}>{documents.length}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ════════════════════════════════════════════════════════════
              TAB CONTENT
          ════════════════════════════════════════════════════════════ */}
          <div style={{ animation: "fadeUp .3s ease" }} key={activeTab}>

            {/* ── OVERVIEW TAB (same as before) ──────────────────────────── */}
            {activeTab === "overview" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Section icon={User} title="Client Information">
                  <DRow label="Full Name" value={show(ci.fullName)} />
                  <DRow label="Preferred Name" value={show(ci.preferredName)} />
                  <DRow label="Email" value={show(ci.email)} copy />
                  <DRow label="Mobile" value={show(ci.mobileNumber)} copy />
                  <DRow label="Alt. Phone" value={show(ci.alternativePhone)} />
                  <DRow label="WhatsApp" value={show(ci.whatsappNumber)} copy />
                  <DRow label="Date of Birth" value={fmtDate(ci.dateOfBirth)} />
                  <DRow label="Nationality" value={show(ci.nationality)} />
                  <DRow label="Marital Status" value={show(ci.maritalStatus)} />
                  <DRow label="Dependents" value={show(ci.numberOfDependents)} />
                  <DRow label="Occupation" value={show(ci.occupation)} />
                  <DRow label="Employer" value={show(ci.employer)} />
                  <DRow label="Monthly Salary" value={ci.monthlySalary ? `AED ${fmt(ci.monthlySalary)}` : null} />
                </Section>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <Section icon={FilePlus} title="Lead Source">
                    <DRow label="Source" value={show(capWords(si.source))} />
                    <DRow label="Submission" value={show(capWords(si.submissionMethod))} />
                    <DRow label="Created By" value={si.createdByName || "—"} />
                    <DRow label="Role" value={show(capWords(si.createdByRole))} />
                    <DRow label="Submitted At" value={fmtDT(si.createdAt)} />
                    <DRow label="Referral Type" value={show(lead.referralType)} />
                    <DRow label="Loan Range" value={show(lead.loanAmountRange)} />
                  </Section>

                  <Section icon={User} title="Assigned Advisor">
                    {at.advisorName ? (
                      <>
                        <DRow label="Advisor Name" value={at.advisorName} />
                        <DRow label="Assigned At" value={fmtDT(at.assignedAt)} />
                      </>
                    ) : <EmptyNote msg="No advisor assigned yet" />}
                  </Section>
                </div>

                {lead.notesToXoto && (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <Section icon={MessageSquare} title="Notes to Xoto">
                      <div style={{ background: C.primarySoft, borderRadius: 10, padding: "14px 16px", border: `1px solid ${C.primaryBord}`, fontSize: 14, color: C.textSub }}>
                        {lead.notesToXoto}
                      </div>
                    </Section>
                  </div>
                )}
              </div>
            )}

            {/* ── PROPERTY TAB (same as before) ──────────────────────────── */}
            {activeTab === "property" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Section icon={Home} title="Property Details">
                  <DRow label="Property Type" value={show(pd.propertyType)} />
                  <DRow label="Property Subtype" value={show(pd.propertySubtype)} />
                  <DRow label="Property Value" value={pd.propertyValue ? `AED ${fmt(pd.propertyValue)}` : null} />
                  <DRow label="Down Payment" value={pd.downPaymentAmount ? `AED ${fmt(pd.downPaymentAmount)}` : null} />
                  <DRow label="Loan Amount" value={pd.loanAmountRequired ? `AED ${fmt(pd.loanAmountRequired)}` : null} />
                  <DRow label="Property Age" value={pd.propertyAgeYears !== null ? show(pd.propertyAgeYears) : null} />
                  <DRow label="Off-Plan" value={boolLabel(pd.isOffPlan)} />
                </Section>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <Section icon={MapPin} title="Property Address">
                    <DRow label="Building" value={show(pa.building)} />
                    <DRow label="Area" value={show(pa.area)} />
                    <DRow label="City" value={show(pa.city)} />
                  </Section>

                  <Section icon={Target} title="Loan Requirements">
                    <DRow label="Preferred Tenure" value={lr.preferredTenureYears ? `${lr.preferredTenureYears} years` : null} />
                    <DRow label="Rate Type" value={show(lr.preferredInterestRateType)} />
                    <DRow label="Preferred Banks" value={lr.preferredBanks?.length ? lr.preferredBanks.join(", ") : "No preference"} />
                    <DRow label="Fee Financing" value={boolLabel(lr.feeFinancingPreference)} highlight={lr.feeFinancingPreference} />
                    <DRow label="Life Insurance" value={boolLabel(lr.lifeInsurancePreference)} highlight={lr.lifeInsurancePreference} />
                    <DRow label="Property Insurance" value={boolLabel(lr.propertyInsurancePreference)} highlight={lr.propertyInsurancePreference} />
                    {lr.specialRequirements && <DRow label="Special Requirements" value={show(lr.specialRequirements)} />}
                  </Section>
                </div>
              </div>
            )}

            {/* ── DOCUMENTS TAB (same as before) ──────────────────────────── */}
            {activeTab === "documents" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
                  {[
                    { label: "Required", value: docsRequired, color: C.gray },
                    { label: "Uploaded", value: docsUploaded, color: C.primary },
                    { label: "Verified", value: docsVerified, color: C.green },
                    { label: "Pending", value: docsPending, color: C.amber },
                    { label: "Rejected", value: docsRejected, color: C.red },
                  ].map((s) => (
                    <div key={s.label} style={{ background: C.white, borderRadius: 12, padding: "14px 16px", border: `1px solid ${C.grayBord}`, textAlign: "center" }}>
                      <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: C.gray, fontWeight: 600, marginTop: 4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <Section icon={FileText} title={`Uploaded Documents (${documents.length})`}>
                  {docsLoading ? (
                    <div style={{ textAlign: "center", padding: "40px 0" }}><Spin size="large" /></div>
                  ) : documents.length > 0 ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
                      {documents.map((doc, i) => {
                        const docId = doc._id || doc.id;
                        const override = docOverrides[docId];
                        return <DocCard key={docId || i} doc={override ? { ...doc, ...override } : doc} onView={openDocModal} />;
                      })}
                    </div>
                  ) : <EmptyNote msg="No documents uploaded yet" />}
                </Section>
              </div>
            )}

            {/* ── FINANCIAL & ELIGIBILITY TAB (NEW) ──────────────────────── */}
            {activeTab === "financial" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                
                {/* Eligibility Summary Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                  <div className="eligibility-card" style={{ background: C.white, borderRadius: 14, padding: "14px 16px", border: `1px solid ${eligibilityResult?.isEligible ? C.greenBord : eligibilityResult?.status === "Borderline" ? C.amberBord : C.redBord}`, textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: C.gray, fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>DBR Status</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: eligibilityResult?.isEligible ? C.green : eligibilityResult?.status === "Borderline" ? C.amber : C.red }}>{eligibilityResult?.status || "—"}</div>
                    <div style={{ fontSize: 12, color: C.textSub, marginTop: 4 }}>{eligibilityResult?.dbrPercentage || 0}% of {eligibilityResult?.maxAllowedDBR || 50}% limit</div>
                  </div>
                  <div className="eligibility-card" style={{ background: C.white, borderRadius: 14, padding: "14px 16px", border: `1px solid ${ltvResult?.status === "Eligible" ? C.greenBord : ltvResult?.status === "Borderline" ? C.amberBord : C.redBord}`, textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: C.gray, fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>LTV Status</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: ltvResult?.status === "Eligible" ? C.green : ltvResult?.status === "Borderline" ? C.amber : C.red }}>{ltvResult?.status || "—"}</div>
                    <div style={{ fontSize: 12, color: C.textSub, marginTop: 4 }}>{ltvResult?.ltv || 0}% of {ltvResult?.maxLTV || 85}% limit</div>
                  </div>
                  <div className="eligibility-card" style={{ background: C.white, borderRadius: 14, padding: "14px 16px", border: `1px solid ${C.primaryBord}`, textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: C.gray, fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>Proposed EMI</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: C.primary }}>AED {eligibilityResult?.proposedEMI?.toLocaleString() || "—"}</div>
                    <div style={{ fontSize: 12, color: C.textSub, marginTop: 4 }}>Monthly Payment</div>
                  </div>
                  <div className="eligibility-card" style={{ background: C.white, borderRadius: 14, padding: "14px 16px", border: `1px solid ${C.primaryBord}`, textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: C.gray, fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>Max Loan Eligible</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: C.primary }}>AED {Math.min(eligibilityResult?.maxEMIPossible * 12 * eligibilityInputs.tenureYears || 0, eligibilityInputs.propertyValue * (ltvResult?.maxLTV || 85) / 100).toLocaleString() || "—"}</div>
                    <div style={{ fontSize: 11, color: C.textSub, marginTop: 4 }}>Based on DBR & LTV</div>
                  </div>
                </div>

                {/* DBR Calculator Section */}
                <Section icon={Calculator} title="Debt Burden Ratio (DBR) Calculator">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    {/* Left Side - Inputs */}
                    <div>
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: C.textSub, display: "block", marginBottom: 6 }}>Monthly Salary (AED)</label>
                        <InputNumber
                          value={eligibilityInputs.monthlySalary}
                          onChange={(val) => handleEligibilityInputChange("monthlySalary", val || 0)}
                          style={{ width: "100%" }}
                          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        />
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: C.textSub, display: "block", marginBottom: 6 }}>Other Monthly Income (AED)</label>
                        <InputNumber value={eligibilityInputs.otherIncome} onChange={(val) => handleEligibilityInputChange("otherIncome", val || 0)} style={{ width: "100%" }} />
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: C.textSub, display: "block", marginBottom: 6 }}>Existing Loan EMIs (AED)</label>
                        <InputNumber value={eligibilityInputs.existingEMIs} onChange={(val) => handleEligibilityInputChange("existingEMIs", val || 0)} style={{ width: "100%" }} />
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: C.textSub, display: "block", marginBottom: 6 }}>Credit Card Payments (AED)</label>
                        <InputNumber value={eligibilityInputs.creditCardPayments} onChange={(val) => handleEligibilityInputChange("creditCardPayments", val || 0)} style={{ width: "100%" }} />
                      </div>
                    </div>

                    {/* Right Side - DBR Result */}
                    <div style={{ background: C.grayLight, borderRadius: 12, padding: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>DBR Calculation</span>
                        <span style={{ fontSize: 11, color: C.textMuted }}>Max DBR: {isUAENational ? "55%" : "50%"}</span>
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                          <span>Total Monthly Income</span>
                          <strong>AED {eligibilityResult?.totalMonthlyIncome?.toLocaleString() || 0}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                          <span>Total Liabilities</span>
                          <strong>AED {eligibilityResult?.totalLiabilities?.toLocaleString() || 0}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                          <span>Proposed EMI</span>
                          <strong>AED {eligibilityResult?.proposedEMI?.toLocaleString() || 0}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8, paddingTop: 8, borderTop: `1px solid ${C.grayBord}` }}>
                          <span>Total Commitments</span>
                          <strong>AED {eligibilityResult?.totalCommitments?.toLocaleString() || 0}</strong>
                        </div>
                        <div style={{ height: 8, background: C.grayBord, borderRadius: 4, marginBottom: 6 }}>
                          <div style={{ width: `${Math.min(eligibilityResult?.dbrPercentage || 0, 100)}%`, height: "100%", borderRadius: 4, background: eligibilityResult?.isEligible ? C.green : eligibilityResult?.status === "Borderline" ? C.amber : C.red }} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                          <span>DBR: {eligibilityResult?.dbrPercentage || 0}%</span>
                          <span style={{ color: eligibilityResult?.isEligible ? C.green : eligibilityResult?.status === "Borderline" ? C.amber : C.red }}>{eligibilityResult?.status || "Pending"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Section>

                {/* LTV Calculator Section */}
                <Section icon={Home} title="Loan to Value (LTV) Calculator">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    <div>
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: C.textSub, display: "block", marginBottom: 6 }}>Property Value (AED)</label>
                        <InputNumber
                          value={eligibilityInputs.propertyValue}
                          onChange={(val) => handleEligibilityInputChange("propertyValue", val || 0)}
                          style={{ width: "100%" }}
                          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        />
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: C.textSub, display: "block", marginBottom: 6 }}>Requested Loan Amount (AED)</label>
                        <InputNumber
                          value={eligibilityInputs.requestedLoanAmount}
                          onChange={(val) => handleEligibilityInputChange("requestedLoanAmount", val || 0)}
                          style={{ width: "100%" }}
                          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        />
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: C.textSub, display: "block", marginBottom: 6 }}>Interest Rate (%)</label>
                        <Slider min={1} max={10} step={0.1} value={eligibilityInputs.interestRate} onChange={(val) => handleEligibilityInputChange("interestRate", val)} />
                        <span style={{ fontSize: 12, color: C.primary }}>{eligibilityInputs.interestRate}%</span>
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: C.textSub, display: "block", marginBottom: 6 }}>Tenure (Years)</label>
                        <InputNumber min={5} max={30} value={eligibilityInputs.tenureYears} onChange={(val) => handleEligibilityInputChange("tenureYears", val || 25)} style={{ width: "100%" }} />
                      </div>
                    </div>

                    {/* Right Side - LTV Result */}
                    <div style={{ background: C.grayLight, borderRadius: 12, padding: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>LTV Calculation</span>
                        <span style={{ fontSize: 11, color: C.textMuted }}>Max LTV: {ltvResult?.maxLTV || 85}%</span>
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8 }}>
                          <span>Property Value</span>
                          <strong>AED {eligibilityInputs.propertyValue?.toLocaleString() || 0}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8 }}>
                          <span>Requested Loan</span>
                          <strong>AED {eligibilityInputs.requestedLoanAmount?.toLocaleString() || 0}</strong>
                        </div>
                        <div style={{ height: 8, background: C.grayBord, borderRadius: 4, marginBottom: 6 }}>
                          <div style={{ width: `${Math.min(ltvResult?.ltv || 0, 100)}%`, height: "100%", borderRadius: 4, background: ltvResult?.status === "Eligible" ? C.green : ltvResult?.status === "Borderline" ? C.amber : C.red }} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                          <span>LTV: {ltvResult?.ltv || 0}%</span>
                          <span style={{ color: ltvResult?.status === "Eligible" ? C.green : ltvResult?.status === "Borderline" ? C.amber : C.red }}>{ltvResult?.status || "Pending"}</span>
                        </div>
                      </div>
                      <div style={{ marginTop: 12, padding: "10px 12px", background: eligibilityResult?.isEligible && ltvResult?.status === "Eligible" ? C.greenSoft : "#FFF3E0", borderRadius: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>Overall Eligibility:</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: eligibilityResult?.isEligible && ltvResult?.status === "Eligible" ? C.green : eligibilityResult?.status === "Borderline" || ltvResult?.status === "Borderline" ? C.amber : C.red }}>
                          {eligibilityResult?.isEligible && ltvResult?.status === "Eligible" ? "✓ ELIGIBLE" : "⚠️ NOT ELIGIBLE"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
                    <button
                      onClick={saveEligibilityToLead}
                      disabled={calculating}
                      style={{ padding: "10px 24px", background: calculating ? C.grayBord : `linear-gradient(135deg, ${C.primary}, ${C.primaryMid})`, color: calculating ? C.textMuted : "#fff", border: "none", borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: calculating ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8 }}
                    >
                      {calculating ? <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={14} />}
                      {calculating ? "Saving..." : "Save Eligibility to Lead"}
                    </button>
                  </div>
                </Section>

                {/* Commission Info Section */}
                <Section icon={DollarSign} title="Commission Information">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <DRow label="Commission Eligible" value={boolLabel(ci2.commissionEligible)} highlight={ci2.commissionEligible} />
                      <DRow label="Commission Status" value={show(ci2.commissionStatus)} />
                      <DRow label="Commission Amount" value={ci2.commissionAmount ? `AED ${fmt(ci2.commissionAmount)}` : null} />
                      <DRow label="Expected Commission" value={lead.expectedCommission ? `AED ${fmt(lead.expectedCommission)}` : null} />
                    </div>
                    <div>
                      <DRow label="Commission Tier" value={lead.commissionTier ? `${lead.commissionTier}%` : null} />
                      <DRow label="Loan Amount Range" value={show(lead.loanAmountRange)} />
                      <DRow label="Expected Payment Date" value={fmtDate(ci2.expectedPaymentDate)} />
                      <DRow label="Paid At" value={fmtDT(ci2.paidAt)} />
                    </div>
                  </div>
                </Section>
              </div>
            )}

            {/* ── STATUS TAB (simplified) ──────────────────────────────────── */}
            {activeTab === "status" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Section icon={ClipboardList} title="Update Lead Status">
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
                    {STATUS_OPTIONS.map((opt) => {
                      const cfg = STATUS_CFG[opt] || {};
                      const active = leadStatus === opt;
                      return (
                        <button key={opt} onClick={() => setLeadStatus(opt)}
                          style={{ padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1.5px solid ${active ? cfg.color || C.primary : C.grayBord}`, background: active ? cfg.bg || C.primarySoft : C.white, color: active ? cfg.color || C.primary : C.gray }}>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  <textarea value={statusNote} onChange={(e) => setStatusNote(e.target.value)} rows={3} placeholder="Add a note about this status change..." style={{ width: "100%", border: `1px solid ${C.grayBord}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 14 }} />
                  <button onClick={handleStatusUpdate} disabled={statusUpdating || !leadStatus} style={{ width: "100%", padding: "11px 0", borderRadius: 10, border: "none", fontWeight: 700, fontSize: 14, background: statusUpdating || !leadStatus ? C.grayBord : `linear-gradient(135deg, ${C.primary}, ${C.primaryMid})`, color: statusUpdating || !leadStatus ? C.textMuted : "#fff", cursor: statusUpdating || !leadStatus ? "not-allowed" : "pointer" }}>
                    {statusUpdating ? "Updating..." : "Update Status"}
                  </button>
                </Section>

                <Section icon={Clock} title="SLA Information">
                  <DRow label="SLA Breached" value={boolLabel(sla.breached)} highlight={!sla.breached} />
                  <DRow label="Deadline" value={fmtDT(sla.deadline)} expired={isSlaBreached} />
                  <DRow label="First Contact At" value={fmtDT(sla.firstContactAt)} />
                  <DRow label="Qualified At" value={fmtDT(sla.qualificationAt)} />
                  <DRow label="Reminders Sent" value={show(sla.reminderCount)} />
                </Section>
              </div>
            )}

            {/* ── SYSTEM TAB (simplified) ──────────────────────────────────── */}
            {activeTab === "system" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Section icon={Shield} title="System Information">
                  <DRow label="Lead ID" value={show(lead._id)} copy mono />
                  <DRow label="Customer ID" value={show(lead.customerId)} copy />
                  <DRow label="Version" value={lead.__v !== undefined ? `v${lead.__v}` : null} />
                  <DRow label="Created At" value={fmtDT(lead.createdAt)} />
                  <DRow label="Updated At" value={fmtDT(lead.updatedAt)} />
                  <DRow label="Deleted" value={boolLabel(lead.isDeleted)} highlight={!lead.isDeleted} />
                </Section>

                <Section icon={Activity} title="Lead Flags">
                  <FlagRow label="Advisor Assigned" value={!!(at.advisorId)} icon={User} />
                  <FlagRow label="SLA On Track" value={!sla.breached} icon={Clock} />
                  <FlagRow label="Commission Eligible" value={ci2.commissionEligible} icon={DollarSign} />
                  <FlagRow label="Converted to Case" value={cv.convertedToCase} icon={GitBranch} />
                  <FlagRow label="Is Duplicate" value={dup.isDuplicate} icon={Activity} invert />
                </Section>
              </div>
            )}
          </div>
        </div>

        {/* Document Preview Modal (same as before) */}
        {modalOpen && selectedDoc && (
          <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(2px)" }} onClick={(e) => { if (e.target === e.currentTarget) closeDocModal(); }}>
            <div style={{ background: C.white, borderRadius: 18, width: "100%", maxWidth: 960, maxHeight: "92vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 24px 80px rgba(0,0,0,0.25)" }}>
              <div style={{ height: 4, background: `linear-gradient(90deg, ${C.primary}, ${C.primaryMid})` }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${C.grayBord}` }}>
                <div><div style={{ fontWeight: 700, fontSize: 15 }}>{selectedDoc?.fileName || "Document Preview"}</div></div>
                <button onClick={closeDocModal} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20 }}>✕</button>
              </div>
              <div style={{ flex: 1, background: C.grayLight, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
                {modalLoading && <Spin size="large" />}
                {isPdf(selectedDoc.fileUrl) ? (
                  <iframe src={selectedDoc.fileUrl} style={{ width: "100%", height: 500, border: "none" }} onLoad={() => setModalLoading(false)} title="pdf" />
                ) : (
                  <img src={selectedDoc.fileUrl} alt="preview" style={{ maxHeight: 500, maxWidth: "100%", objectFit: "contain" }} onLoad={() => setModalLoading(false)} />
                )}
              </div>
              <div style={{ padding: "16px 20px", borderTop: `1px solid ${C.grayBord}` }}>
                {showRejectInput ? (
                  <div style={{ display: "flex", gap: 8 }}>
                    <input autoFocus value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Enter rejection reason..." style={{ flex: 1, padding: "9px 14px", border: `1px solid ${C.grayBord}`, borderRadius: 10 }} />
                    <button onClick={handleRejectDoc} disabled={rejecting || !rejectReason.trim()} style={{ padding: "9px 18px", borderRadius: 10, background: C.red, color: "#fff" }}>Reject</button>
                    <button onClick={() => { setShowRejectInput(false); setRejectReason(""); }} style={{ padding: "9px 14px", borderRadius: 10, border: `1px solid ${C.grayBord}`, background: C.white }}>Cancel</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                    <button onClick={() => setShowRejectInput(true)} style={{ padding: "9px 18px", borderRadius: 10, border: `1.5px solid ${C.redBord}`, background: C.redSoft, color: C.red, fontWeight: 700 }}>Reject</button>
                    <button onClick={handleVerifyDoc} disabled={verifying} style={{ padding: "9px 18px", borderRadius: 10, background: verifying ? C.grayBord : C.green, color: "#fff", fontWeight: 700 }}>{verifying ? "Verifying..." : "Verify Document"}</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal (same as before - simplified) */}
        {editModalOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 16px", backdropFilter: "blur(3px)", overflowY: "auto" }} onClick={(e) => { if (e.target === e.currentTarget && !editSaving) setEditModalOpen(false); }}>
            <div style={{ background: C.white, borderRadius: 20, width: "100%", maxWidth: 860, overflow: "hidden", marginBottom: 24 }} onClick={(e) => e.stopPropagation()}>
              <div style={{ height: 5, background: `linear-gradient(90deg, ${C.primary}, ${C.primaryMid})` }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: `1px solid ${C.grayBord}`, background: C.grayLight }}>
                <div><span style={{ fontSize: 15, fontWeight: 800 }}>Edit Lead</span></div>
                <button onClick={() => { if (!editSaving) setEditModalOpen(false); }} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={16} /></button>
              </div>
              <div style={{ padding: "24px", maxHeight: "70vh", overflowY: "auto" }}>
                <EditSection title="Customer Information" icon={User}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px" }}>
                    <EditField label="Full Name" value={editForm.fullName} onChange={(v) => handleEditChange("fullName", v)} />
                    <EditField label="Email" value={editForm.email} onChange={(v) => handleEditChange("email", v)} type="email" />
                    <EditField label="Mobile Number" value={editForm.mobileNumber} onChange={(v) => handleEditChange("mobileNumber", v)} />
                    <EditField label="Nationality" value={editForm.nationality} onChange={(v) => handleEditChange("nationality", v)} />
                    <EditField label="Monthly Salary (AED)" value={editForm.monthlySalary} onChange={(v) => handleEditChange("monthlySalary", v)} type="number" />
                    <EditField label="Employer" value={editForm.employer} onChange={(v) => handleEditChange("employer", v)} />
                  </div>
                </EditSection>
                <EditSection title="Property Details" icon={Home}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px" }}>
                    <EditField label="Property Type" value={editForm.propertyType} onChange={(v) => handleEditChange("propertyType", v)} />
                    <EditField label="Property Value (AED)" value={editForm.propertyValue} onChange={(v) => handleEditChange("propertyValue", v)} type="number" />
                    <EditField label="Loan Amount (AED)" value={editForm.loanAmountRequired} onChange={(v) => handleEditChange("loanAmountRequired", v)} type="number" />
                    <div style={{ gridColumn: "1 / -1" }}><EditField label="Area" value={editForm.area} onChange={(v) => handleEditChange("area", v)} /></div>
                  </div>
                </EditSection>
                <EditSection title="Loan Requirements" icon={Target}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px" }}>
                    <EditField label="Preferred Tenure (Years)" value={editForm.preferredTenureYears} onChange={(v) => handleEditChange("preferredTenureYears", v)} type="number" />
                    <EditField label="Preferred Rate Type" value={editForm.preferredInterestRateType} onChange={(v) => handleEditChange("preferredInterestRateType", v)} />
                  </div>
                  <EditToggle label="Fee Financing Preference" value={editForm.feeFinancingPreference} onChange={(v) => handleEditChange("feeFinancingPreference", v)} />
                </EditSection>
                <EditSection title="Notes" icon={MessageSquare}>
                  <EditField label="Notes to Xoto" value={editForm.notesToXoto} onChange={(v) => handleEditChange("notesToXoto", v)} multiline rows={3} />
                </EditSection>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "16px 24px", borderTop: `1px solid ${C.grayBord}`, background: C.grayLight }}>
                <button onClick={() => setEditModalOpen(false)} disabled={editSaving} style={{ padding: "10px 20px", borderRadius: 10, border: `1.5px solid ${C.grayBord}`, background: C.white }}>Cancel</button>
                <button onClick={handleEditSave} disabled={editSaving} style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: editSaving ? C.grayBord : `linear-gradient(135deg, ${C.primary}, ${C.primaryMid})`, color: "#fff", fontWeight: 700 }}>{editSaving ? "Saving..." : "Save Changes"}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ── Shared Sub-components ────────────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════════════

  function Section({ icon: Icon, title, children }) {
    return (
      <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.grayBord}`, overflow: "hidden" }}>
        <div style={{ padding: "13px 20px", background: C.grayLight, borderBottom: `1px solid ${C.grayBord}`, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: C.primarySoft, border: `1px solid ${C.primaryBord}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon size={14} color={C.primary} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{title}</span>
        </div>
        <div style={{ padding: "14px 20px" }}>{children}</div>
      </div>
    );
  }

  function DRow({ label, value, copy, highlight, expired }) {
    const [copied, setCopied] = useState(false);
    return (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.grayLight}` }}>
        <span style={{ fontSize: 12, color: C.gray, fontWeight: 500 }}>{label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: highlight ? 700 : 500, color: highlight ? C.green : expired ? C.red : C.text }}>{value}</span>
          {copy && value && (
            <button onClick={() => { navigator.clipboard.writeText(String(value)); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 3, color: copied ? C.green : C.textMuted }}>
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          )}
        </div>
      </div>
    );
  }

  function StatTile({ icon: Icon, label, value, color }) {
    return (
      <div style={{ background: C.white, borderRadius: 12, padding: "12px 14px", border: `1px solid ${C.grayBord}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={12} color={color} /></div>
          <span style={{ fontSize: 10, color: C.gray, fontWeight: 600, textTransform: "uppercase" }}>{label}</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{value}</div>
      </div>
    );
  }

  function StatusPill({ bg, color, label, dot }) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: bg, color }}>
        {dot && <span style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />}
        {label}
      </span>
    );
  }

  function InfoChip({ icon: Icon, value }) {
    return value ? (
      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.gray }}>
        <Icon size={13} color={C.textMuted} /> {value}
      </div>
    ) : null;
  }

  function EmptyNote({ msg }) {
    return <div style={{ display: "flex", alignItems: "center", gap: 7, color: C.textMuted, fontSize: 13, padding: "10px 0", fontStyle: "italic" }}><Info size={14} /> {msg}</div>;
  }

  function FlagRow({ label, value, icon: Icon, invert = false }) {
    const good = invert ? !value : value;
    return (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.grayLight}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.textSub }}>
          <Icon size={14} color={C.gray} /> {label}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, background: good ? C.greenSoft : C.redSoft }}>
          {good ? <CheckCircle size={12} color={C.green} /> : <XCircle size={12} color={C.red} />}
          <span style={{ fontSize: 11, fontWeight: 700, color: good ? C.green : C.red }}>{value ? "Yes" : "No"}</span>
        </div>
      </div>
    );
  }

  function EditSection({ title, icon: Icon, children }) {
    return (
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: `2px solid ${C.primaryBord}` }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: C.primarySoft, border: `1px solid ${C.primaryBord}`, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={13} color={C.primary} /></div>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{title}</span>
        </div>
        {children}
      </div>
    );
  }

  function EditField({ label, value, onChange, type = "text", multiline = false, rows = 2 }) {
    const style = { width: "100%", padding: "9px 12px", border: `1.5px solid ${C.grayBord}`, borderRadius: 9, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" };
    return (
      <div>
        <label style={{ fontSize: 11, fontWeight: 600, color: C.textSub, marginBottom: 5, display: "block" }}>{label}</label>
        {multiline ? <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} style={style} /> : <input type={type} value={value} onChange={(e) => onChange(e.target.value)} style={style} />}
      </div>
    );
  }

  function EditToggle({ label, value, onChange }) {
    return (
      <div onClick={() => onChange(!value)} style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "9px 14px", borderRadius: 10, border: `1.5px solid ${C.grayBord}`, cursor: "pointer", userSelect: "none" }}>
        <div style={{ width: 36, height: 20, borderRadius: 99, background: value ? C.primary : C.grayBord, position: "relative" }}>
          <div style={{ position: "absolute", top: 3, left: value ? 19 : 3, width: 14, height: 14, borderRadius: "50%", background: C.white, transition: "left .2s" }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span>
      </div>
    );
  }

  function DocCard({ doc, onView }) {
    const fileUrl = doc.fileUrl || doc.url || doc.documentUrl || doc.file_url;
    const fileName = doc.fileName || doc.file_name || doc.name || "Document";
    const status = doc.status || doc.verification_status;
    const sCfg = { Verified: { color: C.green, bg: C.greenSoft }, Rejected: { color: C.red, bg: C.redSoft }, Pending: { color: C.amber, bg: C.amberSoft } }[status] || { color: C.gray, bg: C.grayLight };
    return (
      <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.grayBord}`, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: C.primarySoft, display: "flex", alignItems: "center", justifyContent: "center" }}><FileText size={20} color={C.primary} /></div>
          <div><div style={{ fontWeight: 600, fontSize: 13 }}>{fileName}</div>{status && <span style={{ padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 700, background: sCfg.bg, color: sCfg.color, marginTop: 4, display: "inline-block" }}>{status}</span>}</div>
        </div>
        <button onClick={() => onView(doc)} disabled={!fileUrl} style={{ padding: "9px 0", background: fileUrl ? `linear-gradient(135deg, ${C.primary}, ${C.primaryMid})` : C.grayBord, color: fileUrl ? "#fff" : C.textMuted, border: "none", borderRadius: 9, fontWeight: 600, fontSize: 13, cursor: fileUrl ? "pointer" : "not-allowed" }}><Eye size={14} /> View Document</button>
      </div>
    );
  }