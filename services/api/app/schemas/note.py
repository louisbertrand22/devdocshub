from pydantic import Field, BaseModel
from typing import Optional
from uuid import UUID


class NoteCreate(BaseModel):
    doc_id: UUID = Field(..., description="UUID du document")
    user_id: UUID = Field(..., description="UUID de l'utilisateur")
    content: str = Field(..., min_length=1, description="Contenu de la note")

class NoteUpdate(BaseModel):
    content: str = Field(..., min_length=1)

class NoteOut(BaseModel):
    id: UUID
    doc_id: UUID
    user_id: UUID
    content: str
    created_at: Optional[str]

    model_config = {"from_attributes": True}