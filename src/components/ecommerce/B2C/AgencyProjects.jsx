import {
  Typography,
  Row,
  Col,
  Input,
  Spin,
  Tag,
  Empty
} from "antd";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import {
  SearchOutlined,
  UserAddOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  BankOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  BuildOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  ColumnWidthOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const styles = `
  .ap-root {
    padding: 32px 36px;
    background: #F4F6F8;
    min-height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  /* Header */
  .ap-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 28px;
  }
  .ap-header-title {
    font-size: 22px !important;
    font-weight: 600 !important;
    color: #111827 !important;
    margin: 0 !important;
    line-height: 1.3 !important;
  }
  .ap-header-count {
    font-size: 13px;
    color: #9CA3AF;
    margin-top: 3px;
    display: block;
    font-weight: 400;
  }

  /* Search */
  .ap-search .ant-input-affix-wrapper {
    height: 40px !important;
    border-radius: 10px !important;
    border: 1px solid #E5E7EB !important;
    background: #fff !important;
    box-shadow: none !important;
    width: 280px;
    font-size: 13px !important;
    transition: border-color 0.18s, box-shadow 0.18s;
  }
  .ap-search .ant-input-affix-wrapper:hover,
  .ap-search .ant-input-affix-wrapper-focused {
    border-color: #6366F1 !important;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.1) !important;
  }
  .ap-search .ant-input-prefix { color: #9CA3AF !important; margin-right: 6px; }
  .ap-search .ant-input { font-size: 13px !important; color: #374151 !important; font-family: inherit !important; }
  .ap-search .ant-input::placeholder { color: #D1D5DB !important; }

  /* Card */
  .ap-card {
    background: #fff;
    border: 1px solid #E5E7EB;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    cursor: pointer;
    transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .ap-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 28px rgba(0,0,0,0.09);
    border-color: #C7D2FE;
  }

  /* Image */
  .ap-img-wrap {
    position: relative;
    height: 195px;
    overflow: hidden;
    background: #EEF0F3;
    flex-shrink: 0;
  }
  .ap-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.4s ease;
  }
  .ap-card:hover .ap-img { transform: scale(1.04); }
  .ap-img-gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.35) 100%);
    pointer-events: none;
  }

  .ap-badge-tl { position: absolute; top: 10px; left: 10px; }
  .ap-badge-tr { position: absolute; top: 10px; right: 10px; }
  .ap-badge-bl { position: absolute; bottom: 10px; left: 10px; }

  .ap-tag {
    font-size: 11px !important;
    font-weight: 600 !important;
    border-radius: 6px !important;
    padding: 2px 8px !important;
    border: none !important;
    line-height: 1.6 !important;
    font-family: inherit !important;
  }
  .ap-tag-offplan   { background: rgba(109,40,217,0.82) !important; color: #fff !important; }
  .ap-tag-secondary { background: rgba(37,99,235,0.82)  !important; color: #fff !important; }
  .ap-tag-approved  { background: rgba(5,150,105,0.85)  !important; color: #fff !important; }
  .ap-tag-rejected  { background: rgba(220,38,38,0.85)  !important; color: #fff !important; }
  .ap-tag-pending   { background: rgba(217,119,6,0.88)  !important; color: #fff !important; }
  .ap-tag-active    {
    background: rgba(255,255,255,0.18) !important;
    color: #fff !important;
    border: 1px solid rgba(255,255,255,0.4) !important;
    backdrop-filter: blur(6px);
  }

  .ap-dev-logo {
    position: absolute;
    bottom: -16px;
    right: 14px;
    width: 38px;
    height: 38px;
    background: #fff;
    border-radius: 8px;
    border: 2px solid #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.12);
    overflow: hidden;
  }
  .ap-dev-logo img { width: 100%; height: 100%; object-fit: cover; }

  /* Body */
  .ap-body {
    padding: 18px 16px 16px;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .ap-name {
    font-size: 15px;
    font-weight: 600;
    color: #111827;
    margin: 0 0 5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.4;
  }

  .ap-meta {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12.5px;
    color: #9CA3AF;
    margin-bottom: 13px;
    white-space: nowrap;
    overflow: hidden;
  }
  .ap-meta .anticon { font-size: 11px; flex-shrink: 0; }
  .ap-meta-sep {
    width: 3px;
    height: 3px;
    background: #D1D5DB;
    border-radius: 50%;
    flex-shrink: 0;
  }

  /* Specs */
  .ap-specs {
    display: flex;
    gap: 14px;
    margin-bottom: 14px;
    padding: 9px 12px;
    background: #F9FAFB;
    border-radius: 8px;
    border: 1px solid #F3F4F6;
  }
  .ap-spec {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12.5px;
    color: #6B7280;
    font-weight: 500;
  }
  .ap-spec .anticon { font-size: 12px; color: #9CA3AF; }

  /* Price row */
  .ap-price-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: auto;
    margin-bottom: 14px;
  }
  .ap-price-lbl {
    font-size: 10.5px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #9CA3AF;
    display: block;
    margin-bottom: 3px;
  }
  .ap-price-val {
    font-size: 16px;
    font-weight: 700;
    color: #111827;
    line-height: 1;
  }
  .ap-price-currency {
    font-size: 12px;
    font-weight: 500;
    color: #6366F1;
    margin-right: 2px;
  }
  .ap-booking-lbl {
    font-size: 10.5px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #9CA3AF;
    display: block;
    margin-bottom: 3px;
    text-align: right;
  }
  .ap-booking-val {
    font-size: 15px;
    font-weight: 700;
    color: #6366F1;
    text-align: right;
  }

  .ap-divider {
    height: 1px;
    background: #F3F4F6;
    margin-bottom: 12px;
  }

  /* Buttons */
  .ap-actions { display: flex; gap: 8px; }

  .ap-btn-view {
    flex: 1;
    height: 36px;
    border-radius: 8px;
    border: 1px solid #E5E7EB;
    background: #fff;
    color: #374151;
    font-size: 12.5px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
    font-family: inherit;
  }
  .ap-btn-view:hover {
    background: #EEF2FF;
    border-color: #A5B4FC;
    color: #4F46E5;
  }

  .ap-btn-assign {
    flex: 1;
    height: 36px;
    border-radius: 8px;
    border: none;
    background: #5f109c;
    color: #fff;
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    transition: background 0.15s;
    font-family: inherit;
  }
  .ap-btn-assign:hover { background: #4338CA; }

  .ap-center { display: flex; justify-content: center; padding-top: 100px; }
  .ap-empty  { margin-top: 70px; }
`;

export default function AgencyProjects() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [search, setSearch]         = useState("");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await apiService.get("properties/agency/properties/all");
      const data = response?.data?.data || response?.data || [];
      setProperties(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
      setProperties([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  useEffect(() => {
    if (!search) { setFiltered(properties); return; }
    const q = search.toLowerCase();
    setFiltered(
      properties.filter((p) =>
        p.propertyName?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q) ||
        p.area?.toLowerCase().includes(q) ||
        (p.developer?.name || p.developerName || "").toLowerCase().includes(q)
      )
    );
  }, [search, properties]);

  const getPriceDisplay = (p) => {
    if (p.price_min && p.price_max && p.price_min !== p.price_max)
      return `${p.price_min.toLocaleString()} – ${p.price_max.toLocaleString()}`;
    const val = p.price_min || p.price || 0;
    if (!val) return "On Request";
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000)     return `${(val / 1_000).toFixed(0)}K`;
    return val.toLocaleString();
  };

  const getDeveloper = (p) => p.developer?.name || p.developerName || "Developer";

  const getApprovalTag = (status) => {
    if (status === "approved")
      return <Tag icon={<CheckCircleOutlined />} className="ap-tag ap-tag-approved">Approved</Tag>;
    if (status === "rejected")
      return <Tag icon={<CloseCircleOutlined />} className="ap-tag ap-tag-rejected">Rejected</Tag>;
    return <Tag icon={<ClockCircleOutlined />} className="ap-tag ap-tag-pending">Pending</Tag>;
  };

  return (
    <>
      <style>{styles}</style>
      <div className="ap-root">

        {/* Header */}
        <div className="ap-header">
          <div>
            <Title className="ap-header-title">Properties</Title>
            <span className="ap-header-count">{filtered.length} properties found</span>
          </div>
          <div className="ap-search">
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search by name, city, area…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="ap-center"><Spin size="large" /></div>
        ) : filtered.length === 0 ? (
          <Empty
            description={<span style={{ color: "#9CA3AF", fontSize: 13 }}>No properties found</span>}
            className="ap-empty"
          />
        ) : (
          <Row gutter={[20, 22]}>
            {filtered.map((p) => (
              <Col xs={24} sm={12} md={8} lg={6} key={p._id}>
                <div
                  className="ap-card"
                  onClick={() => navigate(`/dashboard/agency/projects/${p._id}`)}
                  role="button"
                  tabIndex={0}
                >
                  {/* Image */}
                  <div className="ap-img-wrap">
                    <img
                      className="ap-img"
                      src={
                        p?.photos?.architecture?.[0] ||
                        p?.mainLogo ||
                        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80"
                      }
                      alt={p.propertyName}
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80";
                      }}
                    />
                    <div className="ap-img-gradient" />

                    <div className="ap-badge-tl">
                      <Tag
                        icon={p.propertySubType === "off_plan" ? <BuildOutlined /> : <HomeOutlined />}
                        className={`ap-tag ${p.propertySubType === "off_plan" ? "ap-tag-offplan" : "ap-tag-secondary"}`}
                      >
                        {p.propertySubType === "off_plan" ? "Off-Plan" : "Secondary"}
                      </Tag>
                    </div>

                    <div className="ap-badge-tr">{getApprovalTag(p.approvalStatus)}</div>

                    {p.listingStatus === "active" && (
                      <div className="ap-badge-bl">
                        <Tag icon={<ThunderboltOutlined />} className="ap-tag ap-tag-active">
                          Active
                        </Tag>
                      </div>
                    )}

                    {p.developer?.logo && (
                      <div className="ap-dev-logo">
                        <img src={p.developer.logo} alt="dev" />
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="ap-body">
                    <div className="ap-name">{p.propertyName}</div>

                    <div className="ap-meta">
                      <EnvironmentOutlined />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                        {p.area || p.city}
                      </span>
                      <span className="ap-meta-sep" />
                      <BankOutlined />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                        {getDeveloper(p)}
                      </span>
                    </div>

                    {(p.bedrooms > 0 || p.bathrooms > 0 || (p.builtUpArea || p.builtUpArea_min) > 0) && (
                      <div className="ap-specs">
                        {p.bedrooms > 0 && (
                          <span className="ap-spec">
                            <HomeOutlined /> {p.bedrooms} {p.bedrooms === 1 ? "Bed" : "Beds"}
                          </span>
                        )}
                        {p.bathrooms > 0 && (
                          <span className="ap-spec">
                            <ThunderboltOutlined /> {p.bathrooms} Bath
                          </span>
                        )}
                        {(p.builtUpArea || p.builtUpArea_min) > 0 && (
                          <span className="ap-spec">
                            <ColumnWidthOutlined />
                            {(p.builtUpArea || p.builtUpArea_min).toLocaleString()} sqft
                          </span>
                        )}
                      </div>
                    )}

                    <div className="ap-price-row">
                      <div>
                        <span className="ap-price-lbl">Price from</span>
                        <div className="ap-price-val">
                          <span className="ap-price-currency">AED</span>
                          {getPriceDisplay(p)}
                        </div>
                      </div>
                      {p.paymentPlan?.length > 0 && (
                        <div>
                          <span className="ap-booking-lbl">Booking</span>
                          <div className="ap-booking-val">
                            {p.paymentPlan[0]?.stages?.[0]?.percentage}%{" "}
                            <InfoCircleOutlined style={{ fontSize: 11, color: "#C7D2FE" }} />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="ap-divider" />

                    <div
                      className="ap-actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="ap-btn-view"
                        onClick={() => navigate(`/dashboard/agency/projects/${p._id}`)}
                      >
                        <EyeOutlined /> View
                      </button>
                      <button className="ap-btn-assign">
                        <UserAddOutlined /> Assign
                      </button>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </>
  );
}