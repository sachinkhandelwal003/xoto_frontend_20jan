import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Card, Typography, Avatar, Button, Tag, Input, Drawer,
  Divider, Dropdown, Segmented, Modal, Space, Row, Col, Skeleton
} from "antd";
import {
  UserOutlined, MailOutlined, PhoneOutlined,
  CheckCircleOutlined, CloseCircleOutlined, FlagOutlined,
  MoreOutlined, EnvironmentOutlined, IdcardOutlined,
  FileTextOutlined, CalendarOutlined, TrophyOutlined,
  TeamOutlined
} from "@ant-design/icons";
import { FiEye, FiSearch, FiRefreshCw } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import CustomTable from "../../CMS/pages/custom/CustomTable"
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;

const THEME = {
  primary:    "#5C039B",
  primaryBg:  "#5C039B15",
  success:    "#10b981",
  successBg:  "#10b98115",
  error:      "#ef4444",
  errorBg:    "#ef444415",
  warning:    "#d97706",
  warningBg:  "#d9770615",
  info:       "#3b82f6",
  infoBg:     "#3b82f615",
  border:     "#f0f0f0",
  textPrimary:"#1f2937",
  textMuted:  "#9ca3af",
  bg:         "#f8f9fa",
};

const normalizeAgent = (a, idx, page, limit) => ({
  ...a,
  key:       a._id,
  sno:       (page - 1) * limit + idx + 1,
  fullName:  a.fullName || `${a.first_name || ""} ${a.last_name || ""}`.trim() || "—",
  phone:     a.phone || a.phone_number || "—",
  email:     a.email || "—",
  location:  a.location || a.operating_city || a.country || "—",
});

// ── Status helpers ────────────────────────────────────────────────────────────
const statusTag = (status) => {
  const map = {
    approved: { color: "success",  label: "Approved" },
    declined: { color: "error",    label: "Declined" },
    pending:  { color: "warning",  label: "Pending"  },
  };
  const s = map[status] || map.pending;
  return <Tag color={s.color}>{s.label}</Tag>;
};

// ── Stat mini card ────────────────────────────────────────────────────────────
const MiniStat = ({ icon, label, value, color }) => (
  <div
    style={{
      background:    "#fff",
      border:        `1px solid ${THEME.border}`,
      borderRadius:  10,
      padding:       "14px 16px",
      display:       "flex",
      alignItems:    "center",
      gap:           12,
    }}
  >
    <div
      style={{
        width: 38, height: 38, borderRadius: 10,
        background: `${color}18`, color,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, color: THEME.textPrimary, lineHeight: 1.2 }}>
        {value ?? 0}
      </div>
      <div style={{ fontSize: 12, color: THEME.textMuted }}>{label}</div>
    </div>
  </div>
);

