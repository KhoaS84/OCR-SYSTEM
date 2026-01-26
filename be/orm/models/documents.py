from django.db import models
from django.utils import timezone
from orm.models.citizens import Citizens

class Documents(models.Model):

    class DocumentsType(models.TextChoices):
        CCCD = 'CCCD', 'CCCD'
        GPLX = 'GPLX', 'GPLX'
        BHYT = 'BHYT', 'BHYT'

    class DocumentStatus(models.TextChoices):
        PENDING = 'PENDING', 'Chờ xử lý'
        VERIFIED = 'VERIFIED', 'Đã xác minh'

    id = models.AutoField(
        primary_key=True
    )
    citizen = models.ForeignKey(
        Citizens,
        on_delete=models.CASCADE
    )

    type = models.CharField(
        max_length=50,
        choices=DocumentsType.choices,
        verbose_name="Loại giấy tờ"
    )
    status = models.CharField(
        max_length=20,
        choices=DocumentStatus.choices,
        verbose_name="Trạng thái"
    )

    issue_date = models.DateField(
        verbose_name="Ngày cấp",
        null=True,
        blank=True
    )
    expire_date = models.DateField(
        verbose_name="Ngày hết hạn",
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        default=timezone.now,
        auto_now_add=True,
    )

    def __str__(self):
        return str(self.id)

# CCCD & BHYT
class CCCD(models.Model):

    document = models.OneToOneField(
        Documents,
        primary_key=True,
        on_delete=models.CASCADE
    )
    so_cccd = models.CharField(
        max_length=12,
        verbose_name="Số CCCD",
        unique=True,
    )
    origin_place = models.CharField(
        max_length=255,
        verbose_name="Quê quán",
    )
    current_place = models.CharField(
        max_length=255,
        verbose_name="Nơi thường trú",
    )

    def __str__(self):
        return self.so_cccd

class BHYT(models.Model):
    document = models.OneToOneField(
        Documents,
        primary_key=True,
        on_delete=models.CASCADE
    )
    so_bhyt = models.CharField(
        max_length=15,
        verbose_name="Số thẻ BHYT",
        unique=True,
    )
    hospital_code = models.CharField(
        max_length=100,
        verbose_name="Mã nơi đăng ký KCB",
    )
    insurance_area = models.CharField(
        max_length=255,
        verbose_name="Khu vực bảo hiểm",
    )

    def __str__(self):
        return self.so_bhyt

class GPLX(models.Model):
    """Giấy phép lái xe"""
    document = models.OneToOneField(
        Documents,
        primary_key=True,
        on_delete=models.CASCADE
    )
    so_gplx = models.CharField(
        max_length=20,
        verbose_name="Số GPLX",
        unique=True,
    )
    hang_gplx = models.CharField(
        max_length=50,
        verbose_name="Hạng GPLX",
        null=True,
        blank=True
    )
    noi_cap = models.CharField(
        max_length=255,
        verbose_name="Nơi cấp",
        null=True,
        blank=True
    )

    def __str__(self):
        return self.so_gplx
    
# Document images
class DocumentImages(models.Model):

    class SideChoices(models.TextChoices):
        FRONT = 'front', 'Mặt trước'
        BACK = 'back', 'Mặt sau'
    
    id = models.AutoField(
        primary_key=True
    )
    document = models.ForeignKey(
        Documents,
        on_delete=models.CASCADE
    )

    image_path = models.URLField(
        max_length=500,
        verbose_name="Đường dẫn hình ảnh",
    )
    side = models.CharField(
        max_length=10,
        choices=SideChoices.choices,
        verbose_name="Mặt giấy tờ",
    )
    uploaded_at = models.DateTimeField(
        default=timezone.now,
        auto_now_add=True,
    )

    def __str__(self):
        return str(self.id)
