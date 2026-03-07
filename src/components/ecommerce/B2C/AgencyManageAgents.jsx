import React, { useState, useEffect } from "react";
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
  UploadOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import { apiService } from "../../../manageApi/utils/custom.apiservice";
import { toast } from "react-toastify";

const { Title, Text } = Typography;
const { Option } = Select;

const AgencyManageAgents = () => {

  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  const [urls, setUrls] = useState({
    profile: "",
    idProof: "",
    rera: "",
  });

  const [uploading, setUploading] = useState({
    profile: false,
    idProof: false,
    rera: false,
  });

  /* ================= FETCH AGENTS ================= */

  const fetchAgents = async () => {
    try {

      const res = await apiService.get("agent/get-all-agents");

      const agentsData = res?.data || [];

      const formatted = agentsData.map((agent) => ({
        key: agent._id,
        name: `${agent.first_name} ${agent.last_name}`,
        email: agent.email,
        role: agent.role || "Agent",
        status: agent.status ?? true,
      }));

      setAgents(formatted);
      setFilteredAgents(formatted);

    } catch (error) {
      toast.error("Failed to load agents");
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  /* ================= SEARCH ================= */

  const handleSearch = (value) => {

    setSearchText(value);

    const filtered = agents.filter((agent) =>
      agent.name.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredAgents(filtered);
  };

  /* ================= FILE UPLOAD ================= */

  const handleInstantUpload = async (file, type) => {

    const formData = new FormData();
    formData.append("file", file);

    setUploading((prev) => ({ ...prev, [type]: true }));

    try {

      const res = await apiService.upload("upload", formData);

      const uploadedUrl = res?.file?.url || res?.url;

      if (uploadedUrl) {

        setUrls((prev) => ({
          ...prev,
          [type]: uploadedUrl,
        }));

        toast.success(`${type} uploaded`);

      }

    } catch (error) {

      toast.error("Upload failed");

    }

    setUploading((prev) => ({
      ...prev,
      [type]: false,
    }));

    return false;
  };

  /* ================= ADD AGENT ================= */

  const handleAddAgent = async (values) => {

  try {

    const payload = {

      ...values,

      profile_photo: urls.profile,
      id_proof: urls.idProof,
      rera_certificate: urls.rera

    };

    await apiService.post(
      "agent/agent-signup",
      payload
    );

    toast.success("Agent added successfully");

    fetchAgents();

    form.resetFields();
    setUrls({
      profile: "",
      idProof: "",
      rera: ""
    });

    setIsModalOpen(false);

  } catch (error) {

    toast.error(
      error?.response?.data?.message ||
      "Failed to create agent"
    );

  }

};

  /* ================= DELETE AGENT ================= */

  const handleDelete = async (id) => {

    try {

     await apiService.delete(`agent/delete-agent/${id}`);

      toast.success("Agent deleted");

      fetchAgents();

    } catch (error) {

      toast.error("Delete failed");

    }

  };

  /* ================= STATUS ================= */

  const toggleStatus = (key) => {

    setFilteredAgents(
      filteredAgents.map((agent) =>
        agent.key === key
          ? { ...agent, status: !agent.status }
          : agent
      )
    );

  };

  /* ================= TABLE ================= */

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
      render: (role) => (
        <Tag color="purple">{role}</Tag>
      ),
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
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record.key)}
        />
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
          alignItems: "center"
        }}
      >

        <div>
          <Title level={2}>Manage Agents</Title>
          <Text type="secondary">
            Add and manage your agency agents.
          </Text>
        </div>

        <Space>

          <Input
            placeholder="Search agent..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
          />

          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ background: "#5c039b" }}
            onClick={() => setIsModalOpen(true)}
          >
            Add New Agent
          </Button>

        </Space>

      </div>

      {/* TABLE */}

      <Card>
        <Table
          columns={columns}
          dataSource={filteredAgents}
          pagination={{ pageSize: 6 }}
        />
      </Card>

      {/* MODAL */}

    <Modal
  title="Add New Agent"
  open={isModalOpen}
  footer={null}
  centered
  width={720}
  onCancel={() => setIsModalOpen(false)}
>
<Form layout="vertical" form={form} onFinish={handleAddAgent}>

<Form.Item
  name="role"
  label="Add As"
  rules={[{ required: true }]}
>
  <Select placeholder="Select role">
    <Option value="Manager">Manager</Option>
    <Option value="Agent">Agent</Option>
  </Select>
</Form.Item>

<Row gutter={16}>

  <Col xs={24} md={12}>
    <Form.Item name="first_name" label="First Name" rules={[{ required: true }]}>
      <Input />
    </Form.Item>
  </Col>

  <Col xs={24} md={12}>
    <Form.Item name="last_name" label="Last Name" rules={[{ required: true }]}>
      <Input />
    </Form.Item>
  </Col>

</Row>

<Form.Item name="email" label="Email" rules={[{ required: true }, { type: "email" }]}>
  <Input />
</Form.Item>

<Form.Item name="password" label="Password" rules={[{ required: true }]}>
  <Input.Password />
</Form.Item>

{/* PHONE */}

<Row gutter={16}>

  <Col xs={24} md={8}>
    <Form.Item
      name="country_code"
      label="Country Code"
      rules={[{ required: true }]}
    >
      <Select>
        <Option value="+971">+971 UAE</Option>
        <Option value="+91">+91 India</Option>
      </Select>
    </Form.Item>
  </Col>

  <Col xs={24} md={16}>
    <Form.Item
      name="phone_number"
      label="Phone Number"
      rules={[{ required: true }]}
    >
      <Input />
    </Form.Item>
  </Col>

</Row>

<Row gutter={16}>

  <Col xs={24} md={12}>
    <Form.Item
      name="country"
      label="Country"
      rules={[{ required: true }]}
    >
      <Input placeholder="UAE / India" />
    </Form.Item>
  </Col>

  <Col xs={24} md={12}>
    <Form.Item
      name="operating_city"
      label="Operating City"
      rules={[{ required: true }]}
    >
      <Input />
    </Form.Item>
  </Col>

</Row>

<Row gutter={16}>

  <Col xs={24} md={12}>
    <Form.Item
      name="specialization"
      label="Specialization"
      rules={[{ required: true }]}
    >
      <Select>
        <Option value="Residential">Residential</Option>
        <Option value="Commercial">Commercial</Option>
      </Select>
    </Form.Item>
  </Col>

</Row>

{/* FILE UPLOAD */}

<Row gutter={16}>

  <Col xs={24} md={8}>
    <Upload
      showUploadList={false}
      beforeUpload={(file) => handleInstantUpload(file, "profile")}
    >
      <Button block icon={<UploadOutlined />} loading={uploading.profile}>
        Upload Photo
      </Button>
    </Upload>
  </Col>

  <Col xs={24} md={8}>
    <Upload
      showUploadList={false}
      beforeUpload={(file) => handleInstantUpload(file, "idProof")}
    >
      <Button block icon={<UploadOutlined />} loading={uploading.idProof}>
        Upload ID
      </Button>
    </Upload>
  </Col>

  <Col xs={24} md={8}>
    <Upload
      showUploadList={false}
      beforeUpload={(file) => handleInstantUpload(file, "rera")}
    >
      <Button block icon={<UploadOutlined />} loading={uploading.rera}>
        Upload RERA
      </Button>
    </Upload>
  </Col>

</Row>

<Button
  type="primary"
  htmlType="submit"
  block
  size="large"
  style={{ background: "#5c039b", marginTop: 20 }}
>
  Complete Registration
</Button>

</Form>
</Modal>

    </div>
  );
};

export default AgencyManageAgents;

