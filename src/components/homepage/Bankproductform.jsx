import React, { useState, useEffect } from 'react';
import { apiService } from '../../manageApi/utils/custom.apiservice';
import {
  Button, Form, Input, InputNumber, Select, Row, Col, Divider,
  Typography, Card, Space, Switch, Upload, notification, message,
  Tabs, Alert
} from 'antd';
import {
  PlusOutlined, ArrowLeftOutlined, SaveOutlined,
  BankOutlined, FileTextOutlined, DollarOutlined,
  SafetyCertificateOutlined, TeamOutlined, FileSearchOutlined,
  StarOutlined, ThunderboltOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const THEME   = { primary: "#7c3aed", success: "#10b981", warning: "#f59e0b" };
const MORTGAGE_PATH = "bank/products";

/*
 * Props:
 *   mode: 'create' | 'edit' | 'bulk'
 *   editData: object (for edit mode)
 *   onBack: function
 *   onSuccess: function
 */
const BankProductForm = ({ mode = 'create', editData = null, onBack, onSuccess }) => {
  const [form]       = Form.useForm();
  const [loading, setLoading]   = useState(false);
  const [logoList, setLogoList] = useState([]);
  const [activeTab, setActiveTab] = useState('1');

  // Bulk mode
  const [bulkJson, setBulkJson]   = useState('');
  const [bulkError, setBulkError] = useState('');

  const isEdit = mode === 'edit' && editData;
  const isBulk = mode === 'bulk';

  // Pre-fill form in edit mode
  useEffect(() => {
    if (isEdit && editData) {
      form.setFieldsValue(editData);
      if (editData.bankInfo?.logo) {
        setLogoList([{
          uid: '-1',
          url: editData.bankInfo.logo,
          status: 'done',
          name: 'Bank Logo',
        }]);
      }
    }
  }, [editData, isEdit, form]);

  // ── Logo upload helpers ──────────────────────────────────────────────────
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

  // ── Resolve logo URL from fileList ───────────────────────────────────────
  const resolvedLogo = (values) => {
    if (logoList.length > 0) {
      return (
        logoList[0].url ||
        logoList[0].response?.file?.url ||
        logoList[0].response?.url ||
        logoList[0].response
      );
    }
    return values.bankInfo?.logo || '';
  };

  // ── Create / Update ──────────────────────────────────────────────────────
const handleSave = async (values) => {
  if (loading) return;
  setLoading(true);
  try {
    const payload = {
      ...values,
      bankInfo: { ...values.bankInfo, logo: resolvedLogo(values) },
    };

    if (isEdit) {
      // 1️⃣ Full product update
      await apiService.put(
        `${MORTGAGE_PATH}/update-bank-product/${editData._id}`,
        payload
      );

      // 2️⃣ Rate update — body mein sirf newRate jaata hai
      notification.success({ message: 'Bank Product Updated Successfully!' });
    } else {
      // 3️⃣ Create new product
      await apiService.post(`${MORTGAGE_PATH}/create-bank-products`, payload);
      notification.success({ message: 'Bank Product Created Successfully!' });
    }

    onSuccess && onSuccess();
  } catch (err) {
    console.error('Save error:', err);
    notification.error({ message: 'Operation failed. Please try again.' });
  } finally {
    setLoading(false);
  }
};

  // ── Bulk import ──────────────────────────────────────────────────────────
  const handleBulkSubmit = async () => {
    setBulkError('');
    let parsed;
    try {
      parsed = JSON.parse(bulkJson);
      if (!Array.isArray(parsed)) throw new Error('Must be a JSON array');
    } catch (e) {
      setBulkError('Invalid JSON: ' + e.message);
      return;
    }
    setLoading(true);
    try {
      await apiService.post(`${MORTGAGE_PATH}/create-bulk`, parsed);
      notification.success({ message: `${parsed.length} products imported successfully!` });
      onSuccess && onSuccess();
    } catch (err) {
      console.error('Bulk import error:', err);
      notification.error({ message: 'Bulk import failed. Please check your JSON.' });
    } finally {
      setLoading(false);
    }
  };

  const sectionStyle = { borderColor: THEME.primary, marginTop: 8, marginBottom: 4 };
  const cardStyle    = { borderRadius: 12, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', marginBottom: 16 };

  // ── Bulk UI ──────────────────────────────────────────────────────────────
  if (isBulk) {
    return (
      <div style={{ padding: 24, background: '#f5f3ff', minHeight: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={onBack} type="text" />
          <div>
            <Title level={3} style={{ margin: 0, color: '#1e1b4b' }}>Bulk Import Products</Title>
            <Text type="secondary">Paste a JSON array to create multiple products at once</Text>
          </div>
        </div>

        <Card bordered={false} style={cardStyle}>
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            message="Paste a JSON array of bank product objects."
            description={
              <Text type="secondary" style={{ fontSize: 12 }}>
                Required fields per item: bankInfo.bankName, offerSummary.title, offerSummary.productType
              </Text>
            }
          />
          <TextArea
            rows={20}
            placeholder='[{"bankInfo": {"bankName": "ADCB", ...}, "offerSummary": {...}}, ...]'
            value={bulkJson}
            onChange={(e) => { setBulkJson(e.target.value); setBulkError(''); }}
            style={{
              fontFamily: 'monospace', fontSize: 12,
              background: '#0f0f1a', color: '#a5f3fc',
              border: '1px solid #374151', borderRadius: 8,
            }}
          />
          {bulkError && <Alert type="error" message={bulkError} style={{ marginTop: 8 }} showIcon />}
        </Card>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <Button onClick={onBack} size="large">Cancel</Button>
          <Button
            type="primary" size="large"
            icon={<ThunderboltOutlined />}
            loading={loading}
            onClick={handleBulkSubmit}
            style={{ background: THEME.primary, borderColor: THEME.primary }}
          >
            Import Products
          </Button>
        </div>
      </div>
    );
  }

  // ── Create / Edit UI ─────────────────────────────────────────────────────
  return (
    <div style={{ padding: 24, background: '#f5f3ff', minHeight: '100vh' }}>

      {/* Header */}
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
    offerSummary: { currency: 'AED', productType: 'FIXED' },
    loanDetails:  { interestType: 'CONVENTIONAL' },
    meta:         { isActive: true, isDeleted: false },
  }}
  scrollToFirstError
  onFinishFailed={({ errorFields }) => {
    // Automatically us tab pe chale jao jahan error hai
    const firstErrorField = errorFields[0]?.name;
    if (firstErrorField) {
      const fieldName = firstErrorField[0];
      if (fieldName === 'loanDetails') setActiveTab('2');
      else if (fieldName === 'costBreakdown') setActiveTab('3');
      else setActiveTab('1');
    }
  }}
>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          style={{ marginBottom: 16 }}
          items={[
            { key: '1', label: <span><BankOutlined /> Bank & Offer</span> },
            { key: '2', label: <span><FileTextOutlined /> Loan Details</span> },
            { key: '3', label: <span><DollarOutlined /> Cost Breakdown</span> },
            { key: '4', label: <span><SafetyCertificateOutlined /> Insurance</span> },
            { key: '5', label: <span><TeamOutlined /> Eligibility</span> },
            { key: '6', label: <span><FileSearchOutlined /> Docs & Features</span> },
          ]}
        />

        {/* ── TAB 1: Bank Info + Offer Summary ── */}
        <div style={{ display: activeTab === '1' ? 'block' : 'none' }}>
          <Card bordered={false} style={cardStyle}>
            <Divider orientation="left" style={sectionStyle}>
              <Space><BankOutlined style={{ color: THEME.primary }} /><Text strong>Bank Information</Text></Space>
            </Divider>
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item name={['bankInfo', 'bankName']} label="Bank Name" rules={[{ required: true, message: 'Required' }]}>
                  <Input placeholder="e.g. Emirates NBD" />
                </Form.Item>
              </Col>
              <Col xs={12} md={4}>
                <Form.Item name={['bankInfo', 'bankCode']} label="Bank Code">
                  <Input placeholder="e.g. ENBD" />
                </Form.Item>
              </Col>
              <Col xs={12} md={4}>
                <Form.Item name={['bankInfo', 'rating']} label="Rating">
                  <InputNumber style={{ width: '100%' }} min={0} max={5} step={0.1} />
                </Form.Item>
              </Col>
              <Col xs={12} md={4}>
                <Form.Item name={['bankInfo', 'reviewCount']} label="Review Count">
                  <InputNumber style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={12} md={4}>
                <Form.Item name={['bankInfo', 'customerCare']} label="Customer Care">
                  <Input placeholder="600 540000" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item name={['bankInfo', 'website']} label="Website">
                  <Input placeholder="www.emiratesnbd.com" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name={['bankInfo', 'logo']} label="Logo URL">
                  <Input placeholder="https://storage.example.com/logo.png" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Upload Logo">
                  <Upload
                    listType="picture-card"
                    fileList={logoList}
                    customRequest={handleCustomUpload}
                    maxCount={1}
                    beforeUpload={validateImageSize}
                    onChange={({ fileList }) => setLogoList(fileList)}
                  >
                    {logoList.length >= 1 ? null : <div><PlusOutlined /><div style={{ marginTop: 4 }}>Upload</div></div>}
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card bordered={false} style={cardStyle}>
            <Divider orientation="left" style={sectionStyle}>
              <Space><StarOutlined style={{ color: THEME.primary }} /><Text strong>Offer Summary</Text></Space>
            </Divider>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name={['offerSummary', 'title']} label="Offer Title" rules={[{ required: true, message: 'Required' }]}>
                  <Input placeholder="e.g. Home Smart Fixed Rate" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name={['offerSummary', 'shortDescription']} label="Short Description">
                  <Input placeholder="Brief offer description" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={12} md={4}>
                <Form.Item name={['offerSummary', 'productType']} label="Product Type" rules={[{ required: true }]}>
                  <Select>
                    <Option value="FIXED">Fixed</Option>
                    <Option value="VARIABLE">Variable</Option>
                    <Option value="ISLAMIC">Islamic</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={12} md={4}>
                <Form.Item name={['offerSummary', 'fixedYears']} label="Fixed Years">
                  <InputNumber style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={12} md={4}>
                <Form.Item name={['offerSummary', 'initialRate']} label="Initial Rate (%)">
                  <InputNumber style={{ width: '100%' }} step={0.01} />
                </Form.Item>
              </Col>
              <Col xs={12} md={4}>
                <Form.Item name={['offerSummary', 'comparisonRate']} label="Comparison Rate (%)">
                  <InputNumber style={{ width: '100%' }} step={0.01} />
                </Form.Item>
              </Col>
              <Col xs={12} md={4}>
                <Form.Item name={['offerSummary', 'currency']} label="Currency">
                  <Input placeholder="AED" />
                </Form.Item>
              </Col>
              <Col xs={12} md={4}>
                <Form.Item name={['offerSummary', 'monthlyEMI']} label="Monthly EMI">
                  <InputNumber style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={12} md={6}><Form.Item name={['offerSummary', 'totalUpfrontCost']} label="Total Upfront Cost"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
              <Col xs={12} md={6}><Form.Item name={['offerSummary', 'maxLoanAmount']} label="Max Loan Amount"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
              <Col xs={12} md={6}><Form.Item name={['offerSummary', 'popularityTag']} label="Popularity Tag"><Input placeholder="e.g. Most Popular" /></Form.Item></Col>
              <Col xs={12} md={6}><Form.Item name={['offerSummary', 'badge']} label="Badge"><Input placeholder="e.g. Popular" /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
              <Col xs={12} md={6}><Form.Item name="isPopular" label="Is Popular?" valuePropName="checked"><Switch /></Form.Item></Col>
              <Col xs={12} md={6}><Form.Item name="isFeatured" label="Is Featured?" valuePropName="checked"><Switch /></Form.Item></Col>
              <Col xs={12} md={6}><Form.Item name="displayOrder" label="Display Order"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
              <Col xs={12} md={6}><Form.Item name={['meta', 'isActive']} label="Active?" valuePropName="checked"><Switch defaultChecked /></Form.Item></Col>
            </Row>
          </Card>
        </div>

        {/* ── TAB 2: Loan Details ── */}
        <div style={{ display: activeTab === '2' ? 'block' : 'none' }}>
          <Card bordered={false} style={cardStyle}>
            <Divider orientation="left" style={sectionStyle}><Text strong>Loan Details</Text></Divider>
            <Row gutter={16}>
              <Col xs={12} md={4}><Form.Item name={['loanDetails', 'tenureYears']} label="Tenure (Years)"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
              <Col xs={12} md={4}><Form.Item name={['loanDetails', 'minTenureYears']} label="Min Tenure (Yrs)"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
              <Col xs={12} md={4}><Form.Item name={['loanDetails', 'maxTenureYears']} label="Max Tenure (Yrs)"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
             <Col xs={12} md={4}>
  <Form.Item 
    name={['loanDetails', 'loanToValue']} 
    label="LTV (%)" 
    rules={[{ required: true, message: 'LTV is required' }]}
  >
    <InputNumber style={{ width: '100%' }} />
  </Form.Item>
</Col>
              <Col xs={12} md={4}><Form.Item name={['loanDetails', 'minLoanToValue']} label="Min LTV (%)"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
              <Col xs={12} md={4}><Form.Item name={['loanDetails', 'maxLoanToValue']} label="Max LTV (%)"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} md={6}><Form.Item name={['loanDetails', 'interestType']} label="Interest Type"><Select><Option value="CONVENTIONAL">Conventional</Option><Option value="ISLAMIC">Islamic</Option></Select></Form.Item></Col>
              <Col xs={24} md={6}><Form.Item name={['loanDetails', 'followOnRate']} label="Follow On Rate"><Input placeholder="e.g. 1.5% + 3M EIBOR" /></Form.Item></Col>
              <Col xs={24} md={6}><Form.Item name={['loanDetails', 'followOnRateType']} label="Follow On Rate Type"><Input placeholder="e.g. EIBOR +" /></Form.Item></Col>
              <Col xs={12} md={3}><Form.Item name={['loanDetails', 'overpaymentAllowedPercent']} label="Overpayment (%)"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
              <Col xs={12} md={3}><Form.Item name={['loanDetails', 'earlySettlementFreeAfterYears']} label="Free After (Yrs)"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} md={8}><Form.Item name={['loanDetails', 'earlySettlementFee']} label="Early Settlement Fee"><Input placeholder="e.g. 1% of outstanding" /></Form.Item></Col>
              <Col xs={24} md={8}><Form.Item name={['loanDetails', 'latePaymentFee']} label="Late Payment Fee"><Input placeholder="e.g. 2% per month" /></Form.Item></Col>
              <Col xs={12} md={4}><Form.Item name={['loanDetails', 'paymentHolidayAllowed']} label="Payment Holiday?" valuePropName="checked"><Switch /></Form.Item></Col>
              <Col xs={12} md={4}><Form.Item name={['loanDetails', 'paymentHolidayDays']} label="Holiday Days"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            </Row>
          </Card>
        </div>

        {/* ── TAB 3: Cost Breakdown ── */}
        <div style={{ display: activeTab === '3' ? 'block' : 'none' }}>
          <Card bordered={false} style={cardStyle}>
            <Divider orientation="left" style={sectionStyle}><Text strong>Cost Breakdown</Text></Divider>
            <Row gutter={16}>
              <Col xs={12} md={6}><Form.Item name={['costBreakdown', 'propertyPrice']} label="Property Price"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
             <Col xs={12} md={6}>
  <Form.Item 
    name={['costBreakdown', 'downPayment']} 
    label="Down Payment"
    rules={[{ required: true, message: 'Down Payment is required' }]}
  >
    <InputNumber style={{ width: '100%' }} />
  </Form.Item>
</Col>
              <Col xs={12} md={6}><Form.Item name={['costBreakdown', 'downPaymentPercentage']} label="Down Payment (%)"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
              <Col xs={12} md={6}><Form.Item name={['costBreakdown', 'dldFee']} label="DLD Fee"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
              <Col xs={12} md={6}><Form.Item name={['costBreakdown', 'mortgageRegistrationFee']} label="Mortgage Reg. Fee"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
              <Col xs={12} md={6}><Form.Item name={['costBreakdown', 'trusteeFee']} label="Trustee Fee"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
              <Col xs={12} md={6}><Form.Item name={['costBreakdown', 'bankProcessingFee']} label="Bank Processing Fee"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
              <Col xs={12} md={6}><Form.Item name={['costBreakdown', 'bankProcessingFeeType']} label="Processing Fee Type"><Input placeholder="Fixed / Percentage" /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
              <Col xs={12} md={6}><Form.Item name={['costBreakdown', 'valuationFee']} label="Valuation Fee"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
              <Col xs={12} md={6}><Form.Item name={['costBreakdown', 'propertyInsuranceFee']} label="Property Insurance Fee"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
              <Col xs={12} md={6}><Form.Item name={['costBreakdown', 'lifeInsuranceFee']} label="Life Insurance Fee"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
              <Col xs={12} md={6}><Form.Item name={['costBreakdown', 'agencyFee']} label="Agency Fee"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
              <Col xs={12} md={6}><Form.Item name={['costBreakdown', 'conveyanceFee']} label="Conveyance Fee"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
              <Col xs={12} md={6}><Form.Item name={['costBreakdown', 'feesAddedToLoan']} label="Fees Added to Loan"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
              <Col xs={12} md={6}>
  <Form.Item 
    name={['costBreakdown', 'totalUpfrontCost']} 
    label="Total Upfront Cost"
    rules={[{ required: true, message: 'Total Upfront Cost is required' }]}
  >
    <InputNumber style={{ width: '100%' }} />
  </Form.Item>
</Col>
              <Col xs={12} md={6}><Form.Item name={['costBreakdown', 'payableByBuyer']} label="Payable By Buyer"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            </Row>
          </Card>
        </div>

        {/* ── TAB 4: Insurance ── */}
        <div style={{ display: activeTab === '4' ? 'block' : 'none' }}>
          <Card bordered={false} style={cardStyle}>
            <Divider orientation="left" style={sectionStyle}><Text strong>Insurance</Text></Divider>
            <Row gutter={16}>
              <Col xs={12} md={6}><Form.Item name={['insurance', 'lifeInsurance']} label="Life Insurance"><Input placeholder="Optional / Required" /></Form.Item></Col>
              <Col xs={12} md={6}><Form.Item name={['insurance', 'lifeInsuranceRequired']} label="Life Insurance Required?" valuePropName="checked"><Switch /></Form.Item></Col>
              <Col xs={12} md={6}><Form.Item name={['insurance', 'lifeInsuranceCost']} label="Life Insurance Cost"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
              <Col xs={12} md={6}><Form.Item name={['insurance', 'propertyInsurance']} label="Property Insurance"><Input placeholder="Optional / Required" /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
              <Col xs={12} md={6}><Form.Item name={['insurance', 'propertyInsuranceRequired']} label="Property Insurance Required?" valuePropName="checked"><Switch /></Form.Item></Col>
              <Col xs={12} md={6}><Form.Item name={['insurance', 'propertyInsuranceCost']} label="Property Insurance Cost"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
              <Col xs={12} md={6}><Form.Item name={['insurance', 'mortgageProtection']} label="Mortgage Protection"><Input placeholder="Available / Not Available" /></Form.Item></Col>
            </Row>
          </Card>
        </div>

        {/* ── TAB 5: Eligibility ── */}
        <div style={{ display: activeTab === '5' ? 'block' : 'none' }}>
          <Card bordered={false} style={cardStyle}>
            <Divider orientation="left" style={sectionStyle}><Text strong>Eligibility Criteria</Text></Divider>
            <Row gutter={16}>
              <Col xs={12} md={4}><Form.Item name={['eligibility', 'minSalary']} label="Min Salary (AED)"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
              <Col xs={12} md={4}><Form.Item name={['eligibility', 'maxSalary']} label="Max Salary (AED)"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
              <Col xs={12} md={4}><Form.Item name={['eligibility', 'minAge']} label="Min Age"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
              <Col xs={12} md={4}><Form.Item name={['eligibility', 'maxAge']} label="Max Age"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
              <Col xs={12} md={4}><Form.Item name={['eligibility', 'minLTV']} label="Min LTV (%)"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
              <Col xs={12} md={4}><Form.Item name={['eligibility', 'maxLTV']} label="Max LTV (%)"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
              <Col xs={12} md={4}><Form.Item name={['eligibility', 'minLoanAmount']} label="Min Loan Amount"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
              <Col xs={12} md={4}><Form.Item name={['eligibility', 'maxLoanAmount']} label="Max Loan Amount"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
              <Col xs={12} md={4}><Form.Item name={['eligibility', 'minExperienceYears']} label="Min Experience (Yrs)"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
              <Col xs={12} md={4}><Form.Item name={['eligibility', 'minEmploymentYears']} label="Min Employment (Yrs)"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
              <Col xs={12} md={4}><Form.Item name={['eligibility', 'visaRequired']} label="Visa Required?" valuePropName="checked"><Switch /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name={['eligibility', 'eligibleNationalities']} label="Eligible Nationalities">
                  <Select mode="tags" placeholder="e.g. UAE, GCC, All">
                    <Option value="UAE">UAE</Option>
                    <Option value="GCC">GCC</Option>
                    <Option value="All">All</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name={['eligibility', 'eligibleEmploymentTypes']} label="Employment Types">
                  <Select mode="tags" placeholder="e.g. Salaried, Self-Employed">
                    <Option value="Salaried">Salaried</Option>
                    <Option value="Self-Employed">Self-Employed</Option>
                    <Option value="Both">Both</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </div>

        {/* ── TAB 6: Docs & Features ── */}
        <div style={{ display: activeTab === '6' ? 'block' : 'none' }}>
          <Card bordered={false} style={cardStyle}>
            <Divider orientation="left" style={sectionStyle}><Text strong>Documentation</Text></Divider>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name={['documentation', 'requiredDocs']} label="Required Documents">
                  <Select mode="tags" placeholder="Add document name and press Enter">
                    <Option value="Emirates ID">Emirates ID</Option>
                    <Option value="Passport Copy">Passport Copy</Option>
                    <Option value="Visa Copy">Visa Copy</Option>
                    <Option value="Salary Certificate">Salary Certificate</Option>
                    <Option value="Bank Statements (6 months)">Bank Statements (6 months)</Option>
                    <Option value="Property Sale Agreement">Property Sale Agreement</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={12} md={6}><Form.Item name={['documentation', 'processingTime']} label="Processing Time"><Input placeholder="e.g. 5-7 working days" /></Form.Item></Col>
              <Col xs={12} md={6}><Form.Item name={['documentation', 'approvalValidity']} label="Approval Validity"><Input placeholder="e.g. 60 days" /></Form.Item></Col>
            </Row>
          </Card>
          <Card bordered={false} style={cardStyle}>
            <Divider orientation="left" style={sectionStyle}><Text strong>Features & Benefits</Text></Divider>
            <Row gutter={16}>
              <Col xs={24} md={12}><Form.Item name={['features', 'keyFeatures']} label="Key Features"><Select mode="tags" placeholder="Add feature and press Enter" /></Form.Item></Col>
              <Col xs={24} md={12}><Form.Item name={['features', 'benefits']} label="Benefits"><Select mode="tags" placeholder="Add benefit and press Enter" /></Form.Item></Col>
              <Col xs={24} md={12}><Form.Item name={['features', 'termsAndConditions']} label="Terms & Conditions"><Select mode="tags" placeholder="Add T&C and press Enter" /></Form.Item></Col>
              <Col xs={24} md={12}><Form.Item name={['features', 'disclaimers']} label="Disclaimers"><Select mode="tags" placeholder="Add disclaimer and press Enter" /></Form.Item></Col>
            </Row>
          </Card>
        </div>

        {/* Footer */}
        <Card bordered={false} style={{ borderRadius: 12, marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button onClick={onBack} size="large" icon={<ArrowLeftOutlined />}>Back to List</Button>
            <Space>
              <Button onClick={() => form.resetFields()} size="large" disabled={loading}>Reset</Button>
              <Button
                type="primary" htmlType="submit"
                loading={loading} size="large"
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
