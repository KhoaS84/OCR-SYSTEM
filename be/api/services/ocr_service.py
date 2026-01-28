from django.utils import timezone
from asgiref.sync import sync_to_async
from orm.models.ocr import ocr_jobs, ocr_results
from orm.models.documents import Documents, DocumentImages
import httpx
import os

@sync_to_async
def trigger_ocr(doc_id: str):
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

    try:
        # Update status to processing
        job.status = ocr_jobs.ocr_status.PROCESSING
        job.save()

        # Get document images
        images = DocumentImages.objects.filter(document=doc)
        if not images.exists():
            raise Exception("No images found for document")

        # Process each image through AI Pipeline
        pipeline_url = "http://localhost:8003/api/v1/process"
        
        all_detections = []
        
        # Base directory for media files
        base_dir = os.path.join(os.getcwd(), "media")
        
        for img in images:
            # Build full path: media/ + relative_path
            relative_path = img.image_path
            image_path = os.path.join(base_dir, relative_path)
            
            if not os.path.exists(image_path):
                print(f"⚠️ Image not found: {image_path}")
                print(f"⚠️ Relative path from DB: {relative_path}")
                print(f"⚠️ Base dir: {base_dir}")
                print(f"⚠️ Current working dir: {os.getcwd()}")
                continue
                
            print(f"📤 Processing image: {image_path}")
            
            # Call AI Pipeline for each image
            with open(image_path, 'rb') as f:
                files = {'file': (os.path.basename(image_path), f, 'image/jpeg')}
                data = {'conf_threshold': 0.5, 'iou_threshold': 0.45}
                
                with httpx.Client(timeout=60.0) as client:
                    response = client.post(pipeline_url, files=files, data=data)
                    response.raise_for_status()
                    result = response.json()
                    
                    print(f"✅ AI Pipeline response: {result}")
                    
                    # Collect detections
                    if result.get('detections_with_text'):
                        all_detections.extend(result['detections_with_text'])

        # Save all OCR results to database
        if all_detections:
            for detection in all_detections:
                field_name = detection.get('class_name', 'unknown')
                raw_text = detection.get('text', '')
                confidence = detection.get('confidence', 0.0)
                bbox = detection.get('bbox')

                ocr_results.objects.create(
                    ocr_job=job,
                    field_name=field_name,
                    raw_text=raw_text,
                    confidence_score=confidence,
                    bounding_box=bbox
                )
        else:
            print("⚠️ No detections found from AI Pipeline")

        # Mark job as done
        job.status = ocr_jobs.ocr_status.DONE
        job.finished_at = timezone.now()
        job.save()

    except Exception as e:
        # Mark job as failed
        job.status = ocr_jobs.ocr_status.FAILED
        job.finished_at = timezone.now()
        job.save()
        print(f"❌ OCR processing error: {e}")
        import traceback
        traceback.print_exc()

    return job