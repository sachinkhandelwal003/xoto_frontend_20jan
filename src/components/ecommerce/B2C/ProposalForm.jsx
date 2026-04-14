// src/ecommerce/B2C/ProposalForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../../manageApi/utils/custom.apiservice';
import {
  ArrowLeft, Loader2, Save, Send, User, Building2, DollarSign,
  Percent, Calendar, FileText, ChevronRight, CheckCircle, X,
  Calculator, TrendingUp, CreditCard, Shield, AlertCircle, Info,
} from 'lucide-react';

/* ══════════════════════════════
   XOTO THEME
══════════════════════════════ */
const T = {
  primary:       '#5C039B',
  primaryLight:  '#7C3AED',
  primaryBg:     '#FAF5FF',
  primaryBorder: '#E9D5FF',
  bg:            '#F4F1FA',
  card:          '#FFFFFF',
  border:        '#EDE9F4',
  text:          '#1E0B3B',
  textSub:       '#6B5B87',
  textMuted:     '#A89BC2',
  success:       '#059669',
  successBg:     '#ECFDF5',
  successBorder: '#A7F3D0',
  error:         '#DC2626',
  errorBg:       '#FEF2F2',
  warning:       '#D97706',
  warningBg:     '#FFF7ED',
};

/* ══ GLOBAL STYLES ══ */
const GStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    .pf-root, .pf-root * { box-sizing: border-box; font-family: 'Inter', sans-serif; }

    @keyframes pf-spin  { to { transform: rotate(360deg); } }
    @keyframes pf-slide { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes pf-fade  { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pf-pulse { 0%,100%{opacity:1} 50%{opacity:.5} }

    .pf-fade  { animation: pf-fade  0.3s ease both; }
    .pf-slide { animation: pf-slide 0.35s cubic-bezier(0.16,1,0.3,1) both; }

    .pf-input:focus {
      outline: none;
      border-color: ${T.primary} !important;
      box-shadow: 0 0 0 3px rgba(92,3,155,0.12) !important;
    }
    .pf-textarea:focus {
      outline: none;
      border-color: ${T.primary} !important;
      box-shadow: 0 0 0 3px rgba(92,3,155,0.12) !important;
    }

    .bank-card:hover {
      border-color: ${T.primaryBorder} !important;
      box-shadow: 0 4px 20px rgba(92,3,155,0.10) !important;
      transform: translateY(-1px);
    }
    .bank-card { transition: all 0.2s ease; }

    .pf-back:hover {
      background: ${T.primaryBg} !important;
      color: ${T.primary} !important;
      border-color: ${T.primaryBorder} !important;
    }

    .sum-row:hover { background: ${T.primaryBg} !important; }
    .sum-row { transition: background 0.15s; border-radius: 8px; }

    /* Layout */
    .pf-layout      { display: grid; grid-template-columns: 1fr 420px; gap: 20px; align-items: start; }
    .pf-form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .pf-form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }

    @media (max-width: 1100px) {
      .pf-layout { grid-template-columns: 1fr !important; }
    }
    @media (max-width: 640px) {
      .pf-form-grid-2 { grid-template-columns: 1fr !important; }
      .pf-form-grid-3 { grid-template-columns: 1fr !important; }
      .pf-root { padding: 14px !important; }
      .pf-actions { flex-direction: column !important; }
      .pf-actions button { width: 100% !important; justify-content: center !important; }
    }
  `}</style>
);

/* ══ HELPERS ══ */
const fmtAED = (n) => n ? `AED ${Number(n).toLocaleString('en-AE', { maximumFractionDigits: 0 })}` : '—';
const fmtPct = (n) => n ? `${Number(n).toFixed(2)}%` : '—';
const calcEMI = (principal, annualRate, years) => {
  const P = Number(principal);
  const r = Number(annualRate) / 100 / 12;
  const n = Number(years) * 12;
  if (!P || !r || !n) return 0;
  return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
};

/* ── Label ── */
const Label = ({ children, required }) => (
  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.textSub, marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
    {children}{required && <span style={{ color: T.error, marginLeft: 3 }}>*</span>}
  </label>
);

/* ── Input ── */
const Input = ({ icon: Icon, type = 'text', suffix, ...props }) => (
  <div style={{ position: 'relative' }}>
    {Icon && (
      <Icon size={14} color={T.textMuted} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
    )}
    <input
      type={type}
      className="pf-input"
      {...props}
      style={{
        width: '100%',
        padding: Icon ? '10px 12px 10px 34px' : '10px 12px',
        paddingRight: suffix ? 48 : 12,
        border: `1.5px solid ${T.border}`,
        borderRadius: 10,
        fontSize: 13,
        color: T.text,
        background: T.primaryBg,
        transition: 'all 0.15s',
        ...props.style,
      }}
    />
    {suffix && (
      <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: T.textMuted, fontWeight: 600, pointerEvents: 'none' }}>
        {suffix}
      </span>
    )}
  </div>
);

/* ── Section Card ── */
const SCard = ({ title, icon: Icon, accent = T.primary, children, style = {} }) => (
  <div className="pf-fade" style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: '20px 22px', boxShadow: '0 1px 6px rgba(92,3,155,0.04)', ...style }}>
    {title && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, paddingBottom: 14, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: `${accent}18`, border: `1.5px solid ${accent}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={16} color={accent} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{title}</span>
      </div>
    )}
    {children}
  </div>
);

