from fastapi import APIRouter, Depends
from api.core.deps import get_current_user
from api.schemas.user import UserResponse

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user = Depends(get_current_user)):
    """Lấy thông tin user hiện tại"""
    return current_user

@router.get("/")
def list_users():
    return []