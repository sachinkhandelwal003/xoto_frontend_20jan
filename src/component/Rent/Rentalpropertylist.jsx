import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Tag, Tooltip, Modal, message, Image } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { apiService } from '../../manageApi/utils/custom.apiservice';
import CustomTable from '../../components/CMS/pages/custom/CustomTable'; // adjust path as needed

const THEME = { primary: '#7c3aed' };

const FURNISHING_COLORS = {
  'Fully Furnished': 'green',
  'Semi Furnished': 'blue',
  Unfurnished: 'default',
};

const TYPE_COLORS = {
  Apartment: 'purple',
  Villa: 'gold',
  Penthouse: 'magenta',
  Townhouse: 'cyan',
  Studio: 'orange',
};

const RentalPropertyList = () => {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeFilters, setActiveFilters] = useState({});

  // Delete confirm modal
  const [deleteModal, setDeleteModal] = useState({ open: false, record: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ================= FETCH =================
  const fetchProperties = useCallback(
    async (page = currentPage, limit = itemsPerPage, filters = activeFilters) => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page,
          limit,
          ...(filters.search ? { search: filters.search } : {}),
          ...(filters.type ? { type: filters.type } : {}),
          ...(filters.furnishing ? { furnishing: filters.furnishing } : {}),
          ...(filters.emirate ? { emirate: filters.emirate } : {}),
        });

        const res = await apiService.get(`/rental/property/search?${params.toString()}`);
        const list = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
          ? res.data
          : [];
        const total =
          res?.data?.total ||
          res?.data?.totalItems ||
          res?.data?.count ||
          list.length;

        setData(list);
        setTotalItems(total);
      } catch (err) {
        message.error('Failed to load rental properties.');
      } finally {
        setLoading(false);
      }
    },
    [currentPage, itemsPerPage, activeFilters]
  );

  useEffect(() => {
    fetchProperties(currentPage, itemsPerPage, activeFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ================= HANDLERS =================
  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setItemsPerPage(size);
    fetchProperties(page, size, activeFilters);
  };

  const handleFilter = (filters) => {
    const cleaned = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined)
    );
    setActiveFilters(cleaned);
    setCurrentPage(1);
    fetchProperties(1, itemsPerPage, cleaned);
  };

  const handleDelete = async () => {
    if (!deleteModal.record) return;
    try {
      setDeleteLoading(true);
      await apiService.delete(`/rental/property/${deleteModal.record._id}`);
      message.success(`"${deleteModal.record.title}" deleted successfully.`);
      setDeleteModal({ open: false, record: null });
      fetchProperties(currentPage, itemsPerPage, activeFilters);
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to delete property.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ================= COLUMNS =================
  const columns = [
    {
      key: 'image',
      title: 'Image',
      sortable: false,
      render: (_, record) => {
        const src = record.images?.[0];
        return src ? (
          <Image
            src={src}
            alt={record.title}
            width={56}
            height={44}
            style={{ objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e7eb' }}
            preview={{ mask: <EyeOutlined style={{ fontSize: 12 }} /> }}
          />
        ) : (
          <div
            style={{
              width: 56,
              height: 44,
              borderRadius: 6,
              background: '#ede9fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #ddd6fe',
            }}
          >
            <HomeOutlined style={{ color: THEME.primary, fontSize: 18 }} />
          </div>
        );
      },
    },
    {
      key: 'title',
      title: 'Title',
      sortable: true,
      render: (val, record) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#111827', maxWidth: 220 }}
            className="truncate">
            {val}
          </div>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
            {record.location?.area && `${record.location.area}, `}
            {record.emirate}
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      title: 'Type',
      sortable: true,
      filterable: true,
      filterKey: 'type',
      filterOptions: [
        { label: 'Apartment', value: 'Apartment' },
        { label: 'Villa', value: 'Villa' },
        { label: 'Penthouse', value: 'Penthouse' },
        { label: 'Townhouse', value: 'Townhouse' },
        { label: 'Studio', value: 'Studio' },
      ],
      render: (val) =>
        val ? (
          <Tag color={TYPE_COLORS[val] || 'default'} style={{ fontWeight: 500 }}>
            {val}
          </Tag>
        ) : '—',
    },
    {
      key: 'bhk',
      title: 'BHK',
      sortable: false,
      render: (val) => val || '—',
    },
    {
      key: 'price',
      title: 'Annual Rent',
      sortable: true,
      render: (val) =>
        val ? (
          <span style={{ fontWeight: 600, color: '#059669' }}>
            AED {Number(val).toLocaleString()}
          </span>
        ) : '—',
    },
    {
      key: 'furnishing',
      title: 'Furnishing',
      sortable: true,
      filterable: true,
      filterKey: 'furnishing',
      filterOptions: [
        { label: 'Fully Furnished', value: 'Fully Furnished' },
        { label: 'Semi Furnished', value: 'Semi Furnished' },
        { label: 'Unfurnished', value: 'Unfurnished' },
      ],
      render: (val) =>
        val ? (
          <Tag color={FURNISHING_COLORS[val] || 'default'}>{val}</Tag>
        ) : '—',
    },
    {
      key: 'emirate',
      title: 'Emirate',
      sortable: true,
      filterable: true,
      filterKey: 'emirate',
      filterOptions: [
        { label: 'Dubai', value: 'Dubai' },
        { label: 'Abu Dhabi', value: 'Abu Dhabi' },
        { label: 'Sharjah', value: 'Sharjah' },
        { label: 'Ajman', value: 'Ajman' },
        { label: 'Ras Al Khaimah', value: 'Ras Al Khaimah' },
        { label: 'Fujairah', value: 'Fujairah' },
        { label: 'Umm Al Quwain', value: 'Umm Al Quwain' },
      ],
      render: (val) => val || '—',
    },
    {
      key: 'verified',
      title: 'Verified',
      sortable: false,
      render: (val) =>
        val ? (
          <Tag color="green">Verified</Tag>
        ) : (
          <Tag color="default">Pending</Tag>
        ),
    },
    {
      key: 'ejari',
      title: 'Ejari',
      sortable: false,
      render: (val) =>
        val ? (
          <Tag color="blue">Yes</Tag>
        ) : (
          <Tag color="default">No</Tag>
        ),
    },
    {
      key: 'actions',
      title: 'Actions',
      sortable: false,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              style={{ color: THEME.primary }}
              onClick={() => navigate(`/admin/rental/property/edit/${record._id}`)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={() => setDeleteModal({ open: true, record })}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">

      {/* PAGE HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 m-0">Rental Properties</h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage all rental listings
          </p>
        </div>
        {/* <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          style={{ backgroundColor: THEME.primary, borderColor: THEME.primary }}
          onClick={() => navigate('/admin/rental/property/create')}
        >
          Add Rental Property
        </Button> */}
      </div>

      {/* TABLE */}
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

      {/* DELETE CONFIRM MODAL */}
      <Modal
        open={deleteModal.open}
        title="Delete Rental Property"
        onCancel={() => !deleteLoading && setDeleteModal({ open: false, record: null })}
        footer={[
          <Button
            key="cancel"
            onClick={() => setDeleteModal({ open: false, record: null })}
            disabled={deleteLoading}
          >
            Cancel
          </Button>,
          <Button
            key="delete"
            danger
            type="primary"
            loading={deleteLoading}
            onClick={handleDelete}
          >
            Delete
          </Button>,
        ]}
        centered
      >
        <p>
          Are you sure you want to delete{' '}
          <strong>"{deleteModal.record?.title}"</strong>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default RentalPropertyList;