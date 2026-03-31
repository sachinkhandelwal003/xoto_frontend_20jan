import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiService } from "../../../../manageApi/utils/custom.apiservice";
import {
  Typography, Avatar, Space, Tag, Spin, Image, Divider,
  Button, Modal, Input, message, Row, Col, Card, Badge, Tooltip
} from "antd";
import {
  UserOutlined, ArrowLeftOutlined, MailOutlined, PhoneOutlined,
  EnvironmentOutlined, GlobalOutlined, StarOutlined, FileProtectOutlined,
  CrownOutlined, IdcardOutlined, CheckCircleOutlined, CloseCircleOutlined,
  CalendarOutlined, BankOutlined, TrophyOutlined, TeamOutlined,
  BarChartOutlined, SafetyCertificateOutlined, ExclamationCircleOutlined
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// ─── Stat Card Component ───────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color, bg }) => (
  <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: "14px", padding: "20px 24px", display: "flex", alignItems: "center", gap: "16px", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
    <div style={{ width: 48, height: 48, borderRadius: "12px", background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
      {icon}
    </div>
    <div>
      <Text type="secondary" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.6px", fontWeight: 600 }}>{label}</Text>
      <div style={{ fontSize: 24, fontWeight: 700, color: "#111827", lineHeight: 1.2, marginTop: 2 }}>{value}</div>
    </div>
  </div>
);

// ─── Info Row Component ────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: "1px solid #f9fafb" }}>
    <div style={{ color: "#5c039b", fontSize: 16, marginTop: 2 }}>{icon}</div>
    <div style={{ flex: 1 }}>
      <Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>{label}</Text>
      <div style={{ fontSize: 14, color: "#1f2937", fontWeight: 500, marginTop: 2 }}>{value || <span style={{ color: "#9ca3af" }}>N/A</span>}</div>
    </div>
  </div>
);

const statusConfig = {
  approved:  { color: "#059669", bg: "#d1fae5", label: "Approved" },
  pending:   { color: "#d97706", bg: "#fef3c7", label: "Pending" },
  registered:{ color: "#2563eb", bg: "#dbeafe", label: "Registered" },
  rejected:  { color: "#dc2626", bg: "#fee2e2", label: "Rejected" },
};

const AgentDetail = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();

  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Reject modal state
  const [rejectModalVisible, setRejectModalVisible] = useState(false); 
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");

  const fetchAgent = async () => {
    setLoading(true);
    try {
      const res = await apiService.get(`/agent/get-agent-details/${agentId}`);
      setAgent(res?.data?.data || res?.data || res);
    } catch {
      message.error("Failed to load agent details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (agentId) fetchAgent();
  }, [agentId]);

  // ✅ DIRECT APPROVAL & AUTO-VERIFICATION
  const handleApprove = async () => {
    setActionLoading(true);
    try {
      // 1. Approve Agent (without any reason)
      await apiService.put(`/agent/approve-agent/${agentId}`, { rejection_reason: "" });
      
      // 2. Automatically Verify Agent
      await apiService.post(`/agent/update-agent?id=${agentId}`, { isVerified: true });

      message.success("Agent approved and verified successfully!");
      fetchAgent();
    } catch {
      message.error("Approval failed. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      setReasonError("Rejection reason is required.");
      return;
    }
    setActionLoading(true);
    try {
      await apiService.put(`/agent/reject-agent/${agentId}`, { rejection_reason: reason.trim() });
      
      // Automatically Unverify if rejected
      await apiService.post(`/agent/update-agent?id=${agentId}`, { isVerified: false });

      message.success("Agent rejected.");
      setRejectModalVisible(false);
      setReason("");
      fetchAgent();
    } catch {
      message.error("Rejection failed. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = () => {
    setReason("");
    setReasonError("");
    setRejectModalVisible(true);
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-AE", { day: "2-digit", month: "short", year: "numeric" }) : "N/A";

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><Spin size="large" /></div>;
  if (!agent) return <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}><ExclamationCircleOutlined style={{ fontSize: 48, color: "#9ca3af" }} /><Text type="secondary">Agent not found</Text><Button onClick={() => navigate(-1)}>Go Back</Button></div>;

  const sc = statusConfig[agent.onboarding_status] || statusConfig.registered;
  const isApproved = agent.onboarding_status === "approved";
  const isRejected = agent.onboarding_status === "rejected";

  return (
    <div style={{ padding: "24px", background: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ border: "1px solid #e5e7eb", borderRadius: 8, fontWeight: 600 }}>Back</Button>
        <div>
          <Title level={3} style={{ margin: 0, color: "#111827" }}>Agent Details</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>Full profile · ID: <code>{agent._id}</code></Text>
        </div>
      </div>

      {/* Hero Card */}
      <Card bordered={false} style={{ borderRadius: 16, marginBottom: 24, boxShadow: "0 2px 12px rgba(92,3,155,0.07)", overflow: "hidden" }} bodyStyle={{ padding: 0 }}>
        <div style={{ height: 90, background: "linear-gradient(135deg, #5c039b 0%, #7c3aed 60%, #a78bfa 100%)" }} />
        <div style={{ padding: "0 32px 28px 32px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginTop: -40 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 20 }}>
              <Avatar size={90} src={agent.profile_photo} icon={!agent.profile_photo && <UserOutlined />} style={{ border: "4px solid #fff", boxShadow: "0 4px 16px rgba(92,3,155,0.2)", backgroundColor: "#f3e8ff", color: "#5c039b", fontSize: 34, fontWeight: 700 }}>
                {!agent.profile_photo && agent.first_name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <div style={{ paddingBottom: 4 }}>
                <Title level={3} style={{ margin: 0, color: "#111827", textTransform: "capitalize" }}>{agent.first_name} {agent.last_name}</Title>
                <Space size={6} wrap style={{ marginTop: 6 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 12px", borderRadius: 20, background: sc.bg, color: sc.color, fontWeight: 700, fontSize: 12, textTransform: "uppercase" }}>{sc.label}</span>
                  {/* Verified Tag - Depends entirely on agent.isVerified */}
                  {agent.isVerified && <Tag icon={<SafetyCertificateOutlined />} color="green" style={{ borderRadius: 20, fontWeight: 600 }}>Verified</Tag>}
                </Space>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: "flex", gap: 10, paddingTop: 8, flexWrap: "wrap" }}>
              {/* Added !isRejected here so Approve button won't show if rejected */}
              {!isApproved && !isRejected && (
                <Button 
                  type="primary" 
                  icon={<CheckCircleOutlined />} 
                  loading={actionLoading}
                  onClick={handleApprove} 
                  style={{ background: "#059669", borderColor: "#059669", borderRadius: 8, fontWeight: 600, height: 38 }}
                >
                  Approve
                </Button>
              )}
              {!isRejected && (
                <Button 
                  danger 
                  icon={<CloseCircleOutlined />} 
                  onClick={openRejectModal} 
                  style={{ borderRadius: 8, fontWeight: 600, height: 38 }}
                >
                  Reject
                </Button>
              )}
            </div>
          </div>

          {agent.rejection_reason && (
            <div style={{ marginTop: 20, padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, display: "flex", gap: 10 }}>
              <ExclamationCircleOutlined style={{ color: "#dc2626", fontSize: 16, marginTop: 2 }} />
              <div>
                <Text strong style={{ color: "#dc2626", fontSize: 13 }}>Rejection Note</Text>
                <Paragraph style={{ margin: 0, color: "#7f1d1d", fontSize: 13, marginTop: 2 }}>{agent.rejection_reason}</Paragraph>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Stats Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { icon: <BarChartOutlined />, label: "Presentations", value: agent.presentationsGenerated_count ?? 0, color: "#2563eb", bg: "#dbeafe" },
          { icon: <TeamOutlined />,     label: "Leads Created",  value: agent.leadsCreated_count ?? 0,          color: "#7c3aed", bg: "#ede9fe" },
          { icon: <TrophyOutlined />,   label: "Deals Closed",  value: agent.dealsClosed_count ?? 0,            color: "#059669", bg: "#d1fae5" },
          { icon: <BankOutlined />,     label: "Comm. Earned", value: `AED ${agent.totalCommission_earned ?? 0}`, color: "#d97706", bg: "#fef3c7" },
        ].map((s, i) => (
          <Col xs={24} sm={12} lg={6} key={i}><StatCard {...s} /></Col>
        ))}
      </Row>

      {/* Details + Documents */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <Card bordered={false} style={{ borderRadius: 14, boxShadow: "0 1px 6px rgba(0,0,0,0.04)", height: "100%" }} title={<Text strong style={{ fontSize: 15, color: "#374151" }}>Personal & Professional Info</Text>}>
            <InfoRow icon={<MailOutlined />}        label="Email Address"   value={agent.email} />
            <InfoRow icon={<PhoneOutlined />}       label="Phone Number"    value={`${agent.country_code} ${agent.phone_number}`} />
            <InfoRow icon={<EnvironmentOutlined />} label="Operating City"  value={agent.operating_city} />
            <InfoRow icon={<StarOutlined />}        label="Specialization"  value={agent.specialization} />
            <InfoRow icon={<SafetyCertificateOutlined />} label="RERA Number" value={agent.rera_number || "Not provided"} />
            <InfoRow icon={<TrophyOutlined />}      label="Experience"      value={`${agent.experience_years || 0} years`} />
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card bordered={false} style={{ borderRadius: 14, boxShadow: "0 1px 6px rgba(0,0,0,0.04)", height: "100%" }} title={<Text strong style={{ fontSize: 15, color: "#374151" }}>Uploaded Documents</Text>}>
            
            {/* ID Proof */}
            <div style={{ marginBottom: 20 }}>
              <Space style={{ marginBottom: 10 }}><IdcardOutlined style={{ color: "#5c039b" }} /><Text strong>Emirates ID / Passport</Text></Space>
              {agent.id_proof ? (
                <Button type="dashed" block style={{ height: 'auto', padding: 20 }} onClick={() => window.open(agent.id_proof, "_blank")}>
                   View ID Document
                </Button>
              ) : (
                <div style={{ height: 100, background: "#f9fafb", border: "2px dashed #e5e7eb", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>No ID uploaded</div>
              )}
            </div>
            <Divider style={{ margin: "16px 0" }} />

            {/* RERA Cert */}
            <div>
              <Space style={{ marginBottom: 10 }}><FileProtectOutlined style={{ color: "#5c039b" }} /><Text strong>RERA Certificate</Text></Space>
              {agent.rera_certificate ? (
                <Button type="dashed" block style={{ height: 'auto', padding: 20 }} onClick={() => window.open(agent.rera_certificate, "_blank")}>
                   View RERA Certificate
                </Button>
              ) : (
                <div style={{ height: 100, background: "#f9fafb", border: "2px dashed #e5e7eb", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>No certificate uploaded</div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* REJECT MODAL */}
      <Modal open={rejectModalVisible} onCancel={() => setRejectModalVisible(false)} title={<Space><CloseCircleOutlined style={{ color: "#dc2626" }} /><Text strong>Reject Agent</Text></Space>} footer={null} centered destroyOnClose width={480}>
        <div style={{ padding: "8px 0 0" }}>
          <Text strong style={{ fontSize: 13 }}>Rejection Reason <span style={{ color: "#dc2626" }}>*</span></Text>
          <TextArea rows={4} placeholder="e.g. Invalid RERA certificate." value={reason} onChange={(e) => { setReason(e.target.value); setReasonError(""); }} style={{ marginTop: 8, borderRadius: 8, borderColor: reasonError ? "#ef4444" : undefined }} />
          {reasonError && <Text style={{ color: "#ef4444", fontSize: 12 }}>{reasonError}</Text>}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
            <Button onClick={() => setRejectModalVisible(false)}>Cancel</Button>
            <Button danger loading={actionLoading} onClick={handleReject} icon={<CloseCircleOutlined />}>Confirm Rejection</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AgentDetail;