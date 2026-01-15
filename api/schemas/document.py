from pydantic import BaseModel
from uuid import UUID

class DocumentResponse(BaseModel):
    document_id: UUID
    status: str