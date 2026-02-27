import React, { useState } from "react";
import {
  Card,
  Table,
  Typography,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Row,
  Col,
  Space,
  Avatar,
} from "antd";
import { 
  PlusOutlined, 
  UserOutlined, 
  IdcardOutlined, 
  BankOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

const AgencyRoles = () => {
  const [users, setUsers] = useState([
    {
      key: 1,
      name: "Rahul Sharma",
      role: "Branch Manager",
      branch: "Jaipur Head Office",
      status: "Active",
    },
    {
      key: 2,
      name: "Priya Mehta",
      role: "Senior Agent",
      branch: "Delhi Branch",
      status: "Active",
    },
    {
      key: 3,
      name: "Amit Jain",
      role: "Telecaller",
      branch: "Mumbai Hub",
      status: "Inactive",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleAddUser = (values) => {
    const newUser = {
      key: users.length + 1,
      ...values,
      status: "Active",
    };
    setUsers([...users, newUser]);
    setIsModalOpen(false);
    form.resetFields();
  };

  // Helper function for Role Tag Colors
  const getRoleColor = (role) => {
    switch (role) {
      case "Agency Owner": return "magenta";
      case "Branch Manager": return "purple";
      case "Senior Agent": return "blue";
      case "Telecaller": return "cyan";
      default: return "default";
    }
  };

  // Quick Stats Calculations
  const activeUsers = users.filter(u => u.status === "Active").length;
  const managersCount = users.filter(u => u.role === "Branch Manager").length;

  const stats = [
    { title: "Total Internal Users", value: users.length, icon: <TeamOutlined />, color: "#2563eb", bg: "#dbeafe" },
    { title: "Active Accounts", value: activeUsers, icon: <CheckCircleOutlined />, color: "#059669", bg: "#d1fae5" },
    { title: "Branch Managers", value: managersCount, icon: <SafetyCertificateOutlined />, color: "#5c039b", bg: "#f3e8ff" },
  ];

  const columns = [
    { 
      title: "User Profile", 
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
      )
    },
    {
      title: "Assigned Role",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag color={getRoleColor(role)} style={{ padding: "4px 12px", borderRadius: "12px", fontSize: "13px", fontWeight: "500" }}>
          {role}
        </Tag>
      ),
    },
    { 
      title: "Branch Location", 
      dataIndex: "branch",
      key: "branch",
      render: (text) => (
        <Space>
          <BankOutlined style={{ color: "#6b7280" }} />
          <Text style={{ color: "#4b5563" }}>{text}</Text>
        </Space>
      )
    },
    {
      title: "Account Status",
      dataIndex: "status",
      key: "status",
      align: "right",
      render: (status) => (
        <Tag color={status === "Active" ? "green" : "red"} style={{ padding: "4px 16px", borderRadius: "12px", fontSize: "13px" }}>
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
            Internal Role Management
          </Title>
          <Text type="secondary" style={{ fontSize: "15px" }}>
            Manage agency staff, assign roles, and allocate branches.
          </Text>
        </div>
        <Button
          size="large"
          type="primary"
          icon={<PlusOutlined />}
          style={{ background: "#5c039b", borderColor: "#5c039b", boxShadow: "0 4px 10px rgba(92, 3, 155, 0.2)", borderRadius: "8px" }}
          onClick={() => setIsModalOpen(true)}
        >
          Add Internal User
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
          <Title level={5} style={{ margin: 0, color: "#374151" }}>Staff Directory</Title>
        </div>
        <Table 
          columns={columns} 
          dataSource={users} 
          pagination={false} 
          style={{ padding: "0 24px 24px 24px" }}
        />
      </Card>

      {/* ADD USER MODAL */}
      <Modal
        title={
          <div style={{ fontSize: "20px", fontWeight: "bold", color: "#1f2937", marginBottom: "8px" }}>
            Add Internal User
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
        <Form form={form} layout="vertical" onFinish={handleAddUser} size="large">
          <Form.Item
            name="name"
            label={<span style={{ fontWeight: "500" }}>Full Name</span>}
            rules={[{ required: true, message: "Please enter full name" }]}
          >
            <Input prefix={<UserOutlined style={{ color: "#aaa" }} />} placeholder="e.g. Rahul Sharma" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="role"
                label={<span style={{ fontWeight: "500" }}>Assign Role</span>}
                rules={[{ required: true, message: "Please select a role" }]}
              >
                <Select placeholder="Select role">
                  <Option value="Agency Owner">Agency Owner</Option>
                  <Option value="Branch Manager">Branch Manager</Option>
                  <Option value="Senior Agent">Senior Agent</Option>
                  <Option value="Telecaller">Telecaller</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="branch"
                label={<span style={{ fontWeight: "500" }}>Assign Branch</span>}
                rules={[{ required: true, message: "Please select a branch" }]}
              >
                <Select placeholder="Select branch">
                  <Option value="Jaipur Head Office">Jaipur Head Office</Option>
                  <Option value="Delhi Branch">Delhi Branch</Option>
                  <Option value="Mumbai Hub">Mumbai Hub</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Button 
            type="primary" 
            htmlType="submit" 
            block
            style={{ height: "48px", background: "#5c039b", borderColor: "#5c039b", fontSize: "16px", marginTop: "12px", borderRadius: "8px" }}
          >
            Save User Details
          </Button>
        </Form>
      </Modal>

    </div>
  );
};

export default AgencyRoles;