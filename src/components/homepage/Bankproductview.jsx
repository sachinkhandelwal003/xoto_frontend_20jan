import React, { useState, useEffect } from 'react';
import { apiService } from '../../manageApi/utils/custom.apiservice';
import {
  Button, Card, Row, Col, Tag, Divider, Form, Input, InputNumber,
  Select, Switch, Upload, Typography, Space, Avatar, Badge,
  Spin, notification, Popconfirm, Tabs, DatePicker, message
} from 'antd';
import {
  ArrowLeftOutlined, EditOutlined, DeleteOutlined, SaveOutlined,
  BankOutlined, StarOutlined, FileTextOutlined, DollarOutlined,
  SafetyCertificateOutlined, TeamOutlined, FileSearchOutlined,
  EyeOutlined, PlusOutlined, CheckCircleOutlined, CloseCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const THEME = { primary: '#7c3aed', success: '#10b981', warning: '#f59e0b', danger: '#ef4444' };
const MORTGAGE_PATH = 'bank/products';

// ─── Reusable display row ──────────────────────────────────────────────────
const InfoRow = ({ label, value, fullWidth }) => (
  <div style={{ marginBottom: 10 }}>
    <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {label}
    </Text>
    <div style={{ marginTop: 2 }}>
      {value !== undefined && value !== null && value !== ''
        ? (typeof value === 'object' ? value : <Text strong style={{ fontSize: 14 }}>{value}</Text>)
        : <Text type="secondary" style={{ fontSize: 13 }}>—</Text>}
    </div>
  </div>
);

const BoolBadge = ({ value }) => (
  value
    ? <Tag icon={<CheckCircleOutlined />} color="success">Yes</Tag>
    : <Tag icon={<CloseCircleOutlined />} color="error">No</Tag>
);

const fmt = (n) => (n !== null && n !== undefined ? Number(n).toLocaleString() : '—');

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
const Bankproductview = ({ productId, onBack, onDelete }) => {
  const [product, setProduct]         = useState(null);
  const [loading, setLoading]         = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [mainTab, setMainTab]         = useState('view');       // 'view' | 'edit'
  const [editSection, setEditSection] = useState('1');          // tab inside edit
  const [doesNotExpire, setDoesNotExpire] = useState(true);
  const [logoList, setLogoList]       = useState([]);
  const [form] = Form.useForm();

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchProduct = async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const res = await apiService.get(`${MORTGAGE_PATH}/get-bank-product/${productId}`);
      const data = res?.data || res;
      setProduct(data);
      prefillForm(data);
    } catch (err) {
      console.error('Fetch error:', err);
      notification.error({ message: 'Failed to load product details' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProduct(); }, [productId]);

  // ── Prefill edit form ──────────────────────────────────────────────────────
  const prefillForm = (data) => {
    if (!data) return;
    const expires = data.offerSummary?.productValidity?.doesNotExpire ?? true;
    setDoesNotExpire(expires);

    form.setFieldsValue({
      ...data,
      offerSummary: {
        ...data.offerSummary,
        productValidity: {
          ...data.offerSummary?.productValidity,
          expiryDate: data.offerSummary?.productValidity?.expiryDate
            ? dayjs(data.offerSummary.productValidity.expiryDate)
            : null,
        },
      },
    });

    if (data.bankInfo?.logo) {
      setLogoList([{ uid: '-1', url: data.bankInfo.logo, status: 'done', name: 'Bank Logo' }]);
    }
  };

  // ── Logo helpers ───────────────────────────────────────────────────────────
  const validateImageSize = (file) => {
    if (!file.type.startsWith('image/')) { message.error('Images only!'); return Upload.LIST_IGNORE; }
    if (file.size / 1024 / 1024 > 5)   { message.error('Max 5MB');        return Upload.LIST_IGNORE; }
    return true;
  };

  const handleCustomUpload = async ({ file, onSuccess: ok, onError }) => {
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await apiService.upload('upload', fd);
      ok(res);
      message.success('Logo uploaded!');
    } catch (err) { onError(err); message.error('Upload failed'); }
  };

  const resolvedLogo = () => {
    if (logoList.length > 0)
      return logoList[0].url || logoList[0].response?.file?.url || logoList[0].response?.url || logoList[0].response || '';
    return product?.bankInfo?.logo || '';
  };

  // ── Save (update) ──────────────────────────────────────────────────────────
  const handleSave = async (values) => {
    if (saveLoading) return;
    setSaveLoading(true);
    try {
      const payload = {
        bankInfo: {
          bankName:     values.bankInfo?.bankName,
          bankCode:     values.bankInfo?.bankCode,
          logo:         resolvedLogo(),
          website:      values.bankInfo?.website,
          customerCare: values.bankInfo?.customerCare,
          rating:       values.bankInfo?.rating,
          reviewCount:  values.bankInfo?.reviewCount,
        },
        offerSummary: {
          title:            values.offerSummary?.title,
          shortDescription: values.offerSummary?.shortDescription,
          popularityTag:    values.offerSummary?.popularityTag,
          badge:            values.offerSummary?.badge,
          productType:      values.offerSummary?.productType,
          fixedYears:       values.offerSummary?.fixedYears,
          initialRate:      values.offerSummary?.initialRate,
          comparisonRate:   values.offerSummary?.comparisonRate,
          monthlyEMI:       values.offerSummary?.monthlyEMI,
          currency:         values.offerSummary?.currency || 'AED',
          totalUpfrontCost: values.offerSummary?.totalUpfrontCost,
          maxLoanAmount:    values.offerSummary?.maxLoanAmount,
          productValidity: {
            doesNotExpire,
            expiryDate: doesNotExpire ? null : values.offerSummary?.productValidity?.expiryDate,
          },
        },
        loanDetails: {
          tenureYears:                   values.loanDetails?.tenureYears,
          minTenureYears:                values.loanDetails?.minTenureYears,
          maxTenureYears:                values.loanDetails?.maxTenureYears,
          followOnRate:                  values.loanDetails?.followOnRate,
          followOnRateType:              values.loanDetails?.followOnRateType,
          loanToValue:                   values.loanDetails?.loanToValue,
          minLoanToValue:                values.loanDetails?.minLoanToValue,
          maxLoanToValue:                values.loanDetails?.maxLoanToValue,
          interestType:                  values.loanDetails?.interestType,
          salaryTransfer:                values.loanDetails?.salaryTransfer,
          overpaymentAllowedPercent:     values.loanDetails?.overpaymentAllowedPercent,
          earlySettlementFee:            values.loanDetails?.earlySettlementFee,
          earlySettlementFreeAfterYears: values.loanDetails?.earlySettlementFreeAfterYears,
          latePaymentFee:                values.loanDetails?.latePaymentFee,
          paymentHolidayAllowed:         values.loanDetails?.paymentHolidayAllowed,
          paymentHolidayDays:            values.loanDetails?.paymentHolidayDays,
        },
        costBreakdown: {
          propertyPrice:                   values.costBreakdown?.propertyPrice,
          downPayment:                     values.costBreakdown?.downPayment,
          downPaymentPercentage:           values.costBreakdown?.downPaymentPercentage,
          dldFee:                          values.costBreakdown?.dldFee,
          mortgageRegistrationFee:         values.costBreakdown?.mortgageRegistrationFee,
          trusteeFee:                      values.costBreakdown?.trusteeFee,
          bankProcessingFee:               values.costBreakdown?.bankProcessingFee,
          bankProcessingFeeType:           values.costBreakdown?.bankProcessingFeeType,
          valuationFee:                    values.costBreakdown?.valuationFee,
          propertyInsuranceFee:            values.costBreakdown?.propertyInsuranceFee,
          lifeInsuranceFee:                values.costBreakdown?.lifeInsuranceFee,
          agencyFee:                       values.costBreakdown?.agencyFee,
          conveyanceFee:                   values.costBreakdown?.conveyanceFee,
          feesAddedToLoan:                 values.costBreakdown?.feesAddedToLoan,
          totalUpfrontCost:                values.costBreakdown?.totalUpfrontCost,
          payableByBuyer:                  values.costBreakdown?.payableByBuyer,
          payableBySeller:                 values.costBreakdown?.payableBySeller,
          bankPreApprovalFee:              values.costBreakdown?.bankPreApprovalFee,
          isBankPreApprovalFeeFree:        values.costBreakdown?.isBankPreApprovalFeeFree,
          minimumBankProcessingFee:        values.costBreakdown?.minimumBankProcessingFee,
          buyoutFee:                       values.costBreakdown?.buyoutFee,
          isBuyoutFeeNA:                   values.costBreakdown?.isBuyoutFeeNA,
          propertyValuationFeeInclusiveVAT: values.costBreakdown?.propertyValuationFeeInclusiveVAT,
        },
        insurance: {
          lifeInsurance:             values.insurance?.lifeInsurance,
          lifeInsuranceRequired:     values.insurance?.lifeInsuranceRequired,
          lifeInsuranceCost:         values.insurance?.lifeInsuranceCost,
          propertyInsurance:         values.insurance?.propertyInsurance,
          propertyInsuranceRequired: values.insurance?.propertyInsuranceRequired,
          propertyInsuranceCost:     values.insurance?.propertyInsuranceCost,
          mortgageProtection:        values.insurance?.mortgageProtection,
        },
        eligibility: {
          minSalary:                values.eligibility?.minSalary,
          maxSalary:                values.eligibility?.maxSalary,
          minAge:                   values.eligibility?.minAge,
          maxAge:                   values.eligibility?.maxAge,
          minLoanAmount:            values.eligibility?.minLoanAmount,
          maxLoanAmount:            values.eligibility?.maxLoanAmount,
          minLTV:                   values.eligibility?.minLTV,
          maxLTV:                   values.eligibility?.maxLTV,
          eligibleNationalities:    values.eligibility?.eligibleNationalities || [],
          eligibleEmploymentTypes:  values.eligibility?.eligibleEmploymentTypes || [],
          eligibleResidencyStatus:  values.eligibility?.eligibleResidencyStatus || [],
          minExperienceYears:       values.eligibility?.minExperienceYears,
          minEmploymentYears:       values.eligibility?.minEmploymentYears,
          visaRequired:             values.eligibility?.visaRequired,
        },
        features: {
          keyFeatures:       values.features?.keyFeatures || [],
          benefits:          values.features?.benefits || [],
          termsAndConditions: values.features?.termsAndConditions || [],
          disclaimers:       values.features?.disclaimers || [],
        },
        displayOrder: values.displayOrder,
        isPopular:    values.isPopular,
        isFeatured:   values.isFeatured,
        meta: { isActive: values.meta?.isActive ?? true, isDeleted: false },
      };

      await apiService.put(`${MORTGAGE_PATH}/update-bank-product/${productId}`, payload);
      notification.success({ message: 'Bank Product Updated Successfully!' });
      await fetchProduct();          // refresh view data
      setMainTab('view');            // switch back to view tab
    } catch (err) {
      console.error('Update error:', err);
      notification.error({ message: err.response?.data?.message || 'Update failed. Please try again.' });
    } finally {
      setSaveLoading(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setLoading(true);
    try {
      await apiService.delete(`${MORTGAGE_PATH}/delete-bank-product/${productId}`);
      notification.success({ message: 'Product deleted successfully' });
      onDelete && onDelete();
    } catch (err) {
      notification.error({ message: 'Failed to delete product' });
    } finally {
      setLoading(false);
    }
  };

  // ── Shared style ───────────────────────────────────────────────────────────
  const cardStyle   = { borderRadius: 12, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', marginBottom: 16 };
  const secStyle    = { borderColor: THEME.primary, marginBottom: 12 };
  const col3        = { xs: 24, sm: 12, md: 8,  lg: 8,  xl: 8  };
  const col2        = { xs: 24, sm: 24, md: 12, lg: 12, xl: 12 };
  const typeColor   = { FIXED: 'purple', VARIABLE: 'blue', ISLAMIC: 'green' };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading && !product) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product) return null;

  const { bankInfo, offerSummary, loanDetails, costBreakdown, insurance, eligibility, features, meta } = product;

  // ══════════════════════════════════════════════════════════════════════════
  //  VIEW TAB
  // ══════════════════════════════════════════════════════════════════════════
  const ViewTab = () => (
    <div>
      {/* ── Bank Info ──────────────────────────────────────────────────── */}
      <Card bordered={false} style={cardStyle}>
        <Divider orientation="left" style={secStyle}>
          <Space><BankOutlined style={{ color: THEME.primary }} /><Text strong>Bank Information</Text></Space>
        </Divider>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={4} style={{ textAlign: 'center' }}>
            {bankInfo?.logo
              ? <Avatar src={bankInfo.logo} size={72} shape="square" style={{ borderRadius: 10 }} />
              : <Avatar size={72} shape="square" style={{ background: THEME.primary, borderRadius: 10, fontSize: 28 }}>
                  {bankInfo?.bankName?.[0]}
                </Avatar>}
          </Col>
          <Col xs={24} sm={20}>
            <Row gutter={16}>
              <Col xs={12} md={6}><InfoRow label="Bank Name"     value={bankInfo?.bankName} /></Col>
              <Col xs={12} md={6}><InfoRow label="Bank Code"     value={bankInfo?.bankCode} /></Col>
              <Col xs={12} md={6}><InfoRow label="Rating"        value={bankInfo?.rating ? `${bankInfo.rating} / 5` : null} /></Col>
              <Col xs={12} md={6}><InfoRow label="Reviews"       value={bankInfo?.reviewCount} /></Col>
              <Col xs={12} md={6}><InfoRow label="Customer Care" value={bankInfo?.customerCare} /></Col>
              <Col xs={12} md={6}><InfoRow label="Website"       value={bankInfo?.website} /></Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* ── Offer Summary ─────────────────────────────────────────────── */}
      <Card bordered={false} style={cardStyle}>
        <Divider orientation="left" style={secStyle}>
          <Space><StarOutlined style={{ color: THEME.primary }} /><Text strong>Offer Summary</Text></Space>
        </Divider>
        <Row gutter={[16, 8]}>
          <Col xs={24} md={12}>
            <InfoRow label="Offer Title" value={
              <Space wrap>
                <Text strong>{offerSummary?.title}</Text>
                {offerSummary?.popularityTag && <Tag color="gold">{offerSummary.popularityTag}</Tag>}
                {offerSummary?.badge         && <Tag color="blue">{offerSummary.badge}</Tag>}
              </Space>
            } />
          </Col>
          <Col xs={24} md={12}><InfoRow label="Short Description" value={offerSummary?.shortDescription} /></Col>
          <Col xs={12} md={4}>
            <InfoRow label="Product Type" value={
              <Tag color={typeColor[offerSummary?.productType] || 'default'}>{offerSummary?.productType}</Tag>
            } />
          </Col>
          <Col xs={12} md={4}><InfoRow label="Fixed Years"      value={offerSummary?.fixedYears} /></Col>
          <Col xs={12} md={4}><InfoRow label="Initial Rate"     value={offerSummary?.initialRate ? `${offerSummary.initialRate}%` : null} /></Col>
          <Col xs={12} md={4}><InfoRow label="Comparison Rate"  value={offerSummary?.comparisonRate ? `${offerSummary.comparisonRate}%` : null} /></Col>
          <Col xs={12} md={4}><InfoRow label="Monthly EMI"      value={offerSummary?.monthlyEMI ? `${offerSummary.currency || 'AED'} ${fmt(offerSummary.monthlyEMI)}` : null} /></Col>
          <Col xs={12} md={4}><InfoRow label="Currency"         value={offerSummary?.currency} /></Col>
          <Col xs={12} md={4}><InfoRow label="Total Upfront"    value={`AED ${fmt(offerSummary?.totalUpfrontCost)}`} /></Col>
          <Col xs={12} md={4}><InfoRow label="Max Loan Amount"  value={`AED ${fmt(offerSummary?.maxLoanAmount)}`} /></Col>
          <Col xs={12} md={4}>
            <InfoRow label="Validity" value={
              offerSummary?.productValidity?.doesNotExpire
                ? <Tag color="green">Never Expires</Tag>
                : <Tag color="orange">Expires: {offerSummary?.productValidity?.expiryDate
                    ? dayjs(offerSummary.productValidity.expiryDate).format('DD MMM YYYY') : '—'}</Tag>
            } />
          </Col>
          <Col xs={12} md={3}><InfoRow label="Popular"       value={<BoolBadge value={product.isPopular} />} /></Col>
          <Col xs={12} md={3}><InfoRow label="Featured"      value={<BoolBadge value={product.isFeatured} />} /></Col>
          <Col xs={12} md={3}><InfoRow label="Display Order" value={product.displayOrder} /></Col>
          <Col xs={12} md={3}>
            <InfoRow label="Status" value={
              <Badge status={meta?.isActive ? 'success' : 'error'} text={meta?.isActive ? 'Active' : 'Inactive'} />
            } />
          </Col>
        </Row>
      </Card>

      {/* ── Loan Details ──────────────────────────────────────────────── */}
      <Card bordered={false} style={cardStyle}>
        <Divider orientation="left" style={secStyle}>
          <Space><FileTextOutlined style={{ color: THEME.primary }} /><Text strong>Loan Details</Text></Space>
        </Divider>
        <Row gutter={[16, 8]}>
          <Col xs={12} md={4}><InfoRow label="Tenure (Yrs)"              value={loanDetails?.tenureYears} /></Col>
          <Col xs={12} md={4}><InfoRow label="Min Tenure (Yrs)"          value={loanDetails?.minTenureYears} /></Col>
          <Col xs={12} md={4}><InfoRow label="Max Tenure (Yrs)"          value={loanDetails?.maxTenureYears} /></Col>
          <Col xs={12} md={4}><InfoRow label="LTV (%)"                   value={loanDetails?.loanToValue} /></Col>
          <Col xs={12} md={4}><InfoRow label="Min LTV (%)"               value={loanDetails?.minLoanToValue} /></Col>
          <Col xs={12} md={4}><InfoRow label="Max LTV (%)"               value={loanDetails?.maxLoanToValue} /></Col>
          <Col xs={12} md={4}><InfoRow label="Interest Type"             value={loanDetails?.interestType} /></Col>
          <Col xs={12} md={4}><InfoRow label="Salary Transfer"           value={loanDetails?.salaryTransfer} /></Col>
          <Col xs={12} md={4}><InfoRow label="Follow-On Rate Type"       value={loanDetails?.followOnRateType} /></Col>
          <Col xs={12} md={4}><InfoRow label="Follow-On Rate"            value={loanDetails?.followOnRate} /></Col>
          <Col xs={12} md={4}><InfoRow label="Overpayment (%)"           value={loanDetails?.overpaymentAllowedPercent} /></Col>
          <Col xs={12} md={4}><InfoRow label="Early Settlement Free Yrs" value={loanDetails?.earlySettlementFreeAfterYears} /></Col>
          <Col xs={12} md={6}><InfoRow label="Early Settlement Fee"      value={loanDetails?.earlySettlementFee} /></Col>
          <Col xs={12} md={6}><InfoRow label="Late Payment Fee"          value={loanDetails?.latePaymentFee} /></Col>
          <Col xs={12} md={4}><InfoRow label="Payment Holiday"           value={<BoolBadge value={loanDetails?.paymentHolidayAllowed} />} /></Col>
          <Col xs={12} md={4}><InfoRow label="Holiday Days"              value={loanDetails?.paymentHolidayDays} /></Col>
        </Row>
      </Card>

      {/* ── Cost Breakdown ────────────────────────────────────────────── */}
      <Card bordered={false} style={cardStyle}>
        <Divider orientation="left" style={secStyle}>
          <Space><DollarOutlined style={{ color: THEME.primary }} /><Text strong>Cost Breakdown</Text></Space>
        </Divider>
        <Row gutter={[16, 8]}>
          <Col xs={12} md={4}><InfoRow label="Property Price (AED)"       value={fmt(costBreakdown?.propertyPrice)} /></Col>
          <Col xs={12} md={4}><InfoRow label="Down Payment (AED)"         value={fmt(costBreakdown?.downPayment)} /></Col>
          <Col xs={12} md={4}><InfoRow label="Down Payment (%)"           value={costBreakdown?.downPaymentPercentage} /></Col>
          <Col xs={12} md={4}><InfoRow label="DLD Fee (AED)"              value={fmt(costBreakdown?.dldFee)} /></Col>
          <Col xs={12} md={4}><InfoRow label="Mortgage Reg. Fee (AED)"    value={fmt(costBreakdown?.mortgageRegistrationFee)} /></Col>
          <Col xs={12} md={4}><InfoRow label="Trustee Fee (AED)"          value={fmt(costBreakdown?.trusteeFee)} /></Col>
          <Col xs={12} md={4}><InfoRow label="Bank Processing Fee (AED)"  value={fmt(costBreakdown?.bankProcessingFee)} /></Col>
          <Col xs={12} md={4}><InfoRow label="Processing Fee Type"        value={costBreakdown?.bankProcessingFeeType} /></Col>
          <Col xs={12} md={4}><InfoRow label="Min Processing Fee (AED)"   value={fmt(costBreakdown?.minimumBankProcessingFee)} /></Col>
          <Col xs={12} md={4}><InfoRow label="Valuation Fee (AED)"        value={fmt(costBreakdown?.valuationFee)} /></Col>
          <Col xs={12} md={4}><InfoRow label="Val. Fee Incl. VAT"         value={<BoolBadge value={costBreakdown?.propertyValuationFeeInclusiveVAT} />} /></Col>
          <Col xs={12} md={4}><InfoRow label="Property Insurance (AED)"   value={fmt(costBreakdown?.propertyInsuranceFee)} /></Col>
          <Col xs={12} md={4}><InfoRow label="Life Insurance Fee (AED)"   value={fmt(costBreakdown?.lifeInsuranceFee)} /></Col>
          <Col xs={12} md={4}><InfoRow label="Agency Fee (AED)"           value={fmt(costBreakdown?.agencyFee)} /></Col>
          <Col xs={12} md={4}><InfoRow label="Conveyance Fee (AED)"       value={fmt(costBreakdown?.conveyanceFee)} /></Col>
          <Col xs={12} md={4}><InfoRow label="Fees Added to Loan (AED)"   value={fmt(costBreakdown?.feesAddedToLoan)} /></Col>
          <Col xs={12} md={4}><InfoRow label="Total Upfront Cost (AED)"   value={fmt(costBreakdown?.totalUpfrontCost)} /></Col>
          <Col xs={12} md={4}><InfoRow label="Payable by Buyer (AED)"     value={fmt(costBreakdown?.payableByBuyer)} /></Col>
          <Col xs={12} md={4}><InfoRow label="Payable by Seller (AED)"    value={fmt(costBreakdown?.payableBySeller)} /></Col>
          <Col xs={12} md={4}><InfoRow label="Pre-Approval Fee (AED)"     value={fmt(costBreakdown?.bankPreApprovalFee)} /></Col>
          <Col xs={12} md={4}><InfoRow label="Pre-Approval Free?"         value={<BoolBadge value={costBreakdown?.isBankPreApprovalFeeFree} />} /></Col>
          <Col xs={12} md={4}><InfoRow label="Buyout Fee (AED)"           value={fmt(costBreakdown?.buyoutFee)} /></Col>
          <Col xs={12} md={4}><InfoRow label="Buyout Fee N/A?"            value={<BoolBadge value={costBreakdown?.isBuyoutFeeNA} />} /></Col>
        </Row>
      </Card>

      {/* ── Insurance ─────────────────────────────────────────────────── */}
      <Card bordered={false} style={cardStyle}>
        <Divider orientation="left" style={secStyle}>
          <Space><SafetyCertificateOutlined style={{ color: THEME.primary }} /><Text strong>Insurance</Text></Space>
        </Divider>
        <Row gutter={[16, 8]}>
          <Col xs={12} md={4}><InfoRow label="Life Insurance"             value={insurance?.lifeInsurance} /></Col>
          <Col xs={12} md={4}><InfoRow label="Life Ins. Required?"        value={<BoolBadge value={insurance?.lifeInsuranceRequired} />} /></Col>
          <Col xs={12} md={4}><InfoRow label="Life Ins. Cost (AED)"       value={fmt(insurance?.lifeInsuranceCost)} /></Col>
          <Col xs={12} md={4}><InfoRow label="Property Insurance"         value={insurance?.propertyInsurance} /></Col>
          <Col xs={12} md={4}><InfoRow label="Property Ins. Required?"    value={<BoolBadge value={insurance?.propertyInsuranceRequired} />} /></Col>
          <Col xs={12} md={4}><InfoRow label="Property Ins. Cost (AED)"   value={fmt(insurance?.propertyInsuranceCost)} /></Col>
          <Col xs={12} md={4}><InfoRow label="Mortgage Protection"        value={insurance?.mortgageProtection} /></Col>
        </Row>
      </Card>

      {/* ── Eligibility ───────────────────────────────────────────────── */}
      <Card bordered={false} style={cardStyle}>
        <Divider orientation="left" style={secStyle}>
          <Space><TeamOutlined style={{ color: THEME.primary }} /><Text strong>Eligibility</Text></Space>
        </Divider>
        <Row gutter={[16, 8]}>
          <Col xs={12} md={4}><InfoRow label="Min Salary (AED)"      value={fmt(eligibility?.minSalary)} /></Col>
          <Col xs={12} md={4}><InfoRow label="Max Salary (AED)"      value={eligibility?.maxSalary ? fmt(eligibility.maxSalary) : '—'} /></Col>
          <Col xs={12} md={4}><InfoRow label="Age Range"             value={`${eligibility?.minAge ?? '—'} – ${eligibility?.maxAge ?? '—'} yrs`} /></Col>
          <Col xs={12} md={4}><InfoRow label="Min Loan (AED)"        value={fmt(eligibility?.minLoanAmount)} /></Col>
          <Col xs={12} md={4}><InfoRow label="Max Loan (AED)"        value={fmt(eligibility?.maxLoanAmount)} /></Col>
          <Col xs={12} md={4}><InfoRow label="LTV Range (%)"         value={`${eligibility?.minLTV ?? '—'} – ${eligibility?.maxLTV ?? '—'}`} /></Col>
          <Col xs={12} md={4}><InfoRow label="Min Experience (Yrs)"  value={eligibility?.minExperienceYears} /></Col>
          <Col xs={12} md={4}><InfoRow label="Min Employment (Yrs)"  value={eligibility?.minEmploymentYears} /></Col>
          <Col xs={12} md={4}><InfoRow label="Visa Required?"        value={<BoolBadge value={eligibility?.visaRequired} />} /></Col>
          <Col xs={24} md={6}>
            <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Nationalities</Text>
            <div style={{ marginTop: 4 }}>
              {eligibility?.eligibleNationalities?.map((n) => <Tag key={n}>{n}</Tag>) || '—'}
            </div>
          </Col>
          <Col xs={24} md={6}>
            <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Employment Types</Text>
            <div style={{ marginTop: 4 }}>
              {eligibility?.eligibleEmploymentTypes?.map((e) => <Tag key={e} color="blue">{e}</Tag>) || '—'}
            </div>
          </Col>
          <Col xs={24} md={6}>
            <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Residency Status</Text>
            <div style={{ marginTop: 4 }}>
              {eligibility?.eligibleResidencyStatus?.map((r) => <Tag key={r} color="purple">{r}</Tag>) || '—'}
            </div>
          </Col>
        </Row>
      </Card>

      {/* ── Features & Benefits ───────────────────────────────────────── */}
      <Card bordered={false} style={cardStyle}>
        <Divider orientation="left" style={secStyle}>
          <Space><FileSearchOutlined style={{ color: THEME.primary }} /><Text strong>Features &amp; Benefits</Text></Space>
        </Divider>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Key Features</Text>
            <div style={{ marginTop: 6 }}>
              {features?.keyFeatures?.length
                ? features.keyFeatures.map((f) => <Tag key={f} color="green" style={{ marginBottom: 6 }}>{f}</Tag>)
                : '—'}
            </div>
          </Col>
          <Col xs={24} md={12}>
            <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Benefits</Text>
            <div style={{ marginTop: 6 }}>
              {features?.benefits?.length
                ? features.benefits.map((b) => <Tag key={b} color="blue" style={{ marginBottom: 6 }}>{b}</Tag>)
                : '—'}
            </div>
          </Col>
          <Col xs={24} md={12}>
            <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Terms &amp; Conditions</Text>
            <div style={{ marginTop: 6 }}>
              {features?.termsAndConditions?.length
                ? features.termsAndConditions.map((t) => <Tag key={t} color="orange" style={{ marginBottom: 6 }}>{t}</Tag>)
                : '—'}
            </div>
          </Col>
          <Col xs={24} md={12}>
            <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Disclaimers</Text>
            <div style={{ marginTop: 6 }}>
              {features?.disclaimers?.length
                ? features.disclaimers.map((d) => <Tag key={d} color="red" style={{ marginBottom: 6 }}>{d}</Tag>)
                : '—'}
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  //  EDIT TAB
  // ══════════════════════════════════════════════════════════════════════════
  const EditTab = () => (
    <Form form={form} layout="vertical" onFinish={handleSave} scrollToFirstError>

      {/* Inner section tabs */}
      <Tabs
        activeKey={editSection}
        onChange={setEditSection}
        type="card"
        size="small"
        style={{ marginBottom: 16 }}
        items={[
          { key: '1', label: <span><BankOutlined />  Bank &amp; Offer</span> },
          { key: '2', label: <span><FileTextOutlined /> Loan Details</span> },
          { key: '3', label: <span><DollarOutlined /> Cost Breakdown</span> },
          { key: '4', label: <span><SafetyCertificateOutlined /> Insurance</span> },
          { key: '5', label: <span><TeamOutlined /> Eligibility</span> },
          { key: '6', label: <span><FileSearchOutlined /> Features</span> },
        ]}
      />

      {/* ─── Section 1: Bank Info + Offer Summary ──────────────────────── */}
      <div style={{ display: editSection === '1' ? 'block' : 'none' }}>
        <Card bordered={false} style={cardStyle}>
          <Divider orientation="left" style={secStyle}>
            <Space><BankOutlined style={{ color: THEME.primary }} /><Text strong>Bank Information</Text></Space>
          </Divider>
          <Row gutter={[16, 8]}>
            <Col {...col3}>
              <Form.Item name={['bankInfo', 'bankName']} label="Bank Name" rules={[{ required: true }]}>
                <Input size="large" placeholder="e.g. Emirates NBD" />
              </Form.Item>
            </Col>
            <Col {...col3}>
              <Form.Item name={['bankInfo', 'bankCode']} label="Bank Code" rules={[{ required: true }]}>
                <Input size="large" placeholder="e.g. ENBD002" />
              </Form.Item>
            </Col>
            <Col {...col3}>
              <Form.Item name={['bankInfo', 'rating']} label="Rating (0–5)">
                <InputNumber style={{ width: '100%' }} min={0} max={5} step={0.1} size="large" />
              </Form.Item>
            </Col>
            <Col {...col3}>
              <Form.Item name={['bankInfo', 'reviewCount']} label="Review Count">
                <InputNumber style={{ width: '100%' }} min={0} size="large" />
              </Form.Item>
            </Col>
            <Col {...col3}>
              <Form.Item name={['bankInfo', 'customerCare']} label="Customer Care">
                <Input size="large" placeholder="600 54 0000" />
              </Form.Item>
            </Col>
            <Col {...col3}>
              <Form.Item name={['bankInfo', 'website']} label="Website">
                <Input size="large" placeholder="https://www.bank.com" />
              </Form.Item>
            </Col>
            <Col {...col3}>
              <Form.Item name={['bankInfo', 'logo']} label="Logo URL">
                <Input size="large" placeholder="https://cdn.example.com/logo.png" />
              </Form.Item>
            </Col>
            <Col {...col3}>
              <Form.Item label="Upload Logo">
                <Upload listType="picture-card" fileList={logoList} customRequest={handleCustomUpload}
                  maxCount={1} beforeUpload={validateImageSize}
                  onChange={({ fileList }) => setLogoList(fileList)}>
                  {logoList.length >= 1 ? null : <div><PlusOutlined /><div style={{ marginTop: 4 }}>Upload</div></div>}
                </Upload>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card bordered={false} style={cardStyle}>
          <Divider orientation="left" style={secStyle}>
            <Space><StarOutlined style={{ color: THEME.primary }} /><Text strong>Offer Summary</Text></Space>
          </Divider>
          <Row gutter={[16, 8]}>
            <Col {...col2}>
              <Form.Item name={['offerSummary', 'title']} label="Offer Title" rules={[{ required: true }]}>
                <Input size="large" placeholder="e.g. HomeSmart Fixed Rate" />
              </Form.Item>
            </Col>
            <Col {...col2}>
              <Form.Item name={['offerSummary', 'shortDescription']} label="Short Description">
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col {...col3}>
              <Form.Item name={['offerSummary', 'productType']} label="Product Type" rules={[{ required: true }]}>
                <Select size="large">
                  <Option value="FIXED">Fixed</Option>
                  <Option value="VARIABLE">Variable</Option>
                  <Option value="ISLAMIC">Islamic</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col {...col3}>
              <Form.Item name={['offerSummary', 'fixedYears']} label="Fixed Years">
                <InputNumber style={{ width: '100%' }} min={0} size="large" />
              </Form.Item>
            </Col>
            <Col {...col3}>
              <Form.Item name={['offerSummary', 'initialRate']} label="Initial Rate (%)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} step={0.01} size="large" />
              </Form.Item>
            </Col>
            <Col {...col3}>
              <Form.Item name={['offerSummary', 'comparisonRate']} label="Comparison Rate (%)">
                <InputNumber style={{ width: '100%' }} step={0.01} size="large" />
              </Form.Item>
            </Col>
            <Col {...col3}>
              <Form.Item name={['offerSummary', 'monthlyEMI']} label="Monthly EMI (AED)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} size="large" />
              </Form.Item>
            </Col>
            <Col {...col3}>
              <Form.Item name={['offerSummary', 'currency']} label="Currency">
                <Select size="large"><Option value="AED">AED</Option><Option value="USD">USD</Option></Select>
              </Form.Item>
            </Col>
            <Col {...col3}>
              <Form.Item name={['offerSummary', 'totalUpfrontCost']} label="Total Upfront Cost (AED)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} size="large" />
              </Form.Item>
            </Col>
            <Col {...col3}>
              <Form.Item name={['offerSummary', 'maxLoanAmount']} label="Max Loan Amount (AED)">
                <InputNumber style={{ width: '100%' }} size="large" />
              </Form.Item>
            </Col>
            <Col {...col3}>
              <Form.Item name={['offerSummary', 'popularityTag']} label="Popularity Tag">
                <Input size="large" placeholder="e.g. Best Rate" />
              </Form.Item>
            </Col>
            <Col {...col3}>
              <Form.Item name={['offerSummary', 'badge']} label="Badge">
                <Select size="large" allowClear>
                  <Option value="Popular">Popular</Option>
                  <Option value="Best Rate">Best Rate</Option>
                  <Option value="Lowest Fees">Lowest Fees</Option>
                  <Option value="New">New</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col {...col3}>
              <Form.Item label="Product Validity">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Switch checked={doesNotExpire} onChange={setDoesNotExpire}
                    checkedChildren="Never Expires" unCheckedChildren="Has Expiry" />
                  {!doesNotExpire && (
                    <Form.Item name={['offerSummary', 'productValidity', 'expiryDate']} noStyle rules={[{ required: true }]}>
                      <DatePicker style={{ width: '100%' }} size="large" />
                    </Form.Item>
                  )}
                </Space>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 8]}>
            <Col {...col3}><Form.Item name="isPopular"  label="Is Popular?"  valuePropName="checked"><Switch /></Form.Item></Col>
            <Col {...col3}><Form.Item name="isFeatured" label="Is Featured?" valuePropName="checked"><Switch /></Form.Item></Col>
            <Col {...col3}><Form.Item name="displayOrder" label="Display Order"><InputNumber style={{ width: '100%' }} min={0} size="large" /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['meta', 'isActive']} label="Active?" valuePropName="checked"><Switch /></Form.Item></Col>
          </Row>
        </Card>
      </div>

      {/* ─── Section 2: Loan Details ────────────────────────────────────── */}
      <div style={{ display: editSection === '2' ? 'block' : 'none' }}>
        <Card bordered={false} style={cardStyle}>
          <Divider orientation="left" style={secStyle}><Text strong>Loan Details</Text></Divider>
          <Row gutter={[16, 8]}>
            <Col {...col3}><Form.Item name={['loanDetails', 'tenureYears']}    label="Tenure (Years)"><InputNumber style={{ width: '100%' }} min={1} max={30} size="large" /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['loanDetails', 'minTenureYears']} label="Min Tenure (Years)"><InputNumber style={{ width: '100%' }} min={1} size="large" /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['loanDetails', 'maxTenureYears']} label="Max Tenure (Years)"><InputNumber style={{ width: '100%' }} min={1} size="large" /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['loanDetails', 'loanToValue']}    label="LTV (%)" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={0} max={100} size="large" /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['loanDetails', 'minLoanToValue']} label="Min LTV (%)"><InputNumber style={{ width: '100%' }} min={0} max={100} size="large" /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['loanDetails', 'maxLoanToValue']} label="Max LTV (%)"><InputNumber style={{ width: '100%' }} min={0} max={100} size="large" /></Form.Item></Col>
            <Col {...col3}>
              <Form.Item name={['loanDetails', 'interestType']} label="Interest Type">
                <Select size="large"><Option value="CONVENTIONAL">Conventional</Option><Option value="ISLAMIC">Islamic</Option></Select>
              </Form.Item>
            </Col>
            <Col {...col3}>
              <Form.Item name={['loanDetails', 'salaryTransfer']} label="Salary Transfer">
                <Select size="large">
                  <Option value="STL">STL (Salary Transfer)</Option>
                  <Option value="NSTL">NSTL (Non-Salary Transfer)</Option>
                  <Option value="Both">Both</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col {...col3}>
              <Form.Item name={['loanDetails', 'followOnRateType']} label="Follow-On Rate Type">
                <Select size="large" allowClear>
                  <Option value="Fixed">Fixed</Option><Option value="Variable">Variable</Option><Option value="EIBOR +">EIBOR +</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col {...col3}><Form.Item name={['loanDetails', 'followOnRate']} label="Follow-On Rate"><Input size="large" placeholder="e.g. EIBOR + 1.75%" /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['loanDetails', 'overpaymentAllowedPercent']} label="Overpayment (%)"><InputNumber style={{ width: '100%' }} min={0} size="large" /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['loanDetails', 'earlySettlementFreeAfterYears']} label="Early Settlement Free After (Yrs)"><InputNumber style={{ width: '100%' }} min={0} size="large" /></Form.Item></Col>
            <Col {...col2}><Form.Item name={['loanDetails', 'earlySettlementFee']} label="Early Settlement Fee"><Input size="large" placeholder="e.g. 1% of outstanding amount" /></Form.Item></Col>
            <Col {...col2}><Form.Item name={['loanDetails', 'latePaymentFee']} label="Late Payment Fee"><Input size="large" placeholder="e.g. 2% per month" /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['loanDetails', 'paymentHolidayAllowed']} label="Payment Holiday?" valuePropName="checked"><Switch /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['loanDetails', 'paymentHolidayDays']} label="Payment Holiday Days"><InputNumber style={{ width: '100%' }} min={0} size="large" /></Form.Item></Col>
          </Row>
        </Card>
      </div>

      {/* ─── Section 3: Cost Breakdown ──────────────────────────────────── */}
      <div style={{ display: editSection === '3' ? 'block' : 'none' }}>
        <Card bordered={false} style={cardStyle}>
          <Divider orientation="left" style={secStyle}><Text strong>Cost Breakdown</Text></Divider>
          <Row gutter={[16, 8]}>
            <Col {...col3}><Form.Item name={['costBreakdown', 'propertyPrice']}    label="Property Price (AED)"><InputNumber style={{ width: '100%' }} size="large" /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['costBreakdown', 'downPayment']}      label="Down Payment (AED)" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} size="large" /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['costBreakdown', 'downPaymentPercentage']} label="Down Payment (%)"><InputNumber style={{ width: '100%' }} min={0} max={100} size="large" /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['costBreakdown', 'dldFee']}           label="DLD Fee (AED)"><InputNumber style={{ width: '100%' }} size="large" /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['costBreakdown', 'mortgageRegistrationFee']} label="Mortgage Reg. Fee (AED)"><InputNumber style={{ width: '100%' }} size="large" /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['costBreakdown', 'trusteeFee']}       label="Trustee Fee (AED)"><InputNumber style={{ width: '100%' }} size="large" /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['costBreakdown', 'bankProcessingFee']} label="Bank Processing Fee (AED)"><InputNumber style={{ width: '100%' }} size="large" /></Form.Item></Col>
            <Col {...col3}>
              <Form.Item name={['costBreakdown', 'bankProcessingFeeType']} label="Processing Fee Type">
                <Select size="large"><Option value="Fixed">Fixed</Option><Option value="Percentage">Percentage</Option></Select>
              </Form.Item>
            </Col>
            <Col {...col3}><Form.Item name={['costBreakdown', 'minimumBankProcessingFee']} label="Min Processing Fee (AED)"><InputNumber style={{ width: '100%' }} size="large" /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['costBreakdown', 'valuationFee']}     label="Valuation Fee (AED)"><InputNumber style={{ width: '100%' }} size="large" /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['costBreakdown', 'propertyValuationFeeInclusiveVAT']} label="Valuation Fee Incl. VAT?" valuePropName="checked"><Switch /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['costBreakdown', 'propertyInsuranceFee']} label="Property Insurance (AED)"><InputNumber style={{ width: '100%' }} size="large" /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['costBreakdown', 'lifeInsuranceFee']} label="Life Insurance Fee (AED)"><InputNumber style={{ width: '100%' }} size="large" /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['costBreakdown', 'agencyFee']}        label="Agency Fee (AED)"><InputNumber style={{ width: '100%' }} size="large" /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['costBreakdown', 'conveyanceFee']}    label="Conveyance Fee (AED)"><InputNumber style={{ width: '100%' }} size="large" /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['costBreakdown', 'feesAddedToLoan']}  label="Fees Added to Loan (AED)"><InputNumber style={{ width: '100%' }} size="large" /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['costBreakdown', 'totalUpfrontCost']} label="Total Upfront Cost (AED)" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} size="large" /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['costBreakdown', 'payableByBuyer']}   label="Payable by Buyer (AED)"><InputNumber style={{ width: '100%' }} size="large" /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['costBreakdown', 'payableBySeller']}  label="Payable by Seller (AED)"><InputNumber style={{ width: '100%' }} size="large" /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['costBreakdown', 'bankPreApprovalFee']} label="Pre-Approval Fee (AED)"><InputNumber style={{ width: '100%' }} size="large" /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['costBreakdown', 'isBankPreApprovalFeeFree']} label="Pre-Approval Free?" valuePropName="checked"><Switch /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['costBreakdown', 'buyoutFee']}        label="Buyout Fee (AED)"><InputNumber style={{ width: '100%' }} size="large" /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['costBreakdown', 'isBuyoutFeeNA']}   label="Buyout Fee N/A?" valuePropName="checked"><Switch /></Form.Item></Col>
          </Row>
        </Card>
      </div>

      {/* ─── Section 4: Insurance ───────────────────────────────────────── */}
      <div style={{ display: editSection === '4' ? 'block' : 'none' }}>
        <Card bordered={false} style={cardStyle}>
          <Divider orientation="left" style={secStyle}><Text strong>Insurance</Text></Divider>
          <Row gutter={[16, 8]}>
            <Col {...col3}><Form.Item name={['insurance', 'lifeInsurance']}         label="Life Insurance"><Input size="large" placeholder="e.g. Required - Decreasing Term" /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['insurance', 'lifeInsuranceRequired']} label="Life Ins. Required?" valuePropName="checked"><Switch /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['insurance', 'lifeInsuranceCost']}     label="Life Ins. Cost (AED)"><InputNumber style={{ width: '100%' }} size="large" /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['insurance', 'propertyInsurance']}     label="Property Insurance"><Input size="large" placeholder="e.g. Required - Building Insurance" /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['insurance', 'propertyInsuranceRequired']} label="Property Ins. Required?" valuePropName="checked"><Switch /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['insurance', 'propertyInsuranceCost']} label="Property Ins. Cost (AED)"><InputNumber style={{ width: '100%' }} size="large" /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['insurance', 'mortgageProtection']}    label="Mortgage Protection"><Input size="large" placeholder="e.g. Optional" /></Form.Item></Col>
          </Row>
        </Card>
      </div>

      {/* ─── Section 5: Eligibility ─────────────────────────────────────── */}
      <div style={{ display: editSection === '5' ? 'block' : 'none' }}>
        <Card bordered={false} style={cardStyle}>
          <Divider orientation="left" style={secStyle}><Text strong>Eligibility Criteria</Text></Divider>
          <Row gutter={[16, 8]}>
            <Col {...col3}><Form.Item name={['eligibility', 'minSalary']}    label="Min Salary (AED)"><InputNumber style={{ width: '100%' }} size="large" /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['eligibility', 'maxSalary']}    label="Max Salary (AED)"><InputNumber style={{ width: '100%' }} size="large" /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['eligibility', 'minAge']}       label="Min Age"><InputNumber style={{ width: '100%' }} min={0} size="large" /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['eligibility', 'maxAge']}       label="Max Age"><InputNumber style={{ width: '100%' }} min={0} size="large" /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['eligibility', 'minLoanAmount']} label="Min Loan Amount (AED)"><InputNumber style={{ width: '100%' }} size="large" /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['eligibility', 'maxLoanAmount']} label="Max Loan Amount (AED)"><InputNumber style={{ width: '100%' }} size="large" /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['eligibility', 'minLTV']}       label="Min LTV (%)"><InputNumber style={{ width: '100%' }} min={0} max={100} size="large" /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['eligibility', 'maxLTV']}       label="Max LTV (%)"><InputNumber style={{ width: '100%' }} min={0} max={100} size="large" /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['eligibility', 'minExperienceYears']} label="Min Experience (Yrs)"><InputNumber style={{ width: '100%' }} min={0} size="large" /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['eligibility', 'minEmploymentYears']} label="Min Employment (Yrs)"><InputNumber style={{ width: '100%' }} min={0} size="large" /></Form.Item></Col>
            <Col {...col3}><Form.Item name={['eligibility', 'visaRequired']} label="Visa Required?" valuePropName="checked"><Switch /></Form.Item></Col>
            <Col {...col3}>
              <Form.Item name={['eligibility', 'eligibleNationalities']} label="Eligible Nationalities">
                <Select mode="tags" size="large" placeholder="Add nationalities">
                  <Option value="All">All</Option><Option value="UAE">UAE</Option><Option value="GCC">GCC</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col {...col3}>
              <Form.Item name={['eligibility', 'eligibleEmploymentTypes']} label="Employment Types">
                <Select mode="tags" size="large" placeholder="Select types">
                  <Option value="Salaried">Salaried</Option>
                  <Option value="Self-Employed">Self-Employed</Option>
                  <Option value="Both">Both</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col {...col3}>
              <Form.Item name={['eligibility', 'eligibleResidencyStatus']} label="Residency Status">
                <Select mode="tags" size="large" placeholder="Select status">
                  <Option value="UAE National">UAE National</Option>
                  <Option value="UAE Resident">UAE Resident</Option>
                  <Option value="Non-Resident">Non-Resident</Option>
                  <Option value="All">All</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </div>

      {/* ─── Section 6: Features ────────────────────────────────────────── */}
      <div style={{ display: editSection === '6' ? 'block' : 'none' }}>
        <Card bordered={false} style={cardStyle}>
          <Divider orientation="left" style={secStyle}><Text strong>Features &amp; Benefits</Text></Divider>
          <Row gutter={[16, 8]}>
            <Col {...col2}>
              <Form.Item name={['features', 'keyFeatures']} label="Key Features">
                <Select mode="tags" size="large" placeholder="Type and press Enter">
                  <Option value="Free property valuation">Free property valuation</Option>
                  <Option value="No early settlement fee after 3 years">No early settlement fee after 3 years</Option>
                  <Option value="Free credit life insurance for 1 year">Free credit life insurance for 1 year</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col {...col2}>
              <Form.Item name={['features', 'benefits']} label="Benefits">
                <Select mode="tags" size="large" placeholder="Type and press Enter">
                  <Option value="Priority banking services">Priority banking services</Option>
                  <Option value="Free international lounges">Free international lounges</Option>
                  <Option value="Quick approval process">Quick approval process</Option>
                  <Option value="Dedicated home finance advisor">Dedicated home finance advisor</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col {...col2}>
              <Form.Item name={['features', 'termsAndConditions']} label="Terms &amp; Conditions">
                <Select mode="tags" size="large" placeholder="Type and press Enter">
                  <Option value="Terms apply">Terms apply</Option>
                  <Option value="Subject to bank approval">Subject to bank approval</Option>
                  <Option value="Valid for Dubai and Northern Emirates">Valid for Dubai and Northern Emirates</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col {...col2}>
              <Form.Item name={['features', 'disclaimers']} label="Disclaimers">
                <Select mode="tags" size="large" placeholder="Type and press Enter">
                  <Option value="Rates subject to change">Rates subject to change</Option>
                  <Option value="Fees may apply">Fees may apply</Option>
                  <Option value="Terms and conditions available on request">Terms and conditions available on request</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </div>

      {/* ─── Footer buttons ──────────────────────────────────────────────── */}
      <Card bordered={false} style={{ borderRadius: 12, marginTop: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button onClick={() => setMainTab('view')} size="large" icon={<EyeOutlined />}>
            Cancel &amp; View
          </Button>
          <Space>
            <Button onClick={() => prefillForm(product)} size="large" disabled={saveLoading}>
              Reset
            </Button>
            <Button type="primary" htmlType="submit" loading={saveLoading} size="large" icon={<SaveOutlined />}
              style={{ background: THEME.primary, borderColor: THEME.primary, minWidth: 180 }}>
              Update Product
            </Button>
          </Space>
        </div>
      </Card>
    </Form>
  );

  // ══════════════════════════════════════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ padding: 24, background: '#f5f3ff', minHeight: '100vh' }}>

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={onBack} type="text" />
          <div>
            <Title level={3} style={{ margin: 0, color: '#1e1b4b' }}>
              {bankInfo?.bankName}
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {offerSummary?.title}
            </Text>
          </div>
        </div>
        <Space>
          <Popconfirm
            title="Are you sure you want to delete this product?"
            onConfirm={handleDelete}
            okText="Yes, Delete"
            okButtonProps={{ danger: true }}
            cancelText="Cancel"
          >
            <Button danger icon={<DeleteOutlined />} loading={loading}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      </div>

      {/* ── Main View / Edit tabs ────────────────────────────────────────── */}
      <Tabs
        activeKey={mainTab}
        onChange={setMainTab}
        type="line"
        size="large"
        style={{ marginBottom: 20 }}
        tabBarStyle={{ background: '#fff', padding: '0 16px', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        items={[
          {
            key: 'view',
            label: (
              <span style={{ fontWeight: 600, fontSize: 15 }}>
                <EyeOutlined style={{ marginRight: 6 }} />View Details
              </span>
            ),
          },
          {
            key: 'edit',
            label: (
              <span style={{ fontWeight: 600, fontSize: 15 }}>
                <EditOutlined style={{ marginRight: 6 }} />Edit Product
              </span>
            ),
          },
        ]}
      />

      {mainTab === 'view' ? <ViewTab /> : <EditTab />}
    </div>
  );
};

export default Bankproductview;