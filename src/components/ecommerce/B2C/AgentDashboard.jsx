import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
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
  Cell
} from "recharts";
import {
  TeamOutlined,
  HomeOutlined,
  DollarOutlined,
  PercentageOutlined,
  BellOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import { Card, Row, Col, Select, Button, Typography, Tag, Avatar, List } from "antd";

// import { apiService } from '../../../manageApi/utils/custom.apiservice';

const { Title, Text } = Typography;
const { Option } = Select;

// 💎 Floating Dark-Mode Pill Tooltip (Ultra Premium)
const UltraTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111827] text-white px-5 py-3 rounded-full shadow-[0_10px_40px_rgba(92,3,155,0.4)] flex items-center gap-4 border border-gray-700 transform -translate-y-2">
        <span className="text-gray-400 font-medium tracking-widest uppercase text-xs">
          {label}
        </span>
        <div className="w-px h-6 bg-gray-600"></div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#d8b4fe] to-[#c084fc]">
            {payload[0].value}
          </span>
          <span className="text-gray-400 text-xs ml-1">Leads</span>
        </div>
      </div>
    );
  }
  return null;
};

// ✨ Animated Pulsing Dot for Hover State
const PulsingDot = (props) => {
  const { cx, cy } = props;
  return (
    <svg x={cx - 15} y={cy - 15} width={30} height={30} className="overflow-visible">
      <circle cx="15" cy="15" r="12" fill="#5C039B" className="animate-ping opacity-40" />
      <circle cx="15" cy="15" r="7" fill="#fff" stroke="#5C039B" strokeWidth="3" className="shadow-lg" />
    </svg>
  );
};

