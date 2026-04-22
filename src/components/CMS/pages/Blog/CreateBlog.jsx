import React, { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from "../../../../manageApi/utils/custom.apiservice";
import { showToast } from '../../../../manageApi/utils/toast';
import DOMPurify from 'dompurify';
import moment from 'moment';
import Cropper from 'react-easy-crop';

// ── TINYMCE IMPORT ──
import { Editor } from '@tinymce/tinymce-react';

import {
  Button, Modal, Form, Input, Popconfirm, Card,
  Typography, Avatar, Row, Col, Statistic, Space, Divider,
  message, notification, Tooltip, Grid, Tag, Select, Badge,
  Upload, Tabs, Alert, Switch, Slider, Skeleton, Empty
} from 'antd';
import {
  PlusOutlined, FileTextOutlined, DeleteOutlined,
  EditOutlined, SearchOutlined, CheckCircleOutlined, SyncOutlined,
  UserOutlined, PictureOutlined, EyeOutlined, ClockCircleOutlined,
  UndoOutlined, ScissorOutlined, ZoomInOutlined, BookOutlined, CalendarOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;
const { TextArea } = Input;
const { TabPane } = Tabs;

const THEME = {
  primary: "#5C039B",
  success: "#10b981",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6"
};

// ─────────────────────────────────────────────
//  BLOG CONTENT CSS — fixes Tailwind reset for Preview
// ─────────────────────────────────────────────
const BLOG_CONTENT_STYLES = `
  .tox-tinymce {
    border-radius: 8px !important;
    border: 1px solid #d9d9d9 !important;
  }
  .blog-preview-content ul { list-style-type: disc !important; padding-left: 24px !important; margin: 12px 0 !important; }
  .blog-preview-content ol { list-style-type: decimal !important; padding-left: 24px !important; margin: 12px 0 !important; }
  .blog-preview-content li { display: list-item !important; margin: 6px 0 !important; line-height: 1.7 !important; }
  .blog-preview-content p { margin: 10px 0; line-height: 1.6; }
  .blog-preview-content h1 { font-size: 28px; font-weight: 700; margin: 24px 0 12px; }
  .blog-preview-content h2 { font-size: 22px; font-weight: 700; margin: 20px 0 10px; }
  .blog-preview-content h3 { font-size: 18px; font-weight: 700; margin: 16px 0 8px; }
  .blog-preview-content blockquote { border-left: 4px solid #5C039B; padding-left: 16px; margin: 16px 0; color: #555; font-style: italic; }
  .blog-preview-content a { color: #5C039B; text-decoration: underline; }
  .blog-preview-content img { max-width: 100%; height: auto; border-radius: 8px; margin: 12px 0; display: block; }
`;

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
const CATEGORY_KEYWORDS = {
  'AI': ['artificial intelligence', 'machine learning', 'deep learning', 'chatgpt', 'llm', 'automation'],
  'Real Estate': ['property', 'real estate', 'housing', 'apartment', 'villa', 'broker'],
  'PropTech': ['proptech', 'property technology', 'smart home', 'iot'],
  'Technology': ['software', 'programming', 'javascript', 'react', 'node', 'developer'],
  'Business': ['business', 'startup', 'entrepreneur', 'investment', 'marketing'],
  'Mortgage': ['mortgage', 'home loan', 'refinance', 'interest rate'],
  'Landscaping': ['landscaping', 'garden design', 'outdoor space'],
};

const COMMON_TAGS = ['AI', 'Real Estate', 'PropTech', 'Technology', 'Business', 'Mortgage', 'Landscaping', 'Marketing', 'UAE', 'Dubai', 'Sustainability', 'Innovation'];

const smartExtract = (html) => {
  if (!html) return {};
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
  let detectedCategory = 'Other';
  let maxMatches = 0;
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const matches = keywords.filter(kw => text.includes(kw)).length;
    if (matches > maxMatches) { maxMatches = matches; detectedCategory = cat; }
  }
  const detectedTags = COMMON_TAGS.filter(tag => text.includes(tag.toLowerCase())).slice(0, 6);
  const paraMatch = html.match(/<p[^>]*>(.*?)<\/p>/i);
  let excerpt = paraMatch ? paraMatch[1].replace(/<[^>]*>/g, '').trim().substring(0, 160) : '';
  const wordCount = text.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);
  return { detectedCategory, detectedTags, excerpt, wordCount, readingTime };
};

const extractHeadings = (html) => {
  if (!html) return [];
  const headings = [];
  const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h\1>/gi;
  let match;
  while ((match = headingRegex.exec(html)) !== null) {
    headings.push({ level: parseInt(match[1]), text: match[2].replace(/<[^>]*>/g, '').trim(), id: `heading-${headings.length}` });
  }
  return headings;
};

