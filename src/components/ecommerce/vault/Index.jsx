import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../../manageApi/utils/custom.apiservice';
import {
  Card, Space, Tag, Typography, Row, Col, Avatar, 
  Button, Modal, Descriptions, Badge, Divider, Spin, Rate
} from 'antd';
import {
  BankOutlined, EyeOutlined, InfoCircleOutlined,
  SafetyCertificateOutlined, FileTextOutlined,
  GlobalOutlined, PhoneOutlined, CalculatorOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

// BRAND COLOR - Modern Dark Purple
const THEME_COLOR = "#5C039B";
const MORTGAGE_PATH = "bank/products";

const BankProductListVault = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await apiService.get(`${MORTGAGE_PATH}/get-all-bank-products`, {
        page,
        limit: 10,
      });
      if (res?.success) {
        setProducts(res.data || []);
        setTotal(res.pagination?.total || 0);
        setTotalPages(res.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage, fetchProducts]);

  const openDetails = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div style={{ padding: '24px', background: '#fdfbff', minHeight: '100vh' }}>
      
      {/* Header Area */}
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ color: THEME_COLOR, margin: 0, fontWeight: 800 }}>
          Bank Products by XOTO
        </Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          Explore premium mortgage and home loan offerings from our partners
        </Text>
      </div>

      {loading && products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>
      ) : (
        <>
          {/* Card Grid - 2 Columns */}
          <Row gutter={[24, 24]}>
            {products.map((item) => (
              <Col xs={24} lg={12} key={item._id}>
                <Card
                  hoverable
                  style={{ borderRadius: 16, border: '1px solid #efeaff', overflow: 'hidden' }}
                  bodyStyle={{ padding: 0 }}
                >
                  <Row align="middle">
                    {/* Left side: Bank Identity */}
                    <Col span={8} style={{ 
                      background: '#F8F5FF', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      padding: '20px',
                      minHeight: '200px',
                      height: '100%'
                    }}>
                      <Avatar 
                        src={item.bankInfo?.logo} 
                        size={80} 
                        shape="square" 
                        style={{ marginBottom: 12, borderRadius: 12, border: '2px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }} 
                        icon={<BankOutlined />}
                      />
                      <Text strong style={{ textAlign: 'center', color: '#1e1b4b' }}>{item.bankInfo?.bankName}</Text>
                      {item.offerSummary?.popularityTag && (
                        <Tag color="orange" style={{ marginTop: 8, borderRadius: 10, border: 0, fontWeight: 'bold' }}>
                          {item.offerSummary.popularityTag}
                        </Tag>
                      )}
                    </Col>

                    {/* Right side: Offer Summary */}
                    <Col span={16} style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Title level={4} style={{ margin: 0 }}>{item.offerSummary?.title}</Title>
                        <Tag color={item.offerSummary?.productType === 'FIXED' ? THEME_COLOR : 'blue'} style={{ borderRadius: 6 }}>
                          {item.offerSummary?.productType}
                        </Tag>
                      </div>
                      <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 4, minHeight: 20 }}>
                        {item.offerSummary?.shortDescription || "Premium financing option tailored for your needs."}
                      </Text>
                      
                      <div style={{ margin: '16px 0', background: '#faf9ff', padding: '12px 16px', borderRadius: 12 }}>
                        <Row gutter={16}>
                          <Col span={12}>
                            <Text type="secondary" style={{ fontSize: 12 }}>Initial Rate</Text>
                            <div style={{ fontSize: 24, fontWeight: 'bold', color: THEME_COLOR }}>
                              {item.offerSummary?.initialRate}%
                            </div>
                          </Col>
                          <Col span={12}>
                            <Text type="secondary" style={{ fontSize: 12 }}>Monthly EMI</Text>
                            <div style={{ fontSize: 18, fontWeight: '600', color: '#1e1b4b' }}>
                              {item.offerSummary?.currency} {item.offerSummary?.monthlyEMI?.toLocaleString()}
                            </div>
                          </Col>
                        </Row>
                      </div>

                      <Button 
                        type="primary" 
                        block 
                        icon={<EyeOutlined />}
                        style={{ 
                          backgroundColor: THEME_COLOR, 
                          borderColor: THEME_COLOR, 
                          borderRadius: 8,
                          height: 44,
                          fontWeight: 600,
                          boxShadow: '0 4px 14px rgba(92, 3, 155, 0.2)'
                        }}
                        onClick={() => openDetails(item)}
                      >
                        View Full Details
                      </Button>
                    </Col>
                  </Row>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          <div style={{ marginTop: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text type="secondary" style={{ fontSize: 14 }}>
              Showing page <b style={{ color: THEME_COLOR }}>{currentPage}</b> of {totalPages} ({total} total items)
            </Text>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => setCurrentPage(prev => prev - 1)}
                disabled={currentPage === 1}
                style={{ 
                  padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: 8, 
                  background: '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.5 : 1, fontWeight: 500
                }}
              >
                ← Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(0, currentPage - 3), currentPage + 2)
                .map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    style={{
                      padding: '8px 16px', borderRadius: 8, border: '1px solid',
                      cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600,
                      backgroundColor: currentPage === p ? THEME_COLOR : '#fff',
                      color: currentPage === p ? '#fff' : '#4b5563',
                      borderColor: currentPage === p ? THEME_COLOR : '#e5e7eb'
                    }}
                  >
                    {p}
                  </button>
                ))}

              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage === totalPages}
                style={{ 
                  padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: 8, 
                  background: '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.5 : 1, fontWeight: 500
                }}
              >
                Next →
              </button>
            </div>
          </div>
        </>
      )}

      {/* Full Detail Modal */}
      <Modal
        title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 10 }}>
                <Avatar src={selectedProduct?.bankInfo?.logo} size="large" shape="square" style={{ border: '1px solid #eee' }} />
                <div>
                  <div style={{ fontSize: 18, color: THEME_COLOR, fontWeight: 700 }}>{selectedProduct?.offerSummary?.title}</div>
                  <div style={{ fontSize: 13, color: '#666', fontWeight: 400 }}>{selectedProduct?.bankInfo?.bankName}</div>
                </div>
            </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalOpen(false)} style={{ borderRadius: 8, height: 40 }}>Close Window</Button>,
          <Button key="apply" type="primary" style={{ backgroundColor: THEME_COLOR, borderColor: THEME_COLOR, borderRadius: 8, height: 40, fontWeight: 600 }}>
            Apply for this Loan
          </Button>
        ]}
        width={900}
        centered
        bodyStyle={{ 
          maxHeight: '70vh', 
          overflowY: 'auto', 
          padding: '0 24px',
          // CSS to hide scrollbar but keep functionality for a cleaner UI
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none' 
        }}
      >
        <style>{`
          .ant-modal-body::-webkit-scrollbar { display: none; }
          .detail-section-title { color: ${THEME_COLOR}; margin-top: 24px; margin-bottom: 16px; font-weight: 600; font-size: 16px; display: flex; alignItems: center; gap: 8px; }
        `}</style>

        {selectedProduct && (
          <div style={{ paddingBottom: 20 }}>
            
            {/* 1. Bank & Offer Overview */}
            <div className="detail-section-title"><BankOutlined /> Bank & Overview</div>
            <Descriptions bordered size="small" column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} style={{ background: '#fff' }}>
              <Descriptions.Item label="Bank Name">{selectedProduct.bankInfo?.bankName}</Descriptions.Item>
              <Descriptions.Item label="Rating">
                <Rate disabled defaultValue={selectedProduct.bankInfo?.rating} style={{ fontSize: 14, color: '#f59e0b' }} /> 
                <span style={{ marginLeft: 8 }}>({selectedProduct.bankInfo?.rating})</span>
              </Descriptions.Item>
              <Descriptions.Item label="Website"><GlobalOutlined /> {selectedProduct.bankInfo?.website || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Customer Care"><PhoneOutlined /> {selectedProduct.bankInfo?.customerCare || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Product Type"><Tag color={THEME_COLOR}>{selectedProduct.offerSummary?.productType}</Tag></Descriptions.Item>
              <Descriptions.Item label="Currency">{selectedProduct.offerSummary?.currency}</Descriptions.Item>
            </Descriptions>

            {/* Highlighted Key Financials */}
            <Row gutter={16} style={{ marginTop: 20 }}>
                <Col span={8}>
                    <div style={{ padding: '16px', background: '#F8F5FF', borderRadius: 12, border: `1px solid ${THEME_COLOR}20` }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>Initial Interest Rate</Text>
                        <div style={{ fontSize: 24, fontWeight: 'bold', color: THEME_COLOR }}>{selectedProduct.offerSummary?.initialRate}%</div>
                    </div>
                </Col>
                <Col span={8}>
                    <div style={{ padding: '16px', background: '#F8F5FF', borderRadius: 12, border: `1px solid ${THEME_COLOR}20` }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>Monthly EMI</Text>
                        <div style={{ fontSize: 20, fontWeight: 'bold', color: THEME_COLOR, marginTop: 4 }}>
                          {selectedProduct.offerSummary?.currency} {selectedProduct.offerSummary?.monthlyEMI?.toLocaleString()}
                        </div>
                    </div>
                </Col>
                <Col span={8}>
                    <div style={{ padding: '16px', background: '#F8F5FF', borderRadius: 12, border: `1px solid ${THEME_COLOR}20` }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>Total Upfront Cost</Text>
                        <div style={{ fontSize: 20, fontWeight: 'bold', color: THEME_COLOR, marginTop: 4 }}>
                          {selectedProduct.offerSummary?.currency} {selectedProduct.costBreakdown?.totalUpfrontCost?.toLocaleString()}
                        </div>
                    </div>
                </Col>
            </Row>

            {/* 2. Loan Details & Fees */}
            <div className="detail-section-title"><InfoCircleOutlined /> Loan Specifications & Penalties</div>
            <Descriptions bordered size="small" column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
              <Descriptions.Item label="Interest Type">{selectedProduct.loanDetails?.interestType}</Descriptions.Item>
              <Descriptions.Item label="Follow On Rate">{selectedProduct.loanDetails?.followOnRate || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Standard Tenure">{selectedProduct.loanDetails?.tenureYears} Years</Descriptions.Item>
              <Descriptions.Item label="Tenure Range">{selectedProduct.loanDetails?.minTenureYears} - {selectedProduct.loanDetails?.maxTenureYears} Years</Descriptions.Item>
              <Descriptions.Item label="Loan To Value (LTV)">{selectedProduct.loanDetails?.loanToValue}% (Max: {selectedProduct.loanDetails?.maxLoanToValue}%)</Descriptions.Item>
              <Descriptions.Item label="Max Loan Amount">
                {selectedProduct.offerSummary?.maxLoanAmount ? `${selectedProduct.offerSummary?.currency} ${selectedProduct.offerSummary?.maxLoanAmount.toLocaleString()}` : 'Subject to Approval'}
              </Descriptions.Item>
              <Descriptions.Item label="Overpayment Allowed">{selectedProduct.loanDetails?.overpaymentAllowedPercent}% per annum</Descriptions.Item>
              <Descriptions.Item label="Early Settlement Fee">{selectedProduct.loanDetails?.earlySettlementFee || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Late Payment Fee">{selectedProduct.loanDetails?.latePaymentFee || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Payment Holiday">
                {selectedProduct.loanDetails?.paymentHolidayAllowed ? `Allowed (${selectedProduct.loanDetails?.paymentHolidayDays} days)` : 'Not Allowed'}
              </Descriptions.Item>
            </Descriptions>

            {/* 3. Cost Breakdown Detailed */}
            <div className="detail-section-title"><CalculatorOutlined /> Comprehensive Cost Breakdown</div>
            <Descriptions bordered size="small" column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
              <Descriptions.Item label="Down Payment">{selectedProduct.offerSummary?.currency} {selectedProduct.costBreakdown?.downPayment?.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Bank Processing Fee">
                {selectedProduct.costBreakdown?.bankProcessingFee > 0 ? `${selectedProduct.offerSummary?.currency} ${selectedProduct.costBreakdown?.bankProcessingFee.toLocaleString()} (${selectedProduct.costBreakdown?.bankProcessingFeeType})` : 'Free / Built-in'}
              </Descriptions.Item>
              <Descriptions.Item label="Valuation Fee">{selectedProduct.offerSummary?.currency} {selectedProduct.costBreakdown?.valuationFee?.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="DLD Fee (Dubai)">{selectedProduct.offerSummary?.currency} {selectedProduct.costBreakdown?.dldFee?.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Mortgage Registration">{selectedProduct.offerSummary?.currency} {selectedProduct.costBreakdown?.mortgageRegistrationFee?.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Trustee Fee">{selectedProduct.offerSummary?.currency} {selectedProduct.costBreakdown?.trusteeFee?.toLocaleString()}</Descriptions.Item>
            </Descriptions>

            {/* 4. Eligibility & Insurance */}
            <div className="detail-section-title"><SafetyCertificateOutlined /> Eligibility & Insurance Requirements</div>
            <Descriptions bordered size="small" column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
              <Descriptions.Item label="Min. Salary Required">
                <Text strong color={THEME_COLOR}>{selectedProduct.offerSummary?.currency} {selectedProduct.eligibility?.minSalary?.toLocaleString()}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Age Requirement">{selectedProduct.eligibility?.minAge} - {selectedProduct.eligibility?.maxAge} Years</Descriptions.Item>
              <Descriptions.Item label="Visa Required">{selectedProduct.eligibility?.visaRequired ? <Tag color="red">Yes</Tag> : <Tag color="green">No</Tag>}</Descriptions.Item>
              <Descriptions.Item label="Min. Emp. Experience">{selectedProduct.eligibility?.minExperienceYears} Year(s)</Descriptions.Item>
              
              <Descriptions.Item label="Property Insurance">
                {selectedProduct.insurance?.propertyInsuranceRequired ? <Tag color="processing">Required</Tag> : 'Optional'} 
                <span style={{ fontSize: 12, marginLeft: 8 }}>{selectedProduct.insurance?.propertyInsurance}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Life Insurance">
                {selectedProduct.insurance?.lifeInsuranceRequired ? <Tag color="processing">Required</Tag> : 'Optional'}
                <span style={{ fontSize: 12, marginLeft: 8 }}>{selectedProduct.insurance?.lifeInsurance}</span>
              </Descriptions.Item>
            </Descriptions>

            {/* 5. Process & Documentation */}
            <div className="detail-section-title"><FileTextOutlined /> Processing & Documentation</div>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="Processing Time">
                <Badge status="processing" text={selectedProduct.documentation?.processingTime || 'Standard'} />
              </Descriptions.Item>
              <Descriptions.Item label="Approval Validity">
                <Badge status="success" text={selectedProduct.documentation?.approvalValidity || 'Subject to terms'} />
              </Descriptions.Item>
            </Descriptions>

          </div>
        )}
      </Modal>
    </div>
  );
};

export default BankProductListVault;