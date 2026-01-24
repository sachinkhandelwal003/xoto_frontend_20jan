import React, { useState, useEffect } from 'react';
import { apiService } from '../../../../../manageApi/utils/custom.apiservice';
import CustomTable from '../../../pages/custom/CustomTable';
import { useSelector } from "react-redux";

import {
  Drawer, Button, Card, Tag, message, Form, Input, InputNumber,
  Modal, Row, Col, Divider, Table, Space, Select,
  Descriptions, Badge, Typography, Avatar, Tooltip,
  Image, List, Empty
} from 'antd';
import {
  EyeOutlined, FileAddOutlined,
  UserOutlined,
  CalculatorOutlined, 
  PictureOutlined, EnvironmentOutlined,
  IdcardOutlined, QuestionCircleOutlined,
  DeleteOutlined, PlusOutlined,FileTextOutlined 
} from '@ant-design/icons';
import { showSuccessAlert, showErrorAlert } from '../../../../../manageApi/utils/sweetAlert';

// --- Import Freelancer Context ---
import { useFreelancer } from '../../../../../../src/context/FreelancerContext';      

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

// Purple Theme Colors
const PURPLE_THEME = {
  primary: '#722ed1',
  primaryLight: '#9254de',
  primaryBg: '#f9f0ff',
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
  info: '#1890ff',
  gray: '#6b7280',
};

