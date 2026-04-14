import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../../manageApi/utils/custom.apiservice';
import {
  FileText,
  Loader2,
  AlertCircle,
  Search,
  ArrowRight,
  User,
  Mail,
  Building2,
  BadgeCheck,
  SlidersHorizontal,
  LayoutGrid,
  LayoutList,
} from 'lucide-react';

/* ─── Brand Tokens ─────────────────────────────────────────── */
const C = {
  brand:      '#5C039B',
  brandDark:  '#45027A',
  brandLight: '#F3E8FF',
  brandMid:   '#7C3AED',
  text:       '#0F0A1A',
  textSub:    '#6B6880',
  textMute:   '#A09DB8',
  border:     '#EAE6F2',
  borderHov:  '#C4B5F4',
  surface:    '#FFFFFF',
  bg:         '#F7F4FC',
  success:    '#059669',
  successBg:  '#ECFDF5',
};

/* ─── Fonts (injected once) ─────────────────────────────────── */
const FontLink = () => (
  <link
    href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Sans:wght@400;500&display=swap"
    rel="stylesheet"
  />
);

/* ─── Utility: initials avatar ──────────────────────────────── */
const Avatar = ({ name = '' }) => {
  const parts = name.trim().split(' ');
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : (parts[0]?.[0] || 'L').toUpperCase();

  return (
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${C.brand} 0%, ${C.brandMid} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontFamily: "'Sora', sans-serif",
        fontWeight: 600,
        fontSize: 15,
        color: '#fff',
        letterSpacing: '0.03em',
        userSelect: 'none',
      }}
    >
      {initials}
    </div>
  );
};

/* ─── Pill badge ────────────────────────────────────────────── */
const QualifiedBadge = () => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '3px 10px',
      borderRadius: 20,
      background: C.successBg,
      color: C.success,
      fontSize: 11,
      fontWeight: 600,
      fontFamily: "'Sora', sans-serif",
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
    }}
  >
    <BadgeCheck size={11} strokeWidth={2.5} />
    Qualified
  </span>
);

