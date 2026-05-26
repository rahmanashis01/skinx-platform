import React, { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";

const ResetPassword = () => {
  const [isDark, setIsDark] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Form state
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  // Password strength indicators
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const toggleTheme = () => setIsDark((prev) => !prev);

  // Extract token from URL on mount
  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      validateToken(tokenFromUrl);
    } else {
      setValidatingToken(false);
      setError("No reset token provided. Please check your email link.");
    }
  }, [searchParams]);

  // Validate token with backend
  const validateToken = async (resetToken) => {
    try {
      const response = await fetch("/api/auth/validate-reset-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: resetToken }),
      });

      const data = await response.json();

      if (data.success) {
        setTokenValid(true);
      } else {
        setError(data.message || "Invalid or expired reset token");
        setTokenValid(false);
      }
    } catch (err) {
      setError("Failed to validate token. Please try again.");
      setTokenValid(false);
    } finally {
      setValidatingToken(false);
    }
  };

  // Check password strength
  const checkPasswordStrength = (pwd) => {
    setPasswordStrength({
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
    });
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkPasswordStrength(newPassword);
  };

  // Validate form
  const validateForm = () => {
    if (!password) {
      setError("Password is required");
      return false;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    if (!passwordStrength.uppercase) {
      setError("Password must contain at least one uppercase letter");
      return false;
    }

    if (!passwordStrength.lowercase) {
      setError("Password must contain at least one lowercase letter");
      return false;
    }

    if (!passwordStrength.number) {
      setError("Password must contain at least one number");
      return false;
    }

    if (!passwordStrength.special) {
      setError("Password must contain at least one special character");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (validatingToken) {
    return (
      <div className={`min-h-screen ${isDark ? "bg-[#0a0f2e]" : "bg-gray-50"}`}>
        <Navbar isDark={isDark} toggleTheme={toggleTheme} />
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div
              className={`rounded-lg p-8 md:p-12 shadow-lg text-center ${
                isDark ? "bg-[#1a2145]" : "bg-white"
              }`}
            >
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p
                className={`mt-4 text-lg ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Validating your reset link...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <div className={`min-h-screen ${isDark ? "bg-[#0a0f2e]" : "bg-gray-50"}`}>
        <Navbar isDark={isDark} toggleTheme={toggleTheme} />
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div
              className={`rounded-lg p-8 md:p-12 shadow-lg ${
                isDark ? "bg-[#1a2145]" : "bg-white"
              }`}
            >
              <div className="flex items-center justify-center mb-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
              </div>
              <h1
                className={`text-2xl md:text-3xl font-bold mb-4 text-center ${
                  isDark ? "text-white" : "text-[#1e293b]"
                }`}
              >
                Invalid Reset Link
              </h1>
              <p
                className={`text-center mb-6 ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {error ||
                  "This password reset link is invalid or has expired. Please request a new one."}
              </p>
              <button
                onClick={() => navigate("/forgot-password")}
                className="w-full bg-[#5b7bc5] hover:bg-[#4a6ab4] text-white font-semibold py-3 px-6 rounded-full transition-all duration-200"
              >
                Request New Reset Link
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className={`min-h-screen ${isDark ? "bg-[#0a0f2e]" : "bg-gray-50"}`}>
        <Navbar isDark={isDark} toggleTheme={toggleTheme} />
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div
              className={`rounded-lg p-8 md:p-12 shadow-lg text-center ${
                isDark ? "bg-[#1a2145]" : "bg-white"
              }`}
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1
                className={`text-2xl md:text-3xl font-bold mb-4 ${
                  isDark ? "text-white" : "text-[#1e293b]"
                }`}
              >
                Password Reset Successful!
              </h1>
              <p
                className={`mb-6 ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Your password has been successfully reset. Redirecting to login...
              </p>
              <button
                onClick={() => navigate("/login")}
                className="bg-[#5b7bc5] hover:bg-[#4a6ab4] text-white font-semibold py-3 px-8 rounded-full transition-all duration-200"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Reset form
  return (
    <div className={`min-h-screen ${isDark ? "bg-[#0a0f2e]" : "bg-gray-50"}`}>
      <Navbar isDark={isDark} toggleTheme={toggleTheme} />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div
            className={`rounded-lg p-8 md:p-12 shadow-lg ${
              isDark ? "bg-[#1a2145]" : "bg-white"
            }`}
          >
            <h1
              className={`text-3xl md:text-4xl font-bold mb-2 text-center ${
                isDark ? "text-white" : "text-[#1e293b]"
              }`}
            >
              Reset Your Password
            </h1>
            <p
              className={`text-center mb-8 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Enter a new password to regain access to your account
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-3 pr-10 rounded-lg border ${
                      isDark
                        ? "border-gray-600 bg-[#0e1b5a] text-white"
                        : "border-gray-300 bg-white text-gray-900"
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    } hover:text-gray-700`}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicators */}
                {password && (
                  <div className="mt-3 space-y-2">
                    <StrengthIndicator
                      met={passwordStrength.length}
                      label="At least 8 characters"
                    />
                    <StrengthIndicator
                      met={passwordStrength.uppercase}
                      label="One uppercase letter (A-Z)"
                    />
                    <StrengthIndicator
                      met={passwordStrength.lowercase}
                      label="One lowercase letter (a-z)"
                    />
                    <StrengthIndicator
                      met={passwordStrength.number}
                      label="One number (0-9)"
                    />
                    <StrengthIndicator
                      met={passwordStrength.special}
                      label="One special character (!@#$% etc.)"
                    />
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-4 py-3 pr-10 rounded-lg border ${
                      confirmPassword &&
                      password !== confirmPassword &&
                      "border-red-500"
                    } ${
                      isDark
                        ? "border-gray-600 bg-[#0e1b5a] text-white"
                        : "border-gray-300 bg-white text-gray-900"
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    } hover:text-gray-700`}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    Passwords do not match
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  isLoading ||
                  !password ||
                  !confirmPassword ||
                  !Object.values(passwordStrength).every(Boolean)
                }
                className="w-full bg-[#5b7bc5] hover:bg-[#4a6ab4] text-white font-semibold py-3 px-6 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
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
          </div>

          {/* Footer */}
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

// Helper component for password strength indicator
const StrengthIndicator = ({ met, label }) => (
  <div className="flex items-center gap-2">
    <div
      className={`w-4 h-4 rounded-full ${
        met ? "bg-green-500" : "bg-gray-300"
      }`}
    ></div>
    <span
      className={`text-sm ${
        met ? "text-green-600" : "text-gray-500"
      }`}
    >
      {label}
    </span>
  </div>
);

export default ResetPassword;
