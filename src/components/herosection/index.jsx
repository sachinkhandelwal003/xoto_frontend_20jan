import React from "react";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import calender from "../../assets/icons/Homeicons/Calendar.png";
import clock from "../../assets/icons/Homeicons/Clock.png";
import dubaiImg from "../../assets/img/home/popup.png";
import gurantee from "../../assets/icons/Homeicons/Guarantee.png";
import map from "../../assets/icons/Homeicons/Map-pin.png";
import flag from "../../assets/img/home/flaggg1.png";
import layer from "../../assets/img/home/Layer1.png";
const icons = [gurantee, clock, map, calender];

const HeroSection = () => {
  const { t } = useTranslation("home");

  const features = t("hero.features", { returnObjects: true });

   // ✅ CHANGE 3: Popup ka state aur timer logic add kiya
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
    {/* ✅ CHANGE 4: Popup JSX add kiya — baaki section mein kuch nahi badla */}
      {popupVisible && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4"
            onClick={() => setPopupVisible(false)}
          >
            <div
              className="relative w-full max-w-[820px] flex rounded-xl overflow-hidden shadow-2xl animate-fadeIn"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setPopupVisible(false)}
                className="absolute top-3 right-3 z-10 w-8 h-8  bg-white rounded-md flex items-center justify-center text-gray-700 hover:bg-gray-100 transition text-sm font-bold shadow"
              >
                ✕
              </button>
 
              {/* LEFT: Form */}
              <div className="w-full md:w-[50%] bg-white p-8 flex flex-col justify-center font-['DM_Sans']">
                <h2 className="text-[40px] font-['DM_Sans']  text-black  mb-1 tracking-normal align-middle">
                  
                  Not Sure Where <br /> To Start?
                </h2>
                <p className="text-gray-600 text-base font-bold mb-6">
                  We are here to help.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <div className="flex gap-3 text-gray-600">
                    <input name="firstName" value={form.firstName} onChange={handleChange}
                      placeholder="First Name*" required
                      className="w-1/2 border border-gray-400 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#5C039B]" />
                    <input name="lastName" value={form.lastName} onChange={handleChange}
                      placeholder="Last Name"
                      className="w-1/2 border border-gray-400 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#5C039B]" />
                  </div>
                  <input name="email" type="email" value={form.email} onChange={handleChange}
                    placeholder="Email address"
                    className="w-full border border-gray-400 text-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#5C039B]" />
                  <div className="flex gap-2 text-gray-600">
                    <select name="countryCode" value={form.countryCode} onChange={handleChange}
                      className="w-[38%] border border-gray-400 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-[#5C039B] bg-white">
                      <option value="+971">🇦🇪 +971</option>
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+966">🇸🇦 +966</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+1">🇺🇸 +1</option>
                    </select>
                    <input name="phone" type="tel" value={form.phone} onChange={handleChange}
                      placeholder="Phone*" required
                      className="flex-1 border border-gray-400 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#5C039B]" />
                  </div>
                  <textarea name="message" value={form.message} onChange={handleChange}
                    placeholder="Your message*" rows={3} required
                    className="w-full border border-gray-400 text-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#5C039B] resize-none" />
                  <button type="submit"
                    className="w-full bg-[#5C039B] hover:bg-[#4a0280] text-white  py-2.5 rounded-lg transition text-lg mt-1">
                    Submit
                  </button>
                </form>
              </div>
 
              {/* RIGHT: Image */}
              <div className="hidden md:flex md:w-[50%] relative font-['DM_Sans'] ">
                <img src={dubaiImg} alt="Hot Property Deals" className="w-full h-full object-cover" />
                <div className="absolute inset-0 " />
                <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 text-white ">
                  <p className="text-[28px] font-semibold uppercase leading-tight tracking-wide text-[28px]">HOT PROPERTY DEALS</p>
                  <p className="text-[14px] font-semibold text-white/80 ">Ready-to-move &amp; high ROI options</p>
                  <button className="mt-4 mb-[19px] w-full border border-white h-[36px] rounded-lg py-1.5 text-[16.77px] leading-[16.77px] gap-[6.99px] bg-white text-[#5C039B]">
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



  {/* UAE FLAG - Exact Figma Specs */}
  <div className="absolute top-[1px] left-0 z-10 w-[200px] md:w-[334px] pointer-events-none">
    <img 
      src={flag} 
      alt="UAE Flag" 
      className="w-full h-auto object-contain opacity-100" 
      style={{ maxHeight: '361px' }}
    />
  </div>

  {/* 2. EXCLUSIVE DEALS (LAYER) - Exact Figma Specs */}
  <div className="absolute top-[-13px] right-0 z-10 w-[150px] md:w-[242px] pointer-events-none">
    

    
    <img 
      src={layer} 
      alt="Exclusive Deals" 
      className="w-full h-auto object-contain opacity-100"
      style={{ maxHeight: '258px' }}
    />
     
  </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 z-[1]" />
   {/* Background Video */}
      <video
        autoPlay
        loop 
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source
          src="https://xotostaging.s3.me-central-1.amazonaws.com/properties/1768043300370-mortgage2.mp4"
          type="video/mp4"
        />
      </video>

      {/* Content — fully centered */}
      <div className="relative z-[2] w-full max-w-6xl mx-auto lg:px-12 flex flex-col items-center text-center gap-10">
        
        <div className="w-full space-y-6">


          
          
          {/* Heading - Responsive wrapping (Mobile par wrap, Desktop par exactly 2 lines) */}
          <h1 className="heading-light w-full text-center leading-tight text-3xl sm:text-4xl md:text-5xl lg:text-6xl px-2 flex flex-col items-center">
            {/* First Line */}
            <span className="block">
              {t("hero.title1")}
            </span>
            {/* Second Line */}
            <span className="block">
              {t("hero.title2")}
            </span>
          </h1>
<div className="space-y-1">
          {/* Description */}
          <p className="block text-lg max-w-3xl mx-auto ">
            {t("hero.description")}
          </p>

          
          {/* Description2 */}
        <p className="block text-lg max-w-3xl mx-auto ">
            {t("hero.description2")}
          </p>

</div>
          {/* Buttons — centered */}
          <div className="pt-4 w-full">
            <div className="flex flex-wrap justify-center gap-4">

              {/* Loan Button */}
              <Link
                to="/mortgage/services"
                className="whitespace-nowrap w-auto text-center border border-white px-6 py-3 rounded-md hover:bg-[#5C039B] hover:text-white hover:border-[#5C039B] transition text-sm sm:text-base"
              >
                {t("hero.buttons.loan")}
              </Link>

              {/* Explore Button */}
              <Link
                to="/Property"
                className="whitespace-nowrap w-auto text-center border border-white px-6 py-3 rounded-md hover:bg-[#5C039B] hover:text-white hover:border-[#5C039B] transition text-sm sm:text-base"
              >
                {t("hero.buttons.explore")}
              </Link>

              {/* AI Planner Button */}
              <Link
                to="/aiPlanner"
                className="whitespace-nowrap w-auto text-center border border-white px-6 py-3 rounded-md hover:bg-[#5C039B] hover:text-white hover:border-[#5C039B] transition text-sm sm:text-base"
              >
                {t("hero.buttons.design")}
              </Link>

            </div>
          </div>

          {/* ✅ EXCLUSIVE DEAL BUTTON (Attractive Flickering/Pulsing Effect) */}
          {/* <div className="w-full flex justify-center pt-2"> 
            <Link 
              to="/properties"
              className="relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-semibold tracking-widest text-white uppercase bg-transparent border border-[#5C039B] rounded-full group cursor-pointer transition-all duration-300 hover:bg-[#5C039B]/40 hover:scale-105"
            >
              {/* Flashing glow on hover */}
              {/* <span className="absolute inset-0 w-full h-full bg-[#5C039B] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>

              <span className="relative flex items-center gap-3 text-sm sm:text-base drop-shadow-lg">
                <span className="animate-pulse">✨</span>
                Xoto Exclusive Deal
                <span className="animate-pulse">✨</span>
              </span>
            </Link>
          </div> */} 

          {/* Features — centered grid */}
          <div className="mt-8 mx-auto grid grid-cols-2 gap-8 w-fit">
            {features.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--color-primary)] rounded-full flex items-center justify-center flex-shrink-0">
                  <img src={icons[i]} className="w-5 h-5" alt="" />
                </div>
                <span className="font-semibold text-lg text-left">
                  {item.line1}
                  <br />
                  {item.line2}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Bottom decorative shapes */}
      <div className="absolute bottom-0 left-0 w-70 h-10 bg-[var(--color-body)] z-[5] clip-left-shape" />
      <div className="absolute bottom-0 right-0 w-70 h-10 bg-[var(--color-body)] z-[5] clip-right-shape" />

      {/* Clip path styles */}
      <style>{`
        .clip-left-shape {
          clip-path: polygon(0 0, 55% 0, 100% 100%, 0% 100%);
        }
        .clip-right-shape {
          clip-path: polygon(47% 0, 100% 0, 100% 100%, 0% 100%);
        }
      `}</style>
    </section>
  );
};

export default HeroSection;