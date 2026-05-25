import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  CameraOff,
  Droplet,
  Sun,
  Scissors,
  AlertTriangle,
  Camera,
  Upload,
  X,
  Globe,
  Plus,
  Info,
  CheckCircle2,
  FolderOpen,
  ImagePlus,
  Monitor,
} from "lucide-react";
import step1Img from "../assets/step1-take-photo.png";

/* ═══════════════════════════════════════════════════════════════
   GLOBAL CSS — injected once via ScanHeader (always mounted)
═══════════════════════════════════════════════════════════════ */
const SCAN_STYLES = `
  @keyframes scanGradientShift {
    0%   { background-position: 0%   50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0%   50%; }
  }

  /* Pulsing purple-glow for consent card */
  @keyframes cardPulseGlow {
    0%, 100% {
      box-shadow:
        0 0 0 0 rgba(139, 92, 246, 0),
        0 8px 40px rgba(139, 92, 246, 0.35),
        0 4px 20px rgba(99, 102, 241, 0.25),
        0 2px 10px rgba(59, 91, 219, 0.15);
    }
    50% {
      box-shadow:
        0 0 0 8px  rgba(139, 92, 246, 0.25),
        0 12px 60px rgba(139, 92, 246, 0.55),
        0 6px 32px rgba(99, 102, 241, 0.40),
        0 3px 16px rgba(59, 91, 219, 0.25);
    }
  }

  /* Floating bubbles */
  @keyframes floatBubble1 {
    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
    25%      { transform: translate(30px, -50px) scale(1.1); opacity: 0.6; }
    50%      { transform: translate(-20px, -100px) scale(0.95); opacity: 0.5; }
    75%      { transform: translate(40px, -70px) scale(1.05); opacity: 0.65; }
  }

  @keyframes floatBubble2 {
    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.35; }
    33%      { transform: translate(-40px, -60px) scale(1.15); opacity: 0.55; }
    66%      { transform: translate(25px, -110px) scale(0.9); opacity: 0.45; }
  }

  @keyframes floatBubble3 {
    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
    20%      { transform: translate(15px, -40px) scale(1.08); opacity: 0.5; }
    50%      { transform: translate(-35px, -90px) scale(1.12); opacity: 0.6; }
    80%      { transform: translate(20px, -65px) scale(0.98); opacity: 0.4; }
  }

  .bubble-1 { animation: floatBubble1 18s ease-in-out infinite; }
  .bubble-2 { animation: floatBubble2 22s ease-in-out infinite 2s; }
  .bubble-3 { animation: floatBubble3 20s ease-in-out infinite 4s; }

  /* Modal slide-in */
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.94) translateY(14px); }
    to   { opacity: 1; transform: scale(1)    translateY(0);    }
  }
  .modal-enter { animation: modalIn 0.22s ease-out forwards; }

  /* Drop zone hover ring */
  .dropzone-active {
    box-shadow: 0 0 0 3px rgba(59, 91, 219, 0.25);
  }
`;

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════════ */
const GRADIENT_STYLE = {
  background: "linear-gradient(-45deg, #1e3a8a, #364a6b, #4338ca, #5b21b6)",
  backgroundSize: "400% 400%",
  animation: "scanGradientShift 15s ease infinite",
};

const CONSENT_BG = {
  background: "linear-gradient(135deg, #2d3b66 0%, #3d4b7a 50%, #4a5a8e 100%)",
};

const CONSENT_ITEMS = [
  { ItemIcon: CameraOff, text: "Turn off your phone's flash." },
  { ItemIcon: Droplet, text: "Ensure your skin is dry and clean." },
  { ItemIcon: Sun, text: "Move to a room with bright, natural lighting." },
  {
    ItemIcon: Scissors,
    text: "If there is dense hair covering the mole, please trim it carefully.",
  },
];

