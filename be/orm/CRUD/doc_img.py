from models.documents import DocumentImages
from django.utils import timezone
from django.db import connection
from pprint import pprint

def create_document_image(document, image_path, uploaded_at):
    doc_image = DocumentImages(
        document=document,
        image_path=image_path,
        uploaded_at=uploaded_at,
        created_at=timezone.now(),
    )
    doc_image.save()
    print(connection.queries)
    return doc_image

def get_document_image_by_id(image_id):
    try:
        doc_image = DocumentImages.objects.get(id=image_id)
        print(connection.queries)
        return doc_image
    except DocumentImages.DoesNotExist:
        return None

def update_document_image_path(image_id, new_image_path):
    try:
        doc_image = DocumentImages.objects.get(id=image_id)
        doc_image.image_path = new_image_path
        doc_image.save()
        print(connection.queries)
        return doc_image
    except DocumentImages.DoesNotExist:
        return None

def delete_document_image(image_id):
    try:
        doc_image = DocumentImages.objects.get(id=image_id)
        doc_image.delete()
        print(connection.queries)
        return True
    except DocumentImages.DoesNotExist:
        return False
