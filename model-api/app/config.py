"""
Configuration module for SkinX Model API.

Loads environment variables with defaults optimized for Docker deployment
on Linux/Ubuntu VPS (GPU available via /dev/nvidia* or CPU fallback).
"""

import os
from pathlib import Path


class Config:
    """Model API configuration."""

    # Model paths - defaults for Docker mount point /models
    MODEL_DIR = os.getenv("MODEL_DIR", "/models")
    CLASS_CSV_PATH = os.getenv("CLASS_CSV_PATH", "/models/training_base_10k.csv")
    EFFICIENTNET_MODEL_PATH = os.getenv(
        "EFFICIENTNET_MODEL_PATH", "/models/incremental_b5.pt"
    )
    MEDSAM_MODEL_PATH = os.getenv("MEDSAM_MODEL_PATH", "/models/medsam.pth")
    MOBILENET_MODEL_PATH = os.getenv(
        "MOBILENET_MODEL_PATH", "/models/mobilenet_v3_small-047dcff4.pth"
    )

    # Image Validation Thresholds - Safer two-tier validation
    # ========================================================================
    # TIER 1: Hard reject threshold
    # If skin_color_ratio < MIN_SKIN_COLOR_RATIO_HARD_REJECT, always reject
    # (obvious non-skin images: text, objects, etc.)
    MIN_SKIN_COLOR_RATIO_HARD_REJECT = float(
        os.getenv("MIN_SKIN_COLOR_RATIO_HARD_REJECT", "0.08")
    )

    # TIER 2: Borderline threshold
    # If skin_color_ratio is between BORDERLINE and HARD_REJECT:
    # - If MobileNetV3 confidence < SKIN_VALIDATION_THRESHOLD: reject
    # - If MobileNetV3 confidence >= SKIN_VALIDATION_THRESHOLD: accept
    # (allows real skin images with low MobileNetV3 confidence to proceed)
    MIN_SKIN_COLOR_RATIO_BORDERLINE = float(
        os.getenv("MIN_SKIN_COLOR_RATIO_BORDERLINE", "0.15")
    )

    # MobileNetV3 validation threshold (only used in borderline zone)
    # If skin_color_ratio >= BORDERLINE, MobileNetV3 is NOT a hard gate
    # If skin_color_ratio is between BORDERLINE and HARD_REJECT:
    #   - MobileNetV3 confidence < SKIN_VALIDATION_THRESHOLD: reject
    #   - MobileNetV3 confidence >= SKIN_VALIDATION_THRESHOLD: accept (with warning)
    SKIN_VALIDATION_THRESHOLD = float(os.getenv("SKIN_VALIDATION_THRESHOLD", "0.30"))

    # LLM Configuration - OpenRouter or other vendor APIs
    LLM_PROVIDER = os.getenv("LLM_PROVIDER", "none")
    LLM_API_KEY = os.getenv("LLM_API_KEY", "")
    LLM_MODEL = os.getenv("LLM_MODEL", "")
    OPENROUTER_BASE_URL = os.getenv(
        "OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"
    )
    LLM_TIMEOUT_SECONDS = int(os.getenv("LLM_TIMEOUT_SECONDS", "12"))

    # API Configuration
    PORT = int(os.getenv("PORT", 8080))
    HOST = os.getenv("HOST", "0.0.0.0")

    # Debug Mode - defaults to False for production safety
    # Only enable in development/staging. Never in production.
    DEBUG = os.getenv("DEBUG", "false").lower() in ("true", "1", "yes")

    @classmethod
    def validate_required_paths(cls) -> list[str]:
        """
        Validate that all required model files exist.

        Returns:
            List of missing file paths. Empty list means all files found.
        """
        required_files = [
            cls.CLASS_CSV_PATH,
            cls.EFFICIENTNET_MODEL_PATH,
            cls.MEDSAM_MODEL_PATH,
            cls.MOBILENET_MODEL_PATH,
        ]

        missing = []
        for filepath in required_files:
            if not Path(filepath).exists():
                missing.append(filepath)

        return missing

    @classmethod
    def summary(cls) -> dict:
        """Return safe configuration summary (never exposes secrets)."""
        return {
            "debug_mode": cls.DEBUG,
            "model_dir": cls.MODEL_DIR,
            "efficientnet_configured": bool(cls.EFFICIENTNET_MODEL_PATH),
            "medsam_configured": bool(cls.MEDSAM_MODEL_PATH),
            "mobilenet_configured": bool(cls.MOBILENET_MODEL_PATH),
            "class_csv_configured": bool(cls.CLASS_CSV_PATH),
            "llm_provider": cls.LLM_PROVIDER if cls.LLM_PROVIDER != "none" else None,
            "llm_api_key_set": bool(cls.LLM_API_KEY),
            "validation_hard_reject_threshold": cls.MIN_SKIN_COLOR_RATIO_HARD_REJECT,
            "validation_borderline_threshold": cls.MIN_SKIN_COLOR_RATIO_BORDERLINE,
            "mobilenet_confidence_threshold": cls.SKIN_VALIDATION_THRESHOLD,
            "port": cls.PORT,
        }
