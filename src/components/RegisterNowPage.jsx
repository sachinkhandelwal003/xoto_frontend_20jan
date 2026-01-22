import React, { useState, useContext, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { User, Mail, Phone, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Select, Button, message, notification } from "antd";
import { apiService } from "../manageApi/utils/custom.apiservice";
import { AuthContext } from "../manageApi/context/AuthContext";
import { Country } from "country-state-city"; // Import Library

const { Option } = Select;

/* ================= PHONE RULES ================= */
// Define strict length rules by ISO Code
const PHONE_LENGTH_RULES = {
  "AE": 9,  // UAE
  "IN": 10, // India
  "SA": 9,  // Saudi Arabia
  "US": 10, // USA
  "CA": 10, // Canada
  "GB": 10, // UK
  "AU": 9,  // Australia
};

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

  // Default to UAE (AE)
  const [countryIso, setCountryIso] = useState("AE"); 
  const [mobileNumber, setMobileNumber] = useState("");
  const [loading, setLoading] = useState(false);

  // Memoized Country Data
  const countryOptions = useMemo(() => {
    const priorityIsoCodes = ["AE", "IN", "SA", "US", "GB", "AU"];
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

  /* ================= SUBMIT ================= */

  const onSubmit = async (data) => {
    // 1. Get required length based on selected ISO
    const requiredDigits = PHONE_LENGTH_RULES[countryIso] || 10; 

    // 2. Strict Length Validation
    if (mobileNumber.length !== requiredDigits) {
        // Get country name for error message
        const cName = countryOptions.find(c => c.iso === countryIso)?.name || "Selected Country";
        return message.error(`${cName} numbers must be exactly ${requiredDigits} digits`);
    }

    if (data.password !== data.confirmPassword) {
      return message.error("Passwords do not match");
    }

    // Get phone code from ISO
    const selectedCountryData = Country.getCountryByCode(countryIso);
    const finalCountryCode = selectedCountryData ? `+${selectedCountryData.phonecode}` : "+971";

    const signupPayload = {
      name: {
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
      },
      email: data.email.toLowerCase().trim(),
      password: data.password,
      confirm_password: data.confirmPassword,
      mobile: {
        country_code: finalCountryCode,
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
          country_code: finalCountryCode,
          number: String(mobileNumber),
        },
      });

      // 3️⃣ REDIRECT
      navigate("/dashboard/customer", { replace: true });

    } catch (err) {
      const apiError = err?.response?.data;

      // Handle structured validation errors from backend
      if (apiError?.errors && Array.isArray(apiError.errors) && apiError.errors.length > 0) {
        
        // --- 1. Show ONLY the 0 index error in Toast ---
        const firstError = apiError.errors[0];
        notification.error({
          message: "Validation Failed",
          description: firstError.message,
          duration: 4,
        });

        // --- 2. Map ALL errors to fields (Red Border) ---
        apiError.errors.forEach((errObj) => {
          const parts = errObj.field?.split(".");
          let fieldName = parts?.length > 1 ? parts[parts.length - 1] : parts?.[0];

          if (fieldName === "number" || errObj.field === "mobile.number") {
            fieldName = "mobileNumber";
          }

          setError(fieldName, {
            type: "manual",
            message: errObj.message,
          });
        });
        return; 
      }

      // Check for account existence error
      if (
        apiError?.message?.toLowerCase().includes("already") ||
        apiError?.message?.toLowerCase().includes("exists")
      ) {
        message.warning("Account already exists. Please login.");
        navigate("/user/login");
        return;
      }

      // Fallback Generic Error
      if (apiError?.message && apiError.message !== "Validation failed") {
          notification.error({
            message: "Registration Failed",
            description: apiError.message,
          });
      } else if (!apiError?.errors) {
          message.error("Registration failed. Please try again.");
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

            {/* MOBILE WITH DYNAMIC COUNTRY & FLAGS */}
            <Form.Item
              label={`Mobile Number (${PHONE_LENGTH_RULES[countryIso] || 15} digits)`}
              required
              validateStatus={errors.mobileNumber && "error"}
              help={errors.mobileNumber?.message}
            >
              <div className="flex gap-3">
                {/* Antd Select with Flags */}
                <Select
                  size="large"
                  value={countryIso}
                  onChange={(val) => {
                    setCountryIso(val);
                    setMobileNumber(""); // Clear number on country change
                  }}
                  className="w-[140px] custom-select-register"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) => 
                    option.children.props?.children[1]?.props?.children[1]?.toLowerCase().includes(input.toLowerCase()) || 
                    option.value.includes(input)
                  }
                  dropdownMatchSelectWidth={300}
                >
                  {countryOptions.map((item) => (
                    <Option key={item.iso} value={item.iso}>
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

                <Input
                  size="large"
                  prefix={<Phone />}
                  value={mobileNumber}
                  status={errors.mobileNumber ? "error" : ""}
                  onChange={(e) =>
                    setMobileNumber(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder={`Enter digits`}
                  maxLength={PHONE_LENGTH_RULES[countryIso] || 15}
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

      {/* Styles for Antd Select */}
      <style jsx global>{`
        .custom-select-register .ant-select-selector {
          border-radius: 0.5rem !important; 
          height: 40px !important;
          display: flex !important;
          align-items: center !important;
        }
      `}</style>
    </div>
  );
};

export default RegisterNowPage;