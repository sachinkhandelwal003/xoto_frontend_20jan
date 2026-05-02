import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Card, Typography, Tag, Button, Empty, Spin,
  Badge, Tabs, message, notification,
} from "antd";
import {
  MessageOutlined, ClockCircleOutlined, CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { apiService } from "../../manageApi/utils/custom.apiservice";
import { getSocket, registerSocket } from "../../utils/socket";
import ChatDrawer from "../../components/chat/ChatDrawer";

const { Title, Text } = Typography;

export default function MyChatRequests() {
  const { user }                        = useSelector(state => state.auth);
  const [requests, setRequests]         = useState([]);
  const [loading, setLoading]           = useState(false);
  const [activeChat, setActiveChat]     = useState(null); // approved request object

  // ── Fetch requests ────────────────────────────────────────
  const fetchRequests = async () => {
    try {
      setLoading(true);
  
const res = await apiService.get("/chat-request/my-requests");
      const list = Array.isArray(res?.data?.data) ? res.data.data
                 : Array.isArray(res?.data)       ? res.data
                 : Array.isArray(res)             ? res
                 : [];
      setRequests(list);
    } catch (err) {
     
      message.error("Requests load nahi huyi");
    } finally { setLoading(false); }
  };

  // ── Socket setup ──────────────────────────────────────────
  useEffect(() => {
    fetchRequests();

    if (!user?._id) return;

    const sock = getSocket();
    registerSocket(user._id);

    sock.on("chat_request_approved", () => {
      notification.success({
        message:     "Chat Approved! 🎉",
        description: "Tumhari chat request approve ho gayi. Ab chat kar sakte ho!",
        placement:   "topRight",
        duration:    6,
      });
      fetchRequests();
    });

    sock.on("chat_request_rejected", ({ reason }) => {
      notification.error({
        message:     "Chat Rejected",
        description: `Reason: ${reason || "Admin ne reject kar diya."}`,
        placement:   "topRight",
        duration:    6,
      });
      fetchRequests();
    });

    return () => {
      sock.off("chat_request_approved");
      sock.off("chat_request_rejected");
    };
  }, [user]);

  const pending  = requests.filter(r => r.status === "pending");
  const approved = requests.filter(r => r.status === "approved");
  const rejected = requests.filter(r => r.status === "rejected");

  const getTopicLabel = (topic) => {
    const map = {
      site_visit:   "Site Visit",
      commission:   "Commission",
      project_info: "Project Info",
      general:      "General",
    };
    return map[topic] || topic;
  };

  // ── Request Card ──────────────────────────────────────────
  const RequestCard = ({ req }) => (
    <Card
      className="mb-3 shadow-sm hover:shadow-md transition-shadow"
      style={{
        borderLeft: `4px solid ${
          req.status === "approved" ? "#10b981" :
          req.status === "rejected" ? "#ef4444" : "#f59e0b"
        }`
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <Tag color={
              req.status === "approved" ? "success" :
              req.status === "rejected" ? "error"   : "warning"
            }>
              {req.status === "approved" ? <><CheckCircleOutlined /> Approved</> :
               req.status === "rejected" ? <><CloseCircleOutlined /> Rejected</> :
               <><ClockCircleOutlined /> Pending</>}
            </Tag>
            <Tag color="purple">{getTopicLabel(req.topic)}</Tag>
          </div>

          <Text style={{ fontSize: 14 }}>{req.reason}</Text>

          {req.rejectionReason && (
            <div style={{
              marginTop: 8, padding: "6px 10px",
              background: "#fff1f0", borderRadius: 6,
              fontSize: 12, color: "#cf1322"
            }}>
              Rejection reason: {req.rejectionReason}
            </div>
          )}

          <div style={{ marginTop: 6, fontSize: 11, color: "#999" }}>
            {new Date(req.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit", month: "short", year: "numeric",
              hour: "2-digit", minute: "2-digit"
            })}
          </div>
        </div>

        {/* ✅ Chat button — sirf approved pe dikhega */}
        {req.status === "approved" && (
          <Button
            type="primary"
            icon={<MessageOutlined />}
            style={{ background: "#7c3aed", borderColor: "#7c3aed", marginLeft: 12 }}
           
onClick={() => {
 
  setActiveChat(req);
}}
          >
            Open Chat
          </Button>
        )}
      </div>
    </Card>
  );

  const EmptyState = ({ text }) => (
    <Empty
      description={<Text type="secondary">{text}</Text>}
      style={{ padding: "40px 0" }}
    />
  );

 
  // approved request mein lead object aur developer ID chahiye
 const chatLead = activeChat?.lead
  ? (typeof activeChat.lead === "object" ? activeChat.lead : { _id: activeChat.lead })
  : { _id: activeChat?._id }; // fallback

const chatDeveloperId =
  chatLead?.developer?._id ||
  chatLead?.developer      ||
  activeChat?.developerId  || 
  null;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <MessageOutlined className="mr-2 text-purple-600" />
            My Chat Requests
          </Title>
          <Text type="secondary">Admin se chat requests aur approved conversations</Text>
        </div>
        <Button onClick={fetchRequests} loading={loading}>Refresh</Button>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Pending",  count: pending.length,  color: "#f59e0b" },
          { label: "Approved", count: approved.length, color: "#10b981" },
          { label: "Rejected", count: rejected.length, color: "#ef4444" },
        ].map(s => (
          <Card
            key={s.label}
            style={{ flex: 1, borderTop: `3px solid ${s.color}` }}
            className="shadow-sm text-center"
          >
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: 13, color: "#888" }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Card className="shadow-sm rounded-xl">
        <Spin spinning={loading}>
          <Tabs
            items={[
              {
                key: "approved",
                label: (
                  <Badge count={approved.length} offset={[8, 0]}>
                    <span>Approved</span>
                  </Badge>
                ),
                children: approved.length > 0
                  ? approved.map(r => <RequestCard key={r._id} req={r} />)
                  : <EmptyState text="Koi approved request nahi hai abhi" />,
              },
              {
                key: "pending",
                label: (
                  <Badge count={pending.length} offset={[8, 0]} color="orange">
                    <span>Pending</span>
                  </Badge>
                ),
                children: pending.length > 0
                  ? pending.map(r => <RequestCard key={r._id} req={r} />)
                  : <EmptyState text="Koi pending request nahi hai" />,
              },
              {
                key: "rejected",
                label: `Rejected (${rejected.length})`,
                children: rejected.length > 0
                  ? rejected.map(r => <RequestCard key={r._id} req={r} />)
                  : <EmptyState text="Koi rejected request nahi hai" />,
              },
            ]}
          />
        </Spin>
      </Card>

      {/* ✅ ChatDrawer — approved hone ke baad open hoga */}
      {activeChat && user && chatLead && (
  <ChatDrawer
    lead={chatLead}
    currentUser={{ ...user, _id: user?._id || user?.id, type: "agent" }}
    otherUserId={chatDeveloperId || activeChat?.lead?.developer || "unknown"}
    otherName="Developer"
    onClose={() => setActiveChat(null)}
  />
)}

    </div>
  );
}