import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Card,
  Typography,
  Input,
  Button,
  Tag,
  Tooltip,
  message,
  Tabs,
  Modal,
  Form,
  Select,
  InputNumber,
  Row,
  Col,
  AutoComplete,
  Space,
  Statistic,
  Divider,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  TrophyOutlined,
  UserAddOutlined,
  UserOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import CustomTable from "../../CMS/pages/custom/CustomTable";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

export default function AgentLeadDashboard() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // ================= STATES =================
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("customers");
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState([]);

  // Modal & Form States for Leads
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [locationOptions, setLocationOptions] = useState([]);
  const [form] = Form.useForm();

  // ================= FETCH LEADS & PROJECTS =================
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await apiService.get("/agent/lead/get-all-leads");
      const list = Array.isArray(response?.data) ? response.data : response?.data?.data || [];
      setLeads(list);
    } catch (err) {
      message.error("Failed to fetch leads.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await apiService.get("/property/get-all-properties?limit=1000");
      let list = [];
      if (Array.isArray(res?.data)) {
        list = res.data;
      } else if (res?.data?.data) {
        list = res.data.data;
      }
      setProjects(list);
    } catch (error) {
      message.error("Failed to fetch projects");
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchProjects();
  }, []);

  // ================= DELETE & UPDATE STATUS =================
  const deleteLead = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      await apiService.delete(`/agent/lead/delete-lead/${id}`);
      message.success("Lead deleted successfully");
      fetchLeads();
    } catch (err) {
      message.error("Delete failed");
    }
  };

  const updateLeadStatus = async (id, status) => {
    try {
      await apiService.post(`/agent/lead/update-status/${id}`, { status });
      message.success(`Lead status updated to ${status}`);
      fetchLeads();
    } catch (error) {
      message.error("Status update failed");
    }
  };

  // ================= LEAD ADD / EDIT HANDLERS =================
  const handleAddClick = () => {
    setSelectedLead(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEditClick = (lead) => {
    setSelectedLead(lead);
    form.setFieldsValue({
      first_name: lead?.name?.first_name,
      last_name: lead?.name?.last_name,
      email: lead?.email,
      phone_number: lead?.phone_number,
      property_interest: lead?.property_interest,
      requirement_description: lead?.requirement_description,
      budget: lead?.budget,
      preferred_location: lead?.preferred_location,
      bedrooms: lead?.bedrooms,
      property_type: lead?.property_type,
      project: lead?.project?._id || lead?.project,
      status: lead?.status || "customer",
      source: lead?.source || "manual",
    });
    setIsModalOpen(true);
  };

  const handleLocationSearch = async (value) => {
    if (!value || value.length < 3) return setLocationOptions([]);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${value}&limit=5`);
      const data = await response.json();
      setLocationOptions(data.map((item) => ({ value: item.display_name, label: item.display_name })));
    } catch (error) {
      console.error("Location search failed", error);
    }
  };

  const onFormFinish = async (values) => {
    setFormLoading(true);
    try {
      const payload = {
        name: { first_name: values.first_name, last_name: values.last_name },
        email: values.email,
        phone_number: values.phone_number,
        property_interest: values.property_interest,
        requirement_description: values.requirement_description,
        budget: values.budget,
        preferred_location: values.preferred_location,
        bedrooms: values.bedrooms,
        property_type: values.property_type,
        project: values.project,
        agent: user?._id || user?.id,
        source: values.source || "manual",
        status: values.status || "customer",
      };

      if (selectedLead && selectedLead._id) {
        await apiService.post(`/agent/lead/update-lead/${selectedLead._id}`, payload);
        message.success("Lead updated successfully!");
      } else {
        await apiService.post("/agent/lead/create-lead", payload);
        message.success("New lead created successfully!");
      }

      setIsModalOpen(false);
      form.resetFields();
      fetchLeads();
    } catch (error) {
      message.error(error?.response?.data?.message || "Something went wrong!");
    } finally {
      setFormLoading(false);
    }
  };

  // ================= VIEW LEAD =================
  const handleViewLead = async (item) => {
    try {
      const res = await apiService.get(`/agent/lead/get-lead/${item._id}?includeInterests=true`);
      navigate("../lead-details", { state: res });
    } catch (err) {
      message.error("Failed to load details");
    }
  };

  // ================= UI HELPERS =================
  const getStatusTag = (status) => {
    switch (status?.toLowerCase()) {
      case "customer": return <Tag color="cyan">Customer</Tag>;
      case "lead": return <Tag color="gold">Lead</Tag>;
      case "visit": return <Tag color="blue">Site Visit</Tag>;
      case "deal": return <Tag color="purple">Deal</Tag>;
      case "booking": return <Tag color="magenta">Booking</Tag>;
      case "closed": return <Tag color="success">Closed</Tag>;
      case "lost": return <Tag color="red">Lost</Tag>;
      default: return <Tag color="cyan">Customer</Tag>;
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const name = `${lead?.name?.first_name || ""} ${lead?.name?.last_name || ""}`.toLowerCase();
    return (
      name.includes(searchQuery.toLowerCase()) ||
      (lead?.email || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const customers = filteredLeads.filter((l) => l.status?.toLowerCase() === "customer");
  const onlyLeads = filteredLeads.filter((l) => l.status?.toLowerCase() === "lead");

  // Stats
  const totalLeads = leads.length;
  const totalCustomers = leads.filter((l) => l.status?.toLowerCase() === "customer").length;
  const totalActiveLeads = leads.filter((l) => l.status?.toLowerCase() === "lead").length;

  // ================= TABLE COLUMNS =================
  const columns = [
    {
      title: "Client Name",
      key: "name",
      render: (_, item) => (
        <Space direction="vertical" size={0}>
          <Text strong>{`${item?.name?.first_name || ""} ${item?.name?.last_name || ""}`}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{item?.email || "—"}</Text>
        </Space>
      ),
    },
    {
      title: "Contact",
      key: "contact",
      render: (_, item) => (
        <Text>{item?.phone_number || "—"}</Text>
      ),
    },
    {
      title: "Budget / Project",
      key: "budget",
      render: (_, item) => (
        <Space direction="vertical" size={0}>
          <Text>{item?.budget ? `${item.budget.toLocaleString()} AED` : "—"}</Text>
          {item?.project?.propertyName && (
            <Tag color="blue" style={{ margin: 0 }}>{item.project.propertyName}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, item) => getStatusTag(item.status),
    },
    {
      title: "Action",
      key: "action",
      render: (_, item) => (
        <Space>
          <Tooltip title="Edit">
            <Button type="text" icon={<EditOutlined />} onClick={() => handleEditClick(item)} />
          </Tooltip>
          <Tooltip title="View">
            <Button type="text" icon={<EyeOutlined />} onClick={() => handleViewLead(item)} />
          </Tooltip>
          {item?.status === "lead" && (
            <Tooltip title="Move to Deal">
              <Button type="text" icon={<CheckCircleOutlined />} onClick={() => updateLeadStatus(item._id, "deal")} />
            </Tooltip>
          )}
          {["deal", "booking"].includes(item?.status) && (
            <Tooltip title="Close">
              <Button type="text" icon={<TrophyOutlined />} onClick={() => updateLeadStatus(item._id, "closed")} />
            </Tooltip>
          )}
          <Tooltip title="Delete">
            <Button danger type="text" icon={<DeleteOutlined />} onClick={() => deleteLead(item._id)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2} style={{ margin: 0 }}>XOTO CRM</Title>
          <Text type="secondary">Agent Lead Pipeline</Text>
        </div>
       
      </div>

      {/* Stats Cards */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={8}>
          <Card className="shadow-sm hover:shadow transition-shadow">
            <Statistic
              title="Total Clients"
              value={totalLeads}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#3b82f6" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm hover:shadow transition-shadow">
            <Statistic
              title="Customers"
              value={totalCustomers}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#06b6d4" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm hover:shadow transition-shadow">
            <Statistic
              title="Active Leads"
              value={totalActiveLeads}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#f59e0b" }}
            />
          </Card>
        </Col>
      </Row>

        {/* Tabs with Tables */}
      <Card className="rounded-xl border-none shadow-sm">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "customers",
              label: `Customers (${customers.length})`,
              children: <CustomTable columns={columns} data={customers} loading={loading} rowKey="_id" />,
            },
            {
              key: "leads",
              label: `Leads (${onlyLeads.length})`,
              children: <CustomTable columns={columns} data={onlyLeads} loading={loading} rowKey="_id" />,
            },
          ]}
        />
      </Card>

      {/* ================= ADD/EDIT LEAD MODAL ================= */}
      <Modal
        title={selectedLead ? "Edit Client Details" : "Add New Client"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={800}
        centered
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFormFinish} className="mt-4">
          <Divider orientation="left">Personal Information</Divider>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="first_name" label="First Name" rules={[{ required: true, message: "Required" }]}>
                <Input placeholder="e.g. John" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="last_name" label="Last Name" rules={[{ required: true, message: "Required" }]}>
                <Input placeholder="e.g. Doe" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="phone_number" label="Phone Number" rules={[{ required: true, message: "Required" }]}>
                <Input placeholder="+971 XX XXX XXXX" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="email" label="Email">
                <Input placeholder="client@example.com" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Lead Details</Divider>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="status" label="Status" rules={[{ required: true, message: "Select status" }]}>
                <Select placeholder="Select pipeline stage">
                  <Option value="lead">Lead</Option>
                  <Option value="visit">Site Visit</Option>
                  <Option value="deal">Deal</Option>
                  <Option value="booking">Booking</Option>
                  <Option value="closed">Closed</Option>
                  <Option value="lost">Lost</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="source" label="Source" initialValue="manual">
                <Select placeholder="How did they find us?">
                  <Option value="manual">Manual</Option>
                  <Option value="website">Website</Option>
                  <Option value="referral">Referral</Option>
                  <Option value="social">Social Media</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Requirement</Divider>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="budget" label="Budget (AED)">
                <InputNumber className="w-full" formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="property_type" label="Property Type">
                <Select allowClear>
                  <Option value="Apartment">Apartment</Option>
                  <Option value="Villa">Villa</Option>
                  <Option value="Townhouse">Townhouse</Option>
                  <Option value="Penthouse">Penthouse</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="bedrooms" label="Bedrooms">
                <Select allowClear>
                  <Option value={1}>1 BHK</Option>
                  <Option value={2}>2 BHK</Option>
                  <Option value={3}>3 BHK</Option>
                  <Option value={4}>4+ BHK</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="project" label="Target Project">
                <Select placeholder="Select project" allowClear showSearch optionFilterProp="children">
                  {projects.map((p) => (
                    <Option key={p._id} value={p._id}>{p.propertyName}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="preferred_location" label="Preferred Location">
                <AutoComplete
                  options={locationOptions}
                  onSearch={handleLocationSearch}
                  placeholder="Search location..."
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="requirement_description" label="Requirement / Notes">
                <Input.TextArea rows={3} placeholder="Additional insights or AI-generated notes..." />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="property_interest" hidden><Input /></Form.Item>

          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={formLoading} className="bg-indigo-600">
              {selectedLead ? "Save Changes" : "Create Profile"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}