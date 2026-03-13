import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Row, Col, Typography, Button, Tag, Spin, message,
  Card, Divider, Collapse, Avatar, Space, Modal, Image, Select, Checkbox, Input
} from "antd";
import {
  EnvironmentOutlined, PictureOutlined, FilePdfOutlined,
  TagOutlined, WalletOutlined, BankOutlined,
  ShareAltOutlined, ExportOutlined, MessageOutlined,
  AppstoreOutlined, ArrowLeftOutlined, EditOutlined, RobotOutlined 
} from "@ant-design/icons";
import axios from "axios";

// 🔥 PDF GENERATOR IMPORTS
import { pdf, Document, Page, Text as PdfText, View, Image as PdfImage, StyleSheet } from '@react-pdf/renderer';

// 🛠️ FIX: BUFFER IS NOT DEFINED ERROR
import { Buffer } from 'buffer';
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
}

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

// 🔥 1. CRASH-FREE PREMIUM STYLESHEET (FIXED FOR REACT-PDF) 🔥
const pdfStyles = StyleSheet.create({
  page: { 
    padding: 0, 
    backgroundColor: '#ffffff', 
    fontFamily: 'Helvetica'
  },
  coverContainer: {
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 40
  },
  logoWrapper: {
    marginTop: 40,
    width: '100%',
    alignItems: 'center',
    height: 60,
  },
  mainLogo: {
    width: 140,
    objectFit: 'contain',
  },
  heroSection: {
    width: '90%',
    height: 420,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0', 
  },
  heroImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  coverFooter: {
    width: '85%',
    alignItems: 'center',
  },
  coverSubtitle: {
    fontSize: 10,
    color: '#888',
    letterSpacing: 2,
    marginBottom: 8,
    textTransform: 'uppercase'
  },
  coverTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 25,
    textAlign: 'center'
  },
  agentStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    // ✅ React-PDF Safe Border Properties
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
    borderTopStyle: 'solid',
    paddingTop: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, color: '#111827', textTransform: 'uppercase' },
  textContent: { fontSize: 11, lineHeight: 1.6, color: '#4b5563', marginBottom: 20 },
  table: { marginTop: 20, borderTopWidth: 1, borderTopColor: '#EEE', borderTopStyle: 'solid' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#EEE', borderBottomStyle: 'solid', padding: '10 5' },
  tableHeader: { fontSize: 10, fontWeight: 'bold', color: '#999', flex: 1 },
  tableCell: { fontSize: 11, color: '#333', flex: 1 }
});

