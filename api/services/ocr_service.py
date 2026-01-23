from orm.models.ocr import ocr_jobs, ocr_results
from orm.models.documents import Documents
from orm.models.citizens import Citizens

def trigger_ocr(doc_id: int):
    doc = Documents.objects.get(id=doc_id)
    job = ocr_jobs.objects.create(document=doc, status="pending")
    # Thực tế: Gọi Celery task hoặc Thread ở đây
    # Giả lập xử lý nhanh:
    job.status = "processing"
    job.save()
    
    # Giả lập kết quả trích xuất
    data = {"name": "NGUYEN VAN A", "id_number": "123456789"}
    ocr_results.objects.create(job=job, raw_data=data, confidence_score=0.98)
    
    # Cập nhật thông tin Citizen
    citizen, _ = Citizens.objects.get_or_create(document=doc)
    citizen.name = data["name"]
    citizen.id_number = data["id_number"]
    citizen.save()
    
    job.status = "completed"
    job.save()
    return job