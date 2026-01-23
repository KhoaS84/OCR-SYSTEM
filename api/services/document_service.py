from typing import List, Optional
from orm.models.documents import Documents, DocumentImages
from orm.models.citizens import Citizens
from orm.models.user import User

def create_document_cccd(user_id: int, front_path: str, back_path: str):
    """
    Logic lưu CCCD: 1 Document -> 2 Images (Front/Back)
    """
    try:
        # 1. Lấy user object
        user = User.objects.get(id=user_id)

        # 2. Tạo Document chính
        doc = Documents.objects.create(
            user=user,
            name=f"CCCD - {user.full_name or user.email}",
            document_type=Documents.DocumentsType.CCCD,  # 'cccd'
            status=Documents.DocumentStatus.PENDING      # 'pending'
        )

        # 3. Lưu thông tin 2 ảnh (Mặt trước)
        DocumentImages.objects.create(
            document=doc,
            image_url=front_path,
            side=DocumentImages.SideChoices.FRONT # 'front'
        )

        # 4. Lưu thông tin 2 ảnh (Mặt sau)
        DocumentImages.objects.create(
            document=doc,
            image_url=back_path,
            side=DocumentImages.SideChoices.BACK # 'back'
        )

        # 5. Tạo sẵn bản ghi Citizen (chưa có data, chờ OCR)
        Citizens.objects.create(document=doc)

        return doc
    except Exception as e:
        print(f"Error in create_document_cccd: {e}")
        return None

def create_document_bhyt(user_id: int, image_path: str):
    """
    Logic lưu BHYT: 1 Document -> 1 Image
    """
    try:
        user = User.objects.get(id=user_id)
        
        doc = Documents.objects.create(
            user=user,
            name=f"BHYT - {user.full_name or user.email}",
            document_type=Documents.DocumentsType.BHYT, # 'bhyt'
            status=Documents.DocumentStatus.PENDING
        )

        DocumentImages.objects.create(
            document=doc,
            image_url=image_path,
            side=DocumentImages.SideChoices.FRONT
        )

        Citizens.objects.create(document=doc)
        
        return doc
    except Exception as e:
        print(f"Error in create_document_bhyt: {e}")
        return None

def get_document_by_id(doc_id: int):
    try:
        # Dùng prefetch_related để lấy luôn danh sách images đi kèm (tối ưu query)
        return Documents.objects.prefetch_related('images').get(id=doc_id)
    except Documents.DoesNotExist:
        return None