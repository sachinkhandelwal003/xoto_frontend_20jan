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
  InputNumber,
  Descriptions,
  List,
  Collapse,
  Timeline,
  Tooltip
} from "antd";

import {
  EyeOutlined,
  SearchOutlined,
  EnvironmentOutlined,
  BankOutlined,
  HomeOutlined,
  FilterOutlined,
  ClearOutlined,
  DollarOutlined,
  ApartmentOutlined,
  CalendarOutlined,
  FilePdfOutlined,
  VideoCameraOutlined,
  CarOutlined,
  SwitcherOutlined,
  WifiOutlined,
  HeartOutlined,
  StarOutlined
} from "@ant-design/icons";

import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;

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

  const [viewDrawer, setViewDrawer] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  // ================= FETCH PROPERTIES =================
  const fetchAllProperties = useCallback(async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: pageSize,
      });

      if (searchText) {
        params.append("search", searchText);
      }

      if (activeTab !== "all") {
        params.append("approvalStatus", activeTab);
      }

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
    setSearchText("");
    setCurrentPage(1);
  };

  // ================= CHECK ACTIVE FILTERS =================
  const getActiveFilterCount = () => {
    return Object.values(filters).filter(val => val !== "" && val !== null && val !== "off_plan").length;
  };

  const openViewDrawer = (record) => {
    setSelectedProperty(record);
    setViewDrawer(true);
  };

  // Helper to get all photos as flat array
  const getAllPhotos = (property) => {
    const photos = property.photos || {};
    return [
      ...(photos.architecture || []),
      ...(photos.interior || []),
      ...(photos.lobby || []),
      ...(photos.other || [])
    ];
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
          <Button
            type={filters.propertySubType === "off_plan" ? "primary" : "default"}
            onClick={() => {
              setFilters({ ...filters, propertySubType: "off_plan" });
              setCurrentPage(1);
            }}
            style={{
              background: filters.propertySubType === "off_plan" ? "#5c039b" : "#fafafa",
              borderColor: filters.propertySubType === "off_plan" ? "#5c039b" : "#e5e7eb",
              color: filters.propertySubType === "off_plan" ? "#fff" : "#374151",
              borderRadius: 8,
              padding: "6px 18px",
              fontWeight: 500
            }}
          >
            Off-Plan
          </Button>

          <Button
            type={filters.propertySubType === "secondary" ? "primary" : "default"}
            onClick={() => {
              setFilters({ ...filters, propertySubType: "secondary" });
              setCurrentPage(1);
            }}
            style={{
              background: filters.propertySubType === "secondary" ? "#5c039b" : "#fafafa",
              borderColor: filters.propertySubType === "secondary" ? "#5c039b" : "#e5e7eb",
              color: filters.propertySubType === "secondary" ? "#fff" : "#374151",
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
                    onClick={() => openViewDrawer(item)}
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

      {/* ================= PROPERTY DETAILS DRAWER ================= */}
      <Drawer
        title="Property Details"
        placement="right"
        onClose={() => setViewDrawer(false)}
        open={viewDrawer}
        width={800}
        destroyOnClose
      >
        {selectedProperty && (
          <div>
            {/* Main Image */}
            <div style={{ marginBottom: 24 }}>
              <Image
                src={selectedProperty.mainLogo || getAllPhotos(selectedProperty)[0] || "https://via.placeholder.com/800x400"}
                style={{ width: "100%", maxHeight: 400, objectFit: "cover", borderRadius: 8 }}
                alt={selectedProperty.propertyName}
              />
            </div>

            {/* Basic Info */}
            <Descriptions title="Basic Information" bordered column={{ xs: 1, sm: 2, md: 2 }} size="small">
              <Descriptions.Item label="Property Name">{selectedProperty.propertyName}</Descriptions.Item>
              <Descriptions.Item label="Category">{selectedProperty.propertyCategory || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Developer">
                {selectedProperty.developer?.name || selectedProperty.developerName || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Transaction Type">
                {selectedProperty.transactionType === "sell" ? "Sale" : "Rent"}
              </Descriptions.Item>
              <Descriptions.Item label="Property Sub Type">
                {selectedProperty.propertySubType === "off_plan" ? "Off-Plan" : "Secondary"}
              </Descriptions.Item>
              <Descriptions.Item label="Project Status">
                {selectedProperty.projectStatus || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Approval Status">
                <Tag
                  color={
                    selectedProperty.approvalStatus === "approved"
                      ? "green"
                      : selectedProperty.approvalStatus === "rejected"
                      ? "red"
                      : "orange"
                  }
                >
                  {selectedProperty.approvalStatus?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Listing Status">
                <Tag color={selectedProperty.listingStatus === "active" ? "green" : "red"}>
                  {selectedProperty.listingStatus?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Available">
                {selectedProperty.isAvailable ? "Yes" : "No"}
              </Descriptions.Item>
              <Descriptions.Item label="Featured">
                {selectedProperty.isFeatured ? "Yes" : "No"}
              </Descriptions.Item>
              <Descriptions.Item label="Created At">
                {dayjs(selectedProperty.createdAt).format("DD MMM YYYY, hh:mm A")}
              </Descriptions.Item>
              <Descriptions.Item label="Last Updated">
                {dayjs(selectedProperty.updatedAt).format("DD MMM YYYY, hh:mm A")}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Pricing & Units</Divider>
            <Descriptions bordered column={{ xs: 1, sm: 2, md: 2 }} size="small">
              <Descriptions.Item label="Price Range">
                {selectedProperty.currency} {selectedProperty.price_min?.toLocaleString()} - {selectedProperty.price_max?.toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Bedrooms">{selectedProperty.bedrooms || 0}</Descriptions.Item>
              <Descriptions.Item label="Bathrooms">{selectedProperty.bathrooms || 0}</Descriptions.Item>
              <Descriptions.Item label="Built-Up Area (min/max)">
                {selectedProperty.builtUpArea_min} - {selectedProperty.builtUpArea_max} {selectedProperty.builtUpAreaUnit}
              </Descriptions.Item>
              <Descriptions.Item label="Plot Area">{selectedProperty.plotArea || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Parking Spaces">{selectedProperty.parkingSpaces || 0}</Descriptions.Item>
              <Descriptions.Item label="Furnishing">{selectedProperty.furnishing || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Ownership Type">{selectedProperty.ownershipType || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Total Units">{selectedProperty.totalUnits || 0}</Descriptions.Item>
              <Descriptions.Item label="Sold Units">{selectedProperty.soldUnits || 0}</Descriptions.Item>
              <Descriptions.Item label="Reserved Units">{selectedProperty.reservedUnits || 0}</Descriptions.Item>
              <Descriptions.Item label="Booked Units">{selectedProperty.bookedUnits || 0}</Descriptions.Item>
              {selectedProperty.eoiAmount > 0 && (
                <Descriptions.Item label="EOI Amount">
                  {selectedProperty.currency} {selectedProperty.eoiAmount?.toLocaleString()}
                </Descriptions.Item>
              )}
              {selectedProperty.commission > 0 && (
                <Descriptions.Item label="Commission">
                  {selectedProperty.commission}% {selectedProperty.shareCommission && "(Shared)"}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider orientation="left">Location & Coordinates</Divider>
            <Descriptions bordered column={{ xs: 1, sm: 2, md: 2 }} size="small">
              <Descriptions.Item label="Area">{selectedProperty.area}</Descriptions.Item>
              <Descriptions.Item label="City">{selectedProperty.city}</Descriptions.Item>
              <Descriptions.Item label="Country">{selectedProperty.country}</Descriptions.Item>
              {selectedProperty.googleLocation && (
                <Descriptions.Item label="Google Maps">
                  <a href={selectedProperty.googleLocation} target="_blank" rel="noopener noreferrer">
                    View on Map
                  </a>
                </Descriptions.Item>
              )}
              {selectedProperty.coordinates && (selectedProperty.coordinates.lat || selectedProperty.coordinates.lng) && (
                <Descriptions.Item label="Coordinates">
                  Lat: {selectedProperty.coordinates.lat}, Lng: {selectedProperty.coordinates.lng}
                </Descriptions.Item>
              )}
            </Descriptions>

            {selectedProperty.proximity && Object.values(selectedProperty.proximity).some(v => v) && (
              <>
                <Divider orientation="left">Proximity</Divider>
                <Descriptions bordered column={{ xs: 1, sm: 2, md: 2 }} size="small">
                  {selectedProperty.proximity.airport && (
                    <Descriptions.Item label="Airport">{selectedProperty.proximity.airport}</Descriptions.Item>
                  )}
                  {selectedProperty.proximity.metro && (
                    <Descriptions.Item label="Metro">{selectedProperty.proximity.metro}</Descriptions.Item>
                  )}
                  {selectedProperty.proximity.mall && (
                    <Descriptions.Item label="Mall">{selectedProperty.proximity.mall}</Descriptions.Item>
                  )}
                  {selectedProperty.proximity.school && (
                    <Descriptions.Item label="School">{selectedProperty.proximity.school}</Descriptions.Item>
                  )}
                </Descriptions>
              </>
            )}

            <Divider orientation="left">Description</Divider>
            <Paragraph>{selectedProperty.description || "No description provided."}</Paragraph>

            {selectedProperty.photos && getAllPhotos(selectedProperty).length > 0 && (
              <>
                <Divider orientation="left">Photos</Divider>
                <Image.PreviewGroup>
                  <Row gutter={[12, 12]}>
                    {getAllPhotos(selectedProperty).map((url, idx) => (
                      <Col xs={12} sm={8} md={6} key={idx}>
                        <Image src={url} style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8 }} />
                      </Col>
                    ))}
                  </Row>
                </Image.PreviewGroup>
              </>
            )}

            {selectedProperty.videoUrl && (
              <>
                <Divider orientation="left">Video</Divider>
                <video controls style={{ width: "100%", borderRadius: 8 }} src={selectedProperty.videoUrl} />
              </>
            )}

            {selectedProperty.brochure && (
              <>
                <Divider orientation="left">Brochure</Divider>
                <Button icon={<FilePdfOutlined />} href={selectedProperty.brochure} target="_blank">
                  Download Brochure
                </Button>
              </>
            )}

            {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
              <>
                <Divider orientation="left">Amenities</Divider>
                <List
                  dataSource={selectedProperty.amenities}
                  renderItem={(item) => <Tag color="blue">{item}</Tag>}
                  grid={{ gutter: 16, column: 3 }}
                />
              </>
            )}

            {selectedProperty.facilities && Object.values(selectedProperty.facilities).some(v => v === true) && (
              <>
                <Divider orientation="left">Facilities</Divider>
                <Space wrap>
                  {selectedProperty.facilities.swimmingPool && <Tag color="purple">Swimming Pool</Tag>}
                  {selectedProperty.facilities.gym && <Tag color="purple">Gym</Tag>}
                  {selectedProperty.facilities.parking && <Tag color="purple">Parking</Tag>}
                  {selectedProperty.facilities.childrenPlayArea && <Tag color="purple">Children's Play Area</Tag>}
                  {selectedProperty.facilities.gardens && <Tag color="purple">Gardens</Tag>}
                  {selectedProperty.facilities.security && <Tag color="purple">Security</Tag>}
                  {selectedProperty.facilities.concierge && <Tag color="purple">Concierge</Tag>}
                </Space>
              </>
            )}

            {selectedProperty.paymentPlan && selectedProperty.paymentPlan.length > 0 && (
              <>
                <Divider orientation="left">Payment Plans</Divider>
                <Collapse>
                  {selectedProperty.paymentPlan.map((plan, idx) => (
                    <Panel header={plan.title} key={idx}>
                      <Timeline>
                        {plan.stages.map((stage, sIdx) => (
                          <Timeline.Item key={sIdx}>
                            <strong>{stage.stage}:</strong> {stage.percentage}% - {stage.description}
                          </Timeline.Item>
                        ))}
                      </Timeline>
                    </Panel>
                  ))}
                </Collapse>
              </>
            )}

            {selectedProperty.resaleConditions && (
              <>
                <Divider orientation="left">Resale Conditions</Divider>
                <Paragraph>{selectedProperty.resaleConditions}</Paragraph>
              </>
            )}

            {selectedProperty.approvedBy && (
              <>
                <Divider orientation="left">Approval Details</Divider>
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="Approved By">
                    {selectedProperty.approvedBy.email || "Admin"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Approved At">
                    {dayjs(selectedProperty.approvedAt).format("DD MMM YYYY, hh:mm A")}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}

            {selectedProperty.rejectionReason && (
              <>
                <Divider orientation="left">Rejection Reason</Divider>
                <Paragraph type="danger">{selectedProperty.rejectionReason}</Paragraph>
              </>
            )}
          </div>
        )}
      </Drawer>

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