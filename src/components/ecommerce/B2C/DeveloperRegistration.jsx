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
} from "antd";
import {
  CodeOutlined,
  SafetyOutlined,
  SafetyCertificateOutlined,
  CheckCircleFilled,
  BuildOutlined
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

  const themeColor = "#5C039B";

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
      country_code: "+971", // Default UAE Code
      country: "AE", // Default ISO Code for UAE
      city: "",
      address: "",
    },
  });

  // Watchers
  const selectedCountry = watch("country");
  const watchedPhoneNumber = watch("phone_number");
  const watchedEmail = watch("email");

  // Load Cities when Country changes
  useEffect(() => {
    if (selectedCountry) {
      const updatedCities = City.getCitiesOfCountry(selectedCountry);
      setCitiesList(updatedCities);
    } else {
      setCitiesList([]);
    }
  }, [selectedCountry]);

  // Prepare Phone Codes with Flag Images
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

  // -----------------------------------------------------------
  // 🟢 MOBILE OTP HANDLERS
  // -----------------------------------------------------------
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

  // -----------------------------------------------------------
  // 🟢 EMAIL OTP HANDLERS
  // -----------------------------------------------------------
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

  // -----------------------------------------------------------
  // POPUPS & SUBMIT
  // -----------------------------------------------------------

  const showSuccessPopup = () => {
    Modal.success({
      centered: true,
      title: (
        <div style={{ fontSize: 20, fontWeight: 700, color: "#52c41a" }}>
          Thank You!
        </div>
      ),
      content: (
        <div style={{ marginTop: 10, fontSize: 15, lineHeight: 1.7, color: "#444" }}>
          <div>
            Thank you for your submission! We’ve received your information and will
            review it shortly. Our team will get in touch with you soon to discuss
            the next steps.
          </div>
          <div style={{ marginTop: 12, fontWeight: 500 }}>
            An email has also been sent to your registered email address.
          </div>
        </div>
      ),
      okText: "Go to Login",
      onOk: () => navigate("/login"), // ✅ Navigates to /login on success
    });
  };

  const showAlreadyRegisteredPopup = () => {
    Modal.info({
      centered: true,
      title: <div style={{ fontSize: 20, fontWeight: 700 }}>Already Registered</div>,
      content: (
        <div style={{ marginTop: 10, fontSize: 15, lineHeight: 1.7 }}>
          <div>This email or phone number is already registered.</div>
          <div>Please log in to continue.</div>
        </div>
      ),
      okText: "Go to Login",
      onOk: () => navigate("/login"), // ✅ Direct to login if already exists
    });
  };

  const onSubmit = async (data) => {
    // --- CHECK BOTH VERIFICATIONS ---
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

      // JSON payload formatted exactly as required
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
      console.log("Developer register error:", err);
      const status = err?.response?.status;
      const res = err?.response?.data;
      const apiMsg =
        res?.message || res?.error || "Registration failed. Please try again.";

      const isAlreadyRegistered =
        status === 409 ||
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
    <div style={{ minHeight: "100vh", display: "flex", background: "#f5f5f5" }}>
      <Row style={{ width: "100%", margin: 0 }}>
        
        {/* ================= LEFT SIDE (BRANDING) ================= */}
        <Col
          xs={24}
          md={10}
          style={{
            background: `linear-gradient(135deg, ${themeColor} 0%, #3a0263 100%)`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 40px",
            color: "#fff",
            position: "relative",
            overflow: "hidden"
          }}
        >
          {/* Decorative Background Elements */}
          <div style={{ position: "absolute", top: -50, left: -50, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }}></div>
          <div style={{ position: "absolute", bottom: -100, right: -50, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }}></div>
          
          <div style={{ zIndex: 1, maxWidth: 500, margin: "0 auto" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 70,
                height: 70,
                background: "rgba(255,255,255,0.2)",
                borderRadius: "16px",
                marginBottom: 24,
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.3)"
              }}
            >
              <BuildOutlined style={{ fontSize: 32, color: "#fff" }} />
            </div>

            <Title level={1} style={{ color: "#fff", margin: 0, fontWeight: 800, fontSize: "3rem", lineHeight: 1.2 }}>
              Developer <br/> Registration
            </Title>
            <div style={{ width: 60, height: 4, background: "#fff", marginTop: 24, marginBottom: 24, borderRadius: 2 }}></div>
            
            <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, lineHeight: 1.6, display: "block" }}>
              Join our exclusive network of top-tier property developers. Register your company to showcase your premium projects to a global audience.
            </Text>
            
            <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <CheckCircleFilled style={{ color: "#fff", fontSize: 20 }} />
                <Text style={{ color: "#fff", fontSize: 16 }}>Admin Approval Required</Text>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <CheckCircleFilled style={{ color: "#fff", fontSize: 20 }} />
                <Text style={{ color: "#fff", fontSize: 16 }}>Secure Verification Process</Text>
              </div>
            </div>
          </div>
        </Col>

        {/* ================= RIGHT SIDE (FORM) ================= */}
        <Col
          xs={24}
          md={14}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "40px 20px",
            background: "#f8f9fa" // Light aesthetic gray
          }}
        >
          <div style={{ width: "100%", maxWidth: 650 }}>
            <Card
              bordered={false}
              style={{
                borderRadius: 20,
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                background: "#fff",
              }}
              bodyStyle={{ padding: "40px 32px" }}
            >
              <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
                <Spin spinning={submitting}>
                  <Title
                    level={4}
                    style={{
                      marginBottom: 24,
                      color: "#333",
                      borderBottom: "1px solid #f0f0f0",
                      paddingBottom: 12,
                    }}
                  >
                    <CodeOutlined style={{ color: themeColor, marginRight: 8 }} />
                    Company Information
                  </Title>

                  {/* Company Name */}
                  <Form.Item
                    label={<span style={{ fontWeight: 500 }}>Company Name</span>}
                    required
                    validateStatus={errors.name ? "error" : ""}
                    help={errors.name?.message}
                  >
                    <Controller
                      name="name"
                      control={control}
                      rules={{ required: "Company name is required" }}
                      render={({ field }) => (
                        <Input size="large" placeholder="Emirates Hills Properties" {...field} />
                      )}
                    />
                  </Form.Item>

                  {/* ================= EMAIL SECTION ================= */}
                  <Form.Item
                    label={<span style={{ fontWeight: 500 }}>Email Address</span>}
                    required
                    validateStatus={errors.email ? "error" : ""}
                    help={errors.email?.message}
                    style={{ marginBottom: emailOtpSent && !emailOtpVerified ? 0 : 24 }}
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
                          size="large"
                          placeholder="info@emirateshills.ae"
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
                                style={{ color: themeColor, fontWeight: "bold", padding: 0 }}
                              >
                                {emailOtpSent ? "Resend" : "Send OTP"}
                              </Button>
                            ) : (
                              <span style={{ color: "#52c41a", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                                <CheckCircleFilled /> Verified
                              </span>
                            )
                          }
                        />
                      )}
                    />
                  </Form.Item>

                  {emailOtpSent && !emailOtpVerified && (
                    <div style={{ marginTop: 10, marginBottom: 24, animation: "fadeIn 0.3s ease" }}>
                      <Input
                        size="large"
                        placeholder="Enter 6-digit OTP"
                        prefix={<SafetyCertificateOutlined style={{ color: themeColor }} />}
                        value={enteredEmailOtp}
                        onChange={(e) => setEnteredEmailOtp(e.target.value.replace(/\D/g, ""))}
                        maxLength={6}
                        suffix={
                          <Button
                            type="primary"
                            onClick={handleVerifyEmailOtp}
                            loading={emailOtpLoading}
                            style={{ background: themeColor, borderColor: themeColor, fontWeight: "bold" }}
                          >
                            VERIFY
                          </Button>
                        }
                      />
                      <div style={{ marginTop: 6 }}>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          OTP sent to <span style={{ fontWeight: 500 }}>{watchedEmail}</span>
                        </Text>
                      </div>
                    </div>
                  )}

                  {/* ================= PHONE NUMBER SECTION ================= */}
                  <Form.Item
                    label={<span style={{ fontWeight: 500 }}>Phone Number</span>}
                    required
                    validateStatus={errors.phone_number ? "error" : ""}
                    help={errors.phone_number?.message}
                    style={{ marginBottom: otpSent && !otpVerified ? 0 : 24 }}
                  >
                    <div style={{ display: "flex", gap: "8px", alignItems: "stretch" }}>
                      <div style={{ width: "130px" }}>
                        <Controller
                          name="country_code"
                          control={control}
                          rules={{ required: "Required" }}
                          render={({ field }) => (
                            <Select
                              size="large"
                              showSearch
                              disabled={otpVerified}
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                (option["data-search"] || "").toLowerCase().includes(input.toLowerCase())
                              }
                              {...field}
                              style={{ width: "100%" }}
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
                                      width="20"
                                      alt={country.name}
                                      style={{ marginRight: 6 }}
                                    />
                                    <span>{country.phone}</span>
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
                                `Invalid length for ${countryCode}`
                              );
                            },
                          }}
                          render={({ field }) => (
                            <Input
                              size="large"
                              placeholder="501234567"
                              maxLength={15}
                              disabled={otpVerified}
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
                                    style={{ color: themeColor, fontWeight: "bold", padding: 0 }}
                                  >
                                    {otpSent ? "Resend" : "Send OTP"}
                                  </Button>
                                ) : (
                                  <span style={{ color: "#52c41a", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
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
                    <div style={{ marginTop: 10, marginBottom: 24, animation: "fadeIn 0.3s ease" }}>
                      <Input
                        size="large"
                        placeholder="Enter 6-digit OTP"
                        prefix={<SafetyCertificateOutlined style={{ color: themeColor }} />}
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ""))}
                        maxLength={6}
                        suffix={
                          <Button
                            type="primary"
                            onClick={handleVerifyOtp}
                            loading={otpLoading}
                            style={{ background: themeColor, borderColor: themeColor, fontWeight: "bold" }}
                          >
                            VERIFY
                          </Button>
                        }
                      />
                      <div style={{ marginTop: 6 }}>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          OTP sent to <span style={{ fontWeight: 500 }}>{getValues("country_code")} {watchedPhoneNumber}</span>
                        </Text>
                      </div>
                    </div>
                  )}

                  {/* Password */}
                  <Form.Item
                    label={<span style={{ fontWeight: 500 }}>Account Password</span>}
                    required
                    validateStatus={errors.password ? "error" : ""}
                    help={errors.password?.message}
                  >
                    <Controller
                      name="password"
                      control={control}
                      rules={{
                        required: "Password is required",
                        minLength: { value: 6, message: "Minimum 6 characters required" },
                      }}
                      render={({ field }) => (
                        <Input.Password
                          size="large"
                          placeholder="Create a strong password"
                          {...field}
                        />
                      )}
                    />
                  </Form.Item>

                  <Title
                    level={4}
                    style={{
                      marginBottom: 24,
                      marginTop: 32,
                      color: "#333",
                      borderBottom: "1px solid #f0f0f0",
                      paddingBottom: 12,
                    }}
                  >
                    <CodeOutlined style={{ color: themeColor, marginRight: 8 }} />
                    Location Details
                  </Title>

                  {/* Location Section */}
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label={<span style={{ fontWeight: 500 }}>Country</span>}
                        required
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
                              filterOption={(input, option) =>
                                option.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              onChange={(val) => {
                                field.onChange(val);
                                setValue("city", undefined);
                              }}
                              value={field.value}
                            >
                              {Country.getAllCountries().map((country) => (
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
                        label={<span style={{ fontWeight: 500 }}>City</span>}
                        required
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
                                optionFilterProp="children"
                                {...field}
                              >
                                {citiesList.map((city) => (
                                  <Option key={city.name} value={city.name}>
                                    {city.name}
                                  </Option>
                                ))}
                              </Select>
                            ) : (
                              <Input size="large" placeholder="City" {...field} />
                            )
                          }
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Address */}
                  <Form.Item
                    label={<span style={{ fontWeight: 500 }}>Full Address</span>}
                    required
                    validateStatus={errors.address ? "error" : ""}
                    help={errors.address?.message}
                  >
                    <Controller
                      name="address"
                      control={control}
                      rules={{ required: "Address is required" }}
                      render={({ field }) => (
                        <Input size="large" placeholder="Building No, Street Name..." {...field} />
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
                      height: 54,
                      background: themeColor,
                      borderColor: themeColor,
                      fontWeight: "bold",
                      color: "#fff",
                      fontSize: 16,
                      borderRadius: 12,
                      marginTop: 10,
                      boxShadow: `0 4px 14px ${themeColor}60`
                    }}
                  >
                    Submit Registration
                  </Button>

                  <div style={{ marginTop: 24, textAlign: "center" }}>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      <SafetyOutlined style={{ color: "#52c41a", marginRight: 4 }} />
                      Your data is securely encrypted.
                    </Text>
                  </div>
                </Spin>
              </Form>
            </Card>
          </div>
        </Col>
      </Row>

      {/* CSS for fading in the OTP box */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default DeveloperRegistration;