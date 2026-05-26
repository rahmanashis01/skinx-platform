import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Navbar from "../components/Navbar";

const FAQ = () => {
  const navigate = useNavigate();

  const faqData = [
    {
      slug: "history-subscriptions-syncing",
      question:
        "Why aren't my history and subscriptions syncing between the website and app?",
      answer: {
        intro:
          "In our service, the website and the mobile apps are currently operating separately — they are not synchronized and are managed independently. This also means that each subscription is separate, so a subscription purchased on the website does not apply to the mobile app, and vice versa.",
        sections: [
          {
            title: "What Does This Mean For You?",
            points: [
              {
                label: "Your scan history is separate.",
                text: "Photos and results are available on the website. Photos and results from the app are available in the app. You won't see scans from one platform on the others.",
              },
              {
                label: "Subscriptions are platform-specific.",
                text: "A subscription purchased on the website works only on the website. A subscription purchased in the app works only in the app. They cannot be shared or transferred.",
              },
            ],
          },
          {
            title: "Why Is This Division Necessary?",
            content: [
              "This is the result of how the platforms were developed. We are always working to improve the service so that our users can have a positive experience. Synchronizing everything smoothly is of top priority for our future plans.",
              "Our team values each user of SkinX community, and we are committed to making your skin health journey as smooth, convinient and connected as possible moving forward.",
            ],
          },
        ],
      },
    },
    {
      slug: "in-depth-analysis",
      question: "How to Use In-Depth Analysis",
      answer: {
        intro:
          "In-Depth Analysis provides comprehensive insights about your skin condition.",
        sections: [
          {
            title: "Getting Started",
            content: [
              "Access the In-Depth Analysis feature from your scan results page.",
              "Review the detailed breakdown of your skin condition.",
              "Follow the personalized recommendations provided.",
            ],
          },
        ],
      },
    },
    {
      slug: "usage-frequency",
      question: "How often should you use SkinX?",
      answer: {
        intro:
          "The frequency of using SkinX depends on your specific skin concerns and monitoring needs.",
        sections: [
          {
            title: "Recommended Usage",
            content: [
              "For routine monitoring: Once a month",
              "For active concerns: Weekly or as recommended by your dermatologist",
              "For tracking treatment progress: As advised by your healthcare provider",
            ],
          },
        ],
      },
    },
    {
      slug: "dermatology-appointment",
      question: "How to prepare for a dermatology appointment using SkinX?",
      answer: {
        intro:
          "SkinX can help you prepare effectively for your dermatology appointment.",
        sections: [
          {
            title: "Preparation Steps",
            content: [
              "Take clear photos of all areas of concern",
              "Review your scan history and note any changes",
              "Print or save your SkinX analysis results",
              "Prepare questions based on the analysis",
            ],
          },
        ],
      },
    },
    {
      slug: "add-to-home-screen",
      question: "How to Add the SkinX Website to Your Phone's Home Screen",
      answer: {
        intro: "You can easily add SkinX to your home screen for quick access.",
        sections: [
          {
            title: "For iPhone (Safari)",
            content: [
              "Open SkinX in Safari",
              "Tap the Share button (square with arrow)",
              "Scroll down and tap 'Add to Home Screen'",
              "Name it and tap 'Add'",
            ],
          },
          {
            title: "For Android (Chrome)",
            content: [
              "Open SkinX in Chrome",
              "Tap the menu button (three dots)",
              "Tap 'Add to Home screen'",
              "Name it and tap 'Add'",
            ],
          },
        ],
      },
    },
    {
      slug: "delete-account",
      question: "How to delete account?",
      answer: {
        intro:
          "You can delete your SkinX account at any time from your account settings.",
        sections: [
          {
            title: "Deletion Process",
            content: [
              "Go to Settings in your account",
              "Select 'Account Management'",
              "Click 'Delete Account'",
              "Confirm your decision",
              "Note: This action is permanent and cannot be undone",
            ],
          },
        ],
      },
    },
    {
      slug: "cancel-subscription",
      question: "How to Cancel a Subscription: A Step-by-Step Guide",
      answer: {
        intro:
          "You can cancel your subscription at any time through your account settings.",
        sections: [
          {
            title: "Cancellation Steps",
            content: [
              "Log into your SkinX account",
              "Navigate to 'Subscription' in Settings",
              "Click 'Cancel Subscription'",
              "Follow the prompts to confirm",
              "You will retain access until the end of your billing period",
            ],
          },
        ],
      },
    },
    {
      slug: "personal-information-safety",
      question: "Is my personal information safe?",
      answer: {
        intro:
          "At SkinX, we take your privacy and data security very seriously.",
        sections: [
          {
            title: "Our Security Measures",
            content: [
              "All data is encrypted in transit and at rest",
              "We comply with GDPR and HIPAA regulations",
              "Your photos are stored securely and never shared without permission",
              "We use industry-standard security protocols",
              "Regular security audits are performed",
            ],
          },
        ],
      },
    },
    {
      slug: "replace-doctor",
      question: "Does SkinX replace the Doctor?",
      answer: {
        intro:
          "No, SkinX does not replace professional medical advice or diagnosis from a qualified dermatologist.",
        sections: [
          {
            title: "Important Notice",
            content: [
              "SkinX is a screening tool to help you monitor your skin health",
              "It provides preliminary insights and educational information",
              "Always consult with a healthcare professional for diagnosis and treatment",
              "Use SkinX as a complement to, not a replacement for, professional medical care",
              "In case of serious concerns, seek immediate medical attention",
            ],
          },
        ],
      },
    },
    {
      slug: "who-should-use",
      question: "Who should use SkinX?",
      answer: {
        intro:
          "SkinX is designed for anyone interested in monitoring their skin health.",
        sections: [
          {
            title: "Ideal Users",
            content: [
              "People with a history of skin conditions",
              "Those wanting to monitor moles and skin changes",
              "Individuals preparing for dermatology appointments",
              "Anyone interested in preventive skin care",
              "People in between dermatologist visits",
            ],
          },
        ],
      },
    },
    {
      slug: "key-facts",
      question: "Key Facts About SkinX",
      answer: {
        intro: "Here are the essential facts about SkinX and how it works.",
        sections: [
          {
            title: "Key Information",
            content: [
              "AI-powered skin analysis technology",
              "Trained on thousands of dermatological images",
              "Provides instant preliminary assessments",
              "Available on web and mobile platforms",
              "Continuously updated with latest research",
              "HIPAA compliant and secure",
            ],
          },
        ],
      },
    },
    {
      slug: "machine-learning",
      question: "How is Machine Learning used in the application?",
      answer: {
        intro:
          "SkinX uses advanced machine learning algorithms to analyze skin conditions.",
        sections: [
          {
            title: "Our Technology",
            content: [
              "Deep learning neural networks trained on extensive medical datasets",
              "Image recognition algorithms identify patterns and anomalies",
              "Continuous learning from new data to improve accuracy",
              "Multi-layer analysis for comprehensive assessments",
              "Validated against clinical standards",
            ],
          },
        ],
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar alwaysOpaque={true} />

      {/* Main Content */}
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-[#364a6b] hover:text-[#2a3a54] mb-8 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="font-medium">Back</span>
          </button>

          {/* Page Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-12 text-[#1e293b]">
            FAQ
          </h1>

          {/* FAQ List */}
          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div
                key={index}
                className="rounded-lg overflow-hidden transition-all duration-300 bg-white shadow-md hover:shadow-lg"
              >
                {/* Question Header */}
                <button
                  onClick={() => navigate(`/faq/${faq.slug}`)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left transition-colors hover:bg-gray-50"
                >
                  <span className="text-base md:text-lg font-semibold pr-4 text-[#1e293b]">
                    {faq.question}
                  </span>
                  <ChevronRight className="w-5 h-5 shrink-0 text-gray-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="py-8 mt-16 border-t bg-white border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-6 mb-4">
            <a
              href="/faq"
              className="text-sm transition-colors text-gray-600 hover:text-gray-900"
            >
              FAQ
            </a>
            <a
              href="/diseases-dictionary"
              className="text-sm transition-colors text-gray-600 hover:text-gray-900"
            >
              Diseases dictionary
            </a>
            <a
              href="/privacy-policy"
              className="text-sm transition-colors text-gray-600 hover:text-gray-900"
            >
              Privacy Policy
            </a>
            <a
              href="/terms-of-use"
              className="text-sm transition-colors text-gray-600 hover:text-gray-900"
            >
              Terms of Use
            </a>
          </div>
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} SkinX. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default FAQ;
