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
  UserOutlined,
  ContactsOutlined,
  IdcardOutlined,
  SolutionOutlined // ✅ Fixed Icon
} from "@ant-design/icons";

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

  // --- PREVIEW MODAL STATE ---
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  // ✅ DUMMY SUBMIT HANDLER
  const onFinish = (values) => {
    setLoading(true);
    
    setTimeout(() => {
      console.log("Form Values to be sent to API:", values);
      message.success("Agent onboarded successfully! (Dummy)");
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
          <Title level={3} style={{ margin: 0, color: "#1f2937" }}>Onboard New Agent</Title>
          <Text type="secondary">Fill in the details to register a new real estate agent.</Text>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ country_code: "+971", country: "UAE", agentType: "independent" }}
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
                  <Form.Item name="password" label="Temporary Password" rules={[{ required: true, min: 6 }]}>
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
                <Col xs={24} md={12}>
                  <Form.Item label="Phone Number" required>
                    <Input.Group compact style={{ display: "flex" }}>
                      <Form.Item name="country_code" noStyle rules={[{ required: true }]}>
                        <Select size="large" style={{ width: "35%", borderTopLeftRadius: "8px", borderBottomLeftRadius: "8px" }}>
                          <Option value="+971">+971 (UAE)</Option>
                          <Option value="+91">+91 (IND)</Option>
                          <Option value="+1">+1 (USA)</Option>
                          <Option value="+44">+44 (UK)</Option>
                        </Select>
                      </Form.Item>
                      <Form.Item name="phone_number" noStyle rules={[{ required: true }]}>
                        <Input style={{ width: "65%", borderTopRightRadius: "8px", borderBottomRightRadius: "8px" }} size="large" placeholder="50 123 4567" />
                      </Form.Item>
                    </Input.Group>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="operating_city" label="Operating City" rules={[{ required: true }]}>
                    <Input placeholder="e.g. Dubai" size="large" style={{ borderRadius: "8px" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="country" label="Country">
                    <Input disabled size="large" style={{ borderRadius: "8px" }} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* 3. PROFESSIONAL DETAILS */}
            <Card 
              title={<Space><SolutionOutlined style={{ color: BRAND_PURPLE }}/> Professional Details</Space>} // ✅ Fixed Icon
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

                {/* Conditional Rendering for Agency Selection */}
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
              {/* Profile Photo Upload */}
              <Form.Item name="profile_photo" label="Profile Photo" valuePropName="fileList" getValueFromEvent={normFile}>
                <Upload name="profile_photo" listType="picture" beforeUpload={() => false} maxCount={1} onPreview={handlePreview}>
                  <Button icon={<UploadOutlined />} style={{ borderRadius: "8px", width: "100%" }}>Upload Photo</Button>
                </Upload>
              </Form.Item>

              <Divider style={{ margin: "16px 0" }} />

              <Text strong style={{ display: "block", marginBottom: "8px" }}>KYC & Certifications</Text>
              
              <Form.Item name="id_proof" valuePropName="fileList" getValueFromEvent={normFile} style={{ marginBottom: "12px" }}>
                <Upload name="id_proof" listType="picture" beforeUpload={() => false} maxCount={1} onPreview={handlePreview}>
                  <Button icon={<UploadOutlined />} style={{ borderRadius: "8px", width: "100%" }}>ID Proof (Emirates ID/Passport)</Button>
                </Upload>
              </Form.Item>

              <Form.Item name="rera_certificate" valuePropName="fileList" getValueFromEvent={normFile} style={{ marginBottom: "0" }}>
                <Upload name="rera_certificate" listType="picture" beforeUpload={() => false} maxCount={1} onPreview={handlePreview}>
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

    </div>
  );
};

export default AddAgent;