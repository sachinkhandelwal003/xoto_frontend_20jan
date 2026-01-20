import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import {
  Button, Modal, Form, Input, Popconfirm, Card, Table,
  Typography, Avatar, Row, Col, Statistic, Space, Divider, 
  message, notification, Tooltip, Grid, Tag, Select, Badge, Upload
} from 'antd';
import {
  PlusOutlined, FileTextOutlined, ReadOutlined, DeleteOutlined, 
  EditOutlined, SearchOutlined, CheckCircleOutlined, SyncOutlined, 
  GlobalOutlined, UserOutlined, TagsOutlined, FilePdfOutlined,
  PictureOutlined, InfoCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { useBreakpoint } = Grid;

const THEME = {
  primary: "#7c3aed", 
  success: "#10b981",
  error: "#ef4444",
};

// --- API CONFIGURATION ---
const API_BASE = "https://xoto.ae/api"; 
const URL_BLOGS = `${API_BASE}/blogs`; 
const URL_UPLOAD = `${API_BASE}/upload`; 

const TAG_OPTIONS = ["AI", "Real Estate", "PropTech"];

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const BlogManagement = () => {
  const screens = useBreakpoint();

  // --- STATE ---
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  const [form] = Form.useForm();

  // --- UPLOAD STATES (Modified for multiple images) ---
  const [fileList, setFileList] = useState([]); // Featured Image
  const [coverFileList, setCoverFileList] = useState([]); // NEW: Cover Image
  const [authorFileList, setAuthorFileList] = useState([]); // NEW: Author Image

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  // --- 1. FETCH BLOGS ---
  const fetchBlogs = async (page = 1, limit = 10, search = '') => {
    setLoading(true);
    try {
      const response = await axios.get(`${URL_BLOGS}/get-all-blogs`, {
        params: { page, limit, search: search || undefined }
      });
      const resData = response.data;
      
      let finalData = [];
      if (resData.success && Array.isArray(resData.data)) {
        finalData = resData.data;
      } else if (Array.isArray(resData)) {
        finalData = resData;
      }

      setBlogs(finalData);
      setTotal(resData.total || finalData.length);

    } catch (err) {
      console.error(err);
      message.error("Failed to load blog list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
        fetchBlogs(currentPage, pageSize, searchText);
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [currentPage, pageSize, searchText]);

  // --- 2. FETCH SINGLE BLOG (EDIT) ---
  const fetchBlogById = async (id) => {
    setLoading(true);
    try {
      const response = await axios.get(`${URL_BLOGS}/get-blog-by-id`, { params: { id } });
      const resData = response.data;
      
      if (resData.success && resData.data) {
        const blog = resData.data;
        
        // Populate Form
        form.setFieldsValue({
          title: blog.title,
          subHeading: blog.subHeading, // NEW
          slug: blog.slug,
          tags: blog.tags || [], 
          status: blog.isPublished ? 'Published' : 'Draft',
          content: blog.content,
          authorName: blog.authorName,
        });

        // Helper to set file list state
        const setInitialFile = (url, setter) => {
            if (url) {
                setter([{
                    uid: '-1',
                    name: 'existing_file',
                    status: 'done',
                    url: url, 
                }]);
            } else {
                setter([]);
            }
        };

        setInitialFile(blog.featuredImage, setFileList);
        setInitialFile(blog.coverImage, setCoverFileList); // NEW
        setInitialFile(blog.authorImage, setAuthorFileList); // NEW

        setEditingId(id);
        setModalVisible(true);
      } else {
        message.error(resData.message || "Failed to fetch details.");
      }
    } catch (err) {
      message.error("Failed to fetch blog details.");
    } finally {
      setLoading(false);
    }
  };

  // --- HELPER: Upload Single File ---
  const uploadFile = async (file) => {
      const formData = new FormData();
      formData.append('file', file);

      try {
          const response = await axios.post(URL_UPLOAD, formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });
          const data = response.data;
          if (data.success) {
              return data.url || data.file?.url; 
          } else {
              throw new Error(data.message || "Upload failed");
          }
      } catch (error) {
          console.error("Upload Error:", error);
          throw new Error("Image upload failed.");
      }
  };

  // --- HELPER: Process Image State to URL ---
  // Checks if it's a new file (needs upload) or existing URL
  const processImageState = async (currentFileList) => {
      if (!currentFileList || currentFileList.length === 0) return "";
      
      // Case A: Existing URL
      if (currentFileList[0].url) {
          return currentFileList[0].url;
      }
      
      // Case B: New File Upload
      if (currentFileList[0].originFileObj) {
          return await uploadFile(currentFileList[0].originFileObj);
      }

      return "";
  };


  // --- 3. SAVE HANDLER ---
  const handleSave = async (values) => {
    setSaving(true);
    try {
      // Step 1: Process all 3 images in parallel
      const [featuredUrl, coverUrl, authorImgUrl] = await Promise.all([
          processImageState(fileList),
          processImageState(coverFileList),
          processImageState(authorFileList)
      ]);

      // Step 2: Prepare JSON Payload
      const payload = {
        title: values.title,
        subHeading: values.subHeading, // NEW
        slug: values.slug || values.title.toLowerCase().replace(/ /g, '-'),
        content: values.content,
        
        authorName: values.authorName,
        authorImage: authorImgUrl, // NEW
        
        isPublished: values.status === 'Published',
        tags: values.tags || [],
        
        featuredImage: featuredUrl,
        coverImage: coverUrl, // NEW
      };

      if (values.status === 'Published') {
         payload.publishedAt = new Date().toISOString();
      }

      // Step 3: Send Data
      let response;
      if (editingId) {
        response = await axios.post(`${URL_BLOGS}/edit-blog-by-id?id=${editingId}`, payload);
      } else {
        response = await axios.post(`${URL_BLOGS}/create-blog`, payload);
      }
      
      const resData = response.data;
      if (resData.success) {
        notification.success({
          message: editingId ? 'Blog Updated' : 'Blog Created',
          description: `Post "${values.title}" saved successfully.`,
          placement: 'topRight'
        });
        closeModal();
        fetchBlogs(currentPage, pageSize);
      } else {
        message.error(resData.message || "Operation failed.");
      }
    } catch (err) {
      console.error(err);
      message.error(err.message || "Failed to save blog.");
    } finally {
      setSaving(false);
    }
  };

  // --- 4. DELETE ---
  const deleteBlog = async (id) => {
    try {
      setLoading(true);
      const response = await axios.post(`${URL_BLOGS}/delete-blog-by-id?id=${id}`); 
      if (response.data?.success) {
          message.success("Deleted successfully.");
          fetchBlogs(currentPage, pageSize, searchText);
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
    setCoverFileList([]);
    setAuthorFileList([]);
    form.resetFields();
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) file.preview = await getBase64(file.originFileObj);
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
  };
  
  const handleCancelPreview = () => setPreviewOpen(false);

  // --- COLUMNS ---
  const columns = [
    {
      title: 'Blog Details',
      dataIndex: 'title',
      key: 'title',
      fixed: screens.md ? 'left' : false,
      width: 280,
      render: (text, record) => (
        <Space>
           {record.featuredImage ? (
                record.featuredImage.toLowerCase().endsWith('.pdf') ? (
                    <Avatar shape="square" icon={<FilePdfOutlined />} style={{ backgroundColor: '#ff4d4f' }} />
                ) : (
                    <Avatar shape="square" src={record.featuredImage} />
                )
           ) : (
             <Avatar shape="square" icon={<FileTextOutlined />} style={{ backgroundColor: THEME.primary }} />
           )}
          <div style={{ maxWidth: '200px' }}>
            <Text strong className="block truncate" title={text}>{text || "Untitled"}</Text>
            {record.subHeading && (
                <Text type="secondary" style={{ fontSize: '11px' }} className="block truncate">
                    {record.subHeading}
                </Text>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: 'Author',
      dataIndex: 'authorName',
      key: 'authorName',
      width: 180,
      render: (name, record) => (
        <Space>
            <Avatar size="small" src={record.authorImage} icon={<UserOutlined />} />
            <Text>{name || "No Author"}</Text>
        </Space>
      )
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      width: 180,
      render: (tags) => (
        <>
          {Array.isArray(tags) && tags.length > 0 ? tags.slice(0, 2).map(tag => (
             <Tag key={tag} color="blue">{tag}</Tag>
          )) : <Text type="secondary" style={{fontSize: '11px'}}>No Tags</Text>}
          {Array.isArray(tags) && tags.length > 2 && <Tag>+{tags.length - 2}</Tag>}
        </>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isPublished',
      key: 'isPublished',
      width: 120,
      render: (isPublished) => (
          <Badge 
            status={isPublished ? 'success' : 'warning'} 
            text={<span style={{ color: isPublished ? THEME.success : '#faad14' }}>{isPublished ? 'Published' : 'Draft'}</span>} 
          />
      ),
    },
    {
      title: 'Action',
      key: 'actions',
      align: 'center',
      fixed: screens.md ? 'right' : false,
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined style={{ color: THEME.primary }} />} 
              onClick={() => fetchBlogById(record._id || record.id)}
            />
          </Tooltip>
          
          <Popconfirm 
            title="Delete this post?" 
            onConfirm={() => deleteBlog(record._id || record.id)} 
            okText="Yes" 
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

  // Upload Button Component to avoid repetition
  const UploadButton = () => (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <Title level={3} style={{ margin: 0 }}>Blog Management</Title>
          <Text type="secondary">Manage your website articles and updates.</Text>
        </div>
        <Button 
          type="primary" 
          size="large" 
          icon={<PlusOutlined />} 
          onClick={() => {
              setEditingId(null);
              form.resetFields();
              setFileList([]);
              setCoverFileList([]);
              setAuthorFileList([]);
              setModalVisible(true);
          }}
          style={{ backgroundColor: THEME.primary, borderColor: THEME.primary }}
          className="w-full md:w-auto"
        >
          Create New Post
        </Button>
      </div>

      {/* 2. STATS */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.primary }}>
            <Statistic 
              title="Total Posts" 
              value={total} 
              prefix={<ReadOutlined style={{ color: THEME.primary }} />} 
            />
          </Card>
        </Col>
      </Row>

      {/* 3. TABLE CARD */}
      <Card bordered={false} className="shadow-md" bodyStyle={{ padding: 0 }}>
        <div className="p-4 border-b bg-white rounded-t-lg">
          <Input 
            prefix={<SearchOutlined className="text-gray-400" />} 
            placeholder="Search by title..." 
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
          dataSource={blogs} 
          loading={loading}
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

      {/* 4. MODAL FORM */}
      <Modal
        title={<div className="font-bold text-lg">{editingId ? <EditOutlined /> : <PlusOutlined />} {editingId ? 'Edit Post' : 'Create New Post'}</div>}
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        centered
        destroyOnClose
        width={screens.xs ? '95%' : 800}
      >
        <Divider style={{ margin: '10px 0 25px 0' }} />
        <Form form={form} layout="vertical" onFinish={handleSave} initialValues={{ status: 'Draft', authorName: 'Admin', tags: [] }}>
          
          {/* Row 1: Title & Status */}
          <Row gutter={16}>
            <Col xs={24} sm={16}>
              <Form.Item name="title" label="Post Title" rules={[{ required: true, message: 'Title is required' }]}>
                <Input prefix={<FileTextOutlined />} placeholder="e.g. AI Trends" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
                <Form.Item name="status" label="Publish Status">
                    <Select placeholder="Status" size="large">
                        <Option value="Draft"><SyncOutlined /> Draft</Option>
                        <Option value="Published"><CheckCircleOutlined className="text-green-500"/> Published</Option>
                    </Select>
                </Form.Item>
            </Col>
          </Row>

          {/* Row 2: SubHeading (NEW) */}
          <Form.Item name="subHeading" label="Sub Heading (Short Description)">
             <Input prefix={<InfoCircleOutlined />} placeholder="A brief summary of the blog post" size="large" />
          </Form.Item>

          {/* Row 3: Slug & Author */}
          <Row gutter={16}>
             <Col xs={24} sm={12}>
                <Form.Item name="slug" label="Slug (Auto-generated if empty)">
                    <Input prefix={<GlobalOutlined />} placeholder="e.g. ai-trends-2026" size="large" />
                </Form.Item>
             </Col>
             <Col xs={24} sm={12}>
                 <Row gutter={8}>
                    <Col flex="auto">
                        <Form.Item name="authorName" label="Author Name">
                            <Input prefix={<UserOutlined />} placeholder="e.g. Admin" size="large" />
                        </Form.Item>
                    </Col>
                    {/* NEW: Author Image Upload */}
                    <Col flex="60px">
                        <Form.Item label="Avatar">
                            <Upload
                                listType="picture-card"
                                fileList={authorFileList}
                                onPreview={handlePreview}
                                onChange={({ fileList }) => setAuthorFileList(fileList)}
                                beforeUpload={() => false}
                                maxCount={1}
                                showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
                            >
                                {authorFileList.length < 1 && <UserOutlined />}
                            </Upload>
                        </Form.Item>
                    </Col>
                 </Row>
             </Col>
          </Row>

          {/* Row 4: Tags */}
          <Form.Item name="tags" label="Tags / Category">
            <Select 
                mode="multiple" 
                size="large" 
                placeholder="Select Tags" 
                suffixIcon={<TagsOutlined />}
            >
                {TAG_OPTIONS.map(tag => (
                    <Option key={tag} value={tag}>{tag}</Option>
                ))}
            </Select>
          </Form.Item>

          {/* Row 5: Images (Featured & Cover) */}
          <Row gutter={16} className="bg-gray-50 p-4 rounded mb-4 border border-dashed border-gray-300">
             <Col xs={24} sm={12}>
                 <Form.Item label="Featured Image (Thumbnail)">
                     <Upload
                        listType="picture-card"
                        fileList={fileList}
                        onPreview={handlePreview}
                        onChange={({ fileList }) => setFileList(fileList)}
                        beforeUpload={() => false}
                        maxCount={1}
                        accept=".jpg,.jpeg,.png,.pdf"
                     >
                        {fileList.length < 1 && <UploadButton />}
                     </Upload>
                     <Text type="secondary" style={{fontSize: '12px'}}>Used in cards & previews</Text>
                 </Form.Item>
             </Col>
             <Col xs={24} sm={12}>
                 {/* NEW: Cover Image Field */}
                 <Form.Item label="Cover Image (Banner)">
                     <Upload
                        listType="picture-card"
                        fileList={coverFileList}
                        onPreview={handlePreview}
                        onChange={({ fileList }) => setCoverFileList(fileList)}
                        beforeUpload={() => false}
                        maxCount={1}
                        accept=".jpg,.jpeg,.png"
                     >
                        {coverFileList.length < 1 && <div className='flex flex-col items-center'><PictureOutlined /><span className='mt-1 text-xs'>Cover</span></div>}
                     </Upload>
                     <Text type="secondary" style={{fontSize: '12px'}}>Used as top banner in details</Text>
                 </Form.Item>
             </Col>
          </Row>

          {/* Row 6: Content */}
          <Form.Item name="content" label="Blog Content" rules={[{ required: true, message: 'Please write some content' }]}>
            <TextArea 
                rows={8} 
                placeholder="Write your blog content here..." 
                showCount 
                maxLength={10000} 
            />
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
              {editingId ? 'Update Blog' : 'Publish Blog'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Image Preview Modal */}
      <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancelPreview}>
        {previewImage && previewImage.toLowerCase().endsWith('.pdf') ? (
             <div className="text-center p-4">
                 <FilePdfOutlined style={{ fontSize: '48px', color: 'red' }} />
                 <p>PDF Document</p>
                 <Button type="link" href={previewImage} target="_blank">Download PDF</Button>
             </div>
        ) : (
             <img alt="preview" style={{ width: '100%' }} src={previewImage} />
        )}
      </Modal>
    </div>
  );
};

export default BlogManagement;