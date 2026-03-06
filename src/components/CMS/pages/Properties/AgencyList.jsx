import React, { useState, useEffect } from "react";
import axios from "axios";
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
  Select,
  Modal,
  Button,
  Popconfirm,
  Tag,
  Badge,
  Descriptions,
  Switch
} from "antd";
import {
  ApartmentOutlined,
  DeleteOutlined,
  EyeOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CrownFilled,
  MailOutlined,
  PhoneOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

const AgencyList = () => {
  // const BASE_URL = "https://xoto.ae/api/agency";
  const BASE_URL = "http://localhost:5000/api/agency";

  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(false);

  const [viewModal, setViewModal] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState(null);

  // ✅ FETCH AGENCIES
  const fetchAgencies = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/get-all-agencies`);
      const list = res.data?.data || res.data || [];
      setAgencies(list);
    } catch (err) {
      message.error("Failed to fetch agencies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencies();
  }, []);

  // ✅ DELETE AGENCY
  const deleteAgency = async (record) => {
    const id = record?._id;
    if (!id) return message.error("Invalid Agency ID");

    try {
      await axios.delete(`${BASE_URL}/delete-agency/${id}`);
      message.success("Agency permanently removed from platform.");
      fetchAgencies();
    } catch (err) {
      message.error("Failed to delete agency.");
    }
  };

  // ✅ UPDATE ONBOARDING STATUS (Admin Approval Flow)
  const updateStatus = async (record, status) => {
    const id = record?._id;
    if (!id) return;

    try {
      await axios.put(`${BASE_URL}/update/${id}`, {
        onboarding_status: status,
      });

      message.success(`Agency status updated to ${status.toUpperCase()}`);
      fetchAgencies();
    } catch (err) {
      message.error("Status update failed.");
    }
  };

  const toggleActiveStatus = async (record, checked) => {
    const id = record?._id;
    if (!id) return;

    try {
      await axios.put(`${BASE_URL}/update/${id}`, {
        is_active: checked,
      });

      message.success(`Agency ${checked ? "Activated" : "Suspended"} successfully.`);
      fetchAgencies(); // Table data refresh karne ke liye
    } catch (err) {
      message.error("Failed to update active status.");
    }
  };  

  // ✅ OPEN VIEW MODAL (Read-Only)
  const openViewModal = (record) => {
    setSelectedAgency(record);
    setViewModal(true);
  };

  // Quick Stats Calculations based on FRD (Overview)
  const totalAgencies = agencies.length;
  const pendingApprovals = agencies.filter(a => a.onboarding_status === "registered").length;
  const activeAgencies = agencies.filter(a => a.is_active).length;

  const stats = [
    { title: "Total Registered Agencies", value: totalAgencies, icon: <ApartmentOutlined />, color: "#2563eb", bg: "#dbeafe" },
    { title: "Active & Trading", value: activeAgencies, icon: <CheckCircleOutlined />, color: "#059669", bg: "#d1fae5" },
    { title: "Pending Approvals", value: pendingApprovals, icon: <ClockCircleOutlined />, color: "#d97706", bg: "#fef3c7" },
  ];

  const columns = [
    {
      title: "Agency Profile",
      dataIndex: "agency_name",
      key: "agency",
      render: (text, record) => (
        <Space size="middle">
          <Avatar 
            size={42} 
            style={{ backgroundColor: "#f3e8ff", color: "#5c039b", fontWeight: "bold" }}
            icon={!text && <ApartmentOutlined />}
          >
            {text?.charAt(0)?.toUpperCase()}
          </Avatar>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Text strong style={{ fontSize: "15px", color: "#1f2937" }}>{text || "Unnamed Agency"}</Text>
            <Text type="secondary" style={{ fontSize: "12px" }}>ID: {record._id?.slice(-6).toUpperCase()}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Contact Info",
      key: "contact",
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Text style={{ fontSize: "13px" }}><MailOutlined style={{ color: "#6b7280", marginRight: "6px" }}/> {record.email}</Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            <PhoneOutlined style={{ color: "#6b7280", marginRight: "6px" }}/> 
            {record.country_code} {record.mobile_number}
          </Text>
        </Space>
      ),
    },
    {
      title: "Subscription",
      key: "subscription",
      render: (_, record) => (
        <Tag icon={<CrownFilled />} color={record.subscription_status === 'Pro' ? 'purple' : 'default'} style={{ borderRadius: "12px", padding: "4px 10px" }}>
          {record.subscription_status || "Free Plan"}
        </Tag>
      )
    },
    {
      title: "Approval Status",
      dataIndex: "onboarding_status",
      key: "status",
      render: (status, record) => (
        <Select
          value={status || "registered"}
          style={{ width: 140, fontWeight: "500" }}
          dropdownStyle={{ borderRadius: "8px" }}
          bordered={false}
          className="custom-status-select"
          onChange={(value) => updateStatus(record, value)}
          options={[
            { value: "registered", label: <Badge status="warning" text="Registered" /> },
            { value: "approved", label: <Badge status="processing" text="Approved" /> },
            { value: "completed", label: <Badge status="success" text="Completed" /> }
          ]}
        />
      ),
    },
    {
      title: "Platform Access",
      dataIndex: "is_active",
      key: "active",
      align: "center",
      render: (active, record) => (
        <Space direction="vertical" size={2}>
          {/* ✅ Interactive Switch to Toggle Suspend/Active */}
          <Switch
            checked={active}
            onChange={(checked) => toggleActiveStatus(record, checked)}
            style={{ background: active ? "#059669" : "#ef4444" }}
          />
          <Text type="secondary" style={{ fontSize: "11px", color: active ? "#059669" : "#ef4444", fontWeight: "500" }}>
            {active ? "Active" : "Suspended"}
          </Text>
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "action",
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

          <Tooltip title="Permanently Delete">
            <Popconfirm
              title="Delete this agency?"
              description="This will remove all their agents and data."
              onConfirm={() => deleteAgency(record)}
              okText="Yes, Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
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
          <TeamOutlined style={{ fontSize: "24px" }} />
        </div>
        <div>
          <Title level={2} style={{ margin: 0, color: "#1f2937" }}>
            Agency Management
          </Title>
          <Text type="secondary" style={{ fontSize: "15px" }}>
            Verify, approve, and monitor all white-label agencies on the Xoto Grid.
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
          <Title level={5} style={{ margin: 0, color: "#374151" }}>Registered Agencies Directory</Title>
        </div>
        <Table
          columns={columns}
          dataSource={agencies}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, position: ["bottomCenter"] }}
          style={{ padding: "0 24px 24px 24px" }}
        />
      </Card>

      {/* READ-ONLY VIEW MODAL */}
      <Modal
        title={
          <Space>
            <ApartmentOutlined style={{ color: "#5c039b" }} />
            <Text strong style={{ fontSize: "18px" }}>Agency Complete Profile</Text>
          </Space>
        }
        open={viewModal}
        onCancel={() => setViewModal(false)}
        footer={[
          <Button key="close" type="primary" style={{ background: "#5c039b" }} onClick={() => setViewModal(false)}>
            Close View
          </Button>
        ]}
        width={600}
        centered
        styles={{ padding: "24px" }}
      >
        {selectedAgency && (
          <div style={{ marginTop: "20px" }}>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <Avatar size={80} style={{ backgroundColor: "#f3e8ff", color: "#5c039b", fontSize: "32px", fontWeight: "bold" }}>
                {selectedAgency.agency_name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Title level={4} style={{ marginTop: "12px", marginBottom: "4px" }}>{selectedAgency.agency_name}</Title>
              <Tag color={selectedAgency.is_active ? "green" : "red"}>
                {selectedAgency.is_active ? "Account Active" : "Account Suspended"}
              </Tag>
            </div>

            <Descriptions bordered column={1} size="middle" labelStyle={{ fontWeight: "600", color: "#4b5563", width: "150px" }}>
              <Descriptions.Item label="Email Address">{selectedAgency.email}</Descriptions.Item>
              <Descriptions.Item label="Phone Number">{selectedAgency.country_code} {selectedAgency.mobile_number}</Descriptions.Item>
              <Descriptions.Item label="Onboarding Status">
                <Badge 
                  status={selectedAgency.onboarding_status === "completed" ? "success" : "warning"} 
                  text={selectedAgency.onboarding_status?.toUpperCase()} 
                />
              </Descriptions.Item>
              <Descriptions.Item label="Subscription Plan">
                {selectedAgency.subscription_status || "Free/Basic"}
              </Descriptions.Item>
              <Descriptions.Item label="System ID">
                <Text code>{selectedAgency._id}</Text>
              </Descriptions.Item>
            </Descriptions>
          </div>
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

export default AgencyList;