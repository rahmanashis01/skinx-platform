import { useRef, useState, useEffect } from "react";
import { Camera, Upload } from "lucide-react";
import { drawReticleOverlay, cropToBlob } from "../utils/canvasMath";

export default function Step2_Reticle({ onNext, updateCheckupData }) {
  const cameraRef = useRef(null);
  const uploadRef = useRef(null);
  const canvasRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileObject, setFileObject] = useState(null);

  // Canvas state
  const [image, setImage] = useState(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState(null);
  const [lastTouchPos, setLastTouchPos] = useState(null);

  const RETICLE_RADIUS = 80; // pixels

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileObject(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result);
      const img = new window.Image();
      img.onload = () => {
        setImage(img);
        setScale(1);
        setPosition({ x: 0, y: 0 });
      };
      img.src = event.target?.result;
    };
    reader.readAsDataURL(file);
  };

  // Draw the image with transformations + reticle overlay
  useEffect(() => {
    if (!canvasRef.current || !image) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size (square aspect)
    canvas.width = 400;
    canvas.height = 400;

    // Clear canvas
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw image with transformation
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(scale, scale);
    ctx.translate(position.x, position.y);
    ctx.drawImage(
      image,
      -image.width / 2,
      -image.height / 2,
      image.width,
      image.height
    );
    ctx.restore();

    // Draw reticle overlay
    drawReticleOverlay(ctx, canvas.width, canvas.height, RETICLE_RADIUS);
  }, [image, scale, position]);

  // Touch handling
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setLastTouchPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      setLastTouchDistance(Math.sqrt(dx * dx + dy * dy));
    }
  };

  const handleTouchMove = (e) => {
    e.preventDefault();

    if (e.touches.length === 1 && lastTouchPos) {
      // 1-finger pan
      const deltaX = e.touches[0].clientX - lastTouchPos.x;
      const deltaY = e.touches[0].clientY - lastTouchPos.y;
      setPosition((prev) => ({
        x: prev.x + deltaX / 50,
        y: prev.y + deltaY / 50,
      }));
      setLastTouchPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else if (e.touches.length === 2 && lastTouchDistance) {
      // 2-finger pinch zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDistance = Math.sqrt(dx * dx + dy * dy);
      const scaleChange = currentDistance / lastTouchDistance;
      setScale((prev) => Math.max(0.5, Math.min(5, prev * scaleChange)));
      setLastTouchDistance(currentDistance);
    }
  };

  const handleTouchEnd = () => {
    setLastTouchPos(null);
    setLastTouchDistance(null);
  };

  const handleRetake = () => {
    setPreviewUrl(null);
    setFileObject(null);
    setImage(null);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    if (cameraRef.current) cameraRef.current.value = "";
    if (uploadRef.current) uploadRef.current.value = "";
  };

  const handleCropConfirm = async () => {
    if (!canvasRef.current) return;

    try {
      const blob = await cropToBlob(canvasRef.current, RETICLE_RADIUS);

      // Convert Blob to File
      const file = new File([blob], "straight_shot.jpg", { type: "image/jpeg" });

      // Save and advance
      updateCheckupData({ straight_shot: file });
      onNext();
    } catch (error) {
      console.error("Crop failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto w-full flex flex-col gap-6">
        {/* Hidden Inputs */}
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileSelect}
        />
        <input
          ref={uploadRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Header */}
        <h1 className="text-2xl font-bold text-slate-50">
          Step 2: Straight Close-Up
        </h1>

        {/* Instruction */}
        <p className="text-slate-300 text-base">
          Hold the camera about 10cm away. Take a clear, focused photo of the
          mole.
        </p>

        {/* Pre-Capture UI: Buttons */}
        {!previewUrl ? (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => cameraRef.current?.click()}
              className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 min-h-[56px] shadow-md hover:shadow-lg"
            >
              <Camera className="w-5 h-5" />
              Open Camera
            </button>
            <button
              onClick={() => uploadRef.current?.click()}
              className="w-full flex items-center justify-center gap-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 min-h-[56px]"
            >
              <Upload className="w-5 h-5" />
              Upload Photo
            </button>
          </div>
        ) : (
          <>
            {/* Canvas Instructions */}
            <p className="text-slate-300 text-sm bg-slate-900/50 p-3 rounded-lg border border-slate-700">
              Use two fingers to pinch and zoom. Drag to fit the mole exactly
              inside the circle.
            </p>

            {/* Canvas */}
            <canvas
              ref={canvasRef}
              className="w-full aspect-square bg-black rounded-lg overflow-hidden border border-slate-700 touch-none"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />

            {/* Controls */}
            <div className="flex gap-3">
              <button
                onClick={handleRetake}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 min-h-[56px]"
              >
                Retake
              </button>
              <button
                onClick={handleCropConfirm}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 min-h-[56px] shadow-md hover:shadow-lg"
              >
                Crop & Confirm
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
