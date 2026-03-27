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
} from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Country, City } from "country-state-city";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;
const { Option } = Select;

const DeveloperRegistration = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

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

  // Calculate form completion percentage
  const calculateCompletion = () => {
    const requiredFields = ["name", "email", "password", "phone_number", "country", "city", "address"];
    const filledFields = requiredFields.filter(field => formValues[field] && formValues[field] !== "");
    return Math.floor((filledFields.length / requiredFields.length) * 100);
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

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      <Row style={{ width: "100%", margin: 0, minHeight: "100vh" }}>
        
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
            boxShadow: "4px 0 20px rgba(0,0,0,0.1)",
          }}
        >
          {/* Decorative Background Elements */}
          <div style={{
            position: "absolute",
            top: "-20%",
            right: "-10%",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)",
          }}></div>
          <div style={{
            position: "absolute",
            bottom: "-10%",
            left: "-10%",
            width: "250px",
            height: "250px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)",
          }}></div>
          
          <div style={{ zIndex: 1 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 70,
                height: 70,
                background: "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)",
                borderRadius: "18px",
                marginBottom: 32,
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.3)",
                boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
              }}
            >
              <BuildOutlined style={{ fontSize: 36, color: "#fff" }} />
            </div>

            <Title level={1} style={{ color: "#fff", margin: 0, fontWeight: 800, fontSize: "2.5rem", lineHeight: 1.2, letterSpacing: "-0.02em" }}>
              Developer <br/>Registration
            </Title>
            <div style={{ width: 70, height: 4, background: "#fff", marginTop: 20, marginBottom: 24, borderRadius: 2 }}></div>
            
            <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 15, lineHeight: 1.6, display: "block", fontWeight: 500 }}>
              Join our exclusive network of top-tier property developers. Register to showcase your premium projects to a global audience.
            </Text>
            
            <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CheckCircleFilled style={{ color: "#fff", fontSize: 16 }} />
                </div>
                <Text style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>Admin Approval Required</Text>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <SafetyCertificateOutlined style={{ color: "#fff", fontSize: 16 }} />
                </div>
                <Text style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>Secure Verification Process</Text>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <TrophyOutlined style={{ color: "#fff", fontSize: 16 }} />
                </div>
                <Text style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>Premium Exposure & Benefits</Text>
              </div>
            </div>

            <Divider style={{ background: "rgba(255,255,255,0.2)", margin: "32px 0 24px" }} />
            
            <div>
              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 500 }}>
                Already have an account?{" "}
                <Button 
                  type="link" 
                  onClick={() => navigate("/login")} 
                  style={{ color: "#fff", fontWeight: 800, padding: 0, fontSize: 13 }}
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
            padding: "40px 24px",
            background: "#fff",
          }}
        >
          <div style={{ width: "100%", maxWidth: 620 }}>
            <Card
              bordered={false}
              style={{
                borderRadius: 20,
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                background: "#fff",
                transition: "all 0.3s ease",
              }}
              bodyStyle={{ padding: "36px 40px" }}
            >
              <div style={{ marginBottom: 28, textAlign: "center" }}>
                <Title level={3} style={{ margin: 0, color: "#1a1a1a", fontWeight: 800, letterSpacing: "-0.5px" }}>
                  Create Your Account
                </Title>
                <Text type="secondary" style={{ fontSize: 14, marginTop: 8, display: "block", fontWeight: 500 }}>
                  Join us and start your journey
                </Text>
                <div style={{ marginTop: 16 }}>
                  <Progress 
                    percent={calculateCompletion()} 
                    strokeColor={themeColor}
                    showInfo={true}
                    format={(percent) => `${percent}% Complete`}
                    size="small"
                    strokeWidth={6}
                  />
                </div>
              </div>

              <Form layout="vertical" onFinish={handleSubmit(onSubmit)} size="middle">
                <Spin spinning={submitting}>
                  {/* Company Info */}
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
                          prefix={<UserOutlined style={{ color: themeColor, fontWeight: "bold" }} />}
                          style={{ borderRadius: 10, padding: "8px 12px", fontWeight: 500 }}
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
                    style={{ marginBottom: emailOtpSent && !emailOtpVerified ? 0 : 16 }}
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
                          style={{ borderRadius: 10, padding: "8px 12px", fontWeight: 500 }}
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
                                style={{ color: themeColor, fontWeight: 700, padding: 0, fontSize: 13 }}
                              >
                                {emailOtpSent ? "Resend OTP" : "Send OTP"}
                              </Button>
                            ) : (
                              <span style={{ color: "#52c41a", fontWeight: 700, fontSize: 13 }}>
                                <CheckCircleFilled /> Verified
                              </span>
                            )
                          }
                        />
                      )}
                    />
                  </Form.Item>

                  {emailOtpSent && !emailOtpVerified && (
                    <div style={{ marginTop: -12, marginBottom: 16 }}>
                      <Input
                        placeholder="Enter 6-digit OTP"
                        prefix={<SafetyCertificateOutlined style={{ color: themeColor }} />}
                        value={enteredEmailOtp}
                        onChange={(e) => setEnteredEmailOtp(e.target.value.replace(/\D/g, ""))}
                        maxLength={6}
                        style={{ borderRadius: 10, fontWeight: 500 }}
                        suffix={
                          <Button
                            type="primary"
                            size="small"
                            onClick={handleVerifyEmailOtp}
                            loading={emailOtpLoading}
                            style={{ background: themeColor, borderColor: themeColor, fontWeight: 700, borderRadius: 6 }}
                          >
                            Verify
                          </Button>
                        }
                      />
                    </div>
                  )}

                  {/* Phone */}
                  <Form.Item
                    label={<span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a" }}>Phone Number <span style={{ color: "#ff4d4f" }}>*</span></span>}
                    validateStatus={errors.phone_number ? "error" : ""}
                    help={errors.phone_number?.message}
                    style={{ marginBottom: otpSent && !otpVerified ? 0 : 16 }}
                  >
                    <div style={{ display: "flex", gap: "8px" }}>
                      <div style={{ width: "110px" }}>
                        <Controller
                          name="country_code"
                          control={control}
                          rules={{ required: "Required" }}
                          render={({ field }) => (
                            <Select
                              size="middle"
                              showSearch
                              disabled={otpVerified}
                              style={{ borderRadius: 10, fontWeight: 500 }}
                              {...field}
                            >
                              {countryPhoneData.slice(0, 50).map((country, index) => (
                                <Option key={`${country.iso}-${index}`} value={country.value}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <img
                                      src={`https://flagcdn.com/w20/${country.iso}.png`}
                                      width="20"
                                      alt={country.name}
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
                                `Invalid number`
                              );
                            },
                          }}
                          render={({ field }) => (
                            <Input
                              placeholder="501234567"
                              prefix={<PhoneOutlined style={{ color: themeColor }} />}
                              maxLength={15}
                              disabled={otpVerified}
                              style={{ borderRadius: 10, fontWeight: 500 }}
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
                                    style={{ color: themeColor, fontWeight: 700, padding: 0, fontSize: 13 }}
                                  >
                                    {otpSent ? "Resend OTP" : "Send OTP"}
                                  </Button>
                                ) : (
                                  <span style={{ color: "#52c41a", fontWeight: 700, fontSize: 13 }}>
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
                    <div style={{ marginTop: -12, marginBottom: 16 }}>
                      <Input
                        placeholder="Enter 6-digit OTP"
                        prefix={<SafetyCertificateOutlined style={{ color: themeColor }} />}
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ""))}
                        maxLength={6}
                        style={{ borderRadius: 10, fontWeight: 500 }}
                        suffix={
                          <Button
                            type="primary"
                            size="small"
                            onClick={handleVerifyOtp}
                            loading={otpLoading}
                            style={{ background: themeColor, borderColor: themeColor, fontWeight: 700, borderRadius: 6 }}
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
                          style={{ borderRadius: 10, fontWeight: 500 }}
                          {...field}
                        />
                      )}
                    />
                  </Form.Item>

                  <Divider style={{ margin: "20px 0" }} />

                  {/* Location */}
                  <div style={{ marginBottom: 16 }}>
                    <Title level={5} style={{ marginBottom: 16, color: themeColor, fontWeight: 800 }}>
                      <EnvironmentOutlined style={{ marginRight: 8 }} />
                      Location Details
                    </Title>
                  </div>
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
                              size="middle"
                              showSearch
                              placeholder="Select Country"
                              optionFilterProp="children"
                              style={{ borderRadius: 10, fontWeight: 500 }}
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
                                size="middle"
                                showSearch
                                placeholder="Select City"
                                style={{ borderRadius: 10, fontWeight: 500 }}
                                {...field}
                              >
                                {citiesList.map((city) => (
                                  <Option key={city.name} value={city.name}>
                                    {city.name}
                                  </Option>
                                ))}
                              </Select>
                            ) : (
                              <Input placeholder="Enter City" style={{ borderRadius: 10, fontWeight: 500 }} {...field} />
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
                          rows={2}
                          style={{ borderRadius: 10, fontWeight: 500 }}
                          {...field}
                        />
                      )}
                    />
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    loading={submitting}
                    disabled={!otpVerified || !emailOtpVerified}
                    style={{
                      height: 48,
                      background: `linear-gradient(135deg, ${themeColor} 0%, #3a0163 100%)`,
                      borderColor: themeColor,
                      fontWeight: 800,
                      fontSize: 16,
                      borderRadius: 12,
                      marginTop: 16,
                      boxShadow: `0 4px 15px ${themeColor}60`,
                      letterSpacing: "0.5px",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                  >
                    <RocketOutlined style={{ marginRight: 8 }} />
                    Submit Registration
                  </Button>

                  <div style={{ marginTop: 20, textAlign: "center" }}>
                    <Space split={<Divider type="vertical" />}>
                      <Text style={{ fontSize: 12, fontWeight: 500 }}>
                        <SafetyOutlined style={{ color: "#52c41a", marginRight: 4 }} />
                        Secure Encryption
                      </Text>
                      <Text style={{ fontSize: 12, fontWeight: 500 }}>
                        <CheckCircleFilled style={{ color: "#52c41a", marginRight: 4 }} />
                        24/7 Support
                      </Text>
                    </Space>
                  </div>
                </Spin>
              </Form>
            </Card>
          </div>
        </Col>
      </Row>

      <style jsx global>{`
        .ant-input-affix-wrapper, .ant-select-selector, .ant-input, .ant-input-password {
          border-radius: 10px !important;
          transition: all 0.3s ease !important;
          border: 1px solid #e0e0e0 !important;
        }
        
        .ant-input-affix-wrapper:hover, .ant-select-selector:hover, .ant-input:hover, .ant-input-password:hover {
          border-color: ${themeColor} !important;
          box-shadow: 0 0 0 2px ${themeColor}20 !important;
        }
        
        .ant-input-affix-wrapper:focus, .ant-select-selector:focus, .ant-input:focus, .ant-input-password:focus {
          border-color: ${themeColor} !important;
          box-shadow: 0 0 0 3px ${themeColor}30 !important;
        }
        
        .ant-btn-primary {
          transition: all 0.3s ease !important;
        }
        
        .ant-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px ${themeColor}80 !important;
        }
        
        .ant-form-item-label > label {
          font-weight: 700 !important;
        }
        
        .ant-progress-text {
          font-weight: 600 !important;
        }
        
        .ant-modal-content {
          border-radius: 20px !important;
        }
      `}</style>
    </div>
  );
};

export default DeveloperRegistration;