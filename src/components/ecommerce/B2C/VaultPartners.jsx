// src/components/Vault/VaultPartners.jsx
import { useState } from "react";
import {
  Form, Input, Button, Card, Steps, Row, Col, DatePicker,
  Select, Checkbox, Space, Typography, Divider, message
} from "antd";
import {
  BuildOutlined, UserOutlined, TeamOutlined, EnvironmentOutlined,
  CreditCardOutlined, PercentageOutlined, FileTextOutlined, KeyOutlined,
  ArrowLeftOutlined, ArrowRightOutlined, CheckOutlined, CopyOutlined
} from "@ant-design/icons";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import moment from "moment";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import PartnerList from "./PartnerList";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Step } = Steps;
const { Option } = Select;

const BRAND_PURPLE = "#5C039B";

const STEPS = [
  { title: "Company", icon: <BuildOutlined /> },
  { title: "Primary", icon: <UserOutlined /> },
  { title: "Secondary", icon: <TeamOutlined /> },
  { title: "Address", icon: <EnvironmentOutlined /> },
  { title: "Bank", icon: <CreditCardOutlined /> },
  { title: "Commission", icon: <PercentageOutlined /> },
  { title: "Agreement", icon: <FileTextOutlined /> },
  { title: "Credentials", icon: <KeyOutlined /> },
];

