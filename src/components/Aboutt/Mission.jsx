import { useEffect, useState } from "react";
import tabletImage from "../../assets/img/mission.png";
import aiRoomImage from "../../assets/img/dna.png";
import ecoHouseImage from "../../assets/img/tom.png";

export default function AboutMissionAIDNA() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div className="bg-gradient-to-br from-purple-50 via-white to-teal-50">

      {/* ==================== MISSION ==================== */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">

          {/* MISSION HEADING – ABOVE IMAGE */}
          <div
            className={`text-center mb-12 md:mb-16 transition-all duration-1000 ease-out ${
              loaded ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
            }`}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
              Mission
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start">

            {/* LEFT – Hand + Tablet (Below Heading) */}
            <div
              className={`flex justify-center md:justify-end transition-all duration-1000 ease-out delay-200 ${
                loaded ? "translate-x-0 opacity-100" : "-translate-x-20 opacity-0"
              }`}
            >
              <div className="group w-80 h-80 md:w-[28rem] md:h-[28rem] lg:w-[32rem] lg:h-[32rem] transition-all duration-500 hover:scale-105">
                <img
                  src={tabletImage}
                  alt="City on Tablet"
                  className="w-full h-full object-contain drop-shadow-2xl transition-shadow duration-500 group-hover:drop-shadow-3xl"
                />
              </div>
            </div>

            {/* RIGHT – Points */}
            <div
              className={`space-y-8 transition-all duration-1000 ease-out delay-300 ${
                loaded ? "translate-x-0 opacity-100" : "translate-x-20 opacity-0"
              }`}
            >
              {/* 01 */}
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  01
                </div>
                <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-md border border-gray-100">
                  <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                    Establish ourselves as one of the leading technology-driven distribution company focusing on{" "}
                    <span className="font-semibold">Home Upgrades, Real Estate & Mortgages in the UAE</span>
                  </p>
                </div>
              </div>

              {/* 02 */}
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  02
                </div>
                <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-md border border-gray-100">
                  <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                    Build and maintain the largest network of{" "}
                    <span className="font-semibold">agents and freelancers in the market</span>.
                  </p>
                </div>
              </div>

              {/* 03 */}
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  03
                </div>
                <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-md border border-gray-100">
                  <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                    Harness Technology & AI to drive scalability and enable{" "}
                    <span className="font-semibold">seamless expansion</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== AI IN OUR DNA ==================== */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
          <div className="grid md:grid-cols-2 gap-12 items-start">

            {/* LEFT – Text */}
            <div
              className={`space-y-8 transition-all duration-1000 ease-out ${
                loaded ? "translate-x-0 opacity-100" : "-translate-x-20 opacity-0"
              }`}
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
                AI In Our DNA
              </h2>

              <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                At XOTO, artificial intelligence powers every touchpoint, making property discovery,
                design, financing, and management smarter, faster, and more personalized for every stakeholder.
                Through our
                integrated approach, we help property owners, developers, and partners align with global
                sustainability goals — enhancing not just aesthetics, but long-term property worth and
                ecological balance. Together, let’s design a future where living beautifully also means living
                responsibly.
              </p>
            </div>

            {/* RIGHT – 3D Room */}
            <div
              className={`flex justify-center md:justify-start transition-all duration-1000 ease-out delay-200 ${
                loaded ? "translate-x-0 opacity-100" : "translate-x-20 opacity-0"
              }`}
            >
              <div className="group w-80 h-80 md:w-[28rem] md:h-[28rem] lg:w-[32rem] lg:h-[32rem] transition-all duration-500 hover:scale-105">
                <img
                  src={aiRoomImage}
                  alt="AI Room"
                  className="w-full h-full object-contain drop-shadow-2xl transition-shadow duration-500 group-hover:drop-shadow-3xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SUSTAINABILITY ==================== */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
          {/* Centered Heading */}
          <div className="text-center mb-12 md:mb-16">
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Building a Greener Tomorrow,<br />
              <span className="text-gray-900 bg-clip-text bg-gradient-to-r from-green-500 to-teal-600">
                One Space at a Time
              </span>
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* LEFT – Eco House */}
            <div
              className={`flex justify-center md:justify-end transition-all duration-1000 ease-out ${
                loaded ? "translate-x-0 opacity-100" : "-translate-x-20 opacity-0"
              }`}
            >
             ,              <div className="group w-80 h-80 md:w-[28rem] md:h-[28rem] lg:w-[32rem] lg:h-[32rem] transition-all duration-500 hover:scale-105">
                <img
                  src={ecoHouseImage}
                  alt="Eco House"
                  className="w-full h-full object-contain drop-shadow-2xl transition-shadow duration-500 group-hover:drop-shadow-3xl"
                />
              </div>
            </div>

            {/* RIGHT – Long Text */}
            <div
              className={`space-y-6 transition-all duration-1000 ease-out delay-200 ${
                loaded ? "translate-x-0 opacity-100" : "translate-x-20 opacity-0"
              }`}
            >
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                At XOTO, we believe sustainability isn’t a choice — it’s the foundation of future living.
                In a world where conscious living defines progress, embracing sustainable practices means
                creating spaces that thrive in harmony with nature and innovation. From eco-friendly
                landscaping and energy-efficient interiors to responsible partnerships and mindful material
                sourcing, every XOTO solution is designed to minimize impact and maximize value. Through our
                integrated approach, we help property owners, developers, and partners align with global
                sustainability goals — enhancing not just aesthetics, but long-term property worth and
                ecological balance. Together, let’s design a future where living beautifully also means living
                responsibly.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}