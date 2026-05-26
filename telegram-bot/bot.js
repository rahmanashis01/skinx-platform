'use strict';

require('dotenv').config();

const path = require('path');
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const logger = require('./utils/logger');
const { COMMANDS } = require('./utils/constants');
const { askQuestion } = require('./services/skinxService');
const { analyzePhoto, downloadFile, cleanupFile } = require('./services/photoService');

// ─── Validate required environment variables ─────────────────────────────────
const {
  TELEGRAM_BOT_TOKEN,
  BOT_MODE  = 'polling',
  BOT_PORT  = 5050,
  WEBHOOK_URL,
} = process.env;

if (!TELEGRAM_BOT_TOKEN) {
  logger.error('TELEGRAM_BOT_TOKEN is not set. Please configure your .env file.');
  process.exit(1);
}

// ─── Initialise bot (no polling yet — started below based on BOT_MODE) ───────────
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });


// ─── /start ───────────────────────────────────────────────────────────────────
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from?.first_name ?? 'there';

  logger.info(`/start received from chat_id=${chatId} user=${firstName}`);

  const text =
    `👋 *Welcome to SkinX*, ${firstName}!\n\n` +
    `I'm your SkinX assistant. You can ask skin-health questions or upload a skin image for AI-assisted screening.\n\n` +
    `Here's what I can do:\n` +
    `${COMMANDS.ASK} — Ask a skin-health question\n` +
    `${COMMANDS.SCAN} — Upload a skin image for AI screening\n` +
    `${COMMANDS.HELP} — Support info & important disclaimer`;

  await bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
});

// ─── /help ────────────────────────────────────────────────────────────────────
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;

  logger.info(`/help received from chat_id=${chatId}`);

  const text =
    `ℹ️ *skinX Support*\n\n` +
    `⚠️ *Disclaimer:* skinX is an *supportive assistant*, not a medical diagnosis tool.\n\n` +
    `🚨 For urgent symptoms, contact your *local emergency services* immediately.\n\n` +
    `🩺 For personal medical concerns, book an appointment with a *certified dermatologist*.\n\n` +
    `📧 For skinX support, contact: support@skin-x.app`;

  await bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
});

// ─── /ask ─────────────────────────────────────────────────────────────────────

/**
 * Returns true if the answer already contains a disclaimer so we don't double-up.
 * Case-insensitive check for either key phrase the RAG backend may include.
 */
function hasDisclaimer(text) {
  const lower = text.toLowerCase();
  return (
    lower.includes('educational information only') ||
    lower.includes('consult a certified dermatologist')
  );
}

const DISCLAIMER =
  '_This is educational information only. Please consult a certified dermatologist._';

