import { useState } from "react";

const SAMPLE_LISTINGS = [
  {
    id: 1,
    title: "Luxury 2 BHK Apartment in Dubai Marina",
    location: "Marina Walk, near Dubai Marina Mall",
    price: 8500,
    deposit: 25500,
    size: 1150,
    type: "Apartment",
    bhk: "2 BHK",
    furnishing: "Fully Furnished",
    tenants: "Family / Singles",
    available: "Immediate",
    tags: ["Pool", "Gym", "Parking", "Sea View"],
    images: 6,
    verified: true,
    badge: "Zero Brokerage",
    imgColor: "#c9e6f7",
    emoji: "🏙️",
  },
  {
    id: 2,
    title: "Spacious 1 BHK in JBR Beach Residence",
    location: "Jumeirah Beach Residence, Tower 4",
    price: 6200,
    deposit: 18600,
    size: 780,
    type: "Apartment",
    bhk: "1 BHK",
    furnishing: "Semi Furnished",
    tenants: "Family",
    available: "15-May-2026",
    tags: ["Balcony", "Parking", "DEWA Included"],
    images: 4,
    verified: true,
    badge: "Owner Direct",
    imgColor: "#d8f0e5",
    emoji: "🌊",
  },
  {
    id: 3,
    title: "Premium Studio in Downtown Dubai",
    location: "Burj Khalifa District, near Dubai Mall",
    price: 5800,
    deposit: 17400,
    size: 520,
    type: "Studio",
    bhk: "Studio",
    furnishing: "Fully Furnished",
    tenants: "Singles / Couples",
    available: "Immediate",
    tags: ["Gym", "Pool", "Parking"],
    images: 8,
    verified: false,
    badge: null,
    imgColor: "#ede8fb",
    emoji: "🌆",
  },
  {
    id: 4,
    title: "3 BHK Villa in Palm Jumeirah",
    location: "Frond K, Palm Jumeirah",
    price: 22000,
    deposit: 66000,
    size: 3200,
    type: "Villa",
    bhk: "3 BHK",
    furnishing: "Furnished",
    tenants: "Family",
    available: "01-Jun-2026",
    tags: ["Sea View", "Pool", "Parking", "Balcony"],
    images: 12,
    verified: true,
    badge: "Zero Brokerage",
    imgColor: "#fce8e0",
    emoji: "🌴",
  },
  {
    id: 5,
    title: "1 BHK in Business Bay Tower",
    location: "Executive Bay, Business Bay",
    price: 5200,
    deposit: 15600,
    size: 680,
    type: "Apartment",
    bhk: "1 BHK",
    furnishing: "Semi Furnished",
    tenants: "Family / Singles",
    available: "Immediate",
    tags: ["Gym", "Parking"],
    images: 5,
    verified: true,
    badge: "Owner Direct",
    imgColor: "#fef3c7",
    emoji: "🏢",
  },
];

const SORT_OPTIONS = ["Relevance", "Price: Low to High", "Price: High to Low", "Newest First"];
const TAG_COLORS = {
  "Pool": "#e0f2fe",
  "Gym": "#dcfce7",
  "Parking": "#f3e8ff",
  "Sea View": "#dbeafe",
  "Balcony": "#fef3c7",
  "DEWA Included": "#d1fae5",
  "Furnished": "#ede9fe",
  "Semi Furnished": "#fce7f3",
};

function HeartIcon({ filled }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "#ef4444" : "none"} stroke={filled ? "#ef4444" : "#9ca3af"} strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  );
}

function VerifiedIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="#10b981" stroke="none">
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
    </svg>
  );
}

