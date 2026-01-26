from django.db import models
from django.utils import timezone
from orm.models.user import User

class Citizens(models.Model):
    class GenderChoices(models.TextChoices):
        MALE = 'MALE', 'Male'
        FEMALE = 'FEMALE', 'Female'
        
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        verbose_name="Người dùng"
    )
    name = models.CharField(max_length=255, verbose_name="Họ và tên")
    date_of_birth = models.DateField(verbose_name="Ngày sinh", null=True, blank=True)
    gender = models.CharField(
        max_length=10,
        choices=GenderChoices.choices,
        verbose_name="Giới tính",
        null=True,
        blank=True
    )
    nationality = models.CharField(max_length=255, verbose_name="Quốc tịch", null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now, auto_now_add=True)
    
    class Meta:
        app_label = 'orm'
        db_table = 'orm_citizens'
    
    def __str__(self):
        return self.name

