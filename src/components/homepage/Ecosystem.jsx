"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import huuuImage from "../../assets/img/huuu.png";
import Partner from "../../components/Ecosystem/Partner";
import Built from "../../components/Ecosystem/Built";
import Join from "../Ecosystem/Join";
import Our from "../Ecosystem/Our";
import Grow from "../../components/Ecosystem/Grow";

const dmSans = { fontFamily: "'DM Sans', sans-serif" };

export default function XotoLandingPage() {
  const { t } = useTranslation("ecosystem");

  /* ---------- Join Form State ---------- */
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    stakeholder: "",
    contact: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
  };

  return (
    <div style={dmSans}>
      {/* ================= HERO SECTION ================= */}
      {/* FIX: min-h-[60vh] for mobile and md:min-h-[80vh] for desktop */}
      <section className="relative w-full min-h-[60vh] md:min-h-[80vh] flex flex-col items-center justify-center overflow-hidden">
        
        {/* Background Image - Absolute to cover container */}
        <img
          src={huuuImage}
          alt="Hero Background"
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
        />

        {/* Black Overlay */}
        <div className="absolute inset-0 bg-black/50 z-[1]"></div>

        {/* Bottom Decorative Shapes */}
        <div className="clip-left-shape z-[3]"></div>
        <div className="clip-right-shape z-[3]"></div>

        <style>{`
          .clip-left-shape {
            position: absolute;
            bottom: -1px; left: 0;
            width: 30vw;
            max-width: 320px;
            min-width: 120px;
            height: clamp(28px, 3.5vw, 48px);
            background: white;
            clip-path: polygon(0 0, 55% 0, 100% 100%, 0% 100%);
          }
          .clip-right-shape {
            position: absolute;
            bottom: -1px; right: 0;
            width: 30vw;
            max-width: 320px;
            min-width: 120px;
            height: clamp(28px, 3.5vw, 48px);
            background: white;
            clip-path: polygon(47% 0, 100% 0, 100% 100%, 0% 100%);
          }
        `}</style>

        {/* Content Container */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center text-white">
          
          {/* FIX: Title with Clamp for fluid typography */}
          <h1 
            className="heading-light font-semibold drop-shadow-lg leading-[1.15]" 
            style={{ fontSize: 'clamp(30px, 5vw, 54px)' }}
          >
            {t("hero.title")}
          </h1>

          {/* FIX: Responsive subtitle size */}
          <p className="mt-4 sm:mt-6 text-sm sm:text-lg md:text-xl max-w-3xl  drop-shadow-md px-2 opacity-90">
            {t("hero.subtitle")}
          </p>

          {/* CTA Button */}
          <Link
            to="/login"
            className="mt-8 px-6 sm:px-10 py-3 sm:py-4 bg-transparent border-2 text-white font-semibold rounded-xl shadow-xl transition-all duration-300 hover:bg-[#5C039B] hover:text-white hover:border-[#5C039B] hover:scale-105 flex items-center gap-2 text-sm sm:text-base"
          >
            {t("hero.cta")}
          </Link>
        </div>
      </section>

      {/* ================= OTHER SECTIONS ================= */}
      <Partner />
      <Built />
      <Join />
      <Our />
      <Grow />
    </div>
  );
}