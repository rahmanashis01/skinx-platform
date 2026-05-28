import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CameraOff,
  Droplet,
  Sun,
  Scissors,
  AlertTriangle,
  X,
  Info,
  Check,
  Minus,
  Plus,
} from "lucide-react";
import catchEarlyImg from "../assets/catch-early.png";
import logoImg from "../assets/logo.png";
import { API_CONFIG } from "../config/api";

// Helper function to convert base64 string to File object
function base64ToFile(base64, filename) {
  const arr = base64.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}

// ── Mobile device detection (wide/laptop → file upload only; mobile → camera) ──
const IS_MOBILE =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  ) ||
  ("ontouchstart" in window && window.innerWidth < 1024);
// Add this for aspect ratio detection
const IS_VERTICAL_SCREEN = window.innerHeight > window.innerWidth;
const ASPECT_RATIO = window.innerWidth / window.innerHeight;

/* ═══════════════════════════════════════════════════════════════
   GLOBAL CSS
═══════════════════════════════════════════════════════════════ */
const SCAN_STYLES = `
  @keyframes scanGradientShift {
    0%   { background-position: 0%   50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0%   50%; }
  }

  @keyframes cardPulseGlow {
    0%, 100% {
      box-shadow:
        0 0 0 0   rgba(139, 92, 246, 0),
        0 8px 40px rgba(139, 92, 246, 0.35),
        0 4px 20px rgba(99, 102, 241, 0.25);
    }
    50% {
      box-shadow:
        0 0 0 8px  rgba(139, 92, 246, 0.25),
        0 12px 60px rgba(139, 92, 246, 0.55),
        0 6px 32px  rgba(99, 102, 241, 0.40);
    }
  }

  @keyframes floatBubble1 {
    0%, 100% { transform: translate(0,0)    scale(1);    opacity: 0.4; }
    25%      { transform: translate(30px,-50px)  scale(1.1);  opacity: 0.6; }
    50%      { transform: translate(-20px,-100px) scale(0.95); opacity: 0.5; }
    75%      { transform: translate(40px,-70px)  scale(1.05); opacity: 0.65;}
  }
  @keyframes floatBubble2 {
    0%, 100% { transform: translate(0,0)    scale(1);    opacity: 0.35;}
    33%      { transform: translate(-40px,-60px)  scale(1.15); opacity: 0.55;}
    66%      { transform: translate(25px,-110px) scale(0.9);  opacity: 0.45;}
  }
  @keyframes floatBubble3 {
    0%, 100% { transform: translate(0,0)    scale(1);    opacity: 0.3; }
    20%      { transform: translate(15px,-40px)  scale(1.08); opacity: 0.5; }
    50%      { transform: translate(-35px,-90px) scale(1.12); opacity: 0.6; }
    80%      { transform: translate(20px,-65px)  scale(0.98); opacity: 0.4; }
  }

  .bubble-1 { animation: floatBubble1 18s ease-in-out infinite; }
  .bubble-2 { animation: floatBubble2 22s ease-in-out infinite 2s; }
  .bubble-3 { animation: floatBubble3 20s ease-in-out infinite 4s; }
  .consent-card-glow { animation: cardPulseGlow 3.2s ease-in-out infinite; }

  /* Custom range input */
  .crop-range {
    -webkit-appearance: none;
    appearance: none;
    height: 4px;
    border-radius: 2px;
    background: #d1d5db;
    outline: none;
    cursor: pointer;
    width: 100%;
  }
  .crop-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #3b5bdb;
    cursor: pointer;
    border: 3px solid #ffffff;
    box-shadow: 0 1px 6px rgba(59,91,219,0.45);
  }
  .crop-range::-moz-range-thumb {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #3b5bdb;
    cursor: pointer;
    border: 3px solid #ffffff;
    box-shadow: 0 1px 6px rgba(59,91,219,0.45);
  }
`;

const GRADIENT_STYLE = {
  background: "linear-gradient(-45deg, #1e3a8a, #364a6b, #4338ca, #5b21b6)",
  backgroundSize: "400% 400%",
  animation: "scanGradientShift 15s ease infinite",
};

