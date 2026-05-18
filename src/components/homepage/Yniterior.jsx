"use client";
// import Eco from './Eco';

import React from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  X,
  Star,
  Fan,
  ArrowUp,
} from "lucide-react";
import heImage from "../../assets/img/he.png";
import helloImage from "../../assets/img/hello.jpg";
import fourthImage from "../../assets/img/fourth.jpg";
import mainbgImage from "../../assets/img/mainbg.jpg";
import exploreoneImage from "../../assets/img/exploreone.png";
import exploretwoImage from "../../assets/img/exploretwo.png";
import explorethreeImage from "../../assets/img/explorethree.png";
import lasttImage from "../../assets/img/lastt.jpg";
import Dreamspacking from "./Dreamspacking";
import Eco1 from "./Eco1";
import bbImage from "../../assets/img/bb.png";
import Fifth from "../Service/Fifth";
import Builder from "../interior/Builder";
import Book from "../interior/Book"
import Ourport from "../interior/Ourport";
import Consultation from "./Consultation";
import yyyImage from "../../assets/img/yyy.png";
import HeroSectionInterior from "../interior/HeroSectionInterior";
export default function App() {
  return (
    <>
      {/* ────────────────────── HERO SECTION ────────────────────── */}
      <HeroSectionInterior />

      {/* ────────────────────── INTERACTIVE BUILDER ────────────────────── */}
      <Builder />

      {/* ────────────────────── BOOK CONSULTATION ────────────────────── */}
      {/* <Book /> */}
            <Book />
      {/* ────────────────────── OUR SERVICES PORTFOLIO ────────────────────── */}
      <Ourport />

      {/* ────────────────────── EXPLORE DREAM SPACES ────────────────────── */}
      <Dreamspacking />
      {/* ────────────────────── CLIENT TESTIMONIALS (STATIC + PROFESSIONAL) ────────────────────── */}
      <Fifth />
      {/* last sectionm */}
      <Eco1 />
    </>
  );
}
