import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { apiService } from '../../../../manageApi/utils/custom.apiservice';
import {
  Card, Spin, Button, Descriptions, Tag, Divider,
  Row, Col, Avatar, Typography, message, Space, Result
} from 'antd';
import {
  UserOutlined, BankOutlined, HomeOutlined,
  DollarCircleOutlined, CalendarOutlined, 
  CheckCircleOutlined, CloseCircleOutlined, 
  WarningOutlined, FileTextOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const THEME_COLOR = "#5C039B";

const ProposalLink = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  
  useEffect(() => {
    const fetchProposal = async () => {
      if (!id || !token) {
        setError('Invalid proposal link');
        setLoading(false);
        return;
      }
      
      try {
        const response = await apiService.get(`/vault/lead/proposals/secure/${id}?token=${token}`);
        
        if (response?.success) {
          setProposal(response.data);
        } else {
          setError(response?.message || 'Failed to load proposal');
        }
      } catch (err) {
        console.error('Error fetching proposal:', err);
        setError(err.response?.data?.message || 'Invalid or expired proposal link');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProposal();
  }, [id, token]);
  
  const handleAccept = async () => {
    setAccepting(true);
    try {
      const response = await apiService.post(`/vault/lead/proposals/${id}/accept?token=${token}`);
      if (response?.success) {
        message.success('Proposal accepted successfully!');
        // Refresh to show updated status
        window.location.reload();
      } else {
        message.error(response?.message || 'Failed to accept proposal');
      }
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to accept proposal');
    } finally {
      setAccepting(false);
    }
  };
  
  const handleReject = async () => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      setRejecting(true);
      try {
        const response = await apiService.post(`/vault/lead/proposals/${id}/reject?token=${token}&reason=${encodeURIComponent(reason)}`);
        if (response?.success) {
          message.success('Proposal rejected');
          window.location.reload();
        } else {
          message.error(response?.message || 'Failed to reject proposal');
        }
      } catch (err) {
        message.error(err.response?.data?.message || 'Failed to reject proposal');
      } finally {
        setRejecting(false);
      }
    }
  };
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Loading your proposal..." />
      </div>
    );
  }
  
  if (error) {
    return (
      <Result
        status="error"
        title="Unable to Load Proposal"
        subTitle={error}
        extra={
          <Button type="primary" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        }
      />
    );
  }
  
  if (!proposal) {
    return (
      <Result
        status="warning"
        title="Proposal Not Found"
        subTitle="The proposal you're looking for does not exist."
      />
    );
  }
  
  // Check proposal status
  if (proposal.status === 'Accepted') {
    return (
      <Result
        status="success"
        icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
        title="Proposal Accepted!"
        subTitle="Thank you for accepting the mortgage proposal. Our team will contact you shortly."
      />
    );
  }
  
  if (proposal.status === 'Rejected') {
    return (
      <Result
        status="error"
        icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
        title="Proposal Rejected"
        subTitle={`Reason: ${proposal.rejectionReason || 'No reason provided'}`}
      />
    );
  }
  
  if (proposal.isExpired) {
    return (
      <Result
        status="warning"
        icon={<WarningOutlined style={{ color: '#faad14' }} />}
        title="Proposal Expired"
        subTitle={`This proposal expired on ${dayjs(proposal.expiresAt).format('MMMM DD, YYYY')}`}
      />
    );
  }
  
  // Get lead data
  const lead = proposal.leadId;
  const customerInfo = lead?.customerInfo || {};
  const propertyDetails = lead?.propertyDetails || {};
  const bankProducts = proposal.selectedBankProducts || [];
  
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px', background: '#f5f7fa', minHeight: '100vh' }}>
      {/* Header Card */}
      <Card style={{ marginBottom: 24, borderRadius: 16, textAlign: 'center', background: `linear-gradient(135deg, ${THEME_COLOR} 0%, #3a0263 100%)` }}>
        <Title level={2} style={{ color: 'white', margin: 0 }}>XOTO VAULT</Title>
        <Text style={{ color: 'rgba(255,255,255,0.8)' }}>Mortgage Proposal</Text>
        <div style={{ marginTop: 16 }}>
          <Tag color="gold">Proposal ID: {proposal._id}</Tag>
          <Tag color="blue">Status: {proposal.status}</Tag>
          <Tag color="orange">Expires: {dayjs(proposal.expiresAt).format('MMM DD, YYYY')}</Tag>
        </div>
      </Card>
      
      <Row gutter={[24, 24]}>
        {/* Client Information */}
        <Col xs={24} lg={12}>
          <Card 
            title={<span><UserOutlined style={{ color: THEME_COLOR }} /> Client Information</span>} 
            style={{ borderRadius: 12, height: '100%' }}
          >
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Full Name">
                <Text strong>{customerInfo.fullName || 'N/A'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Email">{customerInfo.email || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Phone">{customerInfo.mobileNumber || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Nationality">{customerInfo.nationality || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Monthly Salary">
                <Text strong style={{ color: '#2e7d32' }}>
                  AED {customerInfo.monthlySalary?.toLocaleString() || 'N/A'}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Occupation">{customerInfo.occupation || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Employer">{customerInfo.employer || 'N/A'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        
        {/* Property Information */}
        <Col xs={24} lg={12}>
          <Card 
            title={<span><HomeOutlined style={{ color: THEME_COLOR }} /> Property Information</span>} 
            style={{ borderRadius: 12, height: '100%' }}
          >
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Property Type">{propertyDetails.propertyType || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Property Value">
                <Text strong>AED {propertyDetails.propertyValue?.toLocaleString() || 'N/A'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Down Payment">AED {propertyDetails.downPaymentAmount?.toLocaleString() || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Loan Required">AED {propertyDetails.loanAmountRequired?.toLocaleString() || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Property Address">
                {propertyDetails.propertyAddress?.building}, {propertyDetails.propertyAddress?.area}, {propertyDetails.propertyAddress?.city}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
      
      {/* Loan Requirements */}
      <Card 
        title={<span><DollarCircleOutlined style={{ color: THEME_COLOR }} /> Loan Requirements</span>} 
        style={{ marginTop: 24, borderRadius: 12 }}
      >
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Text type="secondary">Target Property Value</Text>
            <div><strong>AED {proposal.clientRequirements?.targetPropertyValue?.toLocaleString()}</strong></div>
          </Col>
          <Col span={8}>
            <Text type="secondary">Preferred Tenure</Text>
            <div><strong>{proposal.clientRequirements?.preferredLoanTenureYears} years</strong></div>
          </Col>
          <Col span={8}>
            <Text type="secondary">Property Type</Text>
            <div><strong>{proposal.clientRequirements?.propertyType}</strong></div>
          </Col>
          <Col span={8}>
            <Text type="secondary">Fee Financing</Text>
            <div><strong>{proposal.clientRequirements?.feeFinancingPreference ? 'Yes' : 'No'}</strong></div>
          </Col>
        </Row>
      </Card>
      
      {/* Cover Note */}
      {proposal.coverNote && (
        <Card title="Cover Note" style={{ marginTop: 24, borderRadius: 12, background: '#f8f5ff' }}>
          <Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{proposal.coverNote}</Paragraph>
        </Card>
      )}
      
      {/* Bank Products */}
      <Title level={4} style={{ marginTop: 32, marginBottom: 16 }}>
        <BankOutlined style={{ color: THEME_COLOR }} /> Mortgage Options
      </Title>
      
      <Row gutter={[16, 16]}>
        {bankProducts.map((product, index) => {
          const bank = product.bankProductId;
          if (!bank) return null;
          
          return (
            <Col xs={24} lg={12} key={index}>
              <Card 
                hoverable 
                style={{ borderRadius: 12, border: `1px solid ${THEME_COLOR}30`, height: '100%' }}
                bodyStyle={{ padding: 20 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  <Avatar 
                    src={bank.bankInfo?.logo} 
                    size={48} 
                    shape="square" 
                    style={{ border: '1px solid #eee' }}
                  />
                  <div>
                    <Text strong style={{ fontSize: 16 }}>{bank.bankInfo?.bankName}</Text>
                    <br />
                    <Text type="secondary">{bank.offerSummary?.title}</Text>
                  </div>
                  {bank.isPopular && <Tag color="orange" style={{ marginLeft: 'auto' }}>Popular</Tag>}
                </div>
                
                <Row gutter={16} style={{ background: '#f8f5ff', padding: '12px', borderRadius: 8, marginBottom: 16 }}>
                  <Col span={8} style={{ textAlign: 'center' }}>
                    <Text type="secondary" style={{ fontSize: 11 }}>Interest Rate</Text>
                    <div style={{ fontSize: 20, fontWeight: 'bold', color: THEME_COLOR }}>{product.snapshotRate}%</div>
                  </Col>
                  <Col span={8} style={{ textAlign: 'center' }}>
                    <Text type="secondary" style={{ fontSize: 11 }}>Monthly EMI</Text>
                    <div style={{ fontSize: 16, fontWeight: 'bold' }}>{bank.offerSummary?.monthlyEMI?.toLocaleString()} AED</div>
                  </Col>
                  <Col span={8} style={{ textAlign: 'center' }}>
                    <Text type="secondary" style={{ fontSize: 11 }}>Max LTV</Text>
                    <div style={{ fontSize: 16, fontWeight: 'bold' }}>{product.snapshotMaxLtv}%</div>
                  </Col>
                </Row>
                
                {product.snapshotFeatures?.length > 0 && (
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>Features:</Text>
                    <ul style={{ marginTop: 8, paddingLeft: 20, fontSize: 12, color: '#666' }}>
                      {product.snapshotFeatures.slice(0, 3).map((feature, i) => (
                        <li key={i}>{feature}</li>
                      ))}
                      {product.snapshotFeatures.length > 3 && (
                        <li>+ {product.snapshotFeatures.length - 3} more...</li>
                      )}
                    </ul>
                  </div>
                )}
              </Card>
            </Col>
          );
        })}
      </Row>
      
      {/* Action Buttons */}
      <div style={{ textAlign: 'center', marginTop: 40, padding: '24px', background: '#f8f5ff', borderRadius: 12 }}>
        <Space size="large">
          <Button 
            type="primary" 
            size="large"
            icon={<CheckCircleOutlined />}
            onClick={handleAccept}
            loading={accepting}
            style={{ background: THEME_COLOR, borderColor: THEME_COLOR, padding: '0 40px', height: 48 }}
          >
            Accept Proposal
          </Button>
          <Button 
            danger
            size="large"
            icon={<CloseCircleOutlined />}
            onClick={handleReject}
            loading={rejecting}
            style={{ padding: '0 40px', height: 48 }}
          >
            Reject Proposal
          </Button>
        </Space>
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">
            <CalendarOutlined /> This proposal expires on {dayjs(proposal.expiresAt).format('MMMM DD, YYYY')}
          </Text>
        </div>
      </div>
    </div>
  );
};

export default ProposalLink;