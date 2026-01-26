from typing import List
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from api.schemas.document import DocumentResponse, CCCDCreate, CCCDResponse
from api.services import document_service
from api.utils.file import save_upload_file
from api.core.deps import get_current_user
from orm.models.documents import Documents, CCCD
from orm.models.citizens import Citizens

router = APIRouter()

@router.post("/cccd", response_model=CCCDResponse)
def create_cccd_document(data: CCCDCreate, current_user = Depends(get_current_user)):
    """
    Tạo hoặc cập nhật document CCCD với thông tin đầy đủ
    """
    try:
        print(f"📥 Received CCCD data: {data.model_dump()}")
        
        # Kiểm tra citizen có thuộc về user không
        citizen = Citizens.objects.get(id=data.citizen_id)
        if citizen.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Không có quyền truy cập citizen này")
        
        # Kiểm tra xem citizen đã có CCCD chưa
        existing_document = Documents.objects.filter(
            citizen=citizen,
            type=Documents.DocumentsType.CCCD
        ).first()
        
        if existing_document:
            # Update existing document
            print(f"🔄 Updating existing CCCD document {existing_document.id}")
            existing_document.issue_date = data.issue_date
            existing_document.expire_date = data.expire_date
            existing_document.save()
            
            # Update CCCD detail
            cccd = CCCD.objects.get(document=existing_document)
            cccd.so_cccd = data.so_cccd
            cccd.origin_place = data.origin_place
            cccd.current_place = data.current_place
            cccd.save()
            
            document = existing_document
        else:
            # Tạo document mới
            print(f"✨ Creating new CCCD document")
            document = Documents.objects.create(
                citizen=citizen,
                type=Documents.DocumentsType.CCCD,
                status=Documents.DocumentStatus.PENDING,
                issue_date=data.issue_date,
                expire_date=data.expire_date
            )
            
            # Tạo CCCD detail
            cccd = CCCD.objects.create(
                document=document,
                so_cccd=data.so_cccd,
                origin_place=data.origin_place,
                current_place=data.current_place
            )
        
        # Trả về response với thông tin đầy đủ
        return CCCDResponse(
            document_id=document.id,
            so_cccd=cccd.so_cccd,
            origin_place=cccd.origin_place,
            current_place=cccd.current_place,
            type=document.type,
            status=document.status,
            issue_date=document.issue_date,
            expire_date=document.expire_date,
            citizen_name=citizen.name,
            citizen_dob=citizen.date_of_birth,
            citizen_gender=citizen.gender,
            citizen_nationality=citizen.nationality
        )
    except Citizens.DoesNotExist:
        raise HTTPException(status_code=404, detail="Citizen không tồn tại")
    except Exception as e:
        print(f"❌ Error creating/updating CCCD: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/cccd/{citizen_id}", response_model=CCCDResponse)
def get_cccd_by_citizen(citizen_id: int, current_user = Depends(get_current_user)):
    """
    Lấy thông tin CCCD theo citizen_id
    """
    try:
        # Kiểm tra citizen thuộc về user
        citizen = Citizens.objects.get(id=citizen_id)
        if citizen.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Không có quyền truy cập")
        
        # Tìm document CCCD của citizen
        document = Documents.objects.filter(
            citizen=citizen,
            type=Documents.DocumentsType.CCCD
        ).first()
        
        if not document:
            raise HTTPException(status_code=404, detail="Không tìm thấy CCCD")
        
        # Lấy CCCD detail
        cccd = CCCD.objects.get(document=document)
        
        return CCCDResponse(
            document_id=document.id,
            so_cccd=cccd.so_cccd,
            origin_place=cccd.origin_place,
            current_place=cccd.current_place,
            type=document.type,
            status=document.status,
            issue_date=document.issue_date,
            expire_date=document.expire_date,
            citizen_name=citizen.name,
            citizen_dob=citizen.date_of_birth,
            citizen_gender=citizen.gender,
            citizen_nationality=citizen.nationality
        )
    except Citizens.DoesNotExist:
        raise HTTPException(status_code=404, detail="Citizen không tồn tại")
    except CCCD.DoesNotExist:
        raise HTTPException(status_code=404, detail="CCCD không tồn tại")

@router.post("/upload/cccd", response_model=DocumentResponse)
async def upload_cccd(front: UploadFile = File(...), back: UploadFile = File(...), current_user = Depends(get_current_user)):
    f_path = save_upload_file(front, "documents/cccd")
    b_path = save_upload_file(back, "documents/cccd")
    doc = document_service.create_document_cccd(current_user.id, f_path, b_path)
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