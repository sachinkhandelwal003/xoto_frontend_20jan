import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux'; 
import React, { useState, useEffect } from 'react';
import { apiService } from '../../manageApi/utils/custom.apiservice';
import {
  Button, Form, Input, Card, Select, Typography, Row, Col,
  Divider, message, notification, Switch, Upload, InputNumber,
  DatePicker, Modal, Checkbox,
} from 'antd';
import {
  PlusOutlined, EnvironmentOutlined, ArrowLeftOutlined,
  HomeOutlined, DollarOutlined, CalendarOutlined, SearchOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const THEME = { primary: '#7c3aed', success: '#10b981', error: '#ef4444' };
const UPLOAD_API = 'https://xoto.ae/api/upload';

// ─── UAE Areas ───────────────────────────────────────────────────────────────
const UAE_AREAS = {
  Dubai: [
    'Dubai Marina', 'Downtown Dubai', 'JBR – Jumeirah Beach Residence', 'Palm Jumeirah',
    'Business Bay', 'DIFC – Dubai International Financial Centre', 'JVC – Jumeirah Village Circle',
    'Al Barsha', 'Deira', 'Bur Dubai', 'Jumeirah', 'Al Quoz', 'Al Nahda (Dubai)',
    'Mirdif', 'Silicon Oasis', 'Sports City', 'Motor City', 'Al Furjan',
    'Discovery Gardens', 'International City', 'The Greens', 'The Views',
    'Emirates Hills', 'Arabian Ranches', 'Mudon', 'Damac Hills', 'Town Square',
    'Al Warqa', 'Oud Metha', 'Karama', 'Satwa', 'Al Mankhool', 'Rashidiya',
    'Al Garhoud', 'Festival City', 'Creek Harbour', 'Dubai Hills Estate',
    'Bluewaters Island', 'Port De La Mer', 'La Mer', 'Madinat Jumeirah Living',
    'Sobha Hartland', 'Mohammed Bin Rashid City', 'Tilal Al Ghaf', 'The Sustainable City',
  ],
  'Abu Dhabi': [
    'Corniche Road', 'Al Reem Island', 'Yas Island', 'Saadiyat Island',
    'Khalifa City A', 'Khalifa City B', 'Al Nahyan', 'Masdar City',
    'Tourist Club Area (TCA)', 'Al Khalidiyah', 'Al Muroor', 'Al Mushrif',
    'Al Bateen', 'Al Manhal', 'Al Karamah', 'Al Shamkhah', 'Mohamed Bin Zayed City',
    'Mussafah', 'Al Reef', 'Al Ghadeer', 'Hydra Village', 'Al Samha',
    'Shakhbout City', 'Zayed City', 'Al Raha Beach', 'Al Raha Gardens',
    'Yas Acres', 'Bloom Gardens', 'Golf Gardens', 'Rawdhat Abu Dhabi',
    'Al Wathba', 'Al Falah', 'Baniyas', 'Al Shahama', 'Ghantoot',
  ],
  Sharjah: [
    'Al Nahda (Sharjah)', 'Al Majaz', 'Al Taawun', 'Al Qasimia',
    'Muwaileh Commercial', 'Al Khan', 'Al Mamzar (Sharjah Side)',
    'Al Wahda', 'Al Yarmook', 'Abu Shagara', 'Al Butina', 'Al Jubail',
    'Aljada', 'Tilal City', 'Muwaileh', 'Sharjah Waterfront City', 'Al Zahia',
  ],
  Ajman: [
    'Al Nuaimiya 1', 'Al Nuaimiya 2', 'Al Nuaimiya 3',
    'Al Rashidiya 1', 'Al Rashidiya 2', 'Al Rashidiya 3',
    'Emirates City', 'Al Rawda 1', 'Al Rawda 2', 'Al Rawda 3',
    'Garden City', 'Al Rumaila', 'Ajman Uptown',
  ],
  'Ras Al Khaimah': [
    'Al Nakheel', 'Al Hamra Village', 'Mina Al Arab', 'Al Qawasim Corniche',
    'Al Dhait South', 'Al Dhait North', 'Al Mamourah',
  ],
  Fujairah: [
    'Fujairah City Centre', 'Merashid', 'Dibba Al Fujairah',
    'Khor Fakkan', 'Kalba', 'Al Faseel', 'Al Gurfa',
  ],
  'Umm Al Quwain': [
    'UAQ City Centre', 'Al Salama', 'Al Hayl', 'Al Dour', 'Falaj Al Mualla',
  ],
};

const EMIRATES = Object.keys(UAE_AREAS);
const EMIRATE_CITY = {
  Dubai: 'Dubai',
  'Abu Dhabi': 'Abu Dhabi',
  Sharjah: 'Sharjah',
  Ajman: 'Ajman',
  'Ras Al Khaimah': 'Ras Al Khaimah',
  Fujairah: 'Fujairah',
  'Umm Al Quwain': 'Umm Al Quwain',
};

// ── Backend enum values (property.model.js se match) ─────────────────────────
const UNIT_TYPES = [
  { label: 'Apartment',  value: 'apartment'  },
  { label: 'Villa',      value: 'villa'       },
  { label: 'Penthouse',  value: 'penthouse'   },
  { label: 'Townhouse',  value: 'townhouse'   },
  { label: 'Duplex',     value: 'duplex'      },
  { label: 'Office',     value: 'office'      },
  { label: 'Retail',     value: 'retail'      },
  { label: 'Warehouse',  value: 'warehouse'   },
];

const BEDROOM_TYPES = [
  { label: 'Studio',    value: 'studio' },
  { label: '1 Bedroom', value: '1bed'   },
  { label: '2 Bedrooms',value: '2bed'   },
  { label: '3 Bedrooms',value: '3bed'   },
  { label: '4 Bedrooms',value: '4bed'   },
  { label: '5 Bedrooms',value: '5bed'   },
  { label: '6 Bedrooms',value: '6bed'   },
  { label: '7 Bedrooms',value: '7bed'   },
  { label: '8+ Bedrooms',value: '8plus' },
];

const FURNISHING_OPTIONS = [
  { label: 'Furnished',      value: 'furnished'      },
  { label: 'Semi Furnished', value: 'semi_furnished' },
  { label: 'Unfurnished',    value: 'unfurnished'    },
];

const RENTAL_FREQUENCY_OPTIONS = [
  { label: 'Monthly',   value: 'monthly'   },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Yearly',    value: 'yearly'    },
];

const CHEQUES_OPTIONS = [
  { label: '1 Cheque',  value: 1  },
  { label: '2 Cheques', value: 2  },
  { label: '4 Cheques', value: 4  },
  { label: '6 Cheques', value: 6  },
  { label: '12 Cheques',value: 12 },
];

const AMENITIES_OPTIONS = [
  'Pool', 'Gym', 'Parking', 'Sea View', 'Balcony',
  'Chiller Free', 'WiFi', 'Near Metro', 'DEWA Included',
  'Kids Play Area', "Maid's Room",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
  });

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
  const navigate    = useNavigate();
  const { id }      = useParams();
  const isEditMode  = Boolean(id);

  const [form]             = Form.useForm();
  const [formLoading,      setFormLoading]      = useState(false);
  const [selectedEmirate,  setSelectedEmirate]  = useState('');
  const [imageList,        setImageList]        = useState([]);
  const [previewOpen,      setPreviewOpen]      = useState(false);
  const [previewImage,     setPreviewImage]     = useState('');
  const [previewTitle,     setPreviewTitle]     = useState('');



