import React, { useState } from "react";
import { Card, Table, Progress, Typography, Row, Col } from "antd";
import {
  AimOutlined,
  TrophyOutlined,
  LineChartOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

const AgencyTargets = () => {
  const [agents] = useState([
    { key: 1, name: "Rahul Sharma", target: 10, achieved: 6 },
    { key: 2, name: "Priya Mehta", target: 8, achieved: 8 },
    { key: 3, name: "Amit Jain", target: 12, achieved: 4 },
    { key: 4, name: "Neha Gupta", target: 15, achieved: 12 },
  ]);

  // Calculations
  const totalTarget = agents.reduce((sum, a) => sum + a.target, 0);
  const totalAchieved = agents.reduce((sum, a) => sum + a.achieved, 0);
  const overallCompletion = totalTarget > 0 ? ((totalAchieved / totalTarget) * 100).toFixed(1) : 0;

  // Stats Array for clean mapping
  const stats = [
    { 
      title: "Total Target", 
      value: totalTarget, 
      icon: <AimOutlined />, 
      color: "#2563eb", // Blue
      bg: "#dbeafe" 
    },
    { 
      title: "Total Achieved", 
      value: totalAchieved, 
      icon: <TrophyOutlined />, 
      color: "#059669", // Green
      bg: "#d1fae5" 
    },
    { 
      title: "Overall Completion", 
      value: `${overallCompletion}%`, 
      icon: <LineChartOutlined />, 
      color: "#5c039b", // Theme Purple
      bg: "#f3e8ff" 
    },
  ];

  // Dynamic color for progress bar
  const getProgressColor = (percent) => {
    if (percent >= 100) return "#059669"; // Green for completed
    if (percent >= 70) return "#5c039b"; // Theme Purple for good progress
    if (percent >= 40) return "#fa8c16"; // Orange for average
    return "#ef4444"; // Red for lagging
  };

  const columns = [
    {
      title: "Agent Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <Text strong style={{ color: "#1f2937" }}>{text}</Text>,
    },
    {
      title: "Target Assigned",
      dataIndex: "target",
      key: "target",
      align: "center",
      render: (val) => <Text style={{ fontSize: "14px", fontWeight: "500" }}>{val}</Text>
    },
    {
      title: "Achieved",
      dataIndex: "achieved",
      key: "achieved",
      align: "center",
      render: (val) => <Text style={{ fontSize: "14px", fontWeight: "500", color: "#059669" }}>{val}</Text>
    },
    {
      title: "Completion Progress",
      key: "completion",
      width: "40%",
      render: (_, record) => {
        const percent = record.target > 0 ? ((record.achieved / record.target) * 100).toFixed(0) : 0;
        const parsedPercent = parseInt(percent);
        return (
          <div style={{ display: "flex", alignItems: "center", paddingRight: "20px" }}>
            <Progress 
              percent={parsedPercent} 
              strokeColor={getProgressColor(parsedPercent)}
              status={parsedPercent >= 100 ? "success" : "active"}
              style={{ width: "100%" }}
            />
          </div>
        );
      },
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f8f9fa", minHeight: "100vh" }}>
      
      {/* HEADER SECTION */}
      <div style={{ marginBottom: "32px" }}>
        <Title level={2} style={{ margin: 0, color: "#1f2937" }}>
          Agent Targets & KPI
        </Title>
        <Text type="secondary" style={{ fontSize: "15px" }}>
          Monitor individual performance and overall goal completion rates.
        </Text>
      </div>

      {/* SUMMARY CARDS */}
      <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} md={8} key={index}>
            <Card 
              bordered={false} 
              style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
              bodyStyle={{ padding: "24px" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ 
                  width: "56px", height: "56px", borderRadius: "12px", 
                  background: stat.bg, color: stat.color,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px"
                }}>
                  {stat.icon}
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: "13px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {stat.title}
                  </Text>
                  <Title level={2} style={{ margin: "4px 0 0 0", color: "#1f2937" }}>
                    {stat.value}
                  </Title>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* TARGETS TABLE */}
      <Card 
        bordered={false} 
        style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ padding: "24px", borderBottom: "1px solid #f0f0f0" }}>
          <Title level={5} style={{ margin: 0, color: "#374151" }}>Individual KPI Breakdown</Title>
        </div>
        
        <Table 
          columns={columns} 
          dataSource={agents} 
          pagination={false} 
          rowKey="key"
          style={{ padding: "0 24px 24px 24px" }}
        />
      </Card>
      
    </div>
  );
};

export default AgencyTargets;