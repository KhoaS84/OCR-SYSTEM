import os
import django
from django.conf import settings

# Setup Django (Chỉ cần thiết nếu chạy script rời, nhưng an toàn khi để đây để đảm bảo context)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "orm.settings")
django.setup()

from orm.models.user import User
from api.schemas.user import UserCreate
from api.core.security import get_password_hash, verify_password

def get_user_by_email(email: str):
    try:
        return User.objects.get(email=email)
    except User.DoesNotExist:
        return None

def create_user(user_in: UserCreate):
    if get_user_by_email(user_in.email):
        return None

    user = User(
        email=user_in.email,
        username=user_in.email,  # dùng email làm username
        password=get_password_hash(user_in.password)
    )
    user.save()
    return user

def authenticate(email: str, password: str):
    user = get_user_by_email(email)
    if not user:
        return None
    if not verify_password(password, user.password):
        return None
    return user