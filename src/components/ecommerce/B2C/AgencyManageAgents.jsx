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
  Upload,
  Select,
} from "antd";

import {
  PlusOutlined,
  DeleteOutlined,
  UserOutlined,
  SearchOutlined,
  UploadOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const AgencyManageAgents = () => {
  const [agents, setAgents] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleAddAgent = (values) => {
    const newAgent = {
      key: Date.now(),
      name: `${values.firstName} ${values.lastName}`,
      email: values.email,
      role: values.role,
      status: true,
      leads: 0,
      deals: 0,
    };

    setAgents([...agents, newAgent]);
    setIsModalOpen(false);
    form.resetFields();
  };

  const toggleStatus = (key) => {
    setAgents(
      agents.map((agent) =>
        agent.key === key ? { ...agent, status: !agent.status } : agent
      )
    );
  };

  const columns = [
    {
      title: "Agent Details",
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary">{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      render: (role) => <Tag color="purple">{role}</Tag>,
    },
    {
      title: "Status",
      render: (_, record) => (
        <Switch
          checked={record.status}
          onChange={() => toggleStatus(record.key)}
        />
      ),
    },
    {
      title: "Action",
      render: (_, record) => (
        <Button danger icon={<DeleteOutlined />} />
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: "#f8f9fa", minHeight: "100vh" }}>
      {/* HEADER */}
      <div
        style={{
          marginBottom: 30,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          <Title level={2}>Manage Agents</Title>
          <Text type="secondary">
            Add, remove, and track performance of your agency staff.
          </Text>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ background: "#5c039b" }}
          onClick={() => setIsModalOpen(true)}
        >
          Add New Agent
        </Button>
      </div>

      {/* TABLE */}
      <Card>
        <Table columns={columns} dataSource={agents} />
      </Card>

      {/* MODAL */}
      <Modal
        title="Add New Agent"
        open={isModalOpen}
        footer={null}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form layout="vertical" form={form} onFinish={handleAddAgent}>
          
          {/* ROLE DROPDOWN */}

          <Form.Item
            name="role"
            label="Add As"
            rules={[{ required: true, message: "Select role" }]}
          >
            <Select placeholder="Select role">
              <Select.Option value="Manager">Manager</Select.Option>
              <Select.Option value="Agent">Agent</Select.Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[
                  { required: true, message: "Enter first name" },
                  { min: 2, message: "Minimum 2 characters" },
                ]}
              >
                <Input placeholder="First Name" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[{ required: true, message: "Enter last name" }]}
              >
                <Input placeholder="Last Name" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Enter email" },
              { type: "email", message: "Enter valid email" },
            ]}
          >
            <Input placeholder="Email Address" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: "Enter password" },
              { min: 6, message: "Minimum 6 characters" },
            ]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>

          {/* PHONE NUMBER */}

          <Form.Item label="Phone Number" required>
            <Input.Group compact>
              <Form.Item
                name="countryCode"
                noStyle
                rules={[{ required: true }]}
              >
                <Select style={{ width: "30%" }} defaultValue="+971">
                  <Select.Option value="+971">+971 UAE</Select.Option>
                  <Select.Option value="+91">+91 India</Select.Option>
                  <Select.Option value="+1">+1 USA</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="phone"
                noStyle
                rules={[
                  { required: true, message: "Enter phone number" },
                  {
                    pattern: /^[0-9]{7,12}$/,
                    message: "Enter valid phone number",
                  },
                ]}
              >
                <Input style={{ width: "70%" }} placeholder="Phone Number" />
              </Form.Item>
            </Input.Group>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="city"
                label="Operating City"
                rules={[{ required: true, message: "Enter city" }]}
              >
                <Input placeholder="Dubai, Abu Dhabi" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="specialization"
                label="Specialization"
                rules={[{ required: true, message: "Select specialization" }]}
              >
                <Select placeholder="Select specialization">
                  <Select.Option value="Residential">
                    Residential
                  </Select.Option>
                  <Select.Option value="Commercial">
                    Commercial
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* FILE UPLOADS */}

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="profilePhoto"
                label="Profile Photo"
                rules={[{ required: true, message: "Upload photo" }]}
              >
                <Upload beforeUpload={() => false}>
                  <Button icon={<UploadOutlined />}>Upload Photo</Button>
                </Upload>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="idProof"
                label="ID Proof"
                rules={[{ required: true, message: "Upload ID proof" }]}
              >
                <Upload beforeUpload={() => false}>
                  <Button icon={<UploadOutlined />}>
                    Upload Emirates ID
                  </Button>
                </Upload>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="rera"
                label="RERA Certificate"
                rules={[{ required: true, message: "Upload RERA certificate" }]}
              >
                <Upload beforeUpload={() => false}>
                  <Button icon={<UploadOutlined />}>Upload RERA</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <Button
            type="primary"
            htmlType="submit"
            block
            style={{
              background: "#5c039b",
              borderColor: "#5c039b",
              marginTop: 10,
              height: 45,
            }}
          >
            Complete Registration
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default AgencyManageAgents;