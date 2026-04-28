import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from "../../manageApi/utils/custom.apiservice";
import {
  Modal, Button, Tag, Tooltip, Avatar,
  Drawer, Descriptions, Select, Input,
  message, Spin
} from 'antd';
import {
  EyeOutlined, ReloadOutlined, EnvironmentOutlined,
  ClockCircleOutlined, EditOutlined, CheckCircleOutlined,
  PhoneOutlined, MailOutlined, UserOutlined, FireOutlined
} from '@ant-design/icons';
import CustomTable from '../../components/CMS/pages/custom/CustomTable';

const { Option } = Select;

// ─── Constants ────────────────────────────────────────────────────────────────
const PRIMARY = '#5c039b';

const TYPE_COLORS = {
  buy:            { bg: '#ede9fe', color: '#5b21b6', label: 'Buy' },
  sell:           { bg: '#fce7f3', color: '#9d174d', label: 'Sell' },
  rent:           { bg: '#dbeafe', color: '#1e40af', label: 'Rent' },
  consultation:   { bg: '#fef3c7', color: '#92400e', label: 'Consultation' },
  enquiry:        { bg: '#f3f4f6', color: '#374151', label: 'Enquiry' },
  schedule_visit: { bg: '#e0f2fe', color: '#075985', label: 'Site Visit' },
  partner:        { bg: '#f5f3ff', color: '#4c1d95', label: 'Partner' },
  investor:       { bg: '#fff7ed', color: '#9a3412', label: 'Investor' },
  developer:      { bg: '#f0fdf4', color: '#14532d', label: 'Developer' },
  ai_enquiry:     { bg: '#fdf4ff', color: '#701a75', label: 'AI Enquiry' },
};

