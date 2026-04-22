import React from "react";
import "./Preloader.css"; // Import the spinner CSS

const Preloader = () => {
  return (
    <div className="preloader-overlay">
      <div className="spinner"></div>
    </div>
  );
};

export default Preloader;