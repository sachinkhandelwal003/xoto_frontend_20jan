import React from "react";
import { useNavigate } from "react-router-dom";
import image from "../../assets/img/trainning.jpg";

export default function ComingSoon() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full">
      {/* Banner */}
      <div
        className="relative flex items-center justify-center min-h-screen bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 heading-light">
          <h1 className="text-4xl md:text-6xl text-white mb-6">
            Building Skills.
            <span className="block mt-2 heading-light">Coming soon.</span>
          </h1>

          <p className="text-gray-200 text-lg md:text-xl mb-8 max-w-2xl mx-auto font-medium">
            We're preparing focused training content exclusively for Business
            Associates & Execution Partners.
          </p>

          <button
            onClick={() => navigate("/ecosystem")}
            className="mt-4 inline-block rounded-full bg-white px-8 py-3 text-lg text-black transition hover:bg-[#5c039b] hover:text-white "
          >
            Take me back to Partner Page
          </button>
        </div>
      </div>
    </div>
  );
}