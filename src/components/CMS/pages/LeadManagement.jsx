import React, { useState } from 'react';
import { 
  Table, Tag, Space, Card, Typography, Row, Col, Statistic, 
  Button, Modal, Input, Select, Badge, Avatar, Divider, Tooltip 
} from 'antd';
import { 
  UserOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  MessageOutlined,
  PropertySafetyOutlined,
  CompassOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined // ✅ Yeh miss ho gaya tha!
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

// --- STATIC DUMMY DATA ---
const mockLeads = [
  {
    key: '1',
    leadName: 'Amit Vikram',
    email: 'amit@gmail.com',
    phone: '+971 50 123 4567',
    agentName: 'Rahul Sharma',
    propertyInterest: 'Ellington One River Point',
    budget: 'AED 1.5M - 2M',
    source: 'Instagram Ad',
    status: 'Site Visit',
    createdAt: '2026-02-19',
  },
  {
    key: '2',
    leadName: 'Sarah Jenkins',
    email: 'sarah.j@outlook.com',
    phone: '+971 52 987 6543',
    agentName: 'Anjali Gupta',
    propertyInterest: 'Damac Lagoons',
    budget: 'AED 3M+',
    source: 'Website',
    status: 'New',
    createdAt: '2026-02-20',
  },
  {
    key: '3',
    leadName: 'John Doe',
    email: 'john.doe@tech.com',
    phone: '+91 9876543210',
    agentName: 'Rahul Sharma',
    propertyInterest: 'Jumeirah Living',
    budget: 'AED 5M',
    source: 'Referral',
    status: 'Negotiation',
    createdAt: '2026-02-15',
  },
];

const LeadManagement = () => {
  const [viewModal, setViewModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const getStatusTag = (status) => {
    const colors = {
      'New': 'blue',
      'Contacted': 'cyan',
      'Site Visit': 'purple',
      'Negotiation': 'orange',
      'Won': 'success',
      'Lost': 'error'
    };
    return <Tag color={colors[status] || 'default'}>{status.toUpperCase()}</Tag>;
  };

  const columns = [
    {
      title: 'Lead Details',
      key: 'lead',
      render: (_, r) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#f0f0f0', color: '#1a1a1a' }} />
          <div>
            <Text strong className="block">{r.leadName}</Text>
            <Text type="secondary" style={{ fontSize: '11px' }}>{r.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Agent (Owner)',
      dataIndex: 'agentName',
      key: 'agent',
      render: (text) => <Tag icon={<UserOutlined />} color="geekblue">{text}</Tag>
    },
    {
      title: 'Property Interest',
      dataIndex: 'propertyInterest',
      key: 'property',
      render: (text) => <Text strong><CompassOutlined /> {text}</Text>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status)
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button 
          icon={<EyeOutlined />} 
          onClick={() => { setSelectedLead(record); setViewModal(true); }}
        >
          View
        </Button>
      )
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2}>Lead Management</Title>
          <Text type="secondary">Track user inquiries and agent performance in the sales funnel.</Text>
        </div>
        <Button type="primary" icon={<FilterOutlined />}>Export Report</Button>
      </div>

      {/* LEAD PIPELINE SNAPSHOTS */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} sm={6}>
          <Card bordered={false} className="shadow-sm border-l-4 border-blue-500">
            <Statistic title="Total Leads" value={145} prefix={<MessageOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card bordered={false} className="shadow-sm border-l-4 border-purple-500">
            <Statistic title="Site Visits" value={32} prefix={<CompassOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card bordered={false} className="shadow-sm border-l-4 border-orange-500">
            <Statistic title="Negotiations" value={12} prefix={<ClockCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card bordered={false} className="shadow-sm border-l-4 border-green-500">
            <Statistic title="Conversion Rate" value="18.5%" prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} className="shadow-md rounded-xl overflow-hidden">
        <div className="p-4 bg-white border-b flex justify-between items-center">
          <Space>
            <Input prefix={<SearchOutlined />} placeholder="Search Lead or Agent..." style={{ width: 250 }} />
            <Select defaultValue="all" style={{ width: 150 }}>
              <Option value="all">All Status</Option>
              <Option value="new">New</Option>
              <Option value="visit">Site Visit</Option>
            </Select>
          </Space>
        </div>
        <Table columns={columns} dataSource={mockLeads} pagination={{ pageSize: 5 }} />
      </Card>

      {/* LEAD DETAIL MODAL */}
      <Modal
        title="Lead Timeline & Details"
        open={viewModal}
        onCancel={() => setViewModal(false)}
        footer={[
          <Button key="close" onClick={() => setViewModal(false)}>Close</Button>,
          <Button key="assign" type="primary">Re-assign Agent</Button>
        ]}
        width={600}
      >
        {selectedLead && (
          <div className="py-2">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text type="secondary" className="block">Lead Name</Text>
                <Text strong style={{fontSize: 18}}>{selectedLead.leadName}</Text>
              </Col>
              <Col span={12} className="text-right">
                {getStatusTag(selectedLead.status)}
              </Col>
            </Row>
            
            <Divider style={{margin: '12px 0'}} />
            
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Space direction="vertical" size={0}>
                  <Text type="secondary"><MailOutlined /> Email</Text>
                  <Text>{selectedLead.email}</Text>
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size={0}>
                  <Text type="secondary"><PhoneOutlined /> Phone</Text>
                  <Text>{selectedLead.phone}</Text>
                </Space>
              </Col>
            </Row>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <Title level={5}><PropertySafetyOutlined /> Interest Details</Title>
              <Row gutter={[8, 8]}>
                <Col span={12}><Text type="secondary">Property:</Text></Col>
                <Col span={12}><Text strong>{selectedLead.propertyInterest}</Text></Col>
                
                <Col span={12}><Text type="secondary">Budget:</Text></Col>
                <Col span={12}><Text strong>{selectedLead.budget}</Text></Col>
                
                <Col span={12}><Text type="secondary">Source:</Text></Col>
                <Col span={12}><Tag color="blue">{selectedLead.source}</Tag></Col>
              </Row>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LeadManagement;