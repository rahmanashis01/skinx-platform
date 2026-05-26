const { v4: uuidv4 } = require("uuid");
const inferenceService = require("../services/inferenceService");

/**
 * Photo Analysis Controller
 * Handles photo upload and analysis requests
 *
 * Updated to use InferenceService for model predictions
 *
 * NOTE: Currently uses in-memory storage (localStorage/sessionStorage)
 * DEPLOYMENT READY: Replace with PostgreSQL by:
 * 1. Create 'analyses' table (schema below)
 * 2. Replace localStorage calls with db queries
 * 3. Add user_id from req.auth.sub (JWT)
 *
 * PostgreSQL Schema:
 * CREATE TABLE analyses (
 *   id UUID PRIMARY KEY,
 *   user_id VARCHAR(255) NOT NULL,
 *   timestamp TIMESTAMP DEFAULT NOW(),
 *   photo_count INTEGER,
 *   condition VARCHAR(255),
 *   severity VARCHAR(50),
 *   confidence DECIMAL(3,2),
 *   risk_level VARCHAR(50),
 *   description TEXT,
 *   observations JSONB,
 *   suggestions JSONB,
 *   session_data JSONB,
 *   metadata JSONB
 * );
 */

/**
 * Analyze uploaded skin lesion photos
 * @route POST /api/analyze-photo
 */
