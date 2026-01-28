from typing import List
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Body
from pydantic import BaseModel
from api.schemas.document import DocumentResponse
from api.services import document_service
from api.utils.file import save_upload_file
from api.core.deps import get_current_user
from orm.models.documents import Documents
from datetime import date

class SaveCCCDDataRequest(BaseModel):
    document_id: str
    so_cccd: str = ""
    origin_place: str = ""
    current_place: str = ""
    citizen_name: str = ""
    citizen_dob: str = ""
    citizen_gender: str = ""
    issue_date: str = ""
    expire_date: str = ""

class SaveBHYTDataRequest(BaseModel):
    document_id: str
    so_bhyt: str = ""
    hospital_code: str = ""
    insurance_area: str = ""
    citizen_name: str = ""
    citizen_dob: str = ""
    citizen_gender: str = ""
    issue_date: str = ""
    expire_date: str = ""

router = APIRouter()

# Endpoint cập nhật thông tin CCCD (admin)
from orm.models.user import User
from asgiref.sync import sync_to_async
from orm.models.documents import CCCD, BHYT, Documents
from orm.models.citizens import Citizens

@router.put("/cccd/{document_id}")
async def update_cccd(document_id: str, data: SaveCCCDDataRequest, current_user = Depends(get_current_user)):
    """Admin cập nhật thông tin CCCD"""
    if not hasattr(current_user, 'role') or current_user.role != User.Roles.ADMIN:
        raise HTTPException(status_code=403, detail="Chỉ admin mới được chỉnh sửa CCCD")
    @sync_to_async
    def do_update():
        try:
            doc = Documents.objects.get(id=document_id, type="cccd")
            citizen = doc.citizen
            # Cập nhật các trường
            if data.citizen_name:
                citizen.name = data.citizen_name
            if data.citizen_dob:
                from datetime import datetime
                try:
                    if '/' in data.citizen_dob:
                        citizen.date_of_birth = datetime.strptime(data.citizen_dob, '%d/%m/%Y').date()
                    else:
                        citizen.date_of_birth = datetime.fromisoformat(data.citizen_dob.split('T')[0]).date()
                except Exception:
                    pass
            if data.citizen_gender:
                citizen.gender = data.citizen_gender
            if data.origin_place:
                citizen.origin_place = data.origin_place
            if data.current_place:
                citizen.current_place = data.current_place
            citizen.save()
            # Cập nhật CCCD
            cccd = CCCD.objects.filter(document=doc).first()
            if cccd:
                if data.so_cccd:
                    cccd.so_cccd = data.so_cccd
                if data.issue_date:
                    cccd.issue_date = data.issue_date
                if data.expire_date:
                    cccd.expire_date = data.expire_date
                cccd.save()
            return True
        except Exception as e:
            print(e)
            return False
    ok = await do_update()
    if not ok:
        raise HTTPException(status_code=404, detail="Không tìm thấy hoặc lỗi khi cập nhật")
    return {"status": "updated"}

# Endpoint cập nhật thông tin BHYT (admin)
@router.put("/bhyt/{document_id}")
async def update_bhyt(document_id: str, data: SaveBHYTDataRequest, current_user = Depends(get_current_user)):
    """Admin cập nhật thông tin BHYT"""
    if not hasattr(current_user, 'role') or current_user.role != User.Roles.ADMIN:
        raise HTTPException(status_code=403, detail="Chỉ admin mới được chỉnh sửa BHYT")
    @sync_to_async
    def do_update():
        try:
            doc = Documents.objects.get(id=document_id, type="bhyt")
            citizen = doc.citizen
            # Cập nhật các trường
            if data.citizen_name:
                citizen.name = data.citizen_name
            if data.citizen_dob:
                from datetime import datetime
                try:
                    if '/' in data.citizen_dob:
                        citizen.date_of_birth = datetime.strptime(data.citizen_dob, '%d/%m/%Y').date()
                    else:
                        citizen.date_of_birth = datetime.fromisoformat(data.citizen_dob.split('T')[0]).date()
                except Exception:
                    pass
            if data.citizen_gender:
                citizen.gender = data.citizen_gender
            citizen.save()
            # Cập nhật BHYT
            bhyt = BHYT.objects.filter(document=doc).first()
            if bhyt:
                if data.so_bhyt:
                    bhyt.so_bhyt = data.so_bhyt
                if data.hospital_code:
                    bhyt.hospital_code = data.hospital_code
                if data.insurance_area:
                    bhyt.insurance_area = data.insurance_area
                if data.issue_date:
                    bhyt.issue_date = data.issue_date
                if data.expire_date:
                    bhyt.expire_date = data.expire_date
                bhyt.save()
            return True
        except Exception as e:
            print(e)
            return False
    ok = await do_update()
    if not ok:
        raise HTTPException(status_code=404, detail="Không tìm thấy hoặc lỗi khi cập nhật")
    return {"status": "updated"}

