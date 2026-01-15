from pydantic import BaseModel
from typing import List

class Detection(BaseModel):
    class_id: int
    class_name: str
    bbox: List[float]  # [x_min, y_min, x_max, y_max]
    confidence: float

class DetectResponse(BaseModel):
    num_detections: int
    detections: List[Detection]
