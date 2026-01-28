from typing import Optional
from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime

#Schema cho Token trả về
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayLoad(BaseModel):
    sub: Optional[str] = None

#Schema khi user gửi request tạo tài khoản
class UserCreate(BaseModel):
    email: EmailStr
    password: str

#Schema cho việc update user (Admin)
class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    password: Optional[str] = None

#Schema khi trả về thông tin user (hide password)
class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    username: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True