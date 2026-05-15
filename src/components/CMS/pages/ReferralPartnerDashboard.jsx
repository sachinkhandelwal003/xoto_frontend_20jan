import React from 'react';
import { Card, Row, Col, Typography, Tag, Badge, Avatar, List, Progress, Button, Space, Divider } from 'antd';
import {
  UserOutlined, DollarOutlined, CheckCircleOutlined,
  FileTextOutlined, PlusOutlined, ArrowRightOutlined,
  ClockCircleOutlined, EnvironmentOutlined, WalletOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

// ─── Theme System ─────────────────────────────────────────────────────────────
const THEME = {
  primary: '#5C039B',
  primaryMid: '#7C3AED',
  primaryLight: '#F5F0FF',
  success: '#10B981',
  successLight: '#E6F4EA',
  info: '#3B82F6',
  infoLight: '#EBF5FF',
  warning: '#F59E0B',
  warningLight: '#FFFBEB',
  textDark: '#0F172A',
  textMuted: '#64748B',
  bgPage: '#F8FAFC',
  border: '#E2E8F0',
};

// ─── Enriched Static Mock Data ────────────────────────────────────────────────
const STATIC_DATA = {
  partner: {
    firstName: 'Amit',
    lastName: 'Patel',
    completionPercentage: 75,
  },
  stats: {
    in_progress: 8,
    total: 24,
    completed: 5,
    commission: { paid: 3 }
  },
  recentLeads: [
    {
      _id: '1',
      enquiry_type: 'buy',
      status: 'new',
      contact_info: { name: { first_name: 'Rahul', last_name: 'Sharma' } },
      requirements: { location: 'Andheri West', budget: '₹2.5 Cr', spaceType: '3 BHK' },
      createdAt: new Date().toISOString()
    },
    {
      _id: '2',
      enquiry_type: 'rent',
      status: 'contacted',
      contact_info: { name: { first_name: 'Priya', last_name: 'Verma' } },
      requirements: { location: 'Bandra', budget: '₹85k/mo', spaceType: '2 BHK' },
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      _id: '3',
      enquiry_type: 'buy',
      status: 'qualified',
      contact_info: { name: { first_name: 'Sunil', last_name: 'Kumar' } },
      requirements: { location: 'Goregaon', budget: '₹1.8 Cr', spaceType: '2 BHK' },
      createdAt: new Date(Date.now() - 172800000).toISOString()
    },
    {
      _id: '4',
      enquiry_type: 'sell',
      status: 'completed',
      contact_info: { name: { first_name: 'Neha', last_name: 'Singh' } },
      requirements: { location: 'South Bombay', budget: '₹6.0 Cr', spaceType: '4 BHK' },
      createdAt: new Date(Date.now() - 259200000).toISOString()
    },
    {
      _id: '5',
      enquiry_type: 'buy',
      status: 'in_discussion',
      contact_info: { name: { first_name: 'Vikram', last_name: 'Mehta' } },
      requirements: { location: 'Thane', budget: '₹95 Lakhs', spaceType: '1 BHK' },
      createdAt: new Date(Date.now() - 345600000).toISOString()
    }
  ]
};

// ─── Color Map Helper ─────────────────────────────────────────────────────────
const getStatusConfig = (status) => {
  const configs = {
    new: { color: '#3B82F6', bg: '#EBF5FF', label: 'New Lead' },
    contacted: { color: '#8B5CF6', bg: '#F5F3FF', label: 'Contacted' },
    qualified: { color: '#06B6D4', bg: '#ECFEFF', label: 'Qualified' },
    in_discussion: { color: '#F59E0B', bg: '#FFFBEB', label: 'In Discussion' },
    site_visit_scheduled: { color: '#06B6D4', bg: '#E6F4EA', label: 'Site Visit' },
    offer_made: { color: '#EC4899', bg: '#FDF2F8', label: 'Offer Made' },
    completed: { color: '#10B981', bg: '#E6F4EA', label: 'Completed' },
    not_proceeding: { color: '#EF4444', bg: '#FEF2F2', label: 'Dropped' }
  };
  return configs[status] || { color: '#64748B', bg: '#F1F5F9', label: status };
};

const StatusPill = ({ status }) => {
  const config = getStatusConfig(status);
  return (
    <Tag style={{
      backgroundColor: config.bg,
      color: config.color,
      borderColor: 'transparent',
      borderRadius: '6px',
      fontWeight: 600,
      padding: '4px 10px'
    }}>
      {config.label}
    </Tag>
  );
};

const StatCard = ({ icon, label, value, color, suffix, subtext }) => (
  <Card
    bordered={false}
    style={{
      borderRadius: 16,
      boxShadow: '0 4px 20px rgba(15, 23, 42, 0.02)',
      border: `1px solid ${THEME.border}`,
      height: '100%'
    }}
  >
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: `${color}12`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {React.cloneElement(icon, { style: { fontSize: 20, color } })}
      </div>
      <div>
        <div style={{ fontSize: 13, color: THEME.textMuted, fontWeight: 500, marginBottom: 4 }}>
          {label}
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: THEME.textDark, lineHeight: 1 }}>
          {typeof value === 'number' ? value.toLocaleString() : value || '—'}
          {suffix && <span style={{ fontSize: 14, fontWeight: 400, color: THEME.textMuted, marginLeft: 4 }}>{suffix}</span>}
        </div>
        {subtext && <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 6 }}>{subtext}</div>}
      </div>
    </div>
  </Card>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const ReferralPartnerDashboard = () => {
  const navigate = useNavigate();

  // Safe selector configuration fallbacks
  const authState = useSelector((state) => state?.auth);
  const user = authState?.user || null;

  const partnerName = `${STATIC_DATA.partner.firstName} ${STATIC_DATA.partner.lastName}`;
  const profileCompletion = STATIC_DATA.partner.completionPercentage;
  const isProfileComplete = profileCompletion === 100;
  const stats = STATIC_DATA.stats;
  const recentLeads = STATIC_DATA.recentLeads;

  return (
    <div style={{ backgroundColor: THEME.bgPage, minHeight: '100vh', padding: '40px 32px' }}>

      {/* Upper Layout Header Block */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24, marginBottom: 32 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: THEME.textDark, fontWeight: 700 }}>
            Welcome back, {STATIC_DATA.partner.firstName}! 👋
          </Title>
          <Text style={{ color: THEME.textMuted, fontSize: 14 }}>
            Track your client referrals and monitor upcoming commission earnings pipeline.
          </Text>
        </div>

        <Space size={12}>
          <Button 
            onClick={() => navigate('/total-leads')} 
            style={{ borderRadius: 10, height: 42, fontWeight: 500, borderColor: THEME.border }}
          >
            My Referrals
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => navigate('/Submit-leads')} 
            style={{ backgroundColor: THEME.primary, borderColor: THEME.primary, borderRadius: 10, height: 42, fontWeight: 500, boxShadow: '0 4px 12px rgba(92, 3, 155, 0.2)' }}
          >
            Submit Lead
          </Button>
        </Space>
      </div>

      <Row gutter={[32, 32]}>
        {/* Left Grid Layout Pipeline */}
        <Col xs={24} lg={18}>

          {/* Main Counter Blocks */}
          <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
            <Col xs={24} sm={12} md={6}>
              <StatCard
                icon={<UserOutlined />}
                label="Active Leads"
                value={stats.in_progress}
                color={THEME.primary}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <StatCard
                icon={<FileTextOutlined />}
                label="Total Referrals"
                value={stats.total}
                color={THEME.info}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <StatCard
                icon={<CheckCircleOutlined />}
                label="Completed Deals"
                value={stats.completed}
                color={THEME.success}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <StatCard
                icon={<DollarOutlined />}
                label={isProfileComplete ? "Paid Commissions" : "Commissions"}
                value={stats.commission?.paid}
                suffix=" Deals"
                color={THEME.warning}
                subtext={!isProfileComplete ? "⚠️ Locked: Finish Profile setup" : "Disbursed successfully"}
              />
            </Col>
          </Row>

          {/* Core Recent Activity Feed Wrapper */}
          <Card
            bordered={false}
            style={{ borderRadius: 20, boxShadow: '0 4px 20px rgba(15, 23, 42, 0.02)', border: `1px solid ${THEME.border}` }}
            title={
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: THEME.textDark }}>Recent Lead Activity</span>
                <span style={{ fontSize: 12, fontWeight: 400, color: THEME.textMuted }}>Latest 5 entries processed</span>
              </div>
            }
            extra={
              <Button type="link" onClick={() => navigate('/total-leads')} style={{ color: THEME.primary, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                View All Referrals <ArrowRightOutlined style={{ fontSize: 12 }} />
              </Button>
            }
          >
            <div style={{ padding: '4px 24px 24px 24px' }}>
              {recentLeads.length > 0 ? (
                <List
                  itemLayout="vertical"
                  dataSource={recentLeads}
                  renderItem={(item) => {
                    const firstName = item.contact_info?.name?.first_name || '';
                    const lastName = item.contact_info?.name?.last_name || '';
                    const clientName = `${firstName} ${lastName}`.trim() || 'Unknown Client';

                    return (
                      <List.Item
                        style={{ padding: '20px 0', borderBottom: `1px solid ${THEME.border}` }}
                        extra={<div style={{ marginTop: 4 }}><StatusPill status={item.status} /></div>}
                      >
                        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                          <Avatar size={44} style={{ backgroundColor: THEME.primaryLight, color: THEME.primary, fontWeight: 700, flexShrink: 0 }}>
                            {clientName.charAt(0) || 'U'}
                          </Avatar>

                          <div style={{ flex: 1 }}>
                            <div style={{ marginBottom: 4 }}>
                              <Text style={{ fontSize: 15, fontWeight: 600, color: THEME.textDark, marginRight: 8 }}>
                                {item.enquiry_type ? `${item.enquiry_type.toUpperCase()} Enquiry` : 'New Lead'}
                              </Text>
                              <Text style={{ fontSize: 14, color: THEME.textMuted }}>
                                • Reference: {clientName}
                              </Text>
                            </div>

                            <Space size={8} style={{ flexWrap: 'wrap', margin: '6px 0 10px' }}>
                              <Tag bordered={false} icon={<EnvironmentOutlined />} style={{ color: THEME.textMuted, background: '#F1F5F9' }}>
                                {item.requirements?.location || 'N/A'}
                              </Tag>
                              <Tag bordered={false} icon={<WalletOutlined />} style={{ color: THEME.textMuted, background: '#F1F5F9' }}>
                                {item.requirements?.budget || 'No Budget Set'}
                              </Tag>
                              <Tag bordered={false} style={{ color: THEME.primary, background: THEME.primaryLight, fontWeight: 500 }}>
                                {item.requirements?.spaceType || 'General'}
                              </Tag>
                            </Space>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: THEME.textMuted, fontSize: 12 }}>
                              <ClockCircleOutlined style={{ fontSize: 11 }} />
                              <span>Logged on {new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                          </div>
                        </div>
                      </List.Item>
                    );
                  }}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <Text type="secondary" style={{ fontSize: 14 }}>No leads registered yet. Generate your first referral payout above!</Text>
                </div>
              )}
            </div>
          </Card>
        </Col>

        {/* Right Utility Dashboard Column Sidebar */}
        <Col xs={24} lg={6}>
          <Card
            bordered={false}
            style={{ borderRadius: 20, boxShadow: '0 4px 20px rgba(15, 23, 42, 0.02)', border: `1px solid ${THEME.border}`, overflow: 'hidden' }}
          >
            <div style={{ height: 80, background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.primaryMid})`, margin: '-24px -24px 0 -24px' }} />
            <div style={{ padding: '0 0 24px 0', textAlign: 'center', marginTop: -36 }}>
              <Badge dot status={isProfileComplete ? "success" : "warning"} offset={[-6, 66]}>
                <Avatar size={76} icon={<UserOutlined />} style={{ background: '#F8FAFC', color: THEME.primary, border: '4px solid #fff', boxShadow: '0 4px 12px rgba(15,23,42,0.08)' }} />
              </Badge>

              <Title level={4} style={{ margin: '12px 0 2px', color: THEME.textDark, fontWeight: 700 }}>
                {partnerName}
              </Title>
              <Text style={{ color: THEME.textMuted, fontSize: 13, display: 'block', marginBottom: 16 }}>
                Verified Referral Agent
              </Text>

              <Divider style={{ margin: '16px 0' }} />

              <div style={{ textAlign: 'left', padding: '0 8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ fontSize: 12, color: THEME.textMuted, fontWeight: 600 }}>Profile Verification</Text>
                  <Text style={{ fontSize: 12, color: THEME.primary, fontWeight: 700 }}>{profileCompletion}%</Text>
                </div>

                <Progress
                  percent={profileCompletion}
                  strokeColor={THEME.primary}
                  showInfo={false}
                  style={{ marginBottom: 12 }}
                />

                {!isProfileComplete ? (
                  <div style={{ background: THEME.warningLight, padding: '10px 12px', borderRadius: 8, border: `1px solid #FEF3C7` }}>
                    <Text style={{ fontSize: 11, color: '#D97706', fontWeight: 500, display: 'block' }}>
                      ⚠️ Earnings feature on hold. Complete setup documentation to unlock automated bank routing transfers.
                    </Text>
                  </div>
                ) : (
                  <div style={{ background: THEME.successLight, padding: '10px 12px', borderRadius: 8, border: `1px solid #D1FAE5`, textAlign: 'center' }}>
                    <Text style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>
                      ✓ Payout Profile Fully Active
                    </Text>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ReferralPartnerDashboard;
