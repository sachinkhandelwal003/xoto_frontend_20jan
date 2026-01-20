import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { 
  DollarOutlined, 
  TeamOutlined, 
  ShoppingCartOutlined, 
  EnvironmentOutlined, 
  RiseOutlined,
  ArrowUpOutlined,
  PlusOutlined,
  FileTextOutlined,
  UserAddOutlined,
  BellOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { Card, Row, Col, Select, Button, Typography, Tag, Avatar, List, Statistic } from 'antd';

const { Title, Text } = Typography;
const { Option } = Select;

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');

  // === CHART DATA ===
  const salesData = [
    { name: 'Mon', sales: 2400, orders: 24 },
    { name: 'Tue', sales: 3210, orders: 32 },
    { name: 'Wed', sales: 2800, orders: 28 },
    { name: 'Thu', sales: 3980, orders: 40 },
    { name: 'Fri', sales: 4500, orders: 45 },
    { name: 'Sat', sales: 5200, orders: 52 },
    { name: 'Sun', sales: 3800, orders: 38 },
  ];

  const categoryData = [
    { name: 'Garden Tools', value: 35, color: '#10b981' },
    { name: 'Plants & Seeds', value: 28, color: '#8b5cf6' },
    { name: 'Outdoor Decor', value: 20, color: '#f59e0b' },
    { name: 'Irrigation', value: 12, color: '#3b82f6' },
    { name: 'Services', value: 5, color: '#6b7280' },
  ];

  const freelancerStats = [
    { month: 'Jan', active: 45, completed: 120 },
    { month: 'Feb', active: 52, completed: 138 },
    { month: 'Mar', active: 48, completed: 142 },
    { month: 'Apr', active: 61, completed: 165 },
    { month: 'May', active: 72, completed: 180 },
    { month: 'Jun', active: 68, completed: 192 },
  ];

  // === QUICK STATS ===
  const stats = [
    { label: 'Total Revenue', value: 'AED48,921', change: 18.2, icon: <DollarOutlined />, color: '#722ed1', bg: '#f9f0ff' },
    { label: 'Active Freelancers', value: '68', change: 12, icon: <TeamOutlined />, color: '#1890ff', bg: '#e6f7ff' },
    { label: 'Orders', value: '1,234', change: 22, icon: <ShoppingCartOutlined />, color: '#52c41a', bg: '#f6ffed' },
    { label: 'Projects', value: '342', change: 28, icon: <EnvironmentOutlined />, color: '#faad14', bg: '#fff7e6' },
  ];

  const recentActivity = [
    { title: 'New landscaping project', user: 'Rajesh Kumar', time: '10 mins ago', type: 'project' },
    { title: 'Order #7892 Delivered', user: 'Priya Sharma', time: '25 mins ago', type: 'order' },
    { title: 'Lawn design completed', user: 'Amit Patel', time: '1 hr ago', type: 'freelancer' },
    { title: '5★ Review received', user: 'Neha Gupta', time: '2 hrs ago', type: 'review' },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <Title level={2} style={{ margin: 0, color: '#1f2937' }}>Dashboard Overview</Title>
          <Text type="secondary">Welcome back, here's what's happening with your store today.</Text>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
           <Select defaultValue="7d" style={{ width: 120 }} onChange={setTimeRange} size="large">
              <Option value="7d">Last 7 Days</Option>
              <Option value="30d">Last 30 Days</Option>
              <Option value="90d">Last Quarter</Option>
           </Select>
           <Button type="primary" size="large" icon={<BellOutlined />} style={{ background: '#722ed1', borderColor: '#722ed1' }}>
              Notifications
           </Button>
        </div>
      </div>

      {/* STATS CARDS */}
      <Row gutter={[16, 16]} className="mb-8">
        {stats.map((stat, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow rounded-xl h-full">
              <div className="flex justify-between items-start">
                <div>
                  <Text type="secondary" className="block mb-1">{stat.label}</Text>
                  <Title level={3} style={{ margin: 0 }}>{stat.value}</Title>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: stat.bg, color: stat.color }}>
                  {stat.icon}
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <Tag color={stat.change > 0 ? 'success' : 'error'} icon={stat.change > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}>
                  {Math.abs(stat.change)}%
                </Tag>
                <Text type="secondary" style={{ fontSize: '12px' }}>vs last period</Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* MAIN CHARTS SECTION */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} lg={16}>
          <Card bordered={false} className="shadow-sm rounded-xl h-full" title="Revenue & Orders Trend">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Area type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" name="Revenue (AED)" />
                <Area type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" name="Orders" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card bordered={false} className="shadow-sm rounded-xl h-full" title="Sales by Category">
            <div className="relative h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
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
            
            <div className="mt-4 space-y-3">
              {categoryData.slice(0, 3).map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <Text className="text-gray-600">{item.name}</Text>
                  </div>
                  <Text strong>{item.value}%</Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* BOTTOM SECTION */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} lg={8}>
           <Card bordered={false} className="shadow-sm rounded-xl h-full" title="Quick Actions">
              <div className="grid grid-cols-2 gap-4">
                 {[
                    { label: 'Add Product', icon: <PlusOutlined />, color: '#52c41a', bg: '#f6ffed' },
                    { label: 'Post Job', icon: <FileTextOutlined />, color: '#722ed1', bg: '#f9f0ff' },
                    { label: 'Add User', icon: <UserAddOutlined />, color: '#1890ff', bg: '#e6f7ff' },
                    { label: 'Settings', icon: <SettingOutlined />, color: '#faad14', bg: '#fff7e6' },
                 ].map((action, i) => (
                    <div key={i} className="flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors border border-dashed border-gray-200">
                       <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl mb-2" style={{ backgroundColor: action.bg, color: action.color }}>
                          {action.icon}
                       </div>
                       <Text strong>{action.label}</Text>
                    </div>
                 ))}
              </div>
           </Card>
        </Col>

        <Col xs={24} md={12} lg={8}>
           <Card bordered={false} className="shadow-sm rounded-xl h-full" title="Freelancer Activity">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={freelancerStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                  <Bar dataKey="active" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="completed" fill="#e5e7eb" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
           </Card>
        </Col>

        <Col xs={24} lg={8}>
           <Card bordered={false} className="shadow-sm rounded-xl h-full" title="Recent Activity">
              <List
                itemLayout="horizontal"
                dataSource={recentActivity}
                renderItem={(item) => (
                  <List.Item className="border-b-0 py-3">
                    <List.Item.Meta
                      avatar={
                        <Avatar style={{ backgroundColor: '#f0f2f5', color: '#1f2937' }}>
                          {item.user.charAt(0)}
                        </Avatar>
                      }
                      title={<Text strong>{item.title}</Text>}
                      description={
                        <div className="flex justify-between items-center text-xs">
                           <Text type="secondary">{item.user}</Text>
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

export default Dashboard;