@router.post("/upload/cccd", response_model=DocumentResponse)
async def upload_cccd(front: UploadFile = File(...), back: UploadFile = File(...), current_user = Depends(get_current_user)):
    """Upload ảnh CCCD (Mặt trước + Mặt sau)"""
    f_path = save_upload_file(front, "documents/cccd")
    b_path = save_upload_file(back, "documents/cccd")
    doc = await document_service.create_document_cccd(current_user.id, f_path, b_path)
    if not doc:
        raise HTTPException(status_code=400, detail="Citizen not found for user")
    return doc

@router.post("/upload/bhyt", response_model=DocumentResponse)
async def upload_bhyt(image: UploadFile = File(...), current_user = Depends(get_current_user)):
    """Upload ảnh BHYT"""
    img_path = save_upload_file(image, "documents/bhyt")
    doc = await document_service.create_document_bhyt(current_user.id, img_path)
    if not doc:
        raise HTTPException(status_code=400, detail="Citizen not found for user")
    return doc

@router.get("/{doc_id}", response_model=DocumentResponse)
async def get_document(doc_id: str, current_user = Depends(get_current_user)):
    """Lấy thông tin chi tiết một tài liệu"""
    from asgiref.sync import sync_to_async
    try:
        document = await sync_to_async(Documents.objects.get)(id=doc_id, citizen__user=current_user)
        return document
    except Documents.DoesNotExist:
        raise HTTPException(status_code=404, detail="Document not found")

@router.get("/", response_model=List[DocumentResponse])
async def list_documents(current_user = Depends(get_current_user)):
    """Lấy danh sách tài liệu (phân trang, filter)"""
    return await document_service.get_user_documents(current_user.id)

@router.delete("/{doc_id}")
async def delete_document(doc_id: str, current_user = Depends(get_current_user)):
    """Xóa tài liệu"""
    ok = await document_service.delete_document(doc_id, current_user.id)
    if not ok:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"status": "deleted"}

