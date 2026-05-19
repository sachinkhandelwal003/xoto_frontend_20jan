// ════════════════════════════════════════════════════════════════════════════
// DealRecordsPage.jsx — Admin Deal Record & Commission Ledger
// ════════════════════════════════════════════════════════════════════════════
// Uses same apiService pattern as GridAdvisorLeadDetail.jsx
// Import in your router: <Route path="/deals" element={<DealRecordsPage />} />
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  FiDollarSign, FiCheckCircle, FiClock, FiAlertTriangle, FiXCircle,
  FiEye, FiEdit3, FiTrash2, FiFlag, FiUpload, FiSearch, FiFilter,
  FiChevronDown, FiChevronUp, FiX, FiPlus, FiLoader, FiRefreshCw,
  FiFileText, FiUser, FiHome, FiCalendar, FiActivity, FiLayers,
  FiMapPin, FiPhone, FiMail, FiArrowLeft, FiArrowRight, FiTrendingUp,
  FiAlertCircle, FiLock, FiUnlock, FiSend, FiDownload, FiExternalLink,
  FiBarChart2, FiSliders, FiCornerUpRight, FiShield, FiAward,
} from 'react-icons/fi';
import { message, Select, Spin } from 'antd';
import { apiService } from '../../../manageApi/utils/custom.apiservice';

// ─── THEME ───────────────────────────────────────────────────────────────────
const P  = '#4A027C';
const P2 = '#7C3AED';
const GR = `linear-gradient(135deg, ${P} 0%, ${P2} 100%)`;

// ─── COMMISSION STATUS CONFIG ─────────────────────────────────────────────────
const COM_STATUS = {
  pending:   { label: 'Pending',   bg: '#fffbeb', text: '#92400e', border: '#fde68a', dot: '#f59e0b' },
  confirmed: { label: 'Confirmed', bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe', dot: '#3b82f6' },
  paid:      { label: 'Paid',      bg: '#f0fdf4', text: '#166534', border: '#bbf7d0', dot: '#22c55e' },
};

const DEAL_TYPE = {
  sale:  { label: 'Sale',  bg: '#f5f3ff', text: '#5b21b6', border: '#ddd6fe' },
  lease: { label: 'Lease', bg: '#fff7ed', text: '#9a3412', border: '#fed7aa' },
};

const DOC_TYPES = ['spa', 'booking_form', 'title_deed', 'noc', 'other'];

// ─── FORMATTERS ───────────────────────────────────────────────────────────────
const fmt = (n, cur = 'AED') =>
  n > 0 ? `${cur} ${Number(n).toLocaleString('en-AE')}` : '—';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-AE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString('en-AE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

// ─── ATOMS ───────────────────────────────────────────────────────────────────
const asList = (res) => {
  const data = res?.data?.data || res?.data || res;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.docs)) return data.docs;
  if (Array.isArray(data?.advisors)) return data.advisors;
  if (Array.isArray(data?.agents)) return data.agents;
  if (Array.isArray(data?.customers)) return data.customers;
  return [];
};

const compactName = (...parts) => parts.filter(Boolean).join(' ').trim();

const userName = (u) =>
  u?.fullName ||
  u?.full_name ||
  compactName(u?.first_name, u?.last_name) ||
  compactName(u?.firstName, u?.lastName) ||
  compactName(u?.name?.first_name, u?.name?.last_name) ||
  u?.name ||
  u?.email ||
  u?.phone ||
  u?.mobile?.number ||
  'Unnamed';

const leadName = (l) =>
  compactName(l?.contact_info?.name?.first_name, l?.contact_info?.name?.last_name) ||
  l?.leadReference ||
  l?.lead_no ||
  l?.email ||
  'Unnamed lead';

const propertyName = (p) =>
  compactName(p?.propertyName, p?.area ? `- ${p.area}` : '', p?.city ? `(${p.city})` : '') ||
  p?.title ||
  p?.name ||
  'Unnamed property';

const unitName = (u) =>
  compactName(
    u?.unitNumber ? `Unit ${u.unitNumber}` : '',
    u?.floorNumber ? `Floor ${u.floorNumber}` : '',
    u?.bedroomType || u?.unitType || ''
  ) || u?.name || 'Inventory unit';

const recordId = (v) => {
  if (!v) return '';
  if (typeof v === 'object') return v._id || v.id || '';
  return v;
};

const getLeadInventoryUnit = (lead) =>
  lead?.deal_record?.inventory_unit_id ||
  lead?.source?.inventory_unit_id ||
  [...(lead?.matched_listings || []), ...(lead?.advisor_suggestions || [])]
    .map(item => item?.interested_inventory_unit || item?.inventory_unit_id)
    .find(Boolean) ||
  '';

const getLeadProperty = (lead) =>
  lead?.propertyId ||
  lead?.property_id ||
  lead?.listing_id ||
  lead?.source?.listing_id ||
  lead?.source?.property_id ||
  lead?.matched_listings?.find(m => m?.client_interested === true)?.listing_id ||
  lead?.advisor_suggestions?.find(s => ['interested', 'accepted'].includes(s?.client_reaction))?.property_id ||
  lead?.advisor_suggestions?.[0]?.property_id ||
  '';

const getLeadCustomer = (lead) =>
  lead?.customerId ||
  lead?.customer_id ||
  lead?.customer ||
  lead?.created_for_customer ||
  '';

const getLeadAgent = (lead) =>
  lead?.agentId ||
  lead?.agent_id ||
  lead?.created_by_agent ||
  lead?.agent ||
  '';

const getLeadAgency = (lead) =>
  lead?.agencyId ||
  lead?.agency_id ||
  lead?.created_by_agent?.agency ||
  lead?.created_by_agent?.agencyId ||
  lead?.agent?.agency ||
  '';

const getLeadAdvisor = (lead) =>
  lead?.advisorId ||
  lead?.advisor_id ||
  lead?.assigned_to ||
  lead?.assignedAdvisor ||
  '';

const leadClientName = (lead) =>
  compactName(lead?.contact_info?.name?.first_name, lead?.contact_info?.name?.last_name) ||
  userName(getLeadCustomer(lead)) ||
  'Lead client';

const buildDealDraftFromLead = (lead) => {
  if (!lead) return {};
  const property = getLeadProperty(lead);
  const customer = getLeadCustomer(lead);
  const inventory = getLeadInventoryUnit(lead);
  const agent = getLeadAgent(lead);
  const agency = getLeadAgency(lead);
  const advisor = getLeadAdvisor(lead);
  return {
    leadId: recordId(lead),
    propertyId: recordId(property),
    inventoryUnitId: recordId(inventory),
    customerId: recordId(customer),
    advisorId: recordId(advisor),
    agentId: recordId(agent),
    agencyId: recordId(agency),
    dealType: lead?.requirements?.transaction_type === 'rent' ? 'lease' : 'sale',
    notes: `Created from reserved GRID lead for ${leadClientName(lead)}`,
  };
};

const toOptions = (items, labelFn) =>
  items
    .filter(item => item?._id || item?.id)
    .map(item => ({
      value: item._id || item.id,
      label: labelFn(item),
      item,
    }));

const LookupSelect = ({ label, required, value, onChange, options, loading, placeholder, hint, disabled }) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 mb-1.5">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <Select
      showSearch
      allowClear={!required}
      value={value || undefined}
      onChange={(v) => onChange(v || '')}
      options={options}
      loading={loading}
      disabled={disabled}
      placeholder={placeholder}
      optionFilterProp="label"
      className="w-full"
      size="large"
      filterOption={(input, option) =>
        String(option?.label || '').toLowerCase().includes(input.toLowerCase())
      }
    />
    {hint && <p className="text-[10px] text-gray-400 font-medium mt-1">{hint}</p>}
  </div>
);

const LockedField = ({ label, value, hint }) => (
  <div className="rounded-xl border border-gray-100 bg-gray-50 px-3.5 py-3 min-h-[68px]">
    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{label}</p>
    <p className="text-sm text-gray-800 font-bold mt-1 truncate">{value || 'Not available'}</p>
    {hint && <p className="text-[10px] text-gray-400 font-medium mt-1">{hint}</p>}
  </div>
);

