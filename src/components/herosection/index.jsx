import React from "react";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import calender from "../../assets/icons/Homeicons/Calendar.png";
import clock from "../../assets/icons/Homeicons/Clock.png";
import dubaiImg from "../../assets/img/home/popup.png";
import gurantee from "../../assets/icons/Homeicons/Guarantee.png";
import map from "../../assets/icons/Homeicons/Map-pin.png";
import flag from "../../assets/img/home/flaggg1.png";
import layer from "../../assets/img/home/Layer1.png";

const icons = [gurantee, clock, map, calender];

const HeroSection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("home");
  const features = t("hero.features", { returnObjects: true });

  const [popupVisible, setPopupVisible] = useState(false);
  const timerRef = useRef(null);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "",
    countryCode: "+971", phone: "", message: "",
  });

  const resetTimer = () => {
    clearTimeout(timerRef.current);
    if (sessionStorage.getItem("popupShown")) return;
    timerRef.current = setTimeout(() => {
      setPopupVisible(true);
      sessionStorage.setItem("popupShown", "true");
    }, 10000);
  };

  useEffect(() => {
    if (sessionStorage.getItem("popupShown")) return;
    const events = ["mousemove", "mousedown", "keypress", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();
    return () => {
      clearTimeout(timerRef.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", form);
    setPopupVisible(false);
  };

  return (
    <section className="relative w-full min-h-[80vh] overflow-hidden flex items-center justify-center text-white pt-24 pb-16 md:pt-28 md:pb-20 xl:pt-32 xl:pb-24">

      {/* ── POPUP ── */}
      {popupVisible && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-3 sm:p-4"
            onClick={() => setPopupVisible(false)}
          >
            <div
              className="relative w-full max-w-[820px] flex flex-col md:flex-row rounded-[5px] overflow-hidden shadow-2xl animate-fadeIn border-2 border-[#115a81] bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={() => setPopupVisible(false)}
                className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-md flex items-center justify-center text-gray-700 hover:bg-gray-100 transition text-sm font-bold shadow"
              >
                ✕
              </button>

              {/* LEFT: Form */}
              <div className="w-full md:w-[50%] bg-white p-5 sm:p-8 flex flex-col justify-center font-['DM_Sans']">
                <h2 className="text-3xl sm:text-[40px] font-black leading-tight sm:leading-[41px] text-black flex flex-col justify-center mb-1">
                  <span>Not Sure Where</span>
                  <span>To Start?</span>
                </h2>
                <p className="text-gray-600 text-sm sm:text-base font-bold mb-4 sm:mb-6">
                  We are here to help.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 sm:gap-3">
                  {/* Name row */}
                  <div className="flex gap-2 sm:gap-3 text-gray-600">
                    <input
                      name="firstName" value={form.firstName} onChange={handleChange}
                      placeholder="First Name*" required
                      className="w-1/2 border rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm focus:outline-none"
                      style={{ borderColor: '#115a81' }}
                    />
                    <input
                      name="lastName" value={form.lastName} onChange={handleChange}
                      placeholder="Last Name"
                      className="w-1/2 border rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm focus:outline-none"
                      style={{ borderColor: '#115a81' }}
                    />
                  </div>
                  {/* Email */}
                  <input
                    name="email" type="email" value={form.email} onChange={handleChange}
                    placeholder="Email address"
                    className="w-full border text-gray-600 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm focus:outline-none"
                    style={{ borderColor: '#115a81' }}
                  />
                  {/* Phone row */}
                  <div className="flex gap-2 text-gray-600">
                    <select
                      name="countryCode" value={form.countryCode} onChange={handleChange}
                      className="w-[36%] sm:w-[38%] border rounded-lg px-1.5 sm:px-2 py-2 text-xs sm:text-sm focus:outline-none bg-white"
                      style={{ borderColor: '#115a81' }}
                    >
                      <option value="+971">🇦🇪 +971</option>
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+966">🇸🇦 +966</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+1">🇺🇸 +1</option>
                    </select>
                    <input
                      name="phone" type="tel" value={form.phone} onChange={handleChange}
                      placeholder="Phone*" required
                      className="flex-1 border rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm focus:outline-none"
                      style={{ borderColor: '#115a81' }}
                    />
                  </div>
                  {/* Message */}
                  <textarea
                    name="message" value={form.message} onChange={handleChange}
                    placeholder="Your message*" rows={3} required
                    className="w-full border text-gray-600 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm focus:outline-none resize-none"
                    style={{ borderColor: '#115a81' }}
                  />
                  <button
                    type="submit"
                    className="w-full bg-[#5C039B] hover:bg-[#4a0280] text-white py-2.5 rounded-lg transition text-sm sm:text-lg mt-1"
                  >
                    Submit
                  </button>
                </form>
              </div>

              {/* RIGHT: Image — hidden on small screens, shown on md+ */}
              <div className="hidden md:flex md:w-[50%] relative font-['DM_Sans']">
                <img src={dubaiImg} alt="Hot Property Deals" className="w-full h-full object-cover" />
                <div className="absolute inset-0" />
                <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 text-white">
                  <p className="text-[28px] font-semibold uppercase leading-tight tracking-wide">HOT PROPERTY DEALS</p>
                  <p className="text-[14px] font-semibold text-white/80">Ready-to-move &amp; high ROI options</p>
                  <button
  onClick={() => {
    setPopupVisible(false);   // close popup (important)
    navigate("/Property#buy3");
  }}
  className="mt-4 mb-[19px] cursor-pointer w-full border border-white h-[36px] rounded-lg py-1.5 text-[16.77px] leading-[16.77px] bg-white text-[#5C039B]"
>
  View Now
</button>
                </div>
              </div>
            </div>
          </div>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: scale(0.95); }
              to   { opacity: 1; transform: scale(1); }
            }
            .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
          `}</style>
        </>
      )}

      {/* UAE FLAG — scales down on mobile */}
      <div className="absolute top-[1px] left-0 z-10 w-[120px] sm:w-[200px] md:w-[280px] lg:w-[334px] pointer-events-none">
        <img src={flag} alt="UAE Flag" className="w-full h-auto object-contain" style={{ maxHeight: '361px' }} />
      </div>

      {/* EXCLUSIVE DEALS LAYER — scales down on mobile */}
      <div className="absolute top-[-13px] right-0 z-10 w-[100px] sm:w-[150px] md:w-[200px] lg:w-[242px] cursor-pointer">
        <img src={layer} alt="Exclusive Deals" className="w-full h-auto object-contain" onClick={() => navigate("/Property#buy3")} />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 z-[1]" />

      {/* Background Video */}
      <video
        autoPlay loop muted playsInline
        disablePictureInPicture controls={false}
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="https://xotostaging.s3.me-central-1.amazonaws.com/properties/1768043300370-mortgage2.mp4" type="video/mp4" />
      </video>

      {/* ── MAIN CONTENT ── */}
      <div className="relative z-[2] w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col items-center text-center gap-8 sm:gap-10">
        <div className="w-full space-y-4 sm:space-y-6">

          {/* Heading — fluid size: small on mobile, full size on desktop */}
       <h1
  className="heading-light w-full text-center flex flex-col items-center gap-1 sm:gap-2"
  style={{ fontSize: 'clamp(28px, 6vw, 54px)', lineHeight: '1.15' }}
>
  <span className="block">{t("hero.title1")}</span>
  <span className="block">{t("hero.title2")}</span>
</h1>

          {/* Description */}
          <p className="block text-sm sm:text-base md:text-lg max-w-3xl mx-auto px-2">
            {t("hero.description")}
          </p>

          {/* CTA Buttons — wrap neatly on mobile */}
          <div className="pt-2 sm:pt-4 w-full">
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
              <Link
                to="/mortgage/services"
                className="whitespace-nowrap text-center border border-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-md hover:bg-[#5C039B] hover:text-white hover:border-[#5C039B] transition text-xs sm:text-sm md:text-base"
              >
                {t("hero.buttons.loan")}
              </Link>
              <Link
                to="/Property"
                className="whitespace-nowrap text-center border border-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-md hover:bg-[#5C039B] hover:text-white hover:border-[#5C039B] transition text-xs sm:text-sm md:text-base"
              >
                {t("hero.buttons.explore")}
              </Link>
              <Link
                to="/aiPlanner"
                className="whitespace-nowrap text-center border border-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-md hover:bg-[#5C039B] hover:text-white hover:border-[#5C039B] transition text-xs sm:text-sm md:text-base"
              >
                {t("hero.buttons.design")}
              </Link>
            </div>
          </div>

          {/* Features grid — 2 cols always, but items scale */}
          <div className="mt-6 sm:mt-8 mx-auto grid grid-cols-2 gap-4 sm:gap-6 md:gap-8 w-fit">
            {features.map((item, i) => (
              <div key={i} className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[var(--color-primary)] rounded-full flex items-center justify-center flex-shrink-0">
                  <img src={icons[i]} className="w-4 h-4 sm:w-5 sm:h-5" alt="" />
                </div>
                <span className="font-semibold text-sm sm:text-base md:text-lg text-left leading-snug">
                  {item.line1}
                  <br />
                  {item.line2}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Bottom decorative shapes — fully responsive */}
      <div className="home-clip-left" />
      <div className="home-clip-right" />

      <style>{`
        .home-clip-left {
          position: absolute;
          bottom: 0; left: 0;
          width: 30vw;
          max-width: 320px;
          min-width: 120px;
          height: clamp(28px, 3.5vw, 48px);
          background: var(--color-body);
          z-index: 5;
          clip-path: polygon(0 0, 55% 0, 100% 100%, 0% 100%);
        }
        .home-clip-right {
          position: absolute;
          bottom: 0; right: 0;
          width: 30vw;
          max-width: 320px;
          min-width: 120px;
          height: clamp(28px, 3.5vw, 48px);
          background: var(--color-body);
          z-index: 5;
          clip-path: polygon(47% 0, 100% 0, 100% 100%, 0% 100%);
        }
        @media (min-width: 360px) {
          .xs\\:text-\\[2\\.25rem\\] { font-size: 2.25rem !important; }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;