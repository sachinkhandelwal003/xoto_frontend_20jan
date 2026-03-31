import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Tag,
  Space,
  Button,
  Input,
  Card,
  Typography,
  Tooltip,
  Avatar,
  Badge
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  PlusOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;
const BRAND_PURPLE = "#5C039B";

const AgentList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [agents, setAgents] = useState([]);

  // ==========================================
  // DUMMY DATA FETCH (Replace with actual API call)
  // ==========================================
  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = () => {
    setLoading(true);
    // Mimicking API delay
    setTimeout(() => {
      const dummyData = [
        {
          key: "1",
          id: "AGT-1001",
          first_name: "John",
          last_name: "Smith",
          email: "john@independent.com",
          phone_number: "+971501234567",
          agentType: "independent",
          specialization: "Luxury Villas",
          onboarding_status: "approved",
          is_active: true,
          profile_photo: ""
        },
        {
          key: "2",
          id: "AGT-1002",
          first_name: "Sarah",
          last_name: "Connor",
          email: "sarah@nexus.com",
          phone_number: "+971559876543",
          agentType: "agency_agent",
          agency_name: "Nexus Real Estate",
          specialization: "Commercial",
          onboarding_status: "pending",
          is_active: false,
          profile_photo: ""
        },
        {
          key: "3",
          id: "AGT-1003",
          first_name: "Ahmed",
          last_name: "Hassan",
          email: "ahmed@vanguard.com",
          phone_number: "+971523334444",
          agentType: "agency_agent",
          agency_name: "Vanguard Properties",
          specialization: "Apartments",
          onboarding_status: "registered",
          is_active: true,
          profile_photo: ""
        }
      ];
      setAgents(dummyData);
      setLoading(false);
    }, 1000);
  };

  // ==========================================
  // TABLE COLUMNS CONFIGURATION
  // ==========================================
  const columns = [
    {
      title: "Agent Details",
      dataIndex: "name",
      key: "name",
      render: (_, record) => (
        <Space>
          <Avatar 
            src={record.profile_photo} 
            icon={!record.profile_photo && <UserOutlined />} 
            style={{ backgroundColor: BRAND_PURPLE }}
          />
          <div>
            <Text strong>{record.first_name} {record.last_name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: "12px" }}>{record.id}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Contact Info",
      key: "contact",
      render: (_, record) => (
        <div>
          <Text>{record.email}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>{record.phone_number}</Text>
        </div>
      ),
    },
    {
      title: "Type & Specialization",
      key: "type",
      render: (_, record) => (
        <div>
          <Tag color={record.agentType === "independent" ? "purple" : "blue"}>
            {record.agentType === "independent" ? "Independent" : "Agency Agent"}
          </Tag>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>{record.specialization}</Text>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "onboarding_status",
      key: "status",
      render: (status) => {
        let color = "default";
        if (status === "approved") color = "success";
        if (status === "pending") color = "warning";
        if (status === "rejected") color = "error";
        
        return (
          <Badge status={color} text={status.charAt(0).toUpperCase() + status.slice(1)} />
        );
      },
      filters: [
        { text: 'Approved', value: 'approved' },
        { text: 'Pending', value: 'pending' },
        { text: 'Registered', value: 'registered' },
      ],
      onFilter: (value, record) => record.onboarding_status === value,
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<EyeOutlined style={{ color: BRAND_PURPLE }} />} 
              onClick={() => message.info(`Viewing ${record.first_name}`)}
            />
          </Tooltip>
          <Tooltip title="Edit Agent">
            <Button 
              type="text" 
              icon={<EditOutlined style={{ color: "#1890ff" }} />} 
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Search Filter Logic
  const filteredAgents = agents.filter(agent => 
    agent.first_name.toLowerCase().includes(searchText.toLowerCase()) ||
    agent.last_name.toLowerCase().includes(searchText.toLowerCase()) ||
    agent.email.toLowerCase().includes(searchText.toLowerCase()) ||
    agent.phone_number.includes(searchText)
  );

  return (
    <div style={{ padding: "24px", background: "#f8f9fa", minHeight: "100vh" }}>
      
      {/* PAGE HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <Title level={3} style={{ margin: 0, color: "#1f2937" }}>Agent Management</Title>
          <Text type="secondary">View, manage, and onboard real estate agents.</Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="large"
          onClick={() => navigate("/dashboard/admin/agent-add")} // ✅ Route for your AddAgent page
          style={{ background: BRAND_PURPLE, borderColor: BRAND_PURPLE, borderRadius: "8px", fontWeight: "600" }}
        >
          Onboard New Agent
        </Button>
      </div>

      {/* MAIN CARD */}
      <Card 
        bordered={false} 
        style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        bodyStyle={{ padding: "20px" }}
      >
        {/* TOOLBAR (Search & Filters) */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <Input
            placeholder="Search by name, email, or phone..."
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            size="large"
            style={{ width: "350px", borderRadius: "8px" }}
            onChange={(e) => setSearchText(e.target.value)}
          />
          {/* You can add extra filter dropdowns here if needed */}
        </div>

        {/* DATA TABLE */}
        <Table
          columns={columns}
          dataSource={filteredAgents}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          rowKey="id"
          style={{ overflowX: "auto" }}
        />
      </Card>

    </div>
  );
};

export default AgentList;