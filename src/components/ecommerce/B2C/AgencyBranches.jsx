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
  Switch,
  Space,
  Row,
  Col,
  Avatar,
} from "antd";
import {
  PlusOutlined,
  BankOutlined,
  EnvironmentOutlined,
  UserOutlined,
  ShopOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

const AgencyBranches = () => {
  const [branches, setBranches] = useState([
    {
      key: 1,
      name: "Jaipur Head Office",
      location: "Malviya Nagar, Jaipur",
      manager: "Rahul Sharma",
      active: true,
    },
    {
      key: 2,
      name: "Delhi Branch",
      location: "Connaught Place, Delhi",
      manager: "Priya Mehta",
      active: true,
    },
    {
      key: 3,
      name: "Mumbai Hub",
      location: "Andheri West, Mumbai",
      manager: "Amit Jain",
      active: false,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleAddBranch = (values) => {
    const newBranch = {
      key: branches.length + 1,
      ...values,
      active: true,
    };
    setBranches([...branches, newBranch]);
    setIsModalOpen(false);
    form.resetFields();
  };

  const toggleStatus = (key) => {
    setBranches(
      branches.map((b) =>
        b.key === key ? { ...b, active: !b.active } : b
      )
    );
  };

  // Quick Stats
  const activeBranches = branches.filter((b) => b.active).length;
  const inactiveBranches = branches.length - activeBranches;

  const stats = [
    { title: "Total Branches", value: branches.length, icon: <ShopOutlined />, color: "#2563eb", bg: "#dbeafe" },
    { title: "Active Branches", value: activeBranches, icon: <CheckCircleOutlined />, color: "#059669", bg: "#d1fae5" },
    { title: "Inactive Branches", value: inactiveBranches, icon: <StopOutlined />, color: "#ef4444", bg: "#fee2e2" },
  ];

  const columns = [
    { 
      title: "Branch Name", 
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <Space>
          <div style={{ padding: "8px", background: "#f3e8ff", borderRadius: "8px", color: "#5c039b" }}>
            <BankOutlined />
          </div>
          <Text strong style={{ color: "#1f2937", fontSize: "15px" }}>{text}</Text>
        </Space>
      )
    },
    { 
      title: "Location", 
      dataIndex: "location",
      key: "location",
      render: (text) => (
        <Space>
          <EnvironmentOutlined style={{ color: "#6b7280" }} />
          <Text style={{ color: "#4b5563" }}>{text}</Text>
        </Space>
      )
    },
    { 
      title: "Branch Manager", 
      dataIndex: "manager",
      key: "manager",
      render: (text) => (
        <Space>
          <Avatar size="small" style={{ backgroundColor: "#5c039b" }} icon={!text && <UserOutlined />}>
            {text?.charAt(0)}
          </Avatar>
          <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: "Status",
      key: "status",
      align: "center",
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Switch
            checked={record.active}
            onChange={() => toggleStatus(record.key)}
            style={{ background: record.active ? "#059669" : "#d1d5db" }}
          />
          <Text type="secondary" style={{ fontSize: "11px" }}>
            {record.active ? "Active" : "Inactive"}
          </Text>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f8f9fa", minHeight: "100vh" }}>
      
      {/* HEADER SECTION */}
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <Title level={2} style={{ margin: 0, color: "#1f2937" }}>
            Branch Management
          </Title>
          <Text type="secondary" style={{ fontSize: "15px" }}>
            Add and monitor all your agency branches and their statuses.
          </Text>
        </div>
        <Button
          size="large"
          type="primary"
          icon={<PlusOutlined />}
          style={{ background: "#5c039b", borderColor: "#5c039b", boxShadow: "0 4px 10px rgba(92, 3, 155, 0.2)", borderRadius: "8px" }}
          onClick={() => setIsModalOpen(true)}
        >
          Add New Branch
        </Button>
      </div>

      {/* STATS SECTION */}
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
          <Title level={5} style={{ margin: 0, color: "#374151" }}>Registered Branches</Title>
        </div>
        <Table 
          columns={columns} 
          dataSource={branches} 
          pagination={false} 
          style={{ padding: "0 24px 24px 24px" }}
        />
      </Card>

      {/* ADD BRANCH MODAL */}
      <Modal
        title={
          <div style={{ fontSize: "20px", fontWeight: "bold", color: "#1f2937", marginBottom: "8px" }}>
            Create New Branch
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
        <Form form={form} layout="vertical" onFinish={handleAddBranch} size="large">
          <Form.Item
            name="name"
            label={<span style={{ fontWeight: "500" }}>Branch Name</span>}
            rules={[{ required: true, message: "Please enter branch name" }]}
          >
            <Input prefix={<BankOutlined style={{ color: "#aaa" }} />} placeholder="e.g. Jaipur Head Office" />
          </Form.Item>

          <Form.Item
            name="location"
            label={<span style={{ fontWeight: "500" }}>Location Address</span>}
            rules={[{ required: true, message: "Please enter location" }]}
          >
            <Input prefix={<EnvironmentOutlined style={{ color: "#aaa" }} />} placeholder="e.g. Malviya Nagar, Jaipur" />
          </Form.Item>

          <Form.Item
            name="manager"
            label={<span style={{ fontWeight: "500" }}>Branch Manager</span>}
            rules={[{ required: true, message: "Please select a manager" }]}
          >
            <Select placeholder="Assign a manager to this branch">
              <Option value="Rahul Sharma">Rahul Sharma</Option>
              <Option value="Priya Mehta">Priya Mehta</Option>
              <Option value="Amit Jain">Amit Jain</Option>
            </Select>
          </Form.Item>

          <Button 
            type="primary" 
            htmlType="submit" 
            block
            style={{ height: "48px", background: "#5c039b", borderColor: "#5c039b", fontSize: "16px", marginTop: "12px", borderRadius: "8px" }}
          >
            Save Branch Details
          </Button>
        </Form>
      </Modal>

    </div>
  );
};

export default AgencyBranches;