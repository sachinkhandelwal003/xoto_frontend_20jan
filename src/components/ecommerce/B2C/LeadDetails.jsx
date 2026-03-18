import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { 
  Card, Tag, Typography, Avatar, Divider, Row, Col, 
  Statistic, Button, message, Modal, Spin, Space, Form, Input, DatePicker, TimePicker
} from "antd";
import { 
  UserOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined, 
  DollarCircleOutlined, FireOutlined, StarOutlined, RobotOutlined, 
  FilePdfOutlined, DownloadOutlined, LineChartOutlined, CheckCircleOutlined, CalendarOutlined,EyeOutlined 
} from "@ant-design/icons";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

// Role mapping to handle dynamic dashboard routing
const roleSlugMap = {
  '0': 'superadmin', '1': 'admin', '2': "customer",
  '5': 'vendor-b2c', '6': 'vendor-b2b', '7': 'freelancer',
  '11': 'accountant', '12': 'supervisor', '15': "agency", 
  '16': "agent", '17': "developer"
};

export default function LeadDetails() {
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  
  const { user } = useSelector((s) => s.auth);
  const roleSlug = roleSlugMap[user?.role?.code] ?? "dashboard";

  // Data States
  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState(null);
  const [interests, setInterests] = useState([]);
  const [analytics, setAnalytics] = useState({ totalInterests: 0, hotLeads: 0 });
  
  // UI Interaction States
  const [generatingId, setGeneratingId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBrochure, setSelectedBrochure] = useState(null);

  // Site Visit States
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [visitLoading, setVisitLoading] = useState(false);
  const [selectedInterestForVisit, setSelectedInterestForVisit] = useState(null);
  const [visitForm] = Form.useForm();

  // Helper: image URL builder
  const placeholderImg = "https://via.placeholder.com/400x250?text=No+Image+Available";
  const backendBaseUrl = import.meta.env?.VITE_API_URL || "http://localhost:5000";

  const getImageUrl = (item) => {
    let imageUrl = item?.property?.image || item?.property?.photos?.[0] || item?.property?.mainLogo;
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = `${backendBaseUrl}${imageUrl}`;
    }
    return imageUrl || placeholderImg;
  };

  const loadData = async () => {
    const leadId = params.id || location.state?.leadId || location.state?.lead?._id;
    if (!leadId) {
      message.error("No lead ID provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.get(`/agent/lead/get-lead/${leadId}?includeInterests=true`);
      const responseData = response?.data?.data || response?.data || response;
      
      setLead(responseData.lead || responseData);
      setInterests(responseData.interests || []);
      setAnalytics(responseData.analytics || { totalInterests: 0, hotLeads: 0 });
    } catch (error) {
      console.error("Failed to fetch lead details:", error);
      message.error("Failed to load lead details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  // Navigate to Brochure Generator
  const handleGenerateBrochure = (item) => {
    if (!lead?.email) {
      message.error("Lead doesn't have an email address!");
      return;
    }

    setGeneratingId(item._id);
    
    setTimeout(() => {
      setGeneratingId(null);
      navigate(`/dashboard/${roleSlug}/lead-details/brocure`, { 
        state: { 
          property: item.property,
          lead: { ...lead, interests: interests },
          matchScore: item?.ai_match?.score,
          analytics: analytics
        } 
      });
    }, 1500);
  };

  // Open Site Visit Modal
  const openSiteVisitModal = (item) => {
    setSelectedInterestForVisit(item);
    visitForm.setFieldsValue({
      clientName: `${lead?.name?.first_name || ''} ${lead?.name?.last_name || ''}`.trim(),
      clientPhone: lead?.phone_number || ''
    });
    setIsVisitModalOpen(true);
  };

  // Submit Site Visit
  const handleCreateSiteVisit = async (values) => {
    try {
      setVisitLoading(true);
      
      const payload = {
        lead: lead._id,
        property: selectedInterestForVisit.property._id,
        interestId: selectedInterestForVisit._id,
        scheduledDate: values.scheduledDate.format("YYYY-MM-DD"),
        visitTime: values.visitTime.format("hh:mm A"),
        clientName: values.clientName,
        clientPhone: values.clientPhone
      };

      await apiService.post("/agent/lead/create-site-visit", payload);
      
      message.success("Site visit scheduled successfully!");
      setIsVisitModalOpen(false);
      visitForm.resetFields();
      
      // Refresh lead data to show updated pipeline statuses
      loadData();
    } catch (error) {
      console.error("Site visit error:", error);
      message.error("Failed to schedule site visit.");
    } finally {
      setVisitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f6f7fb]">
        <Spin size="large" />
        <Text type="secondary" className="mt-4 text-lg">Loading lead intelligence...</Text>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f6f7fb]">
        <Card className="rounded-2xl shadow-sm p-10 text-center border-none">
          <Text type="secondary" className="text-lg">No Lead Data Found</Text>
          <br/>
          <Button type="primary" className="mt-4" onClick={() => navigate(-1)}>Go Back</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-8 bg-[#f6f7fb] min-h-screen">
      
      {/* ---------------- HEADER ---------------- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <Title level={3} className="!mb-1 text-gray-800">Lead Intelligence Hub</Title>
          <Text type="secondary">Detailed overview and AI property matches</Text>
        </div>
        <div>
          <Button 
            type="primary" 
            size="large"
            icon={<LineChartOutlined />} 
            className="bg-indigo-600 shadow-md hover:bg-indigo-700 rounded-xl font-medium"
            onClick={() => navigate(`/dashboard/${roleSlug}/track-brochures`, { state: { lead } })}
          >
            Track PDF Brochures
          </Button>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* ---------------- LEAD INFO CARD ---------------- */}
        <Col xs={24} lg={16}>
          <Card className="shadow-sm rounded-2xl border-none h-full border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Avatar size={72} icon={<UserOutlined />} className="bg-gradient-to-tr from-blue-500 to-indigo-500 shadow-md" />
                <div>
                  <Title level={4} className="!mb-1 capitalize text-gray-800">
                    {lead?.name?.first_name} {lead?.name?.last_name}
                  </Title>
                  <Space>
                    <Tag color={lead?.is_hot ? "volcano" : "blue"} className="rounded-full px-3 py-0.5 border-none shadow-sm font-bold m-0">
                      {lead?.source?.replace('_', ' ').toUpperCase()} LEAD
                    </Tag>
                    <Tag color="purple" className="rounded-full px-3 py-0.5 border-none shadow-sm font-bold m-0">
                      STATUS: {lead?.status?.toUpperCase()}
                    </Tag>
                  </Space>
                </div>
              </div>
            </div>
            
            <Divider className="my-5 border-gray-100" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="p-2.5 bg-blue-100 text-blue-500 rounded-lg"><MailOutlined className="text-xl" /></div>
                <div>
                  <Text type="secondary" className="text-[11px] uppercase font-bold tracking-wide block">Email Address</Text>
                  <Text strong className="text-[15px]">{lead?.email || "N/A"}</Text>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="p-2.5 bg-green-100 text-green-500 rounded-lg"><PhoneOutlined className="text-xl" /></div>
                <div>
                  <Text type="secondary" className="text-[11px] uppercase font-bold tracking-wide block">Phone Number</Text>
                  <Text strong className="text-[15px]">{lead?.phone_number || "N/A"}</Text>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="p-2.5 bg-yellow-100 text-yellow-600 rounded-lg"><DollarCircleOutlined className="text-xl" /></div>
                <div>
                  <Text type="secondary" className="text-[11px] uppercase font-bold tracking-wide block">Maximum Budget</Text>
                  <Text strong className="text-[15px]">{lead?.budget ? `${lead.budget.toLocaleString()} AED` : "Not specified"}</Text>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="p-2.5 bg-red-100 text-red-500 rounded-lg"><EnvironmentOutlined className="text-xl" /></div>
                <div>
                  <Text type="secondary" className="text-[11px] uppercase font-bold tracking-wide block">Target Location</Text>
                  <Text strong className="truncate block max-w-[200px] text-[15px]" title={lead?.preferred_location}>
                    {lead?.preferred_location || "Any"}
                  </Text>
                </div>
              </div>
            </div>

            {lead?.requirement_description && (
              <div className="mt-6 p-5 bg-indigo-50/60 rounded-xl border border-indigo-100">
                <Text type="secondary" className="text-xs font-bold uppercase tracking-wider mb-2 block text-indigo-900">Agent / Client Notes</Text>
                <Text className="text-gray-700 leading-relaxed text-[15px]">{lead.requirement_description}</Text>
              </div>
            )}
          </Card>
        </Col>

        {/* ---------------- ANALYTICS CARD ---------------- */}
        <Col xs={24} lg={8}>
          <Card className="shadow-sm rounded-2xl border-none h-full bg-gradient-to-br from-gray-900 to-indigo-950 text-white relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-32 h-32 bg-purple-500/20 rounded-full blur-2xl"></div>

            <Title level={5} className="!mb-6 text-white/90 relative z-10">Engagement Intelligence</Title>
            
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between bg-white/5 backdrop-blur-md p-5 rounded-xl border border-white/10 shadow-inner">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-xl text-blue-300">
                    <StarOutlined className="text-2xl" />
                  </div>
                  <Text className="text-white/80 font-medium">AI Suggestions</Text>
                </div>
                <Title level={2} className="!mb-0 !text-white">{analytics?.totalInterests || 0}</Title>
              </div>
              
              <div className="flex items-center justify-between bg-white/5 backdrop-blur-md p-5 rounded-xl border border-white/10 shadow-inner">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-500/20 rounded-xl text-red-400">
                    <FireOutlined className="text-2xl" />
                  </div>
                  <Text className="text-white/80 font-medium">Hot Matches</Text>
                </div>
                <Title level={2} className="!mb-0 !text-white">{analytics?.hotLeads || 0}</Title>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* ---------------- AI SUGGESTED PROPERTIES ---------------- */}
      <div>
        <Title level={4} className="!mb-6 text-gray-800 flex items-center">
          <RobotOutlined className="mr-3 text-2xl text-indigo-500 bg-indigo-50 p-2.5 rounded-xl" /> 
          Algorithmic Property Matches
        </Title>
        
        {interests.length === 0 ? (
           <div className="text-center p-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <RobotOutlined className="text-5xl text-gray-300 mb-4 block" />
              <Text type="secondary" className="text-lg">No AI matches have been generated for this lead's criteria yet.</Text>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {interests?.map((item) => {
              const isThisCardGenerating = generatingId === item._id;
              const cardImage = getImageUrl(item);
              const isBrochureSent = item?.brochure?.sent;
              const isBrochureViewed = item?.brochure?.viewed;

              return (
                <Card 
                  key={item._id} 
                  hoverable
                  className="overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl border-gray-200 flex flex-col group bg-white"
                  cover={
                    <div className="relative h-60 overflow-hidden bg-gray-100">
                      <img 
                        alt={item?.property?.propertyName} 
                        src={cardImage} 
                        onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }}
                        className={`object-cover w-full h-full transition-transform duration-700 ${isThisCardGenerating ? 'scale-110 blur-sm' : 'group-hover:scale-105'}`}
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

                      <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                        <Tag className="rounded-full font-bold shadow-lg px-3 py-1 text-sm border border-white/20 backdrop-blur-md bg-green-500/95 text-white m-0">
                          {item?.ai_match?.score}% Match
                        </Tag>
                        {isBrochureViewed && (
                          <Tag color="purple" className="rounded-full font-bold shadow-lg px-3 py-1 text-xs border border-white/20 backdrop-blur-md bg-purple-600/90 text-white m-0">
                            <EyeOutlined /> Viewed
                          </Tag>
                        )}
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <Title level={5} className="!mb-0 truncate !text-white drop-shadow-md" title={item?.property?.propertyName}>
                          {item?.property?.propertyName}
                        </Title>
                        <Text className="flex items-center gap-1 text-xs text-white/90 drop-shadow-md mt-1">
                          <EnvironmentOutlined /> {item?.property?.city || item?.property?.area || "Dubai"}
                        </Text>
                      </div>
                      
                      {isThisCardGenerating && (
                        <div className="absolute inset-0 bg-indigo-900/60 backdrop-blur-sm flex items-center justify-center z-20">
                           <div className="text-white font-medium flex flex-col items-center gap-3">
                              <RobotOutlined className="animate-spin text-4xl text-indigo-300 drop-shadow-lg" />
                              <span className="tracking-wide">Crafting AI Presentation...</span>
                           </div>
                        </div>
                      )}
                    </div>
                  }
                  bodyStyle={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}
                >
                  <div className="flex justify-between items-center mb-5 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <Text type="secondary" className="text-[10px] uppercase font-bold tracking-wider block mb-1">Selling Price</Text>
                      <Text strong className="text-indigo-600 text-[16px]">
                        {item?.property?.price?.toLocaleString()} {item?.property?.currency || 'AED'}
                      </Text>
                    </div>
                    <div className="w-[1px] h-8 bg-gray-200"></div>
                    <div className="text-right">
                      <Text type="secondary" className="text-[10px] uppercase font-bold tracking-wider block mb-1">Space Layout</Text>
                      <Text strong className="text-gray-700 text-[16px]">{item?.property?.bedrooms} Beds</Text>
                    </div>
                  </div>

                  <div className="mb-6 flex-1">
                    <Text strong className="text-[11px] uppercase text-gray-400 tracking-wider mb-2 block">Match Justification</Text>
                    <ul className="space-y-2 text-sm text-gray-600 pl-1">
                      {item?.ai_match?.reasons?.slice(0, 3).map((reason, i) => (
                        <li key={i} className="leading-snug flex items-start gap-2">
                           <span className="flex-1 truncate" title={reason}>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-3">
                    
                    {/* 1. Brochure Generation Logic */}
                    {!isBrochureSent ? (
                      <Button 
                        type="primary"
                        size="large"
                        icon={<FilePdfOutlined />}
                        className="w-full font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border-none shadow-sm"
                        loading={isThisCardGenerating}
                        onClick={() => handleGenerateBrochure(item)}
                      >
                        Create AI Brochure
                      </Button>
                    ) : (
                      <Button 
                        disabled
                        size="large"
                        className="w-full font-bold rounded-xl bg-gray-100 text-gray-500 border-gray-200"
                      >
                        <CheckCircleOutlined className="text-green-500" /> Brochure Sent
                      </Button>
                    )}

                    {/* 2. Site Visit Trigger (Only if Brochure is Viewed) */}
                    {isBrochureViewed && (
                      <Button 
                        type="primary"
                        size="large"
                        icon={<CalendarOutlined />}
                        className="w-full font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 border-none shadow-md"
                        onClick={() => openSiteVisitModal(item)}
                      >
                        Schedule Site Visit
                      </Button>
                    )}

                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* ---------------- SITE VISIT SCHEDULING MODAL ---------------- */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <Avatar size={40} className="bg-emerald-100 text-emerald-600" icon={<CalendarOutlined />} />
            <div>
              <Title level={5} className="!mb-0 text-gray-800">Schedule Site Visit</Title>
              <Text type="secondary" className="text-xs font-normal">
                {selectedInterestForVisit?.property?.propertyName}
              </Text>
            </div>
          </div>
        }
        open={isVisitModalOpen}
        onCancel={() => { setIsVisitModalOpen(false); visitForm.resetFields(); }}
        footer={null}
        centered
        destroyOnClose
      >
        <Divider className="my-4" />
        <Form form={visitForm} layout="vertical" onFinish={handleCreateSiteVisit}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item 
                name="scheduledDate" 
                label="Visit Date" 
                rules={[{ required: true, message: 'Please select a date' }]}
              >
                <DatePicker className="w-full" size="large" format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item 
                name="visitTime" 
                label="Visit Time" 
                rules={[{ required: true, message: 'Please select a time' }]}
              >
                <TimePicker use12Hours format="hh:mm A" className="w-full" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item 
                name="clientName" 
                label="Client Name" 
                rules={[{ required: true }]}
              >
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item 
                name="clientPhone" 
                label="Client Phone" 
                rules={[{ required: true }]}
              >
                <Input size="large" />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-3 mt-4">
            <Button size="large" className="rounded-xl" onClick={() => setIsVisitModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              loading={visitLoading}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-600 border-none shadow-md"
            >
              Confirm Booking
            </Button>
          </div>
        </Form>
      </Modal>

    </div>
  );
}