bot.onText(/\/ask(.*)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const question = match[1]?.trim();

  logger.info(`/ask received from chat_id=${chatId} question="${question}"`);

  // Guard: empty question
  if (!question) {
    await bot.sendMessage(
      chatId,
      `💬 Please type your question after /ask.\n_Example:_ /ask What is melanoma?`,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  // Show typing indicator while waiting for the RAG response
  await bot.sendChatAction(chatId, 'typing');

  try {
    const answer = await askQuestion(question);

    // Only append disclaimer if the RAG answer doesn't already include one
    const text = hasDisclaimer(answer)
      ? `🧠 ${answer}`
      : `🧠 ${answer}\n\n${DISCLAIMER}`;

    await bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
  } catch (err) {
    logger.error(`[/ask] Backend error: ${err.message}`);

    const reply = err.code === 'SKINX_TIMEOUT'
      ? `⏳ SkinX assistant is taking longer than expected. Please try again in a moment.`
      : `⚠️ SkinX assistant is temporarily unavailable. Please try again later.`;

    await bot.sendMessage(chatId, reply);
  }
});

// ─── /scan ────────────────────────────────────────────────────────────────────
bot.onText(/\/scan/, async (msg) => {
  const chatId = msg.chat.id;

  logger.info(`/scan received from chat_id=${chatId}`);

  const text =
    `🔬 *Skin Image Screening*\n\n` +
    `Please upload a close‑up skin image. The spot or rash should fill about 40–60% of the photo, with surrounding skin visible. Avoid full‑body or far‑away images.`;

  await bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
});

// ─── Photo handler ────────────────────────────────────────────────────────────
bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;

  logger.info(`Photo received from chat_id=${chatId}`);

  // Grab the highest-resolution version (last element in the array)
  const photos = msg.photo;
  const bestPhoto = photos[photos.length - 1];

  // Show typing while we download + analyse
  await bot.sendChatAction(chatId, 'typing');

  // Build a temp path
  const tmpPath = path.resolve(__dirname, 'tmp', `${chatId}_${Date.now()}.jpg`);

  try {
    // 1. Get the Telegram file URL
    const fileLink = await bot.getFileLink(bestPhoto.file_id);

    // 2. Download to tmp/
    await downloadFile(fileLink, tmpPath);
    logger.info(`[photo] downloaded to ${tmpPath}`);

    // 3. Send to SkinX backend
    await bot.sendChatAction(chatId, 'typing');
    const result = await analyzePhoto(tmpPath);

    // 4. Parse all fields dynamically from response.data.analysis
    const analysis = result?.analysis || {};

    // Log the full response for debugging if any expected field is absent
    const expectedFields = ['condition', 'confidence', 'severity', 'riskLevel', 'description'];
    const missingFields = expectedFields.filter((f) => analysis[f] == null);
    if (missingFields.length > 0) {
      logger.warn(`[photo] Missing fields in analysis: ${missingFields.join(', ')}`);
      logger.warn(`[photo] Full response.data: ${JSON.stringify(result)}`);
    }

    const condition = analysis.condition ?? 'N/A';
    const severity = analysis.severity ?? 'N/A';
    const riskLevel = analysis.riskLevel ?? 'N/A';
    const description = analysis.description ?? 'N/A';

    // Confidence: convert 0–1 float → percent; pass through if already ≥ 1
    let confidencePercent = 'N/A';
    if (analysis.confidence != null) {
      const raw = parseFloat(analysis.confidence);
      if (!isNaN(raw)) {
        confidencePercent = raw <= 1
          ? `${(raw * 100).toFixed(1)}%`
          : `${raw.toFixed(1)}%`;
      }
    }

    const text =
      `🔬 *SkinX Screening Result*\n\n` +
      `*Condition:* ${condition}\n` +
      `*Confidence:* ${confidencePercent}\n` +
      `*Severity:* ${severity}\n` +
      `*Risk level:* ${riskLevel}\n\n` +
      `*Assessment:*\n${description}\n\n` +
      `_⚠️ This is not a medical diagnosis. Please consult a certified dermatologist._`;

    await bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
  } catch (err) {
    logger.error(`[photo] analysis error: ${err.message} (code=${err.code})`);

    // Use the error message directly for known backend codes
    const knownCodes = ['NON_SKIN_INPUT', 'NON_CLINICAL_INPUT', 'MODEL_INFERENCE_FAILED'];
    if (knownCodes.includes(err.code)) {
      await bot.sendMessage(chatId, err.message);
    } else if (err.code === 'SKINX_TIMEOUT') {
      await bot.sendMessage(
        chatId,
        `⏳ Image analysis is taking longer than expected. Please try again in a moment.`
      );
    } else {
      await bot.sendMessage(
        chatId,
        `⚠️ AI image analysis is temporarily unavailable. Please try again later.`
      );
    }
  } finally {
    // Always clean up — never store user images
    cleanupFile(tmpPath);
  }
});

// ─── Unrecognised commands & plain text ───────────────────────────────────────
bot.on('message', async (msg) => {
  // Skip photo messages — already handled above
  if (msg.photo) return;

  if (msg.text && msg.text.startsWith('/')) {
    const knownCommands = Object.values(COMMANDS);
    const isKnown = knownCommands.some((cmd) => msg.text.startsWith(cmd));
    if (!isKnown) {
      await bot.sendMessage(
        msg.chat.id,
        `❓ Unknown command. Type /help for support info or /start to see what I can do.`
      );
    }
    return;
  }

  // Plain text — nudge user toward correct commands
  if (msg.text) {
    await bot.sendMessage(
      msg.chat.id,
      `💬 Use /ask to ask a skin-health question, or /scan to upload a skin image.\nType /help for more info.`
    );
  }
});

// ─── Start: polling or webhook ─────────────────────────────────────────────────────
if (BOT_MODE === 'webhook') {
  // ── Webhook mode: start Express, receive updates over HTTP ─────────────────
  const app = express();
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'skinx-telegram-bot' });
  });

  // Telegram delivers updates to this route
  app.post('/telegram/webhook', (req, res) => {
    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (webhookSecret) {
      const token = req.headers['x-telegram-bot-api-secret-token'];
      if (token !== webhookSecret) {
        logger.warn('[webhook] Forbidden: x-telegram-bot-api-secret-token mismatch');
        return res.sendStatus(403);
      }
    }
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });

  const port = parseInt(BOT_PORT, 10);
  app.listen(port, () => {
    logger.info(`SkinX Telegram Bot started in [webhook] mode on port ${port}`);
    const webhookUrl = process.env.WEBHOOK_URL;
    if (webhookUrl) {
      logger.info(`Webhook URL: ${webhookUrl}`);
    } else {
      logger.warn('WEBHOOK_URL is not set. Remember to register it with Telegram manually.');
    }
  });

} else {
  // ── Polling mode: standard long-poll for local development ───────────────
  bot.startPolling();
  logger.info('SkinX Telegram Bot started in [polling] mode.');

  bot.on('polling_error', (err) => {
    logger.error(`Polling error: ${err.code} — ${err.message}`);
  });
}

// ─── Graceful shutdown ─────────────────────────────────────────────────────────
async function shutdown(signal) {
  logger.info(`${signal} received. Shutting down SkinX bot…`);
  if (BOT_MODE === 'polling') {
    await bot.stopPolling();
  }
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

module.exports = bot; // exported for future integration tests
