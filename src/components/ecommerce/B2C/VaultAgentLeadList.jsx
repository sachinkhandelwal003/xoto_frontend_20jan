import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Button, Tag, message, Progress, Space } from 'antd';
import { EyeOutlined, CheckCircleOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../../manageApi/utils/custom.apiservice';
import CustomTable from '../../../components/CMS/pages/custom/CustomTable';

const STATUS_COLORS = {
  'New': 'blue',
  'Contacted': 'orange',
  'Qualified': 'purple',
  'Collecting Documentation': 'green',
  'Disbursed': 'cyan',
};

const STATUSES = ['New', 'Contacted', 'Qualified', 'Collecting Documentation', 'Disbursed'];

const fmt = (n) => (n ? Number(n).toLocaleString('en-AE') : '—');
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB') : '—');

const VaultAgentLeadList = () => {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [activeFilters, setActiveFilters] = useState({});

  // Fetch Leads
  const fetchLeads = useCallback(async (page = currentPage, limit = itemsPerPage, filters = activeFilters) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit });
      if (filters.status) params.set('status', filters.status);
      if (filters.search) params.set('search', filters.search);

      const res = await apiService.get(`/vault/lead/admin/all?${params.toString()}`);

      const list = Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : [];
      const total = res?.data?.total || res?.data?.totalItems || res?.data?.count || list.length;

      setData(list);
      setTotalItems(total);
    } catch (err) {
      message.error('Failed to load vault leads.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, activeFilters]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setItemsPerPage(size);
    fetchLeads(page, size, activeFilters);
  };

  const handleFilter = (filters) => {
    const cleaned = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined)
    );
    setActiveFilters(cleaned);
    setCurrentPage(1);
    fetchLeads(1, itemsPerPage, cleaned);
  };

  const applyStatusFilter = (status) => {
    const f = status ? { status } : {};
    setActiveFilters(f);
    setCurrentPage(1);
    fetchLeads(1, itemsPerPage, f);
  };

  const clearFilters = () => {
    setActiveFilters({});
    setCurrentPage(1);
    fetchLeads(1, itemsPerPage, {});
  };

  // Navigation Handlers
  const handleViewDetail = (_id) => {
    if (_id) {
      navigate(`/dashboard/vaultagentlead-admin-detail/vault/lead/${_id}`);
    } else {
      message.warning('Lead ID not available');
    }
  };

  const handleUploadDocuments = (leadId) => {
    if (!leadId) {
      message.warning('Lead ID not available');
      return;
    }
    navigate(`/dashboard/vaultagent/vault/lead/documents/${leadId}`);
  };

  // Columns
  const columns = [
    {
      key: 'customerInfo',
      title: 'Client',
      render: (_, record) => {
        const ci = record?.customerInfo || {};
        return (
          <div>
            <div className="font-medium text-gray-900">{ci.fullName || '—'}</div>
            {ci.email && <div className="text-sm text-gray-600 mt-0.5">{ci.email}</div>}
            {ci.mobileNumber && <div className="text-sm text-gray-600">{ci.mobileNumber}</div>}
          </div>
        );
      },
    },
    {
      key: 'propertyDetails',
      title: 'Property',
      render: (_, record) => {
        const pd = record?.propertyDetails || {};
        const addr = [pd.propertyAddress?.building, pd.propertyAddress?.area, pd.propertyAddress?.city]
          .filter(Boolean).join(', ');

        return (
          <div>
            <div className="text-gray-700">
              {pd.propertyType || '—'} • {pd.propertySubtype || '—'}
            </div>
            {addr && <div className="text-sm text-gray-500 mt-1">{addr}</div>}
          </div>
        );
      },
    },
    {
      key: 'loanAmountRequired',
      title: 'Loan Amount',
      render: (_, record) => {
        const amt = record?.propertyDetails?.loanAmountRequired;
        return amt ? <span className="font-medium text-emerald-700">AED {fmt(amt)}</span> : '—';
      },
    },
    {
      key: 'referralType',
      title: 'Referral Type',
      render: (_, record) => {
        const type = record?.referralType || '—';
        let color = 'default';
        if (type.toLowerCase().includes('referral only')) color = 'green';
        if (type.toLowerCase().includes('referral + docs')) color = 'purple';
        
        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      key: 'currentStatus',
      title: 'Status',
      filterable: true,
      filterKey: 'status',
      filterOptions: STATUSES.map(s => ({ label: s, value: s })),
      render: (_, record) => {
        const val = record?.currentStatus;
        return val ? <Tag color={STATUS_COLORS[val] || 'default'} className="font-medium">{val}</Tag> : '—';
      },
    },
    // {
    //   key: 'documentCollection',
    //   title: 'Documents',
    //   render: (_, record) => {
    //     const dc = record?.documentCollection || {};
    //     const pct = dc.collectionPercentage || 0;
    //     return (
    //       <div className="min-w-[130px]">
    //         <div className="text-sm text-gray-600 mb-2">
    //           {dc.documentsUploaded || 0} / {dc.totalDocumentsRequired || 7}
    //           {dc.readyForSubmission && <CheckCircleOutlined className="ml-2 text-emerald-600" />}
    //         </div>
    //         <Progress percent={pct} size="small" showInfo={false} strokeColor={pct === 100 ? '#10b981' : '#6366f1'} />
    //       </div>
    //     );
    //   },
    // },
    // {
    //   key: 'expectedCommission',
    //   title: 'Est. Commission',
    //   render: (_, record) => {
    //     const comm = record?.expectedCommission;
    //     return comm ? (
    //       <div>
    //         <div className="font-medium text-violet-700">AED {fmt(comm)}</div>
    //         <div className="text-xs text-gray-500">{record.commissionTier}% tier</div>
    //       </div>
    //     ) : '—';
    //   },
    // },
    {
      key: 'sourceInfo',
      title: 'Agent',
      render: (_, record) => {
        const si = record?.sourceInfo || {};
        return si.createdByName ? (
          <div>
            <div className="text-gray-800">{si.createdByName}</div>
            {si.createdByRole && <div className="text-sm text-gray-500 capitalize">{si.createdByRole.replace(/_/g, ' ')}</div>}
          </div>
        ) : '—';
      },
    },
    // {
    //   key: 'createdAt',
    //   title: 'Date',
    //   render: (_, record) => (
    //     <div className="text-gray-700">
    //       <div>{fmtDate(record?.createdAt)}</div>
    //       {record?.leadId && <div className="text-xs text-gray-400 mt-1 font-mono">{record.leadId}</div>}
    //     </div>
    //   ),
    // },
    {
      key: 'actions',
      title: 'Actions',
      align: 'center',
      render: (_, record) => {
        const referralType = (record?.referralType || '').trim().toLowerCase();
        const leadId = record?._id || record?.leadId;

        // ✅ Sirf "Referral Only" ya "Referral" type ke liye "Add Documents" button dikhaye
        const showUploadButton = 
          referralType === 'referral' || 
          referralType === 'referral only' ||
          referralType.includes('referral only');

        return (
          <Space>
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(leadId)}
              className="text-indigo-600 hover:text-indigo-700"
            >
              View
            </Button>

            {showUploadButton && (
              <Button
                type="primary"
                icon={<UploadOutlined />}
                size="small"
                onClick={() => handleUploadDocuments(leadId)}
                style={{
                  background: '#5c039c',
                  borderColor: '#5c039c',
                }}
              >
                Add Documents
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div className="p-6 lg:p-10 bg-gray-50 min-h-screen">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Vault Leads</h1>
          <p className="text-gray-500 text-sm mt-1">Mortgage pipeline management</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <Tag
              key={s}
              color={activeFilters.status === s ? STATUS_COLORS[s] : undefined}
              style={{ cursor: 'pointer', fontWeight: 500, padding: '6px 14px' }}
              onClick={() => applyStatusFilter(s)}
            >
              {s}
            </Tag>
          ))}
          {activeFilters.status && (
            <Tag style={{ cursor: 'pointer', padding: '6px 14px' }} onClick={clearFilters}>
              Clear ✕
            </Tag>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {[
          { label: 'Total Leads', value: totalItems, sub: 'in pipeline' },
          { label: 'Docs Ready', value: `${data.filter(r => r.documentCollection?.readyForSubmission).length}/${data.length}`, sub: 'ready for submission' },
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500">{item.label}</div>
            <div className="text-2xl font-semibold text-gray-900 mt-2">{item.value}</div>
            <div className="text-xs text-gray-500 mt-1">{item.sub}</div>
          </div>
        ))}
      </div>

      <CustomTable
        columns={columns}
        data={data}
        loading={loading}
        totalItems={totalItems}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onFilter={handleFilter}
        showSearch={true}
      />
    </div>
  );
};

export default VaultAgentLeadList;