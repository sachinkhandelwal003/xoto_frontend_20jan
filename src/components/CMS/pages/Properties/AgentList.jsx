import React, { useState, useEffect } from "react";
import { apiService } from "../../../../manageApi/utils/custom.apiservice";
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
  Popconfirm,
  Select,
  Badge,
  Tag,
  Spin,
  Image,
  Divider,
  Switch,
  Descriptions // <--- Ye miss ho gaya tha!
} from "antd";
import {
  UserOutlined,
  DeleteOutlined,
  EyeOutlined,
  UsergroupAddOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  StarOutlined,
  FileProtectOutlined,
  CrownOutlined,
  IdcardOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

const AgentList = () => {
  // const BASE_URL = "https://xoto.ae/api/agent";
  const BASE_URL = "http://localhost:5000/api/agent";

  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [viewModal, setViewModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);

  // ✅ FETCH AGENTS
  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await apiService.get("/agent/get-all-agents");

const list = res?.data || res || [];

setAgents(list);
    } catch (err) {
      message.error("Failed to fetch agents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  // ✅ DELETE AGENT
  const deleteAgent = async (record) => {
    const id = record?._id || record?.id;
    if (!id) return message.error("Invalid ID");

    try {
await apiService.delete(`/agent/delete-agent/${id}`);
      message.success("Agent permanently deleted");
      fetchAgents();
    } catch (err) {
      message.error("Delete failed");
    }
  };

  // ✅ UPDATE ONBOARDING STATUS
  const updateOnboardingStatus = async (record, status) => {
    const id = record?._id || record?.id;
    if (!id) return;

    try {
      await apiService.post(
  `/agent/update-agent?id=${id}`,
  { onboarding_status: status }
);
      message.success(`Status updated to ${status.toUpperCase()}`);
      fetchAgents();
    } catch (err) {
      message.error("Status update failed");
    }
  };

  // ✅ UPDATE VERIFICATION STATUS
  const updateVerificationStatus = async (record, checked) => {
    const id = record?._id || record?.id;
    if (!id) return;

    try {
      await apiService.post(
  `/agent/update-agent?id=${id}`,
  { isVerified: checked }
);
      message.success(`Agent ${checked ? 'Verified' : 'Unverified'} successfully`);
      fetchAgents(); 
    } catch (err) {
      message.error("Verification update failed");
    }
  };

  // ✅ OPEN VIEW MODAL
  const openViewModal = (record) => {
    setSelectedAgent(record);
    setViewModal(true);
  };

  // Quick Stats Calculations
  const totalAgents = agents.length;
  const verifiedAgents = agents.filter(a => a.isVerified).length;
  const pendingApprovals = agents.filter(a => a.onboarding_status === "registered" || !a.isVerified).length;

  const stats = [
    { title: "Total Agents", value: totalAgents, icon: <UsergroupAddOutlined />, color: "#2563eb", bg: "#dbeafe" },
    { title: "Verified & Active", value: verifiedAgents, icon: <CheckCircleOutlined />, color: "#059669", bg: "#d1fae5" },
    { title: "Pending Approvals", value: pendingApprovals, icon: <ClockCircleOutlined />, color: "#d97706", bg: "#fef3c7" },
  ];

  const columns = [
    {
      title: "Agent Profile",
      render: (_, record) => (
        <Space size="middle">
          <Avatar 
            size={42} 
            src={record.profile_photo || null} 
            icon={!record.profile_photo && <UserOutlined />} 
            style={{ backgroundColor: "#f3e8ff", color: "#5c039b", fontWeight: "bold" }}
          >
            {!record.profile_photo && record.first_name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Text strong style={{ fontSize: "15px", color: "#1f2937", textTransform: "capitalize" }}>
              {record.first_name} {record.last_name}
            </Text>
            <Text type="secondary" style={{ fontSize: "12px" }}>ID: {(record._id || record.id)?.slice(-6).toUpperCase()}</Text>
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
      title: "Onboarding Status",
      dataIndex: "onboarding_status",
      render: (status, record) => (
        <Select
          value={status || "registered"}
          style={{ width: 140, fontWeight: "500" }}
          dropdownStyle={{ borderRadius: "8px" }}
          bordered={false}
          className="custom-status-select"
          onChange={(value) => updateOnboardingStatus(record, value)}
          options={[
            { value: "registered", label: <Badge status="warning" text="Registered" /> },
            { value: "approved", label: <Badge status="processing" text="Approved" /> },
            { value: "completed", label: <Badge status="success" text="Completed" /> }
          ]}
        />
      ),
    },
    {
      title: "Verification",
      dataIndex: "isVerified",
      align: "center",
      render: (isVerified, record) => (
        <Space direction="vertical" size={2}>
          <Switch
            checked={isVerified}
            onChange={(checked) => updateVerificationStatus(record, checked)}
            style={{ background: isVerified ? "#059669" : "#ef4444" }}
          />
          <Text type="secondary" style={{ fontSize: "11px", color: isVerified ? "#059669" : "#ef4444", fontWeight: "500" }}>
            {isVerified ? "Verified" : "Unverified"}
          </Text>
        </Space>
      )
    },
    {
      title: "Actions",
      align: "right",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View Profile">
            <Button 
              type="text" 
              icon={<EyeOutlined style={{ fontSize: "18px", color: "#5c039b" }} />} 
              onClick={() => openViewModal(record)}
            />
          </Tooltip>

          <Tooltip title="Delete Agent">
            <Popconfirm
              title="Delete this agent?"
              description="This action cannot be undone."
              okText="Yes, Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
              onConfirm={() => deleteAgent(record)}
            >
              <Button type="text" danger icon={<DeleteOutlined style={{ fontSize: "18px" }} />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f8f9fa", minHeight: "100vh" }}>
      
      {/* HEADER */}
      <div style={{ marginBottom: "32px", display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ padding: "10px", background: "#f3e8ff", borderRadius: "10px", color: "#5c039b" }}>
          <UsergroupAddOutlined style={{ fontSize: "24px" }} />
        </div>
        <div>
          <Title level={2} style={{ margin: 0, color: "#1f2937" }}>
            Agent Management
          </Title>
          <Text type="secondary" style={{ fontSize: "15px" }}>
            Manage all registered platform agents and individual brokers.
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

      {/* DATA TABLE */}
      <Card 
        bordered={false} 
        style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ padding: "24px", borderBottom: "1px solid #f0f0f0" }}>
          <Title level={5} style={{ margin: 0, color: "#374151" }}>Registered Agents Directory</Title>
        </div>
        <Table
          columns={columns}
          dataSource={agents}
          rowKey={(record) => record._id || record.id}
          loading={loading}
          pagination={{ pageSize: 10, position: ["bottomCenter"] }}
          style={{ padding: "0 24px 24px 24px" }}
        />
      </Card>

      {/* READ-ONLY VIEW MODAL */}
      <Modal
        title={
          <Space>
            <UserOutlined style={{ color: "#5c039b" }} />
            <Text strong style={{ fontSize: "18px" }}>Agent Complete Profile</Text>
          </Space>
        }
        open={viewModal}
        onCancel={() => setViewModal(false)}
        width={750}
        centered
        destroyOnClose
        styles={{ padding: "24px" }}
        footer={[
          <Button key="close" type="primary" style={{ background: "#5c039b" }} onClick={() => setViewModal(false)}>
            Close View
          </Button>
        ]}
      >
        {selectedAgent ? (
          <div style={{ marginTop: "20px" }}>
            
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <Avatar 
                size={86} 
                src={selectedAgent.profile_photo || null}
                style={{ backgroundColor: "#f3e8ff", color: "#5c039b", fontSize: "32px", fontWeight: "bold", border: "3px solid #f3e8ff" }}
              >
                {!selectedAgent.profile_photo && selectedAgent.first_name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Title level={4} style={{ marginTop: "12px", marginBottom: "4px", textTransform: "capitalize" }}>
                {selectedAgent.first_name} {selectedAgent.last_name}
              </Title>
              <Space>
                <Tag color={selectedAgent.isVerified ? "green" : "red"}>
                  {selectedAgent.isVerified ? "Verified Agent" : "Unverified"}
                </Tag>
                <Tag color="purple" style={{ textTransform: "capitalize" }}>
                  Status: {selectedAgent.onboarding_status}
                </Tag>
              </Space>
            </div>

            <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} size="middle" labelStyle={{ fontWeight: "600", color: "#4b5563", width: "140px" }}>
              <Descriptions.Item label="Email Address">{selectedAgent.email}</Descriptions.Item>
              <Descriptions.Item label="Phone Number">{selectedAgent.country_code} {selectedAgent.phone_number}</Descriptions.Item>
              <Descriptions.Item label="Operating City"><span style={{ textTransform: "capitalize" }}>{selectedAgent.operating_city || 'N/A'}</span></Descriptions.Item>
              <Descriptions.Item label="Country">{selectedAgent.country || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Specialization">
                <Text strong style={{ textTransform: "capitalize", color: "#5c039b" }}><StarOutlined style={{ marginRight: '6px' }}/>{selectedAgent.specialization || 'N/A'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Subscription">
                <Tag icon={<CrownOutlined />} color="gold">{selectedAgent.subscriptionPlan || 'Free'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Role & ID" span={2}>
                <Text code>{selectedAgent.role}</Text> / <Text type="secondary" style={{ fontSize: "12px" }}>{selectedAgent._id || selectedAgent.id}</Text>
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left" style={{ marginTop: "32px" }}>Uploaded Documents</Divider>
            
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', background: '#f9fafb', height: "100%" }}>
                  <Space style={{ marginBottom: '12px' }}>
                    <IdcardOutlined style={{ color: "#5c039b", fontSize: "18px" }} />
                    <Text strong>Emirates ID Proof</Text>
                  </Space>
                  <div style={{ textAlign: "center" }}>
                    {selectedAgent.id_proof ? (
                      <Image 
                        width="100%" 
                        height={120} 
                        style={{ objectFit: 'cover', borderRadius: '6px', border: '1px solid #d1d5db' }}
                        src={selectedAgent.id_proof} 
                        alt="ID Proof"
                      />
                    ) : (
                      <div style={{ padding: "30px 0", background: "#f3f4f6", borderRadius: "6px", color: "#9ca3af" }}>No ID Uploaded</div>
                    )}
                  </div>
                </div>
              </Col>
              
              <Col xs={24} md={12}>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', background: '#f9fafb', height: "100%" }}>
                  <Space style={{ marginBottom: '12px' }}>
                    <FileProtectOutlined style={{ color: "#5c039b", fontSize: "18px" }} />
                    <Text strong>RERA Certificate</Text>
                  </Space>
                  <div style={{ textAlign: "center" }}>
                    {selectedAgent.rera_certificate ? (
                      <Image 
                        width="100%" 
                        height={120}
                        style={{ objectFit: 'cover', borderRadius: '6px', border: '1px solid #d1d5db' }} 
                        src={selectedAgent.rera_certificate} 
                        alt="RERA Cert"
                      />
                    ) : (
                      <div style={{ padding: "30px 0", background: "#f3f4f6", borderRadius: "6px", color: "#9ca3af" }}>No Certificate Uploaded</div>
                    )}
                  </div>
                </div>
              </Col>
            </Row>

          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px" }}><Spin size="large" /></div>
        )}
      </Modal>

      {/* Optional Custom CSS for Select border removal */}
      <style>{`
        .custom-status-select .ant-select-selector {
          background-color: #f3f4f6 !important;
          border-radius: 8px !important;
          padding: 0 12px !important;
        }
      `}</style>
    </div>
  );
};

export default AgentList;