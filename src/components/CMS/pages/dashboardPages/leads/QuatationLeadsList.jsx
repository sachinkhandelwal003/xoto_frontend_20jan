import React, { useState, useEffect } from 'react';
import { apiService } from '../../../../../manageApi/utils/custom.apiservice';
import CustomTable from '../../../pages/custom/CustomTable';
// 1. IMPORT LOGO
import logo from "../../../../../assets/img/logoNew.png";

import {
  Drawer, Button, Spin, Card, Tag, message, Form, Input, InputNumber,
  Upload, Modal, Row, Col, Divider, Table, Space, Select,
  Descriptions, Badge, Typography, Collapse, Avatar, Tooltip,
  Image, List, Timeline
} from 'antd';
import {
  EyeOutlined, FileAddOutlined, UploadOutlined, FileTextOutlined,
  CheckCircleOutlined, PlusOutlined, DeleteOutlined,
  UserOutlined, MailOutlined, PhoneOutlined, CalendarOutlined,
  CalculatorOutlined, DollarOutlined, HomeOutlined, ToolOutlined,
  InfoCircleOutlined, PaperClipOutlined, ClockCircleOutlined,
  CheckOutlined, CloseOutlined, TeamOutlined, BuildOutlined,
  PictureOutlined, EnvironmentOutlined, HistoryOutlined,
  IdcardOutlined, StarOutlined
} from '@ant-design/icons';
import { showSuccessAlert, showErrorAlert } from '../../../../../manageApi/utils/sweetAlert';
import { useSelector } from "react-redux";

const { TextArea } = Input;
const { Dragger } = Upload;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
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

