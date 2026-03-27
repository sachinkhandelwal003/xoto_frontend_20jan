import {
  Card,
  Typography,
  Tag,
  Button,
  Input,
  Row,
  Col,
  Statistic
} from "antd";

import { apiService } from "../../../manageApi/utils/custom.apiservice";
import {
  PlusOutlined,
  SearchOutlined,
  HomeOutlined
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const { Title, Text } = Typography;

export default function DeveloperProjects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // ================= FETCH PROJECTS =================
  const fetchProjects = async () => {
    try {
      setLoading(true);

      const res = await apiService.get(
        "/properties/developer/property/offplan",
        {
          page: 1,
          limit: 10
        }
      );

      const list = res?.data || [];

      const mapped = list.map((p, index) => ({
        key: p._id || `row-${index}`,
        propertyName: p.propertyName || "Untitled",
        location: `${p.area || ""} ${p.city || ""}`.trim(),
        units: p.builtUpArea_max
          ? `${p.builtUpArea_min}-${p.builtUpArea_max} sqft`
          : "-",
        status: p.approvalStatus || "pending",
        image: p.mainLogo || ""
      }));

      setProjects(mapped);
      setFiltered(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // ================= SEARCH =================
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      projects.filter(
        (p) =>
          p.propertyName?.toLowerCase().includes(q) ||
          p.location?.toLowerCase().includes(q)
      )
    );
  }, [search, projects]);

  const getColor = (status) => {
    if (status === "approved") return "green";
    if (status === "pending") return "orange";
    if (status === "rejected") return "red";
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <Row justify="space-between" align="middle" className="mb-6">
        <Col>
          <Title level={3}>My Properties</Title>
          <Text type="secondary">
            Manage and track all your listed properties
          </Text>
        </Col>

        <Col>
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={() =>
              navigate("/dashboard/developer/developer-projects/add")
            }
          >
            Add Property
          </Button>
        </Col>
      </Row>

      {/* STATS + SEARCH */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Total Properties"
              value={projects.length}
              prefix={<HomeOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Card>
            <Input
              placeholder="Search properties..."
              prefix={<SearchOutlined />}
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Card>
        </Col>
      </Row>

      {/* ================= CARDS ================= */}
      <Row gutter={[16, 16]}>
        {filtered.map((item) => (
          <Col xs={24} sm={12} md={8} lg={6} key={item.key}>
            <Card
              hoverable
              style={{ borderRadius: 12, overflow: "hidden" }}
              cover={
                <img
                  alt="property"
                  src={
                    item.image ||
                    "https://via.placeholder.com/300x200?text=No+Image"
                  }
                  style={{
                    height: 200,
                    objectFit: "cover"
                  }}
                />
              }
            >
              {/* NAME */}
              <Title level={5} style={{ marginBottom: 4 }}>
                {item.propertyName}
              </Title>

              {/* LOCATION */}
              <Text type="secondary">
                {item.location}
              </Text>

              <br />

              {/* AREA */}
              <Text>{item.units}</Text>

              <br />

              {/* STATUS */}
              <Tag
                color={getColor(item.status)}
                style={{ marginTop: 6 }}
              >
                {item.status?.toUpperCase()}
              </Tag>

              {/* BUTTONS */}
              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap"
                }}
              >
                <Button
                  size="small"
                  type="primary"
                  onClick={() =>
                    navigate(`/dashboard/developer/developer-projects/${item.key}`)
                  }
                >
                  View
                </Button>

                <Button
                  size="small"
                  onClick={() =>
                    navigate(`/dashboard/developer/edit-property/${item.key}`)
                  }
                >
                  Edit
                </Button>

                <Button
                  size="small"
                  style={{
                    background: "#22c55e",
                    color: "#fff"
                  }}
                  onClick={() =>
                    navigate(`/dashboard/developer/inventory/${item.key}`)
                  }
                >
                  Inventory
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* EMPTY STATE */}
      {filtered.length === 0 && !loading && (
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <Text type="secondary">No properties found</Text>
        </div>
      )}
    </div>
  );
}