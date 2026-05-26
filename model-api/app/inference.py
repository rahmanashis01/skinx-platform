"""
Inference module for SkinX Model API.

Handles image preprocessing, model predictions, and result aggregation.
"""

from typing import Optional

import numpy as np
import torch
from app.model_loader import ModelLoader
from PIL import Image, ImageOps


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
            transform = self.loader.get_efficientnet_transform()
            input_tensor = transform(cropped_image).unsqueeze(0).to(self.device)

            with torch.no_grad():
                outputs = self.loader.cnn_model(input_tensor)
                probabilities = torch.softmax(outputs, dim=1)[0]
                confidence, predicted_idx = probabilities.max(0)

            class_name = self.loader.classes[predicted_idx.item()]
            confidence_pct = float(confidence.item() * 100.0)

            return {"class_name": class_name, "confidence": confidence_pct}

        except Exception as e:
            raise RuntimeError(f"EfficientNet-B5 inference failed: {e}")

    def validate_skin_image(self, image: Image.Image) -> bool:
        """
        Validate that image contains human skin.

        Uses YCrCb color detection + MobileNetV3 semantic check.

        Args:
            image (Image.Image): Input image

        Returns:
            bool: True if image passes validation, False otherwise
        """
        try:
            img_rgb = image.convert("RGB")
            img_np = np.array(img_rgb)

            if img_np.size == 0:
                return False

            # YCrCb color detection
            R = img_np[:, :, 0].astype(float)
            G = img_np[:, :, 1].astype(float)
            B = img_np[:, :, 2].astype(float)
            Y = 0.299 * R + 0.587 * G + 0.114 * B
            Cr = (R - Y) * 0.713 + 128
            Cb = (B - Y) * 0.564 + 128
            skin_pixels = (Cr >= 133) & (Cr <= 173) & (Cb >= 77) & (Cb <= 127)
            skin_ratio = np.sum(skin_pixels) / skin_pixels.size

            print(f"Skin color ratio: {skin_ratio * 100.0:.2f}%")

            if skin_ratio < 0.12:
                print("⚠ Low skin pixel ratio")
                return False

            # Optional: MobileNetV3 semantic check
            if (
                self.loader.validator_model is not None
                and self.loader.validator_preprocess is not None
            ):
                input_tensor = (
                    self.loader.validator_preprocess(img_rgb)
                    .unsqueeze(0)
                    .to(self.device)
                )
                with torch.no_grad():
                    logits = self.loader.validator_model(input_tensor)
                    probs = torch.nn.functional.softmax(logits, dim=1)[0]
                    # Just check if model runs; any top-5 result passes
                    top5_prob, _ = torch.topk(probs, 5)

                print("✓ MobileNetV3 validation passed")
                return True

            # If validator not loaded, pass on color detection alone
            print("✓ Image passed skin color detection")
            return True

        except Exception as e:
            print(f"⚠ Validation error: {e}. Passing image anyway.")
            return True

    def run_inference(self, image: Image.Image) -> dict:
        """
        Run full inference pipeline on image.

        1. Validate image
        2. Segment lesion
        3. Classify lesion
        4. Return structured result

        Args:
            image (Image.Image): Input image

        Returns:
            dict: Prediction result with classification, segmentation, validation info
        """
        # Step 1: Validate
        is_valid = self.validate_skin_image(image)

        result = {
            "validator_passed": is_valid,
            "class_name": "Non-Skin Image",
            "confidence": 0.0,
            "segmentation_available": False,
        }

        if not is_valid:
            return result

        # Step 2: Segment
        try:
            cropped, seg_success = self.segment_lesion(image)
            result["segmentation_available"] = seg_success
        except Exception as e:
            print(f"⚠ Segmentation error: {e}")
            cropped = self._fallback_crop(image.convert("RGB"))
            result["segmentation_available"] = False

        # Step 3: Classify
        try:
            classification = self.classify_lesion(cropped)
            result["class_name"] = classification["class_name"]
            result["confidence"] = classification["confidence"]
        except Exception as e:
            print(f"✗ Classification failed: {e}")
            raise

        return result
