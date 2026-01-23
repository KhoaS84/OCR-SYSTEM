from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

class DocumentImageResponse(BaseModel):
    id: int
    image_url: str
    side: str  # front/back
    created_at: datetime

    class Config:
        from_attributes = True

class DocumentResponse(BaseModel):
    id: int
    user_id: Optional[int]
    name: str # Tên hiển thị (vd: CCCD - Nguyễn Văn A)
    document_type: str  # cccd/bhyt
    status: str  # pending/processing/completed/failed
    uploaded_at: datetime
    images: List[DocumentImageResponse] = []

    class Config:
        from_attributes = True