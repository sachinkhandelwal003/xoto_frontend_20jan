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
  Tag,
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
  const [submitting, setSubmitting] = useState(false);

  const [phone, setPhone] = useState("");
  const [countryData, setCountryData] = useState({});

  // ✅ INSTANT UPLOAD STATES
  const [urls, setUrls] = useState({ profile: "", idProof: "", rera: "" });
  const [uploading, setUploading] = useState({ profile: false, idProof: false, rera: false });

  // LIVE APIs
  const UPLOAD_API = "https://xoto.ae/api/upload";
  const SIGNUP_API = "https://xoto.ae/api/agent/agent-signup";

  // ✅ INSTANT UPLOAD FUNCTION (Fixed API Response Parsing)
  const handleInstantUpload = async (file, type) => {
    setUploading((prev) => ({ ...prev, [type]: true }));
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      console.log(`📤 Uploading ${type} instantly...`);
      const response = await axios.post(UPLOAD_API, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      console.log(`✅ Upload API Response for ${type}:`, response.data);

      // 🎯 FIXED URL EXTRACTION: Added `response.data?.file?.url` based on your JSON
      const uploadedUrl = response.data?.file?.url || response.data?.url || ""; 
      
      if(uploadedUrl) {
        setUrls((prev) => ({ ...prev, [type]: uploadedUrl }));
        toast.success(`${type} uploaded successfully!`);
      } else {
        toast.error("Upload failed: API didn't return a URL.");
      }
    } catch (error) {
      console.error(`❌ Instant upload error for ${type}:`, error);
      toast.error(`Failed to upload ${type}.`);
    } finally {
      setUploading((prev) => ({ ...prev, [type]: false }));
    }

    // Return false to stop AntD's default form upload behavior
    return false; 
  };

  // 2. Send OTP Handler
  const handleSendOtp = async () => {
    if (!phone || phone.length < 8) {
      toast.error("Please enter a valid mobile number first");
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      setOtpSent(true);
      setLoading(false);
      toast.info("Verification code sent! (Use 000033)");
    }, 1000);
  };

  // 3. Verify OTP Handler
  const handleVerifyOtp = () => {
    if (otpValue === "000033") {
      setOtpVerified(true);
      setOtpSent(false);
      toast.success("Mobile Verified Successfully!");
    } else {
      toast.error("Invalid OTP. Hint: 000033");
    }
  };

  // 4. Main Form Submit Handler
  const handleFinish = async (values) => {
    try {
      setSubmitting(true);

      const payload = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        password: values.password,
        phone_number: phone.replace(countryData.dialCode, ""),
        country_code: `+${countryData.dialCode}`,
        country: countryData.name || "United Arab Emirates",
        operating_city: values.operating_city,
        specialization: values.specialization,
        profile_photo: urls.profile,   
        id_proof: urls.idProof,        
        rera_certificate: urls.rera    
      };

      console.log("🚀 Final JSON Payload being sent to Live Signup API:", payload);

      const response = await axios.post(
        SIGNUP_API,
        payload,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      toast.success("Agent Registration Successful");
      console.log("🎉 Signup Response:", response.data);

    } catch (error) {
      console.error("Signup Error:", error);
      toast.error(
        error.message || error.response?.data?.message || "Registration failed"
      );
    } finally {
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
              console.error("❌ Form Validation Failed! Required fields are missing:", errorInfo);
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

              <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
                <StyledInput prefix={<MailOutlined />} placeholder="Email Address" />
              </Form.Item>

              <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
                <Input.Password style={{height: 45, borderRadius: 8}} prefix={<LockOutlined />} placeholder="Password" />
              </Form.Item>
            </div>

            {/* --- PHONE VERIFICATION --- */}
            <div style={{ marginBottom: 30 }}>
              <Form.Item label="Phone Number" required>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <PhoneInput
                      country={'ae'} 
                      value={phone}
                      onChange={(phone, data) => {
                        setPhone(phone);
                        setCountryData(data);
                      }}
                      enableSearch={true}
                      inputStyle={{
                        width: '100%',
                        height: '45px',
                        fontSize: '16px'
                      }}
                      disabled={otpVerified}
                    />
                  </div>
                  
                  {otpVerified ? (
                    <Button 
                      icon={<CheckCircleFilled style={{ color: "#52c41a" }} />} 
                      style={{ height: 45, border: '1px solid #52c41a', color: '#52c41a', background: '#f6ffed' }}
                    >
                      Verified
                    </Button>
                  ) : (
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
                  <Select placeholder="Select specialization" style={{height: 45}}>
                    <Option value="residential">Residential</Option>
                    <Option value="commercial">Commercial</Option>
                    <Option value="luxury">Luxury Real Estate</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* --- INSTANT FILE UPLOADS --- */}
            <Row gutter={16} style={{ marginTop: 20 }}>
              <Col xs={24} md={8}>
                <Form.Item label="Profile Photo">
                  <Upload 
                    showUploadList={false} 
                    beforeUpload={(file) => handleInstantUpload(file, 'profile')}
                  >
                    <Button 
                      icon={urls.profile ? <CheckOutlined /> : <UploadOutlined />} 
                      block 
                      style={{ height: 45, borderColor: urls.profile ? '#52c41a' : '#d9d9d9', color: urls.profile ? '#52c41a' : 'inherit' }}
                      loading={uploading.profile}
                    >
                      {urls.profile ? "Uploaded" : "Upload Photo"}
                    </Button>
                  </Upload>
                  {urls.profile && <div style={{marginTop: 5, fontSize: 12, color: '#52c41a'}}>Image saved!</div>}
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="ID Proof">
                  <Upload 
                    showUploadList={false} 
                    beforeUpload={(file) => handleInstantUpload(file, 'idProof')}
                  >
                    <Button 
                      icon={urls.idProof ? <CheckOutlined /> : <UploadOutlined />} 
                      block 
                      style={{ height: 45, borderColor: urls.idProof ? '#52c41a' : '#d9d9d9', color: urls.idProof ? '#52c41a' : 'inherit' }}
                      loading={uploading.idProof}
                    >
                      {urls.idProof ? "Uploaded" : "Upload Emirates ID"}
                    </Button>
                  </Upload>
                  {urls.idProof && <div style={{marginTop: 5, fontSize: 12, color: '#52c41a'}}>ID saved!</div>}
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="RERA Certificate">
                  <Upload 
                    showUploadList={false} 
                    beforeUpload={(file) => handleInstantUpload(file, 'rera')}
                  >
                    <Button 
                      icon={urls.rera ? <CheckOutlined /> : <UploadOutlined />} 
                      block 
                      style={{ height: 45, borderColor: urls.rera ? '#52c41a' : '#d9d9d9', color: urls.rera ? '#52c41a' : 'inherit' }}
                      loading={uploading.rera}
                    >
                      {urls.rera ? "Uploaded" : "Upload RERA"}
                    </Button>
                  </Upload>
                  {urls.rera && <div style={{marginTop: 5, fontSize: 12, color: '#52c41a'}}>Certificate saved!</div>}
                </Form.Item>
              </Col>
            </Row>

            <SubmitButton type="primary" block htmlType="submit" loading={submitting} disabled={!otpVerified}>
              COMPLETE REGISTRATION
            </SubmitButton>
          </Form>
        </MainCard>
      </PageWrapper>
    </ConfigProvider>
  );
};

export default RegistrationAgent;