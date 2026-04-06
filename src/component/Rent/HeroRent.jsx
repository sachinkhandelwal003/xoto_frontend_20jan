import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiMapPin, FiZap, FiUsers } from "react-icons/fi";
import { MdOutlineElectricBolt } from "react-icons/md";
import { BiFridge } from "react-icons/bi";
import { TbTrees, TbSwimming, TbBarbell, TbParking, TbMountain } from "react-icons/tb";
import { RiHome4Line, RiGovernmentLine } from "react-icons/ri";
import { PiBuildingsBold, PiStar } from "react-icons/pi";
import { message } from "antd";

const EMIRATES = ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "RAK", "Fujairah", "UAQ"];

const POPULAR_AREAS = {
  Dubai: [
    "Dubai Marina", "Downtown Dubai", "JBR – Jumeirah Beach Residence", "Palm Jumeirah",
    "Business Bay", "DIFC – Dubai International Financial Centre", "JVC – Jumeirah Village Circle",
    "Al Barsha", "Deira", "Bur Dubai", "Jumeirah", "Al Quoz", "Al Nahda (Dubai)",
    "Mirdif", "Silicon Oasis", "Sports City", "Motor City", "Al Furjan",
    "Discovery Gardens", "International City", "The Greens", "The Views",
    "Emirates Hills", "Arabian Ranches", "Mudon", "Damac Hills", "Town Square",
    "Al Warqa", "Oud Metha", "Karama", "Satwa", "Al Mankhool", "Rashidiya",
    "Al Garhoud", "Festival City", "Creek Harbour", "Dubai Hills Estate",
    "Bluewaters Island", "Port De La Mer", "La Mer", "Madinat Jumeirah Living",
    "Sobha Hartland", "Mohammed Bin Rashid City", "Tilal Al Ghaf", "The Sustainable City",
  ],
  "Abu Dhabi": [
    "Corniche Road", "Al Reem Island", "Yas Island", "Saadiyat Island",
    "Khalifa City A", "Khalifa City B", "Al Nahyan", "Masdar City",
    "Tourist Club Area (TCA)", "Al Khalidiyah", "Al Muroor", "Al Mushrif",
    "Al Bateen", "Al Manhal", "Al Karamah", "Al Shamkhah", "Mohamed Bin Zayed City",
    "Mussafah", "Al Reef", "Al Ghadeer", "Hydra Village", "Al Samha",
    "Shakhbout City", "Zayed City", "Al Raha Beach", "Al Raha Gardens",
  ],
  Sharjah: [
    "Al Nahda (Sharjah)", "Al Majaz", "Al Taawun", "Al Qasimia",
    "Muwaileh Commercial", "Al Khan", "Al Mamzar (Sharjah Side)",
    "Al Wahda", "Al Yarmook", "Abu Shagara", "Al Butina",
  ],
  Ajman: [
    "Al Nuaimiya 1", "Al Nuaimiya 2", "Al Rashidiya 1", "Emirates City",
    "Al Rawda 1", "Garden City", "Al Rumaila", "Ajman Downtown",
  ],
  RAK: [
    "Al Nakheel", "Al Hamra Village", "Mina Al Arab", "Al Dhait South",
    "Al Mamourah", "Al Uraibi", "RAK City Centre Area",
  ],
  Fujairah: [
    "Fujairah City Centre", "Merashid", "Dibba Al Fujairah",
    "Khor Fakkan", "Kalba", "Al Faseel",
  ],
  UAQ: [
    "UAQ City Centre", "Al Salama", "Al Hayl", "Al Dour",
  ],
};

const BEDROOMS = ["Studio", "1 BR", "2 BR", "3 BR", "4 BR", "5+ BR"];
const PROPERTY_TYPES = ["Apartment", "Villa", "Penthouse", "Townhouse"];
const BUDGET_RANGES = [
  "Any Budget", "Below AED 3,000/mo", "AED 3,000 – 6,000/mo",
  "AED 6,000 – 10,000/mo", "AED 10,000 – 20,000/mo", "Above AED 20,000/mo",
];

