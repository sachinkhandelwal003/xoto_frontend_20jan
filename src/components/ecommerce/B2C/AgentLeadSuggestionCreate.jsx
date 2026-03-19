import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Card, Typography, Input, Button, Tag, message, Form,
  Select, InputNumber, Row, Col, AutoComplete, Spin, Space, Divider,Tooltip 
} from "antd";
import {
  UserOutlined, PhoneOutlined, MailOutlined, HomeOutlined,
  DollarOutlined, EnvironmentOutlined, RocketOutlined,
  BulbOutlined, CheckCircleFilled, AppstoreAddOutlined,
  AimOutlined, EyeOutlined, CheckOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import debounce from "lodash/debounce";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Role mapping to handle dynamic dashboard routing
const roleSlugMap = {
  '0': 'superadmin', '1': 'admin', '2': "customer",
  '5': 'vendor-b2c', '6': 'vendor-b2b', '7': 'freelancer',
  '11': 'accountant', '12': 'supervisor', '15': "agency", 
  '16': "agent", '17': "developer"
};

export default function AgentLeadSuggestionCreate() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [form] = Form.useForm();
  
  const roleSlug = roleSlugMap[user?.role?.code] ?? "dashboard";

  // ================= STATES =================
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  
  // NEW: State to track which properties the agent has manually selected
  const [selectedProperties, setSelectedProperties] = useState([]);

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
        const fetchedData = response.data || [];
        setAiSuggestions(fetchedData);
        
        // Auto-select top matches (optional, here we just reset selection on new search)
        setSelectedProperties([]);
      }
    } catch (error) {
      console.error("AI Suggestions error:", error);
    } finally {
      setAiLoading(false);
    }
  }, 500);

  const onValuesChange = (changedValues, allValues) => {
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

  // ================= TOGGLE PROPERTY SELECTION =================
  const togglePropertySelection = (propertyId) => {
    setSelectedProperties((prev) => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId) 
        : [...prev, propertyId]
    );
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
        // Send the AI data AND the specifically chosen properties to the backend
        aiSuggestions: aiSuggestions,
        selected_properties: selectedProperties 
      };

      const response = await apiService.post("/agent/lead/create-lead", payload);

      if (response.success) {
        message.success("Lead created successfully");
        if (selectedProperties.length > 0) {
          message.info(`${selectedProperties.length} properties linked to lead`);
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
        <div className="flex flex-col items-center justify-center h-full py-20">
          <Spin size="large" />
          <Text className="mt-6 text-gray-500 font-medium text-lg">Analyzing requirements...</Text>
          <Text className="text-gray-400 text-sm mt-1">Scanning premium inventory matches</Text>
        </div>
      );
    }

    if (aiSuggestions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 h-full">
          <div className="bg-gray-50 border border-gray-100 p-5 rounded-full mb-4">
            <AimOutlined className="text-4xl text-gray-300" />
          </div>
          <Title level={4} className="!text-gray-600 !mb-1 font-medium">No Matches Found Yet</Title>
          <Text className="text-gray-400 text-center max-w-xs">
            Enter the client's budget, location, or property preferences to trigger the matching engine.
          </Text>
        </div>
      );
    }

    return (
      <div className="space-y-4 pr-2 pb-10">
        <div className="flex items-center justify-between mb-4">
          <Space>
            <div className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-100">
              <RocketOutlined className="text-indigo-600 text-xl" />
            </div>
            <Title level={4} className="!mb-0 text-gray-800">Top Matches ({aiSuggestions.length})</Title>
          </Space>
          <Text className="text-indigo-600 font-medium text-sm bg-indigo-50 px-3 py-1 rounded-lg">
            {selectedProperties.length} Selected
          </Text>
        </div>

        {aiSuggestions.map((suggestion) => {
          const prop = suggestion.property;
          const isHighMatch = suggestion.matchScore > 80;
          const isSelected = selectedProperties.includes(prop._id);

          return (
            <div
              key={prop._id}
              onClick={() => togglePropertySelection(prop._id)}
              className={`bg-white rounded-2xl border cursor-pointer hover:shadow-lg transition-all duration-300 relative overflow-hidden group ${
                isSelected 
                  ? 'border-indigo-500 ring-2 ring-indigo-100 shadow-md' 
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              {/* Left Color Bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors ${
                isSelected ? 'bg-indigo-500' : isHighMatch ? 'bg-emerald-400' : 'bg-amber-400'
              }`}></div>

              {/* Selection Checkmark */}
              {isSelected && (
                <div className="absolute top-3 left-4 z-10 bg-indigo-500 text-white rounded-full p-1 shadow-sm">
                  <CheckOutlined className="text-xs" />
                </div>
              )}

              <Row className="items-stretch">
                {/* Image Col */}
                <Col xs={8} sm={7} className="p-3 pr-0">
                  <div className="relative h-32 md:h-full w-full rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={prop.mainLogo || prop.photos?.[0] || 'https://via.placeholder.com/300x200?text=Property'}
                      alt={prop.propertyName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Tag
                        color={isHighMatch ? 'success' : 'warning'}
                        className="m-0 border-none font-bold px-2 py-0.5 rounded-lg shadow-sm"
                      >
                        {suggestion.matchScore}% 
                      </Tag>
                    </div>
                  </div>
                </Col>
                
                {/* Details Col */}
                <Col xs={16} sm={17} className="p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <Title level={5} className="!mb-1 text-gray-800 line-clamp-1 pr-2" title={prop.propertyName}>
                        {prop.propertyName}
                      </Title>
                      
                      {/* Navigate to Project Button */}
                      <Tooltip title="View Project Details">
                        <Button 
                          type="text" 
                          icon={<EyeOutlined />} 
                          className="text-gray-400 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevents selecting the card
                            navigate(`/dashboard/${roleSlug}/projects/${prop._id}`);
                          }}
                        />
                      </Tooltip>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-2 mt-2">
                      <div className="flex items-center text-gray-600">
                        <DollarOutlined className="text-emerald-500 mr-2 text-lg" />
                        <span className="font-bold text-gray-800 text-sm">
                          {prop.price?.toLocaleString() || "TBD"} {prop.currency || 'AED'}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <HomeOutlined className="text-indigo-500 mr-2 text-lg" />
                        <span className="font-medium text-sm text-gray-700">{prop.bedrooms || "-"} BHK</span>
                      </div>
                      <div className="flex items-center text-gray-600 col-span-2">
                        <EnvironmentOutlined className="text-gray-400 mr-2" />
                        <span className="truncate text-xs" title={prop.area || prop.city}>
                          {prop.area || prop.city || "Location TBD"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <div className="flex flex-wrap gap-1">
                      {suggestion.matchReasons?.slice(0, 2).map((reason, idx) => (
                        <span key={idx} className="text-gray-600 text-[10px] font-medium flex items-center bg-white px-2 py-0.5 rounded shadow-sm">
                          {reason}
                        </span>
                      ))}
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
            <AppstoreAddOutlined className="text-indigo-600 text-3xl" />
            Create Smart Lead
          </Title>
          <Text className="text-gray-500 text-base">
            Enter client parameters to instantly map matching inventory.
          </Text>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* ================= LEFT SIDE - LEAD FORM ================= */}
        <Col xs={24} lg={12} xl={11}>
          <Card className="rounded-3xl border-none bg-white shadow-sm hover:shadow-md transition-all duration-300 h-full">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              onValuesChange={onValuesChange}
              initialValues={{ source: "manual", status: "customer" }}
            >
              {/* SECTION 1: Client Info */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="bg-blue-50 text-blue-500 p-2.5 rounded-xl">
                    <UserOutlined className="text-xl" />
                  </div>
                  <Title level={4} className="!mb-0 !text-gray-800 font-bold">Client Profile</Title>
                </div>
                
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item name="first_name" label={<span className="font-semibold text-gray-600">First Name</span>} rules={[{ required: true, message: "Required" }]}>
                      <Input size="large" placeholder="E.g. John" className="rounded-xl bg-gray-50 border-gray-200 hover:border-indigo-400 focus:border-indigo-500" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="last_name" label={<span className="font-semibold text-gray-600">Last Name</span>} rules={[{ required: true, message: "Required" }]}>
                      <Input size="large" placeholder="E.g. Doe" className="rounded-xl bg-gray-50 border-gray-200 hover:border-indigo-400 focus:border-indigo-500" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="phone_number" label={<span className="font-semibold text-gray-600">Phone Number</span>} rules={[{ required: true, message: "Required" }]}>
                      <Input size="large" prefix={<PhoneOutlined className="text-gray-400" />} placeholder="+971 50 123 4567" className="rounded-xl bg-gray-50 border-gray-200 hover:border-indigo-400 focus:border-indigo-500"/>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="email" label={<span className="font-semibold text-gray-600">Email Address</span>}>
                      <Input size="large" prefix={<MailOutlined className="text-gray-400" />} placeholder="john.doe@corporate.com" className="rounded-xl bg-gray-50 border-gray-200 hover:border-indigo-400 focus:border-indigo-500" />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              <Divider className="border-gray-100" />

              {/* SECTION 2: Requirements */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="bg-emerald-50 text-emerald-500 p-2.5 rounded-xl">
                    <HomeOutlined className="text-xl" />
                  </div>
                  <Title level={4} className="!mb-0 !text-gray-800 font-bold">Property Requirements</Title>
                </div>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item name="budget" label={<span className="font-semibold text-gray-600">Max Budget (AED)</span>}>
                      <InputNumber
                        size="large"
                        className="w-full rounded-xl bg-gray-50 border-gray-200"
                        min={0}
                        step={100000}
                        placeholder="E.g. 2,000,000"
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="bedrooms" label={<span className="font-semibold text-gray-600">Bedrooms</span>}>
                      <Select size="large" placeholder="Select Layout" allowClear className="rounded-xl">
                        <Option value={1}>1 Bedroom</Option>
                        <Option value={2}>2 Bedrooms</Option>
                        <Option value={3}>3 Bedrooms</Option>
                        <Option value={4}>4+ Bedrooms</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="property_type" label={<span className="font-semibold text-gray-600">Property Type</span>}>
                      <Select size="large" placeholder="Select Type" allowClear className="rounded-xl">
                        <Option value="Apartment">Apartment</Option>
                        <Option value="Villa">Villa</Option>
                        <Option value="Townhouse">Townhouse</Option>
                        <Option value="Penthouse">Penthouse</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="preferred_location" label={<span className="font-semibold text-gray-600">Target Location</span>}>
                      <AutoComplete
                        size="large"
                        options={locationOptions}
                        onSearch={handleLocationSearch}
                        placeholder="Search district or area"
                        allowClear
                        className="rounded-xl"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="requirement_description" label={<span className="font-semibold text-gray-600">Additional Context / Notes</span>}>
                      <TextArea 
                        rows={4} 
                        placeholder="Enter views preferred, payment plan details, or specific amenities required..." 
                        className="rounded-xl bg-gray-50 border-gray-200 hover:bg-white focus:bg-white"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              <Form.Item className="mb-0 mt-6 pt-6 border-t border-gray-100">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  block
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border-none shadow-md rounded-xl h-14 text-lg font-bold tracking-wide"
                >
                  Save Lead & Link Selected Properties
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* ================= RIGHT SIDE - AI SUGGESTIONS ================= */}
        <Col xs={24} lg={12} xl={13}>
          <div className="sticky top-6 h-[calc(100vh-100px)]">
            <Card className="rounded-3xl border border-gray-200 bg-white shadow-sm h-full flex flex-col overflow-hidden" bodyStyle={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
              
              {/* Internal Header for AI Card */}
              <div className="bg-indigo-50/50 border-b border-indigo-100 p-5 flex-shrink-0">
                <div className="flex justify-between items-center">
                  <Space>
                    <div className="bg-white p-2.5 shadow-sm rounded-xl border border-indigo-100">
                      <BulbOutlined className="text-indigo-600 text-xl" />
                    </div>
                    <div>
                      <Title level={4} className="!mb-0 !text-indigo-900 font-bold">Live AI Matcher</Title>
                      <Text className="text-xs font-medium text-indigo-500">Auto-updates as you type</Text>
                    </div>
                  </Space>
                </div>
              </div>

              {/* Scrollable Content Area */}
              <div className="p-5 overflow-y-auto flex-1 bg-gray-50/30 relative">
                {renderAISuggestions()}
              </div>
              
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
}