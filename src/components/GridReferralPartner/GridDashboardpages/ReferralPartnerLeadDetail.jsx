import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Typography, Avatar, Button, Spin, Descriptions, Tag, Space } from 'antd';
import {
  UserOutlined, PhoneOutlined, MailOutlined, HomeOutlined,
  ArrowLeftOutlined, FileTextOutlined, CheckCircleOutlined,
  DollarOutlined, EnvironmentOutlined, WalletOutlined
} from '@ant-design/icons';
import { apiService } from '../../../manageApi/utils/custom.apiservice';

const { Title, Text } = Typography;

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

const StatCard = ({ icon, label, value, color }) => (
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
          {value}
        </div>
      </div>
    </div>
  </Card>
);

export default function ReferralPartnerLeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLead = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiService.get(`/gridlead/${id}`);
      const data = res?.data?.data || res?.data;
      setLead(data);
    } catch (err) {
      console.error('Failed to fetch lead details', err);
      setError(err?.response?.data?.message || 'Failed to load lead');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { if (id) fetchLead(); }, [id, fetchLead]);

  if (loading) {
    return (
      <div style={{ backgroundColor: THEME.bgPage, minHeight: '100vh', padding: '40px 32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" tip="Loading lead details..." />
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div style={{ backgroundColor: THEME.bgPage, minHeight: '100vh', padding: '40px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ marginBottom: 20 }}>
          <Text type="secondary" style={{ fontSize: 16 }}>{error || 'Lead not found'}</Text>
        </div>
        <Button onClick={() => navigate(-1)} type="primary" style={{ backgroundColor: THEME.primary, borderRadius: '10px' }}>
          <ArrowLeftOutlined style={{ marginRight: 8 }} /> Go Back
        </Button>
      </div>
    );
  }

  const firstName = lead.contact_info?.name?.first_name || '';
  const lastName = lead.contact_info?.name?.last_name || '';
  const clientName = `${firstName} ${lastName}`.trim() || 'Unknown Client';
  const req = lead.requirements || {};
  const locs = req.location_preferences?.map((l) => (typeof l === 'string' ? l : l.area)).filter(Boolean);
  const location = locs?.length ? locs.join(', ') : 'N/A';
  const budget = req.budget_max ? `AED ${(req.budget_max / 1000).toFixed(0)}k` : (req.budget_min ? `Min AED ${(req.budget_min / 1000).toFixed(0)}k` : 'No Budget');
  const spaceType = req.bedrooms != null ? (req.bedrooms === 0 ? 'Studio' : `${req.bedrooms} BR`) : req.property_type || 'General';

  return (
    <div style={{ backgroundColor: THEME.bgPage, minHeight: '100vh', padding: '40px 32px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
            <Button 
              onClick={() => navigate(-1)} 
              style={{ borderRadius: '10px', height: 42 }}
              icon={<ArrowLeftOutlined />}
            >
              Back
            </Button>
          </div>
          <Title level={3} style={{ margin: 0, color: THEME.textDark, fontWeight: 700 }}>
            Lead Details
          </Title>
          <Text style={{ color: THEME.textMuted, fontSize: 14 }}>
            View complete information about this referral lead.
          </Text>
        </div>

        <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={12} md={8}>
            <StatCard
              icon={<FileTextOutlined />}
              label="Status"
              value={<StatusPill status={lead.status} />}
              color={THEME.primary}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <StatCard
              icon={<CheckCircleOutlined />}
              label="Submitted to Xoto"
              value={lead.submitted_to_xoto ? 'Yes' : 'No'}
              color={THEME.success}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <StatCard
              icon={<DollarOutlined />}
              label="Commission Status"
              value={lead.referral_info?.commission_status ? lead.referral_info.commission_status.replace(/_/g, ' ') : 'Pending'}
              color={THEME.warning}
            />
          </Col>
        </Row>

        <Card
          bordered={false}
          style={{ borderRadius: 20, boxShadow: '0 4px 20px rgba(15, 23, 42, 0.02)', border: `1px solid ${THEME.border}`, marginBottom: 32 }}
        >
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <Avatar size={72} style={{ backgroundColor: THEME.primaryLight, color: THEME.primary, fontWeight: 700, fontSize: 28, flexShrink: 0 }}>
                {clientName.charAt(0) || 'U'}
              </Avatar>
              <div style={{ flex: 1, minWidth: 250 }}>
                <div style={{ marginBottom: 8 }}>
                  <Title level={4} style={{ margin: 0, color: THEME.textDark, fontWeight: 700, marginRight: 12 }}>
                    {clientName}
                  </Title>
                </div>
                <Space size={8} style={{ flexWrap: 'wrap', margin: '8px 0 12px' }}>
                  {location && (
                    <Tag bordered={false} icon={<EnvironmentOutlined />} style={{ color: THEME.textMuted, background: '#F1F5F9' }}>
                      {location}
                    </Tag>
                  )}
                  {budget && (
                    <Tag bordered={false} icon={<WalletOutlined />} style={{ color: THEME.textMuted, background: '#F1F5F9' }}>
                      {budget}
                    </Tag>
                  )}
                  <Tag bordered={false} style={{ color: THEME.primary, background: THEME.primaryLight, fontWeight: 500 }}>
                    {spaceType}
                  </Tag>
                </Space>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, color: THEME.textMuted, fontSize: 14 }}>
                  {lead.contact_info?.mobile?.number && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <PhoneOutlined />
                      <span>{lead.contact_info.mobile.country_code || '+971'} {lead.contact_info.mobile.number}</span>
                    </div>
                  )}
                  {lead.contact_info?.email?.address && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <MailOutlined />
                      <span>{lead.contact_info.email.address}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <HomeOutlined />
                    <span>Created on {new Date(lead.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Row gutter={[32, 32]}>
          <Col xs={24} md={12}>
            <Card
              bordered={false}
              title={
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: THEME.textDark }}>Client & Contact</span>
                </div>
              }
              style={{ borderRadius: 20, boxShadow: '0 4px 20px rgba(15, 23, 42, 0.02)', border: `1px solid ${THEME.border}` }}
            >
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="First Name">{firstName || '—'}</Descriptions.Item>
                <Descriptions.Item label="Last Name">{lastName || '—'}</Descriptions.Item>
                <Descriptions.Item label="Phone">
                  {lead.contact_info?.mobile?.number ? `${lead.contact_info.mobile.country_code || '+971'} ${lead.contact_info.mobile.number}` : '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Email">{lead.contact_info?.email?.address || '—'}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              bordered={false}
              title={
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: THEME.textDark }}>Requirements</span>
                </div>
              }
              style={{ borderRadius: 20, boxShadow: '0 4px 20px rgba(15, 23, 42, 0.02)', border: `1px solid ${THEME.border}` }}
            >
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Property Type">{req.property_type || '—'}</Descriptions.Item>
                <Descriptions.Item label="Transaction Type">{req.transaction_type || '—'}</Descriptions.Item>
                <Descriptions.Item label="Location">{location}</Descriptions.Item>
                <Descriptions.Item label="Budget">{budget}</Descriptions.Item>
                <Descriptions.Item label="Bedrooms">{req.bedrooms != null ? (req.bedrooms === 0 ? 'Studio' : `${req.bedrooms} BR`) : '—'}</Descriptions.Item>
                <Descriptions.Item label="Bathrooms">{req.bathrooms || '—'}</Descriptions.Item>
                <Descriptions.Item label="Furnished">{req.furnished || '—'}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>

        {req.additional_notes && (
          <Card
            bordered={false}
            title={
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: THEME.textDark }}>Additional Notes</span>
              </div>
            }
            style={{ borderRadius: 20, boxShadow: '0 4px 20px rgba(15, 23, 42, 0.02)', border: `1px solid ${THEME.border}`, marginTop: 32 }}
          >
            <Text style={{ margin: 0, color: THEME.textDark, fontSize: 14, lineHeight: 1.7, fontWeight: 500 }}>
              {req.additional_notes}
            </Text>
          </Card>
        )}
      </div>
    </div>
  );
}
