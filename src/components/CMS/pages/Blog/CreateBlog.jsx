import React, { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from "../../../../manageApi/utils/custom.apiservice";
import JoditEditor from 'jodit-react';
import DOMPurify from 'dompurify';
import moment from 'moment';

import {
  Button, Modal, Form, Input, Popconfirm, Card, Table,
  Typography, Avatar, Row, Col, Statistic, Space, Divider,
  message, notification, Tooltip, Grid, Tag, Select, Badge,
  Upload, Tabs, Alert, Switch, Dropdown, Menu
} from 'antd';
import {
  PlusOutlined, FileTextOutlined, DeleteOutlined,
  EditOutlined, SearchOutlined, CheckCircleOutlined, SyncOutlined,
  UserOutlined, PictureOutlined, EyeOutlined, ClockCircleOutlined,
  CopyOutlined, SaveOutlined, UndoOutlined,
  MoreOutlined, TagOutlined, BookOutlined, LinkOutlined,
  CalendarOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;
const { TextArea } = Input;
const { TabPane } = Tabs;

const THEME = {
  primary: "#7c3aed",
  success: "#10b981",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6"
};

// ─────────────────────────────────────────────
//  PASTE CLEANER & SMART AUTO-FILL
// ─────────────────────────────────────────────
const cleanWordHtml = (html) => {
  if (!html) return '';
  let c = html;
  // 🚨 FIXED REGEX ERROR HERE 🚨
  c = c.replace(/<!--\[if !supportLists\]-->.*?<!\[endif\]-->/gs, '');
  c = c.replace(/<!--\[if gte mso.*?\]-->/gs, '');
  c = c.replace(/<o:p>.*?<\/o:p>/gs, '');
  c = c.replace(/<style[^>]*>.*?<\/style>/gs, '');
  c = c.replace(/<meta[^>]*>/gs, '');
  c = c.replace(/<\?xml[^?]*\?>/gs, '');
  c = c.replace(/mso-[^;:"']+;?/g, '');
  return c;
};

const CATEGORY_KEYWORDS = {
  'AI': ['artificial intelligence', 'machine learning', 'deep learning', 'neural network', 'chatgpt', 'llm', 'ai ', ' ai,', 'automation', 'nlp', 'generative'],
  'Real Estate': ['property', 'real estate', 'housing', 'apartment', 'villa', 'rent', 'lease', 'mortgage', 'broker', 'land', 'plot', 'realty'],
  'PropTech': ['proptech', 'property technology', 'smart home', 'iot', 'digital property', 'virtual tour', 'property app'],
  'Technology': ['software', 'programming', 'javascript', 'react', 'node', 'cloud', 'saas', 'startup', 'tech', 'developer', 'api', 'database'],
  'Business': ['business', 'startup', 'entrepreneur', 'investment', 'revenue', 'marketing', 'sales', 'strategy', 'growth'],
};

const COMMON_TAGS = [
  'AI', 'Real Estate', 'PropTech', 'Technology', 'Business', 'Marketing',
  'UAE', 'Dubai', 'Sustainability', 'Innovation', 'Digital', 'Cloud',
  'Investment', 'Architecture', 'Design', 'Smart Home', 'Automation'
];

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

  const headings = [];
  const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h\1>/gi;
  let match;
  while ((match = headingRegex.exec(html)) !== null) {
    headings.push({ level: parseInt(match[1]), text: match[2].replace(/<[^>]*>/g, '').trim() });
  }

  const paraMatch = html.match(/<p[^>]*>(.*?)<\/p>/i);
  let excerpt = '';
  if (paraMatch) {
    excerpt = paraMatch[1].replace(/<[^>]*>/g, '').trim().substring(0, 160);
  }

  const links = [];
  const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/gi;
  while ((match = linkRegex.exec(html)) !== null) {
    links.push({ href: match[1], text: match[2].replace(/<[^>]*>/g, '').trim() });
  }

  const wordCount = text.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);

  return { detectedCategory, detectedTags, headings, excerpt, links, wordCount, readingTime };
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
//  JODIT EDITOR CONFIG
// ─────────────────────────────────────────────
const editorConfig = {
  readonly: false,
  placeholder: 'Write here, or paste from Word/PDF. Formatting will be preserved automatically...',
  height: 400,
  enableDragAndDropFileToEditor: true,
  uploader: {
    insertImageAsBase64URI: true
  },
  toolbarSticky: false,
  askBeforePasteHTML: false,
  askBeforePasteFromWord: false,
  defaultActionOnPaste: 'insert_as_html',
};

// ─────────────────────────────────────────────
//  IMAGE HELPERS
// ─────────────────────────────────────────────
const validateImage = (file, minMB = 0.1, maxMB = 5) => {
  const ok = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type);
  if (!ok) { message.error('Only JPG, PNG, WEBP allowed'); return Upload.LIST_IGNORE; }
  if (file.size / 1024 / 1024 > maxMB) { message.error(`Max ${maxMB}MB`); return Upload.LIST_IGNORE; }
  return false;
};

const getBase64 = (file) => new Promise((res, rej) => {
  const r = new FileReader(); r.readAsDataURL(file);
  r.onload = () => res(r.result); r.onerror = rej;
});

// ─────────────────────────────────────────────
//  BEAUTIFUL PREVIEW COMPONENT
// ─────────────────────────────────────────────
const BlogPreview = ({ data }) => {
  if (!data) return null;
  const { title, subHeading, content, authorName, authorImage, tags, category,
    featuredImage, coverImage, createdAt, readingTime, headings } = data;

  return (
    <div style={{ fontFamily: "'Georgia', serif", color: '#1a1a2e', background: '#fff' }}>
      {coverImage && (
        <div style={{ width: '100%', height: 280, overflow: 'hidden', borderRadius: 12, marginBottom: 28, background: '#f0f0f0' }}>
          <img src={coverImage} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      <div style={{ marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        {category && (
          <Tag color="purple" style={{ fontSize: 12, padding: '2px 10px', borderRadius: 20 }}>
            {category}
          </Tag>
        )}
        {tags?.map(tag => (
          <Tag key={tag} color="blue" style={{ fontSize: 11, borderRadius: 20 }}>#{tag}</Tag>
        ))}
      </div>

      <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.25, color: '#0f0f23', marginBottom: 12, fontFamily: "'Georgia', serif" }}>
        {title || 'Untitled Post'}
      </h1>

      {subHeading && (
        <p style={{ fontSize: 18, color: '#555', lineHeight: 1.6, marginBottom: 20, fontStyle: 'italic', borderLeft: '4px solid #7c3aed', paddingLeft: 16 }}>
          {subHeading}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderTop: '1px solid #eee', borderBottom: '1px solid #eee', marginBottom: 24 }}>
        <Avatar size={42} src={authorImage} icon={<UserOutlined />} style={{ backgroundColor: '#7c3aed' }} />
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
          <div style={{ fontWeight: 700, fontSize: 14, color: '#7c3aed', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <BookOutlined /> Table of Contents
          </div>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            {headings.filter(h => h.level <= 3).map((h, i) => (
              <li key={i} style={{ marginLeft: `${(h.level - 1) * 16}px`, fontSize: 13, padding: '3px 0', color: '#5b21b6' }}>
                {h.text}
              </li>
            ))}
          </ol>
        </div>
      )}

      <div
        className="blog-preview-content"
        style={{ lineHeight: 1.85, fontSize: 16, color: '#1f1f1f' }}
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(content || '', {
            ADD_TAGS: ['iframe'],
            ADD_ATTR: ['allow', 'allowfullscreen', 'target'],
          }),
        }}
      />

      {tags?.length > 0 && (
        <div style={{ marginTop: 36, paddingTop: 20, borderTop: '1px solid #eee' }}>
          <Text style={{ fontSize: 13, color: '#888', marginRight: 8 }}><TagOutlined /> Tags:</Text>
          {tags.map(tag => <Tag key={tag} color="geekblue" style={{ borderRadius: 20 }}>#{tag}</Tag>)}
        </div>
      )}

      <style>{`
        .blog-preview-content h1 { font-size: 28px; font-weight: 800; margin: 28px 0 12px; color: #0f0f23; }
        .blog-preview-content h2 { font-size: 22px; font-weight: 700; margin: 24px 0 10px; color: #1a1a2e; border-bottom: 2px solid #e0d0ff; padding-bottom: 6px; }
        .blog-preview-content h3 { font-size: 18px; font-weight: 600; margin: 20px 0 8px; color: #3d2c8d; }
        .blog-preview-content p { margin: 0 0 16px; }
        .blog-preview-content ul, .blog-preview-content ol { padding-left: 24px; margin: 0 0 16px; }
        .blog-preview-content li { margin-bottom: 6px; }
        .blog-preview-content blockquote { border-left: 4px solid #7c3aed; margin: 20px 0; padding: 10px 20px; background: #faf5ff; border-radius: 0 8px 8px 0; color: #555; font-style: italic; }
        .blog-preview-content a { color: #7c3aed; text-decoration: underline; }
        .blog-preview-content img { max-width: 100%; border-radius: 8px; margin: 16px 0; }
        .blog-preview-content pre, .blog-preview-content code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 14px; font-family: monospace; }
        .blog-preview-content pre { padding: 16px; overflow-x: auto; margin: 16px 0; }
        .blog-preview-content strong { color: #0f0f23; }
        .blog-preview-content table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        .blog-preview-content th, .blog-preview-content td { border: 1px solid #e0d0ff; padding: 10px 14px; text-align: left; }
        .blog-preview-content th { background: #f8f4ff; font-weight: 600; }
      `}</style>
    </div>
  );
};

// ─────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────
const BlogManagement = () => {
  const screens = useBreakpoint();
  const quillRef = useRef(null);

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
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
  const [detectedLinks, setDetectedLinks] = useState([]);

  const [featuredImageList, setFeaturedImageList] = useState([]);
  const [coverImageList, setCoverImageList] = useState([]);
  const [authorImageList, setAuthorImageList] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const [stats, setStats] = useState({ total: 0, published: 0, drafts: 0, views: 0 });

  const handleSmartPaste = useCallback((event) => {
    const clipboardData = event.clipboardData;
    const pastedHtml = clipboardData.getData('text/html');
    const pastedText = clipboardData.getData('text/plain');

    const finalHtml = pastedHtml || pastedText;

    if (finalHtml) {
      const extracted = smartExtract(cleanWordHtml(finalHtml));
      const currentValues = form.getFieldsValue();
      const updates = {};

      if (!currentValues.subHeading && extracted.excerpt) updates.subHeading = extracted.excerpt;
      if ((!currentValues.category || currentValues.category === 'Other') && extracted.detectedCategory !== 'Other') updates.category = extracted.detectedCategory;
      if ((!currentValues.tags || currentValues.tags.length === 0) && extracted.detectedTags.length > 0) updates.tags = extracted.detectedTags;

      if (Object.keys(updates).length > 0) {
        form.setFieldsValue(updates);
        setSmartFillApplied(true);
        notification.info({
          message: '✨ Smart Fill Applied',
          description: `Auto-filled: ${Object.keys(updates).join(', ')}.`,
          placement: 'topRight',
          duration: 4
        });
      }

      if (extracted.links && extracted.links.length > 0) setDetectedLinks(extracted.links);
    }
  }, [form]);


  const handleEditorChange = (value) => {
    setContentValue(value);
    setHeadings(extractHeadings(value));

    const sub = form.getFieldValue('subHeading');
    if (!sub && value && value !== '<p><br></p>') {
      const exc = extractExcerpt(value, 160);
      if (exc) form.setFieldsValue({ subHeading: exc });
    }
  };

  useEffect(() => {
    let t;
    if (autoSave && contentValue && modalVisible) {
      t = setTimeout(() => handleAutoSave(), 30000);
    }
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
          form.setFieldsValue({ title: d.title, subHeading: d.subHeading, tags: d.tags, category: d.category, status: d.status, authorName: d.authorName });
          setContentValue(d.content || '');
          setHeadings(d.headings || []);
          message.success('Draft restored');
        }
      });
    } catch (_) {}
  };

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/blogs/get-all-blogs?page=${currentPage}&limit=${pageSize}`;
      if (searchText) url += `&search=${encodeURIComponent(searchText)}`;
      if (selectedCategory) url += `&category=${selectedCategory}`;
      if (selectedStatus) url += `&isPublished=${selectedStatus === 'published'}`;

      const response = await apiService.get(url);
      if (response.success) {
        setBlogs(response.data);
        setTotal(response.pagination.total);
        setStats({
          total: response.pagination.total,
          published: response.data.filter(b => b.isPublished).length,
          drafts: response.data.filter(b => !b.isPublished).length,
          views: response.data.reduce((s, b) => s + (b.viewCount || 0), 0),
        });
      }
    } catch (e) {
      message.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchText, selectedCategory, selectedStatus]);

  useEffect(() => {
    const t = setTimeout(() => fetchBlogs(), 400);
    return () => clearTimeout(t);
  }, [fetchBlogs]);

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
          status: blog.isPublished ? 'published' : 'draft',
          authorName: blog.authorName || 'Admin',
        });

        setContentValue(finalContent);
        setHeadings(extractHeadings(finalContent));
        setFeaturedImageList(blog.featuredImage ? [{ uid: '-1', name: 'featured', status: 'done', url: blog.featuredImage }] : []);
        setCoverImageList(blog.coverImage ? [{ uid: '-1', name: 'cover', status: 'done', url: blog.coverImage }] : []);
        setAuthorImageList(blog.authorImage ? [{ uid: '-1', name: 'author', status: 'done', url: blog.authorImage }] : []);
        setEditingId(id);
        setModalVisible(true);
        setTimeout(() => loadDraft(), 100);
      } else {
        message.error(response.message || 'Failed to fetch details');
      }
    } catch (err) {
      message.error('Failed to fetch blog details');
    } finally {
      setLoading(false);
    }
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
    if (imageList[0].url) return imageList[0].url;
    if (imageList[0].originFileObj) return await uploadFile(imageList[0].originFileObj);
    return '';
  };

  const handleSave = async (values) => {
    if (!contentValue || contentValue === '<p><br></p>') {
      message.error('Please add content to your blog');
      return;
    }
    setSaving(true);
    try {
      const [featuredUrl, coverUrl, authorImgUrl] = await Promise.all([
        processImage(featuredImageList),
        processImage(coverImageList),
        processImage(authorImageList),
      ]);

      const payload = {
        title: values.title,
        subHeading: values.subHeading || extractExcerpt(contentValue, 160),
        content: contentValue,
        authorName: values.authorName || 'Admin',
        authorImage: authorImgUrl,
        isPublished: values.status === 'published',
        tags: values.tags || [],
        category: values.category || 'Other',
        featuredImage: featuredUrl,
        coverImage: coverUrl,
      };

      if (values.status === 'published') payload.publishedAt = new Date().toISOString();

      const response = editingId
        ? await apiService.put(`/blogs/edit-blog-by-id?id=${editingId}`, payload)
        : await apiService.post('/blogs/create-blog', payload);

      if (response.success) {
        notification.success({
          message: editingId ? 'Blog Updated' : 'Blog Created',
          description: `"${values.title}" ${editingId ? 'updated' : 'created'} successfully`,
          placement: 'topRight',
          duration: 3,
        });
        localStorage.removeItem(`blog_draft_${editingId || 'new'}`);
        closeModal();
        fetchBlogs();
      } else {
        message.error(response.message || 'Operation failed');
      }
    } catch (err) {
      message.error(err.message || 'Failed to save blog');
    } finally {
      setSaving(false);
    }
  };

  const deleteBlog = async (id) => {
    try {
      const r = await apiService.delete(`/blogs/delete-blog-by-id?id=${id}`);
      if (r.success) { message.success('Deleted successfully'); fetchBlogs(); }
      else message.error('Delete failed');
    } catch { message.error('Deletion failed'); }
  };

  const duplicateBlog = async (blog) => {
    try {
      const payload = { ...blog, title: `${blog.title} (Copy)`, isPublished: false, viewCount: 0 };
      delete payload._id; delete payload.createdAt; delete payload.updatedAt; delete payload.slug;
      const r = await apiService.post('/blogs/create-blog', payload);
      if (r.success) { message.success('Blog duplicated'); fetchBlogs(); }
    } catch { message.error('Failed to duplicate'); }
  };

  const exportBlog = (blog) => {
    const uri = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(blog, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', uri);
    a.setAttribute('download', `${blog.slug || blog.title}.json`);
    a.click();
    message.success('Exported');
  };

  const showPreview = (blog) => {
    const formVals = form.getFieldsValue();
    const data = blog._id
      ? {
          ...blog,
          headings: extractHeadings(blog.content),
          readingTime: Math.ceil((blog.content || '').replace(/<[^>]*>/g, '').split(/\s+/).length / 200),
        }
      : {
          title: formVals.title || 'Untitled',
          subHeading: formVals.subHeading,
          content: contentValue,
          authorName: formVals.authorName,
          tags: formVals.tags,
          category: formVals.category,
          featuredImage: featuredImageList[0]?.url || featuredImageList[0]?.preview,
          coverImage: coverImageList[0]?.url || coverImageList[0]?.preview,
          headings,
          createdAt: new Date(),
          readingTime: Math.ceil(contentValue.replace(/<[^>]*>/g, '').split(/\s+/).length / 200),
        };
    setPreviewBlogData(data);
    setPreviewModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingId(null);
    setFeaturedImageList([]); setCoverImageList([]); setAuthorImageList([]);
    setContentValue(''); setHeadings([]); setDetectedLinks([]);
    setSmartFillApplied(false); setLastSaved(null);
    form.resetFields();
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) file.preview = await getBase64(file.originFileObj);
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  const columns = [
    {
      title: 'Blog Details', dataIndex: 'title', key: 'title', width: 320,
      render: (text, record) => (
        <Space direction="vertical" size={2}>
          <Space>
            {record.featuredImage
              ? <Avatar shape="square" size={48} src={record.featuredImage} />
              : <Avatar shape="square" size={48} icon={<FileTextOutlined />} style={{ backgroundColor: THEME.primary }} />}
            <div>
              <Text strong style={{ fontSize: 14 }}>{text || 'Untitled'}</Text>
              {record.subHeading && <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>{record.subHeading.substring(0, 60)}...</Text>}
              <Space size={8}>
                <Text type="secondary" style={{ fontSize: 11 }}><ClockCircleOutlined /> {record.readingTime || 2} min</Text>
                <Text type="secondary" style={{ fontSize: 11 }}><EyeOutlined /> {record.viewCount || 0}</Text>
              </Space>
            </div>
          </Space>
        </Space>
      )
    },
    {
      title: 'Category', dataIndex: 'category', key: 'category', width: 120,
      render: (c) => <Tag color="purple">{c || 'Uncategorized'}</Tag>
    },
    {
      title: 'Tags', dataIndex: 'tags', key: 'tags', width: 180,
      render: (tags) => (
        <Space wrap size={[0, 4]}>
          {tags?.slice(0, 2).map(t => <Tag key={t} color="blue">{t}</Tag>)}
          {tags?.length > 2 && <Tag>+{tags.length - 2}</Tag>}
        </Space>
      )
    },
    {
      title: 'Author', dataIndex: 'authorName', key: 'authorName', width: 150,
      render: (name, record) => (
        <Space>
          <Avatar size="small" src={record.authorImage} icon={<UserOutlined />} />
          <Text>{name || 'Admin'}</Text>
        </Space>
      )
    },
    {
      title: 'Date', dataIndex: 'createdAt', key: 'createdAt', width: 120,
      render: (d) => moment(d).format('MMM DD, YYYY')
    },
    {
      title: 'Status', dataIndex: 'isPublished', key: 'isPublished', width: 100,
      render: (p) => <Badge status={p ? 'success' : 'warning'} text={p ? 'Published' : 'Draft'} />
    },
    {
      title: 'Actions', key: 'actions', align: 'center', width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button type="text" icon={<EditOutlined style={{ color: THEME.primary }} />} onClick={() => fetchBlogById(record._id)} />
          </Tooltip>
          <Tooltip title="Full Preview">
            <Button type="text" icon={<EyeOutlined style={{ color: THEME.info }} />} onClick={() => showPreview(record)} />
          </Tooltip>
          <Dropdown overlay={
            <Menu>
              <Menu.Item key="dup" icon={<CopyOutlined />} onClick={() => duplicateBlog(record)}>Duplicate</Menu.Item>
              <Menu.Item key="exp" icon={<FileTextOutlined />} onClick={() => exportBlog(record)}>Export JSON</Menu.Item>
            </Menu>
          }>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
          <Popconfirm title="Delete this post?" onConfirm={() => deleteBlog(record._id)}>
            <Tooltip title="Delete">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    },
  ];

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <Title level={3} style={{ margin: 0 }}>📝 Blog Management</Title>
            <Text type="secondary">Create, manage, and publish content</Text>
          </div>
          <Button
            type="primary" size="large" icon={<PlusOutlined />}
            onClick={() => {
              setEditingId(null); form.resetFields();
              setFeaturedImageList([]); setCoverImageList([]); setAuthorImageList([]);
              setContentValue(''); setHeadings([]); setDetectedLinks([]);
              setSmartFillApplied(false);
              setModalVisible(true);
              setTimeout(() => loadDraft(), 100);
            }}
            style={{ backgroundColor: THEME.primary, borderColor: THEME.primary }}
          >
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
              <Card className="shadow-sm">
                <Statistic title={s.title} value={s.value} prefix={s.icon} />
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <Card className="shadow-sm mb-4">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Input prefix={<SearchOutlined />} placeholder="Search title, content, tags..." value={searchText} onChange={e => setSearchText(e.target.value)} allowClear size="large" />
          </Col>
          <Col xs={12} md={4}>
            <Select placeholder="Category" value={selectedCategory} onChange={setSelectedCategory} allowClear size="large" style={{ width: '100%' }}>
              <Option value="AI">🤖 AI</Option>
              <Option value="Real Estate">🏠 Real Estate</Option>
              <Option value="PropTech">📱 PropTech</Option>
              <Option value="Technology">💻 Technology</Option>
              <Option value="Business">💼 Business</Option>
            </Select>
          </Col>
          <Col xs={12} md={4}>
            <Select placeholder="Status" value={selectedStatus} onChange={setSelectedStatus} allowClear size="large" style={{ width: '100%' }}>
              <Option value="published">✅ Published</Option>
              <Option value="draft">📝 Draft</Option>
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <Button icon={<UndoOutlined />} onClick={() => { setSearchText(''); setSelectedCategory(''); setSelectedStatus(''); }}>Clear Filters</Button>
          </Col>
        </Row>
      </Card>

      <Card className="shadow-sm" bodyStyle={{ padding: 0 }}>
        <Table columns={columns} dataSource={blogs} loading={loading} rowKey="_id" scroll={{ x: 1200 }}
          pagination={{ current: currentPage, pageSize, total, showSizeChanger: true, showTotal: t => `Total ${t} posts`, onChange: (p, s) => { setCurrentPage(p); setPageSize(s); } }}
        />
      </Card>

      <Modal
        title={
          <div style={{ fontWeight: 700, fontSize: 16 }}>
            {editingId ? <EditOutlined /> : <PlusOutlined />} {editingId ? 'Edit Post' : 'Create New Post'}
            {lastSaved && autoSave && <Text type="secondary" style={{ fontSize: 12, marginLeft: 12 }}>Saved {moment(lastSaved).format('HH:mm:ss')}</Text>}
          </div>
        }
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        centered
        destroyOnClose
        width={screens.xs ? '95%' : 1050}
        bodyStyle={{ maxHeight: '82vh', overflowY: 'auto' }}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} initialValues={{ status: 'draft', category: 'Other', authorName: 'Admin' }}>
          <Tabs defaultActiveKey="content">
            <TabPane tab={<span><EditOutlined /> Content</span>} key="content">
              <Row gutter={16}>
                <Col span={16}>
                  <Form.Item name="title" label="Post Title" rules={[{ required: true, message: 'Title is required' }]}>
                    <Input placeholder="Enter an engaging title" size="large" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="status" label="Status">
                    <Select size="large">
                      <Option value="draft">📝 Draft</Option>
                      <Option value="published">🚀 Publish Now</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="subHeading" label="Subheading / Excerpt">
                <TextArea rows={2} placeholder="Auto-filled from content — or write your own (max 160 chars)" maxLength={160} showCount />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="tags" label="Tags (auto-detected from paste, editable)">
                    <Select mode="tags" size="large" placeholder="Add tags" tokenSeparators={[',']}>
                      {['AI', 'Real Estate', 'PropTech', 'Technology', 'Business', 'Marketing', 'UAE', 'Dubai'].map(tag => <Option key={tag} value={tag}>{tag}</Option>)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="category" label="Category (auto-detected from paste, editable)">
                    <Select size="large" placeholder="Select category">
                      <Option value="AI">🤖 Artificial Intelligence</Option>
                      <Option value="Real Estate">🏠 Real Estate</Option>
                      <Option value="PropTech">📱 Property Technology</Option>
                      <Option value="Technology">💻 Technology</Option>
                      <Option value="Business">💼 Business</Option>
                      <Option value="Other">📄 Other</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Blog Content" required>
                <Alert message="📋 Paste from Word, PDF, Google Docs — formatting is preserved & tags auto-fill!" type="info" showIcon className="mb-3" />
                {smartFillApplied && <Alert message="✨ Smart Fill Active — fields auto-detected" type="success" showIcon closable onClose={() => setSmartFillApplied(false)} className="mb-3" />}

                <div className="border rounded-lg" onPaste={handleSmartPaste}>
                  <JoditEditor
                    ref={quillRef}
                    value={contentValue}
                    config={editorConfig}
                    onChange={handleEditorChange}
                  />
                </div>

                <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button icon={<EyeOutlined />} onClick={() => showPreview({})} disabled={!contentValue || contentValue === '<p><br></p>'}>Live Preview</Button>
                </div>
              </Form.Item>

              {headings.length > 0 && (
                <Alert
                  message="📚 Table of Contents Detected"
                  description={<ul style={{ marginBottom: 0 }}>{headings.map((h, i) => <li key={i} style={{ marginLeft: `${(h.level - 1) * 20}px` }}><Tag color="purple">H{h.level}</Tag> {h.text}</li>)}</ul>}
                  type="success" showIcon className="mt-2"
                />
              )}
            </TabPane>

            <TabPane tab={<span><PictureOutlined /> Media</span>} key="media">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Featured Image (Thumbnail)">
                    <Upload listType="picture-card" fileList={featuredImageList} onPreview={handlePreview} onChange={({ fileList }) => setFeaturedImageList(fileList)} beforeUpload={f => validateImage(f, 0.1, 5)} maxCount={1}>
                      {featuredImageList.length < 1 && <div><PlusOutlined /><div style={{ marginTop: 8 }}>Upload</div></div>}
                    </Upload>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Cover Image (Hero Banner)">
                    <Upload listType="picture-card" fileList={coverImageList} onPreview={handlePreview} onChange={({ fileList }) => setCoverImageList(fileList)} beforeUpload={f => validateImage(f, 0.1, 5)} maxCount={1}>
                      {coverImageList.length < 1 && <div><PlusOutlined /><div style={{ marginTop: 8 }}>Upload</div></div>}
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab={<span><UserOutlined /> Author</span>} key="author">
              <Row gutter={16}>
                <Col span={16}>
                  <Form.Item name="authorName" label="Author Name">
                    <Input prefix={<UserOutlined />} placeholder="Author name" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Author Avatar">
                    <Upload listType="picture-card" fileList={authorImageList} onPreview={handlePreview} onChange={({ fileList }) => setAuthorImageList(fileList)} beforeUpload={f => validateImage(f, 0.05, 2)} maxCount={1}>
                      {authorImageList.length < 1 && <UserOutlined />}
                    </Upload>
                  </Form.Item>
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
              <Button size="large" icon={<EyeOutlined />} onClick={() => showPreview({})}>Preview</Button>
              <Button size="large" onClick={closeModal}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={saving} size="large" icon={<SaveOutlined />} style={{ backgroundColor: THEME.primary, borderColor: THEME.primary }}>
                {editingId ? 'Update Blog' : 'Publish Blog'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      <Modal
        title={
          <Space>
            <EyeOutlined style={{ color: THEME.primary }} />
            <span style={{ fontWeight: 700 }}>Blog Preview</span>
          </Space>
        }
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>Close</Button>
        ]}
        width={screens.xs ? '95%' : 860}
        bodyStyle={{ maxHeight: '80vh', overflowY: 'auto', padding: '24px 32px' }}
        centered
      >
        <BlogPreview data={previewBlogData} />
      </Modal>

      <Modal open={previewOpen} title="Image Preview" footer={null} onCancel={() => setPreviewOpen(false)}>
        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  );
};

export default BlogManagement;