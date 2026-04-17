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

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

// BRAND COLOR
const THEME_COLOR = "#3E1265";
const THEME = { primary: THEME_COLOR, success: "#10b981", warning: "#f59e0b" };
const MORTGAGE_PATH = "bank/products";

const BankProductList = ({ onView, onCreate, onEdit }) => {
  const screens = useBreakpoint();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');

  const [stats, setStats] = useState({
    totalProducts: 0,
    popularCount: 0,
    featuredCount: 0,
    totalBanks: 0,
    productTypeDistribution: [],
    averageInterestRate: '0',
  });

  const fetchStats = useCallback(async () => {
    try {
      const res = await apiService.get(`${MORTGAGE_PATH}/stats`);
      if (res?.success && res?.data) setStats(res.data);
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  }, []);

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

  useEffect(() => { fetchStats(); }, [fetchStats]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(currentPage, pageSize, searchText);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText, currentPage, pageSize, fetchProducts]);

  const handleDelete = async (id) => {
    try {
      await apiService.delete(`${MORTGAGE_PATH}/delete-bank-product/${id}`);
      message.success('Product deleted successfully');
      fetchProducts(currentPage, pageSize, searchText);
      fetchStats();
    } catch (err) {
      message.error('Failed to delete product');
    }
  };

  const getTypeCount = (type) =>
    stats.productTypeDistribution?.find((d) => d._id === type)?.count ?? 0;

  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div style={{ padding: screens.md ? '24px' : '12px', background: '#f8f9fa', minHeight: '100vh' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: THEME_COLOR }}>Bank Products</Title>
          <Text type="secondary">Manage your portfolio of financial offerings</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => onCreate && onCreate('single')}
          style={{ background: THEME_COLOR, borderColor: THEME_COLOR, height: 40, borderRadius: 8 }}
        >
          Add New Product
        </Button>
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
        {/* <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 8px rgba(124,58,237,0.08)' }}>
            <Statistic
              title="Fixed Rate"
              value={getTypeCount('FIXED')}
              valueStyle={{ color: THEME.primary }}
            />
          </Card>
        </Col> */}
        {/* <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 8px rgba(16,185,129,0.08)' }}>
            <Statistic
              title="Islamic"
              value={getTypeCount('ISLAMIC')}
              valueStyle={{ color: THEME.success }}
            />
          </Card>
        </Col> */}
        {/* <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 8px rgba(245,158,11,0.08)' }}>
            <Statistic
              title="Variable"
              value={getTypeCount('VARIABLE')}
              valueStyle={{ color: THEME.warning }}
            />
          </Card>
        </Col> */}
        {/* <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 8px rgba(124,58,237,0.08)' }}>
            <Statistic
              title="Total Banks"
              value={stats.totalBanks}
              valueStyle={{ color: THEME.primary }}
            />
          </Card>
        </Col> */}
        {/* <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 8px rgba(16,185,129,0.08)' }}>
            <Statistic
              title="Avg. Interest Rate"
              value={stats.averageInterestRate}
              suffix="%"
              valueStyle={{ color: THEME.success }}
            />
          </Card>
        </Col> */}
        {/* <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 8px rgba(245,158,11,0.08)' }}>
            <Statistic
              title="Popular"
              value={stats.popularCount}
              valueStyle={{ color: THEME.warning }}
            />
          </Card>
        </Col> */}
        {/* <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 8px rgba(124,58,237,0.08)' }}>
            <Statistic
              title="Featured"
              value={stats.featuredCount}
              valueStyle={{ color: THEME.primary }}
            />
          </Card>
        </Col> */}
      </Row>

      {/* Product Grid (The Cards) */}
      <Row gutter={[20, 20]}>
        {products.map((item) => (
          <Col xs={24} sm={12} lg={8} key={item._id}>
            <Card
              hoverable
              bodyStyle={{ padding: 0 }}
              style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb' }}
            >
              {/* Top accent line */}
              <div style={{ height: 4, background: THEME_COLOR }} />
              
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <Avatar 
                    src={item.bankInfo?.logo} 
                    shape="square" 
                    size={48} 
                    icon={<BankOutlined />}
                    style={{ backgroundColor: '#f3f4f6', color: THEME_COLOR, borderRadius: 8, border: '1px solid #eee' }}
                  />
                  <Badge 
                    status={item.meta?.isActive !== false ? "success" : "error"} 
                    text={item.meta?.isActive !== false ? "Active" : "Inactive"} 
                  />
                </div>

                <Title level={5} style={{ marginBottom: 4 }}>{item.offerSummary?.title || 'Unnamed Product'}</Title>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 16 }}>
                  {item.bankInfo?.bankName} • {item.offerSummary?.productType}
                </Text>

                <div style={{ background: '#f9fafb', padding: '12px', borderRadius: 8, marginBottom: 16 }}>
                  <Row gutter={8}>
                    <Col span={12}>
                      <Text type="secondary" style={{ fontSize: 11 }}>Interest Rate</Text>
                      <div style={{ color: THEME_COLOR, fontWeight: 'bold', fontSize: 16 }}>{item.offerSummary?.initialRate}%</div>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary" style={{ fontSize: 11 }}>Monthly EMI</Text>
                      <div style={{ fontWeight: '600' }}>{item.offerSummary?.currency} {item.offerSummary?.monthlyEMI?.toLocaleString()}</div>
                    </Col>
                  </Row>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <Button 
                      type="text" 
                      icon={<EyeOutlined />} 
                      onClick={() => onView(item._id)}
                      style={{ color: THEME_COLOR }}
                    />
                    <Button 
                      type="text" 
                      icon={<EditOutlined />} 
                      onClick={() => onEdit(item)}
                    />
                  </Space>
                  <Popconfirm title="Delete product?" onConfirm={() => handleDelete(item._id)}>
                    <Button type="text" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Pagination Section */}
    <div style={{ 
  marginTop: 40, 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center' 
}}>
  
  {/* LEFT SIDE - TEXT */}
  <Text type="secondary" style={{ fontSize: 12 }}>
    Showing page <b>{currentPage}</b> of {totalPages} ({total} total items)
  </Text>

  {/* RIGHT SIDE - PAGINATION */}
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <button
      onClick={() => setCurrentPage(prev => prev - 1)}
      disabled={currentPage === 1}
      style={{ 
        padding: '6px 12px', border: '1px solid #d9d9d9', borderRadius: 6, 
        background: '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
        opacity: currentPage === 1 ? 0.5 : 1
      }}
    >
      ←
    </button>

    {Array.from({ length: totalPages }, (_, i) => i + 1)
      .slice(Math.max(0, currentPage - 3), currentPage + 2)
      .map((p) => (
        <button
          key={p}
          onClick={() => setCurrentPage(p)}
          style={{
            padding: '6px 14px', borderRadius: 6, border: '1px solid',
            cursor: 'pointer', transition: 'all 0.3s',
            backgroundColor: currentPage === p ? THEME_COLOR : '#fff',
            color: currentPage === p ? '#fff' : '#666',
            borderColor: currentPage === p ? THEME_COLOR : '#d9d9d9'
          }}
        >
          {p}
        </button>
      ))}

    <button
      onClick={() => setCurrentPage(prev => prev + 1)}
      disabled={currentPage === totalPages}
      style={{ 
        padding: '6px 12px', border: '1px solid #d9d9d9', borderRadius: 6, 
        background: '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
        opacity: currentPage === totalPages ? 0.5 : 1
      }}
    >
      →
    </button>
  </div>
</div>
    </div>
  );
};

export default BankProductList;