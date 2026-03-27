import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiService } from "../../../../manageApi/utils/custom.apiservice";
import { Spin, Tag, Divider, message } from "antd";
import {
  ArrowLeftOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  HomeOutlined,
  CarOutlined,
  GlobalOutlined,
  LinkOutlined,
  FileOutlined,
  VideoCameraOutlined,
  CheckCircleFilled,
  StarFilled,
  BankOutlined,
  ExpandOutlined,
  AppstoreOutlined,
  ColumnWidthOutlined,
  BuildOutlined,
  NumberOutlined,
  FormatPainterOutlined,
  ProfileOutlined,
  LeftOutlined,
  RightOutlined,
  CloseOutlined,
} from "@ant-design/icons";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => Number(n || 0).toLocaleString();

const formatDate = (dateString) => {
  if (!dateString) return "—";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const getAllPhotos = (photos = {}) => {
  const all = [];
  ["architecture", "interior", "lobby", "other"].forEach((g) => {
    (photos[g] || []).forEach((url) => all.push({ url, group: g }));
  });
  return all;
};

// ─── Stat icon map — all Ant Design icons ─────────────────────────────────────
const STAT_DEFS = [
  { key: "bedrooms",    label: "Bedrooms",    Icon: AppstoreOutlined,      getValue: (p) => p.bedrooms ?? "—" },
  { key: "bathrooms",   label: "Bathrooms",   Icon: HomeOutlined,           getValue: (p) => p.bathrooms ?? "—" },
  { key: "builtUp",     label: "Built-up",    Icon: ColumnWidthOutlined,   getValue: (p) => p.builtUpArea ? `${fmt(p.builtUpArea)} ${p.builtUpAreaUnit || "sqft"}` : "—" },
  { key: "floor",       label: "Floor",       Icon: BuildOutlined,          getValue: (p) => p.floorNumber ?? "—" },
  { key: "unitNo",      label: "Unit No.",    Icon: NumberOutlined,         getValue: (p) => p.unitNumber || "—" },
  { key: "parking",     label: "Parking",     Icon: CarOutlined,            getValue: (p) => p.parkingSpaces ?? "—" },
  { key: "furnishing",  label: "Furnishing",  Icon: FormatPainterOutlined,  getValue: (p) => p.furnishing || "—" },
  { key: "type",        label: "Type",        Icon: ProfileOutlined,        getValue: (p) => p.unitType || "—" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function SecondaryPropertyDetail() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [property, setProperty]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [activeImg, setActiveImg]   = useState(0);
  const [lightbox, setLightbox]     = useState(false);
  const galleryRef = useRef(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res  = await apiService.get(`/properties/agent/property/secondary/${id}`);
        const data = res?.data?.data || res?.data || res;
        if (data && typeof data === "object" && (data._id || data.id || data.propertyName)) {
          setProperty(data);
        } else {
          message.error("Property data is empty.");
        }
      } catch (err) {
        console.error("Detail fetch error:", err);
        message.error(err?.response?.data?.message || "Failed to load property details.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div style={S.loaderWrap}>
        <Spin size="large" />
        <p style={{ color: "#888", marginTop: 12 }}>Loading property…</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div style={S.loaderWrap}>
        <p style={{ color: "#888", fontSize: 16 }}>Property not found.</p>
        <button style={{ ...S.backBtn, marginTop: 12 }} onClick={() => navigate(-1)}>
          ← Go Back
        </button>
      </div>
    );
  }

  const p         = property;
  const allPhotos = getAllPhotos(p.photos);
  const coverImg  = allPhotos[0]?.url || p.mainLogo
    || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200";

  return (
    <div style={S.page}>

      {/* ── TOP NAV ── */}
      <div style={S.topNav}>
        <button style={S.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeftOutlined style={{ marginRight: 8 }} />
          Back to listings
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          {p.isFeatured && (
            <span style={{ ...S.badge, background: "#fef3c7", color: "#92400e" }}>
              <StarFilled style={{ marginRight: 4, fontSize: 11 }} /> Featured
            </span>
          )}
          {p.ownershipType && (
            <span style={{ ...S.badge, background: "#ede9fe", color: "#5b21b6" }}>
              {p.ownershipType}
            </span>
          )}
        </div>
      </div>

      {/* ── HERO GALLERY ── */}
      <div style={S.heroSection}>
        <div style={S.mainImageWrap} onClick={() => setLightbox(true)}>
          <img
            src={allPhotos[activeImg]?.url || coverImg}
            alt={p.propertyName}
            style={S.mainImage}
          />
          <div style={S.expandHint}>
            <ExpandOutlined style={{ marginRight: 6 }} />
            View Gallery
            {allPhotos.length > 0 && (
              <span style={S.photoCount}>{allPhotos.length} photos</span>
            )}
          </div>
          {allPhotos[activeImg]?.group && (
            <span style={S.groupTag}>{allPhotos[activeImg].group}</span>
          )}
        </div>

        {allPhotos.length > 1 && (
          <div style={S.thumbStrip} ref={galleryRef}>
            {allPhotos.map((img, i) => (
              <div
                key={i}
                style={{
                  ...S.thumb,
                  border: activeImg === i ? "2px solid #7c3aed" : "2px solid transparent",
                  opacity: activeImg === i ? 1 : 0.55,
                }}
                onClick={() => setActiveImg(i)}
              >
                <img src={img.url} alt="" style={S.thumbImg} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── LIGHTBOX ── */}
      {lightbox && (
        <div style={S.lightboxOverlay} onClick={() => setLightbox(false)}>
          <div style={S.lightboxBox} onClick={(e) => e.stopPropagation()}>
            <button style={S.lightboxClose} onClick={() => setLightbox(false)}>
              <CloseOutlined />
            </button>
            <img src={allPhotos[activeImg]?.url || coverImg} alt="" style={S.lightboxImg} />
            <div style={S.lightboxNav}>
              <button
                style={S.lightboxArrow}
                onClick={() => setActiveImg((prev) => (prev - 1 + allPhotos.length) % allPhotos.length)}
              >
                <LeftOutlined />
              </button>
              <span style={{ color: "#fff", fontSize: 13 }}>
                {activeImg + 1} / {allPhotos.length}
              </span>
              <button
                style={S.lightboxArrow}
                onClick={() => setActiveImg((prev) => (prev + 1) % allPhotos.length)}
              >
                <RightOutlined />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BODY ── */}
      <div style={S.body}>

        {/* ── LEFT COL ── */}
        <div style={S.leftCol}>

          {/* Title block */}
          <div style={{ marginBottom: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={S.devAvatar}>
                {p.developer?.logo
                  ? <img src={p.developer.logo} alt="dev" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>
                      {(p.developerName || "D").charAt(0)}
                    </span>
                }
              </div>
              <div>
                <p style={S.devName}>{p.developerName || "Developer"}</p>
                <p style={S.projectLabel}>Secondary Property</p>
              </div>
            </div>
            <h1 style={S.propertyTitle}>{p.propertyName}</h1>
            <p style={S.locationLine}>
              <EnvironmentOutlined style={{ marginRight: 6, color: "#7c3aed" }} />
              {[p.area, p.city, p.country].filter(Boolean).join(", ")}
            </p>
          </div>

          <Divider style={{ margin: "20px 0" }} />

          {/* ── STATS GRID — AntD icons only ── */}
          <div style={S.statsGrid}>
            {STAT_DEFS.map(({ key, label, Icon, getValue }) => (
              <div key={key} style={S.statCard}>
                <div style={S.statIconWrap}>
                  <Icon style={{ fontSize: 18, color: "#7c3aed" }} />
                </div>
                <span style={S.statValue}>{getValue(p)}</span>
                <span style={S.statLabel}>{label}</span>
              </div>
            ))}
          </div>

          <Divider style={{ margin: "20px 0" }} />

          {/* Description */}
          {p.description && (
            <>
              <h3 style={S.sectionTitle}>About this property</h3>
              <p style={S.description}>{p.description}</p>
              <Divider style={{ margin: "20px 0" }} />
            </>
          )}

          {/* Amenities */}
          {p.amenities?.length > 0 && (
            <>
              <h3 style={S.sectionTitle}>Amenities</h3>
              <div style={S.amenitiesGrid}>
                {p.amenities.map((a) => (
                  <div key={a} style={S.amenityItem}>
                    <CheckCircleFilled style={{ color: "#7c3aed", marginRight: 8, fontSize: 14 }} />
                    <span style={{ fontSize: 13, color: "#374151" }}>{a}</span>
                  </div>
                ))}
              </div>
              <Divider style={{ margin: "20px 0" }} />
            </>
          )}

          {/* Facilities */}
          {p.facilities && Object.values(p.facilities).some(Boolean) && (
            <>
              <h3 style={S.sectionTitle}>Facilities</h3>
              <div style={S.amenitiesGrid}>
                {Object.entries(p.facilities)
                  .filter(([, v]) => v)
                  .map(([k]) => (
                    <div key={k} style={S.amenityItem}>
                      <CheckCircleFilled style={{ color: "#10b981", marginRight: 8, fontSize: 14 }} />
                      <span style={{ fontSize: 13, color: "#374151" }}>{facilityLabel(k)}</span>
                    </div>
                  ))}
              </div>
              <Divider style={{ margin: "20px 0" }} />
            </>
          )}

          {/* Views */}
          {p.hasView && p.viewType?.length > 0 && (
            <>
              <h3 style={S.sectionTitle}>Views</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {p.viewType.map((v) => (
                  <Tag key={v} color="geekblue" style={{ borderRadius: 6, padding: "4px 10px", fontSize: 13 }}>
                    {capitalize(v)} View
                  </Tag>
                ))}
              </div>
              <Divider style={{ margin: "20px 0" }} />
            </>
          )}

          {/* Photo groups */}
          {Object.entries(p.photos || {}).map(([group, urls]) =>
            urls?.length > 0 ? (
              <div key={group} style={{ marginBottom: 24 }}>
                <h3 style={S.sectionTitle}>{capitalize(group)} Photos</h3>
                <div style={S.photoGroupGrid}>
                  {urls.map((url, i) => (
                    <div
                      key={i}
                      style={S.photoGroupThumb}
                      onClick={() => {
                        const idx = allPhotos.findIndex((ph) => ph.url === url);
                        setActiveImg(idx >= 0 ? idx : 0);
                        setLightbox(true);
                      }}
                    >
                      <img src={url} alt="" style={S.thumbImg} />
                    </div>
                  ))}
                </div>
              </div>
            ) : null
          )}
        </div>

        {/* ── RIGHT COL — sticky price card ── */}
        <div style={S.rightCol}>
          <div style={S.priceCard}>
            <p style={S.priceLabel}>Asking Price</p>
            <p style={S.priceValue}>
              {fmt(p.price)}{" "}
              <span style={S.priceCurrency}>{p.currency || "AED"}</span>
            </p>

            {p.shareCommission && (
              <div style={S.commissionBadge}>
                Commission: {p.shareCommissionPercentage}%
              </div>
            )}

            <Divider style={{ margin: "16px 0" }} />

            <DetailRow icon={<CalendarOutlined />} label="Available From"  value={formatDate(p.availableFrom)} />
            <DetailRow icon={<HomeOutlined />}      label="Bedroom Type"   value={p.bedroomType || "—"} />
            <DetailRow icon={<BankOutlined />}      label="Ownership"      value={capitalize(p.ownershipType || "—")} />
            <DetailRow icon={<CarOutlined />}       label="Parking Spaces" value={p.parkingSpaces ?? "—"} />
            {p.reraNumber && (
              <DetailRow icon={<GlobalOutlined />}  label="RERA No."       value={p.reraNumber} />
            )}

            <Divider style={{ margin: "16px 0" }} />

            {p.websiteUrl && (
              <a href={p.websiteUrl} target="_blank" rel="noopener noreferrer" style={S.ctaBtn}>
                <LinkOutlined style={{ marginRight: 8 }} /> Visit Website
              </a>
            )}
            {p.brochure && (
              <a href={p.brochure} target="_blank" rel="noopener noreferrer" style={S.ctaBtn}>
                <FileOutlined style={{ marginRight: 8 }} /> Download Brochure
              </a>
            )}
            {p.videoUrl && (
              <a href={p.videoUrl} target="_blank" rel="noopener noreferrer" style={S.ctaBtn}>
                <VideoCameraOutlined style={{ marginRight: 8 }} /> Watch Video Tour
              </a>
            )}

            <p style={S.contactPrompt}>
              {p.showContactOnlyVerified
                ? "Contact available for verified agents only."
                : "Reach out for more information."}
            </p>
          </div>

          {p.coordinates?.lat && p.coordinates?.lng && (
            <div style={S.mapCard}>
              <h4 style={S.mapTitle}>
                <EnvironmentOutlined style={{ marginRight: 6, color: "#7c3aed" }} />
                Location
              </h4>
              <p style={S.mapCoords}>{p.coordinates.lat}, {p.coordinates.lng}</p>
              <a
                href={`https://www.google.com/maps?q=${p.coordinates.lat},${p.coordinates.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                style={S.mapLink}
              >
                Open in Google Maps →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
const DetailRow = ({ icon, label, value }) => (
  <div style={S.detailRow}>
    <span style={S.detailIcon}>{icon}</span>
    <span style={S.detailLabel}>{label}</span>
    <span style={S.detailValue}>{value}</span>
  </div>
);

// ─── Pure helpers ─────────────────────────────────────────────────────────────
const capitalize = (str = "") =>
  str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, " ");

const facilityLabel = (key) => ({
  swimmingPool: "Swimming Pool",
  gym: "Gym",
  parking: "Parking",
  childrenPlayArea: "Children's Play Area",
  gardens: "Gardens",
  security: "24/7 Security",
  concierge: "Concierge",
}[key] || capitalize(key));

// ─── Styles ───────────────────────────────────────────────────────────────────
const PURPLE = "#7c3aed";

const S = {
  page:       { background: "#f9fafb", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif" },
  loaderWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 16 },

  // Nav
  topNav: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 28px", background: "#fff", borderBottom: "1px solid #f0f0f0",
    position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  backBtn: {
    display: "inline-flex", alignItems: "center", gap: 6,
    background: "none", border: "1px solid #e5e7eb", borderRadius: 8,
    padding: "7px 16px", cursor: "pointer", fontSize: 13,
    color: "#374151", fontWeight: 500,
  },
  badge: {
    display: "inline-flex", alignItems: "center",
    padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
  },

  // Hero
  heroSection: { background: "#111827", paddingBottom: 12 },
  mainImageWrap: {
    position: "relative", cursor: "pointer", overflow: "hidden",
    height: "clamp(260px, 48vw, 500px)",
  },
  mainImage: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  expandHint: {
    position: "absolute", bottom: 14, right: 14,
    background: "rgba(0,0,0,0.6)", color: "#fff",
    padding: "7px 14px", borderRadius: 8, fontSize: 12,
    display: "flex", alignItems: "center", backdropFilter: "blur(4px)",
  },
  photoCount: {
    marginLeft: 8, background: "rgba(255,255,255,0.15)",
    padding: "2px 7px", borderRadius: 4, fontSize: 11,
  },
  groupTag: {
    position: "absolute", top: 14, left: 14,
    background: "rgba(0,0,0,0.5)", color: "#fff",
    padding: "3px 10px", borderRadius: 6, fontSize: 11, textTransform: "capitalize",
    backdropFilter: "blur(4px)",
  },
  thumbStrip: {
    display: "flex", gap: 8, overflowX: "auto",
    padding: "10px 14px 0", scrollbarWidth: "none",
  },
  thumb: {
    width: 76, height: 52, borderRadius: 6, overflow: "hidden",
    cursor: "pointer", flexShrink: 0, transition: "opacity 0.2s, border 0.2s",
  },
  thumbImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },

  // Lightbox
  lightboxOverlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.93)",
    zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
  },
  lightboxBox: {
    position: "relative", maxWidth: "90vw", maxHeight: "90vh",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
  },
  lightboxClose: {
    position: "absolute", top: -40, right: 0,
    background: "rgba(255,255,255,0.1)", border: "none", color: "#fff",
    fontSize: 16, width: 32, height: 32, borderRadius: "50%",
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
  },
  lightboxImg: { maxWidth: "90vw", maxHeight: "75vh", objectFit: "contain", borderRadius: 8 },
  lightboxNav: { display: "flex", alignItems: "center", gap: 20 },
  lightboxArrow: {
    background: "rgba(255,255,255,0.12)", border: "none", color: "#fff",
    fontSize: 16, width: 40, height: 40, borderRadius: "50%",
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
  },

  // Body
  body: {
    display: "flex", gap: 24, padding: "28px 32px",
    maxWidth: 1400, margin: "0 auto", flexWrap: "wrap",
  },
  leftCol:  { flex: "1 1 600px", minWidth: 0 },
  rightCol: { flex: "0 0 330px", minWidth: 280 },

  // Title
  devAvatar: {
    width: 46, height: 46, borderRadius: 10,
    background: PURPLE, overflow: "hidden",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, border: "2px solid #ede9fe",
  },
  devName:      { margin: 0, fontSize: 13, fontWeight: 600, color: "#6b7280" },
  projectLabel: { margin: 0, fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" },
  propertyTitle: {
    fontSize: "clamp(20px, 3.5vw, 30px)", fontWeight: 800,
    color: "#111827", margin: "12px 0 6px", lineHeight: 1.2,
  },
  locationLine: { color: "#6b7280", fontSize: 14, display: "flex", alignItems: "center", margin: 0 },

  // Stats grid — icon-based, no emojis
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gap: 12,
  },
  statCard: {
    background: "#fff", borderRadius: 12, padding: "14px 16px",
    display: "flex", flexDirection: "column", alignItems: "flex-start",
    border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  statIconWrap: {
    width: 34, height: 34, borderRadius: 8,
    background: "#f5f3ff",
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: 8,
  },
  statValue: { fontSize: 15, fontWeight: 700, color: "#111827", lineHeight: 1.1, textTransform: "capitalize" },
  statLabel: { fontSize: 11, color: "#9ca3af", marginTop: 3, textTransform: "uppercase", letterSpacing: "0.05em" },

  // Sections
  sectionTitle: { fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 12, marginTop: 0 },
  description:  { color: "#4b5563", lineHeight: 1.75, fontSize: 14, margin: 0 },

  // Amenities
  amenitiesGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8,
  },
  amenityItem: {
    display: "flex", alignItems: "center",
    background: "#fafafa", borderRadius: 8,
    padding: "8px 12px", border: "1px solid #f3f4f6",
  },

  // Photo groups
  photoGroupGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 8,
  },
  photoGroupThumb: {
    height: 86, borderRadius: 8, overflow: "hidden",
    cursor: "pointer", border: "1px solid #e5e7eb",
  },

  // Price card
  priceCard: {
    background: "#fff", borderRadius: 16, padding: 22,
    border: "1px solid #e5e7eb", boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
    position: "sticky", top: 76, marginBottom: 16,
  },
  priceLabel:    { fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 },
  priceValue:    { fontSize: 26, fontWeight: 800, color: "#111827", margin: "4px 0 0", lineHeight: 1 },
  priceCurrency: { fontSize: 15, fontWeight: 600, color: "#6b7280" },
  commissionBadge: {
    background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0",
    borderRadius: 8, padding: "6px 12px", fontSize: 13, fontWeight: 600,
    marginTop: 10, textAlign: "center",
  },

  // Detail rows
  detailRow:   { display: "flex", alignItems: "center", gap: 8, marginBottom: 10 },
  detailIcon:  { color: PURPLE, fontSize: 14, width: 18, flexShrink: 0 },
  detailLabel: { fontSize: 13, color: "#6b7280", flex: 1 },
  detailValue: { fontSize: 13, fontWeight: 600, color: "#111827", textTransform: "capitalize" },

  // CTA buttons
  ctaBtn: {
    display: "flex", alignItems: "center",
    padding: "9px 14px", borderRadius: 8, marginBottom: 8,
    border: `1px solid ${PURPLE}`, color: PURPLE,
    fontWeight: 500, fontSize: 13, textDecoration: "none",
  },
  contactPrompt: { marginTop: 10, fontSize: 12, color: "#9ca3af", textAlign: "center", lineHeight: 1.5 },

  // Map card
  mapCard:   { background: "#fff", borderRadius: 16, padding: 18, border: "1px solid #e5e7eb" },
  mapTitle:  { fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 8, marginTop: 0 },
  mapCoords: { fontSize: 12, color: "#9ca3af", margin: "0 0 8px", fontFamily: "monospace" },
  mapLink:   { fontSize: 13, color: PURPLE, fontWeight: 600, textDecoration: "none" },
};