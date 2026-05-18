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

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const THEME      = { primary: "#6d28d9" };
const UPLOAD_API = "https://xoto.ae/api/upload";

// ─── Extract uploaded image URL ───────────────────────────────────────────────
const extractPhotoUrl = (fileItem) => {
  const r = fileItem.response;
  if (!r) return null;
  return (
    r.url || r.imageUrl || r.image_url || r.secure_url || r.link || r.path ||
    r.filePath || r.fileUrl ||
    r.data?.url || r.data?.imageUrl || r.data?.secure_url || r.data?.path || r.data?.link ||
    r.file?.url || r.file?.imageUrl || r.file?.image_url || r.file?.secure_url ||
    r.file?.path || r.file?.filePath || r.file?.fileUrl || r.file?.link ||
    r.file?.location || r.file?.key || r.file?.filename || r.file?.name ||
    r.result?.url || r.result?.secure_url ||
    null
  );
};

const customUploadRequest = async ({ file, onSuccess, onError }) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res  = await fetch(UPLOAD_API, { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok || data.success === false) throw new Error(data.message || "Upload failed");
    onSuccess(data, file);
  } catch (err) {
    console.error("Upload error:", err);
    onError(err);
  }
};

export default function DeveloperAddProperty() {
  const navigate   = useNavigate();
  const { user }   = useSelector((state) => state.auth);
  const developerId = user?.id || user?._id || null;

  const [form]        = Form.useForm();
  const hasView       = Form.useWatch("hasView", form);
  const [formLoading, setFormLoading] = useState(false);
  const [photoError,  setPhotoError]  = useState("");

  const [mainLogoFileList,   setMainLogoFileList]   = useState([]);
  const [photosArchitecture, setPhotosArchitecture] = useState([]);
  const [photosInterior,     setPhotosInterior]     = useState([]);
  const [photosLobby,        setPhotosLobby]        = useState([]);
  const [photosOther,        setPhotosOther]        = useState([]);
  const [brochureFileList,   setBrochureFileList]   = useState([]);

  useEffect(() => {
    if (!developerId) {
      showToast("error", "Developer not found. Please log in again.");
      navigate("/dashboard/developer");
    }
  }, [developerId, navigate]);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        developerName:
          user?.username || user?.companyName || user?.company_name ||
          user?.name     || user?.fullName    || user?.full_name    || "",
      });
    }
  }, [user, form]);

  const validateImageSize = (file) => {
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) showToast("error", "Image must be smaller than 2MB!");
    return isLt2M || Upload.LIST_IGNORE;
  };

  const isAnyUploading = () =>
    [mainLogoFileList, photosArchitecture, photosInterior,
     photosLobby, photosOther, brochureFileList]
      .some((list) => list.some((f) => f.status === "uploading"));

  const collectUrls = (fileList) =>
    fileList.filter((f) => f.status === "done").map(extractPhotoUrl).filter(Boolean);

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSave = async (values) => {
    if (isAnyUploading()) {
      showToast("error", "Please wait for all photos to finish uploading.");
      return;
    }

    const anyFailed = [mainLogoFileList, photosArchitecture, photosInterior,
                       photosLobby, photosOther, brochureFileList]
      .some((list) => list.some((f) => f.status === "error"));
    if (anyFailed) {
      setPhotoError("Some media failed to upload. Please remove and re-upload them.");
      return;
    }

    const mainLogoUrls = collectUrls(mainLogoFileList);
    if (mainLogoUrls.length === 0) {
      setPhotoError("Please upload a main logo image.");
      return;
    }

    let brochureUrl = "";
    if (brochureFileList.length > 0 && brochureFileList[0].status === "done") {
      brochureUrl = extractPhotoUrl(brochureFileList[0]) || "";
    }

    // ── Payload — flat structure matching property.model.js ──────────────────
    const payload = {
      // Who creates
      propertySubType: "off_plan",
      transactionType: "sell",
      projectOption:   "new",

      // Basic info
      propertyName:  values.propertyName?.trim(),
      developerName: values.developerName || user?.name || "",
      description:   values.description?.trim(),

      // Unit details
      unitNumber:     values.unitNumber  || "",
      floorNumber:    values.floorNumber || 0,
      unitType:       values.unitType    || "apartment",
      bedroomType:    values.bedroomType || "1bed",
      bedrooms:       values.bedrooms    || 0,
      bathrooms:      values.bathrooms   || 0,

      // Dimensions
      builtUpArea_min: values.builtUpArea_min || 0,
      builtUpArea_max: values.builtUpArea_max || 0,
      builtUpAreaUnit: values.builtUpAreaUnit || "sqft",

      // Price
      price_min: values.price_min || 0,
      price_max: values.price_max || 0,
      price:     values.price_min || 0,   // model uses price as primary field too
      currency:  values.currency  || "AED",

      // Location — FLAT (not nested), matching model fields directly
      area:    values.area?.trim()    || "",
      city:    values.city?.trim()    || "Dubai",
      country: values.country?.trim() || "UAE",
      coordinates: {
        lat: values.latitude  || null,
        lng: values.longitude || null,
      },
      proximity: {
        airport: values.airportProximity || "",
        metro:   values.metroProximity   || "",
        mall:    values.mallProximity    || "",
        school:  values.schoolProximity  || "",
      },

      // Media
      mainLogo: mainLogoUrls[0],
      photos: {
        architecture: collectUrls(photosArchitecture),
        interior:     collectUrls(photosInterior),
        lobby:        collectUrls(photosLobby),
        other:        collectUrls(photosOther),
      },
      videoUrl: values.videoUrl || "",
      brochure: brochureUrl,

      // Amenities & Facilities
      amenities: values.amenities || [],
      facilities: {
        swimmingPool:     values.swimmingPool     || false,
        gym:              values.gym              || false,
        parking:          values.parking          || false,
        childrenPlayArea: values.childrenPlayArea || false,
        gardens:          values.gardens          || false,
        security:         values.security         || false,
        concierge:        values.concierge        || false,
        lounge:           values.lounge           || false,
        smartHome:        values.smartHome        || false,
      },

      // Features
      hasView:       values.hasView       || false,
      viewType:      values.viewType      || [],
      parkingSpaces: values.parkingSpaces || 0,
      furnishing:    values.furnishing    || "unfurnished",
      ownershipType: values.ownershipType || "freehold",
      availableFrom: values.availableFrom
        ? values.availableFrom.format("YYYY-MM-DD")
        : null,

      // Off-plan specific
      totalUnits:        values.totalUnits        || 0,
      floors:            values.floors            || 0,
      projectStatus:     values.projectStatus     || "presale",
      readinessProgress: values.readinessProgress || "0%",
      serviceChargeInfo: values.serviceChargeInfo || "",
      completionDate: {
        quarter:  values.completionQuarter  || null,
        year:     values.completionYear     || null,
        fullDate: values.completionFullDate
          ? values.completionFullDate.format("YYYY-MM-DD")
          : null,
      },

      // Payment plan
      paymentPlan:      values.paymentPlan || [],
      eoiAmount:        values.eoiAmount   || 0,
      resaleConditions: values.resaleConditions || "",

      // Commission
      commission:                values.commission                || 0,
      shareCommission:           values.shareCommission           || false,
      shareCommissionPercentage: values.shareCommissionPercentage || 0,

      // Misc
      // isFeatured:              values.isFeatured              || false,
      showContactOnlyVerified: values.showContactOnlyVerified || false,
    };

    // Remove undefined keys
    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined) delete payload[k];
    });

    setPhotoError("");

    try {
      setFormLoading(true);

      // ✅ New unified endpoint — POST /property with propertySubType in body
      const res = await apiService.post("/properties", payload)

      if (res) {
        showToast("success", "Property submitted. Waiting for admin approval.");
        navigate("/dashboard/developer/developer-projects");
      } else {
        showToast("error", "Failed to save property.");
      }
    } catch (error) {
      console.error("Save error:", error);
      showToast("error", error?.message || "Something went wrong.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleFinishFailed = ({ errorFields }) => {
    if (errorFields?.length > 0) {
      showToast("error", errorFields[0]?.errors?.[0] || "Please fill in all required fields.");
    }
  };

  // ── Payment plan renderer ────────────────────────────────────────────────────
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
                  <Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => remove(name)} />
                </Col>
              </Row>

              <Form.List name={[name, "stages"]}>
                {(stageFields, { add: addStage, remove: removeStage }) => (
                  <>
                    {stageFields.map(({ key: sk, name: sn, ...sr }) => (
                      <Row key={sk} gutter={16} align="middle">
                        <Col span={6}>
                          <Form.Item {...sr} name={[sn, "stage"]} label="Stage" rules={[{ required: true }]}>
                            <Select placeholder="Select stage">
                              <Option value="on_booking">On Booking</Option>
                              <Option value="during_construction">During Construction</Option>
                              <Option value="upon_handover">Upon Handover</Option>
                              <Option value="other">Other</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item {...sr} name={[sn, "percentage"]} label="Percentage (%)" rules={[{ required: true }]}>
                            <InputNumber min={0} max={100} style={{ width: "100%" }} />
                          </Form.Item>
                        </Col>
                        <Col span={10}>
                          <Form.Item {...sr} name={[sn, "description"]} label="Description">
                            <Input placeholder="Optional" />
                          </Form.Item>
                        </Col>
                        <Col span={2}>
                          <Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => removeStage(sn)} />
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

  // ── Render ───────────────────────────────────────────────────────────────────
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
            currency:       "AED",
            builtUpAreaUnit: "sqft",
            unitType:       "apartment",
            bedroomType:    "1bed",
            bedrooms:       1,
            bathrooms:      1,
            furnishing:     "unfurnished",
            ownershipType:  "freehold",
            projectStatus:  "presale",
            readinessProgress: "0%",
            hasView:        false,
            viewType:       [],
            // isFeatured:     false,
            showContactOnlyVerified: false,
            shareCommission:           false,
            shareCommissionPercentage: 0,
          }}
        >

          {/* ── Basic Information ── */}
          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Basic Information</Divider>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="propertyName" label="Property Name" rules={[{ required: true, message: "Enter property name" }]}>
                <Input placeholder="e.g., Luxury Tower Downtown" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="developerName" label="Developer Name">
                <Input readOnly style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed", color: "#555" }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="Description" rules={[{ required: true, message: "Description is required" }]}>
            <TextArea rows={4} placeholder="Describe the property..." />
          </Form.Item>

          {/* ── Property Details ── */}
          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Property Details</Divider>
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
              <Form.Item name="bedroomType" label="Bedroom Type" rules={[{ required: true }]}>
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
              <Form.Item name="builtUpArea_min" label="Min Built-up Area" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="builtUpArea_max" label="Max Built-up Area" rules={[{ required: true }]}>
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
              <Form.Item name="price_min" label="Min Price" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="price_max" label="Max Price" rules={[{ required: true }]}>
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

          {/* ── Location ── */}
          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Location & Proximity</Divider>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="area" label="Area" rules={[{ required: true, message: "Enter area name" }]}>
                <Input placeholder="e.g., Downtown Dubai" />
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="city" label="City" initialValue="Dubai">
                <Input placeholder="Dubai" />
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="country" label="Country" initialValue="UAE">
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
            {[
              ["airportProximity", "Distance to Airport", "e.g., 15 minutes"],
              ["metroProximity",   "Distance to Metro",   "e.g., 2 minutes walk"],
              ["mallProximity",    "Distance to Mall",    "e.g., 5 minutes"],
              ["schoolProximity",  "Distance to School",  "e.g., 10 minutes"],
            ].map(([name, label, placeholder]) => (
              <Col xs={12} md={6} key={name}>
                <Form.Item name={name} label={label}>
                  <Input placeholder={placeholder} />
                </Form.Item>
              </Col>
            ))}
          </Row>

          {/* ── Media ── */}
          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Media</Divider>
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
                <div><PlusOutlined /><div style={{ marginTop: 8 }}>Upload Logo</div></div>
              )}
            </Upload>
          </Form.Item>
          {[
            ["Architecture Photos", photosArchitecture, setPhotosArchitecture],
            ["Interior Photos",     photosInterior,     setPhotosInterior],
            ["Lobby Photos",        photosLobby,        setPhotosLobby],
            ["Other Photos",        photosOther,        setPhotosOther],
          ].map(([label, state, setter]) => (
            <Form.Item label={label} key={label}>
              <Upload
                listType="picture-card"
                fileList={state}
                customRequest={customUploadRequest}
                beforeUpload={validateImageSize}
                accept="image/*"
                onChange={({ fileList }) => setter(fileList)}
                multiple
              >
                <div><PlusOutlined /><div style={{ marginTop: 8 }}>Add Photos</div></div>
              </Upload>
            </Form.Item>
          ))}
          <Form.Item name="videoUrl" label="Video URL">
            <Input placeholder="https://youtube.com/..." />
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

          {/* ── Amenities & Facilities ── */}
          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Amenities & Facilities</Divider>
          <Form.Item name="amenities" label="Amenities">
            <Select mode="tags" placeholder="Type and press Enter" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Facilities">
            <Row gutter={[16, 8]}>
              {[
                ["swimmingPool",     "Swimming Pool"],
                ["gym",              "Gym"],
                ["parking",          "Parking"],
                ["childrenPlayArea", "Children Play Area"],
                ["gardens",          "Gardens"],
                ["security",         "Security"],
                ["concierge",        "Concierge"],
                ["lounge",           "Lounge"],
                ["smartHome",        "Smart Home"],
              ].map(([name, label]) => (
                <Col span={8} key={name}>
                  <Form.Item name={name} valuePropName="checked" noStyle>
                    <Checkbox>{label}</Checkbox>
                  </Form.Item>
                </Col>
              ))}
            </Row>
          </Form.Item>

          {/* ── Additional Features ── */}
          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Additional Features</Divider>
          <Row gutter={16}>
            <Col xs={12} md={6}>
              <Form.Item name="hasView" valuePropName="checked" label="Has View">
                <Switch />
              </Form.Item>
            </Col>
            {hasView && (
              <Col xs={12} md={6}>
                <Form.Item name="viewType" label="View Type">
                  <Select mode="multiple" placeholder="Select views">
                    <Option value="city">City View</Option>
                    <Option value="sea">Sea View</Option>
                    <Option value="garden">Garden View</Option>
                    <Option value="landmark">Landmark View</Option>
                    <Option value="pool">Pool View</Option>
                    <Option value="park">Park View</Option>
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
                  <Option value="unfurnished">Unfurnished</Option>
                  <Option value="furnished">Furnished</Option>
                  <Option value="semi_furnished">Semi-furnished</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="ownershipType" label="Ownership Type">
                <Select>
                  <Option value="freehold">Freehold</Option>
                  <Option value="leasehold">Leasehold</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="availableFrom" label="Available From">
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          {/* ── Project Details ── */}
          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Project Details</Divider>
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
                <Select allowClear>
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
          <Form.Item name="serviceChargeInfo" label="Service Charge Info">
            <Input placeholder="e.g., AED 15 per sqft annually" />
          </Form.Item>

          {/* ── Payment Plan ── */}
          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Payment Plan</Divider>
          {renderPaymentPlanFields()}

          {/* ── Financial & Legal ── */}
          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Financial & Legal</Divider>
          <Row gutter={16}>
            <Col xs={12} md={6}>
              <Form.Item name="eoiAmount" label="EOI Amount (AED)">
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
            {/* <Col xs={12} md={6}>
              <Form.Item name="isFeatured" valuePropName="checked" label="Featured">
                <Switch />
              </Form.Item>
            </Col> */}
            <Col xs={12} md={6}>
              <Form.Item name="showContactOnlyVerified" valuePropName="checked" label="Contact Only Verified">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="resaleConditions" label="Resale Conditions">
            <TextArea rows={2} placeholder="e.g., Resale allowed after 30% payment. Transfer fee of 2% applies." />
          </Form.Item>
{form.getFieldValue("approvalStatus") === "changes_requested" && (
  <Alert
    type="warning"
    showIcon
    message="Changes Requested by Admin"
    description={form.getFieldValue("adminComments") || "Please review and resubmit."}
    style={{ marginBottom: 16 }}
  />
)}
          {/* ── Submit ── */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: 24, paddingBottom: 16 }}>
            <Button onClick={() => navigate("/dashboard/developer/developer-projects")}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={formLoading}
              disabled={isAnyUploading()}
              style={{ backgroundColor: THEME.primary }}
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