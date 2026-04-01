import React, { useState } from "react";
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
  BankOutlined,
  EnvironmentOutlined,
  SafetyCertificateOutlined,
  FileTextOutlined,
  FileDoneOutlined
} from "@ant-design/icons";

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

  // --- PREVIEW MODAL STATE ---
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  // ✅ DUMMY SUBMIT HANDLER (API connect karte waqt isko replace karenge)
  const onFinish = (values) => {
    setLoading(true);
    
    setTimeout(() => {
      console.log("Form Values to be sent to API:", values);
      message.success("Developer onboarded successfully! (Dummy)");
      setLoading(false);
      form.resetFields();
      navigate(-1);
    }, 1500);
  };

  // ✅ File upload normalizer
  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  // ✅ PREVIEW HANDLER (View Icon Logic)
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
          <Title level={3} style={{ margin: 0, color: "#1f2937" }}>Onboard New Developer</Title>
          <Text type="secondary">Fill in the details to register a new property developer.</Text>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ country_code: "+971" }}
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
                  <Form.Item name="password" label="Temporary Password" rules={[{ required: true, min: 6 }]}>
                    <Input.Password placeholder="Enter secure password" size="large" style={{ borderRadius: "8px" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Phone Number" required>
                    <Input.Group compact style={{ display: "flex" }}>
                      <Form.Item name="country_code" noStyle rules={[{ required: true }]}>
                        <Select size="large" style={{ width: "30%", borderTopLeftRadius: "8px", borderBottomLeftRadius: "8px" }}>
                          <Option value="+971">+971 (UAE)</Option>
                          <Option value="+91">+91 (IND)</Option>
                          <Option value="+1">+1 (USA)</Option>
                          <Option value="+44">+44 (UK)</Option>
                        </Select>
                      </Form.Item>
                      <Form.Item name="phone_number" noStyle rules={[{ required: true }]}>
                        <Input style={{ width: "70%", borderTopRightRadius: "8px", borderBottomRightRadius: "8px" }} size="large" placeholder="50 123 4567" />
                      </Form.Item>
                    </Input.Group>
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
                  <Form.Item name="country" label="Country">
                    <Input placeholder="e.g. United Arab Emirates" size="large" style={{ borderRadius: "8px" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="city" label="City">
                    <Input placeholder="e.g. Dubai" size="large" style={{ borderRadius: "8px" }} />
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
              {/* Logo Upload */}
              <Form.Item name="logoUpload" label="Company Logo" valuePropName="fileList" getValueFromEvent={normFile}>
                <Upload name="logo" listType="picture" beforeUpload={() => false} maxCount={1} onPreview={handlePreview}>
                  <Button icon={<UploadOutlined />} style={{ borderRadius: "8px" }}>Upload Logo</Button>
                </Upload>
              </Form.Item>

              <Divider style={{ margin: "16px 0" }} />

              <Text strong style={{ display: "block", marginBottom: "8px" }}>KYC Documents</Text>
              
              <Form.Item name="tradeLicense" valuePropName="fileList" getValueFromEvent={normFile} style={{ marginBottom: "12px" }}>
                <Upload name="tradeLicense" listType="picture" beforeUpload={() => false} maxCount={1} onPreview={handlePreview}>
                  <Button icon={<UploadOutlined />} style={{ borderRadius: "8px", width: "100%" }}>Trade License</Button>
                </Upload>
              </Form.Item>
              
              <Form.Item name="emiratesId" valuePropName="fileList" getValueFromEvent={normFile} style={{ marginBottom: "12px" }}>
                <Upload name="emiratesId" listType="picture" beforeUpload={() => false} maxCount={1} onPreview={handlePreview}>
                  <Button icon={<UploadOutlined />} style={{ borderRadius: "8px", width: "100%" }}>Emirates ID</Button>
                </Upload>
              </Form.Item>

              <Form.Item name="passport" valuePropName="fileList" getValueFromEvent={normFile} style={{ marginBottom: "0" }}>
                <Upload name="passport" listType="picture" beforeUpload={() => false} maxCount={1} onPreview={handlePreview}>
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
                <Upload name="main_agreement" listType="picture" beforeUpload={() => false} maxCount={1} onPreview={handlePreview}>
                  <Button icon={<UploadOutlined />} style={{ borderRadius: "8px", width: "100%" }}>Main Agreement</Button>
                </Upload>
              </Form.Item>

              <Form.Item name="commission_schedule" valuePropName="fileList" getValueFromEvent={normFile} style={{ marginBottom: "12px" }}>
                <Upload name="commission_schedule" listType="picture" beforeUpload={() => false} maxCount={1} onPreview={handlePreview}>
                  <Button icon={<UploadOutlined />} style={{ borderRadius: "8px", width: "100%" }}>Commission Schedule</Button>
                </Upload>
              </Form.Item>

              <Form.Item name="addendum" valuePropName="fileList" getValueFromEvent={normFile} style={{ marginBottom: "12px" }}>
                <Upload name="addendum" listType="picture" beforeUpload={() => false} maxCount={1} onPreview={handlePreview}>
                  <Button icon={<UploadOutlined />} style={{ borderRadius: "8px", width: "100%" }}>Addendum (If any)</Button>
                </Upload>
              </Form.Item>

              <Form.Item name="other_agreement" valuePropName="fileList" getValueFromEvent={normFile} style={{ marginBottom: "0" }}>
                <Upload name="other_agreement" listType="picture" beforeUpload={() => false} maxCount={1} onPreview={handlePreview}>
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
        bodyStyle={{ padding: "16px", textAlign: "center" }}
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

    </div>
  );
};

export default AddDeveloper;