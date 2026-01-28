"""
Manual setup script for OCR service
Run this to set up the OCR environment before starting the service
"""

import sys
from pathlib import Path

# Add app to path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.setup import setup_ocr_environment, check_ocr_requirements
from app.core.logging import setup_logging

logger = setup_logging()


def main():
    """Run OCR environment setup"""
    print("\n" + "="*60)
    print("OCR Service Setup")
    print("="*60)
    
    # Check current status
    print("\n[1/3] Checking current environment...")
    status = check_ocr_requirements()
    
    print(f"\nRepository: {status['repository_path']}")
    print(f"  Status: {'✓ Exists' if status['repository_exists'] else '✗ Not found'}")
    
    print(f"\nModel: {status['model_path']}")
    print(f"  Status: {'✓ Exists' if status['model_exists'] else '✗ Not found'}")
    
    print(f"\nGit: {'✓ Available' if status['git_available'] else '✗ Not available'}")
    
    if status['ready']:
        print("\n✓ OCR environment is already set up!")
        print("  You can start the service with:")
        print("  uvicorn app.main:app --port 8001")
        return
    
    # Perform setup
    print("\n[2/3] Setting up OCR environment...")
    print("This may take several minutes...")
    
    success = setup_ocr_environment()
    
    if success:
        print("\n[3/3] Verifying setup...")
        status = check_ocr_requirements()
        
        if status['ready']:
            print("\n" + "="*60)
            print("✓ Setup completed successfully!")
            print("="*60)
            print("\nYou can now start the OCR service:")
            print("  uvicorn app.main:app --port 8001")
            print("\nOr with auto-reload for development:")
            print("  uvicorn app.main:app --reload --port 8001")
        else:
            print("\n✗ Setup verification failed")
            print("Please check the logs above for errors")
    else:
        print("\n✗ Setup failed")
        print("\nManual setup instructions:")
        print("1. Clone the repository:")
        print("   git clone https://github.com/BoPDA1607/OCR_CNN_Vietnamese.git")
        print("\n2. Install repository requirements:")
        print("   cd OCR_CNN_Vietnamese")
        print("   pip install -r requirements.txt")
        print("   cd ..")
        print("\n3. Download the model:")
        print("   pip install gdown")
        print("   gdown https://drive.google.com/uc?id=1iZv3Iv3oFdvMbJl71TreW1OfYUTyUcJG")
        print("\n4. Move the model:")
        print("   mv best_ocr_model.pth OCR_CNN_Vietnamese/")


if __name__ == "__main__":
    main()
