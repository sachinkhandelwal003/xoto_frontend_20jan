import React, { useState, useContext, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { User, Mail, Phone, Lock, CheckCircle, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Select, Button, message, notification } from "antd";
import { apiService } from "../manageApi/utils/custom.apiservice";
import { AuthContext } from "../manageApi/context/AuthContext";
import { Country } from "country-state-city";
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
    clearErrors,
    watch,
    formState: { errors },
  } = useForm({ mode: "onBlur" });

  const watchEmail = watch("email");

  const [countryIso, setCountryIso] = useState("AE");
  const [mobileNumber, setMobileNumber] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Mobile OTP States ---
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  // --- Email OTP States ---
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);
  const [emailEnteredOtp, setEmailEnteredOtp] = useState("");
  const [emailOtpLoading, setEmailOtpLoading] = useState(false);

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

  // --- All countries for nationality dropdown ---
  const nationalityOptions = useMemo(() => {
    return Country.getAllCountries()
      .map((c) => ({ name: c.name, iso: c.isoCode }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const getCountryCode = () => {
    const selectedCountryData = Country.getCountryByCode(countryIso);
    return selectedCountryData ? `+${selectedCountryData.phonecode}` : "+971";
  };

  /* ================= EMAIL OTP HANDLERS ================= */

  const handleSendEmailOtp = async () => {
    if (!watchEmail || errors.email) {
      message.error("Please enter a valid email address first.");
      return;
    }
    setEmailOtpLoading(true);
    try {
      await apiService.post("/otp/email-otp/send", { email: watchEmail.toLowerCase().trim() });
      showToast("Verification code sent! Please check your inbox.", "success");
      setEmailOtpSent(true);
      setEmailOtpVerified(false);
    } catch (error) {
      const errData = error.response?.data;
      if (errData?.errors && errData.errors.length > 0) {
        errData.errors.forEach(err => {
          if (err.field === 'email') setError("email", { type: "manual", message: err.message });
        });
      } else if (errData?.message && /email/i.test(errData.message)) {
        setError("email", { type: "manual", message: errData.message });
      } else {
        notification.error({ message: "Email Error", description: errData?.message || "Failed to send OTP to email." });
      }
    } finally {
      setEmailOtpLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!emailEnteredOtp) {
      message.error("Please enter the code sent to your email.");
      return;
    }
    setEmailOtpLoading(true);
    try {
      const payload = { email: watchEmail.toLowerCase().trim(), otp: emailEnteredOtp };
      await apiService.post("/otp/email-otp/verify", payload);
      message.success("Email Verified Successfully!");
      setEmailOtpVerified(true);
      setEmailOtpSent(false);
    } catch (error) {
      const errData = error.response?.data;
      if (errData?.message && /otp/i.test(errData.message)) {
        notification.error({ message: "Verification Failed", description: errData.message });
      } else {
        notification.error({ message: "Verification Failed", description: "Invalid Email OTP" });
      }
    } finally {
      setEmailOtpLoading(false);
    }
  };

  /* ================= MOBILE OTP HANDLERS ================= */

  const handleSendOtp = async () => {
    const requiredDigits = PHONE_LENGTH_RULES[countryIso] || 10;
    if (!mobileNumber || mobileNumber.length !== requiredDigits) {
      message.error(`Please enter a valid ${requiredDigits}-digit number first.`);
      return;
    }
    setOtpLoading(true);
    try {
      const payload = { country_code: getCountryCode(), phone_number: mobileNumber };
      await apiService.post("/otp/send-otp", payload);
      message.success("Verification code sent to your mobile!");
      setOtpSent(true);
      setOtpVerified(false);
    } catch (error) {
      const errData = error.response?.data;
      if (errData?.errors && errData.errors.length > 0) {
        errData.errors.forEach(err => {
          const fieldName = (err.field === 'mobile' || err.field === 'mobile.number') ? 'mobileNumber' : err.field;
          setError(fieldName, { type: "manual", message: err.message });
        });
      } else if (errData?.message && /(mobile|number|phone)/i.test(errData.message)) {
        setError("mobileNumber", { type: "manual", message: errData.message });
      } else {
        notification.error({ message: "Error", description: errData?.message || "Failed to send OTP" });
      }
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
      const payload = { country_code: getCountryCode(), phone_number: mobileNumber, otp: enteredOtp };
      await apiService.post("/otp/verify-otp", payload);
      message.success("Mobile Verified Successfully!");
      setOtpVerified(true);
      setOtpSent(false);
    } catch (error) {
      notification.error({ message: "Verification Failed", description: error?.response?.data?.message || "Invalid OTP" });
    } finally {
      setOtpLoading(false);
    }
  };

  /* ================= SUBMIT LOGIC ================= */

  const onSubmit = async (data) => {
    if (!otpVerified || !emailOtpVerified) {
      message.error("Please verify both email and mobile number.");
      return;
    }

    const signupPayload = {
      name: { first_name: data.first_name.trim(), last_name: data.last_name.trim() },
      email: data.email.toLowerCase().trim(),
      password: data.password,
      confirm_password: data.confirmPassword,
      mobile: { country_code: getCountryCode(), number: String(mobileNumber) },
      gender: data.gender,
      nationality: data.nationality,
      residencyStatus: data.residencyStatus,
      comingFromAiPage: true,
    };

    try {
      setLoading(true);
      await apiService.post("/users/signup/customer", signupPayload);
      await login("/users/login/customer", {
        mobile: { country_code: getCountryCode(), number: String(mobileNumber) },
      });
      navigate("/dashboard/customer", { replace: true });
    } catch (err) {
      const apiError = err?.response?.data;

      const setFieldErrors = (errorMessage) => {
        const msg = errorMessage.toLowerCase();
        let isSet = false;
        if (msg.includes("email")) { setError("email", { type: "manual", message: errorMessage }); isSet = true; }
        if (msg.includes("mobile") || msg.includes("phone") || msg.includes("number")) { setError("mobileNumber", { type: "manual", message: errorMessage }); isSet = true; }
        if (!isSet) { showToast(errorMessage, "error"); }
      };

      if (apiError?.errors && Array.isArray(apiError.errors) && apiError.errors.length > 0) {
        apiError.errors.forEach((e) => {
          let fieldName = e.field;
          if (fieldName.includes("name.")) fieldName = fieldName.split(".")[1];
          if (fieldName === "mobile.number" || fieldName === "mobile") fieldName = "mobileNumber";
          setError(fieldName, { type: "manual", message: e.message });
        });
      } else if (apiError?.message) {
        setFieldErrors(apiError.message);
      } else if (Array.isArray(apiError) && apiError.length > 0) {
        const firstErr = apiError[0];
        if (firstErr.message) setFieldErrors(firstErr.message);
        else if (typeof firstErr === "string") setFieldErrors(firstErr);
      } else {
        showToast("Registration failed. Try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

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

            {/* Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item label="First Name" validateStatus={errors.first_name && "error"} help={errors.first_name?.message}>
                <Controller name="first_name" control={control} rules={{ required: "First name is required" }}
                  render={({ field }) => <Input size="large" prefix={<User size={18} />} {...field} />} />
              </Form.Item>
              <Form.Item label="Last Name" validateStatus={errors.last_name && "error"} help={errors.last_name?.message}>
                <Controller name="last_name" control={control} rules={{ required: "Last name is required" }}
                  render={({ field }) => <Input size="large" prefix={<User size={18} />} {...field} />} />
              </Form.Item>
            </div>

            {/* EMAIL SECTION WITH OTP */}
            <div className="mb-4">
              <Form.Item label="Email Address" validateStatus={(errors.email || (emailOtpSent && !emailOtpVerified)) ? "error" : ""} help={errors.email?.message} className="mb-0">
                <div className="flex gap-2">
                  <Controller
                    name="email"
                    control={control}
                    rules={{ required: "Email is required", pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" } }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        size="large"
                        prefix={<Mail size={18} />}
                        placeholder="example@mail.com"
                        disabled={emailOtpVerified}
                        onChange={(e) => { field.onChange(e); clearErrors("email"); }}
                        suffix={emailOtpVerified && <CheckCircle size={16} className="text-green-500" />}
                      />
                    )}
                  />
                  {!emailOtpVerified && !emailOtpSent && (
                    <Button type="primary" size="large" onClick={handleSendEmailOtp} loading={emailOtpLoading}
                      style={{ backgroundColor: '#5C039B', borderColor: '#5C039B', minWidth: '90px' }}>
                      Send OTP
                    </Button>
                  )}
                  {emailOtpSent && !emailOtpVerified && (
                    <Button danger size="large" onClick={() => { setEmailOtpSent(false); setEmailEnteredOtp(""); }}>
                      Change
                    </Button>
                  )}
                </div>
              </Form.Item>

              {emailOtpSent && !emailOtpVerified && (
                <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-100 animate-fade-in">
                  <div className="flex gap-2 items-center">
                    <div className="flex-1">
                      <Input size="large" placeholder="Email OTP Code" value={emailEnteredOtp}
                        onChange={(e) => setEmailEnteredOtp(e.target.value.replace(/\D/g, ""))}
                        maxLength={6} prefix={<ShieldCheck size={16} className="text-blue-600" />} />
                    </div>
                    <Button type="primary" size="large" onClick={handleVerifyEmailOtp} loading={emailOtpLoading}
                      style={{ backgroundColor: '#5C039B', borderColor: '#5C039B' }}>
                      Verify Email
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* MOBILE SECTION */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3 items-start">
                <div className="w-[130px]">
                  <Select size="large" value={countryIso} disabled={otpVerified}
                    onChange={(val) => { setCountryIso(val); setMobileNumber(""); setOtpSent(false); setOtpVerified(false); clearErrors("mobileNumber"); }}
                    className="w-full custom-select-register" showSearch optionFilterProp="children">
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

                <div className="flex-1">
                  <Form.Item validateStatus={errors.mobileNumber && "error"} help={errors.mobileNumber?.message} className="mb-0">
                    <div className="flex gap-2">
                      <Input size="large" prefix={<Phone size={16} className="text-gray-400" />}
                        value={mobileNumber} disabled={otpVerified}
                        onChange={(e) => { setMobileNumber(e.target.value.replace(/\D/g, "")); clearErrors("mobileNumber"); }}
                        placeholder="Enter digits" maxLength={PHONE_LENGTH_RULES[countryIso] || 15}
                        suffix={otpVerified && <CheckCircle size={16} className="text-green-500" />} />
                      {!otpVerified && !otpSent && (
                        <Button type="primary" size="large" onClick={handleSendOtp} loading={otpLoading} disabled={!mobileNumber}
                          style={{ backgroundColor: !mobileNumber ? 'white' : '#5C039B', borderColor: !mobileNumber ? '#d9d9d9' : '#5C039B', color: !mobileNumber ? 'rgba(0,0,0,0.25)' : 'white', minWidth: '90px' }}>
                          Send OTP
                        </Button>
                      )}
                      {otpSent && !otpVerified && (
                        <Button danger size="large" onClick={() => { setOtpSent(false); setEnteredOtp(""); }}>Change</Button>
                      )}
                    </div>
                  </Form.Item>
                </div>
              </div>

              {otpSent && !otpVerified && (
                <div className="mt-3 p-3 bg-purple-50 rounded-xl border border-purple-100 animate-fade-in">
                  <div className="flex gap-2 items-center">
                    <div className="flex-1">
                      <Input size="large" placeholder="Enter Bypass OTP" value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ""))}
                        maxLength={6} prefix={<ShieldCheck size={16} className="text-purple-600" />} />
                    </div>
                    <Button type="primary" size="large" onClick={handleVerifyOtp} loading={otpLoading}
                      style={{ backgroundColor: '#5C039B', borderColor: '#5C039B' }}>
                      Verify OTP
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* ── GENDER, NATIONALITY, RESIDENCY STATUS ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Gender */}
              <Form.Item 
                label="Gender"
                validateStatus={errors.gender && "error"} 
                help={errors.gender?.message}
              >
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} size="large" placeholder="Select gender" allowClear>
                      <Option value="male">Male</Option>
                      <Option value="female">Female</Option>
                      <Option value="other">Other</Option>
                    </Select>
                  )}
                />
              </Form.Item>

              {/* Nationality */}
              <Form.Item 
                label="Nationality"
                validateStatus={errors.nationality && "error"} 
                help={errors.nationality?.message}
              >
                <Controller 
                  name="nationality" 
                  control={control}
                  render={({ field }) => (
                    <Select {...field} size="large" placeholder="Select nationality"
                      showSearch optionFilterProp="children" allowClear
                      filterOption={(input, option) =>
                        option?.children?.toLowerCase().includes(input.toLowerCase())
                      }>
                      {nationalityOptions.map((c) => (
                        <Option key={c.iso} value={c.name}>{c.name}</Option>
                      ))}
                    </Select>
                  )} 
                />
              </Form.Item>

              {/* Residency Status */}
              <Form.Item 
                label="Residency Status"
                validateStatus={errors.residencyStatus && "error"} 
                help={errors.residencyStatus?.message}
              >
                <Controller
                  name="residencyStatus"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} size="large" placeholder="Select status" allowClear>
                      <Option value="national">National</Option>
                      <Option value="resident">Resident</Option>
                      <Option value="non_resident">Non Resident</Option>
                    </Select>
                  )}
                />
              </Form.Item>

            </div>
            {/* ────────────────────────────────────────── */}

            {/* Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item label="Password" validateStatus={errors.password && "error"} help={errors.password?.message}>
                <Controller name="password" control={control} rules={{ required: "Required", minLength: { value: 6, message: "Min 6 chars" } }}
                  render={({ field }) => <Input.Password size="large" prefix={<Lock size={18} />} {...field} />} />
              </Form.Item>
              <Form.Item label="Confirm Password" validateStatus={errors.confirmPassword && "error"} help={errors.confirmPassword?.message}>
                <Controller name="confirmPassword" control={control} rules={{ required: "Required" }}
                  render={({ field }) => <Input.Password size="large" prefix={<Lock size={18} />} {...field} />} />
              </Form.Item>
            </div>

            <Button htmlType="submit" loading={loading} block size="large"
              disabled={!otpVerified || !emailOtpVerified}
              className={`rounded-xl h-12 mt-4 font-semibold !text-white !border-none ${
                (!otpVerified || !emailOtpVerified)
                  ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed'
                  : '!bg-[#5C039B] hover:!bg-[#4a027d]'
              }`}>
              {!emailOtpVerified ? "Verify Email to Continue" : !otpVerified ? "Verify Mobile to Continue" : "Create Account"}
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