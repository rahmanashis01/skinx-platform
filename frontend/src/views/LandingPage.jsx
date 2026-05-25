import React from "react";
import { useNavigate } from "react-router-dom";
import WhiteSection from "../components/WhiteSection";
import Navbar from "../components/Navbar";
import BodyScanner from "../components/BodyScanner";
import step1Img from "../assets/step-1.png";
import step2Img from "../assets/step-2.png";
import step3Img from "../assets/step-3.png";
import step4Img from "../assets/step-4.png";
// ─────────────────────────────────────────────────────────────────────────────
// STEP ICON SVGs — Photorealistic 3D style
// ─────────────────────────────────────────────────────────────────────────────

/** Step 1 – Dark brown hand holding phone with skin scan */
const PhoneScanSVG = () => (
  <svg
    viewBox="0 0 100 100"
    width="48"
    height="48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <radialGradient id="handGrad" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#8b5a3c" />
        <stop offset="100%" stopColor="#5d3a29" />
      </radialGradient>
      <linearGradient id="phoneGrad" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor="#3a3f4a" />
        <stop offset="100%" stopColor="#1a1d24" />
      </linearGradient>
      <radialGradient id="screenGrad" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#f5d4b8" />
        <stop offset="60%" stopColor="#e8b89a" />
        <stop offset="100%" stopColor="#d89874" />
      </radialGradient>
    </defs>

    {/* Palm base */}
    <ellipse
      cx="35"
      cy="72"
      rx="22"
      ry="16"
      fill="url(#handGrad)"
      transform="rotate(-15 35 72)"
    />

    {/* Thumb */}
    <path
      d="M 25 60 Q 18 58 14 64 Q 12 68 16 72 Q 20 76 26 72"
      fill="#6d4530"
    />

    {/* Fingers behind phone */}
    <path d="M 48 24 Q 44 18 42 28 Q 41 42 44 58" fill="#7a4f38" />
    <path d="M 58 22 Q 55 16 53 26 Q 52 40 55 56" fill="#7a4f38" />
    <path
      d="M 68 26 Q 66 20 64 30 Q 63 42 66 54"
      fill="#6d4530"
      opacity="0.85"
    />

    {/* Phone body */}
    <rect x="38" y="16" width="32" height="58" rx="6" fill="url(#phoneGrad)" />
    <rect
      x="38"
      y="16"
      width="32"
      height="58"
      rx="6"
      stroke="rgba(0,0,0,0.3)"
      strokeWidth="0.8"
      fill="none"
    />

    {/* Notch */}
    <rect
      x="48"
      y="18"
      width="12"
      height="3.5"
      rx="1.8"
      fill="rgba(0,0,0,0.6)"
    />

    {/* Screen - skin texture with mole */}
    <rect x="41" y="24" width="26" height="42" rx="3" fill="url(#screenGrad)" />

    {/* Mole on screen */}
    <circle cx="54" cy="45" r="3.2" fill="#3d1f0f" opacity="0.85" />
    <circle cx="53.5" cy="44.5" r="1.2" fill="#5d3020" opacity="0.6" />

    {/* Scan target overlay */}
    <circle
      cx="54"
      cy="45"
      r="8"
      stroke="rgba(255,255,255,0.85)"
      strokeWidth="1.8"
      fill="none"
    />
    {/* Target corners */}
    <polyline
      points="44,38 44,34 48,34"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    <polyline
      points="64,38 64,34 60,34"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    <polyline
      points="44,52 44,56 48,56"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    <polyline
      points="64,52 64,56 60,56"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />

    {/* Shutter button */}
    <circle cx="54" cy="70" r="5" fill="rgba(255,255,255,0.9)" />
    <circle
      cx="54"
      cy="70"
      r="4"
      stroke="rgba(100,120,150,0.3)"
      strokeWidth="1"
      fill="rgba(240,242,245,0.95)"
    />
  </svg>
);

