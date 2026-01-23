from fastapi import APIRouter, Depends
from api.services import ocr_service
from api.core.deps import get_current_user
from orm.models.ocr import ocr_jobs, ocr_results

router = APIRouter()

@router.post("/process/{document_id}")
def process(document_id: int, current_user = Depends(get_current_user)):
    job = ocr_service.trigger_ocr(document_id)
    return {"job_id": job.id, "status": job.status}

@router.get("/status/{job_id}")
def get_status(job_id: int):
    job = ocr_jobs.objects.get(id=job_id)
    return {"status": job.status}

@router.get("/results/{document_id}")
def get_results(document_id: int):
    result = ocr_results.objects.filter(job__document_id=document_id).last()
    return result.raw_data if result else {}