@router.post("/save-cccd-data")
async def save_cccd_data(request: SaveCCCDDataRequest, current_user = Depends(get_current_user)):
    """Lưu thông tin CCCD từ OCR results vào database"""
    from asgiref.sync import sync_to_async
    from orm.models.documents import CCCD, Documents
    from orm.models.citizens import Citizens
    
    print(f"🔍 Received save_cccd_data request: {request}")
    
    @sync_to_async
    def save_data():
        try:
            # Get document and verify ownership
            doc = Documents.objects.get(id=request.document_id, citizen__user=current_user)
            citizen = doc.citizen
            
            print(f"🔍 Before update - Citizen: {citizen.name}, DOB: {citizen.date_of_birth}")
            print(f"🔍 Request data - Name: {request.citizen_name}, DOB: {request.citizen_dob}")
            print(f"🔍 Document ID from request: {request.document_id}")
            
            # Update citizen info with real data from OCR
            if request.citizen_name and request.citizen_name != "Đang xử lý...":
                citizen.name = request.citizen_name
                print(f"✅ Updated citizen name to: {citizen.name}")
            
            if request.citizen_dob:
                try:
                    # Parse date from string (ISO format or DD/MM/YYYY)
                    from datetime import datetime
                    if '/' in request.citizen_dob:
                        # DD/MM/YYYY format
                        citizen.date_of_birth = datetime.strptime(request.citizen_dob, '%d/%m/%Y').date()
                    else:
                        # ISO format
                        citizen.date_of_birth = datetime.fromisoformat(request.citizen_dob.split('T')[0]).date()
                    print(f"✅ Updated citizen DOB to: {citizen.date_of_birth}")
                except (ValueError, AttributeError) as e:
                    print(f"❌ DOB parse error: {e}")
                    pass  # Keep existing date if parsing fails
            
            # Update gender if provided
            if request.citizen_gender:
                # Map Vietnamese gender to model choices
                if request.citizen_gender.lower() in ['nam', 'male']:
                    citizen.gender = 'MALE'
                elif request.citizen_gender.lower() in ['nữ', 'nu', 'female']:
                    citizen.gender = 'FEMALE'
                print(f"✅ Updated citizen gender to: {citizen.gender}")
            
            citizen.save()
            print(f"✅ Citizen saved - Name: {citizen.name}, DOB: {citizen.date_of_birth}")
            
            # Find latest CCCD document for this citizen (in case multiple documents exist)
            latest_doc = Documents.objects.filter(citizen=citizen, type='cccd').order_by('-created_at').first()
            if latest_doc and latest_doc.id != doc.id:
                print(f"⚠️ Using latest document {latest_doc.id} instead of {doc.id}")
                doc = latest_doc
            
            # Update document dates if provided
            if request.issue_date:
                try:
                    from datetime import datetime
                    if '/' in request.issue_date:
                        doc.issue_date = datetime.strptime(request.issue_date, '%d/%m/%Y').date()
                    else:
                        doc.issue_date = datetime.fromisoformat(request.issue_date.split('T')[0]).date()
                    print(f"✅ Updated document issue_date to: {doc.issue_date}")
                except (ValueError, AttributeError) as e:
                    print(f"❌ Issue date parse error: {e}")
                    
            if request.expire_date:
                try:
                    from datetime import datetime
                    if '/' in request.expire_date:
                        doc.expire_date = datetime.strptime(request.expire_date, '%d/%m/%Y').date()
                    else:
                        doc.expire_date = datetime.fromisoformat(request.expire_date.split('T')[0]).date()
                    print(f"✅ Updated document expire_date to: {doc.expire_date}")
                except (ValueError, AttributeError) as e:
                    print(f"❌ Expire date parse error: {e}")
            
            doc.save()
            
            # Create or update CCCD record
            print(f"🔍 Creating CCCD record for document: {doc.id}")
            cccd, created = CCCD.objects.update_or_create(
                document=doc,
                defaults={
                    'so_cccd': request.so_cccd or '',
                    'origin_place': request.origin_place or '',
                    'current_place': request.current_place or '',
                }
            )
            print(f"✅ CCCD record {'created' if created else 'updated'}: {cccd.document.id}")
            print(f"✅ CCCD data - so_cccd: {cccd.so_cccd}, origin: {cccd.origin_place}, current: {cccd.current_place}")
            
            return {"status": "success", "cccd_id": str(cccd.document.id), "created": created}
        except Documents.DoesNotExist:
            print(f"❌ Document not found: {request.document_id}")
            raise HTTPException(status_code=404, detail="Document not found")
        except Exception as e:
            print(f"❌ Save error: {e}")
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))
    
    try:
        result = await save_data()
        print(f"✅ Main save result: {result}")
        return result
    except Exception as e:
        print(f"❌ Main save error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Error saving CCCD data: {str(e)}")

