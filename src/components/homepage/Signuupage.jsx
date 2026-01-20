import React, { useState, useContext } from "react";
import {
  Sparkles,
  X,
  User,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  MapPin,
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
import { AuthContext } from "../../manageApi/context/AuthContext";
import { apiService } from "../../manageApi/utils/custom.apiservice";

const { Option } = Select;
const { Text, Title } = Typography;

const BRAND_PURPLE = "#5C039B";
const BRAND_PURPLE_DARK = "#4a027d";

/* ================= PHONE RULES ================= */
const PHONE_RULES = {
  "+971": { digits: 9, country: "UAE" },
  "+91": { digits: 10, country: "India" },
  "+1": { digits: 10, country: "USA" },
  "+44": { digits: 10, country: "UK" },
  "+966": { digits: 9, country: "Saudi Arabia" },
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
  const [countryCode, setCountryCode] = useState("+971");

  /* ================= COUNTRY SELECT ================= */
  const prefixSelector = (
    <Form.Item name="country_code" noStyle>
      <Select
        value={countryCode}
        style={{ width: 100 }}
        bordered={false}
        dropdownMatchSelectWidth={false}
        className="font-medium text-gray-700"
        onChange={(val) => {
          setCountryCode(val);
          form.setFieldsValue({ mobile: "" });
        }}
      >
        <Option value="+971">🇦🇪 +971</Option>
        <Option value="+91">🇮🇳 +91</Option>
        <Option value="+1">🇺🇸 +1</Option>
        <Option value="+44">🇬🇧 +44</Option>
        <Option value="+966">🇸🇦 +966</Option>
      </Select>
    </Form.Item>
  );

  /* ================= SUBMIT ================= */
  const handleSubmit = async (values) => {
    setIsSubmitting(true);

    try {
      const mobilePayload = {
        country_code: values.country_code,
        number: values.mobile.toString(),
      };

      /* ---------- SIGN IN ---------- */
      if (activeTab === "signin") {
        const loginData = await login("/users/login/customer", {
          mobile: mobilePayload,
        });

        onAuthSuccess?.(loginData);
        onCancel();
      }

      /* ---------- SIGN UP ---------- */
      else {
        const payload = {
          name: {
            first_name: values.first_name,
            last_name: values.last_name,
          },
          email: values.email,
          comingFromAiPage: true,
          mobile: mobilePayload,
          location: {
            country: PHONE_RULES[values.country_code].country,
            state: values.state,
            city: values.city,
            address: "",
          },
        };

        const response = await apiService.post(
          "/users/signup/customer",
          payload
        );

        if (response?.success) {
          notification.success({
            message: "Account Created",
            description: "Logging you in automatically...",
          });

          const loginData = await login("/users/login/customer", {
            mobile: mobilePayload,
          });

          onAuthSuccess?.(loginData);
          onCancel();
          form.resetFields();
        }
      }
    } catch (error) {
      notification.error({
        message: "Authentication Failed",
        description:
          error?.response?.data?.message || "Something went wrong",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: BRAND_PURPLE,
          borderRadius: 12,
          controlHeight: 45,
          fontFamily: "'Inter', sans-serif",
        },
      }}
    >
      <Modal
        open={visible}
        footer={null}
        onCancel={onCancel}
        width={fullscreen ? "100vw" : 1000}
        centered={!fullscreen}
        closable={!fullscreen}
        bodyStyle={{
          padding: 0,
          borderRadius: fullscreen ? 0 : "24px",
          height: fullscreen ? "100vh" : "auto",
          overflow: "hidden",
        }}
        maskStyle={{
          backdropFilter: "blur(8px)",
          background: "rgba(0,0,0,0.6)",
        }}
      >
        <div className="flex flex-col lg:flex-row min-h-[600px] bg-white">
          {/* ================= LEFT PANEL ================= */}
          <div className="lg:w-5/12 relative hidden lg:flex flex-col justify-between p-10 text-white overflow-hidden bg-gray-900">
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop"
                alt="bg"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 to-black/80" />
            </div>

            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 mb-8">
                <Sparkles className="text-purple-300 w-7 h-7" />
              </div>

              <h2 className="text-4xl font-extrabold mb-4">
                Design Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200">
                  Dream Space
                </span>
              </h2>

              <p className="text-purple-100/80">
                AI-powered landscape design in seconds.
              </p>
            </div>

            <div className="relative z-10 space-y-4">
              {[
                "Unlimited AI Generations",
                "High-Resolution Downloads",
                "Save Your Designs",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="text-green-400" size={16} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ================= RIGHT PANEL ================= */}
          <div className="lg:w-7/12 p-8 lg:p-12 relative">
            <button
              onClick={onCancel}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-700"
            >
              <X />
            </button>

            <Title level={2}>
              {activeTab === "signin" ? "Welcome Back" : "Create Account"}
            </Title>

            {/* Tabs */}
            <div className="flex p-1.5 bg-gray-100 rounded-xl my-6">
              <button
                onClick={() => {
                  setActiveTab("signin");
                  form.resetFields();
                }}
                className={`flex-1 py-3 rounded-lg ${
                  activeTab === "signin" && "bg-white shadow"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setActiveTab("signup");
                  form.resetFields();
                }}
                className={`flex-1 py-3 rounded-lg ${
                  activeTab === "signup" && "bg-white shadow"
                }`}
              >
                Create Account
              </button>
            </div>

            <Form
              form={form}
              layout="vertical"
              initialValues={{ country_code: "+971" }}
              onFinish={handleSubmit}
            >
              {activeTab === "signup" && (
                <>
                  <Form.Item name="first_name" rules={[{ required: true }]}>
                    <Input prefix={<User />} placeholder="First Name" />
                  </Form.Item>

                  <Form.Item name="last_name" rules={[{ required: true }]}>
                    <Input placeholder="Last Name" />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    rules={[{ required: true, type: "email" }]}
                  >
                    <Input prefix={<Mail />} placeholder="Email" />
                  </Form.Item>
                </>
              )}

              <Form.Item
                label="Mobile Number"
                name="mobile"
                rules={[
                  { required: true },
                  {
                    pattern: new RegExp(
                      `^[0-9]{${PHONE_RULES[countryCode].digits}}$`
                    ),
                    message: `Enter ${PHONE_RULES[countryCode].digits} digit number`,
                  },
                ]}
              >
                <Input
                  addonBefore={prefixSelector}
                  prefix={<Smartphone />}
                  maxLength={PHONE_RULES[countryCode].digits}
                  onChange={(e) =>
                    form.setFieldsValue({
                      mobile: e.target.value.replace(/\D/g, ""),
                    })
                  }
                />
              </Form.Item>

              {activeTab === "signup" && (
                <>
                  <Form.Item name="state" rules={[{ required: true }]}>
                    <Input prefix={<MapPin />} placeholder="State / Emirate" />
                  </Form.Item>

                  <Form.Item name="city" rules={[{ required: true }]}>
                    <Input placeholder="City" />
                  </Form.Item>
                </>
              )}

              <Button
                type="primary"
                htmlType="submit"
                block
                loading={isSubmitting}
                className="h-14 mt-4"
                style={{
                  background: `linear-gradient(135deg, ${BRAND_PURPLE}, ${BRAND_PURPLE_DARK})`,
                  border: "none",
                }}
              >
                {activeTab === "signin" ? "Sign In" : "Create Account"}
              </Button>

              <div className="mt-4 text-xs text-gray-400 flex items-center justify-center gap-1">
                <Lock size={12} /> 256-bit SSL Encrypted
              </div>
            </Form>
          </div>
        </div>
      </Modal>
    </ConfigProvider>
  );
};

export default LeadGenerationModal;
