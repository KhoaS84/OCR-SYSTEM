import torch

class Settings:
    PROJECT_NAME: str = "YOLO Inference Service"
    API_V1_STR: str = "/api/v1"

    DEVICE: str = "cuda" if torch.cuda.is_available() else "cpu"
    CONFIDENCE_THRESHOLD: float = 0.6  # Ngưỡng confidence tối thiểu
    
    # File upload settings
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_IMAGE_TYPES: list = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

settings = Settings()
