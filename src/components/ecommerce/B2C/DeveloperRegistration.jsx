import React, { useState, useEffect, useMemo } from "react";
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  Typography,
  message,
  Spin,
  Modal,
  Select,
  notification,
  Divider,
} from "antd";
import {
  SafetyCertificateOutlined,
  CheckCircleFilled,
  BuildOutlined,
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  UserOutlined,
  RocketOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Country, City } from "country-state-city";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;
const { Option } = Select;

const THEME      = "#5C029B";
const THEME_DEEP = "#3a0163";

/* ── Sidebar step item ── */
const SidebarStep = ({ icon, label, status }) => {
  const isActive = status === "active";
  const isDone   = status === "done";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "11px 14px", borderRadius: 10,
      background: isActive ? "rgba(255,255,255,0.14)" : "transparent",
      transition: "background 0.2s",
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 9, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 15,
        background: isActive
          ? "rgba(255,255,255,0.22)"
          : isDone
          ? "rgba(255,255,255,0.12)"
          : "rgba(255,255,255,0.07)",
        color: isActive ? "#fff" : "rgba(255,255,255,0.55)",
        border: `1px solid ${isActive ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.12)"}`,
      }}>
        {isDone ? <CheckCircleFilled style={{ fontSize: 15, color: "#a3e635" }} /> : icon}
      </div>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: isActive ? "#fff" : "rgba(255,255,255,0.55)" }}>
        {label}
      </span>
    </div>
  );
};

const STEPS = [
  { icon: <UserOutlined />,              label: "Basic Info"    },
  { icon: <SafetyCertificateOutlined />, label: "Verification"  },
  { icon: <EnvironmentOutlined />,       label: "Location"      },
];

