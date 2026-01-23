from fastapi import APIRouter, Depends, HTTPException
from orm.models.citizens import Citizens
from api.schemas.citizen import CitizenUpdate, CitizenResponse
from api.core.deps import get_current_user

router = APIRouter()

@router.get("/{doc_id}", response_model=CitizenResponse)
def get_citizen(doc_id: int):
    citizen = Citizens.objects.filter(document_id=doc_id).first()
    if not citizen: raise HTTPException(status_code=404)
    return citizen

@router.put("/{doc_id}")
def update_citizen(doc_id: int, data: CitizenUpdate):
    citizen = Citizens.objects.filter(document_id=doc_id).first()
    for field, value in data.dict(exclude_unset=True).items():
        setattr(citizen, field, value)
    citizen.save()
    return {"message": "Updated successfully"}