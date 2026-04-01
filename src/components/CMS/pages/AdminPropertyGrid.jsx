import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import {
  Typography, message, Modal, Button, Tag,
  Input, Pagination, Select, DatePicker,
  Tabs, Drawer, Badge, InputNumber, Divider, Spin
} from "antd";
import {
  EyeOutlined, SearchOutlined, EnvironmentOutlined, BankOutlined,
  HomeOutlined, FilterOutlined, ClearOutlined,
  CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined,
  BuildOutlined, AppstoreOutlined, StarFilled,
  DollarOutlined, RiseOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// ─── Brand ───────────────────────────────────────────────────────
const BRAND       = "#5c039b";
const BRAND_LIGHT = "#f3e8ff";
const BRAND_MID   = "#7c3aed";

// ─── Status Config ────────────────────────────────────────────────
const STATUS_CONFIG = {
  approved: { color: "#10b981", bg: "#ecfdf5", border: "#a7f3d0", icon: <CheckCircleOutlined />, label: "Approved" },
  pending:  { color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", icon: <ClockCircleOutlined />,  label: "Pending"  },
  rejected: { color: "#ef4444", bg: "#fef2f2", border: "#fecaca", icon: <CloseCircleOutlined />,  label: "Rejected" },
};

// ─── Stat Card ────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color, bg }) => (
  <div style={{
    background: "#fff", borderRadius: 16, padding: "18px 22px",
    display: "flex", alignItems: "center", gap: 14,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9",
    flex: 1, minWidth: 150,
  }}>
    <div style={{
      width: 46, height: 46, borderRadius: 12, background: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 19, color, flexShrink: 0,
    }}>{icon}</div>
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}>{value ?? 0}</div>
      <div style={{ fontSize: 11, color: "#64748b", marginTop: 3, fontWeight: 500 }}>{label}</div>
    </div>
  </div>
);

