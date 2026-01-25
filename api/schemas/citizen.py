from typing import Optional
from pydantic import BaseModel

class CitizenUpdate(BaseModel):
    name: Optional[str] = None

    class Config:
        extra = "ignore"

class CitizenResponse(BaseModel):
    id: int
    user_id: int
    name: str

    class Config:
        from_attributes = True
        extra = "ignore"