const QuotationLeadsList = () => {
  const user = useSelector((s) => s.auth?.user);
  
  // Use Freelancer Context to access profile/rates
  const { freelancer } = useFreelancer(); 

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals & Drawers
  const [detailsDrawerVisible, setDetailsDrawerVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [viewQuotationModal, setViewQuotationModal] = useState(false);

  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedEstimate, setSelectedEstimate] = useState(null);
  const [mySubmittedQuotation, setMySubmittedQuotation] = useState(null);

  const [pagination, setPagination] = useState({ currentPage: 1, itemsPerPage: 10, totalItems: 0 });
  const [filters, setFilters] = useState({ status: 'assigned' });
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  
  // Single Item State
  const [items, setItems] = useState([{ item: '', quantity: 1, unit_price: 0, total: 0 }]);

  const statusConfig = {
    pending: { label: 'Pending', color: 'warning', bgColor: '#fff7e6', textColor: '#fa8c16' },
    assigned: { label: 'Assigned', color: 'processing', bgColor: '#e6f7ff', textColor: '#1890ff' },
    request_sent: { label: 'Request Sent', color: 'purple', bgColor: '#f9f0ff', textColor: '#722ed1' },
    quotations_received: { label: 'Quotations Received', color: 'success', bgColor: '#f6ffed', textColor: '#52c41a' },
    final_created: { label: 'Final Created', color: 'purple', bgColor: '#f0e6ff', textColor: '#722ed1' },
    superadmin_approved: { label: 'Approved', color: 'success', bgColor: '#f6ffed', textColor: '#52c41a' },
    customer_accepted: { label: 'Accepted', color: 'green', bgColor: '#f6ffed', textColor: '#389e0d' },
    customer_rejected: { label: 'Rejected', color: 'error', bgColor: '#fff1f0', textColor: '#cf1322' }
  };

  const unitOptions = ['sq.ft', 'sq.m', 'lumpsum', 'hour', 'day', 'week', 'month', 'piece', 'set', 'unit', 'lot'];

  // --- Helpers ---
  const formatMobileNumber = (mobileObj) => mobileObj ? `${mobileObj.country_code || ''} ${mobileObj.number || ''}`.trim() : 'N/A';
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
  const formatCurrency = (amount, currency = 'AED') => amount ? `${currency} ${parseFloat(amount).toLocaleString()}` : `${currency} 0`;
  
  const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const getCustomerName = (customer) => {
    if (!customer) return 'N/A';
    if (customer.name) return `${customer.name.first_name || ''} ${customer.name.last_name || ''}`.trim();
    return customer.full_name || customer.email || 'N/A';
  };

  // --- API Calls ---
  const fetchLeads = async (page = 1, limit = 10, filterParams = {}) => {
    setLoading(true);
    try {
      const params = { page, limit, freelancer_id: user?.id, ...filterParams };
      const response = await apiService.get('/estimates', params);
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
    return estimate.freelancer_quotations.some(q => q.freelancer?._id === user.id || q.freelancer === user.id);
  };

  const isSentToFreelancer = (estimate) => {
    if (!estimate.sent_to_freelancers || !user?.id) return false;
    return estimate.sent_to_freelancers.some(f => f._id === user.id || f.id === user.id);
  };

  // --- Components ---
  const StatusBadge = ({ status }) => {
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge
        count={config.label}
        style={{ backgroundColor: config.bgColor, color: config.textColor, border: `1px solid ${config.textColor}20` }}
      />
    );
  };

  const DetailCard = ({ title, icon, children }) => (
    <Card 
      size="small" 
      title={<div className="flex items-center gap-2" style={{ color: PURPLE_THEME.primary }}>{icon} <span className="font-semibold">{title}</span></div>}
      style={{ borderLeft: `4px solid ${PURPLE_THEME.primary}`, marginBottom: '16px', borderRadius: '8px' }}
      headStyle={{ background: PURPLE_THEME.primaryBg, borderBottom: 'none' }}
      bodyStyle={{ padding: '16px' }}
    >
      {children}
    </Card>
  );

  // --- Action Handlers ---
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
    const discountPercent = form.getFieldValue('discount_percent') || 0;
    const discountAmount = (subtotal * discountPercent) / 100;
    const grandTotal = subtotal - discountAmount;
    return { subtotal, discountAmount, grandTotal };
  };

  const updateItemTotal = (index) => {
    const newItems = [...items];
    const price = newItems[index].unit_price || 0;
    const area = selectedEstimate?.area_sqft || 1;
    newItems[index].total = price * area;
    setItems(newItems);
  };

  const handlePageChange = (page, pageSize) => fetchLeads(page, pageSize, filters);
  const handleFilter = (newFilters) => { setFilters(newFilters); fetchLeads(1, pagination.itemsPerPage, newFilters); };

  // --- OPEN CREATE MODAL & AUTO-POPULATE PRICE ---
  const openCreateQuotationModal = (estimate) => {
    if (hasSubmittedQuotation(estimate)) return message.info('You have already submitted a quotation');
    
    setSelectedEstimate(estimate);
    form.resetFields();

    // 1. Find matching service in Freelancer Profile (Rate Card)
    let initialPrice = 0;
    const typeLabel = estimate.type?.label || 'Service'; // e.g. "Paving"
    const subcategoryLabel = estimate.subcategory?.label || 'General';

    if (freelancer && freelancer.services_offered) {
        // Look for matching subcategory/type in freelancer profile
        const matchedService = freelancer.services_offered.find(s => 
            s.subcategories && s.subcategories.some(sub => sub.type?._id === estimate.type?._id)
        );

        if (matchedService) {
            const specificType = matchedService.subcategories.find(sub => sub.type?._id === estimate.type?._id);
            if (specificType) {
                // Use price from profile (Rate Card)
                initialPrice = parseFloat(specificType.price_range) || 0;
            }
        }
    }

    // 2. Pre-fill Single Item Line
    const area = estimate.area_sqft || 1;
    setItems([{ 
        item: `${subcategoryLabel} - ${typeLabel}`, // Auto-generated Item Name
        quantity: area, // Locked to Estimate Area
        unit_price: initialPrice, // Auto-populated from profile, Editable
        total: area * initialPrice 
    }]);

    setCreateModalVisible(true);
  };

  const openViewQuotationModal = (estimate) => {
    const myQ = estimate.freelancer_quotations?.find(q => q.freelancer?._id === user.id || q.freelancer === user.id);
    if (myQ) {
      setMySubmittedQuotation(myQ.quotation || myQ);
      setSelectedEstimate(estimate);
      setViewQuotationModal(true);
    }
  };

  const openDetailsDrawer = (lead) => { setSelectedLead(lead); setDetailsDrawerVisible(true); };

  const handleSubmitQuotation = async (values) => {
    setSubmitting(true);
    try {
      if (!values.scope_of_work?.trim()) { setSubmitting(false); return showErrorAlert("Validation Error", "Scope of work is required."); }
      
      const singleItem = items[0];
      
      const quotationData = { 
          items: [{
              item: singleItem.item,
              description: "", // Removed as per request
              quantity: singleItem.quantity,
              unit_price: singleItem.unit_price,
              total: singleItem.total
          }], 
          scope_of_work: values.scope_of_work, 
          discount_percent: values.discount_percent || 0 
      };
      
      const response = await apiService.post(`/estimates/${selectedEstimate._id}/quotation`, quotationData);
      
      if (response.success) {
        showSuccessAlert("Success", "Quotation submitted successfully");
        setCreateModalVisible(false);
        setSelectedEstimate(null);
        fetchLeads(pagination.currentPage, pagination.itemsPerPage, filters);
      }
    } catch (error) {
      showErrorAlert("Error", error?.response?.data?.message || "Failed to submit quotation");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => { if (user?.id) fetchLeads(1, 10, { status: 'assigned' }); }, [user]);

  // --- Table Columns (New Quotation - Simplified) ---
  const itemColumns = [
    { 
        title: 'Service Type (Item)', 
        dataIndex: 'item', 
        render: (t) => (
            <div className="font-medium text-gray-700">
                {t}
            </div>
        )
    },
    { 
        title: 'Area (Qty)', 
        dataIndex: 'quantity', 
        width: 120, 
        align: 'center',
        render: (t) => <Tag color="blue" style={{ fontSize: 14 }}>{t} sq.ft</Tag> 
    },
    { 
        title: 'Your Rate (Editable)', 
        dataIndex: 'unit_price', 
        width: 180, 
        render: (t, _, i) => (
            <InputNumber 
                min={0} 
                value={t} 
                style={{ width: '100%', borderColor: PURPLE_THEME.primary }} 
                // Allow freelancer to change rate
                onChange={v => { 
                    const n = [...items]; 
                    n[i].unit_price = v || 0; 
                    updateItemTotal(i); 
                }} 
                addonAfter="AED"
            />
        ) 
    },
    { 
        title: 'Total Amount', 
        dataIndex: 'total', 
        width: 180, 
        align: 'right', 
        render: t => <span style={{ color: PURPLE_THEME.success, fontWeight: 'bold', fontSize: 16 }}>{formatCurrency(t)}</span> 
    }
  ];

  // --- Main Table Columns ---
  const columns = [
    { 
      title: 'Customer', width: 220, 
      render: (_, r) => (
        <div className="flex items-center gap-3">
          <Avatar size={40} style={{ background: PURPLE_THEME.primaryBg, color: PURPLE_THEME.primary }} icon={<UserOutlined />} />
          <div>
            <div className="font-semibold">{getCustomerName(r.customer)}</div>
            <div className="text-xs text-gray-400">{formatMobileNumber(r.customer?.mobile)}</div>
          </div>
        </div>
      )
    },
    { 
      title: 'Service Details', width: 200, 
      render: (_, r) => (
        <div>
          <Tag color="purple">{r.service_type?.toUpperCase()}</Tag>
          <div className="text-sm font-medium mt-1">{r.subcategory?.label}</div>
          <div className="text-xs text-gray-500">{r.type?.label}</div>
        </div>
      )
    },
    { 
      title: 'Area', width: 100, 
      render: (_, r) => (
        <div className="text-center">
          <div className="font-bold text-gray-700">{r.area_sqft} <span className="text-xs font-normal">sq.ft</span></div>
        </div>
      )
    },
    { title: 'Status', width: 120, render: (_, r) => <StatusBadge status={r.status} /> },
    { 
      title: 'Actions', width: 180, 
      render: (_, r) => (
        <Space>
          <Tooltip title="View Details">
            <Button size="small" icon={<EyeOutlined />} onClick={() => openDetailsDrawer(r)} />
          </Tooltip>
          {isSentToFreelancer(r) && !hasSubmittedQuotation(r) ? (
            <Button type="primary" size="small" icon={<FileAddOutlined />} onClick={() => openCreateQuotationModal(r)} style={{ background: PURPLE_THEME.primary }}>Quote</Button>
          ) : hasSubmittedQuotation(r) ? (
            <Button size="small" onClick={() => openViewQuotationModal(r)} style={{ color: PURPLE_THEME.success, borderColor: PURPLE_THEME.success }}>View Quote</Button>
          ) : null}
        </Space>
      )
    }
  ];

  const { subtotal, discountAmount, grandTotal } = calculateTotals();

  return (
    <div className="min-h-screen p-6" style={{ background: '#f0f2f5' }}>
      <div className="max-w-screen-2xl mx-auto">
        <Title level={2} style={{ color: PURPLE_THEME.primary, marginBottom: 20 }}>My Estimations</Title>
        
        <Card bodyStyle={{ padding: 0 }} className="shadow-lg">
          <CustomTable 
            columns={columns} 
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
          title={<div className="flex items-center gap-2 text-purple-700"><FileTextOutlined /> Estimate Full Details</div>} 
          width={900} 
          onClose={() => setDetailsDrawerVisible(false)} 
          open={detailsDrawerVisible}
          bodyStyle={{ padding: '24px', backgroundColor: '#fafafa' }}
        >
          {selectedLead && (
            <div className="space-y-6">
              <div className="flex justify-between items-center p-5 bg-white rounded-xl border border-purple-100 shadow-sm">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 m-0">{selectedLead.service_type} - {selectedLead.subcategory?.label}</h3>
                  <div className="text-gray-500 mt-1">Ref: {selectedLead._id.substring(0,8).toUpperCase()}</div>
                </div>
                <StatusBadge status={selectedLead.status} />
              </div>

              <Row gutter={24}>
                <Col span={14}>
                  <DetailCard title="Customer Information" icon={<IdcardOutlined />}>
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Name"><span className="font-medium">{getCustomerName(selectedLead.customer)}</span></Descriptions.Item>
                      <Descriptions.Item label="Email">{selectedLead.customer?.email}</Descriptions.Item>
                      <Descriptions.Item label="Mobile">{formatMobileNumber(selectedLead.customer?.mobile)}</Descriptions.Item>
                      {selectedLead.customer?.location && (
                        <Descriptions.Item label="Address">
                          <div className="text-xs text-gray-500 leading-tight">
                            {selectedLead.customer.location.address}<br/>
                            {selectedLead.customer.location.city}, {selectedLead.customer.location.state}
                          </div>
                        </Descriptions.Item>
                      )}
                    </Descriptions>
                  </DetailCard>

                  {/* Enhanced Estimate Answers Display */}
                  {selectedLead.EstimateAnswers?.length > 0 && (
                     <DetailCard title="Estimation Details" icon={<QuestionCircleOutlined />}>
                        <div className="space-y-3">
                           {selectedLead.EstimateAnswers.map((ans, idx) => (
                              <div key={idx} className="bg-gray-50 p-3 rounded border border-gray-100">
                                 <div className="text-sm font-medium text-gray-700 mb-1">{ans.questionText}</div>
                                 <div className="flex justify-between items-center mt-1">
                                    <Tag color="blue">
                                       {ans.selectedOption?.title || ans.answerValue || 'N/A'}
                                    </Tag>
                                    <span className="font-bold text-green-600">
                                      {formatCurrency(ans.calculatedAmount)}
                                    </span>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </DetailCard>
                  )}
                </Col>

                <Col span={10}>
                  <DetailCard title="Service Specifications" icon={<CalculatorOutlined />}>
                    <div className="bg-purple-50 p-4 rounded-lg text-center mb-4 border border-purple-100">
                       <div className="text-3xl font-bold text-purple-700">{selectedLead.area_sqft}</div>
                       <div className="text-xs text-purple-400 uppercase font-bold tracking-wider">Total Area (Sq.Ft)</div>
                    </div>
                    <Descriptions column={1} size="small" bordered>
                       <Descriptions.Item label="Dimensions">{selectedLead.area_length || '-'} x {selectedLead.area_width || '-'}</Descriptions.Item>
                       <Descriptions.Item label="Type">{selectedLead.type?.label}</Descriptions.Item>
                       <Descriptions.Item label="Category">{selectedLead.subcategory?.label}</Descriptions.Item>
                    </Descriptions>
                    {selectedLead.description && (
                      <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600 italic border border-gray-200">
                        "{selectedLead.description}"
                      </div>
                    )}
                  </DetailCard>

                  {(selectedLead.type_gallery_snapshot?.previewImage?.url || selectedLead.type_gallery_snapshot?.moodboardImages?.length > 0) && (
                    <DetailCard title="Visual References" icon={<PictureOutlined />}>
                       {selectedLead.type_gallery_snapshot?.previewImage?.url && (
                          <div className="mb-3">
                             <div className="text-xs font-bold text-gray-400 mb-1">PREVIEW IMAGE</div>
                             <Image 
                               src={getFullImageUrl(selectedLead.type_gallery_snapshot.previewImage.url)} 
                               className="rounded shadow-sm"
                               style={{ maxHeight: 150, objectFit: 'cover', width: '100%' }}
                             />
                          </div>
                       )}
                       {selectedLead.type_gallery_snapshot?.moodboardImages?.length > 0 && (
                          <div>
                             <div className="text-xs font-bold text-gray-400 mb-1">MOODBOARD</div>
                             <div className="grid grid-cols-3 gap-2">
                                {selectedLead.type_gallery_snapshot.moodboardImages.map((img, i) => (
                                   <Image 
                                     key={i}
                                     src={getFullImageUrl(img.url)}
                                     className="rounded border border-gray-200"
                                     style={{ height: 60, objectFit: 'cover', width: '100%' }}
                                   />
                                ))}
                             </div>
                          </div>
                       )}
                    </DetailCard>
                  )}
                </Col>
              </Row>
            </div>
          )}
        </Drawer>

        {/* --- CREATE QUOTATION MODAL --- */}
        <Modal
          title={<div className="text-xl font-bold text-purple-700">New Quotation</div>}
          open={createModalVisible}
          onCancel={() => setCreateModalVisible(false)}
          footer={null}
          width={1000}
          destroyOnClose
          maskClosable={false}
        >
           <Form form={form} layout="vertical" onFinish={handleSubmitQuotation}>
              <div className="bg-gray-50 p-4 rounded mb-4 border border-gray-200">
                 <Descriptions size="small" column={2}>
                    <Descriptions.Item label="Customer">{getCustomerName(selectedEstimate?.customer)}</Descriptions.Item>
                    <Descriptions.Item label="Service">{selectedEstimate?.service_type}</Descriptions.Item>
                    <Descriptions.Item label="Estimate Type"><Tag color="purple">{selectedEstimate?.type?.label}</Tag></Descriptions.Item>
                    <Descriptions.Item label="Total Area"><strong>{selectedEstimate?.area_sqft} sq.ft</strong></Descriptions.Item>
                 </Descriptions>
              </div>

              <Card size="small" title="Quotation Items" className="mb-4 shadow-sm">
                 <Table 
                   dataSource={items} 
                   columns={itemColumns} 
                   pagination={false} 
                   size="small" 
                   rowKey="sno" 
                 />
              </Card>

              <Row gutter={24}>
                 <Col span={16}>
                    <Form.Item name="scope_of_work" label="Scope of Work / Terms" rules={[{ required: true }]}>
                       <TextArea rows={5} placeholder="Describe the scope of work clearly..." />
                    </Form.Item>
                 </Col>
                 <Col span={8}>
                    <Card size="small" className="bg-purple-50 border-purple-100">
                       <div className="flex justify-between mb-2"><span>Subtotal:</span> <strong>{formatCurrency(calculateTotals().subtotal)}</strong></div>
                       <Form.Item name="discount_percent" label="Discount %" style={{ marginBottom: 12 }}>
                          <InputNumber min={0} max={100} style={{ width: '100%' }} onChange={() => setItems([...items])} />
                       </Form.Item>
                       <div className="flex justify-between text-red-500 mb-2"><span>Discount:</span> -{formatCurrency(calculateTotals().discountAmount)}</div>
                       <Divider style={{ margin: '8px 0' }} />
                       <div className="flex justify-between text-lg font-bold text-purple-700"><span>Grand Total:</span> {formatCurrency(calculateTotals().grandTotal)}</div>
                    </Card>
                 </Col>
              </Row>

              <div className="text-right mt-4">
                 <Button onClick={() => setCreateModalVisible(false)} style={{ marginRight: 8 }}>Cancel</Button>
                 <Button type="primary" htmlType="submit" loading={submitting} style={{ background: PURPLE_THEME.primary }}>Submit Quotation</Button>
              </div>
           </Form>
        </Modal>

        {/* --- VIEW QUOTATION MODAL --- */}
        <Modal
          title="Submitted Quotation"
          open={viewQuotationModal}
          onCancel={() => setViewQuotationModal(false)}
          footer={<Button onClick={() => setViewQuotationModal(false)}>Close</Button>}
          width={800}
        >
           {mySubmittedQuotation && (
              <div className="p-2">
                 <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <div>
                       <div className="text-sm text-gray-500">Quotation Date</div>
                       <div className="font-bold">{formatDate(mySubmittedQuotation.createdAt || new Date())}</div>
                    </div>
                    <Tag color="green" style={{ fontSize: 14, padding: '4px 10px' }}>SUBMITTED</Tag>
                 </div>

                 <Table 
                   dataSource={mySubmittedQuotation.items || []} 
                   pagination={false} 
                   bordered 
                   size="small"
                   columns={[
                      { title: '#', width: 50, render: (_,__,i) => i+1 },
                      { title: 'Item', dataIndex: 'item' },
                      { title: 'Qty', dataIndex: 'quantity', width: 80, align: 'center' },
                      { title: 'Rate', dataIndex: 'unit_price', width: 100, align: 'right', render: v => formatCurrency(v) },
                      { title: 'Total', dataIndex: 'total', width: 120, align: 'right', render: v => <strong>{formatCurrency(v)}</strong> },
                   ]}
                 />

                 <div className="mt-6 flex justify-end">
                    <div className="w-1/3 space-y-2">
                       <div className="flex justify-between"><span>Subtotal:</span> {formatCurrency(mySubmittedQuotation.subtotal || (mySubmittedQuotation.grand_total / (1 - (mySubmittedQuotation.discount_percent/100))))}</div>
                       <div className="flex justify-between text-red-500"><span>Discount ({mySubmittedQuotation.discount_percent}%):</span> -{formatCurrency(mySubmittedQuotation.discount_amount || 0)}</div>
                       <Divider style={{ margin: '8px 0' }} />
                       <div className="flex justify-between text-xl font-bold text-purple-700"><span>Total:</span> {formatCurrency(mySubmittedQuotation.grand_total)}</div>
                    </div>
                 </div>

                 <div className="mt-6 p-4 bg-gray-50 rounded border border-gray-200">
                    <h4 className="font-bold text-gray-700 mb-2">Scope of Work:</h4>
                    <p className="text-gray-600 whitespace-pre-wrap">{mySubmittedQuotation.scope_of_work}</p>
                 </div>
              </div>
           )}
        </Modal>

      </div>
    </div>
  );
};

export default QuotationLeadsList;