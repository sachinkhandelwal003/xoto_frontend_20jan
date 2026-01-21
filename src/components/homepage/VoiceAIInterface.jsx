import { useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";
import GlobeAnimation from "./GlobeAnimation";
import { motion } from "framer-motion";

const PUBLIC_KEY = "84eaf008-b5f6-410a-abae-033778db7132";
const ASSISTANT_ID = "25802ec9-95e5-41b4-8478-5b7c6e2fb36a";

function VoiceAIInterface({ onClose }) {
  const vapiRef = useRef(null);
  const [callActive, setCallActive] = useState(false);
  const [status, setStatus] = useState("Tap to Speak");

  useEffect(() => {
    const vapi = new Vapi(PUBLIC_KEY);
    vapiRef.current = vapi;

    // 2. Jab call actual mein connect ho jaye
    vapi.on("call-start", () => {
      setStatus("Listening..."); // Yahan status Listening ho jayega
      setCallActive(true);
    });

    vapi.on("call-end", () => {
      setStatus("Tap to Speak");
      setCallActive(false);
    });

    vapi.on("speech-start", () => {
      setStatus("AI Speaking...");
    });

    vapi.on("speech-end", () => {
      setStatus("Listening...");
    });

    // Error handling (Optional: Agar connect na ho paye to wapas reset karein)
    vapi.on("error", (e) => {
      console.error(e);
      setStatus("Tap to Speak");
      setCallActive(false);
    });

    return () => {
      vapi.stop();
    };
  }, []);

  const toggleCall = () => {
    if (callActive) {
      vapiRef.current.stop();
    } else {
      // 1. Jaise hi user tap kare, status update karo
      setStatus("AI Initializing..."); 
      vapiRef.current.start(ASSISTANT_ID);
    }
  };

  const handleClose = () => {
    vapiRef.current?.stop();
    onClose();
  };

  const isSpeaking = status === "AI Speaking...";

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={styles.container}
      className="absolute inset-0 z-[50]"
    >
      {/* --- HEADER --- */}
      <div style={styles.header}>
        <button style={styles.glassButton} onClick={handleClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        
        <div style={styles.headerTitleContainer}>
          <span style={styles.headerTitle}>Xobia Voice</span>
        </div>
        
        <div style={{ width: "36px", height: "36px" }}></div>
      </div>

      {/* --- CENTER GLOBE --- */}
      <div style={styles.mainContent}>
        <div style={styles.globeWrapper}>
           <GlobeAnimation isSpeaking={isSpeaking} />
        </div>
        
        {/* Status Text Animation */}
        <p className={`text-sm mt-4 font-medium tracking-wide animate-pulse ${
          callActive || status === "AI Initializing..." ? "text-purple-600" : "text-gray-400"
        }`}>
          {status}
        </p>
      </div>

      {/* --- FOOTER (MIC) --- */}
      <div style={styles.footer}>
        <button 
          onClick={toggleCall}
          // Disable button while initializing to prevent double taps
          disabled={status === "AI Initializing..."}
          style={{
            ...styles.micButton,
            ...(callActive || status === "AI Initializing..." ? styles.micActiveScale : {})
          }}
        >
          <div style={{
             ...styles.micIconContainer,
             ...(isSpeaking ? styles.micSpeakingPulse : {})
          }}>
             {/* Loading Spinner dikhana chahein to yahan conditional rendering kar sakte hain */}
             <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          </div>
        </button>
      </div>
    </motion.div>
  );
}

const styles = {
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: "#ffffff", 
    color: "#333",
    fontFamily: "'Inter', sans-serif",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    borderRadius: "16px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    zIndex: 10,
  },
  headerTitleContainer: {
    background: "rgba(0, 0, 0, 0.05)",
    padding: "6px 16px",
    borderRadius: "30px",
    border: "1px solid rgba(0, 0, 0, 0.05)",
  },
  headerTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#333",
    letterSpacing: "0.5px",
  },
  glassButton: {
    background: "transparent",
    border: "1px solid rgba(0, 0, 0, 0.1)",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  mainContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    zIndex: 5,
    marginTop: "-20px"
  },
  globeWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    transform: "scale(0.9)", 
    filter: "drop-shadow(0 0 30px rgba(147, 51, 234, 0.2))"
  },
  footer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: "30px",
    zIndex: 10,
  },
  micButton: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    border: "none",
    background: "linear-gradient(180deg, #a855f7 0%, #7e22ce 100%)", 
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 25px rgba(126, 34, 206, 0.3)",
    transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  },
  micActiveScale: {
    transform: "scale(1.1)",
    boxShadow: "0 0 50px rgba(126, 34, 206, 0.6)",
    border: "3px solid #f3e8ff"
  },
  micIconContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  micSpeakingPulse: {
      animation: "micPulseAnimation 1s infinite alternate ease-in-out",
  }
};

export default VoiceAIInterface;