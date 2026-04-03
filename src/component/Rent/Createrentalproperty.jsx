import { useParams, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { apiService } from '../../manageApi/utils/custom.apiservice';
import {
  Button, Form, Input, Card, Select, Typography, Row, Col,
  Divider, message, notification, Switch, Upload, InputNumber,
  DatePicker, Modal, Spin, Tag, Checkbox
} from 'antd';
import {
  PlusOutlined, EnvironmentOutlined, ArrowLeftOutlined,
  HomeOutlined, DollarOutlined, CalendarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const THEME = { primary: "#7c3aed", success: "#10b981", error: "#ef4444" };
const UPLOAD_API = "https://xoto.ae/api/upload";

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const AMENITIES_OPTIONS = [
  "Pool", "Gym", "Parking", "Sea View", "Balcony",
  "Chiller Free", "WiFi", "Near Metro", "DEWA Included",
  "Kids Play Area", "Maid's Room"
];

const CreateRentalProperty = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [form] = Form.useForm();
  const [formLoading, setFormLoading] = useState(false);

  // Image lists
  const [imageList, setImageList] = useState([]);

  // Preview modal
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  // ================= FETCH FOR EDIT =================
  useEffect(() => {
    if (isEditMode) fetchPropertyById();
  }, []);

  const fetchPropertyById = async () => {
    try {
      setFormLoading(true);
      const res = await apiService.get(`/rental/property/${id}`);
      const data = res?.data?.data || res?.data || res;
      if (!data) return;

      form.setFieldsValue({
        title: data.title || "",
        description: data.description || "",
        emirate: data.emirate || "",
        address: data.location?.address || "",
        area: data.location?.area || "",
        city: data.location?.city || "",
        price: data.price || "",
        monthly: data.monthly || 0,
        deposit: data.deposit || 0,
        type: data.type || undefined,
        bhk: data.bhk || "",
        size: data.size || "",
        baths: data.baths || "",
        furnishing: data.furnishing || undefined,
        tenants: data.tenants || "",
        availableFrom: data.availableFrom ? dayjs(data.availableFrom) : null,
        isImmediate: data.isImmediate ?? true,
        amenities: data.amenities || [],
        verified: data.verified || false,
        ejari: data.ejari || false,
        owner: data.owner || "",
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
    } catch (err) {
      message.error("Failed to load property for editing.");
    } finally {
      setFormLoading(false);
    }
  };

  // ================= IMAGE UPLOAD =================
  const handleImageUpload = async ({ file, onSuccess, onError }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiService.upload(UPLOAD_API, formData);
      const uploadedUrl =
        response?.data?.file?.url ||
        response?.data?.url ||
        response?.file?.url ||
        response?.url;
      if (uploadedUrl) {
        message.success(`${file.name} uploaded!`);
        onSuccess({ url: uploadedUrl });
      } else {
        throw new Error("No URL returned from API");
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

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  // ================= SUBMIT =================
  const handleSave = async (values) => {
    if (imageList.length === 0) {
      message.error("Please upload at least one image.");
      return;
    }

    setFormLoading(true);
    try {
      const payload = {
        title: values.title,
        description: values.description || "",
        emirate: values.emirate,
        location: {
          address: values.address || "",
          area: values.area,
          city: values.city,
        },
        price: Number(values.price),
        monthly: Number(values.monthly || 0),
        deposit: Number(values.deposit || 0),
        type: values.type,
        bhk: values.bhk || "",
        size: Number(values.size || 0),
        baths: Number(values.baths || 0),
        furnishing: values.furnishing || "Unfurnished",
        tenants: values.tenants || "",
        availableFrom: values.availableFrom
          ? values.availableFrom.toISOString()
          : null,
        isImmediate: values.isImmediate ?? true,
        amenities: values.amenities || [],
        images: imageList.map(extractUrl).filter(Boolean),
        verified: values.verified || false,
        ejari: values.ejari || false,
        owner: values.owner || "",
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
      message.error(
        err.response?.data?.message || err.message || "Failed to save property."
      );
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">

      {/* PAGE HEADER */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="border-gray-300"
        />
        <div>
          <Title level={3} style={{ margin: 0 }}>
            {isEditMode ? 'Edit Rental Property' : 'Create Rental Property'}
          </Title>
          <Text type="secondary">
            {isEditMode
              ? 'Update the details of this rental listing.'
              : 'Fill in the details to list a new rental property.'}
          </Text>
        </div>
      </div>

      {/* ================= MAIN FORM CARD ================= */}
      <Card bordered={false} className="shadow-md rounded-xl max-w-6xl mx-auto">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            furnishing: 'Unfurnished',
            isImmediate: true,
            verified: false,
            ejari: false,
            monthly: 0,
            deposit: 0,
          }}
        >

          {/* 1. BASIC DETAILS */}
          <Text strong className="text-gray-500 block mb-3 uppercase text-xs">
            Basic Details
          </Text>
          <Row gutter={16}>
            <Col xs={24} md={16}>
              <Form.Item
                name="title"
                label="Listing Title"
                rules={[{ required: true, message: 'Title is required' }]}
              >
                <Input
                  size="large"
                  placeholder="E.g. Luxury 3BR Apartment — Marina Walk"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="type"
                label="Property Type"
                rules={[{ required: true, message: 'Type is required' }]}
              >
                <Select size="large" placeholder="Select type">
                  <Option value="Apartment">Apartment</Option>
                  <Option value="Villa">Villa</Option>
                  <Option value="Penthouse">Penthouse</Option>
                  <Option value="Townhouse">Townhouse</Option>
                  <Option value="Studio">Studio</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item
                name="bhk"
                label="BHK / Bedrooms"
              >
                <Select size="large" placeholder="Select">
                  <Option value="Studio">Studio</Option>
                  <Option value="1 BR">1 BR</Option>
                  <Option value="2 BR">2 BR</Option>
                  <Option value="3 BR">3 BR</Option>
                  <Option value="4 BR">4 BR</Option>
                  <Option value="5+ BR">5+ BR</Option>
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
                  <Option value="Fully Furnished">Fully Furnished</Option>
                  <Option value="Semi Furnished">Semi Furnished</Option>
                  <Option value="Unfurnished">Unfurnished</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="tenants" label="Preferred Tenants">
                <Select size="large" placeholder="Select" allowClear>
                  <Option value="Family">Family</Option>
                  <Option value="Bachelor">Bachelor</Option>
                  <Option value="Any">Any</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="description" label="Description">
                <TextArea rows={3} placeholder="Describe the property..." />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '10px 0 20px 0' }} />

          {/* 2. PRICING */}
          <Text strong className="text-gray-500 block mb-3 uppercase text-xs">
            <DollarOutlined style={{ marginRight: 6 }} />
            Pricing
          </Text>
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

          <Divider style={{ margin: '10px 0 20px 0' }} />

          {/* 3. AVAILABILITY */}
          <Text strong className="text-gray-500 block mb-3 uppercase text-xs">
            <CalendarOutlined style={{ marginRight: 6 }} />
            Availability
          </Text>
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

          <Divider style={{ margin: '10px 0 20px 0' }} />

          {/* 4. LOCATION */}
          <Text strong className="text-gray-500 block mb-3 uppercase text-xs">
            <EnvironmentOutlined style={{ marginRight: 6 }} />
            Location
          </Text>
          <Row gutter={16}>
            <Col xs={12} md={8}>
              <Form.Item
                name="emirate"
                label="Emirate"
                rules={[{ required: true, message: 'Emirate is required' }]}
              >
                <Select size="large" placeholder="Select Emirate">
                  <Option value="Dubai">Dubai</Option>
                  <Option value="Abu Dhabi">Abu Dhabi</Option>
                  <Option value="Sharjah">Sharjah</Option>
                  <Option value="Ajman">Ajman</Option>
                  <Option value="Ras Al Khaimah">Ras Al Khaimah</Option>
                  <Option value="Fujairah">Fujairah</Option>
                  <Option value="Umm Al Quwain">Umm Al Quwain</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item
                name="area"
                label="Community / Area"
                rules={[{ required: true, message: 'Area is required' }]}
              >
                <Input
                  size="large"
                  prefix={<EnvironmentOutlined className="text-gray-400" />}
                  placeholder="Dubai Marina"
                />
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item
                name="city"
                label="City"
                rules={[{ required: true, message: 'City is required' }]}
              >
                <Input size="large" placeholder="Dubai" />
              </Form.Item>
            </Col>
            <Col xs={24} md={16}>
              <Form.Item name="address" label="Full Address">
                <Input
                  size="large"
                  prefix={<HomeOutlined className="text-gray-400" />}
                  placeholder="Marina Walk, near Dubai Marina Mall"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '10px 0 20px 0' }} />

          {/* 5. AMENITIES */}
          <Text strong className="text-gray-500 block mb-3 uppercase text-xs">
            Amenities
          </Text>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="amenities">
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
            </Col>
          </Row>

          <Divider style={{ margin: '10px 0 20px 0' }} />

          {/* 6. FLAGS & OWNER */}
          <Text strong className="text-gray-500 block mb-3 uppercase text-xs">
            Verification & Owner
          </Text>
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

          <Divider style={{ margin: '10px 0 20px 0' }} />

          {/* 7. IMAGES */}
          <Text strong className="text-gray-500 block mb-3 uppercase text-xs">
            Property Images
          </Text>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label={
                  <span>
                    Images{' '}
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      (At least 1 required)
                    </Text>
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
                  {uploadButton}
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
            <Button size="large" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={formLoading}
              size="large"
              style={{ backgroundColor: THEME.primary, borderColor: THEME.primary }}
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
        <img
          alt="preview"
          style={{ width: '100%', borderRadius: 8 }}
          src={previewImage}
        />
      </Modal>
    </div>
  );
};

export default CreateRentalProperty;