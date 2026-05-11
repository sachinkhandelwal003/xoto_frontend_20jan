import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSearch, FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight,
  FiRefreshCw, FiPlus, FiEye, FiUser, FiHome, FiClock, FiPhone, FiMail,
  FiMapPin, FiDollarSign, FiCalendar, FiMessageSquare, FiX, FiTag,
  FiAlertCircle, FiCheckCircle, FiActivity, FiLayers
} from 'react-icons/fi';
import { Input, Select, Button, Tooltip, message } from 'antd';
import { apiService } from '../../../manageApi/utils/custom.apiservice';

const { Option } = Select;

const PRIMARY  = '#4A027C';
const GRADIENT = 'linear-gradient(135deg, #4A027C 0%, #7C3AED 100%)';

const isAssignmentText = (value) => {
  const text = String(value || '').toLowerCase();
  return text.includes('assigned') || text.includes('assign advisor') || text.includes('advisor');
};

const sanitizeLeadForAgent = (lead) => {
  if (!lead || typeof lead !== 'object') return lead;

  const {
    assigned_to,
    assignedAdvisor,
    assigned_at,
    assigned_by,
    assignment_notes,
    ...safeLead
  } = lead;

  return {
    ...safeLead,
    notes: Array.isArray(lead.notes)
      ? lead.notes.filter((note) => !isAssignmentText(note?.text || note?.notes || note))
      : lead.notes,
    status_history: Array.isArray(lead.status_history)
      ? lead.status_history.filter((entry) => (
          !isAssignmentText(entry?.status) &&
          !isAssignmentText(entry?.notes) &&
          !isAssignmentText(entry?.changed_by)
        ))
      : lead.status_history,
  };
};

