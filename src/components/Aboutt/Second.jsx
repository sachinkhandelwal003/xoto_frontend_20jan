import { useEffect, useState } from "react";
import xotoLogo from "../../assets/img/logoNew.png"; // ← Update path if needed

export default function AboutXotoWithImage() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => setLoaded(true), []);

  return (
    <section className="bg-gradient-to-br from-gray-50 to-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* LEFT: Text */}
          <div
            className={`space-y-6 transition-all duration-1000 ease-out ${
              loaded ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              About XOTO
            </h2>
            <p className="text-base md:text-lg text-gray-600 leading-relaxed">
              XOTO is an{" "}
              <span className="font-semibold text-cyan-600">AI-powered platform</span>{" "}
              that simplifies the <span className="font-semibold">entire property journey</span>
              —from discovery and design to financing and landscaping—while connecting
              homeowners, agents, and freelancers. It creates a{" "}
              <span className="font-semibold text-green-600">seamless, one-stop ecosystem</span>{" "}
              that enhances experiences, boosts efficiency, and unlocks earning
              opportunities for all stakeholders.
            </p>
          </div>

          {/* RIGHT: Perfect Circle with Centered Image */}
          <div
            className={`flex justify-center md:justify-end transition-all duration-1000 ease-out delay-200 ${
              loaded ? "translate-x-0 opacity-100" : "translate-x-12 opacity-0"
            }`}
          >
            <div className="relative group">
              {/* Outer subtle ring */}
              <div className="absolute inset-0 w-64 h-64 md:w-80 md:h-80 rounded-full border-4 border-gray-200 opacity-40 scale-110 transition-transform duration-500 group-hover:scale-115" />

              {/* Perfect Circle Container */}
              <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden shadow-lg transition-all duration-500 group-hover:shadow-2xl group-hover:scale-105 bg-white p-8">
                {/* Flex centering + object-contain */}
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src={xotoLogo}
                    alt="Xoto Logo"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>

              {/* Hover glow overlay */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-400/20 to-green-400/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}