/** Step 2 – AI Cube with Robot Arms */
const AIRobotSVG = () => (
  <svg
    viewBox="0 0 100 100"
    width="48"
    height="48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="cubeGrad" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor="#5eb3ff" />
        <stop offset="100%" stopColor="#2563eb" />
      </linearGradient>
      <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgba(147,197,253,0.8)" />
        <stop offset="100%" stopColor="rgba(59,130,246,0)" />
      </radialGradient>
      <linearGradient id="armGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#64748b" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>
    </defs>

    {/* Glow aura */}
    <ellipse
      cx="50"
      cy="52"
      rx="38"
      ry="36"
      fill="url(#glowGrad)"
      opacity="0.5"
    />

    {/* Left robot arm */}
    <path
      d="M 12 45 L 12 38 L 18 38 L 18 32 L 24 32 L 24 40 L 30 40"
      stroke="url(#armGrad)"
      strokeWidth="4.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <circle cx="12" cy="45" r="3.5" fill="#475569" />
    <circle cx="24" cy="32" r="3" fill="#60a5fa" opacity="0.8" />
    <rect x="28" y="37" width="8" height="6" rx="3" fill="#64748b" />

    {/* Right robot arm */}
    <path
      d="M 88 45 L 88 38 L 82 38 L 82 32 L 76 32 L 76 40 L 70 40"
      stroke="url(#armGrad)"
      strokeWidth="4.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <circle cx="88" cy="45" r="3.5" fill="#475569" />
    <circle cx="76" cy="32" r="3" fill="#60a5fa" opacity="0.8" />
    <rect x="64" y="37" width="8" height="6" rx="3" fill="#64748b" />

    {/* AI Cube - 3D isometric */}
    <path
      d="M 50 28 L 68 38 L 68 58 L 50 68 L 32 58 L 32 38 Z"
      fill="url(#cubeGrad)"
      opacity="0.9"
    />
    {/* Top face */}
    <path d="M 50 28 L 68 38 L 50 48 L 32 38 Z" fill="rgba(147,197,253,0.4)" />
    {/* Left face */}
    <path d="M 32 38 L 32 58 L 50 68 L 50 48 Z" fill="rgba(30,64,175,0.3)" />

    {/* AI Text */}
    <text
      x="50"
      y="53"
      textAnchor="middle"
      fill="white"
      fontSize="18"
      fontWeight="bold"
      fontFamily="Arial, sans-serif"
    >
      AI
    </text>

    {/* Circuit sparkles */}
    {[
      [42, 32, 1.2],
      [58, 36, 1],
      [46, 62, 1.3],
      [54, 58, 0.9],
      [38, 48, 1.1],
      [62, 52, 1],
    ].map(([x, y, r], i) => (
      <circle key={i} cx={x} cy={y} r={r} fill="rgba(147,197,253,0.9)" />
    ))}

    {/* Glowing particles */}
    <circle cx="35" cy="42" r="0.8" fill="#93c5fd" opacity="0.7" />
    <circle cx="65" cy="45" r="0.8" fill="#93c5fd" opacity="0.7" />
    <circle cx="50" cy="35" r="0.8" fill="#93c5fd" opacity="0.7" />
  </svg>
);

