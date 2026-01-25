"""
Image processing utilities
"""

from PIL import Image
import numpy as np
from typing import List, Tuple
import io


def load_image_from_bytes(image_bytes: bytes) -> Image.Image:
    """
    Load image from bytes
    
    Args:
        image_bytes: Image data in bytes
        
    Returns:
        PIL Image
    """
    return Image.open(io.BytesIO(image_bytes))


def crop_image(image: Image.Image, bbox: List[float]) -> Image.Image:
    """
    Crop image using bounding box
    
    Args:
        image: PIL Image
        bbox: Bounding box [x1, y1, x2, y2]
        
    Returns:
        Cropped PIL Image
    """
    x1, y1, x2, y2 = bbox
    return image.crop((int(x1), int(y1), int(x2), int(y2)))


def crop_images_batch(image: Image.Image, bboxes: List[List[float]]) -> List[Image.Image]:
    """
    Crop multiple regions from an image
    
    Args:
        image: PIL Image
        bboxes: List of bounding boxes [x1, y1, x2, y2]
        
    Returns:
        List of cropped PIL Images
    """
    cropped_images = []
    for bbox in bboxes:
        cropped = crop_image(image, bbox)
        cropped_images.append(cropped)
    
    return cropped_images
