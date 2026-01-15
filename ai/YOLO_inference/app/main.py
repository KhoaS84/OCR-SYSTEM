import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.detect import router
from app.core.config import settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s"
)

app = FastAPI(title=settings.PROJECT_NAME)

# CORS middleware - Cho phép gọi API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Trong production, nên thay bằng domain cụ thể
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    router,
    prefix=settings.API_V1_STR,
    tags=["Detection"]
)

@app.get("/")
def health_check():
    return {"status": "ok"}
