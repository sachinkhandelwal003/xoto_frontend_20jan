import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// ─── STATIC DUMMY DATA ────────────────────────────────────────────────────────
const STATIC_LISTINGS = [
  {
    _id: "buy001",
    title: "Luxurious 2BR Apartment | Sea View | Furnished",
    emirate: "Dubai",
    location: { area: "Dubai Marina" },
    price: 2200000,
    size: 1420,
    bhk: "2 BR",
    baths: 2,
    furnishing: "Furnished",
    verified: true,
    paymentPlan: true,
    offPlan: false,
    secondaryPlans: false,
    isReady: true,
    completion: "Ready",
    roi: 6.8,
    developer: "Emaar",
    serviceCharge: 28000,
    amenities: ["Pool", "Gym", "Parking", "Sea View", "Balcony"],
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80",
    ],
  },
  {
    _id: "buy002",
    title: "Stunning 4BR Villa | Private Pool | Smart Home",
    emirate: "Dubai",
    location: { area: "Palm Jumeirah" },
    price: 9500000,
    size: 5800,
    bhk: "4 BR",
    baths: 5,
    furnishing: "Unfurnished",
    verified: true,
    paymentPlan: false,
    offPlan: false,
    secondaryPlans: false,
    isReady: true,
    completion: "Ready",
    roi: 5.2,
    developer: "Nakheel",
    serviceCharge: 95000,
    amenities: ["Pool", "Gym", "Parking", "Sea View", "Maid's Room"],
    images: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80",
    ],
  },
  {
    _id: "buy003",
    title: "Off-Plan 1BR | High ROI | Handover Q4 2026",
    emirate: "Dubai",
    location: { area: "Business Bay" },
    price: 980000,
    size: 780,
    bhk: "1 BR",
    baths: 1,
    furnishing: "Semi Furnished",
    verified: true,
    paymentPlan: true,
    offPlan: false,
    secondaryPlans: true,
    isReady: false,
    completion: "Q4 2026",
    roi: 8.5,
    developer: "Damac",
    serviceCharge: 14000,
    paymentPlanDetails: "60/40 — 60% during construction, 40% on handover",
    amenities: ["Pool", "Gym", "Parking", "Near Metro"],
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
    ],
  },
  {
    _id: "buy004",
    title: "Penthouse 3BR | Burj Khalifa View | Ultra Luxury",
    emirate: "Dubai",
    location: { area: "Downtown Dubai" },
    price: 7800000,
    size: 3200,
    bhk: "3 BR",
    baths: 4,
    furnishing: "Furnished",
    verified: true,
    paymentPlan: false,
    offPlan: false,
    secondaryPlans: false,
    isReady: true,
    completion: "Ready",
    roi: 5.9,
    developer: "Emaar",
    serviceCharge: 85000,
    amenities: ["Pool", "Gym", "Parking", "Sea View", "Balcony", "Maid's Room"],
    images: [
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=600&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&q=80",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=600&q=80",
    ],
  },
  {
    _id: "buy005",
    title: "Studio Apartment | Metro Access | Payment Plan",
    emirate: "Dubai",
    location: { area: "JVC" },
    price: 520000,
    size: 420,
    bhk: "Studio",
    baths: 1,
    furnishing: "Furnished",
    verified: false,
    paymentPlan: true,
    offPlan: false,
    secondaryPlans: false,
    isReady: true,
    completion: "Ready",
    roi: 7.2,
    developer: "Azizi",
    serviceCharge: 8500,
    paymentPlanDetails: "5% Down | 1% Monthly | No Interest",
    amenities: ["Gym", "Parking", "Near Metro", "Pool"],
    images: [
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600&q=80",
      "https://images.unsplash.com/photo-1555636222-cae831e670b3?w=600&q=80",
    ],
  },
  {
    _id: "buy006",
    title: "Spacious Townhouse 3BR | Community Living | Garden",
    emirate: "Dubai",
    location: { area: "Al Barsha" },
    price: 3100000,
    size: 2800,
    bhk: "3 BR",
    baths: 3,
    furnishing: "Unfurnished",
    verified: true,
    paymentPlan: false,
    offPlan: false,
    isReady: true,
    completion: "Ready",
    roi: 4.8,
    developer: "Meraas",
    serviceCharge: 32000,
    amenities: ["Parking", "Kids Play Area", "Pool", "Gym"],
    images: [
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80",
    ],
  },
];

