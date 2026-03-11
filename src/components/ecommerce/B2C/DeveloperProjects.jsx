import {
  Card,
  Typography,
  Table,
  Tag,
  Button,
  Input,
  Row,
  Col,
  Statistic,
  message,
  Modal,
  Form,
  Divider,
  Select,
  DatePicker,
  InputNumber,
  Upload,
  Switch,
  Space
} from "antd";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import {
  PlusOutlined,
  SearchOutlined,
  HomeOutlined,
  UploadOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Constants for Modal
const THEME = { primary: "#6d28d9" };
const UPLOAD_API = "https://xoto.ae/api/upload"; // Apna actual upload endpoint yahan daalein

export default function DeveloperProjects() {
  const navigate = useNavigate();

  // Redux Auth
  const { user, token } = useSelector((state) => state.auth);
  const developerId = user?._id || user?.id;

  // Table States
  const [projects, setProjects] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [developerName, setDeveloperName] = useState("");

  // Modal & Form States
  const [modalVisible, setModalVisible] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  // Upload States
  const [logoList, setLogoList] = useState([]);
  const [photoList, setPhotoList] = useState([]);
  const [brochureUrl, setBrochureUrl] = useState(null);

  // Dummy developers array for the dropdown (Aap ise API se bhi fetch kar sakte hain)
  const developers = [{ _id: developerId, name: user?.name || "Me (Logged In Developer)" }];

  // ================= FETCH PROJECTS =================
  const fetchProjects = async () => {
    if (!developerId) return;
    try {
      setTableLoading(true);
      
      const json = await apiService.get(
  "/property/get-all-properties",
  {
    developer: developerId
  }
);
      
const list = json?.data || [];
    const mapped = list.map(p => ({
  key: p._id,
  name: p.propertyName,
  location: `${p.area || ""} ${p.city || ""}`,
  units: p.builtUpArea_min ? `${p.builtUpArea_min}-${p.builtUpArea_max}` : "-",
  sold: p.unitType?.length || 0,
  status: p.approvalStatus || "pending",
  rejectionReason: p.rejectionReason || ""
}));

      setProjects(mapped);
      setFiltered(mapped);
    } catch (err) {
      console.error(err);
      message.error("Failed to load your properties.");
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [developerId, token]);

 
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      projects.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.location?.toLowerCase().includes(q)
      )
    );
  }, [search, projects]);

  useEffect(() => {
  const fetchDeveloper = async () => {
    try {
      if (!developerId) return;

      const res = await apiService.get("/property/get-developer-by-id", {
        id: developerId
      });

      const dev = res?.data?.data || res?.data;

      setDeveloperName(dev?.name || "");

    } catch (error) {
      console.error("Failed to load developer", error);
    }
  };

  fetchDeveloper();
}, [developerId]);

  // ================= MODAL HANDLERS =================
  const openModal = () => {
    setEditingId(null);
    form.resetFields();
    setLogoList([]);
    setPhotoList([]);
    setBrochureUrl(null);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const validateImageSize = (file) => {
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) message.error("Image must smaller than 2MB!");
    return isLt2M;
  };

  const handleSave = async (values) => {
    try {
      setFormLoading(true);
      
      // Photos & Logo URLs nikalna upload list se (Backend ke hisaab se adjust karein)
      const photos = photoList.map(p => p.response?.url || p.url).filter(Boolean);
      const mainLogo = logoList[0]?.response?.url || logoList[0]?.url || "";

      const payload = {
        ...values,
        developer: developerId,
        photos: photos,
        mainLogo: mainLogo,
        brochure: brochureUrl
      };

      // const response = await fetch("https://xoto.ae/api/property/create-properties", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${token}`
      //   },
      //   body: JSON.stringify(payload)
      // });
const data = await apiService.post(
  "/property/create-properties",
  payload
);

     if (data) {
  message.success("Property submitted. Waiting for admin approval.");
  closeModal();
  fetchProjects();
} else {
  message.error("Failed to save property");
}
    } catch (error) {
      console.error(error);
      message.error("Something went wrong");
    } finally {
      setFormLoading(false);
    }
  };

 const getColor = (status) => {

  if (status === "approved") return "green";
  if (status === "pending") return "orange";
  if (status === "rejected") return "red";

};

  // ================= TABLE COLUMNS =================
 // ================= TABLE COLUMNS =================
  const columns = [
    {
      title: "Property",
      dataIndex: "name",
      render: (name, record) => (
        <div>
          <Text strong style={{ fontSize: 15 }}>{name || "N/A"}</Text><br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.location}</Text>
        </div>
      )
    },
    { title: "Area Range", dataIndex: "units", render: (u) => <Text>{u}</Text> },
    { title: "Unit Types", dataIndex: "sold", render: (s) => <Tag color="purple">{s} Units</Tag> },
   {
  title: "Status",
  dataIndex: "status",
  render: (status, record) => (
    <div>
      <Tag color={getColor(status)}>
        {status?.toUpperCase()}
      </Tag>

      {status === "rejected" && record.rejectionReason && (
        <div style={{ marginTop: 6 }}>
          <Text type="danger">
            Reason: {record.rejectionReason}
          </Text>
        </div>
      )}
    </div>
  )
},
   {
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
            onClick={openModal} // Changed from navigate to openModal
          >
            Add Property
          </Button>
        </Col>
      </Row>

      {/* STATS + SEARCH */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={8}>
          <Card className="shadow-sm rounded-xl">
            <Statistic title="Total Properties" value={projects.length} prefix={<HomeOutlined style={{ color: "#6d28d9" }} />} />
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
      <Card className="shadow-sm rounded-xl" bodyStyle={{ padding: 0 }}>
        <Table columns={columns} dataSource={filtered} loading={tableLoading} pagination={{ pageSize: 10, style: { padding: "16px" } }} />
      </Card>

      {/* ================= ADD/EDIT PROPERTY MODAL ================= */}
      <Modal
        title={editingId ? "View / Edit Property" : "Add New Property"}
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        width={1000}
        style={{ top: 20, marginRight:60 }}
        
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            currency: 'AED', lengthUnit: 'ft', breadthUnit: 'ft', builtUpAreaUnit: 'sqft',
            transactionType: 'sell', propertySubType: 'off_plan', propertyType: 'Apartment',
            isAvailable: true, country: 'United Arab Emirates', state: 'Dubai', city: 'Dubai', postalCode: '00000',
            notReadyYet: true, isFeatured: false,
            commissionType: "percentage",
commissionValue: 3,
commissionStage: "booking",
            amenities: [], location_highlights: [], unitType: []
          }}
        >
          {/* --- SECTION 1: BASIC INFO --- */}
          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Basic Information</Divider>
          <Row gutter={16}>
            <Col xs={24} md={8}><Form.Item name="propertyName" label="Property Name" rules={[{ required: true }]}><Input /></Form.Item></Col>
       <Col xs={24} md={8}>
  <Form.Item label="Developer">
  <Input value={user?.email} disabled />
