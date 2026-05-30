# ═══════════════════════════════════════════════════════════════════════════
# SkinX Telegram Bot - Node.js Service
# ═══════════════════════════════════════════════════════════════════════════

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency manifests first for better layer caching
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Create logs and temp directories
RUN mkdir -p /app/logs /app/tmp && chmod 755 /app/logs /app/tmp

# Set production environment
ENV NODE_ENV=production

# Expose port
EXPOSE 5050

# Health check (optional for webhook mode)
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:5050/health || exit 1

# Start the bot using npm start
CMD ["npm", "start"]
