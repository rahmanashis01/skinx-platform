'use strict';

/**
 * Shared constants used across the bot.
 * Centralising command strings avoids magic strings scattered through handlers.
 */

const COMMANDS = {
  START: '/start',
  HELP:  '/help',
  ASK:   '/ask',
  SCAN:  '/scan',
};

/**
 * SkinX backend endpoint paths.
 * Base URL is read from BACKEND_API_URL in .env.
 * These will be used in Phase 2+ service modules.
 */
const SKINX_ENDPOINTS = {
  ASK:          '/api/ask',
  ANALYZE_PHOTO: '/api/analyze-photo/public',
};

/**
 * Bot modes
 */
const BOT_MODES = {
  POLLING: 'polling',
  WEBHOOK: 'webhook',
};

module.exports = { COMMANDS, SKINX_ENDPOINTS, BOT_MODES };
