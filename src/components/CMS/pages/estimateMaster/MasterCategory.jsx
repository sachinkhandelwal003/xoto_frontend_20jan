// components/CMS/pages/estimate/CategoryManager/MasterCategory.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card, Button, Space, Tag, Tooltip, Spin,
  Typography, Popconfirm, Input, Form, Modal, message,
  Row, Col, Statistic, Breadcrumb, Divider, Select, Switch,
  InputNumber
} from 'antd';
import {
  PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined,
  RestOutlined, ArrowLeftOutlined, FolderOutlined,
  FolderOpenOutlined, TagsOutlined, DatabaseOutlined, 
  SearchOutlined, ReloadOutlined, AppstoreOutlined,
  HomeOutlined
} from '@ant-design/icons';
import CustomTable from '../../../../components/CMS/pages/custom/CustomTable';
import { apiService } from '../../../../manageApi/utils/custom.apiservice';

const { Title, Text } = Typography;
const { TextArea } = Input;

// --- THEME CONFIGURATION ---
const THEME = {
  primary: "#722ed1", // Purple
  secondary: "#1890ff", // Blue
  success: "#52c41a",
  warning: "#faad14",
  error: "#ff4d4f",
  bgLight: "#f9f0ff",
  border: "#f0f0f0"
};

const API_BASE = '/estimate/master/category';

