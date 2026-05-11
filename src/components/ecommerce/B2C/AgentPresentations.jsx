import React, { useState, useEffect, useCallback } from "react";
import {
  Card, Table, Button, Tag, Space, Modal, Input, Select,
  message, Tooltip, Drawer, Divider, Typography, Row, Col,
  Statistic, Spin, Alert, Popconfirm,
} from "antd";
import {
  PlusOutlined, ThunderboltOutlined, ShareAltOutlined,
  EyeOutlined, EditOutlined, DeleteOutlined, CopyOutlined,
  FilePdfOutlined, WhatsAppOutlined, MailOutlined,
  CheckCircleOutlined, ClockCircleOutlined, BarChartOutlined,
  SettingOutlined, ExperimentOutlined, ArrowLeftOutlined,
  LinkOutlined, ReloadOutlined,
} from "@ant-design/icons";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;
const { Option } = Select;

// ── Theme ─────────────────────────────────────────────────────────────────────
const T = {
  primary:    "#5C039B",
  success:    "#10b981",
  warning:    "#d97706",
  error:      "#ef4444",
  info:       "#3b82f6",
  bg:         "#f8f9fa",
  border:     "#f0f0f0",
  text:       "#1f2937",
  muted:      "#9ca3af",
  xotoPurple: "#7F77DD",
  xotoGreen:  "#3DAF78",
  navyDark:   "#26215C",
};

// ── ObjectId validation ───────────────────────────────────────────────────────
const isValidObjectId = (id) => /^[a-f\d]{24}$/i.test(id?.trim() || "");

// ══════════════════════════════════════════════════════════════════════════════
//  API SERVICE LAYER
// ══════════════════════════════════════════════════════════════════════════════
const apiCreate       = (payload)          => apiService.post("/agent/lead/presentations", payload);
const apiUpdate       = (id, payload)      => apiService.put(`/agent/lead/presentations/${id}`, payload);
const apiGenerate     = (id)               => apiService.post(`/agent/lead/presentations/${id}/generate`);
const apiShareChannel = (id, channel)      => apiService.post(`/agent/lead/presentations/${id}/share`, { channel });
const apiFetchList    = (status)           => apiService.get(`/agent/lead/presentations${status && status !== "all" ? `?status=${status}` : ""}`);
const apiFetchOne     = (id)               => apiService.get(`/agent/lead/presentations/${id}`);
const apiArchive      = (id)               => apiService.delete(`/agent/lead/presentations/${id}`);
// NOTE: apiPublicShare is intentionally NOT called from agent browser.
// It is called automatically by the client's browser when they open the share link.
// Calling it here was inflating viewCount + setting pipelineStatus="viewed" before the client even opened it.

// ── Payload builder ───────────────────────────────────────────────────────────
function buildPayload({ form, sections, propertyId, customNote }) {
  return {
    title: form.title || `Presentation — ${new Date().toLocaleDateString("en-AE")}`,
    tone:  form.tone  || "professional",
    properties: propertyId && isValidObjectId(propertyId)
      ? [{ property: propertyId.trim(), customNote: customNote || "", order: 1 }]
      : [],
    settings: {
      language: form.language || "English",
      currency: form.currency || "AED",
      areaUnit: form.areaUnit || "sqft",
      hideSections: {
        cover:        !sections.cover,
        projectDesc:  !sections.desc,
        developer:    !sections.dev,
        unitPrices:   !sections.prices,
        paymentPlans: !sections.payment,
        location:     !sections.location,
      },
    },
  };
}

// ── FIX: robust clipboard copy that works on HTTP + unfocused pages ───────────
function copyToClipboard(text, successMsg = "Link copied to clipboard") {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text)
      .then(() => message.success(successMsg))
      .catch(() => fallbackCopy(text, successMsg));
  } else {
    fallbackCopy(text, successMsg);
  }
}

function fallbackCopy(text, successMsg) {
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
    document.body.appendChild(el);
    el.focus();
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    if (ok) message.success(successMsg);
    else message.error("Copy failed — please copy the link manually");
  } catch {
    message.error("Copy failed — please copy the link manually");
  }
}

// ── FIX: safe PDF opener — validates URL, catches popup-blocked case ──────────
function openPdf(url) {
  if (!url || typeof url !== "string" || !url.startsWith("http")) {
    message.error("PDF URL is invalid or has expired");
    return;
  }
  try {
    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (!win || win.closed || typeof win.closed === "undefined") {
      // Popup was blocked — fallback: navigate current tab
      message.warning("Popup blocked. Opening in this tab...");
      window.location.href = url;
    }
  } catch {
    message.error("Could not open PDF. Try copying the URL manually.");
  }
}

