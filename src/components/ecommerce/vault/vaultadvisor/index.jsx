// src/pages/Leads/AdvisorMyLeads.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  Button, Tag, message, Space, DatePicker, Select, Input,
  Tooltip, Badge, Drawer, Modal, Form, Tabs, Progress, Alert
} from "antd";
import {
  EyeOutlined, SearchOutlined, FilterOutlined, ClearOutlined,
  ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined,
  UploadOutlined, PhoneOutlined, EditOutlined, ClockCircleOutlined,
  WarningOutlined, UserOutlined, FileTextOutlined, DollarOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../../../manageApi/utils/custom.apiservice";
import CustomTable from "../../../CMS/pages/custom/CustomTable";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

// ─── Brand ─────────────────────────────────────────────────────────────────
const P = "#5C039B";
const PM = "#7C3AED";
const PL = "#F5F0FF";
const PB = "#E9D5FF";

const roleSlugMap = {
  '0': 'superadmin', '1': 'admin', '2': "customer", '5': 'vendor-b2c',
  '6': 'vendor-b2b', '7': 'freelancer', '11': 'accountant', '12': 'supervisor',
  '15': "agency", '16': "agent", '17': "developer", '18': "vault-admin",
  '22': "vaultagent", '21': "vaultpartner", '26': "vault-advisor", '23': "vault-ops",
};

// ─── Static config ──────────────────────────────────────────────────────────
const STATUS_CFG = {
  "New": { color: "blue", bg: "#EFF6FF", text: "#1D4ED8", icon: <FileTextOutlined />, order: 0 },
  "Assigned": { color: "purple", bg: "#F5F0FF", text: "#6D28D9", icon: <UserOutlined />, order: 1 },
  "Contacted": { color: "orange", bg: "#FFF7ED", text: "#C2410C", icon: <PhoneOutlined />, order: 2 },
  "Qualified": { color: "geekblue", bg: "#EEF2FF", text: "#4338CA", icon: <CheckCircleOutlined />, order: 3 },
  "Documents Complete": { color: "cyan", bg: "#ECFEFF", text: "#0E7490", icon: <CheckCircleOutlined />, order: 5 },
  "Application Opened": { color: "volcano", bg: "#FFF5F3", text: "#C2410C", icon: <EditOutlined />, order: 6 },
  "Not Proceeding": { color: "red", bg: "#FEF2F2", text: "#B91C1C", icon: <CloseCircleOutlined />, order: 99 },
  "Disbursed": { color: "success", bg: "#ECFDF5", text: "#065F46", icon: <DollarOutlined />, order: 100 },
};

const SOURCE_CFG = {
  website: { color: "blue", label: "Website" },
  freelance_agent: { color: "purple", label: "Freelance Agent" },
  partner: { color: "green", label: "Partner" },
  admin: { color: "orange", label: "Admin" },
};

const STATUSES = Object.keys(STATUS_CFG);
const SOURCES = Object.keys(SOURCE_CFG);

const fmt = (n) => (n ? Number(n).toLocaleString("en-AE") : "—");
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB") : "—");
const cap = (s) => s ? s.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "";

const BUSINESS_HOURS_SLA_MS = 4 * 60 * 60 * 1000;

// Get SLA status display
const getSLAStatus = (assignedAt, currentStatus, slaDeadline) => {
  if (!assignedAt) return null;
  if (currentStatus === "Contacted") return { status: "completed", text: "✓ SLA Met", color: "#10B981" };
  
  const now = new Date();
  const deadline = slaDeadline ? new Date(slaDeadline) : new Date(new Date(assignedAt).getTime() + BUSINESS_HOURS_SLA_MS);
  const remaining = deadline - now;
  
  if (remaining < 0) {
    const overdue = Math.abs(Math.floor(remaining / (1000 * 60 * 60)));
    return { status: "breached", text: `Breached by ${overdue}h`, color: "#EF4444" };
  }
  
  const hoursLeft = Math.floor(remaining / (1000 * 60 * 60));
  const minutesLeft = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  
  if (remaining < 30 * 60 * 1000) {
    return { status: "urgent", text: `${hoursLeft}h ${minutesLeft}m left`, color: "#F59E0B" };
  }
  
  return { status: "on_track", text: `${hoursLeft}h ${minutesLeft}m left`, color: "#6B7280" };
};

// Get time remaining formatted
const getTimeRemaining = (assignedAt, slaDeadline) => {
  if (!assignedAt) return null;
  const deadline = slaDeadline ? new Date(slaDeadline) : new Date(new Date(assignedAt).getTime() + BUSINESS_HOURS_SLA_MS);
  const remaining = deadline - new Date();
  
  if (remaining <= 0) return "Expired";
  
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const INIT_FILTERS = { search: "", source: "", status: "", assigned: "", fromDate: "", toDate: "" };

// ══════════════════════════════════════════════════════════════════════════
const AdvisorLeads = () => {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const roleSlug = roleSlugMap[user?.role?.code] ?? "dashboard";

  // ─── Data state ─────────────────────────────────────────────────────────
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [activeTab, setActiveTab] = useState("assigned");

  // ─── Filter state ────────────────────────────────────────────────────────
  const [filters, setFilters] = useState(INIT_FILTERS);
  const [applied, setApplied] = useState(INIT_FILTERS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dateRange, setDateRange] = useState(null);

  // ─── Status update modal state ──────────────────────────────────────────
  const [statusModal, setStatusModal] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);
  const [statusNotes, setStatusNotes] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");

  const activeCount = Object.entries(applied).filter(([, v]) => v !== "" && v !== undefined).length;

  // Filter data based on active tab
  const filteredData = data.filter(lead => {
    if (activeTab === "assigned") return lead.currentStatus === "Assigned";
    if (activeTab === "contacted") return lead.currentStatus === "Contacted";
    if (activeTab === "qualified") return lead.currentStatus === "Qualified";
    if (activeTab === "collecting") return lead.currentStatus === "Collecting Documentation";
    if (activeTab === "disbursed") return lead.currentStatus === "Disbursed";
    if (activeTab === "all") return true;
    return true;
  });

  const stats = {
    assigned: data.filter(r => r.currentStatus === "Assigned").length,
    contacted: data.filter(r => r.currentStatus === "Contacted").length,
    qualified: data.filter(r => r.currentStatus === "Qualified").length,
    collecting: data.filter(r => r.currentStatus === "Collecting Documentation").length,
    disbursed: data.filter(r => r.currentStatus === "Disbursed").length,
    total: data.length
  };

  // ─── Fetch leads ─────────────────────────────────────────────────────────
  const fetchLeads = useCallback(async (page = currentPage, limit = itemsPerPage, f = applied) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit });
      if (f.search) params.set("search", f.search);
      if (f.source) params.set("source", f.source);
      if (f.status) params.set("status", f.status);
      if (f.assigned !== "") params.set("assigned", f.assigned);
      if (f.fromDate) params.set("fromDate", f.fromDate);
      if (f.toDate) params.set("toDate", f.toDate);

      const res = await apiService.get(`/vault/lead/advisor/my-leads?${params.toString()}`);
      const list = Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : [];
      const total = res?.data?.total || res?.data?.totalItems || res?.data?.count || list.length;
      setData(list);
      setTotalItems(total);
    } catch {
      message.error("Failed to load your leads.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, applied]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // Auto-refresh SLA timers every minute
  useEffect(() => {
    const interval = setInterval(() => {
      if (data.some(lead => lead.assignedTo?.advisorId && lead.currentStatus !== "Contacted")) {
        fetchLeads(currentPage, itemsPerPage, applied);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [data, currentPage, itemsPerPage, applied, fetchLeads]);

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setItemsPerPage(size);
    fetchLeads(page, size, applied);
  };

  const applyFilters = () => {
    setApplied({ ...filters });
    setCurrentPage(1);
    fetchLeads(1, itemsPerPage, filters);
    setDrawerOpen(false);
  };

  const resetFilters = () => {
    setFilters(INIT_FILTERS);
    setApplied(INIT_FILTERS);
    setDateRange(null);
    setCurrentPage(1);
    fetchLeads(1, itemsPerPage, INIT_FILTERS);
    setDrawerOpen(false);
  };

  const handleDateRange = (dates) => {
    setDateRange(dates);
    setFilters((prev) => ({
      ...prev,
      fromDate: dates?.[0] ? dates[0].format("YYYY-MM-DD") : "",
      toDate: dates?.[1] ? dates[1].format("YYYY-MM-DD") : "",
    }));
  };

  const handleSearchEnter = () => {
    const f = { ...applied, search: filters.search };
    setApplied(f);
    setCurrentPage(1);
    fetchLeads(1, itemsPerPage, f);
  };

  const handleViewDetail = (id) => {
    if (id) navigate(`/dashboard/${roleSlug}/vault/lead/${id}`);
    else message.warning("Lead ID not available");
  };

  const handleAddDocs = (leadId) => {
    if (!leadId) return message.warning("Lead ID not available");
    navigate(`/dashboard/advisor/leads/${leadId}/documents`);
  };

  // ─── Open status update modal ───────────────────────────────────────────
  const openStatusModal = (record, status) => {
    setStatusTarget(record);
    setSelectedStatus(status);
    setStatusNotes("");
    setStatusModal(true);
  };

  // ─── Handle Contact status update ────────────────────────────────────────
  const handleContactUpdate = async () => {
    if (!statusTarget?._id) return;

    setStatusLoading(true);
    try {
      const response = await apiService.put(
        `/vault/lead/advisor/lead/${statusTarget._id}/status`,
        {
          status: "Contacted",
          notes: statusNotes.trim() || undefined,
        }
      );

      const sla = response?.data?.data?.sla;
      if (sla?.breached) {
        message.warning(`Lead contacted but SLA was BREACHED! Response time: ${sla.responseTimeHours} hours`);
      } else {
        message.success(`Lead marked as Contacted! Response time: ${sla?.responseTimeHours || 0} hours (Within SLA ✅)`);
      }

      setStatusModal(false);
      setStatusTarget(null);
      setStatusNotes("");
      fetchLeads(currentPage, itemsPerPage, applied);

    } catch (err) {
      const errorMsg = err?.response?.data?.message || "Failed to update status";
      message.error(errorMsg);
    } finally {
      setStatusLoading(false);
    }
  };

  // ─── Handle Qualified status update (only after documents verified) ──────
  const handleQualifyUpdate = async () => {
    if (!statusTarget?._id) return;

    // Check document verification percentage
    const docProgress = getDocumentProgress(statusTarget);
    const isReadyForQualify = docProgress === 100;

    if (!isReadyForQualify) {
      message.error(`Cannot qualify: Document verification is only ${docProgress}% complete. Please upload all documents first.`);
      setStatusModal(false);
      return;
    }

    setStatusLoading(true);
    try {
      const response = await apiService.put(
        `/vault/lead/advisor/lead/${statusTarget._id}/status`,
        {
          status: "Qualified",
          notes: statusNotes.trim() || undefined,
        }
      );

      message.success(`Lead marked as Qualified! Customer account created.`);

      setStatusModal(false);
      setStatusTarget(null);
      setStatusNotes("");
      fetchLeads(currentPage, itemsPerPage, applied);

    } catch (err) {
      const errorMsg = err?.response?.data?.message || "Failed to update status";
      message.error(errorMsg);
    } finally {
      setStatusLoading(false);
    }
  };

  // Get document progress percentage
  const getDocumentProgress = (lead) => {
    const docCollection = lead?.documentCollection || {};
    return docCollection.collectionPercentage || 0;
  };

  // Get document verification status
  const getDocumentVerificationStatus = (lead) => {
    const docCollection = lead?.documentCollection || {};
    const uploaded = docCollection.documentsUploaded || 0;
    const total = docCollection.totalDocumentsRequired || 7;
    const verified = docCollection.documentsVerified || 0;
    
    return {
      percentage: docCollection.collectionPercentage || 0,
      uploaded,
      total,
      verified,
      isComplete: (docCollection.collectionPercentage || 0) === 100,
      isVerified: (docCollection.verificationPercentage || 0) === 100
    };
  };

  // ─── Table columns ─────────────────────────────────────────────────────────
  const columns = [
    {
      key: "customerInfo",
      title: "Client",
      width: 220,
      render: (_, r) => {
        const ci = r?.customerInfo || {};
        return (
          <div>
            <div style={{ fontWeight: 600, color: "#111827", fontSize: 13 }}>{ci.fullName || "—"}</div>
            {ci.email && <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>{ci.email}</div>}
            {ci.mobileNumber && <div style={{ fontSize: 11, color: "#6B7280" }}>{ci.mobileNumber}</div>}
          </div>
        );
      },
    },
    {
      key: "propertyDetails",
      title: "Property",
      width: 180,
      render: (_, r) => {
        const pd = r?.propertyDetails || {};
        const addr = [pd.propertyAddress?.building, pd.propertyAddress?.area, pd.propertyAddress?.city].filter(Boolean).join(", ");
        return (
          <div>
            <div style={{ fontSize: 13, color: "#374151" }}>
              {pd.propertyType || "—"}{pd.propertySubtype ? ` • ${pd.propertySubtype}` : ""}
            </div>
            {addr && <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{addr}</div>}
          </div>
        );
      },
    },
    {
      key: "loanAmount",
      title: "Loan Amount",
      width: 120,
      render: (_, r) => {
        const amt = r?.propertyDetails?.loanAmountRequired;
        return amt ? (
          <span style={{ fontWeight: 600, color: "#059669", fontSize: 13 }}>AED {fmt(amt)}</span>
        ) : <span style={{ color: "#D1D5DB" }}>—</span>;
      },
    },
    {
      key: "slaStatus",
      title: "SLA Status",
      width: 140,
      render: (_, r) => {
        const assigned = r?.assignedTo;
        if (!assigned?.advisorId) return <span style={{ color: "#9CA3AF" }}>—</span>;
        
        const slaInfo = getSLAStatus(assigned.assignedAt, r?.currentStatus, r?.sla?.deadline);
        const timeRemaining = getTimeRemaining(assigned.assignedAt, r?.sla?.deadline);
        
        if (!slaInfo) return <span style={{ color: "#9CA3AF" }}>—</span>;
        
        return (
          <Tooltip title={`Assigned: ${new Date(assigned.assignedAt).toLocaleString()}\nDeadline: ${new Date(r?.sla?.deadline).toLocaleString()}`}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {slaInfo.status === "breached" && <WarningOutlined style={{ color: slaInfo.color }} />}
              {slaInfo.status === "urgent" && <ClockCircleOutlined style={{ color: slaInfo.color }} />}
              {slaInfo.status === "on_track" && <ClockCircleOutlined style={{ color: slaInfo.color }} />}
              {slaInfo.status === "completed" && <CheckCircleOutlined style={{ color: slaInfo.color }} />}
              <span style={{ fontSize: 11, color: slaInfo.color, fontWeight: slaInfo.status === "breached" ? 600 : 400 }}>
                {slaInfo.status === "breached" ? "BREACHED" : timeRemaining}
              </span>
            </div>
          </Tooltip>
        );
      },
    },
    {
      key: "documentProgress",
      title: "Documents",
      width: 140,
      render: (_, r) => {
        const docStatus = getDocumentVerificationStatus(r);
        const isReady = docStatus.isComplete;
        
        return (
          <div style={{ width: "100%" }}>
            <Tooltip title={`${docStatus.uploaded}/${docStatus.total} documents uploaded`}>
              <Progress 
                percent={docStatus.percentage} 
                size="small" 
                strokeColor={docStatus.isComplete ? "#10B981" : P} 
                format={(percent) => `${percent}%`}
              />
            </Tooltip>
            <div style={{ fontSize: 10, color: "#9CA3AF", textAlign: "center", marginTop: 2 }}>
              {docStatus.uploaded}/{docStatus.total} uploaded
              {docStatus.isComplete && <CheckCircleOutlined style={{ color: "#10B981", marginLeft: 4 }} />}
            </div>
          </div>
        );
      },
    },
    {
      key: "currentStatus",
      title: "Status",
      width: 140,
      render: (_, r) => {
        const val = r?.currentStatus;
        if (!val) return <span style={{ color: "#D1D5DB" }}>—</span>;
        const cfg = STATUS_CFG[val] || { bg: "#F3F4F6", text: "#374151", icon: <FileTextOutlined /> };
        return (
          <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.text, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 6 }}>
            {cfg.icon} {val}
          </span>
        );
      },
    },
    {
      key: "referralType",
      title: "Referral Type",
      width: 120,
      render: (_, r) => {
        const type = r?.referralType || "—";
        const isReferralOnly = type === "Referral Only";
        return (
          <Tag color={isReferralOnly ? "green" : "purple"} style={{ borderRadius: 20 }}>
            {type}
          </Tag>
        );
      },
    },
    {
      key: "createdAt",
      title: "Created",
      width: 100,
      render: (_, r) => <div style={{ fontSize: 11, color: "#6B7280" }}>{fmtDate(r?.createdAt)}</div>,
    },
    {
      key: "actions",
      title: "Actions",
      width: 200,
      align: "center",
      fixed: "right",
      render: (_, r) => {
        const leadId = r?._id;
        const currentStatus = r?.currentStatus;
        const docStatus = getDocumentVerificationStatus(r);
        const canQualify = docStatus.isComplete && currentStatus === "Contacted";
        const canContact = currentStatus === "Assigned";
        
        return (
          <Space size={4} wrap>
            <Tooltip title="View Details">
              <Button type="text" icon={<EyeOutlined />} onClick={() => handleViewDetail(leadId)} style={{ color: P }} size="small">
                View
              </Button>
            </Tooltip>

            {/* Contact Button - Only for Assigned leads */}
            {canContact && (
              <Tooltip title="Mark lead as Contacted (starts document collection)">
                <Button
                  size="small"
                  icon={<PhoneOutlined />}
                  onClick={() => openStatusModal(r, "Contacted")}
                  style={{
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#C2410C",
                    borderColor: "#FED7AA",
                    background: "#FFF7ED",
                  }}
                >
                  Contact
                </Button>
              </Tooltip>
            )}

            {/* Qualify Button - Only for Contacted leads with 100% documents */}
            {currentStatus === "Contacted" && (
              <Tooltip 
                title={!canQualify 
                  ? `Cannot qualify: Document collection is only ${docStatus.percentage}% complete. Please upload all documents first.` 
                  : "Mark lead as Qualified (after all documents verified)"}
              >
                <Button
                  size="small"
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => canQualify && openStatusModal(r, "Qualified")}
                  disabled={!canQualify}
                  style={{
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    background: canQualify ? "#4338CA" : "#9CA3AF",
                    borderColor: canQualify ? "#4338CA" : "#9CA3AF",
                    opacity: canQualify ? 1 : 0.6,
                  }}
                >
                  Qualify
                </Button>
              </Tooltip>
            )}

            {/* Add Docs button - Only for Referral Only leads in Contacted status */}
            {r?.referralType === "Referral Only" && currentStatus === "Contacted" && (
              <Tooltip title="Upload Documents for this Lead">
                <Button
                  size="small"
                  icon={<UploadOutlined />}
                  onClick={() => handleAddDocs(leadId)}
                  style={{ background: P, borderColor: P, borderRadius: 6, fontWeight: 600, fontSize: 11, color: "white" }}
                >
                  Add Docs
                </Button>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ background: "#F4F0FA", minHeight: "100vh", padding: "28px 24px", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .vll-input .ant-input, .vll-select .ant-select-selector, .vll-date .ant-picker { border-radius: 10px !important; border-color: #E8DFF5 !important; font-size: 13px; }
        .vll-input .ant-input:focus, .vll-select .ant-select-focused .ant-select-selector, .vll-date .ant-picker-focused { border-color: ${P} !important; box-shadow: 0 0 0 3px rgba(92,3,155,0.1) !important; }
        .vll-pill { cursor: pointer; border-radius: 20px; padding: 5px 14px; font-size: 12px; font-weight: 500; border: 1.5px solid transparent; transition: all .15s; }
        .vll-pill:hover { border-color: ${P}; }
        .vll-pill.active { background: ${PL}; border-color: ${P}; color: ${P}; }
        .vll-table .ant-table-thead > tr > th { background: #FAF8FF !important; color: ${P} !important; font-weight: 700 !important; border-bottom: 1px solid #EDE4FF !important; font-size: 12px !important; }
        .vll-table .ant-table-tbody > tr:hover > td { background: #F5F0FF !important; }
        .vll-table .ant-table-tbody > tr > td { border-bottom: 1px solid #F5F0FF; }
        .vll-table .ant-pagination-item-active { border-color: ${P} !important; background: ${P} !important; }
        .vll-table .ant-pagination-item-active a { color: white !important; }
        .vll-drawer .ant-drawer-header { background: linear-gradient(135deg, #2D0058, #5B1AA0); }
        .vll-drawer .ant-drawer-title { color: white !important; font-weight: 700 !important; }
        .vll-drawer .ant-drawer-close { color: rgba(255,255,255,0.8) !important; }
        .vll-stat:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(92,3,155,0.1) !important; }
        .ant-tabs-tab-active { color: ${P} !important; }
        .ant-tabs-ink-bar { background: ${P} !important; }
      `}</style>

      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1a0533", margin: 0 }}>My Leads</h1>
          <p style={{ fontSize: 13, color: "#8B7BAE", margin: "3px 0 0" }}>
            Your assigned mortgage pipeline — {loading ? "loading..." : `${totalItems.toLocaleString()} lead${totalItems !== 1 ? "s" : ""} total`}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Button icon={<ReloadOutlined />} onClick={() => fetchLeads(currentPage, itemsPerPage, applied)} loading={loading}
            style={{ borderRadius: 10, borderColor: "#E8DFF5", color: P }} />
          <Badge count={activeCount} color={P} size="small">
            <Button icon={<FilterOutlined />} onClick={() => setDrawerOpen(true)}
              style={{ borderRadius: 10, background: activeCount > 0 ? PL : "white", borderColor: activeCount > 0 ? P : "#E8DFF5", color: activeCount > 0 ? P : "#374151", fontWeight: activeCount > 0 ? 700 : 400 }}>
              Filters{activeCount > 0 ? ` (${activeCount})` : ""}
            </Button>
          </Badge>
          {activeCount > 0 && (
            <Button icon={<ClearOutlined />} onClick={resetFilters}
              style={{ borderRadius: 10, borderColor: "#FECACA", color: "#DC2626", background: "#FEF2F2" }}>
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* SLA DISCLAIMER - Shows on Assigned Tab only */}
      {activeTab === "assigned" && (
        <Alert
          message={
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <InfoCircleOutlined style={{ fontSize: 18, color: P }} />
              <span>
                <strong>SLA Requirement:</strong> Each assigned lead <strong>MUST be contacted within 4 hours</strong> of assignment. 
                Click <strong>"Contact"</strong> after contacting the customer, then upload documents, then <strong>"Qualify"</strong> when documents are 100% complete.
              </span>
            </div>
          }
          type="info"
          showIcon={false}
          style={{ 
            marginBottom: 16, 
            borderRadius: 12, 
            background: PL, 
            border: `1px solid ${PB}`,
            color: "#1a0533"
          }}
        />
      )}

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 18 }}>
        <div className="vll-stat" style={{ background: "white", borderRadius: 14, padding: "14px 18px", border: "1px solid #EDE9F6" }}>
          <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700 }}>Assigned</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#6D28D9", lineHeight: 1 }}>{stats.assigned}</div>
          <div style={{ fontSize: 11, color: "#9CA3AF" }}>needs contact</div>
        </div>
        <div className="vll-stat" style={{ background: "white", borderRadius: 14, padding: "14px 18px", border: "1px solid #EDE9F6" }}>
          <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700 }}>Contacted</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#C2410C", lineHeight: 1 }}>{stats.contacted}</div>
          <div style={{ fontSize: 11, color: "#9CA3AF" }}>needs documents</div>
        </div>
        <div className="vll-stat" style={{ background: "white", borderRadius: 14, padding: "14px 18px", border: "1px solid #EDE9F6" }}>
          <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700 }}>Qualified</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#4338CA", lineHeight: 1 }}>{stats.qualified}</div>
          <div style={{ fontSize: 11, color: "#9CA3AF" }}>ready for proposal</div>
        </div>
        <div className="vll-stat" style={{ background: "white", borderRadius: 14, padding: "14px 18px", border: "1px solid #EDE9F6" }}>
          <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700 }}>Collecting Docs</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#166534", lineHeight: 1 }}>{stats.collecting}</div>
          <div style={{ fontSize: 11, color: "#9CA3AF" }}>in progress</div>
        </div>
        <div className="vll-stat" style={{ background: "white", borderRadius: 14, padding: "14px 18px", border: "1px solid #EDE9F6" }}>
          <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700 }}>Disbursed</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#059669", lineHeight: 1 }}>{stats.disbursed}</div>
          <div style={{ fontSize: 11, color: "#9CA3AF" }}>completed</div>
        </div>
        <div className="vll-stat" style={{ background: "white", borderRadius: 14, padding: "14px 18px", border: "1px solid #EDE9F6" }}>
          <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700 }}>Total</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: P, lineHeight: 1 }}>{stats.total}</div>
          <div style={{ fontSize: 11, color: "#9CA3AF" }}>all leads</div>
        </div>
      </div>

      {/* Tabs for Lead Status */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginBottom: 16 }} className="custom-tabs">
        <TabPane tab={<span><Badge count={stats.assigned} style={{ backgroundColor: P }} /> Assigned</span>} key="assigned" />
        <TabPane tab={<span><Badge count={stats.contacted} /> Contacted</span>} key="contacted" />
        <TabPane tab={<span><Badge count={stats.qualified} /> Qualified</span>} key="qualified" />
        <TabPane tab={<span><Badge count={stats.collecting} /> Collecting Docs</span>} key="collecting" />
        <TabPane tab={<span><Badge count={stats.disbursed} /> Disbursed</span>} key="disbursed" />
        <TabPane tab={<span><Badge count={stats.total} /> All</span>} key="all" />
      </Tabs>

      {/* Quick Search */}
      <div style={{ background: "white", borderRadius: 14, border: "1px solid #EDE9F6", padding: "14px 18px", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div className="vll-input" style={{ flex: 1, minWidth: 220 }}>
            <Input
              prefix={<SearchOutlined style={{ color: P }} />}
              placeholder="Search name, email, phone..."
              value={filters.search}
              onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
              onPressEnter={handleSearchEnter}
              allowClear
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="vll-table" style={{ background: "white", borderRadius: 16, border: "1px solid #EDE9F6", overflow: "hidden" }}>
        <CustomTable
          columns={columns}
          data={filteredData}
          loading={loading}
          totalItems={filteredData.length}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          showSearch={false}
        />
      </div>

      {/* Filter Drawer */}
      <Drawer
        className="vll-drawer"
        title="Filter My Leads"
        placement="right"
        width={360}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        extra={<Button size="small" onClick={resetFilters} style={{ color: "#DC2626", borderColor: "#FECACA", background: "#FEF2F2", borderRadius: 8 }}>Reset All</Button>}
        footer={
          <div style={{ display: "flex", gap: 10 }}>
            <Button onClick={() => setDrawerOpen(false)} style={{ flex: 1, borderRadius: 10 }}>Cancel</Button>
            <Button type="primary" onClick={applyFilters}
              style={{ flex: 2, background: `linear-gradient(135deg, #2D0058, ${PM})`, border: "none", borderRadius: 10, fontWeight: 600 }}>
              Apply Filters {activeCount > 0 ? `(${activeCount})` : ""}
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <FilterGroup label="Search" icon="🔍" hint="Name, email, or phone">
            <Input placeholder="e.g. Ahmed" value={filters.search} onChange={(e) => setFilters(p => ({ ...p, search: e.target.value }))} />
          </FilterGroup>
          <FilterGroup label="Lead Source" icon="📡" hint="Where the lead came from">
            <Select style={{ width: "100%" }} placeholder="All Sources" value={filters.source || undefined} onChange={(v) => setFilters(p => ({ ...p, source: v || "" }))} allowClear>
              {SOURCES.map(s => <Option key={s} value={s}>{SOURCE_CFG[s]?.label || s}</Option>)}
            </Select>
          </FilterGroup>
          <FilterGroup label="Date Range" icon="📅" hint="Filter by lead creation date">
            <RangePicker style={{ width: "100%" }} value={dateRange} onChange={handleDateRange} format="DD MMM YYYY" />
          </FilterGroup>
        </div>
      </Drawer>

      {/* Status Update Modal - Contact */}
      <Modal
        open={statusModal && selectedStatus === "Contacted"}
        onCancel={() => !statusLoading && setStatusModal(false)}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#FFF7ED", border: "1px solid #C2410C", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PhoneOutlined style={{ color: "#C2410C", fontSize: 18 }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>Mark as Contacted</div>
              {statusTarget && (
                <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
                  {statusTarget.customerInfo?.fullName || "—"} • {statusTarget.customerInfo?.mobileNumber || ""}
                </div>
              )}
            </div>
          </div>
        }
        footer={[
          <Button key="cancel" onClick={() => setStatusModal(false)} disabled={statusLoading}>Cancel</Button>,
          <Button
            key="submit"
            type="primary"
            loading={statusLoading}
            onClick={handleContactUpdate}
            style={{ background: "#C2410C", borderColor: "#C2410C", borderRadius: 8, fontWeight: 600 }}
            icon={<PhoneOutlined />}
          >
            Confirm — Contacted
          </Button>,
        ]}
        centered
        width={500}
        destroyOnClose
      >
        {/* Lead Summary */}
        {statusTarget && (
          <div style={{ background: "#F9F6FF", borderRadius: 12, padding: "16px", marginBottom: 20, border: `1px solid ${PB}` }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px" }}>
              <div>
                <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase" }}>Client Name</div>
                <div style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>{statusTarget.customerInfo?.fullName || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase" }}>Mobile</div>
                <div style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>{statusTarget.customerInfo?.mobileNumber || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase" }}>Property Value</div>
                <div style={{ fontSize: 14, color: "#059669", fontWeight: 600 }}>AED {fmt(statusTarget.propertyDetails?.propertyValue)}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase" }}>Current Status</div>
                <div>
                  <span style={{ padding: "2px 8px", borderRadius: 12, fontSize: 11, background: STATUS_CFG[statusTarget.currentStatus]?.bg, color: STATUS_CFG[statusTarget.currentStatus]?.text }}>
                    {statusTarget.currentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLA Warning for Contact */}
        {statusTarget?.assignedTo && (
          (() => {
            const slaInfo = getSLAStatus(statusTarget.assignedTo.assignedAt, statusTarget.currentStatus, statusTarget.sla?.deadline);
            const isBreached = slaInfo?.status === "breached";
            return isBreached ? (
              <div style={{ background: "#FEF2F2", borderRadius: 10, padding: "12px", marginBottom: 16, border: "1px solid #FECACA" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <WarningOutlined style={{ color: "#DC2626" }} />
                  <span style={{ fontSize: 12, color: "#991B1B" }}>
                    ⚠️ SLA ALERT: This lead is already overdue! Marking as contacted will record a breach.
                  </span>
                </div>
              </div>
            ) : null;
          })()
        )}

        {/* Notes Input */}
        <div style={{ marginBottom: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
            Contact Notes <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(optional but recommended)</span>
          </label>
        </div>
        <TextArea
          rows={4}
          value={statusNotes}
          onChange={(e) => setStatusNotes(e.target.value)}
          placeholder="e.g., Customer contacted. Interested in 2M AED loan, 25 years fixed rate. Will send documents tomorrow."
          maxLength={500}
          showCount
          style={{ borderRadius: 10, borderColor: "#E8DFF5" }}
        />
      </Modal>

      {/* Status Update Modal - Qualified (Only after 100% documents) */}
      <Modal
        open={statusModal && selectedStatus === "Qualified"}
        onCancel={() => !statusLoading && setStatusModal(false)}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#EEF2FF", border: "1px solid #4338CA", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircleOutlined style={{ color: "#4338CA", fontSize: 18 }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>Mark as Qualified</div>
              {statusTarget && (
                <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
                  {statusTarget.customerInfo?.fullName || "—"} • {statusTarget.customerInfo?.mobileNumber || ""}
                </div>
              )}
            </div>
          </div>
        }
        footer={[
          <Button key="cancel" onClick={() => setStatusModal(false)} disabled={statusLoading}>Cancel</Button>,
          <Button
            key="submit"
            type="primary"
            loading={statusLoading}
            onClick={handleQualifyUpdate}
            style={{ background: "#4338CA", borderColor: "#4338CA", borderRadius: 8, fontWeight: 600 }}
            icon={<CheckCircleOutlined />}
          >
            Confirm — Qualify Lead
          </Button>,
        ]}
        centered
        width={500}
        destroyOnClose
      >
        {/* Lead Summary */}
        {statusTarget && (
          <div style={{ background: "#F9F6FF", borderRadius: 12, padding: "16px", marginBottom: 20, border: `1px solid ${PB}` }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px" }}>
              <div>
                <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase" }}>Client Name</div>
                <div style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>{statusTarget.customerInfo?.fullName || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase" }}>Mobile</div>
                <div style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>{statusTarget.customerInfo?.mobileNumber || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase" }}>Property Value</div>
                <div style={{ fontSize: 14, color: "#059669", fontWeight: 600 }}>AED {fmt(statusTarget.propertyDetails?.propertyValue)}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase" }}>Current Status</div>
                <div>
                  <span style={{ padding: "2px 8px", borderRadius: 12, fontSize: 11, background: STATUS_CFG[statusTarget.currentStatus]?.bg, color: STATUS_CFG[statusTarget.currentStatus]?.text }}>
                    {statusTarget.currentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Document Verification Status */}
        {statusTarget && (
          <div style={{ background: getDocumentProgress(statusTarget) === 100 ? "#F0FDF4" : "#FEF3C7", borderRadius: 10, padding: "12px", marginBottom: 16, border: `1px solid ${getDocumentProgress(statusTarget) === 100 ? "#BBF7D0" : "#FDE68A"}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {getDocumentProgress(statusTarget) === 100 ? (
                <CheckCircleOutlined style={{ color: "#10B981" }} />
              ) : (
                <WarningOutlined style={{ color: "#D97706" }} />
              )}
              <span style={{ fontSize: 12, color: getDocumentProgress(statusTarget) === 100 ? "#065F46" : "#92400E" }}>
                {getDocumentProgress(statusTarget) === 100 
                  ? "✅ All documents have been uploaded and verified. Lead is ready for qualification!" 
                  : `⚠️ Document collection is only ${getDocumentProgress(statusTarget)}% complete. Please upload all documents before qualifying.`
                }
              </span>
            </div>
          </div>
        )}

        {/* Notes Input */}
        <div style={{ marginBottom: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
            Qualification Notes <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(optional)</span>
          </label>
        </div>
        <TextArea
          rows={4}
          value={statusNotes}
          onChange={(e) => setStatusNotes(e.target.value)}
          placeholder="e.g., Customer qualified. Monthly income 35k AED. Eligible for loan up to 1.5M AED. Customer agreed to proceed."
          maxLength={500}
          showCount
          style={{ borderRadius: 10, borderColor: "#E8DFF5" }}
        />
      </Modal>
    </div>
  );
};

export default AdvisorLeads;

// Filter Group helper
function FilterGroup({ label, icon, hint, children }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <div>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#6B21A8", textTransform: "uppercase", letterSpacing: ".5px" }}>{label}</span>
          {hint && <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 1 }}>{hint}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}