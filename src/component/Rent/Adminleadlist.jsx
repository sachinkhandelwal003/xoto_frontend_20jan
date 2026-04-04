import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button, Tag, Tooltip, Modal, message, Select,
  Form, Input, notification, Badge
} from 'antd';
import {
  UserAddOutlined,
  DeleteOutlined,
  EyeOutlined,
  HomeOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { apiService } from '../../manageApi/utils/custom.apiservice';
import CustomTable from '../../components/CMS/pages/custom/CustomTable';

const { Option } = Select;
const { TextArea } = Input;

const THEME = { primary: '#7c3aed' };

const STATUS_COLORS = {
  new: 'blue',
  assigned: 'purple',
  contacted: 'orange',
  closed: 'green',
  lost: 'red',
};

const STATUS_LABELS = {
  new: 'New Lead',
  assigned: 'Assigned',
  contacted: 'Contacted',
  closed: 'Closed',
  lost: 'Lost',
};

const AdminLeadList = () => {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeFilters, setActiveFilters] = useState({});

  // ── Agents list for assign dropdown ──
  const [agents, setAgents] = useState([]);
  const [agentsLoading, setAgentsLoading] = useState(false);

  // ── Assign Modal ──
  const [assignModal, setAssignModal] = useState({ open: false, lead: null });
  const [assignForm] = Form.useForm();
  const [assignLoading, setAssignLoading] = useState(false);

  // ── Status Update Modal ──
  const [statusModal, setStatusModal] = useState({ open: false, lead: null });
  const [statusForm] = Form.useForm();
  const [statusLoading, setStatusLoading] = useState(false);

  // ── View Modal ──
  const [viewModal, setViewModal] = useState({ open: false, lead: null });

  // ── Delete Modal ──
  const [deleteModal, setDeleteModal] = useState({ open: false, lead: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ================= FETCH LEADS =================
  const fetchLeads = useCallback(
    async (page = currentPage, limit = itemsPerPage, filters = activeFilters) => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page,
          limit,
          ...(filters.search ? { search: filters.search } : {}),
          ...(filters.status ? { status: filters.status } : {}),
          ...(filters.assignedAgent ? { assignedAgent: filters.assignedAgent } : {}),
        });

        const res = await apiService.get(`/rental/lead/all?${params.toString()}`);
        const list = res?.data?.data || [];
        const total = res?.data?.total || list.length;

        setData(list);
        setTotalItems(total);
      } catch (err) {
        message.error('Failed to load leads.');
      } finally {
        setLoading(false);
      }
    },
    [currentPage, itemsPerPage, activeFilters]
  );

  // ================= FETCH AGENTS =================
  const fetchAgents = async () => {
    try {
      setAgentsLoading(true);
      // Adjust endpoint to your agents/users API
      const res = await apiService.get('/admin/agents?limit=100');
      const list = res?.data?.data || res?.data || [];
      setAgents(list);
    } catch (err) {
      console.log('Failed to load agents', err);
    } finally {
      setAgentsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(1, itemsPerPage, {});
    fetchAgents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ================= HANDLERS =================
  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setItemsPerPage(size);
    fetchLeads(page, size, activeFilters);
  };

  const handleFilter = (filters) => {
    const cleaned = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined)
    );
    setActiveFilters(cleaned);
    setCurrentPage(1);
    fetchLeads(1, itemsPerPage, cleaned);
  };

  // ── Assign Agent ──
  const handleAssignSubmit = async () => {
    try {
      const values = await assignForm.validateFields();
      setAssignLoading(true);

      const selectedAgent = agents.find(
        (a) => (a._id || a.id) === values.agentId
      );

      await apiService.put(`/rental/lead/${assignModal.lead._id}/assign`, {
        agentId: values.agentId,
        agentName: selectedAgent?.name || selectedAgent?.fullName || '',
      });

      notification.success({
        message: 'Agent Assigned',
        description: `Lead assigned to ${selectedAgent?.name || 'agent'} successfully.`,
        placement: 'topRight',
      });

      setAssignModal({ open: false, lead: null });
      assignForm.resetFields();
      fetchLeads(currentPage, itemsPerPage, activeFilters);
    } catch (err) {
      if (err?.errorFields) return; // validation error
      message.error(err?.response?.data?.message || 'Failed to assign agent.');
    } finally {
      setAssignLoading(false);
    }
  };

  // ── Status Update ──
  const handleStatusSubmit = async () => {
    try {
      const values = await statusForm.validateFields();
      setStatusLoading(true);

      await apiService.put(`/rental/lead/${statusModal.lead._id}/status`, {
        status: values.status,
        notes: values.notes || '',
      });

      notification.success({
        message: 'Status Updated',
        description: `Lead status changed to "${STATUS_LABELS[values.status]}".`,
        placement: 'topRight',
      });

      setStatusModal({ open: false, lead: null });
      statusForm.resetFields();
      fetchLeads(currentPage, itemsPerPage, activeFilters);
    } catch (err) {
      if (err?.errorFields) return;
      message.error('Failed to update status.');
    } finally {
      setStatusLoading(false);
    }
  };

  // ── Delete ──
  const handleDelete = async () => {
    if (!deleteModal.lead) return;
    try {
      setDeleteLoading(true);
      await apiService.delete(`/rental/lead/${deleteModal.lead._id}`);
      message.success('Lead deleted successfully.');
      setDeleteModal({ open: false, lead: null });
      fetchLeads(currentPage, itemsPerPage, activeFilters);
    } catch (err) {
      message.error('Failed to delete lead.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ================= COLUMNS =================
  const columns = [
    {
      key: 'propertyTitle',
      title: 'Property',
      sortable: true,
      render: (val, record) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#111827', maxWidth: 200 }}
            className="truncate">
            {val || '—'}
          </div>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
            {record.propertyArea && `${record.propertyArea}, `}
            {record.propertyEmirate}
          </div>
          {record.propertyPrice > 0 && (
            <div style={{ fontSize: 11, color: '#059669', fontWeight: 600, marginTop: 2 }}>
              AED {Number(record.propertyPrice).toLocaleString()}/yr
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'customerName',
      title: 'Customer',
      sortable: true,
      render: (val, record) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#111827', display: 'flex', alignItems: 'center', gap: 4 }}>
            <UserOutlined style={{ color: THEME.primary, fontSize: 11 }} />
            {val || '—'}
          </div>
          {record.customerEmail && (
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
              <MailOutlined style={{ fontSize: 10 }} />
              {record.customerEmail}
            </div>
          )}
          {record.customerPhone && (
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
              <PhoneOutlined style={{ fontSize: 10 }} />
              {record.customerPhone}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      filterable: true,
      filterKey: 'status',
      filterOptions: [
        { label: 'New Lead', value: 'new' },
        { label: 'Assigned', value: 'assigned' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Closed', value: 'closed' },
        { label: 'Lost', value: 'lost' },
      ],
      render: (val) => (
        <Tag color={STATUS_COLORS[val] || 'default'} style={{ fontWeight: 600 }}>
          {STATUS_LABELS[val] || val}
        </Tag>
      ),
    },
    {
      key: 'assignedAgentName',
      title: 'Assigned Agent',
      sortable: false,
      filterable: true,
      filterKey: 'assignedAgent',
      filterOptions: [
        { label: 'Unassigned', value: 'unassigned' },
        ...agents.map((a) => ({
          label: a.name || a.fullName || 'Agent',
          value: a._id || a.id,
        })),
      ],
      render: (val) =>
        val ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: THEME.primary, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
              {val.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{val}</span>
          </div>
        ) : (
          <Tag color="warning" style={{ fontSize: 11 }}>Unassigned</Tag>
        ),
    },
    {
      key: 'createdAt',
      title: 'Received',
      sortable: true,
      render: (val) =>
        val
          ? new Date(val).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          : '—',
    },
    {
      key: 'actions',
      title: 'Actions',
      sortable: false,
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              style={{ color: '#0284c7' }}
              onClick={() => setViewModal({ open: true, lead: record })}
            />
          </Tooltip>
          <Tooltip title="Assign Agent">
            <Button
              type="text"
              icon={<UserAddOutlined />}
              size="small"
              style={{ color: THEME.primary }}
              onClick={() => {
                setAssignModal({ open: true, lead: record });
                if (record.assignedAgent) {
                  assignForm.setFieldsValue({ agentId: record.assignedAgent });
                }
              }}
            />
          </Tooltip>
          <Tooltip title="Update Status">
            <Button
              type="text"
              size="small"
              style={{ color: '#d97706', fontSize: 13 }}
              onClick={() => {
                setStatusModal({ open: true, lead: record });
                statusForm.setFieldsValue({
                  status: record.status,
                  notes: record.notes || '',
                });
              }}
            >
              ⚡
            </Button>
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={() => setDeleteModal({ open: true, lead: record })}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  // Stats Summary
  const statusCounts = data.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">

      {/* PAGE HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 m-0">Rental Leads</h2>
          <p className="text-gray-500 text-sm mt-1">
            Customer inquiries generated from rental listings
          </p>
        </div>
      </div>

      {/* STATS STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total', count: totalItems, color: '#6b7280', bg: '#f9fafb' },
          { label: 'New', count: statusCounts.new || 0, color: STATUS_COLORS.new, bg: '#eff6ff' },
          { label: 'Assigned', count: statusCounts.assigned || 0, color: '#7c3aed', bg: '#f5f3ff' },
          { label: 'Contacted', count: statusCounts.contacted || 0, color: '#d97706', bg: '#fffbeb' },
          { label: 'Closed', count: statusCounts.closed || 0, color: '#059669', bg: '#ecfdf5' },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{ background: stat.bg, border: `1px solid ${stat.color}22`, borderRadius: 12, padding: '12px 16px' }}
          >
            <div style={{ fontSize: 22, fontWeight: 900, color: stat.color }}>{stat.count}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* TABLE */}
      <CustomTable
        columns={columns}
        data={data}
        loading={loading}
        totalItems={totalItems}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onFilter={handleFilter}
        showSearch={true}
      />

      {/* ── ASSIGN AGENT MODAL ── */}
      <Modal
        open={assignModal.open}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserAddOutlined style={{ color: THEME.primary }} />
            Assign Agent to Lead
          </div>
        }
        onCancel={() => { setAssignModal({ open: false, lead: null }); assignForm.resetFields(); }}
        footer={[
          <Button key="cancel" onClick={() => { setAssignModal({ open: false, lead: null }); assignForm.resetFields(); }} disabled={assignLoading}>Cancel</Button>,
          <Button key="assign" type="primary" loading={assignLoading} onClick={handleAssignSubmit} style={{ background: THEME.primary, borderColor: THEME.primary }}>Assign Agent</Button>,
        ]}
        centered
      >
        {assignModal.lead && (
          <div style={{ background: '#f5f3ff', borderRadius: 8, padding: '10px 14px', marginBottom: 16, border: '1px solid #ddd6fe' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1e1b4b' }}>
              {assignModal.lead.propertyTitle || 'Property'}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
              Customer: <strong>{assignModal.lead.customerName}</strong>
              {assignModal.lead.customerPhone && ` · ${assignModal.lead.customerPhone}`}
            </div>
          </div>
        )}
        <Form form={assignForm} layout="vertical">
          <Form.Item
            name="agentId"
            label="Select Agent"
            rules={[{ required: true, message: 'Please select an agent' }]}
          >
            <Select
              size="large"
              showSearch
              loading={agentsLoading}
              placeholder="Search and select an agent..."
              optionFilterProp="children"
              filterOption={(input, option) =>
                option?.children?.toLowerCase?.().includes(input.toLowerCase())
              }
            >
              {agents.map((agent) => (
                <Option key={agent._id || agent.id} value={agent._id || agent.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: THEME.primary, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                      {(agent.name || agent.fullName || 'A').charAt(0).toUpperCase()}
                    </div>
                    {agent.name || agent.fullName || 'Agent'}
                    {agent.email && <span style={{ fontSize: 11, color: '#9ca3af' }}>· {agent.email}</span>}
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* ── STATUS UPDATE MODAL ── */}
      <Modal
        open={statusModal.open}
        title="Update Lead Status"
        onCancel={() => { setStatusModal({ open: false, lead: null }); statusForm.resetFields(); }}
        footer={[
          <Button key="cancel" onClick={() => { setStatusModal({ open: false, lead: null }); statusForm.resetFields(); }} disabled={statusLoading}>Cancel</Button>,
          <Button key="update" type="primary" loading={statusLoading} onClick={handleStatusSubmit} style={{ background: THEME.primary, borderColor: THEME.primary }}>Update Status</Button>,
        ]}
        centered
      >
        <Form form={statusForm} layout="vertical">
          <Form.Item name="status" label="New Status" rules={[{ required: true }]}>
            <Select size="large">
              {Object.entries(STATUS_LABELS).map(([val, label]) => (
                <Option key={val} value={val}>
                  <Tag color={STATUS_COLORS[val]}>{label}</Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="notes" label="Notes (optional)">
            <Input.TextArea rows={3} placeholder="Add any internal notes..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── VIEW LEAD MODAL ── */}
      <Modal
        open={viewModal.open}
        title="Lead Details"
        onCancel={() => setViewModal({ open: false, lead: null })}
        footer={[
          <Button key="close" onClick={() => setViewModal({ open: false, lead: null })}>Close</Button>,
          <Button
            key="assign"
            type="primary"
            icon={<UserAddOutlined />}
            style={{ background: THEME.primary, borderColor: THEME.primary }}
            onClick={() => {
              setViewModal({ open: false, lead: null });
              setAssignModal({ open: true, lead: viewModal.lead });
            }}
          >
            Assign Agent
          </Button>,
        ]}
        centered
        width={520}
      >
        {viewModal.lead && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Property Info */}
            <div style={{ background: '#f5f3ff', borderRadius: 10, padding: 14, border: '1px solid #ddd6fe' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                <HomeOutlined style={{ marginRight: 4 }} /> Property
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1e1b4b' }}>{viewModal.lead.propertyTitle}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>
                {viewModal.lead.propertyArea && `${viewModal.lead.propertyArea}, `}{viewModal.lead.propertyEmirate}
              </div>
              {viewModal.lead.propertyPrice > 0 && (
                <div style={{ fontSize: 13, fontWeight: 700, color: '#059669', marginTop: 4 }}>
                  AED {Number(viewModal.lead.propertyPrice).toLocaleString()} / year
                </div>
              )}
            </div>

            {/* Customer Info */}
            <div style={{ background: '#f0fdf4', borderRadius: 10, padding: 14, border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                <UserOutlined style={{ marginRight: 4 }} /> Customer
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1e1b4b' }}>{viewModal.lead.customerName || '—'}</div>
                {viewModal.lead.customerEmail && (
                  <div style={{ fontSize: 12, color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MailOutlined style={{ color: '#059669' }} /> {viewModal.lead.customerEmail}
                  </div>
                )}
                {viewModal.lead.customerPhone && (
                  <div style={{ fontSize: 12, color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <PhoneOutlined style={{ color: '#059669' }} /> {viewModal.lead.customerPhone}
                  </div>
                )}
              </div>
            </div>

            {/* Status & Agent */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ background: '#f9fafb', borderRadius: 10, padding: 12, border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 6 }}>Status</div>
                <Tag color={STATUS_COLORS[viewModal.lead.status]}>{STATUS_LABELS[viewModal.lead.status]}</Tag>
              </div>
              <div style={{ background: '#f9fafb', borderRadius: 10, padding: 12, border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 6 }}>Agent</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: viewModal.lead.assignedAgentName ? '#1e1b4b' : '#9ca3af' }}>
                  {viewModal.lead.assignedAgentName || 'Not assigned'}
                </div>
              </div>
            </div>

            {/* Notes */}
            {viewModal.lead.notes && (
              <div style={{ background: '#fffbeb', borderRadius: 10, padding: 12, border: '1px solid #fde68a' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#d97706', textTransform: 'uppercase', marginBottom: 6 }}>Notes</div>
                <div style={{ fontSize: 13, color: '#374151' }}>{viewModal.lead.notes}</div>
              </div>
            )}

            {/* Received At */}
            <div style={{ fontSize: 12, color: '#9ca3af', textAlign: 'right' }}>
              Received: {viewModal.lead.createdAt ? new Date(viewModal.lead.createdAt).toLocaleString('en-GB') : '—'}
            </div>
          </div>
        )}
      </Modal>

      {/* ── DELETE MODAL ── */}
      <Modal
        open={deleteModal.open}
        title="Delete Lead"
        onCancel={() => !deleteLoading && setDeleteModal({ open: false, lead: null })}
        footer={[
          <Button key="cancel" onClick={() => setDeleteModal({ open: false, lead: null })} disabled={deleteLoading}>Cancel</Button>,
          <Button key="delete" danger type="primary" loading={deleteLoading} onClick={handleDelete}>Delete</Button>,
        ]}
        centered
      >
        <p>
          Are you sure you want to delete the lead from{' '}
          <strong>{deleteModal.lead?.customerName}</strong> for{' '}
          <strong>"{deleteModal.lead?.propertyTitle}"</strong>?
          This cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default AdminLeadList;