@router.post("/save-bhyt-data")
async def save_bhyt_data(request: SaveBHYTDataRequest, current_user = Depends(get_current_user)):
    """Lưu thông tin BHYT từ OCR results vào database"""
    from asgiref.sync import sync_to_async
    from orm.models.documents import BHYT, Documents
    from orm.models.citizens import Citizens
    
    print(f"🔍 Received save_bhyt_data request: {request}")
    print(f"🔍 BHYT fields - so_bhyt: '{request.so_bhyt}', hospital: '{request.hospital_code}', area: '{request.insurance_area}'")
    
    @sync_to_async
    def save_data():
        try:
            # Get document and verify ownership
            doc = Documents.objects.get(id=request.document_id, citizen__user=current_user)
            citizen = doc.citizen
            
            print(f"🔍 Before update - Citizen: {citizen.name}, DOB: {citizen.date_of_birth}")
            print(f"🔍 Request data - Name: {request.citizen_name}, DOB: {request.citizen_dob}")
            print(f"🔍 Document ID from request: {request.document_id}")
            
            # Update citizen info with real data from OCR
            if request.citizen_name and request.citizen_name != "Đang xử lý...":
                citizen.name = request.citizen_name
                print(f"✅ Updated citizen name to: {citizen.name}")
            
            if request.citizen_dob:
                try:
                    from datetime import datetime
                    if '/' in request.citizen_dob:
                        citizen.date_of_birth = datetime.strptime(request.citizen_dob, '%d/%m/%Y').date()
                    else:
                        citizen.date_of_birth = datetime.fromisoformat(request.citizen_dob.split('T')[0]).date()
                    print(f"✅ Updated citizen DOB to: {citizen.date_of_birth}")
                except (ValueError, AttributeError) as e:
                    print(f"❌ DOB parse error: {e}")
                    pass
            
            # Update gender if provided
            if request.citizen_gender:
                if request.citizen_gender.lower() in ['nam', 'male']:
                    citizen.gender = 'MALE'
                elif request.citizen_gender.lower() in ['nữ', 'nu', 'female']:
                    citizen.gender = 'FEMALE'
                print(f"✅ Updated citizen gender to: {citizen.gender}")
            
            citizen.save()
            print(f"✅ Citizen saved - Name: {citizen.name}, DOB: {citizen.date_of_birth}")
            
            # Find latest BHYT document for this citizen
            latest_doc = Documents.objects.filter(citizen=citizen, type='bhyt').order_by('-created_at').first()
            if latest_doc and latest_doc.id != doc.id:
                print(f"⚠️ Using latest document {latest_doc.id} instead of {doc.id}")
                doc = latest_doc
            
            # Update document dates if provided
            if request.issue_date:
                try:
                    from datetime import datetime
                    if '/' in request.issue_date:
                        doc.issue_date = datetime.strptime(request.issue_date, '%d/%m/%Y').date()
                    else:
                        doc.issue_date = datetime.fromisoformat(request.issue_date.split('T')[0]).date()
                    print(f"✅ Updated document issue_date to: {doc.issue_date}")
                except (ValueError, AttributeError) as e:
                    print(f"❌ Issue date parse error: {e}")
                    
            if request.expire_date:
                try:
                    from datetime import datetime
                    if '/' in request.expire_date:
                        doc.expire_date = datetime.strptime(request.expire_date, '%d/%m/%Y').date()
                    else:
                        doc.expire_date = datetime.fromisoformat(request.expire_date.split('T')[0]).date()
                    print(f"✅ Updated document expire_date to: {doc.expire_date}")
                except (ValueError, AttributeError) as e:
                    print(f"❌ Expire date parse error: {e}")
            
            doc.save()
            
            # Create or update BHYT record
            print(f"🔍 Creating BHYT record for document: {doc.id}")
            
            # Validate so_bhyt before saving
            if not request.so_bhyt or request.so_bhyt.strip() == '':
                print(f"⚠️ Warning: so_bhyt is empty, using placeholder")
                so_bhyt_value = f"TEMP_{doc.id}"  # Temporary value to avoid duplicate key error
            else:
                so_bhyt_value = request.so_bhyt
            
            bhyt, created = BHYT.objects.update_or_create(
                document=doc,
                defaults={
                    'so_bhyt': so_bhyt_value,
                    'hospital_code': request.hospital_code or '',
                    'insurane_area': request.insurance_area or '',  # Note: typo in model field name
                }
            )
            print(f"✅ BHYT record {'created' if created else 'updated'}: {bhyt.document.id}")
            print(f"✅ BHYT data - so_bhyt: {bhyt.so_bhyt}, hospital: {bhyt.hospital_code}, area: {bhyt.insurane_area}")
            
            return {"status": "success", "bhyt_id": str(bhyt.document.id), "created": created}
        except Documents.DoesNotExist:
            print(f"❌ Document not found: {request.document_id}")
            raise HTTPException(status_code=404, detail="Document not found")
        except Exception as e:
            print(f"❌ Save error: {e}")
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))
    
    try:
        result = await save_data()
        print(f"✅ Main save result: {result}")
        return result
    except Exception as e:
        print(f"❌ Main save error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Error saving BHYT data: {str(e)}")

@router.get("/cccd/by-citizen/{citizen_id}")
async def get_cccd_by_citizen(citizen_id: str, current_user = Depends(get_current_user)):
    """Lấy thông tin CCCD đầy đủ theo citizen ID"""
    from asgiref.sync import sync_to_async
    from orm.models.documents import CCCD, Documents
    from orm.models.citizens import Citizens
    from orm.models.user import User
    
    try:
        # Admin xem tất cả, user thường chỉ xem của mình
        if hasattr(current_user, 'role') and current_user.role == User.Roles.ADMIN:
            citizen = await sync_to_async(Citizens.objects.get)(id=citizen_id)
        else:
            citizen = await sync_to_async(Citizens.objects.get)(id=citizen_id, user=current_user)
        print(f"✅ Found citizen: {citizen.name}")
        
        # Tìm document CCCD của citizen này (lấy latest)
        documents = await sync_to_async(lambda: list(Documents.objects.filter(citizen_id=citizen_id, type="cccd").order_by('-created_at')))()
        print(f"✅ Found {len(documents)} CCCD documents")
        if documents:
            print(f"✅ Latest document: {documents[0].id}")
            print(f"✅ All documents: {[str(d.id) for d in documents]}")
        
        cccd_data = {
            # Citizen info
            "citizen_id": str(citizen.id),
            "citizen_name": citizen.name,
            "citizen_dob": citizen.date_of_birth.isoformat() if citizen.date_of_birth else None,
            "citizen_gender": citizen.gender,
            "citizen_nationality": citizen.nationality,
            # CCCD specific info (nếu có)
            "so_cccd": "",
            "origin_place": "", 
            "current_place": "",
            "has_cccd_document": len(documents) > 0
        }
        
        # Nếu có document CCCD, lấy thông tin chi tiết
        if documents:
            document = documents[0]  # Lấy document đầu tiên
            print(f"✅ Processing document: {document.id}")
            
            # Add document dates
            cccd_data.update({
                "issue_date": document.issue_date.isoformat() if document.issue_date else None,
                "expire_date": document.expire_date.isoformat() if document.expire_date else None,
            })
            
            try:
                cccd = await sync_to_async(CCCD.objects.get)(document=document)
                print(f"✅ Found CCCD record - so_cccd: {cccd.so_cccd}, origin: {cccd.origin_place}, current: {cccd.current_place}")
                cccd_data.update({
                    "so_cccd": cccd.so_cccd or "",
                    "origin_place": cccd.origin_place or "",
                    "current_place": cccd.current_place or "",
                })
            except CCCD.DoesNotExist:
                print(f"⚠️ No CCCD record found for document {document.id}")
                # Document tồn tại nhưng chưa có CCCD record
                pass
        
        print(f"✅ Final CCCD data: {cccd_data}")
        return cccd_data
        
    except Citizens.DoesNotExist:
        raise HTTPException(status_code=404, detail="Citizen not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error fetching CCCD data: {str(e)}")

@router.get("/bhyt/by-citizen/{citizen_id}")
async def get_bhyt_by_citizen(citizen_id: str, current_user = Depends(get_current_user)):
    """Lấy thông tin BHYT đầy đủ theo citizen ID"""
    from asgiref.sync import sync_to_async
    from orm.models.documents import BHYT, Documents
    from orm.models.citizens import Citizens
    from orm.models.user import User
    
    try:
        # Admin xem tất cả, user thường chỉ xem của mình
        if hasattr(current_user, 'role') and current_user.role == User.Roles.ADMIN:
            citizen = await sync_to_async(Citizens.objects.get)(id=citizen_id)
        else:
            citizen = await sync_to_async(Citizens.objects.get)(id=citizen_id, user=current_user)
        print(f"✅ Found citizen: {citizen.name}")
        
        # Tìm document BHYT của citizen này (lấy latest)
        documents = await sync_to_async(lambda: list(Documents.objects.filter(citizen_id=citizen_id, type="bhyt").order_by('-created_at')))()
        print(f"✅ Found {len(documents)} BHYT documents")
        if documents:
            print(f"✅ Latest document: {documents[0].id}")
        
        bhyt_data = {
            # Citizen info
            "citizen_id": str(citizen.id),
            "citizen_name": citizen.name,
            "citizen_dob": citizen.date_of_birth.isoformat() if citizen.date_of_birth else None,
            "citizen_gender": citizen.gender,
            "citizen_nationality": citizen.nationality,
            # BHYT specific info (nếu có)
            "so_bhyt": "",
            "hospital_code": "",
            "insurance_area": "",
            "has_bhyt_document": len(documents) > 0
        }
        
        # Nếu có document BHYT, lấy thông tin chi tiết
        if documents:
            document = documents[0]  # Lấy document đầu tiên
            print(f"✅ Processing document: {document.id}")
            
            # Add document dates
            bhyt_data.update({
                "issue_date": document.issue_date.isoformat() if document.issue_date else None,
                "expire_date": document.expire_date.isoformat() if document.expire_date else None,
            })
            
            try:
                bhyt = await sync_to_async(BHYT.objects.get)(document=document)
                print(f"✅ Found BHYT record - so_bhyt: {bhyt.so_bhyt}, hospital: {bhyt.hospital_code}, area: {bhyt.insurane_area}")
                bhyt_data.update({
                    "so_bhyt": bhyt.so_bhyt or "",
                    "hospital_code": bhyt.hospital_code or "",
                    "insurance_area": bhyt.insurane_area or "",
                })
            except BHYT.DoesNotExist:
                print(f"⚠️ No BHYT record found for document {document.id}")
                pass
        
        print(f"✅ Final BHYT data: {bhyt_data}")
        return bhyt_data
        
    except Citizens.DoesNotExist:
        raise HTTPException(status_code=404, detail="Citizen not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error fetching BHYT data: {str(e)}")

