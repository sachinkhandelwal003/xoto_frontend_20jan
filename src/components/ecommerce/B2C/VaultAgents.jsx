import React, { useState } from "react";

const PURPLE = "#5C039B";
const PURPLE_LIGHT = "#7B2FBE";
const GREEN = "#22C55E";
const CYAN = "#06B6D4";
const RED = "#EF4444";
const AMBER = "#F59E0B";
const MUTED = "#6B7280";
const DTEXT = "#0F172A";
const BG = "#F8F7FF";

const mockAgents = [
  { _id: "1", name: { first_name: "Ahmed", last_name: "Al Mansoori" }, phone: { number: "501234567" }, email: "ahmed@example.com", agentType: "FreelanceAgent", partnerId: null, totalLeads: 12, createdAt: "2025-01-15T10:00:00Z", isActive: true },
  { _id: "2", name: { first_name: "Fatima", last_name: "Hassan" }, phone: { number: "559876543" }, email: "fatima@example.com", agentType: "PartnerAffiliatedAgent", partnerId: { companyName: "Dubai Properties" }, totalLeads: 8, createdAt: "2025-02-20T14:30:00Z", isActive: true },
  { _id: "3", name: { first_name: "Mohammed", last_name: "Al Rashidi" }, phone: { number: "562223333" }, email: "mohammed@example.com", agentType: "FreelanceAgent", partnerId: null, totalLeads: 5, createdAt: "2025-03-10T09:15:00Z", isActive: false },
  { _id: "4", name: { first_name: "Layla", last_name: "Mahmoud" }, phone: { number: "504445555" }, email: "layla@example.com", agentType: "PartnerAffiliatedAgent", partnerId: { companyName: "Emaar Properties" }, totalLeads: 15, createdAt: "2025-01-05T11:20:00Z", isActive: true },
  { _id: "5", name: { first_name: "Khalid", last_name: "Al Suwaidi" }, phone: { number: "521112222" }, email: "khalid@example.com", agentType: "FreelanceAgent", partnerId: null, totalLeads: 22, createdAt: "2024-12-01T08:00:00Z", isActive: true },
];

const fullName = (a) => `${a.name?.first_name || ""} ${a.name?.last_name || ""}`.trim() || "—";
const initials = (a) => `${(a.name?.first_name || "?")[0]}${(a.name?.last_name || "")[0] || ""}`.toUpperCase();

const avatarGradients = [
  "linear-gradient(135deg,#5C039B,#06B6D4)",
  "linear-gradient(135deg,#7B2FBE,#22C55E)",
  "linear-gradient(135deg,#06B6D4,#5C039B)",
  "linear-gradient(135deg,#F59E0B,#EF4444)",
  "linear-gradient(135deg,#22C55E,#06B6D4)",
];