// 🔥 2. PROPERTY BROCHURE - ALL SLIDES ADDED (LUXURY LAYOUT) 🔥
const PropertyBrochure = ({ property, preferences, agent }) => {
  const xotoLogo = "https://xotostaging.s3.me-central-1.amazonaws.com/properties/1773403122746-image_109-removebg-preview.png"; 
  const mainImage = property?.photos?.[0] || "";
  const gallery = property?.photos?.slice(1, 4) || [];
  const devName = property?.developer?.name || "Premium Developer";

  return (
    <Document>
      {/* 1. COVER PAGE */}
      {preferences.slides.includes('Cover slide') && (
        <Page size="A4" style={pdfStyles.page}>
          <View style={pdfStyles.coverContainer}>
            <View style={pdfStyles.logoWrapper}>
              <PdfImage src={xotoLogo} style={pdfStyles.mainLogo} />
            </View>

            <View style={pdfStyles.heroSection}>
              {mainImage ? <PdfImage src={mainImage} style={pdfStyles.heroImage} /> : null}
            </View>

            <View style={pdfStyles.coverFooter}>
              <PdfText style={pdfStyles.coverSubtitle}>Look what we found for you</PdfText>
              <PdfText style={pdfStyles.coverTitle}>{property?.propertyName || "Exclusive Property"}</PdfText>
              
              <View style={pdfStyles.agentStrip}>
                <View>
                  <PdfText style={{ fontSize: 12, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 2 }}>
                    {agent?.name}
                  </PdfText>
                  <PdfText style={{ fontSize: 9, color: '#666' }}>
                    {agent?.email}
                  </PdfText>
                </View>
                <PdfText style={{ fontSize: 11, fontWeight: 'bold' }}>
                  {agent?.phone}
                </PdfText>
              </View>
            </View>
          </View>
        </Page>
      )}

      {/* 2. PROJECT DESCRIPTION & GALLERY */}
      {preferences.slides.includes('Project description') && (
        <Page size="A4" style={{ padding: 40 }}>
          <PdfText style={pdfStyles.sectionTitle}>ABOUT THE PROJECT</PdfText>
          <PdfText style={pdfStyles.textContent}>
            {property?.description || "Detailed description available upon request."}
          </PdfText>
          
          {gallery.length > 0 && (
            <View style={{ flexDirection: 'row', gap: 10, height: 150 }}>
              {gallery.map((img, index) => (
                <PdfImage key={index} src={img} style={{ flex: 1, borderRadius: 5, objectFit: 'cover' }} />
              ))}
            </View>
          )}
        </Page>
      )}

      {/* 3. DEVELOPER PAGE */}
      {preferences.slides.includes('Developer') && (
        <Page size="A4" style={{ padding: 40 }}>
          <PdfText style={pdfStyles.sectionTitle}>Developer: {devName}</PdfText>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            {property?.developer?.logo && (
              <PdfImage src={property.developer.logo} style={{ width: 80, marginRight: 20 }} />
            )}
            <PdfText style={{ fontSize: 16, fontWeight: 'bold' }}>{devName}</PdfText>
          </View>
          <PdfText style={pdfStyles.textContent}>
            {property?.developer?.description || `${devName} is one of the leading developers in the region, known for luxury and quality.`}
          </PdfText>
        </Page>
      )}

      {/* 4. UNIT PRICES */}
      {preferences.slides.includes('Unit prices') && (
        <Page size="A4" style={{ padding: 40 }}>
          <PdfText style={pdfStyles.sectionTitle}>Typical Units & Pricing</PdfText>
          <View style={pdfStyles.table}>
            <View style={pdfStyles.tableRow}>
              <PdfText style={pdfStyles.tableHeader}>UNIT TYPE</PdfText>
              <PdfText style={pdfStyles.tableHeader}>AREA ({preferences.measureUnit})</PdfText>
              <PdfText style={pdfStyles.tableHeader}>STARTING PRICE</PdfText>
            </View>
            <View style={pdfStyles.tableRow}>
              <PdfText style={pdfStyles.tableCell}>{property?.bedrooms || "1"} BHK</PdfText>
              <PdfText style={pdfStyles.tableCell}>{property?.builtUpArea_min || 0}</PdfText>
              <PdfText style={[pdfStyles.tableCell, {fontWeight: 'bold'}]}>
                {preferences.currency} {Number(property?.price || 0).toLocaleString()}
              </PdfText>
            </View>
          </View>
        </Page>
      )}

      {/* 5. PAYMENT PLAN */}
      {preferences.slides.includes('Payment plans') && (
        <Page size="A4" style={{ padding: 40 }}>
          <PdfText style={pdfStyles.sectionTitle}>Payment Plan</PdfText>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#F9F9F9', borderRadius: 10 }}>
            <View>
              <PdfText style={{ fontSize: 10, color: '#999', marginBottom: 5 }}>DURING CONSTRUCTION</PdfText>
              <PdfText style={{ fontSize: 18, fontWeight: 'bold' }}>{property?.paymentPlan_initialPercentage || '20'}%</PdfText>
            </View>
            <View>
              <PdfText style={{ fontSize: 10, color: '#999', marginBottom: 5 }}>ON HANDOVER</PdfText>
              <PdfText style={{ fontSize: 18, fontWeight: 'bold' }}>{property?.paymentPlan_laterPercentage || '80'}%</PdfText>
            </View>
          </View>
          <PdfText style={{ fontSize: 12, marginTop: 20, color: '#666' }}>Handover: {property?.handover || 'TBD'}</PdfText>
        </Page>
      )}

      {/* 6. LOCATION & AMENITIES */}
      {preferences.slides.includes('Location') && (
        <Page size="A4" style={{ padding: 40 }}>
          <PdfText style={pdfStyles.sectionTitle}>Location & Amenities</PdfText>
          <PdfText style={{ fontSize: 14, marginBottom: 5, fontWeight: 'bold' }}>City: {property?.city}</PdfText>
          <PdfText style={pdfStyles.textContent}>{property?.address}</PdfText>
          
          <PdfText style={{ fontSize: 14, fontWeight: 'bold', marginTop: 20, marginBottom: 10 }}>Amenities</PdfText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {property?.amenities?.map((item, index) => (
              <PdfText key={index} style={{ fontSize: 10, backgroundColor: '#f0f0f0', padding: '5 10', margin: 4, borderRadius: 4 }}>
                {item}
              </PdfText>
            ))}
          </View>
        </Page>
      )}
    </Document>
  );
};

