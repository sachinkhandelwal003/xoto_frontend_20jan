import { useState, useEffect, useContext } from 'react';
import {
  Card, Row, Col, Typography, Statistic, Spin, Table, Tag, Avatar, List, message,
} from 'antd';
import {
  UsergroupAddOutlined,
  WalletOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  LockOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { apiService } from '../../../manageApi/utils/custom.apiservice'; 
import { AuthContext } from '../../../manageApi/context/AuthContext';     

const { Title, Text } = Typography;

// ─── Status pill component (mirrors lead statuses) ──────────────────────
const StagePill = ({ status }) => {
  const map = {
    new:                   { bg: '#e0f2fe', color: '#0369a1' },
    contacted:             { bg: '#e0f2fe', color: '#0369a1' },
    qualified:             { bg: '#f3e8ff', color: '#7e22ce' },
    in_discussion:         { bg: '#fef3c7', color: '#b45309' },
    site_visit_scheduled:  { bg: '#fef3c7', color: '#b45309' },
    offer_made:            { bg: '#f3e8ff', color: '#7e22ce' },
    reserved:              { bg: '#dcfce7', color: '#16a34a' },
    spa_signed:            { bg: '#dcfce7', color: '#16a34a' },
    completed:             { bg: '#dcfce7', color: '#16a34a' },
    not_proceeding:        { bg: '#f1f5f9', color: '#475569' },
  };
  const s = map[status] || { bg: '#f1f5f9', color: '#475569' };
  return (
    <span
      style={{
        fontSize: 11,
        padding: '2px 10px',
        borderRadius: 20,
        background: s.bg,
        color: s.color,
        fontWeight: 500,
        whiteSpace: 'nowrap',
      }}
    >
      {status.replace(/_/g, ' ').toUpperCase()}
    </span>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────
const ReferralPartnerDashboard = () => {
  const { user } = useContext(AuthContext); 
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [recentLeads, setRecentLeads] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [partnerName, setPartnerName] = useState('');
  const [monthlyRank, setMonthlyRank] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState({
    percentage: 0,
    identity: false,
    bankDetails: false,
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await apiService.get('/referral/dashboard');
      const { partner, stats: s, leads, leaderboard: lb } = data;

      setPartnerName(partner.firstName);
      setStats(s);
      setRecentLeads(leads || []);
      setLeaderboard(lb || []);
      setMonthlyRank(partner.leaderboard?.monthlyRank || null);
      setProfileCompletion(partner.profileCompletion || {});
    } catch (err) {
      message.error('Failed to load dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  const profileComplete = profileCompletion.percentage >= 100;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <Title level={2} style={{ color: '#4c1d95', marginBottom: 0 }}>
          Welcome back, {partnerName || user?.firstName || 'Partner'}! 👋
        </Title>
        <Text type="secondary" className="text-lg">
          Here is your referral overview and recent activity.
        </Text>
      </div>

      {/* Stats Cards */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-2xl shadow-sm border-l-4 border-[#03A4F4] hover:shadow-md transition-all">
            <Statistic
              title={<span className="text-gray-500 font-semibold text-base">Total Referrals Submitted</span>}
              value={stats.submitted || 0}
              prefix={<UsergroupAddOutlined className="text-[#03A4F4] mr-2" />}
              valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '28px' }}
            />
            <div className="text-xs text-gray-400 mt-2">
              {stats.activeLeads ?? 0} active · {stats.converted ?? 0} converted
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-2xl shadow-sm border-l-4 border-green-500 hover:shadow-md transition-all">
            <Statistic
              title={<span className="text-gray-500 font-semibold text-base">Conversion Rate</span>}
              value={stats.conversionRate || '0%'}
              prefix={<CheckCircleOutlined className="text-green-500 mr-2" />}
              valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '28px' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-2xl shadow-sm border-l-4 border-purple-500 hover:shadow-md transition-all">
            <Statistic
              title={<span className="text-gray-500 font-semibold text-base">Total Earnings (AED)</span>}
              value={profileComplete ? (stats.commissionEarned || 0).toLocaleString() : (
                <span className="flex items-center gap-1 text-2xl">
                  <LockOutlined className="text-purple-500" />
                  <Text style={{ fontSize: '18px', color: '#b45309' }}>Locked</Text>
                </span>
              )}
              prefix={<WalletOutlined className="text-purple-500 mr-2" />}
              valueStyle={{ color: profileComplete ? '#1f2937' : '#b45309', fontWeight: 'bold', fontSize: profileComplete ? '28px' : '20px' }}
            />
            {!profileComplete && (
              <div className="text-xs text-orange-600 mt-2">
                Complete profile to unlock payouts
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-2xl shadow-sm border-l-4 border-yellow-500 hover:shadow-md transition-all">
            <Statistic
              title={<span className="text-gray-500 font-semibold text-base">Your Rank (Monthly)</span>}
              value={monthlyRank ? `#${monthlyRank}` : '—'}
              prefix={<TrophyOutlined className="text-yellow-500 mr-2" />}
              valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '28px' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} className="mt-8">
       
        <Col xs={24} lg={16}>
          <Card
            title={<span className="text-lg font-semibold text-purple-900">My Recent Leads</span>}
            className="rounded-2xl shadow-sm border-0"
          >
            {recentLeads.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-gray-400">
                <UsergroupAddOutlined style={{ fontSize: '48px', marginBottom: '16px', color: '#e5e7eb' }} />
                <Text className="text-gray-500 text-lg">No referrals submitted yet.</Text>
                <Text className="text-gray-400">Submit your first lead to start tracking your progress!</Text>
              </div>
            ) : (
              <Table
                dataSource={recentLeads}
                rowKey="_id"
                pagination={false}
                showHeader={true}
                size="middle"
                columns={[
                  {
                    title: 'Client',
                    dataIndex: 'customerName',
                    key: 'customerName',
                    render: (text, record) => (
                      <div className="flex items-center gap-2">
                        <Avatar style={{ backgroundColor: '#f3e8ff', color: '#5c039b', fontWeight: 700 }}>
                          {text?.charAt(0)?.toUpperCase() || '?'}
                        </Avatar>
                        <div>
                          <div className="font-semibold text-gray-800">{text}</div>
                          <div className="text-xs text-gray-400">{record.customerPhone}</div>
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: 'Requirements',
                    key: 'requirements',
                    render: (_, record) => (
                      <span className="text-sm text-gray-600">
                        {record.requirements?.area || '—'} · AED {record.requirements?.budget?.toLocaleString() || '—'}
                      </span>
                    ),
                  },
                  {
                    title: 'Status',
                    dataIndex: 'status',
                    key: 'status',
                    render: (status) => <StagePill status={status} />,
                  },
                  {
                    title: 'Last Activity',
                    dataIndex: 'lastActivity',
                    key: 'lastActivity',
                    render: (date) => (
                      <span className="text-xs text-gray-500">
                        {new Date(date).toLocaleDateString()}
                      </span>
                    ),
                  },
                ]}
              />
            )}
          </Card>
        </Col>

        {/* Leaderboard Widget */}
        <Col xs={24} lg={8}>
          <Card
            title={<span className="text-lg font-semibold text-purple-900">Top Partners</span>}
            className="rounded-2xl shadow-sm border-0 h-full"
          >
            {leaderboard.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-gray-400">
                <TrophyOutlined style={{ fontSize: '40px', marginBottom: '12px', color: '#e5e7eb' }} />
                <Text className="text-gray-500">Leaderboard data will appear once you start referring.</Text>
              </div>
            ) : (
              <List
                dataSource={leaderboard}
                renderItem={(item, index) => (
                  <List.Item style={{ padding: '12px 0', borderBottom: index < leaderboard.length - 1 ? '1px solid #f3e8ff' : 'none' }}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: index === 0 ? '#dcfce7' : '#f3e8ff',
                            color: index === 0 ? '#16a34a' : '#5c039b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: 13,
                          }}
                        >
                          {item.rank}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{item.name}</div>
                          <div className="text-xs text-gray-500">AED {(item.earnings || 0).toLocaleString()} · {item.conversionRate || '0%'}</div>
                        </div>
                      </div>
                      {item.isCurrentUser && (
                        <Tag color="purple" style={{ borderRadius: '20px', fontSize: '10px' }}>You</Tag>
                      )}
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ReferralPartnerDashboard;