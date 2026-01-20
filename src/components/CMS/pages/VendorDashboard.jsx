import * as React from 'react';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  List, 
  Avatar, 
  Typography, 
  Tag, 
  Select, 
  Button,
  Divider,
  Progress,
  Space
} from 'antd';
import { 
  ShoppingCartOutlined, 
  ClockCircleOutlined, 
  HeartOutlined, 
  FileTextOutlined, 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  DollarOutlined,
  UserOutlined,
  RightOutlined
} from '@ant-design/icons';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

const { Title, Text } = Typography;
const { Option } = Select;

// --- THEME CONFIGURATION ---
const THEME = {
  primary: "#722ed1", // Purple
  secondary: "#1890ff", // Blue
  success: "#52c41a",
  warning: "#faad14",
  error: "#ff4d4f",
  bgLight: "#f9f0ff",
};

// --- ROLE MAPPING ---
const roleSlugMap = {
  0: "superadmin",
  1: "admin",
  5: "vendor-b2c",
  6: "vendor-b2b",
  7: "freelancer",
  11: "accountant",
};

// Placeholder Data
const vendorOrders = [
  { action: 'Received order #7890', user: 'Customer A', time: '10 mins ago', type: 'order', status: 'pending' },
  { action: 'Shipped order #7889', user: 'You', time: '1 hour ago', type: 'shipping', status: 'processing' },
  { action: 'Refund requested #7888', user: 'Customer B', time: '3 hours ago', type: 'refund', status: 'issue' },
  { action: 'Scheduled delivery #7887', user: 'You', time: '5 hours ago', type: 'delivery', status: 'warning' },
  { action: 'Completed order #7886', user: 'You', time: '1 day ago', type: 'complete', status: 'success' },
];

const vendorStats = [
  { label: 'Total Sales', value: '2,500', prefix: '$', change: 15, icon: <DollarOutlined />, trend: 'up', color: THEME.primary, bg: THEME.bgLight },
  { label: 'Pending Orders', value: '5', change: 2, icon: <ClockCircleOutlined />, trend: 'up', color: THEME.warning, bg: '#fff7e6' },
  { label: 'Reviews', value: '12', change: 3, icon: <HeartOutlined />, trend: 'up', color: THEME.error, bg: '#fff1f0' },
  { label: 'Active Listings', value: '8', change: -1, icon: <FileTextOutlined />, trend: 'down', color: THEME.secondary, bg: '#e6f7ff' },
];

const salesData = [
  { name: 'Mon', sales: 400 },
  { name: 'Tue', sales: 300 },
  { name: 'Wed', sales: 550 },
  { name: 'Thu', sales: 450 },
  { name: 'Fri', sales: 600 },
  { name: 'Sat', sales: 800 },
  { name: 'Sun', sales: 700 },
];

const sourceData = [
  { name: 'Direct', value: 45, color: THEME.primary },
  { name: 'Social', value: 30, color: THEME.secondary },
  { name: 'Search', value: 25, color: THEME.success },
];

