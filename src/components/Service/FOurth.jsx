import React from "react";

// Icons + Loop Image
// import iconAI from "../../assets/img/icons123/icon1.png";
// import iconCost from "../../assets/img/icons123/icon2.png";
// import iconGuide from "../../assets/img/icons123/icon3.png";
// import iconFast from "../../assets/img/icons123/icon4.png";
import loopImg from "../../assets/img/loopimgg.png";
import Testimonialpage from "./Testimonialpage";

// Apply DM Sans only inside this component
const dmSans = {
  fontFamily: "'DM Sans', sans-serif",
};

// Label Component
function LoopLabel({ title, text, align = "left" }) {
  return (
    <div
      className={`w-60 ${align === "right" ? "text-right" : "text-left"}`}
      style={dmSans}
    >
      <p
        className="
          font-semibold
          text-[#020202]
          px-4 py-1
          rounded-lg
          inline-block
          shadow-[0_0_20px_rgba(0,0,0,0.1)]
          border border-gray-200
        "
        style={{
          background: "linear-gradient(to bottom, #FFFFFF, #ACB3FF)",
        }}
      >
        {title}
      </p>

      <p className="text-gray-600 text-sm  leading-relaxed" style={dmSans}>
        {text}
      </p>
    </div>
  );
}

export default function OurPartners() {
  return (
    <>
      <section
        className="w-full bg-[var(--color-body)] px-4 sm:px-6 md:px-12 lg:px-20 pb-20 pt-20 relative overflow-x-hidden"
        style={dmSans}
      >
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />

        {/* ================= TITLE ================= */}
       {/* ================= TEXT SECTION ================= */}
<div
  className="
    mx-auto
    max-w-7xl
    grid grid-cols-1 md:grid-cols-2
    gap-6 lg:gap-10
    mb-20 md:mb-28
    text-center md:text-left
    px-4 sm:px-6
  "
  style={dmSans}
>
  <h2 className="text-3xl sm:text-4xl md:text-6xl leading-tight text-[#0b1739]">
    We Make Lenders <br className="hidden md:block" /> Work for You
  </h2>

  <p className="text-[#547593] text-lg sm:text-xl md:text-2xl leading-relaxed max-w-xl mx-auto md:mx-0 mt-4">
    Xoto partners with leading banks and institutions so you get access
    to exclusive mortgage offers — faster, easier, and with full
    transparency.
  </p>
</div>

{/* ================= INFINITY LOOP ================= */}
<div className="relative w-full flex justify-center px-4">

  <img
    src={loopImg}
    alt="Infinity Loop"
    className="
      w-full
      max-w-[320px]     /* mobile */
      sm:max-w-[540px] /* small */
      md:max-w-[820px] /* tablet */
      lg:max-w-[980px] /* desktop */
      xl:max-w-[1180px]
      h-auto
      pointer-events-none
      select-none
    "
  />

</div>

      </section>

      <Testimonialpage />
    </>
  );
}








// old code 

// import React from "react";

// // Icons + Loop Image
// import loopImg from "../../assets/img/loopimg1.png";
// import Testimonialpage from "./Testimonialpage";

// // Apply DM Sans only inside this component
// const dmSans = {
//   fontFamily: "'DM Sans', sans-serif",
// };

// function LoopLabel({ title, text, align = "left", className = "" }) {
//   return (
//     <div
//       className={`
//         w-full
//         ${align === "right" ? "ml-auto text-right" : "mr-auto text-left"}
//         ${className}
//       `}
//       style={dmSans}
//     >
//       {/* Title Box */}
//       <p
//         className="
//           font-semibold
//           text-[#0b1739]
//           rounded-lg
//           inline-block
//           shadow-[0_4px_20px_rgba(0,0,0,0.08)]
//           border border-white/60
//           text-[10px] px-2 py-1 mb-1
//           sm:text-sm sm:px-5 sm:py-2 sm:mb-3 sm:text-base
//         "
//         style={{ background: "linear-gradient(to bottom, #FFFFFF, #EBEBFF)" }}
//       >
//         {title}
//       </p>

//       {/* Description */}
//       <p
//         className="
//           text-[#547593]
//           font-medium
//           text-[8px] leading-tight
//           sm:text-sm sm:leading-relaxed
//         "
//       >
//         {text}
//       </p>
//     </div>
//   );
// }


// export default function OurPartners() {
//   return (
//     <>
//       <section
//         className="w-full bg-[var(--color-body)] px-2 sm:px-6 md:px-12 lg:px-20 pb-20 pt-10 sm:pt-20 relative overflow-x-hidden"
//         style={dmSans}
//       >
//         <link
//           href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap"
//           rel="stylesheet"
//         />

//         {/* ================= TEXT SECTION ================= */}
//         <div
//           className="
//             mx-auto
//             max-w-7xl
//             grid grid-cols-1 md:grid-cols-2
//             gap-4 sm:gap-6 lg:gap-10
//             mb-10 md:mb-20
//             text-center md:text-left
//             px-4
//           "
//           style={dmSans}
//         >
//           <h2 className="text-2xl sm:text-3xl md:text-6xl leading-tight text-[#0b1739] font-bold">
//             We Make Lenders <br className="hidden md:block" /> Work for You
//           </h2>

//           <p className="text-[#547593] text-sm sm:text-lg md:text-2xl leading-relaxed max-w-xl mx-auto md:mx-0 mt-2 sm:mt-4">
//             Xoto partners with leading banks and institutions so you get access
//             to exclusive mortgage offers — faster, easier, and with full
//             transparency.
//           </p>
//         </div>

//         {/* ================= INFINITY LOOP GRID ================= */}
//   <div className="relative w-full max-w-[1400px] mx-auto px-1 sm:px-4">

//   {/* CENTER IMAGE (always stable) */}
// <div className="flex justify-center">
//   <img
//     src={loopImg}
//     alt="Infinity Loop"
//     className="
//       w-full
//       max-w-[420px] sm:max-w-[620px] md:max-w-[780px]
//       h-auto
//       object-contain
//       pointer-events-none
//       select-none
//       drop-shadow-sm
//     "
//   />
// </div>


//   {/* LEFT LABELS */}
//   <div
//     className="
//       absolute
//       top-[209px]
//       -translate-y-1/2
//       left-[90px]
//       flex flex-col
//       justify-between
//       gap-8 sm:gap-20
//       max-w-[200px]
//       h-[390px]
//       border
//     "
//   >
//     <LoopLabel
//     className="h-[200px]"
//       title="AI Matched Offers"
//       text="We match you to mortgage plans suited to your income, property, and goals."
//       align="left"
//     />

//     <LoopLabel
//     className="mb-2"
//       title="Personal Guidance"
//       text="Our mortgage experts help guide you through every step, including paperwork."
//       align="left"
//     />
//   </div>

//   {/* RIGHT LABELS */}
//   <div
//     className="
//       absolute
//       top-1/2
//             right-[90px]

//             h-[360px]
//       justify-between
//       top-[194px]

//       -translate-y-1/2
//       right-0
//       flex flex-col
//       gap-8 sm:gap-20
//       max-w-[260px]
//     "
//   >
//     <LoopLabel
//       title="Transparent Cost"
//       text="All fees, interest, and charges are shown upfront — no last-minute surprises."
//       align="right"
//     />

//     <LoopLabel
//       title="Fast Process"
//       text="Fastest Pre approval to disbursement Fastest Pre approval to disbursement Fastest Pre approval to disbursement"
//       align="right"
//     />
//   </div>

// </div>

//       </section>

//       <Testimonialpage />
//     </>
//   );
// }