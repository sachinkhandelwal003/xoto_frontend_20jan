import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Row,
  Col,
  Divider,
  Typography,
  Table,
  Card,
  Space,
  Tag,
  Popconfirm,
  message,
  notification,
  Switch,
  Upload,
  Statistic,
  Grid,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  UploadOutlined,
  SearchOutlined,
  PropertySafetyOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

const THEME = { primary: "#7c3aed", success: "#10b981" };

const DeveloperPropertyManagement = () => {
  const BASE_URL = "https://xoto.ae/api/property";
  const UPLOAD_API = "https://xoto.ae/api/upload";

  const screens = useBreakpoint();

  const [properties, setProperties] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchText, setSearchText] = useState("");

  const [fileList, setFileList] = useState([]);
  const [brochureUrl, setBrochureUrl] = useState("");

  const [form] = Form.useForm();

  // ✅ FETCH DEVELOPERS
  const fetchDevelopers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/get-all-developers`);
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setDevelopers(list);
    } catch (err) {
      console.error("Error fetching developers", err);
    }
  };

  // ✅ FETCH PROPERTIES
  const fetchProperties = useCallback(async (page, limit, search) => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/get-all-properties`, {
        params: {
          page,
          limit,
          search: search || undefined,
          isFeatured: false,
        },
      });

      const resData = response.data;

      const list = Array.isArray(resData?.data)
        ? resData.data
        : Array.isArray(resData)
        ? resData
        : [];

      setProperties(list);
      setTotal(resData?.total || resData?.pagination?.total || list.length);
    } catch (err) {
      message.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProperties(currentPage, pageSize, searchText);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText, currentPage, pageSize, fetchProperties]);

  useEffect(() => {
    fetchDevelopers();
  }, []);

  // ✅ CLOSE MODAL
  const closeModal = () => {
    setModalVisible(false);
    setEditingId(null);
    setFileList([]);
    setBrochureUrl("");
    form.resetFields();
  };

  // ✅ SAVE / EDIT PROPERTY
  const handleSave = async (values) => {
    setLoading(true);

    try {
      // ✅ extract photos urls from upload response or existing urls
      const finalPhotos = fileList
        .map((f) => f.url || f.response?.file?.url || f.response?.url || f.response)
        .filter((u) => typeof u === "string");

      const payload = {
        ...values,

        // numbers
        price: Number(values.price || 0),
        bedrooms: Number(values.bedrooms || 0),
        bathrooms: Number(values.bathrooms || 0),
        builtUpArea: Number(values.builtUpArea || 0),
        plotArea: Number(values.plotArea || 0),
        handoverYear: values.handoverYear ? Number(values.handoverYear) : null,

        // media
        photos: finalPhotos,
        brochure: brochureUrl,
        mainLogo: finalPhotos?.[0] || "",

        // defaults
        currency: values.currency || "AED",
        builtUpAreaUnit: values.builtUpAreaUnit || "sqft",
        city: values.city || "Dubai",
      };

      if (editingId) {
        await axios.post(`${BASE_URL}/edit-property`, payload, {
          params: { id: editingId },
        });
      } else {
        await axios.post(`${BASE_URL}/create-properties`, payload);
      }

      notification.success({
        message: "Property Saved Successfully ✅",
      });

      closeModal();
      fetchProperties(currentPage, pageSize, searchText);
    } catch (err) {
      console.error(err);
      message.error("Error saving property.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ DELETE PROPERTY
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/delete-property`, null, { params: { id } });
      message.success("Property deleted successfully ✅");
      fetchProperties(currentPage, pageSize, searchText);
    } catch (err) {
      message.error("Failed to delete ❌");
    } finally {
      setLoading(false);
    }
  };

  // ✅ EDIT PROPERTY
  const openEditModal = (record) => {
    setEditingId(record._id);

    form.setFieldsValue({
      ...record,
      developer: record.developer?._id || record.developer,
    });

    setModalVisible(true);

    // ✅ preload photos
    if (record.photos?.length) {
      setFileList(
        record.photos.map((url, i) => ({
          uid: String(i),
          url,
          status: "done",
          name: `Image ${i + 1}`,
        }))
      );
    } else {
      setFileList([]);
    }

    // ✅ preload brochure
    if (record.brochure) {
      setBrochureUrl(record.brochure);
    } else {
      setBrochureUrl("");
    }
  };

  // ✅ TABLE COLUMNS
  const columns = [
    {
      title: "Property Name",
      dataIndex: "propertyName",
      key: "propertyName",
      fixed: screens.md ? "left" : false,
      width: 220,
      render: (t) => <Text strong>{t}</Text>,
    },
    {
      title: "Category",
      dataIndex: "propertyCategory",
      key: "propertyCategory",
      width: 140,
      render: (v) => (
        <Tag color="purple" className="capitalize">
          {v || "N/A"}
        </Tag>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      width: 170,
      render: (p, r) => (
        <Text strong style={{ color: THEME.primary }}>
          {r.currency || "AED"} {Number(p || 0).toLocaleString()}
        </Text>
      ),
    },
    {
      title: "Location",
      key: "location",
      width: 220,
      render: (_, r) => (
        <Text>
          {(r.area || "Area") + ", " + (r.city || "Dubai")}
        </Text>
      ),
    },
    {
      title: "Status",
      key: "status",
      align: "center",
      width: 140,
      render: (_, record) =>
        record.notReadyYet ? (
          <Tag color="processing">Construction</Tag>
        ) : record.isAvailable ? (
          <Tag color="success">Available</Tag>
        ) : (
          <Tag color="error">Sold</Tag>
        ),
    },
    {
      title: "Action",
      key: "action",
      fixed: screens.md ? "right" : false,
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: THEME.primary }} />}
              onClick={() => openEditModal(record)}
            />
          </Tooltip>

          <Popconfirm title="Delete this property?" onConfirm={() => handleDelete(record._id)}>
            <Tooltip title="Delete">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* ✅ HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Property Management
          </Title>
          <Text type="secondary">Manage your developer listings easily.</Text>
        </div>

        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
          style={{ backgroundColor: THEME.primary, borderColor: THEME.primary }}
          className="w-full md:w-auto"
        >
          Add New Property
        </Button>
      </div>

      {/* ✅ STATS + SEARCH */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card bordered={false} className="shadow-sm rounded-xl">
            <Statistic
              title="Total Properties"
              value={total}
              prefix={<PropertySafetyOutlined style={{ color: THEME.primary }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={16}>
          <Card bordered={false} className="shadow-sm rounded-xl">
            <Input
              placeholder="Search by Name, Area or City..."
              prefix={<SearchOutlined />}
              size="large"
              allowClear
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(1);
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* ✅ TABLE */}
      <Card bordered={false} bodyStyle={{ padding: 0 }} className="shadow-sm rounded-xl">
        <Table
          columns={columns}
          dataSource={properties}
          loading={loading}
          rowKey="_id"
          scroll={{ x: 1100 }}
          pagination={{
            current: currentPage,
            total,
            pageSize,
            onChange: (p) => setCurrentPage(p),
            position: ["bottomCenter"],
            size: "small",
          }}
        />
      </Card>

      {/* ✅ MODAL */}
      <Modal
        title={editingId ? "Edit Property" : "Add New Property"}
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        width={screens.lg ? 950 : "100%"}
        style={{ top: screens.xs ? 0 : 20 }}
        bodyStyle={{
          height: screens.xs ? "calc(100vh - 55px)" : "auto",
          overflowY: "auto",
        }}
        centered={!screens.xs}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            currency: "AED",
            builtUpAreaUnit: "sqft",
            propertyType: "sell",
            propertySubType: "ready",
            propertyCategory: "apartment",
            isAvailable: true,
            notReadyYet: false,
            isFeatured: false,
            city: "Dubai",
          }}
        >
          {/* ✅ BASIC INFO */}
          <Divider orientation="left">Basic Info</Divider>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="propertyName"
                label="Property Name"
                rules={[{ required: true, message: "Property name required" }]}
              >
                <Input placeholder="Ex: Binghatti Heights" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="developer"
                label="Developer"
                rules={[{ required: true, message: "Select developer" }]}
              >
                <Select placeholder="Select Developer">
                  {developers.map((d) => (
                    <Option key={d._id} value={d._id}>
                      {d.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="propertyCategory"
                label="Category"
                rules={[{ required: true, message: "Select category" }]}
              >
                <Select placeholder="Select Category">
                  <Option value="apartment">Apartment</Option>
                  <Option value="villa">Villa</Option>
                  <Option value="townhouse">Townhouse</Option>
                  <Option value="penthouse">Penthouse</Option>
                  <Option value="plot">Plot</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="propertyType" label="Transaction">
                <Select>
                  <Option value="sell">Sell</Option>
                  <Option value="rent">Rent</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="propertySubType" label="Property Status">
                <Select>
                  <Option value="ready">Ready</Option>
                  <Option value="off_plan">Off Plan</Option>
                  <Option value="resale">Resale</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="handoverYear" label="Handover Year (Optional)">
                <InputNumber className="w-full" placeholder="2026" />
              </Form.Item>
            </Col>
          </Row>

          {/* ✅ MEDIA */}
          <Divider orientation="left">Media</Divider>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Photos (Max 8)">
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  action={UPLOAD_API}
                  name="file"
                  onChange={({ fileList }) => setFileList(fileList)}
                >
                  {fileList.length >= 8 ? null : (
                    <div>
                      <PlusOutlined />
                      <div>Upload</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Brochure PDF">
                <Upload
                  action={UPLOAD_API}
                  name="file"
                  maxCount={1}
                  onChange={(info) => {
                    if (info.file.status === "done") {
                      const url = info.file.response?.file?.url || info.file.response?.url;
                      setBrochureUrl(url || "");
                      message.success("Brochure uploaded ✅");
                    }
                  }}
                >
                  <Button icon={<UploadOutlined />} block={screens.xs}>
                    Upload PDF
                  </Button>
                </Upload>

                {brochureUrl && (
                  <div className="mt-2">
                    <Tag color="green">PDF Linked ✅</Tag>
                  </div>
                )}
              </Form.Item>
            </Col>
          </Row>

          {/* ✅ PRICING */}
          <Divider orientation="left">Pricing & Units</Divider>

          <Row gutter={16}>
            <Col xs={12} md={6}>
              <Form.Item name="bedrooms" label="Bedrooms">
                <InputNumber className="w-full" min={0} />
              </Form.Item>
            </Col>

            <Col xs={12} md={6}>
              <Form.Item name="bathrooms" label="Bathrooms">
                <InputNumber className="w-full" min={0} />
              </Form.Item>
            </Col>

            <Col xs={24} md={6}>
              <Form.Item name="currency" label="Currency">
                <Select>
                  <Option value="AED">AED</Option>
                  <Option value="USD">USD</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={6}>
              <Form.Item name="price" label="Price" rules={[{ required: true }]}>
                <InputNumber className="w-full" min={0} placeholder="Ex: 950000" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="builtUpArea" label="Built Up Area">
                <InputNumber className="w-full" min={0} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="builtUpAreaUnit" label="Area Unit">
                <Select>
                  <Option value="sqft">sqft</Option>
                  <Option value="sqm">sqm</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="plotArea" label="Plot Area (Optional)">
                <InputNumber className="w-full" min={0} />
              </Form.Item>
            </Col>
          </Row>

          {/* ✅ LOCATION */}
          <Divider orientation="left">Location</Divider>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="city" label="City">
                <Input placeholder="Dubai" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="area" label="Area" rules={[{ required: true }]}>
                <Input placeholder="Business Bay / Downtown / JVC" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="googleLocation" label="Google Maps Link">
                <Input placeholder="https://maps.google.com/..." />
              </Form.Item>
            </Col>
          </Row>

          {/* ✅ AVAILABILITY */}
          <Divider orientation="left">Availability</Divider>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="isAvailable" label="Available" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item name="notReadyYet" label="Construction" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item name="isFeatured" label="Featured" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          {/* ✅ FOOTER BUTTONS */}
          <div className="flex justify-end gap-3 mt-6 pb-2">
            <Button onClick={closeModal} size="large">
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              style={{ backgroundColor: THEME.primary, borderColor: THEME.primary }}
            >
              Save Property
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default DeveloperPropertyManagement;
