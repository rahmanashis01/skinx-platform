import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CookieSettings from "../components/CookieSettings";

const CookiePolicyPage = () => {
  const navigate = useNavigate();

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

          <CookieSettings />
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

export default CookiePolicyPage;
