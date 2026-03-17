import React, { useState } from "react";
import { Card, Tag, Typography, Avatar, Divider, Row, Col, Statistic, Button, message, Modal } from "antd";
import { useLocation } from "react-router-dom";
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  EnvironmentOutlined, 
  DollarCircleOutlined,
  HomeOutlined,
  FireOutlined,
  StarOutlined,
  RobotOutlined,
  FilePdfOutlined,
  DownloadOutlined // 🔹 Naya icon modal ke download button ke liye
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

export default function LeadDetails() {
  const location = useLocation();
  const state = location.state;

  // 🔹 States
  const [generatingId, setGeneratingId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBrochure, setSelectedBrochure] = useState(null); // Jis property ka brochure open karna hai

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f6f7fb]">
        <Text type="secondary" className="text-lg">No Data Found</Text>
      </div>
    );
  }

  const { lead, interests, analytics } = state?.data || {};
  const placeholderImg = "https://via.placeholder.com/400x250?text=No+Image+Available";
  const backendBaseUrl = "http://localhost:8000"; // Apna backend URL yahan rakhein

  // 🔹 Helper function to format image URL
  const getImageUrl = (item) => {
    let imageUrl = item?.property?.image || item?.property?.images?.[0];
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = `${backendBaseUrl}${imageUrl}`;
    }
    return imageUrl || placeholderImg;
  };

  // 🔹 Brochure Generate Handle Karne Ka Logic
  const handleGenerateBrochure = (item) => {
    if (!lead?.email) {
      message.error("Lead doesn't have an email address!");
      return;
    }

    setGeneratingId(item._id);
    const msgKey = 'brochure-gen';
    message.loading({ content: `AI is creating a personalized brochure for ${item?.property?.propertyName}...`, key: msgKey, duration: 0 });

    // Dummy API call simulation
    setTimeout(() => {
      setGeneratingId(null);
      setSelectedBrochure(item); // 🔹 Modal ke liye data set kiya
      setIsModalVisible(true);   // 🔹 Modal open kiya
      message.success({ content: `Brochure ready!`, key: msgKey, duration: 2 });
    }, 3000); 
  };

  return (
    <div className="p-6 md:p-10 space-y-8 bg-[#f6f7fb] min-h-screen">
      
      {/* 🔹 PAGE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <Title level={3} className="!mb-0 text-gray-800">Lead Dashboard</Title>
          <Text type="secondary">Detailed overview and AI property matches</Text>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* ... LEAD INFO & ANALYTICS CARDS (Pehle wale same rahenge) ... */}
        <Col xs={24} lg={16}>
          <Card className="shadow-sm rounded-2xl border-none h-full">
            <div className="flex items-start gap-4 mb-6">
              <Avatar size={64} icon={<UserOutlined />} className="bg-blue-500" />
              <div>
                <Title level={4} className="!mb-1">
                  {lead?.name?.first_name} {lead?.name?.last_name}
                </Title>
                <Tag color={lead?.status === "New" ? "blue" : "green"} className="rounded-full px-3">
                  {lead?.status || "Unknown Status"}
                </Tag>
              </div>
            </div>
            <Divider className="my-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              <div className="flex items-center gap-3 text-gray-600">
                <MailOutlined className="text-lg text-blue-400" />
                <Text>{lead?.email || "N/A"}</Text>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <PhoneOutlined className="text-lg text-green-400" />
                <Text>{lead?.phone_number || "N/A"}</Text>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <DollarCircleOutlined className="text-lg text-yellow-500" />
                <Text strong>Budget: </Text>
                <Text>{lead?.budget || "Not specified"}</Text>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <EnvironmentOutlined className="text-lg text-red-400" />
                <Text strong>Location: </Text>
                <Text>{lead?.preferred_location || "Any"}</Text>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card className="shadow-sm rounded-2xl border-none h-full bg-gradient-to-br from-blue-50 to-indigo-50">
            <Title level={5} className="!mb-6 text-indigo-900">Engagement Analytics</Title>
            <div className="space-y-6">
              <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
                <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                  <StarOutlined className="text-xl" />
                </div>
                <Statistic title="Total Interests" value={analytics?.totalInterests || 0} />
              </div>
              <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
                <div className="p-3 bg-red-100 rounded-full text-red-500">
                  <FireOutlined className="text-xl" />
                </div>
                <Statistic title="Hot Leads" value={analytics?.hotLeads || 0} />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 🔹 AI SUGGESTED PROPERTIES */}
      <div>
        <Title level={4} className="!mb-4 text-gray-800">
          <RobotOutlined className="mr-2 text-purple-500" /> 
          AI Suggested Properties
        </Title>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {interests?.map((item) => {
            
            const isThisCardGenerating = generatingId === item._id;
            const cardImage = getImageUrl(item);

            return (
              <Card 
                key={item._id} 
                hoverable
                className="overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl border-gray-100 flex flex-col group"
                cover={
                  <div className="relative h-48 overflow-hidden bg-gray-200">
                    <img 
                      alt={item?.property?.propertyName} 
                      src={cardImage} 
                      onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }}
                      className={`object-cover w-full h-full transition-transform duration-700 ${isThisCardGenerating ? 'scale-110 blur-[2px]' : 'group-hover:scale-105'}`}
                    />
                    <div className="absolute top-3 right-3">
                      <Tag color="success" className="rounded-full font-bold shadow-sm px-3 py-1 text-sm border-none backdrop-blur-md bg-green-500/90 text-white">
                        {item?.ai_match?.score}% Match
                      </Tag>
                    </div>
                    
                    {isThisCardGenerating && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                         <div className="text-white font-medium flex items-center gap-2">
                            <RobotOutlined className="animate-spin text-xl text-purple-400" />
                            Creating Magic...
                         </div>
                      </div>
                    )}
                  </div>
                }
                bodyStyle={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}
              >
                <div className="mb-3">
                  <Title level={5} className="!mb-1 truncate text-gray-800" title={item?.property?.propertyName}>
                    {item?.property?.propertyName}
                  </Title>
                  <Text type="secondary" className="flex items-center gap-1">
                    <EnvironmentOutlined /> {item?.property?.city}
                  </Text>
                </div>

                <div className="flex justify-between items-center mb-4 p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                  <div>
                    <Text type="secondary" className="text-xs block mb-1">Price</Text>
                    <Text strong className="text-indigo-600 text-base">{item?.property?.price}</Text>
                  </div>
                  <div className="w-[1px] h-8 bg-gray-200"></div>
                  <div className="text-right">
                    <Text type="secondary" className="text-xs block mb-1">Layout</Text>
                    <Text strong className="text-gray-700 text-base">{item?.property?.bedrooms} Beds</Text>
                  </div>
                </div>

                <div className="mb-6">
                  <Text strong className="text-[11px] uppercase text-gray-400 tracking-wider">AI Match Reasons</Text>
                  <ul className="mt-2 space-y-1.5 text-sm text-gray-600 pl-4 list-disc marker:text-purple-400">
                    {item?.ai_match?.reasons?.map((reason, i) => (
                      <li key={i} className="leading-snug">{reason}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100">
                  <Button 
                    type={isThisCardGenerating ? "default" : "primary"}
                    size="large"
                    icon={isThisCardGenerating ? <RobotOutlined className="animate-pulse text-purple-500" /> : <FilePdfOutlined />}
                    className={`w-full font-medium rounded-xl transition-all ${
                      isThisCardGenerating 
                        ? 'bg-purple-50 border-purple-200 text-purple-600' 
                        : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-none shadow-md hover:shadow-lg'
                    }`}
                    loading={isThisCardGenerating}
                    onClick={() => handleGenerateBrochure(item)} // 🔹 Ab poora item pass kar rahe hain
                  >
                    {isThisCardGenerating ? 'Generating...' : 'Generate AI Brochure'}
                  </Button>
                </div>

              </Card>
            )
          })}
        </div>
      </div>

      {/* 🔹 BROCHURE PREVIEW MODAL */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-indigo-800 text-lg">
            <FilePdfOutlined /> Brochure Preview
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={800} // Thoda wide modal for brochure feel
        centered
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)} size="large">
            Close
          </Button>,
          <Button 
            key="download" 
            type="primary" 
            size="large"
            icon={<DownloadOutlined />} 
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => message.info("Downloading PDF...")} // Yahan actual download logic aayega
          >
            Download PDF
          </Button>,
        ]}
      >
        {selectedBrochure && (
          <div className="mt-4">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row">
              {/* Image Section */}
              <div className="w-full md:w-2/5 h-64 md:h-auto">
                <img 
                  src={getImageUrl(selectedBrochure)} 
                  alt={selectedBrochure?.property?.propertyName}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Details Section */}
              <div className="w-full md:w-3/5 p-6 space-y-4 bg-gray-50">
                <div>
                  <Title level={4} className="!mb-1">{selectedBrochure?.property?.propertyName}</Title>
                  <Text type="secondary"><EnvironmentOutlined /> {selectedBrochure?.property?.city}</Text>
                </div>
                
                <Divider className="my-2" />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Text type="secondary" className="text-xs">Price</Text>
                    <Title level={5} className="!mb-0 text-indigo-600">{selectedBrochure?.property?.price}</Title>
                  </div>
                  <div>
                    <Text type="secondary" className="text-xs">Layout</Text>
                    <Title level={5} className="!mb-0">{selectedBrochure?.property?.bedrooms} Beds</Title>
                  </div>
                </div>

                <div className="bg-indigo-50/50 p-4 rounded-lg border border-indigo-100 mt-4">
                  <Text strong className="text-indigo-900 block mb-2">Prepared Specifically For: {lead?.name?.first_name}</Text>
                  <Paragraph className="text-sm text-gray-600 mb-0">
                    Based on our AI analysis, this property matches <b>{selectedBrochure?.ai_match?.score}%</b> of your requirements.
                  </Paragraph>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}