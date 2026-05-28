/**
 * Model Configuration for Skin Lesion Analysis
 *
 * This configuration supports REST API integration with a Python-based
 * machine learning model service (Flask/FastAPI).
 *
 * Configure MODEL_API_URL in your environment for the production model-api service.
 */

module.exports = {
  // =================================================================
  // MODEL SERVICE CONFIGURATION
  // =================================================================

  /**
   * Model Type: 'rest_api' for Python microservice
   * Other options: 'pytorch', 'tensorflow', 'onnx' (not implemented yet)
   */
  modelType: process.env.MODEL_TYPE || "rest_api",

  /**
   * REST API Configuration
   * Update this URL when your Python model service is deployed
   */
  modelServiceUrl:
    process.env.MODEL_API_URL ||
    process.env.MODEL_SERVICE_URL ||
    "http://model-api:8080",

  /**
   * API Endpoints
   */
  endpoints: {
    predict: "/predict", // Main prediction endpoint
    health: "/health", // Health check endpoint
    modelInfo: "/debug/models", // Model metadata endpoint (debug-only)
  },

  /**
   * Request timeout (milliseconds)
   * Increase if model inference takes longer
   * Supports both MODEL_API_TIMEOUT_MS (preferred) and MODEL_TIMEOUT (legacy)
   */
  requestTimeout:
    parseInt(process.env.MODEL_API_TIMEOUT_MS || process.env.MODEL_TIMEOUT) ||
    120000, // 120 seconds

  /**
   * Retry configuration for failed requests
   */
  retry: {
    maxAttempts: 3,
    backoffMs: 1000, // Wait 1 second between retries
    retryOnTimeout: true,
  },

  // =================================================================
  // IMAGE PREPROCESSING CONFIGURATION
  // =================================================================

  /**
   * Image preprocessing parameters
   * These should match your model's training preprocessing
   */
  preprocessing: {
    // Target image size (width x height)
    imageSize: 224,

    // Normalization values (ImageNet defaults)
    // Update these if your model uses different normalization
    imageMean: [0.485, 0.456, 0.406], // RGB mean
    imageStd: [0.229, 0.224, 0.225], // RGB standard deviation

    // Image format
    colorSpace: "RGB", // 'RGB' or 'BGR'

    // Supported image formats
    supportedFormats: ["image/jpeg", "image/jpg", "image/png", "image/webp"],

    // Max file size (bytes) - 10MB
    maxFileSize: 10 * 1024 * 1024,

    // Image quality for JPEG compression (if needed)
    jpegQuality: 95,
  },

  // =================================================================
  // MODEL OUTPUT CONFIGURATION
  // =================================================================

  /**
   * Skin lesion condition labels
   * Update this list to match your model's output classes
   */
  conditions: [
    "melanoma",
    "atypical_nevus",
    "benign_nevus",
    "seborrheic_keratosis",
    "basal_cell_carcinoma",
    "squamous_cell_carcinoma",
    "actinic_keratosis",
    "dermatofibroma",
  ],

  /**
   * Human-readable condition names
   */
  conditionLabels: {
    melanoma: "Melanoma",
    atypical_nevus: "Atypical Nevus",
    benign_nevus: "Benign Nevus",
    seborrheic_keratosis: "Seborrheic Keratosis",
    basal_cell_carcinoma: "Basal Cell Carcinoma",
    squamous_cell_carcinoma: "Squamous Cell Carcinoma",
    actinic_keratosis: "Actinic Keratosis",
    dermatofibroma: "Dermatofibroma",
  },

  /**
   * Risk level thresholds
   * Adjust these based on your model's performance and clinical guidelines
   */
  riskThresholds: {
    high: 0.7, // >= 70% confidence = high risk
    medium: 0.4, // >= 40% confidence = medium risk
    low: 0.0, // < 40% confidence = low risk
  },

  /**
   * Severity determination
   * Maps conditions to severity levels
   */
  severityMapping: {
    melanoma: "severe",
    basal_cell_carcinoma: "severe",
    squamous_cell_carcinoma: "severe",
    atypical_nevus: "moderate",
    actinic_keratosis: "moderate",
    seborrheic_keratosis: "mild",
    benign_nevus: "mild",
    dermatofibroma: "mild",
  },

  // =================================================================
  // FEATURE FLAGS
  // =================================================================

  /**
   * Feature toggles
   */
  features: {
    // Use mock data when model service is unavailable
    useMockOnFailure: process.env.USE_MOCK_FALLBACK !== "false",

    // Enable model response caching
    enableCaching: process.env.ENABLE_MODEL_CACHE === "true",

    // Cache TTL in seconds (5 minutes)
    cacheTTL: 300,

    // Log detailed model requests/responses
    verboseLogging: process.env.NODE_ENV === "development",

    // Enable ABCDE criteria analysis
    enableABCDEAnalysis: true,

    // Enable multi-image analysis
    enableMultiImageAnalysis: true,
  },

  // =================================================================
  // MOCK DATA CONFIGURATION (FOR TESTING)
  // =================================================================

  /**
   * Mock data settings (used when model is not available)
   */
  mock: {
    enabled:
      process.env.USE_MOCK_DATA === "true" ||
      !(process.env.MODEL_API_URL || process.env.MODEL_SERVICE_URL),

    // Simulate processing delay (milliseconds)
    delay: 1500,

    // Default mock prediction
    defaultCondition: "benign_nevus",
    defaultConfidence: 0.65,
  },

  // =================================================================
  // SECURITY & VALIDATION
  // =================================================================

  /**
   * Security settings
   */
  security: {
    // Validate image content (detect malicious files)
    validateImageContent: true,

    // Check image dimensions
    minWidth: 50,
    maxWidth: 4096,
    minHeight: 50,
    maxHeight: 4096,

    // API authentication (if your Python service requires auth)
    apiKey: process.env.MODEL_API_KEY || null,

    // Use HTTPS for production
    useHTTPS: process.env.NODE_ENV === "production",
  },

  // =================================================================
  // MONITORING & LOGGING
  // =================================================================

  /**
   * Monitoring configuration
   */
  monitoring: {
    // Track inference metrics
    trackMetrics: true,

    // Log slow inferences (milliseconds)
    slowInferenceThreshold: 5000,

    // Alert on errors
    alertOnError: process.env.NODE_ENV === "production",
  },
};
