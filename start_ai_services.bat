@echo off
echo ========================================
echo Starting AI Services
echo ========================================

REM Start YOLO Service (Port 8001)
echo Starting YOLO Service on port 8001...
start "YOLO Service" cmd /k "cd ai\YOLO_inference && ..\..\\.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8001"

REM Wait a bit
timeout /t 3 /nobreak >nul

REM Start OCR V2 Service (Port 8002)
echo Starting OCR V2 Service on port 8002...
start "OCR Service" cmd /k "cd ai\OCR_V2_inference && ..\..\\.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8002"

REM Wait a bit
timeout /t 3 /nobreak >nul

REM Start Pipeline V2 Service (Port 8003)
echo Starting Pipeline V2 Service on port 8003...
start "Pipeline Service" cmd /k "cd ai\pipeline_v2 && ..\..\\.venv\Scripts\python.exe app.py"

echo.
echo ========================================
echo All AI Services Starting...
echo YOLO: http://localhost:8001/docs
echo OCR: http://localhost:8002/docs
echo Pipeline: http://localhost:8003/docs
echo ========================================
echo.
echo Press any key to return...
pause >nul
