import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Card, Button, Modal, Form, Input, Typography, Row, Col, Avatar,
  Upload, Select, InputNumber, Tooltip, Space, Spin, Steps, Alert, Popconfirm,
  Segmented
} from "antd";
import {
  PlusOutlined, DeleteOutlined, UserOutlined, SearchOutlined,
  CheckCircleFilled, IdcardOutlined, FileDoneOutlined,
  EyeOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined,
  TrophyOutlined, CalendarOutlined, UploadOutlined, CloseCircleOutlined,
  TeamOutlined, StarFilled, GlobalOutlined,
  SafetyCertificateOutlined, FileTextOutlined, ArrowRightOutlined,
  BankOutlined, CloseOutlined
} from "@ant-design/icons";
import { FiSearch, FiRefreshCw } from "react-icons/fi";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import CustomTable from '../../CMS/pages/custom/CustomTable'; // Adjust path as needed
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;
const { Option } = Select;

const THEME = {
  primary: "#6366f1",
  secondary: "#8b5cf6",
  success: "#10b981",
  error: "#f43f5e",
  warning: "#f59e0b",
  agencyTheme: "#4A027C" // Provided theme color for the segmented tabs
};

/* ─────────────────────────── Upload Field ─────────────────────────── */
const UploadField = ({ type, label, icon, accept, urls, uploadFiles, uploading, onUpload, onRemove }) => {
  const handleFile = (file) => { onUpload(file, type); return false; };
  const remove = () => onRemove(type);

  return (
    <div style={{ textAlign: "center" }}>
      {urls[type] ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          {type === "profile" ? (
            <div style={{ position: "relative", display: "inline-block" }}>
              <Avatar src={urls[type]} size={72} style={{ border: "3px solid #fff", boxShadow: "0 4px 12px rgba(99,102,241,0.25)" }} />
              <Button
                type="text" icon={<CloseCircleOutlined />} onClick={remove}
                size="small" danger
                style={{ position: "absolute", top: -8, right: -8, background: "#fff", borderRadius: "50%", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", minWidth: 22, width: 22, height: 22, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
              />
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(135deg,#f0f4ff,#e8edff)", padding: "10px 14px", borderRadius: 10, width: "100%", border: "1px solid #c7d2fe" }}>
              <Text style={{ fontSize: 12, color: THEME.primary, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {uploadFiles[type]?.name || label}
              </Text>
              <Button type="text" icon={<DeleteOutlined />} onClick={remove} size="small" danger style={{ flexShrink: 0 }} />
            </div>
          )}
          <Text style={{ fontSize: 11, color: THEME.success, fontWeight: 600 }}>✓ Uploaded</Text>
        </div>
      ) : (
        <Upload showUploadList={false} beforeUpload={handleFile} accept={accept}>
          <Button
            loading={uploading[type]} icon={icon}
            style={{ width: "100%", borderRadius: 10, borderStyle: "dashed", borderColor: "#c7d2fe", color: THEME.primary, background: "linear-gradient(135deg,#fafbff,#f0f4ff)", height: 44, fontWeight: 500 }}
          >
            {label}
          </Button>
        </Upload>
      )}
    </div>
  );
};

/* ─────────────────────────── Info Row ─────────────────────────── */
const InfoRow = ({ icon, label, value, last }) => (
  <>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: THEME.primary, fontSize: 14, flexShrink: 0 }}>{icon}</span>
        <Text style={{ color: "#94a3b8", fontSize: 13 }}>{label}</Text>
      </div>
      <div style={{ textAlign: "right" }}>{value}</div>
    </div>
    {!last && <div style={{ height: 1, background: "linear-gradient(90deg,transparent,#e2e8f0,transparent)" }} />}
  </>
);

/* ─────────────────────────── Stat Pill ─────────────────────────── */
const StatPill = ({ label, value }) => (
  <div style={{ textAlign: "center", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", borderRadius: 12, padding: "10px 20px", border: "1px solid rgba(255,255,255,0.25)", flex: 1 }}>
    <div style={{ color: "#fff", fontWeight: 700, fontSize: 18, lineHeight: 1 }}>{value}</div>
    <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, marginTop: 3 }}>{label}</div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════ */
/* MAIN COMPONENT                               */
/* ═══════════════════════════════════════════════════════════════════ */
const AgencyManageAgents = () => {
  const { user } = useSelector((s) => s.auth);
  const agencyId = user?._id || user?.id;

  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("approved"); // Replaces old statusFilter
  
  // Pagination & API Stats State
  const [pagination, setPagination] = useState({ currentPage: 1, itemsPerPage: 10, totalResults: 0 });
  const [apiStats, setApiStats] = useState({ total: 0, approved: 0, pending: 0, verified: 0, notVerified: 0 });

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [urls, setUrls] = useState({ profile: "", idProof: "", rera: "" });
  const [uploadFiles, setUploadFiles] = useState({ profile: null, idProof: null, rera: null });
  const [uploading, setUploading] = useState({ profile: false, idProof: false, rera: false });

  // View Details Modal State
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const searchTimeout = useRef(null);

  /* ── Fetch List ── */
  const fetchAgents = useCallback(async (page = 1, limit = 10, searchVal = "", tabVal = "approved") => {
    setLoading(true);
    try {
      let url = `/agent/get-all-agents/agency?page=${page}&limit=${limit}&onboarding_status=${tabVal}`;
      if (searchVal?.trim()) url += `&search=${searchVal.trim()}`;

      const res = await apiService.get(url);
      const resData = res?.data || res;
      
      if (resData) {
        const mapped = resData.map((agent, i) => ({
          ...agent,
          key: agent._id,
          sno: (page - 1) * limit + i + 1,
          name: `${agent.first_name || ""} ${agent.last_name || ""}`.trim(),
          phone: `${agent.country_code || ""} ${agent.phone_number || ""}`.trim(),
        }));
        setAgents(mapped);
        setPagination({
          currentPage: resData.pagination?.currentPage || page,
          itemsPerPage: resData.pagination?.limit || limit,
          totalResults: resData.pagination?.totalItems || mapped.length,
        });
        if (resData.stats) setApiStats(resData.stats);
      } else {
        setAgents([]);
        setPagination(prev => ({ ...prev, totalResults: 0 }));
      }
    } catch (err) {
      toast.error("Failed to load agents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents(pagination.currentPage, pagination.itemsPerPage, search, activeTab);
  }, [activeTab, fetchAgents]); // Added dependencies

  /* ── Search Handler ── */
  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchAgents(1, pagination.itemsPerPage, val, activeTab);
    }, 500);
  };

  const handleClearSearch = () => {
    setSearch("");
    fetchAgents(1, pagination.itemsPerPage, "", activeTab);
  };

  /* ── Fetch Single Agent Details ── */
  const handleViewAgent = async (agent) => {
    setViewModalOpen(true);
    setDetailsLoading(true);
    setSelectedAgent(agent); // Show basic info first

    try {
      const res = await apiService.get(`/agent/get-agent-details/${agent._id}`);
      if (res?.data?.data) {
        setSelectedAgent(res.data.data);
      }
    } catch (err) {
      toast.error("Failed to load agent details");
    } finally {
      setDetailsLoading(false);
    }
  };

  /* ── Upload Handler ── */
  const handleInstantUpload = async (file, type) => {
    const allowed = type === "profile" ? ["image/jpeg","image/png","image/jpg"] : ["application/pdf","image/jpeg","image/png","image/jpg"];
    if (!allowed.includes(file.type)) { toast.error("Invalid file type"); return false; }
    
    const fd = new FormData(); fd.append("file", file);
    setUploading((p) => ({ ...p, [type]: true }));
    try {
      const res = await apiService.upload("upload", fd);
      const url = res?.file?.url || res?.url;
      if (url) { 
        setUrls((p) => ({ ...p, [type]: url })); 
        setUploadFiles((p) => ({ ...p, [type]: file })); 
        toast.success("Uploaded!"); 
      }
    } catch { 
      toast.error("Upload failed"); 
    }
    setUploading((p) => ({ ...p, [type]: false })); return false;
  };

  const removeFile = (type) => { 
    setUrls((p) => ({ ...p, [type]: "" })); 
    setUploadFiles((p) => ({ ...p, [type]: null })); 
  };

  /* ── Add Agent ── */
  const handleAddAgent = async (values) => {
    try {
      await apiService.post("/agent/agent-signup", {
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
      });
      toast.success("Agent created successfully");
      fetchAgents(1, pagination.itemsPerPage, search, activeTab);
      closeAddModal();
    } catch (e) { 
      toast.error(e?.response?.data?.message || "Failed to create agent"); 
    }
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false); 
    form.resetFields();
    setUrls({ profile: "", idProof: "", rera: "" });
    setUploadFiles({ profile: null, idProof: null, rera: null });
    setCurrentStep(0);
  };

  /* ── Delete ── */
  const handleDelete = async (id) => {
    try {
      await apiService.delete(`agent/delete-agent/${id}`);
      toast.success("Agent removed");
      fetchAgents(pagination.currentPage, pagination.itemsPerPage, search, activeTab);
      if (viewModalOpen) setViewModalOpen(false);
    } catch { 
      toast.error("Failed to remove agent"); 
    }
  };

  /* ── Table Columns ── */
  const columns = [
   
    {
      title: "Agent", width: 260,
      render: (_, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ position: "relative" }}>
            <Avatar src={r.profile_photo} icon={<UserOutlined />} size={44} style={{ border: "2px solid #e0e7ff", boxShadow: "0 2px 8px rgba(99,102,241,0.2)" }} />
            <span style={{ position: "absolute", bottom: 0, right: 0, width: 11, height: 11, borderRadius: "50%", background: r.status ? THEME.success : THEME.error, border: "2px solid #fff" }} />
          </div>
          <div>
            <Text strong style={{ color: "#1e293b", fontSize: 14, display: "block" }}>{r.name}</Text>
            <Text style={{ color: "#94a3b8", fontSize: 12 }}>{r.email}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "Phone", width: 155,
      render: (_, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <PhoneOutlined style={{ color: THEME.primary, fontSize: 12 }} />
          <Text style={{ color: "#475569", fontSize: 13 }}>{r.phone || "—"}</Text>
        </div>
      ),
    },
    {
      title: "Location", width: 150,
      render: (_, r) => (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <EnvironmentOutlined style={{ color: "#3b82f6", fontSize: 12 }} />
            <Text style={{ color: "#1e293b", fontSize: 13, fontWeight: 500 }}>{r.operating_city || "—"}</Text>
          </div>
          {r.country && <Text style={{ color: "#94a3b8", fontSize: 11, paddingLeft: 17 }}>{r.country}</Text>}
        </div>
      ),
    },
    {
      title: "Specialization", width: 150,
      render: (_, r) => r.specialization ? (
        <span style={{ display: "inline-block", padding: "3px 12px", borderRadius: 20, background: "linear-gradient(135deg,#ede9fe,#ddd6fe)", color: "#5b21b6", fontSize: 12, fontWeight: 600, border: "1px solid #c4b5fd" }}>
          {r.specialization}
        </span>
      ) : <Text style={{ color: "#cbd5e1" }}>—</Text>,
    },
    {
      title: "Exp.", width: 90, align: "center",
      render: (_, r) => (r.experience_years !== undefined && r.experience_years !== null) ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <TrophyOutlined style={{ color: THEME.warning, fontSize: 13 }} />
          <Text strong style={{ fontSize: 13 }}>{r.experience_years}y</Text>
        </div>
      ) : <Text style={{ color: "#cbd5e1" }}>—</Text>,
    },
    {
      title: "Status", width: 110, align: "center",
      render: (_, r) => (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: r.status ? "#f0fdf4" : "#fff1f2", color: r.status ? "#15803d" : "#be123c", border: `1px solid ${r.status ? "#bbf7d0" : "#fecdd3"}` }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: r.status ? THEME.success : THEME.error }} />
          {r.status ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      title: "Actions", fixed: "right", width: 100, align: "center",
      render: (_, r) => (
        <Space size={4}>
          <Tooltip title="View Details">
            <Button type="text" icon={<EyeOutlined />} onClick={() => handleViewAgent(r)}
              style={{ borderRadius: 8, color: THEME.primary, background: "transparent" }}
            />
          </Tooltip>
          <Popconfirm title="Remove Agent" description="Sure to remove?" onConfirm={() => handleDelete(r._id)} okText="Yes" cancelText="No" placement="topRight">
            <Tooltip title="Remove">
              <Button type="text" danger icon={<DeleteOutlined />} style={{ borderRadius: 8, background: "transparent" }} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "32px 32px", background: "#f8faff", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1600, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg,${THEME.primary},${THEME.secondary})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(99,102,241,0.4)" }}>
                <TeamOutlined style={{ color: "#fff", fontSize: 20 }} />
              </div>
              <Title level={2} style={{ margin: 0, color: "#1e293b", fontWeight: 700 }}>Team Management</Title>
            </div>
          </div>
          <Button
            type="primary" size="large" icon={<PlusOutlined />}
            onClick={() => setIsAddModalOpen(true)}
            style={{ borderRadius: 12, paddingInline: 24, height: 46, fontWeight: 600, fontSize: 15, background: `linear-gradient(135deg,${THEME.primary},${THEME.secondary})`, border: "none", boxShadow: "0 4px 14px rgba(99,102,241,0.4)" }}
          >
            Add New Agent
          </Button>
        </div>

        {/* ── Stats ── */}
        <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
          {[
            { label: "Total Agents", value: apiStats.total, icon: <TeamOutlined />, grad: `linear-gradient(135deg,${THEME.primary},${THEME.secondary})`, shadow: "rgba(99,102,241,0.35)" },
            { label: "Approved & Active", value: apiStats.approved, icon: <CheckCircleFilled />, grad: `linear-gradient(135deg,${THEME.success},#059669)`, shadow: "rgba(16,185,129,0.35)" },
            { label: "Verified KYC", value: apiStats.verified, icon: <SafetyCertificateOutlined />, grad: "linear-gradient(135deg,#3b82f6,#2563eb)", shadow: "rgba(59,130,246,0.35)" },
            { label: "Pending Approvals", value: apiStats.pending, icon: <StarFilled />, grad: `linear-gradient(135deg,${THEME.warning},#d97706)`, shadow: "rgba(245,158,11,0.35)" },
          ].map((s, i) => (
            <Col xs={12} sm={12} lg={6} key={i}>
              <div style={{ background: "#fff", borderRadius: 16, padding: "20px 22px", border: "1px solid #e2e8f0", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 16, transition: "transform 0.2s, box-shadow 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${s.shadow}`; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)"; }}
              >
                <div style={{ width: 50, height: 50, borderRadius: 14, background: s.grad, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 12px ${s.shadow}`, flexShrink: 0 }}>
                  <span style={{ color: "#fff", fontSize: 22 }}>{s.icon}</span>
                </div>
                <div>
                  <div style={{ color: "#64748b", fontSize: 12, fontWeight: 500, marginBottom: 2 }}>{s.label}</div>
                  <div style={{ color: "#1e293b", fontSize: 26, fontWeight: 700, lineHeight: 1 }}>{s.value}</div>
                </div>
              </div>
            </Col>
          ))}
        </Row>

        {/* ── Filters & Table Area ── */}
        <Card bordered={false} className="shadow-sm rounded-xl overflow-hidden" bodyStyle={{ padding: 0 }}>
          
          {/* SEGMENTED TABS & SEARCH */}
          <div className="flex flex-wrap items-center justify-between px-4 py-4 border-b border-gray-100 gap-4" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f3f4f6', gap: '16px' }}>
            
            <Segmented
              options={[
                { label: 'Approved', value: 'approved' },
                { label: 'Rejected', value: 'rejected' },
              ]}
              value={activeTab}
              onChange={(val) => {
                setActiveTab(val);
                setPagination(prev => ({ ...prev, currentPage: 1 }));
              }}
              className="custom-segmented-theme"
              size="large"
            />

            <div style={{ display: "flex", gap: "12px" }}>
              <Input
                placeholder="Search agents..."
                prefix={<FiSearch style={{ color: "#9ca3af" }} />}
                value={search}
                onChange={handleSearch}
                allowClear
                onClear={handleClearSearch}
                style={{ width: 300, borderRadius: 8 }}
              />
              <Button
                icon={<FiRefreshCw />}
                onClick={() => fetchAgents(pagination.currentPage, pagination.itemsPerPage, search, activeTab)}
              >
                Refresh
              </Button>
            </div>
          </div>

          <div className="bg-white">
             <CustomTable
               columns={columns}
               data={agents}
               loading={loading}
               totalItems={pagination.totalResults}
               currentPage={pagination.currentPage}
               onPageChange={(page, limit) => fetchAgents(page, limit, search, activeTab)}
               scroll={{ x: 1000 }}
               showSearch={false}  
             />
          </div>
        </Card>

        {/* ════════════ ADD AGENT MODAL ════════════ */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg,${THEME.primary},${THEME.secondary})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <UserOutlined style={{ color: "#fff", fontSize: 16 }} />
              </div>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#1e293b" }}>Register New Agent</span>
            </div>
          }
          open={isAddModalOpen} onCancel={closeAddModal} footer={null}
          width={860} centered
          styles={{ content: { borderRadius: 20, overflow: "hidden" }, header: { padding: "20px 28px 0", borderBottom: "none" }, body: { padding: "20px 28px 28px" } }}
        >
          <Steps current={currentStep} onChange={setCurrentStep} style={{ marginBottom: 28 }}
            items={[
              { title: "Personal", icon: <UserOutlined /> },
              { title: "Professional", icon: <TrophyOutlined /> },
              { title: "Documents", icon: <FileDoneOutlined /> },
            ]}
          />
          <Form form={form} layout="vertical" onFinish={handleAddAgent}>
            {/* Step 0 */}
            {currentStep === 0 && (
              <>
                <Alert message="Personal Information" description="Provide the agent's basic contact details." type="info" showIcon style={{ borderRadius: 10, marginBottom: 20 }} />
                <Row gutter={20}>
                  <Col xs={24} md={12}><Form.Item name="first_name" label="First Name" rules={[{ required: true }]}><Input size="large" placeholder="e.g. John" style={{ borderRadius: 10 }} /></Form.Item></Col>
                  <Col xs={24} md={12}><Form.Item name="last_name" label="Last Name" rules={[{ required: true }]}><Input size="large" placeholder="e.g. Doe" style={{ borderRadius: 10 }} /></Form.Item></Col>
                  <Col xs={24} md={12}><Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}><Input size="large" placeholder="agent@agency.com" prefix={<MailOutlined style={{ color: "#94a3b8" }} />} style={{ borderRadius: 10 }} /></Form.Item></Col>
                  <Col xs={24} md={12}><Form.Item name="password" label="Temporary Password" rules={[{ required: true }]}><Input.Password size="large" placeholder="Secure password" style={{ borderRadius: 10 }} /></Form.Item></Col>
                  <Col xs={8}><Form.Item name="country_code" label="Code" initialValue="+971"><Select size="large" style={{ borderRadius: 10 }}><Option value="+971">🇦🇪 +971</Option><Option value="+91">🇮🇳 +91</Option><Option value="+1">🇺🇸 +1</Option><Option value="+44">🇬🇧 +44</Option></Select></Form.Item></Col>
                  <Col xs={16}><Form.Item name="phone_number" label="Phone Number" rules={[{ required: true }]}><Input size="large" placeholder="50 123 4567" prefix={<PhoneOutlined style={{ color: "#94a3b8" }} />} style={{ borderRadius: 10 }} /></Form.Item></Col>
                </Row>
              </>
            )}
            {/* Step 1 */}
            {currentStep === 1 && (
              <>
                <Alert message="Professional Details" description="Add expertise and qualification information." type="info" showIcon style={{ borderRadius: 10, marginBottom: 20 }} />
                <Row gutter={20}>
                  <Col xs={24} md={8}><Form.Item name="country" label="Country" initialValue="UAE"><Input size="large" prefix={<GlobalOutlined style={{ color: "#94a3b8" }} />} style={{ borderRadius: 10 }} /></Form.Item></Col>
                  <Col xs={24} md={8}><Form.Item name="operating_city" label="Operating City" rules={[{ required: true }]}><Input size="large" placeholder="e.g. Dubai" prefix={<EnvironmentOutlined style={{ color: "#94a3b8" }} />} style={{ borderRadius: 10 }} /></Form.Item></Col>
                  <Col xs={24} md={8}><Form.Item name="experience_years" label="Experience (Years)"><InputNumber size="large" style={{ width: "100%", borderRadius: 10 }} min={0} placeholder="0" /></Form.Item></Col>
                  <Col xs={24} md={12}><Form.Item name="specialization" label="Specialization"><Select size="large" placeholder="Select specialization" style={{ borderRadius: 10 }}>{["Luxury","Residential","Commercial","Off-Plan","Rental","Investment"].map((s) => <Option key={s} value={s}>{s}</Option>)}</Select></Form.Item></Col>
                  <Col xs={24} md={12}><Form.Item name="rera_number" label="RERA Number"><Input size="large" placeholder="RERA Registration No." prefix={<SafetyCertificateOutlined style={{ color: "#94a3b8" }} />} style={{ borderRadius: 10 }} /></Form.Item></Col>
                </Row>
              </>
            )}
            {/* Step 2 */}
            {currentStep === 2 && (
              <>
                <Alert message="Documents & Media" description="Upload verification documents." type="info" showIcon style={{ borderRadius: 10, marginBottom: 20 }} />
                <Row gutter={[20, 20]}>
                  {[
                    { type: "profile", label: "Profile Photo", icon: <UserOutlined />, accept: "image/*" },
                    { type: "idProof", label: "ID Proof", icon: <IdcardOutlined />, accept: ".pdf,image/*" },
                    { type: "rera", label: "RERA Certificate", icon: <SafetyCertificateOutlined />, accept: ".pdf,image/*" },
                  ].map((f) => (
                    <Col xs={24} md={8} key={f.type}>
                      <div style={{ background: "linear-gradient(135deg,#fafbff,#f0f4ff)", borderRadius: 14, padding: 20, border: "1px dashed #c7d2fe", textAlign: "center" }}>
                        <div style={{ fontSize: 28, color: THEME.primary, marginBottom: 10 }}>{f.icon}</div>
                        <Text style={{ fontWeight: 600, color: "#1e293b", display: "block", marginBottom: 12 }}>{f.label}</Text>
                        <UploadField type={f.type} label={`Upload ${f.label}`} icon={<UploadOutlined />} accept={f.accept} urls={urls} uploadFiles={uploadFiles} uploading={uploading} onUpload={handleInstantUpload} onRemove={removeFile} />
                      </div>
                    </Col>
                  ))}
                </Row>
              </>
            )}
            {/* Footer Buttons */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, paddingTop: 20, borderTop: "1px solid #f1f5f9" }}>
              {currentStep > 0 ? (
                <Button size="large" onClick={() => setCurrentStep(currentStep - 1)} style={{ borderRadius: 10, paddingInline: 24 }}>Back</Button>
              ) : <span />}
              <div style={{ display: "flex", gap: 10 }}>
                <Button size="large" onClick={closeAddModal} style={{ borderRadius: 10, paddingInline: 20 }}>Cancel</Button>
                {currentStep < 2 ? (
                  <Button size="large" type="primary" onClick={() => setCurrentStep(currentStep + 1)}
                    style={{ borderRadius: 10, paddingInline: 28, background: `linear-gradient(135deg,${THEME.primary},${THEME.secondary})`, border: "none", fontWeight: 600 }}>
                    Next <ArrowRightOutlined />
                  </Button>
                ) : (
                  <Button size="large" type="primary" htmlType="submit"
                    style={{ borderRadius: 10, paddingInline: 28, background: `linear-gradient(135deg,${THEME.primary},${THEME.secondary})`, border: "none", fontWeight: 600 }}>
                    Create Agent
                  </Button>
                )}
              </div>
            </div>
          </Form>
        </Modal>

        {/* ════════════ VIEW AGENT MODAL ════════════ */}
        <Modal
          open={viewModalOpen}
          onCancel={() => setViewModalOpen(false)}
          footer={null}
          width={650}
          centered
          styles={{ 
            content: { padding: 0, borderRadius: 16, overflow: "hidden", border: "none" },
            body: { padding: 0 }
          }}
          closeIcon={<CloseOutlined style={{ color: "#fff", background: "rgba(0,0,0,0.2)", padding: 8, borderRadius: "50%" }} />}
        >
          <Spin spinning={detailsLoading}>
            {selectedAgent && (
              <div style={{ display: "flex", flexDirection: "column" }}>
                
                {/* ── Hero Banner ── */}
                <div style={{
                  background: `linear-gradient(145deg, ${THEME.primary} 0%, ${THEME.secondary} 100%)`,
                  padding: "40px 24px 30px",
                  position: "relative",
                  textAlign: "center",
                  overflow: "hidden"
                }}>
                  {/* Decorative circles */}
                  <div style={{ position: "absolute", top: -30, left: -30, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
                  <div style={{ position: "absolute", bottom: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

                  <div style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
                    <Avatar
                      src={selectedAgent.profile_photo} icon={<UserOutlined />} size={100}
                      style={{ border: "4px solid rgba(255,255,255,0.85)", boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}
                    />
                    <span style={{
                      position: "absolute", bottom: 4, right: 8, width: 18, height: 18,
                      borderRadius: "50%", background: selectedAgent.status ? THEME.success : THEME.error,
                      border: "3px solid #fff", boxShadow: "0 0 0 2px rgba(255,255,255,0.4)"
                    }} />
                  </div>
                  
                  <Title level={3} style={{ color: "#fff", margin: 0, fontWeight: 700 }}>
                    {selectedAgent.first_name} {selectedAgent.last_name}
                  </Title>
                  
                  <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap", justifyContent: "center" }}>
                    <span style={{ background: "rgba(255,255,255,0.2)", color: "#fff", borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 600, border: "1px solid rgba(255,255,255,0.3)" }}>
                      {selectedAgent.agentType === 'agency_agent' ? 'Agency Agent' : selectedAgent.role}
                    </span>
                    {selectedAgent.specialization && (
                      <span style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.9)", borderRadius: 20, padding: "4px 14px", fontSize: 12, border: "1px solid rgba(255,255,255,0.2)" }}>
                        {selectedAgent.specialization}
                      </span>
                    )}
                  </div>
                  
                  <div style={{ display: "flex", gap: 12, marginTop: 24, padding: "0 20px" }}>
                    <StatPill label="Experience" value={selectedAgent.experience_years ? `${selectedAgent.experience_years}y` : "—"} />
                    <StatPill label="Closed Deals" value={selectedAgent.dealsClosed_count || "0"} />
                    <StatPill label="Account Status" value={selectedAgent.status ? "Active" : "Inactive"} />
                  </div>
                </div>

                {/* ── Scrollable Body ── */}
                <div style={{ padding: "24px", background: "#f8faff", maxHeight: "60vh", overflowY: "auto" }}>
                  <Row gutter={[20, 20]}>
                    
                    {/* Column 1: Contact & Location */}
                    <Col xs={24} md={12}>
                      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: "16px 18px", height: "100%", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#ede9fe,#ddd6fe)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <MailOutlined style={{ color: THEME.primary, fontSize: 13 }} />
                          </div>
                          <Text style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>Contact & Location</Text>
                        </div>
                        <InfoRow icon={<MailOutlined />} label="Email" value={<Text style={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}>{selectedAgent.email}</Text>} />
                        <InfoRow icon={<PhoneOutlined />} label="Phone" value={<Text style={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}>{selectedAgent.country_code} {selectedAgent.phone_number}</Text>} />
                        <InfoRow icon={<EnvironmentOutlined />} label="City" value={<Text style={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}>{selectedAgent.operating_city || "—"}</Text>} />
                        <InfoRow icon={<GlobalOutlined />} label="Country" value={<Text style={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}>{selectedAgent.country || "—"}</Text>} last />
                      </div>
                    </Col>

                    {/* Column 2: Professional Details */}
                    <Col xs={24} md={12}>
                      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: "16px 18px", height: "100%", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#fef3c7,#fde68a)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <TrophyOutlined style={{ color: THEME.warning, fontSize: 13 }} />
                          </div>
                          <Text style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>Professional Info</Text>
                        </div>
                        <InfoRow icon={<SafetyCertificateOutlined />} label="RERA No." value={<Text style={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}>{selectedAgent.rera_number || "—"}</Text>} />
                        <InfoRow icon={<BankOutlined />} label="Agency" value={<Text style={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}>{selectedAgent.agency?.agency_name || "—"}</Text>} />
                        <InfoRow icon={<CheckCircleFilled />} label="Verification" value={
                          <span style={{ color: selectedAgent.isVerified ? THEME.success : THEME.warning, fontWeight: 600, fontSize: 12, background: selectedAgent.isVerified ? "#dcfce7" : "#fef3c7", padding: "2px 8px", borderRadius: 10 }}>
                            {selectedAgent.isVerified ? "Verified" : "Pending KYC"}
                          </span>
                        } />
                        <InfoRow icon={<FileTextOutlined />} label="Onboarding" value={
                          <span style={{ color: selectedAgent.onboarding_status === 'approved' ? THEME.success : THEME.error, fontWeight: 600, fontSize: 12, textTransform: "capitalize" }}>
                            {selectedAgent.onboarding_status}
                          </span>
                        } last />
                      </div>
                    </Col>

                    {/* Documents Row spanning full width */}
                    {(selectedAgent.id_proof || selectedAgent.rera_certificate) && (
                      <Col xs={24}>
                        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: "16px 18px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#dcfce7,#bbf7d0)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <FileTextOutlined style={{ color: THEME.success, fontSize: 13 }} />
                            </div>
                            <Text style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>Documents Verification</Text>
                          </div>
                          
                          <Row gutter={16}>
                            {[
                              { label: "ID Proof", url: selectedAgent.id_proof },
                              { label: "RERA Certificate", url: selectedAgent.rera_certificate },
                            ].filter((d) => d.url).map((doc, idx) => (
                              <Col xs={24} sm={12} key={idx}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <SafetyCertificateOutlined style={{ color: THEME.primary, fontSize: 14 }} />
                                    <Text style={{ color: "#475569", fontSize: 13, fontWeight: 500 }}>{doc.label}</Text>
                                  </div>
                                  <a href={doc.url} target="_blank" rel="noreferrer" style={{ color: THEME.primary, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
                                    View ↗
                                  </a>
                                </div>
                              </Col>
                            ))}
                          </Row>
                        </div>
                      </Col>
                    )}
                  </Row>

                  <div style={{ marginTop: 24 }}>
                    <Popconfirm
                      title="Remove Agent"
                      description="Are you sure you want to remove this agent from your team?"
                      onConfirm={() => handleDelete(selectedAgent._id)}
                      okText="Yes, Remove" cancelText="Cancel"
                      placement="top" okButtonProps={{ danger: true }}
                    >
                      <Button danger block size="large" icon={<DeleteOutlined />} style={{ borderRadius: 10, fontWeight: 600 }}>
                        Remove Agent from Agency
                      </Button>
                    </Popconfirm>
                  </div>
                </div>
              </div>
            )}
          </Spin>
        </Modal>

      </div>

      <style>{`
        .ant-table-thead > tr > th {
          background: #f8faff !important;
          font-weight: 700 !important;
          font-size: 12px !important;
          color: #64748b !important;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 2px solid #e2e8f0 !important;
        }
        .agent-row td { transition: background 0.15s; }
        .ant-steps-item-process .ant-steps-item-icon { background: linear-gradient(135deg,${THEME.primary},${THEME.secondary}) !important; border-color: ${THEME.primary} !important; }
        .ant-steps-item-finish .ant-steps-item-icon { border-color: ${THEME.primary} !important; }
        .ant-steps-item-finish .ant-steps-item-icon .ant-steps-icon { color: ${THEME.primary} !important; }

        /* Custom Segmented Theme */
        .custom-segmented-theme {
          background: #f3f4f6;
          padding: 4px;
          border-radius: 10px;
        }

        .custom-segmented-theme .ant-segmented-item-selected {
          background-color: ${THEME.agencyTheme} !important;
          color: #fff !important;
        }

        .custom-segmented-theme .ant-segmented-item-selected:hover {
          background-color: ${THEME.agencyTheme} !important;
        }

        .custom-segmented-theme .ant-segmented-item {
          border-radius: 8px;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default AgencyManageAgents;