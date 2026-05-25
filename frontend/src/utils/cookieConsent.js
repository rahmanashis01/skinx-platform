/**
 * Cookie Consent Utility Functions
 * Handles checking and managing user cookie consent preferences
 */

/**
 * Check if user has given consent for cookies
 * @returns {boolean} True if user has consented, false otherwise
 */
export const hasConsent = () => {
  const consent = localStorage.getItem("cookieConsent");
  const expiry = localStorage.getItem("consentExpiry");

  // No consent found
  if (!consent || !expiry) {
    return false;
  }

  // Check if consent has expired
  const expiryDate = new Date(expiry);
  const now = new Date();

  if (expiryDate < now) {
    // Expired - clear and return false
    clearConsent();
    return false;
  }

  // Valid consent exists
  return consent === "accepted";
};

/**
 * Check if user has explicitly rejected cookies
 * @returns {boolean} True if user rejected cookies
 */
export const hasRejected = () => {
  const consent = localStorage.getItem("cookieConsent");
  return consent === "rejected";
};

/**
 * Get the current consent status
 * @returns {string|null} 'accepted', 'rejected', or null if no choice made
 */
export const getConsentStatus = () => {
  const consent = localStorage.getItem("cookieConsent");
  const expiry = localStorage.getItem("consentExpiry");

  if (!consent || !expiry) {
    return null;
  }

  // Check expiration
  const expiryDate = new Date(expiry);
  const now = new Date();

  if (expiryDate < now) {
    clearConsent();
    return null;
  }

  return consent;
};

/**
 * Get consent metadata (date, expiry, etc.)
 * @returns {Object|null} Consent metadata or null
 */
export const getConsentMetadata = () => {
  const consent = localStorage.getItem("cookieConsent");
  const consentDate = localStorage.getItem("consentDate");
  const consentExpiry = localStorage.getItem("consentExpiry");

  if (!consent) {
    return null;
  }

  return {
    status: consent,
    consentDate: consentDate ? new Date(consentDate) : null,
    expiryDate: consentExpiry ? new Date(consentExpiry) : null,
    daysUntilExpiry: consentExpiry
      ? Math.ceil((new Date(consentExpiry) - new Date()) / (1000 * 60 * 60 * 24))
      : null,
  };
};

/**
 * Clear all consent data
 */
export const clearConsent = () => {
  localStorage.removeItem("cookieConsent");
  localStorage.removeItem("consentDate");
  localStorage.removeItem("consentExpiry");
};

/**
 * Reset consent to show modal again
 */
export const resetConsent = () => {
  clearConsent();
  // Dispatch event to notify components
  window.dispatchEvent(new CustomEvent("consentReset"));
};

/**
 * Check if analytics can be loaded
 * @returns {boolean} True if analytics should be loaded
 */
export const canUseAnalytics = () => {
  return hasConsent();
};

/**
 * Check if tracking pixels can be loaded
 * @returns {boolean} True if tracking is allowed
 */
export const canUseTracking = () => {
  return hasConsent();
};

/**
 * Check if personalization features can be used
 * @returns {boolean} True if personalization is allowed
 */
export const canUsePersonalization = () => {
  return hasConsent();
};

/**
 * Set a cookie with respect to user consent
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} days - Days until expiration
 * @param {boolean} essential - Is this an essential cookie?
 */
export const setCookie = (name, value, days = 365, essential = false) => {
  // Always allow essential cookies
  if (!essential && !hasConsent()) {
    console.warn(`🚫 Cookie "${name}" not set - User has not consented`);
    return false;
  }

  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  return true;
};

/**
 * Get a cookie value
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null
 */
export const getCookie = (name) => {
  const nameEQ = name + "=";
  const cookies = document.cookie.split(";");

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === " ") {
      cookie = cookie.substring(1, cookie.length);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length, cookie.length);
    }
  }
  return null;
};

/**
 * Delete a cookie
 * @param {string} name - Cookie name
 */
export const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

/**
 * Delete all non-essential cookies
 */
export const deleteAllNonEssentialCookies = () => {
  const cookies = document.cookie.split(";");

  cookies.forEach((cookie) => {
    const cookieName = cookie.split("=")[0].trim();

    // Don't delete essential cookies
    const essentialCookies = ["token", "session", "auth", "cookieConsent"];
    if (!essentialCookies.some((essential) => cookieName.includes(essential))) {
      deleteCookie(cookieName);
    }
  });
};

/**
 * Initialize analytics based on consent
 */
export const initializeAnalyticsIfConsented = () => {
  if (canUseAnalytics()) {
    console.log("✅ Initializing analytics - User has consented");

    // Initialize Google Analytics
    if (window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "granted",
      });
    }

    // Initialize other analytics tools here
    // Example: Facebook Pixel, Hotjar, etc.

    return true;
  } else {
    console.log("🚫 Analytics blocked - No consent given");

    // Block Google Analytics
    if (window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: "denied",
        ad_storage: "denied",
      });
    }

    return false;
  }
};

/**
 * Listen for consent changes
 * @param {Function} callback - Function to call when consent changes
 * @returns {Function} Cleanup function to remove listener
 */
export const onConsentChange = (callback) => {
  const handler = (event) => {
    callback(event.detail);
  };

  window.addEventListener("cookieConsentChanged", handler);

  // Return cleanup function
  return () => {
    window.removeEventListener("cookieConsentChanged", handler);
  };
};

/**
 * Log current consent status (for debugging)
 */
export const logConsentStatus = () => {
  const metadata = getConsentMetadata();

  if (!metadata) {
    console.log("ℹ️ No consent data found");
    return;
  }

  console.group("🍪 Cookie Consent Status");
  console.log("Status:", metadata.status);
  console.log("Consent Date:", metadata.consentDate?.toLocaleDateString());
  console.log("Expires:", metadata.expiryDate?.toLocaleDateString());
  console.log("Days Until Expiry:", metadata.daysUntilExpiry);
  console.log("Can Use Analytics:", canUseAnalytics());
  console.groupEnd();
};
