import React, { useState, useEffect } from 'react';
import { apiService } from '../../../../manageApi/utils/custom.apiservice'; 
import {
  Button, Form, Input, Card, Select, Typography, Row, Col, 
  Divider, message, notification, Switch, Upload, InputNumber, DatePicker, Modal
} from 'antd';
import {
  PlusOutlined, EnvironmentOutlined, ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const THEME = { primary: "#7c3aed", success: "#10b981", error: "#ef4444" };

const UPLOAD_API = "https://xoto.ae/api/upload";

// Base64 converter for Image Preview
const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const CreateSecondaryProperty = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [formLoading, setFormLoading] = useState(false);
  
  const [developers, setDevelopers] = useState([]);

  // --- 📸 ANT DESIGN FILE LIST STATES ---
  const [mainLogoList, setMainLogoList] = useState([]);
  const [architectureList, setArchitectureList] = useState([]);
  const [interiorList, setInteriorList] = useState([]);
  const [lobbyList, setLobbyList] = useState([]);
  const [otherList, setOtherList] = useState([]);

  // --- 🔍 PREVIEW MODAL STATES ---
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  // ================= 1. FETCH DEVELOPERS =================
  const fetchDevelopers = async () => {
    try {
      const res = await apiService.get("/property/get-all-developers");
      const list = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
      setDevelopers(list);
    } catch (err) {
      console.log("Failed to fetch developers", err);
    }
  };

  useEffect(() => { 
    fetchDevelopers(); 
  }, []);

  // ================= 2. IMAGE UPLOAD & PREVIEW HANDLERS =================
  const handleImageUpload = async ({ file, onSuccess, onError }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiService.upload(UPLOAD_API, formData);
      const uploadedUrl = response?.data?.file?.url || response?.data?.url || response?.file?.url || response?.url;

      if (uploadedUrl) {
        message.success(`${file.name} uploaded!`);
        // onSuccess me url pass karne se ye AntD ke file object ke 'response' me save ho jata hai
        onSuccess({ url: uploadedUrl }); 
      } else {
        throw new Error("No URL returned from API");
      }
    } catch (err) {
      console.error("Upload error:", err);
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

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  // Extract URL correctly from AntD File Object
  const extractUrl = (file) => file.url || file.response?.url;

  // ================= 3. CREATE SECONDARY PROPERTY API =================
  const handleSave = async (values) => {
    setFormLoading(true);
    try {
      const payload = {
        propertyName: values.propertyName,
        developerName: values.developerName,
        propertySubType: "secondary",
        transactionType: values.transactionType || "sell",
        projectOption: values.projectOption || "existing",
        unitNumber: values.unitNumber,
        floorNumber: Number(values.floorNumber),
        unitType: values.unitType,
        bedroomType: `${values.bedrooms}bed`, 
        bedrooms: Number(values.bedrooms),
        bathrooms: Number(values.bathrooms),
        
        builtUpArea: Number(values.builtUpArea),
        builtUpArea_min: Number(values.builtUpArea),
        builtUpArea_max: Number(values.builtUpArea),
        builtUpAreaUnit: "sqft",
        
        price: Number(values.price),
        price_min: Number(values.price),
        price_max: Number(values.price),
        currency: "AED",

        area: values.area,
        city: values.city,
        country: "UAE",
        description: values.description || "",
        furnishing: values.furnishing,
        ownershipType: values.ownershipType,
        projectStatus: values.projectStatus || "presale",

        hasView: values.viewType?.length > 0,
        viewType: values.viewType || [],
        parkingSpaces: Number(values.parkingSpaces || 0),

        shareCommission: values.shareCommission || false,
        shareCommissionPercentage: values.shareCommission ? Number(values.shareCommissionPercentage) : 0,

        coordinates: {
          lat: Number(values.lat || 25.1854), 
          lng: Number(values.lng || 55.2637)  
        },
        proximity: { airport: "", metro: "", mall: "", school: "" },

        facilities: {
          swimmingPool: values.facilities?.includes('swimmingPool') || false,
          gym: values.facilities?.includes('gym') || false,
          parking: values.facilities?.includes('parking') || false,
          childrenPlayArea: values.facilities?.includes('childrenPlayArea') || false,
          gardens: values.facilities?.includes('gardens') || false,
          security: values.facilities?.includes('security') || false,
          concierge: values.facilities?.includes('concierge') || false,
        },

        // ✅ EXTRACTING URLS FROM FILE LISTS
        mainLogo: mainLogoList.length > 0 ? extractUrl(mainLogoList[0]) : "",
        photos: {
          architecture: architectureList.map(extractUrl).filter(Boolean),
          interior: interiorList.map(extractUrl).filter(Boolean),
          lobby: lobbyList.map(extractUrl).filter(Boolean),
          other: otherList.map(extractUrl).filter(Boolean)
        },

        availableFrom: values.availableFrom ? values.availableFrom.toISOString() : null,
        completionDate: { quarter: null, year: null, fullDate: null },
        isAvailable: true,
        isFeatured: false,
      };

      const response = await apiService.post('/properties/agent/property/create-secondary', payload);

      if (response) {
        notification.success({
          message: 'Property Created',
          description: `Secondary listing ${values.propertyName} created successfully!`,
          placement: 'topRight'
        });
        navigate(-1); 
      }
    } catch (err) {
      message.error(err.response?.data?.message || err.message || "Failed to create property.");
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
          <Title level={3} style={{ margin: 0 }}>Create Secondary Property</Title>
          <Text type="secondary">Fill in the details to list a new resale property.</Text>
        </div>
      </div>

      {/* FORM CARD */}
      <Card bordered={false} className="shadow-md rounded-xl max-w-6xl mx-auto">
        <Form form={form} layout="vertical" onFinish={handleSave} initialValues={{ transactionType: 'sell', ownershipType: 'freehold', currency: 'AED' }}>
          
          {/* 1. BASIC DETAILS */}
          <Text strong className="text-gray-500 block mb-3 uppercase text-xs">Basic Details</Text>
          <Row gutter={16}>
             <Col xs={24} md={12}>
                <Form.Item name="propertyName" label="Property/Building Name" rules={[{ required: true }]}>
                    <Input size="large" placeholder="E.g. Luxury Tower Downtown" />
                </Form.Item>
             </Col>

             <Col xs={24} md={12}>
                <Form.Item name="developerName" label="Developer Name" rules={[{ required: true, message: 'Please select a developer' }]}>
                    <Select 
                      size="large"
                      showSearch 
                      placeholder="Search or Select Developer"
                      optionFilterProp="children"
                      allowClear
                    >
                      {developers.map(dev => (
                        <Option key={dev._id || dev.id} value={dev.name}>
                          {dev.name}
                        </Option>
                      ))}
                    </Select>
                </Form.Item>
             </Col>

             <Col xs={12} md={6}>
                <Form.Item name="unitType" label="Unit Type" rules={[{ required: true }]}>
                    <Select size="large" placeholder="Select">
                      <Option value="apartment">Apartment</Option>
                      <Option value="villa">Villa</Option>
                      <Option value="townhouse">Townhouse</Option>
                      <Option value="penthouse">Penthouse</Option>
                    </Select>
                </Form.Item>
             </Col>
             <Col xs={12} md={6}>
                <Form.Item name="ownershipType" label="Ownership">
                    <Select size="large">
                      <Option value="freehold">Freehold</Option>
                      <Option value="leasehold">Leasehold</Option>
                    </Select>
                </Form.Item>
             </Col>
             <Col xs={12} md={6}>
                <Form.Item name="unitNumber" label="Unit No." rules={[{ required: true }]}>
                    <Input size="large" placeholder="1508" />
                </Form.Item>
             </Col>
             <Col xs={12} md={6}>
                <Form.Item name="floorNumber" label="Floor No." rules={[{ required: true }]}>
                    <Input size="large" type="number" placeholder="15" />
                </Form.Item>
             </Col>
          </Row>

          <Divider style={{ margin: '10px 0 20px 0' }} />

          {/* 2. AREA, PRICE & CONFIGURATION */}
          <Text strong className="text-gray-500 block mb-3 uppercase text-xs">Area & Pricing</Text>
          <Row gutter={16}>
             <Col xs={12} md={6}>
                <Form.Item name="bedrooms" label="Bedrooms" rules={[{ required: true }]}>
                    <Input size="large" type="number" placeholder="2" />
                </Form.Item>
             </Col>
             <Col xs={12} md={6}>
                <Form.Item name="bathrooms" label="Bathrooms" rules={[{ required: true }]}>
                    <Input size="large" type="number" placeholder="2" />
                </Form.Item>
             </Col>
             <Col xs={12} md={6}>
                <Form.Item name="builtUpArea" label="Built Up Area (Sqft)" rules={[{ required: true }]}>
                    <Input size="large" type="number" placeholder="1250" />
                </Form.Item>
             </Col>
             <Col xs={12} md={6}>
                <Form.Item name="price" label="Price (AED)" rules={[{ required: true }]}>
                    <InputNumber size="large" className="w-full" formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} placeholder="1450000" />
                </Form.Item>
             </Col>
             <Col xs={12} md={6}>
                <Form.Item name="furnishing" label="Furnishing">
                    <Select size="large" placeholder="Select">
                      <Option value="unfurnished">Unfurnished</Option>
                      <Option value="semi_furnished">Semi Furnished</Option>
                      <Option value="furnished">Fully Furnished</Option>
                    </Select>
                </Form.Item>
             </Col>
             <Col xs={12} md={6}>
                <Form.Item name="availableFrom" label="Available From">
                    <DatePicker size="large" style={{ width: '100%' }} />
                </Form.Item>
             </Col>
             <Col xs={12} md={6}>
                <Form.Item name="shareCommission" label="Share Commission?" valuePropName="checked">
                    <Switch />
                </Form.Item>
             </Col>
             <Form.Item noStyle dependencies={['shareCommission']}>
                {({ getFieldValue }) => getFieldValue('shareCommission') && (
                  <Col xs={12} md={6}>
                    <Form.Item name="shareCommissionPercentage" label="Comm. %">
                        <InputNumber size="large" max={100} min={0} suffix="%" style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                )}
             </Form.Item>
          </Row>

          <Divider style={{ margin: '10px 0 20px 0' }} />

          {/* 3. LOCATION & AMENITIES */}
          <Text strong className="text-gray-500 block mb-3 uppercase text-xs">Location & Amenities</Text>
          <Row gutter={16}>
             <Col xs={12} md={8}>
                <Form.Item name="area" label="Community / Area" rules={[{ required: true }]}>
                    <Input size="large" prefix={<EnvironmentOutlined className="text-gray-400" />} placeholder="Business Bay" />
                </Form.Item>
             </Col>
             <Col xs={12} md={8}>
                <Form.Item name="city" label="City" rules={[{ required: true }]}>
                    <Input size="large" placeholder="Dubai" />
                </Form.Item>
             </Col>
             <Col xs={12} md={4}>
                <Form.Item name="lat" label="Latitude">
                    <Input size="large" placeholder="25.1854" />
                </Form.Item>
             </Col>
             <Col xs={12} md={4}>
                <Form.Item name="lng" label="Longitude">
                    <Input size="large" placeholder="55.2637" />
                </Form.Item>
             </Col>

             <Col xs={24} md={12}>
                <Form.Item name="viewType" label="View Types">
                    <Select size="large" mode="multiple" placeholder="City View, Landmark...">
                      <Option value="city">City View</Option>
                      <Option value="sea">Sea View</Option>
                      <Option value="landmark">Landmark View</Option>
                    </Select>
                </Form.Item>
             </Col>
             <Col xs={24} md={12}>
                <Form.Item name="facilities" label="Facilities">
                    <Select size="large" mode="multiple" placeholder="Select facilities...">
                      <Option value="swimmingPool">Swimming Pool</Option>
                      <Option value="gym">Gym</Option>
                      <Option value="parking">Parking</Option>
                      <Option value="childrenPlayArea">Play Area</Option>
                      <Option value="security">Security</Option>
                    </Select>
                </Form.Item>
             </Col>
             <Col span={24}>
                <Form.Item name="description" label="Description" rules={[{ required: true }]}>
                    <TextArea rows={4} placeholder="Describe the property..." />
                </Form.Item>
             </Col>
          </Row>

          <Divider style={{ margin: '10px 0 20px 0' }} />

          {/* 4. IMAGES UPLOAD (WITH THUMBNAILS) */}
          <Text strong className="text-gray-500 block mb-3 uppercase text-xs">Media Uploads</Text>
          <Row gutter={16}>
             
             {/* Main Logo */}
             <Col xs={24} md={6}>
               <Form.Item label="Main Logo">
                 <Upload 
                    listType="picture-card" 
                    fileList={mainLogoList}
                    onChange={({ fileList }) => setMainLogoList(fileList)}
                    customRequest={handleImageUpload}
                    onPreview={handlePreview}
                  >
                    {mainLogoList.length >= 1 ? null : uploadButton}
                 </Upload>
               </Form.Item>
             </Col>
             
             {/* Architecture Photos */}
             <Col xs={24} md={6}>
               <Form.Item label="Architecture Photos">
                 <Upload 
                    listType="picture-card" 
                    multiple
                    fileList={architectureList}
                    onChange={({ fileList }) => setArchitectureList(fileList)}
                    customRequest={handleImageUpload}
                    onPreview={handlePreview}
                  >
                    {uploadButton}
                 </Upload>
               </Form.Item>
             </Col>

             {/* Interior Photos */}
             <Col xs={24} md={6}>
               <Form.Item label="Interior Photos">
                 <Upload 
                    listType="picture-card" 
                    multiple
                    fileList={interiorList}
                    onChange={({ fileList }) => setInteriorList(fileList)}
                    customRequest={handleImageUpload}
                    onPreview={handlePreview}
                  >
                    {uploadButton}
                 </Upload>
               </Form.Item>
             </Col>

             {/* Lobby & Other Photos */}
             <Col xs={24} md={6}>
               <Form.Item label="Lobby Photos">
                 <Upload 
                    listType="picture-card" 
                    multiple
                    fileList={lobbyList}
                    onChange={({ fileList }) => setLobbyList(fileList)}
                    customRequest={handleImageUpload}
                    onPreview={handlePreview}
                  >
                    {uploadButton}
                 </Upload>
               </Form.Item>
             </Col>

             <Col xs={24} md={6}>
               <Form.Item label="Other Amenities Photos">
                 <Upload 
                    listType="picture-card" 
                    multiple
                    fileList={otherList}
                    onChange={({ fileList }) => setOtherList(fileList)}
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
            <Button size="large" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={formLoading} size="large" style={{ backgroundColor: THEME.primary, borderColor: THEME.primary }}>
              Publish Secondary Listing
            </Button>
          </div>
        </Form>
      </Card>

      {/* 🖼️ IMAGE PREVIEW MODAL */}
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

export default CreateSecondaryProperty;