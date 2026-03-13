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
  AppstoreOutlined, ArrowLeftOutlined, EditOutlined, RobotOutlined, MoneyCollectOutlined
} from "@ant-design/icons";
import axios from "axios";

// 🔥 PDF GENERATOR IMPORTS
import { pdf, Document, Page, Text as PdfText, View, Image as PdfImage, StyleSheet } from '@react-pdf/renderer';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

// 🔥 1. PREMIUM STYLESHEET (Exact Reelly PDF Jaisa Cover Page)
const pdfStyles = StyleSheet.create({
  page: { backgroundColor: '#ffffff', padding: 0 },
  
  // --- Cover Page (Page 1) ---
  coverPage: { backgroundColor: '#7a7a7a', height: '100%', padding: 40, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' },
  agentImageCover: { width: 140, height: 140, borderRadius: 16, marginBottom: 40, objectFit: 'cover' },
  coverSubtitle: { fontSize: 14, color: '#e5e7eb', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
  coverTitle: { fontSize: 42, color: '#ffffff', fontWeight: 'bold', marginBottom: 50, textAlign: 'center' },
  coverDetailsBox: { alignItems: 'center', marginTop: 20 },
  coverDate: { fontSize: 12, color: '#d1d5db', marginBottom: 20 },
  coverDevTag: { fontSize: 14, color: '#ffffff', fontWeight: 'bold', marginBottom: 30 },
  coverAgentName: { fontSize: 22, color: '#ffffff', fontWeight: 'bold', marginBottom: 15 },
  coverContact: { fontSize: 14, color: '#e5e7eb', marginBottom: 8 }
});

// 🔥 2. EXACT PDF TEMPLATE (Cover Page Only for now)
const PropertyBrochure = ({ property, preferences }) => {
  const today = new Date().toLocaleDateString('en-GB'); 
  const devName = property?.developer?.name || "Premium Developer";

  return (
    <Document>
      {/* ================= PAGE 1: COVER SLIDE ================= */}
      {preferences.slides.includes('Cover slide') && (
        <Page size="A4" style={pdfStyles.coverPage}>
          <PdfImage 
            style={pdfStyles.agentImageCover} 
            src={"https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400"} // Dummy Agent Photo (Baad mein teri photo aayegi)
          />
          <PdfText style={pdfStyles.coverSubtitle}>Look what we found for you</PdfText>
          <PdfText style={pdfStyles.coverTitle}>{property?.propertyName || "Exclusive Property"}</PdfText>
          
          <View style={pdfStyles.coverDetailsBox}>
            <PdfText style={pdfStyles.coverDate}>Date of creation {today}</PdfText>
            <PdfText style={pdfStyles.coverDevTag}>#{devName.replace(/\s/g, '')}</PdfText>
            
            <PdfText style={pdfStyles.coverAgentName}>Vishal</PdfText>
            <PdfText style={pdfStyles.coverContact}>xoto.ae</PdfText>
            <PdfText style={pdfStyles.coverContact}>+971 50 123 4567</PdfText>
            <PdfText style={pdfStyles.coverContact}>vishal@xoto.ae</PdfText>
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

  // Description & AI States
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

  const handleGenerateOffer = async () => {
    setIsGenerating(true);
    const key = "updatable";
    message.loading({ content: "XOTO Blitz is generating your PDF...", key });

    try {
      const updatedProperty = { ...property, description: customDescription };

      const blob = await pdf(
        <PropertyBrochure property={updatedProperty} preferences={pdfPreferences} />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${updatedProperty.propertyName || 'Property'}_Sales_Offer.pdf`;
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      message.success({ content: "PDF Downloaded Successfully!", key, duration: 2 });
      setIsOfferModalOpen(false); 

    } catch (error) {
      message.error({ content: "Failed to generate PDF.", key, duration: 3 });
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
  const getCommissionText = () => {
    if (!property?.commissionType) return "Not specified";
    
    const value = property.commissionValue || 0;
    const type = property.commissionType; // "percentage" ya "fixed"
    const stage = property.commissionStage ? ` (on ${property.commissionStage})` : "";
    
    if (type === "percentage") {
      return `${value}%${stage}`;
    } else if (type === "fixed") {
      return `${property.currency || "AED"} ${value.toLocaleString()}${stage}`;
    }
    
    return `${value}${stage}`;
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
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <MoneyCollectOutlined style={{ fontSize: 20, color: "#6b7280", marginTop: 4 }} />
                <div>
                  <Text type="secondary" style={{ fontSize: 13, display: "block" }}>Agent Commission:</Text>
                  <Text strong style={{ fontSize: 16, color: "#16a34a" }}>
                    {getCommissionText()}
                  </Text>
                  {property.commissionNotes && (
                    <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 2 }}>
                      * {property.commissionNotes}
                    </Text>
                  )}
                </div>
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

      {/* ================= GENERATE OFFER MODAL (BOLD HEADINGS KE SATH) ================= */}
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
          
          {/* 🔥 BOLD HEADING 1 */}
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>
            PDF Preferences
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Configure your presentation before generation
          </div>
          
          <div style={{ marginTop: 20 }}>
            <Text strong style={{ display: 'block', marginBottom: 6 }}>Language</Text>
            <Select 
              value={pdfPreferences.language} 
              style={{ width: '100%' }} 
              size="large" 
              onChange={(val) => setPdfPreferences({...pdfPreferences, language: val})}
            >
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

          {/* 🔥 BOLD HEADING 2 */}
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginBottom: '16px' }}>
            Display Settings
          </div>
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

          {/* 🔥 BOLD HEADING 3 */}
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>
            Personalised description
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
            Adapt the project description in the sales offer yourself or with the help of XOTO AI.
          </div>
          
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