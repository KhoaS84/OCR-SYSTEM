from typing import List, Optional
from datetime import datetime, date
from pydantic import BaseModel
from uuid import UUID

class CCCDCreate(BaseModel):
    citizen_id: UUID
    so_cccd: str
    origin_place: str
    current_place: str
    issue_date: Optional[date] = None
    expire_date: Optional[date] = None

    class Config:
        extra = "ignore"

class DocumentImageResponse(BaseModel):
    id: UUID
    image_path: str
    side: str
    uploaded_at: datetime

    class Config:
        from_attributes = True

class DocumentResponse(BaseModel):
    id: UUID
    citizen_id: UUID
    type: str
    status: str
    issue_date: date
    expire_date: date
    created_at: datetime
    images: List[DocumentImageResponse] = []

    class Config:
        from_attributes = True