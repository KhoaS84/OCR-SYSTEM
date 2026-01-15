import logging
from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image
import io

from app.models.yolo_detector import YOLODetector
from app.schemas.detect import DetectResponse, Detection
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()
detector = YOLODetector()  # load model 1 lần duy nhất

@router.post("/detect", response_model=DetectResponse)
async def detect(file: UploadFile = File(...)):
    """
    Nhận diện đối tượng trong ảnh sử dụng YOLO model.
    
    - **file**: File ảnh cần nhận diện (jpg, png, etc.)
    - **Returns**: Danh sách các đối tượng được phát hiện với confidence >= threshold
    """
    try:
        # Log request
        logger.info(f"Received detection request: filename={file.filename}, content_type={file.content_type}")
        
        # Validate file type
        if file.content_type and file.content_type not in settings.ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid file type. Allowed types: {', '.join(settings.ALLOWED_IMAGE_TYPES)}"
            )
        
        # Đọc và validate ảnh
        image_bytes = await file.read()
        if not image_bytes:
            raise HTTPException(status_code=400, detail="Empty file received")
        
        # Validate file size
        file_size = len(image_bytes)
        if file_size > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400, 
                detail=f"File too large. Maximum size: {settings.MAX_FILE_SIZE / (1024*1024):.1f}MB"
            )
        
        try:
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        except Exception as e:
            logger.error(f"Invalid image file: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")
        
        # Inference
        logger.info(f"Processing image: size={image.size}")
        results = detector.predict(image)
        
        # Xử lý kết quả với confidence threshold
        detections = []
        for box in results[0].boxes:
            confidence = float(box.conf)
            
            # Lọc theo confidence threshold
            if confidence >= settings.CONFIDENCE_THRESHOLD:
                class_id = int(box.cls)
                class_name = detector.get_class_name(class_id)
                
                detections.append(Detection(
                    class_id=class_id,
                    class_name=class_name,
                    confidence=confidence,
                    bbox=box.xyxy[0].tolist()  # [x_min, y_min, x_max, y_max]
                ))
        
        logger.info(f"Detection completed: {len(detections)} objects found (threshold={settings.CONFIDENCE_THRESHOLD})")
        
        return DetectResponse(
            num_detections=len(detections),
            detections=detections
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during detection: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
