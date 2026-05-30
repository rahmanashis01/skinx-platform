'use strict';

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const logger = require('../utils/logger');

// Use environment variable or default to /app/tmp for container deployments
const TMP_DIR = process.env.TMP_DIR || '/app/tmp';

/**
 * Returns the SkinX backend base URL (trailing slash stripped).
 */
function getBaseUrl() {
  const baseUrl =
    process.env.BACKEND_API_URL ||
    process.env.SKINX_BACKEND_URL ||
    (process.env.NODE_ENV === 'production'
      ? 'http://backend:5001'
      : 'http://127.0.0.1:5001');
  return baseUrl.replace(/\/$/, '');
}

/**
 * Default session data sent alongside every photo analysis request.
 * In a future phase these values can be collected from the user via a form.
 */
const DEFAULT_SESSION_DATA = {
  age: 30,
  gender: 'unknown',
  region: 'unknown',
  skinTone: 'unknown',
  bodyArea: 'unknown',
};

/**
 * Error codes returned by the SkinX backend that we handle with specific messages.
 */
const ERROR_MESSAGES = {
  NON_SKIN_INPUT:
    '🚫 No skin detected. Please upload a clear skin-lesion image.',
  NON_CLINICAL_INPUT:
    '📸 Image quality is too low. Please retake with better lighting and focus.',
  MODEL_INFERENCE_FAILED:
    '⚠️ AI image analysis is temporarily unavailable. Please try again later.',
};

/**
 * Download a file from a URL and save it locally.
 *
 * Ensures the destination directory exists before writing.
 * Waits for the write stream to finish before resolving.
 *
 * @param {string} fileUrl - The HTTPS URL to download from
 * @param {string} destPath - Absolute path to save the file
 */
async function downloadFile(fileUrl, destPath) {
  // Ensure destination directory exists
  const destDir = path.dirname(destPath);
  try {
    fs.mkdirSync(destDir, { recursive: true });
  } catch (err) {
    logger.error(`[downloadFile] Failed to create directory ${destDir}: ${err.message}`);
    throw err;
  }

  const response = await axios.get(fileUrl, { responseType: 'stream', timeout: 30000 });
  const writer = fs.createWriteStream(destPath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => {
      logger.debug(`[downloadFile] write stream finished for ${destPath}`);
      resolve();
    });
    writer.on('error', reject);
  });
}

/**
 * Safely delete a temp file — never throws.
 */
function cleanupFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`[photoService] cleaned up ${filePath}`);
    }
  } catch (err) {
    logger.warn(`[photoService] failed to clean up ${filePath}: ${err.message}`);
  }
}

/**
 * Send a skin photo to the SkinX Node backend for analysis.
 *
 * POST ${BACKEND_API_URL}/api/analyze-photo/public
 * Content-Type: multipart/form-data
 *   - photos: image file
 *   - sessionData: JSON string
 *
 * @param {string} imagePath - Absolute path to the image file on disk
 * @returns {Promise<object>} - The analysis result from the backend
 * @throws {Error} err.code may be 'SKINX_TIMEOUT', 'NON_SKIN_INPUT', etc.
 */
async function analyzePhoto(imagePath) {
  const url = `${getBaseUrl()}/api/analyze-photo/public`;

  // ── 1. Log request details ───────────────────────────────────────────────────
  logger.info(`[photoService] ► POST ${url}`);
  logger.info(`[photoService]   image path : ${imagePath}`);

  const form = new FormData();
  form.append('photos', fs.createReadStream(imagePath));
  form.append('sessionData', JSON.stringify(DEFAULT_SESSION_DATA));

  // Log every FormData key being sent
  const formKeys = Object.keys(form.getHeaders()).length
    ? ['photos', 'sessionData']   // keys we appended above
    : [];
  logger.debug(`[photoService]   form keys  : ${formKeys.join(', ')}`);
  logger.debug(`[photoService]   sessionData: ${JSON.stringify(DEFAULT_SESSION_DATA)}`);

  let response;
  try {
    response = await axios.post(url, form, {
      headers: { ...form.getHeaders() },
      timeout: 90000, // 90 s — image analysis can be slow
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    // ── 2. Log success response ──────────────────────────────────────────────
    logger.info(`[photoService] ◄ Response status : ${response.status}`);
    logger.debug(`[photoService]   Response body  : ${JSON.stringify(response.data)}`);

  } catch (err) {
    // ── 3. Log full error details ────────────────────────────────────────────
    console.error('[photoService] ✖ Request failed');
    console.error('[photoService]   error.message        :', err.message);
    console.error('[photoService]   error.code           :', err.code);
    console.error('[photoService]   error.response.status:', err.response?.status ?? 'N/A');
    console.error('[photoService]   error.response.data  :', JSON.stringify(err.response?.data ?? null, null, 2));

    // Timeout
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      const timeoutErr = new Error('Image analysis timed out after 90 s.');
      timeoutErr.code = 'SKINX_TIMEOUT';
      throw timeoutErr;
    }

    // Backend returned an error response with a known error code
    const backendCode = err.response?.data?.error?.code || err.response?.data?.code;
    if (backendCode && ERROR_MESSAGES[backendCode]) {
      const knownErr = new Error(ERROR_MESSAGES[backendCode]);
      knownErr.code = backendCode;
      throw knownErr;
    }

    throw err;
  }

  // Check response-level error codes (some backends return 200 with an error payload)
  const data = response.data;
  const responseCode = data?.error?.code || data?.code;
  if (responseCode && ERROR_MESSAGES[responseCode]) {
    logger.warn(`[photoService] Backend returned error code in 200 body: ${responseCode}`);
    const knownErr = new Error(ERROR_MESSAGES[responseCode]);
    knownErr.code = responseCode;
    throw knownErr;
  }

  logger.info(`[photoService] ✔ Analysis complete`);
  return data;
}

module.exports = { analyzePhoto, downloadFile, cleanupFile, ERROR_MESSAGES };
