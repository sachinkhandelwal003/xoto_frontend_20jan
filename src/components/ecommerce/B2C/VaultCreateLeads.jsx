import React, { useState } from 'react';
import { apiService } from '../../../manageApi/utils/custom.apiservice';
import {
  Form, Input, Select, Button, Card, Row, Col, Typography,
  DatePicker, InputNumber, Switch, message, Divider, Space, Modal, Descriptions, Alert
} from 'antd';
import {
  UserOutlined, HomeOutlined, FileTextOutlined, BankOutlined,
  SaveOutlined, CheckOutlined, EyeOutlined, TeamOutlined
} from '@ant-design/icons';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const { Title, Text } = Typography;
const { Option }      = Select;
const { TextArea }    = Input;

const BRAND_PURPLE = '#5C039B';

/* ─────────────────────────────── CONSTANTS ─────────────────────────────── */

const NATIONALITIES = [
  'Emirati', 'Saudi Arabian', 'Indian', 'Pakistani', 'British', 'American',
  'Egyptian', 'Filipino', 'Jordanian', 'Lebanese', 'Syrian', 'Bangladeshi',
  'Sri Lankan', 'Nepalese', 'Indonesian', 'Chinese', 'Canadian', 'Australian',
  'French', 'German', 'Italian', 'Russian', 'South African', 'Nigerian', 'Other',
];

const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
];

const UAE_AREAS = {
  Dubai: [
    'Downtown Dubai', 'Dubai Marina', 'Palm Jumeirah', 'JBR', 'Business Bay',
    'DIFC', 'Jumeirah', 'Al Barsha', 'Deira', 'Bur Dubai', 'Discovery Gardens',
    'Dubai Hills Estate', 'Arabian Ranches', 'Emirates Hills', 'Mirdif',
    'International City', 'Silicon Oasis', 'JVC', 'JLT', 'Sports City',
  ],
  'Abu Dhabi': [
    'Al Reem Island', 'Saadiyat Island', 'Yas Island', 'Al Khalidiyah',
    'Corniche', 'Khalifa City', 'Mohammed Bin Zayed City', 'Al Raha Beach',
    'Masdar City', 'Al Mushrif',
  ],
  Sharjah:             ['Al Nahda', 'Al Qasimia', 'Al Majaz', 'University City'],
  Ajman:               ['Ajman City', 'Al Rashidiya', 'Mushairef'],
  'Ras Al Khaimah':    ['Al Hamra', 'Mina Al Arab', 'Al Nakheel'],
  Fujairah:            ['Fujairah City'],
  'Umm Al Quwain':     ['UAQ City'],
};

/* ─────────────────────────────── MAIN COMPONENT ─────────────────────────────── */

