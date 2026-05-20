import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Card, Typography, Avatar, Button, Tag, Input, Modal, Space, Row, Col, Skeleton,
  Popconfirm, Tooltip
} from "antd";
import {
  UserOutlined, MailOutlined, PhoneOutlined,
  CheckCircleOutlined, CloseCircleOutlined, FlagOutlined,
  MoreOutlined, EnvironmentOutlined, IdcardOutlined,
  FileTextOutlined, CalendarOutlined, TrophyOutlined,
  TeamOutlined, PlusOutlined, DeleteOutlined, EyeOutlined
} from "@ant-design/icons";
import { FiSearch, FiRefreshCw } from "react-icons/fi";
import CustomTable from "../../CMS/pages/custom/CustomTable"
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;

const THEME = {
  primary:    "#5C039B",
  primaryBg:  "#5C039B15",
  success:    "#10b981",
  successBg:  "#10b98115",
  error:      "#ef4444",
  errorBg:    "#ef444415",
  warning:    "#d97706",
  warningBg:  "#d9770615",
  info:       "#3b82f6",
  infoBg:     "#3b82f615",
  border:     "#f0f0f0",
  textPrimary:"#1f2937",
  textMuted:  "#9ca3af",
  bg:         "#f8f9fa",
};

const AVATAR_COLORS = [
  "#5f0f9c","#0891B2","#059669","#D97706",
  "#DC2626","#7C3AED","#DB2777","#EA580C","#65A30D","#0284C7",
];

const getInitials = (name="") => name.split(" ").map((w)=>w[0]||"").join("").toUpperCase().slice(0,2);
const getAvatarColor = (name="") => {
  const h = name.split("").reduce((a,c)=>a+c.charCodeAt(0),0);
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
};

const normalizeAgent = (a, idx, page, limit) => ({
  ...a,
  key:       a._id,
  sno:       (page - 1) * limit + idx + 1,
  name:      a.fullName || `${a.first_name || ""} ${a.last_name || ""}`.trim() || "—",
  fullName:  a.fullName || `${a.first_name || ""} ${a.last_name || ""}`.trim() || "—",
  phone:     a.phone || a.phone_number || "—",
  email:     a.email || "—",
  location:  a.location || a.operating_city || a.country || "—",
  city:      a.operating_city || a.city || a.country || "—",
  country:   a.country || "UAE",
  avatar:    a.profile_photo || null,
  profile_photo: a.profile_photo || null,
  status:    a.is_active ?? a.status ?? true,
  is_active: a.is_active ?? a.status ?? true,
  specialization: a.specialization || "",
  experience: a.experience_years || a.experience || 0,
  experience_years: a.experience_years || a.experience || 0,
  reraNumber: a.rera_number || "",
  rera_number: a.rera_number || "",
  idProof: a.id_proof || null,
  id_proof: a.id_proof || null,
  reraCertificate: a.rera_certificate || null,
  rera_certificate: a.rera_certificate || null,
});

const AgentAvatar = ({ name="", src, size=40, showDot=false, active=true }) => (
  <div style={{ position:"relative", display:"inline-block", flexShrink:0 }}>
    {src
      ? <img src={src} alt={name} style={{ width:size, height:size, borderRadius:"50%", objectFit:"cover", border:"3px solid #fff", boxShadow:"0 4px 12px rgba(95,15,156,.2)" }} />
      : <div style={{ width:size, height:size, borderRadius:"50%", background:getAvatarColor(name), color:"#fff", fontWeight:700, fontSize:size*.35, display:"flex", alignItems:"center", justifyContent:"center", border:"3px solid #fff", boxShadow:"0 4px 12px rgba(95,15,156,.2)", letterSpacing:"-.5px" }}>{getInitials(name)}</div>
    }
    {showDot && <span style={{ position:"absolute", bottom:0, right:0, width:12, height:12, borderRadius:"50%", border:"3px solid #fff", background:active?"#22c55e":"#9CA3AF", boxShadow:`0 0 0 2px ${active?"#bbf7d0":"#e5e7eb"}` }} />}
  </div>
);

