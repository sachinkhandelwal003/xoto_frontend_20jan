import React, { useState, useContext } from "react";
import { useForm, Controller } from "react-hook-form";
import { User, Mail, Phone, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Select, Button, message } from "antd";
import { apiService } from "../manageApi/utils/custom.apiservice";
import { AuthContext } from "../manageApi/context/AuthContext";

const { Option } = Select;

/* ================= COUNTRY CONFIG ================= */

const COUNTRY_PHONE_RULES = {
  "+91": { label: "India", digits: 10 },
  "+971": { label: "UAE", digits: 9 },
  "+966": { label: "Saudi Arabia", digits: 9 },
  "+1": { label: "USA / Canada", digits: 10 },
};

const countryCodes = Object.keys(COUNTRY_PHONE_RULES).map((code) => ({
  value: code,
  label: `${code} ${COUNTRY_PHONE_RULES[code].label}`,
}));

/* ================= COMPONENT ================= */

const RegisterNowPage = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ mode: "onBlur" });

  const [countryCode, setCountryCode] = useState("+971");
  const [mobileNumber, setMobileNumber] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= SUBMIT ================= */

  const onSubmit = async (data) => {
    const requiredDigits = COUNTRY_PHONE_RULES[countryCode].digits;

    if (mobileNumber.length !== requiredDigits) {
      return message.error(
        `Please enter a valid ${requiredDigits}-digit mobile number`
      );
    }

    if (data.password !== data.confirmPassword) {
      return message.error("Passwords do not match");
    }

    const signupPayload = {
      name: {
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
      },
      email: data.email.toLowerCase().trim(),
      password: data.password,
      confirm_password: data.confirmPassword,
      mobile: {
        country_code: countryCode,
        number: String(mobileNumber),
      },
      comingFromAiPage: true,
    };

    try {
      setLoading(true);

      // 1️⃣ SIGN UP
      await apiService.post("/users/signup/customer", signupPayload);

      // 2️⃣ AUTO LOGIN (AuthContext)
      await login("/users/login/customer", {
        mobile: {
          country_code: countryCode,
          number: String(mobileNumber),
        },
      });

      // 3️⃣ REDIRECT
      navigate("/dashboard/customer", { replace: true });

    } catch (err) {
      const apiError = err?.response?.data;

      // Handle structured validation errors from backend
      if (apiError?.errors && Array.isArray(apiError.errors)) {
        apiError.errors.forEach((errObj) => {
          let fieldName = errObj.field;
          
          if (fieldName === "mobile.number") {
            fieldName = "mobileNumber"; 
          }

          setError(fieldName, {
            type: "manual",
            message: errObj.message,
          });
        });
        return; 
      }

      if (
        apiError?.message?.toLowerCase().includes("already") ||
        apiError?.message?.toLowerCase().includes("exists")
      ) {
        message.warning("Account already exists. Please login.");
        navigate("/user/login");
        return;
      }

      if (apiError?.message && apiError.message !== "Validation failed") {
          message.error(apiError.message);
      } else if (!apiError?.errors) {
          message.error("Registration failed");
      }
      
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#5C039B] py-12 px-4">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">

        {/* ===== LEFT ===== */}
        <div className="hidden lg:flex flex-col justify-between p-12 text-white bg-[#5C039B] relative">
          <div className="absolute inset-0 bg-black/20" />

          <div className="relative z-10">
            <h1 className="text-4xl font-extrabold">
              <span className="text-green-400">Xoto</span>
            </h1>
            <h2 className="text-3xl font-semibold mt-6">
              Customer Registration
            </h2>
            <p className="mt-4 text-white/80 max-w-sm leading-relaxed">
              Create your account to start designing your dream outdoor spaces
              using AI.
            </p>
          </div>

          <div className="relative z-10 text-sm text-white/70">
            © {new Date().getFullYear()} Xoto. All rights reserved.
          </div>
        </div>

        {/* ===== RIGHT ===== */}
        <div className="p-8 md:p-12 flex flex-col justify-center">

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-800">
              Create Account
            </h2>
            <p className="text-gray-500 mt-2">
              Sign up using your details below
            </p>
          </div>

          <Form
            layout="vertical"
            onFinish={handleSubmit(onSubmit)}
            className="space-y-4"
          >

            {/* NAME */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label="First Name"
                validateStatus={errors.first_name && "error"}
                help={errors.first_name?.message}
              >
                <Controller
                  name="first_name"
                  control={control}
                  rules={{ required: "First name is required" }}
                  render={({ field }) => (
                    <Input size="large" prefix={<User />} {...field} />
                  )}
                />
              </Form.Item>

              <Form.Item
                label="Last Name"
                validateStatus={errors.last_name && "error"}
                help={errors.last_name?.message}
              >
                <Controller
                  name="last_name"
                  control={control}
                  rules={{ required: "Last name is required" }}
                  render={({ field }) => (
                    <Input size="large" prefix={<User />} {...field} />
                  )}
                />
              </Form.Item>
            </div>

            {/* EMAIL */}
            <Form.Item
              label="Email Address"
              validateStatus={errors.email && "error"}
              help={errors.email?.message}
            >
              <Controller
                name="email"
                control={control}
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "Enter a valid email address",
                  },
                }}
                render={({ field }) => (
                  <Input size="large" prefix={<Mail />} {...field} />
                )}
              />
            </Form.Item>

            {/* MOBILE */}
            <Form.Item
              label={`Mobile Number (${COUNTRY_PHONE_RULES[countryCode].digits} digits)`}
              required
              validateStatus={errors.mobileNumber && "error"}
              help={errors.mobileNumber?.message}
            >
              <div className="flex gap-3">
                <Select
                  size="large"
                  value={countryCode}
                  onChange={(val) => {
                    setCountryCode(val);
                    setMobileNumber("");
                  }}
                  className="w-[150px]"
                >
                  {countryCodes.map((c) => (
                    <Option key={c.value} value={c.value}>
                      {c.label}
                    </Option>
                  ))}
                </Select>

                <Input
                  size="large"
                  prefix={<Phone />}
                  value={mobileNumber}
                  status={errors.mobileNumber ? "error" : ""}
                  onChange={(e) =>
                    setMobileNumber(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder={`Enter ${COUNTRY_PHONE_RULES[countryCode].digits}-digit number`}
                  maxLength={COUNTRY_PHONE_RULES[countryCode].digits}
                />
              </div>
            </Form.Item>

            {/* PASSWORD */}
            <Form.Item
              label="Password"
              validateStatus={errors.password && "error"}
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
                  <Input.Password size="large" prefix={<Lock />} {...field} />
                )}
              />
            </Form.Item>

            {/* CONFIRM PASSWORD */}
            <Form.Item
              label="Confirm Password"
              validateStatus={errors.confirmPassword && "error"}
              help={errors.confirmPassword?.message}
            >
              <Controller
                name="confirmPassword"
                control={control}
                rules={{ required: "Confirm your password" }}
                render={({ field }) => (
                  <Input.Password size="large" prefix={<Lock />} {...field} />
                )}
              />
            </Form.Item>

            {/* CTA */}
            <div className="pt-4">
              <Button
                // type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                className="rounded-xl h-12 !border-none !text-white font-semibold !bg-[#5C039B] "
              >
                Create Account
              </Button>
            </div>

            {/* LOGIN */}
            <div className="text-center mt-6 text-sm">
              <span className="text-gray-500">Already have an account? </span>
              <span
                onClick={() => navigate("/user/login")}
                className="text-[#5C039B] font-semibold cursor-pointer hover:underline"
              >
                Login
              </span>
            </div>

          </Form>
        </div>
      </div>
    </div>
  );
};

export default RegisterNowPage;