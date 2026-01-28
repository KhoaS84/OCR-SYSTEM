import uuid
from django.db import models
from django.utils import timezone

class User(models.Model):
    class Roles(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        USER = 'user', 'User'
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        unique=True
    )
    username = models.CharField(
        max_length=255
    )
    password = models.CharField(
        max_length=255
    )
    email = models.EmailField(
        max_length=255,
        unique=True
    )
    role = models.CharField(
        max_length=10,
        choices=Roles.choices,
        default=Roles.USER
    )
    created_at = models.DateTimeField(
        default=timezone.now,
        # auto_now_add=True
    )

    def __str__(self):

        return self.username

    class Meta:
        app_label = 'orm'
        db_table = 'ocr_core_user'
