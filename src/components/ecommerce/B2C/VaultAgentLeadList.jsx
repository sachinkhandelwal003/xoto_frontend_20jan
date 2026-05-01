// src/pages/Leads/VaultAgentLeadList.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Button, Tag, message, Space, DatePicker, Select, Input, Tooltip, Badge, Drawer, Modal, Avatar } from "antd";
import {
  EyeOutlined, UploadOutlined, SearchOutlined, FilterOutlined,
  ClearOutlined, ReloadOutlined, UserOutlined, CheckCircleOutlined,
  CloseCircleOutlined, TeamOutlined, UserAddOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import CustomTable from "../../../components/CMS/pages/custom/CustomTable";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Option }      = Select;

// ─── Brand ─────────────────────────────────────────────────────────────────
const P  = "#5C039B";
const PM = "#7C3AED";
const PL = "#F5F0FF";
const PB = "#E9D5FF";

// ─── Static config ──────────────────────────────────────────────────────────
const STATUS_CFG = {
  New                        : { color: "blue",    bg: "#EFF6FF", text: "#1D4ED8" },
  Assigned                   : { color: "purple",  bg: "#F5F0FF", text: "#6D28D9" },
  Contacted                  : { color: "orange",  bg: "#FFF7ED", text: "#C2410C" },
  Qualified                  : { color: "geekblue",bg: "#EEF2FF", text: "#4338CA" },
  "Collecting Documentation" : { color: "green",   bg: "#F0FDF4", text: "#166534" },
  "Documents Complete"       : { color: "cyan",    bg: "#ECFEFF", text: "#0E7490" },
  "Application Opened"       : { color: "volcano", bg: "#FFF5F3", text: "#C2410C" },
  "Not Proceeding"           : { color: "red",     bg: "#FEF2F2", text: "#B91C1C" },
  Disbursed                  : { color: "success", bg: "#ECFDF5", text: "#065F46" },
};

const SOURCE_CFG = {
  website        : { color: "blue",   label: "Website"        },
  freelance_agent: { color: "purple", label: "Freelance Agent" },
  partner        : { color: "green",  label: "Partner"        },
  admin          : { color: "orange", label: "Admin"          },
};

const STATUSES = Object.keys(STATUS_CFG);
const SOURCES  = Object.keys(SOURCE_CFG);

const fmt     = (n) => (n ? Number(n).toLocaleString("en-AE") : "—");
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB") : "—");
const cap     = (s) => s ? s.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "";

// ─── Initial filter state ───────────────────────────────────────────────────
const INIT_FILTERS = {
  search    : "",
  source    : "",
  status    : "",
  agentId   : "",
  advisorId : "",
  assigned  : "",
  fromDate  : "",
  toDate    : "",
};

