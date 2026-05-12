import { useEffect, useState } from "react";
import aboutImage from "../../assets/img/about.png?url";

export default function Powered() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
  setIsLoaded(true);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background with Double Gradient Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `
            linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)),
            linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)),
            url(${aboutImage})
          `,
        }}
      />

      {/* Centered Content */}
      <div className="relative z-10 flex items-center justify-center h-full px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center transition-all duration-1000 ease-out ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white drop-shadow-2xl leading-tight">
            AI-Powered Disruptor In
            <br className="block sm:hidden" />
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-200">
              Property Lifecycle
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-lg sm:text-xl md:text-2xl font-bold text-white drop-shadow-lg">
            Driven by AI. Built for Everyone
          </p>
        </div>
      </div>

      
       
    </div>
  );
}