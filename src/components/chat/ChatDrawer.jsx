import React, { useState, useEffect, useRef } from "react";
import { Avatar } from "antd";
import { UserOutlined, SendOutlined, CloseOutlined, CalendarOutlined } from "@ant-design/icons";
import { apiService } from "../../manageApi/utils/custom.apiservice";
import {
  getSocket,
  registerSocket,
  getCachedMessages,
  addMessageToCache,
  setRoomMessages,
} from "../../utils/socket";

const getRoomId = (id1, id2, leadId) => {
  if (!id1 || !id2 || !leadId) return null;
  return [id1.toString(), id2.toString(), leadId.toString()].sort().join("_");
};

const ChatDrawer = ({ lead, currentUser, otherUserId, otherName, onClose }) => {
  const myId   = currentUser?._id || currentUser?.id;
  const leadId = lead?._id;
  const room   = getRoomId(myId, otherUserId, leadId);

  const [msgs, setMsgs]       = useState(() => getCachedMessages(room) || []);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef             = useRef(null);

  useEffect(() => {
    if (!room || !otherUserId || !myId) {
      setLoading(false);
      return;
    }

    const sock = getSocket();
    registerSocket(myId);

    // Cache mein messages hain toh fetch mat karo
    const cached = getCachedMessages(room);
    if (cached.length > 0) {
      setMsgs(cached);
      setLoading(false);
    } else {
      apiService
        .get(`/chat/history/${leadId}/${otherUserId}`)
        .then((res) => {
          const list = Array.isArray(res?.data?.data) ? res.data.data : [];
          const mapped = list.map((m) => ({
            id:         m._id,
            from:       m.senderType,
            text:       m.message,
            senderName: m.senderName || "Unknown",
            time:       new Date(m.createdAt).toLocaleTimeString([], {
              hour: "2-digit", minute: "2-digit",
            }),
          }));
          setRoomMessages(room, mapped);
          setMsgs(mapped);
        })
        .catch(() => setMsgs([]))
        .finally(() => setLoading(false));
    }

    const onMsg = (data) => {
  if (data.room && data.room !== room) return;

  const newMsg = {
    id:         data._id || Date.now(),
    from:       data.senderType,
    text:       data.message,
    senderName: data.senderName || "Unknown",
    time:       new Date(data.createdAt || Date.now()).toLocaleTimeString([], {
      hour: "2-digit", minute: "2-digit",
    }),
  };

  // ✅ Duplicate check — same _id wala message dobara mat add karo
  const existing = getCachedMessages(room).find(m => m.id === newMsg.id);
  if (existing) return;

  addMessageToCache(room, newMsg);
  setMsgs([...getCachedMessages(room)]);
};

    sock.off("receive_message");
    sock.on("receive_message", onMsg);

    return () => sock.off("receive_message", onMsg);
  }, [room, otherUserId, myId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const send = () => {
    if (!input.trim() || !room || !myId) return;

    const sock = getSocket();
    const name = `${currentUser?.first_name || ""} ${currentUser?.last_name || ""}`.trim() || "Unknown";

    sock.emit("send_message", {
      leadId,
      senderId:   myId,
      senderType: currentUser?.type,
      senderName: name,
      receiverId: otherUserId,
      message:    input.trim(),
    });

    setInput("");
  };

  const isMe = (msg) => msg.from === currentUser?.type;

  return (
    <div style={S.overlay}>
      <div style={S.drawer}>

        <div style={S.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar icon={<UserOutlined />} style={{ background: "#faad14", flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#fff", lineHeight: 1.2 }}>
                {otherName || "User"}
              </div>
              <div style={{ fontSize: 11, color: "rgba(250,173,20,0.7)" }}>
                {lead?.name?.first_name} {lead?.name?.last_name} ka visit
              </div>
            </div>
          </div>
          <button onClick={onClose} style={S.closeBtn}><CloseOutlined /></button>
        </div>

        <div style={S.pill}>
          <CalendarOutlined style={{ marginRight: 6, color: "#faad14" }} />
          <span style={{ fontSize: 12, color: "#555" }}>
            Site visit &bull; {lead?.property_type || "Property"} &bull;{" "}
            {lead?.preferred_location || "N/A"}
          </span>
        </div>

        <div style={S.msgArea}>
          {loading && (
            <p style={{ textAlign: "center", color: "#aaa", marginTop: 20 }}>Loading...</p>
          )}
          {!loading && msgs.length === 0 && (
            <p style={{ textAlign: "center", color: "#aaa", marginTop: 40 }}>
              Pehla message bhejo!
            </p>
          )}
          {msgs.map((m, i) => (
            <div key={m.id || i} style={{
              display: "flex", flexDirection: "column",
              alignItems: isMe(m) ? "flex-end" : "flex-start",
              marginBottom: 10,
            }}>
              <div style={{
                ...S.bubble,
                background:   isMe(m) ? "#7c3aed" : "#f0f0f0",
                color:        isMe(m) ? "#fff" : "#333",
                borderRadius: isMe(m) ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              }}>
                {m.text}
              </div>
              <span style={{ fontSize: 10, color: "#aaa", marginTop: 3 }}>
                {m.senderName} &bull; {m.time}
              </span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div style={S.inputRow}>
          <input
            style={S.chatInput}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Message likho..."  
          />
          <button onClick={send} style={S.sendBtn}><SendOutlined /></button> 
        </div>

      </div>
    </div>
  );
};

const S = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.35)",
    zIndex: 1000, display: "flex", justifyContent: "flex-end",
  },
  drawer: {
    width: 380, height: "100%", background: "#fff",
    display: "flex", flexDirection: "column",
    boxShadow: "-4px 0 24px rgba(0,0,0,0.15)",
    animation: "slideIn 0.25s ease",
  },
  header: {
    background: "#1a1a2e", padding: "16px 20px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
  },
  closeBtn: {
    background: "transparent", border: "none",
    color: "#fff", fontSize: 16, cursor: "pointer", padding: 4,
  },
  pill: {
    background: "#fffbe6", borderBottom: "1px solid #ffe58f",
    padding: "8px 16px", display: "flex", alignItems: "center",
  },
  msgArea: { flex: 1, overflowY: "auto", padding: "16px", background: "#fafafa" },
  bubble: {
    maxWidth: "78%", padding: "9px 14px",
    fontSize: 14, lineHeight: 1.5, wordBreak: "break-word",
  },
  inputRow: {
    display: "flex", gap: 8, padding: "12px 14px",
    borderTop: "1px solid #eee", background: "#fff",
  },
  chatInput: {
    flex: 1, border: "1px solid #ddd", borderRadius: 20,
    padding: "8px 14px", fontSize: 14, outline: "none",
  },
  sendBtn: {
    background: "#7c3aed", border: "none", borderRadius: "50%",
    width: 38, height: 38, color: "#fff", cursor: "pointer",
    fontSize: 15, display: "flex", alignItems: "center",
    justifyContent: "center", flexShrink: 0,
  },
};

const st = document.createElement("style");
st.textContent = `@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`;
document.head.appendChild(st);

export default ChatDrawer;
