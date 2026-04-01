import {
  Card,
  Typography,
  Row,
  Col,
  Input,
  Button,
  Spin,
  message,
} from "antd";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import {
  SearchOutlined,
  SlidersOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  TeamOutlined,
  ExpandOutlined,
  BuildOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export default function AgencyProjects() {
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // ── API ──────────────────────────────────────────────────────────────────
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await apiService.get("properties/agency/properties/all");
      const data = response?.data?.data || response?.data || [];
      setProperties(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
      message.error("Failed to load properties");
      setProperties([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // ── Search filter ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!search) {
      setFiltered(properties);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(
      properties.filter(
        (p) =>
          p.propertyName?.toLowerCase().includes(q) ||
          p.city?.toLowerCase().includes(q) ||
          p.area?.toLowerCase().includes(q) ||
          (p.developer?.name || p.developerName || "").toLowerCase().includes(q)
      )
    );
  }, [search, properties]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getCoverImage = (p) => {
    if (p.photos?.architecture?.length > 0) return p.photos.architecture[0];
    if (p.photos?.interior?.length > 0) return p.photos.interior[0];
    if (p.mainLogo) return p.mainLogo;
    return "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80";
  };

  const isOffPlan = (p) =>
    p.propertySubType === "off_plan" || p.propertyType === "off_plan";

  // badge: Offplan (purple) or Secondary (blue)
  const SubTypeBadge = ({ p }) => {
    const offplan = isOffPlan(p);
    return (
      <span
        style={{
          background: offplan ? "rgba(109,40,217,0.85)" : "rgba(37,99,235,0.85)",
          color: "#fff",
          padding: "4px 9px",
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 700,
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
          backdropFilter: "blur(4px)",
          textTransform: "capitalize",
        }}
      >
        {offplan ? (
          <BuildOutlined style={{ fontSize: 10 }} />
        ) : (
          <HomeOutlined style={{ fontSize: 10 }} />
        )}
        {offplan ? "Off-Plan" : "Secondary"}
      </span>
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: "32px", background: "#f8f9fa", minHeight: "100vh" }}>

      {/* ── HEADER ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <Title
            level={4}
            style={{ margin: 0, fontWeight: 700, color: "#111827" }}
          >
            All Properties
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {filtered.length} {filtered.length === 1 ? "property" : "properties"} found
          </Text>
        </div>

        {/* Search */}
        <Input
          prefix={<SearchOutlined style={{ color: "#9CA3AF" }} />}
          suffix={<SlidersOutlined style={{ color: "#9CA3AF" }} />}
          placeholder="Search by name, city, area…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          style={{ width: 260, borderRadius: 8, height: 40 }}
        />
      </div>

      {/* ── CONTENT ── */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 100 }}>
          <Spin size="large" />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", paddingTop: 80 }}>
          <Text type="secondary" style={{ fontSize: 15 }}>
            No properties found
          </Text>
        </div>
      ) : (
        <Row gutter={[20, 24]}>
          {filtered.map((p) => (
            <Col xs={24} sm={12} md={8} lg={6} key={p._id}>
              <Card
                hoverable
                onClick={() => navigate(`/dashboard/agent/secondary/${p._id}`)}
                style={{
                  borderRadius: 12,
                  overflow: "hidden",
                  border: "1px solid #e8e8e8",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  height: "100%",
                }}
                bodyStyle={{ padding: "20px 16px 16px" }}
              >
                {/* ── IMAGE ── */}
                <div
                  style={{
                    position: "relative",
                    height: 210,
                    margin: "-20px -16px 16px -16px",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={getCoverImage(p)}
                    alt={p.propertyName}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.4s ease",
                    }}
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80";
                    }}
                  />

                  {/* gradient overlay */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.3) 100%)",
                      pointerEvents: "none",
                    }}
                  />

                  {/* TOP-LEFT: offplan / secondary badge + handover */}
                  <div
                    style={{
                      position: "absolute",
                      top: 12,
                      left: 12,
                      display: "flex",
                      gap: 6,
                      flexWrap: "wrap",
                      right: 12,
                    }}
                  >
                    <SubTypeBadge p={p} />

                    {(p.availableFrom || p.completionDate?.year) && (
                      <span
                        style={{
                          background: "#fff",
                          color: "#333",
                          padding: "4px 8px",
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 600,
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        }}
                      >
                        Handover:{" "}
                        {p.availableFrom
                          ? formatDate(p.availableFrom)
                          : p.completionDate?.year}
                      </span>
                    )}
                  </div>

                  {/* DEVELOPER LOGO AVATAR */}
                  {(p.developer?.logo || p.developerName) && (
                    <div
                      style={{
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
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      }}
                    >
                      {p.developer?.logo ? (
                        <img
                          src={p.developer.logo}
                          alt="dev"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <span
                          style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}
                        >
                          {(p.developerName || "D").charAt(0)}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* ── PROPERTY NAME ── */}
                <Title
                  level={5}
                  style={{
                    margin: "4px 0 2px",
                    fontSize: 15,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {p.propertyName}
                </Title>

                {/* ── LOCATION & DEVELOPER ── */}
                <Text
                  type="secondary"
                  style={{
                    display: "block",
                    marginBottom: 10,
                    fontSize: 13,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {p.area || p.city}
                  {p.developerName ? ` • by ${p.developerName}` : ""}
                </Text>

                {/* ── SPECS: Beds + Area ── */}
                <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                  {p.bedrooms > 0 && (
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12.5,
                        background: "#f3f4f6",
                        padding: "3px 9px",
                        borderRadius: 5,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <TeamOutlined style={{ fontSize: 12, color: "#6b7280" }} />
                      {p.bedrooms} Bed{p.bedrooms > 1 ? "s" : ""}
                    </Text>
                  )}
                  {(p.builtUpArea || p.builtUpArea_min) > 0 && (
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12.5,
                        background: "#f3f4f6",
                        padding: "3px 9px",
                        borderRadius: 5,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <ExpandOutlined style={{ fontSize: 12, color: "#6b7280" }} />
                      {(p.builtUpArea || p.builtUpArea_min).toLocaleString()}{" "}
                      {p.builtUpAreaUnit || "sqft"}
                    </Text>
                  )}
                </div>

                {/* ── PRICE + PAYMENT ROW ── */}
                <Row justify="space-between" align="bottom" style={{ marginBottom: 14 }}>
                  <Col>
                    <Text
                      type="secondary"
                      style={{ fontSize: 11, display: "block", marginBottom: 2 }}
                    >
                      Price from
                    </Text>
                    <Text strong style={{ fontSize: 15 }}>
                      {Number(p.price || p.price_min || 0).toLocaleString()}{" "}
                      <span style={{ color: "#6366F1", fontSize: 12, fontWeight: 600 }}>
                        {p.currency || "AED"}
                      </span>
                    </Text>
                  </Col>
                  <Col style={{ textAlign: "right" }}>
                    <Text
                      type="secondary"
                      style={{ fontSize: 11, display: "block", marginBottom: 2 }}
                    >
                      Payment plan
                    </Text>
                    <Text strong style={{ fontSize: 13 }}>
                      {p.paymentPlan?.length > 0 ? "Available" : "Contact Us"}{" "}
                      <InfoCircleOutlined style={{ color: "#bfbfbf", fontSize: 11 }} />
                    </Text>
                  </Col>
                </Row>

                {/* ── VIEW BUTTON ── */}
                <div
                  style={{ borderTop: "1px solid #f3f4f6", paddingTop: 12 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    icon={<EyeOutlined />}
                    block
                    style={{
                      borderRadius: 8,
                      height: 36,
                      fontWeight: 500,
                      fontSize: 13,
                      borderColor: "#E5E7EB",
                      color: "#374151",
                    }}
                    onClick={() => navigate(`/dashboard/agent/secondary/${p._id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}