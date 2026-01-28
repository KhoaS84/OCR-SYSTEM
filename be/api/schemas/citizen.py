from typing import Optional
from pydantic import BaseModel
from uuid import UUID
from datetime import date

class CitizenCreate(BaseModel):
    name: str
    date_of_birth: date
    gender: str
    nationality: str = "Việt Nam"

    class Config:
        extra = "ignore"

class CitizenUpdate(BaseModel):
    name: Optional[str] = None

    class Config:
        extra = "ignore"

class CitizenResponse(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    date_of_birth: date
    gender: str
    nationality: str

    class Config:
        from_attributes = True
        extra = "ignore"