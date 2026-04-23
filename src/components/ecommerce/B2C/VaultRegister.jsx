import React, { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  User, Mail, Phone, Lock, Building2, Briefcase, Users,
  ChevronLeft, ChevronRight, Check, ArrowRight,
  Edit, ShieldCheck, Award, TrendingUp, Home, DollarSign, FileCheck
} from "lucide-react";
import {
  Form, Input, Select, Button, Checkbox, message, Spin,
  Space, Typography, Tag, Radio, Divider, Card, Row, Col
} from "antd";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

import { Country } from 'country-state-city';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

const { Option } = Select;
const { Title, Text } = Typography;

const maritalStatusOptions = [
  { value: "Single", label: "Single" },
  { value: "Married", label: "Married" },
  { value: "Divorced", label: "Divorced" },
  { value: "Widowed", label: "Widowed" },
];

const genderOptions = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

const nationalityOptions = [
  { value: "AE", label: "UAE National" },
  { value: "IN", label: "Indian" },
  { value: "PK", label: "Pakistani" },
  { value: "US", label: "American" },
  { value: "GB", label: "British" },
  { value: "SA", label: "Saudi" },
  { value: "EG", label: "Egyptian" },
  { value: "JO", label: "Jordanian" },
  { value: "LB", label: "Lebanese" },
  { value: "SY", label: "Syrian" },
  { value: "IQ", label: "Iraqi" },
  { value: "YE", label: "Yemeni" },
  { value: "OM", label: "Omani" },
  { value: "QA", label: "Qatari" },
  { value: "KW", label: "Kuwaiti" },
  { value: "BH", label: "Bahraini" },
];

const dependentsCountOptions = Array.from({ length: 11 }, (_, i) => ({
  value: i,
  label: i === 0 ? "None" : i === 1 ? "1 Dependent" : `${i} Dependents`,
}));

const dependentRelationshipOptions = ["Son", "Daughter", "Spouse", "Other"];
const dependentLocationOptions = ["In UAE", "Outside UAE"];

