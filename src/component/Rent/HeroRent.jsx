import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiCheck, FiMapPin, FiChevronDown, FiZap, FiUsers } from "react-icons/fi";
import { MdOutlineElectricBolt } from "react-icons/md";
import { BiFridge } from "react-icons/bi";
import { TbTrees, TbSwimming, TbBarbell, TbParking, TbMountain } from "react-icons/tb";
import { RiHome4Line, RiGovernmentLine } from "react-icons/ri";
import { PiBuildingsBold, PiStar } from "react-icons/pi";



useEffect(() => {
  if (!location.state) {
    navigate("/");
  }
}, []);

const EMIRATES = ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "RAK", "Fujairah", "UAQ"];
const POPULAR_AREAS = {
  Dubai: ["Dubai Marina", "Downtown Dubai", "JBR", "Palm Jumeirah", "Business Bay", "DIFC", "JVC", "Al Barsha"],
  "Abu Dhabi": ["Corniche", "Al Reem Island", "Yas Island", "Saadiyat Island"],
  Sharjah: ["Al Nahda", "Al Majaz", "Al Taawun"],
};
const BEDROOMS = ["Studio", "1 BR", "2 BR", "3 BR", "4 BR", "5+ BR"];
const PROPERTY_TYPES = ["Apartment", "Villa", "Penthouse", "Townhouse"];
const BUDGET_RANGES = ["Any Budget", "Below AED 3,000/mo", "AED 3,000 – 6,000/mo", "AED 6,000 – 10,000/mo", "AED 10,000 – 20,000/mo", "Above AED 20,000/mo"];
const RENT_FREQUENCY = ["Monthly", "Quarterly", "Bi-Annual", "Annual"];
const FURNISHING_OPTS = ["Any", "Furnished", "Semi Furnished", "Unfurnished"];

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

export default function HeroRent() {
  const navigate = useNavigate();
  
  const [emirate, setEmirate] = useState("Dubai")
  const [tags, setTags] = useState([]);
  const [locVal, setLocVal] = useState("");
  const [showSugg, setShowSugg] = useState(false);
  const [activeType, setActiveType] = useState("");
  const [beds, setBeds] = useState("Any");
  const [budget, setBudget] = useState("Any Budget");
  const [frequency, setFrequency] = useState("Monthly");
  const [furnishing, setFurnishing] = useState("Any");
  const [chips, setChips] = useState([]);
  const [searching, setSearching] = useState(false);

  const suggestions = (POPULAR_AREAS[emirate] || []).filter(a =>
    a.toLowerCase().includes(locVal.toLowerCase()) && !tags.includes(a)
  );

  const addTag = (name) => {
    if (tags.length >= 3 || tags.includes(name)) return;
    setTags([...tags, name]);
    setLocVal(""); setShowSugg(false);
  };
  const removeTag = (name) => setTags(tags.filter(t => t !== name));
  const toggleChip = (c) => setChips(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

const handleSearch = () => {
  // ❌ only location based block
  if (tags.length === 0 && !emirate) {
    alert("Please select location first");
    return;
  }

  navigate("/results", {
    state: {
      emirate,
      tags,
      activeType,
      beds,
      budget,
      frequency,
      furnishing,
      amenities: chips
    }
  });
};

  return (
    <div style={{ background: "linear-gradient(160deg, #0f0c29 0%, #1c77c7 58%, #e8f4fd 100%)", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "52px 32px 0", display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 56, alignItems: "start" }}>

        {/* LEFT HERO COPY */}
        <div style={{ paddingBottom: 60 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 999, padding: "6px 16px", marginBottom: 24 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#a78bfa" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: "0.2em", textTransform: "uppercase" }}>Zero Brokerage · UAE</span>
          </div>

          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 62, fontWeight: 800, color: "white", lineHeight: 1.1, marginBottom: 20 }}>
            Find Your<br />
            <span style={{ color: "#c084fc" }}>Perfect</span> Home<br />
            in the UAE
          </h1>

          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: 36, maxWidth: 380 }}>
            Premium rentals across Dubai, Abu Dhabi &amp; beyond.<br />
            No brokerage. Direct owner connect. Ejari-ready.
          </p>

          <div style={{ display: "flex", gap: 32, alignItems: "center", marginBottom: 40 }}>
            {[["12,400+", "Listings"], ["0%", "Brokerage"], ["98K+", "Tenants"]].map(([n, l], i) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 32 }}>
                <div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, color: "#c084fc" }}>{n}</div>
                  <div style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(192,132,252,0.6)", marginTop: 4 }}>{l}</div>
                </div>
                {i < 2 && <div style={{ width: 1, height: 44, background: "rgba(255,255,255,0.15)" }} />}
              </div>
            ))}
          </div>

          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 14, padding: "12px 20px" }}>
            <RiGovernmentLine size={24} color="#a78bfa" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.95)" }}>Ejari &amp; RERA Compliant</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>All listings follow Dubai Land Department guidelines</div>
            </div>
          </div>
        </div>

        {/* RIGHT SEARCH PANEL - IMPROVED DESIGN */}
        <div style={{ background: "white", borderRadius: "24px 24px 0 0", padding: "36px", boxShadow: "0 32px 100px rgba(15,12,41,0.4)", height:"91vh" }}>
          
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: "#1e1b4b", lineHeight: 1.3, marginBottom: 8, letterSpacing: "-0.5px" }}>
              Search <span style={{ borderBottom: "4px solid #c084fc", paddingBottom: 2, color: "#7c3aed" }}>Properties</span>
            </h2>
            <p style={{ fontSize: 14, color: "#64748b", fontWeight: 500 }}>Verified homes · Zero brokerage · Immediate move-in</p>
          </div>

