import { useState } from "react";

const CHIPS = ["Furnished","Pet Friendly","Pool","Gym","Parking","Sea View","Balcony","DEWA Included"];
const POPULAR = ["Dubai Marina","Downtown Dubai","JBR Beach","Palm Jumeirah","Business Bay","DIFC"];
const HOUSE_TYPES = ["Villas","Apartment","PentHouse"];

export default function PropertyRent() {
  const [activeType, setActiveType] = useState("Flatmates");
  const [chips, setChips] = useState(["Furnished","Pool"," Sea View"]);
  const [tags, setTags] = useState([]);
  const [locVal, setLocVal] = useState("");
  const [searching, setSearching] = useState(false);

  const addTag = (name) => {
    if (tags.length >= 3 || tags.includes(name)) return;
    setTags([...tags, name]);
    setLocVal("");
  };
  const removeTag = (name) => setTags(tags.filter((t) => t !== name));
  const toggleChip = (c) =>
    setChips((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);

  const handleKeyDown = (e) => {
    if ((e.key === "," || e.key === ";") && locVal.trim()) {
      e.preventDefault();
      addTag(locVal.trim());
    }
  };

  const doSearch = () => {
    setSearching(true);
    setTimeout(() => setSearching(false), 1800);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
        .xoto-text-grad { background: linear-gradient(135deg,#5c039c,#9b5cf6); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .msrow:focus-within { border-color:#5c039c!important; box-shadow:0 0 0 3px rgba(92,3,156,0.1); }
        .ht-active { border-color:#5c039c!important; background:#f5edff!important; }
        .rent-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.22);
          border-radius: 999px;
          padding: 5px 14px;
          margin-bottom: 14px;
        }
        .rent-heading-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          text-align: center;
          font-weight: 800;
          letter-spacing: 0.28em;
          text-transform: uppercase;
        //   color: rgba(255,255,255,0.55);
        }
        .rent-underline {
          display: inline-block;
          border-bottom: 3px solid #c084fc;
          padding-bottom: 2px;
          color: #e9d5ff;
          font-size: 1rem ;
        }
        .pop-chip:hover { background:#f0e8ff; border-color:#9b5cf6; color:#5c039c; }
        .svc-icon { width:30px; height:30px; border-radius:9px; background:#f3ebff; display:flex; align-items:center; justify-content:center; font-size:14px; }
        select { appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%235c039c' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 10px center; padding-right:28px!important; }
      `}</style>

     

      {/* HERO */}
      <div className="font-jakarta relative overflow-hidden" style={{ background: "linear-gradient(to top, #fff, #1c77c7)" }}>
        <div className="absolute w-72 h-72 rounded-full border border-white/7 -top-16 -right-12 pointer-events-none" />
        <div className="absolute w-44 h-44 rounded-full border border-white/6 top-5 right-20 pointer-events-none" />
        <div className="absolute w-24 h-24 rounded-full bg-white/4 bottom-16 -left-8 pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-8 pt-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          {/* LEFT */}
          <div className="pb-10 lg:pb-16">
            <div className="inline-flex items-center gap-2 bg-white/12 border border-white/20 rounded-full px-4 py-1.5 mb-5">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-300" />
              <span className="text-[10px] font-medium text-white/80 tracking-[0.2em] uppercase">Zero Brokerage · UAE</span>
            </div>
            <h1 className="font-dmsans text-6xl font-extrabold text-white leading-tight mb-4">
              Find Your<br />
              <em className="not-italic text-purple-600">Perfect</em> Home<br />
              in the UAE
            </h1>
            <p className="text-sm font-light text-black/50 mb-8 leading-relaxed max-w-sm">
              Premium rental properties — no brokerage fees.<br />
              Direct owner connect. AI-powered search.
            </p>
            <div className="flex gap-6">
              {[["12,400+","Listings"],["0%","Brokerage"],["98K+","Happy Tenants"]].map(([n,l],i) => (
                <div key={l} className="flex items-center gap-6">
                  <div>
                    <div className="font-syne text-xl font-bold text-purple-700">{n}</div>
                    <div className="text-[9px] tracking-[0.18em] uppercase text-purple-600/45 mt-0.5">{l}</div>
                  </div>
                  {i < 2 && <div className="w-px h-9 bg-white/12" />}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Search Panel */}
          <div className="bg-white rounded-t-2xl pt-6 px-6 shadow-2xl shadow-purple-950/30">

            {/* RENT HEADING */}
            <div className="mb-5">
           
              <h2 className="dmsans text-4xl font-extrabold text-gray-800 leading-snug">
                Search <span className="rent-underline">Rental Properties</span>
              </h2>
              <p className="text-[11px] text-gray-400 mt-1 font-light">Explore verified homes · zero brokerage</p>
            </div>

            {/* SEARCH BAR */}
            <div
              className="msrow flex items-center border-2 border-purple-100 overflow-hidden mb-3 bg-purple-50/40 transition-all"
              style={{ borderRadius: "14px" }}
            >
              <select
                className="border-none outline-none bg-transparent py-3.5 px-4 text-sm font-medium text-gray-700 min-w-[110px] cursor-pointer"
                style={{ borderRight: "1.5px solid #e4d9f7" }}
              >
                <option>Dubai</option>
                <option>Abu Dhabi</option>
                <option>Sharjah</option>
                <option>Ajman</option>
                <option>RAK</option>
              </select>

              <div className="flex-1 flex items-center gap-2 px-4 min-w-0">
                <span style={{ fontSize: 14 }}>📍</span>
                <input
                  value={locVal}
                  onChange={(e) => setLocVal(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    tags.length === 0
                      ? "Search upto 3 localities or landmarks..."
                      : tags.length < 3
                      ? "Add more..."
                      : "Max 3 localities"
                  }
                  className="flex-1 border-none outline-none bg-transparent py-3.5 text-sm text-gray-700 min-w-0"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                />
                <div className="flex gap-1 flex-shrink-0">
                  {tags.map((tag) => (
                    <div key={tag} className="flex items-center gap-1 bg-purple-100 text-[#5c039c] text-[10px] font-semibold px-2.5 py-1 rounded-full">
                      {tag}
                      <span onClick={() => removeTag(tag)} className="cursor-pointer text-purple-400 leading-none text-xs">×</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={doSearch}
                className="flex items-center gap-2 px-6 py-3.5 text-white text-sm font-bold tracking-wide flex-shrink-0 transition-colors"
                style={{ background: searching ? "#3b0275" : "#5c039c" }}
              >
                {searching ? "✓ Searching..." : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                    </svg>
                    Search
                  </>
                )}
              </button>
            </div>

            {/* HOUSE TYPE ROW */}
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {HOUSE_TYPES.map((ht) => (
                <div
                  key={ht}
                  onClick={() => setActiveType(ht)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 border-2 rounded-lg cursor-pointer transition-all text-xs font-medium ${
                    activeType === ht
                      ? "ht-active border-[#5c039c] bg-purple-50 text-[#5c039c] font-semibold"
                      : "border-purple-100 text-gray-500 hover:border-purple-300"
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${activeType === ht ? "border-[#5c039c]" : "border-gray-300"}`}>
                    {activeType === ht && <div className="w-1.5 h-1.5 rounded-full bg-[#5c039c]" />}
                  </div>
                  {ht}
                </div>
              ))}
              <div className="w-px h-5 bg-purple-100" />
              {[
                ["Female","Male","Any"],
                ["Single Room","Double Sharing","Triple Sharing","Four Sharing"],
                ["Any Budget","Below AED 3K","AED 3K–6K","AED 6K–12K"],
              ].map((opts, i) => (
                <select
                  key={i}
                  className="border-2 border-purple-100 rounded-lg px-2.5 py-1.5 text-[11px] text-gray-600 bg-white cursor-pointer outline-none focus:border-[#5c039c]"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {opts.map((o) => <option key={o}>{o}</option>)}
                </select>
              ))}
            </div>

            {/* CHIPS */}
            <div className="flex flex-wrap gap-1.5 py-3 border-t border-purple-100 mt-2">
              {CHIPS.map((c) => (
                <button
                  key={c}
                  onClick={() => toggleChip(c)}
                  className={`px-3 py-1 rounded-full border-2 text-[10px] font-semibold tracking-wide transition-all cursor-pointer ${
                    chips.includes(c)
                      ? "bg-[#5c039c] text-white border-[#5c039c]"
                      : "border-purple-100 text-purple-400 bg-white hover:border-purple-400 hover:text-[#5c039c]"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

    

      
    </>
  );
}