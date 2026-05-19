import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiEye, FiCopy, FiTrash2, FiFileText, FiActivity,
  FiSmartphone, FiMonitor, FiClock, FiSearch,
  FiArrowLeft, FiShare2, FiBarChart2,
} from 'react-icons/fi';
import { message, Spin } from 'antd';
import { apiService } from '../../../manageApi/utils/custom.apiservice';

const P = '#4A027C';
const P2 = '#7C3AED';
const GR = `linear-gradient(135deg, ${P} 0%, ${P2} 100%)`;

// ── Tracking URL builder ─────────────────────────────────────────────────────
// Yeh backend tracking route hai — view log hoga, tab HTML serve hoga
const buildTrackingUrl = (token) =>
  `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/presentation/track/${token}`;

// S3 direct URL — agent preview ke liye, no tracking
// const buildPreviewUrl = (s3Url) => s3Url;

// ─── STAT CARD ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color, bg }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</span>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bg }}>
        <Icon size={16} style={{ color }} />
      </div>
    </div>
    <p className="text-3xl font-extrabold text-gray-900">{value}</p>
  </div>
);

// ─── PRESENTATION CARD ────────────────────────────────────────────────────────
const PresentationCard = ({ presentation, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const totalViews = presentation.views?.length || 0;
  const mobileViews = (presentation.views || []).filter(v => v.device === 'Mobile').length;
  const desktopViews = (presentation.views || []).filter(v => v.device === 'Desktop').length;

  // ✅ Client ke liye — Tracking URL (view log hoga)
  const trackingUrl = buildTrackingUrl(presentation.trackingToken);

  // ✅ Agent preview ke liye — S3 direct URL (no tracking)
  const previewUrl = trackingUrl + '?preview=true';

  const handleCopyTracking = () => {
    navigator.clipboard.writeText(trackingUrl);
    setCopied(true);
    message.success('Tracking link copied — share this with client!');
    setTimeout(() => setCopied(false), 2000);
  };

  const waText = encodeURIComponent(
    `Hi ${presentation.clientNotes?.clientName || 'there'}! 👋\n\nPlease find your property presentation here:\n${trackingUrl}\n\n_Powered by Xoto GRID_`
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">

      {/* Header */}
      <div className="p-5 border-b border-gray-50">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#f5f3ff' }}>
              <FiFileText size={18} style={{ color: P }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{presentation.title || 'Untitled'}</p>
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                <FiClock size={10} />
                {presentation.createdAt
                  ? new Date(presentation.createdAt).toLocaleDateString('en-AE', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })
                  : '—'}
              </p>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex-shrink-0
            ${totalViews > 0
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
            {totalViews > 0 ? `👁 ${totalViews} view${totalViews > 1 ? 's' : ''}` : 'Not opened'}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 divide-x divide-gray-100 border-b border-gray-100">
        {[
          { label: 'Views', value: totalViews, Icon: FiEye },
          { label: 'Mobile', value: mobileViews, Icon: FiSmartphone },
          { label: 'Desktop', value: desktopViews, Icon: FiMonitor },
          { label: 'Score', value: `+${presentation.engagementScore || 0}`, Icon: FiBarChart2 },
        ].map((s, i) => (
          <div key={i} className="flex flex-col items-center justify-center py-3 gap-1">
            <s.Icon size={13} className="text-gray-400" />
            <p className="text-lg font-extrabold text-gray-900">{s.value}</p>
            <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tags */}
      <div className="px-5 py-3 flex flex-wrap gap-2 border-b border-gray-100">
        {presentation.settings?.language && (
          <span className="px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-100">
            🌐 {presentation.settings.language}
          </span>
        )}
        {presentation.settings?.currency && (
          <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">
            💰 {presentation.settings.currency}
          </span>
        )}
        {presentation.settings?.tone && (
          <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100 capitalize">
            🎯 {presentation.settings.tone}
          </span>
        )}
        {presentation.clientNotes?.clientName && (
          <span className="px-2 py-0.5 rounded-lg bg-green-50 text-green-700 text-[10px] font-bold border border-green-100">
            👤 {presentation.clientNotes.clientName}
          </span>
        )}
      </div>

      {/* URL Display */}
      <div className="px-5 py-3 border-b border-gray-100 space-y-2">
        {/* Tracking URL — client ke liye */}
        <div>
          <p className="text-[9px] font-bold text-purple-600 uppercase tracking-widest mb-1">
            🔗 Client Link (Tracked)
          </p>
          <div className="flex gap-2">
            <input
              readOnly
              value={trackingUrl}
              className="flex-1 px-3 py-1.5 rounded-lg border border-purple-100 bg-purple-50 text-[11px] text-purple-700 font-medium outline-none truncate"
            />
            <button
              onClick={handleCopyTracking}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all flex-shrink-0
                ${copied
                  ? 'bg-green-50 border-green-300 text-green-700'
                  : 'bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100'}`}>
              {copied ? '✓' : <FiCopy size={11} />}
            </button>
          </div>
        </div>
      </div>

      {/* View History */}
      {totalViews > 0 && (
        <div className="px-5 py-3 border-b border-gray-100">
          <button
            onClick={() => setExpanded(p => !p)}
            className="flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:underline">
            <FiActivity size={11} />
            {expanded ? 'Hide' : 'Show'} view history ({totalViews})
          </button>
          {expanded && (
            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
              {[...presentation.views].reverse().map((v, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    {v.device === 'Mobile'
                      ? <FiSmartphone size={12} style={{ color: P }} />
                      : <FiMonitor size={12} style={{ color: P }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-700">{v.device || 'Unknown'}</p>
                    <p className="text-[10px] text-gray-400">
                      {v.timestamp
                        ? new Date(v.timestamp).toLocaleString('en-AE', {
                          day: '2-digit', month: 'short',
                          hour: '2-digit', minute: '2-digit',
                        })
                        : '—'}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-lg border border-green-100">
                    +15 pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-5 py-3 flex gap-2 flex-wrap">

        {/* WhatsApp — tracking URL bhejo */}
        <a href={`https://wa.me/?text=${waText}`}
          target="_blank" rel="noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
          style={{ background: '#25D366' }}>
          <FiShare2 size={11} /> Share (Tracked)
        </a>

        {/* Preview — S3 direct, agent ke liye */}
        <a href={previewUrl} target="_blank" rel="noreferrer"
          className="...">
          <FiEye size={11} /> Preview
        </a>

        {/* Delete */}
        <button
          onClick={() => onDelete(presentation._id)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-red-100 text-red-500 bg-red-50 hover:bg-red-100 transition-all ml-auto">
          <FiTrash2 size={11} /> Delete
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
    if (!window.confirm('Delete this presentation?')) return;
    try {
      await apiService.delete(`/presentation/${id}`);
      message.success('Deleted');
      fetchPresentations(pagination.page);
    } catch {
      message.error('Delete failed');
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
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50">
              <FiArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-base font-extrabold text-gray-900">My Presentations</h1>
              <p className="text-xs text-gray-400">{pagination.total} total</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total" value={pagination.total} icon={FiFileText} color={P} bg="#f5f3ff" />
          <StatCard label="Opened" value={openedCount} icon={FiEye} color="#059669" bg="#f0fdf4" />
          <StatCard label="Views" value={totalViews} icon={FiActivity} color="#2563eb" bg="#eff6ff" />
          <StatCard label="Score" value={`+${totalScore}`} icon={FiBarChart2} color="#d97706" bg="#fffbeb" />
        </div>

        {/* Legend */}
        <div className="flex gap-4 flex-wrap text-xs">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-50 border border-purple-100">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            <span className="font-semibold text-purple-700">Tracked Link</span>
            <span className="text-purple-500">— Share with client, logs every view</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200">
            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
            <span className="font-semibold text-gray-600">Preview</span>
            <span className="text-gray-400">— Agent preview only, view not tracked</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <FiSearch size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title or client name…"
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm text-gray-800 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all shadow-sm"
          />
        </div>

        {/* List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Spin size="large" />
            <p className="mt-4 text-gray-400 text-sm">Loading…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <FiFileText size={48} className="text-gray-200" />
            <p className="text-gray-400 text-sm font-medium">No presentations yet</p>
            <p className="text-gray-400 text-xs">Go to a lead → property card → Generate Presentation</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map(p => (
              <PresentationCard key={p._id} presentation={p} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.total > 10 && (
          <div className="flex justify-center gap-2">
            <button disabled={pagination.page === 1}
              onClick={() => fetchPresentations(pagination.page - 1)}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 disabled:opacity-40 hover:bg-gray-50">
              ← Prev
            </button>
            <span className="px-4 py-2 text-sm text-gray-500 font-medium">Page {pagination.page}</span>
            <button disabled={pagination.page * 10 >= pagination.total}
              onClick={() => fetchPresentations(pagination.page + 1)}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 disabled:opacity-40 hover:bg-gray-50">
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PresentationsList;