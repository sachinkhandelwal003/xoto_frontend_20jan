import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiUser, FiHome, FiClock, FiPhone, FiMail, FiMapPin, FiDollarSign,
  FiCalendar, FiMessageSquare, FiTag, FiAlertCircle, FiActivity, FiLayers,
  FiArrowLeft, FiImage, FiInfo, FiXCircle, FiCheckCircle, FiThumbsUp,
  FiThumbsDown, FiMinus, FiSend, FiEdit3, FiPlus, FiX, FiLoader,
  FiChevronDown, FiChevronUp, FiAlertTriangle, FiFileText, FiRefreshCw
} from 'react-icons/fi';
import { message, Spin } from 'antd';
import { apiService } from '../../../manageApi/utils/custom.apiservice';
import { StatusBadge, ClassBadge, EnquiryTag } from './GridAgentLead';

// ─── THEME ───────────────────────────────────────────────────────────────────
const P  = '#4A027C';
const P2 = '#7C3AED';
const GR = `linear-gradient(135deg, ${P} 0%, ${P2} 100%)`;

// ─── MATCH CONFIG ─────────────────────────────────────────────────────────────
const MC = {
  exact:   { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', label: 'Exact Match',   Icon: FiCheckCircle },
  relaxed: { bg: '#fffbeb', color: '#d97706', border: '#fde68a', label: 'Relaxed Match', Icon: FiActivity },
  broad:   { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', label: 'Broader Area',  Icon: FiMapPin },
  none:    { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'No Matches',    Icon: FiXCircle },
};

const ENQUIRY_LABELS = {
  buy: 'Buy', sell: 'Sell', rent: 'Rent', mortgage: 'Mortgage',
  consultation: 'Consultation', enquiry: 'Enquiry', schedule_visit: 'Site Visit',
  hot_property: 'Hot Property', partner: 'Partner', investor: 'Investor',
  developer: 'Developer', ai_enquiry: 'AI Enquiry', general_enquiry: 'General Enquiry',
};

const isAssignmentText = (v) => {
  const t = String(v || '').toLowerCase();
  return t.includes('assigned') || t.includes('assign advisor') || t.includes('advisor');
};

const sanitize = (lead) => {
  if (!lead || typeof lead !== 'object') return lead;
  const { assigned_to, assignedAdvisor, assigned_at, assigned_by, assignment_notes, ...safe } = lead;
  return {
    ...safe,
    notes: Array.isArray(lead.notes)
      ? lead.notes.filter(n => !isAssignmentText(n?.text || n?.notes || n))
      : lead.notes,
    status_history: Array.isArray(lead.status_history)
      ? lead.status_history.filter(e => !isAssignmentText(e?.status) && !isAssignmentText(e?.notes))
      : lead.status_history,
  };
};

// ─── TINY UI ATOMS ────────────────────────────────────────────────────────────
const Tag = ({ children, color = P, bg = '#F5F3FF', border = '#DDD6FE' }) => (
  <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide"
    style={{ color, background: bg, border: `1px solid ${border}` }}>
    {children}
  </span>
);

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

const SectionBox = ({ title, icon: Icon, children, action }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: P, color: '#fff' }}>
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
    primary: `text-white shadow-md hover:shadow-lg hover:-translate-y-0.5`,
    ghost: `border border-gray-200 text-gray-600 bg-white hover:bg-gray-50`,
    danger: `border border-red-200 text-red-600 bg-red-50 hover:bg-red-100`,
    success: `text-white shadow-md hover:shadow-lg`,
  };
  const bg = variant === 'primary' ? GR : variant === 'success' ? 'linear-gradient(135deg,#059669,#10b981)' : '';
  return (
    <button className={`${base} ${sizes[size]} ${vars[variant]} ${className}`}
      style={bg ? { background: bg } : {}} onClick={onClick} disabled={disabled || loading}>
      {loading ? <FiLoader size={14} className="animate-spin" /> : children}
    </button>
  );
};

