import React, { useState, useEffect } from "react";
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
  ContactsOutlined,
  IdcardOutlined,
  WalletOutlined
} from "@ant-design/icons";

// ✅ IMPORTING REQUIRED PACKAGES
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { Country, State, City } from "country-state-city";

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

const AddAgency = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // --- PREVIEW MODAL STATE ---
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  // ✅ LOCATION STATES
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [opCitiesList, setOpCitiesList] = useState([]);

  // Watch fields for cascading dropdowns
  const addressCountry = Form.useWatch("address_country", form);
  const addressState = Form.useWatch("address_state", form);
  const operatingCountry = Form.useWatch("operating_country", form);

  // Load States when Address Country changes
  useEffect(() => {
    if (addressCountry) {
      setStatesList(State.getStatesOfCountry(addressCountry));
    } else {
      setStatesList([]);
      setCitiesList([]);
    }
  }, [addressCountry]);

  // Load Cities when Address State changes
  useEffect(() => {
    if (addressCountry && addressState) {
      setCitiesList(City.getCitiesOfState(addressCountry, addressState));
    } else {
      setCitiesList([]);
    }
  }, [addressCountry, addressState]);

  // Load Cities when Operating Country changes
  useEffect(() => {
    if (operatingCountry) {
      setOpCitiesList(City.getCitiesOfCountry(operatingCountry));
    } else {
      setOpCitiesList([]);
    }
  }, [operatingCountry]);

  // ==========================================
  // ✅ UPLOAD API HANDLER (/upload)
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
  // ✅ ACTUAL SUBMIT HANDLER (/agency/agency-signup)
  // ==========================================
  const onFinish = async (values) => {
    setLoading(true);
    
    try {
      const parsedPhone = parsePhoneNumberFromString(`+${values.phone}`);
      const extractedCountryCode = parsedPhone ? `+${parsedPhone.countryCallingCode}` : "+971";

      const opCountryObj = Country.getCountryByCode(values.operating_country);
      const addCountryObj = Country.getCountryByCode(values.address_country);
      const addStateObj = State.getStateByCodeAndCountry(values.address_state, values.address_country);

      const payload = {
        agency_name: values.agency_name,
        email: values.email,
        password: values.password,
        country_code: extractedCountryCode,
        mobile_number: `+${values.phone}`, 
        address: values.address_line,
        city: values.address_city || values.operating_city,
        profile_photo: getUploadedUrl(values.profile_photo),
        trade_license: getUploadedUrl(values.trade_license),

        operating_country: opCountryObj ? opCountryObj.name : values.operating_country,
        operating_city: values.operating_city,
        commissionStructure: {
          agentPercentage: values.agentPercentage,
          agencyPercentage: values.agencyPercentage
        },
        address_country: addCountryObj ? addCountryObj.name : values.address_country,
        address_state: addStateObj ? addStateObj.name : values.address_state,
        zip_code: values.zip_code,
        logo: getUploadedUrl(values.logo),
        rera_license: getUploadedUrl(values.rera_license),
        letter_of_authority: getUploadedUrl(values.letter_of_authority),
      };

      // ✅ ACTUAL API CALL
      const response = await apiService.post("/agency/agency-signup", payload);
      
      message.success(response?.data?.message || "Agency onboarded successfully!");
      form.resetFields();
      
      // ✅ REDIRECT TO LIST PAGE ON SUCCESS
      navigate("/dashboard/admin/agency-list");
      
    } catch (error) {
      console.error(error);
      message.error(error?.response?.data?.message || "Failed to onboard agency. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ File upload normalizer
  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  // ✅ PREVIEW HANDLER
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
          <Title level={3} style={{ margin: 0, color: "#1f2937" }}>Onboard New Agency</Title>
          <Text type="secondary">Fill in the details to register a new real estate agency.</Text>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ 
          operating_country: "AE",
          address_country: "AE",
          agentPercentage: 70,
          agencyPercentage: 30
        }}
      >
        <Row gutter={[24, 24]}>
          
          {/* ========================================== */}
          {/* LEFT COLUMN - MAIN DETAILS                 */}
          {/* ========================================== */}
          <Col xs={24} lg={16}>
            
            {/* 1. AGENCY & ACCOUNT INFO */}
            <Card 
              title={<Space><BankOutlined style={{ color: BRAND_PURPLE }}/> Agency & Account Info</Space>} 
              bordered={false} 
              style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: "24px" }}
            >
              <Row gutter={16}>
                <Col xs={24}>
                  <Form.Item name="agency_name" label="Agency Name" rules={[{ required: true, message: "Please enter agency name" }]}>
                    <Input placeholder="e.g. Nexus Real Estate" size="large" style={{ borderRadius: "8px" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="email" label="Login Email" rules={[{ required: true, type: 'email' }]}>
                    <Input placeholder="agency@xoto.com" size="large" style={{ borderRadius: "8px" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="password" label="Temporary Password" rules={[{ required: true, min: 6 }]}>
                    <Input.Password placeholder="Enter secure password" size="large" style={{ borderRadius: "8px" }} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* 2. CONTACT & OPERATING LOCATION */}
            <Card 
              title={<Space><ContactsOutlined style={{ color: BRAND_PURPLE }}/> Contact & Operating Location</Space>} 
              bordered={false} 
              style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: "24px" }}
            >
              <Row gutter={16}>
                
                {/* ✅ STRICT VALIDATED PHONE INPUT */}
                <Col xs={24}>
                  <Form.Item 
                    name="phone" 
                    label="Mobile Number" 
                    rules={[
                      { required: true, message: "Phone number is required" },
                      {
                        validator: (_, value) => {
                          if (!value) return Promise.resolve();
                          const phoneNumber = parsePhoneNumberFromString(`+${value}`);
                          if (phoneNumber && phoneNumber.isValid()) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error("Strict: Invalid mobile number for the selected country"));
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

                <Col xs={24} md={12}>
                  <Form.Item name="operating_country" label="Operating Country" rules={[{ required: true }]}>
                    <Select 
                      size="large" showSearch placeholder="Select Country" optionFilterProp="children"
                      style={{ borderRadius: "8px" }}
                      onChange={() => form.setFieldsValue({ operating_city: undefined })}
                    >
                      {Country.getAllCountries().map((c) => (<Option key={c.isoCode} value={c.isoCode}>{c.name}</Option>))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="operating_city" label="Operating City" rules={[{ required: true }]}>
                    <Select 
                      size="large" showSearch placeholder="Select City" optionFilterProp="children"
                      style={{ borderRadius: "8px" }}
                      disabled={opCitiesList.length === 0}
                    >
                      {opCitiesList.map((city, idx) => (<Option key={`${city.name}-${idx}`} value={city.name}>{city.name}</Option>))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* 3. COMMISSION STRUCTURE */}
            <Card 
              title={<Space><WalletOutlined style={{ color: BRAND_PURPLE }}/> Default Commission Structure</Space>} 
              bordered={false} 
              style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: "24px" }}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="agentPercentage" label="Agent Share (%)">
                    <InputNumber min={0} max={100} size="large" style={{ width: "100%", borderRadius: "8px" }} addonAfter="%" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="agencyPercentage" label="Agency Share (%)">
                    <InputNumber min={0} max={100} size="large" style={{ width: "100%", borderRadius: "8px" }} addonAfter="%" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* 4. HEAD OFFICE ADDRESS */}
            <Card 
              title={<Space><BankOutlined style={{ color: BRAND_PURPLE }}/> Head Office Address</Space>} 
              bordered={false} 
              style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="address_country" label="Country" rules={[{ required: true }]}>
                    <Select 
                      size="large" showSearch placeholder="Select Country" optionFilterProp="children"
                      onChange={() => { form.setFieldsValue({ address_state: undefined, address_city: undefined }); }}
                    >
                      {Country.getAllCountries().map((c) => (<Option key={c.isoCode} value={c.isoCode}>{c.name}</Option>))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="address_state" label="State/Emirate" rules={[{ required: true }]}>
                    <Select 
                      size="large" showSearch placeholder="Select State" optionFilterProp="children"
                      disabled={statesList.length === 0}
                      onChange={() => form.setFieldsValue({ address_city: undefined })}
                    >
                      {statesList.map((s) => (<Option key={s.isoCode} value={s.isoCode}>{s.name}</Option>))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="address_city" label="City" rules={[{ required: true }]}>
                    <Select size="large" showSearch placeholder="Select City" optionFilterProp="children" disabled={citiesList.length === 0}>
                      {citiesList.map((city, idx) => (<Option key={`${city.name}-${idx}`} value={city.name}>{city.name}</Option>))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="zip_code" label="Zip / Postal Code">
                    <Input size="large" placeholder="e.g. 00000" style={{ borderRadius: "8px" }} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="address_line" label="Street Address" rules={[{ required: true }]}>
                <Input.TextArea placeholder="Office 123, Business Bay..." rows={2} style={{ borderRadius: "8px" }} />
              </Form.Item>
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
              <Form.Item name="logo" label="Agency Logo" valuePropName="fileList" getValueFromEvent={normFile}>
                <Upload customRequest={customUploadRequest} listType="picture" maxCount={1} onPreview={handlePreview}>
                  <Button icon={<UploadOutlined />} style={{ borderRadius: "8px", width: "100%" }}>Upload Logo</Button>
                </Upload>
              </Form.Item>

              <Form.Item name="profile_photo" label="Profile Photo" valuePropName="fileList" getValueFromEvent={normFile}>
                <Upload customRequest={customUploadRequest} listType="picture" maxCount={1} onPreview={handlePreview}>
                  <Button icon={<UploadOutlined />} style={{ borderRadius: "8px", width: "100%" }}>Upload Photo</Button>
                </Upload>
              </Form.Item>

              <Divider style={{ margin: "16px 0" }} />

              <Text strong style={{ display: "block", marginBottom: "8px" }}>Legal Documents</Text>
              
              <Form.Item name="trade_license" label="Trade License" valuePropName="fileList" getValueFromEvent={normFile} rules={[{required: true, message: "Required"}]}>
                <Upload customRequest={customUploadRequest} listType="picture" maxCount={1} onPreview={handlePreview}>
                  <Button icon={<UploadOutlined />} style={{ borderRadius: "8px", width: "100%" }}>Trade License</Button>
                </Upload>
              </Form.Item>

              <Form.Item name="rera_license" label="RERA License" valuePropName="fileList" getValueFromEvent={normFile}>
                <Upload customRequest={customUploadRequest} listType="picture" maxCount={1} onPreview={handlePreview}>
                  <Button icon={<UploadOutlined />} style={{ borderRadius: "8px", width: "100%" }}>RERA License</Button>
                </Upload>
              </Form.Item>

              <Form.Item name="letter_of_authority" label="Letter of Authority" valuePropName="fileList" getValueFromEvent={normFile} style={{ marginBottom: "0" }}>
                <Upload customRequest={customUploadRequest} listType="picture" maxCount={1} onPreview={handlePreview}>
                  <Button icon={<UploadOutlined />} style={{ borderRadius: "8px", width: "100%" }}>Letter of Authority</Button>
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
            {loading ? "Onboarding..." : "Register Agency"}
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
        /* Make sure PhoneInput matches Ant Design inputs */
        .react-tel-input .form-control {
          font-family: inherit !important;
          font-size: 14px !important;
        }
        .react-tel-input .flag-dropdown {
          background-color: #fafafa !important;
          border-color: #d9d9d9 !important;
        }
        .react-tel-input .form-control:focus,
        .react-tel-input .form-control:hover {
          border-color: ${BRAND_PURPLE} !important;
          box-shadow: none !important;
        }
      `}</style>
    </div>
  );
};

export default AddAgency;