exports.analyzePhoto = async (req, res) => {
  try {
    // 1. Validate files exist
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No photos uploaded. Please upload at least 1 photo.",
      });
    }

    // 2. Validate photo count (1-3 photos)
    if (req.files.length > 3) {
      return res.status(400).json({
        success: false,
        error: "Maximum 3 photos allowed per analysis.",
      });
    }

    // 3. Extract and validate sessionData
    let sessionData;
    try {
      sessionData =
        typeof req.body.sessionData === "string"
          ? JSON.parse(req.body.sessionData)
          : req.body.sessionData;
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: "Invalid sessionData format. Must be valid JSON.",
      });
    }

    // Detect if this is the public route
    const isPublicRoute =
      req.path === "/public" || req.route.path === "/public";

    if (isPublicRoute) {
      // Public route: Apply defaults for missing fields
      sessionData = sessionData || {};
      sessionData.age = sessionData.age || 30;
      sessionData.gender = sessionData.gender || "unknown";
      sessionData.region = sessionData.region || "unknown";
      sessionData.skinTone = sessionData.skinTone || "unknown";
      sessionData.bodyArea = sessionData.bodyArea || "unknown";
    } else {
      // Private authenticated route: Strict validation
      const requiredFields = [
        "age",
        "gender",
        "region",
        "skinTone",
        "bodyArea",
      ];
      const missingFields = requiredFields.filter(
        (field) => !sessionData[field],
      );

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Missing required fields: ${missingFields.join(", ")}`,
        });
      }
    }

    // 4. Prepare image data for inference service
    const imageData = req.files.map((file) => ({
      buffer: file.buffer,
      mimetype: file.mimetype,
      size: file.size,
      originalname: file.originalname,
    }));

    console.log(`📸 Processing ${imageData.length} photo(s) for analysis...`);
    console.log(
      `👤 Patient context: Age ${sessionData.age}, ${sessionData.gender}, ${sessionData.region}`,
    );

    // 5. Call inference service for analysis
    const analysis = await inferenceService.analyzeImages(
      imageData,
      sessionData,
      {
        routeType: isPublicRoute ? "public" : "authenticated",
      },
    );

    // 6. Generate doctor suggestions based on analysis
    const suggestions = generateSuggestions(analysis);

    // 7. Generate unique analysis ID
    const analysisId = uuidv4();

    // 8. Prepare response data
    const responseData = {
      success: true,
      analysisId: analysisId,
      timestamp: new Date().toISOString(),
      photoCount: imageData.length,
      analysis: analysis,
      suggestions: suggestions,
      metadata: {
        modelStatus: analysis.metadata?.modelVersion || "model",
        processingTime: analysis.metadata?.processingTime || null,
        source: "model",
      },
    };

    // TODO: Save to database when PostgreSQL is connected
    // Example:
    // const userId = req.auth?.sub || req.user?.id;
    // await db.query(`
    //   INSERT INTO analyses (id, user_id, timestamp, photo_count, condition,
    //     severity, confidence, risk_level, description, observations,
    //     suggestions, session_data, metadata)
    //   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    // `, [analysisId, userId, new Date(), imageData.length, analysis.condition,
    //     analysis.severity, analysis.confidence, analysis.riskLevel,
    //     analysis.description, JSON.stringify(analysis.observations),
    //     JSON.stringify(suggestions), JSON.stringify(sessionData),
    //     JSON.stringify(responseData.metadata)]);

    // 9. Return structured response
    return res.json(responseData);
  } catch (error) {
    console.error("❌ Analysis error:", error);

    // Handle specific multer errors
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "File size too large. Maximum 10MB per photo.",
      });
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        error: "Too many files. Maximum 3 photos allowed.",
      });
    }

    // Image preprocessing errors
    if (error.message.includes("preprocessing")) {
      return res.status(400).json({
        success: false,
        error: "Invalid image format. Please upload JPEG, PNG, or WebP images.",
      });
    }

    // Forward structured errors from model service
    if (error.code && error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        code: error.code,
        error: error.message,
        details: error.details || null,
      });
    }

    // Generic error response
    return res.status(500).json({
      success: false,
      code: "ANALYSIS_ERROR",
      error: error.message || "Analysis failed. Please try again later.",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Generate doctor consultation suggestions based on analysis
 * @param {Object} analysis - Analysis result from inference service
 * @returns {Array} List of actionable suggestions
 */
function generateSuggestions(analysis) {
  const suggestions = [];

  // High-risk suggestions
  if (analysis.riskLevel === "high") {
    suggestions.push(
      "🚨 Schedule an urgent appointment with a dermatologist within 1-2 weeks",
    );
    suggestions.push(
      "Request a dermoscopy examination for detailed visual analysis",
    );
    suggestions.push(
      "Prepare for potential biopsy if recommended by your healthcare provider",
    );
    suggestions.push(
      "Document any changes in the lesion (size, color, shape, bleeding, itching)",
    );
  }
  // Medium-risk suggestions
  else if (analysis.riskLevel === "medium") {
    suggestions.push(
      "📅 Schedule an appointment with a dermatologist within 2-4 weeks",
    );
    suggestions.push(
      "Monitor the lesion closely for any changes in size, color, or shape",
    );
    suggestions.push("Take regular photos to track progression over time");
    suggestions.push("Keep a log of any symptoms (itching, bleeding, pain)");
  }
  // Low-risk suggestions
  else {
    suggestions.push(
      "✅ Consider scheduling a routine skin check with a healthcare provider",
    );
    suggestions.push("Continue monitoring the area for any changes");
    suggestions.push(
      "Maintain regular full-body skin examinations every 6-12 months",
    );
  }

  // General recommendations (for all risk levels)
  suggestions.push(
    "☀️ Avoid direct sun exposure and use SPF 50+ broad-spectrum sunscreen daily",
  );
  suggestions.push("⚠️ Do not attempt self-diagnosis or self-treatment");
  suggestions.push(
    "📋 Keep a record of this analysis to share with your healthcare provider",
  );

  // Add severity-specific recommendations
  if (analysis.severity === "severe") {
    suggestions.push(
      "🏥 Seek medical attention promptly - this requires professional evaluation",
    );
  }

  return suggestions;
}

/**
 * Get analysis history for a user
 * @route GET /api/analyze-photo/history
 *
 * TODO: Database Implementation
 * Replace in-memory storage with PostgreSQL query:
 * SELECT * FROM analyses WHERE user_id = $1 ORDER BY timestamp DESC LIMIT $2 OFFSET $3
 */
exports.getAnalysisHistory = async (req, res) => {
  try {
    // Get user ID from JWT token (Auth0)
    const userId = req.auth?.sub || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // TODO: Replace with PostgreSQL query
    // const result = await db.query(`
    //   SELECT id, timestamp, photo_count, condition, severity,
    //          confidence, risk_level, metadata
    //   FROM analyses
    //   WHERE user_id = $1
    //   ORDER BY timestamp DESC
    //   LIMIT $2 OFFSET $3
    // `, [userId, limit, offset]);
    //
    // const total = await db.query(
    //   'SELECT COUNT(*) FROM analyses WHERE user_id = $1',
    //   [userId]
    // );

    return res.json({
      success: true,
      message: "Analysis history feature - database integration pending",
      analyses: [], // Will be: result.rows
      pagination: {
        page: page,
        limit: limit,
        total: 0, // Will be: total.rows[0].count
        pages: 0, // Will be: Math.ceil(total.rows[0].count / limit)
      },
      userId: userId,
      note: "Currently using in-memory storage. PostgreSQL integration ready.",
    });
  } catch (error) {
    console.error("❌ History retrieval error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to retrieve analysis history",
    });
  }
};

/**
 * Get inference service statistics (admin/debug endpoint)
 * @route GET /api/analyze-photo/stats
 */
exports.getServiceStats = async (req, res) => {
  try {
    const stats = inferenceService.getStats();

    return res.json({
      success: true,
      stats: stats,
    });
  } catch (error) {
    console.error("❌ Stats retrieval error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to retrieve service statistics",
    });
  }
};
