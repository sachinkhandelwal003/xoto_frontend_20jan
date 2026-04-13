import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../../manageApi/utils/custom.apiservice';
import CustomTable from '../../CMS/pages/custom/CustomTable';
import {
  FileText, TrendingUp, Clock, CheckCircle2, Eye, Upload,
} from 'lucide-react';

/* ── Fonts ──────────────────────────────────────────────────────────────────── */
const FontInjector = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
    .vl-root, .vl-root * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
    .vl-view-btn:hover  { background: #eff6ff !important; color: #2563eb !important; border-color: #bfdbfe !important; }
    .vl-doc-btn:hover   { background: #fefce8 !important; color: #ca8a04 !important; border-color: #fde047 !important; }
    @keyframes vl-spin  { to { transform: rotate(360deg); } }
  `}</style>
);

/* ── Status Badge ───────────────────────────────────────────────────────────── */
const STATUS_MAP = {
  'New':                      { bg: '#eff6ff', color: '#1d4ed8', dot: '#3b82f6', border: '#bfdbfe' },
  'Contacted':                { bg: '#fffbeb', color: '#92400e', dot: '#f59e0b', border: '#fde68a' },
  'Qualified':                { bg: '#f0fdf4', color: '#166534', dot: '#22c55e', border: '#bbf7d0' },
  'Collecting Documentation': { bg: '#faf5ff', color: '#581c87', dot: '#a855f7', border: '#e9d5ff' },
  'Disbursed':                { bg: '#f0f9ff', color: '#075985', dot: '#0ea5e9', border: '#bae6fd' },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] || { bg: '#f8fafc', color: '#475569', dot: '#94a3b8', border: '#e2e8f0' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 999, whiteSpace: 'nowrap', background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontSize: 11.5, fontWeight: 600 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {status || 'Unknown'}
    </span>
  );
};

/* ── Stat Card ──────────────────────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div style={{ background: '#fff', borderRadius: 14, padding: '16px 20px', border: '1px solid #e8edf5', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
    <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: `${accent}14`, border: `1.5px solid ${accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={18} style={{ color: accent }} />
    </div>
    <div>
      <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>{label}</p>
      <p style={{ margin: '3px 0 0', fontSize: 22, fontWeight: 700, color: '#0f172a', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '-0.02em', lineHeight: 1 }}>{value ?? 0}</p>
    </div>
  </div>
);

/* ── Helper: does this lead require docs? ──────────────────────────────────── */
const needsDocs = (lead) =>
  lead.referralType && lead.referralType !== 'Referral Only';

/* ── Main Component ─────────────────────────────────────────────────────────── */
const VaultLeads = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['vault-leads', page],
    queryFn: () => apiService.get('/vault/lead/my-leads', { params: { page, limit } }),
    keepPreviousData: true,
  });

  // API structure: { success, data: [...], total, pagination: { currentPage, limit, totalPages } }
  const leads      = Array.isArray(data?.data) ? data.data : [];
  const totalLeads = data?.total || 0;
  const pagination = data?.pagination || { currentPage: page, limit, totalPages: 1 };

  const fmtAED  = (n) => n ? Number(n).toLocaleString('en-AE', { maximumFractionDigits: 0 }) : '—';
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  // counts from API stats if available, otherwise fall back to current page leads
  const statusCounts = data?.statusCounts || data?.counts || null;

  const counts = statusCounts || leads.reduce((acc, l) => {
    acc[l.currentStatus] = (acc[l.currentStatus] || 0) + 1;
    return acc;
  }, {});

  const columns = [
    {
      title: 'Customer',
      key: 'customer',
      render: (_, row) => (
        <div>
          <p style={{ margin: 0, fontWeight: 600, color: '#0f172a', fontSize: 13 }}>{row.customerInfo?.fullName || '—'}</p>
          <p style={{ margin: '2px 0 0', fontSize: 11.5, color: '#94a3b8' }}>{row.customerInfo?.email || ''}</p>
        </div>
      ),
    },
    {
      title: 'Property Value',
      key: 'propertyValue',
      render: (_, row) => (
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: '#1e293b', fontSize: 13, display: 'block' }}>{fmtAED(row.propertyDetails?.propertyValue)}</span>
          {row.propertyDetails?.propertyValue && <span style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginTop: 1 }}>AED</span>}
        </div>
      ),
    },
    {
      title: 'Loan Amount',
      key: 'loanAmount',
      render: (_, row) => (
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: '#1e293b', fontSize: 13, display: 'block' }}>{fmtAED(row.propertyDetails?.loanAmountRequired)}</span>
          {row.propertyDetails?.loanAmountRequired && <span style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginTop: 1 }}>AED</span>}
        </div>
      ),
    },
    {
      title: 'Referral',
      key: 'referralType',
      render: (_, row) => row.referralType ? (
        <span style={{
          display: 'inline-block', fontSize: 11.5, fontWeight: 600, padding: '3px 10px', borderRadius: 999, whiteSpace: 'nowrap',
          ...(needsDocs(row)
            ? { background: '#fefce8', color: '#854d0e', border: '1px solid #fde047' }
            : { background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }),
        }}>
          {row.referralType}
        </span>
      ) : <span style={{ color: '#cbd5e1' }}>—</span>,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, row) => <StatusBadge status={row.currentStatus} />,
    },
    {
      title: 'Created',
      key: 'createdAt',
      render: (_, row) => (
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>
          {fmtDate(row.createdAt)}
        </span>
      ),
    },
    {
      title: '',
      key: 'actions',
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
          {needsDocs(row) && (
            <button
              className="vl-doc-btn"
              onClick={() => navigate(`${row._id}/documents`)}
              title="Upload Documents"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '5px 10px', borderRadius: 8,
                border: '1px solid #fde047', background: '#fefce8',
                color: '#ca8a04', fontSize: 11.5, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.14s', whiteSpace: 'nowrap',
              }}
            >
              <Upload size={12} /> Upload Docs
            </button>
          )}
          <button
            className="vl-view-btn"
            onClick={() => navigate(row._id)}
            title="View Details"
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: '1px solid #e2e8f0', background: '#fff', color: '#94a3b8',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.14s',
            }}
          >
            <Eye size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="vl-root" style={{ padding: '32px 36px', minHeight: '100vh', background: '#f4f7fb' }}>
      <FontInjector />

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>Track Leads</h1>
          <p style={{ margin: '5px 0 0', fontSize: 13.5, color: '#64748b' }}>Monitor and manage all your mortgage referrals</p>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        <StatCard icon={FileText}     label="Total Leads" value={totalLeads}                                                                             accent="#2563eb" />
        <StatCard icon={TrendingUp}   label="Qualified"   value={counts['Qualified'] || 0}                                                               accent="#16a34a" />
        <StatCard icon={Clock}        label="In Progress" value={(counts['Contacted'] || 0) + (counts['Collecting Documentation'] || 0)}                 accent="#9333ea" />
        <StatCard icon={CheckCircle2} label="Disbursed"   value={counts['Disbursed'] || 0}                                                               accent="#0ea5e9" />
      </div>

      {/* ── Table ── */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8edf5', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)' }}>
        <CustomTable
          columns={columns}
          data={leads}
          loading={isLoading}
          error={error}
          pagination={{
            current: pagination.currentPage,
            pageSize: pagination.limit,
            total: totalLeads,
            totalPages: pagination.totalPages,
            onChange: (p) => setPage(p),
          }}
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={(p) => setPage(p)}
          rowKey="_id"
          emptyText="No leads found."
        />
      </div>
    </div>
  );
};

export default VaultLeads;