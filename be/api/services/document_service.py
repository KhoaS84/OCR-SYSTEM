from typing import List
from django.utils import timezone
from orm.models.documents import Documents, DocumentImages
from orm.models.citizens import Citizens

def create_document_cccd(user_id: int, front_path: str, back_path: str):
    try:
        citizen = Citizens.objects.get(user_id=user_id)

        doc = Documents.objects.create(
            citizen=citizen,
            type=Documents.DocumentsType.CCCD,
            status=Documents.DocumentStatus.PENDING,
            issue_date=timezone.now().date(),
            expire_date=timezone.now().date()
        )

        DocumentImages.objects.create(
            document=doc,
            image_path=front_path,
            side=DocumentImages.SideChoices.FRONT
        )

        DocumentImages.objects.create(
            document=doc,
            image_path=back_path,
            side=DocumentImages.SideChoices.BACK
        )

        return doc

    except Citizens.DoesNotExist:
        return None

def create_document_bhyt(user_id: int, image_path: str):
    try:
        citizen = Citizens.objects.get(user_id=user_id)

        doc = Documents.objects.create(
            citizen=citizen,
            type=Documents.DocumentsType.BHYT,
            status=Documents.DocumentStatus.PENDING,
            issue_date=timezone.now().date(),
            expire_date=timezone.now().date()
        )

        DocumentImages.objects.create(
            document=doc,
            image_path=image_path,
            side=DocumentImages.SideChoices.FRONT
        )

        return doc

    except Citizens.DoesNotExist:
        return None

def get_user_documents(user_id: int) -> List[Documents]:
    """Lấy tất cả documents của user thông qua Citizens"""
    try:
        # Tìm citizens thuộc user
        citizens = Citizens.objects.filter(user_id=user_id)
        
        # Lấy tất cả documents của các citizens đó
        documents = []
        for citizen in citizens:
            docs = Documents.objects.filter(citizen=citizen)
            documents.extend(list(docs))
        
        return documents
    except Exception as e:
        print(f"Error getting user documents: {e}")
        return []

def delete_document(doc_id: int, user_id: int) -> bool:
    """Xóa document nếu thuộc về user"""
    try:
        doc = Documents.objects.get(id=doc_id)
        
        # Kiểm tra xem document có thuộc user không
        if doc.citizen.user_id == user_id:
            doc.delete()
            return True
        return False
    except Documents.DoesNotExist:
        return False