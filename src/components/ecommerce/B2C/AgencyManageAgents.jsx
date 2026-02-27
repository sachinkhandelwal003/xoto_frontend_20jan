import React, { useState } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Tag,
  Space,
  Typography,
  Row,
  Col,
  Avatar,
  Switch,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  UserOutlined,
  SearchOutlined,
  TeamOutlined,
  TrophyOutlined,
  FireOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

const AgencyManageAgents = () => {
  const [agents, setAgents] = useState([
    { key: 1, name: "Rahul Sharma", email: "rahul@test.com", status: true, leads: 12, deals: 3 },
    { key: 2, name: "Priya Mehta", email: "priya@test.com", status: true, leads: 8, deals: 2 },
  ]);

  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleAddAgent = (values) => {
    const newAgent = {
      key: agents.length + 1,
      name: values.name,
      email: values.email,
      status: true,
      leads: 0,
      deals: 0,
    };
    setAgents([...agents, newAgent]);
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleDelete = (key) => {
    setAgents(agents.filter((agent) => agent.key !== key));
  };

  const toggleStatus = (key) => {
    setAgents(
      agents.map((agent) =>
        agent.key === key ? { ...agent, status: !agent.status } : agent
      )
    );
  };

  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Agent Details",
      key: "agent",
      render: (_, record) => (
        <Space size="middle">
          <Avatar
            size={48}
            style={{ backgroundColor: "#e0e7ff", color: "#4f46e5", fontWeight: "bold" }}
            icon={!record.name && <UserOutlined />}
          >
            {record.name?.charAt(0).toUpperCase()}
          </Avatar>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Text strong style={{ fontSize: "15px", color: "#1f2937" }}>{record.name}</Text>
            <Text type="secondary" style={{ fontSize: "13px" }}>{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Assigned Leads",
      dataIndex: "leads",
      align: "center",
      render: (val) => (
        <Tag color="blue" style={{ padding: "4px 12px", borderRadius: "12px", fontSize: "13px" }}>
          {val} Leads
        </Tag>
      ),
    },
    {
      title: "Closed Deals",
      dataIndex: "deals",
      align: "center",
      render: (val) => (
        <Tag color="green" style={{ padding: "4px 12px", borderRadius: "12px", fontSize: "13px" }}>
          {val} Deals
        </Tag>
      ),
    },
    {
      title: "Account Status",
      align: "center",
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Switch
            checked={record.status}
            onChange={() => toggleStatus(record.key)}
            style={{ background: record.status ? "#059669" : "#d1d5db" }}
          />
          <Text type="secondary" style={{ fontSize: "11px" }}>
            {record.status ? "Active" : "Inactive"}
          </Text>
        </Space>
      ),
    },
    {
      title: "Action",
      align: "right",
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record.key)}
          style={{ fontWeight: "500", borderRadius: "6px" }}
        >
          Remove
        </Button>
      ),
    },
  ];

  // Calculated Stats
  const totalLeads = agents.reduce((sum, a) => sum + a.leads, 0);
  const totalDeals = agents.reduce((sum, a) => sum + a.deals, 0);

  const stats = [
    { title: "Total Agents", value: agents.length, icon: <TeamOutlined />, color: "#5c039b", bg: "#f3e8ff" },
    { title: "Total Leads", value: totalLeads, icon: <FireOutlined />, color: "#2563eb", bg: "#dbeafe" },
    { title: "Total Deals", value: totalDeals, icon: <TrophyOutlined />, color: "#059669", bg: "#d1fae5" },
  ];

  return (
    <div style={{ padding: "24px", background: "#f8f9fa", minHeight: "100vh" }}>
      
      {/* HEADER SECTION */}
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <Title level={2} style={{ margin: 0, color: "#1f2937" }}>
            Manage Agents
          </Title>
          <Text type="secondary" style={{ fontSize: "15px" }}>
            Add, remove, and track performance of your agency staff.
          </Text>
        </div>
        <Button
          size="large"
          type="primary"
          icon={<PlusOutlined />}
          style={{ background: "#5c039b", borderColor: "#5c039b", boxShadow: "0 4px 10px rgba(92, 3, 155, 0.2)", borderRadius: "8px" }}
          onClick={() => setIsModalOpen(true)}
        >
          Add New Agent
        </Button>
      </div>

      {/* TOP STATS */}
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

      {/* MAIN TABLE CARD */}
      <Card 
        bordered={false} 
        style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ padding: "24px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <Title level={5} style={{ margin: 0, color: "#374151" }}>Agent Directory</Title>
          <Input
            size="large"
            prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
            placeholder="Search by agent name..."
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: "100%", maxWidth: "300px", borderRadius: "8px" }}
            allowClear
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredAgents}
          pagination={{ pageSize: 5, position: ["bottomCenter"] }}
          style={{ padding: "0 24px 24px 24px" }}
        />
      </Card>

      {/* ADD AGENT MODAL */}
      <Modal
        title={
          <div style={{ fontSize: "20px", fontWeight: "bold", color: "#1f2937", marginBottom: "8px" }}>
            Add New Agent
          </div>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        centered
        destroyOnClose
        styles={{ padding: "24px" }}
      >
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleAddAgent}
          size="large"
        >
          <Form.Item
            name="name"
            label={<span style={{ fontWeight: "500" }}>Agent Full Name</span>}
            rules={[{ required: true, message: "Please enter agent name" }]}
          >
            <Input placeholder="e.g. Rahul Sharma" prefix={<UserOutlined style={{ color: "#aaa" }} />} />
          </Form.Item>

          <Form.Item
            name="email"
            label={<span style={{ fontWeight: "500" }}>Email Address</span>}
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Enter a valid email address" },
            ]}
          >
            <Input placeholder="e.g. rahul@agency.com" />
          </Form.Item>

          <Button 
            type="primary" 
            htmlType="submit" 
            block 
            style={{ height: "48px", background: "#5c039b", borderColor: "#5c039b", fontSize: "16px", marginTop: "12px" }}
          >
            Create Agent Account
          </Button>
        </Form>
      </Modal>

    </div>
  );
};

export default AgencyManageAgents;