const ROLE_SLUG_MAP = {
  0: 'superadmin', 1: 'admin', 15: 'agency',
  16: 'agent', 17: 'developer', 18: 'vault-admin',
};

// submit success ke baad:
const { user } = useSelector((s) => s.auth);
const roleSlug = ROLE_SLUG_MAP[user?.role?.code] ?? 'superadmin';

  // ── FETCH FOR EDIT ────────────────────────────────────────────────────────
  useEffect(() => {
    if (isEditMode) fetchPropertyById();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPropertyById = async () => {
    try {
      setFormLoading(true);
      // GET /properties/:id  ← unified property controller
      const res  = await apiService.get(`/properties/${id}`);
      const raw  = res?.data ?? res;
      const data = raw?.data ?? raw;
      if (!data) return;

      // Emirate comes from city mapping (reverse)
      const emirate = Object.keys(EMIRATE_CITY).find(
        (k) => EMIRATE_CITY[k] === data.city
      ) || data.city || '';
      setSelectedEmirate(emirate);

      form.setFieldsValue({
        propertyName:    data.propertyName    || '',
        description:     data.description     || '',
        emirate,
        area:            data.area            || undefined,
        city:            data.city            || '',
        unitType:        data.unitType        || undefined,
        bedroomType:     data.bedroomType     || undefined,
        bedrooms:        data.bedrooms        || 0,
        bathrooms:       data.bathrooms       || 0,
        builtUpArea:     data.builtUpArea     || 0,
        builtUpAreaUnit: data.builtUpAreaUnit || 'sqft',
        price:           data.price           || 0,
        rentalFrequency: data.rentalFrequency || undefined,
        minimumContract: data.minimumContract || null,
        cheques:         data.cheques         || null,
        isImmediate:     data.isImmediate     ?? true,
        isShortTerm:     data.isShortTerm     || false,
        furnishing:      data.furnishing      || 'unfurnished',
        parkingSpaces:   data.parkingSpaces   || 0,
        hasView:         data.hasView         || false,
        viewType:        data.viewType        || [],
        availableFrom:   data.availableFrom   ? dayjs(data.availableFrom) : null,
        reraPermitNumber:      data.reraPermitNumber      || '',
        dldRegistrationNumber: data.dldRegistrationNumber || '',
        amenities:       data.amenities       || [],
        unitNumber:      data.unitNumber      || '',
        floorNumber:     data.floorNumber     || 0,
        isFeatured:      data.isFeatured      || false,
        showContactOnlyVerified: data.showContactOnlyVerified ?? true,
      });

      // Images — reconstruct from photos object
      const photos = data.photos || {};
      const allImages = [
        ...(photos.architecture || []),
        ...(photos.interior     || []),
        ...(photos.lobby        || []),
        ...(photos.other        || []),
        ...(data.mainLogo ? [data.mainLogo] : []),
      ];
      if (allImages.length > 0) {
        setImageList(
          allImages.map((url, i) => ({
            uid:    `-img-${i}`,
            name:   `image-${i + 1}`,
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

  // ── Emirate change → clear area, auto-fill city ───────────────────────────
  const handleEmirateChange = (value) => {
    setSelectedEmirate(value);
    form.setFieldsValue({ area: undefined, city: EMIRATE_CITY[value] || '' });
  };

  // ── IMAGE UPLOAD ──────────────────────────────────────────────────────────
  const handleImageUpload = async ({ file, onSuccess, onError }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response  = await apiService.upload(UPLOAD_API, formData);
      const uploadedUrl =
        response?.data?.file?.url || response?.data?.url ||
        response?.file?.url       || response?.url;
      if (uploadedUrl) {
        message.success(`${file.name} uploaded!`);
        onSuccess({ url: uploadedUrl });
      } else {
        throw new Error('No URL returned from upload API');
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
  // POST /properties  ← property.controller.js → createProperty
  const handleSave = async (values) => {
    if (imageList.length === 0) {
      message.error('Please upload at least one image.');
      return;
    }

    setFormLoading(true);
    try {
      const imageUrls = imageList.map(extractUrl).filter(Boolean);

      // ── Payload — exact field names from property.controller.js ──────────
      const payload = {
        // Required
        propertySubType:  'rental',          // ← always rental
        propertyName:     values.propertyName,
        description:      values.description || '',
        area:             values.area,
        city:             values.city,
        country:          'UAE',

        // Unit details
        unitType:         values.unitType    || 'apartment',
        bedroomType:      values.bedroomType || '1bed',
        bedrooms:         Number(values.bedrooms  || 0),
        bathrooms:        Number(values.bathrooms || 0),
        builtUpArea:      Number(values.builtUpArea || 0),
        builtUpAreaUnit:  values.builtUpAreaUnit || 'sqft',
        unitNumber:       values.unitNumber  || '',
        floorNumber:      Number(values.floorNumber || 0),

        // Pricing — price required by controller
        price:            Number(values.price || 0),
        price_min:        Number(values.price || 0),
        currency:         'AED',
        transactionType:  'rent',

        // Rental-specific (required by controller for rental)
        rentalFrequency:  values.rentalFrequency,
        reraPermitNumber: values.reraPermitNumber,    // ← required for rental (PRD §14.4)
        minimumContract:  values.minimumContract      || null,
        cheques:          values.cheques              || null,
        isImmediate:      values.isImmediate          ?? true,
        isShortTerm:      values.isShortTerm          || false,

        // Availability
        availableFrom:    values.availableFrom
                            ? values.availableFrom.toISOString()
                            : null,

        // Property features
        furnishing:       values.furnishing    || 'unfurnished',
        parkingSpaces:    Number(values.parkingSpaces || 0),
        hasView:          values.hasView       || false,
        viewType:         values.viewType      || [],
        amenities:        values.amenities     || [],

        // Compliance
        dldRegistrationNumber: values.dldRegistrationNumber || null,

        // Media — put all in photos.other; mainLogo = first image
        mainLogo: imageUrls[0] || '',
        photos: {
          architecture: [],
          interior:     [],
          lobby:        [],
          other:        imageUrls,
        },

        // Misc
        isFeatured:              values.isFeatured              || false,
        showContactOnlyVerified: values.showContactOnlyVerified ?? true,
      };

      const response = isEditMode
  ? await apiService.put(`/properties/${id}`, payload)
  : await apiService.post('/properties', payload);         // POST  /properties

      if (response) {
        notification.success({
          message:     isEditMode ? 'Property Updated' : 'Property Created',
          description: `Rental listing "${values.propertyName}" ${isEditMode ? 'updated' : 'submitted for approval'} successfully!`,
          placement:   'topRight',  
        });
        navigate(-1);
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to save property.';
      message.error(errMsg);
      console.error('Create/Edit error:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const areaOptions = selectedEmirate ? (UAE_AREAS[selectedEmirate] || []) : [];

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '24px 28px', background: '#f8f9fb', minHeight: '100vh' }}>

      {/* PAGE HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/dashboard/${roleSlug}/rental/propertieslist`)} />
        <div>
          <Title level={4} style={{ margin: 0, color: '#111827' }}>
            {isEditMode ? 'Edit Rental Property' : 'Create Rental Property'}
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {isEditMode
              ? 'Update the details of this rental listing.'
              : 'Fill in the details to list a new rental property. It will be submitted for admin approval.'}
          </Text>
        </div>
      </div>

      {/* FORM CARD */}
      <Card
        bordered={false}
        style={{
          maxWidth: 1099, margin: '0 auto',
          borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
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
            furnishing:              'unfurnished',
            isImmediate:             true,
            isShortTerm:             false,
            hasView:                 false,
            isFeatured:              false,
            showContactOnlyVerified: true,
            builtUpAreaUnit:         'sqft',
            bedrooms:                0,
            bathrooms:               0,
            parkingSpaces:           0,
            floorNumber:             0,
            builtUpArea:             0,
          }}
        >

          {/* ── 1. BASIC DETAILS ─────────────────────────────────────────── */}
          <SectionLabel icon={<HomeOutlined />} label="Basic Details" />
          <Row gutter={16}>
            <Col xs={24} md={16}>
              <Form.Item
                name="propertyName"
                label="Property Name"
                rules={[{ required: true, message: 'Property name is required' }]}
              >
                <Input size="large" placeholder="E.g. Luxury 3BR Apartment — Marina Walk" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="unitType"
                label="Unit Type"
                rules={[{ required: true, message: 'Unit type is required' }]}
              >
                <Select size="large" placeholder="Select type">
                  {UNIT_TYPES.map((t) => (
                    <Option key={t.value} value={t.value}>{t.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={12} md={6}>
              <Form.Item name="bedroomType" label="Bedrooms">
                <Select size="large" placeholder="Select Bedrooms">
                  {BEDROOM_TYPES.map((b) => (
                    <Option key={b.value} value={b.value}>{b.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            {/* <Col xs={12} md={6}>
              <Form.Item name="bedrooms" label="Bedrooms">
                <InputNumber size="large" style={{ width: '100%' }} min={0} placeholder="0" />
              </Form.Item>
            </Col> */}
            <Col xs={12} md={6}>
              <Form.Item name="bathrooms" label="Bathrooms">
                <InputNumber size="large" style={{ width: '100%' }} min={0} placeholder="0" />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="parkingSpaces" label="Parking Spaces">
                <InputNumber size="large" style={{ width: '100%' }} min={0} placeholder="0" />
              </Form.Item>
            </Col>

            <Col xs={12} md={8}>
              <Form.Item name="builtUpArea" label="Built-Up Area">
                <InputNumber size="large" style={{ width: '100%' }} min={0} placeholder="1150" />
              </Form.Item>
            </Col>
            <Col xs={12} md={4}>
              <Form.Item name="builtUpAreaUnit" label="Unit">
                <Select size="large">
                  <Option value="sqft">Sqft</Option>
                  <Option value="sqm">Sqm</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="unitNumber" label="Unit Number">
                <Input size="large" placeholder="e.g. A-1204" />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="floorNumber" label="Floor Number">
                <InputNumber size="large" style={{ width: '100%' }} min={0} placeholder="12" />
              </Form.Item>
            </Col>

            <Col xs={12} md={8}>
              <Form.Item name="furnishing" label="Furnishing">
                <Select size="large" placeholder="Select">
                  {FURNISHING_OPTIONS.map((f) => (
                    <Option key={f.value} value={f.value}>{f.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="hasView" label="Has View?" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Description is required' }]}>
                <TextArea rows={3} placeholder="Describe the property..." style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '8px 0 20px' }} />

          {/* ── 2. PRICING & RENTAL ──────────────────────────────────────── */}
          <SectionLabel icon={<DollarOutlined />} label="Pricing & Rental Terms" />
          <Row gutter={16}>
            <Col xs={12} md={8}>
              <Form.Item
                name="price"
                label="Annual Rent (AED)"
                rules={[{ required: true, message: 'Price is required' }]}
              >
                <InputNumber
                  size="large" style={{ width: '100%' }} min={0}
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  placeholder="120000"
                />
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item
                name="rentalFrequency"
                label="Rental Frequency"
                rules={[{ required: true, message: 'Rental frequency is required' }]}
              >
                <Select size="large" placeholder="Select frequency">
                  {RENTAL_FREQUENCY_OPTIONS.map((r) => (
                    <Option key={r.value} value={r.value}>{r.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="cheques" label="No. of Cheques">
                <Select size="large" placeholder="Select" allowClear>
                  {CHEQUES_OPTIONS.map((c) => (
                    <Option key={c.value} value={c.value}>{c.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="minimumContract" label="Minimum Contract (months)">
                <InputNumber size="large" style={{ width: '100%' }} min={1} placeholder="12" />
              </Form.Item>
            </Col>
            <Col xs={12} md={4}>
              <Form.Item name="isImmediate" label="Immediate?" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={12} md={4}>
              <Form.Item name="isShortTerm" label="Short Term?" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '8px 0 20px' }} />

          {/* ── 3. AVAILABILITY ──────────────────────────────────────────── */}
          <SectionLabel icon={<CalendarOutlined />} label="Availability" />
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="availableFrom" label="Available From">
                <DatePicker size="large" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '8px 0 20px' }} />

          {/* ── 4. LOCATION ───────────────────────────────────────────────── */}
          <SectionLabel icon={<EnvironmentOutlined />} label="Location" />
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="emirate"
                label="Emirate"
                rules={[{ required: true, message: 'Emirate is required' }]}
              >
                <Select size="large" placeholder="Select Emirate" onChange={handleEmirateChange}>
                  {EMIRATES.map((em) => (
                    <Option key={em} value={em}>{em}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
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
                  size="large" showSearch
                  placeholder={!selectedEmirate ? 'Select an emirate first…' : 'Search or select area…'}
                  disabled={!selectedEmirate}
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  suffixIcon={<SearchOutlined style={{ color: '#9ca3af' }} />}
                  notFoundContent="No areas found"
                  style={{ width: '100%' }}
                >
                  {areaOptions.map((a) => (
                    <Option key={a} value={a} label={a}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <EnvironmentOutlined style={{ color: '#a855f7', fontSize: 12 }} />
                        {a}
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="city"
                label="City"
                rules={[{ required: true, message: 'City is required' }]}
              >
                <Input size="large" placeholder="Dubai" />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '8px 0 20px' }} />

          {/* ── 5. COMPLIANCE ────────────────────────────────────────────── */}
          <SectionLabel label="Compliance (Required for Rental)" />
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="reraPermitNumber"
                label="RERA Permit Number"
                rules={[{ required: true, message: 'RERA permit number is required for rental listings (PRD §14.4)' }]}
              >
                <Input size="large" placeholder="e.g. 7123456789" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="dldRegistrationNumber" label="DLD Registration Number">
                <Input size="large" placeholder="Optional" />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '8px 0 20px' }} />

          {/* ── 6. AMENITIES ─────────────────────────────────────────────── */}
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

          {/* ── 7. SETTINGS ──────────────────────────────────────────────── */}
          <SectionLabel label="Settings" />
          <Row gutter={16}>
            <Col xs={12} md={6}>
              <Form.Item name="showContactOnlyVerified" label="Verified Users Only?" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '8px 0 20px' }} />

          {/* ── 8. IMAGES ─────────────────────────────────────────────────── */}
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

          {/* ACTIONS */}
          <div style={{
            display: 'flex', justifyContent: 'flex-end', gap: 10,
            paddingTop: 20, marginTop: 8, borderTop: '1px solid #f3f4f6',
          }}>
            <Button size="large" onClick={() => navigate(-1)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={formLoading}
              size="large"
              style={{ backgroundColor: THEME.primary, borderColor: THEME.primary, minWidth: 180 }}
            >
              {isEditMode ? 'Update Rental Listing' : 'Submit for Approval'}
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