const Pill = ({ status, type = 'commission' }) => {
  const map = type === 'commission' ? COM_STATUS : DEAL_TYPE;
  const cfg = map[status] || { label: status, bg: '#f3f4f6', text: '#374151', border: '#e5e7eb', dot: '#9ca3af' };
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border"
      style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border }}>
      {type === 'commission' && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />}
      {cfg.label}
    </span>
  );
};

const Btn = ({ children, onClick, variant = 'primary', loading, disabled, size = 'md', className = '' }) => {
  const base = 'inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none';
  const sizes = { xs: 'px-2.5 py-1.5 text-[11px]', sm: 'px-3.5 py-2 text-xs', md: 'px-5 py-2.5 text-sm', lg: 'px-7 py-3 text-sm' };
  const vars = {
    primary: 'text-white shadow-md hover:shadow-lg hover:-translate-y-0.5',
    ghost:   'border border-gray-200 text-gray-600 bg-white hover:bg-gray-50',
    danger:  'border border-red-200 text-red-600 bg-red-50 hover:bg-red-100',
    success: 'text-white shadow-md',
    amber:   'text-white shadow-md',
    dark:    'text-white shadow-md',
  };
  const bgs = {
    primary: GR,
    success: 'linear-gradient(135deg,#059669,#10b981)',
    amber:   'linear-gradient(135deg,#d97706,#f59e0b)',
    dark:    'linear-gradient(135deg,#374151,#111827)',
  };
  return (
    <button className={`${base} ${sizes[size]} ${vars[variant]} ${className}`}
      style={bgs[variant] ? { background: bgs[variant] } : {}}
      onClick={onClick} disabled={disabled || loading}>
      {loading ? <FiLoader size={13} className="animate-spin" /> : children}
    </button>
  );
};

const StatCard = ({ label, value, sub, icon: Icon, color, bg, border }) => (
  <div className="bg-white rounded-2xl border p-5 flex items-start gap-4 hover:shadow-md transition-shadow"
    style={{ borderColor: border }}>
    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: bg }}>
      <Icon size={18} style={{ color }} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-xl font-extrabold text-gray-900 mt-0.5 leading-tight">{value}</p>
      {sub && <p className="text-[11px] text-gray-400 font-medium mt-0.5">{sub}</p>}
    </div>
  </div>
);

const InfoRow = ({ icon: Icon, label, value, mono }) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
      style={{ background: '#F5F3FF' }}>
      <Icon size={12} style={{ color: P }} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{label}</p>
      <p className={`text-sm text-gray-800 font-medium mt-0.5 break-all leading-snug ${mono ? 'font-mono' : ''}`}>{value || '—'}</p>
    </div>
  </div>
);

const Modal = ({ children, onClose, maxW = 'max-w-2xl' }) => (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    style={{ background: 'rgba(0,0,0,0.6)' }}>
    <div className={`bg-white w-full ${maxW} sm:rounded-3xl shadow-2xl overflow-hidden max-h-[94vh] flex flex-col`}>
      {children}
    </div>
  </div>
);

const ModalHeader = ({ title, sub, onClose, icon: Icon }) => (
  <div className="px-6 py-5 flex items-center justify-between flex-shrink-0" style={{ background: GR }}>
    <div className="flex items-center gap-3">
      {Icon && (
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
          <Icon size={16} className="text-white" />
        </div>
      )}
      <div>
        <h3 className="text-base font-extrabold text-white">{title}</h3>
        {sub && <p className="text-xs text-white/70 mt-0.5">{sub}</p>}
      </div>
    </div>
    <button onClick={onClose}
      className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30">
      <FiX size={16} />
    </button>
  </div>
);

