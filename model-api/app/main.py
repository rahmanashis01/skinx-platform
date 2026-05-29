"""
SkinX Model API - Production.

FastAPI application for skin lesion classification and segmentation.
- Production inference service with Linux-safe runtime assumptions
- Kept: EfficientNet-B5 (/models/incremental_b5.pt), MedSAM, MobileNetV3
- Device: CUDA > CPU (no MPS)
- Report generation: OpenRouter with fallback

Routes:
    GET /health
    POST /analyze/public (public website scan)
    POST /analyze/authenticated (after Auth0 login)
    POST /analyze/telegram (Telegram bot scan)
    POST /analyze (alias to /analyze/public)
    POST /predict (alias to /analyze/authenticated)
"""

import io
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from PIL import Image

from app.config import Config
from app.inference import InferenceEngine
from app.model_loader import ModelLoader
from app.report_generator import generate_short_report

# ============================================================================
# Startup: Initialize models
# ============================================================================

app = FastAPI(
    title="SkinX Model API",
    description="Skin lesion classification, segmentation, and clinical reporting",
    version="1.0.0-production",
)

# Global model instances
model_loader: ModelLoader = None
inference_engine: InferenceEngine = None


# ============================================================================
# Helper: Safe Config Value Formatting
# ============================================================================


def safe_config_value(key: str, val):
    """
    Safely format config values, masking secrets and handling all types.

    Args:
        key: Config key name
        val: Config value (can be bool, int, None, str)

    Returns:
        str: Safe formatted value
    """
    secret_words = ["key", "token", "secret", "password", "api_key"]

    if val is None:
        return "None"

    if isinstance(val, bool):
        return str(val)

    text = str(val)

    if any(word in key.lower() for word in secret_words):
        if not text:
            return ""
        return "***" + text[-4:] if len(text) >= 4 else "***"

    return text


@app.on_event("startup")
async def startup_event():
    """Load models at startup."""
    global model_loader, inference_engine

    print("\n" + "=" * 70)
    print("SkinX Model API - Startup")
    print("=" * 70)

    # Check configuration
    print("\nConfiguration:")
    for key, val in Config.summary().items():
        print(f"  {key}: {safe_config_value(key, val)}")

    # Validate paths
    missing = Config.validate_required_paths()
    if missing:
        error_msg = "❌ Required model files missing:\n" + "\n".join(missing)
        print(error_msg)
        raise RuntimeError(error_msg)

    # Load models
    print("\nLoading models...")
    try:
        model_loader = ModelLoader()
        status = model_loader.load_all()

        print("\nModel Status:")
        for key, val in status.items():
            print(f"  {key}: {val}")

        inference_engine = InferenceEngine(model_loader)
        print("\n✓ All models loaded successfully")
        print("=" * 70 + "\n")

    except Exception as e:
        error_msg = f"❌ Failed to initialize models: {e}"
        print(error_msg)
        raise RuntimeError(error_msg)


# ============================================================================
# User Context Normalization
# ============================================================================


def normalize_user_context(
    route_type: str,
    name: Optional[str] = None,
    age: Optional[str] = None,
    region: Optional[str] = None,
    skin_tone: Optional[str] = None,
    gender: Optional[str] = None,
    sex: Optional[str] = None,
    notes: Optional[str] = None,
    user_id: Optional[str] = None,
) -> dict:
    """
    Normalize user context with route-specific defaults.

    Args:
        route_type: "public", "authenticated", or "telegram"
        name, age, region, skin_tone, gender, sex, notes, user_id: Optional user fields

    Returns:
        dict: Normalized user context
    """
    # Parse age
    age_int = None
    if age:
        try:
            age_int = int(age)
        except (ValueError, TypeError):
            age_int = None

    # Determine gender (prefer gender over sex)
    gender_val = gender or sex or "unspecified"

    # Apply route-specific defaults
    if route_type == "public":
        return {
            "name": name or "Guest User",
            "age": age_int,
            "region": region or "Asia",
            "skin_tone": skin_tone or "unspecified",
            "gender": gender_val,
        }
    elif route_type == "authenticated":
        return {
            "name": name or "Authenticated User",
            "age": age_int,
            "region": region or "Asia",
            "skin_tone": skin_tone or "unspecified",
            "gender": gender_val,
            "notes": notes,
            "user_id": user_id,
        }
    elif route_type == "telegram":
        return {
            "name": name or "Telegram User",
            "age": age_int,
            "region": region or "Asia",
            "skin_tone": skin_tone or "unspecified",
            "gender": gender_val,
        }
    else:
        # Default to public
        return {
            "name": name or "Guest User",
            "age": age_int,
            "region": region or "Asia",
            "skin_tone": skin_tone or "unspecified",
            "gender": gender_val,
        }


# ============================================================================
# Shared Analysis Function
# ============================================================================


async def run_analysis(
    file: UploadFile,
    route_type: str,
    user_context: dict,
    telegram_context: Optional[dict] = None,
):
    """
    Run full inference pipeline with two safety gates.

    CRITICAL SAFETY GATES:
    1. Validation gate (two-tier) - rejects obvious non-skin images
    2. Classification uncertainty gate - detects OOD/non-lesion after EfficientNet-B5

    Pipeline:
    1. Validate image (two-tier)
    2. Run MedSAM segmentation
    3. Run EfficientNet-B5 classification (/models/incremental_b5.pt)
    4. Check classification uncertainty (top-k, margin, borderline confidence)
    5. Generate report (OpenRouter or fallback) only if both gates pass

    For rejected or uncertain images: return rejection response without disease label
    For confident valid images: return full report with disease classification

    Args:
        file: Uploaded image file
        route_type: "public", "authenticated", or "telegram"
        user_context: Normalized user context
        telegram_context: Optional telegram metadata

    Returns:
        dict: Analysis result (success with report) or rejection response
    """
    # Validate file
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    try:
        content = await file.read()
        image = Image.open(io.BytesIO(content)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {e}")

    # Run inference (includes both validation gates)
    try:
        prediction = inference_engine.run_inference(image)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {e}")

    # Check if image was rejected at validation gate (TIER 1 or TIER 2)
    if prediction.get("rejected", False) and not prediction.get(
        "validator_passed", False
    ):
        print("🛑 IMAGE REJECTED AT VALIDATION GATE")
        print("   Returning validation rejection response (not a skin image)")

        validation_info = prediction.get("validation_info", {})
        reason = validation_info.get("reason", "validation_failed")

        return {
            "success": False,
            "rejected": True,
            "reason": "non_skin_image",
            "severity": "invalid",
            "confidence": 0,
            "message": "The uploaded image does not appear to contain a valid skin region. Please upload a clear skin/lesion photo.",
            "prediction": {
                "class_name": "Invalid image",
                "confidence": 0,
                "risk_level": "unknown",
                "validator": {
                    "passed": False,
                    "reason": reason,
                    "skin_color_ratio": validation_info.get("skin_color_ratio"),
                    "validation_tier": validation_info.get("validation_tier"),
                    "mobilenet_confidence": validation_info.get("mobilenet_confidence"),
                },
                "segmentation": {
                    "available": False,
                },
            },
        }

    # Check if image was rejected at classification uncertainty gate
    if (
        prediction.get("rejected", False)
        and prediction.get("validator_passed", False)
        and prediction.get("uncertain", False)
    ):
        print("🛑 IMAGE REJECTED AT CLASSIFICATION UNCERTAINTY GATE")
        print("   Image is uncertain/non-lesion (not returning disease label)")

        uncertainty_info = prediction.get("uncertainty_info", {})
        top_predictions = prediction.get("top_predictions", [])
        actual_confidence = prediction.get("actual_top1_confidence", 0.0)
        uncertainty_reason = prediction.get("uncertainty_reason", "unknown")

        return {
            "success": False,
            "rejected": True,
            "reason": "uncertain_or_non_lesion_image",
            "severity": "invalid",
            "confidence": 0,
            "message": "The image could not be confidently analyzed as a skin lesion. Please upload a clear close-up photo of the skin spot or lesion.",
            "prediction": {
                "class_name": "Uncertain image",
                "confidence": 0,
                "actual_top1_confidence": actual_confidence,
                "risk_level": "unknown",
                "top_predictions": top_predictions,
                "validator": {
                    "passed": True,
                    "validation_tier": prediction.get("validation_info", {}).get(
                        "validation_tier"
                    ),
                },
                "segmentation": {
                    "available": prediction.get("segmentation_available", False),
                },
                "uncertainty": {
                    "is_uncertain": True,
                    "reason": uncertainty_reason,
                    "details": uncertainty_info.get("details", {}),
                },
            },
        }

    # BOTH GATES PASSED - image is valid and classification is confident
    print("\n✅ BOTH GATES PASSED - Image validated and classified confidently")
    print("   Generating report...")

    class_name = prediction.get("class_name", "Unknown")
    confidence = prediction.get("confidence", 0.0)
    segmentation_available = prediction.get("segmentation_available", False)
    top_predictions = prediction.get("top_predictions", [])

    # Determine risk level based on class
    if class_name.lower() == "normal":
        risk_level = "low"
    elif class_name in ["Melanoma", "Melanoma metastatic"]:
        risk_level = "high"
    elif class_name in ["Basal cell carcinoma", "Squamous cell carcinoma"]:
        risk_level = "medium-high"
    else:
        risk_level = "medium"

    # Generate report (only after both gates passed)
    print("Calling OpenRouter or fallback report generator...")
    try:
        report = generate_short_report(
            {
                "class_name": class_name,
                "confidence": confidence,
                "risk_level": risk_level,
                "validator_passed": True,
                "segmentation_available": segmentation_available,
            },
            user_context,
            route_type,
        )
        print("✅ Report generated successfully")
    except Exception as e:
        print(f"⚠ Report generation error: {e}")
        report = {
            "Findings": f"Analysis detected {class_name} with {confidence:.1f}% confidence.",
            "ClinicalContext": "Detailed report generation failed. Classification result available.",
            "NextSteps": "Consult a dermatologist for confirmation and recommendations.",
            "Disclaimer": "This is an AI screening tool, not a medical diagnosis.",
        }

    return {
        "success": True,
        "rejected": False,
        "route_type": route_type,
        "filename": file.filename,
        "user_context": user_context,
        "telegram_context": telegram_context,
        "prediction": {
            "class_name": class_name,
            "confidence": round(confidence, 2),
            "risk_level": risk_level,
            "severity": risk_level,
            "top_predictions": top_predictions,
            "validator": {
                "passed": prediction.get("validator_passed", True),
                "validation_tier": prediction.get("validation_info", {}).get(
                    "validation_tier"
                ),
            },
            "segmentation": {
                "available": segmentation_available,
            },
        },
        "report": report,
        "disclaimer": "This AI result is for screening support only and is not a medical diagnosis.",
    }


# ============================================================================
# API Endpoints
# ============================================================================


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "skinx-model-api",
        "version": "1.0.0-production",
        "models": {
            "efficientnet_b5": model_loader.cnn_model is not None,
            "medsam": model_loader.medsam_predictor is not None,
            "mobilenet_validator": model_loader.validator_model is not None,
        }
        if model_loader
        else {},
    }


