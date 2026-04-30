// src/components/leads/SubmitLeads.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Card, Drawer, Descriptions, Tag, Button, Space, Badge,
  message, Avatar, Row, Col, Tabs, Statistic, Tooltip, Empty,
  Modal, Form, Input, InputNumber, Select
} from 'antd';
import {
  PhoneOutlined, MailOutlined, UserOutlined,
  CheckCircleOutlined, EyeOutlined, DeleteOutlined, BellOutlined,
  UsergroupAddOutlined, MessageOutlined, GlobalOutlined,
  AppstoreAddOutlined, PlusOutlined
} from '@ant-design/icons';

// Make sure your apiService is correctly imported
import { apiService } from '../../../manageApi/utils/custom.apiservice';
import { showSuccessAlert, showConfirmDialog } from '../../../manageApi/utils/sweetAlert';
import CustomTable from '../../CMS/pages/custom/CustomTable';

// --- THEME CONFIGURATION ---
const THEME = {
  primary: "#722ed1",
  secondary: "#1890ff",
  success: "#52c41a",
  warning: "#faad14",
  error: "#ff4d4f",
  bgLight: "#f9f0ff",
};

// --- CONFIGURATION FOR SUBMIT LEAD TYPES ---
const typeConfig = {
  general: { label: 'General', color: 'blue', icon: <AppstoreAddOutlined /> },
  support: { label: 'Support', color: 'purple', icon: <MessageOutlined /> },
  sales: { label: 'Sales', color: 'cyan', icon: <GlobalOutlined /> },
  referral: { label: 'Referral', color: 'volcano', icon: <UsergroupAddOutlined /> },
};

const statusConfig = {
  new: { label: 'New Lead', color: 'orange', icon: <BellOutlined /> },
  in_progress: { label: 'In Progress', color: 'blue', icon: <CheckCircleOutlined /> },
  resolved: { label: 'Resolved', color: 'green', icon: <CheckCircleOutlined /> },
  spam: { label: 'Spam/Dead', color: 'red', icon: <DeleteOutlined /> }
};

// --- MOCK DATA FOR UI TESTING ---
const INITIAL_MOCK_DATA = [
  {
    _id: '1',
    full_name: 'Rahul Sharma',
    email: 'rahul@example.com',
    mobile: { country_code: '+91', number: '9876543210' },
    type: 'support',
    status: 'new',
    subject: 'Need help with property listing',
    message: 'I am unable to upload photos for my new property listing. Please guide.',
    createdAt: new Date().toISOString()
  },
  {
    _id: '2',
    full_name: 'Priya Verma',
    email: 'priya@example.com',
    mobile: { country_code: '+91', number: '9988776655' },
    type: 'sales',
    status: 'in_progress',
    subject: 'Premium Plan Pricing',
    message: 'Can you share the pricing plan for broker agencies?',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    _id: '3',
    full_name: 'Amit Patel',
    email: 'amit@example.com',
    mobile: { country_code: '+91', number: '9123456780' },
    type: 'general',
    status: 'resolved',
    subject: 'Feedback on website',
    message: 'The new UI looks great, but loading time can be improved.',
    createdAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    _id: '4',
    full_name: 'Sunil Kumar',
    email: 'sunil.kumar@example.com',
    mobile: { country_code: '+971', number: '501234567' },
    type: 'referral',
    status: 'new',
    subject: 'Interested in Dubai Marina Apartment',
    message: 'Looking for a 2BHK apartment with a budget around 2,500,000 AED.',
    createdAt: new Date().toISOString()
  }
];

