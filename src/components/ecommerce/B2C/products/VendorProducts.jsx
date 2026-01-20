// src/pages/vendor/VendorProducts.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiRefreshCw, FiEye, FiShoppingBag, FiSearch, FiEdit,FiClock ,FiX , FiTrash2 ,FiCheck } from 'react-icons/fi';
import { Button, Tag, Input, Tabs, Card, Statistic, Row, Col, Badge, Space, Tooltip, Avatar, Typography } from 'antd';
import CustomTable from '../../../CMS/pages/custom/CustomTable';
import { apiService } from '../../../../manageApi/utils/custom.apiservice';
import { showToast } from '../../../../manageApi/utils/toast';
import { format } from 'date-fns';

const { Title, Text } = Typography;

// --- THEME ---
const THEME = {
  primary: "#722ed1",
  secondary: "#1890ff",
  success: "#52c41a",
  warning: "#faad14",
  error: "#ff4d4f",
  bgLight: "#f9f0ff",
};

// --- ROLE MAPPING (for dynamic links) ---
const ROLE_SLUG_MAP = {
  0: "superadmin",
  1: "admin",
  5: "vendor-b2c",
  6: "vendor-b2b",
  7: "freelancer",
  11: "accountant",
};

const VendorProducts = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  // Dynamic role slug for links
  const roleSlug = ROLE_SLUG_MAP[user?.role?.code] ?? "dashboard";
  
  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalResults: 0,
    totalPages: 1
  });
  
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  const [searchTerm, setSearchTerm] = useState('');

  // --- FETCH DATA ---
  const fetchProducts = useCallback(async (page = 1, limit = 10, status = activeTab) => {
    setLoading(true);
    try {
      // Build query params
      const params = {
        page,
        limit,
        search: searchTerm || undefined,
      };

      // Map tabs to API verification_status param
      // 'all' tab sends no status filter
      if (status !== 'all') {
          params.verification_status = status;
      }

      // API call (Token is handled by interceptor)
      const res = await apiService.get('/products/vendor/my-products', params);
      
      setProducts(res.products || []);
      
      setPagination({
        currentPage: res.pagination?.currentPage || 1,
        itemsPerPage: res.pagination?.perPage || 10,
        totalResults: res.pagination?.totalRecords || 0,
        totalPages: res.pagination?.totalPages || 1
      });

      // Update stats if provided in response (or calculate locally if needed)
      // Assuming your API might return stats in future or separate call.
      // For now, we update total based on 'all' tab fetch.
      if (status === 'all' && res.pagination) {
         setStats(prev => ({ ...prev, total: res.pagination.totalRecords }));
      }

    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to fetch products', 'error');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchTerm]);

  // Initial Fetch & Tab Change
  useEffect(() => {
    fetchProducts(1, pagination.itemsPerPage, activeTab);
  }, [activeTab, searchTerm]); // Fetch on tab or search change

  // --- HANDLERS ---
  const handleTabChange = (key) => {
    setActiveTab(key);
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to page 1
  };

  const handlePageChange = (page, pageSize) => {
    fetchProducts(page, pageSize, activeTab);
  };

  const handleRefresh = () => {
    fetchProducts(pagination.currentPage, pagination.itemsPerPage, activeTab);
  };

  // --- COLUMNS ---
  const columns = [
    {
      title: 'Product Info',
      width: 300,
      render: (_, r) => {
          // Get primary image
          const primaryImg = r.color_variants?.[0]?.images?.find(i => i.is_primary)?.url 
                          || r.color_variants?.[0]?.images?.[0]?.url;
          
          return (
            <div className="flex items-center gap-3">
              <Avatar 
                shape="square" 
                size={50} 
                src={primaryImg ? `http://localhost:5000/${primaryImg}` : null}
                icon={<FiShoppingBag />}
                style={{ backgroundColor: THEME.bgLight, color: THEME.primary }}
              />
              <div>
                <div className="font-semibold text-gray-800">{r.name}</div>
                <div className="text-xs text-gray-500">Code: {r.product_code}</div>
                <div className="text-xs text-purple-600">{r.category?.name}</div>
              </div>
            </div>
          )
      },
    },
    {
      title: 'Pricing',
      width: 150,
      render: (_, r) => {
          const price = r.pricing?.sale_price || r.pricing?.base_price || 0;
          const currency = r.pricing?.currency?.symbol || "₹";
          return (
              <div>
                  <div className="font-medium text-gray-700">
                      {currency} {price.toFixed(2)}
                  </div>
                  {r.pricing?.discount?.value > 0 && (
                      <div className="text-xs text-green-600">
                          {r.pricing.discount.type === 'percentage' ? `${r.pricing.discount.value}% Off` : `-${r.pricing.discount.value}`}
                      </div>
                  )}
              </div>
          )
      }
    },
    {
      title: 'Stock',
      width: 120,
      render: (_, r) => (
          <Tag color={r.stock?.total_available > 0 ? "green" : "red"}>
              {r.stock?.total_available || 0} Available
          </Tag>
      )
    },
    {
      title: 'Status',
      width: 140,
      render: (_, r) => {
          const status = r.verification_status?.status || 'pending';
          const map = {
              pending: { color: 'warning', text: 'Pending' },
              approved: { color: 'success', text: 'Approved' },
              rejected: { color: 'error', text: 'Rejected' }
          };
          const config = map[status] || map.pending;

          return <Badge status={config.color} text={config.text} />;
      }
    },
    {
      title: 'Date',
      width: 120,
      render: (_, r) => <span className="text-gray-500 text-xs">{format(new Date(r.createdAt), 'dd MMM yyyy')}</span>
    },
    {
      title: 'Actions',
      fixed: 'right',
      width: 150,
      render: (_, r) => (
        <Space>
            <Tooltip title="View Details">
                <Link to={`/dashboard/${roleSlug}/products/view?productId=${r._id}`}>
                    <Button type="text" shape="circle" icon={<FiEye className="text-blue-600"/>} />
                </Link>
            </Tooltip>
            
            {/* Inventory Link - Only if Approved */}
            {r.verification_status?.status === 'approved' && (
                <Tooltip title="Manage Inventory">
                    <Link to={`/dashboard/${roleSlug}/product/inventory/${r._id}`}>
                        <Button type="text" shape="circle" icon={<FiShoppingBag className="text-purple-600"/>} />
                    </Link>
                </Tooltip>
            )}

            {/* Edit Link (If not rejected or specific logic) */}
            <Tooltip title="Edit Product">
                <Link to={`/dashboard/${roleSlug}/products/edit/${r._id}`}>
                    <Button type="text" shape="circle" icon={<FiEdit className="text-gray-600"/>} />
                </Link>
            </Tooltip>
        </Space>
      )
    }
  ];

  // --- TAB ITEMS ---
  const tabItems = [
      { key: 'all', label: 'All Products' },
      { 
          key: 'approved', 
          label: (
              <span>
                 <FiCheck className="inline mr-1"/> Approved
              </span>
          )
      },
      { 
          key: 'pending', 
          label: (
              <span>
                 <FiClock className="inline mr-1"/> Pending
              </span>
          )
      },
      { 
          key: 'rejected', 
          label: (
              <span>
                 <FiX className="inline mr-1"/> Rejected
              </span>
          )
      }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <Title level={3} style={{ margin: 0 }}>My Products</Title>
          <Text type="secondary">Manage your product catalog and inventory.</Text>
        </div>
        <Space>
          
            <Link to={`/dashboard/${roleSlug}/products/add`}>
                <Button 
                    type="primary" 
                    icon={<FiPlus />} 
                    size="large"
                    style={{ backgroundColor: THEME.primary, borderColor: THEME.primary }}
                >
                    Add Product
                </Button>
            </Link>
        </Space>
      </div>

      {/* Stats Cards (Optional - using total count from pagination for now) */}
      <Row gutter={[16, 16]} className="mb-6">
         <Col xs={24} sm={8}>
            <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.primary }}>
                <Statistic title="Total Products" value={pagination.totalResults} prefix={<FiShoppingBag />} />
            </Card>
         </Col>
         {/* You can fetch detailed counts if API supports it */}
      </Row>

      {/* Main Content */}
      <Card bordered={false} className="shadow-md rounded-lg" bodyStyle={{ padding: 0 }}>
        
        {/* Filters & Search */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 justify-between items-center bg-white rounded-t-lg">
            <Tabs 
                activeKey={activeTab} 
                onChange={handleTabChange} 
                items={tabItems} 
                className="custom-tabs"
                style={{ marginBottom: 0 }}
            />
            
            <Input 
                prefix={<FiSearch className="text-gray-400"/>}
                placeholder="Search products..."
                style={{ maxWidth: 300 }}
                allowClear
                size="large"
                onPressEnter={(e) => setSearchTerm(e.target.value)}
                onChange={(e) => { if(!e.target.value) setSearchTerm('') }}
            />
        </div>

        {/* Table */}
        <div className="p-0">
            <CustomTable
                columns={columns}
                data={products}
                loading={loading}
                totalItems={pagination.totalResults}
                currentPage={pagination.currentPage}
                itemsPerPage={pagination.itemsPerPage}
                onPageChange={handlePageChange}
                scroll={{ x: 1000 }}
            />
        </div>
      </Card>

    </div>
  );
};

export default VendorProducts;