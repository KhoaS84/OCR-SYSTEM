from models.ocr import ocr_jobs, ocr_results
from django.utils import timezone
from django.db import connection
from pprint import pprint

class OCRJob():
    def create_ocr_job(document, status, model_name, model_version, created_at, finished_at):
        ocr_job = ocr_jobs(
            document=document,
            status=status,
            model_name=model_name,
            model_version=model_version,
            created_at=created_at,
            finished_at=finished_at,
        )
        ocr_job.save()
        print(connection.queries)
        return ocr_job
    
    def get_ocr_job_by_id(job_id):
        try:
            ocr_job = ocr_jobs.objects.get(id=job_id)
            print(connection.queries)
            return ocr_job
        except ocr_jobs.DoesNotExist:
            return None
        
    def update_ocr_job_status(job_id, new_status):
        try:
            ocr_job = ocr_jobs.objects.get(id=job_id)
            ocr_job.status = new_status
            ocr_job.save()
            return ocr_job
        except ocr_jobs.DoesNotExist:
            return None
        
    def delete_ocr_job(job_id):
        try:
            ocr_job = ocr_jobs.objects.get(id=job_id)
            ocr_job.delete()
            print(connection.queries)
            return True
        except ocr_jobs.DoesNotExist:
            return False
        
    def list_ocr_jobs_by_document(document_id):
        ocr_job_list = ocr_jobs.objects.filter(document__id=document_id)
        print(connection.queries)
        return ocr_job_list

class OCRResult():
    def create_ocr_result(field_name, raw_text, confidence_score, bounding_box):
        ocr_result = ocr_results(
            field_name=field_name,
            raw_text=raw_text,
            confidence_score=confidence_score,
            bounding_box=bounding_box,
        )
        ocr_result.save()
        print(connection.queries)
        return ocr_result

    def get_ocr_result_by_id(result_id):
        try:
            ocr_result = ocr_results.objects.get(id=result_id)
            print(connection.queries)
            return ocr_result
        except ocr_results.DoesNotExist:
            return None
        
    def update_ocr_result_data(result_id, new_field_name, new_raw_text, new_confidence_score, new_bounding_box):
        try:
            ocr_result = ocr_results.objects.get(id=result_id)
            ocr_result.field_name = new_field_name
            ocr_result.raw_text = new_raw_text
            ocr_result.confidence_score = new_confidence_score
            ocr_result.bounding_box = new_bounding_box
            ocr_result.save()
            print(connection.queries)
            return ocr_result
        except ocr_results.DoesNotExist:
            return None
        
    def delete_ocr_result(result_id):
        try:
            ocr_result = ocr_results.objects.get(id=result_id)
            ocr_result.delete()
            print(connection.queries)
            return True
        except ocr_results.DoesNotExist:
            return False