import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Form,
  Input,
  Button,
  Row,
  Col,
  Select,
  InputNumber,
  Upload,
  Switch,
  Alert,
  Divider,
  Checkbox,
  DatePicker,
} from "antd";
import { PlusOutlined, ArrowLeftOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import { showToast } from "../../../manageApi/utils/toast";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const THEME = { primary: "#6d28d9" };
const UPLOAD_API = "https://xoto.ae/api/upload";

// Helper: extract image URL from upload response
const extractPhotoUrl = (fileItem) => {
  const r = fileItem.response;
  if (!r) return null;
  return (
    r.url ||
    r.imageUrl ||
    r.image_url ||
    r.secure_url ||
    r.link ||
    r.path ||
    r.filePath ||
    r.fileUrl ||
    r.data?.url ||
    r.data?.imageUrl ||
    r.data?.secure_url ||
    r.data?.path ||
    r.data?.link ||
    r.file?.url ||
    r.file?.imageUrl ||
    r.file?.image_url ||
    r.file?.secure_url ||
    r.file?.path ||
    r.file?.filePath ||
    r.file?.fileUrl ||
    r.file?.link ||
    r.file?.location ||
    r.file?.key ||
    r.file?.filename ||
    r.file?.name ||
    r.result?.url ||
    r.result?.secure_url ||
    null
  );
};

// Custom upload request (same as before)
const customUploadRequest = async ({ file, onSuccess, onError }) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(UPLOAD_API, { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok || data.success === false)
      throw new Error(data.message || "Upload failed");

    onSuccess(data, file);
  } catch (err) {
    console.error("Upload error:", err);
    onError(err);
  }
};

export default function DeveloperAddProperty() {
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const developerId = user?.id || user?._id || null;

  const [form] = Form.useForm();
  const hasView = Form.useWatch("hasView", form);
  const [formLoading, setFormLoading] = useState(false);

  // File lists for different media types
  const [mainLogoFileList, setMainLogoFileList] = useState([]);
  const [photosArchitecture, setPhotosArchitecture] = useState([]);
  const [photosInterior, setPhotosInterior] = useState([]);
  const [photosLobby, setPhotosLobby] = useState([]);
  const [photosOther, setPhotosOther] = useState([]);
  const [brochureFileList, setBrochureFileList] = useState([]);

  const [photoError, setPhotoError] = useState("");

  useEffect(() => {
    if (!developerId) {
      showToast("error", "Developer not found. Please log in again.");
      navigate("/dashboard/developer");
    }
  }, [developerId, navigate]);

  // Common validation for image size
  const validateImageSize = (file) => {
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) showToast("error", "Image must be smaller than 2MB!");
    return isLt2M || Upload.LIST_IGNORE;
  };

  // Helper to check if any upload is still in progress
  const isAnyUploading = () => {
    const lists = [
      mainLogoFileList,
      photosArchitecture,
      photosInterior,
      photosLobby,
      photosOther,
      brochureFileList,
    ];
    return lists.some((list) => list.some((f) => f.status === "uploading"));
  };

  // Helper to collect uploaded URLs from a file list
  const collectUrls = (fileList) => {
    return fileList
      .filter((f) => f.status === "done")
      .map((f) => extractPhotoUrl(f))
      .filter(Boolean);
  };

  // Handle form submission
  const handleSave = async (values) => {
    // Wait for all uploads to finish
    if (isAnyUploading()) {
      showToast("error", "Please wait for all photos to finish uploading.");
      return;
    }

    // Check for failed uploads
    const allLists = [
      mainLogoFileList,
      photosArchitecture,
      photosInterior,
      photosLobby,
      photosOther,
      brochureFileList,
    ];
    const failed = allLists.some((list) => list.some((f) => f.status === "error"));
    if (failed) {
      setPhotoError("Some media failed to upload. Please remove and re-upload them.");
      return;
    }

    // Ensure main logo is uploaded
    const mainLogoUrls = collectUrls(mainLogoFileList);
    if (mainLogoUrls.length === 0) {
      setPhotoError("Please upload a main logo image.");
      return;
    }

    // Build photos object
    const photos = {
      architecture: collectUrls(photosArchitecture),
      interior: collectUrls(photosInterior),
      lobby: collectUrls(photosLobby),
      other: collectUrls(photosOther),
    };

    // Handle brochure (optional)
    let brochureUrl = "";
    if (brochureFileList.length > 0 && brochureFileList[0].status === "done") {
      brochureUrl = extractPhotoUrl(brochureFileList[0]) || "";
    }

    // Build the full payload according to schema
    const payload = {
      // Creator info
      developer: developerId,
      agent: null,
      agency: null,

      // Property type
      propertySubType: "off_plan",
      transactionType: "sell",
      projectOption: values.projectType, // "new" or "existing"

      // Project info
      propertyName: values.propertyName,
      developerName: values.developerName,

      // Unit details (off-plan may omit unitNumber/floorNumber)
      unitNumber: values.unitNumber || "",
      floorNumber: values.floorNumber || 0,
      unitType: values.unitType,
      bedroomType: values.bedroomType,
      bedrooms: values.bedrooms,
      bathrooms: values.bathrooms,

      // Dimensions
      builtUpArea_min: values.builtUpArea_min,
      builtUpArea_max: values.builtUpArea_max,
      builtUpAreaUnit: values.builtUpAreaUnit,

      // Price
      price_min: values.price_min,
      price_max: values.price_max,
      currency: values.currency || "AED",

      // Location
      area: values.area,
      city: values.city,
      country: values.country,
      coordinates: {
        lat: values.latitude,
        lng: values.longitude,
      },
      proximity: {
        airport: values.airportProximity,
        metro: values.metroProximity,
        mall: values.mallProximity,
        school: values.schoolProximity,
      },

      // Media
      mainLogo: mainLogoUrls[0],
      photos,
      videoUrl: values.videoUrl || "",
      brochure: brochureUrl,

      // Description
      description: values.description,

      // Amenities & Facilities
      amenities: values.amenities || [],
      facilities: {
        swimmingPool: values.swimmingPool || false,
        gym: values.gym || false,
        parking: values.parking || false,
        childrenPlayArea: values.childrenPlayArea || false,
        gardens: values.gardens || false,
        security: values.security || false,
        concierge: values.concierge || false,
      },

      // Additional features
      hasView: values.hasView || false,
      viewType: values.viewType || [],
      parkingSpaces: values.parkingSpaces || 0,
      furnishing: values.furnishing,
      ownershipType: values.ownershipType,
      availableFrom: values.availableFrom ? values.availableFrom.format("YYYY-MM-DD") : null,

      // Off-plan specific
      totalUnits: values.totalUnits,
      completionDate: {
        quarter: values.completionQuarter,
        year: values.completionYear,
        fullDate: values.completionFullDate ? values.completionFullDate.format("YYYY-MM-DD") : null,
      },
      projectStatus: values.projectStatus,
      floors: values.floors,
      serviceChargeInfo: values.serviceChargeInfo,
      readinessProgress: values.readinessProgress,
      paymentPlan: values.paymentPlan || [],
      eoiAmount: values.eoiAmount,
      resaleConditions: values.resaleConditions,

      // Commission
      commission: values.commission || 0,
      shareCommission: values.shareCommission || false,
      shareCommissionPercentage: values.shareCommissionPercentage || 0,

      // Status
      isFeatured: values.isFeatured || false,
      showContactOnlyVerified: values.showContactOnlyVerified || false,
    };

    // Remove empty optional fields
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined || payload[key] === null) delete payload[key];
    });

    // Clear any previous error
    setPhotoError("");

    try {
      setFormLoading(true);
      // Update this endpoint to match your backend route
      const res = await apiService.post("/properties/developer/property/create-offplan", payload);
      if (res) {
        showToast("success", "Property submitted. Waiting for admin approval.");
        navigate("/dashboard/developer/developer-projects");
      } else {
        showToast("error", "Failed to save property.");
      }
    } catch (error) {
      console.error("Save error:", error);
      const backendMsg = error?.response?.data?.message || "Something went wrong.";
      showToast("error", backendMsg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleFinishFailed = ({ errorFields }) => {
    showToast(
      "error",
      errorFields?.[0]?.errors?.[0] || "Please fill in all required fields."
    );
  };

  // Helper for dynamic payment plan fields
  const renderPaymentPlanFields = () => (
    <Form.List name="paymentPlan">
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name, ...restField }) => (
            <Card key={key} style={{ marginBottom: 16 }}>
              <Row gutter={16} align="middle">
                <Col span={20}>
                  <Form.Item
                    {...restField}
                    name={[name, "title"]}
                    label="Plan Title"
                    rules={[{ required: true, message: "Title is required" }]}
                  >
                    <Input placeholder="e.g., Standard Payment Plan" />
                  </Form.Item>
                </Col>
                <Col span={4} style={{ textAlign: "right" }}>
                  <Button
                    type="text"
                    danger
                    icon={<MinusCircleOutlined />}
                    onClick={() => remove(name)}
                  />
                </Col>
              </Row>
              <Form.List name={[name, "stages"]}>
                {(stageFields, { add: addStage, remove: removeStage }) => (
                  <>
                    {stageFields.map(({ key: stageKey, name: stageName, ...stageRest }) => (
                      <Row key={stageKey} gutter={16} align="middle">
                        <Col span={6}>
                          <Form.Item
                            {...stageRest}
                            name={[stageName, "stage"]}
                            label="Stage"
                            rules={[{ required: true, message: "Stage name required" }]}
                          >
                            <Select placeholder="Select stage">
                              <Option value="on_booking">On Booking</Option>
                              <Option value="during_construction">During Construction</Option>
                              <Option value="upon_handover">Upon Handover</Option>
                              <Option value="other">Other</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            {...stageRest}
                            name={[stageName, "percentage"]}
                            label="Percentage"
                            rules={[{ required: true, message: "Percentage required" }]}
                          >
                            <InputNumber min={0} max={100} style={{ width: "100%" }} />
                          </Form.Item>
                        </Col>
                        <Col span={10}>
                          <Form.Item
                            {...stageRest}
                            name={[stageName, "description"]}
                            label="Description"
                          >
                            <Input placeholder="Optional description" />
                          </Form.Item>
                        </Col>
                        <Col span={2}>
                          <Button
                            type="text"
                            danger
                            icon={<MinusCircleOutlined />}
                            onClick={() => removeStage(stageName)}
                          />
                        </Col>
                      </Row>
                    ))}
                    <Button type="dashed" onClick={() => addStage()} block icon={<PlusOutlined />}>
                      Add Stage
                    </Button>
                  </>
                )}
              </Form.List>
            </Card>
          ))}
          <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
            Add Payment Plan
          </Button>
        </>
      )}
    </Form.List>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Row justify="space-between" align="middle" className="mb-6">
        <Col>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/dashboard/developer/developer-projects")}
            style={{ marginRight: 16 }}
          >
            Back
          </Button>
          <Title level={3} style={{ display: "inline-block", margin: 0 }}>
            Add New Off‑Plan Property
          </Title>
        </Col>
      </Row>

      <Card className="shadow-sm rounded-xl">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          onFinishFailed={handleFinishFailed}
          initialValues={{
            currency: "AED",
            builtUpAreaUnit: "sqft",
            unitType: "apartment",
            bedroomType: "1bed",
            bedrooms: 1,
            bathrooms: 1,
            furnishing: "unfurnished",
            ownershipType: "freehold",
            projectStatus: "presale",
            readinessProgress: "0%",
            hasView: false,
            viewType: [],
            isFeatured: false,
            showContactOnlyVerified: false,
            shareCommission: false,
            shareCommissionPercentage: 0,
          }}
        >
          {/* Basic Information */}
          <Divider orientation="left" style={{ borderColor: THEME.primary }}>
            Basic Information
          </Divider>
          <Row gutter={16}>
            <Col xs={12} md={6}>
              <Form.Item
                name="projectType"
                label="Project Type"
                rules={[{ required: true, message: "Select project type" }]}
              >
                <Select>
                  <Option value="new">New</Option>
                  <Option value="existing">Existing</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={18}>
              <Form.Item
                name="propertyName"
                label="Property Name"
                rules={[{ required: true, message: "Enter property name" }]}
              >
                <Input placeholder="e.g., Luxury Tower Downtown" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            
          </Row>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Description is required" }]}
          >
            <TextArea rows={4} placeholder="Describe the property..." />
          </Form.Item>

          {/* Property Details */}
          <Divider orientation="left" style={{ borderColor: THEME.primary }}>
            Property Details
          </Divider>
          <Row gutter={16}>
            <Col xs={12} md={6}>
              <Form.Item name="unitNumber" label="Unit Number">
                <Input placeholder="Optional" />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="floorNumber" label="Floor Number">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="unitType" label="Unit Type">
                <Select>
                  <Option value="apartment">Apartment</Option>
                  <Option value="villa">Villa</Option>
                  <Option value="townhouse">Townhouse</Option>
                  <Option value="duplex">Duplex</Option>
                  <Option value="penthouse">Penthouse</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item
                name="bedroomType"
                label="Bedroom Type"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="studio">Studio</Option>
                  <Option value="1bed">1 Bedroom</Option>
                  <Option value="2bed">2 Bedrooms</Option>
                  <Option value="3bed">3 Bedrooms</Option>
                  <Option value="4bed">4 Bedrooms</Option>
                  <Option value="5bed">5 Bedrooms</Option>
                  <Option value="6bed">6 Bedrooms</Option>
                  <Option value="7bed">7 Bedrooms</Option>
                  <Option value="8plus">8+ Bedrooms</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="bedrooms" label="Bedrooms Count">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="bathrooms" label="Bathrooms Count">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={12} md={6}>
              <Form.Item
                name="builtUpArea_min"
                label="Min Built-up Area"
                rules={[{ required: true }]}
              >
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item
                name="builtUpArea_max"
                label="Max Built-up Area"
                rules={[{ required: true }]}
              >
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="builtUpAreaUnit" label="Area Unit">
                <Select>
                  <Option value="sqft">sqft</Option>
                  <Option value="sqm">sqm</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={12} md={6}>
              <Form.Item
                name="price_min"
                label="Min Price"
                rules={[{ required: true }]}
              >
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item
                name="price_max"
                label="Max Price"
                rules={[{ required: true }]}
              >
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="currency" label="Currency">
                <Select>
                  <Option value="AED">AED</Option>
                  <Option value="USD">USD</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Location & Proximity */}
          <Divider orientation="left" style={{ borderColor: THEME.primary }}>
            Location & Proximity
          </Divider>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="area"
                label="Area"
                rules={[{ required: true, message: "Enter area name" }]}
              >
                <Input placeholder="e.g., Downtown Dubai" />
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="city" label="City" rules={[{ required: true }]}>
                <Input placeholder="Dubai" />
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="country" label="Country" rules={[{ required: true }]}>
                <Input placeholder="UAE" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={12} md={6}>
              <Form.Item name="latitude" label="Latitude">
                <InputNumber step={0.000001} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="longitude" label="Longitude">
                <InputNumber step={0.000001} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={12} md={6}>
              <Form.Item name="airportProximity" label="Distance to Airport">
                <Input placeholder="e.g., 15 minutes" />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="metroProximity" label="Distance to Metro">
                <Input placeholder="e.g., 2 minutes walk" />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="mallProximity" label="Distance to Mall">
                <Input placeholder="e.g., 5 minutes" />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="schoolProximity" label="Distance to School">
                <Input placeholder="e.g., 10 minutes" />
              </Form.Item>
            </Col>
          </Row>

          {/* Media */}
          <Divider orientation="left" style={{ borderColor: THEME.primary }}>
            Media
          </Divider>
          <Form.Item label="Main Logo" required>
            <Upload
              listType="picture-card"
              fileList={mainLogoFileList}
              customRequest={customUploadRequest}
              beforeUpload={validateImageSize}
              accept="image/*"
              onChange={({ fileList }) => setMainLogoFileList(fileList)}
              maxCount={1}
            >
              {mainLogoFileList.length === 0 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload Logo</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          <Form.Item label="Architecture Photos">
            <Upload
              listType="picture-card"
              fileList={photosArchitecture}
              customRequest={customUploadRequest}
              beforeUpload={validateImageSize}
              accept="image/*"
              onChange={({ fileList }) => setPhotosArchitecture(fileList)}
              multiple
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Add Photos</div>
              </div>
            </Upload>
          </Form.Item>
          <Form.Item label="Interior Photos">
            <Upload
              listType="picture-card"
              fileList={photosInterior}
              customRequest={customUploadRequest}
              beforeUpload={validateImageSize}
              accept="image/*"
              onChange={({ fileList }) => setPhotosInterior(fileList)}
              multiple
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Add Photos</div>
              </div>
            </Upload>
          </Form.Item>
          <Form.Item label="Lobby Photos">
            <Upload
              listType="picture-card"
              fileList={photosLobby}
              customRequest={customUploadRequest}
              beforeUpload={validateImageSize}
              accept="image/*"
              onChange={({ fileList }) => setPhotosLobby(fileList)}
              multiple
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Add Photos</div>
              </div>
            </Upload>
          </Form.Item>
          <Form.Item label="Other Photos">
            <Upload
              listType="picture-card"
              fileList={photosOther}
              customRequest={customUploadRequest}
              beforeUpload={validateImageSize}
              accept="image/*"
              onChange={({ fileList }) => setPhotosOther(fileList)}
              multiple
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Add Photos</div>
              </div>
            </Upload>
          </Form.Item>
          <Form.Item name="videoUrl" label="Video URL">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item label="Brochure (PDF)">
            <Upload
              fileList={brochureFileList}
              customRequest={customUploadRequest}
              beforeUpload={(file) => {
                const isPDF = file.type === "application/pdf";
                if (!isPDF) showToast("error", "Only PDF files are allowed!");
                return isPDF || Upload.LIST_IGNORE;
              }}
              accept=".pdf"
              onChange={({ fileList }) => setBrochureFileList(fileList)}
              maxCount={1}
            >
              <Button icon={<PlusOutlined />}>Upload Brochure</Button>
            </Upload>
          </Form.Item>

          {/* Amenities & Facilities */}
          <Divider orientation="left" style={{ borderColor: THEME.primary }}>
            Amenities & Facilities
          </Divider>
          <Form.Item name="amenities" label="Amenities">
            <Select mode="tags" placeholder="Type and press Enter" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Facilities">
            <Row gutter={[16, 0]}>
              <Col span={8}>
                <Form.Item name="swimmingPool" valuePropName="checked" noStyle>
                  <Checkbox>Swimming Pool</Checkbox>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="gym" valuePropName="checked" noStyle>
                  <Checkbox>Gym</Checkbox>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="parking" valuePropName="checked" noStyle>
                  <Checkbox>Parking</Checkbox>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="childrenPlayArea" valuePropName="checked" noStyle>
                  <Checkbox>Children Play Area</Checkbox>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="gardens" valuePropName="checked" noStyle>
                  <Checkbox>Gardens</Checkbox>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="security" valuePropName="checked" noStyle>
                  <Checkbox>Security</Checkbox>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="concierge" valuePropName="checked" noStyle>
                  <Checkbox>Concierge</Checkbox>
                </Form.Item>
              </Col>
            </Row>
          </Form.Item>

          {/* Additional Features */}
          <Divider orientation="left" style={{ borderColor: THEME.primary }}>
            Additional Features
          </Divider>
        <Form form={form} layout="vertical">

  <Row gutter={16}>
    
    <Col xs={12} md={6}>
      <Form.Item name="hasView" valuePropName="checked" label="Has View">
        <Switch />
      </Form.Item>
    </Col>

    {/* 👇 CONDITIONAL VIEW TYPE */}
    {hasView && (
      <Col xs={12} md={6}>
        <Form.Item name="viewType" label="View Type">
          <Select mode="multiple" placeholder="Select views">
            <Select.Option value="city">City View</Select.Option>
            <Select.Option value="sea">Sea View</Select.Option>
            <Select.Option value="garden">Garden View</Select.Option>
            <Select.Option value="landmark">Landmark View</Select.Option>
            <Select.Option value="pool">Pool View</Select.Option>
            <Select.Option value="park">Park View</Select.Option>
          </Select>
        </Form.Item>
      </Col>
    )}

    <Col xs={12} md={6}>
      <Form.Item name="parkingSpaces" label="Parking Spaces">
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>
    </Col>

    <Col xs={12} md={6}>
      <Form.Item name="furnishing" label="Furnishing">
        <Select>
          <Select.Option value="unfurnished">Unfurnished</Select.Option>
          <Select.Option value="furnished">Furnished</Select.Option>
          <Select.Option value="semi_furnished">Semi-furnished</Select.Option>
        </Select>
      </Form.Item>
    </Col>

    <Col xs={12} md={6}>
      <Form.Item name="ownershipType" label="Ownership Type">
        <Select>
          <Select.Option value="freehold">Freehold</Select.Option>
          <Select.Option value="leasehold">Leasehold</Select.Option>
        </Select>
      </Form.Item>
    </Col>

    <Col xs={12} md={6}>
      <Form.Item name="availableFrom" label="Available From">
        <DatePicker style={{ width: "100%" }} />
      </Form.Item>
    </Col>

  </Row>

</Form>

          {/* Project Details */}
          <Divider orientation="left" style={{ borderColor: THEME.primary }}>
            Project Details
          </Divider>
          <Row gutter={16}>
            <Col xs={12} md={6}>
              <Form.Item name="totalUnits" label="Total Units">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="floors" label="Number of Floors">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="projectStatus" label="Project Status">
                <Select>
                  <Option value="presale">Presale</Option>
                  <Option value="under_construction">Under Construction</Option>
                  <Option value="ready">Ready</Option>
                  <Option value="sold_out">Sold Out</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="readinessProgress" label="Readiness Progress">
                <Select>
                  <Option value="0%">0%</Option>
                  <Option value="25%">25%</Option>
                  <Option value="50%">50%</Option>
                  <Option value="75%">75%</Option>
                  <Option value="100%">100%</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={12} md={6}>
              <Form.Item name="completionQuarter" label="Completion Quarter">
                <Select>
                  <Option value="Q1">Q1</Option>
                  <Option value="Q2">Q2</Option>
                  <Option value="Q3">Q3</Option>
                  <Option value="Q4">Q4</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="completionYear" label="Completion Year">
                <InputNumber min={2024} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={12} md={12}>
              <Form.Item name="completionFullDate" label="Exact Completion Date">
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item name="serviceChargeInfo" label="Service Charge Info">
                <Input placeholder="e.g., AED 15 per sqft annually" />
              </Form.Item>
            </Col>
          </Row>

          {/* Payment Plan */}
          <Divider orientation="left" style={{ borderColor: THEME.primary }}>
            Payment Plan
          </Divider>
          {renderPaymentPlanFields()}

          {/* Financial & Legal */}
          <Divider orientation="left" style={{ borderColor: THEME.primary }}>
            Financial & Legal
          </Divider>
          <Row gutter={16}>
            <Col xs={12} md={6}>
              <Form.Item name="eoiAmount" label="EOI Amount">
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="commission" label="Commission (%)">
                <InputNumber min={0} max={100} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="shareCommission" valuePropName="checked" label="Share Commission">
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="shareCommissionPercentage" label="Share Commission %">
                <InputNumber min={0} max={100} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="isFeatured" valuePropName="checked" label="Featured">
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="showContactOnlyVerified" valuePropName="checked" label="Contact Only Verified">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="resaleConditions" label="Resale Conditions">
            <TextArea rows={2} placeholder="e.g., Resale allowed after 30% payment. Transfer fee of 2% applies." />
          </Form.Item>

          {/* Submit Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "24px",
              paddingBottom: "16px",
            }}
          >
            <Button onClick={() => navigate("/dashboard/developer/developer-projects")}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={formLoading}
              style={{ backgroundColor: THEME.primary }}
              disabled={isAnyUploading()}
            >
              Save Property
            </Button>
          </div>

          {photoError && (
            <Alert type="error" message={photoError} showIcon style={{ marginTop: 16 }} />
          )}
        </Form>
      </Card>
    </div>
  );
}