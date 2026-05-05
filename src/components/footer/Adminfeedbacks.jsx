import React, { useState, useEffect, useRef } from "react";
import { apiService } from "../../manageApi/utils/custom.apiservice";

/* ─── Design Tokens ─────────────────────────────────────── */
const C = {
  brand:       "#4F0B8A",
  brandLight:  "#7C3FC1",
  brandFaint:  "#F3EEFF",
  surface:     "#FFFFFF",
  bg:          "#F7F5FB",
  border:      "#EAE4F5",
  text:        "#0F0B1E",
  sub:         "#6B7280",
  muted:       "#A78BCA",
  red:         "#DC2626",
  redFaint:    "#FEF2F2",
  green:       "#059669",
  greenFaint:  "#F0FDF4",
  amber:       "#D97706",
  amberFaint:  "#FFFBEB",
  indigo:      "#4F46E5",
  indigoFaint: "#EEF2FF",
  pink:        "#DB2777",
  pinkFaint:   "#FDF2F8",
};

/* ─── Helpers ─────────────────────────────────────────────── */
const TYPE_META = {
  general_feedback: { label: "General",    color: C.indigo, bg: C.indigoFaint },
  bug_report:       { label: "Bug",        color: C.red,    bg: C.redFaint    },
  feature_request:  { label: "Feature",    color: C.amber,  bg: C.amberFaint  },
  complaint:        { label: "Complaint",  color: C.pink,   bg: C.pinkFaint   },
  compliment:       { label: "Compliment", color: C.green,  bg: C.greenFaint  },
};

function fmt(dateStr, includeTime = false) {
  const d = new Date(dateStr);
  if (includeTime)
    return d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function initials(name = "") {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?";
}

/* ─── Sub-components ──────────────────────────────────────── */
function Badge({ type }) {
  const m = TYPE_META[type] || { label: type, color: C.sub, bg: C.bg };
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: "4px",
      fontSize: "11px",
      fontWeight: 700,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      color: m.color,
      background: m.bg,
      border: `1px solid ${m.color}22`,
    }}>{m.label}</span>
  );
}

function Stars({ value = 0 }) {
  return (
    <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
      {[1,2,3,4,5].map(n => (
        <svg key={n} width="13" height="13" viewBox="0 0 24 24"
          fill={n <= value ? C.brand : "#E5E7EB"}
          stroke={n <= value ? C.brand : "#D1D5DB"}
          strokeWidth="1.5">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
        </svg>
      ))}
      <span style={{ fontSize: "11px", color: C.sub, marginLeft: "4px", fontWeight: 600 }}>{value}/5</span>
    </div>
  );
}