const StatusPill = ({ active }) => (
  <span style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"5px 12px", borderRadius:999, fontSize:11, fontWeight:700, border:"1px solid", background:active?"linear-gradient(135deg,#f0fdf4,#dcfce7)":"#f9fafb", borderColor:active?"#86efac":"#e5e7eb", color:active?"#15803d":"#6b7280" }}>
    <span style={{ width:7, height:7, borderRadius:"50%", background:active?"#22c55e":"#9ca3af", boxShadow:active?"0 0 0 3px rgba(34,197,94,.2)":"none" }} />
    {active ? "Active" : "Inactive"}
  </span>
);

const MiniStat = ({ icon, label, value, color }) => (
  <div
    style={{
      background:    "#fff",
      border:        `1px solid ${THEME.border}`,
      borderRadius:  10,
      padding:       "14px 16px",
      display:       "flex",
      alignItems:    "center",
      gap:           12,
    }}
  >
    <div
      style={{
        width: 38, height: 38, borderRadius: 10,
        background: `${color}18`, color,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, color: THEME.textPrimary, lineHeight: 1.2 }}>
        {value ?? 0}
      </div>
      <div style={{ fontSize: 12, color: THEME.textMuted }}>{label}</div>
    </div>
  </div>
);

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return isMobile;
};

