// src/components/Vault/AgentOnboard.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form, Input, Button, Card, Steps, Row, Col, DatePicker,
  Upload, message, Space, Typography, Divider, Select
} from "antd";
import {
  UserOutlined, MailOutlined, LockOutlined, PhoneOutlined,
  HomeOutlined, EnvironmentOutlined, HeartOutlined, GlobalOutlined,
  BankOutlined, FileTextOutlined, CreditCardOutlined, PlusOutlined,
  DeleteOutlined, CheckOutlined, ArrowLeftOutlined, ArrowRightOutlined,
  UploadOutlined, IdcardOutlined, SafetyOutlined
} from "@ant-design/icons";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import moment from "moment";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;
const { Step } = Steps;
const { Option } = Select;

const BRAND_PURPLE = "#5C039B";

/* -------------------------------------------------------------------------- */
/*  BASE64 IMAGE UPLOAD FIELD                                                 */
/* -------------------------------------------------------------------------- */
const Base64ImageUpload = ({ value, onChange, label }) => {
  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      message.error('Please upload an image file (JPG, PNG, WEBP)');
      return false;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      onChange(e.target.result);
      message.success(`${label} uploaded`);
    };
    reader.readAsDataURL(file);
    return false;
  };

  return (
    <div>
      {value ? (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img src={value} alt={label} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }} />
          <Button type="text" danger icon={<DeleteOutlined />} style={{ position: 'absolute', top: -8, right: -8 }} onClick={() => onChange('')} />
        </div>
      ) : (
        <Upload.Dragger beforeUpload={handleFile} showUploadList={false} accept="image/jpeg,image/png,image/webp">
          <p className="ant-upload-drag-icon"><UploadOutlined /></p>
          <p>Click or drag to upload</p>
          <p style={{ fontSize: 12, color: '#9ca3af' }}>JPG, PNG, WEBP up to 10MB</p>
        </Upload.Dragger>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  MAIN COMPONENT                                                            */
/* -------------------------------------------------------------------------- */
export default function VaultAgentOnboard() {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dependents, setDependents] = useState([]);
  const navigate = useNavigate();

  // Image states (Base64)
  const [emiratesFront, setEmiratesFront] = useState('');
  const [emiratesBack, setEmiratesBack] = useState('');
  const [passportImage, setPassportImage] = useState('');
  const [visaImage, setVisaImage] = useState('');

  const steps = [
    { title: "Personal Info", icon: <UserOutlined /> },
    { title: "Address & Emergency", icon: <HomeOutlined /> },
    { title: "Identity Documents", icon: <IdcardOutlined /> },
    { title: "Bank Details", icon: <BankOutlined /> },
  ];

  const addDependent = () => {
    setDependents([...dependents, { name: "", age: "", relationship: "", location: "" }]);
  };
  const removeDependent = (index) => {
    const newList = [...dependents];
    newList.splice(index, 1);
    setDependents(newList);
  };

  const validateStep = async () => {
    try {
      let fields = [];
      if (currentStep === 0) {
        fields = ["first_name", "last_name", "email", "phone_number", "password", "gender", "dateOfBirth", "nationality", "maritalStatus"];
      } else if (currentStep === 1) {
        fields = ["address.city", "address.country", "emergencyContact.name", "emergencyContact.relationship", "emergencyContact.phone"];
      } else if (currentStep === 2) {
        fields = ["emiratesIdNumber", "emiratesIdExpiryDate"];
      } else if (currentStep === 3) {
        fields = ["beneficiaryName", "bankName", "accountNumber", "iban", "accountType"];
      }
      await form.validateFields(fields);
      return true;
    } catch {
      message.error("Please fill all required fields");
      return false;
    }
  };

  const handleNext = async () => {
    if (await validateStep()) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!await validateStep()) return;
    setLoading(true);
    try {
      const values = form.getFieldsValue(true);
      const payload = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone_number: values.phone_number,
        password: values.password,
        maritalStatus: values.maritalStatus,
        numberOfDependents: dependents.length,
        nationality: values.nationality,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString() : null,
        gender: values.gender,
        dependents: dependents.map(d => ({ ...d, age: Number(d.age) })),
        address: {
          building: values.address?.building,
          apartment: values.address?.apartment,
          area: values.address?.area,
          city: values.address?.city,
          country: values.address?.country,
        },
        emergencyContact: {
          name: values.emergencyContact?.name,
          relationship: values.emergencyContact?.relationship,
          phone: values.emergencyContact?.phone,
        },
        emiratesIdNumber: values.emiratesIdNumber,
        emiratesIdExpiryDate: values.emiratesIdExpiryDate ? values.emiratesIdExpiryDate.toISOString() : null,
        emiratesIdFrontImage: emiratesFront,
        emiratesIdBackImage: emiratesBack,
        passportNumber: values.passportNumber,
        passportExpiryDate: values.passportExpiryDate ? values.passportExpiryDate.toISOString() : null,
        passportImage: passportImage,
        visaNumber: values.visaNumber,
        visaExpiryDate: values.visaExpiryDate ? values.visaExpiryDate.toISOString() : null,
        visaImage: visaImage,
        beneficiaryName: values.beneficiaryName,
        bankName: values.bankName,
        accountNumber: values.accountNumber,
        iban: values.iban,
        swiftCode: values.swiftCode,
        accountType: values.accountType,
      };
      await apiService.post("/vault/agent/admin/onboard-freelance", payload);
      setSuccess(true);
    } catch (err) {
      message.error(err?.response?.data?.message || "Failed to onboard agent");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: "100vh", background: "#F5F7FA", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Card style={{ maxWidth: 500, width: "100%", textAlign: "center", borderRadius: 20 }}>
          <div style={{ width: 70, height: 70, background: BRAND_PURPLE, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <CheckOutlined style={{ fontSize: 32, color: "#fff" }} />
          </div>
          <Title level={3}>Agent Onboarded!</Title>
          <Text type="secondary">The agent has been successfully registered.</Text>
          <Divider />
          <Space direction="vertical" style={{ width: "100%" }}>
            <Button block onClick={() => { setSuccess(false); setCurrentStep(0); form.resetFields(); setDependents([]); setEmiratesFront(''); setEmiratesBack(''); setPassportImage(''); setVisaImage(''); }}>Onboard Another</Button>
            <Button type="primary" block onClick={() => navigate("/dashboard/vault-admin/agent-list")} style={{ background: BRAND_PURPLE }}>View Agents</Button>
          </Space>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ background: "#F5F7FA", minHeight: "100vh", padding: 24 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Card style={{ borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <Title level={2} style={{ marginBottom: 4 }}>Onboard New Agent</Title>
          <Text type="secondary" style={{ display: "block", marginBottom: 24 }}>Fill in all required details to register a new freelance agent.</Text>

          <Steps current={currentStep} style={{ marginBottom: 32 }}>
            {steps.map((step, idx) => <Step key={idx} title={step.title} icon={step.icon} />)}
          </Steps>

          <Form form={form} layout="vertical" initialValues={{ country: "United Arab Emirates" }}>
            {/* STEP 0: Personal Info */}
            {currentStep === 0 && (
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item name="first_name" label="First Name" rules={[{ required: true, message: "Required" }]}>
                    <Input placeholder="Ahmed" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="last_name" label="Last Name" rules={[{ required: true, message: "Required" }]}>
                    <Input placeholder="Al Mansoori" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
                    <Input placeholder="agent@example.com" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
                    <Input.Password placeholder="Min 6 characters" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="phone_number" label="Phone Number" rules={[{ required: true, message: "Required" }]}>
                    <PhoneInput country="ae" preferredCountries={["ae","sa","us","gb","in"]} enableSearch inputStyle={{ width: "100%", borderRadius: 8, height: 40 }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
                    <Select placeholder="Select gender">
                      <Option value="Male">Male</Option>
                      <Option value="Female">Female</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="dateOfBirth" label="Date of Birth" rules={[{ required: true }]}>
                    <DatePicker style={{ width: "100%" }} format="DD-MMM-YYYY" disabledDate={(current) => current && current > moment().endOf("day")} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="nationality" label="Nationality" rules={[{ required: true }]}>
                    <Input placeholder="UAE" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="maritalStatus" label="Marital Status" rules={[{ required: true }]}>
                    <Select placeholder="Select status">
                      <Option value="Single">Single</Option>
                      <Option value="Married">Married</Option>
                      <Option value="Divorced">Divorced</Option>
                      <Option value="Widowed">Widowed</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Divider orientation="left">Dependents</Divider>
                  {dependents.map((dep, idx) => (
                    <Card key={idx} size="small" style={{ marginBottom: 12, background: "#FAFAFA" }}>
                      <Row gutter={16}>
                        <Col xs={12} md={6}><Input placeholder="Name" value={dep.name} onChange={e => { const newDeps = [...dependents]; newDeps[idx].name = e.target.value; setDependents(newDeps); }} /></Col>
                        <Col xs={12} md={6}><Input placeholder="Age" type="number" value={dep.age} onChange={e => { const newDeps = [...dependents]; newDeps[idx].age = e.target.value; setDependents(newDeps); }} /></Col>
                        <Col xs={12} md={6}><Input placeholder="Relationship" value={dep.relationship} onChange={e => { const newDeps = [...dependents]; newDeps[idx].relationship = e.target.value; setDependents(newDeps); }} /></Col>
                        <Col xs={12} md={6}><Input placeholder="Location" value={dep.location} onChange={e => { const newDeps = [...dependents]; newDeps[idx].location = e.target.value; setDependents(newDeps); }} /></Col>
                      </Row>
                      <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeDependent(idx)} style={{ marginTop: 8 }}>Remove</Button>
                    </Card>
                  ))}
                  <Button type="dashed" onClick={addDependent} icon={<PlusOutlined />} block>Add Dependent</Button>
                </Col>
              </Row>
            )}

            {/* STEP 1: Address & Emergency */}
            {currentStep === 1 && (
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item name={["address", "building"]} label="Building"><Input placeholder="Marina Heights" /></Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name={["address", "apartment"]} label="Apartment"><Input placeholder="Apartment 1204" /></Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name={["address", "area"]} label="Area"><Input placeholder="Dubai Marina" /></Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name={["address", "city"]} label="City" rules={[{ required: true }]}><Input placeholder="Dubai" /></Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name={["address", "country"]} label="Country" rules={[{ required: true }]}><Input placeholder="UAE" /></Form.Item>
                </Col>

                <Divider orientation="left">Emergency Contact</Divider>
                <Col xs={24} sm={12}>
                  <Form.Item name={["emergencyContact", "name"]} label="Contact Name" rules={[{ required: true }]}><Input placeholder="Khalid Al Mansoori" /></Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name={["emergencyContact", "relationship"]} label="Relationship" rules={[{ required: true }]}><Input placeholder="Father" /></Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item name={["emergencyContact", "phone"]} label="Phone" rules={[{ required: true }]}>
                    <PhoneInput country="ae" enableSearch inputStyle={{ width: "100%", borderRadius: 8, height: 40 }} />
                  </Form.Item>
                </Col>
              </Row>
            )}

            {/* STEP 2: Identity Documents */}
            {currentStep === 2 && (
              <Row gutter={[16, 16]}>
                <Divider orientation="left">Emirates ID</Divider>
                <Col xs={24} sm={12}>
                  <Form.Item name="emiratesIdNumber" label="Emirates ID Number" rules={[{ required: true }]}>
                    <Input placeholder="784-1990-1234567-8" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="emiratesIdExpiryDate" label="Expiry Date" rules={[{ required: true }]}>
                    <DatePicker style={{ width: "100%" }} format="DD-MMM-YYYY" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Front Side Image">
                    <Base64ImageUpload value={emiratesFront} onChange={setEmiratesFront} label="Emirates ID Front" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Back Side Image">
                    <Base64ImageUpload value={emiratesBack} onChange={setEmiratesBack} label="Emirates ID Back" />
                  </Form.Item>
                </Col>

                <Divider orientation="left">Passport</Divider>
                <Col xs={24} sm={12}>
                  <Form.Item name="passportNumber" label="Passport Number"><Input placeholder="A12345678" /></Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="passportExpiryDate" label="Expiry Date"><DatePicker style={{ width: "100%" }} format="DD-MMM-YYYY" /></Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item label="Passport Image">
                    <Base64ImageUpload value={passportImage} onChange={setPassportImage} label="Passport" />
                  </Form.Item>
                </Col>

                <Divider orientation="left">Visa</Divider>
                <Col xs={24} sm={12}>
                  <Form.Item name="visaNumber" label="Visa Number"><Input placeholder="VISA-987654" /></Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="visaExpiryDate" label="Expiry Date"><DatePicker style={{ width: "100%" }} format="DD-MMM-YYYY" /></Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item label="Visa Image">
                    <Base64ImageUpload value={visaImage} onChange={setVisaImage} label="Visa" />
                  </Form.Item>
                </Col>
              </Row>
            )}

            {/* STEP 3: Bank Details */}
            {currentStep === 3 && (
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item name="beneficiaryName" label="Beneficiary Name" rules={[{ required: true }]}><Input placeholder="Ahmed Al Mansoori" /></Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="bankName" label="Bank Name" rules={[{ required: true }]}><Input placeholder="ADCB" /></Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="accountNumber" label="Account Number" rules={[{ required: true }]}><Input placeholder="98765432109876" /></Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="iban" label="IBAN" rules={[{ required: true }]}><Input placeholder="AE123456789012345678902" /></Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="swiftCode" label="SWIFT Code"><Input placeholder="ADCBAEAD" /></Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="accountType" label="Account Type" rules={[{ required: true }]}>
                    <Select placeholder="Select type">
                      <Option value="Savings">Savings</Option>
                      <Option value="Current">Current</Option>
                      <Option value="Fixed Deposit">Fixed Deposit</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            )}

            <Divider />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {currentStep > 0 && <Button onClick={handleBack} icon={<ArrowLeftOutlined />}>Back</Button>}
              {currentStep < steps.length - 1
                ? <Button type="primary" onClick={handleNext} icon={<ArrowRightOutlined />} style={{ marginLeft: "auto", background: BRAND_PURPLE }}>Continue</Button>
                : <Button type="primary" onClick={handleSubmit} loading={loading} icon={<CheckOutlined />} style={{ marginLeft: "auto", background: BRAND_PURPLE }}>Onboard Agent</Button>
              }
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
}