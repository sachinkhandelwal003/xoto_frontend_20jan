// src/components/leads/SubmitLeads.jsx
// ─── Real API Integration with GridLead model ────────────────────────────────
// Routes used:
//   GET  /leads/referral/my-leads          → getReferralPartnerLeads
//   POST /leads/referral/create-lead       → createReferralLead
//   PUT  /leads/referral/:id/update-requirements → updateReferralRequirements
//   POST /leads/referral/:id/note          → addReferralNote
//   POST /leads/referral/:id/submit-to-xoto → submitReferralLeadToXoto

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Card, Drawer, Descriptions, Tag, Button, Space, Badge,
  message, Avatar, Row, Col, Tabs, Statistic, Tooltip, Empty,
  Modal, Form, Input, InputNumber, Select, Spin, Timeline,
  Divider, Alert,
} from 'antd';
import {
  PhoneOutlined, MailOutlined, UserOutlined,
  CheckCircleOutlined, EyeOutlined, BellOutlined,
  UsergroupAddOutlined, MessageOutlined, GlobalOutlined,
  AppstoreAddOutlined, PlusOutlined, SendOutlined,
  ClockCircleOutlined, FireOutlined, ReloadOutlined,
  EnvironmentOutlined, HomeOutlined, DollarOutlined,
  FileTextOutlined, RocketOutlined,
} from '@ant-design/icons';
import { apiService } from '../../../manageApi/utils/custom.apiservice';
import { showSuccessAlert, showConfirmDialog } from '../../../manageApi/utils/sweetAlert';
import CustomTable from '../../CMS/pages/custom/CustomTable';

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  primary:      '#5c039b',
  primaryLight: '#f3e8ff',
  secondary:    '#7c3aed',
  success:      '#16a34a',
  successLight: '#dcfce7',
  warning:      '#b45309',
  warningLight: '#fef3c7',
  error:        '#b91c1c',
  errorLight:   '#fee2e2',
  gray:         '#64748b',
  border:       '#ede9fe',
};

// ─── Status config — matches GridLead model enums ─────────────────────────────
const STATUS_CONFIG = {
  new:                   { label: 'New',                  color: 'orange',  dot: 'warning'    },
  contacted:             { label: 'Contacted',            color: 'blue',    dot: 'processing' },
  qualified:             { label: 'Qualified',            color: 'purple',  dot: 'processing' },
  in_discussion:         { label: 'In Discussion',        color: 'cyan',    dot: 'processing' },
  site_visit_scheduled:  { label: 'Site Visit',           color: 'geekblue',dot: 'processing' },
  offer_made:            { label: 'Offer Made',           color: 'volcano', dot: 'processing' },
  reserved:              { label: 'Reserved',             color: 'lime',    dot: 'success'    },
  spa_signed:            { label: 'SPA Signed',           color: 'green',   dot: 'success'    },
  completed:             { label: 'Completed',            color: 'green',   dot: 'success'    },
  not_proceeding:        { label: 'Not Proceeding',       color: 'default', dot: 'default'    },
};

// ─── Classification config ────────────────────────────────────────────────────
const CLASSIFICATION_CONFIG = {
  hot:  { label: 'Hot',  color: '#ef4444', bg: '#fee2e2', icon: <FireOutlined /> },
  warm: { label: 'Warm', color: '#f59e0b', bg: '#fef3c7', icon: <BellOutlined /> },
  cold: { label: 'Cold', color: '#3b82f6', bg: '#dbeafe', icon: <ClockCircleOutlined /> },
};