/** Step 3 – Pink Clipboard with Pencil */
const ClipboardSVG = () => (
  <svg
    viewBox="0 0 100 100"
    width="48"
    height="48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="clipGrad" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor="#e9b8d3" />
        <stop offset="100%" stopColor="#c084b8" />
      </linearGradient>
      <linearGradient id="paperGrad" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#f8f9fa" />
      </linearGradient>
      <linearGradient id="pencilGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffd166" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>

    {/* Shadow */}
    <ellipse cx="50" cy="85" rx="32" ry="8" fill="rgba(0,0,0,0.15)" />

    {/* Clipboard base */}
    <rect x="22" y="18" width="46" height="62" rx="6" fill="url(#clipGrad)" />
    <rect
      x="22"
      y="18"
      width="46"
      height="62"
      rx="6"
      stroke="rgba(0,0,0,0.1)"
      strokeWidth="0.8"
      fill="none"
    />

    {/* Clipboard depth/3D edge */}
    <rect
      x="24"
      y="20"
      width="44"
      height="58"
      rx="5"
      fill="rgba(255,255,255,0.15)"
    />

    {/* Top clip metal */}
    <rect x="40" y="12" width="20" height="12" rx="4" fill="#e0a830" />
    <rect
      x="40"
      y="12"
      width="20"
      height="12"
      rx="4"
      stroke="rgba(0,0,0,0.2)"
      strokeWidth="0.6"
      fill="none"
    />
    <ellipse cx="50" cy="15" rx="4" ry="3" fill="rgba(0,0,0,0.15)" />

    {/* Paper */}
    <rect x="28" y="26" width="36" height="48" rx="3" fill="url(#paperGrad)" />

    {/* Checkboxes with checks */}
    <rect
      x="32"
      y="34"
      width="7"
      height="7"
      rx="1.5"
      fill="#a7f3d0"
      stroke="#10b981"
      strokeWidth="0.8"
    />
    <polyline
      points="33.5,37.5 35,39 38,35.5"
      stroke="#059669"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />

    <rect
      x="32"
      y="45"
      width="7"
      height="7"
      rx="1.5"
      fill="#a7f3d0"
      stroke="#10b981"
      strokeWidth="0.8"
    />
    <polyline
      points="33.5,48.5 35,50 38,46.5"
      stroke="#059669"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />

    <rect
      x="32"
      y="56"
      width="7"
      height="7"
      rx="1.5"
      fill="#a7f3d0"
      stroke="#10b981"
      strokeWidth="0.8"
    />
    <polyline
      points="33.5,59.5 35,61 38,57.5"
      stroke="#059669"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />

    {/* Lines next to checkboxes */}
    {[38, 49, 60].map((y, i) => (
      <line
        key={i}
        x1="42"
        y1={y}
        x2="58"
        y2={y}
        stroke="#cbd5e1"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    ))}

    {/* Pencil */}
    <g transform="rotate(-25 70 62)">
      {/* Pencil body */}
      <rect
        x="58"
        y="50"
        width="8"
        height="28"
        rx="2"
        fill="url(#pencilGrad)"
      />
      <rect
        x="58"
        y="50"
        width="8"
        height="28"
        rx="2"
        stroke="rgba(0,0,0,0.1)"
        strokeWidth="0.5"
        fill="none"
      />

      {/* Wood grain stripe */}
      <rect
        x="60"
        y="52"
        width="4"
        height="24"
        rx="1"
        fill="rgba(0,0,0,0.08)"
      />

      {/* Eraser */}
      <rect x="58" y="46" width="8" height="5" rx="1.5" fill="#ff9eae" />

      {/* Metal band */}
      <rect x="58" y="50" width="8" height="1.5" fill="#94a3b8" />

      {/* Pencil tip */}
      <polygon points="62,78 59,82 65,82" fill="#e8914a" />
      <polygon points="62,82 60.5,84 63.5,84" fill="#1a1d24" />
    </g>
  </svg>
);