/* ═══════════════════════════════════════════════════════════════
   SCAN HEADER  (module-level — stable reference)
═══════════════════════════════════════════════════════════════ */
function ScanHeader({ onClose }) {
  return (
    <>
      <style>{SCAN_STYLES}</style>
      <header
        className="sticky top-0 z-50 px-5 py-3 flex items-center justify-between shadow-md"
        style={GRADIENT_STYLE}
      >
        {/* Left: logo + name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-md">
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              <circle
                cx="16"
                cy="16"
                r="11.5"
                stroke="#1e3a8a"
                strokeWidth="2.2"
                fill="none"
              />
              <circle cx="16" cy="16" r="4.5" fill="#1e3a8a" />
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
          <div className="leading-tight">
            <p className="text-white font-bold text-sm">AI Dermatologist</p>
            <p className="text-blue-200/80 text-xs">Skin Scanner</p>
          </div>
        </div>

        {/* Right: lang + close */}
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors duration-150">
            <Globe size={14} strokeWidth={2} />
            <span>Lang: En</span>
          </button>
          <button
            onClick={onClose}
            aria-label="Close scanner"
            className="text-white/70 hover:text-white transition-colors duration-150 p-1 rounded-lg hover:bg-white/10"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>
      </header>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TRUST BULLET  (module-level)
═══════════════════════════════════════════════════════════════ */
function TrustBullet({ children }) {
  return (
    <li className="flex items-start gap-2.5 text-slate-700 text-sm leading-relaxed">
      <span className="text-[#3b5bdb] font-bold mt-0.5 shrink-0">•</span>
      <span>{children}</span>
    </li>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PHOTO SLOT  (module-level)
═══════════════════════════════════════════════════════════════ */
function PhotoSlot({ photo, index, onAdd }) {
  if (photo) {
    return (
      <div className="aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative">
        <img
          src={photo}
          alt={`Skin photo ${index + 1}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-white/90 rounded-full p-0.5 shadow">
          <CheckCircle2
            size={16}
            className="text-[#3b5bdb]"
            strokeWidth={2.5}
          />
        </div>
        <div className="absolute bottom-2 left-2 bg-[#3b5bdb]/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          #{index + 1}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onAdd}
      className="aspect-square rounded-2xl border-2 border-dashed border-[#3b5bdb]/30 bg-blue-50/40 hover:bg-blue-50 hover:border-[#3b5bdb]/60 transition-all duration-200 flex flex-col items-center justify-center gap-1.5 group"
    >
      <div className="w-8 h-8 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors flex items-center justify-center">
        <Plus size={18} strokeWidth={2.5} className="text-[#3b5bdb]" />
      </div>
      <span className="text-[#3b5bdb]/60 group-hover:text-[#3b5bdb] text-xs font-semibold transition-colors">
        Add
      </span>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DESKTOP NB BANNER  (module-level)
═══════════════════════════════════════════════════════════════ */
function DesktopNBBanner() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 flex items-start gap-2.5">
      <Monitor
        size={15}
        className="text-amber-600 shrink-0 mt-0.5"
        strokeWidth={2}
      />
      <p className="text-amber-800 text-xs leading-relaxed">
        <strong className="font-semibold">Note:</strong> You appear to be on a
        desktop or laptop. Camera capture is unavailable — please{" "}
        <strong className="font-semibold">upload a photo</strong> from your
        device instead.
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PHOTO ACTION BUTTONS  (module-level — receives callbacks as props)
═══════════════════════════════════════════════════════════════ */
function PhotoButtons({ slot, compact, isMobile, onChoose, onCamera }) {
  return (
    <div className={`flex ${compact ? "gap-2" : "flex-col gap-3"}`}>
      {/* Choose Photo — always visible */}
      <button
        onClick={() => onChoose(slot)}
        className={`
          flex items-center justify-center gap-2.5
          bg-[#3b5bdb] hover:bg-[#3451c7] text-white font-bold
          rounded-xl transition-all duration-200
          shadow-[0_4px_18px_rgba(59,91,219,0.32)]
          hover:shadow-[0_6px_24px_rgba(59,91,219,0.42)]
          hover:scale-[1.01] active:scale-[0.99] focus:outline-none
          ${compact ? "flex-1 py-2.5 text-sm px-3" : "w-full py-4 px-6 text-base"}
        `}
      >
        <FolderOpen size={compact ? 15 : 18} strokeWidth={2.5} />
        Choose Photo
      </button>

      {/* Take Photo — mobile only */}
      {isMobile && (
        <button
          onClick={() => onCamera(slot)}
          className={`
            flex items-center justify-center gap-2.5
            bg-white border-2 border-[#3b5bdb] text-[#3b5bdb] hover:bg-blue-50
            font-bold rounded-xl transition-all duration-200
            hover:scale-[1.01] active:scale-[0.99] focus:outline-none
            ${compact ? "flex-1 py-2.5 text-sm px-3" : "w-full py-4 px-6 text-base"}
          `}
        >
          <Camera size={compact ? 15 : 18} strokeWidth={2.5} />
          Take Photo
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PHOTO PICKER MODAL  (module-level — stable reference)
   Styled "selection box" — matches the bordered-box aesthetic
   used throughout the codebase.
═══════════════════════════════════════════════════════════════ */
function PhotoPickerModal({ isOpen, onConfirm, onCancel }) {
  const [previews, setPreviews] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef(null);

  const processFiles = (files) => {
    if (!files || files.length === 0) return;

    // Take up to 3 files
    const selectedFiles = Array.from(files).slice(0, 3).filter(f =>
      f.type.startsWith("image/")
    );

    if (selectedFiles.length === 0) return;

    const readers = selectedFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(results => {
      setPreviews(results);
    });
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };
</text>

<old_text line=350>
        {/* ── Modal top bar ── */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h3 className="text-[#0c1a54] font-extrabold text-lg">
            {preview ? "Review Photo" : "Select a Photo"}
          </h3>

  if (!isOpen) return null;

  return (
    /* Overlay — click outside to cancel */
    <div
      className="fixed inset-0 z-200 flex items-center justify-center p-4"
      style={{ background: "rgba(9,19,63,0.55)", backdropFilter: "blur(5px)" }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden modal-enter">
        {/* ── Modal top bar ── */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h3 className="text-[#0c1a54] font-extrabold text-lg">
            {preview ? "Review Photo" : "Select a Photo"}
          </h3>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-all"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* ── Selection box (bordered — codebase reference style) ── */}
        <div className="px-5 pb-3">
          <div
            className={`
              relative rounded-xl border-2 overflow-hidden transition-all duration-200
              ${
                previews.length > 0
                  ? "border-[#3b5bdb] bg-white"
                  : isDragging
                    ? "border-[#2dc8c0] bg-teal-50/40 dropzone-active"
                    : "border-[#3b5bdb]/50 bg-[#f4f7ff] hover:border-[#3b5bdb] hover:bg-[#eef2ff] cursor-pointer"
              }
            `}
            style={{ minHeight: "220px" }}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={previews.length === 0 ? () => fileRef.current?.click() : undefined}
          >
            {previews.length > 0 ? (
              /* Preview grid */
              <div className={`grid gap-2 p-3 ${previews.length === 1 ? 'grid-cols-1' : previews.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {previews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200">
                    <img
                      src={src}
                      alt={`Preview ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 right-1 bg-[#3b5bdb] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      #{i + 1}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
</text>

<old_text line=402>
                  <p className="text-[#0c1a54] font-semibold text-sm mb-1">
                    {isDragging
                      ? "Drop your photo here"
                      : "Click or drag & drop"}
                  </p>
                  <p className="text-slate-400 text-xs">
                    Supports JPG · PNG · HEIC · WEBP
                  </p>
              /* Drop zone */
              <div className="flex flex-col items-center justify-center gap-3 py-12 px-6">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-200
                    ${isDragging ? "bg-teal-100" : "bg-blue-100"}`}
                >
                  <ImagePlus
                    size={28}
                    strokeWidth={1.5}
                    className={isDragging ? "text-[#2dc8c0]" : "text-[#3b5bdb]"}
                  />
                </div>
                <div className="text-center">
                  <p className="text-[#0c1a54] font-semibold text-sm mb-1">
                    {isDragging
                      ? "Drop your photo here"
                      : "Click or drag & drop"}
                  </p>
                  <p className="text-slate-400 text-xs">
                    Supports JPG · PNG · HEIC · WEBP
                  </p>
                </div>
                {/* Corner accent matching codebase card style */}
                <div className="absolute top-3 right-3 opacity-30">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#3b5bdb]" />
                </div>
              </div>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => processFiles(e.target.files)}
          />
</text>

<old_text line=430>
        <div className="px-5 pb-5 flex gap-3">
          {preview ? (
            <>
              <button
                onClick={() => {
                  setPreview(null);
                  setTimeout(() => fileRef.current?.click(), 50);
                }}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm transition-all duration-200"
              >
                Choose Different
              </button>
              <button
                onClick={() => onConfirm(preview)}
                className="
                  flex-1 py-3 rounded-xl text-white font-bold text-sm
                  bg-[#3b5bdb] hover:bg-[#3451c7]
                  shadow-[0_3px_14px_rgba(59,91,219,0.35)]
                  hover:shadow-[0_5px_20px_rgba(59,91,219,0.45)]
                  hover:scale-[1.01] active:scale-[0.99]
                  transition-all duration-200
                "
              >
                Use This Photo ✓
              </button>
            </>
        </div>

        {/* ── Action buttons ── */}
        <div className="px-5 pb-5 flex gap-3">
          {preview ? (
            <>
              <button
                onClick={() => {
                  setPreview(null);
                  setTimeout(() => fileRef.current?.click(), 50);
                }}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm transition-all duration-200"
              >
                Choose Different
              </button>
              <button
                onClick={() => onConfirm(preview)}
                className="
                  flex-1 py-3 rounded-xl text-white font-bold text-sm
                  bg-[#3b5bdb] hover:bg-[#3451c7]
                  shadow-[0_3px_14px_rgba(59,91,219,0.35)]
                  hover:shadow-[0_5px_20px_rgba(59,91,219,0.45)]
                  hover:scale-[1.01] active:scale-[0.99]
                  transition-all duration-200
                "
              >
                Use This Photo ✓
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onCancel}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="
                  flex-1 py-3 rounded-xl text-white font-bold text-sm
                  bg-[#3b5bdb] hover:bg-[#3451c7]
                  shadow-[0_3px_14px_rgba(59,91,219,0.35)]
                  transition-all duration-200
                  flex items-center justify-center gap-2
                "
              >
                <Upload size={15} strokeWidth={2.5} />
                Browse Files
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN — ScanPage
═══════════════════════════════════════════════════════════════ */
export default function ScanPage() {
  const navigate = useNavigate();

  /* ── Step state: 0=consent, 1=intro, 2=photo-grid ── */
  const [step, setStep] = useState(0);

  /* ── Photo data (up to 3 data-URLs) ── */
  const [photos, setPhotos] = useState([null, null, null]);

  /* ── 10-min countdown timer ── */
  const [timerSeconds, setTimerSeconds] = useState(600);
  const [timerActive, setTimerActive] = useState(false);

  /* ── Upload modal ── */
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingSlot, setPendingSlot] = useState(0);
  const [modalKey, setModalKey] = useState(0);

  /* ── Device / screen-ratio detection ── */
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    const ratio = window.innerWidth / window.innerHeight;
    const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    // Desktop: 16:9 ratio (≥1.65) AND no touch
    // Mobile/tablet: anything else
    return hasTouch || ratio < 1.65;
  });

  /* ── Camera input ref (native capture, mobile only) ── */
  const cameraRef = useRef(null);
  const activeSlot = useRef(0);

  /* ────────────────────────────────────────────────────────
     Effects
  ──────────────────────────────────────────────────────── */

  /* Screen resize → re-evaluate device type */
  useEffect(() => {
    const check = () => {
      const ratio = window.innerWidth / window.innerHeight;
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      setIsMobile(hasTouch || ratio < 1.65);
    };
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* Timer countdown */
  useEffect(() => {
    if (!timerActive) return;
    const id = setInterval(() => {
      setTimerSeconds((s) => {
        if (s <= 1) {
          setTimerActive(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerActive]);

  /* ────────────────────────────────────────────────────────
     Derived
  ──────────────────────────────────────────────────────── */
  const filledCount = photos.filter(Boolean).length;
  const allFilled = filledCount === 3;

  const formatTime = (s) =>
    `${Math.floor(s / 60)} min : ${String(s % 60).padStart(2, "0")} sec`;

  /* ────────────────────────────────────────────────────────
     Handlers
  ──────────────────────────────────────────────────────── */

  /* Commit confirmed photos (from modal) */
  const handleModalConfirm = (dataUrls) => {
    setPhotos((prev) => {
      const next = [...prev];
      // Fill from pendingSlot onwards
      dataUrls.forEach((url, i) => {
        const targetIndex = pendingSlot + i;
        if (targetIndex < 3) {
          next[targetIndex] = url;
        }
      });
      return next;
    });
    if (pendingSlot === 0 && !timerActive) {
      setTimerSeconds(600);
      setTimerActive(true);
    }
    setStep(2);
    setModalOpen(false);
  };
</text>

<old_text line=649>
      {/* ════════════════════════════════════════════════
          STEP 0 — CONSENT  ("Before we begin")
      ════════════════════════════════════════════════ */}
      {step === 0 && (
        <div className="max-w-2xl mx-auto px-5 py-10 sm:py-16">

  /* Open the upload modal for a given slot (or next empty) */
  const openModal = (slotIndex) => {
    const slot = slotIndex != null ? slotIndex : photos.findIndex((p) => !p);
    if (slot === -1) return;
    setPendingSlot(slot);
    setModalKey((k) => k + 1);
    setModalOpen(true);
  };

  /* Trigger native camera (mobile only) */
  const triggerCamera = (slotIndex) => {
    const slot = slotIndex != null ? slotIndex : photos.findIndex((p) => !p);
    if (slot === -1) return;
    activeSlot.current = slot;
    cameraRef.current?.click();
  };

  /* Handle camera capture result */
  const handleCameraCapture = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotos((prev) => {
        const next = [...prev];
        next[activeSlot.current] = ev.target.result;
        return next;
      });
      if (activeSlot.current === 0) {
        setTimerSeconds(600);
        setTimerActive(true);
      }
      setStep(2);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  /* ════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════ */
  return (
    <div
      className="min-h-screen"
      style={step === 0 ? CONSENT_BG : { background: "#ffffff" }}
    >
      {/* ── Always-present camera input ── */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleCameraCapture}
      />

      {/* ── Upload modal ── */}
      <PhotoPickerModal
        key={modalKey}
        isOpen={modalOpen}
        onConfirm={handleModalConfirm}
        onCancel={() => setModalOpen(false)}
      />

      {/* ── Sticky header ── */}
      <ScanHeader onClose={() => navigate(-1)} />

      {/* ════════════════════════════════════════════════
          STEP 0 — CONSENT  ("Before we begin")
      ════════════════════════════════════════════════ */}
      {step === 0 && (
        <div className="max-w-2xl mx-auto px-5 py-10 sm:py-16">
          <div
            className="rounded-3xl p-8 sm:p-12 consent-card-glow relative z-10"
</text>

<old_text line=719>
      {/* ════════════════════════════════════════════════
          STEP 1 — INTRO  ("Catch it early!")
      ════════════════════════════════════════════════ */}
      {step === 1 && (
        <div className="max-w-2xl mx-auto px-5 py-10">
            style={{
              background:
                "linear-gradient(135deg, #f3f0ff 0%, #e9d5ff 50%, #f5f3ff 100%)",
              border: "2px solid rgba(168, 85, 247, 0.4)",
            }}
          >
            {/* Title */}
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0c1a54] mb-8 leading-tight">
              Before we begin
            </h1>

            {/* Checklist */}
            <div className="space-y-5 mb-8">
              {CONSENT_ITEMS.map((item, i) => {
                const ConsentIcon = item.ItemIcon;
                return (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center shrink-0 border-2 border-purple-300/60 shadow-sm">
                      <ConsentIcon
                        className="w-5 h-5 text-purple-600"
                        strokeWidth={2}
                      />
                    </div>
                    <p className="text-[#1e293b] text-base leading-relaxed pt-2 font-medium">
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Warning box */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-8 flex gap-3.5">
              <AlertTriangle
                className="w-5 h-5 text-red-500 shrink-0 mt-0.5"
                strokeWidth={2}
              />
              <p className="text-red-700 text-sm leading-relaxed">
                Do not use this tool on scratched, bleeding, or recently injured
                moles. Allow the spot to fully heal first to prevent false AI
                readings.
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={() => setStep(1)}
              className="
                w-full bg-gradient-to-r from-purple-600 to-indigo-600
                hover:from-purple-700 hover:to-indigo-700
                text-white font-bold
                py-4 px-6 rounded-xl text-base
                transition-all duration-200
                shadow-[0_6px_28px_rgba(139,92,246,0.45)]
                hover:shadow-[0_8px_36px_rgba(139,92,246,0.60)]
                hover:scale-[1.02] active:scale-[0.98]
                focus:outline-none
              "
            >
              I Understand &amp; Agree
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════
          STEP 1 — INTRO  ("Catch it early!")
      ════════════════════════════════════════════════ */}
      {step === 1 && (
        <div className="max-w-2xl mx-auto px-5 py-10">
          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0c1a54] mb-6 relative z-10">
</text>

<old_text line=726>
          {/* Hero image — contained, properly sized */}
          <div
            className="w-full rounded-2xl overflow-hidden mb-8 border border-slate-100 bg-[#f4f7fb] flex items-center justify-center"
            Catch it early!
          </h1>

          {/* Hero image — contained, properly sized */}
          <div
            className="w-full rounded-2xl overflow-hidden mb-8 border border-slate-100 bg-[#f4f7fb] flex items-center justify-center"
            style={{ height: "220px" }}
          >
            <img
              src={step1Img}
              alt="Scan your skin with your phone"
              className="h-full w-auto max-w-full object-contain"
              style={{ maxHeight: "220px" }}
            />
          </div>

          {/* Trust bullets */}
          <div className="mb-7 relative z-10">
</text>

<old_text line=763>
          {/* Desktop NB warning */}
          {!isMobile && <DesktopNBBanner />}

          {/* Choose Photo + Take Photo (conditional) */}
          <div className="mb-5">
            <p className="text-[#0c1a54] font-bold text-[15px] mb-3">
              Why users trust us:
            </p>
            <ul className="space-y-2.5">
              <TrustBullet>
                <strong>Several types of skin cancer</strong> detected
              </TrustBullet>
              <TrustBullet>
                <strong>97% accurate</strong> results
              </TrustBullet>
              <TrustBullet>Private &amp; secure</TrustBullet>
              <TrustBullet>On-hand tool</TrustBullet>
              <TrustBullet>
                Results in <strong>1 minute</strong>
              </TrustBullet>
              <TrustBullet>
                Track your skin conditions <strong>over time</strong>
              </TrustBullet>
            </ul>
          </div>

          {/* Desktop NB warning */}
          {!isMobile && <DesktopNBBanner />}

          {/* Choose Photo + Take Photo (conditional) */}
          <div className="mb-5">
            <PhotoButtons
              slot={0}
              compact={false}
              isMobile={isMobile}
              onChoose={openModal}
              onCamera={triggerCamera}
            />
          </div>

          {/* Tip box */}
          <div className="bg-[#fdf6ec] border border-[#f0dfc4] rounded-xl p-4 flex gap-3 items-start relative z-10">
</text>

            <Info
              size={16}
              className="text-[#a07840] shrink-0 mt-0.5"
              strokeWidth={2}
            />
            <p className="text-[#6b5230] text-sm leading-relaxed">
              <strong className="font-semibold">Tip:</strong> For more accurate
              results, please upload 3 clear photos of the same skin area taken
              under good lighting. This helps the AI analyse the spot more
              precisely.
            </p>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════
          STEP 2 — PHOTO GRID
      ════════════════════════════════════════════════ */}
      {step === 2 && (
        <div className="max-w-md mx-auto px-5 py-8">
          {/* ── Heading + sub-copy ── */}
          <h1 className="text-2xl font-extrabold text-[#0c1a54] mb-1">
            Your photos
          </h1>

          {/* 0 photos: initial prompt */}
          {filledCount === 0 && (
            <>
              <p className="text-[#3b5bdb] font-bold text-sm mb-1.5">
                In-Depth Analysis
              </p>
              <p className="text-slate-500 text-sm leading-relaxed mb-1">
                Get a clearer, smarter understanding of your skin. This feature
                compares several photos taken over a few days to reveal real
                changes and give you a more accurate result.
              </p>
              <p className="text-slate-500 text-sm leading-relaxed mb-7">
                A deeper analysis. A more accurate result.
              </p>

              {/* Desktop NB + buttons */}
              {!isMobile && <DesktopNBBanner />}
              <div className="mb-6">
                <PhotoButtons
                  slot={0}
                  compact={false}
                  isMobile={isMobile}
                  onChoose={openModal}
                  onCamera={triggerCamera}
                />
              </div>

              {/* Disabled send placeholder */}
              <button
                disabled
                className="w-full bg-slate-200 text-slate-400 font-bold py-4 px-6 rounded-2xl text-base cursor-not-allowed"
              >
                Send photos to analyze
              </button>
              <p className="text-center text-slate-400 text-xs mt-3 leading-relaxed px-2">
                * This feature will become available once you have added all the
                photos
              </p>
            </>
          )}

          {/* 1–2 photos: keep moving */}
          {filledCount > 0 && !allFilled && (
            <>
              <p className="text-[#0c1a54] font-bold text-sm mb-1">
                Keep Your Analysis Moving
              </p>
              <p className="text-slate-500 text-sm leading-relaxed mb-3">
                You'll be able to add your next photo to get the most accurate,
                complete result in:
              </p>
              {timerActive && (
                <div className="bg-[#3b5bdb] text-white font-semibold text-sm text-center py-3 px-4 rounded-xl mb-5 shadow-[0_3px_14px_rgba(59,91,219,0.35)]">
                  Time remaining: {formatTime(timerSeconds)}
                </div>
              )}
            </>
          )}

          {/* All 3 photos: ready */}
          {allFilled && (
            <>
              <p className="text-[#0c1a54] font-bold text-sm mb-1">
                Ready. Set. Know.
              </p>
              <p className="text-slate-500 text-sm mb-5">
                Your In-Depth Analysis is complete.
              </p>
            </>
          )}

          {/* ── Photo grid ── */}
          {filledCount > 0 && (
            <>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[0, 1, 2].map((i) => (
                  <PhotoSlot
                    key={i}
                    photo={photos[i]}
                    index={i}
                    onAdd={() => !photos[i] && openModal(i)}
                  />
                ))}
              </div>

              {/* Add more — compact 2-button row */}
              {!allFilled && (
                <div className="mb-5">
                  {!isMobile && <DesktopNBBanner />}
                  <PhotoButtons
                    slot={null}
                    compact
                    isMobile={isMobile}
                    onChoose={openModal}
                    onCamera={triggerCamera}
                  />
                </div>
              )}

              {/* Send button */}
              <button
                disabled={!allFilled}
                className={`
                  w-full font-bold py-4 px-6 rounded-2xl text-base
                  transition-all duration-200 focus:outline-none
                  ${
                    allFilled
                      ? `bg-[#3b5bdb] hover:bg-[#3451c7] text-white
                       shadow-[0_4px_20px_rgba(59,91,219,0.35)]
                       hover:shadow-[0_6px_28px_rgba(59,91,219,0.45)]
                       hover:scale-[1.01] active:scale-[0.99]`
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }
                `}
              >
                Send photos to analyze
              </button>

              {!allFilled && (
                <p className="text-center text-slate-400 text-xs mt-3 leading-relaxed px-2">
                  * This feature will become available once you have added all
                  the photos
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
