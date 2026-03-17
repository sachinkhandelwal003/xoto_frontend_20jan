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
  DatePicker,
  TimePicker
} from "antd";

import {
  SearchOutlined,
  // PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  // CalendarOutlined,
  TrophyOutlined
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
  const [activeTab, setActiveTab] = useState("leads");
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState([]);

  // Modal & Form States for Leads
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [locationOptions, setLocationOptions] = useState([]);
  const [form] = Form.useForm();

  // Modal & Form States for Site Visit Request
  // const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  // const [visitLead, setVisitLead] = useState(null);
  // const [visitLoading, setVisitLoading] = useState(false);
  // const [visitForm] = Form.useForm();

  // ================= 1. FETCH LEADS & PROJECTS =================
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await apiService.get("/agent/lead/get-all-leads");
      const list = Array.isArray(response?.data) ? response.data : response?.data?.data || [];
      setLeads(list);
    } catch (err) {
      console.log(err);
      message.error("Failed to fetch leads.");
    } finally {
      setLoading(false);
    }
  };

  // ================= 1. FETCH PROJECTS =================
  const fetchProjects = async () => {
    try {
      // 🔥 Yahan '?limit=1000' add kiya hai taaki backend saare projects bhej de
      const res = await apiService.get("/property/get-all-properties?limit=1000");
      
      let list = [];
      if (Array.isArray(res?.data)) {
        list = res.data;
      } else if (res?.data?.data) {
        list = res.data.data;
      }

      setProjects(list);
    } catch (error) {
      console.log(error);
      message.error("Failed to fetch projects");
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchProjects();
  }, []);

  // ================= 2. DELETE & UPDATE STATUS =================
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

  // ================= 3. LEAD ADD / EDIT HANDLERS =================
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

  // ================= 4. SITE VISIT HANDLERS =================
  const handleScheduleVisitClick = (lead) => {
    setVisitLead(lead);
    visitForm.resetFields();
    // Pre-fill agar lead ka pehle se koi project target hai
    visitForm.setFieldsValue({
      property: lead?.project?._id || lead?.project
    });
    setIsVisitModalOpen(true);
  };

  // ================= 4. SITE VISIT HANDLERS =================
  const onVisitSubmit = async (values) => {
    setVisitLoading(true);
    try {
      const payload = {
  lead: visitLead._id,
  agent: user?._id || user?.id,
  property: values.property,
  visitDate: values.visitDate.format("YYYY-MM-DD"),
  visitTime: values.visitTime.format("HH:mm"),
  clientName: `${visitLead.name.first_name} ${visitLead.name.last_name}`,
  clientPhone: visitLead.phone_number
};
      // 1. Site Visit ki nayi request banayi
      await apiService.post("/agent/lead/create-site-visit", payload); 
      
      // 2. NAYA ADDITION: Lead ko update kiya taaki Admin me visit_requested show ho
      await apiService.post(`/agent/lead/update-lead/${visitLead._id}`, {
        status: "visit",
        visit_requested: true 
      });

      message.success("Site Visit requested successfully!");
      setIsVisitModalOpen(false);
      visitForm.resetFields();
      
      fetchLeads(); 
      
    } catch (error) {
      console.error(error);
      message.error("Failed to request site visit");
    } finally {
      setVisitLoading(false);
    }
  };

  // ================= 5. UI HELPERS & FILTERS =================
  const getStatus = (status) => {
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

  const activeLeads = filteredLeads.filter((l) => ["customer", "lead"].includes(l.status?.toLowerCase() || "customer"));
  // const visits = filteredLeads.filter((l) => l.status?.toLowerCase() === "visit");
  // const dealsAndBookings = filteredLeads.filter((l) => ["deal", "booking"].includes(l.status?.toLowerCase()));
  // const closedLeads = filteredLeads.filter((l) => l.status?.toLowerCase() === "closed");
  // const lostLeads = filteredLeads.filter((l) => l.status?.toLowerCase() === "lost");

  // ================= 6. RENDER COMPONENTS =================
 const columns = [
  {
    title: "Client Name",
    key: "name",
    render: (_, item) =>
      `${item?.name?.first_name || ""} ${item?.name?.last_name || ""}`,
  },
  {
    title: "Contact Info",
    key: "contact",
    render: (_, item) => (
      <div>
        <div>{item?.phone_number}</div>
        <div className="text-xs text-gray-500">{item?.email}</div>
      </div>
    ),
  },
  {
    title: "Budget / Project",
    key: "budget",
    render: (_, item) => (
      <div>
        <div>{item?.budget ? `${item.budget} AED` : "-"}</div>
        <div className="text-xs text-blue-600">
          {item?.project?.propertyName || "-"}
        </div>
      </div>
    ),
  },
  {
    title: "Status",
    key: "status",
    render: (value) => getStatus(value),
  },
  {
    title: "Action",
    key: "action",
    render: (_, item) => (
      <div className="flex gap-2">
        <Tooltip title="Edit">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditClick(item)}
          />
        </Tooltip>

        <Tooltip title="View">
          <Button
  type="text"
  icon={<EyeOutlined />}
 onClick={() => handleViewLead(item)}
/>
        </Tooltip>

        {item?.status === "lead" && (
          <Tooltip title="Move to Deal">
            <Button
              type="text"
              icon={<CheckCircleOutlined />}
              onClick={() => updateLeadStatus(item._id, "deal")}
            />
          </Tooltip>
        )}

        {["deal", "booking"].includes(item?.status) && (
          <Tooltip title="Close">
            <Button
              type="text"
              icon={<TrophyOutlined />}
              onClick={() => updateLeadStatus(item._id, "closed")}
            />
          </Tooltip>
        )}

        <Tooltip title="Delete">
          <Button
            danger
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => deleteLead(item._id)}
          />
        </Tooltip>
      </div>
    ),
  },
];

