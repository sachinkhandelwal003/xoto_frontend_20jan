import React, { useState, useEffect, useCallback } from "react";
import {
  Button, Modal, Form, Input, Tag, Typography, Row, Col,
  Upload, Select, InputNumber, Tooltip, Space, Badge,
  Spin, Empty, Steps, Alert, Popconfirm,
} from "antd";
import {
  PlusOutlined, DeleteOutlined, UserOutlined, SearchOutlined,
  CheckCircleFilled, FileDoneOutlined,
  EyeOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined,
  TrophyOutlined, UploadOutlined, CloseCircleOutlined,
  TeamOutlined, ArrowLeftOutlined, ArrowRightOutlined, CheckOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import { toast } from "react-toastify";

const { Text } = Typography;
const { Option } = Select;

const AVATAR_COLORS = [
  "#4F46E5","#0891B2","#059669","#D97706","#DC2626",
  "#7C3AED","#DB2777","#EA580C","#65A30D","#0284C7",
];
const SPECIALIZATIONS = ["Luxury","Residential","Commercial","Off-Plan","Rental","Investment"];
const COUNTRY_CODES = [
  { code:"+971", label:"AE +971" },
  { code:"+91",  label:"IN +91" },
  { code:"+1",   label:"US +1" },
  { code:"+44",  label:"GB +44" },
  { code:"+966", label:"SA +966" },
  { code:"+974", label:"QA +974" },
];
const STORAGE_KEY = "rm_agency_agents_v2";

const getInitials = (name="") =>
  name.split(" ").map(w=>w[0]||"").join("").toUpperCase().slice(0,2);

const getAvatarColor = (name="") => {
  const h = name.split("").reduce((a,c)=>a+c.charCodeAt(0),0);
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
};

const loadFromStorage = () => {
  try { const r=localStorage.getItem(STORAGE_KEY); return r?JSON.parse(r):[]; }
  catch { return []; }
};
const saveToStorage = (data) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
};

/* ── AgentAvatar ── */
const AgentAvatar = ({ name="", src, size=40, showDot=false, active=true }) => (
  <div style={{ position:"relative", display:"inline-block", flexShrink:0 }}>
    {src
      ? <img src={src} alt={name} style={{ width:size, height:size, borderRadius:"50%", objectFit:"cover", border:"2px solid #fff", boxShadow:"0 1px 4px rgba(0,0,0,.12)" }} />
      : <div style={{ width:size, height:size, borderRadius:"50%", background:getAvatarColor(name), color:"#fff", fontWeight:600, fontSize:size*0.35, display:"flex", alignItems:"center", justifyContent:"center", border:"2px solid #fff", boxShadow:"0 1px 4px rgba(0,0,0,.12)", letterSpacing:"-.5px" }}>
          {getInitials(name)}
        </div>
    }
    {showDot && (
      <span style={{ position:"absolute", bottom:0, right:0, width:10, height:10, borderRadius:"50%", border:"2px solid #fff", background:active?"#16A34A":"#9CA3AF" }}/>
    )}
  </div>
);