const VaultRegister = () => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState({
    partners: true,
    submitting: false,
    otpSending: false,
    otpVerifying: false,
    emailOtpSending: false,
    emailOtpVerifying: false,
  });
  const [success, setSuccess] = useState(false);

  const [partners, setPartners] = useState([]);
  const [selectedAgentMode, setSelectedAgentMode] = useState("freelance");

  const [countryCode, setCountryCode] = useState("971");
  const [mobileNumber, setMobileNumber] = useState("");
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpValue, setOtpValue] = useState("");

  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showEmailOtpInput, setShowEmailOtpInput] = useState(false);
  const [emailOtpValue, setEmailOtpValue] = useState("");

  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    watch,
    register,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      agentMode: "freelance",
      maritalStatus: null,
      numberOfDependents: 0,
      dependents: [],
      nationality: null,
      dateOfBirth: "",
      gender: null,
    },
  });

  const watchEmail = watch("email");
  const watchAgentMode = watch("agentMode");
  const watchDependentsCount = watch("numberOfDependents");

  useEffect(() => {
    setSelectedAgentMode(watchAgentMode || "freelance");
  }, [watchAgentMode]);

  const countryOptions = useMemo(() => {
    const priorityIsoCodes = ["AE", "IN", "SA", "US", "GB"];
    return Country.getAllCountries()
      .map((country) => ({
        name: country.name,
        code: country.phonecode,
        iso: country.isoCode,
      }))
      .sort((a, b) => {
        const aPriority = priorityIsoCodes.includes(a.iso);
        const bPriority = priorityIsoCodes.includes(b.iso);
        if (aPriority && !bPriority) return -1;
        if (!aPriority && bPriority) return 1;
        return a.name.localeCompare(b.name);
      });
  }, []);

  useEffect(() => {
    register("mobile_number", {
      required: "Mobile number is required",
      validate: (value) => {
        if (!value) return "Mobile number is required";
        const fullNum = `+${countryCode}${value}`;
        const phoneNumber = parsePhoneNumberFromString(fullNum);
        if (phoneNumber && phoneNumber.isValid()) return true;
        return `Invalid mobile number format for +${countryCode}`;
      },
    });
  }, [register, countryCode]);

  useEffect(() => {
    const fetchPartners = async () => {
      setLoading((prev) => ({ ...prev, partners: true }));
      try {
        const response = await apiService.get("/vault/partner/dropdown");
        if (response.success && response.data) {
          setPartners(response.data);
        } else if (response.data && Array.isArray(response.data)) {
          setPartners(response.data);
        } else {
          setPartners([]);
        }
      } catch (error) {
        setPartners([]);
      } finally {
        setLoading((prev) => ({ ...prev, partners: false }));
      }
    };
    fetchPartners();
  }, []);

  const handleSendEmailOtp = async () => {
    const isEmailValid = await trigger("email");
    if (!isEmailValid) return;
    setLoading((prev) => ({ ...prev, emailOtpSending: true }));
    try {
      await apiService.post("https://xoto.ae/api/otp/email-otp/send", { email: watchEmail });
      message.success("OTP sent! Please check your email inbox.");
      setShowEmailOtpInput(true);
    } catch (error) {
      message.error("Failed to send Email OTP");
    } finally {
      setLoading((prev) => ({ ...prev, emailOtpSending: false }));
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!emailOtpValue || emailOtpValue.length < 4) return message.error("Please enter a valid OTP");
    setLoading((prev) => ({ ...prev, emailOtpVerifying: true }));
    try {
      await apiService.post("https://xoto.ae/api/otp/email-otp/verify", { email: watchEmail, otp: emailOtpValue });
      message.success("Email verified successfully!");
      setIsEmailVerified(true);
      setShowEmailOtpInput(false);
      clearErrors("email");
    } catch (error) {
      message.error("Invalid OTP. Please try again.");
    } finally {
      setLoading((prev) => ({ ...prev, emailOtpVerifying: false }));
    }
  };

  const handleSendOtp = async () => {
    const isMobileValid = await trigger("mobile_number");
    if (!isMobileValid) return;
    setLoading((prev) => ({ ...prev, otpSending: true }));
    try {
      await apiService.post("/otp/send-otp", {
        country_code: `+${countryCode}`,
        phone_number: mobileNumber,
      });
      message.success(`OTP sent to +${countryCode}${mobileNumber}`);
      setShowOtpInput(true);
    } catch (error) {
      message.error("Failed to send OTP");
    } finally {
      setLoading((prev) => ({ ...prev, otpSending: false }));
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpValue || otpValue.length < 4) return message.error("Please enter a valid OTP");
    setLoading((prev) => ({ ...prev, otpVerifying: true }));
    try {
      await apiService.post("/otp/verify-otp", {
        country_code: `+${countryCode}`,
        phone_number: mobileNumber,
        otp: otpValue,
      });
      message.success("Mobile number verified successfully!");
      setIsMobileVerified(true);
      setShowOtpInput(false);
      clearErrors("mobile_number");
    } catch (error) {
      message.error("Invalid OTP. Please try again.");
    } finally {
      setLoading((prev) => ({ ...prev, otpVerifying: false }));
    }
  };

  const handleChangeNumber = () => {
    setIsMobileVerified(false);
    setShowOtpInput(false);
    setOtpValue("");
  };

  const handleChangeEmail = () => {
    setIsEmailVerified(false);
    setShowEmailOtpInput(false);
    setEmailOtpValue("");
  };

  const next = async () => {
    let isValid = true;
    if (step === 0) {
      const fields = ["first_name", "last_name", "email", "password", "confirmPassword", "mobile_number", "agentMode"];
      if (selectedAgentMode === "partner") fields.push("partnerId");
      const formValid = await trigger(fields);
      if (!isMobileVerified) { setError("mobile_number", { type: "manual", message: "Please verify mobile number" }); isValid = false; }
      if (!isEmailVerified) { setError("email", { type: "manual", message: "Please verify your email" }); isValid = false; }
      if (!formValid) isValid = false;
    } else if (step === 1) {
      const fields = ["maritalStatus", "numberOfDependents", "nationality", "dateOfBirth", "gender"];
      if (watchDependentsCount > 0) {
        for (let i = 0; i < watchDependentsCount; i++) {
          fields.push(`dependents.${i}.age`);
          fields.push(`dependents.${i}.location`);
        }
      }
      const formValid = await trigger(fields);
      if (!formValid) isValid = false;
    }
    if (isValid) setStep((s) => s + 1);
  };

  const back = () => setStep((s) => s - 1);

  const onSubmit = async (data) => {
    if (!isEmailVerified || !isMobileVerified)
      return message.error("Please verify your email and mobile number");
    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", { type: "manual", message: "Passwords do not match" });
      return;
    }
    setLoading((prev) => ({ ...prev, submitting: true }));
    const cleanedDependents = data.dependents
      ? data.dependents.slice(0, data.numberOfDependents || 0)
      : [];
    const payload = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone_number: mobileNumber.replace(/\D/g, ""),
      country_code: `+${countryCode}`,
      password: data.password,
      agentMode: data.agentMode,
      partnerId: data.agentMode === "partner" ? data.partnerId : undefined,
      maritalStatus: data.maritalStatus || null,
      numberOfDependents: data.numberOfDependents || 0,
      dependents: cleanedDependents,
      nationality: data.nationality || null,
      dateOfBirth: data.dateOfBirth || null,
      gender: data.gender || null,
    };
    try {
      await apiService.post("/vault/agent/signup", payload);
      setSuccess(true);
      message.success("Registration successful!");
    } catch (err) {
      message.error(err.response?.data?.message || "Registration failed. Check validation rules.");
    } finally {
      setLoading((prev) => ({ ...prev, submitting: false }));
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-200">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-3 text-gray-800">Registration Successful!</h1>
          <p className="text-gray-600 mb-6">
            {selectedAgentMode === "partner"
              ? "Your registration is complete. Awaiting admin approval for partner affiliation."
              : "Freelance agent registered successfully. Awaiting admin verification."}
          </p>
          <a href="/login" className="inline-flex items-center gap-2 bg-[#5C039B] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#4a027d] transition-all shadow-md">
            Go to Login <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">

      {/* ✅ Global CSS for Radio buttons and Send OTP */}
      <style>{`
        .agent-type-radio .ant-radio-button-wrapper {
          background: #fff;
          color: #5C039B;
          border-color: #5C039B;
        }
        .agent-type-radio .ant-radio-button-wrapper:hover {
          color: #5C039B;
          border-color: #5C039B;
        }
        .agent-type-radio .ant-radio-button-wrapper-checked {
          background: #5C039B !important;
          color: #fff !important;
          border-color: #5C039B !important;
        }
        .agent-type-radio .ant-radio-button-wrapper-checked::before {
          background: #5C039B !important;
        }
        .send-otp-btn {
          background-color: #5C039B !important;
          border-color: #5C039B !important;
          color: #fff !important;
        }
        .send-otp-btn:hover {
          background-color: #4a027d !important;
          border-color: #4a027d !important;
          color: #fff !important;
        }
        .send-otp-btn:disabled {
          opacity: 0.5;
        }
      `}</style>

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl h-full max-h-[900px] flex border border-gray-200 overflow-hidden">

        {/* LEFT SIDEBAR */}
        <div className="w-1/4 bg-gradient-to-br from-[#5C039B] to-[#3a0266] text-white p-5 flex flex-col">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-white/20 p-2 rounded-lg">
                <Home className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-wider">VAULT</h2>
                <p className="text-purple-200 text-xs">Mortgage Partners</p>
              </div>
            </div>
            <Divider className="bg-white/20 my-3" />
          </div>

          <div className="space-y-4 flex-1">
            <div className="bg-white/10 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-yellow-300" />
                <h3 className="font-semibold text-sm">Earn Commission</h3>
              </div>
              <p className="text-purple-200 text-xs">Competitive commission structure</p>
            </div>
            <div className="bg-white/10 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-300" />
                <h3 className="font-semibold text-sm">Lead Generation</h3>
              </div>
              <p className="text-purple-200 text-xs">Access to quality mortgage leads</p>
            </div>
            <div className="bg-white/10 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <FileCheck className="w-4 h-4 text-blue-300" />
                <h3 className="font-semibold text-sm">Fast Approval</h3>
              </div>
              <p className="text-purple-200 text-xs">Quick verification process</p>
            </div>
            <div className="bg-white/10 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-purple-300" />
                <h3 className="font-semibold text-sm">Top Performer</h3>
              </div>
              <p className="text-purple-200 text-xs">Recognition and bonus</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/20">
            <div className="flex items-center gap-1 text-purple-200 text-xs">
              <ShieldCheck className="w-3 h-3" />
              <span>Secure & Verified Platform</span>
            </div>
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className="w-3/4 p-6 flex flex-col h-full bg-white">
          <div className="flex-none">
            <Title level={3} className="!mb-0 text-gray-800">Agent Registration</Title>
            <Text type="secondary" className="block mb-4 text-sm">Join Vault as a mortgage agent or partner</Text>

            {/* Step Indicator */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-[#5C039B] font-medium">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 0 ? "bg-[#5C039B] text-white" : "bg-gray-200 text-gray-600"}`}>1</span>
                <span className={`w-10 h-0.5 ${step >= 1 ? "bg-[#5C039B]" : "bg-gray-200"}`}></span>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? "bg-[#5C039B] text-white" : "bg-gray-200 text-gray-600"}`}>2</span>
                <span className={`w-10 h-0.5 ${step >= 2 ? "bg-[#5C039B]" : "bg-gray-200"}`}></span>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? "bg-[#5C039B] text-white" : "bg-gray-200 text-gray-600"}`}>3</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1 px-0.5">
                <span>Account</span>
                <span>Profile</span>
                <span>Review</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-1" style={{ maxHeight: "calc(100% - 130px)" }}>
            <Form layout="vertical" size="middle" onSubmitCapture={handleSubmit(onSubmit)} className="space-y-3">

              {/* ── STEP 0 ── */}
              {step === 0 && (
                <div className="animate-fade-in space-y-2">

                  {/* ✅ Agent Type Radio — fixed styles */}
                  <Form.Item label={<span className="font-medium text-sm">Agent Type</span>} required className="mb-2">
                    <Controller
                      name="agentMode"
                      control={control}
                      rules={{ required: "Please select agent type" }}
                      render={({ field }) => (
                        <Radio.Group {...field} buttonStyle="solid" className="w-full agent-type-radio">
                          <Radio.Button value="freelance" className="w-1/2 text-center h-9 flex items-center justify-center text-sm">
                            <Briefcase className="inline mr-1 w-3.5 h-3.5" /> Freelance
                          </Radio.Button>
                          <Radio.Button value="partner" className="w-1/2 text-center h-9 flex items-center justify-center text-sm">
                            <Building2 className="inline mr-1 w-3.5 h-3.5" /> Partner
                          </Radio.Button>
                        </Radio.Group>
                      )}
                    />
                    {errors.agentMode && <div className="text-red-500 text-xs mt-0.5">{errors.agentMode.message}</div>}
                  </Form.Item>

                  {selectedAgentMode === "partner" && (
                    <Form.Item label={<span className="font-medium text-sm">Select Partner</span>} required validateStatus={errors.partnerId ? "error" : ""} help={errors.partnerId?.message} className="mb-2">
                      <Controller
                        name="partnerId"
                        control={control}
                        rules={{ required: "Please select a partner company" }}
                        render={({ field }) => (
                          <Select {...field} placeholder="Choose partner" loading={loading.partners} showSearch className="w-full">
                            {partners.map((partner) => (
                              <Option key={partner._id} value={partner._id}>{partner.companyName}</Option>
                            ))}
                          </Select>
                        )}
                      />
                    </Form.Item>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item label={<span className="font-medium text-sm">First Name</span>} required validateStatus={errors.first_name ? "error" : ""} help={errors.first_name?.message} className="mb-0">
                      <Controller name="first_name" control={control} rules={{ required: "Required" }} render={({ field }) => <Input prefix={<User className="text-gray-400 w-4 h-4" />} {...field} />} />
                    </Form.Item>
                    <Form.Item label={<span className="font-medium text-sm">Last Name</span>} required validateStatus={errors.last_name ? "error" : ""} help={errors.last_name?.message} className="mb-0">
                      <Controller name="last_name" control={control} rules={{ required: "Required" }} render={({ field }) => <Input prefix={<User className="text-gray-400 w-4 h-4" />} {...field} />} />
                    </Form.Item>
                  </div>

                  {/* Email */}
                  <Form.Item
                    label={<Space><span className="font-medium text-sm">Email</span>{isEmailVerified && <Tag color="success" className="text-xs px-1 py-0">Verified</Tag>}</Space>}
                    required
                    validateStatus={errors.email ? "error" : ""}
                    help={errors.email?.message}
                    className="mb-2"
                  >
                    <Space.Compact style={{ width: "100%" }}>
                      <Controller
                        name="email"
                        control={control}
                        rules={{ required: "Required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email" } }}
                        render={({ field }) => (
                          <Input {...field} prefix={<Mail className="text-gray-400 w-4 h-4" />} style={{ width: "70%" }} disabled={showEmailOtpInput || isEmailVerified} />
                        )}
                      />
                      {!isEmailVerified && !showEmailOtpInput && (
                        <Button type="primary" onClick={handleSendEmailOtp} disabled={!watchEmail} loading={loading.emailOtpSending} style={{ width: "30%", backgroundColor: "#5C039B", borderColor: "#5C039B", color: "#fff" }}>
                          Send OTP
                        </Button>
                      )}
                      {(showEmailOtpInput || isEmailVerified) && (
                        <Button icon={<Edit size={14} />} onClick={handleChangeEmail} style={{ width: "30%" }}>Change</Button>
                      )}
                    </Space.Compact>
                    {showEmailOtpInput && (
                      <div className="mt-2 p-3 bg-gray-50 border border-purple-100 rounded-lg">
                        <Text type="secondary" className="block mb-2 text-xs">Code sent to <strong>{watchEmail}</strong></Text>
                        <div className="flex gap-2">
                          <Input placeholder="OTP" maxLength={6} value={emailOtpValue} onChange={(e) => setEmailOtpValue(e.target.value)} style={{ width: "60%" }} />
                          <Button type="primary" onClick={handleVerifyEmailOtp} loading={loading.emailOtpVerifying} style={{ backgroundColor: "#5C039B", borderColor: "#5C039B", color: "#fff" }}>Verify</Button>
                        </div>
                      </div>
                    )}
                  </Form.Item>

                  {/* ✅ Mobile — Send OTP white text fix */}
                  <Form.Item
                    label={<Space><span className="font-medium text-sm">Mobile</span>{isMobileVerified && <Tag color="success" className="text-xs px-1 py-0">Verified</Tag>}</Space>}
                    required
                    validateStatus={errors.mobile_number ? "error" : ""}
                    help={errors.mobile_number?.message}
                    className="mb-2"
                  >
                    <Space.Compact style={{ width: "100%" }}>
                      <Select
                        showSearch
                        value={countryCode}
                        onChange={(val) => { setCountryCode(val); trigger("mobile_number"); }}
                        style={{ width: "25%" }}
                        disabled={showOtpInput || isMobileVerified}
                      >
                        {countryOptions.map((item) => (
                          <Option key={item.iso} value={item.code}>+{item.code} {item.iso}</Option>
                        ))}
                      </Select>
                      <Input
                        prefix={<Phone className="text-gray-400 w-4 h-4" />}
                        value={mobileNumber}
                        style={{ width: "45%" }}
                        disabled={showOtpInput || isMobileVerified}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setMobileNumber(val);
                          setValue("mobile_number", val, { shouldValidate: true });
                          trigger("mobile_number");
                        }}
                      />
                      {/* ✅ Send OTP — white text */}
                      {!isMobileVerified && !showOtpInput && (
                        <Button
                          className="send-otp-btn"
                          onClick={handleSendOtp}
                          disabled={!mobileNumber || !!errors.mobile_number}
                          loading={loading.otpSending}
                          style={{ width: "30%", backgroundColor: "#5C039B", borderColor: "#5C039B", color: "#fff" }}
                        >
                          Send OTP
                        </Button>
                      )}
                      {(showOtpInput || isMobileVerified) && (
                        <Button icon={<Edit size={14} />} onClick={handleChangeNumber} style={{ width: "30%" }}>Change</Button>
                      )}
                    </Space.Compact>
                    {showOtpInput && (
                      <div className="mt-2 p-3 bg-gray-50 border border-purple-100 rounded-lg">
                        <Text type="secondary" className="block mb-2 text-xs">Code sent to <strong>+{countryCode} {mobileNumber}</strong></Text>
                        <div className="flex gap-2">
                          <Input placeholder="OTP" maxLength={6} value={otpValue} onChange={(e) => setOtpValue(e.target.value)} style={{ width: "60%" }} />
                          <Button type="primary" onClick={handleVerifyOtp} loading={loading.otpVerifying} style={{ backgroundColor: "#5C039B", borderColor: "#5C039B", color: "#fff" }}>Verify</Button>
                        </div>
                      </div>
                    )}
                  </Form.Item>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item label={<span className="font-medium text-sm">Password</span>} required validateStatus={errors.password ? "error" : ""} help={errors.password?.message} className="mb-0">
                      <Controller name="password" control={control} rules={{ required: "Required", minLength: { value: 6, message: "Min 6 chars" } }} render={({ field }) => <Input.Password prefix={<Lock className="text-gray-400 w-4 h-4" />} {...field} />} />
                    </Form.Item>
                    <Form.Item label={<span className="font-medium text-sm">Confirm</span>} required validateStatus={errors.confirmPassword ? "error" : ""} help={errors.confirmPassword?.message} className="mb-0">
                      <Controller name="confirmPassword" control={control} rules={{ required: "Required" }} render={({ field }) => <Input.Password prefix={<Lock className="text-gray-400 w-4 h-4" />} {...field} />} />
                    </Form.Item>
                  </div>

                  <div className="text-right pt-2">
                    <Button type="primary" onClick={next} style={{ backgroundColor: "#5C039B", borderColor: "#5C039B", color: "#fff" }} disabled={!isMobileVerified || !isEmailVerified}>
                      Next <ChevronRight className="inline w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* ── STEP 1 ── */}
              {step === 1 && (
                <div className="animate-fade-in space-y-2">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label={<span className="font-medium text-sm">Marital Status</span>} className="mb-2">
                        <Controller name="maritalStatus" control={control} render={({ field }) => (
                          <Select placeholder="Select" {...field} allowClear>
                            {maritalStatusOptions.map((o) => <Option key={o.value} value={o.value}>{o.label}</Option>)}
                          </Select>
                        )} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label={<span className="font-medium text-sm">Dependents</span>} className="mb-2">
                        <Controller name="numberOfDependents" control={control} render={({ field }) => (
                          <Select placeholder="Count" {...field} allowClear>
                            {dependentsCountOptions.map((o) => <Option key={o.value} value={o.value}>{o.label}</Option>)}
                          </Select>
                        )} />
                      </Form.Item>
                    </Col>
                  </Row>

                  {watchDependentsCount > 0 && (
                    <div className="mb-2 bg-slate-50 p-3 rounded-lg border border-slate-200 max-h-56 overflow-y-auto">
                      <Title level={5} className="!mb-2 text-sm flex items-center gap-1">
                        <Users className="w-4 h-4 text-[#5C039B]" /> Dependents
                      </Title>
                      {Array.from({ length: watchDependentsCount }).map((_, index) => (
                        <Card key={index} size="small" className="mb-2 border-slate-200" title={<span className="text-xs">Dependent {index + 1}</span>}>
                          <Row gutter={8}>
                            <Col span={6}>
                              <Form.Item label="Name" className="mb-0">
                                <Controller name={`dependents.${index}.name`} control={control} render={({ field }) => <Input {...field} placeholder="Name" size="small" />} />
                              </Form.Item>
                            </Col>
                            <Col span={3}>
                              <Form.Item label="Age" required className="mb-0">
                                <Controller name={`dependents.${index}.age`} rules={{ required: true }} control={control} render={({ field }) => <Input type="number" {...field} placeholder="Age" size="small" />} />
                              </Form.Item>
                            </Col>
                            <Col span={7}>
                              <Form.Item label="Rel." className="mb-0">
                                <Controller name={`dependents.${index}.relationship`} control={control} render={({ field }) => (
                                  <Select {...field} placeholder="Rel" size="small" allowClear>
                                    {dependentRelationshipOptions.map((opt) => <Option key={opt} value={opt}>{opt}</Option>)}
                                  </Select>
                                )} />
                              </Form.Item>
                            </Col>
                            <Col span={8}>
                              <Form.Item label="Location" required className="mb-0">
                                <Controller name={`dependents.${index}.location`} rules={{ required: true }} control={control} render={({ field }) => (
                                  <Select {...field} placeholder="Loc" size="small" allowClear>
                                    {dependentLocationOptions.map((opt) => <Option key={opt} value={opt}>{opt}</Option>)}
                                  </Select>
                                )} />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Card>
                      ))}
                    </div>
                  )}

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label={<span className="font-medium text-sm">Nationality</span>} className="mb-2">
                        <Controller name="nationality" control={control} render={({ field }) => (
                          <Select placeholder="Select" showSearch optionFilterProp="label" {...field} allowClear>
                            {nationalityOptions.map((o) => <Option key={o.value} value={o.value} label={o.label}>{o.label}</Option>)}
                          </Select>
                        )} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label={<span className="font-medium text-sm">Date of Birth</span>} className="mb-2">
                        <Controller name="dateOfBirth" control={control} render={({ field }) => <Input type="date" {...field} />} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item label={<span className="font-medium text-sm">Gender</span>} className="mb-2">
                    <Controller name="gender" control={control} render={({ field }) => (
                      <Radio.Group {...field}>
                        {genderOptions.map((o) => <Radio key={o.value} value={o.value}>{o.label}</Radio>)}
                      </Radio.Group>
                    )} />
                  </Form.Item>

                  <div className="flex justify-between pt-2">
                    <Button onClick={back}><ChevronLeft className="w-4 h-4" /> Back</Button>
                    <Button type="primary" onClick={next} style={{ backgroundColor: "#5C039B", borderColor: "#5C039B", color: "#fff" }}>
                      Next <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* ── STEP 2 ── */}
              {step === 2 && (
                <Spin spinning={loading.submitting}>
                  <Card className="bg-gray-50 border-purple-100 mb-4" bodyStyle={{ padding: "16px" }}>
                    <Title level={5} className="!text-[#5C039B] !mb-3">Review Information</Title>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <div><Text strong>Agent:</Text> <Text>{selectedAgentMode === "freelance" ? "Freelance" : "Partner"}</Text></div>
                      {selectedAgentMode === "partner" && (
                        <div><Text strong>Company:</Text> <Text className="truncate">{partners.find((p) => p._id === watch("partnerId"))?.companyName || "Selected"}</Text></div>
                      )}
                      <div><Text strong>Name:</Text> <Text>{watch("first_name")} {watch("last_name")}</Text></div>
                      <div><Text strong>Email:</Text> <Text className="truncate">{watch("email")}</Text></div>
                      <div><Text strong>Mobile:</Text> <Text>+{countryCode} {mobileNumber}</Text></div>
                      <div><Text strong>Verified:</Text> <Tag color="green" className="text-xs">Yes</Tag></div>
                      <div><Text strong>Marital:</Text> <Text>{watch("maritalStatus") || "-"}</Text></div>
                      <div><Text strong>Dependents:</Text> <Text>{watch("numberOfDependents") || 0}</Text></div>
                      <div><Text strong>Nationality:</Text> <Text>{nationalityOptions.find((o) => o.value === watch("nationality"))?.label || "-"}</Text></div>
                      <div><Text strong>DOB:</Text> <Text>{watch("dateOfBirth") || "-"}</Text></div>
                      <div><Text strong>Gender:</Text> <Text>{watch("gender") || "-"}</Text></div>
                    </div>
                  </Card>

                  <Form.Item className="mb-2">
                    <Controller
                      name="agreed_to_terms"
                      control={control}
                      rules={{ required: "You must agree" }}
                      render={({ field }) => (
                        <Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)}>
                          <span className="text-sm">I agree to <a href="#" className="text-[#5C039B]">Terms</a> and <a href="#" className="text-[#5C039B]">Privacy</a></span>
                        </Checkbox>
                      )}
                    />
                    {errors.agreed_to_terms && <div className="text-red-500 text-xs">{errors.agreed_to_terms.message}</div>}
                  </Form.Item>

                  <div className="flex justify-between pt-2">
                    <Button onClick={back}><ChevronLeft className="w-4 h-4" /> Back</Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading.submitting}
                      style={{ backgroundColor: "#5C039B", borderColor: "#5C039B", color: "#fff" }}
                      disabled={!isEmailVerified || !isMobileVerified}
                    >
                      Complete <Check className="ml-1 w-4 h-4" />
                    </Button>
                  </div>
                </Spin>
              )}
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaultRegister;