import { useEffect, useState } from "react";
import cityImage from "../../assets/img/vision.png"; // Your image

export default function VisionSection() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <section className="relative bg-gradient-to-br from-purple-50 via-white to-teal-50 py-16 md:py-28 overflow-hidden">
      {/* Subtle Wave Background */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg
          viewBox="0 0 1440 320"
          className="w-full h-32 md:h-40"
          preserveAspectRatio="none"
        >
          <path
            fill="url(#waveGradient)"
            d="M0,160 C320,280 720,80 1440,160 L1440,320 L0,320 Z"
            opacity="0.5"
          />
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#99f6e4" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#a7f3d0" stopOpacity="0.4" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        {/* TOP: Vision (Centered) */}
        <div
          className={`text-center mb-12 md:mb-16 transition-all duration-1000 ease-out ${
            loaded ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
          }`}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            Vision
          </h2>
        </div>

        {/* BOTTOM: Image LEFT + Text RIGHT */}
        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* LEFT: 3D City Image */}
          <div
            className={`flex justify-center md:justify-end transition-all duration-1000 ease-out delay-200 ${
              loaded ? "translate-x-0 opacity-100" : "-translate-x-20 opacity-0"
            }`}
          >
            <div className="w-64 h-64 md:w-96 md:h-96">
              <img
                src={cityImage}
                alt="3D City Model"
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          {/* RIGHT: Text (Bold) */}
          <div
            className={`space-y-4 text-left md:text-left transition-all duration-1000 ease-out delay-300 ${
              loaded ? "translate-x-0 opacity-100" : "translate-x-20 opacity-0"
            }`}
          >
            <h3 className="text-xl md:text-2xl font-bold text-gray-800">
              Democratizing Real Estate
            </h3>
            <p className="text-base md:text-lg font-bold text-cyan-600">
              For Every Customer. With Every Agent. Powered By AI.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}