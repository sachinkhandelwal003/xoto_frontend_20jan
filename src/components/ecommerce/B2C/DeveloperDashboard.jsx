import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  RiseOutlined, FileTextOutlined, HomeOutlined,
  BellOutlined, ArrowUpOutlined, ArrowDownOutlined,
  MessageOutlined, CheckCircleOutlined, ReloadOutlined,
} from "@ant-design/icons";
import {
  Card, Row, Col, Select, Button, Typography, Tag,
  Spin, Badge, notification, List, Avatar,
} from "antd";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import { getSocket, registerSocket } from "../../../utils/socket";
import ChatDrawer from "../../chat/ChatDrawer";

const { Title, Text } = Typography;
const { Option } = Select;

const DeveloperDashboard = () => {
  const navigate    = useNavigate();
  const { user }    = useSelector((state) => state.auth || {});
  const developerId = user?._id || user?.id || user?.sub;

  const [timeRange, setTimeRange]             = useState("7d");
  const [loading, setLoading]                 = useState(true);
  const [refreshing, setRefreshing]           = useState(false);
  const [stats, setStats]                     = useState([]);
  const [inventoryStatus, setInventoryStatus] = useState([]);
  const [dealFunnel, setDealFunnel]           = useState([]);
  
  // ✅ Profile state for Display Name
  const [userProfile, setUserProfile]         = useState(null);

  // Chat states
  const [chatNotifs, setChatNotifs]     = useState([]);
  const [activeChat, setActiveChat]     = useState(null);
  const [showChatList, setShowChatList] = useState(false);

  const COLORS = ["#3b82f6", "#f59e0b", "#10b981"];

  // ✅ Fetch Profile Data
  const fetchProfileData = async () => {
    try {
      const res = await apiService.get('/profile/get-profile-data');
      if (res.data) {
        setUserProfile(res.data);
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
    }
  };

  // Fetch dashboard data
  const fetchDashboard = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await apiService.get(`/property/developer-dashboard/${developerId}`);
      if (res?.success) {
        setStats(res.stats || []);
        setInventoryStatus(res.inventoryStatus || []);
        setDealFunnel(res.dealFunnel || []);
      }
    } catch (err) {
      console.log("Dashboard error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!developerId) return;
    fetchDashboard();
  }, [developerId, timeRange]);

  // Ek baar profile fetch karne ke liye alag useEffect
  useEffect(() => {
    if (developerId) fetchProfileData();
  }, [developerId]);

  // ✅ SMART HELPER: Name nikalne ke liye (Company name bhi support karega)
  const getDisplayName = () => {
    const apiData = userProfile?.data || userProfile;
    const reduxData = user?.data || user;

    if (apiData?.first_name) return `${apiData.first_name} ${apiData.last_name || ''}`.trim();
    if (apiData?.name) {
      if (typeof apiData.name === 'object') return `${apiData.name.first_name || ''} ${apiData.name.last_name || ''}`.trim();
      return apiData.name;
    }
    if (apiData?.company_name) return apiData.company_name;

    if (reduxData?.first_name) return `${reduxData.first_name} ${reduxData.last_name || ''}`.trim();
    if (reduxData?.name) {
      if (typeof reduxData.name === 'object') return `${reduxData.name.first_name || ''} ${reduxData.name.last_name || ''}`.trim();
      return reduxData.name;
    }
    if (reduxData?.company_name) return reduxData.company_name;

    return "Developer";
  };

  // Fetch approved chat requests
  const fetchApprovedChats = async () => {
    try {
      const res  = await apiService.get("/chat-request/developer-approved");
      const list = Array.isArray(res?.data?.data) ? res.data.data
                 : Array.isArray(res?.data)       ? res.data
                 : [];
      setChatNotifs(list);
    } catch (err) {
      console.log("Chat fetch error:", err);
    }
  };

  // Socket setup
  useEffect(() => {
    if (!developerId) return;
    registerSocket(developerId);
    fetchApprovedChats();
    const sock = getSocket();
    sock.on("chat_approved_for_developer", () => {
      notification.success({
        message:     "New Chat Available!",
        description: "A chat request has been approved. Click to open.",
        placement:   "topRight",
        duration:    8,
        btn: (
          <Button
            type="primary"
            size="small"
            style={{ background: "#7c3aed" }}
            onClick={() => { fetchApprovedChats(); setShowChatList(true); }}
          >
            Open Chat
          </Button>
        ),
      });
      fetchApprovedChats();
    });
    return () => sock.off("chat_approved_for_developer");
  }, [developerId]);

  // Chat data
  const chatLead = activeChat?.lead
    ? (typeof activeChat.lead === "object" ? activeChat.lead : { _id: activeChat.lead })
    : null;

  const chatAgentId   = chatLead?.agent?._id || chatLead?.agent || activeChat?.agentId || null;
  const chatAgentName = chatLead?.agent?.first_name
    ? `${chatLead.agent.first_name} ${chatLead.agent.last_name || ""}`
    : "Agent";

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          {/* ✅ YAHAN CHANGE KIYA HAI */}
          <Title level={2} style={{ margin: 0 }}>
            Welcome, {getDisplayName()} 👋
          </Title>
          <Text type="secondary">Monitor projects, inventory, visits and deals.</Text>
        </div>

        <div className="flex gap-3 items-center">
          <Select defaultValue="7d" style={{ width: 160 }} onChange={setTimeRange}>
            <Option value="7d">Last 7 Days</Option>
            <Option value="30d">Last 30 Days</Option>
            <Option value="90d">Last 90 Days</Option>
          </Select>

          {/* Home Button */}
          <Button
            icon={<HomeOutlined />}
            onClick={() => navigate("/")}
          >
            Home
          </Button>

          {/* Refresh Button */}
          <Button
            icon={<ReloadOutlined spin={refreshing} />}
            loading={refreshing}
            onClick={() => { fetchDashboard(true); fetchApprovedChats(); }}
          >
            Refresh
          </Button>

          {/* Chat Notification Button */}
          <Badge count={chatNotifs.length} color="#7c3aed">
            <Button
              type="primary"
              icon={<MessageOutlined />}
              style={{ background: "#7c3aed", borderColor: "#7c3aed" }}
              onClick={() => setShowChatList(!showChatList)}
            >
              Chats
            </Button>
          </Badge>

          <Button type="primary" icon={<BellOutlined />}>Alerts</Button>
        </div>
      </div>

      {/* Chat List Panel */}
      {showChatList && (
        <Card
          className="mb-6 shadow-md"
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <MessageOutlined style={{ color: "#7c3aed" }} />
              <span>Approved Chats</span>
              <Tag color="purple">{chatNotifs.length}</Tag>
            </div>
          }
          extra={<Button size="small" onClick={() => setShowChatList(false)}>Close</Button>}
        >
          {chatNotifs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px", color: "#aaa" }}>
              No approved chats found.
            </div>
          ) : (
            <List
              dataSource={chatNotifs}
              renderItem={(req) => {
                const lead      = typeof req.lead === "object" ? req.lead : null;
                const agentName = lead?.agent?.first_name
                  ? `${lead.agent.first_name} ${lead.agent.last_name || ""}`
                  : req.agentName || "Agent";
                return (
                  <List.Item
                    actions={[
                      <Button
                        key="chat"
                        type="primary"
                        size="small"
                        icon={<MessageOutlined />}
                        style={{ background: "#7c3aed", borderColor: "#7c3aed" }}
                        onClick={() => { setActiveChat(req); setShowChatList(false); }}
                      >
                        Open Chat
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar style={{ background: "#7c3aed" }}>
                          {agentName.charAt(0).toUpperCase()}
                        </Avatar>
                      }
                      title={
                        <span>
                          <Tag color="green" icon={<CheckCircleOutlined />}>Approved</Tag>
                          {agentName}
                        </span>
                      }
                      description={
                        <span style={{ fontSize: 12, color: "#888" }}>
                          Topic: {req.topic?.replace("_", " ")} &bull; {req.reason?.slice(0, 50)}...
                        </span>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          )}
        </Card>
      )}

      {/* STATS */}
      <Row gutter={[16, 16]} className="mb-8">
        {stats.map((stat, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card bordered={false}>
              <div className="flex justify-between">
                <div>
                  <Text type="secondary">{stat.label}</Text>
                  <Title level={3}>{stat.value}</Title>
                </div>
                <div style={{
                  background: stat.bg, color: stat.color,
                  width: 40, height: 40, borderRadius: 10,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {stat.icon}
                </div>
              </div>
              <Tag
                color={stat.change > 0 ? "green" : "red"}
                icon={stat.change > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              >
                {Math.abs(stat.change)}%
              </Tag>
            </Card>
          </Col>
        ))}
      </Row>

      {/* CHARTS */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Inventory Status">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={inventoryStatus} dataKey="value" outerRadius={120} label>
                  {inventoryStatus.map((_, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Sales Pipeline">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dealFunnel}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* ChatDrawer */}
      {activeChat && user && chatLead && chatAgentId && (
        <ChatDrawer
          lead={chatLead}
          currentUser={{
            ...user,
            _id:        user?._id || user?.id,
            type:       "developer",
            first_name: getDisplayName(), // yahan bhi theek kar diya taaki chat me naam aae
            last_name:  user?.last_name  || "",
          }}
          otherUserId={chatAgentId}
          otherName={chatAgentName}
          onClose={() => setActiveChat(null)}
        />
      )}

    </div>
  );
};

export default DeveloperDashboard;