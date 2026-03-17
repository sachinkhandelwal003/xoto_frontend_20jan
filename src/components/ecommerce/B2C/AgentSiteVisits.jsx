import { Card, Typography, Table, Tag, Button, Row, Col,
  Statistic, Input, Select, Space, notification, message } from "antd";
import { CalendarOutlined, CheckCircleOutlined,
  CloseCircleOutlined, EyeOutlined, MessageOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import ChatDrawer from "../../chat/ChatDrawer";
import { getSocket, registerSocket } from "../../../utils/socket";

const { Title, Text } = Typography;
const { Option } = Select;

export default function AgentSiteVisits() {
  const navigate      = useNavigate();
  const { user }      = useSelector((state) => state.auth);
  console.log("Full user object:", user);

  const [visits, setVisits]     = useState([]);
  const [loading, setLoading]   = useState(false);
  const [chatData, setChatData] = useState(null);

  // ✅ visitsRef — always updated list of visits
  const visitsRef = useRef([]);

  // ── Fetch visits ────────────────────────────────────────────
  const fetchVisits = async () => {
    try {
      setLoading(true);
      const res  = await apiService.get("/agent/lead/get-all-site-visits");
      const list = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
      setVisits(list);
      visitsRef.current = list; // ✅ ref update karo
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVisits(); }, []);

  // ── Socket setup ────────────────────────────────────────────
  useEffect(() => {
    if (!user?._id) return;

    const sock = getSocket();

    // Register function
    const doRegister = () => {
      sock.emit("register", user._id);
    };

    if (sock.connected) doRegister();
    sock.on("connect", doRegister);

    // ✅ Developer ne chat shuru ki — visitsRef use karo (stale state problem nahi hogi)
    const onChatInitiated = ({ leadId, developerId, developerName }) => {
      // visitsRef.current se latest list lo
      const visit = visitsRef.current.find(
        (v) =>
          v?.lead?._id?.toString() === leadId?.toString() ||
          v?.lead?.toString()      === leadId?.toString()
      );

      const leadObj = visit?.lead || { _id: leadId };

      // Notification dikhao
      notification.info({
        message:     "New Chat Request",
        description: `${developerName} ne chat shuru ki!`,
        placement:   "topRight",
        duration:    6,
      });

      // Chat drawer kholo
      setChatData({ lead: leadObj, developerId, developerName });
    };

    sock.on("chat_initiated", onChatInitiated);

    return () => {
      sock.off("connect",       doRegister);
      sock.off("chat_initiated", onChatInitiated);
    };
  }, [user]);

  // ── Agent manually chat khole ───────────────────────────────
 // PEHLE wala code dhundho aur POORA replace karo:
const handleManualChat = (record) => {
  const developerId   = record?.developer?._id;
  const developerName = record?.developer?.name || "Developer";

  // ✅ user ka ID dhundho — multiple possible fields
  const userId = user?._id || user?.id || user?.userId;
  
  console.log("User object:", user);        // dekho kya hai
  console.log("User ID found:", userId);    // ye print hoga

  setChatData({
    lead:          record?.lead,
    developerId,
    developerName,
    agentId: userId,                        // ← explicitly pass karo
  });
};

  // ── Stats ────────────────────────────────────────────────────
  const totalVisits = visits.length;
  const completed   = visits.filter((v) => v.status === "completed").length;
  const scheduled   = visits.filter((v) => v.status === "scheduled").length;
  const cancelled   = visits.filter((v) => v.status === "cancelled").length;

  const getStatusColor = (status) => {
    if (status === "scheduled") return "blue";
    if (status === "completed") return "green";
    if (status === "cancelled") return "red";
    if (status === "requested") return "orange";
    return "default";
  };

  // ── Table columns ────────────────────────────────────────────
  const columns = [
    {
      title:  "Client",
      render: (record) =>
        `${record?.lead?.name?.first_name || ""} ${record?.lead?.name?.last_name || ""}`,
    },
    {
      title:  "Project",
      render: (record) => record?.property?.propertyName || "-",
    },
    {
      title:  "Visit Date",
      render: (record) =>
        record?.requestedDate
          ? new Date(record.requestedDate).toLocaleDateString()
          : "-",
    },
    {
      title:  "Status",
      render: (record) => (
        <Tag color={getStatusColor(record.status)} className="px-3 py-1 rounded-full">
          {record.status}
        </Tag>
      ),
    },
    {
      title:  "Action",
      render: (record) => (
        <Space>
          <Button
            type="primary" ghost icon={<EyeOutlined />}
            onClick={() => navigate(`/dashboard/agent/site-visits/${record._id}`)}
            className="rounded-lg"
          >
            View
          </Button>

          {/* ✅ Chat button */}
          <Button
            icon={<MessageOutlined />}
            style={{ background: "#7c3aed", borderColor: "#7c3aed", color: "#fff" }}
            onClick={() => handleManualChat(record)}
            className="rounded-lg"
          >
            Chat
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="mb-8">
        <Title level={2} className="!mb-1">Site Visit Management</Title>
        <Text type="secondary">Track all scheduled and completed property visits</Text>
      </div>

      {/* SUMMARY CARDS */}
      <Row gutter={[24, 24]} className="mb-8">
        <Col xs={24} md={6}>
          <Card className="shadow-md rounded-2xl">
            <Statistic title="Total Visits" value={totalVisits} prefix={<CalendarOutlined />} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card className="shadow-md rounded-2xl">
            <Statistic title="Scheduled" value={scheduled} valueStyle={{ color: "#2563eb" }} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card className="shadow-md rounded-2xl">
            <Statistic title="Completed" value={completed}
              prefix={<CheckCircleOutlined />} valueStyle={{ color: "#16a34a" }} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card className="shadow-md rounded-2xl">
            <Statistic title="Cancelled" value={cancelled}
              prefix={<CloseCircleOutlined />} valueStyle={{ color: "#dc2626" }} />
          </Card>
        </Col>
      </Row>

      {/* FILTER */}
      <Card className="shadow-lg rounded-2xl mb-6">
        <Space>
          <Input.Search placeholder="Search client or project" style={{ width: 250 }} />
          <Select defaultValue="all" style={{ width: 180 }}>
            <Option value="all">All Status</Option>
            <Option value="scheduled">Scheduled</Option>
            <Option value="completed">Completed</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>
        </Space>
      </Card>

      {/* TABLE */}
      <Card className="shadow-lg rounded-2xl">
        <Table
          columns={columns}
          dataSource={visits}
          loading={loading}
          pagination={{ pageSize: 5 }}
          rowKey="_id"
        />
      </Card>

      {/* ✅ CHAT DRAWER */}
     {chatData && user && chatData.developerId && (
  <ChatDrawer
    lead={chatData.lead}
    currentUser={{
      ...user,
      // ✅ ID explicitly set karo
      _id:  user?._id || user?.id || user?.userId,
      type: "agent"
    }}
    otherUserId={chatData.developerId}
    otherName={chatData.developerName}
    onClose={() => setChatData(null)}
  />
)}

    </div>
  );
}
