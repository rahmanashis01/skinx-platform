"""
Inference module for SkinX Model API.

Handles image preprocessing, model predictions, and result aggregation.
"""

from typing import Optional

import numpy as np
import torch
from PIL import Image, ImageOps

from app.model_loader import ModelLoader


class InferenceEngine:
    """Runs inference on skin lesion images."""

    def __init__(self, loader: ModelLoader):
        """
        Initialize inference engine.

        Args:
            loader (ModelLoader): Loaded models
        """
        self.loader = loader
        self.device = loader.device

    def segment_lesion(self, image: Image.Image) -> tuple[Image.Image, bool]:
        """
        Segment lesion using MedSAM.

        Falls back to center crop if segmentation unavailable.

        Args:
            image (Image.Image): Input image

        Returns:
            (cropped_image, success): Cropped lesion image and segmentation success flag
        """
        img_rgb = image.convert("RGB")
        img_rgb = ImageOps.exif_transpose(img_rgb)

        # If MedSAM not available, use fallback
        if self.loader.medsam_predictor is None:
            return self._fallback_crop(img_rgb), False

        try:
            print("Running MedSAM segmentation...")
            image_np = np.array(img_rgb)
            h, w, _ = image_np.shape

            # Set image and prompt at center
            self.loader.medsam_predictor.set_image(image_np)
            input_point = np.array([[w // 2, h // 2]], dtype=np.float32)
            input_label = np.array([1], dtype=np.int32)

            # Segment
            masks, _, _ = self.loader.medsam_predictor.predict(
                point_coords=input_point,
                point_labels=input_label,
                multimask_output=False,
            )

            mask = masks[0]
            y_indices, x_indices = np.where(mask)

            # Extract bounding box
            if len(y_indices) > 0 and len(x_indices) > 0:
                ymin, ymax = int(y_indices.min()), int(y_indices.max())
                xmin, xmax = int(x_indices.min()), int(x_indices.max())

                # Add padding
                ymin = max(0, ymin - 2)
                ymax = min(h, ymax + 2)
                xmin = max(0, xmin - 2)
                xmax = min(w, xmax + 2)

                if (xmax - xmin) > 5 and (ymax - ymin) > 5:
                    cropped = img_rgb.crop((xmin, ymin, xmax, ymax))
                    resized = cropped.resize((256, 256), Image.Resampling.BILINEAR)
                    print(
                        f"✓ MedSAM segmentation successful. Crop: [{xmin}, {ymin}, {xmax}, {ymax}]"
                    )
                    return resized, True

            print("⚠ MedSAM returned empty mask. Using fallback crop.")
            return self._fallback_crop(img_rgb), False

        except Exception as e:
            print(f"⚠ MedSAM error: {e}. Using fallback crop.")
            return self._fallback_crop(img_rgb), False

    def _fallback_crop(self, image: Image.Image) -> Image.Image:
        """
        Fallback: aspect-preserving center crop.

        Args:
            image (Image.Image): Input image

        Returns:
            Image.Image: Resized 256x256 square crop
        """
        w, h = image.size
        min_dim = min(w, h)
        left = (w - min_dim) // 2
        top = (h - min_dim) // 2
        right = left + min_dim
        bottom = top + min_dim
        cropped = image.crop((left, top, right, bottom))
        return cropped.resize((256, 256), Image.Resampling.BILINEAR)

    def classify_lesion(self, cropped_image: Image.Image) -> dict:
        """
        Classify lesion using EfficientNet-B5 (/models/incremental_b5.pt).

        IMPORTANT: This is the real lesion classifier (incremental_b5.pt).
        Every accepted valid skin image MUST be classified through this model
        before report generation.

        Args:
            cropped_image (Image.Image): Preprocessed lesion image

        Returns:
            dict: {class_name: str, confidence: float (0-100)}

        Raises:
            RuntimeError: If model not loaded or inference fails
        """
        if self.loader.cnn_model is None:
            raise RuntimeError("EfficientNet-B5 model not loaded")

        try:
            print(
                "Running EfficientNet-B5 classification (/models/incremental_b5.pt)..."
            )
            transform = self.loader.get_efficientnet_transform()
            input_tensor = transform(cropped_image).unsqueeze(0).to(self.device)

            with torch.no_grad():
                outputs = self.loader.cnn_model(input_tensor)
                probabilities = torch.softmax(outputs, dim=1)[0]
                confidence, predicted_idx = probabilities.max(0)

            class_name = self.loader.classes[predicted_idx.item()]
            confidence_pct = float(confidence.item() * 100.0)

            print(
                f"EfficientNet-B5 prediction: {class_name} confidence: {confidence_pct:.2f}%"
            )

            return {"class_name": class_name, "confidence": confidence_pct}

        except Exception as e:
            raise RuntimeError(f"EfficientNet-B5 inference failed: {e}")

    def validate_skin_image(self, image: Image.Image) -> tuple[bool, dict]:
        """
        Validate that image contains human skin using safer two-tier logic.

        TIER 1: Hard reject (always reject)
        - If skin_color_ratio < MIN_SKIN_COLOR_RATIO_HARD_REJECT (8%)
          → Obvious non-skin image (text, objects, blanks, etc.)

        TIER 2: Borderline zone (conditional accept based on MobileNetV3)
        - If skin_color_ratio is between 8% and 15%:
          - If MobileNetV3 confidence >= SKIN_VALIDATION_THRESHOLD (30%): ACCEPT (warning logged)
          - If MobileNetV3 confidence < SKIN_VALIDATION_THRESHOLD (30%): REJECT

        TIER 3: Good zone (always accept)
        - If skin_color_ratio >= MIN_SKIN_COLOR_RATIO_BORDERLINE (15%)
          → Real skin/lesion image, proceed to MedSAM + EfficientNet
          → MobileNetV3 low confidence is just a warning, NOT a rejection reason

        Args:
            image (Image.Image): Input image

        Returns:
            (is_valid: bool, validation_info: dict): Validation result and details
        """
        from app.config import Config

        validation_info = {
            "passed": False,
            "reason": None,
            "skin_color_ratio": 0.0,
            "mobilenet_confidence": None,
            "validation_tier": None,
            "decision": None,
        }

        try:
            print(
                "🔍 Running skin/image validation (two-tier: hard-reject + borderline)..."
            )

            img_rgb = image.convert("RGB")
            img_np = np.array(img_rgb)

            if img_np.size == 0:
                print("✗ Image validation FAILED: Empty image")
                validation_info["reason"] = "empty_image"
                validation_info["decision"] = "rejected"
                return False, validation_info

            # Step 1: YCrCb color detection (mandatory first gate)
            print("  Checking skin color distribution (YCrCb)...")
            R = img_np[:, :, 0].astype(float)
            G = img_np[:, :, 1].astype(float)
            B = img_np[:, :, 2].astype(float)
            Y = 0.299 * R + 0.587 * G + 0.114 * B
            Cr = (R - Y) * 0.713 + 128
            Cb = (B - Y) * 0.564 + 128
            skin_pixels = (Cr >= 133) & (Cr <= 173) & (Cb >= 77) & (Cb <= 127)
            skin_ratio = np.sum(skin_pixels) / skin_pixels.size

            validation_info["skin_color_ratio"] = float(skin_ratio)

            print(f"  Skin color ratio: {skin_ratio * 100.0:.2f}%")
            print(
                f"  Hard reject threshold: {Config.MIN_SKIN_COLOR_RATIO_HARD_REJECT * 100.0:.2f}%"
            )
            print(
                f"  Borderline threshold: {Config.MIN_SKIN_COLOR_RATIO_BORDERLINE * 100.0:.2f}%"
            )

            # TIER 1: Hard reject - obvious non-skin images
            if skin_ratio < Config.MIN_SKIN_COLOR_RATIO_HARD_REJECT:
                print(
                    f"✗ TIER 1 HARD REJECT: Skin color ratio {skin_ratio * 100.0:.2f}% < hard reject threshold {Config.MIN_SKIN_COLOR_RATIO_HARD_REJECT * 100.0:.2f}%"
                )
                print("  Image is obvious non-skin (text, object, blank, etc.)")
                validation_info["reason"] = "obvious_non_skin"
                validation_info["validation_tier"] = "tier_1_hard_reject"
                validation_info["decision"] = "rejected"
                return False, validation_info

            # TIER 3: Good zone - sufficient skin color (always accept)
            if skin_ratio >= Config.MIN_SKIN_COLOR_RATIO_BORDERLINE:
                print(
                    f"✓ TIER 3 GOOD ZONE: Skin color ratio {skin_ratio * 100.0:.2f}% >= borderline {Config.MIN_SKIN_COLOR_RATIO_BORDERLINE * 100.0:.2f}%"
                )
                print(
                    "  Real skin/lesion image detected. Proceeding to MedSAM + EfficientNet."
                )
                validation_info["validation_tier"] = "tier_3_good_zone"
                validation_info["decision"] = "accepted"
                validation_info["passed"] = True

                # Check MobileNetV3 anyway (log as warning if low, but don't reject)
                if (
                    self.loader.validator_model is not None
                    and self.loader.validator_preprocess is not None
                ):
                    try:
                        print(
                            "  Running MobileNetV3 check (warning only, not rejection gate)..."
                        )
                        input_tensor = (
                            self.loader.validator_preprocess(img_rgb)
                            .unsqueeze(0)
                            .to(self.device)
                        )
                        with torch.no_grad():
                            logits = self.loader.validator_model(input_tensor)
                            probs = torch.nn.functional.softmax(logits, dim=1)[0]
                            max_prob, _ = probs.max(0)
                            max_prob_val = float(max_prob.item())

                        validation_info["mobilenet_confidence"] = max_prob_val

                        print(f"  MobileNetV3 confidence: {max_prob_val * 100.0:.2f}%")

                        if max_prob_val < Config.SKIN_VALIDATION_THRESHOLD:
                            print(
                                f"⚠ MobileNetV3 low confidence warning ({max_prob_val * 100.0:.2f}% < {Config.SKIN_VALIDATION_THRESHOLD * 100.0:.2f}%), "
                                f"but continuing because skin color ratio {skin_ratio * 100.0:.2f}% is sufficient."
                            )
                        else:
                            print(
                                f"✓ MobileNetV3 confidence {max_prob_val * 100.0:.2f}% >= threshold {Config.SKIN_VALIDATION_THRESHOLD * 100.0:.2f}%"
                            )

                    except Exception as e:
                        print(f"⚠ MobileNetV3 warning check failed: {e}, continuing")

                print("✓ Image validation PASSED (TIER 3 GOOD ZONE)")
                return True, validation_info

            # TIER 2: Borderline zone - conditional accept based on MobileNetV3
            print(
                f"⚠ TIER 2 BORDERLINE ZONE: Skin color ratio {skin_ratio * 100.0:.2f}% is between {Config.MIN_SKIN_COLOR_RATIO_HARD_REJECT * 100.0:.2f}% and {Config.MIN_SKIN_COLOR_RATIO_BORDERLINE * 100.0:.2f}%"
            )
            print("  Running MobileNetV3 check to decide acceptance...")

            if (
                self.loader.validator_model is not None
                and self.loader.validator_preprocess is not None
            ):
                try:
                    input_tensor = (
                        self.loader.validator_preprocess(img_rgb)
                        .unsqueeze(0)
                        .to(self.device)
                    )
                    with torch.no_grad():
                        logits = self.loader.validator_model(input_tensor)
                        probs = torch.nn.functional.softmax(logits, dim=1)[0]
                        max_prob, _ = probs.max(0)
                        max_prob_val = float(max_prob.item())

                    validation_info["mobilenet_confidence"] = max_prob_val

                    print(f"  MobileNetV3 confidence: {max_prob_val * 100.0:.2f}%")
                    print(
                        f"  Borderline threshold: {Config.SKIN_VALIDATION_THRESHOLD * 100.0:.2f}%"
                    )

                    if max_prob_val >= Config.SKIN_VALIDATION_THRESHOLD:
                        print(
                            f"✓ TIER 2 BORDERLINE ACCEPT: MobileNetV3 {max_prob_val * 100.0:.2f}% >= {Config.SKIN_VALIDATION_THRESHOLD * 100.0:.2f}%"
                        )
                        validation_info["validation_tier"] = "tier_2_borderline_accept"
                        validation_info["decision"] = "accepted"
                        validation_info["passed"] = True
                        print("✓ Image validation PASSED (TIER 2 BORDERLINE)")
                        return True, validation_info
                    else:
                        print(
                            f"✗ TIER 2 BORDERLINE REJECT: MobileNetV3 {max_prob_val * 100.0:.2f}% < {Config.SKIN_VALIDATION_THRESHOLD * 100.0:.2f}%"
                        )
                        validation_info["reason"] = "borderline_low_mobilenet"
                        validation_info["validation_tier"] = "tier_2_borderline_reject"
                        validation_info["decision"] = "rejected"
                        print("✗ Image validation FAILED (TIER 2 BORDERLINE)")
                        return False, validation_info

                except Exception as e:
                    print(f"⚠ MobileNetV3 error in borderline zone: {e}")
                    print(
                        "  Continuing with color check result (ACCEPT due to insufficient evidence)"
                    )
                    validation_info["validation_tier"] = (
                        "tier_2_borderline_mobilenet_error"
                    )
                    validation_info["decision"] = "accepted"
                    validation_info["passed"] = True
                    print(
                        "✓ Image validation PASSED (TIER 2 BORDERLINE - MobileNetV3 error recovery)"
                    )
                    return True, validation_info
            else:
                print(
                    "  MobileNetV3 not available. Accepting based on color check only."
                )
                validation_info["validation_tier"] = "tier_2_borderline_no_mobilenet"
                validation_info["decision"] = "accepted"
                validation_info["passed"] = True
                print("✓ Image validation PASSED (TIER 2 BORDERLINE - no MobileNetV3)")
                return True, validation_info

        except Exception as e:
            print(f"✗ Validation error: {e}")
            validation_info["reason"] = "validation_error"
            validation_info["decision"] = "rejected"
            return False, validation_info

    def run_inference(self, image: Image.Image) -> dict:
        """
        Run full inference pipeline on image.

        CRITICAL SAFETY: If validation fails, immediately return rejection.
        Do NOT run MedSAM, EfficientNet, or OpenRouter on invalid images.

        For valid images:
        1. Validate image (GATE - must pass to proceed)
        2. Segment lesion (MedSAM)
        3. Classify lesion (EfficientNet-B5 /models/incremental_b5.pt)
        4. Return structured result with classification

        Args:
            image (Image.Image): Input image

        Returns:
            dict: Prediction result with classification, segmentation, validation info
        """
        # Step 1: Validate - CRITICAL GATE
        print("\n" + "=" * 70)
        print("INFERENCE PIPELINE START")
        print("=" * 70)

        is_valid, validation_info = self.validate_skin_image(image)

        # If validation fails, reject immediately - do NOT proceed to other models
        if not is_valid:
            print("\n🛑 VALIDATION GATE FAILED - REJECTING IMAGE")
            print("  MedSAM segmentation: SKIPPED (image rejected at validation)")
            print(
                "  EfficientNet-B5 classification: SKIPPED (image rejected at validation)"
            )
            print("  OpenRouter report: SKIPPED (image rejected at validation)")
            print("=" * 70 + "\n")
            return {
                "success": False,
                "rejected": True,
                "validator_passed": False,
                "validation_info": validation_info,
                "class_name": "Invalid image",
                "confidence": 0.0,
                "segmentation_available": False,
            }

        # Validation PASSED - proceed to segmentation and classification
        print("\n✅ VALIDATION GATE PASSED - PROCEEDING TO MEDSAM + EFFICIENTNET-B5")

        # Step 2: Segment with MedSAM
        try:
            cropped, seg_success = self.segment_lesion(image)
        except Exception as e:
            print(f"⚠ MedSAM segmentation error: {e}")
            cropped = self._fallback_crop(image.convert("RGB"))
            seg_success = False

        # Step 3: Classify with EfficientNet-B5 (/models/incremental_b5.pt)
        # CRITICAL: Every accepted valid skin image MUST be classified through this
        try:
            classification = self.classify_lesion(cropped)
            class_name = classification["class_name"]
            confidence = classification["confidence"]
        except Exception as e:
            print(f"✗ EfficientNet-B5 classification failed: {e}")
            raise

        print("=" * 70 + "\n")

        return {
            "success": True,
            "rejected": False,
            "validator_passed": True,
            "validation_info": validation_info,
            "class_name": class_name,
            "confidence": confidence,
            "segmentation_available": seg_success,
        }