const handleViewLead = async (item) => {
  try {
    const res = await apiService.get(
      `/agent/lead/get-lead/${item._id}?includeInterests=true`
    );

    navigate("../lead-details", {
      state: res   // 🔥 full response bhejo
    });

  } catch (err) {
    console.error(err);
    message.error("Failed to load details");
  }
};

const customers = filteredLeads.filter(
  (l) => l.status?.toLowerCase() === "customer"
);

const onlyLeads = filteredLeads.filter(
  (l) => l.status?.toLowerCase() === "lead"
);

  return (
    <div className="p-6 bg-[#f6f7fb] min-h-screen relative">
      <div className="flex justify-between mb-6">
        <div>
          <Title level={3}>XOTO CRM - Lead Pipeline</Title>
          <Text type="secondary">Manage your clients from Customer to Closed Deal</Text>
        </div>
        
      </div>

      <Card className="mb-6 rounded-xl border-none shadow-sm">
        <Input size="large" prefix={<SearchOutlined className="text-gray-400" />} placeholder="Search by name or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </Card>

      <Card className="rounded-xl border-none shadow-sm">
       <Tabs
  activeKey={activeTab}
  onChange={(key) => setActiveTab(key)}
  items={[
    {
      key: "customers",
      label: `Customers (${customers.length})`,
      children: (
        <CustomTable
          columns={columns}
          data={customers}
          loading={loading}
          
        />
      ),
    },
    {
      key: "leads",
      label: `Leads (${onlyLeads.length})`,
      children: (
        <CustomTable
          columns={columns}
          data={onlyLeads}
          loading={loading}
        />
      ),
    },
  ]}
/>
      </Card>

      {/* ================= ADD/EDIT LEAD MODAL ================= */}
      <Modal title={selectedLead ? "Edit Details" : "Add New Client"} open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} width={750} centered>
        <Form form={form} layout="vertical" onFinish={onFormFinish} className="mt-4">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="first_name" label="First Name" rules={[{ required: true, message: "Required" }]}>
                <Input placeholder="Client first name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="last_name" label="Last Name" rules={[{ required: true, message: "Required" }]}>
                <Input placeholder="Client last name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone_number" label="Phone Number" rules={[{ required: true, message: "Required" }]}>
                <Input placeholder="+971..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email">
                <Input placeholder="Optional email" />
              </Form.Item>
            </Col>
            <Col span={12}>
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
            <Col span={12}>
              <Form.Item name="budget" label="Budget (AED)">
                <InputNumber className="w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="property_type" label="Property Type">
                <Select>
                  <Option value="Apartment">Apartment</Option>
                  <Option value="Villa">Villa</Option>
                  <Option value="Townhouse">Townhouse</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="project" label="Target Project">
                <Select placeholder="Select project" allowClear>
                  {projects.map((p) => (
                    <Option key={p._id} value={p._id}>{p.propertyName}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="bedrooms" label="Bedrooms">
                <Select allowClear>
                  <Option value={1}>1 BHK</Option>
                  <Option value={2}>2 BHK</Option>
                  <Option value={3}>3 BHK</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="preferred_location" label="Preferred Location">
                <AutoComplete options={locationOptions} onSearch={handleLocationSearch} placeholder="Search location..." allowClear />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="requirement_description" label="Requirement / AI Notes">
                <Input.TextArea rows={3} placeholder="Insights..." />
              </Form.Item>
            </Col>
          </Row>
          <div className="flex justify-end gap-3 mt-4">
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={formLoading} className="bg-[#7c3aed]">
              {selectedLead ? "Save Changes" : "Create Profile"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ================= SITE VISIT REQUEST MODAL ================= */}
      {/* <Modal title={`Request Site Visit for ${visitLead?.name?.first_name || "Client"}`} open={isVisitModalOpen} onCancel={() => setIsVisitModalOpen(false)} footer={null} centered>
        <Form form={visitForm} layout="vertical" onFinish={onVisitSubmit} className="mt-4">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="property" label="Property / Project" rules={[{ required: true, message: "Please select a property" }]}>
                <Select placeholder="Select the property to visit">
                  {projects.map((p) => (
                    <Option key={p._id} value={p._id}>{p.propertyName}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col> */}
            {/* Note: Developer id selection can be added here if needed, or fetched implicitly via project */}
            {/* <Col span={24}>
              <Form.Item name="developer" label="Developer ID (Optional / Auto-fetched)" tooltip="If your backend requires this explicitly">
                <Input placeholder="Developer ID or Name" />
              </Form.Item>
            </Col> */}
            {/* <Col span={12}>
              <Form.Item name="visitDate" label="Expected Date" rules={[{ required: true, message: "Select date" }]}>
                <DatePicker className="w-full" disabledDate={(current) => current && current < dayjs().startOf('day')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="visitTime" label="Expected Time" rules={[{ required: true, message: "Select time" }]}>
                <TimePicker format="HH:mm" className="w-full" />
              </Form.Item>
            </Col> */}
          {/* </Row> */}
          {/* <div className="flex justify-end gap-3 mt-4">
            <Button onClick={() => setIsVisitModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={visitLoading} className="bg-[#7c3aed]">
              Submit Request
            </Button>
          </div> */}
        {/* </Form> */}
      {/* </Modal> */}

    </div>
  );
}