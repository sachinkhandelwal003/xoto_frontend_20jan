import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Card,
  Typography,
  Input,
  Button,
  Tag,
  message,
  Form,
  Select,
  InputNumber,
  Row,
  Col,
  AutoComplete,
  Spin,
  Divider,
  Space,
  Avatar,
  Empty,
  Progress
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  RocketOutlined,
  BulbOutlined,
  WhatsAppOutlined,
  CalendarOutlined,
  StarOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import debounce from "lodash/debounce";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function AgentLeadSuggestionCreate() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [form] = Form.useForm();

  // ================= STATES =================
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [formData, setFormData] = useState({});

  // ================= FETCH PROJECTS =================
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await apiService.get("/property/get-all-properties?limit=1000");
      let list = [];
      if (Array.isArray(res?.data)) {
        list = res.data;
      } else if (res?.data?.data) {
        list = res.data.data;
      }
      setProjects(list);
    } catch (error) {
      console.log(error);
      message.error("Failed to fetch projects");
    }
  };

  // ================= AI SUGGESTIONS =================
  const fetchAISuggestions = debounce(async (values) => {
    // Only fetch if we have at least one criteria
    if (!values.budget && !values.bedrooms && !values.preferred_location && !values.property_type) {
      setAiSuggestions([]);
      return;
    }

    setAiLoading(true);
    try {
      const response = await apiService.post("/agent/lead/ai-suggestions", {
        budget: values.budget,
        bedrooms: values.bedrooms,
        preferred_location: values.preferred_location,
        property_type: values.property_type
      });

      if (response.success) {
        setAiSuggestions(response.data || []);
      }
    } catch (error) {
      console.error("AI Suggestions error:", error);
    } finally {
      setAiLoading(false);
    }
  }, 500);

  // Watch form changes
  const onValuesChange = (changedValues, allValues) => {
    setFormData(allValues);
    fetchAISuggestions(allValues);
  };

  // ================= LOCATION SEARCH =================
  const handleLocationSearch = async (value) => {
    if (!value || value.length < 3) return setLocationOptions([]);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${value}&limit=5`
      );
      const data = await response.json();
      setLocationOptions(
        data.map((item) => ({ value: item.display_name, label: item.display_name }))
      );
    } catch (error) {
      console.error("Location search failed", error);
    }
  };

  // ================= SUBMIT LEAD =================
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        name: {
          first_name: values.first_name,
          last_name: values.last_name
        },
        agent: user?._id || user?.id,
        source: values.source || "manual",
        status: "customer",
        aiSuggestions: aiSuggestions // Send AI suggestions to store as interests
      };

      const response = await apiService.post("/agent/lead/create-lead", payload);

      if (response.success) {
        message.success("Lead created successfully!");
        
        // Show success message with AI suggestions count
        if (aiSuggestions.length > 0) {
          message.info(`${aiSuggestions.length} AI property suggestions saved!`);
        }
        
        // Navigate back to leads list or reset form
        navigate(-1);
      }
    } catch (error) {
      message.error(error?.response?.data?.message || "Failed to create lead");
    } finally {
      setLoading(false);
    }
  };

  // ================= RENDER AI SUGGESTIONS =================
  const renderAISuggestions = () => {
    if (aiLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Spin size="large" />
          <Text className="mt-4 text-gray-500">AI is analyzing requirements...</Text>
        </div>
      );
    }

    if (aiSuggestions.length === 0) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div className="text-center">
              <BulbOutlined className="text-3xl text-gray-300 mb-2" />
              <Text className="text-gray-400">No AI suggestions yet</Text>
              <Text className="block text-xs text-gray-300 mt-1">
                Fill in budget, location or bedrooms to get suggestions
              </Text>
            </div>
          }
        />
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <Space>
            <RocketOutlined className="text-purple-600" />
            <Text strong>AI Found {aiSuggestions.length} Matches</Text>
          </Space>
          <Tag color="purple">Based on your criteria</Tag>
        </div>

        {aiSuggestions.map((suggestion, index) => (
          <Card
            key={suggestion.property._id}
            size="small"
            className="hover:shadow-lg transition-all duration-300 border-l-4"
            style={{ borderLeftColor: suggestion.matchScore > 80 ? '#52c41a' : '#faad14' }}
            bodyStyle={{ padding: '12px' }}
          >
            <Row gutter={12}>
              <Col span={6}>
                <div className="relative">
                  <img
                    src={suggestion.property.mainLogo || 'https://via.placeholder.com/100x80'}
                    alt={suggestion.property.propertyName}
                    className="w-full h-20 object-cover rounded-lg"
                  />
                  <Tag
                    color={suggestion.matchScore > 80 ? 'green' : 'orange'}
                    className="absolute top-1 right-1 text-xs"
                  >
                    {suggestion.matchScore}%
                  </Tag>
                </div>
              </Col>
              <Col span={18}>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Text strong className="text-base">
                      {suggestion.property.propertyName}
                    </Text>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div>
                      <DollarOutlined className="text-green-600 mr-1" />
                      <Text type="secondary">
                        {suggestion.property.price?.toLocaleString()} AED
                      </Text>
                    </div>
                    <div>
                      <HomeOutlined className="text-blue-600 mr-1" />
                      <Text type="secondary">
                        {suggestion.property.bedrooms} BR · {suggestion.property.bathrooms} Bath
                      </Text>
                    </div>
                    <div>
                      <EnvironmentOutlined className="text-red-600 mr-1" />
                      <Text type="secondary" className="truncate">
                        {suggestion.property.area || suggestion.property.city}
                      </Text>
                    </div>
                    <div>
                      <UserOutlined className="text-purple-600 mr-1" />
                      <Text type="secondary">{suggestion.property.developer}</Text>
                    </div>
                  </div>

                  <Progress
                    percent={suggestion.matchScore}
                    size="small"
                    showInfo={false}
                    strokeColor={suggestion.matchScore > 80 ? '#52c41a' : '#faad14'}
                    className="mt-1"
                  />

                  <div className="flex flex-wrap gap-1 mt-1">
                    {suggestion.matchReasons?.slice(0, 2).map((reason, idx) => (
                      <Tag key={idx} color="processing" className="text-xs m-0">
                        {reason}
                      </Tag>
                    ))}
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 bg-[#f6f7fb] min-h-screen">
      <Card className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <Title level={2} className="mb-0">🤖 Create New Lead</Title>
            <Text type="secondary">Fill in client details - AI will suggest matching properties</Text>
          </div>
          <Button onClick={() => navigate("/dashboard/agent/leads")}>
            Back to Leads
          </Button>
        </div>
      </Card>

      <Row gutter={24}>
        {/* LEFT SIDE - Lead Form */}
        <Col xs={24} lg={12}>
          <Card title="Client Information" className="h-full">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              onValuesChange={onValuesChange}
              initialValues={{
                source: "manual",
                status: "customer"
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="first_name"
                    label="First Name"
                    rules={[{ required: true, message: "First name required" }]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="John" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="last_name"
                    label="Last Name"
                    rules={[{ required: true, message: "Last name required" }]}
                  >
                    <Input placeholder="Doe" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="phone_number"
                    label="Phone Number"
                    rules={[{ required: true, message: "Phone required" }]}
                  >
                    <Input prefix={<PhoneOutlined />} placeholder="+971 50 123 4567" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="email" label="Email">
                    <Input prefix={<MailOutlined />} placeholder="john@email.com" />
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left">Property Requirements</Divider>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="budget" label="Budget (AED)">
                    <InputNumber
                      className="w-full"
                      min={0}
                      step={100000}
                      placeholder="2,000,000"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="bedrooms" label="Bedrooms">
                    <Select placeholder="Select" allowClear>
                      <Option value={1}>1 BHK</Option>
                      <Option value={2}>2 BHK</Option>
                      <Option value={3}>3 BHK</Option>
                      <Option value={4}>4+ BHK</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="property_type" label="Property Type">
                    <Select placeholder="Select" allowClear>
                      <Option value="Apartment">Apartment</Option>
                      <Option value="Villa">Villa</Option>
                      <Option value="Townhouse">Townhouse</Option>
                      <Option value="Commercial">Commercial</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="project" label="Target Project">
                    <Select placeholder="Select project" allowClear>
                      {projects.map((p) => (
                        <Option key={p._id} value={p._id}>
                          {p.propertyName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="preferred_location" label="Preferred Location">
                <AutoComplete
                  options={locationOptions}
                  onSearch={handleLocationSearch}
                  placeholder="Search location..."
                  allowClear
                />
              </Form.Item>

              <Form.Item name="requirement_description" label="Additional Requirements">
                <TextArea rows={3} placeholder="Any specific requirements..." />
              </Form.Item>

              <Divider />

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  block
                  icon={<RocketOutlined />}
                >
                  Create Lead
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* RIGHT SIDE - AI Suggestions */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <BulbOutlined className="text-yellow-500" />
                <span>AI Property Suggestions</span>
                {aiSuggestions.length > 0 && (
                  <Tag color="purple">{aiSuggestions.length} matches</Tag>
                )}
              </Space>
            }
            className="h-full"
            bodyStyle={{ 
              maxHeight: 'calc(100vh - 200px)', 
              overflowY: 'auto',
              padding: '16px'
            }}
          >
            {renderAISuggestions()}
          </Card>
        </Col>
      </Row>
    </div>
  );
}