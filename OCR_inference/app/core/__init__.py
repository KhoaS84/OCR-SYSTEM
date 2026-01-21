"""
Core package initialization
"""

from .config import settings
from .logging import setup_logging
from .setup import setup_ocr_environment, check_ocr_requirements

__all__ = ["settings", "setup_logging", "setup_ocr_environment", "check_ocr_requirements"]
