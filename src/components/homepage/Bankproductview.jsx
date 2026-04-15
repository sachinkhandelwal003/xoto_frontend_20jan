import React, { useState, useEffect } from 'react';
import { apiService } from '../../manageApi/utils/custom.apiservice';
import {
  Button, Card, Row, Col, Tag, Divider,
  Typography, Space, Avatar, Badge, Spin, notification, Popconfirm
} from 'antd';
import {
  ArrowLeftOutlined, EditOutlined, DeleteOutlined,
  BankOutlined, StarOutlined, FileTextOutlined,
  DollarOutlined, SafetyCertificateOutlined,
  TeamOutlined, FileSearchOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const THEME = { primary: "#7c3aed", success: "#10b981", warning: "#f59e0b", danger: "#ef4444" };
const MORTGAGE_PATH = "bank/products";

const InfoRow = ({ label, value }) => (
  <div style={{ marginBottom: 8 }}>
    <Text type="secondary" style={{ fontSize: 12 }}>{label}</Text>
    <div><Text strong>{value ?? '—'}</Text></div>
  </div>
);

const BankProductView = ({ productId, onBack, onEdit, onDelete }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  // ── Fetch single product ─────────────────────────────────────────────────
  useEffect(() => {
    if (!productId) return;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await apiService.get(`${MORTGAGE_PATH}/get-bank-product/${productId}`);
        setProduct(res?.data || res);
      } catch (err) {
        console.error('Fetch product error:', err);
        notification.error({ message: 'Failed to load product details' });
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setLoading(true);
    try {
      await apiService.delete(`${MORTGAGE_PATH}/delete-bank-product/${productId}`);
      notification.success({ message: 'Product deleted successfully' });
      onDelete && onDelete();
    } catch (err) {
      console.error('Delete error:', err);
      notification.error({ message: 'Failed to delete product' });
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    borderRadius: 12,
    boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
    marginBottom: 16,
  };

  const sectionStyle = { borderColor: THEME.primary, marginBottom: 12 };
  const typeColorMap = { FIXED: 'purple', VARIABLE: 'blue', ISLAMIC: 'green' };

  if (loading && !product) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product) return null;

  const { bankInfo, offerSummary, loanDetails, costBreakdown, insurance, eligibility, documentation, features, meta } = product;

  return (
    <div style={{ padding: 24, background: '#f5f3ff', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={onBack} type="text" />
          <div>
            <Title level={3} style={{ margin: 0, color: '#1e1b4b' }}>Product Details</Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {bankInfo?.bankName} — {offerSummary?.title}
            </Text>
          </div>
        </div>
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => onEdit && onEdit(product)}
            style={{ borderColor: THEME.warning, color: THEME.warning }}
          >
            Edit
          </Button>
          <Popconfirm title="Delete this product?" onConfirm={handleDelete} okText="Yes" okButtonProps={{ danger: true }}>
            <Button danger icon={<DeleteOutlined />} loading={loading}>Delete</Button>
          </Popconfirm>
        </Space>
      </div>

      {/* Bank Info */}
      <Card bordered={false} style={cardStyle}>
        <Divider orientation="left" style={sectionStyle}>
          <Space><BankOutlined style={{ color: THEME.primary }} /><Text strong>Bank Information</Text></Space>
        </Divider>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={4} style={{ textAlign: 'center' }}>
            {bankInfo?.logo
              ? <Avatar src={bankInfo.logo} size={72} shape="square" style={{ borderRadius: 10 }} />
              : <Avatar size={72} shape="square" style={{ background: THEME.primary, borderRadius: 10, fontSize: 28 }}>
                  {bankInfo?.bankName?.[0]}
                </Avatar>
            }
          </Col>
          <Col xs={24} sm={20}>
            <Row gutter={16}>
              <Col xs={12} md={6}><InfoRow label="Bank Name"    value={bankInfo?.bankName} /></Col>
              <Col xs={12} md={6}><InfoRow label="Bank Code"    value={bankInfo?.bankCode} /></Col>
              <Col xs={12} md={6}><InfoRow label="Rating"       value={bankInfo?.rating ? `${bankInfo.rating} / 5` : undefined} /></Col>
              <Col xs={12} md={6}><InfoRow label="Reviews"      value={bankInfo?.reviewCount} /></Col>
              <Col xs={12} md={6}><InfoRow label="Customer Care" value={bankInfo?.customerCare} /></Col>
              <Col xs={12} md={6}><InfoRow label="Website"      value={bankInfo?.website} /></Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Offer Summary */}
      <Card bordered={false} style={cardStyle}>
        <Divider orientation="left" style={sectionStyle}>
          <Space><StarOutlined style={{ color: THEME.primary }} /><Text strong>Offer Summary</Text></Space>
        </Divider>
        <Row gutter={[16, 8]}>
          <Col xs={24} md={12}>
            <InfoRow label="Offer Title" value={
              <Space>
                {offerSummary?.title}
                {offerSummary?.popularityTag && <Tag color="gold">{offerSummary.popularityTag}</Tag>}
                {offerSummary?.badge && <Tag color="blue">{offerSummary.badge}</Tag>}
              </Space>
            } />
          </Col>
          <Col xs={24} md={12}><InfoRow label="Description" value={offerSummary?.shortDescription} /></Col>
          <Col xs={12} md={4}>
            <InfoRow label="Product Type" value={
              <Tag color={typeColorMap[offerSummary?.productType] || 'default'}>{offerSummary?.productType}</Tag>
            } />
          </Col>
          <Col xs={12} md={4}><InfoRow label="Initial Rate"      value={offerSummary?.initialRate ? `${offerSummary.initialRate}%` : undefined} /></Col>
          <Col xs={12} md={4}><InfoRow label="Comparison Rate"   value={offerSummary?.comparisonRate ? `${offerSummary.comparisonRate}%` : undefined} /></Col>
          <Col xs={12} md={4}><InfoRow label="Monthly EMI"       value={offerSummary?.monthlyEMI ? `${offerSummary.currency || 'AED'} ${offerSummary.monthlyEMI?.toLocaleString()}` : undefined} /></Col>
          <Col xs={12} md={4}><InfoRow label="Fixed Years"       value={offerSummary?.fixedYears} /></Col>
          <Col xs={12} md={4}><InfoRow label="Max Loan Amount"   value={offerSummary?.maxLoanAmount?.toLocaleString()} /></Col>
          <Col xs={12} md={4}>
            <InfoRow label="Status" value={
              <Badge status={meta?.isActive !== false ? 'success' : 'error'}
                     text={meta?.isActive !== false ? 'Active' : 'Inactive'} />
            } />
          </Col>
          <Col xs={12} md={4}><InfoRow label="Popular"   value={product.isPopular  ? 'Yes' : 'No'} /></Col>
          <Col xs={12} md={4}><InfoRow label="Featured"  value={product.isFeatured ? 'Yes' : 'No'} /></Col>
        </Row>
      </Card>

      {/* Loan Details */}
      <Card bordered={false} style={cardStyle}>
        <Divider orientation="left" style={sectionStyle}>
          <Space><FileTextOutlined style={{ color: THEME.primary }} /><Text strong>Loan Details</Text></Space>
        </Divider>
        <Row gutter={[16, 8]}>
          <Col xs={12} md={4}><InfoRow label="Tenure (Yrs)"      value={loanDetails?.tenureYears} /></Col>
          <Col xs={12} md={4}><InfoRow label="Min Tenure"        value={loanDetails?.minTenureYears} /></Col>
          <Col xs={12} md={4}><InfoRow label="Max Tenure"        value={loanDetails?.maxTenureYears} /></Col>
          <Col xs={12} md={4}><InfoRow label="LTV (%)"           value={loanDetails?.loanToValue} /></Col>
          <Col xs={12} md={4}><InfoRow label="Interest Type"     value={loanDetails?.interestType} /></Col>
          <Col xs={12} md={4}><InfoRow label="Follow On Rate"    value={loanDetails?.followOnRate} /></Col>
          <Col xs={12} md={6}><InfoRow label="Early Settlement"  value={loanDetails?.earlySettlementFee} /></Col>
          <Col xs={12} md={6}><InfoRow label="Late Payment Fee"  value={loanDetails?.latePaymentFee} /></Col>
          <Col xs={12} md={4}><InfoRow label="Overpayment (%)"   value={loanDetails?.overpaymentAllowedPercent} /></Col>
          <Col xs={12} md={4}><InfoRow label="Payment Holiday"   value={loanDetails?.paymentHolidayAllowed ? 'Yes' : 'No'} /></Col>
        </Row>
      </Card>

      {/* Cost Breakdown */}
      <Card bordered={false} style={cardStyle}>
        <Divider orientation="left" style={sectionStyle}>
          <Space><DollarOutlined style={{ color: THEME.primary }} /><Text strong>Cost Breakdown</Text></Space>
        </Divider>
        <Row gutter={[16, 8]}>
          <Col xs={12} md={6}><InfoRow label="Property Price"       value={costBreakdown?.propertyPrice?.toLocaleString()} /></Col>
          <Col xs={12} md={6}><InfoRow label="Down Payment"         value={costBreakdown?.downPayment?.toLocaleString()} /></Col>
          <Col xs={12} md={6}><InfoRow label="Down Payment (%)"     value={costBreakdown?.downPaymentPercentage} /></Col>
          <Col xs={12} md={6}><InfoRow label="DLD Fee"              value={costBreakdown?.dldFee?.toLocaleString()} /></Col>
          <Col xs={12} md={6}><InfoRow label="Bank Processing Fee"  value={costBreakdown?.bankProcessingFee?.toLocaleString()} /></Col>
          <Col xs={12} md={6}><InfoRow label="Valuation Fee"        value={costBreakdown?.valuationFee?.toLocaleString()} /></Col>
          <Col xs={12} md={6}><InfoRow label="Total Upfront Cost"   value={costBreakdown?.totalUpfrontCost?.toLocaleString()} /></Col>
          <Col xs={12} md={6}><InfoRow label="Payable By Buyer"     value={costBreakdown?.payableByBuyer?.toLocaleString()} /></Col>
        </Row>
      </Card>

      {/* Insurance */}
      <Card bordered={false} style={cardStyle}>
        <Divider orientation="left" style={sectionStyle}>
          <Space><SafetyCertificateOutlined style={{ color: THEME.primary }} /><Text strong>Insurance</Text></Space>
        </Divider>
        <Row gutter={[16, 8]}>
          <Col xs={12} md={6}><InfoRow label="Life Insurance"              value={insurance?.lifeInsurance} /></Col>
          <Col xs={12} md={6}><InfoRow label="Life Insurance Required"     value={insurance?.lifeInsuranceRequired ? 'Yes' : 'No'} /></Col>
          <Col xs={12} md={6}><InfoRow label="Life Insurance Cost"         value={insurance?.lifeInsuranceCost} /></Col>
          <Col xs={12} md={6}><InfoRow label="Property Insurance"          value={insurance?.propertyInsurance} /></Col>
          <Col xs={12} md={6}><InfoRow label="Property Insurance Required" value={insurance?.propertyInsuranceRequired ? 'Yes' : 'No'} /></Col>
          <Col xs={12} md={6}><InfoRow label="Mortgage Protection"         value={insurance?.mortgageProtection} /></Col>
        </Row>
      </Card>

      {/* Eligibility */}
      <Card bordered={false} style={cardStyle}>
        <Divider orientation="left" style={sectionStyle}>
          <Space><TeamOutlined style={{ color: THEME.primary }} /><Text strong>Eligibility</Text></Space>
        </Divider>
        <Row gutter={[16, 8]}>
          <Col xs={12} md={4}><InfoRow label="Min Salary (AED)" value={eligibility?.minSalary?.toLocaleString()} /></Col>
          <Col xs={12} md={4}><InfoRow label="Max Salary (AED)" value={eligibility?.maxSalary?.toLocaleString()} /></Col>
          <Col xs={12} md={4}><InfoRow label="Age Range"        value={eligibility?.minAge && eligibility?.maxAge ? `${eligibility.minAge} – ${eligibility.maxAge} yrs` : undefined} /></Col>
          <Col xs={12} md={4}><InfoRow label="Loan Range (AED)" value={eligibility?.minLoanAmount && eligibility?.maxLoanAmount ? `${eligibility.minLoanAmount?.toLocaleString()} – ${eligibility.maxLoanAmount?.toLocaleString()}` : undefined} /></Col>
          <Col xs={12} md={4}><InfoRow label="Visa Required"    value={eligibility?.visaRequired ? 'Yes' : 'No'} /></Col>
          <Col xs={24} md={6}>
            <Text type="secondary" style={{ fontSize: 12 }}>Nationalities</Text>
            <div style={{ marginTop: 4 }}>
              {eligibility?.eligibleNationalities?.map((n) => <Tag key={n}>{n}</Tag>) || '—'}
            </div>
          </Col>
          <Col xs={24} md={6}>
            <Text type="secondary" style={{ fontSize: 12 }}>Employment Types</Text>
            <div style={{ marginTop: 4 }}>
              {eligibility?.eligibleEmploymentTypes?.map((e) => <Tag key={e} color="blue">{e}</Tag>) || '—'}
            </div>
          </Col>
        </Row>
      </Card>

      {/* Docs & Features */}
      <Card bordered={false} style={cardStyle}>
        <Divider orientation="left" style={sectionStyle}>
          <Space><FileSearchOutlined style={{ color: THEME.primary }} /><Text strong>Documentation & Features</Text></Space>
        </Divider>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Text type="secondary" style={{ fontSize: 12 }}>Required Documents</Text>
            <div style={{ marginTop: 4 }}>
              {documentation?.requiredDocs?.map((d) => <Tag key={d} color="purple" style={{ marginBottom: 4 }}>{d}</Tag>) || '—'}
            </div>
          </Col>
          <Col xs={12} md={6}><InfoRow label="Processing Time"  value={documentation?.processingTime} /></Col>
          <Col xs={12} md={6}><InfoRow label="Approval Validity" value={documentation?.approvalValidity} /></Col>
          <Col xs={24} md={12}>
            <Text type="secondary" style={{ fontSize: 12 }}>Key Features</Text>
            <div style={{ marginTop: 4 }}>
              {features?.keyFeatures?.map((f) => <Tag key={f} color="green" style={{ marginBottom: 4 }}>{f}</Tag>) || '—'}
            </div>
          </Col>
          <Col xs={24} md={12}>
            <Text type="secondary" style={{ fontSize: 12 }}>Benefits</Text>
            <div style={{ marginTop: 4 }}>
              {features?.benefits?.map((b) => <Tag key={b} color="blue" style={{ marginBottom: 4 }}>{b}</Tag>) || '—'}
            </div>
          </Col>
        </Row>
      </Card>

    </div>
  );
};

export default BankProductView;