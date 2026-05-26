import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const abcdeChecks = [
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

export default function Step4_Results() {
  const navigate = useNavigate();
  const [scanningLinePosition, setScanningLinePosition] = useState(0);
  const [currentCheckIndex, setCurrentCheckIndex] = useState(0);
  const [isScanning, setIsScanning] = useState(true);
  const [completedChecks, setCompletedChecks] = useState([]);

  // Animate scanning line continuously
  useEffect(() => {
    if (!isScanning) return;

    const interval = setInterval(() => {
      setScanningLinePosition((prev) => {
        if (prev >= 100) {
          return 0;
        }
        return prev + 1;
      });
    }, 25);

    return () => clearInterval(interval);
  }, [isScanning]);

  // Progress through checks
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentCheckIndex < abcdeChecks.length) {
        setCompletedChecks((prev) => [...prev, abcdeChecks[currentCheckIndex]]);
        setCurrentCheckIndex((prev) => prev + 1);
      } else {
        setIsScanning(false);
      }
    }, 2500); // 2.5 seconds per check

    return () => clearTimeout(timer);
  }, [currentCheckIndex]);

  const currentCheck =
    currentCheckIndex < abcdeChecks.length
      ? abcdeChecks[currentCheckIndex]
      : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold">AI Dermatologist</h1>
            <p className="text-sm text-gray-300">Skin Scanner</p>
          </div>
        </div>
        <div className="text-sm text-gray-300">Lang: En</div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8">
          Checking your photo
        </h2>

        {/* Image Container with Scanning Line */}
        <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden mb-6 border border-gray-200">
          <div className="relative aspect-[4/3] bg-gray-100">
            {/* Placeholder for uploaded image */}
            <img
              src="https://via.placeholder.com/800x600/f3f4f6/9ca3af?text=Skin+Photo"
              alt="Skin analysis"
              className="w-full h-full object-cover"
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
          </div>

          {/* Current Check Display */}
          {currentCheck && (
            <div className="p-6">
              <div className="flex items-start gap-4 bg-gray-50 rounded-xl p-5 border border-gray-200 animate-fadeIn">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-slate-600 to-slate-800 text-white rounded-lg flex items-center justify-center text-2xl font-bold shadow-md">
                  {currentCheck.id}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-800">
                    {currentCheck.title}
                  </h3>
                  <p className="text-gray-600 text-base mt-2 leading-relaxed">
                    {currentCheck.description}
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

          {/* Show completed checks summary when done */}
          {!isScanning && (
            <div className="p-6 space-y-3">
              {completedChecks.map((check) => (
                <div
                  key={check.id}
                  className="flex items-start gap-4 bg-gray-50 rounded-xl p-4 border border-gray-200"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg flex items-center justify-center text-xl font-bold shadow-md">
                    {check.id}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800">
                      {check.title}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {check.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="text-center text-gray-500 text-sm px-4 leading-relaxed">
          <p>
            * This scan result is not a diagnosis. To obtain an accurate
            diagnosis and a recommendation for treatment - consult your doctor.
          </p>
        </div>

        {/* Continue Button (shown after scanning completes) */}
        {!isScanning && completedChecks.length === abcdeChecks.length && (
          <div className="mt-8 flex justify-center animate-fadeIn">
            <button
              onClick={() => navigate("/result-ready")}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-12 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              View Complete Results
            </button>
          </div>
        )}
      </div>

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
