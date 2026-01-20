import React from "react";
import heroImg from '../../assets/img/heroImg.jpg';

const HeroSection1 = () => {
  return (
    <section
      className="relative w-full h-[680px] bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${heroImg})` }}
    >
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Headline div */}
      <div
        className="absolute text-center text-white flex flex-col justify-center"
        style={{
          width: "890px",
          height: "152px",
          top: "102px",
          left: "275px",
        }}
      >
        <h1
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800, // ExtraBold
            fontSize: "50px",
            lineHeight: "76px",
            letterSpacing: "0px",
          }}
        >
          Transforming the Way You Rent,
          <br />
          Buy, & Sell Your Home.
        </h1>
      </div>

      {/* Button container */}
      <div
        className="absolute flex gap-[10px]"
        style={{
          top: "297px",
          left: "376px",
        }}
      >
        <button
          className="bg-[#6C2BD9] text-white font-semibold rounded-[8px]"
          style={{ width: "220px", height: "60px", padding: "8px 16px" }}
        >
          Rent a Home
        </button>
        <button
          className="bg-transparent border border-white text-white font-semibold rounded-[8px]"
          style={{ width: "220px", height: "60px", padding: "8px 16px" }}
        >
          Find a Home
        </button>
        <button
          className="bg-transparent border border-white text-white font-semibold rounded-[8px]"
          style={{ width: "220px", height: "60px", padding: "8px 16px" }}
        >
          Sell a Home
        </button>
      </div>
    </section>
  );
};

export default HeroSection1;