import { useRef, useState } from "react";
import { Camera, Upload, User } from "lucide-react";

export default function Step1_WideShot({ onNext, updateCheckupData }) {
  const cameraRef = useRef(null);
  const uploadRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileObject, setFileObject] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Store the raw File object
    setFileObject(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    setPreviewUrl(null);
    setFileObject(null);
    if (cameraRef.current) {
      cameraRef.current.value = "";
    }
    if (uploadRef.current) {
      uploadRef.current.value = "";
    }
  };

  const handleConfirm = () => {
    if (fileObject) {
      updateCheckupData({ wide_shot: fileObject });
      onNext();
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
          Step 1: Wide Context Shot
        </h1>

        {/* Instruction 1 */}
        <p className="text-slate-300 text-base">
          Hold your phone back to show where this mark is located on your body.
        </p>

        {/* Instruction 2: Laptop Callout */}
        <div className="bg-blue-900/30 border border-blue-700/50 p-3 rounded-lg">
          <p className="text-sm text-blue-200">
            Using a laptop? Please upload a previously captured photo from your phone for better positioning.
          </p>
        </div>

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
            {/* Image Preview Container */}
            <div className="w-full aspect-square bg-slate-900 rounded-lg border border-slate-700 overflow-hidden relative">
              <img
                src={previewUrl}
                alt="Wide shot preview"
                className="w-full h-full object-contain"
              />
              {/* User Icon Overlay as Silhouette */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <User
                  className="w-1/2 h-1/2 text-slate-500 opacity-20"
                  style={{ width: "160px", height: "160px" }}
                  strokeWidth={1}
                />
              </div>
            </div>

            {/* Post-Capture Controls */}
            <div className="flex gap-3">
              <button
                onClick={handleRetake}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 min-h-[56px]"
              >
                Retake
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 min-h-[56px] shadow-md hover:shadow-lg"
              >
                Confirm Context
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
