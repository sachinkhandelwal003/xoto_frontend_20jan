import React, { useState, useContext, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { User, Mail, Phone, Lock, CheckCircle, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Select, Button, message, notification } from "antd";
import { apiService } from "../manageApi/utils/custom.apiservice";
import { AuthContext } from "../manageApi/context/AuthContext";
import { Country } from "country-state-city"; // Import Library
import { showToast } from "../manageApi/utils/toast";
const { Option } = Select;

// --- Phone Length Rules ---
const PHONE_LENGTH_RULES = {
  "AE": 9, "IN": 10, "SA": 9, "US": 10, "CA": 10, "GB": 10, "AU": 9,
};

const RegisterNowPage = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ mode: "onBlur" });

  const [countryIso, setCountryIso] = useState("AE"); 
  const [mobileNumber, setMobileNumber] = useState("");
  const [loading, setLoading] = useState(false);

  // --- OTP States ---
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  // --- Country Data ---
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

  const getCountryCode = () => {
    const selectedCountryData = Country.getCountryByCode(countryIso);
    return selectedCountryData ? `+${selectedCountryData.phonecode}` : "+971";
  };

  /* ================= OTP HANDLERS ================= */

  const handleSendOtp = async () => {
    const requiredDigits = PHONE_LENGTH_RULES[countryIso] || 10;
    if (!mobileNumber || mobileNumber.length !== requiredDigits) {
        message.error(`Please enter a valid ${requiredDigits}-digit number first.`);
        return;
    }

    setOtpLoading(true);
    try {
        const payload = {
            country_code: getCountryCode(),
            phone_number: mobileNumber
        };
        await apiService.post("/otp/send-otp", payload);
        message.success("OTP sent successfully!");
        setOtpSent(true);
        setOtpVerified(false);
    } catch (error) {
        const errMsg = error?.response?.data?.message || "Failed to send OTP";
        notification.error({ message: "OTP Error", description: errMsg });
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
        const payload = {
            country_code: getCountryCode(),
            phone_number: mobileNumber,
            otp: enteredOtp
        };
        await apiService.post("/otp/verify-otp", payload);
        message.success("Mobile Verified Successfully!");
        setOtpVerified(true);
        setOtpSent(false);
    } catch (error) {
        notification.error({
            message: "Verification Failed",
            description: error?.response?.data?.message || "Invalid OTP"
        });
    } finally {
        setOtpLoading(false);
    }
  };

  /* ================= SUBMIT LOGIC ================= */

  const onSubmit = async (data) => {
    if (!otpVerified) {
        message.error("Please verify your mobile number before registering.");
        return;
    }

    const signupPayload = {
      name: { first_name: data.first_name.trim(), last_name: data.last_name.trim() },
      email: data.email.toLowerCase().trim(),
      password: data.password,
      confirm_password: data.confirmPassword,
      mobile: { country_code: getCountryCode(), number: String(mobileNumber) },
      comingFromAiPage: true,
    };

    try {
      setLoading(true);
      
      // 1. Sign Up
      await apiService.post("/users/signup/customer", signupPayload);

      // 2. Auto Login
      await login("/users/login/customer", {
        mobile: { country_code: getCountryCode(), number: String(mobileNumber) },
      });

      // 3. Redirect
      navigate("/dashboard/customer", { replace: true });

   } catch (err) {
  const apiError = err?.response?.data;

  // 1️⃣ Case: API returns ARRAY of errors
  if (Array.isArray(apiError)) {
    apiError.forEach(e => {
      if (e?.message) {
        showToast(e.message, "error");
      }
    });
    return;
  }

  // 2️⃣ Case: Validation errors (field-level)
  if (apiError?.errors && Array.isArray(apiError.errors)) {
    // Show ONLY first error in toast
    showToast(apiError.errors[0]?.message, "error");

    // Map ALL errors to form fields
    apiError.errors.forEach(errObj => {
      let fieldName = errObj.field?.split(".").pop();

      if (errObj.field === "mobile.number") {
        fieldName = "mobileNumber";
      }

      setError(fieldName, {
        type: "manual",
        message: errObj.message,
      });
    });
    return;
  }

  // 3️⃣ Case: Account already exists
  if (
    apiError?.message &&
    /already|exists/i.test(apiError.message)
  ) {
    showToast("Account already exists. Please login.", "warning");
    navigate("/user/login");
    return;
  }

  // 4️⃣ Fallback message
  if (apiError?.message) {
    showToast(apiError.message, "error");
  } else {
    showToast("Registration failed. Please try again.", "error");
  }

} finally {
  setLoading(false);
}
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#5C039B] py-12 px-4">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">

        {/* LEFT SIDE */}
        <div className="hidden lg:flex flex-col justify-between p-12 text-white bg-[#5C039B] relative">
          <div className="absolute inset-0 bg-black/20" /> 
          
          <div className="relative z-10">
            <h1 className="text-4xl font-extrabold"><span className="text-green-400">Xoto</span></h1>
            <h2 className="text-3xl font-semibold mt-6">Customer Registration</h2>
            <p className="mt-4 text-white/80 max-w-sm leading-relaxed">
              Create your account to start designing your dream outdoor spaces using AI.
            </p>
          </div>
          
          <div className="relative z-10 text-sm text-white/70">
            © {new Date().getFullYear()} Xoto. All rights reserved.
          </div>
        </div>

        {/* RIGHT SIDE - Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#5C039B]">Create Account</h2>
            <p className="text-gray-500 mt-2">Sign up using your details below</p>
          </div>

          <Form layout="vertical" onFinish={handleSubmit(onSubmit)} className="space-y-3">
            
            {/* NAME INPUTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item label="First Name" validateStatus={errors.first_name && "error"} help={errors.first_name?.message}>
                <Controller name="first_name" control={control} rules={{ required: "First name is required" }} 
                    render={({ field }) => <Input size="large" prefix={<User />} {...field} />} />
              </Form.Item>
              <Form.Item label="Last Name" validateStatus={errors.last_name && "error"} help={errors.last_name?.message}>
                <Controller name="last_name" control={control} rules={{ required: "Last name is required" }} 
                    render={({ field }) => <Input size="large" prefix={<User />} {...field} />} />
              </Form.Item>
            </div>

            {/* EMAIL */}
            <Form.Item label="Email" validateStatus={errors.email && "error"} help={errors.email?.message}>
              <Controller name="email" control={control} rules={{ required: "Email is required", pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" } }} 
                  render={({ field }) => <Input size="large" prefix={<Mail />} {...field} />} />
            </Form.Item>

            {/* ================= MOBILE & COUNTRY CODE ================= */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number <span className="text-red-500">*</span>
                </label>
                
                <div className="flex gap-3 items-start">
                    
                    {/* Country Code */}
                    <div className="w-[130px]">
                        <Select
                            size="large"
                            value={countryIso}
                            // disabled={otpVerified || otpSent}
                            onChange={(val) => {
                                setCountryIso(val);
                                setMobileNumber("");
                                setOtpSent(false);
                                setOtpVerified(false);
                            }}
                            className="w-full custom-select-register"
                            showSearch
                            optionFilterProp="children"
                        >
                            {countryOptions.map((item) => (
                                <Option key={item.iso} value={item.iso}>
                                    <div className="flex items-center gap-2">
                                        <img src={`https://flagcdn.com/w20/${item.iso.toLowerCase()}.png`} alt="" className="w-5 rounded-[2px]" />
                                        <span>+{item.code}</span>
                                    </div>
                                </Option>
                            ))}
                        </Select>
                    </div>

                    {/* Mobile Input */}
                    <div className="flex-1">
                        <Form.Item 
                             validateStatus={errors.mobileNumber && "error"} 
                             help={errors.mobileNumber?.message} 
                             className="mb-0"
                        >
                            <div className="flex gap-2">
                                <Input
                                    size="large"
                                    prefix={<Phone size={16} className="text-gray-400" />}
                                    value={mobileNumber}
                                    // disabled={otpVerified || otpSent}
                                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                                    placeholder="Enter digits"
                                    maxLength={PHONE_LENGTH_RULES[countryIso] || 15}
                                    suffix={otpVerified && <CheckCircle size={16} className="text-green-500" />}
                                />
                                
                                {/* Send Button */}
                                {!otpVerified && !otpSent && (
                                    <Button 
                                        type="primary" 
                                        size="large" 
                                        onClick={handleSendOtp}
                                        loading={otpLoading}
                                        disabled={!mobileNumber}
                                        className="bg-black hover:bg-gray-800 border-none min-w-[90px]"
                                    >
                                        Send OTP
                                    </Button>
                                )}

                                {/* Change Button */}
                                {otpSent && !otpVerified && (
                                     <Button danger size="large" onClick={() => { setOtpSent(false); setEnteredOtp(""); }}>
                                        Change
                                     </Button>
                                )}
                            </div>
                        </Form.Item>
                    </div>
                </div>

                {/* OTP Verify Section */}
                {otpSent && !otpVerified && (
                    <div className="mt-3 p-3 bg-purple-50 rounded-xl border border-purple-100 animate-fade-in">
                        <div className="flex gap-2 items-center">
                            <div className="flex-1">
                                <Input 
                                    size="large" 
                                    placeholder="Enter 6-digit OTP" 
                                    value={enteredOtp}
                                    onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ""))}
                                    maxLength={6}
                                    prefix={<ShieldCheck size={16} className="text-purple-600"/>}
                                />
                            </div>
                            <Button type="primary" size="large" onClick={handleVerifyOtp} loading={otpLoading} className="bg-purple-600">
                                Verify OTP
                            </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 ml-1">
                            Sent to +{Country.getCountryByCode(countryIso).phonecode} {mobileNumber}
                        </p>
                    </div>
                )}
            </div>

            {/* PASSWORDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item label="Password" validateStatus={errors.password && "error"} help={errors.password?.message}>
                <Controller name="password" control={control} rules={{ required: "Required", minLength: { value: 6, message: "Min 6 chars" } }} 
                    render={({ field }) => <Input.Password size="large" prefix={<Lock />} {...field} />} />
                </Form.Item>
                <Form.Item label="Confirm Password" validateStatus={errors.confirmPassword && "error"} help={errors.confirmPassword?.message}>
                <Controller name="confirmPassword" control={control} rules={{ required: "Required" }} 
                    render={({ field }) => <Input.Password size="large" prefix={<Lock />} {...field} />} />
                </Form.Item>
            </div>

            {/* SUBMIT BUTTON - FIX: !text-white ensures white text ALWAYS */}
            <Button
                htmlType="submit"
                loading={loading}
                block
                size="large"
                disabled={!otpVerified}
                className={`rounded-xl h-12 mt-4 font-semibold !text-white !border-none ${
                    !otpVerified 
                    ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' // Disabled: Gray BG, White Text
                    : '!bg-[#5C039B] hover:!bg-[#4a027d]' // Active: Purple BG, White Text
                }`}
            >
                {!otpVerified ? "Verify Mobile to Continue" : "Create Account"}
            </Button>

            <div className="text-center mt-6 text-sm">
              <span className="text-gray-500">Already have an account? </span>
              <span onClick={() => navigate("/user/login")} className="text-[#5C039B] font-semibold cursor-pointer hover:underline">Login</span>
            </div>

          </Form>
        </div>
      </div>
      
      <style jsx global>{`
        .custom-select-register .ant-select-selector { border-radius: 0.5rem !important; height: 40px !important; display: flex !important; align-items: center !important; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default RegisterNowPage;