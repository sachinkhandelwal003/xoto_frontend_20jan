import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Card, Typography, Input, Button, Tag, Tooltip, message,
  Tabs, Modal, Form, Select, InputNumber, Row, Col,
  AutoComplete, Space, Statistic, Divider, Avatar
} from "antd";
import {
  SearchOutlined, EditOutlined, DeleteOutlined,
  CheckCircleOutlined, EyeOutlined, TrophyOutlined,
  TeamOutlined, UserOutlined, FireOutlined, UserAddOutlined,
  MailOutlined, PhoneOutlined, EnvironmentOutlined,DollarOutlined 
} from "@ant-design/icons";
import CustomTable from "../../CMS/pages/custom/CustomTable";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import { showConfirmDialog, showSuccessAlert, showErrorAlert } from "../../../manageApi/utils/sweetAlert";

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

  // Pagination State
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    itemsPerPage: 10,
  });

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [locationOptions, setLocationOptions] = useState([]);

  // ================= FETCH LEADS & PROJECTS =================
  const fetchLeads = async (page = 1, itemsPerPage = 10, status = activeTab, search = searchQuery) => {
    setLoading(true);
    try {
      let url = `/agent/lead/get-all-leads?page=${page}&limit=${itemsPerPage}`;
      
      if (status !== "all") url += `&status=${status}`;
      if (search) url += `&search=${search}`;

      const response = await apiService.get(url);
      const list = Array.isArray(response?.data) ? response.data : response?.data?.data || [];
      
      setLeads(list);
      
      // Update pagination
      setPagination({
        currentPage: response?.pagination?.currentPage || page,
        totalPages: response?.pagination?.totalPages || 1,
        totalResults: response?.pagination?.totalItems || response?.count || list.length,
        itemsPerPage: itemsPerPage,
      });

      // Update top metric cards only when viewing "all" without search
      if (status === "all" && !search) {
        setStats({
          total: response?.pagination?.totalItems || response?.count || list.length,
          customers: list.filter(l => l.status === 'customer').length, // Approximated from current page or needs separate aggregate API
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
    fetchLeads(pagination.currentPage, pagination.itemsPerPage, activeTab, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ================= EVENT HANDLERS =================
  const handleTabChange = (key) => {
    setActiveTab(key);
    fetchLeads(1, pagination.itemsPerPage, key, searchQuery);
  };

  const handlePageChange = (page, itemsPerPage) => {
    fetchLeads(page, itemsPerPage, activeTab, searchQuery);
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    fetchLeads(1, pagination.itemsPerPage, activeTab, val);
  };

  const deleteLead = async (id) => {
    const result = await showConfirmDialog(
      'Remove Lead',
      'Are you sure you want to permanently delete this lead from your pipeline?',
      'Delete'
    );
    if (result.isConfirmed) {
      try {
        await apiService.delete(`/agent/lead/delete-lead/${id}`);
        showSuccessAlert('Deleted', 'Lead removed from pipeline successfully.');
        fetchLeads(pagination.currentPage, pagination.itemsPerPage, activeTab, searchQuery);
      } catch (err) {
        showErrorAlert('Error', 'Failed to delete the lead.');
      }
    }
  };

  const updateLeadStatus = async (id, status) => {
    try {
      await apiService.post(`/agent/lead/update-status/${id}`, { status });
      message.success(`Lead successfully moved to ${status}`);
      fetchLeads(pagination.currentPage, pagination.itemsPerPage, activeTab, searchQuery);
    } catch (error) {
      message.error("Status update failed");
    }
  };

  const handleViewLead = (item) => {
    navigate(`../lead-details/${item._id}`);
  };

  // ================= FORM HANDLERS =================
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
      fetchLeads(pagination.currentPage, pagination.itemsPerPage, activeTab, searchQuery);
    } catch (error) {
      message.error(error?.response?.data?.message || "Something went wrong!");
    } finally {
      setFormLoading(false);
    }
  };

  // ================= UI COMPONENTS =================
  const getStatusTag = (status) => {
    switch (status?.toLowerCase()) {
      case "customer": return <Tag color="cyan" className="rounded-full px-3">Customer</Tag>;
      case "lead": return <Tag color="gold" className="rounded-full px-3">Lead</Tag>;
      case "visit": return <Tag color="blue" className="rounded-full px-3">Site Visit</Tag>;
      case "deal": return <Tag color="purple" className="rounded-full px-3">Deal</Tag>;
      case "booking": return <Tag color="magenta" className="rounded-full px-3">Booking</Tag>;
      case "closed": return <Tag color="success" className="rounded-full px-3">Closed</Tag>;
      case "lost": return <Tag color="error" className="rounded-full px-3">Lost</Tag>;
      default: return <Tag color="default" className="rounded-full px-3">{status}</Tag>;
    }
  };

  // CustomTable Columns matching the exact structure used in Freelancer requests
  const columns = [
    {
      key: "applicant",
      title: "Client Profile",
      sortable: true,
      render: (_, item) => (
        <div className="flex items-center gap-3">
          <Avatar size={40} className="bg-indigo-100 text-indigo-600 font-bold">
            {item?.name?.first_name?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <Space direction="vertical" size={0}>
            <Text strong className="text-gray-800 text-sm">
              {`${item?.name?.first_name || ""} ${item?.name?.last_name || ""}`}
            </Text>
            <Space size="middle" className="text-xs text-gray-500 mt-0.5">
              <span><MailOutlined className="mr-1"/>{item?.email || '--'}</span>
            </Space>
          </Space>
        </div>
      ),
    },
    {
      key: "contact",
      title: "Contact",
      render: (_, item) => (
        <Text className="text-gray-600">
          <PhoneOutlined className="mr-1.5 text-gray-400"/> 
          {item?.phone_number || '--'}
        </Text>
      ),
    },
    {
      key: "budget",
      title: "Target / Budget",
      render: (_, item) => (
        <Space direction="vertical" size={0}>
          <Text strong className="text-emerald-600 text-sm">
            <DollarOutlined /> {item?.budget ? `${item.budget.toLocaleString()} AED` : "N/A"}
          </Text>
          {item?.project?.propertyName && (
            <Tag color="blue" className="rounded-md mt-1 border-none bg-blue-50">
              {item.project.propertyName}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      key: "status",
      title: "Stage",
      render: (_, item) => getStatusTag(item.status),
    },
    {
      key: "actions",
      title: "Actions",
      align: "right",
      render: (_, item) => (
        <Space>
          <Tooltip title="View Intelligence Hub">
            <Button type="text" className="text-indigo-600 hover:bg-indigo-50 rounded-lg" icon={<EyeOutlined />} onClick={() => handleViewLead(item)} />
          </Tooltip>
          <Tooltip title="Edit Profile">
            <Button type="text" className="text-gray-600 hover:bg-gray-100 rounded-lg" icon={<EditOutlined />} onClick={() => handleEditClick(item)} />
          </Tooltip>
          {item?.status === "lead" && (
            <Tooltip title="Convert to Deal">
              <Button type="text" className="text-emerald-600 hover:bg-emerald-50 rounded-lg" icon={<CheckCircleOutlined />} onClick={() => updateLeadStatus(item._id, "deal")} />
            </Tooltip>
          )}
          {["deal", "booking"].includes(item?.status) && (
            <Tooltip title="Mark as Closed Won">
              <Button type="text" className="text-yellow-600 hover:bg-yellow-50 rounded-lg" icon={<TrophyOutlined />} onClick={() => updateLeadStatus(item._id, "closed")} />
            </Tooltip>
          )}
          <Tooltip title="Remove">
            <Button danger type="text" className="hover:bg-red-50 rounded-lg" icon={<DeleteOutlined />} onClick={() => deleteLead(item._id)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 md:p-10 space-y-6 bg-[#f6f7fb] min-h-screen">
      
      {/* ---------------- HEADER ---------------- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <Title level={2} className="!mb-1 text-gray-800 flex items-center gap-3">
            <TeamOutlined className="text-indigo-600" /> Pipeline Manager
          </Title>
          <Text type="secondary" className="text-base">Track, organize, and convert your real estate prospects</Text>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Input 
            prefix={<SearchOutlined className="text-gray-400" />} 
            placeholder="Search by name or phone..." 
            className="rounded-xl w-full md:w-72 border-gray-200"
            size="large"
            onChange={handleSearch}
            value={searchQuery}
            allowClear
          />
          <Button 
            type="primary" 
            size="large" 
            icon={<UserAddOutlined />} 
            onClick={handleAddClick} 
            className="bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md border-none"
          >
            Add Client
          </Button>
        </div>
      </div>

      {/* ---------------- STATS ---------------- */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm rounded-2xl border-none">
            <Statistic title={<Text type="secondary" className="text-xs font-bold uppercase tracking-wider block mb-1">Total Pipeline</Text>} value={stats.total} prefix={<TeamOutlined className="text-gray-400 mr-2"/>} valueStyle={{ color: "#4f46e5", fontWeight: 'bold' }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm rounded-2xl border-none bg-cyan-50/50">
            <Statistic title={<Text type="secondary" className="text-xs font-bold uppercase tracking-wider block mb-1 text-cyan-600">Customers</Text>} value={stats.customers} prefix={<UserOutlined className="text-cyan-400 mr-2"/>} valueStyle={{ color: "#0891b2", fontWeight: 'bold' }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm rounded-2xl border-none bg-orange-50/50">
            <Statistic title={<Text type="secondary" className="text-xs font-bold uppercase tracking-wider block mb-1 text-orange-500">Active Leads</Text>} value={stats.activeLeads} prefix={<FireOutlined className="text-orange-400 mr-2"/>} valueStyle={{ color: "#ea580c", fontWeight: 'bold' }} />
          </Card>
        </Col>
      </Row>

      {/* ---------------- TABS & CUSTOM TABLE ---------------- */}
      <Card className="rounded-2xl border-none shadow-sm custom-pro-tabs overflow-hidden bg-white">
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          type="card"
          size="large"
          items={PIPELINE_STATUSES.map((status) => ({
            key: status.key,
            label: status.label,
            children: (
              <div className="p-2">
                <CustomTable 
                  columns={columns} 
                  data={leads} 
                  totalItems={pagination.totalResults}
                  currentPage={pagination.currentPage}
                  itemsPerPage={pagination.itemsPerPage}
                  onPageChange={handlePageChange}
                  loading={loading} 
                />
              </div>
            )
          }))}
        />
      </Card>

      {/* ---------------- ADD/EDIT LEAD MODAL ---------------- */}
      <Modal 
        title={
          <div className="flex items-center gap-2 text-lg">
            <UserAddOutlined className="text-indigo-600" />
            {selectedLead ? "Edit Client Profile" : "New Prospect Profile"}
          </div>
        } 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)} 
        footer={null} 
        width={800} 
        centered 
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFormFinish} className="mt-4">
          <Divider orientation="left" className="text-gray-500 text-xs uppercase font-bold tracking-wider">Personal Information</Divider>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="first_name" label="First Name" rules={[{ required: true, message: "Required" }]}>
                <Input size="large" className="rounded-xl" placeholder="e.g. John" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="last_name" label="Last Name" rules={[{ required: true, message: "Required" }]}>
                <Input size="large" className="rounded-xl" placeholder="e.g. Doe" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="phone_number" label="Phone Number" rules={[{ required: true, message: "Required" }]}>
                <Input size="large" className="rounded-xl" prefix={<PhoneOutlined className="text-gray-400"/>} placeholder="+971 50 123 4567" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="email" label="Email">
                <Input size="large" className="rounded-xl" prefix={<MailOutlined className="text-gray-400"/>} placeholder="client@example.com" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" className="text-gray-500 text-xs uppercase font-bold tracking-wider">Pipeline Details</Divider>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="status" label="Pipeline Stage" rules={[{ required: true, message: "Select status" }]}>
                <Select size="large" className="rounded-xl" placeholder="Select stage">
                  {PIPELINE_STATUSES.filter(s => s.key !== 'all').map(s => (
                    <Option key={s.key} value={s.key}>{s.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="source" label="Lead Source" initialValue="manual">
                <Select size="large" className="rounded-xl" placeholder="How did they find us?">
                  <Option value="manual">Manual Entry</Option>
                  <Option value="website">Website Lead</Option>
                  <Option value="site_visit">Site Visit</Option>
                  <Option value="qr_code">QR Code / Print</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" className="text-gray-500 text-xs uppercase font-bold tracking-wider">Property Requirements</Divider>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="budget" label="Max Budget (AED)">
                <InputNumber size="large" className="w-full rounded-xl" formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="property_type" label="Property Type">
                <Select size="large" className="rounded-xl" allowClear placeholder="Select Category">
                  <Option value="Apartment">Apartment</Option>
                  <Option value="Villa">Villa</Option>
                  <Option value="Townhouse">Townhouse</Option>
                  <Option value="Penthouse">Penthouse</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="bedrooms" label="Bedrooms">
                <Select size="large" className="rounded-xl" allowClear placeholder="Select Size">
                  <Option value={1}>1 BHK</Option>
                  <Option value={2}>2 BHK</Option>
                  <Option value={3}>3 BHK</Option>
                  <Option value={4}>4+ BHK</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="project" label="Target Project">
                <Select size="large" className="rounded-xl" placeholder="Search specific project" allowClear showSearch optionFilterProp="children">
                  {projects.map((p) => (
                    <Option key={p._id} value={p._id}>{p.propertyName}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="preferred_location" label="Preferred Location">
                <AutoComplete size="large" className="rounded-xl" options={locationOptions} onSearch={handleLocationSearch} placeholder="Search exact location..." allowClear />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="requirement_description" label="Agent Notes">
                <Input.TextArea rows={3} className="rounded-xl" placeholder="Add detailed specific requirements here..." />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <Button size="large" className="rounded-xl" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" size="large" loading={formLoading} className="bg-indigo-600 rounded-xl shadow-md border-none">
              {selectedLead ? "Save Profile" : "Create Profile"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Global Style overrides to make Tabs look premium */}
      <style>{`
        .custom-pro-tabs .ant-tabs-nav {
          margin-bottom: 0 !important;
          padding: 16px 20px 0 20px;
          background: #fafafa;
          border-bottom: 1px solid #f0f0f0;
        }
        .custom-pro-tabs .ant-tabs-tab {
          border: 1px solid transparent !important;
          background: transparent !important;
          border-radius: 8px 8px 0 0 !important;
          margin-right: 4px !important;
          padding: 8px 24px !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .custom-pro-tabs .ant-tabs-tab:hover {
          color: #4f46e5 !important;
        }
        .custom-pro-tabs .ant-tabs-tab-active {
          background: #ffffff !important;
          border-color: #f0f0f0 #f0f0f0 transparent #f0f0f0 !important;
          border-top: 2px solid #4f46e5 !important;
        }
        .custom-pro-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #4f46e5 !important;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}