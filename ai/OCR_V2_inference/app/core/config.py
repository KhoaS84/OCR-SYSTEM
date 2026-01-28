"""
Configuration settings for OCR V2 service
"""

from pydantic_settings import BaseSettings
from typing import List
import torch
from pathlib import Path


class Settings(BaseSettings):
    """Application settings"""
    
    PROJECT_NAME: str = "VietOCR API Service"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Server settings
    HOST: str = "0.0.0.0"
    PORT: int = 8002
    
    # Device settings - Auto-detect CUDA availability
    DEVICE: str = "cuda:0" if torch.cuda.is_available() else "cpu"
    
    # VietOCR Model settings
    MODEL_NAME: str = "vgg_transformer"  # or vgg_seq2seq
    
    # Custom model settings
    USE_CUSTOM_MODEL: bool = True
    CUSTOM_MODEL_GDRIVE_ID: str = "17UtJhDv_I5a2AQfU4M7AtnWy2KYiQSMS"
    CUSTOM_MODEL_PATH: str = str(Path(__file__).parent.parent.parent / "weights" / "custom_vietocr_model.pth")
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["*"]
    
    class Config:
        case_sensitive = True


settings = Settings()
