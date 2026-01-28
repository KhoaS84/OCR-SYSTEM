from typing import List
from fastapi import APIRouter, Depends, HTTPException, Body
from api.core.deps import get_current_user
from api.schemas.user import UserResponse, UserUpdate
from orm.models.user import User

router = APIRouter()

# ================== ME APIs (PHẢI ĐẶT TRƯỚC) ==================

@router.get("/me", response_model=UserResponse)
async def get_me(current_user = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_me(
    user_update: UserUpdate = Body(...),
    current_user = Depends(get_current_user)
):
    """Cập nhật thông tin cá nhân của chính mình"""
    from asgiref.sync import sync_to_async
    from api.core.security import get_password_hash

    if user_update.username:
        current_user.username = user_update.username
    if user_update.email:
        current_user.email = user_update.email
    if user_update.password:
        current_user.password = get_password_hash(user_update.password)

    await sync_to_async(current_user.save)()
    return current_user


# ================== ADMIN APIs ==================

@router.get("/", response_model=List[UserResponse])
async def list_users(current_user = Depends(get_current_user)):
    """Lấy danh sách users (Admin only)"""
    from asgiref.sync import sync_to_async

    if not hasattr(current_user, 'role') or current_user.role != User.Roles.ADMIN:
        raise HTTPException(status_code=403, detail="Only admin can list users")

    users = await sync_to_async(lambda: list(User.objects.all()))()
    return users


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_update: UserUpdate = Body(...),
    current_user = Depends(get_current_user)
):
    """Cập nhật user (Admin only)"""
    from asgiref.sync import sync_to_async
    from api.core.security import get_password_hash

    if not hasattr(current_user, 'role') or current_user.role != User.Roles.ADMIN:
        raise HTTPException(status_code=403, detail="Only admin can update users")

    try:
        user = await sync_to_async(User.objects.get)(id=user_id)
    except User.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")

    if user_update.username:
        user.username = user_update.username
    if user_update.email:
        user.email = user_update.email
    if user_update.role and user_update.role in [User.Roles.ADMIN, User.Roles.USER]:
        user.role = user_update.role
    if user_update.password:
        user.password = get_password_hash(user_update.password)

    await sync_to_async(user.save)()
    return user


@router.delete("/{user_id}")
async def delete_user(user_id: str, current_user = Depends(get_current_user)):
    """Xóa user (Admin only)"""
    from asgiref.sync import sync_to_async

    if not hasattr(current_user, 'role') or current_user.role != User.Roles.ADMIN:
        raise HTTPException(status_code=403, detail="Only admin can delete users")

    if str(current_user.id) == str(user_id):
        raise HTTPException(status_code=400, detail="Cannot delete yourself")

    try:
        user = await sync_to_async(User.objects.get)(id=user_id)
        await sync_to_async(user.delete)()
    except User.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "User deleted successfully"}
