import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import {
  Typography, Image, Button, Spin, Row, Col,
  Descriptions, Collapse, Timeline, message, Modal, Input
} from "antd";
import {
  ArrowLeftOutlined, EnvironmentOutlined, BankOutlined,
  CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined,
  StarFilled, DollarOutlined, CarOutlined,
  ThunderboltOutlined, FilePdfOutlined, CalendarOutlined,
  HomeOutlined, AppstoreOutlined, EyeOutlined,
  ColumnWidthOutlined, KeyOutlined, BulbOutlined, InfoCircleOutlined,
  TagOutlined, BuildOutlined, ExpandOutlined, NodeIndexOutlined,
} from "@ant-design/icons";

const { Paragraph } = Typography;
const { Panel } = Collapse;

/* ─── Design tokens ──────────────────────────────────────────────── */
const T = {
  brand:       "#5c039b",
  brandLight:  "#f5f0ff",
  brandMid:    "#7c3aed",
  brandBorder: "#e4d4f8",
  green:       "#059669",
  greenLight:  "#ecfdf5",
  amber:       "#d97706",
  amberLight:  "#fffbeb",
  red:         "#dc2626",
  redLight:    "#fef2f2",
  sky:         "#0284c7",
  skyLight:    "#f0f9ff",
  indigo:      "#4f46e5",
  indigoLight: "#eef2ff",
  text:        "#0f172a",
  textMid:     "#374151",
  textSoft:    "#6b7280",
  textXSoft:   "#9ca3af",
  border:      "#e5e7eb",
  borderLight: "#f3f4f6",
  surface:     "#ffffff",
  bg:          "#f9fafb",
  bgAlt:       "#f3f4f6",
};

const STATUS = {
  approved: { color: T.green, bg: T.greenLight, border: "#a7f3d0", icon: <CheckCircleOutlined />, label: "Approved" },
  pending:  { color: T.amber, bg: T.amberLight, border: "#fde68a", icon: <ClockCircleOutlined />,  label: "Pending"  },
  rejected: { color: T.red,   bg: T.redLight,   border: "#fecaca", icon: <CloseCircleOutlined />,  label: "Rejected" },
};

const INV_STATUS = {
  available: { color: T.green,  bg: T.greenLight,  label: "Available" },
  sold:      { color: T.red,    bg: T.redLight,    label: "Sold"      },
  reserved:  { color: T.amber,  bg: T.amberLight,  label: "Reserved"  },
  rented:    { color: T.indigo, bg: T.indigoLight, label: "Rented"    },
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=Inter:wght@300;400;500;600;700&display=swap');

  .pdp * { box-sizing: border-box; }
  .pdp { font-family: 'Inter', sans-serif; color: ${T.text}; }

  .pdp-serif { font-family: 'Lora', Georgia, serif !important; }

  .pdp-card {
    background: #fff;
    border: 1px solid ${T.border};
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 20px;
  }

  .pdp-stat {
    background: #fff;
    border: 1px solid ${T.border};
    border-radius: 14px;
    padding: 18px 20px;
    display: flex; align-items: center; gap: 14px;
    transition: box-shadow 0.2s, border-color 0.2s;
  }
  .pdp-stat:hover {
    box-shadow: 0 4px 20px rgba(92,3,155,0.07);
    border-color: ${T.brandBorder};
  }

  .pdp-chip {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 11px; border-radius: 20px;
    font-size: 11px; font-weight: 600; letter-spacing: 0.2px;
    font-family: 'Inter', sans-serif;
  }

  .pdp-tag {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 13px; border-radius: 8px;
    font-size: 12px; font-weight: 600;
    font-family: 'Inter', sans-serif;
  }

  .pdp-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 20px; border-radius: 9px; border: none;
    font-weight: 600; font-size: 13px; cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: opacity 0.15s, transform 0.12s;
    line-height: 1;
  }
  .pdp-btn:hover { opacity: 0.88; transform: translateY(-1px); }
  .pdp-btn:active { transform: translateY(0); }

  .pdp-back {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 16px; border-radius: 9px;
    background: rgba(255,255,255,0.9);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.5);
    color: ${T.text}; font-weight: 600; font-size: 13px;
    cursor: pointer; font-family: 'Inter', sans-serif;
    box-shadow: 0 1px 6px rgba(0,0,0,0.1);
    transition: background 0.15s;
  }
  .pdp-back:hover { background: #fff; }

  .pdp-sec-title {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 18px;
  }
  .pdp-sec-icon {
    width: 32px; height: 32px; border-radius: 8px;
    background: ${T.brandLight}; border: 1px solid ${T.brandBorder};
    display: flex; align-items: center; justify-content: center;
    color: ${T.brand}; font-size: 14px; flex-shrink: 0;
  }
  .pdp-sec-text {
    font-weight: 700; font-size: 14px; color: ${T.text};
    font-family: 'Inter', sans-serif;
  }
  .pdp-sec-sub {
    font-size: 11px; color: ${T.textSoft}; margin-top: 2px;
    font-family: 'Inter', sans-serif;
  }

  .pdp-label {
    font-size: 10px; font-weight: 700; letter-spacing: 1px;
    text-transform: uppercase; color: ${T.textXSoft};
    font-family: 'Inter', sans-serif;
  }

  .pdp-inv-card {
    background: #fff; border: 1px solid ${T.border};
    border-radius: 13px; padding: 18px;
    transition: all 0.2s ease;
  }
  .pdp-inv-card:hover {
    border-color: ${T.brandBorder};
    box-shadow: 0 4px 20px rgba(92,3,155,0.07);
    transform: translateY(-2px);
  }

  .pdp-photo-wrap {
    border-radius: 10px; overflow: hidden; aspect-ratio: 4/3;
    transition: transform 0.22s; cursor: pointer;
  }
  .pdp-photo-wrap:hover { transform: scale(1.04); }

  .pdp-pill-tab {
    padding: 5px 14px; border-radius: 20px; border: none;
    font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600;
    cursor: pointer; transition: all 0.15s;
  }

  .pdp-progress-bar {
    height: 6px; background: ${T.border}; border-radius: 3px; overflow: hidden;
  }
  .pdp-progress-fill {
    height: 100%; border-radius: 3px;
    background: linear-gradient(90deg, ${T.brandMid}, ${T.brand});
    transition: width 1s ease;
  }

  /* Unit detail modal */
  .unit-modal-header {
    background: linear-gradient(135deg, ${T.brand} 0%, ${T.brandMid} 100%);
    margin: -24px -24px 24px;
    padding: 28px 28px 24px;
    border-radius: 8px 8px 0 0;
  }
  .unit-detail-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid ${T.borderLight};
  }
  .unit-detail-row:last-child { border-bottom: none; }
  .unit-detail-label {
    font-size: 11px; font-weight: 700; letter-spacing: 0.8px;
    text-transform: uppercase; color: ${T.textXSoft};
    font-family: 'Inter', sans-serif;
  }
  .unit-detail-value {
    font-size: 13px; font-weight: 600; color: ${T.textMid};
    font-family: 'Inter', sans-serif;
  }

  .unit-section {
    background: ${T.bg};
    border: 1px solid ${T.border};
    border-radius: 12px;
    padding: 16px 18px;
    margin-bottom: 14px;
  }
  .unit-section-title {
    font-size: 11px; font-weight: 700; letter-spacing: 1px;
    text-transform: uppercase; color: ${T.brand};
    font-family: 'Inter', sans-serif;
    margin-bottom: 12px;
    display: flex; align-items: center; gap: 6px;
  }

  /* Ant override */
  .pdp .ant-descriptions-item-label {
    font-size: 12px !important; font-weight: 600 !important;
    color: ${T.textSoft} !important; background: ${T.bg} !important;
    font-family: 'Inter', sans-serif !important;
  }
  .pdp .ant-descriptions-item-content {
    font-size: 13px !important; color: ${T.textMid} !important;
    font-family: 'Inter', sans-serif !important;
  }
  .pdp .ant-collapse-header {
    font-family: 'Inter', sans-serif !important;
    font-weight: 600 !important; font-size: 13px !important;
    color: ${T.textMid} !important;
  }
  .pdp .ant-collapse-item {
    border-radius: 10px !important; margin-bottom: 8px !important;
    border: 1px solid ${T.border} !important; overflow: hidden;
  }

  /* Unit modal ant override */
  .unit-view-modal .ant-modal-content { border-radius: 12px; overflow: hidden; }
  .unit-view-modal .ant-modal-body { padding: 0; }
  .unit-view-modal .ant-modal-footer { padding: 14px 24px; border-top: 1px solid ${T.border}; }
