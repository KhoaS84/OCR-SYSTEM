import uuid
from django.db import models
from django.utils import timezone
from orm.models.user import User

class Citizens(models.Model):
    class GenderChoices(models.TextChoices):
        MALE = 'Nam', 'Nam'
        FEMALE = 'Nữ', 'Nữ'
        OTHER = 'Khác', 'Khác'
        
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        unique=True,
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )
    name = models.CharField(
        max_length=25,
        verbose_name="Họ và tên",
    )
    date_of_birth = models.DateField(
        verbose_name="Ngày sinh (DD/MM/YYYY)"
    )
    gender = models.CharField(
        max_length=10,
        choices=GenderChoices.choices,
        verbose_name="Giới tính"
    )

    nationality = models.CharField(
        max_length=50,
        verbose_name="Quốc tịch"
    )
    created_at = models.DateTimeField(
        default=timezone.now,
        auto_now_add=True,
    )
    
    def __str__(self):
        return self.name