const extractExcerpt = (html, maxLength = 160) => {
  if (!html) return '';
  const text = html.replace(/<[^>]*>/g, '');
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// ─────────────────────────────────────────────
//  CROP HELPER
// ─────────────────────────────────────────────
const getCroppedImg = (imageSrc, pixelCrop) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
      canvas.toBlob(blob => {
        if (!blob) return reject(new Error('Canvas is empty'));
        resolve(blob);
      }, 'image/jpeg', 0.92);
    };
    image.onerror = reject;
  });
};

// ─────────────────────────────────────────────
//  IMAGE CROP MODAL COMPONENT
// ─────────────────────────────────────────────
const ImageCropModal = ({ open, imageSrc, aspect, title, onConfirm, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropping, setCropping] = useState(false);

  useEffect(() => {
    if (open) { setCrop({ x: 0, y: 0 }); setZoom(1); setCroppedAreaPixels(null); }
  }, [open, imageSrc]);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setCropping(true);
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onConfirm(blob);
    } catch (e) { message.error('Crop failed, please try again'); } 
    finally { setCropping(false); }
  };

  return (
    <Modal open={open} title={<Space><ScissorOutlined style={{ color: THEME.primary }} /><span>{title || 'Crop Image'}</span></Space>} onCancel={onCancel} width={620} centered destroyOnClose
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <ZoomInOutlined style={{ color: '#888' }} />
            <Slider min={1} max={3} step={0.05} value={zoom} onChange={setZoom} style={{ width: 160 }} />
            <Text type="secondary" style={{ fontSize: 12 }}>{Math.round(zoom * 100)}%</Text>
          </Space>
          <Space>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" loading={cropping} onClick={handleConfirm} style={{ background: THEME.primary, borderColor: THEME.primary }}>Apply Crop</Button>
          </Space>
        </div>
      }>
      <div style={{ position: 'relative', width: '100%', height: 380, background: '#1a1a2e', borderRadius: 10, overflow: 'hidden' }}>
        {imageSrc ? (
          <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={aspect} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)} />
        ) : (<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><Text type="secondary">Loading image...</Text></div>)}
      </div>
    </Modal>
  );
};

// ─────────────────────────────────────────────
//  UPLOAD WITH CROP — REUSABLE COMPONENT
// ─────────────────────────────────────────────
const UploadWithCrop = ({ fileList, onChange, aspect, cropTitle, maxSizeMB = 5, label, extra, maxCount = 1 }) => {
  const [cropModal, setCropModal] = useState({ open: false, src: '' });
  const [pendingFile, setPendingFile] = useState(null);

  const handleBeforeUpload = (file) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type);
    if (!allowed) { message.error('Only JPG, PNG, WEBP allowed'); return Upload.LIST_IGNORE; }
    if (file.size / 1024 / 1024 > maxSizeMB) { message.error(`Max ${maxSizeMB}MB`); return Upload.LIST_IGNORE; }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPendingFile(file);
      setCropModal({ open: true, src: e.target.result });
    };
    reader.readAsDataURL(file);
    return Upload.LIST_IGNORE;
  };

  const handleCropConfirm = (blob) => {
    const fileName = pendingFile?.name || 'image.jpg';
    const croppedFile = new File([blob], fileName, { type: 'image/jpeg' });
    const preview = URL.createObjectURL(blob);
    onChange([{ uid: `crop-${Date.now()}`, name: fileName, status: 'done', originFileObj: croppedFile, preview, url: preview }]);
    setCropModal({ open: false, src: '' });
    setPendingFile(null);
  };

  const handleEditCrop = (file) => {
    const src = file.url || file.preview;
    if (!src) return;
    setPendingFile(file.originFileObj || null);
    setCropModal({ open: true, src });
  };

  const itemRender = (originNode, file) => (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {originNode}
      <Tooltip title="Crop / Edit">
        <button onClick={(e) => { e.stopPropagation(); handleEditCrop(file); }} style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', background: 'rgba(92,3,155,0.92)', border: 'none', borderRadius: 6, color: '#fff', fontSize: 11, fontWeight: 600, padding: '2px 10px', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
          <ScissorOutlined style={{ fontSize: 10 }} /> Edit
        </button>
      </Tooltip>
    </div>
  );

  return (
    <>
      <Form.Item label={label} extra={extra}>
        <Upload listType="picture-card" fileList={fileList} onChange={({ fileList: fl }) => { if (fl.length < fileList.length) onChange(fl); }} beforeUpload={handleBeforeUpload} maxCount={maxCount} itemRender={itemRender} accept="image/jpeg,image/png,image/webp">
          {fileList.length < maxCount && (<div><PlusOutlined /><div style={{ marginTop: 8, fontSize: 12 }}>Upload</div></div>)}
        </Upload>
      </Form.Item>
      <ImageCropModal open={cropModal.open} imageSrc={cropModal.src} aspect={aspect} title={cropTitle} onConfirm={handleCropConfirm} onCancel={() => { setCropModal({ open: false, src: '' }); setPendingFile(null); }} />
    </>
  );
};