const DeveloperRegistration = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting,  setSubmitting]  = useState(false);

  const [citiesList, setCitiesList] = useState([]);

  const [otpSent,       setOtpSent]       = useState(false);
  const [otpVerified,   setOtpVerified]   = useState(false);
  const [enteredOtp,    setEnteredOtp]    = useState("");
  const [otpLoading,    setOtpLoading]    = useState(false);

  const [emailOtpSent,     setEmailOtpSent]     = useState(false);
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);
  const [enteredEmailOtp,  setEnteredEmailOtp]  = useState("");
  const [emailOtpLoading,  setEmailOtpLoading]  = useState(false);

  const {
    control, handleSubmit, watch, setValue, getValues, trigger,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      first_name:       "",
      last_name:        "",
      name:             "",
      email:            "",
      password:         "",
      confirm_password: "",
      phone_number:     "",
      country_code:     "+971",
      country:          "AE",
      city:             "",
      address:          "",
    },
  });

  const selectedCountry    = watch("country");
  const watchedPhoneNumber = watch("phone_number");
  const watchedEmail       = watch("email");

  useEffect(() => {
    setCitiesList(selectedCountry ? City.getCitiesOfCountry(selectedCountry) : []);
  }, [selectedCountry]);

  const countryPhoneData = useMemo(() =>
    Country.getAllCountries().map((c) => ({
      iso:   c.isoCode.toLowerCase(),
      name:  c.name,
      phone: `+${c.phonecode}`,
      value: `+${c.phonecode}`,
    })), []);

  /* ── Step nav ── */
  const handleNextStep = async () => {
    if (currentStep === 1) {
      const ok = await trigger(["first_name", "last_name", "name", "password", "confirm_password"]);
      if (!ok) return;
    }
    if (currentStep === 2) {
      if (!emailOtpVerified) { message.error("Please verify your email."); return; }
      if (!otpVerified)      { message.error("Please verify your phone number."); return; }
    }
    setCurrentStep((s) => s + 1);
  };
  const handlePrevStep = () => setCurrentStep((s) => s - 1);

  /* ── Phone OTP ── */
  const handleSendOtp = async () => {
    const cc = getValues("country_code"), num = getValues("phone_number");
    if (!cc || !num) { message.error("Enter phone number first."); return; }
    setOtpLoading(true);
    try {
      await apiService.post("/otp/send-otp", { country_code: cc, phone_number: num });
      message.success("OTP sent!");
      setOtpSent(true); setOtpVerified(false);
    } catch (e) {
      notification.error({ message: "OTP Error", description: e?.response?.data?.message || "Failed" });
    } finally { setOtpLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (!enteredOtp) { message.error("Enter the OTP"); return; }
    setOtpLoading(true);
    try {
      await apiService.post("/otp/verify-otp", {
        country_code: getValues("country_code"),
        phone_number: getValues("phone_number"),
        otp: enteredOtp,
      });
      message.success("Phone verified!");
      setOtpVerified(true); setOtpSent(false);
    } catch (e) {
      notification.error({ message: "Verification Failed", description: e?.response?.data?.message || "Invalid OTP" });
    } finally { setOtpLoading(false); }
  };

  /* ── Email OTP ── */
  const handleSendEmailOtp = async () => {
    const email = getValues("email");
    if (!email) { message.error("Enter email first."); return; }
    setEmailOtpLoading(true);
    try {
      await apiService.post("/otp/email-otp/send", { email });
      message.success("OTP sent to your email!");
      setEmailOtpSent(true); setEmailOtpVerified(false);
    } catch (e) {
      notification.error({ message: "OTP Error", description: e?.response?.data?.message || "Failed" });
    } finally { setEmailOtpLoading(false); }
  };

  const handleVerifyEmailOtp = async () => {
    if (!enteredEmailOtp) { message.error("Enter the OTP"); return; }
    setEmailOtpLoading(true);
    try {
      await apiService.post("/otp/email-otp/verify", { email: getValues("email"), otp: enteredEmailOtp });
      message.success("Email verified!");
      setEmailOtpVerified(true); setEmailOtpSent(false);
    } catch (e) {
      notification.error({ message: "Verification Failed", description: e?.response?.data?.message || "Invalid OTP" });
    } finally { setEmailOtpLoading(false); }
  };

  /* ── Modals ── */
  const showSuccessPopup = () => {
    Modal.success({
      centered: true,
      title: (
        <div style={{ fontSize: 18, fontWeight: 700, color: "#52c41a" }}>
          <CheckCircleFilled style={{ marginRight: 8, fontSize: 20 }} />
          Registration Submitted!
        </div>
      ),
      content: (
        <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.7 }}>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>Thank you for your submission!</div>
          <div>We'll review it and get back within 24–48 hours.</div>
          <div style={{ marginTop: 10, background: "#f0fdf4", padding: 10, borderRadius: 8, border: "1px solid #bbf7d0" }}>
            <MailOutlined style={{ marginRight: 6, color: "#52c41a" }} />
            <span style={{ fontWeight: 500 }}>A confirmation email has been sent.</span>
          </div>
        </div>
      ),
      okText: "Go to Login",
      okButtonProps: { style: { background: THEME, borderColor: THEME, fontWeight: 600 } },
      onOk: () => navigate("/login"),
    });
  };

  const showAlreadyRegisteredPopup = () => {
    Modal.info({
      centered: true,
      title: <div style={{ fontSize: 18, fontWeight: 700 }}>Already Registered</div>,
      content: (
        <div style={{ marginTop: 10, fontSize: 14 }}>
          <div style={{ marginBottom: 6 }}>This email or phone is already registered.</div>
          <div style={{ fontWeight: 500 }}>Please log in to continue.</div>
        </div>
      ),
      okText: "Go to Login",
      okButtonProps: { style: { background: THEME, borderColor: THEME, fontWeight: 600 } },
      onOk: () => navigate("/login"),
    });
  };

  /* ── Submit ── */
  const onSubmit = async (data) => {
    if (!otpVerified)      { message.error("Verify phone number first."); return; }
    if (!emailOtpVerified) { message.error("Verify email first."); return; }
    setSubmitting(true);
    try {
      const countryObj = Country.getCountryByCode(data.country);
      await apiService.post("/developer/create-developer", {
        name:         `${data.first_name} ${data.last_name}`.trim(),
        email:        data.email,
        password:     data.password,
        phone_number: `${data.country_code}${data.phone_number}`,
        country_code: data.country_code,
        country:      countryObj ? countryObj.name : data.country,
        city:         data.city,
        address:      data.address,
      });
      showSuccessPopup();
    } catch (err) {
      const status = err?.response?.status;
      const res    = err?.response?.data;
      const apiMsg = res?.message || res?.error || "Registration failed.";
      const already = status === 409 || ["already","exist","duplicate"].some(k => apiMsg.toLowerCase().includes(k));
      if (already) showAlreadyRegisteredPopup();
      else message.error(apiMsg);
    } finally { setSubmitting(false); }
  };

  /* ── shared styles ── */
  const INP = { height: 52, borderRadius: 10, fontSize: 15 };
  const LBL = { fontWeight: 700, fontSize: 18, color: "#1e1030" };
  const REQ = <span style={{ color: "#e63946", marginLeft: 2 }}>*</span>;

  /* ════════════════════════
     RENDER
  ════════════════════════ */
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #d7c3ff, #a77bff, #7f4cff)",
      padding: "32px 16px",
    }}>
      <div style={{
        display: "flex",
        width: "100%",
        maxWidth: 1100,
        minHeight: 640,
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(92,3,156,0.18)",
      }}>

        {/* ════ SIDEBAR ════ */}
        <div style={{
          width: 270, flexShrink: 0,
          background: `linear-gradient(170deg, ${THEME} 0%, ${THEME_DEEP} 100%)`,
          padding: "40px 22px",
          display: "flex", flexDirection: "column",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 44 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 11,
              background: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.22)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <BuildOutlined style={{ color: "#E8C97A", fontSize: 21 }} />
            </div>
            <span style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: 30, fontWeight: 700, color: "#fff" }}>
              Xoto
            </span>
          </div>

          {/* Title */}
          <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: 22, fontWeight: 700, color: "#fff", lineHeight: 1.25, marginBottom: 10 }}>
            Developer<br />Registration
          </div>
          <div style={{ width: 42, height: 3, background: "#E8C97A", borderRadius: 2, marginBottom: 16 }} />
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.62)", lineHeight: 1.7, marginBottom: 36 }}>
            Join our exclusive network of top-tier property developers.
          </p>

          {/* Steps */}
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {STEPS.map((step, i) => (
              <React.Fragment key={i}>
                <SidebarStep
                  icon={step.icon}
                  label={step.label}
                  status={currentStep === i + 1 ? "active" : currentStep > i + 1 ? "done" : "idle"}
                />
                {i < STEPS.length - 1 && (
                  <div style={{ width: 2, height: 12, background: "rgba(255,255,255,0.15)", marginLeft: 30 }} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Footer */}
          <div style={{ marginTop: "auto", paddingTop: 28, borderTop: "1px solid rgba(255,255,255,0.12)" }}>
            <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.58)" }}>
              Already registered?{" "}
              <Button
                type="link"
                onClick={() => navigate("/login")}
                style={{ color: "#E8C97A", fontWeight: 700, padding: 0, fontSize: 13, height: "auto" }}
              >
                Sign in →
              </Button>
            </Text>
          </div>
        </div>

        {/* ════ MAIN FORM ════ */}
        <div style={{
          flex: 1, background: "#fff",
          padding: "44px 56px",
          display: "flex", flexDirection: "column",
          overflowY: "auto",
        }}>

          {/* Header */}
          <div style={{ marginBottom: 30 }}>
            <Title level={2} style={{ margin: 0, fontWeight: 800, fontSize: 30, color: "#1e1030", fontFamily: "'Georgia', serif" }}>
              {currentStep === 1 && "Basic Information"}
              {currentStep === 2 && "Verification"}
              {currentStep === 3 && "Location Details"}
            </Title>
            <Text style={{ fontSize: 16, color: "#9d8fbf", marginTop: 4, display: "block" }}>
              Step {currentStep} of 3
            </Text>
            {/* Progress bar */}
            <div style={{ height: 4, background: "#ede8f6", borderRadius: 3, marginTop: 14, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${(currentStep / 3) * 100}%`,
                background: `linear-gradient(90deg, ${THEME}, #9b40e8)`,
                borderRadius: 3,
                transition: "width 0.4s ease",
              }} />
            </div>
          </div>

          <Spin spinning={submitting}>
            <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>

              {/* ══ STEP 1 ══ */}
              {currentStep === 1 && (
                <>
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label={<span style={LBL}>First Name {REQ}</span>}
                        validateStatus={errors.first_name ? "error" : ""}
                        help={errors.first_name?.message}
                      >
                        <Controller name="first_name" control={control}
                          rules={{ required: "First name is required" }}
                          render={({ field }) => (
                            <Input placeholder="First name"
                              prefix={<UserOutlined style={{ color: THEME }} />}
                              style={INP} {...field} />
                          )} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label={<span style={LBL}>Last Name {REQ}</span>}
                        validateStatus={errors.last_name ? "error" : ""}
                        help={errors.last_name?.message}
                      >
                        <Controller name="last_name" control={control}
                          rules={{ required: "Last name is required" }}
                          render={({ field }) => (
                            <Input placeholder="Last name"
                              prefix={<UserOutlined style={{ color: THEME }} />}
                              style={INP} {...field} />
                          )} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    label={<span style={LBL}>Company Name {REQ}</span>}
                    validateStatus={errors.name ? "error" : ""}
                    help={errors.name?.message}
                  >
                    <Controller name="name" control={control}
                      rules={{ required: "Company name is required" }}
                      render={({ field }) => (
                        <Input placeholder="e.g., Emirates Hills Properties"
                          prefix={<BuildOutlined style={{ color: THEME }} />}
                          style={INP} {...field} />
                      )} />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label={<span style={LBL}>Password {REQ}</span>}
                        validateStatus={errors.password ? "error" : ""}
                        help={errors.password?.message}
                      >
                        <Controller name="password" control={control}
                          rules={{ required: "Password is required", minLength: { value: 6, message: "Min 6 characters" } }}
                          render={({ field }) => (
                            <Input.Password placeholder="Min. 6 characters"
                              prefix={<LockOutlined style={{ color: THEME }} />}
                              style={INP} {...field} />
                          )} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label={<span style={LBL}>Confirm Password {REQ}</span>}
                        validateStatus={errors.confirm_password ? "error" : ""}
                        help={errors.confirm_password?.message}
                      >
                        <Controller name="confirm_password" control={control}
                          rules={{
                            required: "Please confirm password",
                            validate: (v) => v === getValues("password") || "Passwords do not match",
                          }}
                          render={({ field }) => (
                            <Input.Password placeholder="Repeat password"
                              prefix={<LockOutlined style={{ color: THEME }} />}
                              style={INP} {...field} />
                          )} />
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              )}

              {/* ══ STEP 2 ══ */}
              {currentStep === 2 && (
                <>
                  {/* Email */}
                  <Form.Item
                    label={<span style={LBL}>Email Address {REQ}</span>}
                    validateStatus={errors.email ? "error" : ""}
                    help={errors.email?.message}
                    style={{ marginBottom: emailOtpSent && !emailOtpVerified ? 8 : 20 }}
                  >
                    <Controller name="email" control={control}
                      rules={{ required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email" } }}
                      render={({ field }) => (
                        <Input placeholder="info@company.com"
                          prefix={<MailOutlined style={{ color: THEME }} />}
                          style={INP}
                          disabled={emailOtpVerified}
                          {...field}
                          onChange={(e) => { field.onChange(e); if (emailOtpVerified) { setEmailOtpVerified(false); setEmailOtpSent(false); } }}
                          suffix={
                            !emailOtpVerified
                              ? <Button type="link" onClick={handleSendEmailOtp} loading={emailOtpLoading} disabled={!watchedEmail}
                                  style={{ color: THEME, fontWeight: 700, padding: 0, fontSize: 13, height: "auto" }}>
                                  {emailOtpSent ? "Resend OTP" : "Send OTP"}
                                </Button>
                              : <span style={{ color: "#22c55e", fontWeight: 700, fontSize: 13 }}>
                                  <CheckCircleFilled style={{ marginRight: 4 }} />Verified
                                </span>
                          }
                        />
                      )} />
                  </Form.Item>

                  {emailOtpSent && !emailOtpVerified && (
                    <div style={{ marginBottom: 20 }}>
                      <Input placeholder="Enter 6-digit OTP"
                        prefix={<SafetyCertificateOutlined style={{ color: THEME }} />}
                        value={enteredEmailOtp}
                        onChange={(e) => setEnteredEmailOtp(e.target.value.replace(/\D/g, ""))}
                        maxLength={6}
                        style={{ ...INP, letterSpacing: 6 }}
                        suffix={
                          <Button type="primary" size="small" onClick={handleVerifyEmailOtp} loading={emailOtpLoading}
                            style={{ background: THEME, borderColor: THEME, fontWeight: 700, borderRadius: 8, height: 36 }}>
                            Verify
                          </Button>
                        }
                      />
                    </div>
                  )}

                  {/* Phone */}
                  <Form.Item
                    label={<span style={LBL}>Phone Number {REQ}</span>}
                    validateStatus={errors.phone_number ? "error" : ""}
                    help={errors.phone_number?.message}
                    style={{ marginBottom: otpSent && !otpVerified ? 8 : 20 }}
                  >
                    <div style={{ display: "flex", gap: 10 }}>
                      <div style={{ width: 118 }}>
                        <Controller name="country_code" control={control}
                          rules={{ required: "Required" }}
                          render={({ field }) => (
                            <Select showSearch disabled={otpVerified} style={{ width: "100%" }} {...field}>
                              {countryPhoneData.slice(0, 50).map((c, i) => (
                                <Option key={`${c.iso}-${i}`} value={c.value}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <img src={`https://flagcdn.com/w20/${c.iso}.png`} width="18" alt={c.name} />
                                    <span style={{ fontSize: 13 }}>{c.phone}</span>
                                  </div>
                                </Option>
                              ))}
                            </Select>
                          )} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <Controller name="phone_number" control={control}
                          rules={{
                            required: "Phone number is required",
                            validate: (v) => {
                              const cc = getValues("country_code");
                              if (!cc) return "Select code first";
                              const p = parsePhoneNumberFromString(`${cc}${v}`);
                              return (p && p.isValid()) || "Invalid number";
                            },
                          }}
                          render={({ field }) => (
                            <Input placeholder="501234567"
                              prefix={<PhoneOutlined style={{ color: THEME }} />}
                              maxLength={15} disabled={otpVerified} style={INP}
                              {...field}
                              onChange={(e) => { field.onChange(e.target.value.replace(/\D/g, "")); if (otpVerified) { setOtpVerified(false); setOtpSent(false); } }}
                              suffix={
                                !otpVerified
                                  ? <Button type="link" onClick={handleSendOtp} loading={otpLoading} disabled={!watchedPhoneNumber}
                                      style={{ color: THEME, fontWeight: 700, padding: 0, fontSize: 13, height: "auto" }}>
                                      {otpSent ? "Resend OTP" : "Send OTP"}
                                    </Button>
                                  : <span style={{ color: "#22c55e", fontWeight: 700, fontSize: 13 }}>
                                      <CheckCircleFilled style={{ marginRight: 4 }} />Verified
                                    </span>
                              }
                            />
                          )} />
                      </div>
                    </div>
                  </Form.Item>

                  {otpSent && !otpVerified && (
                    <div style={{ marginBottom: 20 }}>
                      <Input placeholder="Enter 6-digit OTP"
                        prefix={<SafetyCertificateOutlined style={{ color: THEME }} />}
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ""))}
                        maxLength={6}
                        style={{ ...INP, letterSpacing: 6 }}
                        suffix={
                          <Button type="primary" size="small" onClick={handleVerifyOtp} loading={otpLoading}
                            style={{ background: THEME, borderColor: THEME, fontWeight: 700, borderRadius: 8, height: 36 }}>
                            Verify
                          </Button>
                        }
                      />
                    </div>
                  )}
                </>
              )}

              {/* ══ STEP 3 ══ */}
              {currentStep === 3 && (
                <>
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label={<span style={LBL}>Country {REQ}</span>}
                        validateStatus={errors.country ? "error" : ""}
                        help={errors.country?.message}
                      >
                        <Controller name="country" control={control}
                          rules={{ required: "Country is required" }}
                          render={({ field }) => (
                            <Select showSearch placeholder="Select Country" optionFilterProp="children"
                              style={{ width: "100%" }}
                              onChange={(v) => { field.onChange(v); setValue("city", undefined); }}
                              value={field.value}>
                              {Country.getAllCountries().slice(0, 100).map((c) => (
                                <Option key={c.isoCode} value={c.isoCode}>{c.name}</Option>
                              ))}
                            </Select>
                          )} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label={<span style={LBL}>City {REQ}</span>}
                        validateStatus={errors.city ? "error" : ""}
                        help={errors.city?.message}
                      >
                        <Controller name="city" control={control}
                          rules={{ required: "City is required" }}
                          render={({ field }) =>
                            citiesList.length > 0
                              ? <Select showSearch placeholder="Select City" style={{ width: "100%" }} {...field}>
                                  {citiesList.map((c) => <Option key={c.name} value={c.name}>{c.name}</Option>)}
                                </Select>
                              : <Input placeholder="Enter city" style={INP} {...field} />
                          } />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    label={<span style={LBL}>Address {REQ}</span>}
                    validateStatus={errors.address ? "error" : ""}
                    help={errors.address?.message}
                  >
                    <Controller name="address" control={control}
                      rules={{ required: "Address is required" }}
                      render={({ field }) => (
                        <Input.TextArea placeholder="Building No, Street Name, Area..."
                          rows={3}
                          style={{ borderRadius: 10, fontSize: 14, resize: "none", padding: "12px 14px" }}
                          {...field} />
                      )} />
                  </Form.Item>
                </>
              )}

              {/* ══ NAVIGATION ══ */}
              <Divider style={{ margin: "22px 0 18px" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {currentStep > 1
                  ? <Button onClick={handlePrevStep}
                      style={{ height: 48, borderRadius: 10, fontWeight: 600, paddingInline: 26, fontSize: 14, borderColor: "#ddd" }}>
                      ← Back
                    </Button>
                  : <span />}

                {currentStep < 3
                  ? <Button type="primary" onClick={handleNextStep}
                      style={{ height: 48, background: `linear-gradient(135deg, ${THEME}, ${THEME_DEEP})`, border: "none",
                        borderRadius: 10, fontWeight: 700, paddingInline: 34, fontSize: 14,
                        boxShadow: `0 4px 16px ${THEME}45` }}>
                      Continue →
                    </Button>
                  : <Button type="primary" htmlType="submit" loading={submitting}
                      disabled={!otpVerified || !emailOtpVerified}
                      icon={<RocketOutlined />}
                      style={{ height: 48, background: `linear-gradient(135deg, ${THEME}, ${THEME_DEEP})`, border: "none",
                        borderRadius: 10, fontWeight: 700, paddingInline: 34, fontSize: 14,
                        boxShadow: `0 4px 16px ${THEME}45` }}>
                      Submit Registration
                    </Button>}
              </div>

              {/* Trust badges */}
              <div style={{ marginTop: 18, display: "flex", justifyContent: "center", gap: 28 }}>
                <Text style={{ fontSize: 12, color: "#b0a0cc" }}>
                  <SafetyOutlined style={{ color: "#22c55e", marginRight: 5 }} />Secure Encryption
                </Text>
                <Text style={{ fontSize: 12, color: "#b0a0cc" }}>
                  <CheckCircleFilled style={{ color: "#22c55e", marginRight: 5 }} />24/7 Support
                </Text>
              </div>

            </Form>
          </Spin>
        </div>
      </div>

      {/* ════ CSS OVERRIDES ════ */}
      <style>{`
        /* ── Remove inner input border inside wrapper (fixes double border) ── */
        .ant-input-affix-wrapper .ant-input {
          border: none !important;
          box-shadow: none !important;
          background: transparent !important;
          padding: 0 !important;
          height: auto !important;
        }

        /* ── Wrappers / standalone inputs / selects ── */
        .ant-input-affix-wrapper,
        .ant-input:not(.ant-input-affix-wrapper .ant-input),
        .ant-select-selector {
          border-radius: 10px !important;
          border: 1.5px solid #e4daf4 !important;
          height: 52px !important;
          display: flex !important;
          align-items: center !important;
          font-size: 15px !important;
          box-shadow: none !important;
          transition: border-color 0.2s, box-shadow 0.2s !important;
          font-family: 'Georgia', 'Times New Roman', serif !important;
        }

        /* ── Textarea ── */
        .ant-input-textarea textarea {
          border-radius: 10px !important;
          border: 1.5px solid #e4daf4 !important;
          font-size: 15px !important;
          resize: none !important;
          font-family: 'Georgia', 'Times New Roman', serif !important;
          transition: border-color 0.2s, box-shadow 0.2s !important;
        }
        .ant-input-textarea textarea:hover,
        .ant-input-textarea textarea:focus {
          border-color: ${THEME} !important;
          box-shadow: 0 0 0 3px rgba(92,2,155,0.09) !important;
          outline: none !important;
        }

        /* ── Hover ── */
        .ant-input-affix-wrapper:hover,
        .ant-input:not(.ant-input-affix-wrapper .ant-input):hover,
        .ant-select-selector:hover {
          border-color: ${THEME} !important;
        }

        /* ── Focus ── */
        .ant-input-affix-wrapper-focused,
        .ant-input-affix-wrapper:focus-within,
        .ant-select-focused .ant-select-selector {
          border-color: ${THEME} !important;
          box-shadow: 0 0 0 3px rgba(92,2,155,0.09) !important;
        }

        /* ── Select height ── */
        .ant-select-single .ant-select-selector {
          height: 52px !important;
          align-items: center !important;
        }
        .ant-select-single .ant-select-selector .ant-select-selection-item,
        .ant-select-single .ant-select-selector .ant-select-selection-placeholder {
          line-height: 50px !important;
          font-size: 15px !important;
          font-family: 'Georgia', 'Times New Roman', serif !important;
        }

        /* ── Form items ── */
        .ant-form-item {
          margin-bottom: 22px !important;
        }
        .ant-form-item-label > label {
          font-family: 'Georgia', 'Times New Roman', serif !important;
          font-weight: 700 !important;
          font-size: 14px !important;
          color: #1e1030 !important;
        }

        /* ── Placeholder ── */
        .ant-input::placeholder,
        .ant-input-affix-wrapper input::placeholder {
          color: #c2b8d8 !important;
          font-size: 15px !important;
          font-family: 'Georgia', 'Times New Roman', serif !important;
        }

        /* ── Font on inputs ── */
        .ant-input,
        .ant-input-affix-wrapper input {
          font-family: 'Georgia', 'Times New Roman', serif !important;
        }

        /* ── Button hover ── */
        .ant-btn-primary:not(:disabled):hover {
          opacity: 0.88 !important;
          transform: translateY(-1px) !important;
        }

        /* ── Modal ── */
        .ant-modal-content {
          border-radius: 18px !important;
        }
      `}</style>
    </div>
  );
};

export default DeveloperRegistration;