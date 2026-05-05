"use client";
import { apiService } from "../../manageApi/utils/custom.apiservice";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";

import whatsappIcon from "../../assets/icons/Homeicons/whatsapp-svgrepo-com (2) 1.png";
import chatIcon from "../../assets/icons/Homeicons/chat-svgrepo-com 1.png";
import facebookIcon from "../../assets/icons/Homeicons/facebook-f 1.png";
import instagramIcon from "../../assets/icons/Homeicons/instagram 1.png";
import twitterIcon from "../../assets/icons/Homeicons/twitterlogoooo.png";
import linkedinIcon from "../../assets/icons/Homeicons/linkedin 1.png";
import logoNewImage from "../../assets/img/logoNew.png";

/* ---------------- ACCORDION ---------------- */
const Accordion = ({ title, children, isOpen, toggle }) => (
  <div className="border-b border-purple-500/20 py-2">
    <button
      onClick={toggle}
      className="w-full flex justify-between items-center py-3 text-white text-lg"
    >
      {title}
      <ChevronDown
        className={`transition-transform ${
          isOpen ? "rotate-180" : "rotate-0"
        }`}
      />
    </button>
    <div
      className={`overflow-hidden transition-all duration-300 ${
        isOpen ? "max-h-96 mt-2" : "max-h-0"
      }`}
    >
      {children}
    </div>
  </div>
);

