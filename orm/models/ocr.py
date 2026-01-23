from django.db import models
from django.utils import timezone
from models.documents import Documents

class ocr_jobs (models.Model):

    class ocr_status(models.TextChoices):
        QUEUED = 'queued', 'Đang chờ'
        PROCESSING = 'processing', 'Đang xử lý'
        DONE = 'done', 'Hoàn thành'
        FAILED = 'failed', 'Thất bại'

    id = models.AutoField(
        primary_key=True
    )
    document = models.ForeignKey(
        Documents,
        on_delete=models.CASCADE
    )

    status = models.CharField(
        max_length=50,
        choices=ocr_status.choices,
        verbose_name="Trạng thái OCR"
    )

    model_name = models.CharField(
        max_length=100,
    )
    model_version = models.CharField(
        max_length=50,
    )

    created_at = models.DateTimeField(
        default=timezone.now,
        auto_now_add=True,
    )
    finished_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    def __str__(self):
        return self.id
    
class ocr_results(models.Model):

    id = models.AutoField(
        primary_key=True
    )
    ocr_job = models.ForeignKey(
        ocr_jobs,
        on_delete=models.CASCADE
    )

    field_name = models.CharField(
        max_length=50,
    )
    raw_text = models.TextField(
    )
    confidence_score = models.FloatField(
    )

    def __str__(self):
        return f"{self.field_name}: {self.field_value}"
