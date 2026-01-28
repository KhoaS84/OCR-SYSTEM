"""
Configuration settings for OCR API service
"""

import os
import torch
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings"""
    
    # Project info
    PROJECT_NAME: str = "OCR API Service"
    VERSION: str = "1.0.0"
    
    # API settings
    API_V1_PREFIX: str = "/api/v1"
    
    # CORS settings
    ALLOWED_ORIGINS: List[str] = ["*"]
    
    # Model settings
    OCR_MODEL_PATH: str = os.getenv(
        "OCR_MODEL_PATH", 
        "OCR_CNN_Vietnamese/best_ocr_model.pth"
    )
    DEVICE: str = "cuda" if torch.cuda.is_available() else "cpu"
    
    # Auto-setup settings
    AUTO_SETUP: bool = os.getenv("AUTO_SETUP", "true").lower() in ("true", "1", "yes")
    
    # Image processing settings
    MAX_IMAGE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_IMAGE_TYPES: List[str] = ["image/jpeg", "image/png", "image/jpg"]
    
    # OCR settings
    DEFAULT_CONF_THRESHOLD: float = 0.5
    MAX_SEQUENCE_LENGTH: int = 36
    IMAGE_HEIGHT: int = 32
    IMAGE_WIDTH: int = 128
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
