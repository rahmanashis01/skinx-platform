import React from "react";

const HandPhoneStar3D = ({ className = "", width = 140, height = 120 }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 140 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Star gradient - bright glossy yellow */}
        <radialGradient id="starShine" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#fffde7" />
          <stop offset="20%" stopColor="#fff59d" />
          <stop offset="50%" stopColor="#ffeb3b" />
          <stop offset="80%" stopColor="#fdd835" />
          <stop offset="100%" stopColor="#f9a825" />
        </radialGradient>

        {/* Skin gradient - peachy pink */}
        <linearGradient id="skinMain" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffccbc" />
          <stop offset="50%" stopColor="#ffab91" />
          <stop offset="100%" stopColor="#ff8a65" />
        </linearGradient>

        {/* Darker skin for shadows */}
        <linearGradient id="skinDark" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ff8a65" />
          <stop offset="100%" stopColor="#e57373" />
        </linearGradient>

        {/* Phone gradient - dark gray/black */}
        <linearGradient id="phoneDark" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#37474f" />
          <stop offset="100%" stopColor="#263238" />
        </linearGradient>

        {/* Sleeve - light blue */}
        <linearGradient id="sleeveBlue" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#bbdefb" />
          <stop offset="50%" stopColor="#90caf9" />
          <stop offset="100%" stopColor="#64b5f6" />
        </linearGradient>

        {/* Shadow filter */}
        <filter id="mainShadow">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
          <feOffset dx="0" dy="5" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Star glow */}
        <filter id="starGlowEffect">
          <feGaussianBlur stdDeviation="5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="85" cy="115" rx="45" ry="7" fill="rgba(0,0,0,0.15)" />

      {/* Wrist and forearm - coming from bottom right */}
      <g filter="url(#mainShadow)">
        {/* Large forearm base */}
        <ellipse
          cx="105"
          cy="95"
          rx="30"
          ry="20"
          fill="url(#skinMain)"
          transform="rotate(-35 105 95)"
        />

        {/* Wrist area */}
        <ellipse
          cx="92"
          cy="85"
          rx="22"
          ry="18"
          fill="url(#skinMain)"
          transform="rotate(-30 92 85)"
        />

        {/* Wrist crease shadow */}
        <ellipse
          cx="95"
          cy="88"
          rx="20"
          ry="14"
          fill="url(#skinDark)"
          opacity="0.25"
          transform="rotate(-30 95 88)"
        />
      </g>

      {/* Prominent blue sleeve - very visible */}
      <g filter="url(#mainShadow)">
        {/* Main sleeve body */}
        <path
          d="M 110 100 Q 120 95 130 100 L 135 115 Q 125 118 110 115 Z"
          fill="url(#sleeveBlue)"
        />

        {/* Sleeve opening/cuff */}
        <ellipse
          cx="115"
          cy="105"
          rx="24"
          ry="16"
          fill="url(#sleeveBlue)"
          transform="rotate(-35 115 105)"
        />

        {/* Sleeve highlight */}
        <ellipse
          cx="115"
          cy="102"
          rx="20"
          ry="12"
          fill="rgba(255,255,255,0.2)"
          transform="rotate(-35 115 102)"
        />
      </g>

      {/* Palm - large and prominent */}
      <g filter="url(#mainShadow)">
        <ellipse
          cx="60"
          cy="70"
          rx="32"
          ry="26"
          fill="url(#skinMain)"
          transform="rotate(-15 60 70)"
        />

        {/* Palm shadow for depth */}
        <ellipse
          cx="65"
          cy="75"
          rx="26"
          ry="20"
          fill="url(#skinDark)"
          opacity="0.2"
          transform="rotate(-15 65 75)"
        />
      </g>

      {/* Thumb - visible on left */}
      <path
        d="M 32 60 Q 26 62 24 69 Q 22 76 25 82 Q 28 86 33 84 Q 38 81 40 75 Q 42 68 40 62 Q 38 58 32 60 Z"
        fill="url(#skinMain)"
        filter="url(#mainShadow)"
      />

      {/* Thumb nail highlight */}
      <ellipse
        cx="34"
        cy="62"
        rx="3"
        ry="2.5"
        fill="rgba(255,255,255,0.3)"
        transform="rotate(-10 34 62)"
      />

      {/* Index finger - curved over phone */}
      <path
        d="M 40 42 Q 36 40 34 45 L 30 62 Q 29 67 32 69 Q 36 70 40 67 L 46 48 Q 47 43 40 42 Z"
        fill="url(#skinMain)"
        filter="url(#mainShadow)"
      />
      <ellipse cx="42" cy="43" rx="3" ry="2.5" fill="rgba(255,255,255,0.3)" />

      {/* Middle finger */}
      <path
        d="M 52 36 Q 48 34 46 39 L 42 58 Q 41 63 44 65 Q 48 66 52 63 L 58 43 Q 59 38 52 36 Z"
        fill="url(#skinMain)"
        filter="url(#mainShadow)"
      />
      <ellipse cx="54" cy="37" rx="3" ry="2.5" fill="rgba(255,255,255,0.3)" />

      {/* Ring finger */}
      <path
        d="M 64 38 Q 60 37 58 42 L 54 60 Q 53 65 56 67 Q 60 68 64 65 L 70 45 Q 71 40 64 38 Z"
        fill="url(#skinMain)"
        filter="url(#mainShadow)"
      />
      <ellipse cx="66" cy="39" rx="3" ry="2.5" fill="rgba(255,255,255,0.3)" />

      {/* Pinky finger */}
      <path
        d="M 74 43 Q 71 42 69 46 L 66 62 Q 65 66 68 68 Q 71 69 74 66 L 79 51 Q 80 47 74 43 Z"
        fill="url(#skinMain)"
        filter="url(#mainShadow)"
      />
      <ellipse cx="76" cy="44" rx="2.5" ry="2" fill="rgba(255,255,255,0.3)" />

      {/* Palm creases */}
      <path
        d="M 38 66 Q 48 68 58 64"
        stroke="rgba(0,0,0,0.1)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 35 75 Q 45 77 55 73"
        stroke="rgba(0,0,0,0.08)"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />

      {/* Phone - dark and prominent */}
      <g filter="url(#mainShadow)">
        {/* Phone body */}
        <rect
          x="36"
          y="50"
          width="32"
          height="56"
          rx="5"
          fill="url(#phoneDark)"
          transform="rotate(-12 52 78)"
        />

        {/* Phone screen - dark */}
        <rect
          x="38"
          y="53"
          width="28"
          height="50"
          rx="3"
          fill="#1a1a1a"
          transform="rotate(-12 52 78)"
        />

        {/* Screen subtle reflection */}
        <rect
          x="39"
          y="54"
          width="26"
          height="18"
          rx="2"
          fill="rgba(255,255,255,0.06)"
          transform="rotate(-12 52 63)"
        />

        {/* Camera notch */}
        <circle
          cx="52"
          cy="58"
          r="2.5"
          fill="#0d0d0d"
          transform="rotate(-12 52 58)"
        />

        {/* Side button */}
        <rect
          x="66"
          y="72"
          width="2"
          height="9"
          rx="0.8"
          fill="#4a4a4a"
          transform="rotate(-12 67 76.5)"
        />
      </g>

      {/* Star with glow and sparkles */}
      <g filter="url(#starGlowEffect)">
        {/* Sparkle dots */}
        <circle cx="22" cy="18" r="1.8" fill="#fff9c4" opacity="0.9" />
        <circle cx="16" cy="26" r="1.2" fill="#fff59d" opacity="0.7" />
        <circle cx="32" cy="14" r="1.5" fill="#fff9c4" opacity="0.8" />
        <circle cx="36" cy="24" r="1" fill="#fff59d" opacity="0.6" />
        <circle cx="20" cy="32" r="1.3" fill="#fff9c4" opacity="0.7" />

        {/* Star shadow for depth */}
        <path
          d="M 26 6 L 30 19 L 44 19.5 L 34 28 L 37 42 L 26 34 L 15 42 L 18 28 L 8 19.5 L 22 19 Z"
          fill="rgba(0,0,0,0.2)"
          transform="translate(2, 3)"
        />

        {/* Main star body */}
        <path
          d="M 26 6 L 30 19 L 44 19.5 L 34 28 L 37 42 L 26 34 L 15 42 L 18 28 L 8 19.5 L 22 19 Z"
          fill="url(#starShine)"
        />

        {/* Top point highlight */}
        <path
          d="M 26 6 L 28 15 L 26 19 L 24 15 Z"
          fill="rgba(255,255,255,0.85)"
        />

        {/* Side point highlight */}
        <path
          d="M 30 19 L 34 28 L 30 26 L 27 22 Z"
          fill="rgba(255,255,255,0.4)"
        />

        {/* Center glossy shine */}
        <ellipse cx="26" cy="23" rx="6" ry="7" fill="rgba(255,255,255,0.5)" />

        {/* Smaller bright center */}
        <ellipse cx="24" cy="20" rx="4" ry="5" fill="rgba(255,255,255,0.7)" />

        {/* Sharp specular highlight */}
        <ellipse cx="23" cy="17" rx="2.5" ry="3" fill="rgba(255,255,255,0.9)" />
      </g>
    </svg>
  );
};

export default HandPhoneStar3D;