function Avatar({ name, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "8px",
      background: `linear-gradient(135deg, ${C.brand}, ${C.brandLight})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, color: "white",
      fontSize: size * 0.36, fontWeight: 700,
      letterSpacing: "-0.02em",
    }}>{initials(name)}</div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: "12px",
      padding: "18px 22px",
      display: "flex", alignItems: "center", gap: "14px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    }}>
      <div style={{
        width: "40px", height: "40px", borderRadius: "10px",
        background: color + "14",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon size={18} color={color} />
      </div>
      <div>
        <p style={{ fontSize: "22px", fontWeight: 800, color: C.text, margin: 0, lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: "11px", color: C.sub, margin: "4px 0 0", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
      </div>
    </div>
  );
}

/* ─── SVG Icons (no emoji) ────────────────────────────────── */
const Icon = {
  refresh: (p) => <svg width={p.size||16} height={p.size||16} fill="none" stroke={p.color||"currentColor"} strokeWidth="2.2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  search:  (p) => <svg width={p.size||14} height={p.size||14} fill="none" stroke={p.color||"currentColor"} strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  close:   (p) => <svg width={p.size||16} height={p.size||16} fill="none" stroke={p.color||"currentColor"} strokeWidth="2.2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  trash:   (p) => <svg width={p.size||14} height={p.size||14} fill="none" stroke={p.color||"currentColor"} strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  eye:     (p) => <svg width={p.size||14} height={p.size||14} fill="none" stroke={p.color||"currentColor"} strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  chat:    (p) => <svg width={p.size||18} height={p.size||18} fill="none" stroke={p.color||"currentColor"} strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  list:    (p) => <svg width={p.size||18} height={p.size||18} fill="none" stroke={p.color||"currentColor"} strokeWidth="2" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  star:    (p) => <svg width={p.size||18} height={p.size||18} fill="none" stroke={p.color||"currentColor"} strokeWidth="2" viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>,
  bug:     (p) => <svg width={p.size||18} height={p.size||18} fill="none" stroke={p.color||"currentColor"} strokeWidth="2" viewBox="0 0 24 24"><path d="M8 2l1.88 1.88"/><path d="M14.12 3.88 16 2"/><circle cx="12" cy="11" r="4"/><path d="M20 11h2"/><path d="M2 11h2"/><path d="M18.93 7.93l1.41-1.41"/><path d="M3.66 6.52l1.41 1.41"/><path d="M14 15.13 16 21"/><path d="M10 15.13 8 21"/></svg>,
  feature: (p) => <svg width={p.size||18} height={p.size||18} fill="none" stroke={p.color||"currentColor"} strokeWidth="2" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  check:   (p) => <svg width={p.size||14} height={p.size||14} fill="none" stroke={p.color||"currentColor"} strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
  x:       (p) => <svg width={p.size||14} height={p.size||14} fill="none" stroke={p.color||"currentColor"} strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  calendar:(p) => <svg width={p.size||14} height={p.size||14} fill="none" stroke={p.color||"currentColor"} strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  mail:    (p) => <svg width={p.size||14} height={p.size||14} fill="none" stroke={p.color||"currentColor"} strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  page:    (p) => <svg width={p.size||14} height={p.size||14} fill="none" stroke={p.color||"currentColor"} strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  shield:  (p) => <svg width={p.size||14} height={p.size||14} fill="none" stroke={p.color||"currentColor"} strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  compliment:(p)=><svg width={p.size||18} height={p.size||18} fill="none" stroke={p.color||"currentColor"} strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
};

/* ─── Detail Sidebar ──────────────────────────────────────── */
function DetailSidebar({ fb, onClose, onDelete, deleting }) {
  const overlayRef = useRef();
  if (!fb) return null;

  const meta = TYPE_META[fb.feedback_type] || { label: fb.feedback_type, color: C.sub, bg: C.bg };

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(15,11,30,0.35)",
          backdropFilter: "blur(2px)",
          zIndex: 40,
          animation: "fadeIn 0.2s ease",
        }}
      />

      {/* Panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "clamp(340px, 38vw, 520px)",
        background: C.surface,
        boxShadow: "-8px 0 40px rgba(79,11,138,0.12)",
        zIndex: 50,
        display: "flex", flexDirection: "column",
        animation: "slideIn 0.25s cubic-bezier(0.16,1,0.3,1)",
        fontFamily: "inherit",
      }}>

        {/* Panel Header */}
        <div style={{
          padding: "20px 24px",
          borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "8px",
              background: C.brandFaint,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon.chat size={15} color={C.brand} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: C.text }}>Feedback Detail</p>
           
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

            <button
              onClick={onClose}
              style={{
                width: "32px", height: "32px",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: C.bg, border: `1px solid ${C.border}`,
                borderRadius: "8px", cursor: "pointer",
              }}
            >
              <Icon.close size={16} color={C.sub} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>

          {/* User Card */}
          <div style={{
            display: "flex", alignItems: "center", gap: "14px",
            padding: "16px", borderRadius: "10px",
            background: C.brandFaint,
            border: `1px solid ${C.brand}18`,
            marginBottom: "20px",
          }}>
            <Avatar name={fb.full_name} size={48} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: C.text }}>{fb.full_name}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "3px" }}>
                <Icon.mail size={12} color={C.sub} />
                <p style={{ margin: 0, fontSize: "12px", color: C.sub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fb.email}</p>
              </div>
            </div>
          </div>

          {/* Rating + Type row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
            <div style={{
              padding: "14px", borderRadius: "10px",
              background: C.bg, border: `1px solid ${C.border}`,
            }}>
              <p style={{ margin: "0 0 8px", fontSize: "10px", fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Rating</p>
              <Stars value={fb.overall_experience} />
            </div>
            <div style={{
              padding: "14px", borderRadius: "10px",
              background: C.bg, border: `1px solid ${C.border}`,
            }}>
              <p style={{ margin: "0 0 8px", fontSize: "10px", fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Type</p>
              <Badge type={fb.feedback_type} />
            </div>
          </div>

          {/* Feedback Text */}
          <div style={{ marginBottom: "20px" }}>
            <p style={{ margin: "0 0 8px", fontSize: "10px", fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Feedback Message</p>
            <div style={{
              padding: "14px 16px",
              background: C.bg,
              border: `1px solid ${C.border}`,
              borderRadius: "10px",
              fontSize: "13px", color: C.text,
              lineHeight: 1.75,
            }}>
              {fb.feedback_text || <span style={{ color: C.sub, fontStyle: "italic" }}>No message provided</span>}
            </div>
          </div>

          {/* Meta fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

            {fb.page_or_feature && (
              <MetaRow icon={<Icon.page size={13} color={C.brand} />} label="Page / Feature" value={fb.page_or_feature} />
            )}

            <MetaRow
              icon={<Icon.calendar size={13} color={C.brand} />}
              label="Submitted"
              value={fmt(fb.createdAt, true)}
            />

            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 14px",
              background: C.bg,
              border: `1px solid ${C.border}`,
              borderRadius: "10px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "7px",
                  background: C.brandFaint,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon.shield size={13} color={C.brand} />
                </div>
                <p style={{ margin: 0, fontSize: "12px", fontWeight: 600, color: C.text }}>Agreed to Terms</p>
              </div>
              {fb.agreed_to_terms ? (
                <span style={{
                  display: "flex", alignItems: "center", gap: "4px",
                  padding: "4px 10px", borderRadius: "6px",
                  background: C.greenFaint, color: C.green,
                  fontSize: "11px", fontWeight: 700,
                }}>
                  <Icon.check size={11} color={C.green} /> Yes
                </span>
              ) : (
                <span style={{
                  display: "flex", alignItems: "center", gap: "4px",
                  padding: "4px 10px", borderRadius: "6px",
                  background: C.redFaint, color: C.red,
                  fontSize: "11px", fontWeight: 700,
                }}>
                  <Icon.x size={11} color={C.red} /> No
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </>
  );
}

function MetaRow({ icon, label, value }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: "10px",
      padding: "12px 14px",
      background: C.bg,
      border: `1px solid ${C.border}`,
      borderRadius: "10px",
    }}>
      <div style={{
        width: "28px", height: "28px", borderRadius: "7px",
        background: C.brandFaint, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginTop: "1px",
      }}>{icon}</div>
      <div>
        <p style={{ margin: "0 0 2px", fontSize: "10px", fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
        <p style={{ margin: 0, fontSize: "13px", fontWeight: 500, color: C.text }}>{value}</p>
      </div>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────── */
const LIMIT = 10;

export default function AdminFeedbacks() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState("");
  const [filterRating, setFilterRating] = useState("");
  const [sort, setSort]           = useState("newest");
  const [search, setSearch]       = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selected, setSelected]   = useState(null); // sidebar
  const [deleting, setDeleting]   = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page, limit: LIMIT, sort,
        ...(filterType   && { feedback_type: filterType }),
        ...(filterRating && { overall_experience: filterRating }),
      });
      const res = await apiService.get(`/feedback/all?${params}`);
      if (res.success) {
        let data = res.data || [];
        if (search.trim()) {
          const q = search.toLowerCase();
          data = data.filter(f =>
            f.full_name?.toLowerCase().includes(q) ||
            f.email?.toLowerCase().includes(q) ||
            f.feedback_text?.toLowerCase().includes(q)
          );
        }
        setFeedbacks(data);
        setTotal(res.total || data.length);
        setTotalPages(res.totalPages || Math.ceil((res.total || data.length) / LIMIT));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFeedbacks(); }, [page, filterType, filterRating, sort, search]);

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this feedback?")) return;
    setDeleting(id);
    try {
      await apiService.delete(`/feedback/${id}`);
      setFeedbacks(prev => prev.filter(f => f._id !== id));
      setTotal(t => t - 1);
      if (selected?._id === id) setSelected(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const avgRating = feedbacks.length
    ? (feedbacks.reduce((s, f) => s + (f.overall_experience || 0), 0) / feedbacks.length).toFixed(1)
    : "—";

  const countByType = (t) => feedbacks.filter(f => f.feedback_type === t).length;

  const activeFilters = !!(filterType || filterRating || search);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>

      {/* ── Header ── */}
      <div style={{
        background: C.surface,
        borderBottom: `1px solid ${C.border}`,
        padding: "0 32px",
        height: "60px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 20,
        boxShadow: "0 1px 0 #EAE4F5",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px",
            background: C.brand,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon.chat size={15} color="white" />
          </div>
          <span style={{ fontSize: "15px", fontWeight: 700, color: C.text }}>Feedback</span>
          <span style={{
            padding: "2px 8px", borderRadius: "5px",
            background: C.brandFaint, color: C.brand,
            fontSize: "11px", fontWeight: 700,
          }}>{total}</span>
        </div>

        <button
          onClick={fetchFeedbacks}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "8px 16px",
            background: C.brand, color: "white",
            border: "none", borderRadius: "8px",
            fontSize: "12px", fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <Icon.refresh size={13} color="white" />
          Refresh
        </button>
      </div>

      <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "28px 24px" }}>

        {/* ── Stats ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: "12px", marginBottom: "24px",
        }}>
          <StatCard label="Total"       value={total}                          icon={Icon.list}       color={C.brand}  />
          <StatCard label="Avg Rating"  value={avgRating}                      icon={Icon.star}       color={C.amber}  />
          <StatCard label="Bug Reports" value={countByType("bug_report")}      icon={Icon.bug}        color={C.red}    />
          <StatCard label="Features"    value={countByType("feature_request")} icon={Icon.feature}    color={C.indigo} />
          <StatCard label="Compliments" value={countByType("compliment")}      icon={Icon.compliment} color={C.green}  />
        </div>

        {/* ── Filters ── */}
        <div style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: "12px",
          padding: "14px 18px",
          marginBottom: "16px",
          display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center",
        }}>
          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 220px" }}>
            <span style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <Icon.search size={13} color={C.sub} />
            </span>
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }}
              placeholder="Search name, email, message… (Enter)"
              style={{
                width: "100%", padding: "9px 12px 9px 32px",
                border: `1.5px solid ${C.border}`,
                borderRadius: "8px", fontSize: "13px",
                color: C.text, outline: "none",
                boxSizing: "border-box",
                background: C.bg,
              }}
            />
          </div>

          <SelectFilter
            value={filterType}
            onChange={v => { setFilterType(v); setPage(1); }}
            options={[
              { value: "", label: "All Types" },
              { value: "general_feedback", label: "General" },
              { value: "bug_report", label: "Bug Report" },
              { value: "feature_request", label: "Feature Request" },
              { value: "complaint", label: "Complaint" },
              { value: "compliment", label: "Compliment" },
            ]}
          />

          <SelectFilter
            value={filterRating}
            onChange={v => { setFilterRating(v); setPage(1); }}
            options={[
              { value: "", label: "All Ratings" },
              ...[5,4,3,2,1].map(n => ({ value: n, label: `${n} Star${n !== 1 ? "s" : ""}` })),
            ]}
          />

          <SelectFilter
            value={sort}
            onChange={v => { setSort(v); setPage(1); }}
            options={[
              { value: "newest", label: "Newest First" },
              { value: "oldest", label: "Oldest First" },
            ]}
          />

          {activeFilters && (
            <button
              onClick={() => { setFilterType(""); setFilterRating(""); setSearch(""); setSearchInput(""); setPage(1); }}
              style={{
                padding: "9px 14px",
                background: C.redFaint, color: C.red,
                border: `1px solid ${C.red}22`,
                borderRadius: "8px", fontSize: "12px", fontWeight: 600,
                cursor: "pointer", whiteSpace: "nowrap",
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* ── Table ── */}
        <div style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 1px 8px rgba(79,11,138,0.05)",
        }}>

          {/* Table Head */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "minmax(160px,2fr) minmax(200px,3fr) 110px 130px 110px 90px",
            padding: "11px 20px",
            background: C.bg,
            borderBottom: `1px solid ${C.border}`,
          }}>
            {["User", "Feedback", "Type", "Rating", "Date", ""].map((h, i) => (
              <span key={i} style={{ fontSize: "10px", fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</span>
            ))}
          </div>

          {/* Body */}
          {loading ? (
            <div style={{ padding: "64px", textAlign: "center" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%",
                border: `3px solid ${C.border}`,
                borderTopColor: C.brand,
                animation: "spin 0.7s linear infinite",
                margin: "0 auto",
              }} />
              <p style={{ color: C.sub, fontSize: "13px", marginTop: "14px" }}>Loading feedbacks…</p>
            </div>
          ) : feedbacks.length === 0 ? (
            <div style={{ padding: "64px", textAlign: "center" }}>
              <div style={{
                width: "48px", height: "48px", borderRadius: "12px",
                background: C.brandFaint,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 14px",
              }}>
                <Icon.chat size={22} color={C.brand} />
              </div>
              <p style={{ color: C.sub, fontSize: "14px", fontWeight: 500, margin: 0 }}>No feedbacks found</p>
              {activeFilters && (
                <p style={{ color: C.muted, fontSize: "12px", marginTop: "6px" }}>Try adjusting your filters</p>
              )}
            </div>
          ) : (
            feedbacks.map((fb, idx) => (
              <div
                key={fb._id}
                onMouseEnter={() => setHoveredRow(fb._id)}
                onMouseLeave={() => setHoveredRow(null)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(160px,2fr) minmax(200px,3fr) 110px 130px 110px 90px",
                  padding: "14px 20px",
                  borderBottom: idx < feedbacks.length - 1 ? `1px solid ${C.border}` : "none",
                  alignItems: "center",
                  background: selected?._id === fb._id ? C.brandFaint : hoveredRow === fb._id ? C.bg : C.surface,
                  transition: "background 0.12s",
                  borderLeft: selected?._id === fb._id ? `3px solid ${C.brand}` : "3px solid transparent",
                }}
              >
                {/* User */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Avatar name={fb.full_name} size={32} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fb.full_name}</p>
                    <p style={{ margin: 0, fontSize: "11px", color: C.sub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fb.email}</p>
                  </div>
                </div>

                {/* Feedback preview */}
                <p style={{ margin: 0, fontSize: "12px", color: C.sub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingRight: "12px" }}>
                  {fb.feedback_text}
                </p>

                {/* Type */}
                <div><Badge type={fb.feedback_type} /></div>

                {/* Rating */}
                <Stars value={fb.overall_experience} />

                {/* Date */}
                <p style={{ margin: 0, fontSize: "12px", color: C.sub }}>{fmt(fb.createdAt)}</p>

                {/* Actions */}
                <div style={{ display: "flex", gap: "6px" }}>
                  <ActionBtn
                    onClick={() => setSelected(fb)}
                    title="View"
                    bg={C.brandFaint}
                    color={C.brand}
                    icon={<Icon.eye size={13} color={C.brand} />}
                  />
                  {/* <ActionBtn
                    onClick={() => handleDelete(fb._id)}
                    title=""
                    bg={C.redFaint}
                    color={C.red}
                    icon={deleting === fb._id ? <Spinner /> : <Icon.trash size={13} color={C.red} />}
                    disabled={deleting === fb._id}
                  /> */}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "6px", marginTop: "24px" }}>
            <PageBtn onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} label="← Prev" />
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
              .reduce((acc, n, idx, arr) => {
                if (idx > 0 && n - arr[idx - 1] > 1) acc.push("...");
                acc.push(n);
                return acc;
              }, [])
              .map((item, idx) => item === "..." ? (
                <span key={`d-${idx}`} style={{ color: C.sub, padding: "0 2px" }}>…</span>
              ) : (
                <PageBtn key={item} onClick={() => setPage(item)} active={page === item} label={item} />
              ))
            }
            <PageBtn onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} label="Next →" />
          </div>
        )}
      </div>

      {/* ── Sidebar ── */}
      <DetailSidebar
        fb={selected}
        onClose={() => setSelected(null)}
        onDelete={handleDelete}
        deleting={deleting}
      />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        input::placeholder { color: #A78BCA; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #DDD6FE; border-radius: 99px; }
      `}</style>
    </div>
  );
}

/* ─── Tiny shared bits ──────────────────────────────────────── */
function ActionBtn({ onClick, icon, bg, color, disabled, title }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        width: "30px", height: "30px",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: bg, color,
        border: "none", borderRadius: "7px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        flexShrink: 0,
      }}
    >
      {icon}
    </button>
  );
}

function SelectFilter({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        padding: "9px 32px 9px 12px",
        border: `1.5px solid ${C.border}`,
        borderRadius: "8px", fontSize: "13px",
        color: C.text, outline: "none",
        cursor: "pointer",
        background: `${C.bg} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 10px center`,
        appearance: "none",
      }}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function PageBtn({ onClick, disabled, active, label }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        minWidth: "36px", height: "36px", padding: "0 10px",
        background: active ? C.brand : C.surface,
        color: active ? "white" : disabled ? C.muted : C.brand,
        border: `1.5px solid ${active ? C.brand : C.border}`,
        borderRadius: "8px", fontSize: "12px", fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {label}
    </button>
  );
}

function Spinner() {
  return (
    <div style={{
      width: "12px", height: "12px",
      border: "2px solid #fca5a5",
      borderTopColor: C.red,
      borderRadius: "50%",
      animation: "spin 0.6s linear infinite",
    }} />
  );
}