// ══════════════════════════════════════════════════════════════════════════
const VaultAgentLeadList = () => {
  const { user }   = useSelector((s) => s.auth);
  const navigate   = useNavigate();

  // ─── Data state ─────────────────────────────────────────────────────────
  const [data,         setData]         = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [totalItems,   setTotalItems]   = useState(0);
  const [currentPage,  setCurrentPage]  = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // ─── Filter state ────────────────────────────────────────────────────────
  const [filters,    setFilters]    = useState(INIT_FILTERS);
  const [applied,    setApplied]    = useState(INIT_FILTERS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dateRange,  setDateRange]  = useState(null);

  // ─── Advisor / Agent dropdown lists ─────────────────────────────────────
  const [advisors, setAdvisors] = useState([]);
  const [agents,   setAgents]   = useState([]);

  // ─── Assign Modal state ──────────────────────────────────────────────────
  const [assignModal,      setAssignModal]      = useState(false);
  const [assignTarget,     setAssignTarget]     = useState(null);   // { leadId, clientName }
  const [selectedAdvisor,  setSelectedAdvisor]  = useState(null);   // advisorId string
  const [assignLoading,    setAssignLoading]    = useState(false);

  // Active filter count
  const activeCount = Object.entries(applied).filter(([, v]) => v !== "" && v !== undefined).length;

  // ─── Fetch leads ─────────────────────────────────────────────────────────
  const fetchLeads = useCallback(async (page = currentPage, limit = itemsPerPage, f = applied) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit });
      if (f.search)    params.set("search",    f.search);
      if (f.source)    params.set("source",    f.source);
      if (f.status)    params.set("status",    f.status);
      if (f.agentId)   params.set("agentId",   f.agentId);
      if (f.advisorId) params.set("advisorId", f.advisorId);
      if (f.assigned !== "") params.set("assigned", f.assigned);
      if (f.fromDate)  params.set("fromDate",  f.fromDate);
      if (f.toDate)    params.set("toDate",    f.toDate);

      const res   = await apiService.get(`/vault/lead/admin/all?${params.toString()}`);
      const list  = Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : [];
      const total = res?.data?.total || res?.data?.totalItems || res?.data?.count || list.length;
      setData(list);
      setTotalItems(total);
    } catch {
      message.error("Failed to load vault leads.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, applied]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // ─── Fetch dropdown options ──────────────────────────────────────────────
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [advRes, agentRes] = await Promise.all([
          apiService.get("/vault/advisor/all?limit=100"),
          apiService.get("/vault/agent/admin/all-agents?limit=100"),
        ]);
        const advList   = advRes?.data?.data   || advRes?.data   || [];
        const agentList = agentRes?.data?.data || agentRes?.data || [];
        setAdvisors(Array.isArray(advList)   ? advList   : []);
        setAgents(Array.isArray(agentList)   ? agentList : []);
      } catch (err) {
        
      }
    };
    fetchDropdowns();
  }, []);

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

  const quickStatus = (status) => {
    const f = { ...INIT_FILTERS, status };
    setFilters(f); setApplied(f);
    setCurrentPage(1);
    fetchLeads(1, itemsPerPage, f);
  };

  const handleDateRange = (dates) => {
    setDateRange(dates);
    setFilters((prev) => ({
      ...prev,
      fromDate: dates?.[0] ? dates[0].format("YYYY-MM-DD") : "",
      toDate  : dates?.[1] ? dates[1].format("YYYY-MM-DD") : "",
    }));
  };

  const handleSearchEnter = () => {
    const f = { ...applied, search: filters.search };
    setApplied(f); setCurrentPage(1);
    fetchLeads(1, itemsPerPage, f);
  };

  const handleViewDetail = (id) => {
    if (id) navigate(`/dashboard/vaultagentlead-admin-detail/vault/lead/${id}`);
    else message.warning("Lead ID not available");
  };

  const handleUploadDocs = (id) => {
    if (!id) { message.warning("Lead ID not available"); return; }
    navigate(`/dashboard/vaultagent/vault/lead/documents/${id}`);
  };

  // ── Open assign modal ───────────────────────────────────────────────────
  const openAssign = (record) => {
    const leadId     = record?._id || record?.leadId;
    const clientName = record?.customerInfo?.fullName || "this lead";
    // Pre-select already assigned advisor if any
    const existingAdvisorId = record?.assignedAdvisor?._id || record?.advisorId || null;
    setAssignTarget({ leadId, clientName });
    setSelectedAdvisor(existingAdvisorId);
    setAssignModal(true);
  };

  // ── Confirm assign ──────────────────────────────────────────────────────
  const handleAssign = async () => {
    if (!selectedAdvisor) {
      message.warning("Please select an advisor first");
      return;
    }
    setAssignLoading(true);
    try {
      await apiService.post("/vault/lead/admin/assign-to-advisor", {
        leadId    : assignTarget.leadId,
        advisorId : selectedAdvisor,
      });
      message.success(`Lead assigned successfully!`);
      setAssignModal(false);
      setSelectedAdvisor(null);
      setAssignTarget(null);
      fetchLeads(currentPage, itemsPerPage, applied);
    } catch (err) {
      message.error(err?.response?.data?.message || "Assignment failed");
    } finally {
      setAssignLoading(false);
    }
  };

  // ─── Table columns ────────────────────────────────────────────────────────
  const columns = [
    {
      key  : "customerInfo",
      title: "Client",
      render: (_, r) => {
        const ci = r?.customerInfo || {};
        return (
          <div>
            <div style={{ fontWeight: 600, color: "#111827", fontSize: 13 }}>{ci.fullName || "—"}</div>
            {ci.email        && <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>{ci.email}</div>}
            {ci.mobileNumber && <div style={{ fontSize: 11, color: "#6B7280" }}>{ci.mobileNumber}</div>}
          </div>
        );
      },
    },
    {
      key  : "propertyDetails",
      title: "Property",
      render: (_, r) => {
        const pd   = r?.propertyDetails || {};
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
    // {
    //   key  : "loanAmountRequired",
    //   title: "Loan Amount",
    //   render: (_, r) => {
    //     const amt = r?.propertyDetails?.loanAmountRequired;
    //     return amt
    //       ? <span style={{ fontWeight: 600, color: "#059669", fontSize: 13 }}>AED {fmt(amt)}</span>
    //       : <span style={{ color: "#D1D5DB" }}>—</span>;
    //   },
    // },
    {
      key  : "referralType",
      title: "Referral Type",
      render: (_, r) => {
        const type  = r?.referralType || "—";
        const lower = type.toLowerCase();
        const color = lower.includes("referral only") ? "green" : lower.includes("docs") ? "purple" : "default";
        return <Tag color={color} style={{ borderRadius: 20, fontWeight: 500 }}>{type}</Tag>;
      },
    },
    {
      key  : "source",
      title: "Source",
      render: (_, r) => {
        const src = r?.sourceInfo?.source;
        if (!src) return <span style={{ color: "#D1D5DB" }}>—</span>;
        const cfg = SOURCE_CFG[src] || { color: "default", label: cap(src) };
        return <Tag color={cfg.color} style={{ borderRadius: 20, fontWeight: 500 }}>{cfg.label}</Tag>;
      },
    },
    {
  key: "assignedAdvisor",
  title: "Assigned Advisor",
  render: (_, r) => {
    const assigned = r?.assignedTo;
    const name = assigned?.advisorName;
    const isAssigned = !!assigned?.advisorId;

    if (isAssigned) {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar size={26} icon={<UserOutlined />} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>
              {name || "Assigned"}
            </div>
            <div style={{ fontSize: 10, color: "#10B981", fontWeight: 600 }}>
              ● Assigned
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Avatar size={26} icon={<UserOutlined />} />
        <div>
          <div style={{ fontSize: 12, color: "#D97706", fontWeight: 600 }}>
            Unassigned
          </div>
          <div style={{ fontSize: 10, color: "#9CA3AF" }}>
            ● Not Assigned
          </div>
        </div>
      </div>
    );
  },
},
    {
      key  : "currentStatus",
      title: "Status",
      render: (_, r) => {
        const val = r?.currentStatus;
        if (!val) return <span style={{ color: "#D1D5DB" }}>—</span>;
        const cfg = STATUS_CFG[val] || { bg: "#F3F4F6", text: "#374151" };
        return (
          <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.text, whiteSpace: "nowrap" }}>
            {val}
          </span>
        );
      },
    },
    // {
    //   key  : "assigned",
    //   title: "Advisor",
    //   render: (_, r) => {
    //     const advisor = r?.assignedAdvisor;
    //     const hasAdvisor = advisor || r?.advisorId;
    //     if (hasAdvisor) {
    //       const name = advisor?.first_name
    //         ? `${advisor.first_name} ${advisor.last_name || ""}`.trim()
    //         : advisor?.name || "Assigned";
    //       return (
    //         <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
    //           <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#F5F0FF", border: "1.5px solid #E9D5FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    //             <UserOutlined style={{ fontSize: 11, color: P }} />
    //           </div>
    //           <div>
    //             <div style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{name}</div>
    //             <div style={{ fontSize: 10, color: "#10B981", fontWeight: 600 }}>● Assigned</div>
    //           </div>
    //         </div>
    //       );
    //     }
    //     return (
    //       <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
    //         <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#FFFBEB", border: "1.5px solid #FDE68A", display: "flex", alignItems: "center", justifyContent: "center" }}>
    //           <UserOutlined style={{ fontSize: 11, color: "#D97706" }} />
    //         </div>
    //         <span style={{ fontSize: 12, color: "#D97706", fontWeight: 500 }}>Unassigned</span>
    //       </div>
    //     );
    //   },
    // },
    {
      key  : "sourceInfo",
      title: "Agent",
      render: (_, r) => {
        const si = r?.sourceInfo || {};
        return si.createdByName ? (
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}>{si.createdByName}</div>
            {si.createdByRole && <div style={{ fontSize: 11, color: "#9CA3AF" }}>{cap(si.createdByRole)}</div>}
          </div>
        ) : <span style={{ color: "#D1D5DB" }}>—</span>;
      },
    },
    {
      key  : "createdAt",
      title: "Date",
      render: (_, r) => (
        <div style={{ fontSize: 12, color: "#6B7280" }}>
          <div>{fmtDate(r?.createdAt)}</div>
          {r?.leadId && <div style={{ fontSize: 10, color: "#D1D5DB", fontFamily: "monospace", marginTop: 2 }}>{r.leadId}</div>}
        </div>
      ),
    },
    {
      key  : "actions",
      title: "Actions",
      align: "center",
      render: (_, r) => {
        const refType    = (r?.referralType || "").trim().toLowerCase();
        const leadId     = r?._id || r?.leadId;
        const showUpload = refType === "referral" || refType === "referral only" || refType.includes("referral only");
const hasAdvisor = !!r?.assignedTo?.advisorId;
        return (
          <Space size={4}>
            {/* View */}
            <Tooltip title="View Details">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => handleViewDetail(leadId)}
                style={{ color: P, fontWeight: 500, fontSize: 12 }}
              >
                View
              </Button>
            </Tooltip>

            {/* Assign / Reassign */}
            <Tooltip title={hasAdvisor ? "Reassign Advisor" : "Assign Advisor"}>
              <Button
                size="small"
                icon={<UserAddOutlined />}
                onClick={() => openAssign(r)}
                style={{
                  borderRadius : 8,
                  fontSize     : 11,
                  fontWeight   : 600,
                  color        : hasAdvisor ? "#6D28D9" : P,
                  borderColor  : hasAdvisor ? "#DDD6FE" : PB,
                  background   : hasAdvisor ? "#F5F3FF" : PL,
                }}
              >
                {hasAdvisor ? "Reassign" : "Assign"}
              </Button>
            </Tooltip>

            {/* Upload docs */}
          
          </Space>
        );
      },
    },
  ];

  // ══════════════════════════════════════════════════════════════════════
  return (
    <div style={{ background: "#F4F0FA", minHeight: "100vh", padding: "28px 24px", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .vll-filter-label { font-size: 11px; font-weight: 700; color: #6B21A8; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px; display: block; }
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
        .assign-advisor-opt:hover { background: ${PL} !important; border-color: ${P} !important; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>

      {/* ── Page Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1a0533", margin: 0 }}>Vault Leads</h1>
          <p style={{ fontSize: 13, color: "#8B7BAE", margin: "3px 0 0" }}>
            Mortgage pipeline — {loading ? "loading..." : `${totalItems.toLocaleString()} lead${totalItems !== 1 ? "s" : ""} total`}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchLeads(currentPage, itemsPerPage, applied)}
            loading={loading}
            style={{ borderRadius: 10, borderColor: "#E8DFF5", color: P }}
          />
          <Badge count={activeCount} color={P} size="small">
            <Button
              icon={<FilterOutlined />}
              onClick={() => setDrawerOpen(true)}
              style={{
                borderRadius: 10,
                background  : activeCount > 0 ? PL : "white",
                borderColor : activeCount > 0 ? P  : "#E8DFF5",
                color       : activeCount > 0 ? P  : "#374151",
                fontWeight  : activeCount > 0 ? 700 : 400,
              }}
            >
              Filters{activeCount > 0 ? ` (${activeCount})` : ""}
            </Button>
          </Badge>
          {activeCount > 0 && (
            <Button
              icon={<ClearOutlined />}
              onClick={resetFilters}
              style={{ borderRadius: 10, borderColor: "#FECACA", color: "#DC2626", background: "#FEF2F2" }}
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* ── Stats Card ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 18 }}>
        {[
          { label: "Total Leads", value: totalItems, sub: "in pipeline", color: P },
        ].map((s, i) => (
          <div key={i} className="vll-stat" style={{ background: "white", borderRadius: 14, padding: "14px 18px", border: "1px solid #EDE9F6", boxShadow: "0 1px 6px rgba(92,3,155,0.05)", transition: "all .2s" }}>
            <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Quick Search + Status Pills ── */}
      <div style={{ background: "white", borderRadius: 14, border: "1px solid #EDE9F6", padding: "14px 18px", marginBottom: 14, boxShadow: "0 1px 6px rgba(92,3,155,0.04)" }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div className="vll-input" style={{ flex: 1, minWidth: 220 }}>
            <Input
              prefix={<SearchOutlined style={{ color: P }} />}
              placeholder="Search name, email, phone..."
              value={filters.search}
              onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
              onPressEnter={handleSearchEnter}
              allowClear
              onClear={() => {
                const f = { ...applied, search: "" };
                setFilters(f); setApplied(f);
                fetchLeads(1, itemsPerPage, f);
              }}
            />
          </div>
          <div style={{ width: 1, height: 28, background: "#EDE9F6" }} />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, whiteSpace: "nowrap" }}>Quick:</span>
            {["New", "Assigned", "Contacted", "Qualified", "Collecting Documentation", "Disbursed"].map((s) => {
              const active = applied.status === s;
              const cfg    = STATUS_CFG[s] || {};
              return (
                <span
                  key={s}
                  className={`vll-pill${active ? " active" : ""}`}
                  style={active ? { background: cfg.bg, borderColor: cfg.text || P, color: cfg.text || P } : { background: "#F9F6FF", borderColor: "#EDE9F6", color: "#6B7280" }}
                  onClick={() => active ? resetFilters() : quickStatus(s)}
                >
                  {s}
                </span>
              );
            })}
          </div>
        </div>

        {activeCount > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12, paddingTop: 12, borderTop: "1px solid #F5F0FF" }}>
            <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, paddingTop: 3 }}>Active:</span>
            {Object.entries(applied).map(([k, v]) => {
              if (!v && v !== false) return null;
              const labels = {
                search   : `Search: "${v}"`,
                source   : `Source: ${SOURCE_CFG[v]?.label || v}`,
                status   : `Status: ${v}`,
                agentId  : `Agent ID: …${String(v).slice(-6)}`,
                advisorId: `Advisor ID: …${String(v).slice(-6)}`,
                assigned : `Assigned: ${v === "true" || v === true ? "Yes" : "No"}`,
                fromDate : `From: ${v}`,
                toDate   : `To: ${v}`,
              };
              return (
                <span
                  key={k}
                  style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: PL, color: P, border: `1px solid ${PB}`, cursor: "pointer" }}
                  onClick={() => {
                    const f = { ...applied, [k]: "" };
                    if (k === "fromDate" || k === "toDate") { f.fromDate = ""; f.toDate = ""; setDateRange(null); }
                    setFilters(f); setApplied(f);
                    fetchLeads(1, itemsPerPage, f);
                  }}
                >
                  {labels[k]} ✕
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Table ── */}
      <div className="vll-table" style={{ background: "white", borderRadius: 16, border: "1px solid #EDE9F6", overflow: "hidden", boxShadow: "0 2px 12px rgba(92,3,155,0.05)" }}>
        <CustomTable
          columns={columns}
          data={data}
          loading={loading}
          totalItems={totalItems}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onFilter={(f) => {
            const merged = { ...applied, ...f };
            setFilters(merged); setApplied(merged);
            setCurrentPage(1);
            fetchLeads(1, itemsPerPage, merged);
          }}
          showSearch={false}
        />
      </div>

      {/* ════════════════════════════════════════════════════════════
          FILTER DRAWER
      ════════════════════════════════════════════════════════════ */}
      <Drawer
        className="vll-drawer"
        title="Advanced Filters"
        placement="right"
        width={360}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        extra={
          <Button size="small" onClick={resetFilters} style={{ color: "#DC2626", borderColor: "#FECACA", background: "#FEF2F2", borderRadius: 8, fontSize: 12 }}>
            Reset All
          </Button>
        }
        footer={
          <div style={{ display: "flex", gap: 10 }}>
            <Button onClick={() => setDrawerOpen(false)} style={{ flex: 1, borderRadius: 10 }}>Cancel</Button>
            <Button
              type="primary"
              onClick={applyFilters}
              style={{ flex: 2, background: `linear-gradient(135deg, #2D0058, ${PM})`, border: "none", borderRadius: 10, fontWeight: 600 }}
            >
              Apply Filters {activeCount > 0 ? `(${activeCount})` : ""}
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <FilterGroup label="Search" icon="🔍" hint="Name, email, or phone">
            <div className="vll-input">
              <Input prefix={<SearchOutlined style={{ color: P }} />} placeholder="e.g. Ahmed, ahmed@xoto.ae" value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))} allowClear />
            </div>
          </FilterGroup>

          <FilterGroup label="Lead Source" icon="📡" hint="Where the lead came from">
            <div className="vll-select">
              <Select style={{ width: "100%" }} placeholder="All Sources" value={filters.source || undefined} onChange={(v) => setFilters((p) => ({ ...p, source: v || "" }))} allowClear>
                {SOURCES.map((s) => (
                  <Option key={s} value={s}>
                    <Tag color={SOURCE_CFG[s].color} style={{ borderRadius: 20, marginRight: 6, fontSize: 11 }}>{SOURCE_CFG[s].label}</Tag>
                  </Option>
                ))}
              </Select>
            </div>
          </FilterGroup>

          <FilterGroup label="Lead Status" icon="📊" hint="Current stage in pipeline">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {STATUSES.map((s) => {
                const active = filters.status === s;
                const cfg    = STATUS_CFG[s] || {};
                return (
                  <span key={s} className="vll-pill"
                    style={{ background: active ? cfg.bg : "#F9F6FF", borderColor: active ? cfg.text || P : "#EDE9F6", color: active ? cfg.text || P : "#6B7280" }}
                    onClick={() => setFilters((p) => ({ ...p, status: active ? "" : s }))}
                  >{s}</span>
                );
              })}
            </div>
          </FilterGroup>

          <FilterGroup label="Assignment Status" icon="👤" hint="Whether assigned to an advisor">
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { val: "true",  label: "Assigned",  icon: <CheckCircleOutlined />, activeColor: "#059669", activeBg: "#ECFDF5" },
                { val: "false", label: "Unassigned", icon: <CloseCircleOutlined />, activeColor: "#D97706", activeBg: "#FFFBEB" },
              ].map((opt) => {
                const active = filters.assigned === opt.val;
                return (
                  <button key={opt.val}
                    onClick={() => setFilters((p) => ({ ...p, assigned: active ? "" : opt.val }))}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 12px", borderRadius: 10, border: `1.5px solid ${active ? opt.activeColor : "#E8DFF5"}`, background: active ? opt.activeBg : "white", color: active ? opt.activeColor : "#6B7280", fontWeight: active ? 700 : 500, fontSize: 13, cursor: "pointer", transition: "all .15s" }}>
                    {opt.icon} {opt.label}
                  </button>
                );
              })}
            </div>
          </FilterGroup>

          <FilterGroup label="Assigned Advisor" icon="🧑‍💼" hint="Filter by assigned advisor">
            <div className="vll-select">
              <Select style={{ width: "100%" }} placeholder="Any Advisor" value={filters.advisorId || undefined} onChange={(v) => setFilters((p) => ({ ...p, advisorId: v || "" }))} allowClear showSearch optionFilterProp="children" suffixIcon={<TeamOutlined style={{ color: P }} />}>
                {advisors.map((a) => (
                  <Option key={a._id || a.id} value={a._id || a.id}>
                    {a.first_name} {a.last_name}{a.department && <span style={{ color: "#9CA3AF", fontSize: 11 }}> — {a.department}</span>}
                  </Option>
                ))}
              </Select>
            </div>
            <div className="vll-input" style={{ marginTop: 8 }}>
              <Input placeholder="Or enter Advisor ID manually..." value={filters.advisorId} onChange={(e) => setFilters((p) => ({ ...p, advisorId: e.target.value }))} allowClear prefix={<UserOutlined style={{ color: "#9CA3AF", fontSize: 12 }} />} />
            </div>
          </FilterGroup>

          <FilterGroup label="Created By (Agent)" icon="🤝" hint="Agent who submitted the lead">
            <div className="vll-select">
              <Select style={{ width: "100%" }} placeholder="Any Agent" value={filters.agentId || undefined} onChange={(v) => setFilters((p) => ({ ...p, agentId: v || "" }))} allowClear showSearch optionFilterProp="children" suffixIcon={<UserOutlined style={{ color: P }} />}>
                {agents.map((a) => (
                  <Option key={a._id || a.id} value={a._id || a.id}>
                    {a.first_name || a.firstName} {a.last_name || a.lastName}{a.agentType && <span style={{ color: "#9CA3AF", fontSize: 11 }}> — {cap(a.agentType)}</span>}
                  </Option>
                ))}
              </Select>
            </div>
            <div className="vll-input" style={{ marginTop: 8 }}>
              <Input placeholder="Or enter Agent ID manually..." value={filters.agentId} onChange={(e) => setFilters((p) => ({ ...p, agentId: e.target.value }))} allowClear prefix={<UserOutlined style={{ color: "#9CA3AF", fontSize: 12 }} />} />
            </div>
          </FilterGroup>

          <FilterGroup label="Date Range" icon="📅" hint="Filter by lead creation date">
            <div className="vll-date">
              <RangePicker style={{ width: "100%" }} value={dateRange} onChange={handleDateRange} format="DD MMM YYYY" placeholder={["From Date", "To Date"]}
                presets={[
                  { label: "Today",        value: [dayjs(), dayjs()] },
                  { label: "This Week",    value: [dayjs().startOf("week"), dayjs()] },
                  { label: "This Month",   value: [dayjs().startOf("month"), dayjs()] },
                  { label: "Last 30 Days", value: [dayjs().subtract(30, "day"), dayjs()] },
                  { label: "Last 90 Days", value: [dayjs().subtract(90, "day"), dayjs()] },
                ]}
              />
            </div>
          </FilterGroup>
        </div>
      </Drawer>

      {/* ════════════════════════════════════════════════════════════
          ASSIGN TO ADVISOR MODAL
      ════════════════════════════════════════════════════════════ */}
      <Modal
        open={assignModal}
        onCancel={() => { if (!assignLoading) { setAssignModal(false); setSelectedAdvisor(null); } }}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: PL, border: `1px solid ${PB}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <UserAddOutlined style={{ color: P, fontSize: 15 }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1a0533" }}>Assign to Advisor</div>
              {assignTarget?.clientName && (
                <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 400, marginTop: 1 }}>
                  Lead: <strong style={{ color: "#374151" }}>{assignTarget.clientName}</strong>
                </div>
              )}
            </div>
          </div>
        }
        footer={[
          <Button key="cancel" onClick={() => setAssignModal(false)} disabled={assignLoading}>
            Cancel
          </Button>,
          <Button
            key="assign"
            type="primary"
            loading={assignLoading}
            disabled={!selectedAdvisor}
            onClick={handleAssign}
            icon={<UserAddOutlined />}
            style={{
              background  : selectedAdvisor ? `linear-gradient(135deg, ${P}, ${PM})` : undefined,
              borderColor : selectedAdvisor ? P : undefined,
              borderRadius: 8,
              fontWeight  : 600,
            }}
          >
            Confirm Assignment
          </Button>,
        ]}
        centered
        width={520}
        styles={{
          header: { borderBottom: "1px solid #f0e8ff", paddingBottom: 14 },
          body  : { paddingTop: 16 },
        }}
      >
        {/* Selected advisor preview */}
        {selectedAdvisor && (() => {
          const adv = advisors.find((a) => (a._id || a.id) === selectedAdvisor);
          if (!adv) return null;
          const name = `${adv.first_name || ""} ${adv.last_name || ""}`.trim();
          const leads = adv.currentLeads ?? 0;
          const max   = adv.maxLeadsCapacity ?? 0;
          const pct   = max ? Math.min((leads / max) * 100, 100) : 0;
          return (
            <div style={{ background: PL, border: `1px solid ${PB}`, borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar size={42} icon={<UserOutlined />} style={{ background: `linear-gradient(135deg, ${P}, ${PM})`, flexShrink: 0 }} src={adv.profilePic} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: "#1a0533", fontSize: 14 }}>{name}</div>
                <div style={{ fontSize: 11, color: "#6B7280" }}>{adv.designation || adv.department || "Advisor"}</div>
                {max > 0 && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 10, color: "#9CA3AF" }}>Leads capacity</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: pct >= 85 ? "#EF4444" : pct >= 60 ? "#F59E0B" : P }}>{leads}/{max}</span>
                    </div>
                    <div style={{ background: "#E9D5FF", borderRadius: 99, height: 5 }}>
                      <div style={{ width: `${pct}%`, background: pct >= 85 ? "#EF4444" : pct >= 60 ? "#F59E0B" : P, height: "100%", borderRadius: 99, transition: "width .3s" }} />
                    </div>
                  </div>
                )}
              </div>
              <CheckCircleOutlined style={{ color: P, fontSize: 18, flexShrink: 0 }} />
            </div>
          );
        })()}

        {/* Label */}
        <label style={{ display: "block", fontWeight: 600, color: "#1a0533", marginBottom: 8, fontSize: 13 }}>
          Select Advisor <span style={{ color: "#EF4444" }}>*</span>
        </label>

        {/* Advisor list */}
        <div style={{ maxHeight: 300, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, paddingRight: 4 }}>
          {advisors.length === 0 ? (
            <div style={{ textAlign: "center", color: "#9CA3AF", padding: "24px 0", fontSize: 13 }}>No advisors available</div>
          ) : (
            advisors.map((adv) => {
              const id       = adv._id || adv.id;
              const name     = `${adv.first_name || ""} ${adv.last_name || ""}`.trim();
              const leads    = adv.currentLeads ?? 0;
              const max      = adv.maxLeadsCapacity ?? 0;
              const pct      = max ? Math.min((leads / max) * 100, 100) : 0;
              const isFull   = max > 0 && leads >= max;
              const isSelected = selectedAdvisor === id;

              return (
                <div
                  key={id}
                  className="assign-advisor-opt"
                  onClick={() => !isFull && setSelectedAdvisor(isSelected ? null : id)}
                  style={{
                    display     : "flex",
                    alignItems  : "center",
                    gap         : 12,
                    padding     : "10px 14px",
                    borderRadius: 10,
                    border      : `1.5px solid ${isSelected ? P : "#e8dff5"}`,
                    background  : isSelected ? PL : isFull ? "#fafafa" : "white",
                    cursor      : isFull ? "not-allowed" : "pointer",
                    opacity     : isFull ? 0.55 : 1,
                    transition  : "all .15s",
                  }}
                >
                  {/* Avatar */}
                  <Avatar
                    size={36}
                    src={adv.profilePic}
                    icon={<UserOutlined />}
                    style={{ background: `linear-gradient(135deg, ${P}, ${PM})`, flexShrink: 0 }}
                  />

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: isSelected ? P : "#1a0533" }}>{name}</div>
                    <div style={{ fontSize: 11, color: "#9CA3AF" }}>
                      {adv.designation || adv.department || "Advisor"}
                      {adv.department && adv.designation ? ` · ${adv.department}` : ""}
                    </div>
                  </div>

                  {/* Capacity badge */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    {max > 0 ? (
                      <>
                        <div style={{ fontSize: 11, fontWeight: 700, color: pct >= 85 ? "#EF4444" : pct >= 60 ? "#F59E0B" : "#059669", marginBottom: 3 }}>
                          {leads}/{max} leads
                        </div>
                        <div style={{ background: "#E9D5FF", borderRadius: 99, height: 4, width: 60 }}>
                          <div style={{ width: `${pct}%`, background: pct >= 85 ? "#EF4444" : pct >= 60 ? "#F59E0B" : P, height: "100%", borderRadius: 99 }} />
                        </div>
                        {isFull && <div style={{ fontSize: 10, color: "#EF4444", fontWeight: 600, marginTop: 2 }}>Full</div>}
                      </>
                    ) : (
                      <div style={{ fontSize: 11, color: "#9CA3AF" }}>No cap set</div>
                    )}
                  </div>

                  {/* Selected check */}
                  {isSelected && (
                    <CheckCircleOutlined style={{ color: P, fontSize: 16, flexShrink: 0 }} />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Hint */}
        <div style={{ marginTop: 12, fontSize: 11, color: "#9CA3AF", display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444", display: "inline-block" }} /> Advisors at full capacity cannot be selected
        </div>
      </Modal>
    </div>
  );
};

export default VaultAgentLeadList;

// ─── Helper: Filter Group wrapper ──────────────────────────────────────────
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