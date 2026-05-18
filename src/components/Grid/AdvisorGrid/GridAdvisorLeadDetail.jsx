// ════════════════════════════════════════════════════════════════════════════
// GridAdvisorLeadDetail.jsx
// Advisor ka complete lead detail page:
//   • Smart matched properties dekhna + directly suggest karna
//   • Manual property search karke suggest karna
//   • Client reactions record karna (interested / not_interested / maybe)
//   • Lead status update (flow-enforced)
//   • Notes add karna
//   • Status timeline
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiUser, FiHome, FiClock, FiPhone, FiMail, FiMapPin, FiDollarSign,
  FiCalendar, FiMessageSquare, FiTag, FiAlertCircle, FiActivity, FiLayers,
  FiArrowLeft, FiImage, FiInfo, FiXCircle, FiCheckCircle, FiSearch,
  FiChevronDown, FiChevronUp, FiAlertTriangle, FiFileText, FiRefreshCw,
  FiLoader, FiX, FiPlus, FiSend, FiEdit3, FiThumbsUp, FiThumbsDown,
  FiMinus, FiZap, FiList, FiArrowRight, FiStar, FiPackage
} from 'react-icons/fi';
import { message, Spin } from 'antd';
import { apiService } from '../../../manageApi/utils/custom.apiservice';

// ─── THEME ───────────────────────────────────────────────────────────────────
const P  = '#4A027C';
const P2 = '#7C3AED';
const GR = `linear-gradient(135deg, ${P} 0%, ${P2} 100%)`;

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  new:                  { label: 'New',                  bg: '#dbeafe', text: '#1e40af' },
  contacted:            { label: 'Contacted',            bg: '#fef3c7', text: '#92400e' },
  in_discussion:        { label: 'In Discussion',        bg: '#fef9c3', text: '#854d0e' },
  site_visit_scheduled: { label: 'Site Visit Scheduled', bg: '#f3e8ff', text: '#6b21a8' },
  offer_made:           { label: 'Offer Made',           bg: '#cffafe', text: '#0e7490' },
  reserved:             { label: 'Reserved',             bg: '#e0e7ff', text: '#3730a3' },
  spa_signed:           { label: 'SPA Signed',           bg: '#dcfce7', text: '#166534' },
  completed:            { label: 'Completed',            bg: '#bbf7d0', text: '#14532d' },
  not_proceeding:       { label: 'Not Proceeding',       bg: '#fee2e2', text: '#991b1b' },
};

const STATUS_FLOW = [
  'new','contacted','in_discussion','site_visit_scheduled',
  'offer_made','reserved','spa_signed','completed',
];

const REACTION_CONFIG = {
  interested:     { label: 'Interested',     bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', Icon: FiThumbsUp   },
  not_interested: { label: 'Not Interested', bg: '#fef2f2', color: '#dc2626', border: '#fecaca', Icon: FiThumbsDown },
  maybe:          { label: 'Maybe',          bg: '#fffbeb', color: '#d97706', border: '#fde68a', Icon: FiMinus      },
  pending:        { label: 'Pending',        bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb', Icon: FiClock      },
};

// ─── ATOMS ───────────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const s = STATUS_CONFIG[status] || { label: status || '—', bg: '#f3f4f6', text: '#374151' };
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-bold"
      style={{ background: s.bg, color: s.text }}>
      {s.label}
    </span>
  );
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: '#F5F3FF' }}>
      <Icon size={13} style={{ color: P }} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{label}</p>
      <p className="text-sm text-gray-800 font-medium mt-0.5 break-words leading-snug">{value || '—'}</p>
    </div>
  </div>
);

const SectionBox = ({ title, icon: Icon, children, action, accent }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white"
        style={{ background: accent || GR }}>
        <Icon size={14} />
      </div>
      <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest flex-1">{title}</h4>
      {action}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const Btn = ({ children, onClick, variant = 'primary', loading, disabled, size = 'md', className = '' }) => {
  const base = 'flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:pointer-events-none';
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-5 py-2.5 text-sm', lg: 'px-7 py-3 text-sm' };
  const vars = {
    primary: 'text-white shadow-md hover:shadow-lg hover:-translate-y-0.5',
    ghost:   'border border-gray-200 text-gray-600 bg-white hover:bg-gray-50',
    danger:  'border border-red-200 text-red-600 bg-red-50 hover:bg-red-100',
    success: 'text-white shadow-md hover:shadow-lg',
    amber:   'text-white shadow-md hover:shadow-lg',
  };
  const bgs = {
    primary: GR,
    success: 'linear-gradient(135deg,#059669,#10b981)',
    amber:   'linear-gradient(135deg,#d97706,#f59e0b)',
  };
  return (
    <button className={`${base} ${sizes[size]} ${vars[variant]} ${className}`}
      style={bgs[variant] ? { background: bgs[variant] } : {}}
      onClick={onClick} disabled={disabled || loading}>
      {loading ? <FiLoader size={14} className="animate-spin" /> : children}
    </button>
  );
};

// ─── REACTION PILL ────────────────────────────────────────────────────────────
const ReactionPill = ({ reaction }) => {
  const cfg = REACTION_CONFIG[reaction] || REACTION_CONFIG.pending;
  const { Icon } = cfg;
  return (
    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border"
      style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>
      <Icon size={11} /> {cfg.label}
    </span>
  );
};

// ─── PROPERTY MINI CARD (for smart matches + suggestions) ─────────────────────
const PropertyCard = ({ property, onSuggest, alreadySuggested, suggesting, compact = false }) => {
  const price = property.price_min || property.price || 0;
  const loc   = [property.area, property.city].filter(Boolean).join(', ');

  return (
    <div className={`rounded-2xl border overflow-hidden bg-white transition-all hover:shadow-md
      ${alreadySuggested ? 'border-purple-200 ring-1 ring-purple-100' : 'border-gray-100'}`}>
      {!compact && (
        <div className="h-28 bg-slate-100 relative overflow-hidden">
          {property.mainLogo
            ? <img src={property.mainLogo} alt={property.propertyName} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-slate-300"><FiImage size={28} /></div>}
          {property.isFeatured && (
            <span className="absolute top-2 left-2 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Featured</span>
          )}
          {alreadySuggested && (
            <span className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase"
              style={{ background: P, color: '#fff' }}>Suggested ✓</span>
          )}
        </div>
      )}
      <div className="p-3.5">
        <div className="text-sm font-bold text-gray-900 truncate leading-snug">{property.propertyName || property.title}</div>
        {loc && <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1 truncate"><FiMapPin size={10} /> {loc}</div>}
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
          <span className="text-sm font-extrabold" style={{ color: P }}>
            {price > 0 ? `AED ${Number(price).toLocaleString()}` : 'On Request'}
          </span>
          <div className="flex gap-1.5 text-[10px] text-gray-400 font-medium">
            {property.bedrooms > 0 && <span>{property.bedrooms}BR</span>}
            {property.bathrooms > 0 && <span>· {property.bathrooms}BA</span>}
          </div>
        </div>
      </div>
      <div className="px-3.5 pb-3.5">
        <Btn size="sm"
          variant={alreadySuggested ? 'ghost' : 'primary'}
          disabled={alreadySuggested || suggesting}
          loading={suggesting}
          onClick={() => onSuggest(property._id)}
          className="w-full">
          {alreadySuggested ? <><FiCheckCircle size={12} /> Suggested</> : <><FiSend size={12} /> Suggest to Client</>}
        </Btn>
      </div>
    </div>
  );
};

// ─── SUGGEST MODAL (with note) ────────────────────────────────────────────────
const SuggestModal = ({ property, leadId, onClose, onSuccess }) => {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSuggest = async () => {
    setLoading(true);
    try {
      const res  = await apiService.post(`/gridlead/${leadId}/suggest-property`, {
        property_id: property._id,
        note: note.trim(),
      });
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success) {
        message.success('Property suggested to client');
        onSuccess();
        onClose();
      } else {
        message.error(data?.message || 'Failed to suggest property');
      }
    } catch (e) {
      message.error(e?.response?.data?.message || 'Failed to suggest property');
    } finally {
      setLoading(false);
    }
  };

  const price = property.price_min || property.price || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between" style={{ background: GR }}>
          <div>
            <h3 className="text-base font-extrabold text-white">Suggest Property to Client</h3>
            <p className="text-xs text-white/70 mt-0.5">Add a note to explain why this property fits</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30">
            <FiX size={16} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {/* Property preview */}
          <div className="flex gap-3 p-3.5 rounded-xl border border-gray-100 bg-gray-50">
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-200">
              {property.mainLogo
                ? <img src={property.mainLogo} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-slate-300"><FiImage size={20} /></div>}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{property.propertyName || property.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{[property.area, property.city].filter(Boolean).join(', ')}</p>
              <p className="text-sm font-extrabold mt-1" style={{ color: P }}>
                {price > 0 ? `AED ${Number(price).toLocaleString()}` : 'On Request'}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Note for Client (optional)</p>
            <textarea rows={3} value={note} onChange={e => setNote(e.target.value)}
              placeholder="Why this property fits their requirements..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all resize-none" />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3 justify-end">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={handleSuggest} loading={loading}>
            <FiSend size={14} /> Suggest Property
          </Btn>
        </div>
      </div>
    </div>
  );
};

// ─── RECORD CLIENT REACTION MODAL ────────────────────────────────────────────
const ReactionModal = ({ suggestion, leadId, onClose, onSuccess }) => {
  const [reaction, setReaction] = useState(suggestion?.client_reaction === 'pending' ? '' : suggestion?.client_reaction || '');
  const [loading, setLoading] = useState(false);

  const options = [
    { value: 'interested',     label: 'Interested',     icon: FiThumbsUp,   color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
    { value: 'not_interested', label: 'Not Interested', icon: FiThumbsDown, color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
    { value: 'maybe',          label: 'Maybe',          icon: FiMinus,      color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  ];

  const handleSave = async () => {
    if (!reaction) return message.warning('Please select a reaction');
    setLoading(true);
    try {
      const res = await apiService.put(`/gridlead/${leadId}/suggestion-reaction`, {
        property_id: suggestion.property_id?._id || suggestion.property_id,
        reaction,
      });
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success) {
        message.success('Client reaction recorded');
        onSuccess();
        onClose();
      } else {
        message.error(data?.message || 'Failed to record reaction');
      }
    } catch (e) {
      message.error(e?.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const propName = typeof suggestion.property_id === 'object'
    ? (suggestion.property_id?.propertyName || 'Property')
    : 'Property';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between" style={{ background: GR }}>
          <div>
            <h3 className="text-base font-extrabold text-white">Record Client Reaction</h3>
            <p className="text-xs text-white/70 mt-0.5 truncate max-w-xs">{propName}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30">
            <FiX size={16} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-xs text-gray-500 font-medium">What was the client's response to this property?</p>
          <div className="grid grid-cols-3 gap-3">
            {options.map(o => {
              const Icon = o.icon;
              return (
                <button key={o.value} onClick={() => setReaction(o.value)}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all`}
                  style={reaction === o.value
                    ? { background: o.bg, borderColor: o.border, color: o.color }
                    : { background: '#f9fafb', borderColor: '#e5e7eb', color: '#6b7280' }}>
                  <Icon size={22} />
                  <span className="text-xs font-bold">{o.label}</span>
                  {reaction === o.value && <FiCheckCircle size={14} />}
                </button>
              );
            })}
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3 justify-end">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={handleSave} loading={loading} disabled={!reaction}>
            <FiCheckCircle size={14} /> Record Reaction
          </Btn>
        </div>
      </div>
    </div>
  );
};

// ─── STATUS UPDATE MODAL ──────────────────────────────────────────────────────
const StatusModal = ({ lead, onClose, onSuccess }) => {
  const current = lead?.status || 'new';
  const [status, setStatus] = useState(current);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (status === current) return onClose();
    setLoading(true);
    try {
      const res = await apiService.put(`/gridlead/${lead._id}/status`, { status, notes });
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success) {
        message.success(`Status updated to "${STATUS_CONFIG[status]?.label || status}"`);
        onSuccess();
        onClose();
      } else {
        message.error(data?.message || 'Update failed');
      }
    } catch (e) {
      message.error(e?.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  // Build allowed options — can only go forward (or to not_proceeding)
  const currIdx = STATUS_FLOW.indexOf(current);
  const allowed = STATUS_FLOW.filter((_, i) => i >= currIdx).concat(['not_proceeding'])
    .filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between" style={{ background: GR }}>
          <div>
            <h3 className="text-base font-extrabold text-white">Update Lead Status</h3>
            <p className="text-xs text-white/70 mt-0.5">Progress can only move forward in the workflow</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30">
            <FiX size={16} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {/* Current */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-xs text-gray-500 font-medium">Current:</span>
            <StatusBadge status={current} />
          </div>

          {/* Status grid */}
          <div className="grid grid-cols-2 gap-2">
            {allowed.map(s => {
              const cfg = STATUS_CONFIG[s];
              const isSelected = status === s;
              const isCurrent  = s === current;
              return (
                <button key={s} onClick={() => setStatus(s)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${isCurrent ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={isSelected
                    ? { background: cfg.bg, borderColor: cfg.text, color: cfg.text }
                    : { background: '#f9fafb', borderColor: '#e5e7eb', color: '#374151' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{cfg?.label || s}</span>
                    {isSelected && <FiCheckCircle size={13} />}
                  </div>
                </button>
              );
            })}
          </div>

          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Note (optional)</p>
            <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Client confirmed visit for Saturday..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all resize-none" />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3 justify-end">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={handleUpdate} loading={loading}>
            <FiCheckCircle size={14} /> Update Status
          </Btn>
        </div>
      </div>
    </div>
  );
};

// ─── ADD NOTE MODAL ───────────────────────────────────────────────────────────
const NoteModal = ({ leadId, onClose, onAdded }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  // Advisor uses the advisor update-lead-requirements path for notes?
  // Actually there's no dedicated advisor note endpoint in routes — advisors push notes via status update
  // We'll simulate by calling updateMyLeadStatus with notes only (same status)
  // OR — we can use the lead update which already pushes to notes internally
  // Looking at the route: PUT /:id/status — includes notes in status_history + lead.notes
  // For a pure note, we'll re-use that endpoint with current status

  const handleAdd = async () => {
    if (!text.trim()) return message.warning('Note text is required');
    setLoading(true);
    try {
      // We hit the status endpoint keeping the same status, which pushes a note
      const res = await apiService.post(`/gridlead/${leadId}/note-advisor`, { text: text.trim() });
      // Fallback if dedicated endpoint doesn't exist — use status with note
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success) {
        message.success('Note added');
        onAdded(data.data);
        onClose();
      } else {
        message.error(data?.message || 'Failed');
      }
    } catch {
      message.error('Note endpoint not available — use status update with notes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between" style={{ background: GR }}>
          <h3 className="text-base font-extrabold text-white">Add Note</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30">
            <FiX size={16} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <textarea rows={5} value={text} autoFocus onChange={e => setText(e.target.value)}
            placeholder="Write your note about this lead or client..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all resize-none" />
          <div className="flex gap-3 justify-end">
            <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
            <Btn variant="primary" onClick={handleAdd} loading={loading}>
              <FiPlus size={14} /> Add Note
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── PROPERTY SEARCH PANEL ────────────────────────────────────────────────────
const PropertySearchPanel = ({ leadId, alreadySuggestedIds, onSuggested }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestingId, setSuggestingId] = useState(null);
  const [showSuggestModal, setShowSuggestModal] = useState(null); // property obj
  const debounceRef = useRef(null);

  const search = useCallback(async (q) => {
    if (!q.trim()) return setResults([]);
    setLoading(true);
    try {
      const res = await apiService.get(`/properties?search=${encodeURIComponent(q)}&limit=8&approvalStatus=approved&listingStatus=active`);
      const data = res?.data?.data || res?.data || [];
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 400);
  };

  const handleSuggestDone = () => {
    setShowSuggestModal(null);
    onSuggested();
  };

  return (
    <div>
      {showSuggestModal && (
        <SuggestModal
          property={showSuggestModal}
          leadId={leadId}
          onClose={() => setShowSuggestModal(null)}
          onSuccess={handleSuggestDone}
        />
      )}

      {/* Search bar */}
      <div className="relative">
        <FiSearch size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={handleInput}
          placeholder="Search by property name, area, or developer..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
        />
        {loading && <FiLoader size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-purple-400 animate-spin" />}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-4 space-y-2">
          {results.map((p, i) => {
            const price = p.price_min || p.price || 0;
            const loc   = [p.area, p.city].filter(Boolean).join(', ');
            const isSuggested = alreadySuggestedIds.includes(String(p._id));
            return (
              <div key={p._id || i}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-sm
                  ${isSuggested ? 'border-purple-100 bg-purple-50' : 'border-gray-100 bg-white'}`}>
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                  {p.mainLogo
                    ? <img src={p.mainLogo} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-slate-300"><FiImage size={18} /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{p.propertyName || p.title}</p>
                  {loc && <p className="text-xs text-gray-400 mt-0.5 truncate"><FiMapPin size={9} className="inline mr-1" />{loc}</p>}
                  <p className="text-xs font-bold mt-1" style={{ color: P }}>
                    {price > 0 ? `AED ${Number(price).toLocaleString()}` : 'On Request'}
                    {p.bedrooms > 0 && ` · ${p.bedrooms}BR`}
                  </p>
                </div>
                <Btn size="sm"
                  variant={isSuggested ? 'ghost' : 'primary'}
                  disabled={isSuggested || suggestingId === p._id}
                  loading={suggestingId === p._id}
                  onClick={() => !isSuggested && setShowSuggestModal(p)}>
                  {isSuggested ? <><FiCheckCircle size={11} /> Suggested</> : <><FiSend size={11} /> Suggest</>}
                </Btn>
              </div>
            );
          })}
        </div>
      )}

      {!loading && query.trim() && results.length === 0 && (
        <div className="mt-4 text-center py-6 text-gray-400 text-sm">
          <FiSearch size={28} className="mx-auto mb-2 opacity-30" />
          No properties found for "{query}"
        </div>
      )}

      {!query.trim() && (
        <div className="mt-4 text-center py-6 text-gray-400 text-sm">
          <FiSearch size={28} className="mx-auto mb-2 opacity-30" />
          Search the property catalogue to suggest alternatives
        </div>
      )}
    </div>
  );
};

// ─── UPDATE REQUIREMENTS PANEL ────────────────────────────────────────────────
const UpdateReqModal = ({ lead, onClose, onSuccess }) => {
  const req = lead?.requirements || {};
  const [form, setForm] = useState({
    property_type:   req.property_type    || '',
    transaction_type: req.transaction_type || 'buy',
    budget_min:      req.budget_min       || '',
    budget_max:      req.budget_max       || '',
    bedrooms:        req.bedrooms ?? '',
    bathrooms:       req.bathrooms ?? '',
    furnished:       req.furnished        || 'any',
    additional_notes: req.additional_notes || '',
    location_preferences: (req.location_preferences || []).map(l => typeof l === 'string' ? l : l.area),
  });
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        requirements: {
          ...form,
          budget_min: form.budget_min ? Number(form.budget_min) : undefined,
          budget_max: form.budget_max ? Number(form.budget_max) : undefined,
          bedrooms:   form.bedrooms !== '' ? Number(form.bedrooms) : undefined,
          bathrooms:  form.bathrooms !== '' ? Number(form.bathrooms) : undefined,
          location_preferences: form.location_preferences.filter(l => l.trim()).map(l => ({ area: l })),
        },
        reason: reason || 'Requirements updated by advisor',
      };
      const res = await apiService.put(`/gridlead/${lead._id}/update-requirements`, payload);
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success) {
        message.success('Requirements updated. Fresh matches loaded.');
        onSuccess(data);
      } else {
        message.error(data?.message || 'Update failed');
      }
    } catch (e) {
      message.error(e?.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all';
  const selCls   = inputCls + ' appearance-none';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white w-full sm:rounded-3xl sm:max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-5 flex items-center justify-between flex-shrink-0" style={{ background: GR }}>
          <div>
            <h3 className="text-base font-extrabold text-white">Update Requirements</h3>
            <p className="text-xs text-white/70 mt-0.5">Fresh property matches will be generated</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30">
            <FiX size={16} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Property Type</label>
              <div className="relative">
                <select value={form.property_type} onChange={e => set('property_type', e.target.value)} className={selCls}>
                  <option value="">Any type</option>
                  {['Apartment','Villa','Townhouse','Penthouse','Studio','Office','Retail','Land'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <FiChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Transaction</label>
              <div className="relative">
                <select value={form.transaction_type} onChange={e => set('transaction_type', e.target.value)} className={selCls}>
                  <option value="buy">Buy</option>
                  <option value="rent">Rent</option>
                  <option value="invest">Invest</option>
                </select>
                <FiChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Min Budget (AED)</label>
              <input type="number" value={form.budget_min} placeholder="500,000" onChange={e => set('budget_min', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Max Budget (AED)</label>
              <input type="number" value={form.budget_max} placeholder="2,000,000" onChange={e => set('budget_max', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Bedrooms</label>
              <div className="relative">
                <select value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} className={selCls}>
                  <option value="">Any</option>
                  {[0,1,2,3,4,5,6].map(n => <option key={n} value={n}>{n === 0 ? 'Studio' : `${n} BR`}</option>)}
                </select>
                <FiChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Furnished</label>
              <div className="relative">
                <select value={form.furnished} onChange={e => set('furnished', e.target.value)} className={selCls}>
                  <option value="any">Any</option>
                  <option value="furnished">Furnished</option>
                  <option value="unfurnished">Unfurnished</option>
                  <option value="semi_furnished">Semi Furnished</option>
                </select>
                <FiChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Locations */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Location Preferences</label>
            <div className="space-y-2">
              {form.location_preferences.map((loc, i) => (
                <div key={i} className="flex gap-2">
                  <div className="relative flex-1">
                    <FiMapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={loc} placeholder="e.g. Dubai Marina"
                      onChange={e => {
                        const locs = [...form.location_preferences];
                        locs[i] = e.target.value;
                        set('location_preferences', locs);
                      }}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
                  </div>
                  <button onClick={() => set('location_preferences', form.location_preferences.filter((_, idx) => idx !== i))}
                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-400 hover:bg-red-100 transition-colors">
                    <FiX size={14} />
                  </button>
                </div>
              ))}
              <button onClick={() => set('location_preferences', [...form.location_preferences, ''])}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors">
                <FiPlus size={13} /> Add Location
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Additional Notes</label>
            <textarea rows={2} value={form.additional_notes} onChange={e => set('additional_notes', e.target.value)}
              placeholder="Special requirements…"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all resize-none" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Reason for Update</label>
            <input value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Client increased budget"
              className={inputCls} />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end flex-shrink-0">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={handleSave} loading={loading}>
            <FiRefreshCw size={14} /> Update & Re-match
          </Btn>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════
const GridAdvisorLeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lead,         setLead]         = useState(null);
  const [pageLoading,  setPageLoading]  = useState(true);
  const [matches,      setMatches]      = useState([]);
  const [matchType,    setMatchType]    = useState('');
  const [matchNote,    setMatchNote]    = useState('');
  const [matchLoading, setMatchLoading] = useState(false);
  const [isNurturing,  setIsNurturing]  = useState(false);

  // Active tab on right panel
  const [activeTab, setActiveTab] = useState('matches'); // matches | suggest | suggestions

  // Modals
  const [showStatus,   setShowStatus]   = useState(false);
  const [showNote,     setShowNote]     = useState(false);
  const [showReqs,     setShowReqs]     = useState(false);
  const [suggestModal, setSuggestModal] = useState(null); // property obj from matches
  const [reactionModal, setReactionModal] = useState(null); // suggestion obj

  // Collapsibles
  const [showNotes,   setShowNotes]   = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchLead = useCallback(async () => {
    setPageLoading(true);
    try {
      const res  = await apiService.get(`/gridlead/${id}`);
      const data = res?.data?.data || res?.data;
      setLead(data);
    } catch {
      message.error('Failed to load lead');
    } finally {
      setPageLoading(false);
    }
  }, [id]);

  const fetchMatches = useCallback(async () => {
    setMatchLoading(true);
    try {
      const res     = await apiService.get(`/gridlead/${id}/smart-matches`);
      const payload = res?.data?.success !== undefined ? res.data : res;
      setMatches(payload?.data || []);
      setMatchType(payload?.matchType || '');
      setMatchNote(payload?.note || '');
      setIsNurturing(payload?.is_nurturing || false);
    } catch {
      setMatches([]);
      setMatchType('none');
    } finally {
      setMatchLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) { fetchLead(); fetchMatches(); }
  }, [id, fetchLead, fetchMatches]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const fn      = lead?.contact_info?.name?.first_name || '';
  const ln      = lead?.contact_info?.name?.last_name  || '';
  const phone   = lead?.contact_info?.mobile?.number   || '—';
  const cc      = lead?.contact_info?.mobile?.country_code || '';
  const email   = lead?.contact_info?.email?.address   || null;
  const req     = lead?.requirements || {};
  const locs    = (req.location_preferences || []).map(l => typeof l === 'string' ? l : l.area).filter(Boolean);
  const notes   = lead?.notes || [];
  const hist    = lead?.status_history || [];
  const suggestions = lead?.advisor_suggestions || [];

  const alreadySuggestedIds = suggestions.map(s =>
    String(s.property_id?._id || s.property_id)
  );

  const interestedCount = suggestions.filter(s => s.client_reaction === 'interested').length;
  const pendingCount    = suggestions.filter(s => s.client_reaction === 'pending').length;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleReqsSuccess = (data) => {
    setShowReqs(false);
    if (data?.new_matches?.data) {
      setMatches(data.new_matches.data);
      setMatchType(data.new_matches.matchType || '');
      setMatchNote(data.new_matches.note || '');
    }
    fetchLead();
  };

  const handleSuggestFromMatch = (property) => {
    if (alreadySuggestedIds.includes(String(property._id))) {
      return message.info('Already suggested to client');
    }
    setSuggestModal(property);
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (pageLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <Spin size="large" />
      <p className="mt-4 text-gray-400 font-medium text-sm">Loading lead…</p>
    </div>
  );

  if (!lead) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <FiAlertCircle size={48} className="text-gray-300" />
      <p className="text-gray-500">Lead not found or access denied.</p>
      <Btn variant="ghost" onClick={() => navigate(-1)}><FiArrowLeft size={14} /> Go Back</Btn>
    </div>
  );

  const MC_CONFIG = {
    exact:   { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', label: 'Exact Match',   Icon: FiCheckCircle },
    relaxed: { bg: '#fffbeb', color: '#d97706', border: '#fde68a', label: 'Relaxed Match', Icon: FiActivity    },
    broad:   { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', label: 'Broader Area',  Icon: FiMapPin      },
    none:    { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'No Matches',    Icon: FiXCircle     },
  };
  const mc = MC_CONFIG[matchType] || null;

  return (
    <>
      {/* ── MODALS ── */}
      {showStatus   && <StatusModal lead={lead} onClose={() => setShowStatus(false)} onSuccess={fetchLead} />}
      {showNote     && <NoteModal leadId={id} onClose={() => setShowNote(false)} onAdded={() => fetchLead()} />}
      {showReqs     && <UpdateReqModal lead={lead} onClose={() => setShowReqs(false)} onSuccess={handleReqsSuccess} />}
      {suggestModal && (
        <SuggestModal
          property={suggestModal}
          leadId={id}
          onClose={() => setSuggestModal(null)}
          onSuccess={() => { setSuggestModal(null); fetchLead(); }}
        />
      )}
      {reactionModal && (
        <ReactionModal
          suggestion={reactionModal}
          leadId={id}
          onClose={() => setReactionModal(null)}
          onSuccess={() => { setReactionModal(null); fetchLead(); }}
        />
      )}

      <div className="min-h-screen bg-slate-50 font-sans">

        {/* ── TOP BAR ── */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)}
                className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                <FiArrowLeft size={16} />
              </button>
              <div className="min-w-0">
                <h1 className="text-base font-extrabold text-gray-900 truncate">
                  {`${fn} ${ln}`.trim() || 'Unknown Client'}
                </h1>
                <p className="text-xs text-gray-400 font-medium">Lead · {String(lead._id).slice(-8)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={lead.status} />
              <span className="px-2.5 py-1 rounded-full text-xs font-bold border"
                style={{
                  background: lead.classification === 'hot' ? '#fef2f2' : lead.classification === 'warm' ? '#fffbeb' : '#f9fafb',
                  color: lead.classification === 'hot' ? '#dc2626' : lead.classification === 'warm' ? '#d97706' : '#6b7280',
                  borderColor: lead.classification === 'hot' ? '#fecaca' : lead.classification === 'warm' ? '#fde68a' : '#e5e7eb',
                }}>
                {lead.classification?.charAt(0).toUpperCase() + lead.classification?.slice(1) || '—'}
              </span>
              <Btn variant="primary" size="sm" onClick={() => setShowStatus(true)}>
                <FiEdit3 size={12} /> Update Status
              </Btn>
            </div>
          </div>
        </div>

        {/* ── NURTURING BANNER ── */}
        {isNurturing && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <FiAlertTriangle size={18} className="text-amber-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-amber-800">Client in Nurturing Mode</p>
                <p className="text-xs text-amber-700 mt-0.5">No exact matches found. Suggest properties manually or update requirements to find better matches.</p>
              </div>
              <Btn variant="amber" size="sm" onClick={() => setActiveTab('suggest')}>
                <FiSearch size={12} /> Search Properties
              </Btn>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* ── LEFT SIDEBAR ── */}
            <div className="lg:col-span-4 space-y-4">

              {/* Avatar card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold flex-shrink-0 shadow-lg"
                    style={{ background: GR }}>
                    {(fn?.[0] || '?').toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-extrabold text-gray-900 leading-tight truncate">
                      {`${fn} ${ln}`.trim() || 'Unknown'}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {lead.enquiry_type && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                          style={{ background: '#ede9fe', color: '#5b21b6' }}>
                          {lead.enquiry_type.replace(/_/g, ' ')}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                        style={{ background: '#f5f3ff', color: P, border: '1px solid #ddd6fe' }}>
                        {lead.lead_type || 'platform'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <SectionBox title="Contact Info" icon={FiUser}>
                <InfoRow icon={FiPhone}         label="Phone"    value={`${cc} ${phone}`.trim()} />
                {email && <InfoRow icon={FiMail} label="Email"   value={email} />}
                <InfoRow icon={FiMessageSquare} label="Preferred" value={lead.contact_info?.preferred_contact || '—'} />
              </SectionBox>

              {/* Requirements */}
              <SectionBox title="Client Requirements" icon={FiTag}
                action={
                  <button onClick={() => setShowReqs(true)}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors">
                    <FiEdit3 size={11} /> Edit
                  </button>
                }>
                {req.property_type    && <InfoRow icon={FiHome}        label="Type"        value={req.property_type} />}
                {req.transaction_type && <InfoRow icon={FiTag}         label="Transaction" value={req.transaction_type} />}
                {(req.budget_min || req.budget_max) && (
                  <InfoRow icon={FiDollarSign} label="Budget" value={
                    req.budget_min && req.budget_max
                      ? `AED ${Number(req.budget_min).toLocaleString()} – ${Number(req.budget_max).toLocaleString()}`
                      : req.budget_max ? `Up to AED ${Number(req.budget_max).toLocaleString()}` : `From AED ${Number(req.budget_min).toLocaleString()}`
                  } />
                )}
                {req.bedrooms  != null && <InfoRow icon={FiHome}    label="Bedrooms"    value={req.bedrooms === 0 ? 'Studio' : `${req.bedrooms} BR`} />}
                {req.furnished         && <InfoRow icon={FiHome}    label="Furnishing"  value={req.furnished} />}
                {locs.length > 0       && <InfoRow icon={FiMapPin}  label="Locations"   value={locs.join(', ')} />}
                {req.additional_notes  && <InfoRow icon={FiMessageSquare} label="Notes" value={req.additional_notes} />}
              </SectionBox>

              {/* Suggestion summary */}
              {suggestions.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Suggestion Summary</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Total',        value: suggestions.length,              bg: '#f5f3ff', color: P },
                      { label: 'Interested',   value: interestedCount,                 bg: '#f0fdf4', color: '#16a34a' },
                      { label: 'Pending',      value: pendingCount,                    bg: '#fffbeb', color: '#d97706' },
                    ].map((s, i) => (
                      <div key={i} className="rounded-xl p-3 text-center" style={{ background: s.bg }}>
                        <p className="text-xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lead meta */}
              <SectionBox title="Lead Info" icon={FiLayers} accent="#475569">
                <InfoRow icon={FiLayers} label="Source"  value={lead.source?.channel?.replace(/_/g, ' ') || '—'} />
                <InfoRow icon={FiClock}  label="Created" value={lead.createdAt
                  ? new Date(lead.createdAt).toLocaleString('en-AE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : '—'} />
                {lead.assigned_at && <InfoRow icon={FiCalendar} label="Assigned" value={
                  new Date(lead.assigned_at).toLocaleString('en-AE', { day: '2-digit', month: 'short', year: 'numeric' })} />}
                {lead.classification_reason && <InfoRow icon={FiAlertCircle} label="Classification" value={lead.classification_reason} />}
              </SectionBox>

              {/* Actions */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Quick Actions</p>
                <div className="space-y-2">
                  <Btn variant="primary" size="sm" onClick={() => setShowStatus(true)} className="w-full">
                    <FiEdit3 size={13} /> Update Lead Status
                  </Btn>
                  <Btn variant="ghost" size="sm" onClick={() => setShowReqs(true)} className="w-full">
                    <FiRefreshCw size={13} /> Update Requirements
                  </Btn>
                  <Btn variant="ghost" size="sm" onClick={() => setShowNote(true)} className="w-full">
                    <FiFileText size={13} /> Add Note
                  </Btn>
                  <Btn variant="ghost" size="sm" onClick={() => { setActiveTab('suggest'); }} className="w-full">
                    <FiSearch size={13} /> Search & Suggest Property
                  </Btn>
                </div>
              </div>

            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="lg:col-span-8 space-y-5">

              {/* ── TAB BAR ── */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex border-b border-gray-100">
                  {[
                    { key: 'matches',     label: 'Smart Matches',       icon: FiZap,    count: matches.length },
                    { key: 'suggest',     label: 'Search & Suggest',    icon: FiSearch, count: null },
                    { key: 'suggestions', label: 'My Suggestions',      icon: FiList,   count: suggestions.length },
                  ].map(tab => (
                    <button key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-bold transition-all border-b-2
                        ${activeTab === tab.key
                          ? 'border-purple-600 text-purple-700 bg-purple-50/60'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                      <tab.icon size={14} />
                      {tab.label}
                      {tab.count != null && (
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold
                          ${activeTab === tab.key ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="p-5">
                  {/* ── TAB: SMART MATCHES ── */}
                  {activeTab === 'matches' && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {mc && !matchLoading && (
                            <span className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
                              style={{ background: mc.bg, color: mc.color, border: `1px solid ${mc.border}` }}>
                              <mc.Icon size={10} /> {mc.label}
                            </span>
                          )}
                          {matchNote && (
                            <span className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                              <FiInfo size={12} /> {matchNote}
                            </span>
                          )}
                        </div>
                        <Btn variant="ghost" size="sm" onClick={fetchMatches} loading={matchLoading}>
                          <FiRefreshCw size={12} /> Refresh
                        </Btn>
                      </div>

                      {matchLoading && (
                        <div className="text-center py-10">
                          <FiLoader size={24} className="animate-spin mx-auto mb-3" style={{ color: P }} />
                          <p className="text-xs text-gray-400">Finding best matches…</p>
                        </div>
                      )}

                      {!matchLoading && (matchType === 'none' || (isNurturing && matches.length === 0)) && (
                        <div className="p-5 rounded-2xl bg-red-50 border border-red-100 mb-4 text-center">
                          <FiXCircle size={28} className="mx-auto mb-3 text-red-300" />
                          <p className="text-sm font-bold text-red-600 mb-1">No matching properties found</p>
                          <p className="text-xs text-red-700 leading-relaxed max-w-sm mx-auto">
                            Suggest properties manually using the <strong>Search & Suggest</strong> tab, or update the client's requirements to broaden the search.
                          </p>
                          <div className="flex gap-2 justify-center mt-4">
                            <Btn variant="primary" size="sm" onClick={() => setActiveTab('suggest')}>
                              <FiSearch size={12} /> Search Properties
                            </Btn>
                            <Btn variant="ghost" size="sm" onClick={() => setShowReqs(true)}>
                              <FiEdit3 size={12} /> Update Requirements
                            </Btn>
                          </div>
                        </div>
                      )}

                      {!matchLoading && matches.length > 0 && (
                        <>
                          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                            These properties match the client's requirements. Click <strong>Suggest to Client</strong> on any property you'd like to present.
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {matches.map((p, i) => (
                              <PropertyCard
                                key={p._id || i}
                                property={p}
                                onSuggest={() => handleSuggestFromMatch(p)}
                                alreadySuggested={alreadySuggestedIds.includes(String(p._id))}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* ── TAB: SEARCH & SUGGEST ── */}
                  {activeTab === 'suggest' && (
                    <div>
                      <div className="mb-4">
                        <p className="text-sm font-bold text-gray-800 mb-1">Search the Property Catalogue</p>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          Find properties that weren't in the smart matches. Search by name, area, or developer, then suggest directly to the client.
                        </p>
                      </div>
                      <PropertySearchPanel
                        leadId={id}
                        alreadySuggestedIds={alreadySuggestedIds}
                        onSuggested={() => fetchLead()}
                      />
                    </div>
                  )}

                  {/* ── TAB: MY SUGGESTIONS ── */}
                  {activeTab === 'suggestions' && (
                    <div>
                      {suggestions.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                          <FiPackage size={32} className="mx-auto mb-3 opacity-30" />
                          <p className="text-sm font-medium">No suggestions yet</p>
                          <p className="text-xs mt-1 mb-4">Use Smart Matches or Search to suggest properties</p>
                          <Btn variant="primary" size="sm" onClick={() => setActiveTab('matches')}>
                            <FiZap size={12} /> View Smart Matches
                          </Btn>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Summary strip */}
                          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex-wrap">
                            <span className="text-xs text-gray-500 font-medium">Client reactions:</span>
                            {[
                              { r: 'interested',     color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
                              { r: 'not_interested', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
                              { r: 'maybe',          color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
                              { r: 'pending',        color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
                            ].map(({ r, color, bg, border }) => {
                              const cnt = suggestions.filter(s => (s.client_reaction || 'pending') === r).length;
                              if (cnt === 0) return null;
                              return (
                                <span key={r} className="px-2.5 py-1 rounded-full text-xs font-bold border"
                                  style={{ background: bg, color, borderColor: border }}>
                                  {cnt} {REACTION_CONFIG[r]?.label}
                                </span>
                              );
                            })}
                          </div>

                          {/* Suggestion cards */}
                          {suggestions.map((s, i) => {
                            const prop = s.property_id;
                            const propName = typeof prop === 'object'
                              ? (prop?.propertyName || prop?.title || 'Property')
                              : `Property ID: ${String(prop).slice(-6)}`;
                            const price = typeof prop === 'object' ? (prop?.price_min || prop?.price || 0) : 0;
                            const loc   = typeof prop === 'object' ? [prop?.area, prop?.city].filter(Boolean).join(', ') : '';
                            const reaction = s.client_reaction || 'pending';
                            const rcfg = REACTION_CONFIG[reaction];

                            return (
                              <div key={i}
                                className={`rounded-2xl border overflow-hidden transition-all
                                  ${reaction === 'interested' ? 'border-green-200 bg-green-50/30' :
                                    reaction === 'not_interested' ? 'border-red-100' :
                                    reaction === 'maybe' ? 'border-amber-100' : 'border-gray-100 bg-white'}`}>
                                <div className="flex gap-3 p-4">
                                  {typeof prop === 'object' && prop?.mainLogo ? (
                                    <img src={prop.mainLogo} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                                  ) : (
                                    <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-300">
                                      <FiImage size={20} />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate">{propName}</p>
                                        {loc && <p className="text-xs text-gray-400 mt-0.5 truncate"><FiMapPin size={9} className="inline mr-1" />{loc}</p>}
                                        {price > 0 && (
                                          <p className="text-sm font-extrabold mt-1" style={{ color: P }}>
                                            AED {Number(price).toLocaleString()}
                                          </p>
                                        )}
                                      </div>
                                      <ReactionPill reaction={reaction} />
                                    </div>
                                    {s.note && (
                                      <p className="text-xs text-gray-500 mt-2 bg-white rounded-lg p-2 border border-gray-100 leading-relaxed">
                                        "{s.note}"
                                      </p>
                                    )}
                                    <div className="flex items-center justify-between mt-3">
                                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                        <FiClock size={10} />
                                        Suggested {s.suggested_at
                                          ? new Date(s.suggested_at).toLocaleDateString('en-AE', { day: '2-digit', month: 'short' })
                                          : '—'}
                                      </span>
                                      {/* Update reaction button */}
                                      <button
                                        onClick={() => setReactionModal(s)}
                                        className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-all"
                                        style={{
                                          background: rcfg.bg, color: rcfg.color,
                                          borderColor: rcfg.border,
                                        }}>
                                        <FiEdit3 size={10} />
                                        {reaction === 'pending' ? 'Record Reaction' : 'Update Reaction'}
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Progress indicator for interested */}
                                {reaction === 'interested' && (
                                  <div className="px-4 pb-3">
                                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-green-50 border border-green-200">
                                      <FiCheckCircle size={14} className="text-green-500 flex-shrink-0" />
                                      <p className="text-xs font-semibold text-green-800">
                                        Client is interested — update lead status to progress (e.g. Site Visit Scheduled)
                                      </p>
                                      <button onClick={() => setShowStatus(true)}
                                        className="ml-auto flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors flex-shrink-0">
                                        Progress <FiArrowRight size={11} />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ── STATUS PROGRESS BAR ── */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Lead Progress</p>
                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                  {STATUS_FLOW.map((s, i) => {
                    const cfg = STATUS_CONFIG[s];
                    const currIdx = STATUS_FLOW.indexOf(lead.status);
                    const isCompleted = i < currIdx;
                    const isCurrent  = i === currIdx;
                    const isFuture   = i > currIdx;
                    return (
                      <React.Fragment key={s}>
                        <div className="flex flex-col items-center gap-1 flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all
                            ${isCompleted ? 'border-green-400 bg-green-400' :
                              isCurrent   ? 'border-purple-600 bg-purple-600' :
                              'border-gray-200 bg-white'}`}>
                            {isCompleted
                              ? <FiCheckCircle size={14} className="text-white" />
                              : isCurrent
                              ? <div className="w-3 h-3 rounded-full bg-white" />
                              : <div className="w-2 h-2 rounded-full bg-gray-300" />}
                          </div>
                          <span className={`text-[9px] font-bold text-center leading-tight max-w-[52px]
                            ${isCurrent ? 'text-purple-700' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                            {cfg?.label || s}
                          </span>
                        </div>
                        {i < STATUS_FLOW.length - 1 && (
                          <div className={`flex-1 h-0.5 mb-5 min-w-[12px] ${isCompleted ? 'bg-green-400' : 'bg-gray-100'}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
                {lead.status === 'not_proceeding' && (
                  <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100">
                    <FiXCircle size={14} className="text-red-400 flex-shrink-0" />
                    <span className="text-xs font-semibold text-red-700">Lead marked as Not Proceeding</span>
                  </div>
                )}
              </div>

              {/* ── NOTES ── */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button
                  className="w-full flex items-center gap-3 px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowNotes(p => !p)}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white" style={{ background: GR }}>
                    <FiMessageSquare size={14} />
                  </div>
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest flex-1 text-left">
                    Notes
                    {notes.length > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px]">{notes.length}</span>
                    )}
                  </h4>
                  <div className="flex items-center gap-2">
                    <button onClick={e => { e.stopPropagation(); setShowNote(true); }}
                      className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors">
                      <FiPlus size={11} /> Add
                    </button>
                    {showNotes ? <FiChevronUp size={14} className="text-gray-400" /> : <FiChevronDown size={14} className="text-gray-400" />}
                  </div>
                </button>
                {showNotes && (
                  <div className="p-5">
                    {notes.length === 0
                      ? <p className="text-center text-xs text-gray-400 py-4">No notes yet. Click Add to write one.</p>
                      : (
                        <div className="space-y-3">
                          {[...notes].reverse().map((n, i) => (
                            <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                              <p className="text-sm text-gray-700 leading-relaxed">{n.text}</p>
                              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                                <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                  {(n.author?.[0] || 'A').toUpperCase()}
                                </span>
                                <span className="text-xs font-bold text-gray-600">{n.author || 'Advisor'}</span>
                                {n.author_type && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-200 text-gray-500 uppercase">{n.author_type}</span>
                                )}
                                <span className="text-xs text-gray-400 ml-auto flex items-center gap-1">
                                  <FiClock size={10} />
                                  {(n.created_at || n.createdAt)
                                    ? new Date(n.created_at || n.createdAt).toLocaleDateString('en-AE', { day: '2-digit', month: 'short', year: 'numeric' })
                                    : '—'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                )}
              </div>

              {/* ── STATUS HISTORY ── */}
              {hist.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <button
                    className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowHistory(p => !p)}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white" style={{ background: GR }}>
                      <FiActivity size={14} />
                    </div>
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest flex-1 text-left">
                      Status Timeline
                      <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px]">{hist.length}</span>
                    </h4>
                    {showHistory ? <FiChevronUp size={14} className="text-gray-400" /> : <FiChevronDown size={14} className="text-gray-400" />}
                  </button>
                  {showHistory && (
                    <div className="px-5 pb-5">
                      <div className="relative">
                        <div className="absolute left-[15px] top-0 bottom-0 w-px bg-gray-100" />
                        <div className="space-y-4">
                          {[...hist].reverse().map((h, i) => (
                            <div key={i} className="relative pl-10">
                              <div className="absolute left-0 top-2 w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center"
                                style={{ background: P }}>
                                <div className="w-2 h-2 rounded-full bg-white" />
                              </div>
                              <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <StatusBadge status={h.status} />
                                  <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                    <FiCalendar size={10} />
                                    {h.changed_at ? new Date(h.changed_at).toLocaleDateString('en-AE', { day: '2-digit', month: 'short' }) : '—'}
                                  </span>
                                </div>
                                {h.notes && <p className="text-xs text-gray-500 leading-relaxed">{h.notes}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GridAdvisorLeadDetail;