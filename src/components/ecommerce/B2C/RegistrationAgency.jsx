import React, { useState, useMemo, useEffect } from "react";
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
  message,
  Space
} from "antd";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styled from "styled-components";
import axios from "axios";
import { Country } from "country-state-city";
import { parsePhoneNumberFromString } from "libphonenumber-js";

import {
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
  UploadOutlined,
  ApartmentOutlined,
  CheckCircleFilled,
  SafetyCertificateOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
const { Option } = Select;

// --- Styled Components (Same as before) ---
const PageWrapper = styled.div`
  min-height: 100vh;
  position: relative;
  font-family: "Poppins", sans-serif;
  background: ${(props) => (props.$bgImage ? `url(${props.$bgImage})` : "#f0f2f5")} center/cover no-repeat fixed;
  overflow-y: auto;
  padding: 40px 0;
`;

const GradientOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(79, 70, 229, 0.85),
    rgba(67, 56, 202, 0.8)
  );
  backdrop-filter: blur(4px);
  z-index: 1;
`;

const ContentLayer = styled.div`
  position: relative;
  z-index: 2;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const GlassCard = styled(Card)`
  width: 100%;
  max-width: 850px;
  border-radius: 24px !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);

  .ant-card-body {
    padding: ${(props) => (props.$isMobile ? "30px 20px" : "50px")} !important;
  }
`;