const BEDROOMS       = ["Any", "Studio", "1 BR", "2 BR", "3 BR", "4 BR", "5+ BR"];
const PROP_TYPES     = ["All", "Apartment", "Villa", "Penthouse", "Townhouse"];
const AMENITY_LIST   = ["Pool", "Gym", "Parking", "Sea View", "Balcony", "Near Metro", "Payment Plan", "Mortgage Ready"];
const COMPLETION_OPTS = ["Any", "Ready", "Off-Plan", "Under Construction"];

// ─── LIGHTBOX ─────────────────────────────────────────────────────────────────
import { useEffect } from "react";

function Lightbox({ images, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape")     onClose();
      if (e.key === "ArrowRight") setCurrent((c) => (c + 1) % images.length);
      if (e.key === "ArrowLeft")  setCurrent((c) => (c - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, flexDirection: "column", gap: 16 }}>
      <button onClick={onClose} style={{ position: "absolute", top: 20, right: 24, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, color: "white", width: 40, height: 40, cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
      <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600 }}>{current + 1} / {images.length}</div>
      <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={() => setCurrent((c) => (c - 1 + images.length) % images.length)} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, color: "white", width: 48, height: 48, cursor: "pointer", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
        <img src={images[current]} alt="" style={{ maxWidth: "min(860px, 80vw)", maxHeight: "70vh", borderRadius: 16, objectFit: "cover" }} />
        <button onClick={() => setCurrent((c) => (c + 1) % images.length)} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, color: "white", width: 48, height: 48, cursor: "pointer", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", maxWidth: 700, padding: "0 16px" }}>
        {images.map((img, i) => (
          <img key={i} src={img} alt="" onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
            style={{ width: 64, height: 48, objectFit: "cover", borderRadius: 8, cursor: "pointer", opacity: i === current ? 1 : 0.45, border: i === current ? "2px solid #a78bfa" : "2px solid transparent" }} />
        ))}
      </div>
    </div>
  );
}