const SubmitLeads = () => {
  const [allMockLeads, setAllMockLeads] = useState(INITIAL_MOCK_DATA);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  // Modal States
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [form] = Form.useForm();

  const [filters, setFilters] = useState({ search: '' });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0
  });

  const stats = useMemo(() => {
    return {
      total: allMockLeads.length,
      new: allMockLeads.filter(l => l.status === 'new').length,
      resolved: allMockLeads.filter(l => l.status === 'resolved').length,
    };
  }, [allMockLeads]);

  // Fetch Logic (Using Mock Data for now)
  const fetchLeads = (tab = activeTab, page = 1, limit = 10, search = '') => {
    setLoading(true);
    setTimeout(() => {
      let filteredData = [...allMockLeads];

      if (tab !== 'all') {
        filteredData = filteredData.filter(item => item.type === tab);
      }

      if (search) {
        const lowerQuery = search.toLowerCase();
        filteredData = filteredData.filter(item => 
          item.full_name?.toLowerCase().includes(lowerQuery) || 
          item.email?.toLowerCase().includes(lowerQuery)
        );
      }

      setLeads(filteredData);
      setPagination({
        currentPage: page,
        itemsPerPage: limit,
        totalItems: filteredData.length
      });
      
      setLoading(false);
    }, 500); 
  };

  useEffect(() => {
    fetchLeads(activeTab, 1, pagination.itemsPerPage, filters.search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, allMockLeads]);

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const handlePageChange = (page, pageSize) => {
    fetchLeads(activeTab, page, pageSize, filters.search);
  };

  const handleFilter = (newFilters) => {
    const updatedFilters = {
      ...filters,
      ...newFilters,
      search: (newFilters?.search || '').trim(),
    };
    setFilters(updatedFilters);
    fetchLeads(activeTab, 1, pagination.itemsPerPage, updatedFilters.search);
  };

  // Status Update Mock
  const updateLeadStatus = async (id, newStatus) => {
    showSuccessAlert('Success!', `Lead marked as ${newStatus}`);
    setAllMockLeads(prev => 
      prev.map(l => (l._id === id ? { ...l, status: newStatus } : l))
    );
    if (selectedLead?._id === id) {
      setSelectedLead({ ...selectedLead, status: newStatus });
    }
  };

  // Delete Mock
  const softDelete = async (id) => {
    const result = await showConfirmDialog('Delete Lead?', 'This will move it to trash.', 'Yes, Delete');
    if (result.isConfirmed) {
      showSuccessAlert('Deleted', 'Lead moved to trash');
      setAllMockLeads(prev => prev.filter(l => l._id !== id));
      setDrawerVisible(false);
    }
  };

  // --- ADD LEAD API INTEGRATION (With Token Fix) ---
  const handleAddLead = async (values) => {
    setAddLoading(true);
    try {
      const payload = {
        customerName: values.customerName,
        countryCode: values.countryCode || '+91',
        customerPhone: values.customerPhone,
        interestArea: values.interestArea,
        budget: Number(values.budget),
        propertyType: values.propertyType
      };

      // 🔥 TOKEN GET KIYA: check karo aap local storage mein kis naam se save karte ho (token ya accessToken)
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");

      // API Call
      await apiService.post('/referral/add-lead', payload, {
        headers: {
          Authorization: `Bearer ${token}` // 🔥 Authorization header yahan add kiya
        }
      });

      // Show SweetAlert
      showSuccessAlert('Lead Created!', 'Your referral lead has been added successfully.');
      
      // Close Modal and Reset
      setIsAddModalVisible(false);
      form.resetFields();

      // UI Update ke liye Mock Store me data dal rahe hain 
      const newMockEntry = {
        _id: Math.random().toString(36).substr(2, 9),
        full_name: payload.customerName,
        email: 'N/A',
        mobile: { country_code: payload.countryCode, number: payload.customerPhone },
        type: 'referral',
        status: 'new',
        subject: `Interested in ${payload.propertyType} at ${payload.interestArea}`,
        message: `Budget: ${payload.budget}`,
        createdAt: new Date().toISOString()
      };

      setAllMockLeads(prev => [newMockEntry, ...prev]);

    } catch (err) {
      console.error("Add Lead Error:", err);
      message.error(err?.response?.data?.message || 'Failed to add new lead.');
    } finally {
      setAddLoading(false);
    }
  };

  const getFullName = (record) => {
    if (record.full_name) return record.full_name;
    if (record.name && record.name.first_name) {
      return `${record.name.first_name} ${record.name.last_name || ''}`.trim();
    }
    return 'Unknown User';
  };

  const columns = [
    {
      title: 'User Details',
      key: 'name',
      width: 250,
      render: (_, record) => (
        <Space>
          <Avatar style={{ backgroundColor: THEME.secondary }} icon={<UserOutlined />} size="large">
            {getFullName(record)?.[0]?.toUpperCase()}
          </Avatar>
          <div>
            <div className="font-bold text-gray-800">{getFullName(record)}</div>
            <div className="text-xs text-gray-500">{new Date(record.createdAt).toLocaleDateString()}</div>
          </div>
        </Space>
      )
    },
    {
      title: 'Category',
      key: 'type',
      render: (_, record) => {
        const config = typeConfig[record.type] || { label: record.type || 'General', color: 'default', icon: <AppstoreAddOutlined /> };
        return (
          <Tag icon={config.icon} color={config.color} style={{ borderRadius: 12, padding: '2px 10px' }}>
            {config.label}
          </Tag>
        );
      }
    },
    {
      title: 'Contact Info',
      key: 'contact',
      render: (_, record) => (
        <div className="flex flex-col gap-1 text-gray-600">
          <div className="flex items-center gap-2">
            <MailOutlined className="text-gray-400" />
            <span className="text-xs">{record.email || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <PhoneOutlined className="text-gray-400" />
            <span className="text-xs">{record.mobile?.number ? `${record.mobile?.country_code || ''} ${record.mobile?.number}` : 'N/A'}</span>
          </div>
        </div>
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const config = statusConfig[record.status] || { label: record.status || 'Pending', color: 'default', icon: <BellOutlined /> };
        return <Badge status={record.status === 'resolved' ? 'success' : (record.status === 'new' ? 'warning' : 'processing')} text={config.label} />;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Request Details">
            <Button
              shape="circle"
              icon={<EyeOutlined style={{ color: THEME.primary }} />}
              style={{ borderColor: THEME.primary }}
              onClick={() => {
                setSelectedLead(record);
                setDrawerVisible(true);
              }}
            />
          </Tooltip>

          {record.status === 'new' && (
            <Tooltip title="Mark as Resolved">
              <Button
                shape="circle"
                type="primary"
                ghost
                icon={<CheckCircleOutlined />}
                onClick={() => updateLeadStatus(record._id, 'resolved')}
              />
            </Tooltip>
          )}

          <Tooltip title="Delete">
            <Button shape="circle" danger icon={<DeleteOutlined />} onClick={() => softDelete(record._id)} />
          </Tooltip>
        </Space>
      )
    }
  ];

  const tabItems = [
    { key: 'all', label: (<span><UsergroupAddOutlined /> All Submissions</span>) },
    ...Object.keys(typeConfig).map(key => ({
      key,
      label: (<span>{typeConfig[key].icon} {typeConfig[key].label}</span>)
    }))
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* Header with Add Lead Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 m-0">Submit Leads Management</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="large"
          style={{ backgroundColor: THEME.primary }}
          onClick={() => setIsAddModalVisible(true)}
        >
          Add New Lead
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="mb-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.primary }}>
              <Statistic title="Total Submissions" value={stats.total} prefix={<UsergroupAddOutlined style={{ color: THEME.primary }} />} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.warning }}>
              <Statistic title="New & Pending" value={stats.new} prefix={<BellOutlined style={{ color: THEME.warning }} />} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.success }}>
              <Statistic title="Resolved" value={stats.resolved} prefix={<CheckCircleOutlined style={{ color: THEME.success }} />} />
            </Card>
          </Col>
        </Row>
      </div>

      <Card bordered={false} className="shadow-md rounded-lg" bodyStyle={{ padding: 0 }}>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          type="card"
          size="large"
          tabBarStyle={{ margin: 0, paddingLeft: 16, paddingTop: 16, background: '#fafafa' }}
        />

        <div className="p-0">
          <CustomTable
            columns={columns}
            data={leads}
            loading={loading}
            totalItems={pagination.totalItems}
            currentPage={pagination.currentPage}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={handlePageChange}
            onFilter={handleFilter}
          />
        </div>
      </Card>

      {/* View Lead Details Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <AppstoreAddOutlined style={{ color: THEME.primary }} />
            <span>Submission Details</span>
          </div>
        }
        placement="right"
        width={600}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        destroyOnClose
        bodyStyle={{ backgroundColor: '#f9fafb' }}
      >
        {selectedLead && (
          <div className="space-y-6">
            <Card bordered={false} className="shadow-sm">
              <div className="flex items-start gap-4">
                <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: THEME.primary }} />
                <div className="flex-1">
                  <h3 className="text-xl font-bold m-0 text-gray-800">{getFullName(selectedLead)}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Tag color={typeConfig[selectedLead.type]?.color} icon={typeConfig[selectedLead.type]?.icon}>
                      {typeConfig[selectedLead.type]?.label || 'General'}
                    </Tag>
                    <Tag color={statusConfig[selectedLead.status]?.color}>
                      {statusConfig[selectedLead.status]?.label || 'Pending'}
                    </Tag>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    Submitted On: {new Date(selectedLead.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Contact Information" size="small" bordered={false} className="shadow-sm">
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label={<span className="text-gray-500"><MailOutlined /> Email</span>}>
                  <a href={`mailto:${selectedLead.email}`} className="text-blue-600">{selectedLead.email || 'N/A'}</a>
                </Descriptions.Item>
                <Descriptions.Item label={<span className="text-gray-500"><PhoneOutlined /> Mobile</span>}>
                  <a href={`tel:${selectedLead.mobile?.country_code}${selectedLead.mobile?.number}`} className="text-blue-600">
                    {selectedLead.mobile?.country_code} {selectedLead.mobile?.number}
                  </a>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <div className="space-y-2">
              <div className="text-sm font-semibold text-gray-500 uppercase ml-1">Message / Request</div>
              <Descriptions bordered column={1} size="small" className="bg-white p-4 rounded border">
                <Descriptions.Item label="Subject">{selectedLead.subject || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Detailed Message">
                  {selectedLead.message || <Empty description="No message provided" />}
                </Descriptions.Item>
              </Descriptions>
            </div>

            {selectedLead.status !== 'resolved' && (
              <div className="mt-8 pt-4 border-t border-gray-200">
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<CheckCircleOutlined />}
                  style={{ backgroundColor: THEME.success, borderColor: THEME.success }}
                  onClick={() => {
                    updateLeadStatus(selectedLead._id, 'resolved');
                    setDrawerVisible(false);
                  }}
                >
                  Mark as Resolved
                </Button>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* --- ADD NEW LEAD MODAL --- */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <UsergroupAddOutlined style={{ color: THEME.primary }} />
            <span>Add New Referral Lead</span>
          </div>
        }
        open={isAddModalVisible}
        onCancel={() => {
          setIsAddModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={addLoading}
        onOk={() => form.submit()}
        okText="Submit Lead"
        okButtonProps={{ style: { backgroundColor: THEME.primary } }}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddLead}
          initialValues={{ countryCode: '+91' }}
          className="mt-4"
        >
          <Form.Item
            name="customerName"
            label="Customer Name"
            rules={[{ required: true, message: 'Please enter customer name' }]}
          >
            <Input placeholder="e.g. Amit" prefix={<UserOutlined className="text-gray-400" />} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="countryCode"
                label="Code"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Select>
                  <Select.Option value="+91">+91 (IND)</Select.Option>
                  <Select.Option value="+971">+971 (UAE)</Select.Option>
                  <Select.Option value="+1">+1 (USA)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="customerPhone"
                label="Phone Number"
                rules={[{ required: true, message: 'Please enter phone number' }]}
              >
                <Input placeholder="e.g. 9999999999" prefix={<PhoneOutlined className="text-gray-400" />} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="propertyType"
            label="Property Type"
            rules={[{ required: true, message: 'Please specify property type' }]}
          >
            <Select placeholder="Select Property Type">
              <Select.Option value="Apartment">Apartment</Select.Option>
              <Select.Option value="Villa">Villa</Select.Option>
              <Select.Option value="Townhouse">Townhouse</Select.Option>
              <Select.Option value="Commercial">Commercial</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="interestArea"
            label="Area of Interest"
            rules={[{ required: true, message: 'Please enter interest area' }]}
          >
            <Input placeholder="e.g. Dubai Marina" />
          </Form.Item>

          <Form.Item
            name="budget"
            label="Budget"
            rules={[{ required: true, message: 'Please enter budget' }]}
          >
            <InputNumber 
              style={{ width: '100%' }} 
              placeholder="e.g. 2000000"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
        </Form>
      </Modal>

    </div>
  );
};

export default SubmitLeads;