from django.utils import timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from api.services import ocr_service
from api.core.deps import get_current_user
from api.core.config import settings
from orm.models.ocr import ocr_jobs, ocr_results
from api.schemas.ocr import OCRJobResponse, OCRResultResponse
import httpx
import logging

logger = logging.getLogger(__name__)

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

@router.post("/detect")
async def detect_document(file: UploadFile = File(...), current_user = Depends(get_current_user)):
    """Phát hiện loại giấy tờ sử dụng YOLO"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            files = {"file": (file.filename, await file.read(), file.content_type)}
            response = await client.post(
                f"{settings.AI_YOLO_URL}/api/v1/detect", 
                files=files
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        logger.error(f"Error calling YOLO service: {e}")
        raise HTTPException(status_code=502, detail=f"YOLO service error: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@router.post("/extract")
async def extract_text(file: UploadFile = File(...), current_user = Depends(get_current_user)):
    """Trích xuất thông tin từ giấy tờ sử dụng Pipeline (YOLO + VietOCR)"""
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            files = {"file": (file.filename, await file.read(), file.content_type)}
            response = await client.post(
                f"{settings.AI_PIPELINE_URL}/api/v1/process",  # Sửa endpoint đúng
                files=files
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        logger.error(f"Error calling Pipeline service: {e}")
        raise HTTPException(status_code=502, detail=f"Pipeline service error: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@router.post("/ocr")
async def ocr_only(file: UploadFile = File(...), current_user = Depends(get_current_user)):
    """Chỉ thực hiện OCR văn bản (không detect)"""
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            files = {"file": (file.filename, await file.read(), file.content_type)}
            response = await client.post(
                f"{settings.AI_OCR_URL}/api/v1/ocr", 
                files=files
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        logger.error(f"Error calling OCR service: {e}")
        raise HTTPException(status_code=502, detail=f"OCR service error: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")