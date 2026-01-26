from typing import Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from orm.models.documents import GPLX, Documents
from orm.models.citizens import Citizens
from api.core.deps import get_current_user

router = APIRouter()

class GPLXCreate(BaseModel):
    """Schema để tạo GPLX document"""
    citizen_id: int
    so_gplx: str
    hang_gplx: Optional[str] = None
    noi_cap: Optional[str] = None
    issue_date: Optional[date] = None
    expire_date: Optional[date] = None
    
    class Config:
        from_attributes = True

class GPLXResponse(BaseModel):
    """Schema trả về GPLX với thông tin đầy đủ"""
    document_id: int
    so_gplx: str
    hang_gplx: Optional[str] = None
    noi_cap: Optional[str] = None
    # Thông tin từ document
    type: str
    status: str
    issue_date: Optional[date] = None
    expire_date: Optional[date] = None
    # Thông tin citizen
    citizen_name: Optional[str] = None
    citizen_dob: Optional[date] = None
    citizen_gender: Optional[str] = None
    citizen_nationality: Optional[str] = None
    
    class Config:
        from_attributes = True

@router.post("/", response_model=GPLXResponse)
def create_gplx_document(data: GPLXCreate, current_user = Depends(get_current_user)):
    """Tạo hoặc cập nhật document GPLX với thông tin đầy đủ"""
    try:
        print(f"📥 Received GPLX data: {data.model_dump()}")
        
        # Kiểm tra citizen có thuộc về user không
        citizen = Citizens.objects.get(id=data.citizen_id)
        if citizen.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Không có quyền truy cập citizen này")
        
        # Kiểm tra xem citizen đã có GPLX chưa
        existing_document = Documents.objects.filter(
            citizen=citizen,
            type=Documents.DocumentsType.GPLX
        ).first()
        
        if existing_document:
            # Update existing document
            print(f"🔄 Updating existing GPLX document {existing_document.id}")
            existing_document.issue_date = data.issue_date
            existing_document.expire_date = data.expire_date
            existing_document.save()
            
            # Update GPLX detail
            gplx = GPLX.objects.get(document=existing_document)
            gplx.so_gplx = data.so_gplx
            gplx.hang_gplx = data.hang_gplx
            gplx.noi_cap = data.noi_cap
            gplx.save()
            
            document = existing_document
        else:
            # Tạo document mới
            print(f"✨ Creating new GPLX document")
            document = Documents.objects.create(
                citizen=citizen,
                type=Documents.DocumentsType.GPLX,
                status=Documents.DocumentStatus.PENDING,
                issue_date=data.issue_date,
                expire_date=data.expire_date
            )
            
            # Tạo GPLX detail
            gplx = GPLX.objects.create(
                document=document,
                so_gplx=data.so_gplx,
                hang_gplx=data.hang_gplx,
                noi_cap=data.noi_cap
            )
        
        # Trả về response với thông tin đầy đủ
        return GPLXResponse(
            document_id=document.id,
            so_gplx=gplx.so_gplx,
            hang_gplx=gplx.hang_gplx,
            noi_cap=gplx.noi_cap,
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
        print(f"❌ Error creating/updating GPLX: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{citizen_id}", response_model=GPLXResponse)
def get_gplx_by_citizen(citizen_id: int, current_user = Depends(get_current_user)):
    """Lấy thông tin GPLX của citizen"""
    try:
        # Kiểm tra citizen có thuộc về user không
        citizen = Citizens.objects.get(id=citizen_id)
        if citizen.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Không có quyền truy cập citizen này")
        
        # Tìm document GPLX của citizen
        document = Documents.objects.filter(
            citizen=citizen,
            type=Documents.DocumentsType.GPLX
        ).first()
        
        if not document:
            raise HTTPException(status_code=404, detail="Không tìm thấy GPLX của citizen này")
        
        # Lấy thông tin GPLX detail
        gplx = GPLX.objects.get(document=document)
        
        # Trả về response với thông tin đầy đủ
        return GPLXResponse(
            document_id=document.id,
            so_gplx=gplx.so_gplx,
            hang_gplx=gplx.hang_gplx,
            noi_cap=gplx.noi_cap,
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
    except GPLX.DoesNotExist:
        raise HTTPException(status_code=404, detail="GPLX không tồn tại")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
