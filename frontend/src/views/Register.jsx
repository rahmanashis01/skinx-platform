import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, User } from "lucide-react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import Auth0Login from "../components/Auth0Login";
import TurnstileWidget from "../components/TurnstileWidget";

const Register = () => {
  const [isDark, setIsDark] = useState(false);
  const [step, setStep] = useState(1); // 1: Registration form, 2: OTP verification
  const navigate = useNavigate();

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP state
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  // Validation & Loading
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");

  const toggleTheme = () => setIsDark((prev) => !prev);

  // Resend timer countdown
  useEffect(() => {
    if (step === 2 && resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
  }, [step, resendTimer]);

  // Validate email
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Validate password strength
  const validatePassword = (password) => {
    return password.length >= 8;
  };

  // Handle registration form submission
  const handleRegister = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validation
    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(password)) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!acceptTerms) {
      newErrors.terms = "You must accept the Terms of Use and Privacy Policy";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      // TODO: Replace with your actual API endpoint
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fullName: fullName.trim(), email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Move to OTP verification step
        setStep(2);
        setResendTimer(60);
        setCanResend(false);
      } else {
        setErrors({ submit: data.message || "Registration failed" });
      }
    } catch (_error) {
      setErrors({ submit: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setOtpError("");

    try {
      // TODO: Replace with your actual API endpoint
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        // Registration successful - store user info and redirect to dashboard
        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", fullName.trim());
        localStorage.setItem("userEmail", email);

        // Generate or use userId for session isolation
        const userId =
          data.userId ||
          `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem("userId", userId);

        navigate("/dashboard");
      } else {
        setOtpError(data.message || "Invalid OTP. Please try again.");
      }
    } catch (_error) {
      setOtpError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;

    setIsLoading(true);
    try {
      // TODO: Replace with your actual API endpoint
      const response = await fetch("/api/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setResendTimer(60);
        setCanResend(false);
        setOtpError("");
        alert("OTP has been resent to your email!");
      }
    } catch (_error) {
      setOtpError("Failed to resend OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(ellipse at 28% 58%, #1d4ac4 0%, #183a9e 28%, #0e1b5a 62%, #09133f 100%)",
      }}
    >
      {/* Navbar */}
      <Navbar isDark={true} toggleTheme={toggleTheme} alwaysOpaque={true} />

      {/* Main Content */}
      <div className="pt-16 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {step === 1 ? (
            /* Registration Form */
            <div className="rounded-2xl p-5 md:p-7 shadow-2xl bg-white">
              <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center text-[#1e293b]">
                Register
              </h1>

              {/* Auth0 Login (Google, GitHub, Microsoft, Facebook) */}
              <Auth0Login />

              {/* Divider */}
              <div className="my-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-gray-300"></div>
                  <span className="text-sm text-gray-500 font-medium">
                    Or register with email
                  </span>
                  <div className="flex-1 h-px bg-gray-300"></div>
                </div>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                {/* Full Name Field */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium mb-2 text-gray-700"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={`w-full px-4 py-2.5 pr-10 rounded-lg border ${
                        errors.fullName
                          ? "border-red-500"
                          : "border-gray-300 bg-white text-gray-900"
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                      placeholder="Enter your full name"
                    />
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  </div>
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.fullName}
                    </p>
                  )}
                </div>

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
                      className={`w-full px-4 py-2.5 pr-10 rounded-lg border ${
                        errors.email
                          ? "border-red-500"
                          : "border-gray-300 bg-white text-gray-900"
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                      placeholder="Enter your email"
                    />
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                  <p className="text-sm mt-2 text-gray-600">
                    Please enter a valid email address, the link with register
                    confirmation will be send on it
                  </p>
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium mb-2 text-gray-700"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full px-4 py-2.5 pr-10 rounded-lg border ${
                        errors.password
                          ? "border-red-500"
                          : "border-gray-300 bg-white text-gray-900"
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-500" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium mb-2 text-gray-700"
                  >
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full px-4 py-2.5 pr-10 rounded-lg border ${
                        errors.confirmPassword
                          ? "border-red-500"
                          : "border-gray-300 bg-white text-gray-900"
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-500" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Terms Checkbox */}
                <div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      I accept the{" "}
                      <a
                        href="/terms-of-use"
                        className="text-blue-600 hover:text-blue-700 underline"
                      >
                        Terms of Use
                      </a>{" "}
                      and{" "}
                      <a
                        href="/privacy-policy"
                        className="text-blue-600 hover:text-blue-700 underline"
                      >
                        Privacy Policy
                      </a>
                    </span>
                  </label>
                  {errors.terms && (
                    <p className="text-red-500 text-sm mt-1">{errors.terms}</p>
                  )}
                </div>

                {/* Cloudflare Turnstile */}
                <TurnstileWidget
                  onVerify={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken("")}
                  onError={() => setTurnstileToken("")}
                />

                {/* Submit Error */}
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {errors.submit}
                  </div>
                )}

                {/* Register Button */}
                <button
                  type="submit"
                  disabled={isLoading || !turnstileToken}
                  className="w-full bg-[#5b7bc5] hover:bg-[#4a6ab4] text-white font-semibold py-3 px-6 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Sending OTP..." : "Register"}
                </button>

                {/* Already have account */}
                <p className="text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <a
                    href="/login"
                    className="text-blue-600 hover:text-blue-700 font-medium underline"
                  >
                    Log In
                  </a>
                </p>
              </form>
            </div>
          ) : (
            /* OTP Verification Form */
            <div className="rounded-2xl p-5 md:p-7 shadow-2xl bg-white">
              <h1 className="text-2xl md:text-3xl font-bold mb-3 text-center text-[#1e293b]">
                Verify Your Email
              </h1>
              <p className="text-center mb-5 text-gray-600">
                We've sent a 6-digit verification code to{" "}
                <strong>{email}</strong>
              </p>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                {/* OTP Input */}
                <div>
                  <label
                    htmlFor="otp"
                    className="block text-sm font-medium mb-2 text-gray-700"
                  >
                    Enter OTP
                  </label>
                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="\d{6}"
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className={`w-full px-4 py-3 text-center text-2xl tracking-widest rounded-lg border ${
                      otpError
                        ? "border-red-500"
                        : "border-gray-300 bg-white text-gray-900"
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                    placeholder="000000"
                  />
                  {otpError && (
                    <p className="text-red-500 text-sm mt-1">{otpError}</p>
                  )}
                </div>

                {/* Verify Button */}
                <button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="w-full bg-[#5b7bc5] hover:bg-[#4a6ab4] text-white font-semibold py-3 px-6 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </button>

                {/* Resend OTP */}
                <div className="text-center">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-blue-600 hover:text-blue-700 font-medium underline"
                    >
                      Resend OTP
                    </button>
                  ) : (
                    <p className="text-sm text-gray-600">
                      Resend OTP in {resendTimer} seconds
                    </p>
                  )}
                </div>

                {/* Change Email */}
                <p className="text-center text-sm text-gray-600">
                  Wrong email?{" "}
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-blue-600 hover:text-blue-700 font-medium underline"
                  >
                    Go back
                  </button>
                </p>
              </form>
            </div>
          )}

          {/* Simple Footer */}
          <footer className="mt-8">
            <p className="text-center text-sm text-blue-200/60">
              © {new Date().getFullYear()} SkinX. All rights reserved.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Register;