const AMENITY_CHIPS_DATA = [
  { label: "Chiller Free",   Icon: FiZap },
  { label: "DEWA Included",  Icon: MdOutlineElectricBolt },
  { label: "Furnished",      Icon: BiFridge },
  { label: "Pet Friendly",   Icon: TbTrees },
  { label: "Pool",           Icon: TbSwimming },
  { label: "Gym",            Icon: TbBarbell },
  { label: "Parking",        Icon: TbParking },
  { label: "Sea View",       Icon: TbMountain },
  { label: "Balcony",        Icon: RiHome4Line },
  { label: "Maid's Room",    Icon: FiUsers },
  { label: "Near Metro",     Icon: PiBuildingsBold },
  { label: "Kids Play Area", Icon: PiStar },
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&family=DM+Sans:wght@400;500;600;700&display=swap');

  .hero-rent-root {
    background: linear-gradient(160deg, #0f0c29 0%, #1c77c7 58%, #e8f4fd 100%);
    font-family: 'DM Sans', sans-serif;
  }

  .hero-rent-grid {
    max-width: 1200px;
    margin: 0 auto;
    padding: 52px 32px 80px;
    display: grid;
    grid-template-columns: 1fr 1.1fr;
    gap: 56px;
    align-items: start;
  }

.hero-rent-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 70px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -1px;
  color: white;
}

  .hero-rent-card {
    background: white;
    border-radius: 24px;
    padding: 28px;
    box-shadow: 0 32px 100px rgba(15,12,41,0.4);
    width: 100%;
    box-sizing: border-box;
  }

  .hero-rent-searchbar {
    display: flex;
    align-items: flex-start;
    border: 2px solid #e9d5ff;
    border-radius: 16px;
    background: white;
    box-shadow: 0 4px 16px rgba(92,3,156,0.06);
    padding: 4px;
    gap: 4px;
    flex-wrap: wrap;
    position: relative;
    margin-bottom: 20px;
  }

  .hero-rent-emirate-select {
    border: none;
    border-right: 2px solid #f5edff;
    outline: none;
    background: transparent;
    padding: 10px 12px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
    flex-shrink: 0;
    align-self: flex-start;
    margin-top: 2px;
  }

  .hero-rent-beds-budget {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .hero-rent-beds-budget select {
    flex: 1;
    min-width: 120px;
  }

  /* ── TABLET ── */
  @media (max-width: 900px) {
    .hero-rent-grid {
      grid-template-columns: 1fr;
      padding: 40px 24px 60px;
      gap: 36px;
    }
    .hero-rent-title {
      font-size: 46px;
    }
    .hero-rent-hero-left {
      padding-bottom: 0 !important;
    }
  }

  /* ── MOBILE ── */
  @media (max-width: 600px) {
    .hero-rent-grid {
      padding: 28px 16px 48px;
      gap: 28px;
    }
    .hero-rent-title {
      font-size: 34px;
      margin-bottom: 14px;
    }
    .hero-rent-card {
      padding: 18px 16px;
      border-radius: 18px;
    }
    .hero-rent-card h2 {
      font-size: 20px !important;
    }
    .hero-rent-emirate-select {
      font-size: 12px;
      padding: 8px 8px;
    }
    .hero-rent-searchbtn {
      padding: 8px 14px !important;
      font-size: 13px !important;
    }
    .hero-rent-beds-budget {
      flex-direction: column;
    }
    .hero-rent-beds-budget select {
      min-width: unset;
      width: 100%;
    }
    .hero-rent-badge {
      padding: 10px 14px !important;
    }
    .hero-rent-badge-title {
      font-size: 12px !important;
    }
    .hero-rent-badge-sub {
      font-size: 11px !important;
    }
  }
`;

export default function HeroRent() {
  const navigate = useNavigate();

  const [emirate, setEmirate] = useState("");
  const [tags, setTags] = useState([]);
  const [locVal, setLocVal] = useState("");
  const [showSugg, setShowSugg] = useState(false);
  const [activeType, setActiveType] = useState("");
  const [beds, setBeds] = useState("Any");
  const [budget, setBudget] = useState("Any Budget");
  const [chips, setChips] = useState([]);

  const suggestions = emirate
    ? (POPULAR_AREAS[emirate] || []).filter(
        (a) => a.toLowerCase().includes(locVal.toLowerCase()) && !tags.includes(a)
      )
    : [];

  const addTag = (name) => {
    if (tags.includes(name)) return;
    setTags([...tags, name]);
    setLocVal("");
    setShowSugg(false);
  };
  const removeTag = (name) => setTags(tags.filter((t) => t !== name));
  const toggleChip = (c) =>
    setChips((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const handleSearch = () => {
    let finalTags = [...tags];
    if (locVal.trim()) finalTags.push(locVal.trim());
    if (!emirate) { message.warning("Please select an emirate first"); return; }
    if (finalTags.length === 0) { message.warning("Please enter or select a location"); return; }
    navigate("/results", {
      state: { emirate, tags: finalTags, activeType, beds, budget, amenities: chips },
    });
  };

  return (
    <>
      <style>{styles}</style>
      <div className="hero-rent-root">
        <div className="hero-rent-grid">

          {/* ── LEFT HERO ── */}
          <div className="hero-rent-hero-left" style={{ paddingBottom: 60 }}>
            <h1 className="hero-rent-title">
              Find Your<br />
              <span style={{ color: "#c084fc" }}>Perfect</span> Home<br />
              in the UAE
            </h1>

            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: 36, maxWidth: 380 }}>
              Premium rentals across Dubai, Abu Dhabi &amp; beyond.<br />
              Direct owner connect. Ejari-ready.
            </p>

            <div
              className="hero-rent-badge"
              style={{
                display: "inline-flex", alignItems: "center", gap: 12,
                background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 14, padding: "12px 20px",
              }}
            >
              <RiGovernmentLine size={24} color="#a78bfa" style={{ flexShrink: 0 }} />
              <div>
                <div className="hero-rent-badge-title" style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.95)" }}>
                  Ejari &amp; RERA Compliant
                </div>
                <div className="hero-rent-badge-sub" style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                  All listings follow Dubai Land Department guidelines
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT SEARCH CARD ── */}
          <div className="hero-rent-card">
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: "#1e1b4b", lineHeight: 1.3, marginBottom: 6, letterSpacing: "-0.5px" }}>
                Search <span style={{ borderBottom: "4px solid #c084fc", paddingBottom: 2, color: "#7c3aed" }}>Properties</span>
              </h2>
              <p style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>Verified homes · Immediate move-in</p>
            </div>

            {/* Search Bar */}
            <div style={{ position: "relative", marginBottom: 20 }}>
              <div className="hero-rent-searchbar">
                <select
                  value={emirate}
                  onChange={(e) => { setEmirate(e.target.value); setTags([]); setLocVal(""); }}
                  className="hero-rent-emirate-select"
                  style={{ color: emirate ? "#334155" : "#94a3b8" }}
                >
                  <option value="" disabled>Select Emirate</option>
                  {EMIRATES.map((em) => <option key={em} value={em}>{em}</option>)}
                </select>

                <div style={{
                  flex: 1, display: "flex", flexWrap: "wrap",
                  alignItems: "center", gap: 6,
                  padding: "6px 8px", minWidth: 0, minHeight: 40,
                }}>
                  {tags.map((tag) => (
                    <div key={tag} style={{
                      display: "flex", alignItems: "center", gap: 5,
                      background: "#ede9fe", color: "#5c039c",
                      fontSize: 12, fontWeight: 700,
                      padding: "4px 10px", borderRadius: 20, flexShrink: 0,
                    }}>
                      {tag}
                      <span onClick={() => removeTag(tag)} style={{ cursor: "pointer", color: "#9b5cf6", fontSize: 15, lineHeight: 1 }}>×</span>
                    </div>
                  ))}
                  <input
                    value={locVal}
                    onChange={(e) => { setLocVal(e.target.value); setShowSugg(true); }}
                    onFocus={() => setShowSugg(true)}
                    onBlur={() => setTimeout(() => setShowSugg(false), 180)}
                    placeholder={
                      !emirate ? "Select emirate first..." :
                      tags.length === 0 ? "Enter area, building, landmark..." :
                      "Add more areas..."
                    }
                    disabled={!emirate}
                    style={{
                      border: "none", outline: "none", background: "transparent",
                      padding: "4px 4px", fontSize: 14, color: "#334155",
                      minWidth: 100, flex: 1, fontFamily: "inherit",
                      cursor: !emirate ? "not-allowed" : "text",
                      opacity: !emirate ? 0.5 : 1,
                    }}
                  />
                </div>

                <button
                  onClick={handleSearch}
                  className="hero-rent-searchbtn"
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "10px 20px", background: "#5c039c", color: "white",
                    border: "none", fontSize: 14, fontWeight: 700,
                    cursor: "pointer", flexShrink: 0, borderRadius: 12,
                    boxShadow: "0 4px 12px rgba(92,3,156,0.25)",
                    fontFamily: "inherit", alignSelf: "flex-start", marginTop: 2,
                  }}
                >
                  <FiSearch size={16} /> Search
                </button>
              </div>

              {showSugg && suggestions.length > 0 && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0,
                  background: "white", border: "2px solid #e9d5ff",
                  borderRadius: 14, zIndex: 200,
                  boxShadow: "0 12px 40px rgba(92,3,156,0.15)",
                  maxHeight: 220, overflowY: "auto",
                }}>
                  {suggestions.slice(0, 8).map((s) => (
                    <div key={s} onMouseDown={() => addTag(s)} style={{
                      padding: "11px 18px", fontSize: 13, color: "#334155",
                      fontWeight: 600, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 8,
                      borderBottom: "1px solid #f5edff",
                    }}>
                      <FiMapPin size={14} color="#a855f7" /> {s}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Property Types */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                Property Type
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {PROPERTY_TYPES.map((t) => (
                  <button key={t} onClick={() => setActiveType((prev) => prev === t ? "" : t)} style={{
                    padding: "7px 16px",
                    border: `2px solid ${activeType === t ? "#5c039c" : "#e9d5ff"}`,
                    borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600,
                    color: activeType === t ? "white" : "#64748b",
                    background: activeType === t ? "#5c039c" : "white",
                    fontFamily: "inherit", transition: "all 0.15s",
                  }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Beds + Budget */}
            <div className="hero-rent-beds-budget">
              <select value={beds} onChange={(e) => setBeds(e.target.value)} style={{
                flex: 1, border: "2px solid #e9d5ff", borderRadius: 10,
                padding: "10px 12px", fontSize: 13, fontWeight: 700,
                color: "#5c039c", background: "white", outline: "none",
                cursor: "pointer", fontFamily: "inherit",
              }}>
                <option value="Any">Any Beds</option>
                {BEDROOMS.map((b) => <option key={b}>{b}</option>)}
              </select>
              <select value={budget} onChange={(e) => setBudget(e.target.value)} style={{
                flex: 1, border: "2px solid #e9d5ff", borderRadius: 10,
                padding: "10px 12px", fontSize: 13, fontWeight: 700,
                color: "#5c039c", background: "white", outline: "none",
                cursor: "pointer", fontFamily: "inherit",
              }}>
                {BUDGET_RANGES.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>

            {/* Amenity Chips */}
            <div style={{ paddingTop: 16, borderTop: "2px solid #f5f3ff", marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                Must-have Amenities
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {AMENITY_CHIPS_DATA.map(({ label, Icon }) => (
                  <button key={label} onClick={() => toggleChip(label)} style={{
                    padding: "6px 12px", borderRadius: 20,
                    border: `2px solid ${chips.includes(label) ? "#5c039c" : "#e9d5ff"}`,
                    fontSize: 11, fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 5,
                    background: chips.includes(label) ? "#5c039c" : "white",
                    color: chips.includes(label) ? "white" : "#9b5cf6",
                    fontFamily: "inherit", transition: "all 0.15s",
                  }}>
                    <Icon size={12} /> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Areas */}
            {emirate && (
              <div style={{ paddingTop: 14, borderTop: "2px solid #f5f3ff" }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", marginRight: 8 }}>
                  Popular in {emirate}:
                </span>
                {(POPULAR_AREAS[emirate] || []).slice(0, 4).map((area) => (
                  <button key={area} onClick={() => addTag(area)} style={{
                    background: "none", border: "none", color: "#7c3aed",
                    fontSize: 12, fontWeight: 700, cursor: "pointer",
                    marginRight: 10, padding: 0, fontFamily: "inherit",
                    textDecoration: "underline", textDecorationColor: "#e9d5ff",
                  }}>
                    {area}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}