// --- HELPER FUNCTION FOR CAPITALIZATION ---
const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const MasterCategory = () => {
  // Navigation State
  const [level, setLevel] = useState('categories'); 
  const [parentCategory, setParentCategory] = useState(null);
  const [parentSubcategory, setParentSubcategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  // Data State
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTrash, setShowTrash] = useState(false);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
  });

  // Modal States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Stats Calculation
  const stats = useMemo(() => {
    return {
      total: pagination.totalItems,
      active: data.filter(d => d.isActive !== false && !d.is_deleted).length,
      trashed: data.filter(d => d.is_deleted || d.isActive === false).length
    };
  }, [data, pagination.totalItems]);

  // Fetch data based on current level
  const fetchData = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      let url = API_BASE;
      const params = { 
        page, 
        limit, 
        search: searchTerm || undefined,
        active: showTrash ? 'false' : undefined 
      };

      let response;
      if (level === 'subcategories') {
        url = `${API_BASE}/${parentCategory}/subcategories`;
        response = await apiService.get(url, params);
        setData(response.data || []);
      } else if (level === 'types') {
        url = `${API_BASE}/${parentCategory}/subcategories/${parentSubcategory}/types`;
        response = await apiService.get(url, params);
        setData(response.data || []);
      } else {
        response = await apiService.get(url, params);
        setData(response.categories || response.data || []);
      }

      setPagination({
        currentPage: response.pagination?.page || page,
        itemsPerPage: response.pagination?.limit || limit,
        totalItems: response.pagination?.total || response.data?.length || response.categories?.length || 0,
      });
    } catch (err) {
      message.error('Failed to load data');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [level, parentCategory, parentSubcategory, searchTerm, showTrash]);

  useEffect(() => {
    fetchData(pagination.currentPage, pagination.itemsPerPage);
  }, [fetchData]);

  // Reset page when level changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [level, parentCategory, parentSubcategory]);

  const handleEditClick = (record) => {
    setSelectedItem(record);
    setEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      let url = `${API_BASE}/${id}`;
      if (level === 'subcategories') url = `${API_BASE}/${parentCategory}/subcategories/${id}`;
      if (level === 'types') url = `${API_BASE}/${parentCategory}/subcategories/${parentSubcategory}/types/${id}`;

      await apiService.delete(url);
      message.success('Deactivated successfully');
      fetchData();
    } catch (err) {
      message.error('Operation failed');
    }
  };

  const goToSubcategories = (category) => {
    setParentCategory(category._id);
    setSelectedCategory(category);
    setLevel('subcategories');
  };

  const goToTypes = (subcategory) => {
    setParentSubcategory(subcategory._id);
    setSelectedSubcategory(subcategory);
    setLevel('types');
  };

  const goBack = () => {
    if (level === 'types') {
      setLevel('subcategories');
      setParentSubcategory(null);
      setSelectedSubcategory(null);
    } else if (level === 'subcategories') {
      setLevel('categories');
      setParentCategory(null);
      setSelectedCategory(null);
    }
  };

  const columns = useMemo(() => {
    const cols = [
      {
        title: level === 'categories' ? 'Category Name' : level === 'subcategories' ? 'Subcategory' : 'Type',
        key: 'name',
        width: 350,
        render: (_, record) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '38px', height: '38px', borderRadius: '8px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: THEME.bgLight 
            }}>
                {level === 'categories' && <FolderOutlined style={{ fontSize: '18px', color: THEME.primary }} />}
                {level === 'subcategories' && <FolderOpenOutlined style={{ fontSize: '18px', color: THEME.secondary }} />}
                {level === 'types' && <TagsOutlined style={{ fontSize: '18px', color: THEME.warning }} />}
            </div>
            <div>
              {/* Added Capitalization for Display */}
              <div style={{ fontWeight: 600, color: '#262626' }}>
                {capitalizeFirstLetter(record.name || record.label)}
              </div>
              {record.description && (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {capitalizeFirstLetter(record.description)}
                </Text>
              )}
            </div>
          </div>
        ),
      },
      {
        title: 'Status',
        key: 'status',
        width: 120,
        render: (_, record) => (
          <Tag color={record.isActive !== false ? 'green' : 'orange'} style={{ borderRadius: '10px' }}>
            {record.isActive !== false ? 'Active' : 'Inactive'}
          </Tag>
        ),
      },
      {
        title: 'Action',
        key: 'action',
        width: 220,
        align: 'right',
        render: (_, record) => (
          <Space size="small">
            {level !== 'types' && (
              <Button size="small" type="primary" ghost onClick={() => level === 'categories' ? goToSubcategories(record) : goToTypes(record)}>
                Open
              </Button>
            )}
            <Tooltip title="Edit">
              <Button size="small" icon={<EditOutlined />} onClick={() => handleEditClick(record)} />
            </Tooltip>
            <Tooltip title="Details">
              <Button size="small" icon={<EyeOutlined />} onClick={() => { setSelectedItem(record); setDetailsOpen(true); }} />
            </Tooltip>
            <Popconfirm title="Deactivate this item?" onConfirm={() => handleDelete(record._id)}>
               <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
      },
    ];
    return cols;
  }, [level]);

  // --- CREATE MODAL ---
  const CreateModal = () => {
    const [form] = Form.useForm();
    const [saving, setSaving] = useState(false);

    const onSubmit = async (values) => {
      setSaving(true);
      try {
        let url = API_BASE;
        let payload = values;

        if (level === 'subcategories') url = `${API_BASE}/${parentCategory}/subcategories`;
        if (level === 'types') url = `${API_BASE}/${parentCategory}/subcategories/${parentSubcategory}/types`;

        await apiService.post(url, payload);
        message.success('Created successfully!');
        setCreateModalOpen(false);
        form.resetFields();
        fetchData(1);
      } catch (err) { message.error('Create failed'); } 
      finally { setSaving(false); }
    };

    return (
      <Modal title={`Add New ${level.slice(0, -1)}`} open={createModalOpen} onCancel={() => setCreateModalOpen(false)} footer={null} centered destroyOnClose>
        <Form form={form} layout="vertical" onFinish={onSubmit} style={{ marginTop: '16px' }}>
          {level === 'categories' ? (
            <Form.Item 
                name="name" 
                label="Category Type" 
                rules={[{ required: true }]}
                normalize={(value) => capitalizeFirstLetter(value)} // Capitalize on input
            >
              <Input />
            </Form.Item>
          ) : (
            <Form.Item 
                name="label" 
                label="Name" 
                rules={[{ required: true }]}
                normalize={(value) => capitalizeFirstLetter(value)} // Capitalize on input
            >
              <Input />
            </Form.Item>
          )}

          {level === 'types' && (
            <Form.Item
              name="baseRatePerSqFt"
              label="Base Rate per Sq. Ft"
              rules={[{ required: true }]}
              extra="For example, if the minimum total charge is $1000 for 100 sq. ft, enter 10 ($/sq. ft)."
            >
              <InputNumber style={{ width: '100%' }} placeholder="Enter rate" />
            </Form.Item>
          )}

          <Form.Item 
            name="description" 
            label="Description"
            normalize={(value) => capitalizeFirstLetter(value)} // Capitalize Description too
          >
            <TextArea rows={3} />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'end', gap: '8px' }}>
            <Button onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving} style={{ background: THEME.primary }}>
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>
    );
  };

  // --- EDIT MODAL (UPDATED) ---
 const EditModal = () => {
    const [form] = Form.useForm();
    const [saving, setSaving] = useState(false);

    useEffect(() => {
      if (selectedItem) {
        form.setFieldsValue({
          name: selectedItem.name,
          label: selectedItem.label,
          description: selectedItem.description,
          isActive: selectedItem.isActive !== false,
          order: selectedItem.order || 0,
          baseEstimationValueUnit: selectedItem.baseEstimationValueUnit ?? 0
        });
      }
    }, [selectedItem, form]);

    const onUpdate = async (values) => {
      setSaving(true);
      try {
        let url = `${API_BASE}/${selectedItem._id}`; // Default for Root Category

        if (level === 'subcategories') {
            const catId = selectedItem.category?._id || selectedItem.category || parentCategory;
            url = `${API_BASE}/${catId}/subcategories/${selectedItem._id}`;
        }
        
        if (level === 'types') {
            const catId = selectedItem.category?._id || selectedItem.category || parentCategory;
            const subCatId = selectedItem.subcategory?._id || selectedItem.subcategory || parentSubcategory;
            url = `${API_BASE}/${catId}/subcategories/${subCatId}/types/${selectedItem._id}`;
        }

        await apiService.put(url, values);
        message.success('Updated successfully!');
        setEditModalOpen(false);
        fetchData();
      } catch (err) { 
        console.error("Update Error:", err);
        message.error('Update failed'); 
      } 
      finally { setSaving(false); }
    };

    return (
      <Modal 
        title={`Edit ${level.slice(0, -1)}`} 
        open={editModalOpen} 
        onCancel={() => setEditModalOpen(false)} 
        footer={null} 
        centered 
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onUpdate} style={{ marginTop: '16px' }}>
          
          {level === 'categories' ? (
            <Form.Item 
                name="name" 
                label="Category Type" 
                rules={[{ required: true }]}
                normalize={(value) => capitalizeFirstLetter(value)} // Capitalize on Edit
            >
              <Input />
            </Form.Item>
          ) : (
            <Form.Item 
                name="label" 
                label="Name" 
                rules={[{ required: true }]}
                normalize={(value) => capitalizeFirstLetter(value)} // Capitalize on Edit
            >
              <Input />
            </Form.Item>
          )}
          
          <Form.Item 
            name="description" 
            label="Description"
            normalize={(value) => capitalizeFirstLetter(value)}
          >
            <TextArea rows={3} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item 
                name="baseEstimationValueUnit" 
                label="Base Unit"
              >
                 <InputNumber style={{ width: '100%' }} placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="order" label="Sort Order">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="isActive" label="Status" valuePropName="checked">
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ display: 'flex', justifyContent: 'end', gap: '8px', marginTop: '10px' }}>
            <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving} style={{ background: THEME.primary }}>
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>
    );
  };

  return (
    <div style={{ padding: '24px', background: '#f5f7fa', minHeight: '100vh' }}>
      {/* Header & Breadcrumb */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Space direction="vertical" size={4}>
          <Title level={3} style={{ margin: 0 }}>Category Architecture</Title>
          <Breadcrumb separator=">">
            <Breadcrumb.Item onClick={() => { setLevel('categories'); setParentCategory(null); setSelectedCategory(null); }} style={{ cursor: 'pointer' }}><HomeOutlined /> Root</Breadcrumb.Item>
            {selectedCategory && <Breadcrumb.Item onClick={() => { setLevel('subcategories'); setParentSubcategory(null); }} style={{ cursor: 'pointer' }}>{capitalizeFirstLetter(selectedCategory.name)}</Breadcrumb.Item>}
            {selectedSubcategory && <Breadcrumb.Item>{capitalizeFirstLetter(selectedSubcategory.label)}</Breadcrumb.Item>}
          </Breadcrumb>
        </Space>
        <Space>
            {level !== 'categories' && <Button icon={<ArrowLeftOutlined />} onClick={goBack}>Back</Button>}
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)} style={{ background: THEME.primary, height: '40px', borderRadius: '8px' }}>Add {level.slice(0,-1)}</Button>
        </Space>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {[{ t: 'Total', v: stats.total, c: THEME.primary, i: <AppstoreOutlined /> }, { t: 'Active', v: stats.active, c: THEME.success, i: <DatabaseOutlined /> }, { t: 'Trash/Inactive', v: stats.trashed, c: THEME.error, i: <RestOutlined /> }].map((s, idx) => (
          <Col xs={24} sm={8} key={idx}>
            <Card bordered={false} style={{ borderRadius: '12px', borderBottom: `3px solid ${s.c}` }}>
              <Statistic title={s.t} value={s.v} prefix={s.i} valueStyle={{ color: '#262626' }} />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Table Card */}
      <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }} bodyStyle={{ padding: 0 }}>
        <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Input prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} placeholder="Search entries..." style={{ width: 320, borderRadius: '8px' }} onChange={e => setSearchTerm(e.target.value)} allowClear />
          <Space>
            <Button type={showTrash ? 'primary' : 'default'} danger={showTrash} icon={<RestOutlined />} onClick={() => setShowTrash(!showTrash)}>{showTrash ? 'Hide Trash' : 'View Trash'}</Button>
            <Button icon={<ReloadOutlined />} onClick={() => fetchData()} />
          </Space>
        </div>
        <CustomTable columns={columns} data={data} loading={loading} totalItems={pagination.totalItems} currentPage={pagination.currentPage} onPageChange={fetchData} />
      </Card>

      <CreateModal key={level} />
      <EditModal />

      {/* Details View */}
      <Modal title="Detailed View" open={detailsOpen} onCancel={() => setDetailsOpen(false)} footer={<Button onClick={() => setDetailsOpen(false)}>Close</Button>} centered>
        {selectedItem && (
          <div style={{ padding: '8px 0' }}>
            <p><Text type="secondary">ID:</Text> <br /> <Text strong>{selectedItem._id}</Text></p>
            <p><Text type="secondary">Display Name:</Text> <br /> <Text strong>{capitalizeFirstLetter(selectedItem.name || selectedItem.label)}</Text></p>
            <p><Text type="secondary">Description:</Text> <br /> <Text>{capitalizeFirstLetter(selectedItem.description) || 'N/A'}</Text></p>
            <p><Text type="secondary">Current Level:</Text> <br /> <Tag color="purple">{level.toUpperCase()}</Tag></p>
            {/* Display Base Unit in Details if available - Checks both keys */}
            {(selectedItem.base_unit || selectedItem.baseRatePerSqFt) !== undefined && (
                 <p><Text type="secondary">Base Unit:</Text> <br /> <Text strong>{selectedItem.baseRatePerSqFt ?? selectedItem.base_unit}</Text></p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MasterCategory;