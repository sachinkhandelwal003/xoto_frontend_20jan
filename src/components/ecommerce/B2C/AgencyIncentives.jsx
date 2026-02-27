import React, { useState } from "react";
import { 
  Card, Table, Typography, Button, Modal, Form, Input, Select, Tag, Row, Col, Space, Avatar 
} from "antd";
import { 
  PlusOutlined, 
  GiftOutlined, 
  AimOutlined, // ✅ FIX: Changed TargetOutlined to AimOutlined
  PercentageOutlined,
  UserOutlined,
  RocketOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

const AgencyIncentives = () => {
  const [rules, setRules] = useState([
    {
      key: 1,
      agent: "Rahul Sharma",
      target: 10,
      bonusPercent: 5,
      status: "Active",
    },
    {
      key: 2,
      agent: "Priya Mehta",
      target: 15,
      bonusPercent: 8,
      status: "Active",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleAddRule = (values) => {
    const newRule = {
      key: rules.length + 1,
      ...values,
      status: "Active",
    };
    setRules([...rules, newRule]);
    setIsModalOpen(false);
    form.resetFields();
  };

  // Quick Stats
  const activeRulesCount = rules.filter(r => r.status === "Active").length;
  const maxBonus = rules.length > 0 ? Math.max(...rules.map(r => r.bonusPercent)) : 0;

  const stats = [
    { title: "Active Programs", value: activeRulesCount, icon: <RocketOutlined />, color: "#2563eb", bg: "#dbeafe" },
    { title: "Highest Bonus %", value: `${maxBonus}%`, icon: <PercentageOutlined />, color: "#059669", bg: "#d1fae5" },
    { title: "Total Rules Configured", value: rules.length, icon: <GiftOutlined />, color: "#5c039b", bg: "#f3e8ff" },
  ];

  const columns = [
    { 
      title: "Agent Name", 
      key: "agent",
      render: (_, record) => (
        <Space size="middle">
          <Avatar 
            size={40} 
            style={{ backgroundColor: "#e0e7ff", color: "#4f46e5", fontWeight: "bold" }}
            icon={!record.agent && <UserOutlined />}
          >
            {record.agent?.charAt(0)}
          </Avatar>
          <Text strong style={{ fontSize: "15px", color: "#1f2937" }}>{record.agent}</Text>
        </Space>
      )
    },
    { 
      title: "Target Deals", 
      dataIndex: "target",
      align: "center",
      render: (val) => (
        <Text style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}>
          {val} Deals
        </Text>
      )
    },
    {
      title: "Bonus Reward",
      dataIndex: "bonusPercent",
      align: "center",
      render: (val) => (
        <Tag color="purple" style={{ padding: "4px 12px", borderRadius: "12px", fontSize: "14px", fontWeight: "bold" }}>
          {val}% Extra
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      align: "right",
      render: (status) => (
        <Tag color="green" style={{ padding: "4px 16px", borderRadius: "12px", fontSize: "13px" }}>
          {status}
        </Tag>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f8f9fa", minHeight: "100vh" }}>
      
      {/* HEADER SECTION */}
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <Title level={2} style={{ margin: 0, color: "#1f2937" }}>
            Bonus & Incentives
          </Title>
          <Text type="secondary" style={{ fontSize: "15px" }}>
            Configure targets and bonus percentages to motivate your agents.
          </Text>
        </div>
        <Button
          size="large"
          type="primary"
          icon={<PlusOutlined />}
          style={{ background: "#5c039b", borderColor: "#5c039b", boxShadow: "0 4px 10px rgba(92, 3, 155, 0.2)", borderRadius: "8px" }}
          onClick={() => setIsModalOpen(true)}
        >
          Create Incentive Rule
        </Button>
      </div>

      {/* STATS SECTION */}
      <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
        {stats.map((stat, index) => (
          <Col xs={24} md={8} key={index}>
            <Card 
              bordered={false} 
              style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
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
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* TABLE SECTION */}
      <Card 
        bordered={false} 
        style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ padding: "24px", borderBottom: "1px solid #f0f0f0" }}>
          <Title level={5} style={{ margin: 0, color: "#374151" }}>Active Incentive Programs</Title>
        </div>
        <Table 
          columns={columns} 
          dataSource={rules} 
          pagination={false} 
          style={{ padding: "0 24px 24px 24px" }}
        />
      </Card>

      {/* CREATE RULE MODAL */}
      <Modal
        title={
          <div style={{ fontSize: "20px", fontWeight: "bold", color: "#1f2937", marginBottom: "8px" }}>
            New Incentive Rule
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
        destroyOnClose
        styles={{ padding: "24px" }}
      >
        <Form form={form} layout="vertical" onFinish={handleAddRule} size="large">
          <Form.Item
            name="agent"
            label={<span style={{ fontWeight: "500" }}>Select Agent</span>}
            rules={[{ required: true, message: "Please select an agent" }]}
          >
            <Select placeholder="Choose an agent to motivate">
              <Option value="Rahul Sharma">Rahul Sharma</Option>
              <Option value="Priya Mehta">Priya Mehta</Option>
              <Option value="Amit Jain">Amit Jain</Option>
              <Option value="Neha Gupta">Neha Gupta</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="target"
                label={<span style={{ fontWeight: "500" }}>Target Deals</span>}
                rules={[{ required: true, message: "Required" }]}
              >
                {/* ✅ FIX: Used AimOutlined here */}
                <Input type="number" prefix={<AimOutlined style={{ color: "#aaa" }} />} placeholder="e.g. 10" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="bonusPercent"
                label={<span style={{ fontWeight: "500" }}>Bonus Percentage</span>}
                rules={[{ required: true, message: "Required" }]}
              >
                <Input type="number" prefix={<PercentageOutlined style={{ color: "#aaa" }} />} placeholder="e.g. 5" suffix="%" />
              </Form.Item>
            </Col>
          </Row>

          <Button 
            type="primary" 
            htmlType="submit" 
            block
            style={{ height: "48px", background: "#5c039b", borderColor: "#5c039b", fontSize: "16px", marginTop: "12px", borderRadius: "8px" }}
          >
            Save Incentive Rule
          </Button>
        </Form>
      </Modal>

    </div>
  );
};

export default AgencyIncentives;