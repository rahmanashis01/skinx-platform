import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Download,
  ArrowLeft,
} from "lucide-react";
import logoImg from "../assets/logo.png";

const ResultReady = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const pdfContentRef = useRef(null);

  useEffect(() => {
    // Get analysis result from SessionWorkspace
    const analysisData = localStorage.getItem("latestAnalysisResult");

    if (!analysisData) {
      // If no data, redirect back
      setTimeout(() => navigate("/session/workspace"), 2000);
      return;
    }

    try {
      const data = JSON.parse(analysisData);
      setResult(data);
    } catch (err) {
      console.error("Error parsing result:", err);
      navigate("/session/workspace");
    }
    setLoading(false);
  }, [navigate]);

  const handleDownloadPDF = () => {
    // Add print-specific class to body
    document.body.classList.add('printing-pdf');

    // Trigger browser print dialog
    // User can save as PDF from the print dialog
    window.print();

    // Remove print class after dialog closes
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
          <p className="text-red-600 font-medium mb-4">
            No analysis data found
          </p>
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

  const analysis = result.analysis;
  const suggestions = result.suggestions || [];

  // Determine severity colors
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
      {/* Print-specific styles */}
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

    <div
      className="min-h-screen py-8 px-4"
      style={{
        background: "#e8f4fc",
      }}
    >
      {/* Navigation Bar */}
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
        {/* PDF Content Wrapper */}
        <div
          ref={pdfContentRef}
          style={{
            backgroundColor: '#f0f8ff',
            color: '#1f2937',
          }}
        >
          {/* Header Section */}
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

        {/* Main Result Card */}
        <div
          className={`rounded-2xl border-2 p-8 text-center ${severityColor.bg} ${severityColor.border}`}
          style={{
            backgroundColor: analysis.severity === 'severe' ? '#fef2f2' : analysis.severity === 'moderate' ? '#fffbeb' : '#eff6ff',
            borderColor: analysis.severity === 'severe' ? '#fca5a5' : analysis.severity === 'moderate' ? '#fcd34d' : '#93c5fd',
          }}
        >
          {/* Severity Icon */}
          <div className="flex justify-center mb-6">
            {analysis.severity === "severe" ? (
              <AlertTriangle size={80} className={severityColor.icon} />
            ) : analysis.severity === "moderate" ? (
              <AlertCircle size={80} className={severityColor.icon} />
            ) : (
              <CheckCircle size={80} className={severityColor.icon} />
            )}
          </div>

          {/* Primary Condition */}
          <h2
            className={`text-3xl md:text-4xl font-bold mb-4 ${severityColor.text}`}
          >
            {analysis.condition}
          </h2>

          {/* Confidence Score with Progress Bar */}
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

          {/* Severity Badge */}
          <div className="inline-block">
            <span
              className={`inline-block px-6 py-2 rounded-full font-bold text-lg ${severityColor.text} ${severityColor.bg} border-2 ${severityColor.border}`}
            >
              Severity: {(analysis.severity || "unknown").toUpperCase()}
            </span>
          </div>
        </div>

        {/* Description Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="font-bold text-xl mb-4 text-gray-900">
            Assessment Details
          </h3>
          <p className="text-gray-700 leading-relaxed text-base">
            {analysis.description ||
              "No description available for this analysis."}
          </p>
        </div>

        {/* Key Observations */}
        {analysis.observations && analysis.observations.length > 0 && (
          <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
            <h3 className="font-bold text-xl mb-4 text-blue-900 flex items-center gap-2">
              <span className="bg-blue-200 rounded-full w-8 h-8 flex items-center justify-center">
                👁️
              </span>
              Key Observations
            </h3>
            <ul className="space-y-3">
              {analysis.observations.map((obs, idx) => (
                <li key={idx} className="flex gap-3 text-blue-900">
                  <span className="font-bold text-blue-600 flex-shrink-0">
                    {idx + 1}.
                  </span>
                  <span className="text-base">{obs}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Risk Level Assessment */}
        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-red-500">
          <h3 className="font-bold text-xl mb-4 text-gray-900 flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            Risk Assessment
          </h3>
          <div className="flex items-center gap-4">
            {getRiskIcon(analysis.riskLevel || "low")}
            <div className="text-left">
              <p className="text-sm text-gray-600 font-medium">
                Current Risk Level
              </p>
              <p
                className={`text-3xl font-bold uppercase ${
                  analysis.riskLevel === "high"
                    ? "text-red-600"
                    : analysis.riskLevel === "medium"
                      ? "text-yellow-600"
                      : "text-green-600"
                }`}
              >
                {analysis.riskLevel || "low"}
              </p>
            </div>
          </div>
        </div>

        {/* Doctor Consultation Suggestions */}
        {suggestions && suggestions.length > 0 && (
          <div className="bg-amber-50 rounded-xl p-6 border-2 border-amber-200">
            <h3 className="font-bold text-xl mb-4 text-amber-900 flex items-center gap-2">
              <span className="text-2xl">👨‍⚕️</span>
              Doctor Consultation Suggestions
            </h3>
            <div className="space-y-3">
              {suggestions.map((suggestion, idx) => (
                <div key={idx} className="flex gap-4 bg-white rounded-lg p-4">
                  <span className="font-bold text-amber-600 flex-shrink-0 text-lg">
                    {idx + 1}.
                  </span>
                  <p className="text-amber-900 text-base">
                    {suggestion.text || suggestion}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Possible Conditions */}
        {analysis.possibleConditions &&
          analysis.possibleConditions.length > 0 && (
            <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
              <h3 className="font-bold text-xl mb-4 text-purple-900">
                Other Possible Conditions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.possibleConditions.map((cond, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-lg p-4 border border-purple-200"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold text-gray-900">{cond.name}</p>
                      <span className="text-sm font-bold text-purple-600">
                        {((cond.confidence || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${(cond.confidence || 0) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Medical Disclaimer */}
        <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
          <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">
            <AlertCircle size={24} />
            Medical Disclaimer - IMPORTANT
          </h3>
          <p className="text-red-800 text-base leading-relaxed font-medium">
            ⚠️ This analysis is <strong>NOT a medical diagnosis</strong>. It is
            an AI-assisted assessment only based on image analysis. Results
            should <strong>NOT replace professional medical evaluation</strong>.
            Please consult a qualified dermatologist or healthcare provider for:
          </p>
          <ul className="text-red-800 text-base mt-3 space-y-2 ml-4">
            <li>✓ Accurate clinical diagnosis</li>
            <li>✓ Treatment recommendations</li>
            <li>✓ Professional medical advice</li>
            <li>✓ Biopsy or further testing if needed</li>
          </ul>
          <p className="text-red-800 text-sm mt-4 font-medium">
            In case of suspected skin cancer or urgent symptoms, seek immediate
            medical attention.
          </p>
        </div>

        {/* Footer Info for PDF */}
        <div className="text-center mt-8 pb-4 border-t pt-4">
          <p className="text-gray-600 text-sm font-medium">
            Session Analysis • {new Date().toLocaleDateString()}
          </p>
          <p className="text-gray-500 text-xs mt-2">
            For medical concerns, always consult a healthcare professional
          </p>
        </div>
      </div>
      {/* End PDF Content Wrapper */}

        {/* Action Buttons */}
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