const STATUS_CONFIG = {
  submit:    { color: 'blue',   label: 'New',       bg: '#dbeafe', text: '#1e40af' },
  contacted: { color: 'orange', label: 'Contacted', bg: '#fef3c7', text: '#92400e' },
  converted: { color: 'green',  label: 'Converted', bg: '#dcfce7', text: '#166534' },
  dead:      { color: 'red',    label: 'Dead',      bg: '#fee2e2', text: '#991b1b' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const TypeTag = ({ type }) => {
  const t = TYPE_COLORS[type] || { bg: '#f3f4f6', color: '#374151', label: type };
  return (
    <span style={{
      background: t.bg, color: t.color,
      padding: '2px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap'
    }}>
      {t.label}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const s = STATUS_CONFIG[status] || { color: 'default', label: status };
  return <Tag color={s.color} style={{ borderRadius: 20, fontSize: 11 }}>{s.label}</Tag>;
};

// ─── Update Status Modal ──────────────────────────────────────────────────────
const UpdateStatusModal = ({ lead, visible, onClose, onUpdated }) => {
  const [status,   setStatus]   = useState('');
  const [notes,    setNotes]    = useState('');
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    if (visible && lead) {
      setStatus(lead.status || 'submit');
      setNotes('');
    }
  }, [visible, lead]);

  const handleSubmit = async () => {
    if (!status) return message.warning('Please select a status');
    setLoading(true);
    try {
      await apiService.patch(`/property/lead/${lead._id}/status`, { status, notes });
      message.success('Lead status updated');
      onUpdated();
      onClose();
    } catch (err) {
      message.error(err?.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: '#f3e8ff', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}>
            <EditOutlined style={{ color: PRIMARY }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Update Lead Status</div>
            <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 400 }}>
              {lead?.name?.first_name} {lead?.name?.last_name}
            </div>
          </div>
        </div>
      }
      footer={null}
      width={460}
    >
      <div style={{ padding: '8px 0' }}>
        {/* Current Status */}
        <div style={{
          background: '#faf5ff', border: '1px solid #ede9fe',
          borderRadius: 10, padding: '10px 14px', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Current status:</span>
          <StatusBadge status={lead?.status} />
        </div>

        {/* New Status */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            New Status
          </div>
          <Select
            value={status}
            onChange={setStatus}
            style={{ width: '100%' }}
            size="large"
          >
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <Option key={k} value={k}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: v.text, display: 'inline-block'
                  }} />
                  {v.label}
                </div>
              </Option>
            ))}
          </Select>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            Note <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span>
          </div>
          <Input.TextArea
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Client confirmed site visit for Saturday..."
            style={{ borderRadius: 8, fontSize: 13 }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            loading={loading}
            onClick={handleSubmit}
            style={{ background: PRIMARY, borderColor: PRIMARY, fontWeight: 600 }}
          >
            Update Status
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// ─── Lead Detail Drawer ───────────────────────────────────────────────────────
const LeadDetailDrawer = ({ lead, visible, onClose }) => {
  if (!lead) return null;
  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <EyeOutlined style={{ color: PRIMARY }} />
          <span>Lead Details</span>
        </div>
      }
      open={visible}
      onClose={onClose}
      width={500}
    >
      {/* Client Info */}
      <div style={{
        background: '#faf5ff', border: '1px solid #ede9fe',
        borderRadius: 12, padding: 16, marginBottom: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <Avatar
            size={44}
            style={{ background: PRIMARY, fontWeight: 700, fontSize: 16, flexShrink: 0 }}
          >
            {`${lead.name?.first_name?.[0] || ''}${lead.name?.last_name?.[0] || ''}`.toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>
              {lead.name?.first_name} {lead.name?.last_name}
            </div>
            <TypeTag type={lead.type} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 8 }}>
            <PhoneOutlined style={{ color: PRIMARY }} />
            {lead.mobile?.country_code} {lead.mobile?.number}
          </div>
          {lead.email && (
            <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 8 }}>
              <MailOutlined style={{ color: PRIMARY }} />
              {lead.email}
            </div>
          )}
          {(lead.area || lead.preferred_city) && (
            <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 8 }}>
              <EnvironmentOutlined style={{ color: PRIMARY }} />
              {lead.area || lead.preferred_city}
            </div>
          )}
        </div>
      </div>

      <Descriptions column={1} bordered size="small" labelStyle={{ fontWeight: 600, fontSize: 12 }}>
        <Descriptions.Item label="Status"><StatusBadge status={lead.status} /></Descriptions.Item>
        <Descriptions.Item label="Budget">{lead.budget || '—'}</Descriptions.Item>
        <Descriptions.Item label="Bedrooms">{lead.desired_bedrooms || '—'}</Descriptions.Item>
        <Descriptions.Item label="Preferred Contact">{lead.preferred_contact || '—'}</Descriptions.Item>
        <Descriptions.Item label="Assigned At">
          {lead.assignedAt ? new Date(lead.assignedAt).toLocaleString() : '—'}
        </Descriptions.Item>
        <Descriptions.Item label="Assignment Notes">
          {lead.assignmentNotes || '—'}
        </Descriptions.Item>
        <Descriptions.Item label="Created">
          {new Date(lead.createdAt).toLocaleString()}
        </Descriptions.Item>
        {lead.message && (
          <Descriptions.Item label="Message">{lead.message}</Descriptions.Item>
        )}
      </Descriptions>

      {/* Property (for rent leads) */}
      {lead.property && (
        <div style={{
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          borderRadius: 10, padding: '12px 14px', marginTop: 16
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#166534', marginBottom: 6 }}>
            Property
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
            {lead.property?.title}
          </div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
            {lead.property?.location?.area}, {lead.property?.emirate}
            {lead.property?.price && ` · AED ${lead.property.price.toLocaleString()}`}
          </div>
        </div>
      )}

      {/* Notes History */}
      {lead.notes?.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10, color: '#374151' }}>
            Notes History
          </div>
          {lead.notes.map((n, i) => (
            <div key={i} style={{
              background: '#faf5ff', border: '1px solid #ede9fe',
              borderRadius: 8, padding: '8px 12px', marginBottom: 8
            }}>
              <div style={{ fontSize: 12, color: '#374151' }}>{n.text}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <ClockCircleOutlined />
                {new Date(n.createdAt).toLocaleString()}
                {n.author && ` · ${n.author}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </Drawer>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const AdvisorLeadsPage = () => {
  const [leads,       setLeads]       = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [pagination,  setPagination]  = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [filters,     setFilters]     = useState({});
  const [viewLead,    setViewLead]    = useState(null);
  const [updateLead,  setUpdateLead]  = useState(null);
  const [stats,       setStats]       = useState({ total: 0, new: 0, contacted: 0, converted: 0 });

  const fetchLeads = useCallback(async (page = 1, limit = 10, extraFilters = {}) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.set('page',  page);
      query.set('limit', limit);
      if (extraFilters.search) query.set('search', extraFilters.search);
      if (extraFilters.status) query.set('status', extraFilters.status);
      if (extraFilters.type)   query.set('type',   extraFilters.type);

      const res       = await apiService.get(`/property/lead/my-leads?${query.toString()}`);
      const leadsData = res?.data       || [];
      const pagData   = res?.pagination || {};

      setLeads(leadsData);
      setPagination(pagData);
      setStats({
        total:     pagData?.total              || leadsData.length,
        new:       leadsData.filter(l => l.status === 'submit').length,
        contacted: leadsData.filter(l => l.status === 'contacted').length,
        converted: leadsData.filter(l => l.status === 'converted').length,
      });
    } catch {
      message.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, []);

  const handlePageChange = (page, limit) => {
    fetchLeads(page, limit, filters);
    setPagination(prev => ({ ...prev, page, limit }));
  };

  const handleFilter = (newFilters) => {
    const merged = { ...filters, ...newFilters };
    setFilters(merged);
    fetchLeads(1, pagination.limit, merged);
  };

  // ── Columns ──────────────────────────────────────────────────────────────────
  const columns = [
    {
      title: 'Client',
      key: 'full_name',
      sortable: true,
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar
            size={34}
            style={{ background: PRIMARY, fontWeight: 700, fontSize: 12, flexShrink: 0 }}
          >
            {`${row.name?.first_name?.[0] || ''}${row.name?.last_name?.[0] || ''}`.toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>
              {row.name?.first_name} {row.name?.last_name}
            </div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>
              {row.mobile?.country_code} {row.mobile?.number}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Type',
      key: 'type',
      filterable: true,
      filterKey: 'type',
      filterOptions: Object.entries(TYPE_COLORS).map(([k, v]) => ({ value: k, label: v.label })),
      render: (val) => <TypeTag type={val} />
    },
    {
      title: 'Status',
      key: 'status',
      filterable: true,
      filterKey: 'status',
      filterOptions: Object.entries(STATUS_CONFIG).map(([k, v]) => ({ value: k, label: v.label })),
      render: (val) => <StatusBadge status={val} />
    },
    {
      title: 'Location',
      key: 'area',
      render: (val, row) => (
        <span style={{ fontSize: 12, color: '#6b7280' }}>
          <EnvironmentOutlined style={{ marginRight: 4, color: PRIMARY }} />
          {row.area || row.preferred_city || '—'}
        </span>
      )
    },
    {
      title: 'Budget',
      key: 'budget',
      render: (val) => (
        <span style={{ fontSize: 12, color: '#374151' }}>{val || '—'}</span>
      )
    },
    {
      title: 'Assigned At',
      key: 'assignedAt',
      sortable: true,
      render: (val) => (
        <span style={{ fontSize: 12, color: '#6b7280' }}>
          {val ? new Date(val).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
          }) : '—'}
        </span>
      )
    },
    {
      title: 'Actions',
      key: '_id',
      render: (val, row) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <Tooltip title="View Details">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setViewLead(row)}
              style={{ borderColor: '#e5e7eb', color: PRIMARY }}
            />
          </Tooltip>
          <Tooltip title="Update Status">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => setUpdateLead(row)}
              style={{
                background: PRIMARY, borderColor: PRIMARY,
                color: '#fff', fontWeight: 600
              }}
            >
              Update
            </Button>
          </Tooltip>
        </div>
      )
    },
  ];

  // ── Stat Cards ────────────────────────────────────────────────────────────
  const statCards = [
    { label: 'Total Assigned', value: stats.total,     bg: '#faf5ff', color: PRIMARY,   icon: <UserOutlined /> },
    { label: 'New',            value: stats.new,       bg: '#dbeafe', color: '#1e40af', icon: <FireOutlined /> },
    { label: 'Contacted',      value: stats.contacted, bg: '#fef3c7', color: '#92400e', icon: <PhoneOutlined /> },
    { label: 'Converted',      value: stats.converted, bg: '#dcfce7', color: '#166534', icon: <CheckCircleOutlined /> },
  ];

  return (
    <div style={{ padding: '28px 32px', background: '#faf5ff', minHeight: '100vh' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: PRIMARY, display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}>
              <UserOutlined style={{ color: '#fff', fontSize: 16 }} />
            </div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#111827' }}>
              My Leads
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
            Leads assigned to you — update status as you progress
          </p>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => fetchLeads(pagination.page, pagination.limit, filters)}
          style={{ borderColor: PRIMARY, color: PRIMARY }}
        >
          Refresh
        </Button>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 12, marginBottom: 24
      }}>
        {statCards.map((s, i) => (
          <div key={i} style={{
            background: '#fff', border: '1px solid #ede9fe',
            borderRadius: 12, padding: '16px 18px',
            boxShadow: '0 1px 4px rgba(92,3,155,0.06)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{s.label}</span>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: s.bg, color: s.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14
              }}>
                {s.icon}
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#111827', lineHeight: 1 }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <CustomTable
        columns={columns}
        data={leads}
        loading={loading}
        totalItems={pagination.total}
        currentPage={pagination.page}
        itemsPerPage={pagination.limit}
        onPageChange={handlePageChange}
        onFilter={handleFilter}
        showSearch
      />

      {/* ── Update Status Modal ── */}
      <UpdateStatusModal
        lead={updateLead}
        visible={!!updateLead}
        onClose={() => setUpdateLead(null)}
        onUpdated={() => fetchLeads(pagination.page, pagination.limit, filters)}
      />

      {/* ── Detail Drawer ── */}
      <LeadDetailDrawer
        lead={viewLead}
        visible={!!viewLead}
        onClose={() => setViewLead(null)}
      />
    </div>
  );
};

export default AdvisorLeadsPage;