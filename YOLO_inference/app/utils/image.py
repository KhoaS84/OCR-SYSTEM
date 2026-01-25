import cv2
import numpy as np

def read_image(file_bytes: bytes) -> np.ndarray:
    img_np = np.frombuffer(file_bytes, np.uint8)
    image = cv2.imdecode(img_np, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Invalid image file")
    return image
