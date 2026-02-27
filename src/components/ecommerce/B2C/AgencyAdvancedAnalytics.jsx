import React from "react";
import { Card, Row, Col, Typography, Progress, Table, Tag, Space, Avatar } from "antd";
import { 
  WalletOutlined, 
  RiseOutlined, 
  LineChartOutlined, // ✅ FIX: Changed TrendUpOutlined to LineChartOutlined
  BankOutlined,
  UserOutlined 
} from "@ant-design/icons";

const { Title, Text } = Typography;

const AgencyAdvancedAnalytics = () => {
  const monthlyRevenue = [
    { month: "Jan", revenue: 180000 },
    { month: "Feb", revenue: 220000 },
    { month: "Mar", revenue: 260000 },
  ];

  const forecastRevenue = 300000; // next month prediction
  const currentMonthRev = monthlyRevenue[2].revenue;

  const branchData = [
    { key: 1, branch: "Jaipur Head Office", revenue: 150000 },
    { key: 2, branch: "Delhi Branch", revenue: 110000 },
  ];

  const agentContribution = [
    { key: 1, name: "Rahul Sharma", revenue: 140000 },
    { key: 2, name: "Priya Mehta", revenue: 90000 },
    { key: 3, name: "Amit Jain", revenue: 30000 },
  ];

  const totalRevenue = agentContribution.reduce((s, a) => s + a.revenue, 0);

  // Stats Data Mapping
  const stats = [
    { 
      title: "Current Month Revenue", 
      value: `₹ ${currentMonthRev.toLocaleString()}`, 
      icon: <WalletOutlined />, 
      color: "#2563eb", 
      bg: "#dbeafe" 
    },
    { 
      title: "Next Month Forecast", 
      value: `₹ ${forecastRevenue.toLocaleString()}`, 
      icon: <RiseOutlined />, 
      color: "#5c039b", // Theme Purple
      bg: "#f3e8ff",
      tag: "+15% Growth Expected"
    },
    { 
      title: "Quarter Growth", 
      value: "+22%", 
      // ✅ FIX: Used LineChartOutlined here
      icon: <LineChartOutlined />, 
      color: "#059669", 
      bg: "#d1fae5" 
    },
  ];

  const columns = [
    {
      title: "Agent Profile",
      key: "name",
      render: (_, record) => (
        <Space size="middle">
          <Avatar 
            size={40} 
            style={{ backgroundColor: "#e0e7ff", color: "#4f46e5", fontWeight: "bold" }}
            icon={!record.name && <UserOutlined />}
          >
            {record.name?.charAt(0)}
          </Avatar>
          <Text strong style={{ fontSize: "15px", color: "#1f2937" }}>{record.name}</Text>
        </Space>
      ),
    },
    {
      title: "Revenue Generated",
      dataIndex: "revenue",
      key: "revenue",
      align: "center",
      render: (val) => (
        <Text strong style={{ color: "#059669", fontSize: "15px" }}>
          ₹ {val.toLocaleString()}
        </Text>
      ),
    },
    {
      title: "Overall Contribution",
      key: "contribution",
      width: "40%",
      render: (_, record) => {
        const percent = ((record.revenue / totalRevenue) * 100).toFixed(0);
        return (
          <div style={{ display: "flex", alignItems: "center", paddingRight: "20px" }}>
            <Progress 
              percent={parseInt(percent)} 
              strokeColor="#5c039b" 
              status="active"
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
          Advanced Revenue Analytics
        </Title>
        <Text type="secondary" style={{ fontSize: "15px" }}>
          Deep dive into your branch performance, forecasts, and agent contributions.
        </Text>
      </div>

      {/* SUMMARY STATS */}
      <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
        {stats.map((stat, index) => (
          <Col xs={24} md={8} key={index}>
            <Card 
              bordered={false} 
              style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", height: "100%" }}
              bodyStyle={{ padding: "24px" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ 
                  width: "56px", height: "56px", borderRadius: "12px", 
                  background: stat.bg, color: stat.color,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px"
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
                  {stat.tag && (
                    <Tag color="purple" style={{ marginTop: "8px", borderRadius: "12px" }}>
                      {stat.tag}
                    </Tag>
                  )}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]}>
        {/* BRANCH REVENUE */}
        <Col xs={24} xl={8}>
          <Card 
            bordered={false} 
            style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", height: "100%" }}
            bodyStyle={{ padding: "24px" }}
          >
            <Title level={5} style={{ marginBottom: "24px", color: "#374151" }}>Branch Revenue Share</Title>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {branchData.map((b) => {
                const percent = Math.round((b.revenue / currentMonthRev) * 100);
                return (
                  <div key={b.key}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <Space>
                        <BankOutlined style={{ color: "#5c039b" }} />
                        <Text strong style={{ color: "#4b5563" }}>{b.branch}</Text>
                      </Space>
                      <Text strong style={{ color: "#1f2937" }}>₹ {b.revenue.toLocaleString()}</Text>
                    </div>
                    <Progress 
                      percent={percent} 
                      strokeColor="#2563eb"
                      showInfo={false}
                    />
                    <Text type="secondary" style={{ fontSize: "12px" }}>{percent}% of total revenue</Text>
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>

        {/* AGENT CONTRIBUTION TABLE */}
        <Col xs={24} xl={16}>
          <Card 
            bordered={false} 
            style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", height: "100%" }}
            bodyStyle={{ padding: 0 }}
          >
            <div style={{ padding: "24px", borderBottom: "1px solid #f0f0f0" }}>
              <Title level={5} style={{ margin: 0, color: "#374151" }}>Agent Contribution</Title>
            </div>
            <Table 
              columns={columns} 
              dataSource={agentContribution} 
              pagination={false} 
              rowKey="key"
              style={{ padding: "0 24px 24px 24px" }}
            />
          </Card>
        </Col>
      </Row>

    </div>
  );
};

export default AgencyAdvancedAnalytics;