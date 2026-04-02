import React, { useState } from "react";

const PURPLE = "#5C039B";
const GREEN  = "#22C55E";
const CYAN   = "#06B6D4";
const RED    = "#EF4444";
const AMBER  = "#F59E0B";
const VIOLET = "#8B5CF6";
const MUTED  = "#6B7280";
const DTEXT  = "#0F172A";
const BG     = "#F8F7FF";

const mockClients = [
  { _id:"1", name:"Ahmed Al Mansoori",   phone:"+971 50 123 4567", agentId:{ first_name:"John",   last_name:"Doe"   }, referralType:"Referral Only",    status:"qualified",     createdAt:"2025-03-15T10:00:00Z", loanAmount:2500000  },
  { _id:"2", name:"Fatima Hassan",       phone:"+971 55 987 6543", agentId:{ first_name:"Jane",   last_name:"Smith" }, referralType:"Referral + Docs",  status:"new",           createdAt:"2025-03-20T14:30:00Z", loanAmount:1200000  },
  { _id:"3", name:"Mohammed Al Rashidi", phone:"+971 56 222 3333", agentId:null,                                       referralType:"Referral Only",    status:"disbursed",     createdAt:"2025-02-10T09:15:00Z", loanAmount:7500000  },
  { _id:"4", name:"Layla Mahmoud",       phone:"+971 50 444 5555", agentId:{ first_name:"Ahmed",  last_name:"Ali"   }, referralType:"Referral + Docs",  status:"lost",          createdAt:"2025-03-01T11:20:00Z", loanAmount:3200000  },
  { _id:"5", name:"Tariq Al Balushi",    phone:"+971 52 666 7777", agentId:{ first_name:"Sara",   last_name:"Khan"  }, referralType:"Referral Only",    status:"pre_approved",  createdAt:"2025-01-22T13:00:00Z", loanAmount:4800000  },
  { _id:"6", name:"Noura Al Zaabi",      phone:"+971 58 888 9999", agentId:{ first_name:"Khalid", last_name:"Naser" }, referralType:"Referral + Docs",  status:"documentation", createdAt:"2025-02-28T16:45:00Z", loanAmount:900000   },
];

const CLIENT_STATUSES = ["new","contacted","qualified","documentation","bank","pre_approved","valuation","fol_issued","disbursed","lost"];

const statusLabel = s => s?.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase()) || "New";

const statusConfig = {
  new:           { color: CYAN,   bg: "#CFFAFE", label: "New"          },
  contacted:     { color: "#0EA5E9", bg: "#E0F2FE", label: "Contacted"  },
  qualified:     { color: GREEN,  bg: "#DCFCE7", label: "Qualified"     },
  documentation: { color: AMBER,  bg: "#FEF3C7", label: "Documentation" },
  bank:          { color: VIOLET, bg: "#EDE9FE", label: "Bank"          },
  pre_approved:  { color: GREEN,  bg: "#DCFCE7", label: "Pre Approved"  },
  valuation:     { color: VIOLET, bg: "#EDE9FE", label: "Valuation"     },
  fol_issued:    { color: CYAN,   bg: "#CFFAFE", label: "FOL Issued"    },
  disbursed:     { color: "#16A34A", bg: "#DCFCE7", label: "Disbursed"  },
  lost:          { color: RED,    bg: "#FEE2E2", label: "Lost"          },
};

const cfg = s => statusConfig[s] || { color: MUTED, bg: "#F3F4F6", label: statusLabel(s) };

const formatAED = n => n ? `AED ${(n/1000000).toFixed(1)}M` : "—";

const agentName = a => a ? `${a.first_name || ""} ${a.last_name || ""}`.trim() : "Direct";

// Pipeline step component
const PipelineBar = ({ status }) => {
  const idx = CLIENT_STATUSES.indexOf(status);
  const progress = status === "lost" ? 100 : Math.round(((idx + 1) / (CLIENT_STATUSES.length - 1)) * 100);
  return (
    <div style={{ width: "100%", height: 4, background: "#F1F0FF", borderRadius: 2, overflow: "hidden" }}>
      <div style={{ width: `${progress}%`, height: "100%", background: status === "lost" ? RED : status === "disbursed" ? GREEN : `linear-gradient(90deg,${PURPLE},${CYAN})`, borderRadius: 2, transition: "width 0.3s" }} />
    </div>
  );
};

