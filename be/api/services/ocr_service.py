from django.utils import timezone
from orm.models.ocr import ocr_jobs, ocr_results
from orm.models.documents import Documents

def trigger_ocr(doc_id: int):
    try:
        doc = Documents.objects.get(id=doc_id)
    except Documents.DoesNotExist:
        return None

    job = ocr_jobs.objects.create(
        document=doc,
        status=ocr_jobs.ocr_status.QUEUED,
        model_name="default",
        model_version="1.0"
    )

    # Giả lập xử lý
    job.status = ocr_jobs.ocr_status.PROCESSING
    job.save()

    # Giả lập kết quả trích xuất
    extracted = {
        "name": "NGUYEN VAN A",
        "id_number": "123456789"
    }

    for field, value in extracted.items():
        ocr_results.objects.create(
            ocr_job=job,
            field_name=field,
            raw_text=value,
            confidence_score=0.98
        )

    job.status = ocr_jobs.ocr_status.DONE
    job.finished_at = timezone.now()
    job.save()
    return job