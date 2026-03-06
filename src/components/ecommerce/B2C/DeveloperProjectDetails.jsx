import { 
  Card, 
  Typography, 
  Row, 
  Col, 
  Tag, 
  Table, 
  Button, 
  Spin, 
  message,
  Descriptions,
  Image,
  Divider,
  Space 
} from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { EnvironmentOutlined, DownloadOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

export default function DeveloperProjectDetails() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { token } = useSelector((s) => s.auth);

  const [project, setProject] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= API CALLS =================
 // ================= API CALLS =================
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);

      // ✅ YAHAN ROUTE UPDATE KIYA HAI: Query Parameter (?id=) ka use karke
// const propertyRes = await fetch(`https://xoto.ae/api/property/get-property-by-id?id=${id}`, {
const propertyRes = await fetch(`https://localhost:5000/api/property/get-property-by-id?id=${id}`, {
  headers: { Authorization: `Bearer ${token}` }
});
        const propertyData = await propertyRes.json();
        
        // Data set kar rahe hain
        setProject(propertyData?.data || propertyData);

        // Leads API (Yeh pehle se sahi tha)
        // const leadsRes = await fetch(`https://xoto.ae/api/lead/get-all-leads?propertyId=${id}`, {
        const leadsRes = await fetch(`https://localhost:5000/api/lead/get-all-leads?propertyId=${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const leadsData = await leadsRes.json();
        setLeads(leadsData?.data?.data || leadsData?.data || []);

      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Failed to load details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);


  // ================= UI HELPERS =================
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Spin size="large" tip="Loading complete property details..." />
      </div>
    );
  }

  if (!project) {
    return <div className="p-6 text-center text-gray-500">Property details not found!</div>;
  }

  // Location string formatter
  const locationStr = [project.city, project.state, project.country, project.postalCode]
    .filter(Boolean)
    .join(", ") || "Location details not specified";

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* 1. HEADER SECTION (Logo, Name, Tags, Location) */}
      <Card className="shadow-sm rounded-xl mb-6" bodyStyle={{ padding: '24px' }}>
        <Row align="middle" gutter={24}>
          {project.mainLogo && (
            <Col>
              <img 
                src={project.mainLogo} 
                alt="Main Logo" 
                style={{ width: 100, height: 100, objectFit: 'contain', borderRadius: 12, border: '1px solid #f0f0f0', padding: 8, backgroundColor: '#fff' }} 
              />
            </Col>
          )}
          <Col flex="auto">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <Title level={2} style={{ margin: 0 }}>{project.propertyName}</Title>
              {project.isFeatured && <Tag color="gold">Featured</Tag>}
              {project.isAvailable ? <Tag color="green">Available</Tag> : <Tag color="red">Sold Out</Tag>}
              {project.notReadyYet && <Tag color="orange">Under Construction</Tag>}
            </div>
            
            <Text type="secondary" style={{ fontSize: 16 }}>
              <EnvironmentOutlined style={{ marginRight: 6 }} /> {locationStr}
            </Text>

            <div style={{ marginTop: 12 }}>
              <Tag color="geekblue" style={{ textTransform: 'capitalize' }}>For {project.transactionType || "Sell"}</Tag>
              <Tag color="purple" style={{ textTransform: 'capitalize' }}>{project.propertySubType?.replace('_', ' ') || "Off Plan"}</Tag>
            </div>
          </Col>
          
          {project.brochure && (
            <Col>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />} 
                size="large" 
                href={project.brochure} 
                target="_blank"
                style={{ background: "#6d28d9", borderColor: "#6d28d9" }}
              >
                Download Brochure
              </Button>
            </Col>
          )}
        </Row>
      </Card>

      {/* 2. PHOTOS GALLERY */}
      {project.photos && project.photos.length > 0 && (
        <Card className="shadow-sm rounded-xl mb-6" title={<Title level={4} style={{ margin: 0 }}>Property Photos</Title>}>
          <Image.PreviewGroup>
            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
              {project.photos.map((photo, index) => (
                <Image 
                  key={index} 
                  width={220} 
                  height={140} 
                  style={{ objectFit: 'cover', borderRadius: 8, border: '1px solid #f0f0f0' }} 
                  src={photo} 
                />
              ))}
            </div>
          </Image.PreviewGroup>
        </Card>
      )}

      {/* 3. PROPERTY DETAILS (Grid) */}
      <Card className="shadow-sm rounded-xl mb-6" title={<Title level={4} style={{ margin: 0 }}>Overview & Configuration</Title>}>
        <Descriptions bordered column={{ xxl: 3, xl: 3, lg: 2, md: 1, sm: 1, xs: 1 }}>
          
          {/* General */}
          <Descriptions.Item label="Property Type"><b>{project.propertyType || "N/A"}</b></Descriptions.Item>
          <Descriptions.Item label="Handover Date"><b>{project.handover || "N/A"}</b></Descriptions.Item>
          <Descriptions.Item label="Bed & Bath"><b>{project.bedrooms} Beds / {project.bathrooms} Baths</b></Descriptions.Item>
          
          {/* Dimensions & Area */}
          <Descriptions.Item label="Built-Up Area">
            <b>{project.builtUpArea_min} - {project.builtUpArea_max} {project.builtUpAreaUnit}</b>
          </Descriptions.Item>
          <Descriptions.Item label="Dimensions">
            <b>L: {project.length}{project.lengthUnit} x B: {project.breadth}{project.breadthUnit}</b>
          </Descriptions.Item>
          <Descriptions.Item label="Unit Types">
            {project.unitType && project.unitType.length > 0 
              ? project.unitType.map(u => <Tag key={u} color="cyan">{u}</Tag>) 
              : "N/A"}
          </Descriptions.Item>

          {/* Pricing & Payment */}
          <Descriptions.Item label="Price Range">
            <span style={{ color: '#28a745', fontWeight: 'bold' }}>
              {project.currency} {project.price_min} - {project.price_max || project.price}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Down Payment"><b>{project.downPayment}%</b></Descriptions.Item>
          <Descriptions.Item label="Payment Plan">
            <b>Initial: {project.paymentPlan_initialPercentage}% / Later: {project.paymentPlan_laterPercentage}%</b>
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        {/* 4. DESCRIPTION & DEVELOPER INFO */}
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Title level={5}>Description</Title>
            <Paragraph style={{ color: '#555', whiteSpace: 'pre-line' }}>
              {project.description || "No description provided."}
            </Paragraph>
          </Col>
          <Col xs={24} md={12}>
            <Title level={5}>About Developer</Title>
            <Paragraph style={{ color: '#555', whiteSpace: 'pre-line' }}>
              {project.about_developer || "Developer information not provided."}
            </Paragraph>
          </Col>
        </Row>

        <Divider />

        {/* 5. HIGHLIGHTS & AMENITIES */}
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Title level={5}>Amenities</Title>
            {project.amenities && project.amenities.length > 0 ? (
              <Space wrap>
                {project.amenities.map(item => <Tag color="blue" key={item}>{item}</Tag>)}
              </Space>
            ) : <Text type="secondary">No amenities listed.</Text>}
          </Col>
          
          <Col xs={24} md={12}>
            <Title level={5}>Location Highlights</Title>
            {project.location_highlights && project.location_highlights.length > 0 ? (
              <Space wrap>
                {project.location_highlights.map(loc => <Tag color="magenta" key={loc}>{loc}</Tag>)}
              </Space>
            ) : <Text type="secondary">No highlights listed.</Text>}
          </Col>
        </Row>
      </Card>

      {/* 6. LEADS TABLE (Specific to this property) */}
      <Card className="shadow-sm rounded-xl" title={<Title level={4} style={{ margin: 0 }}>Leads for {project.propertyName}</Title>}>
        <Table
          rowKey={(record) => record._id || Math.random().toString()}
          pagination={{ pageSize: 5 }}
          dataSource={leads}
          columns={[
            { title: "Client Name", dataIndex: "clientName", render: (text) => text || "Unknown" },
            { title: "Phone", dataIndex: "phone", render: (text) => text || "N/A" },
            { title: "Interested Unit", dataIndex: "unit", render: (text) => text || "Any" },
            {
              title: "Status",
              dataIndex: "status",
              render: (status) => <Tag color="blue">{status || "New"}</Tag>
            },
            {
              title: "Action",
              render: (_, record) => (
                <Button
                  type="primary"
                  style={{ background: "#6d28d9", borderRadius: 6 }}
                  onClick={() => navigate(`/dashboard/developer/leads/${record._id}`)}
                >
                  View Lead
                </Button>
              )
            }
          ]}
        />
      </Card>

    </div>
  );
}