// ── FIX: real WhatsApp / Email dispatch ──────────────────────────────────────
function dispatchShareChannel(channel, shareLink, title) {
  if (!shareLink) { message.warning("Share link not ready yet"); return; }
  if (channel === "whatsapp") {
    const body = encodeURIComponent(
      `Hi! I've prepared a property presentation for you: *${title}*\n\n${shareLink}`
    );
    window.open(`https://wa.me/?text=${body}`, "_blank", "noopener,noreferrer");
  }
  if (channel === "email") {
    const subject = encodeURIComponent(`Property Presentation — ${title}`);
    const body    = encodeURIComponent(
      `Hello,\n\nPlease find your personalised property presentation here:\n${shareLink}\n\nFeel free to reach out with any questions.\n\nBest regards`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }
}

// ── Shared micro-components ───────────────────────────────────────────────────
const StatusTag = ({ status }) => {
  const map = {
    draft:     { color: "default", label: "Draft" },
    generated: { color: "success", label: "Generated" },
    archived:  { color: "warning", label: "Archived" },
  };
  const s = map[status] || map.draft;
  return <Tag color={s.color}>{s.label}</Tag>;
};

const PipelineTag = ({ status }) => {
  const map = {
    not_sent: { color: "default",    label: "Not Sent" },
    sent:     { color: "processing", label: "Sent" },
    viewed:   { color: "success",    label: "Viewed" },
  };
  const s = map[status] || map.not_sent;
  return <Tag color={s.color}>{s.label}</Tag>;
};

function Toggle({ on, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: 36, height: 20, borderRadius: 10,
        background: on ? T.success : "#d1d5db",
        position: "relative", cursor: "pointer",
        transition: "background 0.2s", flexShrink: 0,
      }}
    >
      <div style={{
        width: 14, height: 14, borderRadius: "50%", background: "#fff",
        position: "absolute", top: 3,
        left: on ? 18 : 3,
        transition: "left 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  WIZARD STEP 1 — Customise
// ════════════════════════════════════════════════════════════════════════════
function WizardStep1({ form, setForm, sections, setSections, propertyId, setPropertyId, customNote, setCustomNote, onNext, onCancel, isEditing }) {
  const tones = [
    { key: "luxury",       label: "Luxury",       icon: "👑", desc: "Exclusive & aspirational" },
    { key: "professional", label: "Professional", icon: "💼", desc: "Clear & data-driven" },
    { key: "friendly",     label: "Friendly",     icon: "💬", desc: "Warm & conversational" },
  ];
  const sectionList = [
    { key: "cover",    label: "Cover slide" },
    { key: "desc",     label: "Project description" },
    { key: "dev",      label: "Developer profile" },
    { key: "prices",   label: "Unit prices" },
    { key: "payment",  label: "Payment plans" },
    { key: "location", label: "Location & community" },
  ];

  // FIX: ObjectId validation with inline feedback
  const propertyIdInvalid = propertyId.trim() && !isValidObjectId(propertyId);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      {/* LEFT */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card bordered style={{ borderRadius: 14 }} bodyStyle={{ padding: 20 }}>
          <Text strong style={{ fontSize: 13, color: T.text, display: "block", marginBottom: 14 }}>Presentation details</Text>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: T.muted, display: "block", marginBottom: 6 }}>
              Title <span style={{ color: T.error }}>*</span>
            </label>
            <Input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Luxury Villa for Ahmed Al Mansoori"
              style={{ borderRadius: 10 }}
            />
          </div>
          <Row gutter={12}>
            {[
              { label: "Language", key: "language", opts: ["English", "Arabic", "Russian", "Chinese", "French"] },
              { label: "Currency", key: "currency", opts: ["AED", "USD", "GBP", "EUR"] },
              { label: "Area unit", key: "areaUnit", opts: [{ v: "sqft", l: "sq ft" }, { v: "sqm", l: "sq m" }] },
            ].map(({ label, key, opts }) => (
              <Col span={8} key={key}>
                <label style={{ fontSize: 11, fontWeight: 600, color: T.muted, display: "block", marginBottom: 6 }}>{label}</label>
                <Select value={form[key]} onChange={v => setForm(f => ({ ...f, [key]: v }))} style={{ width: "100%" }}>
                  {opts.map(o =>
                    typeof o === "string"
                      ? <Option key={o} value={o}>{o}</Option>
                      : <Option key={o.v} value={o.v}>{o.l}</Option>
                  )}
                </Select>
              </Col>
            ))}
          </Row>
        </Card>

        <Card bordered style={{ borderRadius: 14 }} bodyStyle={{ padding: 20 }}>
          <Text strong style={{ fontSize: 13, color: T.text, display: "block", marginBottom: 14 }}>Presentation tone</Text>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {tones.map(t => (
              <div
                key={t.key}
                onClick={() => setForm(f => ({ ...f, tone: t.key }))}
                style={{
                  padding: "12px 14px", borderRadius: 12, cursor: "pointer",
                  border: `1.5px solid ${form.tone === t.key ? T.xotoPurple : "#e5e7eb"}`,
                  background: form.tone === t.key ? "#EEEDFE" : "#fff",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 6 }}>{t.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: form.tone === t.key ? "#534AB7" : T.text }}>{t.label}</div>
                <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </Card>

        {!isEditing && (
          <Card bordered style={{ borderRadius: 14 }} bodyStyle={{ padding: 20 }}>
            <Text strong style={{ fontSize: 13, color: T.text, display: "block", marginBottom: 14 }}>Property</Text>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: T.muted, display: "block", marginBottom: 6 }}>
                Property ID <span style={{ fontWeight: 400, color: T.muted }}>(MongoDB ObjectId)</span>
              </label>
              {/* FIX: validate ObjectId and show inline error */}
              <Input
                value={propertyId}
                onChange={e => setPropertyId(e.target.value)}
                placeholder="e.g. 69f9979815abe868e65799af"
                style={{
                  borderRadius: 10,
                  borderColor: propertyIdInvalid ? T.error : undefined,
                }}
                status={propertyIdInvalid ? "error" : ""}
              />
              {propertyIdInvalid && (
                <div style={{ fontSize: 11, color: T.error, marginTop: 4 }}>
                  Invalid ObjectId — must be 24 hex characters
                </div>
              )}
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: T.muted, display: "block", marginBottom: 6 }}>Agent note (optional)</label>
              <Input value={customNote} onChange={e => setCustomNote(e.target.value)} placeholder="Custom note about this property" style={{ borderRadius: 10 }} />
            </div>
          </Card>
        )}
      </div>

      {/* RIGHT */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card bordered style={{ borderRadius: 14 }} bodyStyle={{ padding: 20 }}>
          <Text strong style={{ fontSize: 13, color: T.text, display: "block", marginBottom: 14 }}>Visible sections — toggle to hide</Text>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {sectionList.map(s => (
              <div
                key={s.key}
                onClick={() => setSections(prev => ({ ...prev, [s.key]: !prev[s.key] }))}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: 12,
                  cursor: "pointer", background: "#fff",
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{s.label}</span>
                <Toggle on={sections[s.key]} />
              </div>
            ))}
          </div>
        </Card>

        <div style={{ padding: "16px 18px", borderRadius: 14, background: "#EEEDFE", border: "1px solid #AFA9EC" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: T.xotoPurple, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, color: "#fff" }}>ℹ️</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#3C3489", marginBottom: 4 }}>How it works</div>
              <div style={{ fontSize: 12, color: "#534AB7", lineHeight: 1.7 }}>
                1. Fill in details and save as draft.<br />
                2. Click <strong>Generate</strong> to build the PDF + shareable link.<br />
                3. Share via WhatsApp, email, or copy the link. Every open is tracked.
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Button onClick={onCancel} style={{ borderRadius: 10 }}>Cancel</Button>
          <Button
            type="primary"
            onClick={onNext}
            // FIX: also block save if propertyId is present but invalid
            disabled={!form.title?.trim() || propertyIdInvalid}
            style={{ flex: 1, background: T.primary, borderColor: T.primary, borderRadius: 10, fontWeight: 700 }}
          >
            {isEditing ? "Save changes" : "Save as draft →"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  WIZARD STEP 2 — Preview & Generate
// ════════════════════════════════════════════════════════════════════════════
function SlideShell({ label, badge, children, hidden }) {
  if (hidden) return null;
  const badgeStyles = {
    AI:      { bg: "#EEEDFE", color: "#3C3489" },
    CTA:     { bg: "#E1F5EE", color: "#085041" },
    Visible: { bg: "#F3F4F6", color: "#374151" },
  };
  const bs = badgeStyles[badge] || badgeStyles.Visible;
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 14px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280" }}>{label}</span>
        {badge && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: bs.bg, color: bs.color }}>{badge}</span>}
      </div>
      <div style={{ padding: 14 }}>{children}</div>
    </div>
  );
}

