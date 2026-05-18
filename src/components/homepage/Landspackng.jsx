import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import interiorImage from "../../assets/img/interior.jpg";
import interImage from "../../assets/img/inter.png";
import wave2 from "../../assets/img/wave/wave2.png";

import {
  TreePine,
  Home,
  Droplets,
  Sparkles,
} from "lucide-react";
import Landhero from "./Landhero"
import Interactive from "./Interactive"
import Dreamspacking from "./Dreamspacking";
import Eco from "./Eco";
import Servicelandspacing from "./Servicelandspacing";
import Consultation from "./Consultation";
import TestimonialsSection from "../Service/Fifth";
import QuoteModal from "../modal/QuoteModal";

export default function Landspackng() {
  const { t } = useTranslation(["scape1", "scape2"]);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);

  /* ================= SERVICES ================= */
  const services = [
    {
      icon: <TreePine className="w-5 h-5" />,
      title: t("services.design", { ns: "scape1" }),
    },
    {
      icon: <Home className="w-5 h-5" />,
      title: t("services.hardscape", { ns: "scape1" }),
    },
  ];  

  const services2 = [
    {
      icon: <Droplets className="w-5 h-5" />,
      title: t("services.pool", { ns: "scape1" }),
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: t("services.outdoor", { ns: "scape1" }),
    },
  ];

  return (
    <>
      <QuoteModal
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
      />
      <Landhero/>
        <Interactive/>
   
      {/* ================= OTHER SECTIONS ================= */}
      <Consultation />
          
      <Servicelandspacing />
      <Dreamspacking />
      <TestimonialsSection />
      <Eco />
    </>
  );
}
