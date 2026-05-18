import { useState } from "react";
import { useSelector } from "react-redux";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  HomeOutlined, BellOutlined, ArrowUpOutlined, ArrowDownOutlined,
  MessageOutlined, ReloadOutlined, BuildOutlined, LineChartOutlined,
  CheckCircleOutlined, ClockCircleOutlined, TrophyOutlined
} from "@ant-design/icons";
import {
  Card, Row, Col, Select, Button, Typography, Tag,
  Badge, Table
} from "antd";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Option } = Select;

// --- STATIC MOCK DATA ---
const mockStats = [
  {
    label: "Active Projects / Units",
    value: "5 / 42",
    change: 0,
    bg: "#e0f2fe",
    color: "#0284c7",
    icon: <BuildOutlined />
  },
  {
    label: "Interest Registrations (This vs Last Month)",
    value: "120",
    change: 41, // +41% from last month
    bg: "#fef3c7",
    color: "#d97706",
    icon: <LineChartOutlined />
  },
  {
    label: "Reserved / Sold Units",
    value: "15 / 8",
    change: 12,
    bg: "#d1fae5",
    color: "#059669",
    icon: <CheckCircleOutlined />
  },
  {
    label: "Pending Approvals (Admin)",
    value: "3",
    change: -10, 
    bg: "#fee2e2",
    color: "#e11d48",
    icon: <ClockCircleOutlined />
  }
];

const mockInventoryStatus = [
  { name: "Active", value: 42 },
  { name: "Reserved", value: 15 },
  { name: "Sold", value: 8 },
];

const mockDealFunnel = [
  { stage: "Leads", count: 120 },
  { stage: "Site Visits", count: 45 },
  { stage: "Negotiation", count: 20 },
  { stage: "Closed", count: 8 },
];

const mockDeals = [
  { key: '1', date: '2026-05-10', unit: 'Ocean View Villa - Unit 105', status: 'Completed via Xoto' },
  { key: '2', date: '2026-05-05', unit: 'Green Park Estate - Plot 12', status: 'Completed via Xoto' },
  { key: '3', date: '2026-05-01', unit: 'Sunrise Tower - Apt 10A', status: 'Completed via Xoto' },
];

const dealColumns = [
  { title: 'Deal Date', dataIndex: 'date', key: 'date' },
  { title: 'Unit Reference', dataIndex: 'unit', key: 'unit' },
  { 
    title: 'Status', 
    dataIndex: 'status', 
    key: 'status',
    render: (status) => <Tag color="green">{status}</Tag> 
  },
];

const COLORS = ["#3b82f6", "#f59e0b", "#10b981"];

const DeveloperDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth || {});

  const [timeRange, setTimeRange] = useState("30d");
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => setRefreshing(false), 800);
  };

  const getDisplayName = () => {
    if (user?.first_name) return `${user.first_name} ${user.last_name || ""}`;
    if (user?.name) return user.name;
    if (user?.company_name) return user.company_name;
    return "Developer";
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Welcome, {getDisplayName()} 👋
          </Title>
          <Text type="secondary">
            Monitor projects, inventory, visits and deals via Xoto GRID.
          </Text>
        </div>

        <div className="flex gap-3 items-center">
          <Select value={timeRange} style={{ width: 160 }} onChange={setTimeRange}>
            <Option value="7d">Last 7 Days</Option>
            <Option value="30d">Last 30 Days</Option>
            <Option value="90d">Last 90 Days</Option>
          </Select>

          <Button icon={<HomeOutlined />} onClick={() => navigate("/")}>
            Home
          </Button>

          <Button
            icon={<ReloadOutlined spin={refreshing} />}
            loading={refreshing}
            onClick={handleRefresh}
          >
            Refresh
          </Button>

          <Badge count={0} color="#7c3aed">
            <Button
              type="primary"
              icon={<MessageOutlined />}
              style={{ background: "#7c3aed", borderColor: "#7c3aed" }}
            >
              Chats
            </Button>
          </Badge>

          <Button type="primary" icon={<BellOutlined />}>
            Alerts
          </Button>
        </div>
      </div>

      {/* STATS */}
      <Row gutter={[16, 16]} className="mb-8">
        {mockStats.map((stat, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card bordered={false}>
              <div className="flex justify-between mb-2">
                <div>
                  <Text type="secondary">{stat.label}</Text>
                  <Title level={3} style={{ margin: "4px 0" }}>{stat.value}</Title>
                </div>
                <div style={{
                  background: stat.bg,
                  color: stat.color,
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px"
                }}>
                  {stat.icon}
                </div>
              </div>
              {stat.change !== 0 && (
                <Tag
                  color={stat.change > 0 ? "green" : "red"}
                  icon={stat.change > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                >
                  {Math.abs(stat.change)}%
                </Tag>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      {/* TOP PERFORMING LISTING & CHARTS */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} lg={8}>
          <Card title="Top Performing Listing" className="h-full">
            <div className="flex flex-col items-center justify-center h-full text-center py-6">
              <TrophyOutlined style={{ fontSize: "48px", color: "#f59e0b", marginBottom: "16px" }} />
              <Title level={4}>Ocean View Villa - Unit 402</Title>
              <Text type="secondary" className="mb-2">Highest Interest Volume</Text>
              <Tag color="gold">45 Active Leads</Tag>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Inventory Status">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={mockInventoryStatus} dataKey="value" outerRadius={80} label>
                  {mockInventoryStatus.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Sales Pipeline">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={mockDealFunnel}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* DEALS CLOSED TABLE */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Deals Closed via Platform (Xoto GRID)">
            <Table 
              columns={dealColumns} 
              dataSource={mockDeals} 
              pagination={false}
              bordered
            />
          </Card>
        </Col>
      </Row>

    </div>
  );
};

export default DeveloperDashboard;