/* ── StatCard ── */
const StatCard = ({ title, value, icon, accent, bg }) => (
  <div
    style={{ background:"#fff", border:"1px solid #E5E7EB", borderRadius:14, padding:"18px 20px", display:"flex", alignItems:"center", gap:16, boxShadow:"0 1px 3px rgba(0,0,0,.06)", transition:"box-shadow .2s", cursor:"default" }}
    onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 12px rgba(0,0,0,.1)"}
    onMouseLeave={e=>e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,.06)"}
  >
    <div style={{ width:46, height:46, borderRadius:12, background:bg, color:accent, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{icon}</div>
    <div>
      <div style={{ fontSize:12, color:"#6B7280", fontWeight:500, marginBottom:4 }}>{title}</div>
      <div style={{ fontSize:28, fontWeight:700, color:"#111827", lineHeight:1 }}>{value}</div>
    </div>
  </div>
);

/* ── UploadField ── */
const UploadField = ({ type, label, accept, fileObj, uploading, onUpload, onRemove }) => {
  const handleFile = (file) => { onUpload(file,type); return false; };
  return (
    <div>
      <div style={{ fontSize:12, fontWeight:500, color:"#374151", marginBottom:6 }}>{label}</div>
      {fileObj ? (
        <div style={{ border:"1px solid #BBF7D0", borderRadius:10, padding:"10px 14px", background:"#F0FDF4", display:"flex", alignItems:"center", gap:10 }}>
          <CheckOutlined style={{ color:"#16A34A", fontSize:14 }}/>
          <span style={{ flex:1, fontSize:12, color:"#15803D", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{fileObj.name||label}</span>
          <button onClick={()=>onRemove(type)} style={{ border:"none", background:"none", cursor:"pointer", color:"#9CA3AF", fontSize:18, lineHeight:1, padding:"0 2px" }}>x</button>
        </div>
      ) : (
        <Upload showUploadList={false} beforeUpload={handleFile} accept={accept}>
          <div
            style={{ border:"1.5px dashed #D1D5DB", borderRadius:10, padding:"20px 16px", textAlign:"center", cursor:"pointer", background:"#F9FAFB", transition:"all .15s" }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor="#2563EB"; e.currentTarget.style.background="#EFF6FF"; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor="#D1D5DB"; e.currentTarget.style.background="#F9FAFB"; }}
          >
            {uploading ? <Spin size="small"/> : (
              <>
                <UploadOutlined style={{ fontSize:20, color:"#9CA3AF", display:"block", marginBottom:8 }}/>
                <div style={{ fontSize:12, fontWeight:500, color:"#374151" }}>Click to upload</div>
                <div style={{ fontSize:11, color:"#9CA3AF", marginTop:2 }}>{type==="profile"?"PNG, JPG up to 2MB":"PDF or image"}</div>
              </>
            )}
          </div>
        </Upload>
      )}
    </div>
  );
};

/* ── AgentRow ── */
const AgentRow = ({ agent, onView, onDelete, delay=0 }) => (
  <div
    style={{ display:"grid", gridTemplateColumns:"2.2fr 1.5fr 1.2fr 1.1fr .9fr .9fr 100px", padding:"14px 20px", borderBottom:"1px solid #F3F4F6", alignItems:"center", transition:"background .15s", animation:`rowFadeIn .25s ease ${delay}s both` }}
    onMouseEnter={e=>e.currentTarget.style.background="#F9FAFB"}
    onMouseLeave={e=>e.currentTarget.style.background="transparent"}
  >
    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
      <AgentAvatar name={agent.name} src={agent.avatar} size={40} showDot active={agent.status}/>
      <div>
        <div style={{ fontSize:13, fontWeight:600, color:"#111827", maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{agent.name}</div>
        <div style={{ fontSize:11, color:"#9CA3AF", marginTop:1, display:"flex", alignItems:"center", gap:4 }}>
          <MailOutlined style={{ fontSize:10 }}/>
          <span style={{ maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{agent.email}</span>
        </div>
      </div>
    </div>
    <div style={{ fontSize:13, color:"#374151", display:"flex", alignItems:"center", gap:6 }}>
      <PhoneOutlined style={{ color:"#2563EB", fontSize:12 }}/>
      <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{agent.phone||"--"}</span>
    </div>
    <div style={{ fontSize:13, color:"#374151" }}>
      <div style={{ display:"flex", alignItems:"center", gap:4 }}>
        <EnvironmentOutlined style={{ color:"#0891B2", fontSize:11 }}/>
        <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{agent.city||"--"}</span>
      </div>
      {agent.country&&<div style={{ fontSize:11, color:"#9CA3AF", marginTop:1 }}>{agent.country}</div>}
    </div>
    <div>
      {agent.specialization
        ? <Tag color="blue" style={{ borderRadius:20, border:"none", fontWeight:500, fontSize:11 }}>{agent.specialization}</Tag>
        : <span style={{ color:"#D1D5DB", fontSize:13 }}>--</span>}
    </div>
    <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:13, color:"#374151" }}>
      {agent.experience
        ? <><TrophyOutlined style={{ color:"#D97706" }}/><span style={{ fontWeight:600 }}>{agent.experience}yr</span></>
        : <span style={{ color:"#D1D5DB" }}>--</span>}
    </div>
    <div>
      <Badge status={agent.status?"success":"default"} text={<span style={{ fontSize:12, fontWeight:500 }}>{agent.status?"Active":"Inactive"}</span>}/>
    </div>
    <div style={{ display:"flex", gap:5, justifyContent:"flex-end" }}>
      <Tooltip title="View Details">
        <Button type="text" size="small" icon={<EyeOutlined/>} onClick={()=>onView(agent)} style={{ width:30, height:30, borderRadius:8, border:"1px solid #E5E7EB", color:"#6B7280" }}/>
      </Tooltip>
      <Popconfirm title="Remove Agent" description="Remove this agent from your team?" onConfirm={()=>onDelete(agent.id)} okText="Remove" okType="danger" cancelText="Cancel" placement="topRight">
        <Tooltip title="Remove">
          <Button type="text" danger size="small" icon={<DeleteOutlined/>} style={{ width:30, height:30, borderRadius:8, border:"1px solid #FCA5A5" }}/>
        </Tooltip>
      </Popconfirm>
    </div>
  </div>
);

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
const AgencyManageAgents = () => {
  const { user } = useSelector((s)=>s.auth);
  const agencyId = user?._id || user?.id;

  const [agents, setAgents]             = useState([]);
  const [loading, setLoading]           = useState(false);
  const [searchQuery, setSearchQuery]   = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [currentStep, setCurrentStep]   = useState(0);
  const [form] = Form.useForm();

  const [urls, setUrls]               = useState({ profile:"", idProof:"", rera:"" });
  const [uploadFiles, setUploadFiles] = useState({ profile:null, idProof:null, rera:null });
  const [uploading, setUploading]     = useState({ profile:false, idProof:false, rera:false });

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);

  /* ── Fetch agents from API, fallback to localStorage ── */
  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.get("/agent/get-all-agents/agency");
      const data = res?.data;
      if (!Array.isArray(data)) { setAgents(loadFromStorage()); return; }
      const formatted = data.map(a=>({
        id:             a._id,
        name:           `${a.first_name||""} ${a.last_name||""}`.trim(),
        email:          a.email||"",
        phone:          `${a.country_code||""} ${a.phone_number||""}`.trim(),
        role:           a.role||"Agent",
        status:         a.status??true,
        avatar:         a.profile_photo||null,
        city:           a.operating_city||"",
        country:        a.country||"",
        specialization: a.specialization||"",
        experience:     a.experience_years||null,
        reraNumber:     a.rera_number||"",
        idProof:        a.id_proof||null,
        reraCertificate:a.rera_certificate||null,
      }));
      setAgents(formatted);
      saveToStorage(formatted);
    } catch {
      setAgents(loadFromStorage());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(()=>{ fetchAgents(); },[fetchAgents]);

  /* ── Filter ── */
  const filteredAgents = agents.filter(a=>{
    const q = searchQuery.toLowerCase();
    const ms = !q||(a.name||"").toLowerCase().includes(q)||(a.email||"").toLowerCase().includes(q)||(a.phone||"").toLowerCase().includes(q)||(a.city||"").toLowerCase().includes(q);
    const mf = statusFilter==="all"||(statusFilter==="active"&&a.status)||(statusFilter==="inactive"&&!a.status);
    return ms&&mf;
  });

  /* ── File Upload ── */
  const handleUpload = async (file, type) => {
    const allowed = type==="profile"
      ?["image/jpeg","image/png","image/jpg","image/webp"]
      :["application/pdf","image/jpeg","image/png","image/jpg"];
    if (!allowed.includes(file.type)) { toast.error("Invalid file type"); return false; }
    setUploading(p=>({...p,[type]:true}));
    try {
      const fd = new FormData();
      fd.append("file",file);
      const res = await apiService.upload("upload",fd);
      const uploadedUrl = res?.file?.url||res?.url;
      if (uploadedUrl) {
        setUrls(p=>({...p,[type]:uploadedUrl}));
        setUploadFiles(p=>({...p,[type]:file}));
        toast.success(`${type==="profile"?"Photo":type.toUpperCase()} uploaded`);
      }
    } catch {
      setUrls(p=>({...p,[type]:URL.createObjectURL(file)}));
      setUploadFiles(p=>({...p,[type]:file}));
    }
    setUploading(p=>({...p,[type]:false}));
    return false;
  };

  const removeFile = (type) => {
    setUrls(p=>({...p,[type]:""}));
    setUploadFiles(p=>({...p,[type]:null}));
  };

  /* ── Reset ── */
  const resetModal = () => {
    form.resetFields();
    setUrls({ profile:"", idProof:"", rera:"" });
    setUploadFiles({ profile:null, idProof:null, rera:null });
    setCurrentStep(0);
  };
  const closeAddModal = () => { setAddModalOpen(false); resetModal(); };

  /* ── Step validation ── */
  const STEP0_FIELDS = ["first_name","last_name","email","password","phone_number"];
  const STEP1_FIELDS = ["operating_city"];

  const handleNext = async () => {
    try {
      if (currentStep===0) await form.validateFields(STEP0_FIELDS);
      if (currentStep===1) await form.validateFields(STEP1_FIELDS);
      setCurrentStep(s=>s+1);
    } catch {
      // Ant Design shows inline errors automatically
    }
  };

  /* ── Submit
       THE KEY FIX:
       - All 3 step panels stay in the DOM (hidden with display:none, not unmounted)
       - Form has preserve={true} so field values are never discarded
       - form.getFieldsValue(true) reads all registered fields regardless of visibility
       This ensures first_name, last_name, email, password, phone_number are
       always available when Create Agent is clicked on Step 3.
  ── */
  const handleAddAgent = async () => {
    try {
      await form.validateFields([...STEP0_FIELDS, ...STEP1_FIELDS]);
    } catch {
      toast.error("Please complete all required fields");
      return;
    }

    // Read ALL form values — works because fields stay mounted via display:none
    const v = form.getFieldsValue(true);

    const payload = {
      first_name:       (v.first_name||"").trim(),
      last_name:        (v.last_name||"").trim(),
      email:            (v.email||"").trim(),
      password:         v.password||"",
      phone_number:     (v.phone_number||"").trim(),
      country_code:     v.country_code||"+971",
      operating_city:   (v.operating_city||"").trim(),
      specialization:   v.specialization||"",
      country:          (v.country||"UAE").trim(),
      experience_years: Number(v.experience_years)||0,
      rera_number:      (v.rera_number||"").trim(),
      profile_photo:    urls.profile||null,
      id_proof:         urls.idProof||null,
      rera_certificate: urls.rera||null,
      agency_id:        agencyId,
    };

    const localAgent = {
      id:             Date.now().toString(),
      name:           `${payload.first_name} ${payload.last_name}`,
      email:          payload.email,
      phone:          `${payload.country_code} ${payload.phone_number}`,
      city:           payload.operating_city,
      country:        payload.country,
      specialization: payload.specialization,
      experience:     payload.experience_years||null,
      reraNumber:     payload.rera_number,
      status:         true,
      avatar:         urls.profile||null,
      idProof:        urls.idProof||null,
      reraCertificate:urls.rera||null,
      role:           "Agent",
    };

    try {
      await apiService.post("/agent/agent-signup", payload);
      toast.success("Agent created successfully!");
    } catch (err) {
      const msg = err?.response?.data?.message||"";
      toast.error(msg||"API error — saved locally");
    }

    const updated = [...agents, localAgent];
    setAgents(updated);
    saveToStorage(updated);
    closeAddModal();
  };

  /* ── Delete ── */
  const handleDelete = async (id) => {
    try { await apiService.delete(`agent/delete-agent/${id}`); } catch {}
    const updated = agents.filter(a=>a.id!==id);
    setAgents(updated);
    saveToStorage(updated);
    toast.success("Agent removed");
  };

  const total    = agents.length;
  const active   = agents.filter(a=>a.status).length;
  const inactive = total - active;

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div style={{ padding:"28px 24px", background:"linear-gradient(135deg,#F8FAFD 0%,#EFF6FF 100%)", minHeight:"100vh", fontFamily:"'DM Sans',-apple-system,sans-serif" }}>
      <style>{`
        @keyframes rowFadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        .flt-btn{padding:6px 16px;border:1px solid #E5E7EB;border-radius:8px;background:#fff;font-size:12px;font-weight:500;color:#6B7280;cursor:pointer;transition:all .15s}
        .flt-btn.flt-active{background:#2563EB;color:#fff;border-color:#2563EB}
        .flt-btn:hover:not(.flt-active){border-color:#2563EB;color:#2563EB}
        .drow{display:flex;justify-content:space-between;align-items:center;padding:11px 0;border-bottom:1px solid #F3F4F6;font-size:13px}
        .drow:last-child{border-bottom:none}
      `}</style>

      <div style={{ maxWidth:1300, margin:"0 auto" }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28, gap:12, flexWrap:"wrap", animation:"fadeUp .3s ease" }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:"#EFF6FF", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <TeamOutlined style={{ color:"#2563EB", fontSize:18 }}/>
              </div>
              <h1 style={{ fontSize:24, fontWeight:700, color:"#111827", margin:0, letterSpacing:"-.4px" }}>Team Management</h1>
            </div>
            <p style={{ fontSize:13, color:"#6B7280", margin:0, marginLeft:46 }}>Manage and monitor your agency's real estate agents</p>
          </div>
          <Button
            type="primary" icon={<PlusOutlined/>} size="large"
            onClick={()=>setAddModalOpen(true)}
            style={{ borderRadius:10, paddingInline:22, fontWeight:600, background:"linear-gradient(135deg,#2563EB,#1D4ED8)", border:"none", boxShadow:"0 4px 14px rgba(37,99,235,.35)", height:42, fontSize:14 }}
          >
            Add New Agent
          </Button>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:22, animation:"fadeUp .35s ease" }}>
          <StatCard title="Total Agents" value={total}    accent="#2563EB" bg="#EFF6FF" icon={<TeamOutlined/>}/>
          <StatCard title="Active"        value={active}   accent="#16A34A" bg="#F0FDF4" icon={<CheckCircleFilled/>}/>
          <StatCard title="Inactive"      value={inactive} accent="#DC2626" bg="#FEF2F2" icon={<UserOutlined/>}/>
        </div>

        {/* Filters */}
        <div style={{ background:"#fff", border:"1px solid #E5E7EB", borderRadius:12, padding:"14px 18px", marginBottom:16, display:"flex", gap:12, flexWrap:"wrap", alignItems:"center", boxShadow:"0 1px 3px rgba(0,0,0,.05)", animation:"fadeUp .4s ease" }}>
          <Input
            size="large" allowClear
            placeholder="Search by name, email, phone, city..."
            prefix={<SearchOutlined style={{ color:"#9CA3AF" }}/>}
            value={searchQuery}
            onChange={e=>setSearchQuery(e.target.value)}
            style={{ flex:1, minWidth:220, borderRadius:9, borderColor:"#E5E7EB", fontSize:13 }}
          />
          <div style={{ display:"flex", gap:5, background:"#F9FAFB", border:"1px solid #E5E7EB", borderRadius:9, padding:4 }}>
            {["all","active","inactive"].map(f=>(
              <button key={f} className={`flt-btn${statusFilter===f?" flt-active":""}`} onClick={()=>setStatusFilter(f)}>
                {f==="all"?"All":f.charAt(0).toUpperCase()+f.slice(1)}
              </button>
            ))}
          </div>
          <Text style={{ fontSize:12, color:"#9CA3AF", whiteSpace:"nowrap" }}>
            {filteredAgents.length} of {agents.length} agents
          </Text>
        </div>

        {/* Table */}
        <div style={{ background:"#fff", border:"1px solid #E5E7EB", borderRadius:14, boxShadow:"0 1px 6px rgba(0,0,0,.06)", overflow:"hidden", animation:"fadeUp .45s ease" }}>
          <div style={{ display:"grid", gridTemplateColumns:"2.2fr 1.5fr 1.2fr 1.1fr .9fr .9fr 100px", padding:"11px 20px", background:"#F9FAFB", borderBottom:"1px solid #E5E7EB" }}>
            {["Agent","Contact","City","Specialization","Exp.","Status","Actions"].map(h=>(
              <div key={h} style={{ fontSize:11, fontWeight:600, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:".6px" }}>{h}</div>
            ))}
          </div>
          {loading
            ? <div style={{ padding:60, textAlign:"center" }}><Spin size="large" tip="Loading team..."/></div>
            : filteredAgents.length===0
              ? <Empty
                  description={<div style={{ color:"#6B7280" }}><p style={{ marginBottom:8 }}>No agents found</p><Button type="primary" icon={<PlusOutlined/>} onClick={()=>setAddModalOpen(true)} style={{ borderRadius:8, background:"#2563EB", border:"none" }}>Add first agent</Button></div>}
                  style={{ padding:"60px 20px" }}
                />
              : filteredAgents.map((agent,i)=>(
                  <AgentRow key={agent.id} agent={agent} delay={i*0.04}
                    onView={a=>{ setSelectedAgent(a); setViewModalOpen(true); }}
                    onDelete={handleDelete}
                  />
                ))
          }
        </div>
      </div>

      {/* ====================================================
          ADD AGENT MODAL
          All 3 step panels stay mounted. CSS display:none
          hides them. Form preserve={true} keeps all values.
          form.getFieldsValue(true) on submit reads everything.
          ==================================================== */}
      <Modal
        open={addModalOpen} onCancel={closeAddModal}
        width={760} centered footer={null} destroyOnClose={false}
        styles={{ content:{ borderRadius:18, padding:0, overflow:"hidden" } }}
      >
        {/* Header */}
        <div style={{ padding:"22px 28px 18px", borderBottom:"1px solid #F3F4F6" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:"#EFF6FF", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <UserOutlined style={{ color:"#2563EB", fontSize:17 }}/>
            </div>
            <div>
              <div style={{ fontSize:18, fontWeight:700, color:"#111827", letterSpacing:"-.3px" }}>Register New Agent</div>
              <div style={{ fontSize:12, color:"#9CA3AF", marginTop:2 }}>Step {currentStep+1} of 3</div>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div style={{ padding:"18px 28px 0" }}>
          <Steps
            current={currentStep}
            items={[
              { title:"Personal Info",  icon:<UserOutlined/> },
              { title:"Professional",   icon:<TrophyOutlined/> },
              { title:"Documents",      icon:<FileDoneOutlined/> },
            ]}
            style={{ marginBottom:24 }}
          />
        </div>

        {/* Form — preserve keeps all field values when display:none hides steps */}
        <Form form={form} layout="vertical" preserve style={{ padding:"0 28px 8px" }}>

          {/* STEP 0: Personal Info — always in DOM */}
          <div style={{ display:currentStep===0?"block":"none" }}>
            <Alert message="Personal Information" description="Basic details for the agent's account." type="info" showIcon style={{ borderRadius:10, marginBottom:20, border:"none", background:"#EFF6FF" }}/>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="first_name" label="First Name" rules={[{required:true,message:"First name is required"}]}>
                  <Input size="large" placeholder="e.g. Sarah" style={{ borderRadius:9 }}/>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="last_name" label="Last Name" rules={[{required:true,message:"Last name is required"}]}>
                  <Input size="large" placeholder="e.g. Ahmed" style={{ borderRadius:9 }}/>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="email" label="Email Address" rules={[{required:true,type:"email",message:"Valid email required"}]}>
                  <Input size="large" placeholder="agent@realestate.com" prefix={<MailOutlined style={{ color:"#9CA3AF" }}/>} style={{ borderRadius:9 }}/>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="password" label="Temporary Password" rules={[{required:true,min:6,message:"Min 6 characters"}]}>
                  <Input.Password size="large" placeholder="Create a password" style={{ borderRadius:9 }}/>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="country_code" label="Country Code" initialValue="+971">
                  <Select size="large" style={{ width:"100%" }}>
                    {COUNTRY_CODES.map(c=><Option key={c.code} value={c.code}>{c.label}</Option>)}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={16}>
                <Form.Item name="phone_number" label="Phone Number" rules={[{required:true,message:"Phone number is required"}]}>
                  <Input size="large" placeholder="50 123 4567" prefix={<PhoneOutlined style={{ color:"#9CA3AF" }}/>} style={{ borderRadius:9 }}/>
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* STEP 1: Professional — always in DOM */}
          <div style={{ display:currentStep===1?"block":"none" }}>
            <Alert message="Professional Details" description="Expertise, location and qualifications." type="info" showIcon style={{ borderRadius:10, marginBottom:20, border:"none", background:"#EFF6FF" }}/>
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item name="country" label="Country" initialValue="UAE">
                  <Input size="large" placeholder="e.g. UAE" prefix={<EnvironmentOutlined style={{ color:"#9CA3AF" }}/>} style={{ borderRadius:9 }}/>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="operating_city" label="Operating City" rules={[{required:true,message:"City is required"}]}>
                  <Input size="large" placeholder="e.g. Dubai" prefix={<EnvironmentOutlined style={{ color:"#9CA3AF" }}/>} style={{ borderRadius:9 }}/>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="experience_years" label="Experience (Years)">
                  <InputNumber size="large" min={0} max={50} placeholder="0" style={{ width:"100%", borderRadius:9 }}/>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="specialization" label="Specialization">
                  <Select size="large" placeholder="Select..." allowClear style={{ width:"100%" }}>
                    {SPECIALIZATIONS.map(s=><Option key={s} value={s}>{s}</Option>)}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="rera_number" label="RERA Number">
                  <Input size="large" placeholder="e.g. RERA-2024-001" prefix={<FileDoneOutlined style={{ color:"#9CA3AF" }}/>} style={{ borderRadius:9 }}/>
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* STEP 2: Documents — always in DOM */}
          <div style={{ display:currentStep===2?"block":"none" }}>
            <Alert message="Documents & Media" description="Upload verification documents for this agent." type="info" showIcon style={{ borderRadius:10, marginBottom:20, border:"none", background:"#EFF6FF" }}/>
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <UploadField type="profile" label="Profile Photo" accept="image/*" fileObj={uploadFiles.profile} uploading={uploading.profile} onUpload={handleUpload} onRemove={removeFile}/>
              </Col>
              <Col xs={24} md={8}>
                <UploadField type="idProof" label="ID Proof" accept=".pdf,image/*" fileObj={uploadFiles.idProof} uploading={uploading.idProof} onUpload={handleUpload} onRemove={removeFile}/>
              </Col>
              <Col xs={24} md={8}>
                <UploadField type="rera" label="RERA Certificate" accept=".pdf,image/*" fileObj={uploadFiles.rera} uploading={uploading.rera} onUpload={handleUpload} onRemove={removeFile}/>
              </Col>
            </Row>
          </div>

          {/* Footer Buttons */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:24, paddingTop:18, borderTop:"1px solid #F3F4F6" }}>
            {currentStep>0
              ? <Button size="large" icon={<ArrowLeftOutlined/>} onClick={()=>setCurrentStep(s=>s-1)} style={{ borderRadius:9, fontWeight:500 }}>Back</Button>
              : <div/>
            }
            <Space>
              <Button size="large" onClick={closeAddModal} style={{ borderRadius:9, fontWeight:500 }}>Cancel</Button>
              {currentStep<2
                ? <Button size="large" type="primary" onClick={handleNext} icon={<ArrowRightOutlined/>} style={{ borderRadius:9, paddingInline:24, fontWeight:600, background:"linear-gradient(135deg,#2563EB,#1D4ED8)", border:"none", boxShadow:"0 4px 12px rgba(37,99,235,.3)" }}>Next Step</Button>
                : <Button size="large" type="primary" onClick={handleAddAgent} icon={<CheckOutlined/>} style={{ borderRadius:9, paddingInline:24, fontWeight:600, background:"linear-gradient(135deg,#16A34A,#15803D)", border:"none", boxShadow:"0 4px 12px rgba(22,163,74,.3)" }}>Create Agent</Button>
              }
            </Space>
          </div>
        </Form>
      </Modal>

      {/* ====================================================
          VIEW AGENT MODAL
          ==================================================== */}
      <Modal
        open={viewModalOpen} onCancel={()=>setViewModalOpen(false)}
        width={520} centered footer={null}
        styles={{ content:{ borderRadius:18, padding:0, overflow:"hidden" } }}
      >
        {selectedAgent&&(
          <>
            <div style={{ padding:"22px 24px 18px", borderBottom:"1px solid #F3F4F6", display:"flex", alignItems:"center", gap:16 }}>
              <AgentAvatar name={selectedAgent.name} src={selectedAgent.avatar} size={56} showDot active={selectedAgent.status}/>
              <div>
                <div style={{ fontSize:18, fontWeight:700, color:"#111827" }}>{selectedAgent.name}</div>
                <div style={{ fontSize:12, color:"#9CA3AF", marginTop:3, display:"flex", alignItems:"center", gap:8 }}>
                  <Tag color="blue" style={{ borderRadius:20, border:"none", fontSize:11, margin:0 }}>{selectedAgent.role||"Agent"}</Tag>
                  <Badge status={selectedAgent.status?"success":"default"} text={selectedAgent.status?"Active":"Inactive"}/>
                </div>
              </div>
            </div>
            <div style={{ padding:"18px 24px 22px", maxHeight:480, overflowY:"auto" }}>
              <div style={{ fontSize:11, fontWeight:600, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:".7px", marginBottom:8 }}>Contact</div>
              <div className="drow"><span style={{ color:"#6B7280" }}>Email</span><span style={{ fontWeight:500 }}>{selectedAgent.email||"--"}</span></div>
              <div className="drow"><span style={{ color:"#6B7280" }}>Phone</span><span style={{ fontWeight:500 }}>{selectedAgent.phone||"--"}</span></div>
              <div style={{ fontSize:11, fontWeight:600, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:".7px", marginTop:20, marginBottom:8 }}>Professional</div>
              <div className="drow"><span style={{ color:"#6B7280" }}>Location</span><span style={{ fontWeight:500 }}>{[selectedAgent.city,selectedAgent.country].filter(Boolean).join(", ")||"--"}</span></div>
              <div className="drow"><span style={{ color:"#6B7280" }}>Specialization</span><span>{selectedAgent.specialization?<Tag color="blue" style={{ borderRadius:20, border:"none", fontSize:11 }}>{selectedAgent.specialization}</Tag>:"--"}</span></div>
              <div className="drow"><span style={{ color:"#6B7280" }}>Experience</span><span style={{ fontWeight:500 }}>{selectedAgent.experience?`${selectedAgent.experience} years`:"--"}</span></div>
              <div className="drow"><span style={{ color:"#6B7280" }}>RERA Number</span><span style={{ fontWeight:500 }}>{selectedAgent.reraNumber||"--"}</span></div>
              <div className="drow"><span style={{ color:"#6B7280" }}>Status</span><Badge status={selectedAgent.status?"success":"default"} text={selectedAgent.status?"Active":"Inactive"}/></div>
              {(selectedAgent.idProof||selectedAgent.reraCertificate)&&(
                <>
                  <div style={{ fontSize:11, fontWeight:600, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:".7px", marginTop:20, marginBottom:8 }}>Documents</div>
                  {selectedAgent.idProof&&<div className="drow"><span style={{ color:"#6B7280" }}>ID Proof</span><Button type="link" href={selectedAgent.idProof} target="_blank" style={{ color:"#2563EB", padding:0, fontWeight:500, fontSize:13 }}>View Document</Button></div>}
                  {selectedAgent.reraCertificate&&<div className="drow"><span style={{ color:"#6B7280" }}>RERA Certificate</span><Button type="link" href={selectedAgent.reraCertificate} target="_blank" style={{ color:"#2563EB", padding:0, fontWeight:500, fontSize:13 }}>View Certificate</Button></div>}
                </>
              )}
            </div>
            <div style={{ padding:"14px 24px", borderTop:"1px solid #F3F4F6", display:"flex", justifyContent:"flex-end", background:"#F9FAFB" }}>
              <Button onClick={()=>setViewModalOpen(false)} style={{ borderRadius:9, fontWeight:500 }}>Close</Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default AgencyManageAgents;