export default function VendorDashboard() {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get dynamic role slug
  const roleSlug = roleSlugMap[user?.role?.code] ?? "dashboard";

  const [isVendor, setIsVendor] = useState(false);
  const [vendorData, setVendorData] = useState({ orders: [], stats: [] });
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    async function fetchCustomerData() {
      if (!user?.id) return;

      try {
        const response = await axios.get(`https://kotiboxglobaltech.online/api/auth/customer/${user.id}`);
        const data = response.data.customer;
        setIsVendor(data?.isVendor || false);

        if (data?.isVendor) {
          const vendorResponse = await axios.get(`https://kotiboxglobaltech.online/api/vendor/${user.id}/dashboard`, {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          setVendorData({
            orders: vendorResponse.data.orders || vendorOrders,
            stats: vendorResponse.data.stats || vendorStats,
          });
        } else {
          setVendorData({ orders: vendorOrders, stats: vendorStats });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setVendorData({ orders: vendorOrders, stats: vendorStats });
      }
    }

    fetchCustomerData();
  }, [user]);

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // --- NAVIGATION HANDLERS ---
  const handleUpdateProfile = () => navigate(`/dashboard/${roleSlug}/update`);
  const handleManageListings = () => navigate(`/dashboard/${roleSlug}/products`);
  const handleViewOrders = () => navigate(`/dashboard/${roleSlug}/orders`);
  const handleReviews = () => navigate(`/dashboard/${roleSlug}/reviews`);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <Title level={2} style={{ margin: 0, color: '#1f2937' }}>
            {isVendor ? 'Vendor Portal' : 'My Dashboard'}
          </Title>
          <Text type="secondary">Overview of your store performance and orders.</Text>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
           <Select defaultValue="7d" style={{ width: 140 }} onChange={setTimeRange} size="large">
              <Option value="7d">Last 7 Days</Option>
              <Option value="30d">Last 30 Days</Option>
           </Select>
           <Button icon={<SyncOutlined />} size="large">Refresh</Button>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <Row gutter={[16, 16]} className="mb-8">
        {vendorStats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card bordered={false} className="shadow-sm hover:shadow-md transition-all rounded-xl h-full">
              <div className="flex justify-between items-start">
                <div>
                  <Text type="secondary" className="block mb-1">{stat.label}</Text>
                  <Title level={3} style={{ margin: 0 }}>
                    {stat.prefix}{stat.value}
                  </Title>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: stat.bg, color: stat.color }}>
                  {stat.icon}
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <Tag 
                  color={stat.trend === 'up' ? 'success' : 'error'} 
                  icon={stat.trend === 'up' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  style={{ borderRadius: '12px' }}
                >
                  {Math.abs(stat.change)}%
                </Tag>
                <Text type="secondary" style={{ fontSize: '12px' }}>vs last week</Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 3. Main Charts Section */}
      <Row gutter={[16, 16]} className="mb-8">
        {/* Sales Chart */}
        <Col xs={24} lg={16}>
          <Card bordered={false} className="shadow-sm rounded-xl h-full" title="Sales Trends">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={THEME.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="sales" stroke={THEME.primary} strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Traffic Sources */}
        <Col xs={24} lg={8}>
          <Card bordered={false} className="shadow-sm rounded-xl h-full" title="Traffic Sources">
            <div className="relative h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <Text type="secondary" className="block text-xs">Total</Text>
                <Title level={4} style={{ margin: 0 }}>100%</Title>
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              {sourceData.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <Text>{item.name}</Text>
                    <Text strong>{item.value}%</Text>
                  </div>
                  <Progress percent={item.value} showInfo={false} strokeColor={item.color} size="small" />
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 4. Recent Orders List */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card bordered={false} className="shadow-sm rounded-xl" title="Recent Order Activity">
            <List
              itemLayout="horizontal"
              dataSource={vendorData.orders}
              renderItem={(item) => (
                <List.Item className="border-b-0 py-4 hover:bg-gray-50 transition-colors px-4 rounded-lg">
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        size="large"
                        icon={
                          item.type === 'order' ? <ShoppingCartOutlined /> :
                          item.type === 'shipping' ? <CheckCircleOutlined /> :
                          item.type === 'refund' ? <FileTextOutlined /> : <CalendarOutlined />
                        }
                        style={{ 
                          backgroundColor: 
                            item.status === 'success' ? '#f6ffed' : 
                            item.status === 'issue' ? '#fff1f0' : 
                            item.status === 'warning' ? '#fff7e6' : '#e6f7ff',
                          color: 
                            item.status === 'success' ? '#52c41a' : 
                            item.status === 'issue' ? '#ff4d4f' : 
                            item.status === 'warning' ? '#faad14' : '#1890ff',
                          border: '1px solid rgba(0,0,0,0.05)'
                        }}
                      />
                    }
                    title={<Text strong className="text-base">{item.action}</Text>}
                    description={
                      <Space split={<Divider type="vertical" />}>
                        <Text type="secondary" className="text-xs"><UserOutlined /> {item.user}</Text>
                        <Text type="secondary" className="text-xs">{item.time}</Text>
                      </Space>
                    }
                  />
                  <Tag color={
                    item.status === 'success' ? 'green' : 
                    item.status === 'issue' ? 'red' : 
                    item.status === 'warning' ? 'orange' : 'blue'
                  }>
                    {item.status.toUpperCase()}
                  </Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 5. Quick Actions */}
        <Col xs={24} lg={8}>
           <Card bordered={false} className="shadow-sm rounded-xl h-full" title="Quick Actions">
              <Space direction="vertical" className="w-full" size="middle">
                 <Button 
                    block size="large" type="primary" icon={<FileTextOutlined />} 
                    style={{ backgroundColor: THEME.primary, borderColor: THEME.primary }}
                    onClick={handleManageListings}
                 >
                    Manage Listings
                 </Button>
                 <Button 
                    block size="large" icon={<ShoppingCartOutlined />}
                    onClick={handleViewOrders}
                 >
                    View All Orders
                 </Button>
                 <Button 
                    block size="large" icon={<HeartOutlined />}
                    onClick={handleReviews}
                 >
                    Customer Reviews
                 </Button>
                 
                 {/* Update Profile / Pro Tip Box */}
                 <div className="bg-purple-50 p-4 rounded-lg mt-4 border border-purple-100 text-center">
                    <Title level={5} style={{ color: THEME.primary, margin: 0, marginBottom: 4 }}>Complete Your Profile</Title>
                    <Text className="text-xs text-gray-600 block mb-3">
                        Increase customer trust and boost sales by completing your details.
                    </Text>
                    <Button 
                        type="dashed" 
                        size="small" 
                        icon={<RightOutlined />}
                        style={{ color: THEME.primary, borderColor: THEME.primary }}
                        onClick={handleUpdateProfile}
                    >
                        Update Now
                    </Button>
                 </div>
              </Space>
           </Card>
        </Col>
      </Row>

    </div>
  );
}