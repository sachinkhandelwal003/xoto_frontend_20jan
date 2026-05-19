import React, { useState, useMemo, useEffect } from "react";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import { message } from "antd";

// ─── Color palette & theme ────────────────────────────────────────────────────
const C = {
  purple:   { bg: '#EEEDFE', border: '#AFA9EC', text: '#3C3489', strong: '#26215C' },
  teal:     { bg: '#E1F5EE', border: '#5DCAA5', text: '#0F6E56', strong: '#04342C' },
  amber:    { bg: '#FAEEDA', border: '#EF9F27', text: '#854F0B', strong: '#412402' },
  green:    { bg: '#EAF3DE', border: '#97C459', text: '#3B6D11', strong: '#173404' },
  red:      { bg: '#FCEBEB', border: '#F09595', text: '#A32D2D', strong: '#501313' },
  coral:    { bg: '#FAECE7', border: '#F0997B', text: '#993C1D', strong: '#4A1B0C' },
  gray:     { bg: '#F1EFE8', border: '#B4B2A9', text: '#5F5E5A', strong: '#2C2C2A' },
  blue:     { bg: '#E6F1FB', border: '#85B7EB', text: '#185FA5', strong: '#042C53' },
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_DEALS = [
  {
    _id: 'DR-00001', dealReference: 'DR-00001', dealType: 'sale',
    transactionValue: 2800000, commissionStatus: 'confirmed',
    property: { propertyName: 'Marina Crest Tower', area: 'Dubai Marina', city: 'Dubai', propertySubType: 'off_plan' },
    customer: { firstName: 'Ahmed', lastName: 'Al Rashidi', phone: '+971501234567', email: 'ahmed@mail.com' },
    advisor: { firstName: 'Sara', lastName: 'Malik', employeeId: 'XA-0012' },
    agent: null, agency: null,
    referralPartner: { firstName: 'Rahul', lastName: 'Verma' },
    inventoryUnit: { unitNumber: 'A-1204', floorNumber: 12, bedroomType: '2bed', price: 2800000 },
    commission: { grossAmount: 56000, grossPercent: 2, xotoRetained: 39200, xotoPercent: 1.4, partnerShare: 0, partnerPercent: 0, referralShare: 16800, referralPercent: 0.6 },
    evidenceUploaded: true, isLocked: true,
    confirmedAt: '2026-04-10T09:30:00Z', createdAt: '2026-04-05T11:00:00Z',
    notes: 'SPA signed 10 Apr. Client finalised on 12th floor unit only.',
  },
  {
    _id: 'DR-00002', dealReference: 'DR-00002', dealType: 'sale',
    transactionValue: 4200000, commissionStatus: 'paid',
    property: { propertyName: 'Palm Shores Villa', area: 'Palm Jumeirah', city: 'Dubai', propertySubType: 'secondary' },
    customer: { firstName: 'Elena', lastName: 'Kovac', phone: '+971509876543', email: 'elena.kovac@corp.eu' },
    advisor: null,
    agent: { first_name: 'Khalid', last_name: 'Hussain', email: 'khalid@agency.ae' },
    agency: { companyName: 'Gulf Prime Realty', primaryContactEmail: 'gpr@agency.ae' },
    referralPartner: null,
    inventoryUnit: null,
    commission: { grossAmount: 84000, grossPercent: 2, xotoRetained: 50400, xotoPercent: 1.2, partnerShare: 33600, partnerPercent: 0.8, referralShare: 0, referralPercent: 0 },
    evidenceUploaded: true, isLocked: true,
    confirmedAt: '2026-03-22T14:15:00Z', paidAt: '2026-04-01T10:00:00Z', createdAt: '2026-03-18T09:00:00Z',
    notes: '',
  },
  {
    _id: 'DR-00003', dealReference: 'DR-00003', dealType: 'lease',
    transactionValue: 180000, commissionStatus: 'pending',
    property: { propertyName: 'JVC Bloom Apartments', area: 'Jumeirah Village Circle', city: 'Dubai', propertySubType: 'rental' },
    customer: { firstName: 'Priya', lastName: 'Sharma', phone: '+971556789012', email: 'priya@gmail.com' },
    advisor: { firstName: 'Omar', lastName: 'Farouk', employeeId: 'XA-0008' },
    agent: null, agency: null, referralPartner: null,
    inventoryUnit: { unitNumber: 'B-305', floorNumber: 3, bedroomType: '1bed', price: 180000 },
    commission: { grossAmount: 18000, grossPercent: 10, xotoRetained: 18000, xotoPercent: 10, partnerShare: 0, partnerPercent: 0, referralShare: 0, referralPercent: 0 },
    evidenceUploaded: false, isLocked: false,
    createdAt: '2026-05-12T08:30:00Z',
    notes: 'Awaiting signed tenancy contract upload.',
  },
  {
    _id: 'DR-00004', dealReference: 'DR-00004', dealType: 'sale',
    transactionValue: 6500000, commissionStatus: 'confirmed',
    property: { propertyName: 'Damac Hills Premium', area: 'Damac Hills', city: 'Dubai', propertySubType: 'off_plan' },
    customer: { firstName: 'Liu', lastName: 'Wei', phone: '+971504561230', email: 'liu.wei@company.cn' },
    advisor: { firstName: 'Aisha', lastName: 'Noor', employeeId: 'XA-0021' },
    agent: null, agency: null,
    referralPartner: { firstName: 'Ivan', lastName: 'Petrov' },
    inventoryUnit: { unitNumber: 'V-04', floorNumber: 0, bedroomType: '4bed', price: 6500000 },
    commission: { grossAmount: 130000, grossPercent: 2, xotoRetained: 91000, xotoPercent: 1.4, partnerShare: 0, partnerPercent: 0, referralShare: 39000, referralPercent: 0.6 },
    evidenceUploaded: true, isLocked: true,
    confirmedAt: '2026-05-08T11:00:00Z', createdAt: '2026-05-01T09:00:00Z',
    notes: '',
  },
];

const MOCK_INVENTORY = [
  { _id: 'inv001', unitNumber: 'A-1201', buildingName: 'Tower A', floorNumber: 12, unitType: 'apartment', bedroomType: '1bed', bedrooms: 1, bathrooms: 1, area: 780, areaUnit: 'sqft', price: 1850000, currency: 'AED', status: 'available', hasView: true, viewType: ['sea'], parkingSpaces: 1, furnishing: 'unfurnished', propertyId: 'prop001', propertyName: 'Marina Crest Tower' },
  { _id: 'inv002', unitNumber: 'A-1202', buildingName: 'Tower A', floorNumber: 12, unitType: 'apartment', bedroomType: '2bed', bedrooms: 2, bathrooms: 2, area: 1240, areaUnit: 'sqft', price: 2600000, currency: 'AED', status: 'reserved', hasView: true, viewType: ['sea', 'city'], parkingSpaces: 1, furnishing: 'unfurnished', propertyId: 'prop001', propertyName: 'Marina Crest Tower' },
  { _id: 'inv003', unitNumber: 'A-1203', buildingName: 'Tower A', floorNumber: 12, unitType: 'apartment', bedroomType: '2bed', bedrooms: 2, bathrooms: 2, area: 1180, areaUnit: 'sqft', price: 2450000, currency: 'AED', status: 'booked', hasView: false, viewType: [], parkingSpaces: 1, furnishing: 'unfurnished', propertyId: 'prop001', propertyName: 'Marina Crest Tower' },
  { _id: 'inv004', unitNumber: 'A-1204', buildingName: 'Tower A', floorNumber: 12, unitType: 'apartment', bedroomType: '2bed', bedrooms: 2, bathrooms: 2, area: 1260, areaUnit: 'sqft', price: 2800000, currency: 'AED', status: 'spa_signed', hasView: true, viewType: ['sea'], parkingSpaces: 2, furnishing: 'unfurnished', propertyId: 'prop001', propertyName: 'Marina Crest Tower' },
  { _id: 'inv005', unitNumber: 'A-1501', buildingName: 'Tower A', floorNumber: 15, unitType: 'apartment', bedroomType: '3bed', bedrooms: 3, bathrooms: 3, area: 1890, areaUnit: 'sqft', price: 4200000, currency: 'AED', status: 'available', hasView: true, viewType: ['sea', 'landmark'], parkingSpaces: 2, furnishing: 'unfurnished', propertyId: 'prop001', propertyName: 'Marina Crest Tower' },
  { _id: 'inv006', unitNumber: 'B-305', buildingName: 'Building B', floorNumber: 3, unitType: 'apartment', bedroomType: '1bed', bedrooms: 1, bathrooms: 1, area: 650, areaUnit: 'sqft', price: 180000, currency: 'AED', status: 'booked', hasView: false, viewType: [], parkingSpaces: 1, furnishing: 'furnished', propertyId: 'prop002', propertyName: 'JVC Bloom Apartments' },
  { _id: 'inv007', unitNumber: 'B-306', buildingName: 'Building B', floorNumber: 3, unitType: 'apartment', bedroomType: '1bed', bedrooms: 1, bathrooms: 1, area: 620, areaUnit: 'sqft', price: 165000, currency: 'AED', status: 'available', hasView: false, viewType: [], parkingSpaces: 1, furnishing: 'semi_furnished', propertyId: 'prop002', propertyName: 'JVC Bloom Apartments' },
  { _id: 'inv008', unitNumber: 'V-04', buildingName: null, floorNumber: null, unitType: 'villa', bedroomType: '4bed', bedrooms: 4, bathrooms: 5, area: 6200, areaUnit: 'sqft', price: 6500000, currency: 'AED', status: 'spa_signed', hasView: true, viewType: ['garden', 'pool'], parkingSpaces: 3, furnishing: 'unfurnished', propertyId: 'prop003', propertyName: 'Damac Hills Premium' },
  { _id: 'inv009', unitNumber: 'V-05', buildingName: null, floorNumber: null, unitType: 'villa', bedroomType: '4bed', bedrooms: 4, bathrooms: 5, area: 6100, areaUnit: 'sqft', price: 6300000, currency: 'AED', status: 'available', hasView: true, viewType: ['garden'], parkingSpaces: 3, furnishing: 'unfurnished', propertyId: 'prop003', propertyName: 'Damac Hills Premium' },
  { _id: 'inv010', unitNumber: 'V-06', buildingName: null, floorNumber: null, unitType: 'villa', bedroomType: '5bed', bedrooms: 5, bathrooms: 6, area: 8400, areaUnit: 'sqft', price: 9200000, currency: 'AED', status: 'hold', hasView: true, viewType: ['landmark', 'pool'], parkingSpaces: 4, furnishing: 'unfurnished', propertyId: 'prop003', propertyName: 'Damac Hills Premium' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => n?.toLocaleString('en-AE') ?? '—';
const fmtAED = (n) => n ? `AED ${n.toLocaleString('en-AE')}` : '—';
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-AE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const statusConfig = {
  pending:   { color: C.amber,  label: 'Pending',   icon: '⏳' },
  confirmed: { color: C.purple, label: 'Confirmed', icon: '✓' },
  paid:      { color: C.teal,   label: 'Paid',      icon: '✓✓' },
};

const invStatusConfig = {
  available: { color: C.teal,   label: 'Available' },
  hold:      { color: C.amber,  label: 'Hold' },
  reserved:  { color: C.blue,   label: 'Reserved' },
  booked:    { color: C.purple, label: 'Booked' },
  spa_signed:{ color: C.coral,  label: 'SPA Signed' },
  sold:      { color: C.green,  label: 'Sold' },
  handover:  { color: C.gray,   label: 'Handover' },
  cancelled: { color: C.red,    label: 'Cancelled' },
};

const Badge = ({ cfg, label, size = 'sm' }) => (
  <span style={{
    background: cfg.bg, border: `1px solid ${cfg.border}`,
    color: cfg.text, borderRadius: 6,
    padding: size === 'sm' ? '2px 8px' : '4px 12px',
    fontSize: size === 'sm' ? 11 : 12,
    fontWeight: 500, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 4,
  }}>{label}</span>
);

const Divider = () => (
  <div style={{ height: 1, background: 'var(--color-border-tertiary)', margin: '12px 0' }} />
);

// ─── Commission breakdown bar ─────────────────────────────────────────────────
const CommissionBar = ({ c }) => {
  const total = c.grossAmount || 1;
  const xotoPct = Math.round((c.xotoRetained / total) * 100);
  const partnerPct = Math.round((c.partnerShare / total) * 100);
  const refPct = Math.round((c.referralShare / total) * 100);
  return (
    <div>
      <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', gap: 1, marginBottom: 6 }}>
        {xotoPct > 0 && <div style={{ flex: xotoPct, background: C.purple.border }} />}
        {partnerPct > 0 && <div style={{ flex: partnerPct, background: C.teal.border }} />}
        {refPct > 0 && <div style={{ flex: refPct, background: C.amber.border }} />}
      </div>
      <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--color-text-secondary)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: C.purple.border, display: 'inline-block' }} />
          Xoto {fmtAED(c.xotoRetained)}
        </span>
        {c.partnerShare > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: C.teal.border, display: 'inline-block' }} />
            Partner {fmtAED(c.partnerShare)}
          </span>
        )}
        {c.referralShare > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: C.amber.border, display: 'inline-block' }} />
            Referral {fmtAED(c.referralShare)}
          </span>
        )}
      </div>
    </div>
  );
};

