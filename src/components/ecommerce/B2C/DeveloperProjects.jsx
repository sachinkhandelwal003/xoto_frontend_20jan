import {
  Card,
  Typography,
  Tag,
  Button,
  Input,
  Row,
  Col,
  Statistic,
  Modal,
  Form,
  Divider,
  Select,
  InputNumber,
  Upload,
  Switch,
  Space,
  Alert
} from "antd";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import { showToast } from "../../../manageApi/utils/toast";
import CustomTable from "../../../components/CMS/pages/custom/CustomTable";
import {
  PlusOutlined,
  SearchOutlined,
  HomeOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const THEME = { primary: "#6d28d9" };
const UPLOAD_API = "https://xoto.ae/api/upload";

export default function DeveloperProjects() {
  const navigate = useNavigate();

  const { user, token } = useSelector((state) => state.auth);

  // ✅ user.id confirmed from console log
  const developerId = user?.id || user?._id || null;

  const [projects, setProjects]     = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [search, setSearch]         = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [formLoading, setFormLoading]   = useState(false);
  const [editingId, setEditingId]       = useState(null);
  const [form]                          = Form.useForm();
  const [photoList, setPhotoList]       = useState([]);
  const [photoError, setPhotoError]     = useState("");

  // ================= FETCH PROJECTS =================
  const fetchProjects = async () => {
    if (!developerId) return;
    try {
      setTableLoading(true);
      const json = await apiService.get("/", { limit: 1000 });
      const list = json?.data?.data || [];

     const mapped = list
  .filter(p => {
    if (p.listingType !== "developer") return false;

    const byDeveloper   = p.developer?.toString()   === developerId ||
                          p.developer?._id?.toString() === developerId;
    const byCreatedBy   = p.createdBy?.toString()   === developerId;

    return byDeveloper || byCreatedBy;
  })
        .map((p, index) => ({
          key: p._id || p.id || `row-${index}`,
          propertyName: p.projectName || "Untitled",
          location: `${p.areaName || ""} ${p.city || ""}`.trim(),
          units: p.area ? `${p.area} sqft` : "-",
          sold: p.unitType ? 1 : 0,
          status: p.approvalStatus || "pending",
          rejectionReason: p.rejectionReason || ""
        }));

      setProjects(mapped);
      setFiltered(mapped);
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to load your properties.");
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, [developerId, token]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      projects.filter(p =>
        p.propertyName?.toLowerCase().includes(q) ||
        p.location?.toLowerCase().includes(q)
      )
    );
  }, [search, projects]);

  // ================= MODAL =================
  const openModal = () => {
    setEditingId(null);
    form.resetFields();
    setPhotoList([]);
    setPhotoError("");
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingId(null);
    form.resetFields();
    setPhotoList([]);
    setPhotoError("");
  };

  const validateImageSize = (file) => {
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) showToast("error", "Image must be smaller than 2MB!");
    return isLt2M || Upload.LIST_IGNORE;
  };

  // ================= UPLOAD =================
  const customUploadRequest = async ({ file, onSuccess, onError }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res  = await fetch(UPLOAD_API, { method: "POST", body: formData });
      const data = await res.json();

      console.log("=== UPLOAD RESPONSE ===", JSON.stringify(data));

      if (!res.ok || data.success === false) throw new Error(data.message || "Upload failed");

      onSuccess(data, file);
    } catch (err) {
      console.error("Upload error:", err);
      onError(err);
    }
  };

  const extractPhotoUrl = (fileItem) => {
    const r = fileItem.response;
    if (!r) return null;
    return (
      r.url             || r.imageUrl         || r.image_url      ||
      r.secure_url      || r.link             || r.path           ||
      r.filePath        || r.fileUrl          ||
      r.data?.url       || r.data?.imageUrl   || r.data?.secure_url ||
      r.data?.path      || r.data?.link       ||
      r.file?.url       || r.file?.imageUrl   || r.file?.image_url ||
      r.file?.secure_url || r.file?.path      || r.file?.filePath  ||
      r.file?.fileUrl   || r.file?.link       || r.file?.location  ||
      r.file?.key       || r.file?.filename   || r.file?.name      ||
      r.result?.url     || r.result?.secure_url ||
      null
    );
  };

  // ================= SAVE =================
  const handleSave = async (values) => {
    if (photoList.some(f => f.status === "uploading")) {
      showToast("error", "Please wait for all photos to finish uploading.");
      return;
    }

    const failed = photoList.filter(f => f.status === "error");
    if (failed.length > 0) {
      setPhotoError(`${failed.length} photo(s) failed. Please remove and re-add them.`);
      return;
    }

    const doneFiles = photoList.filter(f => f.status === "done");
    if (doneFiles.length === 0) {
      setPhotoError("Please upload at least one photo before saving.");
      return;
    }

    const photos = doneFiles.map(f => extractPhotoUrl(f)).filter(Boolean);
    if (photos.length === 0) {
      console.error("URL extraction failed. Responses:", JSON.stringify(doneFiles.map(f => f.response)));
      setPhotoError("Could not read photo URL from server. Check console → 'UPLOAD RESPONSE'.");
      return;
    }

    setPhotoError("");

    try {
      setFormLoading(true);

      // ✅ KEY FIX: Send BOTH createdBy AND developerId so backend finds whichever it expects
     const payload = {
  ...values,
  price:       Number(values.price),
  area:        Number(values.area),
  commission:  values.commission ? Number(values.commission) : 0,
  photos,
  listingType:  "developer",
  developer:    developerId,   // ✅ matches: if (!data.developer) in controller
  createdBy:    developerId,
};
      console.log("=== SUBMITTING PAYLOAD ===", payload);

      const data = editingId
        ? await apiService.put(`/property/${editingId}`, payload)
        : await apiService.post("/property", payload);

      if (data) {
        showToast("success", editingId
          ? "Property updated and resubmitted for approval."
          : "Property submitted. Waiting for admin approval."
        );
        closeModal();
        fetchProjects();
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

  // ✅ Single toast for all form validation errors
  const handleFinishFailed = ({ errorFields }) => {
    showToast("error", errorFields?.[0]?.errors?.[0] || "Please fill in all required fields.");
  };

  const getColor = (status) => {
    if (status === "approved") return "green";
    if (status === "pending")  return "orange";
    if (status === "rejected") return "red";
  };

  // ================= TABLE COLUMNS =================
  const columns = [
    {
      key: "col-property",
      title: "Property",
      dataIndex: "propertyName",
      render: (_, record) => (
        <div>
          <Text strong style={{ fontSize: 15 }}>{record.propertyName || "N/A"}</Text><br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.location}</Text>
        </div>
      )
    },
    {
      key: "col-units",
      title: "Area Range",
      dataIndex: "units",
      render: (_, record) => <Text>{record.units}</Text>
    },
    {
      key: "col-sold",
      title: "Unit Types",
      dataIndex: "sold",
      render: (_, record) => <Tag color="purple">{record.sold} Units</Tag>
    },
    {
      key: "col-status",
      title: "Status",
      dataIndex: "status",
      render: (_, record) => (
        <div>
          <Tag color={getColor(record.status)}>
            {record.status?.toUpperCase()}
          </Tag>
          {record.status === "rejected" && record.rejectionReason && (
            <div style={{ marginTop: 6 }}>
              <Text type="danger">Reason: {record.rejectionReason}</Text>
            </div>
          )}
        </div>
      )
    },
    {
      key: "col-action",
      title: "Action",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            style={{ background: "#6d28d9", borderColor: "#6d28d9", borderRadius: 8 }}
            onClick={() => navigate(`/dashboard/developer/developer-projects/${record.key}`)}
          >
            View
          </Button>
          {record.status === "rejected" && (
            <Button
              danger
              onClick={() => {
                setEditingId(record.key);
                setPhotoList([]);
                setPhotoError("");
                form.resetFields();
                setModalVisible(true);
              }}
            >
              Edit & Resubmit
            </Button>
          )}
        </Space>
      )
    }
  ];

  const isUploading = photoList.some(f => f.status === "uploading");

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <Row justify="space-between" align="middle" className="mb-6">
        <Col>
          <Title level={3} style={{ margin: 0 }}>My Properties</Title>
          <Text type="secondary">Manage and track all your listed properties</Text>
        </Col>
        <Col>
          <Button
            icon={<PlusOutlined />}
            size="large"
            type="primary"
            style={{ background: "#6d28d9", borderRadius: 10, fontWeight: 600 }}
            onClick={openModal}
          >
            Add Property
          </Button>
        </Col>
      </Row>

      {/* STATS + SEARCH */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={8}>
          <Card className="shadow-sm rounded-xl">
            <Statistic
              title="Total Properties"
              value={projects.length}
              prefix={<HomeOutlined style={{ color: "#6d28d9" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} md={16}>
          <Card className="shadow-sm rounded-xl">
            <Input
              size="large"
              placeholder="Search by property name or location..."
              prefix={<SearchOutlined />}
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Card>
        </Col>
      </Row>

      {/* TABLE */}
      <CustomTable
        columns={columns}
        data={filtered}
        loading={tableLoading}
        pagination={{ pageSize: 10, style: { padding: "16px" } }}
        showSearch={true}
        onRefresh={fetchProjects}
      />

      {/* ================= MODAL ================= */}
      <Modal
        title={editingId ? "Edit & Resubmit Property" : "Add New Property"}
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        width={1000}
        style={{ top: 20 }}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          onFinishFailed={handleFinishFailed}
          initialValues={{
            projectType: "new",
            unitType: "Apartment",
            bedrooms: "1",
            country: "UAE",
            shareCommission: false,
            commission: 0
          }}
        >
          {/* SECTION 1 */}
          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Project Details</Divider>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="projectType" label="Project Type" rules={[{ required: true, message: "Select project type" }]}>
                <Select>
                  <Option value="new">New</Option>
                  <Option value="existing">Existing</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="projectName" label="Project Name" rules={[{ required: true, message: "Enter project name" }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="developerName" label="Developer Name" rules={[{ required: true, message: "Enter developer name" }]}>
                <Input placeholder="Enter Developer Name" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item name="location" label="General Location" rules={[{ required: true, message: "Enter location" }]}>
                <Input placeholder="e.g. Downtown Dubai" />
              </Form.Item>
            </Col>
          </Row>

          {/* SECTION 2 */}
          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Property Info</Divider>
          <Row gutter={16}>
            <Col xs={12} md={6}>
              <Form.Item name="unitType" label="Unit Type" rules={[{ required: true, message: "Select unit type" }]}>
                <Select>
                  <Option value="Apartment">Apartment</Option>
                  <Option value="Villa">Villa</Option>
                  <Option value="Townhouse">Townhouse</Option>
                  <Option value="Duplex">Duplex</Option>
                  <Option value="Penthouse">Penthouse</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="bedrooms" label="Bedrooms" rules={[{ required: true, message: "Select bedrooms" }]}>
                <Select>
                  {["Studio","1","2","3","4","5","6","7","8+"].map(b => (
                    <Option key={b} value={b}>{b}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="price" label="Price" rules={[{ required: true, message: "Enter price" }]}>
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={v => v.replace(/,/g, "")}
                />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="area" label="Area (sqft/sqm)" rules={[{ required: true, message: "Enter area" }]}>
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} />
          </Form.Item>

          {/* UPLOAD */}
          <Form.Item label="Property Photos" required>
            <Upload
              listType="picture-card"
              fileList={photoList}
              customRequest={customUploadRequest}
              multiple
              beforeUpload={validateImageSize}
              accept="image/*"
              onChange={({ fileList, file }) => {
                setPhotoList(fileList);
                if (file.status === "done") setPhotoError("");
              }}
              onRemove={() => setPhotoError("")}
            >
              <div><PlusOutlined /><div style={{ marginTop: 8 }}>Add Photos</div></div>
            </Upload>

            {isUploading && (
              <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 4 }}>
                ⏳ Uploading… please wait before saving.
              </Text>
            )}
            {!isUploading && photoList.length > 0 && photoList.every(f => f.status === "done") && (
              <Text style={{ fontSize: 12, display: "block", marginTop: 4, color: "green" }}>
                ✅ All photos uploaded successfully.
              </Text>
            )}
            {photoError && (
              <Alert type="error" message={photoError} showIcon style={{ marginTop: 8 }} />
            )}
          </Form.Item>

          {/* SECTION 3 */}
          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Commission</Divider>
          <Row gutter={16} align="middle">
            <Col xs={12} md={6}>
              <Form.Item name="shareCommission" label="Share Commission" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="commission" label="Commission Amount">
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          {/* SECTION 4 */}
          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Specific Location Details</Divider>
          <Row gutter={16}>
            <Col xs={12} md={6}><Form.Item name="buildingNo" label="Building No"><Input /></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name="street" label="Street"><Input /></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name="areaName" label="Area Name"><Input /></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name="city" label="City"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col xs={12} md={6}><Form.Item name="state" label="State"><Input /></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name="country" label="Country"><Input /></Form.Item></Col>
            <Col xs={24} md={12}>
              <Form.Item name="googleLocation" label="Google Maps Link">
                <Input placeholder="http://..." />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px", paddingBottom: "16px" }}>
            <Button onClick={closeModal} size="large">Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={formLoading}
              size="large"
              style={{ backgroundColor: THEME.primary }}
              disabled={isUploading}
            >
              {editingId ? "Update Property" : "Save Property"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}