// ─────────────────────────────────────────────────────────────
// BADGE MAPS
// ─────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  new:                  { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  contacted:            { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
  qualified:            { bg: '#F0F9FF', text: '#0369A1', border: '#BAE6FD' },
  in_discussion:        { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
  site_visit_scheduled: { bg: '#F5F3FF', text: '#7C3AED', border: '#DDD6FE' },
  offer_made:           { bg: '#FFF7ED', text: '#EA580C', border: '#FDBA74' },
  reserved:             { bg: '#FDF2F8', text: '#DB2777', border: '#FBCFE8' },
  spa_signed:           { bg: '#ECFDF5', text: '#059669', border: '#6EE7B7' },
  completed:            { bg: '#F0FDF4', text: '#15803D', border: '#86EFAC' },
  not_proceeding:       { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
};

const CLASS_COLORS = {
  hot:  { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
  warm: { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
  cold: { bg: '#F0F9FF', text: '#0369A1', border: '#BAE6FD' },
};

const ENQUIRY_LABELS = {
  buy:             'Buy',
  sell:            'Sell',
  rent:            'Rent',
  mortgage:        'Mortgage',
  consultation:    'Consultation',
  enquiry:         'Enquiry',
  schedule_visit:  'Site Visit',
  hot_property:    'Hot Property',
  partner:         'Partner',
  investor:        'Investor',
  developer:       'Developer',
  ai_enquiry:      'AI Enquiry',
  general_enquiry: 'General Enquiry',
};

// ─────────────────────────────────────────────────────────────
// SMALL BADGE COMPONENTS
// ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const c = STATUS_COLORS[status] || { bg: '#F9FAFB', text: '#6B7280', border: '#E5E7EB' };
  return (
    <span
      style={{ backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}` }}
      className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap"
    >
      {status?.replace(/_/g, ' ') || '—'}
    </span>
  );
};

const ClassBadge = ({ cls }) => {
  const c = CLASS_COLORS[cls] || { bg: '#F9FAFB', text: '#6B7280', border: '#E5E7EB' };
  return (
    <span
      style={{ backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}` }}
      className="px-2.5 py-1 rounded-full text-xs font-bold uppercase"
    >
      {cls || '—'}
    </span>
  );
};

const EnquiryTag = ({ type }) => (
  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 capitalize">
    {ENQUIRY_LABELS[type] || type?.replace(/_/g, ' ') || '—'}
  </span>
);

// ─────────────────────────────────────────────────────────────
// DETAIL DRAWER  (zero masking — agent sees full contact info)
// ─────────────────────────────────────────────────────────────
const DetailDrawer = ({ lead, onClose }) => {
  if (!lead) return null;

  // Always show real values — no is_masked check for agent leads
  const fn    = lead.contact_info?.name?.first_name || '';
  const ln    = lead.contact_info?.name?.last_name  || '';
  const phone = lead.contact_info?.mobile?.number   || '—';
  const cc    = lead.contact_info?.mobile?.country_code || '';
  const email = lead.contact_info?.email?.address   || null;
  const pref  = lead.contact_info?.preferred_contact || '—';

  const req     = lead.requirements || {};
  const locs    = req.location_preferences
    ?.map((l) => (typeof l === 'string' ? l : l.area))
    .filter(Boolean) || [];

  const prop    = lead.source?.listing_id;
  const notes   = lead.notes || [];
  const history = lead.status_history || [];

  // ── Reusable row inside a section ──
  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: '#F5F3FF' }}
      >
        <Icon size={13} style={{ color: PRIMARY }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm text-gray-800 font-semibold mt-0.5 break-words">{value || '—'}</p>
      </div>
    </div>
  );

  const Section = ({ title, icon: Icon, children, accent }) => (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center"
          style={{ background: accent || PRIMARY }}
        >
          <Icon size={12} className="text-white" />
        </div>
        <h4 className="text-xs text-gray-700 uppercase tracking-wider">{title}</h4>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 px-4 divide-y divide-gray-50">
        {children}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 " onClick={onClose} />

      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-lg bg-gray-50 h-full flex flex-col shadow-2xl"
        style={{ animation: 'slideIn 0.25s ease-out' }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
              style={{ background: GRADIENT }}
            >
              {(fn?.[0] || '?').toUpperCase()}
            </div>
            <div>
              <h3 className="text-base  text-gray-900 leading-tight">
                {`${fn} ${ln}`.trim() || 'Unknown Client'}
              </h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <StatusBadge status={lead.status} />
                <ClassBadge cls={lead.classification} />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* ── ID + Type strip ── */}
        <div
          className="px-5 py-3 border-b flex items-center justify-between flex-shrink-0"
          style={{ background: '#F5F3FF', borderColor: '#DDD6FE' }}
        >
          {/* <span className="text-xs font-mono" style={{ color: PRIMARY }}>
            ID: {lead._id?.toString().slice(-10)}
          </span> */}   
          <div className="flex items-center gap-2">
            {lead.enquiry_type && (
              <span
                className="px-2.5 py-1 rounded-md text-xs font-semibold capitalize"
                style={{ background: '#fff', border: '1px solid #DDD6FE', color: PRIMARY }}
              >
                {ENQUIRY_LABELS[lead.enquiry_type] || lead.enquiry_type.replace(/_/g, ' ')}
              </span>
            )}
            <span
              className="px-2.5 py-1 rounded-md text-xs font-bold uppercase"
              style={{ background: '#EDE9FE', color: PRIMARY }}
            >
              Agent Lead
            </span>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-5 py-5">

          {/* 1. Contact Information — full, no masking */}
          <Section title="Contact Information" icon={FiUser}>
            <InfoRow icon={FiUser}          label="Full Name"         value={`${fn} ${ln}`.trim() || 'Unknown'} />
            <InfoRow icon={FiPhone}         label="Phone"             value={`${cc} ${phone}`.trim()} />
            {email && <InfoRow icon={FiMail} label="Email"            value={email} />}
            <InfoRow icon={FiMessageSquare} label="Preferred Contact" value={pref} />
          </Section>

          {/* 2. Requirements */}
          {(req.property_type || req.budget_min || req.budget_max ||
            req.bedrooms != null || locs.length > 0 || req.additional_notes) && (
            <Section title="Requirements" icon={FiHome}>
              {req.property_type && (
                <InfoRow icon={FiHome} label="Property Type" value={req.property_type} />
              )}
              {req.transaction_type && (
                <InfoRow icon={FiTag} label="Transaction" value={req.transaction_type} />
              )}
              {(req.budget_min || req.budget_max) && (
                <InfoRow
                  icon={FiDollarSign}
                  label="Budget"
                  value={
                    req.budget_min && req.budget_max
                      ? `AED ${Number(req.budget_min).toLocaleString()} – AED ${Number(req.budget_max).toLocaleString()}`
                      : req.budget_min
                      ? `From AED ${Number(req.budget_min).toLocaleString()}`
                      : `Up to AED ${Number(req.budget_max).toLocaleString()}`
                  }
                />
              )}
              {req.bedrooms != null && (
                <InfoRow icon={FiHome} label="Bedrooms"
                  value={req.bedrooms === 0 ? 'Studio' : `${req.bedrooms} BR`} />
              )}
              {req.bathrooms != null && (
                <InfoRow icon={FiHome} label="Bathrooms" value={`${req.bathrooms}`} />
              )}
              {(req.area_sqft_min || req.area_sqft_max) && (
                <InfoRow
                  icon={FiHome}
                  label="Area (sqft)"
                  value={
                    req.area_sqft_min && req.area_sqft_max
                      ? `${req.area_sqft_min} – ${req.area_sqft_max}`
                      : req.area_sqft_min
                      ? `From ${req.area_sqft_min}`
                      : `Up to ${req.area_sqft_max}`
                  }
                />
              )}
              {req.furnished && (
                <InfoRow icon={FiHome} label="Furnishing" value={req.furnished} />
              )}
              {req.ready_by_date && (
                <InfoRow
                  icon={FiCalendar}
                  label="Ready By"
                  value={new Date(req.ready_by_date).toLocaleDateString('en-AE', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                />
              )}
              {locs.length > 0 && (
                <InfoRow icon={FiMapPin} label="Preferred Locations" value={locs.join(', ')} />
              )}
              {req.additional_notes && (
                <InfoRow icon={FiMessageSquare} label="Additional Notes" value={req.additional_notes} />
              )}
            </Section>
          )}

          {/* 3. Linked Property */}
          {prop && typeof prop === 'object' && (
            <Section title="Linked Property" icon={FiHome} accent="#059669">
              <InfoRow icon={FiHome}
                label="Property Name"
                value={prop.title || prop.propertyName || '—'} />
              <InfoRow icon={FiMapPin} label="Area" value={prop.area || '—'} />
              {prop.price && (
                <InfoRow
                  icon={FiDollarSign}
                  label="Price"
                  value={`AED ${Number(prop.price).toLocaleString()}`}
                />
              )}
            </Section>
          )}

          {/* 4. Lead Meta */}
          <Section title="Lead Info" icon={FiActivity}>
            <InfoRow
              icon={FiTag}
              label="Enquiry Type"
              value={ENQUIRY_LABELS[lead.enquiry_type] || lead.enquiry_type || '—'}
            />
            <InfoRow
              icon={FiLayers}
              label="Source Channel"
              value={lead.source?.channel?.replace(/_/g, ' ') || '—'}
            />
            <InfoRow
              icon={FiClock}
              label="Created At"
              value={
                lead.createdAt
                  ? new Date(lead.createdAt).toLocaleString('en-AE', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })
                  : '—'
              }
            />
          </Section>

          {/* 5. Classification Reason */}
          {lead.classification_reason && (
            <div
              className="mb-5 rounded-xl px-4 py-3 flex items-start gap-3"
              style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}
            >
              <FiAlertCircle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-0.5">
                  Classification Reason
                </p>
                <p className="text-sm text-amber-800">{lead.classification_reason}</p>
              </div>
            </div>
          )}

          {/* 6. Status History */}
          {history.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center"
                  style={{ background: PRIMARY }}
                >
                  <FiActivity size={12} className="text-white" />
                </div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Status History
                </h4>
              </div>
              <div className="flex flex-col gap-2">
                {[...history].reverse().map((h, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-start gap-3"
                  >
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                      style={{ background: STATUS_COLORS[h.status]?.text || '#9CA3AF' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <StatusBadge status={h.status} />
                        <span className="text-xs text-gray-400">
                          {h.changed_at
                            ? new Date(h.changed_at).toLocaleDateString('en-AE', {
                                day: '2-digit', month: 'short',
                              })
                            : '—'}
                        </span>
                      </div>
                      {h.notes && (
                        <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{h.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. Notes */}
          {notes.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center"
                  style={{ background: PRIMARY }}
                >
                  <FiMessageSquare size={12} className="text-white" />
                </div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Notes</h4>
              </div>
              <div className="flex flex-col gap-2">
                {[...notes].reverse().map((n, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 px-4 py-3">
                    <p className="text-sm text-gray-700 leading-relaxed">{n.text}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-400">{n.author || '—'}</span>
                      {n.author_type && (
                        <span className="px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-500 capitalize">
                          {n.author_type}
                        </span>
                      )}
                      <span className="text-xs text-gray-300 ml-auto">
                        {(n.created_at || n.createdAt)
                          ? new Date(n.created_at || n.createdAt).toLocaleDateString('en-AE', {
                              day: '2-digit', month: 'short', year: 'numeric',
                            })
                          : '—'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// INLINE CUSTOM TABLE  (1-to-1 with GridAgentLead's version)
// ─────────────────────────────────────────────────────────────
const CustomTable = ({
  columns, data = [], totalItems: propTotalItems,
  currentPage: propCurrentPage = 1, itemsPerPage: propItemsPerPage = 10,
  onPageChange, onFilter, loading = false, showSearch = true,
}) => {
  const [filters, setFilters]       = useState({ status: '', search: '' });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const searchTimeout               = useRef(null);
  const [localPage,  setLocalPage]  = useState(1);
  const [localLimit, setLocalLimit] = useState(propItemsPerPage);

  const currentPage  = onPageChange ? propCurrentPage  : localPage;
  const itemsPerPage = onPageChange ? propItemsPerPage : localLimit;

  const filteredData = useMemo(() => {
    let d = [...data];
    if (!onFilter && searchTerm) {
      const t = searchTerm.toLowerCase().trim();
      d = d.filter((item) =>
        columns.some((col) => {
          const v = item[col.key];
          return v ? String(v).toLowerCase().includes(t) : false;
        }) ||
        Object.values(item).some((val) => {
          if (!val || typeof val === 'object') return false;
          return String(val).toLowerCase().includes(t);
        })
      );
    }
    if (sortConfig.key) {
      d.sort((a, b) => {
        const av = String(a[sortConfig.key] || '').toLowerCase();
        const bv = String(b[sortConfig.key] || '').toLowerCase();
        if (av < bv) return sortConfig.direction === 'asc' ? -1 : 1;
        if (av > bv) return sortConfig.direction === 'asc' ?  1 : -1;
        return 0;
      });
    }
    return d;
  }, [data, searchTerm, columns, sortConfig, onFilter]);

  const totalItems    = onPageChange ? propTotalItems : filteredData.length;
  const totalPages    = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startItem     = (currentPage - 1) * itemsPerPage + 1;
  const endItem       = Math.min(currentPage * itemsPerPage, totalItems);
  const paginatedData = onPageChange
    ? filteredData
    : filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleFilterChange = (key, value) => {
    const n = { ...filters, [key]: value === '' ? undefined : value };
    setFilters(n);
    if (onFilter) onFilter(n);
  };

  const handleSearch = (e) => {
    const v = e.target.value;
    setSearchTerm(v);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (v === '') {
      if (onFilter) onFilter({ ...filters, search: '' });
    } else {
      searchTimeout.current = setTimeout(() => {
        if (onFilter) onFilter({ ...filters, search: v });
        else setLocalPage(1);
      }, 600);
    }
  };

  useEffect(() => () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); }, []);

  const requestSort = (key) => {
    const d = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction: d });
  };

  const handleClear = () => {
    setFilters({ status: '', search: '' });
    setSearchTerm('');
    setSortConfig({ key: null, direction: 'asc' });
    if (onFilter) onFilter({ status: '', search: '' });
  };

  const changePage = (page, limit) => {
    if (onPageChange) onPageChange(page, limit);
    else { setLocalPage(page); if (limit) setLocalLimit(limit); }
  };

  const hasFilters =
    Object.values(filters).some((v) => v !== '' && v !== undefined) || searchTerm !== '';

  const renderPages = () => {
    const btns  = [];
    const max   = 5;
    let start   = Math.max(1, currentPage - Math.floor(max / 2));
    let end     = Math.min(totalPages, start + max - 1);
    if (end - start + 1 < max) start = Math.max(1, end - max + 1);

    if (start > 1)
      btns.push(
        <Button key="first" size="small" onClick={() => changePage(1, itemsPerPage)}>
          <FiChevronsLeft />
        </Button>
      );
    btns.push(
      <Button key="prev" size="small"
        onClick={() => changePage(currentPage - 1, itemsPerPage)}
        disabled={currentPage === 1}>
        <FiChevronLeft />
      </Button>
    );
    for (let i = start; i <= end; i++) {
      btns.push(
        <Button key={i} size="small"
          onClick={() => changePage(i, itemsPerPage)}
          type={currentPage === i ? 'primary' : 'default'}
          style={currentPage === i ? { backgroundColor: PRIMARY, borderColor: PRIMARY } : {}}
        >
          {i}
        </Button>
      );
    }
    btns.push(
      <Button key="next" size="small"
        onClick={() => changePage(currentPage + 1, itemsPerPage)}
        disabled={currentPage >= totalPages}>
        <FiChevronRight />
      </Button>
    );
    if (end < totalPages)
      btns.push(
        <Button key="last" size="small" onClick={() => changePage(totalPages, itemsPerPage)}>
          <FiChevronsRight />
        </Button>
      );
    return btns;
  };

  return (
    <div className="bg-white shadow-sm overflow-hidden rounded-xl border border-gray-100">

      {/* ── Search + Filters bar ── */}
      {showSearch && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative flex-grow max-w-md">
              <FiSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={14}
              />
              <Input
                placeholder="Search by name, phone, email…"
                value={searchTerm}
                onChange={handleSearch}
                onPressEnter={() => {
                  if (searchTimeout.current) clearTimeout(searchTimeout.current);
                  if (onFilter) onFilter({ ...filters, search: searchTerm });
                }}
                className="pl-9"
                allowClear
              />
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              {columns.filter((c) => c.filterable).map((col) => (
                <Select
                  key={col.key}
                  value={filters[col.filterKey || col.key] || ''}
                  onChange={(v) => handleFilterChange(col.filterKey || col.key, v)}
                  style={{ width: 165 }}
                  allowClear
                  placeholder={`All ${col.title}`}
                >
                  <Option value="">All {col.title}</Option>
                  {col.filterOptions?.map((o) => (
                    <Option key={o.value} value={o.value}>{o.label}</Option>
                  ))}
                </Select>
              ))}
              {hasFilters && (
                <Button onClick={handleClear} danger ghost size="small">Clear</Button>
              )}
              <Button
                icon={<FiRefreshCw size={13} />}
                onClick={() => changePage(currentPage, itemsPerPage)}
                style={{ borderColor: PRIMARY, color: PRIMARY }}
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead>
            <tr style={{ background: '#FAFAFA' }}>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">
                #
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && requestSort(col.key)}
                  className={`px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap ${
                    col.sortable ? 'cursor-pointer hover:text-purple-700' : ''
                  }`}
                >
                  <span className="flex items-center gap-1">
                    {col.title}
                    {col.sortable && sortConfig.key === col.key && (
                      <span style={{ color: PRIMARY }}>
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full border-2 animate-spin"
                      style={{ borderColor: '#DDD6FE', borderTopColor: PRIMARY }}
                    />
                    <span className="text-sm text-gray-400">Loading leads…</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((item, idx) => (
                <tr
                  key={item._id || idx}
                  className="transition-colors duration-100 hover:bg-purple-50/30"
                >
                  <td className="px-5 py-4 text-xs text-gray-400 font-medium">
                    {startItem + idx}
                  </td>
                  {columns.map((col) => (
                    <td
                      key={`${item._id || idx}-${col.key}`}
                      className="px-5 py-4 text-sm text-gray-800 whitespace-nowrap"
                    >
                      {col.render ? col.render(item[col.key], item) : item[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center"
                      style={{ background: '#F5F3FF' }}
                    >
                      <FiUser size={24} style={{ color: PRIMARY }} />
                    </div>
                    <p className="text-sm font-semibold text-gray-500">No leads found</p>
                    <p className="text-xs text-gray-400">
                      Click <strong>Add New Lead</strong> to create your first lead
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination footer ── */}
      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center px-5 py-3.5 border-t border-gray-100 gap-3 bg-gray-50">
          <p className="text-xs text-gray-500">
            Showing{' '}
            <span className="font-semibold text-gray-700">{startItem}–{endItem}</span>
            {' '}of{' '}
            <span className="font-semibold text-gray-700">{totalItems}</span> leads
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Per page:</span>
            <Select
              value={itemsPerPage}
              onChange={(v) => changePage(1, parseInt(v))}
              style={{ width: 70 }}
              size="small"
            >
              {[10, 25, 50, 100].map((s) => (
                <Option key={s} value={s}>{s}</Option>
              ))}
            </Select>
            <div className="flex gap-1">{renderPages()}</div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
const GridAgentLead = ({ navigate }) => {
  const routerNavigate = useNavigate();
  const goTo = navigate || routerNavigate;

  const [leads,        setLeads]        = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [pagination,   setPagination]   = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [filters,      setFilters]      = useState({});
  const [stats,        setStats]        = useState({ total: 0, new: 0, inProgress: 0, completed: 0 });
  const [selectedLead, setSelectedLead] = useState(null);

  // ── Fetch ────────────────────────────────────────────────────
  const fetchLeads = useCallback(async (page = 1, limit = 10, extraFilters = {}) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.set('page',  page);
      query.set('limit', limit);
      if (extraFilters.search)         query.set('search',         extraFilters.search);
      if (extraFilters.status)         query.set('status',         extraFilters.status);
      if (extraFilters.type)           query.set('type',           extraFilters.type);
      if (extraFilters.classification) query.set('classification', extraFilters.classification);

      const res       = await apiService.get(`/gridlead/agent-only?${query.toString()}`);
      const payload   = res?.data?.success !== undefined ? res.data : res;
      const leadsData = (payload?.data || []).map(sanitizeLeadForAgent);
      const pagData   = payload?.pagination || { page, limit, total: leadsData.length, totalPages: 1 };

      setLeads(leadsData);
      setPagination(pagData);
      setStats({
        total:      pagData.total || 0,
        new:        leadsData.filter((l) => l.status === 'new').length,
        inProgress: leadsData.filter((l) =>
          ['contacted', 'in_discussion', 'site_visit_scheduled', 'offer_made', 'qualified'].includes(l.status)
        ).length,
        completed: leadsData.filter((l) => l.status === 'completed').length,
      });
    } catch {
      message.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handlePageChange = (page, limit) => {
    setPagination((p) => ({ ...p, page, limit }));
    fetchLeads(page, limit, filters);
  };

  const handleFilter = (newFilters) => {
    const merged = { ...filters, ...newFilters };
    setFilters(merged);
    fetchLeads(1, pagination.limit, merged);
  };

  // ── Open drawer — fetch full populated lead ──────────────────
  const handleViewLead = async (row) => {
    setSelectedLead(sanitizeLeadForAgent(row)); // show partial data instantly
    try {
      // const res     = await apiService.get(`/gridlead/${row._id}`);
      const payload = res?.data?.success !== undefined ? res.data : res;
      // accept either payload.data or the payload itself
      setSelectedLead(sanitizeLeadForAgent(payload?.data || payload || row));
    } catch {
      // keep partial row data in drawer — silently fail
    }
  };

  // ── Stat cards ───────────────────────────────────────────────
  const statCards = [
    { label: 'Total Leads', value: stats.total,      color: PRIMARY,   bg: '#F5F3FF', icon: FiUser },
    { label: 'New',         value: stats.new,        color: '#1D4ED8', bg: '#EFF6FF', icon: FiActivity },
    { label: 'In Progress', value: stats.inProgress, color: '#D97706', bg: '#FFFBEB', icon: FiClock },
    { label: 'Completed',   value: stats.completed,  color: '#15803D', bg: '#F0FDF4', icon: FiCheckCircle },
  ];

  // ── Table columns ────────────────────────────────────────────
  const columns = [
    {
      key: 'contact_info',
      title: 'Client',
      sortable: false,
      render: (_, row) => {
        // No masking for agent-created leads
        const fn    = row.contact_info?.name?.first_name || '';
        const ln    = row.contact_info?.name?.last_name  || '';
        const phone = row.contact_info?.mobile?.number   || '—';
        const email = row.contact_info?.email?.address   || null;
        return (
          <div className="flex items-center gap-3 min-w-[160px]">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ background: GRADIENT }}
            >
              {(fn?.[0] || '?').toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm leading-tight">
                {`${fn} ${ln}`.trim() || 'Unknown'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                <FiPhone size={10} /> {phone}
              </p>
              {email && (
                <p className="text-xs text-gray-400 flex items-center gap-1 truncate max-w-[150px]">
                  <FiMail size={10} /> {email}
                </p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'enquiry_type',
      title: 'Type',
      sortable: true,
      filterable: true,
      filterKey: 'type',
      filterOptions: [
        { value: 'buy',             label: 'Buy'             },
        { value: 'rent',            label: 'Rent'            },
        { value: 'sell',            label: 'Sell'            },
        { value: 'consultation',    label: 'Consultation'    },
        { value: 'general_enquiry', label: 'General Enquiry' },
        { value: 'investor',        label: 'Investor'        },
        { value: 'partner',         label: 'Partner'         },
      ],
      render: (val) => <EnquiryTag type={val} />,
    },
    {
      key: 'requirements',
      title: 'Requirements',
      sortable: false,
      render: (_, row) => {
        const req = row.requirements;
        if (!req) return <span className="text-gray-300 text-xs">—</span>;
        const parts = [];
        if (req.property_type)    parts.push(req.property_type);
        if (req.bedrooms != null) parts.push(req.bedrooms === 0 ? 'Studio' : `${req.bedrooms} BR`);
        if (req.budget_max)       parts.push(`AED ${(req.budget_max / 1000).toFixed(0)}k`);
        const locs = req.location_preferences
          ?.map((l) => (typeof l === 'string' ? l : l.area))
          .filter(Boolean);
        if (locs?.length) parts.push(locs[0]);
        if (!parts.length) return <span className="text-gray-300 text-xs">No details</span>;
        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {parts.map((p, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded text-xs border"
                style={{ background: '#F5F3FF', color: PRIMARY, borderColor: '#DDD6FE' }}
              >
                {p}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      filterable: true,
      filterOptions: [
        { value: 'new',                  label: 'New'                  },
        { value: 'contacted',            label: 'Contacted'            },
        { value: 'in_discussion',        label: 'In Discussion'        },
        { value: 'site_visit_scheduled', label: 'Site Visit Scheduled' },
        { value: 'offer_made',           label: 'Offer Made'           },
        { value: 'reserved',             label: 'Reserved'             },
        { value: 'spa_signed',           label: 'SPA Signed'           },
        { value: 'completed',            label: 'Completed'            },
        { value: 'not_proceeding',       label: 'Not Proceeding'       },
      ],
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'classification',
      title: 'Priority',
      sortable: true,
      filterable: true,
      filterOptions: [
        { value: 'hot',  label: '🔥 Hot'  },
        { value: 'warm', label: '🌤 Warm' },
        { value: 'cold', label: '❄️ Cold' },
      ],
      render: (val) => <ClassBadge cls={val} />,
    },
    {
      key: 'source',
      title: 'Property',
      sortable: false,
      render: (_, row) => {
        const prop = row.source?.listing_id;
        if (!prop || typeof prop !== 'object')
          return <span className="text-gray-300 text-xs">— No property</span>;
        return (
          <div className="flex items-center gap-2">
            <FiHome size={12} style={{ color: '#A78BFA', flexShrink: 0 }} />
            <span className="text-xs text-gray-600 truncate max-w-[120px]">
              {prop.title || prop.propertyName || prop._id?.toString().slice(-6)}
            </span>
          </div>
        );
      },
    },
    // {
    //   key: 'createdAt',
    //   title: 'Created',
    //   sortable: true,
    //   render: (val) => (
    //     <div className="flex items-center gap-1.5 text-xs text-gray-400">
    //       <FiClock size={11} />
    //       {val
    //         ? new Date(val).toLocaleDateString('en-AE', {
    //             day: '2-digit', month: 'short', year: 'numeric',
    //           })
    //         : '—'}
    //     </div>
    //   ),
    // },
    {
      key: 'actions',
      title: 'Actions',
      sortable: false,
      render: (_, row) => (
        <Tooltip title="View Full Details">
          <button
            onClick={() => handleViewLead(row)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
            style={{ color: PRIMARY, background: '#F5F3FF', border: '1px solid #DDD6FE' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = PRIMARY;
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F5F3FF';
              e.currentTarget.style.color = PRIMARY;
            }}
          >
            <FiEye size={12} /> View
          </button>
        </Tooltip>
      ),
    },
  ];

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen p-6" style={{ background: '#F8F7FF' }}>

      {/* Detail Drawer */}
      {selectedLead && (
        <DetailDrawer lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Leads</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Manage and track all leads you've created
          </p>
        </div>
        <button
          onClick={() => goTo('/dashboard/agent/CreateAgent-Lead')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 flex-shrink-0"
          style={{ background: GRADIENT }}
        >
          <FiPlus size={15} />
          Add New Lead
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-4"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: s.bg }}
              >
                <Icon size={18} style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                  {s.label}
                </p>
                <p className="text-2xl font-bold mt-0.5 leading-none" style={{ color: s.color }}>
                  {s.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Table ── */}
      <CustomTable
        columns={columns}
        data={leads}
        totalItems={pagination.total}
        currentPage={pagination.page}
        itemsPerPage={pagination.limit}
        onPageChange={handlePageChange}
        onFilter={handleFilter}
        loading={loading}
        showSearch
      />
    </div>
  );
};

export default GridAgentLead;
