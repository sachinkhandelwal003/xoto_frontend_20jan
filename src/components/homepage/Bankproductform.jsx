import React, { useState, useEffect } from 'react';
import { apiService } from '../../manageApi/utils/custom.apiservice';
import {
  Button, Form, Input, InputNumber, Select, Row, Col, Divider,
  Typography, Card, Space, Switch, Upload, notification, message,
  Tabs, DatePicker
} from 'antd';
import {
  PlusOutlined, ArrowLeftOutlined, SaveOutlined,
  BankOutlined, FileTextOutlined, DollarOutlined,
  SafetyCertificateOutlined, TeamOutlined, FileSearchOutlined,
  StarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const THEME = { primary: '#7c3aed' };
const MORTGAGE_PATH = 'bank/products';

const BankProductForm = ({ mode = 'create', editData = null, onBack, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [logoList, setLogoList] = useState([]);
  const [activeTab, setActiveTab] = useState('1');
  const [doesNotExpire, setDoesNotExpire] = useState(true);

  const isEdit = mode === 'edit' && editData;

  // ─── Pre-fill in edit mode ───────────────────────────────────────────────────
  useEffect(() => {
    if (isEdit && editData) {
      const expires = editData.offerSummary?.productValidity?.doesNotExpire ?? true;
      setDoesNotExpire(expires);

      const formattedData = {
        ...editData,
        offerSummary: {
          ...editData.offerSummary,
          productValidity: {
            ...editData.offerSummary?.productValidity,
            expiryDate: editData.offerSummary?.productValidity?.expiryDate
              ? dayjs(editData.offerSummary.productValidity.expiryDate)
              : null,
          },
        },
      };

      form.setFieldsValue(formattedData);

      if (editData.bankInfo?.logo) {
        setLogoList([{ uid: '-1', url: editData.bankInfo.logo, status: 'done', name: 'Bank Logo' }]);
      }
    }
  }, [editData, isEdit, form]);

  // ─── Logo upload helpers ─────────────────────────────────────────────────────
  const validateImageSize = (file) => {
    if (!file.type.startsWith('image/')) {
      message.error('Only image files are allowed!');
      return Upload.LIST_IGNORE;
    }
    if (file.size / 1024 / 1024 > 5) {
      message.error('Image must be less than 5MB');
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const handleCustomUpload = async ({ file, onSuccess: uploadSuccess, onError }) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await apiService.upload('upload', formData);
      uploadSuccess(response);
      message.success('Logo uploaded successfully!');
    } catch (err) {
      onError(err);
      message.error('Logo upload failed');
    }
  };

  const resolvedLogo = () => {
    if (logoList.length > 0) {
      return (
        logoList[0].url ||
        logoList[0].response?.file?.url ||
        logoList[0].response?.url ||
        logoList[0].response ||
        ''
      );
    }
    return editData?.bankInfo?.logo || '';
  };

  // ─── Save / Update ───────────────────────────────────────────────────────────
  const handleSave = async (values) => {
    if (loading) return;
    setLoading(true);
    try {
      const payload = {
        bankInfo: {
          bankName: values.bankInfo?.bankName,
          bankCode: values.bankInfo?.bankCode,
          logo: resolvedLogo(),
          website: values.bankInfo?.website,
          customerCare: values.bankInfo?.customerCare,
          rating: values.bankInfo?.rating,
          reviewCount: values.bankInfo?.reviewCount,
        },
        offerSummary: {
          title: values.offerSummary?.title,
          shortDescription: values.offerSummary?.shortDescription,
          popularityTag: values.offerSummary?.popularityTag,
          badge: values.offerSummary?.badge,
          productType: values.offerSummary?.productType,
          fixedYears: values.offerSummary?.fixedYears,
          initialRate: values.offerSummary?.initialRate,
          comparisonRate: values.offerSummary?.comparisonRate,
          monthlyEMI: values.offerSummary?.monthlyEMI,
          currency: values.offerSummary?.currency || 'AED',
          totalUpfrontCost: values.offerSummary?.totalUpfrontCost,
          maxLoanAmount: values.offerSummary?.maxLoanAmount,
          productValidity: {
            doesNotExpire,
            expiryDate: doesNotExpire
              ? null
              : values.offerSummary?.productValidity?.expiryDate,
          },
        },
        loanDetails: {
          tenureYears: values.loanDetails?.tenureYears,
          minTenureYears: values.loanDetails?.minTenureYears,
          maxTenureYears: values.loanDetails?.maxTenureYears,
          followOnRate: values.loanDetails?.followOnRate,
          followOnRateType: values.loanDetails?.followOnRateType,
          loanToValue: values.loanDetails?.loanToValue,
          minLoanToValue: values.loanDetails?.minLoanToValue,
          maxLoanToValue: values.loanDetails?.maxLoanToValue,
          interestType: values.loanDetails?.interestType,
          salaryTransfer: values.loanDetails?.salaryTransfer,
          overpaymentAllowedPercent: values.loanDetails?.overpaymentAllowedPercent,
          earlySettlementFee: values.loanDetails?.earlySettlementFee,
          earlySettlementFreeAfterYears: values.loanDetails?.earlySettlementFreeAfterYears,
          latePaymentFee: values.loanDetails?.latePaymentFee,
          paymentHolidayAllowed: values.loanDetails?.paymentHolidayAllowed,
          paymentHolidayDays: values.loanDetails?.paymentHolidayDays,
        },
        costBreakdown: {
          propertyPrice: values.costBreakdown?.propertyPrice,
          downPayment: values.costBreakdown?.downPayment,
          downPaymentPercentage: values.costBreakdown?.downPaymentPercentage,
          dldFee: values.costBreakdown?.dldFee,
          mortgageRegistrationFee: values.costBreakdown?.mortgageRegistrationFee,
          trusteeFee: values.costBreakdown?.trusteeFee,
          bankProcessingFee: values.costBreakdown?.bankProcessingFee,
          bankProcessingFeeType: values.costBreakdown?.bankProcessingFeeType,
          valuationFee: values.costBreakdown?.valuationFee,
          propertyInsuranceFee: values.costBreakdown?.propertyInsuranceFee,
          lifeInsuranceFee: values.costBreakdown?.lifeInsuranceFee,
          agencyFee: values.costBreakdown?.agencyFee,
          conveyanceFee: values.costBreakdown?.conveyanceFee,
          feesAddedToLoan: values.costBreakdown?.feesAddedToLoan,
          totalUpfrontCost: values.costBreakdown?.totalUpfrontCost,
          payableByBuyer: values.costBreakdown?.payableByBuyer,
          payableBySeller: values.costBreakdown?.payableBySeller,
          bankPreApprovalFee: values.costBreakdown?.bankPreApprovalFee,
          isBankPreApprovalFeeFree: values.costBreakdown?.isBankPreApprovalFeeFree,
          minimumBankProcessingFee: values.costBreakdown?.minimumBankProcessingFee,
          buyoutFee: values.costBreakdown?.buyoutFee,
          isBuyoutFeeNA: values.costBreakdown?.isBuyoutFeeNA,
          propertyValuationFeeInclusiveVAT: values.costBreakdown?.propertyValuationFeeInclusiveVAT,
        },
        insurance: {
          lifeInsurance: values.insurance?.lifeInsurance,
          lifeInsuranceRequired: values.insurance?.lifeInsuranceRequired,
          lifeInsuranceCost: values.insurance?.lifeInsuranceCost,
          propertyInsurance: values.insurance?.propertyInsurance,
          propertyInsuranceRequired: values.insurance?.propertyInsuranceRequired,
          propertyInsuranceCost: values.insurance?.propertyInsuranceCost,
          mortgageProtection: values.insurance?.mortgageProtection,
        },
        eligibility: {
          minSalary: values.eligibility?.minSalary,
          maxSalary: values.eligibility?.maxSalary,
          minAge: values.eligibility?.minAge,
          maxAge: values.eligibility?.maxAge,
          minLoanAmount: values.eligibility?.minLoanAmount,
          maxLoanAmount: values.eligibility?.maxLoanAmount,
          minLTV: values.eligibility?.minLTV,
          maxLTV: values.eligibility?.maxLTV,
          eligibleNationalities: values.eligibility?.eligibleNationalities || [],
          eligibleEmploymentTypes: values.eligibility?.eligibleEmploymentTypes || [],
          eligibleResidencyStatus: values.eligibility?.eligibleResidencyStatus || [],
          minExperienceYears: values.eligibility?.minExperienceYears,
          minEmploymentYears: values.eligibility?.minEmploymentYears,
          visaRequired: values.eligibility?.visaRequired,
        },
        features: {
          keyFeatures: values.features?.keyFeatures || [],
          benefits: values.features?.benefits || [],
          termsAndConditions: values.features?.termsAndConditions || [],
          disclaimers: values.features?.disclaimers || [],
        },
        displayOrder: values.displayOrder,
        isPopular: values.isPopular,
        isFeatured: values.isFeatured,
        meta: {
          isActive: values.meta?.isActive ?? true,
          isDeleted: false,
        },
      };

      if (isEdit) {
        await apiService.put(`${MORTGAGE_PATH}/update-bank-product/${editData._id}`, payload);
        notification.success({ message: 'Bank Product Updated Successfully!' });
      } else {
        await apiService.post(`${MORTGAGE_PATH}/create-bank-products`, payload);
        notification.success({ message: 'Bank Product Created Successfully!' });
      }

      onSuccess && onSuccess();
    } catch (err) {
      console.error('Save error:', err);
      notification.error({
        message: err.response?.data?.message || 'Operation failed. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  // ─── Shared style helpers ────────────────────────────────────────────────────
  const sectionStyle = { borderColor: THEME.primary, marginTop: 8, marginBottom: 4 };
  const cardStyle = { borderRadius: 12, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', marginBottom: 16 };
  const col3 = { xs: 24, sm: 12, md: 8, lg: 8, xl: 8 };
  const col2 = { xs: 24, sm: 24, md: 12, lg: 12, xl: 12 };

  return (
    <div style={{ padding: 24, background: '#f5f3ff', minHeight: '100vh' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={onBack} type="text" />
        <div>
          <Title level={3} style={{ margin: 0, color: '#1e1b4b' }}>
            {isEdit ? 'Edit Bank Offer' : 'Add New Bank Offer'}
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {isEdit
              ? `Editing: ${editData?.bankInfo?.bankName} — ${editData?.offerSummary?.title}`
              : 'Fill in the details to create a new mortgage product'}
          </Text>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={{
          offerSummary: {
            currency: 'AED',
            productType: 'FIXED',
            productValidity: { doesNotExpire: true, expiryDate: null },
          },
          loanDetails: {
            interestType: 'CONVENTIONAL',
            salaryTransfer: 'Both',
            tenureYears: 25,
            minTenureYears: 5,
            maxTenureYears: 30,
            loanToValue: 80,
            minLoanToValue: 20,
            maxLoanToValue: 85,
            overpaymentAllowedPercent: 25,
            earlySettlementFreeAfterYears: 3,
            earlySettlementFee: '1% of outstanding amount',
            latePaymentFee: '2% per month',
            paymentHolidayAllowed: false,
            paymentHolidayDays: 0,
          },
          costBreakdown: {
            bankProcessingFeeType: 'Fixed',
            propertyValuationFeeInclusiveVAT: true,
            valuationFee: 2500,
            downPayment: 200000,
            totalUpfrontCost: 25000,
            isBankPreApprovalFeeFree: false,
            isBuyoutFeeNA: false,
          },
          insurance: {
            propertyInsuranceRequired: true,
            lifeInsuranceRequired: false,
            lifeInsuranceCost: 0,
            propertyInsuranceCost: 0,
          },
          eligibility: {
            eligibleResidencyStatus: ['All'],
            eligibleEmploymentTypes: ['Both'],
            eligibleNationalities: ['All'],
            minSalary: 15000,
            minAge: 21,
            maxAge: 70,
            minLTV: 20,
            maxLTV: 85,
            minExperienceYears: 1,
            minEmploymentYears: 1,
            visaRequired: true,
          },
          meta: { isActive: true },
          isPopular: false,
          isFeatured: false,
          displayOrder: 0,
        }}
        scrollToFirstError
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          style={{ marginBottom: 16 }}
          items={[
            { key: '1', label: <span><BankOutlined /> Bank &amp; Offer</span> },
            { key: '2', label: <span><FileTextOutlined /> Loan Details</span> },
            { key: '3', label: <span><DollarOutlined /> Cost Breakdown</span> },
            { key: '4', label: <span><SafetyCertificateOutlined /> Insurance</span> },
            { key: '5', label: <span><TeamOutlined /> Eligibility</span> },
            { key: '6', label: <span><FileSearchOutlined /> Features</span> },
          ]}
        />

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 1 — Bank Info + Offer Summary
        ═══════════════════════════════════════════════════════════════════ */}
        <div style={{ display: activeTab === '1' ? 'block' : 'none' }}>

          {/* Bank Information */}
          <Card bordered={false} style={cardStyle}>
            <Divider orientation="left" style={sectionStyle}>
              <Space><BankOutlined style={{ color: THEME.primary }} /><Text strong>Bank Information</Text></Space>
            </Divider>
            <Row gutter={[16, 8]}>
              <Col {...col3}>
                <Form.Item
                  name={['bankInfo', 'bankName']}
                  label="Bank Name"
                  rules={[{ required: true, message: 'Bank name is required' }]}
                >
                  <Input placeholder="e.g. Emirates NBD" size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item
                  name={['bankInfo', 'bankCode']}
                  label="Bank Code"
                  rules={[{ required: true, message: 'Bank code is required' }]}
                >
                  <Input placeholder="e.g. ENBD002" size="large" />
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
                  <Input placeholder="600 54 0000" size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['bankInfo', 'website']} label="Website">
                  <Input placeholder="https://www.emiratesnbd.com" size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['bankInfo', 'logo']} label="Logo URL">
                  <Input placeholder="https://cdn.example.com/logo.png" size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item label="Upload Logo">
                  <Upload
                    listType="picture-card"
                    fileList={logoList}
                    customRequest={handleCustomUpload}
                    maxCount={1}
                    beforeUpload={validateImageSize}
                    onChange={({ fileList }) => setLogoList(fileList)}
                  >
                    {logoList.length >= 1
                      ? null
                      : <div><PlusOutlined /><div style={{ marginTop: 4 }}>Upload</div></div>}
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Offer Summary */}
          <Card bordered={false} style={cardStyle}>
            <Divider orientation="left" style={sectionStyle}>
              <Space><StarOutlined style={{ color: THEME.primary }} /><Text strong>Offer Summary</Text></Space>
            </Divider>
            <Row gutter={[16, 8]}>
              <Col {...col2}>
                <Form.Item
                  name={['offerSummary', 'title']}
                  label="Offer Title"
                  rules={[{ required: true, message: 'Title is required' }]}
                >
                  <Input placeholder="e.g. HomeSmart Fixed Rate" size="large" />
                </Form.Item>
              </Col>
              <Col {...col2}>
                <Form.Item name={['offerSummary', 'shortDescription']} label="Short Description">
                  <Input placeholder="Brief offer description" size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item
                  name={['offerSummary', 'productType']}
                  label="Product Type"
                  rules={[{ required: true }]}
                >
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
                <Form.Item
                  name={['offerSummary', 'initialRate']}
                  label="Initial Rate (%)"
                  rules={[{ required: true, message: 'Initial rate is required' }]}
                >
                  <InputNumber style={{ width: '100%' }} step={0.01} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['offerSummary', 'comparisonRate']} label="Comparison Rate (%)">
                  <InputNumber style={{ width: '100%' }} step={0.01} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item
                  name={['offerSummary', 'monthlyEMI']}
                  label="Monthly EMI (AED)"
                  rules={[{ required: true, message: 'Monthly EMI is required' }]}
                >
                  <InputNumber style={{ width: '100%' }} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['offerSummary', 'currency']} label="Currency">
                  <Select size="large">
                    <Option value="AED">AED</Option>
                    <Option value="USD">USD</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item
                  name={['offerSummary', 'totalUpfrontCost']}
                  label="Total Upfront Cost (AED)"
                  rules={[{ required: true, message: 'Total upfront cost is required' }]}
                >
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
                  <Input placeholder="e.g. Best Rate" size="large" />
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

              {/* Product Validity */}
              <Col {...col3}>
                <Form.Item label="Product Validity">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Switch
                      checked={doesNotExpire}
                      onChange={setDoesNotExpire}
                      checkedChildren="Never Expires"
                      unCheckedChildren="Has Expiry"
                    />
                    {!doesNotExpire && (
                      <Form.Item
                        name={['offerSummary', 'productValidity', 'expiryDate']}
                        noStyle
                        rules={[{ required: true, message: 'Expiry date is required' }]}
                      >
                        <DatePicker style={{ width: '100%' }} size="large" />
                      </Form.Item>
                    )}
                  </Space>
                </Form.Item>
              </Col>
            </Row>

            {/* Flags row */}
            <Row gutter={[16, 8]}>
              <Col {...col3}>
                <Form.Item name="isPopular" label="Is Popular?" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name="isFeatured" label="Is Featured?" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name="displayOrder" label="Display Order">
                  <InputNumber style={{ width: '100%' }} min={0} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['meta', 'isActive']} label="Active?" valuePropName="checked">
                  <Switch defaultChecked />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 2 — Loan Details
        ═══════════════════════════════════════════════════════════════════ */}
        <div style={{ display: activeTab === '2' ? 'block' : 'none' }}>
          <Card bordered={false} style={cardStyle}>
            <Divider orientation="left" style={sectionStyle}>
              <Text strong>Loan Details</Text>
            </Divider>
            <Row gutter={[16, 8]}>
              <Col {...col3}>
                <Form.Item name={['loanDetails', 'tenureYears']} label="Tenure (Years)">
                  <InputNumber style={{ width: '100%' }} min={1} max={30} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['loanDetails', 'minTenureYears']} label="Min Tenure (Years)">
                  <InputNumber style={{ width: '100%' }} min={1} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['loanDetails', 'maxTenureYears']} label="Max Tenure (Years)">
                  <InputNumber style={{ width: '100%' }} min={1} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item
                  name={['loanDetails', 'loanToValue']}
                  label="LTV (%)"
                  rules={[{ required: true, message: 'LTV is required' }]}
                >
                  <InputNumber style={{ width: '100%' }} min={0} max={100} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['loanDetails', 'minLoanToValue']} label="Min LTV (%)">
                  <InputNumber style={{ width: '100%' }} min={0} max={100} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['loanDetails', 'maxLoanToValue']} label="Max LTV (%)">
                  <InputNumber style={{ width: '100%' }} min={0} max={100} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['loanDetails', 'interestType']} label="Interest Type">
                  <Select size="large">
                    <Option value="CONVENTIONAL">Conventional</Option>
                    <Option value="ISLAMIC">Islamic</Option>
                  </Select>
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
                    <Option value="Fixed">Fixed</Option>
                    <Option value="Variable">Variable</Option>
                    <Option value="EIBOR +">EIBOR +</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['loanDetails', 'followOnRate']} label="Follow-On Rate">
                  <Input placeholder="e.g. EIBOR + 1.75%" size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['loanDetails', 'overpaymentAllowedPercent']} label="Overpayment Allowed (%)">
                  <InputNumber style={{ width: '100%' }} min={0} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['loanDetails', 'earlySettlementFreeAfterYears']} label="Early Settlement Free After (Years)">
                  <InputNumber style={{ width: '100%' }} min={0} size="large" />
                </Form.Item>
              </Col>
              <Col {...col2}>
                <Form.Item name={['loanDetails', 'earlySettlementFee']} label="Early Settlement Fee">
                  <Input placeholder="e.g. 1% of outstanding amount" size="large" />
                </Form.Item>
              </Col>
              <Col {...col2}>
                <Form.Item name={['loanDetails', 'latePaymentFee']} label="Late Payment Fee">
                  <Input placeholder="e.g. 2% per month" size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['loanDetails', 'paymentHolidayAllowed']} label="Payment Holiday Allowed?" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['loanDetails', 'paymentHolidayDays']} label="Payment Holiday Days">
                  <InputNumber style={{ width: '100%' }} min={0} size="large" />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 3 — Cost Breakdown
        ═══════════════════════════════════════════════════════════════════ */}
        <div style={{ display: activeTab === '3' ? 'block' : 'none' }}>
          <Card bordered={false} style={cardStyle}>
            <Divider orientation="left" style={sectionStyle}>
              <Text strong>Cost Breakdown</Text>
            </Divider>
            <Row gutter={[16, 8]}>
              <Col {...col3}>
                <Form.Item name={['costBreakdown', 'propertyPrice']} label="Property Price (AED)">
                  <InputNumber style={{ width: '100%' }} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item
                  name={['costBreakdown', 'downPayment']}
                  label="Down Payment (AED)"
                  rules={[{ required: true, message: 'Down payment is required' }]}
                >
                  <InputNumber style={{ width: '100%' }} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['costBreakdown', 'downPaymentPercentage']} label="Down Payment (%)">
                  <InputNumber style={{ width: '100%' }} min={0} max={100} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['costBreakdown', 'dldFee']} label="DLD Fee (AED)">
                  <InputNumber style={{ width: '100%' }} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['costBreakdown', 'mortgageRegistrationFee']} label="Mortgage Registration Fee (AED)">
                  <InputNumber style={{ width: '100%' }} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['costBreakdown', 'trusteeFee']} label="Trustee Fee (AED)">
                  <InputNumber style={{ width: '100%' }} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['costBreakdown', 'bankProcessingFee']} label="Bank Processing Fee (AED)">
                  <InputNumber style={{ width: '100%' }} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['costBreakdown', 'bankProcessingFeeType']} label="Processing Fee Type">
                  <Select size="large">
                    <Option value="Fixed">Fixed</Option>
                    <Option value="Percentage">Percentage</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['costBreakdown', 'minimumBankProcessingFee']} label="Minimum Bank Processing Fee (AED)">
                  <InputNumber style={{ width: '100%' }} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['costBreakdown', 'valuationFee']} label="Valuation Fee (AED)">
                  <InputNumber style={{ width: '100%' }} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['costBreakdown', 'propertyValuationFeeInclusiveVAT']} label="Valuation Fee Incl. VAT?" valuePropName="checked">
                  <Switch defaultChecked />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['costBreakdown', 'propertyInsuranceFee']} label="Property Insurance Fee (AED)">
                  <InputNumber style={{ width: '100%' }} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['costBreakdown', 'lifeInsuranceFee']} label="Life Insurance Fee (AED)">
                  <InputNumber style={{ width: '100%' }} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['costBreakdown', 'agencyFee']} label="Agency Fee (AED)">
                  <InputNumber style={{ width: '100%' }} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['costBreakdown', 'conveyanceFee']} label="Conveyance Fee (AED)">
                  <InputNumber style={{ width: '100%' }} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['costBreakdown', 'feesAddedToLoan']} label="Fees Added to Loan (AED)">
                  <InputNumber style={{ width: '100%' }} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item
                  name={['costBreakdown', 'totalUpfrontCost']}
                  label="Total Upfront Cost (AED)"
                  rules={[{ required: true, message: 'Total upfront cost is required' }]}
                >
                  <InputNumber style={{ width: '100%' }} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['costBreakdown', 'payableByBuyer']} label="Payable By Buyer (AED)">
                  <InputNumber style={{ width: '100%' }} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['costBreakdown', 'payableBySeller']} label="Payable By Seller (AED)">
                  <InputNumber style={{ width: '100%' }} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['costBreakdown', 'bankPreApprovalFee']} label="Bank Pre-Approval Fee (AED)">
                  <InputNumber style={{ width: '100%' }} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['costBreakdown', 'isBankPreApprovalFeeFree']} label="Pre-Approval Fee Free?" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['costBreakdown', 'buyoutFee']} label="Buyout Fee (AED)">
                  <InputNumber style={{ width: '100%' }} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['costBreakdown', 'isBuyoutFeeNA']} label="Buyout Fee N/A?" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 4 — Insurance
        ═══════════════════════════════════════════════════════════════════ */}
        <div style={{ display: activeTab === '4' ? 'block' : 'none' }}>
          <Card bordered={false} style={cardStyle}>
            <Divider orientation="left" style={sectionStyle}>
              <Text strong>Insurance</Text>
            </Divider>
            <Row gutter={[16, 8]}>
              <Col {...col3}>
                <Form.Item name={['insurance', 'lifeInsurance']} label="Life Insurance">
                  <Input placeholder="e.g. Required - Decreasing Term" size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['insurance', 'lifeInsuranceRequired']} label="Life Insurance Required?" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['insurance', 'lifeInsuranceCost']} label="Life Insurance Cost (AED)">
                  <InputNumber style={{ width: '100%' }} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['insurance', 'propertyInsurance']} label="Property Insurance">
                  <Input placeholder="e.g. Required - Building Insurance" size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['insurance', 'propertyInsuranceRequired']} label="Property Insurance Required?" valuePropName="checked">
                  <Switch defaultChecked />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['insurance', 'propertyInsuranceCost']} label="Property Insurance Cost (AED)">
                  <InputNumber style={{ width: '100%' }} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['insurance', 'mortgageProtection']} label="Mortgage Protection">
                  <Input placeholder="e.g. Optional" size="large" />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 5 — Eligibility
        ═══════════════════════════════════════════════════════════════════ */}
        <div style={{ display: activeTab === '5' ? 'block' : 'none' }}>
          <Card bordered={false} style={cardStyle}>
            <Divider orientation="left" style={sectionStyle}>
              <Text strong>Eligibility Criteria</Text>
            </Divider>
            <Row gutter={[16, 8]}>
              <Col {...col3}>
                <Form.Item name={['eligibility', 'minSalary']} label="Min Salary (AED)">
                  <InputNumber style={{ width: '100%' }} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['eligibility', 'maxSalary']} label="Max Salary (AED)">
                  <InputNumber style={{ width: '100%' }} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['eligibility', 'minAge']} label="Min Age">
                  <InputNumber style={{ width: '100%' }} min={0} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['eligibility', 'maxAge']} label="Max Age">
                  <InputNumber style={{ width: '100%' }} min={0} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['eligibility', 'minLoanAmount']} label="Min Loan Amount (AED)">
                  <InputNumber style={{ width: '100%' }} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['eligibility', 'maxLoanAmount']} label="Max Loan Amount (AED)">
                  <InputNumber style={{ width: '100%' }} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['eligibility', 'minLTV']} label="Min LTV (%)">
                  <InputNumber style={{ width: '100%' }} min={0} max={100} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['eligibility', 'maxLTV']} label="Max LTV (%)">
                  <InputNumber style={{ width: '100%' }} min={0} max={100} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['eligibility', 'minExperienceYears']} label="Min Experience (Years)">
                  <InputNumber style={{ width: '100%' }} min={0} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['eligibility', 'minEmploymentYears']} label="Min Employment (Years)">
                  <InputNumber style={{ width: '100%' }} min={0} size="large" />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['eligibility', 'visaRequired']} label="Visa Required?" valuePropName="checked">
                  <Switch defaultChecked />
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['eligibility', 'eligibleNationalities']} label="Eligible Nationalities">
                  <Select mode="tags" placeholder="Add nationalities" size="large">
                    <Option value="All">All</Option>
                    <Option value="UAE">UAE</Option>
                    <Option value="GCC">GCC</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['eligibility', 'eligibleEmploymentTypes']} label="Employment Types">
                  <Select mode="tags" placeholder="Select employment types" size="large">
                    <Option value="Salaried">Salaried</Option>
                    <Option value="Self-Employed">Self-Employed</Option>
                    <Option value="Both">Both</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col {...col3}>
                <Form.Item name={['eligibility', 'eligibleResidencyStatus']} label="Residency Status">
                  <Select mode="tags" placeholder="Select residency status" size="large">
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

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 6 — Features & Benefits
        ═══════════════════════════════════════════════════════════════════ */}
        <div style={{ display: activeTab === '6' ? 'block' : 'none' }}>
          <Card bordered={false} style={cardStyle}>
            <Divider orientation="left" style={sectionStyle}>
              <Text strong>Features &amp; Benefits</Text>
            </Divider>
            <Row gutter={[16, 8]}>
              <Col {...col2}>
                <Form.Item name={['features', 'keyFeatures']} label="Key Features">
                  <Select
                    mode="tags"
                    placeholder="Type a feature and press Enter"
                    size="large"
                  >
                    <Option value="Free property valuation">Free property valuation</Option>
                    <Option value="No early settlement fee after 3 years">No early settlement fee after 3 years</Option>
                    <Option value="Free credit life insurance for 1 year">Free credit life insurance for 1 year</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col {...col2}>
                <Form.Item name={['features', 'benefits']} label="Benefits">
                  <Select
                    mode="tags"
                    placeholder="Type a benefit and press Enter"
                    size="large"
                  >
                    <Option value="Priority banking services">Priority banking services</Option>
                    <Option value="Free international lounges">Free international lounges</Option>
                    <Option value="Quick approval process">Quick approval process</Option>
                    <Option value="Dedicated home finance advisor">Dedicated home finance advisor</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col {...col2}>
                <Form.Item name={['features', 'termsAndConditions']} label="Terms &amp; Conditions">
                  <Select
                    mode="tags"
                    placeholder="Type a term and press Enter"
                    size="large"
                  >
                    <Option value="Terms apply">Terms apply</Option>
                    <Option value="Subject to bank approval">Subject to bank approval</Option>
                    <Option value="Valid for Dubai and Northern Emirates">Valid for Dubai and Northern Emirates</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col {...col2}>
                <Form.Item name={['features', 'disclaimers']} label="Disclaimers">
                  <Select
                    mode="tags"
                    placeholder="Type a disclaimer and press Enter"
                    size="large"
                  >
                    <Option value="Rates subject to change">Rates subject to change</Option>
                    <Option value="Fees may apply">Fees may apply</Option>
                    <Option value="Terms and conditions available on request">Terms and conditions available on request</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────────── */}
        <Card bordered={false} style={{ borderRadius: 12, marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button onClick={onBack} size="large" icon={<ArrowLeftOutlined />}>
              Back to List
            </Button>
            <Space>
              <Button onClick={() => form.resetFields()} size="large" disabled={loading}>
                Reset
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                icon={<SaveOutlined />}
                style={{ background: THEME.primary, borderColor: THEME.primary, minWidth: 160 }}
              >
                {isEdit ? 'Update Product' : 'Save Product'}
              </Button>
            </Space>
          </div>
        </Card>
      </Form>
    </div>
  );
};

export default BankProductForm;