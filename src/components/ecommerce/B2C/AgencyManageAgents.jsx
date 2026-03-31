import React, { useState, useEffect } from "react";
import {
  Card, Button, Modal, Form, Input, Tag, Typography, Row, Col, Avatar,
  Upload, Select, InputNumber, Tooltip, Divider, Space, Badge, Statistic,
  Spin, Empty, Table, Steps, Alert, Popconfirm, Drawer, Progress
} from "antd";
import {
  PlusOutlined, DeleteOutlined, UserOutlined, SearchOutlined,
  CheckCircleFilled, IdcardOutlined, FileDoneOutlined,
  EyeOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined,
  TrophyOutlined, CalendarOutlined, UploadOutlined, CloseCircleOutlined,
  FilterOutlined, TeamOutlined, StarFilled, GlobalOutlined,
  SafetyCertificateOutlined, FileTextOutlined, ArrowRightOutlined,
  BankOutlined, CloseOutlined
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import { toast } from "react-toastify";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

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
              <Text style={{ fontSize: 12, color: "#4338ca", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {uploadFiles[type]?.name || label}
              </Text>
              <Button type="text" icon={<DeleteOutlined />} onClick={remove} size="small" danger style={{ flexShrink: 0 }} />
            </div>
          )}
          <Text style={{ fontSize: 11, color: "#10b981", fontWeight: 600 }}>✓ Uploaded</Text>
        </div>
      ) : (
        <Upload showUploadList={false} beforeUpload={handleFile} accept={accept}>
          <Button
            loading={uploading[type]} icon={icon}
            style={{ width: "100%", borderRadius: 10, borderStyle: "dashed", borderColor: "#c7d2fe", color: "#6366f1", background: "linear-gradient(135deg,#fafbff,#f0f4ff)", height: 44, fontWeight: 500 }}
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
        <span style={{ color: "#6366f1", fontSize: 14, flexShrink: 0 }}>{icon}</span>
        <Text style={{ color: "#94a3b8", fontSize: 13 }}>{label}</Text>
      </div>
      <div style={{ textAlign: "right" }}>{value}</div>
    </div>
    {!last && <div style={{ height: 1, background: "linear-gradient(90deg,transparent,#e2e8f0,transparent)" }} />}
  </>
);

