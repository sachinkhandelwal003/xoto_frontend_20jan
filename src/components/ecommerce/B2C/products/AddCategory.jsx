import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import {
  Button, Modal, Form, Input, Popconfirm, Card, Table,
  Typography, Avatar, Row, Col, Statistic, Space, Divider, message, notification, Tooltip, Switch, Tag
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined, EditOutlined, SearchOutlined, AppstoreOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Theme colors
const THEME = {
  primary: "#7c3aed", 
  success: "#10b981",
  error: "#ef4444",
};

const AddCategory = () => {
 
  // Base URL
  const BASE_URL = "https://xoto.ae/api/products"; 

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  const [form] = Form.useForm();

  // --- 1. GET ALL CATEGORIES ---
  const fetchCategories = async (page = 1, limit = 10, search = '') => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/get-all-category`, {
        params: { 
            page: page, 
            limit: limit, 
            search: search || undefined
        }
      });
      
      const resData = response.data;
      const rawList = resData?.data || resData || [];
      setCategories(rawList);

      const count = resData?.pagination?.total || resData?.total || rawList.length || 0;
      setTotal(count);
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
        fetchCategories(currentPage, pageSize, searchText);
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [currentPage, pageSize, searchText]);

  // --- 2. GET SINGLE CATEGORY ---
  const fetchCategoryById = async (id) => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/get-category-by-id`, {
        params: { id: id } 
      });
      const cat = response.data?.data || response.data;
      if (cat) {
        form.setFieldsValue({
          name: cat.name,
          description: cat.description,
          isActive: cat.isActive 
        });
        setEditingId(id);
        setModalVisible(true);
      }
    } catch (err) {
      message.error("Failed to fetch category details.");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. CREATE OR UPDATE CATEGORY (UPDATED) ---
  const handleSave = async (values) => {
    setLoading(true);
    try {
      // JSON Payload construction
      const payload = {
        name: values.name,
        description: values.description,
        isActive: values.isActive || false, 
      };

      let response;
      if (editingId) {
        // ✅ UPDATED: /edit-category-by-id endpoint use kiya hai
        response = await axios.post(`${BASE_URL}/edit-category-by-id`, payload, {
          params: { id: editingId } // Query param mein ID jayega
        });
      } else {
        // Create Logic
        response = await axios.post(`${BASE_URL}/create-category`, payload);
      }
      
      if (response.status === 200 || response.status === 201) {
        notification.success({
          message: editingId ? 'Category Updated' : 'Category Created',
          description: `Category "${values.name}" has been successfully saved.`,
          placement: 'topRight'
        });
        closeModal();
        fetchCategories(currentPage, pageSize);
      }
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to save category.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- 4. DELETE CATEGORY ---
  const deleteCategory = async (id) => {
    try {
      setLoading(true);
      const response = await axios.post(`${BASE_URL}/delete-category-by-id?id=${id}`); 

      if (response.status === 200 || response.status === 204) {
          message.success("Category deleted successfully.");
          fetchCategories(currentPage, pageSize, searchText);
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

  // Table Columns
  const columns = [
    {
      title: 'Category Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <Avatar size="small" icon={<AppstoreOutlined />} style={{ backgroundColor: THEME.primary }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true, 
      render: (text) => (
        <Text type="secondary" title={text}>
             {text || "No description"}
        </Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? THEME.success : THEME.error}>
          {isActive ? "ACTIVE" : "INACTIVE"}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined style={{ color: THEME.primary }} />} 
              onClick={() => fetchCategoryById(record._id || record.id)}
            />
          </Tooltip>
          
          <Popconfirm 
            title="Delete this category?" 
            onConfirm={() => deleteCategory(record._id || record.id)} 
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} style={{ margin: 0 }}>Category Management</Title>
          <Text type="secondary">Manage product categories for your store.</Text>
        </div>
        <Button 
          type="primary" 
          size="large" 
          icon={<PlusOutlined />} 
          onClick={() => {
              form.resetFields();
              form.setFieldsValue({ isActive: true }); 
              setModalVisible(true);
          }}
          style={{ backgroundColor: THEME.primary, borderColor: THEME.primary }}
        >
          Add New Category
        </Button>
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.primary }}>
            <Statistic 
              title="Total Categories" 
              value={total} 
              prefix={<AppstoreOutlined style={{ color: THEME.primary }} />} 
            />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} className="shadow-md" bodyStyle={{ padding: 0 }}>
        <div className="p-4 border-b bg-white rounded-t-lg">
          <Input 
            prefix={<SearchOutlined className="text-gray-400" />} 
            placeholder="Search categories..." 
            style={{ maxWidth: 400 }}
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
          dataSource={categories} 
          loading={loading}
          rowKey={(record) => record._id || record.id}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
        />
      </Card>

      <Modal
        title={<div className="font-bold text-lg">{editingId ? <EditOutlined /> : <PlusOutlined />} {editingId ? 'Edit Category' : 'Create Category'}</div>}
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        centered
        destroyOnClose
        width={500}
      >
        <Divider style={{ margin: '10px 0 25px 0' }} />
        
        <Form 
            form={form} 
            layout="vertical" 
            onFinish={handleSave} 
            initialValues={{ isActive: true }}
        >
          <Form.Item 
            name="name" 
            label="Category Name" 
            rules={[{ required: true, message: 'Please enter category name' }]}
          >
            <Input prefix={<AppstoreOutlined />} placeholder="e.g. ELECTRONICS" size="large" />
          </Form.Item>

          <Form.Item 
            name="description" 
            label="Description" 
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea 
                rows={4} 
                placeholder="e.g. All types of home and office furniture..." 
                maxLength={300}
                showCount
            />
          </Form.Item>

          <Form.Item 
            name="isActive" 
            label="Status" 
            valuePropName="checked" 
          >
            <Switch 
                checkedChildren="Active" 
                unCheckedChildren="Inactive" 
                defaultChecked 
            />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-6">
            <Button size="large" onClick={closeModal}>Cancel</Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              size="large"
              style={{ backgroundColor: THEME.primary, borderColor: THEME.primary }}
            >
              {editingId ? 'Update Category' : 'Create Category'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AddCategory;