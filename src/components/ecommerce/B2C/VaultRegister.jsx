import React, { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  User, Mail, Phone, Lock, Building2, Briefcase, Users,
  Plus, Trash2, ChevronLeft, ChevronRight, Check, ArrowRight,
  Edit, ShieldCheck, Award, TrendingUp, Home, DollarSign, FileCheck
} from "lucide-react";
import {
  Form, Input, Select, Button, Checkbox, message, Spin,
  Space, Typography, Tag, Radio, Divider, Card, Row, Col
} from "antd";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

// --- Libraries ---
import { Country } from 'country-state-city';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

const { Option } = Select;
const { Title, Text } = Typography;

// --- FIXED Options (Title Case to match Mongoose Enums) ---
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

const dependentsCountOptions = Array.from({ length: 11 }, (_, i) => ({ value: i, label: i === 0 ? "None" : i === 1 ? "1 Dependent" : `${i} Dependents` }));

const dependentRelationshipOptions = ["Son", "Daughter", "Spouse", "Other"];
const dependentLocationOptions = ["In UAE", "Outside UAE"];

// --- Main Component ---
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

  // --- Partner Data ---
  const [partners, setPartners] = useState([]);
  const [selectedAgentMode, setSelectedAgentMode] = useState("freelance");

  // --- Mobile Verification State ---
  const [countryCode, setCountryCode] = useState("971");
  const [mobileNumber, setMobileNumber] = useState("");
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpValue, setOtpValue] = useState("");

  // --- Email Verification State ---
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showEmailOtpInput, setShowEmailOtpInput] = useState(false);
  const [emailOtpValue, setEmailOtpValue] = useState("");

  // --- React Hook Form ---
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
    }
  });

  const watchEmail = watch("email");
  const watchAgentMode = watch("agentMode");
  const watchDependentsCount = watch("numberOfDependents");

  // Sync local state with form watch
  useEffect(() => {
    setSelectedAgentMode(watchAgentMode || "freelance");
  }, [watchAgentMode]);

  // --- Country Options with Flags ---
  const countryOptions = useMemo(() => {
    const priorityIsoCodes = ["AE", "IN", "SA", "US", "GB"];
    return Country.getAllCountries().map((country) => ({
      name: country.name, code: country.phonecode, iso: country.isoCode,
    })).sort((a, b) => {
      const aPriority = priorityIsoCodes.includes(a.iso);
      const bPriority = priorityIsoCodes.includes(b.iso);
      if (aPriority && !bPriority) return -1;
      if (!aPriority && bPriority) return 1;
      return a.name.localeCompare(b.name);
    });
  }, []);

  // --- Mobile Number Validation ---
  useEffect(() => {
    register("mobile_number", {
      required: "Mobile number is required",
      validate: (value) => {
        if (!value) return "Mobile number is required";
        const fullNum = `+${countryCode}${value}`;
        const phoneNumber = parsePhoneNumberFromString(fullNum);
        if (phoneNumber && phoneNumber.isValid()) {
          return true;
        }
        return `Invalid mobile number format for +${countryCode}`;
      }
    });
  }, [register, countryCode]);

  // --- Fetch Partners on Mount ---
  useEffect(() => {
    const fetchPartners = async () => {
      setLoading(prev => ({ ...prev, partners: true }));
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
        setLoading(prev => ({ ...prev, partners: false }));
      }
    };
    fetchPartners();
  }, []);

  // --- Email OTP Handlers ---
  const handleSendEmailOtp = async () => {
    const isEmailValid = await trigger("email");
    if (!isEmailValid) return;

    setLoading(prev => ({ ...prev, emailOtpSending: true }));
    try {
      await apiService.post("https://xoto.ae/api/otp/email-otp/send", { email: watchEmail });
      message.success("OTP sent! Please check your email inbox.");
      setShowEmailOtpInput(true);
    } catch (error) {
      message.error("Failed to send Email OTP");
    } finally {
      setLoading(prev => ({ ...prev, emailOtpSending: false }));
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!emailOtpValue || emailOtpValue.length < 4) return message.error("Please enter a valid OTP");
    setLoading(prev => ({ ...prev, emailOtpVerifying: true }));
    try {
      await apiService.post("https://xoto.ae/api/otp/email-otp/verify", { email: watchEmail, otp: emailOtpValue });
      message.success("Email verified successfully!");
      setIsEmailVerified(true);
      setShowEmailOtpInput(false);
      clearErrors("email");
    } catch (error) {
      message.error("Invalid OTP. Please try again.");
    } finally {
      setLoading(prev => ({ ...prev, emailOtpVerifying: false }));
    }
  };

  // --- Mobile OTP Handlers ---
  const handleSendOtp = async () => {
    const isMobileValid = await trigger("mobile_number");
    if (!isMobileValid) return;
    setLoading(prev => ({ ...prev, otpSending: true }));
    try {
      await apiService.post("/otp/send-otp", { country_code: `+${countryCode}`, phone_number: mobileNumber });
      message.success(`OTP sent to +${countryCode}${mobileNumber}`);
      setShowOtpInput(true);
    } catch (error) {
      message.error("Failed to send OTP");
    } finally {
      setLoading(prev => ({ ...prev, otpSending: false }));
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpValue || otpValue.length < 4) return message.error("Please enter a valid OTP");
    setLoading(prev => ({ ...prev, otpVerifying: true }));
    try {
      await apiService.post("/otp/verify-otp", { country_code: `+${countryCode}`, phone_number: mobileNumber, otp: otpValue });
      message.success("Mobile number verified successfully!");
      setIsMobileVerified(true);
      setShowOtpInput(false);
      clearErrors("mobile_number");
    } catch (error) {
      message.error("Invalid OTP. Please try again.");
    } finally {
      setLoading(prev => ({ ...prev, otpVerifying: false }));
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

  // --- Navigation ---
  const next = async () => {
    let isValid = true;
    if (step === 0) {
      const fields = ["first_name", "last_name", "email", "password", "confirmPassword", "mobile_number", "agentMode"];
      if (selectedAgentMode === "partner") fields.push("partnerId");
      const formValid = await trigger(fields);

      if (!isMobileVerified) { setError("mobile_number", { type: "manual", message: "Please verify mobile number" }); isValid = false; }
      if (!isEmailVerified) { setError("email", { type: "manual", message: "Please verify your email" }); isValid = false; }
      if (!formValid) isValid = false;
    }
    else if (step === 1) {
      const fields = ["maritalStatus", "numberOfDependents", "nationality", "dateOfBirth", "gender"];
      
      // Also validate dynamic dependent arrays if there are any
      if (watchDependentsCount > 0) {
          for (let i = 0; i < watchDependentsCount; i++) {
              fields.push(`dependents.${i}.age`);
              fields.push(`dependents.${i}.location`);
          }
      }

      const formValid = await trigger(fields);
      if (!formValid) isValid = false;
    }

    if (isValid) setStep(s => s + 1);
  };

  const back = () => setStep(s => s - 1);

  // --- Submit Handler ---
  const onSubmit = async (data) => {
    if (!isEmailVerified || !isMobileVerified) return message.error("Please verify your email and mobile number");
    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", { type: "manual", message: "Passwords do not match" });
      return;
    }

    setLoading(prev => ({ ...prev, submitting: true }));

    // Clean up dependents array before sending (remove any extras if count was reduced)
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
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  // --- Success Screen ---
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Registration Successful!</h1>
          <p className="text-gray-600 mb-8">
            {selectedAgentMode === 'partner'
              ? "Your registration is complete. Awaiting admin approval for partner affiliation."
              : "Freelance agent registered successfully. Awaiting admin verification."}
          </p>
          <a href="/login" className="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700 transition">
            Go to Login <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    );
  }

  // --- Main Form ---
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden border border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-4">

          {/* LEFT SIDEBAR - VAULT MORTGAGE THEME */}
          <div className="bg-[#5B0E98] text-white p-8 flex flex-col">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-white/20 p-3 rounded-xl shadow-inner">
                  <Home className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-wider">VAULT</h2>
                  <p className="text-indigo-200 text-sm">Mortgage Partners</p>
                </div>
              </div>
              <Divider className="bg-white/20 my-4" />
            </div>

            <div className="space-y-8 flex-1">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-6 h-6 text-yellow-300" />
                  <h3 className="font-semibold text-lg">Earn Commission</h3>
                </div>
                <p className="text-indigo-200 text-sm">Competitive commission structure for every successful deal</p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-6 h-6 text-green-300" />
                  <h3 className="font-semibold text-lg">Lead Generation</h3>
                </div>
                <p className="text-indigo-200 text-sm">Access to quality mortgage leads and exclusive opportunities</p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <FileCheck className="w-6 h-6 text-blue-300" />
                  <h3 className="font-semibold text-lg">Fast Approval</h3>
                </div>
                <p className="text-indigo-200 text-sm">Quick verification and onboarding process</p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Award className="w-6 h-6 text-purple-300" />
                  <h3 className="font-semibold text-lg">Top Performer</h3>
                </div>
                <p className="text-indigo-200 text-sm">Recognition and bonus for top-performing agents</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/20">
              <div className="flex items-center gap-2 text-indigo-200 text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>Secure & Verified Platform</span>
              </div>
            </div>
          </div>

          {/* RIGHT FORM CONTENT */}
          <div className="lg:col-span-3 p-10 max-h-[90vh] overflow-y-auto bg-white">
            <Title level={2} className="text-gray-800 mb-2">Agent Registration</Title>
            <Text type="secondary" className="block mb-6">Join Vault as a mortgage agent or partner</Text>

            <div className="mb-8">
              <div className="flex items-center gap-2 text-purple-600 font-medium">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 0 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}>1</span>
                <span className={`w-16 h-0.5 ${step >= 1 ? 'bg-purple-600' : 'bg-gray-200'}`}></span>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}>2</span>
                <span className={`w-16 h-0.5 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-200'}`}></span>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}>3</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>Account Info</span>
                <span className="ml-8">Profile Details</span>
                <span className="ml-8">Review</span>
              </div>
            </div>

            <Form layout="vertical" onSubmitCapture={handleSubmit(onSubmit)}>

              {/* STEP 0: BASIC INFO & AGENT TYPE */}
              {step === 0 && (
                <div className="animate-fade-in">
                  <Form.Item label="Agent Type" required>
                    <Controller
                      name="agentMode" control={control} rules={{ required: "Please select agent type" }}
                      render={({ field }) => (
                        <Radio.Group {...field} buttonStyle="solid" size="large" className="w-full">
                          <Radio.Button value="freelance" className="w-1/2 text-center">
                            <Briefcase className="inline mr-2 w-4 h-4" /> Freelance Agent
                          </Radio.Button>
                          <Radio.Button value="partner" className="w-1/2 text-center">
                            <Building2 className="inline mr-2 w-4 h-4" /> Partner Affiliated
                          </Radio.Button>
                        </Radio.Group>
                      )}
                    />
                    {errors.agentMode && <div className="text-red-500 text-sm mt-1">{errors.agentMode.message}</div>}
                  </Form.Item>

                  {selectedAgentMode === "partner" && (
                    <Form.Item label="Select Partner Company" required validateStatus={errors.partnerId ? "error" : ""} help={errors.partnerId?.message}>
                      <Controller
                        name="partnerId" control={control} rules={{ required: "Please select a partner company" }}
                        render={({ field }) => (
                          <Select {...field} size="large" placeholder="Choose your partner company" loading={loading.partners} showSearch className="w-full">
                            {partners.map(partner => (
                              <Option key={partner._id} value={partner._id}>{partner.companyName}</Option>
                            ))}
                          </Select>
                        )}
                      />
                    </Form.Item>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Form.Item label="First Name" required validateStatus={errors.first_name ? "error" : ""} help={errors.first_name?.message}>
                      <Controller name="first_name" control={control} rules={{ required: "Required" }} render={({ field }) => <Input prefix={<User />} size="large" {...field} />} />
                    </Form.Item>
                    <Form.Item label="Last Name" required validateStatus={errors.last_name ? "error" : ""} help={errors.last_name?.message}>
                      <Controller name="last_name" control={control} rules={{ required: "Required" }} render={({ field }) => <Input prefix={<User />} size="large" {...field} />} />
                    </Form.Item>
                  </div>

                  <Form.Item label={<Space><span>Email Address</span>{isEmailVerified && <Tag color="success" icon={<Check size={12} />}>Verified</Tag>}</Space>} required validateStatus={errors.email ? "error" : ""} help={errors.email?.message}>
                    <Space.Compact style={{ width: '100%' }}>
                      <Controller name="email" control={control} rules={{ required: "Required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email" } }}
                        render={({ field }) => <Input {...field} prefix={<Mail size={16} />} size="large" style={{ width: '80%' }} disabled={showEmailOtpInput || isEmailVerified} />}
                      />
                      {!isEmailVerified && !showEmailOtpInput && (
                        <Button type="primary" size="large" onClick={handleSendEmailOtp} disabled={!watchEmail} loading={loading.emailOtpSending} style={{ width: '20%', minWidth: '100px', backgroundColor: '#5C039B', borderColor: '#5C039B' }}>Send OTP</Button>
                      )}
                      {(showEmailOtpInput || isEmailVerified) && (
                        <Button size="large" icon={<Edit size={16} />} onClick={handleChangeEmail} style={{ width: '20%', minWidth: '100px' }}>Change</Button>
                      )}
                    </Space.Compact>
                    {showEmailOtpInput && (
                      <div className="mt-4 p-4 bg-gray-50 border border-purple-100 rounded-lg">
                        <Text type="secondary" className="block mb-3">Enter the code sent to <strong>{watchEmail}</strong></Text>
                        <div className="flex gap-3">
                          <Input placeholder="Enter OTP" maxLength={6} value={emailOtpValue} onChange={(e) => setEmailOtpValue(e.target.value)} size="large" style={{ width: '200px' }} />
                          <Button type="primary" onClick={handleVerifyEmailOtp} loading={loading.emailOtpVerifying} size="large" style={{ backgroundColor: '#5C039B' }}>Verify Email</Button>
                        </div>
                      </div>
                    )}
                  </Form.Item>

                  <Form.Item label={<Space><span>Mobile Number</span>{isMobileVerified && <Tag color="success" icon={<Check size={12} />}>Verified</Tag>}</Space>} required validateStatus={errors.mobile_number ? "error" : ""} help={errors.mobile_number?.message}>
                    <Space.Compact style={{ width: '100%' }}>
                      <Select showSearch value={countryCode} size="large" onChange={(val) => { setCountryCode(val); trigger("mobile_number"); }} style={{ width: '30%', minWidth: '130px' }} disabled={showOtpInput || isMobileVerified}>
                        {countryOptions.map((item) => (
                          <Option key={item.iso} value={item.code}>+{item.code} {item.iso}</Option>
                        ))}
                      </Select>
                      <Input prefix={<Phone size={16} />} value={mobileNumber} size="large"
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, "");
                          setMobileNumber(val);
                          setValue("mobile_number", val, { shouldValidate: true });
                          trigger("mobile_number");
                        }}
                        style={{ width: '50%' }} disabled={showOtpInput || isMobileVerified}
                      />
                      {!isMobileVerified && !showOtpInput && (
                        <Button type="primary" size="large" onClick={handleSendOtp} disabled={!mobileNumber || errors.mobile_number} loading={loading.otpSending} style={{ width: '20%', minWidth: '100px', backgroundColor: '#5C039B' }}>Send OTP</Button>
                      )}
                      {(showOtpInput || isMobileVerified) && (
                        <Button size="large" icon={<Edit size={16} />} onClick={handleChangeNumber} style={{ width: '20%', minWidth: '100px' }}>Change</Button>
                      )}
                    </Space.Compact>
                    {showOtpInput && (
                      <div className="mt-4 p-4 bg-gray-50 border border-purple-100 rounded-lg">
                        <Text type="secondary" className="block mb-3">Enter the 6-digit code sent to <strong>+{countryCode} {mobileNumber}</strong></Text>
                        <div className="flex gap-3">
                          <Input placeholder="Enter OTP" maxLength={6} value={otpValue} onChange={(e) => setOtpValue(e.target.value)} size="large" style={{ width: '200px' }} />
                          <Button type="primary" onClick={handleVerifyOtp} loading={loading.otpVerifying} size="large" style={{ backgroundColor: '#5C039B' }}>Verify OTP</Button>
                        </div>
                      </div>
                    )}
                  </Form.Item>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Form.Item label="Password" required validateStatus={errors.password ? "error" : ""} help={errors.password?.message}>
                      <Controller name="password" control={control} rules={{ required: "Required", minLength: { value: 6, message: "Min 6 characters" } }} render={({ field }) => <Input.Password prefix={<Lock />} size="large" {...field} />} />
                    </Form.Item>
                    <Form.Item label="Confirm Password" required validateStatus={errors.confirmPassword ? "error" : ""} help={errors.confirmPassword?.message}>
                      <Controller name="confirmPassword" control={control} rules={{ required: "Required" }} render={({ field }) => <Input.Password prefix={<Lock />} size="large" {...field} />} />
                    </Form.Item>
                  </div>

                  <div className="text-right mt-8">
                    <Button type="primary" size="large" onClick={next} style={{ backgroundColor: '#5C039B' }} disabled={!isMobileVerified || !isEmailVerified}>Next <ChevronRight className="inline" /></Button>
                  </div>
                </div>
              )}

              {/* STEP 1: PROFILE DETAILS & DEPENDENTS */}
              {step === 1 && (
                <div className="animate-fade-in">
                  <Row gutter={24}>
                    <Col span={12}>
                      <Form.Item label="Marital Status" validateStatus={errors.maritalStatus ? "error" : ""} help={errors.maritalStatus?.message}>
                        <Controller name="maritalStatus" control={control} render={({ field }) => (
                          <Select size="large" placeholder="Select status" {...field} allowClear>
                            {maritalStatusOptions.map(o => <Option key={o.value} value={o.value}>{o.label}</Option>)}
                          </Select>
                        )} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Number of Dependents" validateStatus={errors.numberOfDependents ? "error" : ""} help={errors.numberOfDependents?.message}>
                        <Controller name="numberOfDependents" control={control} render={({ field }) => (
                          <Select size="large" placeholder="Select count" {...field} allowClear>
                            {dependentsCountOptions.map(o => <Option key={o.value} value={o.value}>{o.label}</Option>)}
                          </Select>
                        )} />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* DYNAMIC DEPENDENT FIELDS */}
                  {watchDependentsCount > 0 && (
                    <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <Title level={5} className="mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-purple-600"/> Dependent Information</Title>
                      {Array.from({ length: watchDependentsCount }).map((_, index) => (
                        <Card key={index} size="small" className="mb-4 border-slate-200" title={`Dependent ${index + 1}`}>
                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item label="Name">
                                <Controller name={`dependents.${index}.name`} control={control} render={({ field }) => <Input {...field} placeholder="Full Name" />} />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item label="Age" required validateStatus={errors?.dependents?.[index]?.age ? "error" : ""} help={errors?.dependents?.[index]?.age?.message}>
                                <Controller name={`dependents.${index}.age`} rules={{ required: "Age is required" }} control={control} render={({ field }) => <Input type="number" {...field} placeholder="Age" />} />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item label="Relationship">
                                <Controller name={`dependents.${index}.relationship`} control={control} render={({ field }) => (
                                  <Select {...field} placeholder="Select Relationship" allowClear>
                                    {dependentRelationshipOptions.map(opt => <Option key={opt} value={opt}>{opt}</Option>)}
                                  </Select>
                                )} />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item label="Location" required validateStatus={errors?.dependents?.[index]?.location ? "error" : ""} help={errors?.dependents?.[index]?.location?.message}>
                                <Controller name={`dependents.${index}.location`} rules={{ required: "Location is required" }} control={control} render={({ field }) => (
                                  <Select {...field} placeholder="Select Location" allowClear>
                                    {dependentLocationOptions.map(opt => <Option key={opt} value={opt}>{opt}</Option>)}
                                  </Select>
                                )} />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Card>
                      ))}
                    </div>
                  )}

                  <Row gutter={24}>
                    <Col span={12}>
                      <Form.Item label="Nationality" validateStatus={errors.nationality ? "error" : ""} help={errors.nationality?.message}>
                        <Controller name="nationality" control={control} render={({ field }) => (
                          <Select size="large" placeholder="Select nationality" showSearch optionFilterProp="label" {...field} allowClear>
                            {nationalityOptions.map(o => <Option key={o.value} value={o.value} label={o.label}>{o.label}</Option>)}
                          </Select>
                        )} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Date of Birth" validateStatus={errors.dateOfBirth ? "error" : ""} help={errors.dateOfBirth?.message}>
                        <Controller name="dateOfBirth" control={control} render={({ field }) => (
                          <Input type="date" size="large" {...field} />
                        )} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item label="Gender" validateStatus={errors.gender ? "error" : ""} help={errors.gender?.message}>
                    <Controller name="gender" control={control} render={({ field }) => (
                      <Radio.Group {...field} size="large">
                        {genderOptions.map(o => <Radio key={o.value} value={o.value}>{o.label}</Radio>)}
                      </Radio.Group>
                    )} />
                  </Form.Item>

                  <div className="flex justify-between mt-8">
                    <Button size="large" onClick={back}><ChevronLeft /> Back</Button>
                    <Button type="primary" size="large" onClick={next} style={{ backgroundColor: '#5C039B' }}>Next <ChevronRight /></Button>
                  </div>
                </div>
              )}

              {/* STEP 2: REVIEW & SUBMIT */}
              {step === 2 && (
                <Spin spinning={loading.submitting}>
                  <Card className="bg-gray-50 border-purple-100 mb-6">
                    <Title level={4} className="text-purple-800 mb-4">Review Your Information</Title>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div><Text strong>Agent Type:</Text> <Text>{selectedAgentMode === 'freelance' ? 'Freelance Agent' : 'Partner Affiliated'}</Text></div>
                      {selectedAgentMode === 'partner' && (
                        <div><Text strong>Partner Company:</Text> <Text>{partners.find(p => p._id === watch("partnerId"))?.companyName || 'Selected'}</Text></div>
                      )}
                      <div><Text strong>Name:</Text> <Text>{watch("first_name")} {watch("last_name")}</Text></div>
                      <div><Text strong>Email:</Text> <Text>{watch("email")}</Text></div>
                      <div><Text strong>Mobile:</Text> <Text>+{countryCode} {mobileNumber}</Text></div>
                      <div><Text strong>Verification:</Text> <Tag color="green">Verified</Tag></div>
                    </div>
                    <Divider />
                    <div className="grid grid-cols-2 gap-4">
                      <div><Text strong>Marital Status:</Text> <Text>{watch("maritalStatus") || 'Not specified'}</Text></div>
                      <div><Text strong>Dependents:</Text> <Text>{watch("numberOfDependents") || 0}</Text></div>
                      <div><Text strong>Nationality:</Text> <Text>{nationalityOptions.find(o => o.value === watch("nationality"))?.label || 'Not specified'}</Text></div>
                      <div><Text strong>Date of Birth:</Text> <Text>{watch("dateOfBirth") || 'Not specified'}</Text></div>
                      <div><Text strong>Gender:</Text> <Text>{watch("gender") || 'Not specified'}</Text></div>
                    </div>
                  </Card>

                  <Form.Item>
                    <Controller name="agreed_to_terms" control={control} rules={{ required: "You must agree to terms" }}
                      render={({ field }) => (
                        <Checkbox checked={field.value} onChange={e => field.onChange(e.target.checked)}>
                          I agree to the <a href="#" className="text-purple-600">Terms of Service</a> and <a href="#" className="text-purple-600">Privacy Policy</a>
                        </Checkbox>
                      )}
                    />
                    {errors.agreed_to_terms && <div className="text-red-500 text-sm mt-1">{errors.agreed_to_terms.message}</div>}
                  </Form.Item>

                  <div className="flex justify-between mt-12">
                    <Button size="large" onClick={back}><ChevronLeft /> Back</Button>
                    <Button type="primary" htmlType="submit" loading={loading.submitting} size="large" style={{ backgroundColor: '#5C039B' }} disabled={!isEmailVerified || !isMobileVerified}>
                      Complete Registration <Check className="ml-2" />
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