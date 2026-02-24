import {
  Card,
  Typography,
  Row,
  Col,
  Input,
  Select,
  Button,
  Spin,
  message,
  Space
} from "antd";
import { InfoCircleOutlined, SearchOutlined, SlidersOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export default function AgentProjects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // ================= FETCH =================
  const fetchProjects = async (pageNo = 1, append = false) => {
    try {
      setLoading(true);
      // Backend mein developer populate hona chahiye ideally
      const res = await fetch(
        `https://xoto.ae/api/property/get-all-properties?page=${pageNo}&limit=8`
      );
      const json = await res.json();
      const list = json?.data?.data || json?.data || [];

      if (!list.length) setHasMore(false);

      setProjects(prev => {
        const updated = append ? [...prev, ...list] : list;
        return updated;
      });
    } catch (err) {
      console.error(err);
      message.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  // FIRST LOAD
  useEffect(() => {
    fetchProjects(1, false);
  }, []);

  // ================= FILTER LOGIC =================
  useEffect(() => {
    const q = search.toLowerCase();
    const result = projects.filter(p =>
      (!q ||
        p.propertyName?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q) ||
        p.area?.toLowerCase().includes(q)
      )
      && (!location || p.city === location)
    );
    setFiltered(result);
  }, [search, location, projects]);

  // ================= LOAD MORE =================
  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchProjects(next, true);
  };

  // ================= HELPERS =================
  const getImage = (p) => {
    if (p?.photos?.length) return p.photos[0];
    if (p?.mainLogo) return p.mainLogo;
    return "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200";
  };

  // Format payment plan intelligently
  const getPaymentPlan = (p) => {
    if (p.paymentPlan_initialPercentage && p.paymentPlan_laterPercentage) {
      return `${p.paymentPlan_initialPercentage}/${p.paymentPlan_laterPercentage}%`;
    }
    return "Contact Us";
  };

  return (
    <div style={{ padding: "32px", background: "#f8f9fa", minHeight: "100vh" }}>
      
      {/* FILTER BAR (Matches the top horizontal layout of the image) */}
      <div style={{ marginBottom: 24, display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search & filters"
          style={{ width: 220, borderRadius: 8, height: 40 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          suffix={<SlidersOutlined style={{color: '#888'}}/>}
        />
        
        <Select placeholder="Developer" style={{ width: 140, height: 40 }} />
        <Select placeholder="Price" style={{ width: 120, height: 40 }} />
        <Select placeholder="Payments" style={{ width: 120, height: 40 }} />
        <Select placeholder="Handover" style={{ width: 120, height: 40 }} />
        <Select placeholder="Unit type" style={{ width: 120, height: 40 }} />
        <Select placeholder="Bedrooms" style={{ width: 120, height: 40 }} />
        <Select placeholder="Status" style={{ width: 120, height: 40 }} />
      </div>

      {/* CARDS GRID */}
      {/* Target UI has 4 columns on large screens */}
      <Row gutter={[20, 24]}>
        {filtered.map(p => (
          <Col xs={24} sm={12} md={8} lg={6} key={p._id}>
            <Card
              hoverable
              onClick={() => navigate(`/dashboard/agent/projects/${p._id}`)}
              style={{
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid #e8e8e8",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
              }}
              bodyStyle={{ padding: "20px 16px 16px" }} // Extra top padding for overlapping logo
              cover={
                <div style={{ position: "relative", height: 210 }}>
                  <img
                    src={getImage(p)}
                    alt={p.propertyName}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  
                  {/* TOP LEFT BADGES */}
                  <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 8 }}>
                    <span style={{ 
                      background: "#fff", color: "#333", padding: "4px 8px", 
                      borderRadius: 6, fontSize: 12, fontWeight: 600, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" 
                    }}>
                      {p.propertySubType === "off_plan" ? "Presale" : "Ready"}
                    </span>
                    {p.handover && (
                      <span style={{ 
                        background: "#fff", color: "#333", padding: "4px 8px", 
                        borderRadius: 6, fontSize: 12, fontWeight: 600, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" 
                      }}>
                        {p.handover}
                      </span>
                    )}
                  </div>

                  {/* DEVELOPER LOGO OVERLAPPING */}
                  <div style={{
                    position: "absolute",
                    bottom: -16,
                    left: 16,
                    width: 44,
                    height: 44,
                    backgroundColor: "#000",
                    borderRadius: 6,
                    border: "2px solid #fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
                  }}>
                    {/* Fallback check for developer logic */}
                    {p.developer && p.developer.logo ? (
                      <img src={p.developer.logo} alt="dev" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
                        {p.developer?.name ? p.developer.name.charAt(0) : "D"}
                      </span>
                    )}
                  </div>
                </div>
              }
            >
              {/* CONTENT SECTION */}
              <Title level={5} style={{ margin: "4px 0 2px", fontSize: 16, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {p.propertyName}
              </Title>
              
              <Text type="secondary" style={{ display: "block", marginBottom: 16, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {p.area || p.city} • by {p.developer?.name || "Developer"}
              </Text>

              {/* PRICE & PAYMENT PLAN ROW */}
              <Row justify="space-between" align="bottom">
                <Col>
                  <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 2 }}>Price from</Text>
                  <Text strong style={{ fontSize: 16 }}>
                    {Number(p.price || 0).toLocaleString()} {p.currency || "AED"}
                  </Text>
                </Col>
                
                <Col style={{ textAlign: "right" }}>
                  <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 2 }}>Payment plan</Text>
                  <Text strong style={{ fontSize: 14 }}>
                    {getPaymentPlan(p)} <InfoCircleOutlined style={{ color: "#bfbfbf", marginLeft: 4 }} />
                  </Text>
                </Col>
              </Row>

            </Card>
          </Col>
        ))}
      </Row>

      {/* LOAD MORE */}
      <div style={{ textAlign: "center", marginTop: 40 }}>
        {loading ? (
          <Spin size="large" />
        ) : hasMore ? (
          <Button
            size="large"
            onClick={loadMore}
            style={{ borderRadius: 8, height: 44, padding: "0 32px", fontWeight: 600 }}
          >
            Show More
          </Button>
        ) : (
          <Text type="secondary">No more projects found</Text>
        )}
      </div>

    </div>
  );
}