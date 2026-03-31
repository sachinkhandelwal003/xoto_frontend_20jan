import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs } from "antd";
import { apiService } from "../../../../manageApi/utils/custom.apiservice";
import CustomTable from "../../pages/custom/CustomTable";
import {
  Card, Typography, Avatar, Row, Col, Space, message,
  Tooltip, Button, Popconfirm, Badge, Tag, Switch
} from "antd";
import {
  UserOutlined, EyeOutlined, UsergroupAddOutlined,
  CheckCircleOutlined, ClockCircleOutlined, MailOutlined, PhoneOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

const AgentList = () => {
  const navigate = useNavigate();

  const [agents, setAgents]             = useState([]);
  const [loading, setLoading]           = useState(false);
  const [currentPage, setCurrentPage]   = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems]     = useState(0);
  const [activeTab, setActiveTab] = useState("all");

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchAgents = async (page = currentPage, limit = itemsPerPage) => {
    setLoading(true);
    try {
      const res   = await apiService.get(`/agent/get-all-agents?page=${page}&limit=${limit}`);
      const list  = res?.data?.data || res?.data || res || [];
      const total = res?.data?.pagination?.totalItems || res?.data?.total || res?.total || list.length;
      setAgents(list);
      setTotalItems(total);
    } catch {
      message.error("Failed to fetch agents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAgents(1, 10); }, []);

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setItemsPerPage(size);
    fetchAgents(page, size);
  };

  

  // ── Toggle Verification (IsActive status if needed) ──────────────────────
  const toggleVerification = async (record, checked) => {
    const id = record?._id || record?.id;
    if (!id) return;
    try {
      await apiService.post(`/agent/update-agent?id=${id}`, { isVerified: checked });
      message.success(`Agent ${checked ? "verified" : "unverified"} successfully`);
      fetchAgents(currentPage, itemsPerPage);
    } catch {
      message.error("Verification update failed");
    }
  };

  // ── Stats ────────────────────────────────────────────────────────────────
  const verifiedAgents   = agents.filter((a) => a.isVerified).length;
  const pendingApprovals = agents.filter((a) => a.onboarding_status !== "approved").length;

  const stats = [
    { title: "Total Agents",      value: totalItems,       icon: <UsergroupAddOutlined />, color: "#2563eb", bg: "#dbeafe" },
    { title: "Verified & Active", value: verifiedAgents,   icon: <CheckCircleOutlined />,  color: "#059669", bg: "#d1fae5" },
    { title: "Pending Approvals", value: pendingApprovals, icon: <ClockCircleOutlined />,  color: "#d97706", bg: "#fef3c7" },
  ];

  const filteredAgents = agents.filter((agent) => {
  if (activeTab === "approved") return agent.onboarding_status === "approved";
  if (activeTab === "rejected") return agent.onboarding_status === "rejected";
  return true; // all
});

  // ── Columns ──────────────────────────────────────────────────────────────
  const columns = [
    {
      title: "Agent Profile",
      key: "first_name",
      sortable: true,
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
            <Text strong style={{ fontSize: 15, color: "#1f2937", textTransform: "capitalize" }}>
              {record.first_name} {record.last_name}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              ID: {(record._id || record.id)?.slice(-6).toUpperCase()}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Contact Info",
      key: "email",
      sortable: true,
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Text style={{ fontSize: 13 }}>
            <MailOutlined style={{ color: "#6b7280", marginRight: 6 }} />{record.email}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <PhoneOutlined style={{ color: "#6b7280", marginRight: 6 }} />
            {record.country_code} {record.phone_number}
          </Text>
        </Space>
      ),
    },
    {
      title: "Specialization",
      key: "specialization",
      sortable: true,
      render: (_, record) => (
        <Tag color="purple" style={{ textTransform: "capitalize" }}>
          {record.specialization || "N/A"}
        </Tag>
      ),
    },
    {
      title: "Onboarding Status",
      key: "onboarding_status",
      sortable: true,
      render: (_, record) => {
        const colorMap = { approved: "#059669", pending: "#d97706", registered: "#2563eb", rejected: "#dc2626" };
        return (
          <Badge
            color={colorMap[record.onboarding_status] || "#6b7280"}
            text={
              <Text style={{ textTransform: "capitalize", fontWeight: 500, fontSize: 13 }}>
                {record.onboarding_status || "N/A"}
              </Text>
            }
          />
        );
      },
    },
   {
  title: "Status",
  key: "status",
  render: (_, record) => {
    const isActive = record.onboarding_status === "approved";

    return (
      <Tag
        color={isActive ? "green" : "orange"}
        style={{ fontWeight: 600, borderRadius: 20 }}
      >
        {isActive ? "Active" : "Pending"}
      </Tag>
    );
  },
},
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small" wrap>
          {/* ✅ ONLY NAVIGATE TO DETAILS PAGE */}
          <Tooltip title="View Full Profile & Manage">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => {
 
  const currentPath = window.location.pathname; 
  const newPath = currentPath.replace('agent-list', `agents/${record._id || record.id}`);
  navigate(newPath);
}}
              style={{ background: "#5c039b", borderColor: "#5c039b", borderRadius: 6 }}
            >
              View
            </Button>
          </Tooltip>
        
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: 32, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ padding: 10, background: "#f3e8ff", borderRadius: 10, color: "#5c039b" }}>
          <UsergroupAddOutlined style={{ fontSize: 24 }} />
        </div>
        <div>
          <Title level={2} style={{ margin: 0, color: "#1f2937" }}>Agent Management</Title>
          <Text type="secondary" style={{ fontSize: 15 }}>
            Manage all registered platform agents. Click View to Approve/Reject.
          </Text>
        </div>
      </div>

      {/* Stats */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        {stats.map((stat, i) => (
          <Col xs={24} sm={12} md={8} key={i}>
           
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }} bodyStyle={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: 12, background: stat.bg, color: stat.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                  {stat.icon}
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 13, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {stat.title}
                  </Text>
                  <Title level={2} style={{ margin: "4px 0 0 0", color: "#1f2937" }}>{stat.value}</Title>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

        <Tabs
  activeKey={activeTab}
  onChange={(key) => setActiveTab(key)}
  style={{ marginBottom: 20 }}
  items={[
    { key: "all", label: "All Agents" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
  ]}
/>

      {/* Table */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }} bodyStyle={{ padding: 0 }}>
        <div style={{ padding: "24px", borderBottom: "1px solid #f0f0f0" }}>
          <Title level={5} style={{ margin: 0, color: "#374151" }}>Registered Agents Directory</Title>
        </div>
        <div style={{ padding: "0 0 24px 0" }}>
          <CustomTable
            columns={columns}
            data={filteredAgents}
            loading={loading}
            totalItems={totalItems}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            showSearch={true}
          />
        </div>
      </Card>
    </div>
  );
};

export default AgentList;