// ─── PROPERTY CARD (with reaction controls) ───────────────────────────────────
const PropertyCard = ({ property, matchType, reaction, onReact, saving }) => {
  const price = property.price_min || property.price || 0;
  const loc   = [property.area, property.city].filter(Boolean).join(', ');
  const mc    = MC[matchType] || MC.broad;

  const reactionMap = {
    true:  { icon: FiThumbsUp,   color: '#16a34a', bg: '#f0fdf4', label: 'Interested' },
    false: { icon: FiThumbsDown, color: '#dc2626', bg: '#fef2f2', label: 'Not Interested' },
    null:  { icon: FiMinus,      color: '#9ca3af', bg: '#f9fafb', label: 'No Reaction' },
  };

  const current = reactionMap[String(reaction)] || reactionMap['null'];

  return (
    <div className={`rounded-2xl border overflow-hidden bg-white transition-all duration-200 hover:shadow-md
      ${reaction === true ? 'border-green-200 ring-1 ring-green-200' : reaction === false ? 'border-red-100' : 'border-gray-100'}`}>
      
      {/* Image */}
      <div className="h-28 bg-slate-100 relative overflow-hidden">
        {property.mainLogo ? (
          <img src={property.mainLogo} alt={property.propertyName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300"><FiImage size={28} /></div>
        )}
        <span className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase"
          style={{ background: mc.color, color: '#fff' }}>{matchType}</span>
        {property.isFeatured && (
          <span className="absolute top-2 left-2 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Featured</span>
        )}
      </div>

      {/* Info */}
      <div className="p-3.5">
        <div className="text-sm font-bold text-gray-900 truncate leading-snug">{property.propertyName}</div>
        {loc && <div className="text-xs text-gray-400 mt-1 flex items-center gap-1 truncate"><FiMapPin size={10}/> {loc}</div>}
        <div className="flex justify-between items-center mt-2.5 pt-2.5 border-t border-gray-50">
          <span className="text-sm font-extrabold" style={{ color: P }}>
            {price > 0 ? `AED ${Number(price).toLocaleString()}` : 'On Request'}
          </span>
          <div className="flex gap-1 text-[10px] text-gray-400 font-medium">
            {property.bedrooms > 0 && <span>{property.bedrooms}BR</span>}
            {property.bathrooms > 0 && <span>· {property.bathrooms}BA</span>}
          </div>
        </div>
      </div>

      {/* Reaction row */}
      <div className="px-3.5 pb-3.5 flex gap-2">
        <button onClick={() => onReact(property._id, true)}
          disabled={saving}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all
            ${reaction === true ? 'bg-green-500 text-white border-green-500' : 'border-gray-200 text-gray-500 hover:border-green-400 hover:text-green-600 hover:bg-green-50'}`}>
          <FiThumbsUp size={12}/> Interested
        </button>
        <button onClick={() => onReact(property._id, false)}
          disabled={saving}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all
            ${reaction === false ? 'bg-red-500 text-white border-red-500' : 'border-gray-200 text-gray-500 hover:border-red-400 hover:text-red-600 hover:bg-red-50'}`}>
          <FiThumbsDown size={12}/> Not Interested
        </button>
      </div>
    </div>
  );
};

