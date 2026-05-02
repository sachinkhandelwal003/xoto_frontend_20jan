import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from "../../manageApi/utils/custom.apiservice";
import {
  Modal, Button, Tag, Tooltip, Avatar, Radio,
  Spin, Empty, message, Drawer, Descriptions, Badge
} from 'antd';
import {
  UserAddOutlined, EyeOutlined, CheckCircleFilled,
  StarFilled, ThunderboltOutlined, ReloadOutlined,
  EnvironmentOutlined, ApartmentOutlined, UserOutlined,
  ClockCircleOutlined, FireOutlined, HomeOutlined,
  LinkOutlined, PictureOutlined
} from '@ant-design/icons';
import CustomTable from '../../components/CMS/pages/custom/CustomTable';

// ─── Constants ────────────────────────────────────────────────────────────────
const PRIMARY = '#5c039b';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const TYPE_COLORS = {
  buy:            { bg: '#ede9fe', color: '#5b21b6', label: 'Buy' },
  sell:           { bg: '#fce7f3', color: '#9d174d', label: 'Sell' },
  rent:           { bg: '#dbeafe', color: '#1e40af', label: 'Rent' },
  mortgage:       { bg: '#dcfce7', color: '#166534', label: 'Mortgage' },
  consultation:   { bg: '#fef3c7', color: '#92400e', label: 'Consultation' },
  enquiry:        { bg: '#f3f4f6', color: '#374151', label: 'Enquiry' },
  schedule_visit: { bg: '#e0f2fe', color: '#075985', label: 'Site Visit' },
  hot_property:   { bg: '#fee2e2', color: '#dc2626', label: 'Hot Property' },
  partner:        { bg: '#f5f3ff', color: '#4c1d95', label: 'Partner' },
  investor:       { bg: '#fff7ed', color: '#9a3412', label: 'Investor' },
  developer:      { bg: '#f0fdf4', color: '#14532d', label: 'Developer' },
  ai_enquiry:     { bg: '#fdf4ff', color: '#701a75', label: 'AI Enquiry' },
};

const STATUS_COLORS = {
  new:       { color: 'blue',    label: 'New' },
  submit:    { color: 'blue',    label: 'New' },
  contacted: { color: 'orange',  label: 'Contacted' },
  converted: { color: 'green',   label: 'Converted' },
  dead:      { color: 'red',     label: 'Dead' },
};

const TypeTag = ({ type }) => {
  const t = TYPE_COLORS[type] || { bg: '#f3f4f6', color: '#374151', label: type };
  return (
    <span style={{
      background: t.bg, color: t.color,
      padding: '2px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap'
    }}>
      {t.label}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const s = STATUS_COLORS[status] || { color: 'default', label: status };
  return <Tag color={s.color} style={{ borderRadius: 20, fontSize: 11 }}>{s.label}</Tag>;
};

const AdvisorChip = ({ advisor }) => {
  if (!advisor) return <span style={{ color: '#9ca3af', fontSize: 12 }}>— Unassigned</span>;
  const initials = `${advisor.firstName?.[0] || ''}${advisor.lastName?.[0] || ''}`.toUpperCase();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <Avatar size={24} style={{ background: PRIMARY, fontSize: 10, fontWeight: 700 }}>{initials}</Avatar>
      <span style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>
        {advisor.firstName} {advisor.lastName}
      </span>
    </div>
  );
};

// ─── Property Source Card ─────────────────────────────────────────────────────
// Shows which property/listing this lead came from
// NOTE: Backend does .populate('source.listing_id') so listingId can be:
//   - null          → no property linked
//   - string/object id  → not populated (shouldn't happen but handle it)
//   - full object   → populated Property document ✅

