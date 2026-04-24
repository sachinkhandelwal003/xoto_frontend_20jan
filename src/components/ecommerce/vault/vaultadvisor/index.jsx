// src/pages/Leads/AdvisorMyLeads.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Button, Tag, message, Space, DatePicker, Select, Input,
  Tooltip, Badge, Drawer, Modal, Form
} from "antd";
import {
  EyeOutlined, SearchOutlined, FilterOutlined, ClearOutlined,
  ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined,
  UploadOutlined, PhoneOutlined, EditOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../../../manageApi/utils/custom.apiservice";
import CustomTable from "../../../CMS/pages/custom/CustomTable";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Option }      = Select;
const { TextArea }    = Input;

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

const INIT_FILTERS = { search: "", source: "", status: "", assigned: "", fromDate: "", toDate: "" };

// ══════════════════════════════════════════════════════════════════════════
const AdvisorLeads = () => {
  const navigate = useNavigate();

  const [data,         setData]         = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [totalItems,   setTotalItems]   = useState(0);
  const [currentPage,  setCurrentPage]  = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const [filters,    setFilters]    = useState(INIT_FILTERS);
  const [applied,    setApplied]    = useState(INIT_FILTERS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dateRange,  setDateRange]  = useState(null);

  // ── Status update modal state ────────────────────────────────────────────
  const [statusModal, setStatusModal]       = useState(false);
  const [statusTarget, setStatusTarget]     = useState(null); // lead record
  const [statusNotes, setStatusNotes]       = useState("");
  const [statusLoading, setStatusLoading]   = useState(false);

  const activeCount = Object.entries(applied).filter(([, v]) => v !== "" && v !== undefined).length;

  const statsNew       = data.filter((r) => r.currentStatus === "New").length;
  const statsActive    = data.filter((r) => r.currentStatus && !["Disbursed", "Not Proceeding"].includes(r.currentStatus)).length;
  const statsDisbursed = data.filter((r) => r.currentStatus === "Disbursed").length;

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchLeads = useCallback(async (page = currentPage, limit = itemsPerPage, f = applied) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit });
      if (f.search)           params.set("search",   f.search);
      if (f.source)           params.set("source",   f.source);
      if (f.status)           params.set("status",   f.status);
      if (f.assigned !== "")  params.set("assigned", f.assigned);
      if (f.fromDate)         params.set("fromDate", f.fromDate);
      if (f.toDate)           params.set("toDate",   f.toDate);

      const res   = await apiService.get(`/vault/lead/advisor/my-leads?${params.toString()}`);
      const list  = Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : [];
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

  // ── Handlers ──────────────────────────────────────────────────────────────
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

  // ── Open "Mark as Contacted" modal ────────────────────────────────────────
  const openStatusModal = (record) => {
    setStatusTarget(record);
    setStatusNotes("");
    setStatusModal(true);
  };

  // ── Submit status → Contacted ─────────────────────────────────────────────
  // API: PUT /vault/lead/advisor/lead/:leadId/status
  // Body: { status: "Contacted", notes: "..." }
  const handleMarkContacted = async () => {
    if (!statusTarget?._id) return;
    setStatusLoading(true);
    try {
      await apiService.put(`/vault/lead/advisor/lead/${statusTarget._id}/status`, {
        status: "Contacted",
        notes : statusNotes.trim() || undefined,
      });
      message.success("Lead marked as Contacted!");
      setStatusModal(false);
      setStatusTarget(null);
      fetchLeads(currentPage, itemsPerPage, applied); // refresh list
    } catch (err) {
      message.error(err?.response?.data?.message || "Status update failed");
    } finally {
      setStatusLoading(false);
    }
  };

  // ── Navigate to document upload page ─────────────────────────────────────
const handleAddDocs = (leadId) => {
  if (!leadId) return message.warning("Lead ID not available");
  navigate(`/dashboard/advisor/leads/${leadId}/documents`);
};

  // ── Table columns ─────────────────────────────────────────────────────────
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
    {
      key  : "loanAmountRequired",
      title: "Loan Amount",
      render: (_, r) => {
        const amt = r?.propertyDetails?.loanAmountRequired;
        return amt
          ? <span style={{ fontWeight: 600, color: "#059669", fontSize: 13 }}>AED {fmt(amt)}</span>
          : <span style={{ color: "#D1D5DB" }}>—</span>;
      },
    },
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
        </div>
      ),
    },
    {
      key  : "actions",
      title: "Actions",
      align: "center",
      render: (_, r) => {
        const leadId       = r?._id || r?.leadId;
        const status       = r?.currentStatus || "";
        const referralType = (r?.referralType || "").toLowerCase().trim();

        // ✅ "Referral Only" check
        const isReferralOnly = referralType === "referral only";

        // ✅ Show "Mark Contacted" only when status is NOT already Contacted or beyond
        const canMarkContacted = !["Contacted", "Qualified", "Collecting Documentation",
          "Documents Complete", "Application Opened", "Disbursed", "Not Proceeding"].includes(status);

        // ✅ Show "Add Docs" ONLY when:
        //    1. referralType === "Referral Only"
        //    2. currentStatus === "Contacted"
        const showAddDocs = isReferralOnly && status === "Contacted";

        return (
          <Space size={4} wrap>

            {/* View detail — always visible */}
            <Tooltip title="View Details">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => handleViewDetail(leadId)}
                style={{ color: P, fontWeight: 500, fontSize: 12 }}
                size="small"
              >
                View
              </Button>
            </Tooltip>

            {/* Mark as Contacted — visible when lead not yet contacted */}
            {canMarkContacted && (
              <Tooltip title="Mark as Contacted">
                <Button
                  type="text"
                  icon={<PhoneOutlined />}
                  size="small"
                  onClick={() => openStatusModal(r)}
                  style={{
                    color: "#C2410C", fontWeight: 600, fontSize: 12,
                    background: "#FFF7ED", borderRadius: 8,
                    border: "1px solid #FED7AA",
                  }}
                >
                  Contacted
                </Button>
              </Tooltip>
            )}

            {/* Add Docs — Referral Only + status === Contacted */}
            {showAddDocs && (
              <Tooltip title="Upload Documents for this Lead">
                <Button
                  type="primary"
                  icon={<UploadOutlined />}
                  size="small"
                  onClick={() => handleAddDocs(leadId)}
                  style={{
                    background: P, borderColor: P,
                    borderRadius: 8, fontWeight: 600, fontSize: 12,
                  }}
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
      `}</style>

      {/* ── Page Header ── */}
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

      {/* ── Stats Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 18 }}>
        {[
          { label: "Total Leads", value: totalItems,    sub: "assigned to me",  color: P         },
          { label: "New",         value: statsNew,      sub: "awaiting action", color: "#1D4ED8" },
          { label: "Active",      value: statsActive,   sub: "in progress",     color: "#D97706" },
          { label: "Disbursed",   value: statsDisbursed,sub: "completed",       color: "#059669" },
        ].map((s, i) => (
          <div key={i} className="vll-stat"
            style={{ background: "white", borderRadius: 14, padding: "14px 18px", border: "1px solid #EDE9F6", boxShadow: "0 1px 6px rgba(92,3,155,0.05)", transition: "all .2s" }}>
            <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Legend for action buttons ── */}
      <div style={{ background: "white", borderRadius: 12, border: "1px solid #EDE9F6", padding: "10px 16px", marginBottom: 14, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 700 }}>ACTIONS:</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#C2410C" }}>
          <PhoneOutlined /> <span>Contacted — marks lead as contacted (adds notes)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: P }}>
          <UploadOutlined /> <span>Add Docs — visible only for <b>Referral Only</b> leads after being <b>Contacted</b></span>
        </div>
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
              onClear={() => { const f = { ...applied, search: "" }; setFilters(f); setApplied(f); fetchLeads(1, itemsPerPage, f); }}
            />
          </div>
          <div style={{ width: 1, height: 28, background: "#EDE9F6" }} />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, whiteSpace: "nowrap" }}>Quick:</span>
            {["New", "Assigned", "Contacted", "Qualified", "Collecting Documentation", "Disbursed"].map((s) => {
              const active = applied.status === s;
              const cfg    = STATUS_CFG[s] || {};
              return (
                <span key={s} className={`vll-pill${active ? " active" : ""}`}
                  style={active ? { background: cfg.bg, borderColor: cfg.text || P, color: cfg.text || P } : { background: "#F9F6FF", borderColor: "#EDE9F6", color: "#6B7280" }}
                  onClick={() => active ? resetFilters() : quickStatus(s)}>
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
              const labels = { search: `Search: "${v}"`, source: `Source: ${SOURCE_CFG[v]?.label || v}`, status: `Status: ${v}`, assigned: `Assigned: ${v === "true" || v === true ? "Yes" : "No"}`, fromDate: `From: ${v}`, toDate: `To: ${v}` };
              return (
                <span key={k}
                  style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: PL, color: P, border: `1px solid ${PB}`, cursor: "pointer" }}
                  onClick={() => {
                    const f = { ...applied, [k]: "" };
                    if (k === "fromDate" || k === "toDate") { f.fromDate = ""; f.toDate = ""; setDateRange(null); }
                    setFilters(f); setApplied(f); fetchLeads(1, itemsPerPage, f);
                  }}>
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
          onFilter={(f) => { const merged = { ...applied, ...f }; setFilters(merged); setApplied(merged); setCurrentPage(1); fetchLeads(1, itemsPerPage, merged); }}
          showSearch={false}
        />
      </div>

      {/* ════════════════════════════════════════════════════════════
          FILTER DRAWER
      ════════════════════════════════════════════════════════════ */}
      <Drawer
        className="vll-drawer"
        title="Filter My Leads"
        placement="right"
        width={360}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        extra={<Button size="small" onClick={resetFilters} style={{ color: "#DC2626", borderColor: "#FECACA", background: "#FEF2F2", borderRadius: 8, fontSize: 12 }}>Reset All</Button>}
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
            <div className="vll-input">
              <Input prefix={<SearchOutlined style={{ color: P }} />} placeholder="e.g. Ahmed" value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))} allowClear />
            </div>
          </FilterGroup>
          <FilterGroup label="Lead Source" icon="📡" hint="Where the lead came from">
            <div className="vll-select">
              <Select style={{ width: "100%" }} placeholder="All Sources" value={filters.source || undefined} onChange={(v) => setFilters((p) => ({ ...p, source: v || "" }))} allowClear>
                {SOURCES.map((s) => <Option key={s} value={s}><Tag color={SOURCE_CFG[s].color} style={{ borderRadius: 20, marginRight: 6, fontSize: 11 }}>{SOURCE_CFG[s].label}</Tag></Option>)}
              </Select>
            </div>
          </FilterGroup>
          <FilterGroup label="Lead Status" icon="📊" hint="Current stage in pipeline">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {STATUSES.map((s) => {
                const active = filters.status === s;
                const cfg    = STATUS_CFG[s] || {};
                return <span key={s} className="vll-pill" style={{ background: active ? cfg.bg : "#F9F6FF", borderColor: active ? cfg.text || P : "#EDE9F6", color: active ? cfg.text || P : "#6B7280" }} onClick={() => setFilters((p) => ({ ...p, status: active ? "" : s }))}>{s}</span>;
              })}
            </div>
          </FilterGroup>
          <FilterGroup label="Assignment Status" icon="👤" hint="Whether lead is assigned">
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { val: "true",  label: "Assigned",   icon: <CheckCircleOutlined />, activeColor: "#059669", activeBg: "#ECFDF5" },
                { val: "false", label: "Unassigned",  icon: <CloseCircleOutlined />, activeColor: "#D97706", activeBg: "#FFFBEB" },
              ].map((opt) => {
                const active = filters.assigned === opt.val;
                return (
                  <button key={opt.val} onClick={() => setFilters((p) => ({ ...p, assigned: active ? "" : opt.val }))}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 12px", borderRadius: 10, border: `1.5px solid ${active ? opt.activeColor : "#E8DFF5"}`, background: active ? opt.activeBg : "white", color: active ? opt.activeColor : "#6B7280", fontWeight: active ? 700 : 500, fontSize: 13, cursor: "pointer", transition: "all .15s" }}>
                    {opt.icon} {opt.label}
                  </button>
                );
              })}
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
          MARK AS CONTACTED MODAL
          API: PUT /vault/lead/advisor/lead/:leadId/status
          Body: { status: "Contacted", notes: "..." }
      ════════════════════════════════════════════════════════════ */}
      <Modal
        open={statusModal}
        onCancel={() => !statusLoading && setStatusModal(false)}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FFF7ED", border: "1px solid #FED7AA", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PhoneOutlined style={{ color: "#C2410C", fontSize: 16 }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#111827" }}>Mark as Contacted</div>
              {statusTarget && (
                <div style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 400 }}>
                  {statusTarget.customerInfo?.fullName || "—"} • {statusTarget.customerInfo?.mobileNumber || ""}
                </div>
              )}
            </div>
          </div>
        }
        footer={[
          <Button key="cancel" onClick={() => setStatusModal(false)} disabled={statusLoading} style={{ borderRadius: 10 }}>Cancel</Button>,
          <Button key="submit" type="primary" loading={statusLoading} onClick={handleMarkContacted}
            style={{ background: "#C2410C", borderColor: "#C2410C", borderRadius: 10, fontWeight: 600 }}
            icon={<PhoneOutlined />}>
            Confirm — Contacted
          </Button>,
        ]}
        centered width={480} destroyOnClose
      >
        {/* Lead summary */}
        {statusTarget && (
          <div style={{ background: "#F9F6FF", borderRadius: 10, padding: "12px 16px", marginBottom: 16, border: "1px solid #EDE9F6" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px" }}>
              {[
                { label: "Client",       value: statusTarget.customerInfo?.fullName },
                { label: "Mobile",       value: statusTarget.customerInfo?.mobileNumber },
                { label: "Property",     value: statusTarget.propertyDetails?.propertyType },
                { label: "Property Val", value: statusTarget.propertyDetails?.propertyValue ? `AED ${fmt(statusTarget.propertyDetails.propertyValue)}` : null },
                { label: "Referral",     value: statusTarget.referralType },
                { label: "Current Status", value: statusTarget.currentStatus },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase" }}>{label}</div>
                  <div style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{value || "—"}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
            Contact Notes <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(optional but recommended)</span>
          </label>
        </div>
        <TextArea
          rows={4}
          value={statusNotes}
          onChange={(e) => setStatusNotes(e.target.value)}
          placeholder="e.g. Customer contacted. Interested in 2M AED loan, 25 years fixed rate. Will send documents tomorrow."
          maxLength={500}
          showCount
          style={{ borderRadius: 10, borderColor: "#E8DFF5" }}
        />
       
      </Modal>
    </div>
  );
};

export default AdvisorLeads;

// ─── Filter Group helper ────────────────────────────────────────────────────
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