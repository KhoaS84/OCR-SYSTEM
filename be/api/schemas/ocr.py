from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

class OCRJobResponse(BaseModel):
    id: int
    document_id: int
    status: str
    model_name: str
    model_version: str
    created_at: datetime
    finished_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class OCRResultResponse(BaseModel):
    id: int
    ocr_job_id: int
    field_name: str
    raw_text: str
    confidence_score: float

    class Config:
        from_attributes = True