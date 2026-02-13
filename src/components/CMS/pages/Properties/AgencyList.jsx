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
  Select,
  Modal,
  Form,
  Input,
  Button,
  Popconfirm,
  Tag,
} from "antd";
import {
  ApartmentOutlined,
  DeleteOutlined,
  EditOutlined,
  TeamOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

const AgencyList = () => {
  const BASE_URL = "https://xoto.ae/api/agency";

  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const [viewModal, setViewModal] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [form] = Form.useForm();

  // ✅ FETCH AGENCIES
  const fetchAgencies = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/get-all-agencies`);
      const list = res.data?.data || res.data || [];
      setAgencies(list);
      setTotal(list.length);
    } catch (err) {
      message.error("Failed to fetch agencies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencies();
  }, []);

  // ✅ DELETE AGENCY
  const deleteAgency = async (record) => {
    const id = record?._id;
    if (!id) return message.error("Invalid ID");

    try {
      await axios.delete(`${BASE_URL}/delete-agency/${id}`);
      message.success("Agency deleted");
      fetchAgencies();
    } catch (err) {
      message.error("Delete failed");
    }
  };

  // ✅ UPDATE ONBOARDING STATUS
  const updateStatus = async (record, status) => {
    const id = record?._id;
    if (!id) return;

    try {
      await axios.post(
        `${BASE_URL}/update-agency?id=${id}`,
        {
          onboarding_status: status,
        }
      );

      message.success("Status updated");
      fetchAgencies();
    } catch (err) {
      console.log(err.response?.data);
      message.error("Status update failed");
    }
  };

  // ✅ OPEN VIEW MODAL
  const openViewModal = (record) => {
    setSelectedAgency(record);
    form.setFieldsValue(record);
    setViewModal(true);
  };

  const columns = [
    {
      title: "Agency",
      dataIndex: "agency_name",
      render: (text, record) => (
        <Space>
          <Avatar size={50} icon={<ApartmentOutlined />}>
            {record.agency_name?.charAt(0)?.toUpperCase()}
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
      title: "Mobile",
      render: (_, record) => (
        <Text>
          {record.country_code} {record.mobile_number}
        </Text>
      ),
    },
    {
      title: "Onboarding Status",
      dataIndex: "onboarding_status",
      render: (status, record) => {
        const colorMap = {
          registered: "orange",
          approved: "blue",
          completed: "green",
        };

        return (
          <Select
            value={status}
            style={{ width: 130 }}
            onChange={(value) => updateStatus(record, value)}
          >
            <Option value="registered">Registered</Option>
            <Option value="approved">Approved</Option>
            <Option value="completed">Completed</Option>
          </Select>
        );
      },
    },
    {
      title: "Active",
      dataIndex: "is_active",
      render: (active) => (
        <Tag color={active ? "green" : "red"}>
          {active ? "Active" : "Inactive"}
        </Tag>
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
              title="Delete this agency?"
              onConfirm={() => deleteAgency(record)}
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
        <Title level={3}>Agency Management</Title>
        <Text type="secondary">
          Manage all registered agencies
        </Text>
      </div>

      <Row className="mb-4">
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Agencies"
              value={total}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={agencies}
          rowKey="_id"
          loading={loading}
        />
      </Card>

      {/* VIEW MODAL */}
      <Modal
        title="Agency Details"
        open={viewModal}
        onCancel={() => setViewModal(false)}
        footer={[
          <Button key="close" onClick={() => setViewModal(false)}>
            Close
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="agency_name" label="Agency Name">
            <Input disabled />
          </Form.Item>

          <Form.Item name="email" label="Email">
            <Input disabled />
          </Form.Item>

          <Form.Item name="mobile_number" label="Mobile">
            <Input disabled />
          </Form.Item>

          <Form.Item name="onboarding_status" label="Onboarding Status">
            <Input disabled />
          </Form.Item>

          <Form.Item name="subscription_status" label="Subscription">
            <Input disabled />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AgencyList;
