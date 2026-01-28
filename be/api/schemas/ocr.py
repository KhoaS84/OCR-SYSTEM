from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from uuid import UUID

class OCRJobResponse(BaseModel):
    id: UUID
    document_id: UUID
    status: str
    model_name: str
    model_version: str
    created_at: datetime
    finished_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class OCRResultResponse(BaseModel):
    id: UUID
    ocr_job_id: UUID
    field_name: str
    raw_text: str
    confidence_score: float

    class Config:
        from_attributes = True