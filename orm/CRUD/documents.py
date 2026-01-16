from models.documents import Documents, CCCD, BHYT, DocumentImages
from django.utils import timezone
from django.db import connection
from pprint import pprint

def create_document(citizen, document_type, issue_date, expiry_date, created_at):
    document = Documents(
        citizen=citizen,
        type=document_type,
        status=Documents.DocumentStatus.PENDING,
        issue_date=issue_date,
        expire_date=expiry_date,
        created_at=timezone.now(),
    )
    document.save()
    return document

def get_document_by_id(document_id):
    try:
        document = Documents.objects.get(id=document_id)
        return document
    except Documents.DoesNotExist:
        return None

def update_document_status(document_id, new_status):
    try:
        document = Documents.objects.get(id=document_id)
        document.status = new_status
        document.save()
        return document
    except Documents.DoesNotExist:
        return None

def delete_document(document_id):
    try:
        document = Documents.objects.get(id=document_id)
        document.delete()
        return True
    except Documents.DoesNotExist:
        return False
      
def list_documents_by_citizen(citizen_id):
    documents = Documents.objects.filter(citizen__id=citizen_id)
    return documents

