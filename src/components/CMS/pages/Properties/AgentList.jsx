import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  Table,
  Typography,
  Avatar,
  Row,
  Col,
  Statistic,
  Space,
  message,
  Tooltip,
  Switch,
  Modal,
  Form,
  Input,
  Button,
  Popconfirm,
} from "antd";
import {
  UserOutlined,
  DeleteOutlined,
  EditOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const AgentList = () => {
  const BASE_URL = "https://xoto.ae/api/agent";

  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const [viewModal, setViewModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [form] = Form.useForm();

  // ✅ FETCH AGENTS
  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/get-all-agents`);
      const list = res.data?.data || res.data || [];
      setAgents(list);
      setTotal(list.length);
    } catch (err) {
      message.error("Failed to fetch agents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  // ✅ DELETE
  const deleteAgent = async (record) => {
    const id = record?._id || record?.id;
    if (!id) return message.error("Invalid ID");

    try {
      await axios.delete(`${BASE_URL}/agent/${id}`);
      message.success("Agent deleted");
      fetchAgents();
    } catch (err) {
      message.error("Delete failed");
    }
  };

  // ✅ ACTIVE / INACTIVE TOGGLE
  const toggleStatus = async (record, checked) => {
    const id = record?._id || record?.id;
    if (!id) return;

    try {
      await axios.post(`${BASE_URL}/update-agent`, {
        id,
        isActive: checked,
      });

      message.success(
        `Agent ${checked ? "Activated" : "Deactivated"}`
      );
      fetchAgents();
    } catch (err) {
      message.error("Status update failed");
    }
  };

  // ✅ OPEN VIEW MODAL
  const openViewModal = (record) => {
    setSelectedAgent(record);
    form.setFieldsValue(record);
    setViewModal(true);
  };

  const columns = [
    {
      title: "Agent Name",
      dataIndex: "name",
      render: (text, record) => (
        <Space>
          <Avatar size={50} icon={<UserOutlined />}>
            {record.name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      render: (checked, record) => (
        <Switch
          checked={checked}
          onChange={(val) => toggleStatus(record, val)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
        />
      ),
    },
    {
      title: "Action",
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <EditOutlined
              style={{ color: "#1677ff", cursor: "pointer" }}
              onClick={() => openViewModal(record)}
            />
          </Tooltip>

          <Tooltip title="Delete">
            <Popconfirm
              title="Delete this agent?"
              onConfirm={() => deleteAgent(record)}
            >
              <DeleteOutlined
                style={{ color: "red", cursor: "pointer" }}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <Title level={3}>Agent Management</Title>
        <Text type="secondary">
          Manage all registered agents
        </Text>
      </div>

      <Row className="mb-4">
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Agents"
              value={total}
              prefix={<UsergroupAddOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={agents}
          rowKey={(record) => record._id || record.id}
          loading={loading}
        />
      </Card>

      {/* VIEW MODAL */}
      <Modal
        title="Agent Details"
        open={viewModal}
        onCancel={() => setViewModal(false)}
        footer={[
          <Button key="close" onClick={() => setViewModal(false)}>
            Close
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">

          <Form.Item name="name" label="Name">
            <Input disabled />
          </Form.Item>

          <Form.Item name="email" label="Email">
            <Input disabled />
          </Form.Item>

          <Form.Item name="phone_number" label="Phone Number">
            <Input disabled />
          </Form.Item>

          <Form.Item name="country_code" label="Country Code">
            <Input disabled />
          </Form.Item>

          <Form.Item name="createdAt" label="Created At">
            <Input disabled />
          </Form.Item>

        </Form>
      </Modal>
    </div>
  );
};

export default AgentList;
