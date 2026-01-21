"""
OCR Model Service
Handles model loading and inference
"""

import torch
from pathlib import Path
from typing import List, Tuple
import sys
import os

# Add the OCR_CNN_Vietnamese directory to the path
ocr_module_path = Path(__file__).parent.parent.parent / "OCR_CNN_Vietnamese"
if ocr_module_path.exists():
    sys.path.insert(0, str(ocr_module_path))

from model_cnn_transformer import OCRModel
from dataset_polygon import char2idx, idx2char

from app.core.config import settings
from app.utils.image import preprocess_ocr_image, load_image


class OCRService:
    """OCR Model Service"""
    
    def __init__(self):
        self.model = None
        self.device = settings.DEVICE
        self.vocab_size = len(char2idx)
        self.char2idx = char2idx
        self.idx2char = idx2char
        self.model_loaded = False
        
    def load_model(self, model_path: str = None):
        """
        Load the OCR model
        
        Args:
            model_path: Path to the model weights file
        """
        if model_path is None:
            model_path = settings.OCR_MODEL_PATH
        
        if not Path(model_path).exists():
            raise FileNotFoundError(f"Model file not found: {model_path}")
        
        self.model = OCRModel(vocab_size=self.vocab_size).to(self.device)
        self.model.load_state_dict(
            torch.load(model_path, map_location=self.device)
        )
        self.model.eval()
        self.model_loaded = True
        print(f"OCR model loaded successfully from {model_path}")
    
    def decode_sequence(self, indices: List[int]) -> str:
        """
        Decode sequence of indices to text
        
        Args:
            indices: List of character indices
        
        Returns:
            Decoded text string
        """
        chars = []
        SOS_TOKEN = next((token for token in self.char2idx.keys() if "SOS" in token), None)
        
        for idx in indices:
            ch = self.idx2char.get(idx, "")
            if ch == "<EOS>":
                break
            if ch not in ("<PAD>", SOS_TOKEN):
                chars.append(ch)
        
        return "".join(chars)
    
    def recognize_text(self, image_crop) -> str:
        """
        Recognize text from a cropped image
        
        Args:
            image_crop: PIL Image of the cropped region
        
        Returns:
            Recognized text string
        """
        if not self.model_loaded:
            raise RuntimeError("Model not loaded. Call load_model() first.")
        
        # Preprocess image
        image_tensor = preprocess_ocr_image(
            image_crop, 
            height=settings.IMAGE_HEIGHT,
            width=settings.IMAGE_WIDTH
        ).to(self.device)
        
        # Run inference
        with torch.no_grad():
            memory = self.model.encoder(image_tensor)
            SOS_TOKEN = next((token for token in self.char2idx.keys() if "SOS" in token), None)
            MAX_LEN = settings.MAX_SEQUENCE_LENGTH
            ys = torch.tensor([[self.char2idx[SOS_TOKEN]]], device=self.device)
            
            for _ in range(MAX_LEN):
                out = self.model.decoder(
                    ys,
                    memory,
                    tgt_mask=self.model.generate_square_subsequent_mask(ys.size(1)).to(self.device),
                )
                prob = out[:, -1, :]
                _, next_word = torch.max(prob, dim=1)
                ys = torch.cat([ys, next_word.unsqueeze(1)], dim=1)
                if next_word.item() == self.char2idx["<EOS>"]:
                    break
            
            pred_text = self.decode_sequence(ys.squeeze(0).tolist())
        
        return pred_text
    
    def process_image(
        self, 
        image_path: str, 
        bboxes: List[List[int]], 
        confidences: List[float],
        conf_threshold: float = 0.5
    ) -> List[Tuple[Tuple[int, int, int, int], str, float]]:
        """
        Process image with bounding boxes and return OCR results
        
        Args:
            image_path: Path to the input image
            bboxes: List of bounding boxes [[x1, y1, x2, y2], ...]
            confidences: List of confidence scores
            conf_threshold: Minimum confidence threshold
        
        Returns:
            List of tuples: [((x1, y1, x2, y2), text, confidence), ...]
        """
        # Filter bboxes by confidence threshold
        filtered_data = [
            (bbox, conf) 
            for bbox, conf in zip(bboxes, confidences) 
            if conf > conf_threshold
        ]
        
        if not filtered_data:
            return []
        
        # Load image
        img_pil = load_image(image_path)
        
        # Process each bounding box
        results = []
        for bbox, conf in filtered_data:
            x1, y1, x2, y2 = map(int, bbox)
            
            # Crop the region
            crop = img_pil.crop((x1, y1, x2, y2))
            
            # Recognize text
            pred_text = self.recognize_text(crop)
            
            # Append result
            results.append(((x1, y1, x2, y2), pred_text, conf))
        
        return results


# Global OCR service instance
ocr_service = OCRService()


def get_ocr_service() -> OCRService:
    """
    Get the global OCR service instance
    
    Returns:
        OCRService instance
    """
    if not ocr_service.model_loaded:
        ocr_service.load_model()
    return ocr_service