export default function VaultClients() {
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [activeView,   setActiveView]   = useState("table");
  const [statusModal,  setStatusModal]  = useState(null);

  const clients = mockClients;

  const filtered = clients.filter(c =>
    (statusFilter === "All" || c.status === statusFilter) &&
    ((c.name || "").toLowerCase().includes(search.toLowerCase()) ||
     (c.phone || "").includes(search))
  );

  const stats = {
    total:      clients.length,
    new:        clients.filter(c => c.status === "new").length,
    qualified:  clients.filter(c => c.status === "qualified").length,
    disbursed:  clients.filter(c => c.status === "disbursed").length,
    lost:       clients.filter(c => c.status === "lost").length,
  };

  return (
    <div style={{ padding: "2rem", background: BG, minHeight: "100vh", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        .client-row { transition: background 0.15s; }
        .client-row:hover { background: #faf8ff !important; }
        .client-card { transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1); }
        .client-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(92,3,155,0.1) !important; }
        .pill-btn { transition: all 0.15s; cursor: pointer; border: none; outline: none; }
        .pill-btn:hover { opacity: 0.85; }
        .status-option { transition: all 0.12s; cursor: pointer; }
        .status-option:hover { transform: translateX(4px); }
        input:focus { border-color: ${PURPLE} !important; box-shadow: 0 0 0 3px rgba(92,3,155,0.08); }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg,${CYAN},${PURPLE})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: DTEXT, margin: 0, letterSpacing: "-0.5px" }}>Clients</h1>
          </div>
          <p style={{ color: MUTED, fontSize: 13, margin: 0 }}>Track mortgage clients through the entire pipeline</p>
        </div>

        {/* View toggle */}
        <div style={{ display: "flex", gap: 6, background: "#fff", padding: 4, borderRadius: 10, border: "1px solid #E5E7EB" }}>
          {[["table","☰","Table"],["card","⊞","Cards"]].map(([mode,icon,label]) => (
            <button key={mode} className="pill-btn" onClick={() => setActiveView(mode)} style={{
              padding: "6px 14px", borderRadius: 7, fontSize: 13, fontWeight: activeView === mode ? 700 : 400,
              background: activeView === mode ? PURPLE : "transparent",
              color: activeView === mode ? "#fff" : MUTED,
            }}>{icon} {label}</button>
          ))}
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: "1.75rem" }}>
        {[
          { label:"Total",     value:stats.total,     accent:PURPLE,    bg:"#F3E8FF", icon:"📋" },
          { label:"New",       value:stats.new,       accent:CYAN,      bg:"#CFFAFE", icon:"🆕" },
          { label:"Qualified", value:stats.qualified, accent:GREEN,     bg:"#DCFCE7", icon:"✅" },
          { label:"Disbursed", value:stats.disbursed, accent:"#16A34A", bg:"#DCFCE7", icon:"💰" },
          { label:"Lost",      value:stats.lost,      accent:RED,       bg:"#FEE2E2", icon:"❌" },
        ].map((s,i) => (
          <div key={i} style={{ background:"#fff", borderRadius:16, padding:"16px 18px", border:"1px solid #F1F0FF", boxShadow:"0 1px 4px rgba(0,0,0,0.04)", display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize:24, fontWeight:800, color:s.accent, lineHeight:1, fontFamily:"'Syne',sans-serif" }}>{s.value}</div>
              <div style={{ fontSize:11, color:MUTED, marginTop:2, fontWeight:500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div style={{ background:"#fff", borderRadius:16, border:"1px solid #F1F0FF", padding:"14px 18px", marginBottom:"1.25rem", display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
        <div style={{ position:"relative", minWidth:240, flex:1 }}>
          <svg width="14" height="14" fill="none" stroke={MUTED} strokeWidth="2" viewBox="0 0 24 24" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)" }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input placeholder="Search client name or phone..." value={search} onChange={e=>setSearch(e.target.value)}
            style={{ width:"100%", paddingLeft:34, paddingRight:14, paddingTop:9, paddingBottom:9, border:"1px solid #E5E7EB", borderRadius:10, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"'DM Sans',sans-serif" }}/>
        </div>

        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}
          style={{ border:"1px solid #E5E7EB", borderRadius:10, padding:"9px 12px", fontSize:13, outline:"none", color:DTEXT, fontFamily:"'DM Sans',sans-serif", background:"#fff" }}>
          <option value="All">All Statuses</option>
          {CLIENT_STATUSES.map(s=><option key={s} value={s}>{statusLabel(s)}</option>)}
        </select>

        <div style={{ marginLeft:"auto", fontSize:12, color:MUTED, fontWeight:500 }}>{filtered.length} of {clients.length} clients</div>
      </div>

      {/* ── TABLE VIEW ── */}
      {activeView === "table" && (
        <div style={{ background:"#fff", borderRadius:16, border:"1px solid #F1F0FF", overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ background:"linear-gradient(90deg,#faf8ff,#f8f7ff)", borderBottom:"2px solid #F1F0FF" }}>
                {["Client","Phone","Agent","Loan Value","Pipeline","Status","Created","Action"].map((h,i)=>(
                  <th key={i} style={{ padding:"13px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:"0.06em", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ padding:"3rem", textAlign:"center", color:MUTED }}>
                  <div style={{ fontSize:32, marginBottom:8 }}>🔍</div>
                  <div style={{ fontWeight:600 }}>No clients match your filters</div>
                </td></tr>
              )}
              {filtered.map((c,idx)=>{
                const sc = cfg(c.status);
                return (
                  <tr key={c._id} className="client-row" style={{ borderBottom:"1px solid #F8F7FF" }}>
                    {/* Client */}
                    <td style={{ padding:"13px 16px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${sc.color}30,${sc.color}60)`, border:`1.5px solid ${sc.color}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:sc.color, flexShrink:0 }}>
                          {(c.name||"?")[0].toUpperCase()}
                        </div>
                        <div style={{ fontWeight:700, color:DTEXT }}>{c.name||"—"}</div>
                      </div>
                    </td>
                    {/* Phone */}
                    <td style={{ padding:"13px 16px", color:MUTED, fontSize:12 }}>{c.phone||"—"}</td>
                    {/* Agent */}
                    <td style={{ padding:"13px 16px" }}>
                      <div style={{ fontSize:12, color:DTEXT, fontWeight:500 }}>{agentName(c.agentId)}</div>
                      {c.agentId && <div style={{ fontSize:10, color:MUTED, marginTop:1 }}>Agent</div>}
                    </td>
                    {/* Loan */}
                    <td style={{ padding:"13px 16px" }}>
                      <span style={{ fontWeight:700, color:PURPLE, fontSize:13 }}>{formatAED(c.loanAmount)}</span>
                    </td>
                    {/* Pipeline */}
                    <td style={{ padding:"13px 16px", minWidth:100 }}>
                      <PipelineBar status={c.status}/>
                    </td>
                    {/* Status */}
                    <td style={{ padding:"13px 16px" }}>
                      <span style={{ background:sc.bg, color:sc.color, border:`1px solid ${sc.color}30`, borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:700, whiteSpace:"nowrap" }}>
                        {sc.label}
                      </span>
                    </td>
                    {/* Date */}
                    <td style={{ padding:"13px 16px", color:MUTED, fontSize:11 }}>
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "—"}
                    </td>
                    {/* Action */}
                    <td style={{ padding:"13px 16px" }}>
                      <button onClick={()=>setStatusModal(c)} style={{ padding:"5px 12px", borderRadius:8, border:`1.5px solid ${PURPLE}`, background:"transparent", fontSize:11, fontWeight:700, color:PURPLE, cursor:"pointer" }}>
                        Update →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── CARD VIEW ── */}
      {activeView === "card" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
          {filtered.length === 0 && (
            <div style={{ gridColumn:"1/-1", padding:"3rem", textAlign:"center", color:MUTED, background:"#fff", borderRadius:16 }}>
              <div style={{ fontSize:32, marginBottom:8 }}>🔍</div>
              <div style={{ fontWeight:600 }}>No clients found</div>
            </div>
          )}
          {filtered.map((c)=>{
            const sc = cfg(c.status);
            return (
              <div key={c._id} className="client-card" style={{ background:"#fff", borderRadius:18, border:"1px solid #F1F0FF", overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ height:4, background:`linear-gradient(90deg,${sc.color},${PURPLE})` }}/>
                <div style={{ padding:"18px 20px" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:12 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:42, height:42, borderRadius:12, background:`linear-gradient(135deg,${sc.color}30,${sc.color}60)`, border:`1.5px solid ${sc.color}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:800, color:sc.color }}>
                        {(c.name||"?")[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight:700, color:DTEXT, fontSize:14 }}>{c.name||"—"}</div>
                        <div style={{ fontSize:11, color:MUTED, marginTop:2 }}>{c.phone||"—"}</div>
                      </div>
                    </div>
                    <span style={{ background:sc.bg, color:sc.color, border:`1px solid ${sc.color}30`, borderRadius:20, padding:"3px 9px", fontSize:10, fontWeight:700 }}>{sc.label}</span>
                  </div>

                  {/* Pipeline bar */}
                  <div style={{ marginBottom:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:MUTED, marginBottom:5 }}>
                      <span>Pipeline Progress</span>
                      <span style={{ fontWeight:600, color:sc.color }}>{sc.label}</span>
                    </div>
                    <PipelineBar status={c.status}/>
                  </div>

                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
                    {[
                      { label:"Agent",      value:agentName(c.agentId) },
                      { label:"Loan Value", value:formatAED(c.loanAmount) },
                      { label:"Referral",   value:c.referralType||"—" },
                      { label:"Created",    value:c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-GB",{month:"short",year:"numeric"}) : "—" },
                    ].map((item,i)=>(
                      <div key={i} style={{ background:"#FAFAFA", borderRadius:8, padding:"8px 10px" }}>
                        <div style={{ fontSize:10, color:MUTED, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:2 }}>{item.label}</div>
                        <div style={{ fontSize:12, fontWeight:700, color:DTEXT }}>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  <button onClick={()=>setStatusModal(c)} style={{ width:"100%", padding:"9px", borderRadius:10, border:`1.5px solid ${PURPLE}`, background:"transparent", color:PURPLE, fontSize:13, fontWeight:700, cursor:"pointer", transition:"all 0.15s" }}
                    onMouseEnter={e=>{e.target.style.background=PURPLE;e.target.style.color="#fff";}}
                    onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.color=PURPLE;}}>
                    Update Status →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── STATUS MODAL ── */}
      {statusModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, backdropFilter:"blur(4px)" }}>
          <div style={{ background:"#fff", borderRadius:20, padding:"1.75rem", width:400, maxWidth:"90vw", boxShadow:"0 32px 80px rgba(0,0,0,0.25)" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <div>
                <div style={{ fontWeight:800, fontSize:16, color:DTEXT, fontFamily:"'Syne',sans-serif" }}>Update Status</div>
                <div style={{ fontSize:12, color:MUTED, marginTop:2 }}>{statusModal.name} · {statusModal.phone}</div>
              </div>
              <span style={{ ...{ background:cfg(statusModal.status).bg, color:cfg(statusModal.status).color, borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:700 } }}>{cfg(statusModal.status).label}</span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:5, maxHeight:320, overflowY:"auto", paddingRight:4 }}>
              {CLIENT_STATUSES.map(s=>{
                const sc = cfg(s);
                const isCurrent = s === statusModal.status;
                return (
                  <div key={s} className="status-option" onClick={()=>setStatusModal(null)}
                    style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", borderRadius:10, border:`1.5px solid ${isCurrent ? sc.color : "#F1F0FF"}`, background:isCurrent ? sc.bg : "#fff", cursor:"pointer" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:sc.color }}/>
                      <span style={{ fontSize:13, fontWeight:isCurrent?700:500, color:isCurrent?sc.color:DTEXT }}>{sc.label}</span>
                    </div>
                    {isCurrent && <span style={{ fontSize:10, fontWeight:700, color:sc.color }}>CURRENT</span>}
                  </div>
                );
              })}
            </div>
            <button onClick={()=>setStatusModal(null)} style={{ marginTop:14, width:"100%", padding:10, borderRadius:10, border:"1px solid #E5E7EB", background:"#fff", color:MUTED, cursor:"pointer", fontSize:13, fontWeight:500 }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}