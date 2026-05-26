/**
 * Inference Service for Skin Lesion Analysis
 *
 * This service handles communication with the Python ML model service via REST API.
 * Integrates with the production SkinX model-api service via REST.
 *
 * @module inferenceService
 */

const axios = require("axios");
const sharp = require("sharp");
const modelConfig = require("../config/modelConfig");
10;
class InferenceService {
  constructor() {
    this.initialized = false;
    this.modelAvailable = false;
    this.httpClient = null;
    this.requestCount = 0;
    this.errorCount = 0;
    this.lastHealthCheck = null;
  }

  /**
   * Initialize the inference service
   * Checks model service availability and configures HTTP client
   */
  async initialize() {
    try {
      console.log("🔧 Initializing Inference Service...");
      console.log(`📍 Model Type: ${modelConfig.modelType}`);
      console.log(`🌐 Model Service URL: ${modelConfig.modelServiceUrl}`);

      // Configure axios HTTP client
      this.httpClient = axios.create({
        baseURL: modelConfig.modelServiceUrl,
        timeout: modelConfig.requestTimeout,
        headers: {
          "User-Agent": "SkinLesionAnalyzer/1.0",
        },
      });

      // Add API key if configured
      if (modelConfig.security.apiKey) {
        this.httpClient.defaults.headers.common["X-API-Key"] =
          modelConfig.security.apiKey;
      }

      // Check if model service is available
      await this.healthCheck();

      this.initialized = true;
      console.log("✅ Inference Service initialized successfully");

      return true;
    } catch (error) {
      console.warn("⚠️  Model service not available, will use mock data");
      console.warn(`Error: ${error.message}`);

      this.initialized = true;
      this.modelAvailable = false;

      if (modelConfig.features.useMockOnFailure) {
        console.log("✅ Inference Service initialized with mock fallback");
        return true;
      }

      throw new Error("Model service unavailable and mock fallback disabled");
    }
  }

  /**
   * Health check for model service
   * @returns {Promise<boolean>} Service health status
   */
  async healthCheck() {
    try {
      const response = await this.httpClient.get(modelConfig.endpoints.health, {
        timeout: 5000, // Quick timeout for health checks
      });

      this.modelAvailable = response.status === 200;
      this.lastHealthCheck = new Date();

      if (modelConfig.features.verboseLogging) {
        console.log("✅ Model service health check passed");
      }

      return true;
    } catch (error) {
      this.modelAvailable = false;
      this.lastHealthCheck = new Date();

      if (modelConfig.features.verboseLogging) {
        console.log("❌ Model service health check failed:", error.message);
      }

      return false;
    }
  }

  /**
   * Main analysis method - analyzes skin lesion images
   *
   * @param {Array} images - Array of image objects with buffer and metadata
   * @param {Object} sessionData - Patient metadata (age, gender, region, etc.)
   * @returns {Promise<Object>} Analysis result
   */
  async analyzeImages(images, sessionData, options = {}) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      this.requestCount++;

      const startTime = Date.now();

      // Always use real model service - no fallback
      console.log("🤖 Calling ML model service...");
      const result = await this.callModelService(images, sessionData, options);

      const duration = Date.now() - startTime;

      // Log performance metrics
      if (modelConfig.monitoring.trackMetrics) {
        console.log(`⏱️  Analysis completed in ${duration}ms`);

        if (duration > modelConfig.monitoring.slowInferenceThreshold) {
          console.warn(`⚠️  Slow inference detected: ${duration}ms`);
        }
      }

