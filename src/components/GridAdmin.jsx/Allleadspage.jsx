import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from "../../manageApi/utils/custom.apiservice";
import {
  Modal, Button, Tag, Tooltip, Avatar, Radio,
  Spin, Empty, message, Drawer, Descriptions, Badge
} from 'antd';
import {
  UserAddOutlined, EyeOutlined, CheckCircleFilled,
  StarFilled, ThunderboltOutlined, ReloadOutlined,
  EnvironmentOutlined, ApartmentOutlined, UserOutlined,
  ClockCircleOutlined, FireOutlined
} from '@ant-design/icons';
import CustomTable from '../../components/CMS/pages/custom/CustomTable'; 
// ─── Constants ────────────────────────────────────────────────────────────────
const PRIMARY   = '#5c039b';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const TYPE_COLORS = {
  buy:            { bg: '#ede9fe', color: '#5b21b6', label: 'Buy' },
  sell:           { bg: '#fce7f3', color: '#9d174d', label: 'Sell' },
  rent:           { bg: '#dbeafe', color: '#1e40af', label: 'Rent' },
  mortgage:       { bg: '#dcfce7', color: '#166534', label: 'Mortgage' },
  consultation:   { bg: '#fef3c7', color: '#92400e', label: 'Consultation' },
  enquiry:        { bg: '#f3f4f6', color: '#374151', label: 'Enquiry' },
  schedule_visit: { bg: '#e0f2fe', color: '#075985', label: 'Site Visit' },
  hot_property:   { bg: '#fee2e2', color: '#dc2626', label: 'Hot Property' },
  partner:        { bg: '#f5f3ff', color: '#4c1d95', label: 'Partner' },
  investor:       { bg: '#fff7ed', color: '#9a3412', label: 'Investor' },
  developer:      { bg: '#f0fdf4', color: '#14532d', label: 'Developer' },
  ai_enquiry:     { bg: '#fdf4ff', color: '#701a75', label: 'AI Enquiry' },
};

const STATUS_COLORS = {
  submit:    { color: 'blue',   label: 'New' },
  contacted: { color: 'orange', label: 'Contacted' },
  converted: { color: 'green',  label: 'Converted' },
  dead:      { color: 'red',    label: 'Dead' },
};

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
  const s = STATUS_COLORS[status] || { color: 'default', label: status };
  return <Tag color={s.color} style={{ borderRadius: 20, fontSize: 11 }}>{s.label}</Tag>;
};

const AdvisorChip = ({ advisor }) => {
  if (!advisor) return <span style={{ color: '#9ca3af', fontSize: 12 }}>— Unassigned</span>;
  const initials = `${advisor.firstName?.[0] || ''}${advisor.lastName?.[0] || ''}`.toUpperCase();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <Avatar size={24} style={{ background: PRIMARY, fontSize: 10, fontWeight: 700 }}>{initials}</Avatar>
      <span style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>
        {advisor.firstName} {advisor.lastName}
      </span>
    </div>
  );
};

