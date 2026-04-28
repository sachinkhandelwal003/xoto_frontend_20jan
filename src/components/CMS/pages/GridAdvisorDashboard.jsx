import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Card, Row, Col, Typography, Tag, Statistic, Spin, Badge, Avatar, List, Progress } from 'antd';
import {
  UserOutlined, HomeOutlined, DollarOutlined,
  RiseOutlined, FallOutlined, PhoneOutlined,
  MailOutlined, CheckCircleOutlined, EditOutlined,
  CalendarOutlined, ClockCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

// ─── Theme ────────────────────────────────────────────────────────────────────
const THEME = {
  primary:     '#5c039b',
  primaryLight:'#f3e8ff',
  primaryMid:  '#9333ea',
  success:     '#16a34a',
  successLight:'#dcfce7',
  info:        '#0369a1',
  infoLight:   '#e0f2fe',
  warning:     '#b45309',
  warningLight:'#fef3c7',
  error:       '#b91c1c',
  errorLight:  '#fee2e2',
  gray:        '#64748b',
  grayLight:   '#f8fafc',
};

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const stats = [
  { label: 'Assigned Leads',   value: 34,      suffix: '',      badge: '+5 this week', badgeType: 'up',   icon: <UserOutlined />,    bg: THEME.primaryLight, color: THEME.primary },
  { label: 'Active Deals',     value: 12,      suffix: '',      badge: '3 closing soon', badgeType: 'info', icon: <HomeOutlined />,    bg: THEME.infoLight,    color: THEME.info },
  { label: 'Site Visits',      value: 8,       suffix: '',      badge: '2 pending',   badgeType: 'warn', icon: <CalendarOutlined />, bg: THEME.warningLight, color: THEME.warning },
  { label: 'Commission (MTD)', value: 18400,   prefix: '$',     badge: '↑ 12% vs last mo', badgeType: 'up', icon: <DollarOutlined />, bg: THEME.successLight, color: THEME.success },
  { label: 'Deals Closed',     value: 4,       suffix: '',      badge: 'This month',  badgeType: 'up',   icon: <CheckCircleOutlined />, bg: THEME.primaryLight, color: THEME.primary },
  { label: 'Conversion Rate',  value: '38%',   suffix: '',      badge: '↓ 3% vs last mo', badgeType: 'down', icon: <RiseOutlined />,  bg: THEME.errorLight,   color: THEME.error },
];

const activityChartData = [
  { day: 'Mon', leads: 4,  conversions: 1 },
  { day: 'Tue', leads: 6,  conversions: 2 },
  { day: 'Wed', leads: 3,  conversions: 1 },
  { day: 'Thu', leads: 8,  conversions: 3 },
  { day: 'Fri', leads: 5,  conversions: 2 },
  { day: 'Sat', leads: 7,  conversions: 3 },
  { day: 'Sun', leads: 6,  conversions: 2 },
];

const pipelineStages = [
  { stage: 'New Leads',   count: 850, color: THEME.info },
  { stage: 'Site Visits', count: 320, color: THEME.primaryMid },
  { stage: 'Negotiation', count: 150, color: THEME.warning },
  { stage: 'Token Paid',  count: 70,  color: THEME.primary },
  { stage: 'Closed',      count: 48,  color: THEME.success },
];

const leads = [
  { initials: 'AK', name: 'Arjun Kapoor',  phone: '+91 98100 00001', property: '3BHK, Sector 67',       stage: 'Negotiation', budget: '₹1.2Cr', avatarBg: '#ddd6fe', avatarColor: '#4c1d95' },
  { initials: 'PS', name: 'Priya Sharma',  phone: '+91 98100 00002', property: '2BHK, Golf Course Rd',  stage: 'Site Visit',  budget: '₹75L',   avatarBg: '#bfdbfe', avatarColor: '#1e3a8a' },
  { initials: 'RV', name: 'Rohit Verma',   phone: '+91 98100 00003', property: 'Villa, DLF Phase 4',    stage: 'Closed',      budget: '₹3.5Cr', avatarBg: '#bbf7d0', avatarColor: '#14532d' },
  { initials: 'MJ', name: 'Meera Joshi',   phone: '+91 98100 00004', property: '4BHK, Sushant Lok',     stage: 'New',         budget: '₹2.1Cr', avatarBg: '#fed7aa', avatarColor: '#7c2d12' },
  { initials: 'SK', name: 'Sameer Khan',   phone: '+91 98100 00005', property: 'Plot, Sector 57',       stage: 'Site Visit',  budget: '₹90L',   avatarBg: '#fde68a', avatarColor: '#78350f' },
];

const activity = [
  { icon: <PhoneOutlined />,       iconBg: THEME.successLight, iconColor: THEME.success, text: 'Call with Arjun Kapoor — discussed token details',           time: 'Today, 11:30 AM' },
  { icon: <HomeOutlined />,        iconBg: THEME.primaryLight, iconColor: THEME.primary, text: 'Site visit confirmed — Priya Sharma, Golf Course Rd',         time: 'Today, 10:00 AM' },
  { icon: <CheckCircleOutlined />, iconBg: THEME.successLight, iconColor: THEME.success, text: 'Deal closed — Rohit Verma, DLF Phase 4 Villa',               time: 'Yesterday, 4:15 PM' },
  { icon: <MailOutlined />,        iconBg: THEME.warningLight, iconColor: THEME.warning, text: 'Brochure sent to Meera Joshi via WhatsApp',                   time: 'Yesterday, 2:30 PM' },
  { icon: <EditOutlined />,        iconBg: THEME.infoLight,    iconColor: THEME.info,    text: 'Note added — Sameer Khan prefers east-facing plot',            time: 'Yesterday, 11:00 AM' },
  { icon: <PhoneOutlined />,       iconBg: THEME.successLight, iconColor: THEME.success, text: 'Follow-up call scheduled with 3 new leads',                   time: 'Apr 23, 9:45 AM' },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

const StagePill = ({ stage }) => {
  const map = {
    'New':         { bg: '#e0f2fe', color: '#0369a1' },
    'Site Visit':  { bg: '#fef3c7', color: '#b45309' },
    'Negotiation': { bg: '#f3e8ff', color: '#7e22ce' },
    'Closed':      { bg: '#dcfce7', color: '#16a34a' },
  };
  const s = map[stage] || { bg: '#f1f5f9', color: '#475569' };
  return (
    <span style={{
      fontSize: 11, padding: '2px 10px', borderRadius: 20,
      background: s.bg, color: s.color, fontWeight: 500, whiteSpace: 'nowrap'
    }}>
      {stage}
    </span>
  );
};

const BadgePill = ({ text, type }) => {
  const styles = {
    up:   { bg: '#dcfce7', color: '#15803d' },
    down: { bg: '#fee2e2', color: '#b91c1c' },
    warn: { bg: '#fef3c7', color: '#b45309' },
    info: { bg: '#e0f2fe', color: '#0369a1' },
  };
  const s = styles[type] || styles.info;
  return (
    <span style={{
      fontSize: 11, padding: '2px 8px', borderRadius: 20,
      background: s.bg, color: s.color, fontWeight: 500
    }}>
      {text}
    </span>
  );
};

const cardStyle = {
  borderRadius: 14,
  border: '1px solid #ede9fe',
  boxShadow: '0 1px 4px rgba(92,3,155,0.06)',
};

// ─── Main Component ────────────────────────────────────────────────────────────

const GridAdvisorDashboard = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 32px', background: '#faf5ff', minHeight: '100vh', fontFamily: 'inherit' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: THEME.primary, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <HomeOutlined style={{ color: '#fff', fontSize: 16 }} />
            </div>
            <Title level={3} style={{ margin: 0, color: THEME.primary }}>My Dashboard</Title>
          </div>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Welcome back, Sarah — here's your activity for today, Apr 27
          </Text>
        </div>
        <div style={{
          padding: '8px 18px', background: THEME.primary, color: '#fff',
          borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer'
        }}
          onClick={() => window.location.href = '/'}
        >
          Go to Home
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <Row gutter={[14, 14]} style={{ marginBottom: 20 }}>
        {stats.map((s, i) => (
          <Col xs={24} sm={12} xl={4} key={i}>
            <Card bordered={false} style={cardStyle} bodyStyle={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <Text style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{s.label}</Text>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, background: s.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, fontSize: 15
                }}>
                  {s.icon}
                </div>
              </div>
              <div style={{ fontSize: 26, fontWeight: 600, color: '#111827', lineHeight: 1, marginBottom: 8 }}>
                {s.prefix}{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
              </div>
              <BadgePill text={s.badge} type={s.badgeType} />
            </Card>
          </Col>
        ))}
      </Row>

      {/* ── Charts Row ── */}
      <Row gutter={[14, 14]} style={{ marginBottom: 20 }}>

        {/* Activity Chart */}
        <Col xs={24} lg={14}>
          <Card
            bordered={false}
            style={cardStyle}
            title={
              <span style={{ fontSize: 14, fontWeight: 600, color: THEME.primary }}>
                Lead Activity — Last 7 Days
              </span>
            }
            extra={
              <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#6b7280' }}>
                <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: THEME.primary, marginRight: 5 }} />New Leads</span>
                <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: THEME.success, marginRight: 5 }} />Conversions</span>
              </div>
            }
          >
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={activityChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={THEME.primary} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={THEME.primary} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gConv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={THEME.success} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={THEME.success} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0e6ff" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 16px rgba(92,3,155,0.12)', fontSize: 13 }}
                />
                <Area type="monotone" name="New Leads"   dataKey="leads"       stroke={THEME.primary} fill="url(#gLeads)" strokeWidth={2.5} dot={false} />
                <Area type="monotone" name="Conversions" dataKey="conversions"  stroke={THEME.success} fill="url(#gConv)"  strokeWidth={2.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Pipeline Bar Chart */}
        <Col xs={24} lg={10}>
          <Card
            bordered={false}
            style={cardStyle}
            title={<span style={{ fontSize: 14, fontWeight: 600, color: THEME.primary }}>Pipeline by Stage</span>}
          >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={pipelineStages} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0e6ff" />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="stage" type="category" width={100}
                  tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 16px rgba(92,3,155,0.12)', fontSize: 13 }}
                  cursor={{ fill: 'rgba(92,3,155,0.04)' }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={14}>
                  {pipelineStages.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* ── Bottom Row ── */}
      <Row gutter={[14, 14]}>

        {/* Assigned Leads Table */}
        <Col xs={24} lg={14}>
          <Card
            bordered={false}
            style={cardStyle}
            title={<span style={{ fontSize: 14, fontWeight: 600, color: THEME.primary }}>Assigned Leads</span>}
            extra={<a style={{ fontSize: 13, color: THEME.primary }}>View All →</a>}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['Client', 'Property', 'Stage', 'Budget'].map(h => (
                    <th key={h} style={{
                      fontSize: 11, color: '#9ca3af', fontWeight: 600, paddingBottom: 10,
                      paddingRight: 12, textAlign: 'left',
                      borderBottom: '1px solid #f3e8ff', textTransform: 'uppercase', letterSpacing: '0.04em'
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, i) => (
                  <tr key={i} style={{ transition: 'background 0.15s' }}>
                    <td style={{ padding: '11px 12px 11px 0', borderBottom: i < leads.length - 1 ? '1px solid #faf5ff' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%',
                          background: lead.avatarBg, color: lead.avatarColor,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700, flexShrink: 0
                        }}>
                          {lead.initials}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{lead.name}</div>
                          <div style={{ fontSize: 11, color: '#9ca3af' }}>{lead.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '11px 12px 11px 0', color: '#6b7280', fontSize: 12, borderBottom: i < leads.length - 1 ? '1px solid #faf5ff' : 'none' }}>
                      {lead.property}
                    </td>
                    <td style={{ padding: '11px 12px 11px 0', borderBottom: i < leads.length - 1 ? '1px solid #faf5ff' : 'none' }}>
                      <StagePill stage={lead.stage} />
                    </td>
                    <td style={{ padding: '11px 0', fontWeight: 600, color: THEME.primary, borderBottom: i < leads.length - 1 ? '1px solid #faf5ff' : 'none' }}>
                      {lead.budget}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </Col>

        {/* Recent Activity */}
        <Col xs={24} lg={10}>
          <Card
            bordered={false}
            style={{ ...cardStyle, height: '100%' }}
            title={<span style={{ fontSize: 14, fontWeight: 600, color: THEME.primary }}>Recent Activity</span>}
          >
            <List
              dataSource={activity}
              renderItem={(item, i) => (
                <List.Item style={{
                  padding: '10px 0',
                  borderBottom: i < activity.length - 1 ? '1px solid #faf5ff' : 'none',
                  alignItems: 'flex-start',
                }}>
                  <div style={{ display: 'flex', gap: 12, width: '100%' }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                      background: item.iconBg, color: item.iconColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14
                    }}>
                      {item.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>{item.text}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ClockCircleOutlined style={{ fontSize: 10 }} />
                        {item.time}
                      </div>
                    </div>
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

export default GridAdvisorDashboard;