const PropertySourceCard = ({ listingId, matchedListings = [] }) => {
  const [listing, setListing]   = useState(null);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    // ✅ CASE 1: listingId is already a populated object from backend populate()
    if (listingId && typeof listingId === 'object' && listingId._id) {
      setListing(listingId);
      return;
    }

    // ✅ CASE 2: matched_listings array has populated data
    if (matchedListings?.length > 0) {
      const first = matchedListings[0];
      // matched_listings items have shape { listing_id: {...}, match_score, ... }
      setListing(first?.listing_id || first);
      return;
    }

    // ✅ CASE 3: listingId is a plain string ID — fetch it
    if (listingId && typeof listingId === 'string') {
      fetchListing(listingId);
    }
  }, [listingId, matchedListings]);

  const fetchListing = async (id) => {
    setLoading(true);
    try {
      const res = await apiService.get(`/property/listing/${id}`);
      const data = res?.data || res;
      setListing(data);
    } catch {
      // silently fail — listing may not exist or different API path
    } finally {
      setLoading(false);
    }
  };

  // ── Resolve the raw listing_id for display ──
  // listingId could be object (populated) or string
  const rawId = listingId
    ? (typeof listingId === 'object' ? listingId._id || listingId.id : listingId)
    : null;

  // No listing linked at all
  if (!rawId && (!matchedListings || matchedListings.length === 0)) {
    return (
      <div style={{
        background: '#f9fafb',
        border: '1px dashed #d1d5db',
        borderRadius: 10,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        color: '#9ca3af',
        fontSize: 12,
      }}>
        <HomeOutlined style={{ fontSize: 16 }} />
        <div>
          <div style={{ fontWeight: 600, color: '#6b7280' }}>No Property Linked</div>
          <div>This lead was submitted as a general enquiry without a specific property.</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <Spin size="small" tip="Loading property details..." />
      </div>
    );
  }

  // listing_id exists but fetch didn't return details (or still null)
  if (!listing && rawId) {
    return (
      <div style={{
        background: '#fffbeb',
        border: '1px solid #fde68a',
        borderRadius: 10,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <LinkOutlined style={{ color: '#d97706', fontSize: 16 }} />
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#92400e' }}>Property ID Linked</div>
          <div style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace', marginTop: 2 }}>
            {String(rawId)}
          </div>
        </div>
      </div>
    );
  }

  // Full listing details available
  if (listing) {
    // ✅ Map fields from your Property model (propertyName, photos, builtUpArea etc.)
    const title    = listing.propertyName || listing.title || listing.name || 'Property Listing';
    const area     = listing.area && listing.city
                       ? `${listing.area}, ${listing.city}`
                       : listing.area || listing.city || '—';
    const price    = listing.price
                       ? `${listing.currency || 'AED'} ${Number(listing.price).toLocaleString()}`
                       : listing.asking_price || null;
    const propType = listing.propertySubType || listing.propertyType || listing.property_type || listing.type;
    const thumbnail = listing.photos?.architecture?.[0]
                   || listing.photos?.interior?.[0]
                   || listing.photos?.other?.[0]
                   || listing.mainLogo
                   || null;
    const beds     = listing.bedrooms || listing.beds;
    const builtUp  = listing.builtUpArea
                       ? `${listing.builtUpArea} ${listing.builtUpAreaUnit || 'sqft'}`
                       : listing.area_sqft || null;

    return (
      <div style={{
        background: '#faf5ff',
        border: '1px solid #ede9fe',
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        {/* Header strip */}
        <div style={{
          background: PRIMARY,
          padding: '6px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <HomeOutlined style={{ color: '#fff', fontSize: 13 }} />
          <span style={{ color: '#fff', fontSize: 11, fontWeight: 600, letterSpacing: 0.5 }}>
            ENQUIRY PROPERTY
          </span>
        </div>

        <div style={{ padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          {/* Thumbnail */}
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              style={{ width: 70, height: 60, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
            />
          ) : (
            <div style={{
              width: 70, height: 60, borderRadius: 8, background: '#ede9fe',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <PictureOutlined style={{ color: PRIMARY, fontSize: 22 }} />
            </div>
          )}

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#111827', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {title}
            </div>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
              <EnvironmentOutlined /> {area}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {propType && (
                <span style={{ background: '#ede9fe', color: PRIMARY, fontSize: 10, padding: '1px 8px', borderRadius: 20, fontWeight: 600 }}>
                  {propType}
                </span>
              )}
              {beds && (
                <span style={{ background: '#f3f4f6', color: '#374151', fontSize: 10, padding: '1px 8px', borderRadius: 20 }}>
                  {beds} BHK
                </span>
              )}
              {builtUp && (
                <span style={{ background: '#f3f4f6', color: '#374151', fontSize: 10, padding: '1px 8px', borderRadius: 20 }}>
                  {builtUp}
                </span>
              )}
              {price && (
                <span style={{ background: '#dcfce7', color: '#166534', fontSize: 10, padding: '1px 8px', borderRadius: 20, fontWeight: 600 }}>
                  {price}
                </span>
              )}
            </div>
          </div>
        </div>

      
      </div>
    );
  }

  return null;
};

// ─── Property Source Chip (for table column) ──────────────────────────────────
const PropertySourceChip = ({ listingId, matchedListings = [] }) => {
  // listingId can be null, string ID, or populated object
  const hasListing = listingId || matchedListings?.length > 0;
  if (!hasListing) {
    return <span style={{ fontSize: 11, color: '#9ca3af' }}>— General</span>;
  }

  // Resolve display name and ID
  const isPopulated = listingId && typeof listingId === 'object';
  const propertyName = isPopulated
    ? (listingId.propertyName || listingId.title || listingId.name || null)
    : null;
  const id = isPopulated
    ? (listingId._id || listingId.id)
    : (typeof listingId === 'string' ? listingId : matchedListings[0]?._id);

  return (
    <Tooltip title={`Listing ID: ${id}`}>
      <span style={{
        background: '#ede9fe', color: PRIMARY,
        padding: '2px 8px', borderRadius: 20,
        fontSize: 11, fontWeight: 600,
        display: 'inline-flex', alignItems: 'center', gap: 4,
        cursor: 'default', maxWidth: 120, overflow: 'hidden',
        textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        <HomeOutlined style={{ fontSize: 10, flexShrink: 0 }} />
        {propertyName || 'Linked'}
      </span>
    </Tooltip>
  );
};

// ─── Assign Advisor Modal ─────────────────────────────────────────────────────
const AssignModal = ({ lead, visible, onClose, onAssigned }) => {
  const [loading,     setLoading]     = useState(false);
  const [assigning,   setAssigning]   = useState(false);
  const [recommended, setRecommended] = useState(null);
  const [options,     setOptions]     = useState([]);
  const [selectedId,  setSelectedId]  = useState(null);
  const [notes,       setNotes]       = useState('');

  useEffect(() => {
    if (visible && lead) {
      fetchSuggestions();
      setSelectedId(lead.assigned_to || null);
      setNotes('');
    }
  }, [visible, lead]);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const res = await apiService.get(`/property/lead/${lead._id}/suggest-advisors`);
      const resData = res?.data || res;
      setRecommended(resData?.recommended || null);
      setOptions(resData?.options || []);
      if (resData?.recommended && !lead.assigned_to) {
        setSelectedId(resData.recommended._id);
      }
    } catch {
      message.error('Could not fetch advisor suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedId) return message.warning('Please select an advisor');
    setAssigning(true);
    try {
      await apiService.put(`/property/lead/${lead._id}/assign`, { advisorId: selectedId, notes });
      message.success('Advisor assigned successfully');
      onAssigned();
      onClose();
    } catch (err) {
      message.error(err?.response?.data?.message || 'Assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  const scoreBar = (score = 0) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 60, height: 5, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(score, 100)}%`, height: '100%', background: PRIMARY, borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: 11, color: '#6b7280' }}>{score}</span>
    </div>
  );

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserAddOutlined style={{ color: PRIMARY, fontSize: 16 }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>Assign Advisor</div>
            <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 400 }}>
              {lead?.contact_info?.name?.first_name} {lead?.contact_info?.name?.last_name}
            </div>
          </div>
        </div>
      }
      footer={null}
      width={560}
      styles={{ body: { padding: '0 24px 24px' } }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin tip="Finding best advisors..." />
        </div>
      ) : (
        <>
          <div style={{ background: '#faf5ff', border: '1px solid #ede9fe', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, color: '#4b5563' }}>
            <span><EnvironmentOutlined style={{ marginRight: 4, color: PRIMARY }} />{lead?.requirements?.location_preferences?.join(', ') || '—'}</span>
            <span><ApartmentOutlined style={{ marginRight: 4, color: PRIMARY }} />{lead?.enquiry_type || '—'}</span>
          </div>

          {recommended && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <ThunderboltOutlined style={{ color: '#16a34a', fontSize: 18 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: '#15803d', fontWeight: 600, marginBottom: 2 }}>SYSTEM RECOMMENDED</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{recommended.firstName} {recommended.lastName}</div>
              </div>
              <CheckCircleFilled style={{ color: '#16a34a', fontSize: 20 }} />
            </div>
          )}

          <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Select Advisor</div>
          <Radio.Group value={selectedId} onChange={e => setSelectedId(e.target.value)} style={{ width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
              {options.length === 0 && <Empty description="No active advisors found" image={Empty.PRESENTED_IMAGE_SIMPLE} />}
              {options.map(adv => {
                const initials = `${adv.firstName?.[0] || ''}${adv.lastName?.[0] || ''}`.toUpperCase();
                const isRec = recommended?._id === adv._id;
                const isSel = selectedId === adv._id;
                return (
                  <Radio key={adv._id} value={adv._id} style={{ margin: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${isSel ? PRIMARY : '#e5e7eb'}`, background: isSel ? '#faf5ff' : '#fff', cursor: 'pointer', transition: 'all 0.15s', width: 440 }}>
                      <Avatar style={{ background: PRIMARY, fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{initials}</Avatar>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{adv.firstName} {adv.lastName}</span>
                          {isRec && <span style={{ background: '#dcfce7', color: '#166534', fontSize: 10, padding: '1px 7px', borderRadius: 20, fontWeight: 600 }}>Recommended</span>}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}><StarFilled style={{ color: '#f59e0b', marginRight: 3 }} />Score</div>
                        {scoreBar(adv.leaderboard?.compositeScore)}
                      </div>
                    </div>
                  </Radio>
                );
              })}
            </div>
          </Radio.Group>

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Assignment Notes <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span></div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add any context for the advisor..." rows={2} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 13, resize: 'none', outline: 'none', fontFamily: 'inherit', color: '#374151', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" loading={assigning} disabled={!selectedId} onClick={handleAssign} style={{ background: PRIMARY, borderColor: PRIMARY, fontWeight: 600 }}>Assign Advisor</Button>
          </div>
        </>
      )}
    </Modal>
  );
};

// ─── Lead Detail Drawer ───────────────────────────────────────────────────────
const LeadDetailDrawer = ({ lead, visible, onClose }) => {
  if (!lead) return null;

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <EyeOutlined style={{ color: PRIMARY }} />
          <span>Lead Details</span>
        </div>
      }
      open={visible}
      onClose={onClose}
      width={500}
    >
      {/* ── Property Source Section (NEW) ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{
          fontSize: 12, fontWeight: 700, color: '#374151',
          marginBottom: 10, textTransform: 'uppercase',
          letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <HomeOutlined style={{ color: PRIMARY }} />
          Property Source
        </div>
        <PropertySourceCard
          listingId={lead.source?.listing_id}
          matchedListings={lead.matched_listings}
        />
      </div>

      {/* ── Contact & Lead Info ── */}
      <div style={{ marginBottom: 8, fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        Lead Information
      </div>
      <Descriptions column={1} bordered size="small" labelStyle={{ fontWeight: 600, fontSize: 12 }}>
        <Descriptions.Item label="Name">
          {lead.contact_info?.name?.first_name} {lead.contact_info?.name?.last_name}
        </Descriptions.Item>
        <Descriptions.Item label="Mobile">
          {lead.contact_info?.mobile?.country_code} {lead.contact_info?.mobile?.number}
        </Descriptions.Item>
        <Descriptions.Item label="Email">
          {lead.contact_info?.email?.address || '—'}
        </Descriptions.Item>
        <Descriptions.Item label="Type">
          <TypeTag type={lead.enquiry_type} />
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <StatusBadge status={lead.status} />
        </Descriptions.Item>
        <Descriptions.Item label="Classification">
          {lead.classification || '—'}
        </Descriptions.Item>
        <Descriptions.Item label="Source">
          {lead.source?.channel || '—'}
          {lead.source?.referrer_url && (
            <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 6 }}>
              ({lead.source.referrer_url})
            </span>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Assigned Advisor">
          <AdvisorChip advisor={lead.assignedAdvisor} />
        </Descriptions.Item>
        <Descriptions.Item label="Created">
          {new Date(lead.createdAt).toLocaleString()}
        </Descriptions.Item>
        {lead.message && (
          <Descriptions.Item label="Message">{lead.message}</Descriptions.Item>
        )}
      </Descriptions>

      {/* ── Matched Listings (if multiple) ── */}
      {lead.matched_listings?.length > 1 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 10, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Other Matched Listings ({lead.matched_listings.length})
          </div>
          {lead.matched_listings.slice(1).map((ml, i) => (
            <div key={i} style={{
              background: '#f9fafb', border: '1px solid #e5e7eb',
              borderRadius: 8, padding: '8px 12px', marginBottom: 8,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <HomeOutlined style={{ color: '#9ca3af' }} />
              <span style={{ fontSize: 12, color: '#374151', fontFamily: 'monospace' }}>
                {ml._id || ml.id || ml}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Internal Notes ── */}
      {lead.notes?.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 10, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Internal Notes
          </div>
          {lead.notes.map((n, i) => (
            <div key={i} style={{ background: '#faf5ff', border: '1px solid #ede9fe', borderRadius: 8, padding: '8px 12px', marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: '#374151' }}>{n.text}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                {new Date(n.createdAt).toLocaleString()}{n.author && ` · ${n.author}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </Drawer>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const AllLeadsPage = () => {
  const [leads,      setLeads]      = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [assignLead, setAssignLead] = useState(null);
  const [viewLead,   setViewLead]   = useState(null);
  const [filters,    setFilters]    = useState({});
  const [stats,      setStats]      = useState({ total: 0, unassigned: 0, converted: 0, hot: 0 });

  const fetchLeads = useCallback(async (extraFilters = {}, page = 1, limit = 10) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.set('page',  page);
      query.set('limit', limit);
      if (extraFilters.search) query.set('search', extraFilters.search);
      if (extraFilters.status) query.set('status', extraFilters.status);
      if (extraFilters.type)   query.set('type',   extraFilters.type);

      const res = await apiService.get(`/gridlead?${query.toString()}`);

      const leadsData      = res?.data        || [];
      const paginationData = res?.pagination  || {};

      setLeads(leadsData);
      setPagination({
        page:       paginationData.page       || page,
        limit:      paginationData.limit      || limit,
        total:      paginationData.total      || leadsData.length,
        totalPages: paginationData.totalPages || 1,
      });

      setStats({
        total:      leadsData.length,
        unassigned: leadsData.filter(l => !l.assigned_to).length,
        converted:  leadsData.filter(l => l.status === 'converted').length,
        hot:        leadsData.filter(l => l.status === 'new' && !l.assigned_to).length,
      });

    } catch (err) {
      console.error('fetchLeads error:', err);
      message.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, []);

  const handlePageChange = (page, limit) => {
    fetchLeads(filters, page, limit);
  };

  const handleFilter = (newFilters) => {
    const merged = { ...filters, ...newFilters };
    setFilters(merged);
    fetchLeads(merged, 1, pagination.limit);
  };

  // ── Columns ──────────────────────────────────────────────────────────────────
  const columns = [
    {
      title: 'Name',
      key: 'full_name',
      sortable: true,
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>
            {row.contact_info?.name?.first_name} {row.contact_info?.name?.last_name}
          </div>
          <div style={{ fontSize: 11, color: '#6b7280' }}>
            {row.contact_info?.mobile?.country_code} {row.contact_info?.mobile?.number}
          </div>
        </div>
      )
    },
    {
      title: 'Type',
      key: 'enquiry_type',
      filterable: true,
      filterKey: 'type',
      filterOptions: Object.entries(TYPE_COLORS).map(([k, v]) => ({ value: k, label: v.label })),
      render: (_, row) => <TypeTag type={row.enquiry_type} />
    },
    {
      title: 'Status',
      key: 'status',
      filterable: true,
      filterKey: 'status',
      filterOptions: Object.entries(STATUS_COLORS).map(([k, v]) => ({ value: k, label: v.label })),
      render: (val) => <StatusBadge status={val} />
    },
    {
      title: 'Classification',
      key: 'classification',
      render: (val) => (
        <Tag
          color={val === 'hot' ? 'red' : val === 'warm' ? 'orange' : 'blue'}
          style={{ borderRadius: 20, fontSize: 11, textTransform: 'capitalize' }}
        >
          {val || '—'}
        </Tag>
      )
    },
    // ── NEW: Property Source Column ──────────────────────────────────────────
    {
      title: 'Property',
      key: 'source',
      render: (val, row) => (
        <PropertySourceChip
          listingId={row.source?.listing_id}
          matchedListings={row.matched_listings}
        />
      )
    },
    {
      title: 'Source',
      key: 'source_channel',
      render: (val, row) => (
        <span style={{ fontSize: 12, color: '#6b7280' }}>
          {row.source?.channel?.replace(/_/g, ' ') || '—'}
        </span>
      )
    },
    {
      title: 'Assigned Advisor',
      key: 'assignedAdvisor',
      render: (val, row) => <AdvisorChip advisor={row.assignedAdvisor || null} />
    },
    {
      title: 'Created',
      key: 'createdAt',
      sortable: true,
      render: (val) => (
        <span style={{ fontSize: 12, color: '#6b7280' }}>
          {val ? new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
        </span>
      )
    },
    {
      title: 'Actions',
      key: '_id',
      render: (val, row) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <Tooltip title="View Details">
            <Button size="small" icon={<EyeOutlined />} onClick={() => setViewLead(row)} style={{ borderColor: '#e5e7eb' }} />
          </Tooltip>
          <Tooltip title={row.assigned_to ? 'Reassign Advisor' : 'Assign Advisor'}>
            <Button
              size="small"
              icon={<UserAddOutlined />}
              onClick={() => setAssignLead(row)}
              style={{
                background: row.assigned_to ? '#fff' : PRIMARY,
                borderColor: PRIMARY,
                color: row.assigned_to ? PRIMARY : '#fff',
                fontWeight: 600
              }}
            >
              {row.assigned_to ? 'Reassign' : 'Assign'}
            </Button>
          </Tooltip>
        </div>
      )
    },
  ];

  const statCards = [
    { label: 'Total Leads',  value: stats.total,      bg: '#faf5ff', color: PRIMARY,   icon: <ApartmentOutlined /> },
    { label: 'Unassigned',   value: stats.unassigned, bg: '#fff7ed', color: '#c2410c', icon: <UserOutlined /> },
    { label: 'Needs Action', value: stats.hot,        bg: '#fef2f2', color: '#b91c1c', icon: <FireOutlined /> },
    { label: 'Converted',    value: stats.converted,  bg: '#f0fdf4', color: '#16a34a', icon: <CheckCircleFilled /> },
  ];

  return (
    <div style={{ padding: '28px 32px', background: '#faf5ff', minHeight: '100vh' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: PRIMARY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserAddOutlined style={{ color: '#fff', fontSize: 16 }} />
            </div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#111827' }}>Lead Management</h1>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Assign advisors to leads based on location & specialization</p>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => fetchLeads(filters, pagination.page, pagination.limit)}
          style={{ borderColor: PRIMARY, color: PRIMARY }}
        >
          Refresh
        </Button>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        {statCards.map((s, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #ede9fe', borderRadius: 12, padding: '16px 18px', boxShadow: '0 1px 4px rgba(92,3,155,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{s.label}</span>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{s.icon}</div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <CustomTable
        columns={columns}
        data={leads}
        loading={loading}
        totalItems={pagination.total}
        currentPage={pagination.page}
        itemsPerPage={pagination.limit}
        onPageChange={handlePageChange}
        onFilter={handleFilter}
        showSearch
      />

      <AssignModal
        lead={assignLead}
        visible={!!assignLead}
        onClose={() => setAssignLead(null)}
        onAssigned={() => fetchLeads(filters, pagination.page, pagination.limit)}
      />
      <LeadDetailDrawer
        lead={viewLead}
        visible={!!viewLead}
        onClose={() => setViewLead(null)}
      />
    </div>
  );
};

export default AllLeadsPage;