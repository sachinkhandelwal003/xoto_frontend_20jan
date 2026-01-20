import React, { useState, useEffect } from 'react';
import { apiService } from '../../../../../manageApi/utils/custom.apiservice';
import { useSelector } from "react-redux";
// 1. IMPORT LOGO
import logo from "../../../../../assets/img/logoNew.png";

import { 
  Tabs, Card, Button, Modal, Table, Tag, Input, Spin, Empty, 
  Row, Col, Divider, Badge, Avatar, Space, Alert, Typography,
  Image, Descriptions, Timeline
} from 'antd';
import { 
  CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, 
  ClockCircleOutlined, DollarOutlined, CalendarOutlined,
  UserOutlined, FileTextOutlined, MailOutlined,
  PhoneOutlined, EnvironmentOutlined, ToolOutlined,
  PrinterOutlined, PictureOutlined, IdcardOutlined,
  CalculatorOutlined, TeamOutlined, HistoryOutlined
} from '@ant-design/icons';
import { showSuccessAlert, showErrorAlert, showConfirmDialog } from '../../../../../manageApi/utils/sweetAlert';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

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

const MyEstimates = () => {
  const user = useSelector((s) => s.auth?.user);
  const [allEstimates, setAllEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  
  // Modal States
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState(null);
  
  // Action States
  const [rejectReason, setRejectReason] = useState('');
  const [respondingId, setRespondingId] = useState(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);

  // Helpers
  const formatCurrency = (amount, currency = 'AED') => amount ? `${currency} ${parseFloat(amount).toLocaleString()}` : `${currency} 0`;
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
  const formatMobileNumber = (mobileObj) => mobileObj ? `${mobileObj.country_code || ''} ${mobileObj.number || ''}`.trim() : 'N/A';
  
  // Get full image URL
  const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return path.startsWith('/') ? `https://xoto.ae/api${path}` : path;
  };

  // Get customer name
  const getCustomerName = (customer) => {
    if (!customer) return 'N/A';
    if (customer.name) {
      return `${customer.name.first_name || ''} ${customer.name.last_name || ''}`.trim();
    }
    return customer.full_name || customer.email || 'N/A';
  };

  // Fetch All Customer Estimates
  const fetchMyEstimates = async () => {
    setLoading(true);
    try {
      const res = await apiService.get('/estimates/customer/my-estimates');
      console.log('My Estimates API Response:', res.data); // Debug log
      if (res.success) {
        setAllEstimates(res.data || []);
      }
    } catch (error) {
      showErrorAlert('Error', 'Failed to load your estimates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEstimates();
  }, []);

  // Filter Data by Tab
  const pendingEstimates = allEstimates.filter(e => 
    e.status === 'superadmin_approved' && !e.customer_response?.status
  );
  const respondedEstimates = allEstimates.filter(e => 
    e.customer_response?.status
  );

  // Statistics
  const stats = {
    total: allEstimates.length,
    pending: pendingEstimates.length,
    accepted: respondedEstimates.filter(e => e.customer_response?.status === 'accepted').length,
    rejected: respondedEstimates.filter(e => e.customer_response?.status === 'rejected').length,
  };

  // View Quotation Modal
  const openQuotationModal = (estimate) => {
    setSelectedEstimate(estimate);
    setModalVisible(true);
  };

  // Accept Quotation
  const accept = async (estimate) => {
    const confirm = await showConfirmDialog('Accept Quotation', `Are you sure you want to accept this quotation?`, 'Yes, Accept');
    if (!confirm.isConfirmed) return;

    setRespondingId(estimate._id);
    try {
      await apiService.put(`/estimates/${estimate._id}/response`, { status: 'accepted' });
      showSuccessAlert('Success', 'Quotation accepted successfully!');
      setModalVisible(false);
      fetchMyEstimates();
    } catch (err) {
      showErrorAlert('Error', 'Failed to accept quotation');
    } finally {
      setRespondingId(null);
    }
  };

  // Open Reject Modal
  const openRejectModal = (estimate) => {
    setSelectedEstimate(estimate);
    setRejectReason('');
    setRejectModalVisible(true);
  };

  // Reject with Reason
  const reject = async () => {
    if (!rejectReason.trim()) return showErrorAlert('Reason Required', 'Please provide a reason');

    setRespondingId(selectedEstimate._id);
    try {
      await apiService.put(`/estimates/${selectedEstimate._id}/response`, { 
        status: 'rejected', 
        reason: rejectReason 
      });
      showSuccessAlert('Success', 'Quotation rejected');
      setRejectModalVisible(false);
      setModalVisible(false);
      setRejectReason('');
      fetchMyEstimates();
    } catch (err) {
      showErrorAlert('Error', 'Failed to reject quotation');
    } finally {
      setRespondingId(null);
    }
  };

  // Detail Card Component
  const DetailCard = ({ title, icon, children }) => (
    <Card 
      size="small" 
      title={
        <div className="flex items-center gap-2" style={{ color: PURPLE_THEME.primary }}>
          {icon} <span className="font-semibold">{title}</span>
        </div>
      }
      style={{ borderLeft: `4px solid ${PURPLE_THEME.primary}`, marginBottom: '16px' }}
      headStyle={{ background: PURPLE_THEME.primaryBg }}
    >
      {children}
    </Card>
  );

  // --- COMPONENT: CARD VIEW FOR LIST ---
  const EstimateCard = ({ est, isPending }) => {
    const q = est.final_quotation;
    const status = est.customer_response?.status;
    
    return (
      <Card 
        className="mb-4 shadow-sm hover:shadow-md transition-shadow"
        style={{ 
          borderLeft: `4px solid ${isPending ? PURPLE_THEME.warning : (status === 'accepted' ? PURPLE_THEME.success : PURPLE_THEME.error)}`,
          background: 'white'
        }}
        bodyStyle={{ padding: '20px' }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={16}>
            <div className="flex items-start gap-4">
              <Avatar 
                size={50}
                icon={<FileTextOutlined />}
                style={{ 
                  background: isPending ? PURPLE_THEME.warning + '20' : (status === 'accepted' ? PURPLE_THEME.success + '20' : PURPLE_THEME.error + '20'),
                  color: isPending ? PURPLE_THEME.warning : (status === 'accepted' ? PURPLE_THEME.success : PURPLE_THEME.error)
                }}
              />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="text-lg font-bold text-gray-800 m-0">{est.service_type?.toUpperCase()}</h4>
                  <Tag color="purple">{est.subcategory?.label}</Tag>
                  {!isPending && (
                      <Tag color={status === 'accepted' ? 'success' : 'error'}>
                          {status === 'accepted' ? 'ACCEPTED' : 'REJECTED'}
                      </Tag>
                  )}
                </div>
                
                <div className="text-gray-500 mb-2">{est.description || 'No description provided'}</div>
                
                <Space split={<Divider type="vertical" />}>
                    <span className="text-xs text-gray-400"><CalendarOutlined /> {formatDate(est.submitted_at)}</span>
                    <span className="text-xs text-gray-400"><EnvironmentOutlined /> {est.area_sqft} sq.ft</span>
                    <span className="text-xs text-gray-400">Ref: {est._id.substring(0,8)}</span>
                </Space>
              </div>
            </div>
          </Col>

          <Col xs={24} md={8}>
            <div className="flex flex-col items-end justify-center h-full">
              <div className="text-2xl font-bold mb-1" style={{ color: PURPLE_THEME.primary }}>
                {formatCurrency(q?.grand_total)}
              </div>
              
              <Space className="mt-2">
                <Button icon={<EyeOutlined />} onClick={() => openQuotationModal(est)}>View Quote</Button>
                
                {isPending && (
                    <>
                        <Button 
                            type="primary" 
                            icon={<CheckCircleOutlined />} 
                            style={{ background: PURPLE_THEME.success, borderColor: PURPLE_THEME.success }}
                            loading={respondingId === est._id}
                            onClick={() => accept(est)}
                        >
                            Accept
                        </Button>
                        <Button 
                            danger 
                            icon={<CloseCircleOutlined />}
                            loading={respondingId === est._id}
                            onClick={() => openRejectModal(est)}
                        >
                            Reject
                        </Button>
                    </>
                )}
              </Space>
            </div>
          </Col>
        </Row>
      </Card>
    );
  };

  // --- MAIN RENDER ---
  return (
    <div className="min-h-screen p-6" style={{ background: PURPLE_THEME.light }}>
      <div className="max-w-screen-xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <Title level={2} style={{ color: PURPLE_THEME.dark, margin: 0 }}>My Estimates</Title>
          <Paragraph style={{ color: PURPLE_THEME.gray }}>Review and manage your project quotations</Paragraph>
        </div>

        {/* Stats Row */}
        <Row gutter={16} className="mb-6">
            <Col span={6}>
                <Card bordered={false} className="text-center">
                    <h2 className="text-3xl font-bold m-0" style={{ color: PURPLE_THEME.primary }}>{stats.total}</h2>
                    <div className="text-gray-500">Total</div>
                </Card>
            </Col>
            <Col span={6}>
                <Card bordered={false} className="text-center">
                    <h2 className="text-3xl font-bold m-0" style={{ color: PURPLE_THEME.warning }}>{stats.pending}</h2>
                    <div className="text-gray-500">Pending Action</div>
                </Card>
            </Col>
            <Col span={6}>
                <Card bordered={false} className="text-center">
                    <h2 className="text-3xl font-bold m-0" style={{ color: PURPLE_THEME.success }}>{stats.accepted}</h2>
                    <div className="text-gray-500">Accepted</div>
                </Card>
            </Col>
            <Col span={6}>
                <Card bordered={false} className="text-center">
                    <h2 className="text-3xl font-bold m-0" style={{ color: PURPLE_THEME.error }}>{stats.rejected}</h2>
                    <div className="text-gray-500">Rejected</div>
                </Card>
            </Col>
        </Row>

        {/* Content Tabs */}
        <Card bodyStyle={{ padding: 0 }} className="shadow-sm rounded-lg overflow-hidden">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            size="large"
            tabBarStyle={{ margin: 0, padding: '0 20px', background: 'white' }}
            items={[
                {
                    key: 'pending',
                    label: <Badge count={pendingEstimates.length} offset={[10, 0]} color={PURPLE_THEME.warning}>Pending Approval</Badge>,
                    children: (
                        <div className="p-6 bg-gray-50 min-h-[300px]">
                            {loading ? <Spin className="w-full py-10" /> : 
                             pendingEstimates.length === 0 ? <Empty description="No pending estimates" /> :
                             pendingEstimates.map(est => <EstimateCard key={est._id} est={est} isPending={true} />)
                            }
                        </div>
                    )
                },
                {
                    key: 'responded',
                    label: 'History',
                    children: (
                        <div className="p-6 bg-gray-50 min-h-[300px]">
                            {loading ? <Spin className="w-full py-10" /> : 
                             respondedEstimates.length === 0 ? <Empty description="No history available" /> :
                             respondedEstimates.map(est => <EstimateCard key={est._id} est={est} isPending={false} />)
                            }
                        </div>
                    )
                }
            ]}
          />
        </Card>

        {/* --- INVOICE STYLE MODAL (Customer View) --- */}
        <Modal
          title={null}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={900}
          style={{ top: 20 }}
          bodyStyle={{ padding: 0 }}
        >
          {selectedEstimate && selectedEstimate.final_quotation ? (
            <div className="bg-white rounded-lg overflow-hidden">
                
                {/* 1. Invoice Header with Logo */}
                <div className="p-8 border-b">
                    <div className="flex justify-between items-start">
                        <div>
                            <img src={logo} alt="Company Logo" style={{ height: 60, marginBottom: 15 }} />
                            <div className="text-gray-500 text-sm leading-relaxed">
                                <strong>Clean & Green Services</strong><br/>
                                123 Landscape Avenue<br/>
                                Dubai, UAE<br/>
                                support@company.com
                            </div>
                        </div>
                        <div className="text-right">
                            <h1 className="text-3xl font-bold text-gray-800 m-0" style={{ letterSpacing: '2px' }}>QUOTATION</h1>
                            <div className="mt-4 text-sm text-gray-600 space-y-1">
                                <div><strong>Date:</strong> {formatDate(selectedEstimate.final_quotation.createdAt)}</div>
                                <div><strong>Ref #:</strong> {selectedEstimate._id.substring(0,8).toUpperCase()}</div>
                                <div><strong>Valid Until:</strong> {formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Bill To & Project Info */}
                <div className="p-8 bg-gray-50 border-b">
                    <Row gutter={24}>
                       <Col span={12}>
  <h4 className="font-bold text-gray-700 uppercase text-xs mb-2">
    Bill To:
  </h4>

  {/* Customer Name */}
  <div className="text-sm text-gray-800 font-medium">
    {selectedEstimate.customer?.name
      ? `${selectedEstimate.customer.name.first_name} ${selectedEstimate.customer.name.last_name}`
      : selectedEstimate.customer_name}
  </div>

  {/* Customer Email */}
  <div className="text-sm text-gray-500">
    {selectedEstimate.customer?.email || selectedEstimate.customer_email}
  </div>

  {/* Customer Mobile */}
  <div className="text-sm text-gray-500">
    {selectedEstimate.customer?.mobile
      ? `${selectedEstimate.customer.mobile.country_code} ${selectedEstimate.customer.mobile.number}`
      : formatMobileNumber(selectedEstimate.customer_mobile)}
  </div>
</Col>

                        <Col span={12} className="text-right">
                            <h4 className="font-bold text-gray-700 uppercase text-xs mb-2">Project Details:</h4>
                            <div className="text-sm text-gray-800 font-medium">{selectedEstimate.service_type} - {selectedEstimate.subcategory?.label}</div>
                            <div className="text-sm text-gray-500">Package: {selectedEstimate.package?.name}</div>
                            <div className="text-sm text-gray-500">Area: {selectedEstimate.area_sqft} sq.ft ({selectedEstimate.area_length}x{selectedEstimate.area_width})</div>
                        </Col>
                    </Row>
                </div>

                {/* 3. Items Table */}
                <div className="p-8">
                    <Table
                        dataSource={selectedEstimate.final_quotation.items}
                        pagination={false}
                        size="small"
                        bordered
                        rowKey="sno"
                        columns={[
                            { title: '#', dataIndex: 'sno', width: 50, align: 'center', className: 'bg-gray-50' },
                            { title: 'Description', dataIndex: 'item', render: (t,r) => <div><strong>{t}</strong><div className="text-gray-500 text-xs">{r.description}</div></div> },
                            { title: 'Unit', dataIndex: 'unit', width: 80, align: 'center' },
                            { title: 'Qty', dataIndex: 'quantity', width: 80, align: 'center' },
                            { title: 'Rate', dataIndex: 'unit_price', width: 100, align: 'right', render: v => formatCurrency(v) },
                            { title: 'Total', dataIndex: 'total', width: 120, align: 'right', render: v => <strong>{formatCurrency(v)}</strong> }
                        ]}
                    />

                    <Row gutter={24} className="mt-8">
                        <Col span={14}>
                            <h4 className="font-bold text-gray-700 text-sm mb-2">Scope of Work & Notes:</h4>
                            <div className="p-4 bg-gray-50 rounded text-sm text-gray-600 whitespace-pre-wrap border border-gray-100">
                                {selectedEstimate.final_quotation.scope_of_work}
                            </div>
                        </Col>
                        <Col span={10}>
                            <div className="bg-purple-50 p-6 rounded-lg">
                                <div className="flex justify-between mb-2 text-gray-600">
                                    <span>Subtotal:</span>
                                    <span>{formatCurrency(selectedEstimate.final_quotation.subtotal)}</span>
                                </div>
                                {selectedEstimate.final_quotation.discount_amount > 0 && (
                                    <div className="flex justify-between mb-2 text-red-500">
                                        <span>Discount ({selectedEstimate.final_quotation.discount_percent}%):</span>
                                        <span>- {formatCurrency(selectedEstimate.final_quotation.discount_amount)}</span>
                                    </div>
                                )}
                                <Divider className="my-3 border-purple-200" />
                                <div className="flex justify-between text-2xl font-bold text-purple-800">
                                    <span>Total:</span>
                                    <span>{formatCurrency(selectedEstimate.final_quotation.grand_total)}</span>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>

                {/* 4. Footer Actions */}
                <div className="p-6 bg-gray-100 border-t flex justify-between items-center">
                    <Button icon={<PrinterOutlined />} onClick={() => window.print()}>Print / Save PDF</Button>
                    
                    <Space>
                        <Button onClick={() => setModalVisible(false)}>Close</Button>
                        {!selectedEstimate.customer_response?.status && (
                            <>
                                <Button 
                                    danger 
                                    size="large"
                                    onClick={() => openRejectModal(selectedEstimate)}
                                >
                                    Reject
                                </Button>
                                <Button 
                                    type="primary" 
                                    size="large"
                                    icon={<CheckCircleOutlined />}
                                    style={{ background: PURPLE_THEME.success, borderColor: PURPLE_THEME.success }}
                                    onClick={() => accept(selectedEstimate)}
                                >
                                    Accept Quotation
                                </Button>
                            </>
                        )}
                    </Space>
                </div>
            </div>
          ) : selectedEstimate && (
            // Show detailed estimate view if no final_quotation yet
            <div className="p-6">
              <div className="text-center mb-8">
                <Alert 
                  message="Quotation Pending" 
                  description="The final quotation is being prepared by our team. You'll be notified when it's ready for review." 
                  type="info" 
                  showIcon 
                />
              </div>
              
              {/* Estimate Details */}
              <div className="flex justify-between items-center mb-6 p-5 bg-purple-50 rounded-xl border border-purple-100">
                <div>
                  <h3 className="text-xl font-bold text-purple-800 m-0">
                    {selectedEstimate.service_type} - {selectedEstimate.subcategory?.label}
                  </h3>
                  <Text type="secondary">ID: {selectedEstimate._id}</Text>
                </div>
                <Tag color="blue">Status: {selectedEstimate.status}</Tag>
              </div>

              <Row gutter={16}>
                <Col span={14}>
                  {/* Customer Details */}
                  <DetailCard title="Customer Details" icon={<IdcardOutlined />}>
                    <Descriptions column={1} size="small" bordered={false}>
                      <Descriptions.Item label={<Text strong><UserOutlined /> Name</Text>}>
                        {getCustomerName(selectedEstimate.customer)}
                      </Descriptions.Item>
                      <Descriptions.Item label={<Text strong><MailOutlined /> Email</Text>}>
                        {selectedEstimate.customer?.email || selectedEstimate.customer_email || 'N/A'}
                      </Descriptions.Item>
                      <Descriptions.Item label={<Text strong><PhoneOutlined /> Mobile</Text>}>
                        {formatMobileNumber(selectedEstimate.customer?.mobile || selectedEstimate.customer_mobile)}
                      </Descriptions.Item>
                    </Descriptions>
                  </DetailCard>

                  {/* Project Images */}
                  {(selectedEstimate.type_gallery_snapshot?.previewImage?.url || 
                    selectedEstimate.type_gallery_snapshot?.moodboardImages?.length > 0) && (
                    <DetailCard title="Project Images" icon={<PictureOutlined />}>
                      <div className="space-y-4">
                        {selectedEstimate.type_gallery_snapshot?.previewImage?.url && (
                          <div>
                            <Text strong>Preview Image:</Text>
                            <div className="mt-2">
                              <Image
                                width="100%"
                                src={getFullImageUrl(selectedEstimate.type_gallery_snapshot.previewImage.url)}
                                alt={selectedEstimate.type_gallery_snapshot.previewImage.title || 'Preview'}
                                className="rounded-md"
                                fallback="https://via.placeholder.com/300x200?text=No+Image"
                              />
                            </div>
                          </div>
                        )}
                        
                        {selectedEstimate.type_gallery_snapshot?.moodboardImages?.length > 0 && (
                          <div>
                            <Text strong>Moodboard Images ({selectedEstimate.type_gallery_snapshot.moodboardImages.length}):</Text>
                            <div className="mt-2 grid grid-cols-2 gap-3">
                              {selectedEstimate.type_gallery_snapshot.moodboardImages.map((img, idx) => (
                                <div key={idx} className="relative">
                                  <Image
                                    width="100%"
                                    height={120}
                                    src={getFullImageUrl(img.url)}
                                    alt={img.title || `Moodboard ${idx + 1}`}
                                    className="rounded-md object-cover"
                                    fallback="https://via.placeholder.com/150x120?text=Image"
                                  />
                                  <div className="text-xs text-gray-500 mt-1 truncate">{img.title}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </DetailCard>
                  )}
                </Col>

                <Col span={10}>
                  {/* Service & Package Details */}
                  <DetailCard title="Service Details" icon={<ToolOutlined />}>
                    <Descriptions column={1} size="small" bordered={false}>
                      <Descriptions.Item label="Service Type">
                        <Tag color="purple">{selectedEstimate.service_type}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Subcategory">
                        <Text strong>{selectedEstimate.subcategory?.label}</Text>
                        <div className="text-xs text-gray-500 mt-1">{selectedEstimate.subcategory?.description}</div>
                      </Descriptions.Item>
                      <Descriptions.Item label="Package">
                        <div>
                          <Text strong>{selectedEstimate.package?.name}</Text>
                          <div className="text-xs text-gray-500 mt-1">{selectedEstimate.package?.description}</div>
                          <div className="text-xs text-green-600 mt-1">
                            Price: {formatCurrency(selectedEstimate.package?.price, selectedEstimate.package?.currency || 'AED')}
                          </div>
                        </div>
                      </Descriptions.Item>
                    </Descriptions>
                  </DetailCard>

                  {/* Area Specifications */}
                  <DetailCard title="Area Specifications" icon={<CalculatorOutlined />}>
                    <div className="flex justify-around bg-gray-50 p-3 rounded-lg border mb-3">
                      <div className="text-center">
                        <Title level={4} className="m-0" style={{ color: PURPLE_THEME.primary }}>{selectedEstimate.area_sqft}</Title>
                        <Text size="small" type="secondary">Sq.Ft</Text>
                      </div>
                      <Divider type="vertical" style={{ height: '40px' }} />
                      <div className="text-center">
                        <Title level={4} className="m-0">{selectedEstimate.area_length}x{selectedEstimate.area_width}</Title>
                        <Text size="small" type="secondary">Dimensions</Text>
                      </div>
                    </div>
                    <Text strong>Description:</Text>
                    <p className="text-gray-600 mt-1" style={{ fontSize: '13px' }}>{selectedEstimate.description}</p>
                  </DetailCard>

                  {/* Process Timeline */}
                  <DetailCard title="Process Timeline" icon={<HistoryOutlined />}>
                    <Timeline mode="left" className="mt-2" size="small">
                      <Timeline.Item color="green" label="Created">{formatDate(selectedEstimate.createdAt)}</Timeline.Item>
                      <Timeline.Item color="blue" label="Submitted">{formatDate(selectedEstimate.submitted_at)}</Timeline.Item>
                      <Timeline.Item color="orange" label="Status">{selectedEstimate.status}</Timeline.Item>
                    </Timeline>
                  </DetailCard>
                </Col>
              </Row>
              
              <div className="text-right mt-6 pt-4 border-t">
                <Button onClick={() => setModalVisible(false)}>Close</Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Reject Reason Modal */}
        <Modal
          title="Reason for Rejection"
          open={rejectModalVisible}
          onCancel={() => setRejectModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setRejectModalVisible(false)}>Cancel</Button>,
            <Button 
              key="reject" 
              type="primary" 
              danger 
              loading={respondingId === selectedEstimate?._id} 
              onClick={reject} 
              icon={<CloseCircleOutlined />}
            >
              Reject Quotation
            </Button>,
          ]}
          width={500}
        >
          <Alert 
            message="We value your feedback" 
            description="Please let us know why you are rejecting this quotation so we can improve." 
            type="info" 
            showIcon 
            className="mb-4" 
          />
          <TextArea 
            rows={4} 
            placeholder="E.g. Price is too high, timeline doesn't work..." 
            value={rejectReason} 
            onChange={(e) => setRejectReason(e.target.value)} 
          />
        </Modal>

      </div>
    </div>
  );
};

export default MyEstimates;