@router.get("/bhyt/by-citizen/{citizen_id}")
async def get_bhyt_by_citizen(citizen_id: str, current_user = Depends(get_current_user)):
    """Lấy thông tin BHYT đầy đủ theo citizen ID"""
    from asgiref.sync import sync_to_async
    from orm.models.documents import BHYT, Documents
    from orm.models.citizens import Citizens
    from orm.models.user import User
    
    try:
        # Admin xem tất cả, user thường chỉ xem của mình
        if hasattr(current_user, 'role') and current_user.role == User.Roles.ADMIN:
            citizen = await sync_to_async(Citizens.objects.get)(id=citizen_id)
        else:
            citizen = await sync_to_async(Citizens.objects.get)(id=citizen_id, user=current_user)
        print(f"✅ Found citizen: {citizen.name}")
        
        # Tìm document BHYT của citizen này (lấy latest)
        documents = await sync_to_async(lambda: list(Documents.objects.filter(citizen_id=citizen_id, type="bhyt").order_by('-created_at')))()
        print(f"✅ Found {len(documents)} BHYT documents")
        if documents:
            print(f"✅ Latest document: {documents[0].id}")
            print(f"✅ All documents: {[str(d.id) for d in documents]}")
        
        bhyt_data = {
            # Citizen info
            "citizen_id": str(citizen.id),
            "citizen_name": citizen.name,
            "citizen_dob": citizen.date_of_birth.isoformat() if citizen.date_of_birth else None,
            "citizen_gender": citizen.gender,
            "citizen_nationality": citizen.nationality,
            # BHYT specific info (nếu có)
            "so_bhyt": "",
            "hospital_code": "", 
            "insurance_area": "",
            "has_bhyt_document": len(documents) > 0
        }
        
        # Nếu có document BHYT, lấy thông tin chi tiết
        if documents:
            document = documents[0]  # Lấy document đầu tiên
            print(f"✅ Processing document: {document.id}")
            
            # Add document dates
            bhyt_data.update({
                "issue_date": document.issue_date.isoformat() if document.issue_date else None,
                "expire_date": document.expire_date.isoformat() if document.expire_date else None,
            })
            
            try:
                bhyt = await sync_to_async(BHYT.objects.get)(document=document)
                print(f"✅ Found BHYT record - so_bhyt: {bhyt.so_bhyt}, hospital: {bhyt.hospital_code}, area: {bhyt.insurane_area}")
                bhyt_data.update({
                    "so_bhyt": bhyt.so_bhyt or "",
                    "hospital_code": bhyt.hospital_code or "",
                    "insurance_area": bhyt.insurane_area or "",
                })
            except BHYT.DoesNotExist:
                print(f"⚠️ No BHYT record found for document {document.id}")
                # Document tồn tại nhưng chưa có BHYT record
                pass
        
        print(f"✅ Final BHYT data: {bhyt_data}")
        return bhyt_data
        
    except Citizens.DoesNotExist:
        raise HTTPException(status_code=404, detail="Citizen not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error fetching BHYT data: {str(e)}")