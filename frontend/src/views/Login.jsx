import React, { useState } from "react";
import { Eye, EyeOff, Mail } from "lucide-react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import Auth0Login from "../components/Auth0Login";
import TurnstileWidget from "../components/TurnstileWidget";

const Login = () => {
  const navigate = useNavigate();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Validation & Loading
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");

  // Validate email
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", data.name || data.fullName || "User");
        localStorage.setItem("userEmail", data.email || email);

        // Generate or use userId for session isolation
        const userId =
          data.userId ||
          `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem("userId", userId);

        navigate("/dashboard");
      } else {
        setErrors({ submit: data.message || "Login failed" });
      }
    } catch (_error) {
      setErrors({ submit: "Network error. Please try again." });
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
      <Navbar isDark={true} toggleTheme={() => {}} alwaysOpaque={true} />

      {/* Main Content */}
      <div className="pt-16 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Login Form Card */}
          <div className="rounded-2xl p-5 md:p-7 shadow-2xl bg-white">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center text-[#1e293b]">
              Log In
            </h1>

            {/* Auth0 Login (Google, GitHub, Microsoft, Facebook) */}
            <Auth0Login />

            {/* Divider */}
            <div className="my-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="text-sm text-gray-500 font-medium">
                  Or continue with email
                </span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2 text-gray-700"
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
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div>
                <a
                  href="/forgot-password"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium underline"
                >
                  Forgot password?
                </a>
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

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading || !turnstileToken}
                className="w-full bg-[#5b7bc5] hover:bg-[#4a6ab4] text-white font-semibold py-3 px-6 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Logging in..." : "Log In"}
              </button>

              {/* Not a member? */}
              <div className="text-center space-y-3">
                <p className="text-sm text-gray-600">Not a member?</p>
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="w-full border-2 border-[#5b7bc5] text-[#5b7bc5] hover:bg-blue-50 font-semibold py-3 px-6 rounded-full transition-all duration-200"
                >
                  Register
                </button>
              </div>
            </form>
          </div>

          {/* Footer */}
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

export default Login;