function ListingCard({ listing, onSave, saved }) {
  const [contacted, setContacted] = useState(false);

  return (
    <div style={{
      background: "white",
      border: "1px solid #f0ebff",
      borderRadius: "16px",
      overflow: "hidden",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      transition: "box-shadow 0.2s, transform 0.2s",
      cursor: "default",
    }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 32px rgba(92,3,156,0.10)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ display: "flex", gap: 0 }}>
        {/* IMAGE */}
        <div style={{
          width: 200,
          minHeight: 180,
          background: listing.imgColor,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          fontSize: 56,
        }}>
          {listing.emoji}
          <div style={{
            position: "absolute",
            bottom: 8,
            left: 8,
            background: "rgba(0,0,0,0.5)",
            color: "white",
            fontSize: 10,
            fontWeight: 600,
            borderRadius: 6,
            padding: "2px 7px",
          }}>
            {listing.images} Photos
          </div>
          {listing.badge && (
            <div style={{
              position: "absolute",
              top: 10,
              left: 10,
              background: listing.badge === "Zero Brokerage" ? "#5c039c" : "#0f766e",
              color: "white",
              fontSize: 9,
              fontWeight: 700,
              borderRadius: 6,
              padding: "3px 8px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}>
              {listing.badge}
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div style={{ flex: 1, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          {/* TOP ROW */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#1e1b4b" }}>{listing.title}</span>
                {listing.verified && (
                  <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: "#10b981", fontWeight: 600 }}>
                    <VerifiedIcon /> Verified
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 4 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9b5cf6" strokeWidth="2.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                {listing.location}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button onClick={() => onSave(listing.id)} style={{
                background: "none",
                border: "1px solid #e9d5ff",
                borderRadius: 8,
                padding: "5px 8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}>
                <HeartIcon filled={saved} />
              </button>
              <button style={{
                background: "none",
                border: "1px solid #e9d5ff",
                borderRadius: 8,
                padding: "5px 8px",
                cursor: "pointer",
                color: "#7c3aed",
                display: "flex",
                alignItems: "center",
              }}>
                <ShareIcon />
              </button>
            </div>
          </div>

          {/* STATS ROW */}
          <div style={{ display: "flex", gap: 0, borderTop: "1px solid #f5f3ff", borderBottom: "1px solid #f5f3ff", padding: "10px 0" }}>
            {[
              ["AED " + listing.price.toLocaleString() + "/mo", "Rent"],
              ["AED " + listing.deposit.toLocaleString(), "Deposit"],
              [listing.size + " sqft", "Built-up"],
            ].map(([val, label], i) => (
              <div key={i} style={{ flex: 1, borderRight: i < 2 ? "1px solid #f0ebff" : "none", paddingLeft: i > 0 ? 16 : 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#3b0764" }}>{val}</div>
                <div style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 1 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* DETAILS GRID */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 24px" }}>
            {[
              ["🛋️", "Furnishing", listing.furnishing],
              ["🏠", "Type", listing.bhk + " " + listing.type],
              ["👥", "Preferred", listing.tenants],
              ["📅", "Available", listing.available],
            ].map(([icon, label, val]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: 9, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{val}</div>
                </div>
              </div>
            ))}
          </div>

          {/* TAGS + CTA */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {listing.tags.map((tag) => (
                <span key={tag} style={{
                  background: TAG_COLORS[tag] || "#f3f4f6",
                  color: "#4b5563",
                  fontSize: 10,
                  fontWeight: 600,
                  borderRadius: 6,
                  padding: "2px 8px",
                }}>
                  {tag}
                </span>
              ))}
            </div>
            <button
              onClick={() => setContacted(true)}
              style={{
                background: contacted ? "#10b981" : "#5c039c",
                color: "white",
                border: "none",
                borderRadius: 10,
                padding: "9px 20px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                flexShrink: 0,
                transition: "background 0.2s",
                letterSpacing: "0.02em",
              }}
            >
              {contacted ? "✓ Owner Contacted" : "Get Owner Details"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PropertyListings({ searchParams = { city: "Dubai", query: "Dubai Marina", type: "Apartment" } }) {
  const [sort, setSort] = useState("Relevance");
  const [savedIds, setSavedIds] = useState([]);
  const [showVerified, setShowVerified] = useState(false);
  const [maxPrice, setMaxPrice] = useState(25000);

  const toggleSave = (id) =>
    setSavedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const filtered = SAMPLE_LISTINGS
    .filter((l) => !showVerified || l.verified)
    .filter((l) => l.price <= maxPrice)
    .sort((a, b) => {
      if (sort === "Price: Low to High") return a.price - b.price;
      if (sort === "Price: High to Low") return b.price - a.price;
      return 0;
    });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .listings-wrap { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      <div className="listings-wrap" style={{ background: "#fafafa", minHeight: "100vh" }}>

        {/* SEARCH SUMMARY BAR */}
        <div style={{
          background: "white",
          borderBottom: "1px solid #f0ebff",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
        }}>
          <div>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#1e1b4b" }}>
              {filtered.length} Properties
            </span>
            <span style={{ fontSize: 13, color: "#6b7280", marginLeft: 8 }}>
              for Rent in {searchParams.city}
              {searchParams.query ? ` · ${searchParams.query}` : ""}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#5c039c", fontWeight: 600, cursor: "pointer" }}>
              <input type="checkbox" checked={showVerified} onChange={(e) => setShowVerified(e.target.checked)} />
              Verified Only
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: "#6b7280" }}>Max: AED {maxPrice.toLocaleString()}/mo</span>
              <input
                type="range"
                min={3000}
                max={25000}
                step={500}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{ width: 100 }}
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{
                border: "1.5px solid #e9d5ff",
                borderRadius: 8,
                padding: "6px 28px 6px 10px",
                fontSize: 12,
                fontWeight: 600,
                color: "#5c039c",
                background: "white",
                outline: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                appearance: "none",
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%235c039c' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 8px center",
              }}
            >
              {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>

        {/* MAIN LAYOUT */}
        <div style={{ display: "flex", maxWidth: 1200, margin: "0 auto", padding: "20px 16px", gap: 20 }}>

          {/* SIDEBAR */}
          <div style={{ width: 220, flexShrink: 0 }}>
            <div style={{
              background: "white",
              border: "1px solid #f0ebff",
              borderRadius: 14,
              padding: "18px 16px",
              position: "sticky",
              top: 16,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1e1b4b" }}>Filters</span>
                <span style={{ fontSize: 11, color: "#7c3aed", cursor: "pointer", fontWeight: 600 }}>Reset</span>
              </div>

              {[
                { label: "BHK Type", options: ["Studio", "1 BHK", "2 BHK", "3 BHK", "4+ BHK"] },
                { label: "Furnishing", options: ["Furnished", "Semi Furnished", "Unfurnished"] },
                { label: "Availability", options: ["Immediate", "Within 15 Days", "Within 30 Days"] },
                { label: "Preferred Tenants", options: ["Family", "Singles", "Bachelor Male", "Bachelor Female"] },
              ].map((section) => (
                <div key={section.label} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                    {section.label}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {section.options.map((opt) => (
                      <label key={opt} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#4b5563", cursor: "pointer" }}>
                        <input type="checkbox" style={{ accentColor: "#5c039c" }} />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                  Property Type
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {["Apartment", "Villa", "Studio", "Penthouse", "Townhouse"].map((t) => (
                    <button key={t} style={{
                      border: "1.5px solid #e9d5ff",
                      borderRadius: 7,
                      padding: "4px 8px",
                      fontSize: 10,
                      fontWeight: 600,
                      color: "#7c3aed",
                      background: "white",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <button style={{
                width: "100%",
                background: "#5c039c",
                color: "white",
                border: "none",
                borderRadius: 10,
                padding: "10px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                marginTop: 4,
              }}>
                Apply Filters
              </button>
            </div>
          </div>

          {/* LISTINGS */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
            {/* BREADCRUMB */}
            <div style={{ fontSize: 11, color: "#9ca3af" }}>
              Home &nbsp;/&nbsp; UAE &nbsp;/&nbsp; {searchParams.city} &nbsp;/&nbsp;
              <span style={{ color: "#5c039c", fontWeight: 600 }}>{searchParams.query || "All Areas"}</span>
            </div>

            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af", fontSize: 14 }}>
                No listings match your filters. Try adjusting the price range.
              </div>
            ) : (
              filtered.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  saved={savedIds.includes(listing.id)}
                  onSave={toggleSave}
                />
              ))
            )}

            {/* QUICK LINKS */}
            <div style={{
              background: "white",
              border: "1px solid #f0ebff",
              borderRadius: 14,
              padding: "16px 20px",
              marginTop: 8,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 10 }}>People also searched for</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {["Apartments in JBR", "Villas in Palm Jumeirah", "Flats in Business Bay", "Studios in Downtown", "Rooms in Deira", "Apartments in DIFC"].map((s) => (
                  <span key={s} style={{
                    background: "#f5f3ff",
                    color: "#5c039c",
                    fontSize: 11,
                    fontWeight: 600,
                    borderRadius: 7,
                    padding: "4px 10px",
                    cursor: "pointer",
                  }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}