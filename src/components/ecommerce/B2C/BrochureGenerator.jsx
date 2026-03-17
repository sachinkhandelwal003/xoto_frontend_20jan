import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card, Typography, Button, message, Select, Checkbox, Input, Tabs, Spin,
  Row, Col, Divider, Tag, Space
} from "antd";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import {
  ArrowLeftOutlined,
  FilePdfOutlined,
  DownloadOutlined,
  EyeOutlined,
  SettingOutlined,
  GlobalOutlined,
  DollarCircleOutlined,
  HomeOutlined,
  EditOutlined,
  RobotOutlined,
  EnvironmentOutlined,
  UserOutlined,
  BankOutlined,
  CalendarOutlined, UploadOutlined, 
  WhatsAppOutlined, 
  MailOutlined,
  CopyOutlined 
} from "@ant-design/icons";

// Import the brochure template generator
import { generateBrochureHTML } from "./BrochureTemplate";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

export default function BrochureGenerator() {
  const location = useLocation();
  const navigate = useNavigate();
  const property = location.state?.property;
  const lead = location.state?.lead;
  const matchScore = location.state?.matchScore;
const [uploading, setUploading] = useState(false);
const [shareLink, setShareLink] = useState('');
const [brochureId, setBrochureId] = useState('');
  // States
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [activeTab, setActiveTab] = useState('customize');
  
  // Brochure preferences
  const [preferences, setPreferences] = useState({
    language: 'EN',
    currency: 'AED',
    areaUnit: 'sqft',
    slides: ['Cover slide', 'Project description', 'Developer', 'Unit prices', 'Payment plans', 'Location']
  });
  
  const [customDescription, setCustomDescription] = useState('');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [isImprovingAI, setIsImprovingAI] = useState(false);

  // Redirect if no property
  useEffect(() => {
    if (!property) {
      message.error("No property selected");
      navigate(-1);
    }
  }, [property, navigate]);

  // Set initial description
  useEffect(() => {
    if (property?.description) {
      setCustomDescription(property.description);
    } else {
      setCustomDescription(`Experience luxury living in this exquisite ${property?.propertyType || 'property'} located in the heart of ${property?.city || 'Dubai'}. This stunning residence offers premium finishes, intelligent design, and world-class amenities that redefine modern living.`);
    }
  }, [property]);

  if (!property) return null;
const handleUploadAndShare = async () => {
  if (!lead?._id || !property?._id) {
    message.error('Lead or Property information missing');
    return;
  }

  setUploading(true);
  message.loading({ content: 'Generating and uploading brochure...', key: 'upload' });

  try {
    // 1. Generate HTML
    const html = generateBrochureHTML(property, lead, preferences, customDescription);

    // 2. Convert HTML → File (VERY IMPORTANT 🔥)
    const blob = new Blob([html], { type: "text/html" });
    const file = new File([blob], `${property?.propertyName || "brochure"}.html`, {
      type: "text/html"
    });

    // 3. Prepare FormData
    const formData = new FormData();
    formData.append("file", file);
    formData.append("leadId", lead._id);
    formData.append("propertyId", property._id);

    const interestId = lead?.interests?.find(
      i => i.property?._id === property._id
    )?._id;

    if (interestId) {
      formData.append("interestId", interestId);
    }

    // 4. API Call (multipart)
    const response = await apiService.post(
      "/brochure/upload-brochure",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    );

    // 5. Handle response
    if (response?.success) {
      setShareLink(response.data.shareLink);
      setBrochureId(response.data.brochureId);

      message.success({
        content: '✅ Brochure uploaded! Share link created.',
        key: 'upload'
      });
    } else {
      throw new Error(response?.message || "Upload failed");
    }

  } catch (error) {
    console.error('Upload error:', error);

    message.error({
      content: error.message || 'Failed to upload brochure',
      key: 'upload'
    });
  } finally {
    setUploading(false);
  }
};
  // Languages
  const languages = [
    { code: 'EN', name: 'English' },
    { code: 'AR', name: 'Arabic' },
    { code: 'HI', name: 'Hindi' },
    { code: 'RU', name: 'Russian' },
    { code: 'ZH', name: 'Chinese' },
    { code: 'FA', name: 'Persian' }
  ];

  // Currencies
  const currencies = [
    { code: 'AED', name: 'UAE Dirham' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'INR', name: 'Indian Rupee' }
  ];

  // Handle preview
  const handlePreview = () => {
    setLoading(true);
    setTimeout(() => {
      const html = generateBrochureHTML(property, lead, preferences, customDescription);
      setPreviewHtml(html);
      setActiveTab('preview');
      setLoading(false);
    }, 500);
  };

  // Handle download
  const handleDownload = () => {
    setGenerating(true);
    setTimeout(() => {
      const html = generateBrochureHTML(property, lead, preferences, customDescription);
      const blob = new Blob([html], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${property?.propertyName || 'property'}_brochure.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setGenerating(false);
      message.success('Brochure downloaded successfully!');
    }, 1000);
  };

  // Improve with AI
  const handleImproveWithAI = () => {
    if (!customDescription) {
      message.warning('Please enter some description first!');
      return;
    }

    setIsImprovingAI(true);
    message.loading({ content: 'AI is enhancing the description...', key: 'ai' });

    setTimeout(() => {
      const developerName = property?.developer?.name || 'the developer';
      const propertyType = property?.propertyType || 'property';
      const location = property?.city || 'Dubai';
      
      const improved = `✨ **Luxury Redefined in the Heart of ${location}**

${customDescription}

**Key Highlights:**
• 🏗️ Developed by renowned ${developerName}
• 📍 Prime location in ${property?.area || location}
• 🏠 Spacious ${property?.bedrooms || ''} bedroom ${propertyType}
• 💎 Premium finishes throughout
• 🌊 Breathtaking views
• 🏊 World-class amenities

This exceptional residence represents the perfect blend of sophisticated design, uncompromising quality, and unparalleled lifestyle. Every detail has been meticulously crafted to create a home that exceeds expectations.

**Why You'll Love It:**
✓ Exclusive community
✓ State-of-the-art facilities
✓ Smart home technology
✓ 24/7 security and concierge
✓ Easy access to major attractions

Don't miss this opportunity to own a piece of paradise in one of Dubai's most sought-after locations.`;
      
      setCustomDescription(improved);
      setIsImprovingAI(false);
      message.success({ content: 'Description enhanced!', key: 'ai', duration: 2 });
    }, 2000);
  };

  // Get main image
  const getMainImage = () => {
    return property?.photos?.[0] || 
           property?.mainLogo || 
           'https://via.placeholder.com/1200x800?text=Property+Image';
  };

  return (
    <div className="p-6 bg-[#f6f7fb] min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(-1)}
          size="large"
        >
          Back to Lead
        </Button>
        <div>
          <Title level={3} className="!mb-0">AI Brochure Generator</Title>
          <Text type="secondary">Create stunning property brochures with AI</Text>
        </div>
      </div>

      {/* Property Summary Card */}
      <Card className="mb-6 shadow-sm rounded-xl">
        <Row gutter={24} align="middle">
          <Col xs={24} md={6}>
            <img 
              src={getMainImage()} 
              alt={property?.propertyName}
              style={{ 
                width: '100%', 
                height: 150, 
                objectFit: 'cover', 
                borderRadius: 12 
              }}
            />
          </Col>
          <Col xs={24} md={18}>
            <div className="flex justify-between items-start">
              <div>
                <Title level={4} className="!mb-1">{property?.propertyName}</Title>
                <Text type="secondary" className="block mb-2">
                  <EnvironmentOutlined /> {property?.city}, {property?.country || 'UAE'}
                </Text>
                <Space size="large" className="mt-2">
                  <div>
                    <Text type="secondary" className="text-xs">Price</Text>
                    <div>
                      <strong>{property?.price?.toLocaleString()} {property?.currency || 'AED'}</strong>
                    </div>
                  </div>
                  <div>
                    <Text type="secondary" className="text-xs">Developer</Text>
                    <div><strong>{property?.developer?.name || 'Developer'}</strong></div>
                  </div>
                  <div>
                    <Text type="secondary" className="text-xs">Bedrooms</Text>
                    <div><strong>{property?.bedrooms || property?.unitType?.[0] || 'N/A'}</strong></div>
                  </div>
                  <div>
                    <Text type="secondary" className="text-xs">Handover</Text>
                    <div><strong>{property?.handover ? new Date(property.handover).toLocaleDateString() : 'TBA'}</strong></div>
                  </div>
                </Space>
              </div>
              {matchScore && (
                <Tag color="success" className="text-base px-4 py-2">
                  {matchScore}% Match for {lead?.name?.first_name}
                </Tag>
              )}
            </div>
          </Col>
        </Row>
      </Card>

      {/* Main Content */}
      <Card className="shadow-sm rounded-xl">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* Customize Tab */}
          <TabPane 
            tab={<span><SettingOutlined /> Customize Brochure</span>} 
            key="customize"
          >
            <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '20px' }}>
              {/* Language Selection */}
              <div className="mb-6">
                <label className="font-semibold block mb-2">
                  <GlobalOutlined className="mr-2" /> Language
                </label>
                <Select 
                  value={preferences.language}
                  onChange={(val) => setPreferences({...preferences, language: val})}
                  style={{ width: '100%' }}
                  size="large"
                >
                  {languages.map(lang => (
                    <Option key={lang.code} value={lang.code}>
                      {lang.name}
                    </Option>
                  ))}
                </Select>
              </div>

              {/* Currency Selection */}
              <div className="mb-6">
                <label className="font-semibold block mb-2">
                  <DollarCircleOutlined className="mr-2" /> Currency
                </label>
                <Select 
                  value={preferences.currency}
                  onChange={(val) => setPreferences({...preferences, currency: val})}
                  style={{ width: '100%' }}
                  size="large"
                >
                  {currencies.map(curr => (
                    <Option key={curr.code} value={curr.code}>
                      {curr.name}
                    </Option>
                  ))}
                </Select>
              </div>

              {/* Area Unit */}
              <div className="mb-6">
                <label className="font-semibold block mb-2">
                  <HomeOutlined className="mr-2" /> Area Unit
                </label>
                <Select 
                  value={preferences.areaUnit}
                  onChange={(val) => setPreferences({...preferences, areaUnit: val})}
                  style={{ width: '100%' }}
                  size="large"
                >
                  <Option value="sqft">Square Feet (sqft)</Option>
                  <Option value="sqm">Square Meters (m²)</Option>
                </Select>
              </div>

              <Divider />

              {/* Slides Selection */}
              <div className="mb-6">
                <label className="font-semibold block mb-3">
                  <FilePdfOutlined className="mr-2" /> Include Sections
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Cover slide', 'Project description', 'Developer', 'Unit prices', 'Payment plans', 'Location'].map(slide => (
                    <Checkbox
                      key={slide}
                      checked={preferences.slides.includes(slide)}
                      onChange={(e) => {
                        const newSlides = e.target.checked
                          ? [...preferences.slides, slide]
                          : preferences.slides.filter(s => s !== slide);
                        setPreferences({...preferences, slides: newSlides});
                      }}
                    >
                      {slide}
                    </Checkbox>
                  ))}
                </div>
              </div>

              <Divider />

              {/* Description Editor */}
              <div className="mb-6">
                <label className="font-semibold block mb-2">
                  <EditOutlined className="mr-2" /> Property Description
                </label>
                {isEditingDesc ? (
                  <TextArea
                    rows={6}
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    placeholder="Enter property description..."
                    className="mb-3"
                  />
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg mb-3 max-h-32 overflow-y-auto">
                    {customDescription}
                  </div>
                )}
                <div className="flex gap-3">
                  <Button 
                    icon={<EditOutlined />}
                    onClick={() => setIsEditingDesc(!isEditingDesc)}
                    className="flex-1"
                  >
                    {isEditingDesc ? 'Save' : 'Edit'}
                  </Button>
                  <Button 
                    type="primary"
                    icon={<RobotOutlined />}
                    onClick={handleImproveWithAI}
                    loading={isImprovingAI}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600"
                  >
                    Improve with AI
                  </Button>
                </div>
              </div>
            </div>
          </TabPane>

          {/* Preview Tab */}
          <TabPane 
            tab={<span><EyeOutlined /> Preview</span>}
            key="preview"
          >
            {loading ? (
              <div className="text-center py-16">
                <Spin size="large" />
                <p className="mt-4 text-gray-500">Generating brochure preview...</p>
              </div>
            ) : previewHtml ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden" style={{ height: '60vh' }}>
                <iframe
                  srcDoc={previewHtml}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title="Brochure Preview"
                  sandbox="allow-same-origin"
                />
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <EyeOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <p>Click Preview to generate brochure</p>
              </div>
            )}
          </TabPane>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6">
          <Button 
            size="large"
            icon={<EyeOutlined />}
            onClick={handlePreview}
            loading={loading}
            className="flex-1"
          >
            Preview Brochure
          </Button>
          <Button 
            type="primary"
            size="large"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            loading={generating}
            className="flex-1 bg-indigo-600"
          >
            Download Brochure
          </Button>

          {shareLink ? (
  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
    <div className="flex items-center justify-between mb-3">
      <Text strong className="text-green-800">
        <FilePdfOutlined className="mr-2" /> Brochure Ready to Share!
      </Text>
      <Tag color="green">Tracking Active</Tag>
    </div>
    
    <div className="flex items-center gap-2 mb-4">
      <Input 
        value={shareLink} 
        readOnly 
        className="flex-1"
        onClick={(e) => e.target.select()}
      />
      <Button 
        icon={<CopyOutlined />}
        onClick={() => {
          navigator.clipboard.writeText(shareLink);
          message.success('Link copied!');
        }}
      >
        Copy
      </Button>
    </div>

    <div className="text-sm text-gray-600 mb-3">
      <p>📊 When customer opens this link, we'll track:</p>
      <ul className="list-disc ml-6 mt-1">
        <li>✓ When they viewed</li>
        <li>✓ Their device (Mobile/Desktop)</li>
        <li>✓ Engagement score will increase by +15</li>
        <li>✓ LeadInterest brochure.viewed = true</li>
      </ul>
    </div>

    <div className="flex gap-3">
      <Button 
        icon={<WhatsAppOutlined />} 
        onClick={() => {
          const phone = lead?.phone_number?.replace(/\D/g, '');
          const message = encodeURIComponent(
            `🏠 *${property?.propertyName}* - Exclusive Brochure\n\n` +
            `Hi ${lead?.name?.first_name}, here's your personalized brochure:\n\n` +
            `🔗 ${shareLink}\n\n` +
            `Let me know your thoughts!`
          );
          window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
        }}
        className="flex-1"
        style={{ background: '#25D366', color: 'white', border: 'none' }}
        disabled={!lead?.phone_number}
      >
        Send via WhatsApp
      </Button>
      <Button 
        icon={<MailOutlined />} 
        onClick={() => {
          const subject = encodeURIComponent(`Brochure: ${property?.propertyName}`);
          const body = encodeURIComponent(
            `Hi ${lead?.name?.first_name},\n\n` +
            `Here's the brochure for ${property?.propertyName}:\n\n` +
            `${shareLink}\n\n` +
            `Please let me know if you have any questions!`
          );
          window.open(`mailto:${lead?.email}?subject=${subject}&body=${body}`, '_blank');
        }}
        className="flex-1"
        type="primary"
        disabled={!lead?.email}
      >
        Send via Email
      </Button>
    </div>
    
    {(!lead?.phone_number || !lead?.email) && (
      <Text type="warning" className="block mt-2 text-xs">
        ⚠️ Add phone/email to lead for WhatsApp/Email options
      </Text>
    )}

    <div className="mt-3 text-xs text-gray-500">
      Tracking ID: {brochureId?.slice(-8)}
    </div>
  </div>
) : (
  <Button
    type="primary"
    size="large"
    icon={<UploadOutlined />}
    onClick={handleUploadAndShare}
    loading={uploading}
    className="w-full mt-4"
    style={{ background: '#10b981', height: '50px' }}
  >
    {uploading ? 'Uploading...' : 'Upload & Get Shareable Link'}
  </Button>
)}
        </div>
      </Card>
    </div>
  );
}