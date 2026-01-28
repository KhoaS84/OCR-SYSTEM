import os
import django
from django.conf import settings
from asgiref.sync import sync_to_async

# Setup Django (Chỉ cần thiết nếu chạy script rời, nhưng an toàn khi để đây để đảm bảo context)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "orm.settings")
django.setup()

from orm.models.user import User
from api.schemas.user import UserCreate
from api.core.security import get_password_hash, verify_password

@sync_to_async
def get_user_by_email(email: str):
    try:
        return User.objects.get(email=email)
    except User.DoesNotExist:
        return None

@sync_to_async
def create_user(user_in: UserCreate):
    # Check if user exists within sync context
    try:
        existing = User.objects.get(email=user_in.email)
        if existing:
            return None
    except User.DoesNotExist:
        pass

    user = User(
        email=user_in.email,
        username=user_in.email,  # dùng email làm username
        password=get_password_hash(user_in.password)
    )
    user.save()
    return user

@sync_to_async
def authenticate(email: str, password: str):
    try:
        user = User.objects.get(email=email)
        if not verify_password(password, user.password):
            return None
        return user
    except User.DoesNotExist:
        return None