const AgentDashboard = () => {
  const [timeRange, setTimeRange] = useState("7d");
  const [userProfile, setUserProfile] = useState(null);

  const user = useSelector((state) => state.auth?.user);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // const profileRes = await apiService.get('/profile/get-profile-data');
        // if (profileRes.data) {
        //   setUserProfile(profileRes.data);
        // }
      } catch (error) {
        console.error("Failed to load profile", error);
      }
    };

    if (user?.id || user?._id) {
       fetchProfileData();
    }
  }, [user]);

  const getDisplayName = () => {
    if (userProfile?.data?.first_name) {
      return `${userProfile.data.first_name} ${userProfile.data.last_name || ''}`.trim();
    }
    if (user?.first_name) {
      return `${user.first_name} ${user.last_name || ''}`.trim();
    }
    if (user?.name) {
      if (typeof user.name === 'object') {
        return `${user.name.first_name || ''} ${user.name.last_name || ''}`.trim();
      }
      return user.name;
    }
    return 'Agent';
  };

  const leadsTrend = [
    { name: "Mon", leads: 3 },
    { name: "Tue", leads: 5 },
    { name: "Wed", leads: 4 },
    { name: "Thu", leads: 7 },
    { name: "Fri", leads: 9 },
    { name: "Sat", leads: 6 },
    { name: "Sun", leads: 12 }, // Tweaked slightly to show a nice upward curve
  ];

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
    { label: "Active Leads", value: "18", change: 10, icon: <TeamOutlined />, color: "#5C039B", bg: "#f3e8ff" },
    { label: "Site Visits", value: "9", change: 6, icon: <HomeOutlined />, color: "#3b82f6", bg: "#eff6ff" },
    { label: "Deals Closed", value: "5", change: 3, icon: <DollarOutlined />, color: "#10b981", bg: "#ecfdf5" },
    { label: "Conversion Rate", value: "27%", change: -2, icon: <PercentageOutlined />, color: "#f59e0b", bg: "#fffbeb" },
  ];

  const recentClients = [
    { name: "Rahul Mehta", title: "Interested in 3BHK - Downtown", time: "15 mins ago" },
    { name: "Priya Sharma", title: "Requested Call Back", time: "40 mins ago" },
    { name: "Ali Hassan", title: "Scheduled Site Visit", time: "1 hr ago" },
    { name: "Neha Gupta", title: "Payment Plan Discussion", time: "2 hrs ago" },
  ];

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen">
      
      {/* 🔹 HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>
            Welcome, {getDisplayName()} 👋
          </Title>
          <Text type="secondary" style={{ fontSize: '15px' }}>
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
            style={{ 
              background: "linear-gradient(135deg, #5C039B 0%, #9D4EDD 100%)", 
              borderColor: "transparent", 
              boxShadow: "0 4px 15px rgba(92,3,155,0.25)",
              fontWeight: 600
            }}
          >
            Alerts
          </Button>
        </div>
      </div>

      {/* 🔹 STATS */}
      <Row gutter={[16, 16]} className="mb-8">
        {stats.map((stat, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card bordered={false} className="shadow-sm rounded-2xl h-full hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex justify-between items-start">
                <div>
                  <Text type="secondary" style={{ fontWeight: 500 }}>{stat.label}</Text>
                  <Title level={2} style={{ margin: '4px 0 0 0', fontWeight: 700, color: '#1e293b' }}>
                    {stat.value}
                  </Title>
                </div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner"
                  style={{ backgroundColor: stat.bg, color: stat.color }}
                >
                  {stat.icon}
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2">
                <Tag
                  color={stat.change > 0 ? "success" : "error"}
                  icon={stat.change > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  style={{ borderRadius: "6px", fontWeight: 600, border: 'none' }}
                >
                  {Math.abs(stat.change)}%
                </Tag>
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 500 }}>
                  vs last period
                </Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 🔹 CHARTS */}
      <Row gutter={[24, 24]} className="mb-8">
        
        {/* 🔥 ULTRA UNIQUE LEADS TREND */}
        <Col xs={24} lg={16}>
          <Card 
            bordered={false} 
            className="rounded-3xl" 
            style={{ 
              boxShadow: "0 10px 40px rgba(0,0,0,0.03)", 
              background: "linear-gradient(180deg, #ffffff 0%, #faf5ff 100%)" 
            }}
          >
            <div className="flex justify-between items-center mb-8 px-2">
              <div>
                <Title level={4} style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>Leads Velocity</Title>
                <Text type="secondary" style={{ fontSize: '14px', fontWeight: 500 }}>7-Day traction overview</Text>
              </div>
              <Tag color="#5C039B" style={{ borderRadius: '20px', padding: '6px 16px', fontWeight: 600, fontSize: '13px', border: 'none', boxShadow: '0 4px 10px rgba(92,3,155,0.2)' }}>
                +24% Growth
              </Tag>
            </div>

            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={leadsTrend} margin={{ top: 20, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  {/* 🌈 Gradient for the Line */}
                  <linearGradient id="lineColor" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#5C039B" />
                    <stop offset="50%" stopColor="#9D4EDD" />
                    <stop offset="100%" stopColor="#d8b4fe" />
                  </linearGradient>

                  {/* 🌫️ Soft Area Fade */}
                  <linearGradient id="areaFade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9D4EDD" stopOpacity={0.4}/>
                    <stop offset="100%" stopColor="#9D4EDD" stopOpacity={0}/>
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" opacity={0.7} />

                <XAxis 
                  dataKey="name" 
                  tick={{ fill: "#64748b", fontSize: 13, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  dy={15}
                />
                <YAxis 
                  tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  dx={-10}
                />

                <Tooltip 
                  content={<UltraTooltip />} 
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '5 5' }}
                  offset={-40}
                />

                <Area
                  type="natural" // Organic smooth curve
                  dataKey="leads"
                  stroke="url(#lineColor)"
                  strokeWidth={5}
                  fill="url(#areaFade)"
                  activeDot={<PulsingDot />} // Animated hover dot
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* 🔥 DEALS CLOSED BAR CHART */}
        <Col xs={24} lg={8}>
          <Card 
            bordered={false} 
            className="rounded-3xl h-full" 
            style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.02)" }}
          >
            <div className="mb-6 px-2">
              <Title level={4} style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>Deals Closed</Title>
              <Text type="secondary" style={{ fontSize: '14px', fontWeight: 500 }}>Monthly conversions</Text>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dealsClosed} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" opacity={0.7} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: "#64748b", fontSize: 13, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  dx={-10}
                />
                <Tooltip 
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 600 }}
                />
                <Bar dataKey="deals" radius={[8, 8, 8, 8]} barSize={28}>
                  {dealsClosed.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === dealsClosed.length - 1 ? "url(#lineColor)" : "#e2e8f0"} 
                      style={{ transition: 'all 0.3s ease' }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* 🔹 RECENT CLIENTS */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card bordered={false} className="shadow-sm rounded-3xl" title={<span style={{ fontWeight: 800, fontSize: '18px', color: '#0f172a' }}>Recent Clients</span>}>
            <List
              itemLayout="horizontal"
              dataSource={recentClients}
              renderItem={(item) => (
                <List.Item className="hover:bg-slate-50 transition-colors rounded-xl px-4 py-3 border-b-0 mb-2">
                  <List.Item.Meta
                    avatar={
                      <Avatar size={48} style={{ backgroundColor: "#f3e8ff", color: "#5C039B", fontWeight: 800, fontSize: '18px' }}>
                        {item.name.charAt(0)}
                      </Avatar>
                    }
                    title={<Text strong style={{ fontSize: "16px", color: '#1e293b' }}>{item.title}</Text>}
                    description={
                      <div className="flex justify-between text-sm mt-1">
                        <Text type="secondary" style={{ fontWeight: 500 }}>{item.name}</Text>
                        <Text type="secondary" className="flex items-center" style={{ color: '#94a3b8', fontWeight: 500 }}>
                           {item.time}
                        </Text>
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