"""
Image processing utilities for OCR
"""

from PIL import Image
from torchvision import transforms
import io
from typing import Union
from pathlib import Path


def preprocess_ocr_image(pil_img: Image.Image, height: int = 32, width: int = 128):
    """
    Preprocess PIL image for OCR model input
    
    Args:
        pil_img: PIL Image object
        height: Target height for resizing
        width: Target width for resizing
    
    Returns:
        Preprocessed tensor ready for model input
    """
    transform = transforms.Compose([
        transforms.Resize((height, width)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    return transform(pil_img).unsqueeze(0)


def load_image(image_source: Union[str, Path, bytes]) -> Image.Image:
    """
    Load image from various sources
    
    Args:
        image_source: Can be file path (str/Path) or bytes
    
    Returns:
        PIL Image object in RGB mode
    """
    if isinstance(image_source, (str, Path)):
        img = Image.open(image_source)
    elif isinstance(image_source, bytes):
        img = Image.open(io.BytesIO(image_source))
    else:
        raise ValueError(f"Unsupported image source type: {type(image_source)}")
    
    return img.convert("RGB")


def validate_image_size(file_size: int, max_size: int) -> bool:
    """
    Validate image file size
    
    Args:
        file_size: Size of the file in bytes
        max_size: Maximum allowed size in bytes
    
    Returns:
        True if valid, False otherwise
    """
    return file_size <= max_size