/* ─── Info row inside card ──────────────────────────────────── */
const InfoRow = ({ icon: Icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    <Icon size={13} color={C.textMute} strokeWidth={1.8} />
    <span style={{ fontSize: 12, color: C.textSub, fontFamily: "'DM Sans', sans-serif" }}>
      {label}:&nbsp;
    </span>
    <span
      style={{
        fontSize: 12,
        color: C.text,
        fontWeight: 500,
        fontFamily: "'DM Sans', sans-serif",
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: 200,
      }}
    >
      {value}
    </span>
  </div>
);

/* ─── Lead Card ─────────────────────────────────────────────── */
const LeadCard = ({ lead, onContinue, compact }) => {
  const [hov, setHov] = useState(false);
  const name  = lead.customerInfo?.fullName || '—';
  const email = lead.customerInfo?.email || '—';
  const val   = lead.propertyDetails?.propertyValue;
  const aed   = val ? `AED ${Number(val).toLocaleString('en-AE')}` : '—';

  if (compact) {
    /* ── List / compact row ── */
    return (
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: C.surface,
          border: `1px solid ${hov ? C.borderHov : C.border}`,
          borderRadius: 12,
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          transition: 'border-color 0.18s, box-shadow 0.18s',
          boxShadow: hov ? '0 4px 18px rgba(92,3,155,0.08)' : 'none',
          cursor: 'default',
        }}
      >
        <Avatar name={name} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.text, fontFamily: "'Sora', sans-serif" }}>
            {name}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: C.textSub, fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {email}
          </p>
        </div>
        <div style={{ display: 'none', '@media(minWidth:600px)': { display: 'block' } }}>
          <QualifiedBadge />
        </div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.brand, fontFamily: "'Sora', sans-serif", whiteSpace: 'nowrap', minWidth: 100, textAlign: 'right' }}>
          {aed}
        </p>
        <ContinueBtn onClick={() => onContinue(lead._id)} small />
      </div>
    );
  }

  /* ── Grid card ── */
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: C.surface,
        border: `1px solid ${hov ? C.borderHov : C.border}`,
        borderRadius: 16,
        padding: '20px 20px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.18s',
        boxShadow: hov ? '0 8px 28px rgba(92,3,155,0.10)' : '0 1px 4px rgba(0,0,0,0.04)',
        transform: hov ? 'translateY(-2px)' : 'none',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* top accent stripe */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${C.brand}, ${C.brandMid})`,
          borderRadius: '16px 16px 0 0',
          opacity: hov ? 1 : 0,
          transition: 'opacity 0.2s',
        }}
      />

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar name={name} />
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.text, fontFamily: "'Sora', sans-serif", lineHeight: 1.3 }}>
              {name}
            </p>
            <QualifiedBadge />
          </div>
        </div>
        <FileText size={16} color={C.textMute} strokeWidth={1.6} style={{ marginTop: 2 }} />
      </div>

      {/* Info rows */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          padding: '10px 12px',
          background: C.bg,
          borderRadius: 10,
        }}
      >
        <InfoRow icon={Mail}      label="Email"    value={email} />
        <InfoRow icon={Building2} label="Property" value={aed}   />
      </div>

      {/* Continue button */}
      <ContinueBtn onClick={() => onContinue(lead._id)} />
    </div>
  );
};

/* ─── Continue Button ────────────────────────────────────────── */
const ContinueBtn = ({ onClick, small }) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: small ? '7px 14px' : '10px 0',
        width: small ? 'auto' : '100%',
        background: hov ? C.brandDark : C.brand,
        border: 'none',
        borderRadius: 10,
        color: '#fff',
        fontSize: small ? 12 : 13,
        fontWeight: 600,
        fontFamily: "'Sora', sans-serif",
        cursor: 'pointer',
        letterSpacing: '0.01em',
        transition: 'background 0.15s, transform 0.12s',
        transform: hov ? 'scale(1.01)' : 'scale(1)',
        flexShrink: 0,
      }}
    >
      {!small && 'Continue'}
      <ArrowRight size={small ? 13 : 15} strokeWidth={2.2} />
    </button>
  );
};

/* ─── Empty state ───────────────────────────────────────────── */
const EmptyState = ({ filtered }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '64px 24px',
      gap: 12,
    }}
  >
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: 16,
        background: C.brandLight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <User size={28} color={C.brand} strokeWidth={1.5} />
    </div>
    <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.text, fontFamily: "'Sora', sans-serif" }}>
      {filtered ? 'No results found' : 'No qualified leads yet'}
    </p>
    <p style={{ margin: 0, fontSize: 13, color: C.textSub, fontFamily: "'DM Sans', sans-serif", textAlign: 'center', maxWidth: 280 }}>
      {filtered
        ? 'Try adjusting your search query.'
        : 'Qualified leads will appear here once they are ready for proposals.'}
    </p>
  </div>
);

/* ─── Main Page ─────────────────────────────────────────────── */
const CreateProposal = () => {
  const [leads,   setLeads]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [search,  setSearch]  = useState('');
  const [view,    setView]    = useState('grid'); // 'grid' | 'list'
  const navigate = useNavigate();

  useEffect(() => { fetchQualifiedLeads(); }, []);

  const fetchQualifiedLeads = async () => {
    try {
      setLoading(true);
      const res = await apiService.get('/vault/lead/partner/get', {
        params: { status: 'Qualified', page: 1, limit: 100 },
      });
      let data = res?.data?.leads || res?.data?.data || res?.data || [];
      if (!Array.isArray(data) && data?.docs) data = data.docs;
      setLeads(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load qualified leads. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = leads.filter(lead => {
    const q    = search.toLowerCase();
    const name = lead.customerInfo?.fullName?.toLowerCase() || '';
    const mail = lead.customerInfo?.email?.toLowerCase()    || '';
    return name.includes(q) || mail.includes(q);
  });

  const handleContinue = (id) =>
    navigate(`/dashboard/xotovaultpartner/proposals/create/${id}`);

  /* ── Loading ── */
  if (loading) {
    return (
      <>
        <FontLink />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            gap: 14,
          }}
        >
          <Loader2
            size={32}
            strokeWidth={2}
            style={{ color: C.brand, animation: 'spin 1s linear infinite' }}
          />
          <p style={{ margin: 0, fontSize: 13, color: C.textSub, fontFamily: "'DM Sans', sans-serif" }}>
            Loading qualified leads…
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <>
        <FontLink />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 12 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertCircle size={26} color="#EF4444" strokeWidth={1.8} />
          </div>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.text, fontFamily: "'Sora', sans-serif" }}>Something went wrong</p>
          <p style={{ margin: 0, fontSize: 13, color: C.textSub, fontFamily: "'DM Sans', sans-serif" }}>{error}</p>
          <button
            onClick={fetchQualifiedLeads}
            style={{ marginTop: 4, padding: '9px 20px', background: C.brand, border: 'none', borderRadius: 9, color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: "'Sora', sans-serif", cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      </>
    );
  }

  /* ── Main ── */
  return (
    <>
      <FontLink />
      <div style={{ background: C.bg, minHeight: '100vh', padding: '32px 28px', fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── Page header ── */}
        <div style={{ marginBottom: 28 }}>
          
          <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 700, color: C.text, fontFamily: "'Sora', sans-serif", lineHeight: 1.2 }}>
            Create New Proposal
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: C.textSub }}>
            Select a qualified lead below to begin drafting their proposal.
          </p>
        </div>

        {/* ── Toolbar: search + view toggle + count ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 20,
            flexWrap: 'wrap',
          }}
        >
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 420 }}>
            <Search
              size={15}
              strokeWidth={2}
              style={{
                position: 'absolute',
                left: 13,
                top: '50%',
                transform: 'translateY(-50%)',
                color: C.textMute,
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 38px',
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                fontSize: 13,
                fontFamily: "'DM Sans', sans-serif",
                color: C.text,
                background: C.surface,
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => (e.target.style.borderColor = C.brand)}
              onBlur={(e)  => (e.target.style.borderColor = C.border)}
            />
          </div>
</div>

        {/* ── Cards / List ── */}
        {filtered.length === 0 ? (
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
            }}
          >
            <EmptyState filtered={search.length > 0} />
          </div>
        ) : view === 'grid' ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 16,
            }}
          >
            {filtered.map((lead) => (
              <LeadCard key={lead._id} lead={lead} onContinue={handleContinue} compact={false} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((lead) => (
              <LeadCard key={lead._id} lead={lead} onContinue={handleContinue} compact={true} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default CreateProposal;