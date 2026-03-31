import React, { useState, useEffect, useMemo } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Typography,
  message,
  Spin,
  Modal,
  Select,
  notification,
  Divider,
  Progress,
  Space,
  Steps,
  Alert,
  Tag,
  Tooltip,
} from "antd";
import {
  CodeOutlined,
  SafetyOutlined,
  SafetyCertificateOutlined,
  CheckCircleFilled,
  BuildOutlined,
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  UserOutlined,
  GlobalOutlined,
  RocketOutlined,
  StarOutlined,
  TrophyOutlined,
  IdcardOutlined,
  TeamOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Country, City } from "country-state-city";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const DeveloperRegistration = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Location States
  const [citiesList, setCitiesList] = useState([]);

  // --- MOBILE OTP STATES ---
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  // --- EMAIL OTP STATES ---
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);
  const [enteredEmailOtp, setEnteredEmailOtp] = useState("");
  const [emailOtpLoading, setEmailOtpLoading] = useState(false);

  const themeColor = "#5C029B";
  const lightBg = "#F8F5FC";

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    trigger,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone_number: "",
      country_code: "+971",
      country: "AE",
      city: "",
      address: "",
    },
  });

  const selectedCountry = watch("country");
  const watchedPhoneNumber = watch("phone_number");
  const watchedEmail = watch("email");
  const formValues = watch();

  // Step validation
  const validateStep = async (step) => {
    if (step === 0) {
      const isStepValid = await trigger(["name", "email", "password"]);
      if (isStepValid && emailOtpVerified) return true;
      if (!emailOtpVerified) message.warning("Please verify your email first");
      return false;
    }
    if (step === 1) {
      const isStepValid = await trigger(["phone_number", "country_code"]);
      if (isStepValid && otpVerified) return true;
      if (!otpVerified) message.warning("Please verify your phone number first");
      return false;
    }
    if (step === 2) {
      const isStepValid = await trigger(["country", "city", "address"]);
      return isStepValid;
    }
    return true;
  };

  const nextStep = async () => {
    if (await validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Calculate form completion percentage
  const calculateCompletion = () => {
    const requiredFields = ["name", "email", "password", "phone_number", "country", "city", "address"];
    const filledFields = requiredFields.filter(field => formValues[field] && formValues[field] !== "");
    let basePercent = Math.floor((filledFields.length / requiredFields.length) * 80);
    if (otpVerified) basePercent += 10;
    if (emailOtpVerified) basePercent += 10;
    return Math.min(basePercent, 100);
  };

  useEffect(() => {
    if (selectedCountry) {
      const updatedCities = City.getCitiesOfCountry(selectedCountry);
      setCitiesList(updatedCities);
    } else {
      setCitiesList([]);
    }
  }, [selectedCountry]);

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

  const handleSendOtp = async () => {
    const countryCode = getValues("country_code");
    const number = getValues("phone_number");

    if (!countryCode || !number) {
      message.error("Please enter a valid phone number first.");
      return;
    }

    setOtpLoading(true);
    try {
      await apiService.post("/otp/send-otp", {
        country_code: countryCode,
        phone_number: number,
      });
      message.success("OTP sent successfully!");
      setOtpSent(true);
      setOtpVerified(false);
    } catch (error) {
      notification.error({
        message: "OTP Error",
        description: error?.response?.data?.message || "Failed to send OTP",
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!enteredOtp) {
      message.error("Please enter the OTP");
      return;
    }
    setOtpLoading(true);
    try {
      await apiService.post("/otp/verify-otp", {
        country_code: getValues("country_code"),
        phone_number: getValues("phone_number"),
        otp: enteredOtp,
      });
      message.success("Phone Verified Successfully!");
      setOtpVerified(true);
      setOtpSent(false);
    } catch (error) {
      notification.error({
        message: "Verification Failed",
        description: error?.response?.data?.message || "Invalid OTP",
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSendEmailOtp = async () => {
    const email = getValues("email");
    if (!email) {
      message.error("Please enter a valid email first.");
      return;
    }

    setEmailOtpLoading(true);
    try {
      const payload = { email };
      await apiService.post("/otp/email-otp/send", payload);
      message.success("OTP sent successfully! Please check your mail.");
      setEmailOtpSent(true);
      setEmailOtpVerified(false);
    } catch (error) {
      const errMsg = error?.response?.data?.message || "Failed to send OTP";
      notification.error({ message: "OTP Error", description: errMsg });
    } finally {
      setEmailOtpLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!enteredEmailOtp) {
      message.error("Please enter the OTP");
      return;
    }
    setEmailOtpLoading(true);
    try {
      const payload = {
        email: getValues("email"),
        otp: enteredEmailOtp,
      };
      await apiService.post("/otp/email-otp/verify", payload);
      message.success("Email Verified Successfully!");
      setEmailOtpVerified(true);
      setEmailOtpSent(false);
    } catch (error) {
      notification.error({
        message: "Verification Failed",
        description: error?.response?.data?.message || "Invalid OTP",
      });
    } finally {
      setEmailOtpLoading(false);
    }
  };

  const showSuccessPopup = () => {
    Modal.success({
      centered: true,
      width: 480,
      title: (
        <div style={{ fontSize: 20, fontWeight: 800, color: "#52c41a" }}>
          <CheckCircleFilled style={{ marginRight: 8, fontSize: 24 }} />
          Registration Submitted!
        </div>
      ),
      content: (
        <div style={{ marginTop: 12, fontSize: 15, lineHeight: 1.6 }}>
          <div style={{ fontWeight: 500, marginBottom: 12 }}>Thank you for your submission!</div>
          <div>We'll review it shortly and get back to you within 24-48 hours.</div>
          <div style={{ marginTop: 12, background: "#f0f9ff", padding: "12px", borderRadius: 8, border: "1px solid #bae7ff" }}>
            <MailOutlined style={{ marginRight: 8, color: "#52c41a", fontSize: 16 }} />
            <span style={{ fontWeight: 500 }}>An email has been sent to your registered email address.</span>
          </div>
        </div>
      ),
      okText: "Go to Login",
      okButtonProps: { style: { background: themeColor, borderColor: themeColor, fontWeight: 600 } },
      onOk: () => navigate("/login"),
    });
  };

  const showAlreadyRegisteredPopup = () => {
    Modal.info({
      centered: true,
      title: <div style={{ fontSize: 20, fontWeight: 800 }}>Already Registered</div>,
      content: (
        <div style={{ marginTop: 12, fontSize: 15 }}>
          <div style={{ marginBottom: 8 }}>This email or phone number is already registered with us.</div>
          <div style={{ fontWeight: 500 }}>Please log in to continue with your account.</div>
        </div>
      ),
      okText: "Go to Login",
      okButtonProps: { style: { background: themeColor, borderColor: themeColor, fontWeight: 600 } },
      onOk: () => navigate("/login"),
    });
  };

  const onSubmit = async (data) => {
    if (!otpVerified) {
      message.error("Please verify your phone number to continue.");
      return;
    }
    if (!emailOtpVerified) {
      message.error("Please verify your email to continue.");
      return;
    }

    setSubmitting(true);

    try {
      const countryObj = Country.getCountryByCode(data.country);

      const registerPayload = {
        name: data.name,
        email: data.email,
        password: data.password,
        phone_number: `${data.country_code}${data.phone_number}`,
        country_code: data.country_code,
        country: countryObj ? countryObj.name : data.country,
        city: data.city,
        address: data.address,
      };

      await apiService.post("/developer/create-developer", registerPayload);
      showSuccessPopup();
    } catch (err) {
      const status = err?.response?.status;
      const res = err?.response?.data;
      const apiMsg = res?.message || res?.error || "Registration failed. Please try again.";

      const isAlreadyRegistered = status === 409 ||
        apiMsg.toLowerCase().includes("already") ||
        apiMsg.toLowerCase().includes("exist") ||
        apiMsg.toLowerCase().includes("duplicate");

      if (isAlreadyRegistered) {
        showAlreadyRegisteredPopup();
      } else {
        message.error(apiMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    {
      title: "Account",
      icon: <UserOutlined />,
      description: "Basic info & verification",
    },
    {
      title: "Contact",
      icon: <PhoneOutlined />,
      description: "Phone verification",
    },
    {
      title: "Location",
      icon: <EnvironmentOutlined />,
      description: "Address details",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", position: "relative", overflowX: "hidden" }}>
      {/* Decorative Background Elements */}
      <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)" }} />
      <div style={{ position: "absolute", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)" }} />
      <div style={{ position: "absolute", top: "40%", left: "20%", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)" }} />

      <Row style={{ width: "100%", margin: 0, minHeight: "100vh", position: "relative", zIndex: 1 }}>
        
        {/* ================= LEFT SIDE (BRANDING) ================= */}
        <Col
          xs={24}
          md={8}
          style={{
            background: `linear-gradient(135deg, ${themeColor} 0%, #3a0163 100%)`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "48px 40px",
            color: "#fff",
            position: "relative",
            overflow: "hidden",
            boxShadow: "4px 0 30px rgba(0,0,0,0.15)",
          }}
        >
          <div style={{ position: "absolute", top: "-20%", right: "-10%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)" }} />
          <div style={{ position: "absolute", bottom: "-10%", left: "-10%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)" }} />
          
          <div style={{ zIndex: 1 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 80,
                height: 80,
                background: "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)",
                borderRadius: "24px",
                marginBottom: 40,
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.3)",
                boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              }}
            >
              <BuildOutlined style={{ fontSize: 42, color: "#fff" }} />
            </div>

            <Title level={1} style={{ color: "#fff", margin: 0, fontWeight: 800, fontSize: "2.8rem", lineHeight: 1.2, letterSpacing: "-0.02em" }}>
              Developer <br/>Portal
            </Title>
            <div style={{ width: 80, height: 4, background: "linear-gradient(90deg, #fff, transparent)", marginTop: 24, marginBottom: 28, borderRadius: 2 }} />
            
            <Text style={{ color: "rgba(255,255,255,0.92)", fontSize: 16, lineHeight: 1.6, display: "block", fontWeight: 500 }}>
              Join our exclusive network of top-tier property developers. Showcase your premium projects to a global audience of qualified buyers.
            </Text>
            
            <div style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: "12px", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
                  <CheckCircleFilled style={{ color: "#fff", fontSize: 18 }} />
                </div>
                <Text style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>Admin Approval Required</Text>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: "12px", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
                  <SafetyCertificateOutlined style={{ color: "#fff", fontSize: 18 }} />
                </div>
                <Text style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>Secure Verification Process</Text>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: "12px", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
                  <TrophyOutlined style={{ color: "#fff", fontSize: 18 }} />
                </div>
                <Text style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>Premium Exposure & Benefits</Text>
              </div>
            </div>

            <Divider style={{ background: "rgba(255,255,255,0.2)", margin: "48px 0 32px" }} />
            
            <div>
              <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: 500 }}>
                Already have an account?{" "}
                <Button 
                  type="link" 
                  onClick={() => navigate("/login")} 
                  style={{ color: "#fff", fontWeight: 800, padding: 0, fontSize: 14, textDecoration: "underline" }}
                >
                  Sign In →
                </Button>
              </Text>
            </div>

      
          </div>
        </Col>

        {/* ================= RIGHT SIDE (FORM) ================= */}
        <Col
          xs={24}
          md={16}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "48px 32px",
            background: "transparent",
          }}
        >
          <div style={{ width: "100%", maxWidth: 680 }}>
            <Card
              bordered={false}
              style={{
                borderRadius: 32,
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
                background: "#fff",
                overflow: "hidden",
              }}
              bodyStyle={{ padding: 0 }}
            >
              {/* Progress Header */}
              <div style={{ 
                background: `linear-gradient(135deg, ${themeColor}08 0%, ${themeColor}02 100%)`,
                padding: "28px 32px 20px",
                borderBottom: `1px solid ${themeColor}10`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
                  <div>
                    <Title level={3} style={{ margin: 0, color: "#1a1a1a", fontWeight: 800, letterSpacing: "-0.5px" }}>
                      Create Your Account
                    </Title>
                    <Text type="secondary" style={{ fontSize: 14, marginTop: 6, display: "block", fontWeight: 500 }}>
                      Join our developer network
                    </Text>
                  </div>
                  <Tag color="purple" style={{ borderRadius: 20, fontWeight: 600, padding: "4px 12px" }}>
                    <ThunderboltOutlined /> {calculateCompletion()}% Complete
                  </Tag>
                </div>
                
                <Progress 
                  percent={calculateCompletion()} 
                  strokeColor={{
                    '0%': '#5C029B',
                    '100%': '#9B4DCA',
                  }}
                  showInfo={false}
                  size="default"
                  strokeWidth={8}
                  trailColor={themeColor + "15"}
                />
                
                <Steps 
                  current={currentStep} 
                  size="small"
                  style={{ marginTop: 24 }}
                  items={steps.map((step, idx) => ({
                    title: step.title,
                    description: step.description,
                    icon: step.icon,
                    status: currentStep > idx ? "finish" : currentStep === idx ? "process" : "wait",
                  }))}
                />
              </div>

              <div style={{ padding: "32px" }}>
                <Form layout="vertical" onFinish={handleSubmit(onSubmit)} size="middle">
                  <Spin spinning={submitting} tip="Submitting your application...">
                    
                    {/* STEP 1: Account Info */}
                    {currentStep === 0 && (
                      <div className="step-content">
                        <Alert
                          message="Let's start with your basic information"
                          description="We'll need your company name, email, and a secure password to begin."
                          type="info"
                          showIcon
                          style={{ marginBottom: 24, borderRadius: 12, background: "#f0f5ff", border: "none" }}
                        />
                        
                        <Form.Item
                          label={<span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a" }}>Company Name <span style={{ color: "#ff4d4f" }}>*</span></span>}
                          validateStatus={errors.name ? "error" : ""}
                          help={errors.name?.message}
                        >
                          <Controller
                            name="name"
                            control={control}
                            rules={{ required: "Company name is required" }}
                            render={({ field }) => (
                              <Input 
                                placeholder="e.g., Emirates Hills Properties" 
                                prefix={<UserOutlined style={{ color: themeColor }} />}
                                size="large"
                                style={{ borderRadius: 12, padding: "8px 12px", fontWeight: 500, border: "1px solid #e8e8e8" }}
                                {...field} 
                              />
                            )}
                          />
                        </Form.Item>

                        {/* Email */}
                        <Form.Item
                          label={<span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a" }}>Email Address <span style={{ color: "#ff4d4f" }}>*</span></span>}
                          validateStatus={errors.email ? "error" : ""}
                          help={errors.email?.message}
                          style={{ marginBottom: emailOtpSent && !emailOtpVerified ? 8 : 24 }}
                        >
                          <Controller
                            name="email"
                            control={control}
                            rules={{
                              required: "Required",
                              pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
                            }}
                            render={({ field }) => (
                              <Input
                                placeholder="info@company.com"
                                prefix={<MailOutlined style={{ color: themeColor }} />}
                                size="large"
                                style={{ borderRadius: 12, padding: "8px 12px", fontWeight: 500, border: "1px solid #e8e8e8" }}
                                {...field}
                                disabled={emailOtpVerified}
                                onChange={(e) => {
                                  field.onChange(e);
                                  if (emailOtpVerified) {
                                    setEmailOtpVerified(false);
                                    setEmailOtpSent(false);
                                  }
                                }}
                                suffix={
                                  !emailOtpVerified ? (
                                    <Button
                                      type="link"
                                      onClick={handleSendEmailOtp}
                                      loading={emailOtpLoading}
                                      disabled={!watchedEmail}
                                      style={{ color: themeColor, fontWeight: 700, padding: 0 }}
                                    >
                                      {emailOtpSent ? "Resend OTP" : "Send OTP"}
                                    </Button>
                                  ) : (
                                    <span style={{ color: "#52c41a", fontWeight: 700 }}>
                                      <CheckCircleFilled /> Verified
                                    </span>
                                  )
                                }
                              />
                            )}
                          />
                        </Form.Item>

                        {emailOtpSent && !emailOtpVerified && (
                          <div style={{ marginBottom: 24 }}>
                            <Input
                              placeholder="Enter 6-digit OTP"
                              prefix={<SafetyCertificateOutlined style={{ color: themeColor }} />}
                              value={enteredEmailOtp}
                              onChange={(e) => setEnteredEmailOtp(e.target.value.replace(/\D/g, ""))}
                              maxLength={6}
                              size="large"
                              style={{ borderRadius: 12, fontWeight: 500 }}
                              suffix={
                                <Button
                                  type="primary"
                                  size="small"
                                  onClick={handleVerifyEmailOtp}
                                  loading={emailOtpLoading}
                                  style={{ background: themeColor, borderColor: themeColor, fontWeight: 700, borderRadius: 8 }}
                                >
                                  Verify
                                </Button>
                              }
                            />
                          </div>
                        )}

                        {/* Password */}
                        <Form.Item
                          label={<span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a" }}>Password <span style={{ color: "#ff4d4f" }}>*</span></span>}
                          validateStatus={errors.password ? "error" : ""}
                          help={errors.password?.message}
                        >
                          <Controller
                            name="password"
                            control={control}
                            rules={{
                              required: "Password is required",
                              minLength: { value: 6, message: "Minimum 6 characters" },
                            }}
                            render={({ field }) => (
                              <Input.Password
                                placeholder="Create a strong password"
                                prefix={<LockOutlined style={{ color: themeColor }} />}
                                size="large"
                                style={{ borderRadius: 12, fontWeight: 500, border: "1px solid #e8e8e8" }}
                                {...field}
                              />
                            )}
                          />
                        </Form.Item>
                      </div>
                    )}

                    {/* STEP 2: Contact Info */}
                    {currentStep === 1 && (
                      <div className="step-content">
                        <Alert
                          message="Verify your phone number"
                          description="We'll send a verification code to your mobile number for security."
                          type="info"
                          showIcon
                          style={{ marginBottom: 24, borderRadius: 12, background: "#f0f5ff", border: "none" }}
                        />
                        
                        <Form.Item
                          label={<span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a" }}>Phone Number <span style={{ color: "#ff4d4f" }}>*</span></span>}
                          validateStatus={errors.phone_number ? "error" : ""}
                          help={errors.phone_number?.message}
                          style={{ marginBottom: otpSent && !otpVerified ? 8 : 24 }}
                        >
                          <div style={{ display: "flex", gap: "12px" }}>
                            <div style={{ width: "120px" }}>
                              <Controller
                                name="country_code"
                                control={control}
                                rules={{ required: "Required" }}
                                render={({ field }) => (
                                  <Select
                                    size="large"
                                    showSearch
                                    disabled={otpVerified}
                                    style={{ borderRadius: 12, fontWeight: 500 }}
                                    dropdownStyle={{ borderRadius: 12 }}
                                    {...field}
                                  >
                                    {countryPhoneData.slice(0, 50).map((country, index) => (
                                      <Option key={`${country.iso}-${index}`} value={country.value}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                          <img
                                            src={`https://flagcdn.com/w20/${country.iso}.png`}
                                            width="20"
                                            alt={country.name}
                                            style={{ borderRadius: 2 }}
                                          />
                                          <span style={{ fontWeight: 500 }}>{country.phone}</span>
                                        </div>
                                      </Option>
                                    ))}
                                  </Select>
                                )}
                              />
                            </div>

                            <div style={{ flex: 1 }}>
                              <Controller
                                name="phone_number"
                                control={control}
                                rules={{
                                  required: "Phone number is required",
                                  validate: (value) => {
                                    const countryCode = getValues("country_code");
                                    if (!countryCode) return "Select code first";
                                    const fullNumber = `${countryCode}${value}`;
                                    const phoneNumber = parsePhoneNumberFromString(fullNumber);
                                    return (
                                      (phoneNumber && phoneNumber.isValid()) ||
                                      "Invalid number"
                                    );
                                  },
                                }}
                                render={({ field }) => (
                                  <Input
                                    placeholder="501234567"
                                    prefix={<PhoneOutlined style={{ color: themeColor }} />}
                                    size="large"
                                    disabled={otpVerified}
                                    style={{ borderRadius: 12, fontWeight: 500, border: "1px solid #e8e8e8" }}
                                    {...field}
                                    onChange={(e) => {
                                      field.onChange(e.target.value.replace(/\D/g, ""));
                                      if (otpVerified) {
                                        setOtpVerified(false);
                                        setOtpSent(false);
                                      }
                                    }}
                                    suffix={
                                      !otpVerified ? (
                                        <Button
                                          type="link"
                                          onClick={handleSendOtp}
                                          loading={otpLoading}
                                          disabled={!watchedPhoneNumber}
                                          style={{ color: themeColor, fontWeight: 700, padding: 0 }}
                                        >
                                          {otpSent ? "Resend OTP" : "Send OTP"}
                                        </Button>
                                      ) : (
                                        <span style={{ color: "#52c41a", fontWeight: 700 }}>
                                          <CheckCircleFilled /> Verified
                                        </span>
                                      )
                                    }
                                  />
                                )}
                              />
                            </div>
                          </div>
                        </Form.Item>

                        {otpSent && !otpVerified && (
                          <div style={{ marginBottom: 24 }}>
                            <Input
                              placeholder="Enter 6-digit OTP"
                              prefix={<SafetyCertificateOutlined style={{ color: themeColor }} />}
                              value={enteredOtp}
                              onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ""))}
                              maxLength={6}
                              size="large"
                              style={{ borderRadius: 12, fontWeight: 500 }}
                              suffix={
                                <Button
                                  type="primary"
                                  size="small"
                                  onClick={handleVerifyOtp}
                                  loading={otpLoading}
                                  style={{ background: themeColor, borderColor: themeColor, fontWeight: 700, borderRadius: 8 }}
                                >
                                  Verify
                                </Button>
                              }
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* STEP 3: Location Details */}
                    {currentStep === 2 && (
                      <div className="step-content">
                        <Alert
                          message="Where are you located?"
                          description="Please provide your business address details for verification."
                          type="info"
                          showIcon
                          style={{ marginBottom: 24, borderRadius: 12, background: "#f0f5ff", border: "none" }}
                        />
                        
                        <Row gutter={16}>
                          <Col xs={24} md={12}>
                            <Form.Item
                              label={<span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a" }}>Country <span style={{ color: "#ff4d4f" }}>*</span></span>}
                              validateStatus={errors.country ? "error" : ""}
                              help={errors.country?.message}
                            >
                              <Controller
                                name="country"
                                control={control}
                                rules={{ required: "Country is required" }}
                                render={({ field }) => (
                                  <Select
                                    size="large"
                                    showSearch
                                    placeholder="Select Country"
                                    optionFilterProp="children"
                                    style={{ borderRadius: 12, fontWeight: 500 }}
                                    dropdownStyle={{ borderRadius: 12 }}
                                    onChange={(val) => {
                                      field.onChange(val);
                                      setValue("city", undefined);
                                    }}
                                    value={field.value}
                                  >
                                    {Country.getAllCountries().slice(0, 100).map((country) => (
                                      <Option key={country.isoCode} value={country.isoCode}>
                                        {country.name}
                                      </Option>
                                    ))}
                                  </Select>
                                )}
                              />
                            </Form.Item>
                          </Col>

                          <Col xs={24} md={12}>
                            <Form.Item
                              label={<span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a" }}>City <span style={{ color: "#ff4d4f" }}>*</span></span>}
                              validateStatus={errors.city ? "error" : ""}
                              help={errors.city?.message}
                            >
                              <Controller
                                name="city"
                                control={control}
                                rules={{ required: "City is required" }}
                                render={({ field }) =>
                                  citiesList.length > 0 ? (
                                    <Select
                                      size="large"
                                      showSearch
                                      placeholder="Select City"
                                      style={{ borderRadius: 12, fontWeight: 500 }}
                                      dropdownStyle={{ borderRadius: 12 }}
                                      {...field}
                                    >
                                      {citiesList.map((city) => (
                                        <Option key={city.name} value={city.name}>
                                          {city.name}
                                        </Option>
                                      ))}
                                    </Select>
                                  ) : (
                                    <Input placeholder="Enter City" size="large" style={{ borderRadius: 12, fontWeight: 500 }} {...field} />
                                  )
                                }
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Form.Item
                          label={<span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a" }}>Address <span style={{ color: "#ff4d4f" }}>*</span></span>}
                          validateStatus={errors.address ? "error" : ""}
                          help={errors.address?.message}
                        >
                          <Controller
                            name="address"
                            control={control}
                            rules={{ required: "Address is required" }}
                            render={({ field }) => (
                              <Input.TextArea
                                placeholder="Building No, Street Name, Area..."
                                rows={3}
                                size="large"
                                style={{ borderRadius: 12, fontWeight: 500 }}
                                {...field}
                              />
                            )}
                          />
                        </Form.Item>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32 }}>
                      {currentStep > 0 && (
                        <Button 
                          size="large" 
                          onClick={prevStep}
                          style={{ borderRadius: 12, fontWeight: 600, padding: "0 28px" }}
                        >
                          Back
                        </Button>
                      )}
                      
                      {currentStep < steps.length - 1 ? (
                        <Button 
                          type="primary" 
                          size="large" 
                          onClick={nextStep}
                          style={{ 
                            background: `linear-gradient(135deg, ${themeColor} 0%, #3a0163 100%)`,
                            borderColor: themeColor,
                            fontWeight: 600,
                            borderRadius: 12,
                            padding: "0 32px",
                            marginLeft: "auto",
                            boxShadow: `0 4px 12px ${themeColor}40`,
                          }}
                        >
                          Continue
                        </Button>
                      ) : (
                        <Button
                          type="primary"
                          size="large"
                          htmlType="submit"
                          loading={submitting}
                          disabled={!otpVerified || !emailOtpVerified}
                          style={{ 
                            background: `linear-gradient(135deg, ${themeColor} 0%, #3a0163 100%)`,
                            borderColor: themeColor,
                            fontWeight: 600,
                            borderRadius: 12,
                            padding: "0 32px",
                            marginLeft: "auto",
                            boxShadow: `0 4px 12px ${themeColor}40`,
                          }}
                        >
                          <RocketOutlined style={{ marginRight: 8 }} />
                          Submit Application
                        </Button>
                      )}
                    </div>

                    {/* Security Footer */}
                    <div style={{ marginTop: 32, textAlign: "center", paddingTop: 24, borderTop: "1px solid #f0f0f0" }}>
                      <Space split={<Divider type="vertical" />} size="middle">
                        <Tooltip title="256-bit SSL Encryption">
                          <Text style={{ fontSize: 12, fontWeight: 500, color: "#666" }}>
                            <SafetyOutlined style={{ color: "#52c41a", marginRight: 4 }} />
                            Secure Encryption
                          </Text>
                        </Tooltip>
                        <Tooltip title="24/7 Customer Support">
                          <Text style={{ fontSize: 12, fontWeight: 500, color: "#666" }}>
                            <CheckCircleFilled style={{ color: "#52c41a", marginRight: 4 }} />
                            24/7 Support
                          </Text>
                        </Tooltip>
                        <Tooltip title="GDPR Compliant">
                          <Text style={{ fontSize: 12, fontWeight: 500, color: "#666" }}>
                            <GlobalOutlined style={{ color: themeColor, marginRight: 4 }} />
                            GDPR Compliant
                          </Text>
                        </Tooltip>
                      </Space>
                    </div>
                  </Spin>
                </Form>
              </div>
            </Card>
          </div>
        </Col>
      </Row>

      <style jsx global>{`
        .ant-input-affix-wrapper, .ant-select-selector, .ant-input, .ant-input-password {
          border-radius: 12px !important;
          transition: all 0.3s ease !important;
          border-color: #e8e8e8 !important;
        }
        
        .ant-input-affix-wrapper:hover, .ant-select-selector:hover, .ant-input:hover, .ant-input-password:hover {
          border-color: ${themeColor} !important;
          box-shadow: 0 0 0 2px ${themeColor}15 !important;
        }
        
        .ant-input-affix-wrapper:focus, .ant-select-selector:focus, .ant-input:focus, .ant-input-password:focus,
        .ant-input-affix-wrapper-focused, .ant-select-focused .ant-select-selector {
          border-color: ${themeColor} !important;
          box-shadow: 0 0 0 3px ${themeColor}25 !important;
        }
        
        .ant-btn-primary {
          transition: all 0.3s ease !important;
        }
        
        .ant-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px ${themeColor}80 !important;
        }
        
        .ant-form-item-label > label {
          font-weight: 700 !important;
        }
        
        .ant-progress-text {
          font-weight: 600 !important;
        }
        
        .ant-modal-content {
          border-radius: 24px !important;
        }
        
        .ant-steps-item-process .ant-steps-item-icon {
          background: ${themeColor} !important;
          border-color: ${themeColor} !important;
        }
        
        .ant-steps-item-finish .ant-steps-item-icon {
          border-color: ${themeColor} !important;
          color: ${themeColor} !important;
        }
        
        .ant-steps-item-finish .ant-steps-item-icon > .ant-steps-icon {
          color: ${themeColor} !important;
        }
        
        .step-content {
          animation: fadeIn 0.4s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default DeveloperRegistration;