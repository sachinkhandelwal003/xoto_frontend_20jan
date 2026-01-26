/* src/components/freelancers/Registration.jsx */
import React, { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  User, Mail, Phone, Lock, Briefcase, Wrench,
  Plus, Trash2, ChevronLeft, ChevronRight, Check, ArrowRight,
} from "lucide-react";
import {
  Form, Input, Select, Button, Checkbox, message, Spin,
  Space, Typography, Modal, Tag
} from "antd";
import registerimage from "../../assets/img/registergarden.jpg";
import { apiService } from "../../manageApi/utils/custom.apiservice";

// --- Libraries ---
import CountryList from 'country-list-with-dial-code-and-flag';
import { Country, State, City } from 'country-state-city';

const { Option } = Select;
const { Title, Text } = Typography;

// --- Mock Options ---
const experienceOptions = Array.from({ length: 11 }, (_, i) => ({
  value: i,
  label: i === 0 ? "Less than 1 year" : `${i} year${i > 1 ? "s" : ""}`,
})).concat({ value: 15, label: "15 years" }, { value: 20, label: "20+ years" });

const paymentOptions = [
  { value: "Cash", label: "Cash" },
  { value: "Bank Transfer", label: "Bank Transfer" },
];

const languageOptions = [
  { value: "english", label: "English" },
  { value: "arabic", label: "Arabic" },
  { value: "hindi", label: "Hindi" },
  { value: "french", label: "French" },
];

