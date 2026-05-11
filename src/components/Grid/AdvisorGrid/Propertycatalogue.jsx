import { useState, useEffect, useCallback } from "react";
import {
  MapPin, Bed, Bath, Square, Building2, Flame, Calendar,
  Eye, Heart, CheckCircle2, Lock, ArrowLeft, Search,
  FileText, ChevronLeft, ChevronRight, Home, Sparkles,
  TrendingUp, Grid3X3, Plus, LayoutGrid, Layers
} from "lucide-react";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

// ─── helpers ──────────────────────────────────────────────────────────────────
const getThumb = (photos, mainLogo) => {
  if (mainLogo) return mainLogo;
  const all = [
    ...(photos?.architecture || []),
    ...(photos?.interior || []),
    ...(photos?.lobby || []),
    ...(photos?.other || []),
  ];
  return all[0] || null;
};

const formatPrice = (price, type, currency = "AED") => {
  if (!price) return `${currency} —`;
  if (type === "rental") {
    if (price >= 1_000_000) return `${currency} ${(price / 1_000_000).toFixed(1)}M/yr`;
    return `${currency} ${price.toLocaleString()}/yr`;
  }
  if (price >= 1_000_000) return `${currency} ${(price / 1_000_000).toFixed(2)}M`;
  if (price >= 1_000) return `${currency} ${(price / 1_000).toFixed(0)}K`;
  return `${currency} ${price.toLocaleString()}`;
};

const typeLabel = (t) =>
  ({ off_plan: "Off-Plan", secondary: "Secondary", rental: "Rental", commercial: "Commercial" }[t] || t);

const typeColor = (t) =>
({
  off_plan: { bg: "#6d28d9", text: "#fff" },
  secondary: { bg: "#065f46", text: "#fff" },
  rental: { bg: "#1e40af", text: "#fff" },
  commercial: { bg: "#92400e", text: "#fff" },
}[t] || { bg: "#374151", text: "#fff" });

