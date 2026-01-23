from typing import Optional
from pydantic import BaseModel, EmailStr

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
    full_name: Optional[str] = None
    phone: Optional[str] = None

#Schema khi trả về thông tin user (hide password)
class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    phone: Optional[str] = None
    is_activate: bool
    role: str

    class Config:
        from_attributes = True