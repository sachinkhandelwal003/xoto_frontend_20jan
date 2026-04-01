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

  // 🔥 BULLETPROOF STATE FOR UPLOADED URLS
  const [uploadedUrls, setUploadedUrls] = useState({
    profile_photo: "",
    id_proof: "",
    rera_certificate: ""
  });

  // --- NEW COUNTRY OPTIONS LOGIC ---
  const countryOptions = useMemo(() => {
    const priorityIsoCodes = ["AE", "IN", "SA", "US", "GB", "AU"]; 
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
  // 🔥 ULTRA-ROBUST UPLOAD HANDLER
  // ==========================================
  const handleFileUpload = async (options, fieldName) => {
    const { file, onSuccess, onError, onProgress } = options;
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiService.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          onProgress({ percent: Math.floor((event.loaded / event.total) * 100) });
        },
      });

      console.log(`UPLOAD RAW RESPONSE FOR ${fieldName}:`, response);

      // 🔥 Har possible structure se URL nikalne ki koshish (Axios Interceptors ke liye)
      let extractedUrl = "";
      if (response?.data?.file?.url) extractedUrl = response.data.file.url;
      else if (response?.file?.url) extractedUrl = response.file.url; 
      else if (response?.data?.url) extractedUrl = response.data.url;
      else if (response?.url) extractedUrl = response.url;
      else if (typeof response?.data === 'string') extractedUrl = response.data;

      console.log(`✅ EXTRACTED URL FOR ${fieldName}:`, extractedUrl);

      if (!extractedUrl) {
        message.warning("Photo uploaded but URL not found in API response.");
      } else {
        message.success(`${file.name} uploaded successfully!`);
      }

      // State me save kar diya
      setUploadedUrls(prev => ({ ...prev, [fieldName]: extractedUrl }));
      
      onSuccess({ url: extractedUrl });
    } catch (error) {
      console.error("Upload Error:", error);
      message.error(`${file.name} upload failed.`);
      onError(error);
    }
  };

  // ==========================================
  // ✅ ACTUAL API SUBMIT HANDLER
  // ==========================================
  const onFinish = async (values) => {
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
        operating_city: values.operating_city,
        specialization: values.specialization,
        country: values.country,
        experience_years: values.experience_years || 0,
        rera_number: values.rera_number || "",
        agentType: values.agentType,
        
        // 🔥 State se direct URLs le rahe hain
        profile_photo: uploadedUrls.profile_photo || "",
        id_proof: uploadedUrls.id_proof || "",
        rera_certificate: uploadedUrls.rera_certificate || ""
      };

      if (values.agentType === "agency_agent" && values.agency) {
        payload.agency = values.agency;
      }

      console.log("🚀 FINAL PAYLOAD GOING TO BACKEND:", payload);

      const response = await apiService.post("/agent/agent-signup", payload);
      
      message.success(response?.data?.message || "Agent onboarded successfully!");
      form.resetFields();
      
      // 🔥 SUCCESS HONE PAR REDIRECT
      navigate("/dashboard/admin/agent-list");
      
    } catch (error) {
      console.error("Agent Onboarding Error:", error);
      message.error(error?.response?.data?.message || "Failed to onboard agent. Please try again.");
    } finally {
      setLoading(false);
    }
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
        initialValues={{ country: "United Arab Emirates", agentType: "independent", country_code: "971" }}
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
                  <Form.Item label="Phone Number" style={{ marginBottom: 0 }} required>
                    <Space.Compact style={{ width: '100%' }}>
                      <Form.Item
                        name="country_code"
                        noStyle
                        rules={[{ required: true, message: 'Code is required' }]}
                      >
                        <Select
                          showSearch
                          optionFilterProp="children"
                          className="custom-phone-select"
                          style={{ width: '120px', height: '40px' }}
                          popupMatchSelectWidth={300}
                        >
                          {countryOptions.map((item) => (
                            <Option key={item.iso} value={item.code}>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
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
                          { required: true, message: "Phone number is required" },
                          {
                            validator: (_, value) => {
                              if (!value) return Promise.resolve();
                              const code = form.getFieldValue('country_code');
                              const fullNumber = `+${code}${value}`;
                              const phoneNumber = parsePhoneNumberFromString(fullNumber);
                              if (phoneNumber && phoneNumber.isValid()) {
                                return Promise.resolve();
                              }
                              return Promise.reject(new Error("Invalid mobile number"));
                            }
                          }
                        ]}
                      >
                        <Input 
                          placeholder="Mobile Number" 
                          style={{ width: '100%', height: '40px', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }} 
                        />
                      </Form.Item>
                    </Space.Compact>
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
              {/* 🔥 CUSTOM HANDLER PASSED FOR EACH FIELD */}
              <Form.Item label="Profile Photo">
                <Upload 
                  customRequest={(options) => handleFileUpload(options, "profile_photo")} 
                  listType="picture" 
                  maxCount={1} 
                  onPreview={handlePreview}
                >
                  <Button icon={<UploadOutlined />} style={{ borderRadius: "8px", width: "100%" }}>Upload Photo</Button>
                </Upload>
              </Form.Item>

              <Divider style={{ margin: "16px 0" }} />

              <Text strong style={{ display: "block", marginBottom: "8px" }}>KYC & Certifications</Text>
              
              <Form.Item label="ID Proof (Emirates ID/Passport)" style={{ marginBottom: "12px" }}>
                <Upload 
                  customRequest={(options) => handleFileUpload(options, "id_proof")} 
                  listType="picture" 
                  maxCount={1} 
                  onPreview={handlePreview}
                >
                  <Button icon={<UploadOutlined />} style={{ borderRadius: "8px", width: "100%" }}>Upload ID Proof</Button>
                </Upload>
              </Form.Item>

              <Form.Item label="RERA Certificate" style={{ marginBottom: "0" }}>
                <Upload 
                  customRequest={(options) => handleFileUpload(options, "rera_certificate")} 
                  listType="picture" 
                  maxCount={1} 
                  onPreview={handlePreview}
                >
                  <Button icon={<UploadOutlined />} style={{ borderRadius: "8px", width: "100%" }}>Upload RERA</Button>
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

      <style jsx global>{`
        /* Make sure custom phone select matches Ant Design inputs */
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

export default AddAgent;