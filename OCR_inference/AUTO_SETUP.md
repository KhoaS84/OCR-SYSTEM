# OCR Service Auto-Setup Feature

## Summary

The OCR_inference service now includes **automatic setup** that handles repository cloning and model downloading on first startup.

## How It Works

### On Service Startup

When you run `uvicorn app.main:app --port 8001`, the service:

1. **Checks environment** - Verifies if OCR_CNN_Vietnamese repo and model exist
2. **Auto-setup** (if enabled and missing):
   - Clones the OCR_CNN_Vietnamese repository from GitHub
   - Installs repository requirements
   - Downloads the OCR model from Google Drive
   - Verifies setup completion
3. **Starts normally** - If everything is ready, the API starts serving requests

### Configuration

**Enable/Disable Auto-Setup:**

In `.env` file:
```env
AUTO_SETUP=true   # Enabled (default)
AUTO_SETUP=false  # Disabled - requires manual setup
```

## Usage Options

### Option 1: Fully Automatic (Recommended)

```bash
cd OCR_inference
pip install -r requirements.txt
uvicorn app.main:app --port 8001
```

First run will take 5-10 minutes to download everything. Subsequent runs start immediately.

### Option 2: Pre-Setup Script

```bash
cd OCR_inference
pip install -r requirements.txt
python setup.py  # Run setup before starting service
uvicorn app.main:app --port 8001
```

### Option 3: Manual Setup

Disable auto-setup and do it manually:

```bash
cd OCR_inference

# Set AUTO_SETUP=false in .env

# Manual steps
git clone https://github.com/BoPDA1607/OCR_CNN_Vietnamese.git
cd OCR_CNN_Vietnamese
pip install -r requirements.txt
cd ..

pip install gdown
gdown https://drive.google.com/uc?id=1iZv3Iv3oFdvMbJl71TreW1OfYUTyUcJG
mv best_ocr_model.pth OCR_CNN_Vietnamese/

# Start service
uvicorn app.main:app --port 8001
```

## What Gets Automatically Set Up

1. **OCR_CNN_Vietnamese Repository**
   - Cloned from: https://github.com/BoPDA1607/OCR_CNN_Vietnamese.git
   - Location: `OCR_inference/OCR_CNN_Vietnamese/`
   - Includes: Model architecture, dataset utilities, Vietnamese dictionary

2. **OCR Model File**
   - Downloaded from: Google Drive (1.iZv3Iv3oFdvMbJl71TreW1OfYUTyUcJG)
   - Location: `OCR_inference/OCR_CNN_Vietnamese/best_ocr_model.pth`
   - Size: ~100MB
   - Type: ResNet + Transformer weights

3. **Dependencies**
   - Repository requirements automatically installed
   - Includes: torch, torchvision, timm, etc.

## Startup Logs

**With Auto-Setup Enabled (first run):**
```
INFO - Starting OCR API Service v1.0.0
INFO - Device: cuda
INFO - Checking OCR environment...
WARNING - OCR environment not ready. Starting automatic setup...
INFO - Repository exists: False
INFO - Model exists: False
INFO - Auto-setup is enabled. Setting up OCR environment...
INFO - OCR repository not found. Cloning from GitHub...
INFO - ✓ OCR repository cloned successfully
INFO - Installing OCR repository requirements...
INFO - ✓ Requirements installed
INFO - OCR model not found. Downloading from Google Drive...
INFO - ✓ OCR model downloaded successfully
INFO - ✓ OCR environment setup completed successfully
```

**With Everything Already Set Up:**
```
INFO - Starting OCR API Service v1.0.0
INFO - Device: cuda
INFO - Checking OCR environment...
INFO - ✓ OCR environment is ready
```

## Requirements

For automatic setup to work, you need:

- **Git** - For cloning the repository
- **Internet connection** - To download from GitHub and Google Drive
- **Disk space** - ~500MB for repository + model
- **Time** - First setup takes 5-10 minutes

## Troubleshooting

### Auto-Setup Fails

If automatic setup fails:

1. **Check logs** - Look for error messages in startup logs
2. **Check Git** - Ensure Git is installed: `git --version`
3. **Check internet** - Verify you can access GitHub and Google Drive
4. **Manual setup** - Use `python setup.py` or manual steps
5. **Disable auto-setup** - Set `AUTO_SETUP=false` and set up manually

### Git Not Found

```
ERROR - Git not found. Please install Git to enable auto-setup
```

**Solution:** Install Git or use manual setup

### Download Timeout

If download is slow or times out:
- Increase timeout in `app/core/setup.py`
- Download model manually using `gdown`
- Check network connection

## Files Added

New files for auto-setup functionality:

```
OCR_inference/
├── app/
│   └── core/
│       └── setup.py          # Auto-setup utilities (NEW)
├── setup.py                  # Manual setup script (NEW)
└── .env.example             # Updated with AUTO_SETUP option
```

Modified files:
- `app/main.py` - Added startup check and auto-setup trigger
- `app/core/config.py` - Added AUTO_SETUP setting
- `app/core/__init__.py` - Export setup functions
- `README.md` - Updated installation instructions

## Benefits

✅ **Zero-config first run** - Just `pip install` and `uvicorn`
✅ **Idempotent** - Safe to run multiple times, won't re-download
✅ **Configurable** - Can disable if needed
✅ **Transparent** - Detailed logs show what's happening
✅ **Fallback** - Manual setup still available

## Answer to Your Question

**Q: When started OCR_inference, does it automatically do the cloning to gain the needed class and download the model?**

**A: NOW YES! 🎉**

With the new auto-setup feature (enabled by default):
- ✅ Automatically clones OCR_CNN_Vietnamese repository
- ✅ Automatically downloads the OCR model
- ✅ Automatically installs dependencies
- ✅ Only runs on first startup (checks if already exists)
- ✅ Can be disabled with `AUTO_SETUP=false` in .env

Just run:
```bash
pip install -r requirements.txt
uvicorn app.main:app --port 8001
```

And it handles the rest!