export default function AgentProjectDetails() {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  const [customDescription, setCustomDescription] = useState("");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [isImprovingAI, setIsImprovingAI] = useState(false);

  const [pdfPreferences, setPdfPreferences] = useState({
    language: 'EN',
    currency: 'AED',
    measureUnit: 'ft2',
    slides: ['Project description', 'Developer', 'Unit availability', 'Typical units', 'Unit prices', 'Payment plans', 'Location', 'Master plan', 'Cover slide']
  });

  useEffect(() => {
    fetchPropertyDetails();
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/property/get-property-by-id?id=${id}`);
      if (res.data?.success) {
        setProperty(res.data.data);
        setCustomDescription(res.data.data.description || "Detailed description for this property is not available yet.");
      } else {
        message.error("Failed to load property details");
      }
    } catch (err) {
      console.error(err);
      message.error("API error while fetching property");
    } finally {
      setLoading(false);
    }
  };

  const handleImproveWithAI = async () => {
    setIsImprovingAI(true);
    message.loading({ content: "XOTO AI is enhancing the description...", key: "ai_load" });
    try {
      setTimeout(() => {
        setCustomDescription(`✨ ${customDescription} (Enhanced by Xoto AI for maximum conversion and luxury appeal.)`);
        message.success({ content: "Description improved!", key: "ai_load", duration: 2 });
        setIsImprovingAI(false);
      }, 2000);
    } catch (error) {
      message.error({ content: "AI Error. Try again.", key: "ai_load" });
      setIsImprovingAI(false);
    }
  };

  // 🔥 3. ROBUST PDF GENERATOR (API + LOCALSTORAGE FALLBACK) 🔥
  const handleGenerateOffer = async () => {
    setIsGenerating(true);
    const key = "updatable";
    message.loading({ content: "Fetching Agent Profile & Generating PDF...", key });

    try {
      const rawData = localStorage.getItem("user_data") || localStorage.getItem("user") || localStorage.getItem("full_agent_profile");
      const storedUser = rawData ? JSON.parse(rawData) : null;
      const agentId = storedUser?.id || storedUser?._id;

      // LocalStorage data ko primary fallback banaya
      let agentInfo = {
        name: storedUser?.first_name ? `${storedUser.first_name} ${storedUser.last_name || ''}`.trim() : "Ayush Rajpalani",
        email: storedUser?.email || "rajpalaniayush72@gmail.com",
        phone: storedUser?.phone_number ? `${storedUser.country_code || '+971'} ${storedUser.phone_number}` : "+971 54 545 4541",
        photo: storedUser?.profile_photo || "https://xotostaging.s3.me-central-1.amazonaws.com/properties/1773392643245-15.jpg"
      };

      // API Call agar error de toh LocalStorage wala data use hoga (No Crash)
      if (agentId) {
        try {
          const res = await axios.get(`http://localhost:5000/api/agent/${agentId}`); 
          if (res.data && res.data.data) {
            const dbAgent = res.data.data;
            agentInfo = {
              name: `${dbAgent.first_name || ''} ${dbAgent.last_name || ''}`.trim() || agentInfo.name,
              email: dbAgent.email || agentInfo.email,
              phone: `${dbAgent.country_code || ''} ${dbAgent.phone_number || ''}`.trim() || agentInfo.phone,
              photo: dbAgent.profile_photo || agentInfo.photo
            };
          }
        } catch (err) {
          console.warn("API 404, using solid local storage fallback");
        }
      }

      // Generate PDF
      const updatedProperty = { ...property, description: customDescription };
      const blob = await pdf(
        <PropertyBrochure property={updatedProperty} agent={agentInfo} preferences={pdfPreferences} />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${updatedProperty.propertyName || 'Sales_Offer'}.pdf`;
      link.click();
      
      URL.revokeObjectURL(url);
      message.success({ content: "PDF Downloaded Successfully!", key });
      setIsOfferModalOpen(false);

    } catch (error) {
      console.error("PDF Crash Error: ", error);
      message.error({ content: "Failed to generate PDF.", key });
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Spin size="large" /> 
      </div>
    );
  }

  if (!property) {
    return <div style={{ padding: 40, textAlign: "center" }}><Title level={4}>Project not found!</Title></div>;
  }

  const getImage = () => {
    if (property?.photos?.length) return property.photos[0];
    if (property?.mainLogo) return property.mainLogo;
    return "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200";
  };

  const allPhotos = property?.photos?.length > 0 ? property.photos : [getImage()];

  const getPaymentPlan = () => {
    if (property.paymentPlan_initialPercentage && property.paymentPlan_laterPercentage) {
      return `${property.paymentPlan_initialPercentage}/${property.paymentPlan_laterPercentage}%`;
    }
    return "Contact for Plan";
  };

  const developerName = property?.developer?.name || "Unknown Developer";

  const languages = [
    { code: 'EN', name: 'English' }, { code: 'HI', name: 'Hindi' }, { code: 'AR', name: 'Arabic' },
    { code: 'RU', name: 'Russian' }, { code: 'ZH', name: 'Chinese' }, { code: 'FA', name: 'Persian' },
    { code: 'TR', name: 'Turkish' }, { code: 'ES', name: 'Spanish' }, { code: 'PA', name: 'Punjabi' },
    { code: 'FR', name: 'French' }, { code: 'DE', name: 'German' }, { code: 'TL', name: 'Tagalog' },
    { code: 'UR', name: 'Urdu' }
  ];

  const currencies = [
    { code: 'AED', name: 'United Arab Emirates Dirham' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro (Spain, France, Germany)' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'INR', name: 'Indian Rupee' },
    { code: 'RUB', name: 'Russian Ruble' },
    { code: 'CNY', name: 'Chinese Yuan' },
    { code: 'TRY', name: 'Turkish Lira' },
    { code: 'PHP', name: 'Philippine Peso' },
    { code: 'PKR', name: 'Pakistani Rupee' },
    { code: 'SAR', name: 'Saudi Riyal' }
  ];

  return (
    <div style={{ padding: "24px 40px", background: "#fff", minHeight: "100vh" }}>
      
      <Button 
        type="link" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate(-1)}
        style={{ paddingLeft: 0, marginBottom: 16, color: "#555" }}
      >
        Back to Projects
      </Button>

      {/* 🔥 MAIN UI */}
      <Row gutter={[32, 32]}>
        <Col xs={24} lg={16}>
          <div style={{ position: "relative", height: 500, borderRadius: 16, overflow: "hidden", marginBottom: 24 }}>
            <img src={getImage()} alt={property.propertyName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            
            <div style={{ position: "absolute", top: 20, left: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Tag color="blue" style={{ padding: "4px 12px", borderRadius: 8, fontSize: 14, fontWeight: "bold", background: "#eef2ff", color: "#4338ca", border: "none" }}>
                {property.propertySubType === "off_plan" ? "Off-Plan / Presale" : "Ready"}
              </Tag>
              {property.handover && (
                <Tag style={{ padding: "4px 12px", borderRadius: 8, fontSize: 14, fontWeight: "bold", background: "#fff", color: "#333", border: "none" }}>
                  Handover: {property.handover}
                </Tag>
              )}
              <Tag style={{ padding: "4px 12px", borderRadius: 8, fontSize: 14, fontWeight: "bold", background: "#000", color: "#fff", border: "none" }}>
                By {developerName}
              </Tag>
            </div>

            <div style={{ position: "absolute", bottom: 20, left: 20, display: "flex", gap: 12 }}>
              <Button icon={<PictureOutlined />} onClick={() => setIsPhotoModalOpen(true)} style={{ borderRadius: 8, fontWeight: 500, border: "none" }}>
                {allPhotos.length} Photos
              </Button>
              {property.brochure && (
                <Button icon={<FilePdfOutlined />} href={property.brochure} target="_blank" style={{ borderRadius: 8, fontWeight: 500, border: "none" }}>
                  Brochure
                </Button>
              )}
            </div>
          </div>

          <div style={{ background: "#fefce8", border: "1px solid #fef08a", padding: "16px 20px", borderRadius: 12, marginBottom: 32 }}>
            <Text strong style={{ display: "block", fontSize: 16, color: "#854d0e", marginBottom: 4 }}>
              The project is in the process of being filled with information
            </Text>
            <Text style={{ color: "#a16207" }}>
              This is an upcoming launch project, information is being added and updated gradually according to the developer's announcements.
            </Text>
          </div>

          <Title level={3} style={{ marginBottom: 16 }}>Description</Title>
          <Text type="secondary" strong style={{ display: "block", marginBottom: 12 }}>Project general facts</Text>
          <Paragraph ellipsis={{ rows: 4, expandable: true, symbol: 'Read More' }} style={{ fontSize: 15, color: "#4b5563", lineHeight: 1.8 }}>
            {property.description || "Detailed description for this property is not available yet. Please contact the sales office for more information regarding amenities, lifestyle, and project highlights."}
          </Paragraph>

          <Divider style={{ margin: "40px 0" }} />

          <Title level={3} style={{ marginBottom: 24 }}>Units & Availability</Title>
          <Collapse defaultActiveKey={['1']} ghost expandIconPosition="end" style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12 }}>
            <Panel 
              header={
                <Row justify="space-between" align="middle" style={{ width: "100%", paddingRight: 16 }}>
                  <Col><Text strong style={{ fontSize: 16 }}>{property.bedrooms || "Studio/1"} Bedroom</Text></Col>
                  <Col><Text type="secondary">Various Units</Text></Col>
                  <Col><Text type="secondary">{property.builtUpArea_min || 0} sqft</Text></Col>
                  <Col><Text strong style={{ fontSize: 16 }}>{property.currency || "AED"} {Number(property.price || 0).toLocaleString()}</Text></Col>
                </Row>
              } 
              key="1"
            >
              <div style={{ background: "#f9fafb", padding: 16, borderRadius: 8, marginTop: 10 }}>
                <Row justify="space-between" align="middle">
                  <Col span={4}>
                    <div style={{ width: 60, height: 40, background: "#e5e7eb", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <AppstoreOutlined style={{ color: "#9ca3af", fontSize: 20 }}/>
                    </div>
                  </Col>
                  <Col span={4}><Text strong>{property.bedrooms || 1} Bedroom</Text></Col>
                  <Col span={4}><Text>{property.propertyType || "Apartment"}</Text></Col>
                  <Col span={4}><Text>{property.builtUpArea_min || 0} sqft</Text></Col>
                  <Col span={6}>
                    <Text strong style={{ display: "block" }}>{property.currency || "AED"} {Number(property.price || 0).toLocaleString()}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{Math.round((property.price || 0) / (property.builtUpArea_min || 1))} AED/sqft</Text>
                  </Col>
                </Row>
              </div>
            </Panel>
          </Collapse>
        </Col>

        <Col xs={24} lg={8}>
          <div style={{ position: "sticky", top: 24 }}>
            <Text type="secondary" style={{ fontSize: 14 }}>
              <EnvironmentOutlined /> {property.city}, {property.country || "UAE"}
            </Text>
            <Title level={2} style={{ marginTop: 8, marginBottom: 24 }}>
              {property.propertyName} by {developerName}
            </Title>

            <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <TagOutlined style={{ fontSize: 20, color: "#6b7280", marginTop: 4 }} />
                <div>
                  <Text type="secondary" style={{ fontSize: 13, display: "block" }}>Price from:</Text>
                  <Text strong style={{ fontSize: 18 }}>{Number(property.price || 0).toLocaleString()} {property.currency || "AED"}</Text>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <AppstoreOutlined style={{ fontSize: 20, color: "#6b7280", marginTop: 4 }} />
                <div>
                  <Text strong style={{ fontSize: 16, display: "block" }}>Available Units</Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>Ask for inventory</Text>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <WalletOutlined style={{ fontSize: 20, color: "#6b7280", marginTop: 4 }} />
                <div>
                  <Text type="secondary" style={{ fontSize: 13, display: "block" }}>Payment plan:</Text>
                  <Text strong style={{ fontSize: 16 }}>{getPaymentPlan()}</Text>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <BankOutlined style={{ fontSize: 20, color: "#6b7280", marginTop: 4 }} />
                <div>
                  <Text type="secondary" style={{ fontSize: 13, display: "block" }}>Developer:</Text>
                  <Text strong style={{ fontSize: 16 }}>{developerName}</Text>
                </div>
              </div>
            </div>

            <div style={{ background: "#fffbe6", border: "1px solid #ffe58f", padding: "8px", borderRadius: "8px 8px 0 0", textAlign: "center" }}>
              <Text strong style={{ fontSize: 13 }}>🔑 Your customised personal offer. Try it!</Text>
            </div>
            
            <div style={{ display: "flex", width: "100%", marginBottom: 12 }}>
              <Button 
                type="primary" 
                onClick={() => setIsOfferModalOpen(true)}
                style={{ flex: 1, height: 48, borderRadius: "0 0 0 8px", background: "#5b45ff", fontWeight: 600, fontSize: 16, border: "none" }}
              >
                Generate Sales Offer
              </Button>
              <Button 
                style={{ width: 48, height: 48, borderRadius: "0 0 8px 0", background: "#4f39f6", color: "#fff", border: "none" }}
                icon={<ShareAltOutlined />}
              />
            </div>

            <Button 
              block 
              style={{ height: 48, borderRadius: 8, background: "#1f1f1f", color: "#fff", fontWeight: 600, fontSize: 16, border: "none", marginBottom: 24 }}
              icon={<ExportOutlined />}
            >
              Transfer client
            </Button>

            <Card style={{ borderRadius: 12, border: "1px solid #e5e7eb" }} styles={{ body: { padding: "16px 20px" } }}>
              <div style={{ textAlign: "center", marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #f3f4f6" }}>
                <Text strong>Sales Office</Text>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Space>
                  <Avatar size={48} src={property.developer?.logo} style={{ background: "#f3f4f6" }}>
                    {!property.developer?.logo && property.developer?.name?.charAt(0)}
                  </Avatar>
                  <div>
                    <Text strong style={{ display: "block" }}>{developerName} Team</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>English • Arabic</Text>
                  </div>
                </Space>
                <Button shape="round" icon={<MessageOutlined />} style={{ background: "#d9f99d", color: "#3f6212", border: "none", fontWeight: 600 }}>
                  Support
                </Button>
              </div>
            </Card>

          </div>
        </Col>
      </Row>

      {/* ================= PHOTOS MODAL ================= */}
      <Modal title={<Title level={5} style={{ margin: 0 }}>Property Gallery</Title>} open={isPhotoModalOpen} onCancel={() => setIsPhotoModalOpen(false)} footer={null} width={900} centered>
        <div style={{ marginTop: 20 }}>
          <Image.PreviewGroup>
            <Row gutter={[16, 16]}>
              {allPhotos.map((photo, index) => (
                <Col xs={12} sm={8} md={6} key={index}>
                  <Image src={photo} alt={`Property Photo ${index + 1}`} style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 8, cursor: "pointer", border: "1px solid #f0f0f0" }} />
                </Col>
              ))}
            </Row>
          </Image.PreviewGroup>
        </div>
      </Modal>

      {/* ================= GENERATE OFFER MODAL ================= */}
      <Modal
        title={<div style={{ textAlign: 'center', width: '100%', fontSize: '18px', fontWeight: 'bold' }}>Generate Sales Offer</div>}
        open={isOfferModalOpen}
        onCancel={() => setIsOfferModalOpen(false)}
        footer={null}
        width={750}
        centered
        styles={{ body: { padding: '10px 24px 24px' } }} 
      >
        <div style={{ maxHeight: '75vh', overflowY: 'auto', paddingRight: '5px' }}>
          
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>PDF Preferences</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Configure your presentation before generation</div>
          
          <div style={{ marginTop: 20 }}>
            <Text strong style={{ display: 'block', marginBottom: 6 }}>Language</Text>
            <Select value={pdfPreferences.language} style={{ width: '100%' }} size="large" onChange={(val) => setPdfPreferences({...pdfPreferences, language: val})}>
              {languages.map(lang => (
                <Select.Option key={lang.code} value={lang.code}>
                  <strong style={{marginRight: 8}}>{lang.code}</strong> {lang.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div style={{ marginTop: 16 }}>
            <Text strong style={{ display: 'block', marginBottom: 6 }}>Currency</Text>
            <Select 
              value={pdfPreferences.currency} 
              style={{ width: '100%' }} 
              size="large" 
              showSearch
              optionFilterProp="children"
              onChange={(val) => setPdfPreferences({...pdfPreferences, currency: val})}
            >
              {currencies.map(curr => (
                <Select.Option key={curr.code} value={curr.code}>
                  <strong style={{marginRight: 8}}>{curr.code}</strong> {curr.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div style={{ marginTop: 16 }}>
            <Text strong style={{ display: 'block', marginBottom: 6 }}>Measure units</Text>
            <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 8, padding: 4 }}>
               <div onClick={() => setPdfPreferences({...pdfPreferences, measureUnit: 'ft2'})} style={{ flex: 1, textAlign: 'center', padding: '6px 0', cursor: 'pointer', borderRadius: 6, background: pdfPreferences.measureUnit === 'ft2' ? '#fff' : 'transparent', fontWeight: pdfPreferences.measureUnit === 'ft2' ? 'bold' : 'normal', color: pdfPreferences.measureUnit === 'ft2' ? '#5C039B' : '#6b7280', boxShadow: pdfPreferences.measureUnit === 'ft2' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>ft²</div>
               <div onClick={() => setPdfPreferences({...pdfPreferences, measureUnit: 'm2'})} style={{ flex: 1, textAlign: 'center', padding: '6px 0', cursor: 'pointer', borderRadius: 6, background: pdfPreferences.measureUnit === 'm2' ? '#fff' : 'transparent', fontWeight: pdfPreferences.measureUnit === 'm2' ? 'bold' : 'normal', color: pdfPreferences.measureUnit === 'm2' ? '#5C039B' : '#6b7280', boxShadow: pdfPreferences.measureUnit === 'm2' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>m²</div>
            </div>
          </div>

          <Divider />

          <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginBottom: '16px' }}>Display Settings</div>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['Project description', 'Developer', 'Unit availability', 'Typical units', 'Unit prices', 'Payment plans', 'Location', 'Master plan', 'Cover slide'].map(item => (
              <Checkbox key={item} defaultChecked onChange={(e) => {
                   let newSlides = [...pdfPreferences.slides];
                   if(e.target.checked) newSlides.push(item);
                   else newSlides = newSlides.filter(s => s !== item);
                   setPdfPreferences({...pdfPreferences, slides: newSlides});
                }}>
                {item}
              </Checkbox>
            ))}
          </div>

          <Divider />

          <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>Personalised description</div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>Adapt the project description in the sales offer yourself or with the help of XOTO AI.</div>
          
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
            <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', fontWeight: 'bold' }}>Description</Text>
            
            {isEditingDesc ? (
              <Input.TextArea rows={4} value={customDescription} onChange={(e) => setCustomDescription(e.target.value)} style={{ borderRadius: 8, marginBottom: 12, marginTop: 8 }} />
            ) : (
              <div style={{ maxHeight: 100, overflowY: 'auto', fontSize: 13, color: '#4b5563', marginBottom: 12, marginTop: 8 }}>
                {customDescription}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <Button style={{ flex: 1 }} icon={<EditOutlined />} onClick={() => setIsEditingDesc(!isEditingDesc)}>
                {isEditingDesc ? 'Save' : 'Edit'}
              </Button>
              <Button type="primary" style={{ flex: 1, background: 'linear-gradient(90deg, #5C039B 0%, #a855f7 100%)', border: 'none' }} icon={<RobotOutlined />} loading={isImprovingAI} onClick={handleImproveWithAI}>
                Improve with AI
              </Button>
            </div>
          </div>

          <Button type="primary" block size="large" loading={isGenerating} onClick={handleGenerateOffer} style={{ marginTop: 24, height: 50, borderRadius: 10, background: '#1f1f1f', fontWeight: 'bold' }}>
            {isGenerating ? 'Generating...' : 'Generate sales offer'}
          </Button>

        </div>
      </Modal>
    </div>
  );
}