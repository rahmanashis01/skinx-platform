import React from "react";

const FolderIcon3D = ({ className = "", width = 140, height = 120 }) => {
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
        {/* Folder gradients */}
        <linearGradient id="folderMain" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8b7ce8" />
          <stop offset="50%" stopColor="#7c6fd8" />
          <stop offset="100%" stopColor="#6b5fc5" />
        </linearGradient>

        <linearGradient id="folderDark" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6b5fc5" />
          <stop offset="100%" stopColor="#5a4eb3" />
        </linearGradient>

        <linearGradient id="folderTab" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>

        <linearGradient id="paper1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f9fafb" />
        </linearGradient>

        <linearGradient id="paper2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f3f4f6" />
          <stop offset="100%" stopColor="#e5e7eb" />
        </linearGradient>

        {/* Filters */}
        <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
          <feOffset dx="0" dy="4" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.2" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="paperShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
          <feOffset dx="0" dy="2" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.15" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="70" cy="110" rx="50" ry="8" fill="rgba(0,0,0,0.1)" />

      {/* Papers fanning out from folder */}
      <g filter="url(#paperShadow)">
        {/* Back paper - most tilted */}
        <rect
          x="55"
          y="10"
          width="45"
          height="60"
          rx="3"
          fill="url(#paper2)"
          transform="rotate(-12 77.5 40)"
        />

        {/* Middle paper */}
        <rect
          x="58"
          y="12"
          width="45"
          height="60"
          rx="3"
          fill="#e8ecf5"
          transform="rotate(-6 80.5 42)"
        />

        {/* Front paper with text lines */}
        <g>
          <rect
            x="60"
            y="15"
            width="45"
            height="60"
            rx="3"
            fill="url(#paper1)"
            transform="rotate(2 82.5 45)"
          />

          {/* Text lines on front paper */}
          <g transform="rotate(2 82.5 45)">
            <line
              x1="67"
              y1="28"
              x2="96"
              y2="28"
              stroke="#a5b4fc"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="67"
              y1="34"
              x2="96"
              y2="34"
              stroke="#a5b4fc"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="67"
              y1="40"
              x2="96"
              y2="40"
              stroke="#a5b4fc"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="67"
              y1="46"
              x2="96"
              y2="46"
              stroke="#a5b4fc"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="67"
              y1="52"
              x2="96"
              y2="52"
              stroke="#a5b4fc"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="67"
              y1="58"
              x2="92"
              y2="58"
              stroke="#a5b4fc"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        </g>
      </g>

      {/* Folder body */}
      <g filter="url(#softShadow)">
        {/* Folder back */}
        <path
          d="M 25 55 L 25 100 C 25 103 27 105 30 105 L 110 105 C 113 105 115 103 115 100 L 115 55 Z"
          fill="url(#folderMain)"
        />

        {/* Folder side panel (3D depth) */}
        <path
          d="M 115 55 L 122 60 L 122 103 C 122 106 120 108 117 108 L 115 108 L 115 100 Z"
          fill="url(#folderDark)"
        />

        {/* Folder front edge */}
        <path
          d="M 23 60 L 23 102 C 23 105 25 107 28 107 L 112 107 C 115 107 117 105 117 102 L 117 60 Z"
          fill="url(#folderMain)"
          opacity="0.95"
        />

        {/* Tab on folder */}
        <g>
          <path
            d="M 30 48 L 52 48 L 55 52 L 58 55 L 25 55 L 28 52 Z"
            fill="url(#folderTab)"
          />
          {/* Tab highlight */}
          <path
            d="M 31 49 L 51 49 L 53 52 L 27 52 Z"
            fill="rgba(255,255,255,0.35)"
          />
          {/* Tab shadow */}
          <path d="M 25 55 L 58 55 L 58 57 L 25 57 Z" fill="rgba(0,0,0,0.15)" />
        </g>

        {/* Folder top edge highlight */}
        <path
          d="M 25 55 L 115 55 L 115 58 L 25 58 Z"
          fill="rgba(255,255,255,0.15)"
        />

        {/* Inner shadow at top */}
        <path
          d="M 27 58 L 113 58 L 113 63 C 113 63 70 61 27 63 Z"
          fill="rgba(0,0,0,0.08)"
        />

        {/* Specular highlight on folder surface */}
        <ellipse
          cx="40"
          cy="75"
          rx="12"
          ry="18"
          fill="rgba(255,255,255,0.08)"
          transform="rotate(-25 40 75)"
        />

        {/* Bottom highlight */}
        <path
          d="M 28 100 L 112 100 C 115 100 117 98 117 95 L 117 102 C 117 105 115 107 112 107 L 28 107 C 25 107 23 105 23 102 L 23 95 C 23 98 25 100 28 100 Z"
          fill="rgba(0,0,0,0.1)"
        />
      </g>
    </svg>
  );
};

export default FolderIcon3D;
