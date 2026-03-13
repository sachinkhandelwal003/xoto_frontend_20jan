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
  Popconfirm
} from "antd";

import {
  PlusOutlined,
  SearchOutlined,
  UploadOutlined
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;

export default function DeveloperInventory() {

  const navigate = useNavigate();
  const developerId = localStorage.getItem("developerId");

  const [units, setUnits] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

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

  /* ---------------- FETCH INVENTORY ---------------- */

  const fetchInventory = async (projectId) => {

    if (!projectId) return;

    setLoading(true);

    try {

      const res = await apiService.get(
        `/property/inventory/property/${projectId}`
      );

      if (res.success) {

        const formatted = res.data.map((item) => ({
          key: item._id,
          unitId: item.unitId,
          area: item.area,
          price: item.price,
          view: item.view,
          status: item.status,
          agentId: item.agentId,
          leadId: item.leadId
        }));

        setUnits(formatted);

      }

    } catch {

      message.error("Failed to load inventory");

    }

    setLoading(false);

  };

  /* ---------------- INITIAL LOAD ---------------- */

  useEffect(() => {

    fetchProjects();

    const savedProject = localStorage.getItem("selectedProject");

    if (savedProject) {

      setProjectId(savedProject);
      fetchInventory(savedProject);

    }

  }, []);

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

      const res = await apiService.delete(
        `/property/inventory/${id}`
      );

      if (res.success) {

        message.success("Unit deleted");
        fetchInventory(projectId);

      }

    } catch {

      message.error("Delete failed");

    }

  };

  /* ---------------- RESERVE UNIT ---------------- */

  const reserveUnit = async (id) => {

    try {

      const res = await apiService.post(
        `/property/inventory/${id}/reserve`
      );

      if (res.success) {

        message.success("Unit Reserved");
        fetchInventory(projectId);

      }

    } catch {

      message.error("Reserve failed");

    }

  };

  /* ---------------- BOOK UNIT ---------------- */

  const bookUnit = async (id) => {

    try {

      const res = await apiService.post(
        `/property/inventory/${id}/book`
      );

      if (res.success) {

        message.success("Unit Booked");
        fetchInventory(projectId);

      }

    } catch {

      message.error("Booking failed");

    }

  };

  /* ---------------- RELEASE UNIT ---------------- */

  const releaseUnit = async (id) => {

    try {

      const res = await apiService.post(
        `/property/inventory/${id}/release`
      );

      if (res.success) {

        message.success("Unit Released");
        fetchInventory(projectId);

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

    const units = rows.map((row) => {

      const cols = row.split(",");

      return {
        unitId: cols[0]?.trim(),
        area: Number(cols[1]),
        price: Number(cols[2]),
        view: cols[3]?.trim() || "",
        status: cols[4]?.trim() || "Available"
      };

    }).filter(u => u.unitId && u.area && u.price);

    try {

      const res = await apiService.post(
        "/property/bulk-import-inventory",
        {
          developerId,
          projectId,
          units
        }
      );

      if (res.success) {

        message.success("CSV Imported");
        fetchInventory(projectId);

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
      dataIndex: "unitId"
    },

    {
      title: "Area",
      dataIndex: "area"
    },

    {
      title: "Price",
      dataIndex: "price"
    },

    {
      title: "View",
      dataIndex: "view"
    },

    {
      title: "Agent",
      render: (_, record) =>
        record.agentId
          ? `${record.agentId.first_name} ${record.agentId.last_name}`
          : "-"
    },

    {
      title: "Client",
      render: (_, record) =>
        record.leadId
          ? record.leadId.clientName
          : "-"
    },

    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <Tag color={getColor(status)}>
          {status}
        </Tag>
      )
    },

    {
      title: "Action",
      align: "center",
      render: (_, record) => {

        if (record.status === "Available") {

          return (
            <Space>

              <Button onClick={() => reserveUnit(record.key)}>
                Reserve
              </Button>

              <Button
                onClick={() =>
                  navigate(`/dashboard/developer/inventory/edit/${record.key}`)
                }
              >
                Edit
              </Button>

              <Popconfirm
                title="Delete this unit?"
                onConfirm={() => deleteUnit(record.key)}
              >
                <Button danger>
                  Delete
                </Button>
              </Popconfirm>

            </Space>
          );

        }

        if (record.status === "Reserved") {

          return (
            <Space>

              <Button
                type="primary"
                onClick={() => bookUnit(record.key)}
              >
                Book
              </Button>

              <Button
                danger
                onClick={() => releaseUnit(record.key)}
              >
                Release
              </Button>

            </Space>
          );

        }

        return (

          <Button
            type="primary"
            onClick={() =>
              navigate(`/dashboard/developer/inventory/${record.key}`)
            }
          >
            View
          </Button>

        );

      }
    }

  ];

  /* ---------------- STATS ---------------- */

  const totalUnits = units.length;
  const availableUnits = units.filter(u => u.status === "Available").length;
  const bookedUnits = units.filter(u => u.status === "Booked").length;
  const soldUnits = units.filter(u => u.status === "Sold").length;

  return (

    <div style={{ padding: 24, background: "#f8f9fa", minHeight: "100vh" }}>

      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between"
        }}
      >

        <div>

          <Title level={2}>
            Inventory Management
          </Title>

          <Text type="secondary">
            Manage all your project units
          </Text>

        </div>

        <Space>

          <Upload
            beforeUpload={handleFileUpload}
            accept=".csv"
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>
              Import CSV
            </Button>
          </Upload>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() =>
              navigate("/dashboard/developer/inventory/add")
            }
          >
            Add New Unit
          </Button>

        </Space>

      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>

        <Col span={6}>
          <Card>
            <Text>Total Units</Text>
            <Title level={3}>{totalUnits}</Title>
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Text>Available</Text>
            <Title level={3}>{availableUnits}</Title>
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Text>Booked</Text>
            <Title level={3}>{bookedUnits}</Title>
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Text>Sold</Text>
            <Title level={3}>{soldUnits}</Title>
          </Card>
        </Col>

      </Row>

      <Card style={{ marginBottom: 24 }}>

        <Row gutter={16}>

          <Col span={8}>

            <Text strong>Select Project</Text>

            <Select
              size="large"
              value={projectId}
              options={projects}
              placeholder="Select Project"
              style={{ width: "100%", marginTop: 6 }}
              onChange={(value) => {

                setProjectId(value);
                localStorage.setItem("selectedProject", value);
                fetchInventory(value);

              }}
            />

          </Col>

          <Col span={10}>

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

      </Card>

      <Card>

        <Title level={5}>
          Total Units ({filteredUnits.length})
        </Title>

        <Table
          columns={columns}
          dataSource={filteredUnits}
          loading={loading}
          pagination={{
            pageSize: 10,
            position: ["bottomCenter"]
          }}
        />

      </Card>

    </div>

  );

}

