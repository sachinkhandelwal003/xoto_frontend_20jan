import React, { useState, useContext, useMemo } from "react";
import { Sparkles, User, Mail } from "lucide-react";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import {
  Button, Modal, Form, Input, Select,
  notification, ConfigProvider, Typography,
} from "antd";
import { SafetyCertificateOutlined, CheckCircleFilled, MobileOutlined } from "@ant-design/icons";
import { Country, State, City } from "country-state-city";
import { AuthContext } from "../../manageApi/context/AuthContext";
import { apiService } from "../../manageApi/utils/custom.apiservice";

const { Option } = Select;
const { Text } = Typography;

const BRAND_PURPLE = "#5C039B";
const BRAND_PURPLE_DARK = "#4a027d";

const STYLES = `
  @keyframes lgm-in {
    from { opacity: 0; transform: translateY(-5px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .lgm-in { animation: lgm-in 0.22s ease; }
  .lgm-wrap { display: flex; min-height: 560px; background: #fff; }
  .lgm-left { width: 42%; position: relative; flex-shrink: 0; display: none; flex-direction: column; }
  @media (min-width: 768px) { .lgm-left { display: flex; } }
  .lgm-right { flex: 1; padding: 28px 22px 32px; overflow-y: auto; max-height: 92vh; min-width: 0; }
  @media (min-width: 768px) { .lgm-right { padding: 36px 40px; } }

  .lgm-tabs { display: flex; background: #f3f4f6; border-radius: 14px; padding: 5px; margin-bottom: 22px; }
  .lgm-tab { flex: 1; border: none; background: transparent; border-radius: 10px; padding: 10px 8px; font-size: 14px; font-weight: 500; cursor: pointer; color: #6b7280; transition: all .2s; white-space: nowrap; }
  .lgm-tab.active { background: #fff; color: #111827; font-weight: 700; box-shadow: 0 1px 5px rgba(0,0,0,0.1); }

  .lgm-label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; }
  .lgm-required::after { content: ' *'; color: #ef4444; }

  /* country code full-width select */
  .lgm-code-sel .ant-select-selector { height: 48px !important; border-radius: 10px !important; padding: 0 12px !important; display: flex !important; align-items: center !important; }
  .lgm-code-sel .ant-select-selection-item { display: flex !important; align-items: center !important; gap: 8px !important; font-size: 14px !important; font-weight: 600 !important; line-height: normal !important; }
  .lgm-code-sel { display: block; margin-bottom: 12px; }

  /* number row: input takes all space, button fixed */
  .lgm-num-row { display: flex; gap: 10px; align-items: stretch; }
  .lgm-num-row .ant-input-affix-wrapper { flex: 1 1 0%; min-width: 0; border-radius: 10px !important; height: 48px; font-size: 15px; }
  .lgm-otp-btn { flex-shrink: 0 !important; height: 48px !important; border-radius: 10px !important; font-weight: 700 !important; font-size: 13px !important; white-space: nowrap !important; padding: 0 14px !important; min-width: 86px; }

  .lgm-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 13px; font-weight: 600; color: #16a34a; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 0 12px; flex-shrink: 0; white-space: nowrap; height: 48px; }

  .lgm-verify-row { display: flex; gap: 8px; align-items: stretch; margin-top: 8px; }
  .lgm-verify-row .ant-input-affix-wrapper { flex: 1 1 0%; min-width: 0; border-radius: 10px !important; height: 46px; }
  .lgm-verify-btn { flex-shrink: 0 !important; height: 46px !important; border-radius: 10px !important; font-weight: 700 !important; font-size: 13px !important; white-space: nowrap !important; padding: 0 14px !important; min-width: 72px; }

  .lgm-submit { width: 100%; height: 52px !important; border-radius: 12px !important; font-size: 16px !important; font-weight: 700 !important; margin-top: 20px; border: none !important; }
  .lgm-name-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
  .lgm-sc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

  .lgm-right .ant-input-lg, .lgm-right .ant-select-lg .ant-select-selector { border-radius: 10px !important; }
`;

