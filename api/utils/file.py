import os
import shutil
from fastapi import UploadFile
from datetime import datetime

MEDIA_ROOT = "media" # Thư mục gốc lưu file

def save_upload_file(upload_file: UploadFile, sub_folder: str) -> str:
    """
    Lưu file upload vào thư mục media/{sub_folder}/{date}/filename
    Trả về đường dẫn tương đối để lưu vào DB.
    """
    try:
        # Tạo cấu trúc thư mục theo ngày để tránh quá tải folder
        date_str = datetime.now().strftime("%Y-%m-%d")
        directory = os.path.join(MEDIA_ROOT, sub_folder, date_str)
        
        if not os.path.exists(directory):
            os.makedirs(directory)
            
        # Tạo tên file unique (có thể dùng uuid nếu cần, ở đây giữ nguyên tên gốc cho đơn giản)
        # Tốt nhất nên rename file để tránh trùng hoặc lỗi ký tự đặc biệt
        timestamp = int(datetime.now().timestamp())
        filename = f"{timestamp}_{upload_file.filename}"
        file_path = os.path.join(directory, filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
            
        # Trả về đường dẫn tương đối (để frontend có thể truy cập qua static mount)
        # Ví dụ: documents/cccd/2023-10-27/12345_image.jpg
        return os.path.join(sub_folder, date_str, filename).replace("\\", "/")
        
    except Exception as e:
        print(f"Error saving file: {e}")
        return None