from models.user import User
from django.utils import timezone
from django.db import connection
from pprint import pprint

def create_user(username, password, email):
    user = User(
        username=username,
        password=password,
        email=email,
    )
    user.save()
    print(connection.queries)
    return user

def get_user_by_username(username):
    try:
        user = User.objects.get(username=username)
        print(connection.queries)
        return user
    except User.DoesNotExist:
        return None

def update_user_password(user_id, new_password):
    try:
        user = User.objects.get(id=user_id)
        user.password = new_password
        user.save()
        print(connection.queries)
        return user
    except User.DoesNotExist:
        return None

def update_user_email(user_id, new_email):
    try:
        user = User.objects.get(id=user_id)
        user.email = new_email
        user.save()
        print(connection.queries)
        return user
    except User.DoesNotExist:
        return None
    
def delete_user(user_id):
    try:
        user = User.objects.get(id=user_id)
        user.delete()
        print(connection.queries)
        return True
    except User.DoesNotExist:
        return False