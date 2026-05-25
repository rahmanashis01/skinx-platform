'use strict';

/**
 * Simple console logger with timestamp, level prefix, and colour coding.
 * Keeps the bot dependency-free for logging in Phase 1.
 * Can be swapped for winston/pino in a later phase without touching other files.
 */

const RESET = '\x1b[0m';
const COLOURS = {
  info:  '\x1b[36m', // cyan
  warn:  '\x1b[33m', // yellow
  error: '\x1b[31m', // red
  debug: '\x1b[90m', // grey
};

function timestamp() {
  return new Date().toISOString();
}

function log(level, message) {
  const colour = COLOURS[level] ?? RESET;
  const prefix = `[${timestamp()}] [${level.toUpperCase().padEnd(5)}]`;
  // Errors go to stderr; everything else to stdout
  const stream = level === 'error' ? process.stderr : process.stdout;
  stream.write(`${colour}${prefix} ${message}${RESET}\n`);
}

module.exports = {
  info:  (msg) => log('info',  msg),
  warn:  (msg) => log('warn',  msg),
  error: (msg) => log('error', msg),
  debug: (msg) => log('debug', msg),
};
