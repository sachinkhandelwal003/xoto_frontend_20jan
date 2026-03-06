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

const { Title, Text } = Typography;

const API = "http://localhost:5000/api/property";

export default function DeveloperInventory() {

  const navigate = useNavigate();

  const developerId = localStorage.getItem("developerId");

  const [units, setUnits] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // FETCH PROJECTS
  const fetchProjects = async () => {

    try {

      const res = await fetch(`${API}/get-all-properties`);
      const data = await res.json();

      const options = data.data.map((p) => ({
        label: p.projectName,
        value: p._id
      }));

      setProjects(options);

    } catch {

      message.error("Failed to load projects");

    }

  };

  // FETCH INVENTORY
  const fetchInventory = async (projectId) => {

    if (!projectId) return;

    setLoading(true);

    try {

      const res = await fetch(
        `${API}/get-inventory-by-property?projectId=${projectId}`
      );

      const data = await res.json();

      if (data.success) {

        const formatted = data.data.map((item) => ({
          key: item._id,
          unitId: item.unitId,
          area: item.area,
          price: item.price,
          view: item.view,
          status: item.status
        }));

        setUnits(formatted);

      }

    } catch {

      message.error("Failed to load inventory");

    }

    setLoading(false);

  };

  useEffect(() => {

    fetchProjects();

    const savedProject = localStorage.getItem("selectedProject");

    if (savedProject) {

      setProjectId(savedProject);

      fetchInventory(savedProject);

    }

  }, []);

  const getColor = (status) => {

    switch (status) {

      case "Sold":
        return "blue";

      case "Booked":
        return "orange";

      case "Blocked":
        return "red";

      case "Available":
        return "green";

      default:
        return "default";

    }

  };

  // DELETE UNIT
  const deleteUnit = async (id) => {

    try {

      const res = await fetch(`${API}/delete-inventory/${id}`, {
        method: "DELETE"
      });

      const data = await res.json();

      if (data.success) {

        message.success("Unit deleted successfully");

        fetchInventory(projectId);

      }

    } catch {

      message.error("Delete failed");

    }

  };

  // CSV IMPORT
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

      const res = await fetch(`${API}/bulk-import-inventory`, {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          developerId,
          projectId,
          units
        })

      });

      const data = await res.json();

      if (data.success) {

        message.success("CSV Imported Successfully");

        fetchInventory(projectId);

      } else {

        message.error(data.message);

      }

    } catch {

      message.error("Upload Failed");

    }

    return false;

  };

  // SEARCH
  const filteredUnits = units.filter((item) =>
    item.unitId?.toLowerCase().includes(search.toLowerCase())
  );

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
      render: (_, record) => (

        <Space>

          <Button
            type="primary"
            onClick={() =>
              navigate(`/dashboard/developer/inventory/${record.key}`)
            }
          >
            View
          </Button>

          <Button
            onClick={() =>
              navigate(`/dashboard/developer/inventory/edit/${record.key}`)
            }
          >
            Edit
          </Button>

          <Popconfirm
            title="Are you sure to delete this unit?"
            onConfirm={() => deleteUnit(record.key)}
          >
            <Button danger>
              Delete
            </Button>
          </Popconfirm>

        </Space>

      )
    }

  ];

  // STATS
  const totalUnits = units.length;
  const availableUnits = units.filter(u => u.status === "Available").length;
  const bookedUnits = units.filter(u => u.status === "Booked").length;
  const soldUnits = units.filter(u => u.status === "Sold").length;

  return (

    <div style={{ padding: "24px", background: "#f8f9fa", minHeight: "100vh" }}>

      {/* HEADER */}

      <div
        style={{
          marginBottom: "24px",
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

      {/* STATS */}

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

      {/* FILTER */}

      <Card style={{ marginBottom: 24 }}>

        <Row gutter={16}>

          <Col span={8}>

            <Text strong>Select Project</Text>

            <Select
              size="large"
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

      {/* TABLE */}

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