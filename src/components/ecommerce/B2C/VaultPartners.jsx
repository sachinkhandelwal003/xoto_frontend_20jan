// src/components/Vault/VaultPartners.jsx
import { useState } from "react";
import {
  Form, Input, Button, Card, Steps, Row, Col, DatePicker,
  Select, Checkbox, Space, Typography, Divider, message, Radio, Switch,
} from "antd";
import {
  BuildOutlined, UserOutlined, TeamOutlined, EnvironmentOutlined,
  CreditCardOutlined, PercentageOutlined, FileTextOutlined, KeyOutlined,
  ArrowLeftOutlined, ArrowRightOutlined, CheckOutlined, CopyOutlined,
  IdcardOutlined, TagsOutlined,
} from "@ant-design/icons";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import PartnerList from "./PartnerList";

const { Title, Text } = Typography;
const { Step } = Steps;
const { Option } = Select;

const P  = "#5C039B";
const PM = "#7C3AED";
const PL = "#F5F0FF";

// ─── Steps config ─────────────────────────────────────────────────────────────
const STEPS = [
  { title: "Category",    icon: <TagsOutlined /> },
  { title: "Company",     icon: <BuildOutlined /> },      // hidden for individual
  { title: "Primary",     icon: <UserOutlined /> },
  { title: "Secondary",   icon: <TeamOutlined /> },
  { title: "Address",     icon: <EnvironmentOutlined /> },
  { title: "Bank",        icon: <CreditCardOutlined /> },
  { title: "Commission",  icon: <PercentageOutlined /> },
  { title: "Agreement",   icon: <FileTextOutlined /> },
  { title: "Credentials", icon: <KeyOutlined /> },
];

// Steps that appear for "individual" (skip Company step index 1)
const INDIVIDUAL_STEPS = [0, 2, 3, 4, 5, 6, 7, 8];
const COMPANY_STEPS    = [0, 1, 2, 3, 4, 5, 6, 7, 8];

