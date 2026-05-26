import React from "react";
import backBodyImage from "../assets/back-body.png";

const BodyScanner = ({ isDark = true }) => {
  const fadeColor = isDark ? "#0e1b5a" : "#d4e3ff";

  return (
    <div className="relative w-full h-full">
      {/* Full-height portrait image */}
      <img
        src={backBodyImage}
        alt="Body Scanner"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: "left center" }}
      />

      {/* Left-side fade — blends smoothly into the hero background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(
            to right,
            ${fadeColor} 0%,
            ${fadeColor}f2 8%,
            ${fadeColor}dd 18%,
            ${fadeColor}bb 28%,
            ${fadeColor}88 38%,
            ${fadeColor}55 48%,
            ${fadeColor}22 57%,
            transparent 68%
          )`,
        }}
      />

      {/* Top fade — blends into navbar area */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(
            to bottom,
            ${fadeColor} 0%,
            ${fadeColor}99 4%,
            transparent 14%
          )`,
        }}
      />

      {/* Bottom fade — aligns with white curved divider */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(
            to top,
            ${fadeColor} 0%,
            ${fadeColor}aa 4%,
            transparent 18%
          )`,
        }}
      />
    </div>
  );
};

export default BodyScanner;