`;

/* ─── Sub-components ─────────────────────────────────────────────── */

const Stat = ({ icon, label, value, color, bg }) => (
  <div className="pdp-stat">
    <div style={{
      width: 44, height: 44, borderRadius: 11,
      background: bg, color, fontSize: 18, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>{icon}</div>
    <div>
      <div style={{ fontSize: 21, fontWeight: 700, color: T.text, lineHeight: 1.1, fontFamily: "'Inter', sans-serif" }}>
        {value ?? "—"}
      </div>
      <div style={{ fontSize: 11, color: T.textSoft, marginTop: 3, fontWeight: 500 }}>{label}</div>
    </div>
  </div>
);

const SecTitle = ({ icon, title, sub }) => (
  <div className="pdp-sec-title">
    <div className="pdp-sec-icon">{icon}</div>
    <div>
      <div className="pdp-sec-text">{title}</div>
      {sub && <div className="pdp-sec-sub">{sub}</div>}
    </div>
  </div>
);

const FacTag = ({ label, color, bg }) => (
  <span style={{
    display: "inline-flex", alignItems: "center",
    padding: "5px 13px", borderRadius: 8,
    fontSize: 12, fontWeight: 600, fontFamily: "'Inter', sans-serif",
    background: bg, color,
    border: `1px solid ${color}20`,
    marginBottom: 6, marginRight: 6,
  }}>{label}</span>
);

/* ─── Unit Detail Modal ──────────────────────────────────────────── */
const UnitDetailModal = ({ unit, open, onClose }) => {
  if (!unit) return null;

  const st = INV_STATUS[unit.status] || INV_STATUS.available;

  const renderRow = (label, value) => {
    if (value === undefined || value === null || value === "") return null;
    return (
      <div className="unit-detail-row" key={label}>
        <span className="unit-detail-label">{label}</span>
        <span className="unit-detail-value">{String(value)}</span>
      </div>
    );
  };

  const identityFields = [
    { label: "Unit Number",  value: unit.unitNumber || unit.unit_number },
    { label: "Block",        value: unit.block },
    { label: "Floor",        value: unit.floor },
    { label: "Unit Type",    value: unit.unitType || unit.type },
    { label: "Tower",        value: unit.tower },
    { label: "Building",     value: unit.building },
  ];

  const dimFields = [
    { label: "Bedrooms",        value: unit.bedrooms },
    { label: "Bathrooms",       value: unit.bathrooms },
    { label: "Built-up Area",   value: unit.builtUpArea ? `${unit.builtUpArea} ${unit.builtUpAreaUnit || "sqft"}` : undefined },
    { label: "Carpet Area",     value: unit.carpetArea ? `${unit.carpetArea} ${unit.carpetAreaUnit || "sqft"}` : undefined },
    { label: "Plot Area",       value: unit.plotArea ? `${unit.plotArea} ${unit.plotAreaUnit || "sqft"}` : undefined },
    { label: "Balcony Area",    value: unit.balconyArea ? `${unit.balconyArea} ${unit.balconyAreaUnit || "sqft"}` : undefined },
    { label: "Terrace Area",    value: unit.terraceArea ? `${unit.terraceArea} ${unit.terraceAreaUnit || "sqft"}` : undefined },
    { label: "Parking Spaces",  value: unit.parkingSpaces || unit.parking },
    { label: "View",            value: unit.view },
    { label: "Facing",          value: unit.facing },
    { label: "Furnishing",      value: unit.furnishing },
  ];

  const priceFields = [
    { label: "Price",            value: unit.price ? `${unit.currency || "AED"} ${Number(unit.price).toLocaleString()}` : undefined },
    { label: "Price per sqft",   value: unit.pricePerSqft ? `${unit.currency || "AED"} ${Number(unit.pricePerSqft).toLocaleString()}` : undefined },
    { label: "Down Payment",     value: unit.downPayment ? `${unit.currency || "AED"} ${Number(unit.downPayment).toLocaleString()}` : undefined },
    { label: "Service Charges",  value: unit.serviceCharges },
    { label: "Maintenance Fees", value: unit.maintenanceFees },
    { label: "Payment Plan",     value: unit.paymentPlan },
    { label: "Transaction Type", value: unit.transactionType },
  ];

  const metaFields = [
    { label: "Status",         value: unit.status },
    { label: "Listing Status", value: unit.listingStatus },
    { label: "Ownership",      value: unit.ownershipType || unit.ownership },
    { label: "Available From", value: unit.availableFrom ? new Date(unit.availableFrom).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : undefined },
    { label: "Created",        value: unit.createdAt ? new Date(unit.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : undefined },
    { label: "Updated",        value: unit.updatedAt ? new Date(unit.updatedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : undefined },
    // { label: "Unit ID",        value: unit._id || unit.id },
  ];

  const hasSection = (fields) => fields.some(f => f.value !== undefined && f.value !== null && f.value !== "");

  return (
    <Modal
      className="unit-view-modal"
      open={open}
      onCancel={onClose}
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="pdp-btn" onClick={onClose}
            style={{ background: T.bgAlt, color: T.textMid, border: `1px solid ${T.border}` }}>
            Close
          </button>
        </div>
      }
      width={620}
      title={null}
      destroyOnClose
    >
      <style>{CSS}</style>
      <div style={{ padding: 0 }}>

        {/* Header */}
        <div className="unit-modal-header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginBottom: 6 }}>
                Unit Details
              </div>
              <div style={{ fontFamily: "'Lora', Georgia, serif", fontWeight: 700, fontSize: 22, color: "#fff", lineHeight: 1.2 }}>
                Unit {unit.unitNumber || unit.unit_number || "—"}
              </div>
              {unit.block && (
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 4, fontFamily: "'Inter', sans-serif" }}>
                  Block {unit.block}{unit.floor ? ` · Floor ${unit.floor}` : ""}
                </div>
              )}
            </div>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "6px 14px", borderRadius: 20,
              fontSize: 12, fontWeight: 700,
              background: st.bg, color: st.color,
              fontFamily: "'Inter', sans-serif",
            }}>{st.label}</span>
          </div>

          {/* Price highlight */}
          {unit.price && (
            <div style={{
              marginTop: 16,
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 10, padding: "10px 16px",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <DollarOutlined style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 18, color: "#fff" }}>
                {unit.currency || "AED"} {Number(unit.price).toLocaleString()}
              </span>
              {unit.pricePerSqft && (
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", fontFamily: "'Inter', sans-serif", marginLeft: 4 }}>
                  · {unit.currency || "AED"} {Number(unit.pricePerSqft).toLocaleString()} / sqft
                </span>
              )}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: "0 24px 24px" }}>

          {/* Identity */}
          {hasSection(identityFields) && (
            <div className="unit-section">
              <div className="unit-section-title">
                <BuildOutlined /> Identity
              </div>
              {identityFields.filter(f => f.value !== undefined && f.value !== null && f.value !== "").map(f => renderRow(f.label, f.value))}
            </div>
          )}

          {/* Dimensions */}
          {hasSection(dimFields) && (
            <div className="unit-section">
              <div className="unit-section-title">
                <ExpandOutlined /> Dimensions & Specs
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                {dimFields.filter(f => f.value !== undefined && f.value !== null && f.value !== "").map(f => (
                  <div className="unit-detail-row" key={f.label}>
                    <span className="unit-detail-label">{f.label}</span>
                    <span className="unit-detail-value">{String(f.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing */}
          {hasSection(priceFields) && (
            <div className="unit-section">
              <div className="unit-section-title">
                <DollarOutlined /> Pricing & Financials
              </div>
              {priceFields.filter(f => f.value !== undefined && f.value !== null && f.value !== "").map(f => renderRow(f.label, f.value))}
            </div>
          )}

          {/* Amenities */}
          {unit.amenities?.length > 0 && (
            <div className="unit-section">
              <div className="unit-section-title">
                <StarFilled /> Amenities
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {unit.amenities.map((a, i) => (
                  <span key={i} style={{
                    display: "inline-flex", alignItems: "center",
                    padding: "4px 11px", borderRadius: 8,
                    fontSize: 12, fontWeight: 600,
                    background: T.brandLight, color: T.brand,
                    fontFamily: "'Inter', sans-serif",
                  }}>{a}</span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {unit.description && (
            <div className="unit-section">
              <div className="unit-section-title">
                <BulbOutlined /> Description
              </div>
              <p style={{ margin: 0, fontSize: 13, color: T.textMid, lineHeight: 1.75, fontFamily: "'Inter', sans-serif" }}>
                {unit.description}
              </p>
            </div>
          )}

          {/* Status & Meta */}
          {hasSection(metaFields) && (
            <div className="unit-section">
              <div className="unit-section-title">
                <NodeIndexOutlined /> Status & Meta
              </div>
              {metaFields.filter(f => f.value !== undefined && f.value !== null && f.value !== "").map(f => renderRow(f.label, f.value))}
            </div>
          )}

          {/* Photos */}
          {unit.photos?.length > 0 && (
            <div className="unit-section">
              <div className="unit-section-title">
                <EyeOutlined /> Photos
              </div>
              <Image.PreviewGroup>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
                  {unit.photos.map((url, i) => (
                    <div key={i} style={{ borderRadius: 8, overflow: "hidden", aspectRatio: "4/3" }}>
                      <Image src={url} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={e => { e.target.src = "https://via.placeholder.com/300x200?text=Image"; }} />
                    </div>
                  ))}
                </div>
              </Image.PreviewGroup>
            </div>
          )}

        </div>
      </div>
    </Modal>
  );
};

/* ─── InvCard with View Button ───────────────────────────────────── */
const InvCard = ({ unit, onView }) => {
  const st = INV_STATUS[unit.status] || INV_STATUS.available;
  const meta = [
    { label: "Type",   value: unit.unitType || unit.type || "—" },
    { label: "Beds",   value: unit.bedrooms ?? "—" },
    { label: "Baths",  value: unit.bathrooms ?? "—" },
    { label: "Area",   value: unit.builtUpArea ? `${unit.builtUpArea} ${unit.builtUpAreaUnit || "sqft"}` : "—" },
    { label: "Floor",  value: unit.floor ?? "—" },
    { label: "View",   value: unit.view || "—" },
  ];
  return (
    <div className="pdp-inv-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 13 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: T.text, fontFamily: "'Inter', sans-serif" }}>
            Unit {unit.unitNumber || unit.unit_number || "—"}
          </div>
          <div style={{ fontSize: 11, color: T.textSoft, marginTop: 2, fontFamily: "'Inter', sans-serif" }}>
            {unit.block ? `Block ${unit.block}` : ""}
          </div>
        </div>
        <span className="pdp-chip" style={{ background: st.bg, color: st.color }}>{st.label}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px 6px", marginBottom: 13 }}>
        {meta.map(r => (
          <div key={r.label}>
            <div className="pdp-label" style={{ marginBottom: 2 }}>{r.label}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.textMid, fontFamily: "'Inter', sans-serif" }}>{r.value}</div>
          </div>
        ))}
      </div>

      {unit.price && (
        <div style={{
          background: T.brandLight, border: `1px solid ${T.brandBorder}`,
          borderRadius: 8, padding: "7px 12px",
          fontWeight: 700, fontSize: 13, color: T.brand,
          display: "flex", alignItems: "center", gap: 6,
          fontFamily: "'Inter', sans-serif",
          marginBottom: 12,
        }}>
          <DollarOutlined style={{ fontSize: 11 }} />
          {unit.currency || "AED"} {Number(unit.price).toLocaleString()}
        </div>
      )}

      {/* View Button */}
      <button
        className="pdp-btn"
        onClick={() => onView(unit)}
        style={{
          width: "100%",
          justifyContent: "center",
          background: T.bg,
          color: T.brand,
          border: `1px solid ${T.brandBorder}`,
          padding: "7px 14px",
          fontSize: 12,
        }}
      >
        <EyeOutlined style={{ fontSize: 12 }} /> View Details
      </button>
    </div>
  );
};

/* ─── Main ───────────────────────────────────────────────────────── */
const PropertyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property,      setProperty]      = useState(null);
  const [inventory,     setInventory]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [invLoading,    setInvLoading]    = useState(true);
  const [rejectModal,   setRejectModal]   = useState(false);
  const [rejectReason,  setRejectReason]  = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [heroLoaded,    setHeroLoaded]    = useState(false);
  const [photoTab,      setPhotoTab]      = useState("all");

  // Unit detail modal state
  const [selectedUnit,  setSelectedUnit]  = useState(null);
  const [unitModalOpen, setUnitModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiService.get(`/properties/admin/property/${id}`)
      .then(res => setProperty(res?.data || res || null))
      .catch(() => message.error("Failed to load property"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    apiService.get(`/properties/inventory/${id}`)
      .then(res => {
        const list = res?.data || res?.inventory || (Array.isArray(res) ? res : []);
        setInventory(Array.isArray(list) ? list : []);
      })
      .catch(() => message.error("Failed to load inventory"))
      .finally(() => setInvLoading(false));
  }, [id]);

  const handleViewUnit = (unit) => {
    setSelectedUnit(unit);
    setUnitModalOpen(true);
  };

  const approve = async () => {
    setActionLoading(true);
    try {
      await apiService.put(`/properties/admin/property/approve/${id}`, { remarks: "Verified & approved." });
      message.success("Property approved");
      setProperty(p => ({ ...p, approvalStatus: "approved" }));
    } catch { message.error("Approval failed"); }
    finally { setActionLoading(false); }
  };

  const reject = async () => {
    if (!rejectReason.trim()) { message.error("Enter rejection reason"); return; }
    setActionLoading(true);
    try {
      await apiService.put(`/properties/admin/property/reject/${id}`, { rejectionReason: rejectReason });
      message.success("Property rejected");
      setProperty(p => ({ ...p, approvalStatus: "rejected" }));
      setRejectModal(false); setRejectReason("");
    } catch { message.error("Rejection failed"); }
    finally { setActionLoading(false); }
  };

  const photos = (cat) => property?.photos?.[cat] || [];
  const allPhotos = () => [...photos("architecture"), ...photos("interior"), ...photos("lobby"), ...photos("other")];

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
      <Spin size="large" />
    </div>
  );
  if (!property) return (
    <div style={{ padding: 48, textAlign: "center" }}>
      <p style={{ color: T.textSoft, fontFamily: "'Inter', sans-serif", fontSize: 16 }}>Property not found</p>
      <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />} style={{ marginTop: 16 }}>Go Back</Button>
    </div>
  );

  const st       = STATUS[property.approvalStatus] || STATUS.pending;
  const heroImg  = property.mainLogo || allPhotos()[0] || "";
  const allP     = allPhotos();

  /* inventory stats */
  const byStatus  = inventory.reduce((a, u) => { const s = u.status || "available"; a[s] = a[s] || []; a[s].push(u); return a; }, {});
  const total     = inventory.length;
  const sold      = byStatus.sold?.length    || 0;
  const avail     = byStatus.available?.length || 0;
  const reserved  = byStatus.reserved?.length || 0;
  const soldPct   = total ? Math.round((sold / total) * 100) : 0;

  /* photo tabs */
  const photoCats = [
    { key: "all",          label: "All",          list: allP },
    { key: "architecture", label: "Architecture", list: photos("architecture") },
    { key: "interior",     label: "Interior",     list: photos("interior") },
    { key: "lobby",        label: "Lobby",        list: photos("lobby") },
    { key: "other",        label: "Other",        list: photos("other") },
  ].filter(c => c.list.length > 0);

  const activePhotos = photoCats.find(c => c.key === photoTab)?.list || allP;

  return (
    <div className="pdp" style={{ background: T.bg, minHeight: "100vh" }}>
      <style>{CSS}</style>

      {/* ════════ HERO ════════ */}
      <div style={{ position: "relative", height: 400, overflow: "hidden", background: T.bgAlt }}>
        {heroImg && (
          <img
            src={heroImg}
            alt={property.propertyName}
            onLoad={() => setHeroLoaded(true)}
            onError={e => { e.target.style.display = "none"; setHeroLoaded(true); }}
            style={{
              width: "100%", height: "100%", objectFit: "cover",
              opacity: heroLoaded ? 1 : 0, transition: "opacity 0.5s",
            }}
          />
        )}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(170deg, rgba(10,10,20,0.05) 0%, rgba(10,10,20,0.68) 100%)",
        }} />

        <div style={{ position: "absolute", top: 22, left: 28, right: 28, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button className="pdp-back" onClick={() => navigate(-1)}>
            <ArrowLeftOutlined style={{ fontSize: 12 }} /> Back
          </button>
          <div style={{ display: "flex", gap: 7 }}>
            <span className="pdp-tag" style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
              {st.icon} {st.label}
            </span>
            <span className="pdp-tag" style={{
              background: property.propertySubType === "off_plan" ? T.brand : T.sky,
              color: "#fff",
            }}>
              {property.propertySubType === "off_plan" ? "Off-Plan" : "Secondary"}
            </span>
            {property.isFeatured && (
              <span className="pdp-tag" style={{ background: "#f59e0b", color: "#fff" }}>
                <StarFilled style={{ fontSize: 10 }} /> Featured
              </span>
            )}
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 30, left: 32, right: 32 }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 2,
            textTransform: "uppercase", color: "rgba(255,255,255,0.6)",
            marginBottom: 8,
          }}>
            Property Detail
          </div>
          <h1 className="pdp-serif" style={{
            margin: 0, fontSize: 30, fontWeight: 700, color: "#fff",
            lineHeight: 1.2, textShadow: "0 2px 12px rgba(0,0,0,0.25)",
          }}>
            {property.propertyName}
          </h1>
          <div style={{ display: "flex", gap: 22, marginTop: 10, flexWrap: "wrap" }}>
            <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
              <BankOutlined /> {property.developer?.name || property.developerName || "No Developer"}
            </span>
            <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
              <EnvironmentOutlined /> {[property.area, property.city, property.country].filter(Boolean).join(", ")}
            </span>
          </div>
        </div>
      </div>

      {/* ════════ STICKY BAR ════════ */}
      <div style={{
        background: "#fff", borderBottom: `1px solid ${T.border}`,
        padding: "13px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 12,
        position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      }}>
        <div>
          <div className="pdp-label" style={{ marginBottom: 3 }}>Price Range</div>
          <div style={{ fontWeight: 800, fontSize: 21, color: T.brand, fontFamily: "'Inter', sans-serif", lineHeight: 1 }}>
            {property.currency} {property.price_min?.toLocaleString()} – {property.price_max?.toLocaleString()}
          </div>
        </div>

        <div style={{ display: "flex", gap: 9 }}>
          {property.brochure && (
            <a href={property.brochure} target="_blank" rel="noopener noreferrer">
              <button className="pdp-btn" style={{ background: T.bg, color: T.textMid, border: `1px solid ${T.border}` }}>
                <FilePdfOutlined /> Brochure
              </button>
            </a>
          )}
          {property.approvalStatus === "pending" && (
            <>
              <button className="pdp-btn" onClick={approve} disabled={actionLoading}
                style={{ background: T.green, color: "#fff" }}>
                <CheckCircleOutlined /> Approve
              </button>
              <button className="pdp-btn" onClick={() => setRejectModal(true)} disabled={actionLoading}
                style={{ background: T.redLight, color: T.red, border: `1px solid #fecaca` }}>
                <CloseCircleOutlined /> Reject
              </button>
            </>
          )}
        </div>
      </div>

      {/* ════════ BODY ════════ */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "26px 28px 52px" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(165px,1fr))", gap: 12, marginBottom: 26 }}>
          <Stat icon={<HomeOutlined />}       label="Bedrooms"        value={property.bedrooms     || "—"} color={T.indigo} bg={T.indigoLight} />
          <Stat icon={<BathIcon />}           label="Bathrooms"       value={property.bathrooms    || "—"} color={T.sky}    bg={T.skyLight}    />
          <Stat icon={<ColumnWidthOutlined />}label="Max Area (sqft)" value={property.builtUpArea_max?.toLocaleString() || "—"} color={T.green} bg={T.greenLight} />
          <Stat icon={<AppstoreOutlined />}   label="Total Units"     value={property.totalUnits   || "—"} color={T.brand}  bg={T.brandLight}  />
          <Stat icon={<CarOutlined />}        label="Parking"         value={property.parkingSpaces|| "—"} color={T.amber}  bg={T.amberLight}  />
          <Stat icon={<CalendarOutlined />}   label="Completion"      value={property.completionDate ? new Date(property.completionDate).getFullYear() : "—"} color={T.red} bg={T.redLight} />
        </div>

        <Row gutter={[22, 0]}>

          {/* ── LEFT ── */}
          <Col xs={24} lg={15}>

            {/* Basic Info */}
            <div className="pdp-card">
              <SecTitle icon={<InfoCircleOutlined />} title="Basic Information" />
              <Descriptions bordered size="small" column={{ xs:1, sm:2 }}>
                <Descriptions.Item label="Developer">{property.developer?.name || property.developerName || "N/A"}</Descriptions.Item>
                <Descriptions.Item label="Transaction">{property.transactionType === "sell" ? "Sale" : "Rent"}</Descriptions.Item>
                <Descriptions.Item label="Project Status">
                  <span style={{ color: T.brand, fontWeight: 700 }}>{property.projectStatus || "N/A"}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Listing Status">{property.listingStatus || "N/A"}</Descriptions.Item>
                <Descriptions.Item label="Unit Type">{property.unitType || "N/A"}</Descriptions.Item>
                <Descriptions.Item label="Furnishing">{property.furnishing || "N/A"}</Descriptions.Item>
                <Descriptions.Item label="Ownership">{property.ownershipType || "N/A"}</Descriptions.Item>
                <Descriptions.Item label="Bedroom Type">{property.bedroomType || "N/A"}</Descriptions.Item>
                <Descriptions.Item label="Created">
                  {property.createdAt ? new Date(property.createdAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Updated">
                  {property.updatedAt ? new Date(property.updatedAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "N/A"}
                </Descriptions.Item>
              </Descriptions>
            </div>

            {/* Pricing */}
            <div className="pdp-card">
              <SecTitle icon={<DollarOutlined />} title="Pricing & Dimensions" />
              <Descriptions bordered size="small" column={{ xs:1, sm:2 }}>
                <Descriptions.Item label="Min Price"><strong style={{ color: T.brand }}>{property.currency} {property.price_min?.toLocaleString()}</strong></Descriptions.Item>
                <Descriptions.Item label="Max Price"><strong style={{ color: T.brand }}>{property.currency} {property.price_max?.toLocaleString()}</strong></Descriptions.Item>
                <Descriptions.Item label="Area Range">{property.builtUpArea_min} – {property.builtUpArea_max} {property.builtUpAreaUnit}</Descriptions.Item>
                <Descriptions.Item label="Total Units">{property.totalUnits || "N/A"}</Descriptions.Item>
                <Descriptions.Item label="Bedrooms">{property.bedrooms || "N/A"}</Descriptions.Item>
                <Descriptions.Item label="Bathrooms">{property.bathrooms || "N/A"}</Descriptions.Item>
                <Descriptions.Item label="Parking">{property.parkingSpaces || "N/A"}</Descriptions.Item>
                {property.serviceCharges && <Descriptions.Item label="Service Charges">{property.serviceCharges}</Descriptions.Item>}
                {property.maintenanceFees && <Descriptions.Item label="Maintenance Fees">{property.maintenanceFees}</Descriptions.Item>}
              </Descriptions>
            </div>

            {/* Location */}
            <div className="pdp-card">
              <SecTitle icon={<EnvironmentOutlined />} title="Location" />
              <Descriptions bordered size="small" column={{ xs:1, sm:2 }}>
                <Descriptions.Item label="Area">{property.area || "N/A"}</Descriptions.Item>
                <Descriptions.Item label="City">{property.city || "N/A"}</Descriptions.Item>
                <Descriptions.Item label="Country">{property.country || "N/A"}</Descriptions.Item>
                <Descriptions.Item label="Coordinates">
                  {property.latitude && property.longitude ? `${property.latitude}, ${property.longitude}` : "N/A"}
                </Descriptions.Item>
                {property.googleLocation && (
                  <Descriptions.Item label="Maps">
                    <a href={property.googleLocation} target="_blank" rel="noopener noreferrer" style={{ color: T.brand, fontWeight: 600 }}>
                      Open in Google Maps ↗
                    </a>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </div>

            {/* Description */}
            {property.description && (
              <div className="pdp-card">
                <SecTitle icon={<BulbOutlined />} title="Description" />
                <Paragraph style={{ color: T.textMid, lineHeight: 1.85, margin: 0, fontSize: 14, fontFamily: "'Inter', sans-serif" }}>
                  {property.description}
                </Paragraph>
              </div>
            )}

            {/* Payment Plans */}
            {property.paymentPlan?.length > 0 && (
              <div className="pdp-card">
                <SecTitle icon={<KeyOutlined />} title="Payment Plans" sub={`${property.paymentPlan.length} plan${property.paymentPlan.length > 1 ? "s" : ""}`} />
                <Collapse accordion>
                  {property.paymentPlan.map((plan, i) => (
                    <Panel header={plan.title || `Plan ${i + 1}`} key={i}>
                      {plan.description && <p style={{ color: T.textSoft, fontSize: 13, marginBottom: 12, fontFamily: "'Inter', sans-serif" }}>{plan.description}</p>}
                      <Timeline>
                        {plan.stages?.map((s, si) => (
                          <Timeline.Item key={si} color={T.brand}>
                            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13 }}>
                              <strong>{s.stage}</strong>:{" "}
                              <span style={{ color: T.brand, fontWeight: 700 }}>{s.percentage}%</span>
                              {s.description ? ` — ${s.description}` : ""}
                            </span>
                          </Timeline.Item>
                        ))}
                      </Timeline>
                    </Panel>
                  ))}
                </Collapse>
              </div>
            )}
          </Col>

          {/* ── RIGHT ── */}
          <Col xs={24} lg={9}>

            {/* Rejection notice */}
            {property.approvalStatus === "rejected" && property.rejectionReason && (
              <div style={{ background: T.redLight, border: `1px solid #fecaca`, borderRadius: 14, padding: "16px 20px", marginBottom: 20 }}>
                <SecTitle icon={<CloseCircleOutlined />} title="Rejection Reason" />
                <p style={{ color: T.red, fontSize: 13, margin: 0, fontFamily: "'Inter', sans-serif", lineHeight: 1.7 }}>
                  {property.rejectionReason}
                </p>
              </div>
            )}

            {/* Developer */}
            {property.developer && (
              <div className="pdp-card">
                <SecTitle icon={<BankOutlined />} title="Developer" />
                {property.developer.logo && (
                  <img src={property.developer.logo} alt="dev logo" style={{
                    height: 40, objectFit: "contain", marginBottom: 14,
                    borderRadius: 7, border: `1px solid ${T.border}`, padding: "3px 8px",
                  }} />
                )}
                {[
                  { label: "Name",    val: property.developer.name },
                  { label: "Website", val: property.developer.website, link: true },
                ].filter(r => r.val).map(r => (
                  <div key={r.label} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "8px 0", borderBottom: `1px solid ${T.borderLight}`,
                  }}>
                    <span style={{ fontSize: 12, color: T.textSoft, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>{r.label}</span>
                    {r.link
                      ? <a href={r.val} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: T.brand, fontWeight: 600 }}>Visit ↗</a>
                      : <span style={{ fontSize: 13, color: T.textMid, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>{r.val}</span>
                    }
                  </div>
                ))}
                {property.developer.description && (
                  <p style={{ fontSize: 12, color: T.textSoft, margin: "10px 0 0", lineHeight: 1.65, fontFamily: "'Inter', sans-serif" }}>
                    {property.developer.description}
                  </p>
                )}
              </div>
            )}

            {/* Amenities */}
            {property.amenities?.length > 0 && (
              <div className="pdp-card">
                <SecTitle icon={<StarFilled />} title="Amenities" sub={`${property.amenities.length} amenities`} />
                <div>
                  {property.amenities.map((a, i) => (
                    <FacTag key={i} label={a} color={T.brand} bg={T.brandLight} />
                  ))}
                </div>
              </div>
            )}

            {/* Facilities */}
            {property.facilities && Object.values(property.facilities).some(v => v) && (
              <div className="pdp-card">
                <SecTitle icon={<ThunderboltOutlined />} title="Facilities" />
                <div>
                  {[
                    { key: "swimmingPool",     label: "Swimming Pool",  color: T.sky,    bg: T.skyLight    },
                    { key: "gym",              label: "Gym",            color: T.green,  bg: T.greenLight  },
                    { key: "parking",          label: "Parking",        color: T.brand,  bg: T.brandLight  },
                    { key: "security",         label: "Security",       color: T.red,    bg: T.redLight    },
                    { key: "concierge",        label: "Concierge",      color: T.amber,  bg: T.amberLight  },
                    { key: "gardens",          label: "Gardens",        color: "#15803d", bg: "#f0fdf4"    },
                    { key: "childrenPlayArea", label: "Play Area",      color: "#c2410c", bg: "#fff7ed"    },
                    { key: "sauna",            label: "Sauna",          color: T.indigo, bg: T.indigoLight },
                    { key: "spa",              label: "Spa",            color: "#be185d", bg: "#fdf2f8"    },
                    { key: "businessCenter",   label: "Business Centre", color: T.textMid, bg: T.bgAlt     },
                  ].filter(f => property.facilities[f.key]).map(f => (
                    <FacTag key={f.key} label={f.label} color={f.color} bg={f.bg} />
                  ))}
                </div>
              </div>
            )}

            {/* Brochure */}
            {property.brochure && (
              <div className="pdp-card" style={{ padding: "16px 20px" }}>
                <a href={property.brochure} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                  <button className="pdp-btn" style={{
                    width: "100%", justifyContent: "center",
                    background: T.brand, color: "#fff", padding: "12px 24px", fontSize: 14,
                  }}>
                    <FilePdfOutlined style={{ fontSize: 15 }} /> Download Brochure
                  </button>
                </a>
              </div>
            )}
          </Col>
        </Row>

        {/* ════ GALLERY ════ */}
        {allP.length > 0 && (
          <div className="pdp-card" style={{ marginTop: 4 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
              <SecTitle icon={<EyeOutlined />} title="Photo Gallery" sub={`${allP.length} photos`} />
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {photoCats.map(c => (
                  <button key={c.key} className="pdp-pill-tab" onClick={() => setPhotoTab(c.key)}
                    style={{
                      background: photoTab === c.key ? T.brand : T.bgAlt,
                      color: photoTab === c.key ? "#fff" : T.textSoft,
                    }}
                  >
                    {c.label} ({c.list.length})
                  </button>
                ))}
              </div>
            </div>
            <Image.PreviewGroup>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(145px,1fr))", gap: 10 }}>
                {activePhotos.map((url, i) => (
                  <div key={i} className="pdp-photo-wrap">
                    <Image src={url} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={e => { e.target.src = "https://via.placeholder.com/300x200?text=Image"; }} />
                  </div>
                ))}
              </div>
            </Image.PreviewGroup>
          </div>
        )}

        {/* ════ INVENTORY ════ */}
        <div style={{
          background: "#fff", border: `1px solid ${T.border}`,
          borderRadius: 18, padding: "26px 26px 30px", marginTop: 22,
        }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, background: T.brand,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <AppstoreOutlined style={{ color: "#fff", fontSize: 17 }} />
              </div>
              <div>
                <div className="pdp-serif" style={{ fontWeight: 700, fontSize: 16, color: T.text }}>Inventory Units</div>
                <div style={{ fontSize: 12, color: T.textSoft, fontFamily: "'Inter', sans-serif" }}>All units under this property</div>
              </div>
            </div>
            <span className="pdp-chip" style={{ background: T.brandLight, color: T.brand, padding: "6px 16px", borderRadius: 8, fontSize: 12 }}>
              {total} units total
            </span>
          </div>

          {invLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "52px 0" }}><Spin size="large" /></div>
          ) : inventory.length === 0 ? (
            <div style={{ textAlign: "center", padding: "52px 0", border: `2px dashed ${T.border}`, borderRadius: 12 }}>
              <AppstoreOutlined style={{ fontSize: 36, color: T.border, marginBottom: 10 }} />
              <div style={{ fontWeight: 600, fontSize: 14, color: T.textSoft, fontFamily: "'Inter', sans-serif" }}>No inventory units found</div>
              <div style={{ fontSize: 12, color: T.textXSoft, marginTop: 4, fontFamily: "'Inter', sans-serif" }}>No units have been listed for this property yet</div>
            </div>
          ) : (
            <>
              {/* Inv stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(145px,1fr))", gap: 11, marginBottom: 20 }}>
                <Stat icon={<AppstoreOutlined />}    label="Total"     value={total}    color={T.brand}  bg={T.brandLight}  />
                <Stat icon={<CheckCircleOutlined />} label="Available" value={avail}    color={T.green}  bg={T.greenLight}  />
                <Stat icon={<CloseCircleOutlined />} label="Sold"      value={sold}     color={T.red}    bg={T.redLight}    />
                <Stat icon={<ClockCircleOutlined />} label="Reserved"  value={reserved} color={T.amber}  bg={T.amberLight}  />
              </div>

              {/* Progress */}
              <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 18px", marginBottom: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: T.textMid, fontFamily: "'Inter', sans-serif" }}>Sales Progress</span>
                  <span style={{ fontWeight: 800, fontSize: 13, color: T.brand, fontFamily: "'Inter', sans-serif" }}>{soldPct}% Sold</span>
                </div>
                <div className="pdp-progress-bar">
                  <div className="pdp-progress-fill" style={{ width: `${soldPct}%` }} />
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
                  {Object.entries(byStatus).map(([s, units]) => {
                    const c = INV_STATUS[s] || INV_STATUS.available;
                    return (
                      <span key={s} style={{ fontSize: 11, color: c.color, fontWeight: 700, fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.color, display: "inline-block" }} />
                        {c.label}: {units.length}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Grid — now with onView handler */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(245px,1fr))", gap: 13 }}>
                {inventory.map((unit, i) => (
                  <InvCard key={unit._id || i} unit={unit} onView={handleViewUnit} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ════ UNIT DETAIL MODAL ════ */}
      <UnitDetailModal
        unit={selectedUnit}
        open={unitModalOpen}
        onClose={() => { setUnitModalOpen(false); setSelectedUnit(null); }}
      />

      {/* Reject Modal */}
      <Modal
        title={<span style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Inter', sans-serif" }}>
          <CloseCircleOutlined style={{ color: T.red }} /> Reject Property
        </span>}
        open={rejectModal}
        onCancel={() => { setRejectModal(false); setRejectReason(""); }}
        onOk={reject}
        okText="Confirm Rejection"
        okButtonProps={{ danger: true, loading: actionLoading }}
      >
        <p style={{ color: T.textSoft, fontSize: 13, marginBottom: 12, fontFamily: "'Inter', sans-serif" }}>
          Please provide a reason for rejecting this property:
        </p>
        <Input.TextArea rows={4} placeholder="Enter rejection reason..."
          value={rejectReason} onChange={e => setRejectReason(e.target.value)}
          style={{ borderRadius: 8, fontFamily: "'Inter', sans-serif" }} />
      </Modal>
    </div>
  );
};

const BathIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 10H7V7a2 2 0 0 1 3.41-1.41l1.42 1.42 1.41-1.41-1.42-1.42A4 4 0 0 0 5 7v3H3a1 1 0 0 0-1 1v2a5 5 0 0 0 4 4.9V20H4v2h16v-2h-2v-2.1A5 5 0 0 0 22 13v-2a1 1 0 0 0-1-1z"/>
  </svg>
);

export default PropertyDetailPage;