{/* 🔥 PERFECTED SEARCH INPUT BAR 🔥 */}
          <div className="msrow" style={{ 
            display: "flex", 
            alignItems: "center", 
            border: "2px solid #e9d5ff", 
            borderRadius: "20px", 
            overflow: "visible", 
            marginBottom: 24, 
            background: "white", 
            transition: "all 0.2s", 
            position: "relative", 
            padding: "3px", // Andar gap diya hai taaki button 'nested' lage
            boxShadow: "0 8px 24px rgba(92,3,156,0.06)" 
          }}>
            
            {/* Emirate Dropdown */}
            <div style={{ borderRight: "2px solid #f5edff", paddingRight: "8px", display: "flex", alignItems: "center" }}>
              <select
                value={emirate}
                onChange={e => { setEmirate(e.target.value); setTags([]); }}
                style={{ border: "none", outline: "none", background: "transparent", padding: "12px 24px 12px 16px", fontSize: 15, fontWeight: 700, color: "#334155", minWidth: 110, cursor: "pointer", fontFamily: "inherit" }}
              >
                {EMIRATES.map(em => <option key={em}>{em}</option>)}
              </select>
            </div>

            {/* Input Area & Tags */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", flexWrap: "wrap", minHeight: 48 }}>
              {tags.map(tag => (
                <div key={tag} style={{ display: "flex", alignItems: "center", gap: 6, background: "#ede9fe", color: "#5c039c", fontSize: 13, fontWeight: 700, padding: "6px 14px", borderRadius: "20px", flexShrink: 0 }}>
                  {tag}
                  <span onClick={() => removeTag(tag)} style={{ cursor: "pointer", color: "#9b5cf6", fontSize: 16, lineHeight: 1 }}>×</span>
                </div>
              ))}
              <input
                value={locVal}
                onChange={e => { setLocVal(e.target.value); setShowSugg(true); }}
                onFocus={() => setShowSugg(true)}
                onBlur={() => setTimeout(() => setShowSugg(false), 180)}
                placeholder={tags.length === 0 ? "Enter area, building, or landmark..." : tags.length < 3 ? "Add another area..." : ""}
                style={{ flex: 1, border: "none", outline: "none", background: "transparent", padding: "8px 4px", fontSize: 15, color: "#334155", minWidth: 150, fontFamily: "inherit" }}
              />
            </div>

            {/* Perfected Search Button (Nested & Shadowed) */}
            <button
              onClick={handleSearch}
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 8, 
                padding: "14px 32px", 
                background: searching ? "#3b0275" : "#5c039c", 
                color: "white", 
                border: "none", 
                fontSize: 15, 
                fontWeight: 700, 
                cursor: "pointer", 
                flexShrink: 0, 
                transition: "all 0.2s", 
                fontFamily: "inherit", 
                borderRadius: "14px", // Full rounded corners
                boxShadow: "0 6px 16px rgba(92,3,156,0.25)" // Premium Purple Glow
              }}
            >
              {searching ? <><FiCheck size={18} /> Searching…</> : <><FiSearch size={18} /> Search</>}
            </button>

            {/* Suggestions Dropdown */}
            {showSugg && suggestions.length > 0 && (
              <div style={{ position: "absolute", top: "calc(100% + 12px)", left: 0, right: 0, background: "white", border: "2px solid #e9d5ff", borderRadius: 16, zIndex: 200, boxShadow: "0 12px 40px rgba(92,3,156,0.15)", overflow: "hidden" }}>
                {suggestions.slice(0, 6).map(s => (
                  <div key={s} className="sugg-item" onMouseDown={() => addTag(s)} style={{ padding: "14px 20px", fontSize: 14, color: "#334155", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #f5edff" }}>
                    <FiMapPin size={16} color="#a855f7" /> {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Property Types */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Property Type</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {PROPERTY_TYPES.slice(0, 4).map(t => (
                <button key={t} onClick={() => setActiveType(t)} className={`type-btn ${activeType === t ? "type-active" : ""}`}
                  style={{ padding: "8px 16px", border: "2px solid #e9d5ff", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#64748b", background: "white", fontFamily: "inherit" }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Dropdown Filters */}
          <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            <select value={beds} onChange={e => setBeds(e.target.value)} style={{ flex: 1, border: "2px solid #e9d5ff", borderRadius: 10, padding: "12px 14px", fontSize: 14, fontWeight: 700, color: "#5c039c", background: "white", outline: "none", cursor: "pointer", fontFamily: "inherit" }}>
              <option value="Any">Any Beds</option>
              {BEDROOMS.map(b => <option key={b}>{b}</option>)}
            </select>
            <select value={budget} onChange={e => setBudget(e.target.value)} style={{ flex: 1, border: "2px solid #e9d5ff", borderRadius: 10, padding: "12px 14px", fontSize: 14, fontWeight: 700, color: "#5c039c", background: "white", outline: "none", cursor: "pointer", fontFamily: "inherit" }}>
              {BUDGET_RANGES.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
          
          {/* AMENITY CHIPS */}
          <div style={{ paddingTop: 18, borderTop: "2px solid #f5f3ff", marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Must-have Amenities</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {AMENITY_CHIPS_DATA.map(({ label, Icon }) => (
                <button key={label} onClick={() => toggleChip(label)} className={`chip-btn ${chips.includes(label) ? "chip-active" : ""}`}
                  style={{ padding: "8px 14px", borderRadius: 20, border: `2px solid ${chips.includes(label) ? "#5c039c" : "#e9d5ff"}`, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, background: chips.includes(label) ? "#5c039c" : "white", color: chips.includes(label) ? "white" : "#9b5cf6", fontFamily: "inherit" }}>
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* POPULAR AREAS */}
          <div style={{ paddingTop: 18, borderTop: "2px solid #f5f3ff" }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#64748b", marginRight: 10 }}>Popular Localities:</span>
            {(POPULAR_AREAS[emirate] || []).slice(0, 4).map(area => (
              <button key={area} onClick={() => addTag(area)} style={{ background: "none", border: "none", color: "#7c3aed", fontSize: 13, fontWeight: 700, cursor: "pointer", marginRight: 14, padding: 0, fontFamily: "inherit", textDecoration: "underline", textDecorationColor: "#e9d5ff" }}>
                {area}
              </button>
            ))}
          </div>
          
        </div>
      </div>
    </div>
  );
}