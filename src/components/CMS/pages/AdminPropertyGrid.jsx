import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Card, Table, Typography, Avatar, Row, Col, Statistic, Space,
  message, Tooltip, Modal, Button, Popconfirm, Tag, Spin, Image, Divider
} from 'antd';
import {
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  PropertySafetyOutlined,
  EnvironmentOutlined,
  BankOutlined,
  HomeOutlined
} from '@ant-design/icons';
import Input from 'antd/es/input';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const THEME = { primary: "#7c3aed", success: "#10b981" };

const AdminPropertyList = () => {
  const BASE_URL = "https://xoto.ae/api/property";

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');

  const [viewModal, setViewModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  const fetchAllProperties = useCallback(async (page, limit, search) => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/get-all-properties`, {
        params: { 
          page, 
          limit, 
          search: search || undefined 
        }
      });
      
      const resData = response.data;
      const list = resData?.data || resData || [];
      setProperties(Array.isArray(list) ? list : []);
      setTotal(resData?.pagination?.total || resData?.total || list.length);
    } catch (err) {
      message.error("Failed to load properties list.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
        fetchAllProperties(currentPage, pageSize, searchText);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText, currentPage, pageSize, fetchAllProperties]);

  const handleDelete = async (id) => {
    try {
      await axios.post(`${BASE_URL}/delete-property?id=${id}`);
      message.success("Property deleted");
      fetchAllProperties(currentPage, pageSize, searchText);
    } catch (err) {
      message.error("Delete failed");
    }
  };

  const openModal = (record) => {
    setSelectedProperty(record);
    setViewModal(true);
  };

  const columns = [
    {
      title: 'Property Image',
      key: 'image',
      width: 120,
      render: (_, r) => (
        /* ✅ Logic Change: Pehle photos[0] check karega, fir mainLogo */
        <Image
          width={80}
          height={60}
          className="rounded-md object-cover"
          src={r.photos && r.photos.length > 0 ? r.photos[0] : r.mainLogo}
          fallback="https://via.placeholder.com/80x60?text=No+Image"
          preview={false} // Table mein preview off rakha hai, View Modal mein on hai
        />
      )
    },
    {
      title: 'Property Name',
      key: 'name',
      render: (_, r) => (
        <div>
          <Text strong className="block">{r.propertyName}</Text>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            <BankOutlined /> {r.developer?.name || 'No Developer'}
          </Text>
        </div>
      )
    },
    {
      title: 'Price Range',
      render: (_, r) => (
        <Text strong style={{ color: THEME.primary }}>
          {r.currency} {r.price_min?.toLocaleString()} - {r.price_max?.toLocaleString()}
        </Text>
      )
    },
    {
      title: 'Location',
      render: (_, r) => <Text type="secondary"><EnvironmentOutlined /> {r.area}, {r.city}</Text>
    },
    {
      title: 'Status',
      align: 'center',
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          {r.notReadyYet ? <Tag color="orange">Off Plan</Tag> : <Tag color="blue">Ready</Tag>}
          {r.isAvailable ? <Tag color="green">Available</Tag> : <Tag color="red">Sold</Tag>}
        </Space>
      )
    },
    {
      title: 'Action',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button type="primary" ghost icon={<EyeOutlined />} onClick={() => openModal(record)} size="small">View</Button>
          <Popconfirm title="Delete?" onConfirm={() => handleDelete(record._id)}>
            <Button type="primary" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Row gutter={[16, 16]} className="mb-6" align="middle">
        <Col span={12}>
           <Title level={3} style={{ margin: 0 }}>All Properties</Title>
           <Text type="secondary">Complete listing with property previews</Text>
        </Col>
        <Col span={12} className="text-right">
           <Statistic title="Total Listing" value={total} prefix={<HomeOutlined />} />
        </Col>
      </Row>

      <Card bordered={false} className="shadow-sm mb-6">
        <Input 
          prefix={<SearchOutlined />} 
          placeholder="Search by name or area..." 
          size="large"
          allowClear
          onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
        />
      </Card>

      <Card bordered={false} bodyStyle={{ padding: 0 }} className="shadow-md rounded-xl overflow-hidden">
        <Table
          columns={columns}
          dataSource={properties}
          loading={loading}
          rowKey="_id"
          pagination={{
            current: currentPage,
            total: total,
            pageSize: pageSize,
            onChange: (p) => setCurrentPage(p),
          }}
        />
      </Card>

      {/* VIEW MODAL */}
      <Modal
        title="Property Detailed View"
        open={viewModal}
        onCancel={() => setViewModal(false)}
        width={1000}
        footer={null}
        centered
      >
        {selectedProperty && (
          <div style={{ maxHeight: '75vh', overflowY: 'auto', padding: '10px' }}>
             <div className="mb-6">
                <Image.PreviewGroup>
                   <Row gutter={[12, 12]}>
                      {selectedProperty.photos?.map((img, i) => (
                        <Col span={i === 0 ? 24 : 6} key={i}>
                           <Image 
                            src={img} 
                            style={{ 
                                height: i === 0 ? 350 : 120, 
                                width: '100%', 
                                objectFit: 'cover', 
                                borderRadius: 12,
                                border: '1px solid #f0f0f0' 
                            }} 
                           />
                        </Col>
                      ))}
                   </Row>
                </Image.PreviewGroup>
             </div>

             <Row gutter={24}>
                <Col span={16}>
                   <Title level={3}>{selectedProperty.propertyName}</Title>
                   <Space wrap className="mb-4">
                      <Tag color="purple" style={{padding: '2px 10px'}}>{selectedProperty.propertyType}</Tag>
                      <Tag color="blue">{selectedProperty.propertySubType}</Tag>
                      <Text type="secondary" style={{fontSize: '16px'}}>
                        <EnvironmentOutlined /> {selectedProperty.area}, {selectedProperty.city}
                      </Text>
                   </Space>
                   <Divider style={{margin: '12px 0'}} />
                   <Title level={5}>Description</Title>
                   <Paragraph style={{color: '#4b5563', lineHeight: '1.8'}}>
                        {selectedProperty.description || "No description provided."}
                   </Paragraph>
                </Col>
                <Col span={8}>
                   <Card size="small" title="Commercial Details" className="shadow-sm">
                      <Statistic 
                        title="Starting Price" 
                        value={selectedProperty.price_min} 
                        prefix={selectedProperty.currency} 
                        valueStyle={{color: THEME.primary, fontWeight: 'bold'}}
                      />
                      <Divider style={{ margin: '12px 0' }} />
                      <Text type="secondary">Status: </Text>
                      {selectedProperty.isAvailable ? <Tag color="green">Available</Tag> : <Tag color="red">Sold</Tag>}
                      <div style={{marginTop: '10px'}}>
                        <Text type="secondary">Handover: </Text>
                        <Text strong>{selectedProperty.handover ? dayjs(selectedProperty.handover).format('MMM YYYY') : 'Ready Move'}</Text>
                      </div>
                   </Card>
                </Col>
             </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminPropertyList;