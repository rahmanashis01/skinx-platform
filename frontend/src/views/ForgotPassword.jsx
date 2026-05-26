import React, { useState } from "react";
import { Mail } from "lucide-react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();

  // Form state
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const toggleTheme = () => setIsDark((prev) => !prev);

  // Validate email
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!email) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.message || "Failed to send reset email");
      }
    } catch (_error) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? "bg-[#0a0f2e]" : "bg-gray-50"}`}>
      {/* Navbar */}
      <Navbar isDark={isDark} toggleTheme={toggleTheme} alwaysOpaque={true} />

      {/* Main Content */}
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Forgot Password Form */}
          <div
            className={`rounded-lg p-8 md:p-12 shadow-lg ${
              isDark ? "bg-[#1a2145]" : "bg-white"
            }`}
          >
            <h1
              className={`text-3xl md:text-4xl font-bold mb-8 text-center ${
                isDark ? "text-white" : "text-[#1e293b]"
              }`}
            >
              Forgot password?
            </h1>

            {success ? (
              /* Success Message */
              <div className="text-center space-y-6">
                <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg">
                  <p className="font-semibold mb-2">Email Sent Successfully!</p>
                  <p className="text-sm">
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                  <p className="text-sm mt-2">
                    Please check your inbox and follow the instructions to reset
                    your password.
                  </p>
                </div>

                <button
                  onClick={() => navigate("/login")}
                  className="text-blue-600 hover:text-blue-700 font-medium underline"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Email
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full px-4 py-3 pr-10 rounded-lg border ${
                        error
                          ? "border-red-500"
                          : isDark
                            ? "border-gray-600 bg-[#0e1b5a] text-white"
                            : "border-gray-300 bg-white text-gray-900"
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                      placeholder="Enter your email"
                    />
                    <Mail
                      className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    />
                  </div>
                  {error && (
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                  )}
                  <p
                    className={`text-sm mt-2 ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Please enter a valid email address, the link with
                    confirmation token will be send on it
                  </p>
                </div>

                {/* Send Email Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#5b7bc5] hover:bg-[#4a6ab4] text-white font-semibold py-3 px-6 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Sending..." : "Send Email"}
                </button>

                {/* Back to Login */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium underline"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Simple Footer */}
          <footer className="mt-8">
            <p
              className={`text-center text-sm ${
                isDark ? "text-white/60" : "text-gray-500"
              }`}
            >
              © {new Date().getFullYear()} SkinX. All rights reserved.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