/* ─────────────────────────── Stat Pill ─────────────────────────── */
const StatPill = ({ label, value,  }) => (
  <div style={{ textAlign: "center", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", borderRadius: 12, padding: "10px 20px", border: "1px solid rgba(255,255,255,0.25)" }}>
    <div style={{ color: "#fff", fontWeight: 700, fontSize: 18, lineHeight: 1 }}>{value}</div>
    <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, marginTop: 3 }}>{label}</div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════ */
/*                       MAIN COMPONENT                               */
/* ═══════════════════════════════════════════════════════════════════ */
const AgencyManageAgents = () => {
  const { user } = useSelector((s) => s.auth);
  const agencyId = user?._id || user?.id;

  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [form] = Form.useForm();
  const [urls, setUrls] = useState({ profile: "", idProof: "", rera: "" });
  const [uploading, setUploading] = useState({ profile: false, idProof: false, rera: false });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [uploadFiles, setUploadFiles] = useState({ profile: null, idProof: null, rera: null });
  const [currentStep, setCurrentStep] = useState(0);

  /* ── Fetch ── */
  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await apiService.get("/agent/get-all-agents/agency");
      let agentsData = res?.data;
      if (!Array.isArray(agentsData)) return;
      const formatted = agentsData.map((agent) => ({
        key: agent._id, id: agent._id,
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
    } catch { toast.error("Failed to load agents"); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchAgents(); }, []);

  /* ── Filter ── */
  useEffect(() => {
    let f = agents;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      f = f.filter((a) =>
        a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) ||
        a.phone.toLowerCase().includes(q) || a.city?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") f = f.filter((a) => statusFilter === "active" ? a.status : !a.status);
    setFilteredAgents(f);
  }, [searchQuery, statusFilter, agents]);

  /* ── Upload ── */
  const handleInstantUpload = async (file, type) => {
    const allowed = type === "profile" ? ["image/jpeg","image/png","image/jpg"] : ["application/pdf","image/jpeg","image/png","image/jpg"];
    if (!allowed.includes(file.type)) { toast.error("Invalid file type"); return false; }
    const fd = new FormData(); fd.append("file", file);
    setUploading((p) => ({ ...p, [type]: true }));
    try {
      const res = await apiService.upload("upload", fd);
      const url = res?.file?.url || res?.url;
      if (url) { setUrls((p) => ({ ...p, [type]: url })); setUploadFiles((p) => ({ ...p, [type]: file })); toast.success("Uploaded!"); }
    } catch { toast.error("Upload failed"); }
    setUploading((p) => ({ ...p, [type]: false })); return false;
  };
  const removeFile = (type) => { setUrls((p) => ({ ...p, [type]: "" })); setUploadFiles((p) => ({ ...p, [type]: null })); };

  /* ── Add Agent ── */
  const handleAddAgent = async (values) => {
    try {
      await apiService.post("/agent/agent-signup", {
        first_name: values.first_name, last_name: values.last_name,
        email: values.email, password: values.password,
        phone_number: values.phone_number, country_code: values.country_code,
        operating_city: values.operating_city, specialization: values.specialization,
        country: values.country, experience_years: Number(values.experience_years),
        rera_number: values.rera_number, profile_photo: urls.profile,
        id_proof: urls.idProof, rera_certificate: urls.rera, agency_id: agencyId,
      });
      toast.success("Agent created successfully");
      fetchAgents(); closeModal();
    } catch (e) { toast.error(e?.response?.data?.message || "Failed to create agent"); }
  };

  /* ── Delete ── */
  const handleDelete = async (id) => {
    try {
      await apiService.delete(`agent/delete-agent/${id}`);
      toast.success("Agent removed");
      fetchAgents();
      if (drawerOpen) setDrawerOpen(false);
    } catch { toast.error("Failed to remove agent"); }
  };

  const handleViewAgent = (agent) => { setSelectedAgent(agent); setDrawerOpen(true); };
  const closeModal = () => {
    setIsModalOpen(false); form.resetFields();
    setUrls({ profile: "", idProof: "", rera: "" });
    setUploadFiles({ profile: null, idProof: null, rera: null });
    setCurrentStep(0);
  };

  /* ── Stats ── */
  const total = agents.length;
  const active = agents.filter((a) => a.status).length;
  const inactive = agents.filter((a) => !a.status).length;
  const activeRate = total ? Math.round((active / total) * 100) : 0;

  /* ── Columns ── */
  const columns = [
    {
      title: "Agent", dataIndex: "name", key: "name", fixed: "left", width: 260,
      render: (_, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 0" }}>
          <div style={{ position: "relative" }}>
            <Avatar src={r.avatar} icon={<UserOutlined />} size={44}
              style={{ border: "2px solid #e0e7ff", boxShadow: "0 2px 8px rgba(99,102,241,0.2)" }} />
            <span style={{
              position: "absolute", bottom: 0, right: 0, width: 11, height: 11,
              borderRadius: "50%", background: r.status ? "#10b981" : "#f43f5e",
              border: "2px solid #fff"
            }} />
          </div>
          <div>
            <Text strong style={{ color: "#1e293b", fontSize: 14, display: "block" }}>{r.name}</Text>
            <Text style={{ color: "#94a3b8", fontSize: 12 }}>{r.email}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "Phone", key: "phone", width: 155,
      render: (_, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <PhoneOutlined style={{ color: "#6366f1", fontSize: 12 }} />
          <Text style={{ color: "#475569", fontSize: 13 }}>{r.phone || "—"}</Text>
        </div>
      ),
    },
    {
      title: "Location", key: "city", width: 150,
      render: (_, r) => (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <EnvironmentOutlined style={{ color: "#3b82f6", fontSize: 12 }} />
            <Text style={{ color: "#1e293b", fontSize: 13, fontWeight: 500 }}>{r.city || "—"}</Text>
          </div>
          {r.country && <Text style={{ color: "#94a3b8", fontSize: 11, paddingLeft: 17 }}>{r.country}</Text>}
        </div>
      ),
    },
    {
      title: "Specialization", key: "specialization", width: 150,
      render: (_, r) => r.specialization ? (
        <span style={{
          display: "inline-block", padding: "3px 12px", borderRadius: 20,
          background: "linear-gradient(135deg,#ede9fe,#ddd6fe)", color: "#5b21b6",
          fontSize: 12, fontWeight: 600, border: "1px solid #c4b5fd"
        }}>{r.specialization}</span>
      ) : <Text style={{ color: "#cbd5e1" }}>—</Text>,
    },
    {
      title: "Exp.", key: "experience", width: 90, align: "center",
      render: (_, r) => r.experience ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <TrophyOutlined style={{ color: "#f59e0b", fontSize: 13 }} />
          <Text strong style={{ fontSize: 13 }}>{r.experience}y</Text>
        </div>
      ) : <Text style={{ color: "#cbd5e1" }}>—</Text>,
    },
    {
      title: "Role", key: "role", width: 110,
      render: (_, r) => (
        <span style={{
          display: "inline-block", padding: "3px 10px", borderRadius: 20,
          background: "#f0fdf4", color: "#166534", fontSize: 12, fontWeight: 600, border: "1px solid #bbf7d0"
        }}>{r.role}</span>
      ),
    },
    {
      title: "Status", key: "status", width: 100, align: "center",
      render: (_, r) => (
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px",
          borderRadius: 20, fontSize: 12, fontWeight: 600,
          background: r.status ? "#f0fdf4" : "#fff1f2",
          color: r.status ? "#15803d" : "#be123c",
          border: `1px solid ${r.status ? "#bbf7d0" : "#fecdd3"}`
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: r.status ? "#22c55e" : "#f43f5e" }} />
          {r.status ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      title: "Actions", key: "actions", fixed: "right", width: 100, align: "center",
      render: (_, r) => (
        <Space size={4}>
          <Tooltip title="View Details">
            <Button type="text" icon={<EyeOutlined />} onClick={() => handleViewAgent(r)}
              style={{ borderRadius: 8, color: "#6366f1", background: "transparent" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#ede9fe"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            />
          </Tooltip>
          <Popconfirm title="Remove Agent" description="Sure to remove?" onConfirm={() => handleDelete(r.key)} okText="Yes" cancelText="No" placement="topRight">
            <Tooltip title="Remove">
              <Button type="text" danger icon={<DeleteOutlined />}
                style={{ borderRadius: 8, background: "transparent" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#fff1f2"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  /* ════════════════════════════════════════════════════════ */
  return (
    <div style={{ padding: "32px 32px", background: "#f8faff", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1600, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 14px rgba(99,102,241,0.4)"
              }}>
                <TeamOutlined style={{ color: "#fff", fontSize: 20 }} />
              </div>
              <Title level={2} style={{ margin: 0, color: "#1e293b", fontWeight: 700 }}>Team Management</Title>
            </div>
            <Text style={{ color: "#64748b", fontSize: 14 }}>Manage and monitor your agency's real estate agents</Text>
          </div>
          <Button
            type="primary" size="large" icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
            style={{
              borderRadius: 12, paddingInline: 24, height: 46, fontWeight: 600, fontSize: 15,
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              border: "none", boxShadow: "0 4px 14px rgba(99,102,241,0.4)"
            }}
          >
            Add New Agent
          </Button>
        </div>

        {/* ── Stats ── */}
        <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
          {[
            { label: "Total Agents", value: total, icon: <TeamOutlined />, grad: "linear-gradient(135deg,#6366f1,#8b5cf6)", shadow: "rgba(99,102,241,0.35)" },
            { label: "Active Agents", value: active, icon: <CheckCircleFilled />, grad: "linear-gradient(135deg,#10b981,#059669)", shadow: "rgba(16,185,129,0.35)" },
            { label: "Inactive Agents", value: inactive, icon: <UserOutlined />, grad: "linear-gradient(135deg,#f43f5e,#e11d48)", shadow: "rgba(244,63,94,0.35)" },
            { label: "Activity Rate", value: `${activeRate}%`, icon: <StarFilled />, grad: "linear-gradient(135deg,#f59e0b,#d97706)", shadow: "rgba(245,158,11,0.35)" },
          ].map((s, i) => (
            <Col xs={12} sm={12} lg={6} key={i}>
              <div style={{
                background: "#fff", borderRadius: 16, padding: "20px 22px",
                border: "1px solid #e2e8f0", boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                display: "flex", alignItems: "center", gap: 16,
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${s.shadow}`; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)"; }}
              >
                <div style={{
                  width: 50, height: 50, borderRadius: 14, background: s.grad,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 4px 12px ${s.shadow}`, flexShrink: 0
                }}>
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

        {/* ── Filters ── */}
        <div style={{
          background: "#fff", borderRadius: 14, padding: "16px 20px",
          border: "1px solid #e2e8f0", marginBottom: 20,
          display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center"
        }}>
          <Input
            size="large" placeholder="Search name, email, phone, city…"
            prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
            style={{ flex: 1, minWidth: 220, borderRadius: 10, borderColor: "#e2e8f0" }}
          />
          <Select
            size="large" value={statusFilter} onChange={setStatusFilter}
            style={{ width: 180, borderRadius: 10 }}
            options={[{ label: "All Agents", value: "all" }, { label: "Active Only", value: "active" }, { label: "Inactive Only", value: "inactive" }]}
          />
          <div style={{ color: "#94a3b8", fontSize: 13 }}>{filteredAgents.length} agent{filteredAgents.length !== 1 ? "s" : ""}</div>
        </div>

        {/* ── Table ── */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          {loading ? (
            <div style={{ padding: 64, textAlign: "center" }}><Spin size="large" /></div>
          ) : filteredAgents.length === 0 ? (
            <Empty description={<><Text style={{ color: "#94a3b8" }}>No agents found</Text><br /><Button type="primary" onClick={() => setIsModalOpen(true)} icon={<PlusOutlined />} style={{ marginTop: 12, borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none" }}>Add first agent</Button></>} style={{ padding: 64 }} />
          ) : (
            <Table
              columns={columns} dataSource={filteredAgents}
              scroll={{ x: "max-content" }}
              pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `Total ${t} agents`, position: ["bottomCenter"] }}
              rowClassName="agent-row"
              onRow={() => ({
                style: { cursor: "pointer" },
                onMouseEnter: (e) => e.currentTarget.style.background = "#fafbff",
                onMouseLeave: (e) => e.currentTarget.style.background = "",
              })}
            />
          )}
        </div>

        {/* ════════════ ADD AGENT MODAL ════════════ */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <UserOutlined style={{ color: "#fff", fontSize: 16 }} />
              </div>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#1e293b" }}>Register New Agent</span>
            </div>
          }
          open={isModalOpen} onCancel={closeModal} footer={null}
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
                <Alert message="Personal Information" description="Provide the agent's basic contact details." type="info" showIcon className="mb-6" style={{ borderRadius: 10, marginBottom: 20 }} />
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
                        <div style={{ fontSize: 28, color: "#6366f1", marginBottom: 10 }}>{f.icon}</div>
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
                <Button size="large" onClick={closeModal} style={{ borderRadius: 10, paddingInline: 20 }}>Cancel</Button>
                {currentStep < 2 ? (
                  <Button size="large" type="primary" onClick={() => setCurrentStep(currentStep + 1)}
                    style={{ borderRadius: 10, paddingInline: 28, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", fontWeight: 600 }}>
                    Next <ArrowRightOutlined />
                  </Button>
                ) : (
                  <Button size="large" type="primary" htmlType="submit"
                    style={{ borderRadius: 10, paddingInline: 28, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", fontWeight: 600 }}>
                    Create Agent
                  </Button>
                )}
              </div>
            </div>
          </Form>
        </Modal>

        {/* ════════════ AGENT DETAIL DRAWER ════════════ */}
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          placement="right"
          width={420}
          closable={false}
          destroyOnClose
          styles={{ body: { padding: 0, background: "#f8faff" }, wrapper: { boxShadow: "-8px 0 40px rgba(99,102,241,0.12)" } }}
        >
          {selectedAgent && (
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

              {/* ── Hero Banner ── */}
              <div style={{
                background: "linear-gradient(145deg,#4f46e5 0%,#7c3aed 60%,#9333ea 100%)",
                padding: "32px 24px 28px",
                position: "relative",
                overflow: "hidden"
              }}>
                {/* Decorative circles */}
                <div style={{ position: "absolute", top: -30, right: -30, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
                <div style={{ position: "absolute", bottom: -20, left: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

                {/* Close btn */}
                <button
                  onClick={() => setDrawerOpen(false)}
                  style={{
                    position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.2)",
                    border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16
                  }}
                >
                  <CloseOutlined />
                </button>

                {/* Avatar */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                  <div style={{ position: "relative", marginBottom: 14 }}>
                    <Avatar
                      src={selectedAgent.avatar} icon={<UserOutlined />} size={86}
                      style={{ border: "4px solid rgba(255,255,255,0.85)", boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}
                    />
                    <span style={{
                      position: "absolute", bottom: 4, right: 4, width: 16, height: 16,
                      borderRadius: "50%", background: selectedAgent.status ? "#10b981" : "#f43f5e",
                      border: "2px solid #fff", boxShadow: "0 0 0 2px rgba(255,255,255,0.4)"
                    }} />
                  </div>
                  <Text style={{ color: "#fff", fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{selectedAgent.name}</Text>
                  <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap", justifyContent: "center" }}>
                    <span style={{ background: "rgba(255,255,255,0.2)", color: "#fff", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 600, border: "1px solid rgba(255,255,255,0.3)" }}>
                      {selectedAgent.role}
                    </span>
                    {selectedAgent.specialization && (
                      <span style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.9)", borderRadius: 20, padding: "3px 12px", fontSize: 12, border: "1px solid rgba(255,255,255,0.2)" }}>
                        {selectedAgent.specialization}
                      </span>
                    )}
                  </div>
                  {/* Mini stats */}
                  <div style={{ display: "flex", gap: 12, marginTop: 20, width: "100%" }}>
                    <StatPill label="Experience" value={selectedAgent.experience ? `${selectedAgent.experience}y` : "—"} />
                    <StatPill label="Status" value={selectedAgent.status ? "Active" : "Inactive"} />
                  </div>
                </div>
              </div>

              {/* ── Scrollable Body ── */}
              <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 24px" }}>

                {/* Contact Card */}
                <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: "16px 18px", marginBottom: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#ede9fe,#ddd6fe)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <MailOutlined style={{ color: "#6366f1", fontSize: 13 }} />
                    </div>
                    <Text style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>Contact Information</Text>
                  </div>
                  <InfoRow icon={<MailOutlined />} label="Email"
                    value={<Text style={{ fontSize: 13, color: "#1e293b", fontWeight: 500, wordBreak: "break-all" }}>{selectedAgent.email}</Text>} />
                  <InfoRow icon={<PhoneOutlined />} label="Phone"
                    value={<Text style={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}>{selectedAgent.phone || "—"}</Text>} last />
                </div>

                {/* Location Card */}
                <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: "16px 18px", marginBottom: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#dbeafe,#bfdbfe)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <EnvironmentOutlined style={{ color: "#3b82f6", fontSize: 13 }} />
                    </div>
                    <Text style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>Location</Text>
                  </div>
                  <InfoRow icon={<EnvironmentOutlined />} label="City"
                    value={<Text style={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}>{selectedAgent.city || "—"}</Text>} />
                  <InfoRow icon={<GlobalOutlined />} label="Country"
                    value={<Text style={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}>{selectedAgent.country || "—"}</Text>} last />
                </div>

                {/* Professional Card */}
                <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: "16px 18px", marginBottom: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#fef3c7,#fde68a)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <TrophyOutlined style={{ color: "#d97706", fontSize: 13 }} />
                    </div>
                    <Text style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>Professional Details</Text>
                  </div>
                  <InfoRow icon={<SafetyCertificateOutlined />} label="RERA No."
                    value={<Text style={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}>{selectedAgent.reraNumber || "—"}</Text>} />
                  <InfoRow icon={<TrophyOutlined />} label="Specialization"
                    value={selectedAgent.specialization
                      ? <span style={{ background: "#ede9fe", color: "#5b21b6", borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>{selectedAgent.specialization}</span>
                      : <Text style={{ color: "#94a3b8" }}>—</Text>} />
                  <InfoRow icon={<CalendarOutlined />} label="Experience"
                    value={<Text style={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}>{selectedAgent.experience ? `${selectedAgent.experience} years` : "—"}</Text>} />
                  <InfoRow icon={<BankOutlined />} label="Role"
                    value={<span style={{ background: "#f0fdf4", color: "#166534", borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>{selectedAgent.role}</span>} />
                  <InfoRow icon={<CheckCircleFilled />} label="Status"
                    value={
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px",
                        borderRadius: 20, fontSize: 12, fontWeight: 600,
                        background: selectedAgent.status ? "#f0fdf4" : "#fff1f2",
                        color: selectedAgent.status ? "#15803d" : "#be123c",
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: selectedAgent.status ? "#22c55e" : "#f43f5e" }} />
                        {selectedAgent.status ? "Active" : "Inactive"}
                      </span>
                    } last />
                </div>

                {/* Documents Card */}
                {(selectedAgent.idProof || selectedAgent.reraCertificate) && (
                  <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: "16px 18px", marginBottom: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#dcfce7,#bbf7d0)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <FileTextOutlined style={{ color: "#16a34a", fontSize: 13 }} />
                      </div>
                      <Text style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>Documents</Text>
                    </div>
                    {[
                      { label: "ID Proof", url: selectedAgent.idProof },
                      { label: "RERA Certificate", url: selectedAgent.reraCertificate },
                    ].filter((d) => d.url).map((doc, i, arr) => (
                      <div key={doc.label}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <SafetyCertificateOutlined style={{ color: "#6366f1", fontSize: 14 }} />
                            <Text style={{ color: "#64748b", fontSize: 13 }}>{doc.label}</Text>
                          </div>
                          <a href={doc.url} target="_blank" rel="noreferrer"
                            style={{ color: "#6366f1", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
                            View ↗
                          </a>
                        </div>
                        {i < arr.length - 1 && <div style={{ height: 1, background: "#f1f5f9" }} />}
                      </div>
                    ))}
                  </div>
                )}

                {/* Remove Button */}
                <Popconfirm
                  title="Remove Agent"
                  description="Are you sure you want to remove this agent from your team?"
                  onConfirm={() => handleDelete(selectedAgent.id)}
                  okText="Yes, Remove" cancelText="Cancel"
                  placement="top" okButtonProps={{ danger: true }}
                >
                  <button style={{
                    width: "100%", padding: "13px", borderRadius: 12, marginTop: 4,
                    background: "linear-gradient(135deg,#fff1f2,#ffe4e6)",
                    border: "1px solid #fecdd3", color: "#be123c",
                    fontWeight: 600, fontSize: 14, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    transition: "all 0.2s"
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "linear-gradient(135deg,#ffe4e6,#fecdd3)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(244,63,94,0.2)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "linear-gradient(135deg,#fff1f2,#ffe4e6)"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <DeleteOutlined /> Remove Agent
                  </button>
                </Popconfirm>

              </div>
            </div>
          )}
        </Drawer>

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
        .ant-pagination { padding: 16px 0 !important; }
        .ant-steps-item-process .ant-steps-item-icon { background: linear-gradient(135deg,#6366f1,#8b5cf6) !important; border-color: #6366f1 !important; }
        .ant-steps-item-finish .ant-steps-item-icon { border-color: #6366f1 !important; }
        .ant-steps-item-finish .ant-steps-item-icon .ant-steps-icon { color: #6366f1 !important; }
        .ant-drawer-content { border-radius: 0; }
      `}</style>
    </div>
  );
};

export default AgencyManageAgents;