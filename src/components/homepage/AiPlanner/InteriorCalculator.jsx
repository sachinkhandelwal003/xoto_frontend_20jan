import React from "react";
import { useNavigate } from "react-router-dom";

const InteriorComingSoon = () => {
  const navigate = useNavigate();

  // Ekdum mast interior design ki image ka direct link
  const interiorBgImage = "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2074&auto=format&fit=crop";

  return (
    <div className="min-h-screen w-full">
      {/* Banner */}
      <div
        className="relative flex items-center justify-center min-h-screen bg-cover bg-center"
        style={{ backgroundImage: `url(${interiorBgImage})` }}
      >
        {/* Overlay - Thoda dark kiya hai taaki text ekdum clear dikhe */}
        <div className="absolute inset-0 bg-black/60"></div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 heading-light">
          <h1 className="text-4xl md:text-6xl text-white mb-4">
            Design your dream space.
            <span className="block mt-2 font-bold heading-light text-white">
              Coming soon.
            </span>
          </h1>
          
          <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Our interior estimation tool is currently being crafted. We can't wait to help you transform your home!
          </p>

          <button
            onClick={() => navigate("/")}
            className="mt-4 inline-block rounded-full bg-white px-8 py-3 text-lg text-black transition hover:bg-gray-200 shadow-lg"
          >
            Take me back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default InteriorComingSoon;