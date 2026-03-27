import React, { useState, useContext, useMemo } from "react";
import {
  Sparkles,
  User,
  Mail,
  Smartphone,
} from "lucide-react";
import { parsePhoneNumberFromString } from "libphonenumber-js";

import {
  Button,
  Modal,
  Form,
  Input,
  Select,
  notification,
  ConfigProvider,
  Typography,
} from "antd";
import { 
  SafetyCertificateOutlined, 
  CheckCircleFilled,
} from "@ant-design/icons";
import { Country, State, City } from "country-state-city";
import { AuthContext } from "../../manageApi/context/AuthContext";
import { apiService } from "../../manageApi/utils/custom.apiservice";

const { Option } = Select;
const { Title, Text } = Typography;

const BRAND_PURPLE = "#5C039B";
const BRAND_PURPLE_DARK = "#4a027d";

const LeadGenerationModal = ({
  visible,
  onCancel,
  onAuthSuccess,
  defaultTab = "signin",
  fullscreen = false,
}) => {
  const [form] = Form.useForm();
  const { login } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countryCode, setCountryCode] = useState("971");

  // Location States
  const [countriesList] = useState(Country.getAllCountries());
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);

  // --- OTP STATES ---
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  
  // --- EMAIL OTP STATES ---
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);
  const [emailOtpValue, setEmailOtpValue] = useState("");
  const [emailOtpLoading, setEmailOtpLoading] = useState(false);

  // Watchers to control button disabled state
  const watchedEmail = Form.useWatch("email", form);
  const watchedMobile = Form.useWatch("mobile", form);
  const code = Form.useWatch("country_code", form) || "971";
  
  const phone = parsePhoneNumberFromString(`+${code}${watchedMobile}`);
  const isDisabled = !phone || !phone.isValid();

  /* ================= PREPARE MOBILE CODES DATA ================= */
  const phoneCodesData = useMemo(() => {
    const priorityIsoCodes = ["AE", "IN", "US", "GB", "SA"]; 
    return Country.getAllCountries().map((country) => ({
      name: country.name,
      code: country.phonecode,
      iso: country.isoCode,
    })).sort((a, b) => {
      const aPriority = priorityIsoCodes.includes(a.iso);
      const bPriority = priorityIsoCodes.includes(b.iso);
      if (aPriority && !bPriority) return -1;
      if (!aPriority && bPriority) return 1;
      return a.name.localeCompare(b.name);
    });
  }, []);

  /* ================= HELPER FUNCTION TO DISPLAY ERROR MESSAGES ================= */
  const showErrorNotification = (error) => {
    console.error("API Error:", error);
    
    let errorMessage = "Something went wrong. Please try again.";
    const responseData = error?.response?.data;
    
    if (responseData) {
      if (Array.isArray(responseData) && responseData.length > 0) {
        const errors = responseData.map(err => err.message || err).join(", ");
        errorMessage = errors;
        
        responseData.forEach(err => {
          if (err.field === "email") {
            form.setFields([{ name: "email", errors: [err.message] }]);
          } else if (err.field === "mobile") {
            form.setFields([{ name: "mobile", errors: [err.message] }]);
          }
        });
      } 
      else if (typeof responseData === "object") {
        if (responseData.email) {
          errorMessage = responseData.email;
          form.setFields([{ name: "email", errors: [responseData.email] }]);
        } 
        else if (responseData.mobile) {
          errorMessage = responseData.mobile;
          form.setFields([{ name: "mobile", errors: [responseData.mobile] }]);
        }
        else if (responseData.message) {
          errorMessage = responseData.message;
        }
        else {
          const firstErrorKey = Object.keys(responseData)[0];
          if (firstErrorKey && responseData[firstErrorKey]) {
            errorMessage = `${firstErrorKey}: ${responseData[firstErrorKey]}`;
          }
        }
      }
      else if (typeof responseData === "string") {
        errorMessage = responseData;
        
        if (errorMessage.toLowerCase().includes("email")) {
          form.setFields([{ name: "email", errors: [errorMessage] }]);
        } else if (errorMessage.toLowerCase().includes("mobile") || errorMessage.toLowerCase().includes("phone")) {
          form.setFields([{ name: "mobile", errors: [errorMessage] }]);
        }
      }
    }
    
    notification.error({
      message: "Error",
      description: errorMessage,
      duration: 5,
      placement: "top",
      style: { marginTop: 60 },
    });
  };

  /* ================= HANDLERS ================= */
  const handleLocationCountryChange = (isoCode) => {
    const updatedStates = State.getStatesOfCountry(isoCode);
    setStatesList(updatedStates);
    setCitiesList([]);
    form.setFieldsValue({ state: undefined, city: undefined });
  };

  const handleLocationStateChange = (stateCode) => {
    const countryCodeVal = form.getFieldValue("location_country");
    const updatedCities = City.getCitiesOfState(countryCodeVal, stateCode);
    setCitiesList(updatedCities);
    form.setFieldsValue({ city: undefined });
  };

  // --- OTP Logic: Send Mobile OTP ---
  const handleSendOtp = async () => {
    try {
      form.setFields([{ name: "mobile", errors: [] }]);
      await form.validateFields(['mobile']);
      
      const mobileVal = form.getFieldValue('mobile');
      const rawCode = form.getFieldValue('country_code') || "971";
      const formattedCode = rawCode.toString().startsWith("+") ? rawCode : `+${rawCode}`;

      setOtpLoading(true);
      
      await apiService.post("/otp/send-otp", {
        country_code: formattedCode,
        phone_number: mobileVal
      });

      notification.success({ 
        message: "OTP Sent", 
        description: `OTP sent to ${formattedCode}${mobileVal}`,
        duration: 3,
      });
      setOtpSent(true);
      setOtpVerified(false);
    } catch (error) {
      showErrorNotification(error);
    } finally {
      setOtpLoading(false);
    }
  };

  // --- OTP Logic: Verify Mobile OTP ---
  const handleVerifyOtp = async () => {
    if (!otpValue) {
      notification.error({ 
        message: "Error", 
        description: "Please enter the OTP",
        duration: 3,
      });
      return;
    }
    try {
      setOtpLoading(true);
      const mobileVal = form.getFieldValue('mobile');
      const rawCode = form.getFieldValue('country_code') || "971";
      const formattedCode = rawCode.toString().startsWith("+") ? rawCode : `+${rawCode}`;
      const payload = { country_code: formattedCode, phone_number: mobileVal, otp: otpValue };

      await apiService.post("/otp/verify-otp", payload);
      notification.success({ 
        message: "Verified", 
        description: "Mobile number verified successfully!",
        duration: 3,
      });
      setOtpVerified(true);
      setOtpSent(false); 
    } catch (error) {
      showErrorNotification(error);
    } finally {
      setOtpLoading(false);
    }
  };

  // --- OTP Logic: Send Email OTP ---
  const handleSendEmailOtp = async () => {
    try {
      form.setFields([{ name: "email", errors: [] }]);
      await form.validateFields(["email"]);
      const email = form.getFieldValue("email");

      setEmailOtpLoading(true);
      await apiService.post("/otp/email-otp/send", { email });

      notification.success({
        message: "OTP Sent",
        description: `OTP sent to ${email}`,
        duration: 3,
      });

      setEmailOtpSent(true);
      setEmailOtpVerified(false);
    } catch (error) {
      showErrorNotification(error);
    } finally {
      setEmailOtpLoading(false);
    }
  };

  // --- OTP Logic: Verify Email OTP ---
  const handleVerifyEmailOtp = async () => {
    if (!emailOtpValue) {
      notification.error({ 
        message: "Error", 
        description: "Please enter OTP",
        duration: 3,
      });
      return;
    }
    try {
      setEmailOtpLoading(true);
      await apiService.post("/otp/email-otp/verify", {
        email: form.getFieldValue("email"),
        otp: emailOtpValue,
      });

      notification.success({
        message: "Email Verified",
        description: "Email verified successfully!",
        duration: 3,
      });

      setEmailOtpVerified(true);
      setEmailOtpSent(false);
    } catch (error) {
      showErrorNotification(error);
    } finally {
      setEmailOtpLoading(false);
    }
  };

  /* ================= PREFIX SELECTOR ================= */
  const prefixSelector = (
    <Form.Item name="country_code" noStyle initialValue="971">
      <Select
        style={{ width: 110 }}
        bordered={false}
        showSearch
        disabled={otpSent && !otpVerified} 
        dropdownMatchSelectWidth={320}
        optionFilterProp="children"
        onChange={(val) => {
          setCountryCode(val);
          form.setFieldsValue({ country_code: val });
          setOtpVerified(false);
          setOtpSent(false);
          form.setFields([{ name: "mobile", errors: [] }]);
        }}
      >
        {phoneCodesData.map((item) => (
          <Option key={item.iso} value={item.code}>
            <div className="flex items-center">
              <img src={`https://flagcdn.com/w20/${item.iso.toLowerCase()}.png`} width="20" style={{ marginRight: 8 }} alt="" />
              <span>+{item.code}</span>
            </div>
          </Option>
        ))}
      </Select>
    </Form.Item>
  );

  /* ================= SUBMIT HANDLER ================= */
  const handleSubmit = async (values) => {
    // Note: Since the button is now disabled until verification, 
    // these manual checks are an extra layer of safety.
    if (activeTab === "signup" && !otpVerified) {
      notification.error({ 
        message: "Verification Required", 
        description: "Please verify your mobile number before creating account.",
        duration: 4,
      });
      return;
    }
    
    if (activeTab === "signup" && !emailOtpVerified) {
      notification.error({ 
        message: "Verification Required", 
        description: "Please verify your email address before creating account.",
        duration: 4,
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      const rawCode = values.country_code ? values.country_code.toString() : "971";
      const formattedCode = rawCode.startsWith("+") ? rawCode : `+${rawCode}`;
      const mobilePayload = { country_code: formattedCode, number: values.mobile.toString() };

      if (activeTab === "signin") {
        const loginData = await login("/users/login/customer", { mobile: mobilePayload });
        notification.success({
          message: "Success",
          description: "Logged in successfully!",
          duration: 3,
        });
        onAuthSuccess?.(loginData);
        onCancel();
      } else {
        const selectedCountryData = Country.getCountryByCode(values.location_country);
        const selectedStateData = State.getStateByCodeAndCountry(values.state, values.location_country);
        const signupPayload = {
          name: { first_name: values.first_name, last_name: values.last_name },
          email: values.email,
          comingFromAiPage: true,
          mobile: mobilePayload,
          location: { 
            country: selectedCountryData?.name || "", 
            state: selectedStateData?.name || values.state, 
            city: values.city, 
            address: "" 
          },
        };
        const response = await apiService.post("/users/signup/customer", signupPayload);
        if (response?.success) {
          notification.success({
            message: "Account Created",
            description: "Your account has been created successfully!",
            duration: 3,
          });
          const loginData = await login("/users/login/customer", { mobile: mobilePayload });
          onAuthSuccess?.(loginData);
          onCancel();
        }
      }
    } catch (error) {
      console.error("Signup/Login Error:", error);
      showErrorNotification(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine if the main submit button should be disabled
  const isSubmitDisabled = activeTab === "signin" 
    ? !otpVerified 
    : (!otpVerified || !emailOtpVerified);

  return (
    <ConfigProvider theme={{ token: { colorPrimary: BRAND_PURPLE, borderRadius: 12 } }}>
      <Modal
        open={visible}
        footer={null}
        onCancel={onCancel}
        width={fullscreen ? "100vw" : 1000}
        centered={!fullscreen}
        closable={!fullscreen}
        styles={{ 
          body: { padding: 0, borderRadius: fullscreen ? 0 : "24px", height: fullscreen ? "100vh" : "auto", overflow: "hidden" }
        }}
        maskStyle={{ backdropFilter: "blur(8px)", background: "rgba(0,0,0,0.6)" }}
      >
        <div className="flex flex-col lg:flex-row min-h-[600px] bg-white">
          {/* Left Panel */}
          <div className="lg:w-5/12 relative hidden lg:flex flex-col justify-between p-10 text-white bg-gray-900">
            <div className="absolute inset-0 z-0">
              <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070" className="w-full h-full object-cover opacity-60" alt="" />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 to-black/80" />
            </div>
            <div className="relative z-10">
              <Sparkles className="text-purple-300 w-10 h-10 mb-6" />
              <h2 className="text-4xl font-extrabold mb-4">Design Your <br />Dream Space</h2>
              <p className="text-purple-100/80">AI-powered landscape design in seconds.</p>
            </div>
          </div>

          {/* Right Panel */}
          <div className="lg:w-7/12 p-8 lg:p-12 relative overflow-y-auto max-h-[100vh]">
            <Title level={2}>{activeTab === "signin" ? "Welcome Back" : "Create Account"}</Title>

            <div className="flex p-1.5 bg-gray-100 rounded-xl my-6">
              <button 
                type="button" 
                onClick={() => { 
                  setActiveTab("signin"); 
                  form.resetFields();
                  setOtpVerified(false);
                  setOtpSent(false);
                  setEmailOtpVerified(false);
                  setEmailOtpSent(false);
                }} 
                className={`flex-1 py-3 rounded-lg ${activeTab === "signin" && "bg-white shadow"}`}
              >
                Sign In
              </button>
              <button 
                type="button" 
                onClick={() => { 
                  setActiveTab("signup"); 
                  form.resetFields();
                  setOtpVerified(false);
                  setOtpSent(false);
                  setEmailOtpVerified(false);
                  setEmailOtpSent(false);
                }} 
                className={`flex-1 py-3 rounded-lg ${activeTab === "signup" && "bg-white shadow"}`}
              >
                Create Account
              </button>
            </div>

            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              {activeTab === "signup" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Form.Item 
                      name="first_name" 
                      rules={[{ required: true, message: 'First name is required' }]}
                    >
                      <Input size="large" prefix={<User size={18}/>} placeholder="First Name" />
                    </Form.Item>
                    <Form.Item 
                      name="last_name" 
                      rules={[{ required: true, message: 'Last name is required' }]}
                    >
                      <Input size="large" placeholder="Last Name" />
                    </Form.Item>
                  </div>
                  
                  {/* ================= EMAIL SECTION ================= */}
                  <Form.Item
                    label="Email"
                    required
                    validateStatus={form.getFieldError("email")?.length ? "error" : ""}
                    help={form.getFieldError("email")?.length ? form.getFieldError("email")[0] : null}
                    style={{ marginBottom: emailOtpSent && !emailOtpVerified ? 0 : 24 }}
                  >
                    <Form.Item
                      name="email"
                      noStyle
                      rules={[
                        { required: true, message: "Email is required" },
                        { type: "email", message: "Please enter a valid email address" },
                      ]}
                    >
                      <Input
                        size="large"
                        prefix={<Mail size={18} />}
                        placeholder="Email Address"
                        disabled={emailOtpVerified}
                        onChange={(e) => {
                          form.setFieldsValue({ email: e.target.value });
                          if (emailOtpVerified) {
                            setEmailOtpVerified(false);
                            setEmailOtpSent(false);
                          }
                          form.setFields([{ name: "email", errors: [] }]);
                        }}
                        suffix={
                          !emailOtpVerified ? (
                            <Button 
                              type="link" 
                              onClick={handleSendEmailOtp} 
                              loading={emailOtpLoading}
                              disabled={!watchedEmail}
                              style={{ color: BRAND_PURPLE, fontWeight: 'bold', padding: 0 }}
                            >
                              {emailOtpSent ? "Resend" : "Send OTP"}
                            </Button>
                          ) : (
                            <span style={{ color: '#52c41a', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <CheckCircleFilled /> Verified
                            </span>
                          )
                        }
                      />
                    </Form.Item>
                  </Form.Item>

                  {/* Email OTP Verification */}
                  {emailOtpSent && !emailOtpVerified && (
                    <div style={{ marginTop: 10, marginBottom: 24, animation: 'fadeIn 0.3s ease' }}>
                      <Input
                        size="large"
                        placeholder="Enter 6-digit OTP"
                        value={emailOtpValue}
                        onChange={(e) => setEmailOtpValue(e.target.value.replace(/\D/g, ""))}
                        prefix={<SafetyCertificateOutlined style={{ color: BRAND_PURPLE }}/>}
                        maxLength={6}
                        suffix={
                          <Button 
                            type="link" 
                            onClick={handleVerifyEmailOtp} 
                            loading={emailOtpLoading}
                            style={{ color: BRAND_PURPLE, fontWeight: 'bold', padding: 0 }}
                          >
                            VERIFY
                          </Button>
                        }
                      />
                      <div style={{ marginTop: 4 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>OTP sent to {watchedEmail}</Text>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ================= PHONE NUMBER SECTION ================= */}
              <Form.Item
                label="Mobile Number"
                required
                validateStatus={form.getFieldError("mobile")?.length ? "error" : ""}
                help={form.getFieldError("mobile")?.length ? form.getFieldError("mobile")[0] : null}
                style={{ marginBottom: otpSent && !otpVerified ? 0 : 24 }}
              >
                <Form.Item
                  name="mobile"
                  noStyle
                  rules={[
                    { required: true, message: "Mobile number is required" },
                    {
                      validator: (_, value) => {
                        if (!value) return Promise.resolve();
                        const rawCode = form.getFieldValue("country_code") || "971";
                        const formattedCode = rawCode.startsWith("+") ? rawCode : `+${rawCode}`;
                        const phoneInstance = parsePhoneNumberFromString(`${formattedCode}${value}`);
                        if (!phoneInstance || !phoneInstance.isValid()) {
                          return Promise.reject("Please enter a valid mobile number");
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input
                    size="large"
                    addonBefore={prefixSelector}
                    prefix={<Smartphone size={18} />}
                    placeholder="Enter mobile number"
                    disabled={otpVerified}
                    onChange={(e) => {
                      const onlyNumbers = e.target.value.replace(/\D/g, "");
                      form.setFieldsValue({ mobile: onlyNumbers });
                      setMobileNumber(onlyNumbers);

                      if (otpVerified && onlyNumbers !== mobileNumber) {
                        setOtpVerified(false);
                        setOtpSent(false);
                      }
                      form.setFields([{ name: "mobile", errors: [] }]);
                    }}
                    suffix={
                      !otpVerified ? (
                        <Button 
                          type="link" 
                          onClick={handleSendOtp} 
                          loading={otpLoading}
                          disabled={isDisabled}
                          style={{ color: BRAND_PURPLE, fontWeight: 'bold', padding: 0 }}
                        >
                          {otpSent ? "Resend" : "Send OTP"}
                        </Button>
                      ) : (
                        <span style={{ color: '#52c41a', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircleFilled /> Verified
                        </span>
                      )
                    }
                  />
                </Form.Item>
              </Form.Item>

              {/* Mobile OTP Verification */}
              {otpSent && !otpVerified && (
                <div style={{ marginTop: 10, marginBottom: 24, animation: 'fadeIn 0.3s ease' }}>
                  <Input
                    size="large"
                    placeholder="Enter 6-digit OTP"
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ""))}
                    prefix={<SafetyCertificateOutlined style={{ color: BRAND_PURPLE }} />}
                    maxLength={6}
                    suffix={
                      <Button 
                        type="link" 
                        onClick={handleVerifyOtp} 
                        loading={otpLoading}
                        style={{ color: BRAND_PURPLE, fontWeight: 'bold', padding: 0 }}
                      >
                        VERIFY
                      </Button>
                    }
                  />
                  <div style={{ marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      OTP sent to +{form.getFieldValue("country_code")} {watchedMobile}
                    </Text>
                  </div>
                </div>
              )}

              {activeTab === "signup" && (
                <>
                  <Form.Item 
                    name="location_country" 
                    rules={[{ required: true, message: "Please select your country" }]}
                  >
                    <Select size="large" placeholder="Select Country" showSearch onChange={handleLocationCountryChange}>
                      {countriesList.map((c) => <Option key={c.isoCode} value={c.isoCode}>{c.name}</Option>)}
                    </Select>
                  </Form.Item>
                  <div className="grid grid-cols-2 gap-4">
                    <Form.Item 
                      name="state" 
                      rules={[{ required: true, message: "Please select your state" }]}
                    >
                      <Select size="large" placeholder="State" disabled={!statesList.length} onChange={handleLocationStateChange}>
                        {statesList.map((s) => <Option key={s.isoCode} value={s.isoCode}>{s.name}</Option>)}
                      </Select>
                    </Form.Item>
                    <Form.Item 
                      name="city" 
                      rules={[{ required: true, message: "Please select your city" }]}
                    >
                      <Select size="large" placeholder="City" disabled={!citiesList.length}>
                        {citiesList.map((c) => <Option key={c.name} value={c.name}>{c.name}</Option>)}
                      </Select>
                    </Form.Item>
                  </div>
                </>
              )}

              {/* MAIN SUBMIT BUTTON */}
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                disabled={isSubmitDisabled} 
                loading={isSubmitting} 
                className="h-14 mt-4 text-base" 
                style={{ 
                  background: isSubmitDisabled ? undefined : `linear-gradient(135deg, ${BRAND_PURPLE}, ${BRAND_PURPLE_DARK})`, 
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: "bold"
                }}
              >
                {activeTab === "signin" ? "Sign In" : "Create Account"} 
              </Button>
            </Form>
          </div>
        </div>
      </Modal>

      {/* CSS for fading in the OTP box */}
      <style jsx global>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
        } `}</style>
    </ConfigProvider>
  );
};

export default LeadGenerationModal;