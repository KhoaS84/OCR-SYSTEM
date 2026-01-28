from django.utils import timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from api.services import ocr_service
from api.core.deps import get_current_user
from orm.models.ocr import ocr_jobs, ocr_results
from api.schemas.ocr import OCRJobResponse, OCRResultResponse

router = APIRouter()

@router.post("/extract")
async def extract_text(file: UploadFile = File(...)):
    """
    Extract text from uploaded image using OCR
    Mobile app endpoint
    """
    import httpx
    import os
    
    try:
        print(f"📥 Received file: {file.filename}, size: {file.size}, content_type: {file.content_type}")
        
        # Basic validation
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
            
        # Check file type
        if file.content_type not in ["image/jpeg", "image/jpg", "image/png"]:
            raise HTTPException(status_code=400, detail="Invalid file type")
        
        # Get AI pipeline URL from environment
        pipeline_url = os.getenv("AI_PIPELINE_URL", "http://localhost:8003")
        
        try:
            # Read file content
            file_content = await file.read()
            await file.seek(0)  # Reset file pointer
            
            # Prepare multipart form data for pipeline service
            files = {
                'file': (file.filename, file_content, file.content_type)
            }
            data = {
                'conf_threshold': '0.5',
                'iou_threshold': '0.45'
            }
            
            print(f"🚀 Sending to AI Pipeline: {pipeline_url}/api/v1/process")
            
            # Send to AI pipeline service
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{pipeline_url}/api/v1/process",
                    files=files,
                    data=data
                )
                
                if response.status_code == 200:
                    result = response.json()
                    print(f"✅ AI Pipeline response: {result}")
                    
                    # Return the result from AI pipeline
                    return result
                else:
                    print(f"❌ AI Pipeline error: {response.status_code} - {response.text}")
                    raise HTTPException(status_code=500, detail=f"AI Pipeline error: {response.status_code}")
                    
        except httpx.RequestError as e:
            print(f"❌ Request to AI Pipeline failed: {e}")
            raise HTTPException(status_code=500, detail="AI Pipeline service unavailable")
        except Exception as e:
            print(f"❌ AI Pipeline processing error: {e}")
            raise HTTPException(status_code=500, detail=str(e))
            
    except Exception as e:
        print(f"❌ OCR extract error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/process/{document_id}", response_model=OCRJobResponse)
async def process(document_id: str, current_user = Depends(get_current_user)):
    job = await ocr_service.trigger_ocr(document_id)
    return job

@router.get("/status/{job_id}", response_model=OCRJobResponse)
async def get_status(job_id: str):
    from asgiref.sync import sync_to_async
    try:
        job = await sync_to_async(ocr_jobs.objects.get)(id=job_id)
        return job
    except ocr_jobs.DoesNotExist:
        raise HTTPException(status_code=404, detail="OCR job not found")

@router.get("/results/{document_id}", response_model=list[OCRResultResponse])
async def get_results(document_id: str):
    from asgiref.sync import sync_to_async
    results = await sync_to_async(lambda: list(ocr_results.objects.filter(ocr_job__document_id=document_id)))()
    return results