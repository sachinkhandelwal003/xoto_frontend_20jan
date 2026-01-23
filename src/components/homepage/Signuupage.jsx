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

  /* ================= PREFIX SELECTOR ================= */
  const prefixSelector = (
    <Form.Item name="country_code" noStyle initialValue="971">
      <Select
        style={{ width: 110 }}
        bordered={false}
        showSearch
        dropdownMatchSelectWidth={320}
        optionFilterProp="children"
        onChange={(val) => {
          setCountryCode(val);
          // Explicitly updating form value to stay synced
          form.setFieldsValue({ country_code: val });
          form.setFieldsValue({ mobile: "" });
          form.validateFields(['mobile']);
        }}
        filterOption={(input, option) => 
          // Search by Name or Code
          option.children[1]?.props?.children[1]?.toLowerCase().includes(input.toLowerCase()) || 
          option.value.includes(input)
        }
      >
        {phoneCodesData.map((item) => (
          <Option key={item.iso} value={item.code}>
            <div className="flex items-center">
              {/* Flag Image from CDN */}
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

  /* ================= SUBMIT HANDLER (FIXED) ================= */
  const handleSubmit = async (values) => {
    setIsSubmitting(true);

    try {
      // FIX: Ensure Country Code has '+' prefix
      const rawCode = values.country_code ? values.country_code.toString() : "971";
      const formattedCode = rawCode.startsWith("+") ? rawCode : `+${rawCode}`;

      const mobilePayload = {
        country_code: formattedCode, // Sends +971 instead of 971
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

        const payload = {
          name: { first_name: values.first_name, last_name: values.last_name },
          email: values.email,
          comingFromAiPage: true,
          mobile: mobilePayload,
          location: { country: countryName, state: stateName, city: values.city, address: "" },
        };

        const response = await apiService.post("/users/signup/customer", payload);

        if (response?.success) {
          notification.success({ message: "Account Created", description: "Logging you in..." });
          const loginData = await login("/users/login/customer", { mobile: mobilePayload });
          onAuthSuccess?.(loginData);
          onCancel();
          form.resetFields();
        }
      }
    } catch (error) {
        const data = error?.response?.data;
        if (Array.isArray(data?.errors) && data.errors.length > 0) {
            const fieldErrors = data.errors.map((err) => {
                const parts = err.field?.split(".");
                const fieldName = parts?.length > 1 ? parts[parts.length - 1] : parts?.[0];
                return { name: fieldName, errors: [err.message] };
            });
            form.setFields(fieldErrors);
        } else if (activeTab === "signin") {
            form.setFields([{ name: "mobile", errors: [data?.message || "Error"] }]);
        } else {
            notification.error({ message: "Failed", description: data?.message || "Error" });
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
          <div className="lg:w-7/12 p-8 lg:p-12 relative">
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

              <Form.Item
                label="Mobile Number"
                name="mobile"
                rules={[
                  { required: true, message: 'Required' },
                  () => ({
                    validator(_, value) {
                      if (!value) return Promise.resolve();
                      const exactLength = PHONE_LENGTH_RULES[countryCode];
                      if (exactLength) {
                        if (value.length !== exactLength) return Promise.reject(new Error(`Enter exactly ${exactLength} digits`));
                        return Promise.resolve();
                      }
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
                  onChange={(e) => form.setFieldsValue({ mobile: e.target.value.replace(/\D/g, "") })}
                />
              </Form.Item>

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