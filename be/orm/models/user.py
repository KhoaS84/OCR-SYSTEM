from django.db import models
from django.utils import timezone

class User(models.Model):
    class RoleChoices(models.TextChoices):
        USER = 'USER', 'User'
        ADMIN = 'ADMIN', 'Admin'
    
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=255)
    password = models.CharField(max_length=255)
    email = models.EmailField(max_length=255, unique=True)
    role = models.CharField(
        max_length=10,
        choices=RoleChoices.choices,
        default=RoleChoices.USER,
        verbose_name="Vai trò"
    )
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        app_label = 'orm'
        db_table = 'orm_user'

    def __str__(self):
        return self.username