// ─── SUBMIT TO XOTO MODAL ────────────────────────────────────────────────────
const SubmitModal = ({ lead, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    first_name: lead?.contact_info?.name?.first_name || '',
    last_name:  lead?.contact_info?.name?.last_name  || '',
    phone_number: lead?.contact_info?.mobile?.number || '',
    country_code: lead?.contact_info?.mobile?.country_code || '+971',
    email: lead?.contact_info?.email?.address || '',
    submission_note: '',
  });
  const [loading, setLoading] = useState(false);

  const interestedCount = (lead?.matched_listings || []).filter(m => m.client_interested === true).length;
  const canSubmit = interestedCount > 0;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await apiService.post(`/gridlead/agent/${lead._id}/submit-to-xoto`, form);
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success) {
        message.success('Lead submitted to Xoto admin successfully!');
        onSuccess();
      } else {
        message.error(data?.message || 'Submission failed');
      }
    } catch (e) {
      message.error(e?.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between" style={{ background: GR }}>
          <div>
            <h3 className="text-base font-extrabold text-white">Submit to Xoto Admin</h3>
            <p className="text-xs text-white/70 mt-0.5">An advisor will be assigned after submission</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
            <FiX size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Interested count check */}
          {!canSubmit ? (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <FiAlertTriangle size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-800">Client reactions required</p>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  Client must show interest in at least 1 property before submitting. Go back and record reactions.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-green-50 border border-green-200">
              <FiCheckCircle size={16} className="text-green-500 flex-shrink-0" />
              <p className="text-sm font-semibold text-green-800">
                {interestedCount} interested propert{interestedCount > 1 ? 'ies' : 'y'} recorded — ready to submit
              </p>
            </div>
          )}

          {/* Client info confirmation */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Confirm Client Details</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'first_name', placeholder: 'First name' },
                { key: 'last_name',  placeholder: 'Last name'  },
              ].map(f => (
                <input key={f.key} value={form[f.key]} placeholder={f.placeholder}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
              ))}
              <div className="col-span-2 flex gap-2">
                <select value={form.country_code} onChange={e => setForm(p => ({ ...p, country_code: e.target.value }))}
                  className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 bg-gray-50 outline-none" style={{ minWidth: 80 }}>
                  {['+971', '+91', '+1', '+44', '+966', '+974'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input value={form.phone_number} placeholder="Phone number"
                  onChange={e => setForm(p => ({ ...p, phone_number: e.target.value }))}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
              </div>
              <input value={form.email} placeholder="Email (optional)" type="email"
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="col-span-2 w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Submission Note (optional)</p>
            <textarea rows={3} value={form.submission_note} placeholder="Any notes for the admin or advisor…"
              onChange={e => setForm(p => ({ ...p, submission_note: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all resize-none" />
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3 justify-end">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={handleSubmit} loading={loading} disabled={!canSubmit}>
            <FiSend size={14} /> Submit to Xoto
          </Btn>
        </div>
      </div>
    </div>
  );
};

// ─── UPDATE REQUIREMENTS PANEL ────────────────────────────────────────────────
const UpdateRequirementsPanel = ({ lead, onClose, onSuccess }) => {
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
  const addLoc    = () => setForm(p => ({ ...p, location_preferences: [...p.location_preferences, ''] }));
  const removeLoc = (i) => setForm(p => ({ ...p, location_preferences: p.location_preferences.filter((_, idx) => idx !== i) }));
  const setLoc    = (i, v) => setForm(p => ({ ...p, location_preferences: p.location_preferences.map((l, idx) => idx === i ? v : l) }));

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
        reason: reason || 'Client changed preferences',
      };
      const res = await apiService.post(`/gridlead/agent/${lead._id}/update-requirements`, payload);
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
            <p className="text-xs text-white/70 mt-0.5">Fresh property matches will be generated after saving</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"><FiX size={16}/></button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Property Type</label>
              <div className="relative">
                <select value={form.property_type} onChange={e => set('property_type', e.target.value)} className={selCls}>
                  <option value="">Any type</option>
                  {['Apartment','Villa','Townhouse','Penthouse','Studio','Office','Retail','Land'].map(t => <option key={t} value={t}>{t}</option>)}
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
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Bathrooms</label>
              <div className="relative">
                <select value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} className={selCls}>
                  <option value="">Any</option>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
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
                    <input value={loc} placeholder="e.g. Dubai Marina" onChange={e => setLoc(i, e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
                  </div>
                  {form.location_preferences.length > 0 && (
                    <button onClick={() => removeLoc(i)} className="w-10 h-10 flex items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-400 hover:bg-red-100 transition-colors"><FiX size={14}/></button>
                  )}
                </div>
              ))}
              <button onClick={addLoc} className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors">
                <FiPlus size={13} /> Add Location
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Additional Notes</label>
            <textarea rows={2} value={form.additional_notes} onChange={e => set('additional_notes', e.target.value)}
              placeholder="Special requirements…"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all resize-none" />
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

// ─── ADD NOTE PANEL ───────────────────────────────────────────────────────────
const NotePanel = ({ leadId, onClose, onAdded }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!text.trim()) return message.warning('Note text is required');
    setLoading(true);
    try {
      const res = await apiService.post(`/gridlead/agent/${leadId}/note`, { text: text.trim() });
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success) {
        message.success('Note added');
        onAdded(data.data);
        onClose();
      } else {
        message.error(data?.message || 'Failed to add note');
      }
    } catch (e) {
      message.error(e?.response?.data?.message || 'Failed to add note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between" style={{ background: GR }}>
          <h3 className="text-base font-extrabold text-white">Add Private Note</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"><FiX size={16}/></button>
        </div>
        <div className="p-6 space-y-4">
          <textarea rows={5} value={text} autoFocus onChange={e => setText(e.target.value)}
            placeholder="Write your note about this client or lead…"
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

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const GridAgentLeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lead,         setLead]         = useState(null);
  const [pageLoading,  setPageLoading]  = useState(true);
  const [matches,      setMatches]      = useState([]);
  const [matchType,    setMatchType]    = useState('');
  const [matchNote,    setMatchNote]    = useState('');
  const [matchLoading, setMatchLoading] = useState(false);
  const [isNurturing,  setIsNurturing]  = useState(false);

  // Reactions: { [listing_id]: true | false | null }
  const [reactions,     setReactions]     = useState({});
  const [savingMatches, setSavingMatches] = useState(false);
  const [dirtyReactions, setDirtyReactions] = useState(false);

  // Modals
  const [showSubmit,  setShowSubmit]  = useState(false);
  const [showReqs,    setShowReqs]    = useState(false);
  const [showNote,    setShowNote]    = useState(false);

  // Collapsibles
  const [showHistory, setShowHistory] = useState(false);
  const [showNotes,   setShowNotes]   = useState(true);

  // ── Fetch lead + matches ───────────────────────────────────────────────────
  const fetchLead = useCallback(async () => {
    setPageLoading(true);
    try {
      const res  = await apiService.get(`/gridlead/${id}`);
      const data = res?.data?.data || res?.data;
      const safe = sanitize(data);
      setLead(safe);

      // Pre-populate reactions from existing matched_listings
      const initReactions = {};
      (safe?.matched_listings || []).forEach(m => {
        if (m.listing_id?._id || m.listing_id) {
          const lid = m.listing_id?._id?.toString() || m.listing_id?.toString();
          initReactions[lid] = m.client_interested;
        }
      });
      setReactions(initReactions);

    } catch {
      message.error('Failed to load lead details');
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

  // ── Save reactions ─────────────────────────────────────────────────────────
  const handleReact = (propertyId, interested) => {
    const pid = propertyId?.toString();
    setReactions(prev => {
      // Toggle off if clicking same state
      const newVal = prev[pid] === interested ? null : interested;
      return { ...prev, [pid]: newVal };
    });
    setDirtyReactions(true);
  };

  const handleSaveReactions = async () => {
    setSavingMatches(true);
    try {
      const listings = matches.map(p => ({
        listing_id:          p._id,
        match_score:         Math.max(0, p.matchScore ?? 50),  // clamp — schema min is 0
        presented_to_client: true,
        client_interested:   reactions[p._id?.toString()] ?? null,
      }));

      const res  = await apiService.post(`/gridlead/agent/${id}/save-matches`, { listings });
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success) {
        message.success(`Reactions saved — ${data.data?.interested || 0} interested, ${data.data?.not_interested || 0} not interested`);
        setDirtyReactions(false);
        // Refresh lead to get updated matched_listings
        fetchLead();
      } else {
        message.error(data?.message || 'Failed to save reactions');
      }
    } catch (e) {
      message.error(e?.response?.data?.message || 'Failed to save reactions');
    } finally {
      setSavingMatches(false);
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const interestedCount   = Object.values(reactions).filter(v => v === true).length;
  const notInterestedCount = Object.values(reactions).filter(v => v === false).length;
  const isSubmitted        = lead?.submitted_to_xoto;
  const canSubmit          = !isSubmitted && interestedCount > 0;

  const fn    = lead?.contact_info?.name?.first_name || '';
  const ln    = lead?.contact_info?.name?.last_name  || '';
  const phone = lead?.contact_info?.mobile?.number   || '—';
  const cc    = lead?.contact_info?.mobile?.country_code || '';
  const email = lead?.contact_info?.email?.address   || null;
  const req   = lead?.requirements || {};
  const locs  = (req.location_preferences || []).map(l => typeof l === 'string' ? l : l.area).filter(Boolean);
  const prop  = lead?.source?.listing_id;
  const notes = (lead?.notes || []).filter(n => !isAssignmentText(n?.text || ''));
  const hist  = (lead?.status_history || []).filter(h => !isAssignmentText(h?.notes || ''));

  // ── Handlers for modal callbacks ────────────────────────────────────────────
  const handleSubmitSuccess = () => { setShowSubmit(false); fetchLead(); };
  const handleReqsSuccess   = (data) => {
    setShowReqs(false);
    // Update matches from response
    if (data?.new_matches?.data) {
      setMatches(data.new_matches.data);
      setMatchType(data.new_matches.matchType || '');
      setMatchNote(data.new_matches.note || '');
    }
    fetchLead();
  };
  const handleNoteAdded = (note) => {
    setLead(prev => ({ ...prev, notes: [...(prev.notes || []), note] }));
  };

  // ─── LOADING ───────────────────────────────────────────────────────────────
  if (pageLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <Spin size="large" />
      <p className="mt-4 text-gray-400 font-medium text-sm">Loading lead profile…</p>
    </div>
  );

  if (!lead) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <FiAlertCircle size={48} className="text-gray-300" />
      <p className="text-gray-500">Lead not found or access denied.</p>
      <Btn variant="ghost" onClick={() => navigate(-1)}><FiArrowLeft size={14}/> Go Back</Btn>
    </div>
  );

  const mc = MC[matchType] || null;
  const MatchIcon = mc?.Icon;

  return (
    <>
      {/* ── MODALS ── */}
      {showSubmit && <SubmitModal lead={lead} onClose={() => setShowSubmit(false)} onSuccess={handleSubmitSuccess} />}
      {showReqs   && <UpdateRequirementsPanel lead={lead} onClose={() => setShowReqs(false)} onSuccess={handleReqsSuccess} />}
      {showNote   && <NotePanel leadId={id} onClose={() => setShowNote(false)} onAdded={handleNoteAdded} />}

      <div className="min-h-screen bg-slate-50 font-sans">

        {/* ── TOP BAR ── */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)}
                className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                <FiArrowLeft size={16} />
              </button>
              <div className="min-w-0">
                <h1 className="text-base font-extrabold text-gray-900 truncate">{`${fn} ${ln}`.trim() || 'Unknown Client'}</h1>
                <p className="text-xs text-gray-400 font-medium">Lead ID: {String(lead._id).slice(-8)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={lead.status} />
              <ClassBadge cls={lead.classification} />
              {isSubmitted && <Tag color="#059669" bg="#f0fdf4" border="#bbf7d0">Submitted ✓</Tag>}
            </div>
          </div>
        </div>

        {/* ── SUBMITTED BANNER ── */}
        {isSubmitted && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-50 border border-green-200">
              <FiCheckCircle size={20} className="text-green-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-green-800">Lead submitted to Xoto Admin</p>
                <p className="text-xs text-green-700 mt-0.5">
                  Submitted on {lead.submitted_to_xoto_at ? new Date(lead.submitted_to_xoto_at).toLocaleString('en-AE', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—'}. An advisor will be assigned shortly.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* ── LEFT: Info sidebar ── */}
            <div className="lg:col-span-4 space-y-4">

              {/* Avatar card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold flex-shrink-0 shadow-lg"
                    style={{ background: GR }}>{(fn?.[0] || '?').toUpperCase()}</div>
                  <div className="min-w-0">
                    <p className="text-lg font-extrabold text-gray-900 leading-tight truncate">{`${fn} ${ln}`.trim() || 'Unknown'}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {lead.enquiry_type && <EnquiryTag type={lead.enquiry_type} />}
                      <Tag>{lead.lead_type || 'agent'}</Tag>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <SectionBox title="Contact Info" icon={FiUser}>
                <div className="divide-y divide-gray-50">
                  <InfoRow icon={FiPhone}         label="Phone"   value={`${cc} ${phone}`.trim()} />
                  {email && <InfoRow icon={FiMail} label="Email"   value={email} />}
                  <InfoRow icon={FiMessageSquare} label="Preferred" value={lead.contact_info?.preferred_contact || '—'} />
                </div>
              </SectionBox>

              {/* Requirements summary */}
              <SectionBox title="Requirements" icon={FiTag}
                action={
                  !isSubmitted && (
                    <button onClick={() => setShowReqs(true)}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors">
                      <FiEdit3 size={11}/> Edit
                    </button>
                  )
                }>
                <div className="divide-y divide-gray-50">
                  {req.property_type    && <InfoRow icon={FiHome}       label="Type"        value={req.property_type} />}
                  {req.transaction_type && <InfoRow icon={FiTag}        label="Transaction" value={req.transaction_type} />}
                  {(req.budget_min || req.budget_max) && (
                    <InfoRow icon={FiDollarSign} label="Budget" value={
                      req.budget_min && req.budget_max
                        ? `AED ${Number(req.budget_min).toLocaleString()} – AED ${Number(req.budget_max).toLocaleString()}`
                        : req.budget_max ? `Up to AED ${Number(req.budget_max).toLocaleString()}` : `From AED ${Number(req.budget_min).toLocaleString()}`
                    } />
                  )}
                  {req.bedrooms != null && <InfoRow icon={FiHome} label="Bedrooms"  value={req.bedrooms === 0 ? 'Studio' : `${req.bedrooms} BR`} />}
                  {req.furnished        && <InfoRow icon={FiHome} label="Furnishing" value={req.furnished} />}
                  {locs.length > 0      && <InfoRow icon={FiMapPin} label="Locations" value={locs.join(', ')} />}
                  {req.ready_by_date    && <InfoRow icon={FiCalendar} label="Ready By" value={new Date(req.ready_by_date).toLocaleDateString('en-AE',{day:'2-digit',month:'short',year:'numeric'})} />}
                  {req.additional_notes && <InfoRow icon={FiMessageSquare} label="Notes" value={req.additional_notes} />}
                </div>
              </SectionBox>

              {/* Linked property */}
              {prop && typeof prop === 'object' && (
                <SectionBox title="Linked Property" icon={FiHome}>
                  <div className="divide-y divide-gray-50">
                    <InfoRow icon={FiHome}       label="Name"  value={prop.propertyName || prop.title || '—'} />
                    <InfoRow icon={FiMapPin}     label="Area"  value={prop.area || '—'} />
                    {prop.price && <InfoRow icon={FiDollarSign} label="Price" value={`AED ${Number(prop.price).toLocaleString()}`} />}
                  </div>
                </SectionBox>
              )}

              {/* Lead meta */}
              <SectionBox title="Lead Info" icon={FiLayers}>
                <div className="divide-y divide-gray-50">
                  <InfoRow icon={FiLayers} label="Source"  value={lead.source?.channel?.replace(/_/g,' ') || '—'} />
                  <InfoRow icon={FiClock}  label="Created" value={lead.createdAt ? new Date(lead.createdAt).toLocaleString('en-AE',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—'} />
                  {lead.classification_reason && <InfoRow icon={FiAlertCircle} label="Classification Reason" value={lead.classification_reason} />}
                </div>
              </SectionBox>

            </div>

            {/* ── RIGHT: Actions + Matches ── */}
            <div className="lg:col-span-8 space-y-5">

              {/* ── ACTION BAR ── */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Actions</p>
                <div className="flex flex-wrap gap-2">
                  {/* Save reactions */}
                  {dirtyReactions && !isSubmitted && (
                    <Btn variant="primary" onClick={handleSaveReactions} loading={savingMatches} size="sm">
                      <FiCheckCircle size={13}/> Save Reactions
                      {interestedCount > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/30 text-[10px] font-bold">{interestedCount}</span>
                      )}
                    </Btn>
                  )}

                  {/* Submit to Xoto */}
                  {!isSubmitted ? (
                    <Btn variant="success" onClick={() => setShowSubmit(true)} size="sm"
                      disabled={interestedCount === 0}>
                      <FiSend size={13}/> Submit to Xoto
                      {interestedCount === 0 && <span className="ml-1 text-[10px] opacity-70">(need interest)</span>}
                    </Btn>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl text-green-700 bg-green-50 border border-green-200">
                      <FiCheckCircle size={13}/> Submitted to Xoto
                    </span>
                  )}

                  {/* Update requirements */}
                  {!isSubmitted && (
                    <Btn variant="ghost" onClick={() => setShowReqs(true)} size="sm">
                      <FiEdit3 size={13}/> Update Requirements
                    </Btn>
                  )}

                  {/* Add note */}
                  <Btn variant="ghost" onClick={() => setShowNote(true)} size="sm">
                    <FiFileText size={13}/> Add Note
                  </Btn>

                  {/* Refresh matches */}
                  <Btn variant="ghost" onClick={fetchMatches} loading={matchLoading} size="sm">
                    <FiRefreshCw size={13}/> Refresh Matches
                  </Btn>
                </div>

                {/* Reaction summary strip */}
                {(interestedCount > 0 || notInterestedCount > 0) && (
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50 flex-wrap">
                    <span className="text-xs text-gray-400 font-medium">Client reactions:</span>
                    {interestedCount > 0 && (
                      <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-lg border border-green-200">
                        <FiThumbsUp size={11}/> {interestedCount} Interested
                      </span>
                    )}
                    {notInterestedCount > 0 && (
                      <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">
                        <FiThumbsDown size={11}/> {notInterestedCount} Not Interested
                      </span>
                    )}
                    {dirtyReactions && !savingMatches && (
                      <span className="text-xs text-amber-600 font-semibold flex items-center gap-1">
                        <FiAlertTriangle size={11}/> Unsaved — click Save Reactions
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* ── MATCHED PROPERTIES ── */}
              <SectionBox title="Matched Properties" icon={FiHome}
                action={mc && !matchLoading && (
                  <span className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: mc.bg, color: mc.color, border: `1px solid ${mc.border}` }}>
                    <MatchIcon size={10}/> {mc.label}
                  </span>
                )}>

                {matchLoading && (
                  <div className="text-center py-10">
                    <FiLoader size={24} className="animate-spin mx-auto mb-3" style={{ color: P }} />
                    <p className="text-xs text-gray-400 font-medium">Finding best matches…</p>
                  </div>
                )}

                {!matchLoading && matchNote && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100 mb-4 text-xs font-medium text-blue-700">
                    <FiInfo size={13} className="flex-shrink-0 mt-0.5 text-blue-500" />
                    {matchNote}
                  </div>
                )}

                {!matchLoading && (matchType === 'none' || isNurturing) && (
                  <div className="p-5 rounded-2xl bg-red-50 border border-red-100 mb-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-red-600 mb-1.5">
                      <FiXCircle size={16}/> No matching properties found
                    </div>
                    <p className="text-xs text-red-700 leading-relaxed pl-6">
                      This client has been added to the nurturing list. Try updating requirements to broaden the search.
                    </p>
                  </div>
                )}

                {!matchLoading && matches.length > 0 && (
                  <>
                    <p className="text-xs text-gray-500 font-medium mb-4">
                      Click <strong>Interested</strong> / <strong>Not Interested</strong> on each property to record client reactions, then click <strong>Save Reactions</strong>.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {matches.map((p, i) => (
                        <PropertyCard
                          key={p._id || i}
                          property={p}
                          matchType={matchType}
                          reaction={reactions[p._id?.toString()]}
                          onReact={handleReact}
                          saving={savingMatches}
                        />
                      ))}
                    </div>
                    {!isSubmitted && matches.length > 0 && (
                      <div className="mt-5 flex justify-end">
                        <Btn variant="primary" onClick={handleSaveReactions} loading={savingMatches}
                          disabled={!dirtyReactions}>
                          <FiCheckCircle size={14}/>
                          {dirtyReactions ? 'Save Reactions' : 'Reactions Saved'}
                        </Btn>
                      </div>
                    )}
                  </>
                )}

                {!matchLoading && matches.length === 0 && matchType !== 'none' && !isNurturing && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    <FiHome size={32} className="mx-auto mb-3 opacity-30" />
                    No properties loaded yet.
                  </div>
                )}
              </SectionBox>

              {/* ── NOTES ── */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button
                  className="w-full flex items-center gap-3 px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowNotes(p => !p)}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: P, color: '#fff' }}>
                    <FiMessageSquare size={14} />
                  </div>
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest flex-1 text-left">
                    Private Notes {notes.length > 0 && <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px]">{notes.length}</span>}
                  </h4>
                  <div className="flex items-center gap-2">
                    <button onClick={e => { e.stopPropagation(); setShowNote(true); }}
                      className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors">
                      <FiPlus size={11}/> Add
                    </button>
                    {showNotes ? <FiChevronUp size={14} className="text-gray-400"/> : <FiChevronDown size={14} className="text-gray-400"/>}
                  </div>
                </button>

                {showNotes && (
                  <div className="p-5">
                    {notes.length === 0 ? (
                      <p className="text-center text-xs text-gray-400 py-4">No notes yet. Click Add to write one.</p>
                    ) : (
                      <div className="space-y-3">
                        {[...notes].reverse().map((n, i) => (
                          <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <p className="text-sm text-gray-700 leading-relaxed">{n.text}</p>
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                {(n.author?.[0] || 'A').toUpperCase()}
                              </span>
                              <span className="text-xs font-bold text-gray-600">{n.author || 'Agent'}</span>
                              {n.author_type && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-200 text-gray-500 uppercase">{n.author_type}</span>
                              )}
                              <span className="text-xs text-gray-400 ml-auto flex items-center gap-1">
                                <FiClock size={10}/>
                                {(n.created_at || n.createdAt)
                                  ? new Date(n.created_at || n.createdAt).toLocaleDateString('en-AE',{day:'2-digit',month:'short',year:'numeric'})
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
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: P, color: '#fff' }}>
                      <FiActivity size={14} />
                    </div>
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest flex-1 text-left">
                      Status Timeline
                      <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px]">{hist.length}</span>
                    </h4>
                    {showHistory ? <FiChevronUp size={14} className="text-gray-400"/> : <FiChevronDown size={14} className="text-gray-400"/>}
                  </button>
                  {showHistory && (
                    <div className="px-5 pb-5">
                      <div className="relative">
                        <div className="absolute left-[15px] top-0 bottom-0 w-px bg-gray-100" />
                        <div className="space-y-4">
                          {[...hist].reverse().map((h, i) => (
                            <div key={i} className="relative pl-10">
                              <div className="absolute left-0 top-2 w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center"
                                style={{ background: '#4A027C' }}>
                                <div className="w-2 h-2 rounded-full bg-white" />
                              </div>
                              <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <StatusBadge status={h.status} />
                                  <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                    <FiCalendar size={10}/>
                                    {h.changed_at ? new Date(h.changed_at).toLocaleDateString('en-AE',{day:'2-digit',month:'short'}) : '—'}
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

export default GridAgentLeadDetail;