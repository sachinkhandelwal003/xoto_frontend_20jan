import React, { useState, useEffect, useCallback } from "react";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import {
  Card,
  Typography,
  Row,
  Col,
  Statistic,
  Space,
  message,
  Modal,
  Button,
  Tag,
  Image,
  Divider,
  Input,
  Pagination,
  Select,
  DatePicker,
  Tabs,
  Drawer,
  Badge,
  InputNumber
} from "antd";

import {
  EyeOutlined,
  SearchOutlined,
  EnvironmentOutlined,
  BankOutlined,
  HomeOutlined,
  FilterOutlined,
  ClearOutlined
} from "@ant-design/icons";

import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const AdminPropertyList = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);

  // Search & Filters
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("approved"); // all, pending, approved, rejected

  // Advanced Filters
  const [filterDrawer, setFilterDrawer] = useState(false);
  const [filters, setFilters] = useState({
    propertySubType: "off_plan",
    listingStatus: "",
    unitType: "",
    bedroomType: "",
    bedrooms: "",
    bathrooms: "",
    minPrice: "",
    maxPrice: "",
    minArea: "",
    maxArea: "",
    area: "",
    city: "",
    country: "",
    isAvailable: "",
    isFeatured: "",
    fromDate: null,
    toDate: null
  });

  const [viewModal, setViewModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  // ================= FETCH PROPERTIES =================
  const fetchAllProperties = useCallback(async () => {
    setLoading(true);

    try {
      // Build query params
      const params = new URLSearchParams({
        page: currentPage,
        limit: pageSize,
      });

      // Search
      if (searchText) {
        params.append("search", searchText);
      }

      // Approval Status from tabs
      if (activeTab !== "all") {
        params.append("approvalStatus", activeTab);
      }

      // Advanced Filters
      if (filters.propertySubType) params.append("propertySubType", filters.propertySubType);
      if (filters.listingStatus) params.append("listingStatus", filters.listingStatus);
      if (filters.unitType) params.append("unitType", filters.unitType);
      if (filters.bedroomType) params.append("bedroomType", filters.bedroomType);
      if (filters.bedrooms) params.append("bedrooms", filters.bedrooms);
      if (filters.bathrooms) params.append("bathrooms", filters.bathrooms);
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
      if (filters.minArea) params.append("minArea", filters.minArea);
      if (filters.maxArea) params.append("maxArea", filters.maxArea);
      if (filters.area) params.append("area", filters.area);
      if (filters.city) params.append("city", filters.city);
      if (filters.country) params.append("country", filters.country);
      if (filters.isAvailable) params.append("isAvailable", filters.isAvailable);
      if (filters.isFeatured) params.append("isFeatured", filters.isFeatured);
      if (filters.fromDate) params.append("fromDate", filters.fromDate.format("YYYY-MM-DD"));
      if (filters.toDate) params.append("toDate", filters.toDate.format("YYYY-MM-DD"));

      const res = await apiService.get(
        `/properties/admin/property/all?${params.toString()}&t=${Date.now()}`
      );

      const list = res?.data || [];
      setProperties(Array.isArray(list) ? list : []);
      setTotal(res?.pagination?.totalItems || list.length);
      setStats(res?.stats || null);
    } catch (err) {
      console.log(err);
      message.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchText, activeTab, filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAllProperties();
    }, 400);

    return () => clearTimeout(timer);
  }, [searchText, activeTab, currentPage, filters]);

  // ================= UPDATE STATUS =================
 // NEW
const approveProperty = async (id) => {
  try {
    await apiService.put(`/properties/admin/property/approve/${id}`, {
      remarks: "All documents verified. Property approved."
    });
    message.success("Property approved");
    fetchAllProperties();
  } catch (err) {
    console.log(err);
    message.error("Approval failed");
  }
};

const rejectProperty = async (id, reason) => {
  try {
    await apiService.put(`/properties/admin/property/reject/${id}`, {
      rejectionReason: reason
    });
    message.success("Property rejected");
    fetchAllProperties();
  } catch (err) {
    console.log(err);
    message.error("Rejection failed");
  }
};

  // ================= CLEAR FILTERS =================
  const clearFilters = () => {
    setFilters({
      propertySubType: "",
      listingStatus: "",
      unitType: "",
      bedroomType: "",
      bedrooms: "",
      bathrooms: "",
      minPrice: "",
      maxPrice: "",
      minArea: "",
      maxArea: "",
      area: "",
      city: "",
      country: "",
      isAvailable: "",
      isFeatured: "",
      fromDate: null,
      toDate: null
    });
    setSearchText("");
    setCurrentPage(1);
  };

  // ================= CHECK ACTIVE FILTERS =================
  const getActiveFilterCount = () => {
    return Object.values(filters).filter(val => val !== "" && val !== null).length;
  };

  const openModal = (record) => {
    setSelectedProperty(record);
    setViewModal(true);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24}>
          <Title level={3}>Property Management</Title>
          <Text type="secondary">
            Review and manage all properties
          </Text>
        </Col>
      </Row>

     {/* PROPERTY TYPE SELECTOR */}
<Card
  className="mb-4"
  style={{ borderRadius: 12, border: "1px solid #f0f0f0" }}
>
  <div style={{ display: "flex", gap: 12 }}>
    
    {/* OFF PLAN */}
    <Button
      type={filters.propertySubType === "off_plan" ? "primary" : "default"}
      onClick={() => {
        setFilters({ ...filters, propertySubType: "off_plan" });
        setCurrentPage(1);
      }}
      style={{
        background:
          filters.propertySubType === "off_plan" ? "#5c039b" : "#fafafa",
        borderColor:
          filters.propertySubType === "off_plan" ? "#5c039b" : "#e5e7eb",
        color:
          filters.propertySubType === "off_plan" ? "#fff" : "#374151",
        borderRadius: 8,
        padding: "6px 18px",
        fontWeight: 500
      }}
    >
      Off-Plan
    </Button>

    {/* SECONDARY */}
    <Button
      type={filters.propertySubType === "secondary" ? "primary" : "default"}
      onClick={() => {
        setFilters({ ...filters, propertySubType: "secondary" });
        setCurrentPage(1);
      }}
      style={{
        background:
          filters.propertySubType === "secondary" ? "#5c039b" : "#fafafa",
        borderColor:
          filters.propertySubType === "secondary" ? "#5c039b" : "#e5e7eb",
        color:
          filters.propertySubType === "secondary" ? "#fff" : "#374151",
        borderRadius: 8,
        padding: "6px 18px",
        fontWeight: 500
      }}
    >
      Secondary
    </Button>

  </div>
</Card>

{/* STATUS TABS */}
<Card
  className="mb-4"
  style={{
    borderRadius: 12,
    border: "1px solid #f0f0f0"
  }}
>
  <style>
    {`
      .custom-tabs .ant-tabs-nav {
        margin-bottom: 0;
      }

      .custom-tabs .ant-tabs-tab {
        padding: 6px 20px;
        font-size: 14px;
        font-weight: 500;
        border-radius: 8px;
        transition: all 0.2s ease;
      }

      .custom-tabs .ant-tabs-tab:hover {
        background: #f3f4f6;
      }

      .custom-tabs .ant-tabs-tab-active {
        background: #5c039b !important;
      }

      .custom-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
        color: #fff !important;
      }

      .custom-tabs .ant-tabs-ink-bar {
        display: none;
      }
    `}
  </style>

  <Tabs
    className="custom-tabs"
    activeKey={activeTab}
    onChange={(key) => {
      setActiveTab(key);
      setCurrentPage(1);
    }}
    items={[
      
      {
        key: "approved",
        label: "Approved"
      },
      {
        key: "pending",
        label: "Pending"
      },
      {
        key: "rejected",
        label: "Rejected"
      }
    ]}
  />
