"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, ChevronRight, ChevronDown } from "lucide-react";
import { FaUsers, FaChartLine, FaUserTie, FaRobot } from "react-icons/fa";
import huuuImage from "../../assets/img/huuu.png";
import Partner from "../../components/Ecosystem/Partner";
import Built from "../../components/Ecosystem/Built";
import Join from "../Ecosystem/Join";
import Our from "../Ecosystem/Our";
import Grow from "../../components/Ecosystem/Grow";
import { Link } from "react-router-dom";

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
    console.log("Form submitted:", formData);
  };

  /* ---------- Partner Ecosystem Data ---------- */
  const partners = [
    t("partners.item"),
    t("partners.item"),
    t("partners.item"),
    t("partners.item"),
    t("partners.item"),
    t("partners.item"),
  ];

  return (
    <>
      {/* ================= HERO SECTION ================= */}
      <section className="relative w-full ">
        {/* Black Overlay */}
        <div className="absolute inset-0 bg-black/40 z-[5]"></div>

        {/* Bottom Decorative Shapes */}
        <div className="lg:block absolute bottom-0 left-0 w-70 h-10 bg-white z-[5] clip-left-shape"></div>
        <div className="lg:block absolute bottom-0 right-0 w-70 h-10 bg-white z-[5] clip-right-shape"></div>

        <style>{`
          .clip-left-shape {
            clip-path: polygon(0 0, 55% 0, 100% 100%, 0% 100%);
          }
          .clip-right-shape {
            clip-path: polygon(47% 0, 100% 0, 100% 100%, 0% 100%);
          }
        `}</style>

        {/* Background Image */}
        <img
          src={huuuImage}
          alt="Hero Background"
          className="w-full h-[500px] object-cover object-center"
        />

        {/* Content */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center h-full px-6 text-center text-white">
          <h1 className="heading-light font-semibold">
            {t("hero.title")}
          </h1>

          <p className="mt-4 text-lg md:text-xl max-w-3xl paragraph-light">
            {t("hero.subtitle")}
          </p>

          <Link
            to="/login"
            className="mt-8 px-8 py-3 bg-[var(--color-primary)] text-white  rounded-lg shadow-lg transition-all duration-300 flex items-center gap-2"
          >
            {t("hero.cta")}
          </Link>
        </div>
      </section>

      {/* ================= WHY PARTNER SECTION ================= */}
      <Partner />

      {/* ================= BUILT FOR EVERY STAKEHOLDER ================= */}
      <Built />

      {/* ================= OUR PARTNER ECOSYSTEM ================= */}
      <Join />

      {/* ================= JOIN XOTO PARTNER ECOSYSTEM ================= */}
      <Our />

      {/* ================= GROW. EARN. XOTO ================= */}
      <Grow />
    </>
  );
}
