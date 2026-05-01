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
  Modal,
  Spin
} from "antd";
import {
  ArrowLeftOutlined,
  UploadOutlined,
  BankOutlined,
  EnvironmentOutlined,
  SafetyCertificateOutlined,
  FileTextOutlined,
  FileDoneOutlined
} from "@ant-design/icons";

// ✅ REQUIRED PACKAGES FOR VALIDATION & LOCATIONS
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { Country, City } from "country-state-city";

// ✅ Import apiService
import { apiService } from "../../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const BRAND_PURPLE = "#5C039B";

// Base64 converter for Image Preview
const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const AddDeveloper = () => {
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

  // Load Cities when Country changes
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
  // ✅ UPLOAD API HANDLER (/upload)
  // ==========================================
  const customUploadRequest = async ({ file, onSuccess, onError, onProgress }) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiService.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          const percent = Math.floor((event.loaded / event.total) * 100);
          onProgress({ percent });
        },
      });

      const uploadedUrl = response?.data?.url || response?.data?.fileUrl || response?.data;
      message.success(`${file.name} uploaded successfully.`);
      
      // Store both URL and Name for the Schema arrays
      onSuccess({ url: uploadedUrl, name: file.name }); 
    } catch (error) {
      console.error("Upload Error:", error);
      message.error(`${file.name} upload failed.`);
      onError(error);
    }
  };

  // Helper to extract data for documents array
  const getUploadedDoc = (fileList) => {
    if (!fileList || fileList.length === 0) return null;
    const response = fileList[0].response;
    return response ? { url: response.url, name: response.name } : null;
  };

  const getUploadedUrl = (fileList) => {
    const doc = getUploadedDoc(fileList);
    return doc ? doc.url : "";
  };


  // ==========================================
  // ✅ ACTUAL SUBMIT HANDLER (/developer/createDeveloper)
  // ==========================================
  const onFinish = async (values) => {
    setLoading(true);
    
    try {
      // ✅ UPDATED PHONE NUMBER PAYLOAD LOGIC
      const fullPhoneNumber = `+${values.country_code}${values.phone}`;
      const extractedCountryCode = `+${values.country_code}`;

      // 1. Build KYC Documents Array
      const kycDocuments = [];
      const tradeLicense = getUploadedDoc(values.tradeLicense);
      if (tradeLicense) kycDocuments.push({ type: 'trade_license', name: tradeLicense.name, url: tradeLicense.url });

      const emiratesId = getUploadedDoc(values.emiratesId);
      if (emiratesId) kycDocuments.push({ type: 'emirates_id', name: emiratesId.name, url: emiratesId.url });

      const passport = getUploadedDoc(values.passport);
      if (passport) kycDocuments.push({ type: 'passport', name: passport.name, url: passport.url });

      // 2. Build Agreement Documents Array
      const agreementDocuments = [];
      const mainAgreement = getUploadedDoc(values.main_agreement);
      if (mainAgreement) agreementDocuments.push({ type: 'main_agreement', name: mainAgreement.name, url: mainAgreement.url, uploadedBy: 'admin' });

      const commissionSchedule = getUploadedDoc(values.commission_schedule);
      if (commissionSchedule) agreementDocuments.push({ type: 'commission_schedule', name: commissionSchedule.name, url: commissionSchedule.url, uploadedBy: 'admin' });

      const addendum = getUploadedDoc(values.addendum);
      if (addendum) agreementDocuments.push({ type: 'addendum', name: addendum.name, url: addendum.url, uploadedBy: 'admin' });

      const otherAgreement = getUploadedDoc(values.other_agreement);
      if (otherAgreement) agreementDocuments.push({ type: 'other', name: otherAgreement.name, url: otherAgreement.url, uploadedBy: 'admin' });

      // 3. Final Payload creation based on Schema
      const payload = {
        name: values.name,
        websiteUrl: values.websiteUrl,
        description: values.description,
        email: values.email,
        password: values.password,
        country_code: extractedCountryCode,
        phone_number: fullPhoneNumber, 
        officialEmailId: values.officialEmailId,
        country: values.country,
        city: values.city,
        address: values.address,
        reraNumber: values.reraNumber,
        authorizedPersonName: values.authorizedPersonName,
        operatingYears: values.operatingYears || 0,
        
        logo: getUploadedUrl(values.logoUpload),
        kycDocuments: kycDocuments,
        agreementDocuments: agreementDocuments
      };

      

      // ✅ ACTUAL API CALL
      const response = await apiService.post("/developer/create-developer", payload);
      
      message.success(response?.data?.message || "Developer onboarded successfully!");
      form.resetFields();

      // ✅ REDIRECT TO DEVELOPER LIST PAGE ON SUCCESS
      navigate("/dashboard/admin/developer-list"); 
      
    } catch (error) {
      console.error(error);
      message.error(error?.response?.data?.message || "Failed to onboard developer.");
    } finally {
      setLoading(false);
    }
  };

  // File upload normalizer
  const normFile = (e) => (Array.isArray(e) ? e : e?.fileList);

  // Preview Handler
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) file.preview = await getBase64(file.originFileObj);
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
          <Title level={3} style={{ margin: 0, color: "#1f2937" }}>Onboard New Developer</Title>
          <Text type="secondary">Fill in the details to register a new property developer.</Text>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ country: "United Arab Emirates", country_code: "971" }}
      >
        <Row gutter={[24, 24]}>
          
          {/* ========================================== */}
          {/* LEFT COLUMN - MAIN DETAILS                 */}
          {/* ========================================== */}
          <Col xs={24} lg={16}>
            
            {/* 1. BASIC COMPANY INFO */}
            <Card 
              title={<Space><BankOutlined style={{ color: BRAND_PURPLE }}/> Basic Company Info</Space>} 
              bordered={false} 
              style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: "24px" }}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="name" label="Company Name" rules={[{ required: true, message: "Please enter company name" }]}>
                    <Input placeholder="e.g. Emaar Properties" size="large" style={{ borderRadius: "8px" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="websiteUrl" label="Website URL">
                    <Input placeholder="https://www.example.com" size="large" style={{ borderRadius: "8px" }} />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item name="description" label="Company Description">
                    <TextArea rows={4} placeholder="Brief description about the developer..." style={{ borderRadius: "8px" }} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* 2. ACCOUNT & CONTACT CREDENTIALS */}
            <Card 
              title={<Space><SafetyCertificateOutlined style={{ color: BRAND_PURPLE }}/> Account Credentials</Space>} 
              bordered={false} 
              style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: "24px" }}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="email" label="Login Email" rules={[{ required: true, type: 'email' }]}>
                    <Input placeholder="developer@xoto.com" size="large" style={{ borderRadius: "8px" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
                    <Input.Password placeholder="Enter secure password" size="large" style={{ borderRadius: "8px" }} />
                  </Form.Item>
                </Col>
                
                {/* ✅ NEW CUSTOM PHONE INPUT */}
                <Col xs={24} md={12}>
                  <Form.Item label="Mobile Number" style={{ marginBottom: 0 }} required>
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
                          onChange={(e) => {
                            // Only allow numbers to be typed
                            const val = e.target.value.replace(/\D/g, "");
                            form.setFieldsValue({ phone: val });
                          }}
                        />
                      </Form.Item>
                    </Space.Compact>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item name="officialEmailId" label="Official Contact Email (Public)">
                    <Input placeholder="info@developer.com" size="large" style={{ borderRadius: "8px" }} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* 3. LOCATION DETAILS */}
            <Card 
              title={<Space><EnvironmentOutlined style={{ color: BRAND_PURPLE }}/> Location Details</Space>} 
              bordered={false} 
              style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="country" label="Country" rules={[{ required: true }]}>
                    <Select 
                      size="large" showSearch placeholder="Select Country" optionFilterProp="children"
                      style={{ borderRadius: "8px" }}
                      onChange={() => form.setFieldsValue({ city: undefined })}
                    >
                      {Country.getAllCountries().map((c) => (<Option key={c.isoCode} value={c.name}>{c.name}</Option>))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="city" label="City" rules={[{ required: true }]}>
                    <Select 
                      size="large" showSearch placeholder="Select City" optionFilterProp="children"
                      style={{ borderRadius: "8px" }}
                      disabled={citiesList.length === 0}
                    >
                      {citiesList.map((city, idx) => (<Option key={`${city.name}-${idx}`} value={city.name}>{city.name}</Option>))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item name="address" label="Full Address">
                    <Input placeholder="Building, Street, Area..." size="large" style={{ borderRadius: "8px" }} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* ========================================== */}
          {/* RIGHT COLUMN - LEGAL & DOCS                */}
          {/* ========================================== */}
          <Col xs={24} lg={8}>
            
            {/* 4. LEGAL & BUSINESS */}
            <Card 
              title={<Space><FileTextOutlined style={{ color: BRAND_PURPLE }}/> Legal Details</Space>} 
              bordered={false} 
              style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: "24px" }}
            >
              <Form.Item name="reraNumber" label="RERA Number">
                <Input placeholder="Enter RERA registration number" size="large" style={{ borderRadius: "8px" }} />
              </Form.Item>
              <Form.Item name="authorizedPersonName" label="Authorized Person Name">
                <Input placeholder="Name of the signatory" size="large" style={{ borderRadius: "8px" }} />
              </Form.Item>
              <Form.Item name="operatingYears" label="Years of Operation">
                <InputNumber min={0} placeholder="e.g. 10" size="large" style={{ width: "100%", borderRadius: "8px" }} />
              </Form.Item>
            </Card>

            {/* 5. LOGO & KYC UPLOADS */}
            <Card 
              title="Media & KYC Documents" 
              bordered={false} 
              style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: "24px" }}
            >
              <Form.Item name="logoUpload" label="Company Logo" valuePropName="fileList" getValueFromEvent={normFile}>
                <Upload customRequest={customUploadRequest} listType="picture" maxCount={1} onPreview={handlePreview}>
                  <Button icon={<UploadOutlined />} style={{ borderRadius: "8px", width: "100%" }}>Upload Logo</Button>
                </Upload>
              </Form.Item>

              <Divider style={{ margin: "16px 0" }} />

              <Text strong style={{ display: "block", marginBottom: "8px" }}>KYC Documents</Text>
              
              <Form.Item name="tradeLicense" valuePropName="fileList" getValueFromEvent={normFile} style={{ marginBottom: "12px" }}>
                <Upload customRequest={customUploadRequest} listType="picture" maxCount={1} onPreview={handlePreview}>
                  <Button icon={<UploadOutlined />} style={{ borderRadius: "8px", width: "100%" }}>Trade License</Button>
                </Upload>
              </Form.Item>
              
              <Form.Item name="emiratesId" valuePropName="fileList" getValueFromEvent={normFile} style={{ marginBottom: "12px" }}>
                <Upload customRequest={customUploadRequest} listType="picture" maxCount={1} onPreview={handlePreview}>
                  <Button icon={<UploadOutlined />} style={{ borderRadius: "8px", width: "100%" }}>Emirates ID</Button>
                </Upload>
              </Form.Item>

              <Form.Item name="passport" valuePropName="fileList" getValueFromEvent={normFile} style={{ marginBottom: "0" }}>
                <Upload customRequest={customUploadRequest} listType="picture" maxCount={1} onPreview={handlePreview}>
                  <Button icon={<UploadOutlined />} style={{ borderRadius: "8px", width: "100%" }}>Passport Copy</Button>
                </Upload>
              </Form.Item>
            </Card>

            {/* 6. AGREEMENT DOCUMENTS */}
            <Card 
              title={<Space><FileDoneOutlined style={{ color: BRAND_PURPLE }}/> Agreement Documents</Space>} 
              bordered={false} 
              style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
            >
              <Form.Item name="main_agreement" valuePropName="fileList" getValueFromEvent={normFile} style={{ marginBottom: "12px" }}>
                <Upload customRequest={customUploadRequest} listType="picture" maxCount={1} onPreview={handlePreview}>
                  <Button icon={<UploadOutlined />} style={{ borderRadius: "8px", width: "100%" }}>Main Agreement</Button>
                </Upload>
              </Form.Item>

              <Form.Item name="commission_schedule" valuePropName="fileList" getValueFromEvent={normFile} style={{ marginBottom: "12px" }}>
                <Upload customRequest={customUploadRequest} listType="picture" maxCount={1} onPreview={handlePreview}>
                  <Button icon={<UploadOutlined />} style={{ borderRadius: "8px", width: "100%" }}>Commission Schedule</Button>
                </Upload>
              </Form.Item>

              <Form.Item name="addendum" valuePropName="fileList" getValueFromEvent={normFile} style={{ marginBottom: "12px" }}>
                <Upload customRequest={customUploadRequest} listType="picture" maxCount={1} onPreview={handlePreview}>
                  <Button icon={<UploadOutlined />} style={{ borderRadius: "8px", width: "100%" }}>Addendum (If any)</Button>
                </Upload>
              </Form.Item>

              <Form.Item name="other_agreement" valuePropName="fileList" getValueFromEvent={normFile} style={{ marginBottom: "0" }}>
                <Upload customRequest={customUploadRequest} listType="picture" maxCount={1} onPreview={handlePreview}>
                  <Button icon={<UploadOutlined />} style={{ borderRadius: "8px", width: "100%" }}>Other Documents</Button>
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
            {loading ? "Onboarding..." : "Register Developer"}
          </Button>
        </div>
      </Form>

      {/* ✅ IMAGE PREVIEW MODAL */}
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
          style={{
            maxWidth: "100%",
            maxHeight: "70vh",
            objectFit: "contain",
            borderRadius: "8px"
          }}
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

export default AddDeveloper;