import React, { useState } from "react";
import { Card, Typography, InputNumber, Row, Col, Slider, Space, Divider } from "antd";
import { 
  DollarOutlined, 
  BankOutlined, 
  ApiOutlined, 
  WalletOutlined,
  InfoCircleOutlined,
  CalculatorOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

const AgencyProfitEngine = () => {
  const [dealValue, setDealValue] = useState(10000000); // Default 1 Cr

  // Configuration (Could come from API later)
  const agentCommissionPercent = 2; // 2% of Deal Value
  const agencySharePercent = 40; // 40% of Total Commission
  const platformPercent = 10; // 10% of Total Commission

  // Calculations
  const totalCommission = (dealValue * agentCommissionPercent) / 100;
  const agencyShare = (totalCommission * agencySharePercent) / 100;
  const platformFee = (totalCommission * platformPercent) / 100;
  const agentFinal = totalCommission - agencyShare - platformFee;

  // Stats Array for clean UI mapping
  const results = [
    {
      title: `Total Commission (${agentCommissionPercent}%)`,
      value: totalCommission,
      icon: <DollarOutlined />,
      color: "#2563eb", // Blue
      bg: "#dbeafe"
    },
    {
      title: `Agency Share (${agencySharePercent}%)`,
      value: agencyShare,
      icon: <BankOutlined />,
      color: "#5c039b", // Theme Purple
      bg: "#f3e8ff"
    },
    {
      title: `Platform Fee (${platformPercent}%)`,
      value: platformFee,
      icon: <ApiOutlined />,
      color: "#fa8c16", // Orange
      bg: "#fff7e6"
    },
    {
      title: "Agent Final Earning",
      value: agentFinal,
      icon: <WalletOutlined />,
      color: "#059669", // Green
      bg: "#d1fae5"
    }
  ];

  return (
    <div style={{ padding: "24px", background: "#f8f9fa", minHeight: "100vh" }}>
      
      {/* HEADER SECTION */}
      <div style={{ marginBottom: "32px", display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ padding: "10px", background: "#f3e8ff", borderRadius: "10px", color: "#5c039b" }}>
          <CalculatorOutlined style={{ fontSize: "24px" }} />
        </div>
        <div>
          <Title level={2} style={{ margin: 0, color: "#1f2937" }}>
            Profit & Payout Engine
          </Title>
          <Text type="secondary" style={{ fontSize: "15px" }}>
            Calculate commission splits, agency margins, and platform fees instantly.
          </Text>
        </div>
      </div>

      {/* INPUT SECTION (SLIDER + INPUT) */}
      <Card 
        bordered={false} 
        style={{ borderRadius: "16px", marginBottom: "32px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}
        bodyStyle={{ padding: "32px" }}
      >
        <Row gutter={[32, 24]} align="middle">
          <Col xs={24} md={16}>
            <Text strong style={{ fontSize: "16px", color: "#374151" }}>Adjust Deal Value (₹)</Text>
            <Slider
              min={100000} // Minimum 1 Lakh
              max={100000000} // Maximum 10 Cr
              step={100000}
              value={dealValue}
              onChange={(val) => setDealValue(val)}
              tooltip={{ formatter: (val) => `₹ ${val.toLocaleString()}` }}
              trackStyle={{ backgroundColor: "#5c039b", height: "8px" }}
              handleStyle={{ borderColor: "#5c039b", width: "20px", height: "20px", marginTop: "-6px" }}
              railStyle={{ height: "8px" }}
            />
            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              <Text type="secondary">1 Lakh</Text>
              <Text type="secondary">10 Cr</Text>
            </Space>
          </Col>
          <Col xs={24} md={8}>
            <Text strong style={{ fontSize: "14px", display: "block", marginBottom: "8px" }}>Exact Deal Value</Text>
            <InputNumber
              size="large"
              style={{ width: "100%", borderRadius: "8px", fontSize: "18px", fontWeight: "bold" }}
              value={dealValue}
              onChange={(val) => setDealValue(val || 0)}
              formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/₹\s?|(,*)/g, '')}
            />
          </Col>
        </Row>
      </Card>

      {/* RESULTS / BREAKDOWN SECTION */}
      <Row gutter={[24, 24]}>
        {results.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card 
              bordered={false} 
              style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", height: "100%" }}
              bodyStyle={{ padding: "24px" }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Text type="secondary" style={{ fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {stat.title}
                  </Text>
                  <div style={{ 
                    width: "40px", height: "40px", borderRadius: "10px", 
                    background: stat.bg, color: stat.color,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px"
                  }}>
                    {stat.icon}
                  </div>
                </div>
                <Title level={3} style={{ margin: 0, color: stat.color }}>
                  ₹ {stat.value.toLocaleString('en-IN')}
                </Title>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* INFO FOOTER */}
      <Card 
        bordered={false} 
        style={{ marginTop: "32px", borderRadius: "12px", background: "#e0e7ff", border: "1px solid #c084fc" }}
        bodyStyle={{ padding: "16px 24px" }}
      >
        <Space align="start">
          <InfoCircleOutlined style={{ color: "#5c039b", fontSize: "20px", marginTop: "2px" }} />
          <Text style={{ color: "#4c1d95", fontSize: "14.5px" }}>
            <strong>Transparency Notice:</strong> This calculation helps the agency understand the exact financial breakdown before closing a deal. All percentages can be configured globally from the admin settings.
          </Text>
        </Space>
      </Card>

    </div>
  );
};

export default AgencyProfitEngine;