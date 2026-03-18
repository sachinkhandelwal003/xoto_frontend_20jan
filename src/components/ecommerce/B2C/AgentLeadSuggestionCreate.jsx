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
  Space,
  Divider
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
  ArrowLeftOutlined,
  CheckCircleFilled,
  AppstoreAddOutlined,
  AimOutlined
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
  const [, setFormData] = useState({});

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
        aiSuggestions: aiSuggestions 
      };

      const response = await apiService.post("/agent/lead/create-lead", payload);

      if (response.success) {
        message.success("Lead created successfully");
        if (aiSuggestions.length > 0) {
          message.info(`${aiSuggestions.length} property suggestions saved`);
        }
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
        <div className="p-4 md:p-8 bg-gradient-to-br from-gray-100 via-slate-100 to-gray-200 min-h-screen">
          <Spin size="large" />
          <Text className="mt-6 text-gray-500 font-medium">Analyzing requirements...</Text>
          <Text className="text-gray-400 text-sm mt-1">Scanning premium inventory matches</Text>
        </div>
      );
    }

    if (aiSuggestions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 h-full">
          <div className="bg-gray-50 border border-gray-100 p-5 rounded-full mb-4">
            <AimOutlined className="text-3xl text-gray-400" />
          </div>
          <Title level={4} className="!text-gray-600 !mb-1 font-medium">No Matches Found Yet</Title>
          <Text className="text-gray-400 text-center max-w-xs">
            Enter the client's budget, location, or property preferences to trigger the matching engine.
          </Text>
        </div>
      );
    }

    return (
      <div className="space-y-4 pr-2">
        <div className="flex items-center justify-between mb-2">
          <Space>
            <div className="bg-[#f0ebff] p-2 rounded-lg border border-[#e5d9ff]">
              <RocketOutlined className="text-[#7c3aed] text-lg" />
            </div>
            <Text strong className="text-lg text-gray-800">Top Inventory Matches ({aiSuggestions.length})</Text>
          </Space>
        </div>

        {aiSuggestions.map((suggestion, index) => {
          const isHighMatch = suggestion.matchScore > 80;
          return (
            <div
              key={suggestion.property._id}
              className={`bg-white rounded-xl p-3 border hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative overflow-hidden group ${
                isHighMatch ? 'border-green-200' : 'border-gray-200'
              }`}
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${isHighMatch ? 'bg-green-500' : 'bg-yellow-500'}`}></div>

              <Row gutter={16}>
                <Col span={8}>
                  <div className="relative h-full min-h-[100px]">
                    <img
                      src={suggestion.property.mainLogo || 'https://via.placeholder.com/300x200?text=Property'}
                      alt={suggestion.property.propertyName}
                      className="w-full h-full object-cover rounded-lg border border-gray-100"
                    />
                    <div className="absolute top-2 right-2 shadow-lg">
                      <Tag
                        color={isHighMatch ? '#52c41a' : '#faad14'}
                        className="m-0 border-none font-bold px-2 py-0.5 rounded-md shadow-lg"
                      >
                        {suggestion.matchScore}% Match
                      </Tag>
                    </div>
                  </div>
                </Col>
                
                <Col span={16} className="pl-0">
                  <div className="flex flex-col h-full justify-between py-1">
                    <div>
                      <Text strong className="text-base text-gray-800 line-clamp-1" title={suggestion.property.propertyName}>
                        {suggestion.property.propertyName}
                      </Text>
                      
                      <div className="grid grid-cols-2 gap-y-2 gap-x-1 text-sm mt-2">
                        <div className="flex items-center text-gray-600">
                          <DollarOutlined className="text-green-600 mr-1.5" />
                          <span className="font-medium text-gray-800">
                            {suggestion.property.price?.toLocaleString() || "TBD"}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <HomeOutlined className="text-[#7c3aed] mr-1.5" />
                          <span>{suggestion.property.bedrooms || "-"} BR</span>
                        </div>
                        <div className="flex items-center text-gray-600 col-span-2">
                          <EnvironmentOutlined className="text-gray-400 mr-1.5" />
                          <span className="truncate" title={suggestion.property.area || suggestion.property.city}>
                            {suggestion.property.area || suggestion.property.city || "Location TBD"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex flex-wrap gap-1.5">
                        {suggestion.matchReasons?.slice(0, 2).map((reason, idx) => (
                          <span key={idx} className="bg-gray-50 text-gray-600 text-[11px] px-2 py-1 rounded-md border border-gray-200 flex items-center">
                            <CheckCircleFilled className="text-green-500 mr-1 text-[10px]" />
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
      
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
         <Title level={2} className="!mb-1 !text-slate-900 flex items-center gap-3 font-bold tracking-tight">
            <AppstoreAddOutlined className="text-[#7c3aed] text-2xl" />
            Create Smart Lead
          </Title>
          <Text className="text-gray-500 text-base">
            Enter client parameters to instantly map matching inventory.
          </Text>
        </div>
       
      </div>

      <Row gutter={[24, 24]}>
        {/* ================= LEFT SIDE - LEAD FORM ================= */}
        <Col xs={24} lg={13} xl={14}>
         <Card className="rounded-2xl border border-gray-200 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.12)] transition-all duration-300 h-full">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              onValuesChange={onValuesChange}
              initialValues={{ source: "manual", status: "customer" }}
              className="mt-2"
            >
              {/* SECTION 1: Client Info */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-gray-50 border border-gray-200 p-2 rounded-lg">
                    <UserOutlined className="text-gray-600 text-lg" />
                  </div>
                  <Title level={4} className="!mb-0 !text-gray-800 font-semibold">Client Profile</Title>
                </div>
                
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item name="first_name" label={<span className="font-medium text-gray-600">First Name</span>} rules={[{ required: true, message: "Required" }]}>
                      <Input size="large" placeholder="E.g. John" className="rounded-xl bg-white border border-gray-200 hover:border-violet-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="last_name" label={<span className="font-medium text-gray-600">Last Name</span>} rules={[{ required: true, message: "Required" }]}>
                      <Input size="large" placeholder="E.g. Doe" className="rounded-xl bg-white border border-gray-200 hover:border-violet-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="phone_number" label={<span className="font-medium text-gray-600">Phone Number</span>} rules={[{ required: true, message: "Required" }]}>
                      <Input size="large" prefix={<PhoneOutlined className="text-gray-400" />} placeholder="+971 50 123 4567" className="rounded-xl bg-white border border-gray-200 hover:border-violet-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all"/>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="email" label={<span className="font-medium text-gray-600">Email Address</span>}>
                      <Input size="large" prefix={<MailOutlined className="text-gray-400" />} placeholder="john.doe@corporate.com" className="rounded-xl bg-white border border-gray-200 hover:border-violet-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all" />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              <Divider className="border-gray-100" />

              {/* SECTION 2: Requirements */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-gray-50 border border-gray-200 p-2 rounded-lg">
                    <HomeOutlined className="text-gray-600 text-lg" />
                  </div>
                  <Title level={4} className="!mb-0 !text-gray-800 font-semibold">Property Requirements</Title>
                </div>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item name="budget" label={<span className="font-medium text-gray-600">Max Budget (AED)</span>}>
                      <InputNumber
                        size="large"
                        className="w-full rounded-lg bg-gray-50"
                        min={0}
                        step={100000}
                        placeholder="E.g. 2,000,000"
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="bedrooms" label={<span className="font-medium text-gray-600">Bedrooms</span>}>
                      <Select size="large" placeholder="Select Specification" allowClear className="rounded-lg">
                        <Option value={1}>1 Bedroom</Option>
                        <Option value={2}>2 Bedrooms</Option>
                        <Option value={3}>3 Bedrooms</Option>
                        <Option value={4}>4+ Bedrooms</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="property_type" label={<span className="font-medium text-gray-600">Property Type</span>}>
                      <Select size="large" placeholder="Select Type" allowClear className="rounded-lg">
                        <Option value="Apartment">Apartment</Option>
                        <Option value="Villa">Villa</Option>
                        <Option value="Townhouse">Townhouse</Option>
                        <Option value="Penthouse">Penthouse</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="preferred_location" label={<span className="font-medium text-gray-600">Target Location</span>}>
                      <AutoComplete
                        size="large"
                        options={locationOptions}
                        onSearch={handleLocationSearch}
                        placeholder="Search district or area"
                        allowClear
                        className="rounded-lg"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="project" label={<span className="font-medium text-gray-600">Specific Project (Optional)</span>}>
                      <Select 
                        size="large" 
                        placeholder="Search specific project directory" 
                        allowClear 
                        showSearch 
                        optionFilterProp="children"
                      >
                        {projects.map((p) => (
                          <Option key={p._id} value={p._id}>
                            {p.propertyName} {p.developer ? `(${p.developer})` : ''}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="requirement_description" label={<span className="font-medium text-gray-600">Additional Context / Notes</span>}>
                      <TextArea 
                        rows={3} 
                        placeholder="Enter views preferred, payment plan details, or specific amenities required..." 
                        className="rounded-lg bg-gray-50 hover:bg-white focus:bg-white"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              <Form.Item className="mb-0 mt-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  block
                  className="bg-[#7c3aed] hover:bg-[#6d28d9] border-none shadow-xl shadow-[#7c3aed]/30 rounded-xl h-12 text-base font-semibold tracking-wide"
                >
                  Save Lead Profile
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* ================= RIGHT SIDE - AI SUGGESTIONS ================= */}
        <Col xs={24} lg={11} xl={10}>
          <div className="sticky top-6">
            <Card className="rounded-3xl border border-gray-200 bg-white shadow-[10px_10px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.12)] transition-all duration-300 overflow-hidden">
              {/* Internal Header for AI Card */}
              <div className="bg-gray-50 border-b border-gray-100 p-5">
                <div className="flex justify-between items-center">
                  <Space>
                    <div className="bg-white p-2 shadow-xl rounded-lg border border-gray-200">
                      <BulbOutlined className="text-gray-600 text-xl" />
                    </div>
                    <div>
                      <Title level={4} className="!mb-0 !text-gray-800 font-semibold">Live Matcher Engine</Title>
                      <Text className="text-xs text-gray-500">Auto-updates as parameters are set</Text>
                    </div>
                  </Space>
                </div>
              </div>

              {/* Scrollable Content Area */}
              <div className="p-5 overflow-y-auto bg-white" style={{ height: 'calc(100% - 76px)' }}>
                {renderAISuggestions()}
              </div>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
}