export default function VaultAgents() {
  const [search, setSearch]     = useState("");
  const [typeFilter, setType]   = useState("All");
  const [viewMode, setViewMode] = useState("table"); // "table" | "card"
  const agents = mockAgents;

  const filtered = agents.filter(a => {
    const name = fullName(a).toLowerCase();
    const matchSearch = name.includes(search.toLowerCase()) ||
      (a.phone?.number || "").includes(search) ||
      (a.email || "").toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All" || a.agentType === typeFilter;
    return matchSearch && matchType;
  });

  const total     = agents.length;
  const active    = agents.filter(a => a.isActive).length;
  const suspended = agents.filter(a => !a.isActive).length;
  const freelance = agents.filter(a => a.agentType === "FreelanceAgent").length;

  return (
    <div style={{ padding: "2rem", background: BG, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        .agent-row { transition: background 0.15s, transform 0.15s; }
        .agent-row:hover { background: #faf8ff !important; }
        .agent-card-item { transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1); }
        .agent-card-item:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(92,3,155,0.12) !important; }
        .filter-btn { transition: all 0.15s; cursor: pointer; }
        .filter-btn:hover { opacity: 0.85; }
        .view-btn { transition: all 0.15s; cursor: pointer; border: none; }
        .view-btn:hover { opacity: 0.8; }
        input:focus { border-color: #5C039B !important; box-shadow: 0 0 0 3px rgba(92,3,155,0.08); }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg,${PURPLE},${CYAN})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, color: DTEXT, margin: 0, letterSpacing: "-0.5px" }}>Agents</h1>
          </div>
          <p style={{ color: MUTED, fontSize: 13, margin: 0 }}>Manage freelance and affiliated agents on the Vault platform</p>
        </div>

        {/* View toggle */}
        <div style={{ display: "flex", gap: 6, background: "#fff", padding: 4, borderRadius: 10, border: "1px solid #E5E7EB" }}>
          {[["table","☰"],["card","⊞"]].map(([mode, icon]) => (
            <button key={mode} className="view-btn" onClick={() => setViewMode(mode)} style={{
              padding: "6px 14px", borderRadius: 7, fontSize: 14,
              background: viewMode === mode ? PURPLE : "transparent",
              color: viewMode === mode ? "#fff" : MUTED,
              fontWeight: viewMode === mode ? 700 : 400,
            }}>{icon} {mode === "table" ? "Table" : "Cards"}</button>
          ))}
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: "1.75rem" }}>
        {[
          { label: "Total Agents",  value: total,     accent: PURPLE, icon: "👥", bg: "#F3E8FF" },
          { label: "Active",        value: active,    accent: GREEN,  icon: "✅", bg: "#DCFCE7" },
          { label: "Suspended",     value: suspended, accent: RED,    icon: "⛔", bg: "#FEE2E2" },
          { label: "Freelancers",   value: freelance, accent: CYAN,   icon: "🆓", bg: "#CFFAFE" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", border: "1px solid #F1F0FF", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.accent, lineHeight: 1, fontFamily: "'Syne',sans-serif" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: MUTED, marginTop: 3, fontWeight: 500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F1F0FF", padding: "14px 18px", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <svg width="14" height="14" fill="none" stroke={MUTED} strokeWidth="2" viewBox="0 0 24 24" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input placeholder="Search by name, phone or email..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", paddingLeft: 34, paddingRight: 14, paddingTop: 9, paddingBottom: 9, border: "1px solid #E5E7EB", borderRadius: 10, fontSize: 13, outline: "none", boxSizing: "border-box", transition: "all 0.15s", fontFamily: "'DM Sans',sans-serif" }}
          />
        </div>

        {/* Type filter pills */}
        <div style={{ display: "flex", gap: 6 }}>
          {["All", "FreelanceAgent", "PartnerAffiliatedAgent"].map(t => (
            <button key={t} className="filter-btn" onClick={() => setType(t)} style={{
              padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, border: "1.5px solid",
              borderColor: typeFilter === t ? PURPLE : "#E5E7EB",
              background: typeFilter === t ? PURPLE : "#fff",
              color: typeFilter === t ? "#fff" : MUTED,
              fontFamily: "'DM Sans',sans-serif",
            }}>
              {t === "All" ? "All Types" : t === "FreelanceAgent" ? "Freelance" : "Partner Affiliated"}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: "auto", fontSize: 12, color: MUTED, fontWeight: 500 }}>
          {filtered.length} of {total} agents
        </div>
      </div>

      {/* ── TABLE VIEW ── */}
      {viewMode === "table" && (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F1F0FF", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "linear-gradient(90deg,#faf8ff,#f8f7ff)", borderBottom: "2px solid #F1F0FF" }}>
                {["Agent","Contact","Type","Partner","Leads","Joined","Status",""].map((h,i) => (
                  <th key={i} style={{ padding: "13px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ padding: "3rem", textAlign: "center", color: MUTED }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
                  <div style={{ fontWeight: 600 }}>No agents found</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>Try adjusting your search or filters</div>
                </td></tr>
              )}
              {filtered.map((a, idx) => (
                <tr key={a._id} className="agent-row" style={{ borderBottom: "1px solid #F8F7FF" }}>
                  {/* Agent */}
                  <td style={{ padding: "13px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: avatarGradients[idx % 5], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0, letterSpacing: 0.5 }}>
                        {initials(a)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: DTEXT }}>{fullName(a)}</div>
                        <div style={{ fontSize: 11, color: MUTED, marginTop: 1 }}>{a.email || "—"}</div>
                      </div>
                    </div>
                  </td>
                  {/* Contact */}
                  <td style={{ padding: "13px 16px", color: MUTED, fontSize: 12 }}>+971 {a.phone?.number || "—"}</td>
                  {/* Type */}
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{
                      background: a.agentType === "FreelanceAgent" ? "#EFF6FF" : "#F3E8FF",
                      color: a.agentType === "FreelanceAgent" ? "#3B82F6" : PURPLE,
                      border: `1px solid ${a.agentType === "FreelanceAgent" ? "#BFDBFE" : "#DDD6FE"}`,
                      borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600,
                    }}>
                      {a.agentType === "FreelanceAgent" ? "Freelance" : "Partner Affiliated"}
                    </span>
                  </td>
                  {/* Partner */}
                  <td style={{ padding: "13px 16px", color: MUTED, fontSize: 12 }}>{a.partnerId?.companyName || "—"}</td>
                  {/* Leads */}
                  <td style={{ padding: "13px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: `${CYAN}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: CYAN }}>{a.totalLeads || 0}</div>
                    </div>
                  </td>
                  {/* Joined */}
                  <td style={{ padding: "13px 16px", color: MUTED, fontSize: 11 }}>
                    {a.createdAt ? new Date(a.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                  </td>
                  {/* Status */}
                  <td style={{ padding: "13px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: a.isActive ? GREEN : RED, boxShadow: `0 0 6px ${a.isActive ? GREEN : RED}` }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: a.isActive ? GREEN : RED }}>{a.isActive ? "Active" : "Suspended"}</span>
                    </div>
                  </td>
                  {/* Action */}
                  <td style={{ padding: "13px 16px" }}>
                    <button style={{ padding: "5px 12px", borderRadius: 8, border: `1px solid #E5E7EB`, background: "#fff", fontSize: 11, fontWeight: 600, color: MUTED, cursor: "pointer" }}>
                      View →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── CARD VIEW ── */}
      {viewMode === "card" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
          {filtered.length === 0 && (
            <div style={{ gridColumn: "1/-1", padding: "3rem", textAlign: "center", color: MUTED, background: "#fff", borderRadius: 16, border: "1px solid #F1F0FF" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
              <div style={{ fontWeight: 600 }}>No agents found</div>
            </div>
          )}
          {filtered.map((a, idx) => (
            <div key={a._id} className="agent-card-item" style={{ background: "#fff", borderRadius: 18, border: "1px solid #F1F0FF", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              {/* Card top accent */}
              <div style={{ height: 5, background: avatarGradients[idx % 5] }} />
              <div style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 46, height: 46, borderRadius: 14, background: avatarGradients[idx % 5], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff" }}>
                      {initials(a)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: DTEXT, fontSize: 14 }}>{fullName(a)}</div>
                      <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{a.email || "—"}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: a.isActive ? GREEN : RED, boxShadow: `0 0 6px ${a.isActive ? GREEN : RED}` }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: a.isActive ? GREEN : RED }}>{a.isActive ? "Active" : "Suspended"}</span>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                  {[
                    { label: "Phone", value: `+971 ${a.phone?.number || "—"}` },
                    { label: "Leads", value: a.totalLeads || 0 },
                    { label: "Type", value: a.agentType === "FreelanceAgent" ? "Freelance" : "Affiliated" },
                    { label: "Joined", value: a.createdAt ? new Date(a.createdAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "—" },
                  ].map((item, i) => (
                    <div key={i} style={{ background: "#FAFAFA", borderRadius: 8, padding: "8px 10px" }}>
                      <div style={{ fontSize: 10, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>{item.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: DTEXT }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                {a.partnerId && (
                  <div style={{ background: "#F3E8FF", borderRadius: 8, padding: "7px 10px", marginBottom: 12, fontSize: 12, color: PURPLE, fontWeight: 600 }}>
                    🏢 {a.partnerId.companyName}
                  </div>
                )}

                <button style={{ width: "100%", padding: "9px", borderRadius: 10, border: `1.5px solid ${PURPLE}`, background: "transparent", color: PURPLE, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}
                  onMouseEnter={e => { e.target.style.background = PURPLE; e.target.style.color = "#fff"; }}
                  onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = PURPLE; }}>
                  View Profile →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}