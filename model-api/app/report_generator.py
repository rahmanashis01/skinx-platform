"""
Report generation module for SkinX Model API.

Supports OpenRouter API integration with safe fallback responses.
"""

import json

import requests

from app.config import Config


def generate_short_report(
    prediction: dict, user_context: dict | None = None, route_type: str = "public"
) -> dict:
    """
    Generate a clinical report based on model prediction.

    Calls OpenRouter if configured, otherwise returns fallback.

    Args:
        prediction (dict): Prediction dict with keys:
            - class_name (str): Predicted lesion class
            - confidence (float): Confidence score 0-100
            - risk_level (str): Risk level
            - segmentation_available (bool): Whether MedSAM ran successfully
            - validator_passed (bool): Whether image passed skin validation
        user_context (dict | None): User metadata (age, region, skin_tone, gender)
        route_type (str): "public", "authenticated", or "telegram"

    Returns:
        dict: {Findings, ClinicalContext, NextSteps, Disclaimer}
    """
    # Try OpenRouter if configured
    if Config.LLM_PROVIDER == "openrouter" and Config.LLM_API_KEY:
        try:
            return _call_openrouter_api(prediction, user_context, route_type)
        except Exception as e:
            print(f"⚠ OpenRouter API failed: {e}. Using fallback.")

    # Fallback: deterministic report based on prediction
    return _generate_fallback_report(prediction, user_context, route_type)


def _call_openrouter_api(
    prediction: dict, user_context: dict | None, route_type: str
) -> dict:
    """
    Call OpenRouter API for report generation.

    Args:
        prediction (dict): Model prediction
        user_context (dict | None): User metadata
        route_type (str): Route type

    Returns:
        dict: Report from OpenRouter

    Raises:
        Exception: If API call fails
    """
    class_name = prediction.get("class_name", "Unknown")
    confidence = prediction.get("confidence", 0.0)
    risk_level = prediction.get("risk_level", "unknown")
    validator_passed = prediction.get("validator_passed", True)
    segmentation_available = prediction.get("segmentation_available", False)

    # Build context string
    context_parts = [f"Route: {route_type}"]
    if user_context:
        age = user_context.get("age")
        region = user_context.get("region", "Unknown")
        skin_tone = user_context.get("skin_tone", "unspecified")
        gender = user_context.get("gender", "unspecified")

        if age:
            context_parts.append(f"Age: {age}")
        context_parts.append(f"Region: {region}")
        if skin_tone != "unspecified":
            context_parts.append(f"Skin tone: {skin_tone}")
        if gender != "unspecified":
            context_parts.append(f"Gender: {gender}")

    context_str = ", ".join(context_parts)

    # Build prompt
    prompt = f"""You are a board-certified dermatologist assistant analyzing a skin lesion image screening result.

Image analysis result:
- Detected class: {class_name}
- Confidence: {confidence:.1f}%
- Risk level: {risk_level}
- Image validation: {"passed" if validator_passed else "failed"}
- Lesion segmentation: {"successful" if segmentation_available else "not available"}

Patient context: {context_str}

Generate a SHORT clinical report (3-5 lines max) in JSON format with exactly these 4 keys:

1. "Findings": 1-2 sentences describing what was detected
2. "ClinicalContext": 1-2 sentences about the condition (if disease detected) or normalcy
3. "NextSteps": 1-2 sentences with recommendations (urgent if high risk, routine if low risk)
4. "Disclaimer": Standard medical disclaimer

IMPORTANT:
- If class is Normal or benign or low-risk: say it appears normal/benign, low concern
- If class is suspicious/disease/high-risk: mention the detected class and recommend dermatologist
- NEVER say "diagnosis" - this is a screening tool only
- Keep each field SHORT (1-2 sentences max)
- Return ONLY valid JSON, no markdown, no code blocks

Output JSON only:"""

    # Call OpenRouter
    headers = {
        "Authorization": f"Bearer {Config.LLM_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": Config.LLM_MODEL or "openai/gpt-4o-mini",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "max_tokens": 500,
    }

    response = requests.post(
        f"{Config.OPENROUTER_BASE_URL}/chat/completions",
        headers=headers,
        json=payload,
        timeout=30,
    )

    response.raise_for_status()
    result = response.json()

    # Extract response
    content = result["choices"][0]["message"]["content"]

    # Clean potential markdown
    content = content.strip()
    if content.startswith("```json"):
        content = content[7:]
    if content.startswith("```"):
        content = content[3:]
    if content.endswith("```"):
        content = content[:-3]
    content = content.strip()

    # Parse JSON
    report = json.loads(content)

    # Validate required keys
    required_keys = ["Findings", "ClinicalContext", "NextSteps", "Disclaimer"]
    if not all(k in report for k in required_keys):
        raise ValueError("OpenRouter response missing required keys")

    return report


def _generate_fallback_report(
    prediction: dict, user_context: dict | None, route_type: str
) -> dict:
    """
    Generate deterministic fallback report based on prediction.

    Report varies based on class_name, confidence, and risk_level.

    Args:
        prediction (dict): Model prediction
        user_context (dict | None): User metadata
        route_type (str): Route type

    Returns:
        dict: {Findings, ClinicalContext, NextSteps, Disclaimer}
    """
    class_name = prediction.get("class_name", "Unknown")
    confidence = prediction.get("confidence", 0.0)
    risk_level = prediction.get("risk_level", "unknown")
    validator_passed = prediction.get("validator_passed", True)
    segmentation_available = prediction.get("segmentation_available", False)

    # Non-skin image
    if not validator_passed or class_name == "Non-Skin Image":
        return {
            "Findings": "The uploaded image did not pass skin validation. The image may not contain visible skin or may have poor lighting.",
            "ClinicalContext": "Image quality is insufficient for analysis. Please ensure the photo clearly shows the skin lesion area.",
            "NextSteps": "Submit a new photo with better lighting and clear visibility of the skin area. Ensure the lesion is in focus.",
            "Disclaimer": "This AI screening tool cannot analyze non-skin images. Please consult a dermatologist if you have skin concerns.",
        }

    # Normal/benign cases
    if class_name.lower() in ["normal", "benign"] or risk_level == "low":
        return {
            "Findings": f"Visual analysis detected: {class_name} appearance with {confidence:.1f}% confidence. No obvious abnormalities identified.",
            "ClinicalContext": "The analyzed area appears to show normal skin characteristics with low clinical concern based on visual features.",
            "NextSteps": "Maintain regular skin monitoring. If you notice any changes in size, color, or symptoms, consult a dermatologist for evaluation.",
            "Disclaimer": "This is an AI screening result, not a medical diagnosis. Always consult a qualified healthcare professional for any skin concerns.",
        }

    # High-risk cases (Melanoma, carcinomas)
    if risk_level == "high" or any(
        term in class_name.lower() for term in ["melanoma", "carcinoma", "cancer"]
    ):
        return {
            "Findings": f"Visual analysis detected features consistent with {class_name} ({confidence:.1f}% confidence). This requires urgent clinical evaluation.",
            "ClinicalContext": f"{class_name} is a serious skin condition that requires prompt medical attention. Early detection and treatment are critical for better outcomes.",
            "NextSteps": "URGENT: Schedule an appointment with a dermatologist immediately for clinical examination, possible biopsy, and treatment planning.",
            "Disclaimer": "This is an AI screening tool, not a diagnosis. Immediate medical consultation is strongly recommended for high-risk findings.",
        }

    # Medium-risk cases
    if risk_level in ["medium", "medium-high"]:
        return {
            "Findings": f"Visual analysis identified {class_name} with {confidence:.1f}% confidence. Clinical correlation is recommended for confirmation.",
            "ClinicalContext": f"{class_name} may require medical evaluation. While not immediately urgent, professional assessment is advised to determine appropriate management.",
            "NextSteps": "Schedule a dermatology consultation within 2-4 weeks for clinical examination and to discuss treatment options if needed.",
            "Disclaimer": "This AI analysis is for screening support only. A dermatologist should evaluate all skin lesions for accurate diagnosis and treatment.",
        }

    # Default case (unknown or other)
    return {
        "Findings": f"Visual analysis detected {class_name} with {confidence:.1f}% confidence.",
        "ClinicalContext": f"The system identified features consistent with {class_name}. Professional medical evaluation is recommended for confirmation.",
        "NextSteps": "Consult a dermatologist for clinical examination and confirmation. Bring this screening result to your appointment.",
        "Disclaimer": "This is an AI screening tool, not a substitute for professional medical diagnosis. Always consult a qualified dermatologist.",
    }
