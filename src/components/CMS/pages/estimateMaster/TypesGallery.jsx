 import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, Select, Button, Upload, Modal, message, 
  Typography, Divider, Space, Empty, Spin, Popconfirm, Input, Image
} from 'antd';
import { 
  PlusOutlined, DeleteOutlined, EditOutlined, 
  AppstoreOutlined, UploadOutlined, FileImageOutlined,
  PictureOutlined, LoadingOutlined, EyeOutlined
} from '@ant-design/icons';
import { apiService } from '../../../../manageApi/utils/custom.apiservice';

const { Title, Text } = Typography;
const { Meta } = Card;

const THEME = {
  primary: "#722ed1",
  bgLight: "#f9f0ff",
  border: "#efdbff"
};

const BASE_URL = 'https://xoto.ae/api';
const API_PREFIX = '/estimate/master/category';

const TypesGallery = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [gallery, setGallery] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal States
  const [editModal, setEditModal] = useState({ open: false, imageId: '', title: '', type: '' });
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  // 1. Fetch Categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await apiService.get(API_PREFIX);
        setCategories(res.categories || res.data || []);
      } catch (err) { message.error("Failed to load categories"); }
    };
    fetchCats();
  }, []);

  // 2. Cascade Fetching Logic
  const handleCatChange = async (val) => {
    setSelectedCat(val); setSelectedSub(null); setSelectedType(null); setGallery(null);
    try {
      const res = await apiService.get(`${API_PREFIX}/${val}/subcategories`);
      setSubcategories(res.data || []);
    } catch (err) { message.error("Failed to load subcategories"); }
  };

  const handleSubChange = async (val) => {
    setSelectedSub(val); setSelectedType(null); setGallery(null);
    try {
      const res = await apiService.get(`${API_PREFIX}/${selectedCat}/subcategories/${val}/types`);
      setTypes(res.data || []);
    } catch (err) { message.error("Failed to load types"); }
  };

  const fetchGallery = useCallback(async (typeId) => {
    if (!typeId) return;
    setLoading(true);
    try {
      const res = await apiService.get(`${API_PREFIX}/types/${typeId}/gallery`);
      setGallery(res.gallery || null);
    } catch (err) { setGallery(null); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (selectedType) fetchGallery(selectedType); }, [selectedType, fetchGallery]);

  // 3. Image Actions
  const handleUpload = async ({ file, type }) => {
    const formData = new FormData();
    const endpoint = type === 'preview' ? 'preview' : 'moodboard';
    formData.append(type === 'preview' ? 'previewImage' : 'moodboardImages', file);
    
    setActionLoading(true);
    try {
      await apiService.post(`${API_PREFIX}/types/${selectedType}/gallery/${endpoint}`, formData);
      message.success(`${type} image uploaded successfully`);
      fetchGallery(selectedType);
    } catch (err) { message.error("Upload failed"); }
    finally { setActionLoading(false); }
  };

  const deleteImage = async (id, type) => {
    try {
      const url = type === 'preview' 
        ? `${API_PREFIX}/types/${selectedType}/gallery/preview`
        : `${API_PREFIX}/types/${selectedType}/gallery/moodboard/${id}`;
      await apiService.delete(url);
      message.success("Image removed");
      fetchGallery(selectedType);
    } catch (err) { message.error("Delete failed"); }
  };

  const handleUpdateTitle = async () => {
    try {
      await apiService.put(`${API_PREFIX}/types/${selectedType}/gallery/image-title`, {
        imageId: editModal.imageId, title: editModal.title, type: editModal.type
      });
      message.success("Title updated");
      setEditModal({ ...editModal, open: false });
      fetchGallery(selectedType);
    } catch (err) { message.error("Update failed"); }
  };

  // 4. Preview Helper
  const showFullImage = (url) => {
    setPreviewImage(url.startsWith('http') ? url : `${BASE_URL}${url}`);
    setPreviewVisible(true);
  };

  return (
    <div className="p-6 bg-[#f0f2f5] min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-6 flex justify-between items-center border-b-4" style={{ borderBottomColor: THEME.primary }}>
          <Space size="large">
            <div className="bg-purple-600 p-3 rounded-xl shadow-lg shadow-purple-200">
              <PictureOutlined className="text-white text-2xl" />
            </div>
            <div>
              <Title level={3} className="m-0">Gallery & Assets</Title>
              <Text className="text-gray-400">Manage high-quality images for your master types</Text>
            </div>
          </Space>
        </div>

        {/* Filters */}
        <Card className="rounded-2xl shadow-sm mb-6 border-none">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Text strong className="text-xs text-gray-400 uppercase">Category</Text>
                <Select size="large" className="w-full" placeholder="Choose Category" onChange={handleCatChange} value={selectedCat}>
                  {categories.map(c => <Select.Option key={c._id} value={c._id}>{c.name}</Select.Option>)}
                </Select>
              </div>
              <div className="space-y-2">
                <Text strong className="text-xs text-gray-400 uppercase">Subcategory</Text>
                <Select size="large" className="w-full" placeholder="Choose Sub" disabled={!selectedCat} onChange={handleSubChange} value={selectedSub}>
                  {subcategories.map(s => <Select.Option key={s._id} value={s._id}>{s.label}</Select.Option>)}
                </Select>
              </div>
              <div className="space-y-2">
                <Text strong className="text-xs text-gray-400 uppercase">Master Type</Text>
                <Select size="large" className="w-full" placeholder="Choose Type" disabled={!selectedSub} onChange={setSelectedType} value={selectedType}>
                  {types.map(t => <Select.Option key={t._id} value={t._id}>{t.label}</Select.Option>)}
                </Select>
              </div>
           </div>
        </Card>

        {loading ? (
          <div className="text-center py-20 bg-white rounded-3xl"><Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: THEME.primary }} spin />} /></div>
        ) : selectedType ? (
          <div className="space-y-8">
            
            {/* --- PREVIEW IMAGE --- */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <FileImageOutlined style={{ color: THEME.primary }} />
                </div>
                <Title level={4} className="m-0">Main Showcase Image</Title>
              </div>
              
              <div className="flex flex-wrap gap-6">
                {gallery?.previewImage ? (
                  <Card
                    hoverable
                    className="w-80 rounded-2xl overflow-hidden border-none shadow-md"
                    cover={
                      <div className="relative group">
                        <img alt="preview" src={`${BASE_URL}${gallery.previewImage.url}`} className="h-56 w-full object-cover transition-transform group-hover:scale-105 duration-300" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <Button type="primary" shape="circle" icon={<EyeOutlined />} onClick={() => showFullImage(gallery.previewImage.url)} />
                        </div>
                      </div>
                    }
                    actions={[
                      <EditOutlined key="edit" onClick={() => setEditModal({ open: true, imageId: gallery.previewImage.id, title: gallery.previewImage.title, type: 'preview' })} />,
                      <Popconfirm title="Delete preview?" onConfirm={() => deleteImage(null, 'preview')}><DeleteOutlined key="delete" className="text-red-500" /></Popconfirm>
                    ]}
                  >
                    <Meta title={gallery.previewImage.title} description="Used for primary identification" />
                  </Card>
                ) : (
                  <Upload.Dragger customRequest={(options) => handleUpload({ ...options, type: 'preview' })} showUploadList={false} className="w-80 bg-white border-2 border-dashed border-purple-200 rounded-2xl hover:border-purple-500 transition-all">
                    <PlusOutlined className="text-2xl text-purple-400 mb-2" />
                    <p className="text-xs text-gray-400">Upload Preview</p>
                  </Upload.Dragger>
                )}
              </div>
            </section>

            <Divider />

            {/* --- MOODBOARD GALLERY --- */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <AppstoreOutlined className="text-blue-600" />
                   </div>
                   <Title level={4} className="m-0">Moodboard Collection</Title>
                </div>
                <Upload customRequest={(options) => handleUpload({ ...options, type: 'moodboard' })} showUploadList={false} multiple>
                   <Button type="primary" size="large" icon={<PlusOutlined />} style={{ background: THEME.primary, borderRadius: '12px', border: 'none' }}>Add to Moodboard</Button>
                </Upload>
              </div>

              {gallery?.moodboardImages?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {gallery.moodboardImages.map((img) => (
                    <Card
                      key={img.id}
                      hoverable
                      className="rounded-2xl border-none shadow-sm group overflow-hidden"
                      cover={
                        <div className="relative overflow-hidden">
                           <img alt={img.title} src={`${BASE_URL}${img.url}`} className="h-44 w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                           <div className="absolute inset-0 bg-purple-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button type="primary" ghost icon={<EyeOutlined />} onClick={() => showFullImage(img.url)}>View</Button>
                           </div>
                        </div>
                      }
                      actions={[
                        <EditOutlined key="edit" onClick={() => setEditModal({ open: true, imageId: img.id, title: img.title, type: 'moodboard' })} />,
                        <Popconfirm title="Delete image?" onConfirm={() => deleteImage(img.id, 'moodboard')}><DeleteOutlined key="delete" className="text-red-400" /></Popconfirm>
                      ]}
                    >
                      <Meta title={img.title} className="text-center font-medium" />
                    </Card>
                  ))}
                </div>
              ) : (
                <Empty description="Gallery is empty" className="p-20 bg-white rounded-3xl" />
              )}
            </section>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-24 text-center border-2 border-dashed border-gray-100">
             <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <PictureOutlined style={{ fontSize: 40, color: '#d9d9d9' }} />
             </div>
             <Title level={4} className="text-gray-300">Select a type above to start managing assets</Title>
          </div>
        )}
      </div>

      {/* --- LIGHTBOX PREVIEW --- */}
      <Image
        preview={{
          visible: previewVisible,
          src: previewImage,
          onVisibleChange: (value) => setPreviewVisible(value),
        }}
      />

      {/* --- EDIT TITLE MODAL --- */}
      <Modal
        title={<Text strong className="text-purple-700">Update Asset Name</Text>}
        open={editModal.open}
        onOk={handleUpdateTitle}
        onCancel={() => setEditModal({ ...editModal, open: false })}
        okButtonProps={{ style: { background: THEME.primary, borderRadius: '8px' } }}
      >
        <div className="py-4">
          <Input 
            size="large"
            prefix={<EditOutlined className="text-gray-300" />}
            value={editModal.title} 
            onChange={(e) => setEditModal({ ...editModal, title: e.target.value })}
            placeholder="New title name..."
          />
        </div>
      </Modal>

      {/* Global Action Loader */}
      {actionLoading && (
        <div className="fixed inset-0 z-[9999] bg-white/60 backdrop-blur-sm flex items-center justify-center">
           <Card className="shadow-2xl rounded-2xl border-none">
              <Space direction="vertical" align="center" size="large">
                 <Spin indicator={<LoadingOutlined style={{ fontSize: 32, color: THEME.primary }} spin />} />
                 <Text strong className="text-purple-800">Updating your gallery...</Text>
              </Space>
           </Card>
        </div>
      )}
    </div>
  );
};

export default TypesGallery;