const RegistrationAgency = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // --- OTP Related States ---
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false); // For Send/Verify buttons
  const [otpValue, setOtpValue] = useState("");

  const themeColor = "#4F46E5";
  const themeGradient = "linear-gradient(135deg, #4F46E5, #4338ca)";
  const BASE_URL = "https://xoto.ae";

  // --- Country Data ---
  const countryPhoneData = useMemo(() => {
    const allCountries = Country.getAllCountries();
    return allCountries.map((c) => ({
      iso: c.isoCode.toLowerCase(),
      name: c.name,
      phone: `+${c.phonecode}`,
      value: `+${c.phonecode}`,
      searchStr: `${c.name} ${c.phonecode}`,
    }));
  }, []);

  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  // --- OTP Logic: Send OTP ---
  const handleSendOtp = async () => {
    try {
      // Pehle form se values validate karte hain
      const values = await form.validateFields(['country_code', 'mobile_number']);
      const { country_code, mobile_number } = values;

      setOtpLoading(true);

      const payload = {
        country_code: country_code,
        phone_number: mobile_number // API expects 'phone_number'
      };

      console.log("📡 Sending OTP Payload:", payload);

      const response = await axios.post(`${BASE_URL}/api/otp/send-otp`, payload);

      if (response.data) {
        toast.success("OTP Sent Successfully!");
        setOtpSent(true);
        setOtpVerified(false); // Reset verified status if sending again
      }
    } catch (error) {
      console.error("❌ Send OTP Error:", error);
      // Agar validation error hai (form fields invalid), wo catch mein nahi aayega usually
      // API error handle karte hain:
      const msg = error.response?.data?.message || "Failed to send OTP.";
      toast.error(msg);
    } finally {
      setOtpLoading(false);
    }
  };

  // --- OTP Logic: Verify OTP ---
  const handleVerifyOtp = async () => {
    if (!otpValue) {
      toast.error("Please enter the OTP");
      return;
    }

    try {
      setOtpLoading(true);
      const values = form.getFieldsValue(['country_code', 'mobile_number']);
      
      const payload = {
        country_code: values.country_code,
        phone_number: values.mobile_number,
        otp: otpValue
      };

      console.log("📡 Verifying OTP Payload:", payload);

      const response = await axios.post(`${BASE_URL}/api/otp/verify-otp`, payload);

      if (response.data) {
        toast.success("Mobile Number Verified!");
        setOtpVerified(true);
        setOtpSent(false); // Hide OTP field after success
      }
    } catch (error) {
      console.error("❌ Verify OTP Error:", error);
      const msg = error.response?.data?.message || "Invalid OTP.";
      toast.error(msg);
    } finally {
      setOtpLoading(false);
    }
  };

  // --- Handle Mobile Number Change ---
  // Agar user number change kare verify hone ke baad, status reset karo
  const handleMobileChange = (e) => {
    // Standard input processing
    const { value } = e.target;
    const reg = /^\d*$/;
    if (reg.test(value)) {
      form.setFieldsValue({ mobile_number: value });
      
      // Reset logic
      if (otpVerified || otpSent) {
        setOtpVerified(false);
        setOtpSent(false);
        setOtpValue("");
      }
    }
  };

  const onFinish = async (values) => {
    // --- Strict Check: OTP must be verified ---
    if (!otpVerified) {
      toast.error("Please verify your mobile number first.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email: values.email,
        password: values.password,
        country_code: values.country_code,
        mobile_number: values.mobile_number,
        
        profile_photo: values.profile_photo?.[0]?.originFileObj, 
        letter_of_authority: values.letter_of_authority?.[0]?.originFileObj, 
      };

      console.log("📡 Sending Registration Payload:", payload);

      const response = await axios.post(
        `${BASE_URL}/api/agency/agency-signup`, 
        payload
      );

      if (response.data) {
        toast.success("Registration Successful! Please Login.");
        navigate("/"); 
      }

    } catch (error) {
      console.error("❌ Registration Error:", error);
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        "Registration Failed.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: themeColor,
          borderRadius: 8,
          fontFamily: "Poppins, sans-serif",
        },
      }}
    >
      <PageWrapper>
        <GradientOverlay />

        <ContentLayer>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ width: "100%", maxWidth: 850 }}
          >
            <GlassCard bordered={false} $isMobile={isMobile}>
              
              <div style={{ textAlign: "center", marginBottom: 40 }}>
                 <div style={{ 
                    width: 70, height: 70, borderRadius: "50%", 
                    background: themeGradient, color: "#fff", 
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 16px auto",
                    boxShadow: "0 8px 20px rgba(79, 70, 229, 0.3)"
                 }}>
                    <ApartmentOutlined style={{ fontSize: "32px" }} />
                 </div>

                <Title level={2} style={{ margin: 0, color: "#333", fontWeight: 800 }}>
                  Agency Registration
                </Title>
                <Text type="secondary" style={{ fontSize: 16 }}>
                  Create your property agency account
                </Text>
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                size="large"
                scrollToFirstError
                initialValues={{
                    country_code: "+971"
                }}
              >
                {/* --- Account Info --- */}
                <Divider orientation="left" style={{ borderColor: "#e5e7eb" }}>
                    <span style={{ color: themeColor, fontSize: 13, fontWeight: "bold", letterSpacing: 1 }}>
                        ACCOUNT INFO
                    </span>
                </Divider>

                <Row gutter={24}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="email"
                      label="Email Address"
                      rules={[
                        { required: true, message: "Email is required" },
                        { type: "email", message: "Invalid email format" }
                      ]}
                    >
                      <Input prefix={<MailOutlined style={{color: "#aaa"}} />} placeholder="agency@example.com" style={{ borderRadius: 8 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="password"
                      label="Password"
                      rules={[{ required: true, message: "Password is required" }, { min: 6, message: "Min 6 characters" }]}
                    >
                      <Input.Password prefix={<LockOutlined style={{color: "#aaa"}} />} placeholder="Create Password" style={{ borderRadius: 8 }} />
                    </Form.Item>
                  </Col>
                </Row>

                {/* --- Contact Details with OTP --- */}
                <Divider orientation="left" style={{ borderColor: "#e5e7eb", marginTop: 30 }}>
                    <span style={{ color: themeColor, fontSize: 13, fontWeight: "bold", letterSpacing: 1 }}>
                        CONTACT DETAILS & VERIFICATION
                    </span>
                </Divider>

                <Row gutter={24}>
                    <Col xs={24} md={6}>
                        <Form.Item
                            name="country_code"
                            label="Code"
                            rules={[{ required: true, message: "Required" }]}
                        >
                            <Select 
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) => 
                                    (option['data-search'] || "").toLowerCase().includes(input.toLowerCase())
                                }
                                // Reset OTP if country changes
                                onChange={() => {
                                    setOtpVerified(false);
                                    setOtpSent(false);
                                }}
                            >
                                {countryPhoneData.map((country, index) => (
                                    <Option 
                                      key={`${country.iso}-${index}`} 
                                      value={country.value}
                                      data-search={country.searchStr}
                                    >
                                      <div style={{ display: "flex", alignItems: "center" }}>
                                        <img 
                                          src={`https://flagcdn.com/w20/${country.iso}.png`} 
                                          srcSet={`https://flagcdn.com/w40/${country.iso}.png 2x`}
                                          width="20" 
                                          alt={country.name} 
                                          style={{ marginRight: 8, borderRadius: 2 }} 
                                        />
                                        <span>{country.phone}</span>
                                      </div>
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    
                    <Col xs={24} md={10}>
                        <Form.Item
                            name="mobile_number"
                            label="Mobile Number"
                            dependencies={['country_code']}
                            rules={[
                                { required: true, message: "Mobile number is required" },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        const countryCode = getFieldValue('country_code');
                                        if (!value || !countryCode) return Promise.resolve();
                                        const fullNumber = `${countryCode}${value}`;
                                        const phoneNumber = parsePhoneNumberFromString(fullNumber);
                                        if (phoneNumber && phoneNumber.isValid()) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error(`Invalid number`));
                                    },
                                }),
                            ]}
                        >
                        <Input 
                            prefix={<PhoneOutlined style={{color: "#aaa"}} />} 
                            placeholder="e.g. 50 123 4567" 
                            maxLength={15}
                            disabled={otpVerified} // Lock input after verification
                            suffix={otpVerified ? <CheckCircleFilled style={{ color: "#52c41a" }} /> : null}
                            onChange={handleMobileChange}
                            style={{ borderRadius: 8 }} 
                        />
                        </Form.Item>
                    </Col>

                    {/* --- Send OTP Button Column --- */}
                    <Col xs={24} md={8} style={{ display: 'flex', alignItems: 'flex-start', paddingTop: '29px' }}>
                        {!otpVerified ? (
                            <Button 
                            className="mt-5"
                                onClick={handleSendOtp}
                                loading={otpLoading}
                                disabled={otpSent} // Disable if OTP already sent (unless you add Resend logic)
                                block={isMobile}
                                type="default"
                                style={{ 
                                    borderColor: themeColor, 
                                    color: themeColor,
                                    borderRadius: 8,
                                    fontWeight: 500,
                                }}
                            >
                                {otpSent ? "OTP Sent" : "Send OTP"}
                            </Button>
                        ) : (
                            <Button 
                                type="text" 
                                icon={<CheckCircleFilled />} 
                                style={{ color: '#52c41a', cursor: 'default', fontWeight: 'bold' }}
                            >
                                Verified
                            </Button>
                        )}
                    </Col>
                </Row>

                {/* --- OTP Input Row (Visible only when OTP is Sent and Not Verified) --- */}
                {otpSent && !otpVerified && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <Row gutter={24} style={{ marginBottom: 24, background: "#f9fafb", padding: "15px", borderRadius: "8px", border: "1px dashed #d9d9d9" }}>
                            <Col xs={24} md={16}>
                                <Text strong style={{ display: "block", marginBottom: 8, fontSize: 13 }}>Enter Verification Code</Text>
                                <Input 
                                    placeholder="Enter OTP (e.g. 123456)"
                                    value={otpValue}
                                    onChange={(e) => setOtpValue(e.target.value)}
                                    prefix={<SafetyCertificateOutlined style={{color: "#aaa"}} />}
                                    style={{ borderRadius: 8 }}
                                    maxLength={6}
                                />
                            </Col>
                            <Col xs={24} md={8} style={{ display: 'flex', alignItems: 'flex-end' }}>
                                <Button 
                                    type="primary" 
                                    onClick={handleVerifyOtp}
                                    loading={otpLoading}
                                    block
                                    style={{ background: "#333", borderColor: "#333", borderRadius: 8 }}
                                >
                                    Verify OTP
                                </Button>
                            </Col>
                            <Col span={24}>
                                <Button type="link" size="small" onClick={handleSendOtp} style={{ paddingLeft: 0, marginTop: 5 }}>
                                    Resend OTP
                                </Button>
                            </Col>
                        </Row>
                    </motion.div>
                )}

                {/* --- Documents --- */}
                <Divider orientation="left" style={{ borderColor: "#e5e7eb", marginTop: 30 }}>
                    <span style={{ color: themeColor, fontSize: 13, fontWeight: "bold", letterSpacing: 1 }}>
                        DOCUMENTS & PROFILE
                    </span>
                </Divider>

                <Row gutter={24}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="profile_photo"
                            label="Agency Profile Photo"
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                            rules={[{ required: true, message: "Profile photo is required" }]}
                        >
                            <Upload 
                                name="logo" 
                                listType="picture" 
                                maxCount={1}
                                beforeUpload={() => false} 
                                accept="image/*"
                            >
                                <Button icon={<UploadOutlined />} block style={{ height: 45, borderRadius: 8 }}>
                                    Upload Photo
                                </Button>
                            </Upload>
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="letter_of_authority"
                            label="Letter of Authority (PDF/Img)"
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                            rules={[{ required: true, message: "Authority letter is required" }]}
                        >
                            <Upload 
                                name="file" 
                                maxCount={1}
                                beforeUpload={() => false}
                                accept=".pdf,.png,.jpg,.jpeg"
                            >
                                <Button icon={<UploadOutlined />} block style={{ height: 45, borderRadius: 8 }}>
                                    Upload Document
                                </Button>
                            </Upload>
                        </Form.Item>
                    </Col>
                </Row>

                <div style={{ marginTop: 40 }}>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        block
                        style={{
                            height: 56,
                            borderRadius: 12,
                            fontWeight: "bold",
                            fontSize: "16px",
                            background: themeGradient,
                            border: "none",
                            boxShadow: "0 10px 25px rgba(79, 70, 229, 0.4)",
                            letterSpacing: 0.5
                        }}
                    >
                        COMPLETE REGISTRATION
                    </Button>
                    
                    <div style={{ textAlign: "center", marginTop: 24 }}>
                        <Text type="secondary">Already have an Agency account? </Text>
                        <Button 
                            type="link" 
                            onClick={() => navigate("/")} 
                            style={{ padding: 0, fontWeight: "bold", color: themeColor, height: "auto" }}
                        >
                            Log In
                        </Button>
                    </div>
                </div>

              </Form>
            </GlassCard>
          </motion.div>
        </ContentLayer>
      </PageWrapper>
    </ConfigProvider>
  );
};

export default RegistrationAgency;