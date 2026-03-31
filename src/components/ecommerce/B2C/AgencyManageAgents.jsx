import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  Tag,
  Typography,
  Row,
  Col,
  Upload,
  Select,
  InputNumber,
  Tooltip,
  Space,
  Badge,
  Spin,
  Empty,
  Steps,
  Alert,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  UserOutlined,
  SearchOutlined,
  CheckCircleFilled,
  FileDoneOutlined,
  EyeOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  TrophyOutlined,
  UploadOutlined,
  TeamOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Text } = Typography;
const { Option } = Select;

const AVATAR_COLORS = [
  "#5f0f9c",
  "#0891B2",
  "#059669",
  "#D97706",
  "#DC2626",
  "#7C3AED",
  "#DB2777",
  "#EA580C",
  "#65A30D",
  "#0284C7",
];

const SPECIALIZATIONS = [
  "Luxury",
  "Residential",
  "Commercial",
  "Off-Plan",
  "Rental",
  "Investment",
];

const COUNTRY_CODES = [
  { code: "+971", label: "AE +971" },
  { code: "+91", label: "IN +91" },
  { code: "+1", label: "US +1" },
  { code: "+44", label: "GB +44" },
  { code: "+966", label: "SA +966" },
  { code: "+974", label: "QA +974" },
];

const STORAGE_KEY = "rm_agency_agents_v2";

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0] || "")
    .join("")
    .toUpperCase()
    .slice(0, 2);

const getAvatarColor = (name = "") => {
  const h = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
};

const loadFromStorage = () => {
  try {
    const r = localStorage.getItem(STORAGE_KEY);
    return r ? JSON.parse(r) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
};

/* ── AgentAvatar ── */
const AgentAvatar = ({ name = "", src, size = 40, showDot = false, active = true }) => (
  <div style={{ position: "relative", display: "inline-block", flexShrink: 0 }}>
    {src ? (
      <img
        src={src}
        alt={name}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          border: "3px solid #fff",
          boxShadow: "0 4px 12px rgba(95, 15, 156, 0.2)",
        }}
      />
    ) : (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: getAvatarColor(name),
          color: "#fff",
          fontWeight: 700,
          fontSize: size * 0.35,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "3px solid #fff",
          boxShadow: "0 4px 12px rgba(95, 15, 156, 0.2)",
          letterSpacing: "-.5px",
        }}
      >
        {getInitials(name)}
      </div>
    )}
    {showDot && (
      <span
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: 12,
          height: 12,
          borderRadius: "50%",
          border: "3px solid #fff",
          background: active ? "#22c55e" : "#9CA3AF",
          boxShadow: `0 0 0 2px ${active ? "#bbf7d0" : "#e5e7eb"}`,
        }}
      />
    )}
  </div>
);

/* ── StatCard ── */
const StatCard = ({ title, value, icon, accent, bg }) => (
  <div
    style={{
      background: "#fff",
      border: "1px solid #E5E7EB",
      borderRadius: 16,
      padding: "20px 22px",
      display: "flex",
      alignItems: "center",
      gap: 16,
      boxShadow: "0 2px 8px rgba(0,0,0,.06)",
      transition: "all .25s cubic-bezier(0.4, 0, 0.2, 1)",
      cursor: "default",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = "0 12px 28px rgba(95, 15, 156, 0.12)";
      e.currentTarget.style.transform = "translateY(-3px)";
      e.currentTarget.style.borderColor = "#5f0f9c";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,.06)";
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.borderColor = "#E5E7EB";
    }}
  >
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: 14,
        background: bg,
        color: accent,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 22,
        flexShrink: 0,
        boxShadow: `0 4px 12px ${bg}`,
      }}
    >
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 600, marginBottom: 4 }}>
        {title}
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, color: "#111827", lineHeight: 1 }}>
        {value}
      </div>
    </div>
  </div>
);

/* ── UploadField ── */
const UploadField = ({ type, label, accept, fileObj, uploading, onUpload, onRemove }) => {
  const handleFile = (file) => {
    onUpload(file, type);
    return false;
  };

  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
        {label}
      </div>

      {fileObj ? (
        <div
          style={{
            border: "2px solid #5f0f9c",
            borderRadius: 14,
            padding: "12px 14px",
            background: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <CheckOutlined style={{ color: "#5f0f9c", fontSize: 16 }} />
          <span
            style={{
              flex: 1,
              fontSize: 12,
              color: "#5f0f9c",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontWeight: 700,
            }}
            title={fileObj.name || label}
          >
            {fileObj.name || label}
          </span>
          <button
            onClick={() => onRemove(type)}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              color: "#9CA3AF",
              fontSize: 20,
              lineHeight: 1,
              padding: "0 8px",
            }}
            aria-label={`Remove ${label}`}
            type="button"
          >
            ×
          </button>
        </div>
      ) : (
        <Upload showUploadList={false} beforeUpload={handleFile} accept={accept}>
          <div
            style={{
              border: "2px dashed #5f0f9c",
              borderRadius: 14,
              padding: "22px 16px",
              textAlign: "center",
              cursor: "pointer",
              background: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)",
              transition: "all .2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#7c3aed";
              e.currentTarget.style.background = "linear-gradient(135deg, #f3e8ff 0%, #ede9fe 100%)";
              e.currentTarget.style.transform = "scale(1.01)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#5f0f9c";
              e.currentTarget.style.background = "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {uploading ? (
              <Spin size="small" />
            ) : (
              <>
                <UploadOutlined
                  style={{ fontSize: 24, color: "#5f0f9c", display: "block", marginBottom: 8 }}
                />
                <div style={{ fontSize: 12, fontWeight: 700, color: "#5f0f9c" }}>
                  Click to upload
                </div>
                <div style={{ fontSize: 11, color: "#7c3aed", marginTop: 2 }}>
                  {type === "profile" ? "PNG, JPG up to 2MB" : "PDF or image"}
                </div>
              </>
            )}
          </div>
        </Upload>
      )}
    </div>
  );
};

