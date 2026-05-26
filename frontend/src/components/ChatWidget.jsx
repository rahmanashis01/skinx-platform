import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { MessageCircle, X, ChevronLeft, Maximize2 } from "lucide-react";

// Sound utility functions
const playSound = (frequency, duration, type = "sine") => {
  try {
    const audioContext = new (
      window.AudioContext || window.webkitAudioContext
    )();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + duration,
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (error) {
    // Silently fail if audio context is not supported
    console.warn("Audio not supported:", error);
  }
};

const playUserSound = () => {
  // Quick click sound - single beep
  playSound(800, 0.1, "sine");
};

const playBotSound = () => {
  // Bot response sound - double beep
  playSound(600, 0.08, "sine");
  setTimeout(() => {
    playSound(700, 0.08, "sine");
  }, 100);
};

const ChatWidget = forwardRef((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [conversationState, setConversationState] = useState("initial");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showBadge, setShowBadge] = useState(true);
  const [ragQuestion, setRagQuestion] = useState("");
  const [isRagLoading, setIsRagLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const addBotMessage = useCallback((text) => {
    playBotSound();
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        type: "bot",
        text,
        timestamp: "Just now",
      },
    ]);
  }, []);

  const addUserMessage = useCallback((text) => {
    playUserSound();
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        type: "user",
        text,
        timestamp: "Just now",
      },
    ]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        addBotMessage(
          "👋 Hello! I'm the SkinX AI consultant. I'll be happy to assist you today.",
        );
      }, 300);
    }
  }, [isOpen, messages.length, addBotMessage]);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setMessages([]);
      setConversationState("initial");
      setSelectedCategory(null);
      setShowBadge(true);
    }, 300);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setShowBadge(false);
  };

  // Expose handleOpen through ref for external components
  useImperativeHandle(ref, () => ({
    handleOpen,
  }));

  const handleNeedHelp = () => {
    addUserMessage("Hello, I need help!");
    setConversationState("categories");
    setTimeout(() => {
      addBotMessage("Please select one of the following categories:");
    }, 500);
  };

  const handleNoThanks = () => {
    addUserMessage("No, thanks.");
    setTimeout(() => {
      addBotMessage(
        "No problem! I'm here whenever you need assistance. Take care! 🌿",
      );
      setConversationState("closed");
    }, 500);
  };

  const handleAskAI = () => {
    window.open(
      "https://t.me/skinX_assitance_bot",
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    addUserMessage(category.label);
    setConversationState("topics");
    setTimeout(() => {
      addBotMessage(`Selected category: ${category.label}`);
      setTimeout(() => {
        addBotMessage(
          "Please specify the topic by selecting one of the following options",
        );
      }, 400);
    }, 500);
  };

  const handleTopicSelect = (topic) => {
    addUserMessage(topic.label);
    setConversationState("answer");
    setTimeout(() => {
      addBotMessage(`Selected option: ${topic.label}`);
      setTimeout(() => {
        addBotMessage(topic.answer);
        setTimeout(() => {
          addBotMessage("Did this help?");
        }, 600);
      }, 400);
    }, 500);
  };

  const handleYesThanks = () => {
    addUserMessage("Yes, thanks!");
    setConversationState("resolved");
    setTimeout(() => {
      addBotMessage("Great! I'm glad I could help.");
      setTimeout(() => {
        addBotMessage("I'm always here if you need anything else.");
        setTimeout(() => {
          addBotMessage("Take care, and thank you for using SkinX 🌿");
        }, 400);
      }, 400);
    }, 500);
  };

  const handleStillNeedHelp = () => {
    addUserMessage("No, I still need help.");
    setConversationState("needMoreHelp");
    setTimeout(() => {
      addBotMessage("I understand your concern.");
      setTimeout(() => {
        addBotMessage(
          "📧 Please email us at support@skin-x.app and we'll get back to you as soon as possible.",
        );
      }, 400);
    }, 500);
  };

  const handleBackToMenu = () => {
    setConversationState("categories");
    setSelectedCategory(null);
    setTimeout(() => {
      addBotMessage("Please select one of the following categories:");
    }, 300);
  };

  const handleOtherCategory = () => {
    addUserMessage("Other");
    setConversationState("needMoreHelp");
    setTimeout(() => {
      addBotMessage(
        "If you have any question, please contact support@skin-x.app.",
      );
    }, 500);
  };

  const handleRagSubmit = async (e) => {
    e.preventDefault();
    if (!ragQuestion.trim()) {
      addBotMessage("Please enter a question.");
      return;
    }

    addUserMessage(ragQuestion);
    setRagQuestion("");
    setIsRagLoading(true);

    // Simple keyword matching for demo purposes
    const question = ragQuestion.trim().toLowerCase();
    let answer = null;

    // Search through all categories and topics for keyword matches
    for (const category of categories) {
      for (const topic of category.topics) {
        const keywords = topic.label.toLowerCase().split(" ");
        if (keywords.some((keyword) => question.includes(keyword))) {
          answer = topic.answer;
          break;
        }
      }
      if (answer) break;
    }

    // Fallback responses based on common keywords
    if (!answer) {
      if (question.includes("delete") || question.includes("remove")) {
        answer =
          "To delete your account, go to Settings > Account > Delete Account. If you need help, contact support@skin-x.app";
      } else if (question.includes("data") || question.includes("privacy")) {
        answer =
          "Your data is secure and encrypted. We never store photos on our servers and follow strict privacy regulations.";
      } else if (question.includes("how") && question.includes("use")) {
        answer =
          "Take a clear, well-lit photo of your skin concern, and our AI will analyze it instantly. Follow the on-screen guidance for best results.";
      } else if (
        question.includes("accurate") ||
        question.includes("reliable")
      ) {
        answer =
          "Our AI is trained on extensive medical datasets and provides accurate screening. However, it's designed to supplement professional medical advice, not replace it.";
      } else if (
        question.includes("doctor") ||
        question.includes("diagnosis")
      ) {
        answer =
          "SkinX is a screening tool to help identify potential concerns early. It does not replace professional medical diagnosis. Always consult a dermatologist for confirmation.";
      } else {
        answer =
          "I can help you with account settings, privacy questions, how to use SkinX, and general information. Please select a topic from the menu or ask a specific question.";
      }
    }

    setTimeout(() => {
      addBotMessage(answer);
      setIsRagLoading(false);
      setTimeout(() => {
        addBotMessage("Is there anything else I can help you with?");
      }, 500);
    }, 800);
  };

  // Categories and their topics
  const categories = [
    {
      id: "account",
      label: "Account & Login",
      topics: [
        {
          id: "delete",
          label: "Delete my account",
          answer:
            "To delete your account, go to Settings > Account > Delete Account. Please note this action is permanent and cannot be undone. All your data will be removed from our servers.",
        },
        {
          id: "reset",
          label: "Didn't get confirmation or reset email",
          answer:
            "Please check your spam/junk folder. If you still don't see it, make sure you entered the correct email address. You can request a new confirmation email from the login page.",
        },
        {
          id: "login",
          label: "Can't log in / Forgot password",
          answer:
            "Click 'Forgot Password' on the login page. Enter your email and we'll send you a reset link. If you're having trouble, contact us at support@skin-x.app",
        },
        {
          id: "deleteIssue",
          label: "Tried to delete, didn't work",
          answer:
            "We're sorry you're experiencing this issue. Please email us at support@skin-x.app with your account details and we'll help you resolve this immediately.",
        },
      ],
    },
    {
      id: "privacy",
      label: "Data Privacy",
      topics: [
        {
          id: "storage",
          label: "Do you store my data?",
          answer:
            "Your photos and data are never stored on our servers. Everything is processed securely and privately. We also don't keep any payment info — all payments go through Apple, Google, or Stripe.",
        },
        {
          id: "policy",
          label: "Account & data policy",
          answer:
            "We follow strict GDPR and privacy regulations. Your data is encrypted and processed locally on your device. We only store your email for account management. You can delete your account and all data anytime.",
        },
        {
          id: "security",
          label: "Is my personal information safe?",
          answer:
            "Yes! We use bank-level encryption (AES-256) to protect your data. All processing happens securely on your device or our encrypted servers. We never share your personal information with third parties.",
        },
      ],
    },
    {
      id: "service",
      label: "Service Access & Results",
      topics: [
        {
          id: "howToUse",
          label: "How to use SkinX",
          answer:
            "Simply take a clear photo of your skin concern, and our AI will analyze it instantly. Follow the on-screen instructions for best results. Make sure the area is well-lit and the photo is in focus.",
        },
        {
          id: "results",
          label: "How to interpret my results",
          answer:
            "Your results show potential skin conditions identified by our AI. Each result includes a confidence level and recommendations. Remember: SkinX is a screening tool, not a replacement for professional medical advice.",
        },
        {
          id: "frequency",
          label: "How often should I use SkinX?",
          answer:
            "You can use SkinX anytime you notice a new skin concern or change. For monitoring existing conditions, weekly or monthly checks are recommended. Regular self-examination is important for early detection.",
        },
      ],
    },
    {
      id: "about",
      label: "About Us",
      topics: [
        {
          id: "whatIs",
          label: "What is SkinX?",
          answer:
            "SkinX is an AI-powered skin cancer detection tool that helps you screen for potential skin conditions. Our advanced technology analyzes photos of skin concerns and provides instant results to help you make informed decisions about your health.",
        },
        {
          id: "howWorks",
          label: "How does it work?",
          answer:
            "SkinX uses advanced AI trained on thousands of dermatological images. Simply take a photo, our AI analyzes it in seconds, and you receive an instant report with potential conditions and recommendations. It's fast, private, and accurate.",
        },
        {
          id: "accuracy",
          label: "How accurate is SkinX?",
          answer:
            "Our AI has been trained on extensive medical datasets and shows high accuracy in screening common skin conditions. However, it's designed to supplement—not replace—professional medical diagnosis. Always consult a dermatologist for confirmation.",
        },
        {
          id: "replaceDoctor",
          label: "Does SkinX replace the doctor?",
          answer:
            "No, SkinX is a screening tool to help you identify potential skin concerns early. It does not replace professional medical advice, diagnosis, or treatment. Always consult with a qualified dermatologist for any health concerns.",
        },
      ],
    },
  ];

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-[#1e3a8a] hover:bg-[#1e40af] text-white rounded-full shadow-[0_8px_32px_rgba(30,58,138,0.4)] hover:shadow-[0_12px_40px_rgba(30,58,138,0.6)] transition-all duration-300 flex items-center justify-center group"
          aria-label="Open chat"
        >
          <MessageCircle size={28} strokeWidth={2} />
          {/* Notification badge */}
          {showBadge && (
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold shadow-lg animate-pulse">
              1
            </span>
          )}
        </button>
      )}

      {/* Minimized Chat Button (Down Arrow) - shown when chat is open */}
      {isOpen && (
        <button
          onClick={handleClose}
          className="fixed bottom-6 right-6 z-[60] w-16 h-16 bg-[#1e3a8a] hover:bg-[#1e40af] text-white rounded-full shadow-[0_8px_32px_rgba(30,58,138,0.4)] hover:shadow-[0_12px_40px_rgba(30,58,138,0.6)] transition-all duration-300 flex items-center justify-center"
          aria-label="Minimize chat"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-white shadow-2xl transition-all duration-300 flex flex-col ${
            isExpanded
              ? "top-20 left-4 right-4 bottom-4 md:left-8 md:right-8 md:bottom-8 rounded-3xl"
              : "bottom-24 right-6 w-[90vw] max-w-[440px] h-[640px] max-h-[calc(100vh-110px)] rounded-[28px]"
          }`}
        >
          {/* Header */}
          <div
            className={`bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0 ${
              isExpanded ? "rounded-t-3xl" : "rounded-t-[28px]"
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Back button - show when appropriate */}
              {(conversationState === "topics" ||
                conversationState === "answer") && (
                <button
                  onClick={handleBackToMenu}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Back"
                >
                  <ChevronLeft size={20} className="text-gray-600" />
                </button>
              )}

              {/* Avatar and title */}
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🤖</span>
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-gray-900 text-base">SkinX AI</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Online now
                </p>
              </div>
            </div>

            {/* Header actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Expand window"
                title="Expand window"
              >
                <Maximize2 size={16} className="text-gray-600" />
              </button>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close chat"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Subtitle */}
          <div className="px-4 py-2.5 text-center border-b border-gray-100 flex-shrink-0">
            <p className="text-sm text-gray-600">
              Ask us anything, or share your feedback.
            </p>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 ${
                    message.type === "user"
                      ? "bg-[#1e3a8a] text-white rounded-[20px] rounded-br-md"
                      : "bg-gray-100 text-gray-900 rounded-[20px] rounded-bl-md"
                  }`}
                >
                  <p className="text-[15px] leading-relaxed whitespace-pre-line">
                    {message.text}
                  </p>
                </div>
              </div>
            ))}

            {/* Quick Reply Buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              {conversationState === "initial" && (
                <>
                  <button
                    onClick={handleAskAI}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full text-[15px] font-medium shadow-sm border border-blue-700 transition-all hover:shadow-md"
                  >
                    🤖 Ask AI
                  </button>
                  <button
                    onClick={handleNeedHelp}
                    className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-800 rounded-full text-[15px] font-medium shadow-sm border border-gray-200 transition-all hover:shadow-md"
                  >
                    Hello, I need help!
                  </button>
                  <button
                    onClick={handleNoThanks}
                    className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-800 rounded-full text-[15px] font-medium shadow-sm border border-gray-200 transition-all hover:shadow-md"
                  >
                    No, thanks.
                  </button>
                </>
              )}

              {conversationState === "categories" && (
                <>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category)}
                      className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-800 rounded-full text-[15px] font-medium shadow-sm border border-gray-200 transition-all hover:shadow-md"
                    >
                      {category.label}
                    </button>
                  ))}
                  <button
                    onClick={handleOtherCategory}
                    className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-800 rounded-full text-[15px] font-medium shadow-sm border border-gray-200 transition-all hover:shadow-md"
                  >
                    Other
                  </button>
                </>
              )}

              {conversationState === "topics" && selectedCategory && (
                <>
                  {selectedCategory.topics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicSelect(topic)}
                      className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-800 rounded-full text-[15px] font-medium shadow-sm border border-gray-200 transition-all hover:shadow-md text-left"
                    >
                      {topic.label}
                    </button>
                  ))}
                  <button
                    onClick={handleBackToMenu}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-[15px] font-medium transition-all flex items-center gap-1"
                  >
                    <ChevronLeft size={16} />
                    Return
                  </button>
                </>
              )}

              {conversationState === "answer" && (
                <>
                  <button
                    onClick={handleYesThanks}
                    className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-800 rounded-full text-[15px] font-medium shadow-sm border border-gray-200 transition-all hover:shadow-md"
                  >
                    Yes, thanks!
                  </button>
                  <button
                    onClick={handleStillNeedHelp}
                    className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-800 rounded-full text-[15px] font-medium shadow-sm border border-gray-200 transition-all hover:shadow-md"
                  >
                    No, I still need help.
                  </button>
                </>
              )}

              {(conversationState === "resolved" ||
                conversationState === "needMoreHelp") && (
                <>
                  <button
                    onClick={handleBackToMenu}
                    className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-800 rounded-full text-[15px] font-medium shadow-sm border border-gray-200 transition-all hover:shadow-md flex items-center gap-1"
                  >
                    <ChevronLeft size={16} />
                    Back to Menu
                  </button>
                  <button
                    onClick={handleClose}
                    className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-800 rounded-full text-[15px] font-medium shadow-sm border border-gray-200 transition-all hover:shadow-md"
                  >
                    Close conversation
                  </button>
                </>
              )}
            </div>

            <div ref={messagesEndRef} />
          </div>
        </div>
      )}
    </>
  );
});

ChatWidget.displayName = "ChatWidget";

export default ChatWidget;
