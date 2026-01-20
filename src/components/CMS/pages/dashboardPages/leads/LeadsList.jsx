import React, { useState, useEffect, useMemo } from 'react';
import { apiService } from '../../../../../manageApi/utils/custom.apiservice';
import CustomTable from '../../../pages/custom/CustomTable';
// 1. IMPORT YOUR LOGO HERE
import logo from "../../../../../assets/img/logoNew.png";

import {
  Drawer,
  List,
  Avatar,
  Button,
  Spin,
  Tabs,
  Modal,
  Table,
  Tag,
  Descriptions,
  Card,
  Row,
  Col,
  Statistic,
  Space,
  Typography,
  Badge,
  Divider,
  Tooltip,
  Input,
  Collapse,
  Timeline,
  Empty,
  Image,
  Carousel
} from 'antd';
import {
  UserOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  PaperClipOutlined,
  ToolOutlined,
  IdcardOutlined,
  SafetyOutlined,
  GoldOutlined,
  FileTextOutlined,
  TeamOutlined,
  CheckOutlined,
  CloseOutlined,
  PrinterOutlined,
  EnvironmentOutlined,
  PictureOutlined,
  ExpandOutlined,
  CompassOutlined
} from '@ant-design/icons';
import { showSuccessAlert, showErrorAlert, showConfirmDialog } from '../../../../../manageApi/utils/sweetAlert';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Search } = Input;
const { Panel } = Collapse;

// Purple Theme Colors
const PURPLE_THEME = {
  primary: '#722ed1',
  primaryLight: '#9254de',
  primaryLighter: '#d3adf7',
  primaryBg: '#f9f0ff',
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
  info: '#1890ff',
  dark: '#1f2937',
  gray: '#6b7280',
  light: '#f8fafc'
};

 const BASE_URL="https://xoto.ae/api"

