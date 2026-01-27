import React, { useState, useContext, useMemo } from "react";
import {
  Sparkles,
  User,
  Mail,
  Smartphone,
} from "lucide-react";
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
  EditOutlined // ✅ Added Edit Icon
} from "@ant-design/icons";
import { Country, State, City } from "country-state-city";
import { AuthContext } from "../../manageApi/context/AuthContext";
import { apiService } from "../../manageApi/utils/custom.apiservice";

const { Option } = Select;
const { Title } = Typography;

const BRAND_PURPLE = "#5C039B";
const BRAND_PURPLE_DARK = "#4a027d";

const PHONE_LENGTH_RULES = {
  "971": 9,  // UAE
  "91": 10,  // India
  "1": 10,   // USA
  "44": 10,  // UK
  "966": 9,  // Saudi
  "61": 9,   // Australia
};

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

  // --- OTP Logic: Send OTP ---
  const handleSendOtp = async () => {
    try {
      await form.validateFields(['mobile']);
      
      const mobileVal = form.getFieldValue('mobile');
      const rawCode = form.getFieldValue('country_code') || "971";
      const formattedCode = rawCode.toString().startsWith("+") ? rawCode : `+${rawCode}`;

      setOtpLoading(true);
      
      // API Call
      await apiService.post("/otp/send-otp", {
        country_code: formattedCode,
        phone_number: mobileVal
      });

      notification.success({ message: "OTP Sent", description: "Please check your mobile." });
      setOtpSent(true);
      setOtpVerified(false);
    } catch (error) {
      notification.error({ 
        message: "Error", 
        description: error?.response?.data?.message || "Invalid phone number or Server Error" 
      });
    } finally {
      setOtpLoading(false);
    }
  };

  // --- OTP Logic: Verify OTP ---
  const handleVerifyOtp = async () => {
    if (!otpValue) {
      notification.error({ message: "Error", description: "Please enter the OTP" });
      return;
    }
    try {
      setOtpLoading(true);
      const mobileVal = form.getFieldValue('mobile');
      const rawCode = form.getFieldValue('country_code') || "971";
      const formattedCode = rawCode.toString().startsWith("+") ? rawCode : `+${rawCode}`;
      const payload = { country_code: formattedCode, phone_number: mobileVal, otp: otpValue };

      await apiService.post("/otp/verify-otp", payload);
      notification.success({ message: "Verified", description: "Mobile number verified successfully!" });
      setOtpVerified(true);
      setOtpSent(false); 
    } catch (error) {
      notification.error({ message: "Verification Failed", description: error?.response?.data?.message || "Invalid OTP." });
    } finally {
      setOtpLoading(false);
    }
  };

  // ✅ Reset Function (Isse Verify hone ke baad bhi number change kar paoge)
  const handleChangeNumber = () => {
    setOtpSent(false);
    setOtpVerified(false);
    setOtpValue("");
    // Note: Mobile number field clear nahi kar rahe taaki user edit kar sake
  };

  /* ================= PREFIX SELECTOR ================= */
  const prefixSelector = (
    <Form.Item name="country_code" noStyle initialValue="971">
      <Select
        style={{ width: 110 }}
        bordered={false}
        showSearch
        // Disable ONLY when OTP is actively being verified or sent, enable if verified (so user knows they can change)
        disabled={otpSent && !otpVerified} 
        dropdownMatchSelectWidth={320}
        optionFilterProp="children"
        onChange={(val) => {
          setCountryCode(val);
          form.setFieldsValue({ country_code: val });
          setOtpVerified(false);
          setOtpSent(false);
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
    if (activeTab === "signup" && !otpVerified) {
      notification.error({ message: "Verification Required", description: "Please verify mobile." });
      return;
    }
    setIsSubmitting(true);

    try {
      const rawCode = values.country_code ? values.country_code.toString() : "971";
      const formattedCode = rawCode.startsWith("+") ? rawCode : `+${rawCode}`;
      const mobilePayload = { country_code: formattedCode, number: values.mobile.toString() };

      if (activeTab === "signin") {
        const loginData = await login("/users/login/customer", { mobile: mobilePayload });
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
          const loginData = await login("/users/login/customer", { mobile: mobilePayload });
          onAuthSuccess?.(loginData);
          onCancel();
        }
      }
    } catch (error) {
      console.error("Signup/Login Error:", error);
      let errorMessage = "Something went wrong. Please try again.";
      const responseData = error?.response?.data;

      if (Array.isArray(responseData) && responseData.length > 0) {
        errorMessage = responseData[0]?.message || errorMessage;
      } else if (responseData?.message) {
        errorMessage = responseData.message;
      }

      notification.error({
        message: "Error",
        description: errorMessage,
        duration: 5,
        placement: "top",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRequiredLength = () => PHONE_LENGTH_RULES[countryCode] || 15;

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
              <button onClick={() => { setActiveTab("signin"); form.resetFields(); }} className={`flex-1 py-3 rounded-lg ${activeTab === "signin" && "bg-white shadow"}`}>Sign In</button>
              <button onClick={() => { setActiveTab("signup"); form.resetFields(); }} className={`flex-1 py-3 rounded-lg ${activeTab === "signup" && "bg-white shadow"}`}>Create Account</button>
            </div>

            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              {activeTab === "signup" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Form.Item name="first_name" rules={[{ required: true, message: 'Required' }]}><Input prefix={<User size={18}/>} placeholder="First Name" /></Form.Item>
                    <Form.Item name="last_name" rules={[{ required: true, message: 'Required' }]}><Input placeholder="Last Name" /></Form.Item>
                  </div>
                  <Form.Item name="email" rules={[{ required: true, type: "email", message: 'Invalid Email' }]}><Input prefix={<Mail size={18}/>} placeholder="Email" /></Form.Item>
                </>
              )}

              {/* --- MOBILE INPUT --- */}
              <Form.Item label="Mobile Number" name="mobile" rules={[{ required: true, message: 'Required' }]}>
                <Input
                  addonBefore={prefixSelector}
                  prefix={<Smartphone size={18}/>}
                  maxLength={getRequiredLength()}
                  placeholder="50 123 4567"
                  // 🔥 Logic Update: Disable ONLY if OTP is sent and NOT verified yet.
                  disabled={otpSent && !otpVerified}
                  onChange={(e) => {
                    setMobileNumber(e.target.value.replace(/\D/g, ""));
                    if(otpVerified) {
                        setOtpVerified(false); // Reset if user types in verified field manually
                    }
                  }}
                />
              </Form.Item>

              {activeTab === "signup" && (
                <div className="mb-6">
                  {/* CASE 1: Start */}
                  {!otpVerified && !otpSent && (
                    <Button type="primary" block onClick={handleSendOtp} loading={otpLoading} disabled={!mobileNumber}>Send OTP</Button>
                  )}

                  {/* CASE 2: OTP Sent */}
                  {otpSent && !otpVerified && (
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Input placeholder="Enter OTP" value={otpValue} onChange={(e) => setOtpValue(e.target.value)} prefix={<SafetyCertificateOutlined />} />
                        <Button type="primary" onClick={handleVerifyOtp} loading={otpLoading}>Verify</Button>
                      </div>
                      <Button type="link" size="small" danger onClick={handleChangeNumber} className="text-right">Change Number</Button>
                    </div>
                  )}

                  {/* CASE 3: Verified - Now shows Change Button */}
                  {otpVerified && (
                    <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 text-green-700 font-medium">
                        <CheckCircleFilled /> Mobile Number Verified
                      </div>
                      <Button 
                        type="text" 
                        size="small" 
                        icon={<EditOutlined />} 
                        onClick={handleChangeNumber}
                        className="text-gray-500 hover:text-purple-600"
                      >
                        Change
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "signup" && (
                <>
                  <Form.Item name="location_country" rules={[{ required: true, message: "Required" }]}>
                    <Select placeholder="Select Country" showSearch onChange={handleLocationCountryChange}>
                      {countriesList.map((c) => <Option key={c.isoCode} value={c.isoCode}>{c.name}</Option>)}
                    </Select>
                  </Form.Item>
                  <div className="grid grid-cols-2 gap-4">
                    <Form.Item name="state" rules={[{ required: true, message: "Required" }]}>
                      <Select placeholder="State" disabled={!statesList.length} onChange={handleLocationStateChange}>
                        {statesList.map((s) => <Option key={s.isoCode} value={s.isoCode}>{s.name}</Option>)}
                      </Select>
                    </Form.Item>
                    <Form.Item name="city" rules={[{ required: true, message: "Required" }]}>
                      <Select placeholder="City" disabled={!citiesList.length}>
                        {citiesList.map((c) => <Option key={c.name} value={c.name}>{c.name}</Option>)}
                      </Select>
                    </Form.Item>
                  </div>
                </>
              )}

              <Button type="primary" htmlType="submit" block loading={isSubmitting} className="h-14 mt-4" style={{ background: `linear-gradient(135deg, ${BRAND_PURPLE}, ${BRAND_PURPLE_DARK})`, border: "none" }}>
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