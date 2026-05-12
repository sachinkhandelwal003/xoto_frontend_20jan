import React, { Suspense, useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, ContactShadows, Environment } from "@react-three/drei";
import { Home, Building2, Sofa, Trees, Store, MessageCircle, X, Mic, Square } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import Vapi from "@vapi-ai/web";

const vapi = new Vapi("84f99b6b-e6b3-4aa1-9a60-94efb8e117a7");

const itemsLeft = [
  { title: "MORTGAGES", desc: "Smart financing that works for you.", icon: <Home size={22} />, align: "left" },
  { title: "INTERIORS", desc: "Design spaces that reflect your lifestyle.", icon: <Sofa size={22} />, align: "left" },
  { title: "XOTO STORE", desc: "Curated marketplace for home upgrades.", icon: <Store size={22} />, align: "left" },
];

const itemsRight = [
  { title: "PROPERTY", desc: "Discover and transact with confidence.", icon: <Building2 size={22} />, align: "right" },
  { title: "LANDSCAPING", desc: "Elevate your outdoor living.", icon: <Trees size={22} />, align: "right" },
  { title: "ASSISTANCE", desc: "24/7 dedicated support team.", icon: <MessageCircle size={22} />, align: "right" },
];

// ==========================================
// AVATAR COMPONENT WITH LIP SYNC
// ==========================================
function Avatar({ isTalking }) {
  const { scene } = useGLTF("/modelll.glb");
  const headMeshRef = useRef(null);
  const mouthIndexRef = useRef(null);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.morphTargetDictionary) {
        const targetNames = [
          'mouthOpen', 'jawOpen', 'viseme_O', 'viseme_A',
          'mouth_open', 'Jaw_Open', 'viseme_aa', 'viseme_E',
          'viseme_I', 'viseme_U', 'jawForward'
        ];
        for (let name of targetNames) {
          if (child.morphTargetDictionary[name] !== undefined) {
            headMeshRef.current = child;
            mouthIndexRef.current = child.morphTargetDictionary[name];
            break;
          }
        }
        if (!headMeshRef.current) {
          
        }
      }
    });
  }, [scene]);

  useFrame(() => {
    if (headMeshRef.current && mouthIndexRef.current !== null) {
      const targetValue = isTalking ? Math.random() * 0.6 + 0.1 : 0;
      headMeshRef.current.morphTargetInfluences[mouthIndexRef.current] = THREE.MathUtils.lerp(
        headMeshRef.current.morphTargetInfluences[mouthIndexRef.current],
        targetValue,
        0.35
      );
    }
  });

  return (
    <primitive
      object={scene}
      // ✅ Model height=12, center.y=4.5
      // Scale: 12 units ko ~2 units mein fit karo → 2/12 = 0.167
      scale={0.17}
      // ✅ Center Y ko neutralize karo: -4.5 * 0.17 = -0.765
      position={[0, -0.77, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

useGLTF.preload("/modelll.glb");

// ==========================================
// MAIN APP COMPONENT
// ==========================================
export default function Checker() {
  const [isOpen, setIsOpen] = useState(false);
  const [callStatus, setCallStatus] = useState("inactive");
  const [isTalking, setIsTalking] = useState(false);

  useEffect(() => {
    vapi.on("call-start", () => { setCallStatus("active"); });
    vapi.on("call-end", () => { setCallStatus("inactive"); setIsTalking(false); });
    vapi.on("speech-start", () => { setIsTalking(true); });
    vapi.on("speech-end", () => { setIsTalking(false); });
    vapi.on("error", (e) => { console.error("❌", e); setCallStatus("inactive"); setIsTalking(false); });
    return () => { vapi.removeAllListeners(); vapi.stop(); };
  }, []);

  useEffect(() => { setIsOpen(true); }, []);

  const toggleVoiceBot = async () => {
    if (callStatus === "active") {
      vapi.stop(); setCallStatus("inactive"); setIsTalking(false);
    } else {
      setCallStatus("loading");
      try {
        await vapi.start("607d8457-2f03-4e11-a12f-0a4192feddcf");
        setCallStatus("active");
      } catch (err) {
        console.error("❌ Start failed", err);
        setCallStatus("inactive");
      }
    }
  };

  const handleClose = () => {
    setIsOpen(false); vapi.stop(); setCallStatus("inactive"); setIsTalking(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-indigo-400 to-purple-400 flex items-center justify-center p-4">
      <div className="text-center z-0">
        <h1 className="text-5xl font-black text-white/50 mb-4">Website Content Behind</h1>
        <button onClick={() => setIsOpen(true)} className="px-8 py-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all">
          Re-open Virtual Concierge
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0 bg-transparent backdrop-blur-[4px]"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative bg-white/10 backdrop-blur-md w-full max-w-7xl max-h-[95vh] overflow-y-auto lg:overflow-visible rounded-[3rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] border border-white/20"
            >
              <button
                onClick={handleClose}
                className="absolute top-6 right-6 z-50 p-3 bg-white/20 backdrop-blur-md rounded-full shadow-sm text-slate-800 hover:bg-white/40 hover:text-red-600 hover:rotate-90 transition-all duration-300 border border-white/30"
              >
                <X size={20} />
              </button>

              <div className="relative p-8 md:p-16 flex flex-col lg:flex-row items-center gap-12">

                {/* LEFT SIDE */}
                <div className="flex flex-col gap-10 w-full lg:w-1/4 order-2 lg:order-1">
                  {itemsLeft.map((item, idx) => <ItemCard key={idx} item={item} />)}
                </div>

                {/* CENTER 3D CANVAS */}
                <div className="relative w-full h-[450px] md:h-[550px] lg:w-2/4 order-1 lg:order-2 cursor-grab active:cursor-grabbing">
                  <Canvas
                    shadows
                    camera={{
                      position: [0, 0, 4],  // ✅ Camera seedha saamne, model ~2 units tall
                      fov: 40,              // ✅ Tight FOV - pura model frame mein aayega
                      near: 0.01,
                      far: 100,
                    }}
                  >
                    <Suspense fallback={null}>
                      <ambientLight intensity={1} />
                      <directionalLight position={[2, 4, 2]} intensity={1.5} castShadow />
                      <directionalLight position={[-2, 2, -1]} intensity={0.5} />
                      <Environment preset="city" />

                      <Avatar isTalking={isTalking} />

                      <ContactShadows
                        position={[0, -1.05, 0]}
                        opacity={0.4}
                        scale={4}
                        blur={2}
                      />
                    </Suspense>

                    <OrbitControls
                      enableZoom={false}
                      autoRotate={false}
                      minPolarAngle={Math.PI / 4}
                      maxPolarAngle={Math.PI / 1.8}
                      target={[0, 0, 0]}
                    />
                  </Canvas>

                  {/* Floating Label */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
                    <div className="bg-white/20 backdrop-blur-md px-8 py-3 rounded-2xl border border-white/30 shadow-lg text-center pointer-events-none">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-800 drop-shadow-sm">Virtual Assistant</span>
                      <h2 className="text-2xl font-black text-slate-900 drop-shadow-md">Xobia</h2>
                    </div>

                    <button
                      onClick={toggleVoiceBot}
                      disabled={callStatus === "loading"}
                      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-sm w-[180px] transition-all shadow-lg ${
                        callStatus === "active"
                          ? "bg-red-500 text-white hover:bg-red-600 animate-pulse"
                          : callStatus === "loading"
                          ? "bg-slate-400 text-white cursor-wait"
                          : "bg-indigo-600 text-white hover:bg-indigo-700"
                      }`}
                    >
                      {callStatus === "active" ? (
                        <><Square size={16} fill="currentColor" /> End Chat</>
                      ) : callStatus === "loading" ? "Connecting..." : (
                        <><Mic size={18} /> Talk to Xobia</>
                      )}
                    </button>
                  </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="flex flex-col gap-10 w-full lg:w-1/4 order-3">
                  {itemsRight.map((item, idx) => <ItemCard key={idx} item={item} />)}
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ItemCard({ item }) {
  const isRight = item.align === "right";
  return (
    <div className={`flex items-start gap-4 transition-transform hover:scale-105 ${isRight ? "flex-row-reverse text-right" : "text-left"}`}>
      <div className="w-14 h-14 shrink-0 flex items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-slate-900 shadow-sm border border-white/30">
        {item.icon}
      </div>
      <div className="flex flex-col justify-center">
        <h3 className="font-bold text-slate-900 text-[13px] tracking-wider uppercase mb-1 drop-shadow-sm">{item.title}</h3>
        <p className="text-[14px] text-slate-800 leading-snug font-medium drop-shadow-sm">{item.desc}</p>
      </div>
    </div>
  );
}