const LeadsList = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [supervisors, setSupervisors] = useState([]);
  const [supervisorsLoading, setSupervisorsLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  
  // Search & Modals
  const [searchText, setSearchText] = useState('');
  const [viewDetailsModal, setViewDetailsModal] = useState({ visible: false, data: null });
  const [quotationModal, setQuotationModal] = useState({ visible: false, data: null, estimateStatus: null });
  const [imageViewer, setImageViewer] = useState({ visible: false, images: [], currentIndex: 0 });

  // Stats & Pagination
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    assigned: 0,
    final_created: 0,
    superadmin_approved: 0,
    customer_accepted: 0,
    customer_rejected: 0,
    cancelled: 0,
    deal: 0
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0
  });
  
  // Initialize filter with 'pending'
  const [filters, setFilters] = useState({ status: 'pending' });

  // --- CONFIGURATIONS ---

  const statusConfig = {
    pending: { label: 'Pending', color: 'warning', icon: <ClockCircleOutlined />, bgColor: '#fff7e6', textColor: '#fa8c16' },
    assigned: { label: 'Assigned', color: 'processing', icon: <TeamOutlined />, bgColor: '#e6f7ff', textColor: '#1890ff' },
    final_created: { label: 'Final Created', color: 'purple', icon: <FileTextOutlined />, bgColor: '#f9f0ff', textColor: '#722ed1' },
    superadmin_approved: { label: 'Approved & Sent', color: 'success', icon: <CheckOutlined />, bgColor: '#f6ffed', textColor: '#52c41a' },
  };

  const progressConfig = {
    none: { label: 'Not Started', color: 'default' },
    request_sent: { label: 'Request Sent', color: 'processing' },
    request_completed: { label: 'Request Completed', color: 'blue' },
    final_quotation_created: { label: 'Final Created', color: 'purple' },
    sent_to_customer: { label: 'Sent to Customer', color: 'orange' },
    
  };

  // --- API CALLS ---

  const fetchLeads = async (page = 1, limit = 10, filterParams = {}) => {
    setLoading(true);
    try {
      const response = await apiService.get('/estimates', { 
        page, 
        limit, 
        ...filterParams,
        search: searchText || undefined
      });
      if (response.success) {
        setLeads(response.data || []);
        setPagination({
          currentPage: response.pagination?.page || page,
          itemsPerPage: response.pagination?.limit || limit,
          totalItems: response.pagination?.total || 0
        });
        calculateStats(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      showErrorAlert('Error', 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const fetchSupervisors = async () => {
    setSupervisorsLoading(true);
    try {
      const res = await apiService.get('/users', { role: 'supervisor' });
      if (res.success) setSupervisors(res.data || []);
    } catch (error) {
      console.error('Error fetching supervisors:', error);
    } finally {
      setSupervisorsLoading(false);
    }
  };

  // --- ACTIONS ---

  const handleTabChange = (key) => {
    const newFilters = { status: key };
    setFilters(newFilters);
    fetchLeads(1, pagination.itemsPerPage, newFilters);
  };

  const openAssignDrawer = (lead) => {
    setSelectedLead(lead);
    setDrawerVisible(true);
    if (supervisors.length === 0) fetchSupervisors();
  };

  const assignSupervisor = async (supervisorId) => {
    const confirm = await showConfirmDialog('Assign Lead', 'Assign this lead to supervisor?', 'Yes, Assign');
    if (confirm.isConfirmed) {
      try {
        await apiService.put(`/estimates/${selectedLead._id}/assign-supervisor`, { supervisor_id: supervisorId });
        showSuccessAlert('Success', 'Lead assigned successfully');
        setDrawerVisible(false);
        fetchLeads(pagination.currentPage, pagination.itemsPerPage, filters);
      } catch (error) {
        showErrorAlert('Error', 'Failed to assign lead');
      }
    }
  };

  const approveQuotation = async (estimateId) => {
    const confirm = await showConfirmDialog('Approve & Send', 'Send quotation to customer?', 'Approve');
    if (confirm.isConfirmed) {
      try {
        await apiService.put(`/estimates/${estimateId}/approve-quotation`);
        showSuccessAlert('Success', 'Quotation sent to customer');
        fetchLeads(pagination.currentPage, pagination.itemsPerPage, filters);
        setQuotationModal({ visible: false, data: null });
        setViewDetailsModal({ visible: false, data: null });
      } catch (error) {
        showErrorAlert('Error', 'Failed to approve quotation');
      }
    }
  };

  // --- HELPERS ---

  const calculateStats = (data) => {
    const statCounts = {
      total: data.length,
      pending: 0,
      assigned: 0,
      final_created: 0,
      superadmin_approved: 0,
      
    };
    
    data.forEach(item => {
      if (item.status in statCounts) {
        statCounts[item.status]++;
      }
    });
    
    setStats(statCounts);
  };

  const formatCurrency = (amount) => amount ? `AED ${amount?.toLocaleString()}` : 'AED 0';
  const formatDate = (date) => date ? new Date(date).toLocaleString() : 'N/A';

  const getLocationString = (location) => {
    if (!location) return 'N/A';
    const parts = [
      location.area,
      location.city,
      location.state,
      location.country
    ].filter(Boolean);
    return parts.join(', ') || location.address || 'N/A';
  };

  const openImageGallery = (previewImage, moodboardImages) => {
    const images = [];
    if (previewImage?.url) {
      images.push({
        src: previewImage.url,
        title: previewImage.title || 'Preview Image'
      });
    }
    
    if (moodboardImages?.length > 0) {
      moodboardImages.forEach(img => {
        images.push({
          src: img.url,
          title: img.title || 'Moodboard Image'
        });
      });
    }
    
    if (images.length > 0) {
      setImageViewer({
        visible: true,
        images,
        currentIndex: 0
      });
    }
  };

  // --- COLUMNS ---

  const columns = useMemo(() => [
    {
      title: 'Customer',
      width: 240,
      render: (_, r) => (
        <div className="flex items-center gap-3">
          <Avatar 
            size={40} 
            style={{ background: PURPLE_THEME.primaryBg, color: PURPLE_THEME.primary }}
          >
            {r.customer?.name?.first_name?.charAt(0)?.toUpperCase() || r.customer_name?.charAt(0)?.toUpperCase() || 'C'}
          </Avatar>
          <div>
            <div className="font-semibold text-gray-900">
              {r.customer?.name?.first_name} {r.customer?.name?.last_name || r.customer_name}
            </div>
            <div className="text-xs text-gray-500">{r.customer?.email || r.customer_email}</div>
            <div className="text-xs text-gray-400">
              {r.customer?.mobile?.country_code || r.customer_mobile?.country_code} {r.customer?.mobile?.number || r.customer_mobile?.number}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Service Info',
      width: 200,
      render: (_, r) => (
        <div>
           <Tag color="purple">{r.service_type?.toUpperCase()}</Tag>
           <div className="text-sm font-medium mt-1">{r.subcategory?.label}</div>
           <div className="text-xs text-gray-500">{r.type?.label}</div>
        </div>
      )
    },
    {
      title: 'Location',
      width: 180,
      render: (_, r) => (
        <div className="text-xs">
          {r.customer?.location ? (
            <>
              <div className="font-medium flex items-center gap-1">
                <EnvironmentOutlined />
                {getLocationString(r.customer.location)}
              </div>
              {r.customer.location.lat && r.customer.location.lng && (
                <div className="text-gray-400 mt-1">
                  📍 {r.customer.location.lat.toFixed(4)}, {r.customer.location.lng.toFixed(4)}
                </div>
              )}
            </>
          ) : (
            <span className="text-gray-400">No location data</span>
          )}
        </div>
      )
    },
    {
      title: 'Area',
      width: 120,
      render: (_, r) => (
        <div>
          <span className="font-bold text-gray-700">{r.area_sqft}</span> <span className="text-xs text-gray-500">sq.ft</span>
          <div className="text-xs text-gray-400">{r.area_length} x {r.area_width}</div>
        </div>
      )
    },
    {
      title: 'Status',
      width: 150,
      render: (_, r) => {
        const cfg = statusConfig[r.status] || statusConfig.pending;
        return (
          <Tag color={cfg.color} style={{ borderRadius: 10, padding: '2px 10px' }}>
             {cfg.icon} <span className="ml-1">{cfg.label}</span>
          </Tag>
        );
      }
    },
    {
        title: 'Created',
        width: 140,
        render: (_, r) => <span className="text-xs text-gray-600">{formatDate(r.createdAt)}</span>
    },
    {
      title: 'Actions',
      fixed: 'right',
      width: 180,
      render: (_, r) => (
        <Space>
          <Tooltip title="View Full Details">
            <Button 
                icon={<EyeOutlined />} 
                size="small"
                onClick={() => setViewDetailsModal({ visible: true, data: r })}
            />
          </Tooltip>
          {r.status === 'pending' && (
            <Button 
                type="primary" 
                size="small" 
                onClick={() => openAssignDrawer(r)}
                style={{ background: PURPLE_THEME.primary }}
            >
                Assign
            </Button>
          )}
        </Space>
      )
    }
  ], []);

  // --- SUB-COMPONENTS FOR DETAILS ---

  const DetailSection = ({ title, icon, children, extra }) => (
    <Card 
      size="small" 
      title={<span className="flex items-center gap-2 text-purple-700">{icon} {title}</span>}
      className="mb-4 shadow-sm"
      headStyle={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}
      extra={extra}
    >
      {children}
    </Card>
  );

  const MapDisplay = ({ location }) => {
    if (!location || !location.lat || !location.lng) {
      return (
        <div className="flex items-center justify-center h-40 bg-gray-100 rounded border">
          <Text type="secondary">No location coordinates available</Text>
        </div>
      );
    }

    const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${location.lat},${location.lng}&zoom=15&size=600x300&markers=color:red%7Clabel:L%7C${location.lat},${location.lng}&key=YOUR_GOOGLE_MAPS_API_KEY`;

    const googleMapsUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`;

    return (
      <div className="relative">
        <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
          <img 
            src={staticMapUrl} 
            alt="Location Map" 
            className="w-full h-auto rounded border"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://via.placeholder.com/600x300/cccccc/666666?text=${encodeURIComponent(`Map: ${location.lat}, ${location.lng}`)}`;
            }}
          />
        </a>
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs p-1 rounded">
          📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
        </div>
        <Button 
          type="link" 
          size="small"
          icon={<CompassOutlined />}
          className="absolute top-2 right-2 bg-white"
          href={googleMapsUrl}
          target="_blank"
        >
          Open in Maps
        </Button>
      </div>
    );
  };

  // --- INITIAL FETCH ---
  useEffect(() => {
    fetchLeads(1, 10, filters);
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* HEADER STATS */}
      <div className="mb-6">
        <Title level={3}>Leads Management</Title>
        <Row gutter={[16, 16]}>
            {Object.entries(stats).map(([key, value]) => (
                <Col key={key} xs={12} sm={6} md={4} lg={3}>
                    <Card size="small" hoverable className="text-center border-t-4 border-purple-500">
                        <Statistic 
                          title={key.replace(/_/g, ' ').toUpperCase()} 
                          value={value} 
                          valueStyle={{ color: PURPLE_THEME.primary }} 
                        />
                    </Card>
                </Col>
            ))}
        </Row>
      </div>

      {/* FILTER TABS */}
      <Card bodyStyle={{ padding: 0 }} className="mb-6 overflow-hidden rounded-lg shadow-sm">
        <Tabs 
            activeKey={filters.status} 
            onChange={handleTabChange} 
            type="card" 
            size="large"
            tabBarStyle={{ margin: 0, background: '#fff' }}
        >
            {Object.keys(statusConfig).map(key => (
                <TabPane 
                    tab={
                        <span className="flex items-center gap-2 px-4">
                            {statusConfig[key].icon}
                            {statusConfig[key].label}
                        </span>
                    } 
                    key={key} 
                />
            ))}
        </Tabs>
      </Card>

      {/* DATA TABLE */}
      <Card bodyStyle={{ padding: '0px' }}>
     
          <CustomTable
            columns={columns}
            data={leads}
            loading={loading}
            totalItems={pagination.totalItems}
            currentPage={pagination.currentPage}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={(p, l) => fetchLeads(p, l, filters)}
          />
      </Card>

      {/* ========================================================= */}
      {/* VIEW DETAILS MODAL (FULL PROFILE)           */}
      {/* ========================================================= */}
      <Modal
        title={null}
        open={viewDetailsModal.visible}
        onCancel={() => setViewDetailsModal({ visible: false, data: null })}
        width={1400}
        footer={null}
        style={{ top: 20 }}
      >
        {viewDetailsModal.data && (
            <div>
                {/* 1. HEADER & STATUS */}
                <div className="flex justify-between items-start mb-6 border-b pb-4">
                    <div>
                        <Title level={3} style={{ margin: 0, color: PURPLE_THEME.primary }}>
                            {viewDetailsModal.data.service_type?.toUpperCase()} Request
                        </Title>
                        <Text type="secondary">Created on {formatDate(viewDetailsModal.data.createdAt)}</Text>
                    </div>
                    <div className="text-right">
                        <Tag color={statusConfig[viewDetailsModal.data.status]?.color} style={{ fontSize: 14, padding: '4px 12px' }}>
                            {statusConfig[viewDetailsModal.data.status]?.label.toUpperCase()}
                        </Tag>
                        {viewDetailsModal.data.submitted_at && (
                             <div className="text-xs text-gray-400 mt-1">Submitted: {formatDate(viewDetailsModal.data.submitted_at)}</div>
                        )}
                    </div>
                </div>

                <Row gutter={[24, 24]}>
                    
                    {/* LEFT COLUMN: INFO & DETAILS */}
                    <Col span={16}>
                        {/* CUSTOMER PROFILE CARD */}
                        <DetailSection title="Customer Profile" icon={<IdcardOutlined />}>
                            <div className="flex items-center gap-4 mb-4">
                                <Avatar size={64} icon={<UserOutlined />} style={{ background: PURPLE_THEME.primaryLight }} />
                                <div className="flex-1">
                                    <h4 className="text-lg font-bold m-0">
                                        {viewDetailsModal.data.customer?.name?.first_name} {viewDetailsModal.data.customer?.name?.last_name || viewDetailsModal.data.customer_name}
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        <div className="text-gray-600"><MailOutlined /> {viewDetailsModal.data.customer?.email || viewDetailsModal.data.customer_email}</div>
                                        <div className="text-gray-600">
                                            <PhoneOutlined /> {viewDetailsModal.data.customer?.mobile ? 
                                                `${viewDetailsModal.data.customer.mobile.country_code} ${viewDetailsModal.data.customer.mobile.number}` : 
                                                `${viewDetailsModal.data.customer_mobile?.country_code} ${viewDetailsModal.data.customer_mobile?.number}`}
                                        </div>
                                    </div>
                                    {viewDetailsModal.data.customer_response?.status && (
                                        <div className="mt-2">
                                            <Tag color={viewDetailsModal.data.customer_response.status === 'accepted' ? 'green' : 'red'}>
                                                Customer {viewDetailsModal.data.customer_response.status.toUpperCase()}
                                            </Tag>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* CUSTOMER LOCATION WITH MAP */}
                            {viewDetailsModal.data.customer?.location && (
                                <div className="mt-4">
                                    <Divider orientation="left" orientationMargin="0">
                                        <EnvironmentOutlined /> Location Details
                                    </Divider>
                                    <Descriptions bordered size="small" column={2} className="mb-3">
                                        <Descriptions.Item label="Address">{viewDetailsModal.data.customer.location.address}</Descriptions.Item>
                                        <Descriptions.Item label="Area">{viewDetailsModal.data.customer.location.area}</Descriptions.Item>
                                        <Descriptions.Item label="City">{viewDetailsModal.data.customer.location.city}</Descriptions.Item>
                                        <Descriptions.Item label="State">{viewDetailsModal.data.customer.location.state}</Descriptions.Item>
                                        <Descriptions.Item label="Country">{viewDetailsModal.data.customer.location.country}</Descriptions.Item>
                                        <Descriptions.Item label="Coordinates">
                                            {viewDetailsModal.data.customer.location.lat}, {viewDetailsModal.data.customer.location.lng}
                                        </Descriptions.Item>
                                    </Descriptions>
                                    <MapDisplay location={viewDetailsModal.data.customer.location} />
                                </div>
                            )}
                        </DetailSection>

                        {/* SERVICE & AREA DETAILS */}
                        <DetailSection title="Service & Requirements" icon={<ToolOutlined />}>
                            <Descriptions bordered size="small" column={2}>
                                <Descriptions.Item label="Category">{viewDetailsModal.data.subcategory?.label}</Descriptions.Item>
                                <Descriptions.Item label="Type">{viewDetailsModal.data.type?.label}</Descriptions.Item>
                                <Descriptions.Item label="Package">
                                    <Tag color="gold">{viewDetailsModal.data.package?.name}</Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Price">{formatCurrency(viewDetailsModal.data.package?.price)}</Descriptions.Item>
                            </Descriptions>

                            <div className="mt-4 p-3 bg-purple-50 rounded border border-purple-100">
                                <div className="text-xs text-purple-600 font-bold uppercase mb-2">Area Dimensions</div>
                                <div className="flex justify-between text-center">
                                    <div>
                                        <div className="text-xl font-bold">{viewDetailsModal.data.area_sqft}</div>
                                        <div className="text-xs text-gray-500">Sq. Ft.</div>
                                    </div>
                                    <Divider type="vertical" style={{ height: 30 }} />
                                    <div>
                                        <div className="text-lg font-semibold">{viewDetailsModal.data.area_length} ft</div>
                                        <div className="text-xs text-gray-500">Length</div>
                                    </div>
                                    <Divider type="vertical" style={{ height: 30 }} />
                                    <div>
                                        <div className="text-lg font-semibold">{viewDetailsModal.data.area_width} ft</div>
                                        <div className="text-xs text-gray-500">Width</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <Text strong>Description:</Text>
                                <Paragraph className="bg-gray-50 p-2 rounded mt-1 text-gray-600">
                                    {viewDetailsModal.data.description}
                                </Paragraph>
                            </div>

                            {viewDetailsModal.data.attachments?.length > 0 && (
                                <div className="mt-2">
                                    <Text strong>Attachments:</Text>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {viewDetailsModal.data.attachments.map((file, i) => (
                                            <Button key={i} size="small" icon={<PaperClipOutlined />}>View File {i+1}</Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </DetailSection>

                        {/* TYPE GALLERY IMAGES */}
                        {viewDetailsModal.data.type_gallery_snapshot && (
                            <DetailSection 
                                title="Type Gallery Images" 
                                icon={<PictureOutlined />}
                                extra={
                                    <Button 
                                        type="link" 
                                        size="small"
                                        icon={<ExpandOutlined />}
                                        onClick={() => openImageGallery(
                                            viewDetailsModal.data.type_gallery_snapshot.previewImage,
                                            viewDetailsModal.data.type_gallery_snapshot.moodboardImages
                                        )}
                                    >
                                        View All
                                    </Button>
                                }
                            >
                                <Row gutter={[16, 16]}>
                                    {/* PREVIEW IMAGE */}
                                    {viewDetailsModal.data.type_gallery_snapshot.previewImage?.url && (
                                        <Col span={24} md={12}>
                                            <Card
                                                hoverable
                                                cover={
                                                    <Image
  src={`${BASE_URL}${viewDetailsModal.data.type_gallery_snapshot.previewImage.url}`}
                                                        alt={viewDetailsModal.data.type_gallery_snapshot.previewImage.title}
                                                        height={200}
                                                        style={{ objectFit: 'cover' }}
                                                       preview={{
    src: `${BASE_URL}${viewDetailsModal.data.type_gallery_snapshot.previewImage.url}`,
  }}
                                                    />
                                                }
                                                size="small"
                                            >
                                                <Card.Meta 
                                                    title="Preview Image" 
                                                    description={viewDetailsModal.data.type_gallery_snapshot.previewImage.title}
                                                />
                                            </Card>
                                        </Col>
                                    )}

                                    {/* MOODBOARD IMAGES CAROUSEL */}
                                    {viewDetailsModal.data.type_gallery_snapshot.moodboardImages?.length > 0 && (
                                        <Col span={24} md={12}>
                                            <Card size="small" title="Moodboard Images">
                                                <Carousel autoplay dots={{ className: 'custom-dots' }}>
                                                    {viewDetailsModal.data.type_gallery_snapshot.moodboardImages.map((img, index) => (
                                                        <div key={index} className="p-1">
                                                          <Image
  src={`${BASE_URL}${img.url}`}
  alt={img.title}
  height={180}
  style={{ objectFit: 'cover', width: '100%' }}
  preview={{
    src: `${BASE_URL}${img.url}`,
  }}
/>
                                                            <div className="text-center text-xs mt-2 text-gray-500">
                                                                {img.title}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </Carousel>
                                                <div className="text-center text-xs text-gray-400 mt-2">
                                                    {viewDetailsModal.data.type_gallery_snapshot.moodboardImages.length} moodboard images
                                                </div>
                                            </Card>
                                        </Col>
                                    )}
                                </Row>
                            </DetailSection>
                        )}

                        {/* ASSIGNED SUPERVISOR */}
                        {viewDetailsModal.data.assigned_supervisor && (
                            <DetailSection title="Assigned Supervisor" icon={<SafetyOutlined />}>
                                <div className="flex items-center gap-3">
                                    <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />
                                    <div>
                                        <div className="font-semibold">
                                            {viewDetailsModal.data.assigned_supervisor.name?.first_name} {viewDetailsModal.data.assigned_supervisor.name?.last_name}
                                        </div>
                                        <div className="text-xs text-gray-500">{viewDetailsModal.data.assigned_supervisor.email}</div>
                                    </div>
                                    <div className="ml-auto">
                                        <Tag color="blue">Assigned</Tag>
                                    </div>
                                </div>
                            </DetailSection>
                        )}
                    </Col>

                    {/* RIGHT COLUMN: WORKFLOW & QUOTATIONS */}
                    <Col span={8}>
                        
                        {/* 1. PROGRESS TIMELINE */}
                        <Card size="small" title="Workflow Progress" className="mb-4">
                            <Timeline className="mt-2">
                                <Timeline.Item color="green">Created: {formatDate(viewDetailsModal.data.createdAt)}</Timeline.Item>
                                <Timeline.Item color={viewDetailsModal.data.assigned_supervisor ? 'green' : 'gray'}>
                                    Assigned: {viewDetailsModal.data.assigned_supervisor ? formatDate(viewDetailsModal.data.assigned_at) : 'Pending'}
                                </Timeline.Item>
                                <Timeline.Item color={viewDetailsModal.data.supervisor_progress === 'final_quotation_created' ? 'green' : 'blue'}>
                                    Supervisor Status: <Tag>{progressConfig[viewDetailsModal.data.supervisor_progress]?.label}</Tag>
                                </Timeline.Item>
                                <Timeline.Item dot={<GoldOutlined />} color="purple">
                                    Customer Status: <Tag>{progressConfig[viewDetailsModal.data.customer_progress]?.label}</Tag>
                                </Timeline.Item>
                            </Timeline>
                        </Card>

                        {/* 2. FINAL QUOTATION SUMMARY CARD */}
                        <Card 
                            title={<span className="text-green-600"><FileTextOutlined /> Final Quotation</span>}
                            className="border-green-200 bg-green-50"
                            size="small"
                        >
                            {viewDetailsModal.data.final_quotation ? (
                                <div className="text-center py-2">
                                    <div className="text-2xl font-bold text-green-700 mb-1">
                                        {formatCurrency(viewDetailsModal.data.final_quotation.grand_total)}
                                    </div>
                                    <div className="text-xs text-gray-500 mb-4">Grand Total</div>
                                    
                                    <Button 
                                        type="primary" 
                                        className="bg-green-600 hover:bg-green-500 border-none w-full"
                                        icon={<EyeOutlined />}
                                        onClick={() => setQuotationModal({ 
                                            visible: true, 
                                            data: viewDetailsModal.data.final_quotation,
                                            estimateStatus: viewDetailsModal.data.status,
                                            estimateId: viewDetailsModal.data._id
                                        })}
                                    >
                                        View Full Invoice
                                    </Button>

                                    {viewDetailsModal.data.status === 'superadmin_approved' && (
                                         <div className="mt-3 text-xs text-green-600 font-medium flex items-center justify-center gap-1">
                                             <CheckCircleOutlined /> Sent to Customer
                                         </div>
                                    )}
                                </div>
                            ) : (
                                <Empty description="No Final Quotation Yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            )}
                        </Card>

                        {/* 3. FREELANCER QUOTATIONS COUNT */}
                        {viewDetailsModal.data.freelancer_quotations?.length > 0 && (
                            <Card size="small" className="mt-4">
                                <div className="flex justify-between items-center">
                                    <span>Freelancer Bids Received:</span>
                                    <Badge count={viewDetailsModal.data.freelancer_quotations.length} style={{ backgroundColor: '#52c41a' }} />
                                </div>
                                <div className="mt-2 text-xs text-gray-500">
                                    (Review these in the Supervisor Dashboard)
                                </div>
                            </Card>
                        )}

                    </Col>
                </Row>
            </div>
        )}
      </Modal>

      {/* ========================================================= */}
      {/* FINAL QUOTATION INVOICE MODAL (WITH LOGO)   */}
      {/* ========================================================= */}
      <Modal
        title={null}
        footer={null}
        open={quotationModal.visible}
        onCancel={() => setQuotationModal({ visible: false, data: null, estimateStatus: null })}
        width={800}
        bodyStyle={{ padding: 0 }}
        centered
      >
        {quotationModal.data && (
            <div className="bg-white">
                {/* INVOICE HEADER */}
                <div className="p-8 bg-gray-50 border-b">
                    <div className="flex justify-between items-start">
                        {/* LEFT: LOGO */}
                        <div>
                            <img src={logo} alt="Company Logo" style={{ height: 60, marginBottom: 10 }} />
                            <div className="text-gray-500 text-sm">
                                123 Landscape Avenue<br/>
                                Dubai, UAE<br/>
                                contact@company.com
                            </div>
                        </div>

                        {/* RIGHT: INVOICE DETAILS */}
                        <div className="text-right">
                            <Title level={2} style={{ color: PURPLE_THEME.primary, margin: 0 }}>QUOTATION</Title>
                            <div className="mt-2 text-gray-600">
                                <div><strong>Quotation #:</strong> {quotationModal.data._id?.substring(0,8).toUpperCase()}</div>
                                <div><strong>Date:</strong> {new Date(quotationModal.data.createdAt).toLocaleDateString()}</div>
                                <div><strong>Status:</strong> <Tag color="blue">GENERATED</Tag></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ITEMS TABLE */}
                <div className="p-8">
                    <Table 
                        dataSource={quotationModal.data.items || []}
                        rowKey="_id"
                        pagination={false}
                        bordered
                        columns={[
                            { 
                                title: '#', 
                                render: (_,__,i) => i+1, 
                                width: 50, 
                                align: 'center' 
                            },
                            { 
                                title: 'Item Description', 
                                dataIndex: 'item', 
                                key: 'item',
                                render: (text, record) => (
                                    <div>
                                        <div className="font-medium">{text}</div>
                                        <div className="text-xs text-gray-500">{record.description}</div>
                                    </div>
                                )
                            },
                            { 
                                title: 'Qty', 
                                dataIndex: 'quantity', 
                                key: 'quantity', 
                                width: 80, 
                                align: 'center' 
                            },
                            { 
                                title: 'Unit Price', 
                                dataIndex: 'unit_price', 
                                key: 'unit_price', 
                                width: 120, 
                                align: 'right',
                                render: (val) => formatCurrency(val)
                            },
                            { 
                                title: 'Total', 
                                dataIndex: 'total', 
                                key: 'total', 
                                width: 120, 
                                align: 'right',
                                render: (val) => <span className="font-medium">{formatCurrency(val)}</span>
                            }
                        ]}
                    />

                    {/* FINANCIALS */}
                    <div className="flex justify-end mt-6">
                        <div className="w-64 space-y-3">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal:</span>
                                <span>{formatCurrency(quotationModal.data.subtotal)}</span>
                            </div>
                            {quotationModal.data.discount_amount > 0 && (
                                <div className="flex justify-between text-red-500">
                                    <span>Discount ({quotationModal.data.discount_percent}%):</span>
                                    <span>- {formatCurrency(quotationModal.data.discount_amount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-xl font-bold text-purple-800 border-t pt-3">
                                <span>Grand Total:</span>
                                <span>{formatCurrency(quotationModal.data.grand_total)}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* SCOPE / NOTES */}
                    {quotationModal.data.scope_of_work && (
                        <div className="mt-8 p-4 bg-gray-50 rounded border border-gray-100">
                            <h5 className="font-bold text-gray-700 mb-2">Scope of Work & Notes:</h5>
                            <p className="text-gray-600 text-sm whitespace-pre-wrap">{quotationModal.data.scope_of_work}</p>
                        </div>
                    )}
                </div>

                {/* FOOTER ACTIONS */}
                <div className="p-4 bg-gray-100 border-t flex justify-end gap-3">
                    <Button onClick={() => setQuotationModal({ visible: false, data: null, estimateStatus: null })}>
                        Close
                    </Button>
                    <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
                        Print
                    </Button>
                    
                    {/* APPROVE BUTTON ONLY IF STATUS IS 'final_created' */}
                    {quotationModal.estimateStatus === 'final_created' && (
                        <Button 
                            type="primary" 
                            className="bg-green-600 border-green-600 hover:bg-green-500"
                            icon={<CheckCircleOutlined />}
                            onClick={() => approveQuotation(quotationModal.estimateId)}
                        >
                            Approve & Send to Customer
                        </Button>
                    )}
                </div>
            </div>
        )}
      </Modal>

      {/* IMAGE GALLERY MODAL */}
      <Modal
        open={imageViewer.visible}
        onCancel={() => setImageViewer({ visible: false, images: [], currentIndex: 0 })}
        footer={null}
        width={800}
        centered
      >
        <Carousel 
          arrows
          dots
          initialSlide={imageViewer.currentIndex}
          afterChange={(current) => setImageViewer(prev => ({ ...prev, currentIndex: current }))}
        >
          {imageViewer.images.map((img, index) => (
            <div key={index} className="text-center">
              <Image
                src={img.src}
                alt={img.title}
                style={{ maxHeight: '500px', objectFit: 'contain' }}
                preview={false}
              />
              <div className="mt-4 text-gray-600">{img.title}</div>
            </div>
          ))}
        </Carousel>
        <div className="text-center mt-4 text-gray-400">
          Image {imageViewer.currentIndex + 1} of {imageViewer.images.length}
        </div>
      </Modal>

      {/* ASSIGN SUPERVISOR DRAWER */}
      <Drawer
        title="Assign Supervisor"
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={400}
      >
        <List
            loading={supervisorsLoading}
            dataSource={supervisors}
            renderItem={item => (
                <List.Item
                    actions={[
                        <Button 
                            type="link" 
                            size="small" 
                            onClick={() => assignSupervisor(item._id)}
                        >
                            Assign
                        </Button>
                    ]}
                >
                    <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={`${item.name?.first_name} ${item.name?.last_name}`}
                        description={item.email}
                    />
                </List.Item>
            )}
        />
      </Drawer>

    </div>
  );
};

export default LeadsList;