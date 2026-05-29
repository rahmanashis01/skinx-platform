import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Download,
  ArrowLeft,
  Info,
} from "lucide-react";
import logoImg from "../assets/logo.png";

const ResultReady = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRejected, setIsRejected] = useState(false);
  const pdfContentRef = useRef(null);

  useEffect(() => {
    const analysisData = localStorage.getItem("latestAnalysisResult");

    if (!analysisData) {
      setTimeout(() => navigate("/session/workspace"), 2000);
      return;
    }

    try {
      const data = JSON.parse(analysisData);
      
      // Check if result is rejected/uncertain
      const rejected = data.success === false || 
                      data.rejected === true ||
                      data.reason === "non_skin_image" ||
                      data.reason === "uncertain_or_non_lesion_image";
      
      setIsRejected(rejected);
      setResult(data);
    } catch (err) {
      console.error("Error parsing result:", err);
      navigate("/session/workspace");
    }
    setLoading(false);
  }, [navigate]);

  const handleDownloadPDF = () => {
    document.body.classList.add('printing-pdf');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-pdf');
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-4">No analysis data found</p>
          <button
            onClick={() => navigate("/session/workspace")}
            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          >
            Back to Session
          </button>
        </div>
      </div>
    );
  }

  // Handle rejected/uncertain results
  if (isRejected) {
    const rejectionReason = result.reason || "unknown";
    const messageText = result.message || 
      (rejectionReason === "non_skin_image" 
        ? "The uploaded image does not appear to contain a valid skin region. Please upload a clear skin/lesion photo."
        : "The image could not be confidently analyzed as a skin lesion. Please upload a clear close-up photo of the skin spot or lesion.");

    return (
      <>
        <style>{`
          @media print {
            body { margin: 0; padding: 0; background: white; }
            .no-print { display: none !important; }
            .print-only { display: block !important; }
            .max-w-4xl { max-width: 100% !important; }
            nav, button { display: none !important; }
          }
          @page { margin: 1cm; }
        `}</style>

        <div className="min-h-screen py-8 px-4" style={{background: "#e8f4fc"}}>
          <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3 mb-8 rounded-lg shadow-sm max-w-4xl mx-auto no-print">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate("/session/workspace")}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <ArrowLeft size={20} />
                Back to Session
              </button>
              <div className="flex items-center gap-2">
                <img src={logoImg} alt="SkinX" className="w-8 h-6 object-contain" />
                <span className="font-bold text-gray-800">SkinX</span>
              </div>
            </div>
          </nav>

          <div className="max-w-4xl mx-auto space-y-6">
            <div ref={pdfContentRef} style={{backgroundColor: '#f0f8ff', color: '#1f2937'}}>
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <img src={logoImg} alt="SkinX" className="w-10 h-8 object-contain" />
                  <span className="font-bold text-2xl" style={{color: '#1f2937'}}>SkinX</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{color: '#111827'}}>
                  Skin Analysis Report
                </h1>
                <p className="text-lg" style={{color: '#4b5563'}}>
                  AI-assisted skin analysis results
                </p>
              </div>

              <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-8 text-center">
                <div className="flex justify-center mb-6">
                  <AlertCircle size={80} className="text-amber-600" />
                </div>

                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-amber-900">
                  Unable to Confidently Analyze This Image
                </h2>

                <p className="text-lg text-amber-800 mb-6 leading-relaxed">
                  {messageText}
                </p>

                <div className="mb-6">
                  <p className="text-sm text-amber-700 mb-2 font-medium">
                    Analysis Confidence
                  </p>
                  <div className="inline-block">
                    <span className="text-3xl font-bold text-amber-900">
                      Not Enough Confidence
                    </span>
                  </div>
                </div>

                <div className="inline-block">
                  <span className="inline-block px-6 py-2 rounded-full font-bold text-lg text-amber-900 bg-amber-100 border-2 border-amber-400">
                    Status: Unable to Analyze
                  </span>
                </div>
              </div>

              {rejectionReason === "uncertain_or_non_lesion_image" && (
                <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200 mt-6">
                  <h3 className="font-bold text-xl mb-4 text-blue-900 flex items-center gap-2">
                    <Info size={24} />
                    Why This Image Could Not Be Analyzed
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex gap-3 text-blue-900">
                      <span className="font-bold text-blue-600 flex-shrink-0">•</span>
                      <span className="text-base">Classification confidence was too low to make a reliable assessment</span>
                    </li>
                    <li className="flex gap-3 text-blue-900">
                      <span className="font-bold text-blue-600 flex-shrink-0">•</span>
                      <span className="text-base">The image may not show a clear skin lesion or may be ambiguous</span>
                    </li>
                    <li className="flex gap-3 text-blue-900">
                      <span className="font-bold text-blue-600 flex-shrink-0">•</span>
                      <span className="text-base">Image quality or lighting may need improvement</span>
                    </li>
                  </ul>
                </div>
              )}

              {rejectionReason === "non_skin_image" && (
                <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200 mt-6">
                  <h3 className="font-bold text-xl mb-4 text-blue-900 flex items-center gap-2">
                    <Info size={24} />
                    Why This Image Could Not Be Analyzed
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex gap-3 text-blue-900">
                      <span className="font-bold text-blue-600 flex-shrink-0">•</span>
                      <span className="text-base">Image does not appear to contain visible skin</span>
                    </li>
                    <li className="flex gap-3 text-blue-900">
                      <span className="font-bold text-blue-600 flex-shrink-0">•</span>
                      <span className="text-base">May be a photo of text, objects, or non-skin content</span>
                    </li>
                    <li className="flex gap-3 text-blue-900">
                      <span className="font-bold text-blue-600 flex-shrink-0">•</span>
                      <span className="text-base">Please upload a clear photo of skin or a skin lesion</span>
                    </li>
                  </ul>
                </div>
              )}

              <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200 mt-6">
                <h3 className="font-bold text-xl mb-4 text-green-900">
                  📸 How to Take a Better Photo
                </h3>
                <ul className="space-y-3">
                  <li className="flex gap-3 text-green-900">
                    <span className="font-bold text-green-600 flex-shrink-0">1.</span>
                    <span className="text-base">Use natural lighting or good indoor lighting</span>
                  </li>
                  <li className="flex gap-3 text-green-900">
                    <span className="font-bold text-green-600 flex-shrink-0">2.</span>
                    <span className="text-base">Get a close-up shot of the skin area or lesion</span>
                  </li>
                  <li className="flex gap-3 text-green-900">
                    <span className="font-bold text-green-600 flex-shrink-0">3.</span>
                    <span className="text-base">Ensure the entire lesion or affected area is visible and in focus</span>
                  </li>
                  <li className="flex gap-3 text-green-900">
                    <span className="font-bold text-green-600 flex-shrink-0">4.</span>
                    <span className="text-base">Avoid shadows, glare, or blurry photos</span>
                  </li>
                  <li className="flex gap-3 text-green-900">
                    <span className="font-bold text-green-600 flex-shrink-0">5.</span>
                    <span className="text-base">Try again with a clearer image</span>
                  </li>
                </ul>
              </div>

              <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200 mt-6">
                <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                  <AlertCircle size={24} />
                  Medical Disclaimer - IMPORTANT
                </h3>
                <p className="text-red-800 text-base leading-relaxed font-medium">
                  ⚠️ This analysis is <strong>NOT a medical diagnosis</strong>. It is
                  an AI-assisted assessment only based on image analysis. Results should <strong>NOT replace professional medical evaluation</strong>.
                </p>
                <ul className="text-red-800 text-base mt-3 space-y-2 ml-4">
                  <li>✓ Accurate clinical diagnosis</li>
                  <li>✓ Treatment recommendations</li>
                  <li>✓ Professional medical advice</li>
                </ul>
              </div>

              <div className="text-center mt-8 pb-4 border-t pt-4">
                <p className="text-gray-600 text-sm font-medium">
                  Session Analysis • {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="no-print flex flex-col md:flex-row gap-4 justify-center pt-8">
              <button
                onClick={() => navigate("/session/workspace")}
                className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
              >
                Back to Session
              </button>

              <button
                onClick={() => navigate("/session/scan")}
                className="px-8 py-4 bg-green-600 text-white rounded-full font-bold text-lg hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg"
              >
                Try Again with Better Photo
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Handle normal results - existing code continues
  const analysis = result.analysis || result.prediction || {};
  const suggestions = result.suggestions || [];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "severe":
        return {
          bg: "bg-red-50",
          border: "border-red-300",
          text: "text-red-800",
          icon: "text-red-600",
        };
      case "moderate":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-300",
          text: "text-yellow-800",
          icon: "text-yellow-600",
        };
      case "mild":
        return {
          bg: "bg-blue-50",
          border: "border-blue-300",
          text: "text-blue-800",
          icon: "text-blue-600",
        };
      default:
        return {
          bg: "bg-green-50",
          border: "border-green-300",
          text: "text-green-800",
          icon: "text-green-600",
        };
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case "high":
        return <AlertTriangle size={40} className="text-red-600" />;
      case "medium":
        return <AlertCircle size={40} className="text-yellow-600" />;
      default:
        return <CheckCircle size={40} className="text-green-600" />;
    }
  };

  const severityColor = getSeverityColor(analysis.severity);

  return (
    <>
      <style>{`
        @media print {
          body { margin: 0; padding: 0; background: white; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .max-w-4xl { max-width: 100% !important; }
          nav, button { display: none !important; }
        }
        @page { margin: 1cm; }
      `}</style>

      <div className="min-h-screen py-8 px-4" style={{background: "#e8f4fc"}}>
        <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3 mb-8 rounded-lg shadow-sm max-w-4xl mx-auto no-print">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/session/workspace")}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <ArrowLeft size={20} />
              Back to Session
            </button>
            <div className="flex items-center gap-2">
              <img src={logoImg} alt="SkinX" className="w-8 h-6 object-contain" />
              <span className="font-bold text-gray-800">SkinX</span>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto space-y-6">
          <div ref={pdfContentRef} style={{backgroundColor: '#f0f8ff', color: '#1f2937'}}>
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <img src={logoImg} alt="SkinX" className="w-10 h-8 object-contain" />
                <span className="font-bold text-2xl" style={{color: '#1f2937'}}>SkinX</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{color: '#111827'}}>
                Skin Analysis Report
              </h1>
              <p className="text-lg" style={{color: '#4b5563'}}>
                AI-assisted skin analysis results
              </p>
            </div>

            <div
              className={`rounded-2xl border-2 p-8 text-center ${severityColor.bg} ${severityColor.border}`}
              style={{
                backgroundColor: analysis.severity === 'severe' ? '#fef2f2' : analysis.severity === 'moderate' ? '#fffbeb' : '#eff6ff',
                borderColor: analysis.severity === 'severe' ? '#fca5a5' : analysis.severity === 'moderate' ? '#fcd34d' : '#93c5fd',
              }}
            >
              <div className="flex justify-center mb-6">
                {analysis.severity === "severe" ? (
                  <AlertTriangle size={80} className={severityColor.icon} />
                ) : analysis.severity === "moderate" ? (
                  <AlertCircle size={80} className={severityColor.icon} />
                ) : (
                  <CheckCircle size={80} className={severityColor.icon} />
                )}
              </div>

              <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${severityColor.text}`}>
                {analysis.class_name || analysis.condition || "Unknown"}
              </h2>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2 font-medium">
                  Analysis Confidence Level
                </p>
                <div className="w-full bg-gray-300 rounded-full h-4 mb-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-teal-500 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${(analysis.confidence || 0.85) * 100}%` }}
                  />
                </div>
                <p className={`font-bold text-2xl ${severityColor.text}`}>
                  {((analysis.confidence || 0.85) * 100).toFixed(0)}%
                </p>
              </div>

              <div className="inline-block">
                <span
                  className={`inline-block px-6 py-2 rounded-full font-bold text-lg ${severityColor.text} ${severityColor.bg} border-2 ${severityColor.border}`}
                >
                  Severity: {(analysis.severity || analysis.risk_level || "unknown").toUpperCase()}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-bold text-xl mb-4 text-gray-900">
                Assessment Details
              </h3>
              <p className="text-gray-700 leading-relaxed text-base">
                {analysis.description || analysis.report?.Findings || "No description available for this analysis."}
              </p>
            </div>

            <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
              <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                <AlertCircle size={24} />
                Medical Disclaimer - IMPORTANT
              </h3>
              <p className="text-red-800 text-base leading-relaxed font-medium">
                ⚠️ This analysis is <strong>NOT a medical diagnosis</strong>. It is
                an AI-assisted assessment only based on image analysis. Results should <strong>NOT replace professional medical evaluation</strong>.
              </p>
            </div>

            <div className="text-center mt-8 pb-4 border-t pt-4">
              <p className="text-gray-600 text-sm font-medium">
                Session Analysis • {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="no-print flex flex-col md:flex-row gap-4 justify-center pt-8">
            <button
              onClick={() => navigate("/session/workspace")}
              className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Back to Session
            </button>

            <button
              onClick={handleDownloadPDF}
              data-download-btn
              className="px-8 py-4 bg-gray-600 text-white rounded-full font-bold text-lg hover:bg-gray-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              <Download size={20} />
              Download Report
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResultReady;
