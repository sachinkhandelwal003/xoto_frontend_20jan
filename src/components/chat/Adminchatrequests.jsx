import React, { useState, useEffect } from "react";
import {
  Card, Typography, Tag, Button, Space, Modal, Form,
  Input, Table, Tabs, Badge, message, Avatar, Tooltip,
} from "antd";
import {
  CheckOutlined, CloseOutlined, MessageOutlined,
  UserOutlined, ClockCircleOutlined, EyeOutlined,
} from "@ant-design/icons";
import { apiService } from "../../manageApi/utils/custom.apiservice";
import { getSocket, registerSocket } from "../../utils/socket";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;

export default function AdminChatRequests() {
  const { user } = useSelector(state => state.auth);
  const [requests, setRequests]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [rejectForm] = Form.useForm();
  const [actionLoading, setActionLoading] = useState(false);
  const [detailModal, setDetailModal] = useState(false);

  const fetchRequests = async () => {
  try {
    setLoading(true);
    const res  = await apiService.get("/chat-request/all-requests");
   
    
    // ✅ Multiple formats handle karo
    const list = Array.isArray(res?.data?.data) ? res.data.data
               : Array.isArray(res?.data)       ? res.data
               : Array.isArray(res)             ? res
               : [];
    setRequests(list);
  } catch (err) {
   
    message.error("Requests load nahi huyi");
  } finally { setLoading(false); }
};

  useEffect(() => {
    fetchRequests();
    if (user?._id) {
      const sock = getSocket();
      registerSocket(user._id);
      // New request aane pe notify karo
      sock.on("new_chat_request", () => {
        message.info("Naya chat request aaya hai!");
        fetchRequests();
      });
      return () => sock.off("new_chat_request");
    }
  }, [user]);

  // ── Approve ──────────────────────────────────────────────────
  // ✅ AdminChatRequests.jsx mein handleApprove function replace karo:

const handleApprove = async (req) => {
  setActionLoading(true);
  try {
    await apiService.put(`/chat-request/approve/${req._id}`);

    // Agent ka ID
    const agentId = req.agent?._id || req.agent;

    // Developer ka ID — lead se nikalo
    const developerId =
      req.lead?.developer?._id ||
      req.lead?.developer      ||
      null;

    // Socket events bhejo
    const sock = getSocket();

    // Agent ko notify karo
    sock.emit("approve_chat_request", {
      agentId,
      requestId:   req._id,
      developerId, // ✅ Developer ko bhi notify karo
    });

    message.success("Request approve kar di!");
    fetchRequests();
  } catch {
    message.error("Approve nahi hua");
  } finally {
    setActionLoading(false);
  }
};

  // ── Reject ───────────────────────────────────────────────────
  const openRejectModal = (req) => { setSelectedReq(req); setRejectModal(true); };

  const handleReject = async (values) => {
    setActionLoading(true);
    try {
      await apiService.put(`/chat-request/reject/${selectedReq._id}`, {
        rejectionReason: values.reason,
      });

      // Agent ko notify karo
      const sock = getSocket();
      sock.emit("reject_chat_request", {
        agentId:   selectedReq.agent?._id || selectedReq.agent,
        requestId: selectedReq._id,
        reason:    values.reason,
      });

      message.success("Request reject kar di!");
      setRejectModal(false);
      rejectForm.resetFields();
      fetchRequests();
    } catch { message.error("Reject nahi hua"); }
    finally { setActionLoading(false); }
  };

  const getTopicLabel = (topic) => {
    const map = { site_visit: "Site Visit", commission: "Commission", project_info: "Project Info", general: "General" };
    return map[topic] || topic;
  };

  const pending  = requests.filter(r => r.status === "pending");
  const approved = requests.filter(r => r.status === "approved");
  const rejected = requests.filter(r => r.status === "rejected");

  const columns = (showActions = true) => [
    {
      title: "Agent",
      render: (_, r) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ background: "#7c3aed" }} />
          <div>
            <Text strong>{r.agentName || `${r.agent?.first_name || ""} ${r.agent?.last_name || ""}`}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 11 }}>{r.agent?.email || "—"}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Topic",
      render: (_, r) => <Tag color="purple">{getTopicLabel(r.topic)}</Tag>,
    },
    {
      title: "Reason",
      render: (_, r) => (
        <Text style={{ maxWidth: 200, display: "block" }} ellipsis={{ tooltip: r.reason }}>
          {r.reason}
        </Text>
      ),
    },
    {
      title: "Date",
      render: (_, r) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
        </Text>
      ),
    },
    {
      title: "Status",
      render: (_, r) => (
        <Tag color={r.status === "approved" ? "success" : r.status === "rejected" ? "error" : "warning"}>
          {r.status.toUpperCase()}
        </Tag>
      ),
    },
    ...(showActions ? [{
      title: "Action",
      render: (_, r) => (
        <Space>
          <Tooltip title="View Detail">
            <Button size="small" icon={<EyeOutlined />} onClick={() => { setSelectedReq(r); setDetailModal(true); }} />
          </Tooltip>
          {r.status === "pending" && (
            <>
              <Tooltip title="Approve">
                <Button
                  size="small" type="primary"
                  icon={<CheckOutlined />}
                  style={{ background: "#10b981", borderColor: "#10b981" }}
                  loading={actionLoading}
                  onClick={() => handleApprove(r)}
                >
                  Approve
                </Button>
              </Tooltip>
              <Tooltip title="Reject">
                <Button
                  size="small" danger
                  icon={<CloseOutlined />}
                  onClick={() => openRejectModal(r)}
                >
                  Reject
                </Button>
              </Tooltip>
            </>
          )}
        </Space>
      ),
    }] : []),
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <MessageOutlined className="mr-2 text-purple-600" />
            Chat Requests
          </Title>
          <Text type="secondary">Agents ki chat requests approve ya reject karo</Text>
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
          <Card key={s.label} style={{ flex: 1, borderTop: `3px solid ${s.color}` }} className="shadow-sm text-center">
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: 13, color: "#888" }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Card className="shadow-sm rounded-xl">
        <Tabs
          items={[
            {
              key: "pending",
              label: <Badge count={pending.length} color="orange" offset={[8, 0]}><span>Pending</span></Badge>,
              children: <Table columns={columns(true)} dataSource={pending} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} />,
            },
            {
              key: "approved",
              label: `Approved (${approved.length})`,
              children: <Table columns={columns(false)} dataSource={approved} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} />,
            },
            {
              key: "rejected",
              label: `Rejected (${rejected.length})`,
              children: <Table columns={columns(false)} dataSource={rejected} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} />,
            },
          ]}
        />
      </Card>

      {/* Reject Modal */}
      <Modal
        title="Request Reject Karo"
        open={rejectModal}
        onCancel={() => { setRejectModal(false); rejectForm.resetFields(); }}
        footer={null}
        centered
      >
        <Form form={rejectForm} layout="vertical" onFinish={handleReject} className="mt-4">
          <Form.Item name="reason" label="Rejection Reason" rules={[{ required: true, message: "Reason likho" }]}>
            <Input.TextArea rows={3} placeholder="Reason likho..." />
          </Form.Item>
          <div className="flex justify-end gap-3">
            <Button onClick={() => setRejectModal(false)}>Cancel</Button>
            <Button type="primary" danger htmlType="submit" loading={actionLoading}>Reject</Button>
          </div>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Request Detail"
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        footer={[<Button key="close" onClick={() => setDetailModal(false)}>Close</Button>]}
        centered
      >
        {selectedReq && (
          <div className="mt-2">
            <p><strong>Agent:</strong> {selectedReq.agentName}</p>
            <p><strong>Topic:</strong> {getTopicLabel(selectedReq.topic)}</p>
            <p><strong>Reason:</strong> {selectedReq.reason}</p>
            <p><strong>Status:</strong> <Tag color={selectedReq.status === "approved" ? "success" : selectedReq.status === "rejected" ? "error" : "warning"}>{selectedReq.status}</Tag></p>
            {selectedReq.rejectionReason && <p><strong>Rejection Reason:</strong> {selectedReq.rejectionReason}</p>}
            <p><strong>Date:</strong> {new Date(selectedReq.createdAt).toLocaleString()}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}