// ─────────────────────────────────────────────
//  BLOG PREVIEW COMPONENT
// ─────────────────────────────────────────────
const BlogPreview = ({ data }) => {
  if (!data) return null;
  const { title, subHeading, content, authorName, authorImage, tags, category, featuredImage, coverImage, createdAt, readingTime, headings } = data;

  return (
    <div style={{ fontFamily: "'Georgia', serif", color: '#1a1a2e', background: '#fff' }}>
      {coverImage && (
        <div style={{ width: '100%', height: 280, overflow: 'hidden', borderRadius: 12, marginBottom: 28, background: '#f0f0f0' }}>
          <img src={coverImage} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      <div style={{ marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        {category && <Tag color="purple" style={{ fontSize: 12, padding: '2px 10px', borderRadius: 20 }}>{category}</Tag>}
        {tags?.map(tag => <Tag key={tag} color="blue" style={{ fontSize: 11, borderRadius: 20 }}>#{tag}</Tag>)}
      </div>
      <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.25, color: '#0f0f23', marginBottom: 12, fontFamily: "'Georgia', serif" }}>{title || 'Untitled Post'}</h1>
      {subHeading && <p style={{ fontSize: 18, color: '#555', lineHeight: 1.6, marginBottom: 20, fontStyle: 'italic', borderLeft: `4px solid ${THEME.primary}`, paddingLeft: 16 }}>{subHeading}</p>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderTop: '1px solid #eee', borderBottom: '1px solid #eee', marginBottom: 24 }}>
        <Avatar size={42} src={authorImage} icon={<UserOutlined />} style={{ backgroundColor: THEME.primary }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{authorName || 'Admin'}</div>
          <div style={{ fontSize: 12, color: '#888', display: 'flex', gap: 16 }}>
            {createdAt && <span><CalendarOutlined /> {moment(createdAt).format('MMM DD, YYYY')}</span>}
            {readingTime && <span><ClockCircleOutlined /> {readingTime} min read</span>}
          </div>
        </div>
      </div>
      {!coverImage && featuredImage && (
        <div style={{ marginBottom: 24, borderRadius: 10, overflow: 'hidden' }}>
          <img src={featuredImage} alt="featured" style={{ width: '100%', maxHeight: 400, objectFit: 'cover' }} />
        </div>
      )}
      {headings && headings.length > 2 && (
        <div style={{ background: '#f8f4ff', border: '1px solid #e0d0ff', borderRadius: 10, padding: '16px 20px', marginBottom: 28 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: THEME.primary, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}><BookOutlined /> Table of Contents</div>
          <ol style={{ margin: 0, paddingLeft: 20, listStyleType: 'decimal' }}>
            {headings.filter(h => h.level <= 3).map((h, i) => (<li key={i} style={{ marginLeft: `${(h.level - 1) * 16}px`, fontSize: 13, padding: '3px 0', color: THEME.primary, display: 'list-item' }}>{h.text}</li>))}
          </ol>
        </div>
      )}
      <div className="blog-preview-content" style={{ lineHeight: 1.85, fontSize: 16, color: '#1f1f1f' }}
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content || '', { ADD_TAGS: ['iframe'], ADD_ATTR: ['allow', 'allowfullscreen', 'target', 'style'] }) }} />
    </div>
  );
};

// ─────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────
const BlogManagement = () => {
  const screens = useBreakpoint();
  const searchTimeout = useRef(null);

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [targetStatus, setTargetStatus] = useState('draft');

  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalResults: 0, itemsPerPage: 10 });
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewBlogData, setPreviewBlogData] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();
  
  const [contentValue, setContentValue] = useState('');
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [headings, setHeadings] = useState([]);
  const [smartFillApplied, setSmartFillApplied] = useState(false);

  const [featuredImageList, setFeaturedImageList] = useState([]);
  const [coverImageList, setCoverImageList] = useState([]);
  const [authorImageList, setAuthorImageList] = useState([]);

  const [stats, setStats] = useState({ total: 0, published: 0, drafts: 0, views: 0 });

  useEffect(() => {
    let t;
    if (autoSave && contentValue && modalVisible) { t = setTimeout(() => handleAutoSave(), 30000); }
    return () => clearTimeout(t);
  }, [contentValue, autoSave, modalVisible]);

  const handleAutoSave = async () => {
    if (!contentValue || !modalVisible) return;
    const vals = form.getFieldsValue();
    if (!vals.title) return;
    const key = `blog_draft_${editingId || 'new'}`;
    localStorage.setItem(key, JSON.stringify({ ...vals, content: contentValue, headings, timestamp: new Date().toISOString() }));
    setLastSaved(new Date());
  };

  const loadDraft = () => {
    const key = `blog_draft_${editingId || 'new'}`;
    const raw = localStorage.getItem(key);
    if (!raw) return;
    try {
      const d = JSON.parse(raw);
      Modal.confirm({
        title: 'Draft Found',
        content: `Restore draft saved at ${moment(d.timestamp).format('HH:mm, MMM DD')}?`,
        onOk: () => {
          form.setFieldsValue({ title: d.title, subHeading: d.subHeading, tags: d.tags, category: d.category, authorName: d.authorName });
          setContentValue(d.content || '');
          setHeadings(d.headings || []);
          message.success('Draft restored');
        }
      });
    } catch (_) {}
  };

  const fetchBlogs = useCallback(async (page = 1, limit = 10, searchVal = "", category = "", status = "") => {
    setLoading(true);
    try {
      let url = `/blogs/get-all-blogs?page=${page}&limit=${limit}`;
      if (searchVal?.trim()) url += `&search=${encodeURIComponent(searchVal.trim())}`;
      if (category) url += `&category=${encodeURIComponent(category)}`;
      if (status) url += `&isPublished=${status === 'published'}`;
      const response = await apiService.get(url);
      if (response.success) {
        setBlogs(response.data || []);
        setPagination({
          currentPage: response.pagination?.page || page,
          totalPages: response.pagination?.totalPages || 1,
          totalResults: response.pagination?.total || response.data?.length || 0,
          itemsPerPage: response.pagination?.limit || limit,
        });
        setStats({
          total: response.pagination?.total || 0,
          published: response.data.filter(b => b.isPublished).length,
          drafts: response.data.filter(b => !b.isPublished).length,
          views: response.data.reduce((s, b) => s + (b.viewCount || 0), 0),
        });
      }
    } catch (e) {
      if (showToast) showToast('Failed to load blogs', 'error');
      else message.error('Failed to load blogs');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBlogs(1, 10, "", "", ""); }, [fetchBlogs]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchText(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchBlogs(1, pagination.itemsPerPage, val, selectedCategory, selectedStatus), 500);
  };

  const handleFilterChange = (type, val) => {
    if (type === 'category') { setSelectedCategory(val); fetchBlogs(1, pagination.itemsPerPage, searchText, val, selectedStatus); } 
    else if (type === 'status') { setSelectedStatus(val); fetchBlogs(1, pagination.itemsPerPage, searchText, selectedCategory, val); }
  };

  const handleClearFilters = () => {
    setSearchText(''); setSelectedCategory(''); setSelectedStatus('');
    fetchBlogs(1, pagination.itemsPerPage, "", "", "");
  };

  const fetchBlogById = async (id) => {
    setLoading(true);
    try {
      const response = await apiService.get(`/blogs/get-blog-by-id?id=${id}`);
      if (response.success && response.data) {
        const blog = response.data;
        let finalContent = blog.content || '';
        if (finalContent === '<p><br></p>') finalContent = '';

        form.setFieldsValue({
          title: blog.title || '',
          subHeading: blog.subHeading || '',
          tags: blog.tags || [],
          category: blog.category || 'Other',
          authorName: blog.authorName || 'Admin',
        });

        setContentValue(finalContent);
        setHeadings(extractHeadings(finalContent));

        setFeaturedImageList(blog.featuredImage ? [{ uid: '-1', name: 'featured', status: 'done', url: blog.featuredImage, preview: blog.featuredImage }] : []);
        setCoverImageList(blog.coverImage ? [{ uid: '-2', name: 'cover', status: 'done', url: blog.coverImage, preview: blog.coverImage }] : []);
        setAuthorImageList(blog.authorImage ? [{ uid: '-3', name: 'author', status: 'done', url: blog.authorImage, preview: blog.authorImage }] : []);

        setEditingId(id);
        setModalVisible(true);
        setTimeout(() => loadDraft(), 100);
      } else { message.error(response.message || 'Failed to fetch details'); }
    } catch (err) { message.error('Failed to fetch blog details'); } 
    finally { setLoading(false); }
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiService.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    if (response.success) return response.url || response.file?.url;
    throw new Error(response.message || 'Upload failed');
  };

  const processImage = async (imageList) => {
    if (!imageList || imageList.length === 0) return '';
    if (imageList[0].originFileObj) return await uploadFile(imageList[0].originFileObj);
    if (imageList[0].url && !imageList[0].url.startsWith('blob:')) return imageList[0].url;
    return '';
  };

  const handleSave = async (values) => {
    if (!contentValue || contentValue === '<p></p>' || contentValue === '<p><br data-mce-bogus="1"></p>') { message.error('Please add content to your blog'); return; }
    if (targetStatus === 'published') {
      if (featuredImageList.length === 0) { message.error('Featured Image is mandatory for publishing.'); return; }
      if (coverImageList.length === 0) { message.error('Cover Image is mandatory for publishing.'); return; }
      if (authorImageList.length === 0) { message.error('Author Image is mandatory for publishing.'); return; }
      if (!values.authorName) { message.error('Author Name is mandatory for publishing.'); return; }
    }

    setSaving(true);
    try {
      const [featuredUrl, coverUrl, authorImgUrl] = await Promise.all([
        processImage(featuredImageList), processImage(coverImageList), processImage(authorImageList),
      ]);
      const payload = {
        title: values.title,
        subHeading: values.subHeading || extractExcerpt(contentValue, 160),
        content: contentValue,
        authorImage: authorImgUrl,
        isPublished: targetStatus === 'published',
        tags: values.tags || [],
        category: values.category || 'Other',
        featuredImage: featuredUrl,
        coverImage: coverUrl,
      };
      if (targetStatus === 'published') payload.publishedAt = new Date().toISOString();
      const response = editingId
        ? await apiService.put(`/blogs/edit-blog-by-id?id=${editingId}`, payload)
        : await apiService.post('/blogs/create-blog', payload);
      
      if (response.success) {
        notification.success({ message: editingId ? 'Blog Updated' : 'Blog Created', description: `"${values.title}" saved successfully`, placement: 'topRight' });
        localStorage.removeItem(`blog_draft_${editingId || 'new'}`);
        closeModal();
        fetchBlogs(pagination.currentPage, pagination.itemsPerPage, searchText, selectedCategory, selectedStatus);
      } else { message.error(response.message || 'Operation failed'); }
    } catch (err) { message.error(err.message || 'Failed to save blog'); } 
    finally { setSaving(false); }
  };

  const deleteBlog = async (id) => {
    try {
      const response = await apiService.delete(`/blogs/delete-blog-by-id?id=${id}`);
      if (response.success) {
        message.success('Blog deleted successfully');
        fetchBlogs(pagination.currentPage, pagination.itemsPerPage, searchText, selectedCategory, selectedStatus);
      } else { message.error(response.message || 'Delete failed'); }
    } catch (err) { message.error('Failed to delete blog'); }
  };

  const handleCardPreview = async (record) => {
    const hide = message.loading('Loading preview...', 0);
    try {
      const response = await apiService.get(`/blogs/get-blog-by-id?id=${record._id}`);
      showPreview(response.success && response.data ? response.data : record, false);
    } catch { showPreview(record, false); } 
    finally { hide(); }
  };

  const showPreview = (blogData = {}, isLiveFormPreview = false) => {
    if (isLiveFormPreview) {
      const formVals = form.getFieldsValue();
      setPreviewBlogData({
        title: formVals.title || 'Untitled Post',
        subHeading: formVals.subHeading,
        content: contentValue,
        authorName: formVals.authorName,
        tags: formVals.tags || [],
        category: formVals.category,
        featuredImage: featuredImageList[0]?.url || featuredImageList[0]?.preview,
        coverImage: coverImageList[0]?.url || coverImageList[0]?.preview,
        authorImage: authorImageList[0]?.url || authorImageList[0]?.preview,
        headings,
        createdAt: new Date(),
        readingTime: Math.ceil((contentValue || '').replace(/<[^>]*>/g, '').split(/\s+/).length / 200),
      });
    } else {
      setPreviewBlogData({
        ...blogData,
        headings: extractHeadings(blogData?.content || ''),
        readingTime: Math.ceil((blogData?.content || '').replace(/<[^>]*>/g, '').split(/\s+/).length / 200),
      });
    }
    setPreviewModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false); setEditingId(null);
    setFeaturedImageList([]); setCoverImageList([]); setAuthorImageList([]);
    setContentValue(''); setHeadings([]); setSmartFillApplied(false); setLastSaved(null);
    form.resetFields();
  };

  // ── TINYMCE ONCHANGE HANDLER ──
  const handleEditorChange = (content, editor) => {
    setContentValue(content);
    setHeadings(extractHeadings(content));
    
    const currentValues = form.getFieldsValue();
    if (!currentValues.subHeading && content.length > 50) {
      const extracted = smartExtract(content);
      const updates = {};
      if (extracted.excerpt) updates.subHeading = extracted.excerpt;
      if ((!currentValues.category || currentValues.category === 'Other') && extracted.detectedCategory !== 'Other') updates.category = extracted.detectedCategory;
      if ((!currentValues.tags || currentValues.tags.length === 0) && extracted.detectedTags.length > 0) updates.tags = extracted.detectedTags;
      
      if (Object.keys(updates).length > 0) {
        form.setFieldsValue(updates);
        setSmartFillApplied(true);
      }
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <style>{BLOG_CONTENT_STYLES}</style>

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <Title level={3} style={{ margin: 0 }}> Blog Management</Title>
            <Text type="secondary">Create, manage, and publish content</Text>
          </div>
          <Button type="primary" size="large" icon={<PlusOutlined />} style={{ backgroundColor: THEME.primary, borderColor: THEME.primary }}
            onClick={() => {
              setEditingId(null); form.resetFields();
              setFeaturedImageList([]); setCoverImageList([]); setAuthorImageList([]);
              setContentValue(''); setHeadings([]); setSmartFillApplied(false);
              setModalVisible(true);
              setTimeout(() => loadDraft(), 100);
            }}>
            Create New Post
          </Button>
        </div>

        <Row gutter={[16, 16]}>
          {[
            { title: 'Total Posts', value: stats.total, icon: <FileTextOutlined style={{ color: THEME.primary }} /> },
            { title: 'Published', value: stats.published, icon: <CheckCircleOutlined style={{ color: THEME.success }} /> },
            { title: 'Drafts', value: stats.drafts, icon: <SyncOutlined style={{ color: THEME.warning }} /> },
            { title: 'Total Views', value: stats.views, icon: <EyeOutlined style={{ color: THEME.info }} /> },
          ].map(s => (
            <Col xs={24} sm={12} md={6} key={s.title}>
              <Card className="shadow-sm"><Statistic title={s.title} value={s.value} prefix={s.icon} /></Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Filters */}
      <Card className="shadow-sm mb-4" bodyStyle={{ padding: '16px 24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Input prefix={<SearchOutlined className="text-gray-400" />} placeholder="Search title, content, tags..." value={searchText} onChange={handleSearch} allowClear size="large" />
          </Col>
          <Col xs={12} md={4}>
            <Select placeholder="Category" value={selectedCategory} onChange={(v) => handleFilterChange('category', v)} allowClear size="large" style={{ width: '100%' }}>
              <Option value="AI">🤖 AI</Option>
              <Option value="Real Estate">🏠 Real Estate</Option>
              <Option value="PropTech">📱 PropTech</Option>
              <Option value="Technology">💻 Technology</Option>
              <Option value="Business">💼 Business</Option>
              <Option value="Mortgage">🏦 Mortgage</Option>
              <Option value="Landscaping">🌳 Landscaping</Option>
              <Option value="Other">📌 Other</Option>
            </Select>
          </Col>
          <Col xs={12} md={4}>
            <Select placeholder="Status" value={selectedStatus} onChange={(v) => handleFilterChange('status', v)} allowClear size="large" style={{ width: '100%' }}>
              <Option value="published">✅ Published</Option>
              <Option value="draft">📝 Draft</Option>
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <Button icon={<UndoOutlined />} onClick={handleClearFilters}>Clear Filters</Button>
          </Col>
        </Row>
      </Card>

      {/* Blog List */}
      <div className="blog-list-container">
        {loading ? (
          <div style={{ marginTop: 30 }}>
            <Skeleton active avatar={{ size: 120, shape: 'square' }} paragraph={{ rows: 4 }} />
            <Skeleton active avatar={{ size: 120, shape: 'square' }} paragraph={{ rows: 4 }} style={{ marginTop: 20 }} />
          </div>
        ) : blogs.length === 0 ? (
          <Card className="shadow-sm"><Empty description="No blogs found" /></Card>
        ) : (
          <>
            {blogs.map(record => (
              <Card key={record._id} hoverable className="mb-4 shadow-sm" bodyStyle={{ padding: 0, overflow: 'hidden', borderRadius: 8, border: '1px solid #f0f0f0' }} style={{ marginBottom: 24 }}>
                <Row>
                  <Col xs={24} sm={24} md={8} lg={7} xl={6}>
                    <div style={{ width: '100%', height: '100%', minHeight: 260, backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {record.featuredImage
                        ? <img src={record.featuredImage} alt={record.title} style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: 260 }} />
                        : <FileTextOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
                      }
                    </div>
                  </Col>
                  <Col xs={24} sm={24} md={16} lg={17} xl={18} style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                        <Space wrap>
                          <Tag color="purple" style={{ padding: '4px 12px', fontSize: 13, borderRadius: 20 }}>{record.category || 'Uncategorized'}</Tag>
                          <Badge status={record.isPublished ? 'success' : 'warning'} text={<span style={{ fontWeight: 600, color: record.isPublished ? THEME.success : THEME.warning }}>{record.isPublished ? 'Published' : 'Draft'}</span>} />
                        </Space>
                        <Space size="middle">
                          <Tooltip title="Edit Post"><Button shape="circle" icon={<EditOutlined />} onClick={() => fetchBlogById(record._id)} /></Tooltip>
                          <Tooltip title="Preview Post"><Button shape="circle" icon={<EyeOutlined />} onClick={() => handleCardPreview(record)} /></Tooltip>
                          <Popconfirm title="Are you sure you want to delete this post?" onConfirm={() => deleteBlog(record._id)}>
                            <Tooltip title="Delete"><Button shape="circle" danger icon={<DeleteOutlined />} /></Tooltip>
                          </Popconfirm>
                        </Space>
                      </div>
                      <Title level={3} style={{ marginTop: 0, marginBottom: 8, color: '#1a1a2e', fontWeight: 700 }}>{record.title || 'Untitled Post'}</Title>
                      <Text type="secondary" style={{ display: 'block', marginBottom: 20, fontSize: 15, lineHeight: 1.6, color: '#555' }}>
                        {record.subHeading || 'No excerpt available...'}
                      </Text>
                      <div style={{ marginBottom: 20 }}>
                        {record.tags?.slice(0, 5).map(t => <Tag key={t} color="blue" style={{ borderRadius: 4 }}>#{t}</Tag>)}
                        {record.tags?.length > 5 && <Tag style={{ borderRadius: 4 }}>+{record.tags.length - 5} more</Tag>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: 16, flexWrap: 'wrap', gap: 12 }}>
                      <Space size="large">
                        <Space><Avatar size="default" src={record.authorImage} icon={<UserOutlined />} style={{ backgroundColor: THEME.primary }} /><Text strong style={{ fontSize: 14, color: '#333' }}>{record.authorName || 'Admin'}</Text></Space>
                        <Space><CalendarOutlined style={{ color: '#888' }} /><Text type="secondary" style={{ fontSize: 14 }}>{moment(record.createdAt).format('MMM DD, YYYY')}</Text></Space>
                      </Space>
                      <Space size="large">
                        <Space><ClockCircleOutlined style={{ color: '#888' }} /><Text type="secondary" style={{ fontSize: 14 }}>{record.readingTime || 2} min read</Text></Space>
                        <Space><EyeOutlined style={{ color: '#888' }} /><Text type="secondary" style={{ fontSize: 14 }}>{record.viewCount || 0} views</Text></Space>
                      </Space>
                    </div>
                  </Col>
                </Row>
              </Card>
            ))}

            {/* Pagination */}
            <div className="flex flex-col md:flex-row justify-between items-center mt-8 gap-4">
              <div className="text-sm text-gray-600">
                Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} to {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalResults)} of {pagination.totalResults}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => fetchBlogs(pagination.currentPage - 1, pagination.itemsPerPage, searchText, selectedCategory, selectedStatus)} disabled={pagination.currentPage === 1} className="px-3 py-1 border rounded-md text-gray-600 disabled:opacity-50">←</button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).slice(Math.max(0, pagination.currentPage - 3), pagination.currentPage + 2).map(page => (
                  <button key={page} onClick={() => fetchBlogs(page, pagination.itemsPerPage, searchText, selectedCategory, selectedStatus)} className={`px-4 py-1 rounded-md border ${pagination.currentPage === page ? 'bg-purple-700 text-white border-purple-700' : 'text-gray-700 border-gray-300 hover:bg-gray-100'}`}>{page}</button>
                ))}
                <button onClick={() => fetchBlogs(pagination.currentPage + 1, pagination.itemsPerPage, searchText, selectedCategory, selectedStatus)} disabled={pagination.currentPage === pagination.totalPages} className="px-3 py-1 border rounded-md text-gray-600 disabled:opacity-50">→</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      <Modal title={<div style={{ fontWeight: 700, fontSize: 16 }}>{editingId ? <EditOutlined /> : <PlusOutlined />} {editingId ? 'Edit Post' : 'Create New Post'}{lastSaved && autoSave && <Text type="secondary" style={{ fontSize: 12, marginLeft: 12 }}>Saved {moment(lastSaved).format('HH:mm:ss')}</Text>}</div>}
        open={modalVisible} onCancel={closeModal} footer={null} centered destroyOnClose width={screens.xs ? '95%' : 1050} bodyStyle={{ maxHeight: '82vh', overflowY: 'auto' }}>
        <Form form={form} layout="vertical" onFinish={handleSave} initialValues={{ category: 'Other', authorName: 'Admin' }}>
          <Tabs defaultActiveKey="content">

            {/* ── CONTENT TAB ── */}
            <TabPane tab={<span><EditOutlined /> Content</span>} key="content">
              <Form.Item name="title" label="Post Title" rules={[{ required: true, message: 'Title is required' }]}>
                <Input placeholder="Enter an engaging title" size="large" />
              </Form.Item>
              <Form.Item name="subHeading" label="Subheading / Excerpt">
                <TextArea rows={2} placeholder="Auto-filled from content — or write your own (max 160 chars)" maxLength={160} showCount />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="tags" label="Tags">
                    <Select mode="tags" size="large" placeholder="Add tags" tokenSeparators={[',']}>
                      {['AI', 'Real Estate', 'PropTech', 'Technology', 'Business', 'Mortgage', 'Landscaping', 'Marketing', 'UAE', 'Dubai'].map(tag => <Option key={tag} value={tag}>{tag}</Option>)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="category" label="Category">
                    <Select size="large" placeholder="Select category">
                      <Option value="AI">🤖 Artificial Intelligence</Option>
                      <Option value="Real Estate">🏠 Real Estate</Option>
                      <Option value="PropTech">📱 Property Technology</Option>
                      <Option value="Technology">💻 Technology</Option>
                      <Option value="Business">💼 Business</Option>
                      <Option value="Landscaping">🌳 Landscaping</Option>
                      <Option value="Mortgage">🏦 Mortgage</Option>
                      <Option value="Other">📄 Other</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item label="Blog Content" required>
                <Alert message="📋 Full Featured Editor — Word/Web se Text, Bullets, Images sab ekdum accurate paste hoga!" type="info" showIcon className="mb-3" />
                {smartFillApplied && <Alert message="✨ Smart Fill Active — fields auto-detected" type="success" showIcon closable onClose={() => setSmartFillApplied(false)} className="mb-3" />}
                
                {/* ── TINYMCE IMPLEMENTATION ── */}
                <Editor
                  tinymceScriptSrc="https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.3/tinymce.min.js"
                  value={contentValue}
                  onEditorChange={handleEditorChange}
                  init={{
                    height: 500,
                    menubar: true,
                    promotion: false, 
                    branding: false,  
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                      'insertdatetime', 'media', 'table', 'help', 'wordcount'
                    ],
                    toolbar: 'undo redo | blocks fontfamily fontsize | ' +
                      'bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter ' +
                      'alignright alignjustify | bullist numlist | link image media table | removeformat',
                      
                    images_upload_handler: async (blobInfo, progress) => {
                      try {
                        const file = blobInfo.blob();
                        const formData = new FormData();
                        formData.append('file', file);
                        const response = await apiService.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                        if (response.success) {
                          return response.url || response.file?.url;
                        } else {
                          throw new Error('Upload failed');
                        }
                      } catch (error) {
                        throw new Error('Image upload failed');
                      }
                    },
                    image_title: true,
                    automatic_uploads: true,
                    paste_data_images: true,
                    paste_as_text: false,
                    paste_retain_style_properties: "all",
                    paste_webkit_styles: "all",
                    paste_word_valid_elements: "b,strong,i,em,h1,h2,h3,h4,h5,h6,p,span,table,tbody,td,tfoot,th,thead,tr,ul,ol,li",
                    font_family_formats: 'Arial=arial,helvetica,sans-serif; Courier New=courier new,courier; Georgia=georgia,palatino; Helvetica=helvetica; Impact=impact,chicago; Symbol=symbol; Tahoma=tahoma,arial,helvetica,sans-serif; Times New Roman=times new roman,times; Verdana=verdana,geneva',
                    font_size_formats: '8pt 10pt 12pt 14pt 16pt 18pt 24pt 36pt',
                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px; line-height: 1.6; }'
                  }}
                />

                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                  {/* LIVE PREVIEW BUTTON FIX - preventDefault & type="button" to stop form submit */}
                  <Button 
                    htmlType="button" 
                    icon={<EyeOutlined />} 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      showPreview({}, true);
                    }}
                  >
                    Live Preview
                  </Button>
                </div>
              </Form.Item>
            </TabPane>

            {/* ── MEDIA TAB ── */}
            <TabPane tab={<span><PictureOutlined /> Media</span>} key="media">
              <Row gutter={16}>
                <Col span={12}>
                  <UploadWithCrop fileList={featuredImageList} onChange={setFeaturedImageList} aspect={3 / 2} cropTitle="Crop Featured Image (3:2)" maxSizeMB={5} label="Featured Image (Thumbnail)" extra="Recommended: 1200 × 800px · Max 5MB" />
                </Col>
                <Col span={12}>
                  <UploadWithCrop fileList={coverImageList} onChange={setCoverImageList} aspect={16 / 9} cropTitle="Crop Cover Image (16:9)" maxSizeMB={5} label="Cover Image (Hero Banner)" extra="Recommended: 1920 × 1080px · Max 5MB" />
                </Col>
              </Row>
            </TabPane>

            {/* ── AUTHOR TAB ── */}
            <TabPane tab={<span><UserOutlined /> Author</span>} key="author">
              <Row gutter={16}>
                <Col span={16}>
                  <Form.Item name="authorName" label="Author Name">
                    <Input prefix={<UserOutlined />} placeholder="Author name" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <UploadWithCrop fileList={authorImageList} onChange={setAuthorImageList} aspect={1} cropTitle="Crop Author Avatar (1:1)" maxSizeMB={2} label="Author Avatar" extra="Recommended: 400 × 400px · Max 2MB" />
                </Col>
              </Row>
            </TabPane>
          </Tabs>

          <Divider />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <Switch checked={autoSave} onChange={setAutoSave} />
              <Text type="secondary">Auto-save (30s)</Text>
            </Space>
            <Space>
              <Button size="large" onClick={() => { setTargetStatus('draft'); form.submit(); }} loading={saving}>Save as Draft</Button>
              <Button type="primary" onClick={() => { setTargetStatus('published'); form.submit(); }} loading={saving} size="large" icon={editingId ? <CheckCircleOutlined /> : <PlusOutlined />} style={{ backgroundColor: THEME.primary, borderColor: THEME.primary }}>
                {editingId ? 'Update & Publish' : 'Publish Blog'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* BLOG PREVIEW MODAL - zIndex fix added to show over the main modal */}
      <Modal 
        zIndex={2000} 
        open={previewModalVisible} 
        onCancel={() => setPreviewModalVisible(false)} 
        footer={null} 
        width={screens.xs ? '95%' : 860} 
        bodyStyle={{ maxHeight: '80vh', overflowY: 'auto', padding: '24px 32px' }} 
        centered
      >
        <BlogPreview data={previewBlogData} />
      </Modal>
    </div>
  );
};

export default BlogManagement;