from fastapi import APIRouter, Depends, UploadFile, File
from api.services.document_service import create_cccd
from api.schemas.document import DocumentResponse
from api.core.deps import get_currents_user

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/cccd", response_mode=DocumentResponse)
def upload_cccd(
    front: UploadFile = File(...),
    back: UploadFile = File(...),
    user = Depends(get_currents_user)
):
    return create_cccd(user, front, back)

