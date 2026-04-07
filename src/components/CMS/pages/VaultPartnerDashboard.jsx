import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  UserAddOutlined,
  WalletOutlined,
  RocketOutlined,
  BellOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { Card, Row, Col, Select, Button, Typography, Tag, Avatar, List, Skeleton, Badge } from "antd";

const { Title, Text } = Typography;
const { Option } = Select;

const ValuePartnerDashboard = () => {
  const [timeRange, setTimeRange] = useState("7d");
  const [partnerName, setPartnerName] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch Partner Profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch("/api/v1/auth/getprofile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch profile");

        const data = await response.json();
        const name = data?.name || data?.user?.name || data?.data?.name || "Partner";
        
        setPartnerName(name);
      } catch (error) {
        console.error("Profile fetch error:", error);
        setPartnerName("Vikram Singh"); // Fallback name
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // 📈 Earnings/Revenue Data
  const revenueData = [
    { name: "Mon", income: 4000 },
    { name: "Tue", income: 3000 },
    { name: "Wed", income: 5500 },
    { name: "Thu", income: 4800 },
    { name: "Fri", income: 7000 },
    { name: "Sat", income: 8200 },
    { name: "Sun", income: 6500 },
  ];

  // 🏗 Project Distribution
  const projectPerformance = [
    { name: "Project A", sales: 12 },
    { name: "Project B", sales: 19 },
    { name: "Project C", sales: 8 },
    { name: "Project D", sales: 15 },
  ];

  // 💰 Partner Stats
  const stats = [
    {
      label: "Total Commission",
      value: "₹4.2L",
      change: 12,
      icon: <WalletOutlined />,
      color: "#8b5cf6",
      bg: "#f5f3ff",
    },
    {
      label: "Direct Referrals",
      value: "124",
      change: 8,
      icon: <UserAddOutlined />,
      color: "#3b82f6",
      bg: "#eff6ff",
    },
    {
      label: "Active Projects",
      value: "12",
      change: 2,
      icon: <RocketOutlined />,
      color: "#10b981",
      bg: "#ecfdf5",
    },
    {
      label: "Success Rate",
      value: "84%",
      change: -1,
      icon: <SafetyCertificateOutlined />,
      color: "#f59e0b",
      bg: "#fffbeb",
    },
  ];

  // 📋 Recent Activities
  const recentActivities = [
    { partner: "Aman Verma", action: "Completed KYC Verification", status: "Verified", time: "10 mins ago" },
    { partner: "Rajesh Kumar", action: "New Payout Requested", status: "Pending", time: "25 mins ago" },
    { partner: "Global Heights", action: "New Inventory Added", status: "Update", time: "2 hrs ago" },
    { partner: "Sneha Kapoor", action: "Lease Agreement Signed", status: "Closed", time: "5 hrs ago" },
  ];

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen">
      
      {/* 🔹 HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          {loading ? (
            <Skeleton active paragraph={false} style={{ width: 250 }} />
          ) : (
            <>
              <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
                Value Partner Portal <Badge status="processing" color="green" />
              </Title>
              <Text type="secondary">Welcome back, <b>{partnerName}</b>. Here's your partnership overview.</Text>
            </>
          )}
        </div>

        <div className="flex gap-3 mt-4 md:mt-0">
          <Select defaultValue="7d" style={{ width: 140 }} onChange={setTimeRange} size="large">
            <Option value="7d">Weekly</Option>
            <Option value="30d">Monthly</Option>
          </Select>
          <Button type="primary" size="large" icon={<BellOutlined />} className="bg-[#1e293b] border-none">
            Notifications
          </Button>
        </div>
      </div>

      {/* 🔹 STATS CARDS */}
      <Row gutter={[16, 16]} className="mb-8">
        {stats.map((stat, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card bordered={false} className="hover:shadow-md transition-shadow rounded-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <Text type="secondary" strong style={{ fontSize: 12, textTransform: "uppercase" }}>{stat.label}</Text>
                  <Title level={2} style={{ margin: "4px 0 0 0" }}>{stat.value}</Title>
                </div>
                <Avatar 
                  shape="square" 
                  size={48} 
                  icon={stat.icon} 
                  style={{ backgroundColor: stat.bg, color: stat.color, borderRadius: 12 }} 
                />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Tag color={stat.change > 0 ? "success" : "error"} className="rounded-full border-none px-3">
                  {stat.change > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(stat.change)}%
                </Tag>
                <Text type="secondary" style={{ fontSize: 12 }}>vs last month</Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 🔹 CHARTS */}
      <Row gutter={[16, 16]} className="mb-8">
        {/* Revenue Area Chart */}
        <Col xs={24} lg={15}>
          <Card bordered={false} className="shadow-sm rounded-2xl" title="Revenue Milestone (INR)">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="income" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Project Sales Bar Chart */}
        <Col xs={24} lg={9}>
          <Card bordered={false} className="shadow-sm rounded-2xl" title="Project Sales Distribution">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={projectPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: 8, border: 'none' }} />
                <Bar dataKey="sales" fill="#3b82f6" radius={[0, 10, 10, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* 🔹 RECENT ACTIVITY */}
      <Row>
        <Col xs={24}>
          <Card bordered={false} className="shadow-sm rounded-2xl" title="Recent Partner Activities">
            <List
              itemLayout="horizontal"
              dataSource={recentActivities}
              renderItem={(item) => (
                <List.Item actions={[<Button type="link" key="view">View Details</Button>]}>
                  <List.Item.Meta
                    avatar={<Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.partner}`} size="large" />}
                    title={<Text strong>{item.partner}</Text>}
                    description={
                      <div className="flex items-center gap-2 mt-1">
                        <Text type="secondary">{item.action}</Text> 
                        <Tag color={item.status === 'Verified' || item.status === 'Closed' ? 'success' : item.status === 'Pending' ? 'warning' : 'processing'}>
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
  );
};

export default ValuePartnerDashboard;