// ─── Deal Detail Drawer ───────────────────────────────────────────────────────
const DealDrawer = ({ deal, onClose, onAction }) => {
  const [confirmAction, setConfirmAction] = useState(null);

  if (!deal) return null;
  const sc = statusConfig[deal.commissionStatus];
  const canConfirm = deal.commissionStatus === 'pending' && deal.evidenceUploaded;
  const canPay = deal.commissionStatus === 'confirmed';

  const InfoRow = ({ label, value, mono }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
      <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-primary)', fontFamily: mono ? 'var(--font-mono)' : undefined }}>{value}</span>
    </div>
  );

  return (
    <div style={{
      position: 'fixed', right: 0, top: 0, bottom: 0, width: 460, zIndex: 100,
      background: 'var(--color-background-primary)',
      borderLeft: '0.5px solid var(--color-border-secondary)',
      display: 'flex', flexDirection: 'column', overflowY: 'auto',
      boxShadow: '-8px 0 32px rgba(0,0,0,0.08)',
    }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '0.5px solid var(--color-border-tertiary)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text-secondary)' }}>{deal.dealReference}</span>
            <Badge cfg={sc.color} label={sc.label} />
            <Badge cfg={deal.dealType === 'sale' ? C.purple : C.blue} label={deal.dealType === 'sale' ? 'Sale' : 'Lease'} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 500 }}>{deal.property?.propertyName}</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{deal.property?.area}, {deal.property?.city}</div>
        </div>
        <button onClick={onClose} style={{ fontSize: 20, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: '0 4px', lineHeight: 1 }}>×</button>
      </div>

      <div style={{ padding: '16px 24px', flex: 1 }}>
        {/* Transaction value */}
        <div style={{ background: 'var(--color-background-secondary)', borderRadius: 'var(--border-radius-md)', padding: '12px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Transaction value</div>
          <div style={{ fontSize: 24, fontWeight: 500 }}>{fmtAED(deal.transactionValue)}</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>Gross commission: {fmtAED(deal.commission.grossAmount)} ({deal.commission.grossPercent}%)</div>
        </div>

        {/* Commission split */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Commission split</div>
          <CommissionBar c={deal.commission} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
            {[
              { label: 'Xoto retained', v: deal.commission.xotoRetained, pct: deal.commission.xotoPercent, c: C.purple },
              { label: 'Partner share', v: deal.commission.partnerShare, pct: deal.commission.partnerPercent, c: C.teal },
              { label: 'Referral share', v: deal.commission.referralShare, pct: deal.commission.referralPercent, c: C.amber },
            ].map(({ label, v, pct, c }) => (
              <div key={label} style={{ background: c.bg, border: `0.5px solid ${c.border}`, borderRadius: 'var(--border-radius-md)', padding: '8px 12px' }}>
                <div style={{ fontSize: 10, color: c.text, marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: c.strong }}>{fmtAED(v)}</div>
                <div style={{ fontSize: 10, color: c.text }}>{pct}% of value</div>
              </div>
            ))}
          </div>
        </div>

        <Divider />

        {/* Parties */}
        <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Parties</div>
        <InfoRow label="Customer" value={`${deal.customer.firstName} ${deal.customer.lastName}`} />
        <InfoRow label="Phone" value={deal.customer.phone} mono />
        {deal.advisor && <InfoRow label="Xoto Advisor" value={`${deal.advisor.firstName} ${deal.advisor.lastName} (${deal.advisor.employeeId})`} />}
        {deal.agent && <InfoRow label="Agent" value={`${deal.agent.first_name} ${deal.agent.last_name}`} />}
        {deal.agency && <InfoRow label="Agency" value={deal.agency.companyName} />}
        {deal.referralPartner && <InfoRow label="Referral partner" value={`${deal.referralPartner.firstName} ${deal.referralPartner.lastName}`} />}

        <Divider />

        {/* Inventory unit */}
        {deal.inventoryUnit && (
          <>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Inventory unit</div>
            <div style={{ background: C.purple.bg, border: `0.5px solid ${C.purple.border}`, borderRadius: 'var(--border-radius-md)', padding: '10px 14px', marginBottom: 16 }}>
              <div style={{ fontWeight: 500, fontSize: 14, color: C.purple.strong }}>{deal.inventoryUnit.unitNumber}</div>
              <div style={{ fontSize: 12, color: C.purple.text, marginTop: 2 }}>Floor {deal.inventoryUnit.floorNumber} · {deal.inventoryUnit.bedroomType?.replace('bed', ' bed')} · {fmtAED(deal.inventoryUnit.price)}</div>
            </div>
          </>
        )}

        {/* Timeline */}
        <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Timeline</div>
        <InfoRow label="Created" value={fmtDate(deal.createdAt)} />
        {deal.confirmedAt && <InfoRow label="Confirmed" value={fmtDate(deal.confirmedAt)} />}
        {deal.paidAt && <InfoRow label="Paid" value={fmtDate(deal.paidAt)} />}

        {/* Evidence */}
        <Divider />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Evidence docs</div>
          <Badge cfg={deal.evidenceUploaded ? C.green : C.red} label={deal.evidenceUploaded ? 'Uploaded' : 'Missing'} />
        </div>
        {!deal.evidenceUploaded && (
          <div style={{ background: C.amber.bg, border: `0.5px solid ${C.amber.border}`, borderRadius: 'var(--border-radius-md)', padding: '8px 12px', fontSize: 12, color: C.amber.text, marginBottom: 12 }}>
            SPA or booking form required before confirmation.
          </div>
        )}
        {deal.isLocked && (
          <div style={{ background: C.gray.bg, border: `0.5px solid ${C.gray.border}`, borderRadius: 'var(--border-radius-md)', padding: '8px 12px', fontSize: 12, color: C.gray.text, marginBottom: 12 }}>
            🔒 Record is locked — immutable after confirmation.
          </div>
        )}

        {deal.notes && (
          <>
            <Divider />
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Notes</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-primary)', lineHeight: 1.6 }}>{deal.notes}</div>
          </>
        )}
      </div>

      {/* Action footer */}
      {(canConfirm || canPay) && (
        <div style={{ padding: '16px 24px', borderTop: '0.5px solid var(--color-border-tertiary)', display: 'flex', gap: 8 }}>
          {canConfirm && (
            <button onClick={() => onAction(deal._id, 'confirm')} style={{
              flex: 1, padding: '10px 16px', borderRadius: 'var(--border-radius-md)', border: `1px solid ${C.purple.border}`,
              background: C.purple.bg, color: C.purple.strong, fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}>Confirm deal →</button>
          )}
          {canPay && (
            <button onClick={() => onAction(deal._id, 'pay')} style={{
              flex: 1, padding: '10px 16px', borderRadius: 'var(--border-radius-md)', border: `1px solid ${C.teal.border}`,
              background: C.teal.bg, color: C.teal.strong, fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}>Mark as paid ✓</button>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Inventory Modal ──────────────────────────────────────────────────────────
const InventoryModal = ({ onClose, inventoryData }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProp, setFilterProp] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedUnit, setSelectedUnit] = useState(null);

  const properties = [...new Set(inventoryData.map(u => u.propertyName))];

  const filtered = inventoryData.filter(u => {
    if (filterStatus !== 'all' && u.status !== filterStatus) return false;
    if (filterProp !== 'all' && u.propertyName !== filterProp) return false;
    if (filterType !== 'all' && u.unitType !== filterType) return false;
    return true;
  });

  const counts = Object.entries(invStatusConfig).map(([k, v]) => ({
    status: k, label: v.label, count: inventoryData.filter(u => u.status === k).length, color: v.color,
  })).filter(x => x.count > 0);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 48,
    }}>
      <div style={{
        background: 'var(--color-background-primary)',
        borderRadius: 'var(--border-radius-xl)', border: '0.5px solid var(--color-border-secondary)',
        width: '92%', maxWidth: 900, maxHeight: '82vh', display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '0.5px solid var(--color-border-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 500 }}>Inventory catalogue</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{filtered.length} units · across {properties.length} properties</div>
          </div>
          <button onClick={onClose} style={{ fontSize: 20, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>×</button>
        </div>

        {/* Status summary pills */}
        <div style={{ padding: '12px 24px', borderBottom: '0.5px solid var(--color-border-tertiary)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {counts.map(({ status, label, count, color }) => (
            <button key={status} onClick={() => setFilterStatus(filterStatus === status ? 'all' : status)} style={{
              padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer',
              background: filterStatus === status ? color.bg : 'var(--color-background-secondary)',
              border: filterStatus === status ? `1px solid ${color.border}` : '0.5px solid var(--color-border-tertiary)',
              color: filterStatus === status ? color.text : 'var(--color-text-secondary)',
              transition: 'all 0.1s',
            }}>{label} · {count}</button>
          ))}
        </div>

        {/* Filters */}
        <div style={{ padding: '12px 24px', borderBottom: '0.5px solid var(--color-border-tertiary)', display: 'flex', gap: 8 }}>
          <select value={filterProp} onChange={e => setFilterProp(e.target.value)} style={{ fontSize: 12, padding: '4px 8px', borderRadius: 'var(--border-radius-md)', flex: 1 }}>
            <option value="all">All properties</option>
            {properties.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ fontSize: 12, padding: '4px 8px', borderRadius: 'var(--border-radius-md)' }}>
            <option value="all">All types</option>
            {['apartment', 'villa', 'townhouse', 'office', 'retail'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Table */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ background: 'var(--color-background-secondary)' }}>
                {['Unit', 'Property', 'Floor', 'Type / BR', 'Area', 'Price', 'Features', 'Status', ''].map((h, i) => (
                  <th key={i} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 500, fontSize: 11, color: 'var(--color-text-secondary)', borderBottom: '0.5px solid var(--color-border-tertiary)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((unit, i) => {
                const sc = invStatusConfig[unit.status];
                return (
                  <tr key={unit._id} style={{ borderBottom: '0.5px solid var(--color-border-tertiary)', background: selectedUnit?._id === unit._id ? 'var(--color-background-info)' : i % 2 === 0 ? 'transparent' : 'var(--color-background-secondary)' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 500, fontFamily: 'var(--font-mono)' }}>{unit.unitNumber}</td>
                    <td style={{ padding: '8px 12px', color: 'var(--color-text-secondary)' }}>{unit.propertyName}</td>
                    <td style={{ padding: '8px 12px' }}>{unit.floorNumber ?? '—'}</td>
                    <td style={{ padding: '8px 12px' }}>{unit.unitType} · {unit.bedroomType?.replace('bed', 'BR')}</td>
                    <td style={{ padding: '8px 12px' }}>{fmt(unit.area)} {unit.areaUnit}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 500 }}>{fmtAED(unit.price)}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {unit.hasView && <Badge cfg={C.blue} label="View" size="sm" />}
                        {unit.parkingSpaces > 0 && <Badge cfg={C.gray} label={`P×${unit.parkingSpaces}`} size="sm" />}
                        {unit.furnishing !== 'unfurnished' && <Badge cfg={C.coral} label={unit.furnishing === 'furnished' ? 'Furn.' : 'Semi'} size="sm" />}
                      </div>
                    </td>
                    <td style={{ padding: '8px 12px' }}><Badge cfg={sc.color} label={sc.label} /></td>
                    <td style={{ padding: '8px 12px' }}>
                      <button onClick={() => setSelectedUnit(selectedUnit?._id === unit._id ? null : unit)} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 'var(--border-radius-md)', border: '0.5px solid var(--color-border-secondary)', background: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                        {selectedUnit?._id === unit._id ? 'Close' : 'Details'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Unit detail panel */}
        {selectedUnit && (
          <div style={{ padding: '16px 24px', borderTop: '0.5px solid var(--color-border-tertiary)', background: 'var(--color-background-secondary)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[
              { label: 'Unit', value: selectedUnit.unitNumber },
              { label: 'Property', value: selectedUnit.propertyName },
              { label: 'Floor', value: selectedUnit.floorNumber ?? '—' },
              { label: 'Status', value: invStatusConfig[selectedUnit.status]?.label },
              { label: 'Bedrooms', value: selectedUnit.bedrooms },
              { label: 'Bathrooms', value: selectedUnit.bathrooms },
              { label: 'Area', value: `${fmt(selectedUnit.area)} ${selectedUnit.areaUnit}` },
              { label: 'Price', value: fmtAED(selectedUnit.price) },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{value}</div>
              </div>
            ))}
            {selectedUnit.viewType?.length > 0 && (
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Views</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {selectedUnit.viewType.map(v => <Badge key={v} cfg={C.blue} label={v} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Create Deal Modal ────────────────────────────────────────────────────────
const CreateDealModal = ({ onClose, onCreate, inventoryData }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    leadId: 'LEAD-20240512',
    propertyId: 'prop001',
    customerId: 'CUST-001',
    dealType: 'sale',
    transactionValue: '',
    grossPercent: 2,
    partnerPercent: 0,
    referralPercent: 0,
    inventoryUnitId: '',
    advisorId: '',
    agentId: '',
    agencyId: '',
    referralPartnerId: '',
    notes: '',
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const tv = Number(form.transactionValue) || 0;
  const gross = (tv * form.grossPercent) / 100;
  const partnerShare = (gross * form.partnerPercent) / 100;
  const referralShare = (gross * form.referralPercent) / 100;
  const xotoRetained = gross - partnerShare - referralShare;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'var(--color-background-primary)', borderRadius: 'var(--border-radius-xl)', border: '0.5px solid var(--color-border-secondary)', width: '100%', maxWidth: 580, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '0.5px solid var(--color-border-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>New deal record</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>Step {step} of 2 — {step === 1 ? 'Core details' : 'Commission & parties'}</div>
          </div>
          <button onClick={onClose} style={{ fontSize: 20, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>×</button>
        </div>

        <div style={{ padding: '20px 24px', maxHeight: '60vh', overflowY: 'auto' }}>
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Lead ID *', key: 'leadId', placeholder: 'LEAD-...' },
                  { label: 'Property ID *', key: 'propertyId', placeholder: 'prop...' },
                  { label: 'Customer ID *', key: 'customerId', placeholder: 'CUST-...' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>{label}</label>
                    <input value={form[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder} style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--border-radius-md)', fontSize: 12, boxSizing: 'border-box' }} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Deal type *</label>
                  <select value={form.dealType} onChange={e => set('dealType', e.target.value)} style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--border-radius-md)', fontSize: 12 }}>
                    <option value="sale">Sale</option>
                    <option value="lease">Lease</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Transaction value (AED) *</label>
                <input type="number" value={form.transactionValue} onChange={e => set('transactionValue', e.target.value)} placeholder="e.g. 2800000" style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--border-radius-md)', fontSize: 13, fontWeight: 500, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Inventory unit ID (optional)</label>
                <select value={form.inventoryUnitId} onChange={e => set('inventoryUnitId', e.target.value)} style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--border-radius-md)', fontSize: 12 }}>
                  <option value="">No inventory unit linked</option>
                  {inventoryData.filter(u => ['available', 'spa_signed', 'booked'].includes(u.status)).map(u => (
                    <option key={u._id} value={u._id}>{u.unitNumber} · {u.propertyName} · {u.bedroomType} · {fmtAED(u.price)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Notes</label>
                <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--border-radius-md)', fontSize: 12, resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Commission preview */}
              {tv > 0 && (
                <div style={{ background: 'var(--color-background-secondary)', borderRadius: 'var(--border-radius-md)', padding: '12px 16px' }}>
                  <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Commission preview</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {[
                      { label: 'Gross', v: gross, c: C.gray },
                      { label: 'Xoto', v: xotoRetained, c: C.purple },
                      { label: 'Partner', v: partnerShare, c: C.teal },
                      { label: 'Referral', v: referralShare, c: C.amber },
                    ].map(({ label, v, c }) => (
                      <div key={label} style={{ background: c.bg, border: `0.5px solid ${c.border}`, borderRadius: 6, padding: '6px 10px' }}>
                        <div style={{ fontSize: 10, color: c.text }}>{label}</div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: c.strong }}>{fmtAED(Math.round(v))}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Commission %s */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Gross % *', key: 'grossPercent' },
                  { label: 'Partner %', key: 'partnerPercent' },
                  { label: 'Referral %', key: 'referralPercent' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>{label}</label>
                    <input type="number" step="0.1" min="0" max="100" value={form[key]} onChange={e => set(key, parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--border-radius-md)', fontSize: 12, boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>

              {/* Party IDs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Advisor ID', key: 'advisorId', placeholder: 'XA-...' },
                  { label: 'Agent ID', key: 'agentId', placeholder: 'GA-...' },
                  { label: 'Agency ID', key: 'agencyId', placeholder: 'AGY-...' },
                  { label: 'Referral Partner ID', key: 'referralPartnerId', placeholder: 'RP-...' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>{label}</label>
                    <input value={form[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder} style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--border-radius-md)', fontSize: 12, boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>

              <div style={{ background: C.amber.bg, border: `0.5px solid ${C.amber.border}`, borderRadius: 'var(--border-radius-md)', padding: '8px 12px', fontSize: 12, color: C.amber.text }}>
                Partner + Referral % must not exceed Gross %. Deal will start as Pending — upload evidence to confirm.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '0.5px solid var(--color-border-tertiary)', display: 'flex', justifyContent: 'space-between' }}>
          {step === 1 ? (
            <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 'var(--border-radius-md)', border: '0.5px solid var(--color-border-secondary)', background: 'none', cursor: 'pointer', fontSize: 12 }}>Cancel</button>
          ) : (
            <button onClick={() => setStep(1)} style={{ padding: '8px 16px', borderRadius: 'var(--border-radius-md)', border: '0.5px solid var(--color-border-secondary)', background: 'none', cursor: 'pointer', fontSize: 12 }}>← Back</button>
          )}
          {step === 1 ? (
            <button onClick={() => setStep(2)} disabled={!form.transactionValue} style={{ padding: '8px 20px', borderRadius: 'var(--border-radius-md)', border: `1px solid ${C.purple.border}`, background: C.purple.bg, color: C.purple.strong, cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>
              Next → Commission
            </button>
          ) : (
            <button onClick={() => { onCreate(form); onClose(); }} style={{ padding: '8px 20px', borderRadius: 'var(--border-radius-md)', border: `1px solid ${C.teal.border}`, background: C.teal.bg, color: C.teal.strong, cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>
              Create deal record ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Stats summary ─────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color }) => (
  <div style={{ background: 'var(--color-background-secondary)', borderRadius: 'var(--border-radius-md)', padding: '12px 16px' }}>
    <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 500, color: color || 'var(--color-text-primary)' }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 3 }}>{sub}</div>}
  </div>
);

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────
export default function DealRecordAdmin() {
  const [deals, setDeals] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [showInventory, setShowInventory] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('deals');

  const filtered = useMemo(() => deals.filter(d => {
    if (filterStatus !== 'all' && d.commissionStatus !== filterStatus) return false;
    if (filterType !== 'all' && d.dealType !== filterType) return false;
    if (search) {
      const q = search.toLowerCase();
      return d.dealReference.toLowerCase().includes(q) ||
        d.property?.propertyName?.toLowerCase().includes(q) ||
        `${d.customer.firstName} ${d.customer.lastName}`.toLowerCase().includes(q);
    }
    return true;
  }), [deals, filterStatus, filterType, search]);

  const stats = useMemo(() => ({
    totalGross: deals.reduce((s, d) => s + d.commission.grossAmount, 0),
    totalXoto: deals.reduce((s, d) => s + d.commission.xotoRetained, 0),
    pending: deals.filter(d => d.commissionStatus === 'pending').length,
    confirmed: deals.filter(d => d.commissionStatus === 'confirmed').length,
    paid: deals.filter(d => d.commissionStatus === 'paid').length,
    totalValue: deals.reduce((s, d) => s + d.transactionValue, 0),
  }), [deals]);

  const invStats = useMemo(() => ({
    total: inventoryData.length,
    available: inventoryData.filter(u => u.status === 'available').length,
    booked: inventoryData.filter(u => u.status === 'booked').length,
    spa: inventoryData.filter(u => u.status === 'spa_signed').length,
    hold: inventoryData.filter(u => u.status === 'hold').length,
  }), [inventoryData]);

  useEffect(() => {
    fetchDeals();
    fetchInventory();
  }, []);

  const fetchDeals = async () => {
    try {
      const res = await apiService.get('/deal-records');
      setDeals(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Error fetching deals:", err);
      // Fallback to mock data if API fails so the UI still works
      setDeals(MOCK_DEALS);
    }
  };

  const fetchInventory = async () => {
    try {
      // Assuming a generic inventory endpoint or properties/inventory
      const res = await apiService.get('/inventory/all') || await apiService.get('/properties/inventory');
      const data = res?.data?.data || res?.data || [];
      if (data.length > 0) {
        setInventoryData(data);
      } else {
        setInventoryData(MOCK_INVENTORY);
      }
    } catch (err) {
      console.error("Error fetching inventory:", err);
      setInventoryData(MOCK_INVENTORY);
    }
  };

  const handleAction = async (dealId, action) => {
    try {
      message.loading({ content: `Processing ${action}...`, key: 'dealAction' });
      if (action === 'confirm') {
        await apiService.patch(`/deal-records/${dealId}/confirm`);
        message.success({ content: 'Deal confirmed successfully!', key: 'dealAction' });
      } else if (action === 'pay') {
        await apiService.patch(`/deal-records/${dealId}/pay`);
        message.success({ content: 'Deal marked as paid!', key: 'dealAction' });
      }
      
      // Update local state immediately
      setDeals(prev => prev.map(d => {
        if (d._id !== dealId) return d;
        if (action === 'confirm') return { ...d, commissionStatus: 'confirmed', isLocked: true, confirmedAt: new Date().toISOString() };
        if (action === 'pay') return { ...d, commissionStatus: 'paid', paidAt: new Date().toISOString() };
        return d;
      }));
      if (selectedDeal?._id === dealId) {
        setSelectedDeal(prev => {
          if (action === 'confirm') return { ...prev, commissionStatus: 'confirmed', isLocked: true, confirmedAt: new Date().toISOString() };
          if (action === 'pay') return { ...prev, commissionStatus: 'paid', paidAt: new Date().toISOString() };
          return prev;
        });
      }
    } catch (error) {
      console.error(`Failed to ${action} deal:`, error);
      message.error({ content: `Failed to ${action} deal.`, key: 'dealAction' });
    }
  };

  const handleCreate = async (form) => {
    try {
      message.loading({ content: 'Creating deal...', key: 'createDeal' });
      const payload = {
        ...form,
        transactionValue: Number(form.transactionValue)
      };
      const res = await apiService.post('/deal-records', payload);
      message.success({ content: 'Deal created successfully!', key: 'createDeal' });
      
      // Refetch deals to get the latest
      fetchDeals();
    } catch (error) {
      console.error('Error creating deal:', error);
      message.error({ content: 'Failed to create deal.', key: 'createDeal' });
      
      // Fallback for mock environment testing
      const newDeal = {
        _id: `DR-${String(deals.length + 1).padStart(5, '0')}`,
        dealReference: `DR-${String(deals.length + 1).padStart(5, '0')}`,
        dealType: form.dealType,
        transactionValue: Number(form.transactionValue),
        commissionStatus: 'pending',
        property: { propertyName: 'New Property', area: 'Dubai', city: 'Dubai', propertySubType: 'off_plan' },
        customer: { firstName: 'New', lastName: 'Customer', phone: '+971500000000', email: 'new@mail.com' },
        advisor: form.advisorId ? { firstName: 'Advisor', lastName: '', employeeId: form.advisorId } : null,
        agent: null, agency: null, referralPartner: null,
        inventoryUnit: form.inventoryUnitId ? inventoryData.find(u => u._id === form.inventoryUnitId) : null,
        commission: {
          grossPercent: Number(form.grossPercent),
          grossAmount: Math.round(Number(form.transactionValue) * Number(form.grossPercent) / 100),
          partnerPercent: Number(form.partnerPercent),
          partnerShare: Math.round(Number(form.transactionValue) * Number(form.grossPercent) / 100 * Number(form.partnerPercent) / 100),
          referralPercent: Number(form.referralPercent),
          referralShare: Math.round(Number(form.transactionValue) * Number(form.grossPercent) / 100 * Number(form.referralPercent) / 100),
          xotoPercent: Number(form.grossPercent) - Number(form.partnerPercent) - Number(form.referralPercent),
          xotoRetained: Math.round(Number(form.transactionValue) * Number(form.grossPercent) / 100 * (1 - Number(form.partnerPercent) / 100 - Number(form.referralPercent) / 100)),
        },
        evidenceUploaded: false, isLocked: false,
        createdAt: new Date().toISOString(),
        notes: form.notes,
      };
      setDeals(prev => [newDeal, ...prev]);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background-tertiary)', fontFamily: 'var(--font-sans)' }}>
      {showInventory && <InventoryModal onClose={() => setShowInventory(false)} inventoryData={inventoryData} />}
      {showCreate && <CreateDealModal onClose={() => setShowCreate(false)} onCreate={handleCreate} inventoryData={inventoryData} />}
      {selectedDeal && (
        <DealDrawer deal={selectedDeal} onClose={() => setSelectedDeal(null)} onAction={handleAction} />
      )}

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>

        {/* Top header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 500 }}>Deal records</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>Commission ledger · Xoto GRID admin</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowInventory(true)} style={{
              padding: '8px 16px', borderRadius: 'var(--border-radius-md)', border: '0.5px solid var(--color-border-secondary)',
              background: 'var(--color-background-primary)', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: 'var(--color-text-primary)',
            }}>Inventory catalogue</button>
            <button onClick={() => setShowCreate(true)} style={{
              padding: '8px 16px', borderRadius: 'var(--border-radius-md)', border: `1px solid ${C.purple.border}`,
              background: C.purple.bg, cursor: 'pointer', fontSize: 12, fontWeight: 500, color: C.purple.strong,
            }}>+ New deal record</button>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 24 }}>
          <StatCard label="Total transaction value" value={`AED ${(stats.totalValue / 1000000).toFixed(1)}M`} />
          <StatCard label="Gross commission" value={fmtAED(stats.totalGross)} color={C.purple.text} />
          <StatCard label="Xoto retained" value={fmtAED(stats.totalXoto)} color={C.teal.text} />
          <StatCard label="Pending" value={stats.pending} sub="deals awaiting confirmation" color={C.amber.text} />
          <StatCard label="Confirmed" value={stats.confirmed} sub="ready to pay" color={C.purple.text} />
          <StatCard label="Paid" value={stats.paid} sub="commission disbursed" color={C.teal.text} />
        </div>

        {/* Inventory quick stats */}
        <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-lg)', padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', minWidth: 80 }}>Inventory</div>
          {[
            { label: 'Total units', v: invStats.total, c: C.gray },
            { label: 'Available', v: invStats.available, c: C.teal },
            { label: 'Booked', v: invStats.booked, c: C.purple },
            { label: 'SPA signed', v: invStats.spa, c: C.coral },
            { label: 'Hold', v: invStats.hold, c: C.amber },
          ].map(({ label, v, c }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.border }} />
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{label}</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{v}</span>
            </div>
          ))}
          <button onClick={() => setShowInventory(true)} style={{ marginLeft: 'auto', fontSize: 11, padding: '4px 12px', borderRadius: 20, border: '0.5px solid var(--color-border-secondary)', background: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
            View all →
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by ref, property, customer..." style={{ flex: 1, minWidth: 200, padding: '7px 12px', borderRadius: 'var(--border-radius-md)', fontSize: 12 }} />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '7px 10px', borderRadius: 'var(--border-radius-md)', fontSize: 12 }}>
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="paid">Paid</option>
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ padding: '7px 10px', borderRadius: 'var(--border-radius-md)', fontSize: 12 }}>
            <option value="all">Sale + Lease</option>
            <option value="sale">Sale only</option>
            <option value="lease">Lease only</option>
          </select>
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Deal records table */}
        <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ background: 'var(--color-background-secondary)' }}>
                {['Reference', 'Property', 'Customer', 'Type', 'Value', 'Gross comm.', 'Xoto', 'Evidence', 'Status', ''].map((h, i) => (
                  <th key={i} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 500, fontSize: 11, color: 'var(--color-text-secondary)', borderBottom: '0.5px solid var(--color-border-tertiary)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={10} style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 13 }}>No deal records match your filters.</td></tr>
              ) : filtered.map((deal, i) => {
                const sc = statusConfig[deal.commissionStatus];
                const isSelected = selectedDeal?._id === deal._id;
                return (
                  <tr key={deal._id}
                    onClick={() => setSelectedDeal(isSelected ? null : deal)}
                    style={{
                      borderBottom: '0.5px solid var(--color-border-tertiary)',
                      cursor: 'pointer',
                      background: isSelected ? C.purple.bg : i % 2 === 0 ? 'transparent' : 'var(--color-background-secondary)',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--color-background-secondary)'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'var(--color-background-secondary)'; }}
                  >
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-secondary)' }}>{deal.dealReference}</span>
                      {deal.isLocked && <span style={{ marginLeft: 6, fontSize: 10 }}>🔒</span>}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: 500, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{deal.property?.propertyName}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 1 }}>{deal.property?.area}</div>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: 500 }}>{deal.customer.firstName} {deal.customer.lastName}</div>
                      {deal.inventoryUnit && <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginTop: 1 }}>Unit {deal.inventoryUnit.unitNumber}</div>}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <Badge cfg={deal.dealType === 'sale' ? C.purple : C.blue} label={deal.dealType === 'sale' ? 'Sale' : 'Lease'} />
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: 500, whiteSpace: 'nowrap' }}>{fmtAED(deal.transactionValue)}</td>
                    <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                      <div>{fmtAED(deal.commission.grossAmount)}</div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>{deal.commission.grossPercent}% of value</div>
                    </td>
                    <td style={{ padding: '10px 14px', whiteSpace: 'nowrap', color: C.purple.text, fontWeight: 500 }}>{fmtAED(deal.commission.xotoRetained)}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <Badge cfg={deal.evidenceUploaded ? C.green : C.red} label={deal.evidenceUploaded ? '✓ Uploaded' : '✗ Missing'} />
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <Badge cfg={sc.color} label={sc.label} />
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {!deal.evidenceUploaded && deal.commissionStatus === 'pending' && (
                        <button onClick={e => { e.stopPropagation(); alert('Upload evidence flow — attach SPA/booking form.'); }}
                          style={{ fontSize: 10, padding: '3px 8px', borderRadius: 'var(--border-radius-md)', border: `0.5px solid ${C.amber.border}`, background: C.amber.bg, color: C.amber.text, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          Upload docs
                        </button>
                      )}
                      {deal.commissionStatus === 'pending' && deal.evidenceUploaded && (
                        <button onClick={e => { e.stopPropagation(); handleAction(deal._id, 'confirm'); }}
                          style={{ fontSize: 10, padding: '3px 8px', borderRadius: 'var(--border-radius-md)', border: `0.5px solid ${C.purple.border}`, background: C.purple.bg, color: C.purple.strong, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          Confirm
                        </button>
                      )}
                      {deal.commissionStatus === 'confirmed' && (
                        <button onClick={e => { e.stopPropagation(); handleAction(deal._id, 'pay'); }}
                          style={{ fontSize: 10, padding: '3px 8px', borderRadius: 'var(--border-radius-md)', border: `0.5px solid ${C.teal.border}`, background: C.teal.bg, color: C.teal.strong, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          Mark paid
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Table footer summary */}
          {filtered.length > 0 && (
            <div style={{ padding: '10px 14px', borderTop: '0.5px solid var(--color-border-tertiary)', background: 'var(--color-background-secondary)', display: 'flex', gap: 24, fontSize: 11, color: 'var(--color-text-secondary)' }}>
              <span>Filtered total: {fmtAED(filtered.reduce((s, d) => s + d.transactionValue, 0))}</span>
              <span>Gross: {fmtAED(filtered.reduce((s, d) => s + d.commission.grossAmount, 0))}</span>
              <span style={{ color: C.purple.text, fontWeight: 500 }}>Xoto retained: {fmtAED(filtered.reduce((s, d) => s + d.commission.xotoRetained, 0))}</span>
              <span>Partner: {fmtAED(filtered.reduce((s, d) => s + d.commission.partnerShare, 0))}</span>
              <span>Referral: {fmtAED(filtered.reduce((s, d) => s + d.commission.referralShare, 0))}</span>
            </div>
          )}
        </div>

        <div style={{ marginTop: 16, fontSize: 11, color: 'var(--color-text-secondary)', textAlign: 'center' }}>
          Deal records are immutable after confirmation · PRD §8.5 · Xoto GRID V1.0
        </div>
      </div>
    </div>
  );
}