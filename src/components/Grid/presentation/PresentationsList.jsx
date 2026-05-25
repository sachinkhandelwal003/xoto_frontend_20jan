import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiEye, FiCopy, FiTrash2, FiFileText, FiActivity,
  FiSmartphone, FiMonitor, FiClock, FiSearch,
  FiArrowLeft, FiShare2, FiBarChart2, FiCheck, FiChevronRight,
  FiTrendingUp, FiCheckCircle, FiInfo, FiExternalLink
} from 'react-icons/fi';
import { message, Spin } from 'antd';
import { apiService } from '../../../manageApi/utils/custom.apiservice';

const P = '#4A027C';
const P2 = '#7C3AED';

// ── Tracking URL builder ─────────────────────────────────────────────────────
const buildTrackingUrl = (token) =>
  `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/presentation/track/${token}`;

// ─── STAT CARD ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color, bg }) => (
  <div className="relative overflow-hidden bg-white rounded-3xl border border-purple-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6 hover:shadow-[0_15px_40px_rgba(124,58,237,0.06)] hover:border-purple-200 transition-all duration-300 hover:-translate-y-1 group">
    {/* Decorative background glow */}
    <div className="absolute -right-6 -bottom-6 w-24 height-24 rounded-full blur-2xl opacity-10 group-hover:scale-125 transition-transform duration-500" style={{ background: color }}></div>
    
    <div className="flex items-center justify-between mb-4">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ background: bg }}>
        <Icon size={18} style={{ color }} />
      </div>
    </div>
    
    <div className="flex items-baseline gap-2">
      <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</p>
    </div>
  </div>
);

// ─── PRESENTATION CARD ────────────────────────────────────────────────────────
const PresentationCard = ({ presentation, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const totalViews = presentation.views?.length || 0;
  const mobileViews = (presentation.views || []).filter(v => v.device === 'Mobile').length;
  const desktopViews = (presentation.views || []).filter(v => v.device === 'Desktop').length;

  const trackingUrl = buildTrackingUrl(presentation.trackingToken);
  const previewUrl = trackingUrl + '?preview=true';

  const handleCopyTracking = () => {
    navigator.clipboard.writeText(trackingUrl);
    setCopied(true);
    message.success('Tracking link copied successfully!');
    setTimeout(() => setCopied(false), 2000);
  };

  const waText = encodeURIComponent(
    `Hi ${presentation.clientNotes?.clientName || 'there'}! 👋\n\nPlease find your property presentation here:\n${trackingUrl}\n\n_Powered by Xoto GRID_`
  );

  return (
    <div className="group bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden hover:shadow-[0_20px_50px_rgba(124,58,237,0.08)] hover:border-purple-200/80 transition-all duration-300 flex flex-col justify-between">
      
      <div>
        {/* Top Header Section */}
        <div className="p-6 border-b border-slate-50 bg-linear-to-b from-purple-50/20 to-transparent">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-purple-50 group-hover:bg-purple-100 transition-colors duration-300">
                <FiFileText size={20} className="text-purple-600" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-800 truncate group-hover:text-purple-950 transition-colors duration-300">
                  {presentation.title || 'Untitled Presentation'}
                </h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <FiClock size={11} />
                    {presentation.createdAt
                      ? new Date(presentation.createdAt).toLocaleDateString('en-AE', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })
                      : '—'}
                  </span>
                </div>
              </div>
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 flex items-center gap-1.5 shadow-xs
              ${totalViews > 0
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                : 'bg-slate-100 text-slate-500 border border-slate-200/80'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${totalViews > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
              {totalViews > 0 ? `Active · ${totalViews} view${totalViews > 1 ? 's' : ''}` : 'Not Opened'}
            </span>
          </div>
        </div>

        {/* Analytics Breakdown Grid */}
        <div className="grid grid-cols-4 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50/50">
          {[
            { label: 'Views', value: totalViews, Icon: FiEye, color: 'text-purple-600' },
            { label: 'Mobile', value: mobileViews, Icon: FiSmartphone, color: 'text-sky-600' },
            { label: 'Desktop', value: desktopViews, Icon: FiMonitor, color: 'text-indigo-600' },
            { label: 'Engagement', value: `+${presentation.engagementScore || 0}`, Icon: FiTrendingUp, color: 'text-amber-600' },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center justify-center py-4 px-2 text-center group/item hover:bg-white transition-colors duration-200">
              <s.Icon size={14} className={`${s.color} opacity-80 group-hover/item:scale-110 transition-transform duration-200`} />
              <p className="text-xl font-black text-slate-800 mt-1">{s.value}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tag Badges */}
        <div className="px-6 py-4 flex flex-wrap gap-2 border-b border-slate-50">
          {presentation.settings?.language && (
            <span className="px-3 py-1 rounded-full bg-purple-50/60 text-purple-700 text-xs font-semibold border border-purple-100/50 flex items-center gap-1">
              🌐 {presentation.settings.language}
            </span>
          )}
          {presentation.settings?.currency && (
            <span className="px-3 py-1 rounded-full bg-indigo-50/60 text-indigo-700 text-xs font-semibold border border-indigo-100/50 flex items-center gap-1">
              💰 {presentation.settings.currency}
            </span>
          )}
          {presentation.settings?.tone && (
            <span className="px-3 py-1 rounded-full bg-amber-50/60 text-amber-700 text-xs font-semibold border border-amber-100/50 flex items-center gap-1 capitalize">
              🎯 {presentation.settings.tone}
            </span>
          )}
          {presentation.clientNotes?.clientName && (
            <span className="px-3 py-1 rounded-full bg-emerald-50/60 text-emerald-700 text-xs font-semibold border border-emerald-100/50 flex items-center gap-1">
              👤 {presentation.clientNotes.clientName}
            </span>
          )}
        </div>

        {/* Link Share UI */}
        <div className="p-6 border-b border-slate-50 space-y-3">
          <label className="text-[10px] font-bold text-purple-600 uppercase tracking-widest flex items-center gap-1">
            <FiCheckCircle size={10} /> Tracked Client Link
          </label>
          <div className="flex gap-2">
            <input
              readOnly
              value={trackingUrl}
              className="flex-1 px-4 py-2.5 rounded-2xl border border-purple-100/70 bg-purple-50/40 text-xs text-purple-750 font-medium outline-none truncate transition-all duration-350 focus:border-purple-300"
            />
            <button
              onClick={handleCopyTracking}
              title="Copy link to clipboard"
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all duration-300 flex-shrink-0 flex items-center gap-1.5
                ${copied
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-100'
                  : 'bg-white border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300'}`}>
              {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
            </button>
          </div>
        </div>

        {/* Interactive View History Dropdown */}
        {totalViews > 0 && (
          <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/30">
            <button
              onClick={() => setExpanded(p => !p)}
              className="w-full flex items-center justify-between text-xs font-bold text-purple-600 hover:text-purple-800 transition-colors">
              <span className="flex items-center gap-2">
                <FiActivity size={12} className="animate-pulse" />
                View Engagement History
              </span>
              <span className="text-[10px] bg-purple-100/80 px-2 py-0.5 rounded-full">{totalViews}</span>
            </button>
            
            {expanded && (
              <div className="mt-4 space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {[...presentation.views].reverse().map((v, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-100 shadow-xs hover:border-purple-100 transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                      {v.device === 'Mobile'
                        ? <FiSmartphone size={13} className="text-purple-600" />
                        : <FiMonitor size={13} className="text-purple-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-700">{v.device || 'Unknown Device'}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {v.timestamp
                          ? new Date(v.timestamp).toLocaleString('en-AE', {
                            day: '2-digit', month: 'short',
                            hour: '2-digit', minute: '2-digit',
                          })
                          : '—'}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                      +15 pts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons Footer */}
      <div className="p-6 bg-slate-50/50 flex gap-3 items-center">
        <a href={`https://wa.me/?text=${waText}`}
          target="_blank" rel="noreferrer"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-white transition-all hover:opacity-95 shadow-md shadow-emerald-100/40 hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)' }}>
          <FiShare2 size={13} /> Share Link
        </a>

        <a href={previewUrl} target="_blank" rel="noreferrer"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all hover:-translate-y-0.5">
          <FiEye size={13} /> Open Preview
        </a>

        <button
          onClick={() => onDelete(presentation._id)}
          title="Delete Presentation"
          className="w-10 h-10 rounded-2xl flex items-center justify-center border border-rose-100 text-rose-500 bg-rose-50/50 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all duration-300 hover:scale-105">
          <FiTrash2 size={14} />
        </button>
      </div>
    </div>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const PresentationsList = () => {
  const navigate = useNavigate();
  const [presentations, setPresentations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, total: 0 });

  const fetchPresentations = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await apiService.get(`/presentation/my?page=${page}&limit=10`);
      const data = res?.data?.success !== undefined ? res.data : res;
      setPresentations(data?.data || []);
      setPagination({ page, total: data?.pagination?.total || 0 });
    } catch {
      message.error('Failed to load presentations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPresentations(); }, [fetchPresentations]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this presentation?')) return;
    try {
      await apiService.delete(`/presentation/${id}`);
      message.success('Presentation deleted successfully');
      fetchPresentations(pagination.page);
    } catch {
      message.error('Failed to delete presentation');
    }
  };

  const totalViews = presentations.reduce((a, p) => a + (p.views?.length || 0), 0);
  const totalScore = presentations.reduce((a, p) => a + (p.engagementScore || 0), 0);
  const openedCount = presentations.filter(p => p.views?.length > 0).length;

  const filtered = presentations.filter(p =>
    !search ||
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.clientNotes?.clientName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans relative overflow-hidden pb-12">
      {/* Decorative blurry background circles */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-purple-200/20 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-indigo-200/20 blur-3xl pointer-events-none"></div>

      {/* Top Glassmorphic Navigation Bar */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-slate-350 hover:text-slate-800 transition-all duration-200">
              <FiArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-lg font-black text-slate-800 tracking-tight">AI Presentations</h1>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">{pagination.total} total presentations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8 relative">

        {/* Upgrade Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard label="Total Generated" value={pagination.total} icon={FiFileText} color={P} bg="#f5f3ff" />
          <StatCard label="Unique Opened" value={openedCount} icon={FiCheckCircle} color="#059669" bg="#f0fdf4" />
          <StatCard label="Total Views" value={totalViews} icon={FiEye} color="#2563eb" bg="#eff6ff" />
          <StatCard label="Engagement Score" value={`+${totalScore}`} icon={FiBarChart2} color="#d97706" bg="#fffbeb" />
        </div>

        {/* Beautiful info legends */}
        <div className="flex gap-4 flex-wrap text-xs">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-purple-50/80 border border-purple-100/50 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            <span className="font-bold text-purple-950">Tracked Link</span>
            <span className="text-purple-600/80">— Share this with client. Logs and scores every single view.</span>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-50/80 border border-slate-200/50 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <span className="font-bold text-slate-650">Preview Link</span>
            <span className="text-slate-500/80">— Click to preview. View counts and history are not tracked.</span>
          </div>
        </div>

        {/* Upgraded Premium Search section */}
        <div className="relative group">
          <FiSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search presentations by title, client name or keywords…"
            className="w-full pl-12 pr-6 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-300 shadow-sm shadow-slate-100/40"
          />
        </div>

        {/* Content Listing Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Spin size="large" />
            <p className="text-slate-400 text-xs font-semibold tracking-wider uppercase">Loading Presentations...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 p-8 text-center max-w-lg mx-auto shadow-xs gap-4">
            <div className="w-16 h-16 rounded-3xl bg-purple-50 flex items-center justify-center text-purple-600">
              <FiFileText size={28} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">No presentations found</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1.5 leading-relaxed">
                Start generating branded property presentations by navigating to your leads list and selecting a suggested property card.
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="mt-2 px-6 py-2.5 bg-purple-600 text-white rounded-2xl text-xs font-bold hover:bg-purple-750 transition-all hover:shadow-lg shadow-purple-200 hover:-translate-y-0.5">
              Go To Leads
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map(p => (
              <PresentationCard key={p._id} presentation={p} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {/* Premium Pagination */}
        {pagination.total > 10 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            <button disabled={pagination.page === 1}
              onClick={() => fetchPresentations(pagination.page - 1)}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-40 disabled:hover:bg-transparent hover:bg-white hover:border-slate-300 transition-all duration-200 flex items-center gap-1">
              ← Previous
            </button>
            <span className="px-4 py-2.5 text-xs text-slate-500 font-bold bg-white border border-slate-100 rounded-2xl">Page {pagination.page}</span>
            <button disabled={pagination.page * 10 >= pagination.total}
              onClick={() => fetchPresentations(pagination.page + 1)}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-40 disabled:hover:bg-transparent hover:bg-white hover:border-slate-300 transition-all duration-200 flex items-center gap-1">
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PresentationsList;