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
    issue_date: Optional[date] = None
    expire_date: Optional[date] = None
    created_at: datetime
    images: List[DocumentImageResponse] = []

    class Config:
        from_attributes = True

class CCCDCreate(BaseModel):
    """Schema để tạo CCCD document"""
    citizen_id: int
    so_cccd: str
    origin_place: str
    current_place: str
    issue_date: Optional[date] = None
    expire_date: Optional[date] = None
    
    class Config:
        from_attributes = True

class CCCDResponse(BaseModel):
    """Schema trả về CCCD với thông tin đầy đủ"""
    document_id: int
    so_cccd: str
    origin_place: str
    current_place: str
    # Thông tin từ document
    type: str
    status: str
    issue_date: date
    expire_date: date
    # Thông tin citizen
    citizen_name: Optional[str] = None
    citizen_dob: Optional[date] = None
    citizen_gender: Optional[str] = None
    citizen_nationality: Optional[str] = None
    
    class Config:
        from_attributes = True