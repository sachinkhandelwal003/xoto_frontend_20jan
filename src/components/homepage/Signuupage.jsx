import React, { useState, useContext, useMemo } from "react";
import {
  Sparkles,
  User,
  Mail,
  Lock,
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
  EditOutlined // Imported Edit Icon
} from "@ant-design/icons";
import { Country, State, City } from "country-state-city";
import { AuthContext } from "../../manageApi/context/AuthContext";
import { apiService } from "../../manageApi/utils/custom.apiservice";
import { showToast } from "../../manageApi/utils/toast";

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
  
  // State to track input for button disabling
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
      // Validate mobile fields first
      await form.validateFields(['mobile']);
      const mobileVal = form.getFieldValue('mobile');
      
      // Construct code
      const rawCode = form.getFieldValue('country_code') || "971";
      const formattedCode = rawCode.toString().startsWith("+") ? rawCode : `+${rawCode}`;

      setOtpLoading(true);

      const payload = {
        country_code: formattedCode,
        phone_number: mobileVal
      };

      await apiService.post("/otp/send-otp", payload);
      
      notification.success({ message: "OTP Sent", description: "Please check your mobile." });
      setOtpSent(true);
      setOtpVerified(false);
    } catch (error) {
      console.error("Send OTP Error:", error);
      const msg = error?.response?.data?.message || error?.errorFields?.[0]?.errors?.[0] || "Failed to send OTP.";
      notification.error({ message: "Error", description: msg });
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

      const payload = {
        country_code: formattedCode,
        phone_number: mobileVal,
        otp: otpValue
      };

      await apiService.post("/otp/verify-otp", payload);

      notification.success({ message: "Verified", description: "Mobile number verified successfully!" });
      setOtpVerified(true);
      setOtpSent(false); // Hide OTP field after success
    } catch (error) {
      console.error("Verify OTP Error:", error);
      const msg = error?.response?.data?.message || "Invalid OTP.";
      notification.error({ message: "Verification Failed", description: msg });
    } finally {
      setOtpLoading(false);
    }
  };

  // --- Change Number Handler ---
  const handleChangeNumber = () => {
    setOtpSent(false);
    setOtpVerified(false);
    setOtpValue("");
    // Input automatically becomes enabled because otpSent is false
  };

  /* ================= PREFIX SELECTOR ================= */
  const prefixSelector = (
    <Form.Item name="country_code" noStyle initialValue="971">
      <Select
        style={{ width: 110 }}
        bordered={false}
        showSearch
        disabled={otpVerified || otpSent} // Lock if processing
        dropdownMatchSelectWidth={320}
        optionFilterProp="children"
        onChange={(val) => {
          setCountryCode(val);
          form.setFieldsValue({ country_code: val });
          // Reset OTP state on country change
          setOtpVerified(false);
          setOtpSent(false);
        }}
        filterOption={(input, option) => 
          option.children[1]?.props?.children[1]?.toLowerCase().includes(input.toLowerCase()) || 
          option.value.includes(input)
        }
      >
        {phoneCodesData.map((item) => (
          <Option key={item.iso} value={item.code}>
            <div className="flex items-center">
              <img 
                src={`https://flagcdn.com/w20/${item.iso.toLowerCase()}.png`} 
                srcSet={`https://flagcdn.com/w40/${item.iso.toLowerCase()}.png 2x`}
                width="20" 
                alt={item.name} 
                style={{ marginRight: 8, borderRadius: 2, objectFit: 'cover' }}
              />
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
      notification.error({ message: "Verification Required", description: "Please verify your mobile number first." });
      return;
    }

    setIsSubmitting(true);

    try {
      const rawCode = values.country_code ? values.country_code.toString() : "971";
      const formattedCode = rawCode.startsWith("+") ? rawCode : `+${rawCode}`;

      const mobilePayload = {
        country_code: formattedCode,
        number: values.mobile.toString(),
      };

      if (activeTab === "signin") {
        const loginData = await login("/users/login/customer", { mobile: mobilePayload });
        onAuthSuccess?.(loginData);
        onCancel();
      } else {
        const selectedCountryData = Country.getCountryByCode(values.location_country);
        const countryName = selectedCountryData ? selectedCountryData.name : "";
        const selectedStateData = State.getStateByCodeAndCountry(values.state, values.location_country);
        const stateName = selectedStateData ? selectedStateData.name : values.state;

        const signupPayload = {
          name: { first_name: values.first_name, last_name: values.last_name },
          email: values.email,
          comingFromAiPage: true,
          mobile: mobilePayload,
          location: { 
            country: countryName, 
            state: stateName, 
            city: values.city, 
            address: "" 
          },
        };

        const response = await apiService.post("/users/signup/customer", signupPayload);

        if (response?.success) {
          notification.success({ message: "Account Created", description: "Logging you in..." });
          const loginData = await login("/users/login/customer", { mobile: mobilePayload });
          onAuthSuccess?.(loginData);
          onCancel();
          form.resetFields();
        }
      }
    } catch (error) {
      console.error("Auth Error:", error);
      const responseData = error?.response?.data;
      const errorMessage = responseData?.errors?.[0]?.message || responseData?.message || "An unexpected error occurred";

      notification.error({
        message: "Action Failed",
        description: errorMessage,
        placement: "topRight",
        duration: 5,
      });

      if (responseData?.errors && Array.isArray(responseData.errors)) {
        const fieldErrors = responseData.errors.map((err) => {
          const fieldName = err.field.includes('.') ? err.field.split('.')[0] : err.field;
          return { name: fieldName, errors: [err.message] };
        });
        form.setFields(fieldErrors);
      }
    } finally {
      setIsSubmitting(false);
    } 
  };

  const getRequiredLength = () => PHONE_LENGTH_RULES[countryCode] || 15;

  return (
    <ConfigProvider
      theme={{
        token: { colorPrimary: BRAND_PURPLE, borderRadius: 12, controlHeight: 45, fontFamily: "'Inter', sans-serif" },
      }}
    >
      <Modal
        open={visible}
        footer={null}
        onCancel={onCancel}
        width={fullscreen ? "100vw" : 1000}
        centered={!fullscreen}
        closable={!fullscreen}
        bodyStyle={{ padding: 0, borderRadius: fullscreen ? 0 : "24px", height: fullscreen ? "100vh" : "auto", overflow: "hidden" }}
        maskStyle={{ backdropFilter: "blur(8px)", background: "rgba(0,0,0,0.6)" }}
      >
        <div className="flex flex-col lg:flex-row min-h-[600px] bg-white">
          
          {/* Left Panel */}
          <div className="lg:w-5/12 relative hidden lg:flex flex-col justify-between p-10 text-white overflow-hidden bg-gray-900">
            <div className="absolute inset-0 z-0">
              <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop" alt="bg" className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 to-black/80" />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 mb-8"><Sparkles className="text-purple-300 w-7 h-7" /></div>
              <h2 className="text-4xl font-extrabold mb-4">Design Your <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200">Dream Space</span></h2>
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

            <Form form={form} layout="vertical" initialValues={{ country_code: "971" }} onFinish={handleSubmit}>
              
              {activeTab === "signup" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Form.Item name="first_name" rules={[{ required: true, message: 'Required' }]}><Input prefix={<User size={18} className="text-gray-400"/>} placeholder="First Name" /></Form.Item>
                    <Form.Item name="last_name" rules={[{ required: true, message: 'Required' }]}><Input placeholder="Last Name" /></Form.Item>
                  </div>
                  <Form.Item name="email" rules={[{ required: true, type: "email", message: 'Invalid Email' }]}><Input prefix={<Mail size={18} className="text-gray-400"/>} placeholder="Email" /></Form.Item>
                </>
              )}

              {/* Mobile Input with OTP Logic */}
              <div className="relative">
                <Form.Item
                  label="Mobile Number"
                  name="mobile"
                  rules={[
                    { required: true, message: 'Required' },
                    () => ({
                      validator(_, value) {
                        if (!value) return Promise.resolve();
                        const exactLength = PHONE_LENGTH_RULES[countryCode];
                        if (exactLength && value.length !== exactLength) return Promise.reject(new Error(`Enter exactly ${exactLength} digits`));
                        if (value.length < 7 || value.length > 15) return Promise.reject(new Error("7-15 digits required"));
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <Input
                    addonBefore={prefixSelector}
                    prefix={<Smartphone size={18} className="text-gray-400"/>}
                    maxLength={getRequiredLength()}
                    placeholder="50 123 4567"
                    disabled={otpVerified || otpSent} // Lock input during OTP
                    onChange={(e) => {
                       const val = e.target.value.replace(/\D/g, "");
                       form.setFieldsValue({ mobile: val });
                       setMobileNumber(val); 
                       if(!otpVerified && !otpSent) {
                           setOtpVerified(false);
                       }
                    }}
                  />
                </Form.Item>

                {/* OTP Send/Verify Actions (Only for Signup) */}
                {activeTab === "signup" && (
                    <div className="mb-6">
                        {!otpVerified && !otpSent && (
                            <Button 
                                type="primary"
                                block 
                                onClick={handleSendOtp} 
                                loading={otpLoading}
                                disabled={!mobileNumber}
                                style={{ 
                                    backgroundColor: !mobileNumber ? 'white' : '#1677ff', 
                                    borderColor: !mobileNumber ? '#d9d9d9' : '#1677ff',
                                    color: !mobileNumber ? 'rgba(0,0,0,0.25)' : 'white'
                                }}
                            >
                                Send OTP
                            </Button>
                        )}

                        {otpSent && !otpVerified && (
                             <div className="flex flex-col gap-2 mt-2">
                                <div className="flex gap-2">
                                    <Input 
                                        placeholder="Enter OTP" 
                                        value={otpValue} 
                                        onChange={(e) => setOtpValue(e.target.value)}
                                        prefix={<SafetyCertificateOutlined className="text-gray-400"/>}
                                    />
                                    <Button type="primary" style={{ background: "#1677ff", borderColor: "#1677ff", borderRadius: 8 }} onClick={handleVerifyOtp} loading={otpLoading}>Verify</Button>
                                </div>
                                {/* 🟢 Added Change Number Button */}
                                <div className="text-right">
                                    <Button 
                                        type="link" 
                                        size="small" 
                                        danger 
                                        icon={<EditOutlined />}
                                        onClick={handleChangeNumber}
                                    >
                                        Change Number
                                    </Button>
                                </div>
                             </div>
                        )}

                        {otpVerified && (
                            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded border border-green-200 mt-[-10px]">
                                <CheckCircleFilled /> <span className="text-sm font-medium">Mobile Number Verified</span>
                            </div>
                        )}
                    </div>
                )}
              </div>

              {activeTab === "signup" && (
                <>
                  <Form.Item name="location_country" rules={[{ required: true, message: "Required" }]}>
                    <Select placeholder="Select Country" showSearch optionFilterProp="children" onChange={handleLocationCountryChange} filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                      {countriesList.map((country) => (
                        <Option key={country.isoCode} value={country.isoCode}>{country.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <div className="grid grid-cols-2 gap-4">
                    <Form.Item name="state" rules={[{ required: true, message: "Required" }]}>
                      <Select placeholder="State" showSearch optionFilterProp="children" onChange={handleLocationStateChange} disabled={!statesList.length} filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                        {statesList.map((state) => <Option key={state.isoCode} value={state.isoCode}>{state.name}</Option>)}
                      </Select>
                    </Form.Item>
                    <Form.Item name="city" rules={[{ required: true, message: "Required" }]}>
                      <Select placeholder="City" showSearch optionFilterProp="children" disabled={!citiesList.length} filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                        {citiesList.map((city) => <Option key={city.name} value={city.name}>{city.name}</Option>)}
                      </Select>
                    </Form.Item>
                  </div>
                </>
              )}

              <Button type="primary" htmlType="submit" block loading={isSubmitting} className="h-14 mt-4" style={{ background: `linear-gradient(135deg, ${BRAND_PURPLE}, ${BRAND_PURPLE_DARK})`, border: "none" }}>{activeTab === "signin" ? "Sign In" : "Create Account"}</Button>
              <div className="mt-4 text-xs text-gray-400 flex items-center justify-center gap-1"><Lock size={12} /> 256-bit SSL Encrypted</div>
            </Form>
          </div>
        </div>
      </Modal>
    </ConfigProvider>
  );
};

export default LeadGenerationModal;