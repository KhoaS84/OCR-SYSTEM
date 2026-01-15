import logging
from ultralytics import YOLO
from app.core.config import settings

logger = logging.getLogger(__name__)

class YOLODetector:
    def __init__(self):
        logger.info("Loading YOLO model...")
        self.model = YOLO("weights/Model_YOLO11s_card.pt")
        self.model.to(settings.DEVICE)
        logger.info(f"YOLO loaded on device: {settings.DEVICE}")
        # Lấy class names từ model
        self.class_names = self.model.names
        logger.info(f"Model has {len(self.class_names)} classes")

    def predict(self, image):
        results = self.model(image)
        return results
    
    def get_class_name(self, class_id: int) -> str:
        """Lấy tên class từ class_id"""
        return self.class_names.get(int(class_id), f"class_{class_id}")
