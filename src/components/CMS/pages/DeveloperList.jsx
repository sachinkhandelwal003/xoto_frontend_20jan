import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Navigation ke liye
import {
  Card, Table, Typography, Avatar, Row, Col, Statistic, Space,
  message, Tooltip, Modal, Button, Popconfirm, Tag, Spin, Image, Divider, Switch, Input
} from "antd";
import {
  BankOutlined, DeleteOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined,
  MailOutlined, PhoneOutlined, EnvironmentOutlined, HomeOutlined, SearchOutlined,
  UsergroupAddOutlined, CheckOutlined, CloseOutlined, FileTextOutlined, ArrowRightOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

const THEME = { primary: "#1890ff", success: "#10b981" };

const DeveloperList = () => {
  const BASE_URL = "https://xoto.ae/api/property";
  const navigate = useNavigate(); // Navigation initialize kiya

  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');

  const [viewModal, setViewModal] = useState(false);
  const [selectedDev, setSelectedDev] = useState(null);
  const [devProperties, setDevProperties] = useState([]);
  const [loadingProps, setLoadingProps] = useState(false);

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

  const fetchPropertiesByDeveloper = async (devId) => {
    setLoadingProps(true);
    try {
      const response = await axios.get(`${BASE_URL}/get-all-properties`, {
        params: { limit: 500 }
      });
      const allProps = response.data?.data || response.data || [];
      const filtered = allProps.filter(p => (p.developer?._id || p.developer) === devId);
      setDevProperties(filtered);
    } catch (err) {
      setDevProperties([]);
    } finally {
      setLoadingProps(false);
    }
  };

  const handleStatusToggle = async (record, checked) => {
    setActionLoading(record._id || record.id);
    try {
      const payload = { ...record, isVerifiedByAdmin: checked };
      delete payload._id; 
      await axios.post(`${BASE_URL}/edit-developer`, payload, {
        params: { id: record._id || record.id }
      });
      message.success(`Developer status updated!`);
      fetchDevelopers(currentPage, pageSize, searchText);
    } catch (err) {
      message.error("Status update failed");
    } finally {
      setActionLoading(false);
    }
  };

  const openViewModal = (record) => {
    setSelectedDev(record);
    setViewModal(true);
    fetchPropertiesByDeveloper(record._id || record.id);
  };

  const columns = [
    {
      title: "Developer Name",
      render: (_, record) => (
        <Space>
          <Avatar 
            shape="square" size={50} src={record.logo}
            style={{ backgroundColor: record.isVerifiedByAdmin ? THEME.success : THEME.primary, borderRadius: '8px' }}
          >
            {record.logo ? null : record.name?.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <Text strong className="block">{record.name || "N/A"}</Text>
            <Text type="secondary" style={{ fontSize: '11px' }}>{record.email}</Text>
          </div>
        </Space>
      ),
    },
    { title: 'City', dataIndex: 'city', render: (c) => c || 'N/A' },
    {
      title: 'Verified',
      dataIndex: 'isVerifiedByAdmin',
      align: 'center',
      render: (checked, record) => (
        <Switch 
          checked={checked}
          loading={actionLoading === (record._id || record.id)}
          onChange={(val) => handleStatusToggle(record, val)}
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
        />
      ),
    },
    {
      title: "Action",
      align: 'center',
      render: (_, record) => (
        <Button type="primary" ghost icon={<EyeOutlined />} onClick={() => openViewModal(record)} size="small">
          View Profile
        </Button>
      ),
    },
  ];

  const propertyColumns = [
    { title: 'Property Name', dataIndex: 'propertyName', key: 'name', render: t => <Text strong>{t}</Text> },
    { title: 'Type', dataIndex: 'propertyType', render: t => <Tag color="blue">{t}</Tag> },
    { title: 'Price (Min)', dataIndex: 'price_min', render: (p, r) => `${r.currency || 'AED'} ${p?.toLocaleString()}` },
    { title: 'Status', render: (_, r) => r.isAvailable ? <Tag color="green">Available</Tag> : <Tag color="red">Sold</Tag> },
  ];

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <Title level={3}>Developer Management</Title>
      
      <Card bordered={false} className="shadow-md mb-6" bodyStyle={{ padding: '16px' }}>
        <Input 
          prefix={<SearchOutlined />} 
          placeholder="Search developer..." 
          className="max-w-md"
          onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
          allowClear
        />
      </Card>

      <Card bordered={false} className="shadow-md" bodyStyle={{ padding: 0 }}>
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
          }}
        />
      </Card>

      <Modal
        open={viewModal}
        onCancel={() => setViewModal(false)}
        width={1000}
        footer={null}
        destroyOnClose
      >
        {selectedDev ? (
          <div className="p-4">
            <div className="text-center mb-6">
              <Avatar size={80} shape="square" src={selectedDev.logo} style={{ backgroundColor: THEME.primary }}>
                 {selectedDev.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Title level={3} className="mt-4">{selectedDev.name}</Title>
              <Space>
                {selectedDev.isVerifiedByAdmin ? <Tag color="success">Verified</Tag> : <Tag color="error">Unverified</Tag>}
                <Tag color="blue">RERA: {selectedDev.reraNumber || 'N/A'}</Tag>
              </Space>
            </div>

            {/* Complete Data Show Section */}
            <Divider orientation="left">Contact & Location</Divider>
            <Row gutter={[16, 24]} className="mb-6">
              <Col span={12}><Text type="secondary">Email Address</Text> <br/> <Text strong>{selectedDev.email}</Text></Col>
              <Col span={12}><Text type="secondary">Phone Number</Text> <br/> <Text strong>{selectedDev.country_code} {selectedDev.phone_number}</Text></Col>
              <Col span={12}><Text type="secondary">City & Country</Text> <br/> <Text strong>{selectedDev.city}, {selectedDev.country}</Text></Col>
              <Col span={12}><Text type="secondary">Office Address</Text> <br/> <Text strong>{selectedDev.address || 'N/A'}</Text></Col>
              <Col span={24}><Text type="secondary">Website</Text> <br/> <a href={selectedDev.websiteUrl} target="_blank" rel="noreferrer">{selectedDev.websiteUrl || 'N/A'}</a></Col>
              <Col span={24}><Text type="secondary">Description</Text> <br/> <Text>{selectedDev.description || 'No description provided.'}</Text></Col>
            </Row>

            {/* Documents Section */}
            {selectedDev.documents && selectedDev.documents.length > 0 && (
              <>
                <Divider orientation="left">Developer Documents</Divider>
                <Row gutter={[12, 12]} className="mb-6">
                  {selectedDev.documents.map((doc, i) => (
                    <Col span={8} key={i}>
                      <Card size="small" bordered style={{ background: '#f5f5f5' }}>
                        <Space>
                          <FileTextOutlined style={{ color: THEME.primary }} />
                          <a href={doc} target="_blank" rel="noreferrer">View Document {i + 1}</a>
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </>
            )}

            <Divider orientation="left">Developer's Properties</Divider>
            <Table 
              columns={propertyColumns} 
              dataSource={devProperties} 
              loading={loadingProps} 
              size="small" 
              pagination={{ pageSize: 5 }} 
            />

            {/* ✅ See Properties Navigation Button */}
            <div className="text-center mt-8">
               <Button 
                type="primary" 
                size="large" 
                icon={<ArrowRightOutlined />}
                onClick={() => navigate(`/admin/developer-properties/${selectedDev?._id || selectedDev?.id}`)}
                style={{ backgroundColor: THEME.primary, height: '45px', borderRadius: '8px', padding: '0 40px' }}
               >
                 See Full Property List
               </Button>
            </div>
          </div>
        ) : <div className="text-center p-10"><Spin /></div>}
      </Modal>
    </div>
  );
};

export default DeveloperList;