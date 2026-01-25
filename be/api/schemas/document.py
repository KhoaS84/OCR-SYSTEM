from typing import List, Optional
from datetime import datetime, date
from pydantic import BaseModel

class DocumentImageResponse(BaseModel):
    id: int
    image_path: str
    side: str
    uploaded_at: datetime

    class Config:
        from_attributes = True

class DocumentResponse(BaseModel):
    id: int
    citizen_id: int
    type: str
    status: str
    issue_date: date
    expire_date: date
    created_at: datetime
    images: List[DocumentImageResponse] = []

    class Config:
        from_attributes = True