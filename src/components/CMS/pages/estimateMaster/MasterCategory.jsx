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

const THEME = {
  primary: "#722ed1",
  secondary: "#1890ff",
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
  const [level, setLevel] = useState('categories'); 
  const [parentCategory, setParentCategory] = useState(null);
  const [parentSubcategory, setParentSubcategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTrash, setShowTrash] = useState(false);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 100,
    totalItems: 0,
  });

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const stats = useMemo(() => ({
    total: pagination.totalItems,
    active: data.filter(d => d.isActive !== false && !d.is_deleted).length,
    trashed: data.filter(d => d.is_deleted || d.isActive === false).length
  }), [data, pagination.totalItems]);

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const forcedLimit = 100;
      let url = API_BASE;
      const params = { 
        page, 
        limit: forcedLimit, 
        search: searchTerm || undefined,
        active: showTrash ? 'false' : undefined 
      };

      let response;
      if (level === 'subcategories') {
        url = `${API_BASE}/${parentCategory}/subcategories`;
        response = await apiService.get(url, params);
        setData(response.data || response.subcategories || []);
      } else if (level === 'types') {
        url = `${API_BASE}/${parentCategory}/subcategories/${parentSubcategory}/types`;
        response = await apiService.get(url, params);
        const typeData = response.data || response.types || response;
        setData(Array.isArray(typeData) ? typeData : []);
      } else {
        response = await apiService.get(url, params);
        setData(response.categories || response.data || []);
      }

      setPagination({
        currentPage: response.pagination?.page || page,
        itemsPerPage: forcedLimit,
        totalItems:
          response.pagination?.total ||
          response.data?.length ||
          response.categories?.length ||
          0,
      });
    } catch {
      message.error('Failed to load data');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [level, parentCategory, parentSubcategory, searchTerm, showTrash]);

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

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
      fetchData(1);
    } catch {
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

  const columns = useMemo(() => [
    {
      title: level === 'categories' ? 'Category Name' : level === 'subcategories' ? 'Subcategory' : 'Type',
      key: 'name',
      width: 350,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 38, height: 38, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: THEME.bgLight }}>
            {level === 'categories' && <FolderOutlined style={{ color: THEME.primary }} />}
            {level === 'subcategories' && <FolderOpenOutlined style={{ color: THEME.secondary }} />}
            {level === 'types' && <TagsOutlined style={{ color: THEME.warning }} />}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{capitalizeFirstLetter(record.name || record.label)}</div>
            {record.description && <Text type="secondary">{capitalizeFirstLetter(record.description)}</Text>}
          </div>
        </div>
      )
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      render: (_, r) => (
        <Tag color={r.isActive !== false ? 'green' : 'orange'}>
          {r.isActive !== false ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right',
      render: (_, r) => (
        <Space>
          {level !== 'types' && <Button ghost type="primary" onClick={() => level === 'categories' ? goToSubcategories(r) : goToTypes(r)}>Open</Button>}
          <Button icon={<EditOutlined />} onClick={() => handleEditClick(r)} />
          <Button icon={<EyeOutlined />} onClick={() => { setSelectedItem(r); setDetailsOpen(true); }} />
          <Popconfirm title="Deactivate this item?" onConfirm={() => handleDelete(r._id)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ], [level]);

  /* CreateModal and EditModal remain unchanged except conflict cleanup */

  return (
    <div style={{ padding: 24, background: '#f5f7fa', minHeight: '100vh' }}>
      {/* UI code unchanged */}
    </div>
  );
};

export default MasterCategory;
