import React, { useState, useEffect } from "react";
import { Shield, Clock, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import {
  getConsentStatus,
  getConsentMetadata,
  resetConsent,
  hasConsent,
  hasRejected,
} from "../utils/cookieConsent";

const CookieSettings = () => {
  const [consentStatus, setConsentStatus] = useState(null);
  const [metadata, setMetadata] = useState(null);

  useEffect(() => {
    loadConsentData();

    // Listen for consent changes
    const handleConsentChange = () => {
      loadConsentData();
    };

    window.addEventListener("cookieConsentChanged", handleConsentChange);
    window.addEventListener("consentReset", handleConsentChange);

    return () => {
      window.removeEventListener("cookieConsentChanged", handleConsentChange);
      window.removeEventListener("consentReset", handleConsentChange);
    };
  }, []);

  const loadConsentData = () => {
    const status = getConsentStatus();
    const meta = getConsentMetadata();
    setConsentStatus(status);
    setMetadata(meta);
  };

  const handleResetConsent = () => {
    if (
      window.confirm(
        "Are you sure you want to reset your cookie preferences? The consent modal will appear again.",
      )
    ) {
      resetConsent();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cookie Policy</h1>
        <p className="text-gray-600">
          Manage your cookie and privacy preferences for SkinX
        </p>
      </div>

      {/* Current Status Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Current Consent Status
            </h2>

            {consentStatus === null && (
              <div className="flex items-center gap-2 text-gray-600">
                <XCircle className="w-5 h-5 text-gray-400" />
                <span>No consent decision made yet</span>
              </div>
            )}

            {consentStatus === "accepted" && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">
                  Cookies Accepted - Analytics and tracking enabled
                </span>
              </div>
            )}

            {consentStatus === "rejected" && (
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                <span className="font-medium">
                  Cookies Rejected - Only essential cookies are used
                </span>
              </div>
            )}

            {/* Metadata */}
            {metadata && (
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    Decision made on:{" "}
                    {metadata.consentDate?.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    Expires on: {metadata.expiryDate?.toLocaleDateString()}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  ({metadata.daysUntilExpiry} days remaining)
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cookie Information */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          What cookies do we use?
        </h2>

        <div className="space-y-4">
          {/* Essential Cookies */}
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-semibold text-gray-900 mb-1">
              Essential Cookies
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Required for the website to function properly. These cannot be
              disabled.
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Authentication and security</li>
              <li>Session management</li>
              <li>Cookie consent preferences</li>
            </ul>
          </div>

          {/* Analytics Cookies */}
          <div
            className={`border-l-4 ${hasConsent() ? "border-blue-500" : "border-gray-300"} pl-4`}
          >
            <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
              Analytics Cookies
              {hasConsent() ? (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  Enabled
                </span>
              ) : (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  Disabled
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Help us understand how visitors use our website to improve user
              experience.
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Google Analytics</li>
              <li>Page view tracking</li>
              <li>User behavior analysis</li>
            </ul>
          </div>

          {/* Marketing Cookies */}
          <div
            className={`border-l-4 ${hasConsent() ? "border-purple-500" : "border-gray-300"} pl-4`}
          >
            <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
              Marketing Cookies
              {hasConsent() ? (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  Enabled
                </span>
              ) : (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  Disabled
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Used to deliver personalized advertisements and measure campaign
              effectiveness.
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Ad personalization</li>
              <li>Retargeting campaigns</li>
              <li>Conversion tracking</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Manage Your Preferences
        </h2>

        <div className="space-y-3">
          <button
            onClick={handleResetConsent}
            className="w-full flex items-center justify-center gap-2 bg-[#5b7bc5] hover:bg-[#4a6ab4] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow hover:shadow-lg"
          >
            <RefreshCw className="w-5 h-5" />
            Change Cookie Preferences
          </button>

          <p className="text-sm text-gray-600 text-center">
            This will reset your choice and show the consent modal again
          </p>
        </div>

        {/* Additional Information */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">
            Additional Information
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              • Your consent is stored locally in your browser and expires after
              12 months
            </p>
            <p>
              • You can change your preferences at any time by visiting this
              page
            </p>
            <p>
              • Clearing your browser data will remove your consent preferences
            </p>
            <p>
              • Essential cookies are always active to ensure website
              functionality
            </p>
          </div>
        </div>

        {/* Privacy Policy Link */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600 mb-3">
            For more information about how we use cookies and protect your
            privacy:
          </p>
          <a
            href="/privacy-policy"
            className="inline-flex items-center gap-2 text-[#5b7bc5] hover:text-[#4a6ab4] font-medium underline"
          >
            <span className="inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 p-1 rounded">
              <Shield className="w-4 h-4 text-white" />
            </span>
            Read our Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
};

export default CookieSettings;