      return result;
    } catch (error) {
      this.errorCount++;
      console.error("❌ Analysis error:", error.message);

      // If error already has structured validation data, pass it through
      if (error.code || error.statusCode || error.details) {
        throw error;
      }

      // Generic error for true service failures
      const wrappedError = new Error(
        `Model inference failed: ${error.message}`,
      );
      wrappedError.code = "MODEL_INFERENCE_FAILED";
      wrappedError.statusCode = 503;
      throw wrappedError;
    }
  }

  /**
   * Call the actual Python model service via REST API
   *
   * Production contract:
   * - Public scans: POST /analyze/public
   * - Authenticated scans: POST /predict
   * - Multipart field: file
   * - Response shape: { prediction, report, ... }
   *
   * @param {Array} images - Uploaded images
   * @param {Object} sessionData - Patient context
   * @returns {Promise<Object>} Model prediction result
   */
  async callModelService(images, sessionData, options = {}) {
    try {
      const FormData = require("form-data");

      const routeType = options.routeType || "public";
      const endpoint =
        routeType === "authenticated"
          ? "/predict"
          : routeType === "telegram"
            ? "/analyze/telegram"
            : "/analyze/public";

      const primaryImage = images[0];
      const convertedImage = await this.convertToJpeg(primaryImage.buffer);

      // Create FormData
      const formData = new FormData();
      formData.append(
        "file",
        convertedImage,
        primaryImage.originalname || "analysis.jpg",
      );

      if (sessionData?.age != null) {
        formData.append("age", String(sessionData.age));
      }
      if (sessionData?.region) {
        formData.append("region", String(sessionData.region));
      }
      if (sessionData?.gender) {
        formData.append("gender", String(sessionData.gender));
      }
      if (sessionData?.skinTone) {
        formData.append("skin_tone", String(sessionData.skinTone));
      }
      if (sessionData?.notes) {
        formData.append("notes", String(sessionData.notes));
      }
      if (sessionData?.userId) {
        formData.append("user_id", String(sessionData.userId));
      }

      if (modelConfig.features.verboseLogging) {
        console.log("📤 Sending multipart request to model service:", {
          url: modelConfig.modelServiceUrl + endpoint,
          imageCount: images.length,
          routeType: routeType,
        });
      }

      if (images.length > 1) {
        console.warn(
          `⚠️ Model API accepts a single file. Using the first of ${images.length} uploaded images.`,
        );
      }

      // Make multipart POST request to Python model service
      const response = await this.httpClient.post(endpoint, formData, {
        headers: formData.getHeaders(),
      });

      if (modelConfig.features.verboseLogging) {
        console.log("📥 Model service response received");
      }

      // Parse and format the model response
      return this.parseModelResponse(response.data, sessionData);
    } catch (error) {
      console.error("❌ Model service call failed:", error.message);

      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);

        // Extract structured error from model response
        const modelDetail = error.response.data?.detail || error.response.data;

        // Create error with model's error details
        const wrappedError = new Error(
          modelDetail.message || modelDetail.error || error.message,
        );
        wrappedError.code = modelDetail.code || "MODEL_INFERENCE_FAILED";
        wrappedError.statusCode = error.response.status || 400;
        wrappedError.details = modelDetail;

        throw wrappedError;
      }

      // Network/unexpected errors
      throw new Error(`Model inference failed: ${error.message}`);
    }
  }

  /**
   * Convert image to JPEG if it's PNG or WebP
   * Python model API only accepts .jpg/.jpeg
   */
  async convertToJpeg(imageBuffer) {
    try {
      const metadata = await sharp(imageBuffer).metadata();

      // If already JPEG, return as-is
      if (metadata.format === "jpeg") {
        return imageBuffer;
      }

      // Convert PNG, WebP, etc. to JPEG
      if (["png", "webp", "gif", "tiff"].includes(metadata.format)) {
        const jpegBuffer = await sharp(imageBuffer)
          .jpeg({ quality: modelConfig.preprocessing.jpegQuality })
          .toBuffer();
        return jpegBuffer;
      }

      // Default: try to convert to JPEG
      const jpegBuffer = await sharp(imageBuffer)
        .jpeg({ quality: modelConfig.preprocessing.jpegQuality })
        .toBuffer();
      return jpegBuffer;
    } catch (error) {
      console.error("Image conversion error:", error);
      // Return original buffer if conversion fails
      return imageBuffer;
    }
  }

  /**
   * Parse model service response and convert to standard format
   *
   * @param {Object} modelResponse - Raw response from Python model
   * @param {Object} sessionData - Patient context for description
   * @returns {Object} Formatted analysis result
   */
  parseModelResponse(modelResponse, sessionData) {
    try {
      if (modelResponse?.prediction) {
        const prediction = modelResponse.prediction;
        const className = prediction.class_name || "Unknown Condition";
        const confidenceRaw = Number(prediction.confidence ?? 0);
        const confidence =
          confidenceRaw > 1 ? confidenceRaw / 100 : confidenceRaw;
        const riskLevel = prediction.risk_level || this.determineRiskLevel(confidence, className);
        const report = modelResponse.report || {};
        const findings = report.Findings || "";
        const context = report.ClinicalContext || "";
        const nextSteps = report.NextSteps || "";
        const description = [findings, context, nextSteps]
          .filter(Boolean)
          .join(" ");

        return {
          condition: className,
          severity:
            riskLevel === "high"
              ? "severe"
              : riskLevel === "medium-high"
                ? "moderate"
                : riskLevel === "medium"
                  ? "moderate"
                  : "mild",
          confidence: confidence,
          description:
            description || "Model API returned a result without a narrative summary.",
          observations: [
            `Risk level: ${riskLevel}`,
            `Validator passed: ${prediction.validator?.passed ? "yes" : "no"}`,
            `Segmentation available: ${prediction.segmentation?.available ? "yes" : "no"}`,
          ],
          riskLevel: riskLevel,
          possibleConditions: [
            {
              name: className,
              confidence: confidence,
            },
          ],
          metadata: {
            modelVersion: "1.0.0-production",
            routeType: modelResponse.route_type || null,
            filename: modelResponse.filename || null,
            validationOutput: prediction.validator || null,
            segmentation: prediction.segmentation || null,
          },
        };
      }

      // Expected model response format from Python API:
      // {
      //   label: "melanoma",
      //   malignant_probability: 0.87,
      //   validation: { ... },
      //   metadata: { ... }
      // }

      // Extract label and malignant_probability from Python model response
      const label = modelResponse.label || modelResponse.condition || "unknown";
      const confidence =
        modelResponse.malignant_probability || modelResponse.confidence || 0.5;

      // Map label to condition name
      const condition =
        modelConfig.conditionLabels[label] || label || "Unknown Condition";

      // Determine risk level based on confidence
      const riskLevel = this.determineRiskLevel(confidence, label);

      // Get severity from mapping or derive from confidence
      const severity =
        modelConfig.severityMapping[label] ||
        (confidence > 0.75 ? "severe" : confidence > 0.5 ? "moderate" : "mild");

      // Format possible conditions (if predictions array exists)
      let possibleConditions = [];
      if (
        modelResponse.predictions &&
        Array.isArray(modelResponse.predictions)
      ) {
        possibleConditions = modelResponse.predictions
          .slice(0, 5)
          .map((pred) => ({
            name: modelConfig.conditionLabels[pred.condition] || pred.condition,
            confidence: pred.confidence,
          }));
      } else {
        // Create single-item possible conditions from primary prediction
        possibleConditions = [
          {
            name: condition,
            confidence: confidence,
          },
        ];
      }

      // Generate observations from validation data or model output
      const observations = this.generateObservations(
        modelResponse.validation || modelResponse.abcde,
        { condition: label, confidence: confidence },
      );

      // Build description
      const description = this.generateDescription(
        { condition: label, confidence: confidence },
        possibleConditions.length,
        sessionData,
      );

      return {
        condition: condition,
        severity: severity,
        confidence: confidence,
        description: description,
        observations: observations,
        riskLevel: riskLevel,
        possibleConditions: possibleConditions,
        metadata: {
          modelVersion: modelResponse.metadata?.modelVersion || "v1.0",
          processingTime: modelResponse.metadata?.processingTime || null,
          validationOutput: modelResponse.validation || null,
        },
      };
    } catch (error) {
      console.error("Error parsing model response:", error);
      throw new Error(`Failed to parse model response: ${error.message}`);
    }
  }

  /**
   * Determine risk level based on confidence and condition type
   */
  determineRiskLevel(confidence, condition) {
    // High-risk conditions always get high risk if confidence is reasonable
    const highRiskConditions = [
      "melanoma",
      "basal_cell_carcinoma",
      "squamous_cell_carcinoma",
    ];

    if (
      highRiskConditions.includes(condition) &&
      confidence >= modelConfig.riskThresholds.medium
    ) {
      return "high";
    }

    // Use confidence thresholds
    if (confidence >= modelConfig.riskThresholds.high) {
      return "high";
    } else if (confidence >= modelConfig.riskThresholds.medium) {
      return "medium";
    } else {
      return "low";
    }
  }

  /**
   * Generate clinical observations
   */
  generateObservations(abcdeData, prediction) {
    const observations = [];

    // If ABCDE data available, use it
    if (abcdeData) {
      if (abcdeData.asymmetry > 0.5) {
        observations.push("Asymmetric shape detected (ABCDE criteria: A)");
      }
      if (abcdeData.border > 0.5) {
        observations.push(
          "Irregular border characteristics noted (ABCDE criteria: B)",
        );
      }
      if (abcdeData.color > 0.5) {
        observations.push(
          "Multiple color variations present (ABCDE criteria: C)",
        );
      }
      if (abcdeData.diameter) {
        observations.push(
          "Diameter measurement requires clinical assessment (ABCDE criteria: D)",
        );
      }
      if (abcdeData.evolving) {
        observations.push(
          "Changes in appearance should be monitored (ABCDE criteria: E)",
        );
      }
    } else {
      // Default observations based on condition
      observations.push(
        "Lesion characteristics analyzed using AI-powered image analysis",
      );
      observations.push(
        "Pattern recognition based on trained medical imaging model",
      );

      if (prediction.confidence > 0.7) {
        observations.push(
          "High confidence detection warrants professional evaluation",
        );
      }
    }

    return observations;
  }

  /**
   * Generate clinical description
   */
  generateDescription(prediction, imageCount, sessionData) {
    const conditionName =
      modelConfig.conditionLabels[prediction.condition] || prediction.condition;

    return (
      `Analysis of ${imageCount} image(s) shows characteristics consistent with ${conditionName}. ` +
      `Confidence level: ${(prediction.confidence * 100).toFixed(1)}%. ` +
      `Patient demographics: ${sessionData.age}yo ${sessionData.gender}, ${sessionData.region} region, ` +
      `${sessionData.skinTone} skin tone, lesion located on ${sessionData.bodyArea}. ` +
      `Professional dermatological evaluation is recommended for definitive diagnosis.`
    );
  }

  /**
   * Mock analysis for testing (used when model is not available)
   * This will be replaced by real model predictions when your Python service is ready
   */
  // getMockAnalysis() method removed - no fallback to mock data allowed

  /**
   * Get service statistics
   */
  getStats() {
    return {
      initialized: this.initialized,
      modelAvailable: this.modelAvailable,
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      successRate:
        this.requestCount > 0
          ? (
              ((this.requestCount - this.errorCount) / this.requestCount) *
              100
            ).toFixed(2) + "%"
          : "N/A",
      lastHealthCheck: this.lastHealthCheck,
      modelServiceUrl: modelConfig.modelServiceUrl,
    };
  }
}

// Export singleton instance
module.exports = new InferenceService();