/* ── Info Row ── */
const IRow = ({ label, value, highlight, last }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: last ? 'none' : `1px solid ${T.border}` }}>
    <span style={{ fontSize: 12, color: T.textMuted, fontWeight: 500 }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: highlight ? 700 : 500, color: highlight ? T.primary : T.text }}>{value || '—'}</span>
  </div>
);

/* ── Summary Row ── */
const SumRow = ({ label, value, sub, accent, big }) => (
  <div className="sum-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 10px' }}>
    <div>
      <p style={{ margin: 0, fontSize: big ? 13 : 12, fontWeight: big ? 600 : 500, color: T.textSub }}>{label}</p>
      {sub && <p style={{ margin: '1px 0 0', fontSize: 11, color: T.textMuted }}>{sub}</p>}
    </div>
    <span style={{ fontSize: big ? 16 : 13, fontWeight: big ? 700 : 600, color: accent || T.text }}>{value}</span>
  </div>
);

/* ══════════════════════════════
   MAIN COMPONENT
══════════════════════════════ */
const ProposalForm = () => {
  const { leadId } = useParams();
  const navigate   = useNavigate();

  const [lead,          setLead]          = useState(null);
  const [bankProducts,  setBankProducts]  = useState([]);
  const [selectedBank,  setSelectedBank]  = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [submitting,    setSubmitting]    = useState(false);
  const [submitMsg,     setSubmitMsg]     = useState(null);
  const [showBankPanel, setShowBankPanel] = useState(false);

  const [form, setForm] = useState({
    loanAmount:         '',
    interestRate:       '',
    tenureYears:        25,
    processingFee:      '',
    insuranceAmount:    '',
    monthlyInstallment: '',
    coverNote:          '',
  });

  /* ── Fetch lead (filter from list by id) + bank products ── */
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);

        // Fetch lead list and find by leadId
        const leadRes = await apiService.get(`/vault/lead/partner/get?page=1&limit=100`);
        const data    = leadRes?.data || leadRes;
        const list    =
          Array.isArray(data)        ? data :
          Array.isArray(data?.leads) ? data.leads :
          Array.isArray(data?.data)  ? data.data :
          Array.isArray(data?.docs)  ? data.docs : [];

        const found = list.find(l => (l._id || l.id) === leadId);
        setLead(found || null);

        if (found) {
          setForm(prev => ({
            ...prev,
            loanAmount:  found.propertyDetails?.loanAmountRequired || '',
            tenureYears: found.loanRequirements?.preferredTenureYears || 25,
          }));
        }

        // Fetch bank products — silently ignore if fails
        try {
          const bankRes = await apiService.get('/bank/products/get-all-bank-products?page=1&limit=10');

          // Log raw response to see exact field names in console
          console.log('Bank API raw response:', JSON.stringify(bankRes?.data, null, 2));

          const raw =
            Array.isArray(bankRes?.data)                     ? bankRes.data :
            Array.isArray(bankRes?.data?.data)               ? bankRes.data.data :
            Array.isArray(bankRes?.data?.data?.bankProducts) ? bankRes.data.data.bankProducts :
            Array.isArray(bankRes?.data?.bankProducts)       ? bankRes.data.bankProducts :
            Array.isArray(bankRes?.data?.products)           ? bankRes.data.products :
            Array.isArray(bankRes?.data?.result)             ? bankRes.data.result :
            Array.isArray(bankRes?.data?.docs)               ? bankRes.data.docs : [];

          // Normalize: map nested API structure to flat UI fields
          const normalize = (b) => ({
            ...b,
            bankName:      b.bankInfo?.bankName      || b.bankName      || b.name         || '',
            productName:   b.offerSummary?.title     || b.productName   || b.product      || 'Mortgage',
            interestRate:  b.offerSummary?.initialRate ?? b.interestRate ?? b.rate ?? '',
            maxLtv:        b.eligibility?.maxLTV      ?? b.loanDetails?.maxLoanToValue ?? b.maxLtv ?? '',
            minLoanAmount: b.eligibility?.minLoanAmount ?? b.minLoanAmount ?? '',
            productType:   b.offerSummary?.productType || '',
            logo:          b.bankInfo?.logo            || '',
            features:      Array.isArray(b.features?.keyFeatures)  ? b.features.keyFeatures :
                           Array.isArray(b.features?.benefits)     ? b.features.benefits :
                           Array.isArray(b.features)               ? b.features :
                           Array.isArray(b.snapshotFeatures)       ? b.snapshotFeatures : [],
          });

          const banks = raw.map(normalize);
          console.log('Normalized banks[0]:', banks[0]);
          setBankProducts(banks);
        } catch (e) {
          console.error('Bank fetch error:', e);
          setBankProducts([]);
        }

      } catch (err) {
        console.error('Init error:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [leadId]);

  /* ── Auto-fill interest rate when bank selected ── */
  useEffect(() => {
    if (selectedBank) {
      setForm(prev => ({
        ...prev,
        interestRate: selectedBank.interestRate || selectedBank.rate || prev.interestRate,
      }));
    }
  }, [selectedBank]);

  /* ── Live EMI calculation ── */
  const emi           = calcEMI(form.loanAmount, form.interestRate, form.tenureYears);
  const totalPayable  = emi * Number(form.tenureYears) * 12;
  const totalInterest = totalPayable - Number(form.loanAmount || 0);
  const ltv = lead?.propertyDetails?.propertyValue && form.loanAmount
    ? ((form.loanAmount / lead.propertyDetails.propertyValue) * 100).toFixed(1)
    : null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  /* ── Generate cover note ── */
  const generateCoverNote = () => {
    const name   = lead?.customerInfo?.fullName || 'Valued Customer';
    const bank   = selectedBank?.bankName || selectedBank?.name || 'our banking partner';
    const propVal = fmtAED(lead?.propertyDetails?.propertyValue);
    const salary  = fmtAED(lead?.customerInfo?.monthlySalary);
    setForm(prev => ({
      ...prev,
      coverNote: `Dear ${name},\n\nThank you for choosing Xoto Vault. Based on your requirements (property value ${propVal}, monthly salary ${salary}), we have found the best mortgage option for you from ${bank}.\n\nPlease review the attached proposal and let us know if you have any questions.\n\nBest regards,\nXoto Vault Team`,
    }));
  };

  /* ── Submit ── */
  const handleSubmit = async (status = 'draft') => {
    if (!form.loanAmount || !form.interestRate) {
      setSubmitMsg({ type: 'error', text: 'Loan amount and interest rate are required' });
      setTimeout(() => setSubmitMsg(null), 4000);
      return;
    }
    try {
      setSubmitting(true);
      setSubmitMsg(null);
      const payload = {
        leadId,
        selectedBankProducts: selectedBank ? [{
          bankProductId:      selectedBank._id || selectedBank.id,
          snapshotRate:       Number(form.interestRate),
          snapshotFeatures:   Array.isArray(selectedBank.features) ? selectedBank.features : Array.isArray(selectedBank.snapshotFeatures) ? selectedBank.snapshotFeatures : [],
          snapshotMaxLtv:     selectedBank.maxLtv   || selectedBank.snapshotMaxLtv   || 80,
        }] : [],
        coverNote:          form.coverNote,
        loanAmount:         Number(form.loanAmount),
        interestRate:       Number(form.interestRate),
        tenureYears:        Number(form.tenureYears),
        processingFee:      Number(form.processingFee)      || 0,
        insuranceAmount:    Number(form.insuranceAmount)    || 0,
        monthlyInstallment: emi ? Math.round(emi) : Number(form.monthlyInstallment) || 0,
        status,
      };
      await apiService.post('/vault/lead/proposals', payload);
      setSubmitMsg({ type: 'success', text: `Proposal ${status === 'draft' ? 'saved as draft' : 'sent'} successfully!` });
      setTimeout(() => navigate(-1), 1800);
    } catch (err) {
      setSubmitMsg({ type: 'error', text: err?.response?.data?.message || 'Failed to save proposal' });
    } finally {
      setSubmitting(false);
    }
  };

  /* ══ LOADING ══ */
  if (loading) return (
    <div className="pf-root" style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <GStyle />
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 42, height: 42, borderRadius: '50%', border: `3px solid ${T.primaryBorder}`, borderTopColor: T.primary, animation: 'pf-spin 0.7s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ fontSize: 13, color: T.textMuted, fontWeight: 500 }}>Loading proposal form…</p>
      </div>
    </div>
  );

  const ci = lead?.customerInfo    || {};
  const pd = lead?.propertyDetails || {};
  const lr = lead?.loanRequirements || {};

  return (
    <div className="pf-root" style={{ minHeight: '100vh', background: T.bg, padding: '24px 28px' }}>
      <GStyle />

      {/* ══ HEADER ══ */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="pf-back" onClick={() => navigate(-1)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, fontWeight: 600, color: T.textSub, cursor: 'pointer', transition: 'all 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <ArrowLeft size={15} /> Back
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: T.text }}>Create Proposal</h1>
            {ci.fullName
              ? <p style={{ margin: '2px 0 0', fontSize: 12, color: T.textMuted }}>For: <strong style={{ color: T.primary }}>{ci.fullName}</strong></p>
              : <p style={{ margin: '2px 0 0', fontSize: 12, color: T.error }}>Lead not found — check lead ID</p>
            }
          </div>
        </div>

        {/* Feedback toast */}
        {submitMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, background: submitMsg.type === 'success' ? T.successBg : T.errorBg, border: `1px solid ${submitMsg.type === 'success' ? T.successBorder : '#FECACA'}` }}>
            {submitMsg.type === 'success' ? <CheckCircle size={15} color={T.success} /> : <AlertCircle size={15} color={T.error} />}
            <span style={{ fontSize: 13, fontWeight: 500, color: submitMsg.type === 'success' ? '#065F46' : '#991B1B' }}>{submitMsg.text}</span>
          </div>
        )}
      </div>

      {/* ══ MAIN LAYOUT ══ */}
      <div className="pf-layout">

        {/* ════ LEFT COLUMN ════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Lead Info */}
          {lead ? (
            <SCard title="Lead Information" icon={User} accent="#2563EB">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                <div style={{ paddingRight: 20, borderRight: `1px solid ${T.border}` }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Customer</p>
                  <IRow label="Name"     value={ci.fullName} />
                  <IRow label="Email"    value={ci.email} />
                  <IRow label="Mobile"   value={ci.mobileNumber} />
                  <IRow label="Employer" value={ci.employer} />
                  <IRow label="Salary"   value={fmtAED(ci.monthlySalary)} highlight last />
                </div>
                <div style={{ paddingLeft: 20 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Property & Loan</p>
                  <IRow label="Property Value" value={fmtAED(pd.propertyValue)} />
                  <IRow label="Loan Required"  value={fmtAED(pd.loanAmountRequired)} highlight />
                  <IRow label="Down Payment"   value={fmtAED(pd.downPaymentAmount)} />
                  <IRow label="Tenure"         value={lr.preferredTenureYears ? `${lr.preferredTenureYears} Yrs` : '—'} />
                  <IRow label="Rate Type"      value={lr.preferredInterestRateType} last />
                </div>
              </div>
            </SCard>
          ) : (
            <div style={{ background: T.warningBg, border: `1px solid #FED7AA`, borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Info size={18} color={T.warning} />
              <p style={{ margin: 0, fontSize: 13, color: T.warning, fontWeight: 500 }}>Lead details could not be loaded. You can still create the proposal manually.</p>
            </div>
          )}

          {/* ── Bank Product Selection (exactly File 1 style) ── */}
          <SCard title="Bank Product" icon={Building2} accent="#D97706">
            {selectedBank ? (
              /* Selected bank display */
              <div style={{ background: T.primaryBg, border: `1.5px solid ${T.primaryBorder}`, borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building2 size={17} color="#fff" />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.text }}>{selectedBank.bankName || selectedBank.name || 'Bank'}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: T.textMuted }}>{selectedBank.productName || selectedBank.product || 'Mortgage Product'}</p>
                    </div>
                  </div>
                  <button onClick={() => { setSelectedBank(null); setShowBankPanel(false); }}
                    style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${T.errorBg}`, background: T.errorBg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <X size={13} color={T.error} />
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  {[
                    { label: 'Interest Rate', value: fmtPct(selectedBank.interestRate || selectedBank.rate) },
                    { label: 'Max LTV',       value: selectedBank.maxLtv ? `${selectedBank.maxLtv}%` : '—' },
                    { label: 'Min Amount',    value: fmtAED(selectedBank.minLoanAmount) },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background: T.card, borderRadius: 8, padding: '10px 12px', border: `1px solid ${T.border}`, textAlign: 'center' }}>
                      <p style={{ margin: 0, fontSize: 10, color: T.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                      <p style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 700, color: T.primary }}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Features */}
                {(Array.isArray(selectedBank.features) ? selectedBank.features : Array.isArray(selectedBank.snapshotFeatures) ? selectedBank.snapshotFeatures : []).length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Key Features</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {(Array.isArray(selectedBank.features) ? selectedBank.features : Array.isArray(selectedBank.snapshotFeatures) ? selectedBank.snapshotFeatures : []).map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <CheckCircle size={12} color={T.success} />
                          <span style={{ fontSize: 12, color: T.textSub }}>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={() => setShowBankPanel(true)}
                  style={{ marginTop: 12, width: '100%', padding: '8px', background: 'none', border: `1px dashed ${T.primaryBorder}`, borderRadius: 8, fontSize: 12, fontWeight: 600, color: T.primary, cursor: 'pointer' }}>
                  Change Bank Product
                </button>
              </div>
            ) : (
              /* No bank selected */
              <button onClick={() => setShowBankPanel(true)}
                style={{ width: '100%', padding: '20px 16px', background: T.primaryBg, border: `1.5px dashed ${T.primaryBorder}`, borderRadius: 12, cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
                <Building2 size={28} color={T.primaryBorder} style={{ margin: '0 auto 10px' }} />
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: T.primary }}>Select Bank Product</p>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: T.textMuted }}>Choose a bank to auto-fill rates</p>
              </button>
            )}
          </SCard>

          {/* Proposal Form */}
          <SCard title="Proposal Details" icon={FileText} accent={T.primary}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              <div>
                <Label required>Loan Amount</Label>
                <Input icon={DollarSign} type="number" name="loanAmount" value={form.loanAmount} onChange={handleChange} suffix="AED" placeholder="0" />
              </div>

              <div className="pf-form-grid-2">
                <div>
                  <Label required>Interest Rate</Label>
                  <Input icon={Percent} type="number" step="0.01" name="interestRate" value={form.interestRate} onChange={handleChange} suffix="%" placeholder="0.00" />
                </div>
                <div>
                  <Label>Tenure</Label>
                  <Input icon={Calendar} type="number" name="tenureYears" value={form.tenureYears} onChange={handleChange} suffix="Yrs" placeholder="25" />
                </div>
              </div>

              <div className="pf-form-grid-2">
                <div>
                  <Label>Processing Fee</Label>
                  <Input icon={CreditCard} type="number" name="processingFee" value={form.processingFee} onChange={handleChange} suffix="AED" placeholder="0" />
                </div>
                <div>
                  <Label>Insurance Amount</Label>
                  <Input icon={Shield} type="number" name="insuranceAmount" value={form.insuranceAmount} onChange={handleChange} suffix="AED" placeholder="0" />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                  <Label>Cover Note</Label>
                  <button onClick={generateCoverNote}
                    style={{ fontSize: 11, fontWeight: 600, color: T.primary, background: T.primaryBg, border: `1px solid ${T.primaryBorder}`, borderRadius: 6, padding: '3px 10px', cursor: 'pointer' }}>
                    ✦ Auto Generate
                  </button>
                </div>
                <textarea className="pf-textarea" name="coverNote" value={form.coverNote} onChange={handleChange} rows={5}
                  placeholder="Dear [Customer Name], ..."
                  style={{ width: '100%', padding: '11px 13px', border: `1.5px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.text, resize: 'vertical', fontFamily: 'Inter, sans-serif', background: T.primaryBg, lineHeight: 1.6, transition: 'all 0.15s', outline: 'none' }}
                />
              </div>

              {/* Actions */}
              <div className="pf-actions" style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
               
                <button onClick={() => handleSubmit('sent')} disabled={submitting}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px 20px', background: submitting ? T.primaryBorder : `linear-gradient(135deg, ${T.primary}, ${T.primaryLight})`, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#fff', cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: submitting ? 'none' : '0 4px 14px rgba(92,3,155,0.35)', transition: 'all 0.2s' }}>
                  {submitting
                    ? <><Loader2 size={15} style={{ animation: 'pf-spin 0.7s linear infinite' }} /> Sending…</>
                    : <><Send size={15} /> Create Proposal</>}
                </button>
              </div>
            </div>
          </SCard>
        </div>

        {/* ════ RIGHT COLUMN — Live Summary ════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'sticky', top: 20 }}>

          {/* EMI Calculator */}
          <SCard title="EMI Calculator" icon={Calculator} accent={T.success}>
            <div style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.primaryLight})`, borderRadius: 14, padding: '22px 20px', marginBottom: 16, textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Monthly EMI</p>
              <p style={{ margin: '8px 0 0', fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                {emi ? `AED ${Math.round(emi).toLocaleString('en-AE')}` : '—'}
              </p>
              {form.tenureYears && <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>for {form.tenureYears} years ({Number(form.tenureYears) * 12} months)</p>}
            </div>

            <div style={{ border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden' }}>
              <SumRow label="Principal Amount" value={form.loanAmount   ? fmtAED(form.loanAmount)   : '—'} />
              <SumRow label="Interest Rate"    value={form.interestRate ? fmtPct(form.interestRate) : '—'} />
              <SumRow label="Tenure"           value={form.tenureYears  ? `${form.tenureYears} Years` : '—'} />
              <SumRow label="Total Interest"   value={totalInterest > 0 ? fmtAED(totalInterest)     : '—'} accent={T.warning} />
              <div style={{ background: T.primaryBg, borderTop: `1.5px solid ${T.primaryBorder}` }}>
                <SumRow label="Total Payable" value={totalPayable > 0 ? fmtAED(totalPayable) : '—'} accent={T.primary} big />
              </div>
            </div>

            {/* LTV Indicator — with File 2's red warning when >80% */}
            {ltv && (
              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                  <span style={{ fontSize: 12, color: T.textMuted, fontWeight: 500 }}>Loan-to-Value (LTV)</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: Number(ltv) > 80 ? T.error : T.success }}>
                    {ltv}%
                  </span>
                </div>
                <div style={{ height: 8, background: T.border, borderRadius: 99 }}>
                  <div style={{ height: 8, background: Number(ltv) > 80 ? T.error : `linear-gradient(90deg, ${T.success}, ${T.primary})`, borderRadius: 99, width: `${Math.min(Number(ltv), 100)}%`, transition: 'width 0.4s ease' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 10, color: T.textMuted }}>0%</span>
                  <span style={{ fontSize: 10, color: T.textMuted }}>Max 80%</span>
                </div>
                {Number(ltv) > 80 && (
                  <p style={{ fontSize: 11, color: T.error, marginTop: 5, fontWeight: 500 }}>⚠ LTV exceeds 80% — may not be eligible</p>
                )}
              </div>
            )}
          </SCard>

          {/* Fees Summary */}
          <SCard title="Fee Breakdown" icon={TrendingUp} accent={T.warning}>
            <div style={{ border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden' }}>
              <SumRow label="Processing Fee" value={form.processingFee   ? fmtAED(form.processingFee)   : 'Not set'} />
              <SumRow label="Insurance"      value={form.insuranceAmount ? fmtAED(form.insuranceAmount) : 'Not set'} />
              <div style={{ background: T.warningBg, borderTop: `1.5px solid #FED7AA` }}>
                <SumRow
                  label="Total Upfront Cost"
                  value={fmtAED((Number(form.processingFee) || 0) + (Number(form.insuranceAmount) || 0))}
                  accent={T.warning} big
                />
              </div>
            </div>
          </SCard>

          {/* Proposal Checklist */}
          <SCard title="Proposal Checklist" icon={CheckCircle} accent={T.success}>
            {[
              { label: 'Loan amount set',       done: !!form.loanAmount },
              { label: 'Interest rate set',     done: !!form.interestRate },
              { label: 'Bank product selected', done: !!selectedBank },
              { label: 'Cover note added',      done: form.coverNote.length > 20 },
              { label: 'Tenure configured',     done: !!form.tenureYears },
            ].map(({ label, done }, i, arr) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${T.border}` }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: done ? T.successBg : T.border, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {done ? <CheckCircle size={13} color={T.success} /> : <div style={{ width: 7, height: 7, borderRadius: '50%', background: T.textMuted }} />}
                </div>
                <span style={{ fontSize: 12, fontWeight: 500, color: done ? T.text : T.textMuted }}>{label}</span>
              </div>
            ))}
          </SCard>
        </div>
      </div>

      {/* ══════════════════════════════════
          BANK PRODUCT SLIDE PANEL (File 1 exact)
      ══════════════════════════════════ */}
      {showBankPanel && (
        <>
          {/* Overlay */}
          <div onClick={() => setShowBankPanel(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(30,11,59,0.45)', zIndex: 40, backdropFilter: 'blur(2px)' }} />

          {/* Slide Panel */}
          <div className="pf-slide"
            style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: '100%', maxWidth: 480, background: T.card, zIndex: 50, overflowY: 'auto', boxShadow: '-8px 0 40px rgba(92,3,155,0.18)', display: 'flex', flexDirection: 'column' }}>

            {/* Panel Header */}
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.primaryBg, position: 'sticky', top: 0, zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={16} color="#fff" />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.text }}>Select Bank Product</p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: T.textMuted }}>{bankProducts.length} products available</p>
                </div>
              </div>
              <button onClick={() => setShowBankPanel(false)}
                style={{ width: 34, height: 34, borderRadius: 9, border: `1px solid ${T.border}`, background: T.card, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={16} color={T.textSub} />
              </button>
            </div>

            {/* Bank Cards */}
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
              {bankProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: T.textMuted }}>
                  <Building2 size={36} color={T.primaryBorder} style={{ margin: '0 auto 12px' }} />
                  <p style={{ fontSize: 14, fontWeight: 500 }}>No bank products available</p>
                </div>
              ) : bankProducts.map((bank) => {
                const isSelected = selectedBank?._id === bank._id || selectedBank?.id === bank.id;
                return (
                  <div key={bank._id || bank.id} className="bank-card"
                    onClick={() => { setSelectedBank(bank); setShowBankPanel(false); }}
                    style={{ border: `1.5px solid ${isSelected ? T.primary : T.border}`, borderRadius: 14, padding: '16px 18px', cursor: 'pointer', background: isSelected ? T.primaryBg : T.card, position: 'relative', overflow: 'hidden' }}>

                    {isSelected && (
                      <div style={{ position: 'absolute', top: 10, right: 10 }}>
                        <CheckCircle size={18} color={T.primary} />
                      </div>
                    )}

                    {/* Bank name + product */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 11, background: isSelected ? T.primary : T.primaryBg, border: `1.5px solid ${T.primaryBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                        {bank.logo
                          ? <img src={bank.logo} alt={bank.bankName} style={{ width: 32, height: 32, objectFit: 'contain' }} />
                          : <Building2 size={18} color={isSelected ? '#fff' : T.primary} />}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.text }}>{bank.bankName || bank.name || 'Bank'}</p>
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: T.textMuted }}>{bank.productName || bank.product || 'Mortgage'}</p>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                      {[
                        { label: 'Rate',     value: fmtPct(bank.interestRate || bank.rate) },
                        { label: 'Max LTV',  value: bank.maxLtv ? `${bank.maxLtv}%` : '—' },
                        { label: 'Min Loan', value: fmtAED(bank.minLoanAmount) },
                      ].map(({ label, value }) => (
                        <div key={label} style={{ background: isSelected ? 'rgba(255,255,255,0.7)' : T.primaryBg, borderRadius: 9, padding: '8px 10px', textAlign: 'center', border: `1px solid ${T.border}` }}>
                          <p style={{ margin: 0, fontSize: 10, color: T.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
                          <p style={{ margin: '4px 0 0', fontSize: 13, fontWeight: 700, color: T.primary }}>{value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Features */}
                    {(Array.isArray(bank.features) ? bank.features : Array.isArray(bank.snapshotFeatures) ? bank.snapshotFeatures : []).slice(0, 3).map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: i === 0 ? 12 : 5 }}>
                        <CheckCircle size={11} color={T.success} />
                        <span style={{ fontSize: 12, color: T.textSub }}>{f}</span>
                      </div>
                    ))}

                    {/* Select button */}
                    <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: isSelected ? T.success : T.primary }}>
                        {isSelected ? 'Selected' : 'Select'}
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProposalForm;