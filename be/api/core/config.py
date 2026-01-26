import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "OCR System"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # AI Services URLs
    AI_YOLO_URL: str = os.getenv("AI_YOLO_URL", "http://localhost:8001")
    AI_OCR_URL: str = os.getenv("AI_OCR_URL", "http://localhost:8002")
    AI_PIPELINE_URL: str = os.getenv("AI_PIPELINE_URL", "http://localhost:8003")
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/ocrdb")

settings = Settings()