const QuotationLeadsList = () => {
  const user = useSelector((s) => s.auth?.user);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals & Drawers
  const [detailsDrawerVisible, setDetailsDrawerVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [viewQuotationModal, setViewQuotationModal] = useState(false);

  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedEstimate, setSelectedEstimate] = useState(null);
  const [mySubmittedQuotation, setMySubmittedQuotation] = useState(null);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0
  });

  const [filters, setFilters] = useState({ status: 'assigned' });
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState([]);

  const [items, setItems] = useState([
    { sno: 1, item: '', description: '', unit: '', quantity: 1, unit_price: 0, total: 0 }
  ]);

  // Status mapping
  const statusConfig = {
    pending: { label: 'Pending', color: 'warning', bgColor: '#fff7e6', textColor: '#fa8c16', icon: <ClockCircleOutlined /> },
    assigned: { label: 'Assigned', color: 'processing', bgColor: '#e6f7ff', textColor: '#1890ff', icon: <UserOutlined /> },
    request_sent: { label: 'Request Sent', color: 'purple', bgColor: '#f9f0ff', textColor: '#722ed1', icon: <FileAddOutlined /> },
    quotations_received: { label: 'Quotations Received', color: 'success', bgColor: '#f6ffed', textColor: '#52c41a', icon: <FileTextOutlined /> },
    final_created: { label: 'Final Created', color: 'purple', bgColor: '#f0e6ff', textColor: '#722ed1', icon: <CheckCircleOutlined /> },
    superadmin_approved: { label: 'Approved', color: 'success', bgColor: '#f6ffed', textColor: '#52c41a', icon: <CheckCircleOutlined /> },
    customer_accepted: { label: 'Customer Accepted', color: 'green', bgColor: '#f6ffed', textColor: '#389e0d', icon: <CheckOutlined /> },
    customer_rejected: { label: 'Customer Rejected', color: 'error', bgColor: '#fff1f0', textColor: '#cf1322', icon: <CloseOutlined /> }
  };

  const unitOptions = ['sq.ft', 'sq.m', 'lumpsum', 'hour', 'day', 'week', 'month', 'piece', 'kg', 'meter', 'set', 'unit', 'lot'];

  // Helpers
  const formatMobileNumber = (mobileObj) => mobileObj ? `${mobileObj.country_code || ''} ${mobileObj.number || ''}`.trim() : 'N/A';
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
  const formatCurrency = (amount, currency = 'AED') => amount ? `${currency} ${parseFloat(amount).toLocaleString()}` : `${currency} 0`;
  
  // Get full image URL
  const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    // Assuming your API base URL is stored somewhere, or use relative path
    return path.startsWith('/') ? `http://localhost:5000${path}` : path;
  };

  // Get customer name
  const getCustomerName = (customer) => {
    if (!customer) return 'N/A';
    if (customer.name) {
      return `${customer.name.first_name || ''} ${customer.name.last_name || ''}`.trim();
    }
    return customer.full_name || customer.email || 'N/A';
  };

  // API Calls
  const fetchLeads = async (page = 1, limit = 10, filterParams = {}) => {
    setLoading(true);
    try {
      const params = { page, limit, freelancer_id: user?.id, ...filterParams };
      const response = await apiService.get('/estimates', params);
      console.log('Freelancer Leads Response:', response.data); // Debug log
      if (response.success) {
        setLeads(response.data || []);
        setPagination(prev => ({
          ...prev,
          currentPage: response.pagination?.page || page,
          itemsPerPage: response.pagination?.limit || limit,
          totalItems: response.pagination?.total || 0
        }));
      }
    } catch (error) {
      showErrorAlert('Error', 'Failed to fetch estimates');
    } finally {
      setLoading(false);
    }
  };

  const hasSubmittedQuotation = (estimate) => {
    if (!estimate.freelancer_quotations || !user?.id) return false;
    return estimate.freelancer_quotations.some(q => q.freelancer._id === user.id);
  };

  const isSentToFreelancer = (estimate) => {
    if (!estimate.sent_to_freelancers || !user?.id) return false;
    return estimate.sent_to_freelancers.some(f => f._id === user.id);
  };

  // Components
  const StatusBadge = ({ status }) => {
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge
        count={config.label}
        style={{ backgroundColor: config.bgColor, color: config.textColor, border: `1px solid ${config.textColor}20` }}
        className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
      >
        {config.icon} <span>{config.label}</span>
      </Badge>
    );
  };

  const DetailCard = ({ title, icon, children, style = {} }) => (
    <Card 
      size="small" 
      title={<div className="flex items-center gap-2" style={{ color: PURPLE_THEME.primary }}>{icon} <span className="font-semibold">{title}</span></div>}
      style={{ borderLeft: `4px solid ${PURPLE_THEME.primary}`, marginBottom: '16px', ...style }}
      headStyle={{ background: PURPLE_THEME.primaryBg }}
    >
      {children}
    </Card>
  );

  // Logic
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
    const discountPercent = form.getFieldValue('discount_percent') || 0;
    const discountAmount = (subtotal * discountPercent) / 100;
    const grandTotal = subtotal - discountAmount;
    return { subtotal, discountAmount, grandTotal, discountPercent };
  };

  const updateItemTotal = (index) => {
    const newItems = [...items];
    newItems[index].total = (newItems[index].quantity || 0) * (newItems[index].unit_price || 0);
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { sno: items.length + 1, item: '', description: '', unit: '', quantity: 1, unit_price: 0, total: 0 }]);
  
  const removeItem = (index) => {
    if (items.length === 1) return message.warning('At least one item is required');
    const updated = items.filter((_, i) => i !== index).map((item, idx) => ({ ...item, sno: idx + 1 }));
    setItems(updated);
  };

  const handlePageChange = (page, pageSize) => fetchLeads(page, pageSize, filters);
  const handleFilter = (newFilters) => { setFilters(newFilters); fetchLeads(1, pagination.itemsPerPage, newFilters); };

  const openCreateQuotationModal = (estimate) => {
    if (!isSentToFreelancer(estimate)) return message.error('This estimate was not sent to you');
    if (hasSubmittedQuotation(estimate)) return message.info('You have already submitted a quotation');
    setSelectedEstimate(estimate);
    form.resetFields();
    setItems([{ sno: 1, item: '', description: '', unit: '', quantity: 1, unit_price: 0, total: 0 }]);
    setCreateModalVisible(true);
  };

  const openViewQuotationModal = (estimate) => {
    const myQ = estimate.freelancer_quotations?.find(q => q.freelancer._id === user.id);
    if (myQ) {
      setMySubmittedQuotation(myQ.quotation);
      setSelectedEstimate(estimate);
      setViewQuotationModal(true);
    }
  };

  const openDetailsDrawer = (lead) => { 
    setSelectedLead(lead); 
    setDetailsDrawerVisible(true); 
  };

  const handleSubmitQuotation = async (values) => {
    setSubmitting(true);
    try {
      if (!values.scope_of_work?.trim()) { setSubmitting(false); return showErrorAlert("Validation Error", "Scope of work is required."); }
      const filteredItems = items.filter(i => i.item.trim() !== "");
      if (filteredItems.length === 0) { setSubmitting(false); return showErrorAlert("Validation Error", "At least one item is required."); }
      
      const quotationData = { 
        items: filteredItems, 
        scope_of_work: values.scope_of_work, 
        discount_percent: values.discount_percent || 0 
      };
      const response = await apiService.post(`/estimates/${selectedEstimate._id}/quotation`, quotationData);
      
      if (response.success) {
        showSuccessAlert("Success", "Quotation submitted successfully");
        setCreateModalVisible(false);
        setSelectedEstimate(null);
        form.resetFields();
        fetchLeads(pagination.currentPage, pagination.itemsPerPage, filters);
      }
    } catch (error) {
      showErrorAlert("Error", error?.response?.data?.message || "Failed to submit quotation");
    } finally {
      setSubmitting(false);
    }
  };

  // Columns
  const itemColumns = [
    { title: '#', dataIndex: 'sno', width: 50, align: 'center', render: t => <Badge count={t} style={{ backgroundColor: PURPLE_THEME.primary }} /> },
    { title: 'Item', dataIndex: 'item', render: (t, _, i) => <Input value={t} placeholder="Item name" onChange={e => { const n = [...items]; n[i].item = e.target.value; setItems(n); }} /> },
    { title: 'Desc', dataIndex: 'description', render: (t, _, i) => <Input value={t} placeholder="Description" onChange={e => { const n = [...items]; n[i].description = e.target.value; setItems(n); }} /> },
    { title: 'Unit', dataIndex: 'unit', width: 90, render: (t, _, i) => <Select value={t} onChange={v => { const n = [...items]; n[i].unit = v; setItems(n); }} style={{ width: '100%' }}>{unitOptions.map(u => <Option key={u} value={u}>{u}</Option>)}</Select> },
    { title: 'Qty', dataIndex: 'quantity', width: 80, render: (t, _, i) => <InputNumber min={0} value={t} style={{ width: '100%' }} onChange={v => { const n = [...items]; n[i].quantity = v || 0; setItems(n); updateItemTotal(i); }} /> },
    { title: 'Price', dataIndex: 'unit_price', width: 110, render: (t, _, i) => <InputNumber min={0} value={t} style={{ width: '100%' }} onChange={v => { const n = [...items]; n[i].unit_price = v || 0; setItems(n); updateItemTotal(i); }} /> },
    { title: 'Total', dataIndex: 'total', width: 100, align: 'right', render: t => <span style={{ color: PURPLE_THEME.success, fontWeight: 'bold' }}>{t?.toLocaleString()}</span> },
    { title: '', width: 50, render: (_, __, i) => <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeItem(i)} disabled={items.length === 1} /> }
  ];

  const getColumns = () => [
    { 
      title: 'Customer', 
      width: 220, 
      render: (_, r) => {
        const customerName = getCustomerName(r.customer);
        const customerEmail = r.customer?.email || r.customer_email || 'N/A';
        
        return (
          <div className="flex items-center gap-3">
            <Avatar size={40} style={{ background: PURPLE_THEME.primaryBg, color: PURPLE_THEME.primary }} icon={<UserOutlined />} />
            <div>
              <div className="font-semibold">{customerName}</div>
              <div className="text-xs text-gray-500">{customerEmail}</div>
              <div className="text-xs text-gray-400">{formatMobileNumber(r.customer?.mobile || r.customer_mobile)}</div>
            </div>
          </div>
        );
      }
    },
    { 
      title: 'Service Details', 
      width: 180, 
      render: (_, r) => (
        <div>
          <Tag color="purple">{r.service_type?.toUpperCase()}</Tag>
          <div className="text-sm font-medium mt-1">{r.subcategory?.label}</div>
          <div className="text-xs text-gray-500">{r.type?.label}</div>
          <div className="text-xs text-gray-400">{r.package?.name}</div>
        </div>
      )
    },
    { 
      title: 'Area', 
      width: 100, 
      render: (_, r) => (
        <div className="text-center">
          <div className="font-bold text-gray-700">{r.area_sqft} <span className="text-xs font-normal">sq.ft</span></div>
          <div className="text-xs text-gray-400">{r.area_length} x {r.area_width}</div>
        </div>
      )
    },
    { 
      title: 'Status', 
      width: 120, 
      render: (_, r) => <StatusBadge status={r.status} /> 
    },
    { 
      title: 'Your Quote', 
      width: 140, 
      render: (_, r) => {
        if (!isSentToFreelancer(r)) return <Tag color="default">Not Sent</Tag>;
        if (hasSubmittedQuotation(r)) {
          const q = r.freelancer_quotations?.find(x => x.freelancer._id === user.id);
          return (
            <div className="text-center">
              <Tag color="success">Submitted</Tag>
              <div className="text-xs text-gray-500 mt-1">{formatCurrency(q?.quotation?.grand_total)}</div>
            </div>
          );
        }
        return <Tag color="orange">Pending</Tag>;
      }
    },
    { 
      title: 'Actions', 
      width: 180, 
      render: (_, r) => (
        <Space>
          <Tooltip title="View Details">
            <Button size="small" icon={<EyeOutlined />} onClick={() => openDetailsDrawer(r)} />
          </Tooltip>
          {isSentToFreelancer(r) && !hasSubmittedQuotation(r) && (
            <Button 
              type="primary" 
              size="small" 
              icon={<FileAddOutlined />} 
              onClick={() => openCreateQuotationModal(r)} 
              style={{ background: PURPLE_THEME.primary }}
            >
              Quote
            </Button>
          )}
          {hasSubmittedQuotation(r) && (
            <Button 
              size="small" 
              onClick={() => openViewQuotationModal(r)} 
              style={{ color: PURPLE_THEME.success, borderColor: PURPLE_THEME.success }}
            >
              View
            </Button>
          )}
        </Space>
      )
    }
  ];

  const { subtotal, discountAmount, grandTotal } = calculateTotals();

  useEffect(() => { 
    if (user?.id) fetchLeads(1, 10, { status: 'assigned' }); 
  }, [user]);

  return (
    <div className="min-h-screen p-6" style={{ background: PURPLE_THEME.light }}>
      <div className="max-w-screen-2xl mx-auto">
        <Title level={2} style={{ color: PURPLE_THEME.dark, marginBottom: 20 }}>
My Estimations        </Title>
        
        {/* Summary Stats */}
        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card className="text-center shadow-sm">
              <Title level={4} style={{ color: PURPLE_THEME.primary }}>
                {leads.length}
              </Title>
              <Text type="secondary">Total Leads</Text>
            </Card>
          </Col>
          <Col span={6}>
            <Card className="text-center shadow-sm">
              <Title level={4} style={{ color: PURPLE_THEME.success }}>
                {leads.filter(l => hasSubmittedQuotation(l)).length}
              </Title>
              <Text type="secondary">Submitted Quotes</Text>
            </Card>
          </Col>
          <Col span={6}>
            <Card className="text-center shadow-sm">
              <Title level={4} style={{ color: PURPLE_THEME.warning }}>
                {leads.filter(l => isSentToFreelancer(l) && !hasSubmittedQuotation(l)).length}
              </Title>
              <Text type="secondary">Pending Quotes</Text>
            </Card>
          </Col>
          <Col span={6}>
            <Card className="text-center shadow-sm">
              <Title level={4} style={{ color: PURPLE_THEME.info }}>
                {leads.filter(l => isSentToFreelancer(l)).length}
              </Title>
              <Text type="secondary">Assigned to You</Text>
            </Card>
          </Col>
        </Row>

        <Card bodyStyle={{ padding: 0 }} className="shadow-lg">
          <CustomTable 
            columns={getColumns()} 
            data={leads} 
            totalItems={pagination.totalItems} 
            currentPage={pagination.currentPage} 
            itemsPerPage={pagination.itemsPerPage} 
            onPageChange={handlePageChange} 
            onFilter={handleFilter} 
            loading={loading} 
          />
        </Card>

        {/* --- DETAILS DRAWER --- */}
        <Drawer 
          title={
            <div className="flex items-center gap-2 text-purple-700">
              <FileTextOutlined /> Estimate Full Details
            </div>
          } 
          width={1100} 
          onClose={() => setDetailsDrawerVisible(false)} 
          open={detailsDrawerVisible}
        >
          {selectedLead && (
            <div className="space-y-4">
              {/* Lead Header */}
              <div className="flex justify-between items-center mb-6 p-5 bg-purple-50 rounded-xl border border-purple-100 shadow-sm">
                <div>
                  <h3 className="text-xl font-bold text-purple-800 m-0">
                    {selectedLead.service_type} - {selectedLead.subcategory?.label}
                  </h3>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Tag>

                   {selectedLead.status} 
                  </Tag>
                </div>
              </div>

              <Row gutter={16}>
                <Col span={14}>
                  {/* Customer Details */}
                  <DetailCard title="Customer Details" icon={<IdcardOutlined />}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Descriptions column={1} size="small" bordered={false}>
                          <Descriptions.Item label={<Text strong><UserOutlined /> Name</Text>}>
                            {getCustomerName(selectedLead.customer)}
                          </Descriptions.Item>
                          <Descriptions.Item label={<Text strong><MailOutlined /> Email</Text>}>
                            {selectedLead.customer?.email || selectedLead.customer_email || 'N/A'}
                          </Descriptions.Item>
                          <Descriptions.Item label={<Text strong><PhoneOutlined /> Mobile</Text>}>
                            {formatMobileNumber(selectedLead.customer?.mobile || selectedLead.customer_mobile)}
                          </Descriptions.Item>
                        </Descriptions>
                      </Col>
                      <Col span={12}>
                        {selectedLead.customer?.location && (
                          <div>
                            <Text strong><EnvironmentOutlined /> Location</Text>
                            <div className="text-gray-600 mt-1" style={{ fontSize: '13px' }}>
                              <div>{selectedLead.customer.location.address}</div>
                              <div>{selectedLead.customer.location.city}, {selectedLead.customer.location.state}</div>
                              <div>{selectedLead.customer.location.country}</div>
                            </div>
                          </div>
                        )}
                      </Col>
                    </Row>
                  </DetailCard>

                  {/* Project Images */}
                  {(selectedLead.type_gallery_snapshot?.previewImage?.url || 
                    selectedLead.type_gallery_snapshot?.moodboardImages?.length > 0) && (
                    <DetailCard title="Project Images" icon={<PictureOutlined />}>
                      <div className="space-y-4">
                        {selectedLead.type_gallery_snapshot?.previewImage?.url && (
                          <div>
                            <Text strong>Preview Image:</Text>
                            <div className="mt-2">
                              <Image
                                width="100%"
                                src={getFullImageUrl(selectedLead.type_gallery_snapshot.previewImage.url)}
                                alt={selectedLead.type_gallery_snapshot.previewImage.title || 'Preview'}
                                className="rounded-md"
                                fallback="https://via.placeholder.com/300x200?text=No+Image"
                              />
                            </div>
                          </div>
                        )}
                        
                        {selectedLead.type_gallery_snapshot?.moodboardImages?.length > 0 && (
                          <div>
                            <Text strong>Moodboard Images ({selectedLead.type_gallery_snapshot.moodboardImages.length}):</Text>
                            <div className="mt-2 grid grid-cols-2 gap-3">
                              {selectedLead.type_gallery_snapshot.moodboardImages.map((img, idx) => (
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

                  {/* Attachments */}
                  {selectedLead.attachments?.length > 0 && (
                    <DetailCard title="Attachments" icon={<PaperClipOutlined />}>
                      <List
                        size="small"
                        dataSource={selectedLead.attachments}
                        renderItem={(item, index) => (
                          <List.Item>
                            <List.Item.Meta
                              avatar={<FileTextOutlined style={{ color: PURPLE_THEME.primary }} />}
                              title={<a href={getFullImageUrl(item.url)} target="_blank" rel="noopener noreferrer">{item.title || `Attachment ${index + 1}`}</a>}
                              description={item.description || 'No description'}
                            />
                          </List.Item>
                        )}
                      />
                    </DetailCard>
                  )}
                </Col>

                <Col span={10}>
                  {/* Service & Package Details */}
                  <DetailCard title="Service Details" icon={<ToolOutlined />}>
                    <Descriptions column={1} size="small" bordered={false}>
                      <Descriptions.Item label="Service Type">
                        <Tag color="purple">{selectedLead.service_type}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Subcategory">
                        <Text strong>{selectedLead.subcategory?.label}</Text>
                        <div className="text-xs text-gray-500 mt-1">{selectedLead.subcategory?.description}</div>
                      </Descriptions.Item>
                      <Descriptions.Item label="Service Type">
                        <Text strong>{selectedLead.type?.label}</Text>
                        <div className="text-xs text-gray-500 mt-1">{selectedLead.type?.description}</div>
                      </Descriptions.Item>
                      <Descriptions.Item label="Package">
                        <div>
                          <Text strong>{selectedLead.package?.name}</Text>
                          <div className="text-xs text-gray-500 mt-1">{selectedLead.package?.description}</div>
                          <div className="text-xs text-green-600 mt-1">
                            Price: {formatCurrency(selectedLead.package?.price, selectedLead.package?.currency || 'AED')}
                          </div>
                          {selectedLead.package?.features && (
                            <div className="mt-2">
                              <Text strong className="text-xs">Features:</Text>
                              <ul className="text-xs text-gray-600 pl-4 mt-1">
                                {selectedLead.package.features.slice(0, 3).map((f, i) => (
                                  <li key={i}>{f}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </Descriptions.Item>
                    </Descriptions>
                  </DetailCard>

                  {/* Area Specifications */}
                  <DetailCard title="Area Specifications" icon={<CalculatorOutlined />}>
                    <div className="flex justify-around bg-gray-50 p-3 rounded-lg border mb-3">
                      <div className="text-center">
                        <Title level={4} className="m-0" style={{ color: PURPLE_THEME.primary }}>{selectedLead.area_sqft}</Title>
                        <Text size="small" type="secondary">Sq.Ft</Text>
                      </div>
                      <Divider type="vertical" style={{ height: '40px' }} />
                      <div className="text-center">
                        <Title level={4} className="m-0">{selectedLead.area_length}x{selectedLead.area_width}</Title>
                        <Text size="small" type="secondary">Dimensions</Text>
                      </div>
                    </div>
                    <Text strong>Description:</Text>
                    <p className="text-gray-600 mt-1" style={{ fontSize: '13px' }}>{selectedLead.description}</p>
                  </DetailCard>

              

                  {/* Process Timeline */}
                  <DetailCard title="Process Timeline" icon={<HistoryOutlined />}>
                    <Timeline mode="left" className="mt-2" size="small">
                      <Timeline.Item color="green" label="Created">{formatDate(selectedLead.createdAt)}</Timeline.Item>
                      <Timeline.Item color="blue" label="Assigned">{formatDate(selectedLead.assigned_at)}</Timeline.Item>
                      <Timeline.Item 
                        color={selectedLead.sent_to_freelancers?.length > 0 ? 'purple' : 'gray'} 
                        label="Freelancers"
                      >
                        Sent to {selectedLead.sent_to_freelancers?.length || 0} freelancer(s)
                      </Timeline.Item>
                      <Timeline.Item color="orange" label="Status">{selectedLead.supervisor_progress}</Timeline.Item>
                    </Timeline>
                  </DetailCard>
                </Col>
              </Row>
            </div>
          )}
        </Drawer>

        {/* --- CREATE QUOTATION MODAL --- */}
        <Modal
          title={null}
          open={createModalVisible}
          onCancel={() => setCreateModalVisible(false)}
          footer={null}
          width={1000}
          style={{ top: 20 }}
          destroyOnClose
        >
          {selectedEstimate && (
            <Form form={form} layout="vertical" onFinish={handleSubmitQuotation}>
              <div className="p-4">
                {/* LOGO HEADER */}
                <div className="flex justify-between items-start border-b pb-4 mb-6">
                  <div>
                    <img src={logo} alt="Company Logo" style={{ height: 50, marginBottom: 10 }} />
                    <div className="text-gray-500 text-xs">
                      Freelancer Portal<br />
                      Quotation Submission
                    </div>
                  </div>
                  <div className="text-right">
                    <Title level={3} style={{ color: PURPLE_THEME.primary, margin: 0 }}>NEW QUOTATION</Title>
                    <Text type="secondary">Ref: {selectedEstimate._id.substring(0,8).toUpperCase()}</Text>
                    <div className="text-sm font-bold mt-1">{getCustomerName(selectedEstimate.customer)}</div>
                    <div className="text-xs text-gray-500">
                      {selectedEstimate.service_type} - {selectedEstimate.subcategory?.label}
                    </div>
                  </div>
                </div>

                <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-2">
                  <Card 
                    title="Items Breakdown" 
                    size="small" 
                    extra={
                      <Button icon={<PlusOutlined />} onClick={addItem} type="dashed">
                        Add Item
                      </Button>
                    }
                  >
                    <Table 
                      columns={itemColumns} 
                      dataSource={items} 
                      pagination={false} 
                      size="small" 
                      rowKey={(_, i) => i} 
                    />
                  </Card>

                  <Row gutter={24}>
                    <Col span={14}>
                      <Form.Item 
                        name="scope_of_work" 
                        label="Scope of Work & Notes" 
                        rules={[{ required: true, message: 'Please enter scope of work' }]}
                      >
                        <TextArea rows={6} placeholder="Detailed scope of work, materials to be used, timeline, etc..." />
                      </Form.Item>
                    </Col>
                    <Col span={10}>
                      <div className="bg-purple-50 p-4 rounded">
                        <div className="flex justify-between mb-2">
                          <span>Subtotal:</span>
                          <strong>{formatCurrency(subtotal)}</strong>
                        </div>
                        <Form.Item name="discount_percent" label="Discount %">
                          <InputNumber 
                            min={0} 
                            max={100} 
                            addonAfter="%" 
                            style={{ width: '100%' }} 
                            onChange={() => {}}
                          />
                        </Form.Item>
                        <div className="flex justify-between mb-2 text-red-500">
                          <span>Discount:</span>
                          <span>-{formatCurrency(discountAmount)}</span>
                        </div>
                        <Divider />
                        <div className="flex justify-between text-xl font-bold text-purple-700">
                          <span>Grand Total:</span>
                          <span>{formatCurrency(grandTotal)}</span>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>

                <div className="text-right mt-4 pt-4 border-t">
                  <Button onClick={() => setCreateModalVisible(false)} className="mr-2">
                    Cancel
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={submitting} 
                    style={{ background: PURPLE_THEME.primary }}
                  >
                    Submit Quotation
                  </Button>
                </div>
              </div>
            </Form>
          )}
        </Modal>

        {/* --- VIEW SUBMITTED QUOTATION MODAL --- */}
        <Modal
          title={null}
          open={viewQuotationModal}
          onCancel={() => setViewQuotationModal(false)}
          footer={null}
          width={900}
          style={{ top: 20 }}
        >
          {mySubmittedQuotation && selectedEstimate && (
            <div className="p-4 bg-white">
              {/* LOGO HEADER FOR VIEW */}
              <div className="flex justify-between items-start border-b pb-6 mb-6">
                <div>
                  <img src={logo} alt="Company Logo" style={{ height: 60, marginBottom: 10 }} />
                  <div className="text-gray-500 text-sm">
                    Freelancer Quotation<br />
                    Submitted via Portal
                  </div>
                </div>
                <div className="text-right">
                  <h1 className="text-2xl font-bold text-gray-700 m-0">QUOTATION</h1>
                  <div className="mt-1 text-gray-500">
                    <div>Date: {formatDate(mySubmittedQuotation.createdAt || selectedEstimate.updatedAt)}</div>
                    <div>Status: <span className="text-green-600 font-bold">SUBMITTED</span></div>
                    <div>For: {getCustomerName(selectedEstimate.customer)}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <Table 
                  dataSource={mySubmittedQuotation.items || []} 
                  pagination={false} 
                  columns={[
                    { title: '#', width: 50, render: (_,__,i) => i+1 },
                    { title: 'Item', dataIndex: 'item', width: 200 },
                    { title: 'Description', dataIndex: 'description' },
                    { title: 'Qty', dataIndex: 'quantity', width: 80 },
                    { title: 'Rate', dataIndex: 'unit_price', width: 100, render: v => formatCurrency(v) },
                    { title: 'Total', dataIndex: 'total', width: 120, align: 'right', render: v => <strong>{formatCurrency(v)}</strong> }
                  ]} 
                  bordered
                  size="small"
                />

                <Row gutter={24}>
                  <Col span={14}>
                    <div className="p-4 bg-gray-50 rounded border">
                      <h4 className="font-bold text-gray-700">Scope of Work:</h4>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">
                        {mySubmittedQuotation.scope_of_work}
                      </p>
                    </div>
                  </Col>
                  <Col span={10}>
                    <div className="text-right space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span> 
                        <span>
                          {formatCurrency(
                            mySubmittedQuotation.subtotal || 
                            (mySubmittedQuotation.grand_total / (1 - (mySubmittedQuotation.discount_percent/100)))
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-red-500">
                        <span>Discount ({mySubmittedQuotation.discount_percent || 0}%):</span> 
                        <span>-{formatCurrency(mySubmittedQuotation.discount_amount || 0)}</span>
                      </div>
                      <div className="flex justify-between text-2xl font-bold text-purple-700 border-t pt-2 mt-2">
                        <span>Total:</span> 
                        <span>{formatCurrency(mySubmittedQuotation.grand_total)}</span>
                      </div>
                    </div>
                  </Col>
                </Row>

                {/* Estimate Info */}
                <Card size="small" title="Original Estimate Details">
                  <Descriptions column={2} size="small">
                    <Descriptions.Item label="Service">{selectedEstimate.service_type}</Descriptions.Item>
                    <Descriptions.Item label="Subcategory">{selectedEstimate.subcategory?.label}</Descriptions.Item>
                    <Descriptions.Item label="Area">{selectedEstimate.area_sqft} sq.ft</Descriptions.Item>
                    <Descriptions.Item label="Package">{selectedEstimate.package?.name}</Descriptions.Item>
                    <Descriptions.Item label="Customer">{getCustomerName(selectedEstimate.customer)}</Descriptions.Item>
                    <Descriptions.Item label="Submitted">{formatDate(mySubmittedQuotation.createdAt)}</Descriptions.Item>
                  </Descriptions>
                </Card>
              </div>
              
              <div className="text-right mt-6 pt-4 border-t">
                <Button onClick={() => setViewQuotationModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default QuotationLeadsList;