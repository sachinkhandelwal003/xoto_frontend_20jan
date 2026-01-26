import React, { useState, useEffect, useMemo } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Typography,
  message,
  Spin,
  Modal,
  Select,
  notification // Added notification for error handling
} from "antd";
import { 
  CodeOutlined, 
  SafetyOutlined,
  SafetyCertificateOutlined, // Added for OTP icon
  CheckCircleFilled // Added for verified status
} from "@ant-design/icons";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Country, State, City } from "country-state-city";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const DeveloperRegistration = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  // Location States
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);

  // --- OTP STATES ---
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  const themeColor = "#F97316";

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name: "",
      phone_number: "",
      country_code: "+971", // Default UAE Code
      email: "",
      logo: "",
      description: "",
      websiteUrl: "",
      country: "AE", // Default ISO Code for UAE
      state: "", 
      city: "",
      address: "",
      reraNumber: "",
      documents: [""],
      password: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "documents",
  });

  // Watchers for location logic
  const selectedCountry = watch("country");
  const selectedState = watch("state");

  // Load States when Country changes
  useEffect(() => {
    if (selectedCountry) {
      const updatedStates = State.getStatesOfCountry(selectedCountry);
      setStatesList(updatedStates);
    } else {
      setStatesList([]);
    }
  }, [selectedCountry]);

  // Load Cities when State changes
  useEffect(() => {
    if (selectedState && selectedCountry) {
      const updatedCities = City.getCitiesOfState(selectedCountry, selectedState);
      setCitiesList(updatedCities);
    } else {
      setCitiesList([]);
    }
  }, [selectedState, selectedCountry]);

  // Prepare Phone Codes with Flag Images
  const countryPhoneData = useMemo(() => {
    const allCountries = Country.getAllCountries();
    return allCountries.map((c) => ({
      iso: c.isoCode.toLowerCase(),
      name: c.name,
      phone: `+${c.phonecode}`,
      value: `+${c.phonecode}`,
      searchStr: `${c.name} ${c.phonecode}`,
    }));
  }, []);

  // --- OTP HANDLERS ---
  const handleSendOtp = async () => {
    const countryCode = getValues("country_code");
    const number = getValues("phone_number");

    if (!countryCode || !number) {
        message.error("Please enter a valid phone number first.");
        return;
    }

    setOtpLoading(true);
    try {
        const payload = {
            country_code: countryCode,
            phone_number: number
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
            country_code: getValues("country_code"),
            phone_number: getValues("phone_number"),
            otp: enteredOtp
        };
        await apiService.post("/otp/verify-otp", payload);
        message.success("Phone Verified Successfully!");
        setOtpVerified(true);
        setOtpSent(false); // Hide OTP input
    } catch (error) {
        notification.error({
            message: "Verification Failed",
            description: error?.response?.data?.message || "Invalid OTP"
        });
    } finally {
        setOtpLoading(false);
    }
  };

  const showSuccessPopup = () => {
    Modal.success({
      centered: true,
      title: <div style={{ fontSize: 20, fontWeight: 700 }}>Registration Successful</div>,
      content: (
        <div style={{ marginTop: 10, fontSize: 15, lineHeight: 1.7 }}>
          <div>Your registration has been completed successfully.</div>
          <div>Admin approval is required before you can log in.</div>
        </div>
      ),
      okText: "OK",
      onOk: () => navigate(-1),
    });
  };

  const showAlreadyRegisteredPopup = () => {
    Modal.info({
      centered: true,
      title: <div style={{ fontSize: 20, fontWeight: 700 }}>Already Registered</div>,
      content: (
        <div style={{ marginTop: 10, fontSize: 15, lineHeight: 1.7 }}>
          <div>This email or phone number is already registered.</div>
          <div>Please log in to continue.</div>
        </div>
      ),
      okText: "Go to Login",
      onOk: () => navigate(-1),
    });
  };

  const onSubmit = async (data) => {
    // --- CHECK OTP VERIFICATION ---
    if (!otpVerified) {
        message.error("Please verify your phone number to continue.");
        return;
    }

    setSubmitting(true);

    try {
      const cleanDocuments = (data.documents || []).filter((d) => d && d.trim() !== "");

      // Convert ISO Codes to Names for Backend
      const countryObj = Country.getCountryByCode(data.country);
      const stateObj = State.getStateByCodeAndCountry(data.state, data.country);

      const registerPayload = {
        name: data.name,
        phone_number: data.phone_number,
        country_code: data.country_code,
        email: data.email,
        logo: data.logo || "",
        description: data.description || "",
        websiteUrl: data.websiteUrl || "",
        // Sending Names instead of ISO codes to API
        country: countryObj ? countryObj.name : data.country,
        state: stateObj ? stateObj.name : data.state, 
        city: data.city,
        address: data.address,
        reraNumber: data.reraNumber,
        documents: cleanDocuments,
        password: data.password,
      };

      await apiService.post("/property/create-developer", registerPayload);
      showSuccessPopup();
    } catch (err) {
      console.log("Developer register error:", err);
      const status = err?.response?.status;
      const res = err?.response?.data;
      const apiMsg = res?.message || res?.error || "Registration failed. Please try again.";

      const isAlreadyRegistered =
        status === 409 ||
        apiMsg.toLowerCase().includes("already") ||
        apiMsg.toLowerCase().includes("exist") ||
        apiMsg.toLowerCase().includes("duplicate");

      if (isAlreadyRegistered) {
        showAlreadyRegisteredPopup();
      } else {
        message.error(apiMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-primary)] flex items-center justify-center py-10 px-4">
      <div style={{ maxWidth: 1100, width: "100%" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 30, color: "white" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 80,
              height: 80,
              background: "rgba(255,255,255,0.2)",
              borderRadius: "50%",
              marginBottom: 14,
              backdropFilter: "blur(10px)",
            }}
          >
            <CodeOutlined style={{ fontSize: 36, color: "#fff" }} />
          </div>

          <Title level={2} style={{ color: "#fff", margin: 0 }}>
            Developer Registration
          </Title>

          <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 16 }}>
            Register your developer profile (Admin approval required)
          </Text>
        </div>

        {/* Form Card */}
        <Row justify="center">
          <Col xs={24} lg={18}>
            <Card
              bordered={false}
              style={{
                borderRadius: 16,
                boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                background: "#fff",
              }}
              bodyStyle={{ padding: 40 }}
            >
              <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
                <Spin spinning={submitting}>
                  <Title level={4} style={{ marginBottom: 20, color: "#333" }}>
                    <CodeOutlined style={{ color: themeColor }} /> Developer Details
                  </Title>

                  {/* Company Name */}
                  <Form.Item
                    label="Company Name"
                    required
                    validateStatus={errors.name ? "error" : ""}
                    help={errors.name?.message}
                  >
                    <Controller
                      name="name"
                      control={control}
                      rules={{ required: "Company name is required" }}
                      render={({ field }) => (
                        <Input size="large" placeholder="Company Name" {...field} />
                      )}
                    />
                  </Form.Item>

                  {/* Email */}
                  <Form.Item
                    label="Email"
                    required
                    validateStatus={errors.email ? "error" : ""}
                    help={errors.email?.message}
                  >
                    <Controller
                      name="email"
                      control={control}
                      rules={{
                        required: "Email is required",
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: "Enter a valid email",
                        },
                      }}
                      render={({ field }) => (
                        <Input size="large" placeholder="Email" {...field} />
                      )}
                    />
                  </Form.Item>

                  {/* ================= PHONE NUMBER SECTION WITH OTP ================= */}
                  <div className="mb-6">
                    <Form.Item label="Phone Number" required validateStatus={errors.phone_number ? "error" : ""} help={errors.phone_number?.message} style={{marginBottom: 0}}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                            {/* Country Code */}
                            <div style={{ width: '130px' }}>
                                <Controller
                                    name="country_code"
                                    control={control}
                                    rules={{ required: "Required" }}
                                    render={({ field }) => (
                                        <Select
                                            size="large"
                                            showSearch
                                            disabled={otpVerified || otpSent} // Lock if verifying
                                            optionFilterProp="children"
                                            filterOption={(input, option) => (option["data-search"] || "").toLowerCase().includes(input.toLowerCase())}
                                            {...field}
                                            style={{ width: "100%" }}
                                        >
                                            {countryPhoneData.map((country, index) => (
                                                <Option key={`${country.iso}-${index}`} value={country.value} data-search={country.searchStr}>
                                                    <div style={{ display: "flex", alignItems: "center" }}>
                                                        <img src={`https://flagcdn.com/w20/${country.iso}.png`} width="20" alt={country.name} style={{ marginRight: 6 }} />
                                                        <span>{country.phone}</span>
                                                    </div>
                                                </Option>
                                            ))}
                                        </Select>
                                    )}
                                />
                            </div>

                            {/* Phone Number Input */}
                            <div style={{ flex: 1 }}>
                                <Controller
                                    name="phone_number"
                                    control={control}
                                    rules={{
                                        required: "Phone number is required",
                                        validate: (value) => {
                                            const countryCode = getValues("country_code");
                                            if (!countryCode) return "Select code first";
                                            const fullNumber = `${countryCode}${value}`;
                                            const phoneNumber = parsePhoneNumberFromString(fullNumber);
                                            return (phoneNumber && phoneNumber.isValid()) || `Invalid length for ${countryCode}`;
                                        },
                                    }}
                                    render={({ field }) => (
                                        <Input
                                            size="large"
                                            placeholder="e.g. 501234567"
                                            maxLength={15}
                                            disabled={otpVerified || otpSent} // Lock if verifying
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e.target.value.replace(/\D/g, ""));
                                                setOtpSent(false); // Reset on change
                                                setOtpVerified(false);
                                            }}
                                        />
                                    )}
                                />
                            </div>

                            {/* Send OTP Button */}
                            {!otpVerified && !otpSent && (
                                <Button 
                                    type="primary" 
                                    size="large"
                                    style={{ backgroundColor: '#333', borderColor: '#333' }}
                                    onClick={handleSendOtp}
                                    loading={otpLoading}
                                >
                                    Send OTP
                                </Button>
                            )}

                            {/* Change Number Button */}
                            {otpSent && !otpVerified && (
                                <Button 
                                    danger 
                                    size="large"
                                    onClick={() => { setOtpSent(false); setEnteredOtp(""); }}
                                >
                                    Change
                                </Button>
                            )}
                        </div>
                    </Form.Item>

                    {/* OTP Verify Input Section */}
                    {otpSent && !otpVerified && (
                        <div style={{ marginTop: 16, display: 'flex', gap: 8, animation: 'fadeIn 0.3s ease' }}>
                            <div style={{ flex: 1 }}>
                                <Input 
                                    size="large"
                                    placeholder="Enter 6-digit OTP"
                                    prefix={<SafetyCertificateOutlined style={{ color: themeColor }}/>} 
                                    value={enteredOtp}
                                    onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ""))}
                                    maxLength={6}
                                />
                                <Text type="secondary" style={{ fontSize: 12, marginLeft: 4 }}>
                                    OTP sent to {getValues('country_code')} {getValues('phone_number')}
                                </Text>
                            </div>
                            <Button 
                                type="primary" 
                                size="large" 
                                onClick={handleVerifyOtp} 
                                loading={otpLoading}
                                style={{ background: themeColor, borderColor: themeColor }}
                            >
                                Verify
                            </Button>
                        </div>
                    )}

                    {/* Verified Success Indicator */}
                    {otpVerified && (
                        <div style={{ marginTop: 8, color: '#52c41a', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
                            <CheckCircleFilled /> Phone Verified Successfully
                        </div>
                    )}
                  </div>
                  {/* ================= END PHONE SECTION ================= */}

                  {/* Logo */}
                  <Form.Item label="Logo URL (Optional)">
                    <Controller
                      name="logo"
                      control={control}
                      render={({ field }) => (
                        <Input size="large" placeholder="Logo URL" {...field} />
                      )}
                    />
                  </Form.Item>

                  {/* Website */}
                  <Form.Item label="Website (Optional)">
                    <Controller
                      name="websiteUrl"
                      control={control}
                      render={({ field }) => (
                        <Input size="large" placeholder="Website URL" {...field} />
                      )}
                    />
                  </Form.Item>

                  {/* Description */}
                  <Form.Item label="Description (Optional)">
                    <Controller
                      name="description"
                      control={control}
                      render={({ field }) => (
                        <TextArea
                          rows={4}
                          showCount
                          maxLength={500}
                          placeholder="Description"
                          {...field}
                        />
                      )}
                    />
                  </Form.Item>

                  {/* Location Section (Dynamic) */}
                  <Row gutter={16}>
                    <Col xs={24} md={8}>
                      <Form.Item
                        label="Country"
                        required
                        validateStatus={errors.country ? "error" : ""}
                        help={errors.country?.message}
                      >
                        <Controller
                          name="country"
                          control={control}
                          rules={{ required: "Country is required" }}
                          render={({ field }) => (
                            <Select
                              size="large"
                              showSearch
                              placeholder="Select Country"
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.children
                                  ?.toLowerCase()
                                  .indexOf(input.toLowerCase()) >= 0
                              }
                              onChange={(val) => {
                                field.onChange(val);
                                setValue("state", undefined);
                                setValue("city", undefined);
                              }}
                              value={field.value}
                            >
                              {Country.getAllCountries().map((country) => (
                                <Option key={country.isoCode} value={country.isoCode}>
                                  {country.name}
                                </Option>
                              ))}
                            </Select>
                          )}
                        />
                      </Form.Item>
                    </Col>

                    {/* Added State Field (Necessary for City logic) */}
                    <Col xs={24} md={8}>
                      <Form.Item
                        label="State / Province"
                        // required // Optional based on if country has states
                      >
                        <Controller
                          name="state"
                          control={control}
                          render={({ field }) => (
                            <Select
                              size="large"
                              showSearch
                              placeholder="Select State"
                              disabled={!statesList.length}
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.children
                                  ?.toLowerCase()
                                  .indexOf(input.toLowerCase()) >= 0
                              }
                              onChange={(val) => {
                                field.onChange(val);
                                setValue("city", undefined);
                              }}
                              value={field.value}
                            >
                              {statesList.map((state) => (
                                <Option key={state.isoCode} value={state.isoCode}>
                                  {state.name}
                                </Option>
                              ))}
                            </Select>
                          )}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                      <Form.Item
                        label="City"
                        required
                        validateStatus={errors.city ? "error" : ""}
                        help={errors.city?.message}
                      >
                        <Controller
                          name="city"
                          control={control}
                          rules={{ required: "City is required" }}
                          render={({ field }) =>
                            citiesList.length > 0 ? (
                              <Select
                                size="large"
                                showSearch
                                placeholder="Select City"
                                optionFilterProp="children"
                                {...field}
                              >
                                {citiesList.map((city) => (
                                  <Option key={city.name} value={city.name}>
                                    {city.name}
                                  </Option>
                                ))}
                              </Select>
                            ) : (
                              <Input size="large" placeholder="City" {...field} />
                            )
                          }
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    label="RERA Number"
                    required
                    validateStatus={errors.reraNumber ? "error" : ""}
                    help={errors.reraNumber?.message}
                  >
                    <Controller
                      name="reraNumber"
                      control={control}
                      rules={{ required: "RERA Number is required" }}
                      render={({ field }) => (
                        <Input size="large" placeholder="RERA Number" {...field} />
                      )}
                    />
                  </Form.Item>

                  {/* Address */}
                  <Form.Item
                    label="Full Address"
                    required
                    validateStatus={errors.address ? "error" : ""}
                    help={errors.address?.message}
                  >
                    <Controller
                      name="address"
                      control={control}
                      rules={{ required: "Address is required" }}
                      render={({ field }) => (
                        <Input size="large" placeholder="Building No, Street Name..." {...field} />
                      )}
                    />
                  </Form.Item>

                  {/* Documents */}
                  <Form.Item label="Documents (Links)">
                    {fields.map((item, index) => (
                      <div
                        key={item.id}
                        style={{ display: "flex", gap: 10, marginBottom: 12 }}
                      >
                        <Controller
                          name={`documents.${index}`}
                          control={control}
                          render={({ field }) => (
                            <Input
                              size="large"
                              placeholder="Document URL"
                              {...field}
                            />
                          )}
                        />
                        <Button
                          danger
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="dashed"
                      onClick={() => append("")}
                      style={{ width: "100%" }}
                    >
                      Add More Documents
                    </Button>
                  </Form.Item>

                  {/* Password */}
                  <Form.Item
                    label="Password"
                    required
                    validateStatus={errors.password ? "error" : ""}
                    help={errors.password?.message}
                  >
                    <Controller
                      name="password"
                      control={control}
                      rules={{
                        required: "Password is required",
                        minLength: { value: 4, message: "Minimum 4 characters" },
                      }}
                      render={({ field }) => (
                        <Input.Password
                          size="large"
                          placeholder="Password"
                          {...field}
                        />
                      )}
                    />
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    loading={submitting}
                    style={{
                      height: 52,
                      background: themeColor,
                      borderColor: themeColor,
                      fontWeight: "bold",
                      fontSize: 16,
                      borderRadius: 12,
                    }}
                  >
                    Register Developer
                  </Button>

                  <div style={{ marginTop: 16, textAlign: "center" }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      <SafetyOutlined style={{ color: "#52c41a" }} /> Your data is
                      encrypted and secure.
                    </Text>
                  </div>
                </Spin>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
      
      {/* CSS for fading in the OTP box */}
      <style jsx global>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default DeveloperRegistration;