export default function VaultPartners() {
  const [mode, setMode]               = useState("onboard");
  const [form]                        = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading]         = useState(false);
  const [done, setDone]               = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(false);
  const [partnerCategory, setPartnerCategory] = useState("company"); // "company" | "individual"

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // ── Visible steps based on category ────────────────────────────────────────
  const visibleSteps = partnerCategory === "individual" ? INDIVIDUAL_STEPS : COMPANY_STEPS;
  const totalVisible = visibleSteps.length;

  // currentStep is an index into visibleSteps
  const realStepIndex = visibleSteps[currentStep]; // maps to STEPS array

  // ── Validate current visible step ──────────────────────────────────────────
  const validateStep = async () => {
    try {
      let fields = [];

      if (realStepIndex === 0) {
        // category — always valid (radio pre-selected)
        fields = [];
      } else if (realStepIndex === 1) {
        // Company info (company only)
        fields = ["companyName", "tradeLicenseNumber", "tradeLicenseIssueDate", "tradeLicenseExpiryDate"];
      } else if (realStepIndex === 2) {
        // Individual details step is step 1 for individuals (realStepIndex === 2 = Primary Contact, but for individual step 0 is category, step 1 is Primary...)
        // Wait: for individual, visibleSteps = [0,2,3,4,5,6,7,8], so:
        //   currentStep 0 → realStepIndex 0 (Category)
        //   currentStep 1 → realStepIndex 2 (Primary Contact)
        // For company: currentStep 1 → realStepIndex 1 (Company)
        fields = ["primaryName", "primaryDesignation", "primaryEmail", "primaryPhone", "primaryEmiratesId"];
      } else if (realStepIndex === 3) {
        fields = []; // Secondary optional
      } else if (realStepIndex === 4) {
        fields = ["billBuilding", "billArea", "billCity", "billCountry"];
        if (!sameAsShipping) fields.push("shipBuilding", "shipArea", "shipCity", "shipCountry");
      } else if (realStepIndex === 5) {
        fields = ["bankBeneficiary", "bankName", "bankAccount", "bankIban", "bankSwift"];
      } else if (realStepIndex === 6) {
        fields = ["tier1Max", "tier1Pct", "tier2Min", "tier2Pct", "paymentTerms"];
      } else if (realStepIndex === 7) {
        fields = ["agreementType", "agreementStart", "agreementEnd", "signedByXoto", "signedByPartner", "signedDate"];
      } else if (realStepIndex === 8) {
        fields = ["email", "password", "confirmPassword"];
      }

      // Extra: individual details on step 1 for individuals (realStepIndex 1 doesn't exist for individual,
      // but we added individual fields inside category step or as a sub-section)
      // We handle individualDetails validation separately below.
      if (partnerCategory === "individual" && realStepIndex === 0) {
        fields = ["indFirstName", "indLastName", "indEmiratesId", "indNationality", "indDob", "indGender"];
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
      setCurrentStep((p) => p + 1);
      scrollToTop();
    }
  };
  const back = () => {
    setCurrentStep((p) => p - 1);
    scrollToTop();
  };

  // ── Parse phone → { countryCode, phone } ───────────────────────────────────
  const parsePhone = (fullNumber, dialCode) => {
    if (!fullNumber) return { countryCode: "", phone: "" };
    const code = dialCode ? `+${dialCode}` : "+971";
    const number = fullNumber.startsWith(dialCode)
      ? fullNumber.slice(dialCode.length)
      : fullNumber;
    return { countryCode: code, phone: number };
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!await validateStep()) return;
    setLoading(true);
    try {
      const v = form.getFieldsValue(true);

      const primaryParsed   = parsePhone(v.primaryPhone,   v.primaryDialCode);
      const secondaryParsed = parsePhone(v.secondaryPhone, v.secondaryDialCode);

      const billingAddress = {
        buildingName: v.billBuilding,
        floorUnit:    v.billFloor,
        area:         v.billArea,
        city:         v.billCity,
        poBox:        v.billPoBox,
        country:      v.billCountry,
      };

      const payload = {
        partnerCategory,

        // ── Company-only fields ──
        ...(partnerCategory === "company" && {
          companyName:           v.companyName,
          legalEntityType:       v.legalEntityType,
          tradeLicenseNumber:    v.tradeLicenseNumber,
          tradeLicenseIssueDate: v.tradeLicenseIssueDate?.toISOString() ?? null,
          tradeLicenseExpiryDate:v.tradeLicenseExpiryDate?.toISOString() ?? null,
        }),

        // ── Individual-only fields ──
        ...(partnerCategory === "individual" && {
          individualDetails: {
            firstName:   v.indFirstName,
            lastName:    v.indLastName,
            emiratesId:  v.indEmiratesId,
            nationality: v.indNationality,
            dateOfBirth: v.indDob?.toISOString() ?? null,
            gender:      v.indGender,
          },
        }),

        // ── Common fields ──
        isOfflineAgreement:    !!v.isOfflineAgreement,
        taxRegistrationNumber: v.taxRegistrationNumber,
        dbaName:               v.dbaName,
        website:               v.website,
        yearEstablished:       Number(v.yearEstablished) || undefined,
        numberOfBranches:      Number(v.numberOfBranches) || undefined,

        primaryContact: {
          name:             v.primaryName,
          designation:      v.primaryDesignation,
          email:            v.primaryEmail,
          countryCode:      primaryParsed.countryCode,
          phone:            primaryParsed.phone,
          alternativePhone: v.primaryAltPhone,
          whatsappNumber:   v.primaryWhatsapp,
          emiratesId:       v.primaryEmiratesId,
        },

        secondaryContact: {
          name:             v.secondaryName,
          designation:      v.secondaryDesignation,
          email:            v.secondaryEmail,
          countryCode:      secondaryParsed.countryCode,
          phone:            secondaryParsed.phone,
          alternativePhone: v.secondaryAltPhone,
          whatsappNumber:   v.secondaryWhatsapp,
          emiratesId:       v.secondaryEmiratesId,
        },

        billingAddress,
        shippingAddress: sameAsShipping ? billingAddress : {
          buildingName: v.shipBuilding,
          floorUnit:    v.shipFloor,
          area:         v.shipArea,
          city:         v.shipCity,
          poBox:        v.shipPoBox,
          country:      v.shipCountry,
        },

        bankDetails: {
          beneficiaryName: v.bankBeneficiary,
          bankName:        v.bankName,
          accountNumber:   v.bankAccount,
          iban:            v.bankIban,
          swiftCode:       v.bankSwift,
          branchName:      v.bankBranch,
          accountType:     v.bankAccountType,
          verified:        false,
        },

        commissionConfiguration: {
          tier1: {
            loanAmountMax:         Number(v.tier1Max),
            commissionPercentage:  Number(v.tier1Pct),
            description:           v.tier1Desc,
          },
          tier2: {
            loanAmountMin:         Number(v.tier2Min),
            commissionPercentage:  Number(v.tier2Pct),
            description:           v.tier2Desc,
          },
          paymentTerms:      v.paymentTerms,
          calculationBasis:  v.calculationBasis,
        },

        agreementDetails: {
          agreementType:    v.agreementType,
          startDate:        v.agreementStart?.toISOString() ?? null,
          endDate:          v.agreementEnd?.toISOString() ?? null,
          autoRenew:        !!v.autoRenew,
          signedByXoto:     v.signedByXoto,
          signedByPartner:  v.signedByPartner,
          signedDate:       v.signedDate?.toISOString() ?? null,
          documentUrl:      v.documentUrl,
        },

        email:    v.email,
        password: v.password,
      };

      const response = await apiService.post("/vault/partner/create", payload);
      if (response?.success || response?.data) {
        setDone(true);
      } else {
        throw new Error(response?.message || "Something went wrong");
      }
    } catch (err) {
      message.error(err?.response?.data?.message || err.message || "API Error");
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (done) {
    return (
      <div style={{ minHeight: "100vh", background: "#F5F7FA", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Card style={{ maxWidth: 500, width: "100%", textAlign: "center", borderRadius: 20 }}>
          <div style={{ width: 70, height: 70, background: P, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <CheckOutlined style={{ fontSize: 32, color: "#fff" }} />
          </div>
          <Title level={3}>Partner Created!</Title>
          <Text type="secondary">The partner has been successfully onboarded.</Text>
          <Divider />
          <Space direction="vertical" style={{ width: "100%" }}>
            <Button block onClick={() => { setDone(false); setCurrentStep(0); form.resetFields(); setSameAsShipping(false); setPartnerCategory("company"); }}>
              Onboard Another
            </Button>
            <Button type="primary" block onClick={() => setMode("list")} style={{ background: P }}>
              View Partners
            </Button>
          </Space>
        </Card>
      </div>
    );
  }

  if (mode === "list") return <PartnerList />;

  // ── Step label for display ─────────────────────────────────────────────────
  const displaySteps = visibleSteps.map((si) => STEPS[si]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: "#F5F7FA", minHeight: "100vh", padding: 24 }}>
      <style>{`
        .vp-form .ant-form-item-label > label { font-weight: 600; color: #1a0533; }
        .vp-form .ant-input, .vp-form .ant-picker, .vp-form .ant-select-selector {
          border-radius: 10px !important;
          border-color: #e8dff5 !important;
        }
        .vp-form .ant-input:focus, .vp-form .ant-picker-focused,
        .vp-form .ant-select-focused .ant-select-selector {
          border-color: ${P} !important;
          box-shadow: 0 0 0 3px rgba(92,3,155,0.1) !important;
        }
        .vp-form .react-tel-input .form-control {
          border-radius: 10px !important;
          border-color: #e8dff5 !important;
          height: 40px !important;
        }
        .vp-form .react-tel-input .form-control:focus {
          border-color: ${P} !important;
          box-shadow: 0 0 0 3px rgba(92,3,155,0.1) !important;
        }
        .vp-cat-radio .ant-radio-button-wrapper {
          height: 90px !important;
          line-height: normal !important;
          padding: 0 !important;
          border-radius: 14px !important;
          border: 2px solid #e8dff5 !important;
          overflow: hidden;
        }
        .vp-cat-radio .ant-radio-button-wrapper-checked {
          border-color: ${P} !important;
          background: ${PL} !important;
          color: ${P} !important;
        }
        .vp-cat-radio .ant-radio-button-wrapper:first-child,
        .vp-cat-radio .ant-radio-button-wrapper:last-child { border-radius: 14px !important; }
        .vp-cat-radio .ant-radio-button-wrapper::before { display: none !important; }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Card style={{ borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div>
              <Title level={2} style={{ marginBottom: 4, color: "#1a0533" }}>Onboard New Partner</Title>
              <Text type="secondary">Fill in all sections to create a partner account</Text>
            </div>
            <Button onClick={() => setMode("list")} icon={<TeamOutlined />}>View Partners</Button>
          </div>

          {/* Steps */}
          <Steps current={currentStep} style={{ marginBottom: 36 }} size="small">
            {displaySteps.map((step, idx) => (
              <Step key={idx} title={step.title} icon={step.icon} />
            ))}
          </Steps>

          <Form
            className="vp-form"
            form={form}
            layout="vertical"
            initialValues={{
              legalEntityType:  "LLC",
              billCity:         "Dubai",
              billCountry:      "UAE",
              shipCity:         "Dubai",
              shipCountry:      "UAE",
              bankAccountType:  "Business Current",
              tier1Max:         "5000000",
              tier1Pct:         "80",
              tier1Desc:        "For loans up to 5M AED",
              tier2Min:         "5000001",
              tier2Pct:         "85",
              tier2Desc:        "For loans above 5M AED",
              paymentTerms:     "Net 30 days after disbursement",
              calculationBasis: "Percentage of Xoto's bank commission",
              agreementType:    "Commercial Partnership Agreement",
              signedByXoto:     "Xoto Prophet LLC",
              autoRenew:        true,
              isOfflineAgreement: false,
            }}
          >

            {/* ════════════════════════════════════════════════════════════
                STEP 0 — Category + (Individual details if individual)
            ════════════════════════════════════════════════════════════ */}
            {realStepIndex === 0 && (
              <>
                {/* Category selector */}
                <div style={{ marginBottom: 28 }}>
                  <label style={{ fontWeight: 700, color: "#1a0533", fontSize: 15, display: "block", marginBottom: 12 }}>
                    Partner Category <span style={{ color: RD }}>*</span>
                  </label>
                  <Radio.Group
                    className="vp-cat-radio"
                    value={partnerCategory}
                    onChange={(e) => {
                      setPartnerCategory(e.target.value);
                      // reset to step 0 in case steps count changes
                      setCurrentStep(0);
                    }}
                    optionType="button"
                  >
                    <Space size={16}>
                      <Radio.Button value="company" style={{ width: 200 }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 86, gap: 6 }}>
                          <BuildOutlined style={{ fontSize: 28, color: partnerCategory === "company" ? P : "#9ca3af" }} />
                          <span style={{ fontWeight: 700, fontSize: 14 }}>Company</span>
                          <span style={{ fontSize: 11, color: "#9ca3af", lineHeight: 1.3, textAlign: "center" }}>LLC, FZE, PJSC etc.</span>
                        </div>
                      </Radio.Button>
                      <Radio.Button value="individual" style={{ width: 200 }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 86, gap: 6 }}>
                          <UserOutlined style={{ fontSize: 28, color: partnerCategory === "individual" ? P : "#9ca3af" }} />
                          <span style={{ fontWeight: 700, fontSize: 14 }}>Individual</span>
                          <span style={{ fontSize: 11, color: "#9ca3af", lineHeight: 1.3, textAlign: "center" }}>Sole consultant / agent</span>
                        </div>
                      </Radio.Button>
                    </Space>
                  </Radio.Group>
                </div>

                <Divider style={{ borderColor: "#f0e8ff" }} />

                {/* ── Individual Details (shown only when individual) ── */}
                {partnerCategory === "individual" && (
                  <>
                    <Title level={5} style={{ color: P, marginBottom: 16 }}>Individual Details</Title>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12}>
                        <Form.Item name="indFirstName" label="First Name" rules={[{ required: true }]}>
                          <Input placeholder="Ahmed" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="indLastName" label="Last Name" rules={[{ required: true }]}>
                          <Input placeholder="Al Mansouri" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="indEmiratesId" label="Emirates ID" rules={[{ required: true }]}>
                          <Input placeholder="784-1990-1234567-1" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="indNationality" label="Nationality" rules={[{ required: true }]}>
                          <Input placeholder="United Arab Emirates" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="indDob" label="Date of Birth" rules={[{ required: true }]}>
                          <DatePicker style={{ width: "100%" }} format="DD-MMM-YYYY" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="indGender" label="Gender" rules={[{ required: true }]}>
                          <Select placeholder="Select gender">
                            <Option value="Male">Male</Option>
                            <Option value="Female">Female</Option>
                            <Option value="Other">Other</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Divider style={{ borderColor: "#f0e8ff" }} />
                  </>
                )}

                {/* ── Common optional fields (both types) ── */}
                <Title level={5} style={{ color: P, marginBottom: 16 }}>General Info</Title>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Form.Item name="taxRegistrationNumber" label="Tax Registration Number (TRN)">
                      <Input placeholder="TRN-1234567890" />
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
                      <Input type="number" placeholder="e.g. 2018" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="numberOfBranches" label="Number of Branches">
                      <Input type="number" placeholder="e.g. 1" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="isOfflineAgreement" label="Offline Agreement?" valuePropName="checked">
                      <Switch checkedChildren="Yes" unCheckedChildren="No" />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}

            {/* ════════════════════════════════════════════════════════════
                STEP 1 (Company only) — Company Info
            ════════════════════════════════════════════════════════════ */}
            {realStepIndex === 1 && (
              <>
                <Title level={5} style={{ color: P, marginBottom: 16 }}>Company Information</Title>
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
                      <Input placeholder="e.g. 1234567890" />
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
                </Row>
              </>
            )}

            {/* ════════════════════════════════════════════════════════════
                Primary Contact
            ════════════════════════════════════════════════════════════ */}
            {realStepIndex === 2 && (
              <>
                <Title level={5} style={{ color: P, marginBottom: 16 }}>Primary Contact</Title>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Form.Item name="primaryName" label="Full Name" rules={[{ required: true }]}>
                      <Input placeholder="Mohammed Ahmed Al Mansouri" />
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
                      <Input placeholder="784-1980-1234567-1" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="primaryPhone" label="Phone Number" rules={[{ required: true }]}>
                      <PhoneInput
                        country="ae"
                        enableSearch
                        inputStyle={{ width: "100%", borderRadius: 10, height: 40 }}
                        onChange={(value, data) => {
                          form.setFieldValue("primaryDialCode", data.dialCode);
                          form.setFieldValue("primaryPhone", value);
                        }}
                      />
                    </Form.Item>
                    <Form.Item name="primaryDialCode" hidden><Input /></Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="primaryAltPhone" label="Alternative Phone">
                      <PhoneInput country="ae" enableSearch inputStyle={{ width: "100%", borderRadius: 10, height: 40 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="primaryWhatsapp" label="WhatsApp Number">
                      <Input placeholder="501234567" prefix={<span style={{ color: "#25D366" }}>+971</span>} />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}

            {/* ════════════════════════════════════════════════════════════
                Secondary Contact
            ════════════════════════════════════════════════════════════ */}
            {realStepIndex === 3 && (
              <>
                <div style={{ background: "#e6f7ff", padding: "10px 14px", borderRadius: 10, marginBottom: 20 }}>
                  <Text type="secondary">Secondary contact is optional but recommended for operational continuity.</Text>
                </div>
                <Title level={5} style={{ color: P, marginBottom: 16 }}>Secondary Contact</Title>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Form.Item name="secondaryName" label="Full Name"><Input placeholder="Fatima Hassan Al Qasimi" /></Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="secondaryDesignation" label="Designation"><Input placeholder="Operations Manager" /></Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="secondaryEmail" label="Email Address" rules={[{ type: "email" }]}>
                      <Input placeholder="fatima@company.ae" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="secondaryEmiratesId" label="Emirates ID"><Input placeholder="784-1985-8765432-1" /></Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="secondaryPhone" label="Phone Number">
                      <PhoneInput
                        country="ae"
                        enableSearch
                        inputStyle={{ width: "100%", borderRadius: 10, height: 40 }}
                        onChange={(value, data) => {
                          form.setFieldValue("secondaryDialCode", data.dialCode);
                          form.setFieldValue("secondaryPhone", value);
                        }}
                      />
                    </Form.Item>
                    <Form.Item name="secondaryDialCode" hidden><Input /></Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="secondaryAltPhone" label="Alternative Phone">
                      <PhoneInput country="ae" enableSearch inputStyle={{ width: "100%", borderRadius: 10, height: 40 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="secondaryWhatsapp" label="WhatsApp Number">
                      <Input placeholder="507654321" prefix={<span style={{ color: "#25D366" }}>+971</span>} />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}

            {/* ════════════════════════════════════════════════════════════
                Address
            ════════════════════════════════════════════════════════════ */}
            {realStepIndex === 4 && (
              <>
                <Title level={5} style={{ color: P, marginBottom: 16 }}>Billing Address</Title>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Form.Item name="billBuilding" label="Building Name" rules={[{ required: true }]}><Input placeholder="Boulevard Plaza Tower 1" /></Form.Item>
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
                        {["UAE","Saudi Arabia","Bahrain","Oman","Kuwait","Qatar"].map(c => <Option key={c} value={c}>{c}</Option>)}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Checkbox
                  checked={sameAsShipping}
                  onChange={(e) => setSameAsShipping(e.target.checked)}
                  style={{ margin: "16px 0", fontWeight: 600 }}
                >
                  <CopyOutlined /> Shipping address same as billing
                </Checkbox>

                {!sameAsShipping && (
                  <>
                    <Title level={5} style={{ color: P, marginBottom: 16, marginTop: 8 }}>Shipping Address</Title>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12}>
                        <Form.Item name="shipBuilding" label="Building Name" rules={[{ required: !sameAsShipping }]}><Input placeholder="Al Nahda Tower" /></Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="shipFloor" label="Floor / Unit"><Input placeholder="Floor 8, Office 803" /></Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="shipArea" label="Area" rules={[{ required: !sameAsShipping }]}><Input placeholder="Al Nahda" /></Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="shipCity" label="City" rules={[{ required: !sameAsShipping }]}><Input placeholder="Dubai" /></Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="shipPoBox" label="PO Box"><Input placeholder="54321" /></Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="shipCountry" label="Country" rules={[{ required: !sameAsShipping }]}>
                          <Select>
                            {["UAE","Saudi Arabia","Bahrain","Oman","Kuwait","Qatar"].map(c => <Option key={c} value={c}>{c}</Option>)}
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                )}
              </>
            )}

            {/* ════════════════════════════════════════════════════════════
                Bank Details
            ════════════════════════════════════════════════════════════ */}
            {realStepIndex === 5 && (
              <>
                <Title level={5} style={{ color: P, marginBottom: 16 }}>Bank Details</Title>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Form.Item name="bankBeneficiary" label="Beneficiary Name" rules={[{ required: true }]}>
                      <Input placeholder="Company or individual legal name" />
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
                      <Input placeholder="e.g. Downtown Dubai Branch" />
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
              </>
            )}

            {/* ════════════════════════════════════════════════════════════
                Commission Configuration
            ════════════════════════════════════════════════════════════ */}
            {realStepIndex === 6 && (
              <>
                <Title level={5} style={{ color: P, marginBottom: 16 }}>Tier 1 — Up to 5M AED</Title>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={8}>
                    <Form.Item name="tier1Max" label="Max Loan Amount (AED)" rules={[{ required: true }]}>
                      <Input type="number" placeholder="5000000" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item name="tier1Pct" label="Commission %" rules={[{ required: true }]}>
                      <Input type="number" placeholder="80" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item name="tier1Desc" label="Description">
                      <Input placeholder="For loans up to 5M AED" />
                    </Form.Item>
                  </Col>
                </Row>

                <Title level={5} style={{ color: P, marginBottom: 16, marginTop: 8 }}>Tier 2 — Above 5M AED</Title>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={8}>
                    <Form.Item name="tier2Min" label="Min Loan Amount (AED)" rules={[{ required: true }]}>
                      <Input type="number" placeholder="5000001" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item name="tier2Pct" label="Commission %" rules={[{ required: true }]}>
                      <Input type="number" placeholder="85" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item name="tier2Desc" label="Description">
                      <Input placeholder="For loans above 5M AED" />
                    </Form.Item>
                  </Col>
                </Row>

                <Title level={5} style={{ color: P, marginBottom: 16, marginTop: 8 }}>Payment Terms</Title>
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

            {/* ════════════════════════════════════════════════════════════
                Agreement
            ════════════════════════════════════════════════════════════ */}
            {realStepIndex === 7 && (
              <>
                <Title level={5} style={{ color: P, marginBottom: 16 }}>Agreement Details</Title>
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
                      <Input placeholder="Company / individual legal name" />
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
              </>
            )}

            {/* ════════════════════════════════════════════════════════════
                Credentials
            ════════════════════════════════════════════════════════════ */}
            {realStepIndex === 8 && (
              <>
                <div style={{ background: "#e6f7ff", padding: "10px 14px", borderRadius: 10, marginBottom: 20 }}>
                  <Text type="secondary">
                    These credentials will be sent to the partner's primary contact email upon account creation.
                  </Text>
                </div>
                <Title level={5} style={{ color: P, marginBottom: 16 }}>Login Credentials</Title>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Form.Item name="email" label="Login Email Address" rules={[{ required: true, type: "email" }]}>
                      <Input placeholder="partner@company.ae" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="password" label="Password" rules={[{ required: true, min: 8, message: "Min 8 characters" }]}>
                      <Input.Password placeholder="Min 8 characters" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="confirmPassword"
                      label="Confirm Password"
                      dependencies={["password"]}
                      rules={[
                        { required: true },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue("password") === value) return Promise.resolve();
                            return Promise.reject("Passwords do not match");
                          },
                        }),
                      ]}
                    >
                      <Input.Password placeholder="Re-enter password" />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}

            {/* ── Navigation ─────────────────────────────────────────── */}
            <Divider style={{ borderColor: "#f0e8ff" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {currentStep > 0
                ? <Button onClick={back} icon={<ArrowLeftOutlined />}>Back</Button>
                : <span />
              }
              {currentStep < totalVisible - 1
                ? (
                  <Button
                    type="primary"
                    onClick={next}
                    icon={<ArrowRightOutlined />}
                    style={{ marginLeft: "auto", background: P, borderColor: P }}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    onClick={handleSubmit}
                    loading={loading}
                    icon={<CheckOutlined />}
                    style={{ marginLeft: "auto", background: P, borderColor: P }}
                  >
                    Create Partner
                  </Button>
                )
              }
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
}

// Missing constant — add it
const RD = "#EF4444";