// ─── Property Card ────────────────────────────────────────────────
const PropertyCard = ({ item, onApprove, onReject }) => {
  const navigate = useNavigate();
  const status = STATUS_CONFIG[item.approvalStatus] || STATUS_CONFIG.pending;

  const allPhotos = [
    ...(item.photos?.architecture || []),
    ...(item.photos?.interior     || []),
    ...(item.photos?.lobby        || []),
    ...(item.photos?.other        || []),
  ];
  const thumb = item.mainLogo || allPhotos[0] || "";

  return (
    <div
      style={{
        background: "#fff", borderRadius: 20, overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9",
        transition: "all 0.25s ease", display: "flex", flexDirection: "column",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = "0 12px 40px rgba(92,3,155,0.13)";
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.borderColor = "#e9d5ff";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "#f1f5f9";
      }}
    >
      {/* ── Thumbnail ── */}
      <div
        style={{ position: "relative", height: 190, overflow: "hidden", cursor: "pointer" }}
        onClick={() => navigate(`property-detail/${item._id}`)}
      >
        <img
          src={thumb}
          alt={item.propertyName}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
          onMouseEnter={e => { e.target.style.transform = "scale(1.04)"; }}
          onMouseLeave={e => { e.target.style.transform = "scale(1)"; }}
          onError={e => { e.target.src = "https://via.placeholder.com/400x240?text=No+Image"; }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.48) 0%, transparent 55%)"
        }} />

        {/* Status */}
        <div style={{
          position: "absolute", top: 10, left: 10,
          background: status.bg, border: `1px solid ${status.border}`,
          color: status.color, borderRadius: 8, padding: "3px 9px",
          fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 4,
          backdropFilter: "blur(8px)",
        }}>
          {status.icon} {status.label}
        </div>

        {/* Sub-type */}
        <div style={{
          position: "absolute", top: 10, right: 10,
          background: item.propertySubType === "off_plan" ? BRAND : "#0ea5e9",
          color: "#fff", borderRadius: 8, padding: "3px 9px",
          fontSize: 11, fontWeight: 700,
        }}>
          {item.propertySubType === "off_plan" ? "Off-Plan" : "Secondary"}
        </div>

        {/* Featured */}
        {item.isFeatured && (
          <div style={{
            position: "absolute", bottom: 10, right: 10,
            background: "#f59e0b", color: "#fff", borderRadius: 8,
            padding: "3px 8px", fontSize: 11, fontWeight: 700,
            display: "flex", alignItems: "center", gap: 4,
          }}>
            <StarFilled style={{ fontSize: 10 }} /> Featured
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div style={{ padding: "15px 17px 17px", display: "flex", flexDirection: "column", flex: 1 }}>

        {/* Name */}
        <div
          onClick={() => navigate(`property-detail/${item._id}`)}
          style={{
            fontWeight: 700, fontSize: 15, color: "#0f172a", marginBottom: 4,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            cursor: "pointer",
          }}
          title={item.propertyName}
        >
          {item.propertyName}
        </div>

        {/* Developer */}
        <div style={{ color: "#64748b", fontSize: 12, marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
          <BankOutlined style={{ fontSize: 10, flexShrink: 0 }} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {item.developer?.name || item.developerName || "No Developer"}
          </span>
        </div>

        {/* Location */}
        <div style={{ color: "#64748b", fontSize: 12, marginBottom: 10, display: "flex", alignItems: "center", gap: 4 }}>
          <EnvironmentOutlined style={{ fontSize: 10, flexShrink: 0 }} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {[item.area, item.city].filter(Boolean).join(", ") || "—"}
          </span>
        </div>

        {/* Price */}
        <div style={{
          fontWeight: 800, fontSize: 13, color: BRAND,
          background: BRAND_LIGHT, borderRadius: 8,
          padding: "6px 10px", marginBottom: 11,
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <DollarOutlined style={{ fontSize: 11 }} />
          {item.currency} {item.price_min?.toLocaleString()} – {item.price_max?.toLocaleString()}
        </div>

        {/* Bed / Bath / Area chips */}
        <div style={{ display: "flex", gap: 5, marginBottom: 13, flexWrap: "wrap" }}>
          {item.bedrooms > 0 && (
            <span style={{ fontSize: 11, color: "#475569", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: "2px 8px" }}>
              {item.bedrooms} Bed
            </span>
          )}
          {item.bathrooms > 0 && (
            <span style={{ fontSize: 11, color: "#475569", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: "2px 8px" }}>
              {item.bathrooms} Bath
            </span>
          )}
          {item.builtUpArea_max > 0 && (
            <span style={{ fontSize: 11, color: "#475569", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: "2px 8px" }}>
              {item.builtUpArea_max?.toLocaleString()} sqft
            </span>
          )}
        </div>

        {/* ── Actions ── */}
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 7 }}>
          {item.approvalStatus === "pending" && (
            <div style={{ display: "flex", gap: 7 }}>
              <button
                onClick={e => { e.stopPropagation(); onApprove(item._id); }}
                style={{
                  flex: 1, height: 34, borderRadius: 10, border: "none",
                  background: "#10b981", color: "#fff", fontWeight: 600,
                  fontSize: 12, cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center", gap: 4,
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                <CheckCircleOutlined /> Approve
              </button>
              <button
                onClick={e => { e.stopPropagation(); onReject(item._id); }}
                style={{
                  flex: 1, height: 34, borderRadius: 10, border: "1px solid #fecaca",
                  background: "#fef2f2", color: "#ef4444", fontWeight: 600,
                  fontSize: 12, cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center", gap: 4,
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                <CloseCircleOutlined /> Reject
              </button>
            </div>
          )}

          <button
            onClick={() => navigate(`property-detail/${item._id}`)}
            style={{
              width: "100%", height: 36, borderRadius: 10,
              background: BRAND_LIGHT, color: BRAND, fontWeight: 600,
              fontSize: 12, cursor: "pointer", border: `1px solid #ddd6fe`,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = BRAND; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = BRAND_LIGHT; e.currentTarget.style.color = BRAND; }}
          >
            <EyeOutlined /> View Details
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────
const AdminPropertyList = () => {
  const [properties,   setProperties]   = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [total,        setTotal]        = useState(0);
  const [stats,        setStats]        = useState(null);
  const [currentPage,  setCurrentPage]  = useState(1);
  const [pageSize]                      = useState(12);
  const [searchText,   setSearchText]   = useState("");
  const [activeTab,    setActiveTab]    = useState("approved");
  const [filterDrawer, setFilterDrawer] = useState(false);
  const [rejectModal,  setRejectModal]  = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedId,   setSelectedId]   = useState(null);

  const [filters, setFilters] = useState({
    propertySubType: "off_plan",
    listingStatus: "", unitType: "", bedroomType: "",
    bedrooms: "", bathrooms: "", minPrice: "", maxPrice: "",
    minArea: "", maxArea: "", area: "", city: "", country: "",
    isAvailable: "", isFeatured: "", fromDate: null, toDate: null,
  });

  // ── Fetch ────────────────────────────────────────────────────────
  const fetchAllProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: currentPage, limit: pageSize });
      if (searchText) params.append("search", searchText);
      if (activeTab !== "all") params.append("approvalStatus", activeTab);
      Object.entries(filters).forEach(([k, v]) => {
        if (v && v !== "" && k !== "fromDate" && k !== "toDate") params.append(k, v);
      });
      if (filters.fromDate) params.append("fromDate", filters.fromDate.format("YYYY-MM-DD"));
      if (filters.toDate)   params.append("toDate",   filters.toDate.format("YYYY-MM-DD"));

      const res = await apiService.get(
        `/properties/admin/property/all?${params.toString()}&t=${Date.now()}`
      );
      const list = res?.data || [];
      setProperties(Array.isArray(list) ? list : []);
      setTotal(res?.pagination?.totalItems || list.length);
      setStats(res?.stats || null);
    } catch (err) {
      console.log(err);
      message.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchText, activeTab, filters]);

  useEffect(() => {
    const t = setTimeout(fetchAllProperties, 350);
    return () => clearTimeout(t);
  }, [searchText, activeTab, currentPage, filters]);

  // ── Actions ──────────────────────────────────────────────────────
  const approveProperty = async (id) => {
    try {
      await apiService.put(`/properties/admin/property/approve/${id}`, {
        remarks: "All documents verified. Property approved.",
      });
      message.success("Property approved successfully");
      fetchAllProperties();
    } catch {
      message.error("Approval failed");
    }
  };

  const rejectProperty = async () => {
    if (!rejectReason.trim()) { message.error("Please enter rejection reason"); return; }
    try {
      await apiService.put(`/properties/admin/property/reject/${selectedId}`, {
        rejectionReason: rejectReason,
      });
      message.success("Property rejected");
      setRejectModal(false);
      setRejectReason("");
      fetchAllProperties();
    } catch {
      message.error("Rejection failed");
    }
  };

  const clearFilters = () => {
    setFilters({
      propertySubType: "off_plan", listingStatus: "", unitType: "", bedroomType: "",
      bedrooms: "", bathrooms: "", minPrice: "", maxPrice: "", minArea: "", maxArea: "",
      area: "", city: "", country: "", isAvailable: "", isFeatured: "",
      fromDate: null, toDate: null,
    });
    setSearchText("");
    setCurrentPage(1);
  };

  const activeFilterCount = Object.values(filters).filter(
    v => v !== "" && v !== null && v !== "off_plan"
  ).length;

  // ── Tab items ─────────────────────────────────────────────────────
  const tabItems = [
    { key: "approved", label: <span style={{ display: "flex", alignItems: "center", gap: 6 }}><CheckCircleOutlined />Approved</span> },
    { key: "pending",  label: <span style={{ display: "flex", alignItems: "center", gap: 6 }}><ClockCircleOutlined />Pending</span>  },
    { key: "rejected", label: <span style={{ display: "flex", alignItems: "center", gap: 6 }}><CloseCircleOutlined />Rejected</span> },
  ];

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div style={{ padding: "28px 32px", background: "#f8fafc", minHeight: "100vh" }}>

      {/* Global styles */}
      <style>{`
        .prop-tabs .ant-tabs-nav { margin-bottom: 0; }
        .prop-tabs .ant-tabs-tab { padding: 14px 4px; font-size: 13px; font-weight: 600; color: #64748b; }
        .prop-tabs .ant-tabs-tab-active .ant-tabs-tab-btn { color: ${BRAND} !important; }
        .prop-tabs .ant-tabs-ink-bar { background: ${BRAND}; height: 3px; border-radius: 3px 3px 0 0; }
        .prop-tabs .ant-tabs-tab:hover .ant-tabs-tab-btn { color: ${BRAND}; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ marginBottom: 26 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: `linear-gradient(135deg, ${BRAND}, ${BRAND_MID})`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <BuildOutlined style={{ color: "#fff", fontSize: 18 }} />
          </div>
          <div>
            <Title level={3} style={{ margin: 0, color: "#0f172a", fontWeight: 800, fontSize: 22 }}>
              Property Management
            </Title>
            <Text style={{ color: "#64748b", fontSize: 13 }}>
              Review, approve, and manage all property listings
            </Text>
          </div>
        </div>
      </div>

      {/* ── Stats Row ── */}
      {stats && (
        <div style={{ display: "flex", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
          <StatCard icon={<AppstoreOutlined />} label="Total Off-Plan"    value={stats.totalOffPlan}    color="#5c039b" bg="#f3e8ff" />
          <StatCard icon={<HomeOutlined />}     label="Total Secondary"   value={stats.totalSecondary}  color="#0ea5e9" bg="#e0f2fe" />
          <StatCard icon={<ClockCircleOutlined />} label="Pending"        value={stats.pendingApproval} color="#f59e0b" bg="#fffbeb" />
          <StatCard icon={<CheckCircleOutlined />} label="Approved"       value={stats.approved}        color="#10b981" bg="#ecfdf5" />
          <StatCard icon={<CloseCircleOutlined />} label="Rejected"       value={stats.rejected}        color="#ef4444" bg="#fef2f2" />
          <StatCard icon={<RiseOutlined />}    label="Active Listings"    value={stats.activeListings}  color="#6366f1" bg="#eef2ff" />
        </div>
      )}

      {/* ── Property Type Toggle ── */}
      <div style={{
        background: "#fff", borderRadius: 16, padding: "14px 18px",
        marginBottom: 14, border: "1px solid #f1f5f9",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <Text style={{ color: "#64748b", fontSize: 13, fontWeight: 600, marginRight: 4, flexShrink: 0 }}>Property Type:</Text>
        {[
          { key: "off_plan",  label: "Off-Plan",  icon: <BuildOutlined /> },
          { key: "secondary", label: "Secondary", icon: <HomeOutlined /> },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => { setFilters(f => ({ ...f, propertySubType: t.key })); setCurrentPage(1); }}
            style={{
              padding: "7px 18px", borderRadius: 10, border: "none", cursor: "pointer",
              fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 6,
              transition: "all 0.2s",
              background: filters.propertySubType === t.key ? BRAND : "#f8fafc",
              color:      filters.propertySubType === t.key ? "#fff" : "#64748b",
              boxShadow:  filters.propertySubType === t.key ? `0 4px 12px rgba(92,3,155,0.22)` : "none",
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Status Tabs ── */}
      <div style={{
        background: "#fff", borderRadius: 16, padding: "0 18px",
        marginBottom: 14, border: "1px solid #f1f5f9",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}>
        <Tabs
          className="prop-tabs"
          activeKey={activeTab}
          onChange={key => { setActiveTab(key); setCurrentPage(1); }}
          items={tabItems}
        />
      </div>

      {/* ── Search & Filter Bar ── */}
      <div style={{
        background: "#fff", borderRadius: 16, padding: "14px 18px",
        marginBottom: 22, border: "1px solid #f1f5f9",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap",
      }}>
        <Input
          prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
          placeholder="Search by property name, area, developer..."
          size="large"
          allowClear
          value={searchText}
          onChange={e => { setSearchText(e.target.value); setCurrentPage(1); }}
          style={{ flex: 1, minWidth: 220, borderRadius: 10 }}
        />
        <Badge count={activeFilterCount} color={BRAND}>
          <Button icon={<FilterOutlined />} size="large" onClick={() => setFilterDrawer(true)}
            style={{ borderRadius: 10, fontWeight: 600 }}>
            Filters
          </Button>
        </Badge>
        {activeFilterCount > 0 && (
          <Button icon={<ClearOutlined />} size="large" danger onClick={clearFilters}
            style={{ borderRadius: 10, fontWeight: 600 }}>
            Clear
          </Button>
        )}
        <Text style={{ color: "#94a3b8", fontSize: 13, marginLeft: "auto" }}>
          {total} properties found
        </Text>
      </div>

      {/* ── Property Grid ── */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
          <Spin size="large" />
        </div>
      ) : properties.length === 0 ? (
        <div style={{
          background: "#fff", borderRadius: 20, padding: "72px 32px",
          textAlign: "center", border: "2px dashed #e2e8f0",
        }}>
          <HomeOutlined style={{ fontSize: 48, color: "#cbd5e1", marginBottom: 16 }} />
          <Title level={4} style={{ color: "#94a3b8", margin: 0 }}>No properties found</Title>
          <Text style={{ color: "#cbd5e1" }}>Try adjusting your search or filters</Text>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 20,
          marginBottom: 28,
        }}>
          {properties.map(item => (
            <PropertyCard
              key={item._id}
              item={item}
              onApprove={approveProperty}
              onReject={id => { setSelectedId(id); setRejectModal(true); }}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {total > pageSize && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
          <Pagination
            current={currentPage}
            total={total}
            pageSize={pageSize}
            onChange={p => setCurrentPage(p)}
            showSizeChanger={false}
            showTotal={t => `Total ${t} properties`}
          />
        </div>
      )}

      {/* ── Filter Drawer ── */}
      <Drawer
        title={
          <span style={{ fontWeight: 700, color: "#0f172a" }}>
            <FilterOutlined style={{ marginRight: 8, color: BRAND }} />Advanced Filters
          </span>
        }
        placement="right"
        onClose={() => setFilterDrawer(false)}
        open={filterDrawer}
        width={400}
        extra={
          <Button icon={<ClearOutlined />} onClick={clearFilters} danger size="small">
            Clear All
          </Button>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Select filters */}
          {[
            { label: "Listing Status", field: "listingStatus", options: ["pending","active","inactive","rejected"] },
            { label: "Unit Type",      field: "unitType",      options: ["apartment","villa","townhouse","duplex","penthouse"] },
            { label: "Bedroom Type",   field: "bedroomType",   options: ["studio","1bed","2bed","3bed","4bed","5bed","6bed","7bed","8plus"] },
          ].map(({ label, field, options }) => (
            <div key={field}>
              <Text strong style={{ fontSize: 13 }}>{label}</Text>
              <Select
                placeholder={`Select ${label.toLowerCase()}`}
                style={{ width: "100%", marginTop: 6 }}
                allowClear
                value={filters[field] || undefined}
                onChange={val => setFilters(f => ({ ...f, [field]: val || "" }))}
              >
                {options.map(o => (
                  <Option key={o} value={o}>
                    {o.replace(/_/g," ").replace(/\b\w/g, c => c.toUpperCase())}
                  </Option>
                ))}
              </Select>
            </div>
          ))}

          <Divider style={{ margin: "4px 0" }} />

          {/* Price range */}
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <Text strong style={{ fontSize: 13 }}>Min Price</Text>
              <InputNumber placeholder="Min" style={{ width: "100%", marginTop: 6 }} min={0}
                value={filters.minPrice || undefined}
                onChange={val => setFilters(f => ({ ...f, minPrice: val || "" }))} />
            </div>
            <div style={{ flex: 1 }}>
              <Text strong style={{ fontSize: 13 }}>Max Price</Text>
              <InputNumber placeholder="Max" style={{ width: "100%", marginTop: 6 }} min={0}
                value={filters.maxPrice || undefined}
                onChange={val => setFilters(f => ({ ...f, maxPrice: val || "" }))} />
            </div>
          </div>

          {/* Area range */}
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <Text strong style={{ fontSize: 13 }}>Min Area (sqft)</Text>
              <InputNumber placeholder="Min" style={{ width: "100%", marginTop: 6 }} min={0}
                value={filters.minArea || undefined}
                onChange={val => setFilters(f => ({ ...f, minArea: val || "" }))} />
            </div>
            <div style={{ flex: 1 }}>
              <Text strong style={{ fontSize: 13 }}>Max Area (sqft)</Text>
              <InputNumber placeholder="Max" style={{ width: "100%", marginTop: 6 }} min={0}
                value={filters.maxArea || undefined}
                onChange={val => setFilters(f => ({ ...f, maxArea: val || "" }))} />
            </div>
          </div>

          <Divider style={{ margin: "4px 0" }} />

          {/* Text filters */}
          {["area", "city", "country"].map(f => (
            <div key={f}>
              <Text strong style={{ fontSize: 13 }}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
              <Input
                placeholder={`Enter ${f}`}
                style={{ width: "100%", marginTop: 6 }}
                allowClear
                value={filters[f]}
                onChange={e => setFilters(prev => ({ ...prev, [f]: e.target.value }))}
              />
            </div>
          ))}

          <Divider style={{ margin: "4px 0" }} />

          {/* Date range */}
          <div>
            <Text strong style={{ fontSize: 13 }}>Created Date Range</Text>
            <RangePicker
              style={{ width: "100%", marginTop: 6 }}
              value={filters.fromDate && filters.toDate ? [filters.fromDate, filters.toDate] : null}
              onChange={dates => setFilters(f => ({
                ...f,
                fromDate: dates?.[0] || null,
                toDate:   dates?.[1] || null,
              }))}
            />
          </div>
        </div>

        <Divider />

        <Button
          type="primary" block size="large"
          onClick={() => { setFilterDrawer(false); setCurrentPage(1); }}
          style={{ borderRadius: 10, background: BRAND, borderColor: BRAND, fontWeight: 600 }}
        >
          Apply Filters
        </Button>
      </Drawer>

      {/* ── Reject Modal ── */}
      <Modal
        title={
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CloseCircleOutlined style={{ color: "#ef4444" }} /> Reject Property
          </span>
        }
        open={rejectModal}
        onCancel={() => { setRejectModal(false); setRejectReason(""); }}
        onOk={rejectProperty}
        okText="Confirm Rejection"
        okButtonProps={{ danger: true, icon: <CloseCircleOutlined /> }}
        cancelButtonProps={{ style: { borderRadius: 8 } }}
      >
        <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
          Please provide a detailed reason for rejecting this property:
        </Text>
        <Input.TextArea
          rows={4}
          placeholder="Enter rejection reason..."
          value={rejectReason}
          onChange={e => setRejectReason(e.target.value)}
          style={{ borderRadius: 8 }}
        />
      </Modal>
    </div>
  );
};

export default AdminPropertyList;