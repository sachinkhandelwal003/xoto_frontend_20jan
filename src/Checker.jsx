import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, Gltf, ContactShadows, Environment } from "@react-three/drei";
import { Home, Building2, Sofa, Trees, Store, MessageCircle } from "lucide-react";

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

export default function Checker() {
  return (
    <div className="bg-[#f8fafc] min-h-screen flex justify-center items-center p-4 md:p-10 font-sans antialiased text-slate-900">
      {/* Main Container */}
      <div className="relative bg-white/70 backdrop-blur-xl rounded-[3rem] p-8 md:p-16 w-full max-w-7xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] flex flex-col lg:flex-row items-center gap-12 border border-white/40">
        
        {/* Background Decorative Elements */}
        <div className="absolute top-[-10%] left-[-5%] w-72 h-72 bg-indigo-100 rounded-full blur-[120px] opacity-60 -z-10" />
        <div className="absolute bottom-[-10%] right-[-5%] w-72 h-72 bg-violet-100 rounded-full blur-[120px] opacity-60 -z-10" />

        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-12 w-full lg:w-1/4 order-2 lg:order-1">
          {itemsLeft.map((item, idx) => (
            <ItemCard key={idx} item={item} />
          ))}
        </div>

        {/* CENTER COLUMN: 3D Scene */}
        <div className="relative w-full h-[450px] md:h-[650px] lg:w-2/4 order-1 lg:order-2 group">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/0 via-slate-100/40 to-slate-50/0 rounded-full scale-90 blur-2xl" />
          
          <Canvas shadows camera={{ position: [0, 0, 5], fov: 25 }}>
            <Suspense fallback={null}>
              <Stage environment="city" intensity={0.6} adjustCamera={1.1}>
                <Gltf 
                   src="/model.glb" 
                   castShadow 
                   receiveShadow 
                />
              </Stage>
              <ContactShadows 
                position={[0, -0.8, 0]} 
                opacity={0.4} 
                scale={8} 
                blur={2} 
                far={4} 
                color="#000000" 
              />
            </Suspense>

            {/* OrbitControls: autoRotate set to FALSE */}
            <OrbitControls 
              enableZoom={false} 
              enablePan={false}
              autoRotate={false} 
              makeDefault 
              minPolarAngle={Math.PI / 2.5} 
              maxPolarAngle={Math.PI / 2} 
            />
          </Canvas>
          
          {/* Floating Label */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-10 py-4 rounded-3xl shadow-xl border border-white/50 flex flex-col items-center transform transition-all duration-500 group-hover:-translate-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500 mb-1">Virtual Concierge</span>
            <h2 className="font-black text-2xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Xobia
            </h2>
            <div className="w-12 h-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full mt-2 shadow-sm" />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-12 w-full lg:w-1/4 order-3">
          {itemsRight.map((item, idx) => (
            <ItemCard key={idx} item={item} />
          ))}
        </div>

      </div>
    </div>
  );
}

function ItemCard({ item }) {
  const isRight = item.align === "right";
  
  return (
    <div className={`group flex items-start gap-6 transition-all duration-300 hover:scale-[1.02] ${isRight ? "flex-row-reverse text-right" : "text-left"}`}>
      {/* Icon Container */}
      <div className="relative">
        <div className="w-14 h-14 shrink-0 flex items-center justify-center rounded-[1.25rem] bg-white shadow-[0_8px_20px_rgba(0,0,0,0.06)] border border-slate-100 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-indigo-200">
          {item.icon}
        </div>
      </div>

      {/* Text Content */}
      <div className="flex flex-col space-y-1">
        <h3 className="font-black text-slate-800 text-sm tracking-widest uppercase">
          {item.title}
        </h3>
        <p className="text-[15px] text-slate-500 leading-relaxed font-medium max-w-[200px]">
          {item.desc}
        </p>
      </div>
    </div>
  );
}