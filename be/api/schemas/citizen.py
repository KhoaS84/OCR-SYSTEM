from typing import Optional
from pydantic import BaseModel
from datetime import date

class CitizenCreate(BaseModel):
    user_id: int
    name: str
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    nationality: Optional[str] = 'Việt Nam'
    
    class Config:
        from_attributes = True

class CitizenUpdate(BaseModel):
    name: Optional[str] = None

    class Config:
        extra = "ignore"

class CitizenResponse(BaseModel):
    id: int
    user_id: int
    name: str
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    nationality: Optional[str] = None

    class Config:
        from_attributes = True
        extra = "ignore"