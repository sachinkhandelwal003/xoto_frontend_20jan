import { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
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

import {
  Card,
  Row,
  Col,
  Select,
  Button,
  Typography,
  Tag,
  Avatar,
  List,
} from "antd";

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

  const inventoryStatus = [
    { name: "Available", value: 120 },
    { name: "Booked", value: 32 },
    { name: "Sold", value: 18 },
  ];

  const dealFunnel = [
    { stage: "Leads", count: 34 },
    { stage: "Site Visits", count: 18 },
    { stage: "Bookings", count: 9 },
    { stage: "Deals Closed", count: 5 },
  ];

  const COLORS = ["#3b82f6", "#f59e0b", "#10b981"];

  const stats = [
    {
      label: "Total Projects",
      value: "6",
      change: 10,
      icon: <RiseOutlined />,
      color: "#3b82f6",
      bg: "#eff6ff",
    },
    {
      label: "Available Units",
      value: "120",
      change: 5,
      icon: <HomeOutlined />,
      color: "#10b981",
      bg: "#ecfdf5",
    },
    {
      label: "Units Sold",
      value: "18",
      change: 12,
      icon: <TeamOutlined />,
      color: "#F97316",
      bg: "#fff7ed",
    },
    {
      label: "Commission Pending",
      value: "$42K",
      change: -3,
      icon: <PercentageOutlined />,
      color: "#ef4444",
      bg: "#fef2f2",
    },
  ];

  const recentDeals = [
    { client: "Ahmed Khan", project: "Marina Tower", unit: "A-302", status: "Booked" },
    { client: "Sarah Ali", project: "Downtown Heights", unit: "B-110", status: "Token Paid" },
    { client: "Ravi Sharma", project: "Palm Residency", unit: "C-210", status: "Contract Signed" },
  ];

  const upcomingVisits = [
    { client: "Ahmed Khan", project: "Marina Tower", time: "Tomorrow 11:00 AM" },
    { client: "Sarah Ali", project: "Downtown Heights", time: "Tomorrow 2:30 PM" },
  ];

  const topProjects = [
    { project: "Marina Tower", units: 12 },
    { project: "Downtown Heights", units: 8 },
    { project: "Palm Residency", units: 5 },
  ];

  const quickActions = [
    {
      label: "Projects",
      icon: <RiseOutlined />,
      color: "#3b82f6",
      onClick: () => navigate("/dashboard/developer/projects"),
    },
    {
      label: "Inventory",
      icon: <HomeOutlined />,
      color: "#10b981",
      onClick: () => navigate("/dashboard/developer/inventory"),
    },
    {
      label: "Site Visits",
      icon: <TeamOutlined />,
      color: "#f97316",
      onClick: () => navigate("/dashboard/developer/site-visits"),
    },
    {
      label: "Bookings",
      icon: <FileTextOutlined />,
      color: "#6366f1",
      onClick: () => navigate("/dashboard/developer/bookings"),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-8">
        <div>
          <Title level={2}>Developer Dashboard</Title>
          <Text type="secondary">Monitor projects, inventory, visits and deals.</Text>
        </div>

        <div className="flex gap-3">
          <Select defaultValue="7d" style={{ width: 160 }} onChange={setTimeRange}>
            <Option value="7d">Last 7 Days</Option>
            <Option value="30d">Last 30 Days</Option>
            <Option value="90d">Last 90 Days</Option>
          </Select>

          <Button type="primary" icon={<BellOutlined />}>
            Alerts
          </Button>
        </div>
      </div>

      {/* STATS */}

      <Row gutter={[16, 16]} className="mb-8">
        {stats.map((stat, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card bordered={false}>
              <div className="flex justify-between">
                <div>
                  <Text type="secondary">{stat.label}</Text>
                  <Title level={3}>{stat.value}</Title>
                </div>

                <div style={{
                  background: stat.bg,
                  color: stat.color,
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  {stat.icon}
                </div>
              </div>

              <Tag
                color={stat.change > 0 ? "green" : "red"}
                icon={stat.change > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              >
                {Math.abs(stat.change)}%
              </Tag>
            </Card>
          </Col>
        ))}
      </Row>

      {/* CHARTS */}

      <Row gutter={[16, 16]} className="mb-8">

        <Col xs={24} lg={16}>
          <Card title="Lead Interest Trend">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={leadsTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="leads" stroke="#F97316" fill="#F97316" fillOpacity={0.2}/>
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Units Sold">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={unitsSoldMonthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <Tooltip />
                <Bar dataKey="units" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

      </Row>

      {/* PIPELINE + INVENTORY */}

      <Row gutter={[16,16]} className="mb-8">

        <Col xs={24} lg={12}>
          <Card title="Sales Pipeline">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dealFunnel}>
                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                <XAxis dataKey="stage"/>
                <YAxis/>
                <Tooltip/>
                <Bar dataKey="count" fill="#6366f1"/>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Inventory Status">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={inventoryStatus} dataKey="value" outerRadius={100} label>
                  {inventoryStatus.map((entry,index)=>(
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip/>
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

      </Row>

      {/* QUICK ACTIONS + VISITS */}

      <Row gutter={[16,16]} className="mb-8">

        <Col xs={24} md={12}>
          <Card title="Quick Actions">
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action,i)=>(
                <div
                  key={i}
                  onClick={action.onClick}
                  className="cursor-pointer border rounded-lg p-4 text-center hover:bg-gray-50"
                >
                  <div style={{fontSize:22,color:action.color}}>
                    {action.icon}
                  </div>
                  <Text strong>{action.label}</Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Upcoming Site Visits">
            <List
              dataSource={upcomingVisits}
              renderItem={(item)=>(
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar>{item.client.charAt(0)}</Avatar>}
                    title={item.project}
                    description={`${item.client} • ${item.time}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

      </Row>

      {/* DEALS + PROJECT PERFORMANCE */}

      <Row gutter={[16,16]}>

        <Col xs={24} md={12}>
          <Card title="Recent Deals">
            <List
              dataSource={recentDeals}
              renderItem={(item)=>(
                <List.Item>
                  <div className="flex justify-between w-full">
                    <Text>{item.client} • {item.unit}</Text>
                    <Tag color="blue">{item.status}</Tag>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Top Performing Projects">
            <List
              dataSource={topProjects}
              renderItem={(item)=>(
                <List.Item>
                  <div className="flex justify-between w-full">
                    <Text>{item.project}</Text>
                    <Tag color="green">{item.units} sold</Tag>
                  </div>
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