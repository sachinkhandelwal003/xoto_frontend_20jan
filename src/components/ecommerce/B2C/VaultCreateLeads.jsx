import React, { useState } from 'react';
import { apiService } from '../../../manageApi/utils/custom.apiservice';
import {
  Form, Input, Select, Button, Card, Row, Col, Typography, Space,
  DatePicker, InputNumber, Checkbox, Tag, message, Spin, Alert, Divider
} from 'antd';
import {
  UserOutlined, HomeOutlined, FileTextOutlined, BankOutlined,
  PlusOutlined, DeleteOutlined, SaveOutlined, EyeOutlined
} from '@ant-design/icons';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import moment from 'moment';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

/* -------------------------------------------------------------------------- */
/*  CONSTANTS                                                                 */
/* -------------------------------------------------------------------------- */
const NATIONALITIES = [
  'Emirati', 'Saudi Arabian', 'Indian', 'Pakistani', 'British', 'American',
  'Egyptian', 'Filipino', 'Jordanian', 'Lebanese', 'Syrian', 'Bangladeshi',
  'Sri Lankan', 'Nepalese', 'Indonesian', 'Chinese', 'Canadian', 'Australian',
  'French', 'German', 'Italian', 'Russian', 'South African', 'Nigerian', 'Other'
];

const UAE_AREAS = {
  Dubai: [
    'Downtown Dubai', 'Dubai Marina', 'Palm Jumeirah', 'JBR', 'Business Bay',
    'DIFC', 'Jumeirah', 'Al Barsha', 'Deira', 'Bur Dubai', 'Discovery Gardens',
    'Dubai Hills Estate', 'Arabian Ranches', 'Emirates Hills', 'Mirdif',
    'International City', 'Silicon Oasis', 'JVC', 'JLT', 'Sports City'
  ],
  'Abu Dhabi': [
    'Al Reem Island', 'Saadiyat Island', 'Yas Island', 'Al Khalidiyah',
    'Corniche', 'Khalifa City', 'Mohammed Bin Zayed City', 'Al Raha Beach',
    'Masdar City', 'Al Mushrif'
  ],
  Sharjah: ['Al Nahda', 'Al Qasimia', 'Al Majaz', 'University City'],
  Ajman: ['Ajman City', 'Al Rashidiya', 'Mushairef'],
  'Ras Al Khaimah': ['Al Hamra', 'Mina Al Arab', 'Al Nakheel'],
  Fujairah: ['Fujairah City'],
  'Umm Al Quwain': ['UAQ City']
};

const BANK_LIST = [
  'Emirates NBD', 'Abu Dhabi Commercial Bank (ADCB)', 'First Abu Dhabi Bank (FAB)',
  'Mashreq Bank', 'Dubai Islamic Bank (DIB)', 'Abu Dhabi Islamic Bank (ADIB)',
  'RAKBANK', 'Commercial Bank of Dubai (CBD)', 'Sharjah Islamic Bank',
  'Citibank UAE', 'HSBC UAE', 'Standard Chartered UAE', 'Other'
];

/* -------------------------------------------------------------------------- */
/*  HELPERS                                                                   */
/* -------------------------------------------------------------------------- */
const getFullPhoneNumber = (phoneObj) => {
  if (!phoneObj) return null;
  // phoneObj from react-phone-input-2 is like { countryCode, dialCode, phone }
  if (typeof phoneObj === 'string') return phoneObj;
  return phoneObj.dialCode + phoneObj.phone;
};

/* -------------------------------------------------------------------------- */
/*  MAIN COMPONENT                                                            */
/* -------------------------------------------------------------------------- */
const VaultCreateLeads = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [preferredBanks, setPreferredBanks] = useState([]);
  const [selectedCity, setSelectedCity] = useState('Dubai');

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Build payload
      const payload = {
        customerInfo: {
          fullName: values.fullName,
          preferredName: values.preferredName,
          email: values.email,
          mobileNumber: getFullPhoneNumber(values.mobileNumber),
          alternativePhone: values.alternativePhone ? getFullPhoneNumber(values.alternativePhone) : null,
          whatsappNumber: values.whatsappNumber ? getFullPhoneNumber(values.whatsappNumber) : null,
          dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString() : null,
          nationality: values.nationality,
          maritalStatus: values.maritalStatus,
          numberOfDependents: values.numberOfDependents || 0,
          occupation: values.occupation,
          employer: values.employer,
          monthlySalary: values.monthlySalary || null,
        },
        propertyDetails: {
          propertyType: values.propertyType,
          propertySubtype: values.propertySubtype,
          propertyValue: values.propertyValue,
          downPaymentAmount: values.downPaymentAmount || null,
          loanAmountRequired: values.loanAmountRequired || null,
          propertyAddress: {
            building: values.building,
            area: values.area,
            city: values.city,
          },
          propertyAgeYears: values.propertyAgeYears || null,
          isOffPlan: values.isOffPlan || false,
          completionDate: values.completionDate ? values.completionDate.toISOString() : null,
        },
        loanRequirements: {
          preferredTenureYears: values.preferredTenureYears,
          preferredInterestRateType: values.preferredInterestRateType,
          preferredBanks: preferredBanks,
          feeFinancingPreference: values.feeFinancingPreference,
          lifeInsurancePreference: values.lifeInsurancePreference,
          propertyInsurancePreference: values.propertyInsurancePreference,
          specialRequirements: values.specialRequirements,
        },
        referralType: values.referralType,
        notesToXoto: values.notesToXoto,
      };

      await apiService.post('/vault/lead/create', payload);
      message.success('Lead created successfully!');
      form.resetFields();
      setPreferredBanks([]);
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBank = (bank) => {
    if (bank && !preferredBanks.includes(bank)) {
      setPreferredBanks([...preferredBanks, bank]);
    }
  };

  const handleRemoveBank = (bank) => {
    setPreferredBanks(preferredBanks.filter(b => b !== bank));
  };

  // Get areas based on selected city
  const areas = UAE_AREAS[selectedCity] || [];

  return (
    <div style={{ background: '#F5F7FA', minHeight: '100vh', padding: '24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <Title level={2} style={{ marginBottom: 4, color: '#1E293B' }}>Create New Lead</Title>
          <Text type="secondary" style={{ fontSize: 14, display: 'block', marginBottom: 24 }}>
            Fill in the details below to submit a new mortgage referral.
          </Text>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              propertyType: 'Ready',
              propertySubtype: 'Apartment',
              city: 'Dubai',
              preferredTenureYears: 25,
              preferredInterestRateType: 'Fixed',
              referralType: 'Referral Only',
              feeFinancingPreference: true,
              lifeInsurancePreference: true,
              propertyInsurancePreference: true,
            }}
          >
            {/* -------------------- Customer Information -------------------- */}
            <Card type="inner" title={<><UserOutlined /> Customer Information</>} style={{ marginBottom: 24 }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="fullName" label="Full Legal Name" rules={[{ required: true, message: 'Required' }]}>
                    <Input placeholder="e.g. Omar Khalid Hassan" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="preferredName" label="Preferred Name">
                    <Input placeholder="e.g. Omar" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                    <Input placeholder="omar@example.com" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="mobileNumber" label="Mobile Number" rules={[{ required: true }]}>
                    <PhoneInput
                      country="ae"
                      preferredCountries={['ae', 'sa', 'us', 'gb', 'in']}
                      enableSearch
                      placeholder="Enter mobile number"
                      inputStyle={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="alternativePhone" label="Alternative Phone">
                    <PhoneInput country="ae" enableSearch placeholder="Optional" inputStyle={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="whatsappNumber" label="WhatsApp Number">
                    <PhoneInput country="ae" enableSearch placeholder="Optional" inputStyle={{ width: '100%' }} />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="dateOfBirth" label="Date of Birth" rules={[{ required: true }]}>
                    <DatePicker style={{ width: '100%' }} placeholder="Select date" format="DD-MMM-YYYY" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="nationality" label="Nationality" rules={[{ required: true }]}>
                    <Select showSearch placeholder="Select nationality">
                      {NATIONALITIES.map(n => <Option key={n} value={n}>{n}</Option>)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="maritalStatus" label="Marital Status" rules={[{ required: true }]}>
                    <Select>
                      <Option value="Single">Single</Option>
                      <Option value="Married">Married</Option>
                      <Option value="Divorced">Divorced</Option>
                      <Option value="Widowed">Widowed</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="numberOfDependents" label="Number of Dependents">
                    <InputNumber min={0} max={20} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="occupation" label="Occupation / Job Title">
                    <Input placeholder="e.g. Senior Engineer" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="employer" label="Employer / Company Name">
                    <Input placeholder="e.g. Emirates NBD" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="monthlySalary" label="Monthly Salary (AED)">
                    <InputNumber min={0} step={1000} style={{ width: '100%' }} addonAfter="AED" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* -------------------- Property Details -------------------- */}
            <Card type="inner" title={<><HomeOutlined /> Property Details</>} style={{ marginBottom: 24 }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="propertyType" label="Property Type" rules={[{ required: true }]}>
                    <Select>
                      <Option value="Ready">Ready</Option>
                      <Option value="Off-plan">Off-plan</Option>
                      <Option value="Commercial">Commercial</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="propertySubtype" label="Property Subtype" rules={[{ required: true }]}>
                    <Select>
                      <Option value="Apartment">Apartment</Option>
                      <Option value="Villa">Villa</Option>
                      <Option value="Townhouse">Townhouse</Option>
                      <Option value="Penthouse">Penthouse</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="propertyValue" label="Property Value (AED)" rules={[{ required: true }]}>
                    <InputNumber min={0} style={{ width: '100%' }} addonAfter="AED" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="downPaymentAmount" label="Down Payment Amount (AED)">
                    <InputNumber min={0} style={{ width: '100%' }} addonAfter="AED" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="loanAmountRequired" label="Loan Amount Required (AED)">
                    <InputNumber min={0} style={{ width: '100%' }} addonAfter="AED" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="city" label="City" rules={[{ required: true }]}>
                    <Select onChange={(val) => setSelectedCity(val)}>
                      {Object.keys(UAE_AREAS).map(city => <Option key={city} value={city}>{city}</Option>)}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="area" label="Area / Community" rules={[{ required: true }]}>
                    <Select placeholder="Select area" showSearch>
                      {areas.map(area => <Option key={area} value={area}>{area}</Option>)}
                      <Option value="Other">Other</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="building" label="Building / Tower Name">
                    <Input placeholder="e.g. Burj Vista" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="propertyAgeYears" label="Property Age (Years)">
                    <InputNumber min={0} style={{ width: '100%' }} addonAfter="Yrs" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="completionDate" label="Expected Completion Date (for Off-plan)">
                    <DatePicker style={{ width: '100%' }} format="DD-MMM-YYYY" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="isOffPlan" valuePropName="checked">
                    <Checkbox>Off-Plan Property</Checkbox>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* -------------------- Loan Requirements -------------------- */}
            <Card type="inner" title={<><BankOutlined /> Loan Requirements</>} style={{ marginBottom: 24 }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="preferredTenureYears" label="Preferred Loan Tenure (Years)">
                    <InputNumber min={1} max={35} style={{ width: '100%' }} addonAfter="Yrs" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="preferredInterestRateType" label="Interest Rate Type">
                    <Select>
                      <Option value="Fixed">Fixed</Option>
                      <Option value="Variable">Variable</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={16}>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>Preferred Banks</Text>
                  </div>
                  <Space wrap>
                    {preferredBanks.map(bank => (
                      <Tag key={bank} closable onClose={() => handleRemoveBank(bank)} color="blue">
                        {bank}
                      </Tag>
                    ))}
                  </Space>
                  <Select
                    placeholder="Select a bank to add"
                    style={{ width: 200, marginTop: 8 }}
                    onSelect={(val) => { handleAddBank(val); form.setFieldValue('tempBank', undefined); }}
                  >
                    {BANK_LIST.filter(b => !preferredBanks.includes(b)).map(b => (
                      <Option key={b} value={b}>{b}</Option>
                    ))}
                  </Select>
                </Col>

                <Col xs={24}>
                  <Row gutter={[16, 16]}>
                    <Col xs={8}>
                      <Form.Item name="feeFinancingPreference" valuePropName="checked">
                        <Checkbox>Include Fee Financing</Checkbox>
                      </Form.Item>
                    </Col>
                    <Col xs={8}>
                      <Form.Item name="lifeInsurancePreference" valuePropName="checked">
                        <Checkbox>Include Life Insurance</Checkbox>
                      </Form.Item>
                    </Col>
                    <Col xs={8}>
                      <Form.Item name="propertyInsurancePreference" valuePropName="checked">
                        <Checkbox>Include Property Insurance</Checkbox>
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>

                <Col xs={24}>
                  <Form.Item name="specialRequirements" label="Special Requirements / Notes">
                    <TextArea rows={3} placeholder="e.g. Needs early settlement flexibility, salary via WPS…" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* -------------------- Referral & Internal Notes -------------------- */}
            <Card type="inner" title={<><FileTextOutlined /> Referral & Internal Notes</>} style={{ marginBottom: 24 }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item name="referralType" label="Referral Type" rules={[{ required: true }]}>
                    <Select>
                      <Option value="Referral Only">Referral Only — No document collection</Option>
                      <Option value="Referral + Docs">Referral + Docs — Agent will collect documents</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="notesToXoto" label="Notes to Xoto Team">
                    <TextArea rows={3} placeholder="e.g. Client is in a hurry, prefers Islamic financing, contacted via referral from Ahmad…" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Submit Button */}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                icon={<SaveOutlined />}
                loading={loading}
                style={{ background: '#5C039B', borderColor: '#5C039B', width: '200px' }}
              >
                Save Lead Details
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default VaultCreateLeads;