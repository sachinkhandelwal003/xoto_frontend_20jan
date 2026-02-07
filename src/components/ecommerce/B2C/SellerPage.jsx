import React, { useState, useEffect, useMemo } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Steps,
  Card,
  Row,
  Col,
  Checkbox,
  Typography,
  message,
  Spin,
  notification
} from 'antd';
import {
  UserOutlined,
  ShopOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  SafetyOutlined,
  CheckCircleFilled,
  EnvironmentOutlined,
  SafetyCertificateOutlined,
  EditOutlined 
} from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { Country, State, City } from 'country-state-city';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { apiService } from '../../../manageApi/utils/custom.apiservice'; 

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const AgentRegisterPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiErrors, setApiErrors] = useState({});

  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);

  // --- OTP STATES ---
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  // --- EMAIL OTP STATES ---
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);
  const [enteredEmailOtp, setEnteredEmailOtp] = useState("");
  const [emailOtpLoading, setEmailOtpLoading] = useState(false);

  const themeColor = 'var(--color-primary)'; 

  const {
    control,
    handleSubmit,
    trigger,
    setError,
    watch,
    setValue,
    getValues,
    formState: { errors }
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      mobile: { country_code: '+91' }, // Changed default to +91 as per your JSON example
      store_details: { country: 'IN' } // Changed default to IN (India)
    }
  });

  const selectedCountry = watch('store_details.country');
  const selectedState = watch('store_details.state');
  const watchedMobileNumber = watch('mobile.number');
  const watchedEmail = watch('email');

  const countryPhoneData = useMemo(() => {
    const allCountries = Country.getAllCountries();
    return allCountries.map(c => ({
      iso: c.isoCode.toLowerCase(),
      name: c.name,
      phone: `+${c.phonecode}`,
      value: `+${c.phonecode}`,
      searchStr: `${c.name} ${c.phonecode}`
    }));
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      const updatedStates = State.getStatesOfCountry(selectedCountry);
      setStatesList(updatedStates);
    } else {
      setStatesList([]);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedState && selectedCountry) {
      const updatedCities = City.getCitiesOfState(selectedCountry, selectedState);
      setCitiesList(updatedCities);
    } else {
      setCitiesList([]);
    }
  }, [selectedState, selectedCountry]);


  // Keeps existing categories logic if needed for UI, even if not sent in payload
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await apiService.get('/products/get-all-category?limit=100');
      const categoryData = response.data?.data || response.data || response;
      
      if (Array.isArray(categoryData)) {
        const categoryOptions = categoryData.map(category => ({
          label: category.name,
          value: category._id
        }));
        setCategories(categoryOptions);
      } else if (categoryData.categories) {
        const categoryOptions = categoryData.categories.map(category => ({
          label: category.parent ? `${category.name} (${category.parent.name})` : category.name,
          value: category._id
        }));
        setCategories(categoryOptions);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // message.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Personal', 'Details', 'Region'];

  // --- OTP HANDLERS ---
// --- MOBILE OTP HANDLERS (Mock / Fake Logic) ---
  const handleSendOtp = async () => {
    const countryCode = getValues('mobile.country_code');
    const number = getValues('mobile.number');

    if (!countryCode || !number) {
        message.error("Please enter a valid mobile number first.");
        return;
    }

    setOtpLoading(true);
    
    // Yahan hum API call nahi kar rahe, bas success dikha rahe hain
    setTimeout(() => {
        message.success("OTP sent successfully!");
        setOtpSent(true);
        setOtpVerified(false);
        setOtpLoading(false);
    }, 500); // Thoda delay taaki real feel aaye
  };
  

  const handleVerifyOtp = async () => {
    if (!enteredOtp) {
        message.error("Please enter the OTP");
        return;
    }
    setOtpLoading(true);
    
    // Yahan bhi direct success without API
    setTimeout(() => {
        message.success("Mobile Verified Successfully!");
        setOtpVerified(true);
        setOtpSent(false); // OTP input hide kar denge
        setOtpLoading(false);
    }, 500);
  };

  const handleChangeNumber = () => {
    setOtpSent(false);
    setOtpVerified(false);
    setEnteredOtp("");
  };

  // --- EMAIL OTP HANDLERS ---
  const handleSendEmailOtp = async () => {
    const email = getValues('email');
    if (!email) {
        message.error("Please enter a valid email first.");
        return;
    }

    setEmailOtpLoading(true);
    try {
        const payload = { email };
        // 👇 Yahan maine comment hata diya hai
        await apiService.post("/otp/email-otp/send", payload);

        message.success("OTP sent successfully! Please check your mail.");
        setEmailOtpSent(true);
        setEmailOtpVerified(false);
    } catch (error) {
        const errMsg = error?.response?.data?.message || "Failed to send OTP";
        notification.error({ message: "OTP Error", description: errMsg });
    } finally {
        setEmailOtpLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!enteredEmailOtp) {
        message.error("Please enter the OTP");
        return;
    }
    setEmailOtpLoading(true);
    try {
        const payload = {
            email: getValues('email'),
            otp: enteredEmailOtp
        };
        // 👇 Yahan maine comment hata diya hai
        await apiService.post("/otp/email-otp/verify", payload);

        message.success("Email Verified Successfully!");
        setEmailOtpVerified(true);
        setEmailOtpSent(false); 
    } catch (error) {
        notification.error({
            message: "Verification Failed",
            description: error?.response?.data?.message || "Invalid OTP"
        });
        setEmailOtpVerified(false);
    } finally {
        setEmailOtpLoading(false);
    }
  };

  const handleChangeEmail = () => {
    setEmailOtpSent(false);
    setEmailOtpVerified(false);
    setEnteredEmailOtp("");
  };


  const handleNext = async () => {
    let fieldsToValidate = [];

    if (currentStep === 0) {
      if (!otpVerified || !emailOtpVerified) {
          message.error("Please verify your mobile number and email to continue.");
          return;
      }
      fieldsToValidate = ['first_name', 'last_name', 'email', 'mobile.country_code', 'mobile.number', 'password', 'confirmPassword'];
    } else if (currentStep === 1) {
       // Although "Store Name" isn't in new payload, we validte it if present in UI
      fieldsToValidate = ['store_details.store_name', 'store_details.store_description'];
    } else if (currentStep === 2) {
      fieldsToValidate = [
        'store_details.country', 
        'store_details.state', 
        'store_details.city', 
        'meta.agreed_to_terms'
      ];
    }

    const result = await trigger(fieldsToValidate);
    if (result) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      window.history.back();
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };

  // ------------------------------------------------------------------
  //  ✅ MAIN INTEGRATION LOGIC HERE
  // ------------------------------------------------------------------
  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      message.error('Passwords do not match');
      return;
    }

    if (!otpVerified || !emailOtpVerified) {
        message.error("Mobile number or email not verified.");
        setCurrentStep(0);
        return;
    }

    setSubmitting(true);
    setApiErrors({});

    const countryObj = Country.getCountryByCode(data.store_details.country);
    // const stateObj = State.getStateByCodeAndCountry(data.store_details.state, data.store_details.country);
    
    // Construct Operating Regions from selected City/State
    const operatingRegions = [];
    if (data.store_details?.city) operatingRegions.push(data.store_details.city);
    // if (stateObj?.name) operatingRegions.push(stateObj.name);

    // ✅ Construct the Exact Payload requested
    const payload = {
      name: `${data.first_name} ${data.last_name}`,
      email: data.email,
      phone_number: data.mobile?.number || '',
      country_code: data.mobile?.country_code,
      password: data.password,

      profile_photo: "", // Default empty

      agentType: "individual", // Hardcoded as per request
      agencyId: null,
      letterOfAuthority: "",

      country: countryObj ? countryObj.name : "India",
      city: data.store_details?.city || "Delhi",
      operatingRegions: operatingRegions.length > 0 ? operatingRegions : ["Delhi"], // Fallback or mapped

      status: "pending",
      isVerifiedByAdmin: false,
      isActive: true,

      subscriptionPlan: "free",
      subscriptionExpiry: null,

      notificationSettings_email: true,
      notificationSettings_sms: false,
      notificationSettings_whatsapp: true
    };

    try {
      // ✅ Updated API Endpoint
      await apiService.post('/agency/create-agent', payload);
      
      setSuccess(true);
      message.success('Agent Registration successful! Awaiting approval.');
    } catch (err) {
      const res = err.response?.data;

      if (res?.errors && Array.isArray(res.errors) && res.errors.length > 0) {
        const errorMap = {};
        res.errors.forEach(e => {
          errorMap[e.field] = e.message;
          setError(e.field, { type: "server", message: e.message });
        });
        setApiErrors(errorMap);
        notification.error({
            message: "Validation Error",
            description: res.errors[0].message,
        });
      } else {
        message.error(res?.message || "Registration failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = `w-full h-[42px] border rounded-md px-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 bg-white transition-all flex items-center border-gray-300`;

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--color-primary)] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleFilled style={{ fontSize: '48px', color: '#52c41a' }} />
          </div>
          <Title level={2}>Registration Successful!</Title>
          <Text type="secondary" style={{ fontSize: '16px', display: 'block', marginBottom: '32px' }}>
            Your Agent profile has been created.<br />
            You will receive an email once approved.
          </Text>
          <Button type="primary" size="large" href="/login" block
            style={{ height: '48px', fontSize: '16px', backgroundColor: themeColor, borderColor: themeColor }}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-primary)] flex items-center justify-center py-10 px-4">
      <div style={{ maxWidth: 1200, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 40, color: 'white' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80,
            height: 80,
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            marginBottom: 20,
            backdropFilter: 'blur(10px)'
          }}>
            <UserOutlined style={{ fontSize: 36, color: '#fff' }} />
          </div>
          <Title level={2} style={{ color: '#fff', margin: 0 }}>Agent Registration</Title>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16 }}>
            Join our Agency network in 3 simple steps
          </Text>
        </div>

        <Row gutter={[32, 32]}>
          <Col xs={24} lg={8}>
            <Card bordered={false} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', height: '100%', color: 'white' }} bodyStyle={{ padding: 32 }}>
              <Steps direction="vertical" current={currentStep}>
                {steps.map((title, index) => (
                  <Steps.Step
                    key={index}
                    title={<span style={{ color: currentStep >= index ? '#fff' : 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}>{title}</span>}
                    icon={
                      <div style={{
                        background: currentStep >= index ? '#fff' : 'transparent',
                        color: currentStep >= index ? themeColor : 'rgba(255,255,255,0.5)',
                        border: `1px solid ${currentStep >= index ? '#fff' : 'rgba(255,255,255,0.5)'}`,
                        width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {currentStep > index ? <CheckCircleOutlined /> : index === 0 ? <UserOutlined /> : index === 1 ? <FileTextOutlined /> : <EnvironmentOutlined />}
                      </div>
                    }
                  />
                ))}
              </Steps>
              <div style={{ marginTop: 40, borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 20 }}>
                <Text style={{ color: '#fff', display: 'block', marginBottom: 10 }}><CheckCircleOutlined /> Quick Onboarding</Text>
                <Text style={{ color: '#fff', display: 'block', marginBottom: 10 }}><CheckCircleOutlined /> High Commissions</Text>
                <Text style={{ color: '#fff', display: 'block' }}><CheckCircleOutlined /> Dedicated Support</Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={16}>
            <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 20px 40px rgba(0,0,0,0.2)', background: '#fff' }} bodyStyle={{ padding: 40 }}>
              <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
                <Spin spinning={submitting}>
                  
                  {/* Step 0: Personal Information */}
                  {currentStep === 0 && (
                    <>
                      <Title level={4} style={{ marginBottom: 24, color: '#333' }}>
                        <UserOutlined style={{ color: themeColor }} /> Personal Information
                      </Title>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item label="First Name" required validateStatus={errors.first_name ? 'error' : ''} help={errors.first_name?.message || apiErrors.name}>
                            <Controller name="first_name" control={control} rules={{ required: 'Required' }} render={({ field }) => <Input size="large" {...field} />} />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item label="Last Name" required validateStatus={errors.last_name ? 'error' : ''} help={errors.last_name?.message || apiErrors.name}>
                            <Controller name="last_name" control={control} rules={{ required: 'Required' }} render={({ field }) => <Input size="large" {...field} />} />
                          </Form.Item>
                        </Col>
                      </Row>

                      {/* --- EMAIL FIELD --- */}
                      <div className="mb-4">
                        <Form.Item label="Email Address" required validateStatus={errors.email ? 'error' : ''} help={errors.email?.message || apiErrors.email} style={{marginBottom: 0}}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                                <div style={{ flex: 1 }}>
                                    <Controller
                                        name="email"
                                        control={control}
                                        rules={{ 
                                            required: 'Required',
                                            pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } 
                                        }}
                                        render={({ field }) => (
                                            <Input 
                                                size="large"
                                                {...field}
                                                disabled={emailOtpSent && !emailOtpVerified} 
                                                style={{ borderColor: errors.email ? 'red' : '#d1d5db' }}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    if (emailOtpVerified) setEmailOtpVerified(false);
                                                }}
                                            />
                                        )} 
                                    />
                                </div>
                                <div style={{ width: '100px' }}>
                                    {!emailOtpVerified && !emailOtpSent ? (
                                        <Button 
                                            type="primary" 
                                            disabled={!watchedEmail}
                                            style={{ height: '42px', width: '100%', backgroundColor: !watchedEmail ? 'white' : "#1677ff", borderColor: !watchedEmail ? '#d9d9d9' : "#1677ff", color: !watchedEmail ? 'rgba(0,0,0,0.25)' : 'white' }}
                                            onClick={handleSendEmailOtp}
                                            loading={emailOtpLoading}
                                        >
                                            Send OTP
                                        </Button>
                                    ) : (
                                        <Button danger={!emailOtpVerified} style={{ height: '42px', width: '100%' }} onClick={handleChangeEmail} icon={<EditOutlined />}>
                                            Change
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Form.Item>
                        {emailOtpSent && !emailOtpVerified && (
                            <div style={{ marginTop: 16, display: 'flex', gap: 8, animation: 'fadeIn 0.3s ease' }}>
                                <div style={{ flex: 1 }}>
                                    <Input size="large" placeholder="Enter 6-digit OTP" prefix={<SafetyCertificateOutlined style={{ color: themeColor }}/>} value={enteredEmailOtp} onChange={(e) => setEnteredEmailOtp(e.target.value.replace(/\D/g, ""))} maxLength={6} />
                                    <Text type="secondary" style={{ fontSize: 12, marginLeft: 4 }}>OTP sent to {getValues('email')}</Text>
                                </div>
                                <Button type="primary" size="large" onClick={handleVerifyEmailOtp} loading={emailOtpLoading} style={{ background: themeColor, borderColor: themeColor }}>Verify</Button>
                            </div>
                        )}
                        {emailOtpVerified && <div style={{ marginTop: 8, color: '#52c41a', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}><CheckCircleFilled /> Email Verified</div>}
                      </div>

                      {/* --- MOBILE FIELD --- */}
                      <div className="mb-4">
                        <Form.Item label="Mobile Number" required validateStatus={errors.mobile?.number ? 'error' : ''} help={errors.mobile?.number?.message} style={{marginBottom: 0}}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                                <div style={{ width: '120px' }}>
                                    <Controller
                                        name="mobile.country_code"
                                        control={control}
                                        rules={{ required: 'Required' }}
                                        render={({ field }) => (
                                            <Select {...field} showSearch disabled={otpVerified || otpSent} optionFilterProp="children" filterOption={(input, option) => (option['data-search'] || "").toLowerCase().includes(input.toLowerCase())} className="custom-select-seller" style={{ width: '100%', height: '42px' }}>
                                                {countryPhoneData.map((country, index) => (
                                                    <Option key={`${country.iso}-${index}`} value={country.value} data-search={country.searchStr}>
                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            <img src={`https://flagcdn.com/w20/${country.iso}.png`} width="20" alt={country.name} style={{ marginRight: 6 }} />
                                                            <span>{country.phone}</span>
                                                        </div>
                                                    </Option>
                                                ))}
                                            </Select>
                                        )} 
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <Controller
                                        name="mobile.number"
                                        control={control}
                                        rules={{ 
                                            required: 'Required',
                                            validate: (value) => {
                                                const countryCode = getValues('mobile.country_code');
                                                if(!countryCode) return "Select code";
                                                const fullNumber = `${countryCode}${value}`;
                                                const phoneNumber = parsePhoneNumberFromString(fullNumber);
                                                return (phoneNumber && phoneNumber.isValid()) || "Invalid length";
                                            }
                                        }}
                                        render={({ field }) => (
                                            <input {...field} className={inputClass} placeholder="9876543210" disabled={otpSent && !otpVerified} style={{ width: '100%', borderColor: errors.mobile?.number ? 'red' : '#d1d5db' }}
                                                onChange={(e) => {
                                                    field.onChange(e.target.value.replace(/\D/g, ""));
                                                    if (otpVerified) setOtpVerified(false);
                                                }}
                                            />
                                        )} 
                                    />
                                </div>
                                <div style={{ width: '100px' }}>
                                    {!otpVerified && !otpSent ? (
                                        <Button type="primary" disabled={!watchedMobileNumber} style={{ height: '42px', width: '100%', backgroundColor: !watchedMobileNumber ? 'white' : "#1677ff", borderColor: !watchedMobileNumber ? '#d9d9d9' : "#1677ff", color: !watchedMobileNumber ? 'rgba(0,0,0,0.25)' : 'white' }} onClick={handleSendOtp} loading={otpLoading}>
                                            Send OTP
                                        </Button>
                                    ) : (
                                        <Button danger={!otpVerified} style={{ height: '42px', width: '100%' }} onClick={handleChangeNumber} icon={<EditOutlined />}>
                                            Change
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Form.Item>
                        {otpSent && !otpVerified && (
                            <div style={{ marginTop: 16, display: 'flex', gap: 8, animation: 'fadeIn 0.3s ease' }}>
                                <div style={{ flex: 1 }}>
                                    <Input size="large" placeholder="Enter 6-digit OTP" prefix={<SafetyCertificateOutlined style={{ color: themeColor }}/>} value={enteredOtp} onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ""))} maxLength={6} />
                                    <Text type="secondary" style={{ fontSize: 12, marginLeft: 4 }}>OTP sent to {getValues('mobile.country_code')} {getValues('mobile.number')}</Text>
                                </div>
                                <Button type="primary" size="large" onClick={handleVerifyOtp} loading={otpLoading} style={{ background: themeColor, borderColor: themeColor }}>Verify</Button>
                            </div>
                        )}
                        {otpVerified && <div style={{ marginTop: 8, color: '#52c41a', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}><CheckCircleFilled /> Mobile Number Verified</div>}
                      </div>

                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item label="Password" required validateStatus={errors.password ? 'error' : ''} help={errors.password?.message}>
                            <Controller name="password" control={control} rules={{ required: 'Required', minLength: { value: 6, message: 'Min 6 characters' } }} render={({ field }) => <Input.Password size="large" {...field} />} />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item label="Confirm Password" required validateStatus={errors.confirmPassword ? 'error' : ''} help={errors.confirmPassword?.message}>
                            <Controller name="confirmPassword" control={control} rules={{ required: 'Required' }} render={({ field }) => <Input.Password size="large" {...field} />} />
                          </Form.Item>
                        </Col>
                      </Row>
                    </>
                  )}

                  {/* Step 1: Extra Details (Adapted for Agent) */}
                  {currentStep === 1 && (
                    <>
                      <Title level={4} style={{ marginBottom: 24, color: '#333' }}>
                        <FileTextOutlined style={{ color: themeColor }} /> Agent Details
                      </Title>
                      
                      {/* Store Name treated as "Agency/Business Name" if needed, or just dummy field for UI */}
                      <Form.Item label="Display Name / Business Name" required validateStatus={errors.store_details?.store_name ? 'error' : ''} help={errors.store_details?.store_name?.message}>
                        <Controller name="store_details.store_name" control={control} rules={{ required: 'Required' }} render={({ field }) => <Input size="large" placeholder="e.g. Rahul Agency" {...field} />} />
                      </Form.Item>

                      <Form.Item label="Description / Bio">
                        <Controller name="store_details.store_description" control={control} render={({ field }) => (
                          <TextArea rows={4} showCount maxLength={500} placeholder="Tell us about yourself..." {...field} />
                        )} />
                      </Form.Item>
                    </>
                  )}

                  {/* Step 2: Region Details */}
                  {currentStep === 2 && (
                    <>
                      <Title level={4} style={{ marginBottom: 24, color: '#333' }}>
                        <EnvironmentOutlined style={{ color: themeColor }} /> Operating Region
                      </Title>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item label="Country" required validateStatus={errors.store_details?.country ? 'error' : ''} help={errors.store_details?.country?.message}>
                            <Controller 
                                name="store_details.country" 
                                control={control} 
                                rules={{ required: 'Required' }} 
                                render={({ field }) => (
                                <Select size="large" showSearch optionFilterProp="children" filterOption={(input, option) => option.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                    onChange={(val) => {
                                        field.onChange(val);
                                        setValue('store_details.state', undefined); 
                                        setValue('store_details.city', undefined);
                                    }}
                                    value={field.value}
                                >
                                    {Country.getAllCountries().map(country => (
                                        <Option key={country.isoCode} value={country.isoCode}>{country.name}</Option>
                                    ))}
                                </Select>
                            )} />
                          </Form.Item>
                        </Col>

                        <Col span={12}>
                          <Form.Item label="State / Province" required validateStatus={errors.store_details?.state ? 'error' : ''} help={errors.store_details?.state?.message}>
                            <Controller 
                                name="store_details.state" 
                                control={control} 
                                rules={{ required: 'Required' }} 
                                render={({ field }) => (
                                <Select size="large" showSearch disabled={!statesList.length} optionFilterProp="children" filterOption={(input, option) => option.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                    onChange={(val) => {
                                        field.onChange(val);
                                        setValue('store_details.city', undefined);
                                    }}
                                    value={field.value}
                                >
                                    {statesList.map(state => (
                                        <Option key={state.isoCode} value={state.isoCode}>{state.name}</Option>
                                    ))}
                                </Select>
                            )} />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col span={24}>
                           <Form.Item label="Primary City" required validateStatus={errors.store_details?.city ? 'error' : ''} help={errors.store_details?.city?.message}>
                            <Controller 
                                name="store_details.city" 
                                control={control} 
                                rules={{ required: 'Required' }} 
                                render={({ field }) => (
                                citiesList.length > 0 ? (
                                    <Select size="large" showSearch optionFilterProp="children" {...field}>
                                        {citiesList.map(city => (
                                            <Option key={city.name} value={city.name}>{city.name}</Option>
                                        ))}
                                    </Select>
                                ) : (
                                    <Input size="large" {...field} />
                                )
                            )} />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item validateStatus={errors.meta?.agreed_to_terms ? 'error' : ''} help={errors.meta?.agreed_to_terms?.message}>
                        <Controller
                          name="meta.agreed_to_terms"
                          control={control}
                          rules={{ required: 'You must agree to terms' }}
                          render={({ field }) => (
                            <Checkbox checked={field.value} onChange={e => field.onChange(e.target.checked)}>
                              I agree to the Terms and Conditions
                            </Checkbox>
                          )}
                        />
                      </Form.Item>
                    </>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, paddingTop: 24, borderTop: '1px solid #f0f0f0' }}>
                    <Button size="large" onClick={handleBack} icon={<ArrowLeftOutlined />}>
                      Back
                    </Button>

                    <div>
                      {currentStep < steps.length - 1 ? (
                        <Button type="primary" size="large" onClick={handleNext} style={{ background: themeColor, borderColor: themeColor }} icon={<ArrowRightOutlined />}>
                          Continue
                        </Button>
                      ) : (
                        <Button type="primary" size="large" htmlType="submit" loading={submitting} disabled={!otpVerified || !emailOtpVerified} style={{ background: themeColor, borderColor: themeColor }} icon={<CheckCircleOutlined />}>
                          Create Agent Profile
                        </Button>
                      )}
                    </div>
                  </div>
                </Spin>
              </Form>

              <div style={{ marginTop: 20, textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <SafetyOutlined style={{ color: '#52c41a' }} /> Your data is encrypted and secure.
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      <style jsx global>{`
        .custom-select-seller .ant-select-selector {
          border-radius: 0.375rem !important; 
          border-color: #d1d5db !important;
          height: 42px !important;
          display: flex !important;
          align-items: center !important;
          padding-left: 4px !important;
        }
        .custom-select-seller .ant-select-selector:hover {
          border-color: #a855f7 !important;
        }
        .custom-select-seller.ant-select-focused .ant-select-selector {
          border-color: #a855f7 !important;
          box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.2) !important;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AgentRegisterPage;