</Form.Item>
</Col>
            <Col xs={12} md={4}><Form.Item name="transactionType" label="Transaction"><Select><Option value="sell">Sell</Option><Option value="rent">Rent</Option></Select></Form.Item></Col>
            <Col xs={12} md={4}><Form.Item name="propertyType" label="Prop Type"><Input placeholder="e.g Apartment" /></Form.Item></Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={6}><Form.Item name="propertySubType" label="Sub Type"><Select><Option value="ready">Ready</Option><Option value="off_plan">Off Plan</Option><Option value="resale">Resale</Option></Select></Form.Item></Col>
            <Col xs={24} md={12}>
              <Form.Item name="unitType" label="Unit Types Available">
                <Select mode="tags" placeholder="Type and press enter (e.g. Studio, 1 bed)" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}><Form.Item name="handover" label="Handover Date"><DatePicker className="w-full" style={{ width: '100%' }} /></Form.Item></Col>
          </Row>

          <Form.Item name="description" label="Description"><TextArea rows={3} /></Form.Item>

          {/* --- SECTION 2: PRICING & PAYMENT --- */}
          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Pricing & Payment Plan</Divider>
          <Row gutter={16}>
            <Col xs={12} md={4}><Form.Item name="currency" label="Currency"><Select><Option value="AED">AED</Option><Option value="USD">USD</Option></Select></Form.Item></Col>
            <Col xs={12} md={5}><Form.Item name="price" label="Fixed Price"><InputNumber className="w-full" style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} /></Form.Item></Col>
            <Col xs={12} md={5}><Form.Item name="price_min" label="Min Price"><InputNumber className="w-full" style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} /></Form.Item></Col>
            <Col xs={12} md={5}><Form.Item name="price_max" label="Max Price"><InputNumber className="w-full" style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} /></Form.Item></Col>
            <Col xs={24} md={5}><Form.Item name="downPayment" label="Down Payment"><InputNumber className="w-full" style={{ width: '100%' }} suffix="%" /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col xs={12} md={12}><Form.Item name="paymentPlan_initialPercentage" label="Payment Plan (Initial %)"><InputNumber className="w-full" style={{ width: '100%' }} suffix="%" /></Form.Item></Col>
            <Col xs={12} md={12}><Form.Item name="paymentPlan_laterPercentage" label="Payment Plan (Later %)"><InputNumber className="w-full" style={{ width: '100%' }} suffix="%" /></Form.Item></Col>
          </Row>

          {/* --- SECTION: COMMISSION SCHEME --- */}
