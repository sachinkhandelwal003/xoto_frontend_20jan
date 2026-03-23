import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowLeft, FiShoppingCart, FiHeart, FiShare2,
  FiStar, FiTruck, FiShield, FiRefreshCw,
  FiMinus, FiPlus, FiCheck, FiChevronLeft, FiChevronRight,
  FiTag, FiPackage, FiInfo,
} from "react-icons/fi";
import { apiService } from "../../manageApi/utils/custom.apiservice";
import { toast } from "react-toastify";

/* ─────────────────────────────────────────────────
   SKELETON LOADER
───────────────────────────────────────────────── */
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

/* ---------- COLOR MAP ---------- */
const COLOR_MAP = {
  "Natural Oak": "#D2B48C",
  "Walnut Brown": "#5D4037",
  "White Wash": "#F5F5F5",
  "Black": "#000000",
  "Grey": "#808080",
  "Beige": "#F5F5DC",
  "Beige/White": "#F5F5DC",
};

export default ProductDetail;