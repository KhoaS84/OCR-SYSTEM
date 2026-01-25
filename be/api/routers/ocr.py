from django.utils import timezone
from fastapi import APIRouter, Depends, HTTPException
from api.services import ocr_service
from api.core.deps import get_current_user
from orm.models.ocr import ocr_jobs, ocr_results
from api.schemas.ocr import OCRJobResponse, OCRResultResponse

router = APIRouter()

@router.post("/process/{document_id}", response_model=OCRJobResponse)
def process(document_id: int, current_user = Depends(get_current_user)):
    job = ocr_service.trigger_ocr(document_id)
    return job

@router.get("/status/{job_id}", response_model=OCRJobResponse)
def get_status(job_id: int):
    try:
        job = ocr_jobs.objects.get(id=job_id)
        return job
    except ocr_jobs.DoesNotExist:
        raise HTTPException(status_code=404, detail="OCR job not found")

@router.get("/results/{document_id}", response_model=list[OCRResultResponse])
def get_results(document_id: int):
    results = ocr_results.objects.filter(ocr_job__document_id=document_id)
    return list(results)