import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import dubaiImg from "../../assets/img/home/popup.png";

const INACTIVITY_DELAY = 20000;
// const SCROLL_THRESHOLD = 25;

const PopupManager = () => {
  const navigate = useNavigate();
  const [popupVisible, setPopupVisible] = useState(false);
  const timerRef = useRef(null);
  const scrollCountRef = useRef(0);
  const isVisibleRef = useRef(false);
  const hasShownRef = useRef(false);

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "",
    countryCode: "+971", phone: "", message: "",
  });

const showPopup = () => {
  if (hasShownRef.current) return; // 🚫 already shown

  hasShownRef.current = true;
  isVisibleRef.current = true;

  clearTimeout(timerRef.current);
  setPopupVisible(true);
};

  const startInactivityTimer = () => {
    clearTimeout(timerRef.current);
    if (isVisibleRef.current) return;
    timerRef.current = setTimeout(showPopup, INACTIVITY_DELAY);
  };

  const handleActivity = () => {
    if (isVisibleRef.current) return;
    startInactivityTimer();
  };
const handleScroll = () => {
  if (hasShownRef.current) return;
  
  scrollCountRef.current += 1;        // har scroll pe +1
  
  if (scrollCountRef.current >= 100) {  // 100 scroll ke baad} 
    showPopup();     
  }
};

  useEffect(() => {
  const activityEvents = ["mousemove", "mousedown", "keypress", "touchstart"];
  activityEvents.forEach((e) => window.addEventListener(e, handleActivity));
  window.addEventListener("scroll", handleScroll);  // ✅ uncommented
  startInactivityTimer();
  return () => {
    clearTimeout(timerRef.current);
    activityEvents.forEach((e) => window.removeEventListener(e, handleActivity));
    window.removeEventListener("scroll", handleScroll);  // ✅ uncommented
  };
}, []);

  const handleClose = () => {
   setPopupVisible(false);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    handleClose();
  };

  if (!popupVisible) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        onClick={handleClose}
      >
        <div
          className="relative w-full max-w-205 flex flex-col sm:flex-row rounded-[5px] overflow-hidden shadow-2xl animate-fadeIn border-2 border-[#115a81] bg-white my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-md flex items-center justify-center text-gray-700 hover:bg-gray-100 transition text-sm font-bold shadow"
          >
            ✕
          </button>

          {/* TOP on mobile / RIGHT on desktop: Image */}
        <div className="w-full sm:w-[50%] sm:order-2 relative font-['DM_Sans'] h-62.5 sm:h-auto sm:min-h-120">
  <img
    src={dubaiImg}
    alt="Hot Property Deals"
    className="absolute inset-0 w-full h-full object-cover"
  />
  <div className="absolute inset-0 bg-black/40 sm:hidden" />
            <div className="absolute inset-0" />
            <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 text-white">
              <p className="text-[28px] font-semibold uppercase leading-tight tracking-wide">
                HOT PROPERTY DEALS
              </p>
              <p className="text-[14px] font-semibold text-white/80">
                Ready-to-move &amp; high ROI options
              </p>
              <button
                onClick={() => { handleClose(); navigate("/Property#buy3"); }}
                className="mt-4 mb-4.75 cursor-pointer w-full border border-white h-9 rounded-lg py-1.5 text-[16.77px] leading-[16.77px] bg-white text-[#5C039B]"
              >
                View Now
              </button>
            </div>
          </div>

          {/* BOTTOM on mobile / LEFT on desktop: Form */}
          <div className="w-full sm:w-[50%] sm:order-1 bg-white p-5 sm:p-8 flex flex-col justify-center font-['DM_Sans']">
            <h2 className="text-3xl sm:text-[40px] font-black leading-tight sm:leading-10.25 text-black flex flex-col justify-center mb-1">
              <span>Not Sure Where</span>
              <span>To Start?</span>
            </h2>
            <p className="text-gray-600 text-sm sm:text-base font-bold mb-4 sm:mb-6">
              We are here to help.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 sm:gap-3">
              <div className="flex gap-2 sm:gap-3 text-gray-600">
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="First Name*"
                  required
                  className="min-w-0 flex-1 border rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm focus:outline-none"
                  style={{ borderColor: '#115a81' }}
                />
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                  className="min-w-0 flex-1 border rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm focus:outline-none"
                  style={{ borderColor: '#115a81' }}
                />
              </div>

              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email address"
                className="w-full box-border border text-gray-600 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm focus:outline-none"
                style={{ borderColor: '#115a81' }}
              />

              <div className="flex gap-2 text-gray-600">
                <select
                  name="countryCode"
                  value={form.countryCode}
                  onChange={handleChange}
                  className="shrink-0 border rounded-lg px-1.5 sm:px-2 py-2 text-xs sm:text-sm focus:outline-none bg-white"
                  style={{ borderColor: '#115a81', width: 'clamp(88px, 33%, 120px)' }}
                >
                  <option value="+971">🇦🇪 +971</option>
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+966">🇸🇦 +966</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+1">🇺🇸 +1</option>
                </select>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone*"
                  required
                  className="min-w-0 flex-1 border rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm focus:outline-none"
                  style={{ borderColor: '#115a81' }}
                />
              </div>

              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Your message*"
                rows={3}
                required
                className="w-full box-border border text-gray-600 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm focus:outline-none resize-none"
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
  );
};

export default PopupManager;