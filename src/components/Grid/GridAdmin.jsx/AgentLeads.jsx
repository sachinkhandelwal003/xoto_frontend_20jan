import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../../manageApi/utils/custom.apiservice';
import {
  Modal, Button, Tag, Tooltip, Avatar, Radio,
  Spin, Empty, message, Drawer,
} from 'antd';
import {
  UserAddOutlined, EyeOutlined, CheckCircleFilled,
  ReloadOutlined, UserOutlined, FireOutlined,
  HomeOutlined, FileTextOutlined, TeamOutlined,
} from '@ant-design/icons';
import CustomTable from '../../CMS/pages/custom/CustomTable';

const PRIMARY = '#5c039b';
const AGENT_TEAL = '#0d9488';

const FIXED_AGENT_FILTERS = {
  lead_type: 'agent',
  source_channel: 'agent_added',
};

const TYPE_COLORS = {
  buy: { bg: '#ede9fe', color: '#5b21b6', label: 'Buy' },
  sell: { bg: '#fce7f3', color: '#9d174d', label: 'Sell' },
  rent: { bg: '#dbeafe', color: '#1e40af', label: 'Rent' },
  consultation: { bg: '#fef3c7', color: '#92400e', label: 'Consultation' },
  schedule_visit: { bg: '#e0f2fe', color: '#075985', label: 'Site Visit' },
  hot_property: { bg: '#fee2e2', color: '#dc2626', label: 'Hot Property' },
  general_enquiry: { bg: '#f3f4f6', color: '#374151', label: 'General Enquiry' },
};

const STATUS_COLORS = {
  new: { color: 'blue', label: 'New' },
  contacted: { color: 'orange', label: 'Contacted' },
  qualified: { color: 'cyan', label: 'Qualified' },
  in_discussion: { color: 'purple', label: 'In Discussion' },
  site_visit_scheduled: { color: 'geekblue', label: 'Site Visit Scheduled' },
  offer_made: { color: 'gold', label: 'Offer Made' },
  reserved: { color: 'lime', label: 'Reserved' },
  spa_signed: { color: 'green', label: 'SPA Signed' },
  completed: { color: 'success', label: 'Completed' },
  not_proceeding: { color: 'red', label: 'Not Proceeding' },
};

const CLASSIFICATION_CONFIG = {
  hot: { color: 'red', label: 'Hot' },
  warm: { color: 'orange', label: 'Warm' },
  cold: { color: 'blue', label: 'Cold' },
};

// PRD workflow order (screenshot ke according)
const PRD_WORKFLOW_ORDER = [
  'new',
  'contacted',
  'in_discussion',
  'site_visit_scheduled',
  'offer_made',
  'reserved',
  'spa_signed',
  'completed',
];

const TypeTag = ({ type }) => {
  const t = TYPE_COLORS[type] || { bg: '#f3f4f6', color: '#374151', label: type };
  return (
    <span style={{
      background: t.bg, color: t.color,
      padding: '2px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
    }}>
      {t.label}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const s = STATUS_COLORS[status] || { color: 'default', label: status };
  return <Tag color={s.color} style={{ borderRadius: 20, fontSize: 11 }}>{s.label}</Tag>;
};

const ClassificationBadge = ({ value }) => {
  const c = CLASSIFICATION_CONFIG[value] || { color: 'default', label: value };
  return (
    <Tag color={c.color} style={{ borderRadius: 20, fontSize: 11, textTransform: 'capitalize' }}>
      {c.label || '—'}
    </Tag>
  );
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

const AgentChip = ({ agent }) => {
  if (!agent) return <span style={{ color: '#9ca3af', fontSize: 12 }}>—</span>;
  const first = agent.first_name || agent.firstName || '';
  const last = agent.last_name || agent.lastName || '';
  const initials = `${first[0] || ''}${last[0] || ''}`.toUpperCase();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <Avatar size={24} style={{ background: AGENT_TEAL, fontSize: 10, fontWeight: 700 }}>{initials}</Avatar>
      <div>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#374151', lineHeight: 1.2 }}>
          {first} {last}
        </div>
        {agent.role && (
          <div style={{ fontSize: 10, color: '#6b7280', textTransform: 'capitalize' }}>{agent.role}</div>
        )}
      </div>
    </div>
  );
};

const SectionTitle = ({ icon, label }) => (
  <div style={{
    fontSize: 11, fontWeight: 700, color: '#374151',
    marginBottom: 10, marginTop: 4,
    textTransform: 'uppercase', letterSpacing: 0.6,
    display: 'flex', alignItems: 'center', gap: 6,
    paddingBottom: 6, borderBottom: '1px solid #f3f4f6',
  }}>
    {icon && <span style={{ color: PRIMARY, fontSize: 13 }}>{icon}</span>}
    {label}
  </div>
);

const Row = ({ label, children }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '7px 0', borderBottom: '0.5px solid #f3f4f6', fontSize: 13,
  }}>
    <span style={{ color: '#6b7280', minWidth: 150, flexShrink: 0 }}>{label}</span>
    <span style={{ color: '#111827', textAlign: 'right' }}>{children}</span>
  </div>
);