// ── Detail row ────────────────────────────────────────────────────────────────
const DetailRow = ({ icon, label, value }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
    <div
      style={{
        width: 34, height: 34, borderRadius: 8,
        background: THEME.primaryBg, color: THEME.primary,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, fontSize: 15,
      }}
    >
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 11, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 500, color: THEME.textPrimary, marginTop: 1 }}>
        {value || "—"}
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
const AgencyAgentList = () => {
  const navigate = useNavigate();

  const [agents,    setAgents]    = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [search,    setSearch]    = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const [pagination, setPagination] = useState({
    currentPage: 1, totalPages: 1, totalResults: 0, itemsPerPage: 20,
  });

  // Drawer
  const [drawerOpen,    setDrawerOpen]    = useState(false);
  const [agentDetails,  setAgentDetails]  = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Decline modal
  const [declineModal,   setDeclineModal]   = useState(false);
  const [declineReason,  setDeclineReason]  = useState("");
  const [selectedAgent,  setSelectedAgent]  = useState(null);
  const [declineLoading, setDeclineLoading] = useState(false);

  // Flag modal
  const [flagModal,   setFlagModal]   = useState(false);
  const [flagNote,    setFlagNote]    = useState("");
  const [flagLoading, setFlagLoading] = useState(false);

  const searchTimeout = useRef(null);

  // ── FETCH ──────────────────────────────────────────────────────────────────
  const fetchAgents = useCallback(async (
    page = 1, limit = 20, searchVal = "", tab = activeTab
  ) => {
    setLoading(true);
    try {
      let url = `/agency/agents?page=${page}&limit=${limit}`;
      if (tab && tab !== "all") url += `&status=${tab}`;
      if (searchVal?.trim())    url += `&search=${encodeURIComponent(searchVal.trim())}`;

      const res  = await apiService.get(url);
      const data = res?.data.data || res;

      const mapped = (data?.data || []).map((a, i) =>
        normalizeAgent(a, i, page, limit)
      );

      setAgents(mapped);
    setPagination({
  currentPage:  page,
  totalPages:   data?.pagination?.pages || 1,
  totalResults: data?.pagination?.total || mapped.length,
  itemsPerPage: data?.pagination?.limit || limit,
});
    } catch {
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchAgents(1, pagination.itemsPerPage, search, activeTab);
  }, [activeTab]);

  // ── SEARCH ─────────────────────────────────────────────────────────────────
  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() =>
      fetchAgents(1, pagination.itemsPerPage, val, activeTab), 500
    );
  };

  // ── OPEN DRAWER ────────────────────────────────────────────────────────────
  const openDrawer = async (record) => {
    setDrawerOpen(true);
    setDetailLoading(true);
    setAgentDetails(record);
    try {
      const res     = await apiService.get(`/agency/agents/${record._id}`);
      const fetched = res?.data?.data || res?.data;
      if (fetched) setAgentDetails(normalizeAgent(fetched, 0, 1, 1));
    } catch { /* show table data */ }
    finally { setDetailLoading(false); }
  };

  // ── APPROVE ────────────────────────────────────────────────────────────────
  const handleApprove = async (record) => {
    try {
      await apiService.put(`/agency/agents/${record._id}/approve`);
      fetchAgents(pagination.currentPage, pagination.itemsPerPage, search, activeTab);
      setDrawerOpen(false);
      setAgentDetails(prev => prev ? { ...prev, agencyApprovalStatus: "approved" } : prev);
    } catch (err) {
      Modal.error({ title: "Approval Failed", content: err?.response?.data?.message || "Please try again." });
    }
  };

  // ── DECLINE ────────────────────────────────────────────────────────────────
  const openDeclineModal = (record) => {
    setSelectedAgent(record);
    setDeclineReason("");
    setDeclineModal(true);
  };

  const handleDecline = async () => {
    if (!declineReason.trim()) {
      Modal.warning({ title: "Reason Required", content: "Please provide a reason for declining." });
      return;
    }
    setDeclineLoading(true);
    try {
      await apiService.put(`/agency/agents/${selectedAgent._id}/decline`, { reason: declineReason });
      setDeclineModal(false);
      setDeclineReason("");
      setSelectedAgent(null);
      setDrawerOpen(false);
      fetchAgents(pagination.currentPage, pagination.itemsPerPage, search, activeTab);
    } catch (err) {
      Modal.error({ title: "Decline Failed", content: err?.response?.data?.message || "Please try again." });
    } finally {
      setDeclineLoading(false);
    }
  };

  // ── FLAG ───────────────────────────────────────────────────────────────────
  const openFlagModal = (record) => {
    setSelectedAgent(record);
    setFlagNote("");
    setFlagModal(true);
  };

  const handleFlag = async () => {
    setFlagLoading(true);
    try {
      await apiService.put(`/agency/agents/${selectedAgent._id}/flag`, { note: flagNote });
      setFlagModal(false);
      setFlagNote("");
      setSelectedAgent(null);
      setDrawerOpen(false);
      fetchAgents(pagination.currentPage, pagination.itemsPerPage, search, activeTab);
    } catch (err) {
      Modal.error({ title: "Flag Failed", content: err?.response?.data?.message || "Please try again." });
    } finally {
      setFlagLoading(false);
    }
  };

  // ── DROPDOWN ───────────────────────────────────────────────────────────────
  const getDropdownItems = (record) => {
    const items = [
      {
        key: "view",
        icon: <FiEye style={{ color: THEME.primary, fontSize: 15 }} />,
        label: "View Details",
        onClick: () => openDrawer(record),
      },
      { type: "divider" },
    ];

    if (record.agencyApprovalStatus === "pending") {
      items.push(
        {
          key: "approve",
          icon: <CheckCircleOutlined style={{ color: THEME.success }} />,
          label: "Approve",
          onClick: () => handleApprove(record),
        },
        {
          key: "decline",
          icon: <CloseCircleOutlined style={{ color: THEME.error }} />,
          label: "Decline",
          danger: true,
          onClick: () => openDeclineModal(record),
        }
      );
    }

    if (!record.isFlagged) {
      items.push({
        key: "flag",
        icon: <FlagOutlined style={{ color: THEME.warning }} />,
        label: "Flag for Admin",
        onClick: () => openFlagModal(record),
      });
    }

    return items;
  };

  // ── COLUMNS ────────────────────────────────────────────────────────────────
  const columns = [
    // {
    //   title: "S.No",
    //   key: "sno",
    //   width: 60,
    //   render: (_, r) => (
    //     <Text style={{ fontSize: 13, color: THEME.textMuted }}>{r.sno}</Text>
    //   ),
    // },
    {
      title: "Agent",
      key: "fullName",
      width: 240,
      render: (_, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar
            size={40}
            src={r.profile_photo || null}
            icon={!r.profile_photo && <UserOutlined />}
            style={{ background: THEME.primaryBg, color: THEME.primary, flexShrink: 0 }}
          >
            {r.fullName?.charAt(0)?.toUpperCase()}
          </Avatar>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: THEME.textPrimary, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {r.fullName}
              </span>
              {r.isFlagged && (
                <FlagOutlined style={{ color: THEME.warning, fontSize: 11, flexShrink: 0 }} />
              )}
            </div>
            <div style={{ fontSize: 11, color: THEME.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {r.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Phone",
      key: "phone",
      width: 160,
      render: (_, r) => (
        <Text style={{ fontSize: 13, color: THEME.textPrimary }}>
          {r.phone}
        </Text>
      ),
    },
    {
      title: "Location",
      key: "location",
      width: 130,
      render: (_, r) => (
        <Text style={{ fontSize: 13, color: THEME.textPrimary }}>
          {r.location}
        </Text>
      ),
    },
    {
      title: "Agency Approval",
      key: "agencyApprovalStatus",
      width: 150,
      align: "center",
      render: (_, r) => statusTag(r.agencyApprovalStatus),
    },
    {
      title: "Admin Approval",
      key: "adminApprovalStatus",
      width: 140,
      align: "center",
      render: (_, r) => statusTag(r.adminApprovalStatus),
    },
    {
      title: "Profile",
       key: "profileComplete", 
      width: 100,
      align: "center",
      render: (_, r) => (
        r.profileComplete
          ? <Tag color="success">Complete</Tag>
          : <Tag color="default">Incomplete</Tag>
      ),
    },
    {
      title: "Actions",
       key: "actions",
      fixed: "right",
      width: 70,
      align: "center",
      render: (_, r) => (
        <Dropdown
          menu={{ items: getDropdownItems(r) }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<MoreOutlined style={{ fontSize: 20 }} />}
          />
        </Dropdown>
      ),
    },
  ];

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: 24, background: THEME.bg, minHeight: "100vh" }}>

      {/* ── HEADER ── */}
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, color: THEME.textPrimary }}>
          Agent Team
        </Title>
        <Text style={{ color: THEME.textMuted }}>
          Manage affiliated agents — approve, decline, or flag for admin review.
        </Text>
      </div>

      {/* ── STATS ROW ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          {
            icon:  <TeamOutlined />,
            label: "Total Agents",
            value: pagination.totalResults,
            color: THEME.primary,
          },
          {
            icon:  <CheckCircleOutlined />,
            label: "Approved",
            value: agents.filter(a => a.agencyApprovalStatus === "approved").length,
            color: THEME.success,
          },
          {
            icon:  <CalendarOutlined />,
            label: "Pending",
            value: agents.filter(a => a.agencyApprovalStatus === "pending").length,
            color: THEME.warning,
          },
          {
            icon:  <FlagOutlined />,
            label: "Flagged",
            value: agents.filter(a => a.isFlagged).length,
            color: THEME.error,
          },
        ].map((stat, idx) => (
          <Col xs={12} sm={6} key={idx}>
            <MiniStat {...stat} />
          </Col>
        ))}
      </Row>

      {/* ── TABLE CARD ── */}
      <Card
        bordered={false}
        style={{ borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
        bodyStyle={{ padding: 0 }}
      >
        {/* Filters */}
        <div
          style={{
            display: "flex", flexWrap: "wrap", alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px", borderBottom: `1px solid ${THEME.border}`, gap: 12,
          }}
        >
          <Segmented
            options={[
              { label: "All",      value: "all"      },
              { label: "Pending",  value: "pending"  },
              { label: "Approved", value: "approved" },
              { label: "Declined", value: "declined" },
            ]}
            value={activeTab}
            onChange={(val) => {
              setActiveTab(val);
              setPagination(p => ({ ...p, currentPage: 1 }));
            }}
            className="xoto-segmented"
            size="middle"
          />

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Input
              placeholder="Search name, email, phone..."
              prefix={<FiSearch style={{ color: THEME.textMuted }} />}
              value={search}
              onChange={handleSearch}
              allowClear
              onClear={() => { setSearch(""); fetchAgents(1, pagination.itemsPerPage, "", activeTab); }}
              style={{ width: 260, borderRadius: 8 }}
            />
            <Button
              icon={<FiRefreshCw size={14} />}
              onClick={() => fetchAgents(pagination.currentPage, pagination.itemsPerPage, search, activeTab)}
              style={{ borderRadius: 8 }}
            >
              Refresh
            </Button>
          </div>
        </div>

        <CustomTable
          columns={columns}
          data={agents}
          loading={loading}
          totalItems={pagination.totalResults}
          currentPage={pagination.currentPage}
          onPageChange={(page, limit) => fetchAgents(page, limit, search, activeTab)}
          scroll={{ x: 1050 }}
          showSearch={false}
        />
      </Card>

      {/* ── DETAIL DRAWER ── */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={440}
        title={null}
        styles={{ body: { padding: 0, background: "#fafafa" } }}
      >
        {detailLoading ? (
          <div style={{ padding: 24 }}>
            <Skeleton active avatar paragraph={{ rows: 8 }} />
          </div>
        ) : agentDetails ? (
          <div>
            {/* Purple banner */}
            <div
              style={{
                background: `linear-gradient(135deg, ${THEME.primary} 0%, #9333ea 100%)`,
                padding: "36px 24px 56px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Avatar
                size={84}
                src={agentDetails.profile_photo || null}
                icon={!agentDetails.profile_photo && <UserOutlined />}
                style={{
                  border: "4px solid rgba(255,255,255,0.9)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                  background: "#fff",
                  color: THEME.primary,
                  fontSize: 32,
                  fontWeight: "bold",
                }}
              >
                {agentDetails.fullName?.charAt(0)?.toUpperCase()}
              </Avatar>
            </div>

            {/* Name card */}
            <div style={{ padding: "0 20px", marginTop: -32 }}>
              <Card
                bordered={false}
                styles={{ body: { padding: "18px 20px", textAlign: "center" } }}
                style={{ borderRadius: 14, boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}
              >
                <div style={{ fontWeight: 700, fontSize: 17, color: THEME.textPrimary, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  {agentDetails.fullName}
                  {agentDetails.isFlagged && (
                    <FlagOutlined style={{ color: THEME.warning, fontSize: 15 }} />
                  )}
                </div>
                <div style={{ fontSize: 13, color: THEME.textMuted, marginTop: 2 }}>
                  {agentDetails.email}
                </div>

                {/* Status badges */}
                <div style={{ marginTop: 12, display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
                  <Tag color={agentDetails.agencyApprovalStatus === "approved" ? "success" : agentDetails.agencyApprovalStatus === "declined" ? "error" : "warning"}>
                    Agency: {agentDetails.agencyApprovalStatus?.toUpperCase() || "PENDING"}
                  </Tag>
                  <Tag color={agentDetails.adminApprovalStatus === "approved" ? "success" : agentDetails.adminApprovalStatus === "declined" ? "error" : "default"}>
                    Admin: {agentDetails.adminApprovalStatus?.toUpperCase() || "PENDING"}
                  </Tag>
                </div>

                <div style={{ marginTop: 8 }}>
                  <Tag color={agentDetails.profileComplete ? "success" : "default"}>
                    {agentDetails.profileComplete ? "✓ Profile Complete" : "Profile Incomplete"}
                  </Tag>
                </div>
              </Card>
            </div>

            {/* Stats */}
            <div style={{ padding: "16px 20px 0" }}>
              <Row gutter={[10, 10]}>
                {[
                  { icon: <FileTextOutlined />, label: "Total Leads",  value: agentDetails.totalLeads,       color: THEME.primary },
                  { icon: <FileTextOutlined />, label: "Active Leads", value: agentDetails.activeLeads,      color: THEME.info    },
                  { icon: <TrophyOutlined />,   label: "Deals",        value: agentDetails.dealsClosedCount, color: THEME.success },
                  { icon: <FileTextOutlined />, label: "Commission",   value: `${agentDetails.commissionEarned || 0}`, color: THEME.warning },
                ].map((s, idx) => (
                  <Col span={12} key={idx}>
                    <MiniStat {...s} />
                  </Col>
                ))}
              </Row>
            </div>

            {/* Details */}
            <div style={{ padding: "20px 20px 0" }}>
              <Text style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: THEME.textMuted, fontWeight: 700 }}>
                Agent Info
              </Text>
              <div style={{ marginTop: 14 }}>
                <DetailRow icon={<PhoneOutlined />}      label="Phone"     value={agentDetails.phone}    />
                <DetailRow icon={<EnvironmentOutlined />} label="Location" value={agentDetails.location} />
                <DetailRow icon={<IdcardOutlined />}     label="RERA Card" value={agentDetails.reraCardNumber || "Not provided"} />
                <DetailRow
                  icon={<CalendarOutlined />}
                  label="Joined"
                  value={agentDetails.createdAt
                    ? new Date(agentDetails.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                    : "—"}
                />
              </div>

              {/* Flag note */}
              {agentDetails.isFlagged && (
                <div style={{ padding: 12, background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 10, marginBottom: 12 }}>
                  <Text strong style={{ color: THEME.warning, fontSize: 12 }}>⚑ Flagged</Text>
                  {agentDetails.flagNote && (
                    <div style={{ fontSize: 12, color: "#92400e", marginTop: 4 }}>{agentDetails.flagNote}</div>
                  )}
                </div>
              )}

              {/* Decline note */}
              {agentDetails.agencyApprovalStatus === "declined" && agentDetails.agencyDeclineNote && (
                <div style={{ padding: 12, background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, marginBottom: 12 }}>
                  <Text strong style={{ color: THEME.error, fontSize: 12 }}>Decline Reason</Text>
                  <div style={{ fontSize: 12, color: "#991b1b", marginTop: 4 }}>{agentDetails.agencyDeclineNote}</div>
                </div>
              )}
            </div>

            <Divider style={{ margin: "16px 0" }} />

            {/* Actions */}
            <div style={{ padding: "0 20px 24px" }}>
              <Space direction="vertical" style={{ width: "100%" }}>
                {agentDetails.agencyApprovalStatus === "pending" && (
                  <>
                    <Button
                      block type="primary" size="large"
                      icon={<CheckCircleOutlined />}
                      onClick={() => handleApprove(agentDetails)}
                      style={{
                        background: THEME.success, borderColor: THEME.success,
                        borderRadius: 10, fontWeight: 600, height: 44,
                      }}
                    >
                      Approve Agent
                    </Button>
                    <Button
                      block danger size="large"
                      icon={<CloseCircleOutlined />}
                      onClick={() => openDeclineModal(agentDetails)}
                      style={{ borderRadius: 10, fontWeight: 600, height: 44 }}
                    >
                      Decline Agent
                    </Button>
                  </>
                )}

                {!agentDetails.isFlagged ? (
                  <Button
                    block size="large"
                    icon={<FlagOutlined />}
                    onClick={() => openFlagModal(agentDetails)}
                    style={{
                      borderRadius: 10, fontWeight: 600, height: 44,
                      borderColor: THEME.warning, color: THEME.warning,
                    }}
                  >
                    Flag for Admin Review
                  </Button>
                ) : (
                  <Button block size="large" disabled style={{ borderRadius: 10, height: 44 }}>
                    <FlagOutlined style={{ marginRight: 6 }} /> Already Flagged
                  </Button>
                )}

                <Button
                  block size="large"
                  onClick={() => navigate(`/dashboard/agency/agents/${agentDetails._id}`)}
                  style={{
                    borderRadius: 10, fontWeight: 600, height: 44,
                    borderColor: THEME.primary, color: THEME.primary,
                  }}
                >
                  <FiEye style={{ marginRight: 6 }} /> Full Detail Page
                </Button>
              </Space>
            </div>
          </div>
        ) : null}
      </Drawer>

      {/* ── DECLINE MODAL ── */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CloseCircleOutlined style={{ color: THEME.error }} />
            <span>Decline Agent</span>
          </div>
        }
        open={declineModal}
        onOk={handleDecline}
        onCancel={() => { setDeclineModal(false); setDeclineReason(""); setSelectedAgent(null); }}
        okText="Decline"
        okButtonProps={{ danger: true, loading: declineLoading, size: "large" }}
        cancelButtonProps={{ size: "large" }}
        cancelText="Cancel"
        centered
      >
        <div style={{ marginBottom: 12 }}>
          <Text strong>Agent: </Text>
          <Text>{selectedAgent?.fullName}</Text>
        </div>
        <Text style={{ color: THEME.textMuted, fontSize: 13 }}>
          Please provide a reason for declining this agent:
        </Text>
        <Input.TextArea
          rows={4}
          placeholder="Enter reason for declining..."
          value={declineReason}
          onChange={(e) => setDeclineReason(e.target.value)}
          style={{ marginTop: 10, borderRadius: 8 }}
        />
      </Modal>

      {/* ── FLAG MODAL ── */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FlagOutlined style={{ color: THEME.warning }} />
            <span>Flag Agent for Admin Review</span>
          </div>
        }
        open={flagModal}
        onOk={handleFlag}
        onCancel={() => { setFlagModal(false); setFlagNote(""); setSelectedAgent(null); }}
        okText="Flag Agent"
        okButtonProps={{
          loading: flagLoading,
          size: "large",
          style: { background: THEME.warning, borderColor: THEME.warning },
        }}
        cancelButtonProps={{ size: "large" }}
        cancelText="Cancel"
        centered
      >
        <div style={{ marginBottom: 12 }}>
          <Text strong>Agent: </Text>
          <Text>{selectedAgent?.fullName}</Text>
        </div>
        <div
          style={{
            padding: 12, background: "#fffbeb", borderRadius: 8,
            border: "1px solid #fde68a", marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 12, color: "#92400e" }}>
            ⚠ Per PRD 11.2, agencies cannot suspend or remove agents directly.
            Flagging will notify Xoto Admin for review.
          </Text>
        </div>
        <Input.TextArea
          rows={3}
          placeholder="Add a note for admin (optional)..."
          value={flagNote}
          onChange={(e) => setFlagNote(e.target.value)}
          style={{ borderRadius: 8 }}
        />
      </Modal>

      {/* ── STYLES ── */}
      <style>{`
        .xoto-segmented { background: #f3f4f6; padding: 3px; border-radius: 10px; }
        .xoto-segmented .ant-segmented-item-selected {
          background: ${THEME.primary} !important;
          color: #fff !important;
          box-shadow: 0 2px 8px ${THEME.primary}60;
        }
        .xoto-segmented .ant-segmented-item { border-radius: 8px; font-weight: 500; font-size: 13px; }
        .xoto-segmented .ant-segmented-item:hover:not(.ant-segmented-item-selected) { color: ${THEME.primary}; }
      `}</style>
    </div>
  );
};

export default AgencyAgentList;