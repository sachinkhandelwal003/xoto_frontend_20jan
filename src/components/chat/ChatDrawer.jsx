import React, { useState, useEffect, useRef } from "react";
import { SendOutlined, CloseOutlined, CalendarOutlined } from "@ant-design/icons";
import { apiService } from "../../manageApi/utils/custom.apiservice";
import {
  getSocket, registerSocket,
  getCachedMessages, addMessageToCache, setRoomMessages,
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
    if (!room || !otherUserId || !myId) { setLoading(false); return; }

    const sock = getSocket();
    registerSocket(myId);

    const cached = getCachedMessages(room);
    if (cached.length > 0) {
      setMsgs(cached);
      setLoading(false);
    } else {
      apiService
        .get(`/chat/history/${leadId}/${otherUserId}`)
        .then((res) => {
          const list   = Array.isArray(res?.data?.data) ? res.data.data : [];
          const mapped = list.map((m) => ({
            id:         m._id,
            from:       m.senderType,
            text:       m.message,
            senderName: m.senderName || "Unknown",
            time:       new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
        time:       new Date(data.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      if (getCachedMessages(room).find(m => m.id === newMsg.id)) return;
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

  const isMe      = (msg) => msg.from === currentUser?.type;
  const getInit   = (name) => name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2) : "U";

  return (
    <>
      <div style={S.overlay} onClick={onClose} />
      <div style={S.drawer}>

        {/* Header */}
        <div style={S.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={S.avatar}>{getInit(otherName)}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: "#fff" }}>
                {otherName || "User"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                <span style={S.dot} />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>Online</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={S.closeBtn}><CloseOutlined /></button>
        </div>

        {/* Pill */}
        <div style={S.pill}>
          <CalendarOutlined style={{ marginRight: 6, color: "#7c3aed", fontSize: 12 }} />
          <span style={{ fontSize: 12, color: "#6b7280" }}>
            {lead?.name?.first_name} {lead?.name?.last_name}
            {lead?.property_type    ? ` · ${lead.property_type}`    : ""}
            {lead?.preferred_location ? ` · ${lead.preferred_location}` : ""}
          </span>
        </div>

        {/* Messages */}
        <div style={S.msgArea}>
          {loading && <div style={S.center}>Loading messages...</div>}

          {!loading && msgs.length === 0 && (
            <div style={{ ...S.center, marginTop: 80 }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>💬</div>
              <div style={{ fontWeight: 600, color: "#374151", marginBottom: 4 }}>No messages yet</div>
              <div style={{ fontSize: 12, color: "#9ca3af" }}>Start the conversation below</div>
            </div>
          )}

          {msgs.map((m, i) => (
            <div key={m.id || i} style={{
              display: "flex", flexDirection: "column",
              alignItems: isMe(m) ? "flex-end" : "flex-start",
              marginBottom: 14,
            }}>
              <span style={{ fontSize: 10, color: "#9ca3af", marginBottom: 3 }}>{m.senderName}</span>
              <div style={{
                ...S.bubble,
                background:   isMe(m) ? "linear-gradient(135deg,#7c3aed,#5b21b6)" : "#f3f4f6",
                color:        isMe(m) ? "#fff" : "#1f2937",
                borderRadius: isMe(m) ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                boxShadow:    isMe(m) ? "0 4px 12px rgba(124,58,237,0.25)" : "0 2px 6px rgba(0,0,0,0.06)",
              }}>
                {m.text}
              </div>
              <span style={{ fontSize: 10, color: "#9ca3af", marginTop: 4 }}>{m.time}</span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={S.inputWrapper}>
          <div style={S.inputRow}>
            <input
              style={S.chatInput}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type a message..."
            />
            <button
              onClick={send}
              style={{ ...S.sendBtn, opacity: input.trim() ? 1 : 0.45 }}
              disabled={!input.trim()}
            >
              <SendOutlined />
            </button>
          </div>
        </div>

      </div>
      <style>{`
        @keyframes xotoSlide { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes xotoFade  { from{opacity:0} to{opacity:1} }
      `}</style>
    </>
  );
};

const S = {
  overlay:   { position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:999, animation:"xotoFade 0.2s ease" },
  drawer:    { position:"fixed", top:0, right:0, width:390, height:"100%", background:"#fff", display:"flex", flexDirection:"column", zIndex:1000, boxShadow:"-8px 0 40px rgba(0,0,0,0.18)", animation:"xotoSlide 0.28s cubic-bezier(0.4,0,0.2,1)" },
  header:    { background:"linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)", padding:"18px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"2px solid #7c3aed" },
  avatar:    { width:42, height:42, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#5b21b6)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:15, flexShrink:0, boxShadow:"0 2px 10px rgba(124,58,237,0.45)" },
  dot:       { width:7, height:7, borderRadius:"50%", background:"#22c55e", display:"inline-block", boxShadow:"0 0 0 2px rgba(34,197,94,0.25)" },
  closeBtn:  { background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)", color:"#fff", fontSize:14, cursor:"pointer", padding:"7px 9px", borderRadius:8, lineHeight:1 },
  pill:      { background:"#faf5ff", borderBottom:"1px solid #ede9fe", padding:"9px 18px", display:"flex", alignItems:"center" },
  msgArea:   { flex:1, overflowY:"auto", padding:"20px 18px 12px", background:"#f9fafb" },
  center:    { textAlign:"center", color:"#9ca3af", fontSize:13 },
  bubble:    { maxWidth:"76%", padding:"10px 15px", fontSize:14, lineHeight:1.55, wordBreak:"break-word" },
  inputWrapper: { padding:"14px 16px", borderTop:"1px solid #e5e7eb", background:"#fff" },
  inputRow:  { display:"flex", alignItems:"center", gap:8, background:"#f3f4f6", borderRadius:28, padding:"4px 4px 4px 18px", border:"1.5px solid #e5e7eb" },
  chatInput: { flex:1, border:"none", background:"transparent", fontSize:14, outline:"none", color:"#1f2937", padding:"7px 0" },
  sendBtn:   { background:"linear-gradient(135deg,#7c3aed,#5b21b6)", border:"none", borderRadius:"50%", width:38, height:38, color:"#fff", cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 2px 8px rgba(124,58,237,0.35)" },
};

export default ChatDrawer;