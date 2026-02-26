import React from "react";
import { 
  Card, 
  Typography, 
  Table, 
  Tag, 
  Button, 
  Input, 
  Row, 
  Col 
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export default function DeveloperBookings() {
  const navigate = useNavigate();

  const bookings = [
    { key: 1, client: "Rahul Mehta", unit: "A-101", project: "Sky Tower", amount: "1.2Cr", status: "Confirmed" },
    { key: 2, client: "Ali Hassan", unit: "B-201", project: "Downtown View", amount: "1.6Cr", status: "Pending" },
    { key: 3, client: "Neha Gupta", unit: "C-301", project: "Marina Heights", amount: "70L", status: "Completed" },
  ];

  const getColor = (status) => {
    switch (status) {
      case "Confirmed": return "green";
      case "Pending": return "orange";
      case "Completed": return "blue";
      default: return "default";
    }
  };

  const columns = [
    { 
      title: "Client Name", 
      dataIndex: "client",
      key: "client",
      fontWeight: "bold",
    },
    { 
      title: "Project", 
      dataIndex: "project",
      key: "project",
    },
    { 
      title: "Unit No.", 
      dataIndex: "unit",
      key: "unit",
    },
    { 
      title: "Amount", 
      dataIndex: "amount",
      key: "amount",
      fontWeight: "500",
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
          onClick={() => navigate(`/dashboard/developer/bookings/${record.key}`)}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f8f9fa", minHeight: "100vh" }}>
      
      {/* HEADER SECTION */}
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Title level={2} style={{ margin: 0, color: "#1f2937" }}>
            Bookings Management
          </Title>
          <Text type="secondary" style={{ fontSize: "15px" }}>
            View and manage all property bookings and their payment statuses.
          </Text>
        </div>
      </div>

      {/* FILTER / SEARCH SECTION */}
      <Card 
        bordered={false} 
        style={{ borderRadius: "12px", marginBottom: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        bodyStyle={{ padding: "24px" }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12} lg={8}>
            <div style={{ marginBottom: "8px" }}>
              <Text strong style={{ color: "#4b5563" }}>Search Bookings</Text>
            </div>
            <Input
              size="large"
              placeholder="Search by Client name, Unit or Project..."
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
        bodyStyle={{ padding: "0" }} // Removed padding to make table edge-to-edge seamlessly
      >
        <div style={{ padding: "24px", borderBottom: "1px solid #f0f0f0" }}>
          <Title level={5} style={{ margin: 0 }}>Total Bookings ({bookings.length})</Title>
        </div>

        <Table
          columns={columns}
          dataSource={bookings}
          pagination={{ 
            pageSize: 10, 
            position: ["bottomCenter"],
            showSizeChanger: true,
          }}
          rowKey="key"
          style={{ padding: "0 24px 24px 24px" }}
        />
      </Card>

    </div>
  );
}