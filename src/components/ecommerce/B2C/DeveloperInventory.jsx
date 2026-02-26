import React, { useState } from "react";
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
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export default function DeveloperInventory() {
  const navigate = useNavigate();

  const projects = [
    { label: "Sky Tower", value: "sky" },
    { label: "Downtown View", value: "down" },
    { label: "Marina Heights", value: "marina" },
  ];

  const [units, setUnits] = useState([
    { key: 1, unit: "A-101", project: "Sky Tower", type: "2BHK", price: "1.2Cr", status: "Sold" },
    { key: 2, unit: "A-102", project: "Sky Tower", type: "2BHK", price: "1.1Cr", status: "Available" },
    { key: 3, unit: "B-201", project: "Downtown View", type: "3BHK", price: "1.6Cr", status: "Booked" },
    { key: 4, unit: "C-301", project: "Marina Heights", type: "Studio", price: "70L", status: "Available" },
  ]);

  const getColor = (status) => {
    switch (status) {
      case "Sold":
        return "blue";
      case "Booked":
        return "orange";
      case "Available":
        return "green";
      default:
        return "default";
    }
  };

  const columns = [
    { 
      title: "Unit No.", 
      dataIndex: "unit",
      key: "unit",
      fontWeight: "bold",
    },
    { 
      title: "Project Name", 
      dataIndex: "project",
      key: "project",
    },
    { 
      title: "Unit Type", 
      dataIndex: "type",
      key: "type",
    },
    { 
      title: "Price", 
      dataIndex: "price",
      key: "price",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getColor(status)} style={{ padding: "4px 12px", borderRadius: "4px", fontSize: "13px" }}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Button
          type="primary"
          style={{ background: "#5c039b", borderColor: "#5c039b", borderRadius: "6px" }}
          onClick={() => navigate(`/dashboard/developer/inventory/${record.key}`)}
        >
          View Details
        </Button>
      ),
    },
  ];

  // CSV Import Logic
  const handleFileUpload = (file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split("\n").slice(1); // skip header

      const importedData = rows
        .map((row, index) => {
          const cols = row.split(",");
          if (cols.length < 5) return null; // safety check

          return {
            key: units.length + index + 1,
            unit: cols[0]?.trim(),
            project: cols[1]?.trim(),
            type: cols[2]?.trim(),
            price: cols[3]?.trim(),
            status: cols[4]?.trim(),
          };
        })
        .filter((item) => item && item.unit); // remove empty/invalid rows

      if (importedData.length > 0) {
        setUnits((prev) => [...prev, ...importedData]);
        message.success(`${importedData.length} units imported successfully!`);
      } else {
        message.error("Failed to import. Please check CSV format.");
      }
    };

    reader.readAsText(file);
    return false; // prevent auto upload
  };

  return (
    <div style={{ padding: "24px", background: "#f8f9fa", minHeight: "100vh" }}>
      
      {/* HEADER SECTION */}
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <Title level={2} style={{ margin: 0, color: "#1f2937" }}>
            Inventory Management
          </Title>
          <Text type="secondary" style={{ fontSize: "15px" }}>
            Manage all your project units, pricing, and availability status.
          </Text>
        </div>

        <Space size="middle">
          <Upload
            beforeUpload={handleFileUpload}
            accept=".csv"
            showUploadList={false}
          >
            <Button size="large" icon={<UploadOutlined />}>
              Import CSV
            </Button>
          </Upload>

          <Button
            size="large"
            type="primary"
            icon={<PlusOutlined />}
            style={{ background: "#5c039b", borderColor: "#5c039b", boxShadow: "0 4px 10px rgba(92, 3, 155, 0.2)" }}
            onClick={() => navigate("/dashboard/developer/inventory/add")}
          >
            Add New Unit
          </Button>
        </Space>
      </div>

      {/* FILTER SECTION */}
      <Card 
        bordered={false} 
        style={{ borderRadius: "12px", marginBottom: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        bodyStyle={{ padding: "24px" }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8} lg={6}>
            <div style={{ marginBottom: "8px" }}>
              <Text strong style={{ color: "#4b5563" }}>Select Project</Text>
            </div>
            <Select
              size="large"
              placeholder="Filter by Project"
              options={projects}
              style={{ width: "100%" }}
              allowClear
            />
          </Col>

          <Col xs={24} md={10} lg={8}>
            <div style={{ marginBottom: "8px" }}>
              <Text strong style={{ color: "#4b5563" }}>Search Unit</Text>
            </div>
            <Input
              size="large"
              placeholder="Search by Unit No. or Type..."
              prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
              allowClear
            />
          </Col>
        </Row>
      </Card>

      {/* TABLE SECTION */}
      <Card 
        bordered={false} 
        style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        bodyStyle={{ padding: "0" }} // Removing padding so table goes edge-to-edge inside card
      >
        <div style={{ padding: "24px", borderBottom: "1px solid #f0f0f0" }}>
          <Title level={5} style={{ margin: 0 }}>Total Units ({units.length})</Title>
        </div>
        
        <Table
          columns={columns}
          dataSource={units}
          pagination={{ 
            pageSize: 10, 
            position: ["bottomCenter"],
            showSizeChanger: true,
          }}
          rowKey="key"
          style={{ padding: "0 24px 24px 24px" }} // Added padding to table container
        />
      </Card>
      
    </div>
  );
}