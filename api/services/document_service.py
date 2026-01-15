from orm.models import Citizen, Document, DocumentImage
from api.utils.file import save_image
from django.db import transaction
import uuid

@transaction.atomic
def create_cccd(user, front, back):
    citizen, _ = Citizen.objects.get_or_create(user_id=user.id)

    document = Document.objects.create(
        citizen=citizen,
        type="CCCD",
        status="PENDING"
    )

    front_path = save_image(front, document.id, "front")
    back_path = save_image(back, document.id, "back")

    DocumentImage.object.bulk_create([
        DocumentImage(document=document, image_path=front_path, side="FRONT"),
        DocumentImage(document=document, image_path=back_path, side="BACK")
    ])

    return {
        "document_id": document.id,
        "status": document.status
    }