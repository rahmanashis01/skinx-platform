import React, { useState, useEffect } from "react";

const CookieConsent = () => {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    checkConsent();
  }, []);

  const checkConsent = () => {
    const consentChoice = localStorage.getItem("cookieConsent");
    const consentDate = localStorage.getItem("consentDate");
    const consentExpiry = localStorage.getItem("consentExpiry");

    // Check if consent exists and is not expired
    if (consentChoice && consentExpiry) {
      const expiryDate = new Date(consentExpiry);
      const now = new Date();

      // If expired, clear and show modal again
      if (expiryDate < now) {
        clearConsent();
        setShowConsent(true);
        return;
      }

      // Valid consent exists, don't show modal
      setShowConsent(false);
    } else {
      // No consent found, show modal
      setShowConsent(true);
    }
  };

  const clearConsent = () => {
    localStorage.removeItem("cookieConsent");
    localStorage.removeItem("consentDate");
    localStorage.removeItem("consentExpiry");
  };

  const handleConsent = () => {
    const now = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 12 months from now

    // Store consent
    localStorage.setItem("cookieConsent", "accepted");
    localStorage.setItem("consentDate", now.toISOString());
    localStorage.setItem("consentExpiry", expiryDate.toISOString());

    // Trigger custom event for analytics initialization
    window.dispatchEvent(
      new CustomEvent("cookieConsentChanged", {
        detail: { consent: "accepted" },
      }),
    );

    // Initialize analytics if consent is given
    initializeAnalytics();

    setShowConsent(false);
  };

  const handleReject = () => {
    const now = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 12 months from now

    // Store rejection
    localStorage.setItem("cookieConsent", "rejected");
    localStorage.setItem("consentDate", now.toISOString());
    localStorage.setItem("consentExpiry", expiryDate.toISOString());

    // Trigger custom event
    window.dispatchEvent(
      new CustomEvent("cookieConsentChanged", {
        detail: { consent: "rejected" },
      }),
    );

    // Block analytics
    blockAnalytics();

    setShowConsent(false);
  };

  const initializeAnalytics = () => {
    // Load Google Analytics only if user consented
    if (window.gtag) {
      console.log("✅ Analytics enabled - User consented");
      // gtag('consent', 'update', {
      //   'analytics_storage': 'granted'
      // });
    }

    // Load other tracking scripts here
    // Example: Facebook Pixel, Hotjar, etc.
  };

  const blockAnalytics = () => {
    console.log("🚫 Analytics blocked - User rejected cookies");

    // Block Google Analytics
    if (window.gtag) {
      // gtag('consent', 'update', {
      //   'analytics_storage': 'denied'
      // });
    }

    // Remove tracking cookies if any exist
    document.cookie.split(";").forEach((c) => {
      const cookie = c.trim();
      if (cookie.startsWith("_ga") || cookie.startsWith("_gid")) {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie =
          name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      }
    });
  };

  if (!showConsent) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn">
      {/* Modal Container */}
      <div className="relative mx-4 w-full max-w-lg rounded-2xl bg-white shadow-2xl animate-slideUp">
        {/* Content */}
        <div className="p-8 md:p-10">
          {/* Title */}
          <h2 className="mb-6 text-2xl md:text-3xl font-bold text-gray-900">
            Our website uses cookie
          </h2>

          {/* Description */}
          <p className="mb-4 text-base leading-relaxed text-gray-700">
            SkinX uses cookies and similar technologies to personalize your
            experience, analyze platform traffic, and deliver relevant content
            and advertisements. This helps us improve our services while keeping
            your data secure. Granting this permission won't give us access to
            your information on other apps or websites. For more details, please
            review our Privacy Policy.
          </p>

          {/* Privacy Policy Link */}
          <a
            href="/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-base font-medium text-[#5b7bc5] hover:text-[#4a6ab4] underline transition-colors"
          >
            Learn more in our Privacy Policy.
          </a>

          {/* Effective Date */}
          <p className="mt-4 text-sm text-gray-500">
            Effective Date: March, 2026
          </p>

          {/* Info Note */}
          <p className="mt-2 text-xs text-gray-400">
            Your choice will be saved for 12 months. You can change your
            preferences anytime in cookie policy.
          </p>

          {/* Consent Button */}
          <button
            onClick={handleConsent}
            className="mt-8 w-full bg-[#5b7bc5] hover:bg-[#4a6ab4] text-white font-semibold py-4 px-6 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            Consent
          </button>

          {/* Reject Button */}
          <button
            onClick={handleReject}
            className="mt-4 w-full text-gray-600 hover:text-gray-900 font-medium py-2 transition-colors hover:underline"
          >
            Do not consent
          </button>
        </div>
      </div>

      {/* Add animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CookieConsent;
