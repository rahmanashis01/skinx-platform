import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

const AIAssistantTeaser = ({ onOpenChat }) => {
  const [showTeaser, setShowTeaser] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const teaserRef = useRef(null);

  useEffect(() => {
    // Check if teaser was already closed in this session
    const isClosed = sessionStorage.getItem("skinx_ai_teaser_closed");

    // Only show if not previously closed in this session
    if (!isClosed && !hasShown) {
      // Wait 6.5 seconds before showing
      const timer = setTimeout(() => {
        setShowTeaser(true);
        setHasShown(true);
      }, 6500);

      return () => clearTimeout(timer);
    }
  }, [hasShown]);

  const handleClose = () => {
    setShowTeaser(false);
    sessionStorage.setItem("skinx_ai_teaser_closed", "true");
  };

  const handleTalkWithAI = () => {
    sessionStorage.setItem("skinx_ai_teaser_closed", "true");
    setShowTeaser(false);
    // Call the parent handler to open the chat widget
    if (onOpenChat) {
      onOpenChat();
    }
  };

  const handleMaybeLater = () => {
    setShowTeaser(false);
    sessionStorage.setItem("skinx_ai_teaser_closed", "true");
  };

  if (!showTeaser) return null;

  return (
    <div
      ref={teaserRef}
      className="fixed z-40"
      style={{
        bottom: "115px",
        right: "28px",
        width: "320px",
      }}
    >
      {/* Mobile responsive positioning */}
      <style jsx>{`
        @media (max-width: 640px) {
          div {
            bottom: 95px !important;
            right: 16px !important;
            left: 16px !important;
            width: calc(100% - 32px) !important;
          }
        }

        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .teaser-bubble {
          animation: slideUpFade 0.35s ease-out forwards;
        }

        @keyframes pulse-small {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.65;
          }
        }

        .pulse-small {
          animation: pulse-small 2.5s ease-in-out infinite;
        }
      `}</style>

      {/* Compact bubble container */}
      <div className="teaser-bubble bg-white rounded-[18px] shadow-[0_6px_24px_rgba(30,58,138,0.15)] overflow-hidden border border-blue-100/50 backdrop-blur-sm">
        {/* Header with emoji and title */}
        <div className="px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-lg flex-shrink-0">🤖</span>
            <h3 className="font-semibold text-gray-900 text-sm truncate">
              SkinX AI Assistant
            </h3>
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            aria-label="Close AI assistant teaser"
            className="flex-shrink-0 p-0.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Body text - compact */}
        <div className="px-4 py-2">
          <p className="text-gray-700 text-xs leading-relaxed">
            Ask about skin cancer signs, scan steps, or results.
          </p>
        </div>

        {/* Action buttons - stacked on desktop, side-by-side on mobile if room */}
        <div className="px-4 pb-3 flex flex-col gap-2">
          <button
            onClick={handleTalkWithAI}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2 rounded-lg transition-all duration-200 text-xs shadow-sm hover:shadow-md"
          >
            Talk with AI
          </button>
          <button
            onClick={handleMaybeLater}
            className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-2 rounded-lg transition-colors text-xs border border-gray-200"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantTeaser;
