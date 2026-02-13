import { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TeamOutlined,
  HomeOutlined,
  DollarOutlined,
  PercentageOutlined,
  BellOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";
import { Card, Row, Col, Select, Button, Typography, Tag, Avatar, List } from "antd";

const { Title, Text } = Typography;
const { Option } = Select;

const AgencyDashboard = () => {
  const [timeRange, setTimeRange] = useState("7d");

  // 📊 Property Inquiries
  const inquiryTrend = [
    { name: "Mon", inquiries: 8 },
    { name: "Tue", inquiries: 12 },
    { name: "Wed", inquiries: 10 },
    { name: "Thu", inquiries: 15 },
    { name: "Fri", inquiries: 18 },
    { name: "Sat", inquiries: 14 },
    { name: "Sun", inquiries: 16 },
  ];

  // 💰 Revenue Data
  const revenueData = [
    { month: "Jan", revenue: 12000 },
    { month: "Feb", revenue: 18000 },
    { month: "Mar", revenue: 15000 },
    { month: "Apr", revenue: 22000 },
    { month: "May", revenue: 26000 },
    { month: "Jun", revenue: 21000 },
  ];

  const stats = [
    {
      label: "Total Properties",
      value: "42",
      change: 12,
      icon: <HomeOutlined />,
      color: "#4F46E5",
      bg: "#eef2ff",
    },
    {
      label: "Active Agents",
      value: "8",
      change: 5,
      icon: <TeamOutlined />,
      color: "#E11D48",
      bg: "#fff1f2",
    },
    {
      label: "Monthly Revenue",
      value: "$26K",
      change: 8,
      icon: <DollarOutlined />,
      color: "#10b981",
      bg: "#ecfdf5",
    },
    {
      label: "Conversion Rate",
      value: "32%",
      change: -3,
      icon: <PercentageOutlined />,
      color: "#f59e0b",
      bg: "#fffbeb",
    },
  ];

  const recentDeals = [
    { name: "Skyline Tower", title: "Sold 2BHK - Downtown", time: "20 mins ago" },
    { name: "Palm Residency", title: "Lease Agreement Signed", time: "1 hr ago" },
    { name: "Green Valley", title: "New Inquiry Received", time: "2 hrs ago" },
    { name: "Ocean Heights", title: "Payment Confirmed", time: "3 hrs ago" },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Agency Dashboard
          </Title>
          <Text type="secondary">
            Manage your properties, agents & revenue.
          </Text>
        </div>

        <div className="flex gap-3 mt-4 md:mt-0">
          <Select defaultValue="7d" style={{ width: 160 }} onChange={setTimeRange} size="large">
            <Option value="7d">Last 7 Days</Option>
            <Option value="30d">Last 30 Days</Option>
            <Option value="90d">Last 90 Days</Option>
          </Select>

          <Button
            type="primary"
            size="large"
            icon={<BellOutlined />}
            style={{ background: "#4F46E5", borderColor: "#4F46E5" }}
          >
            Alerts
          </Button>
        </div>
      </div>

      {/* STATS */}
      <Row gutter={[16, 16]} className="mb-8">
        {stats.map((stat, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card bordered={false} className="shadow-sm rounded-xl h-full">
              <div className="flex justify-between items-start">
                <div>
                  <Text type="secondary">{stat.label}</Text>
                  <Title level={3} style={{ margin: 0 }}>
                    {stat.value}
                  </Title>
                </div>
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
                  style={{ backgroundColor: stat.bg, color: stat.color }}
                >
                  {stat.icon}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Tag
                  color={stat.change > 0 ? "success" : "error"}
                  icon={stat.change > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                >
                  {Math.abs(stat.change)}%
                </Tag>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  vs last period
                </Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* CHARTS */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} lg={16}>
          <Card bordered={false} className="shadow-sm rounded-xl" title="Property Inquiries">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={inquiryTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="inquiries"
                  stroke="#4F46E5"
                  fill="#e0e7ff"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card bordered={false} className="shadow-sm rounded-xl" title="Revenue Growth">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <Tooltip />
                <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* RECENT DEALS */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card bordered={false} className="shadow-sm rounded-xl" title="Recent Activity">
            <List
              itemLayout="horizontal"
              dataSource={recentDeals}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar style={{ backgroundColor: "#eef2ff", color: "#4F46E5" }}>
                        {item.name.charAt(0)}
                      </Avatar>
                    }
                    title={<Text strong>{item.title}</Text>}
                    description={
                      <div className="flex justify-between text-xs">
                        <Text type="secondary">{item.name}</Text>
                        <Text type="secondary">{item.time}</Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AgencyDashboard;
