import React from "react";
import { Card, Table, Tag, Typography, Row, Col, Avatar, Space, Empty } from "antd";
// ✅ FIX: Removed MedalOutlined and added StarFilled
import { TrophyOutlined, UserOutlined, CrownFilled, StarFilled } from "@ant-design/icons";

const { Title, Text } = Typography;

const AgencyLeaderboard = () => {
  const agents = [
    { key: 1, name: "Rahul Sharma", deals: 8, revenue: 240000 },
    { key: 2, name: "Priya Mehta", deals: 6, revenue: 190000 },
    { key: 3, name: "Amit Jain", deals: 4, revenue: 110000 },
    { key: 4, name: "Neha Gupta", deals: 3, revenue: 85000 },
  ];

  const safeAgents = Array.isArray(agents) ? agents : [];
  const sortedAgents = [...safeAgents].sort((a, b) => (b.revenue || 0) - (a.revenue || 0));
  const topAgent = sortedAgents.length > 0 ? sortedAgents[0] : null;

  // ✅ FIX: Used StarFilled instead of MedalOutlined
  const getRankIcon = (index) => {
    if (index === 0) return <CrownFilled style={{ color: "#fbbf24", fontSize: "24px" }} />;
    if (index === 1) return <StarFilled style={{ color: "#9ca3af", fontSize: "22px" }} />;
    if (index === 2) return <StarFilled style={{ color: "#b45309", fontSize: "22px" }} />;
    return <Text strong style={{ color: "#6b7280", fontSize: "16px", paddingLeft: "8px" }}>{index + 1}</Text>;
  };

  const columns = [
    {
      title: "Rank",
      key: "rank",
      align: "center",
      width: 80,
      render: (_, __, index) => getRankIcon(index),
    },
    {
      title: "Agent Profile",
      key: "agent",
      render: (_, record) => (
        <Space size="middle">
          <Avatar 
            size={42} 
            style={{ backgroundColor: "#f3e8ff", color: "#5c039b", fontWeight: "bold" }}
            icon={!record?.name && <UserOutlined />}
          >
            {record?.name ? record.name.charAt(0).toUpperCase() : ""}
          </Avatar>
          <Text strong style={{ fontSize: "15px", color: "#1f2937" }}>
            {record?.name || "Unknown Agent"}
          </Text>
        </Space>
      ),
    },
    {
      title: "Deals Closed",
      dataIndex: "deals",
      key: "deals",
      align: "center",
      render: (val) => (
        <Tag color="blue" style={{ padding: "4px 12px", borderRadius: "12px", fontSize: "13px" }}>
          {val || 0} Deals
        </Tag>
      ),
    },
    {
      title: "Revenue Generated",
      dataIndex: "revenue",
      key: "revenue",
      render: (val) => (
        <Text strong style={{ color: "#059669", fontSize: "15px" }}>
          ₹ {(val || 0).toLocaleString()}
        </Text>
      ),
    },
    {
      title: "Performance",
      key: "performance",
      align: "right",
      render: (_, __, index) => {
        if (index === 0) return <Tag color="gold" style={{ borderRadius: "12px", padding: "4px 12px" }}>Top Performer 🏆</Tag>;
        if (index === 1) return <Tag color="geekblue" style={{ borderRadius: "12px", padding: "4px 12px" }}>Runner Up ⭐</Tag>;
        if (index === 2) return <Tag color="orange" style={{ borderRadius: "12px", padding: "4px 12px" }}>Rising Star ⭐</Tag>;
        return <Text type="secondary">Consistent</Text>;
      },
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f8f9fa", minHeight: "100vh" }}>
      
      <div style={{ marginBottom: "32px" }}>
        <Title level={2} style={{ margin: 0, color: "#1f2937" }}>
          Agency Leaderboard
        </Title>
        <Text type="secondary" style={{ fontSize: "15px" }}>
          Recognizing top-performing agents based on closed deals and revenue.
        </Text>
      </div>

      {topAgent ? (
        <Card
          bordered={false}
          style={{ 
            marginBottom: "32px", 
            borderRadius: "16px",
            background: "linear-gradient(135deg, #5c039b 0%, #3b0263 100%)",
            boxShadow: "0 10px 25px rgba(92, 3, 155, 0.2)",
            color: "white"
          }}
          bodyStyle={{ padding: "32px" }}
        >
          <Row align="middle" gutter={[24, 24]}>
            <Col>
              <Avatar 
                size={80} 
                style={{ backgroundColor: "#fbbf24", color: "#5c039b", fontSize: "32px", fontWeight: "bold", border: "4px solid rgba(255,255,255,0.2)" }}
                icon={!topAgent?.name && <UserOutlined />}
              >
                {topAgent?.name ? topAgent.name.charAt(0).toUpperCase() : ""}
              </Avatar>
            </Col>
            <Col flex="auto">
              <Text style={{ color: "#e9d5ff", fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "600" }}>
                🏆 Agent of the Month
              </Text>
              <Title level={2} style={{ color: "white", margin: "4px 0 8px 0" }}>
                {topAgent?.name}
              </Title>
              <Space size="large" style={{ marginTop: "8px" }}>
                <div>
                  <Text style={{ color: "#e9d5ff", fontSize: "13px" }}>Revenue Generated</Text>
                  <div style={{ fontSize: "20px", fontWeight: "bold", color: "#fbbf24" }}>
                    ₹ {(topAgent?.revenue || 0).toLocaleString()}
                  </div>
                </div>
                <div style={{ paddingLeft: "16px", borderLeft: "1px solid rgba(255,255,255,0.2)" }}>
                  <Text style={{ color: "#e9d5ff", fontSize: "13px" }}>Deals Closed</Text>
                  <div style={{ fontSize: "20px", fontWeight: "bold", color: "white" }}>
                    {topAgent?.deals || 0}
                  </div>
                </div>
              </Space>
            </Col>
            <Col hidden={typeof window !== 'undefined' && window.innerWidth < 768}>
              <TrophyOutlined style={{ fontSize: "100px", color: "rgba(255, 255, 255, 0.1)" }} />
            </Col>
          </Row>
        </Card>
      ) : (
        <Card style={{ marginBottom: "32px", borderRadius: "16px", textAlign: "center" }}>
           <Empty description="No Top Agent Found Yet" />
        </Card>
      )}

      <Card 
        bordered={false} 
        style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ padding: "24px", borderBottom: "1px solid #f0f0f0" }}>
          <Title level={5} style={{ margin: 0, color: "#374151" }}>Current Rankings</Title>
        </div>
        
        <Table
          columns={columns}
          dataSource={sortedAgents}
          pagination={false}
          rowKey="key"
          style={{ padding: "0 24px 24px 24px" }}
        />
      </Card>

    </div>
  );
};

export default AgencyLeaderboard;