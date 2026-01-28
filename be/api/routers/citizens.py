from fastapi import APIRouter, Depends, HTTPException
from typing import List
from orm.models.citizens import Citizens
from orm.models.documents import Documents
from api.schemas.citizen import CitizenCreate, CitizenUpdate, CitizenResponse
from api.core.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[CitizenResponse])
async def list_citizens(current_user = Depends(get_current_user)):
    """Danh sách công dân. Admin xem tất cả, user thường chỉ xem của mình."""
    from asgiref.sync import sync_to_async
    def get_all():
        from orm.models.user import User
        if hasattr(current_user, 'role') and current_user.role == User.Roles.ADMIN:
            return list(Citizens.objects.all())
        else:
            return list(Citizens.objects.filter(user=current_user))
    citizens = await sync_to_async(get_all)()
    return citizens

@router.post("/", response_model=CitizenResponse)
async def create_citizen(citizen_data: CitizenCreate, current_user = Depends(get_current_user)):
    """Tạo mới công dân thủ công (ít dùng nếu qua luồng OCR)"""
    from asgiref.sync import sync_to_async
    
    @sync_to_async
    def create():
        return Citizens.objects.create(
            user=current_user,
            name=citizen_data.name,
            date_of_birth=citizen_data.date_of_birth,
            gender=citizen_data.gender,
            nationality=citizen_data.nationality
        )
    
    citizen = await create()
    return citizen

@router.get("/search", response_model=List[CitizenResponse])
async def search_citizens(q: str = "", current_user = Depends(get_current_user)):
    """Tìm kiếm công dân theo tên. Admin xem tất cả, user thường chỉ xem của mình."""
    from asgiref.sync import sync_to_async
    def search():
        from orm.models.user import User
        if hasattr(current_user, 'role') and current_user.role == User.Roles.ADMIN:
            # Admin xem tất cả
            if q:
                return list(Citizens.objects.filter(name__icontains=q))
            else:
                return list(Citizens.objects.all())
        else:
            # User thường chỉ xem của mình
            if q:
                return list(Citizens.objects.filter(user=current_user, name__icontains=q))
            else:
                return list(Citizens.objects.filter(user=current_user))
    citizens = await sync_to_async(search)()
    return citizens

@router.get("/{citizen_id}", response_model=CitizenResponse)
async def get_citizen_by_id(citizen_id: str, current_user = Depends(get_current_user)):
    """Get citizen by ID"""
    from asgiref.sync import sync_to_async
    try:
        citizen = await sync_to_async(Citizens.objects.get)(id=citizen_id, user=current_user)
        return citizen
    except Citizens.DoesNotExist:
        raise HTTPException(status_code=404, detail="Citizen not found")

@router.put("/{citizen_id}")
async def update_citizen(citizen_id: str, data: CitizenUpdate, current_user = Depends(get_current_user)):
    """Update citizen by ID"""
    from asgiref.sync import sync_to_async
    
    @sync_to_async
    def update():
        try:
            citizen = Citizens.objects.get(id=citizen_id, user=current_user)
            for field, value in data.dict(exclude_unset=True).items():
                setattr(citizen, field, value)
            citizen.save()
            return True
        except Citizens.DoesNotExist:
            return False
    
    success = await update()
    if not success:
        raise HTTPException(status_code=404, detail="Citizen not found")
    return {"message": "Updated successfully"}