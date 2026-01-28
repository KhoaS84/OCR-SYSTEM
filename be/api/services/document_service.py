from typing import List
from django.utils import timezone
from asgiref.sync import sync_to_async
from orm.models.documents import Documents, DocumentImages
from orm.models.citizens import Citizens

@sync_to_async
def create_document_cccd(user_id: int, front_path: str, back_path: str):
    from orm.models.user import User
    
    # Get or create citizen for this user
    try:
        citizen = Citizens.objects.get(user_id=user_id)
    except Citizens.DoesNotExist:
        # Auto-create a placeholder citizen - will be updated after OCR
        try:
            user = User.objects.get(id=user_id)
            citizen = Citizens.objects.create(
                user=user,
                name="Đang xử lý...",  # Placeholder, will be updated by OCR
                date_of_birth=timezone.now().date(),
                gender="OTHER",
                nationality="Việt Nam"
            )
        except User.DoesNotExist:
            return None

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

@sync_to_async
def create_document_bhyt(user_id: int, image_path: str):
    from orm.models.user import User
    
    # Get or create citizen for this user
    try:
        citizen = Citizens.objects.get(user_id=user_id)
    except Citizens.DoesNotExist:
        # Auto-create a placeholder citizen - will be updated after OCR
        try:
            user = User.objects.get(id=user_id)
            citizen = Citizens.objects.create(
                user=user,
                name="Đang xử lý...",  # Placeholder, will be updated by OCR
                date_of_birth=timezone.now().date(),
                gender="OTHER",
                nationality="Việt Nam"
            )
        except User.DoesNotExist:
            return None

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

@sync_to_async
def get_user_documents(user_id: int) -> List[Documents]:
    return list(Documents.objects.filter(citizen__user_id=user_id))

@sync_to_async
def delete_document(doc_id: str, user_id: int) -> bool:
    try:
        doc = Documents.objects.get(id=doc_id, citizen__user_id=user_id)
        doc.delete()
        return True
    except Documents.DoesNotExist:
        return False