const ViewAgentModal = ({ open, onClose, agent }) => {
  const isMobile = useIsMobile();
  if (!agent) return null;
  const isActive = agent.is_active ?? agent.status ?? true;

  const content = (
    <>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.7;transform:scale(1.3)}}
        .vaBanner{background:linear-gradient(135deg,#5f0f9c,#7c3aed 50%,#a855f7);padding:28px 20px 60px;position:relative;overflow:hidden}
        .vaBanner::before{content:'';position:absolute;top:-60%;right:-15%;width:280px;height:280px;background:rgba(255,255,255,.08);border-radius:50%}
        .vaBanner::after{content:'';position:absolute;bottom:-40%;left:-15%;width:220px;height:220px;background:rgba(255,255,255,.06);border-radius:50%}
        .vaBadge{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:999px;font-size:12px;font-weight:700;backdrop-filter:blur(10px)}
        .vaBadge.active{background:rgba(255,255,255,.2);color:#fff;border:1px solid rgba(255,255,255,.3)}
        .vaBadge.inactive{background:rgba(0,0,0,.2);color:rgba(255,255,255,.8);border:1px solid rgba(255,255,255,.2)}
        .vaStatsGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:-44px;padding:0 16px 16px;position:relative;z-index:1}
        .vaMiniStat{background:#fff;border-radius:16px;padding:14px 10px;text-align:center;box-shadow:0 8px 24px rgba(95,15,156,.12);border:1px solid rgba(95,15,156,.08);transition:all .25s}
        .vaMiniStat:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(95,15,156,.18)}
        .vaMiniStatIcon{width:38px;height:38px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin:0 auto 10px;font-size:18px}
        .vaMiniStatValue{font-size:17px;font-weight:800;color:#0f172a;line-height:1;margin-bottom:4px}
        .vaMiniStatLabel{font-size:9px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:.5px}
        .vaSection{background:#fff;border-radius:16px;margin:0 14px 12px;padding:16px 18px;box-shadow:0 2px 12px rgba(0,0,0,.04);border:1px solid #f1f5f9}
        .vaSectionTitle{font-size:10px;font-weight:800;color:#5f0f9c;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:14px;display:flex;align-items:center;gap:8px}
        .vaSectionTitle::after{content:'';flex:1;height:2px;background:linear-gradient(90deg,#e9d5ff,transparent);border-radius:2px}
        .vaInfoRow{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px dashed #f1f5f9}
        .vaInfoRow:last-child{border-bottom:none;padding-bottom:0}
        .vaInfoLabel{font-size:12px;color:#64748b;font-weight:500;display:flex;align-items:center;gap:8px}
        .vaInfoLabelIcon{width:30px;height:30px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0}
        .vaInfoValue{font-size:13px;font-weight:700;color:#0f172a;text-align:right;max-width:55%;overflow:hidden;text-overflow:ellipsis}
        .vaInfoValue.empty{color:#cbd5e1;font-weight:500}
        .vaDocCard{display:flex;align-items:center;gap:12px;padding:12px 14px;background:linear-gradient(135deg,#faf5ff,#f3e8ff);border-radius:12px;border:1px solid #e9d5ff;margin-bottom:10px;transition:all .2s}
        .vaDocCard:last-child{margin-bottom:0}
        .vaDocCard:hover{transform:translateX(4px);border-color:#5f0f9c}
        .vaDocIcon{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;background:#fff}
        .vaDocInfo{flex:1;min-width:0}
        .vaDocName{font-size:13px;font-weight:700;color:#0f172a;margin-bottom:2px}
        .vaDocMeta{font-size:11px;color:#7c3aed}
        .vaDocLink{padding:7px 14px;border-radius:10px;font-size:12px;font-weight:700;background:linear-gradient(135deg,#5f0f9c,#7c3aed);color:#fff;border:none;cursor:pointer;text-decoration:none;box-shadow:0 4px 12px rgba(95,15,156,.3);white-space:nowrap}
        .vaDocLink:hover{transform:translateY(-2px);box-shadow:0 6px 16px rgba(95,15,156,.4)}
        .vaFooter{padding:12px 14px 20px;display:flex;gap:10px}
        .vaVerified{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:8px;font-size:10px;font-weight:700;background:linear-gradient(135deg,#f0fdf4,#dcfce7);color:#16a34a;margin-left:6px}
      `}</style>

      <div className="vaBanner">
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", position:"relative", zIndex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ position:"relative" }}>
              <AgentAvatar name={agent.name} src={agent.avatar} size={68} />
              <div style={{ position:"absolute", bottom:2, right:2, width:16, height:16, borderRadius:"50%", background:isActive?"#22c55e":"#94a3b8", border:"3px solid #fff" }} />
            </div>
            <div>
              <h2 style={{ fontSize:20, fontWeight:800, color:"#fff", margin:"0 0 8px", letterSpacing:"-.5px" }}>{agent.name}</h2>
              <div className={`vaBadge ${isActive?"active":"inactive"}`}>
                {isActive && <span style={{ width:7, height:7, borderRadius:"50%", background:"#4ade80", animation:"pulse 2s infinite" }} />}
                {isActive?"Active Now":"Offline"}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", border:"1px solid rgba(255,255,255,.3)", background:"rgba(255,255,255,.15)", color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, position:"relative", zIndex:2 }}>✕</button>
        </div>
      </div>

      <div className="vaStatsGrid">
        {[
          { icon:<TrophyOutlined/>, bg:"linear-gradient(135deg,#fef3c7,#fde68a)", color:"#d97706", value: agent.experience??0, label:"Years Exp." },
          { icon:<EnvironmentOutlined/>, bg:"linear-gradient(135deg,#dbeafe,#bfdbfe)", color:"#2563eb", value: agent.city||"—", label:"Location", small:true },
          { icon:<FileTextOutlined/>, bg: agent.specialization?"linear-gradient(135deg,#faf5ff,#f3e8ff)":"#f1f5f9", color: agent.specialization?"#5f0f9c":"#94a3b8", value: agent.specialization||"—", label:"Specialization", small:true },
        ].map(({icon,bg,color,value,label,small})=>(
          <div key={label} className="vaMiniStat">
            <div className="vaMiniStatIcon" style={{ background:bg, color }}>{icon}</div>
            <div className="vaMiniStatValue" style={{ fontSize:small?13:17 }}>{value}</div>
            <div className="vaMiniStatLabel">{label}</div>
          </div>
        ))}
      </div>

      <div className="vaSection">
        <div className="vaSectionTitle">📞 Contact Information</div>
        {[
          { icon:<MailOutlined/>, bg:"linear-gradient(135deg,#fef3c7,#fde68a)", color:"#d97706", label:"Email", value:agent.email },
          { icon:<PhoneOutlined/>, bg:"linear-gradient(135deg,#dbeafe,#bfdbfe)", color:"#2563eb", label:"Phone", value:agent.phone },
          { icon:<EnvironmentOutlined/>, bg:"linear-gradient(135deg,#fce7f3,#fbcfe8)", color:"#db2777", label:"Location", value:[agent.city,agent.country].filter(Boolean).join(", ")||null },
        ].map(({icon,bg,color,label,value})=>(
          <div key={label} className="vaInfoRow">
            <div className="vaInfoLabel"><div className="vaInfoLabelIcon" style={{ background:bg, color }}>{icon}</div>{label}</div>
            <div className={`vaInfoValue ${!value?"empty":""}`}>{value||"Not provided"}</div>
          </div>
        ))}
      </div>

      <div className="vaSection">
        <div className="vaSectionTitle">💼 Professional Details</div>
        <div className="vaInfoRow">
          <div className="vaInfoLabel"><div className="vaInfoLabelIcon" style={{ background:"linear-gradient(135deg,#fef3c7,#fde68a)", color:"#d97706" }}><TrophyOutlined/></div>Experience</div>
          <div className="vaInfoValue">{agent.experience!=null?`${agent.experience} Years`:"—"}</div>
        </div>
        <div className="vaInfoRow">
          <div className="vaInfoLabel"><div className="vaInfoLabelIcon" style={{ background:"linear-gradient(135deg,#dcfce7,#bbf7d0)", color:"#16a34a" }}><FileTextOutlined/></div>RERA No.</div>
          <div className={`vaInfoValue ${!agent.reraNumber?"empty":""}`}>{agent.reraNumber?<>{agent.reraNumber}<span className="vaVerified">✓</span></>:"Not registered"}</div>
        </div>
        <div className="vaInfoRow">
          <div className="vaInfoLabel"><div className="vaInfoLabelIcon" style={{ background:"linear-gradient(135deg,#faf5ff,#f3e8ff)", color:"#5f0f9c" }}><CheckCircleOutlined/></div>Specialization</div>
          <div className="vaInfoValue">{agent.specialization||"—"}</div>
        </div>
      </div>

      {(agent.idProof||agent.reraCertificate) && (
        <div className="vaSection">
          <div className="vaSectionTitle">📄 Documents</div>
          {agent.idProof && <div className="vaDocCard"><div className="vaDocIcon">🪪</div><div className="vaDocInfo"><div className="vaDocName">ID Proof</div><div className="vaDocMeta">Government issued ID</div></div><a href={agent.idProof} target="_blank" rel="noopener noreferrer" className="vaDocLink">View</a></div>}
          {agent.reraCertificate && <div className="vaDocCard"><div className="vaDocIcon">📜</div><div className="vaDocInfo"><div className="vaDocName">RERA Certificate</div><div className="vaDocMeta">Real Estate Regulatory Agency</div></div><a href={agent.reraCertificate} target="_blank" rel="noopener noreferrer" className="vaDocLink">View</a></div>}
        </div>
      )}

      <div className="vaFooter">
        <Button size="large" onClick={onClose} style={{ flex:1, height:46, borderRadius:12, fontWeight:700, fontSize:14, background:"#f8fafc", border:"1px solid #e2e8f0", color:"#475569" }}>Close</Button>
      </div>
    </>
  );

  if (isMobile) return <Modal open={open} onCancel={onClose} closable={false} centered footer={null} styles={{ content:{borderRadius:24,padding:0,overflow:"hidden",boxShadow:"0 25px 60px -12px rgba(95,15,156,.3)"} }}>{content}</Modal>;
  return <Modal open={open} onCancel={onClose} closable={false} width={720} centered footer={null} styles={{ content:{borderRadius:24,padding:0,overflow:"hidden",boxShadow:"0 25px 60px -12px rgba(95,15,156,.3)"} }}>{content}</Modal>;
};

const AgencyAgentList = () => {
  const [agents,    setAgents]    = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [search,    setSearch]    = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const [pagination, setPagination] = useState({
    currentPage: 1, totalPages: 1, totalResults: 0, itemsPerPage: 20,
  });

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);

  const searchTimeout = useRef(null);

  const fetchAgents = useCallback(async (
    page = 1, limit = 20, searchVal = "", tab = activeTab
  ) => {
    setLoading(true);
    try {
      let url = `/agency/agents?page=${page}&limit=${limit}`;
      if (tab && tab !== "all") url += `&status=${tab}`;
      if (searchVal?.trim())    url += `&search=${encodeURIComponent(searchVal.trim())}`;

      const res  = await apiService.get(url);
      const data = res?.data.data || res;

      const mapped = (data?.data || []).map((a, i) =>
        normalizeAgent(a, i, page, limit)
      );

      setAgents(mapped);
      setPagination({
        currentPage:  page,
        totalPages:   data?.pagination?.pages || 1,
        totalResults: data?.pagination?.total || mapped.length,
        itemsPerPage: data?.pagination?.limit || limit,
      });
    } catch {
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchAgents(1, pagination.itemsPerPage, search, activeTab);
  }, [activeTab]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() =>
      fetchAgents(1, pagination.itemsPerPage, val, activeTab), 500
    );
  };

  const handleView = (agent) => {
    setSelectedAgent(agent);
    setViewModalOpen(true);
  };

  const total = agents.length;
  const active = agents.filter((a)=>a.is_active ?? a.status).length;
  const inactive = total - active;

  const columns = [
    {
      key: "name", title: "Agent", sortable: true,
      render: (_, agent) => (
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <AgentAvatar name={agent.name} src={agent.avatar} size={38} showDot active={agent.is_active ?? agent.status} />
          <div>
            <div style={{ fontSize:13, fontWeight:800, color:"#111827", maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{agent.name}</div>
            <div style={{ fontSize:11, color:"#9CA3AF", display:"flex", alignItems:"center", gap:4, marginTop:2, fontWeight:600 }}>
              <MailOutlined style={{ fontSize:10, color:"#5f0f9c" }} />
              <span style={{ maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{agent.email||"--"}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "phone", title: "Contact",
      render: (_, agent) => (
        <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
          <div style={{ fontSize:12, color:"#374151", display:"flex", alignItems:"center", gap:5, fontWeight:600 }}>
            <PhoneOutlined style={{ color:"#5f0f9c", fontSize:11 }} />
            {agent.phone ? <a href={`tel:${agent.phone}`} style={{ color:"inherit", textDecoration:"none" }}>{agent.phone}</a> : "--"}
          </div>
        </div>
      ),
    },
    {
      key: "city", title: "City", sortable: true,
      render: (_, agent) => (
        <div>
          <div style={{ fontSize:12, color:"#374151", display:"flex", alignItems:"center", gap:5, fontWeight:600 }}>
            <EnvironmentOutlined style={{ color:"#0891B2", fontSize:11 }} />{agent.city||"--"}
          </div>
        </div>
      ),
    },
    {
      key: "specialization", title: "Specialization", sortable: true,
      render: (val, agent) => agent.specialization
        ? <Tag style={{ borderRadius:999, border:"none", fontWeight:700, fontSize:11, padding:"3px 10px", margin:0, background:"linear-gradient(135deg,#faf5ff,#f3e8ff)", color:"#5f0f9c" }}>{agent.specialization}</Tag>
        : <span style={{ color:"#D1D5DB", fontSize:12 }}>--</span>,
    },
    {
      key: "status", title: "Status",
      render: (_, agent) => <StatusPill active={!!(agent.is_active ?? agent.status)} />,
    },
    {
      key: "actions", title: "Actions",
      render: (_, agent) => (
        <div style={{ display:"flex", gap:8 }}>
          <Tooltip title="View Details">
            <Button type="text" size="small" icon={<EyeOutlined />}
              onClick={()=>handleView(agent)}
              style={{ width:34, height:34, borderRadius:10, border:"1px solid #e5e7eb", color:"#5f0f9c", background:"#fff" }}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding:"28px 24px", background:"linear-gradient(135deg,#faf5ff 0%,#f3e8ff 50%,#ede9fe 100%)", minHeight:"100vh", fontFamily:"'DM Sans',-apple-system,sans-serif" }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
      `}</style>

      <div style={{ maxWidth:1300, margin:"0 auto" }}>
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, gap:10, flexWrap:"wrap", animation:"fadeUp .3s ease" }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
              <div style={{ width:38, height:38, borderRadius:12, background:"linear-gradient(135deg,#5f0f9c,#7c3aed)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 6px 16px rgba(95,15,156,.3)" }}><TeamOutlined style={{ color:"#fff", fontSize:18 }} /></div>
              <h1 style={{ fontSize:24, fontWeight:800, color:"#1e1b4b", margin:0 }}>Agent Team</h1>
            </div>
            <p style={{ fontSize:13, color:"#7c3aed", margin:0, marginLeft:48, fontWeight:500 }}>Manage and monitor your agency's real estate agents</p>
          </div>
        </div>

        {/* Stats */}
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          {[
            { icon: <TeamOutlined />, label: "Total Agents", value: total, color: "#5f0f9c" },
            { icon: <CheckCircleOutlined />, label: "Active", value: active, color: "#10b981" },
            { icon: <CloseCircleOutlined />, label: "Inactive", value: inactive, color: "#ef4444" },
          ].map((stat, idx) => (
            <Col xs={12} sm={8} key={idx}>
              <MiniStat {...stat} />
            </Col>
          ))}
        </Row>

        {/* Table Card */}
        <Card
          bordered={false}
          style={{ borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
          bodyStyle={{ padding: 0 }}
        >
          <div
            style={{
              display: "flex", flexWrap: "wrap", alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px", borderBottom: `1px solid ${THEME.border}`, gap: 12,
            }}
          >
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Input
                placeholder="Search name, email, phone..."
                prefix={<FiSearch style={{ color: THEME.textMuted }} />}
                value={search}
                onChange={handleSearch}
                allowClear
                onClear={() => { setSearch(""); fetchAgents(1, pagination.itemsPerPage, "", activeTab); }}
                style={{ width: 260, borderRadius: 8 }}
              />
              <Button
                icon={<FiRefreshCw size={14} />}
                onClick={() => fetchAgents(pagination.currentPage, pagination.itemsPerPage, search, activeTab)}
                style={{ borderRadius: 8 }}
              >
                Refresh
              </Button>
            </div>
          </div>

          <CustomTable
            columns={columns}
            data={agents}
            loading={loading}
            totalItems={pagination.totalResults}
            currentPage={pagination.currentPage}
            onPageChange={(page, limit) => fetchAgents(page, limit, search, activeTab)}
            scroll={{ x: 1050 }}
            showSearch={false}
          />
        </Card>
      </div>

      <ViewAgentModal open={viewModalOpen} onClose={() => setViewModalOpen(false)} agent={selectedAgent} />
    </div>
  );
};

export default AgencyAgentList;
