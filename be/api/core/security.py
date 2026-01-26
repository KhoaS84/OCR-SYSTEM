from datetime import datetime, timedelta
from typing import Optional, Union, Any
from jose import jwt
from passlib.context import CryptContext
from api.core.config import settings

# Cấu hình mã khóa mật khẩu
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"

def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    # Debug logging
    print(f"DEBUG: Password type: {type(password)}, Password value: {repr(password)}")
    if not isinstance(password, str):
        raise ValueError(f"Password must be a string, got {type(password)}")
    if len(password.encode('utf-8')) > 72:
        raise ValueError(f"Password is {len(password.encode('utf-8'))} bytes, which exceeds bcrypt's 72-byte limit")
    return pwd_context.hash(password)