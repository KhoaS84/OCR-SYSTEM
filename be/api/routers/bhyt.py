from typing import Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from orm.models.documents import BHYT, Documents
from orm.models.citizens import Citizens
from api.core.deps import get_current_user

router = APIRouter()

class BHYTCreate(BaseModel):
    """Schema để tạo BHYT document"""
    citizen_id: int
    so_bhyt: str
    hospital_code: str
    insurance_area: str
    issue_date: Optional[date] = None
    expire_date: Optional[date] = None
    
    class Config:
        from_attributes = True

class BHYTResponse(BaseModel):
    """Schema trả về BHYT với thông tin đầy đủ"""
    document_id: int
    so_bhyt: str
    hospital_code: str
    insurance_area: str
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

@router.post("/", response_model=BHYTResponse)
def create_bhyt_document(data: BHYTCreate, current_user = Depends(get_current_user)):
    """Tạo hoặc cập nhật document BHYT với thông tin đầy đủ"""
    try:
        print(f"📥 Received BHYT data: {data.model_dump()}")
        
        # Kiểm tra citizen có thuộc về user không
        citizen = Citizens.objects.get(id=data.citizen_id)
        if citizen.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Không có quyền truy cập citizen này")
        
        # Kiểm tra xem citizen đã có BHYT chưa
        existing_document = Documents.objects.filter(
            citizen=citizen,
            type=Documents.DocumentsType.BHYT
        ).first()
        
        if existing_document:
            # Update existing document
            print(f"🔄 Updating existing BHYT document {existing_document.id}")
            existing_document.issue_date = data.issue_date
            existing_document.expire_date = data.expire_date
            existing_document.save()
            
            # Update BHYT detail
            bhyt = BHYT.objects.get(document=existing_document)
            bhyt.so_bhyt = data.so_bhyt
            bhyt.hospital_code = data.hospital_code
            bhyt.insurance_area = data.insurance_area
            bhyt.save()
            
            document = existing_document
        else:
            # Tạo document mới
            print(f"✨ Creating new BHYT document")
            document = Documents.objects.create(
                citizen=citizen,
                type=Documents.DocumentsType.BHYT,
                status=Documents.DocumentStatus.PENDING,
                issue_date=data.issue_date,
                expire_date=data.expire_date
            )
            
            # Tạo BHYT detail
            bhyt = BHYT.objects.create(
                document=document,
                so_bhyt=data.so_bhyt,
                hospital_code=data.hospital_code,
                insurance_area=data.insurance_area
            )
        
        # Trả về response với thông tin đầy đủ
        return BHYTResponse(
            document_id=document.id,
            so_bhyt=bhyt.so_bhyt,
            hospital_code=bhyt.hospital_code,
            insurance_area=bhyt.insurance_area,
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
        print(f"❌ Error creating/updating BHYT: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{citizen_id}", response_model=BHYTResponse)
def get_bhyt_by_citizen(citizen_id: int, current_user = Depends(get_current_user)):
    """Lấy thông tin BHYT của citizen"""
    try:
        # Kiểm tra citizen có thuộc về user không
        citizen = Citizens.objects.get(id=citizen_id)
        if citizen.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Không có quyền truy cập citizen này")
        
        # Tìm document BHYT của citizen
        document = Documents.objects.filter(
            citizen=citizen,
            type=Documents.DocumentsType.BHYT
        ).first()
        
        if not document:
            raise HTTPException(status_code=404, detail="Không tìm thấy BHYT của citizen này")
        
        # Lấy thông tin BHYT detail
        bhyt = BHYT.objects.get(document=document)
        
        # Trả về response với thông tin đầy đủ
        return BHYTResponse(
            document_id=document.id,
            so_bhyt=bhyt.so_bhyt,
            hospital_code=bhyt.hospital_code,
            insurance_area=bhyt.insurance_area,
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
    except BHYT.DoesNotExist:
        raise HTTPException(status_code=404, detail="BHYT không tồn tại")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
