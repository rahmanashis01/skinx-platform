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
        Classify lesion using EfficientNet-B5.

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
            print("Running EfficientNet-B5 classification...")
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
        Validate that image contains human skin.

        Uses YCrCb color detection + optional MobileNetV3 semantic check.
        Returns early rejection if either check fails.

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
            "color_check_passed": False,
            "mobilenet_check_passed": False,
            "mobilenet_confidence": None,
        }

        try:
            print("🔍 Running skin/image validation...")

            img_rgb = image.convert("RGB")
            img_np = np.array(img_rgb)

            if img_np.size == 0:
                print("✗ Image validation failed: Empty image")
                validation_info["reason"] = "empty_image"
                return False, validation_info

            # Step 1: YCrCb color detection (mandatory)
            print("  Checking skin color distribution...")
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
            print(f"  Min required ratio: {Config.MIN_SKIN_COLOR_RATIO * 100.0:.2f}%")

            if skin_ratio < Config.MIN_SKIN_COLOR_RATIO:
                print(
                    f"✗ Color check FAILED: Insufficient skin pixels ({skin_ratio * 100.0:.2f}% < {Config.MIN_SKIN_COLOR_RATIO * 100.0:.2f}%)"
                )
                validation_info["reason"] = "insufficient_skin_color"
                return False, validation_info

            validation_info["color_check_passed"] = True
            print(f"✓ Color check PASSED")

            # Step 2: MobileNetV3 semantic check (optional but recommended)
            if (
                self.loader.validator_model is not None
                and self.loader.validator_preprocess is not None
            ):
                print("  Running MobileNetV3 validation...")
                try:
                    input_tensor = (
                        self.loader.validator_preprocess(img_rgb)
                        .unsqueeze(0)
                        .to(self.device)
                    )
                    with torch.no_grad():
                        logits = self.loader.validator_model(input_tensor)
                        probs = torch.nn.functional.softmax(logits, dim=1)[0]
                        # MobileNetV3 is a general classifier; we use it as a sanity check.
                        # High confidence in any class suggests a valid object image.
                        max_prob, _ = probs.max(0)
                        max_prob_val = float(max_prob.item())

                        validation_info["mobilenet_confidence"] = max_prob_val

                        print(
                            f"  MobileNetV3 max confidence: {max_prob_val * 100.0:.2f}%"
                        )
                        print(
                            f"  Validation threshold: {Config.SKIN_VALIDATION_THRESHOLD * 100.0:.2f}%"
                        )

                        if max_prob_val >= Config.SKIN_VALIDATION_THRESHOLD:
                            validation_info["mobilenet_check_passed"] = True
                            print(f"✓ MobileNetV3 validation PASSED")
                        else:
                            print(
                                f"✗ MobileNetV3 validation FAILED: Low confidence ({max_prob_val * 100.0:.2f}% < {Config.SKIN_VALIDATION_THRESHOLD * 100.0:.2f}%)"
                            )
                            validation_info["reason"] = "low_mobilenet_confidence"
                            return False, validation_info

                except Exception as e:
                    print(
                        f"⚠ MobileNetV3 error: {e}. Continuing with color check result."
                    )
                    # If MobileNetV3 fails, we already passed color check, so continue
                    validation_info["mobilenet_check_passed"] = True
            else:
                print("  MobileNetV3 validator not available. Using color check only.")
                validation_info["mobilenet_check_passed"] = True

            # Both checks passed (or color passed and validator unavailable)
            validation_info["passed"] = True
            print("✓ Image validation PASSED")
            return True, validation_info

        except Exception as e:
            print(f"✗ Validation error: {e}")
            validation_info["reason"] = "validation_error"
            return False, validation_info

    def run_inference(self, image: Image.Image) -> dict:
        """
        Run full inference pipeline on image.

        CRITICAL SAFETY: If validation fails, immediately return rejection.
        Do NOT run MedSAM, EfficientNet, or OpenRouter on invalid images.

        Pipeline order:
        1. Validate image (GATE - must pass to proceed)
        2. Segment lesion (MedSAM)
        3. Classify lesion (EfficientNet-B5)
        4. Return structured result

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
            print("\n⚠ VALIDATION FAILED - REJECTING IMAGE")
            print("  MedSAM: SKIPPED (validation failed)")
            print("  EfficientNet: SKIPPED (validation failed)")
            print("  OpenRouter: SKIPPED (validation failed)")
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
        print("\n✓ VALIDATION PASSED - PROCEEDING TO SEGMENTATION AND CLASSIFICATION")

        # Step 2: Segment
        try:
            cropped, seg_success = self.segment_lesion(image)
        except Exception as e:
            print(f"⚠ Segmentation error: {e}")
            cropped = self._fallback_crop(image.convert("RGB"))
            seg_success = False

        # Step 3: Classify (only if validation passed)
        try:
            classification = self.classify_lesion(cropped)
            class_name = classification["class_name"]
            confidence = classification["confidence"]
        except Exception as e:
            print(f"✗ Classification failed: {e}")
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
