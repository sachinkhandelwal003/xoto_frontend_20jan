import React from "react";
import { useTranslation } from "react-i18next"; // <-- 1. Import hook
import Testimonialpage from "./Testimonialpage";

import icon1 from "../../assets/img/icons123/icon1.png";
import icon2 from "../../assets/img/icons123/icon2.png";
import icon3 from "../../assets/img/icons123/icon3.png";
import icon4 from "../../assets/img/icons123/icon4.png";

export default function OurPartners() {
  // <-- 2. Initialize hook with the filename "partners"
  const { t } = useTranslation("mort4"); 

  const W = 1100;
  const H = 720;

  const blueTL  = "M 190,420 C 190,175 522,175 550,420";
  const blueTR  = "M 550,420 C 578,175 910,175 910,420";
  const greenBL = "M 190,420 C 190,665 522,665 550,420";
  const greenBR = "M 550,420 C 578,665 910,665 910,420";

  const TL = { x: 360, y: 236 };
  const TR = { x: 740, y: 236 };
  const BL = { x: 360, y: 604 };
  const BR = { x: 740, y: 604 };

  const NR = 30;  
  const PH = 34;  
  const ICON_SIZE = 36; 

  const lineEndL = TL.x - NR - 4;  
  const lineEndR = TR.x + NR + 4;  

  return (
    <>
      <section
        style={{
          fontFamily: "'DM Sans', sans-serif",
          width: "100%",
          background: "linear-gradient(150deg,#ecedff 0%,#f5f6fc 50%,#ecedff 100%)",
          overflow: "hidden",
          padding: "48px 16px 56px",
          boxSizing: "border-box",
        }}
      >
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap"
          rel="stylesheet"
        />

        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: "block", maxWidth: 1200, margin: "0 auto" }}
        >
          {/* ... (Keep your existing <defs> here) ... */}
          <defs>
            <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#3ecef7" />
              <stop offset="100%" stopColor="#1ab5ed" />
            </linearGradient>
            <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#2aea8e" />
              <stop offset="100%" stopColor="#0dd476" />
            </linearGradient>

            <linearGradient id="pillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="#ffffff" />
              <stop offset="100%" stopColor="#c5caff" />
            </linearGradient>

            <filter id="pillShadow" x="-12%" y="-40%" width="124%" height="180%">
              <feDropShadow dx="0" dy="2" stdDeviation="5"
                floodColor="rgba(0,0,0,0.09)" floodOpacity="1" />
            </filter>

            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#6b3de8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6b3de8" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* ══════════════════════════════════════════════════════
              1. HEADER TEXT (Now Translated)
          ══════════════════════════════════════════════════════ */}
          <text fontFamily="'DM Sans', sans-serif" fontWeight="800" fill="#0b1739">
            <tspan x={28} y={76} fontSize={60}>{t("heading1", "We Make Lenders")}</tspan>
            <tspan x={28} dy={70} fontSize={60}>{t("heading2", "Work for You")}</tspan>
          </text>

          {/* SVG text doesnt wrap automatically, but keeping it as 3 lines for simplicity as you had it */}
          {/* If your translation is long, it might overflow. A robust way is HTML embedding, but this keeps your exact structure */}
          <foreignObject x={595} y={50} width={480} height={120}>
            <p xmlns="http://www.w3.org/1999/xhtml" style={{ margin: 0, color: "#547593", fontSize: "18px", fontWeight: "500", lineHeight: "1.5" }}>
              {t("description", "Xoto partners with leading banks and institutions so you get access to exclusive mortgage offers — faster, easier, and with full transparency.")}
            </p>
          </foreignObject>

          {/* ══════════════════════════════════════════════════════
              2 & 3. INFINITY ARCS & CONNECTOR LINES
          ══════════════════════════════════════════════════════ */}
          <path d={greenBL} fill="none" stroke="url(#greenGrad)" strokeWidth={5.5} strokeLinecap="round" />
          <path d={greenBR} fill="none" stroke="url(#greenGrad)" strokeWidth={5.5} strokeLinecap="round" />
          <path d={blueTL}  fill="none" stroke="url(#blueGrad)"  strokeWidth={5.5} strokeLinecap="round" />
          <path d={blueTR}  fill="none" stroke="url(#blueGrad)"  strokeWidth={5.5} strokeLinecap="round" />

          <line x1={2}        y1={TL.y} x2={lineEndL} y2={TL.y} stroke="#c6cde2" strokeWidth={1.5} />
          <line x1={2}        y1={BL.y} x2={lineEndL} y2={BL.y} stroke="#c6cde2" strokeWidth={1.5} />
          <line x1={lineEndR} y1={TR.y} x2={W - 2}    y2={TR.y} stroke="#c6cde2" strokeWidth={1.5} />
          <line x1={lineEndR} y1={BR.y} x2={W - 2}    y2={BR.y} stroke="#c6cde2" strokeWidth={1.5} />

          {/* ══════════════════════════════════════════════════════
              4. PILL LABELS (Now Translated via ForeignObject for word-wrap)
          ══════════════════════════════════════════════════════ */}
          
          {/* Using foreignObject inside SVG is the best way to handle multiline text in translation */}

         {/* ── TOP-LEFT ── */}