</Card>

      {/* SEARCH & FILTER BAR */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={18}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search by property name, area, developer..."
              size="large"
              allowClear
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(1);
              }}
            />
          </Col>

          <Col xs={24} md={6}>
            <Space style={{ width: "100%" }}>
              <Badge count={getActiveFilterCount()}>
                <Button
                  icon={<FilterOutlined />}
                  size="large"
                  onClick={() => setFilterDrawer(true)}
                  block
                >
                  Filters
                </Button>
              </Badge>

              {getActiveFilterCount() > 0 && (
                <Button
                  icon={<ClearOutlined />}
                  size="large"
                  onClick={clearFilters}
                  danger
                >
                  Clear
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* ================= PROPERTY CARDS ================= */}
      <Row gutter={[20, 20]}>
        {properties.map((item) => (
          <Col xs={24} sm={12} md={8} lg={6} key={item._id}>
            <Card
              hoverable
              style={{ borderRadius: 14 }}
              cover={
                <img
                  src={
                    item.mainLogo ||
                    item.photos?.architecture?.[0] ||
                    item.photos?.interior?.[0] ||
                    "https://via.placeholder.com/300x200"
                  }
                  style={{
                    height: 180,
                    objectFit: "cover"
                  }}
                  alt={item.propertyName}
                />
              }
            >
              <Space direction="vertical" style={{ width: "100%" }} size={4}>
                <Title level={5} ellipsis={{ rows: 1 }}>
                  {item.propertyName}
                </Title>

                <Text type="secondary" style={{ fontSize: 12 }}>
                  <BankOutlined /> {item.developer?.name || item.developerName || "No Developer"}
                </Text>

                <Text strong style={{ color: "#7c3aed" }}>
                  {item.currency}{" "}
                  {item.price_min?.toLocaleString()} -{" "}
                  {item.price_max?.toLocaleString()}
                </Text>

                <Text type="secondary" ellipsis style={{ fontSize: 12 }}>
                  <EnvironmentOutlined /> {item.area}, {item.city}
                </Text>

                <div style={{ marginTop: 4 }}>
                  <Tag
                    color={
                      item.approvalStatus === "approved"
                        ? "green"
                        : item.approvalStatus === "rejected"
                        ? "red"
                        : "orange"
                    }
                  >
                    {item.approvalStatus?.toUpperCase()}
                  </Tag>

                  {item.propertySubType && (
                    <Tag color="blue">
                      {item.propertySubType === "off_plan" ? "Off-Plan" : "Secondary"}
                    </Tag>
                  )}
                </div>

                <Divider style={{ margin: "8px 0" }} />

                <Space direction="vertical" style={{ width: "100%" }} size={8}>
                  {item.approvalStatus === "pending" && (
                    <Space style={{ width: "100%" }}>
                      <Button
                        size="small"
                        style={{ background: "#10b981", color: "#fff", flex: 1 }}
                       onClick={() => approveProperty(item._id)}
                        block
                      >
                        Approve
                      </Button>

                      <Button
                        size="small"
                        danger
                        onClick={() => {
                          setSelectedId(item._id);
                          setRejectModal(true);
                        }}
                        block
                      >
                        Reject
                      </Button>
                    </Space>
                  )}

                  <Button
                    icon={<EyeOutlined />}
                    size="small"
                    block
                    onClick={() => openModal(item)}
                  >
                    View Details
                  </Button>
                </Space>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* EMPTY STATE */}
      {properties.length === 0 && !loading && (
        <Card>
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <HomeOutlined style={{ fontSize: 48, color: "#ccc" }} />
            <Title level={4} type="secondary">No properties found</Title>
            <Text type="secondary">Try adjusting your filters</Text>
          </div>
        </Card>
      )}

      {/* PAGINATION */}
      {total > pageSize && (
        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Pagination
            current={currentPage}
            total={total}
            pageSize={pageSize}
            onChange={(p) => setCurrentPage(p)}
            showSizeChanger={false}
            showTotal={(total) => `Total ${total} properties`}
          />
        </div>
      )}

      {/* ================= FILTER DRAWER ================= */}
      <Drawer
        title="Advanced Filters"
        placement="right"
        onClose={() => setFilterDrawer(false)}
        open={filterDrawer}
        width={400}
        extra={
          <Button
            icon={<ClearOutlined />}
            onClick={clearFilters}
            danger
          >
            Clear All
          </Button>
        }
      >
        <Space direction="vertical" style={{ width: "100%" }} size={16}>
          
          {/* Listing Status */}
          <div>
            <Text strong>Listing Status</Text>
            <Select
              placeholder="Select status"
              style={{ width: "100%", marginTop: 8 }}
              allowClear
              value={filters.listingStatus || undefined}
              onChange={(val) => setFilters({ ...filters, listingStatus: val || "" })}
            >
              <Option value="pending">Pending</Option>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="rejected">Rejected</Option>
            </Select>
          </div>

          <Divider />

          {/* Unit Type */}
          <div>
            <Text strong>Unit Type</Text>
            <Select
              placeholder="Select unit type"
              style={{ width: "100%", marginTop: 8 }}
              allowClear
              value={filters.unitType || undefined}
              onChange={(val) => setFilters({ ...filters, unitType: val || "" })}
            >
              <Option value="apartment">Apartment</Option>
              <Option value="villa">Villa</Option>
              <Option value="townhouse">Townhouse</Option>
              <Option value="duplex">Duplex</Option>
              <Option value="penthouse">Penthouse</Option>
            </Select>
          </div>

          {/* Bedroom Type */}
          <div>
            <Text strong>Bedroom Type</Text>
            <Select
              placeholder="Select bedroom type"
              style={{ width: "100%", marginTop: 8 }}
              allowClear
              value={filters.bedroomType || undefined}
              onChange={(val) => setFilters({ ...filters, bedroomType: val || "" })}
            >
              <Option value="studio">Studio</Option>
              <Option value="1bed">1 Bed</Option>
              <Option value="2bed">2 Bed</Option>
              <Option value="3bed">3 Bed</Option>
              <Option value="4bed">4 Bed</Option>
              <Option value="5bed">5 Bed</Option>
              <Option value="6bed">6 Bed</Option>
              <Option value="7bed">7 Bed</Option>
              <Option value="8plus">8+ Bed</Option>
            </Select>
          </div>

          {/* Bedrooms */}
          <div>
            <Text strong>Number of Bedrooms</Text>
            <InputNumber
              placeholder="Bedrooms"
              style={{ width: "100%", marginTop: 8 }}
              min={0}
              value={filters.bedrooms || undefined}
              onChange={(val) => setFilters({ ...filters, bedrooms: val || "" })}
            />
          </div>

          {/* Bathrooms */}
          <div>
            <Text strong>Number of Bathrooms</Text>
            <InputNumber
              placeholder="Bathrooms"
              style={{ width: "100%", marginTop: 8 }}
              min={0}
              value={filters.bathrooms || undefined}
              onChange={(val) => setFilters({ ...filters, bathrooms: val || "" })}
            />
          </div>

          <Divider />

          {/* Price Range */}
          <div>
            <Text strong>Price Range</Text>
            <Row gutter={8} style={{ marginTop: 8 }}>
              <Col span={12}>
                <InputNumber
                  placeholder="Min Price"
                  style={{ width: "100%" }}
                  min={0}
                  value={filters.minPrice || undefined}
                  onChange={(val) => setFilters({ ...filters, minPrice: val || "" })}
                />
              </Col>
              <Col span={12}>
                <InputNumber
                  placeholder="Max Price"
                  style={{ width: "100%" }}
                  min={0}
                  value={filters.maxPrice || undefined}
                  onChange={(val) => setFilters({ ...filters, maxPrice: val || "" })}
                />
              </Col>
            </Row>
          </div>

          {/* Area Range */}
          <div>
            <Text strong>Built-Up Area (sqft)</Text>
            <Row gutter={8} style={{ marginTop: 8 }}>
              <Col span={12}>
                <InputNumber
                  placeholder="Min Area"
                  style={{ width: "100%" }}
                  min={0}
                  value={filters.minArea || undefined}
                  onChange={(val) => setFilters({ ...filters, minArea: val || "" })}
                />
              </Col>
              <Col span={12}>
                <InputNumber
                  placeholder="Max Area"
                  style={{ width: "100%" }}
                  min={0}
                  value={filters.maxArea || undefined}
                  onChange={(val) => setFilters({ ...filters, maxArea: val || "" })}
                />
              </Col>
            </Row>
          </div>

          <Divider />

          {/* Location */}
          <div>
            <Text strong>Area</Text>
            <Input
              placeholder="Enter area"
              style={{ width: "100%", marginTop: 8 }}
              allowClear
              value={filters.area}
              onChange={(e) => setFilters({ ...filters, area: e.target.value })}
            />
          </div>

          <div>
            <Text strong>City</Text>
            <Input
              placeholder="Enter city"
              style={{ width: "100%", marginTop: 8 }}
              allowClear
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            />
          </div>

          <div>
            <Text strong>Country</Text>
            <Input
              placeholder="Enter country"
              style={{ width: "100%", marginTop: 8 }}
              allowClear
              value={filters.country}
              onChange={(e) => setFilters({ ...filters, country: e.target.value })}
            />
          </div>

          <Divider />

          {/* Availability */}
          <div>
            <Text strong>Availability</Text>
            <Select
              placeholder="Select availability"
              style={{ width: "100%", marginTop: 8 }}
              allowClear
              value={filters.isAvailable || undefined}
              onChange={(val) => setFilters({ ...filters, isAvailable: val || "" })}
            >
              <Option value="true">Available</Option>
              <Option value="false">Not Available</Option>
            </Select>
          </div>

          {/* Featured */}
          <div>
            <Text strong>Featured</Text>
            <Select
              placeholder="Select featured"
              style={{ width: "100%", marginTop: 8 }}
              allowClear
              value={filters.isFeatured || undefined}
              onChange={(val) => setFilters({ ...filters, isFeatured: val || "" })}
            >
              <Option value="true">Featured</Option>
              <Option value="false">Not Featured</Option>
            </Select>
          </div>

          <Divider />

          {/* Date Range */}
          <div>
            <Text strong>Created Date Range</Text>
            <RangePicker
              style={{ width: "100%", marginTop: 8 }}
              value={filters.fromDate && filters.toDate ? [filters.fromDate, filters.toDate] : null}
              onChange={(dates) => {
                if (dates) {
                  setFilters({
                    ...filters,
                    fromDate: dates[0],
                    toDate: dates[1]
                  });
                } else {
                  setFilters({
                    ...filters,
                    fromDate: null,
                    toDate: null
                  });
                }
              }}
            />
          </div>

        </Space>

        <Divider />

        <Button
          type="primary"
          block
          size="large"
          onClick={() => {
            setFilterDrawer(false);
            setCurrentPage(1);
          }}
        >
          Apply Filters
        </Button>
      </Drawer>

      {/* ================= VIEW MODAL ================= */}
      <Modal
        title="Property Details"
        open={viewModal}
        onCancel={() => setViewModal(false)}
        footer={null}
        width={900}
      >
        {selectedProperty && (
          <>
            {/* Main Logo */}
            {selectedProperty.mainLogo && (
              <div style={{ marginBottom: 16 }}>
                <Image
                  src={selectedProperty.mainLogo}
                  style={{ width: "100%", maxHeight: 300, objectFit: "cover" }}
                />
              </div>
            )}

            {/* Photos Gallery */}
            <Image.PreviewGroup>
              <Row gutter={[12, 12]}>
                {selectedProperty.photos?.architecture?.map((img, i) => (
                  <Col xs={12} sm={8} md={6} key={`arch-${i}`}>
                    <Image src={img} />
                  </Col>
                ))}
                {selectedProperty.photos?.interior?.map((img, i) => (
                  <Col xs={12} sm={8} md={6} key={`int-${i}`}>
                    <Image src={img} />
                  </Col>
                ))}
                {selectedProperty.photos?.lobby?.map((img, i) => (
                  <Col xs={12} sm={8} md={6} key={`lobby-${i}`}>
                    <Image src={img} />
                  </Col>
                ))}
                {selectedProperty.photos?.other?.map((img, i) => (
                  <Col xs={12} sm={8} md={6} key={`other-${i}`}>
                    <Image src={img} />
                  </Col>
                ))}
              </Row>
            </Image.PreviewGroup>

            <Divider />

            <Title level={4}>{selectedProperty.propertyName}</Title>

            <Space direction="vertical" style={{ width: "100%" }}>
              <Text><strong>Developer:</strong> {selectedProperty.developerName || selectedProperty.developer?.name}</Text>
              
              <Text>
                <strong>Price:</strong> {selectedProperty.currency}{" "}
                {selectedProperty.price_min?.toLocaleString()} - {selectedProperty.price_max?.toLocaleString()}
              </Text>

              <Text>
                <strong>Location:</strong> {selectedProperty.area}, {selectedProperty.city}, {selectedProperty.country}
              </Text>

              <Text>
                <strong>Type:</strong> {selectedProperty.unitType} | {selectedProperty.bedroomType}
              </Text>

              <Text>
                <strong>Area:</strong> {selectedProperty.builtUpArea_min} - {selectedProperty.builtUpArea_max} {selectedProperty.builtUpAreaUnit}
              </Text>

              <Text>
                <strong>Bedrooms:</strong> {selectedProperty.bedrooms} | <strong>Bathrooms:</strong> {selectedProperty.bathrooms}
              </Text>

              {selectedProperty.completionDate?.fullDate && (
                <Text>
                  <strong>Completion:</strong>{" "}
                  {dayjs(selectedProperty.completionDate.fullDate).format("MMM YYYY")}
                </Text>
              )}

              <Paragraph>{selectedProperty.description}</Paragraph>

              {/* Facilities */}
              {selectedProperty.facilities && (
                <>
                  <Divider />
                  <Title level={5}>Facilities</Title>
                  <Space wrap>
                    {selectedProperty.facilities.swimmingPool && <Tag color="blue">Swimming Pool</Tag>}
                    {selectedProperty.facilities.gym && <Tag color="blue">Gym</Tag>}
                    {selectedProperty.facilities.parking && <Tag color="blue">Parking</Tag>}
                    {selectedProperty.facilities.childrenPlayArea && <Tag color="blue">Play Area</Tag>}
                    {selectedProperty.facilities.gardens && <Tag color="blue">Gardens</Tag>}
                    {selectedProperty.facilities.security && <Tag color="blue">Security</Tag>}
                    {selectedProperty.facilities.concierge && <Tag color="blue">Concierge</Tag>}
                  </Space>
                </>
              )}
            </Space>
          </>
        )}
      </Modal>

      {/* ================= REJECT MODAL ================= */}
      <Modal
        title="Reject Property"
        open={rejectModal}
        onCancel={() => {
          setRejectModal(false);
          setRejectReason("");
        }}
       onOk={() => {
  if (!rejectReason.trim()) {
    message.error("Please enter rejection reason");
    return;
  }
  rejectProperty(selectedId, rejectReason);
  setRejectModal(false);
  setRejectReason("");
}}
        okText="Reject"
        okButtonProps={{ danger: true }}
      >
        <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
          Please provide a reason for rejection:
        </Text>
        <Input.TextArea
          rows={4}
          placeholder="Enter rejection reason..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default AdminPropertyList;