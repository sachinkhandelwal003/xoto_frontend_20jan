import React, { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from "../../../../manageApi/utils/custom.apiservice";
import { showToast } from '../../../../manageApi/utils/toast';
import JoditEditor from 'jodit-react';
import DOMPurify from 'dompurify';
import moment from 'moment';
import Cropper from 'react-easy-crop';

import {
  Button, Modal, Form, Input, Popconfirm, Card,
  Typography, Avatar, Row, Col, Statistic, Space, Divider,
  message, notification, Tooltip, Grid, Tag, Select, Badge,
  Upload, Tabs, Alert, Switch, Slider, Skeleton, Empty
} from 'antd';
import {
  PlusOutlined, FileTextOutlined, DeleteOutlined,
  EditOutlined, SearchOutlined, CheckCircleOutlined, SyncOutlined,
  UserOutlined, PictureOutlined, EyeOutlined, ClockCircleOutlined,
  UndoOutlined, ScissorOutlined, ZoomInOutlined, BookOutlined, CalendarOutlined,
  RocketOutlined, FireOutlined, StarOutlined, TagOutlined, FilterOutlined,
  ArrowLeftOutlined, ArrowRightOutlined, SaveOutlined, GlobalOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;
const { TextArea } = Input;
const { TabPane } = Tabs;

// ─────────────────────────────────────────────
//  DESIGN TOKENS
// ─────────────────────────────────────────────
const THEME = {
  primary: "#6d28d9",
  primaryLight: "#8b5cf6",
  primaryDark: "#4c1d95",
  accent: "#f59e0b",
  success: "#10b981",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
  surface: "#ffffff",
  bg: "#f5f3ff",
  border: "#ede9fe",
  text: "#1e1b4b",
  muted: "#6b7280",
};
// j;basfjklsdbafljksdbfljsadbflkbb
// ─────────────────────────────────────────────
//  GLOBAL STYLES
// ─────────────────────────────────────────────
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,800;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  .bm-root * { box-sizing: border-box; }

  .bm-root {
    font-family: 'DM Sans', sans-serif;
    background: #ffffff;
    min-height: 100vh;
    padding: 32px;
    color: #1e1b4b;
  }

  /* ─── HEADER ─── */
  .bm-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 36px;
    flex-wrap: wrap;
    gap: 16px;
  }

  .bm-header-title {
    font-family: 'Playfair Display', serif !important;
    font-size: 34px !important;
    font-weight: 800 !important;
    color: #1e1b4b !important;
    margin: 0 !important;
    line-height: 1.2 !important;
  }

  .bm-header-sub {
    font-size: 14px;
    color: #6b7280;
    margin-top: 4px;
    font-weight: 400;
  }

  .bm-btn-primary {
    background: linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%) !important;
    border: none !important;
    height: 46px !important;
    padding: 0 28px !important;
    border-radius: 12px !important;
    font-weight: 600 !important;
    font-size: 14px !important;
    box-shadow: 0 4px 16px rgba(109, 40, 217, 0.35) !important;
    transition: all 0.2s ease !important;
  }
  .bm-btn-primary:hover {
    transform: translateY(-1px) !important;
    box-shadow: 0 6px 20px rgba(109, 40, 217, 0.45) !important;
  }

  /* ─── STATS ─── */
  .bm-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 28px;
  }

  @media (max-width: 900px) {
    .bm-stats { grid-template-columns: repeat(2, 1fr); }
    .bm-root { padding: 16px; }
  }
  @media (max-width: 500px) {
    .bm-stats { grid-template-columns: 1fr; }
  }

  .bm-stat-card {
    background: #fff;
    border-radius: 16px;
    padding: 20px 22px;
    border: 1.5px solid #ede9fe;
    position: relative;
    overflow: hidden;
    transition: box-shadow 0.2s, transform 0.2s;
  }
  .bm-stat-card:hover {
    box-shadow: 0 8px 32px rgba(109,40,217,0.10);
    transform: translateY(-2px);
  }
  .bm-stat-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    border-radius: 16px 16px 0 0;
  }
  .bm-stat-card.purple::before { background: linear-gradient(90deg, #6d28d9, #8b5cf6); }
  .bm-stat-card.green::before { background: linear-gradient(90deg, #059669, #10b981); }
  .bm-stat-card.amber::before { background: linear-gradient(90deg, #d97706, #f59e0b); }
  .bm-stat-card.blue::before { background: linear-gradient(90deg, #2563eb, #3b82f6); }

  .bm-stat-icon {
    width: 44px; height: 44px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
    margin-bottom: 12px;
  }
  .bm-stat-icon.purple { background: #ede9fe; color: #6d28d9; }
  .bm-stat-icon.green { background: #d1fae5; color: #059669; }
  .bm-stat-icon.amber { background: #fef3c7; color: #d97706; }
  .bm-stat-icon.blue { background: #dbeafe; color: #2563eb; }

  .bm-stat-value {
    font-family: 'Playfair Display', serif;
    font-size: 30px;
    font-weight: 800;
    color: #1e1b4b;
    line-height: 1;
    margin-bottom: 4px;
  }
  .bm-stat-label { font-size: 13px; color: #6b7280; font-weight: 500; }

  /* ─── FILTER BAR ─── */
  .bm-filters {
    background: #fff;
    border-radius: 16px;
    padding: 18px 22px;
    border: 1.5px solid #ede9fe;
    margin-bottom: 24px;
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: center;
  }

  .bm-filters .ant-input-affix-wrapper {
    border-radius: 10px !important;
    border-color: #ede9fe !important;
    height: 42px !important;
  }
  .bm-filters .ant-select-selector {
    border-radius: 10px !important;
    border-color: #ede9fe !important;
    height: 42px !important;
    align-items: center;
  }

  /* ─── BLOG CARD ─── */
  .bm-blog-card {
    background: #fff;
    border-radius: 18px;
    border: 1.5px solid #ede9fe;
    overflow: hidden;
    margin-bottom: 20px;
    transition: box-shadow 0.25s, transform 0.25s, border-color 0.25s;
    display: flex;
    min-height: 220px;
  }
  .bm-blog-card:hover {
    box-shadow: 0 12px 40px rgba(109,40,217,0.12);
    transform: translateY(-2px);
    border-color: #c4b5fd;
  }

  .bm-blog-thumb {
    width: 240px;
    min-width: 240px;
    background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
  }
  @media (max-width: 700px) {
    .bm-blog-card { flex-direction: column; }
    .bm-blog-thumb { width: 100%; min-width: unset; height: 180px; }
  }

  .bm-blog-thumb img {
    width: 100%; height: 100%; object-fit: cover;
    transition: transform 0.4s ease;
  }
  .bm-blog-card:hover .bm-blog-thumb img { transform: scale(1.04); }

  .bm-blog-thumb-placeholder {
    display: flex; align-items: center; justify-content: center;
    width: 100%; height: 100%;
    font-size: 48px; color: #c4b5fd;
  }

  .bm-blog-body {
    padding: 22px 26px;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .bm-blog-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }

  .bm-blog-badges { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }

  .bm-cat-tag {
    background: linear-gradient(135deg, #6d28d9, #8b5cf6) !important;
    color: #fff !important;
    border: none !important;
    border-radius: 20px !important;
    font-size: 11px !important;
    font-weight: 600 !important;
    padding: 2px 12px !important;
    letter-spacing: 0.3px;
  }

  .bm-status-badge {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 12px; font-weight: 600;
    padding: 3px 12px;
    border-radius: 20px;
  }
  .bm-status-badge.published { background: #d1fae5; color: #059669; }
  .bm-status-badge.draft { background: #fef3c7; color: #d97706; }

  .bm-blog-actions { display: flex; gap: 8px; }

  .bm-action-btn {
    width: 36px !important; height: 36px !important;
    border-radius: 10px !important;
    display: flex !important; align-items: center !important; justify-content: center !important;
    border: 1.5px solid #ede9fe !important;
    background: #faf5ff !important;
    color: #6d28d9 !important;
    font-size: 14px !important;
    transition: all 0.2s !important;
    cursor: pointer;
    padding: 0 !important;
  }
  .bm-action-btn:hover {
    background: #ede9fe !important;
    border-color: #c4b5fd !important;
  }
  .bm-action-btn.danger {
    background: #fff5f5 !important;
    border-color: #fecaca !important;
    color: #ef4444 !important;
  }
  .bm-action-btn.danger:hover {
    background: #fee2e2 !important;
    border-color: #f87171 !important;
  }

  .bm-blog-title {
    font-family: 'Playfair Display', serif;
    font-size: 19px;
    font-weight: 700;
    color: #1e1b4b;
    margin-bottom: 8px;
    line-height: 1.35;
  }

  .bm-blog-excerpt {
    font-size: 13.5px;
    color: #6b7280;
    line-height: 1.6;
    margin-bottom: 14px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .bm-blog-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
  .bm-tag {
    font-size: 11px !important;
    border-radius: 20px !important;
    background: #f5f3ff !important;
    border-color: #ddd6fe !important;
    color: #6d28d9 !important;
    padding: 1px 10px !important;
    font-weight: 500 !important;
  }

  .bm-blog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 14px;
    border-top: 1px solid #f5f3ff;
    flex-wrap: wrap;
    gap: 10px;
  }

  .bm-meta-item {
    display: flex; align-items: center; gap: 5px;
    font-size: 12.5px; color: #9ca3af;
  }
  .bm-meta-item strong { color: #374151; font-weight: 600; }

  /* ─── PAGINATION ─── */
  .bm-pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 28px;
    flex-wrap: wrap;
    gap: 12px;
  }
  .bm-page-info { font-size: 13px; color: #6b7280; }

  .bm-page-btns { display: flex; gap: 6px; align-items: center; }
  .bm-page-btn {
    width: 36px; height: 36px;
    border: 1.5px solid #ede9fe;
    background: #fff;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    color: #6b7280;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
  }
  .bm-page-btn:hover:not(:disabled) { border-color: #8b5cf6; color: #6d28d9; background: #f5f3ff; }
  .bm-page-btn.active { background: #6d28d9; border-color: #6d28d9; color: #fff; }
  .bm-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* ─── MODAL ─── */
  .bm-modal .ant-modal-content {
    border-radius: 20px !important;
    overflow: hidden;
    border: 1.5px solid #ede9fe;
    box-shadow: 0 24px 64px rgba(109,40,217,0.15) !important;
  }
  .bm-modal .ant-modal-header {
    background: linear-gradient(135deg, #1e1b4b 0%, #2d1b69 100%) !important;
    padding: 20px 28px !important;
    border-bottom: none !important;
    margin-bottom: 0 !important;
  }
  .bm-modal .ant-modal-title {
    color: #fff !important;
    font-family: 'Playfair Display', serif !important;
    font-size: 20px !important;
    font-weight: 700 !important;
  }
  .bm-modal .ant-modal-close-x { color: #a78bfa !important; }
  .bm-modal .ant-modal-body { padding: 24px 28px !important; }
  .bm-modal .ant-tabs-tab {
    font-size: 14px !important;
    font-weight: 500 !important;
    padding: 10px 4px !important;
  }
  .bm-modal .ant-tabs-tab-active .ant-tabs-tab-btn { color: #6d28d9 !important; }
  .bm-modal .ant-tabs-ink-bar { background: #6d28d9 !important; }

  .bm-form-label .ant-form-item-label label {
    font-weight: 600 !important;
    font-size: 13px !important;
    color: #374151 !important;
  }

  /* ─── FOOTER ACTIONS ─── */
  .bm-footer-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0 0;
    border-top: 1.5px solid #f5f3ff;
    margin-top: 8px;
  }

  .bm-save-draft-btn {
    height: 44px !important;
    padding: 0 24px !important;
    border-radius: 12px !important;
    border-color: #c4b5fd !important;
    color: #6d28d9 !important;
    font-weight: 600 !important;
    background: #faf5ff !important;
  }
  .bm-save-draft-btn:hover {
    background: #ede9fe !important;
    border-color: #8b5cf6 !important;
  }

  .bm-publish-btn {
    height: 44px !important;
    padding: 0 28px !important;
    border-radius: 12px !important;
    background: linear-gradient(135deg, #6d28d9, #8b5cf6) !important;
    border: none !important;
    font-weight: 700 !important;
    font-size: 14px !important;
    box-shadow: 0 4px 14px rgba(109,40,217,0.35) !important;
  }
  .bm-publish-btn:hover {
    box-shadow: 0 6px 18px rgba(109,40,217,0.45) !important;
  }

  /* ─── PREVIEW MODAL ─── */
  .preview-modal .ant-modal-content { border-radius: 20px !important; overflow: hidden; }
  .preview-modal .ant-modal-header { 
    background: linear-gradient(135deg, #1e1b4b, #4c1d95) !important;
    border-bottom: none !important;
    margin-bottom: 0 !important;
    padding: 18px 28px !important;
  }
  .preview-modal .ant-modal-title { color: #fff !important; font-weight: 700 !important; }
  .preview-modal .ant-modal-body { padding: 0 !important; }

  /* ─── BLOG PREVIEW CONTENT (FIXED SPACING) ─── */
  .blog-preview-wrap {
    font-family: 'DM Sans', sans-serif;
    color: #1e1b4b;
    background: #fff;
  }

  .blog-preview-hero { width: 100%; height: 320px; object-fit: cover; display: block; }
  .blog-preview-inner { padding: 36px 40px; }

  /* Added !important to enforce spacing despite Tailwind's reset */
  .blog-preview-content h1 { font-family: 'Playfair Display', serif; font-size: 2em; font-weight: 800; margin: 1.4em 0 0.6em !important; line-height: 1.25; color: #1e1b4b; display: block; }
  .blog-preview-content h2 { font-family: 'Playfair Display', serif; font-size: 1.6em; font-weight: 700; margin: 1.2em 0 0.5em !important; line-height: 1.3; color: #1e1b4b; display: block; }
  .blog-preview-content h3 { font-size: 1.3em; font-weight: 700; margin: 1em 0 0.4em !important; color: #2d1b69; display: block; }
  .blog-preview-content h4 { font-size: 1.1em; font-weight: 600; margin: 0.8em 0 0.4em !important; display: block; }
  .blog-preview-content p { margin: 0 0 1.2em 0 !important; line-height: 1.8; font-size: 16px; color: #374151; display: block; }
  .blog-preview-content ul { list-style: disc; padding-left: 1.8em !important; margin: 0 0 1.2em 0 !important; display: block; }
  .blog-preview-content ol { list-style: decimal; padding-left: 1.8em !important; margin: 0 0 1.2em 0 !important; display: block; }
  .blog-preview-content li { margin: 0 0 0.6em 0 !important; line-height: 1.7; color: #374151; display: list-item; }
  .blog-preview-content blockquote {
    border-left: 4px solid #8b5cf6; padding: 12px 20px; margin: 1.2em 0 !important;
    background: #f5f3ff; border-radius: 0 12px 12px 0; font-style: italic; color: #4c1d95;
  }
  .blog-preview-content a { color: #6d28d9; text-decoration: underline; }
  .blog-preview-content img { max-width: 100%; border-radius: 10px; margin: 1em 0 !important; }
  .blog-preview-content table { width: 100%; border-collapse: collapse; margin: 1em 0 !important; }
  .blog-preview-content th, .blog-preview-content td { border: 1px solid #e9d5ff; padding: 10px 14px; text-align: left; }
  .blog-preview-content th { background: #f5f3ff; font-weight: 700; color: #4c1d95; }
  .blog-preview-content code { background: #f5f3ff; padding: 2px 7px; border-radius: 5px; font-family: monospace; font-size: 0.9em; color: #6d28d9; }
  .blog-preview-content pre { background: #1e1b4b; color: #e9d5ff; padding: 18px; border-radius: 12px; overflow-x: auto; margin: 1em 0 !important; }
  .blog-preview-content hr { border: none; border-top: 2px solid #ede9fe; margin: 2em 0 !important; }

  /* ─── TOC ─── */
  .bm-toc {
    background: #f5f3ff;
    border: 1.5px solid #e9d5ff;
    border-radius: 14px;
    padding: 18px 22px;
    margin-bottom: 28px;
  }
  .bm-toc-title { font-weight: 700; font-size: 13px; color: #6d28d9; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
  .bm-toc ol { list-style: decimal; padding-left: 18px; margin: 0; }
  .bm-toc li { font-size: 13.5px; color: #4c1d95; padding: 3px 0; line-height: 1.5; }

  /* ─── EMPTY ─── */
  .bm-empty {
    background: #fff;
    border-radius: 18px;
    border: 1.5px dashed #ddd6fe;
    padding: 64px 40px;
    text-align: center;
  }
  .bm-empty-icon { font-size: 56px; color: #c4b5fd; margin-bottom: 16px; }
  .bm-empty-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: #1e1b4b; margin-bottom: 8px; }
  .bm-empty-sub { font-size: 14px; color: #9ca3af; }

  /* ─── AUTOSAVE INDICATOR ─── */
  .bm-autosave {
    display: flex; align-items: center; gap: 6px;
    font-size: 12px; color: #9ca3af;
  }
  .bm-autosave-dot {
    width: 8px; height: 8px; border-radius: 50%; background: #10b981;
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  /* ─── UPLOAD AREA ─── */
  .bm-upload .ant-upload-list-item {
    border-radius: 10px !important;
    border-color: #ede9fe !important;
  }
  .ant-upload-select { border-radius: 12px !important; border-color: #c4b5fd !important; }
  .ant-upload-select:hover { border-color: #8b5cf6 !important; background: #faf5ff !important; }

  /* ─── ANT OVERRIDES IN MODAL ─── */
  .bm-modal .ant-form-item-label > label { color: #374151 !important; font-weight: 600 !important; font-size: 13px !important; }
  .bm-modal .ant-input, .bm-modal .ant-select-selector, .bm-modal .ant-input-affix-wrapper {
    border-radius: 10px !important;
    border-color: #e9d5ff !important;
  }
  .bm-modal .ant-input:focus, .bm-modal .ant-select-focused .ant-select-selector {
    border-color: #8b5cf6 !important;
    box-shadow: 0 0 0 2px rgba(139,92,246,0.15) !important;
  }

  /* Responsive */
  @media (max-width: 600px) {
    .bm-blog-body { padding: 16px; }
    .blog-preview-inner { padding: 20px; }
    .blog-preview-hero { height: 200px; }
  }
`;

// ─────────────────────────────────────────────
//  PASTE CLEANING UTILITIES (BULLET GAP FIX)
// ─────────────────────────────────────────────
const cleanWordHtml = (html) => {
  if (!html) return '';
  let cleaned = html;

  // Basic cleanup
  cleaned = cleaned.replace(/lang="[^"]*"/gi, '');
  cleaned = cleaned.replace(/class="[^"]*"/gi, '');

  // Strip spans entirely. Word hides massive spaces like &nbsp;&nbsp;&nbsp;&nbsp; inside nested spans.
  // This alone solves 90% of huge bullet gap problems.
  cleaned = cleaned.replace(/<\/?span[^>]*>/gi, '');

  // Strip excessive non-breaking spaces (turn 2+ &nbsp; into a single normal space)
  cleaned = cleaned.replace(/(&nbsp;|\s){2,}/gi, ' ');

  // Convert fake Word paragraphs starting with bullets into real <li> items
  // Matches: <p> ● Faltu spaces Text </p>
  const pListPattern = /<p[^>]*>\s*([·●•▪o\-]|\&#183;)\s*([\s\S]*?)<\/p>/gi;
  cleaned = cleaned.replace(pListPattern, '<li>$2</li>');

  // Clean up existing list items that have hardcoded bullets pasted inside them
  const liListPattern = /<li[^>]*>\s*([·●•▪o\-]|\&#183;)\s*([\s\S]*?)<\/li>/gi;
  cleaned = cleaned.replace(liListPattern, '<li>$2</li>');

  // Standardize bold tags
  cleaned = cleaned.replace(/<b([^>]*)>/gi, '<strong$1>');
  cleaned = cleaned.replace(/<\/b>/gi, '</strong>');

  return cleaned.trim();
};

const sanitizePastedHtml = (html) => {
  if (!html) return '';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  ['script', 'iframe', 'object', 'embed', 'applet', 'link', 'meta'].forEach(sel => {
    tempDiv.querySelectorAll(sel).forEach(el => el.remove());
  });
  return tempDiv.innerHTML;
};

const cleanPastedContent = (html) => {
  if (!html) return '';
  let c = cleanWordHtml(html);
  c = sanitizePastedHtml(c);
  c = c.replace(/\s*class="[^"]*"/gi, '');
  return c.trim();
};

const htmlToPlainText = (html) => {
  if (!html) return '';
  const d = document.createElement('div');
  d.innerHTML = html;
  return d.textContent || d.innerText || '';
};

const extractHeadings = (html) => {
  if (!html) return [];
  const headings = [];
  const re = /<h([1-6])[^>]*>(.*?)<\/h\1>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    headings.push({ level: parseInt(m[1]), text: m[2].replace(/<[^>]*>/g, '').trim(), id: `h-${headings.length}` });
  }
  return headings;
};

const extractExcerpt = (html, maxLength = 160) => {
  if (!html) return '';
  const text = htmlToPlainText(html);
  return text.length <= maxLength ? text : text.substring(0, maxLength).trim() + '...';
};

const smartExtract = (html) => {
  if (!html) return {};
  const text = htmlToPlainText(html).toLowerCase();
  const CATS = {
    'AI': ['artificial intelligence', 'machine learning', 'deep learning', 'chatgpt', 'llm', 'ai ', 'openai', 'generative'],
    'Real Estate': ['property', 'real estate', 'housing', 'apartment', 'villa', 'rent', 'mortgage', 'broker'],
    'PropTech': ['proptech', 'property technology', 'smart home', 'iot', 'digital property', 'virtual tour'],
    'Technology': ['software', 'programming', 'javascript', 'react', 'cloud', 'saas', 'startup', 'api', 'coding'],
    'Business': ['business', 'startup', 'entrepreneur', 'investment', 'revenue', 'marketing', 'sales', 'strategy'],
    'Mortgage': ['mortgage', 'home loan', 'refinance', 'interest rate', 'lender'],
    'Landscaping': ['landscaping', 'garden', 'outdoor', 'hardscape', 'lawn', 'irrigation'],
  };
  let detectedCategory = 'Other', maxMatches = 0;
  for (const [cat, kws] of Object.entries(CATS)) {
    const matches = kws.filter(kw => text.includes(kw)).length;
    if (matches > maxMatches) { maxMatches = matches; detectedCategory = cat; }
  }
  const TAGS = ['AI', 'Real Estate', 'PropTech', 'Technology', 'Business', 'Mortgage', 'Landscaping', 'Marketing', 'UAE', 'Dubai', 'Innovation', 'Digital', 'Cloud', 'Investment', 'Architecture', 'Smart Home', 'Automation'];
  const detectedTags = TAGS.filter(t => text.includes(t.toLowerCase())).slice(0, 6);
  let excerpt = '';
  const pm = html.match(/<p[^>]*>(.*?)<\/p>/i);
  if (pm) excerpt = htmlToPlainText(pm[1]).trim().substring(0, 160);
  else if (text) excerpt = text.substring(0, 160);
  const wordCount = text.split(/\s+/).length;
  return { detectedCategory, detectedTags, excerpt, wordCount, readingTime: Math.max(1, Math.ceil(wordCount / 200)) };
};

// ─────────────────────────────────────────────
//  CROP HELPER
// ─────────────────────────────────────────────
const getCroppedImg = (imageSrc, pixelCrop) => new Promise((resolve, reject) => {
  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.src = imageSrc;
  image.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Canvas empty')), 'image/jpeg', 0.92);
  };
  image.onerror = reject;
});

// ─────────────────────────────────────────────
//  IMAGE CROP MODAL
// ─────────────────────────────────────────────
const ImageCropModal = ({ open, imageSrc, aspect, title, onConfirm, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropping, setCropping] = useState(false);

  useEffect(() => {
    if (open) { setCrop({ x: 0, y: 0 }); setZoom(1); setCroppedAreaPixels(null); }
  }, [open, imageSrc]);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setCropping(true);
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onConfirm(blob);
    } catch { message.error('Crop failed, please try again'); }
    finally { setCropping(false); }
  };

  return (
    <Modal
      open={open}
      title={<Space><ScissorOutlined style={{ color: '#8b5cf6' }} /><span style={{ color: '#fff' }}>{title || 'Crop Image'}</span></Space>}
      onCancel={onCancel}
      width={620}
      centered
      destroyOnClose
      className="bm-modal"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <ZoomInOutlined style={{ color: '#888' }} />
            <Slider min={1} max={3} step={0.05} value={zoom} onChange={setZoom} style={{ width: 160 }} tooltip={{ formatter: v => `${Math.round(v * 100)}%` }} />
            <Text type="secondary" style={{ fontSize: 12 }}>{Math.round(zoom * 100)}%</Text>
          </Space>
          <Space>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" icon={<ScissorOutlined />} loading={cropping} onClick={handleConfirm} style={{ background: THEME.primary, borderColor: THEME.primary, borderRadius: 10 }}>
              Apply Crop
            </Button>
          </Space>
        </div>
      }
    >
      <div style={{ position: 'relative', width: '100%', height: 380, background: '#1e1b4b', borderRadius: 14, overflow: 'hidden' }}>
        {imageSrc
          ? <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={aspect} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(_, px) => setCroppedAreaPixels(px)} style={{ containerStyle: { borderRadius: 14 }, cropAreaStyle: { border: '2px solid #8b5cf6', boxShadow: '0 0 0 9999px rgba(0,0,0,0.65)' } }} />
          : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><Text type="secondary">Loading image...</Text></div>
        }
      </div>
      <div style={{ marginTop: 10, textAlign: 'center' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>Drag to reposition · Scroll or slider to zoom</Text>
      </div>
    </Modal>
  );
};

// ─────────────────────────────────────────────
//  UPLOAD WITH CROP
// ─────────────────────────────────────────────
const UploadWithCrop = ({ fileList, onChange, aspect, cropTitle, maxSizeMB = 5, label, extra, maxCount = 1 }) => {
  const [cropModal, setCropModal] = useState({ open: false, src: '' });
  const [pendingFile, setPendingFile] = useState(null);

  const handleBeforeUpload = (file) => {
    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
      message.error('Only JPG, PNG, WEBP allowed'); return Upload.LIST_IGNORE;
    }
    if (file.size / 1024 / 1024 > maxSizeMB) { message.error(`Max ${maxSizeMB}MB`); return Upload.LIST_IGNORE; }
    const reader = new FileReader();
    reader.onload = (e) => { setPendingFile(file); setCropModal({ open: true, src: e.target.result }); };
    reader.readAsDataURL(file);
    return Upload.LIST_IGNORE;
  };

  const handleCropConfirm = (blob) => {
    const fileName = pendingFile?.name || 'image.jpg';
    const croppedFile = new File([blob], fileName, { type: 'image/jpeg' });
    const preview = URL.createObjectURL(blob);
    onChange([{ uid: `crop-${Date.now()}`, name: fileName, status: 'done', originFileObj: croppedFile, preview, url: preview }]);
    setCropModal({ open: false, src: '' }); setPendingFile(null);
    message.success('Image cropped!');
  };

  const handleEditCrop = (file) => {
    const src = file.url || file.preview;
    if (!src) { message.error('Cannot edit this image'); return; }
    setPendingFile(file.originFileObj || null);
    setCropModal({ open: true, src });
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview && file.originFileObj) {
      file.preview = await new Promise(res => { const r = new FileReader(); r.readAsDataURL(file.originFileObj); r.onload = () => res(r.result); });
    }
    const imageUrl = file.url || file.preview;
    Modal.confirm({
      icon: null, width: 600, centered: true,
      okButtonProps: { style: { display: 'none' } }, cancelButtonProps: { style: { display: 'none' } },
      content: <div><img src={imageUrl} alt="preview" style={{ width: '100%', borderRadius: 12 }} /><div style={{ textAlign: 'center', marginTop: 16 }}><Button onClick={() => Modal.destroyAll()}>Close</Button></div></div>,
      onCancel: () => Modal.destroyAll(),
    });
  };

  const itemRender = (originNode, file) => (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {originNode}
      <Tooltip title="Crop / Edit">
        <button
          onClick={(e) => { e.stopPropagation(); handleEditCrop(file); }}
          style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#6d28d9,#8b5cf6)', border: 'none', borderRadius: 6, color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', zIndex: 10 }}
        >
          <ScissorOutlined style={{ fontSize: 10 }} /> Edit
        </button>
      </Tooltip>
    </div>
  );

  return (
    <>
      <Form.Item label={<span style={{ fontWeight: 600, fontSize: 13, color: '#374151' }}>{label}</span>} extra={<span style={{ fontSize: 12, color: '#9ca3af' }}>{extra}</span>}>
        <Upload className="bm-upload" listType="picture-card" fileList={fileList} onPreview={handlePreview} onChange={({ fileList: fl }) => { if (fl.length < fileList.length) onChange(fl); }} beforeUpload={handleBeforeUpload} maxCount={maxCount} itemRender={itemRender} accept="image/jpeg,image/png,image/webp">
          {fileList.length < maxCount && (
            <div style={{ textAlign: 'center' }}>
              <PlusOutlined style={{ color: '#8b5cf6', fontSize: 18 }} />
              <div style={{ marginTop: 8, fontSize: 12, color: '#6d28d9', fontWeight: 600 }}>Upload</div>
            </div>
          )}
        </Upload>
      </Form.Item>
      <ImageCropModal open={cropModal.open} imageSrc={cropModal.src} aspect={aspect} title={cropTitle} onConfirm={handleCropConfirm} onCancel={() => { setCropModal({ open: false, src: '' }); setPendingFile(null); }} />
    </>
  );
};

// ─────────────────────────────────────────────
//  BLOG PREVIEW COMPONENT
// ─────────────────────────────────────────────
const BlogPreview = ({ data }) => {
  if (!data) return null;
  const { title, subHeading, content, authorName, authorImage, tags, category, featuredImage, coverImage, createdAt, readingTime, headings } = data;

  const sanitized = content ? DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'strike', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'pre', 'code', 'hr', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'div', 'span'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel', 'style'], // ✅ ADDED style to preserve formatting
    ALLOW_DATA_ATTR: false
  }) : '';

  const heroImg = coverImage || featuredImage;

  return (
    <div className="blog-preview-wrap">
      {heroImg && <img src={heroImg} alt="cover" className="blog-preview-hero" />}
      <div className="blog-preview-inner">
        {/* Category & Tags */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {category && <span className="bm-cat-tag" style={{ background: 'linear-gradient(135deg,#6d28d9,#8b5cf6)', color: '#fff', padding: '3px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{category}</span>}
          {tags?.slice(0, 5).map(t => <span key={t} className="bm-tag" style={{ fontSize: 11, padding: '2px 10px', borderRadius: 20, background: '#f5f3ff', color: '#6d28d9', border: '1px solid #ddd6fe' }}>#{t}</span>)}
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 800, lineHeight: 1.2, color: '#1e1b4b', marginBottom: 12, marginTop: 0 }}>
          {title || 'Untitled Post'}
        </h1>

        {/* Subheading */}
        {subHeading && (
          <p style={{ fontSize: 18, color: '#6b7280', lineHeight: 1.65, marginBottom: 20, fontStyle: 'italic', borderLeft: '4px solid #8b5cf6', paddingLeft: 18, background: '#f5f3ff', borderRadius: '0 10px 10px 0', padding: '10px 18px' }}>
            {subHeading}
          </p>
        )}

        {/* Author Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderTop: '1px solid #ede9fe', borderBottom: '1px solid #ede9fe', marginBottom: 28 }}>
          <Avatar size={46} src={authorImage} icon={<UserOutlined />} style={{ background: 'linear-gradient(135deg,#6d28d9,#8b5cf6)', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1e1b4b' }}>{authorName || 'Admin'}</div>
            <div style={{ fontSize: 12, color: '#9ca3af', display: 'flex', gap: 18, marginTop: 2 }}>
              {createdAt && <span><CalendarOutlined style={{ marginRight: 4 }} />{moment(createdAt).format('MMM DD, YYYY')}</span>}
              {readingTime && <span><ClockCircleOutlined style={{ marginRight: 4 }} />{readingTime} min read</span>}
            </div>
          </div>
        </div>

        {/* TOC */}
        {headings && headings.filter(h => h.level <= 3).length > 2 && (
          <div className="bm-toc">
            <div className="bm-toc-title"><BookOutlined /> Table of Contents</div>
            <ol>
              {headings.filter(h => h.level <= 3).map((h, i) => (
                <li key={i} style={{ paddingLeft: (h.level - 1) * 14, listStyle: 'decimal' }}>{h.text}</li>
              ))}
            </ol>
          </div>
        )}

        {/* Content */}
        <div className="blog-preview-content" dangerouslySetInnerHTML={{ __html: sanitized }} />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
//  EDITOR CONFIG
// ─────────────────────────────────────────────
const getEditorConfig = () => ({
  readonly: false,
  placeholder: 'Write your blog here, or paste from Word/PDF/Google Docs...',
  height: 480,
  enableDragAndDropFileToEditor: true,
  uploader: { insertImageAsBase64URI: true, imagesExtensions: ['jpg', 'png', 'jpeg', 'gif', 'svg', 'webp'] },
  toolbarSticky: false,
  askBeforePasteHTML: false,
  askBeforePasteFromWord: false,
  defaultActionOnPaste: 'insert_as_html',
  removeButtons: ['file', 'video', 'print', 'about'],
  spellcheck: true,
  editorCssClass: 'jodit-clean-editor',
  extraCSS: `
    .jodit-clean-editor { font-family: 'DM Sans', sans-serif; line-height: 1.65; font-size: 16px; color: #1e1b4b; }
    .jodit-clean-editor ul { list-style: disc; padding-left: 2em; margin: 0.5em 0; }
    .jodit-clean-editor ol { list-style: decimal; padding-left: 2em; margin: 0.5em 0; }
    .jodit-clean-editor li { margin: 0.25em 0; display: list-item; }
    .jodit-clean-editor p { margin: 0.75em 0; }
    .jodit-clean-editor h1, .jodit-clean-editor h2, .jodit-clean-editor h3 { font-family: 'Playfair Display', serif; margin: 1em 0 0.5em; font-weight: 700; }
    .jodit-clean-editor blockquote { border-left: 3px solid #8b5cf6; padding-left: 1em; margin: 1em 0; color: #6b7280; font-style: italic; background: #f5f3ff; border-radius: 0 8px 8px 0; padding: 10px 16px; }
    .jodit-clean-editor img { max-width: 100%; border-radius: 8px; }
  `
});

// ─────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────
const BlogManagement = () => {
  const screens = useBreakpoint();
  const editorRef = useRef(null);
  const searchTimeout = useRef(null);

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [targetStatus, setTargetStatus] = useState('draft');

  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalResults: 0, itemsPerPage: 10 });
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewBlogData, setPreviewBlogData] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();
  const [contentValue, setContentValue] = useState('');
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [headings, setHeadings] = useState([]);
  const [smartFillApplied, setSmartFillApplied] = useState(false);
  const [pasteProcessing, setPasteProcessing] = useState(false);
  const [featuredImageList, setFeaturedImageList] = useState([]);
  const [coverImageList, setCoverImageList] = useState([]);
  const [authorImageList, setAuthorImageList] = useState([]);
  const [stats, setStats] = useState({ total: 0, published: 0, drafts: 0, views: 0 });

  // ─── Paste Handler ───
  const handlePaste = useCallback(async (event) => {
    event.preventDefault(); event.stopPropagation();
    setPasteProcessing(true);
    try {
      const cd = event.clipboardData;
      let pastedHtml = cd.getData('text/html');
      let pastedText = cd.getData('text/plain');
      let cleanHtml = '';

      if (pastedHtml) {
        cleanHtml = cleanPastedContent(pastedHtml);
        if (cleanHtml !== pastedHtml) {
          notification.info({ message: '✨ Content Cleaned', description: 'Pasted content formatted automatically.', duration: 2, placement: 'topRight' });
        }
      } else if (pastedText) {
        cleanHtml = pastedText.split(/\n\n+/).map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
      }

      if (cleanHtml) {
        const editor = editorRef.current;
        if (editor && editor.editor) {
          const sel = editor.editor.getSelection();
          const range = sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
          if (range) {
            const td = document.createElement('div'); td.innerHTML = cleanHtml;
            const frag = document.createDocumentFragment();
            while (td.firstChild) frag.appendChild(td.firstChild);
            range.deleteContents(); range.insertNode(frag); range.collapse(false);
            sel.removeAllRanges(); sel.addRange(range);
            const nc = editor.value;
            setContentValue(nc); setHeadings(extractHeadings(nc));
          }
        } else {
          setContentValue(prev => prev + cleanHtml);
          setHeadings(extractHeadings(contentValue + cleanHtml));
        }

        const extracted = smartExtract(cleanHtml);
        const cur = form.getFieldsValue(); const updates = {};
        if (!cur.subHeading && extracted.excerpt) updates.subHeading = extracted.excerpt;
        if ((!cur.category || cur.category === 'Other') && extracted.detectedCategory !== 'Other') {
          updates.category = extracted.detectedCategory;
          notification.success({ message: '🏷️ Category Detected', description: `Set to: ${extracted.detectedCategory}`, duration: 3, placement: 'topRight' });
        }
        if ((!cur.tags || cur.tags.length === 0) && extracted.detectedTags.length > 0) {
          updates.tags = extracted.detectedTags;
          notification.success({ message: '🔖 Tags Detected', description: extracted.detectedTags.join(', '), duration: 3, placement: 'topRight' });
        }
        if (Object.keys(updates).length > 0) { form.setFieldsValue(updates); setSmartFillApplied(true); setTimeout(() => setSmartFillApplied(false), 5000); }
      }
    } catch (e) { console.error(e); message.error('Failed to process pasted content'); }
    finally { setPasteProcessing(false); }
  }, [form, contentValue]);

  const handleEditorChange = (value) => {
    const cleaned = cleanPastedContent(value);
    setContentValue(cleaned);
    setHeadings(extractHeadings(cleaned));
    const subHeading = form.getFieldValue('subHeading');
    if (!subHeading && cleaned && cleaned !== '<p><br></p>') {
      const ex = extractExcerpt(cleaned, 160);
      if (ex) form.setFieldsValue({ subHeading: ex });
    }
  };

  // ─── Auto-save ───
  useEffect(() => {
    let t;
    if (autoSave && contentValue && modalVisible && !pasteProcessing) {
      t = setTimeout(() => handleAutoSave(), 30000);
    }
    return () => clearTimeout(t);
  }, [contentValue, autoSave, modalVisible, pasteProcessing]);

  const handleAutoSave = async () => {
    if (!contentValue || !modalVisible || pasteProcessing) return;
    const values = form.getFieldsValue();
    if (!values.title) return;
    const key = `blog_draft_${editingId || 'new'}`;
    localStorage.setItem(key, JSON.stringify({ ...values, content: contentValue, headings, featuredImage: featuredImageList, coverImage: coverImageList, authorImage: authorImageList, timestamp: new Date().toISOString() }));
    setLastSaved(new Date());
  };

  const loadDraft = () => {
    const key = `blog_draft_${editingId || 'new'}`;
    const raw = localStorage.getItem(key);
    if (!raw) return;
    try {
      const draft = JSON.parse(raw);
      const draftTime = moment(draft.timestamp);
      if (moment().diff(draftTime, 'hours') > 24) { localStorage.removeItem(key); return; }
      Modal.confirm({
        title: <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>Draft Found</span>,
        content: `Restore draft saved ${draftTime.format('MMM DD [at] HH:mm')}?`,
        okButtonProps: { style: { background: THEME.primary, borderColor: THEME.primary, borderRadius: 8 } },
        onOk: () => {
          form.setFieldsValue({ title: draft.title, subHeading: draft.subHeading, tags: draft.tags, category: draft.category, authorName: draft.authorName });
          setContentValue(draft.content || ''); setHeadings(draft.headings || []);
          setFeaturedImageList(draft.featuredImage || []); setCoverImageList(draft.coverImage || []); setAuthorImageList(draft.authorImage || []);
          message.success('Draft restored!');
        }
      });
    } catch (e) { console.error(e); }
  };

  // ─── Fetch ───
  const fetchBlogs = useCallback(async (page = 1, limit = 10, searchVal = "", category = "", status = "") => {
    setLoading(true);
    try {
      let url = `/blogs/get-all-blogs?page=${page}&limit=${limit}`;
      if (searchVal?.trim()) url += `&search=${encodeURIComponent(searchVal.trim())}`;
      if (category) url += `&category=${encodeURIComponent(category)}`;
      if (status) url += `&isPublished=${status === 'published'}`;
      const res = await apiService.get(url);
      if (res.success) {
        setBlogs(res.data || []);
        setPagination({ currentPage: res.pagination?.page || page, totalPages: res.pagination?.totalPages || 1, totalResults: res.pagination?.total || res.data?.length || 0, itemsPerPage: res.pagination?.limit || limit });
        setStats({ total: res.pagination?.total || 0, published: res.data?.filter(b => b.isPublished).length || 0, drafts: res.data?.filter(b => !b.isPublished).length || 0, views: res.data?.reduce((s, b) => s + (b.viewCount || 0), 0) || 0 });
      }
    } catch (e) { console.error(e); message.error('Failed to load blogs'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBlogs(1, 10, "", "", ""); }, [fetchBlogs]);

  const handleSearch = (e) => {
    const val = e.target.value; setSearchText(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchBlogs(1, pagination.itemsPerPage, val, selectedCategory, selectedStatus), 500);
  };

  const handleFilterChange = (type, val) => {
    if (type === 'category') { setSelectedCategory(val); fetchBlogs(1, pagination.itemsPerPage, searchText, val, selectedStatus); }
    else { setSelectedStatus(val); fetchBlogs(1, pagination.itemsPerPage, searchText, selectedCategory, val); }
  };

  const handleClearFilters = () => {
    setSearchText(''); setSelectedCategory(''); setSelectedStatus('');
    fetchBlogs(1, pagination.itemsPerPage, "", "", "");
  };

  const fetchBlogById = async (id) => {
    setLoading(true);
    try {
      const res = await apiService.get(`/blogs/get-blog-by-id?id=${id}`);
      if (res.success && res.data) {
        const b = res.data;
        form.setFieldsValue({ title: b.title || '', subHeading: b.subHeading || '', tags: b.tags || [], category: b.category || 'Other', authorName: b.authorName || 'Admin' });
        setContentValue(b.content || ''); setHeadings(extractHeadings(b.content || ''));
        setFeaturedImageList(b.featuredImage ? [{ uid: '-1', name: 'featured', status: 'done', url: b.featuredImage, preview: b.featuredImage }] : []);
        setCoverImageList(b.coverImage ? [{ uid: '-2', name: 'cover', status: 'done', url: b.coverImage, preview: b.coverImage }] : []);
        setAuthorImageList(b.authorImage ? [{ uid: '-3', name: 'author', status: 'done', url: b.authorImage, preview: b.authorImage }] : []);
        setEditingId(id); setModalVisible(true);
        setTimeout(() => loadDraft(), 100);
      } else message.error(res.message || 'Failed to fetch blog');
    } catch (e) { console.error(e); message.error('Failed to fetch blog'); }
    finally { setLoading(false); }
  };

  const uploadFile = async (file) => {
    const fd = new FormData(); fd.append('file', file);
    const res = await apiService.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    if (res.success) return res.url || res.file?.url;
    throw new Error(res.message || 'Upload failed');
  };

  const processImage = async (imageList) => {
    if (!imageList || imageList.length === 0) return '';
    if (imageList[0].originFileObj) return await uploadFile(imageList[0].originFileObj);
    if (imageList[0].url && !imageList[0].url.startsWith('blob:')) return imageList[0].url;
    return '';
  };

  const handleSave = async (values) => {
    if (!contentValue || contentValue === '<p><br></p>') { message.error('Please add blog content'); return; }
    if (targetStatus === 'published') {
      if (!featuredImageList.length) { message.error('Featured Image required for publishing'); return; }
      if (!coverImageList.length) { message.error('Cover Image required for publishing'); return; }
      if (!authorImageList.length) { message.error('Author Image required for publishing'); return; }
      if (!values.authorName) { message.error('Author Name required for publishing'); return; }
    }
    setSaving(true);
    try {
      const [featuredUrl, coverUrl, authorImgUrl] = await Promise.all([processImage(featuredImageList), processImage(coverImageList), processImage(authorImageList)]);
      const cleanedContent = DOMPurify.sanitize(cleanPastedContent(contentValue), {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'strike', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'pre', 'code', 'hr', 'table', 'thead', 'tbody', 'tr', 'td', 'th'],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel', 'style'], // ✅ ADDED style to preserve formatting
        ALLOW_DATA_ATTR: false
      });
      const payload = {
        title: values.title,
        subHeading: values.subHeading || extractExcerpt(cleanedContent, 160),
        content: cleanedContent,
        authorName: values.authorName || 'Admin',
        authorImage: authorImgUrl,
        isPublished: targetStatus === 'published',
        tags: values.tags || [],
        category: values.category || 'Other',
        featuredImage: featuredUrl,
        coverImage: coverUrl,
      };
      if (targetStatus === 'published') payload.publishedAt = new Date().toISOString();
      const res = editingId
        ? await apiService.put(`/blogs/edit-blog-by-id?id=${editingId}`, payload)
        : await apiService.post('/blogs/create-blog', payload);
      if (res.success) {
        notification.success({
          message: editingId ? '✅ Blog Updated' : '🚀 Blog Created',
          description: `"${values.title}" ${targetStatus === 'published' ? 'published' : 'saved as draft'} successfully`,
          placement: 'topRight', duration: 4
        });
        localStorage.removeItem(`blog_draft_${editingId || 'new'}`);
        closeModal();
        fetchBlogs(pagination.currentPage, pagination.itemsPerPage, searchText, selectedCategory, selectedStatus);
      } else message.error(res.message || 'Operation failed');
    } catch (e) { console.error(e); message.error(e.message || 'Failed to save blog'); }
    finally { setSaving(false); }
  };

  const deleteBlog = async (id) => {
    try {
      const res = await apiService.delete(`/blogs/delete-blog-by-id?id=${id}`);
      if (res.success) { message.success('Blog deleted'); fetchBlogs(pagination.currentPage, pagination.itemsPerPage, searchText, selectedCategory, selectedStatus); }
      else message.error(res.message || 'Delete failed');
    } catch (e) { console.error(e); message.error('Failed to delete'); }
  };

  const handleCardPreview = async (record) => {
    const hide = message.loading('Loading preview...', 0);
    try {
      const res = await apiService.get(`/blogs/get-blog-by-id?id=${record._id}`);
      showPreview(res.success && res.data ? res.data : record, false);
    } catch { showPreview(record, false); }
    finally { hide(); }
  };

  const showPreview = (blogData = {}, isLive = false) => {
    if (isLive) {
      const fv = form.getFieldsValue();
      setPreviewBlogData({
        title: fv.title || 'Untitled', subHeading: fv.subHeading, content: contentValue,
        authorName: fv.authorName, tags: fv.tags, category: fv.category,
        featuredImage: featuredImageList[0]?.url || featuredImageList[0]?.preview,
        coverImage: coverImageList[0]?.url || coverImageList[0]?.preview,
        authorImage: authorImageList[0]?.url || authorImageList[0]?.preview,
        headings, createdAt: new Date(),
        readingTime: Math.max(1, Math.ceil((contentValue || '').replace(/<[^>]*>/g, '').split(/\s+/).length / 200)),
      });
    } else {
      setPreviewBlogData({ ...blogData, headings: extractHeadings(blogData?.content || ''), readingTime: Math.max(1, Math.ceil((blogData?.content || '').replace(/<[^>]*>/g, '').split(/\s+/).length / 200)) });
    }
    setPreviewModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false); setEditingId(null);
    setFeaturedImageList([]); setCoverImageList([]); setAuthorImageList([]);
    setContentValue(''); setHeadings([]); setSmartFillApplied(false); setLastSaved(null);
    form.resetFields();
  };

  const openCreate = () => {
    setEditingId(null); form.resetFields();
    setFeaturedImageList([]); setCoverImageList([]); setAuthorImageList([]);
    setContentValue(''); setHeadings([]); setSmartFillApplied(false);
    setModalVisible(true); setTimeout(() => loadDraft(), 100);
  };

  const statCards = [
    { label: 'Total Posts', value: stats.total, icon: <FileTextOutlined />, color: 'purple' },
    { label: 'Published', value: stats.published, icon: <CheckCircleOutlined />, color: 'green' },
    { label: 'Drafts', value: stats.drafts, icon: <SyncOutlined />, color: 'amber' },
    { label: 'Total Views', value: stats.views, icon: <EyeOutlined />, color: 'blue' },
  ];

  const PAGE_RANGE = Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
    .slice(Math.max(0, pagination.currentPage - 3), pagination.currentPage + 2);

  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <div className="bm-root">
        {/* Header */}
        <div className="bm-header">
          <div>
            <h1 className="bm-header-title">Blog Management</h1>
            <p className="bm-header-sub">Create, manage & publish — with smart paste from Word, PDF & Google Docs</p>
          </div>
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={openCreate} className="bm-btn-primary">
            Create New Post
          </Button>
        </div>

        {/* Stats */}
        <div className="bm-stats">
          {statCards.map(s => (
            <div key={s.label} className={`bm-stat-card ${s.color}`}>
              <div className={`bm-stat-icon ${s.color}`}>{s.icon}</div>
              <div className="bm-stat-value">{s.value.toLocaleString()}</div>
              <div className="bm-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bm-filters" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Input
            size="large"
            prefix={<SearchOutlined style={{ color: '#c4b5fd' }} />}
            placeholder="Search posts by title, content or tags..."
            value={searchText}
            onChange={handleSearch}
            allowClear
            style={{ flex: 1, minWidth: 200, borderRadius: 10 }}
          />

          <Select
            size="large"
            placeholder="Category"
            value={selectedCategory || undefined}
            onChange={v => handleFilterChange('category', v)}
            allowClear
            style={{ width: 180 }}
          >
            {[['AI', '🤖 AI'], ['Real Estate', '🏠 Real Estate'], ['PropTech', '📱 PropTech'], ['Technology', '💻 Technology'], ['Business', '💼 Business'], ['Mortgage', '🏦 Mortgage'], ['Landscaping', '🌳 Landscaping'], ['Other', '📄 Other']].map(([v, l]) => (
              <Option key={v} value={v}>{l}</Option>
            ))}
          </Select>

          <Select
            size="large"
            placeholder="Status"
            value={selectedStatus || undefined}
            onChange={v => handleFilterChange('status', v)}
            allowClear
            style={{ width: 140 }}
          >
            <Option value="published">✅ Published</Option>
            <Option value="draft">📝 Draft</Option>
          </Select>

          <Button
            size="large"
            icon={<UndoOutlined />}
            onClick={handleClearFilters}
            style={{ borderRadius: 10, borderColor: '#ede9fe', color: '#6b7280' }}
          >
            Clear
          </Button>
        </div>

        {/* Blog List */}
        {loading ? (
          <div>
            {[1, 2, 3].map(i => <Card key={i} style={{ borderRadius: 18, marginBottom: 20, border: '1.5px solid #ede9fe' }} bodyStyle={{ padding: 24 }}><Skeleton active avatar={{ size: 80, shape: 'square' }} paragraph={{ rows: 3 }} /></Card>)}
          </div>
        ) : blogs.length === 0 ? (
          <div className="bm-empty">
            <div className="bm-empty-icon"><FileTextOutlined /></div>
            <div className="bm-empty-title">No posts found</div>
            <div className="bm-empty-sub">Create your first blog post or clear the filters</div>
          </div>
        ) : (
          <>
            {blogs.map(record => (
              <div key={record._id} className="bm-blog-card">
                <div className="bm-blog-thumb">
                  {record.featuredImage
                    ? <img src={record.featuredImage} alt={record.title} />
                    : <div className="bm-blog-thumb-placeholder"><FileTextOutlined /></div>
                  }
                </div>
                <div className="bm-blog-body">
                  <div>
                    <div className="bm-blog-top">
                      <div className="bm-blog-badges">
                        <span className="bm-cat-tag">{record.category || 'Uncategorized'}</span>
                        <span className={`bm-status-badge ${record.isPublished ? 'published' : 'draft'}`}>
                          {record.isPublished ? <><CheckCircleOutlined /> Published</> : <><SyncOutlined /> Draft</>}
                        </span>
                      </div>
                      <div className="bm-blog-actions">
                        <Tooltip title="Edit"><button className="bm-action-btn" onClick={() => fetchBlogById(record._id)}><EditOutlined /></button></Tooltip>
                        <Tooltip title="Preview"><button className="bm-action-btn" onClick={() => handleCardPreview(record)}><EyeOutlined /></button></Tooltip>
                        <Popconfirm title="Delete this post?" description="This action cannot be undone." onConfirm={() => deleteBlog(record._id)} okText="Delete" okButtonProps={{ danger: true }} cancelButtonProps={{ style: { borderRadius: 8 } }}>
                          <Tooltip title="Delete"><button className="bm-action-btn danger"><DeleteOutlined /></button></Tooltip>
                        </Popconfirm>
                      </div>
                    </div>
                    <div className="bm-blog-title">{record.title || 'Untitled Post'}</div>
                    <div className="bm-blog-excerpt">{record.subHeading || 'No excerpt available...'}</div>
                    <div className="bm-blog-tags">
                      {record.tags?.slice(0, 5).map(tag => <span key={tag} className="bm-tag">#{tag}</span>)}
                      {record.tags?.length > 5 && <span className="bm-tag">+{record.tags.length - 5}</span>}
                    </div>
                  </div>
                  <div className="bm-blog-footer">
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                      <div className="bm-meta-item">
                        <Avatar size={26} src={record.authorImage} icon={<UserOutlined />} style={{ background: 'linear-gradient(135deg,#6d28d9,#8b5cf6)' }} />
                        <strong>{record.authorName || 'Admin'}</strong>
                      </div>
                      <div className="bm-meta-item"><CalendarOutlined />{moment(record.createdAt).format('MMM DD, YYYY')}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                      <div className="bm-meta-item"><ClockCircleOutlined />{record.readingTime || 2} min read</div>
                      <div className="bm-meta-item"><EyeOutlined />{(record.viewCount || 0).toLocaleString()} views</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            <div className="bm-pagination">
              <div className="bm-page-info">
                Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}–{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalResults)} of {pagination.totalResults} posts
              </div>
              <div className="bm-page-btns">
                <button className="bm-page-btn" disabled={pagination.currentPage === 1} onClick={() => fetchBlogs(pagination.currentPage - 1, pagination.itemsPerPage, searchText, selectedCategory, selectedStatus)}>
                  <ArrowLeftOutlined />
                </button>
                {PAGE_RANGE.map(p => (
                  <button key={p} className={`bm-page-btn ${pagination.currentPage === p ? 'active' : ''}`} onClick={() => fetchBlogs(p, pagination.itemsPerPage, searchText, selectedCategory, selectedStatus)}>{p}</button>
                ))}
                <button className="bm-page-btn" disabled={pagination.currentPage === pagination.totalPages} onClick={() => fetchBlogs(pagination.currentPage + 1, pagination.itemsPerPage, searchText, selectedCategory, selectedStatus)}>
                  <ArrowRightOutlined />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ─── CREATE / EDIT MODAL ─── */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{editingId ? <><EditOutlined style={{ marginRight: 8 }} />Edit Post</> : <><RocketOutlined style={{ marginRight: 8 }} />Create New Post</>}</span>
            {lastSaved && autoSave && (
              <div className="bm-autosave" style={{ marginRight: 32 }}>
                <div className="bm-autosave-dot" />
                Saved {moment(lastSaved).format('HH:mm:ss')}
              </div>
            )}
          </div>
        }
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        centered
        destroyOnClose
        className="bm-modal"
        width={screens.xs ? '98%' : 1060}
        bodyStyle={{ maxHeight: '80vh', overflowY: 'auto', padding: '20px 28px' }}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} initialValues={{ category: 'Other', authorName: 'Admin' }}>
          <Tabs defaultActiveKey="content" size="large">
            {/* ─── CONTENT TAB ─── */}
            <TabPane tab={<span><EditOutlined />  Content</span>} key="content">
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item name="title" label="Post Title" rules={[{ required: true, message: 'Title is required' }]}>
                    <Input placeholder="Enter an engaging, SEO-friendly title..." size="large" style={{ borderRadius: 10, fontSize: 16, fontWeight: 500 }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="subHeading" label="Subheading / Excerpt">
                <TextArea rows={2} placeholder="Auto-extracted from content, or write your own (max 160 chars)" maxLength={160} showCount style={{ borderRadius: 10 }} />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="tags" label="Tags">
                    <Select mode="tags" size="large" placeholder="Add tags (press Enter)" tokenSeparators={[',']} style={{ borderRadius: 10 }}>
                      {['AI', 'Real Estate', 'PropTech', 'Technology', 'Business', 'Mortgage', 'Landscaping', 'Marketing', 'UAE', 'Dubai', 'Innovation'].map(t => <Option key={t} value={t}>{t}</Option>)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="category" label="Category">
                    <Select size="large" placeholder="Select category">
                      {[['AI', '🤖'], ['Real Estate', '🏠'], ['PropTech', '📱'], ['Technology', '💻'], ['Business', '💼'], ['Mortgage', '🏦'], ['Landscaping', '🌳'], ['Other', '📄']].map(([v, e]) => <Option key={v} value={v}>{e} {v}</Option>)}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label={<span style={{ fontWeight: 700, color: '#1e1b4b' }}>Blog Content <span style={{ color: '#ef4444' }}>*</span></span>}>
                <div style={{ background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', borderRadius: 12, padding: '12px 16px', marginBottom: 12, border: '1px solid #e9d5ff' }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#4c1d95', marginBottom: 4 }}>📋 Smart Paste Enabled</div>
                  <div style={{ fontSize: 12, color: '#6d28d9' }}>Paste from Word, PDF, or Google Docs — formatting is automatically cleaned. Category & tags are auto-detected!</div>
                </div>

                {smartFillApplied && (
                  <Alert message="✨ Smart Fill Applied — Category & tags auto-detected!" type="success" showIcon closable onClose={() => setSmartFillApplied(false)} style={{ marginBottom: 10, borderRadius: 10 }} />
                )}
                {pasteProcessing && (
                  <Alert message="⏳ Processing paste content..." type="info" showIcon style={{ marginBottom: 10, borderRadius: 10 }} />
                )}

                <div onPaste={handlePaste} style={{ borderRadius: 12, overflow: 'hidden', border: '1.5px solid #e9d5ff' }}>
                  <JoditEditor ref={editorRef} value={contentValue} config={getEditorConfig()} onChange={handleEditorChange} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                  <Button icon={<EyeOutlined />} onClick={() => showPreview({}, true)} disabled={!contentValue || contentValue === '<p><br></p>'} style={{ borderRadius: 10, borderColor: '#c4b5fd', color: '#6d28d9', fontWeight: 600 }}>
                    Live Preview
                  </Button>
                </div>
              </Form.Item>
            </TabPane>

            {/* ─── MEDIA TAB ─── */}
            <TabPane tab={<span><PictureOutlined />  Media</span>} key="media">
              <div style={{ background: '#f5f3ff', borderRadius: 12, padding: '14px 18px', marginBottom: 20, border: '1px solid #e9d5ff' }}>
                <div style={{ fontSize: 13, color: '#4c1d95', fontWeight: 600 }}>📸 Image Guidelines</div>
                <div style={{ fontSize: 12, color: '#6d28d9', marginTop: 4 }}>Use high-quality images for best results. Featured image appears in blog listings; Cover image is the full-width hero banner in the preview.</div>
              </div>
              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <UploadWithCrop fileList={featuredImageList} onChange={setFeaturedImageList} aspect={3 / 2} cropTitle="Crop Featured Image (3:2)" maxSizeMB={5} label="Featured Image (Card Thumbnail)" extra="Recommended: 1200 × 800px · Max 5MB" />
                </Col>
                <Col xs={24} md={12}>
                  <UploadWithCrop fileList={coverImageList} onChange={setCoverImageList} aspect={16 / 9} cropTitle="Crop Cover / Hero Image (16:9)" maxSizeMB={5} label="Cover Image (Hero Banner)" extra="Recommended: 1920 × 1080px · Max 5MB" />
                </Col>
              </Row>
            </TabPane>

            {/* ─── AUTHOR TAB ─── */}
            <TabPane tab={<span><UserOutlined />  Author</span>} key="author">
              <Row gutter={24} align="top">
                <Col xs={24} md={16}>
                  <Form.Item name="authorName" label="Author Name">
                    <Input prefix={<UserOutlined style={{ color: '#c4b5fd' }} />} placeholder="Author's full name" size="large" style={{ borderRadius: 10 }} />
                  </Form.Item>
                  <div style={{ background: '#f5f3ff', borderRadius: 12, padding: '14px 18px', border: '1px solid #e9d5ff', marginTop: 8 }}>
                    <div style={{ fontSize: 13, color: '#4c1d95', fontWeight: 600 }}>ℹ️ Author Info</div>
                    <div style={{ fontSize: 12, color: '#6d28d9', marginTop: 4 }}>Author name and image appear below the post title in the blog preview. All fields are optional for drafts but required for publishing.</div>
                  </div>
                </Col>
                <Col xs={24} md={8}>
                  <UploadWithCrop fileList={authorImageList} onChange={setAuthorImageList} aspect={1} cropTitle="Crop Author Avatar (1:1)" maxSizeMB={2} label="Author Avatar" extra="Recommended: 400 × 400px · Max 2MB" />
                </Col>
              </Row>
            </TabPane>
          </Tabs>

          {/* Footer */}
          <div className="bm-footer-bar">
            <Space>
              <Switch checked={autoSave} onChange={setAutoSave} style={{ background: autoSave ? '#6d28d9' : undefined }} />
              <Text style={{ fontSize: 13, color: '#9ca3af' }}>Auto-save every 30s</Text>
            </Space>
            <Space size={10}>
              <Button size="large" icon={<SaveOutlined />} onClick={() => { setTargetStatus('draft'); form.submit(); }} loading={saving && targetStatus === 'draft'} className="bm-save-draft-btn">
                Save as Draft
              </Button>
              <Button type="primary" size="large" icon={editingId ? <CheckCircleOutlined /> : <RocketOutlined />} onClick={() => { setTargetStatus('published'); form.submit(); }} loading={saving && targetStatus === 'published'} className="bm-publish-btn">
                {editingId ? 'Update & Publish' : 'Publish Post'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* ─── PREVIEW MODAL ─── */}
      <Modal
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>This is how your blog will appear to readers</Text>
            <Button onClick={() => setPreviewModalVisible(false)} style={{ borderRadius: 10 }}>Close Preview</Button>
          </div>
        }
        width={screens.xs ? '98%' : 880}
        bodyStyle={{ maxHeight: '78vh', overflowY: 'auto', padding: 0 }}
        centered
        className="preview-modal"
        title={<span style={{ color: '#fff' }}><EyeOutlined style={{ marginRight: 8 }} />Blog Preview</span>}
      >
        <BlogPreview data={previewBlogData} />
      </Modal>
    </>
  );
};

export default BlogManagement;