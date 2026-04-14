import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../../manageApi/utils/custom.apiservice';
import { FileText, Loader2, AlertCircle, ChevronRight, Search } from 'lucide-react';

const PURPLE = '#5C039B';

const CreateProposal = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchQualifiedLeads();
  }, []);

  const fetchQualifiedLeads = async () => {
  try {
    setLoading(true);
    // Use the same partner leads endpoint with status filter
    const res = await apiService.get(`/vault/lead/partner/get`, {
      params: {
        status: 'Qualified',
        page: 1,
        limit: 100  // adjust as needed
      }
    });
    // Extract data based on response structure
    let data = res?.data?.leads || res?.data?.data || res?.data || [];
    if (!Array.isArray(data) && data?.docs) data = data.docs;
    setLeads(Array.isArray(data) ? data : []);
  } catch (err) {
    setError('Failed to load qualified leads');
  } finally {
    setLoading(false);
  }
};

  const filteredLeads = leads.filter(lead => {
    const q = search.toLowerCase();
    const name = lead.customerInfo?.fullName?.toLowerCase() || '';
    const email = lead.customerInfo?.email?.toLowerCase() || '';
    return name.includes(q) || email.includes(q);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: PURPLE }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 24px', background: '#F9FAFB', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Create New Proposal</h1>
      <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 24 }}>Select a qualified lead to create a proposal.</p>

      {/* Search */}
      <div style={{ marginBottom: 24, position: 'relative', maxWidth: 400 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
        <input
          type="text"
          placeholder="Search leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 13, outline: 'none' }}
        />
      </div>

      {/* Leads Grid */}
      <div style={{ display: 'grid', gap: 12 }}>
        {filteredLeads.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6B7280', padding: '40px 0' }}>No qualified leads found.</p>
        ) : (
          filteredLeads.map(lead => (
            <div
              key={lead._id}
              style={{
                background: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: 12,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = PURPLE}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#FAF5FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={18} color={PURPLE} />
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0 }}>{lead.customerInfo?.fullName}</p>
                  <p style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 0' }}>{lead.customerInfo?.email}</p>
                  <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>Property: AED {lead.propertyDetails?.propertyValue?.toLocaleString()}</p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/dashboard/xotovaultpartner/proposals/create/${lead._id}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  background: PURPLE,
                  border: 'none',
                  borderRadius: 8,
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Create Proposal <ChevronRight size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CreateProposal;