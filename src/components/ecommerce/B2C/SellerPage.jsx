import React, { useState, useEffect, useMemo } from "react";
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
  notification,
  Upload,
  Divider,
} from "antd";
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
  EditOutlined,
  BankOutlined,
  TeamOutlined,
  CloudUploadOutlined,
  PlusOutlined,
  LinkOutlined,
  LoadingOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { Country, State, City } from "country-state-city";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// --- ROBUST GENERIC UPLOADER COMPONENT ---
const GenericUploader = ({ value, onChange, label, listType = "text" }) => {
  const [loading, setLoading] = useState(false);

  const handleCustomRequest = async ({ file, onSuccess, onError }) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      console.log(`Uploading ${label}...`);
      const response = await apiService.post(`/upload`, formData);

      // Handle both standard Axios response and direct data response
      const responseBody = response.data || response;

      // Deep search for the URL based on common API patterns
      const url =
        responseBody.url ||
        responseBody.secure_url ||
        responseBody.file?.url ||
        responseBody.file?.location ||
        responseBody.file?.path ||
        responseBody.data?.url ||
        (typeof responseBody === "string" ? responseBody : null);

      if (url) {
        onChange(url);
        onSuccess("ok");
        message.success(`${label} uploaded!`);
      } else {
        throw new Error("Server returned success, but image URL was missing.");
      }
    } catch (err) {
      console.error("Upload Error:", err);
      onError(err);
      message.error(`Failed to upload ${label}.`);
    } finally {
      setLoading(false);
    }
  };

  // 1. IMAGE CARD VIEW (For Logo)
  if (listType === "picture-card") {
    return (
      <Upload
        name="avatar"
        listType="picture-card"
        className="avatar-uploader"
        showUploadList={false}
        customRequest={handleCustomRequest}
      >
        {value ? (
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <img
              src={value}
              alt={label}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                padding: 5,
                borderRadius: 8,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: -5,
                right: -5,
                background: "white",
                borderRadius: "50%",
                padding: 4,
                cursor: "pointer",
                border: "1px solid #eee",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
            >
              <DeleteOutlined className="text-red-500" />
            </div>
          </div>
        ) : (
          <div>
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>
              {loading ? "Uploading" : "Upload"}
            </div>
          </div>
        )}
      </Upload>
    );
  }

  // 2. DRAGGER VIEW (For Documents)
  return (
    <Upload.Dragger
      showUploadList={false}
      customRequest={handleCustomRequest}
      height={120}
      style={{
        backgroundColor: value ? "#f6ffed" : "#fafafa",
        border: value ? "1px dashed #52c41a" : "1px dashed #d9d9d9",
        borderRadius: 8,
      }}
    >
      {loading ? (
        <div className="py-4">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
          <p style={{ marginTop: 10 }}>Uploading...</p>
        </div>
      ) : value ? (
        <div className="py-4">
          <CheckCircleFilled
            style={{ fontSize: 32, color: "#52c41a", marginBottom: 10 }}
          />
          <p className="font-semibold text-green-600">Uploaded Successfully</p>
          <p className="text-xs text-gray-400 break-all px-4">
            {value.split("/").pop() || "View File"}
          </p>
          <Button
            size="small"
            type="text"
            danger
            style={{ marginTop: 5 }}
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
          >
            Remove / Re-upload
          </Button>
        </div>
      ) : (
        <div className="py-4">
          <p className="ant-upload-drag-icon">
            <CloudUploadOutlined />
          </p>
          <p className="ant-upload-text">Click to upload {label}</p>
        </div>
      )}
    </Upload.Dragger>
  );
};

