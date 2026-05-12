import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
  Card, Row, Col, Typography, Spin, List, message, Avatar,
} from 'antd';
import {
  UserOutlined, HomeOutlined, DollarOutlined,
  RiseOutlined, FallOutlined, PhoneOutlined,
  MailOutlined, CheckCircleOutlined, EditOutlined,
  CalendarOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import io from 'socket.io-client';
import axios from 'axios';
import {apiService} from "../../../manageApi/utils/custom.apiservice"
const { Title, Text } = Typography;

// ─── Theme ────────────────────────────────────────────────────────────────────
const THEME = {
  primary:      '#5c039b',
  primaryLight: '#f3e8ff',
  primaryMid:   '#9333ea',
  success:      '#16a34a',
  successLight: '#dcfce7',
  info:         '#0369a1',
  infoLight:    '#e0f2fe',
  warning:      '#b45309',
  warningLight: '#fef3c7',
  error:        '#b91c1c',
  errorLight:   '#fee2e2',
  gray:         '#64748b',
  grayLight:    '#f8fafc',
};

// ─── Sub‑components (unchanged) ──────────────────────────────────────────────
const StagePill = ({ stage }) => {
  const map = {
    'New':           { bg: '#e0f2fe', color: '#0369a1' },
    'Contacted':     { bg: '#e0f2fe', color: '#0369a1' },
    'Qualified':     { bg: '#f3e8ff', color: '#7e22ce' },
    'In Discussion':  { bg: '#fef3c7', color: '#b45309' },
    'Site Visit Scheduled': { bg: '#fef3c7', color: '#b45309' },
    'Offer Made':    { bg: '#f3e8ff', color: '#7e22ce' },
    'Reserved':      { bg: '#dcfce7', color: '#16a34a' },
    'SPA Signed':    { bg: '#dcfce7', color: '#16a34a' },
    'Completed':     { bg: '#dcfce7', color: '#16a34a' },
    'Not Proceeding':{ bg: '#f1f5f9', color: '#475569' },
  };
  const s = map[stage] || { bg: '#f1f5f9', color: '#475569' };
  return (
    <span style={{
      fontSize: 11, padding: '2px 10px', borderRadius: 20,
      background: s.bg, color: s.color, fontWeight: 500, whiteSpace: 'nowrap',
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
      background: s.bg, color: s.color, fontWeight: 500,
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getInitials = (name) => {
  if (!name) return '??';
  const parts = name.split(' ');
  return parts.length > 1
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : name.substring(0, 2).toUpperCase();
};

const getStageColor = (stage) => {
  const map = {
    'New': THEME.info,
    'Contacted': THEME.info,
    'Qualified': THEME.primaryMid,
    'In Discussion': THEME.warning,
    'Site Visit Scheduled': THEME.warning,
    'Offer Made': THEME.primary,
    'Reserved': THEME.primary,
    'SPA Signed': THEME.success,
    'Completed': THEME.success,
    'Not Proceeding': THEME.gray,
  };
  return map[stage] || THEME.gray;
};

// ─── API Base URL (adjust as needed) ──────────────────────────────────────────
// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// ─── Main Component ───────────────────────────────────────────────────────────
const GridAdvisorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [pipelineStages, setPipelineStages] = useState([]);
  const [leads, setLeads] = useState([]);
  const [activity, setActivity] = useState([]);
  const [advisorInfo, setAdvisorInfo] = useState({});
  const [activityChartData, setActivityChartData] = useState([]); // optional, can be empty initially
  const [socket, setSocket] = useState(null);

  // ── Fetch Dashboard Data ────────────────────────────────────────────────────
  const fetchDashboard = async () => {
    try {
      // or from context
const { data } = await apiService.get('/gridadvisor/me/dashboard');
       const response = await apiService.get('/gridadvisor/me/dashboard');
const { advisor, leadStats, activityFeed } = response.data;
      setAdvisorInfo(advisor);

      // Build stats cards
      const breakdown = leadStats?.breakdown || {};
      setStats([
        {
          label: 'Active Leads',
          value: leadStats.totalActive,
          badge: `${advisor.workload?.totalLeadsAssigned || 0} total`,
          badgeType: 'info',
          icon: <UserOutlined />,
          bg: THEME.primaryLight,
          color: THEME.primary,
        },
        {
          label: 'Active Deals', 
          value:
            (breakdown['In Discussion'] || 0) +
            (breakdown['Offer Made'] || 0) +
            (breakdown['Reserved'] || 0),
          badge: 'In progress',
          badgeType: 'info',
          icon: <DollarOutlined />,
          bg: THEME.infoLight,
          color: THEME.info,
        },
        {
          label: 'Site Visits',
          value: breakdown['Site Visit Scheduled'] || 0,
          badge: 'Scheduled',
          badgeType: 'warn',
          icon: <CalendarOutlined />,
          bg: THEME.warningLight,
          color: THEME.warning,
        },
        {
          label: 'Deals Closed',
          value: advisor.workload?.totalDealsCompleted || 0,
          badge: 'All time',
          badgeType: 'up',
          icon: <CheckCircleOutlined />,
          bg: THEME.successLight,
          color: THEME.success,
        },
        {
          label: 'Conversion',
          value: advisor.workload?.totalLeadsAssigned > 0
            ? `${Math.round(
                (advisor.workload.totalDealsCompleted / advisor.workload.totalLeadsAssigned) * 100
              )}%`
            : '0%',
          badge: 'Your performance',
          badgeType: 'info',
          icon: <RiseOutlined />,
          bg: THEME.primaryLight,
          color: THEME.primary,
        },
        {
          label: 'Presentations',
          value: advisor.workload?.totalPresentationsGenerated || 0,
          badge: 'Generated',
          badgeType: 'info',
          icon: <HomeOutlined />,
          bg: THEME.successLight,
          color: THEME.success,
        },
      ]);

      // Pipeline chart
      const stageOrder = [
        'New', 'Contacted', 'Qualified', 'In Discussion',
        'Site Visit Scheduled', 'Offer Made', 'Reserved', 'SPA Signed', 'Completed',
      ];
      const pipeline = stageOrder.map((stage) => ({
        stage,
        count: breakdown[stage] || 0,
        color: getStageColor(stage),
      }));
      setPipelineStages(pipeline);

      // Recent leads (table)
      const recentLeads = (leadStats.recent || []).map((lead) => ({
        _id: lead._id,
        initials: getInitials(lead.customerName || ''),
        name: lead.customerName || `Lead ${lead._id.slice(-4)}`,
        phone: lead.customerPhone || '—',
        property: lead.requirementsSummary || '—',
        stage: lead.status,
        budget: lead.budget ? `₹${lead.budget}` : '—',
        avatarBg: '#f3e8ff',
        avatarColor: THEME.primary,
      }));
      setLeads(recentLeads);

      // Activity feed
      const activityItems = (activityFeed || []).map((item) => ({
        icon: <EditOutlined />, // you can customise based on item.type later
        iconBg: THEME.infoLight,
        iconColor: THEME.info,
        text: item.message,
        time: new Date(item.timestamp).toLocaleString(),
      }));
      setActivity(activityItems);

      // (Optional) Activity chart data – if you add a dedicated endpoint
      // setActivityChartData(...)
    } catch (err) {
      message.error('Failed to load dashboard');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── WebSocket Connection & Event Listeners ──────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    const newSocket = io( {
      auth: { token },
    });

    newSocket.on('connect', () => {
      console.log('Dashboard WS connected');
    });

    // New lead assigned
    newSocket.on('lead:assigned', (data) => {
      message.info('New lead assigned!');
      fetchDashboard(); // refresh all data
    });

    // Lead status changed
    newSocket.on('lead:statusChanged', (data) => {
      fetchDashboard(); // you could also update only the specific lead, but refresh is safe
    });

    // Inactivity warning (from cron)
    newSocket.on('lead:inactivityWarning', (data) => {
      // Add as a new activity entry with warning style
      const warningActivity = {
        icon: <ClockCircleOutlined />,
        iconBg: THEME.warningLight,
        iconColor: THEME.warning,
        text: data.message,
        time: new Date().toLocaleString(),
      };
      setActivity((prev) => [warningActivity, ...prev]);
      message.warning(data.message);
    });

    setSocket(newSocket);

    // Cleanup
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // ── Initial Data Load ──────────────────────────────────────────────────────
  useEffect(() => {
    fetchDashboard();
  }, []);

  // ── Loading Screen ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  // ── Main UI ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '28px 32px', background: '#faf5ff', minHeight: '100vh', fontFamily: 'inherit' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: THEME.primary, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <HomeOutlined style={{ color: '#fff', fontSize: 16 }} />
            </div>
            <Title level={3} style={{ margin: 0, color: THEME.primary }}>My Dashboard</Title>
          </div>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Welcome back, {advisorInfo?.fullName || 'Advisor'} — your activity for{' '}
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        </div>
        <div
          style={{
            padding: '8px 18px', background: THEME.primary, color: '#fff',
            borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}
          onClick={() => (window.location.href = '/')}
        >
          Go to Home
        </div>
      </div>

      {/* Stats Grid */}
      <Row gutter={[14, 14]} style={{ marginBottom: 20 }}>
        {stats.map((s, i) => (
          <Col xs={24} sm={12} xl={4} key={i}>
            <Card bordered={false} style={cardStyle} bodyStyle={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <Text style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{s.label}</Text>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, background: s.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, fontSize: 15,
                }}>
                  {s.icon}
                </div>
              </div>
              <div style={{ fontSize: 26, fontWeight: 600, color: '#111827', lineHeight: 1, marginBottom: 8 }}>
                {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
              </div>
              <BadgePill text={s.badge} type={s.badgeType} />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts Row */}
      <Row gutter={[14, 14]} style={{ marginBottom: 20 }}>
        {/* Activity Chart (optional, currently using mock data) */}
        <Col xs={24} lg={14}>
          <Card
            bordered={false}
            style={cardStyle}
            title={<span style={{ fontSize: 14, fontWeight: 600, color: THEME.primary }}>Lead Activity — Last 7 Days</span>}
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
                    <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={THEME.primary} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gConv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={THEME.success} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={THEME.success} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0e6ff" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 16px rgba(92,3,155,0.12)', fontSize: 13 }}
                />
                <Area type="monotone" name="New Leads" dataKey="leads" stroke={THEME.primary} fill="url(#gLeads)" strokeWidth={2.5} dot={false} />
                <Area type="monotone" name="Conversions" dataKey="conversions" stroke={THEME.success} fill="url(#gConv)" strokeWidth={2.5} dot={false} />
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

      {/* Bottom Row */}
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
                  {['Client', 'Property', 'Stage', 'Budget'].map((h) => (
                    <th
                      key={h}
                      style={{
                        fontSize: 11, color: '#9ca3af', fontWeight: 600, paddingBottom: 10,
                        paddingRight: 12, textAlign: 'left',
                        borderBottom: '1px solid #f3e8ff', textTransform: 'uppercase', letterSpacing: '0.04em',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead._id} style={{ transition: 'background 0.15s' }}>
                    <td style={{ padding: '11px 12px 11px 0', borderBottom: '1px solid #faf5ff' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%',
                          background: lead.avatarBg, color: lead.avatarColor,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700, flexShrink: 0,
                        }}>
                          {lead.initials}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{lead.name}</div>
                          <div style={{ fontSize: 11, color: '#9ca3af' }}>{lead.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '11px 12px 11px 0', color: '#6b7280', fontSize: 12, borderBottom: '1px solid #faf5ff' }}>
                      {lead.property}
                    </td>
                    <td style={{ padding: '11px 12px 11px 0', borderBottom: '1px solid #faf5ff' }}>
                      <StagePill stage={lead.stage} />
                    </td>
                    <td style={{ padding: '11px 0', fontWeight: 600, color: THEME.primary, borderBottom: '1px solid #faf5ff' }}>
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
                <List.Item
                  style={{
                    padding: '10px 0',
                    borderBottom: i < activity.length - 1 ? '1px solid #faf5ff' : 'none',
                    alignItems: 'flex-start',
                  }}
                >
                  <div style={{ display: 'flex', gap: 12, width: '100%' }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                      background: item.iconBg, color: item.iconColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                    }}>
                      {item.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>{item.text}</div>
                      <div style={{
                        fontSize: 11, color: '#9ca3af', marginTop: 3,
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}>
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