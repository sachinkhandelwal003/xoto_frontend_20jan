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
  AutoComplete
} from "antd";

import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";

import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function AgentLeadDashboard() {
  const { user } = useSelector((state) => state.auth);

  // ================= STATES =================
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("leads");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [locationOptions, setLocationOptions] = useState([]);
  const [form] = Form.useForm();

  // ================= 1. FETCH LEADS =================
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await apiService.get("/agent/lead/get-all-leads?page=1&limit=50");
      const list = Array.isArray(response?.data) ? response.data : response?.data?.data || [];
      setLeads(list);
    } catch (err) {
      console.log(err);
      // Agar backend se 500 error aaya toh yahan fail hoga
      message.error("Failed to fetch leads. Check backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
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
      await apiService.patch(`/agent/lead/update-status/${id}`, { status });
      message.success(`Lead status updated to ${status}`);
      fetchLeads();
    } catch (error) {
      message.error("Status update failed");
    }
  };

  // ================= 3. ADD & EDIT BUTTON HANDLERS =================
  const handleAddClick = () => {
    setSelectedLead(null);
    form.resetFields(); // Form clear karo naye lead ke liye
    setIsModalOpen(true);
  };

  const handleEditClick = (lead) => {
    setSelectedLead(lead);
    // Jo lead edit karni hai, uska data form me pre-fill karo
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
      source: lead?.source || "manual",
      status: lead?.status || "lead",
    });
    setIsModalOpen(true);
  };

  // ================= 4. MODAL FORM SUBMIT (CREATE / UPDATE) =================
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
        source: values.source || "manual",
        status: values.status || "lead",
        agent: user?._id, // Logged in agent ID
      };

      if (selectedLead && selectedLead._id) {
        // UPDATE EXISTING LEAD
        await apiService.patch(`/agent/lead/update-lead/${selectedLead._id}`, payload);
        message.success("Lead updated successfully!");
      } else {
        // CREATE NEW LEAD
        await apiService.post("/agent/lead/create-lead", payload);
        message.success("New lead created successfully!");
      }

      setIsModalOpen(false);
      form.resetFields();
      fetchLeads(); // Save hone ke baad table update karo
    } catch (error) {
      console.error(error);
      message.error(error?.response?.data?.message || "Something went wrong!");
    } finally {
      setFormLoading(false);
    }
  };

  // ================= 5. UI HELPERS & FILTERS =================
  const getStatus = (status) => {
    switch (status) {
      case "lead": return <Tag color="gold">Lead</Tag>;
      case "visit": return <Tag color="blue">Visit</Tag>;
      case "deal": return <Tag color="purple">Deal</Tag>;
      case "booking": return <Tag color="green">Booking</Tag>;
      case "closed": return <Tag color="success">Closed</Tag>;
      default: return <Tag>Lead</Tag>;
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const name = `${lead?.name?.first_name || ""} ${lead?.name?.last_name || ""}`.toLowerCase();
    return name.includes(searchQuery.toLowerCase()) || (lead?.email || "").toLowerCase().includes(searchQuery.toLowerCase());
  });

  const activeLeads = filteredLeads.filter((l) => l.status !== "deal");
  const deals = filteredLeads.filter((l) => l.status === "deal");

  // ================= 6. RENDER COMPONENTS =================
  const LeadsTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse bg-white">
        <thead className="bg-gray-50 border-b">
          <tr className="text-xs uppercase text-gray-500">
            <th className="p-4 text-left">Client Name</th>
            <th className="p-4 text-left">Contact Info</th>
            <th className="p-4 text-center">Budget</th>
            <th className="p-4 text-center">Location</th>
            <th className="p-4 text-center">Status</th>
            <th className="p-4 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="6" className="p-10 text-center">Loading Leads...</td></tr>
          ) : activeLeads.length === 0 ? (
            <tr><td colSpan="6" className="p-10 text-center text-gray-400">No active leads found</td></tr>
          ) : (
            activeLeads.map((lead) => (
              <tr key={lead._id} className="border-b hover:bg-gray-50 text-sm">
                <td className="p-4 font-medium">{lead?.name?.first_name} {lead?.name?.last_name}</td>
                <td className="p-4">
                  <div>{lead?.phone_number}</div>
                  <div className="text-xs text-gray-500">{lead?.email}</div>
                </td>
                <td className="p-4 text-center">{lead?.budget ? lead.budget.toLocaleString() : "-"}</td>
                <td className="p-4 text-center">{lead?.preferred_location || "-"}</td>
                <td className="p-4 text-center">{getStatus(lead?.status)}</td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-1">
                    {/* EDIT BUTTON YAHAN HAI */}
                    <Tooltip title="Edit">
                      <Button type="text" icon={<EditOutlined />} onClick={() => handleEditClick(lead)} />
                    </Tooltip>
                    <Tooltip title="Delete">
                      <Button danger type="text" icon={<DeleteOutlined />} onClick={() => deleteLead(lead._id)} />
                    </Tooltip>
                    <Tooltip title="Move to Deal">
                      <Button type="text" className="text-green-600" icon={<CheckCircleOutlined />} onClick={() => updateLeadStatus(lead._id, "deal")} />
                    </Tooltip>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-6 bg-[#f6f7fb] min-h-screen relative">
      {/* Header */}
      <div className="flex justify-between mb-6">
        <div>
          <Title level={3}>Lead Management</Title>
          <Text type="secondary">View, Add, and Edit your leads in one place</Text>
        </div>
        {activeTab === "leads" && (
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleAddClick} className="bg-[#7c3aed]">
            Add New Lead
          </Button>
        )}
      </div>

      {/* Search & Tabs */}
      <Card className="mb-6 rounded-xl border-none shadow-sm">
        <Input size="large" prefix={<SearchOutlined className="text-gray-400" />} placeholder="Search by name or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </Card>
      <Card className="rounded-xl border-none shadow-sm">
        <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)} items={[{ key: "leads", label: `Active Leads (${activeLeads.length})`, children: <LeadsTable /> }]} size="large" />
      </Card>

      {/* ================= MODAL FOR ADD / EDIT ================= */}
      <Modal
        title={selectedLead ? "Edit Lead" : "Add New Lead"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={700}
        centered
      >
        <Form form={form} layout="vertical" onFinish={onFormFinish} initialValues={{ source: "manual", status: "lead" }} className="mt-4">
          <Row gutter={16}>
            <Col span={12}><Form.Item name="first_name" label="First Name" rules={[{ required: true, message: "Required" }]}><Input placeholder="John" /></Form.Item></Col>
            <Col span={12}><Form.Item name="last_name" label="Last Name" rules={[{ required: true, message: "Required" }]}><Input placeholder="Doe" /></Form.Item></Col>
            <Col span={12}><Form.Item name="phone_number" label="Phone Number" rules={[{ required: true, message: "Required" }]}><Input placeholder="+971 50..." /></Form.Item></Col>
            <Col span={12}><Form.Item name="email" label="Email"><Input type="email" placeholder="john@example.com" /></Form.Item></Col>
            
            <Col span={12}>
              <Form.Item name="property_type" label="Property Type">
                <Select><Option value="Apartment">Apartment</Option><Option value="Villa">Villa</Option></Select>
              </Form.Item>
            </Col>
            <Col span={12}><Form.Item name="budget" label="Budget (AED)"><InputNumber className="w-full" /></Form.Item></Col>
            <Col span={24}>
              <Form.Item name="preferred_location" label="Preferred Location">
                <AutoComplete options={locationOptions} onSearch={handleLocationSearch} placeholder="Type to search..." allowClear />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item name="source" label="Source">
                <Select><Option value="manual">Manual</Option><Option value="presentation">Presentation</Option></Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Status">
                <Select><Option value="lead">Lead</Option><Option value="visit">Visit</Option><Option value="deal">Deal</Option></Select>
              </Form.Item>
            </Col>
          </Row>
          <div className="flex justify-end gap-3 mt-4">
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={formLoading} className="bg-[#7c3aed]">
              {selectedLead ? "Update Lead" : "Save Lead"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}