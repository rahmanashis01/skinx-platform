import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

const AuthCallback = () => {
  const { isAuthenticated, user, getAccessTokenSilently, isLoading, error } =
    useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      console.log(
        "🔄 AuthCallback: isLoading=",
        isLoading,
        "isAuthenticated=",
        isAuthenticated,
        "error=",
        error,
      );

      if (isLoading) {
        console.log("⏳ Still loading from Auth0...");
        return;
      }

      if (error) {
        console.error("❌ Auth0 error:", error.message);
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      if (isAuthenticated && user) {
        console.log("✅ Auth0 callback successful, user:", user.email);
        try {
          const token = await getAccessTokenSilently();
          localStorage.setItem("token", token);
          localStorage.setItem("userName", user.name || user.email);
          localStorage.setItem("userEmail", user.email);

          // Generate or use userId for session isolation
          const userId =
            user.sub ||
            `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem("userId", userId);

          console.log("✅ Token stored, redirecting to dashboard");
          navigate("/dashboard");
        } catch (err) {
          console.error("❌ Token error:", err);
          navigate("/login");
        }
      } else {
        console.log("⚠️ Not authenticated, redirecting to login");
        navigate("/login");
      }
    };

    handleCallback();
  }, [
    isLoading,
    isAuthenticated,
    user,
    error,
    navigate,
    getAccessTokenSilently,
  ]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 to-red-700">
        <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Authentication Error
          </h2>
          <p className="text-gray-600 mb-6">{error.message}</p>
          <button
            onClick={() => navigate("/login")}
            className="bg-red-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-700 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800">
      <div className="text-white text-center">
        <div className="relative">
          {/* Animated spinner */}
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-white mx-auto mb-6"></div>
          {/* Pulsing inner circle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-12 h-12 bg-white/20 rounded-full animate-pulse"></div>
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">Completing sign in...</h2>
        <p className="text-blue-200">
          Please wait while we set up your account
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