function WizardStep2({ form, sections, record, onBack, onGenerate, generating }) {
  const currency = form.currency || "AED";
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      {/* LEFT — slides 1–4 */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <Text strong style={{ fontSize: 13, color: T.text }}>Presentation preview</Text>
          {record?.pdfUrl && (
            // FIX: use safe openPdf() instead of raw window.open
            <Button size="small" icon={<FilePdfOutlined />} onClick={() => openPdf(record.pdfUrl)} style={{ borderRadius: 8 }}>
              View PDF
            </Button>
          )}
        </div>

        <SlideShell label="1 — Cover" badge="Visible" hidden={!sections.cover}>
          <div style={{ background: T.navyDark, color: "#fff", padding: 18, borderRadius: 10, minHeight: 120, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 9, opacity: 0.4, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>XOTO GRID · Exclusive Presentation</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{form.title || "Property Presentation"}</div>
              <div style={{ fontSize: 11, opacity: 0.6 }}>{currency} · {form.language} · {form.tone}</div>
            </div>
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: "0.5px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.xotoPurple, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>XA</div>
              <div style={{ fontSize: 11 }}>
                <div style={{ fontWeight: 600 }}>Xoto Real Estate Advisor</div>
                <div style={{ opacity: 0.5, fontSize: 10 }}>Powered by Xoto GRID</div>
              </div>
            </div>
          </div>
          <div style={{ fontSize: 9, color: "#d1d5db", textAlign: "right", marginTop: 4 }}>Powered by Xoto GRID</div>
        </SlideShell>

        <SlideShell label="2 — Property overview" badge="AI" hidden={!sections.desc}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: T.text }}>AI-generated overview</div>
          <div style={{ fontSize: 11, lineHeight: 1.7, color: "#6b7280", padding: "10px 12px", background: "#f9fafb", borderRadius: 8, border: "1px solid #e5e7eb" }}>
            Narrative will be generated from property data. Tone: <strong>{form.tone}</strong> · Language: <strong>{form.language}</strong>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginTop: 10 }}>
            {[["Currency", currency], ["Area", form.areaUnit], ["Tone", form.tone], ["Lang", form.language]].map(([l, v]) => (
              <div key={l} style={{ background: "#F8F7FF", borderRadius: 8, padding: 8, textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#534AB7" }}>{v}</div>
                <div style={{ fontSize: 9, color: T.muted, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 9, color: "#d1d5db", textAlign: "right", marginTop: 6 }}>Powered by Xoto GRID</div>
        </SlideShell>

        <SlideShell label="3 — Key highlights" badge="AI">
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: T.text }}>Standout features</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {["Prime location", "Investment potential", "Developer reputation", "Amenities", "Payment flexibility"].map((h, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, background: "#f9fafb", borderRadius: 8, padding: 10, fontSize: 11, color: "#374151" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.xotoPurple, marginTop: 3, flexShrink: 0 }} />{h}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 9, color: "#d1d5db", textAlign: "right", marginTop: 6 }}>Powered by Xoto GRID</div>
        </SlideShell>

        <SlideShell label="4 — Photo gallery">
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 6, height: 100 }}>
            <div style={{ background: "#f3f4f6", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "#d1d5db" }}>🏙️</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[0, 1].map(i => <div key={i} style={{ flex: 1, background: "#f3f4f6", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#d1d5db" }}>🖼️</div>)}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[0, 1].map(i => <div key={i} style={{ flex: 1, background: "#f3f4f6", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#d1d5db" }}>🖼️</div>)}
            </div>
          </div>
          <div style={{ fontSize: 9, color: "#d1d5db", textAlign: "right", marginTop: 6 }}>Powered by Xoto GRID</div>
        </SlideShell>
      </div>

      {/* RIGHT — slides 5–8 + actions */}
      <div>
        <div style={{ height: 36, marginBottom: 14 }} />

        <SlideShell label="5 — Location & community" badge="AI" hidden={!sections.location}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: T.text }}>Neighbourhood overview</div>
          <div style={{ fontSize: 11, lineHeight: 1.7, color: "#6b7280", marginBottom: 10 }}>AI-generated from property location data.</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[["3 min", "Marina Walk"], ["12 min", "JBR Beach"], ["20 min", "Dubai Mall"]].map(([t, l]) => (
              <div key={l} style={{ textAlign: "center", background: "#F8F7FF", borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.xotoPurple }}>{t}</div>
                <div style={{ fontSize: 9, color: T.muted, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 9, color: "#d1d5db", textAlign: "right", marginTop: 6 }}>Powered by Xoto GRID</div>
        </SlideShell>

        <SlideShell label="6 — Payment plan" hidden={!sections.payment}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: T.text }}>Construction-linked plan</div>
          <table style={{ width: "100%", fontSize: 11, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                {["Milestone", "%", `Amount (${currency})`, "Note"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "6px 8px", fontSize: 10, fontWeight: 700, color: T.muted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[["On booking", "10%", "—", "Reservation"], ["During construction", "50%", "—", "5 instalments"], ["On handover", "40%", "—", "Completion"]].map(([m, p, a, d]) => (
                <tr key={m} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "7px 8px", fontWeight: 600 }}>{m}</td>
                  <td style={{ padding: "7px 8px", color: T.xotoPurple, fontWeight: 700 }}>{p}</td>
                  <td style={{ padding: "7px 8px" }}>{a}</td>
                  <td style={{ padding: "7px 8px", color: T.muted }}>{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ fontSize: 9, color: "#d1d5db", textAlign: "right", marginTop: 6 }}>Powered by Xoto GRID</div>
        </SlideShell>

        <SlideShell label="7 — Developer profile" hidden={!sections.dev}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#F8F7FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#534AB7", flexShrink: 0 }}>DEV</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Developer Profile</div>
              <div style={{ fontSize: 10, color: T.muted }}>Auto-filled from property listing data</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.7 }}>Developer description pulled from the property record and rendered in the generated PDF.</div>
          <div style={{ fontSize: 9, color: "#d1d5db", textAlign: "right", marginTop: 6 }}>Powered by Xoto GRID</div>
        </SlideShell>

        <SlideShell label="8 — Next steps" badge="CTA">
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: T.text }}>Ready to move forward?</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[{ bg: "#EEEDFE", tc: "#3C3489", icon: "📅", label: "Schedule viewing" }, { bg: "#E1F5EE", tc: "#085041", icon: "💬", label: "WhatsApp" }, { bg: "#FAEEDA", tc: "#633806", icon: "📞", label: "Call advisor" }].map(c => (
              <div key={c.label} style={{ flex: 1, background: c.bg, borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{c.icon}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: c.tc }}>{c.label}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 9, color: "#d1d5db", textAlign: "right", marginTop: 6 }}>Powered by Xoto GRID</div>
        </SlideShell>

        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={onBack} style={{ borderRadius: 10 }}>Back</Button>
          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            loading={generating}
            onClick={onGenerate}
            style={{ flex: 1, background: T.primary, borderColor: T.primary, borderRadius: 10, fontWeight: 700, height: 40 }}
          >
            Generate PDF + Share Link
          </Button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  WIZARD STEP 3 — Share & Track
