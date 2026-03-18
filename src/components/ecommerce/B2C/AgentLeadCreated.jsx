import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Card, Typography, Input, Button, Tag, Tooltip, message,
  Tabs, Modal, Form, Select, InputNumber, Row, Col,
  AutoComplete, Space, Statistic, Divider
} from "antd";
import {
  SearchOutlined, EditOutlined, DeleteOutlined,
  CheckCircleOutlined, EyeOutlined, TrophyOutlined,
  TeamOutlined, UserOutlined, FireOutlined,UserAddOutlined 
} from "@ant-design/icons";
import CustomTable from "../../CMS/pages/custom/CustomTable";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;
const { Option } = Select;

// Pipeline Statuses matching your backend enum
const PIPELINE_STATUSES = [
  { key: "all", label: "All Leads" },
  { key: "customer", label: "Customer" },
  { key: "lead", label: "Lead" },
  { key: "visit", label: "Site Visit" },
  { key: "deal", label: "Deal" },
  { key: "booking", label: "Booking" },
  { key: "closed", label: "Closed" },
  { key: "lost", label: "Lost" }
];

export default function AgentLeadDashboard() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // States
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({ total: 0, customers: 0, activeLeads: 0 });

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [locationOptions, setLocationOptions] = useState([]);

  // Fetch Leads with Status & Search Query parameters
  const fetchLeads = async (status = activeTab, search = searchQuery) => {
    try {
      setLoading(true);
      let url = `/agent/lead/get-all-leads?limit=100`;
      
      // Append filters based on selected tab and search
      if (status !== "all") url += `&status=${status}`;
      if (search) url += `&search=${search}`;

      const response = await apiService.get(url);
      const list = Array.isArray(response?.data) ? response.data : response?.data?.data || [];
      
      setLeads(list);
      
      // If fetching "all", update the top metric cards
      if (status === "all" && !search) {
        setStats({
          total: list.length,
          customers: list.filter(l => l.status === 'customer').length,
          activeLeads: list.filter(l => l.status === 'lead').length,
        });
      }
    } catch (err) {
      message.error("Failed to fetch pipeline data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await apiService.get("/property/get-all-properties?limit=1000");
      setProjects(res?.data?.data || res?.data || []);
    } catch (error) {
      message.error("Failed to fetch projects");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Re-fetch whenever the tab changes
  useEffect(() => {
    fetchLeads(activeTab, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Handle Search input
  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    fetchLeads(activeTab, val);
  };

  // Actions
  const deleteLead = async (id) => {
    try {
      await apiService.delete(`/agent/lead/delete-lead/${id}`);
      setLeads((prev) => prev.filter((l) => l._id !== id));
      message.success("Lead removed from pipeline");
    } catch (err) {
      message.error("Delete failed");
    }
  };

  const updateLeadStatus = async (id, status) => {
    try {
      await apiService.post(`/agent/lead/update-status/${id}`, { status });
      message.success(`Lead moved to ${status}`);
      fetchLeads(); // Refresh table
    } catch (error) {
      message.error("Status update failed");
    }
  };

  // Navigate to Details strictly via ID param
  const handleViewLead = (item) => {
    navigate(`../lead-details/${item._id}`);
  };

  // Form handling
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
        message.success("Profile updated successfully!");
      } else {
        await apiService.post("/agent/lead/create-lead", payload);
        message.success("New prospect added to pipeline!");
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

  const getStatusTag = (status) => {
    switch (status?.toLowerCase()) {
      case "customer": return <Tag color="cyan">Customer</Tag>;
      case "lead": return <Tag color="gold">Lead</Tag>;
      case "visit": return <Tag color="blue">Site Visit</Tag>;
      case "deal": return <Tag color="purple">Deal</Tag>;
      case "booking": return <Tag color="magenta">Booking</Tag>;
      case "closed": return <Tag color="success">Closed</Tag>;
      case "lost": return <Tag color="red">Lost</Tag>;
      default: return <Tag color="default">{status}</Tag>;
    }
  };

  const columns = [
    {
      title: "Client Profile",
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
      dataIndex: "phone_number",
      key: "contact",
    },
    {
      title: "Target / Budget",
      key: "budget",
      render: (_, item) => (
        <Space direction="vertical" size={0}>
          <Text>{item?.budget ? `${item.budget.toLocaleString()} AED` : "—"}</Text>
          {item?.project?.propertyName && (
            <Tag color="blue" style={{ margin: 0, marginTop: 4 }}>{item.project.propertyName}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Stage",
      key: "status",
      render: (_, item) => getStatusTag(item.status),
    },
    {
      title: "Actions",
      key: "action",
      render: (_, item) => (
        <Space>
          <Tooltip title="View Intelligence Hub">
            <Button type="primary" ghost icon={<EyeOutlined />} onClick={() => handleViewLead(item)} />
          </Tooltip>
          <Tooltip title="Edit">
            <Button type="text" icon={<EditOutlined />} onClick={() => handleEditClick(item)} />
          </Tooltip>
          {item?.status === "lead" && (
            <Tooltip title="Convert to Deal">
              <Button type="text" className="text-green-600" icon={<CheckCircleOutlined />} onClick={() => updateLeadStatus(item._id, "deal")} />
            </Tooltip>
          )}
          {["deal", "booking"].includes(item?.status) && (
            <Tooltip title="Mark as Closed Won">
              <Button type="text" className="text-yellow-500" icon={<TrophyOutlined />} onClick={() => updateLeadStatus(item._id, "closed")} />
            </Tooltip>
          )}
          <Tooltip title="Remove">
            <Button danger type="text" icon={<DeleteOutlined />} onClick={() => deleteLead(item._id)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 md:p-10 space-y-6 bg-[#f6f7fb] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <Title level={2} className="!mb-1 text-gray-800">Pipeline Manager</Title>
          <Text type="secondary">Track, organize, and convert your real estate prospects</Text>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Input 
            prefix={<SearchOutlined className="text-gray-400" />} 
            placeholder="Search by name or phone..." 
            className="rounded-xl w-full md:w-64"
            size="large"
            onChange={handleSearch}
            value={searchQuery}
            allowClear
          />
          <Button type="primary" size="large" icon={<UserAddOutlined />} onClick={handleAddClick} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl">
            Add Client
          </Button>
        </div>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm rounded-2xl border-none">
            <Statistic title="Total Pipeline Size" value={stats.total} prefix={<TeamOutlined />} valueStyle={{ color: "#4f46e5" }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm rounded-2xl border-none">
            <Statistic title="Initial Customers" value={stats.customers} prefix={<UserOutlined />} valueStyle={{ color: "#06b6d4" }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm rounded-2xl border-none">
            <Statistic title="Active Hot Leads" value={stats.activeLeads} prefix={<FireOutlined />} valueStyle={{ color: "#f59e0b" }} />
          </Card>
        </Col>
      </Row>

      {/* Dynamic Tabs mapping directly to API query */}
      <Card className="rounded-2xl border-none shadow-sm">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          size="large"
          items={PIPELINE_STATUSES.map((status) => ({
            key: status.key,
            label: status.label,
            children: <CustomTable columns={columns} data={leads} loading={loading} rowKey="_id" />,
          }))}
        />
      </Card>

      {/* Add/Edit Modal Form */}
      <Modal title={selectedLead ? "Edit Profile" : "New Prospect Profile"} open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} width={800} centered destroyOnClose>
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
                <Input placeholder="+971 50 123 4567" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="email" label="Email">
                <Input placeholder="client@example.com" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Pipeline Details</Divider>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="status" label="Pipeline Stage" rules={[{ required: true, message: "Select status" }]}>
                <Select placeholder="Select stage">
                  {PIPELINE_STATUSES.filter(s => s.key !== 'all').map(s => (
                    <Option key={s.key} value={s.key}>{s.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="source" label="Source" initialValue="manual">
                <Select placeholder="How did they find us?">
                  <Option value="manual">Manual Entry</Option>
                  <Option value="website">Website Lead</Option>
                  <Option value="site_visit">Site Visit</Option>
                  <Option value="qr_code">QR Code / Print</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Requirements</Divider>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="budget" label="Max Budget (AED)">
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
                <Select placeholder="Select specific project" allowClear showSearch optionFilterProp="children">
                  {projects.map((p) => (
                    <Option key={p._id} value={p._id}>{p.propertyName}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="preferred_location" label="Preferred Location">
                <AutoComplete options={locationOptions} onSearch={handleLocationSearch} placeholder="Search exact location..." allowClear />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="requirement_description" label="AI / Agent Notes">
                <Input.TextArea rows={3} placeholder="Add detailed specific requirements here..." />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={() => setIsModalOpen(false)} size="large">Cancel</Button>
            <Button type="primary" htmlType="submit" size="large" loading={formLoading} className="bg-indigo-600">
              {selectedLead ? "Save Profile" : "Create Profile"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}