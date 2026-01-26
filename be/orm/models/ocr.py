from django.db import models
from django.utils import timezone
from orm.models.documents import Documents

class ocr_jobs(models.Model):

    class ocr_status(models.TextChoices):
        QUEUED = 'QUEUED', 'Đang chờ'
        PROCESSING = 'PROCESSING', 'Đang xử lý'
        DONE = 'DONE', 'Hoàn thành'
        FAILED = 'FAILED', 'Thất bại'

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
    
    class Meta:
        app_label = 'orm'
        db_table = 'orm_ocr_jobs'

    def __str__(self):
        return str(self.id)

class ocr_results(models.Model):

    id = models.AutoField(
        primary_key=True
    )
    ocr_job = models.ForeignKey(
        ocr_jobs,
        on_delete=models.CASCADE
    )

    field_name = models.CharField(
        max_length=255,
    )
    raw_text = models.TextField(
    )
    confidence = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        null=True,
        blank=True
    )
    bounding_box = models.TextField(
        null=True,
        blank=True
    )
    
    class Meta:
        app_label = 'orm'
        db_table = 'orm_ocr_results'

    def __str__(self):
        return f"{self.field_name}: {self.raw_text}"
