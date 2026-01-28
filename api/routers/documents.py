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
    doc = document_service.create_document_cccd(current_user.id, f_path, b_path)
    if not doc:
        raise HTTPException(status_code=400, detail="Citizen not found for user")
    return doc

@router.post("/upload/bhyt", response_model=DocumentResponse)
async def upload_bhyt(front: UploadFile = File(...), back: UploadFile = File(...), current_user = Depends(get_current_user)):
    f_path = save_upload_file(front, "documents/bhyt")
    b_path = save_upload_file(back, "documents/bhyt")
    doc = document_service.create_document_bhyt(current_user.id, f_path, b_path)
    if not doc:
        raise HTTPException(status_code=400, detail="Citizen not found for user")
    return doc

@router.get("/", response_model=List[DocumentResponse])
def list_documents(current_user = Depends(get_current_user)):
    return document_service.get_user_documents(current_user.id)

@router.delete("/{doc_id}")
def delete_document(doc_id: int, current_user = Depends(get_current_user)):
    ok = document_service.delete_document(doc_id, current_user.id)
    if not ok:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"status": "deleted"}