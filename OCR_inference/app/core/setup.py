"""
Setup utilities for OCR service
Handles automatic repository cloning and model downloading
"""

import subprocess
import os
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


def clone_ocr_repository(target_dir: Path) -> bool:
    """
    Clone the OCR_CNN_Vietnamese repository if it doesn't exist
    
    Args:
        target_dir: Directory where to clone the repository
    
    Returns:
        True if successful or already exists, False otherwise
    """
    repo_path = target_dir / "OCR_CNN_Vietnamese"
    
    if repo_path.exists():
        logger.info(f"OCR repository already exists at {repo_path}")
        return True
    
    logger.info("OCR repository not found. Cloning from GitHub...")
    
    try:
        # Clone the repository
        result = subprocess.run(
            ["git", "clone", "https://github.com/BoPDA1607/OCR_CNN_Vietnamese.git"],
            cwd=target_dir,
            capture_output=True,
            text=True,
            timeout=300  # 5 minutes timeout
        )
        
        if result.returncode == 0:
            logger.info("✓ OCR repository cloned successfully")
            
            # Install requirements from the cloned repo
            requirements_file = repo_path / "requirements.txt"
            if requirements_file.exists():
                logger.info("Installing OCR repository requirements...")
                subprocess.run(
                    ["pip", "install", "-r", str(requirements_file)],
                    capture_output=True,
                    text=True,
                    timeout=600  # 10 minutes timeout
                )
                logger.info("✓ Requirements installed")
            
            return True
        else:
            logger.error(f"Failed to clone repository: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        logger.error("Repository cloning timed out")
        return False
    except FileNotFoundError:
        logger.error("Git not found. Please install Git to enable auto-setup")
        return False
    except Exception as e:
        logger.error(f"Error cloning repository: {e}")
        return False


def download_ocr_model(model_path: Path, model_url: str = None) -> bool:
    """
    Download the OCR model if it doesn't exist
    
    Args:
        model_path: Path where to save the model
        model_url: Google Drive URL for the model
    
    Returns:
        True if successful or already exists, False otherwise
    """
    if model_path.exists():
        logger.info(f"OCR model already exists at {model_path}")
        return True
    
    if model_url is None:
        model_url = "https://drive.google.com/uc?id=1iZv3Iv3oFdvMbJl71TreW1OfYUTyUcJG"
    
    logger.info("OCR model not found. Downloading from Google Drive...")
    
    try:
        # Ensure gdown is installed
        try:
            import gdown
        except ImportError:
            logger.info("Installing gdown for model download...")
            subprocess.run(
                ["pip", "install", "gdown"],
                capture_output=True,
                text=True,
                timeout=120
            )
            import gdown
        
        # Create parent directory if needed
        model_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Download the model
        gdown.download(model_url, str(model_path), quiet=False)
        
        if model_path.exists():
            logger.info(f"✓ OCR model downloaded successfully to {model_path}")
            return True
        else:
            logger.error("Model download completed but file not found")
            return False
            
    except Exception as e:
        logger.error(f"Error downloading model: {e}")
        return False


def setup_ocr_environment(base_dir: Path = None, model_path: Path = None) -> bool:
    """
    Complete OCR environment setup
    
    Args:
        base_dir: Base directory for OCR_inference (default: auto-detect)
        model_path: Path for the model file (default: OCR_CNN_Vietnamese/best_ocr_model.pth)
    
    Returns:
        True if setup successful, False otherwise
    """
    if base_dir is None:
        # Auto-detect base directory (OCR_inference folder)
        base_dir = Path(__file__).parent.parent.parent
    
    logger.info(f"Setting up OCR environment in {base_dir}")
    
    # Step 1: Clone repository
    if not clone_ocr_repository(base_dir):
        logger.error("Failed to clone OCR repository")
        return False
    
    # Step 2: Download model
    if model_path is None:
        model_path = base_dir / "OCR_CNN_Vietnamese" / "best_ocr_model.pth"
    
    if not download_ocr_model(model_path):
        logger.error("Failed to download OCR model")
        return False
    
    logger.info("✓ OCR environment setup completed successfully")
    return True


def check_ocr_requirements(base_dir: Path = None) -> dict:
    """
    Check if all OCR requirements are met
    
    Args:
        base_dir: Base directory for OCR_inference
    
    Returns:
        Dictionary with status of each requirement
    """
    if base_dir is None:
        base_dir = Path(__file__).parent.parent.parent
    
    repo_path = base_dir / "OCR_CNN_Vietnamese"
    model_path = base_dir / "OCR_CNN_Vietnamese" / "best_ocr_model.pth"
    
    status = {
        "repository_exists": repo_path.exists(),
        "repository_path": str(repo_path),
        "model_exists": model_path.exists(),
        "model_path": str(model_path),
        "git_available": False,
        "ready": False
    }
    
    # Check if git is available
    try:
        subprocess.run(["git", "--version"], capture_output=True, timeout=5)
        status["git_available"] = True
    except:
        pass
    
    # Overall readiness
    status["ready"] = status["repository_exists"] and status["model_exists"]
    
    return status