@app.post("/analyze/public", tags=["Analysis"])
async def analyze_public(
    file: UploadFile = File(...),
    name: Optional[str] = Form(None),
    age: Optional[str] = Form(None),
    region: Optional[str] = Form(None),
    skin_tone: Optional[str] = Form(None),
    gender: Optional[str] = Form(None),
    sex: Optional[str] = Form(None),
):
    """
    Public website scan (no login required).

    Accepts optional metadata with safe defaults.
    """
    user_context = normalize_user_context(
        "public",
        name=name,
        age=age,
        region=region,
        skin_tone=skin_tone,
        gender=gender,
        sex=sex,
    )
    return await run_analysis(file, "public", user_context)


@app.post("/analyze/authenticated", tags=["Analysis"])
async def analyze_authenticated(
    file: UploadFile = File(...),
    name: Optional[str] = Form(None),
    age: Optional[str] = Form(None),
    region: Optional[str] = Form(None),
    skin_tone: Optional[str] = Form(None),
    gender: Optional[str] = Form(None),
    sex: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    user_id: Optional[str] = Form(None),
):
    """
    Authenticated scan (after Auth0 login).

    Auth0 verification handled by Node backend.
    Accepts optional user metadata.
    """
    user_context = normalize_user_context(
        "authenticated",
        name=name,
        age=age,
        region=region,
        skin_tone=skin_tone,
        gender=gender,
        sex=sex,
        notes=notes,
        user_id=user_id,
    )
    return await run_analysis(file, "authenticated", user_context)


