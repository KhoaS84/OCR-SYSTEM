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
    return list(Documents.objects.filter(citizen__user_id=user_id))

def delete_document(doc_id: int, user_id: int) -> bool:
    try:
        doc = Documents.objects.get(id=doc_id, citizen__user_id=user_id)
        doc.delete()
        return True
    except Documents.DoesNotExist:
        return False