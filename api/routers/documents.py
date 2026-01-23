from typing import List
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from api.schemas.document import DocumentResponse
from api.services import document_service
from api.utils.file import save_upload_file
from api.core.deps import get_current_user

router = APIRouter()

@router.post("/upload/cccd", response_model=DocumentResponse)
async def upload_cccd(front: UploadFile = File(...), back: UploadFile = File(...), current_user = Depends(get_current_user)):
    f_path = save_upload_file(front, "documents/cccd")
    b_path = save_upload_file(back, "documents/cccd")
    return document_service.create_document_cccd(current_user.id, f_path, b_path)

@router.get("/", response_model=List[DocumentResponse])
def list_documents(current_user = Depends(get_current_user)):
    return document_service.get_user_documents(current_user.id)

@router.delete("/{doc_id}")
def delete_document(doc_id: int, current_user = Depends(get_current_user)):
    document_service.delete_document(doc_id, current_user.id)
    return {"status": "deleted"}