const Registration = () => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState({
    subcategories: true,
    types: {},
    submitting: false,
    otpSending: false,
    otpVerifying: false,
  });
  const [success, setSuccess] = useState(false);

  // --- Mobile Verification State ---
  const [countryCode, setCountryCode] = useState("+971");
  const [mobileNumber, setMobileNumber] = useState("");
  const mobileCountryOptions = useMemo(() => CountryList.getAll(), []);
  
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpValue, setOtpValue] = useState("");

  // --- React Hook Form ---
  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    watch,
    register,
    setError, // Used to set manual errors (like "Not Verified")
    clearErrors,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  // Register mobile number manually to handle validation
  useEffect(() => {
    register("mobile_number", { 
        required: "Mobile number is required",
        minLength: { value: 7, message: "Number is too short" } 
    });
  }, [register]);

  const watchCountry = watch("country");
  const watchState = watch("state");

  const locationCountries = useMemo(() => Country.getAllCountries(), []);
  const availableStates = useMemo(() => watchCountry ? State.getStatesOfCountry(watchCountry) : [], [watchCountry]);
  const availableCities = useMemo(() => (watchCountry && watchState) ? City.getCitiesOfState(watchCountry, watchState) : [], [watchCountry, watchState]);

  useEffect(() => { setValue("state", null); setValue("city", null); }, [watchCountry, setValue]);
  useEffect(() => { setValue("city", null); }, [watchState, setValue]);

  const [services, setServices] = useState([{ subcategoryId: "", types: [], description: "", unit: "per job" }]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [typesMap, setTypesMap] = useState({});

  // --- Fetch Services ---
  useEffect(() => {
    const initFetch = async () => {
      try {
        const res = await apiService.get("/estimate/master/category/name/Landscaping/subcategories");
        if (res.success) setSubcategories(res.data || []);
      } catch (err) { message.error("Error loading services"); }
      finally { setLoading(prev => ({ ...prev, subcategories: false })); }
    };
    initFetch();
  }, []);

  const fetchTypes = async (subcategoryId, serviceIndex) => {
    if (!subcategoryId) return;
    const sub = subcategories.find(s => s._id === subcategoryId);
    if (!sub?.category) return;
    setLoading(prev => ({ ...prev, types: { ...prev.types, [serviceIndex]: true } }));
    try {
      const res = await apiService.get(`/estimate/master/category/${sub.category}/subcategories/${subcategoryId}/types`);
      if (res.success) {
        const formatted = (res.data || []).map(item => ({ value: item._id, label: item.label }));
        setTypesMap(prev => ({ ...prev, [serviceIndex]: formatted }));
      }
    } catch (err) { message.error("Error loading specializations"); }
    finally { setLoading(prev => ({ ...prev, types: { ...prev.types, [serviceIndex]: false } })); }
  };

  const handleSubcategorySelect = (serviceIndex, subcategoryId) => {
    const newServices = [...services];
    newServices[serviceIndex].subcategoryId = subcategoryId;
    newServices[serviceIndex].types = [];
    setServices(newServices);
    fetchTypes(subcategoryId, serviceIndex);
  };

  const handleTypesSelect = (serviceIndex, selectedTypes) => {
    const newServices = [...services];
    newServices[serviceIndex].types = selectedTypes;
    setServices(newServices);
  };

  const addService = () => setServices(prev => [...prev, { subcategoryId: "", types: [], description: "", unit: "per job" }]);
  const removeService = (index) => setServices(prev => prev.filter((_, i) => i !== index));

  // --- OTP Handlers ---
  const handleSendOtp = async () => {
    if (!mobileNumber || mobileNumber.length < 7) {
      setError("mobile_number", { type: "manual", message: "Enter a valid number to verify" });
      return;
    }
    
    setLoading(prev => ({ ...prev, otpSending: true }));
    try {
      await apiService.post("/otp/send-otp", {
        country_code: countryCode,
        phone_number: mobileNumber
      });
      message.success(`OTP sent to ${countryCode} ${mobileNumber}`);
      setOtpModalVisible(true);
      clearErrors("mobile_number");
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(prev => ({ ...prev, otpSending: false }));
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpValue || otpValue.length < 4) {
      return message.error("Please enter a valid OTP");
    }

    setLoading(prev => ({ ...prev, otpVerifying: true }));
    try {
      await apiService.post("/otp/verify-otp", {
        country_code: countryCode,
        phone_number: mobileNumber,
        otp: otpValue
      });
      
      message.success("Mobile number verified successfully!");
      setIsMobileVerified(true);
      setOtpModalVisible(false);
      clearErrors("mobile_number"); // Clear any "Not Verified" errors
    } catch (error) {
      message.error(error.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(prev => ({ ...prev, otpVerifying: false }));
    }
  };

  // --- Navigation with Inline Errors ---
  const next = async () => {
    let isValid = true;

    // STEP 0 Validation
    if (step === 0) {
      const fields = ["first_name", "last_name", "email", "password", "confirmPassword", "mobile_number"];
      
      // Trigger react-hook-form validation first
      const formValid = await trigger(fields);
      
      // Check Mobile Verification Manually
      if (!isMobileVerified) {
        setError("mobile_number", {
          type: "manual",
          message: "Please verify your mobile number first", // This shows below input
        });
        isValid = false;
      } else {
        // If validated, clear previous errors
        if (formValid) clearErrors("mobile_number");
      }

      if (!formValid) isValid = false;
    } 
    // STEP 1 Validation
    else if (step === 1) {
      const fields = ["experience_years", "bio", "country", "state", "city"];
      const formValid = await trigger(fields);
      if (!formValid) isValid = false;
    }

    if (isValid) setStep(s => s + 1);
  };

  const back = () => setStep(s => s - 1);

  // --- Final Submit ---
  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", { type: "manual", message: "Passwords do not match" });
      return;
    }
    
    if (selectedLanguages.length === 0) return message.error("Please select at least one language");
    if (services.some(s => !s.subcategoryId || s.types.length === 0 || !s.description)) return message.error("Please complete all service fields");

    setLoading(prev => ({ ...prev, submitting: true }));

    const countryName = locationCountries.find(c => c.isoCode === data.country)?.name || data.country;
    const stateName = availableStates.find(s => s.isoCode === data.state)?.name || data.state;

    const payload = {
      email: data.email,
      password: data.password,
      confirm_password: data.confirmPassword,
      name: { first_name: data.first_name, last_name: data.last_name },
      mobile: { country_code: countryCode, number: mobileNumber.replace(/\D/g, "") },
      is_mobile_verified: isMobileVerified,
      location: { country: countryName, state: stateName, city: data.city },
      professional: {
        experience_years: Number(data.experience_years),
        bio: data.bio,
        skills: [],
        availability: "Full-time",
      },
      services_offered: services.map(s => ({
        category: s.subcategoryId,
        subcategories: s.types,
        description: s.description,
        unit: s.unit,
      })),
      payment: { preferred_method: data.preferred_method },
      languages: selectedLanguages,
      meta: { agreed_to_terms: true },
    };

    try {
      await apiService.post("/freelancer", payload);
      setSuccess(true);
      message.success("Registration successful!");
    } catch (err) {
      const res = err.response?.data;
      message.error(res?.message || "Registration failed");
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  const filterOption = (input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

  if (success) {
    return (
      <div className="min-h-screen bg-cover bg-center flex items-center justify-center p-6"
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${registerimage})` }}>
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Registration Successful!</h1>
          <p className="text-gray-600 mb-8">Your request has been sent to the <strong>Super-Admin</strong>.</p>
          <a href="/login" className="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700 transition">
            Go to Login <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center p-6"
      style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${registerimage})` }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-4">
          
          {/* Sidebar */}
          <div className="bg-gradient-to-b from-purple-700 to-purple-900 text-white p-8">
            <h3 className="text-2xl font-bold mb-2">Join as a Pro</h3>
            <p className="text-purple-200 mb-8">Grow your landscaping business</p>
            <div className="space-y-6">
              <div className={`flex items-center gap-3 ${step >= 0 ? "text-white" : "text-purple-300"}`}><User className="w-6 h-6" /> Basic Info</div>
              <div className={`flex items-center gap-3 ${step >= 1 ? "text-white" : "text-purple-300"}`}><Briefcase className="w-6 h-6" /> Professional</div>
              <div className={`flex items-center gap-3 ${step >= 2 ? "text-white" : "text-purple-300"}`}><Wrench className="w-6 h-6" /> Services</div>
            </div>
          </div>

          <div className="lg:col-span-3 p-10">
            <h2 className="text-4xl font-bold text-gray-800 mb-2">Execution Partners Registration</h2>
            <p className="text-gray-600 mb-8">Step {step + 1} of 3</p>

            <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
              {/* STEP 0: BASIC INFO */}
              {step === 0 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Form.Item label="First Name" required validateStatus={errors.first_name ? "error" : ""} help={errors.first_name?.message}>
                      <Controller name="first_name" control={control} rules={{ required: "Required" }} render={({ field }) => <Input prefix={<User />} size="large" {...field} />} />
                    </Form.Item>
                    <Form.Item label="Last Name" required validateStatus={errors.last_name ? "error" : ""} help={errors.last_name?.message}>
                      <Controller name="last_name" control={control} rules={{ required: "Required" }} render={({ field }) => <Input prefix={<User />} size="large" {...field} />} />
                    </Form.Item>
                  </div>
                  <Form.Item label="Email" required validateStatus={errors.email ? "error" : ""} help={errors.email?.message}>
                    <Controller name="email" control={control} rules={{ required: "Required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email" } }} render={({ field }) => <Input prefix={<Mail />} size="large" {...field} />} />
                  </Form.Item>

                  {/* --- MOBILE NUMBER WITH INLINE ERROR DISPLAY --- */}
                  <Form.Item 
                    label={
                        <Space>
                            <span>Mobile Number</span>
                            {isMobileVerified && <Tag color="success" icon={<Check size={12} />}>Verified</Tag>}
                        </Space>
                    }
                    required 
                    validateStatus={errors.mobile_number ? "error" : ""} 
                    help={errors.mobile_number?.message} // Displays error here (e.g. "Please verify mobile")
                  >
                    <Space.Compact style={{ width: '100%' }}>
                        <Select
                            showSearch
                            value={countryCode}
                            onChange={setCountryCode}
                            style={{ width: '30%', minWidth: '110px' }}
                            placeholder="Code"
                            size="large"
                            optionFilterProp="label"
                            filterOption={filterOption}
                            // disabled={isMobileVerified}
                        >
                            {mobileCountryOptions.map((country, index) => (
                                <Option key={`${country.code}-${index}`} value={country.dial_code} label={`${country.name} ${country.dial_code}`}>
                                    <span>{country.flag} {country.dial_code}</span>
                                </Option>
                            ))}
                        </Select>
                        <Input 
                            prefix={<Phone size={16} />} 
                            value={mobileNumber} 
                            onChange={e => {
                                const val = e.target.value.replace(/\D/g, "");
                                setMobileNumber(val);
                                // Update hook form value manually
                                setValue("mobile_number", val, { shouldValidate: true });
                                // Clear manual verify error if user starts typing (optional logic)
                                if (errors.mobile_number?.type === 'manual') clearErrors("mobile_number");
                            }}
                            placeholder="501234567" 
                            size="large" 
                            style={{ width: '50%' }} 
                            // disabled={isMobileVerified} 
                        />
                        <Button 
                            type="primary" 
                            size="large" 
                            onClick={handleSendOtp}
                            disabled={isMobileVerified || !mobileNumber}
                            loading={loading.otpSending}
                            style={{ width: '20%', minWidth: '100px', backgroundColor: isMobileVerified ? '#52c41a' : undefined }}
                        >
                            {isMobileVerified ? "Verified" : "Verify"}
                        </Button>
                    </Space.Compact>
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
                    <Button type="primary" size="large" onClick={next} style={{ backgroundColor: '#5C039B', borderColor: '#5C039B' }}>
                      Next <ChevronRight className="inline" />
                    </Button>
                  </div>
                </>
              )}

              {/* STEP 1: PROFESSIONAL DETAILS */}
              {step === 1 && (
                <>
                  <Form.Item label="Years of Experience" required validateStatus={errors.experience_years ? "error" : ""} help={errors.experience_years?.message}>
                    <Controller name="experience_years" control={control} rules={{ required: "Required" }} render={({ field }) => (
                      <Select size="large" placeholder="Select years" {...field}>
                        {experienceOptions.map(o => <Option key={o.value} value={o.value}>{o.label}</Option>)}
                      </Select>
                    )} />
                  </Form.Item>
                  <Form.Item label="Professional Bio" required validateStatus={errors.bio ? "error" : ""} help={errors.bio?.message}>
                    <Controller name="bio" control={control} rules={{ required: "Required", minLength: { value: 10, message: "Min 10 chars" } }} render={({ field }) => <Input.TextArea rows={5} size="large" {...field} />} />
                  </Form.Item>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Form.Item label="Country" required validateStatus={errors.country ? "error" : ""} help={errors.country?.message}>
                      <Controller name="country" control={control} rules={{ required: "Required" }} render={({ field }) => (
                        <Select {...field} size="large" placeholder="Select country" showSearch optionFilterProp="label" filterOption={filterOption}>
                          {locationCountries.map(c => (
                             <Option key={c.isoCode} value={c.isoCode} label={c.name}>{c.flag} {c.name}</Option>
                          ))}
                        </Select>
                      )} />
                    </Form.Item>

                    <Form.Item label="State/Emirate" required validateStatus={errors.state ? "error" : ""} help={errors.state?.message}>
                      <Controller name="state" control={control} rules={{ required: "Required" }} render={({ field }) => (
                        <Select {...field} size="large" placeholder={!watchCountry ? "Select Country first" : "Select State"} disabled={!watchCountry} showSearch optionFilterProp="label" filterOption={filterOption}>
                          {availableStates.map(s => (
                             <Option key={s.isoCode} value={s.isoCode} label={s.name}>{s.name}</Option>
                          ))}
                        </Select>
                      )} />
                    </Form.Item>

                    <Form.Item label="City" required validateStatus={errors.city ? "error" : ""} help={errors.city?.message}>
                      <Controller name="city" control={control} rules={{ required: "Required" }} render={({ field }) => (
                        <Select {...field} size="large" placeholder={!watchState ? "Select State first" : "Select City"} disabled={!watchState} showSearch optionFilterProp="label" filterOption={filterOption}>
                          {availableCities.map(c => (
                             <Option key={c.name} value={c.name} label={c.name}>{c.name}</Option>
                          ))}
                        </Select>
                      )} />
                    </Form.Item>
                  </div>

                  <div className="flex justify-between mt-8">
                    <Button size="large" onClick={back}><ChevronLeft /> Back</Button>
                    <Button type="primary" size="large" onClick={next} style={{ backgroundColor: '#5C039B', borderColor: '#5C039B' }}>
                      Next <ChevronRight />
                    </Button>
                  </div>
                </>
              )}

              {/* STEP 2: SERVICES */}
              {step === 2 && (
                <Spin spinning={loading.submitting}>
                  {services.map((service, index) => (
                    <div key={index} className="border border-gray-200 rounded-2xl p-8 mb-10 relative bg-gray-50">
                      {services.length > 1 && (
                        <Button danger onClick={() => removeService(index)} className="absolute top-6 right-6">
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      )}
                      <Title level={3} className="mb-8">Service {index + 1}</Title>

                      <Form.Item label="What service do you offer?" required>
                        <Select
                          size="large"
                          placeholder="Select a service category"
                          value={service.subcategoryId || undefined}
                          onChange={(value) => handleSubcategorySelect(index, value)}
                          loading={loading.subcategories}
                          showSearch
                          optionFilterProp="children"
                          className="w-full"
                        >
                          {subcategories.map(sub => (
                            <Option key={sub._id} value={sub._id}>{sub.label}</Option>
                          ))}
                        </Select>
                      </Form.Item>

                      {service.subcategoryId && (
                        <Form.Item label="Specializations (Multiple)" required className="mb-6">
                          <Select
                            mode="multiple"
                            loading={loading.types[index]}
                            value={service.types}
                            onChange={(vals) => handleTypesSelect(index, vals)}
                            placeholder="Select your specializations"
                            size="large"
                          >
                            {(typesMap[index] || []).map(t => (
                              <Option key={t.value} value={t.value}>{t.label}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      )}

                      <Form.Item label="Service Description" required>
                        <Input.TextArea
                          rows={4}
                          value={service.description}
                          onChange={e => {
                            const updated = [...services];
                            updated[index].description = e.target.value;
                            setServices(updated);
                          }}
                          placeholder="Describe your expertise..."
                          size="large"
                        />
                      </Form.Item>
                    </div>
                  ))}

                  <Button type="dashed" onClick={addService} block size="large" className="mb-8">
                    <Plus className="mr-2" /> Add Another Service
                  </Button>

                  <Form.Item label="Languages Spoken" required>
                    <Select mode="multiple" value={selectedLanguages} onChange={setSelectedLanguages} size="large">
                      {languageOptions.map(l => <Option key={l.value} value={l.value}>{l.label}</Option>)}
                    </Select>
                  </Form.Item>

                  <Form.Item label="Preferred Payment Method" required>
                    <Controller
                      name="preferred_method"
                      control={control}
                      rules={{ required: "Required" }}
                      render={({ field }) => (
                        <Select size="large" placeholder="Select method" {...field}>
                          {paymentOptions.map(p => <Option key={p.value} value={p.value}>{p.label}</Option>)}
                        </Select>
                      )}
                    />
                  </Form.Item>

                  <Form.Item>
                    <Controller
                      name="agreed_to_terms"
                      control={control}
                      rules={{ required: "You must agree" }}
                      render={({ field }) => (
                        <Checkbox checked={field.value} onChange={e => field.onChange(e.target.checked)}>
                          I agree to <a href="#" className="text-purple-600">Terms</a> & <a href="#" className="text-purple-600">Privacy Policy</a>
                        </Checkbox>
                      )}
                    />
                    {errors.agreed_to_terms && <div className="ant-form-item-explain-error">{errors.agreed_to_terms.message}</div>}
                  </Form.Item>

                  <div className="flex justify-between mt-12">
                    <Button size="large" onClick={back}><ChevronLeft /> Back</Button>
                    <Button type="primary" htmlType="submit" loading={loading.submitting} size="large"
                      style={{ backgroundColor: '#5C039B', borderColor: '#5C039B' }}>
                      Complete Registration <Check className="ml-2" />
                    </Button>
                  </div>
                </Spin>
              )}
            </Form>
          </div>
        </div>
      </div>

      {/* --- OTP Verification Modal --- */}
      <Modal
        title={<Title level={4} style={{ margin: 0 }}>Verify Mobile Number</Title>}
        open={otpModalVisible}
        onCancel={() => setOtpModalVisible(false)}
        footer={null}
        width={400}
        centered
      >
        <div className="text-center py-4">
          <Text className="block mb-6 text-gray-500">
            Enter the 6-digit code sent to <br /> 
            <strong>{countryCode} {mobileNumber}</strong>
          </Text>
          
          <Input.OTP 
            length={6} 
            value={otpValue} 
            onChange={setOtpValue} 
            size="large"
            style={{ marginBottom: 24 }}
          />

          <Button 
            type="primary" 
            block 
            size="large" 
            loading={loading.otpVerifying}
            onClick={handleVerifyOtp}
            style={{ backgroundColor: '#5C039B', borderColor: '#5C039B' }}
          >
            Verify OTP
          </Button>

          <Button 
            type="link" 
            className="mt-4 text-gray-400" 
            onClick={handleSendOtp}
            disabled={loading.otpSending}
          >
            Resend OTP
          </Button>
        </div>
      </Modal>

    </div>
  );
};

export default Registration;