export default function VaultPartners() {
  const [mode, setMode] = useState("onboard"); // "onboard" or "list"
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(false);
  const navigate = useNavigate(); // if needed, but we use setMode

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const validateStep = async () => {
    try {
      let fields = [];
      if (currentStep === 0) {
        fields = ["companyName", "tradeLicenseNumber", "tradeLicenseIssueDate", "tradeLicenseExpiryDate"];
      } else if (currentStep === 1) {
        fields = ["primaryName", "primaryDesignation", "primaryEmail", "primaryPhone", "primaryEmiratesId"];
      } else if (currentStep === 2) {
        // secondary is optional
        fields = [];
      } else if (currentStep === 3) {
        fields = ["billBuilding", "billArea", "billCity", "billCountry"];
        if (!sameAsShipping) {
          fields.push("shipBuilding", "shipArea", "shipCity", "shipCountry");
        }
      } else if (currentStep === 4) {
        fields = ["bankBeneficiary", "bankName", "bankAccount", "bankIban", "bankSwift"];
      } else if (currentStep === 5) {
        fields = ["tier1Max", "tier1Pct", "tier2Min", "tier2Pct", "paymentTerms"];
      } else if (currentStep === 6) {
        fields = ["agreementType", "agreementStart", "agreementEnd", "signedByXoto", "signedByPartner", "signedDate"];
      } else if (currentStep === 7) {
        fields = ["email", "username", "password", "confirmPassword"];
      }
      await form.validateFields(fields);
      return true;
    } catch {
      message.error("Please fill all required fields correctly");
      return false;
    }
  };

  const next = async () => {
    if (await validateStep()) {
      setCurrentStep(prev => prev + 1);
      scrollToTop();
    }
  };
  const back = () => {
    setCurrentStep(prev => prev - 1);
    scrollToTop();
  };

  const handleSubmit = async () => {
    if (!await validateStep()) return;
    setLoading(true);
    try {
      const values = form.getFieldsValue(true);
      const payload = {
        companyName: values.companyName,
        legalEntityType: values.legalEntityType,
        tradeLicenseNumber: values.tradeLicenseNumber,
        tradeLicenseIssueDate: values.tradeLicenseIssueDate ? values.tradeLicenseIssueDate.toISOString() : null,
        tradeLicenseExpiryDate: values.tradeLicenseExpiryDate ? values.tradeLicenseExpiryDate.toISOString() : null,
        isOffline_aggrement: values.isOffline_aggrement ? values.isOffline_aggrement.toISOString() : null,
        taxRegistrationNumber: values.taxRegistrationNumber,
        dbaName: values.dbaName,
        website: values.website,
        yearEstablished: Number(values.yearEstablished),
        numberOfBranches: Number(values.numberOfBranches),
        role: values.role,
        email: values.email,
        primaryContact: {
          name: values.primaryName,
          designation: values.primaryDesignation,
          email: values.primaryEmail,
          phone: values.primaryPhone,
          alternativePhone: values.primaryAltPhone,
          whatsappNumber: values.primaryWhatsapp,
          emiratesId: values.primaryEmiratesId,
        },
        secondaryContact: {
          name: values.secondaryName,
          designation: values.secondaryDesignation,
          email: values.secondaryEmail,
          phone: values.secondaryPhone,
          whatsappNumber: values.secondaryWhatsapp,
          emiratesId: values.secondaryEmiratesId,
        },
        billingAddress: {
          buildingName: values.billBuilding,
          floorUnit: values.billFloor,
          area: values.billArea,
          city: values.billCity,
          poBox: values.billPoBox,
          country: values.billCountry,
        },
        shippingAddress: sameAsShipping
          ? {
              buildingName: values.billBuilding,
              floorUnit: values.billFloor,
              area: values.billArea,
              city: values.billCity,
              poBox: values.billPoBox,
              country: values.billCountry,
            }
          : {
              buildingName: values.shipBuilding,
              floorUnit: values.shipFloor,
              area: values.shipArea,
              city: values.shipCity,
              poBox: values.shipPoBox,
              country: values.shipCountry,
            },
        bankDetails: {
          beneficiaryName: values.bankBeneficiary,
          bankName: values.bankName,
          accountNumber: values.bankAccount,
          iban: values.bankIban,
          swiftCode: values.bankSwift,
          branchName: values.bankBranch,
          accountType: values.bankAccountType,
        },
        commissionConfiguration: {
          tier1: {
            loanAmountMax: Number(values.tier1Max),
            commissionPercentage: Number(values.tier1Pct),
            description: values.tier1Desc,
          },
          tier2: {
            loanAmountMin: Number(values.tier2Min),
            commissionPercentage: Number(values.tier2Pct),
            description: values.tier2Desc,
          },
          paymentTerms: values.paymentTerms,
          calculationBasis: values.calculationBasis,
        },
        agreementDetails: {
          agreementType: values.agreementType,
          startDate: values.agreementStart ? values.agreementStart.toISOString() : null,
          endDate: values.agreementEnd ? values.agreementEnd.toISOString() : null,
          autoRenew: values.autoRenew,
          signedByXoto: values.signedByXoto,
          signedByPartner: values.signedByPartner,
          signedDate: values.signedDate ? values.signedDate.toISOString() : null,
          documentUrl: values.documentUrl,
        },
        username: values.username,
        password: values.password,
      };
      const response = await apiService.post("/vault/partner/create", payload);
      if (response?.success || response?.data) {
        setDone(true);
      } else {
        throw new Error(response?.message || "Something went wrong");
      }
    } catch (err) {
      message.error(err.message || "API Error");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div style={{ minHeight: "100vh", background: "#F5F7FA", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Card style={{ maxWidth: 500, width: "100%", textAlign: "center", borderRadius: 20 }}>
          <div style={{ width: 70, height: 70, background: BRAND_PURPLE, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <CheckOutlined style={{ fontSize: 32, color: "#fff" }} />
          </div>
          <Title level={3}>Partner Created!</Title>
          <Text type="secondary">The partner has been successfully onboarded.</Text>
          <Divider />
          <Space direction="vertical" style={{ width: "100%" }}>
            <Button block onClick={() => { setDone(false); setCurrentStep(0); form.resetFields(); setSameAsShipping(false); }}>Onboard Another</Button>
            <Button type="primary" block onClick={() => setMode("list")} style={{ background: BRAND_PURPLE }}>View Partners</Button>
          </Space>
        </Card>
      </div>
    );
  }

  if (mode === "list") {
    return <PartnerList />;
  }

  return (
    <div style={{ background: "#F5F7FA", minHeight: "100vh", padding: 24 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Card style={{ borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div>
              <Title level={2} style={{ marginBottom: 4 }}>Onboard New Partner</Title>
              <Text type="secondary">Fill in all sections to create a partner account</Text>
            </div>
            <Button onClick={() => setMode("list")} icon={<TeamOutlined />}>View Partners</Button>
          </div>

          <Steps current={currentStep} style={{ marginBottom: 32 }}>
            {STEPS.map((step, idx) => <Step key={idx} title={step.title} icon={step.icon} />)}
          </Steps>

          <Form form={form} layout="vertical" initialValues={{
            legalEntityType: "LLC",
            billCity: "Dubai",
            billCountry: "UAE",
            shipCity: "Dubai",
            shipCountry: "UAE",
            bankAccountType: "Business Current",
            tier1Max: "5000000",
            tier1Pct: "75",
            tier1Desc: "For loans up to 5M AED",
            tier2Min: "5000001",
            tier2Pct: "80",
            tier2Desc: "For loans above 5M AED",
            paymentTerms: "Net 30 days after disbursement",
            calculationBasis: "Percentage of Xoto's bank commission",
            agreementType: "Commercial Partnership Agreement",
            signedByXoto: "Xoto Prophet LLC",
            autoRenew: true,
          }}>
            {/* STEP 0: Company */}
            {currentStep === 0 && (
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item name="companyName" label="Legal Company Name" rules={[{ required: true }]}>
                    <Input placeholder="e.g. Dubai Real Estate Brokers LLC" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="legalEntityType" label="Legal Entity Type">
                    <Select>
                      <Option value="LLC">LLC</Option>
                      <Option value="FZE">FZE</Option>
                      <Option value="PJSC">PJSC</Option>
                      <Option value="Sole Proprietorship">Sole Proprietorship</Option>
                      <Option value="Partnership">Partnership</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="tradeLicenseNumber" label="Trade License Number" rules={[{ required: true }]}>
                    <Input placeholder="e.g. 1234567" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="taxRegistrationNumber" label="Tax Registration Number (TRN)">
                    <Input placeholder="TRN-987654321" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="tradeLicenseIssueDate" label="License Issue Date" rules={[{ required: true }]}>
                    <DatePicker style={{ width: "100%" }} format="DD-MMM-YYYY" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="tradeLicenseExpiryDate" label="License Expiry Date" rules={[{ required: true }]}>
                    <DatePicker style={{ width: "100%" }} format="DD-MMM-YYYY" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="isOffline_aggrement" label="Offline Agreement Date">
                    <DatePicker style={{ width: "100%" }} format="DD-MMM-YYYY" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="dbaName" label="DBA / Trade Name">
                    <Input placeholder="e.g. DREB Properties" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="website" label="Website">
                    <Input placeholder="www.example.ae" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="yearEstablished" label="Year Established">
                    <Input type="number" placeholder="e.g. 2015" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="numberOfBranches" label="Number of Branches">
                    <Input type="number" placeholder="e.g. 3" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="role" label="Role ID">
                    <Input placeholder="MongoDB ObjectId" />
                  </Form.Item>
                </Col>
              </Row>
            )}

            {/* STEP 1: Primary Contact */}
            {currentStep === 1 && (
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item name="primaryName" label="Full Name" rules={[{ required: true }]}>
                    <Input placeholder="Mohammed Ali" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="primaryDesignation" label="Designation" rules={[{ required: true }]}>
                    <Input placeholder="Managing Director" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="primaryEmail" label="Email Address" rules={[{ required: true, type: "email" }]}>
                    <Input placeholder="mohammed@company.ae" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="primaryEmiratesId" label="Emirates ID" rules={[{ required: true }]}>
                    <Input placeholder="784-1980-1234567-8" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="primaryPhone" label="Phone Number" rules={[{ required: true }]}>
                    <PhoneInput country="ae" enableSearch inputStyle={{ width: "100%", borderRadius: 8, height: 40 }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="primaryAltPhone" label="Alternative Phone">
                    <PhoneInput country="ae" enableSearch inputStyle={{ width: "100%", borderRadius: 8, height: 40 }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="primaryWhatsapp" label="WhatsApp Number">
                    <Input placeholder="50 123 4567" />
                  </Form.Item>
                </Col>
              </Row>
            )}

            {/* STEP 2: Secondary Contact (Optional) */}
            {currentStep === 2 && (
              <>
                <div style={{ background: "#e6f7ff", padding: 12, borderRadius: 8, marginBottom: 24 }}>
                  <Text type="secondary">Secondary contact is optional but recommended for operational continuity.</Text>
                </div>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Form.Item name="secondaryName" label="Full Name"><Input placeholder="Fatima Hassan" /></Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="secondaryDesignation" label="Designation"><Input placeholder="Operations Manager" /></Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="secondaryEmail" label="Email Address" rules={[{ type: "email" }]}><Input placeholder="fatima@company.ae" /></Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="secondaryEmiratesId" label="Emirates ID"><Input placeholder="784-1985-8765432-1" /></Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="secondaryPhone" label="Phone Number"><PhoneInput country="ae" enableSearch inputStyle={{ width: "100%", borderRadius: 8, height: 40 }} /></Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="secondaryWhatsapp" label="WhatsApp Number"><Input placeholder="50 123 4567" /></Form.Item>
                  </Col>
                </Row>
              </>
            )}

            {/* STEP 3: Address */}
            {currentStep === 3 && (
              <>
                <Title level={5}>Billing Address</Title>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Form.Item name="billBuilding" label="Building Name" rules={[{ required: true }]}><Input placeholder="Boulevard Plaza" /></Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="billFloor" label="Floor / Unit"><Input placeholder="Level 15, Office 1502" /></Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="billArea" label="Area" rules={[{ required: true }]}><Input placeholder="Downtown Dubai" /></Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="billCity" label="City" rules={[{ required: true }]}><Input placeholder="Dubai" /></Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="billPoBox" label="PO Box"><Input placeholder="12345" /></Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="billCountry" label="Country" rules={[{ required: true }]}>
                      <Select>
                        <Option value="UAE">UAE</Option>
                        <Option value="Saudi Arabia">Saudi Arabia</Option>
                        <Option value="Bahrain">Bahrain</Option>
                        <Option value="Oman">Oman</Option>
                        <Option value="Kuwait">Kuwait</Option>
                        <Option value="Qatar">Qatar</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Checkbox
                  checked={sameAsShipping}
                  onChange={e => setSameAsShipping(e.target.checked)}
                  style={{ margin: "16px 0" }}
                >
                  <CopyOutlined /> Shipping address same as billing
                </Checkbox>

                {!sameAsShipping && (
                  <>
                    <Title level={5}>Shipping Address</Title>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12}>
                        <Form.Item name="shipBuilding" label="Building Name" rules={[{ required: !sameAsShipping }]}><Input placeholder="Boulevard Plaza" /></Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="shipFloor" label="Floor / Unit"><Input placeholder="Level 15, Office 1502" /></Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="shipArea" label="Area" rules={[{ required: !sameAsShipping }]}><Input placeholder="Downtown Dubai" /></Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="shipCity" label="City" rules={[{ required: !sameAsShipping }]}><Input placeholder="Dubai" /></Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="shipPoBox" label="PO Box"><Input placeholder="12345" /></Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="shipCountry" label="Country" rules={[{ required: !sameAsShipping }]}>
                          <Select>
                            <Option value="UAE">UAE</Option>
                            <Option value="Saudi Arabia">Saudi Arabia</Option>
                            <Option value="Bahrain">Bahrain</Option>
                            <Option value="Oman">Oman</Option>
                            <Option value="Kuwait">Kuwait</Option>
                            <Option value="Qatar">Qatar</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                )}
              </>
            )}

            {/* STEP 4: Bank Details */}
            {currentStep === 4 && (
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item name="bankBeneficiary" label="Beneficiary Name" rules={[{ required: true }]}>
                    <Input placeholder="Company legal name" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="bankName" label="Bank Name" rules={[{ required: true }]}>
                    <Input placeholder="e.g. Emirates NBD" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="bankAccount" label="Account Number" rules={[{ required: true }]}>
                    <Input placeholder="12345678901234" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="bankIban" label="IBAN" rules={[{ required: true }]}>
                    <Input placeholder="AE123456789012345678901" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="bankSwift" label="SWIFT / BIC Code" rules={[{ required: true }]}>
                    <Input placeholder="e.g. EBILAEAD" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="bankBranch" label="Branch Name">
                    <Input placeholder="e.g. Downtown Branch" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="bankAccountType" label="Account Type">
                    <Select>
                      <Option value="Business Current">Business Current</Option>
                      <Option value="Business Savings">Business Savings</Option>
                      <Option value="Personal Current">Personal Current</Option>
                      <Option value="Personal Savings">Personal Savings</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            )}

            {/* STEP 5: Commission */}
            {currentStep === 5 && (
              <>
                <Title level={5}>Tier 1 — Up to 5M AED</Title>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={8}>
                    <Form.Item name="tier1Max" label="Max Loan Amount (AED)" rules={[{ required: true }]}>
                      <Input type="number" placeholder="5000000" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item name="tier1Pct" label="Commission %" rules={[{ required: true }]}>
                      <Input type="number" placeholder="75" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item name="tier1Desc" label="Description">
                      <Input placeholder="For loans up to 5M AED" />
                    </Form.Item>
                  </Col>
                </Row>

                <Title level={5}>Tier 2 — Above 5M AED</Title>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={8}>
                    <Form.Item name="tier2Min" label="Min Loan Amount (AED)" rules={[{ required: true }]}>
                      <Input type="number" placeholder="5000001" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item name="tier2Pct" label="Commission %" rules={[{ required: true }]}>
                      <Input type="number" placeholder="80" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item name="tier2Desc" label="Description">
                      <Input placeholder="For loans above 5M AED" />
                    </Form.Item>
                  </Col>
                </Row>

                <Title level={5}>Terms</Title>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Form.Item name="paymentTerms" label="Payment Terms" rules={[{ required: true }]}>
                      <Input placeholder="Net 30 days after disbursement" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="calculationBasis" label="Calculation Basis">
                      <Input placeholder="Percentage of Xoto's bank commission" />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}

            {/* STEP 6: Agreement */}
            {currentStep === 6 && (
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item name="agreementType" label="Agreement Type" rules={[{ required: true }]}>
                    <Input placeholder="Commercial Partnership Agreement" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="agreementStart" label="Start Date" rules={[{ required: true }]}>
                    <DatePicker style={{ width: "100%" }} format="DD-MMM-YYYY" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="agreementEnd" label="End Date" rules={[{ required: true }]}>
                    <DatePicker style={{ width: "100%" }} format="DD-MMM-YYYY" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="signedDate" label="Date Signed" rules={[{ required: true }]}>
                    <DatePicker style={{ width: "100%" }} format="DD-MMM-YYYY" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="signedByXoto" label="Signed By (Xoto)" rules={[{ required: true }]}>
                    <Input placeholder="Xoto Prophet LLC" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="signedByPartner" label="Signed By (Partner)" rules={[{ required: true }]}>
                    <Input placeholder="Company legal name" />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item name="documentUrl" label="Agreement Document URL">
                    <Input placeholder="https://storage.xoto.com/agreements/…" />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item name="autoRenew" valuePropName="checked">
                    <Checkbox>Auto-renew agreement</Checkbox>
                  </Form.Item>
                </Col>
              </Row>
            )}

            {/* STEP 7: Credentials */}
            {currentStep === 7 && (
              <>
                <div style={{ background: "#e6f7ff", padding: 12, borderRadius: 8, marginBottom: 24 }}>
                  <Text type="secondary">These credentials will be sent to the partner's primary contact email upon account creation.</Text>
                </div>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Form.Item name="email" label="Login Email Address" rules={[{ required: true, type: "email" }]}>
                      <Input placeholder="partner@company.com" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="username" label="Username" rules={[{ required: true }]}>
                      <Input placeholder="e.g. dubaire_brokers" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
                      <Input.Password placeholder="Min 6 characters" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="confirmPassword" label="Confirm Password" dependencies={["password"]} rules={[
                      { required: true },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue("password") === value) return Promise.resolve();
                          return Promise.reject("Passwords do not match");
                        },
                      }),
                    ]}>
                      <Input.Password placeholder="Re-enter password" />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}

            <Divider />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {currentStep > 0 && <Button onClick={back} icon={<ArrowLeftOutlined />}>Back</Button>}
              {currentStep < STEPS.length - 1
                ? <Button type="primary" onClick={next} icon={<ArrowRightOutlined />} style={{ marginLeft: "auto", background: BRAND_PURPLE }}>Continue</Button>
                : <Button type="primary" onClick={handleSubmit} loading={loading} icon={<CheckOutlined />} style={{ marginLeft: "auto", background: BRAND_PURPLE }}>Create Partner</Button>
              }
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
}