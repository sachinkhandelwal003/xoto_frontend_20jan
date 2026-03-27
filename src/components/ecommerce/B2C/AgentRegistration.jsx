import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Row,
  Col,
  Grid,
  ConfigProvider,
  Divider,
  Select,
  Upload,
  Space as AntSpace
} from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { toast } from "react-toastify";
import axios from "axios";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import {
  MailOutlined,
  LockOutlined,
  UploadOutlined,
  UserOutlined,
  SolutionOutlined,
  CheckCircleFilled,
  SafetyCertificateOutlined,
  CheckOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
const { Option } = Select;

// ── helper: extract errors[0] or message from API response ─────────────────
const getErrorMsg = (error, fallback = "Something went wrong") =>
  error?.response?.data?.errors?.[0] ||
  error?.response?.data?.message ||
  fallback;

/* ===================== XOTO BRAND STYLES ===================== */

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #5c039b;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Inter', sans-serif;

  .react-tel-input .form-control {
    height: 45px;
    width: 100%;
    border-radius: 8px;
    border: 1px solid #d9d9d9;
    font-family: 'Inter', sans-serif;
  }
  .react-tel-input .flag-dropdown {
    border-radius: 8px 0 0 8px;
    border: 1px solid #d9d9d9;
    background: #fafafa;
  }
`;

const HeaderSection = styled.div`
  text-align: center;
  padding: 60px 20px 40px;
  color: white;
`;

const IconCircle = styled.div`
  width: 70px;
  height: 70px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const MainCard = styled(Card)`
  width: 100%;
  max-width: 850px;
  border-radius: 20px !important;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2) !important;
  margin-bottom: 50px;
  border: none !important;

  .ant-card-body {
    padding: ${(props) => (props.$isMobile ? "30px 20px" : "50px 60px")} !important;
  }
`;

const StyledInput = styled(Input)`
  height: 45px;
  border-radius: 8px;
  background: #ffffff;
  border: 1px solid #d9d9d9;

  &:hover, &:focus {
    border-color: #5c039b !important;
  }
`;

const SubmitButton = styled(Button)`
  height: 55px;
  background: #5c039b !important;
  border: none !important;
  border-radius: 12px;
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0.5px;
  margin-top: 20px;

  &:hover {
    background: #4a027d !important;
    transform: translateY(-1px);
  }
`;

/* ===================== COMPONENT ===================== */

const RegistrationAgent = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [phone, setPhone] = useState("");
  const [countryData, setCountryData] = useState({});

  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);
  const [emailOtpValue, setEmailOtpValue] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  const [urls, setUrls] = useState({ profile: "", idProof: "", rera: "" });
  const [uploading, setUploading] = useState({ profile: false, idProof: false, rera: false });

  // ── Inline error states (shown below fields, no toast) ──────────────────────
  const [phoneError, setPhoneError]         = useState("");
  const [otpError, setOtpError]             = useState("");
  const [emailOtpError, setEmailOtpError]   = useState("");
  const [uploadError, setUploadError]       = useState({ profile: "", idProof: "", rera: "" });
  const [submitError, setSubmitError]       = useState("");

  const UPLOAD_API = "https://xoto.ae/api/upload";
  const SIGNUP_API  = "https://xoto.ae/api/agent/agent-signup";

  // ── 1. Instant Upload ───────────────────────────────────────────────────────
  const handleInstantUpload = async (file, type) => {
    setUploading((prev) => ({ ...prev, [type]: true }));
    setUploadError((prev) => ({ ...prev, [type]: "" }));
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(UPLOAD_API, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedUrl = response.data?.file?.url || response.data?.url || "";

      if (uploadedUrl) {
        setUrls((prev) => ({ ...prev, [type]: uploadedUrl }));
        toast.success(`${type} uploaded successfully!`);
      } else {
        setUploadError((prev) => ({ ...prev, [type]: "Upload failed: no URL returned." }));
      }
    } catch (error) {
      setUploadError((prev) => ({ ...prev, [type]: getErrorMsg(error, `Failed to upload ${type}.`) }));
    } finally {
      setUploading((prev) => ({ ...prev, [type]: false }));
    }

    return false;
  };

  // ── 2. Send Phone OTP ───────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!phone || phone.length < 8) {
      setPhoneError("Please enter a valid mobile number first");
      return;
    }
    setPhoneError("");
    setLoading(true);
    try {
      const cCode   = `+${countryData.dialCode || '971'}`;
      const pNumber = phone.slice((countryData?.dialCode || '971').length);

      await axios.post("https://xoto.ae/api/otp/send-otp", {
        country_code: cCode,
        phone_number: pNumber,
      });

      setOtpSent(true);
      toast.success("Verification code sent to your mobile!");
    } catch (error) {
      setPhoneError(getErrorMsg(error, "Failed to send OTP"));
    } finally {
      setLoading(false);
    }
  };

  // ── 3. Verify Phone OTP ─────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (!otpValue) {
      setOtpError("Please enter the OTP");
      return;
    }
    setOtpError("");
    setLoading(true);
    try {
      const cCode   = `+${countryData.dialCode || '971'}`;
      const pNumber = phone.slice((countryData?.dialCode || '971').length);

      await axios.post("https://xoto.ae/api/otp/verify-otp", {
        country_code: cCode,
        phone_number: pNumber,
        otp: otpValue,
      });

      setOtpVerified(true);
      toast.success("Mobile verified successfully!");
    } catch (error) {
      setOtpError(getErrorMsg(error, "Invalid OTP"));
    } finally {
      setLoading(false);
    }
  };

  // ── 4. Send Email OTP ───────────────────────────────────────────────────────
  const handleSendEmailOtp = async () => {
    const email = form.getFieldValue("email");
    if (!email) {
      form.setFields([{ name: "email", errors: ["Enter email first"] }]);
      return;
    }
    setEmailOtpError("");
    setEmailLoading(true);
    try {
      await axios.post("https://xoto.ae/api/otp/email-otp/send", { email });
      setEmailOtpSent(true);
      setEmailOtpVerified(false);
      toast.success("OTP sent to email");
    } catch (err) {
      form.setFields([{ name: "email", errors: [getErrorMsg(err, "Failed to send email OTP")] }]);
    } finally {
      setEmailLoading(false);
    }
  };

  // ── 5. Verify Email OTP ─────────────────────────────────────────────────────
  const handleVerifyEmailOtp = async () => {
    if (!emailOtpValue) {
      setEmailOtpError("Please enter the OTP");
      return;
    }
    setEmailOtpError("");
    setEmailLoading(true);
    try {
      await axios.post("https://xoto.ae/api/otp/email-otp/verify", {
        email: form.getFieldValue("email"),
        otp: emailOtpValue,
      });
      setEmailOtpVerified(true);
      toast.success("Email verified");
    } catch (err) {
      setEmailOtpError(getErrorMsg(err, "Invalid email OTP"));
    } finally {
      setEmailLoading(false);
    }
  };

  // ── 6. Final Submit ─────────────────────────────────────────────────────────
  const handleFinish = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        first_name:        values.first_name,
        last_name:         values.last_name,
        email:             values.email,
        password:          values.password,
        phone_number:      phone.slice((countryData?.dialCode || '').length),
        country_code:      `+${countryData.dialCode}`,
        country:           countryData.name || "United Arab Emirates",
        operating_city:    values.operating_city,
        specialization:    values.specialization,
        profile_photo:     urls.profile,
        id_proof:          urls.idProof,
        rera_certificate:  urls.rera,
      };

      await axios.post(SIGNUP_API, payload, {
        headers: { "Content-Type": "application/json" },
      });

      toast.success("Agent Registration Successful");
      navigate("/waiting-approval");
    }catch (error) {
  const apiError = error?.response?.data;
  const message = apiError?.message || "";

  // ✅ PHONE ERROR HANDLE (MAIN FIX)
  if (message.toLowerCase().includes("phone")) {
    setPhoneError(message);
  }

  // ✅ FIELD ERRORS (अगर backend सही दे)
  else if (apiError?.errors) {
    const fieldErrors = Object.keys(apiError.errors).map((key) => ({
      name: key,
      errors: [apiError.errors[key][0]],
    }));

    form.setFields(fieldErrors);
  } 

  else {
    setSubmitError(message || "Registration failed");
  }

  setOtpVerified(false);
  setOtpSent(false);
  setOtpValue("");
}finally {
      setSubmitting(false);
    }
  };

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#5C039B" } }}>
      <PageWrapper>
        <HeaderSection>
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <IconCircle>
              <SolutionOutlined style={{ fontSize: 30, color: "white" }} />
            </IconCircle>
            <Title level={1} style={{ color: "white", margin: 0, fontWeight: 700 }}>
              Agent Registration
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 16 }}>
              Join the Xoto Network
            </Text>
          </motion.div>
        </HeaderSection>

        <MainCard $isMobile={isMobile} bordered={false}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            onFinishFailed={(errorInfo) => {
              console.error("Form validation failed:", errorInfo);
            }}
            initialValues={{ specialization: 'residential' }}
          >

            {/* --- PERSONAL DETAILS --- */}
            <div style={{ marginBottom: 30 }}>
              <AntSpace style={{ marginBottom: 20, color: '#f26522', fontWeight: 600 }}>
                <UserOutlined /> Personal Details
              </AntSpace>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="first_name" label="First Name" rules={[{ required: true, message: 'Required' }]}>
                    <StyledInput placeholder="First Name" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="last_name" label="Last Name" rules={[{ required: true, message: 'Required' }]}>
                    <StyledInput placeholder="Last Name" />
                  </Form.Item>
                </Col>
              </Row>

              {/* Email + OTP */}
              <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
                <StyledInput
                  prefix={<MailOutlined />}
                  placeholder="Email Address"
                  disabled={emailOtpVerified}
                  onChange={(e) => {
                    form.setFieldsValue({ email: e.target.value });
                    if (emailOtpVerified) {
                      setEmailOtpVerified(false);
                      setEmailOtpSent(false);
                      setEmailOtpValue("");
                    }
                  }}
                  suffix={
                    !emailOtpVerified ? (
                      <Button type="link" onClick={handleSendEmailOtp} loading={emailLoading}>
                        {emailOtpSent ? "Resend" : "Send OTP"}
                      </Button>
                    ) : (
                      <CheckCircleFilled style={{ color: "green" }} />
                    )
                  }
                />
              </Form.Item>

              {emailOtpSent && !emailOtpVerified && (
                <>
                  <StyledInput
                    placeholder="Enter Email OTP"
                    value={emailOtpValue}
                    onChange={(e) => { setEmailOtpValue(e.target.value); setEmailOtpError(""); }}
                    maxLength={6}
                    suffix={
                      <Button type="link" onClick={handleVerifyEmailOtp} loading={emailLoading}>
                        VERIFY
                      </Button>
                    }
                  />
                  {/* Inline email OTP error */}
                  {emailOtpError && (
                    <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{emailOtpError}</div>
                  )}
                </>
              )}

              {(emailOtpSent || emailOtpVerified) && (
                <div style={{ marginTop: 8 }}>
                  <Button
                    type="link"
                    onClick={() => {
                      setEmailOtpVerified(false);
                      setEmailOtpSent(false);
                      setEmailOtpValue("");
                    }}
                  >
                    Change Email
                  </Button>
                </div>
              )}

              <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
                <Input.Password
                  style={{ height: 45, borderRadius: 8 }}
                  prefix={<LockOutlined />}
                  placeholder="Password"
                />
              </Form.Item>
            </div>

            {/* --- PHONE VERIFICATION --- */}
            <div style={{ marginBottom: 30 }}>
              <Form.Item label="Phone Number" required>
                <div style={{ position: 'relative' }}>
                  <PhoneInput
                    country={'ae'}
                    value={phone}
                    onChange={(ph, data) => {
                      setPhone(ph);
                      setCountryData(data);
                      setPhoneError("");
                      if (otpVerified) {
                        setOtpVerified(false);
                        setOtpSent(false);
                        setOtpValue("");
                      }
                    }}
                    enableSearch={true}
                    inputStyle={{ width: '100%', height: '45px', fontSize: '16px', paddingRight: '100px' }}
                    disabled={otpVerified}
                  />

                  {!otpVerified ? (
                    <Button
                      type="link"
                      onClick={() => { setOtpValue(""); setOtpVerified(false); handleSendOtp(); }}
                      loading={loading}
                      disabled={!phone}
                      style={{ position: 'absolute', right: '5px', top: '6px', zIndex: 2, color: '#5C039B', fontWeight: '700' }}
                    >
                      {otpSent ? "Resend" : "Send OTP"}
                    </Button>
                  ) : (
                    <div style={{ position: 'absolute', right: '15px', top: '12px', zIndex: 2 }}>
                      <CheckCircleFilled style={{ color: "#52c41a", fontSize: "20px" }} />
                    </div>
                  )}

                  {(otpSent || otpVerified) && (
                    <div style={{ marginTop: 8 }}>
                      <Button
                        type="link"
                        onClick={() => { setOtpVerified(false); setOtpSent(false); setOtpValue(""); setPhoneError(""); }}
                      >
                        Change Number
                      </Button>
                    </div>
                  )}
                </div>
                {/* Inline phone error */}
                {phoneError && (
                  <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{phoneError}</div>
                )}
              </Form.Item>

              <AnimatePresence>
                {otpSent && !otpVerified && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ overflow: 'hidden' }}>
                    <div style={{ marginTop: 10 }}>
                      <Form.Item style={{ marginBottom: 0 }}>
                        <StyledInput
                          prefix={<SafetyCertificateOutlined />}
                          placeholder="Enter 6-digit OTP"
                          value={otpValue}
                          onChange={(e) => { setOtpValue(e.target.value); setOtpError(""); }}
                          maxLength={6}
                          suffix={
                            <Button
                              type="link"
                              onClick={handleVerifyOtp}
                              loading={loading}
                              style={{ color: '#5C039B', fontWeight: '700', padding: 0 }}
                            >
                              VERIFY
                            </Button>
                          }
                        />
                      </Form.Item>
                      {/* Inline OTP error */}
                      {otpError && (
                        <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{otpError}</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* --- PROFESSIONAL DETAILS --- */}
            <Divider />
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="operating_city" label="Operating City" rules={[{ required: true }]}>
                  <StyledInput placeholder="e.g. Dubai, Abu Dhabi" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="specialization" label="Specialization" rules={[{ required: true }]}>
                  <Select placeholder="Select specialization" style={{ height: 45 }}>
                    <Option value="residential">Residential</Option>
                    <Option value="commercial">Commercial</Option>
                    <Option value="luxury">Luxury Real Estate</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* --- FILE UPLOADS --- */}
            <Row gutter={16} style={{ marginTop: 20 }}>
              <Col xs={24} md={8}>
                <Form.Item label="Profile Photo">
                  <Upload showUploadList={false} beforeUpload={(file) => handleInstantUpload(file, 'profile')}>
                    <Button
                      icon={urls.profile ? <CheckOutlined /> : <UploadOutlined />}
                      block
                      style={{ height: 45, borderColor: urls.profile ? '#52c41a' : uploadError.profile ? '#ef4444' : '#d9d9d9', color: urls.profile ? '#52c41a' : 'inherit' }}
                      loading={uploading.profile}
                    >
                      {urls.profile ? "Uploaded" : "Upload Photo"}
                    </Button>
                  </Upload>
                  {urls.profile && <div style={{ marginTop: 5, fontSize: 12, color: '#52c41a' }}>Image saved!</div>}
                  {uploadError.profile && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{uploadError.profile}</div>}
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="ID Proof">
                  <Upload showUploadList={false} beforeUpload={(file) => handleInstantUpload(file, 'idProof')}>
                    <Button
                      icon={urls.idProof ? <CheckOutlined /> : <UploadOutlined />}
                      block
                      style={{ height: 45, borderColor: urls.idProof ? '#52c41a' : uploadError.idProof ? '#ef4444' : '#d9d9d9', color: urls.idProof ? '#52c41a' : 'inherit' }}
                      loading={uploading.idProof}
                    >
                      {urls.idProof ? "Uploaded" : "Upload Emirates ID"}
                    </Button>
                  </Upload>
                  {urls.idProof && <div style={{ marginTop: 5, fontSize: 12, color: '#52c41a' }}>ID saved!</div>}
                  {uploadError.idProof && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{uploadError.idProof}</div>}
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="RERA Certificate">
                  <Upload showUploadList={false} beforeUpload={(file) => handleInstantUpload(file, 'rera')}>
                    <Button
                      icon={urls.rera ? <CheckOutlined /> : <UploadOutlined />}
                      block
                      style={{ height: 45, borderColor: urls.rera ? '#52c41a' : uploadError.rera ? '#ef4444' : '#d9d9d9', color: urls.rera ? '#52c41a' : 'inherit' }}
                      loading={uploading.rera}
                    >
                      {urls.rera ? "Uploaded" : "Upload RERA"}
                    </Button>
                  </Upload>
                  {urls.rera && <div style={{ marginTop: 5, fontSize: 12, color: '#52c41a' }}>Certificate saved!</div>}
                  {uploadError.rera && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{uploadError.rera}</div>}
                </Form.Item>
              </Col>
            </Row>

            <SubmitButton
              type="primary"
              block
              htmlType="submit"
              loading={submitting}
              disabled={!otpVerified || !emailOtpVerified}
            >
              COMPLETE REGISTRATION
            </SubmitButton>

            {/* Inline submit error below button */}
            {submitError && (
              <div style={{ color: "#ef4444", fontSize: 13, marginTop: 10, textAlign: "center", fontWeight: 500 }}>
                {submitError}
              </div>
            )}
          </Form>
        </MainCard>
      </PageWrapper>
    </ConfigProvider>
  );
};

export default RegistrationAgent;