const CONSENT_BG = {
  background:
    "linear-gradient(180deg, #3B7EE8 0%, #4B96F0 35%, #63B4F6 65%, #7DDBFB 100%)",
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
   SCAN HEADER
═══════════════════════════════════════════════════════════════ */
function ScanHeader({ onClose, onHome }) {
  return (
    <>
      <style>{SCAN_STYLES}</style>
      <header
        className="sticky top-0 z-50 px-5 py-3 flex items-center justify-between shadow-md"
        style={GRADIENT_STYLE}
      >
        <button
          onClick={onHome}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none"
          aria-label="Go to home"
        >
          <div
            style={{
              width: "70px",
              height: "44px",
              borderRadius: "11px",
              overflow: "hidden",
              flexShrink: 0,
              background: "white",
              boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
              padding: "3px 5px",
            }}
          >
            <img
              src={logoImg}
              alt="SkinX"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>
        </button>

        <button
          onClick={onClose}
          aria-label="Close scanner"
          className="text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
        >
          <X size={20} strokeWidth={2} />
        </button>
      </header>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TRUST BULLET
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
   CROP IMAGE COMPONENT
   – drag to reposition, slider to zoom
   – overlay darkens outside the crop square
═══════════════════════════════════════════════════════════════ */
const CROP_RATIO = 0.7; // crop box = 70% of container side
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.05;
const SUITABLE_ZOOM = 1.5; // threshold for "suitable"

const ABCDE_CHECKS = [
  {
    id: "A",
    title: "Asymmetry",
    description: "Moles that have asymmetrical appearance",
  },
  {
    id: "B",
    title: "Border",
    description:
      "Borders tend to be uneven and may have scalloped or notched edges",
  },
  {
    id: "C",
    title: "Color",
    description: "Variety of colors like brown, tan or black",
  },
  {
    id: "D",
    title: "Diameter",
    description:
      "Moles with a diameter larger than a pencil eraser (6mm or 1/4 inch)",
  },
  {
    id: "E",
    title: "Evolution",
    description: "Change in size, shape, color, elevation or new symptom",
  },
];

function CropImage({ imageUrl, zoom, position, onPositionChange }) {
  const isDragging = useRef(false);
  const lastPoint = useRef({ x: 0, y: 0 });

  /* stable move handler (uses refs, not state) */
  const moveDrag = useCallback(
    (clientX, clientY) => {
      if (!isDragging.current) return;
      const dx = clientX - lastPoint.current.x;
      const dy = clientY - lastPoint.current.y;
      lastPoint.current = { x: clientX, y: clientY };
      onPositionChange((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    },
    [onPositionChange],
  );

  const startDrag = (clientX, clientY) => {
    isDragging.current = true;
    lastPoint.current = { x: clientX, y: clientY };
  };
  const endDrag = () => {
    isDragging.current = false;
  };

  /* global mouse / touch listeners */
  useEffect(() => {
    const onMouseMove = (e) => moveDrag(e.clientX, e.clientY);
    const onTouchMove = (e) => {
      e.preventDefault();
      moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", endDrag);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", endDrag);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", endDrag);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", endDrag);
    };
  }, [moveDrag]);

  const outerPct = `${((1 - CROP_RATIO) / 2) * 100}%`;
  const innerPct = `${CROP_RATIO * 100}%`;

  return (
    <div
      data-crop-container
      className="relative w-full overflow-hidden select-none"
      style={{
        aspectRatio: "1 / 1",
        background: "#7a7a7a",
        cursor: "grab",
        touchAction: "none",
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        startDrag(e.clientX, e.clientY);
      }}
      onTouchStart={(e) =>
        startDrag(e.touches[0].clientX, e.touches[0].clientY)
      }
    >
      {/* ── draggable / zoomable image ── */}
      <img
        src={imageUrl}
        alt="crop preview"
        draggable={false}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "100%",
          height: "100%",
          objectFit: "contain",
          transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${zoom})`,
          transformOrigin: "50% 50%",
          pointerEvents: "none",
          userSelect: "none",
        }}
      />

      {/* ── dark overlay — four panels framing the crop square ── */}
      {/* top */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{ height: outerPct, background: "rgba(80,80,80,0.62)" }}
      />
      {/* bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: outerPct, background: "rgba(80,80,80,0.62)" }}
      />
      {/* left */}
      <div
        className="absolute left-0 pointer-events-none"
        style={{
          top: outerPct,
          height: innerPct,
          width: outerPct,
          background: "rgba(80,80,80,0.62)",
        }}
      />
      {/* right */}
      <div
        className="absolute right-0 pointer-events-none"
        style={{
          top: outerPct,
          height: innerPct,
          width: outerPct,
          background: "rgba(80,80,80,0.62)",
        }}
      />

      {/* ── crop box border + rule-of-thirds grid ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: outerPct,
          left: outerPct,
          width: innerPct,
          height: innerPct,
          border: "1.5px dashed rgba(255,255,255,0.85)",
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.22) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.22) 1px, transparent 1px)
          `,
          backgroundSize: "33.33% 33.33%",
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export default function ScanPage() {
  const navigate = useNavigate();

  /* ── step machine ──
     0 = consent
     1 = catch-it-early / upload prompt
     2 = crop
     3 = loading
     4 = result (suitable/not suitable check)
     5 = ABCDE scanning animation
     6 = result ready (with timer and marketing)
  ── */
  // If coming from SessionWorkspace with pre-selected images (max 3), skip consent + catch-it-early
  // Multi-photo batch upload states - initialize first
  const [allUploadedPhotos, setAllUploadedPhotos] = useState(() => {
    const directImages = sessionStorage.getItem("directScanImages");
    if (directImages) {
      const images = JSON.parse(directImages);
      return images;
    }
    return [];
  });
  const [allUploadedFiles, setAllUploadedFiles] = useState([]);
  const [allCroppedPhotos, setAllCroppedPhotos] = useState([]);
  const [currentCropIndex, setCurrentCropIndex] = useState(0);

  const [step, setStep] = useState(() => {
    const directImages = sessionStorage.getItem("directScanImages");
    return directImages ? 2 : 0;
  });
  const [uploadedPhoto, setUploadedPhoto] = useState(() => {
    const directImages = sessionStorage.getItem("directScanImages");
    if (directImages) {
      sessionStorage.removeItem("directScanImages");
      const images = JSON.parse(directImages);
      // Use first image for batch cropping flow
      return images[0] || null;
    }
    return null;
  });

  const [croppedPhoto, setCroppedPhoto] = useState(null);
  const [isPhotoSuitable, setIsPhotoSuitable] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [cropZoom, setCropZoom] = useState(MIN_ZOOM);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });

  // ABCDE scanning states
  const [scanningLinePosition, setScanningLinePosition] = useState(0);
  const [currentCheckIndex, setCurrentCheckIndex] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [completedChecks, setCompletedChecks] = useState([]);

  // Testimonial carousel state
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);

  const fileRef = useRef(null); // Desktop multi-file upload
  const cameraRef = useRef(null); // Mobile camera capture
  const mobile = IS_MOBILE;

  // Reset crop state whenever a new photo is loaded via direct scan
  useEffect(() => {
    if (uploadedPhoto && step === 2) {
      setCropZoom(MIN_ZOOM);
      setCropPosition({ x: 0, y: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const testimonials = [
    {
      name: "Ashis",
      text: "Which was later confirmed by my PCP! Thank you for creating and providing this technology.",
      stars: 5,
    },
    {
      name: "Redwan",
      text: "The app works really well for skin tracking, and the reminders are super useful. The AI chat is helpful but sometimes gives generic responses.",
      stars: 5,
    },
    {
      name: "Siddhartho",
      text: "Accurately detected skin cancer this month and quite possibly saved my life, skin biopsy showed this app being 100% correct. I will recommend this app to everyone.",
      stars: 5,
    },
  ];

  /* ── file(s) selected from explorer (max 3) ── */
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to max 3 images
    const selectedFiles = files.slice(0, 3);

    // Show feedback if more than 3 selected
    if (!mobile && files.length > 3) {
      alert(
        `You selected ${files.length} images. Only the first 3 will be used.`,
      );
    } else if (!mobile && selectedFiles.length > 1) {
      console.log(`✓ ${selectedFiles.length} images selected successfully`);
    }

    // Store original File objects for API submission
    setAllUploadedFiles(selectedFiles);

    // Read all selected images
    const imagePromises = selectedFiles.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises).then((images) => {
      // Store all uploaded photos
      setAllUploadedPhotos(images);
      setAllCroppedPhotos([]);
      setCurrentCropIndex(0);

      // Set first image for cropping
      setUploadedPhoto(images[0]);
      setCropZoom(MIN_ZOOM);
      setCropPosition({ x: 0, y: 0 });
      setStep(2);
    });

    e.target.value = "";
  };

  /* ── "Crop Photo" clicked ── */
  const handleCrop = () => {
    if (!uploadedPhoto) return;

    const container = document.querySelector("[data-crop-container]");
    const containerSize = container ? container.offsetWidth : 400;
    const cropSize = containerSize * CROP_RATIO;
    const cropOffset = (containerSize - cropSize) / 2;

    /* draw zoomed+translated image to temp canvas */
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = containerSize;
    tempCanvas.height = containerSize;
    const tempCtx = tempCanvas.getContext("2d");

    const img = new Image();
    img.onload = () => {
      /* fit-scale: same as CSS object-fit:contain */
      const fitScale = Math.min(
        containerSize / img.naturalWidth,
        containerSize / img.naturalHeight,
      );
      const fitW = img.naturalWidth * fitScale;
      const fitH = img.naturalHeight * fitScale;

      tempCtx.save();
      tempCtx.translate(
        containerSize / 2 + cropPosition.x,
        containerSize / 2 + cropPosition.y,
      );
      tempCtx.scale(cropZoom, cropZoom);
      tempCtx.drawImage(img, -fitW / 2, -fitH / 2, fitW, fitH);
      tempCtx.restore();

      /* extract crop region → 300×300 output */
      const outCanvas = document.createElement("canvas");
      outCanvas.width = 300;
      outCanvas.height = 300;
      const outCtx = outCanvas.getContext("2d");
      outCtx.drawImage(
        tempCanvas,
        cropOffset,
        cropOffset,
        cropSize,
        cropSize,
        0,
        0,
        300,
        300,
      );

      const croppedDataUrl = outCanvas.toDataURL("image/jpeg", 0.92);

      // Multi-photo handling: Add to cropped array
      const newCroppedPhotos = [...allCroppedPhotos, croppedDataUrl];
      setAllCroppedPhotos(newCroppedPhotos);

      // Check if there are more photos to crop
      if (
        allUploadedPhotos.length > 0 &&
        currentCropIndex < allUploadedPhotos.length - 1
      ) {
        // More photos to crop - load next one
        const nextIndex = currentCropIndex + 1;
        setCurrentCropIndex(nextIndex);
        setUploadedPhoto(allUploadedPhotos[nextIndex]);
        setCropZoom(MIN_ZOOM);
        setCropPosition({ x: 0, y: 0 });
        // Stay on step 2 (crop screen)
      } else {
        // All photos cropped - proceed to next step
        // Use the first cropped photo as primary for backward compatibility
        setCroppedPhoto(newCroppedPhotos[0]);
        setIsPhotoSuitable(cropZoom >= SUITABLE_ZOOM);
        setLoadingProgress(0);
        setStep(3);
      }
    };
    img.src = uploadedPhoto;
  };

  /* ── animate loading bar, then advance to step 4 ── */
  useEffect(() => {
    if (step !== 3) return;
    setLoadingProgress(0);

    let progress = 0;
    const id = setInterval(() => {
      progress += 2;
      setLoadingProgress(progress);
      if (progress >= 100) {
        clearInterval(id);
        setTimeout(() => setStep(4), 350);
      }
    }, 50); // 50 × 50 ms = 2.5 s total

    return () => clearInterval(id);
  }, [step]);

  /* ── try again ── */
  const handleTryAgain = () => {
    setUploadedPhoto(null);
    setCroppedPhoto(null);
    setIsPhotoSuitable(null);
    setCropZoom(MIN_ZOOM);
    setCropPosition({ x: 0, y: 0 });
    setStep(1);
  };

  /* ── ABCDE scanning line animation ── */
  useEffect(() => {
    if (step !== 5 || !isScanning) return;

    const interval = setInterval(() => {
      setScanningLinePosition((prev) => {
        if (prev >= 100) return 0;
        return prev + 1;
      });
    }, 25);

    return () => clearInterval(interval);
  }, [step, isScanning]);

  /* ── ABCDE check progression ── */
  useEffect(() => {
    if (step !== 5) return;

    const timer = setTimeout(() => {
      if (currentCheckIndex < ABCDE_CHECKS.length) {
        setCompletedChecks((prev) => [
          ...prev,
          ABCDE_CHECKS[currentCheckIndex],
        ]);
        setCurrentCheckIndex((prev) => prev + 1);
      } else {
        setIsScanning(false);
        setTimeout(() => setStep(6), 500);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [step, currentCheckIndex]);

  /* ── Start scanning when entering step 5 ── */
  useEffect(() => {
    if (step === 5) {
      setScanningLinePosition(0);
      setCurrentCheckIndex(0);
      setIsScanning(true);
      setCompletedChecks([]);
    }
  }, [step]);

  /* ── Auto-rotate testimonials ── */
  useEffect(() => {
    if (step !== 6) return;

    const interval = setInterval(() => {
      setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [step, testimonials.length]);

  /* ══════════════════════════════════════════════════════════ */
  return (
    <div
      className={step === 0 ? "min-h-screen" : "min-h-screen"}
      style={step === 0 ? CONSENT_BG : { background: "#ffffff" }}
    >
      {/* Desktop: Multiple file upload (Cmd/Ctrl+click to select up to 3) */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Mobile: Camera capture */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      <ScanHeader onClose={() => navigate(-1)} onHome={() => navigate("/")} />

      {/* ══════════════════════════════════════════════════════
          STEP 0 — CONSENT
      ══════════════════════════════════════════════════════ */}
      {step === 0 && (
        <div className="h-[calc(100vh-64px)] flex items-center justify-center px-4 py-3 relative overflow-hidden">
          {/* decorative bubbles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="bubble-1 absolute top-[10%] left-[8%]  w-32 h-32 rounded-full bg-gradient-to-br from-purple-400/30 to-indigo-400/20 blur-2xl" />
            <div className="bubble-2 absolute top-[55%] right-[4%] w-36 h-36 rounded-full bg-gradient-to-br from-indigo-400/25 to-blue-400/15 blur-2xl" />
            <div className="bubble-3 absolute bottom-[10%] left-[12%] w-28 h-28 rounded-full bg-gradient-to-br from-blue-400/30 to-purple-400/20 blur-2xl" />
          </div>

          <div
            className="w-full max-w-lg rounded-3xl p-5 sm:p-7 consent-card-glow relative z-10"
            style={{
              background:
                "linear-gradient(135deg, #f3f0ff 0%, #e9d5ff 50%, #f5f3ff 100%)",
              border: "2px solid rgba(168,85,247,0.4)",
            }}
          >
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0c1a54] mb-4 leading-tight">
              Before we begin
            </h1>

            <div className="space-y-3 mb-4">
              {CONSENT_ITEMS.map((item, i) => {
                const Icon = item.ItemIcon;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/70 flex items-center justify-center shrink-0 border-2 border-purple-300/60 shadow-sm">
                      <Icon
                        className="w-4 h-4 text-purple-600"
                        strokeWidth={2}
                      />
                    </div>
                    <p className="text-[#1e293b] text-sm leading-snug font-medium">
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 mb-4 flex gap-3">
              <AlertTriangle
                className="w-4 h-4 text-red-500 shrink-0 mt-0.5"
                strokeWidth={2}
              />
              <p className="text-red-700 text-xs leading-relaxed">
                Do not use this tool on scratched, bleeding, or recently injured
                moles. Allow the spot to fully heal first to prevent false AI
                readings.
              </p>
            </div>

            <button
              onClick={() => setStep(1)}
              className="
                w-full bg-gradient-to-r from-purple-600 to-indigo-600
                hover:from-purple-700 hover:to-indigo-700
                text-white font-bold
                py-3.5 px-6 rounded-xl text-sm
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

      {/* ══════════════════════════════════════════════════════
          STEP 1 — CATCH IT EARLY / UPLOAD PROMPT
      ══════════════════════════════════════════════════════ */}
      {step === 1 && (
        <div className="max-w-2xl mx-auto px-5 py-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0c1a54] mb-6">
            Catch it early!
          </h1>

          {/* hero image */}
          <div
            className="w-full rounded-2xl overflow-hidden mb-8 border border-slate-100"
            style={{ height: "260px" }}
          >
            <img
              src={catchEarlyImg}
              alt="Catch it early — scan your skin"
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* trust bullets */}
          <div className="mb-8">
            <p className="text-[#0c1a54] font-bold text-[15px] mb-3">
              Why users trust us:
            </p>
            <ul className="space-y-2.5">
              <TrustBullet>
                <strong>several skin cancer</strong>
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

          {/* CTA buttons - Different for mobile vs desktop */}
          {mobile ? (
            <>
              {/* Mobile: Camera Capture Button */}
              <button
                onClick={() => cameraRef.current?.click()}
                className="
                  w-full bg-[#4a6fdc] hover:bg-[#3b5bdb]
                  text-white font-bold
                  py-4 px-6 rounded-full text-base
                  transition-all duration-200
                  shadow-[0_4px_20px_rgba(59,91,219,0.35)]
                  hover:shadow-[0_6px_28px_rgba(59,91,219,0.45)]
                  hover:scale-[1.01] active:scale-[0.99]
                  focus:outline-none mb-3
                "
              >
                📸 Capture Photo
              </button>

              {/* Mobile: File Upload Button */}
              <button
                onClick={() => fileRef.current?.click()}
                className="
                  w-full bg-white border-2 border-[#4a6fdc]
                  text-[#4a6fdc] hover:bg-blue-50
                  font-semibold
                  py-4 px-6 rounded-full text-base
                  transition-all duration-200
                  hover:scale-[1.01] active:scale-[0.99]
                  focus:outline-none mb-3
                "
              >
                📁 Upload from Gallery (max 3)
              </button>
            </>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="
                w-full bg-[#4a6fdc] hover:bg-[#3b5bdb]
                text-white font-bold
                py-4 px-6 rounded-full text-base
                transition-all duration-200
                shadow-[0_4px_20px_rgba(59,91,219,0.35)]
                hover:shadow-[0_6px_28px_rgba(59,91,219,0.45)]
                hover:scale-[1.01] active:scale-[0.99]
                focus:outline-none mb-3
              "
            >
              Upload Photos (max 3)
            </button>
          )}

          <button
            onClick={() => navigate("/")}
            className="
              w-full bg-white border-2 border-[#4a6fdc]
              text-[#4a6fdc] hover:bg-blue-50
              font-semibold
              py-[14px] px-6 rounded-full text-base
              transition-all duration-200
              hover:scale-[1.01] active:scale-[0.99]
              focus:outline-none mb-6
            "
          >
            Skip uploading photo
          </button>

          {/* tip */}
          <div className="bg-[#fdf6ec] border border-[#f0dfc4] rounded-xl p-4 flex gap-3 items-start">
            <Info
              size={16}
              className="text-[#a07840] shrink-0 mt-0.5"
              strokeWidth={2}
            />
            <p className="text-[#6b5230] text-sm leading-relaxed">
              <strong className="font-semibold">Tip:</strong> For more accurate
              results, please upload up to 3 clear photos of the same skin area
              taken under good lighting.{" "}
              {mobile
                ? "You can capture photos directly or upload from your gallery."
                : "Hold Cmd (Mac) or Ctrl (Windows) to select multiple files."}{" "}
              This helps the AI analyse the spot more precisely.
            </p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          STEP 2 — CROP
      ══════════════════════════════════════════════════════ */}
      {step === 2 && (
        <div className="max-w-2xl mx-auto px-5 py-8">
          {/* Progress Indicator */}
          {allUploadedPhotos.length > 1 && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-blue-900">
                  Photo {currentCropIndex + 1} of {allUploadedPhotos.length}
                </span>
                <span className="text-xs text-blue-600">
                  {allCroppedPhotos.length} cropped
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentCropIndex + 1) / allUploadedPhotos.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          <h1 className="text-3xl font-extrabold text-[#0c1a54] mb-6">
            {allUploadedPhotos.length > 1
              ? `Crop Photo ${currentCropIndex + 1}`
              : "Let's crop the photo!"}
          </h1>

          {/* Thumbnails of already cropped photos */}
          {allCroppedPhotos.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-slate-600 mb-3">
                ✓ Cropped photos:
              </p>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {allCroppedPhotos.map((photo, idx) => (
                  <div key={idx} className="flex-shrink-0 relative">
                    <img
                      src={photo}
                      alt={`Cropped ${idx + 1}`}
                      className="w-20 h-20 rounded-lg object-cover border-2 border-green-500 shadow-sm"
                    />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* crop widget */}
          <div className="mb-5 rounded-xl overflow-hidden shadow-sm">
            <CropImage
              imageUrl={uploadedPhoto}
              zoom={cropZoom}
              position={cropPosition}
              onPositionChange={setCropPosition}
            />
          </div>

          {/* zoom controls */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() =>
                setCropZoom((z) =>
                  Math.max(MIN_ZOOM, parseFloat((z - 0.1).toFixed(2))),
                )
              }
              className="w-9 h-9 rounded-full border-2 border-[#3b5bdb] text-[#3b5bdb]
                flex items-center justify-center shrink-0
                hover:bg-blue-50 transition-colors focus:outline-none"
              aria-label="Zoom out"
            >
              <Minus size={15} strokeWidth={2.5} />
            </button>

            <input
              type="range"
              className="crop-range flex-1"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={ZOOM_STEP}
              value={cropZoom}
              onChange={(e) => setCropZoom(parseFloat(e.target.value))}
              aria-label="Zoom level"
            />

            <button
              onClick={() =>
                setCropZoom((z) =>
                  Math.min(MAX_ZOOM, parseFloat((z + 0.1).toFixed(2))),
                )
              }
              className="w-9 h-9 rounded-full border-2 border-[#3b5bdb] text-[#3b5bdb]
                flex items-center justify-center shrink-0
                hover:bg-blue-50 transition-colors focus:outline-none"
              aria-label="Zoom in"
            >
              <Plus size={15} strokeWidth={2.5} />
            </button>
          </div>

          {/* crop button */}
          <button
            onClick={handleCrop}
            className="
              w-full text-white font-bold
              py-4 px-6 rounded-xl text-base
              transition-all duration-200
              hover:scale-[1.01] active:scale-[0.99]
              focus:outline-none mb-5
            "
            style={{
              background: "linear-gradient(135deg, #5abfbe 0%, #45a8d1 100%)",
              boxShadow: "0 4px 18px rgba(69,168,209,0.40)",
            }}
          >
            Crop Photo
          </button>

          {/* instruction */}
          <p className="text-slate-500 text-sm leading-relaxed text-center">
            Zoom in the skin mark in the center of the crop field. The photo
            should be in focus and free of foreign objects.
          </p>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          STEP 3 — LOADING
      ══════════════════════════════════════════════════════ */}
      {step === 3 && (
        <div className="max-w-2xl mx-auto px-5 py-14">
          <h1 className="text-3xl font-extrabold text-[#0c1a54] mb-10">
            Upload photo
          </h1>

          <div className="border border-slate-200 rounded-xl px-5 pt-4 pb-3 shadow-sm">
            <p className="text-slate-400 text-sm mb-2">Your photo is loading</p>
            {/* progress bar */}
            <div className="w-full h-[3px] bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-[width] duration-[80ms] ease-linear"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          STEP 4 — RESULT
      ══════════════════════════════════════════════════════ */}
      {step === 4 && (
        <div className="max-w-2xl mx-auto px-5 py-12">
          <h1 className="text-3xl font-extrabold text-[#0c1a54] mb-2">
            Upload photo
          </h1>

          {isPhotoSuitable ? (
            /* ── SUITABLE ── */
            <>
              <p className="text-slate-400 text-sm mb-0.5">
                {allCroppedPhotos.length > 1
                  ? `All ${allCroppedPhotos.length} photos are fine.`
                  : allCroppedPhotos.length === 1
                    ? "Your photo is fine."
                    : "Your photo is fine."}
              </p>
              <p className="text-slate-400 text-sm mb-7">
                Click the Button to see the scan result.
              </p>

              {/* photo cards */}
              <div className="space-y-3 mb-10">
                {(allCroppedPhotos.length > 0
                  ? allCroppedPhotos
                  : [croppedPhoto]
                ).map((photo, idx) => (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-sm"
                  >
                    <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-slate-100 bg-slate-50">
                      <img
                        src={photo}
                        alt={`cropped skin ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-[#16a34a] font-semibold text-[15px] flex-1">
                      {allCroppedPhotos.length > 1
                        ? `Photo ${idx + 1} is suitable`
                        : "The photo is suitable"}
                    </p>
                    <Check
                      size={20}
                      className="text-[#16a34a] shrink-0"
                      strokeWidth={2.5}
                    />
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={() => setStep(5)}
                className="
                  w-full bg-[#4a6fdc] hover:bg-[#3b5bdb]
                  text-white font-bold
                  py-4 px-6 rounded-full text-base
                  transition-all duration-200
                  shadow-[0_4px_20px_rgba(59,91,219,0.35)]
                  hover:shadow-[0_6px_28px_rgba(59,91,219,0.45)]
                  hover:scale-[1.01] active:scale-[0.99]
                  focus:outline-none
                "
              >
                Get Result
              </button>
            </>
          ) : (
            /* ── NOT SUITABLE ── */
            <>
              <p className="text-slate-400 text-sm mb-0.5">
                The photo is not suitable.
              </p>
              <p className="text-slate-400 text-sm mb-7">
                Click the Try Again to add other photo
              </p>

              {/* photo card */}
              <div className="border border-slate-200 rounded-xl p-4 flex items-center gap-4 mb-8 shadow-sm">
                <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-slate-100 bg-slate-50">
                  <img
                    src={croppedPhoto}
                    alt="cropped skin"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-[#ef4444] font-semibold text-[15px] flex-1">
                  The photo is not suitable
                </p>
                <X
                  size={20}
                  className="text-[#ef4444] shrink-0"
                  strokeWidth={2.5}
                />
              </div>

              {/* guidelines */}
              <div className="mb-10">
                <p className="text-[#0c1a54] font-bold text-[15px] mb-4">
                  Make sure that:
                </p>
                <ul className="space-y-3.5">
                  {[
                    `the subject is in focus 2-4" (5-10 cm) from the object;`,
                    `located in the center of the frame;`,
                    `there is no hair, jewelry, skin folds in the photo.`,
                  ].map((txt, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0 mt-[6px]" />
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {txt}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <button
                onClick={handleTryAgain}
                className="
                  bg-[#4a6fdc] hover:bg-[#3b5bdb]
                  text-white font-bold
                  py-4 px-14 rounded-full text-base
                  transition-all duration-200
                  shadow-[0_4px_20px_rgba(59,91,219,0.35)]
                  hover:shadow-[0_6px_28px_rgba(59,91,219,0.45)]
                  hover:scale-[1.01] active:scale-[0.99]
                  focus:outline-none
                "
              >
                Try Again
              </button>
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          STEP 5 — ABCDE SCANNING ANIMATION
      ══════════════════════════════════════════════════════ */}
      {step === 5 && (
        <div className="max-w-2xl mx-auto px-5 py-12">
          <h1 className="text-3xl font-extrabold text-[#0c1a54] mb-4">
            {allCroppedPhotos.length > 1
              ? `Analyzing ${allCroppedPhotos.length} photos`
              : allCroppedPhotos.length === 1
                ? "Checking your photo"
                : "Checking your photo"}
          </h1>
          {allCroppedPhotos.length > 1 && (
            <p className="text-slate-500 text-sm mb-6">
              Our AI is examining all {allCroppedPhotos.length} photos for a
              comprehensive analysis
            </p>
          )}

          {/* Image Container with Scanning Line */}
          <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden mb-6 border border-gray-200">
            <div className="relative aspect-[4/3] bg-gray-100">
              {/* Uploaded Photo - Cycles through all cropped photos */}
              <img
                key={`photo-${currentCheckIndex % (allCroppedPhotos.length || 1)}`}
                src={
                  allCroppedPhotos.length > 0
                    ? allCroppedPhotos[
                        currentCheckIndex % allCroppedPhotos.length
                      ]
                    : croppedPhoto ||
                      "https://via.placeholder.com/800x600/f3f4f6/9ca3af?text=Skin+Photo"
                }
                alt={`Skin analysis - Photo ${allCroppedPhotos.length > 0 ? (currentCheckIndex % allCroppedPhotos.length) + 1 : 1}`}
                className="w-full h-full object-cover transition-opacity duration-500 ease-in-out"
                style={{ animation: "fadeIn 0.5s ease-in-out" }}
              />

              {/* Scanning Line - Sky Blue Vertical Line */}
              {isScanning && (
                <div
                  className="absolute top-0 bottom-0 w-1 transition-all duration-75 ease-linear"
                  style={{
                    left: `${scanningLinePosition}%`,
                    background:
                      "linear-gradient(to right, rgba(125, 211, 252, 0.3), rgba(56, 189, 248, 1), rgba(125, 211, 252, 0.3))",
                    boxShadow:
                      "0 0 20px rgba(56, 189, 248, 0.8), 0 0 40px rgba(56, 189, 248, 0.4)",
                    filter: "blur(0.5px)",
                  }}
                >
                  <div
                    className="absolute inset-0 w-full"
                    style={{
                      background: "rgba(56, 189, 248, 0.5)",
                      filter: "blur(8px)",
                    }}
                  ></div>
                </div>
              )}

              {/* Photo Number Indicator Badge with animation */}
              {allCroppedPhotos.length > 1 && (
                <div
                  key={`badge-${currentCheckIndex}`}
                  className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 font-semibold text-sm z-10 animate-pulse"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Photo {(currentCheckIndex % allCroppedPhotos.length) + 1}/
                  {allCroppedPhotos.length}
                </div>
              )}
            </div>

            {/* Current Check Display */}
            {currentCheckIndex < ABCDE_CHECKS.length && (
              <div className="p-6">
                <div className="flex items-start gap-4 bg-gray-50 rounded-xl p-5 border border-gray-200 animate-fadeIn">
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-slate-600 to-slate-800 text-white rounded-lg flex items-center justify-center text-2xl font-bold shadow-md">
                    {ABCDE_CHECKS[currentCheckIndex].id}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-gray-800">
                      {ABCDE_CHECKS[currentCheckIndex].title}
                    </h3>
                    <p className="text-gray-600 text-base mt-2 leading-relaxed">
                      {ABCDE_CHECKS[currentCheckIndex].description}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <svg
                      className="animate-spin h-7 w-7 text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Photo Thumbnails Gallery - Show all analyzed photos with active highlight */}
          {allCroppedPhotos.length > 1 && (
            <div className="mb-8">
              <p className="text-sm font-semibold text-slate-600 mb-3 text-center">
                All {allCroppedPhotos.length} photos being analyzed:
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                {allCroppedPhotos.map((photo, idx) => {
                  const isActive =
                    idx === currentCheckIndex % allCroppedPhotos.length;
                  return (
                    <div
                      key={idx}
                      className={`relative group transition-all duration-300 ${isActive ? "scale-110" : ""}`}
                    >
                      <img
                        src={photo}
                        alt={`Analysis photo ${idx + 1}`}
                        className={`w-24 h-24 rounded-lg object-cover shadow-lg transition-all duration-300 ${
                          isActive
                            ? "border-4 border-green-500 ring-4 ring-green-200"
                            : "border-2 border-blue-500 opacity-60"
                        }`}
                      />
                      <div
                        className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md transition-all duration-300 ${
                          isActive ? "bg-green-600 scale-125" : "bg-blue-600"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      {isActive && (
                        <div className="absolute -top-1 -left-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-center text-green-600 font-semibold mt-2">
                ✓ Currently analyzing: Photo{" "}
                {(currentCheckIndex % allCroppedPhotos.length) + 1}
              </p>
            </div>
          )}

          {/* Disclaimer */}
          <div className="text-center text-gray-500 text-sm px-4 leading-relaxed">
            <p>
              * This scan result is not a diagnosis. To obtain an accurate
              diagnosis and a recommendation for treatment - consult your
              doctor.
            </p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          STEP 6 — RESULT READY
      ══════════════════════════════════════════════════════ */}
      {step === 6 && (
        <div className="max-w-2xl mx-auto px-5 py-8">
          {/* Result is ready section */}
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4 sm:mb-6">
              Result is ready!
            </h2>

            {/* Image with blur effect - Mobile optimized */}
            <div
              className="relative mb-6 mx-auto"
              style={{ maxWidth: "min(90vw, 400px)" }}
            >
              <div className="relative w-full">
                {/* Blurred background */}
                <div
                  className="absolute inset-0 rounded-2xl overflow-hidden -z-10"
                  style={{ filter: "blur(10px)", transform: "scale(1.1)" }}
                >
                  <img
                    src={
                      allCroppedPhotos.length > 0
                        ? allCroppedPhotos[0]
                        : croppedPhoto
                    }
                    alt="Blurred background"
                    className="w-full h-full object-cover opacity-50"
                  />
                </div>

                {/* Sharp center image */}
                <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
                  <img
                    src={
                      allCroppedPhotos.length > 0
                        ? allCroppedPhotos[0]
                        : croppedPhoto
                    }
                    alt="Skin analysis result"
                    className="w-full h-auto object-cover"
                    style={{ aspectRatio: "1 / 1", maxHeight: "400px" }}
                  />
                </div>
              </div>
            </div>

            {/* Show all analyzed photos if multiple */}
            {allCroppedPhotos.length > 1 && (
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-3 text-center">
                  All {allCroppedPhotos.length} photos analyzed:
                </p>
                <div className="flex gap-2 justify-center flex-wrap">
                  {allCroppedPhotos.map((photo, idx) => (
                    <div
                      key={idx}
                      className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-300 shadow-md"
                    >
                      <img
                        src={photo}
                        alt={`Analyzed photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 right-0 bg-blue-600 text-white text-xs w-5 h-5 flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Assessment - Blurred */}
            <div
              className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 text-left mx-auto"
              style={{ filter: "blur(5px)", maxWidth: "min(90vw, 500px)" }}
            >
              <p className="text-red-600 font-semibold text-sm sm:text-base mb-2">
                Risk assessment:
              </p>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                You-Are-At-High-Disease-High-risk-ABCDE-We diagnosed skin mole
                indicate cancer, Asymmetry (A), Border (B), Color (C), Diameter
                (D), Evolving (E). You-should-seek to dermatologist or doctor
                consultancy immediately.
              </p>
            </div>

            {/* View Result Button - Mobile optimized */}
            <button
              onClick={async () => {
                try {
                  setLoadingProgress(true);

                  // Prepare FormData for multipart/form-data upload
                  const formData = new FormData();

                  // Determine which images to upload
                  let imagesToConvert =
                    allUploadedFiles.length > 0 ? allUploadedFiles : [];

                  // If no File objects, try to convert from base64 (sessionStorage images)
                  if (
                    imagesToConvert.length === 0 &&
                    allUploadedPhotos.length > 0
                  ) {
                    imagesToConvert = allUploadedPhotos.map((base64, index) => {
                      // Check if it's already a File object
                      if (base64 instanceof File) {
                        return base64;
                      }
                      // Convert base64 to File object
                      return base64ToFile(base64, `photo_${index + 1}.jpg`);
                    });
                  }

                  const maxImages = Math.min(imagesToConvert.length, 3);

                  // Append File objects to FormData
                  const filesToUpload = [];
                  for (let i = 0; i < maxImages; i++) {
                    const file = imagesToConvert[i];
                    filesToUpload.push(file);
                    formData.append("photos", file);
                  }

                  // Debug log
                  console.log(
                    "Uploading files:",
                    filesToUpload,
                    filesToUpload[0] instanceof File,
                  );

                  // Prepare sessionData object
                  const currentSession = localStorage.getItem("currentSession");
                  const sessionData = {
                    sessionId: currentSession
                      ? JSON.parse(currentSession).id
                      : null,
                    timestamp: new Date().toISOString(),
                    photoCount: maxImages,
                  };

                  // Append sessionData as JSON string
                  formData.append("sessionData", JSON.stringify(sessionData));

                  // Call backend API
                  const apiUrl = `${API_CONFIG.BASE_URL}/api/analyze-photo/public`;

                  const uploadResponse = await fetch(apiUrl, {
                    method: "POST",
                    body: formData,
                    credentials: "include",
                  });

                  if (!uploadResponse.ok) {
                    throw new Error(`API error: ${uploadResponse.statusText}`);
                  }

                  const analysisResult = await uploadResponse.json();

                  // Save full backend response to localStorage
                  localStorage.setItem(
                    "latestAnalysisResult",
                    JSON.stringify(analysisResult),
                  );

                  // Add to global scan history
                  const scanHistory = JSON.parse(
                    localStorage.getItem("scanHistory") || "[]",
                  );
                  const imagesToUpload =
                    allCroppedPhotos.length > 0
                      ? allCroppedPhotos
                      : [croppedPhoto];
                  const newScan = {
                    timestamp: new Date().toISOString(),
                    condition: analysisResult.analysis?.condition || "Unknown",
                    confidence: analysisResult.analysis?.confidence || 0,
                    severity: analysisResult.analysis?.severity || "unknown",
                    riskLevel: analysisResult.analysis?.riskLevel || "low",
                    bodyArea: analysisResult.analysis?.bodyArea || "Unknown",
                    photos: imagesToUpload.slice(0, maxImages),
                    photoCount: maxImages,
                  };
                  scanHistory.push(newScan);
                  localStorage.setItem(
                    "scanHistory",
                    JSON.stringify(scanHistory),
                  );

                  // Also add to session-specific history if in a session
                  if (currentSession) {
                    const sessionDataParsed = JSON.parse(currentSession);
                    const sessionKey = `session_${sessionDataParsed.id}_scans`;
                    const sessionScans = JSON.parse(
                      localStorage.getItem(sessionKey) || "[]",
                    );
                    sessionScans.push(newScan);
                    localStorage.setItem(
                      sessionKey,
                      JSON.stringify(sessionScans),
                    );
                  }

                  // Navigate to result page
                  navigate("/result-ready");
                } catch (error) {
                  alert(`Failed to analyze photo: ${error.message}`);
                  setLoadingProgress(false);
                }
              }}
              className="w-full max-w-md mx-auto bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 mb-3 sm:mb-4"
            >
              View result
            </button>

            {/* Disclaimer */}
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed px-4">
              * This scan result is not a diagnosis. To obtain an accurate
              diagnosis and a recommendation for treatment - consult your
              doctor.
            </p>
          </div>

          {/* Marketing Section - Collapsed on mobile */}
          <div
            id="marketing-section"
            className="border-t border-gray-200 pt-6 mt-6 sm:pt-8 sm:mt-8"
          >
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
              Know what's happening to your skin within 60 seconds.
            </h3>

            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Join <span className="font-bold text-gray-800">1,000+</span>{" "}
              people who trust SkinX.
            </p>

            {/* Features List */}
            <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="mt-0.5 sm:mt-1">
                  <Check
                    className="w-4 h-4 sm:w-5 sm:h-5 text-green-500"
                    strokeWidth={3}
                  />
                </div>
                <div className="text-sm sm:text-base">
                  <span className="font-semibold text-gray-800">
                    AI-Powered Skin Check
                  </span>
                  <span className="text-gray-600">
                    {" "}
                    — Instant, 84% accurate results
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 sm:gap-3">
                <div className="mt-0.5 sm:mt-1">
                  <Check
                    className="w-4 h-4 sm:w-5 sm:h-5 text-green-500"
                    strokeWidth={3}
                  />
                </div>
                <div className="text-sm sm:text-base">
                  <span className="font-semibold text-gray-800">
                    Several types skin cancer
                  </span>
                  <span className="text-gray-600">
                    {" "}
                    — From melanoma to basal cell carcinoma
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 sm:gap-3">
                <div className="mt-0.5 sm:mt-1">
                  <Check
                    className="w-4 h-4 sm:w-5 sm:h-5 text-green-500"
                    strokeWidth={3}
                  />
                </div>
                <div className="text-sm sm:text-base">
                  <span className="font-semibold text-gray-800">
                    Track Skin Changes
                  </span>
                  <span className="text-gray-600">
                    {" "}
                    — Monitor and compare over time
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 sm:gap-3">
                <div className="mt-0.5 sm:mt-1">
                  <Check
                    className="w-4 h-4 sm:w-5 sm:h-5 text-green-500"
                    strokeWidth={3}
                  />
                </div>
                <div className="text-sm sm:text-base">
                  <span className="font-semibold text-gray-800">
                    Clinically Validated
                  </span>
                  <span className="text-gray-600">
                    {" "}
                    — Trusted by dermatologists worldwide
                  </span>
                </div>
              </div>
            </div>

            {/* Your scan result section */}
            <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
              <h4 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                Your scan result
              </h4>
              <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
                Just take a photo. Our advanced AI provides an instant,
                confidential assessment.
              </p>

              <div className="rounded-xl overflow-hidden mb-3 sm:mb-4 bg-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=300&fit=crop"
                  alt="Doctor examining patient"
                  className="w-full h-auto object-cover"
                  style={{ aspectRatio: "2/1", maxHeight: "200px" }}
                />
              </div>

              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-full text-sm sm:text-base shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Continue
              </button>
            </div>

            {/* Testimonials Section - Carousel */}
            <div className="text-center mb-6 sm:mb-8">
              <h4 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
                84% of users trust SkinX
              </h4>

              {/* Single Testimonial Card - Mobile optimized */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 md:p-8 shadow-sm max-w-md mx-auto">
                <p className="font-bold text-gray-800 text-base sm:text-lg mb-2 sm:mb-3">
                  {testimonials[currentTestimonialIndex].name}
                </p>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
                  {testimonials[currentTestimonialIndex].text}
                </p>

                {/* Star Rating */}
                <div className="flex justify-center gap-1 mb-3 sm:mb-4">
                  {[...Array(testimonials[currentTestimonialIndex].stars)].map(
                    (_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ),
                  )}
                </div>

                {/* Pagination Dots */}
                <div className="flex justify-center gap-2">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentTestimonialIndex(i)}
                      className={`h-2 rounded-full transition-all ${
                        i === currentTestimonialIndex
                          ? "bg-blue-500 w-6"
                          : "bg-gray-300 w-2"
                      }`}
                      aria-label={`View testimonial ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