const VaultCreateLeads = () => {
  const [form]           = Form.useForm();
  const [loading, setLoading]        = useState(false);
  const [selectedCity, setSelectedCity]     = useState('Dubai');
  const [isOffPlan, setIsOffPlan]           = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [formValues, setFormValues] = useState(null);

  const buildPayload = (values) => {
    return {
      customerInfo: {
        fullName:           values.fullName,
        preferredName:      values.preferredName    || null,
        gender:             values.gender,
        email:              values.email,
        mobileNumber:       values.mobileNumber     || null,
        alternativePhone:   values.alternativePhone || null,
        whatsappNumber:     values.whatsappNumber   || null,
        dateOfBirth:        values.dateOfBirth      ? values.dateOfBirth.toISOString() : null,
        nationality:        values.nationality,
        maritalStatus:      values.maritalStatus,
        occupation:         values.occupation          || null,
        employer:           values.employer            || null,
        monthlySalary:      values.monthlySalary        || null,
      },
      propertyDetails: {
        propertyType:    values.propertyType,
        propertySubtype: values.propertySubtype || null,
        propertyValue:   values.propertyValue,
        downPaymentAmount:  values.downPaymentAmount   || null,
        loanAmountRequired: values.loanAmountRequired  || null,
        propertyAddress: {
          building: values.building || null,
          area:     values.area     || null,
          city:     values.city     || 'Dubai',
        },
        propertyAgeYears: values.propertyAgeYears || null,
        isOffPlan:        values.isOffPlan         || false,
        completionDate:   values.isOffPlan && values.completionDate
          ? values.completionDate.toISOString()
          : null,
      },
      loanRequirements: {
        preferredTenureYears:        values.preferredTenureYears       || 25,
        preferredInterestRateType:   values.preferredInterestRateType  || 'Fixed',
        feeFinancingPreference:      values.feeFinancingPreference     ?? true,
        lifeInsurancePreference:     values.lifeInsurancePreference    ?? true,
        propertyInsurancePreference: values.propertyInsurancePreference ?? true,
        specialRequirements:         values.specialRequirements        || null,
      },
      referralType: values.referralType || 'Referral Only',
      notesToXoto:  values.notesToXoto  || null,
    };
  };

  const handlePreview = async () => {
    try {
      const values = await form.validateFields();
      setFormValues(values);
      setConfirmModalVisible(true);
    } catch (err) {
      message.error("Please fill all required fields before previewing");
    }
  };

  const handleSubmit = async () => {
    if (!formValues) return;
    
    setLoading(true);
    try {
      const payload = buildPayload(formValues);
      await apiService.post('/vault/lead/create', payload);
      message.success('Lead created successfully!');
      form.resetFields();
      setIsOffPlan(false);
      setConfirmModalVisible(false);
      setFormValues(null);
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  const areas = UAE_AREAS[selectedCity] || [];

  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    return `AED ${value.toLocaleString()}`;
  };

  const renderConfirmModal = () => (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <CheckOutlined style={{ color: BRAND_PURPLE, fontSize: 24 }} />
          <span style={{ fontSize: 18, fontWeight: 700, color: '#1e1b4b' }}>Confirm Lead Submission</span>
        </div>
      }
      open={confirmModalVisible}
      onCancel={() => { setConfirmModalVisible(false); setFormValues(null); }}
      width={750}
      footer={[
        <Button key="cancel" onClick={() => { setConfirmModalVisible(false); setFormValues(null); }} style={{ borderRadius: 8 }}>
          Edit Details
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={handleSubmit}
          loading={loading}
          style={{ background: BRAND_PURPLE, borderColor: BRAND_PURPLE, borderRadius: 8 }}
          icon={<SaveOutlined />}
        >
          Confirm & Submit Lead
        </Button>
      ]}
    >
      {formValues && (
        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <Alert
            message="Please review the lead details before submitting"
            description="Once submitted, the lead will be queued for assignment to an advisor."
            type="info"
            showIcon
            style={{ marginBottom: 20, borderRadius: 12 }}
          />
          
          <Card size="small" title={<span><UserOutlined /> Customer Information</span>} style={{ marginBottom: 16, borderRadius: 12 }}>
            <Row gutter={[16, 8]}>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>Full Name</Text>
                <div><Text strong>{formValues.fullName || 'N/A'}</Text></div>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>Gender</Text>
                <div><Text strong>{formValues.gender || 'N/A'}</Text></div>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>Email</Text>
                <div><Text strong>{formValues.email || 'N/A'}</Text></div>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>Mobile</Text>
                <div><Text strong>+{formValues.mobileNumber || 'N/A'}</Text></div>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>Nationality</Text>
                <div><Text strong>{formValues.nationality || 'N/A'}</Text></div>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>Marital Status</Text>
                <div><Text strong>{formValues.maritalStatus || 'N/A'}</Text></div>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>Occupation</Text>
                <div><Text strong>{formValues.occupation || 'N/A'}</Text></div>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>Monthly Salary</Text>
                <div><Text strong style={{ color: BRAND_PURPLE }}>{formatCurrency(formValues.monthlySalary)}</Text></div>
              </Col>
            </Row>
          </Card>

          <Card size="small" title={<span><HomeOutlined /> Property Information</span>} style={{ marginBottom: 16, borderRadius: 12 }}>
            <Row gutter={[16, 8]}>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>Property Type</Text>
                <div><Text strong>{formValues.propertyType || 'N/A'}</Text></div>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>Property Value</Text>
                <div><Text strong>{formatCurrency(formValues.propertyValue)}</Text></div>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>Down Payment</Text>
                <div><Text strong>{formatCurrency(formValues.downPaymentAmount)}</Text></div>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>Loan Required</Text>
                <div><Text strong>{formatCurrency(formValues.loanAmountRequired)}</Text></div>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>Location</Text>
                <div><Text strong>{formValues.city}, {formValues.area || 'N/A'}</Text></div>
              </Col>
            </Row>
          </Card>

          <Card size="small" title={<span><BankOutlined /> Loan Requirements</span>} style={{ marginBottom: 16, borderRadius: 12 }}>
            <Row gutter={[16, 8]}>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>Preferred Tenure</Text>
                <div><Text strong>{formValues.preferredTenureYears || 25} years</Text></div>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>Interest Rate Type</Text>
                <div><Text strong>{formValues.preferredInterestRateType || 'Fixed'}</Text></div>
              </Col>
            </Row>
          </Card>

          <Card size="small" title={<span><TeamOutlined /> Referral Information</span>} style={{ borderRadius: 12 }}>
            <Row gutter={[16, 8]}>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>Referral Type</Text>
                <div><Text strong>{formValues.referralType || 'Referral Only'}</Text></div>
              </Col>
              <Col span={24}>
                <Text type="secondary" style={{ fontSize: 12 }}>Notes to Xoto</Text>
                <div><Text>{formValues.notesToXoto || 'No notes provided'}</Text></div>
              </Col>
            </Row>
          </Card>
        </div>
      )}
    </Modal>
  );

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', padding: '24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        <div style={{ marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0, color: '#1f2937' }}>Create New Lead</Title>
          <Text type="secondary">Fill in customer and property details to submit a mortgage referral.</Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handlePreview}
          onFinishFailed={({ errorFields }) => {
            message.error("Please fill all required fields");
            if (errorFields.length > 0) {
              form.scrollToField(errorFields[0].name, { behavior: "smooth", block: "center" });
            }
          }}
        >
          {/* SECTION 1 — Customer Info */}
          <Card
            title={<Space><UserOutlined style={{ color: BRAND_PURPLE }} /> Customer Information</Space>}
            bordered={false}
            style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: "24px" }}
          >
            <Row gutter={[24, 8]}>
              <Col xs={24} md={8}>
                <Form.Item name="fullName" label="Full Legal Name" rules={[{ required: true, message: 'Required' }]}>
                  <Input size="large" placeholder="e.g. Ahmed Al Mansouri" style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name="preferredName" label="Preferred Name (Optional)">
                  <Input size="large" placeholder="e.g. Ahmed" style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name="gender" label="Gender" rules={[{ required: true, message: 'Required' }]}>
                  <Select size="large" placeholder="Select gender" style={{ borderRadius: 8 }}>
                    {GENDER_OPTIONS.map(g => (
                      <Option key={g.value} value={g.value}>
                        {g.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name="email" label="Email Address" rules={[{ required: true, message: 'Required' }, { type: 'email', message: 'Valid email required' }]}>
                  <Input size="large" placeholder="omar@example.com" style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name="mobileNumber" label="Mobile Number" rules={[{ required: true, message: 'Required' }]}>
                  <PhoneInput
                    country="ae"
                    preferredCountries={['ae', 'sa', 'in', 'pk', 'gb', 'us']}
                    enableSearch
                    placeholder="Enter mobile number"
                    inputStyle={{ width: '100%', height: 40, borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name="alternativePhone" label="Alternative Phone (Optional)">
                  <PhoneInput country="ae" enableSearch placeholder="Optional" inputStyle={{ width: '100%', height: 40, borderRadius: 8 }} />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name="whatsappNumber" label="WhatsApp Number (Optional)">
                  <PhoneInput country="ae" enableSearch placeholder="Optional" inputStyle={{ width: '100%', height: 40, borderRadius: 8 }} />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name="dateOfBirth" label="Date of Birth" rules={[{ required: true, message: 'Required' }]}>
                  <DatePicker size="large" style={{ width: '100%', borderRadius: 8 }} format="DD-MMM-YYYY" disabledDate={d => d && d.valueOf() > Date.now()} />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name="nationality" label="Nationality" rules={[{ required: true, message: 'Required' }]}>
                  <Select size="large" showSearch placeholder="Select nationality" style={{ borderRadius: 8 }}>
                    {NATIONALITIES.map(n => <Option key={n} value={n}>{n}</Option>)}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name="maritalStatus" label="Marital Status" rules={[{ required: true, message: 'Required' }]}>
                  <Select size="large" placeholder="Select status" style={{ borderRadius: 8 }}>
                    <Option value="Single">Single</Option>
                    <Option value="Married">Married</Option>
                    <Option value="Divorced">Divorced</Option>
                    <Option value="Widowed">Widowed</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name="occupation" label="Occupation / Job Title (Optional)">
                  <Input size="large" placeholder="e.g. Senior Engineer" style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name="employer" label="Employer / Company Name (Optional)">
                  <Input size="large" placeholder="e.g. EMAAR" style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name="monthlySalary" label="Monthly Salary (AED) (Recommended)">
                  <InputNumber
                    size="large" min={0} step={1000} style={{ width: '100%', borderRadius: 8 }}
                    formatter={v => v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                    parser={v => v.replace(/\$\s?|(,*)/g, '')}
                    placeholder="e.g. 25,000"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* SECTION 2 — Property Details */}
          <Card
            title={<Space><HomeOutlined style={{ color: BRAND_PURPLE }} /> Property Details</Space>}
            bordered={false}
            style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: "24px" }}
          >
            <Row gutter={[24, 8]}>
              <Col xs={24} md={8}>
                <Form.Item name="propertyType" label="Property Type" rules={[{ required: true, message: 'Required' }]}>
                  <Select size="large" style={{ borderRadius: 8 }}>
                    <Option value="Ready">Ready</Option>
                    <Option value="Off-plan">Off-plan</Option>
                    <Option value="Commercial">Commercial</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name="propertySubtype" label="Property Subtype (Optional)">
                  <Select size="large" placeholder="Select subtype" allowClear style={{ borderRadius: 8 }}>
                    <Option value="Apartment">Apartment</Option>
                    <Option value="Villa">Villa</Option>
                    <Option value="Townhouse">Townhouse</Option>
                    <Option value="Penthouse">Penthouse</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name="propertyValue" label="Property Value (AED)" rules={[{ required: true, message: 'Required' }]}>
                  <InputNumber
                    size="large" min={0} style={{ width: '100%', borderRadius: 8 }}
                    formatter={v => v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                    parser={v => v.replace(/\$\s?|(,*)/g, '')}
                    placeholder="e.g. 1,500,000"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name="downPaymentAmount" label="Down Payment Amount (AED) (Optional)">
                  <InputNumber
                    size="large" min={0} style={{ width: '100%', borderRadius: 8 }}
                    formatter={v => v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                    parser={v => v.replace(/\$\s?|(,*)/g, '')}
                    placeholder="e.g. 300,000"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name="loanAmountRequired" label="Loan Amount Required (AED) (Optional)">
                  <InputNumber
                    size="large" min={0} style={{ width: '100%', borderRadius: 8 }}
                    formatter={v => v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                    parser={v => v.replace(/\$\s?|(,*)/g, '')}
                    placeholder="e.g. 1,200,000"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name="city" label="City (Optional)">
                  <Select size="large" onChange={(val) => { setSelectedCity(val); form.setFieldValue('area', undefined); }} style={{ borderRadius: 8 }}>
                    {Object.keys(UAE_AREAS).map(city => <Option key={city} value={city}>{city}</Option>)}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name="area" label="Area / Community (Optional)">
                  <Select size="large" placeholder="Select area" showSearch allowClear style={{ borderRadius: 8 }}>
                    {areas.map(a => <Option key={a} value={a}>{a}</Option>)}
                    <Option value="Other">Other</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name="building" label="Building / Tower Name (Optional)">
                  <Input size="large" placeholder="e.g. Burj Views" style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name="propertyAgeYears" label="Property Age (Years) (Optional)">
                  <InputNumber size="large" min={0} max={100} style={{ width: '100%', borderRadius: 8 }} placeholder="0 if new" />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name="isOffPlan" label="Off-Plan Property" valuePropName="checked">
                  <Switch checkedChildren="Yes" unCheckedChildren="No" onChange={(v) => setIsOffPlan(v)} />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="completionDate"
                  label="Expected Completion Date"
                  rules={[{ required: isOffPlan, message: 'Required for off-plan' }]}
                >
                  <DatePicker size="large" style={{ width: '100%', borderRadius: 8 }} format="DD-MMM-YYYY" disabled={!isOffPlan} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* SECTION 3 — Loan Requirements */}
          <Card
            title={<Space><BankOutlined style={{ color: BRAND_PURPLE }} /> Loan Requirements</Space>}
            bordered={false}
            style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: "24px" }}
          >
            <Row gutter={[24, 8]}>
              <Col xs={24} md={8}>
                <Form.Item name="preferredTenureYears" label="Preferred Loan Tenure (Years) (Optional)">
                  <InputNumber size="large" min={1} max={35} style={{ width: '100%', borderRadius: 8 }} />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name="preferredInterestRateType" label="Interest Rate Type (Optional)">
                  <Select size="large" style={{ borderRadius: 8 }}>
                    <Option value="Fixed">Fixed Rate</Option>
                    <Option value="Variable">Variable Rate</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Divider style={{ margin: '24px 0' }} />
                <Text strong>Customer Preferences</Text>
                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                  <Col xs={24} sm={8}>
                    <Form.Item name="feeFinancingPreference" valuePropName="checked" label="Include Fee Financing">
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item name="lifeInsurancePreference" valuePropName="checked" label="Include Life Insurance">
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item name="propertyInsurancePreference" valuePropName="checked" label="Include Property Insurance">
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>

              <Col xs={24}>
                <Form.Item name="specialRequirements" label="Special Requirements (Optional)">
                  <TextArea rows={3} placeholder="e.g. Needs early settlement flexibility" style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* SECTION 4 — Referral & Notes */}
          <Card
            title={<Space><FileTextOutlined style={{ color: BRAND_PURPLE }} /> Referral & Notes</Space>}
            bordered={false}
            style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: "24px" }}
          >
            <Row gutter={[24, 8]}>
              <Col xs={24} md={12}>
                <Form.Item name="referralType" label="Referral Type (Optional)">
                  <Select size="large" style={{ borderRadius: 8 }}>
                    <Option value="Referral Only">Referral Only</Option>
                    <Option value="Referral + Docs">Referral + Docs</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item name="notesToXoto" label="Notes to Xoto Team (Optional)">
                  <TextArea rows={3} placeholder="Any additional notes..." style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* ACTION BUTTONS */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, background: '#fff', padding: '16px 24px', borderRadius: 12, boxShadow: '0 -2px 10px rgba(0,0,0,0.02)' }}>
            <Button size="large" onClick={() => { form.resetFields(); setIsOffPlan(false); }} style={{ borderRadius: 8 }}>
              Reset
            </Button>
            <Button
              type="primary" htmlType="submit" size="large" icon={<EyeOutlined />}
              style={{ background: BRAND_PURPLE, borderColor: BRAND_PURPLE, borderRadius: 8, padding: '0 32px' }}
            >
              Preview & Submit
            </Button>
          </div>
        </Form>

        {renderConfirmModal()}
      </div>
    </div>
  );
};

export default VaultCreateLeads;