const getPrdNextStepLabel = (status) => {
  const idx = PRD_WORKFLOW_ORDER.indexOf(status);
  if (idx === -1) return '—';
  const next = PRD_WORKFLOW_ORDER[idx + 1];
  if (!next) return STATUS_COLORS.completed?.label || 'Completed';
  return STATUS_COLORS[next]?.label || next;
};

const getPrdLastStatusUpdate = (lead) => {
  const history = lead?.status_history || [];
  if (!history.length) return '—';

  const latest = [...history].sort((a, b) => {
    const da = a?.changed_at ? new Date(a.changed_at).getTime() : 0;
    const db = b?.changed_at ? new Date(b.changed_at).getTime() : 0;
    return db - da;
  })[0];

  return latest?.changed_at
    ? new Date(latest.changed_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';
};

// ─── Assign Modal ─────────────────────────────────────────────────────────────

const AssignModal = ({ lead, visible, onClose, onAssigned }) => {
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [options, setOptions] = useState([]);
  const [recommended, setRecommended] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (visible && lead) {
      fetchAdvisors();
      setNotes('');
    }
  }, [visible, lead]);

  const fetchAdvisors = async () => {
    setLoading(true);
    try {
      const res = await apiService.get(`/gridlead/${lead._id}/suggest-advisors`);
      const resData = res?.data || res;

      setOptions(resData?.options || []);
      setRecommended(resData?.recommended || null);

      if (lead.assigned_to) {
        setSelectedId(
          typeof lead.assigned_to === 'object' ? lead.assigned_to._id : lead.assigned_to
        );
      } else if (resData?.recommended) {
        setSelectedId(resData.recommended._id);
      }
    } catch {
      message.error('Could not load advisors');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedId) return message.warning('Please select an advisor');
    setAssigning(true);
    try {
      await apiService.put(`/gridlead/${lead._id}/assign`, {
        advisorId: selectedId,
        notes,
      });
      message.success(lead.assigned_to ? 'Advisor reassigned successfully' : 'Advisor assigned successfully');
      onAssigned();
      onClose();
    } catch (err) {
      message.error(err?.response?.data?.message || 'Assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Modal
      open={visible} onCancel={onClose}
      footer={null} width={520}
      title={lead?.assigned_to ? 'Reassign Advisor' : 'Assign Advisor'}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 32 }}><Spin /></div>
      ) : (
        <>
          <div style={{
            background: '#ffffff', borderRadius: 8, padding: '10px 14px',
            marginBottom: 16, fontSize: 12, color: '#374151',
          }}>
            <strong>
              {lead?.contact_info?.name?.first_name
                ? `${lead.contact_info.name.first_name} ${lead.contact_info.name.last_name || ''}`
                : 'No client info'}
            </strong>
            <span style={{ marginLeft: 8, color: '#6b7280' }}>
              · {lead?.requirements?.property_type || '—'}
              {lead?.requirements?.bedrooms ? ` · ${lead.requirements.bedrooms} BR` : ''}
            </span>
          </div>

          {recommended && !lead?.assigned_to && (
            <div style={{
              background: '#ede9fe', border: '1px solid #c4b5fd',
              borderRadius: 8, padding: '8px 12px', marginBottom: 12,
              fontSize: 12, color: '#5b21b6',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ fontWeight: 700 }}>⭐ Best Match:</span>
              {recommended.firstName} {recommended.lastName}
              <span style={{ color: '#7c3aed', marginLeft: 4 }}>
                (Score: {recommended.leaderboard?.compositeScore || 0} ·
                Active Leads: {recommended.workload?.activeLeadsCount || 0})
              </span>
            </div>
          )}

          <Radio.Group
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            style={{ width: '100%' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {options.length === 0 && (
                <Empty description="No active advisors found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
              {options.map(adv => {
                const isBestMatch = recommended?._id === adv._id;
                return (
                  <Radio key={adv._id} value={adv._id} style={{ margin: 0 }}>
                    <div style={{
                      padding: '10px 14px',
                      border: `1px solid ${isBestMatch ? '#c4b5fd' : '#e5e7eb'}`,
                      borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10,
                      background: isBestMatch ? '#faf5ff' : '#fff',
                    }}>
                      <Avatar size={28} style={{ background: PRIMARY, fontSize: 11, fontWeight: 700 }}>
                        {`${adv.firstName?.[0] || ''}${adv.lastName?.[0] || ''}`.toUpperCase()}
                      </Avatar>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>
                          {adv.firstName} {adv.lastName}
                          {isBestMatch && (
                            <span style={{
                              marginLeft: 6, fontSize: 10,
                              background: '#ede9fe', color: '#5b21b6',
                              padding: '1px 6px', borderRadius: 20,
                            }}>
                              Best Match
                            </span>
                          )}
                        </div>
                        {adv.email && (
                          <div style={{ fontSize: 11, color: '#6b7280' }}>{adv.email}</div>
                        )}
                      </div>

                      <div style={{ fontSize: 10, color: '#9ca3af', textAlign: 'right', lineHeight: 1.6 }}>
                        <div>Score: {adv.leaderboard?.compositeScore || 0}</div>
                        <div>Leads: {adv.workload?.activeLeadsCount || 0}</div>
                      </div>
                    </div>
                  </Radio>
                );
              })}
            </div>
          </Radio.Group>

          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Assignment note (optional)"
            rows={2}
            style={{
              width: '100%', marginTop: 12,
              border: '1px solid #e5e7eb', borderRadius: 8,
              padding: '8px 10px', fontSize: 13, resize: 'none',
              fontFamily: 'inherit',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="primary" loading={assigning}
              onClick={handleAssign}
              disabled={!selectedId}
              style={{ background: PRIMARY }}
            >
              {lead?.assigned_to ? 'Reassign' : 'Assign'}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
};

// ─── Detail Drawer ────────────────────────────────────────────────────────────

const AgentLeadDetailDrawer = ({ lead, visible, onClose, onAssign }) => {
  if (!lead) return null;

  const req = lead.requirements || {};
  const contact = lead.contact_info || {};
  const agent = lead.created_by_agent || null;
  const advisor = lead.assignedAdvisor || null;

  const agentFirst = agent?.first_name || agent?.firstName || '';
  const agentLast = agent?.last_name || agent?.lastName || '';
  const agentPhone = agent?.phone_number || agent?.phone || '—';

  const formatBudget = () => {
    const min = req.budget_min ? `AED ${(req.budget_min / 1000).toFixed(0)}k` : null;
    const max = req.budget_max ? `AED ${(req.budget_max / 1000).toFixed(0)}k` : null;
    if (min && max) return `${min} – ${max}`;
    return min || max || '—';
  };

  return (
    <Drawer
      open={visible} onClose={onClose}
      width={560} title="Agent Lead Details"
      styles={{ body: { padding: '20px 24px' } }}
      extra={
        <Button
          type="primary" icon={<UserAddOutlined />}
          style={{ background: PRIMARY }}
          onClick={() => { onClose(); onAssign(lead); }}
        >
          {lead.assigned_to ? 'Reassign' : 'Assign Advisor'}
        </Button>
      }
    >
      <SectionTitle icon={<UserOutlined />} label="Client Contact" />
      <div style={{ marginBottom: 20 }}>
        <Row label="Full Name">
          {contact.name?.first_name
            ? `${contact.name.first_name} ${contact.name.last_name || ''}`
            : <span style={{ color: '#9ca3af' }}>— Not provided</span>}
        </Row>

        <Row label="Phone">
          {contact.mobile?.number
            ? `${contact.mobile.country_code || ''} ${contact.mobile.number}`
            : <span style={{ color: '#9ca3af' }}>— Not provided</span>}
        </Row>

        <Row label="Email">
          {contact.email?.address || <span style={{ color: '#9ca3af' }}>— Not provided</span>}
        </Row>

        <Row label="Preferred Contact">
          {{ whatsapp: 'WhatsApp', call: 'Call', email: 'Email' }[contact.preferred_contact] || '—'}
        </Row>
      </div>

      <SectionTitle icon={<FileTextOutlined />} label="Lead Info" />
      <div style={{ marginBottom: 20 }}>
        <Row label="Enquiry Type"> <TypeTag type={lead.enquiry_type} /> </Row>
        <Row label="Status"> <StatusBadge status={lead.status} /> </Row>
        <Row label="Grade"> <ClassificationBadge value={lead.classification} /> </Row>
        <Row label="Source"> {lead.source?.channel?.replace(/_/g, ' ') || '—'} </Row>
        <Row label="Created">
          {lead.createdAt
            ? new Date(lead.createdAt).toLocaleString('en-IN', {
              day: '2-digit', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })
            : '—'}
        </Row>

        {/* PRD workflow helpers (small rows, UI style same) */}
        <Row label="Workflow Next">{getPrdNextStepLabel(lead.status)}</Row>
        <Row label="Last Status Update">{getPrdLastStatusUpdate(lead)}</Row>
      </div>

      <SectionTitle icon={<TeamOutlined />} label="Created By Agent" />
      <div style={{ marginBottom: 20 }}>
        {!agent ? (
          <span style={{ fontSize: 13, color: '#9ca3af' }}>— No agent info</span>
        ) : (
          <>
            <Row label="Name">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                <Avatar size={22} style={{ background: AGENT_TEAL, fontSize: 9, fontWeight: 700 }}>
                  {`${agentFirst[0] || ''}${agentLast[0] || ''}`.toUpperCase()}
                </Avatar>
                <span>{agentFirst} {agentLast}</span>
              </div>
            </Row>
            <Row label="Phone">{agentPhone}</Row>
            <Row label="Email">{agent.email || '—'}</Row>
            <Row label="Role">
              <span style={{ textTransform: 'capitalize' }}>{agent.role || '—'}</span>
            </Row>
          </>
        )}
      </div>

      <SectionTitle icon={<UserOutlined />} label="Assigned Advisor" />
      <div style={{ marginBottom: 20 }}>
        {!advisor ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#9ca3af' }}>— Not assigned yet</span>
            <Button
              size="small" type="primary"
              style={{ background: PRIMARY, fontSize: 11 }}
              onClick={() => { onClose(); onAssign(lead); }}
            >
              Assign Now
            </Button>
          </div>
        ) : (
          <>
            <Row label="Name">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                <Avatar size={22} style={{ background: PRIMARY, fontSize: 9, fontWeight: 700 }}>
                  {`${advisor.firstName?.[0] || ''}${advisor.lastName?.[0] || ''}`.toUpperCase()}
                </Avatar>
                <span>{advisor.firstName} {advisor.lastName}</span>
              </div>
            </Row>
            <Row label="Email">{advisor.email || '—'}</Row>
            <Row label="Assigned On">
              {lead.assigned_at
                ? new Date(lead.assigned_at).toLocaleDateString('en-IN', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })
                : '—'}
            </Row>
          </>
        )}
      </div>

      <SectionTitle icon={<HomeOutlined />} label="Client Requirements" />
      <div style={{ marginBottom: 20 }}>
        <Row label="Property Type"> {req.property_type || '—'} </Row>
        <Row label="Transaction"> {req.transaction_type || '—'} </Row>
        <Row label="Bedrooms"> {req.bedrooms || '—'} </Row>
        <Row label="Bathrooms"> {req.bathrooms || '—'} </Row>
        <Row label="Budget"> {formatBudget()} </Row>
        <Row label="Area (sqft)">
          {req.area_sqft_min || req.area_sqft_max
            ? `${req.area_sqft_min || '—'} – ${req.area_sqft_max || '—'}`
            : '—'}
        </Row>
        <Row label="Furnished"> {req.furnished || '—'} </Row>

        {req.location_preferences?.length > 0 && (
          <div style={{ padding: '7px 0', borderBottom: '0.5px solid #f3f4f6' }}>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>Preferred Locations</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {req.location_preferences.map((loc, i) => (
                <span
                  key={i}
                  style={{
                    background: '#f0fdfa', color: AGENT_TEAL,
                    fontSize: 11, padding: '2px 8px', borderRadius: 20,
                    fontWeight: 500, border: `1px solid ${AGENT_TEAL}22`,
                  }}
                >
                  {typeof loc === 'object' ? loc.area : loc}
                </span>
              ))}
            </div>
          </div>
        )}

        {req.additional_notes && (
          <div style={{ padding: '7px 0' }}>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>Additional Notes</div>
            <div style={{
              background: '#f9fafb', borderRadius: 8,
              padding: '10px 12px', fontSize: 12,
              color: '#374151', lineHeight: 1.7,
              border: '0.5px solid #e5e7eb',
            }}>
              {req.additional_notes}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const AgentLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  const [assignLead, setAssignLead] = useState(null);
  const [viewLead, setViewLead] = useState(null);
  const [filters, setFilters] = useState(FIXED_AGENT_FILTERS);

  const [stats, setStats] = useState({ total: 0, unassigned: 0, hot: 0, completed: 0 });

  const fetchLeads = useCallback(async (extraFilters = {}, page = 1, limit = 10) => {
    setLoading(true);
    try {
      const merged = { ...FIXED_AGENT_FILTERS, ...extraFilters };
      const query = new URLSearchParams();

      query.set('page', page);
      query.set('limit', limit);

      if (merged.search) query.set('search', merged.search);
      if (merged.status) query.set('status', merged.status);
      if (merged.type) query.set('type', merged.type);
      if (merged.classification) query.set('classification', merged.classification);

      const res = await apiService.get(`/gridlead/agent-only?${query.toString()}`);
      const leadsData = res?.data || [];
      const paginationData = res?.pagination || {};

      setLeads(leadsData);
      setPagination({
        page: paginationData.page || page,
        limit: paginationData.limit || limit,
        total: paginationData.total || leadsData.length,
        totalPages: paginationData.totalPages || 1,
      });

      setStats({
        total: paginationData.total || leadsData.length,
        unassigned: leadsData.filter(l => !l.assigned_to).length,
        hot: leadsData.filter(l => l.classification === 'hot' && !l.assigned_to).length,
        completed: leadsData.filter(l => l.status === 'completed').length,
      });
    } catch (err) {
      console.error(err);
      message.error('Failed to fetch agent leads');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeads(FIXED_AGENT_FILTERS); }, [fetchLeads]);

  const handlePageChange = (page, limit) => fetchLeads(filters, page, limit);

  const handleFilter = (newFilters) => {
    const merged = { ...FIXED_AGENT_FILTERS, ...filters, ...newFilters };
    setFilters(merged);
    fetchLeads(merged, 1, pagination.limit);
  };

  const columns = [
    {
      title: 'Client Name',
      key: 'contact_info_name',
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>
            {row.contact_info?.name?.first_name
              ? `${row.contact_info.name.first_name} ${row.contact_info.name.last_name || ''}`
              : <span style={{ color: '#9ca3af', fontWeight: 400 }}>— No client</span>}
            {row.contact_info?.name?.is_masked && (
              <span style={{
                marginLeft: 6, fontSize: 10, background: '#fef3c7', color: '#92400e',
                padding: '1px 6px', borderRadius: 20
              }}>
              </span>
            )}
          </div>

          {row.contact_info?.email?.address && (
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
              {row.contact_info.email.address}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Phone',
      key: 'contact_info_phone',
      render: (_, row) => (
        <span style={{ fontSize: 12, color: '#374151', whiteSpace: 'nowrap' }}>
          {row.contact_info?.mobile?.number
            ? `${row.contact_info.mobile.country_code || ''} ${row.contact_info.mobile.number}`
            : <span style={{ color: '#9ca3af' }}>— N/A</span>}
        </span>
      ),
    },
    {
      title: 'Type',
      key: 'enquiry_type',
      filterable: true,
      filterKey: 'type',
      filterOptions: Object.entries(TYPE_COLORS).map(([k, v]) => ({ value: k, label: v.label })),
      render: (_, row) => <TypeTag type={row.enquiry_type} />,
    },
    {
      title: 'Status',
      key: 'status',
      filterable: true,
      filterKey: 'status',
      filterOptions: Object.entries(STATUS_COLORS).map(([k, v]) => ({ value: k, label: v.label })),
      render: (val) => <StatusBadge status={val} />,
    },
    {
      title: 'Grade',
      key: 'classification',
      filterable: true,
      filterKey: 'classification',
      filterOptions: Object.entries(CLASSIFICATION_CONFIG).map(([k, v]) => ({ value: k, label: v.label })),
      render: (val) => <ClassificationBadge value={val} />,
    },
    {
      title: 'Created By (Agent)',
      key: 'created_by_agent',
      render: (_, row) => <AgentChip agent={row.created_by_agent} />,
    },
    {
      title: 'Assigned Advisor',
      key: 'assignedAdvisor',
      render: (_, row) => <AdvisorChip advisor={row.assignedAdvisor} />,
    },
    {
      title: 'Date',
      key: 'createdAt',
      render: (val) => (
        <span style={{ fontSize: 12, color: '#6b7280' }}>
          {val ? new Date(val).toLocaleDateString('en-IN') : '—'}
        </span>
      ),
    },
    {
      title: 'Actions', 
      key: '_id',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <Tooltip title="View Details">
            <Button size="small" icon={<EyeOutlined />} onClick={() => setViewLead(row)} />
          </Tooltip>
          <Tooltip title={row.assigned_to ? 'Reassign Advisor' : 'Assign Advisor'}>
            <Button
              size="small" icon={<UserAddOutlined />}
              onClick={() => setAssignLead(row)}
              style={!row.assigned_to ? { borderColor: PRIMARY, color: PRIMARY } : {}}
            >
              {row.assigned_to ? 'Reassign' : 'Assign'}
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  const statCards = [
    { label: 'Agent Leads', value: stats.total, bg: '#f0fdfa', color: AGENT_TEAL, icon: <TeamOutlined /> },
    { label: 'Unassigned', value: stats.unassigned, bg: '#fff7ed', color: '#c2410c', icon: <UserOutlined /> },
    { label: 'Hot & Unassigned', value: stats.hot, bg: '#fef2f2', color: '#b91c1c', icon: <FireOutlined /> },
    { label: 'Completed', value: stats.completed, bg: '#f0fdf4', color: '#16a34a', icon: <CheckCircleFilled /> },
  ];

  return (
    <div style={{ padding: '28px 32px', background: '#f0fdfa', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#111827' }}>Agent Leads</h1>
          <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
            Leads created by agents — assign advisors to proceed
          </p>
        </div>

        <Button
          icon={<ReloadOutlined />}
          onClick={() => fetchLeads(filters, pagination.page, pagination.limit)}
          style={{ borderColor: AGENT_TEAL, color: AGENT_TEAL }}
        >
          Refresh
        </Button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 12, marginBottom: 24,
      }}>
        {statCards.map((s, i) => (
          <div key={i} style={{
            background: '#fff', border: '1px solid #ccfbf1',
            borderRadius: 12, padding: '16px 18px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#6b7280' }}>{s.label}</span>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: s.bg, color: s.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {s.icon}
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#111827' }}>{s.value}</div>
          </div>
        ))}
      </div>

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

      <AssignModal
        lead={assignLead}
        visible={!!assignLead}
        onClose={() => setAssignLead(null)}
        onAssigned={() => {
          setAssignLead(null);
          fetchLeads(filters, pagination.page, pagination.limit);
        }}
      />

      <AgentLeadDetailDrawer
        lead={viewLead}
        visible={!!viewLead}
        onClose={() => setViewLead(null)}
        onAssign={(lead) => setAssignLead(lead)}
      />
    </div>
  );
};

export default AgentLeads;