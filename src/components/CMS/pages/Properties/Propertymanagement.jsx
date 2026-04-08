import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../../../manageApi/utils/custom.apiservice';
import {
  Button, Modal, Form, Input, InputNumber, Select, Row, Col, Divider,
  Typography, Table, Card, Space, Tag, Popconfirm, message, notification,
  Switch, Upload, Grid, DatePicker
} from 'antd';

import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  SearchOutlined,
} from '@ant-design/icons';

import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { useBreakpoint } = Grid;

const THEME = { primary: "#7c3aed", success: "#10b981" };

const PropertyManagement = () => {
  const UPLOAD_API = `${apiService.baseURL}/upload`;
  const [properties, setProperties] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchText, setSearchText] = useState('');

  const [photoList, setPhotoList] = useState([]);
  const [logoList, setLogoList] = useState([]);
  const [brochureUrl, setBrochureUrl] = useState("");

  const [form] = Form.useForm();

  // Utility to capitalize first letter of each word
  const capitalizeWords = (str) => {
    if (!str) return "";
    return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const validateImageSize = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Only image files allowed");
      return Upload.LIST_IGNORE;
    }
    const size = file.size / 1024 / 1024;
    if (size < 1 || size > 20) {
      message.error("Image size must be between 1MB and 20MB");
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const fetchDevelopers = async () => {
    try {
      const res = await apiService.get("/property/get-all-developers");
      const list = Array.isArray(res) ? res : (res?.data || []);
      setDevelopers(list);
    } catch (err) {
      console.error("Error fetching developers");
    }
  };

  const fetchProperties = useCallback(async (page, limit, search) => {
    setLoading(true);
    try {
      const response = await apiService.get("/property/get-all-properties", {
        page,
        limit,
        keyword: search || undefined
      });
      const resData = response;
      const list = Array.isArray(resData?.data) ? resData.data : (Array.isArray(resData) ? resData : []);
      setProperties(list);
      setTotal(response?.pagination?.totalItems || 0);
    } catch (err) {
      message.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProperties(currentPage, pageSize, searchText);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText, currentPage, pageSize, fetchProperties]);

  useEffect(() => {
    fetchDevelopers();
  }, []);

  const handleSave = async (values) => {
    setFormLoading(true);
    try {
      const finalPhotos = photoList
        .map(f => f.url || f.response?.file?.url || f.response?.url || f.response)
        .filter(url => typeof url === "string");

      const finalLogo = logoList.length
        ? (logoList[0].url || logoList[0].response?.file?.url || logoList[0].response?.url)
        : "";

      const payload = {
        ...values,
        // ✅ CAPITALIZE FIRST LETTER OF EACH WORD ON SAVE
        propertyName: capitalizeWords(values.propertyName), 
        price: Number(values.price || 0),
        price_min: Number(values.price_min || 0),
        price_max: Number(values.price_max || 0),
        bedrooms: Number(values.bedrooms || 0),
        bathrooms: Number(values.bathrooms || 0),
        builtUpArea_min: Number(values.builtUpArea_min || 0),
        builtUpArea_max: Number(values.builtUpArea_max || 0),
        photos: finalPhotos,
        mainLogo: finalLogo,
        brochure: brochureUrl,
        handover: values.handover ? dayjs(values.handover).format("YYYY-MM-DD") : "",
      };

      if (editingId) {
        await apiService.post(`/property/edit-property?id=${editingId}`, payload);
      } else {
        await apiService.post("/property/create-properties", payload);
      }

      notification.success({ message: "Property Saved Successfully!" });
      closeModal();
      fetchProperties(currentPage, pageSize, searchText);
    } catch (err) {
      message.error("Error saving property");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await apiService.post(`/property/delete-property?id=${id}`);
      message.success("Property deleted successfully");
      fetchProperties(currentPage, pageSize, searchText);
    } catch {
      message.error("Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingId(null);
    setPhotoList([]);
    setLogoList([]);
    setBrochureUrl("");
    form.resetFields();
  };

  const handleEditClick = (record) => {
    setEditingId(record._id);
    const formData = {
      ...record,
      developer: record.developer?._id || record.developer,
      handover: record.handover ? dayjs(record.handover) : null
    };
    form.setFieldsValue(formData);
    if (record.photos)
      setPhotoList(record.photos.map((url, i) => ({ uid: i, url, status: "done", name: `Img ${i + 1}` })));
    if (record.mainLogo)
      setLogoList([{ uid: "-1", url: record.mainLogo, status: "done", name: "Main Logo" }]);
    if (record.brochure) setBrochureUrl(record.brochure);
    setModalVisible(true);
  };

  const columns = [
    {
      title: "Property Name",
      dataIndex: "propertyName",
      width: 200,
      // ✅ CSS CAPITALIZE FOR DISPLAY
      render: (t) => <Text strong style={{ textTransform: 'capitalize' }}>{t}</Text>
    },
    {
      title: "Price Min",
      dataIndex: "price_min",
      width: 150,
      render: (p, r) => (
        <Text strong style={{ color: THEME.primary }}>
          {r.currency} {p?.toLocaleString()}
        </Text>
      )
    },
    {
      title: "Location",
      width: 200,
      render: (_, r) => `${r.area || ""}, ${r.city || ""}`
    },
    {
      title: "Status",
      align: "center",
      width: 120,
      render: (_, record) =>
        record.notReadyYet
          ? <Tag color="processing">Construction</Tag>
          : record.isAvailable
            ? <Tag color="success">Available</Tag>
            : <Tag color="error">Sold</Tag>
    },
    {
      title: "Action",
      width: 100,
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EyeOutlined style={{ color: THEME.primary }} />} onClick={() => handleEditClick(record)} />
          <Popconfirm title="Delete?" onConfirm={() => handleDelete(record._id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <Title level={3}>Property Management</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
          style={{ background: THEME.primary }}
        >
          Add New Property
        </Button>
      </div>

      <Card className="mb-6 shadow-sm border-0">
        <Input
          placeholder="Search by property name, location..."
          prefix={<SearchOutlined className="text-gray-400" />}
          value={searchText}
          size="large"
          allowClear
          onChange={(e) => {
            setSearchText(e.target.value);
            setCurrentPage(1);
          }}
        />
      </Card>

      <Card className="shadow-sm border-0">
        <Table
          columns={columns}
          dataSource={properties}
          loading={loading}
          rowKey="_id"
          pagination={{
            current: currentPage,
            pageSize,
            total,
            onChange: (p) => setCurrentPage(p)
          }}
        />
      </Card>

      <Modal
        title={editingId ? "View / Edit Property" : "Add New Property"}
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        width={1000}
        style={{ top: 20 }}
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
            commissionType: "percentage", commissionValue: 3, commissionStage: "booking",
            amenities: [], location_highlights: [], unitType: []
          }}
        >
          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Basic Information</Divider>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="propertyName" label="Property Name" rules={[{ required: true }]}>
                {/* ✅ VISUAL CAPITALIZE WHILE TYPING */}
                <Input style={{ textTransform: 'capitalize' }} placeholder="E.g. Burj Khalifa" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="developer" label="Developer" rules={[{ required: true }]}>
                <Select placeholder="Select Developer" showSearch optionFilterProp="children">
                  {developers.map(d => <Option key={d._id} value={d._id}>{d.name}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={12} md={4}><Form.Item name="transactionType" label="Transaction"><Select><Option value="sell">Sell</Option><Option value="rent">Rent</Option></Select></Form.Item></Col>
            <Col xs={12} md={4}><Form.Item name="propertyType" label="Prop Type"><Input placeholder="e.g Apartment" /></Form.Item></Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={6}><Form.Item name="propertySubType" label="Sub Type"><Select><Option value="ready">Ready</Option><Option value="off_plan">Off Plan</Option><Option value="resale">Resale</Option></Select></Form.Item></Col>
            <Col xs={24} md={12}>
              <Form.Item name="unitType" label="Unit Types Available">
                <Select mode="tags" placeholder="Type and press enter" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}><Form.Item name="handover" label="Handover Date"><DatePicker className="w-full" style={{ width: '100%' }} /></Form.Item></Col>
          </Row>

          <Form.Item name="description" label="Description"><TextArea rows={3} /></Form.Item>

          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Pricing & Payment Plan</Divider>
          <Row gutter={16}>
            <Col xs={12} md={4}><Form.Item name="currency" label="Currency"><Select><Option value="AED">AED</Option><Option value="USD">USD</Option></Select></Form.Item></Col>
            <Col xs={12} md={5}><Form.Item name="price" label="Fixed Price"><InputNumber className="w-full" style={{ width: '100%' }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} /></Form.Item></Col>
            <Col xs={12} md={5}><Form.Item name="price_min" label="Min Price"><InputNumber className="w-full" style={{ width: '100%' }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} /></Form.Item></Col>
            <Col xs={12} md={5}><Form.Item name="price_max" label="Max Price"><InputNumber className="w-full" style={{ width: '100%' }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} /></Form.Item></Col>
            <Col xs={24} md={5}><Form.Item name="downPayment" label="Down Payment"><InputNumber className="w-full" suffix="%" /></Form.Item></Col>
          </Row>

          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Commission Scheme</Divider>
          <Row gutter={16}>
            <Col xs={12} md={6}><Form.Item name="commissionType" label="Type"><Select><Option value="percentage">Percentage (%)</Option><Option value="fixed">Fixed</Option></Select></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name="commissionValue" label="Value"><InputNumber className="w-full" /></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name="commissionStage" label="Stage"><Select><Option value="booking">Booking</Option><Option value="contract">Contract</Option><Option value="handover">Handover</Option></Select></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name="commissionNotes" label="Notes"><Input /></Form.Item></Col>
          </Row>

          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Area & Configuration</Divider>
          <Row gutter={16}>
            <Col xs={12} md={4}><Form.Item name="bedrooms" label="Bedrooms"><InputNumber className="w-full" /></Form.Item></Col>
            <Col xs={12} md={4}><Form.Item name="bathrooms" label="Bathrooms"><InputNumber className="w-full" /></Form.Item></Col>
            <Col xs={12} md={5}><Form.Item name="builtUpArea_min" label="Min Area"><InputNumber className="w-full" /></Form.Item></Col>
            <Col xs={12} md={5}><Form.Item name="builtUpArea_max" label="Max Area"><InputNumber className="w-full" /></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name="builtUpAreaUnit" label="Unit"><Select><Option value="sqft">Sq. Ft</Option><Option value="sqm">Sq. M</Option></Select></Form.Item></Col>
          </Row>

          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Location Details</Divider>
          <Row gutter={16}>
            <Col xs={24} md={12}><Form.Item name="googleLocation" label="Google Maps Link"><Input /></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name="buildingNo" label="Building No"><Input /></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name="street" label="Street"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col xs={12} md={6}><Form.Item name="area" label="Area"><Input /></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name="city" label="City"><Input /></Form.Item></Col>
            <Col xs={12} md={4}><Form.Item name="state" label="State"><Input /></Form.Item></Col>
            <Col xs={12} md={4}><Form.Item name="country" label="Country"><Input /></Form.Item></Col>
            <Col xs={12} md={4}><Form.Item name="postalCode" label="Zip Code"><Input /></Form.Item></Col>
          </Row>

        <Divider orientation="left" style={{ borderColor: THEME.primary }}>Media & Assets</Divider>
<Row gutter={16}>
  <Col xs={24} md={6}>
    <Form.Item label="Main Logo">
      <Upload listType="picture-card" fileList={logoList} action={UPLOAD_API} maxCount={1} beforeUpload={validateImageSize} onChange={({ fileList }) => setLogoList(fileList)}>
        {logoList.length >= 1 ? null : <div><PlusOutlined /><div style={{ marginTop: 8 }}>Logo</div></div>}
      </Upload>
      <div style={{ marginTop: 6, padding: '6px 10px', background: '#e6f4ff', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 13 }}>ℹ️</span>
        <Text style={{ fontSize: 12, color: '#1677ff' }}>Recommended: 400×400px JPG/PNG</Text>
      </div>
    </Form.Item>
  </Col>

  <Col xs={24} md={12}>
    <Form.Item label="Property Photos">
      <Upload listType="picture-card" fileList={photoList} action={UPLOAD_API} multiple beforeUpload={validateImageSize} onChange={({ fileList }) => setPhotoList(fileList)}>
        <div><PlusOutlined /><div style={{ marginTop: 8 }}>Add Photos</div></div>
      </Upload>
      <div style={{ marginTop: 6, padding: '6px 10px', background: '#e6f4ff', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 13 }}>ℹ️</span>
        <Text style={{ fontSize: 12, color: '#1677ff' }}>Recommended: 1200×800px JPG/PNG</Text>
      </div>
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
      <div style={{ marginTop: 6, padding: '6px 10px', background: '#e6f4ff', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 13 }}>ℹ️</span>
        <Text style={{ fontSize: 12, color: '#1677ff' }}>PDF format only, max 20MB</Text>
      </div>
    </Form.Item>
  </Col>
</Row>

          <Divider orientation="left" style={{ borderColor: THEME.primary }}>Additional Details</Divider>
          <Form.Item name="amenities" label="Amenities"><Select mode="tags" /></Form.Item>
          <Row gutter={16}>
            <Col xs={8}><Form.Item name="isAvailable" label="Available" valuePropName="checked"><Switch /></Form.Item></Col>
            <Col xs={8}><Form.Item name="notReadyYet" label="Construction" valuePropName="checked"><Switch /></Form.Item></Col>
            <Col xs={8}><Form.Item name="isFeatured" label="Featured" valuePropName="checked"><Switch /></Form.Item></Col>
          </Row>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <Button onClick={closeModal} size="large">Cancel</Button>
            <Button type="primary" htmlType="submit" loading={formLoading} size="large" style={{ backgroundColor: THEME.primary }}>
               {editingId ? "Update Property" : "Save Property"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default PropertyManagement;