const bedroomLabel = (type, count) => {
  if (type === "studio") return "Studio";
  if (!count || count === 0) return "Studio";
  return `${count} Bed`;
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div style={styles.card}>
    <div style={{ height: 180, background: "linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
    <div style={{ padding: "16px 18px" }}>
      <div style={{ height: 11, width: "35%", background: "#eee", borderRadius: 6, marginBottom: 10 }} />
      <div style={{ height: 17, width: "75%", background: "#eee", borderRadius: 6, marginBottom: 8 }} />
      <div style={{ height: 11, width: "55%", background: "#eee", borderRadius: 6 }} />
    </div>
  </div>
);

// ─── Property Card ────────────────────────────────────────────────────────────
const PropertyCard = ({ property, onView }) => {
  const thumb = getThumb(property.photos, property.mainLogo);
  const tc = typeColor(property.propertySubType);
  const [imgErr, setImgErr] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        ...styles.card,
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        borderColor: hovered ? "rgba(109,40,217,0.3)" : "rgba(109,40,217,0.08)",
        boxShadow: hovered
          ? "0 20px 48px rgba(109,40,217,0.13), 0 4px 12px rgba(0,0,0,0.06)"
          : "0 2px 8px rgba(0,0,0,0.04)",
      }}
      onClick={() => onView(property)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div style={styles.cardImg}>
        {thumb && !imgErr ? (
          <img
            src={thumb}
            alt={property.propertyName}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s", transform: hovered ? "scale(1.04)" : "scale(1)" }}
            onError={() => setImgErr(true)}
          />
        ) : (
          <div style={styles.cardImgFallback}>
            <Home size={40} color="#a78bfa" strokeWidth={1.5} />
          </div>
        )}

        <div style={styles.imgOverlay} />

        {/* Type badge */}
        <span style={{ ...styles.badge, background: tc.bg, color: tc.text, top: 12, left: 12 }}>
          {typeLabel(property.propertySubType)}
        </span>

        {/* HOT badge */}
        {property.isHot && (
          <span style={{ ...styles.badge, background: "#dc2626", color: "#fff", top: 12, right: 12, display: "flex", alignItems: "center", gap: 4 }}>
            <Flame size={10} /> HOT
          </span>
        )}

        {/* Completion for off-plan */}
        {property.propertySubType === "off_plan" && property.completionDate?.quarter && (
          <span style={{ ...styles.badge, background: "rgba(0,0,0,0.6)", color: "#fff", bottom: 12, left: 12, top: "auto", display: "flex", alignItems: "center", gap: 5, backdropFilter: "blur(4px)" }}>
            <Calendar size={10} />
            {property.completionDate.quarter} {property.completionDate.year}
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "14px 16px" }}>
        <div style={styles.cardPrice}>
          {formatPrice(property.price || property.price_min, property.propertySubType, property.currency)}
        </div>
        <div style={styles.cardName} title={property.propertyName}>
          {property.propertyName}
        </div>
        <div style={styles.cardLoc}>
          <MapPin size={11} style={{ marginRight: 3, flexShrink: 0 }} />
          {property.area?.split(",")[0] || property.city}
          {property.developer?.name && (
            <span style={{ marginLeft: 6, color: "#c4b5d4", fontWeight: 400 }}>· {property.developer.name}</span>
          )}
        </div>

        {/* Meta */}
        <div style={styles.metaRow}>
          <span style={styles.metaItem}><Bed size={12} style={{ marginRight: 3 }} />{bedroomLabel(property.bedroomType, property.bedrooms)}</span>
          <span style={styles.metaDivider} />
          <span style={styles.metaItem}><Bath size={12} style={{ marginRight: 3 }} />{property.bathrooms} Bath</span>
          {(property.builtUpArea > 0 || property.builtUpArea_min > 0) && (
            <>
              <span style={styles.metaDivider} />
              <span style={styles.metaItem}><Square size={12} style={{ marginRight: 3 }} />{(property.builtUpArea || property.builtUpArea_min).toLocaleString()} sqft</span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={styles.cardActions}>
        <button
          style={styles.btnView}
          onClick={(e) => { e.stopPropagation(); onView(property); }}
        >
          View Details
        </button>
        <button
          style={styles.btnPresentation}
          onClick={(e) => { e.stopPropagation(); }}
        >
          <Sparkles size={12} style={{ marginRight: 5 }} />
          AI Presentation
        </button>
      </div>
    </div>
  );
};

// ─── Detail Page ──────────────────────────────────────────────────────────────
const PropertyDetail = ({ property: p, onBack }) => {
  const thumb = getThumb(p.photos, p.mainLogo);
  const allPhotos = [
    ...(p.photos?.architecture || []),
    ...(p.photos?.interior || []),
    ...(p.photos?.lobby || []),
    ...(p.photos?.other || []),
  ];
  const tc = typeColor(p.propertySubType);
  const [selectedImage, setSelectedImage] = useState(thumb);

  const specs = [
    { icon: <Bed size={18} strokeWidth={1.5} />, val: bedroomLabel(p.bedroomType, p.bedrooms), lbl: "Bedrooms" },
    { icon: <Bath size={18} strokeWidth={1.5} />, val: p.bathrooms || 0, lbl: "Bathrooms" },
    { icon: <Square size={18} strokeWidth={1.5} />, val: `${(p.builtUpArea || p.builtUpArea_min || 0).toLocaleString()} sqft`, lbl: "Area" },
    { icon: <Building2 size={18} strokeWidth={1.5} />, val: p.floorNumber > 0 ? `Floor ${p.floorNumber}` : "—", lbl: "Floor" },
  ];

  const stats = [
    { icon: <Eye size={14} />, label: "Views", val: p.viewCount || 0 },
    { icon: <Heart size={14} />, label: "Wishlists", val: p.wishlistCount || 0 },
    { icon: <CheckCircle2 size={14} />, label: "Sold Units", val: p.soldUnits || 0 },
    { icon: <Lock size={14} />, label: "Reserved", val: p.reservedUnits || 0 },
  ];

  return (
    <div style={{ background: "#f6f5fb", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Back bar */}
      <div style={styles.backBar} onClick={onBack}>
        <ArrowLeft size={16} />
        <span>Back to Catalogue</span>
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 22 }}>

          {/* ── LEFT ── */}
          <div>
            {/* Hero */}
            <div style={{ borderRadius: 16, overflow: "hidden", marginBottom: 14, height: 300, background: "#e5e7eb", position: "relative" }}>
              {thumb ? (
                <img
                  src={selectedImage || thumb}
                  alt={p.propertyName}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <Home size={64} color="#a78bfa" strokeWidth={1} />
                </div>
              )}
              <div style={styles.imgOverlay} />
              <span style={{ ...styles.badge, background: tc.bg, color: tc.text, top: 16, left: 16, fontSize: 12, padding: "5px 14px", position: "absolute" }}>
                {typeLabel(p.propertySubType)}
              </span>
              {p.isHot && (
                <span style={{ ...styles.badge, background: "#dc2626", color: "#fff", top: 16, right: 16, fontSize: 12, padding: "5px 14px", position: "absolute", display: "flex", alignItems: "center", gap: 5 }}>
                  <Flame size={12} /> HOT
                </span>
              )}
            </div>

            {/* Photo strip */}
            {allPhotos.length > 1 && (
              <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
                {allPhotos.slice(0, 7).map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    onClick={() => setSelectedImage(url)}   // 🔥 MAIN FIX
                    style={{
                      width: 84,
                      height: 60,
                      objectFit: "cover",
                      borderRadius: 10,
                      cursor: "pointer",
                      border: selectedImage === url
                        ? "2px solid #6d28d9"
                        : "2px solid rgba(109,40,217,0.12)"
                    }}
                  />
                ))}
              </div>
            )}

            {/* Title */}
            <div style={styles.detailSection}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: "#18181b", margin: 0 }}>{p.propertyName}</h1>
              </div>
              <div style={{ fontSize: 13, color: "#71717a", marginBottom: 12, display: "flex", alignItems: "center", gap: 5 }}>
                <MapPin size={13} color="#6d28d9" />
                {p.area}, {p.city}, {p.country}
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#6d28d9" }}>
                {formatPrice(p.price || p.price_min, p.propertySubType, p.currency)}
              </div>
              {p.propertySubType === "off_plan" && p.price_min !== p.price_max && p.price_max > 0 && (
                <div style={{ fontSize: 12, color: "#a1a1aa", marginTop: 4 }}>
                  Range: {formatPrice(p.price_min, p.propertySubType, p.currency)} – {formatPrice(p.price_max, p.propertySubType, p.currency)}
                </div>
              )}
            </div>

            {/* Specs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
              {specs.map((s, i) => (
                <div key={i} style={styles.specCard}>
                  <div style={{ color: "#6d28d9", marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#18181b" }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: "#a1a1aa", marginTop: 2 }}>{s.lbl}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            {p.description && p.description.trim().length > 2 && (
              <div style={styles.detailSection}>
                <div style={styles.sectionTitle}>About this Property</div>
                <p style={{ fontSize: 13, color: "#52525b", lineHeight: 1.8, margin: 0 }}>{p.description}</p>
              </div>
            )}

            {/* Amenities */}
            {p.amenities?.length > 0 && (
              <div style={styles.detailSection}>
                <div style={styles.sectionTitle}>Amenities</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {p.amenities.map((a, i) => (
                    <span key={i} style={{ padding: "5px 14px", background: "#f3e8ff", color: "#6d28d9", borderRadius: 20, fontSize: 12, fontWeight: 500 }}>{a}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Facilities */}
            {Object.values(p.facilities || {}).some(Boolean) && (
              <div style={styles.detailSection}>
                <div style={styles.sectionTitle}>Facilities</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {Object.entries(p.facilities).filter(([, v]) => v).map(([k]) => (
                    <span key={k} style={{ padding: "5px 14px", background: "#d1fae5", color: "#065f46", borderRadius: 20, fontSize: 12, fontWeight: 500 }}>
                      {k.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Plan */}
            {p.propertySubType === "off_plan" && p.paymentPlan?.length > 0 && (
              <div style={styles.detailSection}>
                <div style={styles.sectionTitle}>Payment Plan</div>
                {p.paymentPlan.map((plan, i) => (
                  <div key={i}>
                    {plan.title && <div style={{ fontSize: 13, fontWeight: 600, color: "#18181b", marginBottom: 10 }}>{plan.title}</div>}
                    {plan.stages?.map((s, j) => (
                      <div key={j} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid rgba(109,40,217,0.07)", fontSize: 13 }}>
                        <span style={{ color: "#52525b" }}>{s.description || s.stage}</span>
                        <span style={{ fontWeight: 600, color: "#6d28d9", background: "#f3e8ff", padding: "2px 12px", borderRadius: 12, fontSize: 12 }}>{s.percentage}%</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Property details table */}
            <div style={styles.detailSection}>
              <div style={styles.sectionTitle}>Property Details</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                {[
                  ["Unit Type", p.unitType],
                  ["Furnishing", p.furnishing?.replace("_", " ")],
                  ["Ownership", p.ownershipType],
                  ["Transaction", p.transactionType === "rent" ? "For Rent" : "For Sale"],
                  p.rentalFrequency && ["Rental Frequency", p.rentalFrequency],
                  p.cheques && ["Cheques Accepted", p.cheques],
                  p.minimumContract && ["Min. Contract", `${p.minimumContract} months`],
                  p.parkingSpaces > 0 && ["Parking", `${p.parkingSpaces} space(s)`],
                  p.reraPermitNumber && ["RERA Permit", p.reraPermitNumber],
                  p.dldRegistrationNumber && ["DLD Registration", p.dldRegistrationNumber],
                  p.completionDate?.quarter && ["Handover", `${p.completionDate.quarter} ${p.completionDate.year}`],
                  p.readinessProgress && p.readinessProgress !== "0%" && ["Construction", p.readinessProgress],
                ].filter(Boolean).map(([label, val], i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(109,40,217,0.06)" }}>
                    <td style={{ padding: "8px 0", color: "#a1a1aa", width: "42%", fontWeight: 500 }}>{label}</td>
                    <td style={{ padding: "8px 0", color: "#18181b", fontWeight: 600, textTransform: "capitalize" }}>{val}</td>
                  </tr>
                ))}
              </table>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* AI Presentation CTA */}
            <div style={{ ...styles.detailSection, background: "linear-gradient(135deg, #4c1d95 0%, #6d28d9 60%, #7c3aed 100%)", border: "none", boxShadow: "0 8px 32px rgba(109,40,217,0.3)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Sparkles size={15} color="#e9d5ff" />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>AI Presentation</span>
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginBottom: 16, lineHeight: 1.6 }}>
                Generate a branded property presentation for your client in seconds.
              </div>
              <button style={{ ...styles.btnPrimary, background: "#fff", color: "#6d28d9", fontWeight: 700 }}>
                Generate Presentation
              </button>
            </div>

            {/* Add to Lead */}
            <div style={styles.detailSection}>
              <div style={styles.sectionTitle}>Add to Lead</div>
              <button style={{ ...styles.btnPrimary, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Plus size={14} /> Add to Existing Lead
              </button>
              <button style={{ ...styles.btnOutline, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Plus size={14} /> Create New Lead
              </button>
            </div>

            {/* Developer info */}
            {p.developer && (
              <div style={styles.detailSection}>
                <div style={styles.sectionTitle}>Developer</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {p.developer.logo ? (
                    <img src={p.developer.logo} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: "#f3e8ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Layers size={20} color="#6d28d9" />
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#18181b" }}>{p.developer.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                      <CheckCircle2 size={11} color="#059669" />
                      <span style={{ fontSize: 11, color: "#059669", fontWeight: 500 }}>Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Documents */}
            {p.brochure && (
              <div style={styles.detailSection}>
                <div style={styles.sectionTitle}>Documents</div>
                <a href={p.brochure} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#6d28d9", textDecoration: "none", fontWeight: 600 }}>
                  <FileText size={15} />
                  Download Brochure
                </a>
              </div>
            )}

            {/* Interest Stats */}
            <div style={styles.detailSection}>
              <div style={styles.sectionTitle}>Interest Stats</div>
              {stats.map(({ icon, label, val }, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: i < stats.length - 1 ? "1px solid rgba(109,40,217,0.06)" : "none", fontSize: 13 }}>
                  <span style={{ color: "#71717a", display: "flex", alignItems: "center", gap: 7 }}>{icon}{label}</span>
                  <span style={{ fontWeight: 700, color: "#18181b" }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
export default function PropertyCatalogue() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [selectedProp, setSelectedProp] = useState(null);

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);


  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (activeFilter !== "all") params.set("propertySubType", activeFilter);
      if (search.trim()) params.set("search", search.trim());
      if (sortBy === "price_asc") { params.set("sortBy", "price"); params.set("sortOrder", "asc"); }
      if (sortBy === "price_desc") { params.set("sortBy", "price"); params.set("sortOrder", "desc"); }

      const data = await apiService.get(`/properties?${params}`);
      setProperties(data.data || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [page, activeFilter, sortBy, search]);

  useEffect(() => {
    const t = setTimeout(fetchProperties, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchProperties, search]);

  const filters = [
    { key: "all", label: "All" },
    { key: "off_plan", label: "Off-Plan" },
    { key: "secondary", label: "Secondary" },
    { key: "rental", label: "Rental" },
    { key: "commercial", label: "Commercial" },
  ];

  if (selectedProp) {
    return <PropertyDetail property={selectedProp} onBack={() => setSelectedProp(null)} />;
  }

  return (
    <div style={{ background: "#f6f5fb", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif", padding: "28px 28px" }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        * { box-sizing: border-box; }
        button { cursor: pointer; }
        select { cursor: pointer; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 42, height: 42, background: "linear-gradient(135deg, #4c1d95, #6d28d9)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(109,40,217,0.35)" }}>
            <LayoutGrid size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#18181b", margin: 0, letterSpacing: "-0.3px" }}>Property Catalogue</h1>
            <p style={{ fontSize: 12, color: "#a1a1aa", margin: 0, marginTop: 2 }}>
              {pagination ? `${pagination.totalItems} active listings` : "Browsing all live listings"}
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1.5px solid rgba(109,40,217,0.12)", borderRadius: 10, padding: "0 14px", flex: 1, minWidth: 220, transition: "border-color 0.2s" }}>
          <Search size={15} color="#a1a1aa" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, area, developer..."
            style={{ border: "none", outline: "none", fontSize: 13, color: "#18181b", background: "transparent", padding: "10px 0", width: "100%" }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 4, background: "#fff", padding: 4, borderRadius: 10, border: "1.5px solid rgba(109,40,217,0.1)" }}>
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => { setActiveFilter(f.key); setPage(1); }}
              style={{
                padding: "6px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600,
                border: "none",
                background: activeFilter === f.key ? "#6d28d9" : "transparent",
                color: activeFilter === f.key ? "#fff" : "#71717a",
                transition: "all 0.15s",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div style={{ position: "relative" }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ border: "1.5px solid rgba(109,40,217,0.12)", borderRadius: 10, padding: "9px 14px", fontSize: 12, color: "#52525b", background: "#fff", outline: "none", fontWeight: 500, appearance: "none", paddingRight: 32 }}
          >
            <option value="newest">Recently Added</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
          </select>
          <TrendingUp size={13} color="#a1a1aa" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: "#fef2f2", color: "#991b1b", padding: "12px 18px", borderRadius: 10, marginBottom: 16, fontSize: 13, border: "1px solid #fecaca", display: "flex", alignItems: "center", gap: 8 }}>
          ⚠ {error} —{" "}
          <button onClick={fetchProperties} style={{ color: "#6d28d9", background: "none", border: "none", fontWeight: 700, padding: 0 }}>Retry</button>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div style={styles.grid}>
          {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : properties.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", color: "#a1a1aa" }}>
          <Home size={48} color="#d4d4d8" style={{ marginBottom: 14 }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: "#71717a", marginBottom: 4 }}>No properties found</div>
          <div style={{ fontSize: 13 }}>Try adjusting your search or filters</div>
        </div>
      ) : (
        <div style={styles.grid}>
          {properties.map((p) => (
            <PropertyCard key={p._id} property={p} onView={setSelectedProp} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24 }}>
          <span style={{ fontSize: 12, color: "#a1a1aa", fontWeight: 500 }}>
            Page {pagination.currentPage} of {pagination.totalPages} · {pagination.totalItems} total
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.hasPrevPage}
              style={{ ...styles.pgBtn, opacity: pagination.hasPrevPage ? 1 : 0.35 }}
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
              const n = i + Math.max(1, page - 2);
              if (n > pagination.totalPages) return null;
              return (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  style={{ ...styles.pgBtn, background: n === page ? "#6d28d9" : "#fff", color: n === page ? "#fff" : "#52525b", borderColor: n === page ? "#6d28d9" : "rgba(109,40,217,0.12)", fontWeight: n === page ? 700 : 500 }}
                >{n}</button>
              );
            })}
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasNextPage}
              style={{ ...styles.pgBtn, opacity: pagination.hasNextPage ? 1 : 0.35 }}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(268px, 1fr))",
    gap: 16,
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    border: "1.5px solid rgba(109,40,217,0.08)",
    overflow: "hidden",
    cursor: "pointer",
    transition: "transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease",
  },
  cardImg: {
    height: 180,
    position: "relative",
    overflow: "hidden",
    background: "#e5e7eb",
  },
  imgOverlay: {
    position: "absolute", inset: 0,
    background: "linear-gradient(to top, rgba(0,0,0,0.18) 0%, transparent 50%)",
    pointerEvents: "none",
  },
  cardImgFallback: {
    width: "100%", height: "100%",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
  },
  badge: {
    position: "absolute",
    fontSize: 10,
    fontWeight: 700,
    padding: "4px 10px",
    borderRadius: 20,
    letterSpacing: "0.4px",
    textTransform: "uppercase",
  },
  cardPrice: { fontSize: 17, fontWeight: 800, color: "#6d28d9", marginBottom: 4, letterSpacing: "-0.3px" },
  cardName: {
    fontSize: 13, fontWeight: 600, color: "#18181b", marginBottom: 5,
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  },
  cardLoc: { fontSize: 11, color: "#a1a1aa", marginBottom: 12, display: "flex", alignItems: "center" },
  metaRow: { display: "flex", gap: 0, borderTop: "1px solid rgba(109,40,217,0.07)", paddingTop: 10, alignItems: "center" },
  metaItem: { fontSize: 11, color: "#71717a", display: "flex", alignItems: "center", fontWeight: 500 },
  metaDivider: { width: 1, height: 12, background: "rgba(109,40,217,0.1)", margin: "0 10px" },
  cardActions: { display: "flex", gap: 8, padding: "10px 16px", borderTop: "1px solid rgba(109,40,217,0.07)", background: "#fafafa" },
  btnView: {
    flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 12, fontWeight: 600,
    cursor: "pointer", background: "#f3e8ff", color: "#6d28d9", border: "none",
    transition: "all 0.15s",
  },
  btnPresentation: {
    flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 12, fontWeight: 600,
    cursor: "pointer", background: "#6d28d9", color: "#fff", border: "none",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.15s",
  },
  backBar: {
    display: "flex", alignItems: "center", gap: 10, padding: "14px 28px",
    background: "#fff", borderBottom: "1px solid rgba(109,40,217,0.08)",
    cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#6d28d9",
    transition: "background 0.15s",
  },
  detailSection: {
    background: "#fff", borderRadius: 14, padding: "18px 22px",
    marginBottom: 16, border: "1.5px solid rgba(109,40,217,0.08)",
  },
  specCard: {
    background: "#fafafa", border: "1.5px solid rgba(109,40,217,0.08)",
    borderRadius: 12, padding: "14px 10px", textAlign: "center",
  },
  sectionTitle: {
    fontSize: 10, fontWeight: 800, color: "#a1a1aa", letterSpacing: "1.2px",
    textTransform: "uppercase", marginBottom: 12, paddingBottom: 8,
    borderBottom: "2px solid #f3e8ff",
  },
  btnPrimary: {
    width: "100%", padding: "11px 0", borderRadius: 9, fontSize: 13,
    fontWeight: 600, cursor: "pointer", background: "#6d28d9",
    color: "#fff", border: "none", transition: "opacity 0.15s",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  btnOutline: {
    width: "100%", padding: "11px 0", borderRadius: 9, fontSize: 13,
    fontWeight: 600, cursor: "pointer", background: "transparent",
    color: "#6d28d9", border: "1.5px solid #6d28d9", transition: "all 0.15s",
  },
  pgBtn: {
    width: 34, height: 34, borderRadius: 8,
    border: "1.5px solid rgba(109,40,217,0.12)",
    background: "#fff", fontSize: 13, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#52525b", fontWeight: 500, transition: "all 0.15s",
  },
};