// ─── COMMISSION BAR ───────────────────────────────────────────────────────────
const CommissionBar = ({ gross, xoto, partner, referral }) => {
  const total = gross || 1;
  const bars = [
    { label: 'XOTO',     value: xoto,     pct: (xoto     / total) * 100, color: '#4A027C' },
    { label: 'Partner',  value: partner,  pct: (partner  / total) * 100, color: '#7C3AED' },
    { label: 'Referral', value: referral, pct: (referral / total) * 100, color: '#a78bfa' },
  ].filter(b => b.value > 0);

  return (
    <div className="space-y-3">
      {/* Stacked bar */}
      <div className="h-3 rounded-full overflow-hidden flex bg-gray-100">
        {bars.map((b, i) => (
          <div key={i} className="h-full transition-all" style={{ width: `${b.pct}%`, background: b.color }} />
        ))}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Gross Commission', value: gross, color: '#6b7280' },
          ...bars,
        ].map((b, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: b.color || '#9ca3af' }} />
            <span className="text-[10px] text-gray-500 font-bold">{b.label}</span>
            <span className="text-[10px] font-extrabold text-gray-800">{fmt(b.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// CREATE DEAL MODAL
// ═══════════════════════════════════════════════════════════════════════════
const CreateDealModal = ({ onClose, onSuccess, initialLead = null }) => {
  const initialDraft = buildDealDraftFromLead(initialLead);
  const [form, setForm] = useState({
    leadId: initialDraft.leadId || '', propertyId: initialDraft.propertyId || '', inventoryUnitId: initialDraft.inventoryUnitId || '', customerId: initialDraft.customerId || '',
    advisorId: initialDraft.advisorId || '', agentId: initialDraft.agentId || '', agencyId: initialDraft.agencyId || '', referralPartnerId: '', partnerAgreementId: '',
    dealType: initialDraft.dealType || 'sale', transactionValue: '',
    grossPercent: 2, partnerPercent: 0, referralPercent: 0, notes: initialDraft.notes || '',
  });
  const [loading, setLoading] = useState(false);
  const [lookups, setLookups] = useState({
    leads: [], properties: [], customers: [],
    advisors: [], agents: [], agencies: [], referralPartners: [], inventory: [],
  });
  const [lookupLoading, setLookupLoading] = useState(true);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [spaDocs, setSpaDocs] = useState([{ docType: 'spa', url: '' }]);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const isLeadDriven = Boolean(initialLead?._id || initialLead?.id);

  useEffect(() => {
    let live = true;
    const loadLookups = async () => {
      setLookupLoading(true);
      try {
        const [
          websiteLeads,
          agentLeads,
          properties,
          customers,
          advisors,
          agents,
          agencies,
          referralPartners,
        ] = await Promise.all([
          apiService.get('/gridlead/website-only?page=1&limit=50').catch(() => null),
          apiService.get('/gridlead/agent-only?page=1&limit=50').catch(() => null),
          apiService.get('/properties?page=1&limit=50&approvalStatus=approved').catch(() => null),
          apiService.get('users/customers', { page: 1, limit: 50 }).catch(() => null),
          apiService.get('/GridAdvisor?page=1&limit=50').catch(() => null),
          apiService.get('/agency/admin/agents?page=1&limit=50').catch(() => null),
          apiService.get('/agency/admin/agencies?page=1&limit=50').catch(() => null),
          apiService.get('/users', { page: 1, limit: 50, role: 25 }).catch(() => null),
        ]);
        if (!live) return;
        const leadMap = new Map();
        [...asList(websiteLeads), ...asList(agentLeads)].forEach(lead => {
          if (lead?._id || lead?.id) leadMap.set(lead._id || lead.id, lead);
        });
        if (initialLead?._id || initialLead?.id) leadMap.set(initialLead._id || initialLead.id, initialLead);
        setLookups({
          leads: [...leadMap.values()],
          properties: [getLeadProperty(initialLead), ...asList(properties)].filter(Boolean),
          customers: [getLeadCustomer(initialLead), ...asList(customers)].filter(Boolean),
          advisors: [getLeadAdvisor(initialLead), ...asList(advisors)].filter(Boolean),
          agents: [getLeadAgent(initialLead), ...asList(agents)].filter(Boolean),
          agencies: [getLeadAgency(initialLead), ...asList(agencies)].filter(Boolean),
          referralPartners: asList(referralPartners),
          inventory: [],
        });
      } catch {
        message.error('Failed to load form dropdowns');
      } finally {
        if (live) setLookupLoading(false);
      }
    };
    loadLookups();
    return () => { live = false; };
  }, [initialLead]);

  useEffect(() => {
    let live = true;
    const loadInventory = async () => {
      if (!form.propertyId) {
        setLookups(p => ({ ...p, inventory: [] }));
        set('inventoryUnitId', '');
        return;
      }
      setInventoryLoading(true);
      try {
        const res = await apiService.get(`/properties/inventory?propertyId=${form.propertyId}`);
        if (live) {
          const fromLead = getLeadInventoryUnit(initialLead);
          setLookups(p => ({ ...p, inventory: [fromLead, ...asList(res)].filter(Boolean) }));
        }
      } catch {
        if (live) setLookups(p => ({ ...p, inventory: [] }));
      } finally {
        if (live) setInventoryLoading(false);
      }
    };
    loadInventory();
    return () => { live = false; };
  }, [form.propertyId, initialLead]);

  const commission = (() => {
    const tv = Number(form.transactionValue) || 0;
    const gross = (tv * Number(form.grossPercent)) / 100;
    const partner = (gross * Number(form.partnerPercent)) / 100;
    const referral = (gross * Number(form.referralPercent)) / 100;
    const xoto = gross - partner - referral;
    return { gross, partner, referral, xoto };
  })();

  const handleCreate = async () => {
    if (!form.leadId || !form.propertyId || !form.customerId || !form.transactionValue) {
      return message.warning('Lead, Property, Customer, and Transaction Value are required. Open this from a reserved lead with complete customer data.');
    }
    const validSpaDocs = spaDocs.filter(d => d.url.trim()).map(d => ({ ...d, url: d.url.trim() }));
    if (isLeadDriven && !validSpaDocs.length) {
      return message.warning('SPA document is required before creating deal record from a reserved lead');
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        source: isLeadDriven ? 'reserved_lead' : 'manual',
        evidenceDocuments: validSpaDocs,
        transactionValue: Number(form.transactionValue),
        grossPercent:    Number(form.grossPercent),
        partnerPercent:  Number(form.partnerPercent),
        referralPercent: Number(form.referralPercent),
      };
      // Remove empty optional fields
      ['advisorId','agentId','agencyId','referralPartnerId','partnerAgreementId','inventoryUnitId','source'].forEach(k => {
        if (!payload[k]) delete payload[k];
      });
      const res  = await apiService.post('/deal-record', payload);
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success) {
        const dealId = data?.data?._id || data?.deal?._id || data?._id;
        if (dealId && validSpaDocs.length) {
          await apiService.patch(`/deal-record/${dealId}/evidence`, { evidenceDocuments: validSpaDocs }).catch(() => null);
        }
        if (isLeadDriven) {
          await apiService.put(`/gridlead/${form.leadId}/status`, {
            status: 'spa_signed',
            notes: 'SPA documents uploaded and deal record created by admin',
            inventoryUnitId: form.inventoryUnitId,
          }).catch(() => null);
        }
        message.success('Deal record created');
        onSuccess();
        onClose();
      }
      else message.error(data?.message || 'Failed to create deal');
    } catch (e) { message.error(e?.response?.data?.message || 'Failed to create deal'); }
    finally { setLoading(false); }
  };

  const inp = 'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all';

  return (
    <Modal onClose={onClose}>
      <ModalHeader title="Create Deal Record" sub="Admin only — initiates the commission lifecycle" onClose={onClose} icon={FiPlus} />
      <div className="overflow-y-auto flex-1 p-6 space-y-6">

        {isLeadDriven && (
          <div className="p-4 rounded-2xl bg-green-50 border border-green-200 flex items-start gap-3">
            <FiCheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-extrabold text-green-800">Reserved lead selected</p>
              <p className="text-xs text-green-700 mt-1 leading-relaxed">
                Lead, property, unit, agent, agency and advisor are auto-filled from the reserved lead. Admin only needs to add transaction and commission details.
              </p>
            </div>
          </div>
        )}

        {/* Core references */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Core References <span className="text-red-400">*required</span></p>
          <div className="grid grid-cols-2 gap-3">
            {isLeadDriven ? (
              <>
                <LockedField label="Lead" value={leadName(initialLead)} hint={String(form.leadId).slice(-8)} />
                <LockedField label="Property" value={propertyName(getLeadProperty(initialLead))} hint={form.propertyId ? String(form.propertyId).slice(-8) : 'Missing property id'} />
                <LockedField label="Customer" value={userName(getLeadCustomer(initialLead)) || leadClientName(initialLead)} hint={form.customerId ? String(form.customerId).slice(-8) : 'Missing customer id'} />
                <LockedField label="Inventory Unit" value={unitName(getLeadInventoryUnit(initialLead))} hint={form.inventoryUnitId ? String(form.inventoryUnitId).slice(-8) : 'Optional'} />
              </>
            ) : (
              <>
            <LookupSelect
              label="Lead"
              required
              value={form.leadId}
              onChange={(v) => set('leadId', v)}
              options={toOptions(lookups.leads, leadName)}
              loading={lookupLoading}
              placeholder="Select lead by client name"
            />
            <LookupSelect
              label="Property"
              required
              value={form.propertyId}
              onChange={(v) => {
                setForm(p => ({ ...p, propertyId: v, inventoryUnitId: '' }));
              }}
              options={toOptions(lookups.properties, propertyName)}
              loading={lookupLoading}
              placeholder="Select property"
            />
            <LookupSelect
              label="Customer"
              required
              value={form.customerId}
              onChange={(v) => set('customerId', v)}
              options={toOptions(lookups.customers, userName)}
              loading={lookupLoading}
              placeholder="Select customer"
            />
            <LookupSelect
              label="Inventory Unit"
              value={form.inventoryUnitId}
              onChange={(v) => set('inventoryUnitId', v)}
              options={toOptions(lookups.inventory, unitName)}
              loading={inventoryLoading}
              disabled={!form.propertyId}
              placeholder={form.propertyId ? 'Select unit if applicable' : 'Select property first'}
              hint="Optional"
            />
              </>
            )}
          </div>
        </div>

        {/* Participants */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Participants (optional)</p>
          <div className="grid grid-cols-2 gap-3">
            {isLeadDriven ? (
              <>
                <LockedField label="Advisor" value={userName(getLeadAdvisor(initialLead))} hint="Proceeded by advisor" />
                <LockedField label="Agent" value={userName(getLeadAgent(initialLead))} hint="Lead creator / owner" />
                <LockedField label="Agency" value={getLeadAgency(initialLead)?.agency_name || getLeadAgency(initialLead)?.companyName || userName(getLeadAgency(initialLead))} hint="Agent agency" />
              </>
            ) : (
              <>
            <LookupSelect
              label="Advisor"
              value={form.advisorId}
              onChange={(v) => set('advisorId', v)}
              options={toOptions(lookups.advisors, userName)}
              loading={lookupLoading}
              placeholder="Select advisor"
              hint="Optional"
            />
            <LookupSelect
              label="Agent"
              value={form.agentId}
              onChange={(v) => set('agentId', v)}
              options={toOptions(lookups.agents, userName)}
              loading={lookupLoading}
              placeholder="Select agent by name"
              hint="Optional"
            />
            <LookupSelect
              label="Agency"
              value={form.agencyId}
              onChange={(v) => set('agencyId', v)}
              options={toOptions(lookups.agencies, a => a?.agency_name || a?.companyName || a?.name || a?.email || 'Unnamed agency')}
              loading={lookupLoading}
              placeholder="Select agency"
              hint="Optional"
            />
              </>
            )}
            <LookupSelect
              label="Referral Partner"
              value={form.referralPartnerId}
              onChange={(v) => set('referralPartnerId', v)}
              options={toOptions(lookups.referralPartners, userName)}
              loading={lookupLoading}
              placeholder="Select referral partner"
              hint="Optional"
            />
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Partner Agreement ID</label>
              <input value={form.partnerAgreementId} onChange={e => set('partnerAgreementId', e.target.value)} placeholder="Optional agreement reference" className={inp} />
              <p className="text-[10px] text-gray-400 font-medium mt-1">Optional</p>
            </div>
          </div>
        </div>

        {/* Deal details */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Deal Details</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Deal Type</label>
              <div className="flex gap-2">
                {['sale','lease'].map(t => (
                  <button key={t} onClick={() => set('dealType', t)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border capitalize transition-all
                      ${form.dealType === t ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-500'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Transaction Value (AED) <span className="text-red-400">*</span></label>
              <input type="number" value={form.transactionValue} onChange={e => set('transactionValue', e.target.value)}
                placeholder="e.g. 1500000" className={inp} />
            </div>
          </div>
        </div>

        {/* Commission structure */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Commission Structure</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { k: 'grossPercent',    label: 'Gross %',    hint: 'of transaction' },
              { k: 'partnerPercent',  label: 'Partner %',  hint: 'of gross'       },
              { k: 'referralPercent', label: 'Referral %', hint: 'of gross'       },
            ].map(({ k, label, hint }) => (
              <div key={k}>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">{label} <span className="text-gray-400 font-normal">({hint})</span></label>
                <input type="number" min="0" max="100" step="0.1"
                  value={form[k]} onChange={e => set(k, e.target.value)} className={inp} />
              </div>
            ))}
          </div>

          {/* Live preview */}
          {Number(form.transactionValue) > 0 && (
            <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Commission Preview</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { label: 'Gross',   value: commission.gross,   color: '#6b7280' },
                  { label: 'XOTO',    value: commission.xoto,    color: P         },
                  { label: 'Partner', value: commission.partner, color: P2        },
                  { label: 'Referral',value: commission.referral,color: '#a78bfa' },
                ].map((c, i) => (
                  <div key={i} className="text-center p-2.5 rounded-lg bg-white border border-gray-100">
                    <p className="text-[9px] font-bold text-gray-400 uppercase">{c.label}</p>
                    <p className="text-sm font-extrabold mt-1" style={{ color: c.color }}>
                      {fmt(c.value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SPA documents */}
        {isLeadDriven && (
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              SPA Documents <span className="text-red-400">*required</span>
            </p>
            <div className="space-y-3">
              {spaDocs.map((doc, i) => (
                <div key={i} className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">Document Type</label>
                    <select
                      value={doc.docType}
                      onChange={e => setSpaDocs(p => p.map((d, idx) => idx === i ? { ...d, docType: e.target.value } : d))}
                      className={inp}
                    >
                      {DOC_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ').toUpperCase()}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">Document URL</label>
                    <input
                      value={doc.url}
                      onChange={e => setSpaDocs(p => p.map((d, idx) => idx === i ? { ...d, url: e.target.value } : d))}
                      placeholder="https://..."
                      className={inp}
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={() => setSpaDocs(p => [...p, { docType: 'spa', url: '' }])}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-all"
              >
                <FiPlus size={12} /> Add Document
              </button>
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Notes (optional)</label>
          <textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)}
            placeholder="Any additional context for this deal..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all resize-none" />
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-100 flex justify-between gap-3 flex-shrink-0">
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={handleCreate} loading={loading}>
          <FiPlus size={14} /> Create Deal Record
        </Btn>
      </div>
    </Modal>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// EVIDENCE UPLOAD MODAL
// ═══════════════════════════════════════════════════════════════════════════
const EvidenceModal = ({ deal, onClose, onSuccess }) => {
  const [docs, setDocs] = useState([{ docType: 'spa', url: '' }]);
  const [loading, setLoading] = useState(false);

  const addDoc  = () => setDocs(p => [...p, { docType: 'spa', url: '' }]);
  const removeDoc = (i) => setDocs(p => p.filter((_, idx) => idx !== i));
  const updateDoc = (i, k, v) => setDocs(p => p.map((d, idx) => idx === i ? { ...d, [k]: v } : d));

  const handleUpload = async () => {
    const valid = docs.filter(d => d.url.trim());
    if (!valid.length) return message.warning('At least one document URL is required');
    setLoading(true);
    try {
      const res  = await apiService.patch(`/deal-record/${deal._id}/evidence`, { evidenceDocuments: valid });
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success) { message.success('Evidence uploaded'); onSuccess(); onClose(); }
      else message.error(data?.message || 'Upload failed');
    } catch (e) { message.error(e?.response?.data?.message || 'Upload failed'); }
    finally { setLoading(false); }
  };

  const inp = 'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all';

  return (
    <Modal onClose={onClose} maxW="max-w-lg">
      <ModalHeader title="Upload Evidence Documents" sub="SPA, booking form, title deed, etc." onClose={onClose} icon={FiUpload} />
      <div className="overflow-y-auto flex-1 p-6 space-y-4">
        <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100">
          <FiAlertCircle size={14} className="text-blue-500 flex-shrink-0" />
          <p className="text-xs text-blue-700 font-medium">
            At least one evidence document is required before confirming the deal.
          </p>
        </div>

        <div className="space-y-3">
          {docs.map((doc, i) => (
            <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-500">Document {i + 1}</p>
                {docs.length > 1 && (
                  <button onClick={() => removeDoc(i)} className="text-red-400 hover:text-red-600 transition-colors">
                    <FiX size={14} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">Document Type</label>
                  <select value={doc.docType} onChange={e => updateDoc(i, 'docType', e.target.value)} className={inp}>
                    {DOC_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ').toUpperCase()}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">Document URL</label>
                  <input value={doc.url} onChange={e => updateDoc(i, 'url', e.target.value)}
                    placeholder="https://..." className={inp} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={addDoc}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-all">
          <FiPlus size={12} /> Add Document
        </button>

        {/* Existing docs */}
        {deal?.evidenceDocuments?.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Existing Documents</p>
            <div className="space-y-1.5">
              {deal.evidenceDocuments.map((d, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-100 bg-white">
                  <FiFileText size={12} style={{ color: P }} className="flex-shrink-0" />
                  <span className="text-xs font-bold text-gray-600 uppercase">{d.docType?.replace('_', ' ')}</span>
                  <a href={d.url} target="_blank" rel="noreferrer" className="ml-auto">
                    <FiExternalLink size={11} className="text-gray-400 hover:text-purple-600" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-gray-100 flex justify-between flex-shrink-0">
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={handleUpload} loading={loading}>
          <FiUpload size={14} /> Upload Evidence
        </Btn>
      </div>
    </Modal>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// FLAG MODAL
// ═══════════════════════════════════════════════════════════════════════════
const FlagModal = ({ deal, onClose, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const isUnflag = deal?.isFlagged;

  const handleAction = async () => {
    if (!isUnflag && !reason.trim()) return message.warning('Flag reason is required');
    setLoading(true);
    try {
      const endpoint = isUnflag ? `/deal-record/${deal._id}/unflag` : `/deal-record/${deal._id}/flag`;
      const payload  = isUnflag ? {} : { reason: reason.trim() };
      const res  = await apiService.patch(endpoint, payload);
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success) { message.success(isUnflag ? 'Flag removed' : 'Deal flagged'); onSuccess(); onClose(); }
      else message.error(data?.message || 'Action failed');
    } catch (e) { message.error(e?.response?.data?.message || 'Action failed'); }
    finally { setLoading(false); }
  };

  return (
    <Modal onClose={onClose} maxW="max-w-md">
      <ModalHeader
        title={isUnflag ? 'Remove Flag' : 'Flag Deal for Review'}
        sub={isUnflag ? 'Clear the review flag on this deal' : 'Mark this deal for admin review'}
        onClose={onClose} icon={FiFlag}
      />
      <div className="p-6 space-y-4">
        {isUnflag ? (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-sm font-semibold text-amber-800">Current flag: <span className="font-bold">"{deal.flagReason}"</span></p>
            <p className="text-xs text-amber-600 mt-1">This will remove the review flag from the deal.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
              <FiAlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 font-medium">Flagged deals are highlighted for review and cannot be silently processed.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Flag Reason <span className="text-red-400">*</span></label>
              <textarea rows={3} value={reason} onChange={e => setReason(e.target.value)}
                placeholder="e.g. Commission percentage dispute — needs verification..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all resize-none" />
            </div>
          </div>
        )}
      </div>
      <div className="px-6 pb-6 flex justify-end gap-3">
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn variant={isUnflag ? 'ghost' : 'amber'} onClick={handleAction} loading={loading}>
          <FiFlag size={13} /> {isUnflag ? 'Remove Flag' : 'Flag Deal'}
        </Btn>
      </div>
    </Modal>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// VOID MODAL
// ═══════════════════════════════════════════════════════════════════════════
const VoidModal = ({ deal, onClose, onSuccess }) => {
  const [reason,  setReason]  = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = reason.trim() && confirm === deal?.dealReference;

  const handleVoid = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      const res  = await apiService.patch(`/deal-record/${deal._id}/void`, { reason });
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success) { message.success('Deal record voided'); onSuccess(); onClose(); }
      else message.error(data?.message || 'Void failed');
    } catch (e) { message.error(e?.response?.data?.message || 'Void failed'); }
    finally { setLoading(false); }
  };

  return (
    <Modal onClose={onClose} maxW="max-w-md">
      <ModalHeader title="Void Deal Record" sub="Super Admin only — this action cannot be undone" onClose={onClose} icon={FiTrash2} />
      <div className="p-6 space-y-4">
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-1">
          <p className="text-sm font-bold text-red-800">⚠ Irreversible Action</p>
          <p className="text-xs text-red-700 leading-relaxed">
            Voiding will release the locked inventory unit back to available, revert the lead status to In Discussion, and soft-delete this deal record.
          </p>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Void Reason <span className="text-red-400">*</span></label>
          <textarea rows={2} value={reason} onChange={e => setReason(e.target.value)}
            placeholder="e.g. Client withdrew — deal cancelled by mutual agreement..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all resize-none" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
            Type <span className="font-mono text-red-600">{deal?.dealReference}</span> to confirm
          </label>
          <input value={confirm} onChange={e => setConfirm(e.target.value)}
            placeholder={deal?.dealReference}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 font-mono outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all" />
        </div>
      </div>
      <div className="px-6 pb-6 flex justify-end gap-3">
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn variant="danger" onClick={handleVoid} loading={loading} disabled={!canSubmit}>
          <FiTrash2 size={13} /> Void Deal
        </Btn>
      </div>
    </Modal>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ESCALATE MODAL
// ═══════════════════════════════════════════════════════════════════════════
const EscalateModal = ({ deal, onClose, onSuccess }) => {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEscalate = async () => {
    if (!note.trim()) return message.warning('Escalation note is required');
    setLoading(true);
    try {
      const res  = await apiService.patch(`/deal-record/${deal._id}/escalate`, { note });
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success) { message.success('Deal escalated to super admin'); onSuccess(); onClose(); }
      else message.error(data?.message || 'Escalate failed');
    } catch (e) { message.error(e?.response?.data?.message || 'Escalate failed'); }
    finally { setLoading(false); }
  };

  return (
    <Modal onClose={onClose} maxW="max-w-md">
      <ModalHeader title="Escalate to Super Admin" sub="Raise this deal for urgent review" onClose={onClose} icon={FiCornerUpRight} />
      <div className="p-6 space-y-4">
        <div className="flex items-start gap-2 p-3 rounded-xl bg-purple-50 border border-purple-100">
          <FiShield size={15} style={{ color: P }} className="flex-shrink-0 mt-0.5" />
          <p className="text-xs text-purple-800 font-medium">Super admin will receive an escalation notice and review this deal directly.</p>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Escalation Note <span className="text-red-400">*</span></label>
          <textarea rows={4} value={note} onChange={e => setNote(e.target.value)}
            placeholder="Describe the issue requiring super admin attention..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all resize-none" />
        </div>
      </div>
      <div className="px-6 pb-6 flex justify-end gap-3">
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={handleEscalate} loading={loading}>
          <FiCornerUpRight size={13} /> Escalate Deal
        </Btn>
      </div>
    </Modal>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// DEAL DETAIL MODAL — full lifecycle view
// ═══════════════════════════════════════════════════════════════════════════
const DealDetailModal = ({ deal: initialDeal, onClose, onRefresh }) => {
  const [deal, setDeal]           = useState(initialDeal);
  const [tab, setTab]             = useState('overview');
  const [confirming, setConfirming] = useState(false);
  const [paying,     setPaying]     = useState(false);
  const [payingRef,  setPayingRef]  = useState(false);
  const [modal, setModal]          = useState(null); // 'evidence' | 'flag' | 'void' | 'escalate'

  const prop    = deal?.propertyId;
  const cust    = deal?.customerId;
  const advisor = deal?.advisorId;
  const agent   = deal?.agentId;
  const unit    = deal?.inventoryUnitId;
  const com     = deal?.commission || {};

  const isLocked   = deal?.isLocked;
  const isFlagged  = deal?.isFlagged;
  const isVoided   = deal?.isVoided;
  const hasEvidence = deal?.evidenceUploaded && deal?.evidenceDocuments?.length > 0;

  const refreshDeal = async () => {
    try {
      const res  = await apiService.get(`/deal-record/${deal._id}`);
      const data = res?.data?.data || res?.data;
      if (data) setDeal(data);
      onRefresh?.();
    } catch {}
  };

  const handleConfirm = async () => {
    if (!hasEvidence) return message.warning('Upload evidence documents first');
    setConfirming(true);
    try {
      const res  = await apiService.patch(`/deal-record/${deal._id}/confirm`, {});
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success) { message.success('Deal confirmed and locked'); refreshDeal(); }
      else message.error(data?.message || 'Confirm failed');
    } catch (e) { message.error(e?.response?.data?.message || 'Confirm failed'); }
    finally { setConfirming(false); }
  };

  const handlePay = async (type = 'main') => {
    const setter = type === 'main' ? setPaying : setPayingRef;
    const endpoint = type === 'main' ? `/deal-record/${deal._id}/pay` : `/deal-record/${deal._id}/pay-referral`;
    setter(true);
    try {
      const res  = await apiService.patch(endpoint, {});
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success) { message.success('Commission marked as paid'); refreshDeal(); }
      else message.error(data?.message || 'Action failed');
    } catch (e) { message.error(e?.response?.data?.message || 'Action failed'); }
    finally { setter(false); }
  };

  const TABS = [
    { key: 'overview',    label: 'Overview',    icon: FiLayers   },
    { key: 'commission',  label: 'Commission',  icon: FiDollarSign },
    { key: 'evidence',    label: 'Evidence',    icon: FiFileText, badge: deal?.evidenceDocuments?.length },
    { key: 'history',     label: 'History',     icon: FiActivity },
  ];

  return (
    <>
      {modal === 'evidence'  && <EvidenceModal  deal={deal} onClose={() => setModal(null)} onSuccess={refreshDeal} />}
      {modal === 'flag'      && <FlagModal      deal={deal} onClose={() => setModal(null)} onSuccess={refreshDeal} />}
      {modal === 'void'      && <VoidModal      deal={deal} onClose={() => setModal(null)} onSuccess={() => { refreshDeal(); onClose(); }} />}
      {modal === 'escalate'  && <EscalateModal  deal={deal} onClose={() => setModal(null)} onSuccess={refreshDeal} />}

      <Modal onClose={onClose} maxW="max-w-3xl">
        {/* Header */}
        <div className="px-6 py-5 flex-shrink-0" style={{ background: GR }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <p className="text-lg font-extrabold text-white font-mono tracking-wide">{deal?.dealReference}</p>
                <Pill status={deal?.commissionStatus} />
                <Pill status={deal?.dealType} type="deal" />
                {isLocked   && <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white"><FiLock size={9} /> Locked</span>}
                {isFlagged  && <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/90 text-white"><FiFlag size={9} /> Flagged</span>}
                {isVoided   && <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/90 text-white"><FiXCircle size={9} /> Voided</span>}
                {deal?.isEscalated && <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/90 text-white"><FiCornerUpRight size={9} /> Escalated</span>}
              </div>
              <p className="text-xs text-white/70 mt-1">Created {fmtDate(deal?.createdAt)}</p>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 flex-shrink-0">
              <FiX size={16} />
            </button>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 mt-5 bg-white/10 rounded-xl p-1">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all
                  ${tab === t.key ? 'bg-white text-purple-700 shadow-sm' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
                <t.icon size={12} />
                {t.label}
                {t.badge > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold ${tab === t.key ? 'bg-purple-600 text-white' : 'bg-white/30 text-white'}`}>
                    {t.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6">

          {/* ── OVERVIEW ── */}
          {tab === 'overview' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Property */}
                <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                    <FiHome size={12} style={{ color: P }} />
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Property</p>
                  </div>
                  <div className="p-4">
                    {typeof prop === 'object' && prop ? (
                      <>
                        <p className="text-sm font-bold text-gray-900">{prop.propertyName || '—'}</p>
                        {prop.area && <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><FiMapPin size={10} /> {[prop.area, prop.city].filter(Boolean).join(', ')}</p>}
                        <p className="text-sm font-extrabold mt-1.5" style={{ color: P }}>{fmt(prop.price)}</p>
                      </>
                    ) : (
                      <p className="text-xs text-gray-500 font-mono">{String(deal?.propertyId || '—').slice(-8)}</p>
                    )}
                  </div>
                </div>

                {/* Customer */}
                <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                    <FiUser size={12} style={{ color: P }} />
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Customer</p>
                  </div>
                  <div className="p-4">
                    {typeof cust === 'object' && cust ? (
                      <>
                        <p className="text-sm font-bold text-gray-900">{[cust.firstName, cust.lastName].filter(Boolean).join(' ') || '—'}</p>
                        {cust.phone && <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><FiPhone size={10} /> {cust.phone}</p>}
                        {cust.email && <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><FiMail size={10} /> {cust.email}</p>}
                      </>
                    ) : (
                      <p className="text-xs text-gray-500 font-mono">{String(deal?.customerId || '—').slice(-8)}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Inventory unit */}
              {unit && (
                <div className="p-4 rounded-xl border border-purple-100 bg-purple-50">
                  <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-2">Locked Inventory Unit</p>
                  {typeof unit === 'object' ? (
                    <div className="flex flex-wrap gap-3">
                      {[
                        { l: 'Unit',     v: unit.unitNumber    },
                        { l: 'Floor',    v: unit.floorNumber   },
                        { l: 'Type',     v: unit.bedroomType   },
                        { l: 'Status',   v: unit.status        },
                        { l: 'Price',    v: fmt(unit.price)    },
                      ].filter(f => f.v).map((f, i) => (
                        <div key={i} className="text-center">
                          <p className="text-[9px] font-bold text-purple-400 uppercase">{f.l}</p>
                          <p className="text-xs font-bold text-purple-800 mt-0.5">{f.v}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs font-mono text-purple-700">{String(unit)}</p>
                  )}
                </div>
              )}

              {/* Participants */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Participants</p>
                <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
                  {advisor && (
                    <InfoRow icon={FiAward} label="Advisor"
                      value={typeof advisor === 'object' ? `${advisor.firstName || ''} ${advisor.lastName || ''}`.trim() || advisor.email : String(advisor).slice(-8)} />
                  )}
                  {agent && (
                    <InfoRow icon={FiUser} label="Agent"
                      value={typeof agent === 'object' ? `${agent.first_name || ''} ${agent.last_name || ''}`.trim() || agent.email : String(agent).slice(-8)} />
                  )}
                  {deal?.agencyId && (
                    <InfoRow icon={FiLayers} label="Agency"
                      value={typeof deal.agencyId === 'object' ? deal.agencyId.companyName : String(deal.agencyId).slice(-8)} />
                  )}
                  {deal?.referralPartnerId && (
                    <InfoRow icon={FiCornerUpRight} label="Referral Partner"
                      value={typeof deal.referralPartnerId === 'object'
                        ? `${deal.referralPartnerId.firstName || ''} ${deal.referralPartnerId.lastName || ''}`.trim()
                        : String(deal.referralPartnerId).slice(-8)} />
                  )}
                </div>
              </div>

              {/* Key dates */}
              <div className="bg-white rounded-xl border border-gray-100">
                <InfoRow icon={FiCalendar} label="Created"    value={fmtDateTime(deal?.createdAt)} />
                {deal?.confirmedAt && <InfoRow icon={FiCheckCircle} label="Confirmed" value={fmtDateTime(deal.confirmedAt)} />}
                {deal?.paidAt      && <InfoRow icon={FiDollarSign}  label="Paid"      value={fmtDateTime(deal.paidAt)}      />}
              </div>

              {/* Flag / escalate info */}
              {isFlagged && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2">
                  <FiFlag size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-amber-800">Flagged for Review</p>
                    <p className="text-xs text-amber-700 mt-0.5">{deal.flagReason}</p>
                  </div>
                </div>
              )}
              {deal?.isEscalated && (
                <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 flex items-start gap-2">
                  <FiCornerUpRight size={14} className="text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-orange-800">Escalated to Super Admin</p>
                    <p className="text-xs text-orange-700 mt-0.5">{deal.escalationNote}</p>
                  </div>
                </div>
              )}
              {deal?.notes && (
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Notes</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{deal.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* ── COMMISSION ── */}
          {tab === 'commission' && (
            <div className="space-y-5">
              {/* Transaction value hero */}
              <div className="p-5 rounded-2xl border border-purple-100 text-center"
                style={{ background: 'linear-gradient(135deg,#f5f3ff,#ede9fe)' }}>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: P }}>Transaction Value</p>
                <p className="text-3xl font-extrabold mt-1" style={{ color: P }}>{fmt(deal?.transactionValue)}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Pill status={deal?.dealType} type="deal" />
                  <Pill status={deal?.commissionStatus} />
                </div>
              </div>

              {/* Commission breakdown */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
                  <FiBarChart2 size={13} style={{ color: P }} />
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Commission Breakdown</p>
                </div>
                <div className="p-5">
                  <CommissionBar
                    gross={com.grossAmount}
                    xoto={com.xotoRetained}
                    partner={com.partnerShare}
                    referral={com.referralShare}
                  />
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {[
                      { l: 'Gross Commission',  v: com.grossAmount,   pct: com.grossPercent,    color: '#6b7280', bg: '#f9fafb'  },
                      { l: 'XOTO Retained',     v: com.xotoRetained,  pct: com.xotoPercent,     color: P,         bg: '#f5f3ff'  },
                      { l: 'Partner Share',     v: com.partnerShare,  pct: com.partnerPercent,  color: P2,        bg: '#faf5ff'  },
                      { l: 'Referral Share',    v: com.referralShare, pct: com.referralPercent, color: '#a78bfa', bg: '#fdf4ff'  },
                    ].map((r, i) => (
                      <div key={i} className="p-4 rounded-xl border" style={{ background: r.bg, borderColor: r.color + '30' }}>
                        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: r.color }}>{r.l}</p>
                        <p className="text-lg font-extrabold mt-1" style={{ color: r.color }}>{fmt(r.v)}</p>
                        <p className="text-xs font-semibold mt-0.5 opacity-60" style={{ color: r.color }}>{r.pct}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Referral commission status */}
              {deal?.referralPartnerId && (
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-600">Referral Commission Status</p>
                    <Pill status={deal.referralCommissionStatus || 'not_applicable'} />
                  </div>
                  {deal.referralPaidAt && (
                    <p className="text-xs text-gray-400 mt-1">Paid on {fmtDate(deal.referralPaidAt)}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── EVIDENCE ── */}
          {tab === 'evidence' && (
            <div className="space-y-4">
              {!hasEvidence && (
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                  <FiUpload size={28} className="mx-auto mb-2 text-amber-400" />
                  <p className="text-sm font-bold text-amber-800">No evidence uploaded yet</p>
                  <p className="text-xs text-amber-600 mt-1 mb-4">SPA or booking form is required before confirming this deal</p>
                  {!isLocked && (
                    <Btn variant="amber" size="sm" onClick={() => setModal('evidence')}>
                      <FiUpload size={12} /> Upload Documents
                    </Btn>
                  )}
                </div>
              )}

              {deal?.evidenceDocuments?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Uploaded Documents ({deal.evidenceDocuments.length})</p>
                  {deal.evidenceDocuments.map((doc, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-white hover:shadow-sm transition-shadow">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#f5f3ff' }}>
                        <FiFileText size={15} style={{ color: P }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-700 uppercase">{doc.docType?.replace('_', ' ')}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{fmtDate(doc.uploadedAt)}</p>
                      </div>
                      <a href={doc.url} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 transition-all">
                        <FiExternalLink size={10} /> View
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {!isLocked && hasEvidence && (
                <Btn variant="ghost" size="sm" onClick={() => setModal('evidence')}>
                  <FiPlus size={12} /> Add More Documents
                </Btn>
              )}
            </div>
          )}

          {/* ── HISTORY ── */}
          {tab === 'history' && (
            <div className="space-y-4">
              {deal?.statusHistory?.length > 0 ? (
                <div className="relative">
                  <div className="absolute left-[15px] top-0 bottom-0 w-px bg-gray-100" />
                  <div className="space-y-4">
                    {[...deal.statusHistory].reverse().map((h, i) => (
                      <div key={i} className="relative pl-10">
                        <div className="absolute left-0 top-2 w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center" style={{ background: P }}>
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                {h.from && (
                                  <>
                                    <span className="text-xs font-bold text-gray-400 capitalize">{h.from}</span>
                                    <FiArrowRight size={10} className="text-gray-300" />
                                  </>
                                )}
                                <span className="text-xs font-bold capitalize" style={{ color: P }}>{h.to}</span>
                              </div>
                              {h.note && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{h.note}</p>}
                            </div>
                            <span className="text-[10px] text-gray-400 font-medium flex-shrink-0">{fmtDate(h.at)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <FiActivity size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No status history yet</p>
                </div>
              )}

              {/* Edit history */}
              {deal?.editHistory?.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Edit History ({deal.editHistory.length})</p>
                  <div className="space-y-2">
                    {deal.editHistory.map((e, i) => (
                      <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                        <div className="flex justify-between">
                          <span className="font-bold text-gray-600">Fields edited: {Object.keys(e.fields || {}).join(', ')}</span>
                          <span className="text-gray-400">{fmtDate(e.editedAt)}</span>
                        </div>
                        {e.reason && <p className="text-gray-500 mt-0.5">{e.reason}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── ACTION FOOTER ── */}
        {!isVoided && (
          <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
            <div className="flex flex-wrap gap-2 justify-between items-center">
              {/* Left: destructive actions */}
              <div className="flex flex-wrap gap-2">
                {!isLocked && (
                  <Btn size="sm" variant="amber" onClick={() => setModal('flag')}>
                    <FiFlag size={11} /> {isFlagged ? 'Unflag' : 'Flag'}
                  </Btn>
                )}
                {!isLocked && !deal?.isEscalated && (
                  <Btn size="sm" variant="ghost" onClick={() => setModal('escalate')}>
                    <FiCornerUpRight size={11} /> Escalate
                  </Btn>
                )}
                <Btn size="sm" variant="danger" onClick={() => setModal('void')}>
                  <FiTrash2 size={11} /> Void
                </Btn>
              </div>

              {/* Right: lifecycle progression */}
              <div className="flex flex-wrap gap-2">
                {!isLocked && (
                  <Btn size="sm" variant="ghost" onClick={() => setModal('evidence')}>
                    <FiUpload size={11} /> {hasEvidence ? 'Add Evidence' : 'Upload Evidence'}
                  </Btn>
                )}
                {!isLocked && deal?.commissionStatus === 'pending' && (
                  <Btn size="sm" variant={hasEvidence ? 'success' : 'ghost'}
                    onClick={handleConfirm} loading={confirming} disabled={!hasEvidence}>
                    <FiCheckCircle size={11} /> Confirm Deal
                  </Btn>
                )}
                {deal?.commissionStatus === 'confirmed' && !paying && (
                  <Btn size="sm" variant="success" onClick={() => handlePay('main')} loading={paying}>
                    <FiDollarSign size={11} /> Mark Paid
                  </Btn>
                )}
                {deal?.referralCommissionStatus === 'confirmed' && (
                  <Btn size="sm" variant="ghost" onClick={() => handlePay('referral')} loading={payingRef}>
                    <FiCornerUpRight size={11} /> Pay Referral
                  </Btn>
                )}
              </div>
            </div>

            {/* Confirm hint */}
            {!isLocked && deal?.commissionStatus === 'pending' && !hasEvidence && (
              <p className="text-[10px] text-amber-600 font-semibold mt-2 flex items-center gap-1">
                <FiAlertCircle size={10} /> Upload evidence to enable confirmation
              </p>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// DEAL ROW CARD
// ═══════════════════════════════════════════════════════════════════════════
const DealCard = ({ deal, onClick }) => {
  const prop = deal?.propertyId;
  const com  = deal?.commission || {};
  const isLocked  = deal?.isLocked;
  const isFlagged = deal?.isFlagged;
  const isVoided  = deal?.isVoided;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border p-5 cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 group
        ${isVoided  ? 'border-red-100 opacity-60'    :
          isFlagged ? 'border-amber-200 ring-1 ring-amber-100' :
          isLocked  ? 'border-green-100 ring-1 ring-green-50'  :
                      'border-gray-100'}`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-extrabold font-mono text-gray-800 group-hover:text-purple-700 transition-colors">
            {deal.dealReference}
          </p>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <Pill status={deal.commissionStatus} />
            <Pill status={deal.dealType} type="deal" />
            {isLocked   && <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700"><FiLock size={8} /> Locked</span>}
            {isFlagged  && <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700"><FiFlag size={8} /> Flagged</span>}
            {isVoided   && <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700"><FiXCircle size={8} /> Voided</span>}
            {deal.isEscalated && <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700"><FiCornerUpRight size={8} /> Escalated</span>}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-base font-extrabold" style={{ color: P }}>{fmt(deal.transactionValue)}</p>
          <p className="text-[10px] text-gray-400 font-medium mt-0.5">Transaction</p>
        </div>
      </div>

      {/* Property */}
      {typeof prop === 'object' && prop && (
        <div className="mt-3 flex items-center gap-2">
          <FiHome size={11} className="text-gray-400 flex-shrink-0" />
          <p className="text-xs text-gray-500 truncate">{prop.propertyName}{prop.area ? ` · ${prop.area}` : ''}</p>
        </div>
      )}

      {/* Commission summary */}
      <div className="mt-3 pt-3 border-t border-gray-50 grid grid-cols-3 gap-2">
        {[
          { label: 'Gross',  value: com.grossAmount,  color: '#6b7280' },
          { label: 'XOTO',   value: com.xotoRetained, color: P        },
          { label: 'Partner',value: com.partnerShare, color: P2       },
        ].map((c, i) => (
          <div key={i}>
            <p className="text-[9px] font-bold uppercase text-gray-400">{c.label}</p>
            <p className="text-xs font-extrabold mt-0.5" style={{ color: c.color }}>{fmt(c.value)}</p>
          </div>
        ))}
      </div>

      {/* Date */}
      <p className="text-[10px] text-gray-300 font-medium mt-3">{fmtDate(deal.createdAt)}</p>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════
const Dealrecordspage = () => {
  const location = useLocation();
  const [deals,       setDeals]       = useState([]);
  const [stats,       setStats]       = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [statsLoad,   setStatsLoad]   = useState(true);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const LIMIT = 12;

  const [filters, setFilters] = useState({
    commissionStatus: '', dealType: '', isFlagged: '',
    isVoided: '', sortOrder: 'desc', search: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [showCreate,   setShowCreate]   = useState(false);
  const [prefillLead,   setPrefillLead]   = useState(null);
  const [prefillLoading,setPrefillLoading]= useState(false);

  const debounceRef = useRef(null);

  const fetchDeals = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pg, limit: LIMIT, sortOrder: filters.sortOrder,
        ...(filters.commissionStatus && { commissionStatus: filters.commissionStatus }),
        ...(filters.dealType         && { dealType: filters.dealType }),
        ...(filters.isFlagged        && { isFlagged: filters.isFlagged }),
        ...(filters.isVoided         && { isVoided: filters.isVoided }),
      });
      const res  = await apiService.get(`/deal-record?${params}`);
      const data = res?.data?.success !== undefined ? res.data : res;
      setDeals(data?.data || []);
      setTotal(data?.pagination?.total || 0);
    } catch { message.error('Failed to load deal records'); }
    finally { setLoading(false); }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    setStatsLoad(true);
    try {
      const res  = await apiService.get('/deal-record/stats');
      const data = res?.data?.success !== undefined ? res.data : res;
      setStats(data?.data || null);
    } catch {}
    finally { setStatsLoad(false); }
  }, []);

  useEffect(() => { fetchDeals(1); setPage(1); }, [fetchDeals]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shouldCreate = params.get('create') === '1';
    const leadId = params.get('leadId');
    if (!shouldCreate || !leadId) return;

    let live = true;
    setPrefillLoading(true);
    apiService.get(`/gridlead/${leadId}`)
      .then(res => {
        const lead = res?.data?.data || res?.data || res;
        if (!live) return;
        setPrefillLead(lead);
        setShowCreate(true);
      })
      .catch(() => message.error('Failed to load reserved lead for deal record'))
      .finally(() => { if (live) setPrefillLoading(false); });
    return () => { live = false; };
  }, [location.search]);

  const setFilter = (k, v) => setFilters(p => ({ ...p, [k]: v }));

  const statCards = (() => {
    if (!stats?.byStatus) return [];
    const byStatus = stats.byStatus.reduce((m, s) => { m[s._id] = s; return m; }, {});
    return [
      {
        label: 'Total Deals',      icon: FiLayers,    color: P,        bg: '#f5f3ff', border: '#ddd6fe',
        value: stats.byStatus.reduce((s, b) => s + b.count, 0),
        sub:   `${stats.flaggedCount || 0} flagged`,
      },
      {
        label: 'Pending',          icon: FiClock,     color: '#d97706', bg: '#fffbeb', border: '#fde68a',
        value: byStatus.pending?.count  || 0,
        sub:   fmt(byStatus.pending?.totalGross),
      },
      {
        label: 'Confirmed',        icon: FiCheckCircle, color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe',
        value: byStatus.confirmed?.count || 0,
        sub:   fmt(byStatus.confirmed?.totalGross),
      },
      {
        label: 'Paid',             icon: FiAward,     color: '#166534', bg: '#f0fdf4', border: '#bbf7d0',
        value: byStatus.paid?.count     || 0,
        sub:   fmt(byStatus.paid?.totalGross),
      },
      {
        label: 'Gross Commission', icon: FiTrendingUp, color: P2,       bg: '#faf5ff', border: '#e9d5ff',
        value: fmt(stats.byStatus.reduce((s, b) => s + (b.totalGross || 0), 0)),
        sub:   `${fmt(stats.byStatus.reduce((s, b) => s + (b.totalXoto || 0), 0))} XOTO retained`,
      },
    ];
  })();

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <>
      {selectedDeal && (
        <DealDetailModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          onRefresh={() => fetchDeals(page)}
        />
      )}
      {showCreate && (
        <CreateDealModal
          initialLead={prefillLead}
          onClose={() => { setShowCreate(false); setPrefillLead(null); }}
          onSuccess={() => { fetchDeals(1); setPage(1); fetchStats(); }}
        />
      )}

      <div className="min-h-screen bg-slate-50 font-sans">

        {/* ── PAGE HEADER ── */}
        <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-lg font-extrabold text-gray-900">Deal Records</h1>
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                Commission ledger · {total} deal{total !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Btn variant="ghost" size="sm" onClick={() => { fetchDeals(page); fetchStats(); }}>
                <FiRefreshCw size={13} /> Refresh
              </Btn>
              <Btn variant="primary" size="sm" onClick={() => { setPrefillLead(null); setShowCreate(true); }}>
                <FiPlus size={13} /> New Deal
              </Btn>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

          {/* ── STATS GRID ── */}
          {statsLoad ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                  <div className="h-3 bg-gray-100 rounded w-2/3 mb-3" />
                  <div className="h-7 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {statCards.map((s, i) => <StatCard key={i} {...s} />)}
            </div>
          )}

          {/* ── FILTERS ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50">
              {/* Search */}
              <div className="flex-1 relative">
                <FiSearch size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  placeholder="Search by deal reference..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                />
              </div>

              {/* Quick filter pills */}
              <div className="hidden sm:flex items-center gap-1.5">
                {['','pending','confirmed','paid'].map(s => (
                  <button key={s} onClick={() => setFilter('commissionStatus', s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all
                      ${filters.commissionStatus === s ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-500 hover:border-purple-200'}`}>
                    {s === '' ? 'All' : COM_STATUS[s]?.label}
                  </button>
                ))}
              </div>

              <button onClick={() => setShowFilters(p => !p)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all
                  ${showFilters ? 'border-purple-300 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                <FiSliders size={13} />
                Filters
                {showFilters ? <FiChevronUp size={11} /> : <FiChevronDown size={11} />}
              </button>
            </div>

            {/* Expanded filters */}
            {showFilters && (
              <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 border-b border-gray-100">
                {[
                  { label: 'Deal Type',   key: 'dealType',         opts: [['','All Types'],['sale','Sale'],['lease','Lease']] },
                  { label: 'Flagged',     key: 'isFlagged',        opts: [['','Any'],['true','Flagged'],['false','Not Flagged']] },
                  { label: 'Voided',      key: 'isVoided',         opts: [['','Active'],['true','Voided']] },
                  { label: 'Sort Order',  key: 'sortOrder',        opts: [['desc','Newest First'],['asc','Oldest First']] },
                ].map(({ label, key, opts }) => (
                  <div key={key}>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{label}</label>
                    <select value={filters[key]} onChange={e => setFilter(key, e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white outline-none focus:border-purple-400 transition-all">
                      {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── DEALS GRID ── */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse space-y-3">
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-100 rounded w-1/3" />
                    <div className="h-4 bg-gray-100 rounded w-1/4" />
                  </div>
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="pt-2 border-t border-gray-50 grid grid-cols-3 gap-2">
                    <div className="h-6 bg-gray-100 rounded" />
                    <div className="h-6 bg-gray-100 rounded" />
                    <div className="h-6 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : deals.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <FiFileText size={40} className="mx-auto mb-3 text-gray-200" />
              <p className="text-gray-500 font-semibold">No deal records found</p>
              <p className="text-gray-400 text-sm mt-1 mb-5">Create your first deal record to get started</p>
              <Btn variant="primary" size="sm" onClick={() => { setPrefillLead(null); setShowCreate(true); }}>
                <FiPlus size={12} /> Create Deal Record
              </Btn>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {deals.map((deal, i) => (
                <DealCard key={deal._id || i} deal={deal} onClick={() => setSelectedDeal(deal)} />
              ))}
            </div>
          )}

          {/* ── PAGINATION ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 px-5 py-3.5 shadow-sm">
              <p className="text-xs text-gray-400 font-medium">
                Page {page} of {totalPages} · {total} total
              </p>
              <div className="flex items-center gap-2">
                <Btn variant="ghost" size="sm" disabled={page <= 1}
                  onClick={() => { setPage(p => p - 1); fetchDeals(page - 1); }}>
                  <FiArrowLeft size={13} /> Prev
                </Btn>
                <div className="flex gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pg = page <= 3 ? i + 1 : page - 2 + i;
                    if (pg > totalPages) return null;
                    return (
                      <button key={pg}
                        onClick={() => { setPage(pg); fetchDeals(pg); }}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all
                          ${pg === page ? 'text-white shadow-sm' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                        style={pg === page ? { background: GR } : {}}>
                        {pg}
                      </button>
                    );
                  })}
                </div>
                <Btn variant="ghost" size="sm" disabled={page >= totalPages}
                  onClick={() => { setPage(p => p + 1); fetchDeals(page + 1); }}>
                  Next <FiArrowRight size={13} />
                </Btn>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dealrecordspage; 
