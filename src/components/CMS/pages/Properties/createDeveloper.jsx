import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import {
  Button, Modal, Form, Input, Popconfirm, Card, Table,
  Typography, Avatar, Row, Col, Statistic, Space, Divider, message, notification, Tooltip, Grid, Switch
} from 'antd';
import {
  PlusOutlined, UserOutlined, MailOutlined, PhoneOutlined,
  DeleteOutlined, EditOutlined, SearchOutlined, UsergroupAddOutlined, GlobalOutlined, 
  CheckOutlined, CloseOutlined, LockOutlined, HomeOutlined, EnvironmentOutlined, LinkOutlined, FileTextOutlined, NumberOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
const { TextArea } = Input;

const THEME = {
  primary: "#7c3aed", 
  success: "#10b981",
  error: "#ef4444",
};

const CreateDeveloper = () => {
  const BASE_URL = "https://xoto.ae/api/property"; 
  
  const screens = useBreakpoint();

  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  const [form] = Form.useForm();

  // --- 1. GET ALL DEVELOPERS ---
  const fetchDevelopers = async (page = 1, limit = 10, search = '') => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/get-all-developers`, {
        params: { page, limit, search: search || undefined }
      });
      
      const resData = response.data;
      const rawList = resData?.data || resData || [];
      setDevelopers(rawList);

      const count = resData?.pagination?.total || resData?.total || rawList.length || 0;
      setTotal(count);
      
    } catch (err) {
      message.error("Failed to load developers list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
        fetchDevelopers(currentPage, pageSize, searchText);
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [currentPage, pageSize, searchText]);

  // --- 2. GET SINGLE DEVELOPER BY ID ---
  const fetchDeveloperById = async (id) => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/get-developer-by-id`, {
        params: { id }
      });
      const dev = response.data?.data || response.data;
      if (dev) {
        // Updated to set ALL fields
        form.setFieldsValue({
          name: dev.name,
          email: dev.email,
          phone_number: dev.phone_number,
          country_code: dev.country_code || '+91',
          password: dev.password,
          description: dev.description,
          websiteUrl: dev.websiteUrl,
          country: dev.country,
          city: dev.city,
          address: dev.address,
          reraNumber: dev.reraNumber,
          logo: dev.logo
        });
        setEditingId(id);
        setModalVisible(true);
      }
    } catch (err) {
      message.error("Failed to fetch developer details.");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. CREATE OR UPDATE ---
  const handleSave = async (values) => {
    setLoading(true);
    try {
      // Create payload with ALL fields
      const payload = {
        name: values.name,
        email: values.email,
        phone_number: values.phone_number,
        country_code: values.country_code,
        password: values.password,
        description: values.description || "",
        websiteUrl: values.websiteUrl || "",
        country: values.country || "",
        city: values.city || "",
        address: values.address || "",
        reraNumber: values.reraNumber || "",
        logo: values.logo || "",
        // Note: isVerifiedByAdmin is NOT updated here, only via toggle
      };

      let response;
      if (editingId) {
        response = await axios.post(`${BASE_URL}/edit-developer`, payload, {
          params: { id: editingId }
        });
      } else {
        // Default verified status for new ones can be handled by backend or added here if needed
        response = await axios.post(`${BASE_URL}/create-developer`, payload);
      }
      
      if (response.status === 200 || response.status === 201) {
        notification.success({
          message: editingId ? 'Developer Updated' : 'Developer Created',
          description: `Developer ${values.name} has been successfully ${editingId ? 'updated' : 'registered'}.`,
          placement: 'topRight'
        });
        closeModal();
        fetchDevelopers(currentPage, pageSize);
      }
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to save developer details.");
    } finally {
      setLoading(false);
    }
  };

  // --- 4. QUICK STATUS TOGGLE (From Table Only) ---
  const handleStatusToggle = async (record, checked) => {
    setActionLoading(record._id || record.id);
    try {
      // Re-sending necessary fields plus the new status
      const payload = {
        ...record, // Spread existing record data
        isVerifiedByAdmin: checked
      };
      // Remove _id from payload if it exists inside record to avoid duplication conflicts
      delete payload._id; 

      await axios.post(`${BASE_URL}/edit-developer`, payload, {
        params: { id: record._id || record.id }
      });
      
      message.success(`Developer ${checked ? 'Verified' : 'Unverified'} successfully`);
      fetchDevelopers(currentPage, pageSize, searchText);
    } catch (err) {
      message.error("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  // --- 5. DELETE ---
  const deleteDeveloper = async (id) => {
    try {
      setLoading(true);
      const response = await axios.post(`${BASE_URL}/delete-developer-by-id?id=${id}`); 

      if (response.status === 200 || response.status === 204) {
          message.success("Developer deleted successfully.");
          fetchDevelopers(currentPage, pageSize, searchText);
      }
    } catch (err) {
      message.error(err.response?.data?.message || "Deletion failed.");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingId(null);
    form.resetFields();
  };

  const columns = [
    {
      title: 'Developer Name',
      dataIndex: 'name',
      key: 'name',
      fixed: screens.md ? 'left' : false, 
      width: 200,
      render: (text, record) => (
        <Space>
          <Avatar size="small" src={record.logo} icon={<UserOutlined />} style={{ backgroundColor: record.isVerifiedByAdmin ? THEME.success : THEME.primary }} />
          <div>
            <Text strong>{text}</Text>
            {record.isVerifiedByAdmin && (
               <div className="text-[10px] text-green-600 leading-none">Verified</div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 220,
      render: (email) => (
        <Text type="secondary"><MailOutlined /> {email}</Text>
      ),
    },
    {
      title: 'Location',
      key: 'location',
      width: 180,
      render: (_, record) => (
         <div className="flex flex-col text-xs text-gray-500">
             <span>{record.city}, {record.country}</span>
             <span className="truncate max-w-[150px]">{record.address}</span>
         </div>
      ),
    },
    // --- STATUS TOGGLE IS HERE ONLY ---
    {
      title: 'Verified',
      dataIndex: 'isVerifiedByAdmin',
      key: 'isVerifiedByAdmin',
      width: 100,
      align: 'center',
      render: (checked, record) => (
        <Switch 
          checked={checked}
          loading={actionLoading === (record._id || record.id)}
          onChange={(val) => handleStatusToggle(record, val)}
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
          style={{ backgroundColor: checked ? THEME.success : undefined }}
        />
      ),
    },
    {
      title: 'Action',
      key: 'actions',
      align: 'center',
      fixed: screens.md ? 'right' : false,
      width: 100,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined style={{ color: THEME.primary }} />} 
              onClick={() => fetchDeveloperById(record._id || record.id)}
            />
          </Tooltip>
          
          <Popconfirm 
            title="Are you sure you want to delete?" 
            onConfirm={() => deleteDeveloper(record._id || record.id)} 
            okText="Yes, Delete" 
            cancelText="No"
            okButtonProps={{ danger: true, loading: loading }}
          >
            <Tooltip title="Delete">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <Title level={3} style={{ margin: 0 }}>Developer Management</Title>
          <Text type="secondary">Manage your real estate developers professionally.</Text>
        </div>
        <Button 
          type="primary" 
          size="large" 
          icon={<PlusOutlined />} 
          onClick={() => {
              setEditingId(null);
              form.resetFields();
              setModalVisible(true);
          }}
          style={{ backgroundColor: THEME.primary, borderColor: THEME.primary }}
          className="w-full md:w-auto"
        >
          Add New Developer
        </Button>
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.primary }}>
            <Statistic 
              title="Total Developers" 
              value={total} 
              prefix={<UsergroupAddOutlined style={{ color: THEME.primary }} />} 
            />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} className="shadow-md" bodyStyle={{ padding: 0 }}>
        <div className="p-4 border-b bg-white rounded-t-lg">
          <Input 
            prefix={<SearchOutlined className="text-gray-400" />} 
            placeholder="Search by name or email..." 
            className="w-full md:w-[400px]"
            onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(1);
            }}
            allowClear
            size="large"
          />
        </div>

        <Table 
          columns={columns} 
          dataSource={developers} 
          loading={loading && !actionLoading}
          rowKey={(record) => record._id || record.id}
          scroll={{ x: 1000 }} 
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
            position: ['bottomRight']
          }}
        />
      </Card>

      <Modal
        title={<div className="font-bold text-lg">{editingId ? <EditOutlined /> : <PlusOutlined />} {editingId ? 'Edit Developer' : 'Register New Developer'}</div>}
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        centered
        destroyOnClose
        width={screens.xs ? '95%' : 700} // Increased width for more fields
      >
        <Divider style={{ margin: '10px 0 25px 0' }} />
        <Form 
            form={form} 
            layout="vertical" 
            onFinish={handleSave} 
            initialValues={{ country_code: '+91' }}
        >
          {/* SECTION 1: ACCOUNT DETAILS */}
          <Text strong className="text-gray-500 block mb-3 uppercase text-xs">Account Details</Text>
          <Row gutter={16}>
             <Col xs={24} md={12}>
                <Form.Item name="name" label="Developer Name" rules={[{ required: true, message: 'Required' }]}>
                    <Input prefix={<UserOutlined />} placeholder="e.g. John Doe" />
                </Form.Item>
             </Col>
             <Col xs={24} md={12}>
                <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email', message: 'Invalid email' }]}>
                    <Input prefix={<MailOutlined />} placeholder="email@example.com" />
                </Form.Item>
             </Col>
             <Col xs={24} md={12}>
                <Form.Item name="password" label="Password" rules={[{ required: !editingId, message: 'Password is required' }]}>
                    <Input.Password prefix={<LockOutlined />} placeholder="Enter password" />
                </Form.Item>
             </Col>
             <Col xs={24} md={12}>
                <Form.Item name="reraNumber" label="RERA Number">
                    <Input prefix={<NumberOutlined />} placeholder="e.g. RERA123456" />
                </Form.Item>
             </Col>
          </Row>

          <Divider style={{ margin: '10px 0 20px 0' }} />

          {/* SECTION 2: CONTACT & LOCATION */}
          <Text strong className="text-gray-500 block mb-3 uppercase text-xs">Contact & Location</Text>
          <Row gutter={16}>
            <Col xs={8} md={6}>
              <Form.Item name="country_code" label="Code">
                <Input prefix={<GlobalOutlined />} readOnly style={{ backgroundColor: '#f5f5f5' }} />
              </Form.Item>
            </Col>
            <Col xs={16} md={18}>
              <Form.Item name="phone_number" label="Phone Number" rules={[{ required: true }]}>
                <Input prefix={<PhoneOutlined />} placeholder="9876543210" maxLength={15} />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
                <Form.Item name="country" label="Country">
                    <Input prefix={<GlobalOutlined />} placeholder="UAE" />
                </Form.Item>
            </Col>
            <Col xs={24} md={12}>
                <Form.Item name="city" label="City">
                    <Input prefix={<EnvironmentOutlined />} placeholder="Los Angeles" />
                </Form.Item>
            </Col>
            <Col span={24}>
                <Form.Item name="address" label="Address">
                    <Input prefix={<HomeOutlined />} placeholder="Business Bay, Dubai" />
                </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '10px 0 20px 0' }} />

          {/* SECTION 3: ADDITIONAL INFO */}
          <Text strong className="text-gray-500 block mb-3 uppercase text-xs">Additional Info</Text>
          <Row gutter={16}>
            <Col span={24}>
                <Form.Item name="websiteUrl" label="Website URL">
                    <Input prefix={<LinkOutlined />} placeholder="https://example.com" />
                </Form.Item>
            </Col>
            <Col span={24}>
                <Form.Item name="logo" label="Logo URL">
                    <Input prefix={<FileTextOutlined />} placeholder="https://image-url.com/logo.png" />
                </Form.Item>
            </Col>
            <Col span={24}>
                <Form.Item name="description" label="Description">
                    <TextArea rows={3} placeholder="About the developer..." />
                </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-3 mt-4">
            <Button size="large" onClick={closeModal}>Cancel</Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              size="large"
              style={{ backgroundColor: THEME.primary, borderColor: THEME.primary }}
            >
              {editingId ? 'Update' : 'Save'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default CreateDeveloper;