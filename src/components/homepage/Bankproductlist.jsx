import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../manageApi/utils/custom.apiservice';
import {
  Button, Card, Space, Tag, Popconfirm,
  message, Typography, Statistic, Row, Col, Avatar, Grid, Badge
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, EyeOutlined,
  BankOutlined, EditOutlined, ThunderboltOutlined
} from '@ant-design/icons';
import CustomTable from '../CMS/pages/custom/CustomTable';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const THEME = { primary: "#7c3aed", success: "#10b981", warning: "#f59e0b" };
const MORTGAGE_PATH = "bank/products";

const BankProductList = ({ onView, onCreate, onEdit }) => {
  const screens = useBreakpoint();

  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [total, setTotal]           = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize]     = useState(10);
  const [searchText, setSearchText] = useState('');

  // ── Stats state (from /stats API) ──────────────────────────────────────
  const [stats, setStats] = useState({
    totalProducts: 0,
    popularCount: 0,
    featuredCount: 0,
    totalBanks: 0,
    productTypeDistribution: [],
    averageInterestRate: '0',
  });

  // ── Fetch stats ─────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const res = await apiService.get(`${MORTGAGE_PATH}/stats`);
      if (res?.success && res?.data) setStats(res.data);
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  }, []);

  // ── Fetch products list ─────────────────────────────────────────────────
  const fetchProducts = useCallback(async (page, limit, search) => {
    setLoading(true);
    try {
      const resData = await apiService.get(`${MORTGAGE_PATH}/get-all-bank-products`, {
        page, limit, search: search || undefined,
      });
      const list = Array.isArray(resData?.data)
        ? resData.data
        : Array.isArray(resData) ? resData : [];
      setProducts(list);
      setTotal(resData?.total || resData?.pagination?.total || list.length);
    } catch (err) {
      console.error('Products fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Re-fetch on page / search change (debounced 500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(currentPage, pageSize, searchText);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText, currentPage, pageSize, fetchProducts]);

  // ── Delete ──────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await apiService.delete(`${MORTGAGE_PATH}/delete-bank-product/${id}`);
      message.success('Product deleted successfully');
      fetchProducts(currentPage, pageSize, searchText);
      fetchStats(); // refresh stat cards after delete
    } catch (err) {
      console.error('Delete error:', err);
      message.error('Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  // ── CustomTable handlers ────────────────────────────────────────────────
  const handleFilter = ({ search }) => {
    setSearchText(search || '');
    setCurrentPage(1);
  };

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  // ── Helper: get count by productType from stats distribution ───────────
  const getTypeCount = (type) =>
    stats.productTypeDistribution?.find((d) => d._id === type)?.count ?? 0;

  // ── Columns ─────────────────────────────────────────────────────────────
  const typeColorMap = { FIXED: 'purple', VARIABLE: 'blue', ISLAMIC: 'green' };

  const columns = [
    {
      title: 'Bank',
      key: 'bankInfo',
      render: (_, r) => (
        <Space>
          {r.bankInfo?.logo
            ? <Avatar src={r.bankInfo.logo} size={36} shape="square" style={{ borderRadius: 6 }} />
            : <Avatar size={36} shape="square" style={{ background: THEME.primary, borderRadius: 6 }}>
                {r.bankInfo?.bankName?.[0]}
              </Avatar>
          }
          <div>
            <Text strong style={{ display: 'block', fontSize: 13 }}>{r.bankInfo?.bankName}</Text>
            <Text type="secondary" style={{ fontSize: 11 }}>{r.bankInfo?.bankCode}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Offer Title',
      key: 'offerTitle',
      render: (_, r) => (
        <div>
          <Text style={{ fontSize: 13 }}>{r.offerSummary?.title}</Text>
          {r.offerSummary?.popularityTag && (
            <Tag color="gold" style={{ marginLeft: 6, fontSize: 10 }}>
              {r.offerSummary.popularityTag}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Type',
      key: 'productType',
      render: (_, r) => (
        <Tag color={typeColorMap[r.offerSummary?.productType] || 'default'}>
          {r.offerSummary?.productType}
        </Tag>
      ),
    },
    {
      title: 'Rate',
      key: 'initialRate',
      render: (_, r) => (
        <Text strong style={{ color: THEME.primary }}>{r.offerSummary?.initialRate}%</Text>
      ),
    },
    {
      title: 'EMI / Month',
      key: 'monthlyEMI',
      render: (_, r) => (
        <Text>
          {r.offerSummary?.currency || 'AED'}{' '}
          {r.offerSummary?.monthlyEMI?.toLocaleString() || 0}
        </Text>
      ),
    },
    {
      title: 'LTV',
      key: 'loanToValue',
      render: (_, r) =>
        r.loanDetails?.loanToValue
          ? <Text>{r.loanDetails.loanToValue}%</Text>
          : <Text type="secondary">—</Text>,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, r) => (
        <Badge
          status={r.meta?.isActive !== false ? 'success' : 'error'}
          text={r.meta?.isActive !== false ? 'Active' : 'Inactive'}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size={4}>
          <Button
            type="text"
            icon={<EyeOutlined style={{ color: THEME.primary }} />}
            onClick={() => onView && onView(record._id)}
            title="View Details"
          />
          <Button
            type="text"
            icon={<EditOutlined style={{ color: THEME.warning }} />}
            onClick={() => onEdit && onEdit(record)}
            title="Edit"
          />
          <Popconfirm
            title="Delete this product?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: screens.md ? '24px' : '12px', background: '#f5f3ff', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1e1b4b' }}>Bank Offers</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Manage all mortgage & home loan products
          </Text>
        </div>
        <Space wrap>
          {/* <Button
            icon={<ThunderboltOutlined />}
            onClick={() => onCreate && onCreate('bulk')}
            style={{ borderColor: THEME.primary, color: THEME.primary }}
          >
            Bulk Import
          </Button> */}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => onCreate && onCreate('single')}
            style={{ background: THEME.primary, borderColor: THEME.primary }}
          >
            Add New Offer
          </Button>
        </Space>
      </div>

      {/* Stats — driven by /stats API */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 8px rgba(124,58,237,0.08)' }}>
            <Statistic
              title="Total Products"
              value={stats.totalProducts}
              prefix={<BankOutlined style={{ color: THEME.primary }} />}
              valueStyle={{ color: THEME.primary }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 8px rgba(124,58,237,0.08)' }}>
            <Statistic
              title="Fixed Rate"
              value={getTypeCount('FIXED')}
              valueStyle={{ color: THEME.primary }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 8px rgba(16,185,129,0.08)' }}>
            <Statistic
              title="Islamic"
              value={getTypeCount('ISLAMIC')}
              valueStyle={{ color: THEME.success }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 8px rgba(245,158,11,0.08)' }}>
            <Statistic
              title="Variable"
              value={getTypeCount('VARIABLE')}
              valueStyle={{ color: THEME.warning }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 8px rgba(124,58,237,0.08)' }}>
            <Statistic
              title="Total Banks"
              value={stats.totalBanks}
              valueStyle={{ color: THEME.primary }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 8px rgba(16,185,129,0.08)' }}>
            <Statistic
              title="Avg. Interest Rate"
              value={stats.averageInterestRate}
              suffix="%"
              valueStyle={{ color: THEME.success }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 8px rgba(245,158,11,0.08)' }}>
            <Statistic
              title="Popular"
              value={stats.popularCount}
              valueStyle={{ color: THEME.warning }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 8px rgba(124,58,237,0.08)' }}>
            <Statistic
              title="Featured"
              value={stats.featuredCount}
              valueStyle={{ color: THEME.primary }}
            />
          </Card>
        </Col>
      </Row>

      {/* CustomTable */}
      <CustomTable
        columns={columns}
        data={products}
        loading={loading}
        totalItems={total}
        currentPage={currentPage}
        itemsPerPage={pageSize}
        onPageChange={handlePageChange}
        onFilter={handleFilter}
        showSearch={true}
      />
    </div>
  );
};

export default BankProductList;