/* ── Table Helpers ── */
const StatusPill = ({ active }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "6px 14px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 700,
      border: "1px solid",
      width: "fit-content",
      background: active ? "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)" : "#f9fafb",
      borderColor: active ? "#86efac" : "#e5e7eb",
      color: active ? "#15803d" : "#6b7280",
    }}
  >
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: active ? "#22c55e" : "#9ca3af",
        boxShadow: active ? "0 0 0 3px rgba(34, 197, 94, 0.2)" : "none",
      }}
    />
    {active ? "Active" : "Inactive"}
  </span>
);

const specColor = (s = "") => {
  const map = {
    Luxury: "purple",
    Residential: "blue",
    Commercial: "gold",
    "Off-Plan": "geekblue",
    Rental: "green",
    Investment: "magenta",
  };
  return map[s] || "default";
};

/* ── AgentRow ── */
const AgentRow = ({ agent, onView, onDelete, delay = 0 }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "2.4fr 1.6fr 1.25fr 1.2fr .9fr 1fr 120px",
      alignItems: "center",
      gap: 14,
      padding: "16px 20px",
      borderBottom: "1px solid #f3f4f6",
      transition: "all .2s ease",
      animation: `rowFadeIn .25s ease ${delay}s both`,
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "linear-gradient(90deg, rgba(95,15,156,0.05) 0%, rgba(124,58,237,0.03) 100%)";
      e.currentTarget.style.transform = "translateX(4px)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "transparent";
      e.currentTarget.style.transform = "translateX(0)";
    }}
  >
    {/* Agent */}
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <AgentAvatar name={agent.name} src={agent.avatar} size={44} showDot active={agent.status} />
      <div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: "#111827",
            maxWidth: 200,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={agent.name}
        >
          {agent.name}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#9CA3AF",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            maxWidth: 220,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontWeight: 600,
            marginTop: 2,
          }}
          title={agent.email}
        >
          <MailOutlined style={{ fontSize: 12, color: "#5f0f9c" }} />
          {agent.email ? (
            <a
              href={`mailto:${agent.email}`}
              style={{ color: "inherit", textDecoration: "none" }}
              onMouseEnter={(e) => (e.target.style.color = "#5f0f9c")}
              onMouseLeave={(e) => (e.target.style.color = "inherit")}
            >
              {agent.email}
            </a>
          ) : (
            "--"
          )}
        </div>
      </div>
    </div>

    {/* Contact */}
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div
        style={{
          fontSize: 12,
          color: "#9CA3AF",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontWeight: 600,
        }}
        title={agent.phone}
      >
        <PhoneOutlined style={{ color: "#5f0f9c", fontSize: 12 }} />
        {agent.phone ? (
          <a
            href={`tel:${agent.phone}`}
            style={{ color: "inherit", textDecoration: "none" }}
            onMouseEnter={(e) => (e.target.style.color = "#5f0f9c")}
            onMouseLeave={(e) => (e.target.style.color = "inherit")}
          >
            {agent.phone}
          </a>
        ) : (
          "--"
        )}
      </div>
      <span
        style={{
          fontSize: 11,
          color: "#9CA3AF",
          fontWeight: 700,
          padding: "2px 8px",
          background: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)",
          borderRadius: 6,
          width: "fit-content",
        }}
      >
        {agent.role || "Agent"}
      </span>
    </div>

    {/* City */}
    <div>
      <div
        style={{
          fontSize: 12,
          color: "#374151",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontWeight: 600,
        }}
        title={agent.city}
      >
        <EnvironmentOutlined style={{ color: "#0891B2", fontSize: 12 }} />
        {agent.city || "--"}
      </div>
      {agent.country && (
        <div
          style={{
            fontSize: 11,
            color: "#9CA3AF",
            marginTop: 2,
            paddingLeft: 18,
          }}
        >
          {agent.country}
        </div>
      )}
    </div>

    {/* Specialization */}
    <div>
      {agent.specialization ? (
        <Tag
          color={specColor(agent.specialization)}
          style={{
            borderRadius: 999,
            border: "none",
            fontWeight: 700,
            fontSize: 11,
            padding: "4px 12px",
            margin: 0,
            background: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)",
            color: "#5f0f9c",
          }}
        >
          {agent.specialization}
        </Tag>
      ) : (
        <span style={{ color: "#D1D5DB", fontSize: 12 }}>--</span>
      )}
    </div>

    {/* Exp */}
    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#374151" }}>
      {agent.experience ? (
        <>
          <TrophyOutlined style={{ color: "#D97706", fontSize: 14 }} />
          <span style={{ fontWeight: 800, fontSize: 13 }}>{agent.experience}yr</span>
        </>
      ) : (
        <span style={{ color: "#D1D5DB", fontSize: 12 }}>--</span>
      )}
    </div>

    {/* Status */}
    <div>
      <StatusPill active={!!agent.status} />
    </div>

    {/* Actions */}
    <div
      style={{
        display: "flex",
        gap: 8,
        justifyContent: "flex-end",
        opacity: 0.6,
        transition: "opacity .15s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.6)}
    >
      <Tooltip title="View Details">
        <Button
          type="text"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => onView(agent)}
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            color: "#5f0f9c",
            background: "#fff",
          }}
        />
      </Tooltip>

      <Popconfirm
        title="Remove Agent"
        description="Remove this agent from your team?"
        onConfirm={() => onDelete(agent.id)}
        okText="Remove"
        okType="danger"
        cancelText="Cancel"
        placement="topRight"
      >
        <Tooltip title="Remove">
          <Button
            type="text"
            danger
            size="small"
            icon={<DeleteOutlined />}
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              border: "1px solid #fca5a5",
              background: "#fff",
            }}
          />
        </Tooltip>
      </Popconfirm>
    </div>
  </div>
);

