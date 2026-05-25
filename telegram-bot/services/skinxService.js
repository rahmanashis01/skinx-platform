'use strict';

const axios = require('axios');
const logger = require('../utils/logger');

// BASE_URL is read at call-time so a .env change + restart picks it up correctly.
// Supports both Docker internal URLs and local development values.
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
 * Send a skin-health question to the SkinX Node backend.
 * Calls POST ${BACKEND_API_URL}/api/ask
 *
 * @param {string} question - The user's question text
 * @returns {Promise<string>} - The answer string from the backend
 * @throws {Error} err.code === 'SKINX_TIMEOUT' on timeout, generic Error otherwise
 */
async function askQuestion(question) {
  const url = `${getBaseUrl()}/api/ask`;

  logger.info(`[skinxService] POST ${url} question="${question}"`);

  let response;
  try {
    response = await axios.post(
      url,
      { question },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000, // 60 s — RAG cold-start can be slow
      }
    );
  } catch (err) {
    // Distinguish timeout from other network errors
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      const timeoutErr = new Error('Request timed out after 60 s.');
      timeoutErr.code = 'SKINX_TIMEOUT';
      throw timeoutErr;
    }
    throw err;
  }

  // The SkinX backend returns { answer: "...", sources: [...] }
  const answer = response.data?.answer;

  if (!answer) {
    throw new Error('Backend returned an empty answer.');
  }

  logger.info(`[skinxService] answer received (${answer.length} chars)`);
  return answer;
}

module.exports = { askQuestion };
