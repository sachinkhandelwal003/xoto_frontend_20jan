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
  RiseOutlined,
  FileTextOutlined,
  TeamOutlined,
  HomeOutlined,
  PercentageOutlined,
  BellOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import { Card, Row, Col, Select, Button, Typography, Tag, Avatar, List } from "antd";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Option } = Select;

const DeveloperDashboard = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("7d");

  const leadsTrend = [
    { name: "Mon", leads: 6 },
    { name: "Tue", leads: 10 },
    { name: "Wed", leads: 8 },
    { name: "Thu", leads: 14 },
    { name: "Fri", leads: 18 },
    { name: "Sat", leads: 12 },
    { name: "Sun", leads: 15 },
  ];

  const unitsSoldMonthly = [
    { month: "Jan", units: 2 },
    { month: "Feb", units: 3 },
    { month: "Mar", units: 4 },
    { month: "Apr", units: 3 },
    { month: "May", units: 6 },
    { month: "Jun", units: 5 },
  ];

  const stats = [
    {
      label: "Leads Generated",
      value: "34",
      change: 12,
      icon: <TeamOutlined />,
      color: "#F97316",
      bg: "#fff7ed",
    },
    {
      label: "Presentations",
      value: "12",
      change: 8,
      icon: <FileTextOutlined />,
      color: "#ea580c",
      bg: "#ffedd5",
    },
    {
      label: "Units Sold",
      value: "8",
      change: 4,
      icon: <HomeOutlined />,
      color: "#10b981",
      bg: "#ecfdf5",
    },
    {
      label: "Conversion Rate",
      value: "23%",
      change: -2,
      icon: <PercentageOutlined />,
      color: "#3b82f6",
      bg: "#eff6ff",
    },
  ];

  const recentLeads = [
    { name: "Ahmed Khan", title: "Interested in 2BHK (Business Bay)", time: "10 mins ago" },
    { name: "Sarah Ali", title: "Requested brochure (Downtown)", time: "30 mins ago" },
    { name: "Ravi Sharma", title: "Site visit inquiry", time: "1 hr ago" },
    { name: "Neha Gupta", title: "Asked for payment plan details", time: "2 hrs ago" },
  ];

  const quickActions = [
    {
      label: "Property Management",
      icon: <RiseOutlined />,
      color: "#3b82f6",
      bg: "#eff6ff",
      onClick: () => navigate("/dashboard/developer/property-management"),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* ✅ HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <Title level={2} style={{ margin: 0, color: "#1f2937" }}>
            Developer Dashboard
          </Title>
          <Text type="secondary">Track leads, presentations and performance in real-time.</Text>
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
            style={{ background: "#F97316", borderColor: "#F97316" }}
          >
            Alerts
          </Button>
        </div>
      </div>

      {/* ✅ STATS */}
      <Row gutter={[16, 16]} className="mb-8">
        {stats.map((stat, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card bordered={false} className="shadow-sm rounded-xl h-full">
              <div className="flex justify-between items-start">
                <div>
                  <Text type="secondary" className="block mb-1">
                    {stat.label}
                  </Text>
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

      {/* ✅ CHARTS */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} lg={16}>
          <Card bordered={false} className="shadow-sm rounded-xl h-full" title="Leads Trend">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={leadsTrend}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af" }} />
                <Tooltip />
                <Legend verticalAlign="top" height={36} iconType="circle" />

                <Area
                  type="monotone"
                  dataKey="leads"
                  stroke="#F97316"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorLeads)"
                  name="Leads"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card bordered={false} className="shadow-sm rounded-xl h-full" title="Units Sold">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={unitsSoldMonthly}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
                <Tooltip cursor={{ fill: "transparent" }} />
                <Bar dataKey="units" fill="#10b981" radius={[6, 6, 0, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* ✅ BOTTOM */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} lg={8}>
          <Card bordered={false} className="shadow-sm rounded-xl h-full" title="Quick Actions">
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, i) => (
                <div
                  key={i}
                  onClick={action.onClick}
                  className="flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors border border-dashed border-gray-200"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl mb-2"
                    style={{ backgroundColor: action.bg, color: action.color }}
                  >
                    {action.icon}
                  </div>
                  <Text strong style={{ fontSize: 13 }}>
                    {action.label}
                  </Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card bordered={false} className="shadow-sm rounded-xl h-full" title="Recent Leads">
            <List
              itemLayout="horizontal"
              dataSource={recentLeads}
              renderItem={(item) => (
                <List.Item className="border-b-0 py-3">
                  <List.Item.Meta
                    avatar={
                      <Avatar style={{ backgroundColor: "#fff7ed", color: "#F97316" }}>
                        {item.name.charAt(0)}
                      </Avatar>
                    }
                    title={<Text strong>{item.title}</Text>}
                    description={
                      <div className="flex justify-between items-center text-xs">
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

export default DeveloperDashboard;
