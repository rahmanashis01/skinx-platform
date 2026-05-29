"""
Model loader for SkinX computer vision models.

Loads:
- EfficientNet-B5 for skin lesion classification
- MedSAM for lesion segmentation
- MobileNetV3 for image validation

Compatible with NVIDIA GPU (CUDA) and CPU fallback.
No MLX or Mac-specific device logic.
"""

import os
from pathlib import Path

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from torchvision import models, transforms

from app.config import Config


class ModelLoader:
    """Loads and manages CV models for inference."""

    def __init__(self):
        """Initialize model loader and validate paths."""
        self.config = Config
        self.device = self._get_device()
        self.classes = None
        self.cnn_model = None
        self.validator_model = None
        self.validator_preprocess = None
        self.medsam_predictor = None

        # Validate required files exist at startup
        missing = self.config.validate_required_paths()
        if missing:
            raise FileNotFoundError(
                f"Required model files not found:\n" + "\n".join(missing)
            )

    def _get_device(self) -> torch.device:
        """
        Get torch device (CUDA > CPU).

        Returns:
            torch.device: CUDA if available, else CPU.
        """
        if torch.cuda.is_available():
            device = torch.device("cuda")
            print(f"✓ CUDA device found: {torch.cuda.get_device_name(0)}")
        else:
            device = torch.device("cpu")
            print("✓ Using CPU device (CUDA not available)")

        return device

    def load_classes(self) -> list[str]:
        """
        Load class labels from CSV.

        Returns:
            Sorted list of skin lesion class names.

        Raises:
            FileNotFoundError: If CSV not found.
            ValueError: If CSV format invalid.
        """
        csv_path = self.config.CLASS_CSV_PATH
        print(f"Loading class labels from {csv_path}...")

        if not Path(csv_path).exists():
            raise FileNotFoundError(f"Class CSV not found: {csv_path}")

        try:
            df = pd.read_csv(csv_path)
            self.classes = sorted(df["label"].unique().tolist())
            print(f"✓ Loaded {len(self.classes)} classes")
            return self.classes
        except Exception as e:
            raise ValueError(f"Failed to parse class CSV: {e}")

    def load_efficientnet_b5(self) -> nn.Module:
        """
        Load EfficientNet-B5 classifier.

        Returns:
            Loaded and evaluated model on device.

        Raises:
            FileNotFoundError: If model weights not found.
            RuntimeError: If model loading fails.
        """
        model_path = self.config.EFFICIENTNET_MODEL_PATH

        print(f"Loading EfficientNet-B5 from {model_path} on {self.device}...")

        if not Path(model_path).exists():
            raise FileNotFoundError(f"EfficientNet-B5 weights not found: {model_path}")

        try:
            if self.classes is None:
                self.load_classes()

            num_classes = len(self.classes)
            model = models.efficientnet_b5()
            model.classifier[1] = nn.Linear(
                model.classifier[1].in_features, num_classes
            )
            state_dict = torch.load(model_path, map_location=self.device)
            model.load_state_dict(state_dict)
            model = model.to(self.device)
            model.eval()

            self.cnn_model = model
            print("✓ EfficientNet-B5 loaded successfully")
            return model

        except Exception as e:
            raise RuntimeError(f"Failed to load EfficientNet-B5: {e}")

    def load_mobilenet_v3(self) -> tuple[nn.Module, callable]:
        """
        Load MobileNetV3 for image validation.

        Returns:
            (model, preprocess_fn): Loaded model and preprocessing function.

        Raises:
            RuntimeError: If loading fails.
        """
        model_path = self.config.MOBILENET_MODEL_PATH

        print(f"Loading MobileNetV3 from {model_path} on {self.device}...")

        try:
            from torchvision.models import mobilenet_v3_small

            model = mobilenet_v3_small()

            if Path(model_path).exists():
                print(f"Using local weights: {model_path}")
                state_dict = torch.load(model_path, map_location="cpu")
                model.load_state_dict(state_dict)
            else:
                print(f"Local weights not found. Using pretrained weights...")
                from torchvision.models import MobileNet_V3_Small_Weights

                weights = MobileNet_V3_Small_Weights.DEFAULT
                state_dict = torch.hub.load_state_dict_from_url(
                    weights.url, map_location="cpu"
                )
                model.load_state_dict(state_dict)

            model = model.to(self.device)
            model.eval()

            preprocess = transforms.Compose(
                [
                    transforms.Resize(256),
                    transforms.CenterCrop(224),
                    transforms.ToTensor(),
                    transforms.Normalize(
                        mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]
                    ),
                ]
            )

            self.validator_model = model
            self.validator_preprocess = preprocess
            print("✓ MobileNetV3 loaded successfully")
            return model, preprocess

        except Exception as e:
            print(f"⚠ Failed to load MobileNetV3: {e}")
            self.validator_model = None
            self.validator_preprocess = None
            return None, None

    def load_medsam(self) -> object:
        """
        Load MedSAM segmentation model.

        Returns:
            SamPreditor instance or None if loading fails.
        """
        model_path = self.config.MEDSAM_MODEL_PATH

        print(f"Loading MedSAM from {model_path}...")

        if not Path(model_path).exists():
            print(f"⚠ MedSAM weights not found: {model_path}. Segmentation disabled.")
            self.medsam_predictor = None
            return None

        try:
            from segment_anything import SamPredictor, sam_model_registry

            sam = sam_model_registry["vit_b"](checkpoint=None)
            state_dict = torch.load(model_path, map_location="cpu")
            sam.load_state_dict(state_dict)
            sam.to(device=self.device)

            predictor = SamPredictor(sam)
            self.medsam_predictor = predictor
            print("✓ MedSAM loaded successfully")
            return predictor

        except Exception as e:
            print(f"⚠ Failed to load MedSAM: {e}. Segmentation disabled.")
            self.medsam_predictor = None
            return None

    def get_efficientnet_transform(self) -> transforms.Compose:
        """
        Get preprocessing transform for EfficientNet-B5.

        Returns:
            Transform pipeline (Resize 456x456, Normalize).
        """
        return transforms.Compose(
            [
                transforms.Resize((456, 456)),
                transforms.ToTensor(),
                transforms.Normalize(
                    mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]
                ),
            ]
        )

    def load_all(self) -> dict:
        """
        Load all models at startup.

        IMPORTANT: Models are loaded and assigned to instance variables FIRST,
        then status is calculated from the actual loaded objects.

        Returns:
            Status dict with model availability (reflects actual loaded state).
        """
        print("\nLoading all models...")

        # Load models and assign to instance variables
        self.load_classes()
        self.load_efficientnet_b5()
        self.load_medsam()
        self.load_mobilenet_v3()

        # Calculate status AFTER all models are loaded and assigned
        # Status reflects the actual state of loaded model objects
        status = {
            "device": str(self.device),
            "classes": len(self.classes) if self.classes else 0,
            "efficientnet_loaded": self.cnn_model is not None,
            "medsam_loaded": self.medsam_predictor is not None,
            "mobilenet_loaded": self.validator_model is not None,
        }

        return status
