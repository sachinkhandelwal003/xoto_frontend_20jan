
import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import {
  Button, Modal, Form, Input, Popconfirm, Card, Table,
  Typography, Avatar, Row, Col, Statistic, Space, Divider, 
  message, notification, Upload, Switch, Tag
} from 'antd';
import {
  PlusOutlined, ShopOutlined, LinkOutlined,
  DeleteOutlined, EditOutlined, SearchOutlined, GlobalOutlined, 
  PictureOutlined, CheckOutlined, CloseOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

// --- CONFIGURATION ---
const THEME = {
  primary: "#7c3aed", 
};

const API_BASE = "https://xoto.ae/api"; 
const URL_PRODUCTS = `${API_BASE}/products`;
const URL_UPLOAD = `${API_BASE}/upload`;

// --- HELPER: Base64 for Preview ---
const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const CreateBrand = () => {
  // --- STATE ---
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Pagination
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  
  // Modal & Form
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  const [form] = Form.useForm();

  // Image Upload State
  const [fileList, setFileList] = useState([]); 
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  // --- 1. FETCH BRANDS ---
  const fetchBrands = async (page = 1, limit = 10, search = '') => {
    setLoading(true);
    try {
      const response = await axios.get(`${URL_PRODUCTS}/get-all-brand`, {
        params: { page, limit, search: search || undefined }
      });
      const resData = response.data;
      if (resData.success) {
        setBrands(resData.data || []);
        setTotal(resData.pagination?.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
        fetchBrands(currentPage, pageSize, searchText);
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [currentPage, pageSize, searchText]);

  // --- 2. FETCH SINGLE BRAND (EDIT) ---
  const fetchBrandById = async (id) => {
    setLoading(true);
    try {
      const response = await axios.get(`${URL_PRODUCTS}/get-brand-by-id`, {
        params: { id }
      });
      const resData = response.data;

      if (resData.success && resData.data) {
        const brand = resData.data;
        form.setFieldsValue({
          brandName: brand.brandName,
          websiteUrl: brand.websiteUrl,
          country: brand.country,
          description: brand.description,
          isActive: brand.isActive, // Set Status
        });

        if (brand.photo) {
          setFileList([{
            uid: '-1',
            name: 'current-logo.png',
            status: 'done',
            url: brand.photo,
          }]);
        } else {
          setFileList([]);
        }
        setEditingId(brand._id);
        setModalVisible(true);
      } else {
        message.warning("Brand details not found.");
      }
    } catch (err) {
      message.error("Failed to fetch details.");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. UPLOAD HANDLERS ---
  const handleCancelPreview = () => setPreviewOpen(false);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
  };

  const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);

  // --- UPLOAD LOGIC ---
  const uploadImageFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file); // Sending as 'file'

    try {
      const res = await axios.post(URL_UPLOAD, formData);
      if (res.data?.file?.url) {
        return res.data.file.url;
      }
      return res.data?.url || res.data?.data; 
    } catch (error) {
      console.error("UPLOAD ERROR:", error.response);
      const serverMsg = error.response?.data?.message || "Upload failed";
      throw new Error(serverMsg);
    }
  };

  // --- 4. SAVE HANDLER (Create/Edit) ---
  const handleSave = async (values) => {
    setSaving(true);
    try {
      let finalPhotoUrl = "";
      const hasNewFile = fileList.length > 0 && fileList[0].originFileObj;
      const hasExistingUrl = fileList.length > 0 && !fileList[0].originFileObj && fileList[0].url;

      if (hasNewFile) {
        finalPhotoUrl = await uploadImageFile(fileList[0].originFileObj);
        if (!finalPhotoUrl) throw new Error("Server returned invalid image URL.");
      } else if (hasExistingUrl) {
        finalPhotoUrl = fileList[0].url;
      }

      const payload = {
        brandName: values.brandName,
        websiteUrl: values.websiteUrl,
        country: values.country,
        description: values.description,
        isActive: values.isActive, // Send Active Status
        photo: finalPhotoUrl, 
      };

      let response;
      if (editingId) {
        response = await axios.post(`${URL_PRODUCTS}/edit-brand-by-id?id=${editingId}`, payload);
      } else {
        response = await axios.post(`${URL_PRODUCTS}/create-brand`, payload);
      }
      
      if (response.data?.success) {
        notification.success({
          message: 'Success',
          description: `Brand saved successfully.`,
          placement: 'topRight'
        });
        closeModal();
        fetchBrands(currentPage, pageSize);
      } else {
        message.error(response.data?.message || "Operation failed.");
      }
    } catch (err) {
      console.error(err);
      message.error(err.message || "Failed to save brand.");
    } finally {
      setSaving(false);
    }
  };

  // --- 5. DELETE HANDLER ---
  const deleteBrand = async (id) => {
    try {
      setLoading(true);
      const response = await axios.post(`${URL_PRODUCTS}/delete-brand-by-id?id=${id}`); 
      if (response.data?.success) {
          message.success("Brand deleted successfully.");
          fetchBrands(currentPage, pageSize, searchText);
      } else {
          message.error("Delete failed.");
      }
    } catch (err) {
      message.error("Deletion failed.");
    } finally {
      setLoading(false);
    }
  };

  // --- UTILS ---
  const closeModal = () => {
    setModalVisible(false);
    setEditingId(null);
    setFileList([]);
    form.resetFields();
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  // --- TABLE COLUMNS ---
  const columns = [
    {
      title: 'Logo',
      dataIndex: 'photo',
      key: 'photo',
      width: 100,
      align: 'center',
      render: (photo) => (
        <div className="border rounded bg-white flex justify-center items-center shadow-sm mx-auto" style={{ width: '60px', height: '60px', padding: '2px' }}>
           {photo && typeof photo === 'string' && photo.startsWith('http') ? (
            <img src={photo} alt="Brand" style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
            />
           ) : null}
           <div style={{ display: (photo && typeof photo === 'string' && photo.startsWith('http')) ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ccc', width: '100%', height: '100%' }}>
              <ShopOutlined style={{ fontSize: '20px' }} />
           </div>
        </div>
      ),
    },
    {
      title: 'Brand Info',
      dataIndex: 'brandName',
      key: 'brandName',
      render: (text, record) => (
        <div>
          <Text strong className="text-base">{text}</Text>
          <div className="mt-1">
            <Space size="small">
                <Text type="secondary" className="text-xs">
                    <GlobalOutlined /> {record.country || 'Unknown'}
                </Text>
            </Space>
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'error'} icon={isActive ? <CheckOutlined /> : <CloseOutlined />}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    {
      title: 'Website',
      dataIndex: 'websiteUrl',
      key: 'websiteUrl',
      responsive: ['md'], // Hide on small mobile
      render: (url) => url ? <a href={url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline"><LinkOutlined /> Visit</a> : <Text disabled>-</Text>,
    },
    {
      title: 'Action',
      key: 'actions',
      align: 'right',
      width: 100,
      render: (_, record) => (
        <Space size="small">
          <Button type="text" icon={<EditOutlined className="text-blue-600" />} onClick={() => fetchBrandById(record._id)} />
          <Popconfirm title="Delete?" onConfirm={() => deleteBrand(record._id)} okText="Yes" cancelText="No" okButtonProps={{ danger: true }}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* HEADER SECTION - RESPONSIVE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <Title level={3} style={{ margin: 0 }}>Brand Management</Title>
          <Text type="secondary">Manage your product brands and partners.</Text>
        </div>
        <Button 
          type="primary" 
          size="large" 
          icon={<PlusOutlined />} 
          onClick={() => { setEditingId(null); form.resetFields(); form.setFieldsValue({ isActive: true }); setModalVisible(true); }}
          style={{ backgroundColor: THEME.primary, borderColor: THEME.primary }}
          className="w-full md:w-auto"
        >
          Add New Brand
        </Button>
      </div>

      {/* STATS SECTION */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.primary }}>
            <Statistic 
              title="Total Brands" 
              value={total} 
              prefix={<ShopOutlined style={{ color: THEME.primary }} />} 
            />
          </Card>
        </Col>
      </Row>

      {/* TABLE SECTION - RESPONSIVE SCROLL */}
      <Card bordered={false} className="shadow-md" bodyStyle={{ padding: 0 }}>
        <div className="p-4 border-b bg-white rounded-t-lg">
          <Input 
            prefix={<SearchOutlined className="text-gray-400" />} 
            placeholder="Search brand name..." 
            className="w-full md:max-w-md"
            onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
            allowClear
            size="large"
          />
        </div>

        <Table 
          columns={columns} 
          dataSource={brands} 
          loading={loading}
          rowKey="_id"
          scroll={{ x: 800 }} // Enables horizontal scroll on mobile
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            onChange: (p, s) => { setCurrentPage(p); setPageSize(s); }
          }}
        />
      </Card>

      {/* CREATE / EDIT MODAL */}
      <Modal
        title={<div className="font-bold text-lg">{editingId ? 'Edit Brand' : 'Create New Brand'}</div>}
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        centered
        destroyOnClose
        width={600}
      >
        <Divider style={{ margin: '10px 0 25px 0' }} />
        <Form form={form} layout="vertical" onFinish={handleSave} initialValues={{ isActive: true }}>
          
          <Row gutter={16}>
             <Col xs={24} sm={18}>
                <Form.Item name="brandName" label="Brand Name" rules={[{ required: true }]}>
                  <Input prefix={<ShopOutlined />} placeholder="e.g. XOTO Living" size="large" />
                </Form.Item>
             </Col>
             <Col xs={24} sm={6}>
                {/* ACTIVE STATUS SWITCH */}
                <Form.Item name="isActive" label="Status" valuePropName="checked">
                   <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                </Form.Item>
             </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="country" label="Country" rules={[{ required: true }]}>
                <Input prefix={<GlobalOutlined />} placeholder="e.g. UAE" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="websiteUrl" label="Website URL">
                <Input prefix={<LinkOutlined />} placeholder="https://..." size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Brand Logo" required tooltip="Accepts JPG/PNG files">
             <Upload
                listType="picture-card"
                fileList={fileList}
                onPreview={handlePreview}
                onChange={handleChange}
                beforeUpload={() => false} 
                maxCount={1}
                accept="image/*"
             >
                {fileList.length >= 1 ? null : uploadButton}
             </Upload>
          </Form.Item>

          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <TextArea rows={4} placeholder="Short description..." showCount maxLength={300} />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-6">
            <Button size="large" onClick={closeModal}>Cancel</Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={saving} 
              size="large"
              style={{ backgroundColor: THEME.primary, borderColor: THEME.primary }}
            >
              {editingId ? 'Update Brand' : 'Create Brand'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* PREVIEW MODAL */}
      <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancelPreview}>
        <img alt="example" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  );
};

export default CreateBrand;