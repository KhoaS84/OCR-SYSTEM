from fastapi import APIRouter, Depends, HTTPException, Query
from orm.models.citizens import Citizens
from orm.models.documents import Documents
from api.schemas.citizen import CitizenUpdate, CitizenResponse, CitizenCreate
from api.core.deps import get_current_user
from typing import List

router = APIRouter()

@router.post("/", response_model=CitizenResponse)
def create_citizen(data: CitizenCreate, current_user = Depends(get_current_user)):
    """Tạo citizen mới"""
    try:
        citizen = Citizens(
            user_id=data.user_id,
            name=data.name,
            date_of_birth=data.date_of_birth,
            gender=data.gender,
            nationality=data.nationality or 'Việt Nam'
        )
        citizen.save()
        return citizen
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/search", response_model=List[CitizenResponse])
def search_citizens(q: str = Query(""), current_user = Depends(get_current_user)):
    """Tìm kiếm citizens"""
    if not q or q.strip() == "":
        # Return all if no query
        citizens = Citizens.objects.all().order_by('-created_at')[:50]  # Limit 50, newest first
    else:
        # Search by name only
        citizens = Citizens.objects.filter(name__icontains=q)
    return list(citizens)

@router.get("/doc/{doc_id}", response_model=CitizenResponse)
def get_citizen_by_doc(doc_id: int, current_user = Depends(get_current_user)):
    """Lấy citizen theo document ID"""
    doc = Documents.objects.filter(id=doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc.citizen

@router.get("/{citizen_id}", response_model=CitizenResponse)
def get_citizen_by_id(citizen_id: int, current_user = Depends(get_current_user)):
    """Lấy thông tin citizen theo ID"""
    try:
        citizen = Citizens.objects.get(id=citizen_id)
        return citizen
    except Citizens.DoesNotExist:
        raise HTTPException(status_code=404, detail="Citizen not found")

@router.put("/doc/{doc_id}")
def update_citizen(doc_id: int, data: CitizenUpdate, current_user = Depends(get_current_user)):
    doc = Documents.objects.filter(id=doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    citizen = doc.citizen
    for field, value in data.dict(exclude_unset=True).items():
        setattr(citizen, field, value)
    citizen.save()
    return {"message": "Updated successfully"}