<Divider orientation="left" style={{ borderColor: THEME.primary }}>
  Commission Scheme
</Divider>

<Row gutter={16}>
  <Col xs={12} md={6}>
    <Form.Item name="commissionType" label="Commission Type">
      <Select placeholder="Select type">
        <Option value="percentage">Percentage (%)</Option>
        <Option value="fixed">Fixed Amount</Option>
      </Select>
    </Form.Item>
  </Col>

  <Col xs={12} md={6}>
    <Form.Item name="commissionValue" label="Commission Value">
      <InputNumber
        className="w-full"
        style={{ width: "100%" }}
        placeholder="Enter commission"
      />
    </Form.Item>
  </Col>

  <Col xs={12} md={6}>
    <Form.Item name="commissionStage" label="Commission Stage">
      <Select placeholder="When paid">
        <Option value="booking">On Booking</Option>
        <Option value="contract">On Contract</Option>
        <Option value="handover">On Handover</Option>
      </Select>
    </Form.Item>
  </Col>

  <Col xs={12} md={6}>
    <Form.Item name="commissionNotes" label="Commission Notes">
      <Input placeholder="Optional note" />
    </Form.Item>
  </Col>
</Row>

          {/* --- SECTION 3: CONFIGURATION --- */}
          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Area & Configuration</Divider>
          <Row gutter={16}>
            <Col xs={12} md={4}><Form.Item name="bedrooms" label="Bedrooms"><InputNumber className="w-full" style={{ width: '100%' }} /></Form.Item></Col>
            <Col xs={12} md={4}><Form.Item name="bathrooms" label="Bathrooms"><InputNumber className="w-full" style={{ width: '100%' }} /></Form.Item></Col>
            <Col xs={12} md={5}><Form.Item name="builtUpArea_min" label="Min Area (sqft)"><InputNumber className="w-full" style={{ width: '100%' }} /></Form.Item></Col>
            <Col xs={12} md={5}><Form.Item name="builtUpArea_max" label="Max Area (sqft)"><InputNumber className="w-full" style={{ width: '100%' }} /></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name="builtUpAreaUnit" label="Unit"><Select><Option value="sqft">Sq. Ft</Option><Option value="sqm">Sq. M</Option></Select></Form.Item></Col>
          </Row>
          <Row gutter={16}>
             <Col xs={12} md={6}><Form.Item name="length" label="Length"><InputNumber className="w-full" style={{ width: '100%' }} /></Form.Item></Col>
             <Col xs={12} md={6}><Form.Item name="lengthUnit" label="Unit"><Select><Option value="ft">ft</Option><Option value="m">m</Option></Select></Form.Item></Col>
             <Col xs={12} md={6}><Form.Item name="breadth" label="Breadth"><InputNumber className="w-full" style={{ width: '100%' }} /></Form.Item></Col>
             <Col xs={12} md={6}><Form.Item name="breadthUnit" label="Unit"><Select><Option value="ft">ft</Option><Option value="m">m</Option></Select></Form.Item></Col>
          </Row>

          {/* --- SECTION 4: LOCATION --- */}
          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Location Details</Divider>
          <Row gutter={16}>
            <Col xs={24} md={12}><Form.Item name="googleLocation" label="Google Maps Link"><Input placeholder="http://..." /></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name="buildingNo" label="Building / Plot No"><Input /></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name="street" label="Street"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col xs={12} md={6}><Form.Item name="area" label="Area"><Input /></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name="city" label="City"><Input /></Form.Item></Col>
            <Col xs={12} md={4}><Form.Item name="state" label="State"><Input /></Form.Item></Col>
            <Col xs={12} md={4}><Form.Item name="country" label="Country"><Input /></Form.Item></Col>
            <Col xs={12} md={4}><Form.Item name="postalCode" label="Zip Code"><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="location_highlights" label="Location Highlights">
            <Select mode="tags" placeholder="Add highlights (e.g. Near Metro, Beach Access)" />
          </Form.Item>

          {/* --- SECTION 5: MEDIA --- */}
          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Media & Assets</Divider>
          <Row gutter={16}>
            <Col xs={24} md={6}>
              <Form.Item label="Main Logo">
                <Upload
                  listType="picture-card"
                  fileList={logoList}
                  action={UPLOAD_API}
                  maxCount={1}
                  beforeUpload={validateImageSize}
                  onChange={({ fileList }) => setLogoList(fileList)}
                >
                   {logoList.length >= 1 ? null : <div><PlusOutlined /><div style={{ marginTop: 8 }}>Logo</div></div>}
                </Upload>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Property Photos">
                <Upload
                  listType="picture-card"
                  fileList={photoList}
                  action={UPLOAD_API}
                  multiple
                  beforeUpload={validateImageSize}
                  onChange={({ fileList }) => setPhotoList(fileList)}
                >
                   <div><PlusOutlined /><div style={{ marginTop: 8 }}>Add Photos</div></div>
                </Upload>
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item label="Brochure (PDF)">
                <Upload action={UPLOAD_API} name="file" maxCount={1} onChange={(info) => {
                  if (info.file.status === 'done') {
                    setBrochureUrl(info.file.response?.file?.url || info.file.response?.url);
                    message.success("Brochure linked!");
                  }
                }}>
                  <Button icon={<UploadOutlined />}>Upload PDF</Button>
                </Upload>
                {brochureUrl && <Text type="success" style={{ display: 'block', marginTop: 8 }}>Brochure Uploaded</Text>}
              </Form.Item>
            </Col>
          </Row>

          {/* --- SECTION 6: EXTRAS --- */}
          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Additional Details</Divider>
          <Form.Item name="amenities" label="Amenities">
             <Select mode="tags" placeholder="Add amenities (e.g. Pool, Gym, Parking)" />
          </Form.Item>
          <Form.Item name="about_developer" label="About Developer (Specific to project)"><TextArea rows={2} /></Form.Item>
         
          <Row gutter={16}>
            <Col xs={8}><Form.Item name="isAvailable" label="Available" valuePropName="checked"><Switch /></Form.Item></Col>
            <Col xs={8}><Form.Item name="notReadyYet" label="Construction (Not Ready)" valuePropName="checked"><Switch /></Form.Item></Col>
            <Col xs={8}><Form.Item name="isFeatured" label="Featured Property" valuePropName="checked"><Switch /></Form.Item></Col>
          </Row>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingBottom: '16px' }}>
            <Button onClick={closeModal} size="large">Cancel</Button>
            <Button type="primary" htmlType="submit" loading={formLoading} size="large" style={{ backgroundColor: THEME.primary }}>
               {editingId ? "Update Property" : "Save Property"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}