// ─── Property Types (matches GridLead model) ──────────────────────────────────
const PROPERTY_TYPES = ['Apartment','Villa','Townhouse','Penthouse','Commercial','Plot','Retail','Office','Warehouse'];
const TRANSACTION_TYPES = [
  { value: 'buy',    label: 'Buy'    },
  { value: 'rent',   label: 'Rent'   },
  { value: 'invest', label: 'Invest' },
];
const UAE_AREAS = [
  'Dubai Marina','Downtown Dubai','Palm Jumeirah','JVC','Business Bay',
  'Arabian Ranches','JBR','DIFC','Mirdif','Al Barsha','Jumeirah',
  'Deira','Bur Dubai','Abu Dhabi','Sharjah','Ajman','RAK',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getFullName = (lead) => {
  const fn = lead?.contact_info?.name?.first_name || '';
  const ln = lead?.contact_info?.name?.last_name  || '';
  return `${fn} ${ln}`.trim() || 'Unknown Customer';
};

const getPhone = (lead) => {
  const cc  = lead?.contact_info?.mobile?.country_code || '';
  const num = lead?.contact_info?.mobile?.number       || '';
  return num ? `${cc} ${num}` : '—';
};

const getArea = (lead) =>
  lead?.requirements?.location_preferences?.[0]?.area || '—';

const getBudget = (lead) => {
  const min = lead?.requirements?.budget_min;
  const max = lead?.requirements?.budget_max;
  if (min && max) return `AED ${min.toLocaleString()} – ${max.toLocaleString()}`;
  if (min)        return `AED ${min.toLocaleString()}+`;
  if (max)        return `Up to AED ${max.toLocaleString()}`;
  return '—';
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-AE', { day:'numeric', month:'short', year:'numeric' }) : '—';

// ─── Status Tag ───────────────────────────────────────────────────────────────
const StatusTag = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, color: 'default' };
  return <Tag color={cfg.color} style={{ borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{cfg.label}</Tag>;
};

// ─── Classification Badge ─────────────────────────────────────────────────────
const ClassificationBadge = ({ classification }) => {
  const cfg = CLASSIFICATION_CONFIG[classification];
  if (!cfg) return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 12,
      background: cfg.bg, color: cfg.color,
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════
const SubmitLeads = () => {
  const [leads,          setLeads]          = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [drawerVisible,  setDrawerVisible]  = useState(false);
  const [selectedLead,   setSelectedLead]   = useState(null);
  const [activeTab,      setActiveTab]      = useState('all');
  const [noteText,       setNoteText]       = useState('');
  const [noteLoading,    setNoteLoading]    = useState(false);
  const [submitLoading,  setSubmitLoading]  = useState(false);
  const [addModalOpen,   setAddModalOpen]   = useState(false);
  const [addLoading,     setAddLoading]     = useState(false);
  const [pagination,     setPagination]     = useState({ currentPage:1, itemsPerPage:10, totalItems:0 });

  const [form]       = Form.useForm();
  const [filterForm] = Form.useForm();

  // ── Fetch leads from real API ───────────────────────────────────────────────
  const fetchLeads = useCallback(async (page = 1, limit = 10, status = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit });
      if (status && status !== 'all') params.append('status', status);

      const res  = await apiService.get(`/gridlead/referral/my-leads?${params}`);
      // Handle both response shapes
      const data = res.data || res;
      const list = data.leads || data.data?.leads || [];
      const total = data.total || data.pagination?.total || list.length;

      setLeads(list);
      setPagination({ currentPage: page, itemsPerPage: limit, totalItems: total });
    } catch (err) {
      console.error('Fetch leads error:', err);
      message.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads(1, 10, activeTab);
  }, [activeTab, fetchLeads]);

  // ── Stats computed from loaded leads ───────────────────────────────────────
  const stats = useMemo(() => ({
    total:     leads.length,
    active:    leads.filter(l => !['completed','not_proceeding'].includes(l.status)).length,
    completed: leads.filter(l => l.status === 'completed').length,
    hot:       leads.filter(l => l.classification === 'hot').length,
  }), [leads]);

 const handleAddLead = async (values) => {
  setAddLoading(true);
  try {
    const payload = {
      // ✅ Flat fields — referral controller likely expects these directly
      first_name:   values.firstName,
      last_name:    values.lastName  || '',
      phone_number: values.phone,
      country_code: values.countryCode || '+971',
      email:        values.email       || '',
      preferred_contact: values.preferredContact || 'whatsapp',

      // ✅ Requirements as flat fields
      property_type:    values.propertyType,
      transaction_type: values.transactionType || 'buy',
      
      // ✅ area is array from mode="tags", send as location_preferences
      location_preferences: Array.isArray(values.area)
        ? values.area.map((a, i) => ({ area: a, priority: i + 1 }))
        : values.area ? [{ area: values.area, priority: 1 }] : [],

      budget_min: values.budgetMin || undefined,
      budget_max: values.budgetMax || undefined,
      additional_notes: values.notes || '',
    };

    console.log("Payload being sent:", JSON.stringify(payload, null, 2));

    await apiService.post('/gridlead/referral/create-lead', payload);
    showSuccessAlert('Lead Created!', 'Your referral lead has been submitted successfully.');
    setAddModalOpen(false);
    form.resetFields();
    fetchLeads(1, pagination.itemsPerPage, activeTab);
  } catch (err) {
    console.error('Create lead error:', err);
    message.error(err?.response?.data?.message || 'Failed to create lead');
  } finally {
    setAddLoading(false);
  }
};

  // ── Add note to lead ───────────────────────────────────────────────────────
  const handleAddNote = async () => {
    if (!noteText.trim()) { message.warning('Please enter a note'); return; }
    setNoteLoading(true);
    try {
      await apiService.post(`/gridlead/referral/${selectedLead._id}/note`, {
        text: noteText.trim(),
      });
      message.success('Note added ✓');
      setNoteText('');
      // Refresh selected lead
      const res  = await apiService.get(`/gridlead/${selectedLead._id}`);
      const updated = res.data?.lead || res.lead || res.data;
      if (updated) setSelectedLead(updated);
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to add note');
    } finally {
      setNoteLoading(false);
    }
  };

  // ── Submit lead to Xoto (admin queue) ──────────────────────────────────────
  const handleSubmitToXoto = async (lead) => {
    const result = await showConfirmDialog(
      'Submit to Xoto?',
      'This will send the lead to the admin queue for advisor assignment.',
      'Yes, Submit'
    );
    if (!result.isConfirmed) return;
    setSubmitLoading(true);
    try {
      await apiService.post(`/gridlead/referral/${lead._id}/submit-to-xoto`, {});
      showSuccessAlert('Submitted!', 'Lead has been sent to Xoto admin queue.');
      fetchLeads(pagination.currentPage, pagination.itemsPerPage, activeTab);
      setDrawerVisible(false);
    } catch (err) {
      message.error(err?.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  // ── Tab items ──────────────────────────────────────────────────────────────
  const tabItems = [
    { key: 'all',              label: <span><UsergroupAddOutlined /> All Leads</span>         },
    { key: 'new',              label: <span><BellOutlined /> New</span>                       },
    { key: 'in_discussion',    label: <span><MessageOutlined /> In Discussion</span>          },
    { key: 'site_visit_scheduled', label: <span><HomeOutlined /> Site Visits</span>          },
    { key: 'completed',        label: <span><CheckCircleOutlined /> Completed</span>          },
  ];

  // ── Table columns ──────────────────────────────────────────────────────────
  const columns = [
    {
      title: 'Customer',
      key: 'customer',
      width: 220,
      render: (_, record) => (
        <Space>
          <Avatar
            size="large"
            style={{ background: T.primary, fontWeight: 700, fontSize: 16 }}
          >
            {getFullName(record)?.[0]?.toUpperCase() || '?'}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{getFullName(record)}</div>
            <div style={{ fontSize: 11, color: T.gray }}>{getPhone(record)}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Requirements',
      key: 'requirements',
      render: (_, record) => (
        <div style={{ fontSize: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#374151', marginBottom: 2 }}>
            <HomeOutlined style={{ color: T.gray, fontSize: 11 }} />
            {record.requirements?.property_type || '—'} · {getArea(record)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: T.gray }}>
            <DollarOutlined style={{ fontSize: 11 }} />
            {getBudget(record)}
          </div>
        </div>
      ),
    },
    {
      title: 'Classification',
      key: 'classification',
      render: (_, record) => <ClassificationBadge classification={record.classification} />,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => <StatusTag status={record.status} />,
    },
    {
      title: 'Submitted',
      key: 'createdAt',
      render: (_, record) => (
        <span style={{ fontSize: 12, color: T.gray }}>{formatDate(record.createdAt)}</span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              shape="circle"
              icon={<EyeOutlined style={{ color: T.primary }} />}
              style={{ borderColor: T.primary }}
              onClick={() => { setSelectedLead(record); setDrawerVisible(true); }}
            />
          </Tooltip>
          {record.status === 'new' && (
            <Tooltip title="Submit to Xoto Admin">
              <Button
                shape="circle"
                type="primary"
                icon={<RocketOutlined />}
                style={{ background: T.primary, borderColor: T.primary }}
                loading={submitLoading}
                onClick={() => handleSubmitToXoto(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '24px 28px', background: '#faf5ff', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: T.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <UsergroupAddOutlined style={{ color: '#fff', fontSize: 18 }} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: T.primary }}>My Referral Leads</h2>
            <p style={{ margin: 0, fontSize: 12, color: T.gray }}>Track and manage your submitted leads</p>
          </div>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchLeads(1, pagination.itemsPerPage, activeTab)}
            style={{ borderColor: T.border }}
          >
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            style={{ background: T.primary, borderColor: T.primary, fontWeight: 600, borderRadius: 8 }}
            onClick={() => setAddModalOpen(true)}
          >
            Add New Lead
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Leads',   value: stats.total,     icon: <UsergroupAddOutlined />, color: T.primary,  bg: T.primaryLight  },
          { label: 'Active',        value: stats.active,    icon: <BellOutlined />,         color: '#b45309',  bg: '#fef3c7'       },
          { label: 'Completed',     value: stats.completed, icon: <CheckCircleOutlined />,  color: T.success,  bg: T.successLight  },
          { label: 'Hot Leads',     value: stats.hot,       icon: <FireOutlined />,         color: '#ef4444',  bg: '#fee2e2'       },
        ].map((s) => (
          <Col xs={24} sm={12} lg={6} key={s.label}>
            <Card
              bordered={false}
              style={{
                borderRadius: 14, border: `1px solid ${T.border}`,
                boxShadow: '0 1px 4px rgba(92,3,155,0.06)',
              }}
              bodyStyle={{ padding: '16px 20px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12, color: T.gray, fontWeight: 500, marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#111827' }}>{s.value}</div>
                </div>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: s.bg, color: s.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                }}>
                  {s.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Leads Table */}
      <Card
        bordered={false}
        style={{ borderRadius: 16, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(92,3,155,0.06)' }}
        bodyStyle={{ padding: 0 }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          type="card"
          size="large"
          tabBarStyle={{ margin: 0, paddingLeft: 16, paddingTop: 16, background: '#fafafa' }}
        />
        <div>
          <CustomTable
            columns={columns}
            data={leads}
            loading={loading}
            totalItems={pagination.totalItems}
            currentPage={pagination.currentPage}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={(page, pageSize) => fetchLeads(page, pageSize, activeTab)}
            onFilter={(f) => fetchLeads(1, pagination.itemsPerPage, activeTab)}
          />
        </div>
      </Card>

      {/* ── Lead Detail Drawer ──────────────────────────────────────────────── */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileTextOutlined style={{ color: T.primary }} />
            <span style={{ fontWeight: 700 }}>Lead Details</span>
          </div>
        }
        placement="right"
        width={620}
        onClose={() => { setDrawerVisible(false); setNoteText(''); }}
        open={drawerVisible}
        destroyOnClose
        bodyStyle={{ background: '#faf5ff', padding: 20 }}
      >
        {selectedLead && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Customer card */}
            <Card
              bordered={false}
              style={{ borderRadius: 14, border: `1px solid ${T.border}` }}
              bodyStyle={{ padding: 20 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Avatar size={64} style={{ background: T.primary, fontSize: 22, fontWeight: 700 }}>
                  {getFullName(selectedLead)?.[0]?.toUpperCase()}
                </Avatar>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800, color: '#111827' }}>
                    {getFullName(selectedLead)}
                  </h3>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <StatusTag status={selectedLead.status} />
                    <ClassificationBadge classification={selectedLead.classification} />
                  </div>
                </div>
              </div>
            </Card>

            {/* Contact Info */}
            <Card
              title={<span style={{ fontSize: 13, fontWeight: 700, color: T.primary }}>Contact Information</span>}
              bordered={false}
              size="small"
              style={{ borderRadius: 14, border: `1px solid ${T.border}` }}
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label={<span style={{ color: T.gray }}><PhoneOutlined /> Phone</span>}>
                  <a href={`tel:${getPhone(selectedLead)}`} style={{ color: T.primary, fontWeight: 600 }}>
                    {getPhone(selectedLead)}
                  </a>
                </Descriptions.Item>
                {selectedLead.contact_info?.email?.address && (
                  <Descriptions.Item label={<span style={{ color: T.gray }}><MailOutlined /> Email</span>}>
                    <a href={`mailto:${selectedLead.contact_info.email.address}`} style={{ color: T.primary }}>
                      {selectedLead.contact_info.email.address}
                    </a>
                  </Descriptions.Item>
                )}
                <Descriptions.Item label={<span style={{ color: T.gray }}>Preferred Contact</span>}>
                  <Tag style={{ borderRadius: 10, fontSize: 11 }}>
                    {selectedLead.contact_info?.preferred_contact || 'whatsapp'}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Requirements */}
            <Card
              title={<span style={{ fontSize: 13, fontWeight: 700, color: T.primary }}>Requirements</span>}
              bordered={false}
              size="small"
              style={{ borderRadius: 14, border: `1px solid ${T.border}` }}
            >
              <Descriptions column={2} size="small">
                <Descriptions.Item label={<span style={{ color: T.gray }}>Property Type</span>}>
                  {selectedLead.requirements?.property_type || '—'}
                </Descriptions.Item>
                <Descriptions.Item label={<span style={{ color: T.gray }}>Transaction</span>}>
                  <Tag style={{ borderRadius: 10, textTransform: 'capitalize', fontSize: 11 }}>
                    {selectedLead.requirements?.transaction_type || '—'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label={<span style={{ color: T.gray }}><EnvironmentOutlined /> Area</span>}>
                  {getArea(selectedLead)}
                </Descriptions.Item>
                <Descriptions.Item label={<span style={{ color: T.gray }}><DollarOutlined /> Budget</span>}>
                  <span style={{ fontWeight: 600, color: T.primary }}>{getBudget(selectedLead)}</span>
                </Descriptions.Item>
                {selectedLead.requirements?.bedrooms && (
                  <Descriptions.Item label={<span style={{ color: T.gray }}>Bedrooms</span>}>
                    {selectedLead.requirements.bedrooms}
                  </Descriptions.Item>
                )}
                {selectedLead.requirements?.additional_notes && (
                  <Descriptions.Item label={<span style={{ color: T.gray }}>Notes</span>} span={2}>
                    {selectedLead.requirements.additional_notes}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            {/* Timeline */}
            {selectedLead.status_history?.length > 0 && (
              <Card
                title={<span style={{ fontSize: 13, fontWeight: 700, color: T.primary }}>Status History</span>}
                bordered={false}
                size="small"
                style={{ borderRadius: 14, border: `1px solid ${T.border}` }}
              >
                <Timeline
                  items={[...selectedLead.status_history].reverse().map((h) => ({
                    color: T.primary,
                    children: (
                      <div>
                        <StatusTag status={h.status} />
                        <span style={{ fontSize: 11, color: T.gray, marginLeft: 8 }}>
                          {formatDate(h.changed_at)}
                        </span>
                        {h.notes && <div style={{ fontSize: 12, color: '#374151', marginTop: 2 }}>{h.notes}</div>}
                      </div>
                    ),
                  }))}
                />
              </Card>
            )}

            {/* Notes */}
            <Card
              title={<span style={{ fontSize: 13, fontWeight: 700, color: T.primary }}>Notes</span>}
              bordered={false}
              size="small"
              style={{ borderRadius: 14, border: `1px solid ${T.border}` }}
            >
              {selectedLead.notes?.length > 0 ? (
                <div style={{ marginBottom: 12 }}>
                  {selectedLead.notes.map((n, i) => (
                    <div key={i} style={{
                      background: '#f9fafb', borderRadius: 8, padding: '8px 12px',
                      marginBottom: 8, fontSize: 12,
                    }}>
                      <div style={{ color: '#374151' }}>{n.text}</div>
                      <div style={{ color: T.gray, fontSize: 11, marginTop: 4 }}>
                        {n.author} · {formatDate(n.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: T.gray, fontSize: 12, marginBottom: 12 }}>No notes yet.</div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <Input.TextArea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a note..."
                  rows={2}
                  style={{ borderRadius: 8, fontSize: 13 }}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  loading={noteLoading}
                  onClick={handleAddNote}
                  style={{ background: T.primary, borderColor: T.primary, height: 'auto', borderRadius: 8 }}
                />
              </div>
            </Card>

            {/* Submit to Xoto */}
            {selectedLead.status === 'new' && (
              <Alert
                type="info"
                showIcon
                message="Ready to submit?"
                description="Submit this lead to the Xoto admin queue for advisor assignment."
                action={
                  <Button
                    type="primary"
                    icon={<RocketOutlined />}
                    loading={submitLoading}
                    onClick={() => handleSubmitToXoto(selectedLead)}
                    style={{ background: T.primary, borderColor: T.primary, borderRadius: 8, fontWeight: 600 }}
                  >
                    Submit to Xoto
                  </Button>
                }
                style={{ borderRadius: 12 }}
              />
            )}

            {/* Assigned Advisor */}
            {selectedLead.assigned_to && (
              <Card
                title={<span style={{ fontSize: 13, fontWeight: 700, color: T.success }}>Assigned Advisor</span>}
                bordered={false}
                size="small"
                style={{ borderRadius: 14, border: `1px solid #bbf7d0`, background: '#f0fdf4' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar style={{ background: T.success }}><UserOutlined /></Avatar>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>
                      {selectedLead.assigned_to?.firstName
                        ? `${selectedLead.assigned_to.firstName} ${selectedLead.assigned_to.lastName}`
                        : 'Advisor Assigned'
                      }
                    </div>
                    <div style={{ fontSize: 11, color: T.gray }}>Assigned on {formatDate(selectedLead.assigned_at)}</div>
                  </div>
                  <Tag color="green" style={{ marginLeft: 'auto', borderRadius: 10 }}>Active</Tag>
                </div>
              </Card>
            )}
          </div>
        )}
      </Drawer>

      {/* ── Add New Lead Modal ──────────────────────────────────────────────── */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UsergroupAddOutlined style={{ color: T.primary }} />
            <span style={{ fontWeight: 700 }}>Add New Referral Lead</span>
          </div>
        }
        open={addModalOpen}
        onCancel={() => { setAddModalOpen(false); form.resetFields(); }}
        confirmLoading={addLoading}
        onOk={() => form.submit()}
        okText="Submit Lead"
        okButtonProps={{ style: { background: T.primary, borderColor: T.primary, fontWeight: 600, borderRadius: 8 } }}
        cancelButtonProps={{ style: { borderRadius: 8 } }}
        destroyOnClose
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddLead}
          initialValues={{ countryCode: '+971', transactionType: 'buy' }}
          style={{ marginTop: 16 }}
          requiredMark={false}
        >
          <Divider orientation="left" style={{ fontSize: 12, color: T.gray }}>Customer Info</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="firstName" label="First Name" rules={[{ required: true, message: 'Required' }]}>
                <Input prefix={<UserOutlined style={{ color: T.gray }} />} placeholder="First name" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="lastName" label="Last Name">
                <Input prefix={<UserOutlined style={{ color: T.gray }} />} placeholder="Last name" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="countryCode" label="Code" rules={[{ required: true }]}>
                <Select style={{ borderRadius: 8 }}>
                  <Select.Option value="+971">+971 🇦🇪</Select.Option>
                  <Select.Option value="+91">+91 🇮🇳</Select.Option>
                  <Select.Option value="+1">+1 🇺🇸</Select.Option>
                  <Select.Option value="+44">+44 🇬🇧</Select.Option>
                  <Select.Option value="+92">+92 🇵🇰</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="phone" label="Phone Number" rules={[{ required: true, message: 'Required' }]}>
                <Input prefix={<PhoneOutlined style={{ color: T.gray }} />} placeholder="e.g. 501234567" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="email" label="Email (optional)">
            <Input prefix={<MailOutlined style={{ color: T.gray }} />} placeholder="customer@email.com" style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item name="preferredContact" label="Preferred Contact Method">
            <Select style={{ borderRadius: 8 }} placeholder="How should we contact them?">
              <Select.Option value="whatsapp">WhatsApp</Select.Option>
              <Select.Option value="call">Phone Call</Select.Option>
              <Select.Option value="email">Email</Select.Option>
            </Select>
          </Form.Item>

          <Divider orientation="left" style={{ fontSize: 12, color: T.gray }}>Requirements</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="propertyType" label="Property Type" rules={[{ required: true, message: 'Required' }]}>
                <Select placeholder="Select type" style={{ borderRadius: 8 }}>
                  {PROPERTY_TYPES.map(t => <Select.Option key={t} value={t}>{t}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="transactionType" label="Transaction Type">
                <Select style={{ borderRadius: 8 }}>
                  {TRANSACTION_TYPES.map(t => <Select.Option key={t.value} value={t.value}>{t.label}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="area" label="Area of Interest" rules={[{ required: true, message: 'Required' }]}>
            <Select mode="tags" placeholder="Select or type area" tokenSeparators={[',']} style={{ borderRadius: 8 }}>
              {UAE_AREAS.map(a => <Select.Option key={a} value={a}>{a}</Select.Option>)}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="budgetMin" label="Budget Min (AED)">
                <InputNumber
                  style={{ width: '100%', borderRadius: 8 }}
                  placeholder="e.g. 1000000"
                  formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={v => v?.replace(/,*/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="budgetMax" label="Budget Max (AED)">
                <InputNumber
                  style={{ width: '100%', borderRadius: 8 }}
                  placeholder="e.g. 3000000"
                  formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={v => v?.replace(/,*/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Additional Notes">
            <Input.TextArea rows={3} placeholder="Any special requirements or context..." style={{ borderRadius: 8 }} maxLength={500} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SubmitLeads;