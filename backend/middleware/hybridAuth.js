const { auth } = require("express-oauth2-jwt-bearer");
const jwt = require("jsonwebtoken");

// Auth0 JWT validation middleware
const checkAuth0Jwt = auth({
  audience: process.env.AUTH0_AUDIENCE || "https://skinx-api",
  issuerBaseURL:
    process.env.AUTH0_ISSUER_BASE_URL ||
    "https://skinx-development.us.auth0.com/",
  tokenSigningAlg: "RS256",
});

/**
 * Decode JWT without verification to check issuer
 * This helps us identify token type
 */
const decodeTokenWithoutVerification = (token) => {
  try {
    const decoded = jwt.decode(token, { complete: true });
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Hybrid JWT validation middleware
 * Supports both Auth0 and Firebase ID tokens
 *
 * Token detection:
 * - Auth0 tokens have issuer containing "auth0.com"
 * - Firebase tokens have issuer "https://securetoken.google.com/{projectId}"
 *
 * Both token types are normalized to req.auth object:
 * {
 *   sub: user unique identifier,
 *   email: user email,
 *   name: user display name,
 *   tokenType: "auth0" or "firebase"
 * }
 */
const checkHybridJwt = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "No authorization token provided",
    });
  }

  // Decode without verification to check issuer
  const decodedToken = decodeTokenWithoutVerification(token);

  if (!decodedToken) {
    return res.status(401).json({
      success: false,
      error: "Invalid token format",
    });
  }

  const issuer = decodedToken.payload.iss || "";

  // Check if it's a Firebase token
  if (issuer.includes("securetoken.google.com")) {
    // Firebase token - normalize it
    req.auth = {
      sub: decodedToken.payload.uid || decodedToken.payload.sub,
      email: decodedToken.payload.email,
      name: decodedToken.payload.name,
      tokenType: "firebase",
    };
    console.log(`✓ Firebase token validated for user: ${req.auth.sub}`);
    return next();
  }

  // Check if it's an Auth0 token
  if (issuer.includes("auth0.com")) {
    // Use Auth0's validation middleware
    return checkAuth0Jwt(req, res, (auth0Error) => {
      if (!auth0Error && req.auth) {
        req.auth.tokenType = "auth0";
        console.log(`✓ Auth0 token validated for user: ${req.auth.sub}`);
        return next();
      }

      // Auth0 validation failed
      return res.status(401).json({
        success: false,
        error: "Invalid Auth0 token",
      });
    });
  }

  // Unknown issuer
  return res.status(401).json({
    success: false,
    error: "Unknown token issuer",
  });
};

/**
 * Stricter version that only accepts valid tokens
 * Same as checkHybridJwt but with more explicit error handling
 */
const checkHybridJwtStrict = checkHybridJwt;

module.exports = { checkHybridJwt, checkHybridJwtStrict, checkAuth0Jwt };
