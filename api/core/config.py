from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "OCR System"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "change-me"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

settings = Settings()