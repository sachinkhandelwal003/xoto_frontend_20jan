import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Table,
  Tag,
  Button,
  Row,
  Col,
  Select,
  Input,
  Upload,
  message,
  Space,
  Popconfirm,
  Modal,
  Form,
  InputNumber,
  Tabs,Divider 
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  UploadOutlined,
  FileAddOutlined,
  PieChartOutlined,
  TableOutlined,
  EditOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

export default function DeveloperInventory() {
  const navigate = useNavigate();
  const developerId = localStorage.getItem("developerId");

  const [units, setUnits] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("table");
  
  // Modal states
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  
  // Filter states
  const [selectedUnitType, setSelectedUnitType] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  /* ---------------- FETCH PROJECTS ---------------- */
  const fetchProjects = async () => {
    try {
      const res = await apiService.get(
        `/property/developers/${developerId}/properties`
      );

      if (res.success) {
        const options = res.data.map((p) => ({
          label: p.propertyName,
          value: p._id
        }));
        setProjects(options);
      }
    } catch {
      message.error("Failed to load projects");
    }
  };

  /* ---------------- FETCH INVENTORY WITH STATS ---------------- */
  const fetchInventory = async (projectId, page = 1, limit = 10) => {
    if (!projectId) return;

    setLoading(true);

    try {
      // Build query params with filters
      const params = new URLSearchParams({
        page,
        limit
      });
      
      if (selectedUnitType) params.append("unitType", selectedUnitType);
      if (selectedStatus) params.append("status", selectedStatus);

      const res = await apiService.get(
        `/property/inventory/property/${projectId}?${params.toString()}`
      );

      if (res.success) {
        const inventoryData = res.data.units || [];
        const pagination = res.data.pagination || {};
        const statsData = res.data.stats || {};
        
        const formatted = inventoryData.map((item) => ({
          key: item._id,
          _id: item._id,
          unitId: item.unitId,
          tower: item.tower,
          floor: item.floor,
          unitType: item.unitType,
          bedrooms: item.bedrooms,
          bathrooms: item.bathrooms,
          area: item.area,
          price: item.price,
          view: item.view,
          facing: item.facing,
          status: item.status,
          agentId: item.agentId,
          leadId: item.leadId,
          createdAt: item.createdAt
        }));

        setUnits(formatted);
        setStats(statsData);
        setTotalItems(pagination.totalItems || 0);
        setCurrentPage(pagination.currentPage || 1);
        setPageSize(pagination.itemsPerPage || limit);
      }
    } catch (error) {
      console.error("Fetch inventory error:", error);
      message.error("Failed to load inventory");
    }

    setLoading(false);
  };

  /* ---------------- CREATE INVENTORY ---------------- */
  const handleCreateInventory = async (values) => {
    if (!projectId) {
      message.error("Please select a project first");
      return;
    }

    try {
      const payload = {
        developerId,
        projectId,
        unitId: values.unitId,
        tower: values.tower || "",
        floor: values.floor || 0,
        unitType: values.unitType || "",
        bedrooms: values.bedrooms || 0,
        bathrooms: values.bathrooms || 0,
        area: values.area || 0,
        price: values.price || 0,
        facing: values.facing || "",
        view: values.view || "",
        status: "Available"
      };

      const res = await apiService.post("/property/create-inventory", payload);

      if (res.success) {
        message.success("Unit created successfully");
        setIsCreateModalVisible(false);
        createForm.resetFields();
        fetchInventory(projectId, currentPage, pageSize);
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to create unit");
    }
  };

  /* ---------------- EDIT INVENTORY ---------------- */
  const handleEditClick = (record) => {
    setSelectedUnit(record);
    editForm.setFieldsValue({
      unitId: record.unitId,
      tower: record.tower,
      floor: record.floor,
      unitType: record.unitType,
      bedrooms: record.bedrooms,
      bathrooms: record.bathrooms,
      area: record.area,
      price: record.price,
      facing: record.facing,
      view: record.view,
      status: record.status
    });
    setIsEditModalVisible(true);
  };

  const handleUpdateInventory = async (values) => {
    try {
      const res = await apiService.put(`/property/update-inventory/${selectedUnit._id}`, values);

      if (res.success) {
        message.success("Unit updated successfully");
        setIsEditModalVisible(false);
        editForm.resetFields();
        setSelectedUnit(null);
        fetchInventory(projectId, currentPage, pageSize);
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Update failed");
    }
  };

  /* ---------------- INITIAL LOAD ---------------- */
  useEffect(() => {
    fetchProjects();

    const savedProject = localStorage.getItem("selectedProject");
    const savedPage = localStorage.getItem("inventoryPage");

    if (savedProject) {
      setProjectId(savedProject);
      fetchInventory(savedProject, Number(savedPage) || 1, 10);
    }
  }, []);

  // Fetch when filters change
  useEffect(() => {
    if (projectId) {
      fetchInventory(projectId, 1, pageSize);
    }
  }, [selectedUnitType, selectedStatus]);

  /* ---------------- STATUS COLORS ---------------- */
  const getColor = (status) => {
    switch (status) {
      case "Sold":
        return "blue";
      case "Booked":
        return "orange";
      case "Reserved":
        return "purple";
      case "Available":
        return "green";
      default:
        return "default";
    }
  };

  /* ---------------- DELETE UNIT ---------------- */
  const deleteUnit = async (id) => {
    try {
      const res = await apiService.delete(`/property/inventory/${id}`);

      if (res.success) {
        message.success("Unit deleted");
        fetchInventory(projectId, currentPage, pageSize);
      }
    } catch {
      message.error("Delete failed");
    }
  };

  /* ---------------- RESERVE UNIT ---------------- */
  const reserveUnit = async (id) => {
    try {
      const res = await apiService.post(`/property/inventory/${id}/reserve`);

      if (res.success) {
        message.success("Unit Reserved");
        fetchInventory(projectId, currentPage, pageSize);
      }
    } catch {
      message.error("Reserve failed");
    }
  };

  /* ---------------- BOOK UNIT ---------------- */
  const bookUnit = async (id) => {
    try {
      const res = await apiService.post(`/property/inventory/${id}/book`);

      if (res.success) {
        message.success("Unit Booked");
        fetchInventory(projectId, currentPage, pageSize);
      }
    } catch {
      message.error("Booking failed");
    }
  };

  /* ---------------- RELEASE UNIT ---------------- */
  const releaseUnit = async (id) => {
    try {
      const res = await apiService.post(`/property/inventory/${id}/release`);

      if (res.success) {
        message.success("Unit Released");
        fetchInventory(projectId, currentPage, pageSize);
      }
    } catch {
      message.error("Release failed");
    }
  };

  /* ---------------- CSV IMPORT ---------------- */
  const handleFileUpload = async (file) => {
    if (!developerId || !projectId) {
      message.error("Select project first");
      return false;
    }

    const text = await file.text();
    const rows = text.split(/\r?\n/).slice(1);

    const units = rows
      .map((row) => {
        const cols = row.split(",");
        return {
          unitId: cols[0]?.trim(),
          area: Number(cols[1]),
          price: Number(cols[2]),
          view: cols[3]?.trim() || "",
          status: cols[4]?.trim() || "Available"
        };
      })
      .filter((u) => u.unitId && u.area && u.price);

    try {
      const res = await apiService.post("/property/bulk-import-inventory", {
        developerId,
        projectId,
        units
      });

      if (res.success) {
        message.success("CSV Imported");
        fetchInventory(projectId, currentPage, pageSize);
      }
    } catch {
      message.error("Upload Failed");
    }

    return false;
  };

  /* ---------------- SEARCH ---------------- */
  const filteredUnits = units.filter((item) =>
    item.unitId?.toLowerCase().includes(search.toLowerCase())
  );

  /* ---------------- TABLE COLUMNS ---------------- */
  const columns = [
    {
      title: "Unit ID",
      dataIndex: "unitId",
      sorter: (a, b) => a.unitId.localeCompare(b.unitId)
    },
    {
      title: "Type",
      dataIndex: "unitType",
      render: (text) => text || "-"
    },
    {
      title: "Floor",
      dataIndex: "floor",
      render: (text) => text || "-"
    },
    {
      title: "Area (sqft)",
      dataIndex: "area",
      render: (text) => text?.toLocaleString() || "-"
    },
    {
      title: "Price (AED)",
      dataIndex: "price",
      render: (text) => text?.toLocaleString() || "-",
      sorter: (a, b) => a.price - b.price
    },
    {
      title: "View",
      dataIndex: "view",
      render: (text) => text || "-"
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => <Tag color={getColor(status)}>{status}</Tag>,
      filters: [
        { text: "Available", value: "Available" },
        { text: "Reserved", value: "Reserved" },
        { text: "Booked", value: "Booked" },
        { text: "Sold", value: "Sold" }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: "Action",
      align: "center",
      fixed: "right",
      width: 320,
      render: (_, record) => {
        if (record.status === "Available") {
          return (
            <Space size="small">
              <Button size="small" onClick={() => reserveUnit(record.key)}>
                Reserve
              </Button>
              <Button 
                size="small" 
                icon={<EditOutlined />}
                onClick={() => handleEditClick(record)}
              >
                Edit
              </Button>
              <Popconfirm
                title="Delete this unit?"
                onConfirm={() => deleteUnit(record.key)}
              >
                <Button size="small" danger>
                  Delete
                </Button>
              </Popconfirm>
            </Space>
          );
        }

        if (record.status === "Reserved") {
          return (
            <Space size="small">
              <Button size="small" type="primary" onClick={() => bookUnit(record.key)}>
                Book
              </Button>
              <Button size="small" danger onClick={() => releaseUnit(record.key)}>
                Release
              </Button>
              <Button 
                size="small" 
                icon={<EditOutlined />}
                onClick={() => handleEditClick(record)}
              >
                Edit
              </Button>
            </Space>
          );
        }

        if (record.status === "Booked" || record.status === "Sold") {
          return (
            <Space size="small">
              <Button
                size="small"
                type="primary"
                onClick={() =>
                  navigate(`/dashboard/developer/inventory/${record.key}`)
                }
              >
                View
              </Button>
              {record.status === "Booked" && (
                <Button 
                  size="small" 
                  icon={<EditOutlined />}
                  onClick={() => handleEditClick(record)}
                >
                  Edit
                </Button>
              )}
            </Space>
          );
        }

        return null;
      }
    }
  ];

  /* ---------------- HANDLE PAGE CHANGE ---------------- */
  const handleTableChange = (pagination) => {
    const { current, pageSize } = pagination;
    setCurrentPage(current);
    setPageSize(pageSize);
    localStorage.setItem("inventoryPage", current);
    fetchInventory(projectId, current, pageSize);
  };

  /* ---------------- CLEAR FILTERS ---------------- */
  const clearFilters = () => {
    setSelectedUnitType(null);
    setSelectedStatus(null);
    setSearch("");
  };

  return (
    <div style={{ padding: 24, background: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header Section */}
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16
        }}
      >
        <div>
          <Title level={2}>Inventory Management</Title>
          <Text type="secondary">Manage all your project units</Text>
        </div>

        <Space wrap>
          <Upload
            beforeUpload={handleFileUpload}
            accept=".csv"
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>Import CSV</Button>
          </Upload>

          <Button
            type="primary"
            icon={<FileAddOutlined />}
            onClick={() => setIsCreateModalVisible(true)}
            disabled={!projectId}
          >
            Quick Add Unit
          </Button>
        </Space>
      </div>

      {/* Stats Cards from API */}
      {stats && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Text type="secondary">Total Units</Text>
              <Title level={3}>{stats.overall?.totalUnits || 0}</Title>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Text type="secondary">Available</Text>
              <Title level={3} style={{ color: "#52c41a" }}>
                {stats.overall?.byStatus?.Available || 0}
              </Title>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Text type="secondary">Reserved</Text>
              <Title level={3} style={{ color: "#722ed1" }}>
                {stats.overall?.byStatus?.Reserved || 0}
              </Title>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Text type="secondary">Booked/Sold</Text>
              <Title level={3} style={{ color: "#fa8c16" }}>
                {(stats.overall?.byStatus?.Booked || 0) + (stats.overall?.byStatus?.Sold || 0)}
              </Title>
            </Card>
          </Col>
        </Row>
      )}

   {/* Unit Type Stats Cards */}
{stats?.byUnitType && (
  <Card
    style={{ marginBottom: 24 }}
    bordered={false}
    bodyStyle={{ padding: 20 }}
  >
    <Title level={4} style={{ marginBottom: 20 }}>
      Unit Type Summary
    </Title>

    <Row gutter={[20, 20]}>
      {Object.entries(stats.byUnitType).map(([type, data]) => (
        <Col xs={24} sm={12} md={8} lg={6} key={type}>
          <Card
            hoverable
            size="small"
            style={{
              borderRadius: 10,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            {/* Unit Type */}
            <Title level={5} style={{ marginBottom: 12 }}>
              {type}
            </Title>

            {/* Status Tags */}
            <Row gutter={[8, 8]} style={{ marginBottom: 12 }}>
              <Col>
                <Tag color="green">Available {data.available}</Tag>
              </Col>

              <Col>
                <Tag color="purple">Reserved {data.reserved}</Tag>
              </Col>

              <Col>
                <Tag color="orange">Booked {data.booked}</Tag>
              </Col>

              <Col>
                <Tag color="blue">Sold {data.sold}</Tag>
              </Col>
            </Row>

            {/* Price */}
            <Divider style={{ margin: "10px 0" }} />

            <Text type="secondary">Price Range</Text>

            <div style={{ marginTop: 4 }}>
              <Text strong style={{ fontSize: 16 }}>
                {data.pricing?.min?.toLocaleString()} -{" "}
                {data.pricing?.max?.toLocaleString()} AED
              </Text>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  </Card>
)}
      {/* Filters Card */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
            <Text strong>Select Project</Text>
            <Select
              size="large"
              value={projectId}
              options={projects}
              placeholder="Select a project"
              style={{ width: "100%", marginTop: 6 }}
              onChange={(value) => {
                setProjectId(value);
                localStorage.setItem("selectedProject", value);
                setCurrentPage(1);
                clearFilters();
                fetchInventory(value, 1, pageSize);
              }}
            />
          </Col>

          <Col xs={24} md={5}>
            <Text strong>Unit Type</Text>
            <Select
              size="large"
              value={selectedUnitType}
              placeholder="All Types"
              allowClear
              style={{ width: "100%", marginTop: 6 }}
              onChange={setSelectedUnitType}
            >
              <Option value="1BR">1BR / 1BHK</Option>
              <Option value="2BR">2BR / 2BHK</Option>
              <Option value="3BR">3BR / 3BHK</Option>
              <Option value="4BR">4BR / 4BHK</Option>
              <Option value="Studio">Studio</Option>
              <Option value="Penthouse">Penthouse</Option>
            </Select>
          </Col>

          <Col xs={24} md={5}>
            <Text strong>Status</Text>
            <Select
              size="large"
              value={selectedStatus}
              placeholder="All Status"
              allowClear
              style={{ width: "100%", marginTop: 6 }}
              onChange={setSelectedStatus}
            >
              <Option value="Available">Available</Option>
              <Option value="Reserved">Reserved</Option>
              <Option value="Booked">Booked</Option>
              <Option value="Sold">Sold</Option>
            </Select>
          </Col>

          <Col xs={24} md={8}>
            <Text strong>Search Unit</Text>
            <Input
              size="large"
              prefix={<SearchOutlined />}
              placeholder="Search by Unit ID"
              allowClear
              style={{ marginTop: 6 }}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Col>
        </Row>

        {(selectedUnitType || selectedStatus || search) && (
          <Row style={{ marginTop: 16 }}>
            <Col>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </Col>
          </Row>
        )}
      </Card>

      {/* Tabs for Table and Charts */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={<span><TableOutlined /> Table View</span>}
            key="table"
          >
            <div style={{ marginBottom: 16 }}>
              <Title level={5}>
                {search ? `Search Results (${filteredUnits.length})` : `All Units (${totalItems})`}
              </Title>
            </div>

            <Table
              columns={columns}
              dataSource={search ? filteredUnits : units}
              loading={loading}
              scroll={{ x: 1300 }}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: search ? filteredUnits.length : totalItems,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `Total ${total} units`,
                position: ["bottomCenter"],
                pageSizeOptions: ["10", "20", "50", "100"]
              }}
              onChange={handleTableChange}
            />
          </TabPane>

          {/* <TabPane
            tab={<span><PieChartOutlined /> Charts View</span>}
            key="charts"
          >
            {stats?.charts && (
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Card title="Unit Type Distribution">
                    <pre>{JSON.stringify(stats.charts.unitTypeDistribution, null, 2)}</pre>
                  </Card>
                </Col>
                <Col span={24}>
                  <Card title="Status Distribution">
                    <pre>{JSON.stringify(stats.charts.statusDistribution, null, 2)}</pre>
                  </Card>
                </Col>
              </Row>
            )}
          </TabPane> */}
        </Tabs>
      </Card>

      {/* CREATE INVENTORY MODAL */}
      <Modal
        title="Add New Inventory Unit"
        open={isCreateModalVisible}
        onCancel={() => {
          setIsCreateModalVisible(false);
          createForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateInventory}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="unitId"
                label="Unit ID"
                rules={[{ required: true, message: "Unit ID is required" }]}
              >
                <Input placeholder="e.g., T1-1001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="unitType"
                label="Unit Type"
                rules={[{ required: true, message: "Unit Type is required" }]}
              >
                <Select placeholder="Select type">
                  <Option value="Studio">Studio</Option>
                  <Option value="1BR">1BR / 1BHK</Option>
                  <Option value="2BR">2BR / 2BHK</Option>
                  <Option value="3BR">3BR / 3BHK</Option>
                  <Option value="4BR">4BR / 4BHK</Option>
                  <Option value="Penthouse">Penthouse</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="tower" label="Tower">
                <Input placeholder="e.g., Tower A" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="floor" label="Floor">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="area" label="Area (sqft)" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="bedrooms" label="Bedrooms">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="bathrooms" label="Bathrooms">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="price" label="Price (AED)" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="view" label="View">
                <Input placeholder="e.g., Sea View" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="facing" label="Facing">
                <Select placeholder="Select direction" allowClear>
                  <Option value="North">North</Option>
                  <Option value="South">South</Option>
                  <Option value="East">East</Option>
                  <Option value="West">West</Option>
                  <Option value="North-East">North-East</Option>
                  <Option value="North-West">North-West</Option>
                  <Option value="South-East">South-East</Option>
                  <Option value="South-West">South-West</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => {
                setIsCreateModalVisible(false);
                createForm.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Create Unit
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* EDIT INVENTORY MODAL */}
      <Modal
        title="Edit Inventory Unit"
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          editForm.resetFields();
          setSelectedUnit(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateInventory}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="unitId"
                label="Unit ID"
                rules={[{ required: true, message: "Unit ID is required" }]}
              >
                <Input placeholder="e.g., T1-1001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="unitType"
                label="Unit Type"
                rules={[{ required: true, message: "Unit Type is required" }]}
              >
                <Select placeholder="Select type">
                  <Option value="Studio">Studio</Option>
                  <Option value="1BR">1BR / 1BHK</Option>
                  <Option value="2BR">2BR / 2BHK</Option>
                  <Option value="3BR">3BR / 3BHK</Option>
                  <Option value="4BR">4BR / 4BHK</Option>
                  <Option value="Penthouse">Penthouse</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="tower" label="Tower">
                <Input placeholder="e.g., Tower A" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="floor" label="Floor">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="area" label="Area (sqft)" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="bedrooms" label="Bedrooms">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="bathrooms" label="Bathrooms">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="price" label="Price (AED)" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="view" label="View">
                <Input placeholder="e.g., Sea View" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="facing" label="Facing">
                <Select placeholder="Select direction" allowClear>
                  <Option value="North">North</Option>
                  <Option value="South">South</Option>
                  <Option value="East">East</Option>
                  <Option value="West">West</Option>
                  <Option value="North-East">North-East</Option>
                  <Option value="North-West">North-West</Option>
                  <Option value="South-East">South-East</Option>
                  <Option value="South-West">South-West</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Status">
                <Select placeholder="Select status">
                  <Option value="Available">Available</Option>
                  <Option value="Reserved">Reserved</Option>
                  <Option value="Booked">Booked</Option>
                  <Option value="Sold" disabled={selectedUnit?.status === "Sold"}>
                    Sold
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => {
                setIsEditModalVisible(false);
                editForm.resetFields();
                setSelectedUnit(null);
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Update Unit
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}