import { useState, useRef, useEffect } from "react";
import { FiX, FiMic, FiSend } from "react-icons/fi";
import { BsRobot } from "react-icons/bs";
import xobiaAvatar from "../../assets/img/girlimage.png"; 
import { motion, AnimatePresence } from "framer-motion";
import { getChatSessionId } from "../../utils/createSessionID"; 

// ✅ 1. Import the New Voice Interface
import VoiceAIInterface from "./VoiceAIInterface"; 

const API = "https://xoto.ae";

function XobiaChatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // ✅ 2. New State for switching to Voice Mode
  const [showVoiceMode, setShowVoiceMode] = useState(false);

  // --- EXISTING STATE (Keeping functionality same as before) ---
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [botSpeaking, setBotSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [isHolding, setIsHolding] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const chatEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(typeof Audio !== "undefined" ? new Audio() : null);
  const holdTimerRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const inputTextareaRef = useRef(null);
  const startTimeRef = useRef(null);
  const touchActiveRef = useRef(false);
  const isIOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);

  // --- AUDIO LOGIC (Keeping it intact so text chat audio works) ---
  const prepareAudioForiOS = () => {
    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;
    audio.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAGZGF0YQAAAAA=";
    audio.play().catch(() => {});
  };

  useEffect(() => {
    const textarea = inputTextareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
    }
  }, [input]);

  const stopAllAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setBotSpeaking(false);
      setSpeakingMessageId(null);
    }
  };

  const handleCloseChat = () => {
    stopAllAudio();
    setIsOpen(false);
    setShowVoiceMode(false); // Reset voice mode on close
  };

  // --- FETCH MESSAGES ---
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const session_id = getChatSessionId();
        const res = await fetch(`${API}/api/ai/chat/get-all-messages?session_id=${session_id}`);
        const data = await res.json();
        const formatted = data.map((msg) => ({
          id: msg._id,
          role: msg.sender === "user" ? "user" : "bot",
          text: msg.text || "",
          audioUrl: msg.audioUrl || null,
          type: msg.audioUrl ? "audio" : "text",
          autoPlay: false,
          timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }));
        setMessages(formatted);
      } catch (err) { console.error("Failed to load messages", err); }
    };
    if (isOpen) fetchMessages();
  }, [isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading, voiceLoading, recording]);

  const playBotAudio = (url, messageId) => {
    if(!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;
    audio.pause();
    audio.src = url;
    audio.currentTime = 0;
    setBotSpeaking(true);
    setSpeakingMessageId(messageId);
    audio.play().catch(() => { setBotSpeaking(false); setSpeakingMessageId(null); });
    audio.onended = () => { setBotSpeaking(false); setSpeakingMessageId(null); };
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    prepareAudioForiOS();
    
    const userMsg = { id: Date.now(), role: "user", type: "text", text: input, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("message", userMsg.text);
      formData.append("session_id", getChatSessionId());
      const res = await fetch(`${API}/api/ai/chat`, { method: "POST", body: formData });
      const data = await res.json();
      setMessages(prev => [...prev, {
        id: Date.now() + Math.random(),
        role: "bot",
        text: data.ai?.text || data.text || "",
        audioUrl: data.ai?.audioUrl || null,
        type: data.ai?.audioUrl ? "audio" : "text",
        autoPlay: true,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    } catch {
      setMessages((prev) => [...prev, { id: Date.now(), role: "bot", type: "text", text: "Error connecting to AI.", timestamp: "" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const SpeakingIndicator = () => (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-purple-600">Xobia is speaking</span>
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" />
        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]" />
        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:0.4s]" />
      </div>
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.5 }}
            whileHover={{ scale: 1.05, boxShadow: "0px 10px 30px rgba(139, 92, 246, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[9999] flex items-center gap-4 bg-white border border-slate-100 py-2 pl-6 pr-2 rounded-full shadow-2xl"
          >
            <div className="flex flex-col text-left">
              <span className="text-[10px] uppercase tracking-widest text-purple-500 font-bold">AI Expert</span>
              <span className="text-slate-900 font-extrabold text-sm">Talk with <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Xobia</span></span>
            </div>
            <div className="relative w-12 h-12 bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-blue-500 rounded-full p-[1px]">
              <img src={xobiaAvatar} alt="Xobia" className="w-full h-full object-cover rounded-full" />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-black/60 md:bg-transparent pointer-events-auto" onClick={handleCloseChat}></div>

          <div className="pointer-events-auto relative w-[95%] max-w-[400px] md:max-w-md h-[85vh] md:h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:absolute md:bottom-8 md:right-8 animate-in fade-in zoom-in duration-300">
            
            {/* ✅ 3. LOGIC SWITCH: If Voice Mode is ON, show Voice Interface, else show Text Chat */}
            {showVoiceMode ? (
                // --- NEW VOICE INTERFACE (Fits inside the same modal) ---
                <VoiceAIInterface onClose={() => setShowVoiceMode(false)} />
            ) : (
                // --- ORIGINAL TEXT CHAT UI ---
                <>
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                          <BsRobot className="w-6 h-6" />
                        </div>
                        <div>
                          <h2 className="font-bold text-lg">Talk with Xobia</h2>
                          <p className="text-xs text-white/80">AI Property Assistant</p>
                        </div>
                      </div>
                      <button onClick={handleCloseChat} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <FiX className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 scroll-smooth">
                      {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-4">
                          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                            <BsRobot className="w-8 h-8 text-blue-600" />
                          </div>
                          <h3 className="font-bold text-gray-800 text-lg">Hi, I'm Xobia! 👋</h3>
                          <p className="text-sm text-gray-600 mb-6">Ask me anything about properties or design.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {messages.map((m) => (
                            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${m.role === "user" ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-none" : "bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100"}`}>
                                {m.role === "user" && m.type === "voice-sent" && (
                                  <div className="flex items-center gap-2 mb-1">
                                     <FiMic className="w-3 h-3 text-white/80" />
                                     <span className="text-xs font-medium text-white/90">Voice Note</span>
                                  </div>
                                )}
                                {m.role === "bot" && m.type === "audio" && (
                                  botSpeaking && speakingMessageId === m.id ?
                                  <SpeakingIndicator /> :
                                  <button onClick={() => playBotAudio(m.audioUrl, m.id)} className="text-sm font-medium flex items-center gap-2">
                                    <span>🔊 Play Response</span>
                                  </button>
                                )}
                                {m.type === "text" && <p className="text-sm leading-relaxed">{m.text}</p>}
                                <div className={`text-[10px] text-right mt-1 ${m.role === "user" ? "text-blue-100" : "text-gray-400"}`}>{m.timestamp}</div>
                              </div>
                            </div>
                          ))}
                          {loading && <div className="text-xs text-gray-400 ml-2 animate-pulse">Thinking...</div>}
                          <div ref={chatEndRef} />
                        </div>
                      )}
                    </div>

                    {/* FOOTER */}
                    <div className="p-3 bg-white border-t border-gray-100 shrink-0">
                      <div className="flex items-end gap-2 h-full min-h-[50px]">
                        
                        {/* ✅ 4. MIC BUTTON - NOW OPENS VOICE MODE */}
                        <button
                          onClick={() => setShowVoiceMode(true)}
                          disabled={loading || botSpeaking}
                          className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
                        >
                          <FiMic className="w-5 h-5" />
                        </button>

                        {/* Input Area */}
                        <div className="flex-1 relative h-12 flex items-center">
                            <div className="w-full h-full bg-gray-100 rounded-2xl flex items-center pr-2">
                                <textarea
                                    ref={inputTextareaRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type a message..."
                                    disabled={loading}
                                    rows={1}
                                    className="w-full px-4 py-3 bg-transparent border-none focus:ring-0 resize-none text-sm max-h-32 text-gray-800 placeholder-gray-400"
                                />
                                {input.trim() && (
                                    <button
                                    onClick={sendMessage}
                                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm"
                                    >
                                    <FiSend className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        </div>
                      </div>
                    </div>
                </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default XobiaChatbot;