# ═══════════════════════════════════════════════════════════════════════════
# SkinX Backend - Node.js/Express API
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

# Create uploads directory for file uploads
RUN mkdir -p /app/uploads && chmod 755 /app/uploads

# Set production environment
ENV NODE_ENV=production

# Expose backend port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:5001/health || exit 1

# Start the server using npm start
CMD ["npm", "start"]
