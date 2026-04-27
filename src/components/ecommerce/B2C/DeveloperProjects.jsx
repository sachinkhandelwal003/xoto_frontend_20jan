import { Skeleton } from "antd";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import {
  PlusOutlined, SearchOutlined, EnvironmentOutlined,
  ExpandOutlined, EyeOutlined, EditOutlined, AppstoreOutlined,
  CheckCircleFilled, ClockCircleFilled, CloseCircleFilled,
  FireFilled, BuildFilled, ApartmentOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const STATUS_CONFIG = {
  approved: { color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0", icon: <CheckCircleFilled />, label: "Approved" },
  pending:  { color: "#92400e", bg: "#fffbeb", border: "#fde68a", icon: <ClockCircleFilled />,  label: "Pending"  },
  rejected: { color: "#991b1b", bg: "#fef2f2", border: "#fecaca", icon: <CloseCircleFilled />, label: "Rejected" },
};

const FILTERS = [
  { key: "all",      label: "All",      icon: <BuildFilled />,        color: "#6d28d9", bg: "#f5f3ff" },
  { key: "approved", label: "Approved", icon: <CheckCircleFilled />,  color: "#15803d", bg: "#f0fdf4" },
  { key: "pending",  label: "Pending",  icon: <ClockCircleFilled />,  color: "#92400e", bg: "#fffbeb" },
  { key: "rejected", label: "Rejected", icon: <CloseCircleFilled />,  color: "#991b1b", bg: "#fef2f2" },
];

const projectStatusLabel = (s) => ({
  presale: "Pre-Sale", under_construction: "Under Construction",
  ready: "Ready", sold_out: "Sold Out",
}[s] || s);

export default function DeveloperProjects() {
  const navigate = useNavigate();
  const [projects, setProjects]     = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [search, setSearch]         = useState("");
  const [activeFilter, setFilter]   = useState("all");
  const [hoveredCard, setHovCard]   = useState(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res  = await apiService.get("/properties/", { page: 1, limit: 50 });
      const list = res?.data || [];
      const mapped = list.map((p, i) => ({
        key:           p._id || `row-${i}`,
        propertyName:  p.propertyName || "Untitled",
        location:      [p.area, p.city].filter(Boolean).join(", "),
        units:         p.builtUpArea_max ? `${p.builtUpArea_min}–${p.builtUpArea_max} sqft` : null,
        status:        p.approvalStatus || "pending",
        image:         p.mainLogo || "",
        price:         p.price_min && p.price_max
                         ? `${p.currency || "AED"} ${Number(p.price_min).toLocaleString()} – ${Number(p.price_max).toLocaleString()}`
                         : null,
        projectStatus: p.projectStatus || "",
        isFeatured:    p.isFeatured || false,
        bedroomType:   p.bedroomType || "",
        unitType:      p.unitType || "",
      }));
      setProjects(mapped);
      setFiltered(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  useEffect(() => {
    const q    = search.toLowerCase();
    const base = activeFilter === "all" ? projects : projects.filter(p => p.status === activeFilter);
    setFiltered(base.filter(p =>
      p.propertyName?.toLowerCase().includes(q) ||
      p.location?.toLowerCase().includes(q)
    ));
  }, [search, projects, activeFilter]);

  const count = (k) => k === "all" ? projects.length : projects.filter(p => p.status === k).length;

  return (
    <div style={S.page}>

      {/* ─── HEADER ─── */}
      <div style={S.topBar}>
        <div>
          <h1 style={S.pageTitle}>My Properties</h1>
          <p style={S.pageSubtitle}>Manage and track all your listed properties</p>
        </div>
        <button style={S.addBtn} onClick={() => navigate("/dashboard/developer/developer-projects/add")}>
          <PlusOutlined style={{ fontSize: 13 }} /> Add Property
        </button>
      </div>

      {/* ─── STAT CARDS ─── */}
      <div style={S.statsRow}>
        {FILTERS.map(f => {
          const active = activeFilter === f.key;
          return (
            <button
              key={f.key}
              style={{ ...S.statCard, ...(active ? S.statCardActive : {}) }}
              onClick={() => setFilter(f.key)}
            >
              <div style={{ ...S.statIcon, color: f.color, background: f.bg }}>{f.icon}</div>
              <div>
                <div style={S.statCount}>{count(f.key)}</div>
                <div style={S.statLabel}>{f.label}</div>
              </div>
              {active && <div style={S.activeDot} />}
            </button>
          );
        })}
      </div>

      {/* ─── SEARCH ─── */}
      <div style={S.searchRow}>
        <div style={S.searchBox}>
          <SearchOutlined style={S.searchIco} />
          <input
            style={S.searchInput}
            placeholder="Search by name or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button style={S.clearBtn} onClick={() => setSearch("")}>✕</button>}
        </div>
        <span style={S.resultTxt}>{filtered.length} {filtered.length === 1 ? "property" : "properties"}</span>
      </div>

      {/* ─── CONTENT ─── */}
      {loading ? (
        <div style={S.grid}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ background:"#fff", borderRadius:10, overflow:"hidden", border:"1px solid #e2e8f0" }}>
              <div style={{ height:196, background:"#f1f5f9" }} />
              <div style={{ padding:16 }}><Skeleton active paragraph={{ rows:2 }} /></div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={S.empty}>
          <div style={S.emptyIcon}><ApartmentOutlined style={{ fontSize:28, color:"#94a3b8" }} /></div>
          <p style={S.emptyTitle}>No properties found</p>
          <p style={S.emptySub}>{search ? "Try a different search term" : "Add your first property to get started"}</p>
          {!search && (
            <button style={S.addBtn} onClick={() => navigate("/dashboard/developer/developer-projects/add")}>
              <PlusOutlined /> Add Property
            </button>
          )}
        </div>
      ) : (
        <div style={S.grid}>
          {filtered.map(item => {
            const sc   = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
            const isHov = hoveredCard === item.key;
            return (
              <div
                key={item.key}
                style={{ ...S.card, ...(isHov ? S.cardHov : {}) }}
                onMouseEnter={() => setHovCard(item.key)}
                onMouseLeave={() => setHovCard(null)}
              >
                {/* Image */}
                <div style={S.imgWrap}>
                  <img
                    src={item.image || "https://placehold.co/400x220/f1f5f9/94a3b8?text=No+Image"}
                    alt={item.propertyName}
                    style={{ ...S.img, transform: isHov ? "scale(1.04)" : "scale(1)" }}
                  />

                  {/* Top-left badges */}
                  <div style={S.badgeLeft}>
                    {item.isFeatured && (
                      <span style={S.featuredBadge}><FireFilled style={{ fontSize:9 }} /> Featured</span>
                    )}
                    {item.projectStatus && (
                      <span style={S.projectBadge}>{projectStatusLabel(item.projectStatus)}</span>
                    )}
                  </div>

                  {/* Status top-right */}
                  <span style={{ ...S.statusBadge, color: sc.color, background: sc.bg, border: `1px solid ${sc.border}` }}>
                    <span style={{ fontSize:10, lineHeight:1 }}>{sc.icon}</span> {sc.label}
                  </span>
                </div>

                {/* Body */}
                <div style={S.cardBody}>
                  <h3 style={S.cardTitle}>{item.propertyName}</h3>

                  {item.location && (
                    <div style={S.cardLoc}>
                      <EnvironmentOutlined style={{ color:"#6d28d9", fontSize:11, flexShrink:0 }} />
                      <span style={S.cardLocTxt}>{item.location}</span>
                    </div>
                  )}

                  <div style={S.tagsRow}>
                    {item.unitType && <span style={S.tag}>{item.unitType.charAt(0).toUpperCase() + item.unitType.slice(1)}</span>}
                    {item.bedroomType && <span style={S.tag}>{item.bedroomType.replace(/(\d)(bed)/i,"$1 Bed")}</span>}
                    {item.units && <span style={S.tag}><ExpandOutlined style={{ fontSize:10 }} /> {item.units}</span>}
                  </div>

                  {item.price && <div style={S.price}>{item.price}</div>}

                  <div style={S.divider} />

                  <div style={S.actions}>
                    <button style={S.btnPrimary} onClick={() => navigate(`/dashboard/developer/developer-projects/${item.key}`)}>
                      <EyeOutlined style={{ fontSize:11 }} /> View
                    </button>
                    <button style={S.btnOutline} onClick={() => navigate(`/dashboard/developer/edit-property/${item.key}`)}>
                      <EditOutlined style={{ fontSize:11 }} /> Edit
                    </button>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const S = {
  page:         { minHeight:"100vh", background:"#f8fafc", padding:"28px 24px", fontFamily:"'Inter','Segoe UI',sans-serif" },

  topBar:       { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24, flexWrap:"wrap", gap:12 },
  pageTitle:    { margin:0, fontSize:22, fontWeight:700, color:"#0f172a", letterSpacing:"-0.3px" },
  pageSubtitle: { margin:"3px 0 0", fontSize:13, color:"#64748b" },

  addBtn: {
    display:"inline-flex", alignItems:"center", gap:7,
    background:"#6d28d9", color:"#fff", border:"none", borderRadius:8,
    padding:"9px 18px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
  },

  statsRow: { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))", gap:12, marginBottom:20 },
  statCard: {
    display:"flex", alignItems:"center", gap:12,
    background:"#fff", border:"1.5px solid #e2e8f0", borderRadius:10,
    padding:"14px 16px", cursor:"pointer", position:"relative",
    textAlign:"left", fontFamily:"inherit", transition:"border 0.15s, box-shadow 0.15s",
  },
  statCardActive: { borderColor:"#6d28d9", boxShadow:"0 0 0 3px rgba(109,40,217,0.08)" },
  statIcon:  { width:36, height:36, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, flexShrink:0 },
  statCount: { fontSize:20, fontWeight:700, color:"#0f172a", lineHeight:1.1 },
  statLabel: { fontSize:11, color:"#64748b", fontWeight:500, marginTop:1 },
  activeDot: { position:"absolute", top:10, right:10, width:7, height:7, borderRadius:"50%", background:"#6d28d9" },

  searchRow:   { display:"flex", alignItems:"center", gap:12, marginBottom:20 },
  searchBox:   { position:"relative", flex:1 },
  searchIco:   { position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"#94a3b8", fontSize:14, zIndex:1 },
  searchInput: {
    width:"100%", padding:"10px 36px 10px 38px", border:"1.5px solid #e2e8f0",
    borderRadius:8, fontSize:13, background:"#fff", color:"#0f172a",
    outline:"none", boxSizing:"border-box", fontFamily:"inherit",
  },
  clearBtn:   { position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#94a3b8", cursor:"pointer", fontSize:12, padding:"2px 4px" },
  resultTxt:  { fontSize:12, color:"#64748b", whiteSpace:"nowrap", fontWeight:500 },

  grid: { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(272px,1fr))", gap:16 },

  card:    { background:"#fff", borderRadius:10, overflow:"hidden", border:"1.5px solid #e2e8f0", boxShadow:"0 1px 4px rgba(0,0,0,0.05)", transition:"box-shadow 0.2s,transform 0.2s,border-color 0.2s" },
  cardHov: { boxShadow:"0 8px 24px rgba(0,0,0,0.1)", transform:"translateY(-3px)", borderColor:"#c4b5fd" },

  imgWrap:       { position:"relative", height:196, overflow:"hidden", background:"#f1f5f9" },
  img:           { width:"100%", height:"100%", objectFit:"cover", display:"block", transition:"transform 0.35s ease" },
  badgeLeft:     { position:"absolute", top:10, left:10, display:"flex", gap:6, flexWrap:"wrap" },
  featuredBadge: { display:"inline-flex", alignItems:"center", gap:4, background:"#78350f", color:"#fef3c7", fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:4 },
  projectBadge:  { background:"rgba(15,23,42,0.6)", color:"#f8fafc", fontSize:10, fontWeight:600, padding:"3px 8px", borderRadius:4 },
  statusBadge:   { position:"absolute", top:10, right:10, display:"inline-flex", alignItems:"center", gap:5, fontSize:11, fontWeight:600, padding:"4px 9px", borderRadius:6 },

  cardBody:    { padding:"14px 16px 12px" },
  cardTitle:   { margin:"0 0 5px", fontSize:14, fontWeight:700, color:"#0f172a", lineHeight:1.35, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" },
  cardLoc:     { display:"flex", alignItems:"center", gap:5, marginBottom:10 },
  cardLocTxt:  { fontSize:12, color:"#64748b", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" },
  tagsRow:     { display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 },
  tag:         { display:"inline-flex", alignItems:"center", gap:4, background:"#f1f5f9", color:"#475569", fontSize:11, fontWeight:500, padding:"3px 8px", borderRadius:4, border:"1px solid #e2e8f0" },
  price:       { fontSize:13, fontWeight:700, color:"#6d28d9", marginBottom:10 },
  divider:     { height:1, background:"#f1f5f9", marginBottom:10 },

  actions:    { display:"flex", gap:6 },
  btnPrimary: { flex:1, display:"inline-flex", alignItems:"center", justifyContent:"center", gap:5, background:"#6d28d9", color:"#fff", border:"none", borderRadius:6, padding:"7px 0", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" },
  btnOutline: { flex:1, display:"inline-flex", alignItems:"center", justifyContent:"center", gap:5, background:"#fff", color:"#374151", border:"1.5px solid #d1d5db", borderRadius:6, padding:"7px 0", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" },
  btnGreen:   { flex:1, display:"inline-flex", alignItems:"center", justifyContent:"center", gap:5, background:"#f0fdf4", color:"#15803d", border:"1.5px solid #bbf7d0", borderRadius:6, padding:"7px 0", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" },

  empty:      { textAlign:"center", padding:"64px 20px", background:"#fff", borderRadius:10, border:"1.5px dashed #e2e8f0" },
  emptyIcon:  { width:60, height:60, background:"#f8fafc", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", border:"1px solid #e2e8f0" },
  emptyTitle: { margin:"0 0 6px", fontSize:16, fontWeight:700, color:"#0f172a" },
  emptySub:   { margin:"0 0 20px", fontSize:13, color:"#64748b" },
};