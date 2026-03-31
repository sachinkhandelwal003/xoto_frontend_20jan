import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Typography,
  Upload,
  Space,
  message,
  Select,
  InputNumber,
  Divider,
  Modal
} from "antd";
import {
  ArrowLeftOutlined,
  UploadOutlined,
  UserOutlined,
  ContactsOutlined,
  IdcardOutlined,
  SolutionOutlined
} from "@ant-design/icons";

// ✅ Imported required packages for Country/City and Phone Validation
import { Country, City } from "country-state-city";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { parsePhoneNumberFromString } from "libphonenumber-js";

// ✅ Import apiService
import { apiService } from "../../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;
const { Option } = Select;

const BRAND_PURPLE = "#5C039B";

// Base64 converter for Image Preview
const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const AddAgent = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // --- LOCATION STATES ---
  const [citiesList, setCitiesList] = useState([]);
  const selectedCountry = Form.useWatch("country", form);

  // --- PREVIEW MODAL STATE ---
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  // ==========================================
  // ✅ DYNAMIC CITIES BASED ON COUNTRY
  // ==========================================
  useEffect(() => {
    if (selectedCountry) {
      const countryObj = Country.getAllCountries().find(c => c.name === selectedCountry);
      if (countryObj) {
        setCitiesList(City.getCitiesOfCountry(countryObj.isoCode));
      } else {
        setCitiesList([]);
      }
    } else {
      setCitiesList([]);
    }
  }, [selectedCountry]);

  // ==========================================
  // ✅ INDIVIDUAL UPLOAD HANDLER (/api/upload)
  // ==========================================
  const customUploadRequest = async ({ file, onSuccess, onError, onProgress }) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiService.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (event) => {
          const percent = Math.floor((event.loaded / event.total) * 100);
          onProgress({ percent });
        },
      });

      const uploadedUrl = response?.data?.url || response?.data?.fileUrl || response?.data;
      
      message.success(`${file.name} uploaded successfully.`);
      onSuccess(uploadedUrl);
    } catch (error) {
      console.error("Upload Error:", error);
      message.error(`${file.name} upload failed.`);
      onError(error);
    }
  };

  const getUploadedUrl = (fileList) => {
    if (!fileList || fileList.length === 0) return "";
    return fileList[0].response || ""; 
  };

  // ==========================================
  // ✅ ACTUAL API SUBMIT HANDLER
  // ==========================================
  const onFinish = async (values) => {
    setLoading(true);
    
    try {
      // Extract country code from the validated phone number
      const parsedPhone = parsePhoneNumberFromString(`+${values.phone_number}`);
      const extractedCountryCode = parsedPhone ? `+${parsedPhone.countryCallingCode}` : "";

      const payload = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        password: values.password,
        phone_number: `+${values.phone_number}`, 
        country_code: extractedCountryCode, // Automatically populated from phone
        operating_city: values.operating_city,
        specialization: values.specialization,
        country: values.country,
        experience_years: values.experience_years || 0,
        rera_number: values.rera_number || "",
        agentType: values.agentType,
        
        profile_photo: getUploadedUrl(values.profile_photo),
        id_proof: getUploadedUrl(values.id_proof),
        rera_certificate: getUploadedUrl(values.rera_certificate)
      };

      if (values.agentType === "agency_agent" && values.agency) {
        payload.agency = values.agency;
      }

      const response = await apiService.post("/agent/agent-signup", payload);
      
      message.success(response?.data?.message || "Agent onboarded successfully!");
      form.resetFields();
      navigate(-1);
      
    } catch (error) {
      console.error("Agent Onboarding Error:", error);
      message.error(error?.response?.data?.message || "Failed to onboard agent. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf("/") + 1));
  };

  return (
    <div style={{ padding: "24px", background: "#f8f9fa", minHeight: "100vh" }}>
      
      {/* HEADER SECTION */}
      <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(-1)}
          style={{ border: "none", background: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", borderRadius: "8px" }}
        />
        <div>
          <Title level={3} style={{ margin: 0, color: "#1f2937" }}>Onboard New Agent</Title>
          <Text type="secondary">Fill in the details to register a new real estate agent.</Text>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ country: "United Arab Emirates", agentType: "independent" }}
      >
        <Row gutter={[24, 24]}>
          
          {/* ========================================== */}
          {/* LEFT COLUMN - MAIN DETAILS                 */}
          {/* ========================================== */}
          <Col xs={24} lg={16}>
            
            {/* 1. PERSONAL & ACCOUNT INFO */}
            <Card 
              title={<Space><UserOutlined style={{ color: BRAND_PURPLE }}/> Personal & Account Info</Space>} 
              bordered={false} 
              style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: "24px" }}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="first_name" label="First Name" rules={[{ required: true, message: "Please enter first name" }]}>
                    <Input placeholder="e.g. John" size="large" style={{ borderRadius: "8px" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="last_name" label="Last Name" rules={[{ required: true, message: "Please enter last name" }]}>
                    <Input placeholder="e.g. Doe" size="large" style={{ borderRadius: "8px" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="email" label="Login Email" rules={[{ required: true, type: 'email' }]}>
                    <Input placeholder="agent@xoto.com" size="large" style={{ borderRadius: "8px" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="password" label=" Password" rules={[{ required: true, min: 6 }]}>
                    <Input.Password placeholder="Enter secure password" size="large" style={{ borderRadius: "8px" }} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* 2. CONTACT & LOCATION */}
            <Card 
              title={<Space><ContactsOutlined style={{ color: BRAND_PURPLE }}/> Contact & Location</Space>} 
              bordered={false} 
              style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: "24px" }}
            >
              <Row gutter={16}>
                {/* ✅ STRICT VALIDATED PHONE INPUT WITH COUNTRY DROPDOWN */}
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="phone_number" 
                    label="Phone Number" 
                    rules={[
                      { required: true, message: "Phone number is required" },
                      {
                        validator: (_, value) => {
                          if (!value) return Promise.resolve();
                          const phoneNumber = parsePhoneNumberFromString(`+${value}`);
                          if (phoneNumber && phoneNumber.isValid()) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error("Strict: Invalid mobile number for this country"));
                        }
                      }
                    ]}
                  >
                    <PhoneInput
                      country={'ae'}
                      enableSearch={true}
                      inputStyle={{ width: '100%', height: '40px', borderRadius: '8px' }}
                      buttonStyle={{ borderRadius: '8px 0 0 8px', borderRight: 'none' }}
                    />
                  </Form.Item>
                </Col>
                
                {/* ✅ WORLDWIDE COUNTRY DROPDOWN */}
                <Col xs={24} md={12}>
                  <Form.Item name="country" label="Country" rules={[{ required: true, message: "Select a country" }]}>
                    <Select 
                      size="large" 
                      showSearch 
                      placeholder="Select Country" 
                      optionFilterProp="children"
                      style={{ borderRadius: "8px" }}
                      onChange={() => form.setFieldsValue({ operating_city: undefined })}
                    >
                      {Country.getAllCountries().map((c) => (
                        <Option key={c.isoCode} value={c.name}>{c.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                {/* ✅ CITIES DROPDOWN BASED ON COUNTRY */}
                <Col xs={24} md={12}>
                  <Form.Item name="operating_city" label="Operating City" rules={[{ required: true, message: "Select a city" }]}>
                    <Select 
                      size="large" 
                      showSearch 
                      placeholder="Select City" 
                      optionFilterProp="children"
                      style={{ borderRadius: "8px" }}
                      disabled={citiesList.length === 0}
                    >
                      {citiesList.map((city, index) => (
                        <Option key={`${city.name}-${index}`} value={city.name}>{city.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* 3. PROFESSIONAL DETAILS */}
            <Card 
              title={<Space><SolutionOutlined style={{ color: BRAND_PURPLE }}/> Professional Details</Space>} 
              bordered={false} 
              style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="agentType" label="Agent Type" rules={[{ required: true }]}>
                    <Select size="large" style={{ borderRadius: "8px" }}>
                      <Option value="independent">Independent</Option>
                      <Option value="agency_agent">Agency Agent</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Form.Item noStyle shouldUpdate={(prev, curr) => prev.agentType !== curr.agentType}>
                  {({ getFieldValue }) =>
                    getFieldValue("agentType") === "agency_agent" ? (
                      <Col xs={24} md={12}>
                        <Form.Item name="agency" label="Select Agency" rules={[{ required: true, message: "Agency is required" }]}>
                          <Select placeholder="-- Choose Agency --" size="large" style={{ borderRadius: "8px" }}>
                            <Option value="agency_id_1">Nexus Real Estate</Option>
                            <Option value="agency_id_2">Vanguard Properties</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    ) : null
                  }
                </Form.Item>

                <Col xs={24} md={12}>
                  <Form.Item name="specialization" label="Specialization" rules={[{ required: true }]}>
                    <Input placeholder="e.g. Luxury Villas, Commercial" size="large" style={{ borderRadius: "8px" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="experience_years" label="Experience (Years)">
                    <InputNumber min={0} placeholder="e.g. 5" size="large" style={{ width: "100%", borderRadius: "8px" }} />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item name="rera_number" label="RERA Number">
                    <Input placeholder="Enter RERA registration number" size="large" style={{ borderRadius: "8px" }} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* ========================================== */}
          {/* RIGHT COLUMN - MEDIA & DOCS                */}
          {/* ========================================== */}
          <Col xs={24} lg={8}>
            
            <Card 
              title={<Space><IdcardOutlined style={{ color: BRAND_PURPLE }}/> Media & Documents</Space>} 
              bordered={false} 
              style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: "24px" }}
            >
              <Form.Item name="profile_photo" label="Profile Photo" valuePropName="fileList" getValueFromEvent={normFile}>
                <Upload customRequest={customUploadRequest} listType="picture" maxCount={1} onPreview={handlePreview}>
                  <Button icon={<UploadOutlined />} style={{ borderRadius: "8px", width: "100%" }}>Upload Photo</Button>
                </Upload>
              </Form.Item>

              <Divider style={{ margin: "16px 0" }} />

              <Text strong style={{ display: "block", marginBottom: "8px" }}>KYC & Certifications</Text>
              
              <Form.Item name="id_proof" valuePropName="fileList" getValueFromEvent={normFile} style={{ marginBottom: "12px" }}>
                <Upload customRequest={customUploadRequest} listType="picture" maxCount={1} onPreview={handlePreview}>
                  <Button icon={<UploadOutlined />} style={{ borderRadius: "8px", width: "100%" }}>ID Proof (Emirates ID/Passport)</Button>
                </Upload>
              </Form.Item>

              <Form.Item name="rera_certificate" valuePropName="fileList" getValueFromEvent={normFile} style={{ marginBottom: "0" }}>
                <Upload customRequest={customUploadRequest} listType="picture" maxCount={1} onPreview={handlePreview}>
                  <Button icon={<UploadOutlined />} style={{ borderRadius: "8px", width: "100%" }}>RERA Certificate</Button>
                </Upload>
              </Form.Item>
            </Card>

          </Col>
        </Row>

        {/* BOTTOM ACTION BAR */}
        <div style={{
          marginTop: "24px",
          padding: "16px 24px",
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 -2px 10px rgba(0,0,0,0.02)",
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px"
        }}>
          <Button 
            size="large" 
            onClick={() => navigate(-1)} 
            style={{ borderRadius: "8px", fontWeight: "600" }}
          >
            Cancel
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
              padding: "0 32px"
            }}
          >
            {loading ? "Onboarding..." : "Register Agent"}
          </Button>
        </div>
      </Form>

      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        centered
        style={{ padding: "16px", textAlign: "center" }}
      >
        <img
          alt="Preview"
          style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain", borderRadius: "8px" }}
          src={previewImage}
        />
      </Modal>

    </div>
  );
};

export default AddAgent;