@app.post("/analyze/telegram", tags=["Analysis"])
async def analyze_telegram(
    file: UploadFile = File(...),
    telegram_user_id: Optional[str] = Form(None),
    chat_id: Optional[str] = Form(None),
):
    """
    Telegram bot scan.

    Uses Telegram-specific defaults.
    Accepts optional telegram metadata.
    """
    user_context = normalize_user_context("telegram")
    telegram_context = None
    if telegram_user_id or chat_id:
        telegram_context = {
            "telegram_user_id": telegram_user_id,
            "chat_id": chat_id,
        }
    return await run_analysis(file, "telegram", user_context, telegram_context)


@app.post("/analyze", tags=["Analysis"])
async def analyze(
    file: UploadFile = File(...),
    name: Optional[str] = Form(None),
    age: Optional[str] = Form(None),
    region: Optional[str] = Form(None),
    skin_tone: Optional[str] = Form(None),
    gender: Optional[str] = Form(None),
    sex: Optional[str] = Form(None),
):
    """
    Backward compatibility alias to /analyze/public.
    """
    return await analyze_public(file, name, age, region, skin_tone, gender, sex)


@app.post("/predict", tags=["Analysis"])
async def predict(
    file: UploadFile = File(...),
    name: Optional[str] = Form(None),
    age: Optional[str] = Form(None),
    region: Optional[str] = Form(None),
    skin_tone: Optional[str] = Form(None),
    gender: Optional[str] = Form(None),
    sex: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    user_id: Optional[str] = Form(None),
):
    """
    Backward compatibility alias to /analyze/authenticated.
    """
    return await analyze_authenticated(
        file, name, age, region, skin_tone, gender, sex, notes, user_id
    )


@app.get("/debug/config", tags=["Debug"])
async def debug_config():
    """
    Return current configuration (debug only).

    Only available when DEBUG=true in environment.
    Never exposes secrets, API keys, or sensitive paths.
    """
    if not Config.DEBUG:
        raise HTTPException(
            status_code=404,
            detail="Debug endpoints are disabled. Set DEBUG=true to enable.",
        )

    return Config.summary()


@app.get("/debug/models", tags=["Debug"])
async def debug_models():
    """
    Return model loader status (debug only).

    Only available when DEBUG=true in environment.
    """
    if not Config.DEBUG:
        raise HTTPException(
            status_code=404,
            detail="Debug endpoints are disabled. Set DEBUG=true to enable.",
        )

    if model_loader is None:
        return {"status": "not_loaded"}

    return {
        "device": str(model_loader.device),
        "classes": len(model_loader.classes) if model_loader.classes else 0,
        "efficientnet_b5_loaded": model_loader.cnn_model is not None,
        "medsam_loaded": model_loader.medsam_predictor is not None,
        "mobilenet_validator_loaded": model_loader.validator_model is not None,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=Config.HOST,
        port=Config.PORT,
        reload=False,
    )
