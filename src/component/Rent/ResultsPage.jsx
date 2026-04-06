import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { message, notification, Spin } from "antd";
import { apiService } from "../../manageApi/utils/custom.apiservice";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
// import { FiMapPin, FiPhone, FiLock, FiX } from "react-icons/fi";
import {
  FiMapPin,
  FiHeart,
  FiPhone,
  FiCheck,
  FiClock,
  FiUser,
  FiFileText,
  FiHome,
  FiX
} from "react-icons/fi";

import {
  FaBath,
  FaBed,
  FaRulerCombined
} from "react-icons/fa";

const BEDROOMS    = ["Any", "Studio", "1 BR", "2 BR", "3 BR", "4 BR", "5+ BR"];
const PROP_TYPES  = ["All", "Apartment", "Villa", "Penthouse", "Townhouse", "Studio"];
const AMENITY_LIST = ["Pool", "Gym", "Parking", "Sea View", "Balcony", "Chiller Free", "WiFi", "Near Metro"];

// ─── LIGHTBOX ─────────────────────────────────────────────────────────────────
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
    <div onClick={onClose} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,flexDirection:"column",gap:16 }}>
      <button onClick={onClose} style={{ position:"absolute",top:20,right:24,background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:8,color:"white",width:40,height:40,cursor:"pointer",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center" }}><FiX size={16} /></button>
      <div style={{ color:"rgba(255,255,255,0.6)",fontSize:13,fontWeight:600 }}>{current+1} / {images.length}</div>
      <div onClick={(e)=>e.stopPropagation()} style={{ display:"flex",alignItems:"center",gap:16 }}>
        <button onClick={()=>setCurrent((c)=>(c-1+images.length)%images.length)} style={{ background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:10,color:"white",width:48,height:48,cursor:"pointer",fontSize:22,display:"flex",alignItems:"center",justifyContent:"center" }}>‹</button>
        <img src={images[current]} alt="" style={{ maxWidth:"min(860px,80vw)",maxHeight:"70vh",borderRadius:16,objectFit:"cover" }} />
        <button onClick={()=>setCurrent((c)=>(c+1)%images.length)} style={{ background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:10,color:"white",width:48,height:48,cursor:"pointer",fontSize:22,display:"flex",alignItems:"center",justifyContent:"center" }}>›</button>
      </div>
      <div style={{ display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center",maxWidth:700,padding:"0 16px" }}>
        {images.map((img,i)=>(
          <img key={i} src={img} alt="" onClick={(e)=>{e.stopPropagation();setCurrent(i);}} style={{ width:64,height:48,objectFit:"cover",borderRadius:8,cursor:"pointer",opacity:i===current?1:0.45,border:i===current?"2px solid #a78bfa":"2px solid transparent" }} />
        ))}
      </div>
    </div>
  );
}

// ─── IMAGE GRID ───────────────────────────────────────────────────────────────
function ImageGrid({ images, onOpen }) {
  const imgs = images?.length ? images : ["https://placehold.co/600x400/ede9fe/7c3aed?text=No+Image"];
  return (
    <div style={{ position:"relative",borderRadius:16,overflow:"hidden",cursor:"pointer" }}>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gridTemplateRows:"160px 100px",gap:3 }}>
        <div style={{ gridRow:"1 / 3",overflow:"hidden" }} onClick={()=>onOpen(0)}>
          <img src={imgs[0]} alt="" style={{ width:"100%",height:"100%",objectFit:"cover",transition:"transform 0.3s" }} onMouseEnter={(e)=>(e.target.style.transform="scale(1.04)")} onMouseLeave={(e)=>(e.target.style.transform="scale(1)")} />
        </div>
        <div style={{ overflow:"hidden" }} onClick={()=>onOpen(1)}>
          <img src={imgs[1]||imgs[0]} alt="" style={{ width:"100%",height:"100%",objectFit:"cover",transition:"transform 0.3s" }} onMouseEnter={(e)=>(e.target.style.transform="scale(1.04)")} onMouseLeave={(e)=>(e.target.style.transform="scale(1)")} />
        </div>
        <div style={{ overflow:"hidden",position:"relative" }} onClick={()=>onOpen(2)}>
          <img src={imgs[2]||imgs[0]} alt="" style={{ width:"100%",height:"100%",objectFit:"cover",transition:"transform 0.3s" }} onMouseEnter={(e)=>(e.target.style.transform="scale(1.04)")} onMouseLeave={(e)=>(e.target.style.transform="scale(1)")} />
          {imgs.length>3 && <div style={{ position:"absolute",inset:0,background:"rgba(0,0,0,0.52)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:14,fontWeight:700 }}>+{imgs.length-3} photos</div>}
        </div>
      </div>
    </div>
  );
}

// ─── LEAD MODAL ───────────────────────────────────────────────────────────────
function LeadModal({ property, onClose, onSubmit, submitting }) {
  useEffect(() => {
  document.body.style.overflow = "hidden";

  return () => {
    document.body.style.overflow = "auto";
  };
}, []);
  const [form, setForm] = useState({
  name: "",
  email: "",
  phone: "",
  countryCode: "+971",
  message: ""
});

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      message.warning("Name and phone are required");
      return;
    }
    if (!form.phone || form.phone.length < 8) {
  message.error("Enter valid phone number");
  return;
}
    onSubmit(form);
  };

  return (
    <div
      onClick={onClose}
      style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(4px)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}
    >
      <div
        onClick={(e)=>e.stopPropagation()}
        style={{ background:"white",borderRadius:24,width:"100%",maxWidth:520,boxShadow:"0 32px 80px rgba(109,40,217,0.2)",overflow:"hidden" }}
      >
        {/* Header */}
        <div style={{ background:"#5c039c",padding:"24px 28px",position:"relative" }}>
          <button onClick={onClose} style={{ position:"absolute",top:16,right:16,background:"rgba(255,255,255,0.15)",border:"none",borderRadius:8,color:"white",width:32,height:32,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center" }}><FiX size={16} /></button>
          <div style={{ fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.6)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6 }}>Show Interest</div>
          <div style={{ fontSize:20,fontWeight:900,color:"white",lineHeight:1.3 }}>{property?.title || "This Property"}</div>
          <div style={{ fontSize:13,color:"rgba(255,255,255,0.7)",marginTop:4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
  <FiMapPin size={14} />
  {property?.location?.area && `${property.location.area}, `}
  {property?.emirate}
</div>
            {property?.price && (
              <span style={{ marginLeft:12,background:"rgba(255,255,255,0.15)",padding:"2px 10px",borderRadius:20,fontWeight:700,color:"white" }}>
                AED {property.price.toLocaleString()}/yr
              </span>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding:"24px 28px" }}>
          <p style={{ fontSize:13,color:"#64748b",marginBottom:20,lineHeight:1.6 }}>
            Fill in your details and our agent will contact you shortly.
          </p>

          <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
            <div>
              <label style={{ fontSize:12,fontWeight:700,color:"#475569",display:"block",marginBottom:6 }}>Full Name *</label>
              <input
                name="name" value={form.name} onChange={handleChange} required
                placeholder="Enter your full name"
                style={{ width:"100%",padding:"11px 14px",border:"2px solid #e9d5ff",borderRadius:10,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box" }}
                onFocus={e=>e.target.style.borderColor="#6d28d9"}
                onBlur={e=>e.target.style.borderColor="#e9d5ff"}
              />
            </div>

            <div>
              <label style={{ fontSize:12,fontWeight:700,color:"#475569",display:"block",marginBottom:6 }}>Phone Number *</label>
<PhoneInput
  country={"ae"} // default UAE
  value={form.phone}
  onChange={(phone, country) => {
    setForm(prev => ({
      ...prev,
      phone,
      countryCode: "+" + country.dialCode
    }));
  }}
  inputStyle={{
    width: "100%",
    height: "44px",
    borderRadius: "10px",
    border: "2px solid #e9d5ff"
  }}
/>
            </div>

            <div>
              <label style={{ fontSize:12,fontWeight:700,color:"#475569",display:"block",marginBottom:6 }}>Email </label>
              <input
                name="email" value={form.email} onChange={handleChange} type="email"
                placeholder="your@email.com"
                style={{ width:"100%",padding:"11px 14px",border:"2px solid #e9d5ff",borderRadius:10,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box" }}
                onFocus={e=>e.target.style.borderColor="#6d28d9"}
                onBlur={e=>e.target.style.borderColor="#e9d5ff"}
              />
            </div>

            <div>
              <label style={{ fontSize:12,fontWeight:700,color:"#475569",display:"block",marginBottom:6 }}>Message</label>
              <textarea
                name="message" value={form.message} onChange={handleChange}
                placeholder="Any specific requirements or questions..."
                rows={3}
                style={{ width:"100%",padding:"11px 14px",border:"2px solid #e9d5ff",borderRadius:10,fontSize:14,outline:"none",fontFamily:"inherit",resize:"none",boxSizing:"border-box" }}
                onFocus={e=>e.target.style.borderColor="#6d28d9"}
                onBlur={e=>e.target.style.borderColor="#e9d5ff"}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{ width:"100%",marginTop:20,padding:"14px",background:"linear-gradient(135deg,#6d28d9,#4c1d95)",color:"white",border:"none",borderRadius:12,fontSize:15,fontWeight:800,cursor:submitting?"not-allowed":"pointer",opacity:submitting?0.7:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontFamily:"inherit" }}
          >
            {submitting ? (
              <><span style={{ display:"inline-block",width:18,height:18,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"white",borderRadius:"50%",animation:"spin 0.8s linear infinite" }} /> Sending...</>
            ) : (
              <><FiPhone size={16} /> Send Interest</>
            )}
          </button>

          {/* <p style={{ fontSize:11,color:"#94a3b8",textAlign:"center",marginTop:12 }}>
            🔒 Your information is safe and will only be used to contact you about this property.
          </p> */}
        </form>
      </div>
    </div>
  );
}

// ─── LISTING CARD ─────────────────────────────────────────────────────────────
function ListingCard({ listing, saved, onSave, onContact, leadCreating }) {
  const [lightboxOpen,  setLightboxOpen]  = useState(false);
  const [lightboxStart, setLightboxStart] = useState(0);
  const [hovered,       setHovered]       = useState(false);
  const [expanded,      setExpanded]      = useState(false);
  const [contacted,     setContacted]     = useState(false);

  const openLightbox = (idx) => { setLightboxStart(idx); setLightboxOpen(true); };

  const availLabel =
    listing.available ||
    (listing.isImmediate ? "Immediate" : listing.availableFrom
      ? new Date(listing.availableFrom).toLocaleDateString("en-GB") : "");

  return (
    <>
      {lightboxOpen && <Lightbox images={listing.images||[]} startIndex={lightboxStart} onClose={()=>setLightboxOpen(false)} />}
      <div
        onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
        style={{ background:"#fff",border:`1.5px solid ${hovered?"#c4b5fd":"#f0f0f0"}`,borderRadius:20,overflow:"hidden",boxShadow:hovered?"0 12px 40px rgba(109,40,217,0.1)":"0 2px 12px rgba(0,0,0,0.04)",transition:"all 0.25s ease",transform:hovered?"translateY(-3px)":"none",marginBottom:20 }}
      >
        <div style={{ display:"flex",gap:0,flexWrap:"wrap" }}>
          {/* Image */}
          <div style={{ width:320,flexShrink:0,padding:12,position:"relative" }}>
            <ImageGrid images={listing.images} onOpen={openLightbox} />
            <div style={{ position:"absolute",top:20,left:20,display:"flex",flexDirection:"column",gap:6 }}>
              {listing.verified && <div style={{ background:"#6d28d9",color:"#fff",fontSize:10,fontWeight:700,borderRadius:6,padding:"4px 10px",textTransform:"uppercase" }}><FiCheck size={10} /> Verified</div>}
              {listing.ejari && <div style={{ background:"rgba(0,0,0,0.72)",backdropFilter:"blur(6px)",color:"#fff",fontSize:10,fontWeight:700,borderRadius:6,padding:"4px 10px" }}><FiFileText size={10} /> Ejari</div>}
            </div>
            <button onClick={()=>onSave(listing._id)} style={{ position:"absolute",top:20,right:20,background:saved?"#6d28d9":"rgba(255,255,255,0.9)",border:"1.5px solid "+(saved?"#6d28d9":"rgba(0,0,0,0.1)"),borderRadius:10,width:36,height:36,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s",fontSize:16,color:saved?"#fff":"#94a3b8" }}>
              {saved ? <FiHeart fill="#fff" /> : <FiHeart />}
            </button>
          </div>

          {/* Content */}
          <div style={{ flex:1,padding:"20px 24px 16px 12px",display:"flex",flexDirection:"column",gap:12,minWidth:0 }}>
            <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8 }}>
              <div>
                <h3 style={{ fontSize:17,fontWeight:800,color:"#1e1b4b",margin:"0 0 5px",letterSpacing:"-0.3px",lineHeight:1.3 }}>{listing.title}</h3>
                <div style={{ fontSize:13,color:"#64748b",display:"flex",alignItems:"center",gap:5 }}>
                  <span style={{ color:"#a78bfa" }}><FiMapPin size={13} /></span>
                  {listing.location?.area&&`${listing.location.area}, `}{listing.emirate}
                </div>
              </div>
              <div style={{ textAlign:"right",flexShrink:0 }}>
                <div style={{ fontSize:20,fontWeight:900,color:"#6d28d9",letterSpacing:"-0.5px" }}>AED {(listing.monthly||Math.round(listing.price/12)).toLocaleString()}</div>
                <div style={{ fontSize:11,color:"#94a3b8",fontWeight:600 }}>/ month</div>
              </div>
            </div>

            <div style={{ display:"flex",gap:12,background:"#f8f4ff",borderRadius:12,padding:"10px 16px",border:"1px solid #ede9fe" }}>
              {[
  { icon: <FaRulerCombined />, label: (listing.size||"—")+" sqft" },
  { icon: <FaBed />, label: listing.bhk||"—" },
  { icon: <FaBath />, label: (listing.baths||"—")+" Bath" },
  { icon: <FiHome />, label: (listing.furnishing||"—").split(" ")[0] }
].map((s,i)=>(
                <div key={i} style={{ display:"flex",alignItems:"center",gap:6,fontSize:12,fontWeight:700,color:"#475569" }}>
                  <span>{s.icon}</span>{s.label}
                  {i<3&&<span style={{ color:"#d8b4fe",marginLeft:12 }}>·</span>}
                </div>
              ))}
            </div>

            <div style={{ display:"flex",gap:8,flexWrap:"wrap",alignItems:"center" }}>
              <span style={{ background:availLabel==="Immediate"?"#ecfdf5":"#fef3c7",color:availLabel==="Immediate"?"#059669":"#d97706",border:`1px solid ${availLabel==="Immediate"?"#a7f3d0":"#fde68a"}`,borderRadius:6,fontSize:11,fontWeight:700,padding:"3px 10px",textTransform:"uppercase" }}>
                {availLabel==="Immediate"?"<FiClock size={12} />":"◷ "+availLabel}
              </span>
              {listing.tenants&&<span style={{ background:"#f1f5f9",color:"#475569",borderRadius:6,fontSize:11,fontWeight:600,padding:"3px 10px" }}><FiUser size={12} />{listing.tenants}</span>}
            </div>

            {listing.amenities?.length>0&&(
              <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                {listing.amenities.map((a)=><span key={a} style={{ background:"#fafafa",color:"#64748b",border:"1px solid #e9e9e9",borderRadius:6,fontSize:11,fontWeight:600,padding:"3px 9px" }}>{a}</span>)}
              </div>
            )}

            <div style={{ height:1,background:"#f1f5f9" }} />

            <div style={{ display:"flex",alignItems:"center",justifyContent:"flex-end",gap:8 }}>
              <button onClick={()=>setExpanded(!expanded)} style={{ background:"#f5f3ff",color:"#6d28d9",border:"1.5px solid #ddd6fe",borderRadius:10,padding:"9px 16px",fontSize:12,fontWeight:700,cursor:"pointer" }}>
                {expanded?"▲ Less":"▼ Details"}
              </button>

              {/* ✅ Contact button — no login required */}
              <button
                onClick={()=>{ if(!contacted) onContact(listing); }}
                disabled={leadCreating===listing._id}
                style={{ background:contacted?"#f5f3ff":"#6d28d9",color:contacted?"#6d28d9":"white",border:contacted?"1.5px solid #c4b5fd":"1.5px solid transparent",borderRadius:10,padding:"9px 22px",fontSize:13,fontWeight:800,cursor:contacted?"default":"pointer",boxShadow:contacted?"none":"0 4px 14px rgba(109,40,217,0.35)",display:"flex",alignItems:"center",gap:6,transition:"all 0.2s",opacity:leadCreating===listing._id?0.7:1 }}
              >
                {leadCreating===listing._id
                  ? <><span style={{ fontSize:13 }}><FiClock size={14} /></span> Processing...</>
                  : contacted
                  ? <><span><FiCheck size={14} />✓</span> Interest Sent</>
                  : <><FiPhone size={16} /> Contact</>
                }
              </button>
            </div>

            {expanded&&(
              <div style={{ background:"#fafafa",borderRadius:12,padding:16,border:"1px solid #f0f0f0",marginTop:4 }}>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:14 }}>
                  {[{label:"Annual Rent",value:`AED ${(listing.price||0).toLocaleString()}`},{label:"Security Deposit",value:`AED ${(listing.deposit||0).toLocaleString()}`},{label:"Property Type",value:listing.type||"—"},{label:"Floor Size",value:`${listing.size||"—"} sqft`},{label:"City",value:listing.location?.city||"—"},{label:"Tenants",value:listing.tenants||"—"}].map((item,i)=>(
                    <div key={i}>
                      <div style={{ fontSize:10,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:3 }}>{item.label}</div>
                      <div style={{ fontSize:13,fontWeight:700,color:"#1e1b4b" }}>{item.value}</div>
                    </div>
                  ))}
                </div>
                <button onClick={()=>openLightbox(0)} style={{ background:"white",color:"#6d28d9",border:"1.5px solid #c4b5fd",borderRadius:8,padding:"8px 16px",fontSize:12,fontWeight:700,cursor:"pointer",width:"100%" }}>
                  ⊞ View All Photos ({(listing.images||[]).length})
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── MAIN RESULTS PAGE ────────────────────────────────────────────────────────
export default function ResultsPage() {
  const location = useLocation();
  const navigate  = useNavigate();

  const [listings,       setListings]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [total,          setTotal]          = useState(0);
  const [page,           setPage]           = useState(1);
  const LIMIT = 10;

  const [sort,           setSort]           = useState("Recommended");
  const [savedIds,       setSavedIds]       = useState([]);
  const [filterBeds,     setFilterBeds]     = useState("Any");
  const [filterType,     setFilterType]     = useState("All");
  const [maxPrice,       setMaxPrice]       = useState(300000);
  const [amenityFilters, setAmenityFilters] = useState([]);
  const [verifiedOnly,   setVerifiedOnly]   = useState(false);
  const [immediateOnly,  setImmediateOnly]  = useState(false);

  // ✅ Lead modal state
  const [leadModal,      setLeadModal]      = useState(null); // property object
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadDoneIds,    setLeadDoneIds]    = useState([]);

  const heroState = location.state || {};

  useEffect(() => { fetchListings(); }, [page, sort, filterBeds, filterType, maxPrice, verifiedOnly, immediateOnly, amenityFilters]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: LIMIT });

      if (heroState.emirate) params.set("emirate", heroState.emirate);
      if (heroState.tags?.length) params.set("area", heroState.tags[0]);
      if (filterType !== "All") params.set("type", filterType);
      if (filterBeds !== "Any") params.set("bhk", filterBeds);
      if (maxPrice < 300000) params.set("maxPrice", maxPrice);
      if (verifiedOnly) params.set("verified", "true");
      if (immediateOnly) params.set("isImmediate", "true");

      const allAmenities = [...(heroState.amenities||[]), ...amenityFilters];
      if (allAmenities.length) params.set("amenities", [...new Set(allAmenities)].join(","));

      if (sort === "Price: Low to High") params.set("sort", "low");
      if (sort === "Price: High to Low") params.set("sort", "high");
      if (sort === "Top Rated") params.set("sort", "rating");

      const res = await apiService.get(`/rental/property/search?${params.toString()}`);
      setListings(res?.data || []);
      setTotal(res?.total || 0);
    } catch {
      message.error("Failed to load properties.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Lead submit — no login required, uses property _id
 const handleLeadSubmit = async (formData) => {
  // ✅ Safety check
  if (!leadModal?._id) {
    message.error("Property not selected");
    return;
  }

  try {
    setLeadSubmitting(true);

    // ✅ Name split (safe)
    const nameParts = formData.name.trim().split(" ");

    // ✅ Phone clean
    const dialCode = formData.countryCode?.replace("+", "") || "";
    const fullPhone = formData.phone || "";

    const number = fullPhone.startsWith(dialCode)
      ? fullPhone.slice(dialCode.length)
      : fullPhone;

    // ✅ Basic validation
    if (!formData.name.trim()) {
      message.warning("Name is required");
      return;
    }

    if (!formData.phone || formData.phone.length < 8) {
      message.error("Enter valid phone number");
      return;
    }

    // ✅ FINAL PAYLOAD
    const payload = {
      type: "rent",

      property: leadModal._id,

      name: {
        first_name: nameParts[0],
        last_name: nameParts.slice(1).join(" ") || "-"
      },

      mobile: {
        country_code: formData.countryCode || "+971",
        number: number
      },

      email: formData.email || "",
      message: formData.message || ""
    };

    // ✅ API CALL
    const res = await apiService.post("/property/lead", payload);

    // ✅ Response handling
    if (res?.data?.alreadyExists) {
      notification.info({
        message: "Already Interested",
        description: "You already showed interest in this property.",
        placement: "topRight"
      });
    } else {
      notification.success({
        message: "Interest Sent!",
        description: "Our agent will contact you shortly.",
        placement: "topRight"
      });
    }

    // ✅ UI update
    setLeadDoneIds(prev => [...prev, leadModal._id]);
    setLeadModal(null);

  } catch (err) {
    message.error(
      err?.response?.data?.message || "Failed to send. Please try again."
    );
  } finally {
    setLeadSubmitting(false);
  }
};

  const toggleSave    = (id) => setSavedIds((p) => p.includes(id) ? p.filter((x)=>x!==id) : [...p,id]);
  const toggleAmenity = (a)  => setAmenityFilters((p) => p.includes(a) ? p.filter((x)=>x!==a) : [...p,a]);

  const emirateLabel = heroState.emirate || "UAE";
  const areaLabel    = heroState.tags?.join(", ") || "";

  return (
    <div style={{ background:"#f7f6fb",minHeight:"100vh",fontFamily:"system-ui, sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from{opacity:0;transform:translateY(-6px);}to{opacity:1;transform:none;} }
        ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:#c4b5fd;border-radius:10px;}
        input[type="range"]{-webkit-appearance:none;width:100%;height:5px;background:#e8e0fd;border-radius:4px;outline:none;}
        input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:#6d28d9;cursor:pointer;border:2px solid white;box-shadow:0 2px 6px rgba(109,40,217,0.4);}
        .pill{border:1.5px solid #e2e8f0;border-radius:8px;padding:7px 10px;font-size:12px;font-weight:700;color:#64748b;background:white;cursor:pointer;transition:all 0.18s;font-family:inherit;text-align:center;}
        .pill:hover{border-color:#a78bfa;color:#6d28d9;background:#f5f3ff;}
        .pill.on{border-color:#6d28d9;background:#6d28d9;color:white;}
        select.fselect{border:1.5px solid #e2e8f0;border-radius:8px;padding:8px 32px 8px 12px;font-size:13px;font-weight:700;color:#1e1b4b;background:white;outline:none;cursor:pointer;font-family:inherit;}
        .chk{width:16px;height:16px;accent-color:#6d28d9;cursor:pointer;}
      `}</style>

      {/* ✅ Lead Modal */}
      {leadModal && (
        <LeadModal
          property={leadModal}
          onClose={()=>setLeadModal(null)}
          onSubmit={handleLeadSubmit}
          submitting={leadSubmitting}
        />
      )}

      <div style={{ display:"grid",gridTemplateColumns:"264px 1fr 280px",gap:20,maxWidth:1400,margin:"0 auto",padding:"24px" }}>

        {/* LEFT FILTERS */}
        <div style={{ background:"white",border:"1.5px solid #f0f0f0",borderRadius:18,padding:20,maxHeight:"calc(100vh - 96px)",position:"sticky",top:82,overflowY:"auto" }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
            <span style={{ fontSize:15,fontWeight:900,color:"#1e1b4b" }}>Filters</span>
            <span onClick={()=>{setFilterBeds("Any");setFilterType("All");setMaxPrice(300000);setAmenityFilters([]);setVerifiedOnly(false);setImmediateOnly(false);setPage(1);}} style={{ fontSize:12,fontWeight:700,color:"#ef4444",cursor:"pointer" }}>Reset all</span>
          </div>

          <div style={{ marginBottom:22 }}>
            <div style={{ fontSize:11,fontWeight:800,color:"#1e1b4b",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10 }}>Bedrooms</div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6 }}>
              {BEDROOMS.map((b)=><button key={b} onClick={()=>{setFilterBeds(b);setPage(1);}} className={`pill${filterBeds===b?" on":""}`}>{b}</button>)}
            </div>
          </div>

          <div style={{ marginBottom:22 }}>
            <div style={{ fontSize:11,fontWeight:800,color:"#1e1b4b",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6 }}>Max Annual Rent</div>
            <div style={{ fontSize:17,fontWeight:900,color:"#6d28d9",marginBottom:10 }}>AED {maxPrice.toLocaleString()}</div>
            <input type="range" min={30000} max={300000} step={5000} value={maxPrice} onChange={(e)=>{setMaxPrice(Number(e.target.value));setPage(1);}} />
            <div style={{ display:"flex",justifyContent:"space-between",fontSize:10,color:"#94a3b8",fontWeight:600,marginTop:4 }}>
              <span>AED 30K</span><span>AED 300K</span>
            </div>
          </div>

          <div style={{ marginBottom:22 }}>
            <div style={{ fontSize:11,fontWeight:800,color:"#1e1b4b",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10 }}>Property Type</div>
            <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
              {PROP_TYPES.map((t)=>(
                <label key={t} style={{ display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,color:"#475569",fontWeight:600 }}>
                  <input type="radio" name="ptype" className="chk" checked={filterType===t} onChange={()=>{setFilterType(t);setPage(1);}} />{t}
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom:22,display:"flex",flexDirection:"column",gap:12 }}>
            <div style={{ fontSize:11,fontWeight:800,color:"#1e1b4b",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:2 }}>Quick Filters</div>
            {[{label:"Verified Only",val:verifiedOnly,set:setVerifiedOnly},{label:"Immediate Availability",val:immediateOnly,set:setImmediateOnly}].map((item,i)=>(
              <label key={i} style={{ display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,color:"#475569",fontWeight:600 }}>
                <input type="checkbox" className="chk" checked={item.val} onChange={(e)=>{item.set(e.target.checked);setPage(1);}} />{item.label}
              </label>
            ))}
          </div>

          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:11,fontWeight:800,color:"#1e1b4b",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10 }}>Amenities</div>
            <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
              {AMENITY_LIST.map((a)=><button key={a} onClick={()=>{toggleAmenity(a);setPage(1);}} className={`pill${amenityFilters.includes(a)?" on":""}`}>{a}</button>)}
            </div>
          </div>
        </div>

        {/* LISTINGS */}
        <div>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:16 }}>
            <div>
              <div style={{ fontSize:12,color:"#94a3b8",fontWeight:600,marginBottom:4 }}>Home / UAE / {emirateLabel}{areaLabel?` / ${areaLabel}`:""}</div>
              <div style={{ fontSize:22,fontWeight:900,color:"#1e1b4b",letterSpacing:"-0.5px" }}>{loading?"Loading...":`${total} Properties found`}</div>
            </div>
            <select className="fselect" value={sort} onChange={(e)=>{setSort(e.target.value);setPage(1);}}>
              <option>Recommended</option><option>Price: Low to High</option><option>Price: High to Low</option><option>Top Rated</option>
            </select>
          </div>

          {loading ? (
            <div style={{ display:"flex",justifyContent:"center",padding:"80px 0" }}><Spin size="large" /></div>
          ) : listings.length===0 ? (
            <div style={{ background:"white",borderRadius:20,padding:"80px 20px",textAlign:"center",color:"#94a3b8",border:"1.5px dashed #e2e8f0" }}>
              <div style={{ fontSize:48,marginBottom:16 }}><FiHome size={40} /></div>
              <div style={{ fontSize:18,fontWeight:800,color:"#1e1b4b",marginBottom:8 }}>No properties match your filters</div>
              <div style={{ fontSize:14 }}>Try adjusting your budget or filter criteria.</div>
            </div>
          ) : (
            listings.map((l)=>(
              <ListingCard
                key={l._id} listing={l}
                saved={savedIds.includes(l._id)} onSave={toggleSave}
                // ✅ Pass full listing object to open modal
                onContact={(listing)=>setLeadModal(listing)}
                leadCreating={leadSubmitting&&leadModal?._id===l._id?l._id:null}
                contacted={leadDoneIds.includes(l._id)}
              />
            ))
          )}

          {total>LIMIT&&(
            <div style={{ display:"flex",justifyContent:"center",gap:8,marginTop:24 }}>
              {Array.from({length:Math.ceil(total/LIMIT)},(_,i)=>i+1).map((p)=>(
                <button key={p} onClick={()=>setPage(p)} style={{ width:36,height:36,borderRadius:8,border:"1.5px solid "+(page===p?"#6d28d9":"#e2e8f0"),background:page===p?"#6d28d9":"white",color:page===p?"white":"#475569",fontWeight:700,cursor:"pointer",fontSize:13 }}>{p}</button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
          <div style={{ background:savedIds.length?"#f5f3ff":"white",border:`1.5px solid ${savedIds.length?"#c4b5fd":"#f0f0f0"}`,borderRadius:16,padding:"18px 20px",transition:"all 0.3s" }}>
            <div style={{ fontSize:13,fontWeight:800,color:"#1e1b4b",marginBottom:6 }}>♥ Saved Properties</div>
            {savedIds.length===0 ? (
              <div style={{ fontSize:13,color:"#94a3b8" }}>Click the heart to save properties.</div>
            ) : (
              <div style={{ fontSize:28,fontWeight:900,color:"#6d28d9" }}>{savedIds.length} <span style={{ fontSize:14,color:"#64748b",fontWeight:600 }}>saved</span></div>
            )}
          </div>

          <div style={{ background:"linear-gradient(145deg,#1e1b4b 0%,#4c1d95 100%)",borderRadius:16,padding:"22px 20px",color:"white",textAlign:"center",boxShadow:"0 8px 28px rgba(109,40,217,0.22)" }}>
            <div style={{ fontSize:28,marginBottom:10 }}><FiFileText size={28} /></div>
            <div style={{ fontSize:17,fontWeight:900,marginBottom:6 }}>Ejari Registration</div>
            <div style={{ fontSize:12,color:"rgba(255,255,255,0.7)",marginBottom:18,lineHeight:1.6 }}>DLD-approved. Fast, online, 24hr turnaround.</div>
            <button style={{ width:"100%",background:"white",color:"#6d28d9",border:"none",borderRadius:10,padding:11,fontSize:13,fontWeight:800,cursor:"pointer" }}>Register Now</button>
          </div>
        </div>
      </div>
    </div>
  );
}