const LeadGenerationModal = ({
  visible, onCancel, onAuthSuccess,
  defaultTab = "signin", fullscreen = false,
}) => {
  const [form] = Form.useForm();
  const { login } = useContext(AuthContext);

  const [activeTab, setActiveTab]       = useState(defaultTab);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countriesList]                 = useState(Country.getAllCountries());
  const [statesList, setStatesList]     = useState([]);
  const [citiesList, setCitiesList]     = useState([]);
  const [otpSent, setOtpSent]           = useState(false);
  const [otpVerified, setOtpVerified]   = useState(false);
  const [otpValue, setOtpValue]         = useState("");
  const [otpLoading, setOtpLoading]     = useState(false);
  const [emailOtpSent, setEmailOtpSent]         = useState(false);
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);
  const [emailOtpValue, setEmailOtpValue]       = useState("");
  const [emailOtpLoading, setEmailOtpLoading]   = useState(false);

  const watchedEmail  = Form.useWatch("email",        form);
  const watchedMobile = Form.useWatch("mobile",       form);
  const watchedCode   = Form.useWatch("country_code", form) || "971";
  const parsedPhone   = parsePhoneNumberFromString(`+${watchedCode}${watchedMobile || ""}`);
  const mobileInvalid = !parsedPhone || !parsedPhone.isValid();

  const phoneCodesData = useMemo(() => {
    const priority = ["AE", "IN", "US", "GB", "SA"];
    return Country.getAllCountries()
      .map(c => ({ name: c.name, code: c.phonecode, iso: c.isoCode }))
      .sort((a, b) => {
        const ap = priority.includes(a.iso), bp = priority.includes(b.iso);
        if (ap && !bp) return -1; if (!ap && bp) return 1;
        return a.name.localeCompare(b.name);
      });
  }, []);

  const showErr = (error) => {
    const rd = error?.response?.data;
    let msg = "Something went wrong. Please try again.";
    if (rd) {
      if (Array.isArray(rd) && rd.length) {
        msg = rd.map(e => e.message || e).join(", ");
        rd.forEach(e => {
          if (e.field === "email")  form.setFields([{ name: "email",  errors: [e.message] }]);
          if (e.field === "mobile") form.setFields([{ name: "mobile", errors: [e.message] }]);
        });
      } else if (typeof rd === "object") {
        if (rd.email)   { msg = rd.email;   form.setFields([{ name: "email",  errors: [rd.email]  }]); }
        else if (rd.mobile) { msg = rd.mobile; form.setFields([{ name: "mobile", errors: [rd.mobile] }]); }
        else msg = rd.message || "Error occurred";
      } else if (typeof rd === "string") msg = rd;
    }
    notification.error({ message: "Error", description: msg, duration: 5, placement: "top" });
  };

  const onCountryChange = (iso) => {
    setStatesList(State.getStatesOfCountry(iso));
    setCitiesList([]);
    form.setFieldsValue({ state: undefined, city: undefined });
  };

  const sendOtp = async () => {
    try {
      form.setFields([{ name: "mobile", errors: [] }]);
      await form.validateFields(["mobile"]);
      const mob = form.getFieldValue("mobile");
      setOtpLoading(true);
      await apiService.post("/otp/send-otp", { country_code: `+${watchedCode}`, phone_number: mob });
      notification.success({ message: "OTP Sent", description: `Sent to +${watchedCode} ${mob}`, duration: 3 });
      setOtpSent(true); setOtpVerified(false);
    } catch (e) { showErr(e); } finally { setOtpLoading(false); }
  };

  const verifyOtp = async () => {
    if (!otpValue) { notification.error({ message: "Enter the OTP", duration: 3 }); return; }
    try {
      setOtpLoading(true);
      await apiService.post("/otp/verify-otp", { country_code: `+${watchedCode}`, phone_number: form.getFieldValue("mobile"), otp: otpValue });
      notification.success({ message: "Mobile Verified ✓", duration: 3 });
      setOtpVerified(true); setOtpSent(false);
    } catch (e) { showErr(e); } finally { setOtpLoading(false); }
  };

  const sendEmailOtp = async () => {
    try {
      form.setFields([{ name: "email", errors: [] }]);
      await form.validateFields(["email"]);
      const email = form.getFieldValue("email");
      setEmailOtpLoading(true);
      await apiService.post("/otp/email-otp/send", { email });
      notification.success({ message: "OTP Sent", description: `Sent to ${email}`, duration: 3 });
      setEmailOtpSent(true); setEmailOtpVerified(false);
    } catch (e) { showErr(e); } finally { setEmailOtpLoading(false); }
  };

  const verifyEmailOtp = async () => {
    if (!emailOtpValue) { notification.error({ message: "Enter the OTP", duration: 3 }); return; }
    try {
      setEmailOtpLoading(true);
      await apiService.post("/otp/email-otp/verify", { email: form.getFieldValue("email"), otp: emailOtpValue });
      notification.success({ message: "Email Verified ✓", duration: 3 });
      setEmailOtpVerified(true); setEmailOtpSent(false);
    } catch (e) { showErr(e); } finally { setEmailOtpLoading(false); }
  };

  const handleSubmit = async (values) => {
    if (!otpVerified) { notification.error({ message: "Verify your mobile number first", duration: 4 }); return; }
    if (activeTab === "signup" && !emailOtpVerified) { notification.error({ message: "Verify your email first", duration: 4 }); return; }
    setIsSubmitting(true);
    try {
      const cc = `+${values.country_code || "971"}`;
      const mobilePayload = { country_code: cc, number: values.mobile.toString() };
      if (activeTab === "signin") {
        const loginData = await login("/users/login/customer", { mobile: mobilePayload });
        notification.success({ message: "Logged in!", duration: 3 });
        onAuthSuccess?.(loginData); onCancel();
      } else {
        const cData = Country.getCountryByCode(values.location_country);
        const sData = State.getStateByCodeAndCountry(values.state, values.location_country);
        const res = await apiService.post("/users/signup/customer", {
          name: { first_name: values.first_name, last_name: values.last_name },
          email: values.email, comingFromAiPage: true, mobile: mobilePayload,
          location: { country: cData?.name || "", state: sData?.name || values.state, city: values.city, address: "" },
        });
        if (res?.success) {
          notification.success({ message: "Account created!", duration: 3 });
          const loginData = await login("/users/login/customer", { mobile: mobilePayload });
          onAuthSuccess?.(loginData); onCancel();
        }
      }
    } catch (e) { showErr(e); } finally { setIsSubmitting(false); }
  };

  const resetTab = () => {
    form.resetFields();
    setOtpSent(false); setOtpVerified(false); setOtpValue("");
    setEmailOtpSent(false); setEmailOtpVerified(false); setEmailOtpValue("");
  };

  const isSubmitDisabled = activeTab === "signin" ? !otpVerified : (!otpVerified || !emailOtpVerified);

  return (
    <ConfigProvider theme={{ token: { colorPrimary: BRAND_PURPLE, borderRadius: 10 } }}>
      <style>{STYLES}</style>
      <Modal open={visible} footer={null} onCancel={onCancel}
        width={fullscreen ? "100vw" : 900} centered={!fullscreen}
        closable={!fullscreen} destroyOnHidden
        styles={{ body: { padding: 0, overflow: "hidden", borderRadius: fullscreen ? 0 : 20 } }}
        maskStyle={{ backdropFilter: "blur(6px)", background: "rgba(0,0,0,0.55)" }}
      >
        <div className="lgm-wrap">
          {/* Left panel */}
          <div className="lgm-left">
            <div style={{ position: "absolute", inset: 0 }}>
              <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070"
                style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.55 }} alt="" />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(76,2,125,0.92),rgba(0,0,0,0.75))" }} />
            </div>
            <div style={{ position: "relative", zIndex: 1, padding: 40, marginTop: "auto", color: "#fff" }}>
              <Sparkles style={{ color: "#d8b4fe", width: 36, height: 36, marginBottom: 20 }} />
              <h2 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.2, marginBottom: 10 }}>Design Your<br />Dream Space</h2>
              <p style={{ color: "rgba(233,213,255,0.8)", fontSize: 15 }}>AI-powered landscape design in seconds.</p>
            </div>
          </div>

          {/* Right panel */}
          <div className="lgm-right">
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#111827", marginBottom: 20 }}>
              {activeTab === "signin" ? "Welcome Back" : "Create Account"}
            </h2>

            <div className="lgm-tabs">
              <button type="button" className={`lgm-tab${activeTab === "signin" ? " active" : ""}`}
                onClick={() => { setActiveTab("signin"); resetTab(); }}>Sign In</button>
              <button type="button" className={`lgm-tab${activeTab === "signup" ? " active" : ""}`}
                onClick={() => { setActiveTab("signup"); resetTab(); }}>Create Account</button>
            </div>

            <Form form={form} layout="vertical" onFinish={handleSubmit}>

              {activeTab === "signup" && (
                <>
                  <div className="lgm-name-grid">
                    <Form.Item name="first_name" style={{ marginBottom: 0 }} rules={[{ required: true, message: "Required" }]}>
                      <Input size="large" prefix={<User size={15} style={{ color: "#9ca3af" }} />} placeholder="First Name" />
                    </Form.Item>
                    <Form.Item name="last_name" style={{ marginBottom: 0 }} rules={[{ required: true, message: "Required" }]}>
                      <Input size="large" placeholder="Last Name" />
                    </Form.Item>
                  </div>

                  <Form.Item name="email" label="Email" style={{ marginBottom: 8 }}
                    rules={[{ required: true, message: "Email is required" }, { type: "email", message: "Enter a valid email" }]}>
                    <Input size="large" prefix={<Mail size={15} style={{ color: "#9ca3af" }} />}
                      placeholder="Email address" disabled={emailOtpVerified}
                      onChange={() => { if (emailOtpVerified) { setEmailOtpVerified(false); setEmailOtpSent(false); } form.setFields([{ name: "email", errors: [] }]); }}
                    />
                  </Form.Item>

                  {emailOtpVerified ? (
                    <div className="lgm-badge lgm-in" style={{ marginBottom: 14 }}><CheckCircleFilled /> Email Verified</div>
                  ) : !emailOtpSent ? (
                    <Button block style={{ borderRadius: 10, borderColor: BRAND_PURPLE, color: BRAND_PURPLE, fontWeight: 700, height: 44, marginBottom: 14 }}
                      onClick={sendEmailOtp} loading={emailOtpLoading} disabled={!watchedEmail}>
                      Send Email OTP
                    </Button>
                  ) : (
                    <div className="lgm-verify-row lgm-in" style={{ marginBottom: 14 }}>
                      <Input size="large" prefix={<SafetyCertificateOutlined style={{ color: BRAND_PURPLE }} />}
                        placeholder="6-digit Email OTP" value={emailOtpValue} maxLength={6}
                        onChange={e => setEmailOtpValue(e.target.value.replace(/\D/g, ""))} />
                      <Button className="lgm-verify-btn" type="primary" style={{ background: BRAND_PURPLE }}
                        onClick={verifyEmailOtp} loading={emailOtpLoading}>Verify</Button>
                    </div>
                  )}
                </>
              )}

              {/* ═══ MOBILE NUMBER — stacked, no cramping ═══ */}
              <div style={{ marginBottom: 8 }}>
                <span className="lgm-label lgm-required">Mobile Number</span>
              </div>

              {/* Step 1: Country code — full width */}
              <Form.Item name="country_code" noStyle initialValue="971">
                <Select className="lgm-code-sel" size="large" showSearch
                  popupMatchSelectWidth={320} optionFilterProp="label"
                  style={{ width: "100%", marginBottom: 12 }}
                  disabled={otpVerified}
                  onChange={(val) => {
                    form.setFieldsValue({ country_code: val });
                    setOtpVerified(false); setOtpSent(false);
                    form.setFields([{ name: "mobile", errors: [] }]);
                  }}
                  options={phoneCodesData.map(item => ({
                    value: item.code,
                    label: (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <img src={`https://flagcdn.com/w20/${item.iso.toLowerCase()}.png`} width={18} alt="" style={{ borderRadius: 2, flexShrink: 0 }} />
                        <span style={{ fontWeight: 600 }}>+{item.code}</span>
                        <span style={{ color: "#6b7280", fontSize: 13 }}>{item.name}</span>
                      </div>
                    ),
                  }))}
                />
              </Form.Item>

              {/* Step 2: Number input + Send OTP btn */}
              <Form.Item name="mobile" style={{ marginBottom: otpSent && !otpVerified ? 6 : 14 }}
                rules={[
                  { required: true, message: "Mobile number is required" },
                  { validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    const p = parsePhoneNumberFromString(`+${watchedCode}${value}`);
                    return p && p.isValid() ? Promise.resolve() : Promise.reject("Enter a valid mobile number");
                  }},
                ]}>
                <div className="lgm-num-row">
                  <Input size="large"
                    prefix={<MobileOutlined style={{ color: "#9ca3af" }} />}
                    placeholder="Enter mobile number"
                    inputMode="numeric"
                    disabled={otpVerified}
                    value={watchedMobile || ""}
                    onChange={(e) => {
                      const n = e.target.value.replace(/\D/g, "");
                      form.setFieldsValue({ mobile: n });
                      if (otpVerified) { setOtpVerified(false); setOtpSent(false); }
                      form.setFields([{ name: "mobile", errors: [] }]);
                    }}
                  />
                  {otpVerified ? (
                    <span className="lgm-badge lgm-in"><CheckCircleFilled /> Verified</span>
                  ) : (
                    <Button className="lgm-otp-btn" type="primary"
                      style={{ background: mobileInvalid ? undefined : BRAND_PURPLE }}
                      onClick={sendOtp} loading={otpLoading} disabled={mobileInvalid}>
                      {otpSent ? "Resend" : "Send OTP"}
                    </Button>
                  )}
                </div>
              </Form.Item>

              {/* Step 3: OTP verify */}
              {otpSent && !otpVerified && (
                <div className="lgm-in" style={{ marginBottom: 14 }}>
                  <div className="lgm-verify-row">
                    <Input size="large" prefix={<SafetyCertificateOutlined style={{ color: BRAND_PURPLE }} />}
                      placeholder="Enter 6-digit OTP" value={otpValue} maxLength={6}
                      onChange={e => setOtpValue(e.target.value.replace(/\D/g, ""))} />
                    <Button className="lgm-verify-btn" type="primary" style={{ background: BRAND_PURPLE }}
                      onClick={verifyOtp} loading={otpLoading}>Verify</Button>
                  </div>
                  <Text type="secondary" style={{ fontSize: 12, marginTop: 5, display: "block" }}>
                    OTP sent to +{watchedCode} {watchedMobile}
                  </Text>
                </div>
              )}

              {activeTab === "signup" && (
                <>
                  <Form.Item name="location_country" style={{ marginBottom: 10 }}
                    rules={[{ required: true, message: "Select your country" }]}>
                    <Select size="large" placeholder="Select Country" showSearch onChange={onCountryChange}>
                      {countriesList.map(c => <Option key={c.isoCode} value={c.isoCode}>{c.name}</Option>)}
                    </Select>
                  </Form.Item>
                  <div className="lgm-sc-grid" style={{ marginBottom: 4 }}>
                    <Form.Item name="state" style={{ marginBottom: 0 }} rules={[{ required: true, message: "Select state" }]}>
                      <Select size="large" placeholder="State" disabled={!statesList.length}
                        onChange={code => { setCitiesList(City.getCitiesOfState(form.getFieldValue("location_country"), code)); form.setFieldsValue({ city: undefined }); }}>
                        {statesList.map(s => <Option key={s.isoCode} value={s.isoCode}>{s.name}</Option>)}
                      </Select>
                    </Form.Item>
                    <Form.Item name="city" style={{ marginBottom: 0 }} rules={[{ required: true, message: "Select city" }]}>
                      <Select size="large" placeholder="City" disabled={!citiesList.length}>
                        {citiesList.map(c => <Option key={c.name} value={c.name}>{c.name}</Option>)}
                      </Select>
                    </Form.Item>
                  </div>
                </>
              )}

              <Button type="primary" htmlType="submit" className="lgm-submit"
                disabled={isSubmitDisabled} loading={isSubmitting}
                style={{ background: isSubmitDisabled ? undefined : `linear-gradient(135deg, ${BRAND_PURPLE}, ${BRAND_PURPLE_DARK})` }}>
                {activeTab === "signin" ? "Sign In" : "Create Account"}
              </Button>
            </Form>
          </div>
        </div>
      </Modal>
    </ConfigProvider>
  );
};

export default LeadGenerationModal;