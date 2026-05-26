import React from "react";

const SkinXLogo = ({ compact = false, isDark = true }) => {
  const iconSize = compact ? 36 : 46;

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Icon Box */}
      <div
        style={{ width: iconSize, height: iconSize }}
        className="bg-white rounded-xl flex items-center justify-center shrink-0 shadow-lg"
      >
        <svg
          width={iconSize * 0.68}
          height={iconSize * 0.68}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer scan ring */}
          <circle
            cx="16"
            cy="16"
            r="11.5"
            stroke="#1e3a8a"
            strokeWidth="2.2"
            fill="none"
          />
          {/* Inner filled dot */}
          <circle cx="16" cy="16" r="4.5" fill="#1e3a8a" />
          {/* Tick marks / crosshair lines */}
          <line
            x1="16"
            y1="1.5"
            x2="16"
            y2="7"
            stroke="#1e3a8a"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="16"
            y1="25"
            x2="16"
            y2="30.5"
            stroke="#1e3a8a"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="1.5"
            y1="16"
            x2="7"
            y2="16"
            stroke="#1e3a8a"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="25"
            y1="16"
            x2="30.5"
            y2="16"
            stroke="#1e3a8a"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* White plus / crosshair in center */}
          <line
            x1="16"
            y1="13.2"
            x2="16"
            y2="18.8"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <line
            x1="13.2"
            y1="16"
            x2="18.8"
            y2="16"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Text */}
      <div className="flex flex-col leading-none">
        <span
          className={`font-extrabold tracking-wide transition-all duration-300 ${
            compact ? "text-[17px]" : "text-[20px]"
          } ${isDark ? "text-white" : "text-[#0e1b5a]"}`}
        >
          SkinX
        </span>
        {!compact && (
          <span
            className={`text-[11px] mt-0.5 font-medium tracking-wide transition-opacity duration-300 ${
              isDark ? "text-blue-200/80" : "text-blue-700/70"
            }`}
          >
            Skin Cancer Detection
          </span>
        )}
      </div>
    </div>
  );
};

export default SkinXLogo;