/* ---------------- FOOTER ---------------- */
export default function Footer() {
  const { t } = useTranslation("footer");
  const [open, setOpen] = useState(null);

  const [feedbackModal, setFeedbackModal] = useState(false);
const [feedbackLoading, setFeedbackLoading] = useState(false);
const [feedbackForm, setFeedbackForm] = useState({
  full_name: "", email: "", feedback_type: "",
  overall_experience: null, feedback_text: "",
  page_or_feature: "", agreed_to_terms: false,
});
const [feedbackErrors, setFeedbackErrors] = useState({});
const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const toggle = (id) => setOpen(open === id ? null : id);

  const offerings = t("offerings", { returnObjects: true });
  const resources = t("resources", { returnObjects: true });
  const knowledge = t("knowledge", { returnObjects: true });
  const company = t("company", { returnObjects: true });

  const handleFeedbackChange = (e) => {
  const { name, value, type, checked } = e.target;
  setFeedbackForm((prev) => ({
    ...prev,
    [name]: type === "checkbox" ? checked : value,
  }));
  if (feedbackErrors[name]) setFeedbackErrors((prev) => ({ ...prev, [name]: "" }));
};

const validateFeedback = () => {
  const errs = {};
  if (!feedbackForm.full_name.trim()) errs.full_name = "Full name is required";
  if (!feedbackForm.email.trim()) errs.email = "Email is required";
  else if (!/\S+@\S+\.\S+/.test(feedbackForm.email)) errs.email = "Invalid email";
  if (!feedbackForm.feedback_type) errs.feedback_type = "Please select a category";
  if (!feedbackForm.overall_experience) errs.overall_experience = "Please rate your experience";
  if (!feedbackForm.feedback_text.trim()) errs.feedback_text = "Feedback is required";
  else if (feedbackForm.feedback_text.trim().length < 20) errs.feedback_text = "Minimum 20 characters";
  if (!feedbackForm.agreed_to_terms) errs.agreed_to_terms = "You must agree to continue";
  setFeedbackErrors(errs);
  return Object.keys(errs).length === 0;
};

const handleFeedbackSubmit = async (e) => {
  e.preventDefault();
  if (!validateFeedback()) return;
  setFeedbackLoading(true);
  try {
    const res = await apiService.post("/feedback/submit", {
      full_name: feedbackForm.full_name.trim(),
      email: feedbackForm.email.toLowerCase().trim(),
      feedback_type: feedbackForm.feedback_type,
      overall_experience: Number(feedbackForm.overall_experience),
      feedback_text: feedbackForm.feedback_text.trim(),
      page_or_feature: feedbackForm.page_or_feature?.trim() || null,
      agreed_to_terms: feedbackForm.agreed_to_terms,
    });
if (res.success) {
  setFeedbackModal(false);  // ← turant band
  setFeedbackForm({
    full_name: "", email: "", feedback_type: "",
    overall_experience: null, feedback_text: "",
    page_or_feature: "", agreed_to_terms: false,
  });
      setTimeout(() => { setFeedbackSuccess(false); setFeedbackModal(false); }, 3000);
    }
  } catch (err) {
    setFeedbackErrors({ submit: err.response?.data?.message || "Submission failed. Try again." });
  } finally {
    setFeedbackLoading(false);
  }
};

useEffect(() => {
  if (feedbackModal) {
    document.body.style.overflow = "hidden";  // modal open → scroll band
  } else {
    document.body.style.overflow = "";         // modal band → scroll wapas
  }
  return () => {
    document.body.style.overflow = "";         // cleanup on unmount
  };
}, [feedbackModal]);

  return (
    <footer className="main-gradient-color text-white relative">
      {/* ================= MOBILE TOP ================= */}
      <div className="relative text-center pt-10 lg:hidden px-6">
        <img src={logoNewImage} className="h-16 mx-auto" alt="Xoto" />

        <p
          className="text-lg font-bold mt-2"
          dangerouslySetInnerHTML={{ __html: company.slogan }}
        />

        <p className="text-purple-200 mt-2 text-sm">
          {company.description}
        </p>

        {/* Mobile Social Icons */}
      <div className="flex justify-center gap-7 mt-4 py-5">
  {/* Facebook */}
  <a href="https://www.facebook.com/xotouae1" target="_blank" rel="noopener noreferrer">
    <img 
      src={facebookIcon} 
      alt="Facebook" 
      className="w-[22px] h-[22px] cursor-pointer hover:scale-110 transition-transform" 
    />
  </a>

  {/* Instagram */}
  <a href=" https://www.instagram.com/xotoproptech/" target="_blank" rel="noopener noreferrer">
    <img 
      src={instagramIcon} 
      alt="Instagram" 
      className="w-[22px] h-[22px] cursor-pointer hover:scale-110 transition-transform" 
    />
  </a>

  {/* Twitter */}
  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
    <img 
      src={twitterIcon} 
      alt="Twitter" 
      className="w-[22px] h-[22px] cursor-pointer hover:scale-110 transition-transform" 
    />
  </a>

  {/* LinkedIn */}
  <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
    <img 
      src={linkedinIcon} 
      alt="LinkedIn" 
      className="w-[22px] h-[22px] cursor-pointer hover:scale-110 transition-transform" 
    />
  </a>
</div>

        {/* Floating WhatsApp + Chat */}
       <div className="absolute right-2 top-12 flex flex-col gap-[14px]">
  {/* --- WhatsApp Button --- */}
  <div
    onClick={() => window.open("https://wa.me/+971500888690", "_blank")}
    className="w-[53px] h-[53px] rounded-full bg-[#03A4F4] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
  >
    <img src={whatsappIcon} alt="WhatsApp" className="w-[32px] h-[32px]" />
  </div>

  {/* --- SMS / Chat Button --- */}
  <div
    onClick={() => (window.location.href = "sms:+971500888690")}
    className="w-[53px] h-[53px] rounded-full bg-[#32CD32] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
  >
    <img src={chatIcon} alt="Chat" className="w-[28px] h-[28px]" />
  </div>
</div>
      </div>

      {/* ================= MOBILE ACCORDIONS ================= */}
      <div className="px-6 lg:hidden mt-10">
        <Accordion
          title={t("titles.offerings")}
          isOpen={open === 1}
          toggle={() => toggle(1)}
        >
          {offerings.map((i, k) => (
            <Link
              key={k}
              to={i.path}
              className="block text-purple-200 text-sm font-bold py-1 hover:text-white"
            >
              {i.label}
            </Link>
          ))}
        </Accordion>

        <Accordion
          title={t("titles.resources")}
          isOpen={open === 2}
          toggle={() => toggle(2)}
        >
          {resources.map((i, k) => (
            <Link
              key={k}
              to={i.path}
              className="block text-purple-200 text-sm font-bold py-1 hover:text-white"
            >
              {i.label}
            </Link>
          ))}
        </Accordion>

<Accordion title={t("titles.knowledge")} isOpen={open === 3} toggle={() => toggle(3)}>
  {knowledge.map((i, k) =>
    i.label === "Submit Your Feedback" ? (
      <button
        key={k}
        onClick={() => { setOpen(null); setFeedbackModal(true); }}
        className="block text-purple-200 text-sm font-bold py-1 hover:text-white text-left w-full bg-transparent border-none cursor-pointer p-0"
      >
        {i.label}
      </button>
    ) : (
      <Link
        key={k}
        to={i.path}
        className="block text-purple-200 text-sm font-bold py-1 hover:text-white"
      >
        {i.label}
      </Link>
    )
  )}
</Accordion>

        <Accordion
          title={t("titles.location")}
          isOpen={open === 4}
          toggle={() => toggle(4)}
        >
          <Link
            to="/contact"
            className="block text-purple-200 text-sm hover:text-white"
          >
            {t("locations")}
          </Link>
        </Accordion>

        <Accordion
          title={t("titles.email")}
          isOpen={open === 5}
          toggle={() => toggle(5)}
        >
          <p className="text-purple-200 text-sm">
            {t("email.labels.partners")}:{" "}
            <span className="text-white">{t("email.partners")}</span>
          </p>
          <p className="text-purple-200 text-sm mt-1">
            {t("email.labels.customers")}:{" "}
            <span className="text-white">{t("email.customers")}</span>
          </p>



        </Accordion>
      </div>

      {/* ================= DESKTOP FOOTER ================= */}
      <div className="hidden lg:block max-w-screen-2xl mx-auto px-14 pt-20">
        <div className="grid grid-cols-5 gap-14 pb-10">
          <div>
            <img src={logoNewImage} className="w-[163px] h-[65px] mb-4" />
            <p
              className="font-bold text-[20px]"
              dangerouslySetInnerHTML={{ __html: company.slogan }}
            />
            <p className="mt-3 text-white/70">{company.description}</p>
          </div>

{/* Offerings */}
<div>
  <h4 className="font-bold text-[24px] mb-4">
    {t("titles.offerings")}
  </h4>
  {offerings.map((i, k) => (
    <Link 
      key={k} 
      to={i.path}  
      className="block mb-2 text-white/70 "
    >
      {i.label}
    </Link>
  ))}
</div>

<div>
  <h4 className="font-bold text-[24px] mb-4">
    {t("titles.resources")}
  </h4>

 {resources.map((i, k) => (
  <div key={k} className="mb-3">
    
    <Link
      to={i.path}
      className="text-white/70 inline-block relative"
    >
      {i.label}

      {i.comingSoon && (
        <span className="absolute top-1/2 -translate-y-1/2 left-full ml-0.5 text-[7px] font-bold bg-[#F5D7C8] text-black px-3 py-[2px] rounded-full shadow-sm uppercase whitespace-nowrap">
          {t("coming soon")}
        </span>
      )}

    </Link>

  </div>
))}
</div>


         <div>
  <h4 className="font-bold text-[24px] mb-4">
    {t("titles.knowledge")}
  </h4>
  {knowledge.map((i, k) =>
    i.label === "Submit Your Feedback" ? (
      <button
        key={k}
        onClick={() => setFeedbackModal(true)}
        className="block mb-2 text-white/70 hover:text-white text-left w-full bg-transparent border-none cursor-pointer p-0"
      >
        {i.label}
      </button>
    ) : (
      <Link
        key={k}
        to={i.path}
        className="block mb-2 text-white/70"
      >
        {i.label}
      </Link>
    )
  )}
</div>

          <div>
            <h4 className="font-bold text-[24px] mb-4">
              {t("titles.location")}
            </h4>
            <Link to="/contact">{t("locations")}</Link>

            <h4 className="mt-6 mb-2 font-bold">{t("titles.email")}</h4>

            <p>
              {t("email.labels.partners")}:{" "}
              <strong>{t("email.partners")}</strong>
            </p>
            <p>
              {t("email.labels.customers")}:{" "}
              <strong>{t("email.customers")}</strong>
            </p>

<div className="absolute right-6 bottom-35 flex flex-col gap-[14px] ">
  
  <div
    onClick={() => window.open("https://wa.me/971500888690", "_blank")}
    className="w-[38px] h-[38px] rounded-full bg-[#03A4F4] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
  >
    <img src={whatsappIcon} alt="WhatsApp" className="w-[21px] h-[21px]" />
  </div>

  <div
    onClick={() => (window.location.href = "sms:+971500888690")}
    className="w-[38px] h-[38px] rounded-full bg-[#32CD32] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
  >
    <img src={chatIcon} alt="Chat" className="w-[21px] h-[21px]" />
  </div>
</div>

</div>

            
          </div>
        </div>
      

      {/* ================= COPYRIGHT ================= */}
      <div className="border-t py-10 border-purple-500/20">
        <div className="hidden lg:flex justify-between max-w-screen-2xl mx-auto px-24">
          <p className="text-white/50">
            {t("bottom.copyright")}
          </p>

          <div className="flex gap-10">
            <a href="https://www.facebook.com/xotouae" target="_blank" rel="noopener noreferrer">
              <img src={facebookIcon} className="w-[24px]" />
            </a>
            <a href=" https://www.instagram.com/xotoproptech/" target="_blank" rel="noopener noreferrer">
              <img src={instagramIcon} className="w-[24px]" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <img src={twitterIcon} className="w-[24px] " />
            </a>
            <a href="https://www.linkedin.com/company/xotouae/?viewAsMember=true" target="_blank" rel="noopener noreferrer">
              <img src={linkedinIcon} className="w-[24px]" />
            </a>
          </div>
        </div>

        <div className="lg:hidden text-center text-white/50 text-sm">
          {t("bottom.copyright")}
        </div>
      </div>
       {feedbackModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          onClick={() => setFeedbackModal(false)}
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setFeedbackModal(false)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center text-white hover:scale-110 transition-all shadow-lg"
              style={{ background: "linear-gradient(135deg,#ef4444,#ec4899)" }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="p-6 text-center text-white shrink-0" style={{ background: "#5C039B" }}>
              <h2 className="text-2xl font-bold mb-1">Submit Your Feedback</h2>
              <p className="text-purple-200 text-sm">We'd love to hear what you think!</p>
            </div>

            {/* Form */}
            <div className="p-6 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#5C039B #f3e8ff" }}>

              {feedbackSuccess && (
                <div className="mb-4 p-4 rounded-xl text-center text-white font-semibold" style={{ background: "#5C039B" }}>
                  ✅ Thank you! Your feedback has been submitted.
                </div>
              )}

              {feedbackErrors.submit && (
                <div className="mb-4 p-3 rounded-xl text-red-600 bg-red-50 text-sm text-center">
                  {feedbackErrors.submit}
                </div>
              )}

              <p className="text-xs text-gray-400 mb-4">Fields marked <span className="text-red-500">*</span> are required</p>

              <form onSubmit={handleFeedbackSubmit} className="space-y-4">

                {/* Full Name */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Full name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="full_name"
                    value={feedbackForm.full_name}
                    onChange={handleFeedbackChange}
                    placeholder="e.g. Sarah Ahmed"
                    className="fb-input"
                    style={{ borderColor: feedbackErrors.full_name ? "#ef4444" : "#d1d5db" }}
                  />
                  {feedbackErrors.full_name && <p className="text-red-500 text-xs mt-1">{feedbackErrors.full_name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Email address <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={feedbackForm.email}
                    onChange={handleFeedbackChange}
                    placeholder="you@example.com"
                    className="fb-input"
                    style={{ borderColor: feedbackErrors.email ? "#ef4444" : "#d1d5db" }}
                  />
                  <p className="text-gray-400 text-xs mt-1">So we can follow up if needed. We won't share your email.</p>
                  {feedbackErrors.email && <p className="text-red-500 text-xs mt-1">{feedbackErrors.email}</p>}
                </div>

                {/* Feedback Type */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Feedback type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="feedback_type"
                    value={feedbackForm.feedback_type}
                    onChange={handleFeedbackChange}
                    className="fb-input"
                    style={{ borderColor: feedbackErrors.feedback_type ? "#ef4444" : "#d1d5db" }}
                  >
                    <option value="">Select a category...</option>
                    <option value="general_feedback">General feedback</option>
                    <option value="bug_report">Bug report</option>
                    <option value="feature_request">Feature request</option>
                    <option value="complaint">Complaint</option>
                    <option value="compliment">Compliment</option>
                  </select>
                  {feedbackErrors.feedback_type && <p className="text-red-500 text-xs mt-1">{feedbackErrors.feedback_type}</p>}
                </div>

                {/* Overall Experience */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Overall experience <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => {
                          setFeedbackForm((prev) => ({ ...prev, overall_experience: n }));
                          if (feedbackErrors.overall_experience)
                            setFeedbackErrors((prev) => ({ ...prev, overall_experience: "" }));
                        }}
                        className="w-10 h-10 rounded-lg border-2 font-semibold text-sm transition-all"
                        style={{
                          borderColor: feedbackForm.overall_experience === n ? "#5C039B" : "#d1d5db",
                          background: feedbackForm.overall_experience === n ? "#5C039B" : "white",
                          color: feedbackForm.overall_experience === n ? "white" : "#374151",
                        }}
                      >
                        {n}
                      </button>
                    ))}
                    <span className="text-xs text-gray-400 ml-1">1 = Poor · 5 = Excellent</span>
                  </div>
                  {feedbackErrors.overall_experience && <p className="text-red-500 text-xs mt-1">{feedbackErrors.overall_experience}</p>}
                </div>

                {/* Feedback Text */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Your feedback <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="feedback_text"
                    value={feedbackForm.feedback_text}
                    onChange={handleFeedbackChange}
                    rows={4}
                    placeholder="Tell us what you think — what worked, what didn't, or what you'd like to see improved."
                    className="fb-input resize-none"
                    style={{ borderColor: feedbackErrors.feedback_text ? "#ef4444" : "#d1d5db" }}
                  />
                  <p className="text-gray-400 text-xs mt-1">Minimum 20 characters.</p>
                  {feedbackErrors.feedback_text && <p className="text-red-500 text-xs mt-1">{feedbackErrors.feedback_text}</p>}
                </div>

                {/* Page or Feature */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Page or feature <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    name="page_or_feature"
                    value={feedbackForm.page_or_feature}
                    onChange={handleFeedbackChange}
                    placeholder="e.g. Checkout page, Search bar"
                    className="fb-input"
                  />
                  <p className="text-gray-400 text-xs mt-1">Helps us pinpoint the issue faster.</p>
                </div>

                {/* Checkbox */}
                <div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="agreed_to_terms"
                      checked={feedbackForm.agreed_to_terms}
                      onChange={handleFeedbackChange}
                      className="mt-1 w-4 h-4 cursor-pointer accent-[#5C039B]"
                    />
                    <span className="text-sm text-gray-600">
                      I agree that my feedback may be used to improve this service. View our{" "}
                      <a href="/privacy-policy" className="underline" style={{ color: "#5C039B" }}>Privacy Policy</a>.
                    </span>
                  </label>
                  {feedbackErrors.agreed_to_terms && <p className="text-red-500 text-xs mt-1">{feedbackErrors.agreed_to_terms}</p>}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={feedbackLoading}
                  className="w-full py-4 rounded-xl text-white font-bold text-[15px] flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:shadow-lg disabled:opacity-60"
                  style={{ background: "#5C039B" }}
                >
                  {feedbackLoading
                    ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : "Submit feedback ↗"
                  }
                </button>
              </form>
            </div>

            <style>{`
              .fb-input {
                width: 100%;
                padding: 0.65rem 0.9rem;
                border-radius: 0.5rem;
                border: 1.5px solid #d1d5db;
                background: white;
                outline: none;
                font-size: 13px;
                color: #1a1a2e;
                transition: border-color 0.2s, box-shadow 0.2s;
                font-family: inherit;
              }
              .fb-input:focus { border-color: #5C039B; box-shadow: 0 0 0 3px rgba(92,3,155,0.08); }
              .fb-input::placeholder { color: #b0a8c0; }
            `}</style>
          </div>
        </div>
      )}

    </footer>
  );
}