const SellerPage = () => {
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

  const themeColor = "var(--color-primary)";



  const {
    control,
    handleSubmit,
    trigger,
    setError,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      mobile: { country_code: "+971" }, // UAE Default
      store_details: {
        country: "AE", // UAE Default ISO
        social_links: {
          facebook: "",
          instagram: "",
          twitter: "",
          linkedin: "",
          youtube: "",
        },
      },
      operations: { delivery_modes: [], avg_delivery_time_days: 3 },
      contacts: {
        primary_contact: { designation: "Owner" },
        support_contact: { designation: "Support Manager" },
      },
      documents: {},
    },
  });

  const selectedCountry = watch("store_details.country");
  const selectedState = watch("store_details.state");
  const watchedLogo = watch("store_details.logo");

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
      const updatedCities = City.getCitiesOfState(
        selectedCountry,
        selectedState,
      );
      setCitiesList(updatedCities);
    } else {
      setCitiesList([]);
    }
  }, [selectedState, selectedCountry]);

  const businessTypes = [
    {
      label: "Individual / Sole Proprietor",
      value: "Individual / Sole Proprietor",
    },
    { label: "Private Limited", value: "Private Limited" },
    { label: "Partnership", value: "Partnership" },
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await apiService.get(
        "/products/get-all-category?limit=100",
      );
      const categoryData = response.data?.data || response.data || response;
      if (Array.isArray(categoryData)) {
        setCategories(
          categoryData.map((c) => ({ label: c.name, value: c._id })),
        );
      } else if (categoryData.categories) {
        setCategories(
          categoryData.categories.map((c) => ({
            label: c.parent ? `${c.name} (${c.parent.name})` : c.name,
            value: c._id,
          })),
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: "Personal", icon: <UserOutlined /> },
    { title: "Store Info", icon: <ShopOutlined /> },
    { title: "Business & Bank", icon: <BankOutlined /> },
    { title: "Contacts", icon: <TeamOutlined /> },
    { title: "Documents", icon: <CloudUploadOutlined /> },
  ];

  // --- MOBILE OTP HANDLERS ---
  const handleSendOtp = async () => {
    const countryCode = getValues("mobile.country_code");
    const number = getValues("mobile.number");

    if (!countryCode || !number) {
      message.error("Please enter a valid mobile number first.");
      return;
    }

    setOtpLoading(true);
    try {
      const payload = { country_code: countryCode, phone_number: number };
      // await apiService.post("/otp/send-otp", payload);
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
        country_code: getValues("mobile.country_code"),
        phone_number: getValues("mobile.number"),
        otp: enteredOtp,
      };
      await apiService.post("/otp/verify-otp", payload);
      message.success("Mobile Verified Successfully!");
      setOtpVerified(true);
      setOtpSent(false);
    } catch (error) {
      const errMsg = error?.response?.data?.message || "Invalid OTP";
      notification.error({
        message: "Verification Failed",
        description: errMsg,
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleChangeNumber = () => {
    setOtpSent(false);
    setOtpVerified(false);
    setEnteredOtp("");
  };

  // --- EMAIL OTP HANDLERS ---
  const handleSendEmailOtp = async () => {
    const email = getValues("email");
    if (!email) {
      message.error("Please enter a valid email first.");
      return;
    }
    setEmailOtpLoading(true);
    try {
      const payload = { email: email };
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
      const payload = { email: getValues("email"), otp: enteredEmailOtp };
      await apiService.post("/otp/email-otp/verify", payload);
      message.success("Email Verified Successfully!");
      setEmailOtpVerified(true);
      setEmailOtpSent(false);
    } catch (error) {
      const errMsg = error?.response?.data?.message || "Invalid OTP";
      notification.error({
        message: "Verification Failed",
        description: errMsg,
      });
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
   

        message.error("Please verify mobile and email first.");
        return;
      }
      fieldsToValidate = [
        "first_name",
        "last_name",
        "email",
        "mobile.country_code",
        "mobile.number",
        "password",
        "confirmPassword",
      ];
    } else if (currentStep === 1) {
      fieldsToValidate = [
        "store_details.store_name",
        "store_details.store_type",
        "store_details.categories",
        "store_details.store_description",
        "store_details.store_address",
        "store_details.country",
        "store_details.state",
        "store_details.city",
        "store_details.pincode",
      ];
    } else if (currentStep === 2) {
      // Updated validation fields for UAE
      fieldsToValidate = [
        "registration.trade_license_number",
        "registration.trn_number",
        "bank_details.bank_account_number",
        "bank_details.iban",
        "bank_details.account_holder_name",
        "bank_details.bank_name",
      ];
    } else if (currentStep === 3) {
      fieldsToValidate = [
        "contacts.primary_contact.name",
        "contacts.primary_contact.mobile",
        "contacts.primary_contact.email",
      ];
    } else if (currentStep === 4) {
      // Updated doc validation
      fieldsToValidate = [
        "meta.agreed_to_terms",
        "documents.trade_license",
        "documents.emirates_id",
      ];
    }

    const result = await trigger(fieldsToValidate);
    if (result) setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentStep === 0) window.history.back();
    else setCurrentStep((prev) => prev - 1);
  };

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      message.error("Passwords do not match");
      return;
    }
    if (!data.meta?.agreed_to_terms) {
      message.error("You must agree to the terms.");
      return;
    }

    setSubmitting(true);
    setApiErrors({});

    const countryObj = Country.getCountryByCode(data.store_details.country);
    const stateObj = State.getStateByCodeAndCountry(
      data.store_details.state,
      data.store_details.country,
    );

    const payload = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      mobile: {
        country_code: data.mobile.country_code,
        number: data.mobile.number,
      },
      password: data.password,
      confirmPassword: data.confirmPassword,
      is_email_verified: emailOtpVerified, // Send verification status
      is_mobile_verified: otpVerified,     // Send verification status

      store_details: {
        store_name: data.store_details.store_name,
        store_description: data.store_details.store_description,
        store_type: data.store_details.store_type,
        store_address: data.store_details.store_address,
        country: countryObj ? countryObj.name : data.store_details.country,
        state: stateObj ? stateObj.name : data.store_details.state,
        city: data.store_details.city,
        pincode: data.store_details.pincode,
        categories: data.store_details.categories,
        website: data.store_details.website,
        logo: data.store_details.logo,
        social_links: data.store_details.social_links,
      },

      // UAE Specific Fields Mapping
      registration: {
        trade_license_number: data.registration.trade_license_number, // Was PAN
        trn_number: data.registration.trn_number, // Was GSTIN
        chamber_of_commerce: data.registration.chamber_of_commerce, // Was Shop Act
      },

      bank_details: {
        ...data.bank_details,
              },

      contacts: data.contacts,

      documents: {
        trade_license: {
          type: "Trade License",
          path: data.documents.trade_license,
        },
        vat_certificate: {
          type: "VAT Certificate",
          path: data.documents.vat_certificate,
        },
        emirates_id: { type: "Emirates ID", path: data.documents.emirates_id },
        bank_letter: {
          type: "Bank Letter/Cheque",
          path: data.documents.bank_letter,
        },
        moa_document: { type: "MOA", path: data.documents.moa_document },
      },

      operations: {
        ...data.operations,
        avg_delivery_time_days: Number(data.operations.avg_delivery_time_days),
      },

      meta: { agreed_to_terms: data.meta.agreed_to_terms },
    };

    try {
      await apiService.post("/vendor/register", payload);
      setSuccess(true);
      message.success("Registration successful! Awaiting approval.");
    } catch (err) {
      const res = err.response?.data;
      if (res?.errors && Array.isArray(res.errors)) {
        res.errors.forEach((e) =>
          setError(e.field, { type: "server", message: e.message }),
        );
        notification.error({
          message: "Validation Error",
          description: res.errors[0]?.message,
        });
      } else {
        message.error(res?.message || "Registration failed.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--color-primary)] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleFilled style={{ fontSize: "48px", color: "#52c41a" }} />
          </div>
          <Title level={2}>Registration Successful!</Title>
          <Text
            type="secondary"
            style={{ display: "block", marginBottom: "32px" }}
          >
            Your account is under review.
          </Text>
          <Button
            type="primary"
            size="large"
            href="/login"
            block
            style={{ background: themeColor, borderColor: themeColor }}
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-primary)] flex items-center justify-center py-10 px-4">
      <div style={{ maxWidth: 1200, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 40, color: "white" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 80,
              height: 80,
              background: "rgba(255,255,255,0.2)",
              borderRadius: "50%",
              marginBottom: 20,
              backdropFilter: "blur(10px)",
            }}
          >
            <ShopOutlined style={{ fontSize: 36, color: "#fff" }} />
          </div>
          <Title level={2} style={{ color: "#fff", margin: 0 }}>
            Vendor Registration (UAE)
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 16 }}>
            Join the UAE's leading marketplace
          </Text>
        </div>

        <Row gutter={[32, 32]}>
          <Col xs={24} lg={6}>
            <Card
              bordered={false}
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
                height: "100%",
              }}
              bodyStyle={{ padding: 32 }}
            >
              <Steps direction="vertical" current={currentStep}>
                {steps.map((s, index) => (
                  <Steps.Step
                    key={index}
                    title={
                      <span
                        style={{
                          color:
                            currentStep >= index
                              ? "#fff"
                              : "rgba(255,255,255,0.5)",
                          fontWeight: "bold",
                        }}
                      >
                        {s.title}
                      </span>
                    }
                    icon={
                      <div
                        style={{
                          background:
                            currentStep >= index ? "#fff" : "transparent",
                          color:
                            currentStep >= index
                              ? themeColor
                              : "rgba(255,255,255,0.5)",
                          border: `1px solid ${currentStep >= index ? "#fff" : "rgba(255,255,255,0.5)"}`,
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {currentStep > index ? <CheckCircleOutlined /> : s.icon}
                      </div>
                    }
                  />
                ))}
              </Steps>
            </Card>
          </Col>

          <Col xs={24} lg={18}>
            <Card
              bordered={false}
              style={{
                borderRadius: 16,
                boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              }}
              bodyStyle={{ padding: 40 }}
            >
              <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
                <Spin spinning={submitting}>
                  {/* STEP 0: PERSONAL */}
                  <div
                    style={{ display: currentStep === 0 ? "block" : "none" }}
                  >
                    <Title level={4} className="mb-6 text-gray-700">
                      <UserOutlined /> Personal Information
                    </Title>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="First Name"
                          required
                          validateStatus={errors.first_name ? "error" : ""}
                          help={errors.first_name?.message}
                        >
                          <Controller
                            name="first_name"
                            control={control}
                            rules={{ required: "Required" }}
                            render={({ field }) => (
                              <Input size="large" {...field} />
                            )}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Last Name"
                          required
                          validateStatus={errors.last_name ? "error" : ""}
                          help={errors.last_name?.message}
                        >
                          <Controller
                            name="last_name"
                            control={control}
                            rules={{ required: "Required" }}
                            render={({ field }) => (
                              <Input size="large" {...field} />
                            )}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* Email Field with OTP */}
                    <Form.Item
                      label="Email"
                      required
                      validateStatus={errors.email ? "error" : ""}
                      help={errors.email?.message}
                    >
                      <div className="flex gap-2">
                        <Controller
                          name="email"
                          control={control}
                          rules={{
                            required: "Required",
                            pattern: {
                              value: /^\S+@\S+$/i,
                              message: "Invalid email",
                            },
                          }}
                          render={({ field }) => (
                            <Input
                              size="large"
                              {...field}
                              disabled={emailOtpVerified}
                            />
                          )}
                        />
                        <Button
                          onClick={
                            !emailOtpVerified
                              ? handleSendEmailOtp
                              : handleChangeEmail
                          }
                          type={emailOtpVerified ? "default" : "primary"}
                          loading={emailOtpLoading}
                        >
                          {emailOtpVerified ? "Change" : "Send OTP"}
                        </Button>
                      </div>
                      {emailOtpSent && !emailOtpVerified && (
                        <div className="mt-2 flex gap-2">
                          <Input
                            placeholder="Enter Email OTP"
                            value={enteredEmailOtp}
                            onChange={(e) => setEnteredEmailOtp(e.target.value)}
                          />
                          <Button onClick={handleVerifyEmailOtp} type="primary">
                            Verify
                          </Button>
                        </div>
                      )}
                      {emailOtpVerified && (
                        <span className="text-green-500">
                          <CheckCircleFilled /> Verified
                        </span>
                      )}
                    </Form.Item>

                    {/* Mobile Field with OTP and LibPhoneNumber Validation */}
                    <Form.Item
                      label="Mobile"
                      required
                      validateStatus={errors.mobile?.number ? "error" : ""}
                      help={errors.mobile?.number?.message}
                    >
                      <div className="flex gap-2">
                        <div style={{ width: 100 }}>
                          <Controller
                            name="mobile.country_code"
                            control={control}
                            render={({ field }) => (
                              <Select {...field} disabled={otpVerified}>
                                {countryPhoneData.map((c) => (
                                  <Option key={c.iso} value={c.value}>
                                    {c.phone}
                                  </Option>
                                ))}
                              </Select>
                            )}
                          />
                        </div>
                        <Controller
                          name="mobile.number"
                          control={control}
                          rules={{
                            required: "Required",
                            validate: (value) => {
                              const countryCode = getValues(
                                "mobile.country_code",
                              );
                              if (!countryCode) return "Select code";
                              const fullNumber = `${countryCode}${value}`;
                              const phoneNumber =
                                parsePhoneNumberFromString(fullNumber);
                              return (
                                (phoneNumber && phoneNumber.isValid()) ||
                                "Invalid mobile number"
                              );
                            },
                          }}
                          render={({ field }) => (
                            <Input
                              size="large"
                              {...field}
                              disabled={otpVerified}
                              className="w-full"
                              onChange={(e) => {
                                field.onChange(
                                  e.target.value.replace(/\D/g, ""),
                                );
                                if (otpVerified) setOtpVerified(false);
                              }}
                            />
                          )}
                        />
                        <Button
                          onClick={
                            !otpVerified ? handleSendOtp : handleChangeNumber
                          }
                          type={otpVerified ? "default" : "primary"}
                          loading={otpLoading}
                        >
                          {otpVerified ? "Change" : "Send OTP"}
                        </Button>
                      </div>
                      {otpSent && !otpVerified && (
                        <div className="mt-2 flex gap-2">
                          <Input
                            placeholder="Enter Mobile OTP"
                            value={enteredOtp}
                            onChange={(e) => setEnteredOtp(e.target.value)}
                          />
                          <Button onClick={handleVerifyOtp} type="primary">
                            Verify
                          </Button>
                        </div>
                      )}
                      {otpVerified && (
                        <span className="text-green-500">
                          <CheckCircleFilled /> Verified
                        </span>
                      )}
                    </Form.Item>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="Password"
                          required
                          help={errors.password?.message}
                        >
                          <Controller
                            name="password"
                            control={control}
                            rules={{
                              required: "Required",
                              minLength: { value: 6, message: "Min 6 chars" },
                            }}
                            render={({ field }) => (
                              <Input.Password size="large" {...field} />
                            )}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Confirm Password"
                          required
                          help={errors.confirmPassword?.message}
                        >
                          <Controller
                            name="confirmPassword"
                            control={control}
                            rules={{ required: "Required" }}
                            render={({ field }) => (
                              <Input.Password size="large" {...field} />
                            )}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>

                  {/* STEP 1: STORE & OPERATIONS */}
                  <div
                    style={{ display: currentStep === 1 ? "block" : "none" }}
                  >
                    <Title level={4} className="mb-6 text-gray-700">
                      <ShopOutlined /> Store Details
                    </Title>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="Store Name"
                          required
                          help={errors.store_details?.store_name?.message}
                        >
                          <Controller
                            name="store_details.store_name"
                            control={control}
                            rules={{ required: "Required" }}
                            render={({ field }) => (
                              <Input size="large" {...field} />
                            )}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Business Type" required>
                          <Controller
                            name="store_details.store_type"
                            control={control}
                            rules={{ required: "Required" }}
                            render={({ field }) => (
                              <Select
                                size="large"
                                options={businessTypes}
                                {...field}
                              />
                            )}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item label="Website">
                      <Controller
                        name="store_details.website"
                        control={control}
                        render={({ field }) => (
                          <Input
                            size="large"
                            prefix={<LinkOutlined />}
                            placeholder="https://"
                            {...field}
                          />
                        )}
                      />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="Store Logo">
                          <Controller
                            name="store_details.logo"
                            control={control}
                            render={({ field }) => (
                              <GenericUploader
                                value={field.value}
                                onChange={field.onChange}
                                label="Store Logo"
                                listType="picture-card"
                              />
                            )}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Description">
                          <Controller
                            name="store_details.store_description"
                            control={control}
                            render={({ field }) => (
                              <TextArea rows={4} {...field} />
                            )}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      label="Categories"
                      required
                      help={errors.store_details?.categories?.message}
                    >
                      <Controller
                        name="store_details.categories"
                        control={control}
                        rules={{ required: "Required" }}
                        render={({ field }) => (
                          <Select
                            mode="multiple"
                            size="large"
                            options={categories}
                            {...field}
                          />
                        )}
                      />
                    </Form.Item>

                    <Divider>Location</Divider>
                    <Form.Item
                      label="Address"
                      required
                      help={errors.store_details?.store_address?.message}
                    >
                      <Controller
                        name="store_details.store_address"
                        control={control}
                        rules={{ required: "Required" }}
                        render={({ field }) => (
                          <Input size="large" {...field} />
                        )}
                      />
                    </Form.Item>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="Country" required>
                          <Controller
                            name="store_details.country"
                            control={control}
                            rules={{ required: "Required" }}
                            render={({ field }) => (
                              <Select
                                size="large"
                                showSearch
                                optionFilterProp="children"
                                onChange={(val) => {
                                  field.onChange(val);
                                  setValue("store_details.state", null);
                                }}
                                value={field.value}
                              >
                                {Country.getAllCountries().map((c) => (
                                  <Option key={c.isoCode} value={c.isoCode}>
                                    {c.name}
                                  </Option>
                                ))}
                              </Select>
                            )}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="State / Emirate" required>
                          <Controller
                            name="store_details.state"
                            control={control}
                            rules={{ required: "Required" }}
                            render={({ field }) => (
                              <Select
                                size="large"
                                showSearch
                                optionFilterProp="children"
                                onChange={(val) => {
                                  field.onChange(val);
                                  setValue("store_details.city", null);
                                }}
                                value={field.value}
                              >
                                {statesList.map((s) => (
                                  <Option key={s.isoCode} value={s.isoCode}>
                                    {s.name}
                                  </Option>
                                ))}
                              </Select>
                            )}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="City" required>
                          <Controller
                            name="store_details.city"
                            control={control}
                            rules={{ required: "Required" }}
                            render={({ field }) => (
                              <Select
                                size="large"
                                showSearch
                                optionFilterProp="children"
                                {...field}
                              >
                                {citiesList.map((c) => (
                                  <Option key={c.name} value={c.name}>
                                    {c.name}
                                  </Option>
                                ))}
                              </Select>
                            )}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="PO Box / Zip Code"
                          required
                          help={errors.store_details?.pincode?.message}
                        >
                          <Controller
                            name="store_details.pincode"
                            control={control}
                            rules={{ required: "Required" }}
                            render={({ field }) => (
                              <Input size="large" {...field} />
                            )}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Divider>Social Media</Divider>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="Facebook">
                          <Controller
                            name="store_details.social_links.facebook"
                            control={control}
                            render={({ field }) => <Input {...field} />}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Instagram">
                          <Controller
                            name="store_details.social_links.instagram"
                            control={control}
                            render={({ field }) => <Input {...field} />}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Divider>Operations</Divider>
                    <Form.Item label="Delivery Modes">
                      <Controller
                        name="operations.delivery_modes"
                        control={control}
                        render={({ field }) => (
                          <Checkbox.Group
                            options={["self", "courier", "pickup"]}
                            {...field}
                          />
                        )}
                      />
                    </Form.Item>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="Return Policy">
                          <Controller
                            name="operations.return_policy"
                            control={control}
                            render={({ field }) => (
                              <Input
                                placeholder="e.g. 7 days return"
                                {...field}
                              />
                            )}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Avg Delivery (Days)">
                          <Controller
                            name="operations.avg_delivery_time_days"
                            control={control}
                            render={({ field }) => (
                              <Input type="number" {...field} />
                            )}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>

                  {/* STEP 2: BUSINESS & BANK (UAE UPDATE) */}
                  <div
                    style={{ display: currentStep === 2 ? "block" : "none" }}
                  >
                    <Title level={4} className="mb-6 text-gray-700">
                      <FileTextOutlined /> Business Registration (UAE)
                    </Title>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="Trade License Number"
                          required
                          help={
                            errors.registration?.trade_license_number?.message
                          }
                        >
                          <Controller
                            name="registration.trade_license_number"
                            control={control}
                            rules={{ required: "Required" }}
                            render={({ field }) => (
                              <Input
                                size="large"
                                placeholder="License No."
                                {...field}
                              />
                            )}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="VAT / TRN Number"
                          required
                          help={errors.registration?.trn_number?.message}
                        >
                          <Controller
                            name="registration.trn_number"
                            control={control}
                            rules={{ required: "Required" }}
                            render={({ field }) => (
                              <Input
                                size="large"
                                placeholder="Tax Registration No."
                                {...field}
                              />
                            )}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="Chamber of Commerce No.">
                          <Controller
                            name="registration.chamber_of_commerce"
                            control={control}
                            render={({ field }) => (
                              <Input size="large" {...field} />
                            )}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Title level={4} className="mt-6 mb-6 text-gray-700">
                      <BankOutlined /> Bank Details (UAE)
                    </Title>
                    <Form.Item
                      label="Account Holder Name"
                      required
                      help={errors.bank_details?.account_holder_name?.message}
                    >
                      <Controller
                        name="bank_details.account_holder_name"
                        control={control}
                        rules={{ required: "Required" }}
                        render={({ field }) => (
                          <Input size="large" {...field} />
                        )}
                      />
                    </Form.Item>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="Bank Name"
                          required
                          help={errors.bank_details?.bank_name?.message}
                        >
                          <Controller
                            name="bank_details.bank_name"
                            control={control}
                            rules={{ required: "Required" }}
                            render={({ field }) => (
                              <Input size="large" {...field} />
                            )}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Account Number"
                          required
                          help={
                            errors.bank_details?.bank_account_number?.message
                          }
                        >
                          <Controller
                            name="bank_details.bank_account_number"
                            control={control}
                            rules={{ required: "Required" }}
                            render={({ field }) => (
                              <Input size="large" {...field} />
                            )}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="IBAN"
                          required
                          help={errors.bank_details?.iban?.message}
                        >
                          <Controller
                            name="bank_details.iban"
                            control={control}
                            rules={{
                              required: "Required",
                              minLength: {
                                value: 23,
                                message: "Invalid IBAN length",
                              },
                            }}
                            render={({ field }) => (
                              <Input
                                size="large"
                                placeholder="AE..."
                                {...field}
                              />
                            )}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Swift / BIC Code">
                          <Controller
                            name="bank_details.swift_code"
                            control={control}
                            render={({ field }) => (
                              <Input size="large" {...field} />
                            )}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>

                  {/* STEP 3: CONTACTS */}
                  <div
                    style={{ display: currentStep === 3 ? "block" : "none" }}
                  >
                    <Title level={4} className="mb-6 text-gray-700">
                      <TeamOutlined /> Primary Contact
                    </Title>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="Name"
                          required
                          help={errors.contacts?.primary_contact?.name?.message}
                        >
                          <Controller
                            name="contacts.primary_contact.name"
                            control={control}
                            rules={{ required: "Required" }}
                            render={({ field }) => (
                              <Input size="large" {...field} />
                            )}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Designation">
                          <Controller
                            name="contacts.primary_contact.designation"
                            control={control}
                            render={({ field }) => (
                              <Input size="large" {...field} />
                            )}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      {/* Mobile Field - Only Numbers Allowed */}
                      <Col span={12}>
                        <Form.Item
                          label="Mobile"
                          required
                          help={
                            errors.contacts?.primary_contact?.mobile?.message
                          }
                          validateStatus={
                            errors.contacts?.primary_contact?.mobile
                              ? "error"
                              : ""
                          }
                        >
                          <Controller
                            name="contacts.primary_contact.mobile"
                            control={control}
                            rules={{
                              required: "Required",
                              minLength: { value: 9, message: "Min 9 digits" },
                            }}
                            render={({ field }) => (
                              <Input
                                size="large"
                                {...field}
                                maxLength={15}
                                placeholder="Enter mobile number"
                                onChange={(e) => {
                                  // Sirf numbers type karne dega
                                  const value = e.target.value.replace(
                                    /\D/g,
                                    "",
                                  );
                                  field.onChange(value);
                                }}
                              />
                            )}
                          />
                        </Form.Item>
                      </Col>

                      {/* Email Field - Valid Email Format */}
                      <Col span={12}>
                        <Form.Item
                          label="Email"
                          required
                          help={
                            errors.contacts?.primary_contact?.email?.message
                          }
                          validateStatus={
                            errors.contacts?.primary_contact?.email
                              ? "error"
                              : ""
                          }
                        >
                          <Controller
                            name="contacts.primary_contact.email"
                            control={control}
                            rules={{
                              required: "Required",
                              pattern: {
                                value: /^\S+@\S+$/i,
                                message: "Invalid email address",
                              },
                            }}
                            render={({ field }) => (
                              <Input
                                size="large"
                                placeholder="Enter email address"
                                {...field}
                              />
                            )}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Divider />
                    <Title level={4} className="mb-6 text-gray-700">
                      Support Contact
                    </Title>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="Name">
                          <Controller
                            name="contacts.support_contact.name"
                            control={control}
                            render={({ field }) => (
                              <Input size="large" {...field} />
                            )}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Designation">
                          <Controller
                            name="contacts.support_contact.designation"
                            control={control}
                            render={({ field }) => (
                              <Input size="large" {...field} />
                            )}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="Mobile"
                          help={
                            errors.contacts?.support_contact?.mobile?.message
                          }
                          validateStatus={
                            errors.contacts?.support_contact?.mobile
                              ? "error"
                              : ""
                          }
                        >
                          <Controller
                            name="contacts.support_contact.mobile"
                            control={control}
                            render={({ field }) => (
                              <Input
                                size="large"
                                {...field}
                                maxLength={15}
                                placeholder="Enter mobile number"
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value.replace(/\D/g, ""),
                                  )
                                }
                              />
                            )}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Email"
                          help={
                            errors.contacts?.support_contact?.email?.message
                          }
                          validateStatus={
                            errors.contacts?.support_contact?.email
                              ? "error"
                              : ""
                          }
                        >
                          <Controller
                            name="contacts.support_contact.email"
                            control={control}
                            rules={{
                              pattern: {
                                value: /^\S+@\S+$/i,
                                message: "Invalid email address",
                              },
                            }}
                            render={({ field }) => (
                              <Input
                                size="large"
                                placeholder="Enter email address"
                                {...field}
                              />
                            )}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>

                  {/* STEP 4: DOCUMENTS (UAE UPDATE) */}
                  <div
                    style={{ display: currentStep === 4 ? "block" : "none" }}
                  >
                    <Title level={4} className="mb-6 text-gray-700">
                      <CloudUploadOutlined /> Document Uploads (UAE)
                    </Title>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        {
                          name: "documents.trade_license",
                          label: "Trade License Copy (Mandatory)",
                        },
                        {
                          name: "documents.vat_certificate",
                          label: "VAT Certificate (TRN) (Mandatory)",
                        },
                        {
                          name: "documents.emirates_id",
                          label: "Emirates ID (Owner/Manager) (Mandatory)",
                        },
                        {
                          name: "documents.bank_letter",
                          label: "Bank Confirmation Letter (with IBAN)",
                        },
                        {
                          name: "documents.moa_document",
                          label: "Memorandum of Association (MOA)",
                        },
                      ].map((doc) => (
                        <Form.Item
                          key={doc.name}
                          label={doc.label}
                          required={doc.label.includes("Mandatory")}
                        >
                          <Controller
                            name={doc.name}
                            control={control}
                            rules={{
                              required: doc.label.includes("Mandatory")
                                ? "Required"
                                : false,
                            }}
                            render={({ field }) => (
                              <GenericUploader
                                value={field.value}
                                onChange={field.onChange}
                                label={doc.label}
                              />
                            )}
                          />
                        </Form.Item>
                      ))}
                    </div>

                    <Divider />
                    <Form.Item>
                      <Controller
                        name="meta.agreed_to_terms"
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                          >
                            I agree to the Terms and Conditions
                          </Checkbox>
                        )}
                      />
                    </Form.Item>
                  </div>

                  {/* NAVIGATION BUTTONS */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 32,
                      paddingTop: 24,
                      borderTop: "1px solid #f0f0f0",
                    }}
                  >
                    <Button
                      size="large"
                      onClick={handleBack}
                      icon={<ArrowLeftOutlined />}
                      disabled={currentStep === 0}
                    >
                      Back
                    </Button>
                    {currentStep < steps.length - 1 ? (
                      <Button
                        type="primary"
                        size="large"
                        onClick={handleNext}
                        style={{
                          background: themeColor,
                          borderColor: themeColor,
                        }}
                        icon={<ArrowRightOutlined />}
                      >
                        Continue
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        size="large"
                        htmlType="submit"
                        loading={submitting}
                        style={{
                          background: themeColor,
                          borderColor: themeColor,
                        }}
                        icon={<CheckCircleOutlined />}
                      >
                        Complete Registration
                      </Button>
                    )}
                  </div>
                </Spin>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default SellerPage;
