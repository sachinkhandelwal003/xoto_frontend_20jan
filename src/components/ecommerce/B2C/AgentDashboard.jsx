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
  UserOutlined,
} from "@ant-design/icons";
import { Card, Row, Col, Select, Button, Typography, Tag, Avatar, List } from "antd";

const { Title, Text } = Typography;
const { Option } = Select;

const AgentDashboard = () => {
  const [timeRange, setTimeRange] = useState("7d");

  // 📊 Leads Trend
  const leadsTrend = [
    { name: "Mon", leads: 3 },
    { name: "Tue", leads: 5 },
    { name: "Wed", leads: 4 },
    { name: "Thu", leads: 7 },
    { name: "Fri", leads: 9 },
    { name: "Sat", leads: 6 },
    { name: "Sun", leads: 8 },
  ];

  // 🏠 Deals Closed Monthly
  const dealsClosed = [
    { month: "Jan", deals: 1 },
    { month: "Feb", deals: 2 },
    { month: "Mar", deals: 3 },
    { month: "Apr", deals: 2 },
    { month: "May", deals: 4 },
    { month: "Jun", deals: 3 },
  ];

  // 📌 Stats Cards
  const stats = [
    {
      label: "Active Leads",
      value: "18",
      change: 10,
      icon: <TeamOutlined />,
      color: "#E11D48",
      bg: "#fff1f2",
    },
    {
      label: "Site Visits",
      value: "9",
      change: 6,
      icon: <HomeOutlined />,
      color: "#3b82f6",
      bg: "#eff6ff",
    },
    {
      label: "Deals Closed",
      value: "5",
      change: 3,
      icon: <DollarOutlined />,
      color: "#10b981",
      bg: "#ecfdf5",
    },
    {
      label: "Conversion Rate",
      value: "27%",
      change: -2,
      icon: <PercentageOutlined />,
      color: "#f59e0b",
      bg: "#fffbeb",
    },
  ];

  const recentClients = [
    { name: "Rahul Mehta", title: "Interested in 3BHK - Downtown", time: "15 mins ago" },
    { name: "Priya Sharma", title: "Requested Call Back", time: "40 mins ago" },
    { name: "Ali Hassan", title: "Scheduled Site Visit", time: "1 hr ago" },
    { name: "Neha Gupta", title: "Payment Plan Discussion", time: "2 hrs ago" },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* 🔹 HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Agent Dashboard
          </Title>
          <Text type="secondary">
            Track your leads, visits & performance.
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
            style={{ background: "#E11D48", borderColor: "#E11D48" }}
          >
            Alerts
          </Button>
        </div>
      </div>

      {/* 🔹 STATS */}
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

      {/* 🔹 CHARTS */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} lg={16}>
          <Card bordered={false} className="shadow-sm rounded-xl" title="Leads Trend">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={leadsTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="leads"
                  stroke="#E11D48"
                  fill="#ffe4e6"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card bordered={false} className="shadow-sm rounded-xl" title="Deals Closed">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={dealsClosed}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <Tooltip />
                <Bar dataKey="deals" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* 🔹 RECENT CLIENTS */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card bordered={false} className="shadow-sm rounded-xl" title="Recent Clients">
            <List
              itemLayout="horizontal"
              dataSource={recentClients}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar style={{ backgroundColor: "#fff1f2", color: "#E11D48" }}>
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

export default AgentDashboard;
