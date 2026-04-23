// src/components/ecommerce/B2C/MortgageOpsDashboard.jsx
import React from "react";
import { useSelector } from "react-redux";
import {
  Card, Row, Col, Typography, Avatar, Button, Table, Tag,
  Space, Badge
} from "antd";
import {
  UserOutlined, FileOutlined, CheckCircleOutlined,
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
  totalCases: 124,
  approvedCases: 87,
  pendingCases: 23,
  totalValue: 18750000,
};

const mockRecentCases = [
  {
    _id: "1",
    caseId: "CASE-2024-001",
    customerInfo: { fullName: "Ahmed Al Mansouri" },
    status: "Processing",
    loanAmount: 1250000,
  },
  {
    _id: "2",
    caseId: "CASE-2024-002",
    customerInfo: { fullName: "Sara Khalid" },
    status: "Approved",
    loanAmount: 2500000,
  },
  {
    _id: "3",
    caseId: "CASE-2024-003",
    customerInfo: { fullName: "Omar Farooq" },
    status: "New",
    loanAmount: 850000,
  },
  {
    _id: "4",
    caseId: "CASE-2024-004",
    customerInfo: { fullName: "Layla Hassan" },
    status: "Processing",
    loanAmount: 3200000,
  },
  {
    _id: "5",
    caseId: "CASE-2024-005",
    customerInfo: { fullName: "Rashid Al Nuaimi" },
    status: "Rejected",
    loanAmount: 950000,
  },
];

const MortgageOpsDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const fullName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "Ops User";

  const caseColumns = [
    {
      title: "Case ID",
      dataIndex: "caseId",
      key: "caseId",
      render: (id) => <Text code>{id}</Text>,
    },
    {
      title: "Client",
      key: "client",
      render: (_, record) => record.customerInfo?.fullName || "—",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colors = { "New": "blue", "Processing": "orange", "Approved": "green", "Rejected": "red" };
        return <Tag color={colors[status] || "default"}>{status}</Tag>;
      },
    },
    {
      title: "Loan Amount",
      key: "amount",
      render: (_, record) => `AED ${Number(record.loanAmount || 0).toLocaleString()}`,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button type="text" icon={<EyeOutlined />} onClick={() => navigate(`/case/view/${record._id}`)} style={{ color: P }}>
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
                <Avatar size={112} icon={<UserOutlined />} style={{ background: "#f5f3ff", color: P, border: "4px solid #fff", boxShadow: "0 6px 16px rgba(92,3,155,0.12)" }} />
              </Badge>
              <div style={{ flex: 1, paddingBottom: 8 }}>
                <Title level={2} style={{ margin: 0, color: "#1a0533", fontWeight: 800 }}>{fullName}</Title>
                <Text type="secondary" style={{ fontSize: 15 }}>Mortgage Operations • {user?.department || "Operations"}</Text>
              </div>
              <Space>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/case/create")} style={{ background: P, borderColor: P, borderRadius: 30 }}>New Case</Button>
                <Button icon={<EyeOutlined />} onClick={() => navigate("/case/view")} style={{ borderRadius: 30 }}>View All Cases</Button>
              </Space>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <Row gutter={[18, 18]} style={{ marginBottom: 28 }}>
          <Col xs={24} sm={12} lg={6}><StatCard icon={<FileOutlined />} label="Total Cases" value={mockStats.totalCases} color={P} /></Col>
          <Col xs={24} sm={12} lg={6}><StatCard icon={<CheckCircleOutlined />} label="Approved" value={mockStats.approvedCases} color={GN} /></Col>
          <Col xs={24} sm={12} lg={6}><StatCard icon={<ClockCircleOutlined />} label="Pending" value={mockStats.pendingCases} color={AMB} /></Col>
          <Col xs={24} sm={12} lg={6}><StatCard icon={<DollarOutlined />} label="Total Value" value={`AED ${mockStats.totalValue.toLocaleString()}`} color={BL} /></Col>
        </Row>

        {/* Recent Cases Table */}
        <Card bordered={false} style={{ borderRadius: 20, boxShadow: "0 4px 20px rgba(92,3,155,0.06)", border: "1px solid #f0e8ff", overflow: "hidden" }} bodyStyle={{ padding: "24px" }} title={<span style={{ fontSize: 16, fontWeight: 700, color: P }}>Recent Cases</span>} extra={<Button type="link" onClick={() => navigate("/case/view")} style={{ color: P }}>View All <ArrowRightOutlined /></Button>}>
          <Table columns={caseColumns} dataSource={mockRecentCases} rowKey="_id" pagination={false} size="small" />
        </Card>
      </div>
    </div>
  );
};

export default MortgageOpsDashboard;