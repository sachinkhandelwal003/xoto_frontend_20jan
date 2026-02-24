import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Row, Col, Typography, Button, Tag, Spin, message,
  Card, Divider, Collapse, Avatar, Space, Modal, Image
} from "antd"; // ✅ Modal aur Image import kiya gaya hai
import {
  EnvironmentOutlined, PictureOutlined, FilePdfOutlined,
  TagOutlined, WalletOutlined, BankOutlined,
  ShareAltOutlined, ExportOutlined, MessageOutlined,
  AppstoreOutlined, ArrowLeftOutlined
} from "@ant-design/icons";
import axios from "axios";

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

export default function AgentProjectDetails() {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // ✅ Modal state manage karne ke liye
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  useEffect(() => {
    fetchPropertyDetails();
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`https://xoto.ae/api/property/get-property-by-id?id=${id}`);
      if (res.data?.success) {
        setProperty(res.data.data);
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

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Spin size="large" tip="Loading Project Details..." />
      </div>
    );
  }

  if (!property) {
    return <div style={{ padding: 40, textAlign: "center" }}><Title level={4}>Project not found!</Title></div>;
  }

  // Helpers
  const getImage = () => {
    if (property?.photos?.length) return property.photos[0];
    if (property?.mainLogo) return property.mainLogo;
    return "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200";
  };

  // Saari photos ka array banayenge gallery ke liye
  const allPhotos = property?.photos?.length > 0 ? property.photos : [getImage()];

  const getPaymentPlan = () => {
    if (property.paymentPlan_initialPercentage && property.paymentPlan_laterPercentage) {
      return `${property.paymentPlan_initialPercentage}/${property.paymentPlan_laterPercentage}%`;
    }
    return "Contact for Plan";
  };

  const developerName = property?.developer?.name || "Unknown Developer";

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

      <Row gutter={[32, 32]}>
        {/* ================= LEFT COLUMN ================= */}
        <Col xs={24} lg={16}>
          
          <div style={{ position: "relative", height: 500, borderRadius: 16, overflow: "hidden", marginBottom: 24 }}>
            <img 
              src={getImage()} 
              alt={property.propertyName} 
              style={{ width: "100%", height: "100%", objectFit: "cover" }} 
            />
            
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
              {/* ✅ Photos Button onClick Event */}
              <Button 
                icon={<PictureOutlined />} 
                onClick={() => setIsPhotoModalOpen(true)} 
                style={{ borderRadius: 8, fontWeight: 500, border: "none" }}
              >
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
          <Collapse 
            defaultActiveKey={['1']} 
            ghost 
            expandIconPosition="end"
            style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12 }}
          >
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

        {/* ================= RIGHT COLUMN ================= */}
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

            <Card style={{ borderRadius: 12, border: "1px solid #e5e7eb" }} bodyStyle={{ padding: "16px 20px" }}>
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
                
                <Button 
                  shape="round" 
                  icon={<MessageOutlined />} 
                  style={{ background: "#d9f99d", color: "#3f6212", border: "none", fontWeight: 600 }}
                >
                  Support
                </Button>
              </div>
            </Card>

          </div>
        </Col>
      </Row>

      {/* ================= PHOTOS MODAL ================= */}
      <Modal
        title={<Title level={5} style={{ margin: 0 }}>Property Gallery</Title>}
        open={isPhotoModalOpen}
        onCancel={() => setIsPhotoModalOpen(false)}
        footer={null}
        width={900}
        centered
        destroyOnClose
      >
        <div style={{ marginTop: 20 }}>
          <Image.PreviewGroup>
            <Row gutter={[16, 16]}>
              {allPhotos.map((photo, index) => (
                <Col xs={12} sm={8} md={6} key={index}>
                  <Image
                    src={photo}
                    alt={`Property Photo ${index + 1}`}
                    style={{ 
                      width: "100%", 
                      height: 140, 
                      objectFit: "cover", 
                      borderRadius: 8,
                      cursor: "pointer",
                      border: "1px solid #f0f0f0"
                    }}
                  />
                </Col>
              ))}
            </Row>
          </Image.PreviewGroup>
        </div>
      </Modal>

    </div>
  );
}