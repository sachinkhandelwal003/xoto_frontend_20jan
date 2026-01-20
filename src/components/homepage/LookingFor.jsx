import React from "react";
import lookingImg from "../../assets/img/lookingfor.jpg";

const LookingFor = () => {
  return (
    <section className="max-w-6xl mx-auto px-5 md:px-10 py-24 text-center relative">
      {/* Heading */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 leading-tight">
        What are you looking for
      </h1>
      <p className="text-lg md:text-xl text-gray-700 max-w-4xl mx-auto mb-12">
        Let Xobia guide you through your perfect property journey with personalized recommendations.
      </p>

      {/* Button Section */}
      <div className="flex flex-wrap justify-center items-center gap-6 mb-20">
        <button className="px-12 py-4 text-white font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-purple-800 shadow-lg hover:scale-105 transform transition-all duration-300">
          Rent Home
        </button>
        <button className="px-12 py-4 text-purple-700 font-semibold rounded-lg border-2 border-purple-600 bg-white shadow hover:bg-purple-50 hover:scale-105 transform transition-all duration-300">
          Buy Home
        </button>
        <button className="px-12 py-4 text-purple-700 font-semibold rounded-lg border-2 border-purple-600 bg-white shadow hover:bg-purple-50 hover:scale-105 transform transition-all duration-300">
          Sell Home
        </button>
      </div>

      {/* Content Row */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-16 relative z-10">
        {/* Left Text */}
        <div className="text-center lg:text-left max-w-lg mx-auto lg:mx-0">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Rent Home
          </h2>
          <p className="text-gray-700 text-lg md:text-base leading-relaxed">
            Curated rentals with flexible terms, verified listings, and smart match recommendations.
          </p>
        </div>

        {/* Right Image */}
        <div className="relative w-full lg:w-[472px] rounded-3xl overflow-hidden shadow-2xl mx-auto lg:mx-0">
          <img
            src={lookingImg}
            alt="Woman in city - Rent Home"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Wave Background */}
      <div
        className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-cyan-100 to-transparent -z-10"
        style={{ clipPath: "ellipse(150% 100% at 50% 100%)" }}
      />
    </section>
  );
};

export default LookingFor;