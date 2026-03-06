import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  Card,
  Table,
  Typography,
  Avatar,
  Row,
  Col,
  Space,
  message,
  Tooltip,
  Modal,
  Button,
  Tag,
  Spin,
  Divider,
  Switch,
  Input,
  Descriptions,
  Badge
} from "antd";
import {
  EyeOutlined,
  SearchOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ApartmentOutlined,
  MailOutlined,
  PhoneOutlined,
  FileTextOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

const DeveloperList = () => {
  // const BASE_URL = "https://xoto.ae/api/property";
  const BASE_URL = "http://localhost:5000/api/property";

  const { user } = useSelector((s) => s.auth);
  
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');

  const [viewModal, setViewModal] = useState(false);
  const [selectedDev, setSelectedDev] = useState(null);
  
  // Properties state
  const [devProperties, setDevProperties] = useState([]);
  const [loadingProps, setLoadingProps] = useState(false);

  // ✅ FETCH DEVELOPERS
  const fetchDevelopers = async (page = 1, limit = 10, search = '') => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/get-all-developers`, {
        params: { page, limit, search: search || undefined }
      });
      const resData = response.data;
      const rawList = resData?.data || resData || [];
      setDevelopers(Array.isArray(rawList) ? rawList : []);
      const count = resData?.pagination?.total || resData?.total || (Array.isArray(rawList) ? rawList.length : 0);
      setTotal(count);
    } catch (err) {
      console.error("Fetch Error:", err);
      message.error("Failed to load developers list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
        fetchDevelopers(currentPage, pageSize, searchText);
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [currentPage, pageSize, searchText]);

  // ✅ FETCH PROPERTIES
  const fetchPropertiesByDeveloper = async (devId) => {
    setLoadingProps(true);
    try {
      const response = await axios.get(`${BASE_URL}/get-all-properties`, {
        params: { developerId: devId } 
      });
      const propsData = response.data?.data || response.data || [];
      setDevProperties(propsData);
    } catch (err) {
      console.error("Error fetching properties:", err);
      setDevProperties([]);
    } finally {
      setLoadingProps(false);
    }
  };

  // ✅ TOGGLE STATUS
  const handleStatusToggle = async (record, checked) => {
    setActionLoading(record._id || record.id);
    try {
      const payload = { ...record, isVerifiedByAdmin: checked };
      delete payload._id; 
      await axios.post(`${BASE_URL}/edit-developer`, payload, {
        params: { id: record._id || record.id }
      });
      message.success(`Developer ${checked ? "Verified" : "Unverified"} successfully!`);
      fetchDevelopers(currentPage, pageSize, searchText);
    } catch (err) {
      message.error("Status update failed");
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ OPEN VIEW MODAL
  const openViewModal = (record) => {
    setSelectedDev(record);
    setViewModal(true);
    fetchPropertiesByDeveloper(record._id || record.id);
  };

  // Quick Stats Calculations based on current page data & total
  const verifiedDevs = developers.filter(d => d.isVerifiedByAdmin).length;
  const unverifiedDevs = developers.filter(d => !d.isVerifiedByAdmin).length;

  const stats = [
    { title: "Total Developers", value: total || 0, icon: <TeamOutlined />, color: "#2563eb", bg: "#dbeafe" },
    { title: "Verified Developers", value: verifiedDevs, icon: <CheckCircleOutlined />, color: "#059669", bg: "#d1fae5" },
    { title: "unverified developers", value: unverifiedDevs, icon: <ClockCircleOutlined />, color: "#d97706", bg: "#fef3c7" },
  ];

  const columns = [
    {
      title: "Developer Profile",
      render: (_, record) => (
        <Space size="middle">
          <Avatar 
            size={42} 
            src={record.logo}
            style={{ backgroundColor: "#f3e8ff", color: "#5c039b", fontWeight: "bold", borderRadius: "8px" }}
            icon={!record.logo && !record.name && <ApartmentOutlined />}
          >
            {!record.logo && record.name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Text strong style={{ fontSize: "15px", color: "#1f2937" }}>{record.name || "Unnamed Developer"}</Text>
            <Text type="secondary" style={{ fontSize: "12px" }}>RERA: {record.reraNumber || "N/A"}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Contact Info",
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Text style={{ fontSize: "13px" }}><MailOutlined style={{ color: "#6b7280", marginRight: "6px" }}/> {record.email}</Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            <PhoneOutlined style={{ color: "#6b7280", marginRight: "6px" }}/> 
            {record.country_code} {record.phone_number}
          </Text>
        </Space>
      ),
    },
    { 
      title: 'Location', 
      dataIndex: 'city', 
      render: (c, record) => (
        <Space>
           <EnvironmentOutlined style={{ color: "#9ca3af" }} />
           <Text>{c ? `${c}, ${record.country || ''}` : 'N/A'}</Text>
        </Space>
      ) 
    },
    {
      title: "Verification Status",
      dataIndex: "isVerifiedByAdmin",
      align: "center",
      render: (checked, record) => (
        <Space direction="vertical" size={2}>
          <Switch 
            checked={checked}
            loading={actionLoading === (record._id || record.id)}
            onChange={(val) => handleStatusToggle(record, val)}
            style={{ background: checked ? "#059669" : "#ef4444" }}
          />
          <Text type="secondary" style={{ fontSize: "11px", color: checked ? "#059669" : "#ef4444", fontWeight: "500" }}>
            {checked ? "Verified" : "Unverified"}
          </Text>
        </Space>
      ),
    },
    {
      title: "Actions",
      align: "right",
      render: (_, record) => (
        <Tooltip title="View Profile">
          <Button 
            type="text" 
            icon={<EyeOutlined style={{ fontSize: "18px", color: "#5c039b" }} />} 
            onClick={() => openViewModal(record)}
          />
        </Tooltip>
      ),
    },
  ];

  const propertyColumns = [
    { 
      title: 'Property Details', 
      key: 'details', 
      render: (_, r) => (
        <Space>
          <Avatar src={r.photos && r.photos[0]} shape="square" size="large" style={{ backgroundColor: '#f3f4f6' }}>
            <HomeOutlined style={{ color: '#9ca3af' }} />
          </Avatar>
          <div>
            <Text strong className="block">{r.propertyName}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}><EnvironmentOutlined /> {r.area ? `${r.area}, ${r.city}` : r.city}</Text>
          </div>
        </Space>
      ) 
    },
    { title: 'Type', dataIndex: 'propertyType', render: t => <Tag color="purple">{t}</Tag> },
    { 
      title: 'Starting Price', 
      dataIndex: 'price_min', 
      render: (p, r) => p > 0 ? <Text strong>{r.currency || 'AED'} {p.toLocaleString()}</Text> : <Text type="secondary">Price on Request</Text> 
    },
    { title: 'Status', render: (_, r) => r.isAvailable ? <Tag color="green">Available</Tag> : <Tag color="red">Sold</Tag> },
  ];

  return (
    <div style={{ padding: "24px", background: "#f8f9fa", minHeight: "100vh" }}>
      
      {/* HEADER */}
      <div style={{ marginBottom: "32px", display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ padding: "10px", background: "#f3e8ff", borderRadius: "10px", color: "#5c039b" }}>
          <ApartmentOutlined style={{ fontSize: "24px" }} />
        </div>
        <div>
          <Title level={2} style={{ margin: 0, color: "#1f2937" }}>
            Developer Management
          </Title>
          <Text type="secondary" style={{ fontSize: "15px" }}>
            Verify, approve, and monitor all property developers on the platform.
          </Text>
        </div>
      </div>

      {/* QUICK STATS */}
      <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} md={8} key={index}>
            <Card 
              bordered={false} 
              style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
              bodyStyle={{ padding: "24px" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ 
                  width: "56px", height: "56px", borderRadius: "12px", 
                  background: stat.bg, color: stat.color,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px"
                }}>
                  {stat.icon}
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: "13px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {stat.title}
                  </Text>
                  <Title level={2} style={{ margin: "4px 0 0 0", color: "#1f2937" }}>
                    {stat.value}
                  </Title>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* DATA TABLE SECTION */}
      <Card 
        bordered={false} 
        style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ padding: "24px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <Title level={5} style={{ margin: 0, color: "#374151" }}>Registered Developers Directory</Title>
          <Input 
            prefix={<SearchOutlined style={{ color: "#9ca3af" }}/>} 
            placeholder="Search developer..." 
            style={{ width: "300px", borderRadius: "8px" }}
            onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
            allowClear
            size="large"
          />
        </div>
        <Table
          columns={columns}
          dataSource={developers}
          rowKey={(record) => record._id || record.id}
          loading={loading}
          pagination={{
            current: currentPage,
            total: total,
            pageSize: pageSize,
            onChange: (p) => setCurrentPage(p),
            position: ["bottomCenter"]
          }}
          style={{ padding: "0 24px 24px 24px" }}
        />
      </Card>

      {/* READ-ONLY VIEW MODAL */}
      <Modal
        title={
          <Space>
            <ApartmentOutlined style={{ color: "#5c039b" }} />
            <Text strong style={{ fontSize: "18px" }}>Developer Complete Profile</Text>
          </Space>
        }
        open={viewModal}
        onCancel={() => setViewModal(false)}
        width={800}
        centered
        destroyOnClose
        styles={{ padding: "24px" }}
        footer={[
          <Button key="close" type="primary" style={{ background: "#5c039b" }} onClick={() => setViewModal(false)}>
            Close View
          </Button>
        ]}
      >
        {selectedDev ? (
          <div style={{ marginTop: "20px" }}>
            
            {/* Modal Header Profile */}
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <Avatar size={80} shape="square" src={selectedDev.logo} style={{ backgroundColor: "#f3e8ff", color: "#5c039b", fontSize: "32px", fontWeight: "bold", borderRadius: "12px" }}>
                 {selectedDev.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Title level={4} style={{ marginTop: "12px", marginBottom: "4px" }}>{selectedDev.name}</Title>
              <Space>
                <Tag color={selectedDev.isVerifiedByAdmin ? "green" : "red"}>
                  {selectedDev.isVerifiedByAdmin ? "Account Verified" : "Account Unverified"}
                </Tag>
                {selectedDev.reraNumber && <Tag color="blue">RERA: {selectedDev.reraNumber}</Tag>}
              </Space>
            </div>

            {/* Descriptions Layout for Clean Look */}
            <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} size="middle" labelStyle={{ fontWeight: "600", color: "#4b5563", width: "140px" }}>
              <Descriptions.Item label="Email Address">{selectedDev.email}</Descriptions.Item>
              <Descriptions.Item label="Phone Number">{selectedDev.country_code} {selectedDev.phone_number}</Descriptions.Item>
              <Descriptions.Item label="Location">{selectedDev.city}, {selectedDev.country}</Descriptions.Item>
              <Descriptions.Item label="Office Address">{selectedDev.address || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Website" span={2}>
                {selectedDev.websiteUrl ? <a href={selectedDev.websiteUrl} target="_blank" rel="noreferrer" style={{ color: "#5c039b" }}>{selectedDev.websiteUrl}</a> : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>{selectedDev.description || 'No description provided.'}</Descriptions.Item>
            </Descriptions>

            {/* Documents Section */}
            {selectedDev.documents && selectedDev.documents.length > 0 && (
              <>
                <Divider orientation="left" style={{ marginTop: "32px" }}>Developer Documents</Divider>
                <Row gutter={[12, 12]}>
                  {selectedDev.documents.map((doc, i) => (
                    <Col xs={24} sm={12} md={8} key={i}>
                      <Card size="small" bordered style={{ background: '#f9fafb', borderRadius: "8px" }}>
                        <Space>
                          <FileTextOutlined style={{ color: "#5c039b" }} />
                          <a href={doc} target="_blank" rel="noreferrer" style={{ color: "#374151", fontWeight: "500" }}>View Document {i + 1}</a>
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </>
            )}

            {/* Properties Table Section */}
            <Divider orientation="left" style={{ marginTop: "32px" }}>Properties Portfolio</Divider>
            <Table
              columns={propertyColumns}
              dataSource={devProperties}
              rowKey={(record) => record._id || record.id}
              loading={loadingProps}
              pagination={{ pageSize: 5, position: ["bottomCenter"] }}
              size="middle"
              style={{ border: "1px solid #f0f0f0", borderRadius: "8px" }}
            />

          </div>
        ) : <div style={{ textAlign: "center", padding: "40px" }}><Spin size="large" /></div>}
      </Modal>

    </div>
  );
};

export default DeveloperList;