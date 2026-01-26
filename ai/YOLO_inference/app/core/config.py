import torch

class Settings:
    PROJECT_NAME: str = "YOLO Inference Service"
    API_V1_STR: str = "/api/v1"

    DEVICE: str = "cuda" if torch.cuda.is_available() else "cpu"
    CONFIDENCE_THRESHOLD: float = 0.3  # Giảm từ 0.6 xuống 0.3 để detect nhiều fields hơn
    
    # File upload settings
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_IMAGE_TYPES: list = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

settings = Settings()
