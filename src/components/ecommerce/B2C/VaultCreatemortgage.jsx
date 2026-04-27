// src/pages/Advisor/VaultCreatemortgage.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Typography,
  Space,
  message,
  Select,
  DatePicker,
  InputNumber,
  Divider,
  Upload,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  IdcardOutlined,
  CheckOutlined,
  UploadOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { Country } from "country-state-city";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;
const { Option } = Select;

const BRAND_PURPLE = "#5C039B";

const VaultCreatemortgage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [profileUrl, setProfileUrl] = useState("");
  const [uploadingProfile, setUploadingProfile] = useState(false);

  const countryOptions = useMemo(() => {
    const priorityIsoCodes = ["AE", "IN", "SA", "US", "GB", "AU"];
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

  const handleProfileUpload = async (file) => {
    setUploadingProfile(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiService.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedUrl =
        response?.data?.file?.url ||
        response?.file?.url ||
        response?.data?.url ||
        response?.url ||
        response?.data?.fileUrl ||
        "";

      if (uploadedUrl) {
        setProfileUrl(uploadedUrl);
        message.success("Profile photo uploaded successfully!");
      } else {
        message.error("Upload failed: no URL returned.");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      message.error("Failed to upload profile photo.");
    } finally {
      setUploadingProfile(false);
    }
    return false;
  };

  const handleSubmit = async (values) => {
    if (!profileUrl) {
      message.error("Please upload a profile photo");
      return;
    }

    setLoading(true);
    try {
      const fullPhoneNumber = `+${values.country_code}${values.phone}`;
      const extractedCountryCode = `+${values.country_code}`;

      const payload = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        password: values.password,
        phone_number: fullPhoneNumber,
        country_code: extractedCountryCode,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format("YYYY-MM-DD") : null,
        nationality: values.nationality,
        gender: values.gender,
        profilePic: profileUrl,
        joinDate: values.joinDate ? values.joinDate.format("YYYY-MM-DD") : null,
        department: values.department,
        designation: values.designation,
        maxLeadsCapacity: values.maxLeadsCapacity ? Number(values.maxLeadsCapacity) : undefined,
      };

      await apiService.post("/vault/ops/create", payload);
      message.success("Mortgage Ops created! Login credentials sent via email.");
      form.resetFields();
      setProfileUrl("");
      setTimeout(() => navigate(-1), 1500);
    } catch (err) {
      console.error("Create Mortgage Ops Error:", err);
      message.error(err?.response?.data?.message || "Failed to create mortgage ops");
    } finally {
      setLoading(false);
    }
  };

  const NATIONALITIES = [
    "United Arab Emirates",
    "Saudi Arabia",
    "India",
    "Pakistan",
    "Egypt",
    "Jordan",
    "Lebanon",
    "Philippines",
    "United Kingdom",
    "United States",
    "Other",
  ];

  const DEPARTMENTS = [
    "Mortgage Operations",
    "Sales",
    "Operations",
    "Compliance",
    "Customer Service",
  ];

  return (
    <div style={{ padding: "24px", background: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
      
        <div>
          <Title level={3} style={{ margin: 0, color: "#1f2937" }}>
            Create New Mortgage Operations
          </Title>
          <Text type="secondary">
            Add a new mortgage operations team member. Login credentials will be sent via email automatically.
          </Text>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ country_code: "971" }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card
              title={
                <Space>
                  <UserOutlined style={{ color: BRAND_PURPLE }} />
                  Personal & Account Info
                </Space>
              }
              bordered={false}
              style={{
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                marginBottom: "24px",
              }}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="first_name"
                    label="First Name"
                    rules={[{ required: true, message: "Please enter first name" }]}
                  >
                    <Input placeholder="e.g. Ahmed" size="large" style={{ borderRadius: "8px" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="last_name"
                    label="Last Name"
                    rules={[{ required: true, message: "Please enter last name" }]}
                  >
                    <Input placeholder="e.g. Al Mansouri" size="large" style={{ borderRadius: "8px" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="email"
                    label="Login Email"
                    rules={[{ required: true, type: "email", message: "Valid email required" }]}
                  >
                    <Input placeholder="ahmed@xoto.ae" size="large" style={{ borderRadius: "8px" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="password"
                    label="Password"
                    rules={[{ required: true, min: 8, message: "Min 8 characters" }]}
                  >
                    <Input.Password
                      placeholder="Enter secure password"
                      size="large"
                      style={{ borderRadius: "8px" }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card
              title={
                <Space>
                  <PhoneOutlined style={{ color: BRAND_PURPLE }} />
                  Contact & Personal Details
                </Space>
              }
              bordered={false}
              style={{
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                marginBottom: "24px",
              }}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item label="Phone Number" required>
                    <Space.Compact style={{ width: "100%" }}>
                      <Form.Item
                        name="country_code"
                        noStyle
                        rules={[{ required: true, message: "Code required" }]}
                      >
                        <Select
                          showSearch
                          optionFilterProp="children"
                          style={{ width: "120px", height: "40px" }}
                          popupMatchSelectWidth={300}
                        >
                          {countryOptions.map((item) => (
                            <Option key={item.iso} value={item.code}>
                              <div style={{ display: "flex", alignItems: "center" }}>
                                <img
                                  src={`https://flagcdn.com/w20/${item.iso.toLowerCase()}.png`}
                                  width="20"
                                  alt={item.name}
                                  style={{ marginRight: 8, borderRadius: 2 }}
                                />
                                <span>+{item.code}</span>
                              </div>
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item
                        name="phone"
                        noStyle
                        getValueFromEvent={(e) => e.target.value.replace(/\D/g, "")}
                        rules={[
                          { required: true, message: "Phone number required" },
                          {
                            validator: (_, value) => {
                              if (!value) return Promise.resolve();
                              const code = form.getFieldValue("country_code");
                              const fullNumber = `+${code}${value}`;
                              const phoneNumber = parsePhoneNumberFromString(fullNumber);
                              if (phoneNumber && phoneNumber.isValid()) return Promise.resolve();
                              return Promise.reject(new Error("Invalid mobile number"));
                            },
                          },
                        ]}
                      >
                        <Input
                          placeholder="Mobile Number"
                          style={{
                            width: "100%",
                            height: "40px",
                            borderTopLeftRadius: 0,
                            borderBottomLeftRadius: 0,
                          }}
                        />
                      </Form.Item>
                    </Space.Compact>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item name="dateOfBirth" label="Date of Birth">
                    <DatePicker
                      style={{ width: "100%", borderRadius: "8px" }}
                      size="large"
                      format="DD/MM/YYYY"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="nationality" label="Nationality">
                    <Select
                      placeholder="Select nationality"
                      size="large"
                      style={{ borderRadius: "8px" }}
                      allowClear
                    >
                      {NATIONALITIES.map((n) => (
                        <Option key={n} value={n}>
                          {n}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="gender" label="Gender">
                    <Select
                      placeholder="Select gender"
                      size="large"
                      style={{ borderRadius: "8px" }}
                      allowClear
                    >
                      <Option value="Male">Male</Option>
                      <Option value="Female">Female</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card
              title={
                <Space>
                  <BankOutlined style={{ color: BRAND_PURPLE }} />
                  Employment Details
                </Space>
              }
              bordered={false}
              style={{
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="department" label="Department">
                    <Select
                      placeholder="Select department"
                      size="large"
                      style={{ borderRadius: "8px" }}
                      allowClear
                    >
                      {DEPARTMENTS.map((d) => (
                        <Option key={d} value={d}>
                          {d}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="designation" label="Designation">
                    <Input
                      placeholder="e.g. Senior Mortgage Advisor"
                      size="large"
                      style={{ borderRadius: "8px" }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="joinDate" label="Join Date">
                    <DatePicker
                      style={{ width: "100%", borderRadius: "8px" }}
                      size="large"
                      format="DD/MM/YYYY"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="maxLeadsCapacity" label="Max Leads Capacity">
                    <InputNumber
                      min={1}
                      max={100}
                      placeholder="e.g. 25"
                      size="large"
                      style={{ width: "100%", borderRadius: "8px" }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card
              title={
                <Space>
                  <IdcardOutlined style={{ color: BRAND_PURPLE }} />
                  Profile Photo
                </Space>
              }
              bordered={false}
              style={{
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                marginBottom: "24px",
              }}
            >
              <Form.Item label="Profile Photo" required>
                <Upload
                  showUploadList={false}
                  beforeUpload={handleProfileUpload}
                  accept="image/*"
                >
                  <Button
                    icon={profileUrl ? <CheckOutlined /> : <UploadOutlined />}
                    block
                    style={{
                      height: 45,
                      borderColor: profileUrl ? "#52c41a" : "#d9d9d9",
                      color: profileUrl ? "#52c41a" : "inherit",
                    }}
                    loading={uploadingProfile}
                  >
                    {profileUrl ? "Change Photo" : "Upload Photo"}
                  </Button>
                </Upload>
                {/* Image Preview */}
                {profileUrl && (
                  <div style={{ marginTop: 16, textAlign: "center" }}>
                    <img
                      src={profileUrl}
                      alt="Profile Preview"
                      style={{
                        width: 120,
                        height: 120,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: `3px solid ${BRAND_PURPLE}`,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <div style={{ marginTop: 8, fontSize: 13, color: "#52c41a", fontWeight: 500 }}>
                      ✓ Image uploaded successfully!
                    </div>
                  </div>
                )}
              </Form.Item>
              <Divider style={{ margin: "16px 0" }} />
              <Text strong>Account Setup</Text>
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                  • Login credentials will be sent to the provided email.
                  <br />• The user can update their profile after first login.
                </Text>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Bottom Action Bar */}
        <div
          style={{
            marginTop: "24px",
            padding: "16px 24px",
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 -2px 10px rgba(0,0,0,0.02)",
            display: "flex",
            justifyContent: "space-between", // Back button on left, Create on right
            alignItems: "center",
          }}
        >
          <Button
            size="large"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            style={{ borderRadius: "8px", fontWeight: "600" }}
          >
            Back
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={loading}
            style={{
              background: BRAND_PURPLE,
              borderColor: BRAND_PURPLE,
              borderRadius: "8px",
              fontWeight: "600",
              padding: "0 32px",
            }}
          >
            {loading ? "Creating..." : "Create Mortgage Ops"}
          </Button>
        </div>
      </Form>

      <style jsx global>{`
        .custom-phone-select .ant-select-selector {
          border-top-left-radius: 8px !important;
          border-bottom-left-radius: 8px !important;
          height: 40px !important;
          display: flex !important;
          align-items: center !important;
        }
        .custom-phone-select .ant-select-selection-item {
          display: flex !important;
          align-items: center !important;
          line-height: 1 !important;
        }
      `}</style>
    </div>
  );
};

export default VaultCreatemortgage;