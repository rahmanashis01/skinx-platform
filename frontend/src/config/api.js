/**
 * ═══════════════════════════════════════════════════════════════
 * 🔧 API CONFIGURATION
 * ═══════════════════════════════════════════════════════════════
 * Centralized API configuration for SkinX application
 * Handles both development and production environments
 * ═══════════════════════════════════════════════════════════════
 */

// Get backend URL from environment or fallback to production domain
const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_URL ||
  "https://skin-x.app";

// Remove trailing slash if present
const BASE_URL = BACKEND_URL.replace(/\/$/, "");

/**
 * API Configuration Object
 */
export const API_CONFIG = {
  BASE_URL,
  ENDPOINTS: {
    // Auth endpoints
    REGISTER: `${BASE_URL}/api/register`,
    LOGIN: `${BASE_URL}/api/login`,
    VERIFY_OTP: `${BASE_URL}/api/verify-otp`,
    RESEND_OTP: `${BASE_URL}/api/resend-otp`,
    FORGOT_PASSWORD: `${BASE_URL}/api/forgot-password`,
    RESET_PASSWORD: `${BASE_URL}/api/reset-password`,

    // User endpoints
    USER_PROFILE: `${BASE_URL}/api/user/profile`,
    UPDATE_PROFILE: `${BASE_URL}/api/user/update`,
    DELETE_ACCOUNT: `${BASE_URL}/api/user/delete`,

    // Scan endpoints
    ANALYZE: `${BASE_URL}/api/analyze`,
    SCAN_HISTORY: `${BASE_URL}/api/scans/history`,
    SCAN_DETAIL: `${BASE_URL}/api/scans/detail`,
  },
};

/**
 * Default fetch options with credentials
 */
export const defaultFetchOptions = {
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
};

/**
 * Utility function to make API calls with proper error handling
 * @param {string} endpoint - API endpoint URL
 * @param {object} options - Fetch options
 * @returns {Promise<object>} Response data
 */
export async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(endpoint, {
      ...defaultFetchOptions,
      ...options,
      headers: {
        ...defaultFetchOptions.headers,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "API request failed");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

/**
 * Utility function to make authenticated API calls
 * @param {string} endpoint - API endpoint URL
 * @param {object} options - Fetch options
 * @returns {Promise<object>} Response data
 */
export async function authenticatedApiCall(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No authentication token found");
  }

  return apiCall(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

// Log current configuration in development
if (import.meta.env.DEV) {
  console.log("🔧 API Configuration:", {
    BASE_URL,
    ENV: import.meta.env.MODE,
  });
}

export default API_CONFIG;
