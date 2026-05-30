import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Home,
  MessageCircle,
  ScanLine,
  GitCompare,
  BarChart2,
  Plus,
  Mic,
  Send,
} from "lucide-react";
import logoImg from "../assets/logo.png";
import UserProfile from "../components/UserProfile";

// Detect mobile device (used for camera vs file-upload input)
const isMobileDevice = () =>
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  ) ||
  ("ontouchstart" in window && window.innerWidth < 1024);

// ─── Bottom Nav ───────────────────────────────────────────────────────────────

const BottomNav = ({ active }) => {
  const navigate = useNavigate();
  const tabs = [
    {
      key: "home",
      label: "Home",
      icon: <Home size={20} />,
      action: () => navigate("/dashboard"),
    },
    {
      key: "session",
      label: "Session",
      icon: <MessageCircle size={20} />,
      action: () => {},
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200">
      <div className="max-w-lg mx-auto flex">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={tab.action}
            className={`relative flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors ${
              active === tab.key
                ? "text-teal-500"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.icon}
            <span className="text-xs font-medium">{tab.label}</span>
            {active === tab.key && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-teal-500 rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── Session Workspace ────────────────────────────────────────────────────────

const SessionWorkspace = () => {
  const navigate = useNavigate();
  const {
    logout: auth0Logout,
    isAuthenticated,
    getAccessTokenSilently,
  } = useAuth0();
  const fileRef = useRef(null); // For desktop multi-file upload
  const cameraRef = useRef(null); // For mobile camera capture
  const mobile = isMobileDevice();

  // Get user info from localStorage or Auth0
  const [userName] = useState(() => {
    return localStorage.getItem("userName") || "User";
  });

  const [userEmail] = useState(() => {
    return localStorage.getItem("userEmail") || "";
  });

  const [session] = useState(() => {
    try {
      const stored = localStorage.getItem("currentSession");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [scanCount, setScanCount] = useState(0);
  const [scanHistory, setScanHistory] = useState([]);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "system",
      text: "Session created. Start with Scan New Spot to generate your first assessment.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Load scan history from localStorage on mount
  useEffect(() => {
    const currentSession = localStorage.getItem("currentSession");
    if (currentSession) {
      const sessionData = JSON.parse(currentSession);
      const sessionScans = JSON.parse(
        localStorage.getItem(`session_${sessionData.id}_scans`) || "[]",
      );
      setScanHistory(sessionScans);
      setScanCount(sessionScans.length);
    }
  }, []);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!session) navigate("/dashboard");
  }, [session, navigate]);

  // Desktop: open file picker for multiple selection
  const handleUploadPhotos = () => {
    fileRef.current?.click();
  };

  // Mobile: open camera
  const handleCapturePhoto = () => {
    cameraRef.current?.click();
  };

  // After file(s) selected: store images (max 3) in sessionStorage then go to ScanPage
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to max 3 images
    const selectedFiles = files.slice(0, 3);

    // Show feedback to user about selection
    if (!mobile && files.length > 3) {
      alert(
        `You selected ${files.length} images. Only the first 3 will be used.`,
      );
    }

    // Convert files to base64 and store in sessionStorage
    const imagePromises = selectedFiles.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises).then((images) => {
      // Store images in sessionStorage for ScanPage to pick up
      sessionStorage.setItem("directScanImages", JSON.stringify(images));

      // Store session metadata
      const sessionData = {
        age: session?.age || 30,
        gender: session?.gender || "unknown",
        region: session?.region || "unknown",
        skinTone: session?.skinTone?.label || session?.skinTone || "medium",
        bodyArea: session?.bodyArea || session?.bodyRegion || "unknown",
      };
      sessionStorage.setItem("scanSessionData", JSON.stringify(sessionData));

      // Navigate to ScanPage
      navigate("/scan");
    });

    // Clear input
    e.target.value = "";
  };

  const handleCompareWithPrevious = async () => {
    if (scanHistory.length < 2) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "system",
          text: "You need at least 2 scans to compare. Please scan a new spot first.",
        },
      ]);
      return;
    }

    setIsLoading(true);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "user",
        text: "Compare my latest scan with previous ones",
      },
    ]);

    try {
      const latestScan = scanHistory[scanHistory.length - 1];
      const previousScan = scanHistory[scanHistory.length - 2];

      // TODO: Replace with actual RAG API call when ready
      // For now, provide detailed comparison based on stored data
      const comparisonText = `📊 **Scan Comparison Analysis**

**Latest Scan** (${new Date(latestScan.timestamp).toLocaleDateString()}):
- Condition: ${latestScan.condition || "Pending analysis"}
- Risk Level: ${latestScan.riskLevel || "Unknown"}
- Confidence: ${latestScan.confidence ? (latestScan.confidence * 100).toFixed(0) : "N/A"}%

**Previous Scan** (${new Date(previousScan.timestamp).toLocaleDateString()}):
- Condition: ${previousScan.condition || "Pending analysis"}
- Risk Level: ${previousScan.riskLevel || "Unknown"}
- Confidence: ${previousScan.confidence ? (previousScan.confidence * 100).toFixed(0) : "N/A"}%

**Changes Detected:**
${
  latestScan.riskLevel === previousScan.riskLevel
    ? "✓ Risk level remains stable"
    : `⚠️ Risk level changed from ${previousScan.riskLevel} to ${latestScan.riskLevel}`
}

**Note:** Full AI-powered comparison will be available once the RAG model training is complete.`;

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "bot",
          text: comparisonText,
        },
      ]);
    } catch (error) {
      console.error("Comparison error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "bot",
          text: "Sorry, I couldn't compare the scans. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetSummary = async () => {
    if (scanHistory.length === 0) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "system",
          text: "No scans yet. Please scan a new spot first to get a summary.",
        },
      ]);
      return;
    }

    setIsLoading(true);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "user",
        text: "Give me a summary of all my scans",
      },
    ]);

    try {
      const totalScans = scanHistory.length;
      const latestScan = scanHistory[scanHistory.length - 1];

      // Count risk levels
      const riskCounts = scanHistory.reduce((acc, scan) => {
        const level = scan.riskLevel || "unknown";
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {});

      const summaryText = `📋 **Session Summary**

**Total Scans:** ${totalScans}
**Session:** ${session?.bodyArea || "Unknown area"}
**Patient Info:** ${session?.age || "N/A"} years, ${session?.gender || "N/A"}

**Risk Distribution:**
${Object.entries(riskCounts)
  .map(
    ([level, count]) =>
      `- ${level.charAt(0).toUpperCase() + level.slice(1)}: ${count} scan(s)`,
  )
  .join("\n")}

**Latest Scan Results:**
- Date: ${new Date(latestScan.timestamp).toLocaleString()}
- Condition: ${latestScan.condition || "Pending analysis"}
- Confidence: ${latestScan.confidence ? (latestScan.confidence * 100).toFixed(0) : "N/A"}%

**Recommendation:** ${
        latestScan.riskLevel === "high"
          ? "⚠️ High risk detected. Please consult a dermatologist immediately."
          : latestScan.riskLevel === "medium"
            ? "⚡ Medium risk. Monitor closely and consider professional consultation."
            : "✓ Low risk detected. Continue regular monitoring."
      }

**Note:** Complete AI-powered analysis will be available once the RAG model training is complete.`;

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "bot",
          text: summaryText,
        },
      ]);
    } catch (error) {
      console.error("Summary error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "bot",
          text: "Sorry, I couldn't generate a summary. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewSession = () => {
    localStorage.removeItem("currentSession");
    navigate("/dashboard");
  };

  const handleLogout = () => {
    // Clear session data
    localStorage.removeItem("currentSession");
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");

    // Logout with Auth0 if authenticated, otherwise just navigate
    if (isAuthenticated) {
      auth0Logout({
        logoutParams: { returnTo: window.location.origin + "/login" },
      });
    } else {
      navigate("/login");
    }
  };

  const handleAnalysisComplete = (result) => {
    setAnalysisResult(result);
    // Store result for result-ready page
    localStorage.setItem("latestAnalysisResult", JSON.stringify(result));
    // Add system message
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "system",
        text: "✅ Analysis complete. Click 'View Results' to see full report.",
      },
    ]);
  };

  // Send message to Flask RAG API
  const handleSendMessage = async () => {
    if (!chatInput.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      text: chatInput,
    };

    setMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsLoading(true);

    try {
      // Get authentication token
      let token;
      try {
        token = isAuthenticated
          ? await getAccessTokenSilently()
          : localStorage.getItem("token");
      } catch (authError) {
        console.warn(
          "Failed to get Auth0 token, using localStorage:",
          authError,
        );
        token = localStorage.getItem("token");
      }

      const response = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: chatInput,
          context: {
            age: session.age,
            gender: session.gender,
            region: session.region,
            skinTone: session.skinTone?.label,
            bodyArea: session.bodyArea,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from API");
      }

      const data = await response.json();

      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        text:
          data.response ||
          data.answer ||
          data.result ||
          "Sorry, I couldn't process your request.",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        text: "Sorry, I'm having trouble connecting to the server. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!session) return null;

  const skinToneName = session.skinTone?.label || "Unknown";
  const bodyArea = session.bodyArea || "Unknown";

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(160deg,#d8eaf8 0%,#e8f4fc 50%,#f0f8ff 100%)",
      }}
    >
      {/* Desktop: Multiple file upload (Cmd/Ctrl+click to select up to 3 images) */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Mobile: Camera capture (opens device camera) */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-[rgba(30,58,138,0.95)] backdrop-blur-md border-b border-white/10 px-3 py-2 flex items-center justify-between shadow-lg">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          <div className="w-12 h-8 bg-white rounded-lg overflow-hidden shadow-md flex items-center justify-center p-1">
            <img
              src={logoImg}
              alt="SkinX"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">SkinX</p>
            <p className="text-blue-200/70 text-[9px] leading-none mt-1">
              Skin Cancer Detector
            </p>
          </div>
        </div>

        {/* User Profile Menu */}
        <UserProfile
          userName={userName}
          userEmail={userEmail}
          onLogout={handleLogout}
        />
      </nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-4 pb-28">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Session Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between">
            <div>
              <h2 className="font-bold text-gray-900 text-base">
                {bodyArea} · {skinToneName}
              </h2>
              <p className="text-gray-400 text-xs mt-0.5">
                Chat-first monitoring workspace
              </p>
            </div>
            <button
              onClick={handleCreateNewSession}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-xs font-semibold flex-shrink-0 ml-4 active:scale-95 transition-transform"
              style={{
                background: "linear-gradient(135deg,#20b2aa 0%,#159c95 100%)",
              }}
            >
              <Plus size={13} />
              Create New Session
            </button>
          </div>

          {/* Messages Area */}
          <div className="px-5 py-4 min-h-[380px] max-h-[500px] overflow-y-auto space-y-3">
            {messages.map((msg) => (
              <div key={msg.id}>
                {msg.type === "system" && (
                  <div
                    className="inline-block px-4 py-2.5 rounded-2xl text-white text-sm leading-relaxed"
                    style={{ background: "#1e3a5f" }}
                  >
                    {msg.text}
                  </div>
                )}
                {msg.type === "bot" && (
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm">🤖</span>
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%]">
                      <p className="text-gray-800 text-sm leading-relaxed">
                        {msg.text}
                      </p>
                    </div>
                  </div>
                )}
                {msg.type === "user" && (
                  <div className="flex justify-end">
                    <div
                      className="rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[85%] text-white text-sm leading-relaxed"
                      style={{ background: "#1e3a8a" }}
                    >
                      {msg.text}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm">🤖</span>
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5">
                  <p className="text-gray-500 text-sm">Thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Box */}
          <div className="px-5 py-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSendMessage}
                disabled={!chatInput.trim() || isLoading}
                className="p-2.5 rounded-full text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background:
                    chatInput.trim() && !isLoading
                      ? "linear-gradient(135deg,#20b2aa 0%,#159c95 100%)"
                      : "#d1d5db",
                }}
              >
                <Send size={18} />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-5 py-3 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {/* Mobile: Camera Capture Button */}
              {mobile && (
                <button
                  onClick={handleCapturePhoto}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-full text-gray-700 text-[11px] font-medium hover:bg-gray-50 active:scale-95 transition-all"
                >
                  <ScanLine size={13} className="text-gray-500" />
                  Scan New Spot
                </button>
              )}

              {/* Desktop: Upload Photos Button (multi-select) */}
              {!mobile && (
                <button
                  onClick={handleUploadPhotos}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-full text-gray-700 text-[11px] font-medium hover:bg-gray-50 active:scale-95 transition-all"
                >
                  <ScanLine size={13} className="text-gray-500" />
                  Scan New Spot
                </button>
              )}
              <button
                onClick={handleCompareWithPrevious}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-full text-gray-700 text-[11px] font-medium hover:bg-gray-50 active:scale-95 transition-all"
              >
                <GitCompare size={13} className="text-gray-500" />
                Compare with Previous
              </button>
              <button
                onClick={handleGetSummary}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-full text-gray-700 text-[11px] font-medium hover:bg-gray-50 active:scale-95 transition-all"
              >
                <BarChart2 size={13} className="text-gray-500" />
                Get Summary
              </button>
              {analysisResult && (
                <button
                  onClick={() => {
                    localStorage.setItem(
                      "latestAnalysisResult",
                      JSON.stringify(analysisResult),
                    );
                    navigate("/result-ready");
                  }}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 text-white rounded-full text-[11px] font-medium hover:bg-red-700 active:scale-95 transition-all"
                >
                  View Results
                </button>
              )}
            </div>
          </div>

          {/* Session Info Footer */}
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
              <span>
                Age:{" "}
                <span className="text-gray-600 font-medium">{session.age}</span>
              </span>
              <span>
                Gender:{" "}
                <span className="text-gray-600 font-medium">
                  {session.gender}
                </span>
              </span>
              <span>
                Region:{" "}
                <span className="text-gray-600 font-medium">
                  {session.region}
                </span>
              </span>
              <span>
                Scans:{" "}
                <span className="text-gray-600 font-medium">{scanCount}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <BottomNav active="session" />
    </div>
  );
};

export default SessionWorkspace;