// ════════════════════════════════════════════════════════════════════════════
function WizardStep3({ record, sharing, onShareChannel, onClose, onRefresh }) {
  if (!record) return null;

  // FIX: removed apiPublicShare() call from here entirely.
  // Opening the link no longer fakes a "client view". Tracking happens
  // automatically when the real client opens the URL in their browser.
  const handleOpenShareLink = () => {
    if (!record.shareLink) {
      message.warning("Share link not ready yet");
      return;
    }
    try {
      const win = window.open(record.shareLink, "_blank", "noopener,noreferrer");
      if (!win || win.closed || typeof win.closed === "undefined") {
        message.warning("Popup blocked. Opening in this tab...");
        window.location.href = record.shareLink;
      }
    } catch {
      message.error("Could not open link");
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      {/* LEFT */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card bordered style={{ borderRadius: 14 }} bodyStyle={{ padding: 20 }}>
          <Text strong style={{ fontSize: 13, color: T.text, display: "block", marginBottom: 14 }}>
            Tracking link
          </Text>

          {/* Share link row */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: 12, background: "#f9fafb", marginBottom: 14 }}>
            <LinkOutlined style={{ color: "#534AB7", flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 11, color: "#534AB7", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600 }}>
              {record.shareLink || "Generating..."}
            </span>
            {/* FIX: use robust copyToClipboard() */}
            <Button size="small" icon={<CopyOutlined />} onClick={() => copyToClipboard(record.shareLink)} style={{ borderRadius: 8, flexShrink: 0 }}>Copy</Button>
          </div>

          {/* FIX: WhatsApp now actually opens WhatsApp with the link. Email opens mailto. */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
            <Button
              icon={<WhatsAppOutlined />}
              loading={sharing === "whatsapp"}
              onClick={() => {
                onShareChannel("whatsapp");
                dispatchShareChannel("whatsapp", record.shareLink, record.title);
              }}
              style={{
                height: 56, borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
                background: record.sharedViaWhatsApp ? "#f0fdf4" : "#fff",
                borderColor: record.sharedViaWhatsApp ? T.success : "#e5e7eb",
                color: record.sharedViaWhatsApp ? T.success : T.text,
                fontWeight: 600, fontSize: 11,
              }}
            >
              {record.sharedViaWhatsApp ? "✓ Sent" : "WhatsApp"}
            </Button>
            <Button
              icon={<MailOutlined />}
              loading={sharing === "email"}
              onClick={() => {
                onShareChannel("email");
                dispatchShareChannel("email", record.shareLink, record.title);
              }}
              style={{
                height: 56, borderRadius: 12,
                background: record.sharedViaEmail ? "#eff6ff" : "#fff",
                borderColor: record.sharedViaEmail ? T.info : "#e5e7eb",
                color: record.sharedViaEmail ? T.info : T.text,
                fontWeight: 600, fontSize: 11,
              }}
            >
              {record.sharedViaEmail ? "✓ Sent" : "Email"}
            </Button>
            {/* FIX: use robust copyToClipboard() */}
            <Button icon={<CopyOutlined />} onClick={() => copyToClipboard(record.shareLink)} style={{ height: 56, borderRadius: 12, fontSize: 11, fontWeight: 600 }}>Copy link</Button>
          </div>

          {/* FIX: "Open link" button no longer calls apiPublicShare — just opens the URL */}
          <Button
            block
            icon={<EyeOutlined />}
            onClick={handleOpenShareLink}
            style={{ borderRadius: 10, marginBottom: 8, fontWeight: 600 }}
          >
            Open share link (client view tracked on their end)
          </Button>

          <Alert
            type="info"
            showIcon
            message={
              <span style={{ fontSize: 11 }}>
                View count updates automatically when the client opens this link. Click <strong>Refresh stats</strong> to see latest data.
              </span>
            }
            style={{ borderRadius: 8 }}
          />
        </Card>

        {/* PDF — FIX: use safe openPdf() */}
        {record.pdfUrl && (
          <Button
            block
            icon={<FilePdfOutlined />}
            onClick={() => openPdf(record.pdfUrl)}
            style={{ borderRadius: 12, height: 44, fontWeight: 600 }}
          >
            View / Download PDF
          </Button>
        )}

        {/* Client contact (masked — PRD §10.4) */}
        <Card bordered style={{ borderRadius: 14 }} bodyStyle={{ padding: 20 }}>
          <Text strong style={{ fontSize: 13, color: T.text, display: "block", marginBottom: 12 }}>Client contact</Text>
          <Alert
            type="info"
            showIcon={false}
            message={<span style={{ fontSize: 11 }}>Contact details masked per PRD §10.4. Admin assignment unlocks full details.</span>}
            style={{ borderRadius: 8, marginBottom: 10 }}
          />
          {[["Name", "A•••• A• M••••••••"], ["Phone", "+971 •• ••• ••••"], ["Email", "a••••@•••••.com"]].map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
              <span style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>{l}</span>
              <span style={{ fontSize: 12, color: T.text, fontFamily: "monospace" }}>{v}</span>
            </div>
          ))}
        </Card>
      </div>

      {/* RIGHT */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card bordered style={{ borderRadius: 14 }} bodyStyle={{ padding: 20 }}>
          <Text strong style={{ fontSize: 13, color: T.text, display: "block", marginBottom: 14 }}>Engagement tracking</Text>

          <Row gutter={12} style={{ marginBottom: 16 }}>
            {[
              { label: "Total opens",      value: record.viewCount || 0,             color: T.text },
              { label: "Engagement score", value: (record.viewCount || 0) * 15,      color: T.xotoPurple },
              { label: "Last viewed",      value: record.lastViewedAt ? new Date(record.lastViewedAt).toLocaleDateString("en-AE") : "—", color: T.text },
            ].map(s => (
              <Col span={8} key={s.label}>
                <div style={{ background: "#f9fafb", borderRadius: 12, padding: "14px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: T.muted, marginTop: 4, fontWeight: 600 }}>{s.label}</div>
                </div>
              </Col>
            ))}
          </Row>

          <div style={{ padding: "12px 14px", background: "#f9fafb", borderRadius: 12, marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 6 }}>Pipeline status</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <PipelineTag status={record.pipelineStatus || "not_sent"} />
              <span style={{ fontSize: 11, color: T.muted }}>Auto-updates to "Viewed" on first open (+15 pts)</span>
            </div>
          </div>

          {record.viewHistory?.length > 0 ? (
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
              {record.viewHistory.slice(0, 5).map((v, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: i < 4 ? "1px solid #f3f4f6" : "none", fontSize: 11 }}>
                  <span style={{ color: T.muted, fontWeight: 600 }}>{new Date(v.viewedAt).toLocaleString("en-AE")}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Tag style={{ fontSize: 10 }}>{v.deviceType}</Tag>
                    <span style={{ color: T.success, fontSize: 10, fontWeight: 700 }}>+15 pts</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "20px 0", border: "1.5px dashed #e5e7eb", borderRadius: 12, color: T.muted, fontSize: 12 }}>
              No opens yet — share the link to start tracking
            </div>
          )}
        </Card>

        <div style={{ display: "flex", gap: 10 }}>
          <Button onClick={onRefresh} icon={<ReloadOutlined />} style={{ borderRadius: 10 }}>Refresh stats</Button>
          <Button type="primary" onClick={onClose} style={{ flex: 1, background: T.primary, borderColor: T.primary, borderRadius: 10, fontWeight: 700 }}>Done</Button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════
const AgentPresentations = () => {
  const [presentations, setPresentations] = useState([]);
  const [loading, setLoading]             = useState(false);
  const [filter, setFilter]               = useState("all");
  const [wizardOpen, setWizardOpen]       = useState(false);
  const [wizardStep, setWizardStep]       = useState(1);
  const [isEditing, setIsEditing]         = useState(false);
  const [editingId, setEditingId]         = useState(null);
  const [activeRecord, setActiveRecord]   = useState(null);
  const [form, setForm]                   = useState({ title: "", tone: "professional", language: "English", currency: "AED", areaUnit: "sqft" });
  const [sections, setSections]           = useState({ cover: true, desc: true, dev: true, prices: true, payment: true, location: true });
  const [propertyId, setPropertyId]       = useState("");
  const [customNote, setCustomNote]       = useState("");
  const [saving, setSaving]               = useState(false);
  const [generating, setGenerating]       = useState(false);
  const [sharing, setSharing]             = useState(null);
  const [detailDrawer, setDetailDrawer]   = useState(null);
  const [archiving, setArchiving]         = useState(null);
  // FIX: track whether anything was actually saved so closeWizard avoids needless refetch
  const [wizardDirty, setWizardDirty]     = useState(false);

  // ── API #5 — listPresentations ────────────────────────────────────────────
  const fetchPresentations = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await apiFetchList(filter);
      const data = res?.data?.data || res?.data || [];
      setPresentations(Array.isArray(data) ? data : []);
    } catch {
      message.error("Failed to load presentations");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchPresentations(); }, [fetchPresentations]);

  const resetWizard = () => {
    setForm({ title: "", tone: "professional", language: "English", currency: "AED", areaUnit: "sqft" });
    setSections({ cover: true, desc: true, dev: true, prices: true, payment: true, location: true });
    setPropertyId("");
    setCustomNote("");
    setIsEditing(false);
    setEditingId(null);
    setActiveRecord(null);
    setWizardStep(1);
    setWizardDirty(false);
  };

  const openCreateWizard = () => { resetWizard(); setWizardOpen(true); };

  // FIX: single source of truth for loading a record into wizard
  const loadRecordIntoWizard = (record) => {
    setIsEditing(true);
    setEditingId(record._id);
    setActiveRecord(record);
    setForm({
      title:    record.title                        || "",
      tone:     record.tone                         || "professional",
      language: record.settings?.language           || "English",
      currency: record.settings?.currency           || "AED",
      areaUnit: record.settings?.areaUnit           || "sqft",
    });
    setSections({
      cover:    !record.settings?.hideSections?.cover,
      desc:     !record.settings?.hideSections?.projectDesc,
      dev:      !record.settings?.hideSections?.developer,
      prices:   !record.settings?.hideSections?.unitPrices,
      payment:  !record.settings?.hideSections?.paymentPlans,
      location: !record.settings?.hideSections?.location,
    });
    setWizardDirty(false);
  };

  const openEditWizard = (record) => {
    loadRecordIntoWizard(record);
    setWizardStep(1);
    setWizardOpen(true);
  };

  const openGenerateWizard = (record) => {
    loadRecordIntoWizard(record);
    setWizardStep(2);
    setWizardOpen(true);
  };

  const openShareWizard = (record) => {
    setActiveRecord(record);
    setEditingId(record._id);
    setWizardStep(3);
    setWizardOpen(true);
  };

  // ── API #1 / #2 — createPresentationDraft / updatePresentation ────────────
  const handleSaveDraft = async () => {
    if (!form.title?.trim()) { message.warning("Please enter a presentation title"); return; }
    if (propertyId.trim() && !isValidObjectId(propertyId)) {
      message.error("Invalid Property ID — must be a 24-character MongoDB ObjectId");
      return;
    }
    setSaving(true);
    const payload = buildPayload({ form, sections, propertyId, customNote });
    try {
      let res;
      if (isEditing && editingId) {
        res = await apiUpdate(editingId, payload);
        message.success("Draft updated successfully");
      } else {
        res = await apiCreate(payload);
        message.success("Draft created successfully");
      }
      const saved = res?.data?.data || res?.data || {};
      setActiveRecord(saved);
      setEditingId(saved._id);
      setIsEditing(true);
      setWizardDirty(true);
      setWizardStep(2);
      fetchPresentations();
    } catch (err) {
      message.error(err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // ── API #3 — generatePresentation ─────────────────────────────────────────
  // FIX: re-save latest form state before generating so unsaved edits aren't lost
  const handleGenerate = async () => {
    if (!editingId) { message.error("No draft to generate"); return; }
    setGenerating(true);
    try {
      // Re-save any form changes made on step 2 before generating
      const payload = buildPayload({ form, sections, propertyId, customNote });
      await apiUpdate(editingId, payload);

      const res       = await apiGenerate(editingId);
      const generated = res?.data?.data || res?.data || {};
      setActiveRecord(generated);
      setWizardDirty(true);
      message.success("PDF generated! Share link is ready.");
      setWizardStep(3);
      fetchPresentations();
    } catch (err) {
      message.error(err?.response?.data?.message || "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  // ── API #4 — shareViaChannel ──────────────────────────────────────────────
  // FIX: only marks the record as shared in DB — actual dispatch happens in dispatchShareChannel
  const handleShareChannel = async (channel) => {
    if (!activeRecord?._id) return;
    setSharing(channel);
    try {
      await apiShareChannel(activeRecord._id, channel);
      message.success(`Marked as shared via ${channel}`);
      const res = await apiFetchOne(activeRecord._id);
      setActiveRecord(res?.data?.data || res?.data || activeRecord);
      setWizardDirty(true);
      fetchPresentations();
    } catch (err) {
      message.error(err?.response?.data?.message || "Share failed");
    } finally {
      setSharing(null);
    }
  };

  // ── API #6 — getPresentation (refresh stats) ──────────────────────────────
  const refreshActiveRecord = async () => {
    if (!activeRecord?._id) return;
    try {
      const res = await apiFetchOne(activeRecord._id);
      setActiveRecord(res?.data?.data || res?.data || activeRecord);
      message.success("Stats refreshed");
    } catch {
      message.error("Failed to refresh");
    }
  };

  // ── API #7 — archivePresentation ──────────────────────────────────────────
  const handleArchive = async (id) => {
    setArchiving(id);
    try {
      await apiArchive(id);
      message.success("Presentation archived");
      if (detailDrawer?._id === id) setDetailDrawer(null);
      fetchPresentations();
    } catch (err) {
      message.error(err?.response?.data?.message || "Archive failed");
    } finally {
      setArchiving(null);
    }
  };

  // FIX: only refetch if something actually changed during the wizard session
  const closeWizard = () => {
    setWizardOpen(false);
    if (wizardDirty) fetchPresentations();
    resetWizard();
  };

  // FIX: refresh detailDrawer from the server so it never shows stale data
  const openDetailDrawer = async (record) => {
    setDetailDrawer(record); // show immediately with what we have
    try {
      const res = await apiFetchOne(record._id);
      const fresh = res?.data?.data || res?.data;
      if (fresh) setDetailDrawer(fresh);
    } catch {
      // silently keep the snapshot we already have
    }
  };

  const counts = {
    all:       presentations.length,
    draft:     presentations.filter(p => p.status === "draft").length,
    generated: presentations.filter(p => p.status === "generated").length,
    archived:  presentations.filter(p => p.status === "archived").length,
  };

  const columns = [
    {
      title: "Presentation", dataIndex: "title", key: "title",
      render: (text, record) => (
        <div>
          <Text strong style={{ color: T.text }}>{text}</Text>
          <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
            {record.settings?.language && <Tag style={{ fontSize: 10, margin: 0 }}>{record.settings.language}</Tag>}
            {record.settings?.currency && <Tag style={{ fontSize: 10, margin: 0 }}>{record.settings.currency}</Tag>}
            {record.tone && <Tag color="purple" style={{ fontSize: 10, margin: 0 }}>{record.tone}</Tag>}
          </div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>
            {new Date(record.createdAt).toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" })}
          </div>
        </div>
      ),
    },
    {
      title: "Status", key: "status", width: 160,
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <StatusTag status={record.status} />
          {record.status === "generated" && <PipelineTag status={record.pipelineStatus} />}
        </Space>
      ),
    },
    {
      title: "Properties", key: "props", width: 90, align: "center",
      render: (_, record) => <Tag color="blue">{record.properties?.length || 0}</Tag>,
    },
    {
      title: "Engagement", key: "engagement", width: 130,
      render: (_, record) =>
        record.status === "generated" ? (
          <Space direction="vertical" size={2}>
            <Text style={{ fontSize: 12 }}><EyeOutlined style={{ marginRight: 4, color: T.primary }} />{record.viewCount || 0} views</Text>
            {record.sharedViaWhatsApp && <Text style={{ fontSize: 11, color: T.success }}><WhatsAppOutlined style={{ marginRight: 4 }} />WhatsApp</Text>}
            {record.sharedViaEmail    && <Text style={{ fontSize: 11, color: T.info }}><MailOutlined style={{ marginRight: 4 }} />Email</Text>}
          </Space>
        ) : <Text style={{ fontSize: 12, color: T.muted }}>—</Text>,
    },
    {
      title: "Actions", key: "actions", width: 240,
      render: (_, record) => (
        <Space size="small" wrap>
          {/* FIX: openDetailDrawer refreshes from server */}
          <Tooltip title="View details">
            <Button size="small" icon={<EyeOutlined />} onClick={() => openDetailDrawer(record)} />
          </Tooltip>

          {record.status === "draft" && (
            <Tooltip title="Edit draft">
              <Button size="small" icon={<EditOutlined />} onClick={() => openEditWizard(record)} />
            </Tooltip>
          )}

          {/* FIX: uses openGenerateWizard() — no more 40-line inline duplicate */}
          {record.status === "draft" && (
            <Tooltip title="Preview & Generate">
              <Button
                size="small" type="primary" icon={<ThunderboltOutlined />}
                onClick={() => openGenerateWizard(record)}
                style={{ background: T.primary, borderColor: T.primary }}
              />
            </Tooltip>
          )}

          {record.status === "generated" && (
            <Tooltip title="Share & track">
              <Button size="small" type="primary" icon={<ShareAltOutlined />} onClick={() => openShareWizard(record)} style={{ background: T.success, borderColor: T.success }} />
            </Tooltip>
          )}

          {/* FIX: use safe openPdf() */}
          {record.pdfUrl && (
            <Tooltip title="View PDF">
              <Button size="small" icon={<FilePdfOutlined />} onClick={() => openPdf(record.pdfUrl)} />
            </Tooltip>
          )}

          {/* FIX: Popconfirm before archive — no more accidental one-click delete */}
          {record.status !== "archived" && (
            <Popconfirm
              title="Archive this presentation?"
              description="It will move to the Archived tab. This cannot be undone."
              onConfirm={() => handleArchive(record._id)}
              okText="Archive"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Archive">
                <Button size="small" danger icon={<DeleteOutlined />} loading={archiving === record._id} />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const wizardTitle = () => {
    if (wizardStep === 3) return <><ShareAltOutlined style={{ marginRight: 8, color: T.success }} />Share & Track</>;
    if (isEditing && wizardStep === 1) return <><EditOutlined style={{ marginRight: 8, color: T.primary }} />Edit Draft</>;
    if (wizardStep === 2) return <><EyeOutlined style={{ marginRight: 8, color: T.primary }} />Preview & Generate</>;
    return <><PlusOutlined style={{ marginRight: 8, color: T.primary }} />New Presentation</>;
  };

  const WizardStepBar = () => (
    <div style={{ display: "flex", borderBottom: "1px solid #f0f0f0", margin: "0 -24px 20px", padding: "0 24px" }}>
      {[{ n: 1, label: "Customise" }, { n: 2, label: "Preview" }, { n: 3, label: "Share & Track" }].map((s, i, arr) => {
        const state = s.n === wizardStep ? "active" : s.n < wizardStep ? "done" : "idle";
        return (
          <div key={s.n} style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "10px 0", borderBottom: state === "active" ? `2px solid ${T.primary}` : "2px solid transparent" }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, background: state === "active" ? T.primary : state === "done" ? T.success : "#e5e7eb", color: state === "idle" ? T.muted : "#fff" }}>
              {state === "done" ? "✓" : s.n}
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: state === "active" ? T.primary : state === "done" ? T.success : T.muted }}>{s.label}</span>
            {i < arr.length - 1 && <div style={{ flex: 1, height: 1, background: "#e5e7eb", marginLeft: 4 }} />}
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={{ padding: 24, background: T.bg, minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: T.text }}>
            <ThunderboltOutlined style={{ color: T.primary, marginRight: 8 }} />AI Presentations
          </Title>
          <Text type="secondary">Create, generate and share property presentations</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateWizard} style={{ background: T.primary, borderColor: T.primary, borderRadius: 10, fontWeight: 700 }}>
          New Presentation
        </Button>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: "Total",     value: counts.all,       color: T.primary, icon: <BarChartOutlined /> },
          { label: "Drafts",    value: counts.draft,     color: T.warning, icon: <EditOutlined /> },
          { label: "Generated", value: counts.generated, color: T.success, icon: <CheckCircleOutlined /> },
          { label: "Archived",  value: counts.archived,  color: T.muted,   icon: <ClockCircleOutlined /> },
        ].map(s => (
          <Col xs={12} sm={6} key={s.label}>
            <Card bordered={false} style={{ borderRadius: 12, borderLeft: `4px solid ${s.color}` }} bodyStyle={{ padding: "16px 20px" }}>
              <Statistic
                title={<Text style={{ fontSize: 12, color: T.muted }}>{s.label}</Text>}
                value={s.value}
                valueStyle={{ color: s.color, fontSize: 28, fontWeight: 700 }}
                prefix={React.cloneElement(s.icon, { style: { fontSize: 18, marginRight: 4 } })}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filter tabs */}
      <div style={{ marginBottom: 16 }}>
        <Space wrap>
          {[
            { key: "all",       label: `All (${counts.all})` },
            { key: "draft",     label: `Drafts (${counts.draft})` },
            { key: "generated", label: `Generated (${counts.generated})` },
            { key: "archived",  label: `Archived (${counts.archived})` },
          ].map(f => (
            <Button
              key={f.key}
              type={filter === f.key ? "primary" : "default"}
              onClick={() => setFilter(f.key)}
              style={{ background: filter === f.key ? T.primary : "white", borderColor: filter === f.key ? T.primary : T.border, color: filter === f.key ? "white" : T.text, borderRadius: 20, fontWeight: filter === f.key ? 700 : 400 }}
            >
              {f.label}
            </Button>
          ))}
        </Space>
      </div>

      {/* Table */}
      <Card bordered={false} bodyStyle={{ padding: 0 }} style={{ borderRadius: 14, overflow: "hidden" }}>
        <Table
          columns={columns}
          dataSource={presentations}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          locale={{
            emptyText: (
              <div style={{ padding: "40px 0", textAlign: "center" }}>
                <ThunderboltOutlined style={{ fontSize: 40, color: T.muted, marginBottom: 12 }} />
                <div style={{ color: T.muted, marginBottom: 12 }}>No presentations yet</div>
                <Button type="primary" icon={<PlusOutlined />} onClick={openCreateWizard} style={{ background: T.primary, borderColor: T.primary }}>
                  Create First Presentation
                </Button>
              </div>
            ),
          }}
        />
      </Card>

      {/* Wizard Modal */}
      <Modal
        open={wizardOpen}
        onCancel={closeWizard}
        title={wizardTitle()}
        footer={null}
        width="90vw"
        style={{ maxWidth: 1200, top: 40 }}
        centered={false}
        destroyOnClose
      >
        <WizardStepBar />

        {wizardStep === 1 && (
          <WizardStep1
            form={form} setForm={setForm}
            sections={sections} setSections={setSections}
            propertyId={propertyId} setPropertyId={setPropertyId}
            customNote={customNote} setCustomNote={setCustomNote}
            isEditing={isEditing}
            onNext={handleSaveDraft}
            onCancel={closeWizard}
          />
        )}
        {wizardStep === 2 && (
          <WizardStep2
            form={form} sections={sections} record={activeRecord}
            generating={generating}
            onGenerate={handleGenerate}
            onBack={() => setWizardStep(1)}
          />
        )}
        {wizardStep === 3 && (
          <WizardStep3
            record={activeRecord}
            sharing={sharing}
            onShareChannel={handleShareChannel}
            onClose={closeWizard}
            onRefresh={refreshActiveRecord}
          />
        )}

        {saving && (
          <div style={{ textAlign: "center", padding: "10px 0 0" }}>
            <Spin size="small" />
            <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>Saving draft...</Text>
          </div>
        )}
      </Modal>

      {/* Detail Drawer — FIX: opened via openDetailDrawer() which refreshes from server */}
      <Drawer
        open={!!detailDrawer}
        onClose={() => setDetailDrawer(null)}
        width={420}
        title={<span><ExperimentOutlined style={{ marginRight: 8, color: T.primary }} />Presentation Details</span>}
      >
        {detailDrawer && (
          <div>
            <Space style={{ marginBottom: 12 }}>
              <StatusTag status={detailDrawer.status} />
              {detailDrawer.status === "generated" && <PipelineTag status={detailDrawer.pipelineStatus} />}
            </Space>

            <Title level={4} style={{ marginTop: 8, marginBottom: 4 }}>{detailDrawer.title}</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Created {new Date(detailDrawer.createdAt).toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" })}
            </Text>

            <Divider />
            <Title level={5} style={{ marginBottom: 12 }}><SettingOutlined style={{ marginRight: 6, color: T.primary }} />Settings</Title>
            {[
              ["Language",  detailDrawer.settings?.language || "English"],
              ["Currency",  detailDrawer.settings?.currency || "AED"],
              ["Area Unit", detailDrawer.settings?.areaUnit || "sqft"],
              ["Tone",      detailDrawer.tone || "professional"],
            ].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
                <Text type="secondary" style={{ fontSize: 13 }}>{l}</Text>
                <Text strong style={{ fontSize: 13 }}>{v}</Text>
              </div>
            ))}

            {detailDrawer.status === "generated" && (
              <>
                <Divider />
                <Title level={5} style={{ marginBottom: 12 }}><BarChartOutlined style={{ marginRight: 6, color: T.primary }} />Engagement</Title>
                {[
                  ["Total Views",  detailDrawer.viewCount || 0],
                  ["Last Viewed",  detailDrawer.lastViewedAt ? new Date(detailDrawer.lastViewedAt).toLocaleString("en-AE") : "Never"],
                  ["WhatsApp",     detailDrawer.sharedViaWhatsApp ? "Sent ✓" : "Not sent"],
                  ["Email",        detailDrawer.sharedViaEmail ? "Sent ✓" : "Not sent"],
                  ["White Label",  detailDrawer.isWhiteLabel ? "Yes" : "No"],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
                    <Text type="secondary" style={{ fontSize: 13 }}>{l}</Text>
                    <Text strong style={{ fontSize: 13 }}>{v}</Text>
                  </div>
                ))}
              </>
            )}

            <Divider />
            <Title level={5} style={{ marginBottom: 12 }}>Properties ({detailDrawer.properties?.length || 0})</Title>
            {detailDrawer.properties?.length > 0 ? (
              detailDrawer.properties.map((p, i) => (
                <div key={i} style={{ padding: "10px 12px", background: T.bg, borderRadius: 8, marginBottom: 8, border: `1px solid ${T.border}` }}>
                  <Text strong>{p.property?.propertyName || p.property || "Property"}</Text>
                  {p.customNote && <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>Note: {p.customNote}</div>}
                </div>
              ))
            ) : <Text type="secondary">No properties added</Text>}

            {detailDrawer.settings?.hideSections && (
              <>
                <Divider />
                <Title level={5} style={{ marginBottom: 12 }}>Hidden Sections</Title>
                <Space wrap>
                  {Object.entries(detailDrawer.settings.hideSections).filter(([, v]) => v).map(([k]) => <Tag key={k}>{k}</Tag>)}
                  {!Object.values(detailDrawer.settings.hideSections).some(Boolean) && <Text type="secondary" style={{ fontSize: 12 }}>None hidden</Text>}
                </Space>
              </>
            )}

            {detailDrawer.viewHistory?.length > 0 && (
              <>
                <Divider />
                <Title level={5} style={{ marginBottom: 12 }}><EyeOutlined style={{ marginRight: 6, color: T.primary }} />View History</Title>
                {detailDrawer.viewHistory.slice(0, 5).map((v, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.border}`, fontSize: 12 }}>
                    <Text type="secondary">{new Date(v.viewedAt).toLocaleString("en-AE")}</Text>
                    <Tag>{v.deviceType}</Tag>
                  </div>
                ))}
              </>
            )}

            {detailDrawer.shareLink && (
              <>
                <Divider />
                <Text strong style={{ display: "block", marginBottom: 8 }}>Share Link</Text>
                <div style={{ display: "flex" }}>
                  <Input value={detailDrawer.shareLink} readOnly style={{ borderRadius: "8px 0 0 8px", fontSize: 12, color: T.primary }} />
                  {/* FIX: use robust copyToClipboard() */}
                  <Button icon={<CopyOutlined />} onClick={() => copyToClipboard(detailDrawer.shareLink)} style={{ borderRadius: "0 8px 8px 0" }} />
                </div>
              </>
            )}

            {detailDrawer.pdfUrl && (
              // FIX: use safe openPdf()
              <Button block icon={<FilePdfOutlined />} onClick={() => openPdf(detailDrawer.pdfUrl)} style={{ marginTop: 16, borderRadius: 8 }}>
                View PDF
              </Button>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              {detailDrawer.status === "draft" && (
                <Button block type="primary" icon={<EditOutlined />} onClick={() => { setDetailDrawer(null); openEditWizard(detailDrawer); }} style={{ background: T.primary, borderColor: T.primary, borderRadius: 8 }}>
                  Edit Draft
                </Button>
              )}
              {detailDrawer.status === "generated" && (
                <Button block type="primary" icon={<ShareAltOutlined />} onClick={() => { setDetailDrawer(null); openShareWizard(detailDrawer); }} style={{ background: T.success, borderColor: T.success, borderRadius: 8 }}>
                  Share & Track
                </Button>
              )}
              {/* FIX: Popconfirm in drawer too */}
              {detailDrawer.status !== "archived" && (
                <Popconfirm
                  title="Archive this presentation?"
                  description="It will move to the Archived tab. This cannot be undone."
                  onConfirm={() => handleArchive(detailDrawer._id)}
                  okText="Archive"
                  cancelText="Cancel"
                  okButtonProps={{ danger: true }}
                >
                  <Button block danger icon={<DeleteOutlined />} loading={archiving === detailDrawer._id} style={{ borderRadius: 8 }}>
                    Archive
                  </Button>
                </Popconfirm>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default AgentPresentations;