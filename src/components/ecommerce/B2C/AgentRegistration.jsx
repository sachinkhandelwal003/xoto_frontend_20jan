import React, { useState, useMemo } from "react";
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
} from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { toast } from "react-toastify";
import { Country } from "country-state-city";

import {
  MailOutlined,
  LockOutlined,
  UploadOutlined,
  UserOutlined,
  SolutionOutlined,
  CheckCircleFilled,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
const { Option } = Select;

/* ===================== XOTO BRAND STYLES ===================== */

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #5c039b; /* Deep Xoto Purple from Screenshot */
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Inter', sans-serif;
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

const InlineButton = styled(Button)`
  height: 45px;
  border-radius: 8px;
  font-weight: 500;
  margin-left: 8px;
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

  const countryPhoneData = useMemo(() => {
    return Country.getAllCountries().map((c) => ({
      iso: c.isoCode.toLowerCase(),
      phone: `+${c.phonecode}`,
      value: `+${c.phonecode}`,
    }));
  }, []);

  const handleSendOtp = async () => {
    try {
      await form.validateFields(["mobile_number"]);
      setLoading(true);
      setTimeout(() => {
        setOtpSent(true);
        setLoading(false);
        toast.info("Verification code sent! (Use 000033)");
      }, 1000);
    } catch (e) {
      toast.error("Please enter your mobile number first");
    }
  };

  const handleVerifyOtp = () => {
    if (otpValue === "000033") {
      setOtpVerified(true);
      setOtpSent(false);
      toast.success("Mobile Verified Successfully!");
    } else {
      toast.error("Invalid OTP. Hint: 000033");
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
              Register your agent profile (Admin approval required)
            </Text>
          </motion.div>
        </HeaderSection>

        <MainCard $isMobile={isMobile} bordered={false}>
          <Form form={form} layout="vertical" initialValues={{ country_code: "+971" }}>
            
            {/* --- SECTION 1: PERSONAL --- */}
            <div style={{ marginBottom: 30 }}>
              <Space style={{ marginBottom: 20, color: '#f26522', fontWeight: 600 }}>
                <UserOutlined /> Personal Details
              </Space>
              
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="first_name" label="First Name" rules={[{ required: true }]}>
                    <StyledInput placeholder="First Name" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="last_name" label="Last Name" rules={[{ required: true }]}>
                    <StyledInput placeholder="Last Name" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
                <StyledInput prefix={<MailOutlined />} placeholder="Email Address" />
              </Form.Item>

              <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
                <Input.Password style={{height: 45, borderRadius: 8}} prefix={<LockOutlined />} placeholder="Password" />
              </Form.Item>
            </div>

            {/* --- SECTION 2: VERIFICATION --- */}
            <div style={{ marginBottom: 30 }}>
              <Form.Item label="Phone Number" required>
                <div style={{ display: 'flex' }}>
                  <Form.Item name="country_code" noStyle>
                    <Select style={{ width: 100, height: 45 }}>
                      {countryPhoneData.map(c => (
                        <Option key={c.iso} value={c.value}>{c.phone}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item name="mobile_number" noStyle>
                    <StyledInput 
                      style={{ flex: 1, marginLeft: 8 }} 
                      placeholder="e.g. 501234567" 
                      disabled={otpVerified}
                      suffix={otpVerified && <CheckCircleFilled style={{ color: "#52c41a" }} />}
                    />
                  </Form.Item>
                  {!otpVerified && (
                    <InlineButton type="default" onClick={handleSendOtp} loading={loading}>
                      Send OTP
                    </InlineButton>
                  )}
                </div>
              </Form.Item>

              <AnimatePresence>
                {otpSent && !otpVerified && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ overflow: 'hidden' }}>
                    <div style={{ display: 'flex', marginTop: 10 }}>
                      <StyledInput 
                        prefix={<SafetyCertificateOutlined />}
                        placeholder="Enter 6-digit OTP" 
                        value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value)}
                      />
                      <InlineButton type="primary" onClick={handleVerifyOtp} style={{background: '#000'}}>
                        Verify
                      </InlineButton>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* --- SECTION 3: PROFESSIONAL --- */}
            <Divider />
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="operating_city" label="Operating City">
                  <StyledInput placeholder="City Name" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="specialization" label="Specialization">
                  <Select placeholder="Select specialization" style={{height: 45}}>
                    <Option value="residential">Residential</Option>
                    <Option value="commercial">Commercial</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* --- UPLOADS --- */}
            <Row gutter={16} style={{ marginTop: 20 }}>
              <Col xs={24} md={8}>
                <Form.Item name="profile_photo" label="Profile Photo">
                  <Upload maxCount={1} beforeUpload={() => false}>
                    <Button icon={<UploadOutlined />} block style={{height: 45}}>Photo</Button>
                  </Upload>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="id_proof" label="ID Proof">
                  <Upload maxCount={1} beforeUpload={() => false}>
                    <Button icon={<UploadOutlined />} block style={{height: 45}}>Upload ID</Button>
                  </Upload>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="rera_certificate" label="RERA Certificate">
                  <Upload maxCount={1} beforeUpload={() => false}>
                    <Button icon={<UploadOutlined />} block style={{height: 45}}>RERA</Button>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>

            <SubmitButton type="primary" block disabled={!otpVerified}>
              COMPLETE REGISTRATION
            </SubmitButton>
          </Form>
        </MainCard>
      </PageWrapper>
    </ConfigProvider>
  );
};

const Space = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export default RegistrationAgent;