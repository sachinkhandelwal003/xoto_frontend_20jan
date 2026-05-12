import {
  Card,
  Typography,
  Row,
  Col,
  Tag,
  Button,
  Spin,
  Descriptions,
  Image,
  Progress,
  Alert,
} from "antd";
import {
  ArrowLeftOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  CalendarOutlined,
  DollarOutlined,
  TeamOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text, Paragraph } = Typography;

const THEME = { primary: "#6d28d9" }; // Purple theme

// ── Status helpers ────────────────────────────────────────────
const APPROVAL_COLOR = {
  pending: "orange",
  approved: "green",
  rejected: "red",
};
const PROJECT_STATUS_LABEL = {
  presale: "Presale",
  under_construction: "Under Construction",
  ready: "Ready",
  completed: "Completed",
};
const PROJECT_STATUS_COLOR = {
  presale: "blue",
  under_construction: "orange",
  ready: "green",
  completed: "green",
};

// ── Facility label map ────────────────────────────────────────
const FACILITY_LABELS = {
  swimmingPool: "Swimming Pool",
  gym: "Gym & Fitness",
  parking: "Parking",
  childrenPlayArea: "Children's Play Area",
  gardens: "Landscaped Gardens",
  security: "24/7 Security",
  concierge: "Concierge Services",
};

