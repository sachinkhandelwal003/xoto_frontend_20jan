// src/components/Loader/Loader.tsx
import React from "react";
import "./Loader.css";
import logoNew from "../assets/img/logoNew.png";   // adjust path if needed

const Loader = () => {
  return (
    <div className="loader-container">
      <div className="loader-wrapper">
        {/* rotating border */}
        <div className="rotating-border"></div>

        {/* LOGO (centered inside the spinner) */}
        <img
          src={logoNew}
          alt="Xoto logo"
          className="logo-spinner"
        />
      </div>

      <div className="loader-text">Loading...</div>
    </div>
  );
};

export default Loader;