/** Step 4 – Cute White Robot with Purple Eyes */
const ConsultantBotSVG = () => (
  <svg
    viewBox="0 0 100 100"
    width="48"
    height="48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <radialGradient id="bodyGrad" cx="50%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#e8ecf0" />
      </radialGradient>
      <radialGradient id="headGrad" cx="45%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#dde3ea" />
      </radialGradient>
      <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#c084fc" />
        <stop offset="50%" stopColor="#a855f7" />
        <stop offset="100%" stopColor="#7c3aed" />
      </radialGradient>
      <radialGradient id="visorGrad" cx="50%" cy="30%" r="60%">
        <stop offset="0%" stopColor="#4a4a5a" />
        <stop offset="100%" stopColor="#1e1e2e" />
      </radialGradient>
    </defs>

    {/* Soft shadow */}
    <ellipse cx="50" cy="88" rx="28" ry="6" fill="rgba(0,0,0,0.12)" />

    {/* Body - bottom rounded */}
    <ellipse cx="50" cy="72" rx="20" ry="16" fill="url(#bodyGrad)" />
    <ellipse
      cx="50"
      cy="68"
      rx="18"
      ry="8"
      fill="rgba(255,255,255,0.6)"
      opacity="0.4"
    />

    {/* Body lights/buttons */}
    <circle cx="42" cy="74" r="2.5" fill="url(#eyeGlow)" opacity="0.6" />
    <circle cx="50" cy="76" r="2.5" fill="url(#eyeGlow)" opacity="0.7" />
    <circle cx="58" cy="74" r="2.5" fill="url(#eyeGlow)" opacity="0.6" />

    {/* Neck connector */}
    <rect x="44" y="56" width="12" height="8" rx="4" fill="#e0e7ee" />
    <rect
      x="45"
      y="57"
      width="10"
      height="3"
      rx="1.5"
      fill="rgba(255,255,255,0.4)"
    />

    {/* Head dome */}
    <ellipse cx="50" cy="34" rx="22" ry="26" fill="url(#headGrad)" />
    <ellipse
      cx="45"
      cy="20"
      rx="12"
      ry="8"
      fill="rgba(255,255,255,0.5)"
      opacity="0.6"
      transform="rotate(-15 45 20)"
    />

    {/* Visor/face plate */}
    <ellipse cx="50" cy="36" rx="18" ry="16" fill="url(#visorGrad)" />

    {/* Eyes - glowing purple */}
    <circle cx="42" cy="34" r="5.5" fill="url(#eyeGlow)" opacity="0.95" />
    <circle cx="58" cy="34" r="5.5" fill="url(#eyeGlow)" opacity="0.95" />

    {/* Eye highlights */}
    <circle cx="43" cy="32" r="2" fill="rgba(255,255,255,0.9)" />
    <circle cx="59" cy="32" r="2" fill="rgba(255,255,255,0.9)" />

    {/* Eye glow effect */}
    <circle cx="42" cy="34" r="7" fill="url(#eyeGlow)" opacity="0.2" />
    <circle cx="58" cy="34" r="7" fill="url(#eyeGlow)" opacity="0.2" />

    {/* Smile */}
    <path
      d="M 40 44 Q 50 50 60 44"
      stroke="#c084fc"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
      opacity="0.7"
    />

    {/* Antenna */}
    <line
      x1="50"
      y1="8"
      x2="50"
      y2="3"
      stroke="#e0e7ee"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <circle cx="50" cy="2" r="2.5" fill="#a855f7" />
    <circle cx="50" cy="2" r="1.2" fill="rgba(255,255,255,0.8)" />

    {/* Ear panels */}
    <rect
      x="22"
      y="28"
      width="5"
      height="12"
      rx="2.5"
      fill="#e0e7ee"
      opacity="0.7"
    />
    <rect
      x="73"
      y="28"
      width="5"
      height="12"
      rx="2.5"
      fill="#e0e7ee"
      opacity="0.7"
    />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// STEP DATA
// ─────────────────────────────────────────────────────────────────────────────
const STEPS = [
  {
    id: 1,
    label: "STEP 1",
    title: "Take a photo of a skin concern",
    imgSrc: step1Img,
    imgScale: 1.0,
    gradFrom: "#5ab8ff",
    gradTo: "#2060e0",
    glow: "rgba(90,184,255,0.50)",
  },
  {
    id: 2,
    label: "STEP 2",
    title: "AI instantly analyzes your photo",
    imgSrc: step2Img,
    imgScale: 2.0,
    gradFrom: "#1a3a8e",
    gradTo: "#0d1e60",
    glow: "rgba(59,107,219,0.48)",
  },
  {
    id: 3,
    label: "STEP 3",
    title: "Export your report",
    imgSrc: step3Img,
    imgScale: 1.85,
    gradFrom: "#10d4a0",
    gradTo: "#0a9e7c",
    glow: "rgba(16,212,160,0.45)",
  },
  {
    id: 4,
    label: "STEP 4",
    title: "The AI Consultant explains your result",
    imgSrc: step4Img,
    imgScale: 1.95,
    gradFrom: "#c058f8",
    gradTo: "#7020e8",
    glow: "rgba(192,88,248,0.48)",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// STEP CARD
// ─────────────────────────────────────────────────────────────────────────────
const StepCard = ({ step }) => {
  const { label, title, imgSrc, imgScale, gradFrom, gradTo, glow } = step;
  return (
    <div className="flex items-start gap-4">
      {/* Gradient sphere + image icon */}
      <div
        className="w-[78px] h-[78px] rounded-full flex items-center justify-center flex-shrink-0 relative overflow-hidden"
        style={{
          background: `radial-gradient(circle at 38% 32%, ${gradFrom}, ${gradTo})`,
          boxShadow: `0 8px 28px ${glow}`,
        }}
      >
        {/* inner sphere sheen */}
        <div
          className="absolute top-[6%] left-[15%] w-[55%] h-[40%] rounded-full pointer-events-none"
          style={{ background: "rgba(255,255,255,0.22)", filter: "blur(4px)" }}
        />
        <img
          src={imgSrc}
          alt={label}
          className="w-full h-full object-cover relative z-10"
          style={{
            transform: `scale(${imgScale})`,
            transformOrigin: "center center",
          }}
        />
      </div>

      {/* Badge + text */}
      <div className="flex flex-col justify-center pt-1 gap-1.5">
        <span
          className="inline-block text-[11px] font-semibold tracking-[0.16em] border rounded-full px-3 py-[3px] w-fit"
          style={{
            color: "rgba(255,255,255,0.84)",
            borderColor: "rgba(255,255,255,0.30)",
            background: "rgba(255,255,255,0.08)",
          }}
        >
          {label}
        </span>
        <p className="text-[15px] font-medium leading-snug text-white">
          {title}
        </p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE STEP CARD WITH CONNECTOR
// ─────────────────────────────────────────────────────────────────────────────
const MobileStepCard = ({ step, showConnector }) => {
  const { label, title, imgSrc, imgScale, gradFrom, gradTo, glow } = step;
  return (
    <div className="relative">
      <div className="flex items-start gap-4">
        {/* Gradient sphere + image icon */}
        <div
          className="w-[78px] h-[78px] rounded-full flex items-center justify-center flex-shrink-0 relative overflow-hidden z-10"
          style={{
            background: `radial-gradient(circle at 38% 32%, ${gradFrom}, ${gradTo})`,
            boxShadow: `0 8px 28px ${glow}`,
          }}
        >
          {/* inner sphere sheen */}
          <div
            className="absolute top-[6%] left-[15%] w-[55%] h-[40%] rounded-full pointer-events-none"
            style={{
              background: "rgba(255,255,255,0.22)",
              filter: "blur(4px)",
            }}
          />
          <img
            src={imgSrc}
            alt={label}
            className="w-full h-full object-cover relative z-10"
            style={{
              transform: `scale(${imgScale})`,
              transformOrigin: "center center",
            }}
          />
        </div>

        {/* Badge + text */}
        <div className="flex flex-col justify-center pt-1 gap-1.5">
          <span
            className="inline-block text-[11px] font-semibold tracking-[0.16em] border rounded-full px-3 py-[3px] w-fit"
            style={{
              color: "rgba(255,255,255,0.84)",
              borderColor: "rgba(255,255,255,0.30)",
              background: "rgba(255,255,255,0.08)",
            }}
          >
            {label}
          </span>
          <p className="text-[15px] font-medium leading-snug text-white">
            {title}
          </p>
        </div>
      </div>

      {/* Curved connector line */}
      {showConnector && (
        <div className="absolute left-[-11px] top-[78px] w-[100px] h-[80px] z-0 pointer-events-none">
          <svg
            width="100"
            height="80"
            viewBox="0 0 100 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              filter:
                "drop-shadow(0 0 8px rgba(79,172,254,0.90)) drop-shadow(0 0 4px rgba(0,242,254,0.65))",
            }}
          >
            <defs>
              <linearGradient
                id={`conn-${step.id}`}
                x1="50"
                y1="0"
                x2="50"
                y2="80"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#4FACFE" />
                <stop offset="100%" stopColor="#00F2FE" />
              </linearGradient>
            </defs>
            <path
              d="M 50 0 C 5 22, 95 58, 50 80"
              stroke={`url(#conn-${step.id})`}
              strokeWidth="5.5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// LANDING PAGE
// ─────────────────────────────────────────────────────────────────────────────
const LandingPage = ({ onStartCheckup }) => {
  const navigate = useNavigate();
  return (
    <div className="relative overflow-x-hidden">
      {/* ══ HERO SECTION ═══════════════════════════════════════════════════ */}
      <div className="relative min-h-screen overflow-hidden">
        {/* ── Background gradient ── */}
        <div
          className="absolute inset-0 transition-all duration-500"
          style={{
            background:
              "radial-gradient(ellipse at 28% 58%, #1d4ac4 0%, #183a9e 28%, #0e1b5a 62%, #09133f 100%)",
          }}
        />

        {/* ── Decorative blobs ── */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <radialGradient id="lb1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#4b7bef" stopOpacity="0.17" />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="lb2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#1e40af" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="lb3" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#6d88ef" stopOpacity="0.09" />
              <stop offset="100%" stopColor="#3b5bdb" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="22%" cy="62%" rx="42%" ry="52%" fill="url(#lb1)" />
          <ellipse cx="68%" cy="22%" rx="34%" ry="42%" fill="url(#lb2)" />
          <ellipse cx="48%" cy="48%" rx="55%" ry="50%" fill="url(#lb3)" />
        </svg>

        {/* ── Right-side body image — absolute, sits behind content, full hero height ── */}
        <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[45%] z-[3]">
          <BodyScanner isDark={true} />
        </div>

        {/* ── Navbar ── */}
        <Navbar />

        {/* ── Hero content ── */}
        <main className="relative z-10 min-h-screen flex items-center pt-[88px] pb-24">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 w-full">
            <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-4 xl:gap-8">
              {/* LEFT: content */}
              <div className="flex-1 lg:max-w-[52%] w-full">
                {/* Headline */}
                <h1
                  className="font-[800] text-[clamp(36px,4.5vw,58px)]
                    leading-[1.06] tracking-tight mb-10 text-white"
                >
                  Check your skin!
                </h1>

                {/* Steps - Mobile: vertical with connectors, Desktop: 2×2 grid */}
                {/* Mobile view */}
                <div className="sm:hidden space-y-10 mb-12">
                  {STEPS.map((step, index) => (
                    <MobileStepCard
                      key={step.id}
                      step={step}
                      showConnector={index < STEPS.length - 1}
                    />
                  ))}
                </div>

                {/* Desktop view */}
                <div className="hidden sm:grid grid-cols-2 gap-x-10 gap-y-8 mb-12">
                  {STEPS.map((step) => (
                    <StepCard key={step.id} step={step} />
                  ))}
                </div>

                {/* CTA */}
                <div className="mb-8">
                  <button
                    onClick={() => navigate("/scan")}
                    className="
                      bg-[#e53e3e] hover:bg-[#c53030]
                      text-white font-extrabold
                      py-3.5 px-12
                      rounded-full
                      text-[13px] tracking-[0.20em] uppercase
                      transition-all duration-200
                      shadow-[0_6px_28px_rgba(229,62,62,0.52)]
                      hover:shadow-[0_10px_36px_rgba(229,62,62,0.62)]
                      hover:scale-[1.025] active:scale-[0.975]
                      focus:outline-none
                    "
                  >
                    GET INSTANT RESULT
                  </button>
                </div>

                {/* Disclaimer */}
                <p className="text-[12.5px] leading-relaxed max-w-[490px] text-blue-200/55">
                  * The scan result is not a diagnosis. To obtain an accurate
                  diagnosis and a treatment recommendation, consult your doctor.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* ── Curved divider — deep asymmetric wave, right edge rises high ── */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none z-20 overflow-hidden"
          style={{ height: "120px" }}
        >
          <svg
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/*
              Left anchor  : y=120 (sits flush at very bottom-left)
              Mid control  : big upward bulge in the centre-right
              Right
 anchor : y=0  (right edge reaches the very top of this band)
              This gives the circular-right-edge silhouette from the reference.
            */}
            <path
              d="M 0 120 L 0 98 C 180 108 420 102 680 72 C 940 42 1160 10 1440 0 L 1440 120 Z"
              fill="white"
            />
          </svg>
        </div>
      </div>

      {/* ══ WHITE SECTION BELOW HERO ════════════════════════════════════════ */}
      <div className="relative z-10">
        <WhiteSection onStartCheckup={onStartCheckup} />
      </div>
    </div>
  );
};

export default LandingPage;
