import { useState } from 'react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  UserOutlined, 
  FileTextOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  SyncOutlined,
  PlusOutlined,
  PhoneOutlined,
  CalendarOutlined,
  ExportOutlined
} from '@ant-design/icons';
import { Card, Row, Col, Select, Button, Typography, Tag, Avatar, List, Statistic } from 'antd';

const { Title, Text } = Typography;
const { Option } = Select;

const Customerdashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');

  // === ANALYTICS DATA ===
  const pipelineData = [
    { name: 'Mon', leads: 4, converted: 1 },
    { name: 'Tue', leads: 7, converted: 2 },
    { name: 'Wed', leads: 5, converted: 1 },
    { name: 'Thu', leads: 8, converted: 3 },
    { name: 'Fri', leads: 12, converted: 4 },
    { name: 'Sat', leads: 9, converted: 2 },
    { name: 'Sun', leads: 6, converted: 1 },
  ];

  const sourceData = [
    { name: 'Website', value: 40, color: '#722ed1' },
    { name: 'Referral', value: 25, color: '#52c41a' },
    { name: 'Social', value: 20, color: '#1890ff' },
    { name: 'Other', value: 15, color: '#bfbfbf' },
  ];

  // === STATS CONFIG ===
  const stats = [
    { label: 'Total Leads', value: '156', change: 12, icon: <UserOutlined />, color: '#722ed1', bg: '#f9f0ff' },
    { label: 'Follow Ups', value: '42', change: -3, icon: <PhoneOutlined />, color: '#faad14', bg: '#fff7e6' },
    { label: 'Converted', value: '18', change: 8, icon: <CheckCircleOutlined />, color: '#52c41a', bg: '#f6ffed' },
    { label: 'Tasks Due', value: '7', change: 2, icon: <ClockCircleOutlined />, color: '#ff4d4f', bg: '#fff1f0' },
  ];

  const recentActivity = [
    { action: 'Added new lead #4567', user: 'John Smith', time: '15 mins ago', type: 'lead' },
    { action: 'Completed follow-up call', user: 'Sarah Johnson', time: '1 hr ago', type: 'call' },
    { action: 'Generated proposal doc', user: 'System', time: '2 hrs ago', type: 'doc' },
    { action: 'Scheduled client meeting', user: 'Michael Brown', time: '5 hrs ago', type: 'meeting' },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <Title level={2} style={{ margin: 0, color: '#1f2937' }}>Customer Insights</Title>
          <Text type="secondary">Manage your leads pipeline and conversion activities.</Text>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
           <Button icon={<ExportOutlined />}>Export</Button>
           <Button type="primary" icon={<SyncOutlined />} style={{ background: '#722ed1', borderColor: '#722ed1' }}>
              Refresh Data
           </Button>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <Row gutter={[16, 16]} className="mb-8">
        {[
          { label: 'Add Lead', icon: <PlusOutlined />, color: '#722ed1', bg: '#f9f0ff' },
          { label: 'Create Task', icon: <ClockCircleOutlined />, color: '#1890ff', bg: '#e6f7ff' },
          { label: 'Generate Doc', icon: <FileTextOutlined />, color: '#52c41a', bg: '#f6ffed' },
          { label: 'Schedule', icon: <CalendarOutlined />, color: '#faad14', bg: '#fff7e6' },
        ].map((action, i) => (
          <Col xs={12} sm={6} key={i}>
            <Card hoverable className="text-center rounded-xl border-none shadow-sm transition-all" bodyStyle={{ padding: '20px' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl mb-2 mx-auto" style={{ backgroundColor: action.bg, color: action.color }}>
                {action.icon}
              </div>
              <Text strong>{action.label}</Text>
            </Card>
          </Col>
        ))}
      </Row>

      {/* STATS CARDS */}
      <Row gutter={[16, 16]} className="mb-8">
        {stats.map((stat, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card bordered={false} className="shadow-sm rounded-xl h-full">
              <div className="flex justify-between items-start">
                <div>
                  <Text type="secondary" className="block mb-1 text-xs uppercase tracking-wider">{stat.label}</Text>
                  <Title level={3} style={{ margin: 0 }}>{stat.value}</Title>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: stat.bg, color: stat.color }}>
                  {stat.icon}
                </div>
              </div>
              <div className="mt-4">
                <Tag color={stat.change > 0 ? 'success' : 'error'} bordered={false}>
                  {stat.change > 0 ? '+' : ''}{stat.change}%
                </Tag>
                <Text type="secondary" style={{ fontSize: '12px' }}>vs last week</Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* MAIN CHARTS SECTION */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} lg={16}>
          <Card bordered={false} className="shadow-sm rounded-xl h-full" 
            title="Leads & Conversion Pipeline"
            extra={
              <Select defaultValue="7d" size="small" onChange={setTimeRange}>
                <Option value="7d">Last 7 Days</Option>
                <Option value="30d">Last 30 Days</Option>
              </Select>
            }
          >
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={pipelineData}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#722ed1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#722ed1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend verticalAlign="top" height={36} />
                <Area type="monotone" dataKey="leads" stroke="#722ed1" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" name="New Leads" />
                <Area type="monotone" dataKey="converted" stroke="#52c41a" strokeWidth={3} fillOpacity={0} name="Converted" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card bordered={false} className="shadow-sm rounded-xl h-full" title="Lead Sources">
            <div className="relative h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
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
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <Text type="secondary" className="block text-xs">Primary</Text>
                <Title level={4} style={{ margin: 0 }}>40%</Title>
              </div>
            </div>
            
            <div className="mt-4 space-y-3">
              {sourceData.map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <Text className="text-gray-600">{item.name}</Text>
                  </div>
                  <Text strong>{item.value}%</Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* RECENT ACTIVITY */}
      <Card bordered={false} className="shadow-sm rounded-xl" title="Recent Activity">
        <List
          itemLayout="horizontal"
          dataSource={recentActivity}
          renderItem={(item) => (
            <List.Item className="py-4">
              <List.Item.Meta
                avatar={
                  <Avatar style={{ backgroundColor: '#f9f0ff', color: '#722ed1' }} icon={<UserOutlined />} />
                }
                title={
                  <div className="flex justify-between">
                    <Text strong>{item.action}</Text>
                    <Text type="secondary" className="text-xs">{item.time}</Text>
                  </div>
                }
                description={
                  <div className="flex items-center gap-2">
                    <Text type="secondary">Action by: {item.user}</Text>
                    <Tag bordered={false} color="purple" className="text-[10px] px-1">Verified</Tag>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default Customerdashboard;