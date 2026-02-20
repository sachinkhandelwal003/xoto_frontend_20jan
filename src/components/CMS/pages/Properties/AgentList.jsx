import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  Table,
  Typography,
  Avatar,
  Row,
  Col,
  Statistic,
  Space,
  message,
  Tooltip,
  Modal,
  Button,
  Popconfirm,
  Select,
  Badge,
  Tag,
  Spin,
  Image,
  Divider,
  Switch 
} from "antd";
import {
  UserOutlined,
  DeleteOutlined,
  EyeOutlined,
  UsergroupAddOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  StarOutlined,
  FileProtectOutlined,
  CrownOutlined,
  CheckOutlined,
  CloseOutlined 
} from "@ant-design/icons";

const { Title, Text } = Typography;

const AgentList = () => {
  const BASE_URL = "https://xoto.ae/api/agent";

  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const [viewModal, setViewModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/get-all-agents`);
      const list = res.data?.data || res.data || [];
      setAgents(list);
      setTotal(list.length);
    } catch (err) {
      message.error("Failed to fetch agents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const deleteAgent = async (record) => {
    const id = record?._id || record?.id;
    if (!id) return message.error("Invalid ID");

    try {
      await axios.delete(`${BASE_URL}/delete-agent/${id}`);
      message.success("Agent deleted");
      fetchAgents();
    } catch (err) {
      message.error("Delete failed");
    }
  };

  const updateOnboardingStatus = async (record, status) => {
    const id = record?._id || record?.id;
    if (!id) return;

    try {
      await axios.post(
        `${BASE_URL}/update-agent?id=${id}`,
        { onboarding_status: status }
      );
      message.success("Status updated successfully");
      fetchAgents();
    } catch (err) {
      message.error("Status update failed");
    }
  };

  const updateVerificationStatus = async (record, checked) => {
    const id = record?._id || record?.id;
    if (!id) return;

    try {
      await axios.post(
        `${BASE_URL}/update-agent?id=${id}`,
        { isVerified: checked } 
      );
      message.success(`Agent ${checked ? 'verified' : 'unverified'} successfully`);
      fetchAgents(); 
    } catch (err) {
      message.error("Verification update failed");
    }
  };

  const openViewModal = (record) => {
    setSelectedAgent(record);
    setViewModal(true);
  };

  const columns = [
    {
      title: "Agent Name",
      render: (_, record) => (
        <Space>
          <Avatar size={45} src={record.profile_photo || null} icon={!record.profile_photo && <UserOutlined />} style={{ backgroundColor: '#f9f0ff', color: '#722ed1' }} />
          <Text strong>{record.first_name} {record.last_name}</Text>
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Verified",
      dataIndex: "isVerified",
      render: (isVerified, record) => (
        <Switch
          checked={isVerified}
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
          onChange={(checked) => updateVerificationStatus(record, checked)}
          style={{ backgroundColor: isVerified ? '#52c41a' : undefined }}
        />
      )
    },
    {
      title: "Onboarding Status",
      dataIndex: "onboarding_status",
      render: (status, record) => (
        <Select
          value={status}
          style={{ width: 140 }}
          onChange={(value) => updateOnboardingStatus(record, value)}
          options={[
            { label: "Registered", value: "registered" },
            { label: "Approved", value: "approved" },
            { label: "Completed", value: "completed" },
          ]}
        />
      ),
    },
    {
      title: "Action",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View Full Details">
            <EyeOutlined
              style={{ color: "#722ed1", fontSize: "18px", cursor: "pointer" }}
              onClick={() => openViewModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Agent">
            <Popconfirm
              title="Are you sure you want to delete this agent?"
              okText="Yes, Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
              onConfirm={() => deleteAgent(record)}
            >
              <DeleteOutlined style={{ color: "#f5222d", fontSize: "18px", cursor: "pointer" }} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} style={{ margin: 0 }}>Agent Management</Title>
          <Text type="secondary">Manage all registered platform agents and brokers</Text>
        </div>
      </div>

      <Row className="mb-6">
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false} className="shadow-sm rounded-xl">
            <Statistic
              title="Total Registered Agents"
              value={total}
              prefix={
                <div className="p-2 rounded-lg mr-3 bg-blue-50 text-blue-500 flex items-center justify-center">
                  <UsergroupAddOutlined />
                </div>
              }
              valueStyle={{ fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} className="shadow-sm rounded-xl">
        <Table
          columns={columns}
          dataSource={agents}
          rowKey={(record) => record._id || record.id}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        open={viewModal}
        onCancel={() => setViewModal(false)}
        width={700} 
        footer={null} 
        closeIcon={<CloseCircleOutlined style={{ fontSize: '20px', color: '#999' }} />}
        bodyStyle={{ padding: 0 }}
      >
        {selectedAgent ? (
          <div>
            <div style={{ backgroundColor: '#f9f0ff', padding: '30px 20px', textAlign: 'center', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
              <Avatar 
                size={100} 
                src={selectedAgent.profile_photo || null} 
                icon={!selectedAgent.profile_photo && <UserOutlined />} 
                style={{ border: '4px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
              />
              <Title level={3} style={{ marginTop: '15px', marginBottom: '5px' }}>
                {selectedAgent.first_name} {selectedAgent.last_name}
              </Title>
              <Space size="middle">
                {selectedAgent.isVerified ? <Tag color="success" icon={<CheckCircleOutlined />}>Verified</Tag> : <Tag color="error" icon={<CloseCircleOutlined />}>Not Verified</Tag>}
                <Tag color="purple" style={{ textTransform: 'capitalize' }}>Status: {selectedAgent.onboarding_status}</Tag>
              </Space>
            </div>

            <div style={{ padding: '24px 30px' }}>
              
              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <Card size="small" title="Contact Information" bordered={false} className="bg-gray-50 rounded-lg h-full">
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <div className="flex items-center"><MailOutlined className="text-purple-600 mr-3" /> <Text>{selectedAgent.email}</Text></div>
                      <div className="flex items-center"><PhoneOutlined className="text-purple-600 mr-3" /> <Text>{selectedAgent.country_code} {selectedAgent.phone_number}</Text></div>
                      <div className="flex items-center"><EnvironmentOutlined className="text-purple-600 mr-3" /> <Text className="capitalize">{selectedAgent.operating_city}</Text></div>
                      <div className="flex items-center"><GlobalOutlined className="text-purple-600 mr-3" /> <Text>{selectedAgent.country}</Text></div>
                    </Space>
                  </Card>
                </Col>

                <Col xs={24} md={12}>
                  <Card size="small" title="Professional Details" bordered={false} className="bg-gray-50 rounded-lg h-full">
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <div className="flex items-center"><StarOutlined className="text-purple-600 mr-3" /> <Text type="secondary">Specialization:</Text> <Text strong className="capitalize ml-1">{selectedAgent.specialization || 'N/A'}</Text></div>
                      <div className="flex items-center"><CrownOutlined className="text-purple-600 mr-3" /> <Text type="secondary">Plan:</Text> <Text strong className="capitalize ml-1">{selectedAgent.subscriptionPlan || 'Free'}</Text></div>
                      <div>
                        <Text type="secondary" className="block mb-1">Role ID:</Text>
                        <Text code copyable className="text-xs">{selectedAgent.role}</Text>
                      </div>
                    </Space>
                  </Card>
                </Col>
              </Row>

              <Divider />

              <Title level={5} style={{ marginBottom: 16 }}><FileProtectOutlined className="mr-2"/> Uploaded Documents</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ border: '1px dashed #d9d9d9', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                    <Text type="secondary" className="block mb-2">Emirates ID Proof</Text>
                    {selectedAgent.id_proof ? (
                      <Image 
                        width={120} 
                        height={80} 
                        style={{ objectFit: 'cover', borderRadius: '4px' }}
                        src={selectedAgent.id_proof} 
                        alt="ID Proof"
                        preview={{ mask: 'Click to View' }}
                      />
                    ) : (
                      <div className="py-4"><Text type="secondary" italic>No ID Uploaded</Text></div>
                    )}
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ border: '1px dashed #d9d9d9', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                    <Text type="secondary" className="block mb-2">RERA Certificate</Text>
                    {selectedAgent.rera_certificate ? (
                      <Image 
                        width={120} 
                        height={80}
                        style={{ objectFit: 'cover', borderRadius: '4px' }} 
                        src={selectedAgent.rera_certificate} 
                        alt="RERA Cert"
                        preview={{ mask: 'Click to View' }}
                      />
                    ) : (
                      <div className="py-4"><Text type="secondary" italic>No Cert Uploaded</Text></div>
                    )}
                  </div>
                </Col>
              </Row>

              <div className="text-right mt-6">
                <Button type="primary" style={{ backgroundColor: '#722ed1' }} onClick={() => setViewModal(false)}>
                  Close Profile
                </Button>
              </div>

            </div>
          </div>
        ) : (
          <div className="text-center py-10"><Spin size="large" tip="Loading Profile..." /></div>
        )}
      </Modal>
    </div>
  );
};

export default AgentList;