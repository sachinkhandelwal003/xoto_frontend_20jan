// components/CMS/pages/estimate/CategoryManager/MasterCategory.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  Button,
  Space,
  Tag,
  Tooltip,
  Typography,
  Popconfirm,
  Input,
  Form,
  Modal,
  message,
  Row,
  Col,
  Statistic,
  Breadcrumb,
  Switch,
  InputNumber,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  RestOutlined,
  ArrowLeftOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  TagsOutlined,
  DatabaseOutlined,
  ReloadOutlined,
  AppstoreOutlined,
  HomeOutlined,
} from "@ant-design/icons";

import CustomTable from "../../../../components/CMS/pages/custom/CustomTable";
import { apiService } from "../../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;
const { TextArea } = Input;

const THEME = {
  primary: "#722ed1",
  secondary: "#1890ff",
  success: "#52c41a",
  warning: "#faad14",
  error: "#ff4d4f",
  bgLight: "#f9f0ff",
};

const API_BASE = "/estimate/master/category";

const capitalizeFirstLetter = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const MasterCategory = () => {
  const [level, setLevel] = useState("categories");
  const [parentCategory, setParentCategory] = useState(null);
  const [parentSubcategory, setParentSubcategory] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTrash, setShowTrash] = useState(false);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 100,
    totalItems: 0,
  });

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const stats = useMemo(() => ({
    total: pagination.totalItems,
    active: data.filter(d => d.isActive !== false && !d.is_deleted).length,
    trashed: data.filter(d => d.is_deleted || d.isActive === false).length,
  }), [data, pagination.totalItems]);

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 100,
        active: showTrash ? "false" : undefined,
      };

      let url = API_BASE;
      let response;

      if (level === "subcategories") {
        url = `${API_BASE}/${parentCategory}/subcategories`;
        response = await apiService.get(url, params);
        setData(response?.data || response?.subcategories || []);
      } else if (level === "types") {
        url = `${API_BASE}/${parentCategory}/subcategories/${parentSubcategory}/types`;
        response = await apiService.get(url, params);
        setData(response?.data || response?.types || []);
      } else {
        response = await apiService.get(url, params);
        setData(response?.categories || response?.data || []);
      }

      setPagination({
        currentPage: response?.pagination?.page || page,
        itemsPerPage: 100,
        totalItems: response?.pagination?.total || 0,
      });
    } catch {
      message.error("Failed to load data");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [level, parentCategory, parentSubcategory, showTrash]);

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  useEffect(() => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [level, parentCategory, parentSubcategory]);

  const handleDelete = async (id) => {
    try {
      let url = `${API_BASE}/${id}`;
      if (level === "subcategories") url = `${API_BASE}/${parentCategory}/subcategories/${id}`;
      if (level === "types") url = `${API_BASE}/${parentCategory}/subcategories/${parentSubcategory}/types/${id}`;
      await apiService.delete(url);
      message.success("Deactivated successfully");
      fetchData(1);
    } catch {
      message.error("Operation failed");
    }
  };

  const columns = useMemo(() => [
    {
      title: level === "categories" ? "Category Name" : level === "subcategories" ? "Subcategory" : "Type",
      key: "name",
      render: (_, r) => (
        <Space>
          {level === "categories" && <FolderOutlined />}
          {level === "subcategories" && <FolderOpenOutlined />}
          {level === "types" && <TagsOutlined />}
          <div>
            <b>{capitalizeFirstLetter(r.name || r.label)}</b>
            {r.description && <div>{capitalizeFirstLetter(r.description)}</div>}
          </div>
        </Space>
      ),
    },
    {
      title: "Status",
      render: (_, r) => (
        <Tag color={r.isActive !== false ? "green" : "orange"}>
          {r.isActive !== false ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Action",
      render: (_, r) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => { setSelectedItem(r); setEditModalOpen(true); }} />
          <Button icon={<EyeOutlined />} onClick={() => { setSelectedItem(r); setDetailsOpen(true); }} />
          <Popconfirm title="Deactivate?" onConfirm={() => handleDelete(r._id)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ], [level]);

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Category Architecture</Title>

      <CustomTable
        columns={columns}
        data={data}
        loading={loading}
        totalItems={pagination.totalItems}
        currentPage={pagination.currentPage}
        pageSize={100}
        onPageChange={(p) => fetchData(p)}
      />

      <Modal open={detailsOpen} onCancel={() => setDetailsOpen(false)} footer={null}>
        {selectedItem && (
          <div>
            <p><b>ID:</b> {selectedItem._id}</p>
            <p><b>Name:</b> {capitalizeFirstLetter(selectedItem.name || selectedItem.label)}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MasterCategory;