<rect x={4} y={TL.y - PH / 2} width={198} height={PH} rx={8} ry={8} fill="url(#pillGrad)" stroke="#dde1f8" strokeWidth={1} filter="url(#pillShadow)" />
<text x={103} y={TL.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize={14} fontWeight="700" fill="#0b1739" fontFamily="'DM Sans', sans-serif">
  {t("labels.aiOffers.title", "AI Matched Offers")}
</text>
{/* x ko thoda peeche (4 se hata kar 2) aur width ko adjust kiya taaki icon se na takraye */}
<foreignObject  y={TL.y + PH / 2 + 8} width={250} height={100}>
  <p xmlns="http://www.w3.org/1999/xhtml" style={{ margin: 0, color: "#6b8ca5", fontSize: "13.5px", fontWeight: "400", paddingRight: "10px" }}>
    {t("labels.aiOffers.text", "We match you to mortgage plans suited to your income, property, and goals.")}
  </p>
</foreignObject>

{/* ── BOTTOM-LEFT ── */}
<rect x={4} y={BL.y - PH / 2} width={204} height={PH} rx={8} ry={8} fill="url(#pillGrad)" stroke="#dde1f8" strokeWidth={1} filter="url(#pillShadow)" />
<text x={106} y={BL.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize={14} fontWeight="700" fill="#0b1739" fontFamily="'DM Sans', sans-serif">
  {t("labels.guidance.title", "Personal Guidance")}
</text>
<foreignObject x={4} y={BL.y + PH / 2 + 8} width={250} height={100}>
  <p xmlns="http://www.w3.org/1999/xhtml" style={{ margin: 0, color: "#6b8ca5", fontSize: "13.5px", fontWeight: "400", paddingRight: "10px" }}>
    {t("labels.guidance.text")}
  </p>
</foreignObject>

{/* ── TOP-RIGHT ── */}
<rect x={W - 198 - 4} y={TR.y - PH / 2} width={198} height={PH} rx={8} ry={8} fill="url(#pillGrad)" stroke="#dde1f8" strokeWidth={1} filter="url(#pillShadow)" />
<text x={W - 4 - 99} y={TR.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize={14} fontWeight="700" fill="#0b1739" fontFamily="'DM Sans', sans-serif">
  {t("labels.transparentCost.title", "Transparent Cost")}
</text>
{/* x ko thoda aage badhaya (W-284 ki jagah W-260) taaki icon se gap rahe */}
<foreignObject x={W - 254} y={TR.y + PH / 2 + 8} width={250} height={100}>
  <p xmlns="http://www.w3.org/1999/xhtml" style={{ margin: 0, color: "#6b8ca5", fontSize: "13.5px", fontWeight: "400", textAlign: "right", paddingLeft: "10px" }}>
    {t("labels.transparentCost.text", "All fees, interest, and charges are shown upfront — no last-minute surprises.")}
  </p>
</foreignObject>

{/* ── BOTTOM-RIGHT ── */}
<rect x={W - 160 - 4} y={BR.y - PH / 2} width={160} height={PH} rx={8} ry={8} fill="url(#pillGrad)" stroke="#dde1f8" strokeWidth={1} filter="url(#pillShadow)" />
<text x={W - 4 - 80} y={BR.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize={14} fontWeight="700" fill="#0b1739" fontFamily="'DM Sans', sans-serif">
  {t("labels.fastProcess.title", "Fast Process")}
</text>
<foreignObject x={W - 254} y={BR.y + PH / 2 + 8} width={250} height={100}>
  <p xmlns="http://www.w3.org/1999/xhtml" style={{ margin: 0, color: "#6b8ca5", fontSize: "13.5px", fontWeight: "400", textAlign: "right", paddingLeft: "10px" }}>
    {t("labels.fastProcess.text")}
  </p>
</foreignObject>

          {/* ══════════════════════════════════════════════════════
              5. ICON NODES
          ══════════════════════════════════════════════════════ */}
          {/* (Yahan aapke charo <image> tag waise ke waise hi rahenge) */}
          <circle cx={TL.x} cy={TL.y} r={NR + 18} fill="url(#nodeGlow)" />
          <circle cx={TL.x} cy={TL.y} r={NR} fill="#4b26aa" />
          <image href={icon1} x={TL.x - ICON_SIZE / 2} y={TL.y - ICON_SIZE / 2} width={ICON_SIZE} height={ICON_SIZE} />

          <circle cx={TR.x} cy={TR.y} r={NR + 18} fill="url(#nodeGlow)" />
          <circle cx={TR.x} cy={TR.y} r={NR} fill="#4b26aa" />
          <image href={icon2} x={TR.x - ICON_SIZE / 2} y={TR.y - ICON_SIZE / 2} width={ICON_SIZE} height={ICON_SIZE} />

          <circle cx={BL.x} cy={BL.y} r={NR + 18} fill="url(#nodeGlow)" />
          <circle cx={BL.x} cy={BL.y} r={NR} fill="#4b26aa" />
          <image href={icon3} x={BL.x - ICON_SIZE / 2} y={BL.y - ICON_SIZE / 2} width={ICON_SIZE} height={ICON_SIZE} />

          <circle cx={BR.x} cy={BR.y} r={NR + 18} fill="url(#nodeGlow)" />
          <circle cx={BR.x} cy={BR.y} r={NR} fill="#4b26aa" />
          <image href={icon4} x={BR.x - ICON_SIZE / 2} y={BR.y - ICON_SIZE / 2} width={ICON_SIZE} height={ICON_SIZE} />

        </svg>
      </section>
      <Testimonialpage />
    </>
  );
}