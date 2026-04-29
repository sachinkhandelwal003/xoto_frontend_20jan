// src/components/Vault/VaultPartners.jsx
import React, { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Typography,
  Space,
  message,
  Select,
  DatePicker,
  InputNumber,
  Divider,
  Upload,
  Switch,
  Checkbox,
  Modal,
  Tooltip,
  Radio,
  Avatar,
  Spin,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  IdcardOutlined,
  CheckOutlined,
  UploadOutlined,
  BuildOutlined,
  EnvironmentOutlined,
  CreditCardOutlined,
  PercentageOutlined,
  FileTextOutlined,
  KeyOutlined,
  EyeOutlined,
  SaveOutlined,
  RollbackOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  TeamOutlined,
  CopyOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Country } from "country-state-city";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import PartnerList from "./PartnerList";

const { Title, Text } = Typography;
const { Option } = Select;

const BRAND_PURPLE = "#5C039B";
const BRAND_LIGHT = "#f3e8ff";
const SUCCESS_GREEN = "#10b981";

const TooltipInfo = ({ title }) => (
  <Tooltip title={title}>
    <InfoCircleOutlined style={{ color: "#94a3b8", marginLeft: 6, fontSize: 12, cursor: "help" }} />
  </Tooltip>
);

export default function VaultPartners() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("onboard");
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [partnerCategory, setPartnerCategory] = useState("company");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [profileUrl, setProfileUrl] = useState("");
  const [uploadingProfile, setUploadingProfile] = useState(false);

  // Country options for phone with Ant Design Select
  const countryOptions = useMemo(() => {
    const priorityIsoCodes = ["AE", "IN", "SA", "US", "GB", "AU"];
    return Country.getAllCountries()
      .map((country) => ({
        name: country.name,
        code: country.phonecode,
        iso: country.isoCode,
        flag: `https://flagcdn.com/w20/${country.isoCode.toLowerCase()}.png`,
      }))
      .sort((a, b) => {
        const aPriority = priorityIsoCodes.includes(a.iso);
        const bPriority = priorityIsoCodes.includes(b.iso);
        if (aPriority && !bPriority) return -1;
        if (!aPriority && bPriority) return 1;
        return a.name.localeCompare(b.name);
      });
  }, []);

  const NATIONALITIES = [
    "United Arab Emirates",
    "Saudi Arabia",
    "India",
    "Pakistan",
    "Egypt",
    "Jordan",
    "Lebanon",
    "Philippines",
    "United Kingdom",
    "United States",
    "Australia",
    "Canada",
    "Germany",
    "France",
    "Other",
  ];

  // Profile photo upload handler
  const handleProfileUpload = async (file) => {
    setUploadingProfile(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiService.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedUrl =
        response?.data?.file?.url ||
        response?.file?.url ||
        response?.data?.url ||
        response?.url ||
        response?.data?.fileUrl ||
        "";

      if (uploadedUrl) {
        setProfileUrl(uploadedUrl);
        message.success("Profile photo uploaded successfully!");
      } else {
        message.error("Upload failed: no URL returned.");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      message.error("Failed to upload profile photo.");
    } finally {
      setUploadingProfile(false);
    }

    return false;
  };

  const parsePhone = (fullNumber, dialCode) => {
    if (!fullNumber) return { countryCode: "", phone: "" };
    const code = dialCode ? `+${dialCode}` : "+971";
    const number = fullNumber.startsWith(dialCode) ? fullNumber.slice(dialCode.length) : fullNumber;
    return { countryCode: code, phone: number };
  };

  const getPreviewDataFromForm = () => {
    const v = form.getFieldsValue(true);
    return {
      partnerCategory,
      profilePic: profileUrl,
      ...(partnerCategory === "company" && {
        companyName: v.companyName || "Not provided",
        tradeLicenseNumber: v.tradeLicenseNumber || "Not provided",
        tradeLicenseExpiryDate: v.tradeLicenseExpiryDate?.format("DD/MM/YYYY") || "Not provided",
      }),
      ...(partnerCategory === "individual" && {
        indFullName: `${v.indFirstName || ""} ${v.indLastName || ""}`.trim() || "Not provided",
        indEmiratesId: v.indEmiratesId || "Not provided",
        indNationality: v.indNationality || "Not provided",
      }),
      primaryName: v.primaryName || "Not provided",
      primaryEmail: v.primaryEmail || "Not provided",
      primaryPhone: v.primaryPhone || "Not provided",
      bankName: v.bankName || "Not provided",
      bankIban: v.bankIban || "Not provided",
      bankSwift: v.bankSwift || "Not provided",
      tier1Max: v.tier1Max || "Not set",
      tier1Pct: v.tier1Pct || "Not set",
      tier2Min: v.tier2Min || "Not set",
      tier2Pct: v.tier2Pct || "Not set",
      paymentTerms: v.paymentTerms || "Not set",
      agreementType: v.agreementType || "Not provided",
      email: v.email || "Not provided",
      password: v.password ? "••••••••" : "Not set",
    };
  };

  const showPreview = async () => {
    try {
      await form.validateFields();
      if (!profileUrl) {
        message.warning("Please upload a profile photo");
        return;
      }
      setPreviewData(getPreviewDataFromForm());
      setPreviewVisible(true);
    } catch {
      message.error("Please fill all required fields correctly");
    }
  };

  const handleSubmit = async (values) => {
    if (!profileUrl) {
      message.error("Please upload a profile photo");
      return;
    }

    setLoading(true);
    try {
      const v = values || form.getFieldsValue(true);
      const primaryParsed = parsePhone(v.primaryPhone, v.primaryDialCode);
      const secondaryParsed = parsePhone(v.secondaryPhone, v.secondaryDialCode);

      const billingAddress = {
        buildingName: v.billBuilding,
        floorUnit: v.billFloor,
        area: v.billArea,
        city: v.billCity,
        poBox: v.billPoBox,
        country: v.billCountry,
      };

      const payload = {
        partnerCategory,
        profilePic: profileUrl,
        ...(partnerCategory === "company" && {
          companyName: v.companyName,
          legalEntityType: v.legalEntityType,
          tradeLicenseNumber: v.tradeLicenseNumber,
          tradeLicenseIssueDate: v.tradeLicenseIssueDate?.toISOString() ?? null,
          tradeLicenseExpiryDate: v.tradeLicenseExpiryDate?.toISOString() ?? null,
        }),
        ...(partnerCategory === "individual" && {
          individualDetails: {
            firstName: v.indFirstName,
            lastName: v.indLastName,
            emiratesId: v.indEmiratesId,
            nationality: v.indNationality,
            dateOfBirth: v.indDob?.toISOString() ?? null,
            gender: v.indGender,
          },
        }),
        taxRegistrationNumber: v.taxRegistrationNumber,
        dbaName: v.dbaName,
        website: v.website,
        yearEstablished: v.yearEstablished ? Number(v.yearEstablished) : undefined,
        numberOfBranches: v.numberOfBranches ? Number(v.numberOfBranches) : undefined,
        isOfflineAgreement: !!v.isOfflineAgreement,
        primaryContact: {
          name: v.primaryName,
          designation: v.primaryDesignation,
          email: v.primaryEmail,
          countryCode: primaryParsed.countryCode,
          phone: primaryParsed.phone,
          alternativePhone: v.primaryAltPhone,
          whatsappNumber: v.primaryWhatsapp,
          emiratesId: v.primaryEmiratesId,
        },
        secondaryContact: v.secondaryName ? {
          name: v.secondaryName,
          designation: v.secondaryDesignation,
          email: v.secondaryEmail,
          countryCode: secondaryParsed.countryCode,
          phone: secondaryParsed.phone,
          alternativePhone: v.secondaryAltPhone,
          whatsappNumber: v.secondaryWhatsapp,
          emiratesId: v.secondaryEmiratesId,
        } : null,
        billingAddress,
        shippingAddress: sameAsShipping ? billingAddress : {
          buildingName: v.shipBuilding,
          floorUnit: v.shipFloor,
          area: v.shipArea,
          city: v.shipCity,
          poBox: v.shipPoBox,
          country: v.shipCountry,
        },
        bankDetails: {
          beneficiaryName: v.bankBeneficiary,
          bankName: v.bankName,
          accountNumber: v.bankAccount,
          iban: v.bankIban,
          swiftCode: v.bankSwift,
          branchName: v.bankBranch,
          accountType: v.bankAccountType,
          verified: false,
        },
        commissionConfiguration: {
          tier1: {
            loanAmountMax: Number(v.tier1Max),
            commissionPercentage: Number(v.tier1Pct),
            description: v.tier1Desc,
          },
          tier2: {
            loanAmountMin: Number(v.tier2Min),
            commissionPercentage: Number(v.tier2Pct),
            description: v.tier2Desc,
          },
          paymentTerms: v.paymentTerms,
          calculationBasis: v.calculationBasis,
        },
        agreementDetails: {
          agreementType: v.agreementType,
          startDate: v.agreementStart?.toISOString() ?? null,
          endDate: v.agreementEnd?.toISOString() ?? null,
          autoRenew: !!v.autoRenew,
          signedByXoto: v.signedByXoto,
          signedByPartner: v.signedByPartner,
          signedDate: v.signedDate?.toISOString() ?? null,
          documentUrl: v.documentUrl,
        },
        email: v.email,
        password: v.password,
      };

      const response = await apiService.post("/vault/partner/create", payload);
      if (response?.success || response?.data) {
        message.success({ content: "Partner created successfully!", icon: <CheckOutlined style={{ color: SUCCESS_GREEN }} /> });
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

  const confirmSubmit = () => {
    setPreviewVisible(false);
    handleSubmit();
  };

  const PreviewModal = () => (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: BRAND_LIGHT, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <EyeOutlined style={{ fontSize: 20, color: BRAND_PURPLE }} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Review Partner Details</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>Please verify all information before submitting</div>
          </div>
        </div>
      }
      open={previewVisible}
      onCancel={() => setPreviewVisible(false)}
      width={800}
      footer={[
        <Button key="back" icon={<RollbackOutlined />} onClick={() => setPreviewVisible(false)}>Edit</Button>,
        <Button key="submit" type="primary" icon={<SaveOutlined />} onClick={confirmSubmit} loading={loading} style={{ background: BRAND_PURPLE }}>Confirm & Create</Button>,
      ]}
      bodyStyle={{ maxHeight: "65vh", overflowY: "auto" }}
    >
      {previewData && (
        <div style={{ padding: "8px 0" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <Avatar
              size={80}
              src={previewData.profilePic}
              icon={<UserOutlined />}
              style={{ border: `3px solid ${BRAND_PURPLE}`, marginBottom: 12 }}
            />
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 20px", borderRadius: 40, background: BRAND_LIGHT }}>
              {previewData.partnerCategory === "company" ? <BuildOutlined style={{ color: BRAND_PURPLE }} /> : <UserOutlined style={{ color: BRAND_PURPLE }} />}
              <span style={{ fontWeight: 700, color: BRAND_PURPLE }}>{previewData.partnerCategory === "company" ? "Company Partner" : "Individual Partner"}</span>
            </div>
          </div>
          <Divider />
          <Row gutter={[24, 16]}>
            <Col xs={24} md={12}>
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: "12px 16px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8" }}>{previewData.partnerCategory === "company" ? "Company Information" : "Individual Information"}</div>
                <div style={{ marginTop: 12 }}>
                  {previewData.partnerCategory === "company" ? (
                    <>
                      <div>Company: <div style={{ fontWeight: 600 }}>{previewData.companyName}</div></div>
                      <div style={{ marginTop: 8 }}>License: <div style={{ fontWeight: 600 }}>{previewData.tradeLicenseNumber}</div></div>
                    </>
                  ) : (
                    <>
                      <div>Name: <div style={{ fontWeight: 600 }}>{previewData.indFullName}</div></div>
                      <div style={{ marginTop: 8 }}>Emirates ID: <div style={{ fontWeight: 600 }}>{previewData.indEmiratesId}</div></div>
                    </>
                  )}
                </div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: "12px 16px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8" }}>Primary Contact</div>
                <div style={{ marginTop: 12 }}>
                  <div>Name: <div style={{ fontWeight: 600 }}>{previewData.primaryName}</div></div>
                  <div style={{ marginTop: 8 }}>Email: <div style={{ fontWeight: 600 }}>{previewData.primaryEmail}</div></div>
                </div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div style={{ background: "#fef3c7", borderRadius: 12, padding: "12px 16px", border: "1px solid #fde68a" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#92400e" }}>Account Access</div>
                <div style={{ marginTop: 12 }}>
                  <div>Email: <div style={{ fontWeight: 600 }}>{previewData.email}</div></div>
                  <div style={{ marginTop: 8 }}>Password: <div style={{ fontWeight: 600, fontFamily: "monospace" }}>{previewData.password}</div></div>
                </div>
              </div>
            </Col>
          </Row>
          <Divider />
          <div style={{ textAlign: "center", padding: "12px", background: BRAND_LIGHT, borderRadius: 10 }}>
            <CheckOutlined style={{ color: BRAND_PURPLE, marginRight: 8 }} />
            <Text style={{ fontSize: 12, color: "#5c039b" }}>Please ensure all details are correct before submitting</Text>
          </div>
        </div>
      )}
    </Modal>
  );

  if (done) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Card style={{ maxWidth: 500, width: "100%", textAlign: "center", borderRadius: 20 }}>
          <div style={{ width: 70, height: 70, background: BRAND_PURPLE, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <CheckOutlined style={{ fontSize: 32, color: "#fff" }} />
          </div>
          <Title level={3}>Partner Created Successfully!</Title>
          <Text type="secondary">The partner has been onboarded. Credentials sent via email.</Text>
          <Divider />
          <Space direction="vertical" style={{ width: "100%" }}>
            <Button block onClick={() => { setDone(false); form.resetFields(); setSameAsShipping(true); setPartnerCategory("company"); setProfileUrl(""); }}>Onboard Another</Button>
            <Button type="primary" block onClick={() => setMode("list")} style={{ background: BRAND_PURPLE }}>View Partners</Button>
          </Space>
        </Card>
      </div>
    );
  }

  if (mode === "list") return <PartnerList />;

  return (
    <div style={{ padding: "24px", background: "#f8f9fa", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <Title level={3} style={{ margin: 0, color: "#1f2937" }}>Onboard New Partner</Title>
            <Text type="secondary">Fill in all details to create a partner account</Text>
          </div>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{
          legalEntityType: "LLC",
          billCity: "Dubai", billCountry: "UAE",
          shipCity: "Dubai", shipCountry: "UAE",
          bankAccountType: "Business Current",
          tier1Max: "5000000", tier1Pct: "80",
          tier2Min: "5000001", tier2Pct: "85",
          paymentTerms: "Net 30 days after disbursement",
          agreementType: "Commercial Partnership Agreement",
          signedByXoto: "Xoto Prophet LLC",
          autoRenew: true, isOfflineAgreement: false,
          primaryDialCode: "971", secondaryDialCode: "971",
        }}>
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              {/* Partner Category Section */}
              <Card title="Partner Category" bordered={false} style={{ borderRadius: 12, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <Radio.Group value={partnerCategory} onChange={(e) => setPartnerCategory(e.target.value)} buttonStyle="solid">
                  <Space size={16}>
                    <Radio.Button value="company" style={{ width: 180, height: 80, borderRadius: 12, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div><BuildOutlined style={{ fontSize: 24, color: partnerCategory === "company" ? BRAND_PURPLE : "#9ca3af" }} /><div style={{ fontWeight: 600 }}>Company</div></div>
                    </Radio.Button>
                    <Radio.Button value="individual" style={{ width: 180, height: 80, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div><UserOutlined style={{ fontSize: 24, color: partnerCategory === "individual" ? BRAND_PURPLE : "#9ca3af" }} /><div style={{ fontWeight: 600 }}>Individual</div></div>
                    </Radio.Button>
                  </Space>
                </Radio.Group>
              </Card>

              {/* Company / Individual Details Section */}
              <Card title={partnerCategory === "company" ? "Company Information" : "Individual Details"} bordered={false} style={{ borderRadius: 12, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                {partnerCategory === "company" ? (
                  <Row gutter={[24, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item name="companyName" label="Legal Company Name" rules={[{ required: true }]}>
                        <Input placeholder="e.g. Dubai Real Estate Brokers LLC" size="large" style={{ borderRadius: 10 }} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="legalEntityType" label="Legal Entity Type" rules={[{ required: true }]}>
                        <Select size="large" style={{ borderRadius: 10 }}>
                          <Option value="LLC">LLC</Option>
                          <Option value="FZE">FZE</Option>
                          <Option value="PJSC">PJSC</Option>
                          <Option value="Sole Proprietorship">Sole Proprietorship</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item name="tradeLicenseNumber" label="Trade License Number" rules={[{ required: true }]}>
                        <Input placeholder="1234567890" size="large" style={{ borderRadius: 10 }} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item name="tradeLicenseIssueDate" label="Issue Date" rules={[{ required: true }]}>
                        <DatePicker style={{ width: "100%", borderRadius: 10 }} size="large" format="DD/MM/YYYY" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item name="tradeLicenseExpiryDate" label="Expiry Date" rules={[{ required: true }]}>
                        <DatePicker style={{ width: "100%", borderRadius: 10 }} size="large" format="DD/MM/YYYY" />
                      </Form.Item>
                    </Col>
                  </Row>
                ) : (
                  <Row gutter={[24, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item name="indFirstName" label="First Name" rules={[{ required: true }]}>
                        <Input placeholder="Ahmed" size="large" style={{ borderRadius: 10 }} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="indLastName" label="Last Name" rules={[{ required: true }]}>
                        <Input placeholder="Al Mansouri" size="large" style={{ borderRadius: 10 }} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item name="indEmiratesId" label={<span>Emirates ID <TooltipInfo title="Format: 784-1990-1234567-1" /></span>} rules={[{ required: true }]}>
                        <Input placeholder="784-1990-1234567-1" size="large" style={{ borderRadius: 10 }} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item name="indNationality" label="Nationality" rules={[{ required: true }]}>
                        <Select size="large" style={{ borderRadius: 10 }} showSearch placeholder="Select nationality">
                          {NATIONALITIES.map(n => <Option key={n} value={n}>{n}</Option>)}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item name="indDob" label="Date of Birth" rules={[{ required: true }]}>
                        <DatePicker style={{ width: "100%", borderRadius: 10 }} size="large" format="DD/MM/YYYY" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="indGender" label="Gender" rules={[{ required: true }]}>
                        <Select size="large" style={{ borderRadius: 10 }} placeholder="Select gender">
                          <Option value="Male">Male</Option>
                          <Option value="Female">Female</Option>
                          <Option value="Other">Other</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                )}
              </Card>

              {/* General Information Section */}
              <Card title="General Information" bordered={false} style={{ borderRadius: 12, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <Row gutter={[24, 16]}>
                  <Col xs={24} md={8}>
                    <Form.Item name="taxRegistrationNumber" label={<span>TRN <TooltipInfo title="Tax Registration Number" /></span>}>
                      <Input placeholder="TRN-1234567890" size="large" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="dbaName" label={<span>DBA / Trade Name <TooltipInfo title="Doing Business As name" /></span>}>
                      <Input placeholder="e.g. DREB Properties" size="large" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="website" label="Website">
                      <Input placeholder="www.example.com" size="large" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="yearEstablished" label="Year Established">
                      <InputNumber placeholder="2018" min="1900" max="2025" size="large" style={{ width: "100%", borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="numberOfBranches" label="Number of Branches">
                      <InputNumber placeholder="1" min="1" size="large" style={{ width: "100%", borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="isOfflineAgreement" label="Offline Agreement?" valuePropName="checked">
                      <Switch checkedChildren="Yes" unCheckedChildren="No" />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              {/* Primary Contact Section */}
              <Card title="Primary Contact" bordered={false} style={{ borderRadius: 12, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <Row gutter={[24, 16]}>
                  <Col xs={24} md={8}>
                    <Form.Item name="primaryName" label="Full Name" rules={[{ required: true }]}>
                      <Input placeholder="Mohammed Ahmed" size="large" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="primaryDesignation" label="Designation" rules={[{ required: true }]}>
                      <Input placeholder="Managing Director" size="large" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="primaryEmail" label="Email Address" rules={[{ required: true, type: "email" }]}>
                      <Input placeholder="mohammed@company.ae" size="large" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="primaryEmiratesId" label="Emirates ID" rules={[{ required: true }]}>
                      <Input placeholder="784-1980-1234567-1" size="large" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label="Phone Number" required>
                      <Space.Compact style={{ width: "100%" }}>
                        <Form.Item name="primaryDialCode" noStyle rules={[{ required: true, message: "Code required" }]}>
                          <Select
                            showSearch
                            optionFilterProp="children"
                            style={{ width: "100px" }}
                            size="large"
                            placeholder="Code"
                          >
                            {countryOptions.map((item) => (
                              <Option key={item.iso} value={item.code}>
                                <Space>
                                  <img src={item.flag} width="20" alt={item.name} style={{ borderRadius: 2 }} />
                                  <span>+{item.code}</span>
                                </Space>
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                        <Form.Item
                          name="primaryPhone"
                          noStyle
                          rules={[
                            { required: true, message: "Phone number required" },
                            {
                              validator: (_, value) => {
                                if (!value) return Promise.resolve();
                                const code = form.getFieldValue("primaryDialCode");
                                const fullNumber = `+${code}${value}`;
                                const phoneNumber = parsePhoneNumberFromString(fullNumber);
                                if (phoneNumber && phoneNumber.isValid()) return Promise.resolve();
                                return Promise.reject(new Error("Invalid mobile number"));
                              },
                            },
                          ]}
                        >
                          <Input placeholder="Mobile Number" size="large" style={{ flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }} />
                        </Form.Item>
                      </Space.Compact>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="primaryWhatsapp" label="WhatsApp Number">
                      <Input placeholder="501234567" prefix="+971" size="large" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              {/* Secondary Contact Section (Optional) */}
              <Card title="Secondary Contact (Optional)" bordered={false} style={{ borderRadius: 12, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <Row gutter={[24, 16]}>
                  <Col xs={24} md={8}>
                    <Form.Item name="secondaryName" label="Full Name">
                      <Input placeholder="Fatima Hassan" size="large" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="secondaryDesignation" label="Designation">
                      <Input placeholder="Operations Manager" size="large" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="secondaryEmail" label="Email Address" rules={[{ type: "email" }]}>
                      <Input placeholder="fatima@company.ae" size="large" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="secondaryEmiratesId" label="Emirates ID">
                      <Input placeholder="784-1985-8765432-1" size="large" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label="Phone Number">
                      <Space.Compact style={{ width: "100%" }}>
                        <Form.Item name="secondaryDialCode" noStyle>
                          <Select showSearch style={{ width: "100px" }} size="large" placeholder="Code">
                            {countryOptions.map((item) => (
                              <Option key={item.iso} value={item.code}>
                                <Space>
                                  <img src={item.flag} width="20" alt={item.name} style={{ borderRadius: 2 }} />
                                  <span>+{item.code}</span>
                                </Space>
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                        <Form.Item name="secondaryPhone" noStyle>
                          <Input placeholder="Mobile Number" size="large" style={{ flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }} />
                        </Form.Item>
                      </Space.Compact>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              {/* Address Section */}
              <Card title="Address Information" bordered={false} style={{ borderRadius: 12, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <Title level={5} style={{ color: BRAND_PURPLE, marginBottom: 16 }}>Billing Address</Title>
                <Row gutter={[24, 16]}>
                  <Col xs={24} md={8}>
                    <Form.Item name="billBuilding" label="Building Name" rules={[{ required: true }]}>
                      <Input placeholder="Boulevard Plaza Tower 1" size="large" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="billFloor" label="Floor / Unit">
                      <Input placeholder="Level 15, Office 1502" size="large" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="billArea" label="Area" rules={[{ required: true }]}>
                      <Input placeholder="Downtown Dubai" size="large" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="billCity" label="City" rules={[{ required: true }]}>
                      <Input placeholder="Dubai" size="large" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="billPoBox" label="PO Box">
                      <Input placeholder="12345" size="large" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="billCountry" label="Country" rules={[{ required: true }]}>
                      <Select size="large" style={{ borderRadius: 10 }}>
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

                <Checkbox checked={sameAsShipping} onChange={e => setSameAsShipping(e.target.checked)} style={{ margin: "16px 0", fontWeight: 600 }}>
                  <CopyOutlined /> Shipping address same as billing
                </Checkbox>

                {!sameAsShipping && (
                  <>
                    <Title level={5} style={{ color: BRAND_PURPLE, marginBottom: 16, marginTop: 16 }}>Shipping Address</Title>
                    <Row gutter={[24, 16]}>
                      <Col xs={24} md={8}>
                        <Form.Item name="shipBuilding" label="Building Name" rules={[{ required: true }]}>
                          <Input placeholder="Al Nahda Tower" size="large" style={{ borderRadius: 10 }} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item name="shipArea" label="Area" rules={[{ required: true }]}>
                          <Input placeholder="Al Nahda" size="large" style={{ borderRadius: 10 }} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item name="shipCity" label="City" rules={[{ required: true }]}>
                          <Input placeholder="Dubai" size="large" style={{ borderRadius: 10 }} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item name="shipCountry" label="Country" rules={[{ required: true }]}>
                          <Select size="large" style={{ borderRadius: 10 }}>
                            <Option value="UAE">UAE</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                )}
              </Card>

              {/* Bank Details Section */}
              <Card title="Bank Details" bordered={false} style={{ borderRadius: 12, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <Row gutter={[24, 16]}>
                  <Col xs={24} md={8}>
                    <Form.Item name="bankBeneficiary" label="Beneficiary Name" rules={[{ required: true }]}>
                      <Input placeholder="Company legal name" size="large" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="bankName" label="Bank Name" rules={[{ required: true }]}>
                      <Input placeholder="Emirates NBD" size="large" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="bankAccount" label="Account Number" rules={[{ required: true }]}>
                      <Input placeholder="12345678901234" size="large" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="bankIban" label="IBAN" rules={[{ required: true }]}>
                      <Input placeholder="AE123456789012345678901" size="large" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="bankSwift" label="SWIFT Code" rules={[{ required: true }]}>
                      <Input placeholder="EBILAEAD" size="large" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="bankAccountType" label="Account Type">
                      <Select size="large" style={{ borderRadius: 10 }}>
                        <Option value="Business Current">Business Current</Option>
                        <Option value="Business Savings">Business Savings</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              {/* Commission Configuration Section */}
              <Card title="Commission Structure" bordered={false} style={{ borderRadius: 12, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <Title level={5} style={{ color: BRAND_PURPLE, marginBottom: 16 }}>Tier 1 (Up to 5M AED)</Title>
                <Row gutter={[24, 16]}>
                  <Col xs={24} md={8}>
                    <Form.Item name="tier1Max" label="Max Loan Amount (AED)" rules={[{ required: true }]}>
                      <InputNumber placeholder="5,000,000" size="large" style={{ width: "100%", borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="tier1Pct" label="Commission %" rules={[{ required: true }]}>
                      <InputNumber placeholder="80" size="large" style={{ width: "100%", borderRadius: 10 }} addonAfter="%" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="tier1Desc" label="Description">
                      <Input placeholder="For loans up to 5M AED" size="large" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Title level={5} style={{ color: BRAND_PURPLE, marginBottom: 16, marginTop: 16 }}>Tier 2 (Above 5M AED)</Title>
                <Row gutter={[24, 16]}>
                  <Col xs={24} md={8}>
                    <Form.Item name="tier2Min" label="Min Loan Amount (AED)" rules={[{ required: true }]}>
                      <InputNumber placeholder="5,000,001" size="large" style={{ width: "100%", borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="tier2Pct" label="Commission %" rules={[{ required: true }]}>
                      <InputNumber placeholder="85" size="large" style={{ width: "100%", borderRadius: 10 }} addonAfter="%" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="tier2Desc" label="Description">
                      <Input placeholder="For loans above 5M AED" size="large" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Title level={5} style={{ color: BRAND_PURPLE, marginBottom: 16, marginTop: 16 }}>Payment Terms</Title>
                <Row gutter={[24, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item name="paymentTerms" label="Payment Terms" rules={[{ required: true }]}>
                      <Input placeholder="Net 30 days after disbursement" size="large" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="calculationBasis" label="Calculation Basis">
                      <Input placeholder="Percentage of Xoto's bank commission" size="large" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              {/* Agreement Details Section */}
              <Card title="Agreement Details" bordered={false} style={{ borderRadius: 12, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <Row gutter={[24, 16]}>
                  <Col xs={24} md={8}>
                    <Form.Item name="agreementType" label="Agreement Type" rules={[{ required: true }]}>
                      <Input placeholder="Commercial Partnership Agreement" size="large" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="agreementStart" label="Start Date" rules={[{ required: true }]}>
                      <DatePicker style={{ width: "100%", borderRadius: 10 }} size="large" format="DD/MM/YYYY" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="agreementEnd" label="End Date" rules={[{ required: true }]}>
                      <DatePicker style={{ width: "100%", borderRadius: 10 }} size="large" format="DD/MM/YYYY" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="signedDate" label="Date Signed" rules={[{ required: true }]}>
                      <DatePicker style={{ width: "100%", borderRadius: 10 }} size="large" format="DD/MM/YYYY" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="signedByXoto" label="Signed By (Xoto)" rules={[{ required: true }]}>
                      <Input placeholder="Xoto Prophet LLC" size="large" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="signedByPartner" label="Signed By (Partner)" rules={[{ required: true }]}>
                      <Input placeholder="Company / individual name" size="large" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item name="autoRenew" valuePropName="checked">
                      <Checkbox>Auto-renew agreement</Checkbox>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              {/* Credentials Section */}
              <Card title="Login Credentials" bordered={false} style={{ borderRadius: 12, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ background: "#e6f7ff", padding: "10px 14px", borderRadius: 10, marginBottom: 20 }}>
                  <Text type="secondary">Credentials will be sent to the partner's email upon creation.</Text>
                </div>
                <Row gutter={[24, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item name="email" label="Login Email" rules={[{ required: true, type: "email" }]}>
                      <Input placeholder="partner@company.ae" size="large" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="password" label="Password" rules={[{ required: true, min: 8 }]}>
                      <Input.Password placeholder="Min 8 characters" size="large" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="confirmPassword" label="Confirm Password" dependencies={["password"]} rules={[{ required: true }, ({ getFieldValue }) => ({ validator(_, v) { if (!v || getFieldValue("password") === v) return Promise.resolve(); return Promise.reject("Passwords do not match"); } })]}>
                      <Input.Password placeholder="Re-enter password" size="large" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Right Column - Profile Photo Upload */}
            <Col xs={24} lg={8}>
              <Card title="Profile Photo" bordered={false} style={{ borderRadius: 12, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <Form.Item label="Profile Photo" required>
                  <Upload
                    showUploadList={false}
                    beforeUpload={handleProfileUpload}
                    accept="image/*"
                  >
                    <Button
                      icon={profileUrl ? <CheckOutlined /> : <UploadOutlined />}
                      block
                      style={{
                        height: 45,
                        borderColor: profileUrl ? SUCCESS_GREEN : "#d9d9d9",
                        color: profileUrl ? SUCCESS_GREEN : "inherit",
                        borderRadius: 10,
                      }}
                      loading={uploadingProfile}
                    >
                      {profileUrl ? "Change Photo" : "Upload Photo"}
                    </Button>
                  </Upload>
                  {profileUrl && (
                    <div style={{ marginTop: 16, textAlign: "center" }}>
                      <Avatar
                        size={100}
                        src={profileUrl}
                        icon={<UserOutlined />}
                        style={{ border: `3px solid ${BRAND_PURPLE}`, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      />
                      <div style={{ marginTop: 8, fontSize: 12, color: SUCCESS_GREEN, fontWeight: 500 }}>
                        <CheckOutlined /> Image uploaded successfully!
                      </div>
                    </div>
                  )}
                </Form.Item>
                <Divider style={{ margin: "16px 0" }} />
                <Text strong>Account Setup Notes</Text>
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    • Login credentials will be sent to the provided email.
                    <br />• The partner can update their profile after first login.
                    <br />• Commission structure can be modified later by admin.
                    <br />• Supported formats: JPG, PNG, GIF. Max 5MB.
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Bottom Action Bar */}
          <div style={{ marginTop: "24px", padding: "16px 24px", background: "#fff", borderRadius: "12px", boxShadow: "0 -2px 10px rgba(0,0,0,0.02)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Button size="large" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ borderRadius: 10, fontWeight: 600 }}>Cancel</Button>
            <Space size={16}>
              <Button size="large" icon={<EyeOutlined />} onClick={showPreview} style={{ borderColor: BRAND_PURPLE, color: BRAND_PURPLE, borderRadius: 10, fontWeight: 600 }}>Preview Details</Button>
              <Button type="primary" size="large" htmlType="submit" loading={loading} icon={<CheckOutlined />} style={{ background: BRAND_PURPLE, borderColor: BRAND_PURPLE, borderRadius: 10, fontWeight: 600, padding: "0 32px" }}>
                {loading ? "Creating..." : "Create Partner"}
              </Button>
            </Space>
          </div>
        </Form>
      </div>
      <PreviewModal />
    </div>
  );
}