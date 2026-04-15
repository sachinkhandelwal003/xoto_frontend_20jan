import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../../../manageApi/utils/custom.apiservice';
import {
  Card, Steps, Button, Typography, Row, Col, Avatar, 
  Tag, Descriptions, Divider, Spin, message, Modal, Input, Checkbox, Badge, Progress
} from 'antd';
import {
  UserOutlined, FileTextOutlined, BankOutlined, 
  CheckCircleOutlined, InfoCircleOutlined, FilePdfOutlined, 
  SafetyCertificateOutlined, EyeOutlined, HomeOutlined, 
  DollarCircleOutlined, ClockCircleOutlined, GlobalOutlined, PhoneOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

// BRAND COLOR
const THEME_COLOR = "#5C039B";

const CreateProposalAdmin = () => {
  // --- STATE ---
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Data State
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadDocuments, setLeadDocuments] = useState([]);
  
  const [bankProducts, setBankProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]); 
  
  const [coverNote, setCoverNote] = useState('');

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);
  
  const [viewingDoc, setViewingDoc] = useState(null);

  // --- API CALLS ---
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.get('/vault/lead/admin/all?page=1&limit=50&status=Qualified');
      if (res?.success) setLeads(res.data || []);
    } catch (err) {
      message.error("Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLeadDocuments = async (leadId) => {
    setLoading(true);
    try {
      const res = await apiService.get(`/vault/lead/documents/${leadId}`);
      if (res?.success) setLeadDocuments(res.data || []);
    } catch (err) {
      message.error("Failed to fetch lead documents");
    } finally {
      setLoading(false);
    }
  };

  const fetchBankProducts = async () => {
    setLoading(true);
    try {
      const res = await apiService.get('/bank/products/get-all-bank-products?page=1&limit=50');
      if (res?.success) setBankProducts(res.data || []);
    } catch (err) {
      message.error("Failed to fetch bank products");
    } finally {
      setLoading(false);
    }
  };

  // --- LIFECYCLE ---
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    if (currentStep === 3 && selectedLead && coverNote === '') {
      const bankNames = selectedProducts.map(p => p.bankInfo?.bankName).join(', ');
      const defaultNote = `Dear ${selectedLead.customerInfo?.fullName},\n\nThank you for choosing Xoto Vault. Based on your requirements (property value AED ${selectedLead.propertyDetails?.propertyValue?.toLocaleString()}, monthly salary AED ${selectedLead.customerInfo?.monthlySalary?.toLocaleString()}), we have found the best mortgage options for you from ${bankNames}.\n\nPlease review the attached proposal and let us know if you have any questions.\n\nBest regards,\nXoto Vault Team`;
      setCoverNote(defaultNote);
    }
  }, [currentStep, selectedLead, selectedProducts, coverNote]);

  // --- HANDLERS ---
  const handleNext = async () => {
    if (currentStep === 0 && !selectedLead) return message.warning("Please select a lead first.");
    if (currentStep === 2 && selectedProducts.length === 0) return message.warning("Please select at least one bank product.");

    if (currentStep === 0) await fetchLeadDocuments(selectedLead._id);
    if (currentStep === 1 && bankProducts.length === 0) await fetchBankProducts();

    setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => setCurrentStep(prev => prev - 1);

  const toggleProductSelection = (product) => {
    setSelectedProducts(prev => {
      const isSelected = prev.find(p => p._id === product._id);
      if (isSelected) return prev.filter(p => p._id !== product._id);
      return [...prev, product];
    });
  };

  const openProductDetails = (product) => {
    setViewingProduct(product);
    setIsProductModalOpen(true);
  };

  const submitProposal = async () => {
    if (!coverNote.trim()) return message.warning("Cover note is required.");
    setSubmitting(true);
    
    const payload = {
      leadId: selectedLead._id,
      selectedBankProducts: selectedProducts.map(p => ({
        bankProductId: p._id,
        snapshotRate: p.offerSummary?.initialRate,
        snapshotFeatures: p.features?.keyFeatures || ["Standard features apply"],
        snapshotMaxLtv: p.loanDetails?.maxLoanToValue
      })),
      coverNote: coverNote
    };

    try {
      const res = await apiService.post('/vault/lead/proposals', payload);
      if (res?.success) {
        message.success("Proposal created successfully!");
        setCurrentStep(0);
        setSelectedLead(null);
        setSelectedProducts([]);
        setCoverNote('');
      } else {
        message.error("Failed to create proposal");
      }
    } catch (err) {
      message.error("Error submitting proposal");
    } finally {
      setSubmitting(false);
    }
  };

  // --- RENDER STEPS ---
  const renderStep0 = () => (
    <div style={{ animation: 'fadeIn 0.5s' }}>
      <Title level={4} style={{ color: THEME_COLOR, marginBottom: 24 }}>Select a Qualified Lead</Title>
      {loading ? <div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div> : (
        <Row gutter={[16, 16]}>
          {leads.map(lead => (
            <Col xs={24} md={12} lg={8} key={lead._id}>
              <Card 
                hoverable 
                onClick={() => setSelectedLead(lead)}
                style={{ 
                  borderColor: selectedLead?._id === lead._id ? THEME_COLOR : '#f0f0f0',
                  borderWidth: selectedLead?._id === lead._id ? 2 : 1,
                  borderRadius: 12
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <Avatar icon={<UserOutlined />} style={{ backgroundColor: THEME_COLOR }} />
                  <div>
                    <Text strong style={{ display: 'block', fontSize: 16 }}>{lead.customerInfo?.fullName}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{lead.customerInfo?.email}</Text>
                  </div>
                </div>
                <Divider style={{ margin: '12px 0' }} />
                <Row>
                  <Col span={12}><Text type="secondary" style={{fontSize: 12}}>Required Loan:</Text><br/><b>AED {lead.propertyDetails?.loanAmountRequired?.toLocaleString()}</b></Col>
                  <Col span={12}><Text type="secondary" style={{fontSize: 12}}>Salary:</Text><br/><b>AED {lead.customerInfo?.monthlySalary?.toLocaleString()}</b></Col>
                </Row>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );

  const renderStep1 = () => {
    const docStats = selectedLead?.documentCollection || {};
    return (
      <div style={{ animation: 'fadeIn 0.5s' }}>
        <Title level={4} style={{ color: THEME_COLOR, marginBottom: 24 }}>Comprehensive Lead Intelligence</Title>
        <Row gutter={[24, 24]}>
          {/* LEFT: LEAD DETAILS */}
          <Col xs={24} lg={16}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* Profile */}
              <Card title={<span><UserOutlined style={{color: THEME_COLOR}}/> Customer Profile</span>} style={{ borderRadius: 12 }} headStyle={{ borderBottom: '1px solid #f0f0f0' }}>
                <Descriptions bordered size="small" column={2}>
                  <Descriptions.Item label="Full Name"><Text strong>{selectedLead?.customerInfo?.fullName}</Text></Descriptions.Item>
                  <Descriptions.Item label="Nationality"><Tag>{selectedLead?.customerInfo?.nationality}</Tag></Descriptions.Item>
                  <Descriptions.Item label="Email">{selectedLead?.customerInfo?.email}</Descriptions.Item>
                  <Descriptions.Item label="Mobile">{selectedLead?.customerInfo?.mobileNumber}</Descriptions.Item>
                  <Descriptions.Item label="Occupation">{selectedLead?.customerInfo?.occupation}</Descriptions.Item>
                  <Descriptions.Item label="Employer">{selectedLead?.customerInfo?.employer}</Descriptions.Item>
                  <Descriptions.Item label="Marital Status">{selectedLead?.customerInfo?.maritalStatus}</Descriptions.Item>
                  <Descriptions.Item label="Dependents">{selectedLead?.customerInfo?.numberOfDependents}</Descriptions.Item>
                  <Descriptions.Item label="Monthly Salary" span={2}>
                    <Text strong style={{ color: '#10b981', fontSize: 16 }}>AED {selectedLead?.customerInfo?.monthlySalary?.toLocaleString()}</Text>
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Property */}
              <Card title={<span><HomeOutlined style={{color: THEME_COLOR}}/> Property & Loan Requirements</span>} style={{ borderRadius: 12 }}>
                <Row gutter={16} style={{ marginBottom: 20 }}>
                  <Col span={8}>
                    <div style={{ padding: '16px', background: '#f9f9f9', borderRadius: 8, textAlign: 'center' }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>Property Value</Text>
                      <div style={{ fontSize: 18, fontWeight: 'bold' }}>AED {selectedLead?.propertyDetails?.propertyValue?.toLocaleString()}</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ padding: '16px', background: '#F8F5FF', borderRadius: 8, border: `1px solid ${THEME_COLOR}40`, textAlign: 'center' }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>Loan Required</Text>
                      <div style={{ fontSize: 18, fontWeight: 'bold', color: THEME_COLOR }}>AED {selectedLead?.propertyDetails?.loanAmountRequired?.toLocaleString()}</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ padding: '16px', background: '#f9f9f9', borderRadius: 8, textAlign: 'center' }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>Down Payment</Text>
                      <div style={{ fontSize: 18, fontWeight: 'bold' }}>AED {selectedLead?.propertyDetails?.downPaymentAmount?.toLocaleString()}</div>
                    </div>
                  </Col>
                </Row>
                
                <Descriptions bordered column={2} size="small">
                  <Descriptions.Item label="Property Type">{selectedLead?.propertyDetails?.propertyType} ({selectedLead?.propertyDetails?.propertySubtype})</Descriptions.Item>
                  <Descriptions.Item label="Location">{selectedLead?.propertyDetails?.propertyAddress?.building}, {selectedLead?.propertyDetails?.propertyAddress?.area}</Descriptions.Item>
                  <Descriptions.Item label="Interest Pref.">{selectedLead?.loanRequirements?.preferredInterestRateType}</Descriptions.Item>
                  <Descriptions.Item label="Pref. Tenure">{selectedLead?.loanRequirements?.preferredTenureYears} Years</Descriptions.Item>
                  <Descriptions.Item label="Fee Financing">{selectedLead?.loanRequirements?.feeFinancingPreference ? 'Yes' : 'No'}</Descriptions.Item>
                  <Descriptions.Item label="Property Age">{selectedLead?.propertyDetails?.propertyAgeYears ? `${selectedLead?.propertyDetails?.propertyAgeYears} Years` : 'N/A'}</Descriptions.Item>
                </Descriptions>
              </Card>
            </div>
          </Col>

          {/* RIGHT: DOCUMENTS */}
          <Col xs={24} lg={8}>
            <Card title="Document Verification" style={{ borderRadius: 12, height: '100%' }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <Progress 
                  type="circle" 
                  percent={docStats.collectionPercentage || 0} 
                  strokeColor={THEME_COLOR} 
                  width={100}
                  format={(p) => <span style={{fontSize: 14, fontWeight: 'bold'}}>{p}%</span>}
                />
                <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center', gap: 16 }}>
                  <Text type="secondary">Uploaded: <b>{docStats.documentsUploaded}</b></Text>
                  <Text type="secondary">Verified: <b style={{color: '#10b981'}}>{docStats.documentsVerified}</b></Text>
                </div>
              </div>

              <Divider />
              
              <Text strong style={{ display: 'block', marginBottom: 12 }}>Attached Files</Text>
              {loading ? <Spin /> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {leadDocuments.map(doc => (
                    <div key={doc._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#f9f9f9', borderRadius: 8, border: '1px solid #eee' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FilePdfOutlined style={{ fontSize: 24, color: THEME_COLOR }} />
                        <div>
                          <Text strong style={{ fontSize: 12, display: 'block', textTransform: 'capitalize' }}>{doc.documentType.replace(/_/g, ' ')}</Text>
                          <Text type="secondary" style={{ fontSize: 10 }}>{doc.formattedFileSize} • {doc.mimeType === 'application/pdf' ? 'PDF' : 'Image'}</Text>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {doc.verificationStatus === 'verified' && <CheckCircleOutlined style={{ color: '#10b981' }} />}
                        <Button 
                          type="primary" 
                          shape="circle" 
                          icon={<EyeOutlined />} 
                          size="small"
                          style={{ background: THEME_COLOR, borderColor: THEME_COLOR }}
                          onClick={() => setViewingDoc(doc)}
                        />
                      </div>
                    </div>
                  ))}
                  {leadDocuments.length === 0 && <Text type="secondary">No documents found.</Text>}
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  const renderStep2 = () => (
    <div style={{ animation: 'fadeIn 0.5s' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Title level={4} style={{ color: THEME_COLOR, margin: 0 }}>Select Bank Products</Title>
        <Text strong style={{ background: '#f0e6ff', padding: '6px 16px', borderRadius: 20, color: THEME_COLOR }}>
          {selectedProducts.length} Product(s) Selected
        </Text>
      </Row>

      <Row gutter={[24, 24]}>
        {loading ? <div style={{ width: '100%', textAlign: 'center', padding: 40 }}><Spin size="large" /></div> : (
          bankProducts.map(product => {
            const isSelected = selectedProducts.some(p => p._id === product._id);
            return (
              <Col xs={24} lg={12} key={product._id}>
                <Card 
                  hoverable
                  style={{ 
                    borderRadius: 16, 
                    border: isSelected ? `2px solid ${THEME_COLOR}` : '1px solid #e8e8e8',
                    transition: 'all 0.3s'
                  }}
                  bodyStyle={{ padding: 20 }}
                  onClick={() => toggleProductSelection(product)}
                >
                  <Row align="middle" gutter={16}>
                    <Col>
                      <Avatar src={product.bankInfo?.logo} size={64} shape="square" style={{ border: '1px solid #f0f0f0', borderRadius: 8 }} />
                    </Col>
                    <Col flex="auto">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <Text strong style={{ fontSize: 16, display: 'block' }}>{product.offerSummary?.title}</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>{product.bankInfo?.bankName} • {product.offerSummary?.productType}</Text>
                        </div>
                        <Checkbox checked={isSelected} style={{ transform: 'scale(1.2)' }} />
                      </div>
                      
                      <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
                        <div>
                          <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Initial Rate</Text>
                          <Text strong style={{ fontSize: 18, color: THEME_COLOR }}>{product.offerSummary?.initialRate}%</Text>
                        </div>
                        <div>
                          <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Max LTV</Text>
                          <Text strong style={{ fontSize: 16 }}>{product.loanDetails?.maxLoanToValue}%</Text>
                        </div>
                        <div>
                          <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Processing Fee</Text>
                          <Text strong style={{ fontSize: 14 }}>{product.costBreakdown?.bankProcessingFee > 0 ? `AED ${product.costBreakdown?.bankProcessingFee}` : 'Free'}</Text>
                        </div>
                      </div>
                    </Col>
                  </Row>
                  <Divider style={{ margin: '16px 0' }} />
                  <Button 
                    type="text" 
                    icon={<InfoCircleOutlined />} 
                    style={{ color: THEME_COLOR, padding: 0 }}
                    onClick={(e) => { e.stopPropagation(); openProductDetails(product); }}
                  >
                    View Full Details
                  </Button>
                </Card>
              </Col>
            );
          })
        )}
      </Row>
    </div>
  );

  const renderStep3 = () => (
    <div style={{ animation: 'fadeIn 0.5s' }}>
      <Title level={4} style={{ color: THEME_COLOR, marginBottom: 24 }}>Finalize Proposal</Title>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="Cover Note" style={{ borderRadius: 12 }} headStyle={{ borderBottom: 'none' }}>
            <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
              This note will be sent to the customer along with the selected bank proposals.
            </Text>
            <TextArea 
              rows={8} 
              value={coverNote} 
              onChange={(e) => setCoverNote(e.target.value)}
              style={{ borderRadius: 8, fontSize: 14, padding: 16 }}
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card title="Proposal Summary" style={{ borderRadius: 12, background: '#f8f5ff' }} headStyle={{ borderBottom: 'none' }}>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Lead Name</Text>
              <Text strong>{selectedLead?.customerInfo?.fullName}</Text>
            </div>
            <Divider style={{ margin: '12px 0' }} />
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>Included Products ({selectedProducts.length})</Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {selectedProducts.map((p, idx) => (
                <div key={idx} style={{ background: '#fff', padding: 12, borderRadius: 8, border: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar src={p.bankInfo?.logo} shape="square" size={40} />
                  <div>
                    <Text strong style={{ fontSize: 13, display: 'block' }}>{p.offerSummary?.title}</Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>{p.offerSummary?.initialRate}% Rate | LTV {p.loanDetails?.maxLoanToValue}%</Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );

  return (
    <div style={{ padding: '24px', background: '#fdfbff', minHeight: '100vh' }}>
      
      {/* Page Header */}
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ color: '#1e1b4b', margin: 0, fontWeight: 800 }}>Create Proposal</Title>
        <Text type="secondary">Draft and submit a customized mortgage proposal for a qualified lead.</Text>
      </div>

      <Card style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: 24 }}>
        {/* Stepper */}
        <Steps 
          current={currentStep} 
          style={{ marginBottom: 40 }}
          items={[
            { title: 'Select Lead', icon: <UserOutlined /> },
            { title: 'Review Lead', icon: <FileTextOutlined /> },
            { title: 'Add Products', icon: <BankOutlined /> },
            { title: 'Finalize', icon: <CheckCircleOutlined /> },
          ]}
        />

        {/* Step Content */}
        <div style={{ minHeight: 400 }}>
          {currentStep === 0 && renderStep0()}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        {/* Navigation Buttons */}
        <div style={{ marginTop: 40, display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: 24 }}>
          <Button 
            disabled={currentStep === 0} 
            onClick={handlePrev}
            style={{ borderRadius: 6, height: 40, padding: '0 24px' }}
          >
            Previous
          </Button>

          {currentStep < 3 ? (
            <Button 
              type="primary" 
              onClick={handleNext}
              style={{ background: THEME_COLOR, borderColor: THEME_COLOR, borderRadius: 6, height: 40, padding: '0 32px' }}
            >
              Continue
            </Button>
          ) : (
            <Button 
              type="primary" 
              onClick={submitProposal}
              loading={submitting}
              style={{ background: '#10b981', borderColor: '#10b981', borderRadius: 6, height: 40, padding: '0 32px' }}
            >
              Submit Proposal
            </Button>
          )}
        </div>
      </Card>

      {/* --- DOCUMENT VIEWER MODAL --- */}
      <Modal
        title={<span style={{ textTransform: 'capitalize' }}>{viewingDoc?.documentType?.replace(/_/g, ' ')}</span>}
        open={!!viewingDoc}
        onCancel={() => setViewingDoc(null)}
        footer={[
          <Button key="close" onClick={() => setViewingDoc(null)}>Close</Button>,
          <Button key="download" type="primary" style={{background: THEME_COLOR}} href={viewingDoc?.fileUrl} target="_blank">
            Open Original
          </Button>
        ]}
        width={800}
        centered
        bodyStyle={{ padding: 0, background: '#f0f0f0', textAlign: 'center', height: '60vh', overflow: 'hidden' }}
      >
        {viewingDoc && (
          viewingDoc.mimeType === 'application/pdf' ? (
            <iframe 
              src={viewingDoc.fileUrl} 
              style={{ width: '100%', height: '100%', border: 'none' }} 
              title="Document Viewer"
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', padding: 20 }}>
               <img 
                 src={viewingDoc.fileUrl} 
                 alt="Document" 
                 style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
               />
            </div>
          )
        )}
      </Modal>

      {/* --- BANK PRODUCT FULL DETAIL MODAL --- */}
      <Modal
        title={null}
        open={isProductModalOpen}
        onCancel={() => setIsProductModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsProductModalOpen(false)} style={{ borderRadius: 8 }}>Close Details</Button>
        ]}
        width={900}
        bodyStyle={{ maxHeight: '75vh', overflowY: 'auto', scrollbarWidth: 'none', padding: '24px' }}
      >
        <style>{`.ant-modal-body::-webkit-scrollbar { display: none; }`}</style>
        
        {viewingProduct && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, padding: '16px', background: '#F8F5FF', borderRadius: 12 }}>
              <Avatar src={viewingProduct.bankInfo?.logo} size={64} shape="square" style={{ border: '1px solid #eee' }} />
              <div>
                <Title level={4} style={{ margin: 0, color: THEME_COLOR }}>{viewingProduct.offerSummary?.title}</Title>
                <Text type="secondary">{viewingProduct.bankInfo?.bankName} • {viewingProduct.offerSummary?.productType}</Text>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                 {viewingProduct.isFeatured && <Tag color="gold">FEATURED</Tag>}
              </div>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                <Col span={6}>
                    <div style={{ padding: '16px', background: '#fff', borderRadius: 12, border: `1px solid ${THEME_COLOR}20`, textAlign: 'center' }}>
                        <Text type="secondary" style={{ fontSize: 11 }}>Initial Rate</Text>
                        <div style={{ fontSize: 20, fontWeight: 'bold', color: THEME_COLOR }}>{viewingProduct.offerSummary?.initialRate}%</div>
                    </div>
                </Col>
                <Col span={6}>
                    <div style={{ padding: '16px', background: '#fff', borderRadius: 12, border: `1px solid ${THEME_COLOR}20`, textAlign: 'center' }}>
                        <Text type="secondary" style={{ fontSize: 11 }}>Max LTV</Text>
                        <div style={{ fontSize: 20, fontWeight: 'bold', color: THEME_COLOR }}>{viewingProduct.loanDetails?.maxLoanToValue}%</div>
                    </div>
                </Col>
                <Col span={6}>
                    <div style={{ padding: '16px', background: '#fff', borderRadius: 12, border: `1px solid ${THEME_COLOR}20`, textAlign: 'center' }}>
                        <Text type="secondary" style={{ fontSize: 11 }}>Monthly EMI</Text>
                        <div style={{ fontSize: 16, fontWeight: 'bold', color: '#1e1b4b', marginTop: 4 }}>
                          {viewingProduct.offerSummary?.currency} {viewingProduct.offerSummary?.monthlyEMI?.toLocaleString()}
                        </div>
                    </div>
                </Col>
                <Col span={6}>
                    <div style={{ padding: '16px', background: '#fff', borderRadius: 12, border: `1px solid ${THEME_COLOR}20`, textAlign: 'center' }}>
                        <Text type="secondary" style={{ fontSize: 11 }}>Upfront Cost</Text>
                        <div style={{ fontSize: 16, fontWeight: 'bold', color: '#1e1b4b', marginTop: 4 }}>
                          {viewingProduct.offerSummary?.currency} {viewingProduct.costBreakdown?.totalUpfrontCost?.toLocaleString()}
                        </div>
                    </div>
                </Col>
            </Row>

            <Row gutter={[20, 20]}>
              <Col xs={24} lg={12}>
                <Card title={<span><SafetyCertificateOutlined style={{color: THEME_COLOR}}/> Loan Specifications</span>} size="small" style={{ borderRadius: 12, height: '100%' }}>
                  <Descriptions bordered size="small" column={1}>
                    <Descriptions.Item label="Interest Type">{viewingProduct.loanDetails?.interestType}</Descriptions.Item>
                    <Descriptions.Item label="Tenure">{viewingProduct.loanDetails?.minTenureYears} - {viewingProduct.loanDetails?.maxTenureYears} Years</Descriptions.Item>
                    <Descriptions.Item label="Early Settlement">{viewingProduct.loanDetails?.earlySettlementFee}</Descriptions.Item>
                    <Descriptions.Item label="Follow On Rate">{viewingProduct.loanDetails?.followOnRate || 'Variable'}</Descriptions.Item>
                    <Descriptions.Item label="Overpayment">{viewingProduct.loanDetails?.overpaymentAllowedPercent}% / year</Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                 <Card title={<span><CheckCircleOutlined style={{color: THEME_COLOR}}/> Eligibility Requirements</span>} size="small" style={{ borderRadius: 12, height: '100%' }}>
                  <Descriptions bordered size="small" column={1}>
                    <Descriptions.Item label="Min Salary Required"><Text strong>AED {viewingProduct.eligibility?.minSalary?.toLocaleString()}</Text></Descriptions.Item>
                    <Descriptions.Item label="Age Limits">{viewingProduct.eligibility?.minAge} - {viewingProduct.eligibility?.maxAge} Years</Descriptions.Item>
                    <Descriptions.Item label="Visa Required">{viewingProduct.eligibility?.visaRequired ? 'Yes' : 'No'}</Descriptions.Item>
                    <Descriptions.Item label="Min Employment">{viewingProduct.eligibility?.minExperienceYears} Year(s)</Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>

              <Col xs={24}>
                <Card title={<span><DollarCircleOutlined style={{color: THEME_COLOR}}/> Cost & Fee Breakdown</span>} size="small" style={{ borderRadius: 12 }}>
                  <Descriptions bordered size="small" column={2}>
                    <Descriptions.Item label="Valuation Fee">AED {viewingProduct.costBreakdown?.valuationFee}</Descriptions.Item>
                    <Descriptions.Item label="Processing Fee">{viewingProduct.costBreakdown?.bankProcessingFee > 0 ? `AED ${viewingProduct.costBreakdown?.bankProcessingFee}` : 'FREE'}</Descriptions.Item>
                    <Descriptions.Item label="Mortgage Reg. Fee">AED {viewingProduct.costBreakdown?.mortgageRegistrationFee}</Descriptions.Item>
                    <Descriptions.Item label="DLD Fee">AED {viewingProduct.costBreakdown?.dldFee}</Descriptions.Item>
                    <Descriptions.Item label="Property Insurance">{viewingProduct.insurance?.propertyInsuranceRequired ? 'Required' : 'Optional'}</Descriptions.Item>
                    <Descriptions.Item label="Life Insurance">{viewingProduct.insurance?.lifeInsuranceRequired ? 'Required' : 'Optional'}</Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CreateProposalAdmin;