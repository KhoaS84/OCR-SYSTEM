from fastapi import APIRouter, Depends, HTTPException
from orm.models.citizens import Citizens
from orm.models.documents import Documents
from api.schemas.citizen import CitizenUpdate, CitizenResponse
from api.core.deps import get_current_user

router = APIRouter()

@router.get("/{doc_id}", response_model=CitizenResponse)
def get_citizen(doc_id: int, current_user = Depends(get_current_user)):
    doc = Documents.objects.filter(id=doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc.citizen

@router.put("/{doc_id}")
def update_citizen(doc_id: int, data: CitizenUpdate, current_user = Depends(get_current_user)):
    doc = Documents.objects.filter(id=doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    citizen = doc.citizen
    for field, value in data.dict(exclude_unset=True).items():
        setattr(citizen, field, value)
    citizen.save()
    return {"message": "Updated successfully"}