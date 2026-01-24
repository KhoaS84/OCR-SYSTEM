import os
import django
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Khởi tạo cấu hình cho Django ORM trước khi import các router
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "orm.settings")
django.setup()

from api.routers import auth, documents, ocr, citizens, users
from api.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/my_custom_path.json"
)

# Cấu hình CORS (cho phép frontend gọi API)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ...existing code...
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Auth"])
app.include_router(documents.router, prefix=f"{settings.API_V1_STR}/documents", tags=["Documents"])
app.include_router(ocr.router, prefix=f"{settings.API_V1_STR}/ocr", tags=["OCR"])
app.include_router(citizens.router, prefix=f"{settings.API_V1_STR}/citizens", tags=["Citizens"])
app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["Users"])

@app.get("/")
def root():
    return {"message": "OCR System API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)