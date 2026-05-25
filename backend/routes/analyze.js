const express = require("express");
const router = express.Router();
const uploadPhotos = require("../middleware/uploadPhotos");
const {
  analyzePhoto,
  getAnalysisHistory,
  getServiceStats,
} = require("../controllers/analyzeController");

// Import auth middleware (from existing middleware)
const { checkJwt } = require("../middleware/auth");

/**
 * @route   POST /api/analyze-photo
 * @desc    Analyze uploaded skin lesion photos
 * @access  Private (requires JWT token)
 * @params  FormData with:
 *          - photos: File[] (1-3 images)
 *          - sessionData: JSON string {age, gender, region, skinTone, bodyArea}
 * @returns JSON with analysis results
 */
router.post(
  "/",
  checkJwt, // Verify JWT authentication
  uploadPhotos.array("photos", 3), // Handle file upload (max 3 photos)
  analyzePhoto, // Process analysis
);

/**
 * @route   POST /api/analyze-photo/public
 * @desc    Analyze uploaded skin lesion photos (PUBLIC - no auth required)
 * @access  Public (no JWT required - for landing page)
 * @params  FormData with:
 *          - photos: File[] (1-3 images)
 *          - sessionData: JSON string {age, gender, region, skinTone, bodyArea}
 * @returns JSON with analysis results
 */
router.post(
  "/public",
  uploadPhotos.array("photos", 3), // Handle file upload (max 3 photos)
  analyzePhoto, // Process analysis
);

/**
 * @route   GET /api/analyze-photo/history
 * @desc    Get user's analysis history
 * @access  Private (requires JWT token)
 * @returns JSON with array of past analyses
 */
router.get("/history", checkJwt, getAnalysisHistory);

/**
 * @route   GET /api/analyze-photo/stats
 * @desc    Get inference service statistics (for debugging/monitoring)
 * @access  Private (requires JWT token)
 * @returns JSON with service statistics
 */
router.get("/stats", checkJwt, getServiceStats);

// Error handling middleware for multer errors
router.use((error, req, res, next) => {
  if (error) {
    // Handle multer-specific errors
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "File too large. Maximum size is 10MB per photo.",
      });
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        error: "Too many files. Maximum 3 photos allowed.",
      });
    }

    if (error.message.includes("Invalid file type")) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    // Generic error
    return res.status(500).json({
      success: false,
      error: "File upload failed",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }

  next();
});

module.exports = router;
