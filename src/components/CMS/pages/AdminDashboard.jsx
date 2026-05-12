import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar
} from 'recharts';
import { 
  TeamOutlined, 
  ArrowUpOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  DollarOutlined,
  ArrowRightOutlined,
  ApiOutlined,
  FileDoneOutlined
} from '@ant-design/icons';
import { Card, Row, Col, Typography, Tag, Statistic, Spin, Button, List } from 'antd';

const { Title, Text } = Typography;

const THEME = {
  primary: '#722ed1',
  primaryBg: '#f9f0ff',
  success: '#52c41a',
  info: '#1890ff',
  warning: '#faad14',
  error: '#f5222d',
  revenue: '#00b96b'
};

// --- PURE OVERVIEW MOCK DATA ---
const mockDashboardData = {
  overview: {
    totalAgents: 450,
    totalProperties: 1250,
    pendingApprovals: 28, // Total count for the stats card
    totalCommissions: 1250000 
  },
  sourceAnalytics: [
    { _id: 'Agents Network', count: 650 },
    { _id: 'Website Direct', count: 320 },
    { _id: 'XOTO Campaigns', count: 210 },
    { _id: 'Referrals', count: 70 }
  ],
  operationsTimeline: [
    { date: '13 Feb', leads: 45, deals: 5 },
    { date: '14 Feb', leads: 52, deals: 7 },
    { date: '15 Feb', leads: 38, deals: 4 },
    { date: '16 Feb', leads: 65, deals: 10 },
    { date: '17 Feb', leads: 48, deals: 6 },
    { date: '18 Feb', leads: 72, deals: 12 },
    { date: '19 Feb', leads: 95, deals: 15 }
  ],
  dealStages: [
    { stage: 'New Leads', count: 850 },
    { stage: 'Site Visits', count: 320 },
    { stage: 'Token Paid', count: 150 },
    { stage: 'Closed Deals', count: 95 }
  ],
  // Changed from individual items to aggregate summaries
  pendingSummaries: [
    { type: 'Agent Registrations', count: 12, link: '/approvals/agents', color: 'blue' },
    { type: 'Commission Payouts', count: 8, link: '/approvals/commissions', color: 'green' },
    { type: 'Developer Profiles', count: 3, link: '/approvals/developers', color: 'purple' },
    { type: 'Property Listings', count: 5, link: '/approvals/properties', color: 'orange' }
  ],
  systemUsage: {
    aiPresentations: 1450, 
    activeCampaigns: 12,   
    botQueries: 340        
  }
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setDashboardData(mockDashboardData);
      setLoading(false);
    }, 800); 
  }, []);

  const getSourcePieData = () => {
    const colors = [THEME.primary, THEME.info, THEME.warning, THEME.success];
    return dashboardData?.sourceAnalytics?.map((item, index) => ({
      name: item._id,
      value: item.count,
      color: colors[index % colors.length]
    })) || [];
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen"><Spin size="large" tip="Loading Xoto Overview..." /></div>;

  const statsCards = [
    { label: 'Pending Approvals', value: dashboardData.overview.pendingApprovals, icon: <ExclamationCircleOutlined />, color: THEME.warning, bg: '#fffbe6' },
    { label: 'Total Verified Agents', value: dashboardData.overview.totalAgents, icon: <TeamOutlined />, color: THEME.info, bg: '#e6f7ff' },
    { label: 'Active Inventory', value: dashboardData.overview.totalProperties, icon: <HomeOutlined />, color: THEME.primary, bg: THEME.primaryBg },
    { label: 'Total Commission ($)', value: dashboardData.overview.totalCommissions.toLocaleString(), icon: <DollarOutlined />, color: THEME.revenue, bg: '#f6ffed' },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <Title level={2} style={{ margin: 0 }}>Platform Overview</Title>
          <Text type="secondary">High-level snapshot of Xoto Grid operations and metrics.</Text>
          
        </div>
        <div className="flex gap-3 bg-primary text-white cursor-pointer p-2 rounded-lg shadow-sm"> 
        <button className='cursor-pointer' onClick={() => window.location.href = '/'}>Go To Home</button>
        </div>
      </div>

      {/* TOP STATS GRID */}
      <Row gutter={[16, 16]} className="mb-8">
        {statsCards.map((stat, i) => (
          <Col xs={24} sm={12} xl={6} key={i}>
            <Card bordered={false} className="shadow-sm rounded-xl hover:shadow-md transition-shadow">
              <Statistic 
                title={<Text type="secondary" className="font-medium">{stat.label}</Text>}
                value={stat.value}
                prefix={
                  <div className="p-2 rounded-lg mr-3 flex items-center justify-center" style={{ backgroundColor: stat.bg, color: stat.color, width: '40px', height: '40px' }}>
                    {stat.icon}
                  </div>
                }
                valueStyle={{ fontWeight: '600', fontSize: '24px' }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* MIDDLE CHARTS GRID */}
      <Row gutter={[16, 16]} className="mb-8">
        {/* Operations Timeline */}
        <Col xs={24} lg={16}>
          <Card bordered={false} className="shadow-sm rounded-xl h-full" title="Operations Timeline (Leads vs Deals)">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={dashboardData.operationsTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={THEME.primary} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDeals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={THEME.success} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={THEME.success} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#8c8c8c', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#8c8c8c', fontSize: 12}} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" name="New Leads" dataKey="leads" stroke={THEME.primary} fillOpacity={1} fill="url(#colorLeads)" strokeWidth={3} />
                <Area type="monotone" name="Closed Deals" dataKey="deals" stroke={THEME.success} fillOpacity={1} fill="url(#colorDeals)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Source Analytics Pie Chart */}
        <Col xs={24} lg={8}>
          <Card bordered={false} className="shadow-sm rounded-xl h-full" title="Lead Sources">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={getSourcePieData()} innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value">
                  {getSourcePieData().map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip itemStyle={{ color: '#333' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* BOTTOM OVERVIEW GRID */}
      <Row gutter={[16, 16]}>
        
        {/* Summary of Pending Items (Instead of Actions) */}
        <Col xs={24} md={8}>
          <Card 
            title={<><FileDoneOutlined className="mr-2 text-yellow-600"/> Pending Approvals Summary</>} 
            bordered={false} 
            className="shadow-sm rounded-xl h-full"
            extra={<Button type="link" size="small">View All</Button>}
          >
            <List 
              itemLayout="horizontal"
              dataSource={dashboardData.pendingSummaries}
              renderItem={(item) => (
                <List.Item
                  actions={[<a href={item.link} className="text-gray-400 hover:text-purple-600"><ArrowRightOutlined /></a>]}
                >
                  <List.Item.Meta 
                    title={<span className="font-medium text-gray-700">{item.type}</span>}
                  />
                  <Tag color={item.color} className="rounded-full px-3">{item.count} Pending</Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Deal Conversion Funnel */}
        <Col xs={24} md={8}>
          <Card title="Deal Conversion Funnel" bordered={false} className="shadow-sm rounded-xl h-full">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dashboardData.dealStages} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="stage" type="category" width={90} tick={{fontSize: 12, fill: '#8c8c8c'}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                <Bar dataKey="count" fill={THEME.info} radius={[0, 4, 4, 0]} barSize={16}>
                  {dashboardData.dealStages.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={index === 3 ? THEME.success : THEME.info} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* AI & System Usage */}
        <Col xs={24} md={8}>
          <Card title="AI & System Usage" bordered={false} className="shadow-sm rounded-xl h-full">
            <Row gutter={[12, 12]}>
              <Col span={24}>
                <Card size="small" bordered={false} className="bg-purple-50 rounded-lg flex items-center">
                  <Statistic 
                    title="AI Presentations Generated" 
                    value={dashboardData.systemUsage.aiPresentations} 
                    prefix={<ApiOutlined className="mr-2" />}
                    valueStyle={{color: THEME.primary, fontSize: '22px', fontWeight: 'bold'}} 
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" bordered={false} className="bg-blue-50 text-center rounded-lg">
                  <Statistic title="Active Campaigns" value={dashboardData.systemUsage.activeCampaigns} valueStyle={{color: THEME.info, fontSize: '18px', fontWeight: 'bold'}} />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" bordered={false} className="bg-green-50 text-center rounded-lg">
                  <Statistic title="Xobia Bot Queries" value={dashboardData.systemUsage.botQueries} valueStyle={{color: THEME.success, fontSize: '18px', fontWeight: 'bold'}} />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>

      </Row>
    </div>
  );
};

export default AdminDashboard;