/* ── View Agent Modal ── */
const ViewAgentModal = ({ open, onClose, agent }) => {
  if (!agent) return null;

  const isActive = agent.status === true;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={600}
      centered
      footer={null}
      styles={{
        content: {
          borderRadius: 24,
          padding: 0,
          overflow: "hidden",
          boxShadow: "0 25px 60px -12px rgba(95, 15, 156, 0.3)",
        },
      }}
    >
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.3); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .vaBanner {
          background: linear-gradient(135deg, #5f0f9c 0%, #7c3aed 50%, #a855f7 100%);
          padding: 32px 28px 70px;
          position: relative;
          overflow: hidden;
        }

        .vaBanner::before {
          content: '';
          position: absolute;
          top: -60%;
          right: -15%;
          width: 320px;
          height: 320px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 50%;
        }

        .vaBanner::after {
          content: '';
          position: absolute;
          bottom: -40%;
          left: -15%;
          width: 250px;
          height: 250px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 50%;
        }

        .vaBadge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          backdrop-filter: blur(10px);
        }

        .vaBadge.active {
          background: rgba(255, 255, 255, 0.2);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .vaBadge.inactive {
          background: rgba(0, 0, 0, 0.2);
          color: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .vaStatsGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: -50px;
          padding: 0 20px 20px;
          position: relative;
          z-index: 1;
        }

        .vaMiniStat {
          background: #fff;
          border-radius: 18px;
          padding: 18px 14px;
          text-align: center;
          box-shadow: 0 8px 24px rgba(95, 15, 156, 0.12);
          border: 1px solid rgba(95, 15, 156, 0.08);
          transition: all 0.25s ease;
        }

        .vaMiniStat:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(95, 15, 156, 0.18);
        }

        .vaMiniStatIcon {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
          font-size: 20px;
        }

        .vaMiniStatValue {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          line-height: 1;
          margin-bottom: 4px;
        }

        .vaMiniStatLabel {
          font-size: 10px;
          color: #64748b;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .vaSection {
          background: #fff;
          border-radius: 18px;
          margin: 0 20px 14px;
          padding: 20px 22px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
          border: 1px solid #f1f5f9;
        }

        .vaSectionTitle {
          font-size: 11px;
          font-weight: 800;
          color: #5f0f9c;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .vaSectionTitle::after {
          content: '';
          flex: 1;
          height: 2px;
          background: linear-gradient(90deg, #e9d5ff, transparent);
          border-radius: 2px;
        }

        .vaInfoRow {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px dashed #f1f5f9;
        }

        .vaInfoRow:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .vaInfoLabel {
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .vaInfoLabelIcon {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
        }

        .vaInfoValue {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
          text-align: right;
        }

        .vaInfoValue.empty {
          color: #cbd5e1;
          font-weight: 500;
        }

        .vaDocCard {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
          border-radius: 14px;
          border: 1px solid #e9d5ff;
          margin-bottom: 10px;
          transition: all 0.2s ease;
        }

        .vaDocCard:last-child {
          margin-bottom: 0;
        }

        .vaDocCard:hover {
          transform: translateX(4px);
          border-color: #5f0f9c;
        }

        .vaDocIcon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
          background: #fff;
        }

        .vaDocInfo {
          flex: 1;
          min-width: 0;
        }

        .vaDocName {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 2px;
        }

        .vaDocMeta {
          font-size: 11px;
          color: #7c3aed;
        }

        .vaDocLink {
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 700;
          background: linear-gradient(135deg, #5f0f9c 0%, #7c3aed 100%);
          color: #fff;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          box-shadow: 0 4px 12px rgba(95, 15, 156, 0.3);
        }

        .vaDocLink:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(95, 15, 156, 0.4);
        }

        .vaFooter {
          padding: 16px 20px 28px;
          display: flex;
          gap: 12px;
        }

        .vaVerified {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 10px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 700;
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          color: #16a34a;
          margin-left: 8px;
        }
      `}</style>

      {/* Banner */}
      <div className="vaBanner">
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ position: "relative" }}>
              <AgentAvatar name={agent.name} src={agent.avatar} size={80} />
              <div
                style={{
                  position: "absolute",
                  bottom: 4,
                  right: 4,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: isActive ? "#22c55e" : "#94a3b8",
                  border: "3px solid #fff",
                  boxShadow: `0 0 0 3px ${isActive ? "rgba(34,197,94,0.3)" : "rgba(148,163,184,0.3)"}`,
                }}
              />
            </div>
            <div>
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: "#fff",
                  margin: "0 0 6px",
                  letterSpacing: "-0.5px",
                }}
              >
                {agent.name}
              </h2>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 10 }}>
                {agent.role || "Real Estate Agent"}
              </div>
              <div className={`vaBadge ${isActive ? "active" : "inactive"}`}>
                {isActive && (
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#4ade80",
                      animation: "pulse 2s infinite",
                    }}
                  />
                )}
                {isActive ? "Active Now" : "Offline"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="vaStatsGrid">
        <div className="vaMiniStat">
          <div
            className="vaMiniStatIcon"
            style={{ background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", color: "#d97706" }}
          >
            <TrophyOutlined />
          </div>
          <div className="vaMiniStatValue">{agent.experience || 0}</div>
          <div className="vaMiniStatLabel">Years Exp.</div>
        </div>
        <div className="vaMiniStat">
          <div
            className="vaMiniStatIcon"
            style={{ background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)", color: "#2563eb" }}
          >
            <EnvironmentOutlined />
          </div>
          <div className="vaMiniStatValue" style={{ fontSize: 16 }}>
            {agent.city || "—"}
          </div>
          <div className="vaMiniStatLabel">Location</div>
        </div>
        <div className="vaMiniStat">
          <div
            className="vaMiniStatIcon"
            style={{
              background: agent.specialization ? "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)" : "#f1f5f9",
              color: agent.specialization ? "#5f0f9c" : "#94a3b8",
            }}
          >
            <FileDoneOutlined />
          </div>
          <div className="vaMiniStatValue" style={{ fontSize: 14 }}>
            {agent.specialization || "—"}
          </div>
          <div className="vaMiniStatLabel">Specialization</div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="vaSection">
        <div className="vaSectionTitle">📞 Contact Information</div>
        <div className="vaInfoRow">
          <div className="vaInfoLabel">
            <div
              className="vaInfoLabelIcon"
              style={{ background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", color: "#d97706" }}
            >
              <MailOutlined />
            </div>
            Email Address
          </div>
          <div className={`vaInfoValue ${!agent.email ? "empty" : ""}`}>
            {agent.email || "Not provided"}
          </div>
        </div>
        <div className="vaInfoRow">
          <div className="vaInfoLabel">
            <div
              className="vaInfoLabelIcon"
              style={{ background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)", color: "#2563eb" }}
            >
              <PhoneOutlined />
            </div>
            Phone Number
          </div>
          <div className={`vaInfoValue ${!agent.phone ? "empty" : ""}`}>
            {agent.phone || "Not provided"}
          </div>
        </div>
        <div className="vaInfoRow">
          <div className="vaInfoLabel">
            <div
              className="vaInfoLabelIcon"
              style={{ background: "linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)", color: "#db2777" }}
            >
              <EnvironmentOutlined />
            </div>
            Location
          </div>
          <div className={`vaInfoValue ${!(agent.city || agent.country) ? "empty" : ""}`}>
            {[agent.city, agent.country].filter(Boolean).join(", ") || "Not specified"}
          </div>
        </div>
      </div>

      {/* Professional Details */}
      <div className="vaSection">
        <div className="vaSectionTitle">💼 Professional Details</div>
        <div className="vaInfoRow">
          <div className="vaInfoLabel">
            <div
              className="vaInfoLabelIcon"
              style={{ background: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)", color: "#4f46e5" }}
            >
              <TeamOutlined />
            </div>
            Role
          </div>
          <div className="vaInfoValue">{agent.role || "Agent"}</div>
        </div>
        <div className="vaInfoRow">
          <div className="vaInfoLabel">
            <div
              className="vaInfoLabelIcon"
              style={{ background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", color: "#d97706" }}
            >
              <TrophyOutlined />
            </div>
            Experience
          </div>
          <div className="vaInfoValue">{agent.experience ? `${agent.experience} Years` : "—"}</div>
        </div>
        <div className="vaInfoRow">
          <div className="vaInfoLabel">
            <div
              className="vaInfoLabelIcon"
              style={{ background: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)", color: "#16a34a" }}
            >
              <FileDoneOutlined />
            </div>
            RERA Number
          </div>
          <div className={`vaInfoValue ${!agent.reraNumber ? "empty" : ""}`}>
            {agent.reraNumber ? (
              <>
                {agent.reraNumber}
                <span className="vaVerified">✓ Verified</span>
              </>
            ) : (
              "Not registered"
            )}
          </div>
        </div>
        <div className="vaInfoRow">
          <div className="vaInfoLabel">
            <div
              className="vaInfoLabelIcon"
              style={{ background: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)", color: "#5f0f9c" }}
            >
              <CheckCircleFilled />
            </div>
            Specialization
          </div>
          <div className="vaInfoValue">{agent.specialization || "—"}</div>
        </div>
      </div>

      {/* Documents */}
      {(agent.idProof || agent.reraCertificate) && (
        <div className="vaSection">
          <div className="vaSectionTitle">📄 Documents & Certificates</div>
          {agent.idProof && (
            <div className="vaDocCard">
              <div className="vaDocIcon">🪪</div>
              <div className="vaDocInfo">
                <div className="vaDocName">ID Proof</div>
                <div className="vaDocMeta">Government issued identification</div>
              </div>
              <a href={agent.idProof} target="_blank" rel="noopener noreferrer" className="vaDocLink">
                View
              </a>
            </div>
          )}
          {agent.reraCertificate && (
            <div className="vaDocCard">
              <div className="vaDocIcon">📜</div>
              <div className="vaDocInfo">
                <div className="vaDocName">RERA Certificate</div>
                <div className="vaDocMeta">Real Estate Regulatory Agency</div>
              </div>
              <a href={agent.reraCertificate} target="_blank" rel="noopener noreferrer" className="vaDocLink">
                View
              </a>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="vaFooter">
        <Button
          type="primary"
          icon={<EditOutlined />}
          size="large"
          style={{
            flex: 1,
            height: 50,
            borderRadius: 14,
            fontWeight: 700,
            fontSize: 15,
            background: "linear-gradient(135deg, #5f0f9c 0%, #7c3aed 100%)",
            border: "none",
            boxShadow: "0 8px 20px rgba(95, 15, 156, 0.35)",
          }}
        >
          Edit Profile
        </Button>
        <Button
          size="large"
          onClick={onClose}
          style={{
            flex: 1,
            height: 50,
            borderRadius: 14,
            fontWeight: 700,
            fontSize: 15,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            color: "#475569",
          }}
        >
          Close
        </Button>
      </div>
    </Modal>
  );
};

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
const AgencyManageAgents = () => {
  const { user } = useSelector((s) => s.auth);
  const agencyId = user?._id || user?.id;

  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();

  const [urls, setUrls] = useState({ profile: "", idProof: "", rera: "" });
  const [uploadFiles, setUploadFiles] = useState({ profile: null, idProof: null, rera: null });
  const [uploading, setUploading] = useState({ profile: false, idProof: false, rera: false });

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);

  /* ── Fetch agents ── */
  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.get("/agent/get-all-agents/agency");
      const data = res?.data;
      if (!Array.isArray(data)) {
        setAgents(loadFromStorage());
        return;
      }

      const formatted = data.map((a) => ({
        id: a._id,
        name: `${a.first_name || ""} ${a.last_name || ""}`.trim(),
        email: a.email || "",
        phone: `${a.country_code || ""} ${a.phone_number || ""}`.trim(),
        role: a.role || "Agent",
        status: a.status ?? true,
        avatar: a.profile_photo || null,
        city: a.operating_city || "",
        country: a.country || "",
        specialization: a.specialization || "",
        experience: a.experience_years || null,
        reraNumber: a.rera_number || "",
        idProof: a.id_proof || null,
        reraCertificate: a.rera_certificate || null,
      }));

      setAgents(formatted);
      saveToStorage(formatted);
    } catch {
      setAgents(loadFromStorage());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  /* ── Filter ── */
  const filteredAgents = agents.filter((a) => {
    const q = searchQuery.toLowerCase();
    const ms =
      !q ||
      (a.name || "").toLowerCase().includes(q) ||
      (a.email || "").toLowerCase().includes(q) ||
      (a.phone || "").toLowerCase().includes(q) ||
      (a.city || "").toLowerCase().includes(q);

    const mf =
      statusFilter === "all" ||
      (statusFilter === "active" && a.status) ||
      (statusFilter === "inactive" && !a.status);

    return ms && mf;
  });

  /* ── File Upload ── */
  const handleUpload = async (file, type) => {
    const allowed =
      type === "profile"
        ? ["image/jpeg", "image/png", "image/jpg", "image/webp"]
        : ["application/pdf", "image/jpeg", "image/png", "image/jpg"];

    if (!allowed.includes(file.type)) {
      toast.error("Invalid file type");
      return false;
    }

    setUploading((p) => ({ ...p, [type]: true }));
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await apiService.upload("upload", fd);
      const uploadedUrl = res?.file?.url || res?.url;

      if (uploadedUrl) {
        setUrls((p) => ({ ...p, [type]: uploadedUrl }));
        setUploadFiles((p) => ({ ...p, [type]: file }));
        toast.success(`${type === "profile" ? "Photo" : type.toUpperCase()} uploaded`);
      }
    } catch {
      setUrls((p) => ({ ...p, [type]: URL.createObjectURL(file) }));
      setUploadFiles((p) => ({ ...p, [type]: file }));
    } finally {
      setUploading((p) => ({ ...p, [type]: false }));
    }

    return false;
  };

  const removeFile = (type) => {
    setUrls((p) => ({ ...p, [type]: "" }));
    setUploadFiles((p) => ({ ...p, [type]: null }));
  };

  /* ── Reset ── */
  const resetModal = () => {
    form.resetFields();
    setUrls({ profile: "", idProof: "", rera: "" });
    setUploadFiles({ profile: null, idProof: null, rera: null });
    setCurrentStep(0);
  };
  const closeAddModal = () => {
    setAddModalOpen(false);
    resetModal();
  };

  /* ── Step validation ── */
  const STEP0_FIELDS = ["first_name", "last_name", "email", "password", "phone_number"];
  const STEP1_FIELDS = ["operating_city"];

  const handleNext = async () => {
    try {
      if (currentStep === 0) await form.validateFields(STEP0_FIELDS);
      if (currentStep === 1) await form.validateFields(STEP1_FIELDS);
      setCurrentStep((s) => s + 1);
    } catch {
      // Validation errors shown by Ant Design
    }
  };

  /* ── Submit ── */
  const handleAddAgent = async () => {
    try {
      await form.validateFields([...STEP0_FIELDS, ...STEP1_FIELDS]);
    } catch {
      toast.error("Please complete all required fields");
      return;
    }

    const v = form.getFieldsValue(true);

    const payload = {
      first_name: (v.first_name || "").trim(),
      last_name: (v.last_name || "").trim(),
      email: (v.email || "").trim(),
      password: v.password || "",
      phone_number: (v.phone_number || "").trim(),
      country_code: v.country_code || "+971",
      operating_city: (v.operating_city || "").trim(),
      specialization: v.specialization || "",
      country: (v.country || "UAE").trim(),
      experience_years: Number(v.experience_years) || 0,
      rera_number: (v.rera_number || "").trim(),
      profile_photo: urls.profile || null,
      id_proof: urls.idProof || null,
      rera_certificate: urls.rera || null,
      agency_id: agencyId,
    };

    const localAgent = {
      id: Date.now().toString(),
      name: `${payload.first_name} ${payload.last_name}`.trim(),
      email: payload.email,
      phone: `${payload.country_code} ${payload.phone_number}`.trim(),
      city: payload.operating_city,
      country: payload.country,
      specialization: payload.specialization,
      experience: payload.experience_years || null,
      reraNumber: payload.rera_number,
      status: true,
      avatar: urls.profile || null,
      idProof: urls.idProof || null,
      reraCertificate: urls.rera || null,
      role: "Agent",
    };

    try {
      await apiService.post("/agent/agent-signup", payload);
      toast.success("Agent created successfully!");
    } catch (err) {
      const msg = err?.response?.data?.message || "";
      toast.error(msg || "API error — saved locally");
    }

    const updated = [...agents, localAgent];
    setAgents(updated);
    saveToStorage(updated);
    closeAddModal();
  };

  /* ── Delete ── */
  const handleDelete = async (id) => {
    try {
      await apiService.delete(`agent/delete-agent/${id}`);
    } catch {}
    const updated = agents.filter((a) => a.id !== id);
    setAgents(updated);
    saveToStorage(updated);
    toast.success("Agent removed");
  };

  const total = agents.length;
  const active = agents.filter((a) => a.status).length;
  const inactive = total - active;

  return (
    <div
      style={{
        padding: "28px 24px",
        background: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #ede9fe 100%)",
        minHeight: "100vh",
        fontFamily: "'DM Sans', -apple-system, sans-serif",
      }}
    >
      <style>{`
        @keyframes rowFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }

        .flt-btn {
          padding: 8px 18px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: #fff;
          font-size: 12px;
          font-weight: 700;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .flt-btn.flt-active {
          background: linear-gradient(135deg, #5f0f9c 0%, #7c3aed 100%);
          color: #fff;
          border-color: #5f0f9c;
          box-shadow: 0 6px 20px rgba(95, 15, 156, 0.3);
        }
        .flt-btn:hover:not(.flt-active) {
          border-color: #5f0f9c;
          color: #5f0f9c;
          background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
        }

        .agTable {
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(233, 213, 255, 0.8);
          border-radius: 20px;
          box-shadow: 0 8px 30px rgba(95, 15, 156, 0.1);
          overflow: hidden;
          backdrop-filter: blur(10px);
        }

        .agHeader {
          background: linear-gradient(135deg, #5f0f9c 0%, #7c3aed 100%);
          padding: 14px 20px;
        }

        .agHeaderRow {
          display: grid;
          grid-template-columns: 2.4fr 1.6fr 1.25fr 1.2fr .9fr 1fr 120px;
          align-items: center;
          gap: 14px;
        }

        .agHeaderCell {
          font-size: 11px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.9);
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .agBody { background: #fff; }
      `}</style>

      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 28,
            gap: 12,
            flexWrap: "wrap",
            animation: "fadeUp .3s ease",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  background: "linear-gradient(135deg, #5f0f9c 0%, #7c3aed 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 6px 16px rgba(95, 15, 156, 0.3)",
                }}
              >
                <TeamOutlined style={{ color: "#fff", fontSize: 20 }} />
              </div>
              <h1
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: "#1e1b4b",
                  margin: 0,
                  letterSpacing: "-0.5px",
                }}
              >
                Team Management
              </h1>
            </div>
            <p style={{ fontSize: 14, color: "#7c3aed", margin: 0, marginLeft: 54, fontWeight: 500 }}>
              Manage and monitor your agency&apos;s real estate agents
            </p>
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setAddModalOpen(true)}
            style={{
              borderRadius: 14,
              paddingInline: 24,
              fontWeight: 700,
              height: 48,
              fontSize: 15,
              background: "linear-gradient(135deg, #5f0f9c 0%, #7c3aed 100%)",
              border: "none",
              boxShadow: "0 8px 24px rgba(95, 15, 156, 0.35)",
            }}
          >
            Add New Agent
          </Button>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            marginBottom: 24,
            animation: "fadeUp .35s ease",
          }}
        >
          <StatCard
            title="Total Agents"
            value={total}
            accent="#5f0f9c"
            bg="linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)"
            icon={<TeamOutlined />}
          />
          <StatCard
            title="Active"
            value={active}
            accent="#16a34a"
            bg="linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)"
            icon={<CheckCircleFilled />}
          />
          <StatCard
            title="Inactive"
            value={inactive}
            accent="#dc2626"
            bg="linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)"
            icon={<UserOutlined />}
          />
        </div>

        {/* Filters */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.9)",
            border: "1px solid #e9d5ff",
            borderRadius: 16,
            padding: "16px 20px",
            marginBottom: 16,
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
            boxShadow: "0 4px 16px rgba(95, 15, 156, 0.08)",
            backdropFilter: "blur(10px)",
            animation: "fadeUp .4s ease",
          }}
        >
          <Input
            size="large"
            allowClear
            placeholder="Search by name, email, phone, city..."
            prefix={<SearchOutlined style={{ color: "#5f0f9c" }} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              minWidth: 220,
              borderRadius: 14,
              borderColor: "#e9d5ff",
              fontSize: 14,
            }}
          />

          <div
            style={{
              display: "flex",
              gap: 6,
              background: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)",
              border: "1px solid #e9d5ff",
              borderRadius: 14,
              padding: 5,
            }}
          >
            {["all", "active", "inactive"].map((f) => (
              <button
                key={f}
                className={`flt-btn${statusFilter === f ? " flt-active" : ""}`}
                onClick={() => setStatusFilter(f)}
                type="button"
              >
                {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <Text
            style={{
              fontSize: 13,
              color: "#7c3aed",
              whiteSpace: "nowrap",
              fontWeight: 700,
            }}
          >
            {filteredAgents.length} of {agents.length} agents
          </Text>
        </div>

        {/* Table */}
        <div className="agTable" style={{ animation: "fadeUp .45s ease" }}>
          <div className="agHeader">
            <div className="agHeaderRow">
              {["Agent", "Contact", "City", "Specialization", "Exp.", "Status", "Actions"].map((h) => (
                <div key={h} className="agHeaderCell">
                  {h}
                </div>
              ))}
            </div>
          </div>

          <div className="agBody">
            {loading ? (
              <div style={{ padding: 80, textAlign: "center" }}>
                <Spin size="large" tip="Loading team..." />
              </div>
            ) : filteredAgents.length === 0 ? (
              <Empty
                description={
                  <div style={{ color: "#7c3aed" }}>
                    <p style={{ marginBottom: 12, fontSize: 15, fontWeight: 600 }}>
                      No agents found
                    </p>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setAddModalOpen(true)}
                      style={{
                        borderRadius: 14,
                        background: "linear-gradient(135deg, #5f0f9c 0%, #7c3aed 100%)",
                        border: "none",
                        boxShadow: "0 6px 18px rgba(95, 15, 156, 0.3)",
                      }}
                    >
                      Add first agent
                    </Button>
                  </div>
                }
                style={{ padding: "80px 20px" }}
              />
            ) : (
              filteredAgents.map((agent, i) => (
                <AgentRow
                  key={agent.id}
                  agent={agent}
                  delay={i * 0.03}
                  onView={(a) => {
                    setSelectedAgent(a);
                    setViewModalOpen(true);
                  }}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* ADD AGENT MODAL */}
      <Modal
        open={addModalOpen}
        onCancel={closeAddModal}
        width={760}
        centered
        footer={null}
        destroyOnClose={false}
        styles={{
          content: {
            borderRadius: 24,
            padding: 0,
            overflow: "hidden",
            boxShadow: "0 25px 60px -12px rgba(95, 15, 156, 0.3)",
          },
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px 28px 20px",
            borderBottom: "1px solid #f3f4f6",
            background: "linear-gradient(135deg, #5f0f9c 0%, #7c3aed 100%)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: "rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UserOutlined style={{ color: "#fff", fontSize: 20 }} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-.3px" }}>
                Register New Agent
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>
                Step {currentStep + 1} of 3
              </div>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div style={{ padding: "20px 28px 0" }}>
          <Steps
            current={currentStep}
            size="small"
            items={[
              { title: "Personal", icon: <UserOutlined /> },
              { title: "Professional", icon: <TrophyOutlined /> },
              { title: "Documents", icon: <FileDoneOutlined /> },
            ]}
            style={{ marginBottom: 24 }}
          />
        </div>

        {/* Form */}
        <Form form={form} layout="vertical" preserve style={{ padding: "0 28px 12px" }}>
          {/* STEP 0 */}
          <div style={{ display: currentStep === 0 ? "block" : "none" }}>
            <Alert
              message="Personal Information"
              description="Basic details for the agent's account."
              type="info"
              showIcon
              style={{
                borderRadius: 14,
                marginBottom: 22,
                border: "none",
                background: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)",
              }}
            />
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="first_name"
                  label="First Name"
                  rules={[{ required: true, message: "First name is required" }]}
                >
                  <Input size="large" placeholder="e.g. Sarah" style={{ borderRadius: 14 }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="last_name"
                  label="Last Name"
                  rules={[{ required: true, message: "Last name is required" }]}
                >
                  <Input size="large" placeholder="e.g. Ahmed" style={{ borderRadius: 14 }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="email"
                  label="Email Address"
                  rules={[{ required: true, type: "email", message: "Valid email required" }]}
                >
                  <Input
                    size="large"
                    placeholder="agent@realestate.com"
                    prefix={<MailOutlined style={{ color: "#5f0f9c" }} />}
                    style={{ borderRadius: 14, borderColor: "#e9d5ff" }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="password"
                  label="Temporary Password"
                  rules={[{ required: true, min: 6, message: "Min 6 characters" }]}
                >
                  <Input.Password
                    size="large"
                    placeholder="Create a password"
                    style={{ borderRadius: 14 }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="country_code" label="Country Code" initialValue="+971">
                  <Select
                    size="large"
                    style={{ borderRadius: 14 }}
                    dropdownStyle={{ borderRadius: 14 }}
                  >
                    {COUNTRY_CODES.map((c) => (
                      <Option key={c.code} value={c.code}>
                        {c.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={16}>
                <Form.Item
                  name="phone_number"
                  label="Phone Number"
                  rules={[{ required: true, message: "Phone number is required" }]}
                >
                  <Input
                    size="large"
                    placeholder="50 123 4567"
                    prefix={<PhoneOutlined style={{ color: "#5f0f9c" }} />}
                    style={{ borderRadius: 14, borderColor: "#e9d5ff" }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* STEP 1 */}
          <div style={{ display: currentStep === 1 ? "block" : "none" }}>
            <Alert
              message="Professional Details"
              description="Expertise, location and qualifications."
              type="info"
              showIcon
              style={{
                borderRadius: 14,
                marginBottom: 22,
                border: "none",
                background: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)",
              }}
            />
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item name="country" label="Country" initialValue="UAE">
                  <Input
                    size="large"
                    placeholder="e.g. UAE"
                    prefix={<EnvironmentOutlined style={{ color: "#5f0f9c" }} />}
                    style={{ borderRadius: 14, borderColor: "#e9d5ff" }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="operating_city"
                  label="Operating City"
                  rules={[{ required: true, message: "City is required" }]}
                >
                  <Input
                    size="large"
                    placeholder="e.g. Dubai"
                    prefix={<EnvironmentOutlined style={{ color: "#0891B2" }} />}
                    style={{ borderRadius: 14, borderColor: "#e9d5ff" }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="experience_years" label="Experience (Years)">
                  <InputNumber
                    size="large"
                    min={0}
                    max={50}
                    placeholder="0"
                    style={{ width: "100%", borderRadius: 14 }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="specialization" label="Specialization">
                  <Select
                    size="large"
                    placeholder="Select..."
                    allowClear
                    style={{ borderRadius: 14 }}
                  >
                    {SPECIALIZATIONS.map((s) => (
                      <Option key={s} value={s}>
                        {s}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="rera_number" label="RERA Number">
                  <Input
                    size="large"
                    placeholder="e.g. RERA-2024-001"
                    prefix={<FileDoneOutlined style={{ color: "#5f0f9c" }} />}
                    style={{ borderRadius: 14, borderColor: "#e9d5ff" }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* STEP 2 */}
          <div style={{ display: currentStep === 2 ? "block" : "none" }}>
            <Alert
              message="Documents & Media"
              description="Upload verification documents for this agent."
              type="info"
              showIcon
              style={{
                borderRadius: 14,
                marginBottom: 22,
                border: "none",
                background: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)",
              }}
            />
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <UploadField
                  type="profile"
                  label="Profile Photo"
                  accept="image/*"
                  fileObj={uploadFiles.profile}
                  uploading={uploading.profile}
                  onUpload={handleUpload}
                  onRemove={removeFile}
                />
              </Col>
              <Col xs={24} md={8}>
                <UploadField
                  type="idProof"
                  label="ID Proof"
                  accept=".pdf,image/*"
                  fileObj={uploadFiles.idProof}
                  uploading={uploading.idProof}
                  onUpload={handleUpload}
                  onRemove={removeFile}
                />
              </Col>
              <Col xs={24} md={8}>
                <UploadField
                  type="rera"
                  label="RERA Certificate"
                  accept=".pdf,image/*"
                  fileObj={uploadFiles.rera}
                  uploading={uploading.rera}
                  onUpload={handleUpload}
                  onRemove={removeFile}
                />
              </Col>
            </Row>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 28,
              paddingTop: 20,
              borderTop: "1px solid #f3f4f6",
            }}
          >
            {currentStep > 0 ? (
              <Button
                size="large"
                icon={<ArrowLeftOutlined />}
                onClick={() => setCurrentStep((s) => s - 1)}
                style={{ borderRadius: 14, fontWeight: 700 }}
              >
                Back
              </Button>
            ) : (
              <div />
            )}

            <Space>
              <Button
                size="large"
                onClick={closeAddModal}
                style={{ borderRadius: 14, fontWeight: 700, borderColor: "#e9d5ff" }}
              >
                Cancel
              </Button>

              {currentStep < 2 ? (
                <Button
                  size="large"
                  type="primary"
                  onClick={handleNext}
                  icon={<ArrowRightOutlined />}
                  style={{
                    borderRadius: 14,
                    paddingInline: 26,
                    fontWeight: 700,
                    fontSize: 15,
                    background: "linear-gradient(135deg, #5f0f9c 0%, #7c3aed 100%)",
                    border: "none",
                    boxShadow: "0 8px 20px rgba(95, 15, 156, 0.3)",
                  }}
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  size="large"
                  type="primary"
                  onClick={handleAddAgent}
                  icon={<CheckOutlined />}
                  style={{
                    borderRadius: 14,
                    paddingInline: 26,
                    fontWeight: 700,
                    fontSize: 15,
                    background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                    border: "none",
                    boxShadow: "0 8px 20px rgba(22, 163, 74, 0.3)",
                  }}
                >
                  Create Agent
                </Button>
              )}
            </Space>
          </div>
        </Form>
      </Modal>

      {/* VIEW AGENT MODAL */}
      <ViewAgentModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        agent={selectedAgent}
      />
    </div>
  );
};

export default AgencyManageAgents;