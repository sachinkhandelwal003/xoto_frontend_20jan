"use client";

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";

import whatsappIcon from "../../assets/icons/Homeicons/whatsapp-svgrepo-com (2) 1.png";
import chatIcon from "../../assets/icons/Homeicons/chat-svgrepo-com 1.png";
import facebookIcon from "../../assets/icons/Homeicons/facebook-f 1.png";
import instagramIcon from "../../assets/icons/Homeicons/instagram 1.png";
import twitterIcon from "../../assets/icons/Homeicons/twitter 1.png";
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

  const toggle = (id) => setOpen(open === id ? null : id);

  const offerings = t("offerings", { returnObjects: true });
  const resources = t("resources", { returnObjects: true });
  const knowledge = t("knowledge", { returnObjects: true });
  const company = t("company", { returnObjects: true });

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
  <a href="https://www.facebook.com/profile.php?id=61573697300861" target="_blank" rel="noopener noreferrer">
    <img 
      src={facebookIcon} 
      alt="Facebook" 
      className="w-[22px] h-[22px] cursor-pointer hover:scale-110 transition-transform" 
    />
  </a>

  {/* Instagram */}
  <a href="https://www.instagram.com/xotohome/" target="_blank" rel="noopener noreferrer">
    <img 
      src={instagramIcon} 
      alt="Instagram" 
      className="w-[22px] h-[22px] cursor-pointer hover:scale-110 transition-transform" 
    />
  </a>

  {/* Twitter */}
  <a href="https://www.linkedin.com/company/xotouae/?viewAsMember=true" target="_blank" rel="noopener noreferrer">
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
    onClick={() => window.open("https://wa.me/+971509180967", "_blank")}
    className="w-[53px] h-[53px] rounded-full bg-[#03A4F4] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
  >
    <img src={whatsappIcon} alt="WhatsApp" className="w-[32px] h-[32px]" />
  </div>

  {/* --- SMS / Chat Button --- */}
  <div
    onClick={() => (window.location.href = "sms:+919785408712")}
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

        <Accordion
          title={t("titles.knowledge")}
          isOpen={open === 3}
          toggle={() => toggle(3)}
        >
          {knowledge.map((i, k) => (
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

       {/* Partner Ecosystem */}
<div>
  <h4 className="font-bold text-[24px] mb-4">
    {t("titles.resources")}
  </h4>
  {resources.map((i, k) => (
    <Link 
      key={k} 
      to={i.path} 
      className="block mb-2 text-white/70"
    >
      {i.label}
    </Link>
  ))}
</div>

          <div>
            <h4 className="font-bold text-[24px] mb-4">
              {t("titles.knowledge")}
            </h4>
            {knowledge.map((i, k) => (
              <Link 
                key={k} 
                to={i.path}
                className="block mb-2 text-white/70"
              >
                {i.label}
              </Link>
            ))}
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
            <a href="https://www.facebook.com/profile.php?id=61573697300861" target="_blank" rel="noopener noreferrer">
              <img src={facebookIcon} className="w-[24px]" />
            </a>
            <a href="https://www.instagram.com/xotohome/" target="_blank" rel="noopener noreferrer">
              <img src={instagramIcon} className="w-[24px]" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <img src={twitterIcon} className="w-[24px]" />
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
    </footer>
  );
}
