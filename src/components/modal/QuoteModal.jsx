import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Form, 
  Input, 
  Select, 
  Button, 
  Typography, 
  message,
  Card,
  Space,
  Divider,
  Row,
  Col
} from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  CloseOutlined,
  ToolOutlined,
  FileTextOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { apiService } from '../../manageApi/utils/custom.apiservice';
import { showSuccessAlert } from '../../manageApi/utils/sweetAlert';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const countryCodes = [
  { value: "+91", label: "+91 India" },
  { value: "+971", label: "+971 UAE" },
  { value: "+966", label: "+966 Saudi Arabia" },
  { value: "+1", label: "+1 USA/Canada" },
  { value: "+44", label: "+44 UK" },
  { value: "+61", label: "+61 Australia" },
];

const QuoteModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [fetchingSubcat, setFetchingSubcat] = useState(false);
  const [countryCode, setCountryCode] = useState("+971");
  const [mobileNumber, setMobileNumber] = useState("");

  // Load Categories
  useEffect(() => {
    if (!isOpen) return;
    const loadCategories = async () => {
      try {
        const res = await apiService.get("/freelancer/category?active=true");
        if (res.data?.length) {
          setCategories(res.data.map(c => ({ value: c._id, label: c.name })));
        }
      } catch (err) {
        message.error("Failed to load categories");
      }
    };
    loadCategories();
  }, [isOpen]);

  // Load Subcategories
  const handleCategoryChange = async (value) => {
    setSelectedCategory(value);
    setSubcategories([]);
    form.setFieldsValue({ subcategories: undefined });
    if (!value) return;

    setFetchingSubcat(true);
    try {
      const res = await apiService.get(`/freelancer/subcategory?category=${value}`);
      if (res.data?.length) {
        setSubcategories(res.data.map(s => ({ value: s._id, label: s.name })));
      }
    } catch (err) {
      message.error("Failed to load subcategories");
    } finally {
      setFetchingSubcat(false);
    }
  };

  const closeModal = () => {
    onClose?.();
    form.resetFields();
    setSubcategories([]);
    setSelectedCategory(null);
    setMobileNumber("");
    setCountryCode("+971");
  };

 const onFinish = async (values) => {
  if (!mobileNumber || mobileNumber.length < 8) {
    return message.error("Please enter a valid mobile number");
  }

  setLoading(true);

  const payload = {
    customer_name: values.customer_name.trim(),
    customer_email: values.customer_email.trim().toLowerCase(),
    customer_mobile: {
      country_code: countryCode,
      number: mobileNumber.replace(/\D/g, "").slice(0, 15)
    },
    category: values.category,
    subcategories: values.subcategories || [],
    description: values.description?.trim() || "No details provided"
  };

  try {
    const res = await apiService.post("/estimates/submit", payload);

    // ✅ Replace Ant message with custom sweet alert
    showSuccessAlert(
      "Success!",
      "Thank you! Your estimate request has been submitted successfully. We'll contact you soon!"
    );

    // Reset form
    form.resetFields();
    setMobileNumber("");

    setTimeout(closeModal, 2000);

  } catch (err) {
    const errorMsg = err.response?.data?.message || "Submission failed. Please try again.";
    message.error(errorMsg);
  } finally {
    setLoading(false);
  }
};

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl mx-auto overflow-hidden relative"
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition"
              style={{ border: 'none' }}
            />

            {/* Header - Purple Theme */}
            <div className="bg-gradient-to-r from-purple-700 to-purple-900 p-8 text-white text-center">
              <Space direction="vertical" size="middle" className="w-full">
                <CheckCircleOutlined className="text-4xl text-white" />
                <Title level={2} className="!text-white !text-3xl lg:!text-4xl !mb-0">
                  Get Your Free Estimate
                </Title>
                <Text className="!text-white/90 text-lg">
                  Fill out the form below and get quotes from top professionals
                </Text>
              </Space>
            </div>

            {/* Form Body */}
            <div className="p-6 lg:p-3">
              <div className="max-w-5xl mx-auto">
                <Form 
                  form={form} 
                  layout="vertical" 
                  onFinish={onFinish}
                  size="large"
                  className="space-y-2"
                >
                  <Row gutter={[16, 0]}>
                    {/* Personal Information */}
                    <Col xs={24} lg={8}>
                      <Card 
                        title={
                          <Space>
                            <UserOutlined />
                            <span>Personal Information</span>
                          </Space>
                        } 
                        size="small"
                        className="shadow-sm h-full"
                      >
                        <Space direction="vertical" className="w-full" size="middle">
                          <Form.Item 
                            name="customer_name" 
                            label="Full Name" 
                            rules={[{ required: true, message: "Please enter your full name" }]}
                            className="mb-0"
                          >
                            <Input 
                              placeholder="John Doe" 
                              prefix={<UserOutlined className="text-gray-400" />}
                              className="rounded-lg"
                              allowClear
                            />
                          </Form.Item>

                          <Form.Item 
                            name="customer_email" 
                            label="Email Address" 
                            rules={[
                              { required: true, message: "Please enter your email" },
                              { type: 'email', message: "Please enter a valid email address" }
                            ]}
                            className="mb-0"
                          >
                            <Input 
                              placeholder="john@example.com" 
                              prefix={<MailOutlined className="text-gray-400" />}
                              className="rounded-lg"
                              allowClear
                            />
                          </Form.Item>

                          <Form.Item label="Mobile Number" required className="mb-0">
                            <Space.Compact className="w-full">
                              <Select
                                value={countryCode}
                                onChange={setCountryCode}
                                style={{ width: '120px' }}
                                showSearch
                                optionFilterProp="children"
                              >
                                {countryCodes.map(c => (
                                  <Option key={c.value} value={c.value}>
                                    {c.label}
                                  </Option>
                                ))}
                              </Select>
                              <Input
                                value={mobileNumber}
                                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                                placeholder="501234567"
                                maxLength={15}
                                prefix={<PhoneOutlined className="text-gray-400" />}
                                className="rounded-lg flex-1"
                                allowClear
                              />
                            </Space.Compact>
                            {mobileNumber && mobileNumber.length < 8 && (
                              <Text type="warning" className="text-xs">
                                Mobile number should be at least 8 digits
                              </Text>
                            )}
                          </Form.Item>
                        </Space>
                      </Card>
                    </Col>

                    {/* Service Information */}
                    <Col xs={24} lg={16}>
                      <Card 
                        title={
                          <Space>
                            <ToolOutlined />
                            <span>Service Information</span>
                          </Space>
                        } 
                        size="small"
                        className="shadow-sm h-full"
                      >
                        <Space direction="vertical" className="w-full" size="middle">
                          <Form.Item 
                            name="category" 
                            label="Service Category" 
                            rules={[{ required: true, message: "Please select a service category" }]}
                            className="mb-0"
                          >
                            <Select
                              showSearch
                              placeholder="Select service category"
                              optionFilterProp="label"
                              onChange={handleCategoryChange}
                              loading={categories.length === 0}
                              className="rounded-lg"
                              allowClear
                            >
                              {categories.map(category => (
                                <Option key={category.value} value={category.value} label={category.label}>
                                  {category.label}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>

                          <Form.Item 
                            name="subcategories" 
                            label="Specific Services"
                            className="mb-0"
                          >
                            <Select
                              mode="multiple"
                              placeholder="Choose relevant services"
                              className="rounded-lg"
                              loading={fetchingSubcat}
                              disabled={!selectedCategory}
                              allowClear
                              maxTagCount="responsive"
                            >
                              {subcategories.map(subcategory => (
                                <Option key={subcategory.value} value={subcategory.value}>
                                  {subcategory.label}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>

 <Card 
                    title={
                      <Space>
                        <FileTextOutlined />
                        <span>Project Details</span>
                      </Space>
                    } 
                    size="small"
                    className="shadow-sm"
                  >
                    <Form.Item 
                      name="description" 
                      rules={[{ required: true, message: "Please describe your project" }]}
                      className="mb-0"
                    >
                      <TextArea
                        placeholder="Please describe your project in detail. Include:
                        - Type of service needed
                        - Area size or dimensions  
                        - Specific requirements
                        - Preferred timeline
                        - Budget range (if any)
                        - Any special considerations"
                        className="rounded-lg resize-none"
                        showCount
                        maxLength={200}
                      />
                    </Form.Item>
                  </Card>

                        </Space>
                      </Card>
                    </Col>
                  </Row>

                  {/* Project Description */}
                 

                  <Divider />

                  {/* Submit Button */}
                  <Form.Item className="mb-0 text-center">
                    <Space direction="vertical" size="large" className="w-full">
                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        loading={loading}
                        icon={<CheckCircleOutlined />}
                        className="h-14 text-lg font-bold rounded-xl shadow-lg w-full max-w-md mx-auto"
                        style={{
                          backgroundColor: '#7e22ce',
                          borderColor: '#7e22ce',
                          boxShadow: '0 8px 25px rgba(126, 34, 206, 0.3)'
                        }}
                      >
                        {loading ? "Submitting Your Request..." : "Submit Estimate Request"}
                      </Button>
                      
                     
                    </Space>
                  </Form.Item>
                </Form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuoteModal;