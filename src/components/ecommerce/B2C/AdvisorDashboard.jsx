// src/components/ecommerce/B2C/AdvisorDashboard.jsx
import React from "react";
import {
  Card, Row, Col, Typography, Avatar, Button, Table, Tag,
  Space, Badge
} from "antd";
import {
  UserOutlined, TeamOutlined, CheckCircleOutlined,
  ClockCircleOutlined, ArrowRightOutlined, PlusOutlined,
  EyeOutlined, DollarOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const P = "#5C039B";
const PM = "#7C3AED";
const GN = "#22C55E";
const BL = "#3B82F6";
const AMB = "#F59E0B";

const StatCard = ({ icon, label, value, color }) => (
  <Card bordered={false} style={{ borderRadius: 18, border: "1px solid #f0e8ff", height: "100%" }} bodyStyle={{ padding: "18px 20px" }} hoverable>
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {React.cloneElement(icon, { style: { fontSize: 24, color } })}
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#1a0533", lineHeight: 1.2 }}>{value ?? "—"}</div>
        <div style={{ fontSize: 12, color: "#9b8ab0", marginTop: 2, fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  </Card>
);

// --- Static Mock Data ---
const mockStats = {
  totalLeads: 56,
  convertedLeads: 19,
  pendingLeads: 28,
  totalCommission: 342500,
};

const mockRecentLeads = [
  {
    _id: "1",
    customerInfo: { fullName: "Fatima Al Zahra" },
    currentStatus: "New",
    propertyDetails: { loanAmountRequired: 950000 },
    createdAt: "2026-04-20T10:30:00Z",
  },
  {
    _id: "2",
    customerInfo: { fullName: "Mohammed Al Blooshi" },
    currentStatus: "Contacted",
    propertyDetails: { loanAmountRequired: 1850000 },
    createdAt: "2026-04-19T14:15:00Z",
  },
  {
    _id: "3",
    customerInfo: { fullName: "Aisha Rahman" },
    currentStatus: "Qualified",
    propertyDetails: { loanAmountRequired: 2750000 },
    createdAt: "2026-04-18T09:45:00Z",
  },
  {
    _id: "4",
    customerInfo: { fullName: "Khalid Al Ameri" },
    currentStatus: "Converted",
    propertyDetails: { loanAmountRequired: 4500000 },
    createdAt: "2026-04-17T16:20:00Z",
  },
  {
    _id: "5",
    customerInfo: { fullName: "Noura Al Mazrouei" },
    currentStatus: "New",
    propertyDetails: { loanAmountRequired: 1250000 },
    createdAt: "2026-04-16T11:00:00Z",
  },
];

// --- Static User Info (replace with actual user when Redux is available) ---
const mockUser = {
  first_name: "Ahmed",
  last_name: "Al Mansouri",
  designation: "Senior Mortgage Advisor",
  profilePic: "", // leave empty to show default avatar
};

const AdvisorDashboard = () => {
  const navigate = useNavigate();

  // Use static user data (can be replaced with Redux later)
  const fullName = `${mockUser.first_name} ${mockUser.last_name}`;

  const leadColumns = [
    {
      title: "Lead",
      key: "client",
      render: (_, record) => record.customerInfo?.fullName || "—",
    },
    {
      title: "Status",
      dataIndex: "currentStatus",
      key: "status",
      render: (status) => {
        const colors = { "New": "blue", "Contacted": "orange", "Qualified": "purple", "Converted": "green" };
        return <Tag color={colors[status] || "default"}>{status}</Tag>;
      },
    },
    {
      title: "Loan Amount",
      key: "amount",
      render: (_, record) => `AED ${Number(record.propertyDetails?.loanAmountRequired || 0).toLocaleString()}`,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "created",
      render: (date) => new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button type="text" icon={<EyeOutlined />} onClick={() => navigate(`/vault/lead/${record._id}`)} style={{ color: P }}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div style={{ background: "#f9f6ff", minHeight: "100vh", padding: "32px 28px" }}>
      <style>{`.vpp .ant-table-thead > tr > th { background: #faf8ff !important; color: ${P} !important; }`}</style>
      <div className="vpp">
        {/* Hero */}
        <Card bordered={false} style={{ borderRadius: 24, overflow: "hidden", marginBottom: 28, boxShadow: "0 8px 24px rgba(92,3,155,0.08)", border: "1px solid #ede4ff" }} bodyStyle={{ padding: 0 }}>
          <div style={{ height: 120, background: `linear-gradient(135deg, ${P}, ${PM})` }} />
          <div style={{ background: "#fff", padding: "0 32px 28px", marginTop: -48 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 24, flexWrap: "wrap" }}>
              <Badge dot status="success" offset={[-8, 88]}>
                <Avatar size={112} src={mockUser.profilePic} icon={<UserOutlined />} style={{ background: "#f5f3ff", color: P, border: "4px solid #fff", boxShadow: "0 6px 16px rgba(92,3,155,0.12)" }} />
              </Badge>
              <div style={{ flex: 1, paddingBottom: 8 }}>
                <Title level={2} style={{ margin: 0, color: "#1a0533", fontWeight: 800 }}>{fullName}</Title>
                <Text type="secondary" style={{ fontSize: 15 }}>Mortgage Advisor • {mockUser.designation}</Text>
              </div>
              <Space>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/advisor/create")} style={{ background: P, borderColor: P, borderRadius: 30 }}>New Lead</Button>
                <Button icon={<EyeOutlined />} onClick={() => navigate("/advisor/list")} style={{ borderRadius: 30 }}>View All Leads</Button>
              </Space>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <Row gutter={[18, 18]} style={{ marginBottom: 28 }}>
          <Col xs={24} sm={12} lg={6}><StatCard icon={<TeamOutlined />} label="Total Leads" value={mockStats.totalLeads} color={P} /></Col>
          <Col xs={24} sm={12} lg={6}><StatCard icon={<CheckCircleOutlined />} label="Converted" value={mockStats.convertedLeads} color={GN} /></Col>
          <Col xs={24} sm={12} lg={6}><StatCard icon={<ClockCircleOutlined />} label="Pending" value={mockStats.pendingLeads} color={AMB} /></Col>
          <Col xs={24} sm={12} lg={6}><StatCard icon={<DollarOutlined />} label="Commission Earned" value={`AED ${mockStats.totalCommission.toLocaleString()}`} color={BL} /></Col>
        </Row>

        {/* Recent Leads Table */}
        <Card bordered={false} style={{ borderRadius: 20, boxShadow: "0 4px 20px rgba(92,3,155,0.06)", border: "1px solid #f0e8ff", overflow: "hidden" }} bodyStyle={{ padding: "24px" }} title={<span style={{ fontSize: 16, fontWeight: 700, color: P }}>Recent Leads</span>} extra={<Button type="link" onClick={() => navigate("/advisor/list")} style={{ color: P }}>View All <ArrowRightOutlined /></Button>}>
          <Table columns={leadColumns} dataSource={mockRecentLeads} rowKey="_id" pagination={false} size="small" />
        </Card>
      </div>
    </div>
  );
};

export default AdvisorDashboard;