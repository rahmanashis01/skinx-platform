# ═══════════════════════════════════════════════════════════════════════════
# SkinX Model API - FastAPI ML Inference Service
# ═══════════════════════════════════════════════════════════════════════════
#
# IMPORTANT: Model weights are NOT included in this image.
# Models must be mounted as volume at runtime: -v /path/to/models:/models
#
# Production usage:
#   docker build -t skinx-model-api:latest .
#   docker run -p 8080:8080 -v /var/www/skinx/data/models:/models skinx-model-api:latest
# ═══════════════════════════════════════════════════════════════════════════

FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PIP_NO_CACHE_DIR=1

# Install system dependencies for OpenCV, Pillow, and ML libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libglib2.0-0 \
    libgl1 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first for better layer caching
COPY requirements.txt .

# Install Python dependencies with CPU-only PyTorch wheels
# Using official PyTorch CPU index to avoid CUDA/NVIDIA dependencies
RUN pip install --upgrade pip && \
    pip install --no-cache-dir \
    torch==2.3.1 torchvision==0.18.1 \
    --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
# NOTE: Do NOT copy models/ or _local_only_models/
COPY app ./app

# Create non-root user for security
RUN useradd -m -u 1000 modelapi && \
    chown -R modelapi:modelapi /app

USER modelapi

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start the FastAPI application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
