"""
VietOCR Model Service
Handles model loading and inference using VietOCR
"""

from vietocr.tool.predictor import Predictor
from vietocr.tool.config import Cfg
from PIL import Image
from typing import List, Union
import numpy as np
from pathlib import Path
import logging
import gdown
import os

from app.core.config import settings

logger = logging.getLogger(__name__)


class VietOCRService:
    """VietOCR Model Service"""
    
    def __init__(self):
        self.predictor = None
        self.model_loaded = False
    
    def download_custom_model(self):
        """Download custom model from Google Drive if not exists"""
        model_path = Path(settings.CUSTOM_MODEL_PATH)
        
        # Create weights directory if it doesn't exist
        model_path.parent.mkdir(parents=True, exist_ok=True)
        
        if model_path.exists():
            logger.info(f"Custom model already exists at {model_path}")
            return str(model_path)
        
        logger.info(f"Downloading custom model from Google Drive...")
        try:
            # Download from Google Drive
            url = f"https://drive.google.com/uc?id={settings.CUSTOM_MODEL_GDRIVE_ID}"
            gdown.download(url, str(model_path), quiet=False)
            logger.info(f"Custom model downloaded successfully to {model_path}")
            return str(model_path)
        except Exception as e:
            logger.error(f"Failed to download custom model: {e}")
            raise
        
    def load_model(self):
        """Load the VietOCR model"""
        try:
            logger.info(f"Loading VietOCR model: {settings.MODEL_NAME}")
            
            # Load config
            config = Cfg.load_config_from_name(settings.MODEL_NAME)
            
            # Auto-detect and set device
            import torch
            if torch.cuda.is_available():
                device = settings.DEVICE
                logger.info(f"CUDA is available. Using device: {device}")
            else:
                device = "cpu"
                logger.warning(f"CUDA not available. Falling back to CPU")
            
            config['device'] = device
            
            # Use custom model if enabled
            if settings.USE_CUSTOM_MODEL:
                logger.info("Using custom VietOCR model")
                weights_path = self.download_custom_model()
                config['weights'] = weights_path
                logger.info(f"Custom model weights: {weights_path}")
            
            # Create predictor
            self.predictor = Predictor(config)
            self.model_loaded = True
            
            logger.info(f"VietOCR model loaded successfully on {device}")
            
        except Exception as e:
            logger.error(f"Failed to load VietOCR model: {e}")
            raise
    
    def predict(self, image: Union[Image.Image, np.ndarray, str, Path]) -> str:
        """
        Perform OCR on a single image
        
        Args:
            image: PIL Image, numpy array, or path to image file
            
        Returns:
            Recognized text string
        """
        if not self.model_loaded:
            raise RuntimeError("Model not loaded. Call load_model() first.")
        
        # Convert to PIL Image if needed
        if isinstance(image, (str, Path)):
            image = Image.open(image)
        elif isinstance(image, np.ndarray):
            image = Image.fromarray(image)
        
        # Perform prediction
        result = self.predictor.predict(image)
        
        return result
    
    def predict_batch(self, images: List[Union[Image.Image, np.ndarray]]) -> List[str]:
        """
        Perform OCR on multiple images
        
        Args:
            images: List of PIL Images or numpy arrays
            
        Returns:
            List of recognized text strings
        """
        if not self.model_loaded:
            raise RuntimeError("Model not loaded. Call load_model() first.")
        
        results = []
        for image in images:
            # Convert to PIL Image if needed
            if isinstance(image, np.ndarray):
                image = Image.fromarray(image)
            
            result = self.predictor.predict(image)
            results.append(result)
        
        return results


# Global service instance
ocr_service = VietOCRService()