// ─── Assign Advisor Modal ────────────────────────────────────────────────────
const AssignModal = ({ lead, visible, onClose, onAssigned }) => {
  const [loading,      setLoading]      = useState(false);
  const [assigning,    setAssigning]    = useState(false);
  const [recommended,  setRecommended]  = useState(null);
  const [options,      setOptions]      = useState([]);
  const [selectedId,   setSelectedId]   = useState(null);
  const [notes,        setNotes]        = useState('');

  useEffect(() => {
    if (visible && lead) {
      fetchSuggestions();
      setSelectedId(lead.assignedAdvisor?._id || null);
      setNotes('');
    }
  }, [visible, lead]);

 const fetchSuggestions = async () => {
  setLoading(true);
  try {
    const res = await apiService.get(`/property/lead/${lead._id}/suggest-advisors`);
    setRecommended(res?.data?.recommended || null);
    setOptions(res?.data?.options        || []);
    if (res?.data?.recommended && !lead.assignedAdvisor) {
      setSelectedId(res.data.recommended._id);
    }
  } catch {
    message.error('Could not fetch advisor suggestions');
  } finally {
    setLoading(false);
  }
};

const handleAssign = async () => {
  if (!selectedId) return message.warning('Please select an advisor');
  setAssigning(true);
  try {
    await apiService.put(`/property/lead/${lead._id}/assign`, { 
      advisorId: selectedId, 
      notes 
    });
    message.success('Advisor assigned successfully');
    onAssigned();
    onClose();
  } catch (err) {
    message.error(err?.response?.data?.message || 'Assignment failed');
  } finally {
    setAssigning(false);
  }
};

  const scoreBar = (score = 0) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{
        width: 60, height: 5, background: '#f3f4f6',
        borderRadius: 3, overflow: 'hidden'
      }}>
        <div style={{
          width: `${Math.min(score, 100)}%`,
          height: '100%', background: PRIMARY, borderRadius: 3
        }} />
      </div>
      <span style={{ fontSize: 11, color: '#6b7280' }}>{score}</span>
    </div>
  );

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
            <UserAddOutlined style={{ color: PRIMARY, fontSize: 16 }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>Assign Advisor</div>
            <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 400 }}>
              {lead?.name?.first_name} {lead?.name?.last_name} · {lead?.area || lead?.preferred_city || '—'}
            </div>
          </div>
        </div>
      }
      footer={null}
      width={560}
      styles={{ body: { padding: '0 24px 24px' } }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin tip="Finding best advisors..." />
        </div>
      ) : (
        <>
          {/* Lead Context Strip */}
          <div style={{
            background: '#faf5ff', border: '1px solid #ede9fe',
            borderRadius: 10, padding: '10px 14px', marginBottom: 16,
            display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, color: '#4b5563'
          }}>
            <span><EnvironmentOutlined style={{ marginRight: 4, color: PRIMARY }} />{lead?.area || lead?.preferred_city || '—'}</span>
            <span><ApartmentOutlined  style={{ marginRight: 4, color: PRIMARY }} />{lead?.type || '—'}</span>
            <span><FireOutlined       style={{ marginRight: 4, color: '#ef4444' }} />{lead?.budget || 'No budget'}</span>
          </div>

          {/* Recommended Banner */}
          {recommended && (
            <div style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0',
              borderRadius: 10, padding: '10px 14px', marginBottom: 12,
              display: 'flex', alignItems: 'center', gap: 10
            }}>
              <ThunderboltOutlined style={{ color: '#16a34a', fontSize: 18 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: '#15803d', fontWeight: 600, marginBottom: 2 }}>
                  SYSTEM RECOMMENDED
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                  {recommended.firstName} {recommended.lastName}
                </div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>
                  {recommended.specialisation?.locations?.join(', ') || '—'} ·{' '}
                  Score: {recommended.leaderboard?.compositeScore || 0}
                </div>
              </div>
              <CheckCircleFilled style={{ color: '#16a34a', fontSize: 20 }} />
            </div>
          )}

          {/* Advisor Options */}
          <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
            Select Advisor
          </div>
          <Radio.Group
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            style={{ width: '100%' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
              {options.length === 0 && (
                <Empty description="No active advisors found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
              {options.map((adv) => {
                const initials = `${adv.firstName?.[0] || ''}${adv.lastName?.[0] || ''}`.toUpperCase();
                const isRec    = recommended?._id === adv._id;
                const isSel    = selectedId === adv._id;
                return (
                  <Radio key={adv._id} value={adv._id} style={{ margin: 0 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 12px', borderRadius: 10,
                      border: `1.5px solid ${isSel ? PRIMARY : '#e5e7eb'}`,
                      background: isSel ? '#faf5ff' : '#fff',
                      cursor: 'pointer', transition: 'all 0.15s',
                      width: 440
                    }}>
                      <Avatar style={{ background: PRIMARY, fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                        {initials}
                      </Avatar>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>
                            {adv.firstName} {adv.lastName}
                          </span>
                          {isRec && (
                            <span style={{
                              background: '#dcfce7', color: '#166534',
                              fontSize: 10, padding: '1px 7px', borderRadius: 20, fontWeight: 600
                            }}>
                              Recommended
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                          <EnvironmentOutlined style={{ marginRight: 3 }} />
                          {adv.specialisation?.locations?.slice(0, 2).join(', ') || 'All locations'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
                          <StarFilled style={{ color: '#f59e0b', marginRight: 3 }} />
                          Score
                        </div>
                        {scoreBar(adv.leaderboard?.compositeScore)}
                        <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 3 }}>
                          {adv.workload?.activeLeadsCount || 0} active leads
                        </div>
                      </div>
                    </div>
                  </Radio>
                );
              })}
            </div>
          </Radio.Group>

          {/* Notes */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Assignment Notes <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any context for the advisor..."
              rows={2}
              style={{
                width: '100%', border: '1px solid #e5e7eb', borderRadius: 8,
                padding: '8px 12px', fontSize: 13, resize: 'none',
                outline: 'none', fontFamily: 'inherit', color: '#374151',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="primary"
              loading={assigning}
              disabled={!selectedId}
              onClick={handleAssign}
              style={{ background: PRIMARY, borderColor: PRIMARY, fontWeight: 600 }}
            >
              Assign Advisor
            </Button>
          </div>
        </>
      )}
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
      width={480}
    >
      <Descriptions column={1} bordered size="small" labelStyle={{ fontWeight: 600, fontSize: 12 }}>
        <Descriptions.Item label="Name">
          {lead.name?.first_name} {lead.name?.last_name}
        </Descriptions.Item>
        <Descriptions.Item label="Mobile">
          {lead.mobile?.country_code} {lead.mobile?.number}
        </Descriptions.Item>
        <Descriptions.Item label="Email">{lead.email || '—'}</Descriptions.Item>
        <Descriptions.Item label="Type"><TypeTag type={lead.type} /></Descriptions.Item>
        <Descriptions.Item label="Status"><StatusBadge status={lead.status} /></Descriptions.Item>
        <Descriptions.Item label="Budget">{lead.budget || '—'}</Descriptions.Item>
        <Descriptions.Item label="Area">{lead.area || lead.preferred_city || '—'}</Descriptions.Item>
        <Descriptions.Item label="Bedrooms">{lead.desired_bedrooms || '—'}</Descriptions.Item>
        <Descriptions.Item label="Assigned Advisor">
          <AdvisorChip advisor={lead.assignedAdvisor} />
        </Descriptions.Item>
        <Descriptions.Item label="Assigned At">
          {lead.assignedAt ? new Date(lead.assignedAt).toLocaleString() : '—'}
        </Descriptions.Item>
        <Descriptions.Item label="Notes">{lead.assignmentNotes || '—'}</Descriptions.Item>
        <Descriptions.Item label="Created">
          {new Date(lead.createdAt).toLocaleString()}
        </Descriptions.Item>
        {lead.message && (
          <Descriptions.Item label="Message">{lead.message}</Descriptions.Item>
        )}
      </Descriptions>

      {lead.notes?.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10, color: '#374151' }}>
            Internal Notes
          </div>
          {lead.notes.map((n, i) => (
            <div key={i} style={{
              background: '#faf5ff', border: '1px solid #ede9fe',
              borderRadius: 8, padding: '8px 12px', marginBottom: 8
            }}>
              <div style={{ fontSize: 12, color: '#374151' }}>{n.text}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                <ClockCircleOutlined style={{ marginRight: 4 }} />
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
const PAGE_KEY = 'allLeads_page';
const LIMIT_KEY = 'allLeads_limit';

const AllLeadsPage = () => {
  const [leads,       setLeads]       = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [allLeads,    setAllLeads]    = useState([]);
  
  // ✅ sessionStorage se saved page/limit restore karo
  const [pagination, setPagination] = useState({
    page:       parseInt(sessionStorage.getItem(PAGE_KEY)  || '1'),
    limit:      parseInt(sessionStorage.getItem(LIMIT_KEY) || '10'),
    total:      0,
    totalPages: 0,
  });

  const [assignLead, setAssignLead] = useState(null);
  const [viewLead,   setViewLead]   = useState(null);
  const [filters,    setFilters]    = useState({});
  const [stats, setStats] = useState({ total: 0, unassigned: 0, converted: 0, hot: 0 });

  const applyPage = (data, page, limit) => {
    const start  = (page - 1) * limit;
    const sliced = data.slice(start, start + limit);
    setLeads(sliced);
    
    // ✅ Page yaad rakho
    sessionStorage.setItem(PAGE_KEY,  page);
    sessionStorage.setItem(LIMIT_KEY, limit);

    setPagination({
      page,
      limit,
      total:      data.length,
      totalPages: Math.ceil(data.length / limit),
    });
  };

  const fetchLeads = useCallback(async (extraFilters = {}, goToPage = null) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.set("page",  1);
      query.set("limit", 1000);
      if (extraFilters.search) query.set("search", extraFilters.search);
      if (extraFilters.status) query.set("status", extraFilters.status);
      if (extraFilters.type)   query.set("type",   extraFilters.type);

      const res      = await apiService.get(`/property/lead?${query.toString()}`);
      const filtered = (res?.data || []).filter(l => l.type !== 'mortgage');

      setAllLeads(filtered);

      // ✅ goToPage diya toh wahan jao, warna saved page pe raho
      const savedPage  = parseInt(sessionStorage.getItem(PAGE_KEY)  || '1');
      const savedLimit = parseInt(sessionStorage.getItem(LIMIT_KEY) || '10');
      const targetPage = goToPage ?? savedPage;

      // ✅ Agar saved page ab valid nahi (data kam ho gaya) toh page 1 pe jao
      const maxPage = Math.ceil(filtered.length / savedLimit) || 1;
      const finalPage = targetPage > maxPage ? 1 : targetPage;

      applyPage(filtered, finalPage, savedLimit);

      setStats({
        total:      filtered.length,
        unassigned: filtered.filter(l => !l.assignedAdvisor).length,
        converted:  filtered.filter(l => l.status === 'converted').length,
        hot:        filtered.filter(l => l.status === 'submit' && !l.assignedAdvisor).length,
      });
    } catch {
      message.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, []);

  const handlePageChange = (page, limit) => {
    applyPage(allLeads, page, limit);
  };

  const handleFilter = (newFilters) => {
    const merged = { ...filters, ...newFilters };
    setFilters(merged);
    fetchLeads(merged, 1); // filter lagane pe page 1 pe jao
  };

useEffect(() => { fetchLeads(); }, []);
  // ── Columns ──────────────────────────────────────────────────────────────────
  const columns = [
    {
      title: 'Name',
      key: 'full_name',
      sortable: true,
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>
            {row.name?.first_name} {row.name?.last_name}
          </div>
          <div style={{ fontSize: 11, color: '#6b7280' }}>
            {row.mobile?.country_code} {row.mobile?.number}
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
      filterOptions: Object.entries(STATUS_COLORS).map(([k, v]) => ({ value: k, label: v.label })),
      render: (val) => <StatusBadge status={val} />
    },
    // {
    //   title: 'Location',
    //   key: 'area',
    //   render: (val, row) => (
    //     <span style={{ fontSize: 12, color: '#6b7280' }}>
    //       <EnvironmentOutlined style={{ marginRight: 4, color: PRIMARY }} />
    //       {row.area || row.preferred_city || '—'}
    //     </span>
    //   )
    // },
    {
      title: 'Budget',
      key: 'budget',
      render: (val) => (
        <span style={{ fontSize: 12, color: '#374151' }}>{val || '—'}</span>
      )
    },
    {
      title: 'Assigned Advisor',
      key: 'assignedAdvisor',
      render: (val, row) => <AdvisorChip advisor={row.assignedAdvisor} />
    },
    {
      title: 'Created',
      key: 'createdAt',
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
              style={{ borderColor: '#e5e7eb' }}
            />
          </Tooltip>
          <Tooltip title={row.assignedAdvisor ? 'Reassign Advisor' : 'Assign Advisor'}>
            <Button
              size="small"
              icon={<UserAddOutlined />}
              onClick={() => setAssignLead(row)}
              style={{
                background: row.assignedAdvisor ? '#fff' : PRIMARY,
                borderColor: row.assignedAdvisor ? PRIMARY : PRIMARY,
                color: row.assignedAdvisor ? PRIMARY : '#fff',
                fontWeight: 600
              }}
            >
              {row.assignedAdvisor ? 'Reassign' : 'Assign'}
            </Button>
          </Tooltip>
        </div>
      )
    },
  ];

  // ── Stat Cards ──────────────────────────────────────────────────────────────
  const statCards = [
    { label: 'Total Leads',  value: stats.total,      bg: '#faf5ff', color: PRIMARY,    icon: <ApartmentOutlined /> },
    { label: 'Unassigned',   value: stats.unassigned, bg: '#fff7ed', color: '#c2410c',  icon: <UserOutlined /> },
    { label: 'Needs Action', value: stats.hot,        bg: '#fef2f2', color: '#b91c1c',  icon: <FireOutlined /> },
    { label: 'Converted',    value: stats.converted,  bg: '#f0fdf4', color: '#16a34a',  icon: <CheckCircleFilled /> },
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
              <UserAddOutlined style={{ color: '#fff', fontSize: 16 }} />
            </div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#111827' }}>
              Lead Management
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
            Assign advisors to leads based on location & specialization
          </p>
        </div>
        <Button
  icon={<ReloadOutlined />}
  onClick={() => fetchLeads(filters)}   // ✅ sirf filters pass karo
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

      {/* ── Assign Modal ── */}
      <AssignModal
  lead={assignLead}
  visible={!!assignLead}
  onClose={() => setAssignLead(null)}
  onAssigned={() => fetchLeads(filters)}  
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

export default AllLeadsPage;