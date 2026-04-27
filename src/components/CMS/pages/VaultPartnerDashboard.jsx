// src/components/CMS/pages/VaultPartnerDashboard.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Card, Row, Col, Select, Button, Typography, Tag, Avatar, List,
  Skeleton, Badge, Space, Statistic
} from "antd";
import {
  UserAddOutlined, WalletOutlined, RocketOutlined,
  BellOutlined, ArrowUpOutlined, ArrowDownOutlined,
  SafetyCertificateOutlined, PlusOutlined
} from "@ant-design/icons";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;
const { Option } = Select;

// Purple brand tokens (consistent with VaultPartnerProfile)
const P = "#5C039B";
const PM = "#7C3AED";
const PL = "#F5F0FF";
const GN = "#22C55E";
const BL = "#3B82F6";
const AMB = "#F59E0B";

const VaultPartnerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [timeRange, setTimeRange] = useState("7d");
  const [partnerData, setPartnerData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Determine partner type
  const isIndividual = user?.partnerCategory === "individual" || partnerData?.partnerCategory === "individual";

  // Fetch partner profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiService.get("/profile/get-profile-data"); // adjust endpoint as needed
        const data = res?.data?.data || res?.data || {};
        setPartnerData(data);
      } catch (error) {
        console.error("Failed to fetch partner profile:", error);
        // fallback to Redux user
        if (user) setPartnerData(user);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const partnerName = partnerData?.companyName ||
    (partnerData?.individualDetails
      ? `${partnerData.individualDetails.firstName || ""} ${partnerData.individualDetails.lastName || ""}`.trim()
      : user?.name) ||
    "Partner";

  // Mock chart data – replace with real API later
  const revenueData = [
    { name: "Mon", income: 4000 },
    { name: "Tue", income: 3000 },
    { name: "Wed", income: 5500 },
    { name: "Thu", income: 4800 },
    { name: "Fri", income: 7000 },
    { name: "Sat", income: 8200 },
    { name: "Sun", income: 6500 },
  ];

  const projectPerformance = [
    { name: "Project A", sales: 12 },
    { name: "Project B", sales: 19 },
    { name: "Project C", sales: 8 },
    { name: "Project D", sales: 15 },
  ];

  const stats = [
    {
      label: "Total Commission",
      value: "AED 42.5K",
      change: 12,
      icon: <WalletOutlined />,
      color: P,
      bg: PL,
    },
    {
      label: "Direct Referrals",
      value: "124",
      change: 8,
      icon: <UserAddOutlined />,
      color: BL,
      bg: "#eff6ff",
    },
    {
      label: "Active Projects",
      value: "12",
      change: 2,
      icon: <RocketOutlined />,
      color: GN,
      bg: "#ecfdf5",
    },
    {
      label: "Success Rate",
      value: "84%",
      change: -1,
      icon: <SafetyCertificateOutlined />,
      color: AMB,
      bg: "#fffbeb",
    },
  ];

  const recentActivities = [
    { partner: "Aman Verma", action: "Completed KYC Verification", status: "Verified", time: "10 mins ago" },
    { partner: "Rajesh Kumar", action: "New Payout Requested", status: "Pending", time: "25 mins ago" },
    { partner: "Global Heights", action: "New Inventory Added", status: "Update", time: "2 hrs ago" },
    { partner: "Sneha Kapoor", action: "Lease Agreement Signed", status: "Closed", time: "5 hrs ago" },
  ];

  return (
    <div style={{ background: "#f9f6ff", minHeight: "100vh", padding: "32px 28px" }}>
      <style>{`
        .vpp-stat-card {
          border-radius: 18px !important;
          border: 1px solid #f0e8ff !important;
          box-shadow: 0 4px 14px rgba(92,3,155,0.04) !important;
          transition: all 0.2s;
        }
        .vpp-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(92,3,155,0.1) !important;
        }
        .vpp-chart-card {
          border-radius: 20px !important;
          border: 1px solid #f0e8ff !important;
          box-shadow: 0 4px 20px rgba(92,3,155,0.06) !important;
        }
        .ant-select-selector {
          border-radius: 10px !important;
          border-color: #e8dff5 !important;
        }
        .ant-btn-primary {
          background: ${P} !important;
          border-color: ${P} !important;
          border-radius: 30px !important;
        }
      `}</style>

      <div className="vpp">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
          <div>
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} style={{ width: 300 }} />
            ) : (
              <>
                <Title level={2} style={{ margin: 0, fontWeight: 800, color: "#1a0533" }}>
                  Partner Portal
                  <Badge status="processing" color={GN} style={{ marginLeft: 12 }} />
                </Title>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  Welcome back, <strong>{partnerName}</strong>. Here's your partnership overview.
                </Text>
              </>
            )}
          </div>

          <Space size="middle">
           
            <Select defaultValue="7d" style={{ width: 140 }} onChange={setTimeRange} size="large">
              <Option value="7d">Weekly</Option>
              <Option value="30d">Monthly</Option>
            </Select>
            <Button size="large" icon={<BellOutlined />} style={{ borderRadius: 30, borderColor: "#e8dff5" }}>
              Notifications
            </Button>
          </Space>
        </div>

        {/* Stats Cards */}
        <Row gutter={[18, 18]} style={{ marginBottom: 28 }}>
          {stats.map((stat, i) => (
            <Col xs={24} sm={12} lg={6} key={i}>
              <Card bordered={false} className="vpp-stat-card" bodyStyle={{ padding: "20px 22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {stat.label}
                    </Text>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#1a0533", marginTop: 4, lineHeight: 1.2 }}>
                      {stat.value}
                    </div>
                  </div>
                  <Avatar shape="square" size={48} icon={stat.icon}
                    style={{ backgroundColor: stat.bg, color: stat.color, borderRadius: 14 }}
                  />
                </div>
                <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <Tag color={stat.change > 0 ? "success" : "error"} style={{ borderRadius: 20, padding: "2px 10px", fontWeight: 600 }}>
                    {stat.change > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(stat.change)}%
                  </Tag>
                  <Text type="secondary" style={{ fontSize: 12 }}>vs last month</Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Charts */}
        <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
          <Col xs={24} lg={15}>
            <Card bordered={false} className="vpp-chart-card"
              title={<span style={{ fontSize: 16, fontWeight: 700, color: P }}>Revenue Milestone (AED)</span>}>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={P} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={P} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                  <Area type="monotone" dataKey="income" stroke={P} fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={9}>
            <Card bordered={false} className="vpp-chart-card"
              title={<span style={{ fontSize: 16, fontWeight: 700, color: P }}>Project Sales Distribution</span>}>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={projectPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} />
                  <Tooltip cursor={{ fill: "transparent" }} contentStyle={{ borderRadius: 8, border: "none" }} />
                  <Bar dataKey="sales" fill={PM} radius={[0, 10, 10, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* Recent Activity */}
        <Row>
          <Col xs={24}>
            <Card bordered={false} className="vpp-chart-card"
              title={<span style={{ fontSize: 16, fontWeight: 700, color: P }}>Recent Partner Activities</span>}>
              <List
                itemLayout="horizontal"
                dataSource={recentActivities}
                renderItem={(item) => (
                  <List.Item actions={[<Button type="link" key="view" style={{ color: P }}>View Details</Button>]}>
                    <List.Item.Meta
                      avatar={<Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.partner}`} size="large" />}
                      title={<Text strong>{item.partner}</Text>}
                      description={
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                          <Text type="secondary">{item.action}</Text>
                          <Tag color={item.status === "Verified" || item.status === "Closed" ? "success" : item.status === "Pending" ? "warning" : "processing"}>
                            {item.status}
                          </Tag>
                        </div>
                      }
                    />
                    <Text type="secondary" style={{ fontSize: 12 }}>{item.time}</Text>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default VaultPartnerDashboard;