// ─── IMAGE GRID ───────────────────────────────────────────────────────────────
function ImageGrid({ images, onOpen }) {
  const imgs = images?.length ? images : ["https://placehold.co/600x400/ede9fe/7c3aed?text=No+Image"];
  return (
    <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", cursor: "pointer" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "160px 100px", gap: 3 }}>
        <div style={{ gridRow: "1 / 3", overflow: "hidden" }} onClick={() => onOpen(0)}>
          <img src={imgs[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.04)")} onMouseLeave={(e) => (e.target.style.transform = "scale(1)")} />
        </div>
        <div style={{ overflow: "hidden" }} onClick={() => onOpen(1)}>
          <img src={imgs[1] || imgs[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.04)")} onMouseLeave={(e) => (e.target.style.transform = "scale(1)")} />
        </div>
        <div style={{ overflow: "hidden", position: "relative" }} onClick={() => onOpen(2)}>
          <img src={imgs[2] || imgs[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.04)")} onMouseLeave={(e) => (e.target.style.transform = "scale(1)")} />
          {imgs.length > 3 && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.52)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 14, fontWeight: 700 }}>
              +{imgs.length - 3} photos
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── LISTING CARD ─────────────────────────────────────────────────────────────
function ListingCard({ listing, saved, onSave }) {
  const [lightboxOpen,  setLightboxOpen]  = useState(false);
  const [lightboxStart, setLightboxStart] = useState(0);
  const [hovered,       setHovered]       = useState(false);
  const [expanded,      setExpanded]      = useState(false);
  const [contacted,     setContacted]     = useState(false);

  const openLightbox = (idx) => { setLightboxStart(idx); setLightboxOpen(true); };
  const isReady = listing.isReady || listing.completion === "Ready";

  return (
    <>
      {lightboxOpen && <Lightbox images={listing.images || []} startIndex={lightboxStart} onClose={() => setLightboxOpen(false)} />}

      <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        style={{ background: "#fff", border: `1.5px solid ${hovered ? "#c4b5fd" : "#f0f0f0"}`, borderRadius: 20, overflow: "hidden", boxShadow: hovered ? "0 12px 40px rgba(109,40,217,0.1)" : "0 2px 12px rgba(0,0,0,0.04)", transition: "all 0.25s ease", transform: hovered ? "translateY(-3px)" : "none", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 0, flexWrap: "wrap" }}>

          {/* Image Grid */}
          <div style={{ width: 320, flexShrink: 0, padding: 12, position: "relative" }}>
            <ImageGrid images={listing.images} onOpen={openLightbox} />

            <div style={{ position: "absolute", top: 20, left: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              {listing.verified && (
                <div style={{ background: "#6d28d9", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 6, padding: "4px 10px", letterSpacing: "0.06em", textTransform: "uppercase" }}>✦ Verified</div>
              )}
              {listing.paymentPlan && (
                <div style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 6, padding: "4px 10px" }}>💳 Payment Plan</div>
              )}
              {listing.offPlan && (
                <div style={{ background: "rgba(167,139,250,0.9)", color: "#3b0764", fontSize: 10, fontWeight: 700, borderRadius: 6, padding: "4px 10px" }}>🏗 Off-Plan</div>
              )}
            </div>

            <button onClick={() => onSave(listing._id)}
              style={{ position: "absolute", top: 20, right: 20, background: saved ? "#6d28d9" : "rgba(255,255,255,0.9)", border: "1.5px solid " + (saved ? "#6d28d9" : "rgba(0,0,0,0.1)"), borderRadius: 10, width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", fontSize: 16, color: saved ? "#fff" : "#94a3b8" }}>
              {saved ? "♥" : "♡"}
            </button>
          </div>

          {/* Content */}
          <div style={{ flex: 1, padding: "20px 24px 16px 12px", display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>

            {/* Title Row */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: "#1e1b4b", margin: "0 0 5px", letterSpacing: "-0.3px", lineHeight: 1.3 }}>{listing.title}</h3>
                <div style={{ fontSize: 13, color: "#64748b", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ color: "#a78bfa" }}>⌖</span>
                  {listing.location?.area && `${listing.location.area}, `}{listing.emirate}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#6d28d9", letterSpacing: "-0.5px" }}>
                  AED {(listing.price || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>total price</div>
              </div>
            </div>

            {/* Stats Bar */}
            <div style={{ display: "flex", gap: 12, background: "#f8f4ff", borderRadius: 12, padding: "10px 16px", border: "1px solid #ede9fe" }}>
              {[
                { icon: "⬛", label: (listing.size || "—") + " sqft" },
                { icon: "🛏", label: listing.bhk || "—" },
                { icon: "🚿", label: (listing.baths || "—") + " Bath" },
                { icon: "✦",  label: (listing.furnishing || "—").split(" ")[0] },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#475569" }}>
                  <span>{s.icon}</span>{s.label}
                  {i < 3 && <span style={{ color: "#d8b4fe", marginLeft: 12 }}>·</span>}
                </div>
              ))}
            </div>

            {/* Tags */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {listing.completion && (
                <span style={{ background: isReady ? "#ecfdf5" : "#f5f3ff", color: isReady ? "#059669" : "#7c3aed", border: `1px solid ${isReady ? "#a7f3d0" : "#ddd6fe"}`, borderRadius: 6, fontSize: 11, fontWeight: 700, padding: "3px 10px", textTransform: "uppercase" }}>
                  {isReady ? "✓ Ready" : "🏗 " + listing.completion}
                </span>
              )}
              {listing.roi && (
                <span style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: 6, fontSize: 11, fontWeight: 700, padding: "3px 10px" }}>
                  📈 ROI: {listing.roi}%
                </span>
              )}
              {listing.developer && (
                <span style={{ background: "#f1f5f9", color: "#475569", borderRadius: 6, fontSize: 11, fontWeight: 600, padding: "3px 10px" }}>
                  🏢 {listing.developer}
                </span>
              )}
            </div>

            {/* Amenities */}
            {listing.amenities?.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {listing.amenities.map((a) => (
                  <span key={a} style={{ background: "#fafafa", color: "#64748b", border: "1px solid #e9e9e9", borderRadius: 6, fontSize: 11, fontWeight: 600, padding: "3px 9px" }}>{a}</span>
                ))}
              </div>
            )}

            <div style={{ height: 1, background: "#f1f5f9" }} />

            {/* Footer CTA */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => setExpanded(!expanded)}
                style={{ background: "#f5f3ff", color: "#6d28d9", border: "1.5px solid #ddd6fe", borderRadius: 10, padding: "9px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                {expanded ? "▲ Less" : "▼ Details"}
              </button>
              <button onClick={() => setContacted(true)}
                style={{ background: contacted ? "#f5f3ff" : "#6d28d9", color: contacted ? "#6d28d9" : "white", border: contacted ? "1.5px solid #c4b5fd" : "1.5px solid transparent", borderRadius: 10, padding: "9px 22px", fontSize: 13, fontWeight: 800, cursor: contacted ? "default" : "pointer", boxShadow: contacted ? "none" : "0 4px 14px rgba(109,40,217,0.35)", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" }}>
                {contacted ? <><span>✓</span> Interest Sent</> : <><span>📞</span> Enquire</>}
              </button>
            </div>

            {/* Expanded Panel */}
            {expanded && (
              <div style={{ background: "#fafafa", borderRadius: 12, padding: 16, border: "1px solid #f0f0f0", marginTop: 4 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
                  {[
                    { label: "Price",          value: `AED ${(listing.price || 0).toLocaleString()}` },
                    { label: "Service Charge", value: listing.serviceCharge ? `AED ${listing.serviceCharge.toLocaleString()}/yr` : "—" },
                    { label: "Property Type",  value: listing.type || "Apartment" },
                    { label: "Floor Size",     value: `${listing.size || "—"} sqft` },
                    { label: "Completion",     value: listing.completion || "—" },
                    { label: "Developer",      value: listing.developer || "—" },
                  ].map((item, i) => (
                    <div key={i}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{item.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1e1b4b" }}>{item.value}</div>
                    </div>
                  ))}
                </div>
                {listing.paymentPlanDetails && (
                  <div style={{ background: "#f5f3ff", borderRadius: 8, padding: "10px 14px", border: "1px solid #ddd6fe", fontSize: 12, color: "#6d28d9", fontWeight: 600, marginBottom: 10 }}>
                    💳 Payment Plan: {listing.paymentPlanDetails}
                  </div>
                )}
                <button onClick={() => openLightbox(0)}
                  style={{ background: "white", color: "#6d28d9", border: "1.5px solid #c4b5fd", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", width: "100%" }}>
                  ⊞ View All Photos ({(listing.images || []).length})
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── MAIN BUY RESULTS PAGE ────────────────────────────────────────────────────
export default function BuyResultsPage() {
  const location = useLocation();
  const navigate  = useNavigate();

  const [sort,             setSort]             = useState("Recommended");
  const [savedIds,         setSavedIds]         = useState([]);
  const [filterBeds,       setFilterBeds]       = useState("Any");
  const [filterType,       setFilterType]       = useState("All");
  const [maxPrice,         setMaxPrice]         = useState(10000000);
  const [filterCompletion, setFilterCompletion] = useState("Any");
  const [amenityFilters,   setAmenityFilters]   = useState([]);
  const [verifiedOnly,     setVerifiedOnly]     = useState(false);
  const [paymentPlanOnly,  setPaymentPlanOnly]  = useState(false);
  const [page,             setPage]             = useState(1);
  const LIMIT = 4;

  const heroState    = location.state || {};
  const emirateLabel = heroState.emirate || "UAE";
  const areaLabel    = heroState.tags?.join(", ") || "";

  // ── Client-side filtering on static data ──
  const filtered = STATIC_LISTINGS.filter((l) => {
    if (filterBeds !== "Any" && l.bhk !== filterBeds) return false;
    if (filterType !== "All" && !l.title.toLowerCase().includes(filterType.toLowerCase())) return false;
    if (l.price > maxPrice) return false;
    if (filterCompletion !== "Any") {
      if (filterCompletion === "Ready"             && !l.isReady)    return false;
      if (filterCompletion === "Off-Plan"          && !l.offPlan)    return false;
      if (filterCompletion === "Under Construction" && l.isReady)    return false;
    }
    if (verifiedOnly    && !l.verified)    return false;
    if (paymentPlanOnly && !l.paymentPlan) return false;
    if (amenityFilters.length > 0 && !amenityFilters.every((a) => l.amenities.includes(a))) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "Price: Low to High")  return a.price - b.price;
    if (sort === "Price: High to Low")  return b.price - a.price;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / LIMIT);
  const paginated  = sorted.slice((page - 1) * LIMIT, page * LIMIT);

  const toggleSave    = (id) => setSavedIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const toggleAmenity = (a)  => setAmenityFilters((p) => p.includes(a) ? p.filter((x) => x !== a) : [...p, a]);

  const resetFilters = () => {
    setFilterBeds("Any"); setFilterType("All"); setMaxPrice(10000000);
    setAmenityFilters([]); setVerifiedOnly(false); setPaymentPlanOnly(false);
    setFilterCompletion("Any"); setPage(1);
  };

  return (
    <div style={{ background: "#f7f6fb", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <style>{`
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background:#c4b5fd; border-radius:10px; }
        input[type="range"] { -webkit-appearance:none; width:100%; height:5px; background:#e8e0fd; border-radius:4px; outline:none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance:none; width:18px; height:18px; border-radius:50%; background:#6d28d9; cursor:pointer; border:2px solid white; box-shadow:0 2px 6px rgba(109,40,217,0.4); }
        .pill { border:1.5px solid #e2e8f0; border-radius:8px; padding:7px 10px; font-size:12px; font-weight:700; color:#64748b; background:white; cursor:pointer; transition:all 0.18s; font-family:inherit; text-align:center; }
        .pill:hover { border-color:#a78bfa; color:#6d28d9; background:#f5f3ff; }
        .pill.on { border-color:#6d28d9; background:#6d28d9; color:white; }
        select.fselect { border:1.5px solid #e2e8f0; border-radius:8px; padding:8px 32px 8px 12px; font-size:13px; font-weight:700; color:#1e1b4b; background:white; outline:none; cursor:pointer; font-family:inherit; }
        select.fselect:focus { border-color:#6d28d9; }
        .chk { width:16px; height:16px; accent-color:#6d28d9; cursor:pointer; }
      `}</style>

      <div style={{ display: "grid", gridTemplateColumns: "264px 1fr 280px", gap: 20, maxWidth: 1400, margin: "0 auto", padding: "24px" }}>

        {/* ── LEFT FILTERS ── */}
        <div style={{ background: "white", border: "1.5px solid #f0f0f0", borderRadius: 18, padding: 20, maxHeight: "calc(100vh - 96px)", position: "sticky", top: 82, overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <span style={{ fontSize: 15, fontWeight: 900, color: "#1e1b4b" }}>Filters</span>
            <span onClick={resetFilters} style={{ fontSize: 12, fontWeight: 700, color: "#ef4444", cursor: "pointer" }}>Reset all</span>
          </div>

          {/* Bedrooms */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#1e1b4b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Bedrooms</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
              {BEDROOMS.map((b) => (
                <button key={b} onClick={() => { setFilterBeds(b); setPage(1); }} className={`pill${filterBeds === b ? " on" : ""}`}>{b}</button>
              ))}
            </div>
          </div>

          {/* Max Price */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#1e1b4b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Max Price</div>
            <div style={{ fontSize: 17, fontWeight: 900, color: "#6d28d9", marginBottom: 10 }}>
              AED {maxPrice >= 10000000 ? "10M+" : (maxPrice / 1000000).toFixed(1) + "M"}
            </div>
            <input type="range" min={500000} max={10000000} step={100000} value={maxPrice} onChange={(e) => { setMaxPrice(Number(e.target.value)); setPage(1); }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#94a3b8", fontWeight: 600, marginTop: 4 }}>
              <span>AED 500K</span><span>AED 10M+</span>
            </div>
          </div>

          {/* Property Type */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#1e1b4b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Property Type</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {PROP_TYPES.map((t) => (
                <label key={t} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#475569", fontWeight: 600 }}>
                  <input type="radio" name="ptype" className="chk" checked={filterType === t} onChange={() => { setFilterType(t); setPage(1); }} /> {t}
                </label>
              ))}
            </div>
          </div>

          {/* Completion */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#1e1b4b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Completion</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {COMPLETION_OPTS.map((c) => (
                <label key={c} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#475569", fontWeight: 600 }}>
                  <input type="radio" name="completion" className="chk" checked={filterCompletion === c} onChange={() => { setFilterCompletion(c); setPage(1); }} /> {c}
                </label>
              ))}
            </div>
          </div>

          {/* Quick Toggles */}
          <div style={{ marginBottom: 22, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#1e1b4b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Quick Filters</div>
            {[
              { label: "Verified Only", val: verifiedOnly,    set: setVerifiedOnly    },
              { label: "Payment Plan",  val: paymentPlanOnly, set: setPaymentPlanOnly },
            ].map((item, i) => (
              <label key={i} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#475569", fontWeight: 600 }}>
                <input type="checkbox" className="chk" checked={item.val} onChange={(e) => { item.set(e.target.checked); setPage(1); }} /> {item.label}
              </label>
            ))}
          </div>

          {/* Amenities */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#1e1b4b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Amenities</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {AMENITY_LIST.map((a) => (
                <button key={a} onClick={() => { toggleAmenity(a); setPage(1); }} className={`pill${amenityFilters.includes(a) ? " on" : ""}`}>{a}</button>
              ))}
            </div>
          </div>
        </div>

        {/* ── LISTINGS ── */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}>
                Home / UAE / {emirateLabel}{areaLabel ? ` / ${areaLabel}` : ""}
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#1e1b4b", letterSpacing: "-0.5px" }}>
                {sorted.length} Properties for Sale
              </div>
            </div>
            <select className="fselect" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
              <option>Recommended</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>

          {paginated.length === 0 ? (
            <div style={{ background: "white", borderRadius: 20, padding: "80px 20px", textAlign: "center", color: "#94a3b8", border: "1.5px dashed #e2e8f0" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⊘</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#1e1b4b", marginBottom: 8 }}>No properties match your filters</div>
              <div style={{ fontSize: 14 }}>Try adjusting your budget or filter criteria.</div>
            </div>
          ) : (
            paginated.map((l) => (
              <ListingCard key={l._id} listing={l} saved={savedIds.includes(l._id)} onSave={toggleSave} />
            ))
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  style={{ width: 36, height: 36, borderRadius: 8, border: "1.5px solid " + (page === p ? "#6d28d9" : "#e2e8f0"), background: page === p ? "#6d28d9" : "white", color: page === p ? "white" : "#475569", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Saved */}
          <div style={{ background: savedIds.length ? "#f5f3ff" : "white", border: `1.5px solid ${savedIds.length ? "#c4b5fd" : "#f0f0f0"}`, borderRadius: 16, padding: "18px 20px", transition: "all 0.3s" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#1e1b4b", marginBottom: 6 }}>♥ Saved Properties</div>
            {savedIds.length === 0 ? (
              <div style={{ fontSize: 13, color: "#94a3b8" }}>Click the heart to shortlist properties.</div>
            ) : (
              <div style={{ fontSize: 28, fontWeight: 900, color: "#6d28d9" }}>
                {savedIds.length} <span style={{ fontSize: 14, color: "#64748b", fontWeight: 600 }}>shortlisted</span>
              </div>
            )}
          </div>

          {/* DLD Transfer CTA */}
          <div style={{ background: "linear-gradient(145deg, #1e1b4b 0%, #4c1d95 100%)", borderRadius: 16, padding: "22px 20px", color: "white", textAlign: "center", boxShadow: "0 8px 28px rgba(109,40,217,0.22)" }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>🏛</div>
            <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 6 }}>DLD Transfer</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginBottom: 18, lineHeight: 1.6 }}>Dubai Land Department approved. Fast title deed transfer.</div>
            <button style={{ width: "100%", background: "white", color: "#6d28d9", border: "none", borderRadius: 10, padding: 11, fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
              Get Transfer Help
            </button>
          </div>

          {/* Mortgage Calculator CTA */}
          <div style={{ background: "white", border: "1.5px solid #e9d5ff", borderRadius: 16, padding: "20px", textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🏦</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#1e1b4b", marginBottom: 8 }}>Mortgage Calculator</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>Find out your monthly payments &amp; eligibility in seconds.</div>
            <button onClick={() => navigate("/mortgage-calculator")}
              style={{ width: "100%", background: "#6d28d9", color: "white", border: "none", borderRadius: 10, padding: "11px", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
              Calculate Now
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}