export default function DeveloperProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Fetch ─────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const res = await apiService.get(`/properties/${id}`);
        const data = res?.data?.data || res?.data;
        setProject(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <Alert type="error" message="Property not found." showIcon />
        <Button className="mt-4 rounded-lg font-medium" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  // ── Derived values ─────────────────────────────────────────
  const allPhotos = [
    ...(project.photos?.architecture || []),
    ...(project.photos?.interior || []),
    ...(project.photos?.lobby || []),
    ...(project.photos?.other || []),
  ];

  const photoCategoryMap = [
    { label: "Architecture", photos: project.photos?.architecture || [] },
    { label: "Interior", photos: project.photos?.interior || [] },
    { label: "Lobby", photos: project.photos?.lobby || [] },
    { label: "Other", photos: project.photos?.other || [] },
  ].filter(c => c.photos.length > 0);

  const locationStr = [project.area, project.city, project.country]
    .filter(Boolean).join(", ");

  const completionLabel = project.completionDate?.quarter && project.completionDate?.year
    ? `${project.completionDate.quarter} ${project.completionDate.year}`
    : "Not specified";

  const readinessValue = parseInt(project.readinessProgress) || 0;

  // ── Bedroom label ──────────────────────────────────────────
  const bedroomLabel = project.bedroomType
    ? project.bedroomType.replace("bed", " Bedroom").replace("studio", "Studio")
    : project.bedrooms
    ? `${project.bedrooms} Bedroom`
    : "—";

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen max-w-[1600px] mx-auto">

      {/* Back Button */}
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        className="mb-5 rounded-lg font-medium"
      >
        Back to My Properties
      </Button>

      {/* ── HERO CARD ─────────────────────────────────────── */}
      <Card
        className="mb-6 rounded-2xl overflow-hidden shadow-sm border-0"
        bodyStyle={{ padding: 0 }}
      >
        {/* Cover image strip */}
        {allPhotos.length > 0 ? (
          <div className="h-56 md:h-72 w-full relative">
            <img
              src={allPhotos[0]}
              alt="cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Status badges overlaid on image */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Tag
                color={APPROVAL_COLOR[project.approvalStatus]}
                className="font-bold text-xs px-3 py-1 rounded-full border-0 shadow-sm m-0"
              >
                {project.approvalStatus?.toUpperCase()}
              </Tag>
              <Tag
                color={PROJECT_STATUS_COLOR[project.projectStatus] || "default"}
                className="font-bold text-xs px-3 py-1 rounded-full border-0 shadow-sm m-0"
              >
                {PROJECT_STATUS_LABEL[project.projectStatus] || project.projectStatus}
              </Tag>
            </div>
          </div>
        ) : (
          <div className="h-32 w-full bg-gradient-to-r from-purple-100 to-indigo-50" />
        )}

        {/* Title row */}
        <div className="px-6 pb-6 pt-4 relative flex flex-col md:flex-row md:items-start gap-4">
          {project.mainLogo && (
            <img
              src={project.mainLogo}
              alt="logo"
              className="w-20 h-20 rounded-xl object-cover border-4 border-white shadow-md bg-white -mt-12 flex-shrink-0 z-10 relative"
            />
          )}
          <div className="flex-1 mt-2 md:mt-0">
            <Title level={3} className="!mb-1">{project.propertyName || "Untitled Property"}</Title>
            <Text className="text-gray-500 text-sm flex items-center gap-1 mb-3">
              <EnvironmentOutlined />
              {locationStr || "Location not specified"}
            </Text>
            
            <div className="flex flex-wrap gap-2">
              <Tag color="purple" className="rounded-md px-2 py-0.5 m-0">{project.unitType?.replace("_", " ")}</Tag>
              <Tag color="blue" className="rounded-md px-2 py-0.5 m-0">{bedroomLabel}</Tag>
              {project.furnishing && (
                <Tag className="rounded-md px-2 py-0.5 m-0">{project.furnishing.charAt(0).toUpperCase() + project.furnishing.slice(1)}</Tag>
              )}
              {project.ownershipType && (
                <Tag color="geekblue" className="rounded-md px-2 py-0.5 m-0">{project.ownershipType}</Tag>
              )}
              {project.hasView && project.viewType?.length > 0 && (
                project.viewType.map(v => (
                  <Tag key={v} color="cyan" className="rounded-md px-2 py-0.5 m-0">{v.charAt(0).toUpperCase() + v.slice(1)} View</Tag>
                ))
              )}
            </div>
          </div>

          {/* Price block */}
          <div className="md:text-right mt-4 md:mt-0 bg-gray-50 p-4 rounded-xl border border-gray-100 shrink-0 min-w-[200px]">
            <Text className="text-gray-500 text-xs uppercase font-semibold tracking-wider">Price Range</Text>
            <div className="my-1">
              <span className="text-xl font-bold" style={{ color: THEME.primary }}>
                {project.currency} {Number(project.price_min || 0).toLocaleString()}
              </span>
              <span className="text-gray-400 mx-2">–</span>
              <span className="text-xl font-bold" style={{ color: THEME.primary }}>
                {Number(project.price_max || 0).toLocaleString()}
              </span>
            </div>
            <Text className="text-gray-500 text-sm">
              {Number(project.builtUpArea_min || 0).toLocaleString()} –{" "}
              {Number(project.builtUpArea_max || 0).toLocaleString()} {project.builtUpAreaUnit}
            </Text>
          </div>
        </div>

        {/* Rejection reason */}
        {project.approvalStatus === "rejected" && project.rejectionReason && (
          <div className="px-6 pb-6">
            <Alert
              type="error"
              showIcon
              message={<span className="font-semibold">Rejection Reason</span>}
              description={project.rejectionReason}
              className="rounded-lg"
            />
          </div>
        )}
      </Card>

      {/* ── QUICK STATS ROW ───────────────────────────────── */}
      <Row gutter={[16, 16]} className="mb-6">
        {[
          { icon: <HomeOutlined className="text-[#6d28d9] text-xl" />, label: "Total Units", value: project.totalUnits || "—" },
          { icon: <TeamOutlined className="text-[#0ea5e9] text-xl" />, label: "Bedrooms", value: project.bedrooms || "—" },
          { icon: <CalendarOutlined className="text-[#f59e0b] text-xl" />, label: "Completion", value: completionLabel },
          { icon: <DollarOutlined className="text-[#10b981] text-xl" />, label: "Floors", value: project.floors || "—" },
          { icon: <HomeOutlined className="text-[#8b5cf6] text-xl" />, label: "Parking Spaces", value: project.parkingSpaces ?? "—" },
        ].map(({ icon, label, value }) => (
          <Col xs={12} sm={8} md={4} key={label} className="flex-1">
            <Card
              className="shadow-sm border border-gray-100 rounded-2xl text-center transition-all hover:-translate-y-1 hover:shadow-md cursor-default h-full"
              bodyStyle={{ padding: "16px 12px" }}
            >
              <div className="mb-2 bg-gray-50 inline-flex p-3 rounded-full">{icon}</div>
              <div className="text-lg font-bold text-gray-800 leading-tight">{value}</div>
              <div className="text-xs text-gray-400 font-medium mt-1">{label}</div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ── FULL WIDTH MAIN CONTENT ─────────────────────── */}
      <div className="space-y-6 mb-6">
        
        {/* Photos by category */}
        {photoCategoryMap.length > 0 && (
          <Card
            title={<span className="text-lg font-bold">Property Photos</span>}
            className="shadow-sm rounded-2xl border border-gray-100"
          >
            {photoCategoryMap.map(cat => (
              <div key={cat.label} className="mb-6 last:mb-0">
                <Text className="block mb-3 text-xs text-gray-400 uppercase tracking-widest font-bold">
                  {cat.label}
                </Text>
                <Image.PreviewGroup>
                  <div className="flex gap-3 flex-wrap">
                    {cat.photos.map((url, i) => (
                      <div key={i} className="rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                        <Image
                          width={160}
                          height={110}
                          className="object-cover hover:scale-105 transition-transform duration-300"
                          src={url}
                        />
                      </div>
                    ))}
                  </div>
                </Image.PreviewGroup>
              </div>
            ))}
          </Card>
        )}

        {/* ── PROPERTY DETAILS (FULL WIDTH) ── */}
        <Card
          title={<span className="text-lg font-bold">Property Details</span>}
          className="shadow-sm rounded-2xl border border-gray-100 overflow-hidden"
          bodyStyle={{ padding: 0 }} 
        >
          <div className="overflow-x-auto p-1">
            <Descriptions 
              bordered 
              column={{ xs: 1, sm: 2, md: 3, lg: 4 }} // Ab 4 columns me perfectly spread ho jayega
              size="middle"
              className="min-w-[700px] w-full" 
              labelStyle={{ 
                backgroundColor: '#f8fafc', 
                color: '#64748b',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                width: 'auto',
                minWidth: '130px'
              }}
              contentStyle={{ 
                color: '#1e293b',
                fontWeight: 500,
                minWidth: '130px' 
              }}
            >
              <Descriptions.Item label="Property Name">
                {project.propertyName || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Developer Name">
                {project.developerName || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Unit Type">
                <Tag color="purple" className="m-0 bg-purple-50 text-purple-700 border-purple-200">
                  {project.unitType?.charAt(0).toUpperCase() + project.unitType?.slice(1)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Bedroom Type">
                {bedroomLabel}
              </Descriptions.Item>
              
              <Descriptions.Item label="Bathrooms">
                {project.bathrooms ?? "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Total Units">
                {project.totalUnits || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Floors">
                {project.floors || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Parking Spaces">
                {project.parkingSpaces ?? "—"}
              </Descriptions.Item>

              <Descriptions.Item label="Built-Up Area">
                {project.builtUpArea_min?.toLocaleString()} – {project.builtUpArea_max?.toLocaleString()} {project.builtUpAreaUnit}
              </Descriptions.Item>
              <Descriptions.Item label="Price Range">
                <Text strong style={{ color: THEME.primary }}>
                  {project.currency} {project.price_min?.toLocaleString()} – {project.price_max?.toLocaleString()}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ownership Type">
                {project.ownershipType || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Furnishing">
                {project.furnishing ? project.furnishing.charAt(0).toUpperCase() + project.furnishing.slice(1) : "—"}
              </Descriptions.Item>
              
              <Descriptions.Item label="Project Status">
                <Tag color={PROJECT_STATUS_COLOR[project.projectStatus] || "default"} className="m-0">
                  {PROJECT_STATUS_LABEL[project.projectStatus] || project.projectStatus}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Completion Date">
                {completionLabel}
              </Descriptions.Item>
              <Descriptions.Item label="Transaction Type">
                {project.transactionType || "—"}
              </Descriptions.Item>
              
              {project.hasView && (
                <Descriptions.Item label="View Type">
                  <div className="flex gap-2 flex-wrap">
                    {project.viewType?.map(v => (
                      <Tag key={v} color="cyan" className="m-0">{v}</Tag>
                    ))}
                  </div>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        </Card>

        {/* Description */}
        <Card
          title={<span className="text-lg font-bold">Description</span>}
          className="shadow-sm rounded-2xl border border-gray-100"
        >
          <Paragraph className="text-gray-600 leading-relaxed text-sm m-0 whitespace-pre-line">
            {project.description || "No description provided."}
          </Paragraph>
        </Card>

        {/* Proximity */}
        {Object.values(project.proximity || {}).some(Boolean) && (
          <Card
            title={<span className="text-lg font-bold">Proximity</span>}
            className="shadow-sm rounded-2xl border border-gray-100"
          >
            <Row gutter={[16, 16]}>
              {Object.entries(project.proximity).map(([key, val]) =>
                val ? (
                  <Col xs={12} sm={8} md={4} key={key}>
                    <div className="text-center p-4 bg-indigo-50 rounded-xl border border-indigo-100 h-full flex flex-col justify-center">
                      <div className="text-xl font-extrabold" style={{ color: THEME.primary }}>{val} min</div>
                      <div className="text-xs text-gray-500 mt-1 capitalize font-medium">{key}</div>
                    </div>
                  </Col>
                ) : null
              )}
            </Row>
          </Card>
        )}

        {/* Payment Plan */}
        {project.paymentPlan?.length > 0 && (
          <Card
            title={<span className="text-lg font-bold">Payment Plan</span>}
            className="shadow-sm rounded-2xl border border-gray-100"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {project.paymentPlan.map((plan, i) => (
                <div key={plan._id || i} className="p-5 bg-purple-50 rounded-xl border border-purple-100">
                  <Text strong className="text-purple-700 text-[15px] block mb-3 border-b border-purple-200 pb-2">
                    {plan.title || `Plan ${i + 1}`}
                  </Text>
                  {plan.stages?.length > 0 ? (
                    <div className="space-y-3">
                      {plan.stages.map((stage, j) => (
                        <div key={j} className="flex justify-between items-center text-sm">
                          <Text className="text-gray-600">{stage.label || stage.name}</Text>
                          <Text strong className="text-gray-800">{stage.percentage ?? stage.value}%</Text>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Text type="secondary" className="text-sm">No stages defined yet.</Text>
                  )}
                </div>
              ))}
            </div>

            {project.eoiAmount > 0 && (
              <div className="mt-5 p-4 bg-green-50 rounded-xl border border-green-200 flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <Text strong className="text-green-700 text-base">EOI Amount</Text>
                  <Text type="secondary" className="text-xs block mt-1">Expression of Interest — refundable token amount</Text>
                </div>
                <Text strong className="text-green-700 text-xl mt-2 md:mt-0">
                  {project.currency} {Number(project.eoiAmount).toLocaleString()}
                </Text>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* ── BOTTOM CARDS GRID (Properly Arranged) ── */}
      <Title level={4} className="!mb-4 !mt-8 text-gray-700">Project Status & Details</Title>
      
      <Row gutter={[24, 24]}>
        
        {/* ROW 1: Status, Progress, Inventory */}
        <Col xs={24} md={12} lg={8}>
          <Card title={<span className="text-base font-bold">Listing Status</span>} className="shadow-sm rounded-2xl border border-gray-100 h-full">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Text className="text-gray-500 font-medium text-sm">Approval</Text>
                <Tag color={APPROVAL_COLOR[project.approvalStatus]} className="m-0 font-semibold rounded-md">
                  {project.approvalStatus?.toUpperCase()}
                </Tag>
              </div>
              <div className="flex justify-between items-center">
                <Text className="text-gray-500 font-medium text-sm">Listing</Text>
                <Tag className="m-0 rounded-md bg-gray-100 border-gray-200 text-gray-700">{project.listingStatus?.toUpperCase()}</Tag>
              </div>
              <div className="flex justify-between items-center">
                <Text className="text-gray-500 font-medium text-sm">Available</Text>
                <Tag color={project.isAvailable ? "green" : "red"} className="m-0 rounded-md font-medium">
                  {project.isAvailable ? "Yes" : "No"}
                </Tag>
              </div>
              <div className="flex justify-between items-center">
                <Text className="text-gray-500 font-medium text-sm">Featured</Text>
                <Tag color={project.isFeatured ? "gold" : "default"} className="m-0 rounded-md font-medium">
                  {project.isFeatured ? "Featured" : "Standard"}
                </Tag>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12} lg={8}>
          <Card title={<span className="text-base font-bold">Construction Progress</span>} className="shadow-sm rounded-2xl border border-gray-100 h-full">
            <Progress
              percent={readinessValue}
              strokeColor={THEME.primary}
              trailColor="#f3f4f6"
              size={["100%", 14]}
              format={p => <span className="font-bold text-gray-700">{p}%</span>}
            />
            {project.serviceChargeInfo && (
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                <Text className="text-gray-500 text-sm font-medium">Service Charge</Text>
                <Text className="text-gray-800 text-sm font-semibold bg-gray-50 px-3 py-1 rounded-md">{project.serviceChargeInfo}</Text>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} md={12} lg={8}>
          <Card title={<span className="text-base font-bold text-white">Inventory Summary</span>} className="shadow-sm rounded-2xl border-0 bg-gray-900 h-full">
            <Row gutter={[12, 12]}>
              {[
                { label: "Total", value: project.totalInventory || 0, color: "text-white", bg: "bg-white/10" },
                { label: "Sold", value: project.soldUnits || 0, color: "text-red-400", bg: "bg-red-400/10" },
                { label: "Reserved", value: project.reservedUnits || 0, color: "text-amber-400", bg: "bg-amber-400/10" },
                { label: "Booked", value: project.bookedUnits || 0, color: "text-blue-400", bg: "bg-blue-400/10" },
              ].map(({ label, value, color, bg }) => (
                <Col xs={12} key={label}>
                  <div className={`text-center p-3 rounded-xl border border-white/5 ${bg}`}>
                    <div className={`text-2xl font-black ${color}`}>{value}</div>
                    <div className="text-xs font-semibold text-gray-400 mt-1 uppercase tracking-wider">{label}</div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* ROW 2: Facilities and Commission */}
        <Col xs={24} lg={12}>
          <Card title={<span className="text-base font-bold">Facilities & Amenities</span>} className="shadow-sm rounded-2xl border border-gray-100 h-full">
            {Object.entries(project.facilities || {}).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(project.facilities).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <Text className="text-sm text-gray-700 font-medium">{FACILITY_LABELS[key] || key}</Text>
                    {val
                      ? <CheckCircleFilled className="text-green-500 text-lg" />
                      : <CloseCircleFilled className="text-gray-300 text-lg" />
                    }
                  </div>
                ))}
              </div>
            ) : (
              <Text type="secondary" className="italic">No facilities listed</Text>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card className="shadow-sm rounded-2xl border border-gray-100 h-full flex flex-col" bodyStyle={{ padding: 0, display: 'flex', flex: 1, flexDirection: 'column' }}>
            <div className="p-6 border-b border-gray-100 flex-1">
              <Title level={5} className="!mb-5 !text-base !font-bold">Commission</Title>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Text className="text-gray-500 text-sm font-medium">Share Commission</Text>
                  <Tag color={project.shareCommission ? "green" : "default"} className="m-0 px-3 py-1 rounded-md text-sm">
                    {project.shareCommission ? "Yes" : "No"}
                  </Tag>
                </div>
                {project.shareCommission && (
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
                    <Text className="text-purple-800 text-sm font-semibold">Commission Percentage</Text>
                    <Text strong className="text-xl text-purple-700">{project.shareCommissionPercentage || project.commission || 0}%</Text>
                  </div>
                )}
              </div>
            </div>

            {project.resaleConditions && project.resaleConditions !== "Not specified" && (
              <div className="p-6 bg-orange-50/50 rounded-b-2xl">
                <Title level={5} className="!mb-2 !text-sm !text-orange-800 !font-bold">Resale Conditions</Title>
                <Text className="text-sm text-gray-600 leading-relaxed">{project.resaleConditions}</Text>
              </div>
            )}
          </Card>
        </Col>

      </Row>
    </div>
  );
}