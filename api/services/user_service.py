import os
import django
from django.conf import settings

# Setup Django (Chỉ cần thiết nếu chạy script rời, nhưng an toàn khi để đây để đảm bảo context)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "orm.settings")
django.setup()

from orm.models.user import User  # Import Model từ ORM
from api.schemas.user import UserCreate
from api.core.security import get_password_hash, verify_password

def get_user_by_email(email: str):
    try:
        return User.objects.get(email=email)
    except User.DoesNotExist:
        return None

def create_user(user_in: UserCreate):
    # Kiểm tra tồn tại
    if get_user_by_email(user_in.email):
        return None

    # Tạo user mới dùng Django ORM
    user = User(
        email=user_in.email,
        username=user_in.email, # Dùng email làm username
        full_name=user_in.full_name,
        phone=user_in.phone,
        is_active=True,
        role='user' # Mặc định là user thường
    )
    user.set_password(user_in.password) # Hàm set_password của Django tự hash
    user.save()
    return user

def authenticate(email: str, password: str):
    user = get_user_by_email(email)
    if not user:
        return None
    # Django User model có method check_password
    if not user.check_password(password):
        return None
    return user