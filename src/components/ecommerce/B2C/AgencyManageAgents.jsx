import React, { useState, useEffect } from "react";
import {
  Card, Button, Modal, Form, Input, Tag, Typography, Row, Col, Avatar,
  Upload, Select, InputNumber, Tooltip, Divider, Space, Badge, Statistic,
  Spin, Empty, message, Image, Table, Steps, Alert, Popconfirm
} from "antd";
import {
  PlusOutlined, DeleteOutlined, UserOutlined, SearchOutlined,
  CheckCircleFilled, IdcardOutlined, FileDoneOutlined, EditOutlined,
  EyeOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined,
  TrophyOutlined, CalendarOutlined, UploadOutlined, CloseCircleOutlined,
  FilterOutlined, MoreOutlined, FlagOutlined, TeamOutlined
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import { toast } from "react-toastify";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Helper component for uploading with preview and removal
const UploadField = ({ type, label, icon, accept, urls, uploadFiles, uploading, onUpload, onRemove }) => {
  const handleFile = (file) => {
    onUpload(file, type);
    return false;
  };

  const remove = () => onRemove(type);

  return (
    <div className="upload-field">
      {urls[type] ? (
        <div className="upload-preview">
          {type === "profile" ? (
            <div className="relative inline-block">
              <Avatar src={urls[type]} size={64} className="border-2 border-white shadow-md" />
              <Button
                type="text"
                icon={<CloseCircleOutlined />}
                onClick={remove}
                className="absolute -top-2 -right-2 bg-white rounded-full shadow"
                size="small"
                danger
              />
            </div>
          ) : (
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
              <Text className="truncate flex-1">{uploadFiles[type]?.name || label}</Text>
              <Button
                type="text"
                icon={<DeleteOutlined />}
                onClick={remove}
                size="small"
                danger
              />
            </div>
          )}
          <Text type="success" className="text-xs mt-1">Uploaded ✓</Text>
        </div>
      ) : (
        <Upload
          showUploadList={false}
          beforeUpload={handleFile}
          accept={accept}
        >
          <Button
            loading={uploading[type]}
            icon={icon}
            className="w-full rounded-lg border-dashed border-2 border-gray-300 hover:border-purple-500 hover:text-purple-600 transition-colors"
          >
            {label}
          </Button>
        </Upload>
      )}
    </div>
  );
};

const AgencyManageAgents = () => {
  const { user } = useSelector((s) => s.auth);
  const agencyId = user?._id || user?.id;

  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [form] = Form.useForm();
  const [urls, setUrls] = useState({ profile: "", idProof: "", rera: "" });
  const [uploading, setUploading] = useState({ profile: false, idProof: false, rera: false });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [uploadFiles, setUploadFiles] = useState({ profile: null, idProof: null, rera: null });
  const [currentStep, setCurrentStep] = useState(0);

  // Fetch agents
  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await apiService.get("/agent/get-all-agents/agency");
      let agentsData = res?.data;
      if (!Array.isArray(agentsData)) {
        console.error("Not array:", agentsData);
        return;
      }
      const formatted = agentsData.map((agent) => ({
        key: agent._id,
        id: agent._id,
        name: `${agent.first_name} ${agent.last_name}`,
        email: agent.email,
        phone: `${agent.country_code || ""} ${agent.phone_number || ""}`,
        role: agent.role || "Agent",
        status: agent.status ?? true,
        avatar: agent.profile_photo,
        city: agent.operating_city,
        country: agent.country,
        specialization: agent.specialization,
        experience: agent.experience_years,
        reraNumber: agent.rera_number,
        idProof: agent.id_proof,
        reraCertificate: agent.rera_certificate,
      }));
      setAgents(formatted);
      setFilteredAgents(formatted);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load agents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  // Filter logic
  useEffect(() => {
    let filtered = agents;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.phone.toLowerCase().includes(q) ||
          a.city?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((a) =>
        statusFilter === "active" ? a.status : !a.status
      );
    }
    setFilteredAgents(filtered);
  }, [searchQuery, statusFilter, agents]);

  // File upload
  const handleInstantUpload = async (file, type) => {
    const allowedTypes = type === "profile"
      ? ["image/jpeg", "image/png", "image/jpg"]
      : ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type");
      return false;
    }
    const formData = new FormData();
    formData.append("file", file);
    setUploading((prev) => ({ ...prev, [type]: true }));
    try {
      const res = await apiService.upload("upload", formData);
      const uploadedUrl = res?.file?.url || res?.url;
      if (uploadedUrl) {
        setUrls((prev) => ({ ...prev, [type]: uploadedUrl }));
        setUploadFiles((prev) => ({ ...prev, [type]: file }));
        toast.success(`${type === "profile" ? "Photo" : type.toUpperCase()} uploaded`);
      }
    } catch {
      toast.error("Upload failed");
    }
    setUploading((prev) => ({ ...prev, [type]: false }));
    return false;
  };

  const removeFile = (type) => {
    setUrls((prev) => ({ ...prev, [type]: "" }));
    setUploadFiles((prev) => ({ ...prev, [type]: null }));
  };

  // Add agent
  const handleAddAgent = async (values) => {
    try {
      const payload = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        password: values.password,
        phone_number: values.phone_number,
        country_code: values.country_code,
        operating_city: values.operating_city,
        specialization: values.specialization,
        country: values.country,
        experience_years: Number(values.experience_years),
        rera_number: values.rera_number,
        profile_photo: urls.profile,
        id_proof: urls.idProof,
        rera_certificate: urls.rera,
        agency_id: agencyId,
      };
      await apiService.post("/agent/agent-signup", payload);
      toast.success("Agent created successfully");
      fetchAgents();
      form.resetFields();
      setUrls({ profile: "", idProof: "", rera: "" });
      setUploadFiles({ profile: null, idProof: null, rera: null });
      setCurrentStep(0);
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create agent");
    }
  };

  // Delete
  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Remove Agent",
      content: "Are you sure you want to remove this agent from your team?",
      okText: "Yes, Remove",
      okType: "danger",
      cancelText: "Cancel",
      centered: true,
      onOk: async () => {
        try {
          await apiService.delete(`agent/delete-agent/${id}`);
          toast.success("Agent removed successfully");
          fetchAgents();
        } catch {
          toast.error("Failed to remove agent");
        }
      },
    });
  };

  // View agent
  const handleViewAgent = (agent) => {
    setSelectedAgent(agent);
    setViewModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    form.resetFields();
    setUrls({ profile: "", idProof: "", rera: "" });
    setUploadFiles({ profile: null, idProof: null, rera: null });
    setCurrentStep(0);
  };

  // Stats
  const stats = [
    {
      title: "Total Agents",
      value: agents.length,
      icon: <TeamOutlined />,
      color: "purple",
      bg: "from-purple-50 to-purple-100",
    },
    {
      title: "Active",
      value: agents.filter((a) => a.status).length,
      icon: <CheckCircleFilled />,
      color: "green",
      bg: "from-green-50 to-green-100",
    },
    {
      title: "Inactive",
      value: agents.filter((a) => !a.status).length,
      icon: <UserOutlined />,
      color: "red",
      bg: "from-red-50 to-red-100",
    },
  ];

  // Table columns (enhanced)
 const columns = [
  {
    title: "Agent",
    dataIndex: "name",
    key: "name",
    fixed: "left",
    width: 280,
    ellipsis: true,
    render: (_, record) => (
      <div className="flex items-center gap-3 py-1">
        <div className="relative">
          <Avatar
            src={record.avatar}
            icon={<UserOutlined />}
            size={48}
            className="border-2 border-white shadow-md"
          />
          <Badge
            status={record.status ? "success" : "error"}
            className="absolute -bottom-1 -right-1"
          />
        </div>
        <div className="flex flex-col">
          <Tooltip title={record.name}>
            <Text strong className="text-gray-900 text-base truncate max-w-[180px]">
              {record.name}
            </Text>
          </Tooltip>
          <Tooltip title={record.email}>
            <Text className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
              <MailOutlined className="text-xs" />
              <span className="truncate max-w-[160px]">{record.email}</span>
            </Text>
          </Tooltip>
        </div>
      </div>
    ),
  },
  {
    title: "Contact",
    dataIndex: "phone",
    key: "phone",
    width: 160,
    ellipsis: true,
    render: (phone) => (
      <Text className="text-gray-700 flex items-center gap-2">
        <PhoneOutlined className="text-purple-500" />
        <span className="truncate">{phone || "—"}</span>
      </Text>
    ),
  },
  {
    title: "Location",
    dataIndex: "city",
    key: "city",
    width: 160,
    ellipsis: true,
    render: (city, record) => (
      <div className="flex flex-col">
        <Text className="text-gray-700 font-medium flex items-center gap-1">
          <EnvironmentOutlined className="text-blue-500 text-xs" />
          <span className="truncate">{city || "—"}</span>
        </Text>
        {record.country && (
          <Text className="text-gray-400 text-xs truncate">{record.country}</Text>
        )}
      </div>
    ),
  },
  {
    title: "Specialization",
    dataIndex: "specialization",
    key: "specialization",
    width: 140,
    ellipsis: true,
    render: (spec) =>
      spec ? (
        <Tag color="blue" className="rounded-full px-3 py-1 border-0 font-medium truncate max-w-[120px]">
          {spec}
        </Tag>
      ) : (
        <Text className="text-gray-400">—</Text>
      ),
  },
  {
    title: "Experience",
    dataIndex: "experience",
    key: "experience",
    width: 120,
    align: "center",
    render: (exp) =>
      exp ? (
        <div className="flex items-center justify-center gap-1">
          <TrophyOutlined className="text-yellow-500" />
          <Text strong>{exp} yrs</Text>
        </div>
      ) : (
        <Text className="text-gray-400">—</Text>
      ),
  },
  {
    title: "Role",
    dataIndex: "role",
    key: "role",
    width: 120,
    render: (role) => (
      <Tag color="purple" className="rounded-full px-3 py-1 border-0 bg-purple-50 text-purple-700 font-medium">
        {role}
      </Tag>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    width: 100,
    align: "center",
    render: (status) => (
      <Badge
        status={status ? "success" : "error"}
        text={<span className="font-medium">{status ? "Active" : "Inactive"}</span>}
      />
    ),
  },
  {
    title: "Actions",
    key: "actions",
    fixed: "right",
    width: 120,
    align: "center",
    render: (_, record) => (
      <Space size="small">
        <Tooltip title="View Details">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewAgent(record)}
            className="hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
          />
        </Tooltip>
        <Popconfirm
          title="Remove Agent"
          description="Are you sure you want to remove this agent?"
          onConfirm={() => handleDelete(record.key)}
          okText="Yes"
          cancelText="No"
          placement="topRight"
        >
          <Tooltip title="Remove Agent">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              className="hover:bg-red-50 rounded-lg transition-colors"
            />
          </Tooltip>
        </Popconfirm>
      </Space>
    ),
  },
];

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-gray-50 via-white to-purple-50/30 min-h-screen">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-wrap justify-between items-start gap-4">
          <div>
            <Title level={2} className="!mb-1 text-gray-800 flex items-center gap-2">
              <TeamOutlined className="text-purple-600" />
              Team Management
            </Title>
            <Text className="text-gray-500">
              Manage and monitor your agency's real estate agents
            </Text>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl px-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-200 border-0 transition-all duration-300"
          >
            Add New Agent
          </Button>
        </div>

        {/* Stats Cards */}
        <Row gutter={[24, 24]} className="mb-8">
          {stats.map((stat, idx) => (
            <Col xs={24} sm={8} key={idx}>
              <Card
                className={`rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border-0 bg-gradient-to-br ${stat.bg}`}
                bodyStyle={{ padding: "20px" }}
              >
                <div className="flex justify-between items-center">
                  <Statistic
                    title={<Text className="text-gray-600 font-medium">{stat.title}</Text>}
                    value={stat.value}
                    valueStyle={{
                      color: stat.color === "purple" ? "#7c3aed" : stat.color === "green" ? "#16a34a" : "#dc2626",
                      fontSize: "28px",
                      fontWeight: "bold",
                    }}
                  />
                  <div className={`text-3xl ${stat.color === "purple" ? "text-purple-500" : stat.color === "green" ? "text-green-500" : "text-red-500"}`}>
                    {stat.icon}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Filters */}
        <Card className="rounded-2xl shadow-sm border border-gray-100 mb-6">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={12} lg={14}>
              <Input
                size="large"
                placeholder="Search by name, email, phone, or location..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl border-gray-200 shadow-sm hover:border-purple-300 focus:border-purple-500 transition-colors"
                allowClear
              />
            </Col>
            <Col xs={24} md={12} lg={10}>
              <div className="flex gap-3 items-center">
                <FilterOutlined className="text-gray-400" />
                <Select
                  size="large"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  className="w-full rounded-xl"
                  dropdownClassName="rounded-xl"
                  options={[
                    { label: "All Agents", value: "all" },
                    { label: "Active Only", value: "active" },
                    { label: "Inactive Only", value: "inactive" },
                  ]}
                />
              </div>
            </Col>
          </Row>
        </Card>

        {/* Table */}
        <Card className="rounded-2xl shadow-lg border-0 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <Spin size="large" tip="Loading agents..." />
            </div>
          ) : filteredAgents.length === 0 ? (
            <Empty
              description={
                <div className="text-gray-500">
                  <Paragraph>No agents found</Paragraph>
                  <Button type="primary" onClick={() => setIsModalOpen(true)} icon={<PlusOutlined />} className="mt-2">
                    Add your first agent
                  </Button>
                </div>
              }
              className="py-12"
            />
          ) : (
          <div className="table-wrapper">
  <Table
    columns={columns}
    dataSource={filteredAgents}
    pagination={{
      pageSize: 10,
      showSizeChanger: true,
      showTotal: (total) => `Total ${total} agents`,
      position: ["bottomCenter"] // 🔥 FIX
    }}
    scroll={{ x: "max-content" }} // 🔥 FIX
    className="custom-table"
  />
</div>
          )}
        </Card>

        {/* Add Agent Modal with Steps */}
        <Modal
          title={
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <UserOutlined className="text-purple-600 text-lg" />
              </div>
              <span className="text-xl font-bold text-gray-900">Register New Agent</span>
            </div>
          }
          open={isModalOpen}
          onCancel={closeModal}
          footer={null}
          width={900}
          centered
          className="rounded-2xl"
        >
          <Steps
            current={currentStep}
            onChange={setCurrentStep}
            className="mb-8"
            items={[
              { title: "Personal", icon: <UserOutlined /> },
              { title: "Professional", icon: <TrophyOutlined /> },
              { title: "Documents", icon: <FileDoneOutlined /> },
            ]}
          />
          <Form form={form} layout="vertical" onFinish={handleAddAgent} className="mt-6">
            {currentStep === 0 && (
              <>
                <Alert
                  message="Personal Information"
                  description="Please provide the agent's basic details."
                  type="info"
                  showIcon
                  className="mb-6 rounded-xl"
                />
                <Row gutter={20}>
                  <Col xs={24} md={12}>
                    <Form.Item name="first_name" label="First Name" rules={[{ required: true, message: "Required" }]}>
                      <Input size="large" className="rounded-xl" placeholder="e.g. John" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="last_name" label="Last Name" rules={[{ required: true, message: "Required" }]}>
                      <Input size="large" className="rounded-xl" placeholder="e.g. Doe" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="email" label="Email Address" rules={[{ required: true, type: "email", message: "Valid email required" }]}>
                      <Input size="large" className="rounded-xl" placeholder="agent@agency.com" prefix={<MailOutlined className="text-gray-400" />} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="password" label="Temporary Password" rules={[{ required: true, message: "Required" }]}>
                      <Input.Password size="large" className="rounded-xl" placeholder="Create a secure password" />
                    </Form.Item>
                  </Col>
                  <Col xs={8}>
                    <Form.Item name="country_code" label="Code" initialValue="+971">
                      <Select size="large" className="rounded-xl">
                        <Option value="+971">🇦🇪 +971</Option>
                        <Option value="+91">🇮🇳 +91</Option>
                        <Option value="+1">🇺🇸 +1</Option>
                        <Option value="+44">🇬🇧 +44</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={16}>
                    <Form.Item name="phone_number" label="Phone Number" rules={[{ required: true, message: "Required" }]}>
                      <Input size="large" className="rounded-xl" placeholder="50 123 4567" prefix={<PhoneOutlined className="text-gray-400" />} />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}
            {currentStep === 1 && (
              <>
                <Alert
                  message="Professional Details"
                  description="Add information about the agent's expertise and qualifications."
                  type="info"
                  showIcon
                  className="mb-6 rounded-xl"
                />
                <Row gutter={20}>
                  <Col xs={24} md={8}>
                    <Form.Item name="country" label="Country" initialValue="UAE">
                      <Input size="large" className="rounded-xl" prefix={<EnvironmentOutlined className="text-gray-400" />} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="operating_city" label="Operating City" rules={[{ required: true, message: "Required" }]}>
                      <Input size="large" className="rounded-xl" placeholder="e.g. Dubai" prefix={<EnvironmentOutlined className="text-gray-400" />} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="experience_years" label="Experience (Years)">
                      <InputNumber size="large" className="w-full rounded-xl" min={0} placeholder="0" prefix={<CalendarOutlined className="text-gray-400" />} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="specialization" label="Specialization">
                      <Select size="large" className="rounded-xl" placeholder="Select specialization">
                        {["Luxury", "Residential", "Commercial", "Off-Plan", "Rental", "Investment"].map((s) => (
                          <Option key={s} value={s}>
                            {s}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="rera_number" label="RERA Number">
                      <Input size="large" className="rounded-xl" placeholder="RERA Registration No." prefix={<FileDoneOutlined className="text-gray-400" />} />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}
            {currentStep === 2 && (
              <>
                <Alert
                  message="Documents & Media"
                  description="Upload necessary documents for verification."
                  type="info"
                  showIcon
                  className="mb-6 rounded-xl"
                />
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={8}>
                    <UploadField
                      type="profile"
                      label="Upload Profile Photo"
                      icon={<UserOutlined />}
                      accept="image/*"
                      urls={urls}
                      uploadFiles={uploadFiles}
                      uploading={uploading}
                      onUpload={handleInstantUpload}
                      onRemove={removeFile}
                    />
                  </Col>
                  <Col xs={24} md={8}>
                    <UploadField
                      type="idProof"
                      label="Upload ID Proof"
                      icon={<IdcardOutlined />}
                      accept=".pdf,image/*"
                      urls={urls}
                      uploadFiles={uploadFiles}
                      uploading={uploading}
                      onUpload={handleInstantUpload}
                      onRemove={removeFile}
                    />
                  </Col>
                  <Col xs={24} md={8}>
                    <UploadField
                      type="rera"
                      label="RERA Certificate"
                      icon={<FileDoneOutlined />}
                      accept=".pdf,image/*"
                      urls={urls}
                      uploadFiles={uploadFiles}
                      uploading={uploading}
                      onUpload={handleInstantUpload}
                      onRemove={removeFile}
                    />
                  </Col>
                </Row>
              </>
            )}
            <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
              {currentStep > 0 && (
                <Button size="large" className="rounded-xl px-6" onClick={() => setCurrentStep(currentStep - 1)}>
                  Back
                </Button>
              )}
              <div className="flex gap-3 ml-auto">
                <Button size="large" className="rounded-xl px-6 font-medium" onClick={closeModal}>
                  Cancel
                </Button>
                {currentStep < 2 ? (
                  <Button
                    size="large"
                    type="primary"
                    className="rounded-xl px-8 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 font-semibold border-0 shadow-lg shadow-purple-200"
                    onClick={() => setCurrentStep(currentStep + 1)}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    size="large"
                    type="primary"
                    htmlType="submit"
                    className="rounded-xl px-8 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 font-semibold border-0 shadow-lg shadow-purple-200"
                  >
                    Create Agent
                  </Button>
                )}
              </div>
            </div>
          </Form>
        </Modal>

        {/* View Agent Modal */}
        <Modal
          title={
            <div className="flex items-center gap-3">
              <Avatar src={selectedAgent?.avatar} icon={<UserOutlined />} size={48} className="border-2 border-purple-200" />
              <div>
                <div className="text-xl font-bold text-gray-900">{selectedAgent?.name}</div>
                <Text className="text-gray-500 text-sm">Agent Details</Text>
              </div>
            </div>
          }
          open={viewModalOpen}
          onCancel={() => setViewModalOpen(false)}
          footer={null}
          width={700}
          centered
          className="rounded-2xl"
        >
          {selectedAgent && (
            <div className="mt-6 space-y-6">
              {/* Contact Info Card */}
              <Card className="rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-2 mb-4">
                  <MailOutlined className="text-purple-600 text-lg" />
                  <Title level={5} className="!mb-0">Contact Information</Title>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Text className="text-gray-500">Email</Text>
                    <Text className="font-medium">{selectedAgent.email}</Text>
                  </div>
                  <Divider className="my-2" />
                  <div className="flex justify-between items-center">
                    <Text className="text-gray-500">Phone</Text>
                    <Text className="font-medium">{selectedAgent.phone}</Text>
                  </div>
                </div>
              </Card>

              {/* Professional Details */}
              <Card className="rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-2 mb-4">
                  <TrophyOutlined className="text-purple-600 text-lg" />
                  <Title level={5} className="!mb-0">Professional Details</Title>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Text className="text-gray-500">Location</Text>
                    <Text className="font-medium">
                      {selectedAgent.city}, {selectedAgent.country}
                    </Text>
                  </div>
                  <Divider className="my-2" />
                  <div className="flex justify-between items-center">
                    <Text className="text-gray-500">Specialization</Text>
                    <Tag color="blue" className="rounded-full">
                      {selectedAgent.specialization || "—"}
                    </Tag>
                  </div>
                  <Divider className="my-2" />
                  <div className="flex justify-between items-center">
                    <Text className="text-gray-500">Experience</Text>
                    <Text className="font-medium">
                      {selectedAgent.experience ? `${selectedAgent.experience} years` : "—"}
                    </Text>
                  </div>
                  <Divider className="my-2" />
                  <div className="flex justify-between items-center">
                    <Text className="text-gray-500">RERA Number</Text>
                    <Text className="font-medium">{selectedAgent.reraNumber || "—"}</Text>
                  </div>
                  <Divider className="my-2" />
                  <div className="flex justify-between items-center">
                    <Text className="text-gray-500">Role</Text>
                    <Tag color="purple" className="rounded-full">
                      {selectedAgent.role}
                    </Tag>
                  </div>
                  <Divider className="my-2" />
                  <div className="flex justify-between items-center">
                    <Text className="text-gray-500">Status</Text>
                    <Badge status={selectedAgent.status ? "success" : "error"} text={selectedAgent.status ? "Active" : "Inactive"} />
                  </div>
                </div>
              </Card>

              {/* Documents */}
              {(selectedAgent.idProof || selectedAgent.reraCertificate) && (
                <Card className="rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 mb-4">
                    <FileDoneOutlined className="text-purple-600 text-lg" />
                    <Title level={5} className="!mb-0">Documents</Title>
                  </div>
                  <div className="space-y-2">
                    {selectedAgent.idProof && (
                      <div className="flex justify-between items-center">
                        <Text className="text-gray-500">ID Proof</Text>
                        <Button type="link" href={selectedAgent.idProof} target="_blank" className="text-purple-600">
                          View Document
                        </Button>
                      </div>
                    )}
                    {selectedAgent.reraCertificate && (
                      <div className="flex justify-between items-center">
                        <Text className="text-gray-500">RERA Certificate</Text>
                        <Button type="link" href={selectedAgent.reraCertificate} target="_blank" className="text-purple-600">
                          View Certificate
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>
          )}
        </Modal>
      </div>

      <style jsx>{`
        .custom-table :global(.ant-table-thead > tr > th) {
          background: #f8fafc !important;
          font-weight: 600;
          font-size: 12px;
          color: #1e293b;
          border-bottom: 2px solid #e2e8f0;
        }
        .custom-table :global(.ant-table-tbody > tr:hover > td) {
          background: #faf5ff !important;
        }
        .upload-field {
          text-align: center;
        }
        .upload-preview {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        @media (max-width: 768px) {
          .ant-table {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default AgencyManageAgents;