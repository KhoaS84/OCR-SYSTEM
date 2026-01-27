import os
import shutil
from fastapi import UploadFile
from datetime import datetime

MEDIA_ROOT = "media"  # Thư mục gốc lưu file

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png"}

def _sanitize_filename(filename: str) -> str:
    # bỏ path, giữ lại tên file an toàn
    return os.path.basename(filename).replace("..", "").replace("/", "").replace("\\", "")

def save_upload_file(upload_file: UploadFile, sub_folder: str) -> str:
    """
    Lưu file upload vào thư mục media/{sub_folder}/{date}/filename
    Trả về đường dẫn tương đối để lưu vào DB.
    """
    try:
        # chống path traversal
        if ".." in sub_folder or sub_folder.startswith(("/", "\\")):
            return None

        # validate content type + extension
        filename = _sanitize_filename(upload_file.filename)
        ext = os.path.splitext(filename)[1].lower()
        if upload_file.content_type not in ALLOWED_CONTENT_TYPES:
            return None
        if ext not in ALLOWED_EXTENSIONS:
            return None

        date_str = datetime.now().strftime("%Y-%m-%d")
        directory = os.path.join(MEDIA_ROOT, sub_folder, date_str)

        if not os.path.exists(directory):
            os.makedirs(directory)

        timestamp = int(datetime.now().timestamp())
        safe_name = f"{timestamp}_{filename}"
        file_path = os.path.join(directory, safe_name)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)

        return os.path.join(sub_folder, date_str, safe_name).replace("\\", "/")

    except Exception as e:
        print(f"Error saving file: {e}")
        return None