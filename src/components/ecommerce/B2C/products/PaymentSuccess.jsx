import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ── Confetti Particle ─────────────────────────────────────
const COLORS = ["#6366f1","#8b5cf6","#06b6d4","#10b981","#f59e0b","#ec4899","#3b82f6","#f97316"];

function Particle({ x, y, color, angle, speed, size, shape, onDone }) {
  const ref = useRef(null);
  useEffect(() => {
    let frame, px = x, py = y;
    let vx = Math.cos(angle) * speed;
    let vy = Math.sin(angle) * speed - 3;
    let alpha = 1, rot = Math.random() * 360;
    const tick = () => {
      vy += 0.22; px += vx; py += vy; vx *= 0.99;
      alpha -= 0.014; rot += vx * 4;
      if (ref.current) {
        ref.current.style.transform = `translate(${px}px,${py}px) rotate(${rot}deg)`;
        ref.current.style.opacity = Math.max(0, alpha);
      }
      if (alpha > 0) frame = requestAnimationFrame(tick);
      else onDone?.();
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <div ref={ref} style={{
      position:"fixed", left:0, top:0, pointerEvents:"none", zIndex:9999,
      width: shape==="circle" ? size : size*1.4,
      height: shape==="circle" ? size : size*0.5,
      borderRadius: shape==="circle" ? "50%" : 3,
      background: color, willChange:"transform,opacity",
    }}/>
  );
}

function Confetti({ origin }) {
  const [parts, setParts] = useState([]);
  useEffect(() => {
    const burst = (ox, oy, n=70) => {
      const ps = Array.from({length:n},(_,i)=>({
        id: Math.random()+i+Date.now(),
        x:ox, y:oy,
        color: COLORS[Math.floor(Math.random()*COLORS.length)],
        angle: (Math.PI*2*i)/n + (Math.random()-.5)*.5,
        speed: 5+Math.random()*7,
        size: 6+Math.random()*8,
        shape: Math.random()>.5?"rect":"circle",
      }));
      setParts(p=>[...p,...ps]);
    };
    burst(origin.x, origin.y, 90);
    setTimeout(()=>burst(origin.x-110, origin.y+35, 45), 350);
    setTimeout(()=>burst(origin.x+110, origin.y+35, 45), 600);
  }, []);
  return parts.map(p=>(
    <Particle key={p.id} {...p} onDone={()=>setParts(ps=>ps.filter(x=>x.id!==p.id))}/>
  ));
}

// ── Animated Check Icon ───────────────────────────────────
function CheckIcon() {
  return (
    <svg viewBox="0 0 80 80" width="52" height="52">
      <defs>
        <linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1"/>
          <stop offset="100%" stopColor="#8b5cf6"/>
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r="36" fill="none" stroke="url(#cg)" strokeWidth="4"
        strokeDasharray="226" strokeDashoffset="226"
        style={{animation:"ps_cDraw .65s cubic-bezier(.4,0,.2,1) .1s forwards", strokeLinecap:"round"}}/>
      <polyline points="22,41 34,54 58,30" fill="none" stroke="url(#cg)" strokeWidth="5"
        strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="55" strokeDashoffset="55"
        style={{animation:"ps_kDraw .35s ease .72s forwards"}}/>
    </svg>
  );
}

// ── Main Component ────────────────────────────────────────
const REDIRECT_SECS = 5;

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [show, setShow]       = useState(false);
  const [origin, setOrigin]   = useState(null);
  const [countdown, setCountdown] = useState(REDIRECT_SECS);
  const cardRef = useRef(null);
  const orderId = `XTO-${Date.now().toString().slice(-7)}`;

  // Show card + confetti
  useEffect(()=>{
    const t = setTimeout(()=>{
      setShow(true);
      const r = cardRef.current?.getBoundingClientRect();
      if(r) setOrigin({ x: r.left + r.width/2, y: r.top + r.height*0.2 });
    }, 80);
    return () => clearTimeout(t);
  },[]);

  // ✅ Auto redirect countdown
  useEffect(()=>{
    const interval = setInterval(()=>{
      setCountdown(prev => {
        if(prev <= 1){
          clearInterval(interval);
          navigate("/ecommerce/b2c");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  },[navigate]);

  return (
    <>
      {/* ── Scoped styles — NO global reset ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Lora:wght@700&display=swap');

        @keyframes ps_cDraw   { to { stroke-dashoffset: 0; } }
        @keyframes ps_kDraw   { to { stroke-dashoffset: 0; } }
        @keyframes ps_riseIn  {
          from { opacity:0; transform: translateY(32px) scale(.97); }
          to   { opacity:1; transform: translateY(0) scale(1); }
        }
        @keyframes ps_fadeUp  {
          from { opacity:0; transform: translateY(14px); }
          to   { opacity:1; transform: translateY(0); }
        }
        @keyframes ps_popBounce {
          from { opacity:0; transform: scale(.55); }
          to   { opacity:1; transform: scale(1); }
        }
        @keyframes ps_ringPulse {
          0%   { box-shadow: 0 0 0 0 rgba(99,102,241,.28); }
          70%  { box-shadow: 0 0 0 20px rgba(99,102,241,0); }
          100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
        }
        @keyframes ps_blob1 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%     { transform: translate(45px,30px) scale(1.12); }
        }
        @keyframes ps_blob2 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%     { transform: translate(-35px,-25px) scale(1.08); }
        }
        @keyframes ps_float {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-8px); }
        }
        @keyframes ps_barIn {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes ps_tagIn {
          from { opacity:0; transform: scale(.8) translateY(5px); }
          to   { opacity:1; transform: scale(1) translateY(0); }
        }
        @keyframes ps_countdown {
          from { stroke-dashoffset: 0; }
          to   { stroke-dashoffset: 100; }
        }

        .ps-btn-primary {
          width: 100%;
          padding: 15px;
          border: none;
          border-radius: 14px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          box-shadow: 0 6px 24px rgba(99,102,241,.35);
          transition: transform .18s, box-shadow .18s;
        }
        .ps-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 36px rgba(99,102,241,.45);
        }
        .ps-btn-ghost {
          width: 100%;
          padding: 14px;
          border: 1.5px solid #e0e4f5;
          border-radius: 14px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          background: #fff;
          color: #6366f1;
          margin-top: 10px;
          transition: border-color .18s, background .18s;
        }
        .ps-btn-ghost:hover {
          border-color: #6366f1;
          background: #f5f3ff;
        }
      `}</style>

      {/* ── Page shell ── */}
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(145deg,#eef2ff 0%,#f0f9ff 40%,#fdf4ff 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* Blobs */}
        {[
          { w:520,h:520,top:"-140px",left:"-160px", bg:"radial-gradient(circle,rgba(99,102,241,.13) 0%,transparent 70%)", anim:"ps_blob1 10s ease-in-out infinite" },
          { w:420,h:420,bottom:"-90px",right:"-120px", bg:"radial-gradient(circle,rgba(139,92,246,.11) 0%,transparent 70%)", anim:"ps_blob2 13s ease-in-out infinite" },
        ].map((b,i)=>(
          <div key={i} style={{
            position:"fixed", width:b.w, height:b.h,
            top:b.top, left:b.left, bottom:b.bottom, right:b.right,
            background:b.bg, borderRadius:"50%", filter:"blur(60px)",
            pointerEvents:"none", animation:b.anim,
          }}/>
        ))}

        {/* Dot grid */}
        <div style={{
          position:"fixed", inset:0, pointerEvents:"none", zIndex:0,
          backgroundImage:"radial-gradient(rgba(99,102,241,.09) 1.5px,transparent 1.5px)",
          backgroundSize:"36px 36px",
        }}/>

        {/* Floating dots */}
        {[
          {top:"12%",left:"7%", s:11,c:"#6366f1",d:"0s",  dur:"3.2s"},
          {top:"72%",left:"5%", s: 8,c:"#06b6d4",d:"1.1s",dur:"4s"},
          {top:"20%",right:"6%",s:13,c:"#8b5cf6",d:"0.6s",dur:"3.6s"},
          {top:"78%",right:"8%",s: 9,c:"#10b981",d:"1.8s",dur:"2.9s"},
        ].map((d,i)=>(
          <div key={i} style={{
            position:"fixed", top:d.top, left:d.left, right:d.right,
            width:d.s, height:d.s, borderRadius:"50%",
            background:d.c, opacity:.4, zIndex:1,
            animation:`ps_float ${d.dur} ease-in-out ${d.d} infinite`,
          }}/>
        ))}

        {origin && <Confetti origin={origin}/>}

        {/* ── Card ── */}
        <div ref={cardRef} style={{
          background: "#ffffff",
          borderRadius: 28,
          width: "100%",
          maxWidth: 460,
          padding: "44px 40px 40px",
          position: "relative",
          zIndex: 10,
          boxShadow: "0 2px 4px rgba(99,102,241,.04),0 12px 32px rgba(99,102,241,.1),0 40px 90px rgba(99,102,241,.13)",
          border: "1px solid rgba(99,102,241,.1)",
          opacity: show ? 1 : 0,
          animation: show ? "ps_riseIn .6s cubic-bezier(.34,1.38,.64,1) forwards" : "none",
        }}>

          {/* Top accent strip */}
          <div style={{
            position:"absolute", top:0, left:"12%", right:"12%", height:3,
            background:"linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4,#10b981)",
            borderRadius:"0 0 8px 8px",
          }}/>

          {/* Check bubble */}
          <div style={{
            display:"flex", justifyContent:"center", marginBottom:20,
            animation:"ps_popBounce .55s cubic-bezier(.34,1.56,.64,1) .2s both",
          }}>
            <div style={{
              width:88, height:88, borderRadius:"50%",
              background:"linear-gradient(135deg,#ede9fe,#dbeafe)",
              display:"flex", alignItems:"center", justifyContent:"center",
              animation:"ps_ringPulse 2.5s ease-in-out 1.3s infinite",
            }}>
              <CheckIcon/>
            </div>
          </div>

          {/* Success badge */}
          <div style={{
            display:"flex", justifyContent:"center", marginBottom:14,
            animation:"ps_tagIn .4s ease .65s both",
          }}>
            <span style={{
              display:"inline-flex", alignItems:"center", gap:6,
              background:"#f0fdf4", border:"1.5px solid #86efac",
              color:"#15803d", fontSize:11, fontWeight:700,
              letterSpacing:"0.1em", textTransform:"uppercase",
              padding:"5px 14px", borderRadius:99,
            }}>
              <span style={{width:7,height:7,borderRadius:"50%",background:"#22c55e",display:"inline-block"}}/>
              Payment Successful
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily:"'Lora',serif",
            fontSize:30, fontWeight:700,
            color:"#1e1b4b", textAlign:"center",
            lineHeight:1.2, margin:"0 0 10px",
            animation:"ps_fadeUp .5s ease .72s both",
          }}>
            Your Order is Placed! 🎉
          </h1>

          <p style={{
            color:"#64748b", fontSize:14, textAlign:"center",
            lineHeight:1.7, margin:"0 0 24px",
            animation:"ps_fadeUp .5s ease .78s both",
          }}>
            Thank you for shopping with{" "}
            <strong style={{color:"#6366f1"}}>Xoto</strong>.<br/>
            A confirmation email is on its way to you.
          </p>

          {/* Order ID */}
          <div style={{
            background:"linear-gradient(135deg,#f5f3ff,#eef2ff)",
            border:"1.5px solid #c7d2fe", borderRadius:16,
            padding:"14px 18px",
            display:"flex", justifyContent:"space-between", alignItems:"center",
            marginBottom:20,
            animation:"ps_fadeUp .5s ease .85s both",
          }}>
            <div>
              <p style={{fontSize:10,color:"#94a3b8",fontWeight:700,letterSpacing:"0.09em",
                         textTransform:"uppercase",marginBottom:4,marginTop:0}}>
                Order ID
              </p>
              <p style={{fontSize:16,fontWeight:800,color:"#4f46e5",
                         fontFamily:"'Lora',serif",letterSpacing:"0.04em",margin:0}}>
                {orderId}
              </p>
            </div>
            <div style={{
              background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
              borderRadius:10, padding:"8px 16px",
              fontSize:11, fontWeight:700, color:"#fff", letterSpacing:"0.06em",
              cursor:"pointer",
            }}>
              DETAILS
            </div>
          </div>

          {/* ── Auto-redirect countdown ── */}
          <div style={{
            background:"#fafbff", border:"1.5px solid #e8eaf6",
            borderRadius:16, padding:"16px 20px",
            display:"flex", alignItems:"center", gap:16,
            marginBottom:24,
            animation:"ps_fadeUp .5s ease .92s both",
          }}>
            {/* Countdown ring */}
            <div style={{position:"relative",width:48,height:48,flexShrink:0}}>
              <svg width="48" height="48" viewBox="0 0 48 48" style={{transform:"rotate(-90deg)"}}>
                <circle cx="24" cy="24" r="20" fill="none" stroke="#e2e8f0" strokeWidth="3.5"/>
                <circle cx="24" cy="24" r="20" fill="none"
                  stroke="#6366f1" strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray="125.6"
                  strokeDashoffset={125.6 * (1 - countdown / REDIRECT_SECS)}
                  style={{transition:"stroke-dashoffset 1s linear"}}
                />
              </svg>
              <div style={{
                position:"absolute", inset:0,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:16, fontWeight:800, color:"#4f46e5",
              }}>
                {countdown}
              </div>
            </div>
            <div>
              <p style={{fontSize:13,fontWeight:700,color:"#1e1b4b",margin:"0 0 2px"}}>
                Redirecting automatically
              </p>
              <p style={{fontSize:12,color:"#94a3b8",margin:0}}>
                Going to shop in {countdown} second{countdown !== 1 ? "s" : ""}...
              </p>
            </div>
          </div>

          {/* Divider */}
          <div style={{
            height:1, background:"#f1f5f9", marginBottom:18,
            animation:"ps_fadeUp .4s ease 1.05s both",
          }}/>

          {/* Buttons */}
          <div style={{animation:"ps_fadeUp .5s ease 1.1s both"}}>
            <button className="ps-btn-primary" onClick={()=>navigate("/ecommerce/b2c")}>
              Continue Shopping →
            </button>
            <button className="ps-btn-ghost" onClick={()=>navigate("/ecommerce/orders")}>
              📦 Track My Order
            </button>
          </div>

          {/* Footer note */}
          <p style={{
            textAlign:"center", fontSize:11, color:"#94a3b8",
            marginTop:18, marginBottom:0,
            animation:"ps_fadeUp .4s ease 1.2s both",
          }}>
            Need help?{" "}
            <span style={{color:"#6366f1",fontWeight:600,cursor:"pointer"}}>
              support@xoto.ae
            </span>
          </p>
        </div>
      </div>
    </>
  );
};

export default PaymentSuccess;