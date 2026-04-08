import { useParams, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { apiService } from '../../manageApi/utils/custom.apiservice';
import {
  Button, Form, Input, Card, Select, Typography, Row, Col,
  Divider, message, notification, Switch, Upload, InputNumber,
  DatePicker, Modal, Tag, Checkbox
} from 'antd';
import {
  PlusOutlined, EnvironmentOutlined, ArrowLeftOutlined,
  HomeOutlined, DollarOutlined, CalendarOutlined, SearchOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const THEME = { primary: "#7c3aed", success: "#10b981", error: "#ef4444" };
const UPLOAD_API = "https://xoto.ae/api/upload";

// ─── Complete UAE Areas (mirrors HeroRent) ───────────────────────────────────
const UAE_AREAS = {
  Dubai: [
    "Dubai Marina", "Downtown Dubai", "JBR – Jumeirah Beach Residence", "Palm Jumeirah",
    "Business Bay", "DIFC – Dubai International Financial Centre", "JVC – Jumeirah Village Circle",
    "Al Barsha", "Deira", "Bur Dubai", "Jumeirah", "Al Quoz", "Al Nahda (Dubai)",
    "Mirdif", "Silicon Oasis", "Sports City", "Motor City", "Al Furjan",
    "Discovery Gardens", "International City", "The Greens", "The Views",
    "Emirates Hills", "Arabian Ranches", "Mudon", "Damac Hills", "Town Square",
    "Al Warqa", "Oud Metha", "Karama", "Satwa", "Al Mankhool", "Rashidiya",
    "Al Garhoud", "Festival City", "Creek Harbour", "Dubai Hills Estate",
    "Bluewaters Island", "Port De La Mer", "La Mer", "Madinat Jumeirah Living",
    "Sobha Hartland", "Mohammed Bin Rashid City", "Tilal Al Ghaf", "The Sustainable City",
  ],
  "Abu Dhabi": [
    "Corniche Road", "Al Reem Island", "Yas Island", "Saadiyat Island",
    "Khalifa City A", "Khalifa City B", "Al Nahyan", "Masdar City",
    "Tourist Club Area (TCA)", "Al Khalidiyah", "Al Muroor", "Al Mushrif",
    "Al Bateen", "Al Manhal", "Al Karamah", "Al Shamkhah", "Mohamed Bin Zayed City",
    "Mussafah", "Al Reef", "Al Ghadeer", "Hydra Village", "Al Samha",
    "Shakhbout City", "Zayed City", "Al Raha Beach", "Al Raha Gardens",
    "Yas Acres", "Bloom Gardens", "Golf Gardens", "Rawdhat Abu Dhabi",
    "Al Wathba", "Al Falah", "Baniyas", "Al Shahama", "Ghantoot",
  ],
  Sharjah: [
    "Al Nahda (Sharjah)", "Al Majaz", "Al Taawun", "Al Qasimia",
    "Muwaileh Commercial", "Al Khan", "Al Mamzar (Sharjah Side)",
    "Al Wahda", "Al Yarmook", "Abu Shagara", "Al Butina", "Al Jubail",
    "Al Azra", "Al Ramla", "Halwan Suburb", "Rolla Area",
    "Industrial Area 1–18", "Al Saja'a", "Al Heerah", "University City Sharjah",
    "Aljada", "Tilal City", "Muwaileh", "Sharjah Waterfront City",
    "Al Zahia", "Al Tai", "Al Rahmaniya", "Khor Fakkan (Sharjah)",
  ],
  Ajman: [
    "Al Nuaimiya 1", "Al Nuaimiya 2", "Al Nuaimiya 3",
    "Al Rashidiya 1", "Al Rashidiya 2", "Al Rashidiya 3",
    "Al Jurf 1", "Al Jurf 2", "Al Jurf 3",
    "Emirates City", "Al Rawda 1", "Al Rawda 2", "Al Rawda 3",
    "Garden City", "Al Rumaila", "Al Corniche Ajman", "Ajman Downtown",
    "Al Mowaihat", "Al Hamidiya", "Al Tallah", "Al Sawan",
    "Al Zahya", "Al Ameera Village", "Ajman Uptown",
  ],
  "Ras Al Khaimah": [
    "Al Nakheel", "Al Hamra Village", "Mina Al Arab", "Al Qawasim Corniche",
    "Al Dhait South", "Al Dhait North", "Al Mamourah", "Al Uraibi",
    "Al Jeer", "Dafan Al Nakheel", "Al Mairid", "Sidroh",
    "Khuzam", "Al Aziziyah", "RAK City Centre Area",
    "Julphar Towers Area", "Al Rifaa", "Wadi Asfar",
  ],
  Fujairah: [
    "Fujairah City Centre", "Merashid", "Dibba Al Fujairah",
    "Khor Fakkan", "Kalba", "Al Faseel", "Al Gurfa",
    "Sakamkam", "Mirbah", "Al Aqah", "Masafi",
    "Qidfa", "Murbih", "Al Bithnah",
  ],
  "Umm Al Quwain": [
    "UAQ City Centre", "Al Salama", "Al Hayl", "Al Masfout",
    "Al Dour", "Al Rafaah", "Falaj Al Mualla",
    "Al Salam (UAQ)", "Industrial Area UAQ",
  ],
};

const EMIRATES = Object.keys(UAE_AREAS);

// City defaults per emirate
const EMIRATE_CITY = {
  Dubai: "Dubai",
  "Abu Dhabi": "Abu Dhabi",
  Sharjah: "Sharjah",
  Ajman: "Ajman",
  "Ras Al Khaimah": "Ras Al Khaimah",
  Fujairah: "Fujairah",
  "Umm Al Quwain": "Umm Al Quwain",
};

const AMENITIES_OPTIONS = [
  "Pool", "Gym", "Parking", "Sea View", "Balcony",
  "Chiller Free", "WiFi", "Near Metro", "DEWA Included",
  "Kids Play Area", "Maid's Room",
];

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

// ─── Section header ──────────────────────────────────────────────────────────
const SectionLabel = ({ icon, label }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 7,
    fontSize: 11, fontWeight: 700, color: '#6b7280',
    textTransform: 'uppercase', letterSpacing: '0.07em',
    marginBottom: 14,
  }}>
    {icon && <span style={{ color: THEME.primary, fontSize: 13 }}>{icon}</span>}
    {label}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

const CreateRentalProperty = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [form] = Form.useForm();
  const [formLoading, setFormLoading] = useState(false);
  const [selectedEmirate, setSelectedEmirate] = useState('');

  const [imageList, setImageList] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  // ── FETCH FOR EDIT ────────────────────────────────────────────────────────
  useEffect(() => {
    if (isEditMode) fetchPropertyById();
  }, []);

  const fetchPropertyById = async () => {
    try {
      setFormLoading(true);
      const res = await apiService.get(`/rental/property/${id}`);
      const data = res?.data?.data || res?.data || res;
      if (!data) return;

      const emirate = data.emirate || '';
      setSelectedEmirate(emirate);

      form.setFieldsValue({
        title: data.title || '',
        description: data.description || '',
        emirate,
        address: data.location?.address || '',
        area: data.location?.area || '',
        city: data.location?.city || '',
        price: data.price || '',
        monthly: data.monthly || 0,
        deposit: data.deposit || 0,
        type: data.type || undefined,
        bhk: data.bhk || '',
        size: data.size || '',
        baths: data.baths || '',
        furnishing: data.furnishing || undefined,
        tenants: data.tenants || '',
        availableFrom: data.availableFrom ? dayjs(data.availableFrom) : null,
        isImmediate: data.isImmediate ?? true,
        amenities: data.amenities || [],
        verified: data.verified || false,
        ejari: data.ejari || false,
        owner: data.owner || '',
      });

      if (data.images?.length > 0) {
        setImageList(
          data.images.map((url, i) => ({
            uid: `-img-${i}`,
            name: `image-${i + 1}`,
            status: 'done',
            url,
          }))
        );
      }
    } catch {
      message.error('Failed to load property for editing.');
    } finally {
      setFormLoading(false);
    }
  };

  // ── When emirate changes, clear area and auto-fill city ──────────────────
  const handleEmirateChange = (value) => {
    setSelectedEmirate(value);
    form.setFieldsValue({
      area: undefined,
      city: EMIRATE_CITY[value] || '',
    });
  };

  // ── IMAGE UPLOAD ──────────────────────────────────────────────────────────
  const handleImageUpload = async ({ file, onSuccess, onError }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiService.upload(UPLOAD_API, formData);
      const uploadedUrl =
        response?.data?.file?.url || response?.data?.url ||
        response?.file?.url || response?.url;
      if (uploadedUrl) {
        message.success(`${file.name} uploaded!`);
        onSuccess({ url: uploadedUrl });
      } else {
        throw new Error('No URL returned from API');
      }
    } catch (err) {
      message.error(`Upload failed for ${file.name}`);
      onError(err);
    }
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
  };

  const extractUrl = (file) => file.url || file.response?.url;

  // ── SUBMIT ────────────────────────────────────────────────────────────────
  const handleSave = async (values) => {
    if (imageList.length === 0) {
      message.error('Please upload at least one image.');
      return;
    }
    setFormLoading(true);
    try {
      const payload = {
        title: values.title,
        description: values.description || '',
        emirate: values.emirate,
        location: {
          address: values.address || '',
          area: values.area,
          city: values.city,
        },
        price: Number(values.price),
        monthly: Number(values.monthly || 0),
        deposit: Number(values.deposit || 0),
        type: values.type,
        bhk: values.bhk || '',
        size: Number(values.size || 0),
        baths: Number(values.baths || 0),
        furnishing: values.furnishing || 'Unfurnished',
        tenants: values.tenants || '',
        availableFrom: values.availableFrom ? values.availableFrom.toISOString() : null,
        isImmediate: values.isImmediate ?? true,
        amenities: values.amenities || [],
        images: imageList.map(extractUrl).filter(Boolean),
        verified: values.verified || false,
        ejari: values.ejari || false,
        owner: values.owner || '',
      };

      const response = isEditMode
        ? await apiService.put(`/rental/property/${id}`, payload)
        : await apiService.post('/rental/property/create', payload);

      if (response) {
        notification.success({
          message: isEditMode ? 'Property Updated' : 'Property Created',
          description: `Rental listing "${values.title}" ${isEditMode ? 'updated' : 'created'} successfully!`,
          placement: 'topRight',
        });
        navigate(-1);
      }
    } catch (err) {
      message.error(err.response?.data?.message || err.message || 'Failed to save property.');
    } finally {
      setFormLoading(false);
    }
  };

  const areaOptions = selectedEmirate ? (UAE_AREAS[selectedEmirate] || []) : [];

  return (
    <div style={{ padding: '24px 28px', background: '#f8f9fb', minHeight: '100vh' }}>

      {/* ── PAGE HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
        <div>
          <Title level={4} style={{ margin: 0, color: '#111827' }}>
            {isEditMode ? 'Edit Rental Property' : 'Create Rental Property'}
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {isEditMode
              ? 'Update the details of this rental listing.'
              : 'Fill in the details to list a new rental property.'}
          </Text>
        </div>
      </div>

      {/* ── FORM CARD ── */}
      <Card
        bordered={false}
        style={{
          maxWidth: 960,
          margin: '0 auto',
          borderRadius: 16,
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          border: '1px solid #e5e7eb',
        }}
        bodyStyle={{ padding: '28px 32px' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          requiredMark={false}
          initialValues={{
            furnishing: 'Unfurnished',
            isImmediate: true,
            verified: false,
            ejari: false,
            monthly: 0,
            deposit: 0,
          }}
        >

          {/* ─── 1. BASIC DETAILS ─────────────────────────────────────────── */}
          <SectionLabel icon={<HomeOutlined />} label="Basic Details" />
          <Row gutter={16}>
            <Col xs={24} md={16}>
              <Form.Item
                name="title"
                label="Listing Title"
                rules={[{ required: true, message: 'Title is required' }]}
              >
                <Input size="large" placeholder="E.g. Luxury 3BR Apartment — Marina Walk" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="type"
                label="Property Type"
                rules={[{ required: true, message: 'Type is required' }]}
              >
                <Select size="large" placeholder="Select type">
                  {['Apartment', 'Villa', 'Penthouse', 'Townhouse', 'Studio'].map((t) => (
                    <Option key={t} value={t}>{t}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="bhk" label="BHK / Bedrooms">
                <Select size="large" placeholder="Select">
                  {['Studio', '1 BR', '2 BR', '3 BR', '4 BR', '5+ BR'].map((b) => (
                    <Option key={b} value={b}>{b}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="baths" label="Bathrooms">
                <Input size="large" type="number" placeholder="2" />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="size" label="Size (Sqft)">
                <Input size="large" type="number" placeholder="1150" />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="furnishing" label="Furnishing">
                <Select size="large" placeholder="Select">
                  {['Fully Furnished', 'Semi Furnished', 'Unfurnished'].map((f) => (
                    <Option key={f} value={f}>{f}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="tenants" label="Preferred Tenants">
                <Select size="large" placeholder="Select" allowClear>
                  {['Family', 'Bachelor', 'Any'].map((t) => (
                    <Option key={t} value={t}>{t}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="description" label="Description">
                <TextArea rows={3} placeholder="Describe the property..." style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '8px 0 20px' }} />

          {/* ─── 2. PRICING ───────────────────────────────────────────────── */}
          <SectionLabel icon={<DollarOutlined />} label="Pricing" />
          <Row gutter={16}>
            <Col xs={12} md={8}>
              <Form.Item
                name="price"
                label="Annual Rent (AED)"
                rules={[{ required: true, message: 'Price is required' }]}
              >
                <InputNumber
                  size="large"
                  style={{ width: '100%' }}
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  placeholder="120000"
                />
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="monthly" label="Monthly Rent (AED)">
                <InputNumber
                  size="large"
                  style={{ width: '100%' }}
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  placeholder="10000"
                />
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="deposit" label="Security Deposit (AED)">
                <InputNumber
                  size="large"
                  style={{ width: '100%' }}
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  placeholder="10000"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '8px 0 20px' }} />

          {/* ─── 3. AVAILABILITY ──────────────────────────────────────────── */}
          <SectionLabel icon={<CalendarOutlined />} label="Availability" />
          <Row gutter={16}>
            <Col xs={12} md={8}>
              <Form.Item name="availableFrom" label="Available From">
                <DatePicker size="large" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={12} md={4}>
              <Form.Item name="isImmediate" label="Immediate?" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '8px 0 20px' }} />

          {/* ─── 4. LOCATION ──────────────────────────────────────────────── */}
          <SectionLabel icon={<EnvironmentOutlined />} label="Location" />
          <Row gutter={16}>
            {/* Emirate */}
            <Col xs={24} md={8}>
              <Form.Item
                name="emirate"
                label="Emirate"
                rules={[{ required: true, message: 'Emirate is required' }]}
              >
                <Select
                  size="large"
                  placeholder="Select Emirate"
                  onChange={handleEmirateChange}
                >
                  {EMIRATES.map((em) => (
                    <Option key={em} value={em}>{em}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* Area — searchable dropdown, populated from selected emirate */}
            <Col xs={24} md={8}>
              <Form.Item
                name="area"
                label={
                  <span>
                    Community / Area
                    {!selectedEmirate && (
                      <Text type="secondary" style={{ fontSize: 11, marginLeft: 6 }}>
                        (select emirate first)
                      </Text>
                    )}
                  </span>
                }
                rules={[{ required: true, message: 'Area is required' }]}
              >
                <Select
                  size="large"
                  showSearch
                  placeholder={
                    !selectedEmirate
                      ? 'Select an emirate first…'
                      : 'Search or select area…'
                  }
                  disabled={!selectedEmirate}
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  suffixIcon={<SearchOutlined style={{ color: '#9ca3af' }} />}
                  notFoundContent="No areas found"
                  style={{ width: '100%' }}
                >
                  {areaOptions.map((area) => (
                    <Option key={area} value={area} label={area}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <EnvironmentOutlined style={{ color: '#a855f7', fontSize: 12 }} />
                        {area}
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* City — auto-filled but editable */}
            <Col xs={24} md={8}>
              <Form.Item
                name="city"
                label="City"
                rules={[{ required: true, message: 'City is required' }]}
              >
                <Input size="large" placeholder="Dubai" />
              </Form.Item>
            </Col>

            {/* Full address */}
            <Col xs={24} md={16}>
              <Form.Item name="address" label="Full Address">
                <Input
                  size="large"
                  prefix={<HomeOutlined style={{ color: '#9ca3af' }} />}
                  placeholder="Marina Walk, near Dubai Marina Mall"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '8px 0 20px' }} />

          {/* ─── 5. AMENITIES ─────────────────────────────────────────────── */}
          <SectionLabel label="Amenities" />
          <Form.Item name="amenities" style={{ marginBottom: 0 }}>
            <Checkbox.Group style={{ width: '100%' }}>
              <Row gutter={[12, 10]}>
                {AMENITIES_OPTIONS.map((amenity) => (
                  <Col xs={12} sm={8} md={6} key={amenity}>
                    <Checkbox value={amenity}>{amenity}</Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>

          <Divider style={{ margin: '20px 0' }} />

          {/* ─── 6. VERIFICATION & OWNER ──────────────────────────────────── */}
          <SectionLabel label="Verification & Owner" />
          <Row gutter={16}>
            <Col xs={12} md={4}>
              <Form.Item name="verified" label="Verified?" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={12} md={4}>
              <Form.Item name="ejari" label="Ejari?" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="owner" label="Owner (ID / Name)">
                <Input size="large" placeholder="Owner ID or name" />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '8px 0 20px' }} />

          {/* ─── 7. IMAGES ────────────────────────────────────────────────── */}
          <SectionLabel label="Property Images" />
          <Form.Item
            label={
              <span>
                Images{' '}
                <Text type="secondary" style={{ fontSize: 12 }}>(At least 1 required)</Text>
              </span>
            }
          >
            <Upload
              listType="picture-card"
              multiple
              fileList={imageList}
              onChange={({ fileList }) => setImageList(fileList)}
              customRequest={handleImageUpload}
              onPreview={handlePreview}
            >
              {imageList.length >= 20 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          {/* ── ACTIONS ── */}
          <div style={{
            display: 'flex', justifyContent: 'flex-end', gap: 10,
            paddingTop: 20, marginTop: 8, borderTop: '1px solid #f3f4f6',
          }}>
            <Button size="large" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={formLoading}
              size="large"
              style={{ backgroundColor: THEME.primary, borderColor: THEME.primary, minWidth: 180 }}
            >
              {isEditMode ? 'Update Rental Listing' : 'Publish Rental Listing'}
            </Button>
          </div>

        </Form>
      </Card>

      {/* IMAGE PREVIEW MODAL */}
      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        centered
      >
        <img alt="preview" style={{ width: '100%', borderRadius: 8 }} src={previewImage} />
      </Modal>
    </div>
  );
};

export default CreateRentalProperty;