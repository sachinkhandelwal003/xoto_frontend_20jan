import React from "react";
import { Card, Typography, Row, Col, Table, Tag } from "antd";
import {
  DollarOutlined,
  LineChartOutlined,
  ClockCircleOutlined,
  CheckSquareOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function DeveloperRevenue() {

  const stats = [
    { title: "Total Revenue", value: "125 Cr", icon: <DollarOutlined />, color: "#5c039b", bg: "#f3e8ff" },
    { title: "This Month", value: "9.5 Cr", icon: <LineChartOutlined />, color: "#059669", bg: "#d1fae5" },
    { title: "Pending Payments", value: "2.1 Cr", icon: <ClockCircleOutlined />, color: "#d97706", bg: "#fef3c7" },
    { title: "Total Deals", value: "48", icon: <CheckSquareOutlined />, color: "#2563eb", bg: "#dbeafe" },
  ];

  const deals = [
    { key: 1, client: "Rahul Mehta", project: "Sky Tower", amount: "1.2 Cr", status: "Received" },
    { key: 2, client: "Ali Hassan", project: "Downtown View", amount: "1.0 Cr", status: "Pending" },
    { key: 3, client: "Neha Gupta", project: "Marina Heights", amount: "95 L", status: "Received" },
  ];

  const getColor = (s) => {
    if (s === "Received") return "green";
    if (s === "Pending") return "orange";
    return "default";
  };

  const columns = [
    { 
      title: "Client Name", 
      dataIndex: "client",
      key: "client",
      fontWeight: "bold",
      render: (text) => <Text strong>{text}</Text>
    },
    { 
      title: "Project", 
      dataIndex: "project",
      key: "project"
    },
    { 
      title: "Amount", 
      dataIndex: "amount",
      key: "amount",
      render: (text) => <Text strong style={{ color: "#1f2937" }}>{text}</Text>
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s) => (
        <Tag color={getColor(s)} style={{ padding: "4px 12px", borderRadius: "4px", fontSize: "13px" }}>
          {s}
        </Tag>
      )
    }
  ];

  return (
    <div style={{ padding: "24px", background: "#f8f9fa", minHeight: "100vh" }}>

      {/* HEADER SECTION */}
      <div style={{ marginBottom: "32px" }}>
        <Title level={2} style={{ margin: 0, color: "#1f2937" }}>
          Sales Revenue
        </Title>
        <Text type="secondary" style={{ fontSize: "15px" }}>
          Overview of your total sales, collections, and pending payments.
        </Text>
      </div>

      {/* STATS SECTION */}
      <Row gutter={[24, 24]} style={{ marginBottom: "24px" }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} md={12} lg={6} key={index}>
            <Card 
              bordered={false} 
              style={{ 
                borderRadius: "12px", 
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                height: "100%"
              }}
              bodyStyle={{ padding: "24px" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ 
                  width: "48px", 
                  height: "48px", 
                  borderRadius: "12px", 
                  background: stat.bg, 
                  color: stat.color,
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  fontSize: "24px"
                }}>
                  {stat.icon}
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: "13px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {stat.title}
                  </Text>
                  <Title level={3} style={{ margin: "4px 0 0 0", color: "#1f2937" }}>
                    {stat.value}
                  </Title>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* DEALS TABLE SECTION */}
      <Card 
        bordered={false} 
        style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        bodyStyle={{ padding: "0" }}
      >
        <div style={{ padding: "24px", borderBottom: "1px solid #f0f0f0" }}>
          <Title level={5} style={{ margin: 0 }}>Recent Transactions</Title>
        </div>

        <Table
          columns={columns}
          dataSource={deals}
          pagination={false}
          rowKey="key"
          style={{ padding: "0 24px 24px 24px" }}
        />
      </Card>

    </div>
  );
}